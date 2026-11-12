(function(){
 "use strict";
 const root=document.getElementById("tbRpg");
 if(!root)return;
 const turnStyle=document.createElement("style");turnStyle.id="tb-turn-based-style";turnStyle.textContent=".tb-turn-initiative{padding:9px 12px;border:1px solid rgba(201,162,39,.45);border-radius:10px;background:rgba(12,17,24,.88);display:grid;gap:7px}.tb-turn-initiative>b{font:800 10px system-ui;letter-spacing:.12em;color:#e8cc82}.tb-initiative-list{display:flex;gap:6px;overflow:auto}.tb-initiative-list>span{flex:none;display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border:1px solid #5a5140;border-radius:7px;font:700 10px system-ui;color:#ddd;white-space:nowrap}.tb-initiative-list>span.player{border:2px solid #f0c65e;color:#ffe6a1;background:rgba(111,78,24,.2)}.tb-initiative-list>span.enemy{border-color:#9d5a52;color:#f2b5a9}.tb-initiative-list>span.active{box-shadow:0 0 0 2px #f0d17a;background:rgba(240,209,122,.12)}.tb-initiative-avatar{display:block;width:23px;height:23px;flex:0 0 23px;object-fit:contain;border:2px solid #ffd66b;border-radius:50%;background:#17130d}.tb-initiative-mob{display:grid;place-items:center;width:20px;height:20px;flex:0 0 20px;border:1px solid #a65d54;border-radius:50%;background:#351c1d;color:#f5b7a9;font-style:normal}.tb-initiative-label{padding:0!important;border:0!important;background:none!important}.tb-end-turn{width:100%;height:58px;min-height:54px;max-height:64px;padding:0 12px;line-height:1;border:2px solid #ffd66b;border-radius:12px;background:linear-gradient(180deg,#f6ad35,#b85a12);box-shadow:0 5px 18px #d9792444;color:#201205;font-size:14px;font-weight:1000;letter-spacing:.08em}.tb-end-turn:disabled{opacity:.52;filter:grayscale(1);box-shadow:none}.tb-end-turn.is-player-turn{animation:tb-end-pulse 2s ease-in-out infinite}.tb-panel-actions{display:grid;gap:8px}.tb-panel-slots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.tb-telegraph.lethal{border:2px solid #ff394d;background:rgba(100,10,20,.8);color:#fff}.tb-arena-top{display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap} .tb-turn-guidance{font:700 12px/1.35 system-ui;color:#f5e7c2;text-align:center;padding:2px 6px}.tb-turn-tutorial{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:#05070bdc;backdrop-filter:blur(8px)}.tb-turn-tutorial-card{width:min(100%,440px);padding:24px;border:1px solid #d2aa58;border-radius:18px;background:linear-gradient(155deg,#22283a,#101522);box-shadow:0 24px 80px #000b;color:#f5ecd8}.tb-turn-tutorial-card h2{margin:8px 0 16px;font:900 23px system-ui}.tb-turn-tutorial-card ol{padding-left:22px;display:grid;gap:13px;font:600 14px/1.5 system-ui}.tb-turn-tutorial-card li::marker{color:#f3bd53}.tb-turn-tutorial-card .tb-wide{margin-top:14px}@keyframes tb-end-pulse{0%,100%{box-shadow:0 5px 18px #d9792444}50%{box-shadow:0 5px 24px #ffb53c99}}";document.head.appendChild(turnStyle);
 const lootCombatStyle=document.createElement("style");lootCombatStyle.id="tb-loot-combat-style";lootCombatStyle.textContent=".tb-basic-attack{min-height:64px;border:2px solid #ffe08a!important;background:linear-gradient(155deg,#f4c45f,#a96b21)!important;color:#251706!important;box-shadow:0 4px 16px #e3a33b55!important}.tb-basic-attack b{font-size:13px;letter-spacing:.08em}.tb-basic-attack small{color:#402b11!important}";document.head.appendChild(lootCombatStyle);
 const artInboxStyle=document.createElement("style");
 artInboxStyle.id="tb-art-inbox-style-v1";
 artInboxStyle.textContent=`
  #tbRpg .tb-hero-art img,#tbRpg .tb-mini-avatar img,#tbRpg .tb-character-card img,#tbRpg .tb-profile-avatar img,#tbRpg .tb-hero-chip img,#tbRpg .tb-char-art img,#tbRpg .tb-class-picker img{display:block;max-width:100%;max-height:100%;object-fit:contain!important;object-position:center center!important}
  #tbRpg .tb-enemy-portrait{display:flex;align-items:center;justify-content:center;width:100%;height:clamp(108px,19vw,150px);max-height:150px;min-width:0;overflow:hidden;margin:2px auto 8px;border-radius:12px;background:radial-gradient(ellipse at 50% 46%,#343650 0%,#151a2b 72%);border:1px solid #b9a2e52b}
  #tbRpg .tb-enemy-portrait img{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain!important;object-position:center bottom!important;filter:drop-shadow(0 5px 10px #000b)}
  #tbRpg .tb-target-art-wrap{display:flex;align-items:center;justify-content:center;width:100%;height:clamp(48px,10vw,76px);max-height:150px;min-width:0;overflow:hidden}
  #tbRpg .tb-target-art{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain!important;object-position:center center!important;filter:drop-shadow(0 3px 6px #0009)}
  #tbRpg .tb-target-card{min-width:0}
 `;
 artInboxStyle.textContent += `
  /* Transparent character PNGs: never paint a rectangular backdrop behind alpha pixels. */
  #tbRpg img[src*="/characters/"],#heroChoices img[src*="/characters/"],#enemies img[src*="/characters/"],
  #tbRpg .tb-hero-art img,#tbRpg .tb-mini-avatar img,#tbRpg .tb-character-card img,
  #tbRpg .tb-profile-avatar img,#tbRpg .tb-hero-chip img,#tbRpg .tb-char-art img,
  #tbRpg .tb-class-picker img,#heroChoices .tb-hero-portrait img,
  #enemies .tb-character-sprite,.tb-visible-hero,.tb-visible-enemy {
    background:transparent!important;
    background-color:transparent!important;
  }
  #phaser-arena, #phaser-arena canvas { background:transparent!important; }
 `;
 artInboxStyle.id="tb-transparent-character-art-v1";
 document.head.appendChild(artInboxStyle);
 const CHARACTER_ART_ROOT="./assets/characters/";
 const classPortraits={assassin:"heroes/image-Photoroom.png",bishop:"heroes/image 2-Photoroom(1).png",dragonkin:"heroes/image 3-Photoroom.png",destroyer:"heroes/image 4-Photoroom.png",elemental:"heroes/image 5-Photoroom.png",shaman:"heroes/image 6-Photoroom.png",duelist:"heroes/image 7-Photoroom.png"};
 const mobPortraits={"swamp-reaper":"enemies/image 2.png","cursed-knight":"enemies/image 3.png","shadow-goblin":"enemies/image 4.png","phantom-duelist":"enemies/image 5.png","abyss-knight":"enemies/image 6.png","ash-wolf":"enemies/image 7.png","rune-golem":"enemies/image 8.png","crimson-executioner":"enemies/image 9.png","plague-witch":"enemies/image 10.png","ash-imp":"enemies/image 11.png","forest-horror":"enemies/image 12.png","bone-warden":"enemies/image 13.png","spider-matron":"enemies/image 14.png","soul-harvester":"enemies/image 15.png","void-hunter":"enemies/image 16.png","blind-monk":"enemies/image 17.png","stone-minotaur":"enemies/image 18.png","cursed-alchemist":"enemies/image 20.png","root-colossus":"enemies/image.png","grave-archer":"enemies/image 4.png"};
 const rolePortraits={healer:"enemies/image 17.png",poison:"enemies/image 10.png",tank:"enemies/image 8.png",normal:"enemies/image 4.png"};
 const bossPortraitsById={"mirror-executioner":"bosses/mirror-executioner.png","ash-patriarch":"bosses/image 3.png","ice-abbot":"bosses/image 4.png","crimson-regent":"bosses/image 11.png","heart-of-tower":"bosses/image 12.png"};
 const bossPortraits=Object.values(bossPortraitsById);
 const chapterBackgrounds=["image 2.jpeg","image 3.jpeg","image 4.jpeg","image 5.jpeg","image.jpeg"];
 function chapterBackgroundPath(stage){const floor=Math.max(1,Math.min(250,Number(stage)||1));return "./assets/chapters/"+chapterBackgrounds[Math.floor((floor-1)/50)];}
 const relicArtFiles={head:"image 2.png",chest:"image 3.png",ring:"image 4.png",accessory:"image 4.png",amulet:"image 6.png",weapon:"image 10.png",hands:"image 12.png",potion:"image 5.png",scroll:"image 9.png",redGem:"image 7.png",blueGem:"image 8.png",potionStack:"image 14.png",bundle:"image 18.png"};
 function relicArtPath(item,slot){
  const parts=[item?.type,item?.id,item?.name,item?.slot,slot,item?.category,item?.kind].filter(Boolean).join(" ").toLowerCase().replace(/[_-]/g," ");
  if(parts.includes("craft material")||parts.includes("material")||parts.includes("материал")||parts.includes("craft"))return "image 15.png";
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
 function relicIconHtml(item,slot,extraClass){return '<img class="tb-relic-icon '+(extraClass||"")+'" src="./assets/relics/'+relicArtPath(item,slot)+'" alt="" loading="lazy" decoding="async">';}
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
  if(equipment)return relicIconHtml(item,item?.slot);
  const value=String(item?.type||item?.id||item?.name||"").toLowerCase();
  let icon="";
  if(value.includes("craft_material")||value.includes("craft material")||value.includes("материал")||value.includes("enhancement_stone")||value.includes("enhancement stone")||value.includes("камень усиления"))icon="support-orb";
  else if(value.includes("helmet")||value.includes("helm")||value.includes("шлем"))icon="support-helmet";
  else if(value.includes("coin")||value.includes("silver")||value.includes("монет")||value.includes("сереб"))icon="support-purse";
  else if(value.includes("boot")||value.includes("shoe")||value.includes("обув")||value.includes("сапог"))icon="support-boot";
  else if(value.includes("shield")||value.includes("щит"))icon="support-shield";
  else if(value.includes("orb")||value.includes("crystal")||value.includes("сфер")||value.includes("крист"))icon="support-orb";
  return icon?'<span class="tb-support-icon '+icon+'" aria-hidden="true"></span>':relicIconHtml(item);
 }
 const classFallback={assassin:"Ас",bishop:"Еп",dragonkin:"Др",destroyer:"Ра",elemental:"Ма",duelist:"Ду",shaman:"Ша"};
 const tabs=[["stats","Характеристики"],["talents","Таланты"],["skills","Умения"],["gear","Коллекция"],["bag","Рюкзак"],["craft","Крафт"],["account","Аккаунт"],["speedrun","Спидран"]];
 const SKILL_UPGRADE_LEVELS=Object.freeze({1:1,2:20,3:50});
 let pendingSkillUpgradeId=null;
 let engine=null,balance=null,skills=[],screen="characters",profileTab="stats",shopTab="silver";
 let selectedId=null,selectedClass="assassin",selectedStage=1,dialogOpen=false,battle=null,postBattleSummary=null,bagFilter="all",collectionTab="collection",selectedItemId=null,collectionSelection=null,pendingBranchId=null,toastTimer=null,toastMessage="",preferredSpeed2=localStorage.getItem("tb-rpg-speed-v2")==="2",pendingTimer=null,statusTimer=null,audioContext=null,musicNodes=null,routeChoice="standard",onlineLeaderboardRows=[],onlineLeaderboardError="",onlineBusy=false;
 function esc(value){return String(value===undefined||value===null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
 const itemTypeNames={healing_potion:"Зелье исцеления",craft_material:"Материал для крафта",enhancement_stone:"Камень усиления",refine_stone:"Камень заточки",chisel:"Долото",enchant_scroll:"Свиток зачарования"};
 function itemTypeName(value){return itemTypeNames[value]||String(value||"Предмет").replace(/_/g," ");}
 function itemDisplayName(item){
  if(!item)return itemTypeName("");
  let name=String(item.name||itemTypeName(item.type));
  const rarityPrefixes={"Обычная":["Обычный ","Обычная "],"Редкая":["Редкий ","Редкая "],"Эпическая":["Эпический ","Эпическая "],"Легендарная":["Легендарный ","Легендарная "],"Богоподобная":["Богоподобный ","Богоподобная "]};
  for(const prefix of rarityPrefixes[item.rarity]||[]){if(name.startsWith(prefix)){name=name.slice(prefix.length);break;}}
  name=name.replace(/\s*[·•]\s*(head|helmet|helm|chest|weapon|legs|hands|accessory)\s*$/i,"");
  return name||itemTypeName(item.type);
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
 function save(){try{
  const c=live();
  if(c?.run?.stage&&battle){
   c.run.stage.uiBattleSnapshot={enemies:JSON.parse(JSON.stringify(battle.enemies||[])),targetIndex:battle.targetIndex,round:battle.round||1,comboStacks:battle.comboStacks||0,skillCooldowns:JSON.parse(JSON.stringify(battle.skillCooldowns||{})),comboProgress:JSON.parse(JSON.stringify(battle.comboProgress||{}))};
  }
  localStorage.setItem("tb-rpg-v2",JSON.stringify(engine.state));window.TowerboundCloud?.queueSave?.();window.TowerboundOnline?.queuePublish();
 }catch(e){notify("Не удалось сохранить: "+e.message);}}
 function notify(message){toastMessage=message;const el=root.querySelector(".tb-toast");if(el){el.textContent=message;el.classList.add("show");}clearTimeout(toastTimer);toastTimer=setTimeout(()=>{const x=root.querySelector(".tb-toast");if(x)x.classList.remove("show");},3200);}
 function button(action,label,attrs){return '<button type="button" data-action="'+action+'" '+(attrs||"")+'>'+label+'</button>';}
 function header(title,sub){const mapHeader=title==="Карта 250 уровней";return '<header class="tb-header"><div class="tb-brand"><img class="game-logo" src="./assets/icons/image.png" alt="TowerBound" decoding="async"></div>'+(mapHeader?'':'<div class="tb-header-side">'+(live()?'<span class="tb-mini-avatar" aria-hidden="true"><img src="'+portrait(live().classId)+'" alt=""></span>':'')+'<span class="tb-subline">'+esc(sub||"")+'</span></div>')+'</header>';}

 function characterList(){
  const chars=engine.state.characters;
  const selected=chars.find(c=>c.id===selectedId)||chars[0];
  const cloud=window.TowerboundCloud,authenticated=!!cloud?.signedIn;
  if(selected&&!selectedId)selectedId=selected.id;
  const emptyContent=authenticated
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
 function dailyChallengeLeaderboard(){
  try{const rows=JSON.parse(localStorage.getItem("tb-daily-challenge-leaderboard-v1")||"[]");return Array.isArray(rows)?rows:[];}catch(_){return [];}
 }
 function saveDailyChallengeResult(c){
  const date=c.run.dailyChallengeDate||dailyChallengeDate(),rows=dailyChallengeLeaderboard();
  rows.push({date,name:c.name,className:clsName(c),stage:Number(postBattleSummary?.stage)||0,xp:Number(postBattleSummary?.xp)||0,at:Date.now()});
  rows.sort((a,b)=>b.stage-a.stage||b.xp-a.xp||a.at-b.at);
  try{localStorage.setItem("tb-daily-challenge-leaderboard-v1",JSON.stringify(rows.slice(0,50)));}catch(error){console.warn("Daily challenge leaderboard storage failed",error);}
  c.run.dailyChallengeActive=false;c.run.dailyChallengeCompletedDate=date;
  notify("Ежедневный вызов завершён · результат добавлен в локальный рейтинг");
 }
 function dailyChallengeLeaderboardMarkup(){
  const rows=dailyChallengeLeaderboard().slice(0,5);
  return '<section class="tb-daily-challenge-board"><h3>ЛОКАЛЬНЫЙ РЕЙТИНГ · ЕЖЕДНЕВНЫЙ ВЫЗОВ</h3>'+(rows.length?rows.map((row,index)=>'<div class="tb-daily-challenge-row"><b>#'+(index+1)+' '+esc(row.name)+'</b><span>'+esc(row.className)+' · этап '+row.stage+' · '+row.xp+' XP</span></div>').join(""):'<small>Пока нет завершённых вызовов.</small>')+'</section>';
 }
 function mapScreen(){
  const c=live();if(!c)return characterList();
  const daily=engine.dailySnapshot(c.id),chapter=engine.chapterForStage(selectedStage||c.progress.currentStage),modifierChoices=engine.runModifierOptions(c.id),weekly=engine.weeklySnapshot(c.id);
  const chest=engine.dailyChestSnapshot(c.id),chestMinutes=Math.ceil(chest.remainingMs/60000),chestLabel=chest.available?"🎁 СУНДУК · ГОТОВ":"🎁 СУНДУК · "+Math.floor(chestMinutes/60)+"ч "+(chestMinutes%60)+"м";
  const cp=c.progress.currentStage-1,healReady=balance.map.checkpoints.includes(cp)&&c.run.healingPenaltyUntil<c.progress.currentStage&&c.run.checkpointHeals<balance.healing.max_checkpoint_heals_per_run,trapStage=selectedStage%13===0,antidotes=(c.bag||[]).filter(x=>x.type==="antidote").reduce((n,x)=>n+(x.quantity||1),0);
  const penalty=(c.run.healingPenaltyFrom||0)>0&&c.progress.currentStage>=(c.run.healingPenaltyFrom||0)&&c.progress.currentStage<=c.run.healingPenaltyUntil;
  const remaining=penalty?c.run.healingPenaltyUntil-c.progress.currentStage+1:0;
  const maxAuto=c.progress.highestEver-balance.auto_battle.highest_ever_offset;
  if(!selectedStage||selectedStage>c.progress.highestEver+1)selectedStage=c.progress.currentStage;
  let nodes="";
  for(let stage=1;stage<=balance.map.total_stages;stage++){
   const accessible=stage<=c.progress.highestEver+1,cleared=stage<=c.progress.highestEver;
   const isBoss=stage%balance.map.boss_every===0;
   const selected=stage===selectedStage;
   nodes+='<button type="button" class="tb-map-node '+(cleared?"cleared ":"")+(selected?"selected ":"")+(isBoss?"boss":"")+'" data-stage="'+stage+'" '+(!accessible?"disabled":"")+'><strong>'+(isBoss?"♛":cleared?"✓":stage)+'</strong><small>'+(isBoss?"БОСС":cleared?"ПРОЙДЕН":"ЭТАП")+'</small><small class="tb-map-power">Рек. Мощь: '+Math.round(500+stage*150)+'</small></button>';
  }
  return header("Карта 250 уровней",c.name+" · "+clsName(c)+" · Ур. "+c.level)+
   '<section class="tb-map-screen" style="background-image:linear-gradient(180deg,#090c18dd,#090c18aa),url('+chapterBackgroundPath(selectedStage).replace(/ /g,"%20")+');background-size:cover;background-position:center"><div class="tb-map-top"><div class="tb-map-identity"><b>'+esc(c.name)+'</b><small>'+esc(clsName(c))+' · '+esc(classData(c).resource)+': '+c.resource+'/'+c.resourceMax+'</small></div><div class="tb-currency"><span>◈ '+c.silver+' серебра</span><span>◆ '+engine.state.account.diamonds+' алмазов</span><span>Мощь '+engine.combatPower(c)+'</span><span>♥ Жизни: '+(c.run.lives||balance.difficulty.modes[c.difficulty||balance.difficulty.default].lives)+'/'+balance.difficulty.modes[c.difficulty||balance.difficulty.default].lives+'</span></div></div>'+
   '<div class="tb-progressline"><span>Наивысший этап: <b>'+c.progress.highestEver+'/250</b></span><span>Следующий: <b>'+Math.min(c.progress.currentStage,250)+'</b></span><span>Чекпоинты: <b>'+c.progress.checkpoints.join(" · ")+'</b></span></div>'+
   (penalty?'<div class="tb-penalty">−20% ОПЫТА АКТИВНО · ОСТАЛОСЬ '+remaining+' ЭТАЖЕЙ</div>':"")+
   '<aside class="tb-stage-panel tb-stage-toolbar"><div class="tb-stage-identity"><div class="tb-eyebrow">ВЫБРАННЫЙ ЭТАП · '+selectedStage+'</div><strong>'+(selectedStage%balance.map.boss_every===0?"БОСС":"ГАУНТЛЕТ")+'</strong><small>'+(selectedStage%balance.map.boss_every===0?"Один босс, отдельное сражение":balance.map.gauntlet_ranges.find(r=>selectedStage>=r.min&&selectedStage<=r.max)?.allowed.join(" / ")+" противника подряд")+'</small></div><div class="tb-route-choice"><button data-route="standard" class="'+(routeChoice==="standard"?"active":"")+'" aria-pressed="'+(routeChoice==="standard")+'">Обычный путь</button><button data-route="elite" class="'+(routeChoice==="elite"?"active":"")+'" aria-pressed="'+(routeChoice==="elite")+'">Элитка + сундук</button></div><button class="tb-primary tb-stage-start" data-action="start" id="start">НАЧАТЬ</button><button type="button" class="tb-daily-challenge-button" data-action="daily-challenge">ЕЖЕДНЕВНЫЙ ВЫЗОВ · ВСЕ ВРАГИ ЭЛИТНЫЕ · XP ×2</button><details class="tb-stage-more"><summary>Дополнительно</summary><div class="tb-small-actions">'+button("auto","АВТО-БОЙ ДО "+Math.max(0,maxAuto),maxAuto>=c.progress.currentStage?"":"disabled")+button("heal-checkpoint","ХИЛ +50% HP · −20% XP",healReady?"":"disabled")+button("restart","НАЧАТЬ ЗАНОВО","")+(trapStage?button("buy-antidote","КУПИТЬ ПРОТИВОЯДИЕ · 15 СЕРЕБРА",c.silver<15?"disabled":""):"")+'</div><small class="tb-note">'+(trapStage?"⚠ ЛОВУШКА · требуется противоядие":"Без ловушки")+(antidotes?" · Противоядий: "+antidotes:"")+(selectedStage<=c.progress.highestEver?" · Повторное прохождение · 50% XP":" · Первое прохождение · 100% XP")+'. Авто-бой доступен до '+Math.max(0,maxAuto)+' этапа и остановится на боссах и элитках.</small></details></aside><div class="tb-map-layout"><div class="tb-map-scroll"><div class="tb-map-grid">'+nodes+'</div></div></div>'+
   '<section class="tb-chapter-card" style="background-image:linear-gradient(90deg,#0b1020ed,#0b102080),url(\''+(chapter?.background||"")+'\')"><div class="tb-eyebrow">ГЛАВА '+(chapter?.id||1)+' / 5 · ЭТАПЫ '+(chapter?.stages?.join("–")||"1–50")+'</div><h2>'+esc(chapter?.name||"Порог семи печатей")+'</h2><p>'+esc(chapter?.lore||"")+'</p></section>'+
    '<section class="tb-run-modifier-panel"><div class="tb-daily-heading"><div><div class="tb-eyebrow">НОВЫЙ ЗАБЕГ</div><h3>Выбери модификатор · 1 из 3</h3></div><span>◆ '+engine.state.account.diamonds+' алмазов</span></div>'+(c.run.active?'<p>Активен: '+esc((balance.run_modifiers.modifiers.find(x=>x.id===c.run.runModifierId)||{}).name||"без модификатора")+'</p>':modifierChoices.map(m=>'<button data-run-modifier="'+m.id+'" class="'+(c.run.runModifierId===m.id?"active":"")+'"><b>'+esc(m.name)+'</b><small>'+esc(m.description)+'</small></button>').join(""))+'</section>'+
    dailyChallengeLeaderboardMarkup()+
    '<div class="tb-bottom-strip"><span>Персонаж сохраняет уровень, таланты, экипировку и серебро</span><span>'+(c.heroic?"ГЕРОИЧЕСКИЙ РЕЖИМ":"Обычный режим")+'</span></div></section>';
 }
 function branchSkills(c){return skills.filter(skill=>skill.class_id===c.classId&&skill.branch_id===c.branch).slice(0,balance.skills.skills_per_branch||10);}
 function resolveSkill(c,skillId){
  const base=(classData(c).base_skills||[]).find(skill=>skill.id===skillId);
  const catalog=skills.find(skill=>skill.id===skillId&&skill.class_id===c.classId);
  const source=base||catalog;
  if(!source)return null;
  const effect=balance.skill_effects[source.effect_template]||balance.skill_effects.strike||{};
  const unlockLevel=Number.isFinite(Number(source.unlock_level))?Number(source.unlock_level):1;
  const damage=Number(source.damage??source.damage_multiplier??effect.damage_multiplier??effect.heal_multiplier??effect.power_multiplier??0)||0;
  const cost=Number(source.cost??source.resource_cost??effect.resource_cost??balance.resources.action_costs.attack_skill??0)||0;
  const skill={...source,unlock_level:unlockLevel,damage,cost,damage_multiplier:Number(source.damage_multiplier??source.damage??effect.damage_multiplier??1)||1,resource_cost:cost};
  if(skill.class_id&&skill.class_id!==c.classId)return null;
  if(skill.branch_id&&skill.branch_id!==c.branch)return null;
  return skill;
 }
 function getSkillStats(character,skill){
  const effect=balance.skill_effects[skill.effect_template]||balance.skill_effects.strike||{},saved=character.skillUpgrades?.[skill.id]||{},level=Math.max(1,Math.min(3,Number(saved.level)||1)),type=saved.type==="cost"||saved.type==="power"?saved.type:null,stacks=level-1;
  const baseCost=character.classId==="duelist"?(balance.resources.class_costs?.duelist?.attack_skill??1):(skill.cost??skill.resource_cost??effect.resource_cost??balance.resources.action_costs.attack_skill??0);
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
   const presets={click:{wave:"triangle",from:720,to:500,duration:0.045,level:0.12},hit:{wave:"sawtooth",from:155,to:58,duration:0.11,level:0.2},crit:{wave:"square",from:620,to:170,duration:0.19,level:0.24},hurt:{wave:"sawtooth",from:105,to:42,duration:0.17,level:0.22}};
   const p=presets[kind]||presets.click,ctx=audioContext,now=ctx.currentTime;
   const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=p.wave;osc.frequency.setValueAtTime(p.from,now);osc.frequency.exponentialRampToValueAtTime(Math.max(25,p.to),now+p.duration);
   gain.gain.setValueAtTime(0.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(0.0002,volume*p.level),now+0.008);gain.gain.exponentialRampToValueAtTime(0.0001,now+p.duration);
   osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+p.duration+0.02);
   if(kind==="crit"){const chime=ctx.createOscillator(),cg=ctx.createGain();chime.type="sine";chime.frequency.setValueAtTime(980,now);chime.frequency.exponentialRampToValueAtTime(440,now+0.16);cg.gain.setValueAtTime(0.0001,now);cg.gain.exponentialRampToValueAtTime(volume*0.09,now+0.01);cg.gain.exponentialRampToValueAtTime(0.0001,now+0.16);chime.connect(cg);cg.connect(ctx.destination);chime.start(now);chime.stop(now+0.17);}
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
  battle.isPlayerTurn=true;battle.timerRemainingMs=0;battle.timerStartedAt=0;
  battle.actor={type:"player",id:"player",name:live().name};battle.busy=false;battle.playerSkillUsed=false;battle.potionUsedThisTurn=false;battle.counterPrimed=false;battle.counterConsumed=false;battle.counterAction=null;
  for(const id of Object.keys(battle.skillCooldowns||{}))battle.skillCooldowns[id]=Math.max(0,battle.skillCooldowns[id]-1);
  battle.counterCooldownTurns=Math.max(0,(battle.counterCooldownTurns||0)-1);battle.ultimateCooldownTurns=Math.max(0,(battle.ultimateCooldownTurns||0)-1);
  const preview=(battle.enemies||[]).find(enemy=>enemy.alive);
  battle.telegraph=preview?{type:"strong_hit",targetIndex:preview.index,label:"ВРАГ ГОТОВИТ АТАКУ · ЗАВЕРШИ ХОД",icon:"⚔",color:"#ff465e"}:null;
 }
 function addSummonedBossMobs(){
  if(battle.bossAddsSummoned)return;const c=live();battle.bossAddsSummoned=true;
  for(let n=0;n<2;n++){const index=battle.enemies.length,role=n===0?"poison":"normal",mob={index,type:"normal",role,weakness:null,resistance:null,statMultiplier:1},stats=engine.getEnemyStats(c.id,battle.stage,mob),hp=stats.hp;c.run.stage.mobs.push(mob);battle.enemies.push({...mob,id:"boss-add-"+index,hp,maxHp:hp,alive:true,shield:0,pendingAttack:false,turnsTaken:0,speed:1});}
  battle.count=battle.enemies.length;notify("Босс призвал двух прислужников");
 }
 function updateBossPhase(){
  if(!battle||battle.enemy?.type!=="boss")return 1;
  const phase=engine.bossPhaseInfo(battle.enemyHp,battle.enemyMax).phase;
  if(phase!==battle.bossPhase){
   battle.bossPhase=phase;battle.phaseFlashUntil=Date.now()+1000;battle.phaseNotice="ФАЗА "+phase;
   if(phase===2)addSummonedBossMobs();
   if(phase===4){
    const phaseConfig=(balance.bosses.phases||[]).find(item=>Number(item.phase)===4)||{};
    const deadline=Math.max(1,Number(phaseConfig.player_turn_deadline??balance.bosses.player_turn_deadline??2));
    battle.bossDeadlineTurns=(battle.playerTurnCount||0)+deadline;
   }
  }
  return phase;
 }
 function applyEnemyHit(attacker,raw){
  if(!battle||!attacker||attacker.alive!==true||Number(attacker.hp)<=0){if(attacker){attacker.alive=false;attacker.dead=true;attacker.hp=0;attacker.pendingAttack=false;}return;}
  const c=live(),phase=attacker.type==="boss"?engine.bossPhaseInfo(attacker.hp,attacker.maxHp).phase:0;
  if(battle.counterPrimed&&!battle.counterConsumed&&(battle.counterTargetIndex===undefined||battle.counterTargetIndex===attacker.index)){
   battle.counterConsumed=true;battle.counterPrimed=false;battle.counterTargetIndex=battle.telegraph?.targetIndex;
   const reflected=applyTargetDamage(attacker,raw,"physical");notify("100% отражение · "+reflected.dealt+" урона");
   if(reflected.killed){battle.telegraph=null;battle.enemy=attacker;battle.targetIndex=attacker.index;engine.selectTarget(c.id,attacker.index);finishCurrentEnemy();}
   return;
  }
  const branchCounterChance=c.classId==="dragonkin"&&c.branch==="ice_dragon"?.4:c.classId==="duelist"&&c.branch==="rapier"?.45:0,parryChance=Math.max(branchCounterChance,Number(battle.parryChance)||0);battle.parryChance=0;if(parryChance>0&&Math.random()<parryChance){const iceCounter=c.classId==="dragonkin",riposte=Math.max(1,Math.round(engine.getCombatStats(c).dps*(iceCounter?.75:1.2))),counter=applyTargetDamage(attacker,riposte,iceCounter?"ice":"physical");notify((iceCounter?"ЛЕДЯНАЯ ЗАЩИТА":"ПАРИРОВАНИЕ")+" · КОНТРАТАКА −"+counter.dealt+" HP");if(counter.killed){battle.telegraph=null;battle.enemy=attacker;battle.targetIndex=attacker.index;engine.selectTarget(c.id,attacker.index);finishCurrentEnemy();return;}return;}
  let incoming=Math.max(0,Math.round(raw*engine.mitigationMultiplier(engine.getCombatStats(c).defense,battle.stage)));
  if((battle.enemyDamageReductionTurns||0)>0)incoming=Math.round(incoming*(1-(battle.enemyDamageReduction||0)));
  if((battle.nextDamageShield||0)>0){incoming=Math.max(0,incoming-battle.nextDamageShield);battle.nextDamageShield=0;}
  c.run.playerHp=Math.max(0,c.run.playerHp-incoming);notify("Враг наносит "+incoming+" урона");
  if(incoming>0){if(navigator.vibrate)navigator.vibrate(50);showFloatingText("player","-"+incoming,"#ff596b");playSfx("hurt");if(!settings().disable_screen_shake&&incoming>=Math.max(1,Math.round(engine.maxHp(c)*.1)))battle.shakeUntil=Date.now()+280;}
  triggerVfx("enemy-hit","physical",phase===4||attacker.type==="boss");
  if(c.run.playerHp<=0)endFromDamage();
 }
 function enemyTurn(enemy){
  if(!battle||!enemy||enemy.alive!==true||Number(enemy.hp)<=0){if(enemy){enemy.alive=false;enemy.dead=true;enemy.hp=0;enemy.pendingAttack=false;enemy.pendingAction=null;}return;}
  const c=live();enemy.turnsTaken=(enemy.turnsTaken||0)+1;enemy.pendingAttack=false;
  if(enemy.type==="boss"){
   battle.bossTurns=(battle.bossTurns||0)+1;
   if(battle.bossTurns>15){c.run.playerHp=0;notify("ЯРОСТЬ БОССА · Время вышло");endFromDamage();return;}
  }
  if(battle.enemyStunned){battle.enemyStunned=false;notify("Враг оглушён · ход пропущен");return;}
  if(enemy.role==="healer"&&enemy.provoked){enemy.provoked=false;notify("Лекарь атакует в ответ на полученный урон");}
  else if(enemy.role==="healer"&&enemy.turnsTaken%2===0){
   const ally=battle.enemies.filter(x=>x.alive&&x.hp>0&&x.index!==enemy.index&&x.hp<x.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
   if(ally){const amount=Math.round(ally.maxHp*.2);ally.hp=Math.min(ally.maxHp,ally.hp+amount);if(ally.index===battle.targetIndex)battle.enemyHp=ally.hp;notify("Лекарь восстановил "+amount+" HP союзнику");}
  }
  if(enemy.role==="tank"&&enemy.pendingCleanseDebuff){enemy.pendingCleanseDebuff=false;enemy.debuffKind=null;battle.dot=null;notify("Танк очищает яд/кровотечение вместо установки щита");}
  else if(enemy.role==="tank"&&enemy.turnsTaken%3===0)enemy.guardCharges=1;
  if(enemy.role==="poison"){battle.poisonStacks=(battle.poisonStacks||0)+1;notify("ОТРАВЛЕН · Яд: "+battle.poisonStacks+" стак.");}
  const stats=engine.getEnemyStats(c.id,battle.stage,enemy);
  battle.telegraph=null;
  applyEnemyHit(enemy,stats.damage);
 }
 function clearPendingTurnTimer(){if(pendingTimer!==null){clearTimeout(pendingTimer);pendingTimer=null;}}
 function safeTimeoutMs(value,fallback=1000){
  const parsed=Number(value);
  return Number.isFinite(parsed)?Math.max(0,Math.min(60000,Math.round(parsed))):fallback;
 }
 function scheduleEnemyTurnQueue(queue,index,token,delay){
  clearPendingTurnTimer();
  const safeDelay=Math.max(16,safeTimeoutMs(delay,1000));
  if(battle){battle.timerRemainingMs=safeDelay;battle.timerStartedAt=Date.now();}
  pendingTimer=setTimeout(()=>{
   pendingTimer=null;
   if(battle){battle.timerRemainingMs=0;battle.timerStartedAt=0;}
   runEnemyTurnQueue(queue,index,token);
  },safeDelay);
 }
 function recoverPlayerTurn(error){
  console.error("Towerbound battle recovered after turn error",error);
  if(!battle)return;
  clearPendingTurnTimer();battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;
  battle.isPlayerTurn=true;battle.timerRemainingMs=0;battle.timerStartedAt=0;
  battle.busy=false;battle.isPlayerTurn=true;battle.timerRemainingMs=0;battle.timerStartedAt=0;
  battle.actor={type:"player",id:"player",name:live()?.name||"Игрок"};battle.telegraph=null;
  notify("Ошибка хода противника · управление возвращено игроку");
  try{save();render();}catch(renderError){console.error("Battle recovery render failed",renderError);}
 }
 function advanceToPlayerTurn(){
  if(!battle)return;
  clearPendingTurnTimer();battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;
  battle.busy=false;battle.actor={type:"player",id:"player",name:live().name};battle.telegraph=null;
  showPlayerTurn();save();render();
 }
 function runEnemyTurnQueue(queue,index,token){
  if(!battle||screen!=="battle"||token!==battle.enemyQueueToken)return;
  battle.isPlayerTurn=false;
  try{
   if(battle.paused){scheduleEnemyTurnQueue(queue,index,token,250);return;}
   if(index>=queue.length){
    battle.playerTurnCount=(battle.playerTurnCount||0)+1;battle.round=(battle.round||1)+1;
    const deadlineBoss=(battle.enemies||[]).find(enemy=>enemy.type==="boss"&&enemy.alive&&Number(enemy.hp)>0);
    if(deadlineBoss&&battle.bossDeadlineTurns!==null&&battle.bossDeadlineTurns!==undefined&&battle.playerTurnCount>Number(battle.bossDeadlineTurns)&&engine.bossPhaseInfo(deadlineBoss.hp,deadlineBoss.maxHp).phase===4){
     const phaseConfig=(balance.bosses.phases||[]).find(item=>Number(item.phase)===4)||{};
     const enrageDamage=Math.max(0,Number(phaseConfig.damage_flat??balance.bosses.damage_flat)||0);
     const c=live();c.run.playerHp=Math.max(0,c.run.playerHp-enrageDamage);
     notify("ЯРОСТЬ БОССА · "+enrageDamage+" урона · время вышло");showFloatingText("player","-"+enrageDamage,"#ff596b");endFromDamage();return;
    }
    if((battle.poisonStacks||0)>0){
     const c=live(),tick=Math.round(engine.maxHp(c)*.05*battle.poisonStacks);
     c.run.playerHp=Math.max(0,c.run.playerHp-tick);
     if(c.run.playerHp<=0){endFromDamage();return;}
    }
    if((battle.playerDamageBuffTurns||0)>0)battle.playerDamageBuffTurns--;
    if((battle.enemyDamageReductionTurns||0)>0)battle.enemyDamageReductionTurns--;
    advanceToPlayerTurn();return;
   }
   const enemy=queue[index];
   if(enemy&&enemy.alive===true&&Number(enemy.hp)>0)enemyTurn(enemy);
   else if(enemy){enemy.alive=false;enemy.dead=true;enemy.hp=0;enemy.pendingAttack=false;enemy.pendingAction=null;}
   if(!battle)return;
   save();render();
   const nextIndex=queue.findIndex((candidate,i)=>i>index&&candidate.alive===true&&Number(candidate.hp)>0);
   if(nextIndex<0){scheduleEnemyTurnQueue([],0,token,500);return;}
   scheduleEnemyTurnQueue(queue,nextIndex,token,500);
  }catch(error){recoverPlayerTurn(error);}
 }
 function endPlayerTurn(){
  if(!battle||battle.actor?.type!=="player"||battle.paused)return;
  try{
  battle.isPlayerTurn=false;clearPendingTurnTimer();battle.busy=false;
  const c=live(),stats=engine.getCombatStats(c);
  if(!battle.playerSkillUsed){
   const damage=Math.max(1,Math.round(stats.dps*(balance.combat.turn_based?.auto_attack_dps_multiplier||.5)+(c.classId==="destroyer"&&c.branch==="wand_shield"?stats.defense*.5:0))),hit=applyTargetDamage(battle.enemy,damage,"physical");
   c.resource=Math.min(c.resourceMax,c.resource+Math.max(1,Math.round(c.resourceMax*(balance.combat.turn_based?.resource_regeneration_fraction||.2))));
   triggerVfx("attack","physical",false);showFloatingText("player","Автоатака!","#ffd34e");if(hit.killed){finishCurrentEnemy();if(!battle)return;}
  }
  if(battle.dot?.ticks>0){
   const target=battle.enemies.find(x=>x.index===battle.targetIndex&&x.alive);
   if(target){applyTargetDamage(target,battle.dot.damage,"dark");battle.dot.ticks--;if(target.hp<=0){finishCurrentEnemy();if(!battle)return;}}
  }
  if(battle.hot?.ticks>0){c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+battle.hot.heal);battle.hot.ticks--;}
  const queue=(battle.enemies||[]).filter(enemy=>enemy.alive&&Number(enemy.hp)>0);
  if(!queue.length){advanceToPlayerTurn();return;}
  battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;const queueToken=battle.enemyQueueToken;
  battle.busy=true;battle.actor={type:"enemy",id:"enemy-phase",name:"Ход противников"};
  battle.telegraph=null;notify("Противники атакуют...");save();render();
  scheduleEnemyTurnQueue(queue,0,queueToken,500);
  }catch(error){recoverPlayerTurn(error);}
 }
 function endTurnButton(){endPlayerTurn();}

 function humanSkillDescription(value){return String(value||'').replace(/class_identity/gi,'особенность класса').replace(/fire_dragon/gi,'Огненный дракон').replace(/ice_dragon/gi,'Ледяной дракон').replace(/black_dragon/gi,'Чёрный дракон').replace(/Огненный дракон specialization skill/gi,'Умение специализации Огненный дракон').replace(/Ледяной дракон specialization skill/gi,'Умение специализации Ледяной дракон').replace(/Чёрный дракон specialization skill/gi,'Умение специализации Чёрный дракон').replace(/([a-z_]+) specialization skill/gi,(_,key)=>'умение специализации '+key.replace(/_/g,' ')).replace(/\s+/g,' ').trim();}
 const talentEffectLabels={attack:'Атака',health:'Здоровье',critical:'Крит',defense:'Защита',attack_speed:'Скорость',crit:'Крит'};
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
    parts.push("Стоимость: "+cost+" ресурса","Откат: "+(cooldown?cooldown+" хода":"нет"));
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
   attack_speed:{value:Number(values.attack_speed_per_rank||0)*100,label:"к скорости атаки",unit:"%",detail:"Ускоряет темп атак и помогает чаще использовать доступные действия."},
   skill_power:{value:Number(values.skill_power_per_rank||0)*100,label:"к силе умений",unit:"%",detail:"Усиливает урон и полезные эффекты боевых умений."}
  };
  const spec=specs[key];
  if(!spec)return "Усиливает уникальную механику выбранной специализации. Текущий ранг: "+rank+"/"+(talent.max_rank||3)+".";
  const fmt=value=>Number(value.toFixed(2)).toString().replace(/\.0$/,"");
  return "Каждый ранг даёт +"+fmt(spec.value)+spec.unit+" "+spec.label+". Текущий бонус: +"+fmt(spec.value*rank)+spec.unit+". "+spec.detail;
}

 function accountAuthPanel(){const cloud=window.TowerboundCloud,signed=!!cloud?.signedIn,session=cloud?.session,status=cloud?.status?.()||{text:'Подключение к Supabase…'};if(signed)return '<section class="tb-account-auth"><h3>Облачный аккаунт</h3><p class="tb-account-status is-online">✓ Синхронизировано</p><small>'+esc(session?.user?.email||'Аккаунт подключён')+' · '+esc(status.text||'')+'</small><div class="tb-account-actions"><button data-action="account-sync">СИНХРОНИЗИРОВАТЬ СЕЙЧАС</button><button data-action="account-logout">ВЫЙТИ</button></div></section>';return '<section class="tb-account-auth"><h3>Вход в игровой аккаунт</h3><p>Войди или создай аккаунт, чтобы синхронизировать прогресс.</p><label>Логин<input id="tbAccountLogin" type="text" autocomplete="username" autocapitalize="none" placeholder="Логин"></label><label>Пароль<input id="tbAccountPassword" type="password" autocomplete="current-password" placeholder="Пароль"></label><label class="tb-account-remember"><input id="tbAccountRemember" type="checkbox" checked> Запомнить меня</label><div class="tb-account-actions"><button data-action="account-login">ВОЙТИ</button><button data-action="account-register">ЗАРЕГИСТРИРОВАТЬСЯ</button></div><small class="tb-account-message" aria-live="polite">'+esc(status.text||'Локальное сохранение')+'</small><small class="tb-account-hint">Если у вас еще нет аккаунта, нажмите «Зарегистрироваться».</small></section>';}
 function availableSkillForUpgrade(c,id){const def=classData(c),base=(def.base_skills||[]).find(skill=>skill.id===id),branch=skills.find(skill=>skill.id===id&&skill.class_id===c.classId&&(!skill.branch_id||skill.branch_id===c.branch));return base||branch||null;}
 function profileScreen(){
  const c=live();if(!c)return characterList();
  const def=classData(c),branch=(def.branches||[]).find(b=>b.id===c.branch),stats=balance.classes.base_stats,combatStats=engine.getCombatStats(c),gearSlotNames=["Оружие","Нагрудник","Шлем","Поножи","Перчатки","Аксессуар"],gearSlotKeys=["weapon","chest","head","legs","hands","accessory"];
  const equippedRarities=(c.gear||[]).filter(Boolean).map(item=>item.rarity),rarityFrame=(c.gear||[]).length===6&&(c.gear||[]).every(Boolean)&&new Set(equippedRarities).size===1?({"Эпическая":"tb-rarity-frame-epic","Легендарная":"tb-rarity-frame-legendary","Богоподобная":"tb-rarity-frame-godlike"}[equippedRarities[0]]||""):"";
  const spent=Object.values(c.talents||{}).reduce((a,b)=>a+b,0),free=Math.max(0,c.talentPoints-spent);
  let body="";
  if(profileTab==="stats"){
   const gearStats=(c.gear||[]).reduce((a,i)=>{if(i&&i.stats)Object.keys(i.stats).forEach(k=>a[k]=(a[k]||0)+i.stats[k]);return a;},{});
   body='<div class="tb-stat-grid tb-character-stats"><div class="tb-stat-row"><small class="tb-stat-name">УРОВЕНЬ</small><b class="tb-stat-value">'+c.level / 1+'</b></div><div class="tb-stat-row"><small class="tb-stat-name">БОЕВАЯ МОЩЬ</small><b class="tb-stat-value">'+engine.combatPower(c)+'</b></div><div class="tb-stat-row"><small class="tb-stat-name">ЗДОРОВЬЕ</small><b class="tb-stat-value">'+engine.maxHp(c)+'</b></div><div class="tb-stat-row"><small class="tb-stat-name">АТАКА</small><b class="tb-stat-value">'+combatStats.attack+'</b></div><div class="tb-stat-row"><small class="tb-stat-name">ЗАЩИТА</small><b class="tb-stat-value">'+combatStats.defense+'</b></div><div class="tb-stat-row"><small class="tb-stat-name">КРИТ</small><b class="tb-stat-value">'+Math.round(combatStats.critChance*100)+'%</b></div><div class="tb-stat-row"><small class="tb-stat-name">РЕСУРС</small><b class="tb-stat-value">'+esc(def.resource)+' '+c.resource+'/'+c.resourceMax+'</b></div><div class="tb-stat-row"><small class="tb-stat-name">ОПЫТ</small><b class="tb-stat-value">'+c.xp+'</b></div><div class="tb-stat-row"><small class="tb-stat-name">СЕРЕБРО</small><b class="tb-stat-value">'+c.silver+'</b></div></div><div class="tb-class-summary"><b>Сильные стороны</b><span>'+esc((def.strengths||[]).join(" · "))+'</span><b>Слабые стороны</b><span>'+esc((def.weaknesses||[]).join(" · "))+'</span></div><div class="tb-branch-panel"><h3>Специализация</h3>'+(c.branch?'<b>'+esc(branch?.name||c.branch)+'</b><p>'+esc(branch?.theme||"")+'</p>':'<p>Выбери ветку на 10 уровне персонажа.</p>')+'<div class="tb-branch-options">'+(def.branches||[]).map(b=>'<button data-branch="'+b.id+'" data-branch-preview="'+esc(specializationDescription(c.classId,b.id))+'" title="'+esc(specializationDescription(c.classId,b.id))+'" '+(c.level<10?"disabled":"")+' class="'+((pendingBranchId===b.id||(!pendingBranchId&&c.branch===b.id))?"active":"")+'">'+esc(b.name)+(c.branch===b.id?" ✓":pendingBranchId===b.id?" · ВЫБРАНО ДЛЯ ПОДТВЕРЖДЕНИЯ":"")+'</button>').join("")+'</div><p class="tb-branch-description" id="tbBranchDescription" aria-live="polite">'+(pendingBranchId?esc(specializationDescription(c.classId,pendingBranchId)):branch?esc(specializationDescription(c.classId,branch.id)):"Нажми на ветку, чтобы предварительно выбрать её и прочитать механику.")+'</p>'+(pendingBranchId&&pendingBranchId!==c.branch?'<div class="tb-branch-confirm"><button class="tb-primary" data-action="confirm-branch">ПОДТВЕРДИТЬ ВЫБОР</button><button data-action="cancel-branch">ОТМЕНА</button></div>':'')+'<small>Первая специализация на 10 уровне бесплатна. Смена ветки стоит '+balance.classes.respec_cost+' серебра.</small></div>';
  }else if(profileTab==="talents"){
   body='<div class="tb-talent-head"><div><h3>Древо талантов</h3><p>Свободные очки: <b>'+free+'</b></p></div><button data-action="reset-talents" '+(spent===0?"disabled":"")+'>'+ 'СБРОС · '+balance.classes.talent_reset_cost+' серебра</button></div>';
   if(c.level<10)body+='<div class="tb-lock">Ветка талантов откроется на 10 уровне.</div>';
   else if(!branch)body+='<div class="tb-lock">Сначала выбери специализацию во вкладке «Характеристики».</div>';
   else body+='<div class="tb-talent-grid">'+branch.talents.map(t=>{const rank=Number(c.talents[t.id]||0),maxRank=Number(t.max_rank)||3;return '<div class="tb-talent"><span class="tb-talent-icon sprite-icon '+talentSpriteClass(t.effect_template)+'" aria-hidden="true"></span><div><b>'+esc(t.name)+'</b><small>'+esc('Повышает '+talentEffectLabel(t.effect_template))+' · Ранг '+rank+'/'+maxRank+'</small><p class="tb-talent-description">'+esc(talentBonusDescription(t,rank))+'</p></div><button data-talent="'+t.id+'" '+(free<=0||rank>=maxRank?"disabled":"")+' >＋</button></div>';}).join("")+'</div>';
  }else if(profileTab==="skills"){
   const base=(def.base_skills||[]).map(x=>({...x,branch:"Базовые"})).concat((def.passives||[]).map(x=>({...x,type:"passive",branch:"Пассивные"})));
   const branchSkills=(c.branch?skills.filter(x=>x.class_id===c.classId&&x.branch_id===c.branch):[]).map(x=>({...x,type:x.type||(x.is_active===false?"passive":"active"),branch:(def.branches||[]).find(br=>br.id===x.branch_id)?.name||x.branch_id||"Специализация"}));
   const available=base.concat(branchSkills).filter((item,index,list)=>list.findIndex(other=>other.id===item.id)===index).sort((x,y)=>(Number(x.unlock_level)||1)-(Number(y.unlock_level)||1));
   const active=activeSkill(c),chosen=new Set(Array.isArray(c.activeSkills)?c.activeSkills:(c.skillLoadout||[]));
   body='<section class="tb-skill-screen-rebuilt"><h3>Умения персонажа</h3><p class="tb-skill-current">Активное умение на арене: <b>'+esc(active?.name||"не выбрано")+'</b></p><div class="tb-skill-list-rebuilt">'+available.map(s=>{const detail=profileSkillDetails(s,c),unlockLevel=Number(s.unlock_level)||1,unlocked=c.level>=unlockLevel,selected=chosen.has(s.id),lockedText="Откроется на "+unlockLevel+" уровне",isPassive=s.type==="passive"||s.is_active===false,typeLabel=isPassive?"Пассивное":"Активное",up=getSkillStats(c,s),next=up.level+1,rankHtml=unlocked&&!isPassive?'<div class="tb-skill-upgrade-row"><span class="tb-skill-upgrade-rank">'+up.level+'/3</span>'+(next<=3?(c.level>=SKILL_UPGRADE_LEVELS[next]?'<button type="button" class="tb-skill-upgrade-open" data-skill-upgrade-open="'+esc(s.id)+'">УЛУЧШИТЬ</button>':'<small class="tb-skill-upgrade-locked">Откроется на уровне '+SKILL_UPGRADE_LEVELS[next]+'</small>'):'<span class="tb-skill-upgrade-max">МАКСИМУМ</span>')+'</div>':'';return '<article class="tb-skill-entry-rebuilt '+(unlocked?"unlocked":"locked")+'"><span class="tb-skill-entry-icon" aria-hidden="true">'+(unlocked?"✦":"🔒")+'</span><div class="tb-skill-entry-copy"><b>'+esc(s.name)+'</b><small>Ветка: '+esc(s.branch)+' · '+typeLabel+'</small><p>'+(unlocked?esc(detail):lockedText)+'</p>'+rankHtml+'</div>'+(unlocked?(isPassive?'<span class="tb-skill-entry-status">ПАССИВНОЕ</span>':'<button type="button" data-select-skill="'+s.id+'" '+(selected?"disabled":"")+'>'+(selected?"ВЫБРАНО":"ВЫБРАТЬ")+'</button>'):'<span class="tb-skill-entry-lock">'+lockedText+'</span>')+'</article>';}).join("")+'</div></section>';}else if(profileTab==="craft"){
   const materials=(c.bag||[]).filter(item=>item.type==="craft_material").reduce((sum,item)=>sum+(Number(item.quantity)||1),0);
   const stones=(c.bag||[]).filter(item=>item.type==="enhancement_stone");
   const groups={};stones.forEach(item=>{const typeId=item.stoneType?.id||item.stoneType||"unknown",key=String(item.level||1)+":"+typeId;if(!groups[key])groups[key]={item,count:0};groups[key].count+=Number(item.quantity)||1;});
   const stoneRows=Object.values(groups).map(group=>'<article class="tb-system-row"><div><b>'+esc(group.item.stoneType?.name||group.item.stoneType?.branch_id||"Камень усиления")+' · Уровень '+(group.item.level||1)+'</b><small>В наличии: '+group.count+' / 5 для слияния</small></div><button data-merge="'+group.item.id+'" '+(group.count<5?'disabled':'')+'>СЛИТЬ 5 КАМНЕЙ</button></article>').join("");
   body='<section class="tb-craft-rebuild"><section class="tb-craft-main-card"><h3>Крафт и улучшение</h3><p class="tb-craft-material-count">Материалы для крафта: '+materials+' / 20</p><button type="button" class="tb-forge-button" data-craft-stone="1" '+(materials<20?'disabled':'')+'>КОВАТЬ КАМЕНЬ</button></section><section class="tb-system-card"><h3>Слияние камней</h3>'+(stoneRows||'<small>Камней усиления пока нет.</small>')+'</section><section class="tb-system-card"><h3>Камни заточки</h3><p>Камни заточки и долота отображаются в рюкзаке и применяются к экипировке.</p><p>В наличии: '+(c.bag||[]).filter(item=>item.type==="refine_stone").reduce((sum,item)=>sum+(Number(item.quantity)||1),0)+'</p></section></section>';
  }else if(profileTab==="account"){
   body=accountAuthPanel()+'<div class="tb-profile-account">'+systemsScreen()+'</div>';
  }else if(profileTab==="speedrun"){
   const speedRuns=Number(c.stats?.speed_runs||0),bestStage=Number(c.progress?.highestEver||0);
   body='<section class="speedrun-container"><div class="speedrun-eyebrow">ИСПЫТАНИЕ СКОРОСТИ</div><h2 class="speedrun-title">Спидран Башни</h2><div class="speedrun-record-row"><div class="speedrun-record"><small>РЕКОРД ЭТАПА</small><strong>'+bestStage+' / 250</strong><small>Ускоренные бои ×2: '+speedRuns+'</small></div><button class="speedrun-status" type="button" disabled>В ПРОЦЕССЕ</button></div><p class="speedrun-description">Отслеживание быстрых забегов и прогресса. Ускоренные бои ×2 учитываются отдельно.</p><p class="speedrun-note">Результаты обновляются по событиям игры; отдельный таймер не запускается в фоне.</p></section>';
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
   const renderItem=item=>{const equipment=isEquipment(item),ix=({weapon:0,chest:1,head:2,legs:3,hands:4,accessory:5})[item.slot]??-1,current=ix>=0?c.gear[ix]:null,stats=equipment?'<div class="tb-item-stats">'+Object.entries(item.stats).filter(([,v])=>Number(v)!==0).map(([key,value])=>{const delta=Number(value)-(Number(current?.stats?.[key])||0),cls=delta>0?"is-better":delta<0?"is-worse":"is-equal";return '<span class="'+cls+'">'+(labels[key]||esc(key))+' '+formatStat(key,value)+(current?" ("+formatStat(key,delta)+")":"")+'</span>';}).join("")+'</div>':'';let actions='';if(item.type==="healing_potion")actions+='<button data-belt-assign="'+item.id+'">В ПОЯС</button>';if(equipment)actions+='<button data-equip="'+item.id+'">НАДЕТЬ</button><button data-salvage="'+item.id+'">РАЗОБРАТЬ</button>';if(item.type==="refine_stone")actions+='<small>Камень заточки</small>';if(item.type==="enhancement_stone")actions+='<small>'+esc(item.stoneType?.name||item.stoneType?.branch_id||item.stoneType?.branchId||"Камень")+' · '+esc(item.stoneType?.slot||"")+' · ур. '+item.level+'</small><small class="tb-stone-description">'+esc(stoneDescription(item))+'</small><button data-inspect-stone="'+item.id+'">ОПИСАНИЕ КАМНЯ</button>';if(item.type==="craft_material")actions+='<button data-craft-stone="1">КОВАТЬ КАМЕНЬ I · 20 МАТЕРИАЛОВ</button>';if(item.type==="enhancement_stone"&&item.level<balance.equipment.stone_max_level)actions+='<button data-merge="'+item.id+'" '+(c.bag.filter(x=>x.type==="enhancement_stone"&&x.level===item.level&&(x.stoneType.id||x.stoneType)===(item.stoneType.id||item.stoneType)).length<balance.equipment.stone_merge_count?"disabled":"")+' >СЛИТЬ 5 КАМНЕЙ</button>';if(["xp_10","xp_20","xp_50","xp_100","drop_20","drop_50","drop_75","drop_100","refine_10","refine_20","map_hint","repair_kit","silver_bonus","xp_hourglass","potion_capacity","one_rescue","stone_cache","socket","pity","refine_guard","rescue_seal","extra_socket","pity_token"].includes(item.type))actions+='<button data-use="'+item.id+'">ИСПОЛЬЗОВАТЬ</button>';return '<article class="tb-bag-item '+(equipment?'rarity-'+rarityClass(item.rarity):'')+'"><button type="button" class="tb-item-tile-open" data-item-select="'+item.id+'" aria-label="Подробнее: '+esc(itemDisplayName(item))+'"><div class="tb-bag-item-art">'+(equipment?relicIconHtml(item,item.slot):inventoryIconHtml(item,equipment))+'</div><span>'+esc(itemDisplayName(item))+'</span><small>'+(equipment?'Ур. '+(item.itemLevel||1):(Number(item.quantity)>1?'Количество: '+item.quantity:''))+'</small></button>'+actions+'</article>';};
   const filters='<div class="tb-gear-filter tb-bag-filters"><button type="button" data-bag-filter="all" class="'+(bagFilter==="all"?"active":"")+'">ВСЕ</button><button type="button" data-bag-filter="weapon" class="'+(bagFilter==="weapon"?"active":"")+'">ОРУЖИЕ</button><button type="button" data-bag-filter="armor" class="'+(bagFilter==="armor"?"active":"")+'">БРОНЯ</button><button type="button" data-bag-filter="accessory" class="'+(bagFilter==="accessory"?"active":"")+'">АКСЕССУАРЫ</button></div>';
   const selected=(c.bag||[]).find(item=>item.id===selectedItemId);
   const detail=selected?(()=>{const markup=renderItem(selected),actionMatch=markup.match(/<\/button>([\s\S]*?)<\/article>/),statsMarkup=markup.match(/<div class="tb-item-stats">[\s\S]*?<\/div>/)?.[0]||"",slotLabel=({weapon:"Оружие",chest:"Нагрудник",head:"Шлем",legs:"Поножи",hands:"Перчатки",accessory:"Аксессуар"})[selected.slot]||itemTypeName(selected.type),description=selected.type==="enhancement_stone"?stoneDescription(selected):(selected.description||itemTypeName(selected.type));return '<div class="tb-item-detail-overlay"><section class="tb-item-detail-sheet" role="dialog" aria-modal="true" aria-label="Предмет"><button type="button" class="tb-item-detail-close" data-item-select="">×</button><div class="tb-item-detail-art">'+(isEquipment(selected)?relicIconHtml(selected,selected.slot):inventoryIconHtml(selected,false))+'</div><h3>'+esc(itemDisplayName(selected))+'</h3><p>'+esc(selected.rarity||slotLabel)+' · '+esc(slotLabel)+'</p>'+(statsMarkup||'<p class="tb-item-detail-description">'+esc(description)+'</p>')+(Number(selected.quantity)>1?'<p>Количество: '+Number(selected.quantity)+'</p>':'')+'<div class="tb-item-detail-actions">'+(actionMatch?.[1]||"")+'</div></section></div>';})():"";
   body='<h3>Рюкзак · '+c.bag.length+'</h3>'+tools+filters+'<div class="tb-item-grid">'+(visibleBag.length?visibleBag.map(renderItem).join(""):'<div class="tb-lock">Рюкзак пока пуст.</div>')+'</div>'+detail;

  }
  const modalSkill=pendingSkillUpgradeId?availableSkillForUpgrade(c,pendingSkillUpgradeId):null,upgradeModal=modalSkill?'<div class="skill-upgrade-overlay" data-skill-upgrade-backdrop="1"><section class="skill-upgrade-modal" role="dialog" aria-modal="true" aria-label="Улучшение умения"><h3>Улучшение: '+esc(modalSkill.name)+'</h3><p>Выбери постоянный бонус для следующего ранга.</p><div class="skill-upgrade-options"><button type="button" class="skill-upgrade-btn" data-skill-upgrade-type="cost"><strong>Экономия (-20% к стоимости)</strong><span>На 20% меньше расход ресурса за ранг.</span></button><button type="button" class="skill-upgrade-btn" data-skill-upgrade-type="power"><strong>Мощь (+20% к урону/лечению)</strong><span>На 20% выше урон или лечение за ранг.</span></button></div><button type="button" class="skill-upgrade-close" data-skill-upgrade-close="1">Отмена</button></section></div>':'';
  return header("Профиль героя",c.name+" · "+clsName(c))+upgradeModal+'<section class="tb-profile"><div class="tb-profile-top"><div class="tb-profile-avatar '+(engine.getRefinementGlow(c)||"")+' '+rarityFrame+' '+(engine.state.account.activeCosmetics?.frame||"")+'"><img src="'+portrait(c.classId)+'" alt=""></div><div><div class="tb-eyebrow">ПЕРСОНАЖ</div><h1>'+esc(c.name)+'</h1><p>'+esc(clsName(c))+' · Уровень '+c.level+' · Мощь '+engine.combatPower(c)+'</p></div></div><nav class="tb-tabs">'+tabs.map(t=>'<button data-tab="'+t[0]+'" class="'+(profileTab===t[0]?"active":"")+'">'+t[1]+'</button>').join("")+'</nav><div class="tb-profile-content">'+body+'</div></section>';
 }
 function shopProductSprite(item){const id=String(item?.id||"").toLowerCase();if(id.startsWith("heal")||id.includes("potion"))return "shop-potion";if(id.startsWith("premium")||id.includes("rescue"))return "shop-premium";if(id.includes("refine")||id.includes("chisel")||id.includes("socket"))return "shop-refine";if(id.startsWith("xp"))return "shop-xp";if(id.startsWith("drop"))return "shop-drop";return "shop-item";}
 function shopProductIconHtml(item){const id=String(item?.id||"").toLowerCase(),value=[item?.type,item?.name,id].filter(Boolean).join(" ").toLowerCase();if(id.startsWith("xp"))return '<img class="tb-shop-xp-icon" src="assets/icons/image 5.png" alt="Зелье опыта" loading="eager" onerror="this.style.display=\'none\'">';if(value.includes("craft")||value.includes("material")||value.includes("материал")||value.includes("enhancement_stone")||value.includes("камень усиления"))return '<span class="tb-support-icon support-orb" aria-hidden="true"></span>';if(value.includes("potion")||value.includes("heal")||value.includes("зель")||value.includes("weapon")||value.includes("sword")||value.includes("меч")||value.includes("helmet")||value.includes("шлем")||value.includes("armor")||value.includes("нагруд")||value.includes("glove")||value.includes("перчат")||value.includes("amulet")||value.includes("ring")||value.includes("амул")||value.includes("кольц"))return relicIconHtml(item,item?.slot);return '<span class="sprite-icon '+shopProductSprite(item)+'" aria-hidden="true"></span>';}

 function shopScreen(){
  const c=live();if(!c)return characterList();
  const store=balance.economy[shopTab+"_store"];
  const products=Object.entries(store).filter(([key,value])=>typeof value==="number").map(([id,price])=>({id,price,name:id.replace(/_/g," ")})).concat((store.extra||[]).map(item=>({id:item.id,price:item.price,name:item.name})));
  const label=shopTab==="silver"?"серебра":"алм.";
  const chest=engine.dailyChestSnapshot(c.id),chestLabel=chest.available?"🎁 БЕСПЛАТНЫЙ ЕЖЕДНЕВНЫЙ СУНДУК · ЗАБРАТЬ":"🎁 СЛЕДУЮЩИЙ СУНДУК · "+Math.floor(Math.ceil(chest.remainingMs/60000)/60)+"ч "+(Math.ceil(chest.remainingMs/60000)%60)+"м";
  const dailyChestMarkup='<section class="tb-daily-shop-chest"><div><b>ЕЖЕДНЕВНАЯ НАГРАДА</b><small>Бесплатный сундук обновляется раз в сутки</small></div>'+button("daily-chest",chestLabel,chest.available?"":"disabled")+'</section>';
  return header("Магазин","Персонажная и аккаунтная экономика")+'<section class="tb-shop">'+dailyChestMarkup+'<div class="tb-shop-top"><h1>Магазин башни</h1></div><div class="tb-shop-balances"><span>◈ '+c.silver+' серебра персонажа</span><span>◆ '+engine.state.account.diamonds+' алмазов аккаунта</span><span>Премиум до '+(engine.state.account.premiumUntil?new Date(engine.state.account.premiumUntil).toLocaleDateString("ru-RU"):"—")+'</span></div><nav class="tb-tabs"><button data-shop-tab="silver" class="'+(shopTab==="silver"?"active":"")+'">ЗА СЕРЕБРО</button><button data-shop-tab="diamond" class="'+(shopTab==="diamond"?"active":"")+'">ЗА АЛМАЗЫ</button></nav><div class="tb-product-grid">'+products.map(item=>'<article class="tb-product"><div class="tb-product-icon">'+shopProductIconHtml(item)+'</div><b>'+esc(item.name.toUpperCase())+'</b><small>'+(item.id.startsWith("premium")?"Премиум аккаунт":item.id.startsWith("heal")?"Зелье исцеления":item.id.startsWith("xp")?"Зелье опыта":item.id.startsWith("drop")?"Зелье шанса дропа":"Улучшение экипировки")+'</small><span class="tb-product-price">'+item.price+' '+label+'</span><button data-buy="'+item.id+'" '+(shopTab==="silver"?(c.silver<item.price?"disabled":""):(engine.state.account.diamonds<item.price?"disabled":""))+'>КУПИТЬ</button></article>').join("")+'</div>'+
   (shopTab==="diamond"?'<div class="tb-packages"><h3>Пакеты алмазов</h3><div class="tb-package-grid">'+balance.economy.diamond_packages.map(pack=>'<div><b>'+pack[0]+' алмазов</b><span>'+pack[1]+' ₽</span></div>').join("")+'</div><small>1 алмаз = 1 ₽ · платежи не подключены в браузерной версии</small></div>':'')+
   (shopTab==="diamond"?'<div class="tb-cosmetic-chests"><h2>Косметика за алмазы</h2><p>Только внешний вид · без влияния на характеристики.</p>'+(balance.cosmetics?.chests||[]).map(ch=>'<article><b>'+esc(ch.name)+'</b><small>'+ch.price+' ◆ · случайный предмет из коллекции</small><button data-cosmetic-chest="'+ch.id+'" '+(engine.state.account.diamonds<ch.price?'disabled':'')+'>ОТКРЫТЬ СУНДУК</button></article>').join("")+'</div>':'')+'<p class="tb-note">Алмазы и премиум принадлежат аккаунту. Платёжный провайдер в браузерной версии не подключён.</p></section>';
 }
 function progressScreen(){
  const c=live();if(!c)return characterList();
  const weekly=engine.weeklySnapshot(c.id),claimed=c.achievements||[];
  const derived={highest_stage:c.progress.highestEver||0,lore_read:(c.loreRead||[]).length,paragon_level:c.paragon?.level||0,account_level:engine.accountLevel(),season_clear:c.stats.season_clear||0};
  const achievements=balance.achievements.achievements.map(a=>{const value=derived[a.metric]??c.stats[a.metric]??c.progress[a.metric]??0,done=value>=a.target,owned=claimed.includes(a.id),progress=Math.min(a.target,Math.max(0,Number(value)||0)),rewardParts=[];if(a.reward.silver)rewardParts.push(a.reward.silver+" серебра");if(a.reward.diamonds)rewardParts.push(a.reward.diamonds+" алмазов");if(a.reward.cosmetic?.length)rewardParts.push("косметика");const rewardLabel=rewardParts.join(" + ")||"без дополнительной награды";return '<article class="tb-system-row"><div><b>'+esc(a.name)+'</b><small>'+esc(a.description||"Условие достижения.")+' Прогресс: '+progress+'/'+a.target+' · '+esc(a.metric_label||"Показатель")+' · Награда: '+esc(rewardLabel)+'</small></div><button data-achievement="'+a.id+'" '+(!done||owned?'disabled':'')+'>'+(owned?'ПОЛУЧЕНО':done?'ЗАБРАТЬ':'ЗАКРЫТО')+'</button></article>';}).join("");
  const tasks=weekly.map(q=>'<div class="weekly-task-row"><div class="weekly-task-copy"><b>'+esc(q.name)+'</b><small>'+esc(q.description||"Выполните условие задания.")+'</small><small>Прогресс: '+q.progress+'/'+q.target+'</small></div><button class="weekly-task-status" data-weekly-claim="'+q.id+'" '+(!q.complete||q.claimed?'disabled':'')+'>'+(q.claimed?'ПОЛУЧЕНО':q.complete?'ЗАБРАТЬ':'В ПРОЦЕССЕ')+'</button></div>').join("");
  return header("Прогресс","Достижения · еженедельные задания · спидран")+'<section class="tb-systems"><h1>ПРОГРЕСС</h1><section class="tb-system-card"><div class="tb-system-actions"><button type="button" data-action="leaderboard">РЕЙТИНГ ИГРОКОВ</button></div></section><section class="tb-system-card"><h2>Достижения · '+claimed.length+'/'+balance.achievements.achievements.length+'</h2>'+achievements+'</section><section class="weekly-tasks-container"><h2>ЕЖЕНЕДЕЛЬНЫЕ ЗАДАНИЯ · '+esc(weekly[0]?.week||"ТЕКУЩАЯ НЕДЕЛЯ")+'</h2><div class="weekly-tasks-list">'+tasks+'</div><small class="weekly-tasks-note">Сброс каждый понедельник в 00:00 UTC.</small></section><section class="speedrun-container"><div class="tb-eyebrow">ИСПЫТАНИЕ СКОРОСТИ</div><h2>Спидран Башни</h2><b>ЛУЧШИЙ ЭТАП · '+(c.progress.highestEver||0)+' / 250</b><p>Завершено спидранов: '+(c.stats.speedrun_completions||0)+'</p></section></section>';
 }
 function accountScreen(){
  const c=live();if(!c)return characterList();
  const prefs={sound_enabled:true,music_enabled:true,volume_master:.8,volume_music:.7,volume_effects:.8,...(engine.state.account.settings||{})};
  const settings='<div class="tb-system-settings"><label>Звуковые эффекты <input type="checkbox" data-setting="sound_enabled" '+(prefs.sound_enabled!==false?'checked':'')+'></label><label>Фоновая музыка <input type="checkbox" data-setting="music_enabled" '+(prefs.music_enabled!==false?'checked':'')+'></label><label>Громкость <input type="range" min="0" max="1" step=".01" data-setting="volume_master" value="'+prefs.volume_master+'"></label><label>Музыка <input type="range" min="0" max="1" step=".01" data-setting="volume_music" value="'+prefs.volume_music+'"></label><label>Эффекты <input type="range" min="0" max="1" step=".01" data-setting="volume_effects" value="'+prefs.volume_effects+'"></label></div>';
  return header("Аккаунт","Вход · облачное сохранение · настройки")+'<section class="tb-systems"><h1>АККАУНТ</h1>'+accountAuthPanel()+'<section class="tb-system-card"><h2>Настройки звука</h2>'+settings+'</section><section class="tb-system-card"><h2>Облачное сохранение</h2><div class="tb-system-actions">'+button("cloud-account","ВОЙТИ / РЕГИСТРАЦИЯ")+button("cloud-sync","СОХРАНИТЬ В ОБЛАКО")+'</div></section><section class="tb-system-card"><h2>Сброс прогресса</h2><p>Полный сброс удалит персонажа, предметы и достижения.</p>'+button("reset-character","СБРОСИТЬ ПРОГРЕСС")+'</section></section>';
 }
  function systemsScreen(){
  const c=live();if(!c)return characterList();
  const account=engine.state.account,prefs={sound_enabled:true,music_enabled:true,volume_master:.8,volume_music:.7,volume_effects:.8,language:"ru",disable_refinement_glow:false,disable_particles:false,invert_camera:false,combat_log_toggle:true,...(account.settings||{})};
  const daily=engine.dailySnapshot(c.id),tutorial=c.tutorial||{completed:false,step:0,rewardClaimed:false},chest=engine.dailyChestSnapshot(c.id),chestMinutes=Math.ceil(chest.remainingMs/60000),chestLabel=chest.available?"🎁 СУНДУК · ГОТОВ":"🎁 СУНДУК · "+Math.floor(chestMinutes/60)+"ч "+(chestMinutes%60)+"м";
  const rank={Обычная:0,Редкая:1,Эпическая:2,Легендарная:3,Богоподобная:4};
  const claimed=c.achievements||[];
  const derived={highest_stage:c.progress.highestEver||0,lore_read:(c.loreRead||[]).length,paragon_level:c.paragon?.level||0,account_level:engine.accountLevel(),season_clear:c.stats.season_clear||0};
  const achievementCards=balance.achievements.achievements.map(a=>{
   const value=derived[a.metric]??c.stats[a.metric]??c.progress[a.metric]??0,done=value>=a.target,owned=claimed.includes(a.id),progress=Math.min(a.target,Math.max(0,Number(value)||0)),rewardParts=[];
   if(a.reward.silver)rewardParts.push(a.reward.silver+" серебра");
   if(a.reward.diamonds)rewardParts.push(a.reward.diamonds+" алмазов");
   if(a.reward.cosmetic?.length)rewardParts.push("косметика");
   const rewardLabel=rewardParts.join(" + ")||"без дополнительной награды";
   return '<article class="tb-system-row"><span class="achievement-icon '+achievementSpriteClass(a)+'" aria-hidden="true"></span><div><b>'+esc(a.name)+'</b><small>'+esc(a.description||"Условие достижения.")+' Прогресс: '+progress+'/'+a.target+' · '+esc(a.metric_label||"Показатель")+' · Награда: '+esc(rewardLabel)+'</small></div><button data-achievement="'+a.id+'" '+(!done||owned?'disabled':'')+'>'+(owned?'ПОЛУЧЕНО':done?'ЗАБРАТЬ':'ЗАКРЫТО')+'</button></article>';
  }).join("");
  const loreCards=balance.lore.entries.map(entry=>{
   const read=(c.loreRead||[]).includes(entry.id),open=c.progress.highestEver>=entry.unlock_stage;
   return '<article class="tb-system-row"><div><b>'+esc(entry.title)+'</b><small>Этап '+entry.unlock_stage+' · '+(read?'прочитано':open?'доступно':'закрыто')+' · +'+entry.xp_reward+' XP</small></div><button data-lore="'+entry.id+'" '+(!open||read?'disabled':'')+'>'+(read?'ПРОЧИТАНО':open?'ЧИТАТЬ':'ЗАКРЫТО')+'</button></article>';
  }).join("");
  const stash=(engine.state.stash||[]).map(item=>'<article class="tb-system-row"><div><b>'+esc(item.name)+'</b><small>'+esc(item.rarity)+' · ilvl '+item.itemLevel+'</small></div><button data-stash-withdraw="'+item.id+'">ЗАБРАТЬ</button></article>').join("");
  const depositable=c.bag.filter(item=>item.rarity&&rank[item.rarity]>=rank[balance.stash.min_rarity]&&!item.bound&&!item.bossLoot).map(item=>'<article class="tb-system-row"><div><b>'+esc(item.name)+'</b><small>'+esc(item.rarity)+' · ilvl '+item.itemLevel+'</small></div><button data-stash-deposit="'+item.id+'">В ОБЩИЙ СТЕШ</button></article>').join("");
  const ownedCosmetics=(account.cosmetics||[]).map(id=>(balance.cosmetics?.items||[]).find(x=>x.id===id)).filter(Boolean),activeCosmetics=account.activeCosmetics||{};
   const cosmeticCards=ownedCosmetics.map(item=>'<article class="tb-system-row"><div><b>'+esc(item.name)+'</b><small>'+esc(item.type)+' · '+(activeCosmetics[item.type]===item.id?'НАДЕТО':'В КОЛЛЕКЦИИ')+'</small></div><button data-equip-cosmetic="'+item.id+'" '+(activeCosmetics[item.type]===item.id?'disabled':'')+'>НАДЕТЬ</button></article>').join("");
   const store=balance.pvp_store.items.map(item=>{
   const owned=item.kind==="cosmetic"?(account.cosmetics||[]).includes(item.id):item.kind==="account_relic"?(account.relics||[]).includes(item.id):item.kind==="character_item"?(account.classEpics||[]).includes(item.classId):false;
   const classBlocked=item.kind==="character_item"&&item.classId!==c.classId;
   return '<article class="tb-system-product"><b>'+esc(item.name)+'</b><small>'+esc(item.category)+' · '+item.price+' PvP-очков</small><button data-pvp-buy="'+item.id+'" '+(owned||classBlocked||(account.pvpPoints||0)<item.price?'disabled':'')+'>'+(owned?(item.kind==="character_item"?"УЖЕ ПОЛУЧЕНО":"УЖЕ КУПЛЕНО"):classBlocked?'ДРУГОЙ КЛАСС':'КУПИТЬ')+'</button></article>';
  }).join("");
  const paragon=c.paragon||{level:0,xp:0,stats:{}};
  const paragonRows=balance.paragon.stats.map(stat=>'<div class="tb-system-row"><div><b>'+esc(stat)+'</b><small>Ранг '+(paragon.stats?.[stat]||0)+'</small></div><button data-paragon-stat="'+stat+'" '+(c.level<balance.paragon.unlock_level||Object.values(paragon.stats||{}).reduce((a,b)=>a+b,0)>=paragon.level?'disabled':'')+'>+1</button></div>').join("");
  const settings='<div class="tb-system-settings"><label>Звуковые эффекты: Вкл/Выкл <input type="checkbox" data-setting="sound_enabled" '+(prefs.sound_enabled!==false?'checked':'')+'></label><label>Фоновая музыка: Вкл/Выкл <input type="checkbox" data-setting="music_enabled" '+(prefs.music_enabled!==false?'checked':'')+'></label><button type="button" class="tb-secondary" data-action="toggle-mute">'+(prefs.sound_enabled!==false?'ЗВУК ВКЛ · MUTE':'ЗВУК ВЫКЛ · ВКЛ')+'</button><label>Главная громкость <input type="range" min="0" max="1" step=".01" data-setting="volume_master" value="'+prefs.volume_master+'"></label><label>Музыка <input type="range" min="0" max="1" step=".01" data-setting="volume_music" value="'+prefs.volume_music+'"></label><label>Эффекты <input type="range" min="0" max="1" step=".01" data-setting="volume_effects" value="'+prefs.volume_effects+'"></label><label>Язык <select data-setting="language"><option value="ru" '+(prefs.language==="ru"?'selected':'')+'>Русский</option><option value="en" '+(prefs.language==="en"?'selected':'')+'>English</option></select></label><label>Отключить свечение заточки +20 <input type="checkbox" data-setting="disable_refinement_glow" '+(prefs.disable_refinement_glow?'checked':'')+'></label><label>Отключить частицы <input type="checkbox" data-setting="disable_particles" '+(prefs.disable_particles?'checked':'')+'></label><label>Инверсия камеры <input type="checkbox" data-setting="invert_camera" '+(prefs.invert_camera?'checked':'')+'></label><label>Комбат-лог <input type="checkbox" data-setting="combat_log_toggle" '+(prefs.combat_log_toggle!==false?'checked':'')+'></label><label>Отключить тряску экрана <input type="checkbox" data-setting="disable_screen_shake" '+(prefs.disable_screen_shake?'checked':'')+'></label><label>Отключить вспышки умений <input type="checkbox" data-setting="disable_skill_flashes" '+(prefs.disable_skill_flashes?'checked':'')+'></label><label>Отключить телеграфы (хардкорная опция) <input type="checkbox" data-setting="disable_telegraphs" '+(prefs.disable_telegraphs?'checked':'')+'></label><label>Авто-разбор обычных и редких предметов ниже ilvl N <input type="checkbox" data-setting="autoSalvage" '+(prefs.autoSalvage?'checked':'')+'></label><label>Порог ilvl для авто-разбора <input type="number" min="1" max="120" data-setting="autoSalvageBelow" value="'+(prefs.autoSalvageBelow||40)+'"></label><label>Чистый экран · скрыть цифры урона и второстепенные иконки <input type="checkbox" data-setting="clean_ui" '+(prefs.clean_ui?'checked':'')+'></label><label>Сложность <select data-setting="difficulty"><option value="easy" '+(c.difficulty==="easy"?'selected':'')+'>Easy</option><option value="normal" '+(c.difficulty==="normal"?'selected':'')+'>Normal</option><option value="hardcore" '+(c.difficulty==="hardcore"?'selected':'')+'>Hardcore</option></select></label></div><div class="tb-system-actions"><button type="button" data-action="cloud-account">ОБЛАЧНЫЙ АККАУНТ</button><button type="button" data-action="cloud-sync">СИНХРОНИЗИРОВАТЬ</button></div>';
  const pending=account.pvpDaily?.pending;
  const weekly=engine.weeklyLeaderboard();
  const activeSeason=c.run.season?.modifier||engine.state.season?.modifier,activeDaily=c.run.dailyModifier||daily.modifier;
  return header("Системы аккаунта","Аккаунт · уровень "+engine.accountLevel())+'<section class="tb-systems"><div class="tb-system-top"><div><h1>Системы и прогресс</h1><p>'+esc(c.name)+' · '+esc(clsName(c))+' · '+c.level+' уровень</p></div></div>'+
   '<div class="tb-system-stats"><span>Аккаунт ур. '+engine.accountLevel()+'</span><span>PvP-очки '+(account.pvpPoints||0)+'</span><span>Стеш '+(engine.state.stash||[]).length+'/'+balance.stash.slots+'</span><span>Прочитано '+(c.loreRead||[]).length+'/25</span></div>'+
   '<section class="tb-system-card"><h2>Настройки</h2>'+settings+'</section>'+
   '<section class="tb-system-card"><h2>Туториал · '+tutorial.step+'/'+balance.tutorial.steps+'</h2><p>'+(tutorial.completed?'Туториал завершён':'Шесть последовательных шагов. Можно пропустить.')+'</p><div class="tb-system-actions">'+button("tutorial-next","СЛЕДУЮЩИЙ ШАГ",tutorial.completed?"disabled":"")+button("tutorial-skip","ПРОПУСТИТЬ",tutorial.completed?"disabled":"")+(tutorial.completed&&!tutorial.rewardClaimed?button("tutorial-claim","ЗАБРАТЬ 100 СЕРЕБРА + ЗЕЛЬЕ"):"")+'</div></section>'+
   '<section class="tb-system-card"><h2>Дневной босс</h2><p>Награда: '+balance.heroic.daily_boss_reward.silver+' серебра и '+balance.heroic.daily_boss_reward.diamonds+' алмаза. Вход: '+balance.heroic.daily_boss_cost.silver+' серебра.</p><div class="tb-system-actions">'+button("daily-boss","СРАЗИТЬСЯ ЗА 500 СЕРЕБРА",daily.boss.started?"disabled":"")+'<span>'+(daily.boss.completed?(daily.boss.won?"ПОБЕДА":"ПОРАЖЕНИЕ"):daily.boss.started?"ПОПЫТКА ИСПОЛЬЗОВАНА":"ПОПЫТКА ДОСТУПНА")+'</span></div></section>'+
   '<section class="tb-system-card"><h2>Косметическая коллекция · '+ownedCosmetics.length+'</h2>'+(cosmeticCards||'<small>Пока нет косметики. Сундуки находятся в магазине за алмазы.</small>')+'</section>'+
    '<section class="tb-system-card"><h2>Сезонный модификатор</h2><p>'+esc(activeSeason?.name||"Нет активного модификатора")+'</p><small>Фиксируется при старте забега; период сезона '+balance.seasons.season_length_days+' дней.</small></section>'+
   '<section class="tb-system-card"><h2>Модификатор дня</h2><p>'+esc(activeDaily?.name||"Нет ежедневного модификатора")+'</p><small>Действует на бои забега; обновление каждый день в 00:00 UTC.</small></section>'+
   '<section class="tb-system-card"><h2>Ежедневный сундук</h2><p>Бесплатная награда обновляется раз в сутки.</p>'+button("daily-chest",chestLabel,chest.available?"":"disabled")+'</section>'+
   '<section class="tb-system-card"><h2>Достижения · '+claimed.length+'/'+balance.achievements.achievements.length+'</h2>'+achievementCards+'</section>'+
   '<section class="tb-system-card"><h2>Лор башни</h2>'+loreCards+'</section>'+
   '<section class="tb-system-card"><h2>Общий стеш · '+(engine.state.stash||[]).length+'/'+balance.stash.slots+'</h2><p>Только '+esc(balance.stash.min_rarity)+' и выше. Предмет привязывается при первом использовании. Передача — один раз в день.</p>'+(stash||'<small>Общий стеш пуст.</small>')+'<h3>Экипировка для передачи</h3>'+(depositable||'<small>Нет предметов эпик+ для передачи.</small>')+'</section>'+
   '<section class="tb-system-card"><h2>PvP-арена · '+(account.pvpPoints||0)+' очков</h2><p>Поиск реального игрока по боевой мощи ±15%. Снимок его класса, умений, талантов и экипировки загружается из Supabase. Боты отключены.</p><div class="tb-system-actions">'+button("pvp-match","НАЙТИ РЕАЛЬНОГО СОПЕРНИКА")+(pending?button("pvp-fight","СРАЗИТЬСЯ · "+esc(pending.opponent?.name||"СОПЕРНИК")):"")+'</div>'+(pending?.opponent?.online?'<div class="tb-system-row"><div><b>'+esc(pending.opponent.name)+' · '+esc(balance.classes.classes[pending.opponent.classId]?.name||pending.opponent.classId)+'</b><small>Уровень '+pending.opponent.level+' · '+pending.opponent.bp+' BP · этап '+pending.opponent.maxStage+' · HP '+pending.opponent.stats.maxHp+' · атака '+pending.opponent.stats.attack+' · защита '+pending.opponent.stats.defense+'</small></div><span>ОНЛАЙН-ПРИЗРАК</span></div>':'')+'<div class="tb-system-products">'+store+'</div><p class="tb-online-warning">Важно: текущая симуляция боя и локальные PvP-очки пока не являются серверно подтверждённым результатом. Глобальный PvP-рейтинг не начисляет очки из браузера.</p><p class="tb-note">Глобальный рейтинг доступен в разделе «Прогресс».</p></section>'+
   '<section class="tb-system-card"><h2>Парагон · '+(paragon.level||0)+'/100</h2><p>XP: '+(paragon.xp||0)+' / '+balance.paragon.xp_per_point+'. Доступен после уровня100.</p>'+paragonRows+button("paragon-reset","СБРОСИТЬ ПАРАГОН · "+balance.paragon.reset_cost_silver+" СЕРЕБРА",Object.values(paragon.stats||{}).reduce((a,b)=>a+b,0)?"":"disabled")+'</section>'+
   '<section class="tb-system-card"><h2>Восстановление боя</h2><p>Если бой завис, можно выйти на карту и начать этот же этап заново. Прогресс персонажа не сбрасывается.</p><div class="tb-system-actions">'+button("reset-current-battle","ВЫЙТИ НА КАРТУ И СБРОСИТЬ БОЙ")+'</div></section>'+
   '<section class="tb-system-card"><h2>Управление персонажем</h2><p>Удаление или полный сброс требуют двух подтверждений и точного ввода ника.</p><div class="tb-system-actions">'+button("reset-character","ПОЛНЫЙ СБРОС ПЕРСОНАЖА")+button("delete-character","УДАЛИТЬ ПЕРСОНАЖА")+'</div></section>'+
   '<section class="tb-system-card"><h2>Комбат-лог · последние '+(c.combatLog||[]).length+'/'+balance.settings.combat_log_max_events+'</h2>'+((c.combatLog||[]).slice(-balance.settings.combat_log_max_events).reverse().map(x=>'<div class="tb-system-row"><small>'+esc(new Date(x.at).toLocaleTimeString())+'</small><span>'+esc(x.event)+'</span></div>').join("")||'<small>Событий пока нет.</small>')+'</section>'+
   '</section>';
 }
 function leaderboardScreen(){
  const c=live();
  const rows=onlineLeaderboardRows.map((row,index)=>'<article class="tb-system-row"><div><b>#'+(index+1)+' '+esc(row.nickname)+'</b><small>'+esc(balance.classes.classes[row.class]?.name||row.class)+' · этап '+row.max_stage+'</small></div><strong>'+Number(row.battle_power).toLocaleString('ru-RU')+' BP</strong></article>').join('');
  return header("Глобальный рейтинг","Топ-100 игроков")+'<section class="tb-systems"><div class="tb-system-top"><div><h1>Рейтинг игроков</h1><p>'+(c?esc(c.name)+' · '+engine.combatPower(c)+' BP':'Список лучших героев башни')+'</p></div></div><section class="tb-system-card"><div class="tb-system-actions"><button data-action="leaderboard-refresh" '+(onlineBusy?'disabled':'')+'>'+(onlineBusy?'ЗАГРУЗКА…':'ОБНОВИТЬ ТОП-100')+'</button></div>'+(onlineLeaderboardError?'<p class="tb-online-error">'+esc(onlineLeaderboardError)+'</p>':'')+(rows||'<p>Пока нет опубликованных игроков. Войди в аккаунт и опубликуй своего героя.</p>')+'<small>Глобальный рейтинг Supabase · сортировка по боевой мощи и максимальному этапу.</small></section></section>';
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
    return{...mob,...(saved||{}),index:i,id:"enemy-"+i,mobId:mob.mobId||mob.enemyId||mob.key||mob.id||mob.name||mob.role||"unknown",maxHp,hp,alive:!killed.has(i)&&saved?.alive!==false&&hp>0,dead:killed.has(i)||saved?.dead===true||hp<=0,attackIntervalMs:saved?.attackIntervalMs||stats.attackIntervalMs,nextHealAt:saved?.nextHealAt||0,nextPoisonAt:saved?.nextPoisonAt||0,slowedUntil:saved?.slowedUntil||0,pendingAttack:!!saved?.pendingAttack,turnsTaken:saved?.turnsTaken||0,speed:saved?.speed||mob.speed||1};
   });
   const healer=battle.enemies.find(enemy=>enemy.role==="healer"&&enemy.alive);index=healer?healer.index:(snapshot?.targetIndex??stage.targetIndex??stage.enemyIndex??0);
  }
  if(index===undefined||index===null||!battle.enemies[index]?.alive)index=battle.enemies.find(enemy=>enemy.alive)?.index;
  if(index===undefined)return false;
  const selected=engine.selectTarget(c.id,index);
  if(!selected){index=battle.enemies.find(enemy=>enemy.alive)?.index;if(index===undefined)return false;engine.selectTarget(c.id,index);}
  battle.targetIndex=index;battle.enemy=battle.enemies[index];battle.enemyStats=engine.getEnemyStats(c.id,battle.stage,battle.enemy);
  battle.enemyMax=battle.enemy.maxHp;battle.enemyHp=battle.enemy.hp;battle.shield=battle.enemy.shield||0;if(c.heroic&&!battle.enemy.mutation&&battle.enemy.type!=="boss")battle.enemy.mutation=Math.random()<.5?"vampirism":"thorns";
  battle.counterAction=null;battle.pendingKill=false;battle.enemyStunned=false;battle.dot=null;battle.hot=null;battle.parryChance=0;battle.nextDamageShield=0;battle.teleportUsed=false;
  battle.playerDamageBuff=0;battle.playerBuffUntil=0;battle.enemyDamageReduction=0;battle.enemyDamageReductionUntil=0;
  battle.bossPhase=battle.enemy.type==="boss"?updateBossPhase():0;
  return true;
 }
 function skillIconMarkup(skill,classId){
  const evolved=skill?window.TowerboundEndgame?.getSkillEvolution(skill.id):null;
  const icon=evolved?evolved.icon:skill?.icon;
  if(typeof icon==="string"&&icon.trim()){
   const value=icon.trim(),alias={fire:"skill-fire",ice:"skill-ice",water:"skill-ice",arcane:"skill-arcane",dark:"skill-arcane",nature:"skill-arcane",poison:"skill-poison",physical:"skill-phys",phys:"skill-phys"};
   if(alias[value.toLowerCase()]||/^skill-(?:fire|ice|arcane|poison|phys)$/.test(value.toLowerCase()))return '<span class="v2-skill-icon '+(alias[value.toLowerCase()]||value.toLowerCase())+'" aria-hidden="true"></span>';
   if(/^(?:https?:)?\/\//i.test(value)||/^(?:\.{0,2}\/|\/|assets\/)/i.test(value)||/\.(?:png|jpe?g|webp|svg)(?:[?#].*)?$/i.test(value))return '<img class="v2-skill-icon" src="'+esc(value)+'" alt="">';
   if(/[^\x00-\x7F]/.test(value))return '<span class="v2-skill-icon v2-skill-icon-glyph" aria-hidden="true">'+esc(value)+'</span>';
  }
  const kind=({assassin:"skill-poison",bishop:"skill-arcane",dragonkin:"skill-fire",destroyer:"skill-phys",elemental:"skill-arcane",duelist:"skill-phys",shaman:"skill-arcane"}[classId]||"skill-arcane");
  return '<span class="v2-skill-icon '+kind+'" aria-hidden="true"></span>';
 }
 function battleScreen(){
  const c=live();
  const hp=engine.maxHp(c);
  const hpPct=Math.max(0,Math.min(100,(Number(c.run.playerHp)||0)/Math.max(1,hp)*100));
  const slots=ensureLoadout(c);
  const enemies=battle.enemies.filter(enemy=>enemy&&enemy.alive&&Number(enemy.hp)>0);
  const enemyMarkup = enemies.map((target, i) => {
  const targetIndex = Number.isInteger(target.index) ? target.index : battle.enemies.indexOf(target);
  const enemyHpPct = Math.max(0, Math.min(100, Number(target.hp) / Math.max(1, Number(target.maxHp) || 1) * 100));
  const intent = target.telegraph?.label || target.intent?.label || (battle.telegraph && targetIndex === battle.targetIndex ? battle.telegraph.label : "Готовит атаку");
  const weaknessIcons={fire:"🔥",ice:"❄️",dark:"💀",physical:"⚔️"};
  const weaknessIcon=weaknessIcons[String(target.weakness||"").toLowerCase()]||"";
  const attackInterval=Math.max(1,Number(target.attackIntervalTurns||target.turnInterval||(target.type==="boss"?2:3)));
  const attackCountdown=Math.max(1,attackInterval-((Number(target.turnsTaken)||0)%attackInterval));
  const countdownMarkup=(target.type==="boss"||target.type==="elite")?`<div class="v2-enemy-countdown">Атака через: ${attackCountdown}</div>`:"";
  
  return `<div class="v2-enemy-card${targetIndex===battle.targetIndex?" selected":""}" data-target="${targetIndex}" aria-pressed="${targetIndex===battle.targetIndex?"true":"false"}">
    <img src="${esc(enemyPortrait(target))}" class="v2-enemy-img" alt="">
    <div class="v2-enemy-name">${weaknessIcon?'<span class="v2-weakness-icon" aria-label="Уязвимость">'+weaknessIcon+'</span>':""}${target.type === "boss" ? "БОСС" : "ВРАГ " + (i + 1)}</div>
    ${countdownMarkup}
    <div class="v2-enemy-intent">${esc(intent)}</div>
    <div class="v2-hp-bar"><div style="width:${enemyHpPct}%"></div></div>
    <div class="v2-enemy-hp-text">${Math.ceil(target.hp)} HP</div>
  </div>`;
}).join("");

const skillMarkup = Array.from({ length: 6 }, (_, index) => {
  const skill = slots[index] || null;
  const cooldown = skill ? (battle.skillCooldowns?.[skill.id] || 0) : 0;
  const cost = skill ? (skill.cost || skill.resource_cost || 18) : 0;
  const disabled = !skill || battle.actor?.type !== "player" || battle.playerSkillUsed || cooldown > 0 || battle.busy || battle.paused;
  
  return `<button type="button" class="v2-skill-btn" data-panel-skill="${esc(skill?.id || "")}" data-panel-slot="${index}" ${disabled ? "disabled" : ""}>
    <kbd>${index + 1}</kbd>
    ${skill ? skillIconMarkup(skill,c.classId) : '<span class="v2-skill-icon v2-skill-icon-empty" aria-hidden="true">—</span>'}
    <span class="v2-skill-name">${esc(skill?.name || "Пусто")}</span>
    <span class="v2-skill-cost">${skill ? cost + " рес." : ""}</span>
  </button>`;
}).join("");

return `<div class="v2-battle-wrap">
  <div class="v2-battle-top">
    <span>ИНИЦИАТИВА · РАУНД ${battle.round}</span>
    <button type="button" class="v2-pause-btn" data-action="pause">${battle.paused ? "ПРОДОЛЖИТЬ" : "ПАУЗА"}</button>
  </div>
  <div class="v2-battle-middle">
    <div class="v2-hero-side">
      <img src="${esc(portrait(c.classId))}" class="v2-hero-img" alt="">
      <div class="v2-hero-name">${esc(c.name)}</div>
      <div class="v2-hp-bar"><div style="width:${hpPct}%"></div></div>
      <div class="v2-hero-hp-text">${Math.ceil(c.run.playerHp)} / ${hp} HP</div>
      <div class="v2-hero-resource-text">${esc(classData(c).resource)} · ${Math.round(c.resource)} / ${Math.round(c.resourceMax)}</div>
    </div>
    <div class="v2-enemies-side">${enemyMarkup}</div>
  </div>
  <div class="v2-battle-bottom">
    <div class="v2-turn-guidance" aria-live="polite">${battle.actor?.type==="player"?"Твой ход. Выбери действие или заверши ход.":"Противники атакуют..."}</div>
    <button type="button" class="v2-btn-attack" id="hit" data-basic-attack="1" ${battle.actor?.type !== "player" || battle.playerSkillUsed || battle.busy || battle.paused ? "disabled" : ""}>⚔ АТАКА</button>
    <div class="v2-skills-grid">${skillMarkup}</div>
    <button type="button" class="v2-btn-end" id="endturn" data-action="end-turn" ${battle.actor?.type !== "player" || battle.paused ? "disabled" : ""}>${battle.actor?.type==="player"?"ЗАВЕРШИТЬ ХОД":"ХОД ПРОТИВНИКА..."}</button>
  </div>
</div>${battle.showTutorial ? `<div class="tb-turn-tutorial" role="dialog" aria-modal="true" aria-labelledby="tb-turn-tutorial-title">
  <section class="tb-turn-tutorial-card">
    <div class="tb-eyebrow">ПОШАГОВЫЙ БОЙ</div>
    <h2 id="tb-turn-tutorial-title">Твой первый бой</h2>
    <ol>
      <li><b>Базовая атака.</b> Она доступна каждый ход и не тратит ресурс.</li>
      <li><b>Умения 1–6.</b> Используй их по ситуации, проверяй стоимость и перезарядку.</li>
      <li><b>Телеграф врага.</b> Враг показывает намерение. Нажми «ЗАВЕРШИТЬ ХОД», чтобы противники действовали.</li>
      <li><b>Выживание.</b> Применяй зелья и защиту до завершения своего хода.</li>
    </ol>
    <button type="button" class="tb-primary tb-wide" data-action="dismiss-turn-tutorial">ПОНЯТНО, В БОЙ</button>
  </section>
</div>` : ""}`;
 }
 function beginStage(){postBattleSummary=null;
  const c=live();
  try{
   const plan=engine.beginStage(c.id,selectedStage);ensureLoadout(c);
   if(routeChoice==="elite"&&!plan.boss&&c.run.stage?.mobs?.length){c.run.stage.mobs[0].type="elite";c.run.stage.mobs[0].mechanic="shield";}
   if(c.run.dailyChallengeActive&&Array.isArray(c.run.stage?.mobs))c.run.stage.mobs.forEach(mob=>{if(mob.type!=="boss")mob.type="elite";});
   if(selectedStage%13===0){const stack=c.bag.find(x=>x.type==="antidote"&&(x.quantity||1)>0);if(stack){stack.quantity=(stack.quantity||1)-1;c.bag=c.bag.filter(x=>x.quantity!==0);notify("Ловушка обезврежена противоядием");}else{const trapDamage=Math.round(engine.maxHp(c)*.08);c.run.playerHp=Math.max(1,c.run.playerHp-trapDamage);notify("Ловушка! −"+trapDamage+" HP · купи противоядие");}}
   selectedStage=plan.stage;
   battle={stage:plan.stage,count:plan.count,enemy:null,enemyHp:0,enemyMax:0,shield:0,round:1,turnIndex:0,turnOrder:[],actor:null,turns:0,busy:false,isPlayerTurn:true,timerRemainingMs:0,timerStartedAt:0,remainingResponseMs:0,enemies:null,targetIndex:0,skillCooldowns:{},counterCooldownTurns:0,ultimateCooldownTurns:0,playerSkillUsed:false,potionUsedThisTurn:false,counterPrimed:false,counterConsumed:false,playerTurnCount:0,bossDeadlineTurns:null,bossAddsSummoned:false,poisonStacks:0,comboProgress:{},attacksThisFight:0,distinctElements:[],buffsUsed:0,telegraph:null,paused:false,proc:null,fx:null,enemyQueueToken:0,showTutorial:localStorage.getItem("tb-turn-tutorial-seen-v1")!=="1"};
   const savedSnapshot=plan.uiBattleSnapshot;if(savedSnapshot){battle.round=Math.max(1,Number(savedSnapshot.round)||1);battle.skillCooldowns={...(savedSnapshot.skillCooldowns||{})};battle.comboStacks=savedSnapshot.comboStacks||0;battle.comboProgress={...(savedSnapshot.comboProgress||{})};}if(loadBattleEnemy()===false){battle=null;screen="map";selectedStage=c.progress.currentStage;save();render();notify("Бой восстановлен на карте: живых целей не осталось");return;}syncInitiative();showPlayerTurn();screen="battle";save();render();
  }catch(error){notify(error.message);}
 }
 function finishCurrentEnemy(){
  clearTimeout(pendingTimer);pendingTimer=null;
  const c=live(),defeated=battle.enemy,dead=(battle.enemies||[]).filter(enemy=>!enemy.alive||enemy.hp<=0).sort((x,y)=>x.index-y.index);
  let result=null;const allLoot=[];
  if(!postBattleSummary)postBattleSummary={stage:battle.stage,xp:0,silver:0,loot:[],autoEquipped:0,nextStage:false};
  for(const target of dead){
   if(c.run.stage?.killedIndices?.includes(target.index))continue;
   const current=engine.finishEnemy(c.id,{speed2:c.run.speed2,targetIndex:target.index,overkillBonus:target.index===defeated.index&&!!battle.overkillBonus});
   battle.overkillBonus=false;allLoot.push(...(current.loot||[]));result=current;
   c.stats=c.stats||{};c.stats.killsByMob=c.stats.killsByMob||{};
   const mobKey=String(target.mobId||target.enemyId||target.key||target.name||target.role||"unknown").toLowerCase().replace(/_/g,"-");
   c.stats.killsByMob[mobKey]=(c.stats.killsByMob[mobKey]||0)+1;c.stats.kills=(c.stats.kills||0)+1;
   postBattleSummary.xp+=Number(current.xp)||0;postBattleSummary.silver+=Number(current.silver)||0;postBattleSummary.autoEquipped+=Number(current.autoEquipped)||0;postBattleSummary.loot.push(...(current.loot||[]));
   target.hp=0;target.alive=false;target.dead=true;
  }
  if(!result)return;
  if(allLoot.length)notify("Добыча: "+allLoot.map(x=>x.name||x.type).join(", "));
  if(result.stageComplete){
   stopBattleStatusLoop();clearTimeout(pendingTimer);pendingTimer=null;const speedrun=c.run.speedrun;
   if(speedrun?.active){speedrun.remaining=Math.max(0,(speedrun.remaining||10)-1);if(speedrun.remaining>0&&c.progress.currentStage<=balance.map.total_stages){postBattleSummary.nextStage=true;postBattleSummary.speedrunRemaining=speedrun.remaining;}else{c.stats.speedrun_completions=(c.stats.speedrun_completions||0)+1;c.run.speedrun=null;}}
   if(c.run.active&&c.progress.currentStage>postBattleSummary.stage&&c.progress.currentStage<=balance.map.total_stages)postBattleSummary.nextStage=true;
   if(c.run.dailyChallengeActive)saveDailyChallengeResult(c);
   postBattleSummary.ready=true;
   if(routeChoice==="elite"){c.silver+=30;postBattleSummary.silver+=30;routeChoice="standard";}
   battle=null;selectedStage=c.progress.currentStage;screen="map";save();render();
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
   save();render();
  }
 }
 function endFromDamage(){
  const c=live();if(c.run.stage&&battle)c.run.stage.uiBattleSnapshot={enemies:JSON.parse(JSON.stringify(battle.enemies||[])),targetIndex:battle.targetIndex,comboStacks:battle.comboStacks||0,skillCooldowns:JSON.parse(JSON.stringify(battle.skillCooldowns||{})),comboProgress:JSON.parse(JSON.stringify(battle.comboProgress||{}))};if(!settings().disable_screen_shake){root.classList.add("tb-death-shaking");setTimeout(()=>root.classList.remove("tb-death-shaking"),520);}stopBattleStatusLoop();clearTimeout(pendingTimer);pendingTimer=null;battle=null;screen="death";render();save();
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
   if(dot.ticks>0&&now>=dot.nextAt){const before=c.run.playerHp;c.run.playerHp=Math.max(0,c.run.playerHp-dot.damage);const taken=before-c.run.playerHp;if(taken>0){showFloatingText("player","-"+taken,"#ff596b");playSfx("hurt");if(!settings().disable_screen_shake)battle.shakeUntil=Date.now()+240;}dot.ticks--;dot.nextAt=now+1000;changed=true;if(c.run.playerHp<=0){endFromDamage();return;}}
  }
  battle.poisonDots=(battle.poisonDots||[]).filter(dot=>dot.ticks>0);
  if(c.classId==="bishop"&&c.run.playerHp<=engine.maxHp(c)*balance.procs.bishop.threshold&&(battle.bishopProcReadyAt||0)<=now){
   const proc=balance.procs.bishop,before=c.run.playerHp;c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*proc.value));if(c.run.playerHp>before)showFloatingText("player","+"+Math.round(c.run.playerHp-before),"#58e38b");battle.bishopProcReadyAt=now+proc.cooldown_seconds*1000;battle.proc={...proc,expiresAt:now+3000};changed=true;
  }
  if(battle.proc&&battle.proc.expiresAt&&battle.proc.expiresAt<=now){battle.proc=null;changed=true;}
  if(battle.fx&&battle.fx.until<=now){battle.fx=null;changed=true;}
  if(battle.phaseFlashUntil&&battle.phaseFlashUntil<=now){battle.phaseFlashUntil=0;battle.phaseNotice=null;changed=true;}
  if(changed){save();render();}
 }
 function triggerVfx(kind,damageType,critical){
  if(!battle)return;const colors={fire:"#ff713d",ice:"#73cfff",dark:"#bd83ff",physical:"#f0d18c"};
  if(!settings().disable_skill_flashes)battle.fx={kind,color:colors[damageType]||"#e8d7a8",until:Date.now()+520};
  if(critical&&!settings().disable_screen_shake)battle.shakeUntil=Date.now()+300;
 }
 function showFloatingText(target,text,color){
  const layer=root.querySelector(".tb-fx-layer");if(!layer)return;
  const number=document.createElement("span");number.className="tb-floating-damage";
  number.classList.add(color==="#58e38b"?"is-heal":color==="#ffd34e"?"is-crit":"is-damage");
  number.textContent=String(text);number.style.color=color;
  const anchor=target==="player"?root.querySelector(".tb-battle-hero"):
   target&&typeof target==="object"?(target.index===battle?.targetIndex?root.querySelector(".tb-enemy-focus"):root.querySelector('.tb-target-card[data-target="'+target.index+'"]')):root.querySelector(".tb-enemy-focus");
  if(anchor){const box=anchor.getBoundingClientRect(),base=layer.getBoundingClientRect();number.style.left=(box.left+box.width/2-base.left)+"px";number.style.top=(box.top-base.top+Math.min(20,box.height*.12))+"px";}
  layer.appendChild(number);setTimeout(()=>number.remove(),1000);
 }
 function applyTargetDamage(target,rawDamage,damageType,options){
  options=options||{};const c=live();
  if(!target||target.hp<=0||!target.alive){
   const next=(battle?.enemies||[]).find(enemy=>enemy.alive&&enemy.hp>0);
   if(next&&battle){if(next.index!==battle.targetIndex)setBattleTarget(next.index);return{damage:0,dealt:0,multiplier:1,killed:false,revived:false,recovered:true};}
   if(battle)finishCurrentEnemy();return{damage:0,dealt:0,multiplier:1,killed:false,revived:false,recovered:true};
  }
  let revived=false,multiplier=engine.damageTypeMultiplier(target,damageType||"physical");
  const armorPenetration=Math.max(0,Math.min(1,Number(options.armorPenetration)||0));
  if(armorPenetration>0&&multiplier<1)multiplier=1-(1-multiplier)*(1-armorPenetration);
  if(!options.ignoreArmor&&target.role==="tank"&&target.alive&&(target.guardCharges||0)>0){multiplier*=1-(balance.mobs.roles.tank.shield_fraction||.3)*(1-armorPenetration);target.guardCharges--; }
  let damage=Math.max(0,Math.round(rawDamage*multiplier));
   if(target.type==="boss"){battle.actionDamageLedger=battle.actionDamageLedger||{};const used=battle.actionDamageLedger[target.index]||0;damage=engine.capBossDamage(target,damage,used,options.ultimate?"ultimate":undefined);}
  if(!options.ignoreArmor&&target.shield>0){const absorbed=Math.min(target.shield,damage);target.shield-=absorbed;damage-=absorbed;}
  const hpBeforeHit=target.hp;const dealt=Math.min(target.hp,damage);target.hp=Math.max(0,target.hp-damage);
  if(target.hp<=0){target.hp=0;target.alive=false;target.dead=true;target.pendingAttack=false;target.pendingAction=null;}
  if(dealt>0){target.lastDamagedByPlayer=true;if(target.role==="healer")target.provoked=true;}
  if(dealt>0)engine.applyVampirism(c.id,dealt);if(dealt>0&&target.mutation==="vampirism")target.hp=Math.min(target.maxHp,target.hp+Math.round(dealt*.06));if(dealt>0&&target.mutation==="thorns"){const thorn=Math.max(1,Math.round(dealt*.04));c.run.playerHp=Math.max(0,c.run.playerHp-thorn);showFloatingText("player","-"+thorn,"#ff596b");playSfx("hurt");}if(dealt>0&&battle.actionIsSkill&&battle.actionIsPrimaryHit&&rawDamage>2*hpBeforeHit)battle.overkillBonus=true;
  if(dealt>0){showFloatingText(target,options.critical?"КРИТ -"+dealt:"-"+dealt,options.critical?"#ffd34e":"#ffffff");playSfx(options.critical?"crit":"hit");}
  if(options.critical){if(navigator.vibrate)navigator.vibrate(50);const arena=document.querySelector("#tbRpg .tb-v2");if(arena){arena.classList.add("hit-stop");setTimeout(()=>arena.classList.remove("hit-stop"),50);}}
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
  const result=applyTargetDamage(target,profile.damage*(engine.getCombatStats(c).damageMultiplier||1),"physical");battle.actionIsPrimaryHit=false;
  if(result.dealt>0){const restored=engine.restoreResource(c.id,profile.resourceGain);if(restored.gained>0)showFloatingText("player","+"+restored.gained,"#58e38b");battle.attacksThisFight=(battle.attacksThisFight||0)+1;engine.logCombatEvent(c.id,"Базовая атака");}
  triggerVfx("attack","physical",false);if(c.run.playerHp<=0){endFromDamage();return;}if(target.hp<=0){finishCurrentEnemy();return;}save();render();
 }
 function useCounterSkill(){
  if(!battle||battle.actor?.type!=="player"||battle.playerSkillUsed||battle.counterPrimed||(battle.counterCooldownTurns||0)>0)return;
  const c=live(),counter=counterAbility(c),cost=counter.resource_cost??balance.resources.action_costs.counter;
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
  const c=live(),ultimate=ultimateAbility(c),cost=ultimate.resource_cost??balance.resources.action_costs.ultimate;
  if(c.resource<cost){notify("Не хватает ресурса для ультимейта");return;}
  c.resource-=cost;battle.playerSkillUsed=true;battle.ultimateCooldownTurns=Math.max(1,ultimate.cooldown_turns||3);
  const stats=engine.getCombatStats(c),damage=stats.dps*2.0*(stats.damageMultiplier||1)+(c.classId==="destroyer"&&c.branch==="wand_shield"?stats.defense*.5:0);battle.actionDamageLedger={};
  if(ultimate.effect==="heal_shield"||ultimate.effect==="heal_aoe")c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*ultimate.heal_fraction));
  if(ultimate.effect==="heal_shield")battle.nextDamageShield=Math.round(engine.maxHp(c)*ultimate.shield_fraction);
  if(ultimate.effect==="heal_aoe"||ultimate.effect==="aoe_burst"){for(const target of battle.enemies.filter(x=>x.alive)){for(let hit=0;hit<3&&target.hp>0;hit++)applyTargetDamage(target,damage,ultimate.damage_type,{ultimate:true});}}
  else if(ultimate.effect==="single_burst"){const hitDamage=battle.enemy.type==="boss"?Math.min(damage,battle.enemy.maxHp*.8/3):damage;for(let hit=0;hit<3&&battle.enemy.hp>0;hit++)applyTargetDamage(battle.enemy,hitDamage,ultimate.damage_type,{ultimate:true});}
  triggerVfx("ultimate",ultimate.damage_type,false);if(battle.enemy.hp<=0){finishCurrentEnemy();return;}save();render();
 }
 function enemyCounter(){resolveEnemyTelegraph();}
 function playerAction(skillId,slotIndex){
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
  let damage=stats.dps*(balance.combat.turn_based?.skill_dps_multiplier||2.5)*(stats.damageMultiplier||1)*(skill.damage_multiplier??skill.damage??effect.damage_multiplier??1)*skillStats.powerMultiplier,guaranteedCrit=false;const evolvedSkill=window.TowerboundEndgame?.getSkillEvolution(skill.id);if(evolvedSkill?.id==="burst")damage*=1.2;
  const elementHint=String(skill.element||skill.branch_id||skill.name||"").toLowerCase();const damageType=skill.damage_type||(elementHint.includes("fire")||/огн|плам|жар/.test(elementHint)?"fire":elementHint.includes("water")||/вод/.test(elementHint)?"water":elementHint.includes("lightning")||/молни|гроз|электр/.test(elementHint)?"lightning":"physical");
  if(effect.type==="heal"&&effect.heal_multiplier)c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*effect.heal_multiplier*skillStats.powerMultiplier));
  if(effect.type==="hot"&&effect.heal_multiplier)battle.hot={heal:Math.round(engine.maxHp(c)*effect.heal_multiplier*skillStats.powerMultiplier),ticks:effect.ticks||3};
  if(effect.type==="shield"&&effect.shield_fraction)battle.nextDamageShield=Math.round(engine.maxHp(c)*effect.shield_fraction);
  if(effect.type==="dot"&&effect.damage_multiplier){battle.dot={damage:Math.max(1,Math.round(stats.dps*effect.damage_multiplier*skillStats.powerMultiplier)),ticks:effect.ticks||3};if(battle.enemy?.role==="tank"){battle.enemy.pendingCleanseDebuff=true;battle.enemy.debuffKind="dot";}}
  if(effect.type==="buff"){battle.playerDamageBuff=effect.power_multiplier||0;battle.playerDamageBuffTurns=Math.max(1,effect.duration_turns||effect.duration||3);battle.buffsUsed=(battle.buffsUsed||0)+1;}
  if(effect.type==="debuff"){battle.enemyDamageReduction=effect.power_multiplier||0;battle.enemyDamageReductionTurns=Math.max(1,effect.duration_turns||effect.duration||3);if(battle.enemy?.role==="tank"){battle.enemy.pendingCleanseDebuff=true;battle.enemy.debuffKind="debuff";}}
  if(effect.type==="control")battle.enemyStunned=true;
  if(effect.type==="parry")battle.parryChance=effect.parry_chance||0;
  const combo=processCombo(slotIndex);if(combo){damage*=combo.bonus.damage_mult||1;guaranteedCrit=!!combo.bonus.guaranteed_crit;}
  if(c.classId==="assassin"&&battle.assassinNextHit){damage*=balance.procs.assassin.value;battle.assassinNextHit=false;battle.proc=null;}
  if(c.classId==="elemental"&&battle.elementalNextBonus){damage*=balance.procs.elemental.value;battle.elementalNextBonus=false;battle.proc=null;}
  if(battle.playerDamageBuff&&(battle.playerDamageBuffTurns||0)>0)damage*=1+battle.playerDamageBuff;
  const runModifier=(balance.run_modifiers?.modifiers||[]).find(x=>x.id===c.run.runModifierId)||{};
  if(runModifier.player_damage_multiplier)damage*=runModifier.player_damage_multiplier;
  if(runModifier.low_hp_threshold&&c.run.playerHp/engine.maxHp(c)<=runModifier.low_hp_threshold)damage*=runModifier.low_hp_damage_multiplier||1;
  const critical=guaranteedCrit||Math.random()<stats.critChance;if(critical)damage*=stats.critMultiplier;
  const target=battle.enemy,hadBossCast=!!(battle.telegraph&&battle.enemy?.type==="boss");
  let result={killed:false,dealt:0};
  battle.actionIsSkill=true;battle.actionIsPrimaryHit=true;
  const evolutionHitOptions={...(evolvedSkill?.id==="pierce"?{armorPenetration:.5}:{}),critical};
  if(effect.type==="aoe"||evolvedSkill?.id==="burst"){for(const enemy of battle.enemies.filter(x=>x.alive)){const hit=applyTargetDamage(enemy,damage,damageType,evolutionHitOptions);if(enemy===target)result=hit;}}
  else if(!["heal","hot","buff","shield","debuff"].includes(effect.type))result=applyTargetDamage(target,damage,damageType,evolutionHitOptions);
  battle.actionIsPrimaryHit=false;battle.actionIsSkill=false;
  if(skill&&hadBossCast&&target.hp>0){const interrupt=Math.max(1,Math.round(target.maxHp*.1));const interrupted=applyTargetDamage(target,interrupt,"physical");battle.telegraph=null;notify("ПРЕРВАНО · −"+interrupted.dealt+" HP");}
  if(skill&&target.hp>0){
   const current=String(damageType).toLowerCase(),previous=battle.lastElement;
   if((previous==="fire"&&current==="water")||(previous==="water"&&current==="fire")){battle.enemyStunned=true;showFloatingText(target,"ПАР · ОГЛУШЕНИЕ","#73cfff");notify("ПАР · ОГЛУШЕНИЕ");}
   else if((previous==="lightning"&&current==="water")||(previous==="water"&&current==="lightning")){const shock=applyTargetDamage(target,Math.round(result.dealt),"lightning");showFloatingText(target,"ЭЛЕКТРОШОК -"+shock.dealt,"#ffe45c");notify("ЭЛЕКТРОШОК");}
   battle.lastElement=current;
  }
  if(target.hp>0&&result.dealt>0){const companion=Math.max(1,Math.round(stats.attack*.5));const pet=applyTargetDamage(target,companion,"physical");if(pet.dealt)showFloatingText(target,"СПУТНИК -"+pet.dealt,"#a8d8ff");}
  battle.attacksThisFight=(battle.attacksThisFight||0)+1;
  if(c.classId==="assassin"&&critical){battle.assassinNextHit=true;battle.proc={...balance.procs.assassin};}
  if(c.classId==="duelist"&&battle.attacksThisFight>=balance.procs.duelist.attacks_required&&!battle.freeSkillCharges){battle.freeSkillCharges=1;battle.proc={...balance.procs.duelist};}
  if(c.classId==="dragonkin"&&battle.attacksThisFight>=balance.procs.dragonkin.attacks_required&&!battle.dragonkinProc){battle.nextDamageShield=Math.round(engine.maxHp(c)*balance.procs.dragonkin.value);battle.dragonkinProc=true;battle.proc={...balance.procs.dragonkin};}
  if(c.classId==="shaman"&&battle.buffsUsed>=balance.procs.shaman.buffs_required){battle.poisonStacks=0;battle.buffsUsed=0;battle.proc={...balance.procs.shaman};}
  if(target.mechanic==="reflect"&&result.dealt>0)c.run.playerHp=Math.max(0,c.run.playerHp-Math.round(result.dealt*balance.elite_mechanics.reflect.damage_fraction));
  if(skill.branch_id){engine.recordDailyProgress(c.id,"branch_skills_used",1);engine.recordWeeklyProgress(c.id,"branch_skills_used",1);}
  c.progression=c.progression||{};c.progression.skillMastery=c.progression.skillMastery||{};const mastery=(c.progression.skillMastery[skill.id]||0)+1;c.progression.skillMastery[skill.id]=mastery;if(mastery===100)notify("Мастерство освоено: "+skill.name+" · откат −1 ход");
  engine.logCombatEvent(c.id,"Использовано умение: "+skill.name);triggerVfx("skill",damageType,critical);
  if(c.run.playerHp<=0){endFromDamage();return;}
  if(target.hp<=0){finishCurrentEnemy();return;}save();render();
 }
 function equipItem(itemId){
  try{engine.equipItem(live().id,itemId);save();render();notify("Предмет надет");}catch(error){notify(error.message);}
 }
 function showScreen(name){screen=name;render();}
 function battleRenderKey(){
  if(!battle)return "";
  return [battle.stage,battle.round,battle.actor?.type||"",battle.playerSkillUsed?1:0,battle.potionUsedThisTurn?1:0,battle.counterPrimed?1:0,battle.showTutorial?1:0,Math.round(live().run.playerHp),Math.round(live().resource),battle.targetIndex,battle.bossPhase||0,battle.telegraph?.targetIndex??"",battle.telegraph?.label||"",(battle.enemies||[]).map(x=>x.index+":"+x.role+":"+(x.alive?1:0)+":"+Math.round(x.hp)).join(",")].join("|");
 }
 function updateBattleDOM(){
  if(!battle)return;
  const c=live(),arena=root.querySelector(".v2-battle-wrap");if(!arena)return;
  const hp=engine.maxHp(c),playerHp=Math.max(0,Math.min(100,(Number(c.run.playerHp)||0)/Math.max(1,hp)*100));
  const heroBar=arena.querySelector(".v2-hero-side .v2-hp-bar>div");if(heroBar)heroBar.style.width=playerHp+"%";
  const heroHpText=arena.querySelector(".v2-hero-hp-text");if(heroHpText)heroHpText.textContent=Math.ceil(c.run.playerHp)+" / "+hp+" HP";
  const heroResource=arena.querySelector(".v2-hero-resource-text");if(heroResource)heroResource.textContent=classData(c).resource+" · "+Math.round(c.resource)+" / "+Math.round(c.resourceMax);
  const heroName=arena.querySelector(".v2-hero-name");if(heroName)heroName.textContent=c.name;
  arena.querySelectorAll(".v2-enemy-card[data-target]").forEach(card=>{
   const index=Number(card.dataset.target),target=(battle.enemies||[]).find(enemy=>enemy.index===index);
   if(!target)return;
   const alive=!!target.alive&&Number(target.hp)>0,bar=card.querySelector(".v2-hp-bar>div"),hpText=card.querySelector(".v2-enemy-hp-text"),intent=card.querySelector(".v2-enemy-intent");
   if(bar)bar.style.width=Math.max(0,Math.min(100,Number(target.hp)/Math.max(1,Number(target.maxHp)||1)*100))+"%";
   if(hpText)hpText.textContent=Math.max(0,Math.ceil(target.hp))+" HP";
   if(intent)intent.textContent=target.telegraph?.label||target.intent?.label||(battle.telegraph&&index===battle.targetIndex?battle.telegraph.label:"Готовит атаку");
   card.classList.toggle("selected",index===battle.targetIndex);card.classList.toggle("defeated",!alive);
   card.setAttribute("aria-pressed",index===battle.targetIndex?"true":"false");
  });
  const playerTurn=battle.actor?.type==="player";
  const hit=arena.querySelector("#hit");if(hit)hit.disabled=!playerTurn||battle.playerSkillUsed||battle.busy||battle.paused;
  const slots=ensureLoadout(c);
  arena.querySelectorAll(".v2-skill-btn[data-panel-slot]").forEach(button=>{
   const slot=Number(button.dataset.panelSlot),skill=slots[slot]||null,cd=skill?(battle.skillCooldowns?.[skill.id]||0):Infinity;
   button.dataset.panelSkill=skill?.id||"";
   button.disabled=!skill||!playerTurn||battle.playerSkillUsed||battle.busy||battle.paused||cd>0;
   const name=button.querySelector(".v2-skill-name"),cost=button.querySelector(".v2-skill-cost"),icon=button.querySelector(".v2-skill-icon");
   if(name)name.textContent=skill?.name||"Пусто";
   if(cost)cost.textContent=skill?getSkillStats(c,skill).cost+" рес.":"";
   const markup=skill?skillIconMarkup(skill,c.classId):'<span class="v2-skill-icon v2-skill-icon-empty" aria-hidden="true">—</span>';
   if(icon)icon.outerHTML=markup;else button.insertAdjacentHTML("afterbegin",markup);
  });
  const endTurn=arena.querySelector("#endturn");
  if(endTurn){
   endTurn.hidden=false;endTurn.style.display="flex";endTurn.style.visibility="visible";endTurn.style.opacity="1";
   endTurn.disabled=!playerTurn||battle.paused;
   endTurn.textContent=playerTurn?"ЗАВЕРШИТЬ ХОД":"ХОД ПРОТИВНИКА...";
   endTurn.classList.toggle("is-player-turn",playerTurn);
  }
  const guidance=arena.querySelector(".v2-turn-guidance");
  if(guidance)guidance.textContent=playerTurn?"Твой ход. Нажми «АТАКА» или выбери умение, затем заверши ход.":"Противники атакуют...";
  const pause=arena.querySelector(".v2-pause-btn");if(pause)pause.textContent=battle.paused?"ПРОДОЛЖИТЬ":"ПАУЗА";
  const round=arena.querySelector(".v2-battle-top>span");if(round)round.textContent="ИНИЦИАТИВА · РАУНД "+battle.round;
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
  nav.innerHTML='<button type="button" data-action="bottom-map" data-nav-tab="map"><span>⚔</span><small>БОЙ / КАРТА</small></button><button type="button" data-action="bottom-profile" data-nav-tab="profile"><span>♙</span><small>ПЕРСОНАЖ</small></button><button type="button" data-action="bottom-progress" data-nav-tab="progress"><span>✦</span><small>ПРОГРЕСС</small></button><button type="button" data-action="bottom-shop" data-nav-tab="shop"><span>◇</span><small>МАГАЗИН</small></button><button type="button" data-action="bottom-account" data-nav-tab="account"><span>☷</span><small>АККАУНТ</small></button>';
  const c=live(),skillPool=[...(classData(c).base_skills||[]),...skills.filter(skill=>skill.class_id===c.classId&&skill.branch_id===c.branch)],chosenSkills=new Set(Array.isArray(c.activeSkills)?c.activeSkills:(c.skillLoadout||[])),skillBadge=skillPool.filter((skill,index,pool)=>pool.findIndex(other=>other.id===skill.id)===index&&skill.type!=="passive"&&c.level>=(Number(skill.unlock_level)||1)&&!chosenSkills.has(skill.id)).length;
  const statSum=item=>Object.values(item?.stats||{}).reduce((n,v)=>n+(Number(v)||0),0);
  const slotIndex={weapon:0,chest:1,head:2,legs:3,hands:4,accessory:5};
  const upgrade=(c.bag||[]).some(item=>{const index=slotIndex[item?.slot];return Number.isInteger(index)&&statSum(item)>statSum((c.gear||[])[index]);});
  const craftMaterials=(c.bag||[]).filter(item=>item.type==="craft_material").reduce((n,item)=>n+(Number(item.quantity)||1),0);
  const craftStones=(c.bag||[]).filter(item=>item.type==="enhancement_stone"),craftLevels={};
  craftStones.forEach(item=>{const typeId=item.stoneType?.id||item.stoneType||"unknown",key=String(item.level||1)+":"+typeId;craftLevels[key]=(craftLevels[key]||0)+(Number(item.quantity)||1);});
  const mergeReady=Object.values(craftLevels).some(n=>n>=5),craft=mergeReady||craftMaterials>=20;
  const claimed=c.achievements||[],derived={highest_stage:c.progress?.highestEver||0,lore_read:(c.loreRead||[]).length,paragon_level:c.paragon?.level||0,account_level:engine.accountLevel(),season_clear:c.stats?.season_clear||0};
  const achievement=(balance.achievements?.achievements||[]).some(a=>!claimed.includes(a.id)&&(derived[a.metric]??c.stats?.[a.metric]??c.progress?.[a.metric]??0)>=a.target);
  const chest=!!engine.dailyChestSnapshot(c.id).available;
  const addBadge=(button,value)=>{if(!button||!value)return;const badge=document.createElement("i");badge.className="badge";badge.textContent=String(value===true?"!":value);button.appendChild(badge);};
  addBadge(nav.querySelector('[data-nav-tab="profile"]'),skillBadge+(upgrade?1:0));
  addBadge(nav.querySelector('[data-nav-tab="progress"]'),achievement);
  addBadge(nav.querySelector('[data-nav-tab="shop"]'),chest?1:0);
  const skillsTab=root.querySelector('[data-tab="skills"]');addBadge(skillsTab,skillBadge);
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
   const art=item.type==="equipment"?relicIconHtml(item,item.slot):inventoryIconHtml(item,false);
   return '<article class="tb-loot-row rarity-'+rarityClass(item.rarity)+'"><span class="tb-loot-art">'+art+'</span><span class="tb-loot-copy"><b>'+esc(itemDisplayName(item))+'</b><small>'+esc(item.rarity||itemTypeName(item.type))+(item.branchName?' · '+esc(item.branchName):'')+'</small></span>'+status+'</article>';
  }).join("");
  return '<div class="tb-loot-overlay" role="presentation"><section class="tb-loot-modal" role="dialog" aria-modal="true" aria-label="Добыча"><div class="tb-loot-eyebrow">TOWERBOUND · НАГРАДА</div><h2>БОЙ ЗАВЕРШЕН</h2><div class="tb-loot-rewards"><span>✦ '+Number(postBattleSummary.xp||0)+' опыта</span><span>◈ '+Number(postBattleSummary.silver||0)+' серебра</span></div>'+(rows?'<h3>ДОБЫЧА</h3><div class="tb-loot-list">'+rows+'</div>':'<p class="tb-loot-empty">Предметы не выпали. Можно продолжить с карты.</p>')+'<button type="button" data-loot-continue class="tb-loot-continue">ЗАВЕРШИТЬ</button></section></div>';
 }

 function renderCollection(c){
  const subnav='<div class="tb-collection-subtabs"><button type="button" data-collection-tab="collection" class="'+(collectionTab==="collection"?"active":"")+'">ЭКИПИРОВКА</button><button type="button" data-collection-tab="bestiary" class="'+(collectionTab==="bestiary"?"active":"")+'">БЕСТИАРИЙ</button></div>';
  if(collectionTab==="bestiary"){
   const kills=c.stats?.killsByMob||{},mobRows=Object.keys(mobPortraits||{}).map(id=>({id,type:"normal"})).concat(Object.keys(bossPortraitsById||{}).map(id=>({id,type:"boss"})));
   const cards=mobRows.map(entry=>{const count=Number(kills[entry.id]||0),known=count>0,name=(balance.mobs?.catalog||[]).find(item=>String(item.id||item.key||"").toLowerCase()===entry.id)?.name||entry.id.replace(/-/g," ").replace(/\b\w/g,ch=>ch.toUpperCase());return '<article class="tb-bestiary-card '+(known?"is-known":"is-unknown")+'"><div class="tb-bestiary-art"><img src="'+esc(enemyPortrait({mobId:entry.id,type:entry.type}))+'" alt="" '+(known?'':'style="filter:brightness(0) grayscale(1);opacity:.32"')+'></div><b>'+esc(known?name:"Неизвестный противник")+'</b><small>'+esc(entry.type==="boss"?"БОСС":"ОБЫЧНЫЙ ВРАГ")+'</small><small>'+(known?"Побед: "+count:"Не побеждён")+'</small></article>';}).join("");
   return subnav+'<header class="tb-collection-header"><div><h2>БЕСТИАРИЙ</h2><p>Кодекс существ Башни · силуэты скрывают неизвестных врагов</p></div><strong>'+mobRows.filter(entry=>Number(kills[entry.id]||0)>0).length+' / '+mobRows.length+'</strong></header><div class="tb-bestiary-grid">'+(cards||'<p class="tb-lock">Записи пока не открыты.</p>')+'</div>';
  }
  const allClasses=balance.classes?.classes||{},currentClassId=c.classId||c.cls,classes=currentClassId&&allClasses[currentClassId]?{[currentClassId]:allClasses[currentClassId]}:{},rarities=["Обычная","Редкая","Эпическая","Легендарная","Богоподобная"],slots=["weapon","chest","head","legs","hands","accessory"],slotNames={weapon:"Оружие",chest:"Нагрудник",head:"Шлем",legs:"Поножи",hands:"Перчатки",accessory:"Аксессуар"},rarityScale={"Обычная":1,"Редкая":1.35,"Эпическая":1.8,"Легендарная":2.4,"Богоподобная":3.2},rarityPrefix={"Обычная":"Обычный","Редкая":"Редкий","Эпическая":"Эпический","Легендарная":"Легендарный","Богоподобная":"Богоподобный"};
  const owned=[...(c.bag||[]),...(c.gear||[]).filter(Boolean)].filter(item=>item&&item.type==="equipment"&&item.stats),catalog=[];
  Object.entries(classes).forEach(([classId,classInfo])=>(classInfo.branches||[]).forEach(branch=>{
   slots.forEach(slot=>rarities.forEach(rarity=>{
    const scale=2.65*rarityScale[rarity];let stats;
    if(slot==="weapon")stats={attack:Math.max(1,Math.round(scale*1.8)),crit:rarityScale[rarity]>=1.8?0.01:0};
    else if(slot==="chest")stats={defense:Math.max(1,Math.round(scale*1.1)),health:Math.max(5,Math.round(scale*6))};
    else if(slot==="head")stats={defense:Math.max(1,Math.round(scale*.8)),health:Math.max(3,Math.round(scale*2.5))};
    else if(slot==="legs")stats={defense:Math.max(1,Math.round(scale*.65)),health:Math.max(4,Math.round(scale*3.2))};
    else if(slot==="hands")stats={attack:Math.max(1,Math.round(scale*.55)),defense:Math.max(1,Math.round(scale*.3)),crit:rarityScale[rarity]>=1.8?0.008:0};
    else stats={attack:Math.max(1,Math.round(scale*.8)),health:Math.max(2,Math.round(scale*1.5)),crit:Math.min(.08,.005*rarityScale[rarity]),spellPower:Math.max(0,Math.round(scale*.45))};
    const branchName=branch.set?.name||branch.theme||branch.name||branch.id,itemName=rarityPrefix[rarity]+" · "+branchName+" · "+slotNames[slot],match=owned.find(item=>item.branch===branch.id&&item.slot===slot&&item.rarity===rarity);
    catalog.push({key:[classId,branch.id,slot,rarity].join("::"),classId,className:classInfo.name||classId,branchId:branch.id,branchName,slot,rarity,stats,itemName,owned:!!match,item:match||null});
   }));
  }));
  const statNames={attack:"АТК",defense:"ЗАЩ",health:"HP",crit:"КРИТ",spellPower:"МАГИЯ",fireDamage:"ОГОНЬ",iceDamage:"ЛЁД",darkDamage:"ТЬМА"};
  const percentStats=new Set(["crit","critDamage","evasion","dodge","attackSpeed","critChance","criticalChance","critical_chance","crit_chance","evasionChance","evasion_chance","dodgeChance","fireDamage","iceDamage","darkDamage"]);
  const formatCollectionStat=(key,value)=>percentStats.has(key)?((Number(value)>0?"+":"")+(Number(value)*100).toFixed(1).replace(/\.0$/,"")+"%"):((Number(value)>0?"+":"")+Number(value).toFixed(0));
  const statMarkup=item=>Object.entries(item?.stats||{}).filter(([,v])=>Number(v)!==0).map(([key,value])=>'<span>'+esc(statNames[key]||key)+' '+formatCollectionStat(key,value)+'</span>').join("");
  const grouped=Object.entries(classes).map(([classId,classInfo])=>'<section class="tb-collection-class"><h3>'+esc(classInfo.name||classId)+'</h3>'+
   (classInfo.branches||[]).map(branch=>{
    const entries=catalog.filter(item=>item.classId===classId&&item.branchId===branch.id);
    return '<section class="tb-collection-branch"><h4>'+esc(branch.set?.name||branch.name||branch.id)+' <small>'+entries.filter(item=>item.owned).length+'/30</small></h4>'+
     rarities.map(rarity=>{
      const cards=entries.filter(item=>item.rarity===rarity).map(item=>'<button type="button" class="tb-collection-item rarity-'+rarityClass(item.rarity)+(item.owned?" is-owned":" is-locked")+'" data-collection-item="'+esc(item.key)+'"><span class="tb-collection-art">'+(item.owned?relicIconHtml(item.item,item.slot):relicIconHtml({rarity:item.rarity,slot:item.slot,name:item.itemName},item.slot))+'</span><b>'+esc(slotNames[item.slot])+'</b><small>'+esc(item.rarity)+'</small></button>').join("");
      return '<section class="tb-collection-rarity"><h5>'+esc(rarity)+' <small>'+entries.filter(item=>item.rarity===rarity&&item.owned).length+'/6</small></h5><div class="tb-collection-grid">'+cards+'</div></section>';
     }).join("")+'</section>';
   }).join("")+'</section>').join("");
  const current=catalog.find(item=>item.key===collectionSelection);
  const currentItem=current?.item||null;
  const currentEquipped=!!(current?.owned&&currentItem&&(c.gear||[]).some(item=>item?.id===currentItem.id));
  const currentGems=currentItem?installedGemsOf(currentItem):[];
  const activeBranch=typeof c.branch==="object"?c.branch?.id:c.branch;
  const currentIsWeapon=current?.slot==="weapon";
  const hasMatchingStone=(c.bag||[]).some(stone=>{
   if(stone.type!=="enhancement_stone")return false;
   const stoneType=stone.stoneType||stone.stone_type||{},stoneBranch=stoneType.branch_id||stoneType.branchId;
   return (stoneType.class_id||stoneType.classId)===c.classId&&String(stoneBranch||"")===String(activeBranch||"")&&(!stoneType.slot||(stoneType.slot==="weapon")===currentIsWeapon);
  });
  const currentHasRefineStone=(c.bag||[]).some(item=>item.type==="refine_stone");
  const currentHasChisel=(c.bag||[]).some(item=>item.type==="chisel");
  const currentSockets=Math.max(0,Number(currentItem?.socketsAvailable)||0);
  const maxSockets=Number(balance.equipment?.max_sockets)||0;
  const maxRefine=Number(balance.equipment?.refine_max)||20;
  const detailActions=!current?.owned?'<p class="tb-collection-missing">Предмет не найден. Выпадает с боссов/элиток.</p>':!currentEquipped?'<button type="button" class="tb-collection-equip" data-equip="'+esc(currentItem.id)+'">НАДЕТЬ</button>':[
   '<strong class="tb-collection-equipped">УЖЕ НАДЕТО</strong>',
   '<p class="tb-collection-item-progress">Заточка +'+Number(currentItem.refine||0)+' · Гнёзда '+currentGems.length+'/'+currentSockets+'</p>',
   currentHasRefineStone&&Number(currentItem.refine||0)<maxRefine?'<button type="button" class="tb-collection-action" data-refine="'+esc(currentItem.id)+'">ЗАТОЧИТЬ</button>':"",
   currentHasChisel&&currentSockets<maxSockets?'<button type="button" class="tb-collection-action" data-socket="'+esc(currentItem.id)+'">ДОБАВИТЬ ГНЕЗДО</button>':"",
   hasMatchingStone&&currentGems.length<currentSockets?'<button type="button" class="tb-collection-action" data-stone="'+esc(currentItem.id)+'">ВСТАВИТЬ КАМЕНЬ</button>':"",
   currentGems.map((gem,index)=>'<div class="tb-collection-gem-row"><span>'+esc(gem.stoneType?.name||"Камень усиления")+' · ур. '+Math.max(1,Number(gem.level)||1)+'</span><button type="button" class="tb-collection-action" data-extract-gem="'+esc(currentItem.id)+'" data-gem-index="'+index+'">ИЗВЛЕЧЬ КАМЕНЬ</button></div>').join("")
  ].join("");
  const detail=current?'<div class="tb-collection-detail-overlay"><section class="tb-collection-detail" role="dialog" aria-modal="true"><button type="button" class="tb-item-detail-close" data-collection-close>×</button><div class="tb-collection-detail-art">'+(current.owned?relicIconHtml(current.item,current.slot):relicIconHtml({rarity:current.rarity,slot:current.slot,name:current.itemName},current.slot))+'</div><h3>'+esc(current.item?.name||current.itemName)+'</h3><p>'+esc(current.className)+' · '+esc(current.branchName)+' · '+esc(slotNames[current.slot])+'</p><p>'+esc(current.rarity)+(current.item?.itemLevel?' · ур. '+current.item.itemLevel:'')+'</p><div class="tb-collection-stats">'+statMarkup(current.item||current)+'</div><div class="tb-collection-actions">'+detailActions+'</div></section></div>':'';
  return subnav+'<header class="tb-collection-header"><div><h2>КОЛЛЕКЦИЯ</h2><p>Текущий класс · все его специализации · 6 слотов · 5 редкостей</p></div><strong>'+catalog.filter(item=>item.owned).length+' / '+catalog.length+'</strong></header>'+grouped+detail;
 }
 function renderView(){
  if(!engine)return;
  syncMusic();
  const isBattle=screen==="battle"&&!!battle;
  document.body.classList.toggle("tb-battle-lock",isBattle);
  document.documentElement.classList.toggle("tb-battle-lock",isBattle);
  if(isBattle){
   const existing=root.querySelector(".v2-battle-wrap"),key=battleRenderKey();
   if(existing&&existing.dataset.renderKey===key){updateBattleDOM();ensureBottomNav();return;}
   root.innerHTML='<div class="tb-v2">'+battleScreen()+'</div>';
   const arena=root.querySelector(".v2-battle-wrap");if(arena)arena.dataset.renderKey=key;
  }else if(screen==="characters")root.innerHTML='<div class="tb-v2">'+characterList()+'</div>';
  else if(screen==="map")root.innerHTML='<div class="tb-v2">'+mapScreen()+'</div>';
  else if(screen==="profile")root.innerHTML='<div class="tb-v2">'+profileScreen()+'</div>';
  else if(screen==="shop")root.innerHTML='<div class="tb-v2">'+shopScreen()+'</div>';
  else if(screen==="systems")root.innerHTML='<div class="tb-v2">'+systemsScreen()+'</div>';
  else if(screen==="account")root.innerHTML='<div class="tb-v2">'+accountScreen()+'</div>';
  else if(screen==="progress")root.innerHTML='<div class="tb-v2">'+progressScreen()+'</div>';
  else if(screen==="leaderboard")root.innerHTML='<div class="tb-v2">'+leaderboardScreen()+'</div>';
  else if(screen==="death")root.innerHTML='<div class="tb-v2">'+deathScreen()+'</div>';
  else root.innerHTML='<div class="tb-v2">'+characterList()+'</div>';
  let toast=root.querySelector(".tb-toast");
  if(!toast){toast=document.createElement("div");toast.className="tb-toast";root.querySelector(".tb-v2").appendChild(toast);}
  if(toastMessage){toast.textContent=toastMessage;}
  root.querySelectorAll(".tb-map-node").forEach(node=>{if(Number(node.dataset.stage)===selectedStage)node.classList.add("selected");});
  ensureBottomNav();
  if(postBattleSummary?.ready===true&&!battle&&screen==="map")root.querySelector(".tb-v2")?.insertAdjacentHTML("beforeend",lootSummaryModal());
 }
 function renderWithScrollSave(){
  const container=document.getElementById('tbRpg')||document.querySelector('.profile');
  const scrollHost=container?.querySelector('.tb-v2')||container;
  const scrollPos=scrollHost?scrollHost.scrollTop:(window.scrollY||0);
  renderView();
  const restore=()=>{const next=document.getElementById('tbRpg')||document.querySelector('.profile');const host=next?.querySelector('.tb-v2')||next;if(host)host.scrollTop=scrollPos;else window.scrollTo(0,scrollPos);};
  restore();if(typeof requestAnimationFrame==='function')requestAnimationFrame(restore);
 }
 function render(){return renderWithScrollSave();}
 function createCharacter(){
  const name=root.querySelector("#name")?.value||"";
  try{const created=engine.createCharacter(name,selectedClass);selectedId=created.id;engine.state.activeCharacterId=created.id;dialogOpen=false;screen="characters";selectedStage=1;save();render();notify("Персонаж создан · стартовый набор: 100 серебра, 3 зелья и 24 часа премиума");}
  catch(error){notify(error.message);}
 }
 function handleClick(event){
  const target=event.target.closest("[data-loot-continue],[data-skill-upgrade-open],[data-skill-upgrade-type],[data-skill-upgrade-close],[data-skill-upgrade-backdrop],[data-collection-item],[data-collection-close],[data-collection-tab],[data-bag-filter],[data-item-select],[data-action],[data-pick],[data-class],[data-stage],[data-tab],[data-branch],[data-talent],[data-select-skill],[data-daily-claim],[data-equip],[data-refine],[data-socket],[data-enchant],[data-merge],[data-use],[data-buy],[data-shop-tab],[data-belt-assign],[data-belt-use],[data-achievement],[data-lore],[data-stash-deposit],[data-stash-withdraw],[data-pvp-buy],[data-paragon-stat],[data-salvage],[data-craft-stone],[data-stone],[data-extract-gem],[data-inspect-stone],[data-target],[data-route],[data-panel-skill],[data-replace-skill],[data-close-skill-replace],[data-counter],[data-ultimate],[data-basic-attack]");
  if(!target||!root.contains(target)&&!document.getElementById("rpgDialog")?.contains(target))return;
  event.preventDefault();
  if(target.dataset.lootContinue!==undefined){postBattleSummary=null;screen="map";save();render();return;}
  playSfx("click");
  if(target.dataset.collectionItem){collectionSelection=target.dataset.collectionItem;render();return;}if(target.dataset.collectionClose!==undefined){collectionSelection=null;render();return;}if(target.dataset.collectionTab){collectionTab=target.dataset.collectionTab;collectionSelection=null;render();return;}if(target.dataset.bagFilter){bagFilter=target.dataset.bagFilter;selectedItemId=null;render();return;}if(target.dataset.itemSelect!==undefined){selectedItemId=target.dataset.itemSelect||null;render();return;}if(target.dataset.route){routeChoice=target.dataset.route;render();return;}if(target.dataset.pick){selectedId=target.dataset.pick;pendingBranchId=null;engine.state.activeCharacterId=selectedId;selectedStage=live().progress.currentStage;render();return;}
  if(target.dataset.class){selectedClass=target.dataset.class;render();return;}
  if(target.dataset.stage){selectedStage=Number(target.dataset.stage);render();return;}
   if(target.dataset.runModifier){try{const selected=engine.setRunModifier(live().id,target.dataset.runModifier);save();render();notify("Модификатор забега: "+selected.name);}catch(error){notify(error.message);}return;}
   if(target.dataset.weeklyClaim){try{engine.claimWeeklyQuest(live().id,target.dataset.weeklyClaim);save();render();notify("Еженедельное задание: награда получена");}catch(error){notify(error.message);}return;}
   if(target.dataset.cosmeticChest){try{const item=engine.buyCosmeticChest(target.dataset.cosmeticChest);save();render();notify("Получена косметика: "+item.name);}catch(error){notify(error.message);}return;}
   if(target.dataset.equipCosmetic){try{const item=engine.equipCosmetic(target.dataset.equipCosmetic);save();render();notify("Косметика надета: "+item.name);}catch(error){notify(error.message);}return;}
  if(target.dataset.skillUpgradeClose!==undefined||target.dataset.skillUpgradeBackdrop!==undefined){pendingSkillUpgradeId=null;render();return;}
  if(target.dataset.skillUpgradeOpen){const c=live(),skill=availableSkillForUpgrade(c,target.dataset.skillUpgradeOpen),next=skill?getSkillStats(c,skill).level+1:4;if(!skill||next>3||c.level<SKILL_UPGRADE_LEVELS[next]){notify("Улучшение пока недоступно");return;}pendingSkillUpgradeId=skill.id;render();return;}
  if(target.dataset.skillUpgradeType){const c=live(),skill=availableSkillForUpgrade(c,pendingSkillUpgradeId),next=skill?getSkillStats(c,skill).level+1:4;if(!skill||next>3||c.level<SKILL_UPGRADE_LEVELS[next]){pendingSkillUpgradeId=null;render();notify("Улучшение недоступно");return;}c.skillUpgrades=c.skillUpgrades||{};c.skillUpgrades[skill.id]={level:next,type:target.dataset.skillUpgradeType==="cost"?"cost":"power"};pendingSkillUpgradeId=null;save();render();notify("Умение улучшено: "+skill.name+" · "+next+"/3");return;}
  if(target.dataset.tab){profileTab=target.dataset.tab;pendingSkillUpgradeId=null;render();return;}
  if(target.dataset.shopTab){shopTab=target.dataset.shopTab;render();return;}
  if(target.dataset.branch){pendingBranchId=target.dataset.branch;render();return;}
  if(target.dataset.action==="confirm-branch"){if(!pendingBranchId)return;try{engine.chooseBranch(live().id,pendingBranchId);const chosen=pendingBranchId;pendingBranchId=null;save();render();notify("Специализация выбрана: "+((classData(live()).branches||[]).find(item=>item.id===chosen)?.name||chosen));}catch(error){notify(error.message);}return;}
  if(target.dataset.action==="cancel-branch"){pendingBranchId=null;render();return;}
  if(target.dataset.talent){try{engine.useTalentPoint(live().id,target.dataset.talent,3);save();render();}catch(error){notify(error.message);}return;}
  if(target.dataset.target!==undefined){setBattleTarget(Number(target.dataset.target));return;}
  if(target.dataset.basicAttack!==undefined){basicAttack();return;}
  if(target.dataset.panelSkill){playerAction(target.dataset.panelSkill,Number(target.dataset.panelSlot));return;}
  if(target.dataset.counter!==undefined){useCounterSkill();return;}
  if(target.dataset.ultimate!==undefined){useUltimate();return;}
  if(target.dataset.closeSkillReplace!==undefined){target.closest('.tb-skill-replace-overlay')?.remove();return;}
  if(target.dataset.replaceSkill!==undefined){const modal=target.closest('.tb-skill-replace-overlay'),skillId=modal?.dataset.pendingSkill,index=Number(target.dataset.replaceSkill),c=live();if(!c||!skillId||!Number.isInteger(index)||index<0||index>=6)return;const chosen=Array.isArray(c.activeSkills)?c.activeSkills:[];chosen[index]=skillId;c.activeSkills=chosen;c.skillLoadout=chosen;modal.remove();save();render();notify('Панель умений обновлена');return;}
  if(target.dataset.selectSkill){
   const c=live(),def=classData(c),base=(def.base_skills||[]).find(skill=>skill.id===target.dataset.selectSkill);
   const selected=base||skills.find(skill=>skill.id===target.dataset.selectSkill);
   if(!selected||selected.unlock_level>c.level||(selected.branch_id&&selected.branch_id!==c.branch)){notify("Умение недоступно для текущего уровня или ветки");return;}
   const chosen=Array.isArray(c.activeSkills)?c.activeSkills:ensureLoadout(c).filter(Boolean).map(skill=>skill.id);if(chosen.includes(selected.id)){notify('Это умение уже выбрано');return;}if(chosen.length<6){chosen.push(selected.id);c.activeSkills=chosen;c.skillLoadout=chosen;save();render();notify('Умение добавлено на панель: '+selected.name);return;}const overlay=document.createElement('div');overlay.className='tb-skill-replace-overlay';overlay.dataset.pendingSkill=selected.id;overlay.innerHTML='<section role="dialog" aria-modal="true" class="tb-skill-replace-dialog"><h3>Все 6 слотов заняты</h3><p>Выбери умение, которое заменить на «'+esc(selected.name)+'».</p>'+chosen.map((id,index)=>{const current=resolveSkill(c,id);return '<button type="button" data-replace-skill="'+index+'">'+(index+1)+'. '+esc(current?.name||id)+'</button>';}).join('')+'<button type="button" data-close-skill-replace="1">ОТМЕНА</button></section>';root.querySelector('.tb-v2')?.appendChild(overlay);return;
  }
  if(target.dataset.beltAssign){const slot=Number(window.prompt("Назначить в слот пояса (1–5):"))-1;try{engine.assignPotionBelt(live().id,slot,target.dataset.beltAssign);save();render();notify("Зелье назначено в слот "+(slot+1));}catch(error){notify(error.message);}return;}
  if(target.dataset.beltUse!==undefined){try{if(battle.potionUsedThisTurn||battle.actor?.type!=="player")throw new Error("Зелье уже использовано в этом ходу");engine.usePotionBelt(live().id,Number(target.dataset.beltUse));battle.potionUsedThisTurn=true;save();render();notify("Зелье использовано · +40% максимального HP");}catch(error){notify(error.message);}return;}
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
  if(target.dataset.inspectStone){const stone=live().bag.find(x=>x.id===target.dataset.inspectStone);if(stone)notify((stone.stoneType?.name||"Камень усиления")+" · "+stoneDescription(stone));return;}
  if(target.dataset.extractGem){try{const gem=engine.extractGem(live().id,target.dataset.extractGem,Number(target.dataset.gemIndex));save();render();notify("Камень извлечён в рюкзак: "+(gem.stoneType?.name||"камень"));}catch(error){notify(error.message);}return;}
  if(target.dataset.stone){try{
   const c=live(),item=c.gear.find(x=>x&&x.id===target.dataset.stone);
   if(!item)throw new Error("Предмет экипировки не найден");
   const activeBranch=typeof c.branch==="object"?c.branch.id:c.branch,weapon=item.slot==="weapon"||item.slot===0;
   const stone=c.bag.find(x=>{
    if(x.type!=="enhancement_stone")return false;
    const t=x.stoneType||x.stone_type||{},stoneBranch=t.branch_id||t.branchId;
    if((t.class_id||t.classId)!==c.classId||String(stoneBranch||"")!==String(activeBranch||""))return false;
    return !t.slot||(t.slot==="weapon")===weapon;
   });
   if(!stone)throw new Error("Нет подходящего камня в рюкзаке для этого предмета и специализации");
   if(installedGemsOf(item).length>=(Number(item.socketsAvailable)||0))throw new Error("Нет свободного гнезда: сначала используй долото");
   engine.insertGem(c.id,item.id,stone.id);save();render();notify("Камень вставлен: "+(stone.stoneType?.name||"камень"));
  }catch(error){notify(error.message);}return;}
  if(target.dataset.enchant){try{const c=live(),choices=engine.rollEnchantScroll(c.id,target.dataset.enchant),choice=Number(window.prompt("Выбери зачарование (1–4):\n"+choices.map((x,i)=>(i+1)+". "+x).join("\n")))-1;if(Number.isInteger(choice)&&choice>=0&&choice<4){engine.applyEnchant(c.id,target.dataset.enchant,choice,choices);save();render();notify("Зачарование применено");}else notify("Зачарование отменено");}catch(error){notify(error.message);}return;}
  if(target.dataset.buy){try{engine.purchase(live().id,shopTab,target.dataset.buy);save();render();notify("Покупка совершена");}catch(error){notify(error.message);}return;}
  switch(target.dataset.action){
   case "dismiss-turn-tutorial":if(battle){battle.showTutorial=false;localStorage.setItem("tb-turn-tutorial-seen-v1","1");render();}break;
   case "new":if(!window.TowerboundCloud?.signedIn){notify("Сначала войди в игровой аккаунт");return;}if(engine.state.characters.length>=balance.account.max_characters){notify("Достигнут лимит персонажей: "+balance.account.max_characters);return;}dialogOpen=true;selectedClass="assassin";render();break;
   case "close":dialogOpen=false;render();break;
   case "confirm-create":createCharacter();break;
   case "play":if(!selectedId&&engine.state.characters[0])selectedId=engine.state.characters[0].id;if(!selectedId){notify("Сначала создай персонажа");return;}engine.state.activeCharacterId=selectedId;selectedStage=live().progress.currentStage;screen="map";render();save();break;
   case "characters":screen="characters";render();break;
   case "map":stopBattleStatusLoop();clearPendingTurnTimer();if(battle)battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;screen="map";battle=null;render();save();break;
   case "bottom-map":stopBattleStatusLoop();clearPendingTurnTimer();if(battle)battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;battle=null;screen="map";render();save();break;
   case "bottom-profile":profileTab="stats";screen="profile";render();break;
   case "bottom-shop":screen="shop";render();break;
   case "bottom-progress":screen="progress";render();break;
   case "bottom-account":screen="account";render();break;
   case "reset-current-battle":{const c=live(),stage=c?.run?.stage?.stage||c?.progress?.currentStage||selectedStage;stopBattleStatusLoop();clearPendingTurnTimer();if(battle)battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;if(c?.run){c.run.stage=null;c.run.active=true;}battle=null;selectedStage=Math.max(1,Math.min(balance.map.total_stages,stage));screen="map";save();render();notify("Бой сброшен · этап "+selectedStage+" можно начать заново");break;}
   case "profile":profileTab="stats";screen="profile";render();break;
   case "profile-gear":profileTab="gear";screen="profile";render();break;
   case "toggle-mute":engine.saveSettings({sound_enabled:settings().sound_enabled===false});save();render();notify(settings().sound_enabled===false?"Звук выключен":"Звук включён");break;
   case "empty-login":case "empty-register":(async()=>{const cloud=window.TowerboundCloud,login=root.querySelector('#login')?.value||'',password=root.querySelector('#pass')?.value||'',remember=!!root.querySelector('#rememberMe')?.checked,message=root.querySelector('.tb-login-message'),action=target.dataset.action;try{if(!cloud)throw new Error('Облачный модуль ещё загружается');if(!cloud.configured)throw new Error('Supabase не настроен: проверь URL и publishable key');if(message){message.classList.remove('is-error');message.textContent=action==='empty-login'?'Входим в игру…':'Создаём аккаунт…';}if(action==='empty-login')await cloud.signIn(login,password,remember);else await cloud.signUp(login,password,remember);if(cloud.signedIn){render();notify('Аккаунт подключён');}else if(message)message.textContent='Регистрация отправлена. Если включено подтверждение email, настрой его в Supabase Auth, затем войди.';}catch(error){if(message){message.textContent=error.message||'Ошибка авторизации';message.classList.add('is-error');}else notify(error.message||'Ошибка авторизации');}})();break;
   case "account-login":case "account-register":(async()=>{const cloud=window.TowerboundCloud,login=root.querySelector('#tbAccountLogin')?.value||'',password=root.querySelector('#tbAccountPassword')?.value||'',remember=!!root.querySelector('#tbAccountRemember')?.checked;try{if(!cloud)throw new Error('Облачный модуль ещё загружается');if(target.dataset.action==='account-login')await cloud.signIn(login,password,remember);else await cloud.signUp(login,password,remember);render();notify('Аккаунт подключён');}catch(error){const message=root.querySelector('.tb-account-message');if(message){message.textContent=error.message||'Ошибка авторизации';message.classList.add('is-error');}else notify(error.message);}})();break;
   case "account-logout":(async()=>{try{await window.TowerboundCloud.signOut();render();notify('Вы вышли из аккаунта');}catch(error){notify(error.message);}})();break;
   case "account-sync":(async()=>{try{await window.TowerboundCloud.syncNow();render();notify('Синхронизировано');}catch(error){notify(error.message);}})();break;
   case "cloud-account":if(window.TowerboundCloud?.open)window.TowerboundCloud.open();else notify("Облачный модуль ещё загружается");break;
   case "cloud-sync":(async()=>{try{const cloud=window.TowerboundCloud;if(!cloud?.syncNow)throw new Error("Облачный модуль недоступен");await cloud.syncNow();notify("Облачное сохранение синхронизировано");}catch(error){notify(error.message||"Не удалось синхронизировать");}})();break;
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
   case "start":beginStage();break;
   case "daily-challenge":try{const c=live();if(c.run.stage)throw new Error("Сначала заверши текущий бой");c.run.dailyChallengeActive=true;c.run.dailyChallengeDate=dailyChallengeDate();selectedStage=c.progress.currentStage;beginStage();}catch(error){notify(error.message);}break;
   case "attack":basicAttack();break;
   case "end-turn":endTurnButton();break;
   case "equip-best":try{const result=engine.equipBest(live().id);save();render();notify("Экипировано предметов: "+result.equipped);}catch(error){notify(error.message);}break;
   case "salvage-gray":try{const result=engine.salvageGrayItems(live().id);save();render();notify("Разобрано серых предметов: "+result.count+" · +"+result.materials+" материалов");}catch(error){notify(error.message);}break;
   case "skill":{const skill=activeSkill(live());if(skill)playerAction(skill.id,0);else notify("Нет доступного атакующего умения");break;}
   case "potion":try{engine.useHealingPotion(live().id);save();render();notify("Зелье использовано. Слот этой цели потрачен.");}catch(error){notify(error.message);}break;
   case "speed":try{engine.setSpeed2(live().id,!live().run.speed2,battle.stage);preferredSpeed2=live().run.speed2;localStorage.setItem("tb-rpg-speed-v2",preferredSpeed2?"2":"1");save();render();}catch(error){notify(error.message);}break;
   case "pause":if(battle){
    if(!battle.paused){
     battle.paused=true;
     if(pendingTimer){clearTimeout(pendingTimer);pendingTimer=null;}
     const until=Number(battle.telegraph?.until),remaining=Number(battle.remainingResponseMs);
     battle.remainingResponseMs=Number.isFinite(remaining)&&remaining>0?remaining:(Number.isFinite(until)&&until>0?Math.max(0,until-Date.now()):0);
    }else{
     battle.paused=false;
     if(battle.telegraph){
      const remaining=Number(battle.remainingResponseMs),until=Number(battle.telegraph.until);
      const delay=Number.isFinite(remaining)&&remaining>0?remaining:(Number.isFinite(until)&&until>0?Math.max(0,until-Date.now()):0);
      const safeDelay=safeTimeoutMs(delay,0);
      battle.telegraph.until=Date.now()+safeDelay;battle.remainingResponseMs=0;
      clearTimeout(pendingTimer);pendingTimer=setTimeout(()=>{pendingTimer=null;resolveEnemyTelegraph();},safeDelay);
     }else scheduleEnemyTelegraph();
    }
    save();render();
   }break;
   case "heal-checkpoint":try{const result=engine.checkpointHeal(live().id);save();render();notify("HP восстановлено · −20% XP до этапа "+result.penaltyUntil);}catch(error){notify(error.message);}break;
   case "auto":try{if(!live().run.runModifierId)throw new Error("Сначала выбери модификатор забега");const result=engine.autoBattle(live().id);selectedStage=live().progress.currentStage;save();render();notify("Авто-бой: "+result.cleared+" этапов · "+result.xp+" опыта · "+result.stopped);}catch(error){notify(error.message);}break;
   case "restart":try{engine.voluntaryRestart(live().id);selectedStage=1;screen="characters";battle=null;save();render();notify("Забег завершён добровольно · весь опыт сохранён");}catch(error){notify(error.message);}break;
   case "reset-talents":try{engine.resetTalents(live().id);save();render();notify("Таланты сброшены");}catch(error){notify(error.message);}break;
   case "revive":{try{const c=live(),result=engine.reviveFromDeath(c.id),stage=c.run.stage;battle={stage:stage.stage,count:stage.count,enemy:null,enemyHp:0,enemyMax:0,shield:0,turns:0,busy:false,isPlayerTurn:true,timerRemainingMs:0,timerStartedAt:0,remainingResponseMs:0,enemies:null,targetIndex:stage.targetIndex??stage.enemyIndex??0,comboStacks:0,skillCooldowns:{},counterReadyAt:0,ultimateReadyAt:0,comboProgress:{},attacksThisFight:0,distinctElements:[],buffsUsed:0,poisonDots:[],telegraph:null,paused:false,proc:null,fx:null,enemyQueueToken:0};loadBattleEnemy(stage.targetIndex??stage.enemyIndex??0);if(stage.uiBattleSnapshot){const snap=stage.uiBattleSnapshot;battle.enemies=snap.enemies;battle.comboStacks=snap.comboStacks;battle.skillCooldowns=snap.skillCooldowns;battle.comboProgress=snap.comboProgress;const ix=snap.targetIndex??stage.targetIndex??stage.enemyIndex??0;if(battle.enemies[ix]?.alive){engine.selectTarget(c.id,ix);battle.targetIndex=ix;battle.enemy=battle.enemies[ix];battle.enemyStats=engine.getEnemyStats(c.id,battle.stage,battle.enemy);battle.enemyHp=battle.enemy.hp;battle.enemyMax=battle.enemy.maxHp;battle.shield=battle.enemy.shield||0;}}screen="battle";startBattleStatusLoop();save();render();notify("Воскрешение · −"+result.price+" алмазов · 50% HP");}catch(error){notify(error.message);}break;}
    case "confirm-death":{const result=engine.confirmDeath(live().id);selectedId=live().id;selectedStage=live().progress.currentStage;screen="map";save();render();notify(result.runEnded?"Все жизни потеряны · забег начнётся с этапа 1":"Потеряна одна жизнь · осталось "+result.livesRemaining+" · продолжаем с этапа "+selectedStage);break;}
  }
 }
 root.addEventListener("pointerup",function(event){if(event.target.closest(".tb-v2"))event.stopImmediatePropagation();},true);
 root.addEventListener("pointerover",event=>{const option=event.target.closest("[data-branch-preview]");const panel=root.querySelector("#tbBranchDescription");if(option&&panel)panel.textContent=option.dataset.branchPreview;});
 root.addEventListener("focusin",event=>{const option=event.target.closest("[data-branch-preview]");const panel=root.querySelector("#tbBranchDescription");if(option&&panel)panel.textContent=option.dataset.branchPreview;});
 root.addEventListener("pointerout",event=>{const option=event.target.closest("[data-branch-preview]");if(!option||option.contains(event.relatedTarget))return;const panel=root.querySelector("#tbBranchDescription"),c=live();if(panel&&c){const chosen=(classData(c).branches||[]).find(item=>item.id===c.branch);panel.textContent=chosen?specializationDescription(c.classId,chosen.id):"Нажми или наведи на ветку, чтобы прочитать её механику.";}});
 document.addEventListener("click",handleClick);
  window.addEventListener("towerbound-auth-change",()=>{if(screen==="characters")render();});
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
 function pauseForFocusLoss(){if((engine.state.account.settings||{}).auto_pause_on_blur===false)return;if(screen==="battle"&&battle&&!battle.paused){battle.paused=true;if(pendingTimer){clearTimeout(pendingTimer);pendingTimer=null;battle.remainingResponseMs=Math.max(0,(battle.telegraph?.until||Date.now())-Date.now());}save();render();}}
 document.addEventListener("visibilitychange",()=>{if(document.hidden)pauseForFocusLoss();});window.addEventListener("blur",pauseForFocusLoss);
 window.addEventListener("pagehide",()=>{try{if(engine&&live()){engine.publishGhostSnapshot(live().id,"exit");save();}}catch(error){console.warn("Ghost snapshot on exit failed",error);}});
 function boot(){
  if(!window.TowerboundReworkReady)return;
  window.TowerboundReworkReady.then(async value=>{
   if(!value)return;
   engine=value;balance=engine.balance;
   try{const response=await fetch("./configs/skills/catalog.json?v=3");if(!response.ok)throw new Error("HTTP "+response.status+" loading ./configs/skills/catalog.json");const catalog=await response.json();if(!Array.isArray(catalog))throw new Error("Skill catalog must be an array");skills=catalog;console.info("SKILL CATALOG READY:",{count:skills.length,classes:[...new Set(skills.map(skill=>skill.class_id))]});}catch(error){skills=[];console.error("Skill catalog unavailable",error);}
   if(engine.state.characters.length){
    selectedId=engine.state.activeCharacterId||engine.state.characters[0].id;
    const active=engine.state.characters.find(character=>character.id===selectedId);
    if(active?.run?.stage){
     const repaired=engine.sanitizeActiveStage(active.id);
     if(repaired.processed?.length||repaired.completed){save();console.info("[Towerbound] repaired saved combat state",repaired);}
     if(repaired.completed)notify("Сохранённый бой завершён · награды начислены, возвращаемся на карту");
    }
    screen="characters";
   }
   document.body.classList.toggle("tb-clean-ui",!!engine.state.account.settings?.clean_ui);
   render();
  }).catch(error=>console.error("Towerbound rework UI failed",error));
 }
 boot();
 window.TowerboundReworkUI={showMap:()=>{stopBattleStatusLoop();clearPendingTurnTimer();if(battle)battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;battle=null;screen="map";render();save();}};
})();