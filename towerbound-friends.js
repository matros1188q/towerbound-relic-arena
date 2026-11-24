(()=>{'use strict';
if(window.__TB_FRIENDS_V1__)return;window.__TB_FRIENDS_V1__=true;
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={friends:[],requests:{incoming:[],outgoing:[]},gifts:[],results:[],query:'',loading:false,error:'',busy:false};
const cloud=()=>window.TowerboundCloud,client=()=>cloud()?.client,toast=m=>window.TowerboundToast?window.TowerboundToast(m):alert(m);
function engine(){return window.TowerboundRework||null}
function activeCharacter(){const s=engine()?.state;return s?.characters?.find(c=>c.id===s.activeCharacterId)||s?.characters?.[0]||null}
function bagItems(){return (activeCharacter()?.bag||[]).filter(x=>x&&x.id&&x.type!=='auto_salvage'&&x.soulbound!==true&&x.tradeable!==false)}
async function rpc(name,args={}){const c=client();if(!c)throw Error('Облачный сервер ещё не подключён');if(!cloud()?.signedIn)throw Error('Войди в игровой аккаунт, чтобы пользоваться друзьями');const {data,error}=await c.rpc(name,args);if(error)throw error;return data}
function message(e){const m=String(e?.message||e||'Ошибка');if(m.includes('AUTH_REQUIRED'))return 'Сначала войди в аккаунт TowerBound.';if(m.includes('SEARCH_TOO_SHORT'))return 'Введи минимум 2 символа.';if(m.includes('PLAYER_NOT_FOUND'))return 'Игрок не найден. Он должен опубликовать профиль.';if(m.includes('NOT_FRIENDS'))return 'Подарки можно отправлять только друзьям.';if(m.includes('ITEM_NOT_FOUND_IN_BAG'))return 'Предмет уже отсутствует в сумке. Обнови список.';if(m.includes('NOT_ENOUGH_ITEMS'))return 'В сумке недостаточно предметов.';if(m.includes('ITEM_NOT_TRADEABLE'))return 'Этот предмет нельзя передать.';if(m.includes('RECEIVER_SAVE_NOT_FOUND'))return 'У друга пока нет облачного сохранения с персонажем.';if(m.includes('SAVE_CONFLICT'))return 'Сначала разреши конфликт облачного сохранения.';return m}
async function loadAll(){if(!cloud()?.signedIn){state.error='Для списка друзей войди в аккаунт TowerBound.';render();return}state.loading=true;state.error='';render();try{const [f,r,g]=await Promise.all([rpc('tb_friend_list'),rpc('tb_friend_requests_list'),rpc('tb_friend_gift_inbox')]);state.friends=Array.isArray(f)?f:[];state.requests=r||{incoming:[],outgoing:[]};state.gifts=Array.isArray(g)?g:[]}catch(e){state.error=message(e)}finally{state.loading=false;render()}}
async function search(){const q=String($('#tbFriendSearch')?.value||'').trim();state.query=q;if(q.length<2){state.results=[];state.error='Введи минимум 2 символа для поиска.';render();return}state.busy=true;state.error='';render();try{const rows=await rpc('tb_friend_search',{p_query:q});state.results=Array.isArray(rows)?rows:[]}catch(e){state.error=message(e)}finally{state.busy=false;render()}}
function profile(p,actions){return '<div class="tbf-profile"><div class="tbf-avatar">'+esc(String(p.nickname||'И').slice(0,1).toUpperCase())+'</div><div class="tbf-person"><b>'+esc(p.nickname||'Игрок')+'</b><small>'+esc(p.class||'—')+' · '+Number(p.battle_power||0).toLocaleString('ru-RU')+' BP · этаж '+Number(p.max_stage||0)+'</small></div>'+actions+'</div>'}
function render(){const panel=$('#socPanel'),main=panel?.querySelector('main');if(!main)return;panel.querySelectorAll('.soc-primary-nav [data-soc]').forEach(b=>b.classList.toggle('is-active',b.dataset.soc==='open-friends'));if(!cloud()?.signedIn){main.innerHTML='<section class="tbf-card"><h3>Друзья Башни</h3><p>Войди в игровой аккаунт, чтобы искать игроков, принимать заявки и отправлять подарки.</p><button class="tbf-primary" data-friend-action="login">ВОЙТИ В АККАУНТ</button></section>';return}
const items=bagItems(),giftSelect=f=>'<div class="tbf-gift-row"><select data-friend-item="'+esc(f.user_id)+'">'+(items.length?items.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name||x.type)+' · '+Math.max(1,Number(x.quantity)||1)+' шт.</option>').join(''):'<option value="">Сумка пуста</option>')+'</select><input type="number" min="1" max="99" value="1" aria-label="Количество" data-friend-qty="'+esc(f.user_id)+'"><button class="tbf-small" data-friend-action="gift" data-id="'+esc(f.user_id)+'" '+(!items.length?'disabled':'')+'>ПОДАРИТЬ</button></div>';
const friendRows=state.friends.length?state.friends.map(p=>'<article class="tbf-row">'+profile(p,'<button class="tbf-quiet" data-friend-action="remove" data-id="'+esc(p.user_id)+'">УДАЛИТЬ</button>')+giftSelect(p)+'</article>').join(''):'<p class="tbf-muted">Пока нет друзей. Найди игрока по игровому нику.</p>';
const incoming=(state.requests.incoming||[]).map(p=>'<article class="tbf-row">'+profile(p,'<span class="tbf-actions"><button class="tbf-small" data-friend-action="accept" data-id="'+esc(p.id)+'">ПРИНЯТЬ</button><button class="tbf-quiet" data-friend-action="decline" data-id="'+esc(p.id)+'">ОТКЛОНИТЬ</button></span>')+'</article>').join('');
const outgoing=(state.requests.outgoing||[]).map(p=>'<article class="tbf-row">'+profile(p,'<button class="tbf-quiet" data-friend-action="cancel" data-id="'+esc(p.id)+'">ОТОЗВАТЬ</button>')+'</article>').join('');
const results=state.results.length?state.results.map(p=>'<article class="tbf-row">'+profile(p,'<button class="tbf-small" data-friend-action="add" data-id="'+esc(p.user_id)+'">ДОБАВИТЬ</button>')+'</article>').join(''):'<p class="tbf-muted">Найди игрока по нику. Здесь отображаются реальные опубликованные аккаунты.</p>';
const gifts=state.gifts.length?state.gifts.slice(0,20).map(g=>'<div class="tbf-gift-history"><span>🎁 <b>'+esc(g.sender_name)+'</b> передал(а) '+esc(g.item_name)+'</span><strong>×'+Number(g.quantity||1)+'</strong><small>'+new Date(g.created_at).toLocaleString('ru-RU')+'</small></div>').join(''):'<p class="tbf-muted">Подарков пока нет.</p>';
main.innerHTML='<div class="tbf-wrap">'+(state.error?'<div class="tbf-error">'+esc(state.error)+'</div>':'')+
'<section class="tbf-card"><div class="tbf-heading"><div><small>ОНЛАЙН-СООБЩЕСТВО</small><h3>Поиск игроков</h3></div><button class="tbf-refresh" data-friend-action="refresh" '+(state.loading?'disabled':'')+'>↻</button></div><div class="tbf-search"><input id="tbFriendSearch" maxlength="32" placeholder="Игровой ник..." value="'+esc(state.query)+'"><button class="tbf-primary" data-friend-action="search" '+(state.busy?'disabled':'')+'>'+(state.busy?'ПОИСК…':'НАЙТИ')+'</button></div><div class="tbf-list">'+results+'</div></section>'+
'<section class="tbf-card"><div class="tbf-heading"><div><small>ТВОЁ ОКРУЖЕНИЕ</small><h3>Друзья · '+state.friends.length+'</h3></div></div><div class="tbf-list">'+friendRows+'</div></section>'+
'<section class="tbf-card"><div class="tbf-heading"><div><small>СОЦИАЛЬНЫЕ СВЯЗИ</small><h3>Заявки</h3></div></div><h4>Входящие · '+(state.requests.incoming||[]).length+'</h4><div class="tbf-list">'+(incoming||'<p class="tbf-muted">Новых заявок нет.</p>')+'</div><h4>Исходящие · '+(state.requests.outgoing||[]).length+'</h4><div class="tbf-list">'+(outgoing||'<p class="tbf-muted">Ты никому не отправлял заявку.</p>')+'</div></section>'+
'<section class="tbf-card"><div class="tbf-heading"><div><small>СЕРВЕРНАЯ ДОСТАВКА</small><h3>История подарков</h3></div></div><div class="tbf-gift-list">'+gifts+'</div><p class="tbf-footnote">Подарок атомарно списывается из сумки отправителя и добавляется в сумку активного персонажа получателя. Передача выполняется сервером.</p></section>'+
'<section class="tbf-card"><div class="tbf-heading"><div><small>СРАЖЕНИЯ</small><h3>Дуэль</h3></div></div><p class="tbf-muted">Создай ссылку на вызов и отправь её другу.</p><button class="tbf-primary" data-soc="challenge">СОЗДАТЬ ССЫЛКУ-ВЫЗОВ</button></section>'+(state.loading?'<div class="tbf-loading">СИНХРОНИЗАЦИЯ С СЕРВЕРОМ…</div>':'')+'</div>'}
async function action(kind,id){if(state.busy)return;state.busy=true;try{
if(kind==='login'){cloud()?.requireLogin?.();return}if(kind==='refresh'){await loadAll();return}if(kind==='search'){await search();return}
if(kind==='add'){const r=await rpc('tb_friend_request',{p_target_user:id});toast(r?.status==='accepted'?'Вы стали друзьями.':'Заявка отправлена.');await loadAll();return}
if(kind==='accept'||kind==='decline'){await rpc('tb_friend_respond',{p_request_id:id,p_accept:kind==='accept'});toast(kind==='accept'?'Теперь вы друзья.':'Заявка отклонена.');await loadAll();return}
if(kind==='cancel'){await rpc('tb_friend_cancel',{p_request_id:id});toast('Заявка отозвана.');await loadAll();return}
if(kind==='remove'){if(!confirm('Удалить игрока из списка друзей?'))return;await rpc('tb_friend_remove',{p_friend_id:id});toast('Игрок удалён из друзей.');await loadAll();return}
if(kind==='gift'){const select=$('[data-friend-item="'+CSS.escape(id)+'"]'),qty=$('[data-friend-qty="'+CSS.escape(id)+'"]'),itemId=select?.value,quantity=Math.max(1,Math.min(99,Number(qty?.value)||1));if(!itemId)throw Error('Выбери предмет для подарка.');window.saveTowerboundRework?.();await cloud().syncNow();const result=await rpc('tb_friend_send_gift',{p_friend_id:id,p_item_id:itemId,p_quantity:quantity});await cloud().reloadAuthoritative();toast('Подарок доставлен: '+(result?.item_name||'предмет')+' ×'+quantity);await loadAll();return}
}catch(e){toast(message(e));state.error=message(e);render()}finally{state.busy=false}}
document.addEventListener('click',e=>{const b=e.target.closest('#socPanel [data-friend-action]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();action(b.dataset.friendAction,b.dataset.id)},true);
document.addEventListener('click',e=>{const b=e.target.closest('#socPanel [data-soc="open-friends"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();render();loadAll()},true);
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target?.id==='tbFriendSearch'){e.preventDefault();search()}});
const social=window.TowerboundSocial;if(social&&typeof social.openTab==='function'){const original=social.openTab.bind(social);social.openTab=next=>{if(next==='duels'||next==='friends'){render();loadAll();return}return original(next)}}
window.TowerboundFriends={refresh:loadAll,open:()=>{render();loadAll()}};
window.addEventListener('towerbound-auth-change',()=>{if($('#socPanel'))loadAll()});
window.addEventListener('towerbound-cloud-restore',()=>{if($('#socPanel'))render()});
const style=document.createElement('style');style.id='tb-friends-styles';style.textContent='
#socPanel .tbf-wrap{display:grid;gap:12px;min-width:0}
#socPanel .tbf-card{min-width:0;padding:15px;border:1px solid #c5a76b44;border-radius:15px;background:linear-gradient(145deg,#ffffff0b,#00000018);box-shadow:inset 0 1px #ffffff0b}
#socPanel .tbf-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
#socPanel .tbf-heading small{color:#d7b875;font-size:9px;letter-spacing:.15em}
#socPanel .tbf-heading h3{margin:3px 0 0;font:700 18px Georgia,serif;color:#f5e7cb}
#socPanel .tbf-card h4{margin:14px 0 7px;color:#e8cf9f;font-size:11px;text-transform:uppercase;letter-spacing:.08em}
#socPanel .tbf-card p{color:#c7c0b3;font-size:12px;line-height:1.5}
#socPanel .tbf-search{display:flex;gap:8px;min-width:0}
#socPanel .tbf-search input,#socPanel .tbf-gift-row select,#socPanel .tbf-gift-row input{min-width:0;box-sizing:border-box;border:1px solid #b9976066;border-radius:9px;background:#0d111de8;color:#f6ebd5;padding:11px;font:13px system-ui}
#socPanel .tbf-search input{flex:1;width:100%}
#socPanel .tbf-primary,#socPanel .tbf-small,#socPanel .tbf-quiet,#socPanel .tbf-refresh{border:1px solid #b99760;border-radius:9px;background:linear-gradient(180deg,#665039,#352a2b);color:#ffe7b8;font-weight:800;font-size:10px;letter-spacing:.04em;padding:10px 12px;cursor:pointer}
#socPanel .tbf-small{padding:8px 10px;font-size:9px;white-space:nowrap}
#socPanel .tbf-quiet,#socPanel .tbf-refresh{background:#ffffff0b;border-color:#ffffff2b;color:#e8d7b8}
#socPanel .tbf-refresh{width:34px;height:34px;padding:0;font-size:20px}
#socPanel .tbf-list{display:grid;gap:7px}
#socPanel .tbf-row{padding:9px;border:1px solid #ffffff14;border-radius:11px;background:#080d1880}
#socPanel .tbf-profile{display:flex;align-items:center;gap:9px;min-width:0}
#socPanel .tbf-avatar{width:34px;height:34px;flex:0 0 34px;display:grid;place-items:center;border:1px solid #c5a76b77;border-radius:50%;background:linear-gradient(145deg,#64513c,#29243a);color:#ffe7b8;font:700 15px Georgia,serif}
#socPanel .tbf-person{display:grid;gap:3px;min-width:0;flex:1}
#socPanel .tbf-person b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f6ebd5;font-size:12px}
#socPanel .tbf-person small{color:#b8b2a8;font-size:9px}
#socPanel .tbf-actions{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}
#socPanel .tbf-gift-row{display:flex;gap:6px;margin-top:9px;min-width:0}
#socPanel .tbf-gift-row select{flex:1}
#socPanel .tbf-gift-row input{width:54px;padding:8px}
#socPanel .tbf-gift-row button{flex:0 0 auto}
#socPanel .tbf-gift-history{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;padding:9px 0;border-bottom:1px solid #ffffff14;color:#e8dcc6;font-size:11px}
#socPanel .tbf-gift-history small{grid-column:1/-1;color:#a9a39a;font-size:9px}
#socPanel .tbf-gift-history strong{color:#e7c57d}
#socPanel .tbf-muted,#socPanel .tbf-footnote{color:#aaa49b!important;font-size:11px!important}
#socPanel .tbf-error{padding:10px 12px;border:1px solid #c66e6e66;border-radius:10px;background:#5c252533;color:#ffc1b8;font-size:11px}
#socPanel .tbf-loading{text-align:center;color:#e3c783;font-size:9px;letter-spacing:.12em;padding:8px}
#socPanel .tbf-gift-row button:disabled,#socPanel button:disabled{opacity:.45;cursor:not-allowed}
@media(max-width:520px){#socPanel .tbf-card{padding:11px}#socPanel .tbf-gift-row{flex-wrap:wrap}#socPanel .tbf-gift-row select{flex:1 1 100%}#socPanel .tbf-gift-row input{flex:0 0 48px}#socPanel .tbf-profile{align-items:flex-start}#socPanel .tbf-actions{max-width:130px}}
';document.head.appendChild(style);
})();