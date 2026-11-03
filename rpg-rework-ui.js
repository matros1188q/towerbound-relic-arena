(function(){
 "use strict";
 const root=document.getElementById("tbRpg");
 if(!root)return;
 const classPortraits={assassin:"reaper",bishop:"arcanist",dragonkin:"warden",destroyer:"warden",elemental:"arcanist",duelist:"ranger",shaman:"reaper"};
 const classFallback={assassin:"Ас",bishop:"Еп",dragonkin:"Др",destroyer:"Ра",elemental:"Ма",duelist:"Ду",shaman:"Ша"};
 const tabs=[["stats","Характеристики"],["talents","Таланты"],["skills","Умения"],["gear","Экипировка"],["bag","Рюкзак"]];
 let engine=null,balance=null,skills=[],screen="characters",profileTab="stats",shopTab="silver";
 let selectedId=null,selectedClass="assassin",selectedStage=1,dialogOpen=false,battle=null,toastTimer=null,toastMessage="",preferredSpeed2=localStorage.getItem("tb-rpg-speed-v2")==="2",pendingTimer=null,statusTimer=null;
 function esc(value){return String(value===undefined||value===null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
 function live(){return engine&&engine.state.characters.find(c=>c.id===selectedId);}
 function classData(c){return balance.classes.classes[c.classId];}
 function clsName(c){return classData(c).name;}
 function portrait(id){return "./assets/characters/heroes/"+(classPortraits[id]||"warden")+".png";}
 function save(){try{localStorage.setItem("tb-rpg-v2",JSON.stringify(engine.state));}catch(e){notify("Не удалось сохранить: "+e.message);}}
 function notify(message){toastMessage=message;const el=root.querySelector(".tb-toast");if(el){el.textContent=message;el.classList.add("show");}clearTimeout(toastTimer);toastTimer=setTimeout(()=>{const x=root.querySelector(".tb-toast");if(x)x.classList.remove("show");},3200);}
 function button(action,label,attrs){return '<button type="button" data-action="'+action+'" '+(attrs||"")+'>'+label+'</button>';}
 function header(title,sub){return '<header class="tb-header"><div class="tb-brand"><span class="tb-mark">T</span><div><strong>TOWERBOUND</strong><small>'+esc(title||"ХРОНИКИ БАШНИ")+'</small></div></div><div class="tb-header-side">'+(live()?'<button class="tb-mini-avatar" id="profileOpen" data-action="profile">'+ '<img src="'+portrait(live().classId)+'" alt="'+esc(clsName(live()))+'"></button>':'')+'<span class="tb-subline">'+esc(sub||"")+'</span></div></header>';}
 function characterList(){
  const chars=engine.state.characters;
  const selected=chars.find(c=>c.id===selectedId)||chars[0];
  if(selected&&!selectedId)selectedId=selected.id;
  return header("Выбор персонажа","Аккаунт · "+(engine.state.account.diamonds||0)+" алмазов")+
   '<section class="tb-characters"><div class="tb-section-title"><div><h1>Персонажи</h1><p>Выбери героя, чтобы продолжить путь</p></div><button data-action="new" class="tb-primary">＋ СОЗДАТЬ ПЕРСОНАЖА</button></div>'+
   (chars.length?'<div class="tb-character-grid">'+chars.map(c=>{
    const d=balance.classes.classes[c.classId],chosen=c.id===selectedId;
    return '<button type="button" class="tb-character-card '+(chosen?"selected":"")+'" data-pick="'+esc(c.id)+'"><div class="tb-char-art"><img src="'+portrait(c.classId)+'" alt="'+esc(d.name)+'"></div><div class="tb-char-info"><strong>'+esc(c.name)+'</strong><span>'+esc(d.name)+' · Уровень '+c.level+'</span><small>Мощь '+engine.combatPower(c)+' · Пройдено '+c.progress.highestEver+'/250</small><small>Серебро '+c.silver+' · '+(c.branch?esc(d.branches.find(b=>b.id===c.branch)?.name||c.branch):"Без специализации")+'</small></div><span class="tb-selected-mark">'+(chosen?"✓":"")+'</span></button>';
   }).join("")+'</div>':'<div class="tb-empty"><div class="tb-empty-crest">✦</div><h2>Башня ждёт своего героя</h2><p>Создай персонажа одного из семи классов. Прогресс персонажа сохраняется между забегами.</p><button data-action="new" class="tb-primary">СОЗДАТЬ ПЕРВОГО ПЕРСОНАЖА</button></div>')+
   '<div class="tb-character-actions"><button data-action="new">Создать персонажа</button><button data-action="play" class="tb-primary" '+(!selected?"disabled":"")+'>'+(selected?"ИГРАТЬ ЗА "+esc(selected.name.toUpperCase()):"ВЫБЕРИ ПЕРСОНАЖА")+'</button></div></section>'+createDialog();
 }
 function createDialog(){
  if(!dialogOpen)return "";
  const classes=Object.entries(balance.classes.classes);
  const current=balance.classes.classes[selectedClass];
  return '<div class="tb-modal"><div class="tb-dialog"><button class="tb-close" data-action="close">×</button><div class="tb-eyebrow">НОВАЯ ГЛАВА</div><h2>Создание персонажа</h2><label class="tb-field"><span>Имя героя</span><input id="name" maxlength="18" placeholder="Введи имя персонажа"></label><div class="tb-field"><span>Выбери класс</span><div class="tb-class-picker">'+classes.map(([id,d])=>'<button type="button" data-class="'+id+'" class="'+(id===selectedClass?"active":"")+'"><img src="'+portrait(id)+'" alt=""><b>'+esc(d.name)+'</b><small>'+esc(d.role||"Герой башни")+'</small></button>').join("")+'</div></div><div class="tb-class-summary"><b>'+esc(current.name)+'</b><span>'+esc(current.role||"")+'</span><small>Ресурс: '+esc(current.resource)+' · Сильные стороны: '+esc((current.strengths||[]).join(", "))+'</small><small>Слабые стороны: '+esc((current.weaknesses||[]).join(", "))+'</small></div><button class="tb-primary tb-wide" data-action="confirm-create">СОЗДАТЬ ГЕРОЯ</button></div></div>';
 }
 function mapScreen(){
  const c=live();if(!c)return characterList();
  const daily=engine.dailySnapshot(c.id);
  const cp=c.progress.currentStage-1,healReady=balance.map.checkpoints.includes(cp)&&c.run.healingPenaltyUntil<c.progress.currentStage&&c.run.checkpointHeals<balance.healing.max_checkpoint_heals_per_run;
  const penalty=(c.run.healingPenaltyFrom||0)>0&&c.progress.currentStage>=(c.run.healingPenaltyFrom||0)&&c.progress.currentStage<=c.run.healingPenaltyUntil;
  const remaining=penalty?c.run.healingPenaltyUntil-c.progress.currentStage+1:0;
  const maxAuto=c.progress.highestEver-balance.auto_battle.highest_ever_offset;
  if(!selectedStage||selectedStage>c.progress.highestEver+1)selectedStage=c.progress.currentStage;
  let nodes="";
  for(let stage=1;stage<=balance.map.total_stages;stage++){
   const accessible=stage<=c.progress.highestEver+1,cleared=stage<=c.progress.highestEver;
   const isBoss=stage%balance.map.boss_every===0;
   const selected=stage===selectedStage;
   nodes+='<button type="button" class="tb-map-node '+(cleared?"cleared ":"")+(selected?"selected ":"")+(isBoss?"boss":"")+'" data-stage="'+stage+'" '+(!accessible?"disabled":"")+'><strong>'+(isBoss?"♛":cleared?"✓":stage)+'</strong><small>'+(isBoss?"БОСС":cleared?"ПРОЙДЕН":"ЭТАП")+'</small></button>';
  }
  return header("Карта 250 уровней",c.name+" · "+clsName(c)+" · Ур. "+c.level)+
   '<section class="tb-map-screen"><div class="tb-map-top"><div class="tb-hero-chip"><img src="'+portrait(c.classId)+'" alt=""><div><b>'+esc(c.name)+'</b><small>'+esc(clsName(c))+' · '+esc(classData(c).resource)+': '+c.resource+'/'+c.resourceMax+'</small></div></div><div class="tb-currency"><span>◈ '+c.silver+' серебра</span><span>◆ '+engine.state.account.diamonds+' алмазов</span><span>Мощь '+engine.combatPower(c)+'</span><span>♥ Жизни: '+(c.run.lives||balance.difficulty.modes[c.difficulty||balance.difficulty.default].lives)+'/'+balance.difficulty.modes[c.difficulty||balance.difficulty.default].lives+'</span></div><div class="tb-map-actions"><button data-action="characters">Персонажи</button><button data-action="shop">МАГАЗИН</button><button data-action="profile">ПЕРСОНАЖ</button><button data-action="systems">АККАУНТ</button></div></div>'+
   '<div class="tb-progressline"><span>Наивысший этап: <b>'+c.progress.highestEver+'/250</b></span><span>Следующий: <b>'+Math.min(c.progress.currentStage,250)+'</b></span><span>Чекпоинты: <b>'+c.progress.checkpoints.join(" · ")+'</b></span></div>'+
   (penalty?'<div class="tb-penalty">−20% ОПЫТА АКТИВНО · ОСТАЛОСЬ '+remaining+' ЭТАЖЕЙ</div>':"")+
   '<div class="tb-map-layout"><div class="tb-map-scroll"><div class="tb-map-grid">'+nodes+'</div></div><aside class="tb-stage-panel"><div class="tb-eyebrow">ВЫБРАННЫЙ ЭТАП</div><div class="tb-stage-number">'+selectedStage+'</div><h3>'+(selectedStage%balance.map.boss_every===0?"Боссовый бой":"Гаунтлет")+'</h3><p>'+(selectedStage%balance.map.boss_every===0?"Один босс, отдельное сражение":balance.map.gauntlet_ranges.find(r=>selectedStage>=r.min&&selectedStage<=r.max)?.allowed.join(" / ")+" противника подряд")+'</p><small>'+(selectedStage<=c.progress.highestEver?"Повторное прохождение · 50% XP": "Первое прохождение · 100% XP")+'</small><button class="tb-primary tb-wide" data-action="start" id="start">НАЧАТЬ ЭТАП</button>'+
   '<div class="tb-stage-separator"></div><div class="tb-small-actions">'+button("auto","АВТО-БОЙ ДО "+Math.max(0,maxAuto),maxAuto>=c.progress.currentStage?"":"disabled")+
   button("heal-checkpoint","ХИЛ +50% HP · −20% XP",healReady?"":"disabled")+
   button("restart","НАЧАТЬ ЗАНОВО","")+
   '</div><small class="tb-note">Авто-бой доступен только до '+Math.max(0,maxAuto)+' этапа. На боссах и элитках он остановится.</small></aside></div>'+
   '<section class="tb-daily-panel"><div class="tb-daily-heading"><div><div class="tb-eyebrow">ЕЖЕДНЕВНЫЕ ИСПЫТАНИЯ · '+esc(daily.date)+'</div><h3>Задания дня</h3></div><span class="tb-daily-modifier">'+esc(daily.modifier?.name||"Без модификатора")+'</span></div><div class="tb-daily-quests">'+daily.quests.map(q=>'<div class="tb-daily-quest"><div><b>'+esc(q.name)+'</b><small>'+q.progress+'/'+q.target+' · награда '+q.reward_silver+' серебра</small></div><button data-daily-claim="'+q.id+'" '+(!q.complete||q.claimed?"disabled":"")+'>'+(q.claimed?"ПОЛУЧЕНО":"ЗАБРАТЬ")+'</button></div>').join("")+'</div><small class="tb-note">Задания сбрасываются в 00:00 UTC. Прогресс хранится в этом браузере.</small></section><div class="tb-bottom-strip"><span>Персонаж сохраняет уровень, таланты, экипировку и серебро</span><span>'+(c.heroic?"ГЕРОИЧЕСКИЙ РЕЖИМ":"Обычный режим")+'</span></div></section>';
 }
 function branchSkills(c){return skills.filter(skill=>skill.class_id===c.classId&&skill.branch_id===c.branch).slice(0,balance.skills.skills_per_branch||10);}
 function ensureLoadout(c){
  const unlocked=branchSkills(c).filter(skill=>c.level>=skill.unlock_level);
  const chosen=(Array.isArray(c.skillLoadout)?c.skillLoadout:[]).filter(id=>unlocked.some(skill=>skill.id===id)).slice(0,4);
  for(const skill of unlocked){if(chosen.length>=4)break;if(!chosen.includes(skill.id))chosen.push(skill.id);}
  c.skillLoadout=chosen;return Array.from({length:4},(_,index)=>unlocked.find(skill=>skill.id===chosen[index])||null);
 }
 function activeSkill(c){return ensureLoadout(c).find(Boolean)||null;}
 function counterAbility(c){return balance.skills.counter_abilities[c.classId];}
 function ultimateAbility(c){return balance.skills.ultimates[c.classId];}
 function settings(){return engine?.state.account?.settings||{};}
 function elementIcon(type){return({fire:"🔥",ice:"❄",dark:"☠",physical:"⚔"})[type]||"◇";}
 function elementLabel(type){return({fire:"Огонь",ice:"Лёд",dark:"Тьма",physical:"Физический"})[type]||type;}
 function setBattleTarget(index){
  if(!battle||!battle.enemies[index]||!battle.enemies[index].alive)return;
  if(battle.telegraph){notify("Сначала разреши телеграф или примени контр-умение");return;}
  try{engine.selectTarget(live().id,index);}catch(error){notify(error.message);return;}
  battle.targetIndex=index;battle.enemy=battle.enemies[index];battle.enemyStats=engine.getEnemyStats(live().id,battle.stage,battle.enemy);
  battle.enemyHp=battle.enemy.hp;battle.enemyMax=battle.enemy.maxHp;battle.shield=battle.enemy.shield||0;
  save();render();
 }
 function updateBossPhase(){
  if(!battle||battle.enemy?.type!=="boss")return 1;
  const phaseInfo=engine.bossPhaseInfo(battle.enemyHp,battle.enemyMax),phase=phaseInfo.phase;
  if(phase!==battle.bossPhase){battle.bossPhase=phase;battle.phaseFlashUntil=Date.now()+1200;battle.phaseNotice="ФАЗА "+phase;if(!settings().disable_skill_flashes)battle.fx={kind:"phase",color:"#f3c968",until:Date.now()+650};}
  return phase;
 }
 function activeComboNextSlots(){
  if(!battle)return[];const configs=(balance.combos?.combos||[]).filter(combo=>combo.class===live().classId),slots=[];
  for(const combo of configs){const progress=battle.comboProgress?.[combo.id]||0,next=combo.chain[progress];if(next)slots.push({combo,slot:Number(String(next).replace("slot",""))-1,progress});}
  return slots;
 }
 function profileScreen(){
  const c=live();if(!c)return characterList();
  const def=classData(c),branch=(def.branches||[]).find(b=>b.id===c.branch),stats=balance.classes.base_stats,combatStats=engine.getCombatStats(c);
  const spent=Object.values(c.talents||{}).reduce((a,b)=>a+b,0),free=Math.max(0,c.talentPoints-spent);
  let body="";
  if(profileTab==="stats"){
   const gearStats=(c.gear||[]).reduce((a,i)=>{if(i&&i.stats)Object.keys(i.stats).forEach(k=>a[k]=(a[k]||0)+i.stats[k]);return a;},{});
   body='<div class="tb-stat-grid"><div><small>УРОВЕНЬ</small><b>'+c.level / 1+'</b></div><div><small>БОЕВАЯ МОЩЬ</small><b>'+engine.combatPower(c)+'</b></div><div><small>ЗДОРОВЬЕ</small><b>'+engine.maxHp(c)+'</b></div><div><small>АТАКА</small><b>'+combatStats.attack+'</b></div><div><small>ЗАЩИТА</small><b>'+combatStats.defense+'</b></div><div><small>КРИТ</small><b>'+Math.round(combatStats.critChance*100)+'%</b></div><div><small>РЕСУРС</small><b>'+esc(def.resource)+' '+c.resource+'/'+c.resourceMax+'</b></div><div><small>ОПЫТ</small><b>'+c.xp+'</b></div><div><small>СЕРЕБРО</small><b>'+c.silver+'</b></div></div><div class="tb-class-summary"><b>Сильные стороны</b><span>'+esc((def.strengths||[]).join(" · "))+'</span><b>Слабые стороны</b><span>'+esc((def.weaknesses||[]).join(" · "))+'</span></div><div class="tb-branch-panel"><h3>Специализация</h3>'+(c.branch?'<b>'+esc(branch?.name||c.branch)+'</b><p>'+esc(branch?.theme||"")+'</p>':'<p>Выбери ветку на 10 уровне персонажа.</p>')+'<div class="tb-branch-options">'+(def.branches||[]).map(b=>'<button data-branch="'+b.id+'" '+(c.level<10?"disabled":"")+' class="'+(c.branch===b.id?"active":"")+'">'+esc(b.name)+(c.branch===b.id?" ✓":"")+'</button>').join("")+'</div><small>Первая специализация на 10 уровне бесплатна. Смена ветки стоит '+balance.classes.respec_cost+' серебра.</small></div>';
  }else if(profileTab==="talents"){
   body='<div class="tb-talent-head"><div><h3>Древо талантов</h3><p>Свободные очки: <b>'+free+'</b></p></div><button data-action="reset-talents" '+(spent===0?"disabled":"")+'>'+ 'СБРОС · '+balance.classes.talent_reset_cost+' серебра</button></div>';
   if(c.level<10)body+='<div class="tb-lock">Ветка талантов откроется на 10 уровне.</div>';
   else if(!branch)body+='<div class="tb-lock">Сначала выбери специализацию во вкладке «Характеристики».</div>';
   else body+='<div class="tb-talent-grid">'+branch.talents.map(t=>'<div class="tb-talent"><span class="tb-talent-icon">✦</span><div><b>'+esc(t.name)+'</b><small>'+esc(t.effect_template)+' · '+(c.talents[t.id]||0)+'/3</small></div><button data-talent="'+t.id+'" '+(free<=0||(c.talents[t.id]||0)>=3?"disabled":"")+' >＋</button></div>').join("")+'</div>';
  }else if(profileTab==="skills"){
   const base=(def.base_skills||[]).map(x=>({...x,branch:"Базовые"})).concat((def.passives||[]).map(x=>({...x,type:"passive",branch:"Пассивное"})));
   const branchSkills=c.branch?skills.filter(x=>x.class_id===c.classId&&x.branch_id===c.branch).map(x=>({...x,type:"active",branch:branch?.name||c.branch})):[];
   const available=base.concat(branchSkills),active=activeSkill(c);
   body='<h3>Умения персонажа</h3><p>Активное умение на арене: <b>'+esc(active?.name||"не выбрано")+'</b></p><div class="tb-skill-list">'+available.map(s=>'<div class="tb-skill-row"><span class="tb-skill-glyph">✧</span><div><b>'+esc(s.name)+'</b><small>'+esc(s.branch)+' · '+(s.type==="passive"?"Пассивное":"Активное")+'</small></div><strong class="'+(c.level>=s.unlock_level?"unlocked":"locked")+'">'+(c.level>=s.unlock_level?"ОТКРЫТО":"УР. "+s.unlock_level)+'</strong>'+(s.type==="passive"||c.level<s.unlock_level?"":'<button data-select-skill="'+s.id+'" '+(active?.id===s.id?"disabled":"")+'>'+(active?.id===s.id?"ВЫБРАНО":"ВЫБРАТЬ")+'</button>')+'</div>').join("")+'</div>';
  }else if(profileTab==="gear"){
   body='<h3>Экипировка</h3><div class="tb-gear-grid">'+(c.gear||[]).map((item,index)=>'<div class="tb-gear-slot"><small>СЛОТ '+(index+1)+'</small>'+(item?'<b>'+esc(item.name)+'</b><span>'+esc(item.rarity||"")+' · +'+(item.refine||0)+'</span><small>Гнёзда: '+(item.socketsAvailable||0)+' · Камни: '+(item.sockets||[]).length+'</small><button data-refine="'+item.id+'">ЗАТОЧИТЬ +1</button><button data-socket="'+item.id+'">ДОЛОТО · ГНЕЗДО</button><button data-stone="'+item.id+'">ВСТАВИТЬ КАМЕНЬ</button><button data-enchant="'+item.id+'" '+(!c.heroic?"disabled":"") + '>ЗАЧАРОВАТЬ</button>':'<span class="tb-empty-slot">Пусто</span>')+'</div>').join("")+'</div><div class="tb-bag-items">'+c.bag.filter(x=>x.stats).map(item=>'<div class="tb-bag-item"><span>'+esc(item.name)+'</span><small>'+esc(item.rarity||"Предмет")+'</small><button data-equip="'+item.id+'">НАДЕТЬ</button></div>').join("")+'</div>';
  }else{
   body='<h3>Рюкзак · '+c.bag.length+'</h3><div class="tb-bag-items">'+(c.bag.length?c.bag.map(item=>'<div class="tb-bag-item"><span>'+esc(item.name||item.type)+'</span><small>'+esc(item.rarity||item.type)+' · '+(item.quantity||1)+'</small>'+(item.type==="healing_potion"?'<button data-belt-assign="'+item.id+'">В ПОЯС</button>':"")+(item.stats?'<button data-equip="'+item.id+'">НАДЕТЬ</button><button data-salvage="'+item.id+'">РАЗОБРАТЬ</button>':item.type==="refine_stone"?"<small>Камень заточки</small>":item.type==="enhancement_stone"?"<small>"+esc(item.stoneType.name||item.stoneType.branch_id||item.stoneType.branchId)+" · "+item.stoneType.slot+" · ур."+item.level+"</small>":'')+(item.type==="craft_material"?'<button data-craft-stone="1">КОВАТЬ КАМЕНЬ I · 20 МАТЕРИАЛОВ</button>':'')+(item.type==="enhancement_stone"&&item.level<balance.equipment.stone_max_level?'<button data-merge="'+item.id+'" '+(c.bag.filter(x=>x.type==="enhancement_stone"&&x.level===item.level&&(x.stoneType.id||x.stoneType)===(item.stoneType.id||item.stoneType)).length<balance.equipment.stone_merge_count?"disabled":"")+' >СЛИТЬ 5 КАМНЕЙ</button>':'')+(["xp_10","xp_20","xp_50","xp_100","drop_20","drop_50","drop_75","drop_100","refine_10","refine_20","map_hint","repair_kit","silver_bonus","xp_hourglass","potion_capacity","one_rescue","stone_cache","socket","pity","refine_guard","rescue_seal","extra_socket","pity_token"].includes(item.type)?'<button data-use="'+item.id+'">ИСПОЛЬЗОВАТЬ</button>':'')+'</div>').join(""):'<div class="tb-lock">Рюкзак пока пуст.</div>')+'</div>';
  }
  return header("Профиль героя",c.name+" · "+clsName(c))+'<section class="tb-profile"><div class="tb-profile-top"><div class="tb-profile-avatar '+(engine.getRefinementGlow(c)||"")+'"><img src="'+portrait(c.classId)+'" alt=""></div><div><div class="tb-eyebrow">ПЕРСОНАЖ</div><h1>'+esc(c.name)+'</h1><p>'+esc(clsName(c))+' · Уровень '+c.level+' · Мощь '+engine.combatPower(c)+'</p></div><button data-action="map">НАЗАД К КАРТЕ</button></div><nav class="tb-tabs">'+tabs.map(t=>'<button data-tab="'+t[0]+'" class="'+(profileTab===t[0]?"active":"")+'">'+t[1]+'</button>').join("")+'</nav><div class="tb-profile-content">'+body+'</div></section>';
 }
 function shopScreen(){
  const c=live();if(!c)return characterList();
  const store=balance.economy[shopTab+"_store"];
  const products=Object.entries(store).filter(([key,value])=>typeof value==="number").map(([id,price])=>({id,price,name:id.replace(/_/g," ")})).concat((store.extra||[]).map(item=>({id:item.id,price:item.price,name:item.name})));
  const label=shopTab==="silver"?"серебра":"алм.";
  return header("Магазин","Персонажная и аккаунтная экономика")+'<section class="tb-shop"><div class="tb-shop-top"><h1>Магазин башни</h1><button data-action="map">К КАРТЕ</button></div><div class="tb-shop-balances"><span>◈ '+c.silver+' серебра персонажа</span><span>◆ '+engine.state.account.diamonds+' алмазов аккаунта</span><span>Премиум до '+(engine.state.account.premiumUntil?new Date(engine.state.account.premiumUntil).toLocaleDateString("ru-RU"):"—")+'</span></div><nav class="tb-tabs"><button data-shop-tab="silver" class="'+(shopTab==="silver"?"active":"")+'">ЗА СЕРЕБРО</button><button data-shop-tab="diamond" class="'+(shopTab==="diamond"?"active":"")+'">ЗА АЛМАЗЫ</button></nav><div class="tb-product-grid">'+products.map(item=>'<article class="tb-product"><div class="tb-product-icon">✧</div><b>'+esc(item.name.toUpperCase())+'</b><small>'+(item.id.startsWith("premium")?"Премиум аккаунт":item.id.startsWith("heal")?"Зелье исцеления":item.id.startsWith("xp")?"Зелье опыта":item.id.startsWith("drop")?"Зелье шанса дропа":"Улучшение экипировки")+'</small><span class="tb-product-price">'+item.price+' '+label+'</span><button data-buy="'+item.id+'" '+(shopTab==="silver"?(c.silver<item.price?"disabled":""):(engine.state.account.diamonds<item.price?"disabled":""))+'>КУПИТЬ</button></article>').join("")+'</div>'+
   (shopTab==="diamond"?'<div class="tb-packages"><h3>Пакеты алмазов</h3><div class="tb-package-grid">'+balance.economy.diamond_packages.map(pack=>'<div><b>'+pack[0]+' алмазов</b><span>'+pack[1]+' ₽</span></div>').join("")+'</div><small>1 алмаз = 1 ₽ · платежи не подключены в браузерной версии</small></div>':'')+
   '<p class="tb-note">Алмазы и премиум принадлежат аккаунту. В этой статической версии покупка алмазов не подключена к платёжному провайдеру.</p></section>';
 }
  function systemsScreen(){
  const c=live();if(!c)return characterList();
  const account=engine.state.account,prefs={volume_master:.8,volume_music:.7,volume_effects:.8,language:"ru",disable_refinement_glow:false,disable_particles:false,invert_camera:false,combat_log_toggle:true,...(account.settings||{})};
  const daily=engine.dailySnapshot(c.id),tutorial=c.tutorial||{completed:false,step:0,rewardClaimed:false};
  const rank={Обычная:0,Редкая:1,Эпическая:2,Легендарная:3,Богоподобная:4};
  const claimed=c.achievements||[];
  const derived={highest_stage:c.progress.highestEver||0,lore_read:(c.loreRead||[]).length,paragon_level:c.paragon?.level||0,account_level:engine.accountLevel(),season_clear:c.stats.season_clear||0};
  const achievementCards=balance.achievements.achievements.map(a=>{
   const value=derived[a.metric]??c.stats[a.metric]??c.progress[a.metric]??0,done=value>=a.target,owned=claimed.includes(a.id);
   return '<article class="tb-system-row"><div><b>'+esc(a.name)+'</b><small>'+esc(a.description||a.metric)+' · '+value+'/'+a.target+' · награда '+(a.reward.silver||0)+' серебра</small></div><button data-achievement="'+a.id+'" '+(!done||owned?'disabled':'')+'>'+(owned?'ПОЛУЧЕНО':done?'ЗАБРАТЬ':'ЗАКРЫТО')+'</button></article>';
  }).join("");
  const loreCards=balance.lore.entries.map(entry=>{
   const read=(c.loreRead||[]).includes(entry.id),open=c.progress.highestEver>=entry.unlock_stage;
   return '<article class="tb-system-row"><div><b>'+esc(entry.title)+'</b><small>Этап '+entry.unlock_stage+' · '+(read?'прочитано':open?'доступно':'закрыто')+' · +'+entry.xp_reward+' XP</small></div><button data-lore="'+entry.id+'" '+(!open||read?'disabled':'')+'>'+(read?'ПРОЧИТАНО':open?'ЧИТАТЬ':'ЗАКРЫТО')+'</button></article>';
  }).join("");
  const stash=(engine.state.stash||[]).map(item=>'<article class="tb-system-row"><div><b>'+esc(item.name)+'</b><small>'+esc(item.rarity)+' · ilvl '+item.itemLevel+'</small></div><button data-stash-withdraw="'+item.id+'">ЗАБРАТЬ</button></article>').join("");
  const depositable=c.bag.filter(item=>item.rarity&&rank[item.rarity]>=rank[balance.stash.min_rarity]&&!item.bound&&!item.bossLoot).map(item=>'<article class="tb-system-row"><div><b>'+esc(item.name)+'</b><small>'+esc(item.rarity)+' · ilvl '+item.itemLevel+'</small></div><button data-stash-deposit="'+item.id+'">В ОБЩИЙ СТЕШ</button></article>').join("");
  const store=balance.pvp_store.items.map(item=>{
   const owned=item.kind==="cosmetic"?(account.cosmetics||[]).includes(item.id):item.kind==="account_relic"?(account.relics||[]).includes(item.id):item.kind==="character_item"?(account.classEpics||[]).includes(item.classId):false;
   const classBlocked=item.kind==="character_item"&&item.classId!==c.classId;
   return '<article class="tb-system-product"><b>'+esc(item.name)+'</b><small>'+esc(item.category)+' · '+item.price+' PvP-очков</small><button data-pvp-buy="'+item.id+'" '+(owned||classBlocked||(account.pvpPoints||0)<item.price?'disabled':'')+'>'+(owned?(item.kind==="character_item"?"УЖЕ ПОЛУЧЕНО":"УЖЕ КУПЛЕНО"):classBlocked?'ДРУГОЙ КЛАСС':'КУПИТЬ')+'</button></article>';
  }).join("");
  const paragon=c.paragon||{level:0,xp:0,stats:{}};
  const paragonRows=balance.paragon.stats.map(stat=>'<div class="tb-system-row"><div><b>'+esc(stat)+'</b><small>Ранг '+(paragon.stats?.[stat]||0)+'</small></div><button data-paragon-stat="'+stat+'" '+(c.level<balance.paragon.unlock_level||Object.values(paragon.stats||{}).reduce((a,b)=>a+b,0)>=paragon.level?'disabled':'')+'>+1</button></div>').join("");
  const settings='<div class="tb-system-settings"><label>Главная громкость <input type="range" min="0" max="1" step=".01" data-setting="volume_master" value="'+prefs.volume_master+'"></label><label>Музыка <input type="range" min="0" max="1" step=".01" data-setting="volume_music" value="'+prefs.volume_music+'"></label><label>Эффекты <input type="range" min="0" max="1" step=".01" data-setting="volume_effects" value="'+prefs.volume_effects+'"></label><label>Язык <select data-setting="language"><option value="ru" '+(prefs.language==="ru"?'selected':'')+'>Русский</option><option value="en" '+(prefs.language==="en"?'selected':'')+'>English</option></select></label><label>Отключить свечение заточки +20 <input type="checkbox" data-setting="disable_refinement_glow" '+(prefs.disable_refinement_glow?'checked':'')+'></label><label>Отключить частицы <input type="checkbox" data-setting="disable_particles" '+(prefs.disable_particles?'checked':'')+'></label><label>Инверсия камеры <input type="checkbox" data-setting="invert_camera" '+(prefs.invert_camera?'checked':'')+'></label><label>Комбат-лог <input type="checkbox" data-setting="combat_log_toggle" '+(prefs.combat_log_toggle!==false?'checked':'')+'></label><label>Отключить тряску экрана <input type="checkbox" data-setting="disable_screen_shake" '+(prefs.disable_screen_shake?'checked':'')+'></label><label>Отключить вспышки умений <input type="checkbox" data-setting="disable_skill_flashes" '+(prefs.disable_skill_flashes?'checked':'')+'></label><label>Отключить телеграфы (хардкорная опция) <input type="checkbox" data-setting="disable_telegraphs" '+(prefs.disable_telegraphs?'checked':'')+'></label><label>Сложность <select data-setting="difficulty"><option value="easy" '+(c.difficulty==="easy"?'selected':'')+'>Easy</option><option value="normal" '+(c.difficulty==="normal"?'selected':'')+'>Normal</option><option value="hardcore" '+(c.difficulty==="hardcore"?'selected':'')+'>Hardcore</option></select></label></div>';
  const pending=account.pvpDaily?.pending;
  const weekly=engine.weeklyLeaderboard();
  const activeSeason=c.run.season?.modifier||engine.state.season?.modifier,activeDaily=c.run.dailyModifier||daily.modifier;
  return header("Системы аккаунта","Аккаунт · уровень "+engine.accountLevel())+'<section class="tb-systems"><div class="tb-system-top"><div><h1>Системы и прогресс</h1><p>'+esc(c.name)+' · '+esc(clsName(c))+' · '+c.level+' уровень</p></div><button data-action="map">К КАРТЕ</button></div>'+
   '<div class="tb-system-stats"><span>Аккаунт ур. '+engine.accountLevel()+'</span><span>PvP-очки '+(account.pvpPoints||0)+'</span><span>Стеш '+(engine.state.stash||[]).length+'/'+balance.stash.slots+'</span><span>Прочитано '+(c.loreRead||[]).length+'/25</span></div>'+
   '<section class="tb-system-card"><h2>Настройки</h2>'+settings+'</section>'+
   '<section class="tb-system-card"><h2>Туториал · '+tutorial.step+'/'+balance.tutorial.steps+'</h2><p>'+(tutorial.completed?'Туториал завершён':'Шесть последовательных шагов. Можно пропустить.')+'</p><div class="tb-system-actions">'+button("tutorial-next","СЛЕДУЮЩИЙ ШАГ",tutorial.completed?"disabled":"")+button("tutorial-skip","ПРОПУСТИТЬ",tutorial.completed?"disabled":"")+(tutorial.completed&&!tutorial.rewardClaimed?button("tutorial-claim","ЗАБРАТЬ 100 СЕРЕБРА + ЗЕЛЬЕ"):"")+'</div></section>'+
   '<section class="tb-system-card"><h2>Дневной босс</h2><p>Награда: '+balance.heroic.daily_boss_reward.silver+' серебра и '+balance.heroic.daily_boss_reward.diamonds+' алмаза. Вход: '+balance.heroic.daily_boss_cost.silver+' серебра.</p><div class="tb-system-actions">'+button("daily-boss","СРАЗИТЬСЯ ЗА 500 СЕРЕБРА",daily.boss.started?"disabled":"")+'<span>'+(daily.boss.completed?(daily.boss.won?"ПОБЕДА":"ПОРАЖЕНИЕ"):daily.boss.started?"ПОПЫТКА ИСПОЛЬЗОВАНА":"ПОПЫТКА ДОСТУПНА")+'</span></div></section>'+
   '<section class="tb-system-card"><h2>Сезонный модификатор</h2><p>'+esc(activeSeason?.name||"Нет активного модификатора")+'</p><small>Фиксируется при старте забега; период сезона '+balance.seasons.season_length_days+' дней.</small></section>'+
   '<section class="tb-system-card"><h2>Модификатор дня</h2><p>'+esc(activeDaily?.name||"Нет ежедневного модификатора")+'</p><small>Действует на бои забега; обновление каждый день в 00:00 UTC.</small></section>'+
   '<section class="tb-system-card"><h2>Достижения · '+claimed.length+'/'+balance.achievements.achievements.length+'</h2>'+achievementCards+'</section>'+
   '<section class="tb-system-card"><h2>Лор башни</h2>'+loreCards+'</section>'+
   '<section class="tb-system-card"><h2>Общий стеш · '+(engine.state.stash||[]).length+'/'+balance.stash.slots+'</h2><p>Только '+esc(balance.stash.min_rarity)+' и выше. Предмет привязывается при первом использовании. Передача — один раз в день.</p>'+(stash||'<small>Общий стеш пуст.</small>')+'<h3>Экипировка для передачи</h3>'+(depositable||'<small>Нет предметов эпик+ для передачи.</small>')+'</section>'+
   '<section class="tb-system-card"><h2>PvP-арена · '+(account.pvpPoints||0)+' очков</h2><p>Бесплатно '+balance.pvp.daily_duels.free+' дуэлей в день, с премиумом '+balance.pvp.daily_duels.premium+'. Матчмейкинг по BP-тиру; снимок соперника хранится 7 дней.</p><div class="tb-system-actions">'+button("pvp-match","НАЙТИ СОПЕРНИКА")+(pending?button("pvp-fight","СРАЗИТЬСЯ · "+esc(pending.opponent?.name||"СОПЕРНИК")):"")+'</div><div class="tb-system-products">'+store+'</div><h3>Недельный рейтинг (локальная копия)</h3>'+(weekly.length?weekly.map((x,i)=>'<div class="tb-system-row"><span>#'+(i+1)+' '+esc(x.name)+'</span><b>'+x.combatPower+' BP</b></div>').join(""):'<small>Пока нет результатов этого браузера.</small>')+'</section>'+
   '<section class="tb-system-card"><h2>Парагон · '+(paragon.level||0)+'/100</h2><p>XP: '+(paragon.xp||0)+' / '+balance.paragon.xp_per_point+'. Доступен после уровня100.</p>'+paragonRows+button("paragon-reset","СБРОСИТЬ ПАРАГОН · "+balance.paragon.reset_cost_silver+" СЕРЕБРА",Object.values(paragon.stats||{}).reduce((a,b)=>a+b,0)?"":"disabled")+'</section>'+
   '<section class="tb-system-card"><h2>Управление персонажем</h2><p>Удаление или полный сброс требуют двух подтверждений и точного ввода ника.</p><div class="tb-system-actions">'+button("reset-character","ПОЛНЫЙ СБРОС ПЕРСОНАЖА")+button("delete-character","УДАЛИТЬ ПЕРСОНАЖА")+'</div></section>'+
   '<section class="tb-system-card"><h2>Комбат-лог · последние '+(c.combatLog||[]).length+'/'+balance.settings.combat_log_max_events+'</h2>'+((c.combatLog||[]).slice(-balance.settings.combat_log_max_events).reverse().map(x=>'<div class="tb-system-row"><small>'+esc(new Date(x.at).toLocaleTimeString())+'</small><span>'+esc(x.event)+'</span></div>').join("")||'<small>Событий пока нет.</small>')+'</section>'+
   '</section>';
 }
 function deathScreen(){
  const c=live(),preview=engine.deathPreview(c.id),difficulty=balance.difficulty.modes[c.difficulty||balance.difficulty.default],total=difficulty.lives,remaining=c.run.lives||total;
  return header("Забег завершён",c.name+" · "+(c.difficulty||"normal"))+'<section class="tb-death tb-death-overlay"><div class="tb-death-mark">☠</div><div class="tb-eyebrow">ПОСЛЕДНИЙ ШАНС</div><h1>Персонаж погиб</h1><p>Сложность: '+esc(c.difficulty||"normal")+'. Потеря опыта: '+Math.round(difficulty.xp_loss_fraction*100)+'% опыта текущего забега.</p><div class="tb-death-lives">ОСТАЛОСЬ ЖИЗНЕЙ: <b>'+remaining+' / '+total+'</b></div><div class="tb-death-losses"><div><small>ОПЫТ К ПОТЕРЕ</small><b>'+preview.experienceLoss+'</b></div><div><small>ВОЗМОЖНОЕ СНИЖЕНИЕ</small><b>'+preview.levelsLost+' уровн.</b></div><div><small>ШАНС ПОТЕРИ ВЕЩИ</small><b>'+Math.round(preview.itemLossChance*100)+'%</b></div></div><p>Надетые предметы и боссовый лут защищены. В Hardcore авто-бой, пояс и чекпоинты отключены.</p><button class="tb-danger" data-action="confirm-death">ПОДТВЕРДИТЬ СМЕРТЬ</button><button data-action="map" disabled>ВОЗВРАТА В БОЙ НЕТ</button></section>';
 }
 function currentEnemyConfig(enemy,stage){return engine.getEnemyStats(live().id,stage,enemy).hp;}
 function loadBattleEnemy(index){
  const c=live(),stage=c.run.stage;
  if(!battle.enemies){
   battle.enemies=stage.mobs.map((mob,i)=>{const stats=engine.getEnemyStats(c.id,battle.stage,mob),hp=stats.hp;return{...mob,index:i,id:"enemy-"+i,hp,maxHp:hp,alive:true,attackIntervalMs:stats.attackIntervalMs,shield:mob.mechanic==="shield"?Math.round(hp*balance.elite_mechanics.shield.absorb_fraction):0,nextHealAt:Date.now()+(balance.mobs.roles.healer.interval_ms||5000),nextPoisonAt:Date.now()+(balance.mobs.roles.poison.interval_ms||8000),slowedUntil:0};});
   const healer=battle.enemies.find(enemy=>enemy.role==="healer"&&enemy.alive);index=healer?healer.index:(stage.targetIndex??0);
  }
  if(index===undefined||index===null||!battle.enemies[index]?.alive)index=battle.enemies.find(enemy=>enemy.alive)?.index;
  if(index===undefined)return;
  engine.selectTarget(c.id,index);battle.targetIndex=index;battle.enemy=battle.enemies[index];battle.enemyStats=engine.getEnemyStats(c.id,battle.stage,battle.enemy);
  battle.enemyMax=battle.enemy.maxHp;battle.enemyHp=battle.enemy.hp;battle.shield=battle.enemy.shield||0;
  battle.telegraph=null;battle.counterAction=null;battle.counterUsed=false;battle.pendingKill=false;battle.enemyStunned=false;battle.dot=null;battle.hot=null;battle.parryChance=0;battle.nextDamageShield=0;battle.teleportUsed=false;
  battle.playerDamageBuff=0;battle.playerBuffUntil=0;battle.enemyDamageReduction=0;battle.enemyDamageReductionUntil=0;
  battle.bossPhase=battle.enemy.type==="boss"?updateBossPhase():0;
 }
 function battleScreen(){
  const c=live(),enemy=battle.enemy,enemyPct=Math.max(0,battle.enemyHp/Math.max(1,battle.enemyMax)*100),hp=engine.maxHp(c),heroPct=Math.max(0,c.run.playerHp/hp*100),unlocked=engine.speed2Allowed(c.id,battle.stage);
  const slots=ensureLoadout(c),counter=counterAbility(c),ultimate=ultimateAbility(c),nextCombos=activeComboNextSlots(),telegraph=battle.telegraph,proc=battle.proc;
  const roleIcon={healer:"✚",poison:"☠",tank:"🛡",normal:"",boss:"♛"};
  const telegraphMarkup=telegraph?(settings().disable_telegraphs?'<div class="tb-telegraph-disabled" aria-hidden="true"></div>':'<div class="tb-telegraph '+telegraph.type+'" style="--telegraph-color:'+telegraph.color+'"><b>'+telegraph.icon+'</b><span>'+esc(telegraph.label)+'</span><small>'+Math.max(0,(telegraph.until-Date.now())/1000).toFixed(1)+' сек</small></div>'):'<div class="tb-telegraph-idle">Ожидание телеграфа</div>';
  const targetCards=battle.enemies.map(target=>{
   const selected=target.index===battle.targetIndex,weak=elementIcon(target.weakness),resist=elementIcon(target.resistance),pct=target.hp/Math.max(1,target.maxHp)*100;
   return '<button type="button" class="tb-target-card '+(selected?'selected ':'')+(!target.alive?'defeated':'')+'" data-target="'+target.index+'" '+(!target.alive?'disabled':'')+'><span class="tb-target-role">'+(roleIcon[target.role]||"◆")+'</span><b>'+(target.type==="boss"?"БОСС":target.type==="elite"?"ЭЛИТА":"МОБ "+(target.index+1))+'</b><small>'+(balance.mobs.roles[target.role]?.name||"Обычный")+'</small><span class="tb-target-hp"><i style="width:'+pct+'%"></i></span><small>'+Math.max(0,Math.ceil(target.hp))+' HP</small><span class="tb-target-elements"><span title="Уязвимость">'+weak+'</span><span class="resist" title="Резист">'+resist+'</span></span></button>';
  }).join("");
  const phaseLabel=enemy.type==="boss"?' <span class="tb-boss-phase">ФАЗА '+battle.bossPhase+'</span>':"";
  const procMarkup=proc?'<div class="tb-proc-chip" title="'+esc(proc.name)+'"><b>'+proc.icon+'</b><span>'+esc(proc.name)+'</span><small>'+Math.max(0,Math.ceil((proc.expiresAt-Date.now())/1000))+'s</small></div>':'<div class="tb-proc-empty">ПРОКИ ГОТОВЫ</div>';
  const skillButtons=slots.map((skill,index)=>{
   const next=nextCombos.some(x=>x.slot===index),cd=skill?(battle.skillCooldowns?.[skill.id]||0):Infinity;
   return '<button type="button" class="tb-panel-skill '+(next?'combo-next ':'')+'" data-panel-skill="'+(skill?.id||"")+'" data-panel-slot="'+index+'" '+(!skill||battle.busy||battle.paused||cd>Date.now()?'disabled':'')+'><kbd>'+(index+1)+'</kbd><b>'+esc(skill?.name||"Навык не открыт")+'</b><small>'+(skill?elementIcon(skill.damage_type)+" "+elementLabel(skill.damage_type):"Откроется по уровню")+'</small>'+(next?'<em>КОМБО</em>':"")+'</button>';
  }).join("");
  const counterCd=battle.counterReadyAt>Date.now(),ultCd=battle.ultimateReadyAt>Date.now(),remaining=battle.enemies.filter(target=>target.alive).length;
  const counterButton='<button type="button" class="tb-panel-skill counter '+(telegraph&&!settings().disable_telegraphs?'telegraph-ready':'')+'" data-counter="1" '+(!telegraph||battle.counterUsed||counterCd||battle.paused||c.resource<(counter.resource_cost||balance.resources.action_costs.counter)?'disabled':'')+'><kbd>5</kbd><b>'+esc(counter.name)+'</b><small>'+counter.icon+' Контр-умение · '+counter.cooldown_seconds+'с</small></button>';
  const ultButton='<button type="button" class="tb-panel-skill ultimate" data-ultimate="1" '+(battle.busy||battle.paused||ultCd||c.resource<(ultimate.resource_cost||balance.resources.action_costs.ultimate)?'disabled':'')+'><kbd>6</kbd><b>'+esc(ultimate.name)+'</b><small>'+ultimate.icon+' Ультимейт · '+ultimate.cooldown_seconds+'с</small></button>';
  return header("Арена · этап "+battle.stage,c.name+" · цели "+remaining+"/"+battle.count)+
   '<section class="tb-arena '+(battle.fx&&battle.fx.until>Date.now()?'tb-fx-'+battle.fx.kind:'')+(battle.shakeUntil>Date.now()?' tb-shaking':'')+(battle.phaseFlashUntil>Date.now()?' tb-phase-flash':'')+'"><div class="tb-arena-top"><span class="tb-arena-stage-label">АРЕНА · ЭТАП '+battle.stage+phaseLabel+'</span><span>'+(enemy.type==="boss"?"БОСС":enemy.type==="elite"?"ЭЛИТНЫЙ ПРОТИВНИК":"ПРОТИВНИК")+'</span><button data-action="speed" id="speed" '+(!unlocked?"disabled":"")+'>'+(c.run.speed2?"×2 ВКЛ":"×2 ВЫКЛ")+'</button><button data-action="pause" id="pause">'+(battle.paused?"ПРОДОЛЖИТЬ":"ПАУЗА")+'</button></div>'+
   '<div class="tb-target-grid">'+targetCards+'</div>'+
   '<div class="tb-combat-layout"><div class="tb-enemy-focus"><div class="tb-enemy-role-icon">'+(roleIcon[enemy.role]||"◆")+'</div><div class="tb-enemy-title">'+(enemy.type==="boss"?"Хранитель этажа":enemy.type==="elite"?"Элита башни":"Страж башни")+'</div><div class="tb-enemy-vulnerability"><span title="Уязвимость">'+elementIcon(enemy.weakness)+' '+elementLabel(enemy.weakness)+'</span><span class="resist" title="Резист">'+elementIcon(enemy.resistance)+' '+elementLabel(enemy.resistance)+'</span></div>'+telegraphMarkup+'<div class="tb-healthbar enemy"><span style="width:'+enemyPct+'%"></span></div><small>'+Math.max(0,Math.ceil(battle.enemyHp))+' / '+battle.enemyMax+' HP'+(battle.shield>0?" · Щит "+battle.shield:"")+'</small></div>'+
   '<div class="tb-battle-hero"><div class="tb-hero-art '+(engine.getRefinementGlow(c)||"")+'"><img src="'+portrait(c.classId)+'" alt=""></div><b>'+esc(c.name)+'</b><small>'+esc(clsName(c))+' · ур. '+c.level+'</small><div class="tb-healthbar hero"><span style="width:'+heroPct+'%"></span></div><small>'+Math.ceil(c.run.playerHp)+' / '+hp+' HP</small><div class="tb-resourcebar"><span style="width:'+Math.min(100,c.resource/c.resourceMax*100)+'%"></span></div><small>'+esc(classData(c).resource)+': '+c.resource+'/'+c.resourceMax+'</small>'+procMarkup+'</div></div>'+
   '<div class="tb-panel-actions"><button class="tb-basic-attack" data-action="attack" '+(battle.busy||battle.paused?'disabled':'')+' id="hit">АТАКА</button><div class="tb-panel-slots">'+skillButtons+counterButton+ultButton+'</div></div>'+
   '<div class="tb-combo-status">'+nextCombos.map(x=>'<span>'+esc(x.combo.label)+': следующий слот '+(x.slot+1)+'</span>').join(" · ")+'</div>'+
   '<div class="tb-potion-belt">'+engine.potionBeltSnapshot(c.id).map(slot=>'<button data-belt-use="'+slot.slot+'" '+(!slot.itemId||slot.available<=0||!balance.difficulty.modes[c.difficulty||balance.difficulty.default].potion_belt||c.run.stage.potionUsedTargets?.includes(battle.targetIndex)||battle.busy||battle.paused?'disabled':'')+' title="Доступно зелий: '+slot.available+'">ЗЕЛЬЕ '+(slot.slot+1)+'</button>').join("")+'</div>'+
   '<div class="tb-combat-note">'+(battle.paused?"ПАУЗА · бой остановлен":settings().disable_telegraphs?"Хардкор: телеграфы скрыты":battle.busy?"Телеграф атаки · успей применить контр-умение":"Тапни по цели · Tab для смены цели · 1–6 для панели")+'</div><div class="tb-fx-layer" style="--tb-fx-color:'+(battle.fx?.color||"#f3c968")+'" aria-hidden="true"></div></section>';
 }
 function beginStage(){
  const c=live();
  try{
   const plan=engine.beginStage(c.id,selectedStage);ensureLoadout(c);
   battle={stage:plan.stage,count:plan.count,enemy:null,enemyHp:0,enemyMax:0,shield:0,turns:0,busy:false,enemies:null,targetIndex:0,skillCooldowns:{},counterReadyAt:0,ultimateReadyAt:0,comboProgress:{},attacksThisFight:0,distinctElements:[],buffsUsed:0,poisonDots:[],telegraph:null,paused:false,proc:null,fx:null};
   if(preferredSpeed2&&engine.speed2Allowed(c.id,plan.stage))engine.setSpeed2(c.id,true,plan.stage);
   loadBattleEnemy();screen="battle";startBattleStatusLoop();save();render();
  }catch(error){notify(error.message);}
 }
 function finishCurrentEnemy(){
  clearTimeout(pendingTimer);pendingTimer=null;
  const c=live(),defeated=battle.enemy,result=engine.finishEnemy(c.id,{speed2:c.run.speed2,targetIndex:defeated.index});
  defeated.hp=0;defeated.alive=false;defeated.dead=true;
  if(result.loot.length)notify("Добыча: "+result.loot.map(x=>x.name||x.type).join(", "));
  if(result.stageComplete){
   stopBattleStatusLoop();clearTimeout(pendingTimer);pendingTimer=null;battle=null;selectedStage=c.progress.currentStage;screen="map";save();render();notify("Этап пройден · HP восстановлено · опыт сохранён");
  }else{
   const carryShield=battle.nextDamageShield||0;
   loadBattleEnemy(result.nextTargetIndex);
   // A proc earned on the killing hit must survive the target reset.
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
  const c=live();if(!settings().disable_screen_shake){root.classList.add("tb-death-shaking");setTimeout(()=>root.classList.remove("tb-death-shaking"),520);}stopBattleStatusLoop();clearTimeout(pendingTimer);pendingTimer=null;battle=null;screen="death";render();save();
 }
 function stopBattleStatusLoop(){if(statusTimer){clearInterval(statusTimer);statusTimer=null;}}
 function startBattleStatusLoop(){stopBattleStatusLoop();statusTimer=setInterval(updateBattleStatus,250);}
 function addPoisonStack(damage,ticks){if(!battle)return;battle.poisonDots=battle.poisonDots||[];battle.poisonDots.push({damage,ticks,nextAt:Date.now()+1000});}
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
    enemy.poisonDue=true;enemy.nextPoisonAt=now+balance.mobs.roles.poison.interval_ms;changed=true;
   }
  }
  for(const dot of battle.poisonDots||[]){
   if(dot.ticks>0&&now>=dot.nextAt){c.run.playerHp=Math.max(0,c.run.playerHp-dot.damage);dot.ticks--;dot.nextAt=now+1000;changed=true;if(c.run.playerHp<=0){endFromDamage();return;}}
  }
  battle.poisonDots=(battle.poisonDots||[]).filter(dot=>dot.ticks>0);
  if(c.classId==="bishop"&&c.run.playerHp<=engine.maxHp(c)*balance.procs.bishop.threshold&&(battle.bishopProcReadyAt||0)<=now){
   const proc=balance.procs.bishop;c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*proc.value));battle.bishopProcReadyAt=now+proc.cooldown_seconds*1000;battle.proc={...proc,expiresAt:now+3000};changed=true;
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
 function applyTargetDamage(target,rawDamage,damageType,options){
  options=options||{};const c=live();let multiplier=engine.damageTypeMultiplier(target,damageType||"physical");
  if(target.role==="tank"&&target.alive)multiplier*=1-balance.mobs.roles.tank.damage_reduction;
  let damage=Math.max(0,Math.round(rawDamage*multiplier));
  if(target.shield>0){const absorbed=Math.min(target.shield,damage);target.shield-=absorbed;damage-=absorbed;}
  const dealt=Math.min(target.hp,damage);target.hp=Math.max(0,target.hp-damage);if(dealt>0)engine.applyVampirism(c.id,dealt);
  if(target.index===battle.targetIndex){battle.enemyHp=target.hp;battle.shield=target.shield||0;}
  if(target.type==="boss")updateBossPhase();
  return{damage,dealt,multiplier,killed:target.hp<=0};
 }
 function scheduleEnemyTelegraph(){
  if(!battle||battle.paused)return;
  const target=battle.enemy,telegraphs=balance.combat.telegraphs,types=telegraphs.types,phase=target.type==="boss"?updateBossPhase():0,phaseCfg=phase?balance.bosses.phases.find(p=>p.phase===phase):null;
  if(target.stunnedUntil>Date.now()){
   battle.busy=true;battle.telegraph=null;clearTimeout(pendingTimer);
   pendingTimer=setTimeout(()=>{pendingTimer=null;if(battle&&!battle.paused){target.stunnedUntil=0;scheduleEnemyTelegraph();}},target.stunnedUntil-Date.now());
   render();return;
  }
  const choices=phaseCfg?.patterns||Object.keys(types);
  let type=choices[Math.floor(Math.random()*choices.length)]||"strong_hit";
  if(target.role==="poison"&&target.poisonDue)type="poison";
  const windowMs=Math.max(phaseCfg?1000:telegraphs.min_window_ms,Math.min(telegraphs.max_window_ms,phaseCfg?.telegraph_window_ms||telegraphs.default_window_ms));
  const attackSpeed=phaseCfg?.attack_speed_multiplier||1;
  const slowMultiplier=target.slowedUntil>Date.now()?1/(1-(balance.skills.counter_abilities.elemental.speed_reduction||0.3)):1;
  const attackInterval=Math.round((target.attackIntervalMs||battle.enemyStats.attackIntervalMs||balance.combat.attack_interval*1000)/(attackSpeed)*slowMultiplier);
  const preDelay=Math.max(0,attackInterval-windowMs),visual=settings().disable_telegraphs?{icon:"",label:""}:types[type];
  battle.busy=true;battle.telegraph=null;battle.counterUsed=false;battle.counterAction=null;
  clearTimeout(pendingTimer);render();
  const showTelegraph=()=>{
   if(!battle||battle.paused)return;
   battle.telegraph={type,targetIndex:target.index,startedAt:Date.now(),until:Date.now()+windowMs,windowMs,icon:visual.icon,label:visual.label,color:visual.color||"#ff465e"};
   triggerVfx("telegraph",type==="poison"?"dark":type==="aoe"?"fire":"physical",false);render();
   pendingTimer=setTimeout(()=>{pendingTimer=null;resolveEnemyTelegraph();},windowMs);
  };
  if(preDelay>0)pendingTimer=setTimeout(()=>{pendingTimer=null;showTelegraph();},preDelay);else showTelegraph();
 }
function resolveEnemyTelegraph(){
  if(!battle||battle.paused||!battle.telegraph)return;
  const c=live(),telegraph=battle.telegraph,attacker=battle.enemies[telegraph.targetIndex];
  if(!attacker||!attacker.alive){battle.telegraph=null;battle.busy=false;render();return;}
  const enemyStats=engine.getEnemyStats(c.id,battle.stage,attacker),phaseInfo=attacker.type==="boss"?engine.bossPhaseInfo(attacker.hp,attacker.maxHp):null,phase=phaseInfo?.phase||0,phaseCfg=phaseInfo||null;
  const raw=enemyStats.damage*(phaseCfg?.damage_multiplier||1),counterId=battle.counterAction?.id,countered=!!counterId;
  const reaction=engine.resolveReaction(telegraph.type,counterId,c.classId,raw);
  if(reaction.cleansesPoison&&battle.poisonDots?.length)battle.poisonDots.shift();
  if(telegraph.type==="poison"&&attacker.role==="poison"&&!countered){
   const poison=balance.mobs.roles.poison;addPoisonStack(Math.round(engine.maxHp(c)*poison.damage_fraction_per_second),poison.duration_seconds);attacker.poisonDue=false;
   attacker.nextPoisonAt=Date.now()+poison.interval_ms;
  }
  if(reaction.stunSeconds)attacker.stunnedUntil=Date.now()+reaction.stunSeconds*1000;
  if(reaction.attackSpeedReduction)attacker.slowedUntil=Date.now()+reaction.slowSeconds*1000;
  const combatStats=engine.getCombatStats(c),mitigation=engine.mitigationMultiplier(combatStats.defense,battle.stage);
  let incoming=Math.max(0,Math.round(reaction.damage*mitigation));
  if(phase===4&&!countered){if(c.difficulty==="easy")incoming=Math.round(engine.maxHp(c)*(1-phaseCfg.easy_miss_remaining_hp_fraction));else incoming=Math.max(incoming,c.run.playerHp);}
  if(battle.enemyDamageReductionUntil>Date.now())incoming=Math.round(incoming*(1-battle.enemyDamageReduction));
  if(battle.nextDamageShield){incoming=Math.max(0,incoming-battle.nextDamageShield);battle.nextDamageShield=0;}
  if(attacker.mechanic==="reflect"&&!countered)incoming+=Math.round(raw*balance.elite_mechanics.reflect.damage_fraction);
  c.run.playerHp=Math.max(0,c.run.playerHp-incoming);
  if(countered&&counterId==="parry")applyTargetDamage(attacker,combatStats.attack*balance.skills.counter_abilities.duelist.damage_multiplier,"physical");
  battle.telegraph=null;battle.counterAction=null;battle.busy=false;
  engine.logCombatEvent(c.id,(countered?"Контр-умение отражает ":"Вражеская атака наносит ")+incoming+" урона");
  triggerVfx("enemy-hit","physical",phase===4||attacker.type==="boss");
  if(c.run.playerHp<=0){endFromDamage();return;}
  save();render();
 }
 function useCounterSkill(){
  if(!battle?.telegraph||battle.counterUsed||battle.paused)return;
  const c=live(),counter=counterAbility(c),resources=balance.resources,now=Date.now(),cost=counter.resource_cost??resources.action_costs.counter;
  if((battle.counterReadyAt||0)>now){notify("Контр-умение перезаряжается");return;}
  if(c.resource<cost){notify("Не хватает ресурса для контр-умения");return;}
  c.resource-=cost;battle.counterUsed=true;battle.counterAction=counter;battle.counterReadyAt=now+counter.cooldown_seconds*1000;
  if(counter.effect==="stun")battle.enemyStunned=true;
  if(counter.effect==="riposte"){
   const index=battle.telegraph.targetIndex,target=battle.enemies[index],dealt=applyTargetDamage(target,engine.getCombatStats(c).attack*counter.damage_multiplier,"physical");
   if(dealt.killed){clearTimeout(pendingTimer);pendingTimer=null;setBattleTarget(index);finishCurrentEnemy();return;}
  }
  save();render();
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
  if(!battle||battle.busy||battle.paused)return;
  const c=live(),ultimate=ultimateAbility(c),resources=balance.resources,now=Date.now(),cost=ultimate.resource_cost??resources.action_costs.ultimate;
  if(battle.ultimateReadyAt>now){notify("Ультимейт ещё перезаряжается");return;}
  if(c.resource<cost){notify("Не хватает ресурса для ультимейта");return;}
  c.resource-=cost;battle.ultimateReadyAt=now+ultimate.cooldown_seconds*1000;
  const stats=engine.getCombatStats(c);
  if(ultimate.effect==="heal_shield"||ultimate.effect==="heal_aoe")c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*ultimate.heal_fraction));
  if(ultimate.effect==="heal_shield")battle.nextDamageShield=Math.round(engine.maxHp(c)*ultimate.shield_fraction);
  if(ultimate.effect==="heal_aoe"||ultimate.effect==="aoe_burst"){for(const target of battle.enemies.filter(x=>x.alive))applyTargetDamage(target,stats.attack*ultimate.damage_multiplier,ultimate.damage_type);}
  else if(ultimate.effect==="single_burst")applyTargetDamage(battle.enemy,stats.attack*ultimate.damage_multiplier,ultimate.damage_type);
  triggerVfx("ultimate",ultimate.damage_type,false);
  if(battle.enemy.hp<=0){finishCurrentEnemy();return;}
  save();render();scheduleEnemyTelegraph();
 }
 function enemyCounter(){resolveEnemyTelegraph();}
 function playerAction(skillId,slotIndex){
  if(!battle||battle.busy||battle.paused)return;
  const c=live(),enemy=battle.enemy,combat=balance.combat,resources=balance.resources,stats=engine.getCombatStats(c);
  let skill=null,effect=null,damage=stats.attack*combat.player_damage.attack_multiplier*stats.damageMultiplier,damageType="physical",resourceCost=0,guaranteedCrit=false;
  if(skillId){
   skill=skills.find(item=>item.id===skillId);if(!skill||!engine.skillAvailable(c,skill)){notify("Умение недоступно");return;}
   effect=balance.skill_effects[skill.effect_template]||balance.skill_effects.strike;damageType=skill.damage_type||"physical";
   resourceCost=c.classId==="duelist"?resources.class_costs.duelist.attack_skill:resources.action_costs.attack_skill;
   if(battle.freeSkillCharges>0){resourceCost=0;battle.freeSkillCharges--;}
   if(c.resource<resourceCost){notify("Не хватает ресурса: "+classData(c).resource);return;}
   if((battle.skillCooldowns?.[skill.id]||0)>Date.now()){notify("Умение ещё перезаряжается");return;}
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
   battle.skillCooldowns=battle.skillCooldowns||{};battle.skillCooldowns[skill.id]=Date.now()+((effect.cooldown||4)*1000/(combat.combat_speed_base*(c.run.speed2?combat.speed_2x_multiplier:1)));
   const combo=processCombo(slotIndex);if(combo){damage*=combo.bonus.damage_mult||1;guaranteedCrit=!!combo.bonus.guaranteed_crit;}
   if(skill.branch_id)engine.recordDailyProgress(c.id,"branch_skills_used",1);
   engine.logCombatEvent(c.id,"Использовано умение: "+skill.name);
  }else{c.resource=Math.min(c.resourceMax,c.resource+(resources.regeneration.auto_attack||3));}
  if(battle.playerDamageBuff&&battle.playerBuffUntil>Date.now())damage*=1+battle.playerDamageBuff;
  if(c.classId==="assassin"&&battle.assassinNextHit){damage*=balance.procs.assassin.value;battle.assassinNextHit=false;battle.proc=null;}
  if(c.classId==="elemental"&&battle.elementalNextBonus){damage*=balance.procs.elemental.value;battle.elementalNextBonus=false;battle.proc=null;}
  const distinctType=skill?skill.damage_type||"physical":"physical";
  if(!battle.distinctElements.includes(distinctType)){battle.distinctElements.push(distinctType);if(c.classId==="elemental"&&battle.distinctElements.length>=2){battle.elementalNextBonus=true;battle.proc={...balance.procs.elemental,expiresAt:Date.now()+6000};}}
  const critical=guaranteedCrit||Math.random()<stats.critChance;if(critical)damage*=stats.critMultiplier;
  const variance=1+(Math.random()*2-1)*combat.player_damage.attack_variance;damage=Math.max(1,Math.round(damage*variance));
  const dealt=applyTargetDamage(enemy,damage,damageType);
  battle.attacksThisFight=(battle.attacksThisFight||0)+1;
  if(c.classId==="assassin"&&critical){battle.assassinNextHit=true;battle.proc={...balance.procs.assassin,expiresAt:Date.now()+8000};}
  if(c.classId==="duelist"&&battle.attacksThisFight>=balance.procs.duelist.attacks_required&&!battle.freeSkillCharges){battle.freeSkillCharges=1;battle.proc={...balance.procs.duelist,expiresAt:Date.now()+8000};}
  if(c.classId==="dragonkin"&&battle.attacksThisFight>=balance.procs.dragonkin.attacks_required&&!battle.dragonkinProc){battle.nextDamageShield=Math.round(engine.maxHp(c)*balance.procs.dragonkin.value);battle.dragonkinProc=true;battle.proc={...balance.procs.dragonkin,expiresAt:Date.now()+8000};}
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
  const target=event.target.closest("[data-action],[data-pick],[data-class],[data-stage],[data-tab],[data-branch],[data-talent],[data-select-skill],[data-daily-claim],[data-equip],[data-refine],[data-socket],[data-merge],[data-use],[data-buy],[data-shop-tab],[data-belt-assign],[data-belt-use],[data-achievement],[data-lore],[data-stash-deposit],[data-stash-withdraw],[data-pvp-buy],[data-paragon-stat],[data-salvage],[data-craft-stone],[data-target],[data-panel-skill],[data-counter],[data-ultimate]");
  if(!target||!root.contains(target)&&!document.getElementById("rpgDialog")?.contains(target))return;
  event.preventDefault();
  if(target.dataset.pick){selectedId=target.dataset.pick;engine.state.activeCharacterId=selectedId;selectedStage=live().progress.currentStage;render();return;}
  if(target.dataset.class){selectedClass=target.dataset.class;render();return;}
  if(target.dataset.stage){selectedStage=Number(target.dataset.stage);render();return;}
  if(target.dataset.tab){profileTab=target.dataset.tab;render();return;}
  if(target.dataset.shopTab){shopTab=target.dataset.shopTab;render();return;}
  if(target.dataset.branch){try{engine.chooseBranch(live().id,target.dataset.branch);save();render();notify("Специализация выбрана");}catch(error){notify(error.message);}return;}
  if(target.dataset.talent){try{engine.useTalentPoint(live().id,target.dataset.talent,3);save();render();}catch(error){notify(error.message);}return;}
  if(target.dataset.target!==undefined){setBattleTarget(Number(target.dataset.target));return;}
  if(target.dataset.panelSkill){playerAction(target.dataset.panelSkill,Number(target.dataset.panelSlot));return;}
  if(target.dataset.counter!==undefined){useCounterSkill();return;}
  if(target.dataset.ultimate!==undefined){useUltimate();return;}
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
   case "map":stopBattleStatusLoop();clearTimeout(pendingTimer);pendingTimer=null;screen="map";battle=null;render();save();break;
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
   case "attack":playerAction(null,-1);break;
   case "skill":{const skill=activeSkill(live());if(skill)playerAction(skill.id,0);else notify("Нет доступного атакующего умения");break;}
   case "potion":try{engine.useHealingPotion(live().id);save();render();notify("Зелье использовано. Слот этой цели потрачен.");}catch(error){notify(error.message);}break;
   case "speed":try{engine.setSpeed2(live().id,!live().run.speed2,battle.stage);preferredSpeed2=live().run.speed2;localStorage.setItem("tb-rpg-speed-v2",preferredSpeed2?"2":"1");save();render();}catch(error){notify(error.message);}break;
   case "pause":if(battle){if(!battle.paused){battle.paused=true;if(pendingTimer){clearTimeout(pendingTimer);pendingTimer=null;battle.remainingResponseMs=Math.max(0,(battle.telegraph?.until||Date.now())-Date.now());}}else{battle.paused=false;if(battle.telegraph){const delay=battle.remainingResponseMs===undefined?Math.max(0,battle.telegraph.until-Date.now()):battle.remainingResponseMs;battle.telegraph.until=Date.now()+delay;battle.remainingResponseMs=undefined;clearTimeout(pendingTimer);pendingTimer=setTimeout(()=>{pendingTimer=null;resolveEnemyTelegraph();},delay);}else scheduleEnemyTelegraph();}save();render();}break;
   case "heal-checkpoint":try{const result=engine.checkpointHeal(live().id);save();render();notify("HP восстановлено · −20% XP до этапа "+result.penaltyUntil);}catch(error){notify(error.message);}break;
   case "auto":try{const result=engine.autoBattle(live().id);selectedStage=live().progress.currentStage;save();render();notify("Авто-бой: "+result.cleared+" этапов · "+result.xp+" опыта · "+result.stopped);}catch(error){notify(error.message);}break;
   case "restart":try{engine.voluntaryRestart(live().id);selectedStage=1;screen="characters";battle=null;save();render();notify("Забег завершён добровольно · весь опыт сохранён");}catch(error){notify(error.message);}break;
   case "reset-talents":try{engine.resetTalents(live().id);save();render();notify("Таланты сброшены");}catch(error){notify(error.message);}break;
   case "confirm-death":{const result=engine.confirmDeath(live().id);selectedId=live().id;selectedStage=live().progress.currentStage;screen="map";save();render();notify(result.runEnded?"Все жизни потеряны · забег начнётся с этапа 1":"Потеряна одна жизнь · осталось "+result.livesRemaining+" · продолжаем с этапа "+selectedStage);break;}
  }
 }
 root.addEventListener("pointerup",function(event){if(event.target.closest(".tb-v2"))event.stopImmediatePropagation();},true);
 document.addEventListener("click",handleClick);
 function handleBattleKeys(event){
  if(screen!=="battle"||!battle||battle.paused||event.repeat||event.ctrlKey||event.metaKey||event.altKey)return;
  const tag=event.target?.tagName?.toLowerCase();if(["input","textarea","select"].includes(tag)||event.target?.isContentEditable)return;
  if(event.key==="Tab"){event.preventDefault();const alive=battle.enemies.filter(enemy=>enemy.alive),at=alive.findIndex(enemy=>enemy.index===battle.targetIndex),next=alive[(at+1)%alive.length];if(next)setBattleTarget(next.index);return;}
  if(/^[1-6]$/.test(event.key)){event.preventDefault();const slot=Number(event.key);if(slot<=4){const skill=ensureLoadout(live())[slot-1];if(skill)playerAction(skill.id,slot-1);}else if(slot===5)useCounterSkill();else useUltimate();}
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
  const key=field.dataset.setting,value=field.type==="checkbox"?field.checked:field.type==="range"?Number(field.value):field.value;
  try{
   if(key==="difficulty"){engine.setDifficulty(live().id,value);notify("Сложность изменена");}
   else engine.saveSettings({[key]:value});
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
   try{const response=await fetch("./configs/skills/catalog.json");if(response.ok)skills=await response.json();}catch(error){console.warn("Skill catalog unavailable",error);}
   if(engine.state.characters.length){selectedId=engine.state.activeCharacterId||engine.state.characters[0].id;screen="characters";}
   render();
  }).catch(error=>console.error("Towerbound rework UI failed",error));
 }
 boot();
})();