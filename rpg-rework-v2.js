(function(root,factory){
 const api=factory();
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 if(root)root.TowerboundReworkCore=api;
})(typeof window!=="undefined"?window:globalThis,function(){
 "use strict";
 const clone=value=>JSON.parse(JSON.stringify(value));
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 const dayKey=timestamp=>new Date(timestamp).toISOString().slice(0,10);
 function createEngine(balance,options){
  options=options||{};
  if(!balance||!balance.combat||!balance.xp_curve||!balance.map||!balance.classes)throw new Error("Incomplete balance configuration");
  const random=options.random||Math.random;
  const now=options.now||Date.now;
  const state=options.state||{account:{diamonds:0,premiumUntil:0,unlocks:[],cosmetics:[]},bank:{silver:0,transfers:{}},characters:[],activeCharacterId:null};
  state.account={diamonds:0,premiumUntil:0,unlocks:[],cosmetics:[],xp:0,pvpPoints:0,ghosts:[],pvpDaily:null,starterPackClaimed:false,...(state.account||{})};
  state.bank=state.bank||{silver:0,transfers:{}};
  state.characters=state.characters||[];
  state.stash=Array.isArray(state.stash)?state.stash:[];
  state.season=state.season||null;
  state.weeklyRating=state.weeklyRating||[];
  const classTable=balance.classes.classes;
  const interpolation=(rows,value,xKey,yKey)=>{
   if(!Array.isArray(rows)||!rows.length)return 0;
   const sorted=rows.slice().sort((a,b)=>a[xKey]-b[xKey]);
   if(value<=sorted[0][xKey])return sorted[0][yKey];
   for(let i=1;i<sorted.length;i++){
    if(value<=sorted[i][xKey]){
     const a=sorted[i-1],b=sorted[i],t=(value-a[xKey])/(b[xKey]-a[xKey]);
     return a[yKey]+(b[yKey]-a[yKey])*t;
    }
   }
   const a=sorted[sorted.length-2]||sorted[0],b=sorted[sorted.length-1];
   if(a===b)return b[yKey];
   const t=(value-a[xKey])/(b[xKey]-a[xKey]);
   return a[yKey]+(b[yKey]-a[yKey])*t;
  };
  const accountLevel=()=>Math.min(balance.account.level_cap,1+Math.floor((state.account.xp||0)/balance.account.xp_per_level));
  const ensureSeason=()=>{
   const length=(balance.seasons.season_length_days||90)*86400000,seasonId=Math.floor(now()/length);
   if(!state.season||state.season.id!==seasonId){
    const pool=balance.seasons.modifiers||[],index=pool.length?Math.floor(random()*pool.length):0;
    state.season={id:seasonId,startedAt:seasonId*length,modifier:pool[index]?clone(pool[index]):null,firstClearRewardClaimed:false};
   }
   return state.season;
  };
  const difficultyOf=character=>balance.difficulty.modes[character.difficulty||balance.difficulty.default]||balance.difficulty.modes.normal;
  const rarityKey=rarity=>({Обычная:"common",Редкая:"rare",Эпическая:"epic",Легендарная:"legendary",Богоподобная:"godlike"}[rarity]||String(rarity||"common").toLowerCase());
  const stageSilver=stage=>(balance.mobs.silver_brackets||[]).find(x=>stage>=x.min&&stage<=x.max)?.amount||0;
  const itemLevelForStage=stage=>Math.max(balance.item_level.min,Math.min(balance.item_level.max,Math.floor(Number(stage)||1)));
  const equipmentItemLevelBonus=character=>(character.gear||[]).reduce((sum,item)=>sum+(item?Math.min(balance.item_level.max,item.itemLevel||item.item_level||0)*balance.item_level.stat_bonus_per_level:0),0);
  const publishGhost=(character,reason)=>{
   const stats=getCombatStats(character),expiry=now()+balance.pvp.ghost_ttl_days*86400000;
   const ghost={id:id(),characterId:character.id,name:character.name,classId:character.classId,branch:character.branch,level:character.level,bp:combatPower(character),tier:tierForBp(combatPower(character)).id,stats:{attack:stats.attack,dps:stats.dps,defense:stats.defense,maxHp:stats.maxHp,critChance:stats.critChance},gear:clone(character.gear||[]),reason,createdAt:now(),expiresAt:expiry};
   state.account.ghosts=(state.account.ghosts||[]).filter(item=>item.characterId!==character.id&&item.expiresAt>now());
   state.account.ghosts.unshift(ghost);state.account.ghosts=state.account.ghosts.slice(0,100);
   return clone(ghost);
  };
  const tierForBp=bp=>(balance.bp.tiers.find(tier=>bp>=tier.min&&(tier.max===null||bp<=tier.max))||balance.bp.tiers[0]);
  const getChar=id=>{
   const character=state.characters.find(item=>item.id===(id||state.activeCharacterId));
   if(!character)throw new Error("Character not found");
   character.buffs=character.buffs||{};
   character.potionCapacityBonus=character.potionCapacityBonus||0;
   return character;
  };
  const id=()=>"tb-"+now().toString(36)+"-"+Math.floor(random()*1000000000).toString(36);
  function activeBuff(character,kind){
   const value=character.buffs&&character.buffs[kind];
   return value&&value.expiresAt>now()?value:null;
  }
  function ensureDaily(character){
   const date=dayKey(now());
   if(!character.daily||character.daily.date!==date)character.daily={date,progress:{},claimed:[],boss:{started:false,completed:false}};
   return character.daily;
  }
  function recordDailyProgress(characterId,metric,amount){
   const character=getChar(characterId),daily=ensureDaily(character);
   daily.progress[metric]=(daily.progress[metric]||0)+Math.max(0,Math.floor(amount||1));
   return daily.progress[metric];
  }
  function dailySnapshot(characterId){
   const character=getChar(characterId),daily=ensureDaily(character);
   const quests=balance.heroic.daily_quests.map(quest=>({...clone(quest),progress:daily.progress[quest.metric]||0,complete:(daily.progress[quest.metric]||0)>=quest.target,claimed:daily.claimed.includes(quest.id)}));
   const mods=balance.heroic.map_modifiers||[],dayNumber=Math.floor(now()/86400000);
   return{date:daily.date,modifier:mods.length?clone(mods[dayNumber%mods.length]):null,quests,boss:clone(daily.boss)};
  }
  function claimDailyQuest(characterId,questId){
   const character=getChar(characterId),daily=ensureDaily(character),quest=balance.heroic.daily_quests.find(item=>item.id===questId);
   if(!quest)throw new Error("Unknown daily quest");
   if(daily.claimed.includes(questId))throw new Error("Daily quest reward already claimed");
   if((daily.progress[quest.metric]||0)<quest.target)throw new Error("Daily quest is not complete");
   daily.claimed.push(questId);character.silver+=quest.reward_silver||0;
   return{questId,rewardSilver:quest.reward_silver||0,silver:character.silver};
  }
  function startDailyBoss(characterId,currency){
   const character=getChar(characterId),daily=ensureDaily(character),cost=balance.heroic.daily_boss_cost||{};
   if(daily.boss.started)throw new Error("Daily boss has already been attempted today");
   const wallet=currency==="diamonds"?"diamonds":"silver",amount=cost[wallet]||0;
   if(wallet==="silver"){
    if(character.silver<amount)throw new Error("Not enough silver for the daily boss");
    character.silver-=amount;
   }else{
    if(state.account.diamonds<amount)throw new Error("Not enough account diamonds for the daily boss");
    state.account.diamonds-=amount;
   }
   daily.boss.started=true;daily.boss.currency=wallet;daily.boss.startedAt=now();
   return{...clone(balance.heroic.daily_boss),currency:wallet,cost:amount};
  }
  function completeDailyBoss(characterId,won){
   const character=getChar(characterId),daily=ensureDaily(character);
   if(!daily.boss.started||daily.boss.completed)throw new Error("Daily boss is not active");
   daily.boss.completed=true;daily.boss.won=!!won;
   if(!won)return{won:false,reward:null};
   const reward=balance.heroic.daily_boss_reward||{};
   character.silver+=reward.silver||0;state.account.diamonds+=reward.diamonds||0;
   return{won:true,reward:clone(reward),silver:character.silver,diamonds:state.account.diamonds};
  }
  function pvpSnapshot(characterId){
   const character=getChar(characterId),stats=getCombatStats(character),pvp=balance.pvp;
   return{classId:character.classId,level:character.level,attack:Math.round(stats.attack*pvp.damage_multiplier),defense:stats.defense,maxHp:Math.round(stats.maxHp*pvp.health_multiplier),controlDurationMultiplier:pvp.control_duration_multiplier,source:"pvp"};
  }
  function requiredXp(level){
   const curve=balance.xp_curve;
   if(level>=75&&curve.post_75_xp_per_level)return curve.post_75_xp_per_level;
   return Math.max(1,Math.round((curve.base_required+curve.per_level*Math.pow(level,curve.exponent))*curve.base_multiplier));
  }
  function levelForXp(total){
   let level=1,remaining=Math.max(0,Number(total)||0);
   while(level<balance.xp_curve.max_level&&remaining>=requiredXp(level)){remaining-=requiredXp(level);level++;}
   return level;
  }
  function equipmentTotals(character){
   const result={attack:0,defense:0,health:0,crit:0,critDamage:0,spellPower:0,fireDamage:0,iceDamage:0,darkDamage:0,fireResist:0,iceResist:0,darkResist:0,physicalResist:0,attackSpeed:0,setPieces:{},itemLevelBonus:0};
   const refine=balance.equipment.refine_stats_per_level||{attack:0,defense:0,health:0};
   for(const item of character.gear||[]){
    if(!item)continue;
    result.itemLevelBonus+=Math.min(balance.item_level.max,item.itemLevel||item.item_level||0)*balance.item_level.stat_bonus_per_level;
    for(const key of ["attack","defense","health","crit","critDamage","spellPower","fireDamage","iceDamage","darkDamage","fireResist","iceResist","darkResist","physicalResist"])result[key]+=(item.stats?.[key]||0);
    result.attack+=refine.attack*(item.refine||0);result.defense+=refine.defense*(item.refine||0);result.health+=refine.health*(item.refine||0);
    for(const socket of item.sockets||[]){
     const stone=socket.stoneType||socket.stone_type||{},level=socket.level||1;
     result.attack+=(stone.attack_per_level||0)*level;result.defense+=(stone.defense_per_level||0)*level;
     result.health+=(stone.health_per_level||0)*level;result.crit+=(stone.crit_per_level||0)*level;
     result.spellPower+=(stone.spell_power_per_level||0)*level;result.fireDamage+=(stone.fire_damage_per_level||0)*level;
     result.iceDamage+=(stone.ice_damage_per_level||0)*level;result.darkDamage+=(stone.dark_damage_per_level||0)*level;
    }
    if(item.enchant){
     const weapon=item.slot==="weapon"||item.slot===0;
     const labels=weapon?["+15% магической атаки","+15% физической атаки","+15% скорости атаки","+15% шанса крита"]:
      ["+5% магического урона","+5% физического урона","+5% магической защиты","+5% физической защиты"];
     const bonus=(balance.equipment.enchant_bonuses?.[weapon?"weapon":"armor"]||[])[labels.indexOf(item.enchant)]||{};
     result.attack+=Math.round((item.stats?.attack||0)*((bonus.magic_attack||0)+(bonus.physical_attack||0)));
     result.attackSpeed+=bonus.attack_speed||0;result.crit+=bonus.critical_chance||0;
     result.critDamage+=bonus.critical_damage||0;result.fireDamage+=bonus.magic_damage||0;result.iceDamage+=bonus.physical_damage||0;
     result.defense+=Math.round((item.stats?.defense||0)*((bonus.magic_defense||0)+(bonus.physical_defense||0)));
    }
    if(item.setId)result.setPieces[item.setId]=(result.setPieces[item.setId]||0)+1;
   }
   return result;
  }
  function setBonusTotals(character){
   const total={damage:0,damageReduction:0,skillPower:0},gear=equipmentTotals(character);
   const thresholds=balance.equipment.set_bonus_thresholds||[2,3,5];
   for(const branch of classTable[character.classId].branches||[]){
    const set=branch.set;if(!set)continue;
    const pieces=gear.setPieces[set.id]||0;
    for(const bonus of set.bonuses||[]){
     if(pieces<bonus.pieces||!thresholds.includes(bonus.pieces))continue;
     if(bonus.effect==="specialization_damage")total.damage+=bonus.value;
     if(bonus.effect==="incoming_damage_reduction")total.damageReduction+=bonus.value;
     if(bonus.effect==="specialization_power")total.skillPower+=bonus.value;
    }
   }
   return total;
  }
  function talentBonusTotals(character){
   const result={attack:0,health:0,crit:0,defense:0,attackSpeed:0,skillPower:0};
   const values=balance.classes.talent_bonuses||{},branch=(classTable[character.classId].branches||[]).find(entry=>entry.id===character.branch);
   for(const talent of branch?.talents||[]){
    const ranks=character.talents?.[talent.id]||0,key=talent.effect_template;
    if(key==="attack")result.attack+=ranks*(values.attack_per_rank||0);
    if(key==="health")result.health+=ranks*(values.health_per_rank||0);
    if(key==="critical")result.crit+=ranks*(values.crit_chance_per_rank||0);
    if(key==="defense")result.defense+=ranks*(values.defense_per_rank||0);
    if(key==="attack_speed")result.attackSpeed+=ranks*(values.attack_speed_per_rank||0);
    if(key==="skill_power")result.skillPower+=ranks*(values.skill_power_per_rank||0);
   }
   return result;
  }
  function maxHp(character){
   const stats=balance.classes.base_stats,gear=equipmentTotals(character),talent=talentBonusTotals(character);
   const curve=balance.character_curves.level_to_stage_anchors;
   const base=curve?.length?interpolation(curve,character.level,"level","hp")/(balance.character_curves.base_divisor||1.5):
    stats.base_health+Math.max(0,character.level-1)*stats.health_per_level;
   return Math.max(1,Math.round((base*(1+gear.itemLevelBonus)+gear.health)*(1+talent.health)));
  }
  function getCombatStats(characterOrId){
   const character=typeof characterOrId==="string"?getChar(characterOrId):characterOrId;
   const stats=balance.classes.base_stats,gear=equipmentTotals(character),talent=talentBonusTotals(character),sets=setBonusTotals(character);
   const anchors=balance.character_curves.level_to_stage_anchors;
   const baseDps=anchors?.length?interpolation(anchors,character.level,"level","dps")/(balance.character_curves.base_divisor||1.5):
    stats.base_attack+(character.level-1)*stats.attack_per_level;
   const dps=Math.max(1,(baseDps*(1+gear.itemLevelBonus)+gear.attack)*(1+talent.attack));
   const attack=Math.max(1,Math.round(dps*balance.combat.attack_interval));
   const defense=Math.round((stats.base_defense+(character.level-1)*stats.defense_per_level+gear.defense)*(1+talent.defense));
   const critChance=clamp((balance.combat.player_damage.crit_chance||0)+gear.crit+talent.crit,0,0.05+(balance.combat.player_damage.gear_crit_chance_bonus_cap||0.25));
   const critMultiplier=(balance.combat.player_damage.crit_multiplier||1.5)+Math.min(balance.combat.player_damage.crit_damage_bonus_cap||0.5,gear.critDamage);
   return{attack,dps,defense,armor:defense,maxHp:maxHp(character),critChance,critMultiplier,
    attackSpeedMultiplier:1+talent.attackSpeed+gear.attackSpeed,damageMultiplier:1+sets.damage+sets.skillPower+talent.skillPower,
    damageReduction:Math.min(0.75,sets.damageReduction),spellPower:gear.spellPower,fireDamage:gear.fireDamage,
    iceDamage:gear.iceDamage,darkDamage:gear.darkDamage,resists:{fire:gear.fireResist,ice:gear.iceResist,dark:gear.darkResist,physical:gear.physicalResist},
    setPieces:clone(gear.setPieces),glow:getRefinementGlow(character),itemLevelBonus:gear.itemLevelBonus};
  }
  function getRefinementGlow(character){
   const items=(character.gear||[]).filter(Boolean);
   if(!items.length||items.length!==(character.gear||[]).length)return null;
   const value=Math.min(...items.map(item=>item.refine||0));
   return balance.equipment.glow_tiers.find(tier=>value>=tier.min&&value<=tier.max)?.color||null;
  }
  function combatPower(character){
   const base=interpolation(balance.bp.base_by_level,character.level,"level","bp");
   const weight=interpolation(balance.bp.item_level_bp_per_level,character.level,"level","weight");
   const rarity=balance.bp.rarity_bp_per_item||{};
   const gear=(character.gear||[]).filter(Boolean).reduce((sum,item)=>sum+(rarity[rarityKey(item.rarity)]||rarity[item.rarity]||0)+Math.min(balance.item_level.max,item.itemLevel||item.item_level||0)*weight,0);
   return Math.round(base+gear);
  }
  function recalcLevel(character){
   const previous=character.level;
   character.level=levelForXp(character.xp);
   character.talentPoints=Math.max(0,character.level-1);
   let spent=Object.values(character.talents||{}).reduce((sum,value)=>sum+value,0);
   if(spent>character.talentPoints){
    for(const key of Object.keys(character.talents||{}).reverse()){
     while(character.talents[key]>0&&spent>character.talentPoints){character.talents[key]--;spent--;}
     if(character.talents[key]<=0)delete character.talents[key];
     if(spent<=character.talentPoints)break;
    }
   }
   if(character.level<10)character.branch=null;
   character.paragon=character.paragon||{level:0,xp:0,stats:{}};
   if(character.level>=balance.xp_curve.max_level){
    const p=balance.paragon,available=Math.min(p.max_level,Math.floor(Math.max(0,character.xp-character.xpAtLevel100||0)/p.xp_per_point));
    character.paragon.level=Math.max(character.paragon.level||0,available);
   }
   return{previous,level:character.level,lost:Math.max(0,previous-character.level),talentPoints:character.talentPoints,paragon:character.paragon.level};
  }
  function createCharacter(name,classId){
   const classData=classTable[classId];
   if(!classData)throw new Error("Unknown character class");
   const nickname=String(name||"").trim();
   if(nickname.length<2||nickname.length>18)throw new Error("Character name must be between 2 and 18 characters");
   if(state.characters.length>=balance.account.max_characters)throw new Error("Maximum of "+balance.account.max_characters+" characters reached");
   if(state.characters.some(item=>item.name.toLowerCase()===nickname.toLowerCase()))throw new Error("Character name already exists");
   const starter=!state.account.starterPackClaimed,mode=balance.difficulty.modes[balance.difficulty.default];
   const character={
    id:id(),name:nickname,classId,level:1,xp:0,talentPoints:0,branch:null,talents:{},unlockedSkills:[],activeSkillId:null,resource:0,resourceMax:classTable[classId].resource_max||100,
    silver:starter?balance.account.starter_pack.silver:balance.economy.starting_silver,
    bag:starter?[{id:id(),type:"healing_potion",quantity:balance.account.starter_pack.healing_potions}]:[],
    gear:[null,null,null,null,null,null],heroic:false,buffs:{},potionCapacityBonus:0,daily:null,difficulty:balance.difficulty.default,
    potionBelt:Array(balance.healing.potion_belt_slots).fill(null),achievements:[],loreRead:[],tutorial:{completed:false,step:0,rewardClaimed:false},
    progress:{highestEver:0,currentStage:1,checkpoints:[]},
    run:{active:false,id:null,experience:0,foundItemIds:[],stage:null,playerHp:0,checkpointHeals:0,healingPenaltyFrom:0,healingPenaltyUntil:0,speed2:false,lives:mode.lives,buffs:{}},
    paragon:{level:0,xp:0,stats:{}},pity:{legendaryMisses:0,godlikeMisses:0},stats:{kills:0,elapsedMs:0,completionMs:0,pvpWins:0}
   };
   character.run.playerHp=maxHp(character);
   state.characters.push(character);state.activeCharacterId=character.id;
   if(starter){
    state.account.starterPackClaimed=true;
    state.account.premiumUntil=Math.max(state.account.premiumUntil||0,now()+balance.account.starter_pack.premium_hours*3600000);
   }
   return clone(character);
  }
  function getSkillUnlocks(character,catalog){
   return (catalog||[]).filter(skill=>skill.class_id===character.classId&&
    (skill.branch_id===null||skill.branch_id===character.branch)&&character.level>=skill.unlock_level).map(skill=>skill.id);
  }
  function skillAvailable(character,skill){
   return character.level>=skill.unlock_level&&(!skill.branch_id||character.branch===skill.branch_id);
  }
  function stagePlan(character,stage){
   const map=balance.map,boss=stage%map.boss_every===0,range=(map.gauntlet_ranges||[]).find(item=>stage>=item.min&&stage<=item.max);
   let count=map.boss_mob_count;
   if(!boss){
    const allowed=range?.allowed||[3,5],weights=range?.weights||[0.625,0.375],roll=random();
    let total=0;count=allowed[allowed.length-1]||map.normal_mob_count;
    for(let i=0;i<allowed.length;i++){total+=weights[i]||0;if(roll<total){count=allowed[i];break;}}
   }
   const modifier=character.run?.season?.modifier||null;
   const eliteChance=Math.min(1,map.elite_chance*(modifier?.elite_chance_multiplier||1));
   const eliteIndex=!boss&&random()<eliteChance?Math.floor(random()*count):-1;
   return{stage,boss,count,mobs:Array.from({length:count},(_,index)=>({
    index,type:boss?"boss":index===eliteIndex?"elite":"normal",
    mechanic:index===eliteIndex?map.elite_mechanics[Math.floor(random()*map.elite_mechanics.length)]:null,
    statMultiplier:character.heroic?map.heroic_stat_multiplier:1
   }))};
  }
  function beginRun(character){
   if(character.run.active)return;
   const season=ensureSeason(),difficulty=difficultyOf(character);
   character.run={...character.run,active:true,id:id(),experience:0,foundItemIds:[],stage:null,
    checkpointHeals:0,healingPenaltyFrom:0,healingPenaltyUntil:0,speed2:false,lives:difficulty.lives,playerHp:maxHp(character),
    difficulty:character.difficulty||balance.difficulty.default,season:clone(season),startedAt:now()};
  }
  function beginStage(characterId,requestedStage){
   const character=getChar(characterId);
   const stage=requestedStage||character.progress.currentStage;
   const highest=character.progress.highestEver;
   if(stage>highest+1)throw new Error("Stage is locked until the previous stage is cleared");
   if(stage<1||stage>balance.map.total_stages)throw new Error("Invalid map stage");
   if(character.run.stage)throw new Error("A stage is already active");
   beginRun(character);
   const plan=stagePlan(character,stage);
   character.run.stage={...plan,enemyIndex:0,potionSlotUsed:false,startedAt:now()};
   character.run.speed2=false;
   return clone(character.run.stage);
  }
  function currentEnemy(character){
   if(!character.run.stage)throw new Error("No active battle");
   return character.run.stage.mobs[character.run.stage.enemyIndex];
  }
  function xpMultiplier(character,stage,flags){
   flags=flags||{};
   const firstClear=stage>character.progress.highestEver;
   let multiplier=flags.auto?balance.auto_battle.experience_multiplier:(firstClear?balance.xp_curve.first_clear_multiplier:balance.xp_curve.replay_multiplier);
   if(flags.speed2){if(firstClear)throw new Error("2x speed is disabled on first clears");multiplier*=balance.combat.speed_2x_experience_multiplier;}
   const penaltyFrom=character.run.healingPenaltyFrom||0;
   if(penaltyFrom>0&&stage>=penaltyFrom&&stage<=character.run.healingPenaltyUntil)multiplier*=balance.xp_curve.healing_penalty_multiplier;
   const buff=activeBuff(character,"xp");if(buff)multiplier*=buff.multiplier;
   multiplier*=1+Math.max(0,accountLevel()-1)*balance.account.xp_silver_bonus_per_level;
   const modifier=character.run.season?.modifier;if(modifier?.reward_xp_multiplier)multiplier*=modifier.reward_xp_multiplier;
   return multiplier;
  }
  function awardXp(character,amount){
   const value=Math.max(0,Math.round(amount)),before=character.level;
   character.xp+=value;character.run.experience+=value;
   state.account.xp=Math.max(0,(state.account.xp||0)+value);
   recalcLevel(character);
   return{amount:value,total:character.xp,level:character.level,levelUp:character.level>before,accountLevel:accountLevel(),accountXp:state.account.xp};
  }
  function enemyXp(enemy,stage){
   const table=balance.xp_curve.mob_xp;
   if(enemy.type==="boss")return table.boss_base+stage*table.boss_per_stage;
   if(enemy.type==="elite")return table.elite_base+stage*table.elite_per_stage;
   return table.normal_base+stage*table.normal_per_stage;
  }
  function createDrop(character,rarity,options){
   options=options||{};
   const itemLevel=itemLevelForStage(options.itemLevel||character.progress.currentStage||1);
   const scale=1+itemLevel*balance.item_level.stat_bonus_per_level;
   const raw=options.stats||{attack:Math.max(1,Math.round(character.level*1.5)),defense:Math.max(1,Math.round(character.level*.8)),health:Math.max(1,character.level*4)};
   const stats={...raw};
   for(const key of Object.keys(stats))if(typeof stats[key]==="number"&&["attack","defense","health","crit"].includes(key))stats[key]=Math.round(stats[key]*scale*1000)/1000;
   const item={id:id(),name:options.name||rarity+" трофей",rarity,slot:options.slot||"accessory",setId:options.setId||null,uniqueId:options.uniqueId||null,unique:!!options.uniqueId,
    itemLevel,stats,refine:0,sockets:[],socketsAvailable:0,enchant:null,bossLoot:!!options.bossLoot,foundRunId:character.run.id};
   character.bag.push(item);character.run.foundItemIds.push(item.id);
   return item;
  }
  function rollLoot(character,enemy,stage,firstClear,automatic){
   if(automatic)return[];
   const drops=balance.drop_tables,items=[],buff=activeBuff(character,"drop"),dropMultiplier=buff?buff.multiplier:1;
   const uniqueBossDrop=rarity=>{
    const configured=classTable[character.classId].unique_items||[];
    const owned=new Set([...(character.bag||[]),...(character.gear||[]).filter(Boolean)].map(item=>item.uniqueId).filter(Boolean));
    const available=configured.filter(item=>!owned.has(item.id));
    if(!available.length)return createDrop(character,rarity,{bossLoot:true,itemLevel:stage});
    const item=available[Math.floor(random()*available.length)];
    return createDrop(character,rarity,{bossLoot:true,uniqueId:item.id,name:item.name,slot:item.slot,stats:item.stats,itemLevel:stage});
   };
   if(enemy.type==="boss"){
    if(firstClear&&drops.guaranteed_epic_first_clear_boss)items.push(createDrop(character,"Эпическая",{bossLoot:true,name:"Трофей первого покорения",itemLevel:stage}));
    if(character.heroic){
     const guaranteed=character.pity.godlikeMisses>=drops.boss_pity_misses;
     if(guaranteed||random()<Math.min(1,drops.heroic_godlike_chance*dropMultiplier)){items.push(uniqueBossDrop("Богоподобная"));character.pity.godlikeMisses=0;}
     else character.pity.godlikeMisses++;
    }else{
     const guaranteed=character.pity.legendaryMisses>=drops.boss_pity_misses;
     if(guaranteed||random()<Math.min(1,drops.boss_legendary_chance*dropMultiplier)){items.push(uniqueBossDrop("Легендарная"));character.pity.legendaryMisses=0;}
     else character.pity.legendaryMisses++;
    }
   }else if(enemy.type==="elite"){
    if(random()<Math.min(1,drops.elite_epic_chance*dropMultiplier)){
     const branches=classTable[character.classId].branches||[],branch=branches.find(entry=>entry.id===character.branch)||branches[0];
     const slot=["weapon","chest","head","legs","hands","accessory"][Math.floor(random()*6)];
     items.push(createDrop(character,"Эпическая",{setId:branch?.set?.id||null,slot,name:(branch?.set?.name||"Эпическая вещь")+" · "+slot,itemLevel:stage}));
    }
   }else if(stage<=30&&random()<Math.min(1,drops.normal_item_chance*dropMultiplier)){
    items.push(createDrop(character,random()<drops.normal_rare_weight?"Редкая":"Обычная",{itemLevel:stage}));
   }
   return items;
  }
  function finishEnemy(characterId,flags){
   flags=flags||{};
   const character=getChar(characterId),stageData=character.run.stage,enemy=currentEnemy(character),stage=stageData.stage;
   const firstClear=stage>character.progress.highestEver;
   const use2x=flags.speed2===undefined?!!character.run.speed2:!!flags.speed2;
   const multiplier=xpMultiplier(character,stage,{speed2:use2x});
   const gained=awardXp(character,enemyXp(enemy,stage)*multiplier);
   const loot=rollLoot(character,enemy,stage,firstClear,false);
   const materials=[],dropBuff=activeBuff(character,"drop"),dropMultiplier=dropBuff?dropBuff.multiplier:1;
   const addMaterial=item=>{character.bag.push(item);character.run.foundItemIds.push(item.id);materials.push(item);};
   if(random()<Math.min(1,balance.equipment.chisel_drop_chance*dropMultiplier))
    addMaterial({id:id(),type:"chisel",quantity:1,foundRunId:character.run.id,bossLoot:enemy.type==="boss"});
   if((enemy.type==="elite"||enemy.type==="boss")&&stage>=balance.equipment.stone_unlock_stage&&character.branch&&random()<Math.min(1,balance.equipment.stone_drop_chance*dropMultiplier)){
    const slot=random()<0.5?"weapon":"armor";
    const stonePool=balance.equipment.stone_types.filter(type=>type.class_id===character.classId&&type.branch_id===character.branch&&type.slot===slot);
    const stoneType=clone(stonePool[Math.floor(random()*stonePool.length)]||{id:character.classId+"."+character.branch+"."+slot,class_id:character.classId,branch_id:character.branch,slot,attack_per_level:slot==="weapon"?1.5:0,defense_per_level:slot==="armor"?1:0,health_per_level:slot==="armor"?3:0});
    addMaterial({id:id(),type:"enhancement_stone",stoneType,level:1,foundRunId:character.run.id,bossLoot:enemy.type==="boss"});
   }
   if(enemy.type==="elite"||enemy.type==="boss"){
    const quantity=enemy.type==="elite"?balance.materials.drops.elite_materials:balance.materials.drops.boss_materials;
    addMaterial({id:id(),type:"craft_material",quantity,foundRunId:character.run.id,bossLoot:enemy.type==="boss"});
   }
   if(stage>=balance.equipment.refine_unlock_stage&&random()<Math.min(1,balance.equipment.refine_stone_drop_chance*dropMultiplier))
    addMaterial({id:id(),type:"refine_stone",quantity:1,foundRunId:character.run.id,bossLoot:enemy.type==="boss"});
   if(character.heroic&&random()<Math.min(1,balance.equipment.enchantment.armor_scroll_chance*dropMultiplier))
    addMaterial({id:id(),type:"enchant_scroll",slot:"armor",foundRunId:character.run.id,bossLoot:enemy.type==="boss"});
   if(character.heroic&&(enemy.type==="elite"||enemy.type==="boss")&&random()<Math.min(1,balance.equipment.enchantment.weapon_scroll_chance*dropMultiplier))
    addMaterial({id:id(),type:"enchant_scroll",slot:"weapon",foundRunId:character.run.id,bossLoot:enemy.type==="boss"});
   character.stats.kills++;
   const silverBuff=activeBuff(character,"silver"),seasonMod=character.run.season?.modifier;
   const accountBonus=1+Math.max(0,accountLevel()-1)*balance.account.xp_silver_bonus_per_level;
   const silver=Math.round(stageSilver(stage)*accountBonus*(silverBuff?silverBuff.multiplier:1)*(seasonMod?.reward_silver_multiplier||1));
   character.silver+=silver;
   if(enemy.type==="elite")recordDailyProgress(character.id,"elite_kills",1);
   stageData.enemyIndex++;
   const done=stageData.enemyIndex>=stageData.mobs.length;
   if(!done)stageData.potionSlotUsed=false;
   if(done){
    const clear=balance.xp_curve.stage_clear_xp;
    const bonus=(clear.base+stage*clear.per_stage+(enemy.type==="boss"?clear.boss_bonus:0))*multiplier;
    awardXp(character,bonus);
    character.progress.highestEver=Math.max(character.progress.highestEver,stage);
    recordDailyProgress(character.id,"stages_cleared",1);
    if(difficultyOf(character).checkpoints&&balance.map.checkpoints.includes(stage)&&!character.progress.checkpoints.includes(stage))character.progress.checkpoints.push(stage);
    if(stage>character.progress.currentStage-1)character.progress.currentStage=stage+1;
    character.run.stage=null;
    character.run.playerHp=maxHp(character);
    if(stage>=balance.seasons.reward_first_clear_stage&&!character.run.seasonRewardClaimed&&firstClear){
     const reward=balance.seasons.season_reward_cosmetic;
     if(reward&&!state.account.cosmetics.includes(reward))state.account.cosmetics.push(reward);
     if(character.run.season&&character.run.season.id===ensureSeason().id)ensureSeason().firstClearRewardClaimed=true;
     character.run.seasonRewardClaimed=true;
    }
    if(stage>=balance.heroic.unlock_after_stage&&!character.heroic){
     character.heroic=true;character.run.lives=balance.difficulty.modes[character.difficulty].lives;
     character.progress.currentStage=1;character.progress.highestEver=balance.map.total_stages;
     publishGhost(character,"stage_250_clear");
    }else if(stage>=balance.map.total_stages&&character.heroic){
     character.run.active=false;publishGhost(character,"stage_250_clear");
    }
   }
   return{xp:gained.amount,loot:clone(loot.concat(materials)),silver,stageComplete:done,progress:clone(character.progress),playerHp:character.run.playerHp,firstClear};
  }
  function useHealingPotion(characterId){
   const character=getChar(characterId),stage=character.run.stage;
   if(!stage)throw new Error("Healing potion can only be used during a battle");
   if(stage.potionSlotUsed)throw new Error("The healing slot for this enemy has already been consumed");
   const potion=character.bag.find(item=>item.type==="healing_potion"&&item.quantity>0);
   if(!potion)throw new Error("No healing potions available");
   potion.quantity--;
   stage.potionSlotUsed=true;
   const healFraction=potion.healFraction===undefined?balance.healing.potion_heal_fraction:potion.healFraction;
   character.run.playerHp=Math.min(maxHp(character),character.run.playerHp+Math.round(maxHp(character)*healFraction));
   character.bag=character.bag.filter(item=>item.quantity!==0);
   return character.run.playerHp;
  }
  function checkpointHeal(characterId){
   const character=getChar(characterId),checkpoint=character.progress.currentStage-1,nextStage=character.progress.currentStage;
   if(character.run.stage)throw new Error("Checkpoint healing is unavailable during combat");
   if(!balance.map.checkpoints.includes(checkpoint))throw new Error("Healing is available only just after a checkpoint");
   if(character.run.healingPenaltyUntil>=nextStage)throw new Error("Experience penalty is still active");
   if(character.run.checkpointHeals>=balance.healing.max_checkpoint_heals_per_run)throw new Error("Checkpoint heal limit reached");
   character.run.playerHp=Math.min(maxHp(character),character.run.playerHp+Math.round(maxHp(character)*balance.healing.checkpoint_heal_fraction));
   character.run.healingPenaltyFrom=checkpoint===balance.map.total_stages?0:nextStage;
   character.run.healingPenaltyUntil=checkpoint===balance.map.total_stages?0:nextStage+balance.healing.checkpoint_penalty_stages-1;
   character.run.checkpointHeals++;
   return{hp:character.run.playerHp,checkpoint,penaltyUntil:character.run.healingPenaltyUntil,remaining:Math.max(0,character.run.healingPenaltyUntil-nextStage+1)};
  }
  function speed2Allowed(characterId,stage){
   const character=getChar(characterId),target=stage||character.progress.currentStage;
   return target<=character.progress.highestEver&&character.progress.highestEver>0;
  }
  function setSpeed2(characterId,enabled,stage){
   const character=getChar(characterId);
   if(enabled&&!speed2Allowed(characterId,stage||character.run.stage?.stage))throw new Error("2x is only available on previously cleared stages");
   character.run.speed2=!!enabled;
   return character.run.speed2;
  }
  function deathPreview(characterId){
   const character=getChar(characterId),loss=Math.round(character.run.experience*balance.death.run_experience_loss);
   const levelAfter=levelForXp(Math.max(0,character.xp-loss));
   const eligible=character.bag.filter(item=>character.run.foundItemIds.includes(item.id)&&!item.bossLoot);
   return{experienceLoss:loss,levelsLost:Math.max(0,character.level-levelAfter),itemLossChance:character.bag.some(item=>item.type==="one_rescue")?0:balance.death.inventory_item_loss_chance,eligibleItems:eligible.length,projectedLevel:levelAfter};
  }
  function confirmDeath(characterId){
   const character=getChar(characterId),preview=deathPreview(characterId);
   character.xp=Math.max(0,character.xp-preview.experienceLoss);
   recalcLevel(character);
   const eligible=character.bag.filter(item=>character.run.foundItemIds.includes(item.id)&&!item.bossLoot);
   let lost=null;
   const rescue=character.bag.find(item=>item.type==="one_rescue");
   const lossChance=rescue?0:balance.death.inventory_item_loss_chance;
   if(eligible.length&&random()<lossChance){
    lost=eligible[Math.floor(random()*eligible.length)];
    character.bag=character.bag.filter(item=>item.id!==lost.id);
   }
   if(rescue)character.bag=character.bag.filter(item=>item.id!==rescue.id);
   const maxLives=balance.death.lives_per_run||3;
   const livesBefore=Math.max(1,Math.min(maxLives,character.run.lives||maxLives));
   const livesRemaining=livesBefore-1,runEnded=livesRemaining<=0;
   character.lastDeath={...preview,itemLossChance:lossChance,lostItem:lost?lost.name:null,livesLost:1,livesRemaining:runEnded?maxLives:livesRemaining,runEnded};
   character.run.stage=null;character.run.experience=0;character.run.foundItemIds=[];
   character.run.healingPenaltyFrom=0;character.run.healingPenaltyUntil=0;character.run.checkpointHeals=0;character.run.speed2=false;
   character.run.lives=runEnded?maxLives:livesRemaining;character.run.active=!runEnded;
   if(runEnded)character.progress.currentStage=balance.death.new_run_stage;
   character.run.playerHp=maxHp(character);
   return clone(character.lastDeath);
  }
  function voluntaryRestart(characterId){
   const character=getChar(characterId);
   if(character.run.stage)throw new Error("Restart is only available between stages");
   character.run.active=false;character.run.experience=0;character.run.foundItemIds=[];
   character.run.healingPenaltyFrom=0;character.run.healingPenaltyUntil=0;character.run.checkpointHeals=0;character.run.speed2=false;character.run.lives=balance.death.lives_per_run||3;
   character.progress.currentStage=balance.death.new_run_stage;
   character.run.playerHp=maxHp(character);
   return clone(character.progress);
  }
  function autoBattle(characterId,options){
   options=options||{};
   const character=getChar(characterId),limit=Math.min(options.maxStages||balance.auto_battle.default_max_stages,balance.auto_battle.default_max_stages);
   if(character.run.stage)throw new Error("Auto-battle cannot run during manual combat");
   const ceiling=character.progress.highestEver-balance.auto_battle.highest_ever_offset;
   const result={cleared:0,xp:0,stopped:null};
   if(ceiling<character.progress.currentStage){result.stopped="Нет ранее пройденных этапов для авто-боя";return result;}
   beginRun(character);
   while(result.cleared<limit&&character.progress.currentStage<=ceiling){
    const stage=character.progress.currentStage,plan=stagePlan(character,stage);
    if(plan.boss){result.stopped="Босс требует ручного боя";break;}
    if(plan.mobs.some(enemy=>enemy.type==="elite")){result.stopped="Элитный противник требует ручного боя";break;}
    let stageXp=0,estimatedDamage=0;
    const combat=balance.combat,baseStats=balance.classes.base_stats;
    const gearDefense=(character.gear||[]).reduce((sum,item)=>sum+(item&&item.stats?item.stats.defense||0:0),0);
    const defense=baseStats.base_defense+(character.level-1)*baseStats.defense_per_level+gearDefense;
    const attack=baseStats.base_attack+(character.level-1)*baseStats.attack_per_level;
    for(const enemy of plan.mobs){
     stageXp+=enemyXp(enemy,stage)*xpMultiplier(character,stage,{auto:true});
     const hpCfg=combat.enemy_hp,damageCfg=combat.enemy_damage;
     const enemyHp=hpCfg.normal_base+stage*hpCfg.normal_per_stage;
     const hits=Math.ceil(enemyHp/Math.max(1,attack));
     const incoming=Math.max(1,Math.round((damageCfg.normal_base+stage*damageCfg.normal_per_stage)*100/(100+defense)));
     estimatedDamage+=Math.ceil(hits*incoming*0.45);
    }
    if(character.run.playerHp<=estimatedDamage){
     result.stopped="Симуляция поражения: авто-бой остановлен";
     character.run.active=false;
     break;
    }
    character.run.playerHp=Math.max(1,character.run.playerHp-estimatedDamage);
    const clear=balance.xp_curve.stage_clear_xp;
    stageXp+=(clear.base+stage*clear.per_stage)*xpMultiplier(character,stage,{auto:true});
    const gained=awardXp(character,stageXp);
    result.xp+=gained.amount;result.cleared++;
    character.progress.highestEver=Math.max(character.progress.highestEver,stage);
    character.progress.currentStage=stage+1;
    character.run.playerHp=maxHp(character);
   }
   if(!result.stopped)result.stopped="Достигнут лимит авто-боя";
   return result;
  }
  function mergeStones(characterId,stoneType,level){
   const character=getChar(characterId),count=balance.equipment.stone_merge_count;
   if(level>=balance.equipment.stone_max_level)throw new Error("Maximum enhancement stone level reached");
   const stones=character.bag.filter(item=>item.type==="enhancement_stone"&&item.level===level&&JSON.stringify(item.stoneType)===JSON.stringify(stoneType));
   if(stones.length<count)throw new Error("Not enough matching enhancement stones");
   const remove=new Set(stones.slice(0,count).map(item=>item.id));
   character.bag=character.bag.filter(item=>!remove.has(item.id));
   const result={id:id(),type:"enhancement_stone",stoneType,level:level+1};
   character.bag.push(result);return clone(result);
  }
  function addSocket(characterId,itemId){
   const character=getChar(characterId),item=character.gear.find(entry=>entry&&entry.id===itemId)||character.bag.find(entry=>entry&&entry.id===itemId);
   if(!item)throw new Error("Equipment not found");
   if((item.socketsAvailable||0)>=balance.equipment.max_sockets)throw new Error("Maximum socket count reached");
   const chisel=character.bag.find(entry=>entry.type==="chisel");
   if(!chisel)throw new Error("No chisel available");
   character.bag=character.bag.filter(entry=>entry.id!==chisel.id);
   item.socketsAvailable=(item.socketsAvailable||0)+1;return clone(item);
  }
  function socketStone(characterId,itemId,stoneId){
   const character=getChar(characterId),item=character.gear.find(entry=>entry&&entry.id===itemId);
   const stone=character.bag.find(entry=>entry.id===stoneId&&entry.type==="enhancement_stone");
   if(!item||!stone)throw new Error("Equipment or stone not found");
   item.sockets=item.sockets||[];
   if(item.sockets.length>=(item.socketsAvailable||0))throw new Error("Use a chisel to add an equipment socket first");
   const stoneClass=stone.stoneType.class_id||stone.stoneType.classId,stoneBranch=stone.stoneType.branch_id||stone.stoneType.branchId;
   if(stoneClass!==character.classId||stoneBranch!==character.branch)throw new Error("Stone does not match the active specialization");
   item.sockets.push({stoneType:stone.stoneType,level:stone.level});
   character.bag=character.bag.filter(entry=>entry.id!==stoneId);
   return clone(item);
  }
  function refine(characterId,itemId,settings){
   settings=settings||{};
   const character=getChar(characterId),item=character.gear.find(entry=>entry&&entry.id===itemId)||character.bag.find(entry=>entry&&entry.id===itemId);
   if(!item)throw new Error("Equipment not found");
   if(item.refine>=balance.equipment.refine_max)throw new Error("Maximum refinement reached");
   const tier=balance.equipment.refine_tiers.find(entry=>item.refine>=entry.from&&item.refine<=entry.to);
   if(!tier)throw new Error("No refinement tier configured");
   const refineStone=character.bag.find(entry=>entry.type==="refine_stone");
   if(!refineStone)throw new Error("No refinement stone available");
   const safeItem=character.bag.find(entry=>entry.type==="safe_refine"||entry.type==="refine_guard");
   const safe=!!safeItem;
   character.bag=character.bag.filter(entry=>entry.id!==refineStone.id);
   const refineBuff=activeBuff(character,"refine");
   const chance=clamp(tier.chance+(settings.chanceBonus||0)+(refineBuff?refineBuff.chanceBonus:0),0,1);
   const success=random()<chance;
   if(success)item.refine++;
   else if(!safe){
    if(tier.failure==="minus_one")item.refine=Math.max(0,item.refine-1);
    if(tier.failure==="reset_ten")item.refine=10;
    if(tier.failure==="destroy"){
     character.gear=character.gear.map(entry=>entry&&entry.id===itemId?null:entry);
     character.bag=character.bag.filter(entry=>entry.id!==itemId);
    }
   }
   if(safeItem)character.bag=character.bag.filter(entry=>entry.id!==safeItem.id);
   return{success,destroyed:tier.failure==="destroy"&&!success&&!safe,refine:item.refine};
  }
  function rollEnchantScroll(characterId,itemId){
   const character=getChar(characterId),item=character.gear.find(entry=>entry&&entry.id===itemId)||character.bag.find(entry=>entry&&entry.id===itemId);
   if(!character.heroic)throw new Error("Enchantment is only available in heroic mode");
   if(!item)throw new Error("Equipment not found");
   const weapon=item.slot==="weapon"||item.slot===0;
   const scroll=character.bag.find(entry=>entry.type==="enchant_scroll"&&entry.slot===(weapon?"weapon":"armor"));
   if(!scroll)throw new Error("No matching enchantment scroll in the backpack");
   return weapon?["+15% магической атаки","+15% физической атаки","+15% скорости атаки","+15% шанса крита"]:
    ["+5% магического урона","+5% физического урона","+5% магической защиты","+5% физической защиты"];
  }
  function applyEnchant(characterId,itemId,choice,choices){
   const character=getChar(characterId),item=character.gear.find(entry=>entry&&entry.id===itemId)||character.bag.find(entry=>entry&&entry.id===itemId);
   if(!character.heroic)throw new Error("Enchantment is only available in heroic mode");
   if(!item||!Array.isArray(choices)||choices.length!==4||!Number.isInteger(choice)||choice<0||choice>=4)throw new Error("Invalid enchantment choice");
   const weapon=item.slot==="weapon"||item.slot===0;
   const scroll=character.bag.find(entry=>entry.type==="enchant_scroll"&&entry.slot===(weapon?"weapon":"armor"));
   if(!scroll)throw new Error("No matching enchantment scroll in the backpack");
   character.bag=character.bag.filter(entry=>entry.id!==scroll.id);
   item.enchant=choices[choice];return clone(item);
  }
  function activateItem(characterId,itemId){
   const character=getChar(characterId),item=character.bag.find(entry=>entry.id===itemId);
   if(!item)throw new Error("Item not found in backpack");
   if(item.type==="healing_potion")throw new Error("Healing potions can only be used during combat");
   const key=item.itemId||item.type,definition=balance.economy.consumables?.[key];
   if(!definition)throw new Error("This item has no active effect");
   const expiresAt=now()+(definition.duration_minutes||0)*60000;
   if(["xp","drop","refine","silver"].includes(definition.kind)){
    character.buffs=character.buffs||{};
    character.buffs[definition.kind]={multiplier:definition.multiplier||1,chanceBonus:definition.chance_bonus||0,expiresAt};
   }else if(definition.kind==="repair"){
    if(character.run.stage)throw new Error("Repair kits can only be used between battles");
    character.run.playerHp=Math.min(maxHp(character),character.run.playerHp+Math.round(maxHp(character)*(definition.heal_fraction||0)));
   }else if(definition.kind==="potion_capacity"){
    character.potionCapacityBonus+=definition.quantity||0;
   }else if(definition.kind==="stone_cache"){
    if(!character.branch)throw new Error("Choose a specialization before opening this cache");
    const pool=balance.equipment.stone_types.filter(type=>type.class_id===character.classId&&type.branch_id===character.branch);
    if(!pool.length)throw new Error("No stones are available for this specialization");
    for(let i=0;i<(definition.quantity||1);i++)character.bag.push({id:id(),type:"enhancement_stone",stoneType:clone(pool[i%pool.length]),level:1});
   }else if(definition.kind==="socket"){
    const target=character.gear.find(entry=>entry&&(entry.socketsAvailable||0)<balance.equipment.max_sockets);
    if(!target)throw new Error("No equipped item can accept another socket");
    target.socketsAvailable=(target.socketsAvailable||0)+1;
   }else if(definition.kind==="pity"){
    character.pity.legendaryMisses=Math.max(character.pity.legendaryMisses,balance.drop_tables.boss_pity_misses-1);
   }else if(definition.kind==="safe_refine"){
    item.type="safe_refine";item.itemId=null;return{activated:key,expiresAt:null};
   }else if(definition.kind==="rescue"){
    item.type="one_rescue";item.itemId=null;return{activated:key,expiresAt:null};
   }else if(definition.kind==="map_hint"){
    character.buffs.mapHint={expiresAt:now()+86400000};
   }else throw new Error("Unsupported item effect");
   character.bag=character.bag.filter(entry=>entry.id!==itemId);
   return{activated:key,expiresAt};
  }
  function purchase(characterId,store,catalogItem){
   const character=getChar(characterId),shop=balance.economy[store+"_store"];
   if(!shop)throw new Error("Unknown shop");
   let entry=shop[catalogItem],price=entry;
   if(entry===undefined&&Array.isArray(shop.extra))entry=shop.extra.find(item=>item.id===catalogItem);
   if(entry&&typeof entry==="object")price=entry.price;
   if(!Number.isFinite(price))throw new Error("Unknown shop item");
   if(store==="silver"){
    if(character.silver<price)throw new Error("Not enough silver");
    character.silver-=price;
   }else{
    if(state.account.diamonds<price)throw new Error("Not enough account diamonds");
    state.account.diamonds-=price;
   }
   if(catalogItem.startsWith("heal_")){
    const fraction=Number(catalogItem.split("_")[1])/100;
    const stack=character.bag.find(item=>item.type==="healing_potion"&&item.healFraction===fraction);
    if(stack&&stack.quantity>=balance.healing.potion_stack_limit+character.potionCapacityBonus){
     if(store==="silver")character.silver+=price;else state.account.diamonds+=price;
     throw new Error("Healing potion stack is full");
    }
    if(stack)stack.quantity=Math.min(balance.healing.potion_stack_limit,stack.quantity+1);
    else character.bag.push({id:id(),type:"healing_potion",healFraction:fraction,quantity:1});
   }else if(catalogItem.startsWith("premium_")){
    const days=Number(catalogItem.split("_")[1].replace("d",""))||7;
    state.account.premiumUntil=Math.max(state.account.premiumUntil||0,now())+days*86400000;
   }else if(entry&&typeof entry==="object")character.bag.push({id:id(),type:entry.effect||catalogItem,itemId:catalogItem,quantity:1});
   else character.bag.push({id:id(),type:catalogItem,quantity:1});
   return{characterSilver:character.silver,accountDiamonds:state.account.diamonds,premiumUntil:state.account.premiumUntil};
  }
  function transferSilver(fromId,toId,amount){
   const donor=getChar(fromId),receiver=getChar(toId),value=Math.floor(Number(amount));
   if(donor.id===receiver.id)throw new Error("Cannot transfer silver to the same character");
   if(!Number.isFinite(value)||value<=0||donor.silver<value)throw new Error("Invalid transfer amount or insufficient silver");
   const date=dayKey(now()),key=donor.id+":"+date;
   const record=state.bank.transfers[key]||{sent:0,startingBalance:donor.silver};
   const limit=Math.floor(record.startingBalance*balance.economy.bank_daily_donor_fraction);
   if(record.sent+value>limit)throw new Error("Daily transfer limit reached");
   const fee=Math.ceil(value*balance.economy.bank_fee),received=value-fee;
   donor.silver-=value;receiver.silver+=received;state.bank.silver+=fee;
   record.sent+=value;state.bank.transfers[key]=record;
   return{sent:value,fee,received,donorSilver:donor.silver,receiverSilver:receiver.silver};
  }
  function chooseBranch(characterId,branchId,price){
   const character=getChar(characterId),available=classTable[character.classId].branches.map(entry=>typeof entry==="string"?entry:entry.id);
   if(character.level<10)throw new Error("Specialization unlocks at level 10");
   if(!available.includes(branchId))throw new Error("Invalid specialization");
   if(character.branch===branchId)return branchId;
   const cost=character.branch===null?0:(price===undefined?balance.classes.respec_cost:price);
   if(character.silver<cost)throw new Error("Not enough silver for specialization change");
   character.silver-=cost;character.branch=branchId;return branchId;
  }
  function resetTalents(characterId){
   const character=getChar(characterId),cost=balance.classes.talent_reset_cost;
   if(character.silver<cost)throw new Error("Not enough silver to reset talents");
   character.silver-=cost;character.talents={};return clone(character.talents);
  }
  function useTalentPoint(characterId,talentId,maxRank){
   const character=getChar(characterId),spent=Object.values(character.talents).reduce((sum,value)=>sum+value,0);
   const max=maxRank||3;
   if(!character.branch)throw new Error("Choose a specialization before spending branch talents");
   if(spent>=character.talentPoints)throw new Error("No available talent points");
   if((character.talents[talentId]||0)>=max)throw new Error("Talent rank is already maxed");
   character.talents[talentId]=(character.talents[talentId]||0)+1;
   return character.talents[talentId];
  }
  function leaderboard(){
   return state.characters.map(character=>({id:character.id,name:character.name,classId:character.classId,level:character.level,combatPower:combatPower(character),completionMs:character.stats.completionMs||0}))
    .sort((a,b)=>b.combatPower-a.combatPower||a.completionMs-b.completionMs);
  }
  function saveSnapshot(){return clone(state);}
  return{state,balance,createCharacter,getChar:(idValue)=>clone(getChar(idValue)),requiredXp,levelForXp,maxHp,combatPower,getCombatStats,getRefinementGlow,recalcLevel,
   getSkillUnlocks,skillAvailable,stagePlan,beginStage,currentEnemy,finishEnemy,useHealingPotion,checkpointHeal,
   speed2Allowed,setSpeed2,xpMultiplier,awardXp,deathPreview,confirmDeath,voluntaryRestart,autoBattle,
   rollLoot,mergeStones,addSocket,socketStone,refine,rollEnchantScroll,applyEnchant,purchase,transferSilver,
   chooseBranch,resetTalents,useTalentPoint,leaderboard,saveSnapshot,activateItem,
   recordDailyProgress,dailySnapshot,claimDailyQuest,startDailyBoss,completeDailyBoss,pvpSnapshot};
 }
 return{createEngine};
});
if(typeof window!=="undefined"){
 window.TowerboundReworkReady=(async()=>{
  const names=["combat","xp_curve","map","elite_mechanics","death","healing","auto_battle","drop_tables","equipment","economy","heroic","pvp","classes","skill_effects"];
  const loaded=await Promise.all(names.map(async name=>{
   const response=await fetch("./configs/balance/"+name+".json");
   if(!response.ok)throw new Error("Unable to load balance config: "+name);
   return[name,await response.json()];
  }));
  const balance=Object.fromEntries(loaded);
  const persisted=(()=>{
   try{
    const current=JSON.parse(localStorage.getItem("tb-rpg-v2")||"null");
    if(current)return current;
    const legacy=JSON.parse(localStorage.getItem("tb-rpg-v1")||"null");
    if(!legacy||!Array.isArray(legacy.chars)||!legacy.chars.length)return null;
    const classMap={warden:"destroyer",ranger:"duelist",arcanist:"elemental",reaper:"assassin"};
    const branchMap={
     assassin:["bleed","poison","execution"],bishop:["exorcism","healing","buffs"],
     dragonkin:["fire_dragon","ice_dragon","black_dragon"],destroyer:["fists","greatsword","wand_shield"],
     elemental:["darkness","water","earth"],duelist:["dual_swords","sword_shield","rapier"],
     shaman:["spirits","dark_gods","nature"]
    };
    const mapItem=item=>{
     if(!item||typeof item!=="object")return item;
     const stats=item.stats||item.stat||{};
     const mapped={...item,stats:{attack:stats.attack??stats.atk??0,defense:stats.defense??stats.def??0,health:stats.health??stats.hp??0},
      sockets:Array.isArray(item.sockets)?item.sockets:[],socketsAvailable:item.socketsAvailable||0,
      refine:item.refine||0,bossLoot:!!item.bossLoot};
     if(item.type==="potion"||item.type==="heal")mapped.type="healing_potion";
     if(mapped.type==="healing_potion")mapped.quantity=item.quantity||1;
     delete mapped.stat;
     return mapped;
    };
    const characters=legacy.chars.map(old=>{
     const classId=classMap[old.cls]||old.cls;
     if(!balance.classes.classes[classId])return null;
     const branches=branchMap[classId]||[];
     const branchIndex=Number.isInteger(old.branch)?old.branch:(/^\\d+$/.test(String(old.branch))?Number(old.branch):-1);
     const branch=branches.includes(old.branch)?old.branch:(branchIndex>=0?branches[branchIndex]||null:null);
     const gear=(old.gear||[]).map(item=>item?mapItem(item):null);
     const bag=(old.bag||[]).map(mapItem).filter(Boolean);
     if(!bag.some(item=>item.type==="healing_potion"))bag.push({id:"legacy-potions-"+old.id,type:"healing_potion",quantity:balance.healing.starting_potions});
     const level=Math.min(balance.xp_curve.max_level,Math.max(1,old.level||1));
     const best=Math.max(0,(old.bestStage||1)-1,(old.stage||1)-1);
     return{
      id:old.id||"legacy-"+Math.random().toString(36).slice(2),name:old.name||"Герой",classId,legacyClassId:old.cls,
      level,xp:Math.max(0,old.xp||0),talentPoints:Math.max(0,level-1),branch,
      talents:{},legacyTalents:old.tal||{},unlockedSkills:[],resource:0,
      resourceMax:balance.classes.classes[classId].resource_max||100,
      silver:Math.max(0,old.silver||balance.economy.starting_silver),
      bag,gear:gear.length?gear:[null,null,null,null,null,null],
      heroic:!!old.heroic,progress:{highestEver:best,currentStage:Math.max(1,Math.min(250,old.stage||1)),checkpoints:[50,100,150,200,250].filter(stage=>best>=stage)},
      run:{active:false,id:null,experience:0,foundItemIds:[],stage:null,playerHp:balance.classes.base_stats.base_health,
       checkpointHeals:0,healingPenaltyFrom:0,healingPenaltyUntil:0,speed2:false,lives:balance.death.lives_per_run||3,buffs:{}},
      pity:{legendaryMisses:old.legendaryMisses||0,godlikeMisses:old.godlikeMisses||0},
      stats:{kills:old.kills||0,elapsedMs:0,completionMs:0}
     };
    }).filter(Boolean);
    const active=legacy.active||legacy.chars.find(x=>x.id===legacy.active)?.id||characters[0]?.id||null;
    const account={diamonds:legacy.chars.reduce((sum,char)=>sum+Math.max(0,char.diamonds||0),0),
     premiumUntil:legacy.chars.reduce((max,char)=>Math.max(max,char.ext?.premiumUntil||0),0),unlocks:[],cosmetics:[]};
    const migrated={account,bank:{silver:0,transfers:{}},characters,activeCharacterId:active};
    localStorage.setItem("tb-rpg-v2",JSON.stringify(migrated));
    return migrated;
   }catch(error){console.warn("[Towerbound] legacy save migration skipped",error);return null;}
  })();
  const engine=window.TowerboundReworkCore.createEngine(balance,{state:persisted||undefined});
  window.TowerboundRework=engine;
  window.saveTowerboundRework=()=>localStorage.setItem("tb-rpg-v2",JSON.stringify(engine.state));
  return engine;
 })().catch(error=>{console.error("[Towerbound rework v2] config load failed",error);return null;});
}