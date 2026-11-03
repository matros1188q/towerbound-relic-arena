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
 page.on('requestfailed',request=>{const url=request.url();if(!url.includes('fonts.googleapis.com')&&!url.includes('fonts.gstatic.com')&&!url.includes('cdn.jsdelivr.net'))failed.push(url+': '+request.failure()?.errorText);});
 await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
 await page.route('https://fonts.googleapis.com/**',route=>route.abort());
 await page.route('https://fonts.gstatic.com/**',route=>route.abort());
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.TowerboundReworkReady&&!!window.TowerboundRework,{timeout:20000});
  await page.waitForSelector('#tbRpg .tb-v2',{timeout:15000});
  await page.evaluate(()=>{localStorage.clear();document.querySelector('#titleScreen')?.classList.add('is-hidden');document.querySelector('#accountDialog')?.classList.remove('open');});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.TowerboundReworkReady&&!!window.TowerboundRework);
  await page.waitForSelector('#tbRpg .tb-v2');
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
  const diagnostics=await page.evaluate(()=>({
   width:document.documentElement.clientWidth,
   scrollWidth:document.documentElement.scrollWidth,
   mapNodes:document.querySelectorAll('.tb-map-node').length,
   classButtons:document.querySelectorAll('[data-class]').length,
   ready:!!window.TowerboundRework,
   mapVisible:!!document.querySelector('.tb-map-node')
  }));
  assert.equal(diagnostics.ready,true,name+' runtime initializes');
  assert.equal(diagnostics.mapNodes,250,name+' renders all 250 stages');
  assert.ok(diagnostics.scrollWidth<=diagnostics.width+1,name+' has no horizontal page overflow at '+viewport.width+'px');
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
  }
  process.stdout.write('All six RPG browser journeys passed. WebKit mobile viewport emulation is not a physical iPhone Safari certification.\n');
 }catch(error){process.stderr.write((error&&error.stack)||String(error));process.exitCode=1;}
 finally{server.close();}
})();
