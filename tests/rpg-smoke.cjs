'use strict';
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const root=process.cwd();
 const screenshots=path.join(root,'artifacts');fs.mkdirSync(screenshots,{recursive:true});
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
   c.xp=200000;c.level=10;c.talentPoints=9;c.branch='bleed';c.silver=50000;
   c.progress.highestEver=1;c.progress.currentStage=2;
   c.bag.push({id:'qa-weapon',name:'QA Blade',slot:'weapon',rarity:'Эпическая',stats:{attack:10,defense:2,health:10},refine:0,sockets:[],socketsAvailable:0});
   c.bag.push({id:'qa-refine',type:'refine_stone'});
   c.bag.push({id:'qa-salvage',name:'QA Salvage Armor',slot:'chest',rarity:'Эпическая',itemLevel:120,stats:{attack:0,defense:10,health:25},refine:0,sockets:[],socketsAvailable:0});
   c.bag.push({id:'qa-craft',type:'craft_material',quantity:10});
   localStorage.setItem('tb-rpg-v2',JSON.stringify(engine.state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.waitForSelector('#tbRpg .tb-v2');
  await page.locator('[data-action="play"]').click();
  assert.equal(await page.locator('.tb-map-node').count(),250,'all 250 map stages render');
  const mobileMap=await page.evaluate(()=>{
   const grid=document.querySelector('.tb-map-grid'),scroller=document.querySelector('.tb-map-scroll'),nodes=[15,20,25].map(n=>document.querySelector('[data-stage="'+n+'"]'));
   return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,gridWidth:grid?.clientWidth,gridScrollWidth:grid?.scrollWidth,scrollerWidth:scroller?.clientWidth,scrollerScrollWidth:scroller?.scrollWidth,nodeRight:nodes.map(n=>n?.getBoundingClientRect().right),gridRight:grid?.getBoundingClientRect().right};
  });
  assert.ok(mobileMap.documentWidth<=390,'mobile map has no horizontal page overflow');
  assert.ok(mobileMap.gridScrollWidth<=mobileMap.gridWidth+1,'five-column map grid fits its container');
  assert.ok(mobileMap.scrollerScrollWidth<=mobileMap.scrollerWidth+1,'map scroller has no horizontal overflow');
  assert.ok(mobileMap.nodeRight.every(right=>right<=mobileMap.gridRight+1),'map nodes 15, 20 and 25 stay inside the grid');
  assert.equal(await page.locator('.tb-mobile-menu').count(),1,'mobile navigation uses one compact menu');
  await page.locator('.tb-mobile-menu>summary').click();
  assert.equal(await page.locator('.tb-mobile-menu-list button').count(),4,'all navigation actions are available in the menu');
  await page.screenshot({path:path.join(screenshots,'mobile-map-after.png'),fullPage:true});
  await page.locator('.tb-mobile-menu>summary').click();
  await page.locator('[data-run-modifier]').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(screenshots,'2000h-run-modifiers.png'),fullPage:true});
  await page.locator('[data-run-modifier]').first().click();
  await page.evaluate(()=>{window.TowerboundRework.state.account.diamonds=50;window.saveTowerboundRework();});
  await page.locator('.tb-header-side [data-action="profile"]').click();
  await page.locator('[data-branch="bleed"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].branch),'bleed','specialization selection persists');
  await page.evaluate(()=>{
   const c=window.TowerboundRework.state.characters[0];
   if(!c.bag.some(item=>item.id==='qa-weapon'))c.bag.push({id:'qa-weapon',name:'QA Blade',slot:'weapon',rarity:'Эпическая',stats:{attack:10,defense:2,health:10},refine:0,sockets:[],socketsAvailable:0});
   localStorage.setItem('tb-rpg-v2',JSON.stringify(window.TowerboundRework.state));
  });
  await page.evaluate(()=>{
   const engine=window.TowerboundRework,c=engine.state.characters[0],stone=engine.balance.equipment.stone_types.find(x=>x.class_id===c.classId&&x.branch_id===c.branch);
   for(let i=0;i<5;i++)c.bag.push({id:'qa-synth-'+i,type:'enhancement_stone',stoneType:JSON.parse(JSON.stringify(stone)),level:4});
   localStorage.setItem('tb-rpg-v2',JSON.stringify(engine.state));
  });
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="bag"]').click();
  await page.waitForSelector('[data-equip="qa-weapon"]');
  await page.locator('[data-merge="qa-synth-0"]').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(screenshots,'2000h-stone-synthesis.png'),fullPage:true});
  await page.locator('[data-equip="qa-weapon"]').click();
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="talents"]').click();
  await page.locator('[data-talent="bleed.talent.1"]').click();
  assert.match(await page.locator('.tb-talent').first().innerText(),/1\/3/,'branch talent point is applied');
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="gear"]').click();
  assert.equal(await page.locator('.tb-gear-slot').count(),6,'six equipment slots render');
  assert.match(await page.locator('.tb-gear-slot.is-empty').first().innerText(),/Слот \d+: (Шлем|Нагрудник|Оружие|Поножи|Перчатки|Аксессуар)/,'empty equipment slots show Russian slot types');
  assert.equal(await page.locator('.tb-gear-slot.rarity-epic').count(),1,'epic item receives the purple rarity class');
  assert.doesNotMatch(await page.locator('.tb-gear-grid').innerText(),/\b(head|chest|weapon|legs|hands|accessory)\b/i,'equipment slot labels are fully localized');
  await page.screenshot({path:path.join(screenshots,'mobile-equipment-after.png'),fullPage:true});
  const gearLayout=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,emptyHeights:[...document.querySelectorAll('.tb-gear-slot.is-empty')].map(x=>x.getBoundingClientRect().height),filledHeights:[...document.querySelectorAll('.tb-gear-slot.is-equipped')].map(x=>x.getBoundingClientRect().height)}));
  assert.ok(gearLayout.width<=gearLayout.viewport+1,'equipment screen has no horizontal overflow');
  assert.ok(gearLayout.emptyHeights.every(height=>height<gearLayout.filledHeights[0]),'empty slots remain compact compared with equipped cards');
  assert.match(await page.locator('.tb-gear-slot').first().innerText(),/QA Blade/,'inventory equipment can be equipped');
  await page.locator('[data-refine="qa-weapon"]').click();
  assert.match(await page.locator('.tb-gear-slot').first().innerText(),/\+1/,'refinement consumes a refine stone');
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="bag"]').click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('[data-salvage="qa-salvage"]').click();
  await page.waitForFunction(()=>window.TowerboundRework.state.characters[0].bag.some(item=>item.type==='craft_material'&&item.quantity>=20));
  await page.locator('[data-craft-stone="1"]').first().click();
  assert.ok(await page.evaluate(()=>window.TowerboundRework.state.characters[0].bag.some(item=>item.type==='enhancement_stone'&&item.stoneType.branch_id==='bleed')),'20 materials craft a specialization stone');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].stats.items_salvaged),1,'salvaging equipment increments achievement progress');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].stats.materials_crafted),1,'crafted stone increments achievement progress');
  await page.locator('[data-action="map"]').click();
  await page.locator('[data-action="shop"]').click();
  await page.locator('[data-shop-tab="silver"]').click();
  assert.match(await page.locator('#tbRpg').innerText(),/Компас картографа/i,'silver extras are visible');
  await page.locator('[data-shop-tab="diamond"]').click();
  assert.match(await page.locator('#tbRpg').innerText(),/Жетон удачи/i,'diamond extras are visible');
  assert.match(await page.locator('#tbRpg').innerText(),/5000 алмазов/,'diamond packs are displayed');
  await page.locator('[data-action="map"]').click();
  await page.locator('[data-action="systems"]').click();
  await page.waitForSelector('.tb-systems');
  assert.match(await page.locator('.tb-systems').innerText(),/Достижения · 0\/30/,'account systems screen displays achievement catalogue');
  assert.equal(await page.locator('[data-setting="volume_master"]').count(),1,'master volume setting is available');
  await page.locator('[data-setting="autoSalvage"]').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(screenshots,'2000h-autosalvage-settings.png'),fullPage:true});
  await page.locator('[data-setting="autoSalvage"]').check();
  await page.locator('[data-setting="autoSalvageBelow"]').fill('40');
  await page.locator('[data-setting="clean_ui"]').check();
  assert.equal(await page.evaluate(()=>document.body.classList.contains('tb-clean-ui')),true,'clean UI setting activates its stylesheet');
  await page.locator('[data-setting="clean_ui"]').uncheck();
  await page.locator('[data-setting="volume_master"]').fill('0.5');
  await page.locator('[data-action="tutorial-next"]').click();
  assert.match(await page.locator('.tb-systems').innerText(),/Туториал · 1\/6/,'tutorial step persists');
  await page.locator('[data-action="pvp-match"]').click();
  await page.locator('[data-action="pvp-fight"]').click();
  assert.match(await page.locator('.tb-systems').innerText(),/PvP-арена · [1-9]\d* очков/,'account PvP points update after ghost duel');
  await page.evaluate(()=>{const engine=window.TowerboundRework,c=engine.state.characters[0];c.level=1;c.gear=[null,null,null,null,null,null];c.talents={};c.progress.highestEver=10;c.progress.currentStage=11;engine.setDifficulty(c.id,'easy');window.saveTowerboundRework();});
  await page.locator('.tb-systems .tb-system-top [data-action="map"]').click();
  await page.locator('[data-stage="10"]').click();
  await page.locator('[data-run-modifier]').first().click();
  await page.setViewportSize({width:375,height:812});
  await page.locator('[data-action="start"]').click();
  await page.waitForSelector('.tb-arena',{timeout:5000});
  assert.equal(await page.locator('[data-panel-skill]').count(),4,'four configured attack skills are visible');
  assert.equal(await page.locator('[data-counter]').count(),1,'class counter occupies slot five');
  assert.equal(await page.locator('[data-ultimate]').count(),1,'class ultimate occupies slot six');
  assert.equal(await page.locator('.tb-panel-skill').count(),6,'all six combat buttons are rendered');
  const mobilePanel=await page.locator('.tb-panel-actions').evaluate(el=>({
   display:getComputedStyle(el).display,
   slotsDisplay:getComputedStyle(el.querySelector('.tb-panel-slots')).display,
   columns:getComputedStyle(el.querySelector('.tb-panel-slots')).gridTemplateColumns.split(' ').length,
   rows:getComputedStyle(el.querySelector('.tb-panel-slots')).gridTemplateRows.split(' ').length,
   targetTop:document.querySelector('.tb-target-grid').getBoundingClientRect().top,
   panelTop:el.getBoundingClientRect().top,
   attackHeight:document.querySelector('#hit').getBoundingClientRect().height,
   heroHpTop:document.querySelector('.tb-battle-hero .tb-healthbar').getBoundingClientRect().top,
   heroHpBottom:document.querySelector('.tb-battle-hero .tb-healthbar').getBoundingClientRect().bottom,
   bodyPosition:getComputedStyle(document.body).position,
   bodyOverflow:getComputedStyle(document.body).overflow,
   rootOverflow:getComputedStyle(document.querySelector('#tbRpg .tb-v2')).overflow
  }));
  assert.equal(mobilePanel.display,'grid','mobile combat controls use a fixed grid');
  assert.equal(mobilePanel.slotsDisplay,'grid','skill slots use a grid');
  assert.equal(mobilePanel.columns,3,'skills are arranged three per row');
  assert.equal(mobilePanel.rows,2,'skills occupy two rows');
  assert.ok(mobilePanel.attackHeight<=60,'attack button stays at or below 60px');
  assert.ok(mobilePanel.heroHpTop>=0&&mobilePanel.heroHpBottom<=812,'hero HP bar stays in the viewport');
  assert.equal(mobilePanel.bodyPosition,'fixed','body is fixed while battle is active');
  assert.equal(mobilePanel.bodyOverflow,'hidden','body scrolling is locked during battle');
  assert.equal(mobilePanel.rootOverflow,'hidden','battle root does not scroll');
  assert.ok(mobilePanel.targetTop<mobilePanel.panelTop,'enemy targets stay above the mobile controls');
  const stress=await page.evaluate(()=>{
   const grid=document.querySelector('.tb-target-grid'),cards=[...grid.querySelectorAll('.tb-target-card')];
   for(let i=cards.length;i<7;i++){const clone=cards[0].cloneNode(true);clone.dataset.target=String(100+i);grid.appendChild(clone);}
   return [...grid.querySelectorAll('.tb-target-card')].map(card=>{const r=card.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};});
  });
  assert.equal(stress.length,7,'seven target cards fit the stress-test grid');
  assert.ok(stress.every(r=>r.top>=0&&r.bottom<=812&&r.left>=0&&r.right<=375),'all seven target cards remain inside the mobile viewport');
  await page.evaluate(()=>document.querySelectorAll('.tb-target-card[data-target^="10"]').forEach(card=>card.remove()));
  await page.setViewportSize({width:812,height:375});
  const landscape=await page.evaluate(()=>{
   const arena=document.querySelector('.tb-arena'),grid=document.querySelector('.tb-target-grid'),actions=document.querySelector('.tb-panel-actions'),potions=document.querySelector('.tb-potion-belt');
   return [arena,grid,actions,potions].map(el=>{const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};});
  });
  assert.ok(landscape.every(r=>r.top>=0&&r.bottom<=375&&r.left>=0&&r.right<=812),'arena, enemies, controls and potions fit in landscape');
  await page.setViewportSize({width:375,height:812});
  assert.equal(await page.locator('#speed').isDisabled(),false,'2x is available on a previously cleared floor');
  await page.locator('#speed').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('tb-rpg-speed-v2')),'2','speed preference persists');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].run.speed2),true,'2x toggle is reflected in runtime state');
  await page.locator('[data-target="0"]').click();
  assert.ok(await page.locator('[data-target="0"]').evaluate(el=>el.classList.contains('selected')),'tap selects a live mob');
  await page.evaluate(()=>{window.__tbArenaBeforeAttack=document.querySelector('.tb-arena');window.__tbScrollBeforeAttack=window.scrollY;});
  await page.locator('[data-action="attack"]').click();
  for(let i=0;i<19;i++)await page.locator('#hit').evaluate(button=>button.click());
  const noJump=await page.evaluate(()=>({sameArena:window.__tbArenaBeforeAttack===document.querySelector('.tb-arena'),before:window.__tbScrollBeforeAttack,after:window.scrollY}));
  assert.equal(noJump.sameArena,true,'normal attack updates preserve the existing battle DOM');
  assert.equal(noJump.after,noJump.before,'20 rapid attack taps do not move the page');
  await page.waitForSelector('.tb-telegraph:not(.tb-telegraph-idle)',{timeout:6000});
  assert.equal(await page.locator('[data-counter]').isEnabled(),true,'counter is available during a telegraph');
  const resourceBeforeCounter=await page.evaluate(()=>window.TowerboundRework.state.characters[0].resource);
  await page.locator('[data-counter]').click();
  await page.waitForFunction(before=>window.TowerboundRework.state.characters[0].resource<before,resourceBeforeCounter);
  await page.waitForSelector('.tb-telegraph-idle',{timeout:6000});
  await page.locator('[data-action="attack"]').click();
  await page.evaluate(()=>{window.TowerboundRework.state.characters[0].run.playerHp=1;window.saveTowerboundRework();});
  await page.waitForSelector('[data-action="confirm-death"]',{timeout:7000});
  assert.match(await page.locator('.tb-death-overlay').innerText(),/Персонаж погиб/,'lethal combat damage opens the death overlay');
  assert.equal(await page.locator('[data-action="revive"]').count(),1,'death screen exposes diamond revive');
  await page.screenshot({path:path.join(screenshots,'2000h-death-revive.png'),fullPage:true});
  assert.ok(await page.locator('#tbRpg').evaluate(el=>el.classList.contains('tb-death-shaking')),'death applies the configured screen-shake VFX');
  await page.locator('[data-action="confirm-death"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].run.lives),2,'Easy difficulty consumes one of three lives and keeps the run recoverable');
  assert.deepEqual(errors,[],'browser runtime must not throw uncaught errors');
  console.log('Browser smoke passed: seven classes, progression, inventory, shop, systems, combat, fixed 375×812 battle HUD, seven-target viewport stress, landscape layout, stable DOM and 20 rapid attack taps without scroll.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exit(1);});
