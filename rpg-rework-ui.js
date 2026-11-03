 function enemyCounter(){
  if(!battle||battle.paused)return;
  const c=live(),enemy=battle.enemy,enemyStats=engine.getEnemyStats(c.id,battle.stage,enemy);
  if(battle.dot&&battle.dot.ticks>0){
   const dotDamage=Math.min(battle.enemyHp,battle.dot.damage);battle.enemyHp=Math.max(0,battle.enemyHp-dotDamage);battle.dot.ticks--;if(dotDamage>0)engine.applyVampirism(c.id,dotDamage);
   if(battle.enemyHp<=0){finishCurrentEnemy();return;}
  }
  if(battle.hot&&battle.hot.ticks>0){
   c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+battle.hot.heal);battle.hot.ticks--;
  }
  if(battle.enemyStunned){
   battle.enemyStunned=false;battle.busy=false;
   if(battle.pendingKill){battle.pendingKill=false;finishCurrentEnemy();return;}
   save();render();return;
  }
  let raw=enemyStats.damage;
  if(enemy.mechanic==="berserk"&&battle.enemyHp/battle.enemyMax<=balance.elite_mechanics.berserk.health_threshold)raw*=balance.elite_mechanics.berserk.damage_multiplier;
  if(enemy.mechanic==="teleport"&&!battle.teleportUsed){raw*=1+balance.elite_mechanics.teleport.bonus_damage_fraction;battle.teleportUsed=true;}
  if(battle.enemyDamageReductionUntil>Date.now())raw*=1-battle.enemyDamageReduction;
  const combatStats=engine.getCombatStats(c),damageType=enemy.damageType||"physical";
  const mitigation=damageType==="physical"?engine.mitigationMultiplier(combatStats.defense,battle.stage):engine.resistanceMultiplier(combatStats.resists[damageType]||0,battle.stage);
  let incoming=Math.max(1,Math.round(raw*mitigation*(1-combatStats.damageReduction)));
  if(battle.nextDamageShield){incoming=Math.max(0,incoming-battle.nextDamageShield);battle.nextDamageShield=0;}
  if(enemy.mechanic==="summon")incoming+=Math.round(incoming*balance.elite_mechanics.summon.minions*balance.elite_mechanics.summon.minion_health_fraction);
  if(battle.parryChance>0&&Math.random()<battle.parryChance){
   const riposte=balance.skill_effects.riposte?.damage_multiplier||1.25;
   battle.enemyHp=Math.max(0,battle.enemyHp-Math.round(combatStats.attack*riposte));
   battle.parryChance=0;
   if(battle.enemyHp<=0||battle.pendingKill){battle.pendingKill=false;finishCurrentEnemy();return;}
   c.resource=Math.min(c.resourceMax,c.resource+(classData(c).resource_gain_on_defense||0));
   battle.busy=false;save();render();return;
  }
  c.run.playerHp=Math.max(0,c.run.playerHp-incoming);
  if(enemy.mechanic==="poison"&&battle.poisonTicks<balance.elite_mechanics.poison.ticks){
   const poison=Math.round(engine.maxHp(c)*balance.elite_mechanics.poison.damage_fraction);
   c.run.playerHp=Math.max(0,c.run.playerHp-poison);battle.poisonTicks++;
  }
  c.resource=Math.min(c.resourceMax,c.resource+(classData(c).resource_gain_on_defense||0));
  battle.busy=false;save();
  if(c.run.playerHp<=0){endFromDamage();return;}
  if(battle.pendingKill){battle.pendingKill=false;finishCurrentEnemy();return;}
  engine.logCombatEvent(c.id,"Враг нанёс "+incoming+" урона");
  render();
 }
 function playerAction(useSkill){
  const c=live(),enemy=battle.enemy,effects=balance.skill_effects,combat=balance.combat;
  if(battle.busy||battle.paused)return;
  const def=classData(c),skill=activeSkill(c),combatStats=engine.getCombatStats(c);
  let damage=combatStats.attack*combat.player_damage.attack_multiplier*combatStats.damageMultiplier;
  let effect=null,resourceCost=0;
  if(useSkill){
   if(!skill){notify("Нет доступного умения");return;}
   effect=effects[skill.effect_template]||effects.strike;
   if((effect.type==="heal"||effect.type==="hot")&&((enemy.type==="elite"&&balance.healing.disallow_healing_skills_on_elite)||(enemy.type==="boss"&&balance.healing.disallow_healing_skills_on_boss))){notify("Лечение навыками запрещено против элитки и босса");return;}
   resourceCost=def.resource_cost_per_skill||effect.resource_cost||0;
   if(c.resource<resourceCost){notify("Не хватает ресурса: "+def.resource);return;}
   if(Date.now()<battle.skillReadyAt){notify("Умение ещё перезаряжается");return;}
   c.resource-=resourceCost;
   if(effect.type==="heal"&&effect.heal_multiplier)c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*effect.heal_multiplier));
   if(effect.type==="hot"&&effect.heal_multiplier)battle.hot={heal:Math.round(engine.maxHp(c)*effect.heal_multiplier),ticks:effect.ticks||3};
   if(effect.type==="shield"&&effect.shield_fraction)battle.nextDamageShield=Math.round(engine.maxHp(c)*effect.shield_fraction);
   if(effect.type==="dot"&&effect.damage_multiplier)battle.dot={damage:Math.max(1,Math.round(combatStats.attack*effect.damage_multiplier)),ticks:effect.ticks||3};
   if(effect.type==="buff"){battle.playerDamageBuff=effect.power_multiplier||0;battle.playerBuffUntil=Date.now()+(effect.duration||3)*1000;}
   if(effect.type==="debuff"){battle.enemyDamageReduction=effect.power_multiplier||0;battle.enemyDamageReductionUntil=Date.now()+(effect.duration||3)*1000;}
   if(effect.type==="control")battle.enemyStunned=true;
   if(effect.type==="parry")battle.parryChance=effect.parry_chance||0;
   if(effect.type==="riposte")damage*=effect.damage_multiplier||1.25;
   damage*=effect.damage_multiplier||combat.player_damage.skill_multiplier;
   const timeScale=balance.combat.combat_speed_base*(c.run.speed2?balance.combat.speed_2x_multiplier:1);
   battle.skillReadyAt=Date.now()+((effect.cooldown||4)*1000/(timeScale*Math.max(0.1,combatStats.attackSpeedMultiplier||1)));
   c.stats.skillsUsed=(c.stats.skillsUsed||0)+1;if(skill.branch_id)engine.recordDailyProgress(c.id,"branch_skills_used",1);engine.logCombatEvent(c.id,"Использовано умение: "+skill.name);
  }else{
   c.resource=Math.min(c.resourceMax,c.resource+(def.resource_gain_per_attack||0));
  }
  if(battle.playerDamageBuff&&battle.playerBuffUntil>Date.now())damage*=1+battle.playerDamageBuff;
  const critical=Math.random()<combatStats.critChance;
  if(critical)damage*=combatStats.critMultiplier;
  const variance=1+(Math.random()*2-1)*combat.player_damage.attack_variance;
  damage=Math.max(1,Math.round(damage*variance));
  if(battle.shield>0){const absorbed=Math.min(battle.shield,damage);battle.shield-=absorbed;damage-=absorbed;}
  const dealt=Math.min(battle.enemyHp,damage);battle.enemyHp=Math.max(0,battle.enemyHp-damage);if(dealt>0)engine.applyVampirism(c.id,dealt);
  if(enemy.mechanic==="reflect"){
   const reflected=Math.round(damage*balance.elite_mechanics.reflect.damage_fraction);
   c.run.playerHp=Math.max(0,c.run.playerHp-reflected);
  }
  if(c.run.playerHp<=0){endFromDamage();return;}
  battle.pendingKill=battle.enemyHp<=0;battle.busy=true;save();render();
  const delay=Math.round((battle.enemyStats?.attackIntervalMs||engine.combatIntervalMs(c.id))/(c.run.speed2?balance.combat.speed_2x_multiplier:1));
  clearTimeout(pendingTimer);pendingTimer=setTimeout(()=>{pendingTimer=null;if(!battle)return;if(battle.paused){battle.remainingResponseMs=0;return;}enemyCounter();},delay);
 }
 function stopBattleStatusLoop(){if(statusTimer){clearInterval(statusTimer);statusTimer=null;}}
 function startBattleStatusLoop(){
  stopBattleStatusLoop();statusTimer=setInterval(updateBattleStatus,250);
 }
 function addPoisonStack(damage,ticks){
  if(!battle)return;
  battle.poisonDots=battle.poisonDots||[];
  battle.poisonDots.push({damage,ticks,nextAt:Date.now()+1000});
 }
 function updateBattleStatus(){
  if(!battle||battle.paused)return;
  const c=live(),now=Date.now();let changed=false;
  for(const enemy of battle.enemies||[]){
   if(!enemy.alive)continue;
   if(enemy.role==="healer"&&now>=enemy.nextHealAt){
    const ally=battle.enemies.filter(x=>x.alive&&x.index!==enemy.index&&x.hp<x.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    if(ally){ally.hp=Math.min(ally.maxHp,ally.hp+Math.round(ally.maxHp*balance.mobs.roles.healer.heal_fraction));if(battle.enemy===ally)battle.enemyHp=ally.hp;changed=true;}
    enemy.nextHealAt=now+balance.mobs.roles.healer.interval_ms;
   }
   if(enemy.role==="poison"&&now>=enemy.nextPoisonAt){
    const config=balance.mobs.roles.poison;addPoisonStack(Math.round(engine.maxHp(c)*config.damage_fraction_per_second),config.duration_seconds);
    enemy.nextPoisonAt=now+config.interval_ms;changed=true;
   }
  }
  for(const dot of battle.poisonDots||[]){
   if(dot.ticks>0&&now>=dot.nextAt){
    c.run.playerHp=Math.max(0,c.run.playerHp-dot.damage);dot.ticks--;dot.nextAt=now+1000;changed=true;
    if(c.run.playerHp<=0){endFromDamage();return;}
   }
  }
  battle.poisonDots=(battle.poisonDots||[]).filter(dot=>dot.ticks>0);
  if(c.classId==="bishop"&&c.run.playerHp<=engine.maxHp(c)*balance.procs.bishop.threshold&&(battle.bishopProcReadyAt||0)<=now){
   const proc=balance.procs.bishop;c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*proc.value));
   battle.bishopProcReadyAt=now+proc.cooldown_seconds*1000;battle.proc={...proc,expiresAt:now+3000};changed=true;
  }
  if(battle.proc&&battle.proc.expiresAt&&battle.proc.expiresAt<=now){battle.proc=null;changed=true;}
  if(battle.fx&&battle.fx.until<=now){battle.fx=null;changed=true;}
  if(battle.phaseFlashUntil&&battle.phaseFlashUntil<=now){battle.phaseFlashUntil=0;battle.phaseNotice=null;changed=true;}
  if(changed){save();render();}
 }
 function triggerVfx(kind,damageType,critical){
  if(!battle)return;
  const colors={fire:"#ff713d",ice:"#73cfff",dark:"#bd83ff",physical:"#f0d18c"};
  if(!settings().disable_skill_flashes)battle.fx={kind,color:colors[damageType]||"#e8d7a8",until:Date.now()+520};
  if(critical&&!settings().disable_screen_shake)battle.shakeUntil=Date.now()+300;
 }
 function applyTargetDamage(target,rawDamage,damageType,options){
  options=options||{};
  const c=live();let multiplier=engine.damageTypeMultiplier(target,damageType||"physical");
  if(target.role==="tank"&&target.alive)multiplier*=1-balance.mobs.roles.tank.damage_reduction;
  let damage=Math.max(0,Math.round(rawDamage*multiplier));
  if(target.shield>0){const absorbed=Math.min(target.shield,damage);target.shield-=absorbed;damage-=absorbed;}
  const dealt=Math.min(target.hp,damage);target.hp=Math.max(0,target.hp-damage);
  if(dealt>0)engine.applyVampirism(c.id,dealt);
  if(target.index===battle.targetIndex){battle.enemyHp=target.hp;battle.shield=target.shield||0;}
  if(target.type==="boss")updateBossPhase();
  return{damage,dealt,multiplier,killed:target.hp<=0};
 }
 function scheduleEnemyTelegraph(){
  if(!battle||battle.paused)return;
  const target=battle.enemy,telegraphs=balance.combat.telegraphs,types=telegraphs.types,phase=target.type==="boss"?updateBossPhase():0;
  const phaseCfg=phase?balance.bosses.phases.find(p=>p.phase===phase):null;
  let choices=phaseCfg?.patterns||Object.keys(types),type=choices[Math.floor(Math.random()*choices.length)]||"strong_hit";
  if(target.role==="poison"&&Date.now()>=target.nextPoisonAt-2000)type="poison";
  let windowMs=phaseCfg?.telegraph_window_ms||telegraphs.default_window_ms;
  if(target.slowedUntil>Date.now())windowMs=Math.round(windowMs/(1-(balance.skills.counter_abilities.elemental.speed_reduction||0.3)));
  windowMs=Math.max(phaseCfg?1000:telegraphs.min_window_ms,Math.min(telegraphs.max_window_ms,windowMs));
  const visual=settings().disable_telegraphs?{icon:"",label:""}:types[type];
  battle.telegraph={type,targetIndex:target.index,startedAt:Date.now(),until:Date.now()+windowMs,windowMs,icon:visual.icon,label:visual.label,color:visual.color||"#ff465e"};
  battle.counterUsed=false;battle.counterAction=null;battle.busy=true;triggerVfx("telegraph",type==="poison"?"dark":type==="aoe"?"fire":"physical",false);
  clearTimeout(pendingTimer);pendingTimer=setTimeout(resolveEnemyTelegraph,windowMs);render();
 }
 function resolveEnemyTelegraph(){
  if(!battle||battle.paused||!battle.telegraph)return;
  const c=live(),telegraph=battle.telegraph,attacker=battle.enemies[telegraph.targetIndex];
  if(!attacker||!attacker.alive){battle.telegraph=null;battle.busy=false;render();return;}
  const enemyStats=engine.getEnemyStats(c.id,battle.stage,attacker),phase=attacker.type==="boss"?updateBossPhase():0,phaseCfg=phase?balance.bosses.phases.find(p=>p.phase===phase):null;
  let raw=enemyStats.damage*(phaseCfg?.damage_multiplier||1),countered=!!battle.counterAction,damageMultiplier=countered?0.5:1;
  if(telegraph.type==="aoe"&&countered)damageMultiplier=0;
  if(telegraph.type==="poison"&&countered){
   const dot=battle.poisonDots?.shift();damageMultiplier=0;
  }
  const counterId=battle.counterAction?.id;
  if(countered&&["shadow","barrier","roar","parry"].includes(counterId))damageMultiplier=0;
  if(countered&&counterId==="scale")damageMultiplier=0.5;
  if(countered&&counterId==="slow"){damageMultiplier=0.5;attacker.slowedUntil=Date.now()+balance.skills.counter_abilities.elemental.duration_seconds*1000;attacker.attackIntervalMs=Math.round((attacker.attackIntervalMs||enemyStats.attackIntervalMs)/(1-balance.skills.counter_abilities.elemental.speed_reduction));}
  if(countered&&counterId==="cleanse"){
   if(telegraph.type==="poison"){damageMultiplier=0;battle.poisonDots=[];}
   else damageMultiplier=0.5;
  }
  if(telegraph.type==="poison"&&!countered&&attacker.role==="poison"){
   const poison=balance.mobs.roles.poison;addPoisonStack(Math.round(engine.maxHp(c)*poison.damage_fraction_per_second),poison.duration_seconds);
   damageMultiplier=0;
  }
  if(telegraph.type==="aoe")raw*=1;
  const mitigation=engine.mitigationMultiplier(c.run.stage.mobs[telegraph.targetIndex].damageType==="magical"?engine.getCombatStats(c).resists.fire:engine.getCombatStats(c).defense,battle.stage);
  let incoming=Math.max(0,Math.round(raw*mitigation*damageMultiplier));
  if(phase===4&&!countered){
   if(c.difficulty==="easy")incoming=Math.round(engine.maxHp(c)*(1-phaseCfg.easy_miss_remaining_hp_fraction));
   else incoming=Math.max(incoming,c.run.playerHp);
  }
  if(battle.enemyDamageReductionUntil>Date.now())incoming=Math.round(incoming*(1-battle.enemyDamageReduction));
  if(battle.nextDamageShield){incoming=Math.max(0,incoming-battle.nextDamageShield);battle.nextDamageShield=0;}
  if(attacker.mechanic==="reflect"&&!countered)incoming+=Math.round(raw*balance.elite_mechanics.reflect.damage_fraction);
  c.run.playerHp=Math.max(0,c.run.playerHp-incoming);
  if(countered&&counterId==="parry")applyTargetDamage(attacker,engine.getCombatStats(c).attack,"physical");
  if(attacker.mechanic==="teleport"&&!attacker.teleportUsed){attacker.teleportUsed=true;}
  battle.telegraph=null;battle.counterAction=null;battle.busy=false;
  engine.logCombatEvent(c.id,(countered?"Контр-умение отражает ":"Вражеская атака наносит ")+incoming+" урона");
  triggerVfx("enemy-hit","physical",phase===4);
  if(c.run.playerHp<=0){endFromDamage();return;}
  if(attacker.role==="healer"&&attacker.nextHealAt<Date.now())attacker.nextHealAt=Date.now()+balance.mobs.roles.healer.interval_ms;
  save();render();
 }
 function useCounterSkill(){
  if(!battle?.telegraph||battle.counterUsed||battle.paused)return;
  const c=live(),counter=counterAbility(c),resources=balance.resources,now=Date.now(),cost=counter.resource_cost??resources.action_costs.counter;
  if((battle.counterReadyAt||0)>now){notify("Контр-умение перезаряжается");return;}
  if(c.resource<cost){notify("Не хватает ресурса для контр-умения");return;}
  c.resource-=cost;battle.counterUsed=true;battle.counterAction=counter;battle.counterReadyAt=now+counter.cooldown_seconds*1000;
  if(counter.effect==="stun")battle.enemyStunned=true;
  if(counter.effect==="cleanse"&&battle.poisonDots?.length)battle.poisonDots.shift();
  if(counter.effect==="riposte"){
   const dealt=applyTargetDamage(battle.enemies[battle.telegraph.targetIndex],engine.getCombatStats(c).attack*counter.damage_multiplier,"physical");
   if(dealt.killed){const target=battle.enemies[battle.telegraph.targetIndex];battle.targetIndex=target.index;setBattleTarget(target.index);finishCurrentEnemy();return;}
  }
  save();render();
 }
 function processCombo(slot){
  const configs=(balance.combos?.combos||[]).filter(combo=>combo.class===live().classId),completed=[];
  battle.comboProgress=battle.comboProgress||{};
  for(const combo of configs){
   const progress=battle.comboProgress[combo.id]||0,expected=Number(String(combo.chain[progress]||"").replace("slot",""))-1;
   if(expected===slot){battle.comboProgress[combo.id]=progress+1;if(progress+1>=combo.chain.length){completed.push(combo);battle.comboProgress[combo.id]=0;}}
   else battle.comboProgress[combo.id]=slot===Number(String(combo.chain[0]).replace("slot",""))-1?1:0;
  }
  return completed.sort((a,b)=>(b.bonus.damage_mult||1)-(a.bonus.damage_mult||1))[0]||null;
 }
 function useUltimate(){
  if(!battle||battle.busy||battle.paused)return;
  const c=live(),ultimate=ultimateAbility(c),resources=balance.resources,now=Date.now(),cost=ultimate.resource_cost??resources.action_costs.ultimate;
  if(battle.ultimateReadyAt>now){notify("Ультимейт ещё перезаряжается");return;}
  if(c.resource<cost){notify("Не хватает ресурса для ультимейта");return;}
  c.resource-=cost;battle.ultimateReadyAt=now+ultimate.cooldown_seconds*1000;
  const stats=engine.getCombatStats(c);
  if(ultimate.effect==="heal_shield"||ultimate.effect==="heal_aoe")c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*ultimate.heal_fraction));
  if(ultimate.effect==="heal_shield")battle.nextDamageShield=Math.round(engine.maxHp(c)*ultimate.shield_fraction);
  if(ultimate.effect==="heal_aoe"||ultimate.effect==="aoe_burst"){
   for(const target of battle.enemies.filter(x=>x.alive))applyTargetDamage(target,stats.attack*ultimate.damage_multiplier,ultimate.damage_type);
  }else if(ultimate.effect==="single_burst")applyTargetDamage(battle.enemy,stats.attack*ultimate.damage_multiplier,ultimate.damage_type);
  triggerVfx("ultimate",ultimate.damage_type,false);
  if(!battle.enemy.alive||battle.enemy.hp<=0){finishCurrentEnemy();return;}
  save();render();scheduleEnemyTelegraph();
 }
 function enemyCounter(){resolveEnemyTelegraph();}
 function playerAction(skillId,slotIndex){
  if(!battle||battle.busy||battle.paused)return;
  const c=live(),enemy=battle.enemy,combat=balance.combat,resources=balance.resources,stats=engine.getCombatStats(c);
  let skill=null,effect=null,damage=stats.attack*combat.player_damage.attack_multiplier*stats.damageMultiplier,damageType="physical",resourceCost=0,guaranteedCrit=false,comboBonus=null;
  if(skillId){
   skill=skills.find(item=>item.id===skillId);
   if(!skill||!engine.skillAvailable(c,skill)){notify("Умение недоступно");return;}
   effect=balance.skill_effects[skill.effect_template]||balance.skill_effects.strike;damageType=skill.damage_type||"physical";
   resourceCost=resources.action_costs.attack_skill;
   if(c.classId==="duelist")resourceCost=resources.class_costs.duelist.attack_skill;
   const freeSkill=battle.freeSkillCharges>0;if(freeSkill){resourceCost=0;battle.freeSkillCharges--;}
   if(c.resource<resourceCost){notify("Не хватает ресурса: "+classData(c).resource);return;}
   const readyAt=battle.skillCooldowns?.[skill.id]||0;if(readyAt>Date.now()){notify("Умение ещё перезаряжается");return;}
   c.resource-=resourceCost;
   if(effect.type==="heal"&&effect.heal_multiplier)c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*effect.heal_multiplier));
   if(effect.type==="hot"&&effect.heal_multiplier)battle.hot={heal:Math.round(engine.maxHp(c)*effect.heal_multiplier),ticks:effect.ticks||3};
   if(effect.type==="shield"&&effect.shield_fraction)battle.nextDamageShield=Math.round(engine.maxHp(c)*effect.shield_fraction);
   if(effect.type==="dot"&&effect.damage_multiplier)battle.dot={damage:Math.max(1,Math.round(stats.attack*effect.damage_multiplier)),ticks:effect.ticks||3};
   if(effect.type==="buff"){battle.playerDamageBuff=effect.power_multiplier||0;battle.playerBuffUntil=Date.now()+(effect.duration||3)*1000;battle.buffsUsed=(battle.buffsUsed||0)+1;}
   if(effect.type==="debuff"){battle.enemyDamageReduction=effect.power_multiplier||0;battle.enemyDamageReductionUntil=Date.now()+(effect.duration||3)*1000;}
   if(effect.type==="control")battle.enemyStunned=true;
   if(effect.type==="parry")battle.parryChance=effect.parry_chance||0;
   damage*=effect.damage_multiplier||combat.player_damage.skill_multiplier;
   const cooldown=(effect.cooldown||4)*1000/(combat.combat_speed_base*(c.run.speed2?combat.speed_2x_multiplier:1));
   battle.skillCooldowns=battle.skillCooldowns||{};battle.skillCooldowns[skill.id]=Date.now()+cooldown;
   const combo=processCombo(slotIndex);
   if(combo){comboBonus=combo.bonus;damage*=combo.bonus.damage_mult||1;guaranteedCrit=!!combo.bonus.guaranteed_crit;}
   if(skill.branch_id)engine.recordDailyProgress(c.id,"branch_skills_used",1);
   engine.logCombatEvent(c.id,"Использовано умение: "+skill.name);
  }else{
   const regen=resources.regeneration.auto_attack||3;c.resource=Math.min(c.resourceMax,c.resource+regen);
   battle.attacksThisFight=(battle.attacksThisFight||0)+1;
  }
  if(battle.playerDamageBuff&&battle.playerBuffUntil>Date.now())damage*=1+battle.playerDamageBuff;
  if(c.classId==="assassin"&&battle.assassinNextHit){damage*=balance.procs.assassin.value;battle.assassinNextHit=false;battle.proc=null;}
  if(c.classId==="elemental"&&battle.elementalNextBonus){damage*=balance.procs.elemental.value;battle.elementalNextBonus=false;battle.proc=null;}
  const distinctType=skill?skill.damage_type||"physical":"physical";
  if(!battle.distinctElements.includes(distinctType)){battle.distinctElements.push(distinctType);if(c.classId==="elemental"&&battle.distinctElements.length>=2){battle.elementalNextBonus=true;battle.proc={...balance.procs.elemental,expiresAt:Date.now()+6000};}}
  const critical=guaranteedCrit||Math.random()<stats.critChance;
  if(critical)damage*=stats.critMultiplier;
  const variance=1+(Math.random()*2-1)*combat.player_damage.attack_variance;damage=Math.max(1,Math.round(damage*variance));
  const dealt=applyTargetDamage(enemy,damage,damageType);
  if(c.classId==="assassin"&&critical)battle.assassinNextHit=true;
  if(c.classId==="duelist"&&battle.attacksThisFight>=3&&!battle.freeSkillCharges){battle.freeSkillCharges=1;battle.proc={...balance.procs.duelist,expiresAt:Date.now()+8000};}
  if(c.classId==="dragonkin"&&battle.attacksThisFight>=5&&!battle.dragonkinProc){battle.nextDamageShield=Math.round(engine.maxHp(c)*balance.procs.dragonkin.value);battle.dragonkinProc=true;battle.proc={...balance.procs.dragonkin,expiresAt:Date.now()+8000};}
  if(c.classId==="shaman"&&battle.buffsUsed>=balance.procs.shaman.buffs_required){battle.poisonDots=[];battle.buffsUsed=0;battle.proc={...balance.procs.shaman,expiresAt:Date.now()+5000};}
  if(enemy.mechanic==="reflect"&&dealt.dealt>0)c.run.playerHp=Math.max(0,c.run.playerHp-Math.round(dealt.dealt*balance.elite_mechanics.reflect.damage_fraction));
  if(c.run.playerHp<=0){endFromDamage();return;}
  triggerVfx(skill?"skill":"attack",damageType,critical);
  if(enemy.hp<=0){finishCurrentEnemy();return;}
  save();render();scheduleEnemyTelegraph();
 }
 function equipItem(itemId){
  const c=live(),item=c.bag.find(x=>x.id===itemId);
  if(!item||!item.stats){notify("Этот предмет нельзя надеть");return;}
  engine.bindItemOnUse(c.id,itemId);
  let slot=Number.isInteger(item.slot)?item.slot:(item.slot==="weapon"?0:item.slot==="chest"?1:item.slot==="head"?2:item.slot==="legs"?3:item.slot==="hands"?4:5);
  slot=Math.max(0,Math.min(c.gear.length-1,slot));
  const old=c.gear[slot];c.gear[slot]=item;c.bag=c.bag.filter(x=>x.id!==itemId);if(old)c.bag.push(old);
  c.run.playerHp=Math.min(c.run.playerHp,engine.maxHp(c));save();render();
 }
 function showScreen(name){screen=name;render();}
 function render(){
  if(!engine)return;
  if(screen==="characters")root.innerHTML='<div class="tb-v2">'+characterList()+'</div>';
  else if(screen==="map")root.innerHTML='<div class="tb-v2">'+mapScreen()+'</div>';
  else if(screen==="profile")root.innerHTML='<div class="tb-v2">'+profileScreen()+'</div>';
  else if(screen==="shop")root.innerHTML='<div class="tb-v2">'+shopScreen()+'</div>';
  else if(screen==="battle"&&battle)root.innerHTML='<div class="tb-v2">'+battleScreen()+'</div>';
  else if(screen==="systems")root.innerHTML='<div class="tb-v2">'+systemsScreen()+'</div>';
  else if(screen==="death")root.innerHTML='<div class="tb-v2">'+deathScreen()+'</div>';
  else root.innerHTML='<div class="tb-v2">'+characterList()+'</div>';
  let toast=root.querySelector(".tb-toast");
  if(!toast){toast=document.createElement("div");toast.className="tb-toast";root.querySelector(".tb-v2").appendChild(toast);}
  if(toastMessage){toast.textContent=toastMessage;}
  root.querySelectorAll(".tb-map-node").forEach(node=>{if(Number(node.dataset.stage)===selectedStage)node.classList.add("selected");});
 }
 function createCharacter(){
  const name=root.querySelector("#name")?.value||"";
  try{const created=engine.createCharacter(name,selectedClass);selectedId=created.id;engine.state.activeCharacterId=created.id;dialogOpen=false;screen="characters";selectedStage=1;save();render();notify("Персонаж создан · стартовый набор: 300 серебра, 3 зелья и 24 часа премиума");}
  catch(error){notify(error.message);}
 }
 function handleClick(event){
  const target=event.target.closest("[data-action],[data-pick],[data-class],[data-stage],[data-tab],[data-branch],[data-talent],[data-select-skill],[data-daily-claim],[data-equip],[data-refine],[data-socket],[data-merge],[data-use],[data-buy],[data-shop-tab],[data-belt-assign],[data-belt-use],[data-achievement],[data-lore],[data-stash-deposit],[data-stash-withdraw],[data-pvp-buy],[data-paragon-stat],[data-salvage],[data-craft-stone]");
  if(!target||!root.contains(target)&&!document.getElementById("rpgDialog")?.contains(target))return;
  event.preventDefault();
  if(target.dataset.pick){selectedId=target.dataset.pick;engine.state.activeCharacterId=selectedId;selectedStage=live().progress.currentStage;render();return;}
  if(target.dataset.class){selectedClass=target.dataset.class;render();return;}
  if(target.dataset.stage){selectedStage=Number(target.dataset.stage);render();return;}
  if(target.dataset.tab){profileTab=target.dataset.tab;render();return;}
  if(target.dataset.shopTab){shopTab=target.dataset.shopTab;render();return;}
  if(target.dataset.branch){try{engine.chooseBranch(live().id,target.dataset.branch);save();render();notify("Специализация выбрана");}catch(error){notify(error.message);}return;}
  if(target.dataset.talent){try{engine.useTalentPoint(live().id,target.dataset.talent,3);save();render();}catch(error){notify(error.message);}return;}
  if(target.dataset.selectSkill){
   const c=live(),def=classData(c),base=(def.base_skills||[]).find(skill=>skill.id===target.dataset.selectSkill);
   const selected=base||skills.find(skill=>skill.id===target.dataset.selectSkill);
   if(!selected||selected.unlock_level>c.level||(selected.branch_id&&selected.branch_id!==c.branch)){notify("Умение недоступно для текущего уровня или ветки");return;}
   c.activeSkillId=selected.id;save();render();notify("Активное умение выбрано: "+selected.name);return;
  }
  if(target.dataset.beltAssign){const slot=Number(window.prompt("Назначить в слот пояса (1–5):"))-1;try{engine.assignPotionBelt(live().id,slot,target.dataset.beltAssign);save();render();notify("Зелье назначено в слот "+(slot+1));}catch(error){notify(error.message);}return;}
  if(target.dataset.beltUse!==undefined){try{engine.usePotionBelt(live().id,Number(target.dataset.beltUse));save();render();notify("Зелье использовано · +40% максимального HP");}catch(error){notify(error.message);}return;}
  if(target.dataset.achievement){try{const reward=engine.claimAchievement(live().id,target.dataset.achievement);save();render();notify("Достижение получено · "+(reward.silver||0)+" серебра");}catch(error){notify(error.message);}return;}
  if(target.dataset.lore){try{const result=engine.readLore(live().id,target.dataset.lore);save();render();notify(result.alreadyRead?"Уже прочитано":"Лор прочитан · +"+result.xp+" XP");}catch(error){notify(error.message);}return;}
  if(target.dataset.stashDeposit){try{engine.stashDeposit(live().id,target.dataset.stashDeposit);save();render();notify("Предмет помещён в общий стеш");}catch(error){notify(error.message);}return;}
  if(target.dataset.stashWithdraw){try{engine.stashWithdraw(live().id,target.dataset.stashWithdraw);save();render();notify("Предмет получен из стеша");}catch(error){notify(error.message);}return;}
  if(target.dataset.pvpBuy){try{const result=engine.purchasePvpItem(live().id,target.dataset.pvpBuy);save();render();notify("Покупка за PvP-очки: "+result.item.name);}catch(error){notify(error.message);}return;}
  if(target.dataset.paragonStat){try{engine.assignParagon(live().id,target.dataset.paragonStat);save();render();notify("Очко парагона распределено");}catch(error){notify(error.message);}return;}
  if(target.dataset.salvage){if(!window.confirm("Разобрать предмет на материалы? Действие необратимо."))return;try{const result=engine.salvageItem(live().id,target.dataset.salvage);save();render();notify("Разбор: +"+result.quantity+" материалов");}catch(error){notify(error.message);}return;}
  if(target.dataset.craftStone!==undefined){try{const type=balance.equipment.stone_types.find(item=>item.class_id===live().classId&&item.branch_id===live().branch&&item.slot==="weapon");if(!type)throw new Error("Сначала выбери специализацию персонажа");const stone=engine.craftStone(live().id,type);save();render();notify("Создан камень I уровня: "+(stone.stoneType.name||stone.stoneType.id));}catch(error){notify(error.message);}return;}
  if(target.dataset.equip){equipItem(target.dataset.equip);return;}
  if(target.dataset.merge){try{const c=live(),stone=c.bag.find(x=>x.id===target.dataset.merge);if(!stone)throw new Error("Камень не найден");engine.mergeStones(c.id,stone.stoneType,stone.level);save();render();notify("Пять камней объединены");}catch(error){notify(error.message);}return;}
  if(target.dataset.use){try{const result=engine.activateItem(live().id,target.dataset.use);save();render();notify("Предмет активирован: "+result.activated);}catch(error){notify(error.message);}return;}
  if(target.dataset.dailyClaim){try{const result=engine.claimDailyQuest(live().id,target.dataset.dailyClaim);save();render();notify("Награда: "+result.rewardSilver+" серебра");}catch(error){notify(error.message);}return;}
  if(target.dataset.refine){try{const r=engine.refine(live().id,target.dataset.refine);save();render();notify(r.success?"Заточка успешна: +"+r.refine:r.destroyed?"Предмет разрушен":"Заточка не удалась");}catch(error){notify(error.message);}return;}
  if(target.dataset.socket){try{engine.addSocket(live().id,target.dataset.socket);save();render();notify("Добавлено новое гнездо");}catch(error){notify(error.message);}return;}
  if(target.dataset.stone){try{const c=live(),item=c.gear.find(x=>x&&x.id===target.dataset.stone),stone=c.bag.find(x=>x.type==="enhancement_stone"&&(x.stoneType.class_id||x.stoneType.classId)===c.classId&&(x.stoneType.branch_id||x.stoneType.branchId)===c.branch);if(!item||!stone)throw new Error("Нет подходящего камня");engine.socketStone(c.id,item.id,stone.id);save();render();notify("Камень вставлен");}catch(error){notify(error.message);}return;}
  if(target.dataset.enchant){try{const c=live(),choices=engine.rollEnchantScroll(c.id,target.dataset.enchant),choice=Number(window.prompt("Выбери зачарование (1–4):\n"+choices.map((x,i)=>(i+1)+". "+x).join("\n")))-1;if(Number.isInteger(choice)&&choice>=0&&choice<4){engine.applyEnchant(c.id,target.dataset.enchant,choice,choices);save();render();notify("Зачарование применено");}else notify("Зачарование отменено");}catch(error){notify(error.message);}return;}
  if(target.dataset.buy){try{engine.purchase(live().id,shopTab,target.dataset.buy);save();render();notify("Покупка совершена");}catch(error){notify(error.message);}return;}
  switch(target.dataset.action){
   case "new":if(engine.state.characters.length>=balance.account.max_characters){notify("Достигнут лимит персонажей: "+balance.account.max_characters);return;}dialogOpen=true;selectedClass="assassin";render();break;
   case "close":dialogOpen=false;render();break;
   case "confirm-create":createCharacter();break;
   case "play":if(!selectedId&&engine.state.characters[0])selectedId=engine.state.characters[0].id;if(!selectedId){notify("Сначала создай персонажа");return;}engine.state.activeCharacterId=selectedId;selectedStage=live().progress.currentStage;screen="map";render();save();break;
   case "characters":screen="characters";render();break;
   case "map":screen="map";battle=null;render();save();break;
   case "profile":profileTab="stats";screen="profile";render();break;
   case "systems":screen="systems";render();break;
   case "tutorial-next":try{engine.tutorialStep(live().id);save();render();}catch(error){notify(error.message);}break;
   case "tutorial-skip":try{engine.tutorialStep(live().id,"skip");save();render();notify("Туториал пропущен");}catch(error){notify(error.message);}break;
   case "tutorial-claim":try{engine.claimTutorialReward(live().id);save();render();notify("Награда туториала получена");}catch(error){notify(error.message);}break;
   case "pvp-match":try{const match=engine.matchmakePvp(live().id);save();render();notify("Соперник найден: "+match.opponent.name+(match.bot?" · бот":""));}catch(error){notify(error.message);}break;
   case "pvp-fight":try{const result=engine.simulatePvpDuel(live().id);save();render();notify((result.won?"ПОБЕДА":"ПОРАЖЕНИЕ")+" · +"+result.pointsAwarded+" PvP-очков");}catch(error){notify(error.message);}break;
   case "daily-boss":try{const boss=engine.startDailyBoss(live().id,"silver"),stats=engine.getCombatStats(live()),enemyRounds=Math.ceil(stats.maxHp/Math.max(1,boss.attack*engine.mitigationMultiplier(stats.defense,live().level))),playerRounds=Math.ceil(boss.health/Math.max(1,stats.attack)),won=playerRounds<=enemyRounds,result=engine.completeDailyBoss(live().id,won);save();render();notify(result.won?"Дневной босс побеждён · награда получена":"Дневной босс оказался сильнее");}catch(error){notify(error.message);}break;
   case "paragon-reset":try{engine.resetParagon(live().id);save();render();notify("Парагон сброшен");}catch(error){notify(error.message);}break;
   case "reset-character":{const c=live();if(!window.confirm("Полностью сбросить персонажа?")||!window.confirm("Подтверди сброс: это удалит весь прогресс и экипировку."))return;const typed=window.prompt("Введи имя персонажа:");try{const replacement=engine.resetCharacter(c.id,typed,true);selectedId=replacement.id;selectedStage=1;screen="characters";battle=null;save();render();notify("Персонаж сброшен до 1 уровня");}catch(error){notify(error.message);}break;}
   case "delete-character":{const c=live();if(!window.confirm("Удалить персонажа без возможности восстановления?")||!window.confirm("Подтверди удаление: все вещи и прогресс будут утрачены."))return;const typed=window.prompt("Введи имя персонажа:");try{engine.deleteCharacter(c.id,typed,true);selectedId=engine.state.characters[0]?.id||null;screen="characters";battle=null;save();render();notify("Персонаж удалён");}catch(error){notify(error.message);}break;}
   case "shop":screen="shop";render();break;
   case "start":beginStage();break;
   case "attack":playerAction(false);break;
   case "skill":playerAction(true);break;
   case "potion":try{engine.useHealingPotion(live().id);save();render();notify("Зелье использовано. Слот этой цели потрачен.");}catch(error){notify(error.message);}break;
   case "speed":try{engine.setSpeed2(live().id,!live().run.speed2,battle.stage);preferredSpeed2=live().run.speed2;localStorage.setItem("tb-rpg-speed-v2",preferredSpeed2?"2":"1");save();render();}catch(error){notify(error.message);}break;
   case "pause":if(battle){if(!battle.paused){battle.paused=true;if(pendingTimer){clearTimeout(pendingTimer);pendingTimer=null;battle.remainingResponseMs=Math.round((battle.enemyStats?.attackIntervalMs||engine.combatIntervalMs(live().id))/(live().run.speed2?balance.combat.speed_2x_multiplier:1));}}else{battle.paused=false;if(battle.busy){const delay=battle.remainingResponseMs===undefined?engine.combatIntervalMs(live().id):battle.remainingResponseMs;battle.remainingResponseMs=undefined;clearTimeout(pendingTimer);pendingTimer=setTimeout(()=>{pendingTimer=null;if(battle&&!battle.paused)enemyCounter();},delay);}}save();render();}break;
   case "heal-checkpoint":try{const result=engine.checkpointHeal(live().id);save();render();notify("HP восстановлено · −20% XP до этапа "+result.penaltyUntil);}catch(error){notify(error.message);}break;
   case "auto":try{const result=engine.autoBattle(live().id);selectedStage=live().progress.currentStage;save();render();notify("Авто-бой: "+result.cleared+" этапов · "+result.xp+" опыта · "+result.stopped);}catch(error){notify(error.message);}break;
   case "restart":try{engine.voluntaryRestart(live().id);selectedStage=1;screen="characters";battle=null;save();render();notify("Забег завершён добровольно · весь опыт сохранён");}catch(error){notify(error.message);}break;
   case "reset-talents":try{engine.resetTalents(live().id);save();render();notify("Таланты сброшены");}catch(error){notify(error.message);}break;
   case "confirm-death":{const result=engine.confirmDeath(live().id);selectedId=live().id;selectedStage=live().progress.currentStage;screen="map";save();render();notify(result.runEnded?"Все жизни потеряны · забег начнётся с этапа 1":"Потеряна одна жизнь · осталось "+result.livesRemaining+" · продолжаем с этапа "+selectedStage);break;}
  }
 }
 root.addEventListener("pointerup",function(event){if(event.target.closest(".tb-v2"))event.stopImmediatePropagation();},true);
 document.addEventListener("click",handleClick);
 root.addEventListener("change",event=>{
  const field=event.target.closest("[data-setting]");if(!field||!live())return;
  const key=field.dataset.setting,value=field.type==="checkbox"?field.checked:field.type==="range"?Number(field.value):field.value;
  try{
   if(key==="difficulty"){engine.setDifficulty(live().id,value);notify("Сложность изменена");}
   else engine.saveSettings({[key]:value});
   save();render();
  }catch(error){notify(error.message);render();}
 });
 function pauseForFocusLoss(){if((engine.state.account.settings||{}).auto_pause_on_blur===false)return;if(screen==="battle"&&battle&&!battle.paused){battle.paused=true;if(pendingTimer){clearTimeout(pendingTimer);pendingTimer=null;battle.remainingResponseMs=engine.combatIntervalMs(live().id);}save();render();}}
 document.addEventListener("visibilitychange",()=>{if(document.hidden)pauseForFocusLoss();});window.addEventListener("blur",pauseForFocusLoss);
 window.addEventListener("pagehide",()=>{try{if(engine&&live()){engine.publishGhostSnapshot(live().id,"exit");save();}}catch(error){console.warn("Ghost snapshot on exit failed",error);}});
 function boot(){
  if(!window.TowerboundReworkReady)return;
  window.TowerboundReworkReady.then(async value=>{
   if(!value)return;
   engine=value;balance=engine.balance;
   try{const response=await fetch("./configs/skills/catalog.json");if(response.ok)skills=await response.json();}catch(error){console.warn("Skill catalog unavailable",error);}
   if(engine.state.characters.length){selectedId=engine.state.activeCharacterId||engine.state.characters[0].id;screen="characters";}
   render();
  }).catch(error=>console.error("Towerbound rework UI failed",error));
 }
 boot();
})();