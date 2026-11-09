(function(){
 "use strict";
 const root=document.getElementById("tbRpg");
 if(!root)return;
 const turnStyle=document.createElement("style");turnStyle.id="tb-turn-based-style";turnStyle.textContent=".tb-turn-initiative{padding:9px 12px;border:1px solid rgba(201,162,39,.45);border-radius:10px;background:rgba(12,17,24,.88);display:grid;gap:7px}.tb-turn-initiative>b{font:800 10px system-ui;letter-spacing:.12em;color:#e8cc82}.tb-initiative-list{display:flex;gap:6px;overflow:auto}.tb-initiative-list span{flex:none;padding:5px 8px;border:1px solid #5a5140;border-radius:7px;font:700 10px system-ui;color:#ddd}.tb-initiative-list span.player{border-color:#78a86d;color:#c9f1b7}.tb-initiative-list span.enemy{border-color:#9d5a52;color:#f2b5a9}.tb-initiative-list span.active{box-shadow:0 0 0 2px #f0d17a;background:rgba(240,209,122,.12)}.tb-end-turn{width:100%;height:58px;min-height:54px;max-height:64px;padding:0 12px;line-height:1;border:2px solid #ffd66b;border-radius:12px;background:linear-gradient(180deg,#f6ad35,#b85a12);box-shadow:0 5px 18px #d9792444;color:#201205;font-size:14px;font-weight:1000;letter-spacing:.08em}.tb-end-turn:disabled{opacity:.52;filter:grayscale(1);box-shadow:none}.tb-end-turn.is-player-turn{animation:tb-end-pulse 2s ease-in-out infinite}.tb-panel-actions{display:grid;gap:8px}.tb-panel-slots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.tb-telegraph.lethal{border:2px solid #ff394d;background:rgba(100,10,20,.8);color:#fff}.tb-arena-top{display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap} .tb-turn-guidance{font:700 12px/1.35 system-ui;color:#f5e7c2;text-align:center;padding:2px 6px}.tb-turn-tutorial{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:#05070bdc;backdrop-filter:blur(8px)}.tb-turn-tutorial-card{width:min(100%,440px);padding:24px;border:1px solid #d2aa58;border-radius:18px;background:linear-gradient(155deg,#22283a,#101522);box-shadow:0 24px 80px #000b;color:#f5ecd8}.tb-turn-tutorial-card h2{margin:8px 0 16px;font:900 23px system-ui}.tb-turn-tutorial-card ol{padding-left:22px;display:grid;gap:13px;font:600 14px/1.5 system-ui}.tb-turn-tutorial-card li::marker{color:#f3bd53}.tb-turn-tutorial-card .tb-wide{margin-top:14px}@keyframes tb-end-pulse{0%,100%{box-shadow:0 5px 18px #d9792444}50%{box-shadow:0 5px 24px #ffb53c99}}";document.head.appendChild(turnStyle);
 const artInboxStyle=document.createElement("style");
 artInboxStyle.id="tb-art-inbox-style-v1";
 artInboxStyle.textContent=`
  #tbRpg .tb-hero-art img,#tbRpg .tb-mini-avatar img,#tbRpg .tb-character-card img,#tbRpg .tb-profile-avatar img,#tbRpg .tb-hero-chip img,#tbRpg .tb-char-art img,#tbRpg .tb-class-picker img{display:block;max-width:100%;max-height:100%;object-fit:contain!important;object-position:center center!important}
  #tbRpg .tb-enemy-portrait{display:flex;align-items:center;justify-content:center;width:100%;height:clamp(108px,19vw,166px);min-width:0;overflow:hidden;margin:2px auto 8px;border-radius:12px;background:radial-gradient(ellipse at 50% 46%,#343650 0%,#151a2b 72%);border:1px solid #b9a2e52b}
  #tbRpg .tb-enemy-portrait img{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain!important;object-position:center bottom!important;filter:drop-shadow(0 5px 10px #000b)}
  #tbRpg .tb-target-art-wrap{display:flex;align-items:center;justify-content:center;width:100%;height:clamp(48px,10vw,76px);min-width:0;overflow:hidden}
  #tbRpg .tb-target-art{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain!important;object-position:center center!important;filter:drop-shadow(0 3px 6px #0009)}
  #tbRpg .tb-target-card{min-width:0}
 `;
 document.head.appendChild(artInboxStyle);
 const CHARACTER_ART_ROOT="./assets/characters/";
 const classPortraits={
  assassin:"heroes/reaper.png",
  bishop:"heroes/arcanist.png",
  dragonkin:"enemies/crimson-executioner.png",
  destroyer:"heroes/warden.png",
  elemental:"bosses/ice-abbot.png",
  duelist:"enemies/phantom-duelist.png",
  shaman:"bosses/ash-patriarch.png"
 };
 const mobPortraits={
  "shadow-goblin":"enemies/shadow-goblin.png",
  "cursed-knight":"enemies/cursed-knight.png",
  "ash-wolf":"enemies/ash-wolf.png",
  "rune-golem":"enemies/rune-golem.png",
  "grave-archer":"enemies/grave-archer.png",
  "plague-witch":"enemies/plague-witch.png",
  "ash-imp":"enemies/ash-imp.png",
  "swamp-reaper":"enemies/swamp-reaper.png",
  "bone-warden":"enemies/bone-warden.png",
  "crimson-executioner":"enemies/crimson-executioner.png",
  "void-hunter":"enemies/void-hunter.png",
  "spider-matron":"enemies/spider-matron.png",
  "blind-monk":"enemies/blind-monk.png",
  "stone-minotaur":"enemies/stone-minotaur.png",
  "phantom-duelist":"enemies/phantom-duelist.png",
  "soul-harvester":"enemies/soul-harvester.png",
  "forest-horror":"enemies/forest-horror.png",
  "abyss-knight":"enemies/abyss-knight.png",
  "cursed-alchemist":"enemies/cursed-alchemist.png",
  "root-colossus":"enemies/root-colossus.png"
 };
 const rolePortraits={
  healer:"enemies/blind-monk.png",
  poison:"enemies/plague-witch.png",
  tank:"enemies/rune-golem.png",
  normal:"enemies/shadow-goblin.png"
 };
 const bossPortraits=[
  "bosses/bone-colossus.png",
  "bosses/abyss-queen.png",
  "bosses/ash-patriarch.png",
  "bosses/ice-abbot.png",
  "bosses/mirror-executioner.png",
  "bosses/soul-devourer.png",
  "bosses/root-titan.png",
  "bosses/void-hunter-boss.png",
  "bosses/heart-of-tower.png"
 ];
 const classFallback={assassin:"Ас",bishop:"Еп",dragonkin:"Др",destroyer:"Ра",elemental:"Ма",duelist:"Ду",shaman:"Ша"};
 const tabs=[["stats","Характеристики"],["talents","Таланты"],["skills","Умения"],["gear","Экипировка"],["bag","Рюкзак"]];
 let engine=null,balance=null,skills=[],screen="characters",profileTab="stats",shopTab="silver";
 let selectedId=null,selectedClass="assassin",selectedStage=1,dialogOpen=false,battle=null,toastTimer=null,toastMessage="",preferredSpeed2=localStorage.getItem("tb-rpg-speed-v2")==="2",pendingTimer=null,statusTimer=null,audioContext=null,routeChoice="standard",onlineLeaderboardRows=[],onlineLeaderboardError="",onlineBusy=false;
 function esc(value){return String(value===undefined||value===null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
 function rarityClass(value){return ({Обычная:"common",Редкая:"rare",Эпическая:"epic",Легендарная:"legendary",Богоподобная:"godlike"}[value]||"common");}
 function live(){return engine&&engine.state.characters.find(c=>c.id===selectedId);}
 function classData(c){return balance.classes.classes[c.classId];}
 function clsName(c){return classData(c).name;}
 function portrait(id){return CHARACTER_ART_ROOT+(classPortraits[id]||classPortraits.assassin);}
 function enemyPortrait(target){
  if(target?.type==="boss"||target?.role==="boss"){
   const stage=Math.max(1,Number(battle?.stage)||1);
   return CHARACTER_ART_ROOT+bossPortraits[(Math.ceil(stage/10)-1)%bossPortraits.length];
  }
  const mobId=String(target?.mobId||"").toLowerCase();
  if(mobPortraits[mobId])return CHARACTER_ART_ROOT+mobPortraits[mobId];
  const role=target?.role||"normal";
  return CHARACTER_ART_ROOT+(rolePortraits[role]||rolePortraits.normal);
 }
 function save(){try{localStorage.setItem("tb-rpg-v2",JSON.stringify(engine.state));window.TowerboundOnline?.queuePublish();}catch(e){notify("Не удалось сохранить: "+e.message);}}
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
  const daily=engine.dailySnapshot(c.id),chapter=engine.chapterForStage(selectedStage||c.progress.currentStage),modifierChoices=engine.runModifierOptions(c.id),weekly=engine.weeklySnapshot(c.id);
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
   nodes+='<button type="button" class="tb-map-node '+(cleared?"cleared ":"")+(selected?"selected ":"")+(isBoss?"boss":"")+'" data-stage="'+stage+'" '+(!accessible?"disabled":"")+'><strong>'+(isBoss?"♛":cleared?"✓":stage)+'</strong><small>'+(isBoss?"БОСС":cleared?"ПРОЙДЕН":"ЭТАП")+'</small></button>';
  }
  return header("Карта 250 уровней",c.name+" · "+clsName(c)+" · Ур. "+c.level)+
   '<section class="tb-map-screen"><div class="tb-map-top"><div class="tb-hero-chip"><img src="'+portrait(c.classId)+'" alt=""><div><b>'+esc(c.name)+'</b><small>'+esc(clsName(c))+' · '+esc(classData(c).resource)+': '+c.resource+'/'+c.resourceMax+'</small></div></div><div class="tb-currency"><span>◈ '+c.silver+' серебра</span><span>◆ '+engine.state.account.diamonds+' алмазов</span><span>Мощь '+engine.combatPower(c)+'</span><span>♥ Жизни: '+(c.run.lives||balance.difficulty.modes[c.difficulty||balance.difficulty.default].lives)+'/'+balance.difficulty.modes[c.difficulty||balance.difficulty.default].lives+'</span></div><div class="tb-map-actions"><button data-action="characters">Персонажи</button><button data-action="shop">МАГАЗИН</button><button data-action="profile">ПЕРСОНАЖ</button><button data-action="systems">АККАУНТ</button><button data-action="leaderboard">РЕЙТИНГ</button><button data-action="speedrun">СПИДРАН · 10 ЭТАПОВ</button></div></div>'+
   '<div class="tb-progressline"><span>Наивысший этап: <b>'+c.progress.highestEver+'/250</b></span><span>Следующий: <b>'+Math.min(c.progress.currentStage,250)+'</b></span><span>Чекпоинты: <b>'+c.progress.checkpoints.join(" · ")+'</b></span></div>'+
   (penalty?'<div class="tb-penalty">−20% ОПЫТА АКТИВНО · ОСТАЛОСЬ '+remaining+' ЭТАЖЕЙ</div>':"")+
   '<div class="tb-map-layout"><div class="tb-map-scroll"><div class="tb-map-grid">'+nodes+'</div></div><aside class="tb-stage-panel"><div class="tb-eyebrow">ВЫБРАННЫЙ ЭТАП</div><div class="tb-stage-number">'+selectedStage+'</div><h3>'+(selectedStage%balance.map.boss_every===0?"Боссовый бой":"Гаунтлет")+'</h3><p>'+(selectedStage%balance.map.boss_every===0?"Один босс, отдельное сражение":balance.map.gauntlet_ranges.find(r=>selectedStage>=r.min&&selectedStage<=r.max)?.allowed.join(" / ")+" противника подряд")+'</p><div class="tb-route-choice"><button data-route="standard">Обычный путь</button><button data-route="elite">Элитка + сундук</button></div><small>'+(trapStage?"⚠ ЛОВУШКА · требуется противоядие":"Без ловушки")+(antidotes?" · Противоядий: "+antidotes:"")+(selectedStage<=c.progress.highestEver?" · Повторное прохождение · 50% XP": " · Первое прохождение · 100% XP")+'</small><button class="tb-primary tb-wide" data-action="start" id="start">НАЧАТЬ ЭТАП</button>'+
   '<div class="tb-stage-separator"></div><div class="tb-small-actions">'+button("auto","АВТО-БОЙ ДО "+Math.max(0,maxAuto),maxAuto>=c.progress.currentStage?"":"disabled")+
   button("heal-checkpoint","ХИЛ +50% HP · −20% XP",healReady?"":"disabled")+
   button("restart","НАЧАТЬ ЗАНОВО","")+(trapStage?button("buy-antidote","КУПИТЬ ПРОТИВОЯДИЕ · 15 СЕРЕБРА",c.silver<15?"disabled":""):"")+
   '</div><small class="tb-note">Авто-бой доступен только до '+Math.max(0,maxAuto)+' этапа. На боссах и элитках он остановится.</small></aside></div>'+
   '<section class="tb-chapter-card" style="background-image:linear-gradient(90deg,#0b1020ed,#0b102080),url(\''+(chapter?.background||"")+'\')"><div class="tb-eyebrow">ГЛАВА '+(chapter?.id||1)+' / 5 · ЭТАПЫ '+(chapter?.stages?.join("–")||"1–50")+'</div><h2>'+esc(chapter?.name||"Порог семи печатей")+'</h2><p>'+esc(chapter?.lore||"")+'</p></section>'+
    '<section class="tb-run-modifier-panel"><div class="tb-daily-heading"><div><div class="tb-eyebrow">НОВЫЙ ЗАБЕГ</div><h3>Выбери модификатор · 1 из 3</h3></div><span>◆ '+engine.state.account.diamonds+' алмазов</span></div>'+(c.run.active?'<p>Активен: '+esc((balance.run_modifiers.modifiers.find(x=>x.id===c.run.runModifierId)||{}).name||"без модификатора")+'</p>':modifierChoices.map(m=>'<button data-run-modifier="'+m.id+'" class="'+(c.run.runModifierId===m.id?"active":"")+'"><b>'+esc(m.name)+'</b><small>'+esc(m.description)+'</small></button>').join(""))+'</section>'+
    '<section class="tb-weekly-panel"><div class="tb-daily-heading"><div><div class="tb-eyebrow">ВИКЛИ · '+esc(weekly[0]?.week||"ТЕКУЩАЯ НЕДЕЛЯ")+'</div><h3>Семь заданий на неделю</h3></div></div><div class="tb-daily-quests">'+weekly.map(q=>'<div class="tb-daily-quest"><div><b>'+esc(q.name)+'</b><small>'+q.progress+'/'+q.target+' · награда '+(q.reward.silver||0)+' серебра'+(q.reward.diamonds?' + '+q.reward.diamonds+' ◆':'')+'</small></div><button data-weekly-claim="'+q.id+'" '+(!q.complete||q.claimed?"disabled":"")+'>'+(q.claimed?"ПОЛУЧЕНО":q.complete?"ЗАБРАТЬ":"В ПРОЦЕССЕ")+'</button></div>').join("")+'</div><small class="tb-note">Прогресс общий для аккаунта. Сброс каждый понедельник в 00:00 UTC.</small></section><div class="tb-bottom-strip"><span>Персонаж сохраняет уровень, таланты, экипировку и серебро</span><span>'+(c.heroic?"ГЕРОИЧЕСКИЙ РЕЖИМ":"Обычный режим")+'</span></div></section>';
 }
 function branchSkills(c){return skills.filter(skill=>skill.class_id===c.classId&&skill.branch_id===c.branch).slice(0,balance.skills.skills_per_branch||10);}
 function ensureLoadout(c){
  const base=(classData(c).base_skills||[]).filter(skill=>c.level>=skill.unlock_level),branch=branchSkills(c).filter(skill=>c.level>=skill.unlock_level);
  const unlocked=[...base,...branch].filter((skill,index,all)=>all.findIndex(other=>other.id===skill.id)===index);
  const chosen=(Array.isArray(c.skillLoadout)?c.skillLoadout:[]).filter(id=>unlocked.some(skill=>skill.id===id)).slice(0,4);
  for(const skill of unlocked){if(chosen.length>=4)break;if(!chosen.includes(skill.id))chosen.push(skill.id);}
  c.skillLoadout=chosen;return Array.from({length:4},(_,index)=>unlocked.find(skill=>skill.id===chosen[index])||null);
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
 function elementIcon(type){return({fire:"🔥",ice:"❄",dark:"☠",physical:"⚔"})[type]||"◇";}
 function elementLabel(type){return({fire:"Огонь",ice:"Лёд",dark:"Тьма",physical:"Физический"})[type]||type;}
 function setBattleTarget(index){
  if(!battle||!battle.enemies[index]||!battle.enemies[index].alive)return;
  if(battle.telegraph&&battle.busy){notify("Дождись завершения хода противника");return;}
  try{engine.selectTarget(live().id,index);}catch(error){notify(error.message);return;}
  battle.targetIndex=index;battle.enemy=battle.enemies[index];battle.enemyStats=engine.getEnemyStats(live().id,battle.stage,battle.enemy);
  battle.enemyHp=battle.enemy.hp;battle.enemyMax=battle.enemy.maxHp;battle.shield=battle.enemy.shield||0;
  save();render();
 }
 function updateBossPhase(){
  if(!battle||battle.enemy?.type!=="boss")return 1;
  const phase=engine.bossPhaseInfo(battle.enemyHp,battle.enemyMax).phase;
  if(phase!==battle.bossPhase){battle.bossPhase=phase;battle.phaseFlashUntil=Date.now()+1000;battle.phaseNotice="ФАЗА "+phase;if(phase===2)addSummonedBossMobs();if(phase===4)battle.bossDeadlineTurns=(battle.playerTurnCount||0)+(battle.actor?.type==="player"?3:2);}
  return phase;
 }
 function activeComboNextSlots(){
  if(!battle)return[];const configs=(balance.combos?.combos||[]).filter(combo=>combo.class===live().classId),slots=[];
  for(const combo of configs){const progress=battle.comboProgress?.[combo.id]||0,next=combo.chain[progress];if(next)slots.push({combo,slot:Number(String(next).replace("slot",""))-1,progress});}
  return slots;
 }
 function buildInitiative(){
  const c=live(),stats=engine.getCombatStats(c),playerSpeed=Math.max(.01,stats.speed||stats.attackSpeedMultiplier||1);
  const actors=[{type:"player",id:"player",name:c.name,speed:playerSpeed}];
  for(const enemy of battle.enemies||[])if(enemy.alive)actors.push({type:"enemy",id:"enemy-"+enemy.index,index:enemy.index,name:enemy.type==="boss"?"Босс":(balance.mobs.roles[enemy.role]?.name||"Моб")+" "+(enemy.index+1),speed:Math.max(.01,enemy.speed||1)});
  return actors.sort((a,b)=>b.speed-a.speed||(a.type==="player"?-1:b.type==="player"?1:a.index-b.index));
 }
 function syncInitiative(){battle.turnOrder=buildInitiative();battle.turnIndex=0;battle.actor=battle.turnOrder[0]||{type:"player",id:"player",name:live().name};}
 function showPlayerTurn(){
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
  if(phase!==battle.bossPhase){battle.bossPhase=phase;battle.phaseFlashUntil=Date.now()+1000;battle.phaseNotice="ФАЗА "+phase;if(phase===2)addSummonedBossMobs();if(phase===4)battle.bossDeadlineTurns=2;}
  return phase;
 }
 function applyEnemyHit(attacker,raw){
  const c=live(),phase=attacker.type==="boss"?engine.bossPhaseInfo(attacker.hp,attacker.maxHp).phase:0;
  if(battle.counterPrimed&&!battle.counterConsumed&&(battle.counterTargetIndex===undefined||battle.counterTargetIndex===attacker.index)){
   battle.counterConsumed=true;battle.counterPrimed=false;battle.counterTargetIndex=battle.telegraph?.targetIndex;
   const reflected=applyTargetDamage(attacker,raw,"physical");notify("100% отражение · "+reflected.dealt+" урона");
   if(reflected.killed){battle.telegraph=null;battle.enemy=attacker;battle.targetIndex=attacker.index;engine.selectTarget(c.id,attacker.index);finishCurrentEnemy();}
   return;
  }
  let incoming=Math.max(0,Math.round(raw*engine.mitigationMultiplier(engine.getCombatStats(c).defense,battle.stage)));
  if((battle.enemyDamageReductionTurns||0)>0)incoming=Math.round(incoming*(1-(battle.enemyDamageReduction||0)));
  if((battle.nextDamageShield||0)>0){incoming=Math.max(0,incoming-battle.nextDamageShield);battle.nextDamageShield=0;}
  c.run.playerHp=Math.max(0,c.run.playerHp-incoming);notify("Враг наносит "+incoming+" урона");
  triggerVfx("enemy-hit","physical",phase===4||attacker.type==="boss");
  if(c.run.playerHp<=0)endFromDamage();
 }
 function enemyTurn(enemy){
  if(!battle||!enemy||!enemy.alive)return;
  const c=live();enemy.turnsTaken=(enemy.turnsTaken||0)+1;enemy.pendingAttack=false;
  if(enemy.type==="boss"){
   battle.bossTurns=(battle.bossTurns||0)+1;
   if(battle.bossTurns>15){c.run.playerHp=0;notify("ЯРОСТЬ БОССА · Время вышло");endFromDamage();return;}
  }
  if(battle.enemyStunned){battle.enemyStunned=false;notify("Враг оглушён · ход пропущен");return;}
  if(enemy.role==="healer"&&enemy.turnsTaken%2===0){
   const ally=battle.enemies.filter(x=>x.alive&&x.index!==enemy.index&&x.hp<x.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
   if(ally){const amount=Math.round(ally.maxHp*.2);ally.hp=Math.min(ally.maxHp,ally.hp+amount);if(ally.index===battle.targetIndex)battle.enemyHp=ally.hp;notify("Лекарь восстановил "+amount+" HP союзнику");}
  }
  if(enemy.role==="tank"&&enemy.turnsTaken%3===0)enemy.guardCharges=1;
  if(enemy.role==="poison"){battle.poisonStacks=(battle.poisonStacks||0)+1;notify("ОТРАВЛЕН · Яд: "+battle.poisonStacks+" стак.");}
  const stats=engine.getEnemyStats(c.id,battle.stage,enemy);
  battle.telegraph=null;
  applyEnemyHit(enemy,stats.damage);
 }
 function clearPendingTurnTimer(){if(pendingTimer!==null){clearTimeout(pendingTimer);pendingTimer=null;}}
 function scheduleEnemyTurnQueue(queue,index,token,delay){clearPendingTurnTimer();pendingTimer=setTimeout(()=>{pendingTimer=null;runEnemyTurnQueue(queue,index,token);},delay);}
 function advanceToPlayerTurn(){
  if(!battle)return;
  clearPendingTurnTimer();battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;
  battle.busy=false;battle.actor={type:"player",id:"player",name:live().name};battle.telegraph=null;
  showPlayerTurn();save();render();
 }
 function runEnemyTurnQueue(queue,index,token){
  if(!battle||screen!=="battle"||token!==battle.enemyQueueToken)return;
  if(battle.paused){scheduleEnemyTurnQueue(queue,index,token,250);return;}
  if(index>=queue.length){
   battle.playerTurnCount=(battle.playerTurnCount||0)+1;battle.round=(battle.round||1)+1;
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
  if(enemy?.alive)enemyTurn(enemy);
  if(!battle)return;
  save();render();
  scheduleEnemyTurnQueue(queue,index+1,token,500);
 }
 function endPlayerTurn(){
  if(!battle||battle.actor?.type!=="player"||battle.paused)return;
  clearPendingTurnTimer();battle.busy=false;
  const c=live(),stats=engine.getCombatStats(c);
  if(!battle.playerSkillUsed){
   const damage=Math.max(1,Math.round(stats.dps*(balance.combat.turn_based?.auto_attack_dps_multiplier||.5))),hit=applyTargetDamage(battle.enemy,damage,"physical");
   c.resource=Math.min(c.resourceMax,c.resource+Math.max(1,Math.round(c.resourceMax*(balance.combat.turn_based?.resource_regeneration_fraction||.2))));
   triggerVfx("attack","physical",false);showFloatingText("player","Автоатака!","#ffd34e");if(hit.killed){finishCurrentEnemy();if(!battle)return;}
  }
  if(battle.dot?.ticks>0){
   const target=battle.enemies.find(x=>x.index===battle.targetIndex&&x.alive);
   if(target){applyTargetDamage(target,battle.dot.damage,"dark");battle.dot.ticks--;if(target.hp<=0){finishCurrentEnemy();if(!battle)return;}}
  }
  if(battle.hot?.ticks>0){c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+battle.hot.heal);battle.hot.ticks--;}
  const queue=(battle.enemies||[]).filter(enemy=>enemy.alive);
  if(!queue.length){advanceToPlayerTurn();return;}
  battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;const queueToken=battle.enemyQueueToken;
  battle.busy=true;battle.actor={type:"enemy",id:"enemy-phase",name:"Ход противников"};
  battle.telegraph=null;notify("Противники атакуют...");save();render();
  scheduleEnemyTurnQueue(queue,0,queueToken,350);
 }
 function endTurnButton(){endPlayerTurn();}

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
   body='<h3>Экипировка</h3><div class="tb-gear-grid">'+(c.gear||[]).map((item,index)=>'<div class="tb-gear-slot '+(item?"rarity-"+rarityClass(item.rarity):"")+'"><small>СЛОТ '+(index+1)+'</small>'+(item?'<b>'+esc(item.name)+'</b><span>'+esc(item.rarity||"")+' · +'+(item.refine||0)+'</span><small>Гнёзда: '+(item.socketsAvailable||0)+' · Камни: '+(item.sockets||[]).length+'</small><button data-refine="'+item.id+'">ЗАТОЧИТЬ +1</button><button data-socket="'+item.id+'">ДОЛОТО · ГНЕЗДО</button><button data-stone="'+item.id+'">ВСТАВИТЬ КАМЕНЬ</button><button data-enchant="'+item.id+'" '+(!c.heroic?"disabled":"") + '>ЗАЧАРОВАТЬ</button>':'<span class="tb-empty-slot">Пусто</span>')+'</div>').join("")+'</div><div class="tb-bag-items">'+c.bag.filter(x=>x.stats).map(item=>'<div class="tb-bag-item rarity-'+rarityClass(item.rarity)+'"><span>'+esc(item.name)+'</span><small>'+esc(item.rarity||"Предмет")+'</small><button data-equip="'+item.id+'">НАДЕТЬ</button></div>').join("")+'</div>';
  }else{
   body='<h3>Рюкзак · '+c.bag.length+'</h3><div class="tb-bag-items">'+(c.bag.length?c.bag.map(item=>'<div class="tb-bag-item rarity-'+rarityClass(item.rarity)+'"><span>'+esc(item.name||item.type)+'</span><small>'+esc(item.rarity||item.type)+' · '+(item.quantity||1)+'</small>'+(item.type==="healing_potion"?'<button data-belt-assign="'+item.id+'">В ПОЯС</button>':"")+(item.stats?'<button data-equip="'+item.id+'">НАДЕТЬ</button><button data-salvage="'+item.id+'">РАЗОБРАТЬ</button>':item.type==="refine_stone"?"<small>Камень заточки</small>":item.type==="enhancement_stone"?"<small>"+esc(item.stoneType.name||item.stoneType.branch_id||item.stoneType.branchId)+" · "+item.stoneType.slot+" · ур."+item.level+"</small>":'')+(item.type==="craft_material"?'<button data-craft-stone="1">КОВАТЬ КАМЕНЬ I · 20 МАТЕРИАЛОВ</button>':'')+(item.type==="enhancement_stone"&&item.level<balance.equipment.stone_max_level?'<button data-merge="'+item.id+'" '+(c.bag.filter(x=>x.type==="enhancement_stone"&&x.level===item.level&&(x.stoneType.id||x.stoneType)===(item.stoneType.id||item.stoneType)).length<balance.equipment.stone_merge_count?"disabled":"")+' >СЛИТЬ 5 КАМНЕЙ</button>':'')+(["xp_10","xp_20","xp_50","xp_100","drop_20","drop_50","drop_75","drop_100","refine_10","refine_20","map_hint","repair_kit","silver_bonus","xp_hourglass","potion_capacity","one_rescue","stone_cache","socket","pity","refine_guard","rescue_seal","extra_socket","pity_token"].includes(item.type)?'<button data-use="'+item.id+'">ИСПОЛЬЗОВАТЬ</button>':'')+'</div>').join(""):'<div class="tb-lock">Рюкзак пока пуст.</div>')+'</div>';
  }
  return header("Профиль героя",c.name+" · "+clsName(c))+'<section class="tb-profile"><div class="tb-profile-top"><div class="tb-profile-avatar '+(engine.getRefinementGlow(c)||"")+' '+(engine.state.account.activeCosmetics?.frame||"")+'"><img src="'+portrait(c.classId)+'" alt=""></div><div><div class="tb-eyebrow">ПЕРСОНАЖ</div><h1>'+esc(c.name)+'</h1><p>'+esc(clsName(c))+' · Уровень '+c.level+' · Мощь '+engine.combatPower(c)+'</p></div><button data-action="map">НАЗАД К КАРТЕ</button></div><nav class="tb-tabs">'+tabs.map(t=>'<button data-tab="'+t[0]+'" class="'+(profileTab===t[0]?"active":"")+'">'+t[1]+'</button>').join("")+'</nav><div class="tb-profile-content">'+body+'</div></section>';
 }
 function shopScreen(){
  const c=live();if(!c)return characterList();
  const store=balance.economy[shopTab+"_store"];
  const products=Object.entries(store).filter(([key,value])=>typeof value==="number").map(([id,price])=>({id,price,name:id.replace(/_/g," ")})).concat((store.extra||[]).map(item=>({id:item.id,price:item.price,name:item.name})));
  const label=shopTab==="silver"?"серебра":"алм.";
  return header("Магазин","Персонажная и аккаунтная экономика")+'<section class="tb-shop"><div class="tb-shop-top"><h1>Магазин башни</h1><button data-action="map">К КАРТЕ</button></div><div class="tb-shop-balances"><span>◈ '+c.silver+' серебра персонажа</span><span>◆ '+engine.state.account.diamonds+' алмазов аккаунта</span><span>Премиум до '+(engine.state.account.premiumUntil?new Date(engine.state.account.premiumUntil).toLocaleDateString("ru-RU"):"—")+'</span></div><nav class="tb-tabs"><button data-shop-tab="silver" class="'+(shopTab==="silver"?"active":"")+'">ЗА СЕРЕБРО</button><button data-shop-tab="diamond" class="'+(shopTab==="diamond"?"active":"")+'">ЗА АЛМАЗЫ</button></nav><div class="tb-product-grid">'+products.map(item=>'<article class="tb-product"><div class="tb-product-icon">✧</div><b>'+esc(item.name.toUpperCase())+'</b><small>'+(item.id.startsWith("premium")?"Премиум аккаунт":item.id.startsWith("heal")?"Зелье исцеления":item.id.startsWith("xp")?"Зелье опыта":item.id.startsWith("drop")?"Зелье шанса дропа":"Улучшение экипировки")+'</small><span class="tb-product-price">'+item.price+' '+label+'</span><button data-buy="'+item.id+'" '+(shopTab==="silver"?(c.silver<item.price?"disabled":""):(engine.state.account.diamonds<item.price?"disabled":""))+'>КУПИТЬ</button></article>').join("")+'</div>'+
   (shopTab==="diamond"?'<div class="tb-packages"><h3>Пакеты алмазов</h3><div class="tb-package-grid">'+balance.economy.diamond_packages.map(pack=>'<div><b>'+pack[0]+' алмазов</b><span>'+pack[1]+' ₽</span></div>').join("")+'</div><small>1 алмаз = 1 ₽ · платежи не подключены в браузерной версии</small></div>':'')+
   (shopTab==="diamond"?'<div class="tb-cosmetic-chests"><h2>Косметика за алмазы</h2><p>Только внешний вид · без влияния на характеристики.</p>'+(balance.cosmetics?.chests||[]).map(ch=>'<article><b>'+esc(ch.name)+'</b><small>'+ch.price+' ◆ · случайный предмет из коллекции</small><button data-cosmetic-chest="'+ch.id+'" '+(engine.state.account.diamonds<ch.price?'disabled':'')+'>ОТКРЫТЬ СУНДУК</button></article>').join("")+'</div>':'')+'<p class="tb-note">Алмазы и премиум принадлежат аккаунту. Платёжный провайдер в браузерной версии не подключён.</p></section>';
 }
  function systemsScreen(){
  const c=live();if(!c)return characterList();
  const account=engine.state.account,prefs={sound_enabled:true,volume_master:.8,volume_music:.7,volume_effects:.8,language:"ru",disable_refinement_glow:false,disable_particles:false,invert_camera:false,combat_log_toggle:true,...(account.settings||{})};
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
  const ownedCosmetics=(account.cosmetics||[]).map(id=>(balance.cosmetics?.items||[]).find(x=>x.id===id)).filter(Boolean),activeCosmetics=account.activeCosmetics||{};
   const cosmeticCards=ownedCosmetics.map(item=>'<article class="tb-system-row"><div><b>'+esc(item.name)+'</b><small>'+esc(item.type)+' · '+(activeCosmetics[item.type]===item.id?'НАДЕТО':'В КОЛЛЕКЦИИ')+'</small></div><button data-equip-cosmetic="'+item.id+'" '+(activeCosmetics[item.type]===item.id?'disabled':'')+'>НАДЕТЬ</button></article>').join("");
   const store=balance.pvp_store.items.map(item=>{
   const owned=item.kind==="cosmetic"?(account.cosmetics||[]).includes(item.id):item.kind==="account_relic"?(account.relics||[]).includes(item.id):item.kind==="character_item"?(account.classEpics||[]).includes(item.classId):false;
   const classBlocked=item.kind==="character_item"&&item.classId!==c.classId;
   return '<article class="tb-system-product"><b>'+esc(item.name)+'</b><small>'+esc(item.category)+' · '+item.price+' PvP-очков</small><button data-pvp-buy="'+item.id+'" '+(owned||classBlocked||(account.pvpPoints||0)<item.price?'disabled':'')+'>'+(owned?(item.kind==="character_item"?"УЖЕ ПОЛУЧЕНО":"УЖЕ КУПЛЕНО"):classBlocked?'ДРУГОЙ КЛАСС':'КУПИТЬ')+'</button></article>';
  }).join("");
  const paragon=c.paragon||{level:0,xp:0,stats:{}};
  const paragonRows=balance.paragon.stats.map(stat=>'<div class="tb-system-row"><div><b>'+esc(stat)+'</b><small>Ранг '+(paragon.stats?.[stat]||0)+'</small></div><button data-paragon-stat="'+stat+'" '+(c.level<balance.paragon.unlock_level||Object.values(paragon.stats||{}).reduce((a,b)=>a+b,0)>=paragon.level?'disabled':'')+'>+1</button></div>').join("");
  const settings='<div class="tb-system-settings"><label>Звук: Вкл/Выкл <input type="checkbox" data-setting="sound_enabled" '+(prefs.sound_enabled!==false?'checked':'')+'></label><label>Главная громкость <input type="range" min="0" max="1" step=".01" data-setting="volume_master" value="'+prefs.volume_master+'"></label><label>Музыка <input type="range" min="0" max="1" step=".01" data-setting="volume_music" value="'+prefs.volume_music+'"></label><label>Эффекты <input type="range" min="0" max="1" step=".01" data-setting="volume_effects" value="'+prefs.volume_effects+'"></label><label>Язык <select data-setting="language"><option value="ru" '+(prefs.language==="ru"?'selected':'')+'>Русский</option><option value="en" '+(prefs.language==="en"?'selected':'')+'>English</option></select></label><label>Отключить свечение заточки +20 <input type="checkbox" data-setting="disable_refinement_glow" '+(prefs.disable_refinement_glow?'checked':'')+'></label><label>Отключить частицы <input type="checkbox" data-setting="disable_particles" '+(prefs.disable_particles?'checked':'')+'></label><label>Инверсия камеры <input type="checkbox" data-setting="invert_camera" '+(prefs.invert_camera?'checked':'')+'></label><label>Комбат-лог <input type="checkbox" data-setting="combat_log_toggle" '+(prefs.combat_log_toggle!==false?'checked':'')+'></label><label>Отключить тряску экрана <input type="checkbox" data-setting="disable_screen_shake" '+(prefs.disable_screen_shake?'checked':'')+'></label><label>Отключить вспышки умений <input type="checkbox" data-setting="disable_skill_flashes" '+(prefs.disable_skill_flashes?'checked':'')+'></label><label>Отключить телеграфы (хардкорная опция) <input type="checkbox" data-setting="disable_telegraphs" '+(prefs.disable_telegraphs?'checked':'')+'></label><label>Авто-разбор обычных и редких предметов ниже ilvl N <input type="checkbox" data-setting="autoSalvage" '+(prefs.autoSalvage?'checked':'')+'></label><label>Порог ilvl для авто-разбора <input type="number" min="1" max="120" data-setting="autoSalvageBelow" value="'+(prefs.autoSalvageBelow||40)+'"></label><label>Чистый экран · скрыть цифры урона и второстепенные иконки <input type="checkbox" data-setting="clean_ui" '+(prefs.clean_ui?'checked':'')+'></label><label>Сложность <select data-setting="difficulty"><option value="easy" '+(c.difficulty==="easy"?'selected':'')+'>Easy</option><option value="normal" '+(c.difficulty==="normal"?'selected':'')+'>Normal</option><option value="hardcore" '+(c.difficulty==="hardcore"?'selected':'')+'>Hardcore</option></select></label></div>';
  const pending=account.pvpDaily?.pending;
  const weekly=engine.weeklyLeaderboard();
  const activeSeason=c.run.season?.modifier||engine.state.season?.modifier,activeDaily=c.run.dailyModifier||daily.modifier;
  return header("Системы аккаунта","Аккаунт · уровень "+engine.accountLevel())+'<section class="tb-systems"><div class="tb-system-top"><div><h1>Системы и прогресс</h1><p>'+esc(c.name)+' · '+esc(clsName(c))+' · '+c.level+' уровень</p></div><button data-action="map">К КАРТЕ</button></div>'+
   '<div class="tb-system-stats"><span>Аккаунт ур. '+engine.accountLevel()+'</span><span>PvP-очки '+(account.pvpPoints||0)+'</span><span>Стеш '+(engine.state.stash||[]).length+'/'+balance.stash.slots+'</span><span>Прочитано '+(c.loreRead||[]).length+'/25</span></div>'+
   '<section class="tb-system-card"><h2>Настройки</h2>'+settings+'</section>'+
   '<section class="tb-system-card"><h2>Туториал · '+tutorial.step+'/'+balance.tutorial.steps+'</h2><p>'+(tutorial.completed?'Туториал завершён':'Шесть последовательных шагов. Можно пропустить.')+'</p><div class="tb-system-actions">'+button("tutorial-next","СЛЕДУЮЩИЙ ШАГ",tutorial.completed?"disabled":"")+button("tutorial-skip","ПРОПУСТИТЬ",tutorial.completed?"disabled":"")+(tutorial.completed&&!tutorial.rewardClaimed?button("tutorial-claim","ЗАБРАТЬ 100 СЕРЕБРА + ЗЕЛЬЕ"):"")+'</div></section>'+
   '<section class="tb-system-card"><h2>Дневной босс</h2><p>Награда: '+balance.heroic.daily_boss_reward.silver+' серебра и '+balance.heroic.daily_boss_reward.diamonds+' алмаза. Вход: '+balance.heroic.daily_boss_cost.silver+' серебра.</p><div class="tb-system-actions">'+button("daily-boss","СРАЗИТЬСЯ ЗА 500 СЕРЕБРА",daily.boss.started?"disabled":"")+'<span>'+(daily.boss.completed?(daily.boss.won?"ПОБЕДА":"ПОРАЖЕНИЕ"):daily.boss.started?"ПОПЫТКА ИСПОЛЬЗОВАНА":"ПОПЫТКА ДОСТУПНА")+'</span></div></section>'+
   '<section class="tb-system-card"><h2>Косметическая коллекция · '+ownedCosmetics.length+'</h2>'+(cosmeticCards||'<small>Пока нет косметики. Сундуки находятся в магазине за алмазы.</small>')+'</section>'+
    '<section class="tb-system-card"><h2>Сезонный модификатор</h2><p>'+esc(activeSeason?.name||"Нет активного модификатора")+'</p><small>Фиксируется при старте забега; период сезона '+balance.seasons.season_length_days+' дней.</small></section>'+
   '<section class="tb-system-card"><h2>Модификатор дня</h2><p>'+esc(activeDaily?.name||"Нет ежедневного модификатора")+'</p><small>Действует на бои забега; обновление каждый день в 00:00 UTC.</small></section>'+
   '<section class="tb-system-card"><h2>Достижения · '+claimed.length+'/'+balance.achievements.achievements.length+'</h2>'+achievementCards+'</section>'+
   '<section class="tb-system-card"><h2>Лор башни</h2>'+loreCards+'</section>'+
   '<section class="tb-system-card"><h2>Общий стеш · '+(engine.state.stash||[]).length+'/'+balance.stash.slots+'</h2><p>Только '+esc(balance.stash.min_rarity)+' и выше. Предмет привязывается при первом использовании. Передача — один раз в день.</p>'+(stash||'<small>Общий стеш пуст.</small>')+'<h3>Экипировка для передачи</h3>'+(depositable||'<small>Нет предметов эпик+ для передачи.</small>')+'</section>'+
   '<section class="tb-system-card"><h2>PvP-арена · '+(account.pvpPoints||0)+' очков</h2><p>Поиск реального игрока по боевой мощи ±15%. Снимок его класса, умений, талантов и экипировки загружается из Supabase. Боты отключены.</p><div class="tb-system-actions">'+button("pvp-match","НАЙТИ РЕАЛЬНОГО СОПЕРНИКА")+(pending?button("pvp-fight","СРАЗИТЬСЯ · "+esc(pending.opponent?.name||"СОПЕРНИК")):"")+'</div>'+(pending?.opponent?.online?'<div class="tb-system-row"><div><b>'+esc(pending.opponent.name)+' · '+esc(balance.classes.classes[pending.opponent.classId]?.name||pending.opponent.classId)+'</b><small>Уровень '+pending.opponent.level+' · '+pending.opponent.bp+' BP · этап '+pending.opponent.maxStage+' · HP '+pending.opponent.stats.maxHp+' · атака '+pending.opponent.stats.attack+' · защита '+pending.opponent.stats.defense+'</small></div><span>ОНЛАЙН-ПРИЗРАК</span></div>':'')+'<div class="tb-system-products">'+store+'</div><p class="tb-online-warning">Важно: текущая симуляция боя и локальные PvP-очки пока не являются серверно подтверждённым результатом. Глобальный PvP-рейтинг не начисляет очки из браузера.</p><button data-action="leaderboard">ОТКРЫТЬ ГЛОБАЛЬНЫЙ ТОП-100</button></section>'+
   '<section class="tb-system-card"><h2>Парагон · '+(paragon.level||0)+'/100</h2><p>XP: '+(paragon.xp||0)+' / '+balance.paragon.xp_per_point+'. Доступен после уровня100.</p>'+paragonRows+button("paragon-reset","СБРОСИТЬ ПАРАГОН · "+balance.paragon.reset_cost_silver+" СЕРЕБРА",Object.values(paragon.stats||{}).reduce((a,b)=>a+b,0)?"":"disabled")+'</section>'+
   '<section class="tb-system-card"><h2>Управление персонажем</h2><p>Удаление или полный сброс требуют двух подтверждений и точного ввода ника.</p><div class="tb-system-actions">'+button("reset-character","ПОЛНЫЙ СБРОС ПЕРСОНАЖА")+button("delete-character","УДАЛИТЬ ПЕРСОНАЖА")+'</div></section>'+
   '<section class="tb-system-card"><h2>Комбат-лог · последние '+(c.combatLog||[]).length+'/'+balance.settings.combat_log_max_events+'</h2>'+((c.combatLog||[]).slice(-balance.settings.combat_log_max_events).reverse().map(x=>'<div class="tb-system-row"><small>'+esc(new Date(x.at).toLocaleTimeString())+'</small><span>'+esc(x.event)+'</span></div>').join("")||'<small>Событий пока нет.</small>')+'</section>'+
   '</section>';
 }
 function leaderboardScreen(){
  const c=live();
  const rows=onlineLeaderboardRows.map((row,index)=>'<article class="tb-system-row"><div><b>#'+(index+1)+' '+esc(row.nickname)+'</b><small>'+esc(balance.classes.classes[row.class]?.name||row.class)+' · этап '+row.max_stage+'</small></div><strong>'+Number(row.battle_power).toLocaleString('ru-RU')+' BP</strong></article>').join('');
  return header("Глобальный рейтинг","Топ-100 игроков")+'<section class="tb-systems"><div class="tb-system-top"><div><h1>Рейтинг игроков</h1><p>'+(c?esc(c.name)+' · '+engine.combatPower(c)+' BP':'Список лучших героев башни')+'</p></div><button data-action="systems">НАЗАД</button></div><section class="tb-system-card"><div class="tb-system-actions"><button data-action="leaderboard-refresh" '+(onlineBusy?'disabled':'')+'>'+(onlineBusy?'ЗАГРУЗКА…':'ОБНОВИТЬ ТОП-100')+'</button></div>'+(onlineLeaderboardError?'<p class="tb-online-error">'+esc(onlineLeaderboardError)+'</p>':'')+(rows||'<p>Пока нет опубликованных игроков. Войди в аккаунт и опубликуй своего героя.</p>')+'<small>Глобальный рейтинг Supabase · сортировка по боевой мощи и максимальному этапу.</small></section></section>';
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
  const c=live(),stage=c.run.stage;
  if(!battle.enemies){
   battle.enemies=stage.mobs.map((mob,i)=>{const stats=engine.getEnemyStats(c.id,battle.stage,mob),hp=stats.hp;return{...mob,index:i,id:"enemy-"+i,hp,maxHp:hp,alive:true,attackIntervalMs:stats.attackIntervalMs,shield:mob.mechanic==="shield"?Math.round(hp*balance.elite_mechanics.shield.absorb_fraction):0,nextHealAt:0,nextPoisonAt:0,slowedUntil:0,pendingAttack:false,turnsTaken:0,speed:mob.speed||1};});
   const healer=battle.enemies.find(enemy=>enemy.role==="healer"&&enemy.alive);index=healer?healer.index:(stage.targetIndex??0);
  }
  if(index===undefined||index===null||!battle.enemies[index]?.alive)index=battle.enemies.find(enemy=>enemy.alive)?.index;
  if(index===undefined)return;
  engine.selectTarget(c.id,index);battle.targetIndex=index;battle.enemy=battle.enemies[index];battle.enemyStats=engine.getEnemyStats(c.id,battle.stage,battle.enemy);
  battle.enemyMax=battle.enemy.maxHp;battle.enemyHp=battle.enemy.hp;battle.shield=battle.enemy.shield||0;if(c.heroic&&!battle.enemy.mutation&&battle.enemy.type!=="boss")battle.enemy.mutation=Math.random()<.5?"vampirism":"thorns";
  battle.counterAction=null;battle.pendingKill=false;battle.enemyStunned=false;battle.dot=null;battle.hot=null;battle.parryChance=0;battle.nextDamageShield=0;battle.teleportUsed=false;
  battle.playerDamageBuff=0;battle.playerBuffUntil=0;battle.enemyDamageReduction=0;battle.enemyDamageReductionUntil=0;
  battle.bossPhase=battle.enemy.type==="boss"?updateBossPhase():0;
 }
 function battleScreen(){
  const c=live(),enemy=battle.enemy,hp=engine.maxHp(c),heroPct=Math.max(0,c.run.playerHp/hp*100),enemyPct=Math.max(0,battle.enemyHp/Math.max(1,battle.enemyMax)*100);
  const slots=ensureLoadout(c),counter=counterAbility(c),ultimate=ultimateAbility(c),remaining=battle.enemies.filter(x=>x.alive).length;
  const order=buildInitiative().map((actor,index)=>'<span class="'+(actor.type==="player"?"player":"enemy")+(actor.id===battle.actor?.id?" active":"")+'">'+(index+1)+' · '+esc(actor.name)+(actor.id===battle.actor?.id?" · СЕЙЧАС":"")+'</span>').join("");
  const roleIcon={healer:"✚",poison:"☠",tank:"🛡",normal:"",boss:"♛"},skillRoleLabels=["НАКОПЛЕНИЕ","ДЕТОНАТОР","МАССОВАЯ АТАКА","ТАКТИКА"];
  const telegraph=battle.telegraph?'<div class="tb-telegraph tb-target-warning '+(battle.telegraph.lethal?"lethal":"strong_hit")+'"><b>'+(battle.telegraph.icon||"⚔")+'</b><span>'+esc(battle.telegraph.label)+'</span><small>СЛЕДУЮЩИЙ ХОД</small></div>':'<div class="tb-telegraph-idle">Враг пока не заряжает атаку</div>';
  const targets=battle.enemies.map(target=>'<button class="tb-target-card '+(target.index===battle.targetIndex?"selected ":"")+(!target.alive?"defeated":"")+'" data-target="'+target.index+'" '+(!target.alive?"disabled":"")+'><span class=\"tb-target-art-wrap\"><img class=\"tb-target-art\" src=\"'+enemyPortrait(target)+'\" alt=\"\" loading=\"lazy\" decoding=\"async\"></span><span class="tb-target-role">'+(roleIcon[target.role]||"◆")+'</span><b>'+(target.type==="boss"?"БОСС":"МОБ "+(target.index+1))+'</b><small>'+(balance.mobs.roles[target.role]?.name||"Обычный")+'</small><span class="tb-target-hp"><i style="width:'+(target.hp/Math.max(1,target.maxHp)*100)+'%"></i></span><small>'+Math.ceil(target.hp)+' HP</small></button>').join("");
  const skillsMarkup=slots.map((skill,index)=>{const cd=skill?(battle.skillCooldowns?.[skill.id]||0):99,evolved=skill?window.TowerboundEndgame?.getSkillEvolution(skill.id):null;return '<button class="tb-panel-skill" data-panel-skill="'+(skill?.id||"")+'" data-panel-slot="'+index+'" '+(!skill||battle.actor?.type!=="player"||battle.playerSkillUsed||cd>0?"disabled":"")+'><kbd>'+(index+1)+'</kbd><b>'+(evolved?evolved.icon+' ':'')+esc(evolved?.name||skill?.name||"Умение не открыто")+'</b><small>'+(evolved?esc(evolved.desc)+' · ':'')+(skill?elementIcon(skill.damage_type)+" "+elementLabel(skill.damage_type)+(cd>0?" · "+cd+"х":""):"Откроется по уровню")+'</small></button>';}).join("");
  const counterCd=battle.counterCooldownTurns||0,ultCd=battle.ultimateCooldownTurns||0;
  const counterButton='<button class="tb-panel-skill counter" data-counter="1" '+(battle.actor?.type!=="player"||battle.busy||battle.playerSkillUsed||battle.counterPrimed||counterCd>0||c.resource<(counter.resource_cost||balance.resources.action_costs.counter)?"disabled":"")+'><kbd>5</kbd><b>'+esc(counter.name)+'</b><small>Контр-умение · '+counterCd+'х</small></button>';
  const ultButton='<button class="tb-panel-skill ultimate" data-ultimate="1" '+(battle.actor?.type!=="player"||battle.playerSkillUsed||ultCd>0||c.resource<(ultimate.resource_cost||balance.resources.action_costs.ultimate)?"disabled":"")+'><kbd>6</kbd><b>'+esc(ultimate.name)+'</b><small>Ультимейт · '+ultCd+'х</small></button>';
  const potions=engine.potionBeltSnapshot(c.id).map(slot=>'<button data-belt-use="'+slot.slot+'" '+(!slot.itemId||slot.available<=0||battle.potionUsedThisTurn||battle.actor?.type!=="player"||!balance.difficulty.modes[c.difficulty||balance.difficulty.default].potion_belt?"disabled":"")+' title="Зелий: '+slot.available+'">ЗЕЛЬЕ '+(slot.slot+1)+'</button>').join("");
  return header("Арена · этап "+battle.stage,c.name+" · врагов "+remaining)+
   '<section class="tb-arena tb-fixed-battle"><div class="tb-arena-top"><span>РАУНД '+battle.round+' · '+(battle.actor?.type==="player"?"ХОД ИГРОКА":"ХОД ПРОТИВНИКА")+'</span><span>ЭТАП '+battle.stage+'</span><span>ЦЕЛЕЙ '+remaining+'</span></div>'+
   '<div class="tb-turn-initiative"><b>ИНИЦИАТИВА · СЛЕДУЮЩИЕ ХОДЫ</b><div class="tb-initiative-list">'+order+'</div></div>'+
   '<div class="tb-target-grid">'+targets+'</div>'+
   '<div class="tb-combat-layout"><div class="tb-enemy-focus"><div class=\"tb-enemy-portrait\"><img src=\"'+enemyPortrait(enemy)+'\" alt=\"\" loading=\"eager\" decoding=\"async\"></div><div class="tb-enemy-role-icon">'+(roleIcon[enemy.role]||"◆")+'</div><div class="tb-enemy-title">'+(enemy.type==="boss"?"Хранитель этажа":"Страж башни")+'</div>'+telegraph+'<div class="tb-healthbar enemy"><span style="width:'+enemyPct+'%"></span></div><small>'+Math.ceil(battle.enemyHp)+' / '+battle.enemyMax+' HP'+(battle.shield>0?" · Щит "+battle.shield:"")+'</small></div>'+
   '<div class="tb-battle-hero"><div class="tb-hero-art"><img src="'+portrait(c.classId)+'" alt=""></div><b>'+esc(c.name)+'</b><small>'+esc(clsName(c))+' · ур. '+c.level+'</small><div class="tb-healthbar hero"><span style="width:'+heroPct+'%"></span></div><small>'+Math.ceil(c.run.playerHp)+' / '+hp+' HP</small><div class="tb-resourcebar"><span style="width:'+(c.resource/c.resourceMax*100)+'%"></span></div><small>'+esc(classData(c).resource)+': '+c.resource+'/'+c.resourceMax+'</small></div></div>'+
   '<div class="tb-panel-actions"><div class="tb-panel-slots">'+skillsMarkup+counterButton+ultButton+'</div><div class="tb-turn-guidance" aria-live="polite">'+(battle.actor?.type==="player"?"Твой ход. Выбери умение или нажми «Конец хода».":"Противники атакуют...")+'</div><button class="tb-end-turn" data-action="end-turn" '+(battle.actor?.type!=="player"?"disabled aria-disabled=\"true\"":"")+'>'+(battle.actor?.type==="player"?"ЗАВЕРШИТЬ ХОД":"ХОД ПРОТИВНИКА...")+'</button></div>'+
   '<div class="tb-potion-belt">'+potions+'</div><div class="tb-combat-note">'+(battle.playerSkillUsed?"Умение использовано · можно выпить зелье и завершить ход":"Нажми 1–6 для умения или заверши ход для автоатаки")+'</div><div class="tb-fx-layer" aria-hidden="true"></div>'+(battle.showTutorial?'<div class="tb-turn-tutorial" role="dialog" aria-modal="true" aria-labelledby="tb-turn-tutorial-title"><div class="tb-turn-tutorial-card"><div class="tb-eyebrow">ПЕРВЫЙ БОЙ</div><h2 id="tb-turn-tutorial-title">Как проходит бой</h2><ol><li>Это пошаговый бой. Сейчас твой ход.</li><li>Нажми на умение (1–6) или на кнопку «Конец хода», чтобы ударить и передать ход.</li><li>Следи за телеграфами над мобами — они предупреждают о сильных атаках. Используй контр-умение, чтобы блокировать.</li></ol><button type="button" class="tb-primary tb-wide" data-action="dismiss-turn-tutorial">ПОНЯТНО</button></div></div>':"")+'</section>';
 }
 function beginStage(){
  const c=live();
  try{
   const plan=engine.beginStage(c.id,selectedStage);ensureLoadout(c);
   if(routeChoice==="elite"&&!plan.boss&&c.run.stage?.mobs?.length){c.run.stage.mobs[0].type="elite";c.run.stage.mobs[0].mechanic="shield";}
   if(selectedStage%13===0){const stack=c.bag.find(x=>x.type==="antidote"&&(x.quantity||1)>0);if(stack){stack.quantity=(stack.quantity||1)-1;c.bag=c.bag.filter(x=>x.quantity!==0);notify("Ловушка обезврежена противоядием");}else{const trapDamage=Math.round(engine.maxHp(c)*.08);c.run.playerHp=Math.max(1,c.run.playerHp-trapDamage);notify("Ловушка! −"+trapDamage+" HP · купи противоядие");}}
   selectedStage=plan.stage;
   battle={stage:plan.stage,count:plan.count,enemy:null,enemyHp:0,enemyMax:0,shield:0,round:1,turnIndex:0,turnOrder:[],actor:null,turns:0,busy:false,enemies:null,targetIndex:0,skillCooldowns:{},counterCooldownTurns:0,ultimateCooldownTurns:0,playerSkillUsed:false,potionUsedThisTurn:false,counterPrimed:false,counterConsumed:false,playerTurnCount:0,bossDeadlineTurns:null,bossAddsSummoned:false,poisonStacks:0,comboProgress:{},attacksThisFight:0,distinctElements:[],buffsUsed:0,telegraph:null,paused:false,proc:null,fx:null,enemyQueueToken:0,showTutorial:localStorage.getItem("tb-turn-tutorial-seen-v1")!=="1"};
   loadBattleEnemy();syncInitiative();showPlayerTurn();screen="battle";save();render();
  }catch(error){notify(error.message);}
 }
 function finishCurrentEnemy(){
  clearTimeout(pendingTimer);pendingTimer=null;
  const c=live(),defeated=battle.enemy,dead=(battle.enemies||[]).filter(enemy=>!enemy.alive||enemy.hp<=0).sort((x,y)=>x.index-y.index);
  let result=null;const allLoot=[];
  for(const target of dead){
   if(c.run.stage?.killedIndices?.includes(target.index))continue;
   const current=engine.finishEnemy(c.id,{speed2:c.run.speed2,targetIndex:target.index,overkillBonus:target.index===defeated.index&&!!battle.overkillBonus});
   battle.overkillBonus=false;allLoot.push(...(current.loot||[]));result=current;
   target.hp=0;target.alive=false;target.dead=true;
  }
  if(!result)return;
  if(allLoot.length)notify("Добыча: "+allLoot.map(x=>x.name||x.type).join(", "));
  if(result.stageComplete){
   stopBattleStatusLoop();clearTimeout(pendingTimer);pendingTimer=null;const speedrun=c.run.speedrun;if(speedrun?.active){speedrun.remaining=Math.max(0,(speedrun.remaining||10)-1);if(speedrun.remaining>0&&c.progress.currentStage<=balance.map.total_stages){battle=null;selectedStage=c.progress.currentStage;screen="map";save();render();notify("Спидран · осталось "+speedrun.remaining);beginStage();return;}c.stats.speedrun_completions=(c.stats.speedrun_completions||0)+1;c.run.speedrun=null;notify("Спидран завершён!");}if(routeChoice==="elite"){c.silver+=30;routeChoice="standard";notify("Элитный сундук · +30 серебра");}battle=null;selectedStage=c.progress.currentStage;screen="map";save();render();notify("Этап пройден · HP восстановлено · опыт сохранён");
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
   if(!enemy.alive)continue;
   if(enemy.role==="healer"&&now>=enemy.nextHealAt){
    const ally=battle.enemies.filter(x=>x.alive&&x.index!==enemy.index&&x.hp<x.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
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
  options=options||{};const c=live();let revived=false,multiplier=engine.damageTypeMultiplier(target,damageType||"physical");
  if(!options.ignoreArmor&&target.role==="tank"&&target.alive&&(target.guardCharges||0)>0){multiplier*=1-(balance.mobs.roles.tank.shield_fraction||.3);target.guardCharges--; }
  let damage=Math.max(0,Math.round(rawDamage*multiplier));
  if(!options.ignoreArmor&&target.shield>0){const absorbed=Math.min(target.shield,damage);target.shield-=absorbed;damage-=absorbed;}
  const hpBeforeHit=target.hp;const dealt=Math.min(target.hp,damage);target.hp=Math.max(0,target.hp-damage);if(dealt>0)engine.applyVampirism(c.id,dealt);if(dealt>0&&target.mutation==="vampirism")target.hp=Math.min(target.maxHp,target.hp+Math.round(dealt*.06));if(dealt>0&&target.mutation==="thorns"){const thorn=Math.max(1,Math.round(dealt*.04));c.run.playerHp=Math.max(0,c.run.playerHp-thorn);showFloatingText("player","-"+thorn,"#ff596b");playSfx("hurt");}if(dealt>0&&battle.actionIsSkill&&battle.actionIsPrimaryHit&&rawDamage>2*hpBeforeHit)battle.overkillBonus=true;
  if(dealt>0){showFloatingText(target,options.critical?"КРИТ -"+dealt:"-"+dealt,options.critical?"#ffd34e":"#ff596b");playSfx(options.critical?"crit":"hit");}
  if(target.index===battle.targetIndex){battle.enemyHp=target.hp;battle.shield=target.shield||0;}
  if(target.type==="boss")updateBossPhase();
  return{damage,dealt,multiplier,killed:target.hp<=0,revived};
 }
 function scheduleEnemyTelegraph(){const farmSpeed=live().progression?.speed3?3:1;/* No real-time timers: speed3 is applied to turn cooldown cadence. */}
 function resolveEnemyTelegraph(){/* Enemy turns resolve through initiative. */}
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
  const stats=engine.getCombatStats(c),damage=stats.dps*(balance.combat.turn_based?.ultimate_dps_multiplier||6);
  if(ultimate.effect==="heal_shield"||ultimate.effect==="heal_aoe")c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*ultimate.heal_fraction));
  if(ultimate.effect==="heal_shield")battle.nextDamageShield=Math.round(engine.maxHp(c)*ultimate.shield_fraction);
  if(ultimate.effect==="heal_aoe"||ultimate.effect==="aoe_burst"){for(const target of battle.enemies.filter(x=>x.alive))applyTargetDamage(target,damage,ultimate.damage_type);}
  else if(ultimate.effect==="single_burst")applyTargetDamage(battle.enemy,damage,ultimate.damage_type);
  triggerVfx("ultimate",ultimate.damage_type,false);if(battle.enemy.hp<=0){finishCurrentEnemy();return;}save();render();
 }
 function enemyCounter(){resolveEnemyTelegraph();}
 function playerAction(skillId,slotIndex){
  if(!battle||battle.actor?.type!=="player"||battle.playerSkillUsed)return;
  const c=live(),stats=engine.getCombatStats(c),skill=skills.find(item=>item.id===skillId);
  if(!skill||!engine.skillAvailable(c,skill)){notify("Умение недоступно");return;}
  const cd=battle.skillCooldowns?.[skill.id]||0;if(cd>0){notify("Откат: "+cd+" хода");return;}
  const effect=balance.skill_effects[skill.effect_template]||balance.skill_effects.strike;let cost=c.classId==="duelist"?(balance.resources.class_costs?.duelist?.attack_skill||1):(effect.resource_cost??balance.resources.action_costs.attack_skill);if(battle.freeSkillCharges>0){cost=0;battle.freeSkillCharges--;}
  if(c.resource<cost){notify("Не хватает ресурса: "+classData(c).resource);return;}
  c.resource-=cost;battle.playerSkillUsed=true;battle.skillCooldowns=battle.skillCooldowns||{};
  const mastered=(c.progression?.skillMastery?.[skill.id]||0)>=100?1:0,cooldownTurns=effect.cooldown_turns||effect.cooldown||4;
  battle.skillCooldowns[skill.id]=Math.max(1,(effect.cooldown||4)-mastered);
  if(effect.cooldown_turns)battle.skillCooldowns[skill.id]=Math.max(1,effect.cooldown_turns-mastered);
  let damage=stats.dps*(balance.combat.turn_based?.skill_dps_multiplier||2.5)*(stats.damageMultiplier||1),guaranteedCrit=false;const evolvedSkill=window.TowerboundEndgame?.getSkillEvolution(skill.id);if(evolvedSkill?.id==="pierce")damage*=1.4;if(evolvedSkill?.id==="burst")damage*=1.35;
  const elementHint=String(skill.element||skill.branch_id||skill.name||"").toLowerCase();const damageType=skill.damage_type||(elementHint.includes("fire")||/огн|плам|жар/.test(elementHint)?"fire":elementHint.includes("water")||/вод/.test(elementHint)?"water":elementHint.includes("lightning")||/молни|гроз|электр/.test(elementHint)?"lightning":"physical");
  if(effect.type==="heal"&&effect.heal_multiplier)c.run.playerHp=Math.min(engine.maxHp(c),c.run.playerHp+Math.round(engine.maxHp(c)*effect.heal_multiplier));
  if(effect.type==="hot"&&effect.heal_multiplier)battle.hot={heal:Math.round(engine.maxHp(c)*effect.heal_multiplier),ticks:effect.ticks||3};
  if(effect.type==="shield"&&effect.shield_fraction)battle.nextDamageShield=Math.round(engine.maxHp(c)*effect.shield_fraction);
  if(effect.type==="dot"&&effect.damage_multiplier)battle.dot={damage:Math.max(1,Math.round(stats.dps*effect.damage_multiplier)),ticks:effect.ticks||3};
  if(effect.type==="buff"){battle.playerDamageBuff=effect.power_multiplier||0;battle.playerDamageBuffTurns=Math.max(1,effect.duration_turns||effect.duration||3);battle.buffsUsed=(battle.buffsUsed||0)+1;}
  if(effect.type==="debuff"){battle.enemyDamageReduction=effect.power_multiplier||0;battle.enemyDamageReductionTurns=Math.max(1,effect.duration_turns||effect.duration||3);}
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
  const evolutionHitOptions=evolvedSkill?.id==="pierce"?{ignoreArmor:true}:undefined;
  if(effect.type==="aoe"||evolvedSkill?.id==="burst"){for(const enemy of battle.enemies.filter(x=>x.alive)){const hit=applyTargetDamage(enemy,damage,damageType,evolutionHitOptions);if(enemy===target)result=hit;}}
  else if(!["heal","hot","buff","shield","debuff"].includes(effect.type))result=applyTargetDamage(target,damage,damageType,evolutionHitOptions);
  battle.actionIsPrimaryHit=false;battle.actionIsSkill=false;
  if(skill&&hadBossCast&&target.hp>0){const interrupt=Math.max(1,Math.round(target.maxHp*.1));target.hp=Math.max(0,target.hp-interrupt);battle.enemyHp=target.hp;battle.telegraph=null;notify("ПРЕРВАНО · −"+interrupt+" HP");}
  if(skill&&target.hp>0){
   const current=String(damageType).toLowerCase(),previous=battle.lastElement;
   if((previous==="fire"&&current==="water")||(previous==="water"&&current==="fire")){battle.enemyStunned=true;showFloatingText(target,"ПАР · ОГЛУШЕНИЕ","#73cfff");notify("ПАР · ОГЛУШЕНИЕ");}
   else if((previous==="lightning"&&current==="water")||(previous==="water"&&current==="lightning")){const shock=Math.min(target.hp,Math.round(result.dealt));target.hp-=shock;battle.enemyHp=target.hp;showFloatingText(target,"ЭЛЕКТРОШОК -"+shock,"#ffe45c");notify("ЭЛЕКТРОШОК");}
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
  const c=live(),item=c.bag.find(x=>x.id===itemId);
  if(!item||!item.stats){notify("Этот предмет нельзя надеть");return;}
  engine.bindItemOnUse(c.id,itemId);
  let slot=Number.isInteger(item.slot)?item.slot:(item.slot==="weapon"?0:item.slot==="chest"?1:item.slot==="head"?2:item.slot==="legs"?3:item.slot==="hands"?4:5);
  slot=Math.max(0,Math.min(c.gear.length-1,slot));
  const old=c.gear[slot];c.gear[slot]=item;c.bag=c.bag.filter(x=>x.id!==itemId);if(old)c.bag.push(old);
  c.run.playerHp=Math.min(c.run.playerHp,engine.maxHp(c));save();render();
 }
 function showScreen(name){screen=name;render();}
 function battleRenderKey(){
  if(!battle)return "";
  return [battle.stage,battle.round,battle.actor?.type||"",battle.playerSkillUsed?1:0,battle.potionUsedThisTurn?1:0,battle.counterPrimed?1:0,battle.showTutorial?1:0,Math.round(live().run.playerHp),Math.round(live().resource),battle.targetIndex,battle.bossPhase||0,battle.telegraph?.targetIndex??"",battle.telegraph?.label||"",(battle.enemies||[]).map(x=>x.index+":"+x.role+":"+(x.alive?1:0)+":"+Math.round(x.hp)).join(",")].join("|");
 }
 function updateBattleDOM(){
  if(!battle)return;
  const c=live(),arena=root.querySelector(".tb-arena");if(!arena)return;
  const hp=engine.maxHp(c),hero=root.querySelector(".tb-battle-hero"),heroBars=hero?.querySelectorAll(".tb-healthbar span,.tb-resourcebar span")||[];
  if(heroBars[0])heroBars[0].style.width=Math.max(0,c.run.playerHp/hp*100)+"%";
  if(heroBars[1])heroBars[1].style.width=Math.min(100,c.resource/Math.max(1,c.resourceMax)*100)+"%";
  const heroSmall=hero?.querySelectorAll("small")||[];
  if(heroSmall[1])heroSmall[1].textContent=Math.ceil(c.run.playerHp)+" / "+hp+" HP";
  if(heroSmall[2])heroSmall[2].textContent=classData(c).resource+": "+c.resource+"/"+c.resourceMax;
  const focus=root.querySelector(".tb-enemy-focus"),enemyBar=focus?.querySelector(".tb-healthbar.enemy span");
  if(enemyBar)enemyBar.style.width=Math.max(0,battle.enemyHp/Math.max(1,battle.enemyMax)*100)+"%";
  const focusSmall=focus?.querySelectorAll("small")||[];
  if(focusSmall.length)focusSmall[focusSmall.length-1].textContent=Math.max(0,Math.ceil(battle.enemyHp))+" / "+battle.enemyMax+" HP"+(battle.shield>0?" · Щит "+battle.shield:"");
  (battle.enemies||[]).forEach(target=>{
   const card=root.querySelector('.tb-target-card[data-target="'+target.index+'"]');if(!card)return;
   const bar=card.querySelector(".tb-target-hp i");if(bar)bar.style.width=Math.max(0,target.hp/Math.max(1,target.maxHp)*100)+"%";
   const small=card.querySelectorAll("small");if(small.length)small[small.length-1].textContent=Math.max(0,Math.ceil(target.hp))+" HP";
   card.disabled=!target.alive;card.classList.toggle("defeated",!target.alive);card.classList.toggle("selected",target.index===battle.targetIndex);
  });
  const hit=root.querySelector("#hit");if(hit)hit.disabled=!!(battle.busy||battle.paused);
  const slots=ensureLoadout(c);
  root.querySelectorAll("[data-panel-skill]").forEach(button=>{const skill=slots[Number(button.dataset.panelSlot)],cd=skill?(battle.skillCooldowns?.[skill.id]||0):Infinity;button.disabled=!skill||battle.actor?.type!=="player"||battle.busy||battle.paused||battle.playerSkillUsed||cd>0;});
  const counter=counterAbility(c),ult=ultimateAbility(c);
  const counterButton=root.querySelector("[data-counter]");if(counterButton)counterButton.disabled=battle.actor?.type!=="player"||battle.busy||battle.playerSkillUsed||battle.counterPrimed||(battle.counterCooldownTurns||0)>0||battle.paused||c.resource<(counter.resource_cost||balance.resources.action_costs.counter);
  const ultButton=root.querySelector("[data-ultimate]");if(ultButton)ultButton.disabled=battle.actor?.type!=="player"||battle.busy||battle.paused||battle.playerSkillUsed||(battle.ultimateCooldownTurns||0)>0||c.resource<(ult.resource_cost||balance.resources.action_costs.ultimate);
  const potionEnabled=balance.difficulty.modes[c.difficulty||balance.difficulty.default].potion_belt&&!c.run.stage.potionUsedTargets?.includes(battle.targetIndex);
  root.querySelectorAll("[data-belt-use]").forEach(button=>{const slot=engine.potionBeltSnapshot(c.id).find(x=>x.slot===Number(button.dataset.beltUse));button.disabled=!slot||!slot.itemId||slot.available<=0||!potionEnabled||battle.actor?.type!=="player"||battle.playerSkillUsed||battle.potionUsedThisTurn||battle.busy||battle.paused;});
  const endTurn=root.querySelector("[data-action=\"end-turn\"]");if(endTurn){const playerTurn=battle.actor?.type==="player";endTurn.disabled=!playerTurn||battle.paused;endTurn.textContent=playerTurn?"ЗАВЕРШИТЬ ХОД":"ХОД ПРОТИВНИКА...";endTurn.classList.toggle("is-player-turn",playerTurn);}
  const guidance=root.querySelector(".tb-turn-guidance");if(guidance)guidance.textContent=battle.actor?.type==="player"?"Твой ход. Выбери умение или нажми «Конец хода».":"Противники атакуют...";
  const pause=root.querySelector("#pause");if(pause)pause.textContent=battle.paused?"ПРОДОЛЖИТЬ":"ПАУЗА";
  const speed=root.querySelector("#speed");if(speed)speed.textContent=c.run.speed2?"×2 ВКЛ":"×2 ВЫКЛ";
  const telegraph=root.querySelector(".tb-telegraph small");if(telegraph&&battle.telegraph)telegraph.textContent=Math.max(0,(battle.telegraph.until-Date.now())/1000).toFixed(1)+" сек";
  root.querySelector(".tb-panel-actions")?.classList.toggle("tb-player-turn",!battle.busy&&!battle.paused);
  arena.classList.toggle("tb-shaking",!!(battle.shakeUntil>Date.now()));
  arena.classList.toggle("tb-phase-flash",!!(battle.phaseFlashUntil>Date.now()));
  ["attack","skill","ultimate","telegraph"].forEach(kind=>arena.classList.toggle("tb-fx-"+kind,!!(battle.fx&&battle.fx.kind===kind&&battle.fx.until>Date.now())));
  const fx=root.querySelector(".tb-fx-layer");if(fx)fx.style.setProperty("--tb-fx-color",battle.fx?.color||"#f3c968");
 }
 function render(){
  if(!engine)return;
  const isBattle=screen==="battle"&&!!battle;
  document.body.classList.toggle("tb-battle-lock",isBattle);
  document.documentElement.classList.toggle("tb-battle-lock",isBattle);
  if(isBattle){
   const existing=root.querySelector(".tb-arena"),key=battleRenderKey();
   if(existing&&existing.dataset.renderKey===key){updateBattleDOM();return;}
   root.innerHTML='<div class="tb-v2">'+battleScreen()+'</div>';
   const arena=root.querySelector(".tb-arena");if(arena)arena.dataset.renderKey=key;
  }else if(screen==="characters")root.innerHTML='<div class="tb-v2">'+characterList()+'</div>';
  else if(screen==="map")root.innerHTML='<div class="tb-v2">'+mapScreen()+'</div>';
  else if(screen==="profile")root.innerHTML='<div class="tb-v2">'+profileScreen()+'</div>';
  else if(screen==="shop")root.innerHTML='<div class="tb-v2">'+shopScreen()+'</div>';
  else if(screen==="systems")root.innerHTML='<div class="tb-v2">'+systemsScreen()+'</div>';
  else if(screen==="leaderboard")root.innerHTML='<div class="tb-v2">'+leaderboardScreen()+'</div>';
  else if(screen==="death")root.innerHTML='<div class="tb-v2">'+deathScreen()+'</div>';
  else root.innerHTML='<div class="tb-v2">'+characterList()+'</div>';
  let toast=root.querySelector(".tb-toast");
  if(!toast){toast=document.createElement("div");toast.className="tb-toast";root.querySelector(".tb-v2").appendChild(toast);}
  if(toastMessage){toast.textContent=toastMessage;}
  root.querySelectorAll(".tb-map-node").forEach(node=>{if(Number(node.dataset.stage)===selectedStage)node.classList.add("selected");});
 }
 function createCharacter(){
  const name=root.querySelector("#name")?.value||"";
  try{const created=engine.createCharacter(name,selectedClass);selectedId=created.id;engine.state.activeCharacterId=created.id;dialogOpen=false;screen="characters";selectedStage=1;save();render();notify("Персонаж создан · стартовый набор: 100 серебра, 3 зелья и 24 часа премиума");}
  catch(error){notify(error.message);}
 }
 function handleClick(event){
  const target=event.target.closest("[data-action],[data-pick],[data-class],[data-stage],[data-tab],[data-branch],[data-talent],[data-select-skill],[data-daily-claim],[data-equip],[data-refine],[data-socket],[data-merge],[data-use],[data-buy],[data-shop-tab],[data-belt-assign],[data-belt-use],[data-achievement],[data-lore],[data-stash-deposit],[data-stash-withdraw],[data-pvp-buy],[data-paragon-stat],[data-salvage],[data-craft-stone],[data-target],[data-route],[data-panel-skill],[data-counter],[data-ultimate]");
  if(!target||!root.contains(target)&&!document.getElementById("rpgDialog")?.contains(target))return;
  event.preventDefault();
  playSfx("click");
  if(target.dataset.route){routeChoice=target.dataset.route;render();return;}if(target.dataset.pick){selectedId=target.dataset.pick;engine.state.activeCharacterId=selectedId;selectedStage=live().progress.currentStage;render();return;}
  if(target.dataset.class){selectedClass=target.dataset.class;render();return;}
  if(target.dataset.stage){selectedStage=Number(target.dataset.stage);render();return;}
   if(target.dataset.runModifier){try{const selected=engine.setRunModifier(live().id,target.dataset.runModifier);save();render();notify("Модификатор забега: "+selected.name);}catch(error){notify(error.message);}return;}
   if(target.dataset.weeklyClaim){try{engine.claimWeeklyQuest(live().id,target.dataset.weeklyClaim);save();render();notify("Викли: награда получена");}catch(error){notify(error.message);}return;}
   if(target.dataset.cosmeticChest){try{const item=engine.buyCosmeticChest(target.dataset.cosmeticChest);save();render();notify("Получена косметика: "+item.name);}catch(error){notify(error.message);}return;}
   if(target.dataset.equipCosmetic){try{const item=engine.equipCosmetic(target.dataset.equipCosmetic);save();render();notify("Косметика надета: "+item.name);}catch(error){notify(error.message);}return;}
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
  if(target.dataset.stone){try{const c=live(),item=c.gear.find(x=>x&&x.id===target.dataset.stone),stone=c.bag.find(x=>x.type==="enhancement_stone"&&(x.stoneType.class_id||x.stoneType.classId)===c.classId&&(x.stoneType.branch_id||x.stoneType.branchId)===c.branch);if(!item||!stone)throw new Error("Нет подходящего камня");engine.socketStone(c.id,item.id,stone.id);save();render();notify("Камень вставлен");}catch(error){notify(error.message);}return;}
  if(target.dataset.enchant){try{const c=live(),choices=engine.rollEnchantScroll(c.id,target.dataset.enchant),choice=Number(window.prompt("Выбери зачарование (1–4):\n"+choices.map((x,i)=>(i+1)+". "+x).join("\n")))-1;if(Number.isInteger(choice)&&choice>=0&&choice<4){engine.applyEnchant(c.id,target.dataset.enchant,choice,choices);save();render();notify("Зачарование применено");}else notify("Зачарование отменено");}catch(error){notify(error.message);}return;}
  if(target.dataset.buy){try{engine.purchase(live().id,shopTab,target.dataset.buy);save();render();notify("Покупка совершена");}catch(error){notify(error.message);}return;}
  switch(target.dataset.action){
   case "dismiss-turn-tutorial":if(battle){battle.showTutorial=false;localStorage.setItem("tb-turn-tutorial-seen-v1","1");render();}break;
   case "new":if(engine.state.characters.length>=balance.account.max_characters){notify("Достигнут лимит персонажей: "+balance.account.max_characters);return;}dialogOpen=true;selectedClass="assassin";render();break;
   case "close":dialogOpen=false;render();break;
   case "confirm-create":createCharacter();break;
   case "play":if(!selectedId&&engine.state.characters[0])selectedId=engine.state.characters[0].id;if(!selectedId){notify("Сначала создай персонажа");return;}engine.state.activeCharacterId=selectedId;selectedStage=live().progress.currentStage;screen="map";render();save();break;
   case "characters":screen="characters";render();break;
   case "map":stopBattleStatusLoop();clearPendingTurnTimer();if(battle)battle.enemyQueueToken=(battle.enemyQueueToken||0)+1;screen="map";battle=null;render();save();break;
   case "profile":profileTab="stats";screen="profile";render();break;
   case "profile-gear":profileTab="gear";screen="profile";render();break;
   case "systems":screen="systems";render();break;
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
   case "attack":notify("Автоатака выполняется при завершении хода без умения");break;
   case "end-turn":endTurnButton();break;
   case "skill":{const skill=activeSkill(live());if(skill)playerAction(skill.id,0);else notify("Нет доступного атакующего умения");break;}
   case "potion":try{engine.useHealingPotion(live().id);save();render();notify("Зелье использовано. Слот этой цели потрачен.");}catch(error){notify(error.message);}break;
   case "speed":try{engine.setSpeed2(live().id,!live().run.speed2,battle.stage);preferredSpeed2=live().run.speed2;localStorage.setItem("tb-rpg-speed-v2",preferredSpeed2?"2":"1");save();render();}catch(error){notify(error.message);}break;
   case "pause":if(battle){if(!battle.paused){battle.paused=true;if(pendingTimer){clearTimeout(pendingTimer);pendingTimer=null;battle.remainingResponseMs=Math.max(0,(battle.telegraph?.until||Date.now())-Date.now());}}else{battle.paused=false;if(battle.telegraph){const delay=battle.remainingResponseMs===undefined?Math.max(0,battle.telegraph.until-Date.now()):battle.remainingResponseMs;battle.telegraph.until=Date.now()+delay;battle.remainingResponseMs=undefined;clearTimeout(pendingTimer);pendingTimer=setTimeout(()=>{pendingTimer=null;resolveEnemyTelegraph();},delay);}else scheduleEnemyTelegraph();}save();render();}break;
   case "heal-checkpoint":try{const result=engine.checkpointHeal(live().id);save();render();notify("HP восстановлено · −20% XP до этапа "+result.penaltyUntil);}catch(error){notify(error.message);}break;
   case "auto":try{if(!live().run.runModifierId)throw new Error("Сначала выбери модификатор забега");const result=engine.autoBattle(live().id);selectedStage=live().progress.currentStage;save();render();notify("Авто-бой: "+result.cleared+" этапов · "+result.xp+" опыта · "+result.stopped);}catch(error){notify(error.message);}break;
   case "restart":try{engine.voluntaryRestart(live().id);selectedStage=1;screen="characters";battle=null;save();render();notify("Забег завершён добровольно · весь опыт сохранён");}catch(error){notify(error.message);}break;
   case "reset-talents":try{engine.resetTalents(live().id);save();render();notify("Таланты сброшены");}catch(error){notify(error.message);}break;
   case "revive":{try{const c=live(),result=engine.reviveFromDeath(c.id),stage=c.run.stage;battle={stage:stage.stage,count:stage.count,enemy:null,enemyHp:0,enemyMax:0,shield:0,turns:0,busy:false,enemies:null,targetIndex:stage.targetIndex??stage.enemyIndex??0,comboStacks:0,skillCooldowns:{},counterReadyAt:0,ultimateReadyAt:0,comboProgress:{},attacksThisFight:0,distinctElements:[],buffsUsed:0,poisonDots:[],telegraph:null,paused:false,proc:null,fx:null};loadBattleEnemy(stage.targetIndex??stage.enemyIndex??0);if(stage.uiBattleSnapshot){const snap=stage.uiBattleSnapshot;battle.enemies=snap.enemies;battle.comboStacks=snap.comboStacks;battle.skillCooldowns=snap.skillCooldowns;battle.comboProgress=snap.comboProgress;const ix=snap.targetIndex??stage.targetIndex??stage.enemyIndex??0;if(battle.enemies[ix]?.alive){engine.selectTarget(c.id,ix);battle.targetIndex=ix;battle.enemy=battle.enemies[ix];battle.enemyStats=engine.getEnemyStats(c.id,battle.stage,battle.enemy);battle.enemyHp=battle.enemy.hp;battle.enemyMax=battle.enemy.maxHp;battle.shield=battle.enemy.shield||0;}}screen="battle";startBattleStatusLoop();save();render();notify("Воскрешение · −"+result.price+" алмазов · 50% HP");}catch(error){notify(error.message);}break;}
    case "confirm-death":{const result=engine.confirmDeath(live().id);selectedId=live().id;selectedStage=live().progress.currentStage;screen="map";save();render();notify(result.runEnded?"Все жизни потеряны · забег начнётся с этапа 1":"Потеряна одна жизнь · осталось "+result.livesRemaining+" · продолжаем с этапа "+selectedStage);break;}
  }
 }
 root.addEventListener("pointerup",function(event){if(event.target.closest(".tb-v2"))event.stopImmediatePropagation();},true);
 document.addEventListener("click",handleClick);
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
   document.body.classList.toggle("tb-clean-ui",!!engine.state.account.settings?.clean_ui);
   render();
  }).catch(error=>console.error("Towerbound rework UI failed",error));
 }
 boot();
})();