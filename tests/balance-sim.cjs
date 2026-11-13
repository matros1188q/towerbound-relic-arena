'use strict';

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {createEngine}=require('../rpg-rework-v2.js');

const configDir=path.join(__dirname,'../configs/balance');
const balance=Object.fromEntries(fs.readdirSync(configDir)
 .filter(file=>file.endsWith('.json'))
 .map(file=>[file.slice(0,-5),JSON.parse(fs.readFileSync(path.join(configDir,file),'utf8'))]));
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'../configs/skills/catalog.json'),'utf8'));
const classes=Object.entries(balance.classes.classes).flatMap(([classId,definition])=>
 (definition.branches||[]).map(branch=>({classId,className:definition.name,branchId:branch.id,branchName:branch.name,branch})));
const checkpoints=[30,50,100,150,250];
const enemyTypes=['normal','elite','boss'];
const trials=150;
const damageTypes=balance.mobs.damage_types||['fire','ice','dark','physical'];

function rng(seed){
 let value=seed>>>0;
 return()=>((value=(value*1664525+1013904223)>>>0)/4294967296);
}
function levelAt(stage){
 const anchors=balance.character_curves.level_to_stage_anchors;
 for(let i=1;i<anchors.length;i++){
  if(stage<=anchors[i].stage){
   const before=anchors[i-1],after=anchors[i],ratio=(stage-before.stage)/(after.stage-before.stage);
   return Math.round(before.level+(after.level-before.level)*ratio);
  }
 }
 return anchors[anchors.length-1].level;
}
function rarityScale(rarity){
 return({'Обычная':1,'Редкая':1.35,'Эпическая':1.8,'Легендарная':2.4,'Богоподобная':3.2})[rarity]||1;
}
function equipReferenceSet(character,stage){
 const itemLevel=Math.min(balance.item_level.max,Math.max(balance.item_level.min,stage));
 const scale=(2+itemLevel*.65)*rarityScale('Эпическая');
 const profiles={
  weapon:{attack:Math.max(1,Math.round(scale*1.8)),crit:.01},
  chest:{defense:Math.max(1,Math.round(scale*1.1)),health:Math.max(5,Math.round(scale*6))},
  head:{defense:Math.max(1,Math.round(scale*.8)),health:Math.max(3,Math.round(scale*2.5))},
  legs:{defense:Math.max(1,Math.round(scale*.65)),health:Math.max(4,Math.round(scale*3.2))},
  hands:{attack:Math.max(1,Math.round(scale*.55)),defense:Math.max(1,Math.round(scale*.3)),crit:.008},
  accessory:{attack:Math.max(1,Math.round(scale*.8)),health:Math.max(2,Math.round(scale*1.5)),crit:.009,spellPower:Math.max(0,Math.round(scale*.45))}
 };
 const slots=Object.keys(profiles);
 character.gear=slots.map((slot,index)=>({
  id:'balance-'+character.classId+'-'+character.branch+'-'+slot,
  type:'equipment',name:'Матрица баланса · '+slot,slot,itemLevel,rarity:'Эпическая',
  branch:character.branch,setId:character.classId+'.'+character.branch+'.set.epic',
  stats:{...profiles[slot]},refine:0,sockets:[],installedGems:[],enchant:null
 }));
}
function allocateTalents(character,branch){
 let points=Math.max(0,Number(character.level)-1);
 character.talents={};
 const priority={attack:0,skill_power:0,critical:1,defense:2,health:3,attack_speed:4};
 const talents=(branch.talents||[]).slice().sort((a,b)=>
  (priority[a.effect_template]??5)-(priority[b.effect_template]??5));
 for(const talent of talents){
  const ranks=Math.min(Number(talent.max_rank)||3,points);
  if(ranks>0)character.talents[talent.id]=ranks;
  points-=ranks;
  if(points<=0)break;
 }
 character.talentPoints=points;
}
function skillPool(character,branchId){
 const definition=balance.classes.classes[character.classId];
 const base=(definition.base_skills||[]).filter(skill=>skill.type==='active'&&Number(skill.unlock_level||1)<=character.level);
 const specialized=catalog.filter(skill=>skill.class_id===character.classId&&skill.branch_id===branchId&&skill.is_active!==false&&Number(skill.unlock_level||1)<=character.level);
 // Match the default six-slot layout: all available class skills first, then the first specialization skills.
 return [...base,...specialized].filter((skill,index,all)=>all.findIndex(other=>other.id===skill.id)===index).slice(0,6);
}
function makeEnemy(engine,character,stage,type,seed){
 const index=0;
 return{
  index,type,role:type==='boss'?'boss':'normal',weakness:damageTypes[(stage+seed)%damageTypes.length],
  resistance:damageTypes[(stage+seed+2)%damageTypes.length],mobId:null,statMultiplier:1,
  ...engine.getEnemyStats(character.id,stage,{type,role:type==='boss'?'boss':'normal'})
 };
}
function setupBuild(classId,branchId,stage,seed){
 const random=rng(seed);
 const engine=createEngine(balance,{random,now:()=>Date.UTC(2026,10,10)});
 engine.createCharacter('Matrix '+classId+' '+branchId,classId);
 const character=engine.state.characters[0];
 character.level=levelAt(stage);
 character.talentPoints=Math.max(0,character.level-1);
 character.branch=branchId;
 character.progress.highestEver=Math.max(0,stage-1);
 character.progress.currentStage=stage;
 character.run.runModifierId='last_stand';
 character.run.offeredModifierIds=['last_stand'];
 const branch=(balance.classes.classes[classId].branches||[]).find(item=>item.id===branchId);
 allocateTalents(character,branch);
 equipReferenceSet(character,stage);
 character.run.active=true;
 character.run.playerHp=engine.maxHp(character);
 character.resource=Math.round(character.resourceMax*balance.resources.starting_fraction);
 character.run.stage={
  stage,mobs:[],targetIndex:0,enemyIndex:0,killedIndices:[],potionUsedTargets:[],
  potionSlotUsed:false,bossPhase:1,startedAt:Date.UTC(2026,10,10)
 };
 return{engine,character,branch,skills:skillPool(character,branchId),random};
}
function skillEffect(skill){
 return balance.skill_effects[skill.effect_template]||balance.skill_effects.strike||{};
}
function skillCost(character,skill,effect){
 if(character.classId==='duelist')return Number(balance.resources.class_costs?.duelist?.attack_skill??22);
 return Number(skill.resource_cost??skill.cost??effect.resource_cost??balance.resources.action_costs.attack_skill??22);
}
function skillCooldown(skill,effect){
 return Math.max(1,Number(skill.cooldown_turns??effect.cooldown_turns??effect.cooldown??4));
}
function buildCombat(engine,character,stage,type,seed){
 const enemy=makeEnemy(engine,character,stage,type,seed);
 character.run.stage.mobs=[enemy];
 const stats=engine.getCombatStats(character);
 const basic=engine.basicAttackStats(character.id);
 const maxHp=engine.maxHp(character);
 const targets=[{
  ...enemy,hp:enemy.hp,maxHp:enemy.hp,alive:true,dead:false,shield:0,guardCharges:0,
  turnsTaken:0,provoked:false,attackStats:engine.getEnemyStats(character.id,stage,enemy)
 }];
 return{
  engine,character,stage,type,seed,stats,basic,maxHp,hp:maxHp,targets,skills:skillPool(character,character.branch),
  skillCooldowns:{},ultimateCooldown:0,counterCooldown:0,playerDamageBuff:0,playerDamageBuffTurns:0,
  enemyDamageReduction:0,enemyDamageReductionTurns:0,nextDamageShield:0,counterPrimed:false,
  poisonStacks:0,dots:[],hot:null,enemyStunned:false,parryChance:0,attacks:0,freeSkillCharges:0,
  assassinNextHit:false,elementalLastType:null,elementalNextBonus:false,dragonkinShieldReady:false,
  bishopProcUsed:false,buffsUsed:0,bossTurns:0,bossPhase4At:null,bossAddsSummoned:false,
  turn:0,potionsUsed:0,random:rng(seed+7919),failed:false,skillUseCount:{}
 };
}
function currentTarget(fight){
 return fight.targets.find(enemy=>enemy.alive&&enemy.type==='boss')||
  fight.targets.find(enemy=>enemy.alive)||null;
}
function applyDamage(fight,target,raw,damageType,kind){
 if(!target||!target.alive||target.hp<=0)return 0;
 const engine=fight.engine,character=fight.character;
 let multiplier=engine.damageTypeMultiplier(target,damageType||'physical');
 if(target.role==='tank'&&target.guardCharges>0){
  multiplier*=1-(balance.mobs.roles.tank.shield_fraction||.1);
  target.guardCharges--;
 }
 let damage=Math.max(0,Math.round(Math.max(0,raw)*multiplier));
 if(target.type==='boss')damage=engine.capBossDamage(target,damage,0,kind==='ultimate'?'ultimate':undefined);
 if(target.shield>0){
  const absorbed=Math.min(target.shield,damage);
  target.shield-=absorbed;damage-=absorbed;
 }
 const before=target.hp,dealt=Math.min(before,damage);
 target.hp=Math.max(0,before-damage);
 if(dealt>0){
  target.lastDamagedByPlayer=true;
  if(target.role==='healer')target.provoked=true;
  engine.applyVampirism(character.id,dealt);
  fight.hp=character.run.playerHp;
 }
 if(target.hp<=0){target.alive=false;target.dead=true;target.hp=0;}
 if(target.type==='boss'&&target.alive){
  const phase=engine.bossPhaseInfo(target.hp,target.maxHp).phase;
  if(phase===4&&fight.bossPhase4At===null)fight.bossPhase4At=fight.turn;
 }
 return dealt;
}
function maybeSummonBossAdds(fight){
 const boss=fight.targets.find(enemy=>enemy.type==='boss');
 if(!boss||!boss.alive||fight.bossAddsSummoned||boss.hp/boss.maxHp>.70)return;
 fight.bossAddsSummoned=true;
 const additions=[
  {type:'normal',role:'poison',weakness:null,resistance:null},
  {type:'normal',role:'normal',weakness:null,resistance:null}
 ];
 for(const definition of additions){
  const index=fight.targets.length;
  const mob={index,type:definition.type,role:definition.role,weakness:damageTypes[(fight.stage+index)%damageTypes.length],resistance:damageTypes[(fight.stage+index+2)%damageTypes.length],statMultiplier:1};
  const stats=fight.engine.getEnemyStats(fight.character.id,fight.stage,mob);
  const target={...mob,hp:stats.hp,maxHp:stats.hp,alive:true,dead:false,shield:0,guardCharges:0,turnsTaken:0,provoked:false,attackStats:stats};
  fight.targets.push(target);
  fight.character.run.stage.mobs.push(mob);
 }
}
function applySkillAction(fight,skill,slotIndex){
 const character=fight.character,engine=fight.engine,stats=fight.stats,effect=skillEffect(skill);
 const effectType=effect.type||'strike',target=currentTarget(fight);
 if(!target)return 0;
 const cost=fight.freeSkillCharges>0?0:skillCost(character,skill,effect);
 if(character.resource<cost)return 0;
 character.resource=Math.max(0,character.resource-cost);
 if(fight.freeSkillCharges>0)fight.freeSkillCharges--;
 fight.skillCooldowns[skill.id]=skillCooldown(skill,effect);
 fight.skillUseCount[skill.id]=(fight.skillUseCount[skill.id]||0)+1;
 let dealt=0,raw=0,damageType=skill.damage_type||'physical';
 let crit=false;
 if(character.classId==='assassin'&&fight.assassinNextHit){
  fight.assassinNextHit=false;raw*=balance.procs.assassin.value;
 }
 const branchStats=balance.classes.branch_stat_bonuses?.[character.classId+'.'+character.branch]||{};
 const branchExtra=character.classId==='destroyer'&&character.branch==='wand_shield'
  ?stats.defense*(Number(branchStats.defense_damage_fraction)||.5):0;
 const modifier=(character.run.runModifierId==='last_stand'&&fight.hp/Math.max(1,fight.maxHp)<=.3)?1.4:1;
 const damageMultiplier=stats.damageMultiplier*(fight.playerDamageBuffTurns>0?1+fight.playerDamageBuff:1);
 const comboList=(balance.combos?.combos||[]).filter(combo=>combo.class===character.classId);
 let comboMultiplier=1,guaranteedCrit=false;
 for(const combo of comboList){
  const progress=fight.comboProgress?.[combo.id]||0;
  const expected=Number(String(combo.chain[progress]||'').replace('slot',''))-1;
  if(expected===slotIndex){
   fight.comboProgress=fight.comboProgress||{};fight.comboProgress[combo.id]=progress+1;
   if(progress+1>=combo.chain.length){
    comboMultiplier=Number(combo.bonus.damage_mult)||1;
    guaranteedCrit=!!combo.bonus.guaranteed_crit;
    fight.comboProgress[combo.id]=0;
   }
  }else{
   fight.comboProgress=fight.comboProgress||{};
   fight.comboProgress[combo.id]=slotIndex===Number(String(combo.chain[0]).replace('slot',''))-1?1:0;
  }
 }
 if(['strike','aoe','execute','control'].includes(effectType)){
  const skillMultiplier=Number(skill.damage_multiplier??skill.damage??effect.damage_multiplier??1);
  raw=stats.dps*(balance.combat.turn_based.skill_dps_multiplier||2.5)*damageMultiplier*skillMultiplier*(Number(skill.power_multiplier)||1)+branchExtra;
  raw*=modifier*comboMultiplier;
  if(character.classId==='assassin'&&fight.assassinNextHit){raw*=balance.procs.assassin.value;fight.assassinNextHit=false;}
  if(character.classId==='elemental'&&fight.elementalNextBonus){raw*=balance.procs.elemental.value;fight.elementalNextBonus=false;}
  if(fight.random()<stats.critChance||guaranteedCrit){raw*=stats.critMultiplier;crit=true;}
  if(effectType==='aoe'){
   for(const foe of fight.targets.filter(item=>item.alive))dealt+=applyDamage(fight,foe,raw,damageType,'skill');
  }else dealt=applyDamage(fight,target,raw,damageType,'skill');
  if(effectType==='control')fight.enemyStunned=true;
 }else if(effectType==='dot'){
  const dotDamage=Math.max(1,Math.round(stats.dps*(effect.damage_multiplier||.45)*(Number(skill.power_multiplier)||1)*
   (character.classId==='assassin'&&character.branch==='poison'?(Number(branchStats.dot_damage_multiplier)||1.15):1)));
  fight.dots.push({targetIndex:target.index,damage:dotDamage,ticks:Math.max(1,Number(effect.ticks)||3),damageType});
 }else if(effectType==='heal'||effectType==='hot'){
  const heal=Math.round(fight.maxHp*(effect.heal_multiplier||0)*(stats.healingMultiplier||1));
  if(effectType==='hot')fight.hot={heal,ticks:Math.max(1,Number(effect.ticks)||3)};
  else fight.hp=Math.min(fight.maxHp,fight.hp+heal);
  character.run.playerHp=fight.hp;
 }else if(effectType==='shield'){
  fight.nextDamageShield=Math.max(fight.nextDamageShield,Math.round(fight.maxHp*(effect.shield_fraction||0)));
 }else if(effectType==='buff'){
  fight.playerDamageBuff=Number(effect.power_multiplier)||0;
  fight.playerDamageBuffTurns=Math.max(1,Number(effect.duration_turns||effect.duration)||3);
  fight.buffsUsed++;
  if(character.classId==='shaman'&&fight.buffsUsed>=balance.procs.shaman.buffs_required)fight.poisonStacks=0;
 }else if(effectType==='debuff'){
  fight.enemyDamageReduction=Number(effect.power_multiplier)||0;
  fight.enemyDamageReductionTurns=Math.max(1,Number(effect.duration_turns||effect.duration)||3);
  if(character.classId==='shaman'&&character.branch==='dark_gods'){
   const curse=Math.max(1,Math.round(stats.dps*(effect.damage_multiplier||skill.damage_multiplier||.45)*.45*(Number(branchStats.dot_damage_multiplier)||1.15)));
   fight.dots.push({targetIndex:target.index,damage:curse,ticks:Math.max(1,Number(effect.duration)||3),damageType:'dark'});
  }
 }else if(effectType==='parry'){
  fight.parryChance=Number(effect.parry_chance)||0;
 }
 if(dealt>0){
  const companion=Math.max(1,Math.round(stats.attack*.5));
  const extra=applyDamage(fight,target,companion,'physical','skill');
  dealt+=extra;
 }
 if(character.classId==='assassin'&&crit)fight.assassinNextHit=true;
 fight.attacks++;
 if(character.classId==='duelist'&&fight.attacks>=balance.procs.duelist.attacks_required&&!fight.freeSkillCharges)fight.freeSkillCharges=1;
 if(character.classId==='dragonkin'&&fight.attacks>=balance.procs.dragonkin.attacks_required&&!fight.dragonkinShieldReady){
  fight.nextDamageShield=Math.round(fight.maxHp*balance.procs.dragonkin.value);fight.dragonkinShieldReady=true;
 }
 return dealt;
}
function applyUltimate(fight){
 const character=fight.character,engine=fight.engine,stats=fight.stats,ultimate=balance.skills.ultimates[character.classId];
 if(!ultimate||fight.ultimateCooldown>0)return false;
 const cost=Number(balance.resources.class_costs?.[character.classId]?.ultimate??ultimate.resource_cost??balance.resources.action_costs.ultimate);
 if(character.resource<cost)return false;
 character.resource-=cost;fight.ultimateCooldown=Math.max(1,Number(ultimate.cooldown_turns)||3);
 if(ultimate.effect==='heal_shield'){
  fight.hp=Math.min(fight.maxHp,fight.hp+Math.round(fight.maxHp*(ultimate.heal_fraction||0)));
  fight.nextDamageShield=Math.max(fight.nextDamageShield,Math.round(fight.maxHp*(ultimate.shield_fraction||0)));
  character.run.playerHp=fight.hp;return true;
 }
 if(ultimate.effect==='heal_aoe')fight.hp=Math.min(fight.maxHp,fight.hp+Math.round(fight.maxHp*(ultimate.heal_fraction||0)));
 const raw=stats.dps*2*(stats.damageMultiplier||1);
 const targets=ultimate.effect==='aoe_burst'||ultimate.effect==='heal_aoe'
  ?fight.targets.filter(enemy=>enemy.alive):[currentTarget(fight)].filter(Boolean);
 for(const target of targets){
  for(let hit=0;hit<3&&target.alive;hit++){
   let damage=raw;
   if(ultimate.effect==='single_burst'&&target.type==='boss')damage=Math.min(damage,target.maxHp*.8/3);
   applyDamage(fight,target,damage,ultimate.damage_type||'physical','ultimate');
  }
 }
 return true;
}
function applyBasicAttack(fight){
 const character=fight.character,target=currentTarget(fight);
 if(!target)return;
 const profile=fight.basic;
 let damage=profile.damage*(fight.stats.damageMultiplier||1);
 if(character.run.runModifierId==='last_stand'&&fight.hp/fight.maxHp<=.3)damage*=1; // The modifier boosts skill actions, not the basic-attack button.
 applyDamage(fight,target,damage,'physical','basic');
 character.resource=Math.min(character.resourceMax,character.resource+profile.resourceGain);
 fight.attacks++;
 if(character.classId==='duelist'&&fight.attacks>=balance.procs.duelist.attacks_required&&!fight.freeSkillCharges)fight.freeSkillCharges=1;
 if(character.classId==='dragonkin'&&fight.attacks>=balance.procs.dragonkin.attacks_required&&!fight.dragonkinShieldReady){
  fight.nextDamageShield=Math.round(fight.maxHp*balance.procs.dragonkin.value);fight.dragonkinShieldReady=true;
 }
}
function usePotionIfNeeded(fight){
 if(fight.hp>fight.maxHp*.6)return;
 const target=currentTarget(fight);
 if(!target)return;
 const stage=fight.character.run.stage;
 stage.targetIndex=target.index;stage.enemyIndex=target.index;
 if((stage.potionUsedTargets||[]).includes(target.index))return;
 let stack=fight.character.bag.find(item=>item.type==='healing_potion'&&(item.quantity||0)>0);
 if(!stack&&fight.character.silver>=Number(balance.economy.silver_store.heal_25||25)){
  try{fight.engine.purchase(fight.character.id,'silver','heal_25');}
  catch(error){return;}
  stack=fight.character.bag.find(item=>item.type==='healing_potion'&&(item.quantity||0)>0);
 }
 if(!stack)return;
 try{
  fight.engine.useHealingPotion(fight.character.id,stack.id);
  fight.hp=fight.character.run.playerHp;fight.potionsUsed++;
 }catch(error){}
}
function enemyPhase(fight){
 const character=fight.character,branchStats=balance.classes.branch_stat_bonuses?.[character.classId+'.'+character.branch]||{};
 const order=fight.targets.filter(enemy=>enemy.alive).slice().sort((a,b)=>(Number(b.speed)||1)-(Number(a.speed)||1));
 for(const enemy of order){
  if(!enemy.alive||fight.hp<=0)continue;
  enemy.turnsTaken=(enemy.turnsTaken||0)+1;
  if(enemy.type==='boss'){
   fight.bossTurns++;
   if(fight.bossTurns>15){fight.hp=0;character.run.playerHp=0;break;}
  }
  if(fight.enemyStunned){fight.enemyStunned=false;continue;}
  if(enemy.role==='healer'&&enemy.provoked)enemy.provoked=false;
  else if(enemy.role==='healer'&&enemy.turnsTaken%2===0){
   const ally=fight.targets.find(item=>item.alive&&item.index!==enemy.index&&item.hp<item.maxHp);
   if(ally)ally.hp=Math.min(ally.maxHp,ally.hp+Math.round(ally.maxHp*(balance.mobs.roles.healer.heal_fraction||.2)));
   continue;
  }
  if(enemy.role==='tank'&&enemy.turnsTaken%3===0)enemy.guardCharges=1;
  if(enemy.role==='poison')fight.poisonStacks++;
  const raw=enemy.attackStats.damage;
  if(fight.counterPrimed){
   fight.counterPrimed=false;
   applyDamage(fight,enemy,raw,'physical','counter');
   continue;
  }
  const chance=Number(branchStats.counterattack_chance)||Math.max(Number(fight.parryChance)||0,0);
  fight.parryChance=0;
  if(chance>0&&fight.random()<chance){
   const riposte=Math.max(1,Math.round(fight.stats.dps*(Number(branchStats.counterattack_damage_multiplier)||(character.classId==='dragonkin'?.75:1.2))));
   applyDamage(fight,enemy,riposte,character.classId==='dragonkin'?'ice':'physical','counter');
   continue;
  }
  let incoming=Math.max(0,Math.round(raw*fight.engine.mitigationMultiplier(fight.stats.defense,fight.stage)));
  if(fight.enemyDamageReductionTurns>0)incoming=Math.round(incoming*(1-fight.enemyDamageReduction));
  if(fight.nextDamageShield>0){
   const absorbed=Math.min(incoming,fight.nextDamageShield);
   fight.nextDamageShield-=absorbed;incoming-=absorbed;
  }
  fight.hp=Math.max(0,fight.hp-incoming);character.run.playerHp=fight.hp;
  if(character.classId==='bishop'&&fight.hp<=fight.maxHp*balance.procs.bishop.threshold&&!fight.bishopProcUsed){
   fight.hp=Math.min(fight.maxHp,fight.hp+Math.round(fight.maxHp*balance.procs.bishop.value));
   character.run.playerHp=fight.hp;fight.bishopProcUsed=true;
  }
 }
 if(fight.poisonStacks>0){
  const tick=Math.round(fight.maxHp*.05*fight.poisonStacks);
  fight.hp=Math.max(0,fight.hp-tick);character.run.playerHp=fight.hp;
 }
 if(fight.hp<=0)fight.failed=true;
}
function decrementTurnEffects(fight){
 for(const id of Object.keys(fight.skillCooldowns))fight.skillCooldowns[id]=Math.max(0,fight.skillCooldowns[id]-1);
 fight.ultimateCooldown=Math.max(0,fight.ultimateCooldown-1);
 fight.counterCooldown=Math.max(0,fight.counterCooldown-1);
 if(fight.playerDamageBuffTurns>0&&--fight.playerDamageBuffTurns===0)fight.playerDamageBuff=0;
 if(fight.enemyDamageReductionTurns>0&&--fight.enemyDamageReductionTurns===0)fight.enemyDamageReduction=0;
 if(fight.hot?.ticks>0){
  fight.hp=Math.min(fight.maxHp,fight.hp+fight.hot.heal);fight.character.run.playerHp=fight.hp;
  fight.hot.ticks--;
  if(fight.hot.ticks<=0)fight.hot=null;
 }
}
function playerTurn(fight){
 const target=currentTarget(fight);
 if(!target)return;
 usePotionIfNeeded(fight);
 const character=fight.character;
 let acted=false;
 if(fight.ultimateCooldown<=0){
  const ultimate=balance.skills.ultimates[character.classId];
  const cost=Number(balance.resources.class_costs?.[character.classId]?.ultimate??ultimate?.resource_cost??balance.resources.action_costs.ultimate);
  if(ultimate&&character.resource>=cost){
   acted=applyUltimate(fight);
   if(acted)fight.attacks++;
  }
 }
 if(!acted){
  const available=fight.skills.map((skill,index)=>({skill,index,effect:skillEffect(skill)})).filter(item=>
   (fight.skillCooldowns[item.skill.id]||0)<=0&&character.resource>=skillCost(character,item.skill,item.effect));
  const sorted=available.map(item=>{
   const effectType=item.effect.type||'strike';
   const direct=Number(item.skill.damage_multiplier??item.skill.damage??item.effect.damage_multiplier??0);
   let score=0;
   if(['strike','aoe','execute','control'].includes(effectType))score=fight.stats.dps*(balance.combat.turn_based.skill_dps_multiplier||2.5)*fight.stats.damageMultiplier*direct;
   else if(effectType==='dot')score=fight.stats.dps*(item.effect.damage_multiplier||.45)*(item.effect.ticks||3);
   else if(effectType==='buff')score=fight.stats.dps*(item.effect.power_multiplier||.12)*3;
   else if(effectType==='debuff')score=target.attackStats.damage*(item.effect.power_multiplier||.24)*2;
   else if(effectType==='shield'&&fight.hp<fight.maxHp*.5)score=fight.maxHp*(item.effect.shield_fraction||.18);
   else if((effectType==='heal'||effectType==='hot')&&fight.hp<fight.maxHp*.55)score=fight.maxHp*(item.effect.heal_multiplier||0)*(fight.stats.healingMultiplier||1);
   return{...item,score};
  }).sort((a,b)=>b.score-a.score);
  const best=sorted[0],basicDamage=fight.basic.damage*(fight.stats.damageMultiplier||1);
  if(best&&best.score>basicDamage*.95){
   if((best.effect.type==='heal'||best.effect.type==='hot')&&fight.hp>fight.maxHp*.55)applyBasicAttack(fight);
   else if(best.effect.type==='shield'&&fight.nextDamageShield>0)applyBasicAttack(fight);
   else applySkillAction(fight,best.skill,best.index);
   acted=true;
  }
 }
 if(!acted&&fight.hp>0)applyBasicAttack(fight);
 // The live turn UI applies active DoTs after the chosen player action and before enemy initiative.
 const activeDots=fight.dots;
 for(const dot of activeDots){
  if(dot.ticks<=0)continue;
  const dotTarget=fight.targets.find(enemy=>enemy.index===dot.targetIndex&&enemy.alive);
  if(dotTarget)applyDamage(fight,dotTarget,dot.damage,dot.damageType,'dot');
  dot.ticks--;
 }
 fight.dots=activeDots.filter(dot=>dot.ticks>0);
 if(!currentTarget(fight))return;
 const enemyDamage=fight.targets.filter(enemy=>enemy.alive).reduce((sum,enemy)=>sum+enemy.attackStats.damage*fight.engine.mitigationMultiplier(fight.stats.defense,fight.stage),0);
 const counter=balance.skills.counter_abilities[character.classId];
 const counterCost=Number(balance.resources.class_costs?.[character.classId]?.counter??counter?.resource_cost??balance.resources.action_costs.counter);
 if(!fight.counterPrimed&&fight.counterCooldown<=0&&counter&&character.resource>=counterCost&&enemyDamage>fight.hp*.35){
  // Counter is a separate player action in the live UI. It replaces the primary action, so only prime it when survival is at risk.
  character.resource-=counterCost;fight.counterPrimed=true;fight.counterCooldown=Math.max(1,Number(counter.cooldown_turns)||2);
 }
 maybeSummonBossAdds(fight);
 if(fight.hp>0)enemyPhase(fight);
 if(fight.hot?.ticks>0&&fight.hp>0){/* HoT is applied at the next round boundary in decrementTurnEffects. */}
 if(fight.type==='boss'){
  const boss=fight.targets.find(enemy=>enemy.type==='boss');
  if(boss&&boss.alive&&fight.bossPhase4At!==null&&fight.turn-fight.bossPhase4At>=4){
   fight.hp=0;character.run.playerHp=0;
  }
 }
 decrementTurnEffects(fight);
 if(fight.hp<=0)fight.failed=true;
}
function simulateFight(engine,character,stage,type,seed){
 const target={
  index:0,type,role:type==='boss'?'boss':'normal',
  weakness:damageTypes[(stage+seed)%damageTypes.length],
  resistance:damageTypes[(stage+seed+2)%damageTypes.length],
  statMultiplier:1
 };
 character.run.stage.mobs=[target];
 character.run.stage.targetIndex=0;character.run.stage.enemyIndex=0;
 character.run.stage.potionUsedTargets=[];
 const fight=buildCombat(engine,character,stage,type,seed);
 const boss=fight.targets.find(enemy=>enemy.type==='boss');
 while(fight.turn<40&&fight.hp>0&&fight.targets.some(enemy=>enemy.alive)){
  fight.turn++;
  playerTurn(fight);
  if(fight.failed)break;
 }
 const won=fight.hp>0&&!fight.targets.some(enemy=>enemy.alive);
 return{won,turns:fight.turn,hpPct:Math.max(0,fight.hp)/fight.maxHp*100,potions:fight.potionsUsed,
  resource:character.resource,bossAdds:fight.bossAddsSummoned,bossHpPct:boss?Math.max(0,boss.hp)/Math.max(1,boss.maxHp)*100:0};
}
function run(){
 assert.equal(classes.length,21,'The balance matrix must cover all 21 class specializations.');
 assert.equal(catalog.length,420,'The active skill catalog must contain 420 definitions.');
 const rows=[];
 for(const build of classes){
  for(const stage of checkpoints){
   for(const type of enemyTypes){
    let wins=0,turns=0,hp=0,potions=0,adds=0;
    for(let trial=0;trial<trials;trial++){
     const seed=stage*1009+classes.indexOf(build)*997+enemyTypes.indexOf(type)*97+trial*17;
     const random=rng(seed);
     const engine=createEngine(balance,{random,now:()=>Date.UTC(2026,10,10)});
     engine.createCharacter('QA',build.classId);
     const character=engine.state.characters[0];
     character.level=levelAt(stage);character.branch=build.branchId;
     character.progress.highestEver=stage-1;character.progress.currentStage=stage;
     character.run.runModifierId='last_stand';character.run.offeredModifierIds=['last_stand'];
     allocateTalents(character,build.branch);
     equipReferenceSet(character,stage);
     character.run.active=true;character.run.playerHp=engine.maxHp(character);
     character.resource=Math.round(character.resourceMax*balance.resources.starting_fraction);
     character.run.stage={stage,mobs:[],targetIndex:0,enemyIndex:0,killedIndices:[],potionUsedTargets:[],potionSlotUsed:false,bossPhase:1};
     const result=simulateFight(engine,character,stage,type,seed+31);
     if(result.won){wins++;hp+=result.hpPct;}
     turns+=result.turns;potions+=result.potions;adds+=result.bossAdds?1:0;
    }
    rows.push({
     classId:build.classId,branchId:build.branchId,name:build.className+' · '+build.branchName,
     stage,type,winRate:wins/trials*100,avgTurns:turns/trials,avgHpPct:wins?hp/wins:0,
     avgPotions:potions/trials,bossAddsPct:adds/trials*100
    });
   }
  }
 }
 console.log('КЛАСС · СПЕЦИАЛИЗАЦИЯ\\tЭТАП\\tВРАГ\\tПОБЕДЫ %\\tХОДЫ\\tОСТАТОК HP %\\tЗЕЛЬЯ\\tПРИЗЫВЫ БОССА %');
 for(const row of rows)console.log([
  row.name,row.stage,row.type,row.winRate.toFixed(1),row.avgTurns.toFixed(2),row.avgHpPct.toFixed(1),
  row.avgPotions.toFixed(2),row.bossAddsPct.toFixed(1)
 ].join('\\t'));
 const stage250Boss=rows.filter(row=>row.stage===250&&row.type==='boss');
 const stage250Elite=rows.filter(row=>row.stage===250&&row.type==='elite');
 const failures=stage250Boss.filter(row=>row.winRate<90).concat(stage250Elite.filter(row=>row.winRate<90));
 if(failures.length){
  console.error('BUILD MATRIX FAILURES AT STAGE 250:');
  for(const row of failures)console.error(row.name+' · '+row.type+' · win '+row.winRate.toFixed(1)+'% · avg turns '+row.avgTurns.toFixed(2));
 }
 assert.equal(stage250Boss.length,21,'Every specialization must have a stage-250 boss result.');
 assert.equal(stage250Elite.length,21,'Every specialization must have a stage-250 elite result.');
 assert.ok(!failures.length,'All 21 specializations must win at least 90% of stage-250 elite and boss simulations.');
 console.log('BUILD MATRIX PASS: '+classes.length+' specializations × '+checkpoints.length+' checkpoints × '+enemyTypes.length+' encounter types × '+trials+' deterministic trials.');
 return rows;
}
if(require.main===module)run();
module.exports={balance,classes,levelAt,rng,setupBuild,simulateFight,run};
