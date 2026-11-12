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
  const dailyModifierForNow=()=>{
   const pool=balance.heroic.map_modifiers||[];
   return pool.length?clone(pool[Math.floor(now()/86400000)%pool.length]):null;
  };
  const runModifiers=character=>{
   const values=[character.run?.season?.modifier,character.run?.dailyModifier].filter(Boolean);
   const selected=(balance.run_modifiers?.modifiers||[]).find(item=>item.id===character.run?.runModifierId);if(selected)values.push({...selected,...(selected.effects||{})});
   return values.filter((modifier,index)=>values.findIndex(other=>other.id===modifier.id)===index);
  };
  const weekKey=()=>{const d=new Date(now());d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10);};
  function weeklyState(c){const key=weekKey();if(!state.account.weekly||state.account.weekly.week!==key)state.account.weekly={week:key,progress:{},claimed:[]};return state.account.weekly;}
  function recordWeeklyProgress(c,metric,n){const w=weeklyState(c);w.progress[metric]=(w.progress[metric]||0)+Math.max(0,Number(n)||0);return w.progress[metric];}function recordWeeklyRun(c){if(c.run.weeklyCompletionCounted)return false;recordWeeklyProgress(c,"runs_completed",1);c.run.weeklyCompletionCounted=true;return true;}
  function weeklySnapshot(cid){const c=getChar(cid),w=weeklyState(c);return(balance.weekly_quests?.quests||[]).map(q=>({...clone(q),week:w.week,progress:w.progress[q.metric]||0,complete:(w.progress[q.metric]||0)>=q.target,claimed:w.claimed.includes(q.id)}));}
  function claimWeeklyQuest(cid,qid){const c=getChar(cid),w=weeklyState(c),q=weeklySnapshot(cid).find(x=>x.id===qid);if(!q||!q.complete||q.claimed)throw new Error("Weekly quest is not ready");w.claimed.push(qid);c.silver+=(q.reward.silver||0);state.account.diamonds+=(q.reward.diamonds||0);return clone(q.reward);}
  function runModifierOptions(cid){const c=getChar(cid);if(c.run.active||c.run.stage)return[];if(!Array.isArray(c.run.offeredModifierIds)||c.run.offeredModifierIds.length!==3){const pool=(balance.run_modifiers?.modifiers||[]).slice(),picked=[];while(pool.length&&picked.length<3)picked.push(pool.splice(Math.floor(random()*pool.length),1)[0].id);c.run.offeredModifierIds=picked;}return c.run.offeredModifierIds.map(id=>(balance.run_modifiers.modifiers||[]).find(x=>x.id===id)).filter(Boolean).map(clone);}
  function setRunModifier(cid,mid){const c=getChar(cid);if(c.run.active||c.run.stage)throw new Error("Choose a modifier before starting a run");const m=(balance.run_modifiers?.modifiers||[]).find(x=>x.id===mid);if(!m)throw new Error("Unknown modifier");if(!runModifierOptions(cid).some(x=>x.id===mid))throw new Error("Choose one of the three offered modifiers");c.run.runModifierId=mid;return clone(m);}
  function reviveFromDeath(cid){const c=getChar(cid);if(!c.run.stage)throw new Error("No active battle to revive");if(c.run.playerHp>0)throw new Error("Revive is available only after death");if(c.run.rescueUsed)throw new Error("Revive already used this run");const stage=c.run.stage.stage||c.progress.currentStage,price=Math.max(5,Math.min(50,Math.round(5+(stage-50)*.225)));if((state.account.diamonds||0)<price)throw new Error("Need "+price+" diamonds");state.account.diamonds-=price;c.run.rescueUsed=true;c.run.playerHp=Math.max(1,Math.round(maxHp(c)*.5));c.run.active=true;return{price,hp:c.run.playerHp,maxHp:maxHp(c)};}
  function chapterForStage(stage){return(balance.chapters?.chapters||[]).find(x=>stage>=x.stages[0]&&stage<=x.stages[1])||null;}
  function buyCosmeticChest(cid){const chest=(balance.cosmetics?.chests||[]).find(x=>x.id===cid);if(!chest)throw new Error("Unknown chest");const owned=state.account.cosmetics||(state.account.cosmetics=[]),pool=(balance.cosmetics.items||[]).filter(x=>chest.pool.includes(x.id)&&!owned.includes(x.id));if(!pool.length)throw new Error("Chest collection completed");if((state.account.diamonds||0)<chest.price)throw new Error("Not enough diamonds");const item=pool[Math.floor(random()*pool.length)];state.account.diamonds-=chest.price;owned.push(item.id);return clone(item);}
  function equipCosmetic(cosmeticId){const item=(balance.cosmetics?.items||[]).find(x=>x.id===cosmeticId);if(!item||!(state.account.cosmetics||[]).includes(cosmeticId))throw new Error("Cosmetic is not owned");state.account.activeCosmetics=state.account.activeCosmetics||{};state.account.activeCosmetics[item.type]=item.id;return clone(item);}
  const difficultyOf=character=>balance.difficulty.modes[character.difficulty||balance.difficulty.default]||balance.difficulty.modes.normal;
  const rarityKey=rarity=>({Обычная:"common",Редкая:"rare",Эпическая:"epic",Легендарная:"legendary",Богоподобная:"godlike"}[rarity]||String(rarity||"common").toLowerCase());
  const stageSilver=stage=>(balance.mobs.silver_brackets||[]).find(x=>stage>=x.min&&stage<=x.max)?.amount||0;
  const resourceConfig=balance.resources||{starting_fraction:0.58,action_costs:{attack_skill:22,counter:18,ultimate:42},regeneration:{auto_attack:3,kill:5,potion:25}};
  const damageTypes=balance.mobs.damage_types||["fire","ice","dark","physical"];
  const damageTypeMultiplier=(target,type)=>{
   if(target?.weakness===type)return balance.mobs.vulnerability_multiplier||1.5;
   if(target?.resistance===type)return balance.mobs.resistance_multiplier||0.5;
   return 1;
  };
  const itemLevelForStage=stage=>Math.max(balance.item_level.min,Math.min(balance.item_level.max,Math.floor(Number(stage)||1)));
  function dropEligibility(enemy,stage,heroic){
   const eliteOrBoss=enemy?.type==="elite"||enemy?.type==="boss";
   return{
    chisel:true,
    enhancementStone:eliteOrBoss&&stage>=balance.equipment.stone_unlock_stage,
    craftMaterials:enemy?.type==="elite"?balance.materials.drops.elite_materials:enemy?.type==="boss"?balance.materials.drops.boss_materials:0,
    refineStone:stage>=balance.equipment.refine_unlock_stage,
    armorScroll:!!heroic,
    weaponScroll:!!heroic&&eliteOrBoss
   };
  }
  function bossPhaseInfo(currentHp,maxHp){
   const ratio=clamp((Number(currentHp)||0)/Math.max(1,Number(maxHp)||1),0,1);
   const phase=ratio>0.70?1:ratio>0.40?2:ratio>0.10?3:4;
   const config=(balance.bosses.phases||[]).find(item=>item.phase===phase)||{phase};
   return{...clone(config),ratio};
  }
  function resolveReaction(telegraphType,counterId,classId,baseDamage){
   const configured=counterId?balance.skills.counter_abilities[classId]:null;
   const counter=configured&&configured.id===counterId?configured:null;
   let damageMultiplier=counter?0.5:1,cleansesPoison=false;
   if(telegraphType==="aoe"&&counter)damageMultiplier=0;
   else if(telegraphType==="poison"&&counter){damageMultiplier=0;cleansesPoison=true;}
   else if(counter){
    if(["evade","absorb_all","stun","riposte"].includes(counter.effect))damageMultiplier=0;
    else if(counter.effect==="damage_reduction"||counter.effect==="slow")damageMultiplier=1-(counter.damage_reduction||0.5);
    if(counter.effect==="cleanse")cleansesPoison=true;
   }
   return{
    damageMultiplier,
    damage:Math.max(0,Math.round(Math.max(0,Number(baseDamage)||0)*damageMultiplier)),
    cleansesPoison,
    stunSeconds:counter?.effect==="stun"?counter.duration_seconds||0:0,
    attackSpeedReduction:counter?.effect==="slow"?counter.speed_reduction||0:0,
    slowSeconds:counter?.effect==="slow"?counter.duration_seconds||0:0,
    riposteMultiplier:counter?.effect==="riposte"?counter.damage_multiplier||1:0,
    counterName:counter?.name||null
   };
  }
  const equipmentItemLevelBonus=character=>(character.gear||[]).reduce((sum,item)=>sum+(item?Math.min(balance.item_level.max,item.itemLevel||item.item_level||0)*balance.item_level.stat_bonus_per_level:0),0);
  const publishGhost=(character,reason)=>{
   const stats=pvpSnapshot(character.id),expiry=now()+balance.pvp.ghost_ttl_days*86400000;
   const ghost={id:id(),characterId:character.id,name:character.name,classId:character.classId,branch:character.branch,level:character.level,bp:combatPower(character),tier:tierForBp(combatPower(character)).id,skillLoadout:clone(character.skillLoadout||[]),talents:clone(character.talents||{}),stats:{attack:stats.attack,defense:stats.defense,maxHp:stats.maxHp,controlDurationMultiplier:stats.controlDurationMultiplier,normalized:true},gear:clone(character.gear||[]),reason,createdAt:now(),expiresAt:expiry};
   state.account.ghosts=(state.account.ghosts||[]).filter(item=>item.characterId!==character.id&&item.expiresAt>now());
   state.account.ghosts.unshift(ghost);state.account.ghosts=state.account.ghosts.slice(0,100);
   return clone(ghost);
  };
  function publishGhostSnapshot(characterId,reason){return publishGhost(getChar(characterId),reason||"exit");}
  function weeklyKey(){return Math.floor(now()/(7*86400000));}
  function submitWeeklyRating(characterId){
   const character=getChar(characterId),week=weeklyKey();
   state.weeklyRating=state.weeklyRating.filter(entry=>entry.week===week&&entry.characterId!==characterId);
   state.weeklyRating.push({week,characterId,name:character.name,classId:character.classId,combatPower:combatPower(character),completionMs:character.stats.completionMs||0,updatedAt:now()});
   state.weeklyRating.sort((a,b)=>b.combatPower-a.combatPower||a.completionMs-b.completionMs);
   state.weeklyRating=state.weeklyRating.filter(entry=>entry.week===week).slice(0,balance.heroic.weekly_rating.top||100);
   return clone(state.weeklyRating);
  }
  function weeklyLeaderboard(){return clone(state.weeklyRating.filter(entry=>entry.week===weeklyKey()).sort((a,b)=>b.combatPower-a.combatPower||a.completionMs-b.completionMs).slice(0,balance.heroic.weekly_rating.top||100));}
  const tierForBp=bp=>(balance.bp.tiers.find(tier=>bp>=tier.min&&(tier.max===null||bp<=tier.max))||balance.bp.tiers[0]);
  const getChar=id=>{
   const character=state.characters.find(item=>item.id===(id||state.activeCharacterId));
   if(!character)throw new Error("Character not found");
   character.buffs=character.buffs||{};
   character.potionCapacityBonus=character.potionCapacityBonus||0;
   character.dailyChest=character.dailyChest||{lastOpenedAt:0};
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
   const character=getChar(characterId),daily=ensureDaily(character),increment=Math.max(0,Math.floor(amount||1));
   daily.progress[metric]=(daily.progress[metric]||0)+increment;
   character.stats[metric]=(character.stats[metric]||0)+increment;
   return daily.progress[metric];
  }
  function dailySnapshot(characterId){
   const character=getChar(characterId),daily=ensureDaily(character);
   const quests=balance.heroic.daily_quests.map(quest=>({...clone(quest),progress:daily.progress[quest.metric]||0,complete:(daily.progress[quest.metric]||0)>=quest.target,claimed:daily.claimed.includes(quest.id)}));
   return{date:daily.date,modifier:dailyModifierForNow(),quests,boss:clone(daily.boss)};
  }
  function dailyChestSnapshot(characterId){
   const character=getChar(characterId),lastOpenedAt=Math.max(0,Number(character.dailyChest?.lastOpenedAt)||0);
   const readyAt=lastOpenedAt+24*60*60*1000,remainingMs=Math.max(0,readyAt-now());
   return{lastOpenedAt,readyAt,remainingMs,available:remainingMs===0};
  }
  function claimDailyChest(characterId){
   const character=getChar(characterId),snapshot=dailyChestSnapshot(characterId);
   if(!snapshot.available)throw new Error("Ежедневный сундук уже открыт. Подожди 24 часа.");
   const rewardPool=[
    {type:"silver",amount:50+Math.floor(random()*51)},
    {type:"potion",amount:1},
    {type:"materials",amount:10}
   ];
   const reward=clone(rewardPool[Math.min(rewardPool.length-1,Math.floor(random()*rewardPool.length))]);
   if(reward.type==="silver")character.silver=(character.silver||0)+reward.amount;
   if(reward.type==="potion"){
    const stack=character.bag.find(item=>item.type==="healing_potion");
    if(stack)stack.quantity=(stack.quantity||1)+1;
    else character.bag.push({id:id(),type:"healing_potion",quantity:1});
   }
   if(reward.type==="materials"){
    const stack=character.bag.find(item=>item.type==="craft_material");
    if(stack)stack.quantity=(stack.quantity||0)+reward.amount;
    else character.bag.push({id:id(),type:"craft_material",quantity:reward.amount});
   }
   character.dailyChest={lastOpenedAt:now(),lastReward:clone(reward)};
   return{...clone(reward),...dailyChestSnapshot(characterId)};
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
  function pvpRankStats(tierId){
   const tier=(balance.bp.tiers||[]).find(x=>x.id===tierId)||balance.bp.tiers[0];
   const rankLevel=({bronze:20,silver:40,gold:60,platinum:80,diamond:100})[tier?.id]||40;
   const anchors=balance.character_curves.level_to_stage_anchors||[],divisor=balance.character_curves.base_divisor||1.5,pvp=balance.pvp;
   const attack=Math.max(1,Math.round(interpolation(anchors,rankLevel,"level","dps")/divisor*balance.combat.attack_interval*pvp.damage_multiplier));
   const maxHp=Math.max(1,Math.round(interpolation(anchors,rankLevel,"level","hp")/divisor*pvp.health_multiplier));
   const defense=Math.round(balance.classes.base_stats.base_defense+(rankLevel-1)*balance.classes.base_stats.defense_per_level);
   return{tier:tier?.id||"bronze",rankLevel,attack,maxHp,defense,controlDurationMultiplier:pvp.control_duration_multiplier};
  }
  function pvpSnapshot(characterId){
   const character=getChar(characterId),tier=tierForBp(combatPower(character)),stats=pvpRankStats(tier.id);
   return{classId:character.classId,level:character.level,tier:tier.id,attack:stats.attack,defense:stats.defense,maxHp:stats.maxHp,controlDurationMultiplier:stats.controlDurationMultiplier,normalized:true,gearImpact:false,source:"pvp"};
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
    for(const socket of ((Array.isArray(item.installedGems)&&item.installedGems.length)?item.installedGems:(item.sockets||[]))){
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
   const rarityRank={"Обычная":1,"Редкая":2,"Эпическая":3,"Легендарная":4,"Богоподобная":5};
   const equipped=(character.gear||[]).filter(item=>item&&item.branch===character.branch&&rarityRank[item.rarity]);
   const lowest=equipped.reduce((value,item)=>Math.min(value,rarityRank[item.rarity]),99);
   const tier=Object.keys(rarityRank).find(key=>rarityRank[key]===lowest)||null;
   const pieces=equipped.length,total={damage:0,damageReduction:0,skillPower:0,attack:0,health:0,defense:0,crit:0,attackSpeed:0,pieces,rarity:tier,branch:character.branch,bonuses:[]};
   if(!tier||!character.branch)return total;
   const branchId=character.branch;
   const attackBranches=["bleed","poison","execution","fire_dragon","greatsword","dual_swords","nature","exorcism"];
   const defenseBranches=["wand_shield","sword_shield","ice_dragon","earth"];
   const healthBranches=["healing","spirits"];
   const critBranches=["rapier"];
   const speedBranches=["water"];
   const magicBranches=["black_dragon","darkness","dark_gods","buffs"];
   const keyStat=attackBranches.includes(branchId)?"attack":defenseBranches.includes(branchId)?"defense":healthBranches.includes(branchId)?"health":critBranches.includes(branchId)?"crit":speedBranches.includes(branchId)?"attackSpeed":magicBranches.includes(branchId)?"skillPower":"attack";
   const active=pieces>=6?{pieces:6,value:.20}:pieces>=4?{pieces:4,value:.10}:pieces>=2?{pieces:2,value:.05}:null;
   if(active){
    total[keyStat]=active.value;
    if(keyStat==="attack"||keyStat==="skillPower")total.damage=active.value;
    total.bonuses.push({pieces:active.pieces,value:active.value,keyStat,effect:active.pieces===6?"Уникальный эффект специализации":null});
   }
   if(pieces>=6){total.damageReduction=.05;total.specialEffect="Полный сет: +20% к ключевому стату и +5% к снижению входящего урона";}
   total.setId=character.classId+"."+branchId+".set."+rarityKey(tier);
   return total;
  }
    function getSetBonuses(characterId){return clone(setBonusTotals(getChar(characterId)));}
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
   const progression=character.progression||{},runeHealth=(progression.runewords||[]).reduce((value,word)=>value*(1+(word.health||0)),1);
   const sets=setBonusTotals(character);return Math.max(1,Math.round((base*(1+gear.itemLevelBonus)+gear.health)*(1+talent.health)*(1+sets.health)*(1+(progression.bonusHp||0))*runeHealth*(balance.combat.turn_based?.player_hp_multiplier??1)));
  }
  function getCombatStats(characterOrId){
   const character=typeof characterOrId==="string"?getChar(characterOrId):characterOrId;
   const stats=balance.classes.base_stats,gear=equipmentTotals(character),talent=talentBonusTotals(character),sets=setBonusTotals(character);
   const anchors=balance.character_curves.level_to_stage_anchors;
   const baseDps=anchors?.length?interpolation(anchors,character.level,"level","dps")/(balance.character_curves.base_divisor||1.5):
    stats.base_attack+(character.level-1)*stats.attack_per_level;
   const dps=Math.max(1,(baseDps*(1+gear.itemLevelBonus)+gear.attack)*(1+talent.attack));
   const attack=Math.max(1,Math.round(dps*balance.combat.attack_interval*(1+sets.attack)));
   const defense=Math.round((stats.base_defense+(character.level-1)*stats.defense_per_level+gear.defense)*(1+talent.defense)*(1+sets.defense));
   const critChance=clamp((balance.combat.player_damage.crit_chance||0)+gear.crit+talent.crit+sets.crit,0,0.05+(balance.combat.player_damage.gear_crit_chance_bonus_cap||0.25));
   const critMultiplier=(balance.combat.player_damage.crit_multiplier||1.5)+Math.min(balance.combat.player_damage.crit_damage_bonus_cap||0.5,gear.critDamage);
   return{attack,dps,defense,armor:defense,maxHp:maxHp(character),critChance,critMultiplier,
    speed:1+talent.attackSpeed+gear.attackSpeed+sets.attackSpeed,speed:1+talent.attackSpeed+gear.attackSpeed+sets.attackSpeed,attackSpeedMultiplier:1+talent.attackSpeed+gear.attackSpeed+sets.attackSpeed,damageMultiplier:1+sets.damage+sets.skillPower+talent.skillPower,
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
   const gear=(character.gear||[]).filter(Boolean).reduce((sum,item)=>{
    const rarityPower=rarity[rarityKey(item.rarity)]||rarity[item.rarity]||0;
    const itemLevelPower=Math.min(balance.item_level.max,item.itemLevel||item.item_level||0)*weight;
    const stats=item.stats||{};
    const itemStatPower=Math.max(1,Math.round((stats.attack||0)*.25+(stats.defense||0)*.35+(stats.health||0)*.015+(stats.crit||0)*75+(stats.critDamage||0)*30+(stats.spellPower||0)*.2));
    return sum+rarityPower+itemLevelPower+itemStatPower;
   },0);
   const talents=talentBonusTotals(character);
   const talentWeight=talents.attack*.5+talents.health*.35+talents.defense*.5+talents.crit*2+talents.attackSpeed*.8+talents.skillPower*.6;
   const talentPower=Math.round(base*Math.max(0,talentWeight));
   return Math.round(base+gear+talentPower);
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
    const p=balance.paragon,threshold=Array.from({length:balance.xp_curve.max_level-1},(_,i)=>requiredXp(i+1)).reduce((a,b)=>a+b,0);
    character.paragon.xp=Math.max(0,character.xp-threshold);
    character.paragon.level=Math.min(p.max_level,Math.floor(character.paragon.xp/p.xp_per_point));
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
   const starter=!state.account.starterPackClaimed,mode=balance.difficulty.modes[balance.difficulty.default],legacyEligible=state.characters.some(x=>x.level>=100);
   const character={
    id:id(),name:nickname,classId,level:1,xp:0,talentPoints:0,branch:null,talents:{},skillUpgrades:{},unlockedSkills:(classData.base_skills||[]).filter(skill=>skill.type==="active"&&skill.unlock_level<=1).map(skill=>skill.id),activeSkillId:(classData.base_skills||[]).find(skill=>skill.type==="active"&&skill.unlock_level<=1)?.id||null,skillLoadout:(()=>{const first=(classData.base_skills||[]).find(skill=>skill.type==="active"&&skill.unlock_level<=1);return first?[first.id]:[];})(),resource:0,resourceMax:resourceConfig.max_resource_by_class?.[classId]||classTable[classId].resource_max||100,legacyBonus:legacyEligible?0.5:0,legacyBonusUntil:legacyEligible?50:0,legacyGranted:legacyEligible,
    silver:balance.account.starter_pack.silver??balance.economy.starting_silver,
    bag:[{id:id(),type:"healing_potion",quantity:balance.economy.starting_potions??balance.account.starter_pack.healing_potions??3}],
    gear:[null,null,null,null,null,null],heroic:false,buffs:{},potionCapacityBonus:0,daily:null,difficulty:balance.difficulty.default,
    potionBelt:Array(balance.healing.potion_belt_slots).fill(null),dailyChest:{lastOpenedAt:0},achievements:[],loreRead:[],tutorial:{completed:false,step:0,rewardClaimed:false},
    progress:{highestEver:0,currentStage:1,checkpoints:[]},
    run:{active:false,id:null,experience:0,foundItemIds:[],stage:null,playerHp:0,checkpointHeals:0,healingPenaltyFrom:0,healingPenaltyUntil:0,speed2:false,lives:mode.lives,buffs:{}},
    paragon:{level:0,xp:0,stats:{}},pity:{legendaryMisses:0,godlikeMisses:0},stats:{kills:0,elapsedMs:0,completionMs:0,pvpWins:0}
   };
   if(legacyEligible)character.gear=["weapon","chest","head","legs","hands","accessory"].map((slot,i)=>({id:"legacy-"+character.id+"-"+slot,name:"Наследие · "+slot,slot,itemLevel:50,rarity:"Эпическая",stats:{attack:i===0?18:4,defense:i===0?2:8,health:18},refine:0,sockets:[],socketsAvailable:0,bossLoot:false}));
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
   if(!character||!skill)return false;
   const unlockLevel=Number.isFinite(Number(skill.unlock_level))?Number(skill.unlock_level):1;
   return character.level>=unlockLevel&&(!skill.branch_id||character.branch===skill.branch_id);
  }
  function stagePlan(character,stage){
   const map=balance.map,boss=stage%map.boss_every===0,range=(map.gauntlet_ranges||[]).find(item=>stage>=item.min&&stage<=item.max);
   let count=map.boss_mob_count;
   if(!boss){
    const allowed=range?.allowed||[3,5],weights=range?.weights||[0.625,0.375],roll=random();
    let total=0;count=allowed[allowed.length-1]||map.normal_mob_count;
    for(let i=0;i<allowed.length;i++){total+=weights[i]||0;if(roll<total){count=allowed[i];break;}}
   }
   const modifiers=runModifiers(character);
   const eliteChance=Math.min(1,map.elite_chance*modifiers.reduce((multiplier,modifier)=>multiplier*(modifier.elite_chance_multiplier||1),1));
   const eliteIndex=!boss&&random()<eliteChance?Math.floor(random()*count):-1;
   const roleConfig=balance.mobs.roles||{},roleOrder=roleConfig.guaranteed_order||["healer","poison","tank"],chapter=chapterForStage(stage),chapterMobs=chapter?.mob_pool||chapter?.mobs||[];
   return{stage,boss,count,mobs:Array.from({length:count},(_,index)=>{
    const role=boss?"boss":roleOrder[index]||roleConfig.normal_remainder||"normal";
    const weakness=damageTypes[(stage+index)%damageTypes.length],resistance=damageTypes[(stage+index+(roleConfig.assignment_resistance_offset||2))%damageTypes.length];
    return{
     index,type:boss?"boss":index===eliteIndex?"elite":"normal",
     mobId:chapterMobs.length?chapterMobs[Math.floor(random()*chapterMobs.length)]:null,
     role,heroicTrait:character.heroic?(role==="healer"?"medic":role==="tank"?"reflector":role==="poison"?"volatile":null):null,runShieldFraction:runModifiers(character).reduce((v,m)=>Math.max(v,m.all_enemies_shield_fraction||0),0),roleIcon:roleConfig[role]?.icon||"",speed:roleConfig[role]?.speed||1,
     mechanic:index===eliteIndex?map.elite_mechanics[Math.floor(random()*map.elite_mechanics.length)]:null,
     weakness,resistance,
     statMultiplier:character.heroic?map.heroic_stat_multiplier:1
    };
   })};
  }
  function beginRun(character){
   if(character.run.active)return;
   if(!character.run.runModifierId){const offered=runModifierOptions(character.id);if(offered.length)character.run.runModifierId=offered[0].id;}
   const season=ensureSeason(),difficulty=difficultyOf(character);
   character.run={...character.run,active:true,id:id(),experience:0,foundItemIds:[],stage:null,rescueUsed:false,weeklyCompletionCounted:false,
    checkpointHeals:0,healingPenaltyFrom:0,healingPenaltyUntil:0,speed2:false,lives:difficulty.lives,playerHp:maxHp(character),
    difficulty:character.difficulty||balance.difficulty.default,season:clone(season),dailyModifier:dailyModifierForNow(),startedAt:now()};
  }
  function beginStage(characterId,requestedStage){
   const character=getChar(characterId);
   const stage=requestedStage||character.progress.currentStage;
   const highest=character.progress.highestEver;
   if(stage>highest+1)throw new Error("Stage is locked until the previous stage is cleared");
   if(stage<1||stage>balance.map.total_stages)throw new Error("Invalid map stage");
   // A page refresh can leave the persisted run.stage in localStorage while
   // the UI battle object is recreated. Re-entering that same stage is a
   // resume operation, not a second stage start.
   if(character.run.stage){
    // The saved stage is authoritative; map selection may be stale after reload.
    return clone(character.run.stage);
   }
   beginRun(character);
   const plan=stagePlan(character,stage),previousStage=character.run.stage;
   character.run.stage={...plan,enemyIndex:0,targetIndex:0,killedIndices:[],potionUsedTargets:[],potionSlotUsed:false,startedAt:now(),bossPhase:1};
   const startFraction=resourceConfig.starting_fraction??0.58;
   character.resource=Math.min(character.resourceMax,Math.max(character.resource||0,Math.round(character.resourceMax*startFraction)));
   character.run.speed2=false;
   return clone(character.run.stage);
  }
  function currentEnemy(character){
   if(!character.run.stage)throw new Error("No active battle");
   const stage=character.run.stage,killed=new Set(stage.killedIndices||[]);
   const requested=stage.targetIndex??stage.enemyIndex;
   const index=stage.mobs[requested]&&!killed.has(requested)?requested:stage.mobs.findIndex((_,i)=>!killed.has(i));
   return index<0?null:stage.mobs[index];
  }
  function selectTarget(characterId,index){
   const character=getChar(characterId),stage=character.run.stage;
   if(!stage)throw new Error("No active battle");
   if(!Number.isInteger(index)||index<0||index>=stage.mobs.length)throw new Error("Invalid target");
   const killed=new Set(stage.killedIndices||[]);
   if(killed.has(index))index=stage.mobs.findIndex((_,i)=>!killed.has(i));
   if(index<0)return null;
   stage.targetIndex=index;stage.enemyIndex=index;
   stage.potionSlotUsed=(stage.potionUsedTargets||[]).includes(index);
   return clone(stage.mobs[index]);
  }
  function sanitizeActiveStage(characterId){
   const character=getChar(characterId),stage=character.run.stage;
   if(!stage)return{active:false,completed:false,targetIndex:null};
   stage.killedIndices=Array.isArray(stage.killedIndices)?stage.killedIndices:[];
   stage.potionUsedTargets=Array.isArray(stage.potionUsedTargets)?stage.potionUsedTargets:[];
   const snapshot=stage.uiBattleSnapshot&&Array.isArray(stage.uiBattleSnapshot.enemies)?stage.uiBattleSnapshot:null;
   const deadIndexes=snapshot?snapshot.enemies.filter(enemy=>enemy&&Number.isInteger(enemy.index)&&(enemy.alive===false||enemy.dead===true||Number(enemy.hp)<=0)).map(enemy=>enemy.index).sort((a,b)=>a-b):[];
   const processed=[];
   for(const index of deadIndexes){
    if(index<0||index>=stage.mobs.length||stage.killedIndices.includes(index))continue;
    const result=finishEnemy(characterId,{targetIndex:index,speed2:!!character.run.speed2});
    processed.push(index);
    if(result.stageComplete)return{active:false,completed:true,targetIndex:null,processed};
   }
   const current=character.run.stage;
   if(!current)return{active:false,completed:true,targetIndex:null,processed};
   const aliveIndexes=current.mobs.map((_,i)=>i).filter(i=>!current.killedIndices.includes(i));
   if(!aliveIndexes.length)return{active:false,completed:!character.run.stage,targetIndex:null,processed};
   const preferred=snapshot?.targetIndex??current.targetIndex??current.enemyIndex;
   const targetIndex=aliveIndexes.includes(preferred)?preferred:aliveIndexes[0];
   current.targetIndex=targetIndex;current.enemyIndex=targetIndex;
   current.potionSlotUsed=current.potionUsedTargets.includes(targetIndex);
   if(snapshot){
    snapshot.targetIndex=targetIndex;
    snapshot.enemies=snapshot.enemies.map(enemy=>enemy&&current.killedIndices.includes(enemy.index)?{...enemy,hp:0,alive:false,dead:true}:enemy);
   }
   return{active:true,completed:false,targetIndex,processed};
  }
  function getEnemyStats(characterId,stage,enemy){
   const character=getChar(characterId),curve=balance.mobs.curves;
   let hp=interpolation(curve,stage,"stage","hp"),damage=interpolation(curve,stage,"stage","damage");
   if(enemy?.type==="elite"){
    hp*=balance.mobs.elite.hp_multiplier;
    const role=String(enemy.role||"normal");
    const roleMultiplier=balance.mobs.elite.role_damage_multipliers?.[role];
    damage*=Number.isFinite(Number(roleMultiplier))?Number(roleMultiplier):balance.mobs.elite.damage_multiplier;
   }
   if(enemy?.type==="boss"){
    hp*=balance.bosses.hp_multiplier;damage*=balance.bosses.damage_multiplier;
    if(stage<=balance.bosses.newbie_exception.max_stage){
     hp*=Number(balance.bosses.newbie_exception.hp_multiplier??1);
     damage*=balance.bosses.newbie_exception.damage_multiplier;
    }
   }
   const heroic=character.heroic?balance.heroic.mob_stat_multiplier:1;
   const modifiers=runModifiers(character);
   hp=Math.max(1,Math.round(hp*heroic*(balance.combat.turn_based?.enemy_hp_multiplier??1)));
   damage=Math.max(1,Math.round(damage*heroic*(balance.combat.turn_based?.enemy_damage_multiplier??1)));
   for(const modifier of modifiers){
    if(modifier.enemy_damage_multiplier)damage=Math.round(damage*modifier.enemy_damage_multiplier);
    if(modifier.id==="cursed_levels"&&stage%10===5){hp=Math.round(hp*modifier.cursed_stage_multiplier);damage=Math.round(damage*modifier.cursed_stage_multiplier);}
   }
   const speedMultiplier=modifiers.reduce((multiplier,modifier)=>{
    const configured=Number(modifier.enemy_attack_speed_multiplier);
    return multiplier*(Number.isFinite(configured)&&configured>0?configured:1);
   },1);
   const configuredInterval=Number(balance.combat.attack_interval);
   const baseInterval=Number.isFinite(configuredInterval)&&configuredInterval>0?configuredInterval:1;
   const safeSpeedMultiplier=Number.isFinite(speedMultiplier)&&speedMultiplier>0?speedMultiplier:1;
   const attackInterval=baseInterval/safeSpeedMultiplier;
   const attackIntervalMs=Math.round(attackInterval*1000);
   return{hp,damage,attackInterval,attackIntervalMs:Number.isFinite(attackIntervalMs)&&attackIntervalMs>0?attackIntervalMs:1000,weakness:enemy?.weakness||null,resistance:enemy?.resistance||null,role:enemy?.role||"normal"};
  }
  function capBossDamage(target,rawDamage,alreadyDealt){
   const raw=Math.max(0,Number(rawDamage)||0);if(target?.type!=="boss")return raw;
   const cap=Math.max(1,Number(target.maxHp)||0)*0.35,used=Math.max(0,Number(alreadyDealt)||0);
   return Math.max(0,Math.min(raw,cap-used));
  }
  function basicAttackStats(characterId){
   const character=getChar(characterId),stats=getCombatStats(character);let multiplier=.75;
   if(["assassin","duelist","destroyer"].includes(character.classId))multiplier=1;
   else if(["bishop","elemental"].includes(character.classId))multiplier=.5;
   else if(character.classId==="dragonkin")multiplier=character.branch==="fire_dragon"?1:character.branch==="black_dragon"?.5:.75;
   else if(character.classId==="shaman")multiplier=character.branch==="nature"?1:character.branch==="dark_gods"?.5:.75;
   return{multiplier,damage:Math.max(1,Math.round(stats.attack*multiplier)),resourceGain:15};
  }
  function restoreResource(characterId,amount){const character=getChar(characterId),before=character.resource;character.resource=Math.min(character.resourceMax,character.resource+Math.max(0,Number(amount)||0));return{before,resource:character.resource,gained:character.resource-before};}
  function mitigationMultiplier(defense,attackerLevel){
   const armor=Math.max(0,Number(defense)||0),level=Math.max(1,Number(attackerLevel)||1);
   return 1-Math.min(0.75,armor/(armor+100+10*level));
  }
  function resistanceMultiplier(resistance,attackerLevel){
   return mitigationMultiplier(resistance,attackerLevel);
  }
  function applyVampirism(characterId,damage){
   const character=getChar(characterId),classId=character.classId;
   let fraction=balance.combat.vampirism?.default_fraction??0.01;
   if(classId==="bishop")fraction=0;
   else if(["destroyer","assassin","duelist"].includes(classId))fraction=balance.combat.vampirism?.damage_dealer_fraction??0.0175;
   else if(classId==="dragonkin"&&character.branch==="ice_dragon")fraction=balance.combat.vampirism?.ice_tank_fraction??0.01;
   const healed=Math.max(0,Math.floor(Math.max(0,damage)*fraction));
   const before=character.run.playerHp;character.run.playerHp=Math.min(maxHp(character),before+healed);
   return{healed:character.run.playerHp-before,hp:character.run.playerHp,fraction};
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
   multiplier*=1+(character.progression?.permanentXpBonus||0);
   for(const modifier of runModifiers(character))if(modifier.reward_xp_multiplier)multiplier*=modifier.reward_xp_multiplier;
   if(character.run?.dailyChallengeActive)multiplier*=2;
   return multiplier;
  }
  function awardXp(character,amount){
   const legacyCap=character.legacyBonusUntil?Array.from({length:Math.max(0,character.legacyBonusUntil-1)},(_,i)=>requiredXp(i+1)).reduce((sum,x)=>sum+x,0):0;
   const legacyRemaining=Math.max(0,legacyCap-character.xp),legacyAmount=Math.min(Math.max(0,amount),legacyRemaining),value=Math.max(0,Math.round(legacyAmount*(1+(character.legacyBonus||0))+Math.max(0,amount-legacyRemaining))),before=character.level;
   character.xp+=value;character.run.experience+=value;
   state.account.xp=Math.max(0,(state.account.xp||0)+value);
   recalcLevel(character);
   const paragon=character.paragon||(character.paragon={level:0,xp:0,stats:{}});
   if(character.level>=balance.paragon.unlock_level&&paragon.level<balance.paragon.max_level){
    paragon.xp=(paragon.xp||0)+value;
    while(paragon.xp>=balance.paragon.xp_per_point&&paragon.level<balance.paragon.max_level){paragon.xp-=balance.paragon.xp_per_point;paragon.level++;}
    character.stats.paragon_level=paragon.level;
   }
   character.stats.account_level=accountLevel();
   return{amount:value,total:character.xp,level:character.level,levelUp:character.level>before,accountLevel:accountLevel(),accountXp:state.account.xp,paragonLevel:paragon.level};
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
    const slots=["weapon","chest","head","legs","hands","accessory"],slot=options.slot||slots[Math.floor(random()*slots.length)];
    const rarityScale={"Обычная":1,"Редкая":1.35,"Эпическая":1.8,"Легендарная":2.4,"Богоподобная":3.2}[rarity]||1;
    const scale=(2+itemLevel*.65)*rarityScale;
    const statProfiles={
     weapon:{attack:Math.max(1,Math.round(scale*1.8)),crit:rarityScale>=1.8?.01:0},
     chest:{defense:Math.max(1,Math.round(scale*1.1)),health:Math.max(5,Math.round(scale*6))},
     head:{defense:Math.max(1,Math.round(scale*.8)),health:Math.max(3,Math.round(scale*2.5))},
     legs:{defense:Math.max(1,Math.round(scale*.65)),health:Math.max(4,Math.round(scale*3.2))},
     hands:{attack:Math.max(1,Math.round(scale*.55)),defense:Math.max(1,Math.round(scale*.3)),crit:rarityScale>=1.8?.008:0},
     accessory:{attack:Math.max(1,Math.round(scale*.8)),health:Math.max(2,Math.round(scale*1.5)),crit:Math.min(.08,.005*rarityScale),spellPower:Math.max(0,Math.round(scale*.45))}
    };
    const slotNames={weapon:"Оружие",chest:"Нагрудник",head:"Шлем",legs:"Поножи",hands:"Перчатки",accessory:"Аксессуар"};
    const rarityNames={"Обычная":"Обычный","Редкая":"Редкий","Эпическая":"Эпический","Легендарная":"Легендарный","Богоподобная":"Богоподобный"};
    const branch=(classTable[character.classId]?.branches||[]).find(entry=>entry.id===character.branch);
    const branchName=branch?.set?.name||branch?.theme||branch?.name||"Специализация";
    const stats={...(options.stats||statProfiles[slot]||statProfiles.accessory)};
    const setId=character.branch?character.classId+"."+character.branch+".set."+rarityKey(rarity):null;
    const item={id:id(),type:"equipment",name:options.name||rarityNames[rarity]+" · "+branchName+" · "+slotNames[slot],rarity,branch:character.branch||null,branchName,setId,uniqueId:options.uniqueId||null,unique:!!options.uniqueId,
     itemLevel,slot,stats,refine:0,sockets:[],socketsAvailable:0,enchant:null,bossLoot:!!options.bossLoot,foundRunId:character.run.id};
    const prefs=state.account.settings||{},threshold=Number(prefs.autoSalvageBelow||0),auto=!!prefs.autoSalvage&&["Обычная","Редкая"].includes(rarity)&&itemLevel<threshold&&!item.bossLoot;
    if(auto){const quantity=balance.materials.salvage[rarity]||0,stack=character.bag.find(x=>x.type==="craft_material");if(stack)stack.quantity=(stack.quantity||0)+quantity;else character.bag.push({id:id(),type:"craft_material",quantity});character.stats.items_salvaged=(character.stats.items_salvaged||0)+1;item.autoSalvaged=true;item.type="auto_salvage";item.quantity=quantity;item.name="Авто-разбор · "+rarity;recordWeeklyProgress(character,"items_salvaged",1);}else character.bag.push(item);
    character.run.foundItemIds.push(item.id);character.stats.items_found=(character.stats.items_found||0)+1;
    if(item.uniqueId)character.stats.unique_items=(character.stats.unique_items||0)+1;
    return item;
   }
  function rollLoot(character,enemy,stage,firstClear,automatic){
   if(automatic||character.level<10||!character.branch)return[];
   const drops=balance.drop_tables,items=[],buff=activeBuff(character,"drop"),dropMultiplier=(buff?buff.multiplier:1)*runModifiers(character).reduce((v,m)=>v*(enemy.type==="elite"?(m.elite_loot_multiplier||1):enemy.type==="normal"?(m.normal_loot_multiplier||1):1),1);
   const uniqueBossDrop=rarity=>{
    const configured=classTable[character.classId].unique_items||[];
    const owned=new Set([...(character.bag||[]),...(character.gear||[]).filter(Boolean)].map(item=>item.uniqueId).filter(Boolean));
    const available=configured.filter(item=>!owned.has(item.id));
    if(!available.length)return createDrop(character,rarity,{bossLoot:true,itemLevel:stage});
    const item=available[Math.floor(random()*available.length)];
    return createDrop(character,rarity,{bossLoot:true,uniqueId:item.id,name:item.name,slot:item.slot,stats:item.stats,itemLevel:stage});
   };
   if(enemy.type==="boss"){
    if(firstClear&&drops.guaranteed_epic_first_clear_boss)items.push(createDrop(character,"Эпическая",{bossLoot:true,itemLevel:stage,slot:"weapon"}));
    const guaranteedFrom=drops.guaranteed_boss_rare_epic_from_stage??3;
    if(stage>=guaranteedFrom&&!items.some(item=>["Редкая","Эпическая"].includes(item.rarity))){
     const guaranteedRarity=random()<0.5?"Редкая":"Эпическая";
     items.push(createDrop(character,guaranteedRarity,{bossLoot:true,itemLevel:stage}));
    }
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
     const slot=["weapon","chest","head","accessory"][Math.floor(random()*4)];
     items.push(createDrop(character,"Эпическая",{setId:branch?.set?.id||null,slot,itemLevel:stage}));
    }
   }else if(random()<Math.min(1,drops.normal_item_chance*dropMultiplier)){
    items.push(createDrop(character,random()<drops.normal_rare_weight?"Редкая":"Обычная",{itemLevel:stage}));
   }
   return items;
  }
  function finishEnemy(characterId,flags){
   flags=flags||{};
   const character=getChar(characterId),stageData=character.run.stage,targetIndex=Number.isInteger(flags.targetIndex)?flags.targetIndex:(stageData.targetIndex??stageData.enemyIndex),enemy=stageData.mobs[targetIndex],stage=stageData.stage;
   if(!enemy)throw new Error("Target is not active");
   stageData.killedIndices=stageData.killedIndices||[];
   if(stageData.killedIndices.includes(targetIndex))throw new Error("Target is already defeated");
   const potionUsed=(stageData.potionUsedTargets||[]).includes(targetIndex);
   const firstClear=stage>character.progress.highestEver;
   const use2x=flags.speed2===undefined?!!character.run.speed2:!!flags.speed2;
   const multiplier=xpMultiplier(character,stage,{speed2:use2x});
   const gained=awardXp(character,enemyXp(enemy,stage)*multiplier*(flags.overkillBonus?1.1:1));
   const loot=rollLoot(character,enemy,stage,firstClear,false);
   const materials=[],dropBuff=activeBuff(character,"drop"),dropMultiplier=dropBuff?dropBuff.multiplier:1,eligibility=dropEligibility(enemy,stage,character.heroic);
   const addMaterial=item=>{character.bag.push(item);character.run.foundItemIds.push(item.id);materials.push(item);character.stats.items_found=(character.stats.items_found||0)+1;};
   if(eligibility.chisel&&random()<Math.min(1,balance.equipment.chisel_drop_chance*dropMultiplier))
    addMaterial({id:id(),type:"chisel",quantity:1,foundRunId:character.run.id,bossLoot:enemy.type==="boss"});
   if(eligibility.enhancementStone&&character.branch&&random()<Math.min(1,balance.equipment.stone_drop_chance*dropMultiplier)){
    const slot=random()<0.5?"weapon":"armor";
    const stonePool=balance.equipment.stone_types.filter(type=>type.class_id===character.classId&&type.branch_id===character.branch&&type.slot===slot);
    const stoneType=clone(stonePool[Math.floor(random()*stonePool.length)]||{id:character.classId+"."+character.branch+"."+slot,class_id:character.classId,branch_id:character.branch,slot,attack_per_level:slot==="weapon"?1.5:0,defense_per_level:slot==="armor"?1:0,health_per_level:slot==="armor"?3:0});
    addMaterial({id:id(),type:"enhancement_stone",stoneType,level:1,foundRunId:character.run.id,bossLoot:enemy.type==="boss"});
   }
   if(eligibility.craftMaterials){
    const quantity=eligibility.craftMaterials;
    addMaterial({id:id(),type:"craft_material",quantity,foundRunId:character.run.id,bossLoot:enemy.type==="boss"});
   }
   if(eligibility.refineStone&&random()<Math.min(1,balance.equipment.refine_stone_drop_chance*dropMultiplier))
    addMaterial({id:id(),type:"refine_stone",quantity:1,foundRunId:character.run.id,bossLoot:enemy.type==="boss"});
   if(eligibility.armorScroll&&random()<Math.min(1,balance.equipment.enchantment.armor_scroll_chance*dropMultiplier))
    addMaterial({id:id(),type:"enchant_scroll",slot:"armor",foundRunId:character.run.id,bossLoot:enemy.type==="boss"});
   if(eligibility.weaponScroll&&random()<Math.min(1,balance.equipment.enchantment.weapon_scroll_chance*dropMultiplier))
    addMaterial({id:id(),type:"enchant_scroll",slot:"weapon",foundRunId:character.run.id,bossLoot:enemy.type==="boss"});
   const autoResult=character.level>=10&&character.branch?equipBest(character.id):{equipped:0};
   const equippedIds=new Set((character.gear||[]).filter(Boolean).map(item=>item.id));
   for(const item of loot){if(item.type==="equipment")item.disposition=item.autoSalvaged?"salvaged":equippedIds.has(item.id)?"equipped":"bag";else if(item.type==="auto_salvage")item.disposition="salvaged";else item.disposition="bag";}
   character.stats.kills++;
   if(enemy.type==="boss"){character.stats.boss_kills=(character.stats.boss_kills||0)+1;if(!potionUsed)character.stats.potionless_bosses=(character.stats.potionless_bosses||0)+1;}
   const silverBuff=activeBuff(character,"silver"),rewardMultiplier=runModifiers(character).reduce((value,modifier)=>value*(modifier.reward_silver_multiplier||1),1);
   const accountBonus=1+Math.max(0,accountLevel()-1)*balance.account.xp_silver_bonus_per_level;
   const silver=Math.round(stageSilver(stage)*accountBonus*(silverBuff?silverBuff.multiplier:1)*rewardMultiplier);
   character.silver+=silver;
   if(enemy.type==="elite"){recordDailyProgress(character.id,"elite_kills",1);recordWeeklyProgress(character,"elite_kills",1);}
   if(enemy.type==="boss")recordWeeklyProgress(character,"boss_kills",1);
   if(enemy.type==="elite"||enemy.type==="boss")recordWeeklyProgress(character,"elite_boss_kills",1);
   recordWeeklyProgress(character,"kills",1);
   character.resource=Math.min(character.resourceMax,character.resource+(resourceConfig.regeneration?.kill||5));
   stageData.killedIndices.push(targetIndex);
   const done=stageData.killedIndices.length>=stageData.mobs.length;
   const nextTarget=stageData.mobs.findIndex((item,index)=>!stageData.killedIndices.includes(index));
   stageData.enemyIndex=done?stageData.mobs.length:nextTarget;
   if(!done){
    if(stageData.targetIndex===targetIndex)stageData.targetIndex=nextTarget;
    stageData.potionSlotUsed=(stageData.potionUsedTargets||[]).includes(stageData.targetIndex);
   }
   if(done){
    if(use2x)character.stats.speed_runs=(character.stats.speed_runs||0)+1;
    const clear=balance.xp_curve.stage_clear_xp;
    const bonus=(clear.base+stage*clear.per_stage+(enemy.type==="boss"?clear.boss_bonus:0))*multiplier;
    var clearAward=awardXp(character,bonus);
    character.progress.highestEver=Math.max(character.progress.highestEver,stage);
    character.stats.highest_stage=Math.max(character.stats.highest_stage||0,stage);
    if(character.difficulty==="hardcore")character.stats.hardcore_clears=(character.stats.hardcore_clears||0)+1;
    if(character.heroic)character.stats.heroic_clears=(character.stats.heroic_clears||0)+1;
    recordDailyProgress(character.id,"stages_cleared",1);recordWeeklyProgress(character,"stages_cleared",1);if(character.heroic)recordWeeklyProgress(character,"heroic_stages",1);submitWeeklyRating(character.id);
    if(difficultyOf(character).checkpoints&&balance.map.checkpoints.includes(stage)&&!character.progress.checkpoints.includes(stage))character.progress.checkpoints.push(stage);
    if(stage>character.progress.currentStage-1)character.progress.currentStage=stage+1;
    character.run.stage=null;
    character.run.playerHp=maxHp(character);
    if(stage>=balance.seasons.reward_first_clear_stage&&!character.run.seasonRewardClaimed&&firstClear){
     character.stats.season_clear=Math.max(character.stats.season_clear||0,stage);
     const reward=balance.seasons.season_reward_cosmetic;
     if(reward&&!state.account.cosmetics.includes(reward))state.account.cosmetics.push(reward);
     if(character.run.season&&character.run.season.id===ensureSeason().id)ensureSeason().firstClearRewardClaimed=true;
     character.run.seasonRewardClaimed=true;
    }
    if(stage>=balance.map.total_stages&&firstClear)recordWeeklyRun(character);
    if(stage>=balance.heroic.unlock_after_stage&&!character.heroic){
     if(combatPower(character)>=balance.bp.heroic_min_bp){
      character.heroic=true;character.run.lives=balance.difficulty.modes[character.difficulty].lives;
      character.progress.currentStage=1;character.progress.highestEver=balance.map.total_stages;
     }else{
      character.heroicUnlocked=true;character.progress.currentStage=balance.map.total_stages;
     }
     publishGhost(character,"stage_250_clear");
    }else if(stage>=balance.map.total_stages&&character.heroic){
     character.run.active=false;character.stats.runs_completed=(character.stats.runs_completed||0)+1;recordWeeklyRun(character);character.run.runModifierId=null;character.run.offeredModifierIds=null;publishGhost(character,"stage_250_clear");
    }
   }
   return{xp:gained.amount+(done?(clearAward?.amount||0):0),loot:clone(loot.concat(materials)),silver,autoEquipped:autoResult.equipped,stageComplete:done,killedIndex:targetIndex,nextTargetIndex:done?null:stageData.targetIndex,progress:clone(character.progress),playerHp:character.run.playerHp,firstClear};
  }
  function useHealingPotion(characterId,stackId){
   const character=getChar(characterId),stage=character.run.stage;
   if(!stage)throw new Error("Healing potion can only be used during a battle");
   const targetIndex=stage.targetIndex??stage.enemyIndex,enemy=stage.mobs[targetIndex];
   if(enemy?.type==="boss"&&runModifiers(character).some(modifier=>modifier.boss_no_potion))throw new Error("Daily or seasonal modifier disables potions on bosses");
   if(!difficultyOf(character).potion_belt)throw new Error("Potion belt is disabled in Hardcore");
   stage.potionUsedTargets=stage.potionUsedTargets||[];
   if(stage.potionUsedTargets.includes(targetIndex))throw new Error("The healing slot for this enemy has already been consumed");
   const potion=character.bag.find(item=>(!stackId||item.id===stackId)&&item.type==="healing_potion"&&item.quantity>0);
   if(!potion)throw new Error("No healing potions available");
   potion.quantity--;stage.potionUsedTargets.push(targetIndex);stage.potionSlotUsed=true;
   const healFraction=balance.healing.potion_heal_fraction;
   character.run.playerHp=Math.min(maxHp(character),character.run.playerHp+Math.round(maxHp(character)*healFraction));
   character.resource=Math.min(character.resourceMax,character.resource+(resourceConfig.regeneration?.potion||25));
   character.bag=character.bag.filter(item=>item.quantity!==0);
   return character.run.playerHp;
  }
  function potionBeltSnapshot(characterId){
   const character=getChar(characterId),slots=balance.healing.potion_belt_slots;
   return Array.from({length:slots},(_,index)=>{const itemId=character.potionBelt?.[index]||null,stack=character.bag.find(item=>item.id===itemId&&item.type==="healing_potion");return{slot:index,itemId,available:stack?.quantity||0};});
  }
  function assignPotionBelt(characterId,slot,itemId){
   const character=getChar(characterId);
   if(!difficultyOf(character).potion_belt)throw new Error("Potion belt is disabled in Hardcore");
   if(!Number.isInteger(slot)||slot<0||slot>=balance.healing.potion_belt_slots)throw new Error("Invalid potion-belt slot");
   if(!character.bag.some(item=>item.id===itemId&&item.type==="healing_potion"))throw new Error("Healing potion stack not found");
   character.potionBelt=character.potionBelt||Array(balance.healing.potion_belt_slots).fill(null);
   character.potionBelt[slot]=itemId;return clone(potionBeltSnapshot(characterId));
  }
  function usePotionBelt(characterId,slot){
   const character=getChar(characterId),entry=potionBeltSnapshot(characterId)[slot];
   if(!entry)throw new Error("Invalid potion-belt slot");
   if(!entry.itemId)throw new Error("Assign a potion stack to this belt slot first");
   if(!character.bag.some(item=>item.id===entry.itemId&&item.type==="healing_potion"&&item.quantity>0))throw new Error("Assigned potion stack is empty");
   return useHealingPotion(characterId,entry.itemId);
  }
  function setDifficulty(characterId,difficulty){
   const character=getChar(characterId),definition=balance.difficulty.modes[difficulty];
   if(!definition)throw new Error("Unknown difficulty");
   if(character.run.active||character.run.stage)throw new Error("Difficulty can only change between runs");
   character.difficulty=difficulty;character.run.lives=definition.lives;character.run.playerHp=maxHp(character);return difficulty;
  }
  function checkpointHeal(characterId){
   const character=getChar(characterId),checkpoint=character.progress.currentStage-1,nextStage=character.progress.currentStage;
   if(character.run.stage)throw new Error("Checkpoint healing is unavailable during combat");
   if(!difficultyOf(character).checkpoints)throw new Error("Checkpoints are disabled in Hardcore");
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
  function combatIntervalMs(characterId){
   const character=getChar(characterId),base=balance.combat.attack_interval*1000;
   return character.run.speed2?base/balance.combat.speed_2x_multiplier:base;
  }
  function deathPreview(characterId){
   const character=getChar(characterId),difficulty=difficultyOf(character);
   const loss=Math.round(character.run.experience*difficulty.xp_loss_fraction);
   const levelAfter=levelForXp(Math.max(0,character.xp-loss));
   const lossWeights=balance.difficulty.item_loss_by_rarity||[];
   const eligible=character.bag.filter(item=>!item.bossLoot&&lossWeights.some(entry=>entry.rarity===item.rarity));
   return{experienceLoss:loss,levelsLost:Math.max(0,character.level-levelAfter),itemLossChance:eligible.length?difficulty.item_loss_chance:0,eligibleItems:eligible.length,projectedLevel:levelAfter,difficulty:character.difficulty||balance.difficulty.default,lives:character.run.lives||difficulty.lives};
  }
  function confirmDeath(characterId){
   const character=getChar(characterId),preview=deathPreview(characterId),difficulty=difficultyOf(character);
   const ghost=publishGhost(character,"death");
   character.xp=Math.max(0,character.xp-preview.experienceLoss);recalcLevel(character);
   const lossWeights=balance.difficulty.item_loss_by_rarity||[];
   const eligible=character.bag.filter(item=>!item.bossLoot&&lossWeights.some(entry=>entry.rarity===item.rarity));
   let lost=null;
   const lossChance=difficulty.item_loss_chance;
   if(eligible.length&&lossChance>0&&random()<lossChance){
    const entries=balance.difficulty.item_loss_by_rarity||[],weighted=eligible.map(item=>({item,weight:entries.find(x=>x.rarity===item.rarity)?.weight||0})).filter(x=>x.weight>0);
    if(weighted.length){
     const total=weighted.reduce((n,x)=>n+x.weight,0),roll=random()*total;let acc=0;
     const selected=weighted.find(x=>(acc+=x.weight)>roll)||weighted[weighted.length-1];
     lost=selected.item;character.bag=character.bag.filter(item=>item.id!==lost.id);
    }
   }
   const livesBefore=Math.max(1,Math.min(difficulty.lives,character.run.lives||difficulty.lives));
   const livesRemaining=livesBefore-1,runEnded=livesRemaining<=0;
   character.lastDeath={...preview,itemLossChance:lossChance,lostItem:lost?lost.name:null,livesLost:1,livesRemaining:runEnded?difficulty.lives:livesRemaining,runEnded,ghostId:ghost.id};
   character.run.stage=null;character.run.experience=0;character.run.foundItemIds=[];
   character.run.healingPenaltyFrom=0;character.run.healingPenaltyUntil=0;character.run.checkpointHeals=0;character.run.speed2=false;
   character.run.lives=runEnded?difficulty.lives:livesRemaining;character.run.active=!runEnded;
   if(runEnded){character.progress.currentStage=balance.death.new_run_stage;character.stats.runs_completed=(character.stats.runs_completed||0)+1;recordWeeklyRun(character);character.run.runModifierId=null;character.run.offeredModifierIds=null;}
   character.run.playerHp=maxHp(character);
   return clone(character.lastDeath);
  }
  function voluntaryRestart(characterId){
   const character=getChar(characterId);
   if(character.run.stage)throw new Error("Restart is only available between stages");
   publishGhost(character,"restart");
   const difficulty=difficultyOf(character);
   if(character.run.active){character.stats.runs_completed=(character.stats.runs_completed||0)+1;recordWeeklyRun(character);}
   character.run.active=false;character.run.experience=0;character.run.foundItemIds=[];character.run.runModifierId=null;character.run.offeredModifierIds=null;
   character.run.healingPenaltyFrom=0;character.run.healingPenaltyUntil=0;character.run.checkpointHeals=0;character.run.speed2=false;character.run.lives=difficulty.lives;
   character.progress.currentStage=balance.death.new_run_stage;character.run.playerHp=maxHp(character);
   return clone(character.progress);
  }
  function autoBattle(characterId,options){
   options=options||{};
   const character=getChar(characterId),limit=Math.min(options.maxStages||balance.auto_battle.default_max_stages,balance.auto_battle.default_max_stages);
   if(character.run.stage)throw new Error("Auto-battle cannot run during manual combat");
   if(!difficultyOf(character).auto_battle)throw new Error("Auto-battle is disabled in Hardcore");
   if(!character.run.runModifierId){const offered=runModifierOptions(character.id);if(offered.length)character.run.runModifierId=offered[0].id;}
   const ceiling=character.progress.highestEver-balance.auto_battle.highest_ever_offset;
   const result={cleared:0,xp:0,stopped:null};
   if(ceiling<character.progress.currentStage){result.stopped="Нет ранее пройденных этапов для авто-боя";return result;}
   beginRun(character);
   while(result.cleared<limit&&character.progress.currentStage<=ceiling){
    const stage=character.progress.currentStage,plan=stagePlan(character,stage);
    if(plan.boss){result.stopped="Босс требует ручного боя";break;}
    
    const stats=getCombatStats(character),branchTypes=balance.skills?.damage_type_by_branch?.[character.classId]||{};
    const autoTypes=character.branch?[branchTypes[character.branch]||"physical"]:Object.values(branchTypes);
    const energyStart=character.resource||Math.round(character.resourceMax*(resourceConfig.starting_fraction||.58));
    let energy=energyStart,stageXp=0,estimatedDamage=0;
    for(const enemy of plan.mobs){
     const e=getEnemyStats(character.id,stage,enemy),bestTypeMultiplier=Math.max(1,...autoTypes.map(type=>damageTypeMultiplier(enemy,type)));
     let enemyHp=e.hp,enemyTurns=0,playerTurns=0;
     const skillCost=character.classId==="duelist"?(resourceConfig.class_costs?.duelist?.attack_skill||1):(resourceConfig.action_costs.attack_skill||22);
     while(enemyHp>0&&playerTurns<10000){
      playerTurns++;
      let hit;
      if(energy>=skillCost){
       hit=stats.dps*(balance.combat.turn_based?.skill_dps_multiplier||2.5)*bestTypeMultiplier;
       energy-=skillCost;
      }else{
       hit=stats.dps*(balance.combat.turn_based?.auto_attack_dps_multiplier||.5)*bestTypeMultiplier;
       energy=Math.min(character.resourceMax,energy+Math.round(character.resourceMax*(resourceConfig.regeneration?.auto_attack||.2)));
      }
      if(enemy.role==="tank"&&playerTurns%3===0)hit*=1-(balance.mobs.roles.tank.shield_fraction||.3);
      enemyHp-=Math.max(1,Math.round(hit));
      enemyTurns++;
      if(enemyTurns%2===0||enemy.type==="boss"){
       const incoming=Math.max(1,Math.round(e.damage*mitigationMultiplier(stats.defense,stage)));
       estimatedDamage+=incoming;
      }
     }
     if(playerTurns>=10000)throw new Error("Auto-battle simulation exceeded its turn safety limit");
     stageXp+=enemyXp(enemy,stage)*xpMultiplier(character,stage,{auto:true});
    }
    character.resource=energy;
    const clear=balance.xp_curve.stage_clear_xp;
    stageXp+=(clear.base+stage*clear.per_stage)*xpMultiplier(character,stage,{auto:true});
    const gained=awardXp(character,stageXp);result.xp+=gained.amount;result.cleared++;
    character.progress.highestEver=Math.max(character.progress.highestEver,stage);character.progress.currentStage=stage+1;
    if(difficultyOf(character).checkpoints&&balance.map.checkpoints.includes(stage)&&!character.progress.checkpoints.includes(stage))character.progress.checkpoints.push(stage);
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
  function craftStone(characterId,stoneType){
   const character=getChar(characterId),recipe=balance.materials.stone_crafting,cost=recipe.materials_per_level_1;
   if(!stoneType||stoneType.class_id!==character.classId||stoneType.branch_id!==character.branch)throw new Error("Choose a stone for the active class specialization");
   let remaining=cost;const stacks=character.bag.filter(item=>item.type==="craft_material"&&(item.quantity||0)>0);
   if(stacks.reduce((sum,item)=>sum+item.quantity,0)<cost)throw new Error("Not enough crafting materials");
   for(const stack of stacks){if(!remaining)break;const used=Math.min(remaining,stack.quantity);stack.quantity-=used;remaining-=used;}
   character.bag=character.bag.filter(item=>item.type!=="craft_material"||item.quantity>0);
   const stone={id:id(),type:"enhancement_stone",stoneType:clone(stoneType),level:1};character.bag.push(stone);character.stats.materials_crafted=(character.stats.materials_crafted||0)+1;return clone(stone);
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
  function insertGem(characterId,itemId,stoneId){
   const character=getChar(characterId);
   const item=character.gear.find(entry=>entry&&entry.id===itemId);
   const stone=character.bag.find(entry=>entry&&entry.id===stoneId&&entry.type==="enhancement_stone");
   if(!item)throw new Error("Предмет экипировки не найден");
   if(!stone)throw new Error("Камень отсутствует в рюкзаке");
   const installedSource=Array.isArray(item.installedGems)&&item.installedGems.length
    ?item.installedGems:(Array.isArray(item.sockets)?item.sockets:[]);
   const openSockets=Math.max(0,Number(item.socketsAvailable)||0);
   if(openSockets<=installedSource.length)throw new Error("Нет свободного гнезда. Сначала просверли гнездо долотом.");
   const stoneType=stone.stoneType||stone.stone_type;
   if(!stoneType||typeof stoneType!=="object")throw new Error("У камня повреждены данные");
   const classId=stoneType.class_id||stoneType.classId;
   const stoneBranch=stoneType.branch_id||stoneType.branchId;
   const branches=classTable[character.classId]?.branches||[];
   const activeBranch=typeof character.branch==="number"?branches[character.branch]?.id:(character.branch&&typeof character.branch==="object"?character.branch.id:character.branch);
   if(classId!==character.classId||String(stoneBranch||"")!==String(activeBranch||""))throw new Error("Камень не подходит к текущей специализации");
   const weapon=item.slot==="weapon"||item.slot===0;
   if(stoneType.slot==="weapon"&&!weapon)throw new Error("Этот камень предназначен только для оружия");
   if(stoneType.slot==="armor"&&weapon)throw new Error("Этот камень предназначен только для брони");
   const gem={stoneType:clone(stoneType),level:Math.max(1,Number(stone.level)||1),stoneId:stone.id};
   item.installedGems=installedSource.map(entry=>clone(entry));
   item.installedGems.push(gem);
   item.sockets=item.installedGems.map(entry=>clone(entry));
   character.bag=character.bag.filter(entry=>entry.id!==stoneId);
   return clone(item);
  }
  function socketStone(characterId,itemId,stoneId){return insertGem(characterId,itemId,stoneId);}
  function extractGem(characterId,itemId,gemIndex){
   const character=getChar(characterId),item=character.gear.find(entry=>entry&&entry.id===itemId)||character.bag.find(entry=>entry&&entry.id===itemId);
   if(!item)throw new Error("Equipment not found");
   item.installedGems=Array.isArray(item.installedGems)?item.installedGems:(Array.isArray(item.sockets)?item.sockets.map(entry=>clone(entry)):[]);
   if(!Number.isInteger(gemIndex)||gemIndex<0||gemIndex>=item.installedGems.length)throw new Error("Камень в этом гнезде не найден");
   const [gem]=item.installedGems.splice(gemIndex,1),stoneType=gem.stoneType||gem.stone_type;
   if(!stoneType)throw new Error("Невозможно извлечь камень: данные повреждены");
   item.sockets=item.installedGems.map(entry=>clone(entry));
   const returned={id:id(),type:"enhancement_stone",stoneType:clone(stoneType),level:Math.max(1,Number(gem.level)||1)};
   character.bag.push(returned);return clone(returned);
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
   if(success){item.refine++;character.stats.refine_success=(character.stats.refine_success||0)+1;}
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
   item.enchant=choices[choice];character.stats.enchants_applied=(character.stats.enchants_applied||0)+1;return clone(item);
  }
  function activateItem(characterId,itemId){
   const character=getChar(characterId),item=character.bag.find(entry=>entry.id===itemId);
   if(!item)throw new Error("Item not found in backpack");
   if(item.type==="healing_potion")throw new Error("Healing potions can only be used during combat");
   const key=item.itemId||item.type;
   bindItemOnUse(characterId,itemId);
   if(key==="pvp_talent_reset"){character.talents={};character.bag=character.bag.filter(entry=>entry.id!==itemId);return{activated:key,expiresAt:null};}
   const definition=balance.economy.consumables?.[key];
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
   character.stats.talents_spent=(character.stats.talents_spent||0)+1;
   return character.talents[talentId];
  }
  function ensurePvpDaily(){
   const date=dayKey(now());
   if(!state.account.pvpDaily||state.account.pvpDaily.date!==date)state.account.pvpDaily={date,duels:0,pending:null};
   return state.account.pvpDaily;
  }
  function matchmakePvp(characterId){
   if(!balance.pvp.enabled)throw new Error("PvP is disabled");
   const character=getChar(characterId),daily=ensurePvpDaily(),premium=state.account.premiumUntil>now();
   const limit=premium?balance.pvp.daily_duels.premium:balance.pvp.daily_duels.free;
   if(daily.duels>=limit)throw new Error("Daily PvP duel limit reached");
   const bp=combatPower(character),tier=tierForBp(bp),tierIndex=balance.bp.tiers.findIndex(item=>item.id===tier.id);
   const valid=state.account.ghosts.filter(ghost=>ghost.expiresAt>now()&&ghost.characterId!==character.id);
   let opponents=valid.filter(ghost=>Math.abs(balance.bp.tiers.findIndex(item=>item.id===ghost.tier)-tierIndex)<=balance.pvp.matchmaking.tier_window);
   let window=balance.pvp.matchmaking.tier_window;
   if(!opponents.length){window=balance.pvp.matchmaking.expand_to_tier_window;opponents=valid.filter(ghost=>Math.abs(balance.bp.tiers.findIndex(item=>item.id===ghost.tier)-tierIndex)<=window);}
   const opponent=opponents.length?clone(opponents[Math.floor(random()*opponents.length)]):{
    id:"bot-"+id(),bot:true,name:"Страж арены",classId:"bot",bp,level:character.level,tier:tier.id,
    stats:{...pvpRankStats(tier.id)}
   };
   daily.duels++;daily.pending={opponentId:opponent.id,opponent:clone(opponent),startedAt:now(),tier:tier.id};
   return{opponent,duelsRemaining:limit-daily.duels,points:state.account.pvpPoints||0,tier,bot:!!opponent.bot};
  }
  function resolvePvpDuel(characterId,won){
   const character=getChar(characterId),daily=ensurePvpDaily();
   if(!daily.pending)throw new Error("No PvP duel is active");
   character.stats.pvp_duels=(character.stats.pvp_duels||0)+1;
   const reward=won?balance.pvp.win_points:balance.pvp.loss_points;
   state.account.pvpPoints=(state.account.pvpPoints||0)+reward;
   if(won){character.stats.pvpWins=(character.stats.pvpWins||0)+1;character.stats.pvp_wins=(character.stats.pvp_wins||0)+1;}
   const result={won:!!won,pointsAwarded:reward,totalPoints:state.account.pvpPoints,opponentId:daily.pending.opponentId};
   daily.pending=null;return result;
  }
  function simulatePvpDuel(characterId){
   const character=getChar(characterId),daily=ensurePvpDaily(),pending=daily.pending;
   if(!pending?.opponent)throw new Error("No opponent snapshot is available");
   const tier=(balance.bp.tiers||[]).find(x=>x.id===pending.tier)||balance.bp.tiers[0];
   const comboScore=(classId,loadout)=>{const selected=loadout||[];return selected.length*5+(balance.combos.combos||[]).filter(combo=>combo.class===classId&&combo.chain.every(slot=>!!selected[Number(String(slot).replace("slot",""))-1])).reduce((sum,combo)=>sum+combo.chain.length*8,0);};
   const own=comboScore(character.classId,character.skillLoadout),enemy=comboScore(pending.opponent.classId,pending.opponent.skillLoadout);
   const ownStats=getCombatStats(character),enemyStats=pending.opponent.stats||pvpRankStats(tier?.id);
   const mitigation=defense=>1-Math.min(.75,Math.max(0,Number(defense)||0)/(Math.max(0,Number(defense)||0)+1000));
   const ownDamage=Math.max(1,ownStats.attack*(1+own/100)),enemyDamage=Math.max(1,(Number(enemyStats.attack)||1)*(1+enemy/100));
   const roundsToDefeatEnemy=Math.max(1,Math.ceil((Number(enemyStats.maxHp)||1)/(ownDamage*mitigation(enemyStats.defense))));
   const roundsToDefeatPlayer=Math.max(1,Math.ceil(ownStats.maxHp/(enemyDamage*mitigation(ownStats.defense))));
   const won=roundsToDefeatEnemy<roundsToDefeatPlayer||(roundsToDefeatEnemy===roundsToDefeatPlayer&&random()>=.5);
   const result=resolvePvpDuel(characterId,won);
   return{...result,rounds:Math.max(roundsToDefeatEnemy,roundsToDefeatPlayer),opponent:pending.opponent.name||"Соперник",normalized:!!enemyStats.normalized,tier:tier?.name||"Ранг",stats:{attack:enemyStats.attack,maxHp:enemyStats.maxHp,defense:enemyStats.defense},skillScore:own,opponentSkillScore:enemy};
  }
  function purchasePvpItem(characterId,itemId){
   const character=getChar(characterId),item=(balance.pvp_store.items||[]).find(entry=>entry.id===itemId);
   if(!item)throw new Error("Unknown PvP-store item");
   if(item.kind==="character_item"&&item.classId!==character.classId)throw new Error("This epic belongs to another class");
   if(item.kind==="cosmetic"&&(state.account.cosmetics||[]).includes(item.id))throw new Error("Cosmetic already owned");
   if(item.kind==="account_relic"&&(state.account.relics||[]).includes(item.id))throw new Error("Relic already owned");
   if(item.kind==="character_item"&&(state.account.classEpics||[]).includes(item.classId))throw new Error("This class epic has already been claimed");
   if((state.account.pvpPoints||0)<item.price)throw new Error("Not enough PvP points");
   state.account.pvpPoints-=item.price;
   if(item.kind==="cosmetic"){state.account.cosmetics.push(item.id);return{item:clone(item),account:true,points:state.account.pvpPoints};}
   if(item.kind==="account_relic"){state.account.relics=state.account.relics||[];state.account.relics.push(item.id);return{item:clone(item),account:true,points:state.account.pvpPoints};}
   if(item.kind==="character_item"){
    if(item.classId!==character.classId)throw new Error("This epic belongs to another class");
    const created=createDrop(character,item.rarity,{name:item.name,slot:"weapon",itemLevel:item.itemLevel,stats:{attack:Math.round(getCombatStats(character).attack*.15),defense:Math.round(getCombatStats(character).defense*.1),health:Math.round(maxHp(character)*.1)}});
    state.account.classEpics=state.account.classEpics||[];state.account.classEpics.push(character.classId);
    return{item:created,account:false,points:state.account.pvpPoints};
   }
   if(item.kind==="consumable"){
    character.bag.push({id:id(),type:item.consumableType||item.id,itemId:item.consumableId||item.id,quantity:1});
    return{item:clone(item),account:false,points:state.account.pvpPoints};
   }
   throw new Error("Unsupported PvP-store item type");
  }
  function stashDeposit(characterId,itemId){
   const character=getChar(characterId),item=character.bag.find(entry=>entry.id===itemId);
   const rank={Обычная:0,Редкая:1,Эпическая:2,Легендарная:3,Богоподобная:4};
   if(!item||rank[item.rarity]===undefined||rank[item.rarity]<rank[balance.stash.min_rarity])throw new Error("Only epic or better equipment can enter shared stash");
   if(item.bound)throw new Error("Bound items cannot be transferred");
   if(state.stash.length>=balance.stash.slots)throw new Error("Shared stash is full");
   character.bag=character.bag.filter(entry=>entry.id!==itemId);
   state.stash.push({...item,stashOwner:character.id,transfers:0});return clone(item);
  }
  function stashWithdraw(characterId,itemId){
   const character=getChar(characterId),index=state.stash.findIndex(entry=>entry.id===itemId);
   if(index<0)throw new Error("Stash item not found");
   const item=state.stash[index],date=dayKey(now());
   if(item.lastTransferDate===date)throw new Error("This item was already transferred today");
   if(character.bag.some(entry=>entry.id===item.id)||character.gear.some(entry=>entry?.id===item.id))throw new Error("Item already belongs to this character");
   state.stash.splice(index,1);character.bag.push({...item,bound:false,transfers:(item.transfers||0)+1,lastTransferDate:date});
   return clone(item);
  }
  function bindItemOnUse(characterId,itemId){
   const character=getChar(characterId),item=character.bag.find(entry=>entry.id===itemId)||character.gear.find(entry=>entry&&entry.id===itemId);
   if(!item)throw new Error("Item not found");
   if(item.stashOwner||item.transfers>0)item.bound=true;
   return clone(item);
  }
  function deleteCharacter(characterId,typedName,confirmed){
   const character=getChar(characterId);
   if(!confirmed||typedName!==character.name)throw new Error("Double confirmation and exact character name are required");
   state.characters=state.characters.filter(entry=>entry.id!==characterId);
   if(state.activeCharacterId===characterId)state.activeCharacterId=state.characters[0]?.id||null;
   return true;
  }
  function resetCharacter(characterId,typedName,confirmed){
   const old=getChar(characterId);
   if(!confirmed||typedName!==old.name)throw new Error("Double confirmation and exact character name are required");
   const name=old.name,classId=old.classId,difficulty=old.difficulty;
   const index=state.characters.findIndex(entry=>entry.id===characterId);
   state.characters.splice(index,1);
   const previousActive=state.activeCharacterId,created=createCharacter(name,classId),live=state.characters.find(entry=>entry.id===created.id);
   live.difficulty=difficulty;live.run.lives=difficultyOf(live).lives;
   state.account.starterPackClaimed=true;
   if(previousActive!==characterId)state.activeCharacterId=previousActive;
   return clone(live);
  }
  function tutorialStep(characterId,step){
   const character=getChar(characterId),tutorial=character.tutorial||(character.tutorial={completed:false,step:0,rewardClaimed:false});
   if(tutorial.completed)throw new Error("Tutorial is already complete");
   if(step==="skip"){tutorial.completed=true;tutorial.step=balance.tutorial.steps;return{completed:true,skipped:true};}
   const next=Math.min(balance.tutorial.steps,tutorial.step+1);
   if(step!==undefined&&Number(step)!==next)throw new Error("Complete tutorial steps in order");
   tutorial.step=next;
   if(next>=balance.tutorial.steps)tutorial.completed=true;
   return clone(tutorial);
  }
  function claimTutorialReward(characterId){
   const character=getChar(characterId),tutorial=character.tutorial;
   if(!tutorial?.completed||tutorial.rewardClaimed)throw new Error("Tutorial reward is unavailable");
   character.silver+=balance.tutorial.reward.silver;
   character.bag.push({id:id(),type:"healing_potion",quantity:balance.tutorial.reward.healing_potions});
   tutorial.rewardClaimed=true;return{silver:character.silver,reward:clone(balance.tutorial.reward)};
  }
  function claimAchievement(characterId,achievementId){
   const character=getChar(characterId),entry=balance.achievements.achievements.find(item=>item.id===achievementId);
   if(!entry)throw new Error("Unknown achievement");
   character.achievements=character.achievements||[];
   if(character.achievements.includes(achievementId))throw new Error("Achievement already claimed");
   const derived={highest_stage:character.progress.highestEver||0,lore_read:(character.loreRead||[]).length,paragon_level:character.paragon?.level||0,account_level:accountLevel(),season_clear:character.stats.season_clear||0};
   const progress=derived[entry.metric]??character.stats[entry.metric]??character.progress[entry.metric]??0;
   if(progress<entry.target)throw new Error("Achievement requirement not reached");
   character.achievements.push(achievementId);character.silver+=entry.reward.silver||0;
   for(const cosmetic of entry.reward.cosmetic||[])if(!state.account.cosmetics.includes(cosmetic))state.account.cosmetics.push(cosmetic);
   return clone(entry.reward);
  }
  function readLore(characterId,loreId){
   const character=getChar(characterId),entry=balance.lore.entries.find(item=>item.id===loreId);
   if(!entry)throw new Error("Unknown lore entry");
   if(character.progress.highestEver<entry.unlock_stage)throw new Error("Lore entry is still locked");
   character.loreRead=character.loreRead||[];
   if(character.loreRead.includes(loreId))return{xp:0,alreadyRead:true};
   character.loreRead.push(loreId);character.stats.lore_read=(character.stats.lore_read||0)+1;const reward=awardXp(character,entry.xp_reward||balance.lore.read_xp_reward);
   return{xp:reward.amount,level:character.level};
  }
  function logCombatEvent(characterId,event){
   const character=getChar(characterId),settings=state.account.settings||balance.settings;
   if(settings.combatLogEnabled===false||settings.combat_log_toggle===false)return false;
   character.combatLog=character.combatLog||[];
   character.combatLog.push({at:now(),event:String(event).slice(0,240)});
   character.combatLog=character.combatLog.slice(-balance.settings.combat_log_max_events);
   return true;
  }
  function saveSettings(values){
   state.account.settings={...(state.account.settings||{}),...values};return clone(state.account.settings);
  }
  function assignParagon(characterId,stat){
   const character=getChar(characterId),allowed=balance.paragon.stats;
   if(character.level<balance.xp_curve.max_level)throw new Error("Paragon unlocks at character level 100");
   if(!allowed.includes(stat))throw new Error("Unknown paragon stat");
   const spent=Object.values(character.paragon.stats||{}).reduce((a,b)=>a+b,0);
   if(spent>=character.paragon.level)throw new Error("No paragon points available");
   character.paragon.stats[stat]=(character.paragon.stats[stat]||0)+1;return clone(character.paragon);
  }
  function resetParagon(characterId){
   const character=getChar(characterId),cost=balance.paragon.reset_cost_silver;
   if(character.silver<cost)throw new Error("Not enough silver to reset paragon");
   character.silver-=cost;character.paragon.stats={};return clone(character.paragon);
  }
  function equipmentSlotIndex(item){
   if(Number.isInteger(item?.slot))return Math.max(0,Math.min(5,item.slot));
   return ({weapon:0,chest:1,head:2,legs:3,hands:4,accessory:5})[item?.slot]??-1;
  }
  function equipmentScore(item){
   const s=item?.stats||{};return (s.attack||0)+(s.defense||0)*1.5+(s.health||0)*.08+(s.crit||0)*100+(s.critDamage||0)*30+(s.spellPower||0)*1.1+(s.fireDamage||0)+(s.iceDamage||0)+(s.darkDamage||0)+((s.fireResist||0)+(s.iceResist||0)+(s.darkResist||0)+(s.physicalResist||0))*.5;
  }
  function equipItem(characterId,itemId){
   const character=getChar(characterId),item=character.bag.find(entry=>entry.id===itemId);
   if(!item||!item.stats||!item.rarity)throw new Error("Этот предмет нельзя надеть");
   const slot=equipmentSlotIndex(item);if(slot<0)throw new Error("Неизвестный слот экипировки");
   bindItemOnUse(characterId,itemId);const old=character.gear[slot];character.gear[slot]=item;character.bag=character.bag.filter(entry=>entry.id!==itemId);if(old)character.bag.push(old);
   if(character.run.playerHp>0)character.run.playerHp=Math.min(character.run.playerHp,maxHp(character));return clone(item);
  }
  function equipmentRarityScore(item){return({"Обычная":1,"Редкая":2,"Эпическая":3,"Легендарная":4,"Богоподобная":5}[item?.rarity]||0);}
  function equipBest(characterId){
   const character=getChar(characterId),isGear=item=>!!(item&&item.type==="equipment"&&item.stats&&item.rarity&&equipmentSlotIndex(item)>=0&&character.level>=10&&character.branch&&item.branch===character.branch);
   if(character.level<10||!character.branch)return{equipped:0,gear:clone(character.gear||[]),bag:character.bag.length,locked:true};
   const candidates=[...(character.gear||[]).filter(isGear),...(character.bag||[]).filter(isGear)],chosen=new Map();
   for(let slot=0;slot<6;slot++){const options=candidates.filter(item=>equipmentSlotIndex(item)===slot).sort((a,b)=>equipmentRarityScore(b)-equipmentRarityScore(a)||equipmentScore(b)-equipmentScore(a));if(options[0])chosen.set(slot,options[0]);}
   const selected=new Set([...chosen.values()].map(item=>item.id));character.gear=Array.from({length:6},(_,slot)=>chosen.get(slot)||null);
   character.bag=(character.bag||[]).filter(item=>!isGear(item)).concat(candidates.filter(item=>!selected.has(item.id)));
   if(character.run.playerHp>0)character.run.playerHp=Math.min(character.run.playerHp,maxHp(character));return{equipped:chosen.size,gear:clone(character.gear),bag:character.bag.length};
  }
  function salvageGrayItems(characterId){
   const character=getChar(characterId),gray=(character.bag||[]).filter(item=>item.stats&&item.rarity==="Обычная"&&!item.bossLoot),quantity=gray.reduce((sum,item)=>sum+(balance.materials.salvage[item.rarity]||0),0);
   if(!gray.length)return{count:0,materials:0};
   const ids=new Set(gray.map(item=>item.id));character.bag=character.bag.filter(item=>!ids.has(item.id));
   const stack=character.bag.find(item=>item.type==="craft_material");if(stack)stack.quantity=(stack.quantity||0)+quantity;else character.bag.push({id:id(),type:"craft_material",quantity});
   character.stats.items_salvaged=(character.stats.items_salvaged||0)+gray.length;recordWeeklyProgress(character,"items_salvaged",gray.length);return{count:gray.length,materials:quantity};
  }
  function salvageItem(characterId,itemId){
   const character=getChar(characterId),item=character.bag.find(entry=>entry.id===itemId);
   if(!item||!item.rarity)throw new Error("Only equipment can be salvaged");
   if(item.bossLoot)throw new Error("Boss loot cannot be salvaged");
   const quantity=balance.materials.salvage[item.rarity];
   if(!Number.isFinite(quantity))throw new Error("This rarity cannot be salvaged");
   character.bag=character.bag.filter(entry=>entry.id!==itemId);
   const stack=character.bag.find(entry=>entry.type==="craft_material");
   if(stack)stack.quantity=(stack.quantity||0)+quantity;else character.bag.push({id:id(),type:"craft_material",quantity});
   character.stats.items_salvaged=(character.stats.items_salvaged||0)+1;recordWeeklyProgress(character,"items_salvaged",1);
   return{quantity,rarity:item.rarity};
  }
  function leaderboard(){
   return state.characters.map(character=>({id:character.id,name:character.name,classId:character.classId,level:character.level,combatPower:combatPower(character),completionMs:character.stats.completionMs||0}))
    .sort((a,b)=>b.combatPower-a.combatPower||a.completionMs-b.completionMs);
  }
  function saveSnapshot(){return clone(state);}
  return{state,balance,accountLevel,dropEligibility,damageTypeMultiplier,bossPhaseInfo,resolveReaction,createCharacter,getChar:(idValue)=>clone(getChar(idValue)),requiredXp,levelForXp,maxHp,combatPower,getCombatStats,getRefinementGlow,recalcLevel,
   getSkillUnlocks,skillAvailable,stagePlan,beginStage,currentEnemy,selectTarget,sanitizeActiveStage,getEnemyStats,mitigationMultiplier,resistanceMultiplier,capBossDamage,basicAttackStats,restoreResource,applyVampirism,combatIntervalMs,finishEnemy,useHealingPotion,potionBeltSnapshot,assignPotionBelt,usePotionBelt,setDifficulty,checkpointHeal,
   speed2Allowed,setSpeed2,xpMultiplier,awardXp,deathPreview,confirmDeath,voluntaryRestart,autoBattle,
   rollLoot,mergeStones,craftStone,equipItem,equipBest,salvageGrayItems,salvageItem,addSocket,insertGem,socketStone,extractGem,refine,rollEnchantScroll,applyEnchant,purchase,transferSilver,bindItemOnUse,
   chooseBranch,resetTalents,useTalentPoint,leaderboard,saveSnapshot,activateItem,
   recordDailyProgress,dailySnapshot,claimDailyQuest,dailyChestSnapshot,claimDailyChest,startDailyBoss,completeDailyBoss,pvpSnapshot,
   ensurePvpDaily,matchmakePvp,resolvePvpDuel,simulatePvpDuel,purchasePvpItem,publishGhostSnapshot,submitWeeklyRating,weeklyLeaderboard,stashDeposit,stashWithdraw,deleteCharacter,resetCharacter,
   tutorialStep,claimTutorialReward,claimAchievement,readLore,logCombatEvent,saveSettings,assignParagon,resetParagon,
   setRunModifier,runModifierOptions,reviveFromDeath,weeklySnapshot,recordWeeklyProgress:(characterId,metric,amount)=>recordWeeklyProgress(getChar(characterId),metric,amount),claimWeeklyQuest,buyCosmeticChest,equipCosmetic,chapterForStage};
 }
 return{createEngine};
});
if(typeof window!=="undefined"){
 window.TowerboundReworkReady=(async()=>{
  const names=["combat","xp_curve","map","elite_mechanics","death","healing","auto_battle","drop_tables","equipment","economy","heroic","pvp","classes","skill_effects","mobs","bosses","character_curves","item_level","bp","difficulty","materials","account","stash","tutorial","achievements","lore","settings","seasons","paragon","pvp_store","resources","skills","combos","procs","run_modifiers","heroic_mobs","chapters","weekly_quests","cosmetics","skill_combos"];
  const loaded=await Promise.all(names.map(async name=>{
   const response=await fetch("./configs/balance/"+name+".json?v=10");
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
// 2000h release gate: keep legacy-before-2000h-fixes immutable; gameplay changes stay on feature/2000h-fixes.
