/* Towerbound Cloud Accounts — phase 1.
 * Uses only the Supabase publishable/anon key in the browser. RLS + RPC enforce ownership/versioning.
 */
(()=>{'use strict';
if(window.__TOWERBOUND_CLOUD_V1__)return;window.__TOWERBOUND_CLOUD_V1__=true;
const cfg=window.TOWERBOUND_SUPABASE_CONFIG||{};
const SAVE_KEYS=new Set(['tb-rpg-v2','tb-rpg-v1','towerbound-save-v1','towerbound-profiles-v1','towerbound-active-profile-v1']);
const isSaveKey=k=>SAVE_KEYS.has(String(k))||String(k).startsWith('towerbound-profile-save-');
const $=s=>document.querySelector(s);
let client=null,session=null,revision=0,syncing=false,dirty=false,timer=0,conflict=false,restoring=false,handledSessionKey='',authInitialized=false;
const status={text:'Локальное сохранение',kind:'local'};
const style=document.createElement('style');style.id='tb-cloud-styles';style.textContent=`
#tbCloudButton{position:fixed;z-index:9998;right:12px;top:calc(env(safe-area-inset-top) + 10px);max-width:46vw;padding:8px 11px;border:1px solid #b99760;border-radius:8px;background:#211a20ed;color:#f2d9a3;font:700 10px/1.2 system-ui;letter-spacing:.04em;box-shadow:0 4px 18px #0008;backdrop-filter:blur(12px)}
#tbCloudButton[data-state="online"]{border-color:#73c9a1;color:#a9f0ca}
#tbCloudButton[data-state="error"]{border-color:#e58a83;color:#ffc0b8}
#tbCloudOverlay{position:fixed;inset:0;z-index:10000;display:none;place-items:center;padding:18px;background:#05040be8;backdrop-filter:blur(10px)}
#tbCloudOverlay.open{display:grid}
#tbCloudDialog{width:min(440px,100%);max-height:88dvh;overflow:auto;padding:22px;border:1px solid #b99760;border-radius:14px;background:linear-gradient(145deg,#30272a,#15121a);box-shadow:0 25px 90px #000c;color:#f1e4ca;font:14px/1.5 system-ui}
#tbCloudDialog h2{margin:0 0 8px;color:#f4d79c;font:700 19px Georgia,serif}
#tbCloudDialog p{color:#c8bda9;margin:8px 0 14px}
#tbCloudDialog label{display:block;margin:10px 0 4px;color:#e3cfaa;font-size:12px}
#tbCloudDialog input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #806d54;border-radius:8px;background:#17141c;color:#fff;font:14px system-ui}
#tbCloudDialog button{width:100%;margin-top:9px;padding:12px;border:1px solid #b99760;border-radius:8px;background:linear-gradient(#5a4430,#302326);color:#ffe5b3;font-weight:800}
#tbCloudDialog button.secondary{background:#211d27;border-color:#6d6254;color:#d6c7ae}
#tbCloudDialog button.danger{border-color:#9d5555;background:#422327}
#tbCloudDialog .tb-cloud-row{display:flex;gap:8px}
#tbCloudDialog .tb-cloud-row button{flex:1}
#tbCloudMessage{min-height:22px;color:#e9c985;font-size:12px;margin-top:10px}
#tbCloudAccount{color:#a8d9bd;font-size:12px;overflow-wrap:anywhere}
#tbCloudOverlay.login-required #tbCloudClose{display:none}#tbCloudDialog .tb-remember-label{display:flex;align-items:center;gap:9px;font-size:12px}#tbCloudDialog .tb-remember-label input{width:18px;height:18px;accent-color:#d7b875}#tbCloudOverlay.login-required{z-index:2147483000}#tbCloudOverlay.login-required #tbCloudDialog{max-height:calc(100dvh - 28px)}
@media(max-width:600px){#tbCloudButton{top:calc(env(safe-area-inset-top) + 7px);right:8px;font-size:9px;padding:7px 8px}}
`;document.head.appendChild(style);
const button=document.createElement('button');button.id='tbCloudButton';button.type='button';button.textContent='АККАУНТ · ЛОКАЛЬНО';button.dataset.state='local';document.body.appendChild(button);
const overlay=document.createElement('div');overlay.id='tbCloudOverlay';overlay.innerHTML=`<section id="tbCloudDialog" role="dialog" aria-modal="true" aria-labelledby="tbCloudTitle">
<h2 id="tbCloudTitle">Вход в игру</h2><p id="tbCloudIntro">Войди или создай игровой аккаунт Towerbound.</p>
<div id="tbCloudAccount"></div>
<div id="tbCloudAuth">
<label for="loginInput">Логин</label><input id="loginInput" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Твой игровой логин">
<label for="passInput">Пароль</label><input id="passInput" type="password" autocomplete="current-password" placeholder="Минимум 6 символов">
<label class="tb-remember-label"><input id="rememberMe" type="checkbox"> Запомнить меня</label>
<div class="tb-cloud-row"><button id="tbCloudSignIn" type="button">ВОЙТИ</button><button id="tbCloudSignUp" type="button">ЗАРЕГИСТРИРОВАТЬСЯ</button></div>
<button id="tbCloudGoogle" type="button" class="secondary" hidden>Продолжить с Google</button>
</div>
<div id="tbCloudChoices" hidden>
<p>В аккаунте уже есть сохранение. Выбери, какую версию оставить. Другая версия будет заменена.</p>
<button id="tbCloudUseRemote" type="button">Загрузить облачное сохранение</button>
<button id="tbCloudUseLocal" type="button" class="secondary">Загрузить сохранение с этого устройства в облако</button>
</div>
<div id="tbCloudSignedIn" hidden>
<button id="tbCloudSyncNow" type="button">Синхронизировать сейчас</button>
<button id="tbCloudSignOut" type="button" class="secondary">Выйти из аккаунта</button>
</div>
<div id="tbCloudMessage" role="status" aria-live="polite"></div>
<button id="tbCloudClose" type="button" class="secondary">Закрыть</button>
</section>`;document.body.appendChild(overlay);overlay.classList.add('open','login-required');
const say=m=>{$('#tbCloudMessage').textContent=m||'';};
const setStatus=(textValue,kind)=>{status.text=textValue;status.kind=kind;button.textContent=textValue;button.dataset.state=kind;document.querySelectorAll('.tb-account-button').forEach(node=>{const login=session?.user?.email?String(session.user.email).split('@')[0]:'',label=login||((kind==='online')?'В СЕТИ':'АККАУНТ');node.textContent=label.toUpperCase();});};
const open=()=>{overlay.classList.add('open');overlay.style.display='grid';},close=()=>{if(!overlay.classList.contains('login-required')){overlay.classList.remove('open');overlay.style.display='none';}};
const rememberKey='tb-remember-me',remembered=()=>{try{return localStorage.getItem(rememberKey)==='true';}catch(e){return false;}};
const setRemember=value=>{try{if(value)localStorage.setItem(rememberKey,'true');else localStorage.removeItem(rememberKey);}catch(e){}};
const showLoginGate=()=>{overlay.classList.add('login-required','open');overlay.style.display='grid';overlay.style.visibility='visible';$('#tbCloudTitle').textContent='Вход в игру';$('#tbCloudIntro').textContent='Войди в игровой аккаунт, чтобы открыть выбор персонажа.';$('#tbCloudAuth').hidden=false;$('#tbCloudChoices').hidden=true;$('#tbCloudSignedIn').hidden=true;$('#tbCloudClose').hidden=true;$('#rememberMe').checked=remembered();};
const hideLoginGate=()=>{overlay.classList.remove('login-required','open');overlay.style.display='none';$('#tbCloudClose').hidden=false;};
button.addEventListener('click',open);$('#tbCloudClose').addEventListener('click',close);
overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
async function signIn(login,password,remember=true){if(!client)throw new Error('Supabase ещё подключается');const clean=String(login||'').trim().toLowerCase();if(!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(clean))throw new Error('Логин: 3–32 символа, латиница, цифры, точка, дефис или подчёркивание');if(String(password||'').length<6)throw new Error('Пароль должен содержать минимум 6 символов');setRemember(remember);const {error}=await client.auth.signInWithPassword({email:clean+'@towerbound.game',password:String(password)});if(error)throw error;return true;}
async function signUp(login,password,remember=true){if(!client)throw new Error('Supabase ещё подключается');const clean=String(login||'').trim().toLowerCase();if(!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(clean))throw new Error('Логин: 3–32 символа, латиница, цифры, точка, дефис или подчёркивание');if(String(password||'').length<6)throw new Error('Пароль должен содержать минимум 6 символов');setRemember(remember);const {data,error}=await client.auth.signUp({email:clean+'@towerbound.game',password:String(password),options:{emailRedirectTo:window.location.origin+window.location.pathname}});if(error)throw error;if(!data.session)say('Регистрация создана. Если включено подтверждение email, настрой его в Supabase Auth и затем войди.');return true;}
async function signOut(){if(!client)throw new Error('Supabase недоступен');setRemember(false);const {error}=await client.auth.signOut();if(error)throw error;conflict=false;showLoginGate();return true;}
function localSnapshot(){
 const keys={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(isSaveKey(k)){const v=localStorage.getItem(k);if(v!==null)keys[k]=v;}}}catch(e){console.warn('[Towerbound cloud] local snapshot failed',e);}
 return{schemaVersion:1,game:'towerbound-relic-arena',savedAt:new Date().toISOString(),keys};
}
function hasLocal(snapshot){return !!(snapshot&&snapshot.keys&&Object.keys(snapshot.keys).length);}
function snapshotHasCharacters(snapshot){for(const [key,value] of Object.entries(snapshot?.keys||{})){if(!isSaveKey(key)||typeof value!=='string')continue;try{const parsed=JSON.parse(value);if(Array.isArray(parsed?.characters)&&parsed.characters.length>0)return true;}catch(e){}}return false;}
function sameSave(a,b){if(!a?.keys||!b?.keys)return false;const ak=Object.keys(a.keys).sort(),bk=Object.keys(b.keys).sort();return ak.length===bk.length&&ak.every((k,i)=>k===bk[i]&&a.keys[k]===b.keys[k]);}
function restoreLocal(snapshot){
 if(!snapshot||!snapshot.keys||typeof snapshot.keys!=='object')throw new Error('Облачное сохранение повреждено');
 restoring=true;
 const remoteKeys=new Set(Object.keys(snapshot.keys).filter(isSaveKey));
 for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(isSaveKey(k)&&!remoteKeys.has(k))localStorage.removeItem(k);}
 for(const [k,v] of Object.entries(snapshot.keys)){if(isSaveKey(k)&&typeof v==='string')localStorage.setItem(k,v);}
 try{localStorage.setItem('tb-cloud-user-id',session.user.id);localStorage.setItem('tb-cloud-revision',String(revision));}catch(e){}
 location.reload();
}
async function readRemote(){
 const {data,error}=await client.from('player_saves').select('save_data,revision,updated_at').eq('user_id',session.user.id).maybeSingle();
 if(error)throw error;return data;
}
async function writeRemote(snapshot,expected){
 const {data,error}=await client.rpc('save_player_game',{p_save_data:snapshot,p_expected_revision:expected});
 if(error)throw error;
 const row=Array.isArray(data)?data[0]:data;
 if(!row||!Number.isFinite(Number(row.revision)))throw new Error('Сервер не вернул новую версию сохранения');
 revision=Number(row.revision);
 try{localStorage.setItem('tb-cloud-user-id',session.user.id);localStorage.setItem('tb-cloud-revision',String(revision));}catch(e){}
 return row;
}
async function loadGame(){return await readRemote();}
async function saveGame(snapshot=localSnapshot(),expected=revision){return await writeRemote(snapshot,expected);}

async function chooseSource(remote){
 const local=localSnapshot(),localExists=hasLocal(local),sameUser=localStorage.getItem('tb-cloud-user-id')===session.user.id;
 const knownRevision=Number(localStorage.getItem('tb-cloud-revision')||0);
 revision=remote?Number(remote.revision):0;
 if(!remote){const hasCharacters=snapshotHasCharacters(local);say('В облаке пока нет сохранения.');await writeRemote(local,0);$('#tbCloudChoices').hidden=true;$('#tbCloudSignedIn').hidden=false;setStatus('ОБЛАКО · СОХРАНЕНО','online');say(hasCharacters?'Прогресс привязан к аккаунту. Локальная копия сохранена.':'Успешный вход. Создайте персонажа');return;}
 if(!localExists){say('Загружаем облачный прогресс…');restoreLocal(remote.save_data);}
 if(sameSave(local,remote.save_data)||(sameUser&&knownRevision===revision&&sameSave(local,remote.save_data))){
  try{localStorage.setItem('tb-cloud-user-id',session.user.id);localStorage.setItem('tb-cloud-revision',String(revision));}catch(e){}
  $('#tbCloudChoices').hidden=true;$('#tbCloudSignedIn').hidden=false;setStatus('ОБЛАКО · '+(session.user.email||'ПОДКЛЮЧЕНО'),'online');say('Аккаунт подключён. Облачная версия актуальна.');return;
 }
 conflict=true;$('#tbCloudAuth').hidden=true;$('#tbCloudChoices').hidden=false;$('#tbCloudSignedIn').hidden=true;
 $('#tbCloudIntro').textContent='Найдены две версии прогресса. Автоматически ничего не перезаписываем.';
 $('#tbCloudAccount').textContent=session.user.email+' · облачная версия №'+revision;
 say('Выбери источник прогресса.');window.__TB_CLOUD_PENDING_REMOTE=remote;window.__TB_CLOUD_PENDING_LOCAL=local;
}
async function onSession(next){
 const sessionKey=next?.user?.id||'signed-out';if(sessionKey===handledSessionKey)return;handledSessionKey=sessionKey;conflict=false;session=next;
 if(!session){setStatus('АККАУНТ · НУЖЕН ВХОД','local');$('#tbCloudAuth').hidden=false;$('#tbCloudChoices').hidden=true;$('#tbCloudSignedIn').hidden=true;$('#tbCloudAccount').textContent='';showLoginGate();return;}
 hideLoginGate();$('#tbCloudTitle').textContent='Облачный аккаунт Towerbound';$('#tbCloudIntro').textContent='Игровой аккаунт подключён. Прогресс синхронизируется с облаком.';
 $('#tbCloudAuth').hidden=true;$('#tbCloudChoices').hidden=true;$('#tbCloudSignedIn').hidden=true;$('#tbCloudAccount').textContent=session.user.email||session.user.id;
 setStatus('ОБЛАКО · ПОДКЛЮЧЕНИЕ…','online');say('Проверяем облачное сохранение…');
 try{const remote=await loadGame();await chooseSource(remote);}
 catch(e){console.error('[Towerbound cloud] load failed',e);setStatus('ОБЛАКО · ОШИБКА','error');say('Не удалось загрузить сохранение: '+(e.message||'ошибка сети')+'. Локальные данные не изменены.');}
}
async function saveLoop(){
 if(!session||!client||conflict)return false;
 if(syncing){dirty=true;return false;}
 syncing=true;let saved=false;
 try{
  do{dirty=false;await saveGame(localSnapshot(),revision);setStatus('ОБЛАКО · СИНХРОНИЗИРОВАНО','online');saved=true;}
  while(dirty&&session&&!conflict);
 }catch(e){
  saved=false;
  console.error('[Towerbound cloud] save failed',e);
  if(String(e.message||e).includes('SAVE_CONFLICT')||String(e.code||'')==='40001'){
   conflict=true;setStatus('ОБЛАКО · КОНФЛИКТ','error');say('Сохранение изменилось на другом устройстве. Обнови облачную версию или выбери источник вручную; автоматическая перезапись остановлена.');
  }else{setStatus('ОБЛАКО · ОЖИДАЕТ СЕТИ','error');say('Не удалось синхронизировать. Локальный прогресс сохранён, повторим при следующем изменении.');}
 }finally{syncing=false;}
 return saved;
}
async function syncNow(){
 if(!session||!client)throw new Error('Сначала войди в облачный аккаунт');
 if(conflict)throw new Error('Есть конфликт сохранений: выбери версию в окне облачного аккаунта');
 clearTimeout(timer);dirty=true;
 while(syncing)await new Promise(resolve=>setTimeout(resolve,40));
 const saved=await saveLoop();
 if(!saved)throw new Error(status.text||'Не удалось синхронизировать сохранение');
 return{revision,status:{...status}};
}
function queueSave(){if(!session||conflict||restoring)return;dirty=true;clearTimeout(timer);timer=setTimeout(saveLoop,1300);}
window.addEventListener('online',()=>{if(session&&!conflict)queueSave();});
const originalSet=Storage.prototype.setItem;
Storage.prototype.setItem=function(key,value){const result=originalSet.call(this,key,value);if(this===localStorage&&isSaveKey(key))queueSave();return result;};
const loginEmail=()=>{const login=String($('#loginInput').value||'').trim().toLowerCase();if(!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(login))throw new Error('Логин: 3–32 символа, латиница, цифры, точка, дефис или подчёркивание');return login+'@towerbound.game';};
const loginPassword=()=>{const password=$('#passInput').value||'';if(password.length<6)throw new Error('Пароль должен содержать минимум 6 символов');return password;};
$('#tbCloudSignIn').addEventListener('click',async()=>{try{if(!client)throw new Error('Supabase ещё подключается');say('Входим в игру…');setRemember($('#rememberMe').checked);const {error}=await client.auth.signInWithPassword({email:loginEmail(),password:loginPassword()});if(error)throw error;}catch(e){say(e.message||'Не удалось войти');}});
$('#tbCloudSignUp').addEventListener('click',async()=>{try{if(!client)throw new Error('Supabase ещё подключается');say('Создаём игровой аккаунт…');setRemember($('#rememberMe').checked);const {data,error}=await client.auth.signUp({email:loginEmail(),password:loginPassword(),options:{emailRedirectTo:window.location.origin+window.location.pathname}});if(error)throw error;if(!data.session)say('Регистрация создана, но сессия не выдана. Для логинов без реального email отключи Confirm email в настройках Supabase Auth, затем войди с тем же логином и паролем.');}catch(e){say(e.message||'Не удалось зарегистрироваться');}});
$('#tbCloudGoogle').addEventListener('click',async()=>{try{say('Открываем Google…');const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin+window.location.pathname}});if(error)throw error;}catch(e){say(e.message||'Вход через Google не настроен');}});
$('#tbCloudUseRemote').addEventListener('click',()=>{try{restoreLocal(window.__TB_CLOUD_PENDING_REMOTE.save_data);}catch(e){say(e.message);}});
$('#tbCloudUseLocal').addEventListener('click',async()=>{try{say('Загружаем локальную версию…');await writeRemote(window.__TB_CLOUD_PENDING_LOCAL,revision);conflict=false;$('#tbCloudChoices').hidden=true;$('#tbCloudSignedIn').hidden=false;setStatus('ОБЛАКО · СОХРАНЕНО','online');say('Текущий прогресс этого устройства теперь в облаке.');}catch(e){say(e.message||'Не удалось сохранить');}});
$('#tbCloudSyncNow').addEventListener('click',async()=>{try{await syncNow();say('Синхронизация завершена · версия '+revision+'.');}catch(error){say(error.message||'Не удалось синхронизировать');}});
$('#tbCloudSignOut').addEventListener('click',async()=>{try{setRemember(false);await client.auth.signOut();conflict=false;showLoginGate();say('Вы вышли. Для продолжения войди снова.');}catch(e){say(e.message);}});
function init(){
 if(!cfg.url||!cfg.publishableKey){
  setStatus('АККАУНТ · НУЖНА НАСТРОЙКА','local');
  button.title='Нужно создать Supabase-проект и заполнить supabase-config.js';
  $('#tbCloudIntro').textContent='Облачный модуль установлен, но ещё не подключён к Supabase. Локальное сохранение продолжает работать.';
  say('Для входа нужен URL проекта и publishable key Supabase.');showLoginGate();$('#tbCloudSignIn').disabled=$('#tbCloudSignUp').disabled=true;return;
 }
 if(!window.supabase?.createClient){
  setStatus('ОБЛАКО · SDK НЕДОСТУПЕН','error');
  $('#tbCloudIntro').textContent='Не удалось загрузить клиент Supabase с CDN. Локальное сохранение продолжает работать.';
  say('Проверь подключение к интернету и доступность cdn.jsdelivr.net.');showLoginGate();$('#tbCloudSignIn').disabled=$('#tbCloudSignUp').disabled=true;return;
 }
 client=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 client.auth.onAuthStateChange((_event,next)=>{if(authInitialized)setTimeout(()=>onSession(next),0);});
 client.auth.getSession().then(async({data,error})=>{if(error)throw error;let active=data.session;if(active&&!remembered()){await client.auth.signOut();active=null;}authInitialized=true;handledSessionKey='';if(active)await onSession(active);else{session=null;showLoginGate();setStatus('АККАУНТ · НУЖЕН ВХОД','local');}}).catch(e=>{console.error(e);authInitialized=true;showLoginGate();setStatus('ОБЛАКО · ОШИБКА','error');say(e.message||'Не удалось проверить сессию');});
}
$('#tbCloudSignUp').disabled=$('#tbCloudSignIn').disabled=$('#tbCloudGoogle').disabled=!cfg.url||!cfg.publishableKey;
init();
window.TowerboundCloud={get configured(){return !!client;},get signedIn(){return !!session;},get revision(){return revision;},get client(){return client;},get session(){return session;},open,loadGame,saveGame,queueSave,syncNow,signIn,signUp,signOut,status:()=>({...status}),requireLogin:showLoginGate};
})();