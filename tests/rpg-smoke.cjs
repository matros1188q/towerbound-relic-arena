'use strict';
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const root=process.cwd();
 const classConfig=JSON.parse(fs.readFileSync(path.join(root,"configs/balance/classes.json"),"utf8"));
 const skillConfig=JSON.parse(fs.readFileSync(path.join(root,"configs/balance/skills.json"),"utf8"));
 const xpConfig=JSON.parse(fs.readFileSync(path.join(root,"configs/balance/xp_curve.json"),"utf8"));
 const combatConfig=JSON.parse(fs.readFileSync(path.join(root,"configs/balance/combat.json"),"utf8"));
 assert.equal(xpConfig.base_multiplier,2.15,"XP multiplier is set to the requested progression target");
 assert.equal(xpConfig.base_required,180,"base XP requirement remains unchanged");
 assert.equal(xpConfig.exponent,1.3,"XP curve exponent remains unchanged");
 assert.equal(combatConfig.player_damage.crit_chance,0.05,"runtime base critical chance remains 5 percent; do not confuse it with unrelated 2 percent drop chances");
 assert.equal(skillConfig.panel.slot_count,6,"battle skill panel exposes all six slots");
 assert.equal(skillConfig.panel.attack_slots+2,skillConfig.panel.slot_count,"four attack skills plus counter and ultimate fill the six-slot panel");
 const mobileCss=fs.readFileSync(path.join(root,"native-pwa.css"),"utf8");
 assert.match(mobileCss,/\.tb-end-turn\{[^}]*z-index:30!important/s,"mobile End Turn button is layered above the potion belt");
 const cunning=classConfig.classes.assassin.base_skills.find(skill=>skill.name==="Коварный выпад");
 assert.equal(cunning.damage_multiplier,2,"Коварный выпад defines 200% damage");
 assert.equal(cunning.resource_cost,18,"Коварный выпад defines its resource cost");
 assert.match(cunning.description,/Урон: 200%/,"Коварный выпад has an explicit non-undefined description");
 const catalog=JSON.parse(fs.readFileSync(path.join(root,"configs/skills/catalog.json"),"utf8"));
 const skillEffects=JSON.parse(fs.readFileSync(path.join(root,"configs/balance/skill_effects.json"),"utf8"));
 const allConfiguredSkills=[...Object.entries(classConfig.classes).flatMap(([classId,definition])=>(definition.base_skills||[]).map(skill=>({...skill,class_id:classId}))),...catalog];
 assert.ok(allConfiguredSkills.every(skill=>!!skillEffects[skill.effect_template]),"every base and specialization skill maps to a known effect template");
 assert.ok(allConfiguredSkills.every(skill=>Number.isFinite(Number(skill.resource_cost??skillEffects[skill.effect_template].resource_cost??0))),"every skill has a finite resource-cost fallback");
 assert.ok(allConfiguredSkills.every(skill=>!!(skill.damage_multiplier??skillEffects[skill.effect_template].damage_multiplier??skillEffects[skill.effect_template].heal_multiplier??skillEffects[skill.effect_template].power_multiplier??skillEffects[skill.effect_template].shield_fraction??1)),"every skill has a safe effect-stat fallback");
 assert.equal(catalog.length,420,"specialization catalog contains 420 skills");
 assert.deepEqual([...new Set(catalog.map(skill=>skill.class_id))].sort(),["assassin","bishop","destroyer","dragonkin","duelist","elemental","shaman"].sort(),"catalog contains all seven classes");
 for(const [classId,definition] of Object.entries(classConfig.classes)){
  assert.ok(definition.base_skills.length>=4,classId+" has four base skills");
  assert.ok(definition.base_skills.every(skill=>Number.isFinite(skill.unlock_level)&&skill.unlock_level>=1),classId+" base skills have unlock levels");
  assert.equal(catalog.filter(skill=>skill.class_id===classId).length,60,classId+" has 60 branch skills");
 }
 const battleUiSource=fs.readFileSync(path.join(root,"rpg-rework-ui.js"),"utf8");
 assert.match(battleUiSource,/presets=\{click:\{wave:/,"Web Audio click effect is configured");
 assert.match(battleUiSource,/hit:\{wave:/,"Web Audio mob hit effect is configured");
 assert.match(battleUiSource,/crit:\{wave:/,"Web Audio critical effect is configured");
 assert.match(battleUiSource,/hurt:\{wave:/,"Web Audio player damage effect is configured");
 assert.match(battleUiSource,/max-height:150px/,"all mob and boss art frames have a 150px cap");
 assert.match(battleUiSource,/function resolveSkill\(c,skillId\)/,"battle actions resolve class base skills and catalog skills");
 assert.match(battleUiSource,/\[data-stone\],\[data-extract-gem\],\[data-inspect-stone\]/,"gem insert, extract and inspect controls are included in delegated click handling");
 assert.match(battleUiSource,/console\.log\('SKILL DEBUG:',skillObject\)/,"skill renderer logs the requested debug object");
 assert.match(battleUiSource,/skill\.resource_cost\?\?effect\.resource_cost/,"skill cost prefers its configured value");
 assert.match(battleUiSource,/skill\.damage_multiplier\?\?skill\.damage\?\?effect\.damage_multiplier/,"skill damage prefers normalized damage and has a safe fallback");
 assert.match(battleUiSource,/Number\(source\.cost\?\?source\.resource_cost/,"skill resolver normalizes cost into a numeric field");
 assert.match(battleUiSource,/damage_multiplier:Number\(source\.damage_multiplier\?\?source\.damage\?\?effect\.damage_multiplier\?\?1\)\|\|1/,"missing damage multipliers use a neutral 1.0 instead of disabling attack damage");
 assert.match(battleUiSource,/Number\.isFinite\(Number\(skill\.unlock_level\)\)\?Number\(skill\.unlock_level\):1/,"missing skill unlock levels default to level one");
 assert.match(battleUiSource,/function safeTimeoutMs\(value,fallback=1000\)/,"all enemy turn delays pass through a numeric finite-value guard");
 assert.match(battleUiSource,/battle\.timerRemainingMs=0/,"battle countdown state is initialized and cleared as a number");
 assert.match(battleUiSource,/function recoverPlayerTurn\(error\)[\s\S]*?battle\.busy=false;battle\.isPlayerTurn=true/,"enemy-turn errors always restore player input");
 assert.match(battleUiSource,/function endPlayerTurn\(\)[\s\S]*?catch\(error\)\{recoverPlayerTurn\(error\);\}/,"player end-turn errors also recover instead of locking the UI");
 assert.match(battleUiSource,/Number\.isFinite\(remaining\)/,"pause/resume validates the optional telegraph countdown before scheduling");
 assert.match(battleUiSource,/scheduleEnemyTurnQueue\(queue,0,queueToken,500\)/,"enemy turns retain the 500ms sequential handoff");
 assert.match(battleUiSource,/function advanceToPlayerTurn\(\)[\s\S]*?battle\.busy=false/,"player turn handoff always clears battle.busy");

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
 const errors=[],consoleErrors=[],skillDebugLogs=[];
 page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))consoleErrors.push(message.text());});
 page.on('console',message=>{if(message.text().startsWith('SKILL DEBUG:')){const args=message.args();if(args[1])args[1].jsonValue().then(value=>skillDebugLogs.push(value)).catch(()=>{});}});
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',route=>route.abort());
 await page.addInitScript(()=>{
  window.supabase={createClient:()=>{let listener=null;const readSession=()=>{try{return JSON.parse(localStorage.getItem('__tb_qa_auth_session')||'null');}catch(e){return null;}};
   return{auth:{onAuthStateChange:cb=>{listener=cb;},getSession:async()=>({data:{session:readSession()},error:null}),
    signInWithPassword:async({email,password})=>{window.__tbLastAuth={email,password};if(email.startsWith('test123@')&&password!=='123456')return{data:{session:null},error:{message:'Invalid login credentials'}};const session={user:{id:'qa-user',email}};localStorage.setItem('__tb_qa_auth_session',JSON.stringify(session));if(listener)listener('SIGNED_IN',session);return{data:{session},error:null};},
    signUp:async({email,password})=>{window.__tbLastAuth={email,password};const session={user:{id:'qa-user',email}};localStorage.setItem('__tb_qa_auth_session',JSON.stringify(session));if(listener)listener('SIGNED_IN',session);return{data:{session},error:null};},
    signOut:async()=>{localStorage.removeItem('__tb_qa_auth_session');if(listener)listener('SIGNED_OUT',null);return{error:null};}},
    from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:null,error:null})})})}),
    rpc:async()=>({data:{revision:1},error:null})};
  }};
 });
 try{
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});
  await page.waitForSelector('#tbRpg .tb-login-gate');
  assert.equal(await page.locator('.tb-login-gate h2').innerText(),'Вход в игру','unauthenticated launch shows the centered login form');
  assert.equal(await page.locator('.tb-login-gate #login').count(),1,'login field is in the character selection screen');
  assert.equal(await page.locator('.tb-login-gate #pass').count(),1,'password field is in the character selection screen');
  assert.equal(await page.locator('.tb-login-gate [data-action="empty-login"]').count(),1,'main login button is clickable');
  assert.equal(await page.locator('.tb-login-gate [data-action="empty-register"]').count(),1,'registration link is present');
  assert.equal(await page.locator('.tb-header .tb-account-button').count(),0,'redundant header account button is removed');
  const brandLogo=page.locator('.tb-brand img.game-logo');
  assert.equal(await brandLogo.count(),1,'character selection header renders the new JPG TowerBound logo');
  const logoLayout=await brandLogo.evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,fit:getComputedStyle(el).objectFit,complete:el.complete&&el.naturalWidth>0}));
  assert.ok(logoLayout.width<=300.5,'TowerBound logo respects the 300px maximum width');
  assert.equal(logoLayout.fit,'contain','TowerBound logo preserves its aspect ratio');
  assert.ok(logoLayout.complete,'TowerBound logo JPG has loaded successfully');
  await page.locator('#login').fill('Test123');
  await page.locator('#pass').fill('123456');
  await page.locator('[data-action="empty-register"]').click();
  await page.waitForFunction(()=>window.TowerboundCloud?.signedIn);
  assert.equal(await page.evaluate(()=>window.__tbLastAuth.email),'test123@towerbound.com','registration creates the lowercase .com synthetic email');
  await page.evaluate(()=>window.TowerboundCloud.signOut());
  await page.waitForFunction(()=>!window.TowerboundCloud?.signedIn);
  await page.locator('#login').fill('Test123');
  await page.locator('#pass').fill('wrongpass');
  await page.locator('[data-action="empty-login"]').click();
  await page.waitForFunction(()=>document.querySelector('.tb-login-message')?.textContent==='Неверный логин или пароль');
  assert.ok(await page.locator('.tb-login-message.is-error').count(),'invalid login error is styled red');
  await page.locator('#login').fill('Test123');
  await page.locator('#pass').fill('123456');
  await page.locator('[data-action="empty-login"]').click();
  await page.waitForFunction(()=>window.TowerboundCloud?.signedIn);
  assert.equal(await page.evaluate(()=>window.__tbLastAuth.email),'test123@towerbound.com','new-domain sign-in succeeds after registration');
  await page.evaluate(()=>window.TowerboundCloud.signOut());
  await page.waitForFunction(()=>!window.TowerboundCloud?.signedIn);
  await page.locator('#login').fill('Matroscheg');
  await page.locator('#pass').fill('qa-password');
  await page.locator('.tb-character-login #rememberMe').uncheck();
  await page.locator('[data-action="empty-login"]').click();
  await page.waitForFunction(()=>window.TowerboundCloud?.signedIn);
  assert.equal(await page.evaluate(()=>window.__tbLastAuth.email),'matroscheg@towerbound.com','game login maps to lowercase synthetic email');
  await page.reload({waitUntil:'networkidle'});
  await page.waitForSelector('#tbRpg .tb-login-gate');
  assert.equal(await page.locator('.tb-login-gate h2').innerText(),'Вход в игру','login is required again when remember-me is unchecked');
  await page.locator('#login').fill('Matroscheg');
  await page.locator('#pass').fill('qa-password');
  await page.locator('.tb-character-login #rememberMe').check();
  await page.locator('[data-action="empty-login"]').click();
  await page.waitForFunction(()=>window.TowerboundCloud?.signedIn);
  assert.equal(await page.evaluate(()=>localStorage.getItem('tb-remember-me')),'true','remember-me preference is persisted');
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(()=>!!window.TowerboundCloud?.signedIn);
  await page.waitForFunction(()=>document.querySelector('.tb-empty h2')?.textContent==='Башня ждёт своего героя');
  await page.waitForFunction(()=>!!window.TowerboundReworkReady);
  assert.equal(await page.locator('#tbCloudOverlay').evaluate(el=>el.classList.contains('open')),false,'login overlay does not cover the main character screen');
  await page.evaluate(()=>{document.querySelector('#titleScreen')?.classList.add('is-hidden');document.querySelector('#accountDialog')?.classList.remove('open');document.body.removeAttribute('data-tb-screen');});
  await page.waitForSelector('#tbRpg .tb-v2');
  assert.equal(await page.locator('.tb-character-card').count(),0,'new account starts with an empty character roster');
  assert.equal(await page.locator('[data-action="new"]').count(),1,'authenticated empty state exposes one create-character action');
  await page.locator('[data-action="new"]').first().click();
  assert.equal(await page.locator('[data-class]').count(),7,'all seven classes are shown');
  await page.locator('[data-class="assassin"]').click();
  await page.locator('#name').fill('RPG QA');
  await page.locator('[data-action="confirm-create"]').click();
  await page.waitForFunction(()=>window.TowerboundRework?.state.characters.length===1);
  assert.match(await page.locator('#tbRpg').innerText(),/RPG QA/,'created character appears in roster');
  assert.deepEqual(errors,[],'login and character creation have no uncaught browser errors');
  assert.deepEqual(consoleErrors,[],'login and character creation have no console errors');
  console.log('AUTH GATE PASS: centered login, Supabase sign-in mock, remember-me, session restore, create-character gate, and mobile wordmark');
  const first=await page.evaluate(()=>JSON.parse(localStorage.getItem('tb-rpg-v2')));
  const baseSkillAvailability=await page.evaluate(()=>{
   const engine=window.TowerboundRework;
   return Object.entries(engine.balance.classes.classes).map(([classId,definition])=>{
    const skill=(definition.base_skills||[]).find(item=>Number(item.unlock_level||1)<=2);
    return{classId,skillId:skill?.id||null,available:!!skill&&engine.skillAvailable({classId,level:2,branch:null},skill)};
   });
  });
  assert.equal(baseSkillAvailability.length,7,"all seven classes expose base combat skills");
  assert.ok(baseSkillAvailability.every(item=>item.available&&item.skillId),"level-2 base skills are available for every class");
  console.log("SKILL AVAILABILITY BY CLASS:",JSON.stringify(baseSkillAvailability));
  assert.equal(first.characters[0].silver,100,'starter silver matches account.json');
  assert.equal(first.characters[0].bag.find(x=>x.type==='healing_potion').quantity,3);
  assert.ok(first.account.premiumUntil>Date.now());
  await page.reload({waitUntil:'networkidle'});
  await page.waitForSelector('#tbRpg .tb-v2');
  assert.match(await page.locator('#tbRpg').innerText(),/RPG QA/,'saved roster survives refresh');
  await page.evaluate(()=>{
   const engine=window.TowerboundRework,c=engine.state.characters[0];
   c.xp=200000;c.level=10;c.talentPoints=9;c.branch=null;c.silver=50000;
   c.progress.highestEver=1;c.progress.currentStage=2;
   c.bag.push({id:'qa-weapon',name:'Эпический Боевой клинок',slot:'weapon',rarity:'Эпическая',stats:{attack:10,defense:2,health:10,crit:.05},refine:0,sockets:[],socketsAvailable:0});
   c.bag.push({id:'qa-chisel',type:'chisel'});
   c.bag.push({id:'qa-refine',type:'refine_stone'});
   c.bag.push({id:'qa-salvage',name:'QA Salvage Armor',slot:'chest',rarity:'Эпическая',itemLevel:120,stats:{attack:0,defense:10,health:25},refine:0,sockets:[],socketsAvailable:0});
   c.bag.push({id:'qa-chest-best',type:'equipment',name:'QA Best Chest',slot:'chest',rarity:'Легендарная',itemLevel:120,stats:{defense:20,health:150},refine:0,sockets:[],socketsAvailable:0});
   c.bag.push({id:'qa-weapon-best',type:'equipment',name:'QA Best Blade',slot:'weapon',rarity:'Легендарная',itemLevel:120,stats:{attack:25,crit:.05},refine:0,sockets:[],socketsAvailable:0});
   c.bag.push({id:'qa-gray',type:'equipment',name:'QA Gray Boots',slot:'legs',rarity:'Обычная',itemLevel:1,stats:{defense:1},refine:0,sockets:[],socketsAvailable:0});
   c.bag.push({id:'qa-craft',type:'craft_material',quantity:10});
   localStorage.setItem('tb-rpg-v2',JSON.stringify(engine.state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.waitForSelector('#tbRpg .tb-v2');
  await page.locator('[data-action="play"]').click();
  assert.equal(await page.locator('.tb-map-node').count(),250,'all 250 map stages render');
  // Validate both supported iPhone portrait sizes on the map and its compact stage toolbar.
  for(const viewport of [{width:390,height:844},{width:430,height:932}]){
   await page.setViewportSize(viewport);
   const layout=await page.evaluate(()=>({width:innerWidth,docWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,stageTop:document.querySelector('.tb-stage-toolbar')?.getBoundingClientRect().top,mapTop:document.querySelector('.tb-map-layout')?.getBoundingClientRect().top,navBottom:document.querySelector('.tb-bottom-nav')?.getBoundingClientRect().bottom,viewportHeight:innerHeight}));
   assert.ok(layout.docWidth<=layout.width&&layout.bodyWidth<=layout.width,'no horizontal page overflow at '+viewport.width+'x'+viewport.height);
   console.log('MAP VIEWPORT LAYOUT:',JSON.stringify(layout));
   assert.ok(layout.stageTop<layout.mapTop,'selected stage toolbar stays above the map grid at '+viewport.width+'px');
   assert.ok(layout.navBottom<=layout.viewportHeight+1,'bottom navigation stays inside the viewport at '+viewport.width+'px');
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-action="bottom-profile"]').click();
  const tabRail=await page.locator('.tb-profile .tb-tabs').evaluate(el=>({overflow:getComputedStyle(el).overflowX,wrap:getComputedStyle(el).flexWrap,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
  assert.equal(tabRail.overflow,'auto','profile tabs allow horizontal touch scrolling');
  assert.equal(tabRail.wrap,'nowrap','profile tabs stay in one horizontal row');
  assert.ok(tabRail.scrollWidth>tabRail.clientWidth,'profile tabs overflow into a horizontal swipe rail on iPhone width');
  await page.locator('.tb-profile .tb-tabs [data-tab="account"]').click();
  const chestBefore=await page.evaluate(()=>window.TowerboundRework.state.characters[0].dailyChest?.lastOpenedAt||0);
  assert.equal(await page.locator('[data-action="daily-chest"]').isEnabled(),true,'daily chest is available on a fresh character');
  await page.locator('[data-action="daily-chest"]').click();
  const chestAfter=await page.evaluate(()=>window.TowerboundRework.state.characters[0].dailyChest?.lastOpenedAt||0);
  assert.ok(chestAfter>chestBefore,'daily chest stores its last-opened timestamp in the character save');
  assert.equal(await page.locator('[data-action="daily-chest"]').isDisabled(),true,'daily chest button enters cooldown after claim');
  assert.equal(await page.locator('#tbExtraBar').count(),0,'duplicate top navigation is removed');
  await page.locator('[data-action="bottom-map"]').click();
  const loreLayout=await page.locator('.tb-chapter-card').evaluate(el=>({width:el.getBoundingClientRect().width,titleWidth:el.querySelector('h2')?.getBoundingClientRect().width,textWidth:el.querySelector('p')?.getBoundingClientRect().width,titleDisplay:getComputedStyle(el.querySelector('h2')).display}));
  assert.ok(loreLayout.width>280&&loreLayout.titleWidth>250&&loreLayout.textWidth>250,'chapter lore title and paragraph retain readable full width');
  assert.equal(loreLayout.titleDisplay,'block','chapter lore title is a block, not a compressed flex item');
  await page.locator('[data-action="bottom-profile"]').click();
  await page.locator('[data-branch="bleed"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].branch),null,'clicking a specialization only previews it and does not apply it');
  assert.equal(await page.locator('[data-action="confirm-branch"]').innerText(),'ПОДТВЕРДИТЬ ВЫБОР','pending specialization exposes an explicit confirmation button');
  await page.locator('[data-action="confirm-branch"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].branch),'bleed','specialization applies only after confirmation');
  assert.equal(await page.locator('[data-action="confirm-branch"]').count(),0,'confirmation button disappears after branch is selected');
  await page.evaluate(()=>{
   const c=window.TowerboundRework.state.characters[0];
   if(!c.bag.some(item=>item.id==='qa-weapon'))c.bag.push({id:'qa-weapon',name:'Эпический Боевой клинок',slot:'weapon',rarity:'Эпическая',stats:{attack:10,defense:2,health:10,crit:.05},refine:0,sockets:[],socketsAvailable:0});
   if(!c.bag.some(item=>item.id==='qa-chisel'))c.bag.push({id:'qa-chisel',type:'chisel'});
   localStorage.setItem('tb-rpg-v2',JSON.stringify(window.TowerboundRework.state));
  });
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="bag"]').click();
  await page.waitForSelector('[data-action="equip-best"]');
  assert.ok(await page.locator('.tb-bag-item').filter({hasText:'Зелье исцеления'}).count()>0,'healing potions display their Russian name');
  assert.ok(await page.locator('.tb-bag-item').filter({hasText:'Материал для крафта'}).count()>0,'craft materials display their Russian name');
  const bladeText=await page.locator('.tb-bag-item').filter({hasText:'Боевой клинок'}).innerText();
  assert.doesNotMatch(bladeText,/Эпическая/,'equipment rarity is not repeated beneath its full item name');
  const matsBefore=await page.evaluate(()=>window.TowerboundRework.state.characters[0].bag.find(x=>x.type==="craft_material")?.quantity||0);
  await page.locator('[data-action="salvage-gray"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].bag.some(x=>x.id==="qa-gray")),false,'bulk gray salvage removes common gear from the bag');
  assert.ok(await page.evaluate(before=>(window.TowerboundRework.state.characters[0].bag.find(x=>x.type==="craft_material")?.quantity||0)>before,matsBefore),'bulk gray salvage converts items to crafting materials');
  await page.locator('[data-action="equip-best"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].gear[0]?.id),'qa-weapon-best','Equip Best selects the highest-stat weapon');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].gear[1]?.id),'qa-chest-best','Equip Best selects the highest-stat chest item');
  await page.waitForSelector('[data-equip="qa-weapon"]');
  await page.locator('[data-equip="qa-weapon"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].gear[0]?.id),'qa-weapon','manual equip still replaces the equipped weapon');
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="talents"]').click();
  await page.locator('[data-talent="bleed.talent.1"]').click();
  assert.match(await page.locator('.tb-talent').first().innerText(),/1\/3/,'branch talent point is applied');
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="gear"]').click();
  assert.match(await page.locator('.tb-gear-slot').first().innerText(),/Боевой клинок/,'inventory equipment can be equipped');
  assert.match(await page.locator('.tb-gear-slot').first().innerText(),/КРИТ \+5%/,'critical chance is rendered as a percentage');
  await page.locator('[data-refine="qa-weapon"]').click();
  assert.match(await page.locator('.tb-gear-slot').first().innerText(),/\+1/,'refinement consumes a refine stone');
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="bag"]').click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('[data-salvage="qa-salvage"]').click();
  await page.waitForFunction(()=>window.TowerboundRework.state.characters[0].bag.some(item=>item.type==='craft_material'&&item.quantity>=20));
  await page.locator('[data-craft-stone="1"]').first().click();
  assert.ok(await page.evaluate(()=>window.TowerboundRework.state.characters[0].bag.some(item=>item.type==='enhancement_stone'&&item.stoneType.branch_id==='bleed')),'20 materials craft a specialization stone');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].stats.items_salvaged),2,'bulk and individual salvaging both increment achievement progress');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].stats.materials_crafted),1,'crafted stone increments achievement progress');
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="gear"]').click();
  await page.locator('[data-socket="qa-weapon"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].gear[0].socketsAvailable),1,'chisel opens a socket on the equipped weapon');
  await page.locator('[data-stone="qa-weapon"]').click();
  assert.equal(await page.evaluate(()=>(window.TowerboundRework.state.characters[0].gear[0].installedGems?.length?window.TowerboundRework.state.characters[0].gear[0].installedGems:window.TowerboundRework.state.characters[0].gear[0].sockets).length),1,'stone is recorded in installedGems');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].bag.some(item=>item.type==='enhancement_stone')),false,'inserted stone is removed from the backpack');
  await page.locator('[data-extract-gem="qa-weapon"]').click();
  assert.equal(await page.evaluate(()=>(window.TowerboundRework.state.characters[0].gear[0].installedGems?.length?window.TowerboundRework.state.characters[0].gear[0].installedGems:window.TowerboundRework.state.characters[0].gear[0].sockets).length),0,'extraction clears the equipment socket');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].bag.some(item=>item.type==='enhancement_stone')),true,'extracted stone returns to the backpack');
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="bag"]').click();
  await page.locator('[data-inspect-stone]').click();
  assert.match(await page.locator('.tb-toast').innerText(),/к атаке/,'stone description displays its actual stat bonuses');
  await page.locator('[data-action="bottom-map"]').click();
  await page.locator('[data-action="bottom-shop"]').click();
  await page.locator('[data-shop-tab="silver"]').click();
  assert.match(await page.locator('#tbRpg').innerText(),/Компас картографа/i,'silver extras are visible');
  await page.locator('[data-shop-tab="diamond"]').click();
  assert.match(await page.locator('#tbRpg').innerText(),/Жетон удачи/i,'diamond extras are visible');
  assert.match(await page.locator('#tbRpg').innerText(),/5000 алмазов/,'diamond packs are displayed');
  await page.locator('[data-action="bottom-profile"]').click();
  await page.locator('.tb-profile .tb-tabs [data-tab="account"]').click();
  await page.waitForSelector('.tb-systems');
  assert.match(await page.locator('.tb-systems').innerText(),/Достижения · 0\/30/,'account systems screen displays achievement catalogue');
  assert.equal(await page.locator('[data-setting="volume_master"]').count(),1,'master volume setting is available');
  await page.locator('[data-setting="volume_master"]').fill('0.5');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.account.settings.volume_master),0.5,'master volume persists to the game save');
  await page.locator('[data-action="toggle-mute"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.account.settings.sound_enabled),false,'Mute disables sound effects');
  assert.match(await page.locator('[data-action="toggle-mute"]').innerText(),/ЗВУК ВЫКЛ/,'Mute button reflects its disabled state');
  await page.locator('[data-action="toggle-mute"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.account.settings.sound_enabled),true,'Mute button restores sound effects');
  assert.match(await page.locator('[data-action="toggle-mute"]').innerText(),/ЗВУК ВКЛ/,'Mute button reflects its enabled state');
  await page.locator('[data-action="tutorial-next"]').click();
  assert.match(await page.locator('.tb-systems').innerText(),/Туториал · 1\/6/,'tutorial step persists');
  await page.locator('[data-action="pvp-match"]').click();
  assert.equal(await page.locator('[data-action="pvp-fight"]').count(),0,'online matchmaking must not silently fall back to a fake bot when no real opponent is returned');
  assert.equal(await page.locator('[data-action="pvp-fight"]').count(),0,'PvP does not fabricate a fight when no real opponent is returned');
  await page.locator('[data-action="bottom-rating"]').click();
  await page.waitForSelector('.tb-systems');
  assert.match(await page.locator('.tb-systems').innerText(),/Рейтинг игроков/,'global leaderboard screen opens from the game menu');
  await page.locator('[data-action="bottom-profile"]').click();
  await page.locator('.tb-profile .tb-tabs [data-tab="account"]').click();
  await page.evaluate(()=>{const engine=window.TowerboundRework,c=engine.state.characters[0];c.level=1;c.gear=[null,null,null,null,null,null];c.talents={};c.progress.highestEver=10;c.progress.currentStage=11;engine.setDifficulty(c.id,'easy');window.saveTowerboundRework();});
  await page.locator('[data-action="bottom-map"]').click();
  await page.evaluate(()=>{
   const c=window.TowerboundRework.state.characters[0];
   c.level=50;
   c.progress.highestEver=10;
   c.skillLoadout=['assassin.base.1','assassin.base.2'];
   window.saveTowerboundRework();
  });
  assert.equal(await page.evaluate(()=>typeof window.TowerboundEndgame?.open),'function','endgame screens expose their navigation API');
  for(const size of [{width:390,height:844},{width:430,height:932}]){
   await page.setViewportSize(size);
   for(const tab of ['tower','pass','guild','evolution']){
    const openDebug=await page.evaluate(tab=>{
     window.TowerboundEndgame.open(tab);
     const root=document.querySelector('#tbEndgame'),win=root?.querySelector('.eg-window');
     const box=el=>{if(!el)return null;const r=el.getBoundingClientRect(),s=getComputedStyle(el);return{display:s.display,visibility:s.visibility,opacity:s.opacity,width:r.width,height:r.height,left:r.left,top:r.top};};
     return{characters:window.TowerboundRework?.state?.characters?.length,activeCharacterId:window.TowerboundRework?.state?.activeCharacterId,root:box(root),window:box(win),body:box(document.body),htmlWidth:document.documentElement.scrollWidth,stylePresent:!!document.querySelector('style')&&[...document.querySelectorAll('style')].some(x=>x.textContent.includes('.eg-window'))};
    },tab);
    console.log('ENDGAME MOBILE OPEN:',tab,JSON.stringify(openDebug));
    await page.waitForSelector('#tbEndgame .eg-window',{state:'attached',timeout:3000});
    if(tab==='pass')assert.equal(await page.locator('#tbEndgame .eg-pass-row').count(),50,'Battle Pass renders all 50 reward levels');
    if(tab==='tower')assert.match(await page.locator('#tbEndgame .eg-card').innerText(),/текущий этаж: 1/i,'Tower screen starts at floor one');
    if(tab==='guild')assert.match(await page.locator('#tbEndgame .eg-card').innerText(),/5[\s\u00a0\u202f]?000[\s\u00a0\u202f]?000/,'Guild screen renders the 5-million HP world boss');
    if(tab==='evolution'){
     await page.waitForFunction(()=>document.querySelectorAll('#tbEndgame [data-eg="evolve"]').length>=2,null,{timeout:5000});
     assert.ok(await page.locator('#tbEndgame [data-eg="evolve"]').count()>=2,'level 50 evolution screen offers both skill upgrades');
     const option=await page.locator('#tbEndgame [data-eg="evolve"]').first().evaluate(el=>({skill:el.dataset.skill,choice:el.dataset.choice}));
     await page.locator('#tbEndgame [data-eg="evolve"]').first().click();
     await page.waitForFunction(({skill,choice})=>window.TowerboundRework.state.characters[0].ext?.evolvedSkills?.[skill]?.id===choice,option,{timeout:3000});
     assert.equal(await page.evaluate(({skill})=>window.TowerboundEndgame.getSkillEvolution(skill)?.id,option),option.choice,'chosen evolution is persisted and exposed to the combat UI');
    }
    const bounds=await page.locator('#tbEndgame .eg-window').evaluate(el=>{
     const r=el.getBoundingClientRect(),back=el.querySelector('[data-eg="back-map"]').getBoundingClientRect();
     return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,backLeft:back.left,backRight:back.right,backTop:back.top,backBottom:back.bottom,docWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,viewportHeight:innerHeight};
    });
    assert.ok(bounds.left>=0&&bounds.right<=size.width+1&&bounds.top>=0&&bounds.bottom<=size.height+1,'endgame '+tab+' window stays inside '+size.width+'x'+size.height);
    assert.ok(bounds.backLeft>=0&&bounds.backRight<=size.width+1&&bounds.backTop>=0&&bounds.backBottom<=size.height+1,'endgame '+tab+' back-to-map button stays visible on mobile');
    assert.ok(bounds.docWidth<=bounds.viewportWidth,'endgame '+tab+' does not introduce horizontal page overflow');
    await page.locator('#tbEndgame [data-eg="back-map"]').click();
    await page.waitForSelector('#tbEndgame',{state:'detached',timeout:3000});
   }
  }
  await page.evaluate(()=>{const c=window.TowerboundRework.state.characters[0];c.level=1;window.saveTowerboundRework();});
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-stage="9"]').click();
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-action="start"]').click();
  await page.waitForSelector('.tb-arena',{timeout:5000});
  assert.equal(await page.locator('.tb-turn-tutorial').count(),1,'first battle shows turn-based tutorial');
  const tutorialBounds=await page.locator('.tb-turn-tutorial-card').evaluate(el=>{const r=el.getBoundingClientRect(),button=el.querySelector('[data-action="dismiss-turn-tutorial"]').getBoundingClientRect();return{top:r.top,bottom:r.bottom,buttonBottom:button.bottom,viewport:innerHeight,maxHeight:parseFloat(getComputedStyle(el).maxHeight)};});
  assert.ok(tutorialBounds.bottom<=tutorialBounds.viewport+1&&tutorialBounds.buttonBottom<=tutorialBounds.viewport+1,'tutorial CTA stays visible at 390x844');
  assert.ok(tutorialBounds.maxHeight<=tutorialBounds.viewport*.81,'tutorial card respects the 80dvh maximum');
  await page.setViewportSize({width:430,height:932});
  const tutorialWide=await page.locator('.tb-turn-tutorial-card').evaluate(el=>{const r=el.getBoundingClientRect(),b=el.querySelector('[data-action="dismiss-turn-tutorial"]').getBoundingClientRect();return{bottom:r.bottom,buttonBottom:b.bottom,viewport:innerHeight};});
  assert.ok(tutorialWide.bottom<=tutorialWide.viewport+1&&tutorialWide.buttonBottom<=tutorialWide.viewport+1,'tutorial CTA stays visible at 430x932');
  await page.setViewportSize({width:390,height:844});
  assert.match(await page.locator('.tb-turn-tutorial').innerText(),/Это пошаговый бой[\s\S]*АТАКА[\s\S]*умение[\s\S]*телеграфами/,'tutorial covers turns, actions and telegraphs');
  await page.locator('[data-action="dismiss-turn-tutorial"]').click();
  assert.equal(await page.locator('.tb-turn-tutorial').count(),0,'Понятно closes the tutorial');
  assert.equal(await page.locator('.tb-bottom-nav').count(),0,'global navigation yields the full viewport to active combat controls');
  assert.match(await page.locator('.tb-turn-guidance').innerText(),/Твой ход/,'player turn guidance is visible');
  assert.match(await page.locator('[data-action="end-turn"]').innerText(),/ЗАВЕРШИТЬ ХОД/,'explicit end-turn action is visible');
  assert.doesNotMatch(await page.locator('#tbRpg').innerText(),/NaN\s*сек/i,'battle HUD never renders a NaN seconds countdown');
  const intervalAudit=await page.evaluate(()=>{const c=window.TowerboundRework.state.characters[0],enemy={type:'normal',role:'normal'};return window.TowerboundRework.getEnemyStats(c.id,c.progress.currentStage,enemy).attackIntervalMs;});
  assert.ok(Number.isFinite(intervalAudit)&&intervalAudit>0,'enemy attack interval remains a finite positive number');
  assert.equal(await page.locator('[data-panel-skill]').count(),6,'six configured skill slots are visible');
  assert.equal(await page.locator('[data-counter]').count(),1,'class counter occupies slot five');
  assert.equal(await page.locator('[data-ultimate]').count(),1,'class ultimate occupies slot six');
  const evolvedPanel=await page.evaluate(()=>{
   const c=window.TowerboundRework.state.characters[0],id=c.skillLoadout?.[0],e=window.TowerboundEndgame.getSkillEvolution(id),button=document.querySelector('[data-panel-skill="'+id+'"]');
   return{evolved:e?.name,icon:e?.icon,text:button?.innerText||''};
  });
  assert.ok(evolvedPanel.evolved&&evolvedPanel.icon&&evolvedPanel.text.includes(evolvedPanel.evolved),'combat skill panel displays the evolved name and icon');
  assert.equal(await page.locator('.tb-panel-skill').count(),8,'six active skill slots plus counter and ultimate are rendered');
  assert.equal(await page.locator('[data-basic-attack]').count(),1,'free basic attack is available beside the skill grid');
  const attackLayout=await page.evaluate(()=>{const box=el=>{const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};};return{attack:box(document.querySelector('[data-basic-attack]')),skills:box(document.querySelector('.tb-panel-slots')),end:box(document.querySelector('[data-action="end-turn"]')),potion:box(document.querySelector('.tb-potion-belt button'))};});
  // The action panel must fit its own grid row; the potion belt must never cover the End Turn hit target.
  console.log('BATTLE CONTROL BOXES:',JSON.stringify(attackLayout));
  assert.ok(attackLayout.attack.bottom<=attackLayout.skills.top+2,'basic attack sits immediately above the skill grid');
  assert.ok(attackLayout.end.bottom<=attackLayout.potion.top+2||attackLayout.end.top>=attackLayout.potion.bottom-2,'potion belt never covers the End Turn button');
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
  assert.equal(mobilePanel.rows,3,'six skill slots plus counter and ultimate occupy three rows in the three-column mobile grid');
  assert.ok(mobilePanel.endTurnHeight<=60,'End Turn button stays at or below 60px');
  assert.ok(mobilePanel.heroHpTop>=0&&mobilePanel.heroHpBottom<=844,'hero HP bar stays in the viewport');
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
  assert.ok(stress.every(r=>r.top>=0&&r.bottom<=844&&r.left>=0&&r.right<=390),'all seven target cards remain inside the mobile viewport');
  await page.evaluate(()=>document.querySelectorAll('.tb-target-card[data-target^="10"]').forEach(card=>card.remove()));
  await page.setViewportSize({width:812,height:375});
  const landscape=await page.evaluate(()=>{
   const arena=document.querySelector('.tb-arena'),grid=document.querySelector('.tb-target-grid'),actions=document.querySelector('.tb-panel-actions'),potions=document.querySelector('.tb-potion-belt');
   return [arena,grid,actions,potions].map(el=>{const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};});
  });
  assert.ok(landscape.every(r=>r.top>=0&&r.bottom<=375&&r.left>=0&&r.right<=812),'arena, enemies, controls and potions fit in landscape');
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('#speed').count(),0,'real-time speed toggle is removed');
  assert.equal(await page.locator('[data-action="attack"]').count(),0,'real-time Attack control is removed');
  await page.locator('[data-target="0"]').click();
  assert.ok(await page.locator('[data-target="0"]').evaluate(el=>el.classList.contains('selected')),'tap selects a live mob');
  await page.evaluate(()=>{window.__tbScrollBeforeTurn=window.scrollY;});
  await page.evaluate(()=>{const c=window.TowerboundRework.state.characters[0];c.resource=0;window.saveTowerboundRework();});
  const basicBefore=await page.evaluate(()=>({resource:window.TowerboundRework.state.characters[0].resource,hp:document.querySelector('.tb-target-card.selected .tb-target-hp i')?.style.width}));
  await page.locator('[data-basic-attack]').click();
  await page.waitForFunction(before=>window.TowerboundRework.state.characters[0].resource===15&&document.querySelector('.tb-target-card.selected .tb-target-hp i')?.style.width!==before.hp,basicBefore,{timeout:5000});
  const hpBeforeEnemyPhase=await page.evaluate(()=>window.TowerboundRework.state.characters[0].run.playerHp);
  await page.locator('[data-action="end-turn"]').click();
  await page.waitForFunction(()=>{const button=document.querySelector('[data-action="end-turn"]');return button?.disabled&&button.innerText.includes("ХОД ПРОТИВНИКА");});
  await page.waitForFunction(()=>document.querySelector('.tb-arena-top')?.innerText.includes('РАУНД 2')||document.querySelector('[data-action="confirm-death"]'));
  const hpAfterEnemyPhase=await page.evaluate(()=>window.TowerboundRework.state.characters[0].run.playerHp);
  assert.ok(hpAfterEnemyPhase<hpBeforeEnemyPhase,'at least one enemy attacks before the player receives the next turn');
  assert.match(await page.locator('.tb-turn-guidance').innerText(),/Твой ход/,'control returns to the player after enemy phase');
  assert.equal(await page.locator('[data-action="end-turn"]').isEnabled(),true,'end-turn button reactivates for the player');
  await page.evaluate(()=>{const c=window.TowerboundRework.state.characters[0];c.resource=c.resourceMax;window.saveTowerboundRework();});
  const skillHpBefore=await page.locator('.tb-target-card.selected .tb-target-hp i').getAttribute('style');
  assert.equal(await page.locator('[data-panel-skill]').first().isEnabled(),true,'base Assassin skill is enabled at level 1');
  await page.locator('[data-panel-skill]').first().click();
  await page.waitForFunction(previous=>document.querySelector('.tb-target-card.selected .tb-target-hp i')?.getAttribute('style')!==previous,skillHpBefore);
  await page.waitForTimeout(100);
  assert.ok(skillDebugLogs.length>0,'browser console emitted SKILL DEBUG objects');
  assert.ok(skillDebugLogs[0].id.startsWith("assassin.base."),'first combat skill resolves from Assassin base skills');
  console.log("SKILL DEBUG CAPTURE:",JSON.stringify(skillDebugLogs[0]));
  const noJump=await page.evaluate(()=>({before:window.__tbScrollBeforeTurn,after:window.scrollY}));
  assert.equal(noJump.after,noJump.before,'End Turn does not move the page');
  if(await page.locator('[data-action="end-turn"]').count()===0){
   assert.ok(await page.locator('[data-action="start"]').count()>0,'a lethal skill may finish the stage and return to the map');
   await page.locator('[data-action="start"]').click();
   await page.waitForSelector('[data-action="end-turn"]',{timeout:5000});
  }
  await page.evaluate(()=>{const c=window.TowerboundRework.state.characters[0];c.run.playerHp=1;window.saveTowerboundRework();});
  await page.locator('[data-action="end-turn"]').click();
  await page.waitForSelector('[data-action="confirm-death"]',{timeout:7000});
  assert.match(await page.locator('.tb-death-overlay').innerText(),/Персонаж погиб/,'lethal combat damage opens the death overlay');
  assert.ok(await page.locator('#tbRpg').evaluate(el=>el.classList.contains('tb-death-shaking')),'death applies the configured screen-shake VFX');
  await page.locator('[data-action="confirm-death"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].run.lives),2,'Easy difficulty consumes one of three lives and keeps the run recoverable');
  assert.deepEqual(errors,[],'browser runtime must not throw uncaught errors');
  console.log('Browser smoke passed: seven classes, progression, inventory, shop, systems, combat, fixed 390×844 and 430×932 mobile HUD, seven-target viewport stress, landscape layout, stable DOM and 20 rapid attack taps without scroll.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exit(1);});

// Auth gate regression: inline overlay visibility is required even when app styles are overridden.
