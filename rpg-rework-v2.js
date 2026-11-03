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
  state.account=state.account||{diamonds:0,premiumUntil:0,unlocks:[],cosmetics:[]};
  state.bank=state.bank||{silver:0,transfers:{}};
  state.characters=state.characters||[];
  const classTable=balance.classes.classes;
  const getChar=id=>{
   const character=state.characters.find(item=>item.id===(id||state.activeCharacterId));
   if(!character)throw new Error("Character not found");
   return character;
  };
  const id=()=>"tb-"+now().toString(36)+"-"+Math.floor(random()*1000000000).toString(36);
  function requiredXp(level){
   const curve=balance.xp_curve;
   return Math.max(1,Math.round((curve.base_required+curve.per_level*Math.pow(level,curve.exponent))*curve.base_multiplier));
  }
  function levelForXp(total){
   let level=1,remaining=Math.max(0,Number(total)||0);
   while(level<balance.xp_curve.max_level&&remaining>=requiredXp(level)){remaining-=requiredXp(level);level++;}
   return level;
  }
  function maxHp(character){
   const stats=balance.classes.base_stats;
   const gear=(character.gear||[]).reduce((sum,item)=>sum+(item&&item.stats?item.stats.health||0:0),0);
   return Math.round(stats.base_health+Math.max(0,character.level-1)*stats.health_per_level+gear);
  }
  function combatPower(character){
   const stats=balance.classes.base_stats;
   const totals=(character.gear||[]).reduce((acc,item)=>{
    if(item&&item.stats)for(const key of Object.keys(item.stats))acc[key]=(acc[key]||0)+item.stats[key];
    return acc;
   },{});
   return Math.round((stats.base_attack+(character.level-1)*stats.attack_per_level+(totals.attack||0))*3+
    (stats.base_defense+(character.level-1)*stats.defense_per_level+(totals.defense||0))*2+maxHp(character)*0.3+character.level*5);
  }
  function recalcLevel(character){
   const previous=character.level;
   character.level=levelForXp(character.xp);
   character.talentPoints=Math.max(0,character.level-1);
   if(character.level<10)character.branch=null;
   return{previous,level:character.level,lost:Math.max(0,previous-character.level)};
  }
  function createCharacter(name,classId){
   const classData=classTable[classId];
   if(!classData)throw new Error("Unknown character class");
   const nickname=String(name||"").trim();
   if(nickname.length<2||nickname.length>18)throw new Error("Character name must be between 2 and 18 characters");
   if(state.characters.some(item=>item.name.toLowerCase()===nickname.toLowerCase()))throw new Error("Character name already exists");
   const character={
    id:id(),name:nickname,classId,level:1,xp:0,talentPoints:0,branch:null,talents:{},unlockedSkills:[],resource:0,resourceMax:classTable[classId].resource_max||100,
    silver:balance.economy.starting_silver,bag:[{id:id(),type:"healing_potion",quantity:balance.healing.starting_potions}],
    gear:[null,null,null,null,null,null],heroic:false,
    progress:{highestEver:0,currentStage:1,checkpoints:[]},
    run:{active:false,id:null,experience:0,foundItemIds:[],stage:null,playerHp:balance.classes.base_stats.base_health,
     checkpointHeals:0,healingPenaltyUntil:0,speed2:false,buffs:{}},
    pity:{legendaryMisses:0,godlikeMisses:0},stats:{kills:0,elapsedMs:0,completionMs:0}
   };
   character.run.playerHp=maxHp(character);
   state.characters.push(character);
   state.activeCharacterId=character.id;
   state.account.premiumUntil=Math.max(state.account.premiumUntil||0,now()+balance.economy.starting_premium_hours*3600000);
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
   const map=balance.map;
   const boss=stage%map.boss_every===0;
   const count=boss?map.boss_mob_count:(stage%map.seven_mob_every===0?7:(stage%map.five_mob_every===0?5:map.normal_mob_count));
   const eliteIndex=!boss&&random()<map.elite_chance?Math.floor(random()*count):-1;
   return{stage,boss,count,mobs:Array.from({length:count},(_,index)=>({
    index,type:boss?"boss":index===eliteIndex?"elite":"normal",
    mechanic:index===eliteIndex?map.elite_mechanics[Math.floor(random()*map.elite_mechanics.length)]:null,
    statMultiplier:character.heroic?balance.map.heroic_stat_multiplier:1
   }))};
  }
  function beginRun(character){
   if(character.run.active)return;
   character.run={...character.run,active:true,id:id(),experience:0,foundItemIds:[],stage:null,
    checkpointHeals:0,healingPenaltyUntil:0,speed2:false,playerHp:maxHp(character),startedAt:now()};
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
   let multiplier=flags.auto?balance.auto_battle.experience_multiplier:
    (firstClear?balance.xp_curve.first_clear_multiplier:balance.xp_curve.replay_multiplier);
   if(flags.speed2){
    if(firstClear)throw new Error("2x speed is disabled on first clears");
    multiplier*=balance.combat.speed_2x_experience_multiplier;
   }
   if(character.run.healingPenaltyUntil>=stage)multiplier*=balance.xp_curve.healing_penalty_multiplier;
   return multiplier;
  }
  function awardXp(character,amount){
   const value=Math.max(0,Math.round(amount));
   const before=character.level;
   character.xp+=value;
   character.run.experience+=value;
   recalcLevel(character);
   return{amount:value,total:character.xp,level:character.level,levelUp:character.level>before};
  }
  function enemyXp(enemy,stage){
   const table=balance.xp_curve.mob_xp;
   if(enemy.type==="boss")return table.boss_base+stage*table.boss_per_stage;
   if(enemy.type==="elite")return table.elite_base+stage*table.elite_per_stage;
   return table.normal_base+stage*table.normal_per_stage;
  }
  function createDrop(character,rarity,options){
   options=options||{};
   const item={id:id(),name:options.name||rarity+" трофей",rarity,slot:options.slot||"accessory",
    stats:{attack:character.level,defense:Math.round(character.level/2),health:character.level*2},
    refine:0,sockets:[],socketsAvailable:0,enchant:null,bossLoot:!!options.bossLoot,foundRunId:character.run.id};
   character.bag.push(item);
   character.run.foundItemIds.push(item.id);
   return item;
  }
  function rollLoot(character,enemy,stage,firstClear,automatic){
   if(automatic)return[];
   const drops=balance.drop_tables,items=[];
   if(enemy.type==="boss"){
    if(firstClear&&drops.guaranteed_epic_first_clear_boss)items.push(createDrop(character,"Эпическая",{bossLoot:true,name:"Трофей первого покорения"}));
    if(character.heroic){
     const guaranteed=character.pity.godlikeMisses>=drops.boss_pity_misses;
     if(guaranteed||random()<drops.heroic_godlike_chance){items.push(createDrop(character,"Богоподобная",{bossLoot:true}));character.pity.godlikeMisses=0;}
     else character.pity.godlikeMisses++;
    }else{
     const guaranteed=character.pity.legendaryMisses>=drops.boss_pity_misses;
     if(guaranteed||random()<drops.boss_legendary_chance){items.push(createDrop(character,"Легендарная",{bossLoot:true}));character.pity.legendaryMisses=0;}
     else character.pity.legendaryMisses++;
    }
   }else if(enemy.type==="elite"){
    if(random()<drops.elite_epic_chance)items.push(createDrop(character,"Эпическая"));
   }else if(stage<=30&&random()<drops.normal_item_chance){
    items.push(createDrop(character,random()<drops.normal_rare_weight?"Редкая":"Обычная"));
   }
   return items;
  }
  function finishEnemy(characterId,flags){
   flags=flags||{};
   const character=getChar(characterId),stageData=character.run.stage,enemy=currentEnemy(character),stage=stageData.stage;
   const firstClear=stage>character.progress.highestEver;
   const multiplier=xpMultiplier(character,stage,{speed2:!!flags.speed2});
   const base=enemyXp(enemy,stage);
   const gained=awardXp(character,base*multiplier);
   const loot=rollLoot(character,enemy,stage,firstClear,false);
   const materials=[];
   if(random()<balance.equipment.chisel_drop_chance){const material={id:id(),type:"chisel",quantity:1,foundRunId:character.run.id};character.bag.push(material);character.run.foundItemIds.push(material.id);materials.push(material);}
   if(stage>=balance.equipment.stone_unlock_stage&&character.branch&&random()<balance.equipment.stone_drop_chance){
    const stoneType={classId:character.classId,branchId:character.branch,slot:random()<0.5?"weapon":"armor"};
    const material={id:id(),type:"enhancement_stone",stoneType,level:1,foundRunId:character.run.id};character.bag.push(material);character.run.foundItemIds.push(material.id);materials.push(material);
   }
   if(stage>=balance.equipment.refine_unlock_stage&&random()<balance.equipment.refine_stone_drop_chance){
    const material={id:id(),type:"refine_stone",quantity:1,foundRunId:character.run.id};character.bag.push(material);character.run.foundItemIds.push(material.id);materials.push(material);
   }
   if(character.heroic&&random()<balance.equipment.enchantment.armor_scroll_chance){
    const material={id:id(),type:"enchant_scroll",slot:"armor",foundRunId:character.run.id};character.bag.push(material);character.run.foundItemIds.push(material.id);materials.push(material);
   }
   if(character.heroic&&random()<balance.equipment.enchantment.weapon_scroll_chance){
    const material={id:id(),type:"enchant_scroll",slot:"weapon",foundRunId:character.run.id};character.bag.push(material);character.run.foundItemIds.push(material.id);materials.push(material);
   }
   character.stats.kills++;
   character.silver+=balance.economy.silver_drop[enemy.type]||0;
   stageData.enemyIndex++;
   const done=stageData.enemyIndex>=stageData.mobs.length;
   if(!done)stageData.potionSlotUsed=false;
   if(done){
    const clear=balance.xp_curve.stage_clear_xp;
    const bonus=(clear.base+stage*clear.per_stage+(enemy.type==="boss"?clear.boss_bonus:0))*multiplier;
    awardXp(character,bonus);
    character.progress.highestEver=Math.max(character.progress.highestEver,stage);
    if(balance.map.checkpoints.includes(stage)&&!character.progress.checkpoints.includes(stage))character.progress.checkpoints.push(stage);
    if(stage>character.progress.currentStage-1)character.progress.currentStage=stage+1;
    character.run.stage=null;
    character.run.playerHp=maxHp(character);
    if(stage>=balance.heroic.unlock_after_stage&&!character.heroic){
     character.heroic=true;
     character.progress.currentStage=1;
     character.progress.highestEver=balance.map.total_stages;
    }
    if(stage>=balance.map.total_stages&&character.heroic)character.run.active=false;
   }
   return{xp:gained.amount,loot:clone(loot.concat(materials)),stageComplete:done,progress:clone(character.progress),playerHp:character.run.playerHp};
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
   return{experienceLoss:loss,levelsLost:Math.max(0,character.level-levelAfter),itemLossChance:balance.death.inventory_item_loss_chance,eligibleItems:eligible.length,projectedLevel:levelAfter};
  }
  function confirmDeath(characterId){
   const character=getChar(characterId),preview=deathPreview(characterId);
   character.xp=Math.max(0,character.xp-preview.experienceLoss);
   recalcLevel(character);
   const eligible=character.bag.filter(item=>character.run.foundItemIds.includes(item.id)&&!item.bossLoot);
   let lost=null;
   if(eligible.length&&random()<balance.death.inventory_item_loss_chance){
    lost=eligible[Math.floor(random()*eligible.length)];
    character.bag=character.bag.filter(item=>item.id!==lost.id);
   }
   character.lastDeath={...preview,lostItem:lost?lost.name:null};
   character.run.active=false;character.run.stage=null;character.run.experience=0;character.run.foundItemIds=[];
   character.run.healingPenaltyUntil=0;character.run.checkpointHeals=0;character.run.speed2=false;
   character.progress.currentStage=balance.death.new_run_stage;
   character.run.playerHp=maxHp(character);
   return clone(character.lastDeath);
  }
  function voluntaryRestart(characterId){
   const character=getChar(characterId);
   if(character.run.stage)throw new Error("Restart is only available between stages");
   character.run.active=false;character.run.experience=0;character.run.foundItemIds=[];
   character.run.healingPenaltyUntil=0;character.run.checkpointHeals=0;character.run.speed2=false;
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
    let stageXp=0;
    for(const enemy of plan.mobs)stageXp+=enemyXp(enemy,stage)*xpMultiplier(character,stage,{auto:true});
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
   const stones=character.bag.filter(item=>item.type==="enhancement_stone"&&item.level===level&&item.stoneType===stoneType);
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
   if(item.sockets.length>=(item.socketsAvailable||0))throw new Error("Use a chisel to add an equipment socket first");
   if(stone.stoneType.classId!==character.classId||stone.stoneType.branchId!==character.branch)throw new Error("Stone does not match the active specialization");
   item.sockets.push({stoneType:stone.stoneType,level:stone.level});
   character.bag=character.bag.filter(entry=>entry.id!==stoneId);
   return clone(item);
  }
  function refine(characterId,itemId,settings){
   settings=settings||{};
   const character=getChar(characterId),item=character.gear.find(entry=>entry&&entry.id===itemId)||character.bag.find(entry=>entry&&entry.id===itemId);
   if(!item)throw new Error("Equipment not found");
   const refineStone=character.bag.find(entry=>entry.type==="refine_stone");
   if(!refineStone)throw new Error("No refinement stone available");
   if(item.refine>=balance.equipment.refine_max)throw new Error("Maximum refinement reached");
   const tier=balance.equipment.refine_tiers.find(entry=>item.refine>=entry.from&&item.refine<=entry.to);
   if(!tier)throw new Error("No refinement tier configured");
   character.bag=character.bag.filter(entry=>entry.id!==refineStone.id);
   const safe=!!settings.safe||character.bag.some(entry=>entry.type==="safe_refine");
   const chance=clamp(tier.chance+(settings.chanceBonus||0),0,1);
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
   if(safe)character.bag=character.bag.filter(entry=>entry.type!=="safe_refine");
   return{success,destroyed:tier.failure==="destroy"&&!success&&!safe,refine:item.refine};
  }
  function rollEnchantScroll(characterId,itemId){
   const character=getChar(characterId),item=character.gear.find(entry=>entry&&entry.id===itemId)||character.bag.find(entry=>entry&&entry.id===itemId);
   if(!character.heroic)throw new Error("Enchantment is only available in heroic mode");
   if(!item)throw new Error("Equipment not found");
   const weapon=item.slot==="weapon"||item.slot===0;
   const chance=weapon?balance.equipment.enchantment.weapon_scroll_chance:balance.equipment.enchantment.armor_scroll_chance;
   if(random()>=chance)throw new Error("No enchantment scroll dropped");
   return weapon?["+15% магической атаки","+15% физической атаки","+15% скорости атаки","+15% шанса крита"]:
    ["+5% магического урона","+5% физического урона","+5% магической защиты","+5% физической защиты"];
  }
  function applyEnchant(characterId,itemId,choice,choices){
   const character=getChar(characterId),item=character.gear.find(entry=>entry&&entry.id===itemId)||character.bag.find(entry=>entry&&entry.id===itemId);
   if(!character.heroic)throw new Error("Enchantment is only available in heroic mode");
   if(!item||!Array.isArray(choices)||choices.length!==4||!Number.isInteger(choice)||choice<0||choice>=choices.length)throw new Error("Invalid enchantment choice");
   item.enchant=choices[choice];return clone(item);
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
  return{state,balance,createCharacter,getChar:(idValue)=>clone(getChar(idValue)),requiredXp,levelForXp,maxHp,combatPower,recalcLevel,
   getSkillUnlocks,skillAvailable,stagePlan,beginStage,currentEnemy,finishEnemy,useHealingPotion,checkpointHeal,
   speed2Allowed,setSpeed2,xpMultiplier,awardXp,deathPreview,confirmDeath,voluntaryRestart,autoBattle,
   rollLoot,mergeStones,addSocket,socketStone,refine,rollEnchantScroll,applyEnchant,purchase,transferSilver,
   chooseBranch,resetTalents,useTalentPoint,leaderboard,saveSnapshot};
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
  const persisted=(()=>{try{return JSON.parse(localStorage.getItem("tb-rpg-v2")||"null");}catch(error){return null;}})();
  const engine=window.TowerboundReworkCore.createEngine(balance,{state:persisted||undefined});
  window.TowerboundRework=engine;
  window.saveTowerboundRework=()=>localStorage.setItem("tb-rpg-v2",JSON.stringify(engine.state));
  return engine;
 })().catch(error=>{console.error("[Towerbound rework v2] config load failed",error);return null;});
}