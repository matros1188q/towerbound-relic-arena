/* Towerbound Cloud Accounts — phase 1.
 * Uses only the Supabase publishable/anon key in the browser. RLS + RPC enforce ownership/versioning.
 */
(()=>{'use strict';
if(window.__TOWERBOUND_CLOUD_V1__)return;window.__TOWERBOUND_CLOUD_V1__=true;
const cfg=window.TOWERBOUND_SUPABASE_CONFIG||{};
const SAVE_KEYS=new Set(['tb-rpg-v2','tb-rpg-v1','towerbound-save-v1','towerbound-profiles-v1','towerbound-active-profile-v1','tb-endgame-v1','tb-social-v1']);
const isSaveKey=k=>SAVE_KEYS.has(String(k))||String(k).startsWith('towerbound-profile-save-');
const $=s=>document.querySelector(s);
let client=null,session=null,revision=0,syncing=false,dirty=false,timer=0,conflict=false,restoring=false,handledSessionKey='',authInitialized=false,savesReady=false;
let sessionTask=Promise.resolve();
let resolveCloudBootstrap;
const cloudBootstrap=new Promise(resolve=>{resolveCloudBootstrap=resolve;});
const CLOUD_TIMEOUT_MS=15000;
function withTimeout(promise,label,ms=CLOUD_TIMEOUT_MS){let timerId;return Promise.race([Promise.resolve(promise),new Promise((_,reject)=>{timerId=setTimeout(()=>reject(new Error(label+' · превышено время ожидания')),ms);})]).finally(()=>clearTimeout(timerId));}
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
#tbCloudMessage{min-height:22px;color:#e9c985;font-size:12px;margin-top:10px}#tbCloudMessage[data-kind="error"],.tb-account-message.is-error,.tb-login-message.is-error{color:#ff858d!important}.tb-account-hint{display:block;margin-top:6px;color:#92909b;font-size:10px;line-height:1.4}#tbCloudHint{display:block;margin-top:7px;color:#92909b;font-size:10px;line-height:1.4}
#tbCloudAccount{color:#a8d9bd;font-size:12px;overflow-wrap:anywhere}
#tbCloudOverlay.login-required #tbCloudClose{display:none}#tbCloudDialog .tb-remember-label{display:flex;align-items:center;gap:9px;font-size:12px}#tbCloudDialog .tb-remember-label input{width:18px;height:18px;accent-color:#d7b875}#tbCloudOverlay.login-required{z-index:2147483000}#tbCloudOverlay.login-required #tbCloudDialog{max-height:calc(100dvh - 28px)}
@media(max-width:600px){#tbCloudButton{top:calc(env(safe-area-inset-top) + 7px);right:8px;font-size:9px;padding:7px 8px}}
`;
style.textContent += '#tbCloudButton{display:none!important}';document.head.appendChild(style);
const button=document.createElement('button');button.id='tbCloudButton';button.type='button';button.textContent='АККАУНТ · ЛОКАЛЬНО';button.dataset.state='local';button.hidden=true;document.body.appendChild(button);
const overlay=document.createElement('div');overlay.id='tbCloudOverlay';overlay.innerHTML=`<section id="tbCloudDialog" role="dialog" aria-modal="true" aria-labelledby="tbCloudTitle">
<h2 id="tbCloudTitle">Вход в игру</h2><p id="tbCloudIntro">Войди или создай игровой аккаунт Towerbound.</p>
<div id="tbCloudAccount"></div>
<div id="tbCloudAuth">
<label for="loginInput">Логин</label><input id="loginInput" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Твой игровой логин">
<label for="passInput">Пароль</label><input id="passInput" type="password" autocomplete="current-password" placeholder="Минимум 6 символов">
<label class="tb-remember-label"><input id="tbCloudRememberMe" type="checkbox"> Запомнить меня</label>
<div class="tb-cloud-row"><button id="tbCloudSignIn" type="button">ВОЙТИ</button><button id="tbCloudSignUp" type="button">ЗАРЕГИСТРИРОВАТЬСЯ</button></div><small id="tbCloudHint">Если у вас еще нет аккаунта, нажмите «Зарегистрироваться».</small>
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
</section>`;document.body.appendChild(overlay);
const say=(m,kind='info')=>{const node=$('#tbCloudMessage');node.textContent=m||'';node.dataset.kind=kind;};
const AUTH_EMAIL_DOMAIN='towerbound.com';
const authEmail=login=>String(login||'').trim().toLowerCase()+'@'+AUTH_EMAIL_DOMAIN;
function localizedAuthError(error,fallback='Ошибка авторизации'){const message=String(error?.message||error||'');if(/Invalid login credentials/i.test(message))return 'Неверный логин или пароль';if(/Email address.*is invalid|invalid email/i.test(message))return 'Ошибка регистрации. Попробуйте другой логин';if(/User already registered|already registered/i.test(message))return 'Этот логин уже занят';if(/Password should be at least 6 characters|password.{0,30}at least 6 characters/i.test(message))return 'Пароль должен быть не менее 6 символов';return message||fallback;}
const setStatus=(textValue,kind)=>{status.text=textValue;status.kind=kind;button.textContent=textValue;button.dataset.state=kind;document.querySelectorAll('.tb-account-button').forEach(node=>{const login=session?.user?.email?String(session.user.email).split('@')[0]:'',label=login||((kind==='online')?'В СЕТИ':'АККАУНТ');node.textContent=label.toUpperCase();});};
const open=()=>{overlay.classList.add('open');overlay.style.display='grid';overlay.style.visibility='visible';},close=()=>{if(!overlay.classList.contains('login-required')){overlay.classList.remove('open');overlay.style.display='none';overlay.style.visibility='hidden';}};
const rememberKey='tb-remember-me',remembered=()=>{try{return localStorage.getItem(rememberKey)!=='false';}catch(e){return true;}};
const setRemember=value=>{try{localStorage.setItem(rememberKey,value?'true':'false');}catch(e){}};
const showLoginGate=(force=false)=>{overlay.classList.remove('login-required');$('#tbCloudTitle').textContent='Вход в игру';$('#tbCloudIntro').textContent='Войди в игровой аккаунт, чтобы открыть выбор персонажа.';$('#tbCloudAuth').hidden=false;$('#tbCloudChoices').hidden=true;$('#tbCloudSignedIn').hidden=true;$('#tbCloudClose').hidden=!force;$('#tbCloudRememberMe').checked=remembered();if(force){overlay.classList.add('open');overlay.style.display='grid';overlay.style.visibility='visible';}else{overlay.classList.remove('open');overlay.style.display='none';overlay.style.visibility='hidden';}};
const hideLoginGate=()=>{overlay.classList.remove('login-required','open');overlay.style.display='none';overlay.style.visibility='hidden';$('#tbCloudClose').hidden=false;};
button.addEventListener('click',open);$('#tbCloudClose').addEventListener('click',close);
overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
async function signIn(login,password,remember=true){if(!client)throw new Error('Supabase ещё подключается');const clean=String(login||'').trim().toLowerCase();if(!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(clean))throw new Error('Логин: 3–32 символа, латиница, цифры, точка, дефис или подчёркивание');if(String(password||'').length<6)throw new Error('Пароль должен содержать минимум 6 символов');setRemember(remember);let result=await withTimeout(client.auth.signInWithPassword({email:authEmail(clean),password:String(password)}),'Вход в аккаунт');if(result.error&&/Invalid login credentials/i.test(result.error.message||'')){const legacy=await withTimeout(client.auth.signInWithPassword({email:clean+'@towerbound.game',password:String(password)}),'Проверка старого логина');if(!legacy.error)result=legacy;}const {data,error}=result;if(error)throw new Error(localizedAuthError(error,'Не удалось войти'));if(!data.session)throw new Error('Supabase не вернул активную сессию');await withTimeout(onSession(data.session,true),'Подключение облачного сохранения',25000);if(!savesReady&&!conflict)throw new Error('Вход выполнен, но облачное сохранение не загрузилось. Повтори вход; локальные данные не затронуты.');return true;}
async function signUp(login,password,remember=true){if(!client)throw new Error('Supabase ещё подключается');const clean=String(login||'').trim().toLowerCase();if(!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(clean))throw new Error('Логин: 3–32 символа, латиница, цифры, точка, дефис или подчёркивание');if(String(password||'').length<6)throw new Error('Пароль должен содержать минимум 6 символов');setRemember(remember);const {data,error}=await client.auth.signUp({email:authEmail(clean),password:String(password),options:{emailRedirectTo:window.location.origin+window.location.pathname}});if(error)throw new Error(localizedAuthError(error,'Не удалось зарегистрироваться'));if(data.session)await onSession(data.session);else say('Регистрация создана. Для входа с игровым логином отключи Confirm email в настройках Supabase Auth.');return true;}
async function signOut(){if(!client)throw new Error('Supabase недоступен');setRemember(false);const {error}=await client.auth.signOut();if(error)throw error;conflict=false;await onSession(null);return true;}
function localSnapshot(){
 const keys={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(isSaveKey(k)){const v=localStorage.getItem(k);if(v!==null)keys[k]=v;}}}catch(e){console.warn('[Towerbound cloud] local snapshot failed',e);}
 return{schemaVersion:1,game:'towerbound-relic-arena',savedAt:new Date().toISOString(),keys};
}
function hasLocal(snapshot){return !!(snapshot&&snapshot.keys&&Object.keys(snapshot.keys).length);}
function snapshotHasCharacters(snapshot){for(const [key,value] of Object.entries(snapshot?.keys||{})){if(!isSaveKey(key)||typeof value!=='string')continue;try{const parsed=JSON.parse(value);if((Array.isArray(parsed?.characters)&&parsed.characters.length>0)||(Array.isArray(parsed?.chars)&&parsed.chars.length>0))return true;}catch(e){}}return false;}
function validateSnapshot(snapshot){
 if(!snapshot||typeof snapshot!=='object'||!snapshot.keys||typeof snapshot.keys!=='object'||Array.isArray(snapshot.keys))throw new Error('Сохранение имеет неверный формат');
 for(const [key,value] of Object.entries(snapshot.keys)){
  if(!isSaveKey(key)||typeof value!=='string')throw new Error('Сохранение содержит неизвестный или повреждённый раздел: '+key);
  if(key==='towerbound-active-profile-v1')continue;
  try{const parsed=JSON.parse(value);if(key==='tb-rpg-v2'&&(!parsed||typeof parsed!=='object'||!Array.isArray(parsed.characters)))throw new Error('invalid RPG payload');}
  catch(_){throw new Error('Повреждён раздел сохранения: '+key);}
 }
 return snapshot;
}
function backupLocalSnapshot(){
 try{const snapshot=localSnapshot();if(!hasLocal(snapshot))return;localStorage.setItem('tb-cloud-local-backup-v1',JSON.stringify({savedAt:new Date().toISOString(),snapshot}));}catch(error){console.warn('[Towerbound cloud] local backup skipped',error);}
}
function snapshotProgress(snapshot){
 const raw=snapshot?.keys?.['tb-rpg-v2'];if(typeof raw!=='string')return[0,0,0,0,0];
 try{
  const game=JSON.parse(raw),chars=Array.isArray(game.characters)?game.characters:[];
  let level=0,highest=0,stage=0,xp=0,kills=0;
  for(const c of chars){
   level=Math.max(level,Number(c?.level)||0);
   highest=Math.max(highest,Number(c?.progress?.highestEver)||0);
   stage=Math.max(stage,Number(c?.progress?.currentStage)||0);
   xp=Math.max(xp,Number(c?.xp)||0);
   kills=Math.max(kills,Number(c?.stats?.kills)||0);
   const runStage=c?.run?.stage;
   if(runStage&&typeof runStage==='object')stage=Math.max(stage,Number(runStage.stage)||Number(runStage.floor)||Number(runStage.index)||0);
   else if(Number.isFinite(Number(runStage)))stage=Math.max(stage,Number(runStage)||0);
  }
  return[level,highest,stage,xp,kills];
 }catch(_){return[0,0,0,0,0];}
}
function compareProgress(a,b){
 const av=snapshotProgress(a),bv=snapshotProgress(b);
 for(let i=0;i<av.length;i++){if(av[i]!==bv[i])return av[i]>bv[i]?1:-1;}
 return 0;
}
function isFreshStarterSnapshot(snapshot){
 const raw=snapshot?.keys?.['tb-rpg-v2'];if(typeof raw!=='string')return false;
 try{
  const game=JSON.parse(raw),chars=Array.isArray(game.characters)?game.characters:[];
  if(!chars.length)return false;
  return chars.every(c=>(Number(c?.level)||1)<=1&&(Number(c?.xp)||0)===0&&(Number(c?.progress?.highestEver)||0)<=0&&(Number(c?.progress?.currentStage)||1)<=1&&!(c?.run?.active)&&!c?.run?.stage&&(Number(c?.stats?.kills)||0)===0);
 }catch(_){return false;}
}
function sameSave(a,b){if(!a?.keys||!b?.keys)return false;const ak=Object.keys(a.keys).sort(),bk=Object.keys(b.keys).sort();return ak.length===bk.length&&ak.every((k,i)=>k===bk[i]&&a.keys[k]===b.keys[k]);}
function stableValue(value){if(Array.isArray(value))return value.map(stableValue);if(value&&typeof value==='object')return Object.keys(value).sort().reduce((out,key)=>(out[key]=stableValue(value[key]),out),{});return value;}
function onlyBagDiff(local,remote){
 if(!local?.keys||!remote?.keys)return false;
 const a=Object.keys(local.keys).sort(),b=Object.keys(remote.keys).sort();if(a.length!==b.length||a.some((k,i)=>k!==b[i]))return false;
 let changed=false;
 for(const key of a){
  const av=local.keys[key],bv=remote.keys[key];
  if(key!=='tb-rpg-v2'){if(av!==bv)return false;continue;}
  if(typeof av!=='string'||typeof bv!=='string')return false;
  try{
   const ag=JSON.parse(av),bg=JSON.parse(bv),ac=Array.isArray(ag.characters)?ag.characters:[],bc=Array.isArray(bg.characters)?bg.characters:[];
   if(ac.length!==bc.length)return false;
   const strip=game=>{const copy=JSON.parse(JSON.stringify(game));for(const ch of copy.characters||[])delete ch.bag;return JSON.stringify(stableValue(copy));};
   if(strip(ag)!==strip(bg))return false;
   if(JSON.stringify(stableValue(ac.map(x=>x.bag||[])))!==JSON.stringify(stableValue(bc.map(x=>x.bag||[]))))changed=true;
  }catch(_){return false;}
 }
 return changed;
}
function walletComparable(snapshot){
 if(!snapshot?.keys)return null;const result={};
 const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.keys(value).sort().reduce((out,key)=>(out[key]=stable(value[key]),out),{}):value);
 for(const key of Object.keys(snapshot.keys).sort()){
  const value=snapshot.keys[key];if(!isSaveKey(key)||typeof value!=='string'){result[key]=value;continue;}
  try{const game=JSON.parse(value);if(game.account&&typeof game.account==='object')delete game.account.diamonds;if(Array.isArray(game.characters))for(const c of game.characters)if(c&&typeof c==='object')delete c.silver;result[key]=JSON.stringify(stable(game));}catch(_){return null;}
 }
 return JSON.stringify(result);
}
function onlyWalletDiff(local,remote){const a=walletComparable(local),b=walletComparable(remote);return a!==null&&b!==null&&a===b;}
function mergeWalletSnapshot(local,remote){
 const merged={...local,keys:{...(local?.keys||{})}};
 for(const [key,value] of Object.entries(merged.keys)){
  if(!isSaveKey(key)||typeof value!=='string'||typeof remote?.keys?.[key]!=='string')continue;
  try{
   const localGame=JSON.parse(value),remoteGame=JSON.parse(remote.keys[key]);
   if(localGame.account&&remoteGame.account)localGame.account.diamonds=Number(remoteGame.account.diamonds)||0;
   if(Array.isArray(localGame.characters)&&Array.isArray(remoteGame.characters)){
    const remoteChars=new Map(remoteGame.characters.filter(Boolean).map(c=>[String(c.id),c]));
    for(const character of localGame.characters){const serverCharacter=remoteChars.get(String(character?.id));if(character&&serverCharacter)character.silver=Number(serverCharacter.silver)||0;}
   }
   merged.keys[key]=JSON.stringify(localGame);
  }catch(_){}
 }
 return merged;
}
function restoreLocal(snapshot){
 validateSnapshot(snapshot);
 const previous=localSnapshot();
 if(snapshotHasCharacters(previous)&&!snapshotHasCharacters(snapshot))throw new Error('Защита сохранения: облачная версия пуста, локальный прогресс не будет затёрт');
 backupLocalSnapshot();
 restoring=true;
 const remoteKeys=new Set(Object.keys(snapshot.keys).filter(isSaveKey));
 const previousValues={};
 try{
  for(const [k,v] of Object.entries(snapshot.keys)){if(isSaveKey(k)&&typeof v==='string'){previousValues[k]=localStorage.getItem(k);localStorage.setItem(k,v);}}
  for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(isSaveKey(k)&&!remoteKeys.has(k))localStorage.removeItem(k);}
  try{localStorage.setItem('tb-cloud-user-id',session?.user?.id||'');localStorage.setItem('tb-cloud-revision',String(revision));}catch(e){}
  window.dispatchEvent(new CustomEvent('towerbound-cloud-restore',{detail:{revision}}));
 }catch(error){
  for(const [k,v] of Object.entries(previousValues)){try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(_){}}
  throw error;
 }finally{restoring=false;}
}
async function readRemote(){
 const {data,error}=await withTimeout(client.from('player_saves').select('save_data,revision,updated_at').eq('user_id',session.user.id).maybeSingle(),'Загрузка облачного сохранения');
 if(error)throw error;if(data?.save_data)validateSnapshot(data.save_data);return data;
}
async function writeRemote(snapshot,expected){
 validateSnapshot(snapshot);
 if(Number(expected)>0&&!snapshotHasCharacters(snapshot))throw new Error('SAVE_GUARD_BLOCKED · Пустое сохранение не может заменить существующего персонажа');
 const {data,error}=await withTimeout(client.rpc('save_player_game',{p_save_data:snapshot,p_expected_revision:expected}),'Запись облачного сохранения');
 if(error)throw error;
 const row=Array.isArray(data)?data[0]:data;
 if(!row||!Number.isFinite(Number(row.revision)))throw new Error('Сервер не вернул новую версию сохранения');
 revision=Number(row.revision);
 try{localStorage.setItem('tb-cloud-user-id',session.user.id);localStorage.setItem('tb-cloud-revision',String(revision));}catch(e){}
 return row;
}
async function loadGame(){return await readRemote();}
async function refreshFromServer(){
 const remote=await readRemote();if(!remote?.save_data)throw new Error("Облачное сохранение не найдено");
 const local=localSnapshot();
 if(!hasLocal(local)){revision=Number(remote.revision)||revision;restoreLocal(remote.save_data);return;}
 if(sameSave(local,remote.save_data)){revision=Number(remote.revision)||revision;try{localStorage.setItem('tb-cloud-revision',String(revision));}catch(e){}return;}
 if(onlyBagDiff(local,remote.save_data)){revision=Number(remote.revision)||revision;restoreLocal(remote.save_data);return;}
 if(!onlyWalletDiff(local,remote.save_data))throw new Error("SAVE_CONFLICT · Облачная версия содержит другие изменения. Сначала синхронизируй сохранение.");
 const merged=mergeWalletSnapshot(local,remote.save_data);revision=Number(remote.revision)||revision;
 await writeRemote(merged,revision);restoreLocal(merged);
}
async function reloadAuthoritative(){
 if(!session)throw new Error('Для обновления сохранения войди в аккаунт');
 const remote=await readRemote();if(!remote?.save_data)throw new Error('Облачное сохранение не найдено');
 revision=Number(remote.revision)||0;restoreLocal(remote.save_data);return revision;
}
async function saveGame(snapshot=localSnapshot(),expected=revision){return await writeRemote(snapshot,expected);}

async function chooseSource(remote){
 const local=localSnapshot(),localExists=hasLocal(local),sameUser=localStorage.getItem('tb-cloud-user-id')===session.user.id;
 const knownRevision=Number(localStorage.getItem('tb-cloud-revision')||0);
 revision=remote?Number(remote.revision):0;
 if(!remote){const hasCharacters=snapshotHasCharacters(local);say('В облаке пока нет сохранения.');if(hasCharacters){await writeRemote(local,0);setStatus('ОБЛАКО · СОХРАНЕНО','online');say('Локальный прогресс привязан к аккаунту и сохранён в облаке.');}else{revision=0;setStatus('ОБЛАКО · ГОТОВО','online');say('Аккаунт подключён. После создания персонажа прогресс будет сохранён.');}$('#tbCloudChoices').hidden=true;$('#tbCloudSignedIn').hidden=false;return;}
 const localHasCharacters=snapshotHasCharacters(local),remoteHasCharacters=snapshotHasCharacters(remote.save_data);
 const progressOrder=compareProgress(local,remote.save_data);
 const freshLocal=isFreshStarterSnapshot(local);
 if(remoteHasCharacters&&(!localHasCharacters||freshLocal||progressOrder<0)){
  say(freshLocal?'Обнаружен новый стартовый профиль. Восстанавливаем сохранение аккаунта…':'В облаке найден более продвинутый прогресс. Восстанавливаем его…');
  restoreLocal(remote.save_data);
  return;
 }
 if(localHasCharacters&&remoteHasCharacters&&progressOrder>0){
  say('На этом устройстве найден более продвинутый прогресс. Сохраняем его в облако…');
  await writeRemote(local,revision);
  conflict=false;
  try{localStorage.setItem('tb-cloud-user-id',session.user.id);localStorage.setItem('tb-cloud-revision',String(revision));}catch(e){}
  $('#tbCloudChoices').hidden=true;$('#tbCloudSignedIn').hidden=false;
  setStatus('ОБЛАКО · СОХРАНЕНО','online');say('Более высокий игровой прогресс сохранён в облаке.');
  return;
 }
 if(sameUser&&knownRevision<revision&&onlyWalletDiff(local,remote.save_data)){say("Облачный баланс обновился. Объединяем валюту с локальным прогрессом…");const merged=mergeWalletSnapshot(local,remote.save_data);await writeRemote(merged,revision);restoreLocal(merged);return;}if(sameUser&&knownRevision<revision&&onlyBagDiff(local,remote.save_data)){say('Получены серверные изменения инвентаря. Обновляем сумку…');restoreLocal(remote.save_data);return;}
 if(!localExists){say('Загружаем облачный прогресс…');restoreLocal(remote.save_data);}
 if(sameSave(local,remote.save_data)||(sameUser&&knownRevision===revision&&sameSave(local,remote.save_data))){
  try{localStorage.setItem('tb-cloud-user-id',session.user.id);localStorage.setItem('tb-cloud-revision',String(revision));}catch(e){}
  $('#tbCloudChoices').hidden=true;$('#tbCloudSignedIn').hidden=false;setStatus('ОБЛАКО · '+(session.user.email||'ПОДКЛЮЧЕНО'),'online');say('Аккаунт подключён. Облачная версия актуальна.');return;
 }
 conflict=true;savesReady=false;setStatus('ОБЛАКО · КОНФЛИКТ СОХРАНЕНИЙ','error');overlay.classList.add('open');overlay.style.display='grid';overlay.style.visibility='visible';$('#tbCloudAuth').hidden=true;$('#tbCloudChoices').hidden=false;$('#tbCloudSignedIn').hidden=true;
 $('#tbCloudIntro').textContent='Найдены разные версии прогресса с одинаковым уровнем. Выбери, какую версию сохранить.';
 $('#tbCloudAccount').textContent=session.user.email+' · облачная версия №'+revision;
 say('Выбери источник прогресса.');window.__TB_CLOUD_PENDING_REMOTE=remote;window.__TB_CLOUD_PENDING_LOCAL=local;
}
async function onSession(next,force=false){
 const sessionKey=next?.user?.id||'signed-out';
 if(sessionKey===handledSessionKey&&!force)return sessionTask;
 handledSessionKey=sessionKey;
 sessionTask=(async()=>{
  conflict=false;session=next;savesReady=false;
  if(!session){dirty=false;setStatus('АККАУНТ · НУЖЕН ВХОД','local');$('#tbCloudAuth').hidden=false;$('#tbCloudChoices').hidden=true;$('#tbCloudSignedIn').hidden=true;$('#tbCloudAccount').textContent='';showLoginGate();window.dispatchEvent(new Event('towerbound-auth-change'));return;}
  hideLoginGate();$('#tbCloudTitle').textContent='Облачный аккаунт Towerbound';$('#tbCloudIntro').textContent='Игровой аккаунт подключён. Прогресс синхронизируется с облаком.';
  $('#tbCloudAuth').hidden=true;$('#tbCloudChoices').hidden=true;$('#tbCloudSignedIn').hidden=true;$('#tbCloudAccount').textContent=session.user.email||session.user.id;
  setStatus('ОБЛАКО · ПОДКЛЮЧЕНИЕ…','pending');say('Проверяем облачное сохранение…');
  try{
   const remote=await loadGame();
   await chooseSource(remote);
   if(!conflict){savesReady=true;$('#tbCloudIntro').textContent='Облако подключено. Прогресс готов к синхронизации.';say('Облако подключено. Сохранение готово к синхронизации.');queueSave();}
  }catch(e){savesReady=false;console.error('[Towerbound cloud] load failed',e);setStatus('ОБЛАКО · ОШИБКА','error');$('#tbCloudIntro').textContent='Не удалось подключить облачное сохранение.';say('Не удалось загрузить сохранение: '+(e.message||'ошибка сети')+'. Локальные данные не изменены.');if(session?.user?.id===sessionKey)handledSessionKey='';}
  window.dispatchEvent(new Event('towerbound-auth-change'));
 })();
 return sessionTask;
}
async function saveLoop(){
 if(!session||!client||!savesReady||conflict)return false;
 if(!dirty)return true;
 if(syncing){dirty=true;return false;}
 syncing=true;let saved=false,attempts=0;
 try{
  while(dirty&&session&&!conflict&&attempts<4){
   attempts++;dirty=false;
   const snapshot=validateSnapshot(localSnapshot());
   if(!snapshotHasCharacters(snapshot)&&revision===0){dirty=false;saved=true;break;}
   if(!snapshotHasCharacters(snapshot)&&revision>0)throw new Error('SAVE_GUARD_BLOCKED · Локальное сохранение пустое; облачный персонаж защищён');
   try{
    await saveGame(snapshot,revision);
    saved=true;
    setStatus('ОБЛАКО · СИНХРОНИЗИРОВАНО','online');
    say('Прогресс сохранён в облаке · версия '+revision+'.');
   }catch(error){
    const isConflict=String(error?.message||error).includes('SAVE_CONFLICT')||String(error?.code||'')==='40001';
    if(!isConflict)throw error;
    const remote=await readRemote();
    if(!remote?.save_data)throw new Error('Сервер сообщил о конфликте, но актуальное сохранение не найдено');
    revision=Number(remote.revision)||0;
    const latestLocal=localSnapshot();
    const order=compareProgress(latestLocal,remote.save_data);
    if(sameSave(latestLocal,remote.save_data)){
     try{localStorage.setItem('tb-cloud-revision',String(revision));localStorage.setItem('tb-cloud-user-id',session.user.id);}catch(_){}
     dirty=false;saved=true;
     setStatus('ОБЛАКО · СИНХРОНИЗИРОВАНО','online');
     say('Облако уже содержит актуальную копию прогресса · версия '+revision+'.');
     break;
    }
    if(order>0){
     dirty=true;
     say('Обнаружена более свежая локальная версия. Повторяем сохранение с актуальной версией облака…');
     continue;
    }
    if(order<0){
     say('В облаке найден более новый прогресс. Восстанавливаем его на устройстве…');
     restoreLocal(remote.save_data);
     saved=false;
     break;
    }
    await chooseSource(remote);
    if(conflict){saved=false;dirty=false;break;}
    saved=true;dirty=false;
    setStatus('ОБЛАКО · СИНХРОНИЗИРОВАНО','online');
   }
  }
  if(dirty&&attempts>=4){
   saved=false;
   setStatus('ОБЛАКО · ПОВТОР СИНХРОНИЗАЦИИ','error');
   say('Не удалось завершить синхронизацию после нескольких попыток. Локальный прогресс оставлен на устройстве. Нажми «Синхронизировать сейчас».','error');
  }
 }catch(error){
  saved=false;dirty=true;
  console.error('[Towerbound cloud] save failed',error);
  setStatus('ОБЛАКО · ОШИБКА СОХРАНЕНИЯ','error');
  say('Не удалось сохранить прогресс в облако: '+(error?.message||'ошибка сети')+'. Локальная копия сохранена.','error');
 }finally{syncing=false;}
 return saved;
}
async function syncNow(){
 if(!session||!client)throw new Error('Сначала войди в облачный аккаунт');
 if(!savesReady){await onSession(session,true);if(!savesReady)throw new Error('Облачное сохранение ещё не загружено. Повтори попытку через несколько секунд.');}
 if(conflict)throw new Error('Есть конфликт сохранений: выбери версию в окне облачного аккаунта');
 clearTimeout(timer);dirty=true;
 while(syncing)await new Promise(resolve=>setTimeout(resolve,40));
 const saved=await saveLoop();
 if(!saved)throw new Error(status.text||'Не удалось синхронизировать сохранение');
 return{revision,status:{...status}};
}
function queueSave(){if(restoring)return;dirty=true;if(!session||!savesReady||conflict)return;clearTimeout(timer);timer=setTimeout(saveLoop,350);}
async function flushSave(){
 if(restoring)return false;
 dirty=true;if(!session||!client||!savesReady||conflict)return false;
 clearTimeout(timer);
 return await saveLoop();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&session&&!conflict){clearTimeout(timer);saveLoop();}});
window.addEventListener('pagehide',()=>{if(session&&!conflict){clearTimeout(timer);flushSave();}});
window.addEventListener('online',()=>{if(session&&!conflict)queueSave();});
setInterval(()=>{if(session&&!conflict&&dirty)saveLoop();},5000);
$('#tbCloudSignIn').addEventListener('click',async()=>{const button=$('#tbCloudSignIn');if(button.disabled)return;button.disabled=true;try{say('Входим в игру и загружаем сохранение…');await signIn($('#loginInput').value,$('#passInput').value,$('#tbCloudRememberMe').checked);}catch(e){say(localizedAuthError(e,'Не удалось войти'),'error');}finally{button.disabled=false;}});
$('#tbCloudSignUp').addEventListener('click',async()=>{try{say('Создаём игровой аккаунт…');await signUp($('#loginInput').value,$('#passInput').value,$('#tbCloudRememberMe').checked);}catch(e){say(localizedAuthError(e,'Не удалось зарегистрироваться'),'error');}});
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
  say('Для входа нужен URL проекта и publishable key Supabase.');showLoginGate();$('#tbCloudSignIn').disabled=$('#tbCloudSignUp').disabled=true;resolveCloudBootstrap({ready:false,reason:'missing-config'});window.dispatchEvent(new Event('towerbound-cloud-ready'));return;
 }
 if(!window.supabase?.createClient){
  setStatus('ОБЛАКО · SDK НЕДОСТУПЕН','error');
  $('#tbCloudIntro').textContent='Не удалось загрузить клиент Supabase с CDN. Локальное сохранение продолжает работать.';
  say('Проверь подключение к интернету и доступность cdn.jsdelivr.net.');showLoginGate();$('#tbCloudSignIn').disabled=$('#tbCloudSignUp').disabled=true;resolveCloudBootstrap({ready:false,reason:'sdk-unavailable'});window.dispatchEvent(new Event('towerbound-cloud-ready'));return;
 }
 client=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 client.auth.onAuthStateChange((_event,next)=>{if(authInitialized)setTimeout(()=>onSession(next),0);});
 withTimeout(client.auth.getSession(),'Проверка сессии').then(async({data,error})=>{if(error)throw error;let active=data.session;if(active&&!remembered()){await client.auth.signOut();active=null;}authInitialized=true;handledSessionKey='';if(active)await onSession(active);else{session=null;showLoginGate();setStatus('АККАУНТ · НУЖЕН ВХОД','local');}resolveCloudBootstrap({ready:true,signedIn:!!active});window.dispatchEvent(new Event('towerbound-cloud-ready'));}).catch(e=>{console.error('[Towerbound cloud] bootstrap failed',e);authInitialized=true;showLoginGate();setStatus('ОБЛАКО · ОШИБКА','error');say((e.message||'Не удалось проверить сессию')+' · повтори вход, локальные данные не затронуты','error');resolveCloudBootstrap({ready:false,error:e.message||String(e)});window.dispatchEvent(new Event('towerbound-cloud-ready'));});
}
$('#tbCloudSignUp').disabled=$('#tbCloudSignIn').disabled=$('#tbCloudGoogle').disabled=!cfg.url||!cfg.publishableKey;
init();
window.TowerboundCloudReady=cloudBootstrap;window.TowerboundCloud={get configured(){return !!client;},get signedIn(){return !!session;},get savesReady(){return savesReady;},get revision(){return revision;},get client(){return client;},get session(){return session;},open,loadGame,refreshFromServer,reloadAuthoritative,saveGame,queueSave,flushSave,syncNow,retryLoad:()=>session?onSession(session,true):Promise.reject(new Error('Сначала войди в аккаунт')),signIn,signUp,signOut,status:()=>({...status}),requireLogin:()=>showLoginGate(true)};
})();