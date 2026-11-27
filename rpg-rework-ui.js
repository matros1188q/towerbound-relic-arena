(function(){
 "use strict";
 const root=document.getElementById("tbRpg");
 if(!root)return;
 let towerMapOpen=false;
 let towerMapScrollTop=0;
 let towerMapPageLock=null;
 function lockTowerMapPage(){
  if(towerMapPageLock)return;
  const body=document.body,html=document.documentElement,y=window.scrollY||window.pageYOffset||0;
  towerMapPageLock={y,position:body.style.position,top:body.style.top,left:body.style.left,right:body.style.right,width:body.style.width,height:body.style.height,overflow:html.style.overflow};
  body.classList.add("tb-tower-map-lock");html.classList.add("tb-tower-map-lock");
  body.style.position="fixed";body.style.top="-"+y+"px";body.style.left="0";body.style.right="0";body.style.width="100%";body.style.height="100dvh";html.style.overflow="hidden";
 }
 function unlockTowerMapPage(){
  if(!towerMapPageLock)return;
  const saved=towerMapPageLock,body=document.body,html=document.documentElement;towerMapPageLock=null;
  body.classList.remove("tb-tower-map-lock");html.classList.remove("tb-tower-map-lock");
  body.style.position=saved.position;body.style.top=saved.top;body.style.left=saved.left;body.style.right=saved.right;body.style.width=saved.width;body.style.height=saved.height;html.style.overflow=saved.overflow;
  window.scrollTo(0,saved.y);
 }
 document.addEventListener("touchmove",function(event){if(towerMapOpen)event.preventDefault();},{capture:true,passive:false});
 document.addEventListener("wheel",function(event){if(towerMapOpen)event.preventDefault();},{capture:true,passive:false});
 document.addEventListener("gesturestart",function(event){if(towerMapOpen)event.preventDefault();},{capture:true,passive:false});
 const nativeRandom=Math.random.bind(Math);
 function gameRandom(){const c=live();if(!c?.run?.dailyChallengeActive)return nativeRandom();let x=(Number(c.run.dailyChallengeSeedState)||Number(c.run.dailyChallengeSeed)||1)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;c.run.dailyChallengeSeedState=x>>>0;return (x>>>0)/4294967296;}
 window.TowerboundDailyRandom=gameRandom;
 /* Runtime style injection removed: styles are loaded once from styles.css. */
 const CHARACTER_ART_ROOT="./assets/characters/";
 const classPortraits={assassin:"heroes/image-Photoroom.png",bishop:"heroes/image_2-Photoroom(1).png",dragonkin:"heroes/image_3-Photoroom.png",destroyer:"heroes/image_4-Photoroom.png",elemental:"heroes/image_5-Photoroom.png",shaman:"heroes/image_6-Photoroom.png",duelist:"heroes/image_7-Photoroom.png"};
 const mobPortraits={"swamp-reaper":"enemies/image_2.png","cursed-knight":"enemies/image_3.png","shadow-goblin":"enemies/image_4.png","phantom-duelist":"enemies/image_5.png","abyss-knight":"enemies/image_6.png","ash-wolf":"enemies/image_7.png","rune-golem":"enemies/image_8.png","crimson-executioner":"enemies/image_9.png","plague-witch":"enemies/image_10.png","ash-imp":"enemies/image_11.png","forest-horror":"enemies/image_12.png","bone-warden":"enemies/image_13.png","spider-matron":"enemies/image_14.png","soul-harvester":"enemies/image_15.png","void-hunter":"enemies/image_16.png","blind-monk":"enemies/image_17.png","stone-minotaur":"enemies/image_18.png","cursed-alchemist":"enemies/image_20.png","root-colossus":"enemies/image.png","grave-archer":"enemies/grave-archer.png"};
 const rolePortraits={healer:"enemies/image_17.png",poison:"enemies/image_10.png",tank:"enemies/image_8.png",normal:"enemies/image_4.png"};
 const bossPortraitsById={"abyss-queen":"bosses/abyss-queen.png","ash-patriarch":"bosses/image_3.png","bone-colossus":"bosses/bone-colossus.png","heart-of-tower":"bosses/image_12.png","ice-abbot":"bosses/image_4.png","mirror-executioner":"bosses/mirror-executioner.png","root-titan":"bosses/root-titan.png","soul-devourer":"bosses/soul-devourer.png","void-hunter-boss":"bosses/void-hunter-boss.png","crimson-regent":"bosses/image_11.png"};
 const bossPortraits=Object.values(bossPortraitsById);
 const chapterBackgrounds=["image_2.jpeg","image_3.jpeg","image_4.jpeg","image_5.jpeg","image.jpeg"];
 function chapterBackgroundPath(stage){const floor=Math.max(1,Math.min(250,Number(stage)||1));return "./assets/chapters/"+chapterBackgrounds[Math.floor((floor-1)/50)];}

 const CUSTOM_ITEM_ART_ROOT="./assets/Castoms/";
 const CUSTOM_ITEM_ART=Object.freeze({
  xp:"image.jpeg",heal:"image%202.jpeg",drop:"image%203.jpeg",antidote:"image%204.jpeg",
  compass:"image%205.jpeg",talisman:"image%207.jpeg",
  coin:"image%2013.jpeg",dagger:"image%2014.jpeg",shield:"image%2015.jpeg",skull:"image%2016.jpeg",
  eye:"image%2017.jpeg",feather:"image%2018.jpeg",ring:"image%2019.jpeg",crown:"image%2020.jpeg",
  cup:"image%2021.jpeg",hammer:"image%2022.jpeg"
 });
 const ITEM_ART_BY_ID=Object.freeze({
  xp_10:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.xp,xp_20:"./assets/relics/oracle.png",xp_50:"./assets/relics/starfall.png",xp_100:"./assets/relics/echo.png",
  heal_10:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.heal,heal_25:"./assets/relics/heart.png",heal_35:"./assets/relics/phoenix.png",heal_50:"./assets/relics/laststand.png",healing_potion:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.heal,
  drop_20:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.drop,drop_50:"./assets/relics/luckycoin.png",drop_75:"./assets/relics/moon.png",drop_100:"./assets/relics/meteor.png",
  pity_token:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.eye,pity:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.eye,
  antidote:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.antidote,map_compass:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.compass,map_hint:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.compass,
  silver_charm:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.talisman,silver_bonus:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.talisman,xp_hourglass:"./assets/relics/hourglass.png",
  repair_kit:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.hammer,potion_case:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.cup,potion_capacity:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.cup,
  rescue_seal:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.skull,one_rescue:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.skull,stone_cache:"./assets/relics/rune.png",
  extra_socket:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.ring,socket:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.ring,refine_guard:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.shield,
  refine_10:"./assets/relics/riftsigil.png",refine_20:"./assets/relics/stormglass.png",safe_refine:"./assets/relics/guardian.png",
  craft_material:"./assets/relics/image_6.png",enhancement_stone:"./assets/relics/image_7.png",refine_stone:"./assets/relics/image_8.png",enchant_scroll:"./assets/relics/image_9.png"
 });
 function customItemArtPath(item){
  const ids=[item?.itemId,item?.id,item?.type,item?.effect,item?.kind].filter(Boolean).map(value=>String(value).toLowerCase());
  for(const key of ids){if(ITEM_ART_BY_ID[key])return ITEM_ART_BY_ID[key];}
  const id=String(item?.itemId||item?.id||item?.type||"").toLowerCase();
  const value=[item?.type,item?.itemId,item?.id,item?.name,item?.effect,item?.kind].filter(Boolean).join(" ").toLowerCase().replace(/[_-]/g," ");
  if(id.startsWith("premium")||value.includes("премиум")||value.includes("premium account"))return "";
  if(value.includes("hourglass")||value.includes("песоч"))return "./assets/relics/hourglass.png";
  if(value.includes("potion case")||value.includes("healer kit")||value.includes("футляр целителя")||value.includes("набор целителя"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.cup;
  if(value.includes("antidote")||value.includes("противояд"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.antidote;
  if(value.includes("compass")||value.includes("компас"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.compass;
  if(value.includes("talisman")||value.includes("charm")||value.includes("талисман"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.talisman;
  if(value.includes("rescue")||value.includes("спасен")||value.includes("печать спасения"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.skull;
  if(value.includes("extra socket")||value.includes("гнезд")||value.includes("socket"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.ring;
  if(value.includes("pity")||value.includes("удач")||value.includes("fortune")||value.includes("luck"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.drop;
  if(value.includes("refine guard")||value.includes("защитный оберег"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.shield;
  if(value.includes("repair")||value.includes("ремонт")||value.includes("refine")||value.includes("заточ")||value.includes("усилен")||value.includes("камень усиления")||value.includes("craft material"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.hammer;
  if(value.includes("stone cache")||value.includes("сундук камней"))return "./assets/relics/rune.png";
  if(value.includes("drop")||value.includes("зелье шанса")||value.includes("шанс дропа"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.drop;
  if(value.includes("xp")||value.includes("experience")||value.includes("опыт")||value.includes("зелье опыта"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.xp;
  if(value.includes("heal")||value.includes("healing potion")||value.includes("potion")||value.includes("зель")||value.includes("исцел"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.heal;
  if(value.includes("coin")||value.includes("монет")||value.includes("серебр"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.coin;
  if(value.includes("dagger")||value.includes("кинжал"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.dagger;
  if(value.includes("shield")||value.includes("щит"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.shield;
  if(value.includes("skull")||value.includes("череп"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.skull;
  if(value.includes("eye")||value.includes("глаз"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.eye;
  if(value.includes("feather")||value.includes("перо"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.feather;
  if(value.includes("ring")||value.includes("кольц"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.ring;
  if(value.includes("crown")||value.includes("корон"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.crown;
  if(value.includes("cup")||value.includes("chalice")||value.includes("чаш"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.cup;
  if(value.includes("hammer")||value.includes("молот"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.hammer;
  return "";
 }
 const RELIC_ART_BY_ID=Object.freeze({
  bloodstone:"./assets/relics/rune.png",steel_heart:"./assets/relics/heart.png",greed:CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.coin,
  assassin_blade:"./assets/relics/fang.png",scholar_lens:"./assets/relics/oracle.png",phoenix_feather:"./assets/relics/phoenix.png",
  frost_sigil:"./assets/relics/frost.png",war_drums:"./assets/relics/spark.png",mirror_shard:"./assets/relics/mirror.png",
  arcane_prism:"./assets/relics/stormglass.png",hunter_mark:"./assets/relics/quiver.png",lucky_coin:"./assets/relics/luckycoin.png"
 });
 function customRelicArtPath(item){
  const id=String(item?.id||"").toLowerCase();
  if(RELIC_ART_BY_ID[id])return RELIC_ART_BY_ID[id];
  const value=[item?.id,item?.name,item?.type,item?.slot].filter(Boolean).join(" ").toLowerCase().replace(/[_-]/g," ");
  if(value.includes("heart")||value.includes("сердц"))return "./assets/relics/heart.png";
  if(value.includes("stone")||value.includes("камень")||value.includes("rune")||value.includes("руна"))return "./assets/relics/rune.png";
  if(value.includes("coin")||value.includes("монет"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.coin;
  if(value.includes("dagger")||value.includes("кинжал"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.dagger;
  if(value.includes("shield")||value.includes("щит"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.shield;
  if(value.includes("skull")||value.includes("череп"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.skull;
  if(value.includes("eye")||value.includes("глаз"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.eye;
  if(value.includes("feather")||value.includes("перо"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.feather;
  if(value.includes("ring")||value.includes("кольц"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.ring;
  if(value.includes("crown")||value.includes("корон"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.crown;
  if(value.includes("cup")||value.includes("chalice")||value.includes("чаш"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.cup;
  if(value.includes("hammer")||value.includes("молот"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.hammer;
  if(value.includes("compass")||value.includes("компас"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.compass;
  if(value.includes("talisman")||value.includes("amulet")||value.includes("талисман")||value.includes("амул"))return CUSTOM_ITEM_ART_ROOT+CUSTOM_ITEM_ART.talisman;
  return "";
 }
 function itemArtVariantLabel(item){
  const keys=[item?.itemId,item?.type,item?.effect,item?.kind,item?.id].filter(Boolean).map(value=>String(value).toLowerCase());
  const key=keys.find(value=>/^(?:xp|heal|drop)_\d+$/.test(value)||/^refine_(?:10|20)$/.test(value)||value==="safe_refine");
  if(!key)return "";
  if(key==="safe_refine")return "SAFE";
  const match=key.match(/^(?:xp|heal|drop)_(\d+)$/);
  if(match)return match[1]+"%";
  return key==="refine_10"?"+10%":"+20%";
 }
 function customItemImageHtml(path,classes,item){
  const badge=itemArtVariantLabel(item);
  return '<div class="tb-item-art-wrap"><img class="tb-custom-item-art '+(classes||'')+'" src="'+path+'" alt="" loading="lazy" decoding="async">'+(badge?'<span class="tb-item-art-badge">'+badge+'</span>':'')+'</div>';
 }

 const relicArtFiles={head:"image_2.png",chest:"image_3.png",ring:"image_4.png",accessory:"image_4.png",amulet:"image_12.png",weapon:"image_10.png",hands:"image_12.png",potion:"image_5.png",scroll:"image_9.png",redGem:"image_7.png",blueGem:"image_8.png",potionStack:"image_5.png",bundle:"rune.png"};
 function relicArtPath(item,slot){
  const parts=[item?.type,item?.id,item?.name,item?.slot,slot,item?.category,item?.kind].filter(Boolean).join(" ").toLowerCase().replace(/[_-]/g," ");
  if(parts.includes("craft material")||parts.includes("material")||parts.includes("материал")||parts.includes("craft"))return "image_15.png";
  if(parts.includes("bundle")||parts.includes("cache")||parts.includes("набор")||parts.includes("сундук"))return relicArtFiles.bundle;
  if(parts.includes("amulet")||parts.includes("neck")||parts.includes("амул"))return relicArtFiles.amulet;
  if(parts.includes("ring")||parts.includes("accessory")||parts.includes("кольц"))return relicArtFiles.ring;
  if(parts.includes("head")||parts.includes("helmet")||parts.includes("helm")||parts.includes("шлем")||slot==="head")return relicArtFiles.head;
  if(parts.includes("chest")||parts.includes("armor")||parts.includes("breast")||parts.includes("нагруд")||slot==="chest"||slot==="legs")return relicArtFiles.chest;
  if(parts.includes("hand")||parts.includes("glove")||parts.includes("перчат")||slot==="hands")return relicArtFiles.hands;
  if(parts.includes("weapon")||parts.includes("sword")||parts.includes("меч")||parts.includes("оруж")||slot==="weapon")return relicArtFiles.weapon;
  if(parts.includes("scroll")||parts.includes("enchant")||parts.includes("свит"))return relicArtFiles.scroll;
  if((parts.includes("red")&&parts.includes("gem"))||(parts.includes("красн")&&parts.includes("кам")))return relicArtFiles.redGem;
  if((parts.includes("blue")&&parts.includes("gem"))||(parts.includes("син")&&parts.includes("кам")))return relicArtFiles.blueGem;
  if(parts.includes("potion")||parts.includes("heal")||parts.includes("зель"))return parts.includes("stack")||parts.includes("стоп")?relicArtFiles.potionStack:relicArtFiles.potion;
  if(slot==="accessory")return relicArtFiles.accessory;
  return relicArtFiles.potionStack;
 }
 function relicIconHtml(item,slot,extraClass){const custom=customRelicArtPath(item);if(custom)return '<img class="tb-relic-icon tb-custom-item-art '+(extraClass||"")+'" src="'+custom+'" alt="" loading="lazy" decoding="async">';const parts=[item?.type,item?.id,item?.name,item?.slot,slot,item?.category,item?.kind].filter(Boolean).join(" ").toLowerCase().replace(/[_-]/g," ");let crop="";if(slot==="hands"||parts.includes("glove")||parts.includes("перчат"))crop="tb-relic-glove";else if(slot==="amulet"||parts.includes("amulet")||parts.includes("амул"))crop="tb-relic-amulet";else if(parts.includes("bundle")||parts.includes("cache")||parts.includes("набор")||parts.includes("сундук"))crop="tb-relic-bundle";if(crop)return '<span class="tb-relic-icon tb-relic-atlas '+crop+' '+(extraClass||"")+'" aria-hidden="true"></span>';return '<img class="tb-relic-icon '+(extraClass||"")+'" src="./assets/relics/'+relicArtPath(item,slot)+'" alt="" loading="lazy" decoding="async">';}
 function skillSpriteClass(skill){const value=String(skill?.damage_type||skill?.element||skill?.effect_template||skill?.name||"").toLowerCase();if(value.includes("fire")||value.includes("огн"))return "skill-fire";if(value.includes("ice")||value.includes("лед")||value.includes("лёд"))return "skill-ice";if(value.includes("poison")||value.includes("яд"))return "skill-poison";if(value.includes("physical")||value.includes("strike")||value.includes("удар"))return "skill-phys";return "skill-arcane";}
 function talentSpriteClass(effect){const key=String(effect||"").toLowerCase();if(key.includes("health")||key.includes("hp")||key.includes("здоров"))return "talent-hp";if(key.includes("crit")||key.includes("critical")||key.includes("крит"))return "talent-crit";if(key.includes("defense")||key.includes("armor")||key.includes("защит"))return "talent-def";if(key.includes("speed")||key.includes("evasion")||key.includes("ловк")||key.includes("скор"))return "talent-agi";return "talent-atk";}
 function achievementSpriteClass(achievement){
  const metric=String(achievement?.metric||achievement?.id||"").toLowerCase();
  if(metric.includes("lore")||metric.includes("read"))return "achievement-compass";
  if(metric.includes("boss")||metric.includes("kill")||metric.includes("enemy"))return "achievement-skull";
  if(metric.includes("health")||metric.includes("life")||metric.includes("rescue"))return "achievement-heart";
  if(metric.includes("defense")||metric.includes("block")||metric.includes("shield"))return "achievement-shield";
  if(metric.includes("stage")||metric.includes("clear")||metric.includes("floor")||metric.includes("season"))return "achievement-trophy";
  return "achievement-star";
 }
 function inventoryIconHtml(item,equipment){
  const wrap=content=>'<div class="tb-item-art-wrap">'+content+'</div>';
  if(equipment)return wrap(relicIconHtml(item,item?.slot,"tb-bag-item-art-img"));
  const custom=customItemArtPath(item);
  if(custom)return customItemImageHtml(custom,"tb-bag-item-art-img",item);
  const value=String(item?.type||item?.id||item?.name||"").toLowerCase();
  let icon="";
  if(value.includes("craft_material")||value.includes("craft material")||value.includes("материал")||value.includes("enhancement_stone")||value.includes("enhancement stone")||value.includes("камень усиления"))icon="support-orb";
  else if(value.includes("helmet")||value.includes("helm")||value.includes("шлем"))icon="support-helmet";
  else if(value.includes("coin")||value.includes("silver")||value.includes("монет")||value.includes("сереб"))icon="support-purse";
  else if(value.includes("boot")||value.includes("shoe")||value.includes("обув")||value.includes("сапог"))icon="support-boot";
  else if(value.includes("shield")||value.includes("щит"))icon="support-shield";
  else if(value.includes("orb")||value.includes("crystal")||value.includes("сфер")||value.includes("крист"))icon="support-orb";
  return wrap(icon?'<span class="tb-support-icon '+icon+'" aria-hidden="true"></span>':relicIconHtml(item));
 }
 const classFallback={assassin:"Ас",bishop:"Еп",dragonkin:"Др",destroyer:"Ра",elemental:"Ма",duelist:"Ду",shaman:"Ша"};
 const tabGroups=[["ГЕРОЙ",[["stats","Характеристики"],["talents","Древо талантов"]]],["КОЛОДА",[["skills","Библиотека карт"]]],["КОЛЛЕКЦИЯ",[["gear","Экипировка"],["bag","Рюкзак"],["stash","Общий стеш"],["merchant","Торговец картами"],["relics","Реликвии"]]],["РАЗВИТИЕ",[["craft","Крафт"],["speedrun","Спидран"]]]];const tabs=tabGroups.flatMap(group=>group[1]);
 const SKILL_UPGRADE_LEVELS=Object.freeze({1:1,2:20,3:50});
 let pendingSkillUpgradeId=null;
 let engine=null,balance=null,skills=[],screen="characters",profileTab="stats",statsOverlayOpen=false,shopTab="silver",lastRenderedScreen=null,lastRenderedProfileTab=null;
 let selectedId=null,selectedClass="assassin",selectedStage=1,skipFloorsPending=false,pendingSkipStage=0,dialogOpen=false,battle=null,postBattleSummary=null,bagFilter="all",collectionTab="collection",selectedItemId=null,stonePickerItemId=null,collectionSelection=null,pendingBranchId=null,toastTimer=null,toastMessage="",preferredSpeed2=localStorage.getItem("tb-rpg-speed-v2")==="2",pendingTimer=null,statusTimer=null,audioContext=null,musicNodes=null,routeChoice="standard",onlineLeaderboardRows=[],onlineLeaderboardError="",onlineBusy=false,cardRemovalOpen=false,starterDeckSelection=[],campStopStage=null,guildRaid=null;

 const CARD_DATABASE=Object.freeze({
 strike:{id:"strike",name:"Удар",classId:"common",type:"attack",rarity:"common",cost:1,description:"Наносит 6 урона",upgradedDescription:"Наносит 9 урона",effects:{damage:6},upgradedEffects:{damage:9}},
 defend:{id:"defend",name:"Защита",classId:"common",type:"defense",rarity:"common",cost:1,description:"Даёт 5 брони",upgradedDescription:"Даёт 8 брони",effects:{block:5},upgradedEffects:{block:8}},
 dash:{id:"dash",name:"Рывок",classId:"common",type:"skill",rarity:"common",cost:0,description:"3 брони и добор 1",upgradedDescription:"5 брони и добор 1",effects:{block:3,draw:1},upgradedEffects:{block:5,draw:1}},
 precise_shot:{id:"precise_shot",name:"Точный выстрел",classId:"common",type:"attack",rarity:"common",cost:1,exhaust:true,description:"8 урона · Истощение",upgradedDescription:"11 урона · Истощение",effects:{damage:8},upgradedEffects:{damage:11}},
 iron_skin:{id:"iron_skin",name:"Железная кожа",classId:"common",type:"defense",rarity:"common",cost:1,retain:true,description:"5 брони · Сохранение",upgradedDescription:"8 брони · Сохранение",effects:{block:5},upgradedEffects:{block:8}},
 backstab:{id:"backstab",name:"Удар в спину",classId:"common",type:"attack",rarity:"common",cost:0,generate:"strike",description:"4 урона и создаёт Удар",upgradedDescription:"6 урона и создаёт Удар",effects:{damage:4},upgradedEffects:{damage:6}},
 heavy_blow:{id:"heavy_blow",name:"Тяжёлый выпад",classId:"common",type:"attack",rarity:"rare",cost:2,description:"15 урона",upgradedDescription:"20 урона",effects:{damage:15},upgradedEffects:{damage:20}},
 focus:{id:"focus",name:"Сосредоточение",classId:"common",type:"skill",rarity:"rare",cost:1,retain:true,description:"Добирает 2 карты",upgradedDescription:"Добирает 3 карты",effects:{draw:2},upgradedEffects:{draw:3}},
 ghost_step:{id:"ghost_step",name:"Призрачный шаг",classId:"common",type:"defense",rarity:"epic",cost:1,ethereal:true,description:"9 брони · Эфемерная",upgradedDescription:"12 брони · Эфемерная",effects:{block:9},upgradedEffects:{block:12}},
 x_barrage:{id:"x_barrage",name:"Шквал",classId:"common",type:"attack",rarity:"epic",cost:0,costX:true,isXCost:true,description:"5 урона за каждую потраченную энергию",upgradedDescription:"7 урона за каждую энергию",effects:{damagePerEnergy:5},upgradedEffects:{damagePerEnergy:7}},
 vengeance_x:{id:"vengeance_x",name:"Удар возмездия",classId:"common",type:"attack",rarity:"epic",cost:0,costX:true,isXCost:true,description:"Наносит 4 урона за каждую потраченную энергию",upgradedDescription:"Наносит 6 урона за каждую энергию",effects:{damagePerEnergy:4},upgradedEffects:{damagePerEnergy:6}},
 dagger:{id:"dagger",name:"Кинжал",classId:"common",type:"attack",rarity:"common",cost:0,exhaust:true,description:"Наносит 4 урона · Истощение",upgradedDescription:"Наносит 6 урона · Истощение",effects:{damage:4},upgradedEffects:{damage:6}},
 summon_daggers:{id:"summon_daggers",name:"Призыв кинжалов",classId:"common",type:"skill",rarity:"rare",cost:1,generateCards:[{id:"dagger",count:2}],description:"Создаёт 2 Кинжала в руке",upgradedDescription:"Создаёт 3 Кинжала в руке",effects:{},upgradedEffects:{}},
 inspiration:{id:"inspiration",name:"Вдохновение",classId:"common",type:"skill",rarity:"rare",cost:1,description:"Добирает 2 карты",upgradedDescription:"Добирает 3 карты",effects:{draw:2},upgradedEffects:{draw:3}},
 rampage:{id:"rampage",name:"Нарастающий гнев",classId:"common",type:"attack",rarity:"epic",cost:1,magicNumber:0,magicNumberIncrement:2,description:"Наносит 5 урона. При каждом розыгрыше усиливается на 2",upgradedDescription:"Наносит 7 урона. При каждом розыгрыше усиливается на 2",effects:{damage:5},upgradedEffects:{damage:7}},
 assassin_poison_blade:{id:"assassin_poison_blade",name:"Отравленный клинок",classId:"assassin",type:"attack",rarity:"rare",cost:1,description:"4 урона и 3 яда",upgradedDescription:"6 урона и 4 яда",effects:{damage:4,poison:3},upgradedEffects:{damage:6,poison:4}},
 assassin_bleed:{id:"assassin_bleed",name:"Кровопускание",classId:"assassin",type:"attack",rarity:"epic",cost:1,description:"5 урона; если есть яд — 2 кровотечения",upgradedDescription:"7 урона; если есть яд — 3 кровотечения",effects:{damage:5,conditionalBleed:2},upgradedEffects:{damage:7,conditionalBleed:3}},
 assassin_shadow:{id:"assassin_shadow",name:"Шаг из тени",classId:"assassin",type:"skill",rarity:"rare",cost:0,retain:true,description:"2 слабости и добор карты",upgradedDescription:"3 слабости и добор карты",effects:{weak:2,draw:1},upgradedEffects:{weak:3,draw:1}},
 destroyer_crush:{id:"destroyer_crush",name:"Сокрушение",classId:"destroyer",type:"attack",rarity:"epic",cost:2,description:"15 урона, игнорирует броню",upgradedDescription:"20 урона, игнорирует броню",effects:{damage:15,ignoreArmor:true},upgradedEffects:{damage:20,ignoreArmor:true}},
 destroyer_warcry:{id:"destroyer_warcry",name:"Боевой клич",classId:"destroyer",type:"skill",rarity:"rare",cost:1,exhaust:true,description:"2 ярости · Истощение",upgradedDescription:"3 ярости · Истощение",effects:{fury:2},upgradedEffects:{fury:3}},
 bishop_prayer:{id:"bishop_prayer",name:"Молитва",classId:"bishop",type:"skill",rarity:"rare",cost:1,description:"Лечит 5 здоровья",upgradedDescription:"Лечит 8 здоровья",effects:{heal:5},upgradedEffects:{heal:8}},
 bishop_divine_shield:{id:"bishop_divine_shield",name:"Божественный щит",classId:"bishop",type:"defense",rarity:"epic",cost:2,retain:true,description:"10 брони · Сохранение",upgradedDescription:"14 брони · Сохранение",effects:{block:10},upgradedEffects:{block:14}},
 bishop_smite:{id:"bishop_smite",name:"Кара небес",classId:"bishop",type:"attack",rarity:"rare",cost:1,description:"7 урона и 2 уязвимости",upgradedDescription:"10 урона и 3 уязвимости",effects:{damage:7,vulnerable:2},upgradedEffects:{damage:10,vulnerable:3}},
 dragonkin_flame:{id:"dragonkin_flame",name:"Пламя дракона",classId:"dragonkin",type:"attack",rarity:"rare",cost:1,description:"8 огненного урона",upgradedDescription:"11 огненного урона",effects:{damage:8,damageType:"fire"},upgradedEffects:{damage:11,damageType:"fire"}},
 dragonkin_frost:{id:"dragonkin_frost",name:"Ледяная чешуя",classId:"dragonkin",type:"defense",rarity:"epic",cost:1,retain:true,description:"7 брони и 1 слабость врагу",upgradedDescription:"10 брони и 2 слабости врагу",effects:{block:7,weak:1},upgradedEffects:{block:10,weak:2}},
 dragonkin_meteor:{id:"dragonkin_meteor",name:"Метеор",classId:"dragonkin",type:"attack",rarity:"legendary",cost:3,exhaust:true,description:"25 огненного урона всем врагам",upgradedDescription:"32 огненного урона всем врагам",effects:{damageAll:25,damageType:"fire"},upgradedEffects:{damageAll:32,damageType:"fire"}},
 elemental_chain:{id:"elemental_chain",name:"Цепь стихий",classId:"elemental",type:"attack",rarity:"rare",cost:1,description:"6 магического урона и 2 уязвимости",upgradedDescription:"9 урона и 3 уязвимости",effects:{damage:6,damageType:"arcane",vulnerable:2},upgradedEffects:{damage:9,damageType:"arcane",vulnerable:3}},
 elemental_storm:{id:"elemental_storm",name:"Грозовой фронт",classId:"elemental",type:"attack",rarity:"epic",cost:2,description:"8 урона всем врагам и 1 слабость",upgradedDescription:"11 урона всем врагам и 2 слабости",effects:{damageAll:8,weak:1},upgradedEffects:{damageAll:11,weak:2}},
 elemental_meditation:{id:"elemental_meditation",name:"Медитация",classId:"elemental",type:"skill",rarity:"rare",cost:0,retain:true,description:"Получает 2 энергии",upgradedDescription:"Получает 3 энергии",effects:{energy:2},upgradedEffects:{energy:3}},
 duelist_parry:{id:"duelist_parry",name:"Идеальное парирование",classId:"duelist",type:"defense",rarity:"rare",cost:1,retain:true,description:"6 брони и добор карты",upgradedDescription:"9 брони и добор карты",effects:{block:6,draw:1},upgradedEffects:{block:9,draw:1}},
 duelist_riposte:{id:"duelist_riposte",name:"Ответный выпад",classId:"duelist",type:"attack",rarity:"epic",cost:1,description:"9 урона; +4 если есть броня",upgradedDescription:"12 урона; +6 если есть броня",effects:{damage:9,bonusDamageIfBlock:4},upgradedEffects:{damage:12,bonusDamageIfBlock:6}},
 shaman_totem:{id:"shaman_totem",name:"Тотем жизни",classId:"shaman",type:"skill",rarity:"rare",cost:1,retain:true,description:"5 брони и лечит 3",upgradedDescription:"7 брони и лечит 5",effects:{block:5,heal:3},upgradedEffects:{block:7,heal:5}},
 shaman_spirit:{id:"shaman_spirit",name:"Духи предков",classId:"shaman",type:"skill",rarity:"epic",cost:1,ethereal:true,description:"3 яда и 2 кровотечения",upgradedDescription:"5 яда и 3 кровотечения",effects:{poison:3,bleed:2},upgradedEffects:{poison:5,bleed:3}},
 shaman_nature:{id:"shaman_nature",name:"Гнев природы",classId:"shaman",type:"attack",rarity:"rare",cost:2,description:"10 урона и 2 слабости всем",upgradedDescription:"14 урона и 3 слабости всем",effects:{damageAll:10,weak:2},upgradedEffects:{damageAll:14,weak:3}},
 gear_sword_cleave:{id:"gear_sword_cleave",name:"Рассечение",classId:"common",type:"attack",rarity:"rare",cost:2,description:"Наносит 12 урона",upgradedDescription:"Наносит 16 урона",effects:{damage:12},upgradedEffects:{damage:16}},
 gear_staff_bolt:{id:"gear_staff_bolt",name:"Магический снаряд",classId:"common",type:"attack",rarity:"rare",cost:1,description:"8 магического урона и +2 к магии до конца боя",upgradedDescription:"11 магического урона и +2 к магии до конца боя",effects:{damage:8,damageType:"arcane",spellPower:2},upgradedEffects:{damage:11,damageType:"arcane",spellPower:2}},
 gear_iron_wall:{id:"gear_iron_wall",name:"Железная стена",classId:"common",type:"defense",rarity:"rare",cost:2,description:"Даёт 15 брони",upgradedDescription:"Даёт 20 брони",effects:{block:15},upgradedEffects:{block:20}},
 gear_evasion:{id:"gear_evasion",name:"Уклонение",classId:"common",type:"defense",rarity:"rare",cost:1,description:"Даёт 5 брони и добирает 1 карту",upgradedDescription:"Даёт 8 брони и добирает 1 карту",effects:{block:5,draw:1},upgradedEffects:{block:8,draw:1}},
 gear_power_surge:{id:"gear_power_surge",name:"Прилив сил",classId:"common",type:"skill",rarity:"rare",cost:0,description:"Следующая атакующая карта наносит +2 урона",upgradedDescription:"Следующая атакующая карта наносит +4 урона",effects:{nextAttackDamage:2},upgradedEffects:{nextAttackDamage:4}},
 curse_wound:{id:"curse_wound",name:"Рана",classId:"common",type:"curse",rarity:"common",cost:0,description:"Нельзя разыграть. Занимает место в руке",upgradedDescription:"Проклятие нельзя разыграть",effects:{unplayable:true},upgradedEffects:{unplayable:true}},
 curse_doubt:{id:"curse_doubt",name:"Сомнение",classId:"common",type:"curse",rarity:"rare",cost:0,description:"Нельзя разыграть. В конце хода накладывает 1 слабость",upgradedDescription:"Нельзя разыграть. В конце хода накладывает 1 слабость",effects:{unplayable:true,endTurnPlayerWeak:1},upgradedEffects:{unplayable:true,endTurnPlayerWeak:1}},
 status_slime:{id:"status_slime",name:"Слизь",classId:"common",type:"status",rarity:"common",cost:1,description:"Потрать 1 энергию, чтобы сбросить эту карту",upgradedDescription:"Потрать 1 энергию, чтобы сбросить эту карту",effects:{selfDiscard:true},upgradedEffects:{selfDiscard:true}},
  assassin_bleed_edge:{id:"assassin_bleed_edge",name:"Кровавый росчерк",classId:"assassin",branchId:"bleed",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 8 · Кровотечение 3",effects:{"damage":8,"bleed":3}},
  assassin_bleed_mastery:{id:"assassin_bleed_mastery",name:"Ритуал алой жатвы",classId:"assassin",branchId:"bleed",type:"skill",rarity:"epic",cost:1,description:"Броня 5 · Кровотечение 2",effects:{"block":5,"bleed":2}},
  assassin_poison_edge:{id:"assassin_poison_edge",name:"Отравленный клинок",classId:"assassin",branchId:"poison",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 6 · Яд 4",effects:{"damage":6,"poison":4}},
  assassin_poison_mastery:{id:"assassin_poison_mastery",name:"Смертельная эссенция",classId:"assassin",branchId:"poison",type:"skill",rarity:"epic",cost:1,description:"Урон 4 · Яд 3 · Слабость 1",effects:{"damage":4,"poison":3,"weak":1}},
  assassin_execution_edge:{id:"assassin_execution_edge",name:"Приговор палача",classId:"assassin",branchId:"execution",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 13 · Уязвимость 2",effects:{"damage":13,"vulnerable":2}},
  assassin_execution_mastery:{id:"assassin_execution_mastery",name:"Обезглавливающий выпад",classId:"assassin",branchId:"execution",type:"skill",rarity:"epic",cost:1,description:"Урон 8 · Игнорирует броню true",effects:{"damage":8,"ignoreArmor":true}},
  bishop_exorcism_edge:{id:"bishop_exorcism_edge",name:"Изгнание скверны",classId:"bishop",branchId:"exorcism",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 10 · Слабость 2",effects:{"damage":10,"weak":2}},
  bishop_exorcism_mastery:{id:"bishop_exorcism_mastery",name:"Печать очищения",classId:"bishop",branchId:"exorcism",type:"skill",rarity:"epic",cost:1,description:"Урон всем 5 · Слабость 1",effects:{"damageAll":5,"weak":1}},
  bishop_healing_edge:{id:"bishop_healing_edge",name:"Благословение жизни",classId:"bishop",branchId:"healing",starter:true,type:"attack",rarity:"rare",cost:1,description:"Лечение 10 · Броня 4",effects:{"heal":10,"block":4}},
  bishop_healing_mastery:{id:"bishop_healing_mastery",name:"Священное восстановление",classId:"bishop",branchId:"healing",type:"skill",rarity:"epic",cost:1,description:"Лечение 15 · Броня 6",effects:{"heal":15,"block":6}},
  bishop_buffs_edge:{id:"bishop_buffs_edge",name:"Боевой псалом",classId:"bishop",branchId:"buffs",starter:true,type:"attack",rarity:"rare",cost:1,description:"Усиление 2 · Броня 5",effects:{"fury":2,"block":5}},
  bishop_buffs_mastery:{id:"bishop_buffs_mastery",name:"Вознесение духа",classId:"bishop",branchId:"buffs",type:"skill",rarity:"epic",cost:1,description:"Сила магии 3 · Энергия 1",effects:{"spellPower":3,"energy":1}},
  dragonkin_fire_dragon_edge:{id:"dragonkin_fire_dragon_edge",name:"Пламенный укус",classId:"dragonkin",branchId:"fire_dragon",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 9 · Ожог 3",effects:{"damage":9,"damageType":"fire","burn":3}},
  dragonkin_fire_dragon_mastery:{id:"dragonkin_fire_dragon_mastery",name:"Дыхание дракона",classId:"dragonkin",branchId:"fire_dragon",type:"skill",rarity:"epic",cost:1,description:"Урон всем 5 · damageType fire · Кровотечение 1",effects:{"damageAll":5,"damageType":"fire","bleed":1}},
  dragonkin_ice_dragon_edge:{id:"dragonkin_ice_dragon_edge",name:"Ледяное копьё",classId:"dragonkin",branchId:"ice_dragon",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 8 · damageType ice · Слабость 2",effects:{"damage":8,"damageType":"ice","weak":2}},
  dragonkin_ice_dragon_mastery:{id:"dragonkin_ice_dragon_mastery",name:"Панцирь вечной мерзлоты",classId:"dragonkin",branchId:"ice_dragon",type:"skill",rarity:"epic",cost:1,description:"Броня 10 · Слабость 1",effects:{"block":10,"weak":1}},
  dragonkin_black_dragon_edge:{id:"dragonkin_black_dragon_edge",name:"Теневая пасть",classId:"dragonkin",branchId:"black_dragon",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 9 · damageType dark · Уязвимость 2",effects:{"damage":9,"damageType":"dark","vulnerable":2}},
  dragonkin_black_dragon_mastery:{id:"dragonkin_black_dragon_mastery",name:"Поглощение пустоты",classId:"dragonkin",branchId:"black_dragon",type:"skill",rarity:"epic",cost:1,description:"Урон 5 · damageType dark · Лечение 4",effects:{"damage":5,"damageType":"dark","heal":4}},
  destroyer_fists_edge:{id:"destroyer_fists_edge",name:"Град кулаков",classId:"destroyer",branchId:"fists",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 5 · Удары 2",effects:{"damage":5,"hits":2}},
  destroyer_fists_mastery:{id:"destroyer_fists_mastery",name:"Несокрушимая стойка",classId:"destroyer",branchId:"fists",type:"skill",rarity:"epic",cost:1,description:"Броня 8 · Следующая атака 4",effects:{"block":8,"nextAttackDamage":4}},
  destroyer_greatsword_edge:{id:"destroyer_greatsword_edge",name:"Рассекающий разлом",classId:"destroyer",branchId:"greatsword",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 14 · Игнорирует броню true",effects:{"damage":14,"ignoreArmor":true}},
  destroyer_greatsword_mastery:{id:"destroyer_greatsword_mastery",name:"Гнев титана",classId:"destroyer",branchId:"greatsword",type:"skill",rarity:"epic",cost:1,description:"Урон 8 · Усиление 2",effects:{"damage":8,"fury":2}},
  destroyer_wand_shield_edge:{id:"destroyer_wand_shield_edge",name:"Чародейский заслон",classId:"destroyer",branchId:"wand_shield",starter:true,type:"attack",rarity:"rare",cost:1,description:"Броня 9 · Сила магии 2",effects:{"block":9,"spellPower":2}},
  destroyer_wand_shield_mastery:{id:"destroyer_wand_shield_mastery",name:"Контрудар бастиона",classId:"destroyer",branchId:"wand_shield",type:"skill",rarity:"epic",cost:1,description:"Броня 6 · Следующая атака 7",effects:{"block":6,"nextAttackDamage":7}},
  elemental_darkness_edge:{id:"elemental_darkness_edge",name:"Поглощение мрака",classId:"elemental",branchId:"darkness",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 9 · damageType dark · Слабость 2",effects:{"damage":9,"damageType":"dark","weak":2}},
  elemental_darkness_mastery:{id:"elemental_darkness_mastery",name:"Проклятие бездны",classId:"elemental",branchId:"darkness",type:"skill",rarity:"epic",cost:1,description:"Урон всем 4 · damageType dark · Уязвимость 1",effects:{"damageAll":4,"damageType":"dark","vulnerable":1}},
  elemental_water_edge:{id:"elemental_water_edge",name:"Водяной серп",classId:"elemental",branchId:"water",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 7 · damageType water · Добор 1",effects:{"damage":7,"damageType":"water","draw":1}},
  elemental_water_mastery:{id:"elemental_water_mastery",name:"Приливная волна",classId:"elemental",branchId:"water",type:"skill",rarity:"epic",cost:1,description:"Броня 7 · Лечение 4",effects:{"block":7,"heal":4}},
  elemental_earth_edge:{id:"elemental_earth_edge",name:"Каменный шип",classId:"elemental",branchId:"earth",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 8 · damageType earth · Слабость 1",effects:{"damage":8,"damageType":"earth","weak":1}},
  elemental_earth_mastery:{id:"elemental_earth_mastery",name:"Оплот земли",classId:"elemental",branchId:"earth",type:"skill",rarity:"epic",cost:1,description:"Броня 12 · Энергия 1",effects:{"block":12,"energy":1}},
  duelist_dual_swords_edge:{id:"duelist_dual_swords_edge",name:"Двойной разрез",classId:"duelist",branchId:"dual_swords",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 5 · Удары 2",effects:{"damage":5,"hits":2}},
  duelist_dual_swords_mastery:{id:"duelist_dual_swords_mastery",name:"Танец клинков",classId:"duelist",branchId:"dual_swords",type:"skill",rarity:"epic",cost:1,description:"Урон 4 · Удары 2 · Следующая атака 3",effects:{"damage":4,"hits":2,"nextAttackDamage":3}},
  duelist_sword_shield_edge:{id:"duelist_sword_shield_edge",name:"Стальная контратака",classId:"duelist",branchId:"sword_shield",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 8 · Уязвимость 1",effects:{"damage":8,"vulnerable":1}},
  duelist_sword_shield_mastery:{id:"duelist_sword_shield_mastery",name:"Стена клинков",classId:"duelist",branchId:"sword_shield",type:"skill",rarity:"epic",cost:1,description:"Броня 10 · Следующая атака 5",effects:{"block":10,"nextAttackDamage":5}},
  duelist_rapier_edge:{id:"duelist_rapier_edge",name:"Укол в уязвимость",classId:"duelist",branchId:"rapier",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 10 · Игнорирует броню true",effects:{"damage":10,"ignoreArmor":true}},
  duelist_rapier_mastery:{id:"duelist_rapier_mastery",name:"Идеальное парирование",classId:"duelist",branchId:"rapier",type:"skill",rarity:"epic",cost:1,description:"Броня 8 · Слабость 2",effects:{"block":8,"weak":2}},
  shaman_spirits_edge:{id:"shaman_spirits_edge",name:"Зов предков",classId:"shaman",branchId:"spirits",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 7 · Яд 2",effects:{"damage":7,"poison":2}},
  shaman_spirits_mastery:{id:"shaman_spirits_mastery",name:"Духовный резонанс",classId:"shaman",branchId:"spirits",type:"skill",rarity:"epic",cost:1,description:"Лечение 5 · Броня 7",effects:{"heal":5,"block":7}},
  shaman_dark_gods_edge:{id:"shaman_dark_gods_edge",name:"Шёпот древних",classId:"shaman",branchId:"dark_gods",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 10 · damageType dark · Слабость 2",effects:{"damage":10,"damageType":"dark","weak":2}},
  shaman_dark_gods_mastery:{id:"shaman_dark_gods_mastery",name:"Жертва во имя бога",classId:"shaman",branchId:"dark_gods",type:"skill",rarity:"epic",cost:1,description:"Урон всем 5 · damageType dark · Уязвимость 1",effects:{"damageAll":5,"damageType":"dark","vulnerable":1}},
  shaman_nature_edge:{id:"shaman_nature_edge",name:"Корни-ловушки",classId:"shaman",branchId:"nature",starter:true,type:"attack",rarity:"rare",cost:1,description:"Урон 7 · Яд 2 · Слабость 1",effects:{"damage":7,"poison":2,"weak":1}},
  shaman_nature_mastery:{id:"shaman_nature_mastery",name:"Живительный тотем",classId:"shaman",branchId:"nature",type:"skill",rarity:"epic",cost:1,description:"Лечение 7 · Броня 6",effects:{"heal":7,"block":6}},
  assassin_bleed_core:{id:"assassin_bleed_core",name:"Кровавый порез",classId:"assassin",branchId:"bleed",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 4 · Кровотечение 3",effects:{"damage":4,"bleed":3}},
  assassin_bleed_utility:{id:"assassin_bleed_utility",name:"Жажда крови",classId:"assassin",branchId:"bleed",type:"attack",rarity:"rare",cost:1,description:"Лечение за кровотечение 2",effects:{"healPerBleed":2}},
  assassin_poison_core:{id:"assassin_poison_core",name:"Токсичный удар",classId:"assassin",branchId:"poison",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 4 · Яд 4",effects:{"damage":4,"poison":4}},
  assassin_poison_utility:{id:"assassin_poison_utility",name:"Взрыв токсинов",classId:"assassin",branchId:"poison",type:"attack",rarity:"rare",cost:1,description:"Урон за яд 1",effects:{"damagePerPoison":1}},
  assassin_execution_core:{id:"assassin_execution_core",name:"Метка обречённого",classId:"assassin",branchId:"execution",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 6 · Уязвимость 2",effects:{"damage":6,"vulnerable":2}},
  assassin_execution_utility:{id:"assassin_execution_utility",name:"Казнь",classId:"assassin",branchId:"execution",type:"attack",rarity:"rare",cost:1,description:"Урон 12 · Игнор брони true",effects:{"damage":12,"ignoreArmor":true}},
  bishop_exorcism_core:{id:"bishop_exorcism_core",name:"Святой приговор",classId:"bishop",branchId:"exorcism",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 8 · Слабость 2",effects:{"damage":8,"weak":2}},
  bishop_exorcism_utility:{id:"bishop_exorcism_utility",name:"Очищающий свет",classId:"bishop",branchId:"exorcism",type:"attack",rarity:"rare",cost:1,description:"Броня 8 · Слабость 1",effects:{"block":8,"weak":1}},
  bishop_healing_core:{id:"bishop_healing_core",name:"Благодать",classId:"bishop",branchId:"healing",starter:true,type:"skill",rarity:"common",cost:1,description:"Лечение 8 · Броня 6",effects:{"heal":8,"block":6}},
  bishop_healing_utility:{id:"bishop_healing_utility",name:"Кара",classId:"bishop",branchId:"healing",type:"attack",rarity:"rare",cost:1,description:"Урон от недостающего HP 0.2 · Слабость 1",effects:{"damageMissingHp":0.2,"weak":1}},
  bishop_buffs_core:{id:"bishop_buffs_core",name:"Боевой настрой",classId:"bishop",branchId:"buffs",starter:true,type:"skill",rarity:"common",cost:1,description:"Усиление 2",effects:{"fury":2}},
  bishop_buffs_utility:{id:"bishop_buffs_utility",name:"Вдохновляющая молитва",classId:"bishop",branchId:"buffs",type:"attack",rarity:"rare",cost:1,description:"Урон 4 · Добор 2 · Энергия 1",effects:{"damage":4,"draw":2,"energy":1}},
  dragonkin_fire_dragon_core:{id:"dragonkin_fire_dragon_core",name:"Огненный плевок",classId:"dragonkin",branchId:"fire_dragon",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 9 · Огонь",effects:{"damage":9,"damageType":"fire"}},
  dragonkin_fire_dragon_utility:{id:"dragonkin_fire_dragon_utility",name:"Пылающая чешуя",classId:"dragonkin",branchId:"fire_dragon",type:"attack",rarity:"rare",cost:1,description:"Броня 8 · Усиление 1",effects:{"block":8,"fury":1}},
  dragonkin_ice_dragon_core:{id:"dragonkin_ice_dragon_core",name:"Ледяной панцирь",classId:"dragonkin",branchId:"ice_dragon",starter:true,type:"skill",rarity:"common",cost:1,description:"Броня 12 · Слабость 1",effects:{"block":12,"weak":1}},
  dragonkin_ice_dragon_utility:{id:"dragonkin_ice_dragon_utility",name:"Морозное копьё",classId:"dragonkin",branchId:"ice_dragon",type:"attack",rarity:"rare",cost:1,description:"Урон 8 · Лёд · Слабость 2",effects:{"damage":8,"damageType":"ice","weak":2}},
  dragonkin_black_dragon_core:{id:"dragonkin_black_dragon_core",name:"Укус пустоты",classId:"dragonkin",branchId:"black_dragon",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 9 · Тёмный урон · Слабость 2",effects:{"damage":9,"damageType":"dark","weak":2}},
  dragonkin_black_dragon_utility:{id:"dragonkin_black_dragon_utility",name:"Поглощение души",classId:"dragonkin",branchId:"black_dragon",type:"attack",rarity:"rare",cost:1,description:"Урон 7 · Тёмный урон · Лечение 5",effects:{"damage":7,"damageType":"dark","heal":5}},
  destroyer_fists_core:{id:"destroyer_fists_core",name:"Шквал ударов",classId:"destroyer",branchId:"fists",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 3 · Удары 3",effects:{"damage":3,"hits":3}},
  destroyer_fists_utility:{id:"destroyer_fists_utility",name:"Стойка бойца",classId:"destroyer",branchId:"fists",type:"attack",rarity:"rare",cost:1,description:"Броня 8 · Усиление 1",effects:{"block":8,"fury":1}},
  destroyer_greatsword_core:{id:"destroyer_greatsword_core",name:"Широкий размах",classId:"destroyer",branchId:"greatsword",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон всем 9",effects:{"damageAll":9}},
  destroyer_greatsword_utility:{id:"destroyer_greatsword_utility",name:"Раскол брони",classId:"destroyer",branchId:"greatsword",type:"attack",rarity:"rare",cost:1,description:"Урон 16 · Игнор брони true",effects:{"damage":16,"ignoreArmor":true}},
  destroyer_wand_shield_core:{id:"destroyer_wand_shield_core",name:"Щит арканиста",classId:"destroyer",branchId:"wand_shield",starter:true,type:"skill",rarity:"common",cost:1,description:"Броня 10 · Сила магии 2",effects:{"block":10,"spellPower":2}},
  destroyer_wand_shield_utility:{id:"destroyer_wand_shield_utility",name:"Ответный разряд",classId:"destroyer",branchId:"wand_shield",type:"attack",rarity:"rare",cost:1,description:"Урон 8 · Слабость 1 · Следующая атака 5",effects:{"damage":8,"weak":1,"nextAttackDamage":5}},
  elemental_darkness_core:{id:"elemental_darkness_core",name:"Теневое клеймо",classId:"elemental",branchId:"darkness",starter:true,type:"skill",rarity:"common",cost:1,description:"Слабость 2 · Уязвимость 2",effects:{"weak":2,"vulnerable":2}},
  elemental_darkness_utility:{id:"elemental_darkness_utility",name:"Пожиратель света",classId:"elemental",branchId:"darkness",type:"attack",rarity:"rare",cost:1,description:"Урон за яд 1 · Урон за кровотечение 1",effects:{"damagePerPoison":1,"damagePerBleed":1}},
  elemental_water_core:{id:"elemental_water_core",name:"Стремнина",classId:"elemental",branchId:"water",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 7 · Добор 1",effects:{"damage":7,"draw":1}},
  elemental_water_utility:{id:"elemental_water_utility",name:"Целительный прилив",classId:"elemental",branchId:"water",type:"attack",rarity:"rare",cost:1,description:"Урон 5 · Броня 7 · Лечение 5 · Слабость 1",effects:{"damage":5,"block":7,"heal":5,"weak":1}},
  elemental_earth_core:{id:"elemental_earth_core",name:"Каменный осколок",classId:"elemental",branchId:"earth",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 8 · Слабость 1",effects:{"damage":8,"weak":1}},
  elemental_earth_utility:{id:"elemental_earth_utility",name:"Земляная стена",classId:"elemental",branchId:"earth",type:"attack",rarity:"rare",cost:1,description:"Броня 12 · Слабость 1",effects:{"block":12,"weak":1}},
  duelist_dual_swords_core:{id:"duelist_dual_swords_core",name:"Парный выпад",classId:"duelist",branchId:"dual_swords",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 4 · Удары 2",effects:{"damage":4,"hits":2}},
  duelist_dual_swords_utility:{id:"duelist_dual_swords_utility",name:"Смертельный выпад",classId:"duelist",branchId:"dual_swords",type:"attack",rarity:"rare",cost:1,finisher:true,description:"Урон 3 · Удары 3 · Тратит 3 заряда для тройного урона",effects:{"damage":3,"hits":3,"bleed":2,"finisher":true}},
  duelist_sword_shield_core:{id:"duelist_sword_shield_core",name:"Удар щитом",classId:"duelist",branchId:"sword_shield",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 7 · Броня 5",effects:{"damage":7,"block":5}},
  duelist_sword_shield_utility:{id:"duelist_sword_shield_utility",name:"Рипостный заслон",classId:"duelist",branchId:"sword_shield",type:"attack",rarity:"rare",cost:1,description:"Броня 10 · Следующая атака 5 · Уязвимость 1",effects:{"block":10,"nextAttackDamage":5,"vulnerable":1}},
  duelist_rapier_core:{id:"duelist_rapier_core",name:"Точный укол",classId:"duelist",branchId:"rapier",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 10 · Игнор брони true",effects:{"damage":10,"ignoreArmor":true}},
  duelist_rapier_utility:{id:"duelist_rapier_utility",name:"Отводящий выпад",classId:"duelist",branchId:"rapier",type:"attack",rarity:"rare",cost:1,description:"Броня 8 · Слабость 2",effects:{"block":8,"weak":2}},
  shaman_spirits_core:{id:"shaman_spirits_core",name:"Удар предков",classId:"shaman",branchId:"spirits",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 7 · Яд 2",effects:{"damage":7,"poison":2}},
  shaman_spirits_utility:{id:"shaman_spirits_utility",name:"Духовный покров",classId:"shaman",branchId:"spirits",type:"attack",rarity:"rare",cost:1,description:"Броня 7 · Лечение 4",effects:{"block":7,"heal":4}},
  shaman_dark_gods_core:{id:"shaman_dark_gods_core",name:"Глас бездны",classId:"shaman",branchId:"dark_gods",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 10 · Тёмный урон · Слабость 1",effects:{"damage":10,"damageType":"dark","weak":1}},
  shaman_dark_gods_utility:{id:"shaman_dark_gods_utility",name:"Жертвенный обряд",classId:"shaman",branchId:"dark_gods",type:"attack",rarity:"rare",cost:1,description:"Урон всем 6 · Уязвимость 1",effects:{"damageAll":6,"vulnerable":1}},
  shaman_nature_core:{id:"shaman_nature_core",name:"Ядовитые корни",classId:"shaman",branchId:"nature",starter:true,type:"skill",rarity:"common",cost:1,description:"Урон 7 · Яд 2 · Слабость 1",effects:{"damage":7,"poison":2,"weak":1}},
  shaman_nature_utility:{id:"shaman_nature_utility",name:"Живой тотем",classId:"shaman",branchId:"nature",type:"attack",rarity:"rare",cost:1,description:"Лечение 7 · Броня 6",effects:{"heal":7,"block":6}}
 })
 const ART_MAPPING=Object.freeze({"strike":"strike.png","defend":"defend.png","dash":"dash.png","precise_shot":"precise_shot.png","iron_skin":"iron_skin.png","backstab":"backstab.png","heavy_blow":"heavy_blow.png","focus":"focus.png","ghost_step":"ghost_step.png","x_barrage":"x_barrage.png","vengeance_x":"vengeance_x.png","dagger":"dagger.png","summon_daggers":"summon_daggers.png","inspiration":"inspiration.png","rampage":"rampage.png","gear_sword_cleave":"gear_sword_cleave.png","gear_staff_bolt":"gear_staff_bolt.png","gear_iron_wall":"gear_iron_wall.png","gear_evasion":"gear_evasion.png","gear_power_surge":"gear_power_surge.png","curse_wound":"curse_wound.png","curse_doubt":"curse_doubt.png","status_slime":"status_slime.png","assassin_poison_blade":"assassin_poison_blade.png","assassin_bleed":"assassin_bleed.png","assassin_shadow":"assassin_shadow.png","assassin_bleed_edge":"assassin_bleed_edge.png","assassin_bleed_mastery":"assassin_bleed_mastery.png","assassin_poison_edge":"assassin_poison_edge.png","assassin_poison_mastery":"assassin_poison_mastery.png","assassin_execution_edge":"assassin_execution_edge.png","assassin_execution_mastery":"assassin_execution_mastery.png","assassin_bleed_core":"assassin_bleed_core.png","assassin_bleed_utility":"assassin_bleed_utility.png","assassin_poison_core":"assassin_poison_core.png","assassin_poison_utility":"assassin_poison_utility.png","assassin_execution_core":"assassin_execution_core.png","assassin_execution_utility":"assassin_execution_utility.png","destroyer_crush":"destroyer_crush.png","destroyer_warcry":"destroyer_warcry.png","destroyer_fists_edge":"destroyer_fists_edge.png","destroyer_fists_mastery":"destroyer_fists_mastery.png","destroyer_greatsword_edge":"destroyer_greatsword_edge.png","destroyer_greatsword_mastery":"destroyer_greatsword_mastery.png","destroyer_wand_shield_edge":"destroyer_wand_shield_edge.png","destroyer_wand_shield_mastery":"destroyer_wand_shield_mastery.png","destroyer_fists_core":"destroyer_fists_core.png","destroyer_fists_utility":"destroyer_fists_utility.png","destroyer_greatsword_core":"destroyer_greatsword_core.png","destroyer_greatsword_utility":"destroyer_greatsword_utility.png","destroyer_wand_shield_core":"destroyer_wand_shield_core.png","destroyer_wand_shield_utility":"destroyer_wand_shield_utility.png","bishop_prayer":"bishop_prayer.png","bishop_divine_shield":"bishop_divine_shield.png","bishop_smite":"bishop_smite.png","bishop_exorcism_edge":"bishop_exorcism_edge.png","bishop_exorcism_mastery":"bishop_exorcism_mastery.png","bishop_healing_edge":"bishop_healing_edge.png","bishop_healing_mastery":"bishop_healing_mastery.png","bishop_buffs_edge":"bishop_buffs_edge.png","bishop_buffs_mastery":"bishop_buffs_mastery.png","bishop_exorcism_core":"bishop_exorcism_core.png","bishop_exorcism_utility":"bishop_exorcism_utility.png","bishop_healing_core":"bishop_healing_core.png","bishop_healing_utility":"bishop_healing_utility.png","bishop_buffs_core":"bishop_buffs_core.png","bishop_buffs_utility":"bishop_buffs_utility.png","dragonkin_flame":"dragonkin_flame.png","dragonkin_frost":"dragonkin_frost.png","dragonkin_meteor":"dragonkin_meteor.png","dragonkin_fire_dragon_edge":"dragonkin_fire_dragon_edge.png","dragonkin_fire_dragon_mastery":"dragonkin_fire_dragon_mastery.png","dragonkin_ice_dragon_edge":"dragonkin_ice_dragon_edge.png","dragonkin_ice_dragon_mastery":"dragonkin_ice_dragon_mastery.png","dragonkin_black_dragon_edge":"dragonkin_black_dragon_edge.png","dragonkin_black_dragon_mastery":"dragonkin_black_dragon_mastery.png","dragonkin_fire_dragon_core":"dragonkin_fire_dragon_core.png","dragonkin_fire_dragon_utility":"dragonkin_fire_dragon_utility.png","dragonkin_ice_dragon_core":"dragonkin_ice_dragon_core.png","dragonkin_ice_dragon_utility":"dragonkin_ice_dragon_utility.png","dragonkin_black_dragon_core":"dragonkin_black_dragon_core.png","dragonkin_black_dragon_utility":"dragonkin_black_dragon_utility.png","elemental_chain":"elemental_chain.png","elemental_storm":"elemental_storm.png","elemental_meditation":"elemental_meditation.png","elemental_darkness_edge":"elemental_darkness_edge.png","elemental_darkness_mastery":"elemental_darkness_mastery.png","elemental_water_edge":"elemental_water_edge.png","elemental_water_mastery":"elemental_water_mastery.png","elemental_earth_edge":"elemental_earth_edge.png","elemental_earth_mastery":"elemental_earth_mastery.png","elemental_darkness_core":"elemental_darkness_core.png","elemental_darkness_utility":"elemental_darkness_utility.png","elemental_water_core":"elemental_water_core.png","elemental_water_utility":"elemental_water_utility.png","elemental_earth_core":"elemental_earth_core.png","elemental_earth_utility":"elemental_earth_utility.png","duelist_parry":"duelist_parry.png","duelist_riposte":"duelist_riposte.png","duelist_dual_swords_edge":"duelist_dual_swords_edge.png","duelist_dual_swords_mastery":"duelist_dual_swords_mastery.png","duelist_sword_shield_edge":"duelist_sword_shield_edge.png","duelist_sword_shield_mastery":"duelist_sword_shield_mastery.png","duelist_rapier_edge":"duelist_rapier_edge.png","duelist_rapier_mastery":"duelist_rapier_mastery.png","duelist_dual_swords_core":"duelist_dual_swords_core.png","duelist_dual_swords_utility":"duelist_dual_swords_utility.png","duelist_sword_shield_core":"duelist_sword_shield_core.png","duelist_sword_shield_utility":"duelist_sword_shield_utility.png","duelist_rapier_core":"duelist_rapier_core.png","duelist_rapier_utility":"duelist_rapier_utility.png","shaman_totem":"shaman_totem.png","shaman_spirit":"shaman_spirit.png","shaman_nature":"shaman_nature.png","shaman_spirits_edge":"shaman_spirits_edge.png","shaman_spirits_mastery":"shaman_spirits_mastery.png","shaman_dark_gods_edge":"shaman_dark_gods_edge.png","shaman_dark_gods_mastery":"shaman_dark_gods_mastery.png","shaman_nature_edge":"shaman_nature_edge.png","shaman_nature_mastery":"shaman_nature_mastery.png","shaman_spirits_core":"shaman_spirits_core.png","shaman_spirits_utility":"shaman_spirits_utility.png","shaman_dark_gods_core":"shaman_dark_gods_core.png","shaman_dark_gods_utility":"shaman_dark_gods_utility.png","shaman_nature_core":"shaman_nature_core.png","shaman_nature_utility":"shaman_nature_utility.png"});
 const CARD_ART_ROOT="./assets/cards/";
 Object.values(CARD_DATABASE).forEach(card=>{card.image=CARD_ART_ROOT+(ART_MAPPING[card.id]||"strike.png");});
;

 function cardClassFor(character){return String(character?.classId||character?.cls||"").toLowerCase();}
 const SPECIALIZATION_REWARD_WEIGHT=2.5;
 function pickWeightedCard(pool,character){if(!pool.length)return null;const branch=String(character?.branch||""),total=pool.reduce((sum,card)=>sum+(branch&&card.branchId===branch?SPECIALIZATION_REWARD_WEIGHT:1),0);let roll=gameRandom()*total;for(const card of pool){roll-=branch&&card.branchId===branch?SPECIALIZATION_REWARD_WEIGHT:1;if(roll<0)return card;}return pool[pool.length-1];}
 function pickCardForRarity(character,rarity,used){const classId=cardClassFor(character),pool=Object.values(CARD_DATABASE).filter(card=>(card.classId==="common"||card.classId===classId)&&(!card.branchId||!!character?.branch&&card.branchId===character.branch)&&card.rarity===rarity&&card.type!=="curse"&&!card.effects?.unplayable&&!used.has(card.id));return pickWeightedCard(pool,character);}
 function pickRandomCardDefinition(character,used=new Set()){const roll=gameRandom()*100,rarity=roll<70?"common":roll<95?"rare":roll<99.5?"epic":"legendary",order=["common","rare","epic","legendary"],start=order.indexOf(rarity);let d=null;for(let n=0;n<order.length&&!d;n++){const lo=start-n,hi=start+n;if(lo>=0)d=pickCardForRarity(character,order[lo],used);if(!d&&hi<order.length&&hi!==lo)d=pickCardForRarity(character,order[hi],used);}if(!d){const pool=Object.values(CARD_DATABASE).filter(card=>(card.classId==="common"||card.classId===cardClassFor(character))&&(!card.branchId||!!character?.branch&&card.branchId===character.branch)&&card.type!=="curse"&&!card.effects?.unplayable&&!used.has(card.id));d=pickWeightedCard(pool,character);}return d?createCardInstance(d.id):null;}
 function generateCardReward(character){if(!character)return [];const used=new Set(),cards=[];for(let i=0;i<3;i++){const card=pickRandomCardDefinition(character,used);if(!card)break;used.add(card.id);cards.push(card);}return cards;}
 function showCardRewardScreen(cards){document.querySelector(".card-reward-overlay")?.remove();const options=(Array.isArray(cards)?cards:[]).slice(0,3);if(!options.length)return;const overlay=document.createElement("div");overlay.className="card-reward-overlay";overlay.setAttribute("role","presentation");overlay.innerHTML='<section class="card-reward-modal" role="dialog" aria-modal="true" aria-label="Выбор карты"><h3>Выберите карту</h3><div class="card-reward-grid" id="rewardGrid">'+options.map((card,index)=>{const cost=card.costX?"X":Number(card.cost)||0,type=card.type||"skill",rarity=card.rarity||"common";return '<button type="button" class="v2-card '+esc(type)+' rarity-'+esc(rarity)+(card.isUpgraded?' is-upgraded':'')+'" data-card-reward-pick="'+index+'"><span class="card-cost">'+cost+'</span><span class="card-name">'+esc(card.name)+(card.isUpgraded?' <b class="tb-card-upgrade-mark">+</b>':'')+'</span><span class="card-type">'+esc(({attack:"АТАКА",defense:"ЗАЩИТА",skill:"НАВЫК",power:"СИЛА",curse:"ПРОКЛЯТИЕ"})[type]||"НАВЫК")+' · '+esc(rarity.toUpperCase())+'</span><span class="card-desc">'+esc(card.description||"")+(card.exhaust?' · Истощение':'')+(card.retain?' · Сохранение':'')+(card.ethereal?' · Эфемерная':'')+(card.innate?' · Врождённая':'')+'</span></button>';}).join("")+'</div><button type="button" class="card-reward-skip" data-card-reward-skip>ПРОПУСТИТЬ</button></section>';document.body.appendChild(overlay);}
 function showRelicAcquiredScreen(relic,source="RELIC"){
   if(!relic)return;document.querySelector(".tb-relic-acquired-overlay")?.remove();
   const rarity=String(relic.rarity||"ancient").toLowerCase(),classId=String(relic.classId||"").toLowerCase(),activeClassId=String(live()?.classId||"").toLowerCase(),art=relicIconHtml(relic),ownedClassPieces=(live()?.relics||[]).filter(id=>String(engine?.RELICS_DATABASE?.[id]?.classId||"").toLowerCase()===activeClassId).length,awakeningTier=classId&&classId===activeClassId&&ownedClassPieces>=2&&ownedClassPieces<=4?ownedClassPieces:0;
   const overlay=document.createElement("div");overlay.className="tb-relic-acquired-overlay rarity-"+esc(rarity);overlay.setAttribute("role","presentation");
   overlay.innerHTML='<section class="tb-relic-acquired-modal" role="dialog" aria-modal="true" aria-label="Получена реликвия"><div class="tb-relic-acquired-stars" aria-hidden="true">✦　✧　✦</div><span class="tb-eyebrow">'+esc(source)+'</span><div class="tb-relic-acquired-art class-'+esc(classId)+'"><i aria-hidden="true"></i>'+art+'</div><div class="tb-relic-acquired-kicker">НОВАЯ РЕЛИКВИЯ</div><h2>'+esc(relic.name||"Древний артефакт")+'</h2><span class="tb-relic-acquired-rarity">'+esc(String(relic.rarity||"ДРЕВНЯЯ").replace(/_/g," ").toUpperCase())+'</span><p>'+esc(relic.description||"Артефакт добавлен в коллекцию и будет усиливать персонажа.")+'</p><button type="button" data-relic-acquired-close'+(awakeningTier?' data-ancient-awakening="'+awakeningTier+'"':'')+'>ПРИНЯТЬ АРТЕФАКТ</button></section>';
   root.appendChild(overlay);
  }
  function showAncientSetAwakeningScreen(tier,classId){
   const tierNumber=Math.max(2,Math.min(4,Number(tier)||2));
   const classNames={assassin:"Безмолвной Охоты",bishop:"Первого Света",dragonkin:"Древнего Дракона",destroyer:"Прародителя",elemental:"Семи Истоков",duelist:"Последнего Выпада",shaman:"Корней Мира"};
   const classEffects={assassin:"Первая атакующая карта наносит двойной урон",bishop:"В начале боя дополнительно восстанавливается 8 здоровья",dragonkin:"В начале боя дополнительно появляется 8 брони",destroyer:"Атакующие карты получают ещё +2 урона",elemental:"Сила магических карт увеличивается ещё на 2",duelist:"Защитные карты дают ещё +2 брони",shaman:"В начале боя все враги получают ещё 1 слабость"};
   const stages={2:{title:"ПЕРВЫЙ РЕЗОНАНС",name:"Печать пробуждена",effect:"+1 карта в начале каждого боя"},3:{title:"ВТОРОЙ РЕЗОНАНС",name:"Сила Ордена крепнет",effect:"+6 брони в начале каждого боя"},4:{title:"ПОЛНОЕ ПРОБУЖДЕНИЕ",name:"Орден "+(classNames[classId]||"Древней Башни"),effect:classEffects[classId]||"Пробуждается истинная сила древнего комплекта"}};
   const stage=stages[tierNumber],overlay=document.createElement("div");
   overlay.className="tb-ancient-awakening-overlay tier-"+tierNumber+" class-"+esc(classId||"unknown");
   overlay.setAttribute("role","presentation");
   overlay.innerHTML='<section class="tb-ancient-awakening-modal" role="dialog" aria-modal="true" aria-label="'+esc(stage.title)+'"><div class="tb-ancient-awakening-runes" aria-hidden="true">✧　✦　✧　✦　✧</div><div class="tb-ancient-awakening-core" aria-hidden="true"><i></i><b>✦</b><span></span></div><span class="tb-ancient-awakening-kicker">ДРЕВНИЕ РЕЛИКВИИ · '+tierNumber+'/4</span><h2>'+esc(stage.title)+'</h2><strong class="tb-ancient-awakening-name">'+esc(stage.name)+'</strong><div class="tb-ancient-awakening-effect">'+esc(stage.effect)+'</div><p>'+(tierNumber===4?"Все четыре реликвии соединились. Истинная сила комплекта теперь с тобой.":"Новая ступень силы активирована. Собирай комплект дальше.")+'</p><div class="tb-ancient-awakening-progress" aria-label="'+tierNumber+' из 4 реликвий">'+[1,2,3,4].map(n=>'<i class="'+(n<=tierNumber?'is-lit':'')+'"></i>').join("")+'</div><button type="button" data-ancient-awakening-close>ПРОДОЛЖИТЬ</button></section>';
   root.appendChild(overlay);
  }
  function showRelicRewardScreen(relicIds){
  if(document.querySelector(".tb-relic-reward-overlay"))return;
  const db=engine?.RELICS_DATABASE||{},options=(Array.isArray(relicIds)?relicIds:[]).map(id=>db[id]).filter(Boolean);
  if(!options.length)return;
  const overlay=document.createElement("div");overlay.className="tb-relic-reward-overlay";overlay.setAttribute("role","presentation");
  overlay.innerHTML='<section class="tb-relic-reward-modal" role="dialog" aria-modal="true" aria-label="Выбор реликвии"><span class="tb-eyebrow">НАГРАДА ЗА БОССА</span><h2>Выбери одну реликвию</h2><p>Выбранный артефакт навсегда останется у персонажа и будет усиливать карточные бои.</p><div class="tb-relic-reward-grid">'+options.map(relic=>'<button type="button" class="tb-relic-reward-card" data-relic-reward-pick="'+esc(relic.id)+'"><span>'+relicIconHtml(relic)+'</span><b>'+esc(relic.name)+'</b><small>'+esc(relic.description)+'</small><strong>ВЫБРАТЬ</strong></button>').join("")+'</div></section>';
  document.body.appendChild(overlay);
 }
 function unlockedCardIds(){const account=engine?.state?.account;if(!account)return[];if(!Array.isArray(account.unlockedCards))account.unlockedCards=[];["strike","defend","dash"].forEach(id=>{if(CARD_DATABASE[id]&&!account.unlockedCards.includes(id))account.unlockedCards.push(id);});(engine?.state?.characters||[]).forEach(character=>{if(!Array.isArray(character.unlockedCards))character.unlockedCards=[];character.unlockedCards.forEach(id=>{if(CARD_DATABASE[id]&&!account.unlockedCards.includes(id))account.unlockedCards.push(id);});});return account.unlockedCards;}
 function unlockCardPermanently(cardId){if(!CARD_DATABASE[cardId])return false;const unlocked=unlockedCardIds();if(!unlocked.includes(cardId))unlocked.push(cardId);return true;}
 function renderStarterDeckModal(){
  const c=live();if(!c)return;
  document.querySelector(".tb-starter-deck-overlay")?.remove();
  const unlocked=new Set(unlockedCardIds()),rarityOrder={common:0,rare:1,epic:2,legendary:3};
  const available=Object.values(CARD_DATABASE).filter(card=>unlocked.has(card.id)&&!["strike","defend","dash"].includes(card.id)&&card.type!=="curse"&&!card.effects?.unplayable).sort((a,b)=>(rarityOrder[a.rarity]??0)-(rarityOrder[b.rarity]??0)||a.name.localeCompare(b.name,"ru"));
  const options=available.length?available.map(card=>{
   const selected=starterDeckSelection.includes(card.id),disabled=starterDeckSelection.length>=3&&!selected;
   const cost=card.costX?"X":Number(card.cost)||0,type=card.type||"skill";
   return '<button type="button" class="tb-starter-card-choice '+(selected?"is-selected":"")+'" data-starter-card="'+esc(card.id)+'" aria-pressed="'+selected+'" '+(disabled?"disabled":"")+'><span class="tb-starter-choice-cost">'+cost+'</span><b>'+esc(card.name)+'</b><small>'+esc(({attack:"АТАКА",defense:"ЗАЩИТА",skill:"НАВЫК",power:"СИЛА"})[type]||"НАВЫК")+' · '+esc(String(card.rarity||"common").toUpperCase())+'</small><span>'+esc(card.description||"")+'</span></button>';
  }).join(""):'<p class="tb-starter-empty">Базовая колода уже готова. Можно сразу начать забег; новые карты появятся в наградах после боя.</p>';
  const overlay=document.createElement("div");overlay.className="tb-starter-deck-overlay";overlay.setAttribute("role","presentation");
  overlay.innerHTML='<section class="tb-starter-deck-modal" role="dialog" aria-modal="true" aria-label="Сбор колоды"><div class="tb-eyebrow">ПОДГОТОВКА К ЗАБЕГУ</div><h2>Сбор колоды</h2><p class="tb-starter-intro">Базовые карты войдут в колоду автоматически. Добавь до трёх карт из своей постоянной коллекции.</p><div class="tb-starter-base-grid"><article><b>Удар ×5</b><small>1 энергия · 6 урона</small></article><article><b>Защита ×4</b><small>1 энергия · 5 брони</small></article><article><b>Рывок ×1</b><small>0 энергии · 3 брони и добор</small></article></div><div class="tb-starter-choice-head"><b>ОТКРЫТЫЕ КАРТЫ</b><strong>'+starterDeckSelection.length+' / 3</strong></div><div class="tb-starter-choice-grid">'+options+'</div><div class="tb-starter-deck-actions"><button type="button" data-starter-deck-cancel>ОТМЕНА</button><button type="button" class="tb-primary" data-starter-deck-confirm>'+(starterDeckSelection.length?"НАЧАТЬ ЗАБЕГ":"НАЧАТЬ С БАЗОВОЙ КОЛОДОЙ")+'</button></div></section>';
  root.appendChild(overlay);
 }
 function showStarterDeckModal(){starterDeckSelection=[];renderStarterDeckModal();}
 function prepareStarterDeck(c,cardIds){
  const choices=[...new Set((Array.isArray(cardIds)?cardIds:[]).filter(id=>!["strike","defend","dash"].includes(id)&&unlockedCardIds().includes(id)&&CARD_DATABASE[id]&&CARD_DATABASE[id].type!=="curse"&&!CARD_DATABASE[id].effects?.unplayable))].slice(0,3);
  c.run.starterCardChoices=choices;
  c.deck=makeStarterDeck(c.classId,choices);c.hand=[];c.discard=[];c.exhaustPile=[];c.cardDeckVersion=3;
  c.energy=Math.max(1,Math.min(6,Number(c.energy)||3));c.currentEnergy=c.energy;
 }
 function confirmStarterDeck(){
  const c=live();if(!c)return;
  prepareStarterDeck(c,starterDeckSelection);
  document.querySelector(".tb-starter-deck-overlay")?.remove();
  starterDeckSelection=[];save();if(pendingSkipStage){selectedStage=pendingSkipStage;beginStage();}else if(eventTypeForStage(c,selectedStage)&&!c.run.completedMapEvents?.includes(Number(selectedStage)))showMapEventOverlay();else beginStage();
 }
  function skipCardReward(){document.querySelector(".card-reward-overlay")?.remove();const c=live();if(c){c.pendingCardReward=null;save();}render();}

 function cardDefinition(id){return CARD_DATABASE[id]||null;}
 function createCardInstance(id){const d=cardDefinition(id);return d?{...d,effects:{...d.effects},isUpgraded:false,...(Number.isFinite(Number(d.magicNumber))?{magicNumber:Number(d.magicNumber)}:{}),instanceId:id+"-"+gameRandom().toString(36).slice(2)}:null;}
 function inferredEquipmentCardId(item,character){
  if(item?.cardId&&CARD_DATABASE[item.cardId])return item.cardId;
  const slot=Number.isInteger(item?.slot)?(["weapon","chest","head","legs","hands","accessory"][item.slot]||""):String(item?.slot||"");
  const label=[item?.name,item?.weaponType,item?.armorType].filter(Boolean).join(" ").toLowerCase();
  if(slot==="weapon")return item?.weaponType==="staff"||/посох|жезл|staff|wand/.test(label)||Number(item?.stats?.spellPower)>0||(!item?.weaponType&&["bishop","elemental","shaman"].includes(character?.classId))?"gear_staff_bolt":"gear_sword_cleave";
  if(["chest","head","legs","hands"].includes(slot))return item?.armorType==="mantle"||/мантия|robe|mantle|одеяни/.test(label)||(!item?.armorType&&["bishop","dragonkin","elemental","shaman"].includes(character?.classId))?"gear_evasion":"gear_iron_wall";
  if(slot==="accessory")return "gear_power_surge";
  return null;
 }
 function syncEquipmentCards(character){
  if(!character)return{added:0,removed:0};
  ensureCardDeck(character);
  const piles=["deck","hand","discard","exhaustPile"],equipped=(character.gear||[]).filter(item=>item&&item.type!=="cosmetic"),byId=new Map();
  for(const item of equipped){item.cardId=item.cardId||inferredEquipmentCardId(item,character);if(item.cardId&&CARD_DATABASE[item.cardId])byId.set(String(item.id),item);}
  let removed=0,added=0;
  for(const pile of piles){
   const before=character[pile].length;
   character[pile]=character[pile].filter(card=>{
    if(card?.sourceType!=="equipment")return true;
    const item=byId.get(String(card.sourceItemId));
    return !!item&&card.id===item.cardId;
   });
   removed+=before-character[pile].length;
  }
  for(const item of equipped){
   if(!item.cardId||!CARD_DATABASE[item.cardId])continue;
   const exists=piles.some(pile=>character[pile].some(card=>card?.sourceType==="equipment"&&String(card.sourceItemId)===String(item.id)&&card.id===item.cardId));
   if(exists)continue;
   const card=createCardInstance(item.cardId);
   if(!card)continue;
   card.sourceType="equipment";card.sourceItemId=item.id;character.deck.push(card);added++;
  }
  return{added,removed};
 }
 function upgradeCardInstance(card){if(!card||card.isUpgraded)return false;card.isUpgraded=true;card.effects={...(card.upgradedEffects||card.effects)};if(card.upgradedDescription)card.description=card.upgradedDescription;if(card.upgradedExhaust)card.exhaust=true;return true;}
 function addCardToDeck(c,id){if(!c)return false;ensureCardDeck(c);const card=createCardInstance(id);if(!card)return false;c.deck.push(card);return true;}

 function grantSpecializationCards(character,branchId){
  if(!character)return 0;
  if(!Array.isArray(character.unlockedCards))character.unlockedCards=[];
  const definitions=Object.values(CARD_DATABASE).filter(card=>card.classId===character.classId&&card.branchId===branchId);
  let added=0;
  for(const definition of definitions)if(!character.unlockedCards.includes(definition.id))character.unlockedCards.push(definition.id);
  for(const definition of definitions.filter(card=>card.starter).slice(0,2))if(![...character.deck,...character.hand,...character.discard,...character.exhaustPile].some(card=>card.id===definition.id)&&addCardToDeck(character,definition.id))added++;
  return added;
 }
 function upgradeCardInDeck(c,instanceId){if(!c)return false;ensureCardDeck(c);const card=[...c.deck,...c.hand,...c.discard,...c.exhaustPile].find(item=>item.instanceId===instanceId);return upgradeCardInstance(card);}
 function collectDeckCards(character){
  if(!character)return[];
  ensureCardDeck(character);
  const piles=["deck","hand","discard","exhaustPile"],seen=new Set(),entries=[];
  for(const pile of piles)(character[pile]||[]).forEach((card,index)=>{
   if(!card)return;
   const key=String(card.instanceId||card.id||pile+"-"+index);
   if(seen.has(key))return;
   seen.add(key);entries.push({card,pile,key});
  });
  return entries;
 }
 function campCardUpgrade(card){
  const definition=CARD_DATABASE[card?.id]||{},baseEffects=card?.effects||definition.effects||{};
  const configured=card?.upgradedEffects||definition.upgradedEffects;
  const hasConfigured=!!configured&&Object.keys(configured).length>0;
  const effects=hasConfigured?JSON.parse(JSON.stringify(configured)):JSON.parse(JSON.stringify(baseEffects));
  const percentKeys=new Set(["damage","damageAll","damagePerEnergy","damagePerPoison","damagePerBleed","damageMissingHp","block","shield","heal","healPerBleed","bonusDamageIfBlock","nextAttackDamage","spellPower"]);
  const additiveKeys=new Set(["poison","bleed","burn","conditionalBleed","weak","vulnerable","draw","energy","hits","nextCardCostReduction"]);
  const labels={damage:"урона",damageAll:"массового урона",damagePerEnergy:"урона за энергию",damagePerPoison:"урона за заряд яда",damagePerBleed:"урона за кровотечение",damageMissingHp:"урона за недостающее HP",block:"брони",shield:"щита",heal:"лечения",healPerBleed:"лечения за кровотечение",bonusDamageIfBlock:"условного урона",nextAttackDamage:"урона следующей атаки",spellPower:"силы магии",poison:"яда",bleed:"кровотечения",burn:"горения",conditionalBleed:"кровотечения при отравлении",weak:"слабости",vulnerable:"уязвимости",draw:"карты к добору",energy:"энергии",hits:"удара",nextCardCostReduction:"снижения стоимости следующей карты"};
  const changes=[];
  if(!hasConfigured){
   for(const key of Object.keys(effects)){
    const value=Number(effects[key]);if(!Number.isFinite(value)||value<=0)continue;
    let next=value;
    if(percentKeys.has(key))next=key==="fury"?Number((value*1.25).toFixed(2)):Math.max(value+1,Math.ceil(value*1.25));
    else if(additiveKeys.has(key))next=value+1;
    else if(key==="fury")next=Number((value*1.25).toFixed(2));
    if(next>value){effects[key]=next;const delta=Number((next-value).toFixed(2));changes.push({key,delta});}
   }
  }
  const baseGenerated=card?.generateCards||definition.generateCards;
  const configuredGenerated=card?.upgradedGenerateCards||definition.upgradedGenerateCards;
  const generateCards=Array.isArray(configuredGenerated)?JSON.parse(JSON.stringify(configuredGenerated)):Array.isArray(baseGenerated)?JSON.parse(JSON.stringify(baseGenerated)):null;
  if(generateCards&&!Array.isArray(configuredGenerated)){
   for(let i=0;i<generateCards.length;i++){
    const baseCount=Math.max(0,Number(baseGenerated?.[i]?.count)||0);
    if(baseCount>0){generateCards[i].count=baseCount+1;changes.push({key:"generatedCards",delta:1});}
   }
  }
  const changeLabels=changes.map(change=>change.key==="fury"?"+"+Math.round(change.delta*10)+"% к урону":change.key==="generatedCards"?"+1 создаваемая карта":"+"+change.delta+" "+(labels[change.key]||change.key));
  const baseDescription=card?.description||definition.description||card?.name||"Карта";
  const description=card?.upgradedDescription||definition.upgradedDescription||(baseDescription+" · Улучшено"+(changeLabels.length?": "+changeLabels.join(", "):""));
  return{effects,description,generateCards};
 }
 function renderCampStopOverlay(stage,view){
  const c=live();if(!c||!engine.canUseCampStop(c.id,stage)){document.querySelector(".tb-camp-overlay")?.remove();return;}
  campStopStage=Number(stage);document.querySelector(".tb-camp-overlay")?.remove();
  const overlay=document.createElement("div");overlay.className="tb-camp-overlay";overlay.dataset.campStage=String(stage);
  const allCards=collectDeckCards(c),cards=allCards.filter(entry=>!entry.card.isUpgraded&&!["curse","status"].includes(entry.card.type));
  if(view==="remove"){
   const removeMarkup=allCards.map(entry=>{const card=entry.card;return '<button type="button" class="tb-camp-upgrade-card v2-card '+esc(card.type||"skill")+' rarity-'+esc(card.rarity||"common")+'" data-camp-remove="'+esc(entry.key)+'"><span class="card-cost">'+((card.isXCost||card.costX)?"X":Number(card.cost)||0)+'</span><b class="card-name">'+esc(card.name||card.id)+'</b><small class="card-desc">'+esc(card.description||"")+'</small><span class="tb-camp-card-source">'+esc(({deck:"Колода",hand:"Рука",discard:"Сброс",exhaustPile:"Истощение"})[entry.pile]||"Колода")+'</span></button>';}).join("");
   overlay.innerHTML='<section class="tb-camp-modal tb-camp-forge" role="dialog" aria-modal="true" aria-label="Удаление карты"><div class="tb-camp-eyebrow">ПРИВАЛ · ЭТАП '+stage+'</div><h2>Удалить карту</h2><p>Выбери карту для удаления из этого забега. Стоимость: 50 серебра · У тебя: '+Math.max(0,Number(c.silver)||0)+'</p><div class="tb-camp-card-grid">'+(removeMarkup||'<p class="tb-camp-empty">В колоде нет карт.</p>')+'</div><div class="tb-camp-actions"><button type="button" data-camp-back>НАЗАД</button><button type="button" data-camp-close>ЗАКРЫТЬ</button></div></section>';
  }else if(view==="forge"){
   const groups=[["attack","АТАКА"],["defense","ЗАЩИТА"],["skill","НАВЫКИ"],["power","СИЛЫ"]];
   const cardsMarkup=groups.map(([type,label])=>{
    const items=cards.filter(entry=>(entry.card.type||"skill")===type);
    return items.length?'<section class="tb-camp-card-group"><h4>'+label+' · '+items.length+'</h4><div class="tb-camp-card-grid">'+items.map(entry=>{
     const card=entry.card,cost=card.costX?"X":Number(card.cost)||0;
     return '<button type="button" class="tb-camp-upgrade-card v2-card '+esc(card.type||"skill")+' rarity-'+esc(card.rarity||"common")+'" data-camp-upgrade="'+esc(entry.key)+'"><span class="card-cost">'+cost+'</span><b class="card-name">'+esc(card.name||card.id)+'</b><small class="card-desc">'+esc(card.description||"")+'</small><span class="tb-camp-card-source">'+esc(({deck:"Колода",hand:"Рука",discard:"Сброс",exhaustPile:"Истощение"})[entry.pile]||"Колода")+'</span></button>';
    }).join("")+'</div></section>':'';
   }).join("");
   overlay.innerHTML='<section class="tb-camp-modal tb-camp-forge" role="dialog" aria-modal="true" aria-label="Кузница"><div class="tb-camp-eyebrow">ПРИВАЛ · ЭТАП '+stage+'</div><h2>Кузница карт</h2><p>Выбери одну неулучшенную карту. Её описание и боевые эффекты станут сильнее.</p>'+(cardsMarkup||'<p class="tb-camp-empty">Нет карт, которые можно улучшить. Карты проклятий и статусов не улучшаются.</p>')+'<div class="tb-camp-actions"><button type="button" data-camp-back>НАЗАД</button><button type="button" data-camp-close>ЗАКРЫТЬ</button></div></section>';
  }else{
   overlay.innerHTML='<section class="tb-camp-modal" role="dialog" aria-modal="true" aria-label="Привал"><div class="tb-camp-eyebrow">БЕЗОПАСНОЕ МЕСТО · ЭТАП '+stage+'</div><h2>Привал</h2><p>Перед следующим этапом можно восстановить силы или подготовить одну карту к будущим сражениям.</p><div class="tb-camp-options"><button type="button" class="tb-camp-option" data-camp-rest><span>🔥</span><b>Отдохнуть</b><small>Восстановить 30% максимального HP</small></button><button type="button" class="tb-camp-option" data-camp-forge><span>⚒</span><b>Кузница</b><small>Улучшить одну карту в колоде</small></button><button type="button" class="tb-camp-option" data-camp-remove-open><span>🗑</span><b>Удалить карту</b><small>Удалить навсегда · 50 серебра</small></button></div><div class="tb-camp-actions"><button type="button" data-camp-close>ПОЗЖЕ</button></div></section>';
  }
  document.body.appendChild(overlay);
 }
 function showDeckViewer(){
  const c=live();if(!c)return;
  const entries=collectDeckCards(c),typeLabels={attack:"АТАКА",defense:"ЗАЩИТА",skill:"НАВЫКИ",power:"СИЛЫ",curse:"ПРОКЛЯТИЯ",status:"СТАТУСЫ"},order=["attack","defense","skill","power","curse","status"];
  const groups=order.map(type=>{
   const cards=entries.filter(entry=>(entry.card.type||"skill")===type);if(!cards.length)return"";
   return '<section class="tb-deck-group"><h3>'+typeLabels[type]+' <span>'+cards.length+'</span></h3><div class="tb-deck-grid">'+cards.map(entry=>{
    const card=entry.card,cost=card.costX?"X":Number(card.cost)||0;
    return '<article class="tb-deck-card v2-card '+esc(card.type||"skill")+' rarity-'+esc(card.rarity||"common")+(card.isUpgraded?" is-upgraded":"")+'"><span class="card-cost">'+cost+'</span><b class="card-name">'+esc(card.name||card.id)+(card.isUpgraded?' <i class="tb-card-upgrade-mark">+</i>':"")+'</b><small class="card-desc">'+esc(card.description||"")+'</small><span class="tb-deck-card-pile">'+esc(({deck:"Добор",hand:"Рука",discard:"Сброс",exhaustPile:"Истощение"})[entry.pile]||"Колода")+'</span></article>';
   }).join("")+'</div></section>';
  }).join("");
  document.querySelector(".tb-deck-viewer-overlay")?.remove();
  const overlay=document.createElement("div");overlay.className="tb-deck-viewer-overlay";
  overlay.innerHTML='<section class="tb-deck-viewer-modal" role="dialog" aria-modal="true" aria-label="Текущая колода"><header><div><span class="tb-camp-eyebrow">БОЕВАЯ БИБЛИОТЕКА</span><h2>Колода · '+entries.length+' карт</h2><p>Добор '+c.deck.length+' · Рука '+c.hand.length+' · Сброс '+c.discard.length+' · Истощение '+c.exhaustPile.length+'</p></div><button type="button" class="tb-deck-viewer-close" data-deck-viewer-close aria-label="Закрыть">×</button></header>'+(groups||'<p class="tb-camp-empty">Колода пуста.</p>')+'<footer><button type="button" data-deck-viewer-close>ЗАКРЫТЬ</button></footer></section>';
  document.body.appendChild(overlay);
 }
  function cardEffects(card){const source=card?.isUpgraded?(card.upgradedEffects||card.effects||{}):(card.effects||{}),effects={...source};if(Number.isFinite(Number(card?.magicNumber))&&Number(card?.magicNumber)!==0){if(Number(effects.damage)>0)effects.damage=Number(effects.damage)+Number(card.magicNumber);if(Number(effects.block)>0)effects.block=Number(effects.block)+Number(card.magicNumber);}return effects;}
 function applyTreeCardBonuses(card,effects,cache){
  if(!card||!effects||!cache)return effects;
  const id=String(card.id||"");
  const mappings=[
   ["cardDamage_","damage"],["cardBleed_","bleed"],["cardPoison_","poison"],["cardBurn_","burn"],
   ["cardWeak_","weak"],["cardVulnerable_","vulnerable"],["cardBlock_","block"],["cardHeal_","heal"],
   ["cardDraw_","draw"],["cardFury_","fury"],["cardSpellPower_","spellPower"],["cardNextAttackDamage_","nextAttackDamage"],
   ["cardDamagePerPoison_","damagePerPoison"],["cardDamagePerBleed_","damagePerBleed"],["cardHealPerBleed_","healPerBleed"],
   ["cardEnergy_","energy"]
  ];
  for(const [prefix,property] of mappings){const amount=Number(cache[prefix+id])||0;if(amount)effects[property]=(Number(effects[property])||0)+amount;}
  const percent=Math.max(0,Number(cache["cardDamagePercent_"+id])||0);
  if(percent){for(const property of ["damage","damageAll","damagePerEnergy","damagePerPoison","damagePerBleed","damageMissingHp"])if(Number(effects[property])>0)effects[property]=Number(effects[property])*(1+percent);}
  return effects;
 }
 function treeCardBonusDescription(card,cache){
  if(!card||!cache)return "";
  const id=String(card.id||""),labels=[["cardDamagePercent_","урона","%"],["cardDamage_","урона",""],["cardBleed_","кровотечения",""],["cardPoison_","яда",""],["cardBurn_","горения",""],["cardWeak_","слабости",""],["cardVulnerable_","уязвимости",""],["cardBlock_","брони",""],["cardHeal_","лечения",""],["cardDraw_","добора карт",""],["cardFury_","ярости",""],["cardSpellPower_","силы магии",""],["cardNextAttackDamage_","к следующей атаке",""],["cardDamagePerPoison_","урона за яд",""],["cardDamagePerBleed_","урона за кровотечение",""],["cardHealPerBleed_","лечения за кровотечение",""],["cardEnergy_","энергии",""]];
  const parts=[];
  for(const [prefix,label,unit] of labels){const value=Number(cache[prefix+id])||0;if(!value)continue;const shown=unit==="%"?Math.round(value*100):Math.round(value);parts.push("+"+shown+(unit==="%"?"% ":" ")+label);}
  return parts.join(" · ");
 }

 function makeStarterDeck(classId,extraIds){const activeClass=classId||selectedClass,lists={assassin:["strike","strike","strike","defend","defend","dash","assassin_poison_blade","assassin_bleed","assassin_shadow","precise_shot"],bishop:["strike","strike","defend","defend","defend","dash","dash","bishop_prayer","bishop_divine_shield","bishop_smite"],dragonkin:["strike","strike","defend","defend","defend","dash","dash","dragonkin_flame","dragonkin_frost","rampage"],destroyer:["strike","strike","strike","strike","defend","defend","dash","destroyer_crush","destroyer_warcry","heavy_blow"],elemental:["strike","strike","defend","defend","dash","dash","elemental_chain","elemental_storm","elemental_meditation","inspiration"],duelist:["strike","strike","strike","strike","defend","defend","dash","duelist_parry","duelist_riposte","backstab"],shaman:["strike","strike","defend","defend","defend","dash","dash","shaman_totem","shaman_spirit","shaman_nature"]},ids=(lists[activeClass]||lists.assassin).slice(),extras=[];(extraIds||[]).forEach(id=>{const card=createCardInstance(id);if(card)extras.push(card);});ids.splice(Math.max(0,ids.length-extras.length),extras.length);return ids.map(createCardInstance).filter(Boolean).concat(extras);}
 function ensureCardDeck(c){if(!c)return;if(!Array.isArray(c.deck))c.deck=[];if(!Array.isArray(c.hand))c.hand=[];if(!Array.isArray(c.discard))c.discard=[];if(!Array.isArray(c.exhaustPile))c.exhaustPile=[];if(!Array.isArray(c.cardArchive))c.cardArchive=[];c.energy=Math.max(1,Math.min(6,Number(c.energy)||3));c.currentEnergy=Math.max(0,Math.min(c.energy,Number.isFinite(Number(c.currentEnergy))?Number(c.currentEnergy):c.energy));if(c.cardDeckVersion!==3){if(c.deck.length+c.hand.length+c.discard.length===0)c.deck=makeStarterDeck(c.classId,c.run?.starterCardChoices||[]);else{[...c.deck,...c.hand,...c.discard].forEach(card=>{const d=CARD_DATABASE[card?.id];if(d){Object.assign(card,d,{instanceId:card.instanceId||d.id+"-"+gameRandom().toString(36).slice(2),isUpgraded:!!card.isUpgraded,effects:{...(card.isUpgraded?(d.upgradedEffects||d.effects):d.effects)}});if(card.isUpgraded)card.description=d.upgradedDescription||d.description;}});}const classIds=({assassin:["assassin_poison_blade","assassin_bleed"],bishop:["bishop_prayer","bishop_divine_shield"],dragonkin:["dragonkin_flame","dragonkin_frost"],destroyer:["destroyer_crush","destroyer_warcry"],elemental:["elemental_chain","elemental_storm"],duelist:["duelist_parry","duelist_riposte"],shaman:["shaman_totem","shaman_spirit"]})[c.classId]||[];for(const id of classIds){if(![...c.deck,...c.hand,...c.discard].some(card=>card.id===id))c.deck.push(createCardInstance(id));}c.cardDeckVersion=3;}if(c.deck.length+c.hand.length+c.discard.length+c.exhaustPile.length===0){c.deck=makeStarterDeck(c.classId,c.run?.starterCardChoices||[]);c.cardDeckVersion=3;}const cardRefs=new Set();for(const pile of ["deck","hand","discard","exhaustPile"])for(const card of c[pile])if(card&&typeof card==="object"){if(cardRefs.has(card))continue;cardRefs.add(card);if(!card.instanceId)card.instanceId=String(card.id||"card")+"-"+gameRandom().toString(36).slice(2)+"-"+cardRefs.size;}}
 function shuffleCards(cards){const result=cards.slice();for(let i=result.length-1;i>0;i--){const j=Math.floor(gameRandom()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
 function resetCardBattle(c){ensureCardDeck(c);const combined=[...(c.deck||[]),...(c.hand||[]),...(c.discard||[]),...(c.exhaustPile||[])],seenObjects=new Set(),cards=[];for(const card of combined){if(!card||typeof card!=="object"||seenObjects.has(card))continue;seenObjects.add(card);if(!card.instanceId)card.instanceId=String(card.id||"card")+"-"+gameRandom().toString(36).slice(2)+"-"+cards.length;cards.push(card);}c.deck=shuffleCards(cards.length?cards:makeStarterDeck(c.classId,c.run?.starterCardChoices||[]));c.hand=[];c.discard=[];c.exhaustPile=[];c.currentEnergy=c.energy;}
 function cardDrawBonus(character){const branch=(classData(character).branches||[]).find(item=>item.id===character.branch);const ranks=(branch?.talents||[]).filter(item=>item.effect_template==="card_draw").reduce((sum,item)=>sum+(Number(character.talents?.[item.id])||0),0);return Math.floor(ranks/3);}
 function drawCards(amount){const c=live();if(!c)return 0;ensureCardDeck(c);let drawn=0;const count=Math.max(0,Math.floor(Number(amount)||0));for(let n=0;n<count;n++){if(c.hand.length>=10){if(!c.deck.length&&c.discard.length){c.deck=shuffleCards(c.discard);c.discard=[];}if(c.deck.length)c.discard.push(c.deck.shift());continue;}if(!c.deck.length&&c.discard.length){c.deck=shuffleCards(c.discard);c.discard=[];}if(!c.deck.length)break;c.hand.push(c.deck.shift());drawn++;}return drawn;}
 function logExpeditionEvent(message,color){
  const c=live();if(!c?.run)return;
  c.run.expeditionLog=Array.isArray(c.run.expeditionLog)?c.run.expeditionLog:[];
  c.run.expeditionLog.push({text:String(message||""),color:String(color||"#d9d2c5"),time:Date.now()});
  if(c.run.expeditionLog.length>40)c.run.expeditionLog.splice(0,c.run.expeditionLog.length-40);
 }
 function logCombatEvent(message,color){
  if(!battle)return;
  battle.combatLog=Array.isArray(battle.combatLog)?battle.combatLog:[];
  const entry={text:String(message||""),color:String(color||"#d9d2c5"),time:Date.now()};
  battle.combatLog.push(entry);if(battle.combatLog.length>20)battle.combatLog.splice(0,battle.combatLog.length-20);
  logExpeditionEvent(entry.text,entry.color);
  const box=root.querySelector("#tbCombatLogList"),entries=(live()?.run?.expeditionLog||battle.combatLog).slice(-20);
  if(box){box.innerHTML=entries.map(item=>'<div class="tb-combat-log-entry" style="color:'+esc(item.color)+'">'+esc(item.text)+'</div>').join("");box.scrollLeft=box.scrollWidth;box.scrollTop=box.scrollHeight;}
 }
 function combatLogMarkup(){const history=live()?.run?.expeditionLog||battle?.combatLog||[],entries=history.slice(-20);return '<details class="tb-combat-log v2-combat-log" open><summary>📜 ЖУРНАЛ ЭКСПЕДИЦИИ <span>'+history.length+'/40</span></summary><div class="tb-combat-log-list" id="tbCombatLogList">'+entries.map(entry=>'<div class="tb-combat-log-entry" style="color:'+esc(entry.color)+'">'+esc(entry.text)+'</div>').join("")+'</div></details>';}
  function renderHand(){const c=live();if(!c)return "";ensureCardDeck(c);const handTreeCache=rebuildTreeCache(c);return c.hand.map((card,index)=>{const cost=(card.isXCost||card.costX)?"X":Math.max(0,(Number(card.cost)||0)-(live()?.run?.dailyChallengeActive&&live()?.run?.dailyChallengeModifier==="blood"?1:0)),displayEffects=applyTreeCardBonuses(card,cardEffects(card),handTreeCache),talentCardBonus=treeCardBonusDescription(card,handTreeCache),previewTarget=(battle?.enemies||[]).find(enemy=>enemy.index===battle?.targetIndex&&enemy.alive&&enemy.hp>0),refineAttack=Math.max(0,Number((c.gear||[]).find(item=>item&&(item.slot==="weapon"||item.slot===0))?.refine)||0),refineArmor=(c.gear||[]).filter(item=>item&&["chest","head","legs","hands",1,2,3,4].includes(item.slot)).reduce((sum,item)=>sum+Math.max(0,Number(item.refine)||0),0),previewDamage=previewTarget&&isAttackCard(card,displayEffects)?cardPreviewDamage(card,previewTarget):0,previewBlock=Number(displayEffects.block)>0?Math.round(Number(displayEffects.block)*(1+Math.max(0,Number(engine.getCombatStats(c).defense)||0)/100)+refineArmor*3+getCardBlockTalentBonus(c)+Math.max(0,Number(battle?.relicBlockBonus)||0)):0,dynamicDescription=Number.isFinite(Number(card.magicNumber))&&Number(card.magicNumber)!==0?String(card.description||"").replace(/\d+(?=\s+урона|\s+брони)/i,String(Number(displayEffects.damage)||Number(displayEffects.block)||0)):(card.description||""),lockedType=(card.type==="curse"||card.type==="status")&&card.id!=="status_slime",freeTotemReady=c.classId==="shaman"&&battle?.shamanFreeMode&&Number(c.totem)>=3,disabled=lockedType||cardEffects(card).unplayable||battle?.actor?.type!=="player"||battle?.busy||battle?.paused||(!battle?.guildRaid&&!freeTotemReady&&!(card.isXCost||card.costX)&&Number(c.currentEnergy)<Number(cost)),type=card.type||"skill",rarity=card.rarity||"common",image=card.image||CARD_ART_ROOT+(ART_MAPPING[card.id]||"strike.png");return '<button type="button" class="v2-card '+esc(type)+' rarity-'+esc(rarity)+(disabled?' is-disabled':'')+(card.isUpgraded?' is-upgraded':'')+'" data-card-play="'+index+'" data-card-type="'+esc(type)+'" '+(Number(displayEffects.block)>0?'data-card-block="true" ':'')+(disabled?'disabled':'')+' aria-label="'+esc(card.name)+', '+cost+' энергии. '+esc(card.description||'')+'"><span class="card-cost">'+cost+'</span><span class="card-img-wrapper"><img src="'+esc(image)+'" class="card-image" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'./assets/cards/strike.png\'"></span><span class="card-name">'+esc(card.name)+(card.isUpgraded?' <b class="tb-card-upgrade-mark">+</b>':'')+'</span><span class="card-desc">'+esc(dynamicDescription)+(talentCardBonus?" · "+esc(talentCardBonus):"")+(previewDamage>0?(" · Урон сейчас: "+previewDamage+(refineAttack>0?" (заточка +"+(refineAttack*2)+")":"")):"")+(previewBlock>0?(" · Броня сейчас: "+previewBlock+(refineArmor>0?" (заточка +"+(refineArmor*3)+")":"")):"")+(card.exhaust?' · Истощение':'')+(card.retain?' · Сохранение':'')+(card.ethereal?' · Эфемерная':'')+(card.innate?' · Врождённая':'')+'</span></button>';}).join("");}

 function cardPreviewDamage(card,target){
  if(!card||!target||!target.alive||target.hp<=0)return 0;
  const c=live(),effects=previewCardEffects(card,c,target),stats=engine.getCombatStats(c),scale=Math.max(.1,Number(stats.damageMultiplier)||1),isXCost=!!(card.isXCost||card.costX),energy=c.classId==="shaman"&&battle.shamanFreeMode&&Number(c.totem)>=3?0:c.run.dailyChallengeActive&&c.run.dailyChallengeModifier==="blood"?Math.max(0,(isXCost?c.currentEnergy:Math.max(0,Number(card.cost)||0))-1):(isXCost?c.currentEnergy:Math.max(0,Number(card.cost)||0));
  const total=getCardDamageWithTalents(card,c,energy,effects)+Math.max(0,Number(effects.damagePerPoison)||0)*(Number(target.poison)||0)+Math.max(0,Number(effects.damagePerBleed)||0)*(Number(target.bleed)||0)+Math.max(0,Number(effects.damageMissingHp)||0)*Math.max(0,engine.maxHp(c)-Number(c.run.playerHp||0));
  if(total<=0)return 0;
  const attackCard=isAttackCard(card,effects),magicCard=isMagicCard(card,effects),finisher=!!(card.finisher||effects.finisher||(Array.isArray(card.tags)&&card.tags.includes("finisher")));
  const weaponRefine=Math.max(0,Number((c.gear||[]).find(item=>item&&(item.slot==="weapon"||item.slot===0))?.refine)||0),refineBonus=attackCard?weaponRefine*2:0;
  const weakScale=Number(battle.playerWeakTurns)>0?.75:1,furyScale=Number(battle.playerDamageBuffTurns)>0?1+Math.max(0,Number(battle.playerDamageBuff)||0):1,firstAttackScale=battle.firstAttackDouble?2:1;
  let classMultiplier=1,classFlat=0;
  if(c.classId==="destroyer")classFlat=Math.max(0,Number(c.rage)||0);
  if(c.classId==="bishop"&&attackCard)classFlat+=Math.max(0,Number(c.faith)||0)*3;
  if(c.classId==="assassin"&&attackCard&&Number(c.combo)>0)classMultiplier*=1+Math.min(3,Number(c.combo)||0)*.5;
  if(c.classId==="duelist"&&attackCard&&finisher&&Number(c.charges)>=3)classMultiplier*=3;
  if(c.classId==="elemental"&&magicCard&&Number(c.magicCharge)>0)classMultiplier*=1+Math.min(10,Number(c.magicCharge)||0)*.1;
  const raw=Math.max(1,Math.round((total+refineBonus+classFlat)*(1+Math.max(0,Number(stats.attack)||0)/100)*scale*weakScale*furyScale*classMultiplier*firstAttackScale)),type=effects.damageType||card.damageType||"physical";
  const mult=engine.damageTypeMultiplier(target,type);
  let remainingHp=Math.max(0,Number(target.hp)||0),remainingShield=Math.max(0,Number(target.shield)||0),guardCharges=Math.max(0,Number(target.guardCharges)||0),used=Number(battle.actionDamageLedger?.[target.index])||0,totalDamage=0;
  const hits=Math.max(1,Math.floor(Number(effects.hits)||1));
  for(let hit=0;hit<hits&&remainingHp>0;hit++){
   let hitMultiplier=mult;
   if(!effects.ignoreArmor&&target.role==="tank"&&guardCharges>0){hitMultiplier*=1-(balance.mobs.roles.tank.shield_fraction||.3);guardCharges--;}
   let hitDamage=Math.max(0,Math.round(raw*hitMultiplier*(Number(target.vulnerable)>0?1.5:1)));
   if(target.type==="boss")hitDamage=engine.capBossDamage(target,hitDamage,used);
   const absorbed=Math.min(remainingShield,hitDamage);remainingShield-=absorbed;hitDamage-=absorbed;
   const dealt=Math.min(remainingHp,hitDamage);remainingHp-=dealt;totalDamage+=dealt;
   if(target.type==="boss")used+=dealt;
  }
  return totalDamage;
 }
 function showStatusTooltip(status,value){const copy={poison:"Яд: в начале хода теряет HP, равное стакам. Уменьшается на 1 каждый ход.",bleed:"Кровотечение: в начале хода теряет HP, равное стакам. Уменьшается на 1 каждый ход.",burn:"Горение: в конце хода игрока наносит урон, затем снимается.",weak:"Слабость: наносит на 25% меньше урона. Длительность уменьшается в конце хода.",vulnerable:"Уязвимость: получает на 50% больше входящего урона. Длительность уменьшается в конце хода."};document.querySelector(".tb-status-tooltip-overlay")?.remove();const o=document.createElement("div");o.className="tb-status-tooltip-overlay";o.innerHTML='<section class="tb-status-tooltip" role="dialog" aria-modal="true"><b>'+esc(status.toUpperCase())+' · '+value+'</b><p>'+esc(copy[status]||"Боевой эффект.")+'</p><button type="button" class="tb-event-choice" data-status-tooltip-close>ПОНЯТНО</button></section>';document.body.appendChild(o);o.addEventListener("click",e=>{if(e.target===o||e.target.closest("[data-status-tooltip-close]"))o.remove();});}
 function showCardInspect(index){const c=live(),card=c?.hand?.[Number(index)];if(!card||!battle)return;const effects=cardEffects(card),target=(battle.enemies||[]).find(x=>x.index===battle.targetIndex&&x.alive&&x.hp>0),damage=target?cardPreviewDamage(card,target):0,description=card.isUpgraded?(card.upgradedDescription||card.description||""):(card.description||"");document.querySelector(".tb-card-inspect-overlay")?.remove();const o=document.createElement("div");o.className="tb-card-inspect-overlay";o.innerHTML='<section class="tb-card-inspect-modal" role="dialog" aria-modal="true"><div class="tb-eyebrow">ПОДРОБНОЕ ОПИСАНИЕ</div><article class="v2-card '+esc(card.type||"skill")+' rarity-'+esc(card.rarity||"common")+(card.isUpgraded?" is-upgraded":"")+'"><span class="card-cost">'+((card.isXCost||card.costX)?"X":Number(card.cost)||0)+'</span><b class="card-name">'+esc(card.name)+(card.isUpgraded?' <i class="tb-card-upgrade-mark">+</i>':"")+'</b><small class="card-type">'+esc(String(card.rarity||"common").toUpperCase())+(card.isUpgraded?" · УЛУЧШЕНА":"")+'</small><p class="card-desc">'+esc(description)+'</p></article><p>'+((Number(effects.damage)>0||Number(effects.damageAll)>0||Number(effects.damagePerEnergy)>0||Number(effects.damagePerPoison)>0||Number(effects.damagePerBleed)>0||Number(effects.damageMissingHp)>0)?("Точный урон по выбранной цели: <b>"+damage+"</b>"):"")+'</p><button type="button" class="tb-event-choice" data-card-inspect-close>ЗАКРЫТЬ</button></section>';document.body.appendChild(o);o.addEventListener("click",e=>{if(e.target===o||e.target.closest("[data-card-inspect-close]")){o.remove();cardLongPressTriggered=false;}});}
 function showCardDamagePreview(index){if(!battle||battle.actor?.type!=="player")return;const c=live(),card=c.hand[index];if(!card)return;const effects=cardEffects(card),targets=Number(effects.damageAll)>0?(battle.enemies||[]).filter(x=>x.alive&&x.hp>0):(battle.enemies||[]).filter(x=>x.index===battle.targetIndex&&x.alive&&x.hp>0);for(const target of targets){const node=root.querySelector('.new-enemy-item[data-target="'+target.index+'"]');if(!node)continue;let preview=node.querySelector(".v2-damage-preview");if(!preview){preview=document.createElement("div");preview.className="v2-damage-preview";node.appendChild(preview);}const damage=cardPreviewDamage(card,target);preview.textContent=damage>0?"−"+damage+" HP":"БЕЗ УРОНА";preview.classList.toggle("lethal",damage>=target.hp);}}
 function clearCardDamagePreview(){root.querySelectorAll(".v2-damage-preview").forEach(node=>node.remove());}
 function enemyIntentDamage(target){const c=live(),stats=engine.getEnemyStats(c.id,battle.stage,target),weakMultiplier=Number(target.weak)>0?.75:1,dailyMultiplier=c.run.dailyChallengeActive&&c.run.dailyChallengeModifier==="rage"?1.2:1;let incoming=Math.max(1,Math.round((Number(stats.damage)||0)*weakMultiplier*dailyMultiplier*(Number(target.dailyDamageMultiplier)||1)));const playerStats=engine.getCombatStats(c);incoming=Math.max(0,Math.round(incoming*engine.mitigationMultiplier(playerStats.defense,battle.stage)*(1-Math.min(.75,Math.max(0,Number(playerStats.damageReduction)||0)))));if((battle.enemyDamageReductionTurns||0)>0)incoming=Math.max(0,Math.round(incoming*(1-(Number(battle.enemyDamageReduction)||0))));return incoming;}
 function enemyIntentText(target){if(!target)return "Ожидает";if(target.intent?.label)return target.intent.label;if(target.telegraph?.label)return target.telegraph.label;if(target.role==="saboteur")return "🃏 ЗАСОРЯЕТ КОЛОДУ";const damage=enemyIntentDamage(target);if(target.role==="healer"&&!target.provoked&&((Number(target.turnsTaken||0)+1)%2===0)){const ally=(battle?.enemies||[]).find(x=>x.alive&&x.hp>0&&x.index!==target.index&&x.hp<x.maxHp);if(ally)return "💚 +"+Math.round(ally.maxHp*.2)+" HP";}if(target.role==="tank"&&((Number(target.turnsTaken||0)+1)%3===0))return "🛡️ ЗАЩИТА + ⚔️ "+damage;if(target.role==="poison")return "☠️ ЯД · ⚔️ "+damage;return "⚔️ "+damage;}
 function planEnemyIntents(){if(!battle)return;for(const enemy of battle.enemies||[]){if(!enemy.alive||enemy.hp<=0){enemy.intent=null;continue;}const damage=enemyIntentDamage(enemy);let intent={type:"attack",damage,label:"⚔️ "+damage};if(enemy.type==="boss"){const roster=balance.bosses.archetypes||[],bossNo=Math.max(0,Math.floor((Number(battle.stage)||1)/(Number(balance.map?.boss_every)||10))-1),archetype=roster[bossNo%Math.max(1,roster.length)]||{id:"warden",pattern:["heavy","guard","double"]};enemy.bossArchetype=archetype.id;const pattern=archetype.pattern||["heavy"],action=pattern[Math.max(0,Number(enemy.turnsTaken)||0)%pattern.length],labels={heavy:"💥 СОКРУШАЮЩИЙ УДАР",double:"⚔️⚔️ ДВОЙНАЯ АТАКА",bleed:"🩸 РАССЕКАЮЩИЙ УДАР",hex:"🌑 ПРОКЛЯТИЕ",guard:"🛡️ НЕПРОБИВАЕМАЯ ЗАЩИТА",drain:"🩸 ПОГЛОЩЕНИЕ ЖИЗНИ",summon:"☠️ ПРИЗЫВ ПРИСЛУЖНИКОВ",mirror:"🪞 ЗЕРКАЛЬНЫЙ БАРЬЕР",quake:"🌋 СОТРЯСЕНИЕ",poison:"☠️ ЯДОВИТОЕ ДЫХАНИЕ"};intent={type:"boss_"+action,damage,label:labels[action]||("♛ "+damage)};}else if(enemy.mechanic==="poison"||enemy.role==="poison"){intent={type:"poison",damage,label:"☠️ ЯД · ⚔️ "+damage};}else if(enemy.role==="saboteur"){const cardId=gameRandom()<.5?"curse_wound":"status_slime",card=CARD_DATABASE[cardId];intent={type:"sabotage",cardId,label:"🃏 Засоряет колоду · "+(card?.name||"Карта")};}else if(enemy.role==="healer"&&!enemy.provoked&&((Number(enemy.turnsTaken||0)+1)%2===0)){const ally=(battle.enemies||[]).filter(x=>x.alive&&x.hp>0&&x.index!==enemy.index&&x.hp<x.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(ally)intent={type:"heal",targetIndex:ally.index,amount:Math.round(ally.maxHp*.2),label:"💚 +"+Math.round(ally.maxHp*.2)+" HP"};}else if(enemy.role==="tank"&&((Number(enemy.turnsTaken||0)+1)%3===0))intent={type:"defend",damage,label:"🛡️ ЗАЩИТА · ⚔️ "+damage};enemy.intent=intent;}}

 function esc(value){return String(value===undefined||value===null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
 const itemTypeNames={antidote:"Противоядие",healing_potion:"Зелье исцеления",craft_material:"Материал для крафта",enhancement_stone:"Камень усиления",refine_stone:"Камень заточки",chisel:"Долото",enchant_scroll:"Свиток зачарования"};
 function itemTypeName(value){return itemTypeNames[value]||String(value||"Предмет").replace(/_/g," ");}
 function itemDisplayName(item){
  if(!item)return "Неизвестный предмет";
  let name=String(item.name||item.title||itemTypeName(item.type)||"Неизвестный предмет").trim();
  if(!name||/^(undefined|null)$/i.test(name))name="Неизвестный предмет";
  const rarityPrefixes={"Обычная":["Обычный ","Обычная "],"Редкая":["Редкий ","Редкая "],"Эпическая":["Эпический ","Эпическая "],"Легендарная":["Легендарный ","Легендарная "],"Богоподобная":["Богоподобный ","Богоподобная "]};
  for(const prefix of rarityPrefixes[item.rarity]||[]){if(name.startsWith(prefix)){name=name.slice(prefix.length);break;}}
  name=name.replace(/\s*[·•]\s*(head|helmet|helm|chest|weapon|legs|hands|accessory)\s*$/i,"");
  return name||"Неизвестный предмет";
 }
 function itemBagTitle(item){
  if(!item)return "Неизвестный предмет";
  const equipment=item.type==="equipment"&&item.stats&&item.rarity;
  const slotNames={weapon:"Оружие",chest:"Нагрудник",head:"Шлем",legs:"Поножи",hands:"Перчатки",accessory:"Аксессуар"};
  const rarity=String(item.rarity||"Обычная"),kind=equipment?(slotNames[item.slot]||"Экипировка"):(item.type==="enhancement_stone"?"Камень":itemTypeName(item.type));
  let name=item.name||item.title?itemDisplayName(item):"Неизвестный предмет";
  for(const prefix of [rarity,kind])if(name.toLocaleLowerCase("ru").startsWith((prefix+" · ").toLocaleLowerCase("ru")))name=name.slice(prefix.length+3).trim();
  name=name.replace(/\s*[·•]\s*(камень|камень усиления)$/i,"").trim()||"Неизвестный предмет";
  if(name.toLocaleLowerCase("ru")===kind.toLocaleLowerCase("ru"))name="Неизвестный предмет";
  return [rarity,kind,name].join(" · ");
 }
 function effectiveEquipmentStats(item){
  const stats={...(item?.stats||{})},multiplier=1+Math.max(0,Number(item?.refine)||0)*0.05;
  for(const key of ["attack","defense","health"])if(stats[key]!==undefined)stats[key]=Number(stats[key]||0)*multiplier;
  return stats;
 }
 function matchingStonesForItem(character,item){
  if(!character||!item)return [];
  const activeBranch=typeof character.branch==="object"?character.branch?.id:character.branch,weapon=item.slot==="weapon"||item.slot===0;
  return (character.bag||[]).filter(stone=>{
   if(stone.type!=="enhancement_stone")return false;
   const type=stone.stoneType||stone.stone_type||{},branch=type.branch_id||type.branchId;
   return (type.class_id||type.classId)===character.classId&&String(branch||"")===String(activeBranch||"")&&(!type.slot||(type.slot==="weapon")===weapon);
  });
 }
 function installedGemsOf(item){
  if(Array.isArray(item?.installedGems)&&item.installedGems.length)return item.installedGems;
  return Array.isArray(item?.sockets)?item.sockets:[];
 }
 function stoneDescription(stone){
  const t=stone?.stoneType||{},level=Math.max(1,Number(stone?.level)||1);
  if(level===1&&typeof t.description==="string"&&t.description.trim())return t.description.trim();
  const parts=[];
  for(const [key,label,percent] of [["attack_per_level","к атаке",false],["defense_per_level","к защите",false],["health_per_level","к здоровью",false],["crit_per_level","к критическому шансу",true],["spell_power_per_level","к силе магии",false],["fire_damage_per_level","к урону огнём",true],["ice_damage_per_level","к урону льдом",true],["dark_damage_per_level","к урону тьмой",true]]){
   const value=Number(t[key]||0)*level;
   if(value)parts.push("+"+(percent?(value*100).toFixed(1).replace(/\\.0$/,"")+"%":Number(value.toFixed(2)))+" "+label);
  }
  return parts.join(", ")||"Уникальный бонус специализации";
 }
 function rarityClass(value){return ({Обычная:"common",Редкая:"rare",Эпическая:"epic",Легендарная:"legendary",Богоподобная:"godlike"}[value]||"common");}
 function live(){return engine&&engine.state.characters.find(c=>c.id===selectedId);}
 function classData(c){return balance.classes.classes[c.classId];}
 function clsName(c){return classData(c).name;}
 const specializationDescriptions={
  assassin:{bleed:"Сражается сериями быстрых ударов и накладывает кровотечение. Урон нарастает с каждым ходом, поэтому ветка особенно сильна против одной живучей цели. Требует постоянного давления и точного выбора момента для добивания.",poison:"Использует яды, которые накапливают периодический урон и ослабляют врагов. Лучше всего раскрывается в затяжных боях и против групп целей, но уступает в мгновенном взрывном уроне.",execution:"Специализируется на критических попаданиях и добивании ослабленных противников. Способен резко завершить бой одним мощным выпадом, но наиболее эффективен после подготовки цели."},
  bishop:{exorcism:"Изгоняет тёмные силы, прерывает опасные действия и наносит стабильный магический урон. Подходит для контроля элитных врагов и боссов, особенно когда важно сорвать их усиленную атаку.",healing:"Поддерживает себя и союзников исцелением, защитными эффектами и постепенным восстановлением. Наносит меньше урона, зато позволяет переживать длинные сражения и исправлять ошибки.",buffs:"Поднимает боевые характеристики благословениями и усиливает эффективность умений. Это универсальная ветка поддержки: она помогает наносить больше урона и дольше держаться под давлением."},
  dragonkin:{fire_dragon:"Преобразует ярость дракона в огненные заклинания и горение. Наносит высокий прямой и периодический урон одной или нескольким целям, но полагается на атаку и требует осторожности из-за слабой защиты.",ice_dragon:"Окутывает себя ледяной бронёй, замедляет и контролирует противников. Урон более размеренный, зато ветка заметно повышает стойкость и помогает безопасно переживать опасные ходы врагов.",black_dragon:"Призывает тёмную магию, проклятия и эффекты истощения. Силен в продолжительных боях: ослабляет ключевую цель и превращает накопленные отрицательные эффекты в высокий магический урон."},
  destroyer:{fists:"Давит врага быстрыми ударами кастетов и непрерывными сериями. Наращивает темп комбо, часто атакует и пробивает защиту, но нуждается в постоянной близкой дистанции и поддержании серии.",greatsword:"Использует тяжёлый двуручный меч для медленных, но разрушительных ударов. Эффективен против плотных групп и крупных целей благодаря урону по площади и сильным критическим попаданиям.",wand_shield:"Сочетает боевой жезл с надёжным щитом. Жертвует частью урона ради блокирования, защиты и устойчивости, поэтому хорошо переносит сильные атаки и подходит для осторожного стиля."},
  elemental:{darkness:"Плетёт тёмные проклятия, снижает возможности противников и поражает группы магией по площади. Особенно полезен в боях с несколькими врагами, где эффекты ослабления работают сразу на всю группу.",water:"Использует быстрые водные заклинания с короткими промежутками между действиями. Каждое заклинание слабее тяжёлой магии, но высокий темп позволяет стабильно наносить урон и чаще использовать умения.",earth:"Управляет землёй, создаёт защитные печати и накладывает эффект оглушения на опасные цели. Контроль прерывает вражеский темп, а прочная защита помогает выдерживать длинные схватки с элитными противниками."},
  duelist:{dual_swords:"Фокус на высоком темпе атак. Наносит урон сериями ударов, накапливая заряды для мощных добивающих умений. Хорош против одиночных целей, но требует внимания к защите.",sword_shield:"Сражается мечом и щитом, получая заряды за точные попадания и превращая их в усиленные ответные выпады. Сочетает стабильный урон с блокированием и подходит для сбалансированной игры.",rapier:"Мастерски владеет шпагой, использует точные выпады и парирование. Наказывает врага за неверный ход контратакой, но требует точного расчёта момента и внимательного чтения намерений противника."},
  shaman:{spirits:"Призывает духов предков, получает поддержку, использует самолечение и восстанавливает здоровье во время боя. Ветка рассчитана на выживание и постепенное преимущество: чем дольше длится сражение, тем больше пользы от духов.",dark_gods:"Заключает договоры с тёмными богами и насылает проклятия, поражающие сразу несколько целей. Обладает мощным магическим уроном и ослаблением врагов, но делает меньший упор на прямое исцеление.",nature:"Использует силу природы, тотемы и живые корни для урона, контроля и восстановления. Универсальная специализация, которая удерживает противников на месте и постепенно возвращает здоровье."}
 };
 function specializationDescription(classId,branchId){return specializationDescriptions[classId]?.[branchId]||"Уникальная специализация: "+(balance.classes.classes[classId]?.branches||[]).find(b=>b.id===branchId)?.name+". Изучай умения ветки и подбирай экипировку под её стиль.";}

 function portrait(id){return CHARACTER_ART_ROOT+(classPortraits[id]||classPortraits.assassin);}
 function enemyPortrait(target){
  const key=String(target?.mobId||target?.id||target?.name||"").toLowerCase().replace(/_/g,"-");
  if(target?.type==="boss"||target?.role==="boss"){
   const direct=bossPortraitsById[key]||(/багров|crimson regent/i.test(key)?bossPortraitsById["crimson-regent"]:null);
   if(direct)return CHARACTER_ART_ROOT+direct;
   const stage=Math.max(1,Number(battle?.stage)||1);
   return CHARACTER_ART_ROOT+bossPortraits[Math.floor((stage-1)/10)%bossPortraits.length];
  }
  if(mobPortraits[key])return CHARACTER_ART_ROOT+mobPortraits[key];
  const role=target?.role||"normal";
  return CHARACTER_ART_ROOT+(rolePortraits[role]||rolePortraits.normal);
 }
 const PERSISTED_BATTLE_FIELDS=["trialPotionUsed","playerTurnCount","bossDeadlineTurns","bossTurns","bossAddsSummoned","poisonStacks","playerWeakTurns","playerDamageBuffTurns","playerDamageBuff","enemyDamageReductionTurns","enemyDamageReduction","potionUsedThisTurn","firstAttackDouble","bossPhase","assassinAttacksThisTurn","shamanFreeMode","playerBleed","counterCooldownTurns","ultimateCooldownTurns","counterPrimed","counterConsumed","counterTargetIndex","counterAction","nextDamageShield","nextAttackDamageBonus","cardSpellPower","cardsPlayedThisTurn","playerSkillUsed","enemyStunned","parryChance","dots","dot","hot","teleportUsed","comboStacks","overkillBonus"];
 function save(){try{
  if(!engine||!engine.state)throw new Error('Игровое состояние ещё загружается');
  for(const character of engine.state.characters||[]){character.deck=Array.isArray(character.deck)?character.deck:[];character.unlockedCards=Array.isArray(character.unlockedCards)?character.unlockedCards:[];character.relics=Array.isArray(character.relics)?character.relics:[];character.hand=Array.isArray(character.hand)?character.hand:[];character.discard=Array.isArray(character.discard)?character.discard:[];character.exhaustPile=Array.isArray(character.exhaustPile)?character.exhaustPile:[];character.combo=Math.max(0,Number(character.combo)||0);character.rage=Math.max(0,Number(character.rage)||0);character.charges=Math.max(0,Number(character.charges)||0);}
  const c=live();
  if(c?.run?.stage&&battle){
   c.run.stage.uiBattleSnapshot={enemies:JSON.parse(JSON.stringify(battle.enemies||[])),targetIndex:battle.targetIndex,round:battle.round||1,comboStacks:battle.comboStacks||0,skillCooldowns:JSON.parse(JSON.stringify(battle.skillCooldowns||{})),comboProgress:JSON.parse(JSON.stringify(battle.comboProgress||{})),combatState:Object.fromEntries(PERSISTED_BATTLE_FIELDS.filter(key=>battle[key]!==undefined).map(key=>[key,battle[key]])),cardState:{deck:JSON.parse(JSON.stringify(c.deck||[])),hand:JSON.parse(JSON.stringify(c.hand||[])),discard:JSON.parse(JSON.stringify(c.discard||[])),exhaustPile:JSON.parse(JSON.stringify(c.exhaustPile||[])),currentEnergy:Number(c.currentEnergy)||0,cardBlock:Number(battle.cardBlock)||0,actorType:battle.actor?.type||"player"},enemyQueueState:battle.enemyQueueState?{indices:[...(battle.enemyQueueState.indices||[])],cursor:Math.max(0,Number(battle.enemyQueueState.cursor)||0)}:null};
  }
  if(window.__TB_BALANCE_TEST_MODE)return;localStorage.setItem("tb-rpg-v2",JSON.stringify(engine.state));window.TowerboundCloud?.queueSave?.();window.TowerboundOnline?.queuePublish();
 }catch(e){notify("Не удалось сохранить: "+e.message);}}
 function notify(message){if(window.__TB_BALANCE_TEST_MODE)return;toastMessage=message;const el=root.querySelector(".tb-toast");if(el){el.textContent=message;el.classList.add("show");}clearTimeout(toastTimer);toastTimer=setTimeout(()=>{const x=root.querySelector(".tb-toast");if(x)x.classList.remove("show");},3200);}
 function button(action,label,attrs){return '<button type="button" data-action="'+action+'" '+(attrs||"")+'>'+label+'</button>';}
 function header(){return '<header class="tb-header" aria-label="TowerBound Relic Arena"><div class="tb-brand"><img class="game-logo" src="./assets/icons/image.png" alt="T" width="34" height="34" decoding="async"><strong class="tb-brand-title">TowerBound Relic Arena</strong></div></header>';}

 function characterList(){
  const chars=engine.state.characters;
  const selected=chars.find(c=>c.id===selectedId)||chars[0];
  const cloud=window.TowerboundCloud,authenticated=!!cloud?.signedIn,cloudReady=!!cloud?.savesReady,cloudStatus=cloud?.status?.()||{},remoteHasCharacters=!!cloudStatus.remoteHasCharacters,engineHasCharacters=!!engine?.state?.characters?.length,localBackup=cloudStatus.localBackup;
  if(selected&&!selectedId)selectedId=selected.id;
  /* Local characters remain playable while cloud refresh runs; only an empty profile waits for the first cloud response. */const emptyContent=authenticated&&!engineHasCharacters&&(!cloudReady||remoteHasCharacters)
   ? '<div class="tb-empty"><div class="tb-empty-crest">✦</div><h2>Синхронизация сохранения</h2><p>В облаке есть персонаж, но игра ещё не подтвердила его загрузку. Создание нового персонажа заблокировано, чтобы не затереть прогресс.</p><button type="button" data-action="cloud-retry" class="tb-primary">ПОВТОРИТЬ ЗАГРУЗКУ</button>'+(localBackup?.available?'<button type="button" data-action="cloud-recover-local" class="tb-secondary">ПРОВЕРИТЬ РЕЗЕРВНУЮ КОПИЮ</button>':'')+'</div>'
   : authenticated
   ? '<div class="tb-empty"><div class="tb-empty-crest">✦</div><h2>Башня ждёт своего героя</h2><p>Создай персонажа одного из семи классов. Прогресс персонажа сохраняется между забегами.</p><button type="button" data-action="new" class="tb-primary">СОЗДАТЬ ПЕРВОГО ПЕРСОНАЖА</button></div>'
   : '<div class="tb-empty tb-login-gate"><div class="tb-empty-crest">✦</div><h2>Вход в игру</h2><p>Войди в аккаунт или зарегистрируйся, чтобы создать персонажа и сохранить прогресс.</p><form class="tb-character-login" novalidate><label for="login">Логин</label><input id="login" name="login" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Логин"><label for="pass">Пароль</label><input id="pass" name="password" type="password" autocomplete="current-password" placeholder="Пароль"><label class="tb-login-remember"><input id="rememberMe" type="checkbox" checked> Запомнить меня</label><button type="button" data-action="empty-login" class="tb-primary tb-login-submit">ВОЙТИ</button><button type="button" data-action="empty-register" class="tb-text-link">Зарегистрироваться</button><p class="tb-login-message" role="status" aria-live="polite"></p></form></div>';
  return header("Выбор персонажа", authenticated ? "Аккаунт · " + (engine.state.account.diamonds || 0) + " алмазов" : "Войди, чтобы начать") +
    '<section class="fix-char-section">' +
    '<div class="fix-char-title"><h1>Персонажи</h1><p>Твой путь в Башне начинается с аккаунта</p></div>' +
    (chars.length ? 
      '<div class="fix-char-grid">' + 
      chars.map(c => {
        const d = balance.classes.classes[c.classId];
        const chosen = c.id === selectedId;
        return '<button type="button" class="fix-char-card ' + (chosen ? "selected" : "") + '" data-pick="' + esc(c.id) + '">' +
          '<div class="fix-char-art"><img src="' + portrait(c.classId) + '" alt=""></div>' +
          '<div class="fix-char-info">' +
            '<strong>' + esc(c.name) + '</strong>' +
            '<span>' + esc(d.name) + ' · Уровень ' + c.level + '</span>' +
            '<small>Мощь ' + engine.combatPower(c) + ' · Пройдено ' + c.progress.highestEver + '/250</small>' +
            '<small>Серебро ' + c.silver + ' · ' + (c.branch ? esc(d.branches.find(b => b.id === c.branch)?.name || c.branch) : "Без специализации") + '</small>' +
          '</div>' +
          '<span class="fix-char-mark">' + (chosen ? "✓" : "") + '</span>' +
        '</button>';
      }).join("") + 
      '</div>' +
      '<div class="fix-char-actions">' +
        '<button data-action="play" class="fix-play-btn">ИГРАТЬ ЗА ' + esc(selected.name.toUpperCase()) + '</button>' +
      '</div>' : 
      emptyContent) +
    '</section>' + createDialog();
 }
function createDialog(){
  if(!dialogOpen)return "";
  const classes=Object.entries(balance.classes.classes);
  const current=balance.classes.classes[selectedClass];
  return '<div class="tb-modal"><div class="tb-dialog"><button class="tb-close" data-action="close">×</button><div class="tb-eyebrow">НОВАЯ ГЛАВА</div><h2>Создание персонажа</h2><label class="tb-field"><span>Имя героя</span><input id="name" maxlength="18" placeholder="Введи имя персонажа"></label><div class="tb-field"><span>Выбери класс</span><div class="tb-class-picker">'+classes.map(([id,d])=>'<button type="button" data-class="'+id+'" class="'+(id===selectedClass?"active":"")+'"><img src="'+portrait(id)+'" alt=""><b>'+esc(d.name)+'</b><small>'+esc(d.role||"Герой башни")+'</small></button>').join("")+'</div></div><div class="tb-class-summary"><b>'+esc(current.name)+'</b><span>'+esc(current.role||"")+'</span><small>Ресурс: '+esc(current.resource)+' · Сильные стороны: '+esc((current.strengths||[]).join(", "))+'</small><small>Слабые стороны: '+esc((current.weaknesses||[]).join(", "))+'</small></div><button class="tb-primary tb-wide" data-action="confirm-create">СОЗДАТЬ ГЕРОЯ</button></div></div>';
 }

 function dailyChallengeDate(){return new Date().toISOString().slice(0,10);}
 function dailyChallengeInfo(date=dailyChallengeDate()){let seed=2166136261;for(const ch of String(date))seed=Math.imul(seed^ch.charCodeAt(0),16777619)>>>0;const mods=[{id:"fire",name:"Огненный день",description:"Каждая разыгранная карта накладывает 1 горение."},{id:"rage",name:"День ярости",description:"Старт боя: 5 Ярости. Враги наносят на 20% больше урона."},{id:"blood",name:"Кровавый день",description:"Карты стоят на 1 энергию меньше, но каждая карта отнимает 2 HP."}];return{seed:seed||1,modifier:mods[seed%mods.length]};}
 function dailyChallengeLeaderboard(){
  try{const rows=JSON.parse(localStorage.getItem("tb-daily-challenge-leaderboard-v1")||"[]");return Array.isArray(rows)?rows:[];}catch(_){return [];}
 }
 function saveDailyChallengeResult(c){
  const date=c.run.dailyChallengeDate||dailyChallengeDate(),rows=dailyChallengeLeaderboard(),className=clsName(c);
  const result={date,seed:Number(c.run.dailyChallengeSeed)||0,modifier:String(c.run.dailyChallengeModifier||""),name:c.name,className,stage:Number(c.progress?.highestEver)||Number(postBattleSummary?.stage)||0,xp:Number(postBattleSummary?.xp)||0,at:Date.now()};
  const old=rows.findIndex(row=>row.date===date&&row.name===c.name&&row.className===className);
  if(old>=0){if(result.stage>=Number(rows[old].stage||0))rows[old]=result;}else rows.push(result);
  rows.sort((a,b)=>b.stage-a.stage||b.xp-a.xp||a.at-b.at);
  try{localStorage.setItem("tb-daily-challenge-leaderboard-v1",JSON.stringify(rows.slice(0,50)));}catch(error){console.warn("Daily challenge leaderboard storage failed",error);}
  notify("Этап ежедневного вызова записан в локальный рейтинг · забег продолжается");
 }
 function dailyChallengeLeaderboardMarkup(){
  const rows=dailyChallengeLeaderboard().slice(0,5);
  return '<section class="tb-daily-challenge-board"><h3>ЛОКАЛЬНЫЙ РЕЙТИНГ · ЕЖЕДНЕВНЫЙ ВЫЗОВ</h3>'+(rows.length?rows.map((row,index)=>'<div class="tb-daily-challenge-row"><b>#'+(index+1)+' '+esc(row.name)+'</b><span>'+esc(row.className)+' · этап '+row.stage+' · '+row.xp+' XP</span></div>').join(""):'<small>Пока нет завершённых вызовов.</small>')+'</section>';
 }
 function mapScreen(){
  const c=live();if(!c)return characterList();
  const daily=engine.dailySnapshot(c.id),chapter=engine.chapterForStage(selectedStage||c.progress.currentStage),modifierChoices=engine.runModifierOptions(c.id),weekly=engine.weeklySnapshot(c.id),account=engine.state.account||{};
  c.run.mapEvents=c.run.mapEvents&&typeof c.run.mapEvents==="object"?c.run.mapEvents:{};c.run.completedMapEvents=Array.isArray(c.run.completedMapEvents)?c.run.completedMapEvents:[];let mapEventsChanged=false;for(let n=1;n<=balance.map.total_stages;n++){if(n%balance.map.boss_every===0)continue;if(Object.prototype.hasOwnProperty.call(c.run.mapEvents,n)){if(c.run.mapEvents[n]===null&&gameRandom()<.035){c.run.mapEvents[n]=gameRandom()<.25?"champion":"trial";mapEventsChanged=true;}continue;}if(gameRandom()<.2){const roll=gameRandom();c.run.mapEvents[n]=roll<.035?"secret":roll<.075?"guardian":roll<.17?"champion":roll<.32?"trial":roll<.44?"altar":roll<.56?"chest":roll<.68?"wanderer":roll<.80?"cache":roll<.90?"healing":"merchant";}else c.run.mapEvents[n]=null;mapEventsChanged=true;}if(mapEventsChanged)save();
  const chest=engine.dailyChestSnapshot(c.id),chestMinutes=Math.ceil(chest.remainingMs/60000),chestLabel=chest.available?"🎁 СУНДУК · ГОТОВ":"🎁 СУНДУК · "+Math.floor(chestMinutes/60)+"ч "+(chestMinutes%60)+"м",activeSeason=c.run.season?.modifier||engine.state.season?.modifier,activeDaily=c.run.dailyModifier||daily.modifier,pendingPvp=account.pvpDaily?.pending,pvpCategoryNames={frame:"Рамка",title:"Титул",weapon_skin:"Облик оружия",relic:"Реликвия",class_epic:"Экипировка класса",consumable:"Расходник"},pvpStore=(balance.pvp_store?.items||[]).map(item=>{const owned=item.kind==="cosmetic"?(account.cosmetics||[]).includes(item.id):item.kind==="account_relic"?(account.relics||[]).includes(item.id):item.kind==="character_item"?(account.classEpics||[]).includes(item.classId):false,classBlocked=item.kind==="character_item"&&item.classId!==c.classId;return '<article class="tb-system-product"><b>'+esc(item.name)+'</b><small>'+esc(pvpCategoryNames[item.category]||"Предмет")+' · '+item.price+' очков арены</small><button data-pvp-buy="'+item.id+'" '+(owned||classBlocked||(account.pvpPoints||0)<item.price?'disabled':'')+'>'+(owned?(item.kind==="character_item"?"УЖЕ ПОЛУЧЕНО":"УЖЕ КУПЛЕНО"):classBlocked?"ДРУГОЙ КЛАСС":"КУПИТЬ")+'</button></article>';}).join("");
  const cp=c.progress.currentStage-1,healReady=balance.map.checkpoints.includes(cp)&&c.run.healingPenaltyUntil<c.progress.currentStage&&c.run.checkpointHeals<balance.healing.max_checkpoint_heals_per_run,trapStage=selectedStage%13===0,antidotes=(c.bag||[]).filter(x=>x.type==="antidote").reduce((n,x)=>n+(x.quantity||1),0);
  const penalty=(c.run.healingPenaltyFrom||0)>0&&c.progress.currentStage>=(c.run.healingPenaltyFrom||0)&&c.progress.currentStage<=c.run.healingPenaltyUntil;
  const remaining=penalty?c.run.healingPenaltyUntil-c.progress.currentStage+1:0;
  const maxAuto=c.progress.highestEver-balance.auto_battle.highest_ever_offset;
  if(!selectedStage||selectedStage>c.progress.highestEver+1)selectedStage=c.progress.currentStage;
  const campAvailable=engine.canUseCampStop(c.id,selectedStage);
  let nodes="";
  for(let stage=1;stage<=balance.map.total_stages;stage++){
   const accessible=stage<=c.progress.highestEver+1,cleared=stage<=c.progress.highestEver;
   const isBoss=stage%balance.map.boss_every===0;
   const isEvent=!isBoss&&!c.run.completedMapEvents.includes(stage)&&!!c.run.mapEvents[stage],isTrial=isEvent&&c.run.mapEvents[stage]==="trial",isChampion=isEvent&&c.run.mapEvents[stage]==="champion",isSecret=isEvent&&c.run.mapEvents[stage]==="secret",isGuardian=isEvent&&["guardian","secret_boss"].includes(c.run.mapEvents[stage]),isSecretCache=isEvent&&c.run.mapEvents[stage]==="secret_cache";
   const selected=stage===selectedStage;
   const restStopReady=cleared&&engine.canUseCampStop(c.id,stage);
   nodes+='<button type="button" class="tb-map-node '+(cleared?"cleared ":"")+(selected?"selected ":"")+(isBoss?"boss":"")+(isEvent?" is-event":"")+(isTrial?" is-trial":"")+(isChampion?" is-champion":"")+(isSecret||isSecretCache?" is-secret":"")+(isGuardian?" is-guardian":"")+(restStopReady?" has-camp-stop":"")+'" data-stage="'+stage+'" title="Этап '+stage+(isChampion?' · Чемпион Башни':isTrial?' · Испытание Башни':' · рекомендуемая мощь '+Math.round(500+stage*150))+'" '+(!accessible?"disabled":"")+'><span class="tb-map-info" aria-hidden="true">i</span><strong>'+(isBoss?"♛":isChampion||isGuardian?"♛":isSecret||isSecretCache?"✧":isTrial?"⚔":isEvent?"?":cleared?"✓":stage)+'</strong>'+(cleared?"":'<small>'+(isBoss?"БОСС":isGuardian?"ХРАНИТЕЛЬ":isSecretCache?"ТАЙНИК ОРДЕНА":isSecret?"ТАЙНАЯ КОМНАТА":isChampion?"ЧЕМПИОН":isTrial?"ИСПЫТАНИЕ":isEvent?"СОБЫТИЕ":"ЭТАП")+'</small>')+(restStopReady?'<small class="tb-map-camp-label">🔥 ПРИВАЛ</small>':'')+'<small class="tb-map-power">Рек. Мощь: '+Math.round(500+stage*150)+'</small></button>';
  }

  const towerMapMarkup=towerMapOpen?(()=>{
   const currentFloor=Math.min(250,Math.max(1,Number(c.progress.currentStage)||1));
   let floorNodes="";
   const routePoints=[];
   for(let index=0;index<250;index++){
    const stage=index+1;
    const row=Math.floor(index/10),step=index%10,col=row%2===0?step:9-step;
    routePoints.push((50+col*100)+","+(50+row*100));
    const accessible=stage<=c.progress.highestEver+1,cleared=stage<=c.progress.highestEver,isBoss=stage%balance.map.boss_every===0;
    const eventType=c.run.mapEvents?.[stage],isEvent=!isBoss&&!c.run.completedMapEvents.includes(stage)&&!!eventType;
    const selected=stage===selectedStage,isCurrent=stage===currentFloor;
    const isElite=["champion","guardian","secret_boss"].includes(eventType),isTrial=eventType==="trial",isSecret=["secret","secret_cache"].includes(eventType);
    const kind=isBoss?"БОСС":isElite?"ЭЛИТА":isTrial?"ИСПЫТАНИЕ":isSecret?"ТАЙНА":isEvent?"СОБЫТИЕ":cleared?"ПРОЙДЕН":"ЭТАЖ";
    floorNodes+='<button type="button" class="tb-tower-floor-node '+(cleared?"is-cleared ":"")+(selected?"is-selected ":"")+(isCurrent?"is-current ":"")+(isBoss?"is-boss ":"")+(isElite?"is-elite ":"")+(isEvent?"is-event ":"")+'" data-stage="'+stage+'" style="--floor-col:'+(col+1)+';--floor-row:'+(row+1)+'" '+(!accessible?'disabled':'')+' aria-label="Этаж '+stage+' · '+kind+'"><strong>'+(isBoss?"♛":cleared?"✓":stage)+'</strong></button>';
   }
   const currentChapter=Math.floor((currentFloor-1)/50)+1;
   return '<section class="tb-tower-map-overlay" role="dialog" aria-modal="true" aria-label="Карта всех этажей Башни"><header class="tb-tower-map-head"><div><small>TOWERBOUND · ВОСХОЖДЕНИЕ</small><strong>ЭТАЖ '+currentFloor+' <i>/ 250</i></strong><span>Пройдено '+c.progress.highestEver+' · Глава '+currentChapter+'</span></div><button type="button" data-action="tower-map-close" aria-label="Закрыть карту">×</button></header><div class="tb-tower-map-tools"><span><i class="done"></i> Пройдено <i class="active"></i> Текущий <i class="locked"></i> Закрыто <i class="boss"></i> Босс</span><span class="tb-map-layout-hint">250 ЭТАЖЕЙ · МАРШРУТ ЗМЕЙКОЙ</span></div><div class="tb-tower-map-scroll" id="tbTowerMapScroll"><section class="tb-tower-map-segment" data-chapter="'+currentChapter+'"><svg class="tb-tower-route-lines" viewBox="0 0 1000 2500" preserveAspectRatio="none" aria-hidden="true"><polyline points="'+routePoints.join(" ")+'"/></svg>'+floorNodes+'</section></div></section>';
  })():"";
  return header("Карта 250 уровней",c.name+" · "+clsName(c)+" · Ур. "+c.level)+
   '<section class="tb-map-screen" style="background-image:linear-gradient(180deg,#090c18dd,#090c18aa),url('+chapterBackgroundPath(selectedStage).replace(/ /g,"%20")+');background-size:cover;background-position:center"><div class="tb-map-top"><div class="tb-map-identity"><b>'+esc(c.name)+'</b><small>'+esc(clsName(c))+' · '+esc(classData(c).resource)+': '+c.resource+'/'+c.resourceMax+'</small></div><div class="tb-currency"><span>◈ '+c.silver+' серебра</span><span>◆ '+engine.state.account.diamonds+' алмазов</span><span>Мощь '+engine.combatPower(c)+'</span><span>♥ Жизни: '+(c.run.lives||balance.difficulty.modes[c.difficulty||balance.difficulty.default].lives)+'/'+balance.difficulty.modes[c.difficulty||balance.difficulty.default].lives+'</span></div></div>'+
   '<section class="tb-tower-hero"><div class="tb-tower-hero-copy"><span>ГЛАВНЫЙ РЕЖИМ · 250 ЭТАЖЕЙ</span><strong>Башня</strong><small>Текущий этаж '+Math.min(c.progress.currentStage,250)+' из 250 · пройдено '+c.progress.highestEver+'</small><div class="tb-tower-progress"><i style="width:'+Math.min(100,Math.max(0,(Number(c.progress.highestEver)||0)/250*100))+'%"></i></div></div><div class="tb-tower-hero-actions"><button type="button" class="tb-primary" data-action="start">ПРОДОЛЖИТЬ · ЭТАЖ '+Math.min(c.progress.currentStage,250)+'</button><div class="tb-tower-secondary-actions"><button type="button" class="tb-skip-floors-button" data-action="skip-floors" '+((Number(c.progress.highestEver)||0)<10||!!c.run.stage?"disabled":"")+'>ПРОПУСК ЭТАЖЕЙ</button><button type="button" data-action="tower-map-focus">ВСЕ ЭТАЖИ</button></div></div></section>' + '<div class="tb-map-quick-panel" aria-label="Быстрый доступ к событиям"><button type="button" data-action="daily-chest" '+(chest.available?"":"disabled")+'>'+chestLabel+'</button><button type="button" data-action="daily-boss" '+(daily.boss.started?"disabled":"")+'>'+(daily.boss.started?"ДНЕВНОЙ БОСС · ПОПЫТКА ИСПОЛЬЗОВАНА":"ДНЕВНОЙ БОСС · 500 СЕРЕБРА")+'</button><button type="button" data-action="'+(pendingPvp?"pvp-fight":"pvp-match")+'">'+(pendingPvp?"ПРОДОЛЖИТЬ PvP":"PvP-АРЕНА")+'</button><button type="button" data-action="open-season-modifiers">СЕЗОННЫЕ МОДИФИКАТОРЫ</button></div><section id="tbSeasonalStatus" class="tb-seasonal-status" data-season-modifier="'+esc(activeSeason?.id||"")+'"><div><b>СЕЗОННЫЙ МОДИФИКАТОР</b><p>'+esc(activeSeason?.name||"Нет активного модификатора")+'</p><small>Фиксируется при старте забега · сезон '+balance.seasons.season_length_days+' дней</small></div><div><b>МОДИФИКАТОР ДНЯ</b><p>'+esc(activeDaily?.name||"Нет ежедневного модификатора")+'</p><small>Обновляется ежедневно в 00:00 UTC</small></div></section>'+'<div class="tb-progressline"><span>Наивысший этап: <b>'+c.progress.highestEver+'/250</b></span><span>Следующий: <b>'+Math.min(c.progress.currentStage,250)+'</b></span><span>Чекпоинты: <b>'+c.progress.checkpoints.join(" · ")+'</b></span></div>'+'<details class="tb-system-card tb-map-pvp"><summary><b>PvP-арена · '+(account.pvpPoints||0)+' очков</b><span>Соперники и награды</span></summary><div class="tb-map-pvp-content"><p>Поиск реального игрока по боевой мощи ±15%. Снимок класса, умений, талантов и экипировки загружается из Supabase. Боты отключены.</p><div class="tb-system-actions">'+button("pvp-match","НАЙТИ РЕАЛЬНОГО СОПЕРНИКА")+(pendingPvp?button("pvp-fight","СРАЗИТЬСЯ · "+esc(pendingPvp.opponent?.name||"СОПЕРНИК")):"")+'</div>'+(pendingPvp?.opponent?.online?'<div class="tb-system-row"><div><b>'+esc(pendingPvp.opponent.name)+' · '+esc(balance.classes.classes[pendingPvp.opponent.classId]?.name||pendingPvp.opponent.classId)+'</b><small>Уровень '+pendingPvp.opponent.level+' · '+pendingPvp.opponent.bp+' BP · этап '+pendingPvp.opponent.maxStage+'</small></div><span>ОНЛАЙН-ПРИЗРАК</span></div>':'')+'<div class="tb-system-products">'+pvpStore+'</div><p class="tb-online-warning">Текущая симуляция боя и локальные PvP-очки пока не являются серверно подтверждённым результатом.</p></div></details>'+
   (penalty?'<div class="tb-penalty">−20% ОПЫТА АКТИВНО · ОСТАЛОСЬ '+remaining+' ЭТАЖЕЙ</div>':"")+
   '<div class="tb-map-mode-actions">'+(c.level>=50?'<span class="tb-tower-map-record">♜ Рекорд Башни: '+(window.TowerboundEndgame?.getTowerRecord?.()||0)+' этаж</span><button type="button" class="tb-tower-map-button" data-eg-launch="tower">♜ БЕСКОНЕЧНАЯ БАШНЯ</button>':'')+'</div><div class="tb-map-layout tb-map-layout-legacy" hidden style="display:none!important" aria-hidden="true"><div class="tb-map-scroll"><div class="tb-map-grid">'+nodes+'</div></div></div>'+towerMapMarkup+''+
   '<section class="tb-chapter-card" style="background-image:linear-gradient(90deg,#0b1020ed,#0b102080),url(\''+(chapter?.background||"")+'\')"><div class="tb-eyebrow">ГЛАВА '+(chapter?.id||1)+' / 5 · ЭТАПЫ '+(chapter?.stages?.join("–")||"1–50")+'</div><h2>'+esc(chapter?.name||"Порог семи печатей")+'</h2><p>'+esc(chapter?.lore||"")+'</p></section>'+
    '<section class="tb-run-modifier-panel"><div class="tb-daily-heading"><div><div class="tb-eyebrow">НОВЫЙ ЗАБЕГ</div><h3>Выбери модификатор · 1 из 3</h3></div><span>◆ '+engine.state.account.diamonds+' алмазов</span></div>'+(c.run.active?'<p>Активен: '+esc((balance.run_modifiers.modifiers.find(x=>x.id===c.run.runModifierId)||{}).name||"без модификатора")+'</p>':modifierChoices.map(m=>'<button data-run-modifier="'+m.id+'" class="'+(c.run.runModifierId===m.id?"active":"")+'"><b>'+esc(m.name)+'</b><small>'+esc(m.description)+'</small></button>').join(""))+'</section>'+
    dailyChallengeLeaderboardMarkup()+
    '<div class="tb-bottom-strip"><span>Персонаж сохраняет уровень, таланты, экипировку и серебро</span><span>'+(c.heroic?"ГЕРОИЧЕСКИЙ РЕЖИМ":"Обычный режим")+'</span></div></section>';
 }
 function branchSkills(c){return skills.filter(skill=>skill.class_id===c.classId&&skill.branch_id===c.branch);}
 function resolveSkill(c,skillId){
  const base=(classData(c).base_skills||[]).find(skill=>skill.id===skillId);
  const catalog=skills.find(skill=>skill.id===skillId&&skill.class_id===c.classId);
  const source=base||catalog;
  if(!source)return null;
  const effect=balance.skill_effects[source.effect_template]||balance.skill_effects.strike||{};
  const unlockLevel=Number.isFinite(Number(source.unlock_level))?Number(source.unlock_level):1;
  const damage=Number(source.damage??source.damage_multiplier??effect.damage_multiplier??effect.heal_multiplier??effect.power_multiplier??0)||0;
  const defaultSkillCost=c.classId==="duelist"?(balance.resources.class_costs?.duelist?.attack_skill??22):(balance.resources.action_costs.attack_skill??0);
  const cost=Number(source.cost??source.resource_cost??effect.resource_cost??defaultSkillCost)||0;
  const skill={...source,unlock_level:unlockLevel,damage,cost,damage_multiplier:Number(source.damage_multiplier??source.damage??effect.damage_multiplier??1)||1,resource_cost:cost};
  if(skill.class_id&&skill.class_id!==c.classId)return null;
  if(skill.branch_id&&skill.branch_id!==c.branch)return null;
  return skill;
 }
 function getSkillStats(character,skill){
  const effect=balance.skill_effects[skill.effect_template]||balance.skill_effects.strike||{},saved=character.skillUpgrades?.[skill.id]||{},level=Math.max(1,Math.min(3,Number(saved.level)||1)),type=saved.type==="cost"||saved.type==="power"?saved.type:null,stacks=level-1;
  const baseCost=character.classId==="duelist"?(balance.resources.class_costs?.duelist?.attack_skill??22):(skill.cost??skill.resource_cost??effect.resource_cost??balance.resources.action_costs.attack_skill??0);
  return {level,type,cost:Math.max(0,baseCost*(type==="cost"?1-.2*stacks:1)),powerMultiplier:type==="power"?1+.2*stacks:1};
 }
 function skillSummary(skill,c){
  const effect=balance.skill_effects[skill.effect_template]||balance.skill_effects.strike||{};
  const cost=getSkillStats(c,skill).cost;
  const cooldown=skill.cooldown_turns??effect.cooldown_turns??effect.cooldown??0;
  const multiplier=skill.damage_multiplier??effect.damage_multiplier;
  const type=effect.type||"strike";
  let power="Эффект";
  if(["strike","aoe","dot","execute","control"].includes(type)&&multiplier!=null)power="Урон "+Math.round(Number(multiplier)*100)+"%";
  else if(type==="heal"||type==="hot")power="Лечение "+Math.round(Number(effect.heal_multiplier||0)*100)+"%";
  else if(type==="shield")power="Щит "+Math.round(Number(effect.shield_fraction||0)*100)+"%";
  else if(type==="buff"||type==="debuff")power="Эффект "+Math.round(Number(effect.power_multiplier||0)*100)+"%";
  return power+" · "+cost+" ресурса · Откат "+(cooldown||"—")+" х.";
 }
 function ensureLoadout(c){
  const base=(classData(c).base_skills||[]).filter(skill=>c.level>=(Number.isFinite(Number(skill.unlock_level))?Number(skill.unlock_level):1)),branch=branchSkills(c).filter(skill=>c.level>=(Number.isFinite(Number(skill.unlock_level))?Number(skill.unlock_level):1));
  const unlocked=[...base,...branch].filter((skill,index,all)=>all.findIndex(other=>other.id===skill.id)===index);
  const chosen=(Array.isArray(c.activeSkills)?c.activeSkills:Array.isArray(c.skillLoadout)?c.skillLoadout:[]).filter(id=>unlocked.some(skill=>skill.id===id)).filter((id,index,all)=>all.indexOf(id)===index).slice(0,6);
  for(const skill of unlocked){if(chosen.length>=6)break;if(!chosen.includes(skill.id))chosen.push(skill.id);}
  c.activeSkills=chosen;c.skillLoadout=chosen;return Array.from({length:6},(_,index)=>unlocked.find(skill=>skill.id===chosen[index])||null);
 }
 function activeSkill(c){return ensureLoadout(c).find(Boolean)||null;}
 function counterAbility(c){return balance.skills.counter_abilities[c.classId];}
 function ultimateAbility(c){return balance.skills.ultimates[c.classId];}
 function settings(){return engine?.state.account?.settings||{};}
 function playSfx(kind){
  const prefs=settings();if(prefs.sound_enabled===false)return;
  const volume=Math.max(0,Math.min(1,(prefs.volume_master??0.8)*(prefs.volume_effects??0.8)));
  if(volume<=0)return;
  try{
   const AudioCtor=window.AudioContext||window.webkitAudioContext;if(!AudioCtor)return;
   if(!audioContext)audioContext=new AudioCtor();
   if(audioContext.state==="suspended")audioContext.resume();
   const presets={click:{wave:"triangle",from:720,to:500,duration:0.045,level:0.12},card:{wave:"triangle",from:1250,to:690,duration:0.075,level:0.075},endturn:{wave:"sawtooth",from:245,to:58,duration:0.2,level:0.16},hit:{wave:"sawtooth",from:155,to:42,duration:0.13,level:0.23},crit:{wave:"square",from:920,to:115,duration:0.2,level:0.25},hurt:{wave:"sawtooth",from:105,to:42,duration:0.17,level:0.22}};
   const p=presets[kind]||presets.click,ctx=audioContext,now=ctx.currentTime;
   const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=p.wave;osc.frequency.setValueAtTime(p.from,now);osc.frequency.exponentialRampToValueAtTime(Math.max(25,p.to),now+p.duration);
   gain.gain.setValueAtTime(0.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(0.0002,volume*p.level),now+0.008);gain.gain.exponentialRampToValueAtTime(0.0001,now+p.duration);
   osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+p.duration+0.02);
   const noiseBurst=(duration,level,frequency,type)=>{const length=Math.max(1,Math.floor(ctx.sampleRate*duration)),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();source.buffer=buffer;filter.type=type;filter.frequency.value=frequency;g.gain.setValueAtTime(Math.max(.0001,volume*level),now);g.gain.exponentialRampToValueAtTime(.0001,now+duration);source.connect(filter);filter.connect(g);g.connect(ctx.destination);source.start(now);source.stop(now+duration);};
   if(kind==="card")noiseBurst(.055,.055,1500,"highpass");
   if(kind==="crit"){const chime=ctx.createOscillator(),cg=ctx.createGain();chime.type="sine";chime.frequency.setValueAtTime(1480,now);chime.frequency.exponentialRampToValueAtTime(430,now+0.16);cg.gain.setValueAtTime(0.0001,now);cg.gain.exponentialRampToValueAtTime(volume*0.11,now+0.01);cg.gain.exponentialRampToValueAtTime(0.0001,now+0.16);chime.connect(cg);cg.connect(ctx.destination);chime.start(now);chime.stop(now+0.17);noiseBurst(.13,.19,850,"highpass");const boom=ctx.createOscillator(),bg=ctx.createGain();boom.type="sine";boom.frequency.setValueAtTime(92,now);boom.frequency.exponentialRampToValueAtTime(32,now+.17);bg.gain.setValueAtTime(.0001,now);bg.gain.exponentialRampToValueAtTime(volume*.24,now+.012);bg.gain.exponentialRampToValueAtTime(.0001,now+.19);boom.connect(bg);bg.connect(ctx.destination);boom.start(now);boom.stop(now+.2);}
  }catch(error){}
 }
 function syncMusic(){
  if(!audioContext)return;
  const prefs=settings(),enabled=prefs.music_enabled!==false;
  const volume=Math.max(0,Math.min(1,(prefs.volume_master??.8)*(prefs.volume_music??.7)));
  const now=audioContext.currentTime;
  if(!musicNodes){
   const master=audioContext.createGain();master.gain.value=.0001;master.connect(audioContext.destination);
   const low=audioContext.createOscillator(),high=audioContext.createOscillator();
   low.type="sine";high.type="triangle";low.frequency.value=55;high.frequency.value=82.41;
   const lowGain=audioContext.createGain(),highGain=audioContext.createGain();lowGain.gain.value=.7;highGain.gain.value=.18;
   low.connect(lowGain);high.connect(highGain);lowGain.connect(master);highGain.connect(master);
   low.start();high.start();musicNodes={master,low,high};
  }
  const freqs=screen==="battle"?[73.42,110]:[55,82.41];
  musicNodes.low.frequency.setTargetAtTime(freqs[0],now,1.2);
  musicNodes.high.frequency.setTargetAtTime(freqs[1],now,1.2);
  musicNodes.master.gain.cancelScheduledValues(now);
  musicNodes.master.gain.setTargetAtTime(enabled?volume*.045:0.0001,now,.8);
 }
 function unlockAudioAndMusic(){
  try{const AudioCtor=window.AudioContext||window.webkitAudioContext;if(!AudioCtor)return;if(!audioContext)audioContext=new AudioCtor();if(audioContext.state==="suspended")audioContext.resume();syncMusic();}catch(error){}
 }
 function elementIcon(type){return({fire:"🔥",ice:"❄",dark:"☠",physical:"⚔"})[type]||"◇";}
 function elementLabel(type){return({fire:"Огонь",ice:"Лёд",dark:"Тьма",physical:"Физический"})[type]||type;}
 function setBattleTarget(index){
  if(!battle||!battle.enemies[index])return;
  if(!battle.enemies[index].alive||battle.enemies[index].hp<=0){
   const next=battle.enemies.find(enemy=>enemy.alive&&enemy.hp>0);
   if(next){setBattleTarget(next.index);return;}
   finishCurrentEnemy();return;
  }
  if(battle.telegraph&&battle.busy){notify("Дождись завершения хода противника");return;}
  try{engine.selectTarget(live().id,index);}catch(error){notify(error.message);return;}
  battle.targetIndex=index;battle.enemy=battle.enemies[index];battle.enemyStats=engine.getEnemyStats(live().id,battle.stage,battle.enemy);
  battle.enemyHp=battle.enemy.hp;battle.enemyMax=battle.enemy.maxHp;battle.shield=battle.enemy.shield||0;
  save();render();
 }
 function activeComboNextSlots(){
  if(!battle)return[];const configs=(balance.combos?.combos||[]).filter(combo=>combo.class===live().classId),slots=[];
  for(const combo of configs){const progress=battle.comboProgress?.[combo.id]||0,next=combo.chain[progress];if(next)slots.push({combo,slot:Number(String(next).replace("slot",""))-1,progress});}
  return slots;
 }
 function buildInitiative(){
  const c=live(),stats=engine.getCombatStats(c),playerSpeed=Math.max(.01,stats.speed||stats.attackSpeedMultiplier||1);
  const actors=[{type:"player",id:"player",name:c.name,speed:playerSpeed}];
  for(const enemy of battle.enemies||[])if(enemy.alive&&Number(enemy.hp)>0)actors.push({type:"enemy",id:"enemy-"+enemy.index,index:enemy.index,name:enemy.type==="boss"?"Босс":(balance.mobs.roles[enemy.role]?.name||"Моб")+" "+(enemy.index+1),speed:Math.max(.01,enemy.speed||1)});
  return actors.sort((a,b)=>b.speed-a.speed||(a.type==="player"?-1:b.type==="player"?1:a.index-b.index));
 }
 function syncInitiative(){battle.turnOrder=buildInitiative();battle.turnIndex=0;battle.actor=battle.turnOrder[0]||{type:"player",id:"player",name:live().name};}
 function showPlayerTurn(){
  const c=live();ensureCardDeck(c);if(c.classId==="shaman")c.totem=Math.min(3,(Number(c.totem)||0)+1);battle.shamanFreeMode=false;battle.assassinAttacksThisTurn=0;
  battle.isPlayerTurn=true;battle.timerRemainingMs=0;battle.timerStartedAt=0;
  battle.actor={type:"player",id:"player",name:c.name};battle.cardsPlayedThisTurn=0;battle.busy=false;battle.playerSkillUsed=false;battle.potionUsedThisTurn=false;battle.counterPrimed=false;battle.counterConsumed=false;battle.counterAction=null;
  if(battle.cardResume){battle.cardResume=false;battle.relicStartingDraw=0;}else{battle.cardBlock=0;c.currentEnergy=3;const innate=c.deck.filter(card=>card.innate);for(const card of innate){c.deck.splice(c.deck.indexOf(card),1);c.hand.push(card);}const relicDraw=Math.max(0,Number(battle.relicStartingDraw)||0);battle.relicStartingDraw=0;drawCards(Math.max(0,5-c.hand.length)+cardDrawBonus(c)+relicDraw);}
  for(const id of Object.keys(battle.skillCooldowns||{}))battle.skillCooldowns[id]=Math.max(0,battle.skillCooldowns[id]-1);
  planEnemyIntents();
  battle.counterCooldownTurns=Math.max(0,(battle.counterCooldownTurns||0)-1);battle.ultimateCooldownTurns=Math.max(0,(battle.ultimateCooldownTurns||0)-1);
  const preview=(battle.enemies||[]).find(enemy=>enemy.alive);
  battle.telegraph=preview?{type:"strong_hit",targetIndex:preview.index,label:enemyIntentText(preview),icon:"⚔",color:"#ff465e"}:null;
 }
 function addSummonedBossMobs(){
  if(battle.bossAddsSummoned)return;const c=live();battle.bossAddsSummoned=true;
  for(let n=0;n<2;n++){const index=battle.enemies.length,role=n===0?"poison":"normal",mob={index,type:"normal",role,weakness:null,resistance:null,statMultiplier:1,poison:0,bleed:0,weak:0,vulnerable:0},stats=engine.getEnemyStats(c.id,battle.stage,mob),hp=stats.hp;c.run.stage.mobs.push(mob);battle.enemies.push({...mob,id:"boss-add-"+index,hp,maxHp:hp,alive:true,shield:0,pendingAttack:false,turnsTaken:0,speed:1});}
  battle.count=battle.enemies.length;notify("Босс призвал двух прислужников");
 }
 function updateBossPhase(target=battle?.enemy){
  if(!battle||target?.type!=="boss")return 1;
  target.maxPhases=Math.max(2,(balance.bosses.phases||[]).length||4);
  const phase=Math.max(1,Number(engine.bossPhaseInfo(target.hp,target.maxHp).phase)||1),previous=Math.max(1,Number(target.phase)||1);
  if(phase>previous){
   for(let nextPhase=previous+1;nextPhase<=phase;nextPhase++){
    target.phase=nextPhase;target.alive=true;target.dead=false;target.pendingAttack=false;target.pendingAction=null;target.hp=Math.max(1,Number(target.hp)||0);
    battle.phaseFlashUntil=Date.now()+1000;battle.phaseNotice="ФАЗА "+nextPhase;logCombatEvent("ФАЗА "+nextPhase+"! БОСС В ЯРОСТИ","#ff765e");notify("ФАЗА "+nextPhase+"! БОСС В ЯРОСТИ!");
    if(nextPhase===2)addSummonedBossMobs();
    if(nextPhase===3){const phaseConfig=(balance.bosses.phases||[]).find(item=>Number(item.phase)===3)||{};if(phaseConfig.immediate_attack){const c=live(),stats=engine.getEnemyStats(c.id,battle.stage,target),weakMultiplier=Number(target.weak)>0?.75:1,dailyMultiplier=c.run.dailyChallengeActive&&c.run.dailyChallengeModifier==="rage"?1.2:1,strike=Math.max(1,Math.round(Number(stats.damage||0)*weakMultiplier*dailyMultiplier*1.15));logCombatEvent("НЕМЕДЛЕННАЯ АТАКА · третья фаза","#ff8c69");applyEnemyHit(target,strike);if(!battle)return nextPhase;}}
    if(nextPhase===4){const phaseConfig=(balance.bosses.phases||[]).find(item=>Number(item.phase)===4)||{},deadline=Math.max(1,Number(phaseConfig.player_turn_deadline??balance.bosses.player_turn_deadline??4)),turnOffset=battle.actor?.type==="enemy"?1:0;battle.bossDeadlineTurns=(Number(battle.playerTurnCount)||0)+deadline+turnOffset;}
   }
   const armorRestore=Math.max(8,Math.round(target.maxHp*.12));target.shield=Math.max(0,Number(target.shield)||0)+armorRestore;logCombatEvent("Броня босса восстановлена · +"+armorRestore,"#ff765e");
  }
  target.phase=phase;target.maxPhases=Math.max(2,(balance.bosses.phases||[]).length||4);
  if(target.index===battle.targetIndex){battle.bossPhase=phase;battle.enemy=target;battle.enemyHp=target.hp;battle.enemyMax=target.maxHp;battle.shield=target.shield||0;}
  return phase;
 }
 function applyEnemyHit(attacker,raw){
  if(!battle||!attacker||attacker.alive!==true||Number(attacker.hp)<=0){if(attacker){attacker.alive=false;attacker.dead=true;attacker.hp=0;attacker.pendingAttack=false;}return;}
  const c=live(),phase=attacker.type==="boss"?engine.bossPhaseInfo(attacker.hp,attacker.maxHp).phase:0;
  let counterDamageMultiplier=1;
  if(battle.counterPrimed&&!battle.counterConsumed&&(battle.counterTargetIndex===undefined||battle.counterTargetIndex===attacker.index)){
   const reaction=battle.counterAction||counterAbility(c),effect=reaction?.effect||"damage_reduction";
   battle.counterConsumed=true;battle.counterPrimed=false;battle.counterTargetIndex=attacker.index;
   battle.actionDamageLedger={};
   if(effect==="evade"||effect==="absorb_all"||effect==="stun"||effect==="riposte")counterDamageMultiplier=0;
   else if(effect==="damage_reduction"||effect==="slow")counterDamageMultiplier=1-Math.max(0,Math.min(1,Number(reaction.damage_reduction??(effect==="slow"?.8:.5))));
   else counterDamageMultiplier=.5;
   if(effect==="stun"){notify("РЁВ · атака противника прервана");}
   else if(effect==="slow"){attacker.slowTurns=Math.max(Number(attacker.slowTurns)||0,1);attacker.slowReduction=Math.max(0,Math.min(1,Number(reaction.speed_reduction)||0));notify("ЗАМЕДЛЕНИЕ · получаемый урон снижен");}
   else if(effect==="cleanse"){
    if((battle.poisonStacks||0)>0)battle.poisonStacks=Math.max(0,battle.poisonStacks-Number(reaction.remove_stacks||1));
    else if((battle.playerBleed||0)>0)battle.playerBleed=Math.max(0,battle.playerBleed-Number(reaction.remove_stacks||1));
    else battle.playerWeakTurns=Math.max(0,(Number(battle.playerWeakTurns)||0)-1);
    notify("ОЧИЩЕНИЕ · негативный эффект снят, урон снижен");
   }else if(effect==="riposte"){
    const riposte=Math.max(1,Math.round(engine.getCombatStats(c).dps*(Number(reaction.damage_multiplier)||1)));
    const counter=applyTargetDamage(attacker,riposte,"physical");if(!battle)return;
    if(c.run.playerHp<=0){endFromDamage();return;}
    notify("ПАРИРОВАНИЕ · ответный удар "+counter.dealt+" урона");
    if(counter.killed){battle.telegraph=null;battle.enemy=attacker;battle.targetIndex=attacker.index;engine.selectTarget(c.id,attacker.index);finishCurrentEnemy();return;}
   }else if(effect==="evade")notify("ТЕНЬ · атака уклонена");
   else if(effect==="absorb_all")notify("БАРЬЕР · атака полностью поглощена");
   else if(effect==="damage_reduction")notify("ЧЕШУЯ · урон снижен");
   if(counterDamageMultiplier===0)return;
  }
  const branchStats=balance.classes.branch_stat_bonuses?.[c.classId+"."+c.branch]||{},branchCounterChance=Number(branchStats.counterattack_chance)||0,parryChance=Math.max(branchCounterChance,Number(battle.parryChance)||0);battle.parryChance=0;if(parryChance>0&&gameRandom()<parryChance){const iceCounter=c.classId==="dragonkin",riposte=Math.max(1,Math.round(engine.getCombatStats(c).dps*(Number(branchStats.counterattack_damage_multiplier)||(iceCounter?.75:1.2))));battle.actionDamageLedger={};const counter=applyTargetDamage(attacker,riposte,iceCounter?"ice":"physical");if(!battle)return;notify((iceCounter?"ЛЕДЯНАЯ ЗАЩИТА":"ПАРИРОВАНИЕ")+" · КОНТРАТАКА −"+counter.dealt+" HP");if(c.run.playerHp<=0){endFromDamage();return;}if(counter.killed){battle.telegraph=null;battle.enemy=attacker;battle.targetIndex=attacker.index;engine.selectTarget(c.id,attacker.index);finishCurrentEnemy();return;}return;}
  let incoming=Math.max(0,Math.round(raw*engine.mitigationMultiplier(engine.getCombatStats(c).defense,battle.stage)*counterDamageMultiplier));
  const bleedAttack=attacker?.role==='bleed'||attacker?.intent?.type==='bleed'||attacker?.intent?.damageType==='bleed';if(bleedAttack)incoming=Math.round(incoming*(1-Math.min(.75,Math.max(0,Number(c.guildBuffs?.bleed_resist)||0)*.05)));
  if((battle.enemyDamageReductionTurns||0)>0)incoming=Math.round(incoming*(1-(battle.enemyDamageReduction||0)));
  const blockedByCards=Math.min(Math.max(0,Number(battle.cardBlock)||0),incoming);incoming=Math.max(0,incoming-blockedByCards);battle.cardBlock=Math.max(0,(Number(battle.cardBlock)||0)-blockedByCards);
  if((battle.nextDamageShield||0)>0){incoming=Math.max(0,incoming-battle.nextDamageShield);battle.nextDamageShield=0;}
  c.run.playerHp=Math.max(0,c.run.playerHp-incoming);if(incoming>0)logCombatEvent("Вы получили "+incoming+" урона","#ff7777");if(incoming>0&&c.classId==="destroyer")c.rage=Math.min(10,(Number(c.rage)||0)+1);
  if(blockedByCards>0)notify("Щит карт поглотил "+blockedByCards+" урона"+(incoming>0?" · получено "+incoming:" · атака полностью отражена"));
  else notify("Враг наносит "+incoming+" урона");
  if(incoming>0){pulseCombatActor("player","hit");if(navigator.vibrate)navigator.vibrate(50);showFloatingText("player","-"+incoming,"#ff596b");playSfx("hurt");if(!settings().disable_screen_shake&&incoming>=Math.max(1,Math.round(engine.maxHp(c)*.1)))battle.shakeUntil=Date.now()+280;}
  else if(blockedByCards>0)showFloatingText("player","БЛОК "+blockedByCards,"#78c9ff");
  triggerVfx("enemy-hit","physical",phase===4||attacker.type==="boss");
  if(c.run.playerHp<=0)endFromDamage();
 }
 function decayEnemyDebuffs(enemy){if(!enemy)return;enemy.weak=Math.max(0,Number(enemy.weak)||0);enemy.vulnerable=Math.max(0,Number(enemy.vulnerable)||0);if(enemy.weak>0)enemy.weak--;if(enemy.vulnerable>0)enemy.vulnerable--;}
 function enemyTurn(enemy){
  if(!battle||!enemy||enemy.alive!==true||Number(enemy.hp)<=0){if(enemy){enemy.alive=false;enemy.dead=true;enemy.hp=0;enemy.pendingAttack=false;enemy.pendingAction=null;}return;}
  const c=live();enemy.turnsTaken=(enemy.turnsTaken||0)+1;enemy.pendingAttack=false;if(enemy.type==="boss")logCombatEvent("Босс готовит атаку · фаза "+(enemy.phase||1),"#ffb36b");
  const poison=Math.max(0,Number(enemy.poison)||0),bleed=Math.max(0,Number(enemy.bleed)||0);
  if(poison>0||bleed>0){const dotDamage=poison+bleed;enemy.hp=Math.max(0,enemy.hp-dotDamage);enemy.poison=Math.max(0,poison-1);enemy.bleed=Math.max(0,bleed-1);if(poison>0)showFloatingText(enemy,"-"+poison,"#65e58b","poison");if(bleed>0)showFloatingText(enemy,"-"+bleed,"#ff5c61","bleed");notify("Яд/кровотечение · −"+dotDamage+" HP");if(enemy.type==="boss"){updateBossPhase(enemy);if(!battle)return;}if(enemy.hp<=0){enemy.alive=false;enemy.dead=true;shakeBattleArena();finishCurrentEnemy();return;}}
  if(enemy.type==="boss"){
   battle.bossTurns=(battle.bossTurns||0)+1;
   if(battle.bossTurns>15){c.run.playerHp=0;notify("ЯРОСТЬ БОССА · Время вышло");endFromDamage();return;}
  }
  if(enemy.stunned){enemy.stunned=false;decayEnemyDebuffs(enemy);notify("Враг оглушён · ход пропущен");return;}
  const planned=enemy.role==="healer"&&enemy.provoked?{type:"attack"}:(enemy.intent||null);
  if(enemy.role==="saboteur"||planned?.type==="sabotage"){
   const cardId=planned?.cardId||(gameRandom()<.5?"curse_wound":"status_slime"),jammed=createCardInstance(cardId);
   if(jammed){jammed.sabotageSource=enemy.id;if(c.hand.length<10){c.hand.push(jammed);notify("🃏 Саботажник засорил руку картой «"+jammed.name+"»");}else{c.discard.push(jammed);notify("🃏 Саботажник добавил «"+jammed.name+"» в сброс");}}
   decayEnemyDebuffs(enemy);save();render();return;
  }
  if(planned?.type==="heal"){const ally=(battle.enemies||[]).find(x=>x.index===planned.targetIndex&&x.alive&&x.hp>0);if(ally){ally.hp=Math.min(ally.maxHp,ally.hp+planned.amount);if(ally.index===battle.targetIndex)battle.enemyHp=ally.hp;notify("Лекарь восстановил "+planned.amount+" HP союзнику");}decayEnemyDebuffs(enemy);return;}
  if(enemy.role==="healer"&&enemy.provoked){enemy.provoked=false;}
  if(enemy.role==="tank"&&enemy.pendingCleanseDebuff){enemy.pendingCleanseDebuff=false;enemy.debuffKind=null;battle.dots=Array.isArray(battle.dots)?battle.dots:(battle.dot?[battle.dot]:[]);const ownDotIndex=battle.dots.findIndex(dot=>Number(dot?.targetIndex)===Number(enemy.index));if(ownDotIndex>=0){battle.dots.splice(ownDotIndex,1);notify("Танк очищает свой периодический эффект");}battle.dot=battle.dots[0]||null;}
  else if(planned?.type==="defend"||enemy.role==="tank"&&enemy.turnsTaken%3===0)enemy.guardCharges=Math.max(1,Number(enemy.guardCharges)||0);
  if(planned?.type==="poison"||enemy.role==="poison"){const guildResist=Math.min(.9,Math.max(0,Number(c.guildBuffs?.poison_resist)||0)*.05);if(gameRandom()>=guildResist){battle.poisonStacks=(battle.poisonStacks||0)+1;notify("ОТРАВЛЕН · Яд: "+battle.poisonStacks+" стак.");}else notify("Гильдейская защита нейтрализовала яд");}
  if(planned?.type==="bleed"||enemy.role==="bleed"){const guildResist=Math.min(.9,Math.max(0,Number(c.guildBuffs?.bleed_resist)||0)*.05);if(gameRandom()>=guildResist){battle.playerBleed=(battle.playerBleed||0)+1;notify("Кровотечение · "+battle.playerBleed+" стак.");}else notify("Гильдейская защита остановила кровотечение");}
  const plannedAction=planned?.type||"attack";
   if(plannedAction==="boss_guard"){const guard=Math.max(1,Math.round(enemy.maxHp*.1));enemy.shield=Math.max(0,Number(enemy.shield)||0)+guard;showFloatingText(enemy,"БАРЬЕР +"+guard,"#8fcfff");logCombatEvent("Босс укрепляет защиту","#8fcfff");decayEnemyDebuffs(enemy);return;}
   if(plannedAction==="boss_mirror"){enemy.reflectTurns=1;showFloatingText(enemy,"ЗЕРКАЛО","#c59cff");logCombatEvent("Зеркальный барьер: следующий удар вернёт 25% урона","#c59cff");}
   if(plannedAction==="boss_summon"){addSummonedBossMobs();if(!battle)return;}
   if(enemy.mechanic==="summon"&&enemy.type==="elite"&&!enemy.eliteSummoned){enemy.eliteSummoned=true;for(let n=0;n<2;n++){const index=battle.enemies.length,mob={index,type:"normal",role:n===0?"poison":"normal",weakness:enemy.weakness,resistance:enemy.resistance,statMultiplier:.55},summonStats=engine.getEnemyStats(c.id,battle.stage,mob),hp=Math.max(1,Math.round(summonStats.hp*(balance.elite_mechanics.summon.minion_health_fraction||.2)));c.run.stage.mobs.push(mob);battle.enemies.push({...mob,id:"elite-add-"+index,hp,maxHp:hp,alive:true,shield:0,turnsTaken:0,speed:1});}battle.count=battle.enemies.length;notify("Элитный противник призвал двух прислужников");}
   const stats=engine.getEnemyStats(c.id,battle.stage,enemy),weakMultiplier=Number(enemy.weak)>0?.75:1,bossPhase=enemy.type==="boss"?Math.max(1,Number(enemy.phase)||1):1;
   battle.telegraph=null;
   const dailyMultiplier=c.run.dailyChallengeActive&&c.run.dailyChallengeModifier==="rage"?1.2:1,slowMultiplier=Number(enemy.slowTurns)>0?1-Math.max(0,Math.min(1,Number(enemy.slowReduction)||0)):1;
   const berserk=enemy.type==="elite"&&enemy.mechanic==="berserk"&&enemy.hp/Math.max(1,enemy.maxHp)<=(balance.elite_mechanics.berserk.health_threshold||.3)?(balance.elite_mechanics.berserk.damage_multiplier||2):1;
   const teleport=enemy.type==="elite"&&enemy.mechanic==="teleport"&&enemy.turnsTaken%3===0?1+(balance.elite_mechanics.teleport.bonus_damage_fraction||.2):1;
   const heavy=plannedAction==="boss_heavy"?1.55:plannedAction==="boss_quake"?1.25:1;
   const strike=Math.max(1,Math.round(Number(stats.damage||0)*weakMultiplier*dailyMultiplier*(bossPhase>=3?1.15:1)*slowMultiplier*berserk*teleport*heavy));if(Number(enemy.slowTurns)>0)enemy.slowTurns=Math.max(0,Number(enemy.slowTurns)-1);
   const hpBeforeAttack=c.run.playerHp;applyEnemyHit(enemy,strike);
   if(plannedAction==="boss_double"&&c.run.playerHp>0){logCombatEvent("Босс проводит вторую атаку","#ff8c69");applyEnemyHit(enemy,Math.max(1,Math.round(strike*.6)));}
   if(plannedAction==="boss_poison"&&c.run.playerHp>0){battle.poisonStacks=(battle.poisonStacks||0)+1;notify("ЯДОВИТОЕ ДЫХАНИЕ · яд +1");}
   if((plannedAction==="boss_bleed"||plannedAction==="boss_quake")&&c.run.playerHp>0){battle.playerBleed=(battle.playerBleed||0)+(plannedAction==="boss_quake"?2:1);notify("КРОВОТЕЧЕНИЕ · "+battle.playerBleed+" стак.");}
   if(plannedAction==="boss_hex"&&c.run.playerHp>0){battle.playerWeakTurns=Math.max(2,Number(battle.playerWeakTurns)||0);notify("ПРОКЛЯТИЕ · ваши атаки ослаблены");}
   if(plannedAction==="boss_drain"&&c.run.playerHp<hpBeforeAttack&&enemy.alive){const healed=Math.max(1,Math.round((hpBeforeAttack-c.run.playerHp)*.5));enemy.hp=Math.min(enemy.maxHp,enemy.hp+healed);showFloatingText(enemy,"+"+healed,"#65df9a");}
   if(enemy.type==="boss"&&bossPhase>=2&&enemy.alive&&c.run.playerHp>0&&plannedAction!=="boss_double"){logCombatEvent("Босс проводит дополнительный удар ярости","#ff8c69");applyEnemyHit(enemy,Math.max(1,Math.round(strike*.35)));}
   if(enemy.type==="boss"&&bossPhase>=3&&c.run.playerHp>0){battle.playerWeakTurns=Math.max(1,Number(battle.playerWeakTurns)||0);logCombatEvent("Ярость финальной фазы · вы ослаблены","#c28cff");}
   if(enemy.type==="elite"&&enemy.mechanic==="poison"&&c.run.playerHp>0&&c.run.playerHp<hpBeforeAttack){battle.poisonStacks=(battle.poisonStacks||0)+1;notify("ЭЛИТНЫЙ ЯД · яд +1");}
   decayEnemyDebuffs(enemy);
 }
 function clearPendingTurnTimer(){if(pendingTimer!==null){clearTimeout(pendingTimer);pendingTimer=null;}}
 function safeTimeoutMs(value,fallback=1000){
  const parsed=Number(value);
  return Number.isFinite(parsed)?Math.max(0,Math.min(60000,Math.round(parsed))):fallback;
 }
 function scheduleEnemyTurnQueue(queue,index,token,delay){
  if(!battle||token!==battle.enemyQueueToken)return;
  battle.enemyQueueState={indices:(queue||[]).map(enemy=>Number(enemy.index)).filter(Number.isFinite),cursor:Math.max(0,Number(index)||0)};
  clearPendingTurnTimer();
  const safeDelay=Math.max(16,safeTimeoutMs(delay,1000));
  if(window.__TB_BALANCE_TEST_MODE&&window.__TB_BALANCE_SYNC_TURNS){pendingTimer=null;if(battle){battle.timerRemainingMs=0;battle.timerStartedAt=0;}runEnemyTurnQueue(queue,index,token);return;}
  if(battle){battle.timerRemainingMs=safeDelay;battle.timerStartedAt=Date.now();}
  pendingTimer=setTimeout(()=>{
   pendingTimer=null;
   if(battle){battle.timerRemainingMs=0;battle.timerStartedAt=0;}
   runEnemyTurnQueue(queue,index,token);
  },safeDelay);
 }
 function recoverBattleControl(error,message,clearQueue=true){
  console.error("Towerbound battle recovered after action error",error);
  if(!battle)return;
  clearPendingTurnTimer();battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;
  if(clearQueue)battle.enemyQueueState=null;
  battle.isPlayerTurn=true;battle.timerRemainingMs=0;battle.timerStartedAt=0;
  battle.busy=false;battle.isCardAnimating=false;battle.finishingEnemy=false;
  battle.actor={type:"player",id:"player",name:live()?.name||"Игрок"};battle.telegraph=null;
  const detail=error?.message?String(error.message).slice(0,180):"";
  notify((message||"Ошибка действия · управление возвращено игроку")+(detail?" · "+detail:""));
  try{save();render();}catch(renderError){console.error("Battle recovery render failed",renderError);}
 }
 function recoverPlayerTurn(error){recoverBattleControl(error,"Ошибка хода противника · управление возвращено игроку",true);}
 function resumeEnemyTurnQueue(delay=180){
  if(!battle||!battle.enemyQueueState)return false;
  const indices=Array.isArray(battle.enemyQueueState.indices)?battle.enemyQueueState.indices:[];
  const queue=indices.map(index=>(battle.enemies||[]).find(enemy=>Number(enemy.index)===Number(index))).filter(Boolean);
  const cursor=Math.max(0,Math.min(queue.length,Number(battle.enemyQueueState.cursor)||0));
  battle.paused=false;battle.busy=true;battle.isPlayerTurn=false;
  battle.actor={type:"enemy",id:"enemy-phase",name:"Ход противников"};
  scheduleEnemyTurnQueue(queue,cursor,battle.enemyQueueToken||0,delay);
  return true;
 }
 function advanceToPlayerTurn(){
  if(!battle)return;
  clearPendingTurnTimer();battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;battle.enemyQueueState=null;
  battle.busy=false;battle.actor={type:"player",id:"player",name:live().name};battle.telegraph=null;
  showPlayerTurn();save();render();
 }
 function runEnemyTurnQueue(queue,index,token){
  if(!battle||token!==battle.enemyQueueToken)return;
  if(screen!=="battle"){scheduleEnemyTurnQueue(queue,index,token,250);return;}
  battle.isPlayerTurn=false;
  try{
   if(battle.paused){scheduleEnemyTurnQueue(queue,index,token,250);return;}
   if(index>=queue.length){
    battle.enemyQueueState=null;
    battle.playerTurnCount=(battle.playerTurnCount||0)+1;battle.round=(battle.round||1)+1;if((battle.playerWeakTurns||0)>0)battle.playerWeakTurns--;
    const deadlineBoss=(battle.enemies||[]).find(enemy=>enemy.type==="boss"&&enemy.alive&&Number(enemy.hp)>0);
    if(deadlineBoss&&battle.bossDeadlineTurns!==null&&battle.bossDeadlineTurns!==undefined&&battle.playerTurnCount>=Number(battle.bossDeadlineTurns)&&engine.bossPhaseInfo(deadlineBoss.hp,deadlineBoss.maxHp).phase===4){
     const phaseConfig=(balance.bosses.phases||[]).find(item=>Number(item.phase)===4)||{};
     const enrageDamage=Math.max(0,Number(phaseConfig.damage_flat??balance.bosses.damage_flat)||0);
     const c=live();c.run.playerHp=Math.max(0,c.run.playerHp-enrageDamage);if(enrageDamage>0&&c.classId==="destroyer")c.rage=Math.min(10,(Number(c.rage)||0)+1);
     notify("ЯРОСТЬ БОССА · "+enrageDamage+" урона · время вышло");showFloatingText("player","-"+enrageDamage,"#ff596b");endFromDamage();return;
    }
    if((battle.poisonStacks||0)>0){
     const c=live(),stacks=Math.max(0,Number(battle.poisonStacks)||0),tick=Math.round(engine.maxHp(c)*.05*stacks);
     c.run.playerHp=Math.max(0,c.run.playerHp-tick);battle.poisonStacks=Math.max(0,stacks-1);if(tick>0&&c.classId==="destroyer")c.rage=Math.min(10,(Number(c.rage)||0)+1);
     if(c.run.playerHp<=0){endFromDamage();return;}
    }
    if((battle.playerBleed||0)>0){const c=live(),tick=Math.round(engine.maxHp(c)*.03*battle.playerBleed);c.run.playerHp=Math.max(0,c.run.playerHp-tick);battle.playerBleed=Math.max(0,battle.playerBleed-1);if(c.run.playerHp<=0){endFromDamage();return;}}
    if((battle.playerDamageBuffTurns||0)>0)battle.playerDamageBuffTurns--;
    if((battle.enemyDamageReductionTurns||0)>0)battle.enemyDamageReductionTurns--;
    advanceToPlayerTurn();return;
   }
   const enemy=queue[index];
   if(enemy&&enemy.alive===true&&Number(enemy.hp)>0)enemyTurn(enemy);
   else if(enemy){enemy.alive=false;enemy.dead=true;enemy.hp=0;enemy.pendingAttack=false;enemy.pendingAction=null;}
   if(!battle)return;
   if(reconcileBattleCompletion())return;
   const nextIndex=queue.findIndex((candidate,i)=>i>index&&candidate.alive===true&&Number(candidate.hp)>0);
   battle.enemyQueueState={indices:nextIndex<0?[]:queue.map(candidate=>Number(candidate.index)).filter(Number.isFinite),cursor:nextIndex<0?0:nextIndex};
   save();render();
   scheduleEnemyTurnQueue(nextIndex<0?[]:queue,nextIndex<0?0:nextIndex,token,500);
  }catch(error){recoverPlayerTurn(error);}
 }

 function specializationSynergyPayload(character,card,target,baseEffects){
  const branchId=String(character?.branch||"");
  if(!branchId||String(card?.branchId||"")!==branchId)return null;
  const branch=(classData(character)?.branches||[]).find(item=>item.id===branchId);
  const invested=(branch?.talents||[]).reduce((sum,talent)=>sum+Math.max(0,Number(character?.talents?.[talent.id])||0),0);
  const relicBonus=Math.max(0,Number(battle?.relicBranchSynergyBonus)||0),potency=Math.min(4,1+Math.min(2,Math.floor(invested/10))+relicBonus),effects={},cardIsAttack=isAttackCard(card,baseEffects||cardEffects(card)),add=(key,value)=>{effects[key]=(Number(effects[key])||0)+value;};
  let label="";
  switch(branchId){
   case "bleed":add("bleed",potency);label="Кровавый резонанс · +"+potency+" кровотечения";break;
   case "poison":add("poison",potency);label="Токсичный резонанс · +"+potency+" яда";break;
   case "execution":if(cardIsAttack&&target&&Number(target.hp)<=Number(target.maxHp)*.5){add("damage",2+potency*2);label="Казнь · +"+(2+potency*2)+" урона по ослабленной цели";}else{add("vulnerable",1);label="Приговор · +1 уязвимость";}break;
   case "exorcism":add("weak",potency);label="Очищение · +"+potency+" слабости";break;
   case "healing":add("heal",2+potency*2);label="Благодать · +"+(2+potency*2)+" лечения";break;
   case "buffs":add("fury",potency);label="Боевой псалом · +"+(potency*10)+"% силы";break;
   case "fire_dragon":add("burn",potency);label="Пламенный резонанс · +"+potency+" горения";break;
   case "ice_dragon":add("block",2+potency);add("weak",1);label="Ледяная крепость · +"+(2+potency)+" брони и слабость";break;
   case "black_dragon":add("vulnerable",1);add("heal",potency);label="Поглощение пустоты · уязвимость и лечение "+potency;break;
   case "fists":if(cardIsAttack){add("damage",2+potency);label="Шквал кулаков · +"+(2+potency)+" урона";}else{add("block",2+potency);add("nextAttackDamage",2);label="Стойка бойца · броня и усиление удара";}break;
   case "greatsword":if(cardIsAttack){add("damage",3+potency*2);effects.ignoreArmor=true;label="Разлом брони · +"+(3+potency*2)+" урона без брони";}else{add("block",2+potency);label="Стойка титана · дополнительная броня";}break;
   case "wand_shield":add("block",2+potency);add("nextAttackDamage",2);label="Арканический заслон · броня и усиление удара";break;
   case "darkness":add("vulnerable",potency);label="Метка тьмы · +"+potency+" уязвимости";break;
   case "water":add("draw",potency);add("energy",1+Math.floor((potency-1)/2));label="Прилив · добор "+potency+" карты и +"+(1+Math.floor((potency-1)/2))+" энергия";break;
   case "earth":add("block",3+potency);add("weak",1);label="Каменный оплот · броня и слабость";break;
   case "dual_swords":if(cardIsAttack){add("damage",2+potency);label="Танец клинков · +"+(2+potency)+" урона";}else{add("nextAttackDamage",2+potency);label="Танец клинков · усиление следующей атаки";}add("draw",1);break;
   case "sword_shield":add("block",2+potency);add("nextAttackDamage",2);label="Стальная стойка · броня и контратака";break;
   case "rapier":add("vulnerable",1);add("nextAttackDamage",2+potency);label="Точный выпад · уязвимость и усиление атаки";break;
   case "spirits":add("poison",potency);add("bleed",potency);label="Зов предков · +"+potency+" яда и кровотечения";break;
   case "dark_gods":if(cardIsAttack){add("damage",2+potency);add("vulnerable",1);label="Дар тёмных богов · урон и уязвимость";}else{add("weak",1);add("heal",potency);label="Милость тёмных богов · слабость и лечение";}break;
   case "nature":add("poison",1);add("weak",1);add("heal",potency);label="Живые корни · яд, слабость и лечение";break;
   default:return null;
  }
  const setPower=Math.min(.15,Math.max(0,Number(engine.getCombatStats(character).specializationPower)||0));if(setPower>0)for(const key of ["damage","block","heal","nextAttackDamage"]){if(Number(effects[key])>0)effects[key]=Math.round(Number(effects[key])*(1+setPower));}
  return{effects,label:label+(setPower>0?" · сила сета +"+Math.round(setPower*100)+"%":"")+(relicBonus>0?" · реликвия +"+relicBonus:"")};
 }
 function previewCardEffects(card,character,target){
  const effects=applyTreeCardBonuses(card,cardEffects(card),character?._treeCache||rebuildTreeCache(character)),next=(Number(battle?.specializationResonance)||0)+1;
  if(next>=2){const payload=specializationSynergyPayload(character,card,target,effects);if(payload)for(const [key,value] of Object.entries(payload.effects)){if(typeof value==="boolean")effects[key]=value;else effects[key]=(Number(effects[key])||0)+Number(value||0);}}
  return effects;
 }
 function applySpecializationCardSynergy(character,card,effects,target){
  if(!battle||!character||!card?.branchId||card.branchId!==character.branch)return null;
  battle.specializationResonance=(Number(battle.specializationResonance)||0)+1;
  if(battle.specializationResonance<2)return null;
  battle.specializationResonance=0;
  const payload=specializationSynergyPayload(character,card,target,effects);
  if(!payload)return null;
  for(const [key,value] of Object.entries(payload.effects)){if(typeof value==="boolean")effects[key]=value;else effects[key]=(Number(effects[key])||0)+Number(value||0);}
  return payload.label;
 }
 function getCardDamageWithTalents(card,character,energySpent,effectsOverride){
  if(!card||!character)return 0;
  const effects=effectsOverride||cardEffects(card),base=Number(effects.damage)||Number(effects.damageAll)||0;
  const isXCost=!!(card.isXCost||card.costX),energy=Number.isFinite(Number(energySpent))?Math.max(0,Number(energySpent)):(isXCost?Math.max(0,Number(character.currentEnergy)||0):0);
  const perEnergy=isXCost?Math.max(0,Number(effects.damagePerEnergy)||0)*energy:0;
  if(base<=0&&perEnergy<=0)return 0;
  const treeCache=character._treeCache||rebuildTreeCache(character),conditional=Number(effects.bonusDamageIfBlock)>0&&(battle?.cardBlock||0)>0?Number(effects.bonusDamageIfBlock):0,treeDamageFlat=Number(treeCache.damageFlat)||0,treeDamagePercent=Number(treeCache.damagePercent)||0;
  const branches=classData(character)?.branches||[],branch=branches.find(entry=>entry.id===character.branch);
  const powerTalent=(branch?.talents||[]).find(talent=>/сила\s*$/i.test(String(talent.name||"")));
  const powerRank=Math.max(0,Number(character.talents?.[powerTalent?.id])||0);
  const talentBonus=powerRank*2,damageType=effects.damageType||card.damageType||"physical";
  const isMagic=isMagicCard(card,effects),guildMagicBonus=isMagic?Math.round((base+perEnergy)*Math.max(0,Number(character.guildBuffs?.magic_attack)||0)*.02):0;
  const specializationScale=card.branchId&&card.branchId===character.branch?1+Math.max(0,Number(engine.getCombatStats(character).specializationDamage)||0):1;
  return Math.max(0,Math.round((base+perEnergy+conditional+talentBonus+guildMagicBonus+treeDamageFlat)*(1+treeDamagePercent)*specializationScale)+Math.max(0,Number(battle?.relicAttackBonus)||0));
 }
 function classResourceMarkup(c){
  if(c){for(const [key,value] of Object.entries({combo:0,rage:0,charges:0,faith:0,element:"fire",magicCharge:0,totem:0}))if(c[key]===undefined||c[key]===null)c[key]=value;}
  const id=String(c?.classId||"");
  const defs={assassin:{icon:"🩸",label:"Комбо",key:"combo",max:3},destroyer:{icon:"🔥",label:"Ярость",key:"rage",max:10},duelist:{icon:"⚡",label:"Заряды",key:"charges",max:5},bishop:{icon:"✝️",label:"Вера",key:"faith",max:5},dragonkin:{icon:"🐉",label:"Стихия",key:"element",max:0},elemental:{icon:"🔮",label:"Магия",key:"magicCharge",max:10},shaman:{icon:"🌿",label:"Тотемы",key:"totem",max:3}};
  const d=defs[id];if(!d)return "";
  const value=d.key==="element"?(c.element||"fire"):Math.max(0,Number(c[d.key])||0);
  const names={fire:"Огонь",ice:"Лёд",dark:"Тьма",lightning:"Молния",water:"Вода",earth:"Земля",arcane:"Аркана"};
  const text=d.key==="element"?(names[String(value).toLowerCase()]||String(value)):value+"/"+d.max;
  const armed=id==="shaman"&&!!battle?.shamanFreeMode;
  const branch=(classData(c)?.branches||[]).find(item=>item.id===c.branch),resonance=Math.max(0,Number(battle?.specializationResonance)||0),branchLabel=branch?.name||"Специализация";
  return '<div class="tb-class-resource '+(armed?'is-armed':'')+'" id="classResourceDisplay"><span>'+d.icon+' '+d.label+': <b>'+esc(text)+'</b></span>'+
   (id==="shaman"&&Number(c.totem)>=3?'<button type="button" class="tb-totem-toggle" data-shaman-free-mode>' +(armed?"ОТМЕНИТЬ БЕСПЛАТНУЮ КАРТУ":"3 ТОТЕМА · БЕСПЛАТНАЯ КАРТА")+'</button>':"")+'</div>'+(branch?'<div class="tb-specialization-resonance"><span>'+esc(branchLabel)+' · РЕЗОНАНС</span><b>'+resonance+'/2</b></div>':"");
 }
 function updateClassResourceDOM(){const c=live(),node=root.querySelector("#classResourceDisplay");if(!c||!node)return;const parent=node.parentNode,oldMeter=parent?.querySelector(".tb-specialization-resonance"),wrap=document.createElement("div");wrap.innerHTML=classResourceMarkup(c);const resource=wrap.firstElementChild,meter=resource?.nextElementSibling;if(!resource)return;node.replaceWith(resource);if(oldMeter)oldMeter.remove();if(meter)resource.after(meter);}
 function isAttackCard(card,effects){return Number(effects?.damage)>0||Number(effects?.damageAll)>0||Number(effects?.damagePerEnergy)>0||Number(effects?.damagePerPoison)>0||Number(effects?.damagePerBleed)>0||Number(effects?.damageMissingHp)>0;}
 function cardElement(card,effects){const raw=String(effects?.element||card?.element||effects?.damageType||card?.damageType||card?.name||card?.description||"").toLowerCase();return /fire|огн|плам/.test(raw)?"fire":/ice|frost|лёд|лед/.test(raw)?"ice":/dark|shadow|тьм/.test(raw)?"dark":/lightning|storm|молни/.test(raw)?"lightning":/water|вод/.test(raw)?"water":/earth|земл/.test(raw)?"earth":"";}
 function isMagicCard(card,effects){return !!(effects?.magic||card?.magic||card?.type==="spell"||["arcane","fire","ice","dark","lightning","water","earth"].includes(String(effects?.damageType||card?.damageType||"").toLowerCase()));}
 function getCardBlockTalentBonus(character){
  const branch=(classData(character)?.branches||[]).find(entry=>entry.id===character?.branch);
  const talent=(branch?.talents||[]).find(item=>/стойкость\s*$/i.test(String(item.name||"")));
  return Math.max(0,Number(character?.talents?.[talent?.id])||0)*2+Number((character?._treeCache||rebuildTreeCache(character)).blockFlat||0);
 }
  function playCard(cardIndex){
  if(!battle||battle.actor?.type!=="player"||battle.busy||battle.paused||battle.isCardAnimating)return;
  const scheduledBattle=battle,cardNode=root.querySelector('[data-card-play="'+Number(cardIndex)+'"]');if(!live()?.hand?.[Number(cardIndex)])return;
  try{if(navigator.vibrate)navigator.vibrate(10);}catch(_){}
  scheduledBattle.isCardAnimating=true;if(cardNode)cardNode.classList.add("tb-card-flyout");
  const delay=scheduledBattle.fastBattle?100:220;
  setTimeout(()=>{
   if(!battle||battle!==scheduledBattle)return;
   let savepoint=null,battleBefore=null,summaryBefore=null,screenBefore=screen,stageBefore=selectedStage,routeBefore=routeChoice;
   try{
    // Persist a recovery point, then snapshot only the live battle instead of cloning the full RPG state.
    save();savepoint=localStorage.getItem("tb-rpg-v2");
    battleBefore=JSON.parse(JSON.stringify(battle));
    summaryBefore=postBattleSummary?JSON.parse(JSON.stringify(postBattleSummary)):null;
    resolveCardPlay(cardIndex);
   }catch(error){
    if(savepoint&&battleBefore){
     const restoredState=JSON.parse(savepoint);
     for(const key of Object.keys(engine.state))delete engine.state[key];
     Object.assign(engine.state,restoredState);
     battle=battleBefore;battle.enemies=Array.isArray(battle.enemies)?battle.enemies:[];
     battle.enemy=battle.enemies.find(enemy=>Number(enemy.index)===Number(battle.targetIndex))||battle.enemy;
     if(battle.enemy){battle.enemyHp=battle.enemy.hp;battle.enemyMax=battle.enemy.maxHp;battle.shield=battle.enemy.shield||0;}
     postBattleSummary=summaryBefore;screen=screenBefore;selectedStage=stageBefore;routeChoice=routeBefore;
    }else{
     battle.isCardAnimating=false;battle.busy=false;battle.actor={type:"player",id:"player",name:live()?.name||"Игрок"};
    }
    recoverBattleControl(error,"Не удалось разыграть карту · управление восстановлено",false);
   }finally{
    if(battle){battle.isCardAnimating=false;save();try{render();}catch(renderError){console.error('Card action completed but battle render failed',renderError);notify('Действие сохранено, но интерфейс не обновился · '+String(renderError?.message||renderError).slice(0,120));}if((Number(battle.cardsPlayedThisTurn)||0)>=20)endPlayerTurn();}
   }
  },delay);
 }
 function resolveCardPlay(cardIndex){
  if(!battle||battle.actor?.type!=="player"||battle.busy||battle.paused)return;
  if((Number(battle.cardsPlayedThisTurn)||0)>=20){notify("Лимит 20 карт за ход достигнут · ход завершён");endPlayerTurn();return;}
  const c=live();ensureCardDeck(c);const treeCache=rebuildTreeCache(c),index=Number(cardIndex),card=c.hand[index];
  if(!Number.isInteger(index)||!card){notify("Карта больше не в руке");return;}
  const effects=applyTreeCardBonuses(card,cardEffects(card),treeCache),treePoison=Number(treeCache.poisonStacks)||0,treeBleed=Number(treeCache.bleedStacks)||0,freeTotem=c.classId==="shaman"&&battle.shamanFreeMode&&Number(c.totem)>=3,isXCost=!!(card.isXCost||card.costX),baseCost=isXCost?c.currentEnergy:Math.max(0,Number(card.cost)||0),cardDiscount=Math.max(0,Number(battle.nextCardCostReduction)||0),dailyDiscount=c.run.dailyChallengeActive&&c.run.dailyChallengeModifier==="blood"?1:0,cost=battle.guildRaid?0:(freeTotem?0:Math.max(0,baseCost-dailyDiscount-cardDiscount));
  if(effects.unplayable||((card.type==="curse"||card.type==="status")&&card.id!=="status_slime")){notify("Эту карту нельзя разыграть");return;}
  if(!battle.guildRaid&&!freeTotem&&c.currentEnergy<cost){notify("Недостаточно энергии");return;}
  const isDuelistFinisher=c.classId==="duelist"&&!!(card.finisher||effects.finisher||(Array.isArray(card.tags)&&card.tags.includes("finisher")));if(isDuelistFinisher&&Number(c.charges)<3){notify("Для Смертельного выпада нужно 3 заряда");return;}
  const target=(battle.enemies||[]).find(enemy=>enemy.index===battle.targetIndex&&enemy.alive&&enemy.hp>0);
  const synergyLabel=applySpecializationCardSynergy(c,card,effects,target);if(synergyLabel)logCombatEvent("СИНЕРГИЯ · "+synergyLabel,"#e8c77e");
  if(/poison|яд|отрав/i.test([card.id,card.name,card.description].join(" "))&&treePoison>0)effects.poison=(Number(effects.poison)||0)+treePoison;if(/bleed|кров|рана/i.test([card.id,card.name,card.description].join(" "))&&treeBleed>0)effects.bleed=(Number(effects.bleed)||0)+treeBleed;const baseDamage=Number(effects.damage)||0,allDamage=Number(effects.damageAll)||0,dynamicCardDamage=target?Math.max(0,Number(effects.damagePerPoison)||0)*(Number(target.poison)||0)+Math.max(0,Number(effects.damagePerBleed)||0)*(Number(target.bleed)||0)+(Math.max(0,Number(effects.damageMissingHp)||0)*Math.max(0,engine.maxHp(c)-Number(c.run.playerHp||0))):0;
  if((baseDamage>0||allDamage>0||Number(effects.damagePerEnergy)>0||Number(effects.damagePerPoison)>0||Number(effects.damagePerBleed)>0||Number(effects.damageMissingHp)>0)&&!target){notify("Нет доступной цели");return;}
  if(freeTotem){c.totem=Math.max(0,Number(c.totem)-3);battle.shamanFreeMode=false;}else if(!battle.guildRaid)c.currentEnergy-=cost;if(!battle.guildRaid&&!freeTotem&&(Number(battle.nextCardCostReductionCards)||0)>0){battle.nextCardCostReductionCards--;if(battle.nextCardCostReductionCards<=0)battle.nextCardCostReduction=0;}battle.cardsPlayedThisTurn=(Number(battle.cardsPlayedThisTurn)||0)+1;if(battle.guildRaid&&guildRaid)guildRaid.cards.push(String(card.id||card.instanceId||"card"));c.hand.splice(index,1);
   if(!battle.guildRaid&&c.run.dailyChallengeActive&&c.run.dailyChallengeModifier==="blood"){c.run.playerHp=Math.max(0,Number(c.run.playerHp||0)-2);if(c.run.playerHp<=0){endFromDamage();return;}}if(card.exhaust||card.upgradedExhaust)c.exhaustPile.push(card);else c.discard.push(card);
  battle.actionDamageLedger={};battle.actionIsSkill=true;battle.actionIsPrimaryHit=true;
  const stats=engine.getCombatStats(c),scale=Math.max(.1,Number(stats.damageMultiplier)||1),weakScale=Number(battle.playerWeakTurns)>0?.75:1;
  const furyScale=(Number(battle.playerDamageBuffTurns)>0)?1+Math.max(0,Number(battle.playerDamageBuff)||0):1;
  const attackCard=isAttackCard(card,effects),magicCard=isMagicCard(card,effects),finisher=!!(card.finisher||effects.finisher||(Array.isArray(card.tags)&&card.tags.includes("finisher"))),element=cardElement(card,effects),magicChargeSpent=c.classId==="elemental"&&magicCard&&Number(c.magicCharge)>0;
  let classMultiplier=1,classFlat=0;
  if(c.classId==="destroyer")classFlat=Math.max(0,Number(c.rage)||0);
  if(c.classId==="bishop"&&attackCard){classFlat+=Math.max(0,Number(c.faith)||0)*3;c.faith=0;}
  if(c.classId==="assassin"&&attackCard&&Number(c.combo)>0){classMultiplier*=1+Math.min(3,Number(c.combo)||0)*.5;c.combo=0;}
  if(c.classId==="duelist"&&attackCard&&finisher&&Number(c.charges)>=3){classMultiplier*=3;c.charges=Math.max(0,Number(c.charges)-3);}
  if(magicChargeSpent){classMultiplier*=1+Math.min(10,Number(c.magicCharge)||0)*.1;c.magicCharge=0;}
  const refineWeapon=(c.gear||[]).find(item=>item&&(item.slot==="weapon"||item.slot===0)),weaponRefine=Math.max(0,Number(refineWeapon?.refine)||0),armorRefine=(c.gear||[]).filter(item=>item&&["chest","head","legs","hands",1,2,3,4].includes(item.slot)).reduce((sum,item)=>sum+Math.max(0,Number(item.refine)||0),0);
  const guildCrit=1+Math.max(0,Number(c.guildBuffs?.crit_damage)||0)*.05,guildMagic=magicCard?1+Math.max(0,Number(c.guildBuffs?.magic_attack)||0)*.02:1,treeCritChance=Number(treeCache.critChance)||0,treeCritBleed=Number(treeCache.critCausesBleed)||0;let cardCritical=false;const rawFor=base=>{const critical=attackCard&&Math.random()<Math.min(.8,Math.max(0,Number(stats.critChance)||0)+treeCritChance);if(critical){cardCritical=true;if(treeCritBleed>0&&target)target.bleed=Math.max(0,Number(target.bleed)||0)+treeCritBleed;}const spellPower=magicCard?Math.max(0,Number(battle.cardSpellPower)||0):0,nextAttackBonus=Math.max(0,Number(battle.nextAttackDamageBonus)||0);return Math.max(1,Math.round((base+nextAttackBonus+(attackCard?weaponRefine*2:0)+classFlat)*(1+(Math.max(0,Number(stats.attack)||0)+spellPower)/100)*scale*weakScale*furyScale*classMultiplier*guildMagic*(battle.firstAttackDouble?2:1)*(critical?1.75*guildCrit:1)));},damageType=effects.damageType||card.damageType||"physical";
  let killed=false,cardDamageDealt=0;const calculatedDamage=getCardDamageWithTalents(card,c,battle.guildRaid&&isXCost?Math.max(1,Number(c.energy)||3):cost,effects),singleDamage=(baseDamage>0||Number(effects.damagePerEnergy)>0||dynamicCardDamage>0)?calculatedDamage+dynamicCardDamage:0,areaDamage=allDamage>0?calculatedDamage:0;
  if(singleDamage>0&&target){const hit=applyTargetDamage(target,rawFor(singleDamage),damageType,{ignoreArmor:!!effects.ignoreArmor});if(!battle)return;cardDamageDealt+=Math.max(0,Number(hit.dealt)||0);logCombatEvent("Вы сыграли «"+card.name+"» · "+hit.dealt+" урона","#e9d5a5");killed=killed||!!hit.killed;battle.actionIsPrimaryHit=false;battle.attacksThisFight=(battle.attacksThisFight||0)+1;engine.logCombatEvent(c.id,"Карта: "+card.name);}
  if(areaDamage>0){const targets=(battle.enemies||[]).filter(enemy=>enemy.alive&&enemy.hp>0);for(const enemy of targets){if(c.run.playerHp<=0)break;const hit=applyTargetDamage(enemy,rawFor(areaDamage),damageType,{ignoreArmor:!!effects.ignoreArmor});if(!battle)return;cardDamageDealt+=Math.max(0,Number(hit.dealt)||0);killed=killed||!!hit.killed;}const defeatedByArea=(battle.enemies||[]).filter(enemy=>enemy&&Number(enemy.hp)<=0);if(defeatedByArea.length)killed=true;/* finishCurrentEnemy processes every dead enemy in its own queue loop below. */battle.actionIsPrimaryHit=false;battle.attacksThisFight=(battle.attacksThisFight||0)+targets.length;}if(cardCritical)triggerAncientRelicProc("critical");if(magicCard&&(singleDamage>0||areaDamage>0))triggerAncientRelicProc("magic");
  if(Number(effects.hits)>1&&singleDamage>0&&target)for(let n=1;n<Number(effects.hits)&&c.run.playerHp>0;n++){const hit=applyTargetDamage(target,rawFor(singleDamage),damageType,{ignoreArmor:!!effects.ignoreArmor});if(!battle)return;cardDamageDealt+=Math.max(0,Number(hit.dealt)||0);killed=killed||!!hit.killed;}
  if(singleDamage>0||areaDamage>0){if(battle.firstAttackDouble){battle.firstAttackDouble=false;if(c.run.stage)c.run.stage.relicFirstAttackConsumed=true;}battle.nextAttackDamageBonus=0;}const leechRate=Math.min(.03,Math.max(0,Number(treeCache.lifestealPercent)||0));if(cardDamageDealt>0&&leechRate>0){const beforeLeech=c.run.playerHp,leech=Math.max(0,Math.round(cardDamageDealt*leechRate));c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+leech);const gained=c.run.playerHp-beforeLeech;if(gained>0){showFloatingText("player","+"+gained+" ПОГЛОЩЕНИЕ","#70dca0");pulseCombatActor("player","heal");logCombatEvent("ВАМПИРИЗМ · восстановлено "+gained+" здоровья","#70dca0");}}
  battle.actionIsSkill=false;battle.actionIsPrimaryHit=false;if(c.run.playerHp<=0){endFromDamage();return;}
  if(Number(effects.block)>0){const block=Math.max(0,Math.round(Number(effects.block)*(1+Math.max(0,Number(stats.defense)||0)/100)+armorRefine*3+getCardBlockTalentBonus(c)+Math.max(0,Number(battle.relicBlockBonus)||0)));battle.cardBlock=(battle.cardBlock||0)+block;showFloatingText("player","ЩИТ +"+block,"#78c9ff");pulseCombatActor("player","armor");triggerAncientRelicProc("block");}
  if(Number(effects.heal)>0||Number(effects.healPerBleed)>0||(Number(treeCache.bleedHealPerStack)||0)>0){const before=c.run.playerHp,bleedStacks=target?Math.max(0,Number(target.bleed)||0):0,healing=(Math.max(0,Number(effects.heal)||0)+bleedStacks*(Math.max(0,Number(effects.healPerBleed)||0)+(Number(treeCache.bleedHealPerStack)||0)))*(1+(Number(treeCache.healPercent)||0));c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.max(1,Math.round(healing)));showFloatingText("player","+"+(c.run.playerHp-before),"#58e38b");pulseCombatActor("player","heal");if(c.classId==="bishop")c.faith=Math.min(5,(Number(c.faith)||0)+1);}
  if(attackCard){if(c.classId==="assassin"){battle.assassinAttacksThisTurn=(battle.assassinAttacksThisTurn||0)+1;if(battle.assassinAttacksThisTurn>=3){c.combo=Math.min(3,(Number(c.combo)||0)+1);battle.assassinAttacksThisTurn=0;}}if(c.classId==="duelist")c.charges=Math.min(5,(Number(c.charges)||0)+1);}
  if(c.classId==="dragonkin"&&element&&element!==String(c.element||"fire")){c.element=element;battle.cardBlock=(Number(battle.cardBlock)||0)+5;showFloatingText("player","СТИХИЯ · ЩИТ +5","#78c9ff");}
  if(c.classId==="elemental"&&magicCard&&!magicChargeSpent)c.magicCharge=Math.min(10,(Number(c.magicCharge)||0)+1);
  const statusPayload={...(effects.statuses||{})};for(const key of ["poison","bleed","burn","weak","vulnerable"])if(Number(effects[key])>0)statusPayload[key]=(Number(statusPayload[key])||0)+Number(effects[key]);
  if(Number(effects.conditionalBleed)>0&&target&&Number(target.poison)>0)statusPayload.bleed=(Number(statusPayload.bleed)||0)+Number(effects.conditionalBleed);
  const statusTargets=allDamage>0?(battle.enemies||[]).filter(enemy=>enemy.alive&&enemy.hp>0):target?[target]:[];let applied=false;
  for(const enemy of statusTargets)for(const key of ["poison","bleed","burn","weak","vulnerable"]){const stacks=Math.max(0,Math.floor(Number(statusPayload[key])||0));if(stacks){enemy[key]=Math.max(0,Number(enemy[key])||0)+stacks;applied=true;}}
   if(c.run.dailyChallengeActive&&c.run.dailyChallengeModifier==="fire")for(const enemy of statusTargets)enemy.burn=Math.max(0,Number(enemy.burn)||0)+1;
  if(applied&&!battle.guildRaid)planEnemyIntents();
  if(Number(effects.playerWeak)>0)battle.playerWeakTurns=Math.max(Number(battle.playerWeakTurns)||0,2);
  if(Number(effects.fury)>0){battle.playerDamageBuffTurns=Math.max(Number(battle.playerDamageBuffTurns)||0,2);battle.playerDamageBuff=Math.max(Number(battle.playerDamageBuff)||0,Number(effects.fury)*.1);}
  if(Number(effects.spellPower)>0)battle.cardSpellPower=Math.max(0,Number(battle.cardSpellPower)||0)+Number(effects.spellPower);
  if(Number(effects.nextAttackDamage)>0)battle.nextAttackDamageBonus=Math.max(0,Number(battle.nextAttackDamageBonus)||0)+Number(effects.nextAttackDamage);
  if(Number(effects.energy)>0)c.currentEnergy=Math.min(5,c.currentEnergy+Number(effects.energy));if(Number(effects.nextCardCostReduction)>0){battle.nextCardCostReduction=Math.max(0,Number(battle.nextCardCostReduction)||0)+Number(effects.nextCardCostReduction);battle.nextCardCostReductionCards=Math.max(1,Math.floor(Number(effects.nextCardsCostReduction)||1));}
  if(Number(effects.draw)>0)drawCards(effects.draw);
  const generators=Array.isArray(card.generateCards)?card.generateCards:(card.generate?[{id:card.generate,count:1}]:[]);for(const spec of generators){const amount=Math.max(0,Math.floor(Number(spec?.count)||0));for(let n=0;n<amount;n++){const generated=createCardInstance(spec.id);if(!generated)continue;if(c.hand.length<10)c.hand.push(generated);else c.discard.push(generated);}}
  if(killed&&battle){if(battle.guildRaid){finishGuildRaid();return;}finishCurrentEnemy();if(!battle)return;}
  if(Number(card.magicNumberIncrement)>0)card.magicNumber=Math.max(0,Number(card.magicNumber)||0)+Number(card.magicNumberIncrement);if(battle?.guildRaid&&Number(battle.cardsPlayedThisTurn)>=3)finishGuildRaid();
 }
 function endPlayerTurn(){
  if(battle?.guildRaid){notify("В рейде нужно разыграть ровно 3 карты");return;}
  if(!battle||battle.actor?.type!=="player"||battle.paused||battle.busy||battle.isCardAnimating)return;
  playSfx("endturn");
  try{
  const c=live();ensureCardDeck(c);const doubtWeak=c.hand.reduce((sum,card)=>sum+Math.max(0,Number(cardEffects(card).endTurnPlayerWeak)||0),0);if(doubtWeak){battle.playerWeakTurns=Math.max(Number(battle.playerWeakTurns)||0,doubtWeak);notify("Сомнение ослабляет героя: "+doubtWeak+" слабость");}const retained=[],discarded=[];for(const card of c.hand){if(card.retain)retained.push(card);else if(card.ethereal)c.exhaustPile.push(card);else discarded.push(card);}c.discard.push(...discarded);c.hand=retained;c.currentEnergy=0;
  battle.isPlayerTurn=false;clearPendingTurnTimer();battle.busy=false;battle.actionDamageLedger={};battle.actionIsPrimaryHit=false;battle.actionIsSkill=false;
  const burnTargets=(battle.enemies||[]).filter(enemy=>enemy.alive&&Number(enemy.burn)>0);for(const enemy of burnTargets){const burn=Math.max(0,Number(enemy.burn)||0);applyTargetDamage(enemy,burn,"fire");if(!battle)return;enemy.burn=0;if(c.run.playerHp<=0){endFromDamage();return;}if(enemy.hp<=0){finishCurrentEnemy();if(!battle)return;}}
  const activeDots=Array.isArray(battle.dots)?battle.dots:(battle.dot?[battle.dot]:[]);for(const dot of activeDots){if(dot?.ticks>0){if(!Number.isFinite(Number(dot.targetIndex)))dot.targetIndex=Number(battle.targetIndex);const target=battle.enemies.find(x=>Number(x.index)===Number(dot.targetIndex)&&x.alive&&Number(x.hp)>0);if(target){applyTargetDamage(target,dot.damage,"dark");if(!battle)return;dot.ticks--;if(c.run.playerHp<=0){endFromDamage();return;}if(target.hp<=0){finishCurrentEnemy();if(!battle)return;}}else dot.ticks=0;}}battle.dots=activeDots.filter(dot=>dot&&dot.ticks>0);battle.dot=battle.dots[0]||null;
  if(battle.hot?.ticks>0){c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+battle.hot.heal);battle.hot.ticks--;}
  if(reconcileBattleCompletion())return;
  const queue=(battle.enemies||[]).filter(enemy=>enemy.alive&&Number(enemy.hp)>0);
  if(!queue.length){if(reconcileBattleCompletion())return;advanceToPlayerTurn();return;}
  battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;const queueToken=battle.enemyQueueToken;
  battle.busy=true;battle.actor={type:"enemy",id:"enemy-phase",name:"Ход противников"};
  battle.enemyQueueState={indices:queue.map(enemy=>Number(enemy.index)).filter(Number.isFinite),cursor:0};
  battle.telegraph=null;notify("Противники атакуют...");save();render();
  scheduleEnemyTurnQueue(queue,0,queueToken,500);
  }catch(error){recoverPlayerTurn(error);}
 }
 function endTurnButton(){endPlayerTurn();}

 function humanSkillDescription(value){return String(value||'').replace(/class_identity/gi,'особенность класса').replace(/fire_dragon/gi,'Огненный дракон').replace(/ice_dragon/gi,'Ледяной дракон').replace(/black_dragon/gi,'Чёрный дракон').replace(/Огненный дракон specialization skill/gi,'Умение специализации Огненный дракон').replace(/Ледяной дракон specialization skill/gi,'Умение специализации Ледяной дракон').replace(/Чёрный дракон specialization skill/gi,'Умение специализации Чёрный дракон').replace(/([a-z_]+) specialization skill/gi,(_,key)=>'умение специализации '+key.replace(/_/g,' ')).replace(/\s+/g,' ').trim();}
 const talentEffectLabels={attack:'Атаку',health:'Здоровье',critical:'Критический шанс',defense:'Защиту',card_draw:'Добор карт',crit:'Крит'};
 function talentEffectLabel(value){const key=String(value||'');return talentEffectLabels[key]||key.replace(/_/g,' ');}
 function profileSkillDetails(skill,c){
  const effect=balance.skill_effects[skill.effect_template]||{};
  const passive=skill.type==="passive"||skill.is_active===false;
  const scaling=effect.scaling||skill.scaling||"attack";
  const scalingLabel=({attack:"атаки",spell_power:"силы магии",max_health:"максимального здоровья",defense:"защиты",class_primary_stat:"основной характеристики класса"})[scaling]||"атаки";
  const multiplier=Number(skill.damage_multiplier??skill.damage??effect.damage_multiplier??0)||0;
  const cost=passive?0:Number(skill.resource_cost??skill.cost??effect.resource_cost??(c.classId==="duelist"?(balance.resources.class_costs?.duelist?.attack_skill??22):(balance.resources.action_costs?.attack_skill??22)));
  const cooldown=passive?0:Number(skill.cooldown_turns??effect.cooldown_turns??effect.cooldown??0);
  const parts=["Тип: "+(passive?"Пассивное":"Активное")];
  if(passive){parts.push("Стоимость: нет","Откат: отсутствует");}
  else{
    if(["heal","hot"].includes(effect.type))parts.push("Лечение: "+Math.round(Number(effect.heal_multiplier||0)*100)+"% от максимального здоровья");
    else if(effect.type==="shield")parts.push("Щит: "+Math.round(Number(effect.shield_fraction||0)*100)+"% от максимального здоровья");
    else if(effect.type==="buff"||effect.type==="debuff")parts.push("Эффект: "+Math.round(Number(effect.power_multiplier||0)*100)+"% на "+(effect.duration||1)+" хода");
    else if(effect.type==="parry")parts.push("Парирование: "+Math.round(Number(effect.parry_chance||0)*100)+"% шанс");
    else if(multiplier>0)parts.push("Урон: "+Math.round(multiplier*100)+"% от "+scalingLabel+(effect.type==="dot"?" за тик"+(effect.ticks?" · "+effect.ticks+" тика":""):""));
    else parts.push("Особый эффект: "+(skill.effect_template||"уникальная техника"));
    parts.push("Стоимость: "+cost+(c.classId==="duelist"?" ед. энергии":" ед. ресурса"),"Откат: "+(cooldown?cooldown+" хода":"нет"));
  }
  const descriptions={strike:"Мощный удар по одной цели.",aoe:"Поражает всех противников на поле боя.",dot:"Накладывает периодический урон и ослабляет цель.",heal:"Восстанавливает здоровье себе или союзнику.",hot:"Постепенно восстанавливает здоровье в течение нескольких ходов.",buff:"Усиливает характеристики на несколько ходов.",debuff:"Ослабляет противника и снижает его боевую эффективность.",shield:"Создаёт защитный барьер и поглощает входящий урон.",control:"Наносит урон и прерывает действия противника оглушением.",execute:"Добивающий приём, особенно опасный для ослабленной цели.",parry:"Готовит точное парирование и открывает возможность для контратаки."};
  const raw=String(skill.description||"").trim();
  const readable=raw&&!/specialization skill|умение специализации\s+[a-z_]+$/i.test(raw)?humanSkillDescription(raw):"";
  parts.push(readable||descriptions[effect.type]||"Уникальная техника выбранной специализации.");
  return parts.join(" · ");
}
function talentBonusDescription(talent,rank){
  const values=balance.classes.talent_bonuses||{},key=talent.effect_template;
  const specs={
   attack:{value:Number(values.attack_per_rank||0)*100,label:"к Атаке",unit:"%",detail:"Увеличивает силу базовых ударов и приёмов, масштабируемых от атаки."},
   health:{value:Number(values.health_per_rank||0)*100,label:"к максимальному здоровью",unit:"%",detail:"Увеличивает запас HP и усиливает эффекты, зависящие от максимального здоровья."},
   critical:{value:Number(values.crit_chance_per_rank||0)*100,label:"к шансу критического удара",unit:" п.п.",detail:"Повышает вероятность критического попадания и дополнительного урона."},
   defense:{value:Number(values.defense_per_rank||0)*100,label:"к Защите",unit:"%",detail:"Снижает входящий урон благодаря более высокой защите героя."},
   card_draw:{value:Number(values.card_draw_per_rank||0)*100,label:"к добору карт",unit:"%",detail:"Каждые три ранга дают +1 карту в начале хода."},
   skill_power:{value:Number(values.skill_power_per_rank||0)*100,label:"к силе умений",unit:"%",detail:"Усиливает урон и полезные эффекты боевых умений."}
  };
  const spec=specs[key];
  if(!spec)return "Усиливает уникальную механику выбранной специализации. Текущий ранг: "+rank+"/"+(talent.max_rank||3)+".";
  const fmt=value=>Number(value.toFixed(2)).toString().replace(/\.0$/,"");
  return "Каждый ранг даёт +"+fmt(spec.value)+spec.unit+" "+spec.label+". Текущий бонус: +"+fmt(spec.value*rank)+spec.unit+". "+spec.detail;
}

 function accountAuthPanel(){const cloud=window.TowerboundCloud,signed=!!cloud?.signedIn,session=cloud?.session,status=cloud?.status?.()||{text:'Подключение к Supabase…',kind:'pending'};if(signed){const synced=status.kind==='online',statusClass=synced?'is-online':status.kind==='error'?'is-error':'is-pending',statusLabel=synced?'✓ Синхронизировано':status.kind==='error'?'⚠ Синхронизация не подтверждена':'… Ожидаем синхронизацию';return '<section class="tb-account-auth"><h3>Облачный аккаунт</h3><p class="tb-account-status '+statusClass+'">'+statusLabel+'</p><small>'+esc(session?.user?.email||'Аккаунт подключён')+' · '+esc(status.text||'')+'</small><div class="tb-account-actions"><button data-action="account-sync">СИНХРОНИЗИРОВАТЬ СЕЙЧАС</button><button data-action="account-logout">ВЫЙТИ</button></div></section>';}return '<section class="tb-account-auth"><h3>Вход в игровой аккаунт</h3><p>Войди или создай аккаунт, чтобы синхронизировать прогресс.</p><label>Логин<input id="tbAccountLogin" type="text" autocomplete="username" autocapitalize="none" placeholder="Логин"></label><label>Пароль<input id="tbAccountPassword" type="password" autocomplete="current-password" placeholder="Пароль"></label><label class="tb-account-remember"><input id="tbAccountRemember" type="checkbox" checked> Запомнить меня</label><div class="tb-account-actions"><button data-action="account-login">ВОЙТИ</button><button data-action="account-register">ЗАРЕГИСТРИРОВАТЬСЯ</button></div><small class="tb-account-message" aria-live="polite">'+esc(status.text||'Локальное сохранение')+'</small><small class="tb-account-hint">Если у вас еще нет аккаунта, нажмите «Зарегистрироваться».</small></section>';}
 function availableSkillForUpgrade(c,id){const def=classData(c),base=(def.base_skills||[]).find(skill=>skill.id===id),branch=skills.find(skill=>skill.id===id&&skill.class_id===c.classId&&(!skill.branch_id||skill.branch_id===c.branch));return base||branch||null;}

 const TREE_COLORS={crit:"#e65b64",bleed:"#d94d58",poison:"#5dbb78",exorcism:"#d9c16e",healing:"#65cfa0",blessing:"#78a9e8",fire:"#ed754b",ice:"#76c9ed",void:"#a58be8",fists:"#e47752",greatsword:"#d8b46a",arcane:"#7d9be8",darkness:"#a58be8",water:"#65bfe0",earth:"#b5a16b",dual:"#e4bb64",shield:"#72a9d9",rapier:"#c47de1",spirits:"#75c9a0",gods:"#a78be2",nature:"#83b86a",core:"#f0d18a"};
 let talentTreeConfig=null,treeCamera={scale:1.56,x:0,y:0},treePointers=new Map(),treePinch=null,treeDrag=null,treeTouchPoints=new Map(),treeTouchPinch=null,treeTouchDrag=null,treeTouchTap=null,treeDrawn=[];
  const treeIconCache=new Map();
 fetch("./configs/talents_tree.json").then(r=>r.json()).then(d=>{talentTreeConfig=d;if(profileTab==="talents")setTimeout(initTalentTreeCanvas,0);}).catch(e=>console.warn("Talent tree config",e));
 function treePointsEarned(level){const n=Math.max(1,Number(level)||1);return n<10?0:Math.min(101,n-9)+Math.max(0,Math.floor((n-110)/10));}
 function ensureTalentTreeState(c){if(!c.talentTree||typeof c.talentTree!=="object")c.talentTree={ranks:{}};if(!c.talentTree.ranks||typeof c.talentTree.ranks!=="object")c.talentTree.ranks={};return c.talentTree;}
 function treeNodes(c){return(talentTreeConfig?.nodes||[]).filter(n=>n.classId===c.classId);}
 function rebuildTreeCache(character){if(!character)return Object.create(null);const ranks=ensureTalentTreeState(character).ranks,cache=Object.create(null);for(const node of treeNodes(character)){const rank=Math.max(0,Number(ranks[node.id])||0);if(!rank||!node.effect)continue;for(const [key,value] of Object.entries(node.effect)){const amount=Number(value)||0;if(amount)cache[key]=(Number(cache[key])||0)+amount*rank;}}try{Object.defineProperty(character,"_treeCache",{value:cache,writable:true,configurable:true,enumerable:false});}catch(_){character._treeCache=cache;}return cache;}
 function treeEffect(c,key){const cache=c?._treeCache;if(cache&&Object.prototype.hasOwnProperty.call(cache,key))return Number(cache[key])||0;if(cache)return 0;const ranks=ensureTalentTreeState(c).ranks;return treeNodes(c).reduce((v,n)=>v+(Number(n.effect?.[key])||0)*(Number(ranks[n.id])||0),0);}
  function applyTreePotionHealing(c,beforeHp){const modifier=treeEffect(c,"potionHealingMultiplier");const base=Math.round(engine.maxHp(c)*(Number(balance?.healing?.potion_heal_fraction)||0));const desired=Math.max(0,Math.round(base*Math.max(0,1+modifier)));c.run.playerHp=Math.min(engine.maxHp(c),Math.max(0,Number(beforeHp)||0)+desired);return Math.max(0,c.run.playerHp-(Number(beforeHp)||0));}
 function treeBranchSpent(c,branch){const ranks=ensureTalentTreeState(c).ranks;return treeNodes(c).filter(n=>n.branch===branch).reduce((v,n)=>v+(Number(ranks[n.id])||0),0);}
 function treeStatus(c,n){const ranks=ensureTalentTreeState(c).ranks,rank=Number(ranks[n.id])||0;if(rank>=n.maxRank)return"maxed";if(rank)return"owned";const totalSpent=Object.values(ranks).reduce((a,b)=>a+(Number(b)||0),0);return(n.branch==="core"||(n.connections||[]).some(id=>Number(ranks[id])>0))&&totalSpent>=(Number(n.requiredBranchPoints)||0)?"available":"locked";}
 function purchaseTreeNode(id){const c=live();if(!c||!talentTreeConfig)return;const n=treeNodes(c).find(x=>x.id===id);if(!n)return;const state=ensureTalentTreeState(c),rank=Number(state.ranks[id])||0,spent=Object.values(state.ranks).reduce((a,b)=>a+(Number(b)||0),0);if(c.level<10||treePointsEarned(c.level)<=spent||rank>=n.maxRank||treeStatus(c,n)==="locked"){notify("Узел пока недоступен");return;}state.ranks[id]=rank+1;rebuildTreeCache(c);save();render();notify("Талант улучшен: "+n.name);}
 function resetTalentTree(){const c=live();if(!c)return;if(!window.confirm("Вы уверены?"))return;const state=ensureTalentTreeState(c),spent=Object.values(state.ranks).reduce((a,b)=>a+(Number(b)||0),0),cost=Number(balance?.classes?.talent_reset_cost)||0;if(!spent)return;if((Number(c.silver)||0)<cost){notify("Недостаточно серебра для сброса");return;}c.silver-=cost;state.ranks={};rebuildTreeCache(c);save();render();}
  function treeTransform(canvas){const dpr=Math.min(2,window.devicePixelRatio||1),w=canvas.width/dpr,h=canvas.height/dpr,base=Math.min(w,h)*.00042;return{dpr,w,h,base,ox:w/2+treeCamera.x,oy:h/2+treeCamera.y};}
  function centerTalentTreeOnCore(){const canvas=root.querySelector("#talentTreeCanvas"),c=live();if(!canvas||!c)return;const core=treeNodes(c).find(n=>n.branch==="core"||String(n.id).toLowerCase()==="core");treeCamera.scale=1.56;if(!core){treeCamera.x=0;treeCamera.y=0;}else{const t=treeTransform(canvas),k=t.base*treeCamera.scale;treeCamera.x=(1125-core.x)*k;treeCamera.y=(1125-core.y)*k;}drawTalentTree();}
  function treeIconImage(path){if(!path)return null;let img=treeIconCache.get(path);if(img)return img;if(typeof Image==="undefined")return null;img=new Image();treeIconCache.set(path,img);img.onload=()=>drawTalentTree();img.onerror=()=>treeIconCache.set(path,null);img.src=path;return img;}
  function drawTalentTree(){const canvas=root.querySelector("#talentTreeCanvas"),c=live();if(!canvas||!c||!talentTreeConfig)return;const ctx=canvas.getContext("2d"),t=treeTransform(canvas),list=treeNodes(c),ranks=ensureTalentTreeState(c).ranks,byId=new Map(list.map(n=>[n.id,n])),k=t.base*treeCamera.scale;if(!k)return;ctx.setTransform(t.dpr,0,0,t.dpr,0,0);ctx.clearRect(0,0,t.w,t.h);const bg=ctx.createRadialGradient(t.w*.5,t.h*.45,8,t.w*.5,t.h*.45,Math.max(t.w,t.h)*.78);bg.addColorStop(0,"#182335");bg.addColorStop(.56,"#0b1320");bg.addColorStop(1,"#050910");ctx.fillStyle=bg;ctx.fillRect(0,0,t.w,t.h);ctx.save();const grid=treeCamera.scale<1.05?96:72;ctx.strokeStyle="rgba(177,194,215,.055)";ctx.lineWidth=1;for(let gx=(t.ox%grid+grid)%grid;gx<t.w;gx+=grid){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,t.h);ctx.stroke();}for(let gy=(t.oy%grid+grid)%grid;gy<t.h;gy+=grid){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(t.w,gy);ctx.stroke();}for(let i=0;i<72;i++){const x=(i*137.5)%t.w,y=(i*83.7)%t.h;ctx.fillStyle=i%4===0?"rgba(211,177,111,.16)":"rgba(151,177,205,.10)";ctx.fillRect(x,y,1.2,1.2);}ctx.translate(t.ox,t.oy);ctx.scale(k,k);ctx.translate(-1125,-1125);const edges=new Set();ctx.lineCap="round";ctx.lineJoin="round";for(const n of list){for(const id of n.connections||[]){const o=byId.get(id);if(!o)continue;const edge=[n.id,id].sort().join("|");if(edges.has(edge))continue;edges.add(edge);const learned=(Number(ranks[n.id])||0)>0&&(Number(ranks[id])||0)>0,active=(Number(ranks[n.id])||0)>0||(Number(ranks[id])||0)>0,color=TREE_COLORS[n.branch]||"#c9a96b";ctx.save();ctx.strokeStyle=learned?color:active?"rgba(190,155,100,.58)":"rgba(105,125,148,.32)";ctx.lineWidth=(learned?2.1:1.35)/k;ctx.shadowColor=learned?color:"transparent";ctx.shadowBlur=learned?7/k:0;const mx=(n.x+o.x)/2,my=(n.y+o.y)/2,dx=o.x-n.x,dy=o.y-n.y,len=Math.max(1,Math.hypot(dx,dy)),bend=(n.branch==="core"?0:Math.min(22,len*.08));ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.quadraticCurveTo(mx-(dy/len)*bend,my+(dx/len)*bend,o.x,o.y);ctx.stroke();ctx.restore();}}treeDrawn=[];for(const n of list){const status=treeStatus(c,n),rank=Number(ranks[n.id])||0,color=TREE_COLORS[n.branch]||"#d5b979",core=n.branch==="core",key=n.shape==="diamond"||n.shape==="square",radius=(core?36:key?20:15)/k,iconSize=(core?50:key?34:26)/k;ctx.save();ctx.translate(n.x,n.y);ctx.shadowColor=status==="owned"||status==="maxed"?"#e7bd62":status==="available"?color:"transparent";ctx.shadowBlur=(status==="owned"||status==="maxed"?10:status==="available"?5:0)/k;ctx.fillStyle=status==="locked"?"#17202b":status==="available"?"#20313b":"#211d19";ctx.beginPath();if(core){ctx.arc(0,0,radius,0,Math.PI*2);}else if(n.shape==="diamond"){ctx.moveTo(0,-radius);ctx.lineTo(radius,0);ctx.lineTo(0,radius);ctx.lineTo(-radius,0);ctx.closePath();}else if(n.shape==="square"){const r=radius*.72;ctx.roundRect(-r,-r,r*2,r*2,3/k);}else ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=status==="owned"||status==="maxed"?"#f3d17d":status==="available"?"#d8c18a":"#647184";ctx.lineWidth=(core?2.4:key?1.8:1.25)/k;ctx.stroke();const icon=treeIconImage(n.icon);if(icon&&icon.complete&&icon.naturalWidth){ctx.save();ctx.globalAlpha=status==="locked"?.42:status==="available"?.88:1;ctx.filter=status==="locked"?"grayscale(1) brightness(.62)":"none";ctx.drawImage(icon,-iconSize/2,-iconSize/2,iconSize,iconSize);ctx.restore();}else{ctx.fillStyle=status==="locked"?"#758092":"#f2d89c";ctx.font=(core?15:10)/k+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText((n.name||"✦").slice(0,1),0,0);}if(rank>0){ctx.fillStyle="#f4d58b";ctx.font="bold "+(8/k)+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(rank),radius*.72,radius*.72);}ctx.restore();treeDrawn.push({node:n,x:n.x,y:n.y,r:Math.max(18,iconSize*.78)/k});}ctx.restore();}
  function hitTreeNode(canvas,x,y){const c=live();if(!c||!talentTreeConfig)return null;const t=treeTransform(canvas),k=t.base*treeCamera.scale;let best=null,bestD=Infinity;for(const n of treeNodes(c)){const sx=t.ox+(n.x-1125)*k,sy=t.oy+(n.y-1125)*k,d=Math.hypot(x-sx,y-sy),radius=Math.max(27,(n.branch==="core"?30:n.shape==="diamond"||n.shape==="square"?25:22));if(d<=radius&&d<bestD){best=n;bestD=d;}}return best;}
  function closeTreeNodePopup(){root.querySelector("#talentTreeNodePopup")?.remove();}
  function showTreeNode(n){const c=live(),canvas=root.querySelector("#talentTreeCanvas"),shell=root.querySelector(".tb-tree-shell");if(!n||!c||!canvas||!shell){closeTreeNodePopup();return;}const state=ensureTalentTreeState(c),rank=Number(state.ranks[n.id])||0,status=treeStatus(c,n),labels={damagePercent:"Урон",critChance:"Шанс критического удара",bleedHealPerStack:"Лечение за стак кровотечения",bleedStacks:"Стаки кровотечения",blockFlat:"Блок",critCausesBleed:"Кровотечение от критов",healPercent:"Лечение",poisonStacks:"Стаки яда",potionHealingMultiplier:"Эффективность зелий",lifestealPercent:"Вампиризм"},effects=Object.entries(n.effect||{}).filter(([,v])=>Number(v)!==0).map(([key,value])=>{const amount=Number(value),match=key.match(/^card([A-Z][A-Za-z]+)_(.+)$/),card=match?CARD_DATABASE[match[2]]:null,cardLabels={DamagePercent:"бонус урона",Damage:"дополнительный урон",Bleed:"кровотечение",Poison:"яд",Burn:"горение",Weak:"слабость",Vulnerable:"уязвимость",Block:"броня",Heal:"лечение",Draw:"добор карт",Fury:"ярость",SpellPower:"сила магии",NextAttackDamage:"урон следующей атаки",DamagePerPoison:"урон за яд",DamagePerBleed:"урон за кровотечение",HealPerBleed:"лечение за кровотечение",Energy:"энергия"},label=match?"Карта «"+(card?.name||match[2])+"»: "+(cardLabels[match[1]]||match[1]):(labels[key]||key),formatted=key==="lifestealPercent"?(amount*100).toFixed(1)+"%":Math.abs(amount)<1?Math.round(Math.abs(amount)*100)+"%":String(Math.abs(amount));return label+": "+(amount>0?"+":"−")+formatted;}).join(" · ")||"Особый талант";let popup=root.querySelector("#talentTreeNodePopup");if(!popup){popup=document.createElement("div");popup.id="talentTreeNodePopup";popup.className="tb-tree-node-popup";popup.setAttribute("role","dialog");popup.setAttribute("aria-live","polite");shell.appendChild(popup);}const canBuy=status!=="locked"&&rank<n.maxRank;popup.innerHTML="<b class='tb-tree-popup-title'>"+esc(n.name)+"</b><p>"+esc(n.description||effects)+"</p><small>"+esc(effects)+"</small><div class='tb-tree-popup-rank'>РАНГ <strong>"+rank+"/"+n.maxRank+"</strong></div><button type='button' data-tree-node='"+esc(n.id)+"' "+(canBuy?"":"disabled")+">"+(rank?"УЛУЧШИТЬ":"ИЗУЧИТЬ")+"</button>";const t=treeTransform(canvas),k=t.base*treeCamera.scale,rect=canvas.getBoundingClientRect(),sr=shell.getBoundingClientRect(),nx=rect.left-sr.left+t.ox+(n.x-1125)*k,ny=rect.top-sr.top+t.oy+(n.y-1125)*k;popup.style.left="0px";popup.style.top="0px";popup.classList.add("is-visible");const w=popup.offsetWidth||260,h=popup.offsetHeight||150,left=Math.max(12,Math.min(shell.clientWidth-w-12,nx-w/2));let top=ny-h-22;if(top<Math.max(72,rect.top-sr.top+8))top=Math.min(shell.clientHeight-h-12,ny+24);popup.style.left=left+"px";popup.style.top=Math.max(72,top)+"px";}
   function initTalentTreeCanvas(){
    const canvas=root.querySelector("#talentTreeCanvas");
    if(!canvas||!talentTreeConfig)return;
    const resize=()=>{
     const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
     canvas.width=Math.max(1,Math.round(rect.width*dpr));
     canvas.height=Math.max(1,Math.round(rect.height*dpr));
     if(!canvas.dataset.centered){canvas.dataset.centered="1";centerTalentTreeOnCore();}else drawTalentTree();
    };
    resize();
    if(!window.__tbTalentTreeResize){
     window.__tbTalentTreeResize=true;
     window.addEventListener("resize",()=>{if(profileTab==="talents")initTalentTreeCanvas();});
    }
    if(canvas.dataset.bound)return;
    canvas.dataset.bound="1";
    canvas.style.touchAction="none";
    canvas.style.userSelect="none";
    canvas.style.webkitUserSelect="none";
    const point=(e)=>{
     const rect=canvas.getBoundingClientRect();
     return{x:e.clientX,y:e.clientY,lx:e.clientX-rect.left,ly:e.clientY-rect.top};
    };
    const startPinch=()=>{
     if(treePointers.size!==2)return;
     const p=[...treePointers.values()];
     treeDrag=null;
     treePinch={
      d:Math.max(1,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)),
      mx:(p[0].lx+p[1].lx)/2,
      my:(p[0].ly+p[1].ly)/2
     };
    };
    canvas.addEventListener("pointerdown",e=>{
     if(e.pointerType==="touch")return;
      if(e.pointerType==="mouse"&&e.button!==0)return;
     e.preventDefault();
     try{canvas.setPointerCapture(e.pointerId);}catch(_){}
     treePointers.set(e.pointerId,point(e));
     const tip=root.querySelector("#talentTreeTooltip");
     if(tip)tip.classList.remove("is-visible");
     if(treePointers.size===2)startPinch();
     else if(treePointers.size===1)treeDrag={x:e.clientX,y:e.clientY,cx:treeCamera.x,cy:treeCamera.y,moved:false};
    },{passive:false});
    canvas.addEventListener("pointermove",e=>{
     if(e.pointerType==="touch")return;
      if(!treePointers.has(e.pointerId)){
      if(treePointers.size===0){
       const p=point(e),n=hitTreeNode(canvas,p.lx,p.ly),tip=root.querySelector("#talentTreeTooltip");
       if(tip){
        if(n){
         const status=treeStatus(live(),n);
         tip.innerHTML="<b>"+esc(n.name)+"</b><small>"+esc(n.branch==="core"?"Начало пути":n.branch)+" · "+(status==="locked"?"Заблокировано":status==="available"?"Доступно":"Изучено")+"</small>";
         tip.style.left=Math.max(8,Math.min(canvas.clientWidth-190,p.lx+14))+"px";
         tip.style.top=Math.max(8,Math.min(canvas.clientHeight-54,p.ly+14))+"px";
         tip.classList.add("is-visible");
        }else tip.classList.remove("is-visible");
       }
      }
      return;
     }
     e.preventDefault();
     treePointers.set(e.pointerId,point(e));
     if(treePointers.size>=2&&treePinch){
      const p=[...treePointers.values()],d=Math.max(1,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y));
      const mx=(p[0].lx+p[1].lx)/2,my=(p[0].ly+p[1].ly)/2,t=treeTransform(canvas);
      const oldK=t.base*treeCamera.scale;
      const wx=(treePinch.mx-t.ox)/oldK+1125,wy=(treePinch.my-t.oy)/oldK+1125;
      treeCamera.scale=Math.max(.55,Math.min(3.8,treeCamera.scale*d/treePinch.d));
      const k=t.base*treeCamera.scale;
      treeCamera.x=mx-t.w/2-(wx-1125)*k;
      treeCamera.y=my-t.h/2-(wy-1125)*k;
      treePinch={d,mx,my};
      drawTalentTree();
     }else if(treePointers.size===1&&treeDrag){
      const dx=e.clientX-treeDrag.x,dy=e.clientY-treeDrag.y;
      if(Math.abs(dx)+Math.abs(dy)>4)treeDrag.moved=true;
      treeCamera.x=treeDrag.cx+dx;
      treeCamera.y=treeDrag.cy+dy;
      drawTalentTree();
     }
    },{passive:false});
    const end=(e,cancelled)=>{
     const wasDrag=treeDrag,wasPinch=!!treePinch;
     treePointers.delete(e.pointerId);
     if(treePointers.size===1){
      const remaining=[...treePointers.values()][0];
      treePinch=null;
      treeDrag={x:remaining.x,y:remaining.y,cx:treeCamera.x,cy:treeCamera.y,moved:wasPinch||!!wasDrag?.moved||cancelled};
     }else if(treePointers.size===0){
      treePinch=null;
      treeDrag=null;
      if(!cancelled&&wasDrag&&!wasDrag.moved&&!wasPinch){
       const p=point(e),n=hitTreeNode(canvas,p.lx,p.ly);
       if(n){lastNodeTapAt=Date.now();showTreeNode(n);}else closeTreeNodePopup();
      }
     }else{
      treePinch=null;
      treeDrag=null;
     }
    };
    canvas.addEventListener("pointerup",e=>end(e,false));
    canvas.addEventListener("pointercancel",e=>end(e,true));
    let lastNodeTapAt=0;
    canvas.addEventListener("click",e=>{if(Date.now()-lastNodeTapAt<280)return;const rect=canvas.getBoundingClientRect(),n=hitTreeNode(canvas,e.clientX-rect.left,e.clientY-rect.top);if(n){lastNodeTapAt=Date.now();showTreeNode(n);}else closeTreeNodePopup();});
    canvas.addEventListener("lostpointercapture",e=>{if(treePointers.has(e.pointerId))end(e,true);});
    canvas.addEventListener("pointerleave",()=>{
     if(treePointers.size===0){
      const tip=root.querySelector("#talentTreeTooltip");
      if(tip)tip.classList.remove("is-visible");
     }
    });
    const touchLocal=t=>{const rect=canvas.getBoundingClientRect();return{x:t.clientX,y:t.clientY,lx:t.clientX-rect.left,ly:t.clientY-rect.top};};
     const syncTouchPoints=touches=>{for(const touch of touches)treeTouchPoints.set(touch.identifier,touchLocal(touch));};
     const beginTouchPinch=()=>{if(treeTouchPoints.size!==2)return;const p=[...treeTouchPoints.values()],mx=(p[0].lx+p[1].lx)/2,my=(p[0].ly+p[1].ly)/2,t=treeTransform(canvas),k=t.base*treeCamera.scale;treeTouchDrag=null;treeTouchTap=null;treeTouchPinch={d:Math.max(1,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)),mx,my,wx:(mx-t.ox)/k+1125,wy:(my-t.oy)/k+1125,scale:treeCamera.scale};};
     canvas.addEventListener("touchstart",e=>{e.preventDefault();syncTouchPoints(e.changedTouches);if(treeTouchPoints.size>=2)beginTouchPinch();else if(treeTouchPoints.size===1){const p=[...treeTouchPoints.values()][0];treeTouchTap={x:p.lx,y:p.ly,moved:false};treeTouchDrag={x:p.x,y:p.y,cx:treeCamera.x,cy:treeCamera.y,moved:false};}const tip=root.querySelector("#talentTreeTooltip");if(tip)tip.classList.remove("is-visible");},{passive:false});
     canvas.addEventListener("touchmove",e=>{if(!treeTouchPoints.size)return;e.preventDefault();syncTouchPoints(e.changedTouches);if(treeTouchPoints.size>=2&&treeTouchPinch){const p=[...treeTouchPoints.values()],d=Math.max(1,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)),mx=(p[0].lx+p[1].lx)/2,my=(p[0].ly+p[1].ly)/2,t=treeTransform(canvas);treeCamera.scale=Math.max(.55,Math.min(3.8,treeTouchPinch.scale*d/treeTouchPinch.d));const k=t.base*treeCamera.scale;treeCamera.x=mx-t.w/2-(treeTouchPinch.wx-1125)*k;treeCamera.y=my-t.h/2-(treeTouchPinch.wy-1125)*k;drawTalentTree();}else if(treeTouchPoints.size===1&&treeTouchDrag){const p=[...treeTouchPoints.values()][0],dx=p.x-treeTouchDrag.x,dy=p.y-treeTouchDrag.y;if(Math.abs(dx)+Math.abs(dy)>4){treeTouchDrag.moved=true;if(treeTouchTap)treeTouchTap.moved=true;}treeCamera.x=treeTouchDrag.cx+dx;treeCamera.y=treeTouchDrag.cy+dy;drawTalentTree();}},{passive:false});
     const endTouch=e=>{e.preventDefault();const wasPinch=!!treeTouchPinch;for(const touch of e.changedTouches)treeTouchPoints.delete(touch.identifier);if(treeTouchPoints.size===1){const p=[...treeTouchPoints.values()][0];treeTouchPinch=null;treeTouchTap=null;treeTouchDrag={x:p.x,y:p.y,cx:treeCamera.x,cy:treeCamera.y,moved:true};}else if(treeTouchPoints.size===0){const touch=e.changedTouches[0];if(!wasPinch&&treeTouchTap&&!treeTouchTap.moved&&touch){const rect=canvas.getBoundingClientRect(),n=hitTreeNode(canvas,touch.clientX-rect.left,touch.clientY-rect.top);if(n){lastNodeTapAt=Date.now();showTreeNode(n);}else closeTreeNodePopup();}treeTouchPinch=null;treeTouchDrag=null;treeTouchTap=null;}};
     canvas.addEventListener("touchend",endTouch,{passive:false});canvas.addEventListener("touchcancel",endTouch,{passive:false});
     canvas.addEventListener("wheel",e=>{
     e.preventDefault();
     const p=point(e),t=treeTransform(canvas),oldK=t.base*treeCamera.scale;
     const wx=(p.lx-t.ox)/oldK+1125,wy=(p.ly-t.oy)/oldK+1125;
     treeCamera.scale=Math.max(.55,Math.min(3.8,treeCamera.scale*Math.exp(-e.deltaY*.0015)));
     const k=t.base*treeCamera.scale;
     treeCamera.x=p.lx-t.w/2-(wx-1125)*k;
     treeCamera.y=p.ly-t.h/2-(wy-1125)*k;
     drawTalentTree();
    },{passive:false});
   }
function profileRelicShopMarkup(c){
 const relics=Object.values(engine.RELICS_DATABASE||{}).filter(relic=>!relic.classId||(relic.classId===c.classId&&relic.branchId===c.branch)),owned=new Set(c.relics||[]);
 return '<section class="tb-relic-shop"><div class="tb-relic-shop-layout"><div class="tb-relic-shop-head"><span class="tb-eyebrow">ПАССИВНЫЕ АРТЕФАКТЫ</span><h2>РЕЛИКВИИ БАШНИ</h2><p>Реликвии усиливают карточную колоду и действуют в каждом бою</p><strong>'+relics.filter(relic=>owned.has(relic.id)).length+' / '+relics.length+'</strong></div><div class="tb-relic-shop-grid">'+relics.map(relic=>'<article class="tb-relic-shop-card '+(owned.has(relic.id)?"is-owned":"")+'"><span class="tb-relic-shop-icon">'+(customRelicArtPath(relic)?customItemImageHtml(customRelicArtPath(relic),"tb-relic-shop-art"):esc(relic.icon||"✦"))+'</span><b>'+esc(relic.name||"Неизвестная реликвия")+'</b><small>'+esc(relic.description||"Описание реликвии пока отсутствует.")+'</small><span class="tb-relic-price">300 серебра</span><button type="button" data-relic-buy="'+esc(relic.id)+'" '+(owned.has(relic.id)||Number(c.silver)<300?"disabled":"")+'>'+(owned.has(relic.id)?"УЖЕ ЕСТЬ":"КУПИТЬ · 300")+'</button></article>').join("")+'</div></div></section>';
}
 function profileScreen(){
  const c=live();if(!c)return characterList();
  const def=classData(c),branch=(def.branches||[]).find(b=>b.id===c.branch),stats=balance.classes.base_stats,combatStats=engine.getCombatStats(c),gearSlotNames=["Оружие","Нагрудник","Шлем","Поножи","Перчатки","Аксессуар"],gearSlotKeys=["weapon","chest","head","legs","hands","accessory"];
  const rarityRank={"Обычная":1,"Редкая":2,"Эпическая":3,"Легендарная":4,"Богоподобная":5},setGroups=new Map();(c.gear||[]).filter(item=>item?.setId).forEach(item=>{const group=setGroups.get(item.setId)||{count:0,rarity:item.rarity};group.count++;if((rarityRank[item.rarity]||0)>(rarityRank[group.rarity]||0))group.rarity=item.rarity;setGroups.set(item.setId,group);});const bestEquippedSet=[...setGroups.values()].sort((a,b)=>b.count-a.count||(rarityRank[b.rarity]||0)-(rarityRank[a.rarity]||0))[0],rarityFrame=bestEquippedSet?.count>=2?({"Эпическая":"tb-rarity-frame-epic","Легендарная":"tb-rarity-frame-legendary","Богоподобная":"tb-rarity-frame-godlike"}[bestEquippedSet.rarity]||""):"";
  const treeState=ensureTalentTreeState(c),spent=Object.values(treeState.ranks).reduce((a,b)=>a+b,0),free=Math.max(0,treePointsEarned(c.level)-spent);
  if(profileTab==="talents"){return '<div class="tb-tree-shell" role="dialog" aria-modal="true" aria-label="Древо талантов"><header class="tb-tree-toolbar"><div><small>ПУТЬ МАСТЕРСТВА · '+esc(clsName(c)).toUpperCase()+' · СВОБОДНО '+free+'</small><h2>ДРЕВО ТАЛАНТОВ</h2><p>Потрачено: '+spent+' · Уровень '+c.level+'</p></div><button type="button" class="tb-tree-close" data-action="tree-close" aria-label="Закрыть древо талантов">×</button></header><canvas id="talentTreeCanvas" aria-label="Интерактивное древо талантов"></canvas></div>';}
 
  if(profileTab==="stats"&&statsOverlayOpen){
   const gear=(c.gear||[]).filter(Boolean),gearCount=gear.length,combat=engine.getCombatStats(c),resists=combat.resists||{};
   const pct=v=>(Math.max(0,Number(v)||0)*100).toFixed(1).replace(/\\.0$/,"")+"%";
   const number=v=>Math.round(Number(v)||0).toLocaleString("ru-RU");
   const statCard=(icon,label,value,sub,tone)=>'<article class="tb-stats-main-card '+(tone||'')+'"><span class="tb-stats-icon">'+icon+'</span><div><small>'+label+'</small><b>'+value+'</b><em>'+sub+'</em></div></article>';
   const detailRow=(label,value)=>'<div class="tb-stats-detail-row"><span>'+label+'</span><b>'+value+'</b></div>';
   const branchMarkup='<section class="tb-stats-section tb-stats-specialization"><div class="tb-stats-section-heading"><div><small>ПУТЬ ГЕРОЯ</small><h3>Специализация</h3></div><span class="tb-stats-section-mark">✦</span></div>'+(c.branch?'<div class="tb-stats-current-branch"><b>'+esc(branch?.name||c.branch)+'</b><p>'+esc(branch?.theme||specializationDescription(c.classId,c.branch)||"")+'</p></div>':'<p class="tb-stats-muted">Выбери ветку специализации на 10 уровне.</p>')+'<div class="tb-branch-options">'+(def.branches||[]).map(b=>'<button data-branch="'+b.id+'" data-branch-preview="'+esc(specializationDescription(c.classId,b.id))+'" title="'+esc(specializationDescription(c.classId,b.id))+'" '+(c.level<10?"disabled":"")+' class="'+((pendingBranchId===b.id||(!pendingBranchId&&c.branch===b.id))?"active":"")+'">'+esc(b.name)+(c.branch===b.id?" ✓":pendingBranchId===b.id?" · ВЫБРАНО":"")+'</button>').join("")+'</div><p class="tb-branch-description" id="tbBranchDescription" aria-live="polite">'+(pendingBranchId?esc(specializationDescription(c.classId,pendingBranchId)):branch?esc(specializationDescription(c.classId,branch.id)):"Нажми на ветку, чтобы посмотреть её особенности.")+'</p>'+(pendingBranchId&&pendingBranchId!==c.branch?'<div class="tb-branch-confirm"><button class="tb-primary" data-action="confirm-branch">ПОДТВЕРДИТЬ ВЫБОР</button><button data-action="cancel-branch">ОТМЕНА</button></div>':'')+'<small class="tb-stats-footnote">Первая специализация на 10 уровне бесплатна. Смена ветки стоит '+balance.classes.respec_cost+' серебра.</small></section>';
   const mainStats=[
    statCard("♥","ЗДОРОВЬЕ",number(engine.maxHp(c)),"Максимальный запас здоровья","health"),
    statCard("⚔","АТАКА",number(combat.attack),"Сила основного удара","attack"),
    statCard("⬟","ЗАЩИТА",number(combat.defense),"Снижение входящего урона","defense"),
    statCard("✧","КРИТИЧЕСКИЙ ШАНС",pct(combat.critChance),"Вероятность критического удара","crit"),
    statCard("✹","КРИТИЧЕСКИЙ УРОН",Math.round((Number(combat.critMultiplier)||1)*100)+"%","Множитель критического удара","critdamage"),
    statCard("➤","СКОРОСТЬ",Number(combat.speed||1).toFixed(2).replace(/\\.00$/,""),"Коэффициент скорости героя","speed")
   ].join("");
   const damageBonus=Math.max(0,(Number(combat.damageMultiplier)||1)-1);
   const detailStats=[
    detailRow("Сила заклинаний",number(combat.spellPower)),
    detailRow("Бонус общего урона",pct(damageBonus)),
    detailRow("Снижение получаемого урона",pct(combat.damageReduction)),
    detailRow("Огонь · бонус урона",pct(combat.fireDamage)),
    detailRow("Лёд · бонус урона",pct(combat.iceDamage)),
    detailRow("Тьма · бонус урона",pct(combat.darkDamage))
   ].join("");
   const resistanceRows=[
    detailRow("Физическое сопротивление",pct(resists.physical)),
    detailRow("Огненное сопротивление",pct(resists.fire)),
    detailRow("Ледяное сопротивление",pct(resists.ice)),
    detailRow("Тёмное сопротивление",pct(resists.dark))
   ].join("");
   const spentTalents=Object.values(ensureTalentTreeState(c).ranks||{}).reduce((sum,value)=>sum+(Number(value)||0),0);
   return '<section class="tb-stats-screen" role="dialog" aria-modal="true" aria-label="Характеристики персонажа"><header class="tb-stats-toolbar"><button type="button" class="tb-stats-back" data-action="stats-close" aria-label="Назад">‹</button><div><small>ДОСЬЕ ГЕРОЯ · '+esc(clsName(c)).toUpperCase()+'</small><h2>ХАРАКТЕРИСТИКИ</h2></div><span class="tb-stats-level">УР. '+c.level+'</span></header><div class="tb-stats-scroll"><section class="tb-stats-identity"><div class="tb-stats-portrait"><img src="'+esc(portrait(c.classId))+'" alt="" loading="eager"></div><div class="tb-stats-identity-copy"><small>БОЕВОЙ РЕЙТИНГ</small><strong>'+number(engine.combatPower(c))+'</strong><span>'+esc(c.name)+' · '+esc(clsName(c))+'</span><em>'+esc(branch?.name||"Специализация не выбрана")+'</em></div><div class="tb-stats-crown">✦</div></section><section class="tb-stats-section"><div class="tb-stats-section-heading"><div><small>ОСНОВА БОЕВОЙ МОЩИ</small><h3>Главные параметры</h3></div><span class="tb-stats-section-mark">Ⅰ</span></div><div class="tb-stats-main-grid">'+mainStats+'</div></section><section class="tb-stats-section"><div class="tb-stats-section-heading"><div><small>ТОНКАЯ НАСТРОЙКА</small><h3>Боевые показатели</h3></div><span class="tb-stats-section-mark">Ⅱ</span></div><div class="tb-stats-detail-list">'+detailStats+'</div></section><section class="tb-stats-section"><div class="tb-stats-section-heading"><div><small>ЗАЩИТА ОТ СТИХИЙ</small><h3>Сопротивления</h3></div><span class="tb-stats-section-mark">Ⅲ</span></div><div class="tb-stats-detail-list">'+resistanceRows+'</div></section><section class="tb-stats-section tb-stats-sources"><div class="tb-stats-section-heading"><div><small>СОСТАВ СИЛЫ</small><h3>Источники развития</h3></div><span class="tb-stats-section-mark">Ⅳ</span></div><div class="tb-stats-source-grid"><div><b>'+gearCount+' / 6</b><small>Предметов экипировки</small></div><div><b>'+(Array.isArray(c.relics)?c.relics.length:0)+'</b><small>Реликвий</small></div><div><b>'+spentTalents+'</b><small>Рангов талантов</small></div><div><b>'+number(c.xp||0)+'</b><small>Накоплено опыта</small></div></div><p class="tb-stats-footnote">Показатели рассчитываются по текущим характеристикам героя, экипировке, талантам и бонусам. При смене предметов значения обновятся автоматически.</p></section>'+branchMarkup+'</div></section>';
  }
  let body="";
  if(profileTab==="stats"){
   body="";
  }else if(profileTab==="talents"){
   body="";
  }else if(profileTab==="skills"){
    const unlocked=new Set(unlockedCardIds()),allCards=Object.values(CARD_DATABASE).filter(card=>card&&(card.classId==="common"||!card.classId||card.classId===c.classId)).sort((x,y)=>String(x.rarity||"common").localeCompare(String(y.rarity||"common"))||String(x.name||x.id).localeCompare(String(y.name||y.id),"ru"));
    const kind={attack:"АТАКА",defense:"ЗАЩИТА",skill:"ТЕХНИКА",power:"СИЛА",curse:"ПРОКЛЯТИЕ",status:"СТАТУС"};
    body='<section class="tb-codex-page"><header class="tb-codex-hero"><div><small class="tb-codex-kicker">КОДЕКС КАРТ · '+esc(clsName(c)).toUpperCase()+'</small><h2>БИБЛИОТЕКА КАРТ</h2><p>Изучай способности своего класса, сравнивай эффекты и собирай сильную колоду.</p></div><strong class="tb-codex-total">'+allCards.filter(card=>unlocked.has(card.id)).length+'<small>ИЗ '+allCards.length+'</small></strong></header><div class="tb-codex-grid">'+allCards.map(card=>{const known=unlocked.has(card.id),image=card.image||CARD_ART_ROOT+(ART_MAPPING[card.id]||"strike.png"),effect=card.effects||{},cost=card.costX?"X":Number(card.cost)||0,stats=[];if(Number(effect.damage)>0)stats.push("Урон "+Number(effect.damage));if(Number(effect.damageAll)>0)stats.push("Всем "+Number(effect.damageAll));if(Number(effect.block)>0)stats.push("Броня "+Number(effect.block));if(Number(effect.shield)>0)stats.push("Щит "+Number(effect.shield));if(Number(effect.heal)>0)stats.push("Лечение "+Number(effect.heal));if(Number(effect.draw)>0)stats.push("Добор "+Number(effect.draw));return '<article class="tb-codex-card '+(known?"is-known":"is-locked")+'"><div class="tb-codex-art"><img src="'+esc(image)+'" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'./assets/cards/strike.png\'"></div><div class="tb-card-badges"><span class="tb-card-pill">'+esc(kind[card.type]||"КАРТА")+'</span><span class="tb-card-pill">'+esc(String(card.rarity||"common").toUpperCase())+'</span><span class="tb-card-pill cost">'+cost+'</span></div><h4>'+esc(known?card.name:"Не открыта")+'</h4><small class="tb-card-subline">'+((card.classId==="common"||!card.classId)?"ОБЩАЯ":esc(String(card.classId).toUpperCase()))+'</small><p>'+esc(known?(card.description||"Без описания"):"Открой карту в награде после боя.")+'</p>'+(known&&stats.length?'<div class="tb-card-effects">'+stats.map(x=>'<span class="tb-card-effect">'+esc(x)+'</span>').join("")+'</div>':'')+'<small class="tb-card-unlocked-mark">'+(known?"✓ ОТКРЫТА":"ЗАКРЫТА")+'</small></article>';}).join("")+'</div></section>';
 }else if(profileTab==="craft"){
   const materials=(c.bag||[]).filter(item=>item.type==="craft_material").reduce((sum,item)=>sum+(Number(item.quantity)||1),0);
   const stones=(c.bag||[]).filter(item=>item.type==="enhancement_stone");
   const groups={};stones.forEach(item=>{const typeId=item.stoneType?.id||item.stoneType||"unknown",key=String(item.level||1)+":"+typeId;if(!groups[key])groups[key]={item,count:0};groups[key].count+=Number(item.quantity)||1;});
   const stoneRows=Object.values(groups).map(group=>'<article class="tb-system-row"><div><b>'+esc(group.item.stoneType?.name||group.item.stoneType?.branch_id||"Камень усиления")+' · Уровень '+(group.item.level||1)+'</b><small>В наличии: '+group.count+' / 5 для слияния</small></div><button data-merge="'+group.item.id+'" '+(group.count<5?'disabled':'')+'>СЛИТЬ 5 КАМНЕЙ</button></article>').join("");
   body='<div class="tb-system-actions"><button type="button" data-action="open-workshop">МАСТЕРСКАЯ · РУНЫ · ЧЁРНЫЙ РЫНОК · АПГРЕЙДЫ</button></div><section class="tb-craft-rebuild"><section class="tb-craft-main-card"><h3>Крафт и улучшение</h3><p class="tb-craft-material-count">Материалы для крафта: '+materials+' / 20</p><button type="button" class="tb-forge-button" data-craft-stone="1" '+(materials<20?'disabled':'')+'>КОВАТЬ КАМЕНЬ</button></section><section class="tb-system-card"><h3>Слияние камней</h3>'+(stoneRows||'<small>Камней усиления пока нет.</small>')+'</section><section class="tb-system-card"><h3>Камни заточки</h3><p>Камни заточки и долота отображаются в рюкзаке и применяются к экипировке.</p><p>В наличии: '+(c.bag||[]).filter(item=>item.type==="refine_stone").reduce((sum,item)=>sum+(Number(item.quantity)||1),0)+'</p></section></section>';
  }else if(profileTab==="account"){
   body=accountAuthPanel()+'<div class="tb-profile-account">'+systemsScreen()+'</div>';
  }else if(profileTab==="speedrun"){
   const speedRuns=Number(c.stats?.speed_runs||0),bestStage=Number(c.progress?.highestEver||0);
   body='<section class="speedrun-container"><div class="speedrun-eyebrow">ИСПЫТАНИЕ СКОРОСТИ</div><h2 class="speedrun-title">Спидран Башни</h2><div class="speedrun-record-row"><div class="speedrun-record"><small>РЕКОРД ЭТАПА</small><strong>'+bestStage+' / 250</strong><small>Ускоренные бои ×2: '+speedRuns+'</small></div><button class="speedrun-status" type="button" disabled>В ПРОЦЕССЕ</button></div><p class="speedrun-description">Отслеживание быстрых забегов и прогресса. Ускоренные бои ×2 учитываются отдельно.</p><p class="speedrun-note">Результаты обновляются по событиям игры; отдельный таймер не запускается в фоне.</p></section>';
  }else if(profileTab==="stash"){
   const rank={"Обычная":0,"Редкая":1,"Эпическая":2,"Легендарная":3,"Богоподобная":4},stash=(engine.state.stash||[]).map(item=>'<article class="tb-system-row"><div><b>'+esc(item.name)+'</b><small>'+esc(item.rarity)+' · Уровень предмета '+item.itemLevel+'</small></div><button data-stash-withdraw="'+item.id+'">ЗАБРАТЬ</button></article>').join(""),depositable=(c.bag||[]).filter(item=>item.rarity&&rank[item.rarity]>=rank[balance.stash.min_rarity]&&!item.bound&&!item.bossLoot).map(item=>'<article class="tb-system-row"><div><b>'+esc(item.name)+'</b><small>'+esc(item.rarity)+' · Уровень предмета '+item.itemLevel+'</small></div><button data-stash-deposit="'+item.id+'">В ОБЩИЙ СТЕШ</button></article>').join("");
   body='<section class="tb-system-card"><h2>Общий стеш · '+(engine.state.stash||[]).length+'/'+balance.stash.slots+'</h2><p>Предметы от '+esc(balance.stash.min_rarity)+' и выше.</p>'+(stash||'<small>Общий стеш пуст.</small>')+'<h3>Экипировка для передачи</h3>'+(depositable||'<small>Нет подходящих предметов.</small>')+'</section>';
  }else if(profileTab==="merchant"){
   body='<section class="tb-system-card"><h2>Торговец картами</h2><p>Покупка новых карт и удаление лишних из колоды.</p>'+cardMerchantMarkup(c)+'</section>';
  }else if(profileTab==="relics"){
   body=profileRelicShopMarkup(c);
  }else if(profileTab==="gear"){
   body=renderCollection(c);
  }else{
   const tools='<div class="tb-bag-tools"><button data-action="equip-best">АВТО-ЭКИПИРОВКА</button><button data-action="salvage-gray">РАЗОБРАТЬ СЕРЫЙ МУСОР</button></div>';
   const labels={attack:"АТК",defense:"ЗАЩ",health:"HP",crit:"КРИТ",critDamage:"КРИТ. УРОН",evasion:"УКЛОН",dodge:"УКЛОН",spellPower:"СИЛА МАГИИ",fireDamage:"ОГОНЬ",iceDamage:"ЛЁД",darkDamage:"ТЬМА"};
   const percentStats=new Set(["crit","critDamage","evasion","dodge","attackSpeed","critChance","criticalChance","critical_chance","crit_chance","evasionChance","evasion_chance","dodgeChance"]);
   const formatStat=(key,value)=>percentStats.has(key)?((Number(value)>0?"+":"")+(Number(value)*100).toFixed(1).replace(/\.0$/,"")+"%"):((Number(value)>0?"+":"")+Number(value).toFixed(0));
   const isEquipment=item=>!!(item.type==="equipment"&&item.stats&&item.rarity);
   const visibleBag=(c.bag||[]).filter(item=>{
    if(bagFilter==="all")return true;
    if(!isEquipment(item))return false;
    if(bagFilter==="weapon")return item.slot==="weapon";
    if(bagFilter==="armor")return ["chest","head","legs","hands"].includes(item.slot);
    return item.slot==="accessory";
   });
   const renderItem=item=>{const equipment=isEquipment(item),ix=({weapon:0,chest:1,head:2,legs:3,hands:4,accessory:5})[item.slot]??-1,current=ix>=0?c.gear[ix]:null,itemStats=equipment?effectiveEquipmentStats(item):{},currentStats=effectiveEquipmentStats(current),stats=equipment?'<div class="tb-item-stats">'+Object.entries(itemStats).filter(([,v])=>Number(v)!==0).map(([key,value])=>{const delta=Number(value)-(Number(currentStats?.[key])||0),cls=delta>0?"is-better":delta<0?"is-worse":"is-equal";return '<span class="'+cls+'">'+(labels[key]||esc(key))+' '+formatStat(key,value)+(current?" ("+formatStat(key,delta)+")":"")+'</span>';}).join("")+'</div>':'';let actions='';if(item.type==="healing_potion")actions+='<button data-belt-assign="'+item.id+'">В ПОЯС</button>';if(equipment)actions+='<button data-equip="'+item.id+'">НАДЕТЬ</button><button data-salvage="'+item.id+'">РАЗОБРАТЬ</button>';if(item.type==="refine_stone")actions+='<small>Камень заточки</small>';if(item.type==="enhancement_stone")actions+='<small>'+esc(item.stoneType?.name||item.stoneType?.branch_id||item.stoneType?.branchId||"Камень")+' · '+esc(item.stoneType?.slot||"")+' · ур. '+(Number(item.level)||1)+'</small><small class="tb-stone-description">'+esc(stoneDescription(item)||item.description||"Неизвестный предмет")+'</small><button data-inspect-stone="'+item.id+'">ОПИСАНИЕ КАМНЯ</button>';if(item.type==="craft_material")actions+='<button data-craft-stone="1">КОВАТЬ КАМЕНЬ I · 20 МАТЕРИАЛОВ</button>';if(item.type==="enhancement_stone"&&item.level<balance.equipment.stone_max_level)actions+='<button data-merge="'+item.id+'" '+(c.bag.filter(x=>x.type==="enhancement_stone"&&x.level===item.level&&(x.stoneType?.id||x.stoneType)===(item.stoneType?.id||item.stoneType)).length<balance.equipment.stone_merge_count?"disabled":"")+' >СЛИТЬ 5 КАМНЕЙ</button>';if(["xp_10","xp_20","xp_50","xp_100","drop_20","drop_50","drop_75","drop_100","refine_10","refine_20","map_hint","repair_kit","silver_bonus","xp_hourglass","potion_capacity","one_rescue","stone_cache","socket","pity","refine_guard","rescue_seal","extra_socket","pity_token"].includes(item.type))actions+='<button data-use="'+item.id+'">ИСПОЛЬЗОВАТЬ</button>';return '<article class="tb-bag-item '+(equipment?'rarity-'+rarityClass(item.rarity):'')+'"><button type="button" class="tb-item-tile-open" data-item-select="'+item.id+'" aria-label="Подробнее: '+esc(itemBagTitle(item))+'"><div class="tb-bag-item-art">'+inventoryIconHtml(item,equipment)+'</div><span>'+esc(itemBagTitle(item))+'</span><small>'+(equipment?'Ур. '+(item.itemLevel||1):(Number(item.quantity)>1?'Количество: '+item.quantity:''))+'</small></button>'+actions+'</article>';};
   const filters='<div class="tb-gear-filter tb-bag-filters"><button type="button" data-bag-filter="all" class="'+(bagFilter==="all"?"active":"")+'">ВСЕ</button><button type="button" data-bag-filter="weapon" class="'+(bagFilter==="weapon"?"active":"")+'">ОРУЖИЕ</button><button type="button" data-bag-filter="armor" class="'+(bagFilter==="armor"?"active":"")+'">БРОНЯ</button><button type="button" data-bag-filter="accessory" class="'+(bagFilter==="accessory"?"active":"")+'">АКСЕССУАРЫ</button></div>';
   const selected=(c.bag||[]).find(item=>item.id===selectedItemId);
   const selectedStones=selected&&isEquipment(selected)?matchingStonesForItem(c,selected):[];
   const selectedSockets=selected&&isEquipment(selected)?installedGemsOf(selected):[];
   const hasOpenSocket=!!(selected&&isEquipment(selected)&&Math.max(0,Number(selected.socketsAvailable)||0)>selectedSockets.length);
   const stonePickerMarkup=selected&&stonePickerItemId===selected.id&&hasOpenSocket?'<div class="tb-stone-picker"><b>Выбери камень для гнезда</b>'+selectedStones.map(stone=>'<button type="button" data-stone-choice="'+esc(stone.id)+'" data-stone-item="'+esc(selected.id)+'"><span>'+esc(stone.stoneType?.name||stone.name||"Неизвестный предмет")+'</span><small>Уровень '+(Number(stone.level)||1)+' · '+(Number(stone.quantity)||1)+' шт.</small></button>').join("")+'</div>':"";
   const detail=selected?(()=>{const markup=renderItem(selected),actionMatch=markup.match(/<\/button>([\s\S]*?)<\/article>/),statsMarkup=markup.match(/<div class="tb-item-stats">[\s\S]*?<\/div>/)?.[0]||"",description=selected.type==="enhancement_stone"?stoneDescription(selected):(selected.description||"Неизвестный предмет");const insertButton=hasOpenSocket&&selectedStones.length?'<button type="button" data-stone-picker="'+esc(selected.id)+'">'+(stonePickerItemId===selected.id?"СКРЫТЬ КАМНИ":"ВСТАВИТЬ КАМЕНЬ")+'</button>':"";return '<div class="tb-item-detail-overlay"><section class="tb-item-detail-sheet" role="dialog" aria-modal="true" aria-label="Предмет"><button type="button" class="tb-item-detail-close" data-item-select="">×</button><div class="tb-item-detail-art">'+inventoryIconHtml(selected,isEquipment(selected))+'</div><h3>'+esc(itemBagTitle(selected))+'</h3><p class="tb-item-detail-description">'+esc(description||"Неизвестный предмет")+'</p>'+(statsMarkup||"")+(Number(selected.quantity)>1?'<p>Количество: '+Number(selected.quantity)+'</p>':'')+'<div class="tb-item-detail-actions">'+(actionMatch?.[1]||"")+insertButton+'</div>'+stonePickerMarkup+'</section></div>';})():"";
   body='<div class="tb-system-actions"><button type="button" data-action="open-workshop">ОТКРЫТЬ МАСТЕРСКУЮ</button></div><h3>Рюкзак · '+c.bag.length+'</h3>'+tools+filters+'<div class="tb-item-grid">'+(visibleBag.length?visibleBag.map(renderItem).join(""):'<div class="tb-lock">Рюкзак пока пуст.</div>')+'</div>'+detail;

  }
   const upgradeModal="";
  return header("Профиль героя",c.name+" · "+clsName(c))+'<section class="tb-profile tb-profile-hub"><div class="tb-profile-hero"><div class="tb-profile-hero-art"><img src="' + portrait(c.classId) + '" alt="' + esc(clsName(c)) + " — " + esc(c.name) + '" loading="eager"></div><div class="tb-profile-hero-info"><div class="tb-eyebrow">ПЕРСОНАЖ</div><h1>'+esc(c.name)+'</h1><p>'+esc(clsName(c))+' · Уровень '+c.level+'</p><div class="tb-profile-power">⚔️ <strong>'+engine.combatPower(c)+'</strong><span>МОЩЬ</span></div><div class="tb-profile-hero-stats"><span>❤️ '+engine.maxHp(c)+'<small>Здоровье</small></span><span>⚔️ '+combatStats.attack+'<small>Атака</small></span><span>🛡️ '+combatStats.defense+'<small>Защита</small></span><span>✨ '+Math.round(combatStats.critChance*100)+'%<small>Крит</small></span></div></div></div><div class="tb-profile-hub-links"><button type="button" class="tb-profile-hub-card" data-tab="stats"><span class="tb-profile-hub-emoji" aria-hidden="true"></span><span class="tb-profile-hub-copy"><b>ХАРАКТЕРИСТИКИ</b><small>Параметры, специализация и сила героя</small></span><span class="tb-profile-hub-arrow">›</span></button><button type="button" class="tb-profile-hub-card" data-tab="talents"><span class="tb-profile-hub-emoji" aria-hidden="true"></span><span class="tb-profile-hub-copy"><b>ТАЛАНТЫ</b><small>Древо талантов и развитие способностей</small></span><span class="tb-profile-hub-arrow">›</span></button><button type="button" class="tb-profile-hub-card" data-tab="skills"><span class="tb-profile-hub-emoji" aria-hidden="true"></span><span class="tb-profile-hub-copy"><b>КОЛОДА</b><small>Библиотека карт и боевые комбинации</small></span><span class="tb-profile-hub-arrow">›</span></button><button type="button" class="tb-profile-hub-card" data-tab="gear"><span class="tb-profile-hub-emoji" aria-hidden="true"></span><span class="tb-profile-hub-copy"><b>КОЛЛЕКЦИЯ</b><small>Экипировка, реликвии, рюкзак и общий стеш</small><span class="tb-profile-hub-subnav"><span data-tab="bag">Рюкзак</span><span data-tab="relics">Реликвии</span><span data-tab="stash">Стеш</span><span data-tab="merchant">Торговец картами</span></span></span><span class="tb-profile-hub-arrow">›</span></button><button type="button" class="tb-profile-hub-card" data-tab="craft"><span class="tb-profile-hub-emoji" aria-hidden="true"></span><span class="tb-profile-hub-copy"><b>РАЗВИТИЕ</b><small>Крафт, улучшения и мастерская</small><span class="tb-profile-hub-subnav"><span data-tab="speedrun">Спидран</span></span></span><span class="tb-profile-hub-arrow">›</span></button></div><div class="tb-profile-content">'+body+'</div></section>';
 }
 function shopProductSprite(item){const id=String(item?.id||"").toLowerCase();if(id.startsWith("heal")||id.includes("potion"))return "shop-potion";if(id.startsWith("premium")||id.includes("rescue"))return "shop-premium";if(id.includes("refine")||id.includes("chisel")||id.includes("socket"))return "shop-refine";if(id.startsWith("xp"))return "shop-xp";if(id.startsWith("drop"))return "shop-drop";return "shop-item";}
 function shopProductIconHtml(item){
  const custom=customItemArtPath(item);
  if(custom)return customItemImageHtml(custom,"tb-shop-item-art",item);
  return '<span class="sprite-icon '+shopProductSprite(item)+'" aria-hidden="true"></span>';
 }
 
 function cardMerchantMarkup(character){ensureCardDeck(character);const piles=["deck","hand","discard","exhaustPile"],seen=new Set(),unique=[];for(const pile of piles)for(const card of character[pile]||[]){const key=card?.instanceId||card?.id;if(card&&!seen.has(key)){seen.add(key);unique.push(card);}}const archive=character.cardArchive||[],removeList=cardRemovalOpen?'<div class="tb-card-removal-list">'+unique.map(card=>'<button type="button" data-card-remove="'+esc(card.instanceId||card.id)+'"><b>'+esc(card.name||card.id)+'</b><small>'+esc(card.rarity||"common")+' · '+(card.costX?"X":Number(card.cost)||0)+' энергии</small></button>').join("")+'</div>':'';return '<section class="tb-card-merchant"><div class="tb-card-merchant-heading"><div><span class="tb-eyebrow">КОЛОДА И КАРТЫ</span><h2>ТОРГОВЕЦ КАРТАМИ</h2><p>Пополняй колоду или отправляй лишние карты в Архив</p></div><strong>'+unique.length+' карт</strong></div><div class="tb-card-merchant-actions"><article><b>Случайная карта</b><small>Карта твоего класса или общая · случайная редкость</small><span>100 серебра</span><button type="button" data-card-shop-buy '+(Number(character.silver)<100?'disabled':'')+'>КУПИТЬ КАРТУ</button></article><article><b>Удаление карты</b><small>Карта удаляется из всех боевых стопок и хранится в Архиве</small><span>75 серебра</span><button type="button" data-card-remove-open '+(Number(character.silver)<75||unique.length<=1?'disabled':'')+'>'+(cardRemovalOpen?'ЗАКРЫТЬ СПИСОК':'УДАЛИТЬ КАРТУ')+'</button></article></div>'+removeList+'<div class="tb-card-archive-count">В Архиве: '+archive.length+' карт</div></section>';}

 function shopScreen(){
  const c=live();if(!c)return characterList();
  const account=engine.state.account||(engine.state.account={});
  account.diamonds=Math.max(0,Number(account.diamonds)||0);
  if(!["silver","diamond"].includes(shopTab))shopTab="silver";
  c.bag=Array.isArray(c.bag)?c.bag:[];
  c.relics=Array.isArray(c.relics)?c.relics:[];
  c.run=c.run&&typeof c.run==="object"?c.run:{};
  c.progress=c.progress&&typeof c.progress==="object"?c.progress:{};
  c.stats=c.stats&&typeof c.stats==="object"?c.stats:{};
  const store=balance.economy?.[shopTab+"_store"]||{};
  const products=Object.entries(store).filter(([key,value])=>typeof value==="number").map(([id,price])=>({id,price,name:id.replace(/_/g," ")})).concat((Array.isArray(store.extra)?store.extra:[]).map(item=>({id:item.id,price:item.price,name:item.name})));
  const label=shopTab==="silver"?"серебра":"алм.";
  let chest={available:false,remainingMs:0};try{if(typeof engine.dailyChestSnapshot==="function")chest=engine.dailyChestSnapshot(c.id)||chest;}catch(error){console.warn("[Towerbound] daily shop chest unavailable",error);}
  const chestMinutes=Math.max(0,Math.ceil((Number(chest.remainingMs)||0)/60000));
  const chestLabel=chest.available?"🎁 БЕСПЛАТНЫЙ ЕЖЕДНЕВНЫЙ СУНДУК · ЗАБРАТЬ":"🎁 СЛЕДУЮЩИЙ СУНДУК · "+Math.floor(chestMinutes/60)+"ч "+(chestMinutes%60)+"м";
  const dailyChestMarkup='<section class="tb-daily-shop-chest"><div><b>ЕЖЕДНЕВНАЯ НАГРАДА</b><small>Бесплатный сундук обновляется раз в сутки</small></div>'+button("daily-chest",chestLabel,chest.available?"":"disabled")+'</section>';
  const relics=Object.values(engine.RELICS_DATABASE||{}).filter(relic=>!relic.classId||(relic.classId===c.classId&&relic.branchId===c.branch)),ownedRelics=new Set(c.relics||[]);
  const relicShopMarkup='<section class="tb-relic-shop"><div class="tb-relic-shop-layout"><div class="tb-relic-shop-head"><span class="tb-eyebrow">ПАССИВНЫЕ АРТЕФАКТЫ</span><h2>РЕЛИКВИИ БАШНИ</h2><p>Реликвии усиливают карточную колоду и действуют в каждом бою</p><strong>'+relics.filter(relic=>ownedRelics.has(relic.id)).length+' / '+relics.length+'</strong></div><div class="tb-relic-shop-grid">'+relics.map(relic=>'<article class="tb-relic-shop-card '+(ownedRelics.has(relic.id)?"is-owned":"")+'"><span class="tb-relic-shop-icon">'+(customRelicArtPath(relic)?customItemImageHtml(customRelicArtPath(relic),"tb-relic-shop-art"):esc(relic.icon||"✦"))+'</span><b>'+esc(relic.name||"Неизвестная реликвия")+'</b><small>'+esc(relic.description||"Описание реликвии пока отсутствует.")+'</small><span class="tb-relic-price">300 серебра</span><button type="button" data-relic-buy="'+esc(relic.id)+'" '+(ownedRelics.has(relic.id)||Number(c.silver)<300?"disabled":"")+'>'+(ownedRelics.has(relic.id)?"УЖЕ ЕСТЬ":"КУПИТЬ · 300")+'</button></article>').join("")+'</div></div></section>';
  return header("Магазин","Зелья · материалы · косметика")+'<section class="tb-shop">'+'<div class="tb-shop-top"><h1>Магазин башни</h1></div><div class="tb-shop-balances"><span>◈ '+c.silver+' серебра персонажа</span><span>◆ '+account.diamonds+' алмазов аккаунта</span><span>Премиум до '+(account.premiumUntil?new Date(engine.state.account.premiumUntil).toLocaleDateString("ru-RU"):"—")+'</span></div><nav class="tb-tabs"><button data-shop-tab="silver" class="'+(shopTab==="silver"?"active":"")+'">ЗА СЕРЕБРО</button><button data-shop-tab="diamond" class="'+(shopTab==="diamond"?"active":"")+'">ЗА АЛМАЗЫ</button></nav><div class="tb-product-grid">'+products.map(item=>'<article class="tb-product"><div class="tb-product-icon">'+shopProductIconHtml(item)+'</div><b>'+esc(item.name.toUpperCase())+'</b><small>'+(item.id.startsWith("premium")?"Премиум аккаунт":item.id.startsWith("heal")?"Зелье исцеления":item.id.startsWith("xp")?"Зелье опыта":item.id.startsWith("drop")?"Зелье шанса дропа":"Улучшение экипировки")+'</small><span class="tb-product-price">'+item.price+' '+label+'</span><button data-buy="'+item.id+'" '+(shopTab==="silver"?(c.silver<item.price?"disabled":""):(account.diamonds<item.price?"disabled":""))+'>КУПИТЬ</button></article>').join("")+'</div>'+
   (shopTab==="diamond"?'<div class="tb-packages"><h3>Пакеты алмазов</h3><div class="tb-package-grid">'+(Array.isArray(balance.economy?.diamond_packages)?balance.economy.diamond_packages:[]).map(pack=>'<div><b>'+pack[0]+' алмазов</b><span>'+pack[1]+' ₽</span></div>').join("")+'</div><small>1 алмаз = 1 ₽ · платежи не подключены в браузерной версии</small></div>':'')+
   (shopTab==="diamond"?'<div class="tb-cosmetic-chests"><h2>Косметика за алмазы</h2><p>Только внешний вид · без влияния на характеристики.</p>'+(balance.cosmetics?.chests||[]).map(ch=>'<article><b>'+esc(ch.name)+'</b><small>'+ch.price+' ◆ · случайный предмет из коллекции</small><button data-cosmetic-chest="'+ch.id+'" '+(account.diamonds<ch.price?'disabled':'')+'>ОТКРЫТЬ СУНДУК</button></article>').join("")+'</div>':'')+'<p class="tb-note">Алмазы и премиум принадлежат аккаунту. Платёжный провайдер в браузерной версии не подключён.</p></section>';
 }
 function progressScreen(){
 const c=live();if(!c)return characterList();
 c.progress=c.progress&&typeof c.progress==="object"?c.progress:{highestEver:0,currentStage:1};c.stats=c.stats&&typeof c.stats==="object"?c.stats:{};c.achievements=Array.isArray(c.achievements)?c.achievements:[];
 let weekly=[];try{const snapshot=typeof engine.weeklySnapshot==="function"?engine.weeklySnapshot(c.id):[];weekly=Array.isArray(snapshot)?snapshot:[];}catch(error){console.warn("[Towerbound] weekly progress unavailable",error);}
 const claimed=c.achievements,achievementList=Array.isArray(balance.achievements?.achievements)?balance.achievements.achievements:[];
 let accountLevel=0;try{accountLevel=typeof engine.accountLevel==="function"?Number(engine.accountLevel())||0:0;}catch(error){console.warn("[Towerbound] account level unavailable",error);}
 const derived={highest_stage:Number(c.progress.highestEver)||0,lore_read:Array.isArray(c.loreRead)?c.loreRead.length:0,paragon_level:Number(c.paragon?.level)||0,account_level:accountLevel,season_clear:Number(c.stats.season_clear)||0};
 const achievements=achievementList.map(a=>{const value=derived[a.metric]??c.stats[a.metric]??c.progress[a.metric]??0,done=value>=a.target,owned=claimed.includes(a.id),progress=Math.min(a.target,Math.max(0,Number(value)||0)),rewardParts=[],reward=a.reward&&typeof a.reward==="object"?a.reward:{};if(Number(reward.silver)>0)rewardParts.push(reward.silver+" серебра");if(Number(reward.diamonds)>0)rewardParts.push(reward.diamonds+" алмазов");if(Array.isArray(reward.cosmetic)&&reward.cosmetic.length)rewardParts.push("косметика");const rewardLabel=rewardParts.join(" + ")||"без дополнительной награды";return '<article class="tb-system-row"><div><b>'+esc(a.name)+'</b><small>'+esc(a.description||"Условие достижения.")+' Прогресс: '+progress+'/'+a.target+' · '+esc(a.metric_label||"Показатель")+' · Награда: '+esc(rewardLabel)+'</small></div><button data-achievement="'+a.id+'" '+(!done||owned?'disabled':'')+'>'+(owned?'ПОЛУЧЕНО':done?'ЗАБРАТЬ':'ЗАКРЫТО')+'</button></article>';}).join("");
 const tasks=weekly.map(q=>'<div class="weekly-task-row"><div class="weekly-task-copy"><b>'+esc(q.name)+'</b><small>'+esc(q.description||"Выполните условие задания.")+'</small><small>Прогресс: '+q.progress+'/'+q.target+'</small></div><button class="weekly-task-status" data-weekly-claim="'+q.id+'" '+(!q.complete||q.claimed?'disabled':'')+'>'+(q.claimed?'ПОЛУЧЕНО':q.complete?'ЗАБРАТЬ':'В ПРОЦЕССЕ')+'</button></div>').join("");
 const loreCards=(balance.lore?.entries||[]).map(entry=>{const read=(c.loreRead||[]).includes(entry.id),open=c.progress.highestEver>=entry.unlock_stage;return '<article class="tb-system-row"><div><b>'+esc(entry.title)+'</b><small>Этап '+entry.unlock_stage+' · '+(read?'прочитано':open?'доступно':'закрыто')+' · +'+entry.xp_reward+' XP</small></div><button data-lore="'+entry.id+'" '+(!open||read?'disabled':'')+'>'+(read?'ПРОЧИТАНО':open?'ЧИТАТЬ':'ЗАКРЫТО')+'</button></article>';}).join("");
 const paragon=c.paragon||{level:0,xp:0,stats:{}},paragonRows=(balance.paragon?.stats||[]).map(stat=>'<div class="tb-system-row"><div><b>'+esc(stat)+'</b><small>Ранг '+(paragon.stats?.[stat]||0)+'</small></div><button data-paragon-stat="'+stat+'" '+(c.level<(balance.paragon?.unlock_level||100)||Object.values(paragon.stats||{}).reduce((a,b)=>a+b,0)>=(paragon.level||0)?'disabled':'')+'>+1</button></div>').join("");
 return header("Прогресс","Достижения · задания · лор · долгосрочное развитие")+'<section class="tb-systems"><h1>ПРОГРЕСС</h1><section class="tb-system-card"><div class="tb-system-actions"><button type="button" data-action="leaderboard">РЕЙТИНГ ИГРОКОВ</button><button type="button" data-action="open-meta-progression">ДОЛГОСРОЧНЫЙ ПРОГРЕСС · МЕТА-ПРОГРЕССИЯ</button></div></section><section class="tb-system-card"><h2>Достижения · '+claimed.length+'/'+achievementList.length+'</h2>'+achievements+'</section><section class="weekly-tasks-container"><h2>ЕЖЕНЕДЕЛЬНЫЕ ЗАДАНИЯ · '+esc(weekly[0]?.week||"ТЕКУЩАЯ НЕДЕЛЯ")+'</h2><div class="weekly-tasks-list">'+tasks+'</div><small class="weekly-tasks-note">Сброс каждый понедельник в 00:00 UTC.</small></section><section class="speedrun-container"><div class="tb-eyebrow">ИСПЫТАНИЕ СКОРОСТИ</div><h2>Спидран Башни</h2><b>ЛУЧШИЙ ЭТАП · '+(c.progress.highestEver||0)+' / 250</b><p>Завершено спидранов: '+(c.stats.speedrun_completions||0)+'</p></section><section class="tb-system-card"><h2>Парагон · '+(paragon.level||0)+'/100</h2><p>XP: '+(paragon.xp||0)+' / '+(balance.paragon?.xp_per_point||1)+'. Доступен после уровня '+(balance.paragon?.unlock_level||100)+'.</p>'+paragonRows+button("paragon-reset","СБРОСИТЬ ПАРАГОН · "+(balance.paragon?.reset_cost_silver||0)+" СЕРЕБРА",Object.values(paragon.stats||{}).reduce((a,b)=>a+b,0)?"":"disabled")+'</section><section class="tb-system-card"><h2>Лор Башни · '+(c.loreRead||[]).length+'/'+(balance.lore?.entries||[]).length+'</h2>'+loreCards+'</section></section>';
}
 function accountScreen(){
 const c=live();if(!c)return characterList();
 const prefs={sound_enabled:true,music_enabled:true,volume_master:.8,volume_music:.7,volume_effects:.8,...(engine.state.account.settings||{})},progression=c.progression||{},autoSalvageEnabled=!!engine.state.account.settings?.autoSalvage;
 const settings='<div class="tb-system-settings"><label>Звуковые эффекты <input type="checkbox" data-setting="sound_enabled" '+(prefs.sound_enabled!==false?'checked':'')+'></label><label>Фоновая музыка <input type="checkbox" data-setting="music_enabled" '+(prefs.music_enabled!==false?'checked':'')+'></label><label>Громкость <input type="range" min="0" max="1" step=".01" data-setting="volume_master" value="'+prefs.volume_master+'"></label><label>Музыка <input type="range" min="0" max="1" step=".01" data-setting="volume_music" value="'+prefs.volume_music+'"></label><label>Эффекты <input type="range" min="0" max="1" step=".01" data-setting="volume_effects" value="'+prefs.volume_effects+'"></label><button type="button" class="tb-secondary" data-action="toggle-mute">ЗВУК ВКЛ / ВЫКЛ</button><label>Отключить частицы <input type="checkbox" data-setting="disable_particles" '+(prefs.disable_particles?'checked':'')+'></label><label>Отключить тряску экрана <input type="checkbox" data-setting="disable_screen_shake" '+(prefs.disable_screen_shake?'checked':'')+'></label></div>';
 const convenience='<section class="tb-system-card tb-account-convenience"><h2>Удобство</h2><div class="tb-system-actions"><button type="button" data-action="claim-offline-progress">ЗАБРАТЬ ОФФЛАЙН-ПРОГРЕСС</button><button type="button" data-action="toggle-farm-speed">СКОРОСТЬ ФАРМА ×3 · '+(progression.speed3?'ВКЛ':'ВЫКЛ')+'</button><button type="button" data-action="toggle-auto-salvage">АВТО-РАЗБОР МУСОРА · '+(autoSalvageEnabled?'ВКЛ':'ВЫКЛ')+'</button><button type="button" data-action="push-notifications">PUSH-УВЕДОМЛЕНИЯ · '+(typeof Notification!=="undefined"?Notification.permission.toUpperCase():"НЕДОСТУПНЫ")+'</button></div></section>';
 return header("Аккаунт","Вход · настройки · безопасность")+'<section class="tb-systems"><h1>АККАУНТ</h1>'+accountAuthPanel()+'<section class="tb-system-card"><h2>Настройки звука и графики</h2>'+settings+'</section>'+convenience+'<section class="tb-system-card"><h2>Управление персонажем</h2><p>Сброс или удаление требуют подтверждения и точного ввода имени персонажа.</p><div class="tb-system-actions">'+button("reset-character","СБРОСИТЬ ПЕРСОНАЖА")+button("delete-character","УДАЛИТЬ ПЕРСОНАЖА")+'</div></section></section>';
}
  function systemsScreen(){return accountScreen();}
 function leaderboardScreen(){
  const c=live();
  const rows=onlineLeaderboardRows.map((row,index)=>'<article class="tb-leaderboard-row"><span class="tb-leaderboard-rank" aria-label="Место '+(index+1)+'">'+(index+1)+'</span><div class="tb-leaderboard-player"><b>'+esc(row.nickname)+'</b><small>'+esc(balance.classes.classes[row.class]?.name||row.class)+' <i>·</i> этап '+Number(row.max_stage||0)+'</small></div><strong class="tb-leaderboard-power">'+Number(row.battle_power||0).toLocaleString('ru-RU')+' <small>BP</small></strong></article>').join('');
  return header("Глобальный рейтинг","Топ-100 игроков")+'<section class="tb-systems tb-leaderboard-screen"><div class="tb-system-top"><div><h1>Рейтинг игроков</h1><p>'+(c?esc(c.name)+' · '+engine.combatPower(c)+' BP':'Список лучших героев башни')+'</p></div></div><section class="tb-system-card tb-leaderboard-card"><div class="tb-leaderboard-toolbar"><div><b>ЗАЛ СЛАВЫ</b><small>Сильнейшие герои башни</small></div><button data-action="leaderboard-refresh" '+(onlineBusy?'disabled':'')+'>'+(onlineBusy?'ЗАГРУЗКА…':'ОБНОВИТЬ ТОП-100')+'</button></div>'+(onlineLeaderboardError?'<p class="tb-online-error">'+esc(onlineLeaderboardError)+'</p>':'')+(rows?'<div class="tb-leaderboard-list">'+rows+'</div>':'<p class="tb-leaderboard-empty">Пока нет опубликованных игроков. Войди в аккаунт и опубликуй своего героя.</p>')+'<small class="tb-leaderboard-footnote">Глобальный рейтинг Supabase · сортировка по боевой мощи и максимальному этапу.</small></section></section>';
 }
 async function refreshOnlineLeaderboard(){
  if(!window.TowerboundOnline)throw new Error("Онлайн-модуль ещё загружается");
  onlineBusy=true;onlineLeaderboardError="";render();
  try{onlineLeaderboardRows=await window.TowerboundOnline.getLeaderboard();}
  catch(e){onlineLeaderboardError=e.message||"Не удалось загрузить рейтинг";}
  finally{onlineBusy=false;render();}
 }
 function deathScreen(){
  const c=live(),preview=engine.deathPreview(c.id),difficulty=balance.difficulty.modes[c.difficulty||balance.difficulty.default],total=difficulty.lives,remaining=c.run.lives||total,stage=c.run.stage?.stage||c.progress.currentStage,revivePrice=Math.max(5,Math.min(50,Math.round(5+(stage-50)*.225))),canRevive=!!c.run.stage&&!c.run.rescueUsed;
  return header("Забег завершён",c.name+" · "+(c.difficulty||"normal"))+'<section class="tb-death tb-death-overlay"><div class="tb-death-mark">☠</div><div class="tb-eyebrow">ПОСЛЕДНИЙ ШАНС</div><h1>Персонаж погиб</h1><p>Сложность: '+esc(c.difficulty||"normal")+'. Потеря опыта: '+Math.round(difficulty.xp_loss_fraction*100)+'% опыта текущего забега.</p><div class="tb-death-lives">ОСТАЛОСЬ ЖИЗНЕЙ: <b>'+remaining+' / '+total+'</b></div><div class="tb-death-losses"><div><small>ОПЫТ К ПОТЕРЕ</small><b>'+preview.experienceLoss+'</b></div><div><small>ВОЗМОЖНОЕ СНИЖЕНИЕ</small><b>'+preview.levelsLost+' уровн.</b></div><div><small>ШАНС ПОТЕРИ ВЕЩИ</small><b>'+Math.round(preview.itemLossChance*100)+'%</b></div></div><p>Надетые предметы и боссовый лут защищены. В Hardcore авто-бой, пояс и чекпоинты отключены.</p>'+(canRevive?'<button class="tb-primary tb-wide" data-action="revive" '+(engine.state.account.diamonds<revivePrice?"disabled":"") +'>ВОСКРЕСНУТЬ · '+revivePrice+' ◆ · 50% HP</button><small>Один раз за забег.</small>':'<p>Воскрешение недоступно для этого забега.</p>')+'<button class="tb-danger" data-action="confirm-death">ПОДТВЕРДИТЬ СМЕРТЬ</button></section>';
 }
 function currentEnemyConfig(enemy,stage){return engine.getEnemyStats(live().id,stage,enemy).hp;}
 function loadBattleEnemy(index){
  const c=live(),stage=c.run.stage,snapshot=stage.uiBattleSnapshot;
  if(!battle.enemies){
   const savedEnemies=Array.isArray(snapshot?.enemies)?snapshot.enemies:[];
   const killed=new Set(stage.killedIndices||[]);
   battle.enemies=stage.mobs.map((mob,i)=>{
    const stats=engine.getEnemyStats(c.id,battle.stage,mob),saved=savedEnemies.find(enemy=>enemy&&enemy.index===i);
    const maxHp=Math.max(1,Number(saved?.maxHp)||stats.hp),hp=Math.max(0,Math.min(maxHp,Number.isFinite(Number(saved?.hp))?Number(saved.hp):maxHp));
    const baseShield=mob.mechanic==="shield"?Math.round(maxHp*balance.elite_mechanics.shield.absorb_fraction):0;
    return{poison:0,bleed:0,weak:0,vulnerable:0,...mob,...(saved||{}),index:i,id:"enemy-"+i,mobId:mob.mobId||mob.enemyId||mob.key||mob.id||mob.name||mob.role||"unknown",maxHp,hp,phase:Math.max(1,Number(saved?.phase)||1),maxPhases:4,alive:!killed.has(i)&&saved?.alive!==false&&hp>0,dead:killed.has(i)||saved?.dead===true||hp<=0,attackIntervalMs:saved?.attackIntervalMs||stats.attackIntervalMs,shield:Number.isFinite(Number(saved?.shield))?Math.max(0,Number(saved.shield)):baseShield,nextHealAt:saved?.nextHealAt||0,nextPoisonAt:saved?.nextPoisonAt||0,slowedUntil:saved?.slowedUntil||0,pendingAttack:!!saved?.pendingAttack,turnsTaken:saved?.turnsTaken||0,speed:saved?.speed||mob.speed||1};
   });
   if(!stage.relicEffectsApplied){
    const startDamage=Math.max(0,Number(stage.relicStartDamage)||0),startWeak=Math.max(0,Number(stage.relicStartWeak)||0);
    for(const enemy of battle.enemies){if(!enemy.alive)continue;if(startDamage>0)enemy.hp=Math.max(1,enemy.hp-startDamage);if(startWeak>0)enemy.weak=Math.max(0,Number(enemy.weak)||0)+startWeak;}
    stage.relicEffectsApplied=true;
   }
   const healer=battle.enemies.find(enemy=>enemy.role==="healer"&&enemy.alive);index=healer?healer.index:(snapshot?.targetIndex??stage.targetIndex??stage.enemyIndex??0);
  }
  if(index===undefined||index===null||!battle.enemies[index]?.alive)index=battle.enemies.find(enemy=>enemy.alive)?.index;
  if(index===undefined)return false;
  const selected=engine.selectTarget(c.id,index);
  if(!selected){index=battle.enemies.find(enemy=>enemy.alive)?.index;if(index===undefined)return false;engine.selectTarget(c.id,index);}
  battle.targetIndex=index;battle.enemy=battle.enemies[index];battle.enemyStats=engine.getEnemyStats(c.id,battle.stage,battle.enemy);
  battle.enemyMax=battle.enemy.maxHp;battle.enemyHp=battle.enemy.hp;battle.shield=battle.enemy.shield||0;if(c.heroic&&!battle.enemy.mutation&&battle.enemy.type!=="boss")battle.enemy.mutation=gameRandom()<.5?"vampirism":"thorns";
  battle.counterAction=null;battle.pendingKill=false;const legacyStunTarget=battle.enemies.find(enemy=>Number(enemy.index)===Number(snapshot?.targetIndex??stage.targetIndex??stage.enemyIndex??0));if(battle.enemyStunned&&legacyStunTarget?.alive&&Number(legacyStunTarget.hp)>0)legacyStunTarget.stunned=true;battle.enemyStunned=false;battle.dot=null;battle.dots=[];battle.hot=null;battle.parryChance=0;battle.nextDamageShield=0;battle.teleportUsed=false;
  battle.playerDamageBuff=0;battle.playerBuffUntil=0;battle.enemyDamageReduction=0;battle.enemyDamageReductionUntil=0;
  battle.bossPhase=battle.enemy.type==="boss"?updateBossPhase():0;
  return true;
 }
 function skillIconMarkup(skill,classId){
  const icon=skill?.icon;
  if(typeof icon==="string"&&icon.trim()){
   const value=icon.trim(),alias={fire:"skill-fire",ice:"skill-ice",water:"skill-ice",arcane:"skill-arcane",dark:"skill-arcane",nature:"skill-arcane",poison:"skill-poison",physical:"skill-phys",phys:"skill-phys"};
   if(alias[value.toLowerCase()]||/^skill-(?:fire|ice|arcane|poison|phys)$/.test(value.toLowerCase()))return '<span class="v2-skill-icon '+(alias[value.toLowerCase()]||value.toLowerCase())+'" aria-hidden="true"></span>';
   if(/^(?:https?:)?\/\//i.test(value)||/^(?:\.{0,2}\/|\/|assets\/)/i.test(value)||/\.(?:png|jpe?g|webp|svg)(?:[?#].*)?$/i.test(value))return '<img class="v2-skill-icon" src="'+esc(value)+'" alt="">';
   if(/[^\x00-\x7F]/.test(value))return '<span class="v2-skill-icon v2-skill-icon-glyph" aria-hidden="true">'+esc(value)+'</span>';
  }
  const kind=({assassin:"skill-poison",bishop:"skill-arcane",dragonkin:"skill-fire",destroyer:"skill-phys",elemental:"skill-arcane",duelist:"skill-phys",shaman:"skill-arcane"}[classId]||"skill-arcane");
  return '<span class="v2-skill-icon '+kind+'" aria-hidden="true"></span>';
 }
 const ARENA_BACKGROUND_LOCATIONS=[
  {from:1,to:16,chapter:1,name:"Затопленный сток",src:"assets/Fon/image_25.jpeg"},
  {from:17,to:33,chapter:1,name:"Тюрьма",src:"assets/Fon/image_26.jpeg"},
  {from:34,to:50,chapter:1,name:"Разрушенная комната с колоннами",src:"assets/Fon/image_27.jpeg"},
  {from:51,to:63,chapter:2,name:"Руины с деревьями",src:"assets/Fon/image_28.jpeg"},
  {from:64,to:76,chapter:2,name:"Грибное болото",src:"assets/Fon/image_29.jpeg"},
  {from:77,to:88,chapter:2,name:"Ледяная пещера",src:"assets/Fon/image_30.jpeg"},
  {from:89,to:100,chapter:2,name:"Раскаленная кузня",src:"assets/Fon/image_31.jpeg"},
  {from:101,to:112,chapter:3,name:"Библиотека",src:"assets/Fon/image_32.jpeg"},
  {from:113,to:125,chapter:3,name:"Святилище Света",src:"assets/Fon/image_33.jpeg"},
  {from:126,to:137,chapter:3,name:"Обсерватория с шестеренками",src:"assets/Fon/image_34.jpeg"},
  {from:138,to:150,chapter:3,name:"Гнездо пауков",src:"assets/Fon/image_35.jpeg"},
  {from:151,to:166,chapter:4,name:"Алтарь Крови",src:"assets/Fon/image_36.jpeg"},
  {from:167,to:183,chapter:4,name:"Разлом Пустоты",src:"assets/Fon/image_37.jpeg"},
  {from:184,to:200,chapter:4,name:"Тронный Зал Теней",src:"assets/Fon/image_38.jpeg"},
  {from:201,to:212,chapter:5,name:"Сердце Башни",src:"assets/Fon/image_39.jpeg"},
  {from:213,to:224,chapter:5,name:"Небесная Бездна",src:"assets/Fon/image_40.jpeg"},
  {from:225,to:237,chapter:5,name:"Логово Дракона",src:"assets/Fon/image_42.jpeg"},
  {from:238,to:250,chapter:5,name:"Финальные Врата",src:"assets/Fon/image_43.jpeg"}
 ];
 let arenaBackgroundChapter=0,arenaBackgroundPreloads=new Map(),arenaBackgroundRequest=0,arenaBackgroundCurrentSrc="";
 function arenaBackgroundForStage(stage){const value=Math.max(1,Math.min(250,Number(stage)||1));return ARENA_BACKGROUND_LOCATIONS.find(item=>value>=item.from&&value<=item.to)||ARENA_BACKGROUND_LOCATIONS[0];}
 function ensureArenaBackground(arena,stage){
  if(!arena||typeof Image==="undefined")return;
  let first=arena.querySelector('.tb-arena-bg-layer[data-layer="a"]'),second=arena.querySelector('.tb-arena-bg-layer[data-layer="b"]');
  if(!first){first=document.createElement("div");first.className="tb-arena-bg-layer";first.dataset.layer="a";first.setAttribute("aria-hidden","true");arena.insertBefore(first,arena.firstChild);}
  if(!second){second=document.createElement("div");second.className="tb-arena-bg-layer";second.dataset.layer="b";second.setAttribute("aria-hidden","true");arena.insertBefore(second,first.nextSibling);}
  if(!first.dataset.seeded){
   if(arenaBackgroundCurrentSrc){first.style.backgroundImage='url("'+arenaBackgroundCurrentSrc.replace(/"/g,'%22')+'")';first.classList.add("is-visible");}
   first.dataset.seeded="1";
  }
  const location=arenaBackgroundForStage(stage);
  if(arena.dataset.arenaBackground===location.src)return;
  if(arenaBackgroundCurrentSrc===location.src){arena.dataset.arenaBackground=location.src;arena.dataset.arenaLocation=location.name;arena.dataset.arenaChapter=String(location.chapter);return;}
  if(arena.dataset.arenaBackgroundPending===location.src)return;
  arena.dataset.arenaBackgroundPending=location.src;
  if(arenaBackgroundChapter!==location.chapter){
   arenaBackgroundChapter=location.chapter;arenaBackgroundPreloads.clear();
   ARENA_BACKGROUND_LOCATIONS.filter(item=>item.chapter===location.chapter).forEach(item=>{const image=new Image();image.decoding='async';image.src=item.src;arenaBackgroundPreloads.set(item.src,image);});
  }
  const request=++arenaBackgroundRequest,image=arenaBackgroundPreloads.get(location.src);
  if(!image)return;
  const apply=()=>{
   if(request!==arenaBackgroundRequest||!arena.isConnected)return;
   const visible=first.classList.contains('is-visible')?first:second.classList.contains('is-visible')?second:null;
   const next=visible===first?second:first;
   next.style.backgroundImage='url("'+location.src.replace(/"/g,'%22')+'")';
   next.classList.add('is-visible');if(visible)visible.classList.remove('is-visible');
   arenaBackgroundCurrentSrc=location.src;arena.dataset.arenaBackground=location.src;delete arena.dataset.arenaBackgroundPending;arena.dataset.arenaLocation=location.name;arena.dataset.arenaChapter=String(location.chapter);
  };
  if(image.complete&&image.naturalWidth>0){apply();return;}
  image.addEventListener('load',apply,{once:true});
  image.addEventListener('error',()=>{if(request===arenaBackgroundRequest)delete arena.dataset.arenaBackgroundPending;console.warn('[TowerBound] arena background failed to load',location.src);},{once:true});
 }
 function battleScreen(){
  const c=live(),hp=engine.maxHp(live());
  const hpPct=Math.max(0,Math.min(100,(Number(c.run.playerHp)||0)/Math.max(1,hp)*100));
  const currentPotionStage=Math.max(1,Number(c.progress?.currentStage)||1),lastPotionStage=c.run?.lastPotionStage;
  const potionCooldown=lastPotionStage===null||lastPotionStage===undefined||!Number.isFinite(Number(lastPotionStage))?0:Math.max(0,5-(currentPotionStage-Number(lastPotionStage)));
  const ancientSetPieces=Math.max(0,Math.min(4,Number(battle.ancientSetPieces)||0)),ancientSetAwakened=ancientSetPieces>=2,ancientSetTierClass=ancientSetPieces>=4?"tier-4":ancientSetPieces>=3?"tier-3":ancientSetPieces>=2?"tier-2":"tier-0";
  const ancientSetNames={assassin:"Око Безмолвной Охоты",bishop:"Первый Свет",dragonkin:"Сердце Древнего Дракона",destroyer:"Кулак Прародителя",elemental:"Призма Семи Истоков",duelist:"Зеркало Последнего Выпада",shaman:"Тотем Корней Мира"};
  const ancientSetEffects={assassin:"ПЕРВАЯ АТАКА ×2",bishop:"+8 ЗДОРОВЬЯ",dragonkin:"+14 СТАРТОВОЙ БРОНИ",destroyer:"+2 УРОНА АТАК",elemental:"+2 СИЛЫ МАГИИ",duelist:"+2 БРОНИ ЗАЩИТЫ",shaman:"+1 СЛАБОСТЬ ВСЕМ ВРАГАМ"};
  const ancientSetMarkup=ancientSetPieces>0?'<div class="tb-battle-set-mark '+(ancientSetAwakened?'is-awakened '+ancientSetTierClass:'is-gathering')+'"><span class="tb-battle-set-sigil">'+(ancientSetPieces>=4?'✦':ancientSetPieces===3?'✧':'◇')+'</span><span class="tb-battle-set-copy"><b>'+(ancientSetPieces>=4?'ПОЛНОЕ ПРОБУЖДЕНИЕ':ancientSetPieces===3?'РЕЗОНАНС · II СТУПЕНЬ':'РЕЗОНАНС · I СТУПЕНЬ')+'</b><small>'+ancientSetPieces+'/4 · '+(ancientSetPieces>=4?(ancientSetNames[c.classId]||"Древний комплект")+' · '+(ancientSetEffects[c.classId]||"Сила комплекта"):ancientSetPieces===3?'Золотая аура · сила ордена растёт':'Пробуждающаяся печать · сила ордена растёт')+'</small><span class="tb-battle-set-progress" aria-label="'+ancientSetPieces+' из 4 реликвий">'+[1,2,3,4].map(n=>'<i class="'+(n<=ancientSetPieces?'is-lit':'')+'"></i>').join("")+'</span></span></div>':'';
  ensureLoadout(c);
  const enemies=battle.enemies.filter(enemy=>enemy&&enemy.alive&&Number(enemy.hp)>0);
  const enemyMarkup=enemies.map(target=>{
   const targetIndex=Number.isInteger(target.index)?target.index:battle.enemies.indexOf(target);
   const enemyHpPct=Math.max(0,Math.min(100,Number(target.hp)/Math.max(1,Number(target.maxHp)||1)*100));
   const intent=target.telegraph?.label||target.intent?.label||(battle.telegraph&&targetIndex===battle.targetIndex?battle.telegraph.label:enemyIntentText(target));
   const weaknessIcons={fire:"🔥",ice:"❄️",dark:"💀",physical:"⚔️"},weaknessIcon=weaknessIcons[String(target.weakness||"").toLowerCase()]||"";
   const attackInterval=Math.max(1,Number(target.attackIntervalTurns||target.turnInterval||(target.type==="boss"?2:3)));
   const attackCountdown=Math.max(1,attackInterval-((Number(target.turnsTaken)||0)%attackInterval));
   const countdownMarkup=(target.type==="boss"||target.type==="elite")?'<div class="new-enemy-countdown">Атака через: '+attackCountdown+'</div>':"";
   const phaseMarkup=target.type==="boss"?'<div class="tb-boss-phase">ФАЗА '+Math.min(target.maxPhases||4,target.phase||1)+' / '+(target.maxPhases||4)+'</div>':"";
   const threatMarkup=target.type==="boss"?'<div class="new-enemy-threat boss">☠ БОСС · ВЫСОКАЯ УГРОЗА</div>':target.champion?'<div class="new-enemy-threat elite">♛ ЧЕМПИОН БАШНИ · ОСОБАЯ МЕХАНИКА</div>':target.type==="elite"?'<div class="new-enemy-threat elite">✦ ЭЛИТНЫЙ ПРОТИВНИК</div>':"";
   const statuses=["poison","bleed","burn","weak","vulnerable","shield"].filter(key=>Number(target[key])>0).map(key=>'<span class="new-enemy-status">'+({poison:"☠️ Яд",bleed:"🩸 Кровь",burn:"🔥 Горение",weak:"💨 Слабость",vulnerable:"🎯 Уязвимость",shield:"🛡 Барьер"}[key])+' '+target[key]+'</span>').join("")+(target.champion&&target.mechanic==="reflect"?'<span class="new-enemy-status">🪞 Отражает 15% урона</span>':target.champion&&target.mechanic==="teleport"&&Number(target.teleportCharges??1)>0?'<span class="new-enemy-status">✧ Уклонится от следующего удара</span>':target.champion&&target.mechanic==="summon"&&!target.eliteSummoned?'<span class="new-enemy-status">☠ Готовит призыв прислужников</span>':target.champion&&target.mechanic==="berserk"?'<span class="new-enemy-status">🔥 Ярость при HP ниже 30%</span>':target.champion&&target.mechanic==="poison"?'<span class="new-enemy-status">☠ Ядовитые атаки</span>':"");
   return '<div class="new-enemy-item'+(targetIndex===battle.targetIndex?" selected":"")+'" data-target="'+targetIndex+'" role="button" tabindex="0" aria-pressed="'+(targetIndex===battle.targetIndex?'true':'false')+'">'+
    '<img src="'+esc(enemyPortrait(target))+'" class="new-enemy-img" alt="'+esc(target.name||"Враг")+'">'+
    '<div class="new-enemy-name">'+(weaknessIcon?'<span aria-label="Уязвимость">'+weaknessIcon+'</span>':"")+esc(target.name||balance.mobs.roles[target.role]?.name||"Враг")+'</div>'+
    threatMarkup+countdownMarkup+phaseMarkup+'<div class="new-enemy-intent">'+esc(intent)+'</div>'+
    '<div class="new-enemy-statuses">'+statuses+'</div><div class="new-enemy-hp-bar"><div style="width:'+enemyHpPct+'%"></div></div>'+
    '<div class="new-enemy-hp-text">'+Math.ceil(target.hp)+' HP</div></div>';
  }).join("");
  const handMarkup=renderHand();
  const healingPotionCount=(c.bag||[]).filter(item=>item&&item.type==="healing_potion").reduce((sum,item)=>sum+Math.max(0,Number(item.quantity)||0),0);
  if(hpPct<=30&&!battle.lowHpWarningLogged){battle.lowHpWarningLogged=true;logExpeditionEvent("Здоровье ниже 30% · "+Math.ceil(c.run.playerHp)+" / "+hp+" HP","#ff7777");}
  const hpWarningMarkup=hpPct<=30?'<div class="new-hero-warning '+(hpPct<=15?"critical":"") +'" role="status" aria-live="polite">'+(hpPct<=15?"⚠ КРИТИЧЕСКИ МАЛО ЗДОРОВЬЯ":"⚠ ЗДОРОВЬЕ НИЗКОЕ")+' · '+(healingPotionCount>0&&potionCooldown===0?"Зелье готово — используй его в свой ход":healingPotionCount>0?"Зелье на перезарядке · разыграй защиту":"Зелья нет · разыграй карты защиты")+'</div>':"";
  const relicMarkup=(c.relics||[]).map(id=>engine.RELICS_DATABASE?.[id]).filter(Boolean).map(relic=>'<span class="new-battle-relic" title="'+esc(relic.name+": "+relic.description)+'">'+esc(relic.icon||"✦")+'</span>').join("");
  const potionMarkup=(c.bag||[]).filter(item=>item&&item.type==="healing_potion"&&Number(item.quantity)>0).map(item=>'<button type="button" class="tb-battle-potion" data-battle-potion="'+esc(item.id)+'" title="Зелье исцеления · осталось '+Number(item.quantity)+'" '+(battle.actor?.type!=="player"||battle.paused||battle.potionUsedThisTurn||potionCooldown>0?'disabled':'')+'><span>🧪</span><b>'+Number(item.quantity)+'</b></button>').join("");
  return '<div class="new-battle-wrap'+(battle.fastBattle?" tb-fast-battle":"")+'">'+
   '<div class="new-battle-top"><span class="new-round-label">'+(battle.trialObjective?'ИСПЫТАНИЕ · '+esc(battle.trialObjective.label)+' · ':'')+'РАУНД '+battle.round+' · ИНИЦИАТИВА</span><div class="new-battle-relics" aria-label="Активные реликвии">'+relicMarkup+'</div>'+
   '<div class="new-battle-actions"><button type="button" class="tb-fast-battle-btn" data-action="toggle-fast-battle">'+(battle.fastBattle?"⚡ ×2":"⚡ ×1")+'</button><button type="button" class="new-pause-btn" data-action="pause">'+(battle.paused?"▶":"Ⅱ")+'</button></div></div>'+
   '<div class="new-battle-middle"><div class="new-hero-side'+(ancientSetAwakened?' tb-ancient-awakened tb-ancient-'+ancientSetTierClass+' tb-ancient-'+esc(c.classId):'')+'"><span class="tb-ancient-orbit" aria-hidden="true"></span><img src="'+esc(portrait(c.classId))+'" class="new-hero-img" alt="">'+ancientSetMarkup+
   '<div class="new-hero-name">'+esc(c.name)+'</div><div class="new-hp-bar"><div style="width:'+hpPct+'%"></div></div>'+
   '<div class="new-hero-hp-text">'+Math.ceil(c.run.playerHp)+' / '+hp+' HP</div>'+hpWarningMarkup+'<div class="new-hero-resource-text">'+esc(classData(c).resource)+' · '+Math.round(c.resource)+' / '+Math.round(c.resourceMax)+'</div>'+
   '<div class="new-hero-potions"><span class="tb-potion-cooldown">'+(potionCooldown>0?'Через '+potionCooldown+' этажей':'Готово')+'</span>'+potionMarkup+'</div></div>'+
   '<div class="new-enemies-side">'+enemyMarkup+'</div></div>'+
   '<div class="new-battle-bottom"><div class="new-turn-guidance" aria-live="polite">'+(battle.guildRaid?"РЕЙД · РАЗЫГРАЙ 3 КАРТЫ · "+Number(battle.cardsPlayedThisTurn||0)+"/3":(battle.actor?.type==="player"?"Твой ход. Выбери действие или заверши ход.":"Противники атакуют..."))+'</div>'+
   '<div class="new-stats-row"><div class="new-energy-summary"><span id="energyDisplay">'+(battle.guildRaid?'КАРТЫ: '+Number(battle.cardsPlayedThisTurn||0)+'/3':'ЭНЕРГИЯ: '+c.currentEnergy+'/'+c.energy)+'</span>'+classResourceMarkup(c)+'</div>'+
   '<div class="new-deck-controls"><button type="button" class="tb-deck-viewer-trigger" data-deck-viewer>▤ КОЛОДА <b id="deckViewerCount">'+collectDeckCards(c).length+'</b></button>'+
   '<span class="new-deck-counts">ДОБОР: <b id="deckCount">'+c.deck.length+'</b> · СБРОС: <b id="discardCount">'+c.discard.length+'</b></span></div></div>'+
   '<div class="new-hand-row" id="cardHand">'+handMarkup+'</div><div class="new-log-row">'+combatLogMarkup()+'</div>'+
   (battle.guildRaid?'<div class="new-end-turn" aria-live="polite">КАРТЫ РЕЙДА · '+Number(battle.cardsPlayedThisTurn||0)+' / 3</div>':'<button type="button" class="new-end-turn" id="endturn" data-action="end-turn" '+(battle.actor?.type!=="player"||battle.paused?"disabled":"")+'>'+(battle.actor?.type==="player"?"ЗАВЕРШИТЬ ХОД":"ХОД ПРОТИВНИКА…")+'</button>')+'</div>'+
   '<div class="tb-fx-layer" aria-hidden="true"></div></div>';
 }
 function trialObjectiveOptions(){return[{id:"swift",label:"Быстрая победа",description:"Победи обоих противников не позднее 6-го раунда."},{id:"potionless",label:"Без зелий",description:"Заверши испытание, не используя лечебные зелья."},{id:"vitality",label:"Несломленный",description:"Заверши бой, сохранив не менее 50% здоровья."}];}
 function buildTrialRewardChoices(c,stage){const choices=[],cards=Object.values(CARD_DATABASE||{}).filter(card=>card&&card.rarity==="rare"&&(!card.classId||card.classId===c.classId)&&(!card.class_id||card.class_id===c.classId));const card=cards.length?cards[Math.floor(gameRandom()*cards.length)]:null;const relics=Object.values(engine.RELICS_DATABASE||{}).filter(relic=>!(c.relics||[]).includes(relic.id)&&(!relic.classId||(relic.classId===c.classId&&relic.branchId===c.branch)));const relic=relics.length?relics[Math.floor(gameRandom()*relics.length)]:null;choices.push({id:"silver",name:"Кошель испытателя",description:"Получить серебро сразу",amount:120+Math.min(500,stage*4)});if(card)choices.push({id:"card",name:card.name||"Редкая карта",description:"Добавить редкую карту в колоду",card:JSON.parse(JSON.stringify(card))});else choices.push({id:"silver2",name:"Дополнительный кошель",description:"Получить ещё серебро",amount:180+Math.min(600,stage*5)});if(relic)choices.push({id:"relic",name:relic.name,description:"Получить постоянную реликвию",relicId:relic.id});else choices.push({id:"silver3",name:"Сундук с припасами",description:"Получить серебро",amount:220+Math.min(700,stage*6)});return choices;}
 function claimTrialReward(choiceId){const c=live(),choice=(postBattleSummary?.trialRewards||postBattleSummary?.championRewards||[]).find(item=>item.id===choiceId);if(!c||!choice)return;if(choice.id.startsWith("silver")){c.silver=(Number(c.silver)||0)+Math.max(0,Number(choice.amount)||0);notify("Награда получена · +"+choice.amount+" серебра");}else if(choice.id==="card"&&choice.card){c.deck.push({...JSON.parse(JSON.stringify(choice.card)),instanceId:"trial-"+Date.now()+"-"+Math.floor(gameRandom()*100000)});notify("Испытание пройдено · редкая карта добавлена в колоду");}else if(choice.id==="relic"&&choice.relicId){if(!(c.relics||[]).includes(choice.relicId))c.relics.push(choice.relicId);notify("Испытание пройдено · реликвия получена");}postBattleSummary.trialRewards=null;postBattleSummary.championRewards=null;postBattleSummary.trialRewardClaimed=true;save();render();}
 function eventTypeForStage(character,stage){return character&&character.run&&character.run.mapEvents?character.run.mapEvents[stage]:null;}
 function showMapEventOverlay(){const c=live();if(!c)return;const stage=Number(selectedStage),type=eventTypeForStage(c,stage);if(!type)return beginStage();const data={altar:["✦","Древний алтарь","Под пеплом мерцают древние руны. Алтарь предлагает силу в обмен на жертву.",[["pray","Помолиться · −10 HP, получить редкую карту"],["defile","Осквернить · +100 серебра и проклятие: Рана"],["leave","Уйти"]]],chest:["▣","Забытый сундук","Сундук оплетён корнями. Внутри может быть золото или реликвия.",[["open","Открыть"],["leave","Оставить"]]],wanderer:["♙","Странник","Из тумана выходит путник и предлагает помощь… или проверяет твою решимость.",[["pay","Заплатить 50 серебра · лечение 20% HP"],["attack","Атаковать · обычный бой"]]],cache:["▣","Тайник снабжения","Под обломками найден герметичный тайник. Внутри сохранились припасы и серебро.",[["take","Забрать припасы"],["leave","Уйти"]]],healing:["✚","Забытый лазарет","В стене башни скрыта лечебница. Остались целебные настои, но только на один приём.",[["rest","Восстановить 30% здоровья"],["leave","Уйти"]]],merchant:["♜","Торговец-кочевник","Редкий торговец открыл склад прямо среди руин. За 75 серебра он предложит лечебный эликсир.",[["buy","Купить лечение · 75 серебра · 35% HP"],["leave","Уйти"]]],trial:["⚔","Испытание Башни","За запечатанной дверью ждут два усиленных противника. Победа даст выбор редкой награды, но для получения награды нужно выполнить особое условие.",[["enter","Принять испытание · усиленные враги · выбрать награду"],["leave","Отступить · пройти этаж без испытания"]]],champion:["♛","Зал Чемпиона","В этой комнате правит чемпион Башни. Это одиночный элитный противник с особой механикой: он может призывать прислужников, отражать удары, отравлять или впадать в ярость. Победа открывает выбор редкой награды.",[["enter","Вызвать чемпиона · высокая угроза · награда на выбор"],["leave","Отступить · пропустить зал"]]],secret:["✧","Зал скрытых имён","Тайная дверь открывается только тому, кто услышит правильный ответ древнего механизма. Здесь спрятана реликвия, связанная с твоим классом.",[["memory","Память"],["silence","Тишина"],["blood","Кровь"],["leave","Отступить"]]],guardian:["♜","Древний хранитель","За печатью пробуждается древний страж. Победа над ним откроет древнюю реликвию и дополнительную добычу.",[["enter","Разбудить хранителя · опасный бой"],["leave","Не тревожить"]]],secret_cache:["▣","Забытый тайник Ордена","Знак из тайной комнаты совпадает с печатью на сундуке. Внутри лежит ключ от святилища и серебро.",[["unlock","Открыть тайник"],["leave","Оставить"]]],secret_boss:["♛","Святилище Первого Стража","Ключ открыл путь в древнее святилище. За печатью ждёт прародитель хранителей — его победа завершит тайную цепочку и откроет древнюю реликвию.",[["enter","Войти в святилище · босс повышенной угрозы"],["leave","Отступить и вернуться позже"]]]}[type];if(!data)return beginStage();document.querySelector(".tb-map-event-overlay")?.remove();const o=document.createElement("div");o.className="tb-map-event-overlay";o.dataset.eventStage=String(stage);o.dataset.eventType=type;o.innerHTML='<section class="tb-map-event-modal" role="dialog" aria-modal="true"><div class="tb-eyebrow">СЛУЧАЙНОЕ СОБЫТИЕ · ЭТАП '+stage+'</div><div style="font-size:36px">'+data[0]+'</div><h2>'+esc(data[1])+'</h2><p>'+esc(data[2])+'</p>'+data[3].map(x=>'<button type="button" class="tb-event-choice" data-map-event-choice="'+x[0]+'">'+esc(x[1])+'</button>').join('')+'</section>';document.body.appendChild(o);}
 function completeMapEventStage(){const c=live(),stage=Number(selectedStage);if(!c||c.run.stage)throw new Error("Сначала заверши текущий этап");const plan=engine.beginStage(c.id,stage);for(let i=0;i<(plan.mobs||[]).length;i++)engine.finishEnemy(c.id,{targetIndex:i,speed2:false});c.run.completedMapEvents=c.run.completedMapEvents||[];if(!c.run.completedMapEvents.includes(stage))c.run.completedMapEvents.push(stage);logExpeditionEvent("Этап "+stage+" · событие пройдено","#9bd49b");return c;}
 function scheduleSecretChainEvent(character,fromStage,type){const run=character.run;run.mapEvents=run.mapEvents&&typeof run.mapEvents==="object"?run.mapEvents:{};for(let stage=Number(fromStage)+1;stage<=balance.map.total_stages;stage++){if(stage%balance.map.boss_every===0||run.completedMapEvents?.includes(stage))continue;if(!run.mapEvents[stage]){run.mapEvents[stage]=type;return stage;}}return 0;}
 function resolveMapEventChoice(choice){const o=document.querySelector(".tb-map-event-overlay"),c=live();if(!o||!c)return;const type=o.dataset.eventType;if(type==="secret"){const answers={assassin:"silence",bishop:"memory",dragonkin:"blood",destroyer:"blood",elemental:"memory",duelist:"silence",shaman:"memory"};if(choice==="leave"){completeMapEventStage();o.remove();save();render();notify("Ты оставил загадку неразгаданной");return;}if(["memory","silence","blood"].includes(choice)){completeMapEventStage();const correct=answers[c.classId]===choice;if(correct){c.silver=(Number(c.silver)||0)+75;notify("Верный ответ · найден знак древнего Ордена");}else{const damage=Math.max(1,Math.round(engine.maxHp(c)*.08));c.run.playerHp=Math.max(1,c.run.playerHp-damage);notify("Ложный ответ · ловушка нанесла "+damage+" урона, но знак удалось забрать");}const cacheStage=scheduleSecretChainEvent(c,selectedStage,"secret_cache");if(cacheStage){c.run.secretQuest={phase:"cache",clueStage:Number(selectedStage),cacheStage};notify(correct?"Знак активирован · на карте появился тайник Ордена":"Знак вырвался из ловушки · ищи тайник Ордена");}else{c.silver=(Number(c.silver)||0)+250;notify("Путь к тайнику обрушился · компенсация 250 серебра");}o.remove();save();render();return;}}if(type==="secret_cache"){if(choice==="leave"){o.remove();notify("Тайник останется здесь · можно вернуться");return;}if(choice==="unlock"){completeMapEventStage();const quest=c.run.secretQuest||{};const bossStage=scheduleSecretChainEvent(c,selectedStage,"secret_boss");if(bossStage){c.run.secretQuest={...quest,phase:"boss",cacheStage:Number(selectedStage),bossStage};c.silver=(Number(c.silver)||0)+150;notify("Ключ найден · открыто святилище на этапе "+bossStage);}else{c.silver=(Number(c.silver)||0)+450;c.run.secretQuest={...quest,phase:"completed"};notify("Тайник дал всё, что мог · +450 серебра");}o.remove();save();render();return;}}if(type==="secret_boss"){if(choice==="leave"){o.remove();notify("Святилище ждёт · можно вернуться позже");return;}if(choice==="enter"){c.run.pendingChampion={stage:Number(selectedStage),ancientGuardian:true,secretBoss:true};o.remove();save();beginStage();return;}}if(type==="guardian"&&choice==="enter"){c.run.pendingChampion={stage:Number(selectedStage),ancientGuardian:true};o.remove();save();beginStage();return;}if(type==="guardian"&&choice==="leave"){completeMapEventStage();o.remove();save();render();notify("Хранитель остался спать");return;}if(type==="trial"&&choice==="enter"){const options=trialObjectiveOptions(),objective=options[Math.floor(gameRandom()*options.length)];c.run.pendingTrial={stage:Number(selectedStage),objective};o.remove();save();beginStage();return;}if(type==="champion"&&choice==="enter"){c.run.pendingChampion={stage:Number(selectedStage)};o.remove();save();beginStage();return;}if(type==="champion"&&choice==="leave"){c.run.completedMapEvents=Array.isArray(c.run.completedMapEvents)?c.run.completedMapEvents:[];if(!c.run.completedMapEvents.includes(Number(selectedStage)))c.run.completedMapEvents.push(Number(selectedStage));c.run.pendingChampion=null;o.remove();save();render();notify("Ты отступил из зала чемпиона · обычный этап остаётся доступен");return;}if(type==="wanderer"&&choice==="attack"){o.remove();beginStage();return;}if(choice==="leave"){completeMapEventStage();o.remove();save();render();notify("Ты покинул место события · этап пройден");return;}try{if(type==="altar"&&choice==="pray"){completeMapEventStage();c.run.playerHp=Math.max(1,c.run.playerHp-10);const classPool=Object.values(CARD_DATABASE).filter(x=>x&&x.rarity==="rare"&&(!x.classId||x.classId===c.classId)),pool=classPool.length?classPool:Object.values(CARD_DATABASE).filter(x=>x&&x.rarity==="rare");const card=pool[Math.floor(gameRandom()*pool.length)];if(card)c.deck.push({...JSON.parse(JSON.stringify(card)),instanceId:"event-"+Date.now()});o.remove();save();render();notify("−10 HP · редкая карта получена");return;}if(type==="altar"&&choice==="defile"){completeMapEventStage();c.silver=(Number(c.silver)||0)+100;const w=CARD_DATABASE.curse_wound||{id:"curse_wound",name:"Проклятие: Рана",type:"curse",cost:0,description:"Проклятие. Нельзя разыграть.",effects:{unplayable:true}};c.deck.push({...JSON.parse(JSON.stringify(w)),instanceId:"event-curse-"+Date.now()});o.remove();save();render();notify("+100 серебра · проклятие добавлено");return;}if(type==="chest"&&choice==="open"){completeMapEventStage();const relics=Object.entries(engine.RELICS_DATABASE||{}).filter(x=>!(c.relics||[]).includes(x[0]));if(relics.length&&gameRandom()<.35){const r=relics[Math.floor(gameRandom()*relics.length)];c.relics.push(r[0]);notify("Найдена реликвия: "+r[1].name);}else{const gold=50+Math.floor(gameRandom()*51);c.silver=(Number(c.silver)||0)+gold;notify("Найдено "+gold+" серебра");}o.remove();save();render();return;}if(type==="wanderer"&&choice==="pay"){if(Number(c.silver)<50)throw new Error("Недостаточно серебра · нужно 50");completeMapEventStage();c.silver-=50;const before=c.run.playerHp;c.run.playerHp=Math.min(engine.maxHp(c),before+Math.round(engine.maxHp(c)*.2));o.remove();save();render();notify("Странник исцелил на "+(c.run.playerHp-before)+" HP");return;}if(type==="cache"&&choice==="take"){completeMapEventStage();const relics=Object.entries(engine.RELICS_DATABASE||{}).filter(x=>!(c.relics||[]).includes(x[0]));if(relics.length&&gameRandom()<.2){const r=relics[Math.floor(gameRandom()*relics.length)];c.relics.push(r[0]);notify("В тайнике найдена реликвия: "+r[1].name);}else{const gold=80+Math.floor(gameRandom()*61);c.silver=(Number(c.silver)||0)+gold;notify("Припасы проданы за "+gold+" серебра");}o.remove();save();render();return;}if(type==="healing"&&choice==="rest"){completeMapEventStage();const before=c.run.playerHp;c.run.playerHp=Math.min(engine.maxHp(c),before+Math.round(engine.maxHp(c)*.3));o.remove();save();render();notify("Лазарет восстановил "+(c.run.playerHp-before)+" HP");return;}if(type==="merchant"&&choice==="buy"){if(Number(c.silver)<75)throw new Error("Недостаточно серебра · нужно 75");completeMapEventStage();c.silver-=75;const before=c.run.playerHp;c.run.playerHp=Math.min(engine.maxHp(c),before+Math.round(engine.maxHp(c)*.35));o.remove();save();render();notify("Торговец продал эликсир · восстановлено "+(c.run.playerHp-before)+" HP");return;}}catch(e){notify(e.message);}}

 function finishGuildRaid(){
  if(!guildRaid||!battle?.guildRaid||guildRaid.finishing)return;
  if(guildRaid.cards.length!==3){notify("Нужно разыграть ровно 3 карты");return;}
  guildRaid.finishing=true;const session=guildRaid,c=live();
  const raidTarget=(battle.enemies||[]).find(enemy=>enemy.index===battle.targetIndex&&enemy.alive&&enemy.hp>0);
  if(raidTarget){for(const [key,type] of [['poison','dark'],['bleed','physical'],['burn','fire']]){const tick=Math.max(0,Number(raidTarget[key])||0);if(tick>0){applyTargetDamage(raidTarget,tick,type);if(!battle)return;raidTarget[key]=0;}}}
  const payload={damage:Math.max(0,Math.floor(Number(session.damage)||0)),cardIds:session.cards.slice(0,3)};
  stopBattleStatusLoop();clearPendingTurnTimer();clearTimeout(pendingTimer);pendingTimer=null;
  battle=null;guildRaid=null;
  if(c){
   c.run=session.originalRun;c.deck=session.originalDeck;c.hand=session.originalHand;c.discard=session.originalDiscard;c.exhaustPile=session.originalExhaust;c.currentEnergy=session.originalEnergy;c.resource=session.originalResource;
   for(const [key,value] of Object.entries(session.originalResources||{}))c[key]=value;
  }
  screen="map";save();render();
  Promise.resolve().then(()=>session.onFinish?.(payload)).catch(error=>notify(error?.message||"Не удалось отправить результат рейда"));
 }
 function startGuildRaid(info,onFinish){
  const c=live();if(!c||!engine)throw new Error("Персонаж не найден");
  if(battle||c.run?.stage)throw new Error("Сначала заверши текущий бой");
  if(!info?.attempt_id||!Number(info.boss_hp)||!Number(info.boss_max_hp))throw new Error("Сервер не вернул данные рейда");
  ensureCardDeck(c);syncEquipmentCards(c);
  const originalRun=c.run?JSON.parse(JSON.stringify(c.run)):null,originalDeck=JSON.parse(JSON.stringify(c.deck||[])),originalHand=JSON.parse(JSON.stringify(c.hand||[])),originalDiscard=JSON.parse(JSON.stringify(c.discard||[])),originalExhaust=JSON.parse(JSON.stringify(c.exhaustPile||[])),originalEnergy=c.currentEnergy,originalResource=c.resource;
  const resourceKeys=["combo","rage","charges","faith","element","magicCharge","totem"],originalResources=Object.fromEntries(resourceKeys.filter(key=>c[key]!==undefined).map(key=>[key,c[key]]));
  try{
   const stageNumber=Math.max(1,Math.min(250,Number(selectedStage)||Number(c.progress?.currentStage)||1)),plan=engine.beginStage(c.id,stageNumber);
   if(!c.run?.stage)throw new Error("Не удалось подготовить рейдовую арену");
   c.run.stage.mobs=[{id:"guild-ancient-devourer",mobId:"guild-ancient-devourer",name:"Древний Пожиратель",type:"normal",role:"boss",statMultiplier:1,weakness:null,resistance:null,speed:1}];
   c.run.stage.killedIndices=[];c.run.stage.uiBattleSnapshot=null;c.run.stage.targetIndex=0;c.run.stage.enemyIndex=0;
   battle={stage:plan.stage||stageNumber,count:1,enemy:null,enemyHp:0,enemyMax:Number(info.boss_max_hp),shield:0,cardBlock:Math.max(0,Number(plan.relicStartingBlock)||0),relicStartingDraw:Math.max(0,Number(plan.relicStartingDraw)||0),firstAttackDouble:!plan.relicFirstAttackConsumed&&Number(plan.relicFirstAttackMultiplier)>1,relicAttackBonus:Math.max(0,Number(plan.relicAttackBonus)||0),relicBlockBonus:Math.max(0,Number(plan.relicBlockBonus)||0),cardSpellPower:Math.max(0,Number(plan.relicSpellPower)||0),relicBranchSynergyBonus:Math.max(0,Number(plan.relicBranchSynergyBonus)||0),nextAttackDamageBonus:0,round:1,turnIndex:0,turnOrder:[],actor:null,turns:0,busy:false,isPlayerTurn:true,timerRemainingMs:0,timerStartedAt:0,remainingResponseMs:0,enemies:null,targetIndex:0,skillCooldowns:{},counterCooldownTurns:0,ultimateCooldownTurns:0,playerSkillUsed:false,potionUsedThisTurn:false,counterPrimed:false,counterConsumed:false,playerTurnCount:0,bossDeadlineTurns:null,bossAddsSummoned:false,poisonStacks:0,comboProgress:{},attacksThisFight:0,distinctElements:[],buffsUsed:0,telegraph:null,paused:false,proc:null,fx:null,enemyQueueToken:0,combatLog:[],fastBattle:false,isCardAnimating:false,showTutorial:false,guildRaid:true,cardsPlayedThisTurn:0,actionDamageLedger:{}};
   if(!loadBattleEnemy(0))throw new Error("Не удалось создать босса гильдии");
   const boss=battle.enemy;boss.name=String(info.boss_name||"Древний Пожиратель");boss.type="normal";boss.role="boss";boss.mobId="guild-ancient-devourer";boss.icon="☠";boss.hp=Number(info.boss_hp);boss.maxHp=Number(info.boss_max_hp);boss.alive=true;boss.dead=false;boss.mutation=null;boss.shield=0;boss.pendingAttack=false;boss.pendingAction=null;
   battle.enemyHp=boss.hp;battle.enemyMax=boss.maxHp;battle.shield=0;battle.targetIndex=0;battle.actor={type:"player",id:"player",name:c.name};battle.isPlayerTurn=true;battle.busy=false;battle.paused=false;battle.telegraph=null;battle.cardsPlayedThisTurn=0;
   resetCardBattle(c);const raidDraw=Math.max(0,Number(battle.relicStartingDraw)||0);battle.relicStartingDraw=0;drawCards(Math.max(0,5-c.hand.length)+cardDrawBonus(c)+raidDraw);battle.actor={type:"player",id:"player",name:c.name};battle.cardsPlayedThisTurn=0;
   guildRaid={attemptId:info.attempt_id,cards:[],damage:0,originalRun,originalDeck,originalHand,originalDiscard,originalExhaust,originalEnergy,originalResource,originalResources,onFinish};
   screen="battle";render();save();return true;
  }catch(error){
   battle=null;guildRaid=null;c.run=originalRun;c.deck=originalDeck;c.hand=originalHand;c.discard=originalDiscard;c.exhaustPile=originalExhaust;c.currentEnergy=originalEnergy;c.resource=originalResource;
   for(const [key,value] of Object.entries(originalResources))c[key]=value;
   screen="map";save();render();throw error;
  }
 }


 function skipFloorsPowerPlan(character){
  const currentPower=Math.max(0,Number(engine.combatPower(character))||0),adjustedPower=Math.floor(currentPower*.9);
  // Calibrated to the requested progression examples: 8,000 BP ≈ floor 65; 7,200 BP ≈ floor 56.
  const stageFromPower=value=>Math.max(1,Math.min(balance.map.total_stages,Math.floor(65+(Number(value)-8000)*9/800)));
  const powerStageBeforeMargin=stageFromPower(currentPower),powerStage=stageFromPower(adjustedPower);
  const highest=Math.max(0,Number(character.progress?.highestEver)||0),bossEvery=Math.max(1,Number(balance.map?.boss_every)||10);
  const fallbackStage=Math.max(1,Math.floor(highest/bossEvery)*bossEvery+1);
  const cappedByRecord=powerStageBeforeMargin>highest;
  const targetStage=cappedByRecord?fallbackStage:Math.max(1,Math.min(powerStage,highest+1));
  return{currentPower,adjustedPower,powerStageBeforeMargin,powerStage,highest,fallbackStage,targetStage,cappedByRecord};
 }
 function showSkipFloorsModal(){
  const c=live();if(!c){notify("Не найден активный персонаж — открой список персонажей и выбери героя");return;}
  if(screen==="battle"&&battle){notify("Сначала заверши текущий бой — пропуск доступен между этажами");return;}
  if((Number(c.progress?.highestEver)||0)<10){notify("Сначала пройди первого босса на 10-м этаже");return;}
  const plan=skipFloorsPowerPlan(c),overlay=document.createElement("div");
  overlay.className="tb-skip-floors-overlay";
  overlay.innerHTML='<section class="tb-skip-floors-modal" role="dialog" aria-modal="true" aria-labelledby="tbSkipFloorsTitle"><div class="tb-eyebrow">TOWERBOUND · УСКОРЕННОЕ ВОСХОЖДЕНИЕ</div><h2 id="tbSkipFloorsTitle">Пропуск этажей</h2><p class="tb-skip-floors-intro">Сначала определяем этаж по полной боевой мощи, затем применяем запас −10%. Если полная мощь выше твоего рекорда, стартуем с начала предыдущего десятиэтажного отрезка.</p><div class="tb-skip-floors-stats"><div><small>ТВОЯ МОЩЬ</small><b>'+plan.currentPower.toLocaleString("ru-RU")+'</b></div><div><small>С УЧЁТОМ −10%</small><b>'+plan.adjustedPower.toLocaleString("ru-RU")+'</b></div><div><small>РЕКОРД БАШНИ</small><b>'+plan.highest+'/250</b></div><div><small>ЭТАЖ БЕЗ ЗАПАСА</small><b>'+plan.powerStageBeforeMargin+'</b></div><div><small>ЭТАЖ ПО МОЩИ −10%</small><b>'+plan.powerStage+'</b></div></div>'+(plan.cappedByRecord?'<div class="tb-skip-floors-reason"><b>Мощи хватает выше рекорда</b><span>Чтобы не перескакивать непройденный босс-рубеж, вход будет с начала последнего открытого десятиэтажного отрезка.</span></div>':'<div class="tb-skip-floors-reason"><b>Этаж рассчитан по твоей мощи</b><span>Расчётный этаж находится в пределах уже открытого прогресса.</span></div>')+'<div class="tb-skip-floors-target"><small>ТЫ НАЧНЁШЬ С ЭТАЖА</small><strong>'+plan.targetStage+'</strong><span>из 250</span></div><div class="tb-skip-floors-actions"><button type="button" data-skip-floors-close>ОТМЕНА</button><button type="button" class="tb-primary" data-skip-floors-confirm>НАЧАТЬ С '+plan.targetStage+' ЭТАЖА</button></div></section>';
  document.body.appendChild(overlay);
  const close=()=>{overlay.remove();};
  overlay.querySelector("[data-skip-floors-close]")?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();close();});
  overlay.addEventListener("click",event=>{if(event.target===overlay)close();});
  overlay.querySelector("[data-skip-floors-confirm]")?.addEventListener("click",event=>{
   event.preventDefault();event.stopPropagation();
   const current=live();if(!current){close();notify("Персонаж не найден");return;}
   if(screen==="battle"&&battle){close();notify("Сначала заверши текущий бой");return;}
   const latest=skipFloorsPowerPlan(current);
   try{
    // A stage snapshot left in storage while the map is open is abandoned without rewards.
    if(current.run?.stage)current.run.stage=null;
    engine.voluntaryRestart(current.id);
    current.progress.currentStage=latest.targetStage;
    current.run.playerHp=engine.maxHp(current);
    current.run.dailyChallengeActive=false;current.run.dailyChallengeDate=null;current.run.dailyChallengeSeed=null;
    current.run.pendingTrial=null;current.run.pendingChampion=null;
    selectedStage=latest.targetStage;pendingSkipStage=latest.targetStage;skipFloorsPending=true;towerMapOpen=false;screen="map";battle=null;postBattleSummary=null;
    // Skipping is a direct start: do not leave the player on the reset floor or wait for a separate deck-modal click.
    prepareStarterDeck(current,[]);
    close();save();beginStage();
    if(screen==="battle"&&battle?.stage===latest.targetStage)notify("Пропуск выполнен · начат этаж "+latest.targetStage);
   }catch(error){close();notify("Не удалось выполнить пропуск: "+(error?.message||String(error)));}
  });
 }
 function beginStage(){postBattleSummary=null;
  const c=live();
  try{
   ensureCardDeck(c);syncEquipmentCards(c);
   const requestedStage=pendingSkipStage||selectedStage;const plan=engine.beginStage(c.id,requestedStage,(pendingSkipStage||skipFloorsPending)?{skipFloors:true}:undefined);if(Number(plan.stage)!==Number(requestedStage))throw new Error("Не удалось запустить выбранный этаж: движок вернул этаж "+plan.stage+" вместо "+requestedStage);c.progress.currentStage=Number(plan.stage);pendingSkipStage=0;skipFloorsPending=false;selectedStage=Number(plan.stage);ensureLoadout(c);
   const activeTrial=c.run.pendingTrial&&Number(c.run.pendingTrial.stage)===Number(selectedStage)?c.run.pendingTrial:null;
   const activeChampion=c.run.pendingChampion&&Number(c.run.pendingChampion.stage)===Number(selectedStage)?c.run.pendingChampion:null;
   if(activeChampion&&!activeTrial&&c.run.stage?.mobs?.length){const champion=c.run.stage.mobs[0],profiles=activeChampion.secretBoss?[{role:"tank",mechanic:"reflect",name:"Эребор, Прародитель Стражей"}]:activeChampion.ancientGuardian?[{role:"tank",mechanic:"shield",name:"Астерион, Хранитель Печатей"}]:[{role:"tank",mechanic:"shield",name:"Хранитель Железной Клятвы"},{role:"poison",mechanic:"poison",name:"Чумной Палач"},{role:"normal",mechanic:"summon",name:"Повелитель Пепельных Прислужников"},{role:"bleed",mechanic:"berserk",name:"Кровавый Берсерк"},{role:"normal",mechanic:"teleport",name:"Призрачный Дуэлянт"},{role:"tank",mechanic:"reflect",name:"Зеркальный Страж"}],profile=profiles[Math.floor(gameRandom()*profiles.length)];c.run.stage.mobs=c.run.stage.mobs.slice(0,1);c.run.stage.count=1;plan.count=1;champion.type="elite";champion.role=profile.role;champion.mechanic=profile.mechanic;champion.name=profile.name;champion.champion=true;champion.trialHpMultiplier=activeChampion.secretBoss?2.25:1.65;champion.trialDamageMultiplier=activeChampion.secretBoss?1.5:1.28;plan.mobs=c.run.stage.mobs;}
   if(activeTrial&&c.run.stage?.mobs?.length){c.run.stage.mobs=c.run.stage.mobs.slice(0,2);c.run.stage.count=2;plan.count=2;c.run.stage.mobs.forEach((mob,index)=>{mob.type=index===0?"elite":"normal";mob.mechanic=index===0?"berserk":null;mob.trialHpMultiplier=index===0?.72:1.8;mob.trialDamageMultiplier=index===0?1.08:1.35;});plan.mobs=c.run.stage.mobs;}
    if(c.run.dailyChallengeActive&&c.run.dailyChallengeModifier==="rage")c.run.stage.mobs.forEach(mob=>{mob.dailyDamageMultiplier=1.2;});
   if(routeChoice==="elite"&&!plan.boss&&!activeChampion&&!activeTrial&&c.run.stage?.mobs?.length){c.run.stage.mobs[0].type="elite";c.run.stage.mobs[0].mechanic="shield";}
   
   if(selectedStage%13===0){const stack=c.bag.find(x=>x.type==="antidote"&&(x.quantity||1)>0);if(stack){stack.quantity=(stack.quantity||1)-1;c.bag=c.bag.filter(x=>x.quantity!==0);notify("Ловушка обезврежена противоядием");}else{const trapDamage=Math.round(engine.maxHp(c)*.08);c.run.playerHp=Math.max(1,c.run.playerHp-trapDamage);notify("Ловушка! −"+trapDamage+" HP · купи противоядие");}}
   selectedStage=plan.stage;
   battle={stage:plan.stage,count:plan.count,ancientSetPieces:Math.max(0,Number(plan.relicSetPieces)||0),ancientSetClass:c.classId,ancientSetAwakened:Math.max(0,Number(plan.relicSetPieces)||0)>=4,trialObjective:activeTrial?.objective||null,championEncounter:!!activeChampion,trialPotionUsed:false,enemy:null,enemyHp:0,enemyMax:0,shield:0,cardBlock:Math.max(0,Number(plan.relicStartingBlock)||0),relicStartingDraw:Math.max(0,Number(plan.relicStartingDraw)||0),firstAttackDouble:!plan.relicFirstAttackConsumed&&Number(plan.relicFirstAttackMultiplier)>1,relicAttackBonus:Math.max(0,Number(plan.relicAttackBonus)||0),relicBlockBonus:Math.max(0,Number(plan.relicBlockBonus)||0),cardSpellPower:Math.max(0,Number(plan.relicSpellPower)||0),nextAttackDamageBonus:0,round:1,turnIndex:0,turnOrder:[],actor:null,turns:0,busy:false,isPlayerTurn:true,timerRemainingMs:0,timerStartedAt:0,remainingResponseMs:0,enemies:null,targetIndex:0,skillCooldowns:{},counterCooldownTurns:0,ultimateCooldownTurns:0,playerSkillUsed:false,potionUsedThisTurn:false,counterPrimed:false,counterConsumed:false,playerTurnCount:0,bossDeadlineTurns:null,bossAddsSummoned:false,poisonStacks:0,comboProgress:{},attacksThisFight:0,distinctElements:[],buffsUsed:0,telegraph:null,paused:false,proc:null,fx:null,enemyQueueToken:0,combatLog:[],fastBattle:false,isCardAnimating:false,showTutorial:false};
   const savedSnapshot=plan.uiBattleSnapshot;if(savedSnapshot){battle.relicStartingDraw=0;battle.round=Math.max(1,Number(savedSnapshot.round)||1);battle.skillCooldowns={...(savedSnapshot.skillCooldowns||{})};battle.comboStacks=savedSnapshot.comboStacks||0;battle.comboProgress={...(savedSnapshot.comboProgress||{})};const savedCombat=savedSnapshot.combatState||{};for(const key of PERSISTED_BATTLE_FIELDS)if(Object.prototype.hasOwnProperty.call(savedCombat,key))battle[key]=savedCombat[key];}
   if(savedSnapshot?.cardState){const state=savedSnapshot.cardState;c.deck=Array.isArray(state.deck)?state.deck:[];c.hand=Array.isArray(state.hand)?state.hand:[];c.discard=Array.isArray(state.discard)?state.discard:[];c.exhaustPile=Array.isArray(state.exhaustPile)?state.exhaustPile:[];c.currentEnergy=Math.max(0,Math.min(c.energy,Number(state.currentEnergy)||0));battle.cardBlock=Math.max(0,Number(state.cardBlock)||0);battle.cardResume=state.actorType!=="enemy";battle.actor={type:state.actorType==="enemy"?"enemy":"player",id:state.actorType==="enemy"?"enemy-phase":"player",name:state.actorType==="enemy"?"Ход противников":c.name};}else{resetCardBattle(c);battle.cardResume=false;}
   if(loadBattleEnemy()===false){battle=null;screen="map";selectedStage=c.progress.currentStage;save();render();notify("Бой восстановлен на карте: живых целей не осталось");return;}
   syncInitiative();screen="battle";
   logExpeditionEvent("Этап "+battle.stage+" · "+(plan.boss?"БОСС":routeChoice==="elite"?"ЭЛИТНЫЙ БОЙ":"сражение началось"),plan.boss?"#ff8c69":routeChoice==="elite"?"#e8bd5b":"#d9d2c5");
   const savedQueue=savedSnapshot?.enemyQueueState;
   if(savedSnapshot?.cardState?.actorType==="enemy"&&savedQueue&&Array.isArray(savedQueue.indices)){
    battle.enemyQueueState={indices:savedQueue.indices.map(Number).filter(Number.isFinite),cursor:Math.max(0,Number(savedQueue.cursor)||0)};
    battle.paused=false;battle.busy=true;battle.isPlayerTurn=false;battle.actor={type:"enemy",id:"enemy-phase",name:"Ход противников"};
    if(!resumeEnemyTurnQueue(350))showPlayerTurn();
   }else if(savedSnapshot?.cardState?.actorType==="player"){
    battle.enemyQueueState=null;battle.paused=false;battle.busy=false;battle.isPlayerTurn=true;battle.actor={type:"player",id:"player",name:c.name};battle.cardResume=false;
   }else{battle.enemyQueueState=null;showPlayerTurn();}
   save();render();
  }catch(error){notify(error.message);}
 }
 function reconcileBattleCompletion(){
  if(!battle||!Array.isArray(battle.enemies))return false;
  const living=battle.enemies.filter(enemy=>enemy&&enemy.alive===true&&Number(enemy.hp)>0);
  if(living.length)return false;
  const defeated=battle.enemies.filter(Boolean).sort((a,b)=>Number(a.index)-Number(b.index)).at(-1);
  if(!defeated)return false;
  // Damage-over-time kills can bypass the regular card-hit completion path.
  for(const enemy of battle.enemies){if(!enemy)continue;enemy.hp=0;enemy.alive=false;enemy.dead=true;enemy.pendingAttack=false;enemy.pendingAction=null;}
  battle.enemy=defeated;battle.targetIndex=Number(defeated.index)||0;battle.enemyHp=0;battle.shield=Number(defeated.shield)||0;
  finishCurrentEnemy();
  return true;
 }
 function finishCurrentEnemy(){
  if(!battle||battle.finishingEnemy)return;
  const c=live();
  if(!c?.run?.stage){stopBattleStatusLoop();clearPendingTurnTimer();battle=null;screen="map";selectedStage=c?.progress?.currentStage||selectedStage;save();render();return;}
  battle.finishingEnemy=true;
  clearTimeout(pendingTimer);pendingTimer=null;
  const defeated=battle.enemy,playerHpRatioBeforeReward=Math.max(0,Math.min(1,(Number(c.run.playerHp)||0)/Math.max(1,engine.maxHp(c)))),dead=(battle.enemies||[]).filter(enemy=>!enemy.alive||enemy.hp<=0).sort((x,y)=>x.index-y.index);
  let result=null;const allLoot=[];
  if(!postBattleSummary)postBattleSummary={stage:battle.stage,xp:0,silver:0,loot:[],autoEquipped:0,nextStage:false};
  for(const target of dead){
   if(!c.run?.stage)break;
   if(c.run.stage.killedIndices?.includes(target.index))continue;
   const current=engine.finishEnemy(c.id,{speed2:c.run.speed2,targetIndex:target.index,overkillBonus:target.index===defeated.index&&!!battle.overkillBonus});
   syncEquipmentCards(c);
   if(current.relicChoices?.length)postBattleSummary.relicChoices=current.relicChoices;
   battle.overkillBonus=false;allLoot.push(...(current.loot||[]));result=current;
   c.stats=c.stats||{};c.stats.killsByMob=c.stats.killsByMob||{};
   const mobKey=String(target.mobId||target.enemyId||target.key||target.name||target.role||"unknown").toLowerCase().replace(/_/g,"-");
   c.stats.killsByMob[mobKey]=(c.stats.killsByMob[mobKey]||0)+1;c.stats.kills=(c.stats.kills||0)+1;
   postBattleSummary.xp+=Number(current.xp)||0;postBattleSummary.silver+=Number(current.silver)||0;postBattleSummary.autoEquipped+=Number(current.autoEquipped)||0;postBattleSummary.loot.push(...(current.loot||[]));
   target.hp=0;target.alive=false;target.dead=true;
   if(current.stageComplete)break;
  }
  if(!result){if(battle)battle.finishingEnemy=false;return;}
  if(allLoot.length)notify("Добыча: "+allLoot.map(x=>x.name||x.type).join(", "));
  if(result.stageComplete){
   const completedBossStage=Number(battle.stage)||0,echoEntry=balance.lore.entries.find(entry=>Number(entry.unlock_stage)===completedBossStage);
   if(completedBossStage>0&&completedBossStage%10===0&&echoEntry&&!(c.echoSilverClaimed||[]).includes(echoEntry.id)){const loreBoss=dead.find(enemy=>enemy.type==="boss")||defeated;c.run.pendingEchoStage=completedBossStage;c.run.pendingEchoBossName=String(loreBoss.name||loreBoss.mobId||"Страж Башни");}
   const activeTrial=c.run.pendingTrial&&Number(c.run.pendingTrial.stage)===Number(battle.stage)?c.run.pendingTrial:null;
   const activeChampion=c.run.pendingChampion&&Number(c.run.pendingChampion.stage)===Number(battle.stage)?c.run.pendingChampion:null;
   const ancientVictoryCue=Number(battle.ancientSetPieces)>=4&&(dead.some(enemy=>enemy.type==="boss"||enemy.role==="boss")||(completedBossStage>0&&completedBossStage%10===0)||!!activeTrial||!!activeChampion)?{kind:activeTrial||activeChampion?"trial":"boss",stage:completedBossStage,classId:c.classId}:null;
   if(activeChampion){postBattleSummary.championCleared=true;postBattleSummary.championRewards=buildTrialRewardChoices(c,battle.stage);if(activeChampion.ancientGuardian){if(activeChampion.secretBoss){c.run.secretQuest={...(c.run.secretQuest||{}),phase:"completed",completedAtStage:Number(battle.stage)};c.silver=(Number(c.silver)||0)+250;}const ancientRelics={assassin:["ancient_assassin_eye","Око Безмолвной Охоты"],bishop:["ancient_bishop_chalice","Чаша Первого Света"],dragonkin:["ancient_dragon_heart","Сердце Древнего Дракона"],destroyer:["ancient_destroyer_gauntlet","Кулак Прародителя"],elemental:["ancient_elemental_prism","Призма Семи Истоков"],duelist:["ancient_duelist_mirror","Зеркало Последнего Выпада"],shaman:["ancient_shaman_totem","Тотем Корней Мира"]},ancient=ancientRelics[c.classId];if(ancient&&!(c.relics||[]).includes(ancient[0]))postBattleSummary.championRewards=[{id:"relic",name:ancient[1],description:"Гарантированная древняя реликвия твоего класса",relicId:ancient[0]},...postBattleSummary.championRewards.filter(choice=>choice.id!=="relic")].slice(0,3);}c.run.completedMapEvents=Array.isArray(c.run.completedMapEvents)?c.run.completedMapEvents:[];if(!c.run.completedMapEvents.includes(Number(battle.stage)))c.run.completedMapEvents.push(Number(battle.stage));c.run.pendingChampion=null;}
   if(activeTrial){const objectiveId=activeTrial.objective?.id,passed=objectiveId==="swift"?Number(battle.round)<=6:objectiveId==="potionless"?!battle.trialPotionUsed:Number(c.run.playerHp)>=Math.ceil(engine.maxHp(c)*.5);postBattleSummary.trialPassed=passed;postBattleSummary.trialObjective=activeTrial.objective?.label||"Особое условие";if(passed)postBattleSummary.trialRewards=buildTrialRewardChoices(c,battle.stage);else postBattleSummary.trialFailed=true;c.run.completedMapEvents=Array.isArray(c.run.completedMapEvents)?c.run.completedMapEvents:[];if(!c.run.completedMapEvents.includes(Number(battle.stage)))c.run.completedMapEvents.push(Number(battle.stage));c.run.pendingTrial=null;}
   logExpeditionEvent("Этап "+battle.stage+" пройден · следующий узел "+(Number(c.progress.currentStage)||battle.stage+1),"#9bd49b");
   if(c.classId==="destroyer")c.rage=0;
   const carryOverHp=Math.max(1,Math.min(engine.maxHp(c),Math.round(engine.maxHp(c)*playerHpRatioBeforeReward)));
   c.run.playerHp=carryOverHp;
   if(c.run.snapshot&&Number(c.run.snapshot.stage)===Number(c.progress.currentStage))c.run.snapshot.hp=carryOverHp;
   stopBattleStatusLoop();clearTimeout(pendingTimer);pendingTimer=null;const speedrun=c.run.speedrun;
   if(speedrun?.active){speedrun.remaining=Math.max(0,(speedrun.remaining||10)-1);if(speedrun.remaining>0&&c.progress.currentStage<=balance.map.total_stages){postBattleSummary.nextStage=true;postBattleSummary.speedrunRemaining=speedrun.remaining;}else{c.stats.speedrun_completions=(c.stats.speedrun_completions||0)+1;c.run.speedrun=null;}}
   if(c.run.active&&c.progress.currentStage>postBattleSummary.stage&&c.progress.currentStage<=balance.map.total_stages)postBattleSummary.nextStage=true;
   if(c.run.dailyChallengeActive)saveDailyChallengeResult(c);
   postBattleSummary.ready=true;
   if(routeChoice==="elite"){c.silver+=30;postBattleSummary.silver+=30;routeChoice="standard";}
   battle=null;selectedStage=c.progress.currentStage;screen="map";save();render();if(ancientVictoryCue)document.dispatchEvent(new CustomEvent("tb:ancient-relic-victory",{detail:ancientVictoryCue}));if(Number(c.run.pendingEchoStage)>0)showEchoOfPastScreen(c,c.run.pendingEchoStage);
  }else{
   const carryShield=battle.nextDamageShield||0;
   loadBattleEnemy(result.nextTargetIndex);
   battle.nextDamageShield=carryShield;
   if(c.classId==="destroyer"){
    const until=Date.now()+balance.procs.destroyer.duration_seconds*1000;
    battle.playerDamageBuff=balance.procs.destroyer.value;
    battle.playerBuffUntil=until;
    battle.proc={...balance.procs.destroyer,expiresAt:until};
   }
   battle.finishingEnemy=false;
   save();render();
  }
 }
 function endFromDamage(){
  const c=live();if(c.classId==="destroyer")c.rage=0;if(c.run.stage&&battle)c.run.stage.uiBattleSnapshot={enemies:JSON.parse(JSON.stringify(battle.enemies||[])),targetIndex:battle.targetIndex,comboStacks:battle.comboStacks||0,skillCooldowns:JSON.parse(JSON.stringify(battle.skillCooldowns||{})),comboProgress:JSON.parse(JSON.stringify(battle.comboProgress||{}))};if(!settings().disable_screen_shake){root.classList.add("tb-death-shaking");setTimeout(()=>root.classList.remove("tb-death-shaking"),520);}stopBattleStatusLoop();clearTimeout(pendingTimer);pendingTimer=null;battle=null;screen="death";render();save();
 }
 function stopBattleStatusLoop(){if(statusTimer){clearInterval(statusTimer);statusTimer=null;}}
 function startBattleStatusLoop(){stopBattleStatusLoop();}
 function addPoisonStack(damage,ticks){if(!battle)return;battle.poisonDots=battle.poisonDots||[];battle.poisonDots.push({damage,ticks,nextAt:Date.now()+1000});}
 function updateBattleStatus(){
  if(!battle||battle.paused)return;
  const c=live(),now=Date.now();let changed=false;
  for(const enemy of battle.enemies||[]){
   if(enemy.alive!==true||Number(enemy.hp)<=0){enemy.alive=false;enemy.dead=true;enemy.hp=0;enemy.pendingAttack=false;enemy.pendingAction=null;continue;}
   if(enemy.role==="healer"&&now>=enemy.nextHealAt){
    const ally=battle.enemies.filter(x=>x.alive&&x.hp>0&&x.index!==enemy.index&&x.hp<x.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    if(ally){const before=ally.hp;ally.hp=Math.min(ally.maxHp,ally.hp+Math.round(ally.maxHp*balance.mobs.roles.healer.heal_fraction));const healed=ally.hp-before;if(healed>0)showFloatingText(ally,"+"+healed,"#58e38b");if(battle.enemy===ally)battle.enemyHp=ally.hp;changed=true;}
    enemy.nextHealAt=now+balance.mobs.roles.healer.interval_ms;
   }
   if(enemy.role==="poison"&&now>=enemy.nextPoisonAt){
    enemy.poisonDue=true;enemy.nextPoisonAt=now+balance.mobs.roles.poison.interval_ms;changed=true;
   }
  }
  for(const dot of battle.poisonDots||[]){
   if(dot.ticks>0&&now>=dot.nextAt){const before=c.run.playerHp;c.run.playerHp=Math.max(0,c.run.playerHp-dot.damage);const taken=before-c.run.playerHp;if(taken>0&&c.classId==="destroyer")c.rage=Math.min(10,(Number(c.rage)||0)+1);if(taken>0){showFloatingText("player","-"+taken,"#ff596b");playSfx("hurt");if(!settings().disable_screen_shake)battle.shakeUntil=Date.now()+240;}dot.ticks--;dot.nextAt=now+1000;changed=true;if(c.run.playerHp<=0){endFromDamage();return;}}
  }
  battle.poisonDots=(battle.poisonDots||[]).filter(dot=>dot.ticks>0);
  if(c.classId==="bishop"&&c.run.playerHp<=engine.maxHp(c)*balance.procs.bishop.threshold&&(battle.bishopProcReadyAt||0)<=now){
   const proc=balance.procs.bishop,before=c.run.playerHp;c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*proc.value));if(c.run.playerHp>before){showFloatingText("player","+"+Math.round(c.run.playerHp-before),"#58e38b");pulseCombatActor("player","heal");}battle.bishopProcReadyAt=now+proc.cooldown_seconds*1000;battle.proc={...proc,expiresAt:now+3000};changed=true;
  }
  if(battle.proc&&battle.proc.expiresAt&&battle.proc.expiresAt<=now){battle.proc=null;changed=true;}
  if(battle.fx&&battle.fx.until<=now){battle.fx=null;changed=true;}
  if(battle.phaseFlashUntil&&battle.phaseFlashUntil<=now){battle.phaseFlashUntil=0;battle.phaseNotice=null;changed=true;}
  if(changed){save();render();}
 }
 function triggerAncientRelicProc(kind){if(!battle||Number(battle.ancientSetPieces)<2)return;document.dispatchEvent(new CustomEvent("tb:ancient-relic-proc",{detail:{kind,targetIndex:Number(battle.targetIndex)||0,tier:Math.min(4,Math.max(2,Number(battle.ancientSetPieces)||2))}}));}
 function triggerVfx(kind,damageType,critical){
  if(!battle)return;const colors={fire:"#ff713d",ice:"#73cfff",dark:"#bd83ff",physical:"#f0d18c"};
  if(!settings().disable_skill_flashes)battle.fx={kind,color:colors[damageType]||"#e8d7a8",until:Date.now()+520};
  if(critical&&!settings().disable_screen_shake)battle.shakeUntil=Date.now()+300;
 }
 function pulseCombatActor(target,kind){const node=target==="player"?root.querySelector(".new-hero-side"):root.querySelector('.new-enemy-item[data-target="'+(target&&target.index!==undefined?target.index:battle?.targetIndex)+'"]');if(!node)return;const cls=kind==="heal"?"tb-heal-glow":kind==="armor"?"tb-armor-glow":"tb-hit-shake";node.classList.remove(cls);void node.offsetWidth;node.classList.add(cls);setTimeout(()=>node.classList.remove(cls),850);}
 function showEchoOfPastScreen(character,stage){
  const floor=Math.max(1,Number(stage)||0),entry=balance?.lore?.entries?.find(item=>Number(item.unlock_stage)===floor);if(!character||!entry||document.querySelector(".tb-echo-past-overlay"))return false;
  const overlay=document.createElement("div");overlay.className="tb-echo-past-overlay";overlay.dataset.stage=String(floor);overlay.setAttribute("role","presentation");
  const boss=String(character.run?.pendingEchoBossName||"Страж Башни"),bodyText="Этап "+floor+". Ты победил "+boss+". "+entry.text;
  overlay.innerHTML='<section class="tb-echo-past-card" role="dialog" aria-modal="true" aria-labelledby="tbEchoPastTitle"><div class="tb-echo-past-kicker">TOWERBOUND · ХРОНИКИ БАШНИ</div><div class="tb-echo-past-mark" aria-hidden="true">✧</div><h2 id="tbEchoPastTitle">ЭХО ПРОШЛОГО</h2><div class="tb-echo-past-stage">ЭТАП '+floor+' · '+esc(entry.title)+'</div><div class="tb-echo-past-divider"></div><p>'+esc(bodyText)+'</p><div class="tb-echo-past-reward">✦ НАГРАДА ЗА ПРОЧТЕНИЕ <b>+100 СЕРЕБРА</b></div><button type="button" data-echo-read="1">ПРОЧИТАТЬ И ЗАБРАТЬ НАГРАДУ</button></section>';
  document.body.appendChild(overlay);overlay.querySelector("[data-echo-read]")?.addEventListener("click",()=>{const c=live();if(!c)return;const lore=balance.lore.entries.find(item=>Number(item.unlock_stage)===floor);if(!lore)return;try{let xp=0;if(!(c.loreRead||[]).includes(lore.id)){const result=engine.readLore(c.id,lore.id);xp=Number(result.xp)||0;}c.echoSilverClaimed=Array.isArray(c.echoSilverClaimed)?c.echoSilverClaimed:[];if(!c.echoSilverClaimed.includes(lore.id)){c.silver=(Number(c.silver)||0)+100;c.echoSilverClaimed.push(lore.id);}c.run.pendingEchoStage=null;c.run.pendingEchoBossName=null;overlay.remove();save();render();notify("Эхо прочитано · +100 серебра"+(xp?" · +"+xp+" XP":""));}catch(error){notify(error.message);}});
  return true;
 }
 function shakeBattleArena(){const arena=root.querySelector(".new-battle-wrap");if(!arena)return;arena.classList.remove("tb-shake");void arena.offsetWidth;arena.classList.add("tb-shake");setTimeout(()=>arena.classList.remove("tb-shake"),200);}
 function showPlayerDamageFlash(){root.classList.remove("tb-player-damage-flash");void root.offsetWidth;root.classList.add("tb-player-damage-flash");setTimeout(()=>root.classList.remove("tb-player-damage-flash"),360);}
 function showFloatingText(target,text,color,kind){
  const layer=root.querySelector(".tb-fx-layer");if(!layer)return;
  const number=document.createElement("span");number.className="tb-floating-damage";
  const fxKind=kind==="poison"?"is-poison":kind==="bleed"?"is-bleed":color==="#58e38b"?"is-heal":color==="#ffd34e"?"is-crit":"is-damage";number.classList.add(fxKind);
  number.textContent=String(text);number.style.color=color;
  const anchor=target==="player"?root.querySelector(".new-hero-side"):target&&typeof target==="object"?root.querySelector('.new-enemy-item[data-target="'+target.index+'"]'):root.querySelector(".new-enemy-item");
  if(anchor){const box=anchor.getBoundingClientRect(),base=layer.getBoundingClientRect();number.style.left=(box.left+box.width/2-base.left)+"px";number.style.top=(box.top-base.top+Math.min(20,box.height*.12))+"px";}
  layer.appendChild(number);setTimeout(()=>number.remove(),1000);
  if(target==="player"&&String(text).trim().startsWith("-"))showPlayerDamageFlash();
 }
 function applyTargetDamage(target,rawDamage,damageType,options){
  options=options||{};const c=live();
  if(!target||target.hp<=0||!target.alive){
   const next=(battle?.enemies||[]).find(enemy=>enemy.alive&&enemy.hp>0);
   if(next&&battle){if(next.index!==battle.targetIndex)setBattleTarget(next.index);return{damage:0,dealt:0,multiplier:1,killed:false,revived:false,recovered:true};}
   if(battle)finishCurrentEnemy();return{damage:0,dealt:0,multiplier:1,killed:false,revived:false,recovered:true};
  }
  let revived=false,multiplier=engine.damageTypeMultiplier(target,damageType||"physical");
  if(!options.ignoreArmor&&target.role==="tank"&&target.alive&&(target.guardCharges||0)>0){multiplier*=1-(balance.mobs.roles.tank.shield_fraction||.3);target.guardCharges--; }
  if(target.mechanic==="teleport"&&Number(target.teleportCharges??1)>0){target.teleportCharges=Math.max(0,Number(target.teleportCharges??1)-1);notify("ЭЛИТА ТЕЛЕПОРТИРОВАЛАСЬ · атака уклонена");showFloatingText(target,"УКЛОНЕНИЕ","#9bd8ff");return{damage:0,dealt:0,multiplier:1,killed:false,revived:false,dodged:true};}
  let damage=Math.max(0,Math.round(rawDamage*multiplier*(Number(target.vulnerable)>0?1.5:1)));
   if(target.type==="boss"){battle.actionDamageLedger=battle.actionDamageLedger||{};const used=battle.actionDamageLedger[target.index]||0;damage=engine.capBossDamage(target,damage,used,options.ultimate?"ultimate":undefined);}
  if(target.shield>0){const absorbed=Math.min(target.shield,damage);target.shield-=absorbed;damage-=absorbed;}
  const hpBeforeHit=target.hp;const dealt=battle?.guildRaid?damage:Math.min(target.hp,damage);target.hp=battle?.guildRaid?Math.max(1,target.hp-damage):Math.max(0,target.hp-damage);if(battle?.guildRaid&&guildRaid)guildRaid.damage+=dealt;
  if(target.type==="boss"){updateBossPhase(target);if(!battle)return{damage,dealt,multiplier,killed:false,revived};}
  if(target.hp<=0){target.hp=0;target.alive=false;target.dead=true;target.pendingAttack=false;target.pendingAction=null;}
  if(dealt>0){target.lastDamagedByPlayer=true;if(target.role==="healer")target.provoked=true;}
  if(dealt>0&&target.mechanic==="reflect"){const reflected=Math.max(1,Math.round(dealt*(balance.elite_mechanics.reflect.damage_fraction||.15)));c.run.playerHp=Math.max(0,c.run.playerHp-reflected);showFloatingText("player","-"+reflected,"#d29cff");if(c.run.playerHp<=0)endFromDamage();}
  if(dealt>0&&target.type==="boss"&&Number(target.reflectTurns)>0){const reflected=Math.max(1,Math.round(dealt*.25));target.reflectTurns=0;c.run.playerHp=Math.max(0,c.run.playerHp-reflected);showFloatingText("player","-"+reflected,"#d29cff");notify("ЗЕРКАЛО БОССА · отражено "+reflected);if(c.run.playerHp<=0)endFromDamage();}
  if(dealt>0)engine.applyVampirism(c.id,dealt);if(dealt>0&&target.mutation==="vampirism"&&target.hp>0)target.hp=Math.min(target.maxHp,target.hp+Math.round(dealt*.06));if(dealt>0&&target.mutation==="thorns"){const thorn=Math.max(1,Math.round(dealt*.04));c.run.playerHp=Math.max(0,c.run.playerHp-thorn);if(c.classId==="destroyer")c.rage=Math.min(10,(Number(c.rage)||0)+1);showFloatingText("player","-"+thorn,"#ff596b");playSfx("hurt");}if(dealt>0&&battle.actionIsSkill&&battle.actionIsPrimaryHit&&rawDamage>2*hpBeforeHit)battle.overkillBonus=true;
  if(dealt>0){pulseCombatActor(target,"hit");const damageKind=String(damageType||"").toLowerCase(),fxKind=options.critical?"":damageKind==="poison"?"poison":damageKind==="bleed"?"bleed":"";showFloatingText(target,options.critical?"КРИТ -"+dealt:"-"+dealt,options.critical?"#ffd34e":fxKind==="poison"?"#65e58b":fxKind==="bleed"?"#ff5c61":"#ffffff",fxKind);playSfx(options.critical?"crit":"hit");}
  if(dealt>0&&target.type==="boss"&&target.phase>1)logCombatEvent("Удар по боссу · "+dealt+" урона · фаза "+target.phase,"#e9d5a5");
  if(options.critical){if(navigator.vibrate)navigator.vibrate(50);const arena=document.querySelector("#tbRpg .tb-v2");if(arena){arena.classList.add("hit-stop");setTimeout(()=>arena.classList.remove("hit-stop"),50);}}
  if(options.critical||target.hp<=0)shakeBattleArena();
  if(target.hp<=0&&target.hp<hpBeforeHit&&navigator.vibrate)navigator.vibrate(100);
  if(target.index===battle.targetIndex){battle.enemyHp=target.hp;battle.shield=target.shield||0;}
  if(target.type==="boss"){battle.actionDamageLedger=battle.actionDamageLedger||{};battle.actionDamageLedger[target.index]=(battle.actionDamageLedger[target.index]||0)+dealt;updateBossPhase();}
  return{damage,dealt,multiplier,killed:target.hp<=0,revived};
 }
 function scheduleEnemyTelegraph(){const farmSpeed=live().progression?.speed3?3:1;/* No real-time timers: speed3 is applied to turn cooldown cadence. */}
 function resolveEnemyTelegraph(){/* Enemy turns resolve through initiative. */}
 function basicAttack(){
  if(!battle||battle.actor?.type!=="player"||battle.playerSkillUsed||battle.busy||battle.paused)return;
  const c=live(),profile=engine.basicAttackStats(c.id),target=battle.enemy;if(!target||!target.alive||target.hp<=0){notify("Нет активной цели");return;}
  battle.playerSkillUsed=true;battle.actionDamageLedger={};battle.actionIsSkill=false;battle.actionIsPrimaryHit=true;
  const result=applyTargetDamage(target,profile.damage*(engine.getCombatStats(c).damageMultiplier||1),"physical");if(!battle)return;battle.actionIsPrimaryHit=false;
  if(result.dealt>0){const restored=engine.restoreResource(c.id,profile.resourceGain);if(restored.gained>0)showFloatingText("player","+"+restored.gained,"#58e38b");battle.attacksThisFight=(battle.attacksThisFight||0)+1;engine.logCombatEvent(c.id,"Базовая атака");}
  triggerVfx("attack","physical",false);if(c.run.playerHp<=0){endFromDamage();return;}if(target.hp<=0){finishCurrentEnemy();return;}save();render();
 }
 function useCounterSkill(){
  if(!battle||battle.actor?.type!=="player"||battle.playerSkillUsed||battle.counterPrimed||(battle.counterCooldownTurns||0)>0)return;
  const c=live(),counter=counterAbility(c),cost=c.classId==="duelist"?(balance.resources.class_costs?.duelist?.counter??18):(counter.resource_cost??balance.resources.action_costs.counter);
  if(c.resource<cost){notify("Не хватает ресурса для контр-умения");return;}
  c.resource-=cost;battle.counterPrimed=true;battle.playerSkillUsed=true;battle.counterCooldownTurns=Math.max(1,counter.cooldown_turns||2);battle.counterAction=counter;battle.counterTargetIndex=undefined;
  notify("Контр-умение готово: следующая атака противника будет отражена на 100%");save();render();
 }
 function processCombo(slot){
  const configs=(balance.combos?.combos||[]).filter(combo=>combo.class===live().classId),completed=[];battle.comboProgress=battle.comboProgress||{};
  for(const combo of configs){const progress=battle.comboProgress[combo.id]||0,expected=Number(String(combo.chain[progress]||"").replace("slot",""))-1;
   if(expected===slot){battle.comboProgress[combo.id]=progress+1;if(progress+1>=combo.chain.length){completed.push(combo);battle.comboProgress[combo.id]=0;}}
   else battle.comboProgress[combo.id]=slot===Number(String(combo.chain[0]).replace("slot",""))-1?1:0;
  }
  return completed.sort((a,b)=>(b.bonus.damage_mult||1)-(a.bonus.damage_mult||1))[0]||null;
 }
 function useUltimate(){
  if(!battle||battle.actor?.type!=="player"||battle.playerSkillUsed||(battle.ultimateCooldownTurns||0)>0)return;
  const c=live(),ultimate=ultimateAbility(c),cost=c.classId==="duelist"?(balance.resources.class_costs?.duelist?.ultimate??42):(ultimate.resource_cost??balance.resources.action_costs.ultimate);
  if(c.resource<cost){notify("Не хватает ресурса для ультимейта");return;}
  c.resource-=cost;battle.playerSkillUsed=true;battle.ultimateCooldownTurns=Math.max(1,ultimate.cooldown_turns||3);
  const stats=engine.getCombatStats(c),configuredMultiplier=Math.max(0,Number(ultimate.damage_multiplier)||2),damage=stats.dps*configuredMultiplier/3*(stats.damageMultiplier||1)+(c.classId==="destroyer"&&c.branch==="wand_shield"?stats.defense*(Number(balance.classes.branch_stat_bonuses?.["destroyer.wand_shield"]?.defense_damage_fraction)||.5)/3:0);battle.actionDamageLedger={};
  if(ultimate.effect==="heal_shield"||ultimate.effect==="heal_aoe")c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*ultimate.heal_fraction));
  if(ultimate.effect==="heal_shield")battle.nextDamageShield=Math.round(engine.maxHp(c)*ultimate.shield_fraction);
  if(ultimate.effect==="heal_aoe"||ultimate.effect==="aoe_burst"){for(const target of battle.enemies.filter(x=>x.alive)){for(let hit=0;hit<3&&target.hp>0&&c.run.playerHp>0;hit++){applyTargetDamage(target,damage,ultimate.damage_type,{ultimate:true});if(!battle)return;}if(c.run.playerHp<=0)break;}}
  else if(ultimate.effect==="single_burst"){const hitDamage=battle.enemy.type==="boss"?Math.min(damage,battle.enemy.maxHp*.8/3):damage;for(let hit=0;hit<3&&battle.enemy.hp>0&&c.run.playerHp>0;hit++){applyTargetDamage(battle.enemy,hitDamage,ultimate.damage_type,{ultimate:true});if(!battle)return;}}
  triggerVfx("ultimate",ultimate.damage_type,false);if(c.run.playerHp<=0){endFromDamage();return;}if(battle.enemy.hp<=0){finishCurrentEnemy();return;}save();render();
 }
 function enemyCounter(){resolveEnemyTelegraph();}
 function playerActionUnsafe(skillId,slotIndex){
  if(!battle||battle.actor?.type!=="player"||battle.playerSkillUsed)return;
  const c=live(),stats=engine.getCombatStats(c),skill=resolveSkill(c,skillId);
  if(!skill||!engine.skillAvailable(c,skill)){notify("Умение недоступно");return;}
  const cd=battle.skillCooldowns?.[skill.id]||0;if(cd>0){notify("Откат: "+cd+" хода");return;}
  const effect=balance.skill_effects[skill.effect_template]||balance.skill_effects.strike;const skillStats=getSkillStats(c,skill);let cost=skillStats.cost;if(battle.freeSkillCharges>0){cost=0;battle.freeSkillCharges--;}
  if(c.resource<cost){notify("Не хватает ресурса: "+classData(c).resource);return;}
  c.resource-=cost;battle.playerSkillUsed=true;battle.actionDamageLedger={};battle.skillCooldowns=battle.skillCooldowns||{};
  const mastered=(c.progression?.skillMastery?.[skill.id]||0)>=100?1:0,cooldownTurns=effect.cooldown_turns||effect.cooldown||4;
  battle.skillCooldowns[skill.id]=Math.max(1,(effect.cooldown||4)-mastered);
  if(effect.cooldown_turns)battle.skillCooldowns[skill.id]=Math.max(1,effect.cooldown_turns-mastered);
  let damage=stats.dps*(balance.combat.turn_based?.skill_dps_multiplier||2.5)*(stats.damageMultiplier||1)*(skill.damage_multiplier??skill.damage??effect.damage_multiplier??1)*skillStats.powerMultiplier+(c.classId==="destroyer"&&c.branch==="wand_shield"?stats.defense*(Number(balance.classes.branch_stat_bonuses?.["destroyer.wand_shield"]?.defense_damage_fraction)||.5):0),guaranteedCrit=false;
  const elementHint=String(skill.element||skill.branch_id||skill.name||"").toLowerCase();const damageType=skill.damage_type||(elementHint.includes("fire")||/огн|плам|жар/.test(elementHint)?"fire":elementHint.includes("water")||/вод/.test(elementHint)?"water":elementHint.includes("lightning")||/молни|гроз|электр/.test(elementHint)?"lightning":"physical");
  if(effect.type==="heal"&&effect.heal_multiplier){const beforeHeal=c.run.playerHp;c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*effect.heal_multiplier*skillStats.powerMultiplier*(stats.healingMultiplier||1)));if(c.run.playerHp>beforeHeal){pulseCombatActor("player","heal");showFloatingText("player","+"+(c.run.playerHp-beforeHeal),"#58e38b");}}
  if(effect.type==="hot"&&effect.heal_multiplier)battle.hot={heal:Math.round(engine.maxHp(c)*effect.heal_multiplier*skillStats.powerMultiplier*(stats.healingMultiplier||1)),ticks:effect.ticks||3};
  if(effect.type==="shield"&&effect.shield_fraction){battle.nextDamageShield=Math.round(engine.maxHp(c)*effect.shield_fraction);pulseCombatActor("player","armor");showFloatingText("player","ЩИТ +"+battle.nextDamageShield,"#78c9ff");}
  if(effect.type==="dot"&&effect.damage_multiplier){const dotAmplifier=c.classId==="assassin"&&c.branch==="poison"?(Number(balance.classes.branch_stat_bonuses?.["assassin.poison"]?.dot_damage_multiplier)||1.15):1;const dotDamage=Math.max(1,Math.round(damage*dotAmplifier));battle.dots=Array.isArray(battle.dots)?battle.dots:(battle.dot?[battle.dot]:[]);if(battle.dots.length<20)battle.dots.push({damage:dotDamage,ticks:effect.ticks||3,targetIndex:Number(battle.enemy?.index??battle.targetIndex)});else battle.dots[battle.dots.length-1]={damage:dotDamage,ticks:effect.ticks||3,targetIndex:Number(battle.enemy?.index??battle.targetIndex)};battle.dot=battle.dots[0]||null;if(battle.enemy?.role==="tank"){battle.enemy.pendingCleanseDebuff=true;battle.enemy.debuffKind="dot";}}
  if(effect.type==="buff"){battle.playerDamageBuff=effect.power_multiplier||0;battle.playerDamageBuffTurns=Math.max(1,effect.duration_turns||effect.duration||3);battle.buffsUsed=(battle.buffsUsed||0)+1;}
  if(effect.type==="debuff"){battle.enemyDamageReduction=effect.power_multiplier||0;battle.enemyDamageReductionTurns=Math.max(1,effect.duration_turns||effect.duration||3);if(c.classId==="shaman"&&c.branch==="dark_gods"){const curseDamage=Math.max(1,Math.round(stats.dps*(effect.damage_multiplier||skill.damage_multiplier||.45)*.45*(Number(balance.classes.branch_stat_bonuses?.["shaman.dark_gods"]?.dot_damage_multiplier)||1.15)));battle.dots=Array.isArray(battle.dots)?battle.dots:(battle.dot?[battle.dot]:[]);if(battle.dots.length<20)battle.dots.push({damage:curseDamage,ticks:effect.duration||3,targetIndex:Number(battle.enemy?.index??battle.targetIndex)});else battle.dots[battle.dots.length-1]={damage:curseDamage,ticks:effect.duration||3,targetIndex:Number(battle.enemy?.index??battle.targetIndex)};battle.dot=battle.dots[0]||null;}}
  if(effect.type==="control"&&battle.enemy?.alive&&Number(battle.enemy.hp)>0)battle.enemy.stunned=true;
  if(effect.type==="parry")battle.parryChance=effect.parry_chance||0;
  const combo=processCombo(slotIndex);if(combo){damage*=combo.bonus.damage_mult||1;guaranteedCrit=!!combo.bonus.guaranteed_crit;}
  if(c.classId==="assassin"&&battle.assassinNextHit){damage*=balance.procs.assassin.value;battle.assassinNextHit=false;battle.proc=null;}
  if(c.classId==="elemental"&&battle.elementalNextBonus){damage*=balance.procs.elemental.value;battle.elementalNextBonus=false;battle.proc=null;}
  if(battle.playerDamageBuff&&(battle.playerDamageBuffTurns||0)>0)damage*=1+battle.playerDamageBuff;
  const runModifier=(balance.run_modifiers?.modifiers||[]).find(x=>x.id===c.run.runModifierId)||{};
  if(runModifier.player_damage_multiplier)damage*=runModifier.player_damage_multiplier;
  if(runModifier.low_hp_threshold&&c.run.playerHp/engine.maxHp(c)<=runModifier.low_hp_threshold)damage*=runModifier.low_hp_damage_multiplier||1;
  const critical=guaranteedCrit||gameRandom()<stats.critChance;if(critical)damage*=stats.critMultiplier;
  const target=battle.enemy,hadBossCast=!!(battle.telegraph&&battle.enemy?.type==="boss");
  let result={killed:false,dealt:0};
  battle.actionIsSkill=true;battle.actionIsPrimaryHit=true;
  const skillHitOptions={critical};
  if(effect.type==="aoe"){for(const enemy of battle.enemies.filter(x=>x.alive)){if(c.run.playerHp<=0)break;const hit=applyTargetDamage(enemy,damage,damageType,skillHitOptions);if(enemy===target)result=hit;}}
  else if(!["heal","hot","buff","shield","debuff"].includes(effect.type))result=applyTargetDamage(target,damage,damageType,skillHitOptions);
  battle.actionIsPrimaryHit=false;battle.actionIsSkill=false;
  if(skill&&hadBossCast&&target.hp>0){const interrupt=Math.max(1,Math.round(target.maxHp*.1));const interrupted=applyTargetDamage(target,interrupt,"physical");battle.telegraph=null;notify("ПРЕРВАНО · −"+interrupted.dealt+" HP");}
  if(skill&&target.hp>0){
   const current=String(damageType).toLowerCase(),previous=battle.lastElement;
   if((previous==="fire"&&current==="water")||(previous==="water"&&current==="fire")){target.stunned=true;showFloatingText(target,"ПАР · ОГЛУШЕНИЕ","#73cfff");notify("ПАР · ОГЛУШЕНИЕ");}
   else if((previous==="lightning"&&current==="water")||(previous==="water"&&current==="lightning")){const shock=applyTargetDamage(target,Math.round(result.dealt),"lightning");showFloatingText(target,"ЭЛЕКТРОШОК -"+shock.dealt,"#ffe45c");notify("ЭЛЕКТРОШОК");}
   battle.lastElement=current;
  }
  if(c.run.playerHp>0&&target.hp>0&&result.dealt>0){const companion=Math.max(1,Math.round(stats.attack*.5));const pet=applyTargetDamage(target,companion,"physical");if(pet.dealt)showFloatingText(target,"СПУТНИК -"+pet.dealt,"#a8d8ff");}
  battle.attacksThisFight=(battle.attacksThisFight||0)+1;
  if(c.classId==="assassin"&&critical){battle.assassinNextHit=true;battle.proc={...balance.procs.assassin};}
  if(c.classId==="duelist"&&battle.attacksThisFight>=balance.procs.duelist.attacks_required&&!battle.freeSkillCharges){battle.freeSkillCharges=1;battle.proc={...balance.procs.duelist};}
  if(c.classId==="dragonkin"&&battle.attacksThisFight>=balance.procs.dragonkin.attacks_required&&!battle.dragonkinProc){battle.nextDamageShield=Math.round(engine.maxHp(c)*balance.procs.dragonkin.value);battle.dragonkinProc=true;battle.proc={...balance.procs.dragonkin};}
  if(c.classId==="shaman"&&battle.buffsUsed>=balance.procs.shaman.buffs_required){battle.poisonStacks=0;battle.buffsUsed=0;battle.proc={...balance.procs.shaman};}
  if(target.mechanic==="reflect"&&result.dealt>0&&c.classId==="destroyer")c.rage=Math.min(10,(Number(c.rage)||0)+1);
  if(skill.branch_id){engine.recordDailyProgress(c.id,"branch_skills_used",1);engine.recordWeeklyProgress(c.id,"branch_skills_used",1);}
  c.progression=c.progression||{};c.progression.skillMastery=c.progression.skillMastery||{};const mastery=(c.progression.skillMastery[skill.id]||0)+1;c.progression.skillMastery[skill.id]=mastery;if(mastery===100)notify("Мастерство освоено: "+skill.name+" · откат −1 ход");
  engine.logCombatEvent(c.id,"Использовано умение: "+skill.name);triggerVfx("skill",damageType,critical);
  if(c.run.playerHp<=0){endFromDamage();return;}
  if(target.hp<=0){finishCurrentEnemy();return;}
 }
 function playerAction(skillId,slotIndex){
  if(!battle||battle.actor?.type!=="player"||battle.playerSkillUsed)return;
  let stateBefore=null,battleBefore=null;
  try{
   stateBefore=JSON.parse(JSON.stringify(engine.state));battleBefore=JSON.parse(JSON.stringify(battle));
   playerActionUnsafe(skillId,slotIndex);
  }catch(error){
   if(stateBefore&&battleBefore){for(const key of Object.keys(engine.state))delete engine.state[key];Object.assign(engine.state,stateBefore);battle=battleBefore;}
   recoverBattleControl(error,"Не удалось применить умение · управление восстановлено",false);return;
  }
  if(battle){save();try{render();}catch(error){console.error("Skill applied but battle render failed",error);notify("Умение применено, но интерфейс не обновился · "+String(error?.message||error).slice(0,120));}}
 }
 function equipItem(itemId){
  try{engine.equipItem(live().id,itemId);syncEquipmentCards(live());save();render();notify("Предмет надет · карта экипировки добавлена");}catch(error){notify(error.message);}
 }
 function showScreen(name){screen=name;render();}
 function battleRenderKey(){
  if(!battle)return "";
  const c=live();return [battle.stage,battle.round,battle.actor?.type||"",battle.potionUsedThisTurn?1:0,Math.round(c.run.playerHp),Math.round(c.currentEnergy),c.combo||0,c.rage||0,c.charges||0,c.faith||0,c.element||"fire",c.magicCharge||0,c.totem||0,c.hand.map(card=>card.instanceId||card.id).join(","),c.deck.length,c.discard.length,battle.cardBlock||0,battle.targetIndex,battle.bossPhase||0,battle.telegraph?.targetIndex??"",battle.telegraph?.label||"",(battle.enemies||[]).map(x=>x.index+":"+x.role+":"+(x.alive?1:0)+":"+Math.round(x.hp)).join(",")].join("|");
 }
 function updateBattleDOM(){
  if(!battle)return;
  const c=live(),arena=root.querySelector(".new-battle-wrap");if(!arena)return;ensureArenaBackground(arena,battle.stage);
  const hp=engine.maxHp(c),playerHp=Math.max(0,Math.min(100,(Number(c.run.playerHp)||0)/Math.max(1,hp)*100));
  const heroBar=arena.querySelector(".new-hero-side .new-hp-bar>div");if(heroBar)heroBar.style.width=playerHp+"%";
  const heroHpText=arena.querySelector(".new-hero-hp-text");if(heroHpText)heroHpText.textContent=Math.ceil(c.run.playerHp)+" / "+hp+" HP";
  const heroResource=arena.querySelector(".new-hero-resource-text");if(heroResource){heroResource.textContent=classData(c).resource+" · "+Math.round(c.resource)+" / "+Math.round(c.resourceMax);heroResource.style.setProperty("--resource-pct",Math.max(0,Math.min(100,(Number(c.resource)||0)/Math.max(1,Number(c.resourceMax)||1)*100))+"%");}updateClassResourceDOM();
  const heroName=arena.querySelector(".new-hero-name");if(heroName)heroName.textContent=c.name;
  arena.querySelectorAll(".new-enemy-item[data-target]").forEach(card=>{
   const index=Number(card.dataset.target),target=(battle.enemies||[]).find(enemy=>enemy.index===index);
   if(!target)return;
   const alive=!!target.alive&&Number(target.hp)>0,bar=card.querySelector(".new-enemy-hp-bar>div"),hpText=card.querySelector(".new-enemy-hp-text"),intent=card.querySelector(".new-enemy-intent");
   if(bar)bar.style.width=Math.max(0,Math.min(100,Number(target.hp)/Math.max(1,Number(target.maxHp)||1)*100))+"%";
   if(hpText)hpText.textContent=Math.max(0,Math.ceil(target.hp))+" HP";
   if(intent)intent.textContent=target.telegraph?.label||target.intent?.label||enemyIntentText(target);
   let statusNode=card.querySelector(".new-enemy-statuses");if(statusNode)statusNode.textContent=[["poison","☠️"],["bleed","🩸"],["burn","🔥"],["weak","💨"],["vulnerable","🎯"]].filter(([key])=>Number(target[key])>0).map(([key,icon])=>icon+" "+target[key]).join(" · ");
   card.classList.toggle("selected",index===battle.targetIndex);card.classList.toggle("defeated",!alive);
   card.setAttribute("aria-pressed",index===battle.targetIndex?"true":"false");
  });
  const playerTurn=battle.actor?.type==="player";
  const energy=arena.querySelector("#energyDisplay");if(energy)energy.textContent="ЭНЕРГИЯ: "+c.currentEnergy+"/"+c.energy;
  const deckCount=arena.querySelector("#deckCount");if(deckCount)deckCount.textContent=String(c.deck.length);
  const discardCount=arena.querySelector("#discardCount");if(discardCount)discardCount.textContent=String(c.discard.length);
  const deckViewerCount=arena.querySelector("#deckViewerCount");if(deckViewerCount)deckViewerCount.textContent=String(collectDeckCards(c).length);
  const hand=arena.querySelector(".new-hand-row");if(hand){const scroll=hand.scrollLeft;hand.innerHTML=renderHand();hand.scrollLeft=scroll;}
  const endTurn=arena.querySelector("#endturn");
  if(endTurn){
   endTurn.hidden=false;endTurn.style.display="flex";endTurn.style.visibility="visible";endTurn.style.opacity="1";
   endTurn.disabled=!playerTurn||battle.paused;
   endTurn.textContent=playerTurn?"ЗАВЕРШИТЬ ХОД":"ХОД ПРОТИВНИКА...";
   endTurn.classList.toggle("is-player-turn",playerTurn);
  }
  const guidance=arena.querySelector(".new-turn-guidance");
  if(guidance)guidance.textContent=(battle.trialObjective?"ЦЕЛЬ: "+battle.trialObjective.description+" · ":"")+(playerTurn?"Твой ход. Разыграй карты за "+c.currentEnergy+" энергии или заверши ход.":"Противники атакуют...");
  const pause=arena.querySelector(".new-pause-btn");if(pause)pause.textContent=battle.paused?"ПРОДОЛЖИТЬ":"ПАУЗА";
  const round=arena.querySelector(".new-battle-top .new-round-label");if(round)round.textContent=(battle.trialObjective?"ИСПЫТАНИЕ · "+battle.trialObjective.label+" · ":"")+"ИНИЦИАТИВА · РАУНД "+battle.round;
  arena.classList.toggle("tb-shaking",!!(battle.shakeUntil>Date.now()));
  arena.classList.toggle("tb-phase-flash",!!(battle.phaseFlashUntil>Date.now()));
  ["attack","skill","ultimate","telegraph"].forEach(kind=>arena.classList.toggle("tb-fx-"+kind,!!(battle.fx&&battle.fx.kind===kind&&battle.fx.until>Date.now())));
 }
 function ensureBottomNav(){
  const host=root.querySelector(".tb-v2");if(!host)return;
  let nav=host.querySelector(".tb-bottom-nav");
  if(screen==="battle"||host.querySelector(".tb-turn-tutorial")){nav?.remove();return;}
  if(!live()||["characters","death"].includes(screen)){nav?.remove();return;}
  if(!nav){nav=document.createElement("nav");nav.className="tb-bottom-nav";nav.setAttribute("aria-label","Основная навигация");host.appendChild(nav);}
  nav.innerHTML='<button type="button" data-action="bottom-map" data-nav-tab="map"><span>⚔</span><small>БОЙ / КАРТА</small></button><button type="button" data-action="bottom-profile" data-nav-tab="profile"><span>♙</span><small>ПЕРСОНАЖ</small></button><button type="button" data-action="bottom-progress" data-nav-tab="progress"><span>✦</span><small>ПРОГРЕСС</small></button><button type="button" data-action="bottom-community" data-nav-tab="community"><span>♧</span><small>СООБЩЕСТВО</small></button><button type="button" data-action="bottom-shop" data-nav-tab="shop"><span>◇</span><small>МАГАЗИН</small></button><button type="button" data-action="bottom-account" data-nav-tab="account"><span>☷</span><small>АККАУНТ</small></button>';
  const c=live(),cls=classData(c)||{},baseSkills=Array.isArray(cls.base_skills)?cls.base_skills:[],skillList=Array.isArray(skills)?skills:[],skillPool=[...baseSkills,...skillList.filter(skill=>skill.class_id===c.classId&&skill.branch_id===c.branch)],chosenSkills=new Set(Array.isArray(c.activeSkills)?c.activeSkills:(Array.isArray(c.skillLoadout)?c.skillLoadout:[])),skillBadge=skillPool.filter((skill,index,pool)=>pool.findIndex(other=>other.id===skill.id)===index&&skill.type!=="passive"&&Number(c.level)>=(Number(skill.unlock_level)||1)&&!chosenSkills.has(skill.id)).length;
  const bag=Array.isArray(c.bag)?c.bag:[],gear=Array.isArray(c.gear)?c.gear:[],statSum=item=>Object.values(item?.stats||{}).reduce((n,v)=>n+(Number(v)||0),0);
  const slotIndex={weapon:0,chest:1,head:2,legs:3,hands:4,accessory:5};
  const upgrade=bag.some(item=>{const index=slotIndex[item?.slot];return Number.isInteger(index)&&statSum(item)>statSum(gear[index]);});
  const craftMaterials=bag.filter(item=>item?.type==="craft_material").reduce((n,item)=>n+(Number(item.quantity)||1),0);
  const craftStones=bag.filter(item=>item?.type==="enhancement_stone"),craftLevels={};
  craftStones.forEach(item=>{const typeId=item.stoneType?.id||item.stoneType||"unknown",key=String(item.level||1)+":"+typeId;craftLevels[key]=(craftLevels[key]||0)+(Number(item.quantity)||1);});
  const mergeReady=Object.values(craftLevels).some(n=>n>=5),craft=mergeReady||craftMaterials>=20;
  const claimed=new Set(Array.isArray(c.achievements)?c.achievements:[]),progress=c.progress&&typeof c.progress==="object"?c.progress:{},stats=c.stats&&typeof c.stats==="object"?c.stats:{};
  let accountLevel=0;try{accountLevel=typeof engine.accountLevel==="function"?Number(engine.accountLevel())||0:0;}catch(error){console.warn("[Towerbound] account level badge unavailable",error);}
  const derived={highest_stage:Number(progress.highestEver)||0,lore_read:Array.isArray(c.loreRead)?c.loreRead.length:0,paragon_level:Number(c.paragon?.level)||0,account_level:accountLevel,season_clear:Number(stats.season_clear)||0};
  const achievementList=Array.isArray(balance.achievements?.achievements)?balance.achievements.achievements:[];
  const achievement=achievementList.some(a=>a&&!claimed.has(a.id)&&(derived[a.metric]??stats[a.metric]??progress[a.metric]??0)>=Number(a.target||0));
  let chest=false;try{const snapshot=typeof engine.dailyChestSnapshot==="function"?engine.dailyChestSnapshot(c.id):null;chest=!!snapshot?.available;}catch(error){console.warn("[Towerbound] daily chest badge unavailable",error);}
  const addBadge=(button,value)=>{if(!button||!value)return;const badge=document.createElement("i");badge.className="badge";badge.textContent=String(value===true?"!":value);button.appendChild(badge);};
  addBadge(nav.querySelector('[data-nav-tab="profile"]'),skillBadge+(upgrade?1:0));
  addBadge(nav.querySelector('[data-nav-tab="progress"]'),achievement);
  addBadge(nav.querySelector('[data-nav-tab="shop"]'),chest?1:0);
  const skillsTab=root.querySelector('[data-tab="skills"]');if(skillsTab)skillsTab.removeAttribute("data-skill-badge");
  const bagTab=root.querySelector('[data-tab="bag"]');addBadge(bagTab,upgrade?1:0);
  const craftTab=root.querySelector('[data-tab="craft"]');addBadge(craftTab,craft?1:0);
  root.querySelectorAll('[data-craft-stone]').forEach(button=>addBadge(button,craftMaterials>=20?1:0));
  root.querySelectorAll('[data-merge]').forEach(button=>{const item=craftStones.find(stone=>stone.id===button.dataset.merge),typeId=item?.stoneType?.id||item?.stoneType||"unknown",key=String(item?.level||1)+":"+typeId;addBadge(button,(craftLevels[key]||0)>=5?1:0);});
  const active=screen==="map"?"map":screen==="profile"?"profile":screen==="progress"?"progress":screen==="shop"?"shop":"account";
  nav.querySelectorAll("[data-nav-tab]").forEach(button=>{const on=button.dataset.navTab===active;button.classList.toggle("active",on);button.setAttribute("aria-current",on?"page":"false");});
 }
 function lootSummaryModal(){
  if(!postBattleSummary)return "";
  const rows=(postBattleSummary.loot||[]).map(item=>{
   const disposition=item.disposition||(item.autoSalvaged?"salvaged":"bag");
   const status=disposition==="equipped"?'<strong class="tb-loot-equipped">↑ НАДЕТО</strong>':disposition==="salvaged"?'<strong class="tb-loot-salvaged">РАЗОБРАНО</strong>':'<strong class="tb-loot-bag">В РЮКЗАК</strong>';
   const art=inventoryIconHtml(item,item.type==="equipment");
   return '<article class="tb-loot-row rarity-'+rarityClass(item.rarity)+'"><span class="tb-loot-art">'+art+'</span><span class="tb-loot-copy"><b>'+esc(itemDisplayName(item))+'</b><small>'+esc(item.rarity||itemTypeName(item.type))+(item.branchName?' · '+esc(item.branchName):'')+'</small></span>'+status+'</article>';
  }).join("");
  const trialChoices=postBattleSummary.trialRewards||postBattleSummary.championRewards||[];const trialMarkup=trialChoices.length?'<h3>'+(postBattleSummary.championCleared?'♛ НАГРАДА ЧЕМПИОНА · ВЫБЕРИ ОДНУ':'⚔ НАГРАДА ЗА ИСПЫТАНИЕ · ВЫБЕРИ ОДНУ')+'</h3><div class="tb-trial-reward-choices">'+trialChoices.map(choice=>'<button type="button" class="tb-event-choice" data-trial-reward="'+esc(choice.id)+'"><b>'+esc(choice.name)+'</b><small>'+esc(choice.description)+'</small></button>').join('')+'</div>':postBattleSummary.trialFailed?'<div class="tb-event-choice" role="status"><b>УСЛОВИЕ НЕ ВЫПОЛНЕНО</b><small>Обычная добыча сохранена, дополнительная награда не получена.</small></div>':postBattleSummary.trialPassed?'<p class="tb-loot-empty">Испытание выполнено · награда уже выбрана.</p>':'';const waitingForTrialReward=trialChoices.length>0;
  return '<div class="tb-loot-overlay" role="presentation"><section class="tb-loot-modal" role="dialog" aria-modal="true" aria-label="Добыча"><div class="tb-loot-eyebrow">TOWERBOUND · НАГРАДА</div><h2>БОЙ ЗАВЕРШЕН</h2><div class="tb-loot-rewards"><span>✦ '+Number(postBattleSummary.xp||0)+' опыта</span><span>◈ '+Number(postBattleSummary.silver||0)+' серебра</span></div>'+trialMarkup+(rows?'<h3>ДОБЫЧА</h3><div class="tb-loot-list">'+rows+'</div>':'<p class="tb-loot-empty">Предметы не выпали. Можно продолжить с карты.</p>')+'<button type="button" data-card-reward-start class="tb-card-reward-start" '+(waitingForTrialReward?'disabled':'')+'>ЗАБРАТЬ НАГРАДУ</button><button type="button" data-loot-continue class="tb-loot-continue" '+(waitingForTrialReward?'disabled':'')+'>ЗАВЕРШИТЬ</button></section></div>';
 }

 function renderCollection(c){
  const subnav='<div class="tb-collection-subtabs"><button type="button" data-collection-tab="collection" class="'+(collectionTab==="collection"?"active":"")+'">ЭКИПИРОВКА</button><button type="button" data-collection-tab="bestiary" class="'+(collectionTab==="bestiary"?"active":"")+'">БЕСТИАРИЙ</button><button type="button" data-collection-tab="cards" class="'+(collectionTab==="cards"?"active":"")+'">КОЛЛЕКЦИЯ КАРТ</button></div>';
  if(collectionTab==="cards"){
   const unlocked=new Set(unlockedCardIds()),cards=Object.values(CARD_DATABASE),typeNames={attack:"АТАКА",defense:"ЗАЩИТА",skill:"НАВЫК",power:"СИЛА",curse:"ПРОКЛЯТИЕ"};
   const cardTiles=cards.map(card=>{const known=unlocked.has(card.id),cost=card.costX?"X":Number(card.cost)||0,image=card.image||CARD_ART_ROOT+(ART_MAPPING[card.id]||"strike.png");return '<article class="tb-codex-collection-card '+(known?"is-unlocked":"is-locked")+'"><div class="tb-codex-collection-art"><img src="'+esc(image)+'" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'./assets/cards/strike.png\'"></div><div class="tb-card-badges"><span class="tb-card-pill">'+esc(typeNames[card.type]||"КАРТА")+'</span><span class="tb-card-pill">'+esc(String(card.rarity||"common").toUpperCase())+'</span><span class="tb-card-pill cost">'+cost+'</span></div><h4>'+esc(known?card.name:"Не открыта")+'</h4><small class="tb-card-subline">'+esc(card.classId==="common"?"ОБЩАЯ":String(card.classId||"").toUpperCase())+'</small><p>'+esc(known?(card.description||"Описание отсутствует"):"Открой эту карту, выбрав её в награде после боя.")+'</p><small class="tb-card-unlocked-mark">'+(known?"✓ В КОЛЛЕКЦИИ":"НЕ ОТКРЫТА")+'</small></article>';}).join("");
   return subnav+'<section class="tb-codex-collection-page"><header class="tb-codex-collection-hero"><div><small class="tb-codex-collection-kicker">АРХИВ ПРИКЛЮЧЕНИЙ · '+cards.length+' КАРТ</small><h2>КОЛЛЕКЦИЯ КАРТ</h2><p>Собранные карты остаются с тобой навсегда и доступны для настройки стартовой колоды.</p></div><strong class="tb-codex-collection-total">'+unlocked.size+'<small>ИЗ '+cards.length+'</small></strong></header><div class="tb-codex-collection-grid">'+cardTiles+'</div></section>';
  }
  if(collectionTab==="bestiary"){
   const kills=c.stats?.killsByMob||{},mobRows=Object.keys(mobPortraits||{}).map(id=>({id,type:"normal"})).concat(Object.keys(bossPortraitsById||{}).map(id=>({id,type:"boss"})));
   const cards=mobRows.map(entry=>{const count=Number(kills[entry.id]||0),known=count>0,name=(balance.mobs?.catalog||[]).find(item=>String(item.id||item.key||"").toLowerCase()===entry.id)?.name||entry.id.replace(/-/g," ").replace(/\b\w/g,ch=>ch.toUpperCase());return '<article class="tb-bestiary-card '+(known?"is-known":"is-unknown")+'"><div class="tb-bestiary-art"><img src="'+esc(enemyPortrait({mobId:entry.id,type:entry.type}))+'" alt="" '+(known?'':'style="filter:brightness(0) grayscale(1);opacity:.32"')+'></div><b>'+esc(known?name:"Неизвестный противник")+'</b><small>'+esc(entry.type==="boss"?"БОСС":"ОБЫЧНЫЙ ВРАГ")+'</small><small>'+(known?"Побед: "+count:"Не побеждён")+'</small></article>';}).join("");
   return subnav+'<header class="tb-collection-header"><div><h2>БЕСТИАРИЙ</h2><p>Кодекс существ Башни · силуэты скрывают неизвестных врагов</p></div><strong>'+mobRows.filter(entry=>Number(kills[entry.id]||0)>0).length+' / '+mobRows.length+'</strong></header><div class="tb-bestiary-grid">'+(cards||'<p class="tb-lock">Записи пока не открыты.</p>')+'</div>';
  }
  const allClasses=balance.classes?.classes||{},currentClassId=c.classId||c.cls,classes=currentClassId&&allClasses[currentClassId]?{[currentClassId]:allClasses[currentClassId]}:{},rarities=["Обычная","Редкая","Эпическая","Легендарная","Богоподобная"],slots=["weapon","chest","head","legs","hands","accessory"],slotNames={weapon:"Оружие",chest:"Нагрудник",head:"Шлем",legs:"Поножи",hands:"Перчатки",accessory:"Аксессуар"},rarityScale={"Обычная":1,"Редкая":1.35,"Эпическая":1.8,"Легендарная":2.4,"Богоподобная":3.2},rarityPrefix={"Обычная":"Обычный","Редкая":"Редкий","Эпическая":"Эпический","Легендарная":"Легендарный","Богоподобная":"Богоподобный"};
  const owned=[...(c.bag||[]),...(c.gear||[]).filter(Boolean)].filter(item=>item&&item.type==="equipment"),catalog=[];
  Object.entries(classes).forEach(([classId,classInfo])=>(classInfo.branches||[]).forEach(branch=>{
   slots.forEach(slot=>rarities.forEach(rarity=>{
    const scale=2.65*rarityScale[rarity];let stats;
    if(slot==="weapon")stats={attack:Math.max(1,Math.round(scale*1.8)),crit:rarityScale[rarity]>=1.8?0.01:0};
    else if(slot==="chest")stats={defense:Math.max(1,Math.round(scale*1.1)),health:Math.max(5,Math.round(scale*6))};
    else if(slot==="head")stats={defense:Math.max(1,Math.round(scale*.8)),health:Math.max(3,Math.round(scale*2.5))};
    else if(slot==="legs")stats={defense:Math.max(1,Math.round(scale*.65)),health:Math.max(4,Math.round(scale*3.2))};
    else if(slot==="hands")stats={attack:Math.max(1,Math.round(scale*.55)),defense:Math.max(1,Math.round(scale*.3)),crit:rarityScale[rarity]>=1.8?0.008:0};
    else stats={attack:Math.max(1,Math.round(scale*.8)),health:Math.max(2,Math.round(scale*1.5)),crit:Math.min(.08,.005*rarityScale[rarity]),spellPower:Math.max(0,Math.round(scale*.45))};
    const branchName=branch.set?.name||branch.theme||branch.name||branch.id,itemName=rarityPrefix[rarity]+" · "+branchName+" · "+slotNames[slot],match=owned.find(item=>{const itemBranch=typeof item.branch==="object"?item.branch?.id:(item.branch||item.branchId||item.branch_id||(typeof c.branch==="object"?c.branch?.id:c.branch));return String(itemBranch||"")===String(branch.id)&&item.slot===slot&&item.rarity===rarity;});
    catalog.push({key:[classId,branch.id,slot,rarity].join("::"),classId,className:classInfo.name||classId,branchId:branch.id,branchName,slot,rarity,stats,itemName:itemName||"Неизвестный предмет",description:match?.description||"Предмет этой специализации ещё не найден.",owned:!!match,item:match||null});
   }));
  }));
  const statNames={attack:"АТК",defense:"ЗАЩ",health:"HP",crit:"КРИТ",spellPower:"МАГИЯ",fireDamage:"ОГОНЬ",iceDamage:"ЛЁД",darkDamage:"ТЬМА"};
  const percentStats=new Set(["crit","critDamage","evasion","dodge","attackSpeed","critChance","criticalChance","critical_chance","crit_chance","evasionChance","evasion_chance","dodgeChance","fireDamage","iceDamage","darkDamage"]);
  const formatCollectionStat=(key,value)=>percentStats.has(key)?((Number(value)>0?"+":"")+(Number(value)*100).toFixed(1).replace(/\.0$/,"")+"%"):((Number(value)>0?"+":"")+Number(value).toFixed(0));
  const statMarkup=item=>Object.entries(effectiveEquipmentStats(item)).filter(([,v])=>Number(v)!==0).map(([key,value])=>'<span>'+esc(statNames[key]||key)+' '+formatCollectionStat(key,value)+'</span>').join("");
  const grouped=Object.entries(classes).map(([classId,classInfo])=>'<section class="tb-collection-class"><h3>'+esc(classInfo.name||classId)+'</h3>'+
   (classInfo.branches||[]).map(branch=>{
    const entries=catalog.filter(item=>item.classId===classId&&item.branchId===branch.id);
    return '<section class="tb-collection-branch"><h4>'+esc(branch.set?.name||branch.name||branch.id)+' <small>'+entries.filter(item=>item.owned).length+'/30</small></h4>'+
     rarities.map(rarity=>{
      const cards=entries.filter(item=>item.rarity===rarity).map(item=>'<button type="button" class="tb-collection-item rarity-'+rarityClass(item.rarity)+(item.owned?" is-owned":" is-locked")+'" data-collection-item="'+esc(item.key)+'"><span class="tb-collection-art">'+(item.owned?relicIconHtml(item.item,item.slot):relicIconHtml({rarity:item.rarity,slot:item.slot,name:item.itemName},item.slot))+'</span><b>'+esc(item.item?.name||item.itemName||"Неизвестный предмет")+'</b><small>'+esc(item.description||"Неизвестный предмет")+'</small></button>').join("");
      return '<section class="tb-collection-rarity"><h5>'+esc(rarity)+' <small>'+entries.filter(item=>item.rarity===rarity&&item.owned).length+'/6</small></h5><div class="tb-collection-grid">'+cards+'</div></section>';
     }).join("")+'</section>';
   }).join("")+'</section>').join("");
  const currentClassRelics=Object.values(engine.RELICS_DATABASE||{}).filter(relic=>relic.classId===currentClassId);
  const ownedClassRelicIds=new Set(c.relics||[]);
  const ownedClassRelics=currentClassRelics.filter(relic=>ownedClassRelicIds.has(relic.id));
  const classOrderNames={assassin:"Безмолвной Охоты",bishop:"Первого Света",dragonkin:"Древнего Дракона",destroyer:"Прародителя",elemental:"Семи Истоков",duelist:"Последнего Выпада",shaman:"Корней Мира"};
  const setPiecesMarkup='<section class="tb-ancient-set"><header><div><small>ДРЕВНИЙ КОМПЛЕКТ</small><h3>Орден '+esc(classOrderNames[currentClassId]||"Башни")+'</h3><p>Собирай древние и классовые реликвии. Бонусы работают автоматически в каждом бою.</p></div><strong>'+ownedClassRelics.length+' / 4</strong></header><div class="tb-ancient-set-progress"><i style="width:'+Math.min(100,ownedClassRelics.length/4*100)+'%"></i></div><div class="tb-ancient-set-bonuses"><div class="'+(ownedClassRelics.length>=2?"is-active":"")+'"><b>2 реликвии</b><span>+1 карта в начале боя</span></div><div class="'+(ownedClassRelics.length>=3?"is-active":"")+'"><b>3 реликвии</b><span>+6 начальной брони</span></div><div class="'+(ownedClassRelics.length>=4?"is-active":"")+'"><b>4 реликвии · Пробуждение</b><span>'+({assassin:"Первая атака наносит ×2 урона",bishop:"+8 здоровья в начале боя",dragonkin:"+8 дополнительной брони в начале боя",destroyer:"+2 урона атакующим картам",elemental:"+2 силы магических карт",duelist:"+2 брони от защитных карт",shaman:"Накладывает +1 слабость всем врагам"}[currentClassId]||"Сила полного комплекта")+'</span></div></div><div class="tb-ancient-set-items">'+currentClassRelics.map(relic=>'<span class="'+(ownedClassRelicIds.has(relic.id)?"is-owned":"")+'">'+esc(relic.icon||"✦")+' '+esc(relic.name)+(ownedClassRelicIds.has(relic.id)?" · ЕСТЬ":" · НЕ НАЙДЕНА")+'</span>').join("")+'</div></section>';
  const current=catalog.find(item=>item.key===collectionSelection);
  const currentItem=current?.item||null;
  const currentEquipped=!!(current?.owned&&currentItem&&(c.gear||[]).some(item=>item?.id===currentItem.id));
  const currentGems=currentItem?installedGemsOf(currentItem):[];
  const activeBranch=typeof c.branch==="object"?c.branch?.id:c.branch;
  const currentIsWeapon=current?.slot==="weapon";
  const collectionStones=(c.bag||[]).filter(stone=>stone&&stone.type==="enhancement_stone"),hasMatchingStone=collectionStones.length>0;
  const currentHasRefineStone=(c.bag||[]).some(item=>item.type==="refine_stone");
  const currentHasChisel=(c.bag||[]).some(item=>item.type==="chisel");
  const currentSockets=Math.max(0,Number(currentItem?.socketsAvailable)||0);
  const maxSockets=Number(balance.equipment?.max_sockets)||0;
  const maxRefine=Number(balance.equipment?.refine_max)||20;
  const detailActions=!current?.owned?'<p class="tb-collection-missing">Предмет не найден. Выпадает с боссов/элиток.</p>':!currentEquipped?'<button type="button" class="tb-collection-equip" data-equip="'+esc(currentItem.id)+'">НАДЕТЬ</button>':[
   '<strong class="tb-collection-equipped">УЖЕ НАДЕТО</strong>',
   '<button type="button" class="tb-collection-action" data-unequip="'+esc(currentItem.slot)+'">СНЯТЬ ЭКИПИРОВКУ</button>',
   '<p class="tb-collection-item-progress">Заточка +'+Number(currentItem.refine||0)+' · Гнёзда '+currentGems.length+'/'+currentSockets+'</p>',
   currentHasRefineStone&&Number(currentItem.refine||0)<maxRefine?'<button type="button" class="tb-collection-action" data-refine="'+esc(currentItem.id)+'">ЗАТОЧИТЬ</button>':"",
   currentHasChisel&&currentSockets<maxSockets?'<button type="button" class="tb-collection-action" data-socket="'+esc(currentItem.id)+'">ДОБАВИТЬ ГНЕЗДО</button>':"",
   hasMatchingStone&&currentGems.length<currentSockets?'<button type="button" class="tb-collection-action" data-stone="'+esc(currentItem.id)+'">ВСТАВИТЬ КАМЕНЬ</button>':"",
   stonePickerItemId===currentItem.id&&currentGems.length<currentSockets?'<div class="tb-stone-picker tb-collection-stone-picker"><b>ВЫБЕРИ КАМЕНЬ ДЛЯ ГНЕЗДА</b>'+collectionStones.map(stone=>'<button type="button" data-stone-choice="'+esc(stone.id)+'" data-stone-item="'+esc(currentItem.id)+'"><span>'+esc(stone.stoneType?.name||stone.stone_type?.name||stone.name||"Камень усиления")+'</span><small>Уровень '+(Number(stone.level)||1)+' · '+(Number(stone.quantity)||1)+' шт.</small></button>').join("")+'</div>':"",
   currentGems.map((gem,index)=>'<div class="tb-collection-gem-row"><span>'+esc(gem.stoneType?.name||"Камень усиления")+' · ур. '+Math.max(1,Number(gem.level)||1)+'</span><button type="button" class="tb-collection-action" data-extract-gem="'+esc(currentItem.id)+'" data-gem-index="'+index+'">ИЗВЛЕЧЬ КАМЕНЬ</button></div>').join("")
  ].join("");
  const detail=current?'<div class="tb-collection-detail-overlay"><section class="tb-collection-detail" role="dialog" aria-modal="true"><button type="button" class="tb-item-detail-close" data-collection-close>×</button><div class="tb-collection-detail-art">'+(current.owned?relicIconHtml(current.item,current.slot):relicIconHtml({rarity:current.rarity,slot:current.slot,name:current.itemName},current.slot))+'</div><h3>'+esc(current.item?.name||current.itemName)+'</h3><p>'+esc(current.className)+' · '+esc(current.branchName)+' · '+esc(slotNames[current.slot])+'</p><p>'+esc(current.rarity)+(current.item?.itemLevel?' · ур. '+current.item.itemLevel:'')+'</p><div class="tb-collection-stats">'+statMarkup(current.item||current)+'</div><div class="tb-collection-actions">'+detailActions+'</div></section></div>':'';
  return subnav+'<header class="tb-collection-header"><div><h2>КОЛЛЕКЦИЯ</h2><p>Текущий класс · все его специализации · 6 слотов · 5 редкостей</p></div><strong>'+catalog.filter(item=>item.owned).length+' / '+catalog.length+'</strong></header>'+grouped+detail;
 }
 function renderView(){
  if(!engine)return;
  try{
  syncMusic();
  const isBattle=screen==="battle"&&!!battle;
  document.body.classList.toggle("tb-battle-lock",isBattle);
  if(screen==="map"&&towerMapOpen)lockTowerMapPage();else unlockTowerMapPage();
  document.documentElement.classList.toggle("tb-battle-lock",isBattle);
  if(isBattle){
   const existing=root.querySelector(".new-battle-wrap"),key=battleRenderKey();
   if(existing&&existing.dataset.renderKey===key){updateBattleDOM();try{ensureBottomNav();}catch(error){console.warn("[Towerbound] battle navigation badges unavailable",error);}return;}
   root.innerHTML='<div class="tb-v2">'+battleScreen()+'</div>';
   const arena=root.querySelector(".new-battle-wrap");if(arena){arena.dataset.renderKey=key;ensureArenaBackground(arena,battle.stage);}
  }else if(screen==="characters")root.innerHTML='<div class="tb-v2">'+characterList()+'</div>';
  else if(screen==="map")root.innerHTML='<div class="tb-v2">'+mapScreen()+'</div>';
  else if(screen==="profile")root.innerHTML='<div class="tb-v2">'+profileScreen()+'</div>';
  else if(screen==="shop")root.innerHTML='<div class="tb-v2">'+shopScreen()+'</div>';
  else if(screen==="systems")root.innerHTML='<div class="tb-v2">'+accountScreen()+'</div>';
  else if(screen==="account")root.innerHTML='<div class="tb-v2">'+accountScreen()+'</div>';
  else if(screen==="progress")root.innerHTML='<div class="tb-v2">'+progressScreen()+'</div>';
  else if(screen==="leaderboard")root.innerHTML='<div class="tb-v2">'+leaderboardScreen()+'</div>';
  else if(screen==="death")root.innerHTML='<div class="tb-v2">'+deathScreen()+'</div>';
  else root.innerHTML='<div class="tb-v2">'+characterList()+'</div>';
  const screenHost=root.querySelector(".tb-v2");if(screenHost)screenHost.dataset.screen=isBattle?"battle":screen;
  let toast=root.querySelector(".tb-toast");
  if(!toast){toast=document.createElement("div");toast.className="tb-toast";root.querySelector(".tb-v2").appendChild(toast);}
  if(toastMessage){toast.textContent=toastMessage;}
  root.querySelectorAll(".tb-map-node").forEach(node=>{if(Number(node.dataset.stage)===selectedStage)node.classList.add("selected");});
  try{ensureBottomNav();}catch(error){console.warn("[Towerbound] navigation badges unavailable; keeping rendered screen",error);}
  if(postBattleSummary?.ready===true&&!battle&&screen==="map")root.querySelector(".tb-v2")?.insertAdjacentHTML("beforeend",lootSummaryModal());
  const pendingRelics=live()?.run?.pendingRelicChoices;
  if(pendingRelics?.length)showRelicRewardScreen(pendingRelics);
  else document.querySelector(".tb-relic-reward-overlay")?.remove();
  }catch(error){
   console.error("[Towerbound] screen render failed",screen,error);
   const message=String(error?.message||error||"Неизвестная ошибка");
   root.innerHTML='<div class="tb-v2"><header class="tb-header"><strong>TowerBound</strong></header><section class="tb-screen-error" role="alert"><h2>Не удалось открыть экран</h2><p>'+esc(message)+'</p><button type="button" data-action="bottom-map">ВЕРНУТЬСЯ НА КАРТУ</button></section></div>';
  }
 }
 function ensureTowerSkipControl(){
  const hero=root.querySelector(".tb-v2 .tb-tower-hero");
  if(!hero)return;
  let actions=hero.querySelector(".tb-tower-hero-actions");
  if(!actions){actions=document.createElement("div");actions.className="tb-tower-hero-actions";hero.appendChild(actions);}
  const continueButton=hero.querySelector('[data-action="start"]');
  const mapButton=hero.querySelector('[data-action="tower-map-focus"]');
  if(continueButton&&continueButton.parentElement!==actions)actions.appendChild(continueButton);
  let secondary=actions.querySelector(".tb-tower-secondary-actions");
  if(!secondary){secondary=document.createElement("div");secondary.className="tb-tower-secondary-actions";actions.appendChild(secondary);}
  let skipButton=hero.querySelector('[data-action="skip-floors"]');
  if(!skipButton){skipButton=document.createElement("button");skipButton.type="button";skipButton.className="tb-skip-floors-button";skipButton.dataset.action="skip-floors";skipButton.textContent="ПРОПУСК ЭТАЖЕЙ";}
  if(skipButton.parentElement!==secondary)secondary.appendChild(skipButton);
  if(mapButton&&mapButton.parentElement!==secondary)secondary.appendChild(mapButton);
  const c=live();
  skipButton.disabled=!c||(Number(c.progress?.highestEver)||0)<10||(screen==="battle"&&!!(battle||c.run?.stage));
  actions.style.cssText+=";display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:8px!important;width:100%!important;min-width:0!important";
  secondary.style.cssText="display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;width:100%!important;min-width:0!important;grid-column:1!important";
  if(continueButton)continueButton.style.cssText+=";display:flex!important;visibility:visible!important;grid-column:1!important;width:100%!important;min-width:0!important;justify-content:center";
  skipButton.style.cssText="display:flex!important;visibility:visible!important;opacity:"+(skipButton.disabled?".72":"1")+";align-items:center;justify-content:center;grid-column:1!important;min-width:0!important;width:100%!important;min-height:46px;padding:9px 5px;border:1px solid #b89a65;border-radius:10px;background:linear-gradient(145deg,#303c49,#1b2732);color:#f6dfad;font-size:clamp(9px,2.6vw,11px);font-weight:900;line-height:1.2;white-space:normal;overflow-wrap:anywhere";
  if(mapButton)mapButton.style.cssText+=";display:flex!important;visibility:visible!important;grid-column:2!important;min-width:0!important;width:100%!important;min-height:46px;align-items:center;justify-content:center;padding:9px 5px;font-size:clamp(9px,2.6vw,11px);white-space:normal;overflow-wrap:anywhere";
 }
 function renderWithScrollSave(){
  // A cloud restore can finish before or after the engine is constructed.
  // Reconcile an empty engine from the confirmed local cloud snapshot before rendering.
  try{
   const cloud=window.TowerboundCloud,cloudStatus=cloud?.status?.()||{};
   if(engine?.state&&cloud?.savesReady&&cloudStatus.remoteHasCharacters&&!engine.state.characters?.length){
    const raw=localStorage.getItem('tb-rpg-v2'),restored=raw?JSON.parse(raw):null;
    if(restored&&Array.isArray(restored.characters)&&restored.characters.length){
     for(const key of Object.keys(engine.state))delete engine.state[key];
     Object.assign(engine.state,restored);
     selectedId=engine.state.activeCharacterId||engine.state.characters[0]?.id||null;
     if(!engine.state.characters.some(character=>character.id===selectedId))selectedId=engine.state.characters[0]?.id||null;
     console.info('[Towerbound] empty engine reconciled from confirmed cloud snapshot');
    }
   }
  }catch(error){console.error('[Towerbound] render-time cloud reconciliation failed',error);}
  const container=document.getElementById('tbRpg')||document.querySelector('.profile');
  const scrollHost=container?.querySelector('.tb-v2')||container;
  const preserveScroll=lastRenderedScreen===screen&&(screen!=="profile"||lastRenderedProfileTab===profileTab);
  const scrollPos=preserveScroll?(scrollHost?scrollHost.scrollTop:(window.scrollY||0)):0;
  renderView();
  ensureTowerSkipControl();

  lastRenderedScreen=screen;
  lastRenderedProfileTab=profileTab;
  if(profileTab==="talents")setTimeout(initTalentTreeCanvas,0);
  const restore=()=>{const next=document.getElementById('tbRpg')||document.querySelector('.profile');const host=next?.querySelector('.tb-v2')||next;if(host)host.scrollTop=preserveScroll?scrollPos:0;if(!preserveScroll)window.scrollTo(0,0);};
  restore();if(typeof requestAnimationFrame==='function')requestAnimationFrame(restore);
 }
 function render(){if(window.__TB_BALANCE_TEST_MODE)return;return renderWithScrollSave();}
 /* Keep the control present even when another UI pass replaces the Tower card after render(). */
 if(typeof MutationObserver==="function"){
  const towerSkipObserver=new MutationObserver(()=>{if(root.querySelector(".tb-tower-hero"))ensureTowerSkipControl();});
  towerSkipObserver.observe(root,{childList:true,subtree:true});
 }

 function showLevelUpModal(level,points){
  document.querySelector(".tb-level-up-overlay")?.remove();
  const overlay=document.createElement("div");overlay.className="tb-level-up-overlay";overlay.setAttribute("role","presentation");
  const special=level===10?"<p>Открыто Древо талантов. Выбери свой путь развития в профиле.</p>":"";
  const upgrades=[20,50].includes(level)?"<p>Доступно улучшение умений в профиле.</p>":"";
  overlay.innerHTML='<section class="tb-level-up-modal" role="dialog" aria-modal="true" aria-labelledby="tbLevelUpTitle"><div class="tb-level-up-crest">✦</div><h2 id="tbLevelUpTitle">ПОЗДРАВЛЯЕМ! ДОСТИГНУТ '+level+' УРОВЕНЬ.</h2>'+special+upgrades+'<p class="tb-level-up-points">Получено очков талантов: '+points+'</p><button type="button" data-level-up-continue>ПРОДОЛЖИТЬ</button></section>';
  document.body.appendChild(overlay);overlay.querySelector("[data-level-up-continue]")?.addEventListener("click",()=>overlay.remove());
 }
 function createCharacter(){
  const name=root.querySelector("#name")?.value||"";
  try{const created=engine.createCharacter(name,selectedClass);selectedId=created.id;engine.state.activeCharacterId=created.id;dialogOpen=false;screen="characters";selectedStage=1;save();render();notify("Персонаж создан · стартовый набор: 100 серебра, 3 зелья и 24 часа премиума");}
  catch(error){notify(error.message);}
 }
 function handleClick(event){
  const target=event.target.closest("[data-tree-node],[data-battle-potion],[data-status],[data-card-inspect-close],[data-shaman-free-mode],[data-card-play],[data-card-reward-pick],[data-card-reward-skip],[data-card-reward-start],[data-card-shop-buy],[data-card-remove-open],[data-card-remove],[data-loot-continue],[data-starter-card],[data-starter-deck-confirm],[data-starter-deck-cancel],[data-relic-reward-pick],[data-relic-acquired-close],[data-ancient-awakening],[data-ancient-awakening-close],[data-relic-buy],[data-unequip],[data-deck-viewer],[data-deck-viewer-close],[data-map-event-choice],[data-trial-reward],[data-camp-rest],[data-camp-forge],[data-camp-remove-open],[data-camp-remove],[data-camp-upgrade],[data-camp-back],[data-camp-close],[data-skill-upgrade-open],[data-skill-upgrade-type],[data-skill-upgrade-close],[data-skill-upgrade-backdrop],[data-collection-item],[data-collection-close],[data-collection-tab],[data-bag-filter],[data-item-select],[data-action],[data-pick],[data-class],[data-stage],[data-tab],[data-branch],[data-talent],[data-select-skill],[data-daily-claim],[data-equip],[data-refine],[data-socket],[data-enchant],[data-merge],[data-use],[data-buy],[data-shop-tab],[data-belt-assign],[data-belt-use],[data-achievement],[data-lore],[data-stash-deposit],[data-stash-withdraw],[data-pvp-buy],[data-paragon-stat],[data-salvage],[data-craft-stone],[data-stone],[data-extract-gem],[data-inspect-stone],[data-stone-picker],[data-stone-choice],[data-stone-item],[data-target],[data-route],[data-panel-skill],[data-replace-skill],[data-close-skill-replace],[data-counter],[data-ultimate],[data-basic-attack],[data-run-modifier],[data-weekly-claim],[data-cosmetic-chest],[data-equip-cosmetic]");
  if(!target||!root.contains(target)&&!document.getElementById("rpgDialog")?.contains(target)&&!target.closest(".card-reward-overlay")&&!target.closest(".tb-starter-deck-overlay")&&!target.closest(".tb-relic-reward-overlay")&&!target.closest(".tb-relic-acquired-overlay")&&!target.closest(".tb-camp-overlay")&&!target.closest(".tb-deck-viewer-overlay")&&!target.closest(".tb-map-event-overlay"))return;
  event.preventDefault();
  if(target.dataset.action==="toggle-fast-battle"){if(battle){battle.fastBattle=!battle.fastBattle;save();render();}return;}
  if(target.dataset.mapEventChoice!==undefined){resolveMapEventChoice(target.dataset.mapEventChoice);return;}
  if(target.dataset.trialReward!==undefined){claimTrialReward(target.dataset.trialReward);return;}
  if(target.dataset.battlePotion){try{const c=live();if(battle.actor?.type!=="player"||battle.paused)throw new Error("Зелье можно использовать только в свой ход");if(battle.potionUsedThisTurn)throw new Error("В этом ходу зелье уже использовано");const before=Number(c.run.playerHp)||0;if(battle.trialObjective)battle.trialPotionUsed=true;engine.useHealingPotion(c.id,target.dataset.battlePotion);const healed=applyTreePotionHealing(c,before);battle.potionUsedThisTurn=true;showFloatingText("player","+"+healed,"#58e38b");pulseCombatActor("player","heal");save();render();notify("Зелье использовано · восстановлено "+healed+" HP");}catch(error){notify(error.message);}return;}
  if(target.dataset.status){showStatusTooltip(target.dataset.status,Number(target.dataset.statusValue)||0);return;}
  if(target.dataset.cardInspectClose!==undefined){document.querySelector(".tb-card-inspect-overlay")?.remove();return;}
  if(target.dataset.deckViewer!==undefined){showDeckViewer();return;}
  if(target.dataset.deckViewerClose!==undefined){document.querySelector(".tb-deck-viewer-overlay")?.remove();return;}
  if(target.dataset.campClose!==undefined){document.querySelector(".tb-camp-overlay")?.remove();campStopStage=null;return;}
  if(target.dataset.campBack!==undefined){renderCampStopOverlay(campStopStage,"home");return;}
  if(target.dataset.campForge!==undefined){renderCampStopOverlay(campStopStage,"forge");return;}
  if(target.dataset.campRemoveOpen!==undefined){renderCampStopOverlay(campStopStage,"remove");return;}
  if(target.dataset.campRemove!==undefined){const c=live(),entry=collectDeckCards(c).find(item=>item.key===target.dataset.campRemove);if(!entry){notify("Карта больше не найдена");return;}if((Number(c.silver)||0)<50){notify("Недостаточно серебра · нужно 50");return;}try{engine.claimCampForge(c.id,campStopStage);c.silver=Math.max(0,Number(c.silver)||0)-50;for(const pile of ["deck","hand","discard","exhaustPile"]){const index=c[pile].findIndex(card=>card===entry.card||card.instanceId===entry.card.instanceId);if(index>=0)c[pile].splice(index,1);}document.querySelector(".tb-camp-overlay")?.remove();campStopStage=null;save();render();notify("Карта удалена из забега · −50 серебра");}catch(error){notify(error.message);}return;}
  if(target.dataset.campRest!==undefined){
   const c=live();try{const result=engine.useCampRest(c.id,campStopStage);document.querySelector(".tb-camp-overlay")?.remove();campStopStage=null;save();render();notify("Отдых у костра · +"+result.restored+" HP");}catch(error){notify(error.message);}return;
  }
  if(target.dataset.campUpgrade!==undefined){
   const c=live(),entry=collectDeckCards(c).find(item=>item.key===target.dataset.campUpgrade);
   if(!entry||entry.card.isUpgraded){notify("Эта карта уже улучшена или больше не в колоде");return;}
   const upgrade=campCardUpgrade(entry.card);
   try{engine.claimCampForge(c.id,campStopStage);entry.card.effects=upgrade.effects;entry.card.upgradedEffects=upgrade.effects;if(Array.isArray(upgrade.generateCards))entry.card.generateCards=upgrade.generateCards;entry.card.description=upgrade.description;entry.card.isUpgraded=true;document.querySelector(".tb-camp-overlay")?.remove();campStopStage=null;save();render();notify("Карта улучшена: "+entry.card.name+" +");}catch(error){notify(error.message);}return;
  }
  if(target.dataset.starterCard!==undefined){const id=target.dataset.starterCard;if(starterDeckSelection.includes(id))starterDeckSelection=starterDeckSelection.filter(value=>value!==id);else if(starterDeckSelection.length<3&&unlockedCardIds().includes(id))starterDeckSelection.push(id);else notify("Можно выбрать не более трёх открытых карт");renderStarterDeckModal();return;}
  if(target.dataset.starterDeckCancel!==undefined){document.querySelector(".tb-starter-deck-overlay")?.remove();starterDeckSelection=[];return;}
  if(target.dataset.starterDeckConfirm!==undefined){confirmStarterDeck();return;}
  if(target.dataset.relicAcquiredClose!==undefined){const tier=Number(target.dataset.ancientAwakening)||0;document.querySelector(".tb-relic-acquired-overlay")?.remove();if(tier>=2&&tier<=4)showAncientSetAwakeningScreen(tier,live()?.classId);return;}
  if(target.dataset.ancientAwakeningClose!==undefined){document.querySelector(".tb-ancient-awakening-overlay")?.remove();return;}
  if(target.dataset.relicRewardPick!==undefined){const c=live(),relicId=target.dataset.relicRewardPick;try{const relic=engine.claimRelic(c.id,relicId);document.querySelector(".tb-relic-reward-overlay")?.remove();save();render();showRelicAcquiredScreen(relic,"НАГРАДА ЗА БОССА");}catch(error){notify(error.message);}return;}
  if(target.dataset.cardRewardStart!==undefined){const c=live();if(!c)return;const cards=Array.isArray(c.pendingCardReward)&&c.pendingCardReward.length?c.pendingCardReward:generateCardReward(c);if(!cards.length){notify("Карты для награды не найдены");return;}c.pendingCardReward=cards;postBattleSummary=null;save();render();showCardRewardScreen(cards);return;}
  if(target.dataset.cardRewardSkip!==undefined){skipCardReward();return;}
  if(target.dataset.cardRewardPick!==undefined){const c=live(),overlay=document.querySelector(".card-reward-overlay"),cards=c?.pendingCardReward||[],chosen=cards[Number(target.dataset.cardRewardPick)];if(!c||!chosen)return;ensureCardDeck(c);c.deck.push(chosen);unlockCardPermanently(chosen.id);c.pendingCardReward=null;overlay?.remove();save();render();notify("Карта добавлена в колоду: "+chosen.name);return;}
  if(target.dataset.cardShopBuy!==undefined){const c=live();if(!c)return;try{ensureCardDeck(c);if(Number(c.silver)<100)throw new Error("Недостаточно серебра");const card=pickRandomCardDefinition(c,new Set());if(!card)throw new Error("Нет доступных карт для этого класса");c.silver-=100;c.deck.push(card);unlockCardPermanently(card.id);save();render();notify("Куплена карта: "+card.name+" · −100 серебра");}catch(error){notify(error.message);}return;}
  if(target.dataset.cardRemoveOpen!==undefined){cardRemovalOpen=!cardRemovalOpen;render();return;}
  if(target.dataset.cardRemove!==undefined){const c=live();if(!c)return;try{ensureCardDeck(c);if(Number(c.silver)<75)throw new Error("Недостаточно серебра");const piles=["deck","hand","discard","exhaustPile"];let found=null,source=null;for(const pile of piles){const list=c[pile]||[],at=list.findIndex(card=>(card.instanceId||card.id)===target.dataset.cardRemove);if(at>=0){found=list[at];source=list;source.splice(at,1);break;}}if(!found)throw new Error("Карта уже отсутствует в колоде");const remaining=piles.reduce((sum,pile)=>sum+(c[pile]||[]).length,0);if(remaining<1){source.push(found);throw new Error("Нельзя удалить последнюю карту колоды");}c.silver-=75;c.cardArchive.push({...found,archivedAt:Date.now()});cardRemovalOpen=false;save();render();notify("Карта отправлена в Архив · −75 серебра");}catch(error){notify(error.message);}return;}
  if(target.dataset.lootContinue!==undefined){postBattleSummary=null;screen="map";save();render();return;}
  playSfx("click");
  if(target.dataset.collectionItem){collectionSelection=target.dataset.collectionItem;render();return;}if(target.dataset.collectionClose!==undefined){collectionSelection=null;render();return;}if(target.dataset.collectionTab){collectionTab=target.dataset.collectionTab;collectionSelection=null;render();return;}if(target.dataset.bagFilter){bagFilter=target.dataset.bagFilter;selectedItemId=null;stonePickerItemId=null;render();return;}if(target.dataset.stonePicker!==undefined){stonePickerItemId=stonePickerItemId===target.dataset.stonePicker?null:target.dataset.stonePicker;render();return;}if(target.dataset.stoneChoice!==undefined){try{const c=live();engine.insertGem(c.id,target.dataset.stoneItem,target.dataset.stoneChoice);selectedItemId=null;stonePickerItemId=null;save();render();notify("Камень вставлен в предмет");}catch(error){notify(error.message);}return;}if(target.dataset.itemSelect!==undefined){selectedItemId=target.dataset.itemSelect||null;stonePickerItemId=null;render();return;}if(target.dataset.route){routeChoice=target.dataset.route;render();return;}if(target.dataset.pick){selectedId=target.dataset.pick;pendingBranchId=null;engine.state.activeCharacterId=selectedId;selectedStage=live().progress.currentStage;render();return;}
  if(target.dataset.class){selectedClass=target.dataset.class;render();return;}
  if(target.dataset.stage){const stage=Number(target.dataset.stage);if(stage<=live().progress.highestEver&&engine.canUseCampStop(live().id,stage)){selectedStage=stage;renderCampStopOverlay(stage,"home");return;}selectedStage=stage;render();return;}
   if(target.dataset.runModifier){try{const selected=engine.setRunModifier(live().id,target.dataset.runModifier);save();render();notify("Модификатор забега: "+selected.name);}catch(error){notify(error.message);}return;}
   if(target.dataset.weeklyClaim){try{engine.claimWeeklyQuest(live().id,target.dataset.weeklyClaim);save();render();notify("Еженедельное задание: награда получена");}catch(error){notify(error.message);}return;}
   if(target.dataset.cosmeticChest){try{const item=engine.buyCosmeticChest(target.dataset.cosmeticChest);save();render();notify("Получена косметика: "+item.name);}catch(error){notify(error.message);}return;}
   if(target.dataset.equipCosmetic){try{const item=engine.equipCosmetic(target.dataset.equipCosmetic);save();render();notify("Косметика надета: "+item.name);}catch(error){notify(error.message);}return;}
  if(target.dataset.skillUpgradeClose!==undefined||target.dataset.skillUpgradeBackdrop!==undefined){pendingSkillUpgradeId=null;render();return;}
  if(target.dataset.skillUpgradeOpen){const c=live(),skill=availableSkillForUpgrade(c,target.dataset.skillUpgradeOpen),next=skill?getSkillStats(c,skill).level+1:4;if(!skill||next>3||c.level<SKILL_UPGRADE_LEVELS[next]){notify("Улучшение пока недоступно");return;}pendingSkillUpgradeId=skill.id;render();return;}
  if(target.dataset.skillUpgradeType){const c=live(),skill=availableSkillForUpgrade(c,pendingSkillUpgradeId),next=skill?getSkillStats(c,skill).level+1:4;if(!skill||next>3||c.level<SKILL_UPGRADE_LEVELS[next]){pendingSkillUpgradeId=null;render();notify("Улучшение недоступно");return;}c.skillUpgrades=c.skillUpgrades||{};c.skillUpgrades[skill.id]={level:next,type:target.dataset.skillUpgradeType==="cost"?"cost":"power"};pendingSkillUpgradeId=null;save();render();notify("Умение улучшено: "+skill.name+" · "+next+"/3");return;}
  if(target.dataset.tab){profileTab=target.dataset.tab;statsOverlayOpen=profileTab==="stats";pendingSkillUpgradeId=null;render();if(profileTab==="talents")setTimeout(()=>{initTalentTreeCanvas();centerTalentTreeOnCore();},0);return;}
  if(target.dataset.shopTab){shopTab=target.dataset.shopTab;render();return;}
  if(target.dataset.branch){const character=live();if(!character)return;const option=(classData(character).branches||[]).find(item=>item.id===target.dataset.branch);if(!option){notify('Ветка специализации не найдена');return;}if(Number(character.level)<10){notify('Специализация открывается на 10 уровне');return;}pendingBranchId=option.id===character.branch?null:option.id;render();return;}
  if(target.dataset.action==="open-camp"){if(engine.canUseCampStop(live().id,selectedStage))renderCampStopOverlay(selectedStage,"home");else notify("Привал на этом этапе уже использован или недоступен");return;}
  if(target.dataset.action==="confirm-branch"){if(!pendingBranchId)return;try{engine.chooseBranch(live().id,pendingBranchId);const chosen=pendingBranchId,added=grantSpecializationCards(live(),chosen);pendingBranchId=null;save();render();notify("Специализация выбрана: "+((classData(live()).branches||[]).find(item=>item.id===chosen)?.name||chosen)+" · новые карты: "+added);}catch(error){notify(error.message);}return;}
  if(target.dataset.action==="cancel-branch"){pendingBranchId=null;render();return;}
  if(target.dataset.treeNode){purchaseTreeNode(target.dataset.treeNode);return;}
  if(target.dataset.action==="tree-close"){profileTab="stats";statsOverlayOpen=false;closeTreeNodePopup();render();return;}
  if(target.dataset.action==="stats-close"){statsOverlayOpen=false;profileTab="stats";render();return;}
  if(target.dataset.action==="reset-tree"){resetTalentTree();return;}
  if(target.dataset.action==="tree-fullscreen"){const shell=root.querySelector(".tb-tree-shell");if(shell){if(document.fullscreenElement===shell){document.exitFullscreen?.();}else if(shell.requestFullscreen){shell.requestFullscreen().then(()=>setTimeout(initTalentTreeCanvas,80)).catch(()=>{shell.classList.toggle("tb-tree-fullscreen");setTimeout(initTalentTreeCanvas,40);});}else shell.classList.toggle("tb-tree-fullscreen");}return;}
  if(target.dataset.action==="open-season-modifiers"){root.querySelector("#tbSeasonalStatus")?.scrollIntoView({behavior:"smooth",block:"center"});return;}
  if(target.dataset.action==="open-workshop"){window.TowerboundProgression?.openWorkshop?.();return;}
  if(target.dataset.action==="claim-offline-progress"){window.TowerboundProgression?.claimOffline?.();return;}
  if(target.dataset.action==="toggle-farm-speed"){window.TowerboundProgression?.toggleFarmSpeed?.();return;}
  if(target.dataset.action==="toggle-auto-salvage"){window.TowerboundProgression?.toggleAutoSalvage?.();return;}
  if(target.dataset.action==="push-notifications"){window.TowerboundProgression?.requestPush?.();return;}
  if(target.dataset.action==="tree-center"){treeCamera={scale:1.56,x:0,y:0};drawTalentTree();return;}
  if(target.dataset.talent){try{engine.useTalentPoint(live().id,target.dataset.talent,3);save();render();}catch(error){notify(error.message);}return;}
  if(target.dataset.shamanFreeMode!==undefined){const c=live();if(c.classId==="shaman"&&Number(c.totem)>=3){battle.shamanFreeMode=!battle.shamanFreeMode;save();render();}return;}
  if(target.dataset.cardPlay!==undefined){playCard(Number(target.dataset.cardPlay));return;}
  if(target.dataset.target!==undefined){setBattleTarget(Number(target.dataset.target));return;}
  if(target.dataset.panelSkill){playerAction(target.dataset.panelSkill,Number(target.dataset.panelSlot));return;}
  if(target.dataset.counter!==undefined){useCounterSkill();return;}
  if(target.dataset.ultimate!==undefined){useUltimate();return;}
  if(target.dataset.closeSkillReplace!==undefined){target.closest('.tb-skill-replace-overlay')?.remove();return;}
  if(target.dataset.replaceSkill!==undefined){const modal=target.closest('.tb-skill-replace-overlay'),skillId=modal?.dataset.pendingSkill,index=Number(target.dataset.replaceSkill),c=live();if(!c||!skillId||!Number.isInteger(index)||index<0||index>=6)return;const chosen=Array.isArray(c.activeSkills)?c.activeSkills:[];chosen[index]=skillId;c.activeSkills=chosen;c.skillLoadout=chosen;modal.remove();save();render();notify('Панель умений обновлена');return;}
  if(target.dataset.selectSkill){
   const c=live(),def=classData(c),base=(def.base_skills||[]).find(skill=>skill.id===target.dataset.selectSkill);
   const selected=base||skills.find(skill=>skill.id===target.dataset.selectSkill);
   if(!selected||selected.unlock_level>c.level){notify("Умение недоступно для текущего уровня или ветки");return;}
   const chosen=Array.isArray(c.activeSkills)?c.activeSkills:ensureLoadout(c).filter(Boolean).map(skill=>skill.id);if(chosen.includes(selected.id)){notify('Это умение уже выбрано');return;}if(chosen.length<6){chosen.push(selected.id);c.activeSkills=chosen;c.skillLoadout=chosen;save();render();notify('Умение добавлено на панель: '+selected.name);return;}const overlay=document.createElement('div');overlay.className='tb-skill-replace-overlay';overlay.dataset.pendingSkill=selected.id;overlay.innerHTML='<section role="dialog" aria-modal="true" class="tb-skill-replace-dialog"><h3>Все 6 слотов заняты</h3><p>Выбери умение, которое заменить на «'+esc(selected.name)+'».</p>'+chosen.map((id,index)=>{const current=resolveSkill(c,id);return '<button type="button" data-replace-skill="'+index+'">'+(index+1)+'. '+esc(current?.name||id)+'</button>';}).join('')+'<button type="button" data-close-skill-replace="1">ОТМЕНА</button></section>';root.querySelector('.tb-v2')?.appendChild(overlay);return;
  }
  if(target.dataset.beltAssign){const slot=Number(window.prompt("Назначить в слот пояса (1–5):"))-1;try{engine.assignPotionBelt(live().id,slot,target.dataset.beltAssign);save();render();notify("Зелье назначено в слот "+(slot+1));}catch(error){notify(error.message);}return;}
  if(target.dataset.beltUse!==undefined){try{const c=live();if(battle.potionUsedThisTurn||battle.actor?.type!=="player")throw new Error("Зелье уже использовано в этом ходу");const before=Number(c.run.playerHp)||0;engine.usePotionBelt(c.id,Number(target.dataset.beltUse));const healed=applyTreePotionHealing(c,before);battle.potionUsedThisTurn=true;save();render();notify("Зелье использовано · восстановлено "+healed+" HP");}catch(error){notify(error.message);}return;}
  if(target.dataset.achievement){try{const reward=engine.claimAchievement(live().id,target.dataset.achievement);save();render();notify("Достижение получено · "+(reward.silver||0)+" серебра");}catch(error){notify(error.message);}return;}
  if(target.dataset.lore){try{const result=engine.readLore(live().id,target.dataset.lore);save();render();notify(result.alreadyRead?"Уже прочитано":"Лор прочитан · +"+result.xp+" XP");}catch(error){notify(error.message);}return;}
  if(target.dataset.stashDeposit){try{engine.stashDeposit(live().id,target.dataset.stashDeposit);save();render();notify("Предмет помещён в общий стеш");}catch(error){notify(error.message);}return;}
  if(target.dataset.stashWithdraw){try{engine.stashWithdraw(live().id,target.dataset.stashWithdraw);save();render();notify("Предмет получен из стеша");}catch(error){notify(error.message);}return;}
  if(target.dataset.pvpBuy){try{const result=engine.purchasePvpItem(live().id,target.dataset.pvpBuy);save();render();notify("Покупка за PvP-очки: "+result.item.name);}catch(error){notify(error.message);}return;}
  if(target.dataset.paragonStat){try{engine.assignParagon(live().id,target.dataset.paragonStat);save();render();notify("Очко парагона распределено");}catch(error){notify(error.message);}return;}
  if(target.dataset.salvage){if(!window.confirm("Разобрать предмет на материалы? Действие необратимо."))return;try{const result=engine.salvageItem(live().id,target.dataset.salvage);save();render();notify("Разбор: +"+result.quantity+" материалов");}catch(error){notify(error.message);}return;}
  if(target.dataset.craftStone!==undefined){try{const type=balance.equipment.stone_types.find(item=>item.class_id===live().classId&&item.branch_id===live().branch&&item.slot==="weapon");if(!type)throw new Error("Сначала выбери специализацию персонажа");const stone=engine.craftStone(live().id,type);save();render();notify("Создан камень I уровня: "+(stone.stoneType.name||stone.stoneType.id));}catch(error){notify(error.message);}return;}
  if(target.dataset.equip){equipItem(target.dataset.equip);return;}
  if(target.dataset.unequip!==undefined){try{const item=engine.unequipItem(live().id,target.dataset.unequip);syncEquipmentCards(live());save();render();notify("Предмет снят · карта "+(CARD_DATABASE[item.cardId]?.name||"экипировки")+" удалена из колоды");}catch(error){notify(error.message);}return;}
  if(target.dataset.relicBuy){try{const relic=engine.purchaseRelic(live().id,target.dataset.relicBuy);save();render();showRelicAcquiredScreen(relic,"ПОКУПКА В МАГАЗИНЕ");}catch(error){notify(error.message);}return;}
  if(target.dataset.merge){try{const c=live(),stone=c.bag.find(x=>x.id===target.dataset.merge);if(!stone)throw new Error("Камень не найден");engine.mergeStones(c.id,stone.stoneType,stone.level);save();render();notify("Пять камней объединены");}catch(error){notify(error.message);}return;}
  if(target.dataset.use){try{const result=engine.activateItem(live().id,target.dataset.use);save();render();notify("Предмет активирован: "+result.activated);}catch(error){notify(error.message);}return;}
  if(target.dataset.dailyClaim){try{const result=engine.claimDailyQuest(live().id,target.dataset.dailyClaim);save();render();notify("Награда: "+result.rewardSilver+" серебра");}catch(error){notify(error.message);}return;}
  if(target.dataset.refine){try{const r=engine.refine(live().id,target.dataset.refine);save();render();notify(r.success?"Заточка успешна: +"+r.refine:r.destroyed?"Предмет разрушен":"Заточка не удалась");}catch(error){notify(error.message);}return;}
  if(target.dataset.socket){try{engine.addSocket(live().id,target.dataset.socket);save();render();notify("Добавлено новое гнездо");}catch(error){notify(error.message);}return;}
  if(target.dataset.inspectStone){const stone=live().bag.find(x=>x.id===target.dataset.inspectStone);if(stone)notify((stone.stoneType?.name||"Камень усиления")+" · "+stoneDescription(stone));return;}
  if(target.dataset.extractGem){try{const gem=engine.extractGem(live().id,target.dataset.extractGem,Number(target.dataset.gemIndex));save();render();notify("Камень извлечён в рюкзак: "+(gem.stoneType?.name||"камень"));}catch(error){notify(error.message);}return;}
  if(target.dataset.stone){try{
   const c=live(),item=(c.gear||[]).find(x=>x&&x.id===target.dataset.stone);
   if(!item)throw new Error("Предмет экипировки не найден");
   if(installedGemsOf(item).length>=(Number(item.socketsAvailable)||0))throw new Error("Нет свободного гнезда: сначала используй долото");
   const stones=(c.bag||[]).filter(stone=>stone&&stone.type==="enhancement_stone");
   if(!stones.length)throw new Error("Нет подходящих камней в рюкзаке для этого предмета");
   stonePickerItemId=stonePickerItemId===item.id?null:item.id;render();
  }catch(error){notify(error.message);}return;}
  if(target.dataset.enchant){try{const c=live(),choices=engine.rollEnchantScroll(c.id,target.dataset.enchant),choice=Number(window.prompt("Выбери зачарование (1–4):\n"+choices.map((x,i)=>(i+1)+". "+x).join("\n")))-1;if(Number.isInteger(choice)&&choice>=0&&choice<4){engine.applyEnchant(c.id,target.dataset.enchant,choice,choices);save();render();notify("Зачарование применено");}else notify("Зачарование отменено");}catch(error){notify(error.message);}return;}
  if(target.dataset.buy){try{engine.purchase(live().id,shopTab,target.dataset.buy);save();render();notify("Покупка совершена");}catch(error){notify(error.message);}return;}
  switch(target.dataset.action){
   case "new":if(!window.TowerboundCloud?.signedIn){notify("Сначала войди в игровой аккаунт");return;}if(engine.state.characters.length>=balance.account.max_characters){notify("Достигнут лимит персонажей: "+balance.account.max_characters);return;}dialogOpen=true;selectedClass="assassin";render();break;
   case "close":dialogOpen=false;render();break;
   case "confirm-create":createCharacter();break;
   case "play":if(!selectedId&&engine.state.characters[0])selectedId=engine.state.characters[0].id;if(!selectedId){notify("Сначала создай персонажа");return;}engine.state.activeCharacterId=selectedId;selectedStage=live().progress.currentStage;screen="map";render();save();break;
   case "characters":screen="characters";render();break;
   case "map":stopBattleStatusLoop();clearPendingTurnTimer();if(battle)battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;screen="map";battle=null;render();save();break;
   case "bottom-map":stopBattleStatusLoop();clearPendingTurnTimer();if(battle)battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;battle=null;screen="map";render();save();break;
   case "bottom-profile":profileTab="stats";statsOverlayOpen=false;screen="profile";render();break;
   case "bottom-shop":screen="shop";render();break;
   case "bottom-progress":case "open-progress":screen="progress";render();break;
   case "bottom-community":{const social=window.TowerboundSocial;if(typeof social?.open==="function")social.open();else notify("Сообщество ещё загружается. Попробуй ещё раз через секунду.");break;}
   case "open-meta-progression":if(window.TowerboundProgression?.openMetaProgress)window.TowerboundProgression.openMetaProgress();else if(window.TowerboundProgression?.open)window.TowerboundProgression.open();else notify("Модуль прогрессии ещё загружается");break;
   case "bottom-account":screen="account";render();break;
   case "reset-current-battle":{const c=live(),stage=c?.run?.stage?.stage||c?.progress?.currentStage||selectedStage;stopBattleStatusLoop();clearPendingTurnTimer();if(battle)battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;if(c?.run){c.run.stage=null;c.run.active=true;}battle=null;selectedStage=Math.max(1,Math.min(balance.map.total_stages,stage));screen="map";save();render();notify("Бой сброшен · этап "+selectedStage+" можно начать заново");break;}
   case "profile":profileTab="stats";statsOverlayOpen=false;screen="profile";render();break;
   case "profile-gear":profileTab="gear";screen="profile";render();break;
   case "toggle-mute":engine.saveSettings({sound_enabled:settings().sound_enabled===false});save();render();notify(settings().sound_enabled===false?"Звук выключен":"Звук включён");break;
   case "empty-login":case "empty-register":(async()=>{const cloud=window.TowerboundCloud,login=root.querySelector('#login')?.value||'',password=root.querySelector('#pass')?.value||'',remember=!!root.querySelector('#rememberMe')?.checked,message=root.querySelector('.tb-login-message'),action=target.dataset.action;try{if(!cloud)throw new Error('Облачный модуль ещё загружается');if(!cloud.configured)throw new Error('Supabase не настроен: проверь URL и publishable key');if(message){message.classList.remove('is-error');message.textContent=action==='empty-login'?'Входим в игру…':'Создаём аккаунт…';}if(action==='empty-login')await cloud.signIn(login,password,remember);else await cloud.signUp(login,password,remember);if(cloud.signedIn){render();notify('Аккаунт подключён');}else if(message)message.textContent='Регистрация отправлена. Если включено подтверждение email, настрой его в Supabase Auth, затем войди.';}catch(error){if(message){message.textContent=error.message||'Ошибка авторизации';message.classList.add('is-error');}else notify(error.message||'Ошибка авторизации');}})();break;
   case "account-login":case "account-register":(async()=>{const cloud=window.TowerboundCloud,login=root.querySelector('#tbAccountLogin')?.value||'',password=root.querySelector('#tbAccountPassword')?.value||'',remember=!!root.querySelector('#tbAccountRemember')?.checked;try{if(!cloud)throw new Error('Облачный модуль ещё загружается');if(target.dataset.action==='account-login')await cloud.signIn(login,password,remember);else await cloud.signUp(login,password,remember);render();notify('Аккаунт подключён');}catch(error){const message=root.querySelector('.tb-account-message');if(message){message.textContent=error.message||'Ошибка авторизации';message.classList.add('is-error');}else notify(error.message);}})();break;
   case "account-logout":(async()=>{try{await window.TowerboundCloud.signOut();render();notify('Вы вышли из аккаунта');}catch(error){notify(error.message);}})();break;
   case "account-sync":(async()=>{try{await window.TowerboundCloud.syncNow();render();notify('Синхронизировано');}catch(error){notify(error.message);}})();break;
   case "cloud-account":if(window.TowerboundCloud?.open)window.TowerboundCloud.open();else notify("Облачный модуль ещё загружается");break;
   case "cloud-sync":(async()=>{try{const cloud=window.TowerboundCloud;if(!cloud?.syncNow)throw new Error("Облачный модуль недоступен");await cloud.syncNow();notify("Облачное сохранение синхронизировано");}catch(error){notify(error.message||"Не удалось синхронизировать");}})();break;
    case "cloud-retry":(async()=>{
     const button=target;const original=button.textContent;
     if(button.dataset.retrying==="true")return;
     button.dataset.retrying="true";button.disabled=true;button.textContent="ЗАГРУЖАЕМ ОБЛАЧНОЕ СОХРАНЕНИЕ…";
     notify("Повторно запрашиваем персонажа из облака…");
     try{
      const cloud=window.TowerboundCloud;
      if(!cloud?.signedIn||typeof cloud.retryLoad!=="function")throw new Error("Облачный аккаунт ещё не подключён. Обнови страницу и войди снова.");
      await cloud.retryLoad();
      if(!cloud.savesReady){
       const state=cloud.status?.()||{};
       throw new Error(state.text||"Сервер пока не подтвердил загрузку. Попробуй ещё раз через несколько секунд.");
      }
      const raw=localStorage.getItem("tb-rpg-v2"),restored=raw?JSON.parse(raw):null;
      if(!restored||!Array.isArray(restored.characters)||!restored.characters.length)throw new Error("Облако ответило, но список персонажей не попал в локальное сохранение.");
      if(engine?.state){
       for(const key of Object.keys(engine.state))delete engine.state[key];
       Object.assign(engine.state,restored);
       selectedId=engine.state.activeCharacterId||engine.state.characters[0]?.id||null;
       if(!engine.state.characters.some(character=>character.id===selectedId))selectedId=engine.state.characters[0]?.id||null;
      }
      render();notify("Персонаж успешно загружен из облака.");
     }catch(error){
      render();notify("Загрузка не завершена: "+(error.message||"неизвестная ошибка"));
      console.error("[Towerbound] manual cloud retry failed",error);
     }finally{
      const current=root.querySelector('[data-action="cloud-retry"]');
      if(current){current.disabled=false;current.textContent=original;delete current.dataset.retrying;}
     }
    })();break;
    case "cloud-recover-local":(async()=>{try{const cloud=window.TowerboundCloud,info=cloud?.inspectLocalBackup?.();if(!info?.available){notify("Локальная резервная копия не найдена");return;}const details=info.characters.map(c=>c.name+" · ур. "+c.level+" · этаж "+c.highestFloor).join("; ");const warning=info.userMatch?"":"\nКопия не привязана к текущему аккаунту. Проверь данные внимательно.";if(!window.confirm("Найдена резервная копия:\n"+details+warning+"\n\nВосстановить её и записать в облако?"))return;await cloud.restoreLocalBackup();render();notify("Резервная копия восстановлена");}catch(error){notify(error.message||"Не удалось восстановить резервную копию");}})();break;
   case "daily-chest":try{const reward=engine.claimDailyChest(live().id);save();render();notify(reward.type==="silver"?"Сундук: +"+reward.amount+" серебра":reward.type==="potion"?"Сундук: +1 зелье исцеления":"Сундук: +10 материалов");}catch(error){notify(error.message);}break;
   case "systems":screen="account";render();break;
   case "leaderboard":screen="leaderboard";onlineLeaderboardError="";render();refreshOnlineLeaderboard();break;
   case "leaderboard-refresh":refreshOnlineLeaderboard();break;
   case "tutorial-next":try{engine.tutorialStep(live().id);save();render();}catch(error){notify(error.message);}break;
   case "tutorial-skip":try{engine.tutorialStep(live().id,"skip");save();render();notify("Туториал пропущен");}catch(error){notify(error.message);}break;
   case "tutorial-claim":try{engine.claimTutorialReward(live().id);save();render();notify("Награда туториала получена");}catch(error){notify(error.message);}break;
   case "pvp-match":(async()=>{try{
    if(!window.TowerboundOnline?.signedIn)throw new Error("Войди в аккаунт Supabase, чтобы искать реальных соперников");
    const c=live(),daily=engine.ensurePvpDaily(),premium=engine.state.account.premiumUntil>Date.now(),limit=premium?balance.pvp.daily_duels.premium:balance.pvp.daily_duels.free;
    if(daily.duels>=limit)throw new Error("На сегодня дуэли закончились");
    const opponent=await window.TowerboundOnline.findGhost(c,engine);
    const tier=(balance.bp.tiers||[]).find(t=>opponent.bp>=t.min&&(t.max===null||opponent.bp<=t.max))||(balance.bp.tiers||[])[0];
    daily.duels++;daily.pending={opponentId:opponent.id,opponent,tier:tier?.id||"rookie",startedAt:Date.now(),online:true};
    save();render();notify("Реальный соперник найден: "+opponent.name);
   }catch(error){notify(error.message||"Не удалось найти соперника");}})();break;
   case "pvp-fight":try{const result=engine.simulatePvpDuel(live().id);save();render();notify((result.won?"ПОБЕДА":"ПОРАЖЕНИЕ")+" · +"+result.pointsAwarded+" локальных PvP-очков. Серверный рейтинг пока не начисляется.");}catch(error){notify(error.message);}break;
   case "daily-boss":try{const boss=engine.startDailyBoss(live().id,"silver"),stats=engine.getCombatStats(live()),enemyRounds=Math.ceil(stats.maxHp/Math.max(1,boss.attack*engine.mitigationMultiplier(stats.defense,live().level))),playerRounds=Math.ceil(boss.health/Math.max(1,stats.attack)),won=playerRounds<=enemyRounds,result=engine.completeDailyBoss(live().id,won);save();render();notify(result.won?"Дневной босс побеждён · награда получена":"Дневной босс оказался сильнее");}catch(error){notify(error.message);}break;
   case "paragon-reset":try{engine.resetParagon(live().id);save();render();notify("Парагон сброшен");}catch(error){notify(error.message);}break;
   case "reset-character":{const c=live();if(!window.confirm("Полностью сбросить персонажа?")||!window.confirm("Подтверди сброс: это удалит весь прогресс и экипировку."))return;const typed=window.prompt("Введи имя персонажа:");try{const replacement=engine.resetCharacter(c.id,typed,true);selectedId=replacement.id;selectedStage=1;screen="characters";battle=null;save();render();notify("Персонаж сброшен до 1 уровня");}catch(error){notify(error.message);}break;}
   case "delete-character":{const c=live();if(!window.confirm("Удалить персонажа без возможности восстановления?")||!window.confirm("Подтверди удаление: все вещи и прогресс будут утрачены."))return;const typed=window.prompt("Введи имя персонажа:");try{engine.deleteCharacter(c.id,typed,true);selectedId=engine.state.characters[0]?.id||null;screen="characters";battle=null;save();render();notify("Персонаж удалён");}catch(error){notify(error.message);}break;}
   case "shop":screen="shop";render();break;
   case "skip-floors":showSkipFloorsModal();break; case "tower-map-focus":{selectedStage=live().progress.currentStage;towerMapOpen=true;render();break;} case "tower-map-close":towerMapOpen=false;towerMapScrollTop=0;render();break; case "tower-map-current":{selectedStage=live().progress.currentStage;render();break;}
   case "start":{towerMapOpen=false;const c=live();if(pendingSkipStage){selectedStage=pendingSkipStage;if(c&&!c.run.active&&!c.run.stage){showStarterDeckModal();break;}beginStage();break;}if(c&&!c.run.active&&!c.run.stage){showStarterDeckModal();break;}if(c&&eventTypeForStage(c,selectedStage)&&!c.run.completedMapEvents?.includes(Number(selectedStage))){showMapEventOverlay();break;}beginStage();break;}
   case "daily-challenge":try{const c=live();if(c.run.stage)throw new Error("Сначала заверши текущий бой");const daily=dailyChallengeInfo(),today=dailyChallengeDate();if(c.run.dailyChallengeCompletedDate===today)throw new Error("Ежедневный вызов уже завершён сегодня");if(c.run.dailyChallengeActive&&c.run.dailyChallengeDate===today){selectedStage=c.progress.currentStage;notify("Продолжаем сегодняшний забег · seed "+c.run.dailyChallengeSeed);beginStage();break;}c.run.dailyChallengeActive=true;c.run.dailyChallengeDate=today;c.run.dailyChallengeSeed=daily.seed;c.run.dailyChallengeSeedState=daily.seed;c.run.dailyChallengeModifier=daily.modifier.id;c.run.dailyChallengeCompletedDate=null;selectedStage=c.progress.currentStage;if(daily.modifier.id==="rage")c.rage=5;if(!c.run.active){showStarterDeckModal();break;}beginStage();notify("Вызов дня: "+daily.modifier.name+" · seed "+daily.seed);}catch(error){notify(error.message);}break;
   case "attack":basicAttack();break;
   case "end-turn":endTurnButton();break;
   case "equip-best":try{const result=engine.equipBest(live().id);syncEquipmentCards(live());save();render();notify("Экипировано предметов: "+result.equipped+" · карты экипировки обновлены");}catch(error){notify(error.message);}break;
   case "salvage-gray":try{const result=engine.salvageGrayItems(live().id);save();render();notify("Разобрано серых предметов: "+result.count+" · +"+result.materials+" материалов");}catch(error){notify(error.message);}break;
   case "skill":{const skill=activeSkill(live());if(skill)playerAction(skill.id,0);else notify("Нет доступного атакующего умения");break;}
   case "potion":try{engine.useHealingPotion(live().id);save();render();notify("Зелье использовано. Слот этой цели потрачен.");}catch(error){notify(error.message);}break;
   case "speed":try{engine.setSpeed2(live().id,!live().run.speed2,battle.stage);preferredSpeed2=live().run.speed2;localStorage.setItem("tb-rpg-speed-v2",preferredSpeed2?"2":"1");save();render();}catch(error){notify(error.message);}break;
   case "pause":if(battle){
    if(!battle.paused){
     battle.paused=true;
     clearPendingTurnTimer();battle.timerRemainingMs=0;battle.timerStartedAt=0;
     const until=Number(battle.telegraph?.until),remaining=Number(battle.remainingResponseMs);
     battle.remainingResponseMs=Number.isFinite(remaining)&&remaining>0?remaining:(Number.isFinite(until)&&until>0?Math.max(0,until-Date.now()):0);
    }else{
     battle.paused=false;
     if(battle.enemyQueueState&&battle.actor?.type==="enemy"){
      resumeEnemyTurnQueue(180);
     }else if(battle.telegraph){
      const remaining=Number(battle.remainingResponseMs),until=Number(battle.telegraph.until);
      const delay=Number.isFinite(remaining)&&remaining>0?remaining:(Number.isFinite(until)&&until>0?Math.max(0,until-Date.now()):0);
      const safeDelay=safeTimeoutMs(delay,0);
      battle.telegraph.until=Date.now()+safeDelay;battle.remainingResponseMs=0;
      clearPendingTurnTimer();pendingTimer=setTimeout(()=>{pendingTimer=null;resolveEnemyTelegraph();},safeDelay);
     }else if(battle.actor?.type==="enemy"){
      const queue=(battle.enemies||[]).filter(enemy=>enemy.alive===true&&Number(enemy.hp)>0);
      battle.enemyQueueState={indices:queue.map(enemy=>Number(enemy.index)).filter(Number.isFinite),cursor:0};
      battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;resumeEnemyTurnQueue(180);
     }
    }
    save();render();
   }break;
   case "buy-antidote":try{const c=live();if(!c?.run?.active)throw new Error("Противоядие можно купить только во время активного забега");if(selectedStage%13!==0)throw new Error("Противоядие здесь не требуется");engine.purchase(c.id,"silver","antidote");save();render();notify("Противоядие куплено · −15 серебра");}catch(error){notify(error.message);}break;
   case "heal-checkpoint":try{const result=engine.checkpointHeal(live().id);save();render();notify("HP восстановлено · −20% XP до этапа "+result.penaltyUntil);}catch(error){notify(error.message);}break;
   case "auto":try{if(!live().run.runModifierId)throw new Error("Сначала выбери модификатор забега");ensureCardDeck(live());syncEquipmentCards(live());const result=engine.autoBattle(live().id);selectedStage=live().progress.currentStage;save();render();notify("Авто-бой: "+result.cleared+" этапов · "+result.xp+" опыта · "+(result.cardsPlayed||0)+" карт · "+result.stopped);}catch(error){notify(error.message);}break;
   case "restart":try{engine.voluntaryRestart(live().id);selectedStage=1;screen="characters";battle=null;save();render();notify("Забег завершён добровольно · весь опыт сохранён");}catch(error){notify(error.message);}break;
   case "reset-talents":try{engine.resetTalents(live().id);save();render();notify("Таланты сброшены");}catch(error){notify(error.message);}break;
   case "revive":{try{const c=live(),result=engine.reviveFromDeath(c.id),stage=c.run.stage;battle={stage:stage.stage,count:stage.count,enemy:null,enemyHp:0,enemyMax:0,shield:0,turns:0,busy:false,isPlayerTurn:true,timerRemainingMs:0,timerStartedAt:0,remainingResponseMs:0,enemies:null,targetIndex:stage.targetIndex??stage.enemyIndex??0,comboStacks:0,skillCooldowns:{},counterReadyAt:0,ultimateReadyAt:0,comboProgress:{},attacksThisFight:0,distinctElements:[],buffsUsed:0,poisonDots:[],telegraph:null,paused:false,proc:null,fx:null,enemyQueueToken:0};loadBattleEnemy(stage.targetIndex??stage.enemyIndex??0);if(stage.uiBattleSnapshot){const snap=stage.uiBattleSnapshot;battle.enemies=snap.enemies;battle.comboStacks=snap.comboStacks;battle.skillCooldowns=snap.skillCooldowns;battle.comboProgress=snap.comboProgress;const ix=snap.targetIndex??stage.targetIndex??stage.enemyIndex??0;if(battle.enemies[ix]?.alive){engine.selectTarget(c.id,ix);battle.targetIndex=ix;battle.enemy=battle.enemies[ix];battle.enemyStats=engine.getEnemyStats(c.id,battle.stage,battle.enemy);battle.enemyHp=battle.enemy.hp;battle.enemyMax=battle.enemy.maxHp;battle.shield=battle.enemy.shield||0;}}screen="battle";startBattleStatusLoop();save();render();notify("Воскрешение · −"+result.price+" алмазов · 50% HP");}catch(error){notify(error.message);}break;}
    case "confirm-death":{const result=engine.confirmDeath(live().id);selectedId=live().id;selectedStage=live().progress.currentStage;screen="map";save();render();if(result.checkpointRestored)notify("Вы откатились к этажу "+result.checkpointStage+". Карты, найденные после босса, утеряны. Но ваша Коллекция пополнилась!");else notify("Забег сброшен · этап 1 · стартовая колода будет собрана заново");break;}
  }
 }
 root.addEventListener("pointerup",function(event){if(event.target.closest(".tb-v2"))event.stopImmediatePropagation();},true);
 root.addEventListener("pointerover",event=>{const option=event.target.closest("[data-branch-preview]");const panel=root.querySelector("#tbBranchDescription");if(option&&panel)panel.textContent=option.dataset.branchPreview;const card=event.target.closest("[data-card-play]");if(card)showCardDamagePreview(Number(card.dataset.cardPlay));});
 root.addEventListener("pointerdown",event=>{const card=event.target.closest("[data-card-play]");if(card)showCardDamagePreview(Number(card.dataset.cardPlay));},{passive:true});
 let activeCardDrag=null,lastCardTouchAt=0,suppressCardClickUntil=0;
 function cardDragPoint(event,touch){const point=touch?(event.touches?.[0]||event.changedTouches?.[0]):event;return point?{x:Number(point.clientX)||0,y:Number(point.clientY)||0}:null;}
 function startCardDrag(event,touch){const card=event.target?.closest?.("#tbRpg [data-card-play]");if(!card||card.disabled||!battle||battle.actor?.type!=="player"||battle.paused||battle.busy||battle.isCardAnimating)return;if(!touch&&Date.now()-lastCardTouchAt<700)return;if(touch){lastCardTouchAt=Date.now();}else if(event.button!==0)return;const point=cardDragPoint(event,touch);if(!point)return;activeCardDrag={card,index:Number(card.dataset.cardPlay),startX:point.x,startY:point.y,lastX:point.x,lastY:point.y,moved:false,touch};playSfx("card");try{if(navigator.vibrate)navigator.vibrate(10);}catch(_){} }
 function moveCardDrag(event,touch){if(!activeCardDrag||activeCardDrag.touch!==touch)return;const point=cardDragPoint(event,touch);if(!point)return;const drag=activeCardDrag,dx=point.x-drag.startX,dy=point.y-drag.startY;if(touch&&Math.abs(dx)>Math.abs(dy)*1.25&&!drag.moved&&drag.card.closest(".new-hand-row")){activeCardDrag=null;return;}if(touch)event.preventDefault();drag.lastX=point.x;drag.lastY=point.y;if(Math.abs(dx)+Math.abs(dy)>7&&!drag.moved){drag.moved=true;drag.card.classList.add("tb-card-dragging");drag.card.style.transition="transform 90ms ease-out";}if(drag.moved)drag.card.style.transform="translate3d("+dx+"px,"+(dy-7)+"px,0) scale(1.08)";}
 function finishCardDrag(event,touch,cancelled){if(!activeCardDrag||activeCardDrag.touch!==touch)return;const drag=activeCardDrag,point=cancelled?null:cardDragPoint(event,touch),dropY=point?.y??drag.lastY;activeCardDrag=null;if(!drag.moved)return;drag.card.classList.remove("tb-card-dragging");suppressCardClickUntil=Date.now()+450;if(!cancelled&&dropY<window.innerHeight*.5&&!drag.card.disabled){playCard(drag.index);return;}drag.card.classList.add("tb-card-return");drag.card.style.transition="transform 220ms cubic-bezier(.2,.8,.2,1)";drag.card.style.transform="translate3d(0,0,0) scale(1)";setTimeout(()=>{drag.card.classList.remove("tb-card-return");drag.card.style.removeProperty("transform");drag.card.style.removeProperty("transition");},240);}
 root.addEventListener("touchstart",event=>startCardDrag(event,true),{passive:false});document.addEventListener("touchmove",event=>moveCardDrag(event,true),{passive:false});document.addEventListener("touchend",event=>finishCardDrag(event,true,false),{passive:false});document.addEventListener("touchcancel",event=>finishCardDrag(event,true,true),{passive:true});
 root.addEventListener("mousedown",event=>startCardDrag(event,false));document.addEventListener("mousemove",event=>moveCardDrag(event,false));document.addEventListener("mouseup",event=>finishCardDrag(event,false,false));
 root.addEventListener("pointerover",event=>{const card=event.target.closest?.("[data-card-play]");if(event.pointerType==="mouse"&&card&&!card.contains(event.relatedTarget))playSfx("card");});
 root.addEventListener("focusin",event=>{const card=event.target.closest("[data-card-play]");if(card)showCardDamagePreview(Number(card.dataset.cardPlay));});
 root.addEventListener("focusout",event=>{const card=event.target.closest("[data-card-play]");if(card&&!card.contains(event.relatedTarget))clearCardDamagePreview();});
 root.addEventListener("pointerout",event=>{const card=event.target.closest("[data-card-play]");if(card&&!card.contains(event.relatedTarget))clearCardDamagePreview();});
 root.addEventListener("focusin",event=>{const option=event.target.closest("[data-branch-preview]");const panel=root.querySelector("#tbBranchDescription");if(option&&panel)panel.textContent=option.dataset.branchPreview;});
 root.addEventListener("pointerout",event=>{const option=event.target.closest("[data-branch-preview]");if(!option||option.contains(event.relatedTarget))return;const panel=root.querySelector("#tbBranchDescription"),c=live();if(panel&&c){const chosen=(classData(c).branches||[]).find(item=>item.id===c.branch);panel.textContent=chosen?specializationDescription(c.classId,chosen.id):"Нажми или наведи на ветку, чтобы прочитать её механику.";}});
 let cardLongPressTimer=null,cardLongPressTriggered=false;
 document.addEventListener("pointerdown",event=>{const card=event.target.closest("#tbRpg [data-card-play]");if(!card)return;cardLongPressTriggered=false;clearTimeout(cardLongPressTimer);cardLongPressTimer=setTimeout(()=>{cardLongPressTriggered=true;showCardInspect(Number(card.dataset.cardPlay));},480);},true);
 ["pointerup","pointercancel","pointerleave"].forEach(type=>document.addEventListener(type,()=>clearTimeout(cardLongPressTimer),true));
 document.addEventListener("click",event=>{if((cardLongPressTriggered||Date.now()<suppressCardClickUntil)&&event.target.closest("#tbRpg [data-card-play]")){event.preventDefault();event.stopImmediatePropagation();cardLongPressTriggered=false;suppressCardClickUntil=0;}},true);
 // Capture skip before other game-level pointer/click handlers can swallow it.
 document.addEventListener("click",event=>{
  const button=event.target?.closest?.('#tbRpg [data-action="skip-floors"]');
  if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(button.disabled)return;
  document.querySelector(".tb-skip-floors-overlay")?.remove();
  try{showSkipFloorsModal();}catch(error){console.error("[Towerbound] skip floors modal failed",error);notify("Не удалось открыть пропуск этажей: "+(error?.message||String(error)));}
 },true);
 document.addEventListener("click",handleClick);
 // Safety net for every in-game button, including navigation and controls without explicit save() calls.
 document.addEventListener("click",event=>{
  if(!event.target?.closest?.("#tbRpg button,.card-reward-overlay button,.tb-starter-deck-overlay button,.tb-relic-reward-overlay button,.tb-camp-overlay button,.tb-deck-viewer-overlay button,.tb-map-event-overlay button,.tb-loot-overlay button"))return;
  Promise.resolve().then(()=>{if(engine&&live())save();});
 });
  window.addEventListener("towerbound-auth-change",()=>{
  try{
   if(engine){
    const raw=localStorage.getItem("tb-rpg-v2"),restored=raw?JSON.parse(raw):null;
    if(restored&&Array.isArray(restored.characters)){
     for(const key of Object.keys(engine.state))delete engine.state[key];
     Object.assign(engine.state,restored);
     selectedId=engine.state.activeCharacterId||engine.state.characters[0]?.id||null;
     if(!engine.state.characters.some(character=>character.id===selectedId))selectedId=engine.state.characters[0]?.id||null;
    }
   }
  }catch(error){console.error("[Towerbound] auth restore hydration failed",error);}
  if(screen==="characters")render();
 });
 window.addEventListener("towerbound-cloud-restore",()=>{
  try{
   if(!engine)return;
   const raw=localStorage.getItem("tb-rpg-v2"),restored=raw?JSON.parse(raw):null;
   if(!restored||!Array.isArray(restored.characters))throw new Error("Восстановленное сохранение не содержит список персонажей");
   for(const key of Object.keys(engine.state))delete engine.state[key];
   Object.assign(engine.state,restored);
   selectedId=engine.state.activeCharacterId||engine.state.characters[0]?.id||null;
   if(!engine.state.characters.some(character=>character.id===selectedId))selectedId=engine.state.characters[0]?.id||null;
   if(screen==="battle"){stopBattleStatusLoop();clearPendingTurnTimer();battle=null;screen="map";}
   guildRaid=null;
   postBattleSummary=null;
   render();
   console.info("[Towerbound] cloud save applied without page reload");
  }catch(error){console.error("[Towerbound] cloud restore could not be applied in-place",error);}
 });
 document.addEventListener("pointerdown",unlockAudioAndMusic,{capture:true,passive:true});
 function handleBattleKeys(event){
  if(screen!=="battle"||!battle||battle.paused||event.repeat||event.ctrlKey||event.metaKey||event.altKey)return;
  const tag=event.target?.tagName?.toLowerCase();if(["input","textarea","select"].includes(tag)||event.target?.isContentEditable)return;
  if(event.key==="Tab"){event.preventDefault();const alive=battle.enemies.filter(enemy=>enemy.alive),at=alive.findIndex(enemy=>enemy.index===battle.targetIndex),next=alive[(at+1)%alive.length];if(next)setBattleTarget(next.index);return;}
  if(event.key==="Enter"){event.preventDefault();endTurnButton();return;}if(/^[1-6]$/.test(event.key)){event.preventDefault();const slot=Number(event.key);if(slot<=4){const skill=ensureLoadout(live())[slot-1];if(skill)playerAction(skill.id,slot-1);}else if(slot===5)useCounterSkill();else useUltimate();}
 }
 document.addEventListener("keydown",handleBattleKeys);
 root.addEventListener("change",event=>{
  const loadoutField=event.target.closest("[data-loadout-slot]");
  if(loadoutField&&live()){
   const c=live(),index=Number(loadoutField.dataset.loadoutSlot),skillId=loadoutField.value;
   if(c.run.stage){notify("Панель меняется только между этапами");render();return;}
   if(!Number.isInteger(index)||index<0||index>3){notify("Недопустимый слот");return;}
   const slots=ensureLoadout(c);
   if(skillId&&(!branchSkills(c).some(skill=>skill.id===skillId&&c.level>=skill.unlock_level)||slots.some((skill,i)=>i!==index&&skill?.id===skillId))){notify("Навык недоступен или уже назначен в другой слот");render();return;}
   const next=slots.map(skill=>skill?.id||null);next[index]=skillId||null;
   c.skillLoadout=next.filter(Boolean);save();render();return;
  }
  const field=event.target.closest("[data-setting]");if(!field||!live())return;
  const key=field.dataset.setting,value=field.type==="checkbox"?field.checked:field.type==="number"?Math.max(1,Math.min(120,Number(field.value)||1)):field.type==="range"?Number(field.value):field.value;
  try{
   if(key==="difficulty"){engine.setDifficulty(live().id,value);notify("Сложность изменена");}
   else engine.saveSettings({[key]:value});
   if(key==="clean_ui")document.body.classList.toggle("tb-clean-ui",!!value);
   if(key==="music_enabled"||key==="volume_music"||key==="volume_master")syncMusic();
   save();render();
  }catch(error){notify(error.message);render();}
 });
 function pauseForFocusLoss(){if(battle?.guildRaid)return;if((engine.state.account.settings||{}).auto_pause_on_blur===false)return;if(screen==="battle"&&battle&&!battle.paused){battle.paused=true;clearPendingTurnTimer();battle.timerRemainingMs=0;battle.timerStartedAt=0;if(battle.telegraph)battle.remainingResponseMs=Math.max(0,(battle.telegraph.until||Date.now())-Date.now());save();render();}}
 document.addEventListener("visibilitychange",()=>{if(document.hidden)pauseForFocusLoss();});window.addEventListener("blur",pauseForFocusLoss);
 window.addEventListener("pagehide",()=>{try{if(engine&&live()){engine.publishGhostSnapshot(live().id,"exit");save();window.TowerboundCloud?.flushSave?.();}}catch(error){console.warn("Ghost snapshot on exit failed",error);}});
 function boot(){
  if(!window.TowerboundReworkReady)return;
  window.TowerboundReworkReady.then(async value=>{
   if(!value)return;
   if(window.TowerboundCloudReady)await window.TowerboundCloudReady; // Resolves on local auth bootstrap; remote save hydration no longer blocks engine startup.
   else await new Promise(resolve=>{let settled=false;const done=()=>{if(settled)return;settled=true;resolve();};window.addEventListener('towerbound-cloud-ready',done,{once:true});setTimeout(done,18000);});
   engine=value;balance=engine.balance;
   // The engine may have been constructed from an empty local cache before cloud auth finished.
   // Rehydrate its existing state object after the authoritative cloud restore has completed.
   try{const raw=localStorage.getItem('tb-rpg-v2'),restored=raw?JSON.parse(raw):null;if(restored&&Array.isArray(restored.characters)){for(const key of Object.keys(engine.state))delete engine.state[key];Object.assign(engine.state,restored);}}catch(error){console.error('[Towerbound] post-cloud engine hydration failed',error);}
   const unlockedBefore=Array.isArray(engine.state.account?.unlockedCards)?engine.state.account.unlockedCards.length:0;unlockedCardIds();if(engine.state.account.unlockedCards.length!==unlockedBefore)save();window.TowerboundLevelUpModal=(level,points)=>{if(!window.__TB_BALANCE_TEST_MODE)showLevelUpModal(level,points);};
   skills=[]; // Card-first combat: legacy skill catalogue is not loaded into the active UI.
   let active=null;
   if(engine.state.characters.length){
    selectedId=engine.state.activeCharacterId||engine.state.characters[0].id;
    active=engine.state.characters.find(character=>character.id===selectedId);
    if(active?.run?.stage){
     const repaired=engine.sanitizeActiveStage(active.id);
     if(repaired.processed?.length||repaired.completed){save();console.info("[Towerbound] repaired saved combat state",repaired);}
     if(repaired.completed)notify("Сохранённый бой завершён · награды начислены, возвращаемся на карту");
    }
    screen="characters";
   }
   document.body.classList.toggle("tb-clean-ui",!!engine.state.account.settings?.clean_ui);
   render();
   if(Number(active?.run?.pendingEchoStage)>0)showEchoOfPastScreen(active,active.run.pendingEchoStage);
   if(active?.pendingCardReward?.length)showCardRewardScreen(active.pendingCardReward);
  }).catch(error=>console.error("Towerbound rework UI failed",error));
 }
 boot();
 window.TowerboundReworkUI={showMap:()=>{stopBattleStatusLoop();clearPendingTurnTimer();if(battle)battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;battle=null;guildRaid=null;screen="map";render();save();},canStartGuildRaid:()=>!!engine&&!!live()&&!battle&&!live()?.run?.stage,startGuildRaid};
 if(window.__TB_BALANCE_TEST_MODE){
  const balanceSnapshot=()=>{const c=live();return JSON.parse(JSON.stringify({screen,selectedStage,character:c||null,battle:battle||null,postBattleSummary:postBattleSummary||null}));};
  const allocateBalanceTalents=()=>{
   const c=live();if(!c||!c.branch)return 0;
   const branch=(classData(c).branches||[]).find(item=>item.id===c.branch);if(!branch)return 0;
   let available=Math.max(0,(Number(c.talentPoints)||0)-Object.values(c.talents||{}).reduce((sum,value)=>sum+(Number(value)||0),0)),spent=0;
   const priorities=["attack","health","defense","card_draw","critical"];
   for(const effect of priorities)for(const talent of branch.talents||[]){
    if(talent.effect_template!==effect)continue;
    while(available>0&&(Number(c.talents?.[talent.id])||0)<Math.min(3,Number(talent.max_rank)||3)){
     engine.useTalentPoint(c.id,talent.id,3);available--;spent++;
    }
   }
   return spent;
  };
  window.TowerboundBalanceQA={
   createCharacter:(name,classId)=>{
    if(!engine)throw new Error("Game engine is not ready");
    if(engine.state.characters.length)throw new Error("A balance attempt must use a fresh isolated browser context");
    selectedClass=classId;const created=engine.createCharacter(name,classId);selectedId=created.id;engine.state.activeCharacterId=created.id;
    screen="map";selectedStage=1;ensureCardDeck(live());syncEquipmentCards(live());const character=live();character.run.mapEvents=character.run.mapEvents&&typeof character.run.mapEvents==="object"?character.run.mapEvents:{};for(let stage=1;stage<=balance.map.total_stages;stage++){if(stage%balance.map.boss_every===0||Object.prototype.hasOwnProperty.call(character.run.mapEvents,stage))continue;character.run.mapEvents[stage]=gameRandom()<.2?["altar","chest","wanderer"][Math.floor(gameRandom()*3)]:null;}save();return created.id;
   },
   chooseBranch:(branchId)=>{
    const c=live();if(!c)throw new Error("Character is missing");
    engine.chooseBranch(c.id,branchId,0);const cardsAdded=grantSpecializationCards(c,branchId);save();return{branch:c.branch,cardsAdded};
   },
   chooseBestRunModifier:()=>{const c=live();if(!c)return null;const options=engine.runModifierOptions(c.id)||[];const score=m=>(Number(m.player_damage_multiplier||1)-1)*2-(Number(m.enemy_damage_multiplier||1)-1)*2-(Number(m.all_enemies_shield_fraction)||0)*1.5+(Number(m.low_hp_damage_multiplier||1)-1)*1.5+(Number(m.reward_xp_multiplier||1)-1)*.2+(Number(m.elite_loot_multiplier||1)-1)*.1+(Number(m.skill_cooldown_multiplier||1)<1?.15:0);const best=options.slice().sort((x,y)=>score(y)-score(x))[0];if(!best)return null;engine.setRunModifier(c.id,best.id);return best.id;},
   chooseBestRunModifier:()=>{const c=live();if(!c)return null;const options=engine.runModifierOptions(c.id)||[];const score=m=>(Number(m.player_damage_multiplier||1)-1)*2-(Number(m.enemy_damage_multiplier||1)-1)*2-(Number(m.all_enemies_shield_fraction)||0)*1.5+(Number(m.low_hp_damage_multiplier||1)-1)*1.5+(Number(m.reward_xp_multiplier||1)-1)*.2+(Number(m.elite_loot_multiplier||1)-1)*.1+(Number(m.skill_cooldown_multiplier||1)<1?.15:0);const best=options.slice().sort((x,y)=>score(y)-score(x))[0];if(!best)return null;engine.setRunModifier(c.id,best.id);return best.id;},
   allocateTalents:allocateBalanceTalents,
   startStage:(stage)=>{
    if(battle)throw new Error("Previous battle is still active");
    const c=live();if(!c)throw new Error("Character is missing");
    selectedStage=Number(stage)||Number(c.progress.currentStage)||1;routeChoice="standard";beginStage();
    return balanceSnapshot();
   },
   setTarget:(index)=>{setBattleTarget(Number(index));return battle?.targetIndex??null;},
   playCard:(index)=>{if(!battle||battle.actor?.type!=="player")return false;resolveCardPlay(Number(index));return !!battle;},
   endTurn:()=>{if(!battle||battle.actor?.type!=="player")return false;endPlayerTurn();return !!battle;},
   prepareSpecialization:(branchId,targetLevel=10)=>{
    const c=live();if(!c)throw new Error("Character is missing");
    const level=Math.max(10,Math.min(100,Number(targetLevel)||10));
    const required=Array.from({length:level-1},(_,index)=>engine.requiredXp(index+1)).reduce((sum,value)=>sum+value,0);
    c.xp=Math.max(Number(c.xp)||0,required);engine.recalcLevel(c);
    if(c.level<10)throw new Error("Unable to prepare level 10 specialization test");
    if(c.branch&&c.branch!==branchId)throw new Error("Character already has a different branch");
    if(!c.branch){engine.chooseBranch(c.id,branchId,0);grantSpecializationCards(c,branchId);}
    ensureCardDeck(c);syncEquipmentCards(c);allocateBalanceTalents();
    c.progress.currentStage=1;c.progress.highestEver=0;c.progress.checkpoints=[];
    c.run.active=false;c.run.stage=null;c.run.snapshot=null;c.run.experience=0;c.run.foundItemIds=[];c.run.playerHp=engine.maxHp(c);
    save();render();return{level:c.level,branch:c.branch,talentPoints:c.talentPoints,spent:Object.values(c.talents||{}).reduce((sum,value)=>sum+value,0),deckSize:c.deck.length,hp:c.run.playerHp,maxHp:engine.maxHp(c)};
   },
   canBasicAttack:()=>!!battle&&battle.actor?.type==="player"&&!battle.playerSkillUsed&&!battle.busy&&!battle.paused,
   basicAttack:()=>{if(!battle||battle.actor?.type!=="player"||battle.playerSkillUsed)return false;basicAttack();return !!battle?.playerSkillUsed;},
   useCounter:()=>{if(!battle||battle.actor?.type!=="player")return false;const before=!!battle.counterPrimed;useCounterSkill();return !before&&!!battle?.counterPrimed;},
   canCounter:()=>{const c=live();if(!c||!battle)return false;const counter=counterAbility(c),cost=c.classId==="duelist"?(balance.resources.class_costs?.duelist?.counter??18):(counter.resource_cost??balance.resources.action_costs.counter);return !battle.playerSkillUsed&&!battle.counterPrimed&&(battle.counterCooldownTurns||0)<=0&&Number(c.resource)>=cost;},
   useUltimate:()=>{if(!battle||battle.actor?.type!=="player")return false;const before=!!battle.playerSkillUsed;useUltimate();return !before&&!!battle?.playerSkillUsed;},
   canUltimate:()=>{const c=live();if(!c||!battle)return false;const ultimate=ultimateAbility(c),cost=c.classId==="duelist"?(balance.resources.class_costs?.duelist?.ultimate??42):(ultimate.resource_cost??balance.resources.action_costs.ultimate);return !battle.playerSkillUsed&&(battle.ultimateCooldownTurns||0)<=0&&Number(c.resource)>=cost;},
   usePotion:()=>{
    const c=live();if(!c||!battle||battle.actor?.type!=="player"||battle.potionUsedThisTurn)return false;
    const potion=(c.bag||[]).find(item=>item.type==="healing_potion"&&Number(item.quantity)>0);if(!potion)return false;
    const before=Number(c.run.playerHp)||0;try{engine.useHealingPotion(c.id,potion.id);applyTreePotionHealing(c,before);battle.potionUsedThisTurn=true;return true;}catch(error){return false;}
   },
   claimBestRelic:()=>{
    const c=live(),choices=postBattleSummary?.relicChoices||c?.run?.pendingRelicChoices||[];
    if(!c||!choices.length)return null;
    const rank=id=>({steel_heart:9,phoenix_feather:8,scholar_lens:8,lucky_coin:7,bloodstone:7,assassin_blade:7,war_drums:6,mirror_shard:6,arcane_prism:6,frost_sigil:6,greed:2,hunter_mark:2}[id]||4);
    const choice=choices.slice().sort((a,b)=>rank(b.id)-rank(a.id))[0];try{return engine.claimRelic(c.id,choice.id);}catch(error){return null;}
   },
   useCampRest:(stage)=>{const c=live();if(!c)return null;try{return engine.useCampRest(c.id,Number(stage));}catch(error){return null;}},
   buyAntidote:(stage)=>{selectedStage=Number(stage);const c=live();if(!c||!c.run.active||selectedStage%13!==0)return false;try{engine.purchase(c.id,"silver","antidote");return true;}catch(error){return false;}},
   useCheckpointHeal:()=>{const c=live();if(!c||c.run.stage)return null;try{return engine.checkpointHeal(c.id);}catch(error){return null;}},
   resolveMapEvent:(stage)=>{selectedStage=Number(stage);const c=live(),type=eventTypeForStage(c,Number(stage));if(!c||!type||c.run.completedMapEvents?.includes(Number(stage)))return null;const overlay=document.createElement("div");overlay.className="tb-map-event-overlay";overlay.dataset.eventType=type;overlay.dataset.eventStage=String(stage);document.body.appendChild(overlay);const hpRatio=Number(c.run.playerHp)/Math.max(1,engine.maxHp(c)),choice=type==="chest"?"open":type==="altar"?(hpRatio>.08?"pray":"leave"):Number(c.silver)>=50&&hpRatio<.85?"pay":"attack";let antidotePurchased=false;if(type==="wanderer"&&choice==="attack"&&Number(stage)%13===0&&c.run.active&&!(c.bag||[]).some(item=>item.type==="antidote"&&Number(item.quantity||1)>0)){try{engine.purchase(c.id,"silver","antidote");antidotePurchased=true;}catch(error){}}resolveMapEventChoice(choice);return{type,choice,antidotePurchased,cleared:Number(c.progress.currentStage)>Number(stage),battle:!!battle};},
   confirmDeath:()=>{const c=live();if(!c)return null;const result=engine.confirmDeath(c.id);battle=null;postBattleSummary=null;screen="map";selectedStage=c.progress.currentStage;save();return result;},
   confirmDeath:()=>{const c=live();if(!c)return null;const result=engine.confirmDeath(c.id);battle=null;postBattleSummary=null;screen="map";selectedStage=c.progress.currentStage;save();return result;},
   clearPostBattle:()=>{postBattleSummary=null;document.querySelector(".card-reward-overlay")?.remove();const c=live();if(c?.pendingCardReward)c.pendingCardReward=null;save();return true;},
   inspect:()=>{
    const c=live(),cardView=card=>({id:card.id,name:card.name,type:card.type,cost:Number(card.cost)||0,effects:cardEffects(card),isUpgraded:!!card.isUpgraded,exhaust:!!card.exhaust,retain:!!card.retain});
    return{
     screen,selectedStage,
     character:c?{id:c.id,name:c.name,classId:c.classId,level:c.level,xp:c.xp,talentPoints:c.talentPoints,branch:c.branch,talents:{...(c.talents||{})},hp:Number(c.run?.playerHp)||0,maxHp:engine.maxHp(c),currentStage:c.progress?.currentStage||1,highestEver:c.progress?.highestEver||0,runActive:!!c.run?.active,runStage:c.run?.stage?.stage||null,lives:c.run?.lives||0,silver:c.silver||0,deckSize:(c.deck||[]).length,hand:(c.hand||[]).map(cardView),discardSize:(c.discard||[]).length,potions:(c.bag||[]).filter(item=>item.type==="healing_potion").reduce((sum,item)=>sum+(Number(item.quantity)||0),0),gear:(c.gear||[]).filter(Boolean).map(item=>({name:item.name,rarity:item.rarity,slot:item.slot,itemLevel:item.itemLevel,stats:item.stats})),relics:(c.relics||[]).slice(),itemsFound:c.stats?.items_found||0,kills:c.stats?.kills||0,bossKills:c.stats?.boss_kills||0,stageSnapshot:c.run?.stage?.uiBattleSnapshot||null}:null,
     battle:battle?{stage:battle.stage,actorType:battle.actor?.type||null,round:battle.round||1,busy:!!battle.busy,paused:!!battle.paused,energy:c?.currentEnergy||0,cardBlock:battle.cardBlock||0,cardsPlayedThisTurn:battle.cardsPlayedThisTurn||0,targetIndex:battle.targetIndex,enemies:(battle.enemies||[]).map(enemy=>({index:enemy.index,name:enemy.name||enemy.mobId||enemy.role,type:enemy.type,role:enemy.role,hp:enemy.hp,maxHp:enemy.maxHp,alive:enemy.alive,poison:enemy.poison||0,bleed:enemy.bleed||0,weak:enemy.weak||0,vulnerable:enemy.vulnerable||0,intent:enemy.intent||null,phase:enemy.phase||1})),combatLog:(battle.combatLog||[]).slice(-20)}:null,
     summary:postBattleSummary?{ready:!!postBattleSummary.ready,stage:postBattleSummary.stage,xp:postBattleSummary.xp,silver:postBattleSummary.silver,loot:(postBattleSummary.loot||[]).map(item=>({name:item.name,type:item.type,rarity:item.rarity,disposition:item.disposition})),relicChoices:(postBattleSummary.relicChoices||[]).map(item=>({id:item.id,name:item.name}))}:null
    };
   },
   snapshot:balanceSnapshot,
   cardDatabase:()=>CARD_DATABASE,
   engine:()=>engine
  };
 }
 window.skipCardReward=skipCardReward;
 window.TowerboundCards={database:CARD_DATABASE,generateReward:generateCardReward,showReward:showCardRewardScreen,addToDeck:(id)=>addCardToDeck(live(),id),upgrade:(instanceId)=>{const ok=upgradeCardInDeck(live(),instanceId);if(ok){save();render();}return ok;},guildSnapshot:()=>{const c=live();if(!c)return null;ensureCardDeck(c);return {character:{id:c.id,name:c.name,classId:c.classId,level:c.level,branch:c.branch, specialization:c.specialization,deck:JSON.parse(JSON.stringify(c.deck||[])),hand:JSON.parse(JSON.stringify(c.hand||[])),discard:JSON.parse(JSON.stringify(c.discard||[])),gear:JSON.parse(JSON.stringify(c.gear||[])),relics:JSON.parse(JSON.stringify(c.relics||[])),talents:JSON.parse(JSON.stringify(c.talents||{})),silver:c.silver},stats:JSON.parse(JSON.stringify(engine.getCombatStats(c)||{}))};}};
})();