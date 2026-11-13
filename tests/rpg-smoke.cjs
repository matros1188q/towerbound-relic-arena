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
 const battleCssSource=fs.readFileSync(path.join(root,"rpg-rework-ui.css.js"),"utf8");
 assert.match(battleCssSource,/let css=\[/,"V2 battle stylesheet builder remains mutable for appended battle overrides");
 assert.match(battleUiSource,/presets=\{click:\{wave:/,"Web Audio click effect is configured");
 assert.match(battleUiSource,/hit:\{wave:/,"Web Audio mob hit effect is configured");
 assert.match(battleUiSource,/crit:\{wave:/,"Web Audio critical effect is configured");
 assert.match(battleUiSource,/hurt:\{wave:/,"Web Audio player damage effect is configured");
 assert.match(battleUiSource,/max-height:150px/,"all mob and boss art frames have a 150px cap");
 assert.match(battleUiSource,/function resolveSkill\(c,skillId\)/,"battle actions resolve class base skills and catalog skills");
 assert.match(battleUiSource,/\[data-stone\],\[data-extract-gem\],\[data-inspect-stone\]/,"gem insert, extract and inspect controls are included in delegated click handling");
  assert.match(battleUiSource,/function skillIconMarkup\(skill,classId\)/,"combat skill buttons resolve their own class or skill icon");
  assert.match(battleUiSource,/const icon=evolved\?evolved\.icon:skill\?\.icon/,"evolved skill icons take priority over base skill icons");
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

 assert.match(battleUiSource,/skill\.description\|\|/,"skill descriptions use safe fallbacks when config fields are absent");
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
 page.on('pageerror',error=>errors.push(error.stack||error.message));
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
  if(errors.length)console.error('UNCaught PAGE ERRORS:',JSON.stringify(errors,null,2));
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
   c.bag.push({id:'qa-salvage',type:'equipment',name:'QA Salvage Armor',slot:'chest',rarity:'Эпическая',itemLevel:120,stats:{attack:0,defense:10,health:25},refine:0,sockets:[],socketsAvailable:0});
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
   // Auto-equip accepts only gear for the character's confirmed specialization.
   for(const item of c.bag)if(['qa-weapon','qa-salvage','qa-chest-best','qa-weapon-best'].includes(item.id)){item.branch=c.branch;if(item.id==='qa-weapon')item.type='equipment';}
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
  await page.locator('[data-item-select="qa-weapon"]').click();
  const manualEquipDiag=await page.evaluate(()=>({item:window.TowerboundRework.state.characters[0].bag.find(x=>x.id==='qa-weapon')||null,detail:document.querySelector('.tb-item-detail-overlay')?.innerText||null,detailHtml:document.querySelector('.tb-item-detail-overlay')?.innerHTML.slice(0,1200)||null}));
  process.stdout.write('MANUAL EQUIP DIAGNOSTIC '+JSON.stringify(manualEquipDiag)+'\\n');
  await page.waitForSelector('.tb-item-detail-overlay [data-equip="qa-weapon"]');
  await page.locator('.tb-item-detail-overlay [data-equip="qa-weapon"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].gear[0]?.id),'qa-weapon','manual equip still replaces the equipped weapon');
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="talents"]').click();
  await page.locator('[data-talent="bleed.talent.1"]').click();
  assert.match(await page.locator('.tb-talent').first().innerText(),/1\/3/,'branch talent point is applied');
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="gear"]').click();
  await page.locator('[data-collection-item="assassin::bleed::weapon::Эпическая"]').click();
  assert.match(await page.locator('.tb-collection-detail').innerText(),/Боевой клинок/,'collection detail shows the owned equipped weapon');
  assert.match(await page.locator('.tb-collection-detail').innerText(),/КРИТ \+5%/,'collection detail formats critical chance as a percentage');
  await page.locator('[data-refine="qa-weapon"]').click();
  assert.match(await page.locator('.tb-collection-detail').innerText(),/Заточка \+1/,'collection detail refreshes after refinement consumes a refine stone');
  await page.locator('[data-collection-close]').click();
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="bag"]').click();
  await page.locator('[data-item-select="qa-salvage"]').click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('.tb-item-detail-overlay [data-salvage="qa-salvage"]').click();
  await page.waitForFunction(()=>window.TowerboundRework.state.characters[0].bag.some(item=>item.type==='craft_material'&&item.quantity>=20));
  await page.locator('.tb-bag-item').filter({hasText:'Материал для крафта'}).locator('[data-item-select]').click();
  await page.locator('.tb-item-detail-overlay [data-craft-stone="1"]').click();
  await page.locator('.tb-item-detail-overlay [data-item-select=""]').click();
  assert.ok(await page.evaluate(()=>window.TowerboundRework.state.characters[0].bag.some(item=>item.type==='enhancement_stone'&&item.stoneType.branch_id==='bleed')),'20 materials craft a specialization stone');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].stats.items_salvaged),2,'bulk and individual salvaging both increment achievement progress');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].stats.materials_crafted),1,'crafted stone increments achievement progress');
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="gear"]').click();
  await page.locator('[data-collection-item="assassin::bleed::weapon::Эпическая"]').click();
  await page.locator('[data-socket="qa-weapon"]').click();
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].gear[0].socketsAvailable),1,'chisel opens a socket on the equipped weapon');
  await page.locator('[data-stone="qa-weapon"]').click();
  assert.equal(await page.evaluate(()=>(window.TowerboundRework.state.characters[0].gear[0].installedGems?.length?window.TowerboundRework.state.characters[0].gear[0].installedGems:window.TowerboundRework.state.characters[0].gear[0].sockets).length),1,'stone is recorded in installedGems');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].bag.some(item=>item.type==='enhancement_stone')),false,'inserted stone is removed from the backpack');
  await page.locator('[data-extract-gem="qa-weapon"]').click();
  assert.equal(await page.evaluate(()=>(window.TowerboundRework.state.characters[0].gear[0].installedGems?.length?window.TowerboundRework.state.characters[0].gear[0].installedGems:window.TowerboundRework.state.characters[0].gear[0].sockets).length),0,'extraction clears the equipment socket');
  assert.equal(await page.evaluate(()=>window.TowerboundRework.state.characters[0].bag.some(item=>item.type==='enhancement_stone')),true,'extracted stone returns to the backpack');
  await page.locator('[data-collection-close]').click();
  await page.locator('#tbRpg .tb-profile .tb-tabs [data-tab="bag"]').click();
  const stoneId=await page.evaluate(()=>window.TowerboundRework.state.characters[0].bag.find(item=>item.type==='enhancement_stone')?.id);
  assert.ok(stoneId,'crafted/extracted specialization stone remains in backpack');
  await page.locator('[data-item-select="'+stoneId+'"]').click();
  await page.locator('.tb-item-detail-overlay [data-inspect-stone]').click();
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
  await page.locator('[data-action="bottom-progress"]').click();
  await page.locator('[data-action="leaderboard"]').click();
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
  await page.evaluate(()=>{
    const engine=window.TowerboundRework,c=engine.state.characters[0];
    c.level=1;c.branch=null;c.gear=[null,null,null,null,null,null];c.run.stage=null;
    const base=(engine.balance.classes.classes[c.classId]?.base_skills||[]).find(skill=>Number(skill.unlock_level||1)<=c.level);
    c.activeSkills=base?[base.id]:[];c.skillLoadout=[...c.activeSkills];
    window.saveTowerboundRework();
   });
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-stage="9"]').click();
  await page.locator('[data-action="start"]').click();
  await page.waitForSelector('.v2-battle-wrap',{timeout:5000});
  // beginStage restores/clamps the carried HP; seed the interaction fixture after battle creation.
  await page.evaluate(()=>{window.TowerboundRework.state.characters[0].run.playerHp=100000;window.saveTowerboundRework();});
  assert.equal(await page.locator('.v2-skill-btn').count(),6,'V2 battle shows six skill slots');
  assert.ok(await page.locator('.v2-enemy-card').count()>0,'V2 battle displays enemy target cards');
  assert.equal(await page.locator('.v2-turn-guidance').count(),1,'V2 battle displays turn guidance');
  assert.equal(await page.locator('#hit').count(),1,'V2 battle has one basic attack control');
  assert.equal(await page.locator('#endturn').count(),1,'V2 battle has one End Turn control');
  const firstLayout=await page.evaluate(()=>{
   const box=selector=>{const el=document.querySelector(selector),r=el?.getBoundingClientRect();return el&&r?{height:r.height,display:getComputedStyle(el).display,visibility:getComputedStyle(el).visibility}:null;};
   return{attack:box('#hit'),end:box('#endturn'),width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,icons:[...document.querySelectorAll('.v2-skill-icon')].map(el=>({src:el.getAttribute('src')||el.querySelector('img')?.getAttribute('src')||null,background:getComputedStyle(el).backgroundImage}))};
  });
  assert.ok(firstLayout.attack&&firstLayout.attack.height>=50&&firstLayout.attack.visibility!=='hidden','basic attack is large and visible');
  assert.ok(firstLayout.end&&firstLayout.end.height>=44&&firstLayout.end.visibility!=='hidden'&&firstLayout.end.display!=='none','End Turn is visible in the initial player turn');
  assert.ok(firstLayout.scrollWidth<=firstLayout.width,'V2 battle has no horizontal overflow on 390px mobile');
  assert.ok(firstLayout.icons.some(icon=>!!icon.src||icon.background!=='none'),'skill slots render class atlas or skill-specific artwork');
  await page.locator('[data-action="dismiss-turn-tutorial"]').click();
  await page.locator('#hit').click();
  await page.waitForFunction(()=>document.querySelector('.tb-turn-tutorial-card')?.innerText.includes('ОЖИДАЕТСЯ: ЗАВЕРШИТЬ ХОД'),undefined,{timeout:10000});
  await page.locator('#endturn').click();
  await page.waitForFunction(()=>document.querySelector('.tb-turn-tutorial-card')?.innerText.includes('ОЖИДАЕТСЯ: УМЕНИЕ'),undefined,{timeout:10000});
  await page.waitForSelector('.v2-skill-btn:not([disabled])',{timeout:10000});
  await page.locator('.v2-skill-btn:not([disabled])').first().click();
  await page.waitForFunction(()=>document.querySelector('.tb-turn-tutorial-card')?.innerText.includes('ОЖИДАЕТСЯ: ЗАВЕРШИТЬ ХОД'),undefined,{timeout:10000});
  await page.locator('#endturn').click();
  await page.waitForSelector('.tb-turn-tutorial',{state:'detached',timeout:10000});
  const enemy=page.locator('.v2-enemy-card').first(),targetId=await enemy.getAttribute('data-target');
  await enemy.click();
  assert.ok(await page.locator('.v2-enemy-card[data-target="'+targetId+'"]').evaluate(el=>el.classList.contains('selected')),'tap selects an enemy in the V2 battle');
  const hpBefore=await page.locator('.v2-enemy-card[data-target="'+targetId+'"] .v2-enemy-hp-text').innerText();
  await page.locator('#hit').click();
  await page.waitForFunction(({targetId,hpBefore})=>{
   const node=document.querySelector('.v2-enemy-card[data-target="'+targetId+'"] .v2-enemy-hp-text');
   return node&&node.textContent!==hpBefore;
  },{targetId,hpBefore},{timeout:5000});
  const hpBeforeEnemyTurn=await page.evaluate(()=>window.TowerboundRework.state.characters[0].run.playerHp);
  await page.locator('#endturn').click();
  await page.waitForFunction(()=>document.querySelector('#endturn')?.disabled,undefined,{timeout:5000});
  try{
   await page.waitForFunction(()=>{const b=document.querySelector('#endturn');return b&&!b.disabled&&b.textContent.includes('ЗАВЕРШИТЬ ХОД');},undefined,{timeout:15000});
  }catch(error){
   const handoff=await page.evaluate(()=>({
    button:document.querySelector('#endturn')?{text:document.querySelector('#endturn').textContent,disabled:document.querySelector('#endturn').disabled,html:document.querySelector('#endturn').outerHTML}:null,
    guidance:document.querySelector('.v2-turn-guidance')?.textContent||null,
    playerHp:window.TowerboundRework?.state?.characters?.[0]?.run?.playerHp,
    stage:window.TowerboundRework?.state?.characters?.[0]?.run?.stage,
    livingEnemies:[...document.querySelectorAll('.v2-enemy-card')].map(el=>({target:el.dataset.target,text:el.innerText.slice(0,180)})),
    battleText:document.querySelector('.v2-battle-wrap')?.innerText.slice(0,1800)||null
   }));
   process.stderr.write('END TURN HANDOFF DIAGNOSTIC '+JSON.stringify({handoff,errors,consoleErrors})+'\\n');
   throw error;
  }
  const hpAfterEnemyTurn=await page.evaluate(()=>window.TowerboundRework.state.characters[0].run.playerHp);
  assert.ok(hpAfterEnemyTurn<hpBeforeEnemyTurn,'enemy phase attacks before returning control to the player');
  const endAfter=await page.locator('#endturn').evaluate(el=>({display:getComputedStyle(el).display,visibility:getComputedStyle(el).visibility,height:el.getBoundingClientRect().height}));
  assert.ok(endAfter.display!=='none'&&endAfter.visibility!=='hidden'&&endAfter.height>=44,'End Turn remains visible after enemy phase');
  await page.setViewportSize({width:430,height:932});
  const wide=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,end:document.querySelector('#endturn')?.getBoundingClientRect().toJSON()}));
  assert.ok(wide.scrollWidth<=wide.width,'V2 battle has no horizontal overflow on 430px mobile');
  assert.ok(wide.end&&wide.end.height>=44,'End Turn remains reachable on 430px mobile');
  await page.evaluate(()=>{const c=window.TowerboundRework.state.characters[0];c.run.playerHp=1;window.saveTowerboundRework();});
  await page.setViewportSize({width:390,height:844});
  await page.locator('#endturn').click();
  await page.waitForSelector('[data-action="confirm-death"]',{timeout:10000});
  assert.match(await page.locator('.tb-death-overlay').innerText(),/Персонаж погиб/,'lethal enemy damage opens the death overlay');
  assert.deepEqual(errors,[],'browser runtime must not throw uncaught errors');
  console.log('V2 RPG smoke passed: enemy cards, six skill slots, skill icons, visible Attack/End Turn controls, turn handoff and mobile layout.');
}finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exit(1);});

// Auth gate regression: inline overlay visibility is required even when app styles are overridden.
