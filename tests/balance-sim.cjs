'use strict';
const fs=require('node:fs'),path=require('node:path');
const {createEngine}=require('../rpg-rework-v2.js');
const dir=path.join(__dirname,'../configs/balance');
const balance=Object.fromEntries(fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>[f.slice(0,-5),JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'))]));
const classes=['assassin','bishop','dragonkin','destroyer','elemental','duelist','shaman'],stages=[10,50,100,150,250],types=['normal','elite','boss'],trials=1000;
function rng(seed){let x=seed>>>0;return()=>((x=(x*1664525+1013904223)>>>0)/4294967296);}
function levelAt(stage){const a=balance.character_curves.level_to_stage_anchors;for(let i=1;i<a.length;i++)if(stage<=a[i].stage)return Math.round(a[i-1].level+(a[i].level-a[i-1].level)*(stage-a[i-1].stage)/(a[i].stage-a[i-1].stage));return a[a.length-1].level;}
function equip(c,stage){const ilvl=Math.min(balance.item_level.max,Math.round(stage*.48));c.gear=['weapon','chest','head','legs','hands','accessory'].map((slot,i)=>({id:'sim-'+slot+i,slot,itemLevel:ilvl,rarity:'Редкая',stats:{attack:0,defense:0,health:0},refine:0,sockets:[]}));}
function setup(classId,stage,seed){const engine=createEngine(balance,{random:rng(seed),now:()=>Date.UTC(2026,10,10)});engine.createCharacter('Sim '+classId,classId);const c=engine.state.characters[0];c.level=levelAt(stage);const branches=balance.classes.classes[classId].branches||[];c.branch=typeof branches[0]==='string'?branches[0]:branches[0]?.id||null;equip(c,stage);return{engine,c};}
function simulateFight(engine,c,stage,enemy,opt={}){
 const id=c.id,stats=engine.getCombatStats(c),es=engine.getEnemyStats(id,stage,enemy),maxHp=stats.maxHp,cls=balance.classes.classes[c.classId],effects=balance.skill_effects;
 const branch=c.branch,damageType=balance.skills.damage_type_by_branch?.[c.classId]?.[branch]||'physical';
 const skill=(cls.base_skills||[]).filter(s=>s.type==='active'&&s.unlock_level<=c.level&&['strike','execute','dot','control'].includes(s.effect_template)).map(s=>({...s,effect:effects[s.effect_template]||{}})).sort((a,b)=>Number(b.damage_multiplier??b.effect.damage_multiplier??1.5)-Number(a.damage_multiplier??a.effect.damage_multiplier??1.5))[0];
 const sc=Number(skill?.resource_cost??skill?.effect.resource_cost??cls.resource_cost_per_skill??18),sm=Number(skill?.damage_multiplier??skill?.effect.damage_multiplier??1.5),sd=({short:2,medium:4,long:6})[skill?.cooldown_tier]||2;
 const ult=balance.skills.ultimates?.[c.classId],counter=balance.skills.counter_abilities?.[c.classId],costs=balance.resources.class_costs?.[c.classId]||{};
 const uc=Number(costs.ultimate??ult?.resource_cost??balance.resources.action_costs.ultimate),cc=Number(costs.counter??counter?.resource_cost??balance.resources.action_costs.counter);
 const rngFn=opt.random||Math.random;let hp=Math.min(maxHp,opt.playerHp??maxHp),res=Math.min(c.resourceMax,opt.resource??Math.round(c.resourceMax*balance.resources.starting_fraction)),ehp=es.hp,turn=0,used=false,skillReady=1,ultReady=1,counterReady=1;
 const basic=engine.basicAttackStats(id),v=balance.combat.player_damage.attack_variance||0;
 while(hp>0&&ehp>0&&turn<200){
  turn++;
  if(!used&&enemy.type!=='normal'&&hp<=maxHp*(opt.potionThreshold??.48)){
   let healed=opt.onPotion?opt.onPotion(hp,res):{hp:Math.min(maxHp,hp+Math.round(maxHp*balance.healing.potion_heal_fraction)),resource:Math.min(c.resourceMax,res+(balance.resources.regeneration.potion||25))};
   if(healed){hp=healed.hp;res=healed.resource;used=true;}
  }
  let raw;
  if(ult?.damage_multiplier&&res>=uc&&turn>=ultReady){raw=stats.attack*ult.damage_multiplier*stats.damageMultiplier;res-=uc;ultReady=turn+(ult.cooldown_turns||3);if(ult.heal_fraction)hp=Math.min(maxHp,hp+Math.round(maxHp*ult.heal_fraction));}
  else if(skill&&res>=sc&&turn>=skillReady){raw=stats.attack*sm*stats.damageMultiplier;res-=sc;skillReady=turn+sd;}
  else{raw=basic.damage*stats.damageMultiplier;res=Math.min(c.resourceMax,res+basic.resourceGain);}
  raw*=1+(rngFn()*2-1)*v;if(rngFn()<(stats.critChance||0))raw*=stats.critMultiplier||1.5;
  raw*=engine.damageTypeMultiplier({...enemy,maxHp:es.hp},damageType);
  let dealt=Math.max(1,Math.round(raw));if(enemy.type==='boss')dealt=engine.capBossDamage({...enemy,maxHp:es.hp},dealt,0);
  ehp=Math.max(0,ehp-dealt);
  let vamp=balance.combat.vampirism?.default_fraction??.01;if(['assassin','destroyer','duelist'].includes(c.classId))vamp=balance.combat.vampirism.damage_dealer_fraction??.0175;if(c.classId==='bishop')vamp=0;
  hp=Math.min(maxHp,hp+Math.floor(dealt*vamp));if(ehp<=0)break;
  let incoming=Math.max(0,Math.round(es.damage*engine.mitigationMultiplier(stats.defense,stage)*(1-(stats.damageReduction||0))));
  if(counter&&res>=cc&&turn>=counterReady){incoming=engine.resolveReaction('strong_hit',counter.id,c.classId,incoming).damage;res-=cc;counterReady=turn+(counter.cooldown_turns||2);}
  hp-=incoming;
 }
 return{win:ehp<=0&&hp>0,turns:turn,hp:Math.max(0,hp),maxHp,hpPct:Math.max(0,hp)/maxHp*100,usedPotion:used,resource:res};
}
function run(){
 const rows=[];
 for(const classId of classes)for(const stage of stages)for(const type of types){
  const {engine,c}=setup(classId,stage,stage*1009+classes.indexOf(classId)*97+types.indexOf(type));
  let wins=0,turns=0,hp=0,potions=0,maxHit=0;
  for(let i=0;i<trials;i++){c.resource=Math.round(c.resourceMax*balance.resources.starting_fraction);const ds=balance.mobs.damage_types||['fire','ice','dark','physical'];const enemy={type,weakness:ds[(stage+i)%ds.length],resistance:ds[(stage+i+2)%ds.length],role:type==='boss'?'boss':'normal'};
   const r=simulateFight(engine,c,stage,enemy,{random:rng(i+stage*10000+classes.indexOf(classId)*1000000)});if(r.win)wins++;turns+=r.turns;hp+=r.hpPct;if(r.usedPotion)potions++;
   const es=engine.getEnemyStats(c.id,stage,{type});maxHit=Math.max(maxHit,es.damage*engine.mitigationMultiplier(engine.getCombatStats(c).defense,stage)/engine.getCombatStats(c).maxHp*100);
  }
  rows.push({classId,name:balance.classes.classes[classId].name,stage,type,winRate:wins/10,avgTurns:turns/trials,avgHpPct:hp/trials,potionRate:potions/10,maxHitPct:maxHit});
 }
 console.log('Класс\\tЭтап\\tВраг\\t% Побед\\tСредние ходы\\tОстаток HP %\\tБои с зельем %\\tМакс. удар % HP');
 for(const r of rows)console.log([r.name,r.stage,r.type,r.winRate.toFixed(1),r.avgTurns.toFixed(2),r.avgHpPct.toFixed(1),r.potionRate.toFixed(1),r.maxHitPct.toFixed(1)].join('\\t'));
 for(const stage of stages){const a=rows.filter(r=>r.stage===stage&&r.type==='boss').map(r=>r.winRate);console.log('Разница винрейта боссов, этап '+stage+': '+(Math.max(...a)-Math.min(...a)).toFixed(1)+' п.п.');}
 return rows;
}
if(require.main===module)run();
module.exports={balance,rng,levelAt,equip,setup,simulateFight,run};
