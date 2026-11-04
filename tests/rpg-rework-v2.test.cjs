'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createEngine}=require('../rpg-rework-v2.js');

const configNames=[
 'combat','xp_curve','map','elite_mechanics','death','healing','auto_battle','drop_tables',
 'equipment','economy','heroic','pvp','classes','skill_effects','mobs','bosses',
 'character_curves','item_level','bp','difficulty','materials','account','stash',
 'tutorial','achievements','lore','settings','seasons','paragon','pvp_store'
];
const balance=Object.fromEntries(configNames.map(name=>[
 name,JSON.parse(fs.readFileSync(path.join(__dirname,'../configs/balance/'+name+'.json'),'utf8'))
]));
let tick=0;
const baseTime=Date.UTC(2026,10,3,9);
const now=()=>baseTime+(tick++);
const makeEngine=(random=()=>0.2)=>createEngine(balance,{now,random});
const makeCharacter=(engine,name='QA Hero',classId='assassin')=>engine.createCharacter(name,classId);
const equipSix=(character,rarity='Эпическая')=>{
 character.gear=['weapon','chest','head','legs','hands','accessory'].map((slot,index)=>({
  id:'qa-'+slot+'-'+index,slot,itemLevel:120,rarity,stats:{attack:0,defense:0,health:0},
  refine:0,sockets:[],socketsAvailable:0
 }));
};

assert.equal(configNames.length,30,'all runtime balance configs are covered');
for(const name of configNames)assert.ok(balance[name]&&typeof balance[name]==='object',name+' config parsed');

{
 const e=makeEngine(),c=makeCharacter(e),live=e.state.characters[0];
 assert.equal(c.level,1);
 assert.equal(c.silver,100,'a new level-one character starts with 100 silver');
 assert.equal(c.bag.find(item=>item.type==='healing_potion').quantity,3,'three healing potions are granted to every new character');
 const starterSkill=balance.classes.classes.assassin.base_skills.find(skill=>skill.type==='active'&&skill.unlock_level===1);
 assert.equal(c.activeSkillId,starterSkill.id,'level one starts with an active class skill');
 assert.ok(c.skillLoadout.includes(starterSkill.id),'the level-one skill is assigned to the combat bar');
 assert.ok(e.state.account.premiumUntil>now(),'one-time 24h account premium was granted');
 assert.equal(e.accountLevel(),1);
 e.awardXp(live,2_000_000);
 assert.equal(e.accountLevel(),2);
 assert.throws(()=>{for(let i=0;i<5;i++)makeCharacter(e,'Extra '+i,'bishop');},/Maximum of 5/);
 assert.equal(balance.account.level_cap,50);
 assert.equal(balance.account.xp_per_level,2_000_000);
 assert.equal(balance.account.xp_silver_bonus_per_level,0.01);
}
{
 const e=makeEngine(),c=makeCharacter(e),live=e.state.characters[0];
 live.progress.highestEver=20;live.progress.currentStage=21;
 assert.equal(e.speed2Allowed(c.id,20),true);
 assert.equal(e.speed2Allowed(c.id,21),false);
 if(balance.combat.turn_based?.enabled){
  assert.equal(e.combatIntervalMs(c.id),1000,'turn-based action cadence is one second per turn');
  assert.equal(balance.combat.attack_interval_units,'turns');
  assert.equal(balance.combat.turn_based.enabled,true);
 }else{
  assert.equal(e.combatIntervalMs(c.id),2500);
  e.setSpeed2(c.id,true,20);
  assert.equal(e.combatIntervalMs(c.id),1250);
  assert.equal(e.xpMultiplier(e.getChar(c.id),20,{speed2:true}),0.4);
  assert.throws(()=>e.xpMultiplier(e.getChar(c.id),21,{speed2:true}),/disabled/);
  assert.equal(balance.combat.combat_speed_base,0.5);
  assert.equal(balance.combat.speed_2x_multiplier,2);
  assert.equal(balance.combat.speed_2x_experience_multiplier,0.8);
  assert.equal(balance.combat.attack_interval,2.5);
 }
}
{
 const e=makeEngine(),c=makeCharacter(e),live=e.state.characters[0];
 const turnHpScale=balance.combat.turn_based?.player_hp_multiplier??1;
 assert.ok(Math.abs(e.maxHp(live)-Math.round(500/1.5*turnHpScale))<=1);
 live.level=75;equipSix(live,'Эпическая');
 const stats=e.getCombatStats(live);
 assert.ok(Math.abs(stats.maxHp-50000*turnHpScale)<200,'gear-inclusive HP curve respects the selected combat mode');
 assert.ok(Math.abs(stats.dps-4400)<20,'gear-inclusive DPS curve restored by six ilvl120 items');
 assert.equal(e.combatPower(live),25580);
 live.level=100;equipSix(live,'Легендарная');
 assert.equal(e.combatPower(live),65440);
 assert.equal(balance.item_level.max,120);
 assert.equal(balance.item_level.stat_bonus_per_level,0.0007);
 assert.equal(balance.item_level.full_set_level_120_bonus,0.504);
 assert.equal(balance.character_curves.base_divisor,1.5);
}
{
 const e=makeEngine(()=>0.9),c=makeCharacter(e);
 assert.equal(e.stagePlan(c,1).count,5);
 assert.equal(e.stagePlan(c,25).count,5,'no 7-mob gauntlets on 1–50');
 assert.equal(e.stagePlan(c,75).count,7);
 assert.equal(e.stagePlan(c,151).count,5,'no 7-mob gauntlets on non-boss stages 101–199');
 assert.equal(e.stagePlan(c,225).count,7);
 for(const stage of [10,20,30,40,50]){const plan=e.stagePlan(c,stage);assert.equal(plan.count,1);assert.equal(plan.mobs[0].type,'boss');}
 assert.deepEqual(balance.map.gauntlet_ranges.map(range=>range.allowed),[[3,5],[3,5,7],[3,5],[3,5,7]]);
 assert.deepEqual(balance.map.gauntlet_ranges[1].weights,[0.5,0.3,0.2]);
}
{
 const e=makeEngine(),c=makeCharacter(e);
 const normal=e.getEnemyStats(c.id,50,{type:'normal'});
 const elite=e.getEnemyStats(c.id,50,{type:'elite'});
 const boss=e.getEnemyStats(c.id,50,{type:'boss'});
 if(balance.combat.turn_based?.enabled){
  assert.deepEqual([normal.hp,normal.damage],[183,50]);
  assert.deepEqual([elite.hp,elite.damage],[549,75]);
  assert.deepEqual([boss.hp,boss.damage],[1098,125]);
  assert.equal(normal.attackInterval,1);
  assert.equal(boss.attackIntervalMs,1000);
  const newbieBoss=e.getEnemyStats(c.id,10,{type:'boss'});
  assert.equal(newbieBoss.damage,40,'map10 newbie boss keeps the configured damage exception');
 }else{
  assert.deepEqual([normal.hp,normal.damage],[550,150]);
  assert.deepEqual([elite.hp,elite.damage],[1650,225]);
  assert.deepEqual([boss.hp,boss.damage],[3300,375]);
  assert.equal(normal.attackInterval,2.5);
  assert.equal(boss.attackIntervalMs,2500);
  const newbieBoss=e.getEnemyStats(c.id,10,{type:'boss'});
  assert.equal(newbieBoss.damage,120,'map10 newbie boss is the explicit exception');
 }
 assert.equal(balance.mobs.elite.hp_multiplier,3);
 assert.equal(balance.mobs.elite.damage_multiplier,1.5);
 assert.equal(balance.bosses.hp_multiplier,6);
 assert.equal(balance.bosses.damage_multiplier,2.5);
 assert.equal(balance.bosses.attack_interval_seconds,balance.combat.turn_based?.enabled?1:2.5);
 assert.equal(balance.combat.enemy_hp.elite_multiplier,3);
 assert.equal(balance.combat.enemy_hp.boss_multiplier,6);
 assert.equal(balance.combat.enemy_damage.elite_multiplier,1.5);
 assert.equal(balance.combat.enemy_damage.boss_multiplier,2.5);
}
if(balance.combat.turn_based?.enabled){
 assert.equal(balance.combat.turn_based.player_turn_actions.potions,1,'turn-based mode permits one potion per player turn');
 assert.equal(balance.healing.potion_heal_fraction,0.4);
}else{
 const e=makeEngine(),c=makeCharacter(e),live=e.state.characters[0];
 live.level=16;equipSix(live);
 const stats=e.getCombatStats(live),boss=e.getEnemyStats(c.id,50,{type:'boss'});
 const strikes=Math.ceil(boss.hp/stats.attack);
 const incoming=Math.round(boss.damage*e.mitigationMultiplier(stats.defense,50));
 let withoutPotion=stats.maxHp;
 for(let hit=0;hit<strikes;hit++)withoutPotion-=incoming;
 let withPotion=stats.maxHp;
 for(let hit=0;hit<strikes;hit++){
  if(hit===Math.floor(strikes/2))withPotion=Math.min(stats.maxHp,withPotion+Math.round(stats.maxHp*0.4));
  withPotion-=incoming;
 }
 assert.ok(withoutPotion<=0,'map50 boss kills without a potion');
 assert.ok(withPotion>0,'40% max-HP potion lets the same build survive map50 boss');
 assert.equal(balance.healing.potion_heal_fraction,0.4);
}
if(balance.combat.turn_based?.enabled){
 const e=makeEngine(()=>0.9),c=makeCharacter(e),live=e.state.characters[0];
 live.level=24;equipSix(live);
 const plan=e.stagePlan(live,75);assert.equal(plan.count,7);
 assert.ok(plan.mobs.every(enemy=>enemy.role),'turn-based gauntlet mobs carry their role actions');
}else{
 const e=makeEngine(()=>0.9),c=makeCharacter(e),live=e.state.characters[0];
 live.level=24;equipSix(live);
 const plan=e.stagePlan(live,75);assert.equal(plan.count,7);
 const stats=e.getCombatStats(live);let hp=stats.maxHp;
 for(const enemy of plan.mobs){
  const enemyStats=e.getEnemyStats(c.id,75,enemy);
  const hits=Math.ceil(enemyStats.hp/stats.attack);
  for(let hit=0;hit<hits;hit++)hp-=Math.round(enemyStats.damage*e.mitigationMultiplier(stats.defense,75));
 }
 const remainingPercent=hp/stats.maxHp*100;
 assert.ok(remainingPercent>=44&&remainingPercent<=51,'7-mob gauntlet leaves 44–51% HP; remaining='+remainingPercent.toFixed(2));
}
{
 const e=makeEngine(),c=makeCharacter(e),live=e.state.characters[0];
 live.progress.highestEver=10;live.progress.currentStage=11;
 live.bag.push({id:'second-stack',type:'healing_potion',quantity:2});
 e.beginStage(c.id,11);live.run.playerHp=Math.round(e.maxHp(live)*0.2);
 const first=live.bag.find(item=>item.type==='healing_potion');
 e.assignPotionBelt(c.id,0,'second-stack');
 const beforeFirst=first.quantity;
 assert.equal(e.potionBeltSnapshot(c.id)[0].available,2);
 e.usePotionBelt(c.id,0);
 assert.equal(first.quantity,beforeFirst,'unassigned stack is never consumed');
 assert.equal(live.bag.find(item=>item.id==='second-stack').quantity,1);
 assert.equal(live.run.playerHp,Math.round(e.maxHp(live)*0.6));
 if(balance.combat.turn_based?.enabled){
  assert.equal(balance.healing.one_potion_per_enemy,false,'turn-based mode enforces potion use once per player turn in the UI');
  assert.equal(balance.combat.turn_based.player_turn_actions.potions,1);
 }else{
  assert.throws(()=>e.usePotionBelt(c.id,0),/slot/);
  assert.equal(balance.healing.one_potion_per_enemy,true);
 }
 assert.equal(balance.healing.potion_belt_slots,5);
 assert.equal(balance.healing.potion_stack_limit,25);
}
{
 const e=makeEngine(),c=makeCharacter(e),live=e.state.characters[0];
 e.setDifficulty(c.id,'hardcore');
 assert.throws(()=>e.assignPotionBelt(c.id,0,live.bag[0].id),/Hardcore/);
 assert.throws(()=>e.autoBattle(c.id),/Hardcore/);
 assert.throws(()=>e.checkpointHeal(c.id),/Hardcore/);
 e.setDifficulty(c.id,'easy');assert.equal(live.run.lives,3);
 e.setDifficulty(c.id,'normal');assert.equal(live.run.lives,1);
 e.beginStage(c.id,1);
 assert.throws(()=>e.setDifficulty(c.id,'easy'),/between runs/);
 assert.equal(balance.difficulty.modes.easy.xp_loss_fraction,0.1);
 assert.equal(balance.difficulty.modes.normal.xp_loss_fraction,0.3);
 assert.equal(balance.difficulty.modes.hardcore.xp_loss_fraction,0.5);
 assert.equal(balance.difficulty.modes.hardcore.auto_battle,false);
 assert.equal(balance.difficulty.modes.hardcore.potion_belt,false);
 assert.equal(balance.difficulty.modes.hardcore.checkpoints,false);
}
{
 const e=makeEngine(()=>0),c=makeCharacter(e),live=e.state.characters[0];
 live.run.active=true;live.run.id='death-test';live.run.experience=1000;
 live.bag.push(
  {id:'common',name:'Обычный трофей',rarity:'Обычная'},
  {id:'rare',name:'Редкий трофей',rarity:'Редкая'},
  {id:'epic',name:'Эпический трофей',rarity:'Эпическая'},
  {id:'boss',name:'Боссовый трофей',rarity:'Легендарная',bossLoot:true}
 );
 live.gear[0]={id:'equipped',rarity:'Легендарная'};
 const preview=e.deathPreview(c.id);assert.equal(preview.experienceLoss,300);
 assert.equal(preview.eligibleItems,3);
 const result=e.confirmDeath(c.id);
 assert.equal(result.experienceLoss,300);
 assert.equal(result.lostItem,'Обычный трофей');
 assert.ok(live.bag.some(item=>item.id==='boss'));
 assert.ok(live.gear.some(item=>item.id==='equipped'));
 assert.equal(result.runEnded,true);
 assert.equal(live.progress.currentStage,1);
 assert.deepEqual(balance.difficulty.item_loss_by_rarity.map(x=>x.weight),[50,25,15,8,2]);
}
{
 const e=makeEngine(()=>0),c=makeCharacter(e),live=e.state.characters[0];
 live.branch='bleed';
 live.bag.push({id:'materials-a',type:'craft_material',quantity:12},{id:'materials-b',type:'craft_material',quantity:8});
 const type={id:'assassin.bleed.weapon',class_id:'assassin',branch_id:'bleed',slot:'weapon',attack_per_level:1.5};
 const stone=e.craftStone(c.id,type);
 assert.equal(stone.level,1);assert.equal(stone.type,'enhancement_stone');
 assert.equal(live.bag.filter(item=>item.type==='craft_material').length,0);
 live.bag.push(...Array.from({length:5},(_,i)=>({id:'merge-'+i,type:'enhancement_stone',stoneType:type,level:1})));
 assert.equal(e.mergeStones(c.id,type,1).level,2);
 assert.equal(balance.materials.stone_crafting.materials_per_level_1,20);
 assert.equal(balance.materials.stone_crafting.merge_count,5);
 assert.equal(balance.materials.drops.elite_materials,10);
 assert.equal(balance.materials.drops.boss_materials,50);
}
{
 const testBalance=JSON.parse(JSON.stringify(balance));
 testBalance.equipment.chisel_drop_chance=1;testBalance.equipment.stone_drop_chance=1;
 testBalance.equipment.enchantment.armor_scroll_chance=1;testBalance.equipment.enchantment.weapon_scroll_chance=1;
 const e=createEngine(testBalance,{now,random:()=>0}),c=makeCharacter(e),live=e.state.characters[0];
 live.branch=testBalance.equipment.stone_types.find(type=>type.class_id==='assassin').branch_id;live.heroic=true;live.progress.highestEver=100;live.progress.currentStage=101;
 const seasonId=Math.floor(baseTime/(90*86400000));e.state.season={id:seasonId,modifier:null,firstClearRewardClaimed:false};
 const plan=e.beginStage(c.id,101);
 assert.equal(plan.stage,101);
 live.run.stage.mobs[0]={type:'elite',statMultiplier:1,damageType:'physical'};
 assert.equal(e.currentEnemy(live).type,'elite');
 assert.equal(live.branch,testBalance.equipment.stone_types.find(type=>type.class_id==='assassin').branch_id);
 const drop=e.finishEnemy(c.id);
 assert.ok(drop.loot.some(item=>item.type==='chisel'));
 assert.ok(drop.loot.some(item=>item.type==='craft_material'&&item.quantity===10));
 const ordinary=e.dropEligibility({type:'normal'},101,false),ordinaryHero=e.dropEligibility({type:'normal'},101,true);
 const elite=e.dropEligibility({type:'elite'},101,true),boss=e.dropEligibility({type:'boss'},99,true);
 assert.equal(ordinary.enhancementStone,false,'regular enemies never drop enhancement stones');
 assert.equal(ordinaryHero.armorScroll,true,'any heroic enemy can drop armor enchantment');
 assert.equal(ordinaryHero.weaponScroll,false,'regular heroic enemy cannot drop weapon enchantment');
 assert.equal(elite.enhancementStone,true,'elite unlocks enhancement stone at stage100');
 assert.equal(elite.weaponScroll,true,'heroic elite can drop weapon enchantment');
 assert.equal(boss.enhancementStone,false,'elite/boss enhancement stones are locked before stage100');
 assert.equal(boss.craftMaterials,50,'boss adds 50 crafting materials');
 assert.equal(balance.equipment.chisel_drop_chance,0.02);
 assert.equal(balance.equipment.stone_drop_chance,0.05);
 assert.equal(balance.equipment.stone_unlock_stage,100);
 assert.equal(balance.equipment.enchantment.armor_scroll_chance,0.02);
 assert.equal(balance.equipment.enchantment.weapon_scroll_chance,0.01);
}
{
 const e=makeEngine(),assassin=makeCharacter(e),bishop=makeCharacter(e,'Healer','bishop'),dragon=makeCharacter(e,'Frost','dragonkin');
 assert.equal(e.applyVampirism(assassin.id,10000).fraction,0.0175);
 assert.equal(e.applyVampirism(bishop.id,10000).fraction,0);
 e.state.characters.find(item=>item.id===dragon.id).level=10;
 e.chooseBranch(dragon.id,'ice_dragon');
 assert.equal(e.applyVampirism(dragon.id,10000).fraction,0.01);
 assert.equal(balance.combat.vampirism.damage_dealer_fraction,0.0175);
}
{
 const e=makeEngine(),c=makeCharacter(e),live=e.state.characters[0];
 live.level=75;equipSix(live,'Эпическая');
 assert.equal(e.combatPower(live),25580);
 live.level=100;equipSix(live,'Легендарная');
 assert.equal(e.combatPower(live),65440);
 assert.deepEqual(balance.bp.tiers.map(t=>[t.min,t.max]),[[0,1999],[2000,7999],[8000,19999],[20000,44999],[45000,null]]);
 assert.equal(balance.bp.heroic_min_bp,15000);
}
{
 const e=makeEngine(),c=makeCharacter(e);
 const opponent=e.matchmakePvp(c.id);
 assert.equal(opponent.bot,true);
 const reward=e.resolvePvpDuel(c.id,true);
 assert.equal(reward.pointsAwarded,20);
 assert.equal(e.state.account.pvpPoints,20);
 assert.equal(balance.pvp.daily_duels.free,5);
 assert.equal(balance.pvp.daily_duels.premium,10);
 assert.equal(balance.pvp.ghost_ttl_days,7);
 e.state.account.pvpPoints=1000;
 assert.equal(e.purchasePvpItem(c.id,'pvp_talent_reset').item.id,'pvp_talent_reset');
 assert.equal(e.purchasePvpItem(c.id,'pvp_xp_potion').item.id,'pvp_xp_potion');
 e.state.account.pvpPoints=6000;
 assert.equal(e.purchasePvpItem(c.id,'class_epic_assassin').item.itemLevel,120);
 assert.deepEqual(e.state.account.classEpics,['assassin']);
 assert.throws(()=>e.purchasePvpItem(c.id,'class_epic_assassin'),/already been claimed/);
 assert.equal(balance.pvp_store.consumables.talent_reset,300);
 assert.equal(balance.pvp_store.consumables.xp_potion,100);
}
{
 const e=makeEngine(),c=makeCharacter(e);
 const snapshot=e.publishGhostSnapshot(c.id,'exit');
 assert.equal(snapshot.reason,'exit');
 assert.ok(snapshot.expiresAt>now());
 assert.equal(e.submitWeeklyRating(c.id).length,1);
 assert.equal(e.weeklyLeaderboard().length,1);
 assert.equal(balance.seasons.modifiers.length,4);
 assert.equal(balance.seasons.season_length_days,90);
}
{
 const e=makeEngine(),c=makeCharacter(e),live=e.state.characters[0];
 assert.equal(balance.achievements.achievements.length,30);
 assert.equal(balance.lore.entries.length,25);
 assert.equal(balance.tutorial.steps,6);
 assert.equal(balance.tutorial.reward.silver,100);
 assert.equal(balance.settings.combat_log_max_events,20);
 assert.deepEqual(balance.settings.languages,['ru','en']);
 assert.equal(balance.stash.slots,20);
 assert.equal(balance.stash.transfer_limit_per_item_per_day,1);
 assert.equal(balance.paragon.xp_per_point,500000);
 assert.equal(balance.paragon.max_level,100);
 live.level=100;live.paragon={level:1,xp:500000,stats:{attack:1}};live.silver=5000;
 e.resetParagon(c.id);assert.deepEqual(live.paragon.stats,{});
 e.logCombatEvent(c.id,'test event');assert.equal(live.combatLog.length,1);
 e.tutorialStep(c.id,'skip');e.claimTutorialReward(c.id);
 assert.ok(live.silver>=100);
 live.progress.highestEver=250;
 const lore=balance.lore.entries[0];
 const reward=e.readLore(c.id,lore.id);
 assert.equal(reward.xp,100);
}
{
 const e=makeEngine(),c=makeCharacter(e),live=e.state.characters[0];
 live.bag.push({id:'epic-stash',name:'Stash epic',rarity:'Эпическая',stats:{attack:1},itemLevel:120});
 e.stashDeposit(c.id,'epic-stash');
 assert.equal(e.state.stash.length,1);
 e.stashWithdraw(c.id,'epic-stash');
 assert.equal(e.bindItemOnUse(c.id,'epic-stash').bound,true);
 assert.throws(()=>e.stashWithdraw(c.id,'epic-stash'),/Stash item not found/);
}
{
 const e=makeEngine(),c=makeCharacter(e),live=e.state.characters[0];
 live.run.active=true;assert.throws(()=>e.setDifficulty(c.id,'easy'),/between runs/);
 live.run.active=false;e.deleteCharacter(c.id,live.name,true);
 assert.equal(e.state.characters.length,0);
}
{
 const e=makeEngine(),c=makeCharacter(e);
 assert.equal(balance.economy.silver_store.heal_25,20);
 assert.deepEqual([balance.economy.silver_store.premium_7d,balance.economy.silver_store.premium_14d,balance.economy.silver_store.premium_30d],[20000,35000,60000]);
 assert.deepEqual(balance.mobs.silver_brackets.map(x=>x.amount),[4,6,9,12,16]);
 assert.equal(balance.xp_curve.post_75_xp_per_level,2500000);
 assert.equal(balance.xp_curve.post_75_levels,25);
 assert.equal(balance.xp_curve.post_75_total_xp,62500000);
}
{
 const e=makeEngine(()=>0.2),c=makeCharacter(e),live=e.state.characters[0];
 const daily=e.dailySnapshot(c.id).modifier;
 e.beginStage(c.id,1);
 assert.deepEqual(live.run.dailyModifier,daily,'daily map modifier is frozen when a run begins');
 const enemy=e.getEnemyStats(c.id,1,{type:'normal'});
 const seasonal=live.run.season?.modifier;
 const speedFactors=[seasonal,daily].filter(Boolean).filter((m,i,all)=>all.findIndex(x=>x.id===m.id)===i).map(m=>m.enemy_attack_speed_multiplier||1);
 const factor=speedFactors.reduce((a,b)=>a*b,1);
 assert.equal(enemy.attackIntervalMs,Math.round(2500/factor),'daily and seasonal attack-speed modifiers reach live combat');
 live.run.dailyModifier={id:'boss_no_heal',boss_no_potion:true};
 live.run.stage.mobs[live.run.stage.enemyIndex]={type:'boss'};
 assert.throws(()=>e.useHealingPotion(c.id),/modifier disables potions/,'daily boss-no-potion rule is enforced');
}
{
 const e=makeEngine(()=>0.9),c=makeCharacter(e),live=e.state.characters[0];
 live.progress.highestEver=1;live.progress.currentStage=2;
 e.beginStage(c.id,1);
 live.run.stage.mobs=[{type:'normal',statMultiplier:1}];live.run.stage.enemyIndex=0;
 const result=e.finishEnemy(c.id,{speed2:true});
 assert.equal(result.stageComplete,true);
 assert.equal(live.stats.speed_runs,1,'speed-run achievement counts repeat-stage clear once, never first-clear');
}
{
 const skills=JSON.parse(fs.readFileSync(path.join(__dirname,'../configs/skills/catalog.json'),'utf8'));
 assert.equal(skills.length,420);
 const branches={};for(const skill of skills){const key=skill.class_id+'/'+skill.branch_id;branches[key]=(branches[key]||0)+1;}
 assert.equal(Object.keys(branches).length,21);
 assert.ok(Object.values(branches).every(count=>count===20));
}
{
 const e=makeEngine(()=>0.2),c=makeCharacter(e),live=e.state.characters[0];
 live.progress.highestEver=3;live.progress.currentStage=4;
 e.beginStage(c.id,3);
 live.run.stage.mobs[0]={...live.run.stage.mobs[0],type:'boss'};
 const result=e.finishEnemy(c.id,{targetIndex:0});
 assert.ok(result.loot.some(item=>['Редкая','Эпическая'].includes(item.rarity)),'every boss from stage 3 guarantees rare or epic loot, including repeat clears');
}
console.log('RPG balance/content checks passed: 30 configs, combat cadence, curves, bosses, gauntlets, item level/BP, belt, difficulty, death rarity, crafting, drop sources, vampirism, PvP, seasons, account progression and support systems.');
