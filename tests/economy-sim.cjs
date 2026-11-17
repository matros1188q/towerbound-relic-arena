'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {simulateBuild}=require('./balance-simulation.test.cjs');

const configDir=path.join(__dirname,'../configs/balance');
const balance=Object.fromEntries(fs.readdirSync(configDir)
 .filter(name=>name.endsWith('.json'))
 .map(name=>[name.slice(0,-5),JSON.parse(fs.readFileSync(path.join(configDir,name),'utf8'))]));
const builds=Object.entries(balance.classes.classes).flatMap(([classId,definition])=>
 (definition.branches||[]).map(branch=>({
  classId,branchId:branch.id,className:definition.name,branchName:branch.name
 })));
const seeds=[0,1,2];

function summarize(build,index){
 const runs=seeds.map(seedOffset=>simulateBuild(build.classId,build.branchId,index,seedOffset));
 const best=runs[0];
 const seconds=best.totalTurns*(balance.combat.attack_interval||1)+best.cleared*3;
 const estimatedRuns5d=seconds>0?Math.floor(25*60*60/seconds):0;
 const seedResults=runs.map((run,seedOffset)=>({
  seed:seeds[seedOffset],
  cleared:run.cleared,
  deathStage:run.deathStage,
  deathReason:run.deathReason,
  level:run.deathLevel||run.checkpoints?.[250]?.level||run.checkpoints?.[200]?.level||1,
  potionsUsed:run.potions,
  potionsBought:run.potionsBought,
  silverSpent:run.silverSpent,
  netSilver:run.netSilver,
  totalTurns:run.totalTurns
 }));
 return{
  classId:build.classId,branchId:build.branchId,className:build.className,branchName:build.branchName,
  cleared:best.cleared,deathStage:best.deathStage,deathReason:best.deathReason,
  level:best.deathLevel||best.checkpoints?.[250]?.level||best.checkpoints?.[200]?.level||1,
  potionsUsed:best.potions,potionsBought:best.potionsBought,silverSpent:best.silverSpent,
  netSilver:best.netSilver,minutes:seconds/60,estimatedRuns5d,
  silver5d:Math.max(0,estimatedRuns5d*best.netSilver),
  canBuyPremium:Math.max(0,estimatedRuns5d*best.netSilver)>=balance.economy.silver_store.premium_7d,
  seedClears:seedResults.map(result=>result.cleared),
  seedResults,
  worstSeedClear:Math.min(...seedResults.map(result=>result.cleared))
 };
}

function run(){
 if(builds.length!==21)throw new Error('Expected 21 class specializations; received '+builds.length);
 const rows=builds.map(summarize);
 console.table(rows.flatMap(row=>row.seedResults.map(result=>({
  build:row.className+' · '+row.branchName,
  seed:result.seed,
  cleared:result.cleared,
  deathStage:result.deathStage,
  deathReason:result.deathReason,
  level:result.level,
  potions:result.potionsUsed,
  bought:result.potionsBought,
  netSilver:result.netSilver
 }))));
 const perSeed=seeds.map(seed=>({
  seed,
  builds:rows.length,
  cleared250:rows.filter(row=>row.seedResults.find(result=>result.seed===seed)?.cleared===250).length,
  averageCleared:rows.reduce((sum,row)=>sum+(row.seedResults.find(result=>result.seed===seed)?.cleared||0),0)/rows.length
 }));
 const summary={
  builds:rows.length,
  seeds,
  allClear250:rows.every(row=>row.cleared===250),
  allThreeSeedsClear250:rows.every(row=>row.worstSeedClear===250),
  cleared250:rows.filter(row=>row.cleared===250).length,
  perSeed,
  weakest:rows.filter(row=>row.worstSeedClear<250).map(row=>({
   build:row.className+' · '+row.branchName,
   seedResults:row.seedResults.filter(result=>result.cleared<250)
  })),
  averageNetSilver:rows.reduce((sum,row)=>sum+row.netSilver,0)/rows.length,
  averageSilverFiveDays:rows.reduce((sum,row)=>sum+row.silver5d,0)/rows.length,
  canBuyPremium:rows.filter(row=>row.canBuyPremium).length
 };
 console.log('ECONOMY SUMMARY '+JSON.stringify(summary,null,2));
 return rows;
}

if(require.main===module)run();
module.exports={run,summarize};
