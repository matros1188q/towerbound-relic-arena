(()=>{'use strict';
if(window.__TB_GUILD_SYSTEM_V1__)return;window.__TB_GUILD_SYSTEM_V1__=true;
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={attack:'Усиление атаки',magic_attack:'Усиление магической атаки',crit_damage:'Урон от критического удара',crit_chance:'Шанс критического удара',hp:'Увеличение здоровья',defense:'Усиление защиты',drop:'Шанс выпадения добычи',experience:'Получаемый опыт',poison_resist:'Сопротивление ядам',bleed_resist:'Сопротивление кровотечению'};
const desc={attack:'+2% атаки за уровень',magic_attack:'+2% магической атаки за уровень',crit_damage:'+5% критического урона за уровень',crit_chance:'+1% шанса крита за уровень',hp:'+3% максимального здоровья за уровень',defense:'+2% защиты за уровень',drop:'+2% шанса добычи за уровень',experience:'+2% опыта за уровень',poison_resist:'+5% сопротивления яду за уровень',bleed_resist:'+5% сопротивления кровотечению за уровень'};
const order=Object.keys(names);
let snapshot=null,view='directory',inside=false,searchText='',busy=false,pollTimer=0,game=null,lastError='';
const cloud=()=>window.TowerboundCloud,client=()=>cloud()?.client;
function notify(m){if(window.TowerboundToast)window.TowerboundToast(m);else if(window.TowerboundRPG?.toast)window.TowerboundRPG.toast(m);else alert(m)}
function errorText(e){
 const s=String(e?.message||e||'');
 const map={AUTH_REQUIRED:'Войди в игровой аккаунт.',ALREADY_IN_GUILD:'Ты уже состоишь в гильдии.',GUILD_NAME_LENGTH:'Название должно содержать от 3 до 24 символов.',GUILD_TAG_LENGTH:'Тег должен содержать от 2 до 5 символов.',GUILD_NOT_FOUND:'Гильдия не найдена или закрыта.',LEADER_CANNOT_LEAVE:'Глава не может покинуть гильдию. Передай руководство или распусти её.',LEADER_ONLY:'Это действие доступно только главе гильдии.',NOT_IN_GUILD:'Ты не состоишь в гильдии.',SILVER_RANGE:'За один раз можно внести от 1 000 до 100 000 серебра.',DIAMOND_RANGE:'За один раз можно внести от 5 до 100 алмазов.',DAILY_DEPOSIT_LIMIT:'Лимит 5 взносов этой валютой на сегодня исчерпан.',NOT_ENOUGH_SILVER:'Недостаточно серебра у персонажа.',NOT_ENOUGH_DIAMONDS:'Недостаточно алмазов на аккаунте.',TREASURY_NOT_ENOUGH:'В казне недостаточно средств для улучшения.',BUFF_MAX_LEVEL:'Этот баф уже достиг 5 уровня.',INVALID_BUFF:'Неизвестный баф.',MESSAGE_LENGTH:'Сообщение должно содержать от 1 до 500 символов.',CHAT_COOLDOWN:'Писать в чат можно раз в 5 секунд.',RAID_COOLDOWN:'Ты уже участвовал в рейде. Следующая попытка будет доступна через 60 минут.',BOSS_DEFEATED:'Гильдия уже победила босса на этой неделе.',EXACTLY_THREE_CARDS_REQUIRED:'Для попытки нужно сыграть ровно 3 карты.',PLAYER_SAVE_NOT_FOUND:'Облачное сохранение игрока не найдено. Перезайди в игру.'};
 for(const [k,v] of Object.entries(map))if(s.includes(k))return v;
 return s||'Не удалось выполнить действие.';
}
async function rpc(name,args={}){const c=client();if(!cloud()?.signedIn||!c)throw new Error('AUTH_REQUIRED');const {data,error}=await c.rpc(name,args);if(error)throw error;return data;}
function activeCharacter(){const e=game||window.TowerboundRework;return e?.state?.characters?.find(c=>c.id===e.state.activeCharacterId)||e?.state?.characters?.[0]||null;}
function setRuntimeBuffs(){
 const c=activeCharacter();if(!c)return;
 const buffs=snapshot?.buffs||{},daily=snapshot?.daily_bonus||{};
 try{Object.defineProperty(c,'guildBuffs',{value:{...buffs},writable:true,configurable:true,enumerable:false});Object.defineProperty(c,'guildDailyBonus',{value:{exp_bonus_percent:Number(daily.exp_bonus_percent)||0,drop_bonus_percent:Number(daily.drop_bonus_percent)||0},writable:true,configurable:true,enumerable:false});}catch(_){c.guildBuffs={...buffs};c.guildDailyBonus={...daily};}
}
async function syncServerRevision(){
 const cl=cloud();if(!cl?.signedIn||!cl.loadGame)return;
 try{const remote=await cl.loadGame();if(remote?.revision&&Number(remote.revision)>Number(cl.revision||0)&&cl.refreshFromServer)await cl.refreshFromServer();}catch(e){console.warn('[guild] save revision check failed',e)}
}
async function load(){
 if(!cloud()?.signedIn){snapshot=null;return null;}
 snapshot=await rpc('tb_guild_snapshot');
 if(snapshot?.member){setRuntimeBuffs();await syncServerRevision();}
 return snapshot;
}
function fmt(n){return Math.max(0,Number(n)||0).toLocaleString('ru-RU')}
function dateTime(value){if(!value)return '—';const d=new Date(value);return d.toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
function pill(text,live=false){return '<span class="tbg-pill '+(live?'is-live':'')+'">'+text+'</span>'}
function header(g){return '<div class="tbg-head"><div><small>ГИЛЬДИЯ · ОБЩИЙ ДОМ</small><h3>⚜ '+esc(g.name)+' <span>['+esc(g.tag)+']</span></h3><p>Глава · '+esc(snapshot.members?.find(m=>m.role==='leader')?.nickname||'—')+'</p></div><button type="button" data-guild="back">Назад</button></div>'}
function nav(){const items=[['overview','Обзор'],['treasury','Казна'],['buffs','Бафы'],['members','Участники'],['chat','Чат'],['boss','Рейд']];return '<nav class="tbg-nav">'+items.map(([id,label])=>'<button type="button" data-guild="tab" data-tab="'+id+'" class="'+(view===id?'is-active':'')+'">'+label+'</button>').join('')+'</nav>'}
function overview(){
 const g=snapshot.guild,t=snapshot.treasury||{},b=snapshot.boss||{},d=snapshot.daily_bonus||{},leader=snapshot.leaderboard||[];
 return '<article class="tbg-card tbg-hero"><small>МОЯ ГИЛЬДИЯ</small><h3>'+esc(g.name)+' <span>['+esc(g.tag)+']</span></h3><div class="tbg-metrics"><div><small>УЧАСТНИКИ</small><b>'+snapshot.members.length+'</b></div><div><small>СЕРЕБРО</small><b>'+fmt(t.silver)+'</b></div><div><small>АЛМАЗЫ</small><b>'+fmt(t.diamonds)+' 💎</b></div></div><div class="tbg-daily"><span>Опыт сегодня <b>+'+(Number(d.exp_bonus_percent)||0)+'%</b></span><span>Шанс дропа <b>+'+(Number(d.drop_bonus_percent)||0)+'%</b></span></div><p>Твой вклад помогает всей гильдии. Босс, рейтинг и казна общие для всех участников.</p></article><div class="tbg-shortcuts"><button data-guild="tab" data-tab="treasury">▣ Казна гильдии</button><button data-guild="tab" data-tab="members">♙ Участники</button><button data-guild="tab" data-tab="chat">✉ Чат гильдии</button><button data-guild="tab" data-tab="boss">☠ Рейдовый босс</button><button data-guild="tab" data-tab="buffs">✦ Гильдейские бафы</button></div><article class="tbg-card"><div class="tbg-card-title"><h4>Топ 5 урона гильдии</h4><button data-guild="tab" data-tab="boss">Весь рейтинг</button></div>'+leader.slice(0,5).map((m,i)=>'<div class="tbg-rank"><b>#'+(i+1)+'</b><span>'+esc(m.nickname)+'</span><strong>'+fmt(m.damage)+'</strong></div>').join('')+(leader.length?'':'<p class="tbg-muted">На этой неделе пока нет попыток.</p>')+'</article>'+(g.is_leader?'<article class="tbg-card"><button class="tbg-danger" data-guild="disband">Распустить гильдию</button></article>':'<article class="tbg-card"><button class="tbg-danger" data-guild="leave">Покинуть гильдию</button></article>');
}
function treasury(){
 const t=snapshot.treasury||{},d=snapshot.daily_bonus||{},counts=snapshot.contributions_today||{};
 return '<article class="tbg-card"><small>ОБЩИЕ РЕСУРСЫ</small><div class="tbg-wallet"><div><span>◈</span><small>СЕРЕБРО В КАЗНЕ</small><b>'+fmt(t.silver)+'</b></div><div><span>💎</span><small>АЛМАЗЫ В КАЗНЕ</small><b>'+fmt(t.diamonds)+'</b></div></div><p>Каждый участник может сделать до 5 взносов каждого типа за день. Введи сумму самостоятельно.</p></article><article class="tbg-card"><h4>Внести серебро</h4><label>Сумма · от 1 000 до 100 000</label><div class="tbg-input-row"><input id="tbgSilverAmount" type="number" inputmode="numeric" min="1000" max="100000" step="1" value="1000"><button data-guild="deposit" data-currency="silver">Внести</button></div><small>Использовано сегодня: '+(Number(counts.silver)||0)+'/5 · каждый взнос даёт +2% опыта гильдии на сегодня</small></article><article class="tbg-card"><h4>Внести алмазы</h4><label>Сумма · от 5 до 100</label><div class="tbg-input-row"><input id="tbgDiamondAmount" type="number" inputmode="numeric" min="5" max="100" step="1" value="5"><button data-guild="deposit" data-currency="diamonds">Внести</button></div><small>Использовано сегодня: '+(Number(counts.diamonds)||0)+'/5 · каждый взнос даёт +5% шанса дропа на сегодня</small></article><article class="tbg-card tbg-daily"><span>Бонус опыта сегодня <b>+'+(Number(d.exp_bonus_percent)||0)+'%</b></span><span>Бонус шанса дропа сегодня <b>+'+(Number(d.drop_bonus_percent)||0)+'%</b></span></article>';
}
function members(){
 return '<article class="tbg-card"><div class="tbg-card-title"><h4>Участники гильдии</h4><b>'+snapshot.members.length+'</b></div><p>Зелёная отметка означает, что игрок был активен в последние 90 секунд.</p>'+snapshot.members.map(m=>'<div class="tbg-member"><span class="tbg-online '+(m.online?'is-online':'')+'"></span><div><b>'+esc(m.nickname)+(m.role==='leader'?' <i>ГЛАВА</i>':'')+'</b><small>'+esc(m.class_id||'Класс не указан')+' · уровень '+Number(m.level||1)+'</small></div><span>'+pill(m.online?'В сети':'Не в сети',!!m.online)+'</span></div>').join('')+'</article>';
}
function chat(){
 const messages=snapshot.chat||[];
 return '<article class="tbg-card tbg-chat-card"><div class="tbg-card-title"><h4>Чат гильдии</h4><button data-guild="refresh">Обновить</button></div><div class="tbg-chat-log" id="tbgChatLog">'+messages.map(m=>'<div class="tbg-message"><div><b>'+esc(m.nickname)+'</b><time>'+dateTime(m.created_at)+'</time></div><p>'+esc(m.body)+'</p></div>').join('')+(messages.length?'':'<p class="tbg-muted">Начни общение с согильдейцами.</p>')+'</div><form data-guild-form="chat" class="tbg-chat-form"><input id="tbgChatInput" maxlength="500" autocomplete="off" placeholder="Написать сообщение…"><button type="submit">Отправить</button></form><small>Ограничение отправки — одно сообщение раз в 5 секунд.</small></article>';
}
function buffs(){
 const levels=snapshot.buffs||{},leader=!!snapshot.guild?.is_leader,t=snapshot.treasury||{};
 return '<article class="tbg-card"><small>РАЗВИТИЕ ГИЛЬДИИ</small><h4>Гильдейские умения</h4><p>Первые два уровня каждого бафа оплачиваются серебром казны. Третий, четвёртый и пятый — алмазами. Покупать улучшения может только глава.</p><div class="tbg-wallet-mini"><span>Серебро: <b>'+fmt(t.silver)+'</b></span><span>Алмазы: <b>'+fmt(t.diamonds)+'</b> 💎</span></div></article>'+order.map(key=>{const lv=Math.max(0,Number(levels[key])||0),cost=lv<2?'500 000 серебра':lv===2?'1 000 алмазов':lv===3?'2 000 алмазов':'4 000 алмазов';return '<article class="tbg-buff"><div class="tbg-buff-top"><div><b>'+esc(names[key])+'</b><small>'+esc(desc[key])+'</small></div><span>УР. '+lv+'/5</span></div><div class="tbg-levels">'+[1,2,3,4,5].map(n=>'<i class="'+(n<=lv?'is-on':'')+'"></i>').join('')+'</div>'+(leader?'<button data-guild="buy-buff" data-buff="'+key+'" '+(lv>=5?'disabled':'')+'>'+(lv>=5?'Максимальный уровень':'Улучшить · '+cost)+'</button>':'<small class="tbg-muted">Покупать может только глава гильдии</small>')+'</article>'}).join('');
}
function boss(){
 const b=snapshot.boss||{},hp=Math.max(0,Number(b.hp)||0),max=Math.max(1,Number(b.max_hp)||50000000),pct=Math.max(0,Math.min(100,hp/max*100)),rows=snapshot.leaderboard||[],last=snapshot.my_last_attempt?new Date(snapshot.my_last_attempt).getTime():0,left=Math.max(0,3600000-(Date.now()-last)),mins=Math.ceil(left/60000),killed=!!b.killed;
 return '<article class="tbg-card tbg-boss"><small>НЕДЕЛЬНЫЙ РЕЙД ГИЛЬДИИ</small><h4>☠ '+esc(b.boss_name||'Древний Пожиратель')+'</h4><p>'+(killed?'Босс повержен! Гильдия победила на этой неделе.':'У каждого участника одна попытка в час. За попытку можно сыграть ровно три карты без затрат энергии. Босс не атакует.')+'</p><div class="tbg-hp"><i style="width:'+pct+'%"></i></div><div class="tbg-hp-label"><b>'+fmt(hp)+' HP</b><span>'+pct.toFixed(2)+'%</span></div><p>Нанесённый урон сохраняется в общем рейтинге этой гильдии. Босс полностью восстанавливается каждый понедельник.</p>'+(killed?'<div class="tbg-success">Босс повержен. Награды за победу начислены участникам гильдии.</div>':'<button class="tbg-primary" data-guild="start-raid" '+(left>0?'disabled':'')+'>'+(left>0?'Следующая попытка через ~'+mins+' мин.':'⚔ Начать рейд · 3 карты')+'</button>')+'</article><article class="tbg-card"><div class="tbg-card-title"><h4>Топ 5 урона гильдии</h4><span>Эта неделя</span></div>'+(rows.length?rows.slice(0,20).map((m,i)=>'<div class="tbg-rank"><b>#'+(i+1)+'</b><span>'+esc(m.nickname)+'</span><strong>'+fmt(m.damage)+'</strong></div>').join(''):'<p class="tbg-muted">Рейтинг появится после первых рейдов.</p>')+'</article><article class="tbg-card"><h4>Награды за неделю</h4>'+(killed?'<p>Глава: 100 💎 · последний удар: 500 💎 · топ-5 урона: по 50 💎 · остальные участники: по 10 💎.</p>':'<p>Если босс останется жив к воскресенью 23:59 (время Берлина): 1-е место — 50 💎, 2-е — 40 💎, 3-е — 30 💎, 4-е — 20 💎, 5-е — 10 💎.</p>')+'</article>';
}
function myGuild(){
 const g=snapshot.guild;
 const content=view==='treasury'?treasury():view==='members'?members():view==='chat'?chat():view==='buffs'?buffs():view==='boss'?boss():overview();
 return '<section class="tbg-shell">'+header(g)+nav()+'<main>'+content+'</main></section>';
}
function directory(){
 const gs=snapshot?.guilds||[];
 return '<section class="tbg-shell"><div class="tbg-head"><div><small>СООБЩЕСТВО · ГИЛЬДИИ</small><h3>Гильдии Башни</h3><p>Создай свою гильдию бесплатно или вступи в уже существующую.</p></div></div><article class="tbg-card"><h4>Создать гильдию</h4><form data-guild-form="create"><label>Название · 3–24 символа</label><input id="tbgCreateName" maxlength="24" minlength="3" placeholder="Например, Стражи Башни" required><label>Тег · 2–5 символов</label><input id="tbgCreateTag" maxlength="5" minlength="2" placeholder="TWR" required><button type="submit" class="tbg-primary">Создать бесплатно</button></form><small>На время тестирования создание не требует серебра или алмазов.</small></article><article class="tbg-card"><div class="tbg-card-title"><h4>Найти гильдию</h4><button data-guild="search">Найти</button></div><input id="tbgGuildSearch" maxlength="24" placeholder="Название или тег" value="'+esc(searchText)+'">'+(gs.length?gs.map(g=>'<div class="tbg-guild-list-row"><div><b>'+esc(g.name)+' ['+esc(g.tag)+']</b><small>Участников: '+Number(g.members||0)+'</small></div><button data-guild="join" data-id="'+esc(g.id)+'">Вступить</button></div>').join(''):'<p class="tbg-muted">Пока нет открытых гильдий. Создай первую.</p>')+'</article></section>';
}
function render(){
 if(!cloud()?.signedIn){return '<section class="tbg-shell"><article class="tbg-card"><h3>Нужен игровой аккаунт</h3><p>Для создания гильдии, казны, чата и рейдов войди в облачный аккаунт.</p><button class="tbg-primary" data-guild="login">Войти в аккаунт</button></article></section>';}
 if(!snapshot){load().then(()=>renderSocial()).catch(e=>{lastError=errorText(e);renderSocial()});return '<section class="tbg-shell"><article class="tbg-card"><h3>Загружаем гильдии…</h3></article></section>';}
 if(lastError)return '<section class="tbg-shell"><article class="tbg-card"><h3>Не удалось загрузить гильдии</h3><p>'+esc(lastError)+'</p><button data-guild="refresh">Повторить</button></article></section>';
 if(snapshot.member){if(!inside)return '<section class="tbg-shell"><article class="tbg-card tbg-hero"><small>ТЫ УЖЕ В ГИЛЬДИИ</small><h3>'+esc(snapshot.guild.name)+' ['+esc(snapshot.guild.tag)+']</h3><p>Участников: '+snapshot.members.length+' · Казна: '+fmt(snapshot.treasury?.silver)+' серебра и '+fmt(snapshot.treasury?.diamonds)+' 💎</p><button class="tbg-primary" data-guild="enter">Открыть «Моя Гильдия»</button></article></section>';return myGuild();}
 return directory();
}
function renderSocial(){const panel=$('#socPanel');if(panel&&window.TowerboundSocial?.refresh){window.TowerboundSocial.refresh();return;}if(panel){const main=panel.querySelector('main');if(main)main.innerHTML=render();}}
async function refresh(){lastError='';await load();return render();}
async function createGuild(){
 const name=$('#tbgCreateName')?.value?.trim()||'',tag=$('#tbgCreateTag')?.value?.trim()||'';
 await rpc('tb_guild_create',{p_name:name,p_tag:tag});inside=true;view='overview';searchText='';await load();notify('Гильдия создана бесплатно');renderSocial();
}
async function joinGuild(id){await rpc('tb_guild_join',{p_guild:id});inside=true;view='overview';await load();notify('Ты вступил в гильдию');renderSocial();}
async function deposit(currency){
 const id=currency==='silver'?'#tbgSilverAmount':'#tbgDiamondAmount',amount=Math.floor(Number($(id)?.value)||0);
 await rpc('tb_guild_deposit',{p_currency:currency,p_amount:amount});
 notify('Взнос принят. Обновляем облачный баланс…');
 if(cloud()?.refreshFromServer){await cloud().refreshFromServer();return;}
 await load();renderSocial();
}
async function buyBuff(key){await rpc('tb_guild_buy_buff',{p_buff_key:key});await load();notify('Гильдейский баф улучшен');renderSocial();}
async function sendMessage(){
 const field=$('#tbgChatInput'),body=String(field?.value||'').trim();if(!body)return;
 await rpc('tb_guild_send_message',{p_body:body});field.value='';await load();renderSocial();
}
async function startRaid(){
 const info=await rpc('tb_guild_begin_raid');
 if(!window.TowerboundReworkUI?.startGuildRaid)throw new Error('Карточная арена ещё загружается. Попробуй через несколько секунд.');
 window.TowerboundSocial?.close?.();
 window.TowerboundReworkUI.startGuildRaid(info,async result=>{
  try{
   const outcome=await rpc('tb_guild_finish_raid',{p_attempt_id:info.attempt_id,p_damage:result.damage,p_card_ids:result.cardIds});
   if(outcome?.killed){notify('Босс гильдии повержен! Награды начислены.');if(cloud()?.refreshFromServer){await cloud().refreshFromServer();return;}}
   else notify('Ваша попытка засчитана. Вы нанесли '+fmt(outcome?.damage||result.damage)+' урона. Следующая попытка через 60 минут.');
   inside=true;view='boss';await load();window.TowerboundSocial?.openTab?.('guild');
  }catch(e){notify(errorText(e));inside=true;view='boss';await load().catch(()=>{});window.TowerboundSocial?.openTab?.('guild');}
 });
}
async function action(name,b){
 if(name==='login'){cloud()?.requireLogin?.();return;}
 if(name==='enter'){inside=true;view='overview';renderSocial();return;}
 if(name==='back'){inside=false;view='directory';renderSocial();return;}
 if(name==='tab'){view=b.dataset.tab;renderSocial();return;}
 if(name==='refresh'){await refresh();return;}
 if(name==='search'){searchText=$('#tbgGuildSearch')?.value?.trim()||'';snapshot={member:false,guilds:await rpc('tb_guild_search',{p_query:searchText})};renderSocial();return;}
 if(name==='join'){await joinGuild(b.dataset.id);return;}
 if(name==='deposit'){await deposit(b.dataset.currency);return;}
 if(name==='buy-buff'){await buyBuff(b.dataset.buff);return;}
 if(name==='send'){await sendMessage();return;}
 if(name==='start-raid'){await startRaid();return;}
 if(name==='leave'){if(!confirm('Покинуть гильдию?'))return;await rpc('tb_guild_leave');inside=false;view='directory';await load();notify('Ты покинул гильдию');renderSocial();return;}
 if(name==='disband'){if(!confirm('Распустить гильдию? Все данные, казна и рейтинг этой гильдии будут удалены.'))return;await rpc('tb_guild_disband');inside=false;view='directory';await load();notify('Гильдия распущена');renderSocial();return;}
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('#socPanel [data-guild]');if(!b)return;e.preventDefault();e.stopPropagation();if(b.dataset.guild==='tab')b.dataset.tab=b.dataset.tab||'overview';
 if(busy)return;busy=true;try{await action(b.dataset.guild,b);}catch(err){notify(errorText(err));}finally{busy=false;}
},true);
document.addEventListener('submit',async e=>{
 const f=e.target.closest('#socPanel [data-guild-form]');if(!f)return;e.preventDefault();if(busy)return;busy=true;
 try{if(f.dataset.guildForm==='create')await createGuild();if(f.dataset.guildForm==='chat')await sendMessage();}catch(err){notify(errorText(err));}finally{busy=false;}
},true);
function startPolling(){clearInterval(pollTimer);pollTimer=setInterval(async()=>{if(!$('#socPanel')||!snapshot?.member)return;if(view!=='chat'&&view!=='members'&&view!=='boss')return;try{await load();const main=$('#socPanel main');if(main&&!main.querySelector('input:focus,textarea:focus')){const content=render();if(main)main.innerHTML=content;}}catch(e){console.warn('[guild] refresh failed',e)}},12000);}
window.addEventListener('towerbound-auth-change',()=>{snapshot=null;inside=false;load().then(()=>renderSocial()).catch(()=>{});});
window.TowerboundGuild={render,refresh,load,get snapshot(){return snapshot;}};
const old=window.TowerboundEndgame?.renderCommunity;
if(window.TowerboundEndgame&&typeof old==='function')window.TowerboundEndgame.renderCommunity=(tab='home')=>tab==='guild'?render():old(tab);
if(window.TowerboundReworkReady&&typeof window.TowerboundReworkReady.then==='function')window.TowerboundReworkReady.then(e=>{game=e;setRuntimeBuffs();}).catch(()=>{});
startPolling();
})();