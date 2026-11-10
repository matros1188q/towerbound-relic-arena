'use strict';
const {balance,rng,equip,setup,simulateFight}=require('./balance-sim.cjs');
const classes=['assassin','bishop','dragonkin','destroyer','elemental','duelist','shaman'],premium=balance.economy.silver_store.premium_7d,potionPrice=balance.economy.silver_store.heal_25;
function runClass(classId,seed){
 const {engine,c}=setup(classId,1,seed);c.level=1;c.branch=null;let turns=0,used=0,bought=0,death=null,deathDetails=null,cleared=0;
 for(let stage=1;stage<=250;stage++){
  equip(c,stage);engine.beginStage(c.id,stage);const st=c.run.stage;c.run.dailyModifier=null;if(c.run.season)c.run.season.modifier=null;
  for(let i=0;i<st.mobs.length;i++){
   const enemy=st.mobs[i];st.targetIndex=i;
   const r=simulateFight(engine,c,stage,enemy,{playerHp:c.run.playerHp,resource:c.resource,random:rng(seed+stage*701+i*13),potionThreshold:.6,allowNormalPotion:true,onPotion:(currentHp,currentResource)=>{c.run.playerHp=currentHp;c.resource=currentResource;
    let stack=c.bag.find(x=>x.type==='healing_potion'&&x.quantity>0);
    if(!stack&&c.silver>=potionPrice){engine.purchase(c.id,'silver','heal_25');bought++;stack=c.bag.find(x=>x.type==='healing_potion'&&x.quantity>0);}
    if(!stack)return null;const hp=engine.useHealingPotion(c.id,stack.id);used++;return{hp,resource:c.resource};
   }});
   turns+=r.turns;c.run.playerHp=r.hp;c.resource=r.resource;
   if(!r.win){death=stage;deathDetails={type:enemy.type,role:enemy.role,turns:r.turns,hpPct:r.hp/r.maxHp*100};break;}engine.finishEnemy(c.id,{targetIndex:i});
  }
  if(death)break;cleared=stage;
 }
 const silverEarned=c.silver-100+bought*potionPrice,silverSpent=bought*potionPrice,net=silverEarned-silverSpent;
 const seconds=turns*(balance.combat.attack_interval||1)+cleared*3,runs=seconds?Math.floor(25*3600/seconds):0;
 return{classId,cleared,death,deathDetails,level:c.level,xp:c.xp,silverEarned,potionsUsed:used,potionsBought:bought,silverSpent,netSilver:net,minutes:seconds/60,estimatedRuns5d:runs,silver5d:Math.max(0,runs*net),premium:Math.max(0,runs*net)>=premium};
}
function main(){const rows=classes.map((c,i)=>runClass(c,9001+i*997));console.table(rows);const avg=k=>rows.reduce((s,r)=>s+r[k],0)/rows.length;
 console.log(JSON.stringify({avgLevel:avg('level'),avgXp:avg('xp'),avgSilver:avg('silverEarned'),avgPotionCost:avg('silverSpent'),premiumPrice:premium,avgFiveDaySilver:avg('silver5d'),allClear250:rows.every(r=>r.cleared===250),allLevel60:rows.every(r=>r.level>=60),allCanBuyPremium:rows.every(r=>r.premium)},null,2));}
if(require.main===module)main();
module.exports={runClass};
