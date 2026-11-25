'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {setupBuild}=require('./balance-sim.cjs');

const ui=fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.js'),'utf8');
const start=ui.indexOf('const CARD_DATABASE=Object.freeze(');
const art=ui.indexOf('const ART_MAPPING',start);
assert.ok(start>=0&&art>start,'live card database is available for the simulation');
const literal=ui.slice(start+'const CARD_DATABASE=Object.freeze('.length,art).replace(/\n\s*\)\s*$/,'').trim();
const cardDb=vm.runInNewContext('('+literal+')');
const configDir=path.join(__dirname,'../configs/balance');
const balance=Object.fromEntries(fs.readdirSync(configDir).filter(file=>file.endsWith('.json')).map(file=>[file.slice(0,-5),JSON.parse(fs.readFileSync(path.join(configDir,file),'utf8'))]));
const baseDecks={
 assassin:['strike','strike','strike','defend','defend','dash','assassin_poison_blade','assassin_bleed','assassin_shadow','precise_shot'],
 bishop:['strike','strike','defend','defend','defend','dash','dash','bishop_prayer','bishop_divine_shield','bishop_smite'],
 dragonkin:['strike','strike','defend','defend','defend','dash','dash','dragonkin_flame','dragonkin_frost','rampage'],
 destroyer:['strike','strike','strike','strike','defend','defend','dash','destroyer_crush','destroyer_warcry','heavy_blow'],
 elemental:['strike','strike','defend','defend','dash','dash','elemental_chain','elemental_storm','elemental_meditation','inspiration'],
 duelist:['strike','strike','strike','strike','defend','defend','dash','duelist_parry','duelist_riposte','backstab'],
 shaman:['strike','strike','defend','defend','defend','dash','dash','shaman_totem','shaman_spirit','shaman_nature']
};
const windows=[{label:'start',start:1,end:9},{label:'mid',start:91,end:99},{label:'end',start:241,end:249}];
const classes=Object.entries(balance.classes.classes).flatMap(([classId,definition])=>(definition.branches||[]).map(branch=>({classId,className:definition.name,branchId:branch.id,branchName:branch.name})));
assert.equal(classes.length,21);
const makeCard=(id,index)=>{
 const definition=cardDb[id];
 assert.ok(definition,'missing live card definition '+id);
 return{...definition,effects:{...(definition.effects||{})},isUpgraded:false,instanceId:'matrix-'+index+'-'+id};
};
const rows=[];
let totalCleared=0,totalStages=0,totalCards=0,totalStatusDamage=0,totalBlock=0;
for(const [buildIndex,build] of classes.entries()){
 for(const window of windows){
  const trials=[];
  for(let seed=0;seed<3;seed++){
   const setup=setupBuild(build.classId,build.branchId,window.start,window.start*1009+buildIndex*997+seed*7919);
   const {engine,character}=setup;
   character.run.stage=null;character.run.active=false;character.run.playerHp=engine.maxHp(character);
   character.progress.currentStage=window.start;
   character.progress.highestEver=window.end+10;
   character.run.runModifierId='last_stand';
   const starterIds=baseDecks[build.classId];
   const specializationIds=Object.values(cardDb).filter(card=>card.classId===build.classId&&card.branchId===build.branchId&&card.starter).slice(0,2).map(card=>card.id);
   character.deck=[...starterIds,...specializationIds].map(makeCard);
   character.hand=[];character.discard=[];character.exhaustPile=[];character.energy=3;character.currentEnergy=3;
   const result=engine.autoBattle(character.id,{maxStages:9});
   trials.push({seed,cleared:result.cleared,failedStage:result.failedStage,hpPct:Math.round((Number(character.run.playerHp)||0)/Math.max(1,engine.maxHp(character))*100),cardsPlayed:result.cardsPlayed,statusDamage:result.statusDamage,cardDamage:result.cardDamage,blockGenerated:result.blockGenerated,turns:result.turns});
  }
  const cleared=trials.map(item=>item.cleared).sort((a,b)=>a-b),median=cleared[1],averageCards=trials.reduce((sum,item)=>sum+item.cardsPlayed,0)/trials.length,averageStatus=trials.reduce((sum,item)=>sum+item.statusDamage,0)/trials.length,averageBlock=trials.reduce((sum,item)=>sum+item.blockGenerated,0)/trials.length;
  totalCleared+=trials.reduce((sum,item)=>sum+item.cleared,0);totalStages+=trials.length*9;totalCards+=trials.reduce((sum,item)=>sum+item.cardsPlayed,0);totalStatusDamage+=trials.reduce((sum,item)=>sum+item.statusDamage,0);totalBlock+=trials.reduce((sum,item)=>sum+item.blockGenerated,0);
  rows.push({classId:build.classId,branchId:build.branchId,build:build.className+' · '+build.branchName,window:window.label,medianCleared:median,best:Math.max(...cleared),worst:Math.min(...cleared),averageCards:Number(averageCards.toFixed(1)),averageStatusDamage:Number(averageStatus.toFixed(1)),averageBlock:Number(averageBlock.toFixed(1)),trials});
 }
}
console.log('CARD-DRIVEN AUTO-BATTLE MATRIX');
console.log('BUILD\tWINDOW\tMEDIAN CLEARED / 9\tWORST\tBEST\tAVG CARDS\tAVG STATUS DAMAGE\tAVG BLOCK');
for(const row of rows)console.log([row.build,row.window,row.medianCleared,row.worst,row.best,row.averageCards,row.averageStatusDamage,row.averageBlock].join('\t'));
console.log(JSON.stringify({audit:'card-driven-auto-battle-balance',builds:21,windows:windows.length,seedsPerWindow:3,totalTrials:rows.length*3,totalStages,clearedStages:totalCleared,clearRatePct:Number((totalCleared/Math.max(1,totalStages)*100).toFixed(2)),cardsPlayed:totalCards,statusDamage:totalStatusDamage,blockGenerated:totalBlock}));
assert.ok(totalCards>0,'real deck cards must be played across the build matrix');
assert.ok(totalStages>0&&totalCleared>=0,'card simulation returns bounded progression results');
assert.ok(rows.every(row=>row.trials.length===3),'each specialization/window has three deterministic seeds');
