'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createEngine}=require('../rpg-rework-v2.js');
const names=['combat','xp_curve','map','elite_mechanics','death','healing','auto_battle','drop_tables','equipment','economy','heroic','pvp','classes','skill_effects','mobs','bosses','character_curves','item_level','bp','difficulty','materials','account','stash','tutorial','achievements','lore','settings','seasons','paragon','pvp_store','resources','skills','combos','procs','run_modifiers','heroic_mobs','chapters','weekly_quests','cosmetics','skill_combos'];
const balance=Object.fromEntries(names.map(n=>[n,JSON.parse(fs.readFileSync(path.join(__dirname,'../configs/balance',n+'.json'),'utf8'))]));
const make=()=>createEngine(balance,{random:()=>0.1,now:()=>Date.UTC(2026,10,4,12)});
const beginTestStage=(engine,characterId,stage)=>{
 const live=engine.state.characters.find(x=>x.id===characterId);
 if(!live.run.runModifierId){
  live.run.offeredModifierIds=['arcane_hunt','last_stand','elite_bounty'];
  engine.setRunModifier(characterId,'arcane_hunt');
 }
 return engine.beginStage(characterId,stage);
};
{
 const e=make(),c=e.createCharacter('Modifier QA','assassin');
 const options=e.runModifierOptions(c.id);
 assert.equal(options.length,3,'exactly three run modifiers are offered');
 assert.ok(options.some(x=>x.id==='iron_skin'));
 e.setRunModifier(c.id,'iron_skin');
 const plan=beginTestStage(e,c.id,1);
 assert.ok(plan.mobs.every(x=>x.runShieldFraction===0.25),'iron-skin shield applies to all mobs');
 e.state.account.diamonds=50;
 e.state.characters[0].run.playerHp=0;
 const revived=e.reviveFromDeath(c.id);
 assert.equal(revived.price,5,'revive price at stage 1 is clamped to 5');
 assert.equal(revived.hp,Math.round(e.maxHp(c)*0.5));
 e.state.characters[0].run.playerHp=0;
 assert.throws(()=>e.reviveFromDeath(c.id),/already used/);
 assert.throws(()=>e.setRunModifier(c.id,'elite_bounty'),/before starting a run/);
}
{
 const e=make(),c=e.createCharacter('Weekly QA','bishop');
 e.recordWeeklyProgress(c.id,'elite_kills',20);
 const q=e.weeklySnapshot(c.id).find(x=>x.id==='elite');
 assert.equal(q.complete,true);
 assert.ok(q.week,'weekly snapshot carries the ISO week key');
 const alt=e.createCharacter('Weekly Shared','duelist');
 e.recordWeeklyProgress(alt.id,'boss_kills',1);
 assert.equal(e.weeklySnapshot(c.id).find(x=>x.id==='bosses').progress,1,'weekly progress is account-wide');
 e.state.account.diamonds=0;
 const reward=e.claimWeeklyQuest(c.id,'elite');
 assert.equal(reward.diamonds,2);
 assert.equal(e.state.account.diamonds,2);
 assert.throws(()=>e.claimWeeklyQuest(c.id,'elite'),/not ready/);
}
{
 const e=make(),created=e.createCharacter('Salvage QA','assassin'),c=e.state.characters.find(x=>x.id===created.id);
 e.saveSettings({autoSalvage:true,autoSalvageBelow:120});
 const loot=e.rollLoot(c,{type:'normal'},1,false,false);
 assert.ok(loot.some(x=>x.autoSalvaged),'low-ilvl normal drops are converted immediately');
 assert.ok(c.bag.some(x=>x.type==='craft_material'),'salvage materials are added to the bag');
 assert.equal(c.bag.some(x=>x.rarity==='Обычная'||x.rarity==='Редкая'),false);
 assert.equal(e.weeklySnapshot(c.id).find(x=>x.id==='salvage').progress,1,'auto-salvage counts toward the weekly quest');
}
{
 const e=make(),old=e.createCharacter('Legacy Veteran','assassin');
 e.state.characters[0].level=100;
 const fresh=e.createCharacter('Legacy Heir','bishop');
 const heir=e.state.characters.find(x=>x.id===fresh.id);
 assert.equal(heir.legacyBonus,0.5);
 assert.equal(heir.legacyBonusUntil,50);
 assert.equal(heir.gear.filter(Boolean).length,6,'legacy character receives a full epic set');
 const gained=e.awardXp(heir,100);
 assert.equal(gained.amount,150,'legacy XP is boosted by 50% below level 50');
}
{
 const e=make(),created=e.createCharacter('Fusion QA','assassin'),c=e.state.characters.find(x=>x.id===created.id),type=balance.equipment.stone_types[0];
 for(let i=0;i<5;i++)c.bag.push({id:'stone-'+i,type:'enhancement_stone',stoneType:type,level:4});
 const fused=e.mergeStones(c.id,type,4);
 assert.equal(fused.level,5);
 assert.equal(c.bag.filter(x=>x.type==='enhancement_stone'&&x.level===4).length,0);
}
{
 const e=make(),c=e.createCharacter('Cosmetic QA','duelist');
 e.state.account.diamonds=100;
 const item=e.buyCosmeticChest('weapon');
 assert.ok(e.state.account.cosmetics.includes(item.id));
 assert.equal(e.equipCosmetic(item.id).id,item.id);
 assert.equal(e.state.account.activeCosmetics.weapon_skin,item.id);
}
{
 const e=make(),c=e.createCharacter('PvP QA','shaman');
 e.matchmakePvp(c.id);
 const snapshot=e.pvpSnapshot(c.id);
 assert.equal(snapshot.normalized,true);
 assert.equal(snapshot.gearImpact,false);
 const result=e.simulatePvpDuel(c.id);
 assert.equal(result.normalized,true);
 assert.ok(result.stats.maxHp>0&&result.stats.attack>0);
 assert.ok(result.tier,'normalization is applied against the current PvP rank');
}
{
 const e=make(),created=e.createCharacter('Chapter QA','dragonkin'),c=e.state.characters.find(x=>x.id===created.id);
 assert.equal(e.chapterForStage(1).id,1);
 assert.equal(e.chapterForStage(250).id,5);
 c.heroic=true;
 const plan=e.stagePlan(c,1);
 assert.deepEqual(plan.mobs.slice(0,3).map(x=>x.heroicTrait),['medic','volatile','reflector']);
}
{
 const e=make(),created=e.createCharacter('Weekly Run QA','assassin'),c=e.state.characters.find(x=>x.id===created.id);
 c.run.weeklyCompletionCounted=true;
 beginTestStage(e,c.id,1);
 assert.equal(c.run.weeklyCompletionCounted,false,'a new run can count toward weekly run quests again');
}
console.log('2000h integration: OK · modifiers · revive · weekly · auto-salvage · legacy · fusion · PvP · chapters · heroic mobs · cosmetics');
