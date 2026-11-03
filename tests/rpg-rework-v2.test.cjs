'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createEngine}=require('../rpg-rework-v2.js');
const names=['combat','xp_curve','map','elite_mechanics','death','healing','auto_battle','drop_tables','equipment','economy','heroic','pvp','classes','skill_effects'];
const balance=Object.fromEntries(names.map(name=>[name,JSON.parse(fs.readFileSync(path.join(__dirname,'../configs/balance/'+name+'.json'),'utf8'))]));
let tick=0;const now=()=>Date.UTC(2026,10,3)+tick++;const random=()=>0.2;
const engine=(randomSource=random)=>createEngine(balance,{now,random:randomSource});
const create=e=>e.createCharacter('QA Hero','assassin');
{
 const e=engine(),c=create(e);
 assert.equal(c.level,1);assert.equal(c.silver,300);assert.equal(c.bag[0].quantity,3);
 assert.ok(e.state.account.premiumUntil>now());assert.equal(e.levelForXp(1e9),100);
 assert.equal(e.speed2Allowed(c.id,1),false);
}
{
 const e=engine(),c=create(e),live=e.state.characters[0];live.progress.highestEver=20;live.progress.currentStage=21;
 assert.equal(e.speed2Allowed(c.id,20),true);
 assert.equal(e.xpMultiplier(e.getChar(c.id),20,{speed2:true}),0.4);
 assert.equal(e.xpMultiplier(e.getChar(c.id),21,{speed2:false}),1);
}
{
 const e=engine(),c=create(e);
 assert.equal(e.stagePlan(c,1).count,3);assert.equal(e.stagePlan(c,5).count,5);
 assert.equal(e.stagePlan(c,25).count,7);assert.equal(e.stagePlan(c,10).count,1);
 assert.equal(e.stagePlan(c,10).mobs[0].type,'boss');
}
{
 const e=engine(),c=create(e),live=e.state.characters[0];live.progress.highestEver=50;live.progress.currentStage=51;live.run.playerHp=50;
 const heal=e.checkpointHeal(c.id);
 assert.equal(heal.penaltyUntil,100);assert.equal(heal.remaining,50);
 assert.throws(()=>e.checkpointHeal(c.id),/penalty/);
 assert.equal(e.xpMultiplier(e.getChar(c.id),50),0.5);assert.equal(e.xpMultiplier(e.getChar(c.id),51),0.8);
}
{
 const e=engine(),c=create(e);e.beginStage(c.id,1);e.useHealingPotion(c.id);
 assert.throws(()=>e.useHealingPotion(c.id),/slot/);
 const result=e.finishEnemy(c.id);assert.equal(result.stageComplete,false);
}
{
 const e=engine(),c=create(e),live=e.state.characters[0];live.xp=50000;e.recalcLevel(live);live.progress.highestEver=18;live.progress.currentStage=19;
 live.run.active=true;live.run.id='run-a';live.run.experience=1000;live.run.foundItemIds=['found'];
 live.bag.push({id:'found',name:'Found',bossLoot:false});
 const result=e.deathPreview(c.id);assert.equal(result.experienceLoss,300);
 const died=e.confirmDeath(c.id);assert.equal(died.experienceLoss,300);
 const after=e.getChar(c.id);assert.equal(after.progress.currentStage,1);assert.equal(after.progress.highestEver,18);
}
{
 const e=engine(),c=create(e),live=e.state.characters[0];live.progress.highestEver=25;live.progress.currentStage=1;
 const result=e.autoBattle(c.id,{maxStages:3});assert.ok(result.cleared>0);assert.equal(result.xp>0,true);
}
{
 const e=engine(),c=create(e),live=e.state.characters[0];live.bag=Array.from({length:5},(_,i)=>({id:'s'+i,type:'enhancement_stone',stoneType:'branch-weapon',level:1}));
 const stone=e.mergeStones(c.id,'branch-weapon',1);assert.equal(stone.level,2);
}
{
 const e=engine(),c=create(e),live=e.state.characters[0];live.heroic=true;live.bag.push({id:'refine-stone',type:'refine_stone'});const weapon={id:'w',slot:'weapon',refine:0,sockets:[],stats:{}};live.gear[0]=weapon;
 assert.equal(e.refine(c.id,'w').success,true);assert.equal(e.getChar(c.id).gear[0].refine,1);
 assert.throws(()=>e.rollEnchantScroll(c.id,'w'),/enchantment scroll/);
 live.bag.push({id:'armor-scroll',type:'enchant_scroll',slot:'weapon'});
 const choices=e.rollEnchantScroll(c.id,'w');assert.equal(choices.length,4);
 assert.ok(e.getChar(c.id).bag.some(item=>item.id==='armor-scroll'),'scroll remains until enchantment is confirmed');
 e.applyEnchant(c.id,'w',0,choices);assert.ok(!e.getChar(c.id).bag.some(item=>item.id==='armor-scroll'),'scroll is spent when enchantment is applied');
}
{
 const e=engine(),c=create(e),other=e.createCharacter('Second','bishop');
 e.state.characters[0].silver=1000;const moved=e.transferSilver(c.id,other.id,500);
 assert.equal(moved.fee,50);assert.equal(moved.received,450);
 assert.throws(()=>e.transferSilver(c.id,other.id,1),/Daily transfer limit/);
}
{
 const e=engine(),c=create(e);e.state.characters[0].silver=10000;e.purchase(c.id,'silver','xp_10');
 assert.ok(e.getChar(c.id).bag.some(item=>item.type==='xp_10'));
 assert.deepEqual(balance.economy.diamond_packages,[[100,100],[300,269],[500,449],[1000,900],[5000,4500]]);
}
{
 const skills=JSON.parse(fs.readFileSync(path.join(__dirname,'../configs/skills/catalog.json'),'utf8'));
 assert.equal(skills.length,420);
 const counts={};for(const skill of skills){const k=skill.class_id+'/'+skill.branch_id;counts[k]=(counts[k]||0)+1;assert.ok(skill.unlock_level>=10&&skill.unlock_level<=100);}
 assert.equal(Object.keys(counts).length,21);assert.ok(Object.values(counts).every(value=>value===20));
 let individualFiles=0;
 for(const [classId,classConfig] of Object.entries(balance.classes.classes)){
  for(const branch of classConfig.branches){
   const branchId=typeof branch==="string"?branch:branch.id;
   const directory=path.join(__dirname,"../configs/skills",classId,branchId);
   const files=fs.readdirSync(directory).filter(name=>/^skill-\d{2}\.json$/.test(name));
   assert.equal(files.length,20,classId+"/"+branchId+" must have 20 separate skill JSON files");
   for(const file of files){const skill=JSON.parse(fs.readFileSync(path.join(directory,file),"utf8"));assert.equal(skill.class_id,classId);assert.equal(skill.branch_id,branchId);assert.ok(skill.id);}
   individualFiles+=files.length;
  }
 }
 assert.equal(individualFiles,420);
}
{
 const e=engine(),c=create(e),live=e.state.characters[0];
 live.silver=10000;e.purchase(c.id,'silver','xp_10');
 const potion=live.bag.find(item=>item.type==='xp_10');assert.ok(potion);
 e.activateItem(c.id,potion.id);live.progress.highestEver=1;
 assert.equal(e.xpMultiplier(e.getChar(c.id),2),1.1,'XP potion affects actual XP');
}
{
 const e=engine(),c=create(e),live=e.state.characters[0];live.silver=1000;
 for(let i=0;i<20;i++)e.recordDailyProgress(c.id,'elite_kills',1);
 const daily=e.dailySnapshot(c.id);assert.equal(daily.quests.find(q=>q.id==='elite_hunter').complete,true);
 const claim=e.claimDailyQuest(c.id,'elite_hunter');assert.equal(claim.rewardSilver,1200);
 assert.throws(()=>e.claimDailyQuest(c.id,'elite_hunter'),/already claimed/);
 const boss=e.startDailyBoss(c.id,'silver');assert.equal(boss.cost,500);
 const reward=e.completeDailyBoss(c.id,true);assert.equal(reward.reward.diamonds,3);
 assert.throws(()=>e.startDailyBoss(c.id,'silver'),/already been attempted/);
}
{
 const e=engine(),c=create(e),pvp=e.pvpSnapshot(c.id);
 assert.equal(pvp.source,'pvp');assert.equal(pvp.maxHp,Math.round(e.maxHp(c)*balance.pvp.health_multiplier));
}
{
 assert.equal(balance.equipment.stone_types.length,42);
 const e=engine(),c=create(e),live=e.state.characters[0];live.branch='bleed';
 live.gear[0]={id:'set1',slot:'weapon',setId:balance.classes.classes.assassin.branches[0].set.id,stats:{attack:10,defense:2,health:5},refine:2,sockets:[{stoneType:balance.equipment.stone_types[0],level:1}],socketsAvailable:1};
 live.gear[1]={id:'set2',slot:'chest',setId:balance.classes.classes.assassin.branches[0].set.id,stats:{attack:0,defense:4,health:15},refine:0,sockets:[],socketsAvailable:0};
 const stats=e.getCombatStats(live);assert.ok(stats.attack>balance.classes.base_stats.base_attack);
 assert.ok(stats.maxHp>balance.classes.base_stats.base_health);assert.ok(stats.damageMultiplier>1,'2-piece set bonus is applied');
}
console.log('RPG rework v2 tests passed: character/account, XP, speed, map, checkpoints, healing, death, auto-battle, gear, stones, refine, enchantments, consumables, dailies, daily boss, PvP snapshot, shop, bank and 420 skill files.');
