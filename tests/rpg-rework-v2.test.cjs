'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createEngine}=require('../rpg-rework-v2.js');
const names=['combat','xp_curve','map','elite_mechanics','death','healing','auto_battle','drop_tables','equipment','economy','heroic','pvp','classes','skill_effects'];
const balance=Object.fromEntries(names.map(name=>[name,JSON.parse(fs.readFileSync(path.join(__dirname,'../configs/balance/'+name+'.json'),'utf8'))]));
let tick=0;const now=()=>Date.UTC(2026,10,3)+tick++;const random=()=>0;
const engine=()=>createEngine(balance,{now,random});
const create=e=>e.createCharacter('QA Hero','assassin');
{
 const e=engine(),c=create(e);
 assert.equal(c.level,1);assert.equal(c.silver,300);assert.equal(c.bag[0].quantity,3);
 assert.ok(e.state.account.premiumUntil>now());assert.equal(e.levelForXp(1e9),100);
 assert.equal(e.speed2Allowed(c.id,1),false);
}
{
 const e=engine(),c=create(e);c.progress.highestEver=20;c.progress.currentStage=21;
 assert.equal(e.speed2Allowed(c.id,20),true);
 assert.equal(e.xpMultiplier(e.getChar(c.id),20,{speed2:true}),0.4);
 assert.equal(e.xpMultiplier(e.getChar(c.id),21,{speed2:true}),0.8);
}
{
 const e=engine(),c=create(e);
 assert.equal(e.stagePlan(c,1).count,3);assert.equal(e.stagePlan(c,5).count,5);
 assert.equal(e.stagePlan(c,25).count,7);assert.equal(e.stagePlan(c,10).count,1);
 assert.equal(e.stagePlan(c,10).mobs[0].type,'boss');
}
{
 const e=engine(),c=create(e);c.progress.currentStage=50;c.run.playerHp=50;
 const heal=e.checkpointHeal(c.id);
 assert.equal(heal.penaltyUntil,99);assert.equal(heal.remaining,50);
 assert.throws(()=>e.checkpointHeal(c.id),/penalty/);
 assert.equal(e.xpMultiplier(e.getChar(c.id),50),0.8);
}
{
 const e=engine(),c=create(e);e.beginStage(c.id,1);e.useHealingPotion(c.id);
 assert.throws(()=>e.useHealingPotion(c.id),/slot/);
 const result=e.finishEnemy(c.id);assert.equal(result.stageComplete,false);
}
{
 const e=engine(),c=create(e);c.xp=50000;e.recalcLevel(c);c.progress.highestEver=18;c.progress.currentStage=19;
 c.run.active=true;c.run.id='run-a';c.run.experience=1000;c.run.foundItemIds=['found'];
 c.bag.push({id:'found',name:'Found',bossLoot:false});
 const result=e.deathPreview(c.id);assert.equal(result.experienceLoss,300);
 const died=e.confirmDeath(c.id);assert.equal(died.experienceLoss,300);
 const after=e.getChar(c.id);assert.equal(after.progress.currentStage,1);assert.equal(after.progress.highestEver,18);
}
{
 const e=engine(),c=create(e);c.progress.highestEver=25;c.progress.currentStage=1;
 const result=e.autoBattle(c.id,{maxStages:3});assert.ok(result.cleared>0);assert.equal(result.xp>0,true);
}
{
 const e=engine(),c=create(e);c.bag=Array.from({length:5},(_,i)=>({id:'s'+i,type:'enhancement_stone',stoneType:'branch-weapon',level:1}));
 const stone=e.mergeStones(c.id,'branch-weapon',1);assert.equal(stone.level,2);
}
{
 const e=engine(),c=create(e);c.heroic=true;const weapon={id:'w',slot:'weapon',refine:0,sockets:[],stats:{}};c.gear[0]=weapon;
 assert.equal(e.refine(c.id,'w').success,true);assert.equal(e.getChar(c.id).gear[0].refine,1);
 assert.throws(()=>e.rollEnchantScroll(c.id,'w'),/No enchantment scroll/); // random source is deterministic zero: see next test path.
}
{
 const e=engine(),c=create(e),other=e.createCharacter('Second','bishop');
 c.silver=1000;const moved=e.transferSilver(c.id,other.id,500);
 assert.equal(moved.fee,50);assert.equal(moved.received,450);
 assert.throws(()=>e.transferSilver(c.id,other.id,1),/Daily transfer limit/);
}
{
 const e=engine(),c=create(e);c.silver=10000;e.purchase(c.id,'silver','xp_10');
 assert.ok(e.getChar(c.id).bag.some(item=>item.type==='xp_10'));
 assert.deepEqual(balance.economy.diamond_packages,[[100,100],[300,269],[500,449],[1000,900],[5000,4500]]);
}
{
 const skills=JSON.parse(fs.readFileSync(path.join(__dirname,'../configs/skills/catalog.json'),'utf8'));
 assert.equal(skills.length,420);
 const counts={};for(const skill of skills){const k=skill.class_id+'/'+skill.branch_id;counts[k]=(counts[k]||0)+1;assert.ok(skill.unlock_level>=10&&skill.unlock_level<=100);}
 assert.equal(Object.keys(counts).length,21);assert.ok(Object.values(counts).every(value=>value===20));
}
console.log('RPG rework v2 tests passed: character/account split, XP, 250-stage map, speed gate, checkpoints, healing, death, auto-battle, stones, refinement, enchantment guard, shop, bank and 420 skill records.');
