(function(){
 "use strict";
 const root=document.getElementById("tbRpg");
 if(!root)return;
 const classPortraits={assassin:"reaper",bishop:"arcanist",dragonkin:"warden",destroyer:"warden",elemental:"arcanist",duelist:"ranger",shaman:"reaper"};
 const classFallback={assassin:"Ас",bishop:"Еп",dragonkin:"Др",destroyer:"Ра",elemental:"Ма",duelist:"Ду",shaman:"Ша"};
 const tabs=[["stats","Характеристики"],["talents","Таланты"],["skills","Умения"],["gear","Экипировка"],["bag","Рюкзак"]];
 let engine=null,balance=null,skills=[],screen="characters",profileTab="stats",shopTab="silver";
 let selectedId=null,selectedClass="assassin",selectedStage=1,dialogOpen=false,battle=null,toastTimer=null,toastMessage="",preferredSpeed2=localStorage.getItem("tb-rpg-speed-v2")==="2",pendingTimer=null;
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
   '<section class="tb-map-screen"><div class="tb-map-top"><div class="tb-hero-chip"><img src="'+portrait(c.classId)+'" alt=""><div><b>'+esc(c.name)+'</b><small>'+esc(clsName(c))+' · '+esc(classData(c).resource)+': '+c.resource+'/'+c.resourceMax+'</small></div></div><div class="tb-currency"><span>◈ '+c.silver+' серебра</span><span>◆ '+engine.state.account.diamonds+' алмазов</span><span>Мощь '+engine.combatPower(c)+'</span><span>♥ Жизни: '+(c.run.lives||balance.difficulty.modes[c.difficulty||balance.difficulty.default].lives)+'/'+balance.difficulty.modes[c.difficulty||balance.difficulty.default].lives+'</span></div><div class="tb-map-actions"><button data-action="characters">Персонажи</button><button data-action="shop">МАГАЗИН</button><button data-action="profile">ПЕРСОНАЖ</button></div></div>'+
   '<div class="tb-progressline"><span>Наивысший этап: <b>'+c.progress.highestEver+'/250</b></span><span>Следующий: <b>'+Math.min(c.progress.currentStage,250)+'</b></span><span>Чекпоинты: <b>'+c.progress.checkpoints.join(" · ")+'</b></span></div>'+
   (penalty?'<div class="tb-penalty">−20% ОПЫТА АКТИВНО · ОСТАЛОСЬ '+remaining+' ЭТАЖЕЙ</div>':"")+
   '<div class="tb-map-layout"><div class="tb-map-scroll"><div class="tb-map-grid">'+nodes+'</div></div><aside class="tb-stage-panel"><div class="tb-eyebrow">ВЫБРАННЫЙ ЭТАП</div><div class="tb-stage-number">'+selectedStage+'</div><h3>'+(selectedStage%balance.map.boss_every===0?"Боссовый бой":"Гаунтлет")+'</h3><p>'+(selectedStage%balance.map.boss_every===0?"Один босс, отдельное сражение":balance.map.gauntlet_ranges.find(r=>selectedStage>=r.min&&selectedStage<=r.max)?.allowed.join(" / ")+" противника подряд")+'</p><small>'+(selectedStage<=c.progress.highestEver?"Повторное прохождение · 50% XP": "Первое прохождение · 100% XP")+'</small><button class="tb-primary tb-wide" data-action="start" id="start">НАЧАТЬ ЭТАП</button>'+
   '<div class="tb-stage-separator"></div><div class="tb-small-actions">'+button("auto","АВТО-БОЙ ДО "+Math.max(0,maxAuto),maxAuto>=c.progress.currentStage?"":"disabled")+
   button("heal-checkpoint","ХИЛ +50% HP · −20% XP",healReady?"":"disabled")+
   button("restart","НАЧАТЬ ЗАНОВО","")+
   '</div><small class="tb-note">Авто-бой доступен только до '+Math.max(0,maxAuto)+' этапа. На боссах и элитках он остановится.</small></aside></div>'+
   '<section class="tb-daily-panel"><div class="tb-daily-heading"><div><div class="tb-eyebrow">ЕЖЕДНЕВНЫЕ ИСПЫТАНИЯ · '+esc(daily.date)+'</div><h3>Задания дня</h3></div><span class="tb-daily-modifier">'+esc(daily.modifier?.name||"Без модификатора")+'</span></div><div class="tb-daily-quests">'+daily.quests.map(q=>'<div class="tb-daily-quest"><div><b>'+esc(q.name)+'</b><small>'+q.progress+'/'+q.target+' · награда '+q.reward_silver+' серебра</small></div><button data-daily-claim="'+q.id+'" '+(!q.complete||q.claimed?"disabled":"")+'>'+(q.claimed?"ПОЛУЧЕНО":"ЗАБРАТЬ")+'</button></div>').join("")+'</div><small class="tb-note">Задания сбрасываются в 00:00 UTC. Прогресс хранится в этом браузере.</small></section><div class="tb-bottom-strip"><span>Персонаж сохраняет уровень, таланты, экипировку и серебро</span><span>'+(c.heroic?"ГЕРОИЧЕСКИЙ РЕЖИМ":"Обычный режим")+'</span></div></section>';
 }
 function activeSkill(c){
  const def=classData(c);
  const available=c.level<10
   ?(def.base_skills||[]).filter(skill=>skill.type==="active"&&skill.unlock_level<=c.level)
   :skills.filter(skill=>skill.class_id===c.classId&&skill.branch_id===c.branch&&skill.unlock_level<=c.level);
  return available.find(skill=>skill.id===c.activeSkillId)||available[available.length-1]||null;
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
   body='<h3>Рюкзак · '+c.bag.length+'</h3><div class="tb-bag-items">'+(c.bag.length?c.bag.map(item=>'<div class="tb-bag-item"><span>'+esc(item.name||item.type)+'</span><small>'+esc(item.rarity||item.type)+' · '+(item.quantity||1)+'</small>'+(item.type==="healing_potion"?'<button data-belt-assign="'+item.id+'">В ПОЯС</button>':"")+(item.stats?'<button data-equip="'+item.id+'">НАДЕТЬ</button>':item.type==="refine_stone"?"<small>Камень заточки</small>":item.type==="enhancement_stone"?"<small>"+esc(item.stoneType.name||item.stoneType.branch_id||item.stoneType.branchId)+" · "+item.stoneType.slot+" · ур."+item.level+"</small>":'')+(item.type==="enhancement_stone"&&item.level<balance.equipment.stone_max_level?'<button data-merge="'+item.id+'" '+(c.bag.filter(x=>x.type==="enhancement_stone"&&x.level===item.level&&(x.stoneType.id||x.stoneType)===(item.stoneType.id||item.stoneType)).length<balance.equipment.stone_merge_count?"disabled":"")+' >СЛИТЬ 5 КАМНЕЙ</button>':'')+(["xp_10","xp_20","xp_50","xp_100","drop_20","drop_50","drop_75","drop_100","refine_10","refine_20","map_hint","repair_kit","silver_bonus","xp_hourglass","potion_capacity","one_rescue","stone_cache","socket","pity","refine_guard","rescue_seal","extra_socket","pity_token"].includes(item.type)?'<button data-use="'+item.id+'">ИСПОЛЬЗОВАТЬ</button>':'')+'</div>').join(""):'<div class="tb-lock">Рюкзак пока пуст.</div>')+'</div>';
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
 function deathScreen(){
  const c=live(),preview=engine.deathPreview(c.id),difficulty=balance.difficulty.modes[c.difficulty||balance.difficulty.default],total=difficulty.lives,remaining=c.run.lives||total;
  return header("Забег завершён",c.name+" · "+(c.difficulty||"normal"))+'<section class="tb-death"><div class="tb-death-mark">☠</div><div class="tb-eyebrow">ПОСЛЕДНИЙ ШАНС</div><h1>Персонаж погиб</h1><p>Сложность: '+esc(c.difficulty||"normal")+'. Потеря опыта: '+Math.round(difficulty.xp_loss_fraction*100)+'% опыта текущего забега.</p><div class="tb-death-lives">ОСТАЛОСЬ ЖИЗНЕЙ: <b>'+remaining+' / '+total+'</b></div><div class="tb-death-losses"><div><small>ОПЫТ К ПОТЕРЕ</small><b>'+preview.experienceLoss+'</b></div><div><small>ВОЗМОЖНОЕ СНИЖЕНИЕ</small><b>'+preview.levelsLost+' уровн.</b></div><div><small>ШАНС ПОТЕРИ ВЕЩИ</small><b>'+Math.round(preview.itemLossChance*100)+'%</b></div></div><p>Надетые предметы и боссовый лут защищены. В Hardcore авто-бой, пояс и чекпоинты отключены.</p><button class="tb-danger" data-action="confirm-death">ПОДТВЕРДИТЬ СМЕРТЬ</button><button data-action="map" disabled>ВОЗВРАТА В БОЙ НЕТ</button></section>';
 }
 function currentEnemyConfig(enemy,stage){return engine.getEnemyStats(live().id,stage,enemy).hp;}
 function loadBattleEnemy(){
  const c=live(),enemy=engine.currentEnemy(c.id),enemyStats=engine.getEnemyStats(c.id,battle.stage,enemy),hp=currentEnemyConfig(enemy,battle.stage);
  battle.enemy=enemy;battle.enemyStats=enemyStats;battle.enemyMax=hp;battle.enemyHp=hp;battle.shield=enemy.mechanic==="shield"?Math.round(hp*balance.elite_mechanics.shield.absorb_fraction):0;
  battle.turns=0;battle.teleportUsed=false;battle.poisonTicks=0;battle.busy=false;
  battle.dot=null;battle.hot=null;battle.enemyStunned=false;battle.parryChance=0;battle.nextDamageShield=0;
  battle.playerDamageBuff=0;battle.playerBuffUntil=0;battle.enemyDamageReduction=0;battle.enemyDamageReductionUntil=0;battle.pendingKill=false;
 }
 function battleScreen(){
  const c=live(),enemy=battle.enemy,enemyPct=Math.max(0,battle.enemyHp/battle.enemyMax*100),hp=engine.maxHp(c),heroPct=Math.max(0,c.run.playerHp/hp*100);
  const unlocked=engine.speed2Allowed(c.id,battle.stage);
  const skill=activeSkill(c),speed2=c.run.speed2,belt=engine.potionBeltSnapshot(c.id);
  return header("Арена · этап "+battle.stage,c.name+" · противник "+(engine.state.characters.find(x=>x.id===c.id).run.stage.enemyIndex+1)+"/"+battle.count)+
   '<section class="tb-arena"><div class="tb-arena-top"><span class="tb-arena-stage-label">АРЕНА · ЭТАП '+battle.stage+'</span><span>'+(enemy.type==="boss"?"БОСС":enemy.type==="elite"?"ЭЛИТНЫЙ ПРОТИВНИК":"ПРОТИВНИК")+'</span><button data-action="speed" id="speed" '+(!unlocked?"disabled":"")+'>'+(speed2?"×2 ВКЛ":"×2 ВЫКЛ")+'</button><button data-action="pause" id="pause">'+(battle.paused?"ПРОДОЛЖИТЬ":"ПАУЗА")+'</button></div><div class="tb-combat-stage '+(enemy.type==="boss"?"boss-fight":"")+'"><div class="tb-battle-enemy"><div class="tb-enemy-crest">'+(enemy.type==="boss"?"♛":enemy.type==="elite"?"✦":"◆")+'</div><div class="tb-enemy-title">'+(enemy.type==="boss"?"Хранитель этажа":enemy.type==="elite"?"Элита башни":"Страж башни")+'</div><div class="tb-enemy-mechanic">'+(enemy.mechanic?("Механика: "+esc(enemy.mechanic)):"")+'</div><div class="tb-healthbar enemy"><span style="width:'+enemyPct+'%"></span></div><small>'+Math.max(0,battle.enemyHp)+' / '+battle.enemyMax+' HP'+(battle.shield>0?" · Щит "+battle.shield:"")+'</small></div><div class="tb-vs">VS</div><div class="tb-battle-hero"><div class="tb-hero-art '+(engine.getRefinementGlow(c)||"")+'"><img src="'+portrait(c.classId)+'" alt=""></div><b>'+esc(c.name)+'</b><small>'+esc(clsName(c))+' · ур. '+c.level+'</small><div class="tb-healthbar hero"><span style="width:'+heroPct+'%"></span></div><small>'+Math.ceil(c.run.playerHp)+' / '+hp+' HP</small><div class="tb-resourcebar"><span style="width:'+Math.min(100,c.resource/c.resourceMax*100)+'%"></span></div><small>'+esc(classData(c).resource)+': '+c.resource+'/'+c.resourceMax+'</small></div></div><div class="tb-battle-actions"><button class="tb-primary" data-action="attack" '+(battle.busy?"disabled":"")+' id="hit">АТАКА</button><button data-action="skill" '+(battle.busy||!skill||Date.now()<battle.skillReadyAt?"disabled":"")+' id="skill">✦ '+(skill?esc(skill.name):"УМЕНИЕ")+'</button><button data-action="potion" '+(battle.busy||!c.bag.some(x=>x.type==="healing_potion"&&x.quantity>0)||engine.state.characters.find(x=>x.id===c.id).run.stage.potionSlotUsed?"disabled":"")+' id="potion">ЗЕЛЬЕ · '+c.bag.filter(x=>x.type==="healing_potion").reduce((s,x)=>s+x.quantity,0)+'</button></div><div class="tb-potion-belt">'+belt.map(slot=>'<button data-belt-use="'+slot.slot+'" '+(!slot.itemId||slot.available<=0||engine.state.characters.find(x=>x.id===c.id).run.stage.potionSlotUsed||battle.busy||battle.paused?"disabled":"")+' title="Доступно зелий: '+slot.available+'">ЗЕЛЬЕ '+(slot.slot+1)+'</button>').join("")+'</div><div class="tb-combat-note">'+(battle.busy?"Противник готовит ответный удар…":"Базовая скорость ×0.5 · ×2 доступна только при повторном прохождении")+'</div></section>';
 }
 function beginStage(){
  const c=live();
  try{
   const plan=engine.beginStage(c.id,selectedStage);
   battle={stage:plan.stage,count:plan.count,enemy:null,enemyHp:0,enemyMax:0,shield:0,turns:0,busy:false,skillReadyAt:0,teleportUsed:false,poisonTicks:0};
   if(preferredSpeed2&&engine.speed2Allowed(c.id,plan.stage))engine.setSpeed2(c.id,true,plan.stage);
   loadBattleEnemy();screen="battle";save();render();
  }catch(error){notify(error.message);}
 }
 function finishCurrentEnemy(){
  const c=live(),result=engine.finishEnemy(c.id,{speed2:c.run.speed2});
  if(result.loot.length)notify("Добыча: "+result.loot.map(x=>x.name||x.type).join(", "));
  if(result.stageComplete){
   battle=null;selectedStage=c.progress.currentStage;screen="map";save();render();notify("Этап пройден · HP восстановлено · опыт сохранён");
  }else{loadBattleEnemy();save();render();}
 }
 function endFromDamage(){
  const c=live();battle=null;screen="death";render();save();
 }
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
  const delay=engine.combatIntervalMs(c.id);
  clearTimeout(pendingTimer);pendingTimer=setTimeout(()=>{pendingTimer=null;if(!battle)return;if(battle.paused){battle.remainingResponseMs=0;return;}enemyCounter();},delay);
 }
 function equipItem(itemId){
  const c=live(),item=c.bag.find(x=>x.id===itemId);
  if(!item||!item.stats){notify("Этот предмет нельзя надеть");return;}
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
  const target=event.target.closest("[data-action],[data-pick],[data-class],[data-stage],[data-tab],[data-branch],[data-talent],[data-select-skill],[data-daily-claim],[data-equip],[data-refine],[data-socket],[data-merge],[data-use],[data-buy],[data-shop-tab],[data-belt-assign],[data-belt-use]");
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
   case "shop":screen="shop";render();break;
   case "start":beginStage();break;
   case "attack":playerAction(false);break;
   case "skill":playerAction(true);break;
   case "potion":try{engine.useHealingPotion(live().id);save();render();notify("Зелье использовано. Слот этой цели потрачен.");}catch(error){notify(error.message);}break;
   case "speed":try{engine.setSpeed2(live().id,!live().run.speed2,battle.stage);preferredSpeed2=live().run.speed2;localStorage.setItem("tb-rpg-speed-v2",preferredSpeed2?"2":"1");save();render();}catch(error){notify(error.message);}break;
   case "pause":if(battle){if(!battle.paused){battle.paused=true;if(pendingTimer){clearTimeout(pendingTimer);pendingTimer=null;battle.remainingResponseMs=engine.combatIntervalMs(live().id);}}else{battle.paused=false;if(battle.busy){const delay=battle.remainingResponseMs===undefined?engine.combatIntervalMs(live().id):battle.remainingResponseMs;battle.remainingResponseMs=undefined;clearTimeout(pendingTimer);pendingTimer=setTimeout(()=>{pendingTimer=null;if(battle&&!battle.paused)enemyCounter();},delay);}}save();render();}break;
   case "heal-checkpoint":try{const result=engine.checkpointHeal(live().id);save();render();notify("HP восстановлено · −20% XP до этапа "+result.penaltyUntil);}catch(error){notify(error.message);}break;
   case "auto":try{const result=engine.autoBattle(live().id);selectedStage=live().progress.currentStage;save();render();notify("Авто-бой: "+result.cleared+" этапов · "+result.xp+" опыта · "+result.stopped);}catch(error){notify(error.message);}break;
   case "restart":try{engine.voluntaryRestart(live().id);selectedStage=1;screen="characters";battle=null;save();render();notify("Забег завершён добровольно · весь опыт сохранён");}catch(error){notify(error.message);}break;
   case "reset-talents":try{engine.resetTalents(live().id);save();render();notify("Таланты сброшены");}catch(error){notify(error.message);}break;
   case "confirm-death":{const result=engine.confirmDeath(live().id);selectedId=live().id;selectedStage=live().progress.currentStage;screen="map";save();render();notify(result.runEnded?"Все три жизни потеряны · забег начнётся с этапа 1":"Потеряна одна жизнь · осталось "+result.livesRemaining+" · продолжаем с этапа "+selectedStage);break;}
  }
 }
 root.addEventListener("pointerup",function(event){if(event.target.closest(".tb-v2"))event.stopImmediatePropagation();},true);
 document.addEventListener("click",handleClick);
 function pauseForFocusLoss(){if(screen==="battle"&&battle&&!battle.paused){battle.paused=true;if(pendingTimer){clearTimeout(pendingTimer);pendingTimer=null;battle.remainingResponseMs=engine.combatIntervalMs(live().id);}save();render();}}
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