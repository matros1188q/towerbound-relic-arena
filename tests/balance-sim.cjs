'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createEngine}=require('../rpg-rework-v2.js');
const dir=path.join(__dirname,'../configs/balance');
const balance=Object.fromEntries(fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>[f.slice(0,-5),JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'))]));
const skillCatalog=JSON.parse(fs.readFileSync(path.join(__dirname,'../configs/skills/catalog.json'),'utf8'));
const classes=['assassin','bishop','dragonkin','destroyer','elemental','duelist','shaman'];
const builds=classes.flatMap(classId=>(balance.classes.classes[classId].branches||[]).map(branch=>({classId,branchId:typeof branch==='string'?branch:branch.id,branchName:typeof branch==='string'?branch:branch.name})));
const stages=[30,50,100,150,200,250],types=['normal','elite','boss'],trials=200;
assert.equal(builds.length,21,'the balance audit must cover all 21 class specializations');
function rng(seed){let x=seed>>>0;return()=>((x=(x*1664525+1013904223)>>>0)/4294967296);}
function levelAt(stage){const a=balance.character_curves.level_to_stage_anchors;for(let i=1;i<a.length;i++)if(stage<=a[i].stage)return Math.round(a[i-1].level+(a[i].level-a[i-1].level)*(stage-a[i-1].stage)/(a[i].stage-a[i-1].stage));return a[a.length-1].level;}
function equip(c,stage){const ilvl=Math.min(balance.item_level.max,Math.round(stage*.48));c.gear=['weapon','chest','head','legs','hands','accessory'].map((slot,i)=>({id:'sim-'+slot+i,slot,itemLevel:ilvl,rarity:'Редкая',branch:c.branch||null,classId:c.classId,stats:{attack:0,defense:0,health:0},refine:0,sockets:[]}));}
function allocateTalents(engine,c){
 if(!c.branch)return 0;
 const branch=(balance.classes.classes[c.classId].branches||[]).find(x=>(typeof x==='string'?x:x.id)===c.branch);
 if(!branch||!Array.isArray(branch.talents))return 0;
 const priority=['attack','skill_power','critical','health','defense','attack_speed'];
 const talents=branch.talents.slice().sort((a,b)=>priority.indexOf(a.effect_template)-priority.indexOf(b.effect_template));
 let left=Math.max(0,(Number(c.talentPoints)||0)-Object.values(c.talents||{}).reduce((sum,n)=>sum+(Number(n)||0),0)),spent=0;
 for(const talent of talents){let rank=Number(c.talents?.[talent.id])||0;while(rank<3&&left>0){engine.useTalentPoint(c.id,talent.id,3);rank++;left--;spent++;}}
 return spent;
}
function setup(classId,branchId,stage,seed){
 const engine=createEngine(balance,{random:rng(seed),now:()=>Date.UTC(2026,10,10)});
 engine.createCharacter('Sim '+classId+' '+branchId,classId);
 const c=engine.state.characters[0];c.level=levelAt(stage);c.talentPoints=Math.max(0,c.level-1);
 if(branchId&&c.level>=10)engine.chooseBranch(c.id,branchId);
 const talentPointsSpent=allocateTalents(engine,c);equip(c,stage);
 return{engine,c,talentPointsSpent};
}
function skillPools(c){
 const cls=balance.classes.classes[c.classId],base=(cls.base_skills||[]).filter(s=>s.type!=='passive'&&Number(s.unlock_level||1)<=c.level);
 const branch=c.branch?skillCatalog.filter(s=>s.class_id===c.classId&&s.branch_id===c.branch&&(balance.skills.skills_per_branch?skillCatalog.filter(x=>x.class_id===c.classId&&x.branch_id===c.branch).indexOf(s)<balance.skills.skills_per_branch:true)&&s.is_active!==false&&Number(s.unlock_level||1)<=c.level):[];
 const all=[...base,...branch].filter((s,i,a)=>a.findIndex(x=>x.id===s.id)===i);
 const effect=s=>balance.skill_effects[s.effect_template]||{};
 const score=s=>{
  const e=effect(s),type=e.type||s.effect_template,mult=Number(s.damage??s.damage_multiplier??e.damage_multiplier??0);
  if(['strike','aoe','execute','control'].includes(type))return mult||Number(e.damage_multiplier)||1;
  if(type==='dot')return (mult||1)+(Number(e.damage_multiplier)||0)*(Number(e.ticks)||1)/2.5;
  if(type==='debuff'&&c.classId==='shaman'&&c.branch==='dark_gods')return 5;
  if(type==='buff')return .25;
  if(type==='heal')return .15;
  if(type==='shield'||type==='parry')return .1;
  return 0;
 };
 const ranked=all.map(s=>({...s,_score:score(s)})).sort((a,b)=>b._score-a._score);
 return{damage:ranked.filter(s=>s._score>0).slice(0,6),support:ranked.filter(s=>['heal','shield','buff','debuff','parry'].includes((effect(s).type||s.effect_template))).slice(0,6)};
}
function simulateFight(engine,c,stage,enemy,opt={}){
 const id=c.id,stats=engine.getCombatStats(c),enemyStats=engine.getEnemyStats(id,stage,enemy),maxHp=stats.maxHp;
 const cls=balance.classes.classes[c.classId],pool=skillPools(c),effects=balance.skill_effects,damageSkills=pool.damage,supportSkills=pool.support;
 const ult=balance.skills.ultimates?.[c.classId],counter=balance.skills.counter_abilities?.[c.classId],costs=balance.resources.class_costs?.[c.classId]||{};
 const ultCost=Number(costs.ultimate??ult?.resource_cost??balance.resources.action_costs.ultimate),counterCost=Number(costs.counter??counter?.resource_cost??balance.resources.action_costs.counter);
 const random=opt.random||Math.random,basic=engine.basicAttackStats(id),turnMultiplier=Number(balance.combat.turn_based?.skill_dps_multiplier||2.5);
 let hp=Math.max(1,Math.min(maxHp,Number(opt.playerHp??maxHp))),shield=0,resource=Math.max(0,Math.min(c.resourceMax,Number(opt.resource??Math.round(c.resourceMax*balance.resources.starting_fraction))));
 let enemyHp=enemyStats.hp,turn=0,usedPotion=false,potionHpPct=null,skillReady={},ultimateReady=1,counterReady=1,poisonStacks=0,enemyDots=[],buffTurns=0,buffPower=0,debuffTurns=0,debuffPower=0,parryChance=0,phase4Turns=0;
 const target={...enemy,maxHp:enemyStats.hp};
 const vampConfig=balance.combat.vampirism||{};
 let vamp=Number(vampConfig.default_fraction??.01);
 if(c.classId==='bishop')vamp=0;
 else if(['assassin','destroyer','duelist'].includes(c.classId))vamp=Number(vampConfig.damage_dealer_fraction??.0175);
 else if(c.classId==='dragonkin'&&c.branch==='ice_dragon')vamp=Number(vampConfig.ice_tank_fraction??.01);
 if(Number.isFinite(Number(vampConfig.by_branch?.[c.classId]?.[c.branch])))vamp=Number(vampConfig.by_branch[c.classId][c.branch]);
 const damageTypeFor=skill=>skill?.damage_type||balance.skills.damage_type_by_branch?.[c.classId]?.[c.branch]||'physical';
 const hit=(raw,type,ultimateHit=false)=>{
  if(enemy.type==='boss')raw=engine.capBossDamage(target,raw,0,ultimateHit?'ultimate':'skill');
  if(enemy.role==='tank'&&turn>0&&turn%3===0)raw*=1-(balance.mobs.roles.tank.shield_fraction||.1);
  const dealt=Math.max(1,Math.round(raw*engine.damageTypeMultiplier(target,type)));
  enemyHp=Math.max(0,enemyHp-dealt);
  hp=Math.min(maxHp,hp+Math.floor(dealt*vamp));
  return dealt;
 };
 const useDamageSkill=()=>{
  const available=damageSkills.filter(s=>(skillReady[s.id]||1)<=turn);
  return available.find(s=>{
   const e=effects[s.effect_template]||{},cost=c.classId==='duelist'?(costs.attack_skill??balance.resources.action_costs.attack_skill??22):Number(s.cost??s.resource_cost??e.resource_cost??balance.resources.action_costs.attack_skill??22);
   return resource>=cost;
  })||null;
 };
 while(hp>0&&enemyHp>0&&turn<200){
  turn++;
  if(!usedPotion&&(enemy.type!=='normal'||opt.allowNormalPotion)&&hp<=maxHp*(opt.potionThreshold??.6)){
   potionHpPct=hp/maxHp*100;
   const healed=opt.onPotion?opt.onPotion(hp,resource):{hp:Math.min(maxHp,hp+Math.round(maxHp*balance.healing.potion_heal_fraction)),resource:Math.min(c.resourceMax,resource+(balance.resources.regeneration.potion||25))};
   if(healed){hp=healed.hp;resource=healed.resource;usedPotion=true;}
  }
  let actionDamage=0,actedWithSkill=false;
  const reserve=(counter&&turn>=counterReady)?counterCost:0;
  let actionSkill=null;
  const healSkill=supportSkills.find(s=>(effects[s.effect_template]||{}).type==='heal'&&(skillReady[s.id]||1)<=turn);
  const shieldSkill=supportSkills.find(s=>(effects[s.effect_template]||{}).type==='shield'&&(skillReady[s.id]||1)<=turn);
  const buffSkill=supportSkills.find(s=>(effects[s.effect_template]||{}).type==='buff'&&(skillReady[s.id]||1)<=turn);
  const debuffSkill=supportSkills.find(s=>(effects[s.effect_template]||{}).type==='debuff'&&(skillReady[s.id]||1)<=turn);
  const parrySkill=supportSkills.find(s=>(effects[s.effect_template]||{}).type==='parry'&&(skillReady[s.id]||1)<=turn);
  const supportCost=s=>!s?Infinity:(c.classId==='duelist'?(costs.attack_skill??22):Number(s.cost??s.resource_cost??(effects[s.effect_template]||{}).resource_cost??balance.resources.action_costs.attack_skill??22));
  if(healSkill&&hp<=maxHp*.62&&resource>=supportCost(healSkill))actionSkill=healSkill;
  else if(shieldSkill&&shield<=0&&hp<=maxHp*.78&&resource>=supportCost(shieldSkill))actionSkill=shieldSkill;
  else if(debuffSkill&&debuffTurns<=0&&hp<=maxHp*.72&&resource>=supportCost(debuffSkill))actionSkill=debuffSkill;
  else if(parrySkill&&parryChance<=0&&hp<=maxHp*.7&&resource>=supportCost(parrySkill))actionSkill=parrySkill;
  else if(buffSkill&&buffTurns<=0&&damageSkills.length===0&&resource>=supportCost(buffSkill))actionSkill=buffSkill;
  else actionSkill=useDamageSkill();
  if(actionSkill){
   const effect=effects[actionSkill.effect_template]||effects.strike||{},type=effect.type||actionSkill.effect_template;
   const cost=c.classId==='duelist'?(costs.attack_skill??22):Number(actionSkill.cost??actionSkill.resource_cost??effect.resource_cost??balance.resources.action_costs.attack_skill??22);
   if(resource>=cost){
    resource-=cost;actedWithSkill=true;
    const cooldown=Math.max(1,Number(effect.cooldown_turns??effect.cooldown??4));skillReady[actionSkill.id]=turn+cooldown;
    const power=Number(actionSkill.damage_multiplier??actionSkill.damage??effect.damage_multiplier??1);
    let damage=stats.dps*turnMultiplier*(stats.damageMultiplier||1)*power;
    if(c.classId==='destroyer'&&c.branch==='wand_shield')damage+=(stats.defense*(Number(balance.classes.branch_stat_bonuses?.['destroyer.wand_shield']?.defense_damage_fraction)||.5));
    if(buffTurns>0)damage*=1+buffPower;
    if(random()<(stats.critChance||0))damage*=stats.critMultiplier||1.5;
    const damageType=damageTypeFor(actionSkill);
    if(['strike','aoe','execute','control','dot'].includes(type)){
     if(type==='execute'&&enemyHp<=enemyStats.hp*.3)damage*=1+(Number(effect.below_health_bonus)||.3);
     actionDamage+=hit(damage,damageType);
     if(type==='dot'&&Number(effect.damage_multiplier)>0){
      const dotMult=c.classId==='assassin'&&c.branch==='poison'?(Number(balance.classes.branch_stat_bonuses?.['assassin.poison']?.dot_damage_multiplier)||1.15):1;
      enemyDots.push({damage:Math.max(1,Math.round(stats.dps*effect.damage_multiplier*(1+stats.damageMultiplier-1)*dotMult*Number(actionSkill.powerMultiplier||1))),ticks:Math.max(1,Number(effect.ticks)||3),type:damageType});
     }
    }else if(type==='debuff'){
     debuffPower=Number(effect.power_multiplier)||0;debuffTurns=Math.max(1,Number(effect.duration_turns||effect.duration)||3);
     if(c.classId==='shaman'&&c.branch==='dark_gods'){
      const dotMult=Number(balance.classes.branch_stat_bonuses?.['shaman.dark_gods']?.dot_damage_multiplier)||1.15;
      enemyDots.push({damage:Math.max(1,Math.round(stats.dps*(Number(effect.damage_multiplier||actionSkill.damage_multiplier||.45))*.45*dotMult)),ticks:Math.max(1,Number(effect.duration)||3),type:damageType});
     }
    }else if(type==='buff'){
     buffPower=Number(effect.power_multiplier)||0;buffTurns=Math.max(1,Number(effect.duration_turns||effect.duration)||3);
    }else if(type==='heal'){
     hp=Math.min(maxHp,hp+Math.round(maxHp*(Number(effect.heal_multiplier)||0)*(stats.healingMultiplier||1)));
    }else if(type==='shield'){
     shield+=Math.round(maxHp*(Number(effect.shield_fraction)||0));
    }else if(type==='parry'){
     parryChance=Number(effect.parry_chance)||.25;
    }
   }
  }else{
   const raw=basic.damage*(stats.basicAttackDamageMultiplier||1);
   actionDamage+=hit(basic.damage,'physical');
   resource=Math.min(c.resourceMax,resource+basic.resourceGain);
  }
  if(enemyHp<=0)break;
  if(ult&&resource>=ultCost&&turn>=ultimateReady){
   const defensive=ult.effect==='heal_shield'&&hp<=maxHp*.75;
   if(defensive){
    resource-=ultCost;ultimateReady=turn+Math.max(1,Number(ult.cooldown_turns)||3);
    hp=Math.min(maxHp,hp+Math.round(maxHp*(Number(ult.heal_fraction)||0)));
    shield+=Math.round(maxHp*(Number(ult.shield_fraction)||0));
   }else if(ult.effect!=='heal_shield'&&resource>=ultCost+reserve){
    resource-=ultCost;ultimateReady=turn+Math.max(1,Number(ult.cooldown_turns)||3);
    const raw=stats.dps*2.0*(stats.damageMultiplier||1);
    const hits=['aoe_burst','heal_aoe','single_burst'].includes(ult.effect)?3:1;
    for(let i=0;i<hits&&enemyHp>0;i++){
     const perHit=ult.effect==='single_burst'&&enemy.type==='boss'?Math.min(raw,enemyStats.hp*.8/3):raw;
     actionDamage+=hit(perHit,ult.damage_type||'physical',true);
    }
    if(ult.effect==='heal_aoe')hp=Math.min(maxHp,hp+Math.round(maxHp*(Number(ult.heal_fraction)||0)));
   }
  }
  if(enemyHp<=0)break;
  let incoming=Math.max(0,Math.round(enemyStats.damage*engine.mitigationMultiplier(stats.defense,stage)*(1-(stats.damageReduction||0))));
  if(debuffTurns>0){incoming=Math.round(incoming*(1-debuffPower));debuffTurns--;}
  if(parryChance>0){if(random()<parryChance)incoming=0;parryChance=0;}
  if(counter&&resource>=counterCost&&turn>=counterReady){
   const telegraph=enemy.role==='poison'?'poison':'strong_hit';
   const reaction=engine.resolveReaction(telegraph,counter.id,c.classId,incoming);
   incoming=reaction.damage;resource-=counterCost;counterReady=turn+Math.max(1,Number(counter.cooldown_turns)||2);
   if(reaction.cleansesPoison)poisonStacks=0;
  }
  if(shield>0){const absorbed=Math.min(shield,incoming);shield-=absorbed;incoming-=absorbed;}
  let phaseLethal=false;
  if(enemy.type==='boss'){
   const phase=engine.bossPhaseInfo(enemyHp,enemyStats.hp).phase;
   if(phase===4){phase4Turns++;if(phase4Turns>=Number(balance.bosses.phases.find(x=>x.phase===4)?.player_turn_deadline||3)){incoming=Number(balance.bosses.phases.find(x=>x.phase===4)?.damage_flat||9999);phaseLethal=true;}}
  }
  hp=Math.max(0,hp-incoming);
  if(enemy.role==='poison'&&!((counter||{}).effect==='cleanse')){poisonStacks++;hp=Math.max(0,hp-Math.round(maxHp*(balance.mobs.roles.poison.damage_fraction_per_turn||.01)*poisonStacks));}
  if(enemy.role==='healer'&&turn%(balance.mobs.roles.healer.every_n_turns||2)===0)enemyHp=Math.min(enemyStats.hp,enemyHp+Math.round(enemyStats.hp*(balance.mobs.roles.healer.heal_fraction||.2)));
  for(const dot of enemyDots.slice()){if(dot.ticks>0&&enemyHp>0){const dealt=hit(dot.damage,dot.type);actionDamage+=dealt;dot.ticks--;}}
  enemyDots=enemyDots.filter(x=>x.ticks>0);
  if(buffTurns>0)buffTurns--;
  if(phaseLethal)hp=0;
 }
 return{win:enemyHp<=0&&hp>0,turns:turn,hp:Math.max(0,hp),maxHp,hpPct:Math.max(0,hp)/maxHp*100,potionHpPct,usedPotion,resource,damage:actionDamage};
}
function run(){
 const rows=[];
 for(const build of builds)for(const stage of stages){
  const {engine,c}=setup(build.classId,build.branchId,stage,stage*1009+builds.indexOf(build)*97);
  const rates={};
  for(const type of types){
   let wins=0,turns=0,hp=0,potions=0;
   for(let i=0;i<trials;i++){
    c.resource=Math.round(c.resourceMax*balance.resources.starting_fraction);
    const ds=balance.mobs.damage_types||['fire','ice','dark','physical'];
    const enemy={type,weakness:ds[(stage+i)%ds.length],resistance:ds[(stage+i+2)%ds.length],role:type==='boss'?'boss':(['normal','tank','poison','healer'][(i+stage)%4])};
    const result=simulateFight(engine,c,stage,enemy,{random:rng(i+stage*10000+builds.indexOf(build)*1000000)});
    if(result.win){wins++;hp+=result.hpPct;}turns+=result.turns;if(result.usedPotion)potions++;
   }
   rates[type]={winRate:wins/trials,avgTurns:turns/trials,avgHpPct:wins?hp/wins:0,potionRate:potions/trials};
  }
  rows.push({classId:build.classId,branchId:build.branchId,branchName:build.branchName,stage,level:c.level,talentPointsSpent:Object.values(c.talents||{}).reduce((sum,n)=>sum+n,0),stats:engine.getCombatStats(c),...rates});
 }
 console.log('Специализация\tЭтап\tУровень\tТаланты\tОбычный win%\tЭлитка win%\tБосс win%\tХоды босса\tHP после босса%');
 for(const r of rows)console.log([r.classId+'.'+r.branchId,r.stage,r.level,r.talentPointsSpent,(r.normal.winRate*100).toFixed(1),(r.elite.winRate*100).toFixed(1),(r.boss.winRate*100).toFixed(1),r.boss.avgTurns.toFixed(1),r.boss.avgHpPct.toFixed(1)].join('\t'));
 for(const stage of stages){
  const at=rows.filter(r=>r.stage===stage);
  const rates=at.map(r=>r.boss.winRate);
  console.log('Боссы '+stage+': мин '+(Math.min(...rates)*100).toFixed(1)+'% · макс '+(Math.max(...rates)*100).toFixed(1)+'% · разрыв '+((Math.max(...rates)-Math.min(...rates))*100).toFixed(1)+' п.п.');
 }
 const stage250=rows.filter(r=>r.stage===250);
 console.log('SUMMARY '+JSON.stringify({builds:builds.length,branchesTested:stage250.length,allBosses250:stage250.every(r=>r.boss.winRate===1),weakBossBuilds:stage250.filter(r=>r.boss.winRate<.95).map(r=>({build:r.classId+'.'+r.branchId,winRate:r.boss.winRate})),minBossWinRate250:Math.min(...stage250.map(r=>r.boss.winRate))}));
 assert.equal(rows.filter(r=>r.stage===250).length,21,'every specialization must be measured at stage 250');
 return rows;
}
if(require.main===module)run();
module.exports={balance,builds,rng,levelAt,equip,allocateTalents,setup,simulateFight,run};
