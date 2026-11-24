'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const sql=fs.readFileSync('supabase/migrations/202611090002_online_leaderboard_ghosts.sql','utf8');
const online=fs.readFileSync('towerbound-online.js','utf8');
const ui=fs.readFileSync('rpg-rework-ui.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const cloud=fs.readFileSync('towerbound-cloud.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const nativeCss=fs.readFileSync('native-pwa.css','utf8');
const progression=fs.readFileSync('progression-24.js','utf8');
const engine=fs.readFileSync('rpg-rework-v2.js','utf8');
const serviceWorker=fs.readFileSync('service-worker.js','utf8');
const pwa=fs.readFileSync('juice-pwa.js','utf8');
const gems=JSON.parse(fs.readFileSync('configs/balance/equipment.json','utf8'));
assert.ok(/const CACHE = 'towerbound-v\d+'/.test(serviceWorker),'PWA cache must use a versioned towerbound-vN release key');
const shellMatch=serviceWorker.match(/const SHELL = \[([\s\S]*?)\];/);
assert.ok(shellMatch,'service worker precache shell must exist');
const shellUrls=[...shellMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(match=>match[1]);
assert.ok(shellUrls.length>0,'service worker precache shell must not be empty');
assert.equal(shellUrls.length,new Set(shellUrls).size,'service worker Cache.addAll shell must not contain duplicate URLs');
for(const asset of ['./towerbound-engine.js','./combat-visuals.js','./progression-24.js','./social-endgame.js','./supabase-config.js','./towerbound-cloud.js','./towerbound-online.js','./rpg-2000h.css'])assert.ok(shellUrls.includes(asset),'offline shell is missing runtime asset '+asset);
assert.ok(serviceWorker.includes('self.skipWaiting()'),'new service worker must skip the waiting phase');
assert.ok(serviceWorker.includes('self.clients.claim()'),'new service worker must claim open pages');
assert.ok(serviceWorker.includes("request.mode === 'navigate'")&&serviceWorker.includes("url.pathname.endsWith('/index.html')"),'HTML documents must use the network-first branch');
assert.ok(serviceWorker.includes(".catch(async () => {")&&serviceWorker.includes('const cached = await caches.match(request);')&&serviceWorker.includes("caches.match('./index.html')"),'HTML network failure must fall back to cached content');
assert.ok(pwa.includes("{updateViaCache:'none'}"),'service worker registration must bypass HTTP cache for its script');
assert.ok(pwa.includes('UPDATE_CHECK_MS=60*60*1000')&&pwa.includes('setInterval(checkForUpdate,UPDATE_CHECK_MS)'),'PWA must check for updates hourly');
assert.ok(pwa.includes("addEventListener('updatefound'")&&pwa.includes("installing.state==='installed'"),'PWA must detect newly installed workers');
assert.ok(pwa.includes('Обновить сейчас')&&pwa.includes('window.location.reload()'),'PWA update toast must offer a page reload');
for(const table of ['leaderboard','pvp_ghosts','pvp_ratings'])assert.ok(sql.includes('create table if not exists public.'+table),'missing '+table);
assert.ok(sql.includes('auth.uid() = user_id'),'RLS owner checks missing');
assert.ok(sql.includes('grant select on public.leaderboard to anon, authenticated'),'public leaderboard read grant missing');
assert.ok(sql.includes('grant select, insert, update on public.pvp_ghosts to authenticated'),'authenticated ghost access missing');
assert.ok(sql.includes('revoke all on public.pvp_ratings from anon, authenticated'),'browser must not write trusted ratings');
assert.ok(online.includes(".gte('battle_power',min).lte('battle_power',max)"),'ghost matchmaking must use ±15% BP');
assert.ok(online.includes(".neq('user_id',ctx.user.id)"),'ghost matchmaking must exclude self');
assert.ok(online.includes(".limit(100)"),'leaderboard must cap at 100');
assert.ok(online.includes(".from('leaderboard').upsert"),'player leaderboard publication missing');
assert.ok(online.includes(".from('pvp_ghosts').upsert"),'player ghost publication missing');
assert.ok(ui.includes('function leaderboardScreen()'),'leaderboard screen missing');
assert.ok(ui.includes('button("open-progress"'),'progress screen remains accessible from account');
assert.ok(!ui.slice(ui.indexOf('function header(){'),ui.indexOf('function characterList()')).includes('ПРОГРЕССИЯ'),'progression is removed from the compact brand header');
assert.ok(ui.includes('refreshOnlineLeaderboard()'),'leaderboard fetch action missing');
assert.ok(ui.includes('findGhost(c,engine)'),'real ghost matchmaking not wired');
assert.ok(ui.includes('Серверный рейтинг пока не начисляется'),'unsafe client result must not claim global rating');
assert.ok(html.includes('./towerbound-online.js?v=1'),'online module not loaded');
assert.ok(/\.\/towerbound-cloud\.js\?v=\d+/.test(html),'cloud module cache is versioned');
assert.ok(/\.\/rpg-rework-v2\.js\?v=\d+/.test(html),'engine cache is versioned for gem socket support');
assert.ok(/\.\/rpg-rework-ui\.js\?v=\d+/.test(html),'battle, profile and transparent logo UI cache is versioned');
assert.ok(/\.\/styles\.css\?v=\d+/.test(html),'battle, profile and start screen styles load from one versioned static stylesheet');
assert.ok(/rpg-rework-ui\.css\.js\?v=\d+/.test(html)&&shellUrls.includes('./rpg-rework-ui.css.js'),'battle arena runtime stylesheet remains explicitly versioned and offline-cached');
assert.ok(html.includes('TB_START_SCREEN_VIEWPORT_FIX_20261123'),'mobile start-screen viewport regression is guarded');
assert.ok(html.includes('<img class="title-illustration" src="./assets/icons/image.png" alt="T" width="96" height="96" decoding="async" fetchpriority="high">')&&!html.includes('./assets/towerbound-title-v2.webp'),'start screen reuses the current transparent T logo instead of the legacy title illustration');
assert.ok(html.includes('grid-template-columns:minmax(0,1fr)!important;')&&html.includes('width:100%!important;max-width:100%!important;min-width:0!important;')&&html.includes('@media(max-width:900px)'),'start screen is locked to a single responsive column on iPhone and small tablets');
assert.ok(html.includes('background:transparent!important;box-shadow:none!important;isolation:auto!important;')&&html.includes('title-art-vignette,#titleScreen .title-art-label{display:none!important}'),'old logo panel, vignette and title-art label are removed');
assert.ok(ui.includes('./assets/icons/image.png')&&!ui.includes('./assets/ui/logo.jpeg'),'active RPG header uses the transparent logo source');
assert.ok(nativeCss.includes('.tb-battle-rebuild')&&nativeCss.includes('.tb-battle-hero')&&nativeCss.includes('.tb-battle-enemy-grid')&&nativeCss.includes('.tb-battle-bottom'),'battle uses the active three-zone turn-based layout');
assert.ok(nativeCss.includes('flex:0 0 35%!important')&&nativeCss.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'),'hero and enemy field use the current responsive split');
assert.ok(nativeCss.includes('tb-battle-footer')&&nativeCss.includes('.tb-end-turn'),'battle footer and end-turn control are styled in the native PWA layout');
assert.ok(nativeCss.includes('.tb-battle-bottom{flex:0 0 250px!')&&nativeCss.includes('grid-template-rows:minmax(0,1fr) 50px 48px'),'battle action area reserves fixed space for card hand and turn controls');
assert.ok(ui.includes('⚡ ×2')&&ui.includes('box.scrollLeft=box.scrollWidth'),'compact speed controls and one-line scrolling combat log remain wired');
assert.ok(cloud.includes("'tb-endgame-v1'")&&cloud.includes("'tb-social-v1'"),'cloud allowlist persists endgame and social local data');
assert.ok(cloud.includes('async function loadGame()'),'cloud module exposes a remote loadGame path');
assert.ok(cloud.includes('async function saveGame('),'cloud module exposes a versioned saveGame path');
assert.ok(cloud.includes('async function syncNow()'),'manual cloud sync is awaitable and reports failure');
assert.ok(cloud.includes("$('#tbCloudSyncNow').addEventListener('click',async()=>{try{await syncNow();"),'cloud overlay waits for confirmed remote save');
assert.ok(!cloud.includes("$('#tbCloudSyncNow').addEventListener('click',()=>{conflict=false;queueSave();"),'manual sync must not clear an unresolved conflict or claim background success');
assert.ok(cloud.includes("window.addEventListener('online',()=>{if(session&&!conflict)queueSave();});"),'offline saves are retried after connectivity returns');
assert.ok(cloud.includes('loadGame,refreshFromServer,reloadAuthoritative,saveGame,queueSave,flushSave,syncNow'),'cloud save/load/sync APIs are public to the game UI');
assert.ok(!cloud.includes('Storage.prototype.setItem')&&!cloud.includes('const originalSet=Storage.prototype.setItem'),'cloud module does not patch the global Storage prototype');
assert.ok(ui.includes('window.TowerboundCloud?.queueSave?.()'),'game save explicitly queues cloud synchronization');
assert.ok(ui.includes('title="Авто-бой не учитывает синергии карт и яды"'),'auto battle button explains the limitations of the simplified simulation');
assert.ok(ui.includes('data-action="cloud-sync"')&&ui.includes('data-action="cloud-account"'),'settings screen exposes cloud account and manual sync controls');
assert.ok(cloud.includes("const AUTH_EMAIL_DOMAIN='towerbound.com'")&&cloud.includes("const authEmail=login=>String(login||'').trim().toLowerCase()+'@'+AUTH_EMAIL_DOMAIN"),'new game logins map to a valid .com synthetic Supabase email');
assert.ok(cloud.includes("email:authEmail(clean)")&&cloud.includes("legacy=await withTimeout(client.auth.signInWithPassword({email:clean+'@towerbound.game'"),'sign-in uses the new email, bounded timeout and legacy .game fallback');
assert.ok(cloud.includes("email:authEmail(clean)")&&cloud.includes("client.auth.signUp({email:authEmail(clean)"),'registration and login share the new synthetic email domain');
assert.ok(cloud.includes('Неверный логин или пароль')&&cloud.includes('Ошибка регистрации. Попробуйте другой логин')&&cloud.includes('Этот логин уже занят')&&cloud.includes('Пароль должен быть не менее 6 символов'),'Supabase auth errors are translated to Russian');
assert.ok(cloud.includes('#tbCloudMessage[data-kind="error"]')&&cloud.includes('id="tbCloudHint"')&&cloud.includes('Зарегистрироваться'),'login errors are red and registration guidance is visible');
assert.ok(!cloud.includes("overlay.classList.add('open','login-required')")&&cloud.includes('const showLoginGate=(force=false)'), 'startup keeps the login flow in the character screen instead of covering it with a modal');
assert.ok(cloud.includes("const rememberKey='tb-remember-me'"),'remember-me preference is persisted');
assert.ok(cloud.includes('id="tbCloudRememberMe"')&&!cloud.includes('id="rememberMe"'),'cloud modal uses a distinct remember checkbox ID from the main login form');
assert.ok(cloud.includes("if(active&&!remembered())"),'unremembered sessions are cleared at startup');
assert.ok(ui.includes('Зелье исцеления')&&ui.includes('Материал для крафта')&&ui.includes('itemDisplayName'),'inventory item IDs are localized even when an item has its raw ID as name');
assert.ok(ui.includes('function stoneDescription(stone)')&&ui.includes('data-inspect-stone')&&ui.includes('data-extract-gem'),'gem description helper, inspect action and extraction action are available');
assert.ok(engine.includes('function socketStone')&&engine.includes('item.installedGems.push(gem)')&&engine.includes('character.bag=character.bag.filter(entry=>entry.id!==stoneId)'),'socket insertion must install and consume the stone');
assert.ok(engine.includes('function extractGem')&&engine.includes('character.bag.push(returned)'),'socket extraction must return the stone to inventory');
assert.ok(gems.stone_types.length>0&&gems.stone_types.every(stone=>typeof stone.name==='string'&&typeof stone.description==='string'&&stone.description.length>0),'stone catalog must provide names and clear stat descriptions');
assert.ok(ui.includes('evasion')&&ui.includes('toFixed(1)'),'equipment comparison formats crit and evasion as percentages');
assert.ok(css.includes('overflow-x:auto')&&css.includes('word-break:normal')&&css.includes('-webkit-overflow-scrolling:touch'),'mobile profile wrapping and swipe tabs are configured');
assert.ok(online.includes('function publishCurrent()'),'online publishing remains available');

assert.ok(cloud.includes('authEmail(clean)')&&cloud.includes('signInWithPassword')&&cloud.includes('signUp'),'username/password Supabase authentication is wired');
assert.ok(cloud.includes("$('#tbCloudSignIn').addEventListener('click',async()=>{try{say('Входим в игру…');await signIn(")&&cloud.includes("$('#tbCloudSignUp').addEventListener('click',async()=>{try{say('Создаём игровой аккаунт…');await signUp("),'cloud login dialog and profile account form share the same auth functions');
assert.ok(cloud.includes("const rememberKey='tb-remember-me'")&&cloud.includes("if(active&&!remembered())"),'remember-me session gate is enforced at startup');
assert.ok(engine.includes('function insertGem')&&engine.includes('openSockets<=installedSource.length'),'gem insertion checks available sockets');
assert.ok(engine.includes('const stone=character.bag.find(entry=>entry&&entry.id===stoneId&&entry.type==="enhancement_stone")'),'gem insertion requires a stone in inventory');
assert.ok(engine.includes('item.installedGems.push(gem)')&&engine.includes('character.bag=character.bag.filter(entry=>entry.id!==stoneId)'),'gem insertion installs the gem and consumes its inventory item');
assert.ok(engine.includes('function socketStone(characterId,itemId,stoneId){return insertGem(characterId,itemId,stoneId);}'),'legacy socket API remains compatible');
assert.ok(ui.includes('engine.insertGem(c.id,target.dataset.stoneItem,target.dataset.stoneChoice)')&&ui.includes('data-stone-choice=')&&ui.includes('data-stone-item='),'equipment UI passes the selected stone and target item through the hardened gem insertion API');
assert.ok(ui.includes('t.description.trim()')&&ui.includes('tb-stone-description'),'stone descriptions are displayed from the catalog in the inventory');
assert.ok(ui.includes('function installedGemsOf')&&ui.includes('data-extract-gem'),'installed gems render and can be extracted');
assert.ok(ui.includes('rarityPrefixes')&&ui.includes('itemDisplayName(item)'),'equipment rarity prefixes are not repeated in item names');
assert.ok(ui.includes('critical_chance')&&ui.includes('evasion_chance'),'percentage formatting covers normalized crit and evasion keys');
assert.ok(css.includes('flex:1 1 0')&&css.includes('hyphens:none')&&css.includes('touch-action:pan-x'),'iPhone item cards, profile names and swipe tabs have explicit mobile rules');


const core=require('../rpg-rework-v2.js');
const classConfig=JSON.parse(fs.readFileSync('configs/balance/classes.json','utf8'));
function gemEngine(overrides={}){
 const hero={id:'gem-test-hero',classId:'dragonkin',branch:'fire_dragon',
  gear:[{id:'gem-test-sword',slot:'weapon',socketsAvailable:1,sockets:[],installedGems:[]}],
  bag:[{id:'gem-test-ruby',type:'enhancement_stone',level:1,stoneType:{id:'dragonkin.fire_dragon.weapon',class_id:'dragonkin',branch_id:'fire_dragon',slot:'weapon',name:'Рубин',fire_damage_per_level:.05,description:'+5% к урону огнём'}}],
  ...(overrides.hero||{})};
 return{hero,engine:core.createEngine({combat:{},xp_curve:{},map:{},classes:classConfig,mobs:{}},{state:{account:{},characters:[hero],activeCharacterId:hero.id}})};
}
{
 const {hero,engine}=gemEngine();
 engine.insertGem(hero.id,'gem-test-sword','gem-test-ruby');
 assert.equal(hero.gear[0].installedGems.length,1,'insertGem stores the installed gem');
 assert.equal(hero.gear[0].installedGems[0].stoneType.fire_damage_per_level,.05,'installed gem retains its stats');
 assert.equal(hero.bag.some(item=>item.id==='gem-test-ruby'),false,'insertGem consumes the bag stone');
 const returned=engine.extractGem(hero.id,'gem-test-sword',0);
 assert.equal(returned.type,'enhancement_stone','extractGem returns a usable stone');
 assert.equal(hero.gear[0].installedGems.length,0,'extractGem frees the socket');
 assert.equal(hero.bag.some(item=>item.id===returned.id),true,'extracted stone returns to inventory');
}
{
 const {hero,engine}=gemEngine({hero:{gear:[{id:'gem-test-sword',slot:'weapon',socketsAvailable:0,sockets:[],installedGems:[]}]}});
 assert.throws(()=>engine.insertGem(hero.id,'gem-test-sword','gem-test-ruby'),/Нет свободного гнезда/,'insertGem rejects a full item');
}
{
 const {hero,engine}=gemEngine({hero:{bag:[]}});
 assert.throws(()=>engine.insertGem(hero.id,'gem-test-sword','missing-stone'),/Камень отсутствует/,'insertGem requires a bag stone');
}
{
 const {hero,engine}=gemEngine({hero:{bag:[{id:'wrong-branch',type:'enhancement_stone',stoneType:{class_id:'dragonkin',branch_id:'ice_dragon',slot:'weapon'}}]}});
 assert.throws(()=>engine.insertGem(hero.id,'gem-test-sword','wrong-branch'),/не подходит к текущей специализации/,'insertGem rejects another specialization');
}
{
 const {hero,engine}=gemEngine({hero:{bag:[{id:'armor-stone',type:'enhancement_stone',stoneType:{class_id:'dragonkin',branch_id:'fire_dragon',slot:'armor'}}]}});
 assert.throws(()=>engine.insertGem(hero.id,'gem-test-sword','armor-stone'),/предназначен только для брони/,'insertGem rejects armor stones in weapons');
}

console.log('Online services static and gem runtime checks: OK');

// iPhone UI regression coverage: scroll restoration, translations, skill bar and account auth.
assert.ok(ui.includes('function renderWithScrollSave()'),'render must preserve scroll position');
assert.ok(ui.includes('renderView();')&&ui.includes('requestAnimationFrame(restore)'),'scroll restored after DOM replacement');
assert.ok(ui.includes("Card-first combat: legacy skill catalogue is not loaded into the active UI."),'active battle uses card-first combat rather than obsolete attack-speed skill labels');
assert.ok(ui.includes('c.activeSkills=chosen')&&ui.includes('slice(0,6)'),'active skills capped at six');
assert.ok(ui.includes('data-replace-skill')&&ui.includes('Все 6 слотов заняты'),'skill replacement dialog missing');
assert.ok(ui.includes('humanSkillDescription')&&ui.includes('особенность класса'),'technical skill tags translated');
assert.ok(css.includes('word-break:keep-all')&&css.includes('overflow-wrap:normal')&&css.includes('hyphens:none'),'quest cards preserve word wrapping');
assert.ok(css.includes('safe-area-inset-top')&&css.includes('padding-top:max(20px'),'notch safe area CSS missing');
assert.ok(ui.includes('id="tbAccountLogin"')&&ui.includes('id="tbAccountPassword"')&&ui.includes('Запомнить меня'),'account login form missing');
assert.ok(ui.includes('data-action="account-login"')&&ui.includes('data-action="account-register"')&&ui.includes('data-action="account-logout"')&&ui.includes('data-action="account-sync"'),'account actions missing');
assert.ok(cloud.includes('async function signIn(login,password')&&cloud.includes('async function signUp(login,password')&&cloud.includes('async function signOut()'),'Supabase auth API missing');
assert.ok(cloud.includes('signIn,signUp,signOut'),'Supabase auth API not exported');
const characterHeader=ui.slice(ui.indexOf('function header'),ui.indexOf('function characterList'));
const characterGate=ui.slice(ui.indexOf('function characterList'),ui.indexOf('function createDialog'));
assert.ok(!characterHeader.includes('data-action="cloud-account"')&&!characterHeader.includes('tb-account-button'),'character selection header has no redundant account button');
assert.ok(characterGate.includes('cloud?.signedIn')&&characterGate.includes('Вход в игру')&&characterGate.includes('id="login"')&&characterGate.includes('id="pass"')&&characterGate.includes('id="rememberMe"'),'empty unauthenticated character state renders the centered login form');
assert.ok(characterGate.includes('data-action="empty-login"')&&characterGate.includes('data-action="empty-register"')&&characterGate.includes('Зарегистрироваться'),'embedded login and registration actions are present');
assert.ok(characterGate.includes('СОЗДАТЬ ПЕРВОГО ПЕРСОНАЖА'),'authenticated empty state has its primary create action');
assert.ok(ui.includes('Сначала войди в игровой аккаунт'),'new-character action is guarded by Supabase session');
assert.ok(ui.includes('towerbound-auth-change')&&ui.includes('cloud.signIn(login,password,remember)'),'successful auth refreshes the character screen');
assert.ok(cloud.includes('await onSession(data.session)')&&cloud.includes("new Event('towerbound-auth-change')"),'Supabase sign-in awaits cloud restore and emits auth state changes');

assert.ok(cloud.includes('let sessionTask=Promise.resolve()')&&cloud.includes('if(sessionKey===handledSessionKey)return sessionTask')&&cloud.includes('return sessionTask;'),'duplicate Supabase auth events await the same cloud-restore promise');
assert.ok(!progression.includes("tb-progression-button")&&progression.includes("window.TowerboundProgression={open:"),'progression is exposed through the account instead of a global header button');
assert.ok(css.includes('white-space:nowrap')&&!css.includes('tb-progression-button')&&css.includes('height:39px!important')&&css.includes('height:34px!important'),'iPhone header preserves the original logo size and removes the progression button');
assert.ok(/progression-24\.js\?v=\d+/.test(html)&&/towerbound-cloud\.js\?v=\d+/.test(html)&&/styles\.css\?v=\d+/.test(html),'updated progression, cloud and UI styles bypass stale browser cache');
assert.ok(cloud.includes("overlay.style.visibility='visible'")&&cloud.includes('conflict=true;savesReady=false;setStatus')&&cloud.includes("overlay.classList.add('open')"),'cloud save conflicts remain visible for source selection');
assert.ok(cloud.includes('signInWithPassword({email:authEmail(clean)'),'sign-in uses the current virtual login email');
assert.ok(cloud.includes('Успешный вход. Создайте персонажа'),'empty cloud account gives first-character guidance');
assert.ok(css.includes('tb-login-gate')&&css.includes('white-space:nowrap')&&css.includes('@media(max-width:400px)'),'centered login and narrow mobile header styles are present');

