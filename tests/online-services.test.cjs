'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const sql=fs.readFileSync('supabase/migrations/202611090002_online_leaderboard_ghosts.sql','utf8');
const online=fs.readFileSync('towerbound-online.js','utf8');
const ui=fs.readFileSync('rpg-rework-ui.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const cloud=fs.readFileSync('towerbound-cloud.js','utf8');
const css=fs.readFileSync('rpg-rework-ui.css.js','utf8');
const engine=fs.readFileSync('rpg-rework-v2.js','utf8');
const serviceWorker=fs.readFileSync('service-worker.js','utf8');
const pwa=fs.readFileSync('juice-pwa.js','utf8');
const gems=JSON.parse(fs.readFileSync('configs/balance/equipment.json','utf8'));
assert.ok(serviceWorker.includes("const CACHE = 'towerbound-v24'"),'PWA cache version must advance on release');
assert.ok(serviceWorker.includes('self.skipWaiting()'),'new service worker must skip the waiting phase');
assert.ok(serviceWorker.includes('self.clients.claim()'),'new service worker must claim open pages');
assert.ok(serviceWorker.includes("request.mode === 'navigate'")&&serviceWorker.includes("url.pathname.endsWith('/index.html')"),'HTML documents must use the network-first branch');
assert.ok(serviceWorker.indexOf('fetch(request)')<serviceWorker.indexOf("caches.match(request).then(cached => cached || caches.match('./index.html'))"),'HTML network failure must fall back to cached content');
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
assert.ok(ui.includes('data-action="bottom-rating" data-nav-tab="leaderboard"'),'fixed bottom navigation leaderboard tab missing');
assert.ok(ui.includes('refreshOnlineLeaderboard()'),'leaderboard fetch action missing');
assert.ok(ui.includes('findGhost(c,engine)'),'real ghost matchmaking not wired');
assert.ok(ui.includes('Серверный рейтинг пока не начисляется'),'unsafe client result must not claim global rating');
assert.ok(html.includes('./towerbound-online.js?v=1'),'online module not loaded');
assert.ok(html.includes('./towerbound-cloud.js?v=11'),'cloud module cache is refreshed');
assert.ok(html.includes('./rpg-rework-v2.js?v=16'),'engine cache is refreshed for gem socket support');
assert.ok(html.includes('./rpg-rework-ui.js?v=29'),'profile and inventory UI cache is refreshed');
assert.ok(html.includes('./rpg-rework-ui.css.js?v=16'),'mobile profile stylesheet cache is refreshed');
assert.ok(cloud.includes('async function loadGame()'),'cloud module exposes a remote loadGame path');
assert.ok(cloud.includes('async function saveGame('),'cloud module exposes a versioned saveGame path');
assert.ok(cloud.includes('async function syncNow()'),'manual cloud sync is awaitable and reports failure');
assert.ok(cloud.includes("$('#tbCloudSyncNow').addEventListener('click',async()=>{try{await syncNow();"),'cloud overlay waits for confirmed remote save');
assert.ok(!cloud.includes("$('#tbCloudSyncNow').addEventListener('click',()=>{conflict=false;queueSave();"),'manual sync must not clear an unresolved conflict or claim background success');
assert.ok(cloud.includes("window.addEventListener('online',()=>{if(session&&!conflict)queueSave();});"),'offline saves are retried after connectivity returns');
assert.ok(cloud.includes('loadGame,saveGame,queueSave,syncNow'),'cloud save/load/sync APIs are public to the game UI');
assert.ok(ui.includes('data-action="cloud-sync"')&&ui.includes('data-action="cloud-account"'),'settings screen exposes cloud account and manual sync controls');
assert.ok(cloud.includes("return login+'@towerbound.game'"),'game login maps to the synthetic Supabase email');
assert.ok(cloud.includes("overlay.classList.add('open','login-required')"),'startup must block character selection until Supabase session is checked');
assert.ok(cloud.includes("const rememberKey='tb-remember-me'"),'remember-me preference is persisted');
assert.ok(cloud.includes("if(active&&!remembered())"),'unremembered sessions are cleared at startup');
assert.ok(ui.includes('Зелье исцеления')&&ui.includes('Материал для крафта')&&ui.includes('itemDisplayName'),'inventory item IDs are localized even when an item has its raw ID as name');
assert.ok(ui.includes('ОПИСАНИЕ КАМНЯ')&&ui.includes('ИЗВЛЕЧЬ КАМЕНЬ'),'gem descriptions and extraction are available');
assert.ok(engine.includes('function socketStone')&&engine.includes('item.installedGems.push(gem)')&&engine.includes('character.bag=character.bag.filter(entry=>entry.id!==stoneId)'),'socket insertion must install and consume the stone');
assert.ok(engine.includes('function extractGem')&&engine.includes('character.bag.push(returned)'),'socket extraction must return the stone to inventory');
assert.ok(gems.stone_types.length>0&&gems.stone_types.every(stone=>typeof stone.name==='string'&&typeof stone.description==='string'&&stone.description.length>0),'stone catalog must provide names and clear stat descriptions');
assert.ok(ui.includes('evasion')&&ui.includes('toFixed(1)'),'equipment comparison formats crit and evasion as percentages');
assert.ok(css.includes('overflow-x:auto')&&css.includes('word-break:normal')&&css.includes('-webkit-overflow-scrolling:touch'),'mobile profile wrapping and swipe tabs are configured');
assert.ok(online.includes('function publishCurrent()'),'online publishing remains available');

assert.ok(cloud.includes("return login+'@towerbound.game'")&&cloud.includes("signInWithPassword")&&cloud.includes("signUp"),'username/password Supabase authentication is wired');
assert.ok(cloud.includes("const rememberKey='tb-remember-me'")&&cloud.includes("if(active&&!remembered())"),'remember-me session gate is enforced at startup');
assert.ok(engine.includes('function insertGem')&&engine.includes('openSockets<=installedSource.length'),'gem insertion checks available sockets');
assert.ok(engine.includes('const stone=character.bag.find(entry=>entry&&entry.id===stoneId&&entry.type==="enhancement_stone")'),'gem insertion requires a stone in inventory');
assert.ok(engine.includes('item.installedGems.push(gem)')&&engine.includes('character.bag=character.bag.filter(entry=>entry.id!==stoneId)'),'gem insertion installs the gem and consumes its inventory item');
assert.ok(engine.includes('function socketStone(characterId,itemId,stoneId){return insertGem(characterId,itemId,stoneId);}'),'legacy socket API remains compatible');
assert.ok(ui.includes('engine.insertGem(c.id,item.id,stone.id)'),'equipment UI calls the hardened gem insertion API');
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
for(const [id,label] of Object.entries({attack:'Атака',health:'Здоровье',critical:'Крит',defense:'Защита',attack_speed:'Скорость'}))assert.ok(ui.includes(id+":'"+label+"'"),'talent label missing: '+id);
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
assert.ok(cloud.includes('signInWithPassword({email:clean+\'@towerbound.game\''),'sign-in uses the virtual login email');
assert.ok(cloud.includes('Успешный вход. Создайте персонажа'),'empty cloud account gives first-character guidance');
assert.ok(css.includes('tb-login-gate')&&css.includes('white-space:nowrap')&&css.includes('@media(max-width:400px)'),'centered login and narrow mobile header styles are present');

