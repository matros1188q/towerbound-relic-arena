'use strict';
const {balance,rng,builds,setup,equip,allocateTalents,simulateFight}=require('./balance-sim.cjs');
const silverPrice=balance.economy.silver_store.heal_25;
function runBuild(build,seed){
 const {engine,c}=setup(build.classId,build.branchId,1,seed),startingSilver=c.silver;
 const offered=engine.runModifierOptions(c.id)||[];
 const chosen=offered.find(m=>m.id==='arcane_hunt')||offered.find(m=>m.id==='last_stand')||offered.find(m=>m.id==='glass_cannon')||offered[0];
 if(chosen)engine.setRunModifier(c.id,chosen.id);
 let turns=0,used=0,bought=0,death=null,deathDetails=null,cleared=0,branchUnlockedAt=null;
 for(let stage=1;stage<=250;stage++){
  if(!c.branch&&c.level>=10){
   engine.chooseBranch(c.id,build.branchId);
   allocateTalents(engine,c);
   branchUnlockedAt=stage;
  }
  allocateTalents(engine,c);
  equip(c,stage);
  engine.beginStage(c.id,stage);
  const stageData=c.run.stage;
  c.run.dailyModifier=null;
  if(c.run.season)c.run.season.modifier=null;
  for(let i=0;i<stageData.mobs.length;i++){
   const enemy=stageData.mobs[i];
   stageData.targetIndex=i;
   const result=simulateFight(engine,c,stage,enemy,{
    playerHp:c.run.playerHp,resource:c.resource,
    random:rng(seed+stage*701+i*13),potionThreshold:.6,allowNormalPotion:true,
    onPotion:(currentHp,currentResource)=>{
     c.run.playerHp=currentHp;c.resource=currentResource;
     let stack=c.bag.find(x=>x.type==='healing_potion'&&x.quantity>0);
     if(!stack&&c.silver>=silverPrice){engine.purchase(c.id,'silver','heal_25');bought++;stack=c.bag.find(x=>x.type==='healing_potion'&&x.quantity>0);}
     if(!stack)return null;
     const hp=engine.useHealingPotion(c.id,stack.id);used++;return{hp,resource:c.resource};
    }
   });
   turns+=result.turns;c.run.playerHp=result.hp;c.resource=result.resource;
   if(!result.win){death=stage;deathDetails={type:enemy.type,role:enemy.role,turns:result.turns,hpPct:result.hp/result.maxHp*100};break;}
   engine.finishEnemy(c.id,{targetIndex:i});
   allocateTalents(engine,c);
   if(!c.branch&&c.level>=10){
    engine.chooseBranch(c.id,build.branchId);
    allocateTalents(engine,c);
    branchUnlockedAt=stage;
    equip(c,stage);
   }
  }
  if(death)break;
  cleared=stage;
 }
 const silverEarned=c.silver-startingSilver+bought*silverPrice,silverSpent=bought*silverPrice,netSilver=silverEarned-silverSpent;
 const seconds=turns*(balance.combat.attack_interval||1)+cleared*3;
 const estimatedRuns5d=seconds?Math.floor(25*3600/seconds):0;
 return{classId:build.classId,branchId:build.branchId,branchName:build.branchName,selectedModifier:chosen?.id||'none',branchUnlockedAt,cleared,death,deathDetails,level:c.level,xp:c.xp,silverEarned,potionsUsed:used,potionsBought:bought,silverSpent,netSilver,minutes:seconds/60,estimatedRuns5d,silver5d:Math.max(0,estimatedRuns5d*netSilver),premium:Math.max(0,estimatedRuns5d*netSilver)>=balance.economy.silver_store.premium_7d};
}
function run(){
 const rows=builds.map((build,index)=>runBuild(build,9001+index*997));
 console.log('Класс\tСпециализация\tЭтап\tУровень\tЭлиток/зелья\tСмерть');
 for(const r of rows){
  const why=r.death?String(r.death)+' '+r.deathDetails.type+'/'+r.deathDetails.role+'/'+r.deathDetails.turns+' ходов/'+r.deathDetails.hpPct.toFixed(0)+'% HP':'—';
  console.log([r.classId,r.branchId,r.cleared,r.level,r.potionsUsed+'/'+r.potionsBought,why].join('\t'));
 }
 const summary={builds:rows.length,allClear250:rows.every(r=>r.cleared===250),allLevel60:rows.every(r=>r.level>=60),clears:rows.filter(r=>r.cleared===250).length,weakBuilds:rows.filter(r=>r.cleared<250).map(r=>({build:r.classId+'.'+r.branchId,cleared:r.cleared,death:r.death,reason:r.deathDetails})),minLevel:Math.min(...rows.map(r=>r.level)),averageLevel:rows.reduce((sum,r)=>sum+r.level,0)/rows.length,averageNetSilver:rows.reduce((sum,r)=>sum+r.netSilver,0)/rows.length,averagePotions:rows.reduce((sum,r)=>sum+r.potionsUsed,0)/rows.length};
 console.log('SUMMARY '+JSON.stringify(summary,null,2));
 return rows;
}
if(require.main===module)run();
module.exports={runBuild,run};
