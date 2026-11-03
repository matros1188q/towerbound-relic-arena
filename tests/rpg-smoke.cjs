'use strict';
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const root=process.cwd();
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent((req.url||'/').split('?')[0]);
  const relative=pathname==='/'?'index.html':pathname.replace(/^\/+/,'');
  const file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)&&file!==path.join(root,'index.html')){res.writeHead(403).end();return;}
  const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml'};
  fs.readFile(file,(error,data)=>{
   if(error){res.writeHead(404).end('not found');return;}
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);
  });
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>!!window.TowerboundReworkReady);
  await page.waitForSelector('#tbRpg .tb-v2');
  await page.evaluate(()=>{document.querySelector('#titleScreen')?.classList.add('is-hidden');document.querySelector('#accountDialog')?.classList.remove('open');document.body.removeAttribute('data-tb-screen');});
  await page.waitForSelector('#tbRpg .tb-v2');
  assert.equal(await page.locator('.tb-character-card').count(),0,'new account starts with an empty character roster');
  await page.locator('[data-action="new"]').first().click();
  assert.equal(await page.locator('[data-class]').count(),7,'all seven classes are shown');
  await page.locator('[data-class="assassin"]').click();
  await page.locator('#name').fill('RPG QA');
  await page.locator('[data-action="confirm-create"]').click();
  assert.match(await page.locator('#tbRpg').innerText(),/RPG QA/,'created character appears in roster');
  const first=await page.evaluate(()=>JSON.parse(localStorage.getItem('tb-rpg-v2')));
  assert.equal(first.characters.length,1);
  assert.equal(first.characters[0].silver,300);
  assert.equal(first.characters[0].bag.find(x=>x.type==='healing_potion').quantity,3);
  assert.ok(first.account.premiumUntil>Date.now());
  await page.reload({waitUntil:'networkidle'});
  await page.waitForSelector('#tbRpg .tb-v2');
  assert.match(await page.locator('#tbRpg').innerText(),/RPG QA/,'saved roster survives refresh');
  await page.evaluate(()=>{
   const engine=window.TowerboundRework,c=engine.state.characters[0];
   c.xp=200000;c.level=10;c.talentPoints=9;c.silver=50000;
   c.progress.highestEver=1;c.progress.currentStage=2;
   c.bag.push({id:'qa-weapon',name:'QA Blade',slot:'weapon',rarity:'Эпическая',stats:{attack:10,defense:2,health:10},refine:0,sockets:[],socketsAvailable:0});
   c.bag.push({id:'qa-refine',type:'refine_stone'});
   localStorage.setItem('tb-rpg-v2',JSON.stringify(engine.state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.waitForSelector('#tbRpg .tb-v2');
  await page.locator('[data-action="play"]').click();
  assert.equal(await page.locator('.tb-map-node').count(),250,'all 250 map stages render');
  await page.locator('.tb-map-actions [data-action="profile"]').click();
  await page.locator('[data-branch="bleed"]').click();
  await page.locator('[data-tab="talents"]').click();
  await page.locator('[data-talent="bleed.talent.1"]').click();
  assert.match(await page.locator('.tb-talent').first().innerText(),/1\/3/,'branch talent point is applied');
  await page.locator('[data-tab="gear"]').click();
  await page.locator('[data-equip="qa-weapon"]').click();
  assert.match(await page.locator('.tb-gear-slot').first().innerText(),/QA Blade/,'inventory equipment can be equipped');
  await page.locator('[data-refine="qa-weapon"]').click();
  assert.match(await page.locator('.tb-gear-slot').first().innerText(),/\+1/,'refinement consumes a refine stone');
  await page.locator('[data-action="map"]').click();
  await page.locator('[data-action="shop"]').click();
  await page.locator('[data-shop-tab="silver"]').click();
  assert.match(await page.locator('#tbRpg').innerText(),/Компас картографа/,'silver extras are visible');
  await page.locator('[data-shop-tab="diamond"]').click();
  assert.match(await page.locator('#tbRpg').innerText(),/Жетон удачи/,'diamond extras are visible');
  assert.match(await page.locator('#tbRpg').innerText(),/5000 алмазов/,'diamond packs are displayed');
  await page.locator('[data-action="map"]').click();
  await page.locator('[data-stage="1"]').click();
  await page.locator('[data-action="start"]').click();
  assert.equal(await page.locator('#speed').isDisabled(),false,'2x is available on a previously cleared floor');
  await page.locator('#speed').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('tb-rpg-speed-v2')),'2','speed preference persists');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].run.speed2),true,'2x toggle is reflected in runtime state');
  assert.deepEqual(errors,[],'browser runtime must not throw uncaught errors');
  console.log('Browser smoke passed: character creation and persistence, seven classes, 250-stage map, branch/talent, equipment/refine, shop, combat and persisted 2x speed.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exit(1);});
