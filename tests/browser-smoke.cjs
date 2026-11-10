'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium,firefox,webkit}=require('playwright');
const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json; charset=utf-8','.woff2':'font/woff2'};
function startServer(){
 const server=http.createServer((req,res)=>{
  try{
   const url=new URL(req.url,'http://127.0.0.1');
   const relative=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
   const file=path.resolve(root,relative);
   if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end('Forbidden');return;}
   fs.readFile(file,(error,data)=>{
    if(error){res.writeHead(404).end('Not found');return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);
   });
  }catch{res.writeHead(400).end('Bad request');}
 });
 return new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(server)));
}
async function journey(type,name,viewport,url){
 const browser=await type.launch({headless:true});
 const context=await browser.newContext({viewport,colorScheme:'dark',reducedMotion:'reduce',isMobile:viewport.width<500,hasTouch:viewport.width<500});
 const page=await context.newPage(),errors=[],failed=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('requestfailed',request=>{const url=request.url(),reason=request.failure()?.errorText;if(reason!=='net::ERR_ABORTED'&&!url.includes('fonts.googleapis.com')&&!url.includes('fonts.gstatic.com')&&!url.includes('cdn.jsdelivr.net'))failed.push(url+': '+reason);});
 await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
 await page.route('https://fonts.googleapis.com/**',route=>route.abort());
 await page.route('https://fonts.gstatic.com/**',route=>route.abort());
  await page.addInitScript(()=>{
   window.supabase={createClient:()=>{let listener=null;const readSession=()=>{try{return JSON.parse(localStorage.getItem('__tb_qa_auth_session')||'null');}catch(e){return null;}};
    return{auth:{onAuthStateChange:cb=>{listener=cb;},getSession:async()=>({data:{session:readSession()},error:null}),
     signInWithPassword:async({email,password})=>{window.__tbLastAuth={email,password};const session={user:{id:'qa-user',email}};localStorage.setItem('__tb_qa_auth_session',JSON.stringify(session));if(listener)listener('SIGNED_IN',session);return{data:{session},error:null};},
     signUp:async({email,password})=>{window.__tbLastAuth={email,password};const session={user:{id:'qa-user',email}};localStorage.setItem('__tb_qa_auth_session',JSON.stringify(session));if(listener)listener('SIGNED_IN',session);return{data:{session},error:null};},
     signOut:async()=>{localStorage.removeItem('__tb_qa_auth_session');if(listener)listener('SIGNED_OUT',null);return{error:null};}},
     from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:null,error:null})})})}),
     rpc:async()=>({data:{revision:1},error:null})};
   }};
  });
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.TowerboundReworkReady&&!!window.TowerboundRework,{timeout:20000});
  await page.waitForSelector('#tbRpg .tb-v2',{timeout:15000});
  await page.evaluate(()=>{localStorage.clear();document.querySelector('#titleScreen')?.classList.add('is-hidden');document.querySelector('#accountDialog')?.classList.remove('open');});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.TowerboundReworkReady&&!!window.TowerboundRework);
  await page.waitForSelector('#tbRpg .tb-login-gate');
  assert.equal(await page.locator('.tb-login-gate h2').innerText(),'Вход в игру',name+' starts with centered login gate');
  await page.locator('#login').fill('BrowserQA');
  await page.locator('#pass').fill('qa-password');
  await page.locator('[data-action="empty-login"]').click();
  await page.waitForFunction(()=>window.TowerboundCloud?.signedIn);
  await page.waitForSelector('[data-action="new"]');
  assert.equal(await page.locator('.tb-header .tb-account-button').count(),0,name+' has no redundant account button');
  const brandLayout=await page.locator('.tb-brand strong').evaluate(el=>({height:el.getBoundingClientRect().height,lineHeight:parseFloat(getComputedStyle(el).lineHeight),whiteSpace:getComputedStyle(el).whiteSpace}));
  assert.equal(brandLayout.whiteSpace,'nowrap',name+' TOWERBOUND logo uses nowrap');
  assert.ok(brandLayout.height<=brandLayout.lineHeight+1,name+' TOWERBOUND logo stays on one line');
  await page.locator('[data-action="new"]').first().click();
  assert.equal(await page.locator('[data-class]').count(),7,name+' displays seven playable classes');
  await page.locator('[data-class="assassin"]').click();
  await page.locator('#name').fill('Cross QA');
  await page.locator('[data-action="confirm-create"]').click();
  await page.waitForFunction(()=>window.TowerboundRework?.state.characters.length===1);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('tb-rpg-v2')).characters.length),1,name+' persists the new character');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('#tbRpg .tb-v2');
  assert.match(await page.locator('#tbRpg').innerText(),/Cross QA/,name+' restores the saved character after reload');
  await page.locator('[data-action="play"]').click();
  await page.waitForFunction(()=>document.querySelectorAll('.tb-map-node').length===250,{timeout:15000});
  const mapNodeCount=await page.locator('.tb-map-node').count();
  assert.equal(mapNodeCount,250,name+' renders all 250 stages before combat');
  const mapLayout=await page.evaluate(()=>{
   const toolbar=document.querySelector('.tb-stage-toolbar'),grid=document.querySelector('.tb-map-layout'),nav=document.querySelector('.tb-bottom-nav');
   return {toolbarBeforeGrid:!!toolbar&&!!grid&&!!(toolbar.compareDocumentPosition(grid)&Node.DOCUMENT_POSITION_FOLLOWING),
    navButtons:nav?.querySelectorAll('button').length||0,navZ:Number(getComputedStyle(nav||document.body).zIndex),
    navPointer:getComputedStyle(nav||document.body).pointerEvents,width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth};
  });
  assert.equal(mapLayout.toolbarBeforeGrid,true,name+' places the compact selected-stage panel before the map grid');
  assert.equal(mapLayout.navButtons,4,name+' exposes exactly four primary bottom navigation tabs');
  assert.equal(mapLayout.navPointer,'auto',name+' keeps bottom navigation clickable');
  await page.locator('[data-action="bottom-profile"]').click();
  assert.equal(await page.locator('.tb-tabs button').count(),7,name+' groups character features into one compact subnavigation');
  await page.locator('[data-tab="gear"]').click();
  assert.ok(await page.locator('.tb-gear-slot.is-empty').count()>=1,name+' renders named empty equipment slots');
  const emptySlot=await page.locator('.tb-gear-slot.is-empty').first().evaluate(el=>({label:el.querySelector('small')?.textContent,height:el.getBoundingClientRect().height}));
  assert.ok(emptySlot.label&&!/слот\\s*\\d/i.test(emptySlot.label),name+' names the equipment slot by item type');
  assert.ok(emptySlot.height<=80,name+' keeps empty equipment slots compact');
  await page.locator('[data-action="bottom-map"]').click();
  await page.waitForSelector('.tb-stage-toolbar');
  await page.locator('[data-action="start"]').click();
  await page.waitForSelector('[data-action="end-turn"]',{timeout:10000});
  assert.equal(await page.locator('[data-action="end-turn"]').count(),1,name+' renders one End Turn button');
  // First-run tutorial is an intentional modal: dismiss it before testing combat input.
  if(await page.locator('[data-action="dismiss-turn-tutorial"]').count()){
   const tutorial=await page.locator('.tb-turn-tutorial-card').evaluate(el=>{const r=el.getBoundingClientRect(),b=el.querySelector('[data-action="dismiss-turn-tutorial"]').getBoundingClientRect();return{bottom:r.bottom,buttonBottom:b.bottom,viewport:innerHeight};});
   assert.ok(tutorial.bottom<=tutorial.viewport+1&&tutorial.buttonBottom<=tutorial.viewport+1,name+' tutorial and CTA fit inside the viewport');
   await page.locator('[data-action="dismiss-turn-tutorial"]').click();
  }
  assert.equal(await page.locator('.tb-basic-attack').count(),1,name+' renders the free basic attack control');
  await page.locator('[data-action="end-turn"]').click();
  await page.waitForFunction(()=>Number(document.querySelector('.tb-arena-top')?.innerText.match(/РАУНД\s+(\d+)/)?.[1]||0)>=2,{timeout:10000});
  fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
  await page.screenshot({path:path.join(root,'artifacts','turn-based-end-turn-'+name.toLowerCase()+'-'+viewport.width+'.png'),fullPage:true});
  const diagnostics=await page.evaluate(()=>({
   width:document.documentElement.clientWidth,
   scrollWidth:document.documentElement.scrollWidth,
   classButtons:document.querySelectorAll('[data-class]').length,
   ready:!!window.TowerboundRework,
   mapVisible:!!document.querySelector('.tb-map-node')
  }));
  assert.equal(diagnostics.ready,true,name+' runtime initializes');
  assert.ok(diagnostics.scrollWidth<=diagnostics.width+1,name+' has no horizontal page overflow at '+viewport.width+'px');
  // Reproduce a persisted dead-target state, then reload and resume the same stage.
  await page.evaluate(()=>{
   const engine=window.TowerboundRework,character=engine.state.characters[0],stage=character.run.stage,snapshot=stage.uiBattleSnapshot;
   if(!snapshot||!Array.isArray(snapshot.enemies)||snapshot.enemies.length<2)throw new Error('Combat snapshot was not persisted before reload');
   snapshot.enemies[0].hp=0;snapshot.enemies[0].alive=false;snapshot.enemies[0].dead=true;
   snapshot.targetIndex=0;stage.targetIndex=0;stage.enemyIndex=0;
   localStorage.setItem('tb-rpg-v2',JSON.stringify(engine.state));
   // Prevent the old pagehide autosave from overwriting the deliberately corrupted recovery fixture.
   const nativeSetItem=Storage.prototype.setItem;
   Storage.prototype.setItem=function(key,value){if(key==="tb-rpg-v2")return;return nativeSetItem.call(this,key,value);};
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.TowerboundReworkReady&&!!window.TowerboundRework);
  await page.locator('[data-action="play"]').click();
  await page.locator('[data-action="start"]').click();
  await page.waitForSelector('[data-action="end-turn"]',{timeout:10000});
  const recovered=await page.evaluate(()=>({
   target:document.querySelector('.tb-target-card.selected')?.dataset.target,
   killed:window.TowerboundRework.state.characters[0].run.stage?.killedIndices||[],
   current:window.TowerboundRework.state.characters[0].run.stage?.targetIndex
  }));

  assert.ok(recovered.target&&recovered.target!=='0',name+' reload skips the defeated target and resumes on a living mob');
  assert.ok(recovered.killed.includes(0),name+' reload records the previously defeated mob exactly once');
  assert.equal(Number(recovered.target),recovered.current,name+' UI and persisted target remain synchronized after reload');
  assert.deepEqual(errors,[],name+' has no uncaught browser errors');
  assert.deepEqual(failed,[],name+' has no unexpected failed local/network requests');
  process.stdout.write('PASS '+name+' '+viewport.width+'x'+viewport.height+' — boot → character create → save/reload → 250-stage map\n');
 }finally{await context.close();await browser.close();}
}
(async()=>{
 const server=await startServer(),url='http://127.0.0.1:'+server.address().port+'/';
 try{
  for(const [name,type] of [['Chromium',chromium],['Firefox',firefox],['WebKit',webkit]]){
   await journey(type,name,{width:1280,height:900},url);
   await journey(type,name,{width:390,height:844},url);
   await journey(type,name,{width:430,height:932},url);
  }
  process.stdout.write('All nine RPG browser journeys passed. WebKit mobile viewport emulation is not a physical iPhone Safari certification.\n');
 }catch(error){process.stderr.write((error&&error.stack)||String(error));process.exitCode=1;}
 finally{server.close();}
})();
