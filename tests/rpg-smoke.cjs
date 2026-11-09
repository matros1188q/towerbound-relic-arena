'use strict';
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const root=process.cwd();
 const classConfig=JSON.parse(fs.readFileSync(path.join(root,"configs/balance/classes.json"),"utf8"));
 const cunning=classConfig.classes.assassin.base_skills.find(skill=>skill.name==="Коварный выпад");
 assert.equal(cunning.damage_multiplier,1.5,"Коварный выпад defines 150% damage");
 assert.equal(cunning.resource_cost,18,"Коварный выпад defines its resource cost");
 assert.match(cunning.description,/Урон: 150%/,"Коварный выпад has an explicit non-undefined description");
 const battleUiSource=fs.readFileSync(path.join(root,"rpg-rework-ui.js"),"utf8");
 assert.match(battleUiSource,/s\.description\|\|/,"skill descriptions use safe fallbacks when config fields are absent");
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
  assert.equal(first.characters[0].silver,100,'starter silver matches account.json');
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
  await page.locator('.tb-map-actions [data-action="profile"]').click();
  await page.locator('[data-branch="bleed"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].branch),'bleed','specialization selection persists');
  await page.evaluate(()=>{
   const c=window.TowerboundRework.state.characters[0];
   if(!c.bag.some(item=>item.id==='qa-weapon'))c.bag.push({id:'qa-weapon',name:'QA Blade',slot:'weapon',rarity:'Эпическая',stats:{attack:10,defense:2,health:10},refine:0,sockets:[],socketsAvailable:0});
   localStorage.setItem('tb-rpg-v2',JSON.stringify(window.TowerboundRework.state));
  });
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="bag"]').click();
  await page.waitForSelector('[data-equip="qa-weapon"]');
  await page.locator('[data-equip="qa-weapon"]').click();
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="talents"]').click();
  await page.locator('[data-talent="bleed.talent.1"]').click();
  assert.match(await page.locator('.tb-talent').first().innerText(),/1\/3/,'branch talent point is applied');
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="gear"]').click();
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
  await page.locator('[data-setting="volume_master"]').fill('0.5');
  await page.locator('[data-action="tutorial-next"]').click();
  assert.match(await page.locator('.tb-systems').innerText(),/Туториал · 1\/6/,'tutorial step persists');
  await page.locator('[data-action="pvp-match"]').click();
  assert.equal(await page.locator('[data-action="pvp-fight"]').count(),0,'online matchmaking must not silently fall back to a fake bot when no account is signed in');
  await page.waitForFunction(()=>document.querySelector('.tb-toast')?.textContent.includes('Войди в аккаунт Supabase'));
  assert.match(await page.locator('.tb-toast').innerText(),/Войди в аккаунт Supabase/,'real ghost matchmaking requires an authenticated Supabase account');
  await page.locator('[data-action="leaderboard"]').click();
  await page.waitForSelector('.tb-systems');
  assert.match(await page.locator('.tb-systems').innerText(),/Рейтинг игроков/,'global leaderboard screen opens from the game menu');
  await page.locator('.tb-system-top [data-action="systems"]').click();
  await page.evaluate(()=>{const engine=window.TowerboundRework,c=engine.state.characters[0];c.level=1;c.gear=[null,null,null,null,null,null];c.talents={};c.progress.highestEver=10;c.progress.currentStage=11;engine.setDifficulty(c.id,'easy');window.saveTowerboundRework();});
  await page.locator('.tb-systems .tb-system-top [data-action="map"]').click();
  await page.locator('[data-stage="9"]').click();
  await page.setViewportSize({width:375,height:812});
  await page.locator('[data-action="start"]').click();
  await page.waitForSelector('.tb-arena',{timeout:5000});
  assert.equal(await page.locator('.tb-turn-tutorial').count(),1,'first battle shows turn-based tutorial');
  assert.match(await page.locator('.tb-turn-tutorial').innerText(),/Это пошаговый бой[\s\S]*Нажми на умение[\s\S]*телеграфами/,'tutorial covers turns, actions and telegraphs');
  await page.locator('[data-action="dismiss-turn-tutorial"]').click();
  assert.equal(await page.locator('.tb-turn-tutorial').count(),0,'Понятно closes the tutorial');
  assert.match(await page.locator('.tb-turn-guidance').innerText(),/Твой ход/,'player turn guidance is visible');
  assert.match(await page.locator('[data-action="end-turn"]').innerText(),/ЗАВЕРШИТЬ ХОД/,'explicit end-turn action is visible');
  assert.equal(await page.locator('[data-panel-skill]').count(),4,'four configured attack skills are visible');
  assert.equal(await page.locator('[data-counter]').count(),1,'class counter occupies slot five');
  assert.equal(await page.locator('[data-ultimate]').count(),1,'class ultimate occupies slot six');
  assert.equal(await page.locator('.tb-panel-skill').count(),6,'all six combat buttons are rendered');
  assert.equal(await page.locator('.tb-initiative-avatar').count(),1,'player initiative uses the Matroscheg portrait');
  const visualAudit=await page.evaluate(()=>{
   const wrap=document.querySelector('.tb-target-card .tb-target-art-wrap'),targetImg=wrap?.querySelector('img'),targetBox=wrap?.getBoundingClientRect(),targetImage=targetImg?.getBoundingClientRect();
   const portrait=document.querySelector('.tb-enemy-portrait'),bossImg=portrait?.querySelector('img'),portraitBox=portrait?.getBoundingClientRect(),bossImage=bossImg?.getBoundingClientRect();
   const focus=document.querySelector('.tb-enemy-focus'),telegraph=focus?.querySelector('.tb-telegraph'),telegraphBox=telegraph?.getBoundingClientRect(),focusBox=focus?.getBoundingClientRect();
   const hp=document.querySelector('.tb-battle-hero .tb-healthbar.hero span');
   return {targetContained:!!targetBox&&!!targetImage&&targetImage.left>=targetBox.left-1&&targetImage.right<=targetBox.right+1&&targetImage.top>=targetBox.top-1&&targetImage.bottom<=targetBox.bottom+1,portraitHeight:portraitBox?.height||0,bossImageContained:!!portraitBox&&!!bossImage&&bossImage.left>=portraitBox.left-1&&bossImage.right<=portraitBox.right+1&&bossImage.top>=portraitBox.top-1&&bossImage.bottom<=portraitBox.bottom+1,telegraphPosition:telegraph?getComputedStyle(telegraph).position:"missing",telegraphContained:!!focusBox&&!!telegraphBox&&telegraphBox.left>=focusBox.left-1&&telegraphBox.right<=focusBox.right+1&&telegraphBox.top>=focusBox.top-1&&telegraphBox.bottom<=focusBox.bottom+1,heroHpWidth:hp?.getBoundingClientRect().width||0,heroHpColor:hp?getComputedStyle(hp).backgroundImage:""};
  });
  assert.ok(visualAudit.portraitHeight<=150,'boss and elite portrait is capped at 150px');
  assert.ok(visualAudit.targetContained,'mob artwork stays inside its target card image frame');
  assert.ok(visualAudit.bossImageContained,'boss artwork stays inside its portrait frame');
  assert.equal(visualAudit.telegraphPosition,'relative','enemy telegraph stays inside its card instead of floating over the screen');
  assert.ok(visualAudit.telegraphContained,'enemy telegraph stays within the enemy card');
  assert.ok(visualAudit.heroHpWidth>0,'player HP bar has a visible filled width');
  assert.match(visualAudit.heroHpColor,/58, 114, 72|141, 175, 104/,'player HP bar uses the green hero-health gradient');
  const mobilePanel=await page.locator('.tb-panel-actions').evaluate(el=>({
   display:getComputedStyle(el).display,
   slotsDisplay:getComputedStyle(el.querySelector('.tb-panel-slots')).display,
   columns:getComputedStyle(el.querySelector('.tb-panel-slots')).gridTemplateColumns.split(' ').length,
   rows:getComputedStyle(el.querySelector('.tb-panel-slots')).gridTemplateRows.split(' ').length,
   targetTop:document.querySelector('.tb-target-grid').getBoundingClientRect().top,
   panelTop:el.getBoundingClientRect().top,
   endTurnHeight:document.querySelector('[data-action="end-turn"]').getBoundingClientRect().height,
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
  assert.ok(mobilePanel.endTurnHeight<=60,'End Turn button stays at or below 60px');
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
  assert.equal(await page.locator('#speed').count(),0,'real-time speed toggle is removed');
  assert.equal(await page.locator('[data-action="attack"]').count(),0,'real-time Attack control is removed');
  await page.locator('[data-target="0"]').click();
  assert.ok(await page.locator('[data-target="0"]').evaluate(el=>el.classList.contains('selected')),'tap selects a live mob');
  await page.evaluate(()=>{window.__tbScrollBeforeTurn=window.scrollY;});
  await page.waitForSelector('.tb-telegraph:not(.tb-telegraph-idle)',{timeout:6000});
  assert.equal(await page.locator('[data-counter]').isEnabled(),true,'counter is available during a telegraph');
  const resourceBeforeCounter=await page.evaluate(()=>window.TowerboundRework.state.characters[0].resource);
  await page.locator('[data-counter]').click();
  await page.waitForFunction(before=>window.TowerboundRework.state.characters[0].resource<before,resourceBeforeCounter);
  const hpBeforeEnemyPhase=await page.evaluate(()=>window.TowerboundRework.state.characters[0].run.playerHp);
  await page.locator('[data-action="end-turn"]').click();
  await page.waitForFunction(()=>{const button=document.querySelector('[data-action="end-turn"]');return button?.disabled&&button.innerText.includes("ХОД ПРОТИВНИКА");});
  await page.waitForFunction(()=>document.querySelector('.tb-arena-top')?.innerText.includes('РАУНД 2')||document.querySelector('[data-action="confirm-death"]'));
  const hpAfterEnemyPhase=await page.evaluate(()=>window.TowerboundRework.state.characters[0].run.playerHp);
  assert.ok(hpAfterEnemyPhase<hpBeforeEnemyPhase,'at least one enemy attacks before the player receives the next turn');
  assert.match(await page.locator('.tb-turn-guidance').innerText(),/Твой ход/,'control returns to the player after enemy phase');
  assert.equal(await page.locator('[data-action="end-turn"]').isEnabled(),true,'end-turn button reactivates for the player');
  const noJump=await page.evaluate(()=>({before:window.__tbScrollBeforeTurn,after:window.scrollY}));
  assert.equal(noJump.after,noJump.before,'End Turn does not move the page');
  await page.evaluate(()=>{const c=window.TowerboundRework.state.characters[0];c.run.playerHp=1;window.saveTowerboundRework();});
  await page.locator('[data-action="end-turn"]').click();
  await page.waitForSelector('[data-action="confirm-death"]',{timeout:7000});
  assert.match(await page.locator('.tb-death-overlay').innerText(),/Персонаж погиб/,'lethal combat damage opens the death overlay');
  assert.ok(await page.locator('#tbRpg').evaluate(el=>el.classList.contains('tb-death-shaking')),'death applies the configured screen-shake VFX');
  await page.locator('[data-action="confirm-death"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].run.lives),2,'Easy difficulty consumes one of three lives and keeps the run recoverable');
  assert.deepEqual(errors,[],'browser runtime must not throw uncaught errors');
  console.log('Browser smoke passed: seven classes, progression, inventory, shop, systems, combat, fixed 375×812 battle HUD, seven-target viewport stress, landscape layout, stable DOM and 20 rapid attack taps without scroll.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exit(1);});
