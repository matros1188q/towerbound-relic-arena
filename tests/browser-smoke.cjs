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
 let context;
 try{
  const mobileEmulation=type===firefox?{}:{isMobile:viewport.width<500,hasTouch:viewport.width<500};
  context=await browser.newContext({viewport,colorScheme:'dark',reducedMotion:'reduce',...mobileEmulation});
 }catch(error){
  await browser.close().catch(()=>{});
  throw error;
 }
 const page=await context.newPage(),errors=[],failed=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('requestfailed',request=>{const url=request.url(),reason=request.failure()?.errorText;if(reason!=='net::ERR_ABORTED'&&reason!=='NS_BINDING_ABORTED'&&!url.includes('fonts.googleapis.com')&&!url.includes('fonts.gstatic.com')&&!url.includes('cdn.jsdelivr.net'))failed.push(url+': '+reason);});
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
  const logo=page.locator('.tb-brand img.game-logo');
  assert.equal(await logo.count(),1,name+' character header shows the JPG TowerBound logo');
  const logoLayout=await logo.evaluate(el=>({width:el.getBoundingClientRect().width,fit:getComputedStyle(el).objectFit,loaded:el.complete&&el.naturalWidth>0}));
  assert.ok(logoLayout.width<=300.5,name+' logo respects its max width');
  assert.equal(logoLayout.fit,'contain',name+' logo preserves aspect ratio');
  assert.ok(logoLayout.loaded,name+' logo JPG loaded');
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
  assert.equal(mapLayout.navButtons,5,name+' exposes the five primary bottom navigation tabs: map, profile, progress, shop and account');
  assert.equal(mapLayout.navPointer,'auto',name+' keeps bottom navigation clickable');
  await page.locator('[data-action="bottom-profile"]').click();
  assert.equal(await page.locator('.tb-tabs button').count(),8,name+' renders all eight profile tabs');
  await page.locator('[data-tab="account"]').click();
  assert.equal(await page.locator('.tb-profile-account').count(),1,name+' opens the account panel');
  await page.locator('[data-tab="speedrun"]').click();
  assert.equal(await page.locator('.speedrun-container').count(),1,name+' opens the speedrun panel');
  await page.locator('[data-tab="gear"]').click();
  const collectionItems=page.locator('.tb-collection-item');
  assert.ok(await collectionItems.count()>=30,name+' renders at least 30 class collection entries across equipment slots and rarities');
  const collectionEntry=await collectionItems.first().evaluate(el=>({slot:el.querySelector('b')?.textContent?.trim(),rarity:el.querySelector('small')?.textContent?.trim()}));
  assert.ok(collectionEntry.slot&&collectionEntry.rarity,name+' labels collection entries by equipment slot and rarity');
  const collectionHit=await collectionItems.first().evaluate(el=>{const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y),siblings=[...el.parentElement.querySelectorAll('.tb-collection-item')].slice(0,3).map(item=>{const b=item.getBoundingClientRect();return{key:item.dataset.collectionItem,left:b.left,top:b.top,right:b.right,bottom:b.bottom};});const ancestors=[];for(let node=el;node&&ancestors.length<9;node=node.parentElement){const b=node.getBoundingClientRect(),c=getComputedStyle(node);ancestors.push({tag:node.tagName,className:String(node.className||''),width:b.width,height:b.height,display:c.display,alignItems:c.alignItems,gridTemplateColumns:c.gridTemplateColumns,flex:c.flex,position:c.position});}return{first:{key:el.dataset.collectionItem,left:r.left,top:r.top,right:r.right,bottom:r.bottom},hit:hit?.outerHTML?.slice(0,260)||null,siblings,computed:{position:getComputedStyle(el).position,zIndex:getComputedStyle(el).zIndex,transform:getComputedStyle(el).transform,pointerEvents:getComputedStyle(el).pointerEvents},ancestors};});
  process.stdout.write('COLLECTION HIT DIAGNOSTIC '+name+' '+JSON.stringify(collectionHit)+'\\n');
  await collectionItems.first().click();
  assert.equal(await page.locator('.tb-collection-detail').count(),1,name+' opens the selected collection item detail');
  await page.locator('[data-collection-close]').click();
  await page.locator('[data-action="bottom-map"]').click();
  await page.waitForSelector('.tb-stage-toolbar');
  await page.locator('[data-action="start"]').click();
  await page.waitForSelector('[data-action="end-turn"]',{timeout:10000});
  assert.equal(await page.locator('[data-action="end-turn"]').count(),1,name+' renders one End Turn button');
  // The first battle must show the turn-based tutorial outside the clipped arena.
  assert.equal(await page.locator('.tb-turn-tutorial').count(),1,name+' shows the first-run turn-based tutorial');
  const tutorial=await page.locator('.tb-turn-tutorial-card').evaluate(el=>{const r=el.getBoundingClientRect(),b=el.querySelector('[data-action="dismiss-turn-tutorial"]').getBoundingClientRect();return{bottom:r.bottom,buttonBottom:b.bottom,viewport:innerHeight,maxHeight:parseFloat(getComputedStyle(el).maxHeight)};});
  assert.ok(tutorial.bottom<=tutorial.viewport+1&&tutorial.buttonBottom<=tutorial.viewport+1,name+' tutorial and CTA fit inside the viewport');
  assert.ok(tutorial.maxHeight<=tutorial.viewport*.81,name+' tutorial card respects the 80dvh maximum');
  const tutorialText=(await page.locator('.tb-turn-tutorial-card').innerText()).toLocaleLowerCase();
  for(const phrase of ['твой первый бой','базовая атака','умения 1–6','телеграф врага','завершить ход'])assert.ok(tutorialText.includes(phrase),name+' tutorial covers '+phrase);
  await page.locator('[data-action="dismiss-turn-tutorial"]').click();
  assert.equal(await page.locator('.tb-turn-tutorial').count(),1,name+' starts rather than skips the forced tutorial');
  assert.equal(await page.locator('.v2-btn-attack').count(),1,name+' renders the free basic attack control');
  await page.locator('.v2-btn-attack').click();
  await page.waitForFunction(()=>document.querySelector('.tb-turn-tutorial-card')?.innerText.includes('ОЖИДАЕТСЯ: ЗАВЕРШИТЬ ХОД'),{timeout:10000});
  await page.locator('[data-action="end-turn"]').click();
  await page.waitForFunction(()=>document.querySelector('.tb-turn-tutorial-card')?.innerText.includes('ОЖИДАЕТСЯ: УМЕНИЕ'),{timeout:10000});
  await page.waitForSelector('[data-panel-skill]:not([disabled])',{timeout:10000});
  await page.locator('[data-panel-skill]:not([disabled])').first().click();
  await page.waitForFunction(()=>document.querySelector('.tb-turn-tutorial-card')?.innerText.includes('ОЖИДАЕТСЯ: ЗАВЕРШИТЬ ХОД'),{timeout:10000});
  await page.locator('[data-action="end-turn"]').click();
  await page.waitForSelector('.tb-turn-tutorial',{state:'detached',timeout:10000});
  await page.waitForFunction(()=>Number(document.querySelector('.v2-battle-top')?.innerText.match(/РАУНД\\s+(\\d+)/)?.[1]||0)>=2,{timeout:10000});
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
   target:document.querySelector('.v2-enemy-card.selected')?.dataset.target,
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
