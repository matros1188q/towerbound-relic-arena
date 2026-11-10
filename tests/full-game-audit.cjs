'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createEngine}=require('../rpg-rework-v2.js');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const root=path.join(__dirname,'..');
const balanceDir=path.join(root,'configs/balance');
const balance=Object.fromEntries(fs.readdirSync(balanceDir).filter(n=>n.endsWith('.json')).map(n=>[n.slice(0,-5),read('configs/balance/'+n)]));
const classes=read('configs/balance/classes.json').classes;
const skillManifest=read('configs/skills/manifest.json');
const skillCatalog=read('configs/skills/catalog.json');
const skills=Object.values(skillCatalog);
const skillById=new Map(skills.map(skill=>[skill.id,skill]));
const classIds=['assassin','bishop','dragonkin','destroyer','elemental','duelist','shaman'];
assert.deepEqual(Object.keys(classes).sort(),classIds.slice().sort(),'exactly seven playable classes are configured');
assert.equal(Object.keys(balance).length,40,'all 40 runtime balance files are loaded');
assert.equal(skillManifest.total_skills,420,'skill manifest declares 420 skills');
assert.equal(skills.length,420,'420 skill records are present');
assert.equal(new Set(skills.map(s=>s.id)).size,420,'skill IDs are unique');
assert.deepEqual(Object.keys(skillManifest.classes).sort(),classIds.slice().sort(),'all seven classes have skill branches');
for(const classId of classIds){
 const definition=classes[classId];
 assert.equal(definition.branches.length,3,classId+' has three specializations');
 assert.deepEqual(skillManifest.branches[classId],definition.branches.map(b=>b.id),classId+' branch manifest matches class config');
 for(const branch of definition.branches){
  assert.equal(branch.talents.length,10,classId+'/'+branch.id+' has ten talents');
  assert.ok(branch.talents.every(t=>t.max_rank===3),classId+'/'+branch.id+' talents have three ranks');
  assert.deepEqual(branch.set.bonuses.map(x=>x.pieces),[2,3,5],classId+'/'+branch.id+' set thresholds are 2/3/5');
  const branchSkills=skillManifest.classes[classId][branch.id];
  assert.equal(branchSkills.length,20,classId+'/'+branch.id+' has twenty skill entries');
  branchSkills.forEach((id,index)=>{
   const skill=skillById.get(id);
   assert.ok(skill&&skill.id===id,classId+'/'+branch.id+' skill catalog entry exists: '+id);
   assert.equal(skill.class_id,classId);
   assert.equal(skill.branch_id,branch.id);
   assert.equal(skill.unlock_level,skillManifest.levels[index]);
   const file=path.join(root,'configs/skills',classId,branch.id,'skill-'+String(index+1).padStart(2,'0')+'.json');
   assert.ok(fs.existsSync(file),'individual skill file exists: '+id);
   const detail=JSON.parse(fs.readFileSync(file,'utf8'));
   assert.equal(detail.id,id,'individual skill file ID matches catalog');
   assert.equal(detail.name,skill.name,'individual skill name matches catalog');
   assert.ok(detail.description&&detail.effect_template,'skill has readable description and effect');
  });
  const engine=createEngine(balance,{now:(()=>{let t=Date.UTC(2026,10,3);return()=>++t;})(),random:()=>0.2});
  const created=engine.createCharacter('Q'+classId.slice(0,3)+branch.id.slice(0,4),classId);
  const character=engine.state.characters.find(item=>item.id===created.id);assert.ok(character,'new character is in engine state');character.level=100;character.talentPoints=30;
  engine.chooseBranch(character.id,branch.id);
  assert.equal(engine.getSkillUnlocks(engine.getChar(character.id),skills).length,20,classId+'/'+branch.id+' unlocks all twenty specialization skills at level 100');
  for(const talent of branch.talents)for(let rank=0;rank<3;rank++)engine.useTalentPoint(character.id,talent.id);
  assert.equal(Object.values(engine.getChar(character.id).talents).reduce((a,b)=>a+b,0),30,classId+'/'+branch.id+' spends all thirty talent ranks');
  assert.ok(branch.talents.every(t=>engine.getChar(character.id).talents[t.id]===3),classId+'/'+branch.id+' all ten talents reach rank three');
 }
}
const map=balance.map;
assert.equal(map.total_stages,250,'tower has 250 stages');
let stagePlans=0,bossPlans=0;
for(const classId of classIds){
 const engine=createEngine(balance,{random:()=>0.2,now:()=>Date.UTC(2026,10,3)});
 const c=engine.createCharacter('Map '+classId.slice(0,12),classId);
 for(let stage=1;stage<=map.total_stages;stage++){
  const plan=engine.stagePlan(c,stage);stagePlans++;
  assert.equal(plan.stage,stage,classId+' stage plan index '+stage);
  assert.ok(plan.count===plan.mobs.length&&plan.count>0,classId+' stage '+stage+' mob count matches');
  if(stage%map.boss_every===0){
   bossPlans++;
   assert.equal(plan.count,1,'boss stage '+stage+' has exactly one target');
   assert.equal(plan.mobs[0].type,'boss','stage '+stage+' spawns a boss');
  }else{
   const range=map.gauntlet_ranges.find(x=>stage>=x.min&&stage<=x.max);
   assert.ok(range.allowed.includes(plan.count),classId+' stage '+stage+' count is permitted by its map bracket');
  }
  plan.mobs.forEach((mob,index)=>{
   assert.equal(mob.index,index);
   assert.ok(mob.weakness&&mob.resistance,'stage '+stage+' mob has elemental matchup data');
   assert.ok(['normal','elite','boss'].includes(mob.type),'stage '+stage+' mob type is valid');
  });
 }
 const stage1=engine.beginStage(c.id,1);
 assert.equal(stage1.stage,1);
 assert.equal(engine.getChar(c.id).run.active,true);
 const snapshot=engine.saveSnapshot();
 const restored=createEngine(balance,{state:JSON.parse(JSON.stringify(snapshot)),random:()=>0.2,now:()=>Date.UTC(2026,10,3)});
 assert.deepEqual(restored.saveSnapshot(),snapshot,classId+' save/restore round-trip preserves run, inventory and progress');
}
assert.equal(stagePlans,1750,'all 250 stages are planned for all seven classes');
assert.equal(bossPlans,175,'all 25 boss encounters are planned for each class');
for(const [manifestPath,expected] of [
 ['assets/characters/heroes/manifest.json',4],
 ['assets/characters/enemies/manifest.json',20],
 ['assets/characters/bosses/manifest.json',9],
 ['assets/skills/art-manifest.json',6],
 ['assets/synergies/art-manifest.json',15]
]){
 const manifest=read(manifestPath);
 assert.equal(manifest.assets.length,expected,manifestPath+' roster count');
 for(const asset of manifest.assets){
  const relative=asset.relative_path||asset.path;
  assert.ok(relative&&fs.existsSync(path.join(root,relative)),manifestPath+' references an existing asset: '+relative);
 }
}
const dedicatedClassPortraits=['dragonkin','elemental','duelist','shaman'];
for(const id of dedicatedClassPortraits){
 const image=path.join(root,'assets/characters/heroes',id+'.jpg');
 assert.ok(fs.existsSync(image),id+' has a dedicated portrait asset');
 assert.ok(fs.statSync(image).size>1024,id+' portrait is not an empty placeholder');
}
const crimsonRegent=path.join(root,'assets/characters/bosses/crimson-regent.jpg');
assert.ok(fs.existsSync(crimsonRegent),'Crimson Regent has a dedicated boss portrait');
assert.ok(fs.statSync(crimsonRegent).size>1024,'Crimson Regent portrait is not an empty placeholder');
// Native PWA phase-2 release checks: dedicated class/boss art, fixed tab navigation and origin-safe Supabase auth.
const uiSource=fs.readFileSync(path.join(root,'rpg-rework-ui.js'),'utf8');
for(const [classId,fileName] of Object.entries({dragonkin:'dragonkin.jpg',elemental:'elemental.jpg',duelist:'duelist.jpg',shaman:'shaman.jpg'})){
 assert.ok(uiSource.includes(classId+':"heroes/'+fileName+'"'),classId+' uses its own dedicated class portrait');
}
assert.ok(uiSource.includes('"bosses/crimson-regent.jpg"'),'Crimson Regent uses a dedicated boss portrait');
assert.ok(uiSource.includes('function ensureBottomNav()'),'fixed bottom navigation is installed by the RPG UI');
assert.ok(uiSource.includes('host.querySelector(".tb-turn-tutorial")'),'bottom navigation yields to the first-run battle tutorial');
for(const action of ['bottom-map','bottom-profile','bottom-shop','bottom-rating'])assert.ok(uiSource.includes('data-action="'+action+'"'),action+' navigation tab exists');
for(const label of ['Карта','Персонаж','Магазин','Рейтинг'])assert.ok(uiSource.includes(label),'bottom navigation label exists: '+label);
const cloudSource=fs.readFileSync(path.join(root,'towerbound-cloud.js'),'utf8');
assert.ok(cloudSource.includes('emailRedirectTo:window.location.origin+window.location.pathname'),'email confirmation redirect follows the current deployment URL');
assert.ok(cloudSource.includes('redirectTo:window.location.origin+window.location.pathname'),'OAuth redirect follows the current deployment URL');
// Native PWA phase-3 release checks: background music, independent SFX switch and combat recovery controls.
const pageSource=fs.readFileSync(path.join(root,'index.html'),'utf8');
const nativeCss=fs.readFileSync(path.join(root,'native-pwa.css'),'utf8');
const serviceWorker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const engineSource=fs.readFileSync(path.join(root,'rpg-rework-v2.js'),'utf8');
assert.match(pageSource,/<meta name="viewport" content="width=device-width, initial-scale=1\\.0, viewport-fit=cover, user-scalable=no">/,'iOS viewport is configured for edge-to-edge layout');
assert.match(pageSource,/<meta name="apple-mobile-web-app-capable" content="yes">/,'iOS standalone mode is enabled');
assert.match(pageSource,/<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">/,'iOS status bar style is configured');
assert.ok(nativeCss.includes('height:100dvh')&&nativeCss.includes('overflow:hidden')&&nativeCss.includes('overscroll-behavior:none'),'native app shell locks document scrolling at dynamic viewport height');
assert.ok(nativeCss.includes('padding-top:env(safe-area-inset-top')&&nativeCss.includes('padding-bottom:env(safe-area-inset-bottom'),'native app shell respects iOS safe areas');
assert.ok(nativeCss.includes('.tb-bottom-nav{position:fixed')&&nativeCss.includes('bottom:0')&&nativeCss.includes('display:flex'),'bottom tab bar is fixed above the home-indicator safe area');
assert.ok(serviceWorker.includes("const CACHE='towerbound-v20'"),'PWA shell cache was invalidated for the native release');
assert.ok(uiSource.includes('function syncMusic()')&&uiSource.includes('function unlockAudioAndMusic()'),'Web Audio ambient music and iOS gesture unlock are implemented');
assert.ok(uiSource.includes('prefs.music_enabled!==false')&&uiSource.includes('screen==="battle"?[73.42,110]:[55,82.41]'),'music switches between map ambience and battle ambience');
assert.ok(uiSource.includes('data-setting="music_enabled"')&&uiSource.includes('data-setting="sound_enabled"'),'music and sound effects have independent settings');
assert.ok(uiSource.includes('case "reset-current-battle"')&&uiSource.includes('function ensureBottomNav()'),'recovery action and tab navigation are wired into the app');
assert.ok(engineSource.includes('function sanitizeActiveStage')&&engineSource.includes('selectTarget'),'saved dead-target states are sanitized before resuming combat');
const relicDir=path.join(root,'assets/relics');
const relics=fs.readdirSync(relicDir).filter(name=>name.endsWith('.png')&&!name.startsWith('_'));
assert.ok(relics.length>=30,'relic image collection contains at least thirty unique PNG assets');
for(const file of relics)assert.ok(fs.statSync(path.join(relicDir,file)).size>1024,'relic asset is not an empty placeholder: '+file);
const achievements=read('configs/balance/achievements.json').achievements;
assert.ok(achievements.length>=30,'achievement catalogue is populated');
assert.equal(read('configs/balance/tutorial.json').steps_data.length,6,'six tutorial steps exist');
assert.equal(read('configs/balance/death.json').lives_per_run,1,'base death config is consistent; difficulty overrides are tested separately');
assert.deepEqual(read('configs/balance/equipment.json').set_bonus_thresholds,[2,3,5]);
console.log('FULL GAME AUDIT PASS: 40 balance configs; 7 classes; 21 specializations; 210 talents/ranks; 420 skill records + 420 individual files; 1,750 stage plans; 175 boss plans; save/restore for every class; 59 character/UI art assets checked; relic assets; achievements, tutorial, death and equipment config.');
