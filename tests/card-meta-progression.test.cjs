'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createEngine}=require('../rpg-rework-v2.js');

const configDir=path.join(__dirname,'../configs/balance');
const balance=Object.fromEntries(fs.readdirSync(configDir).filter(file=>file.endsWith('.json')).map(file=>[
  file.slice(0,-5),JSON.parse(fs.readFileSync(path.join(configDir,file),'utf8'))
]));
const makeEngine=()=>createEngine(balance,{now:()=>Date.UTC(2026,10,16),random:()=>0.999999});
const engine=makeEngine();
const created=engine.createCharacter('Checkpoint QA','assassin');
const hero=engine.state.characters.find(character=>character.id===created.id);
assert.ok(hero,'new character is stored in engine state');
assert.equal(hero.run.snapshot,null,'new runs start without a checkpoint');
assert.deepEqual(engine.state.account.unlockedCards,[],'card unlocks live in the global account save');

hero.progress.highestEver=9;
hero.progress.currentStage=10;
hero.deck=[{id:'strike',instanceId:'checkpoint-strike',name:'Checkpoint Strike'}];
hero.hand=[];hero.discard=[];hero.exhaustPile=[];hero.cardDeckVersion=3;
hero.silver=275;
hero.gear[0]={id:'checkpoint-relic',name:'Checkpoint relic',slot:'weapon'};
const bossStage=engine.beginStage(hero.id,10);
assert.equal(bossStage.stage,10,'the checkpoint fixture starts at floor 10');
assert.ok(bossStage.mobs.some(mob=>mob.type==='boss'),'every tenth floor is a boss stage');
for(let i=0;i<bossStage.mobs.length;i++)engine.finishEnemy(hero.id,{targetIndex:i});
const firstSnapshot=hero.run.snapshot;
assert.ok(firstSnapshot,'clearing a boss creates a persisted checkpoint');
assert.equal(firstSnapshot.stage,11,'the checkpoint resumes immediately after the boss');
assert.equal(firstSnapshot.silver,hero.silver,'checkpoint stores post-boss silver');
assert.equal(firstSnapshot.hp,hero.run.playerHp,'checkpoint stores the post-boss HP');
assert.deepEqual(firstSnapshot.deck,hero.deck,'checkpoint stores the card deck');
assert.deepEqual(firstSnapshot.gear,hero.gear,'checkpoint stores equipment state');

// A subsequent boss replaces the old checkpoint.
hero.progress.highestEver=19;
hero.progress.currentStage=20;
hero.deck=[{id:'defend',instanceId:'second-boss-deck'}];
const secondBoss=engine.beginStage(hero.id,20);
for(let i=0;i<secondBoss.mobs.length;i++)engine.finishEnemy(hero.id,{targetIndex:i});
const snapshot=hero.run.snapshot;
assert.equal(snapshot.stage,21,'the most recent boss checkpoint replaces the previous one');
const expectedDeck=JSON.parse(JSON.stringify(snapshot.deck));
const expectedGear=JSON.parse(JSON.stringify(snapshot.gear));
const expectedSilver=snapshot.silver;
const expectedHp=snapshot.hp;
hero.progress.currentStage=28;
hero.deck=[{id:'heavy_blow',instanceId:'after-boss-card'}];
hero.gear[0]={id:'after-boss-relic',name:'After boss relic',slot:'weapon'};
hero.silver+=999;
hero.run.playerHp=0;
const restored=engine.confirmDeath(hero.id);
assert.equal(restored.checkpointRestored,true,'death restores the latest boss checkpoint');
assert.equal(restored.checkpointStage,21);
assert.equal(hero.progress.currentStage,21);
assert.equal(hero.run.playerHp,expectedHp);
assert.equal(hero.silver,expectedSilver);
assert.deepEqual(hero.deck,expectedDeck,'cards acquired after the boss are discarded on rollback');
assert.deepEqual(hero.gear,expectedGear);
assert.equal(hero.run.snapshot,null,'restoring a checkpoint consumes it');
assert.equal(hero.run.active,true,'the player can resume at the checkpoint');

const engine2=makeEngine();
const created2=engine2.createCharacter('Fresh Run QA','bishop');
const fresh=engine2.state.characters.find(character=>character.id===created2.id);
fresh.progress.currentStage=8;
fresh.deck=[{id:'heavy_blow',instanceId:'pre-boss-card'}];
fresh.cardDeckVersion=3;
fresh.run.playerHp=0;
const restarted=engine2.confirmDeath(fresh.id);
assert.equal(restarted.checkpointRestored,false);
assert.equal(fresh.progress.currentStage,1,'death without a checkpoint resets progression to floor 1');
assert.equal(fresh.run.active,false,'the player must configure a fresh run');
assert.deepEqual(fresh.deck,[],'the old deck is cleared before a new starter draft');
assert.equal(fresh.cardDeckVersion,0,'the new run recreates its class starter deck');
assert.equal(fresh.run.snapshot,null);

const ui=fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.js'),'utf8');
const worker=fs.readFileSync(path.join(__dirname,'../service-worker.js'),'utf8');
assert.match(ui,/function unlockCardPermanently/);
assert.match(ui,/unlockCardPermanently\(chosen\.id\)/);
assert.match(ui,/data-collection-tab="cards"/);
assert.match(ui,/function showStarterDeckModal/);
assert.match(ui,/starterDeckSelection\.length<3/);
assert.match(ui,/data-starter-deck-confirm/);
assert.match(worker,/towerbound-v332/);
console.log('Boss checkpoints, permanent card collection, and new-run deck draft checks passed.');
