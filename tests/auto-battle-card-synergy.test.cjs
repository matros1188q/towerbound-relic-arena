'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createEngine}=require('../rpg-rework-v2.js');
const dir=path.join(__dirname,'../configs/balance');
const balance=Object.fromEntries(fs.readdirSync(dir).filter(file=>file.endsWith('.json')).map(file=>[file.slice(0,-5),JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'))]));
const engine=createEngine(balance,{random:()=>0.5,now:()=>Date.UTC(2026,10,25)});
const created=engine.createCharacter('Auto Card QA','assassin');
const hero=engine.state.characters.find(character=>character.id===created.id);
hero.level=10;
hero.xp=Array.from({length:9},(_,index)=>engine.requiredXp(index+1)).reduce((sum,value)=>sum+value,0);
engine.recalcLevel(hero);
const branch=balance.classes.classes.assassin.branches[0].id;
engine.chooseBranch(hero.id,branch,0);
hero.progress.highestEver=11;
hero.progress.currentStage=1;
hero.run.playerHp=engine.maxHp(hero);
hero.run.active=false;
hero.deck=Array.from({length:10},(_,index)=>({
 id:'qa-poison-'+index,name:'QA Poison Strike',type:'attack',cost:1,
 effects:{damage:3,poison:2,damagePerPoison:5},instanceId:'qa-poison-'+index
}));
hero.hand=[];hero.discard=[];hero.exhaustPile=[];hero.energy=3;hero.currentEnergy=3;
const result=engine.autoBattle(hero.id,{maxStages:1});
assert.equal(result.cleared,1,'the seeded deck clears its unlocked auto-battle stage');
assert.ok(result.cardsPlayed>=3,'auto battle plays cards from the actual character deck');
assert.ok(result.cardDamage>0,'card attacks contribute real damage');
assert.ok(result.statusDamage>0,'poison/bleed/burn status ticks contribute damage');
assert.ok(result.synergyProcs>0,'assassin attack-chain synergy activates');
assert.ok(result.turns>0,'the fight is resolved over player/enemy turns');
assert.equal(hero.progress.currentStage,2,'a successful card-driven auto stage advances progression');
assert.equal(hero.stats.kills>=1,true,'auto battle records defeated enemies');
assert.ok(Array.isArray(hero.deck)&&hero.deck.length===10,'the deck and its cards persist after auto battle');
console.log('Auto battle card simulation: deck draw, energy, attacks, status damage, class synergy and progression passed.');
