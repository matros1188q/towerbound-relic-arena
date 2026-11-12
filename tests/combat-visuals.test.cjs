'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ui=fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.js'),'utf8');
const core=fs.readFileSync(path.join(__dirname,'../rpg-rework-v2.js'),'utf8');
const fx=fs.readFileSync(path.join(__dirname,'../combat-visuals.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.css.js'),'utf8');
const battleDom=ui.slice(ui.indexOf('function updateBattleDOM'),ui.indexOf('function ensureBottomNav'));
for(const [name,source,re] of [
['two-layer parallax',fx,/tb-back-parallax[\s\S]*tb-front-parallax/],
['hit spark',fx,/tb-hit-spark/],['boss intro',fx,/tb-boss-intro/],['low hp vignette',fx,/tb-low-hp/],
['death dissolve',fx,/tb-mob-death/],['ready skill pulse',fx,/tb-skill-ready/],['weather chapters',fx,/Math\.floor\(\(stage-1\)\/50\)/],
['status popups',fx,/tb:combat-status/],['profile idle',fx,/tb-hero-idle/],['colored hp',fx,/w>60[\s\S]*w>25/],
['ultimate dim overlay',fx,/tb-fx-ultimate/],['overkill bonus',core,/flags\.overkillBonus\?1\.1:1/],
['element inference',ui,/elementHint\.includes\("fire"\)[\s\S]*elementHint\.includes\("water"\)[\s\S]*elementHint\.includes\("lightning"\)/],
['skill icon uses skill asset then class fallback',ui,/const icon=evolved\?evolved\.icon:skill\?\.icon[\s\S]*const kind=\(\{assassin:"skill-poison",bishop:"skill-arcane",dragonkin:"skill-fire",destroyer:"skill-phys",elemental:"skill-arcane",duelist:"skill-phys",shaman:"skill-arcane"\}/],
['route click delegation',ui,/\[data-route\]/],
['post-battle summary button says Finish',ui,/data-loot-continue[^\n]*ЗАВЕРШИТЬ/],
['post-battle summary returns to map without starting a stage',ui,/if\(target\.dataset\.lootContinue!==undefined\)\{postBattleSummary=null;screen="map";save\(\);render\(\);return;\}/],
['map nodes show rising recommended battle power',ui,/tb-map-power[^\n]*Рек\. Мощь/],
['skills are filtered to the chosen specialization and base skills',ui,/skills\.filter\(x=>x\.class_id===c\.classId&&x\.branch_id===c\.branch\)/],
['skill cards expose type, damage, cost and cooldown details',ui,/function profileSkillDetails[\s\S]*Тип:[\s\S]*Стоимость:[\s\S]*Откат:/],
['talent cards explain stat gains and current rank',ui,/function talentBonusDescription[\s\S]*Каждый ранг даёт/],
['weekly tasks have localized heading',ui,/ЕЖЕНЕДЕЛЬНЫЕ ЗАДАНИЯ/],
['weekly rows show their detailed condition text',ui,/q\.description/],
['weekly reward confirmation uses Russian wording',ui,/Еженедельное задание: награда получена/],
['achievement cards show localized metric labels and explicit progress',ui,/a\.metric_label\|\|"Показатель"[\s\S]*Прогресс:/],
['achievement rewards include silver and diamonds in localized text',ui,/Награда:.*rewardLabel/],
['talent cards identify the improved stat and current rank',ui,/Повышает.*Ранг.*maxRank/],
['talent descriptions explain per-rank and accumulated stat bonuses',ui,/function talentBonusDescription[\s\S]*Увеличивает силу базовых ударов[\s\S]*Каждый ранг даёт[\s\S]*Текущий бонус:/],
['branch skills preserve passive/active type and are restricted to current branch',ui,/skills\.filter\(x=>x\.class_id===c\.classId&&x\.branch_id===c\.branch\)[\s\S]*type:x\.type\|\|\(x\.is_active===false\?"passive":"active"\)/],
['all seven classes have detailed specialization descriptions',ui,/const specializationDescriptions=\{[\s\S]*assassin:\{[\s\S]*bishop:\{[\s\S]*dragonkin:\{[\s\S]*destroyer:\{[\s\S]*elemental:\{[\s\S]*duelist:\{[\s\S]*shaman:\{/],
['map header removes portrait/progression header content',ui,/function header\(title,sub\)\{const mapHeader=title===\"Карта 250 уровней\"/],
['Duelist dual blade specialization has detailed combat description',ui,/dual_swords:\"Фокус на высоком темпе атак/],
['loot button is labeled Finish',ui,/data-loot-continue[^\n]*ЗАВЕРШИТЬ/],
['loot action closes summary and returns to map without starting a new stage',ui,/if\(target\.dataset\.lootContinue!==undefined\)\{postBattleSummary=null;screen="map";save\(\);render\(\);return;\}/],
['battle DOM finds the V2 arena wrapper',battleDom,/root\.querySelector\("\.v2-battle-wrap"\)/],
['battle DOM updates V2 skill buttons',battleDom,/arena\.querySelectorAll\("\.v2-skill-btn\[data-panel-slot\]"\)/],
['battle DOM updates V2 enemy cards',battleDom,/arena\.querySelectorAll\("\.v2-enemy-card\[data-target\]"\)/],
['battle DOM no longer queries legacy arena, skill or target selectors',battleDom,/^((?!\.tb-arena|\.tb-panel-skill|\.tb-target-card)[\s\S])*$/],
['Attack control is high-contrast and at least 54px',css,/\.v2-btn-attack\{display:flex!important[\s\S]*?min-height:54px!important[\s\S]*?background:linear-gradient\(180deg,#f08a32,#bc4e22\)!important/],
['End Turn remains displayed with at least 48px height',css,/\.v2-btn-end\{display:flex!important[\s\S]*?min-height:48px!important[\s\S]*?visibility:visible!important/],
['map top padding and compact header image cap',css,/\.tb-map-screen\{padding-top:10px!important\}[\s\S]*?\.tb-map-top img\{max-height:80px!important/],
['enemies use a fixed two-column grid with wrapped intents',css,/\.v2-enemies-side\{display:grid!important;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important;gap:8px!important;align-content:start!important;width:100%!important[\s\S]*?\.v2-enemy-intent\{white-space:normal!important;word-break:break-word!important;font-size:9px!important;line-height:1\.2!important;text-align:center!important/],
['bag grid and readable square item tiles',css,/\.tb-item-grid\{display:grid!important;grid-template-columns:repeat\(4,1fr\)!important;gap:6px!important\}[\s\S]*?\.tb-bag-item\{min-height:80px!important;max-height:100px!important;aspect-ratio:1\/1!important;padding:4px!important[\s\S]*?\.tb-item-tile-open span,#tbRpg \.tb-v2 \.tb-item-tile-open small\{display:block!important;font-size:9px!important;white-space:normal!important/],
['collection cards use compact five-column square grid',css,/\.tb-collection-grid\{display:grid!important;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important;gap:4px!important;width:100%!important[\s\S]*?\.tb-collection-item\{aspect-ratio:1\/1!important;min-height:60px!important;max-height:70px!important;padding:2px!important;overflow:hidden!important[\s\S]*?\.tb-collection-item b,#tbRpg \.tb-v2 \.tb-collection-item small,#tbRpg \.tb-v2 \.tb-collection-item span\{font-size:8px!important/],
['checkpoint heal gating preserved',ui,/healReady=balance\.map\.checkpoints\.includes\(cp\)&&c\.run\.healingPenaltyUntil/],
['poison status',ui,/ОТРАВЛЕН/],
['elemental steam',ui,/ПАР · ОГЛУШЕНИЕ/],['electric shock',ui,/ЭЛЕКТРОШОК/],['boss interrupt',ui,/ПРЕРВАНО/],
['boss rage',ui,/bossTurns>15/],
['phase-four boss deadline is two completed player turns',ui,/if\(phase===4\)battle\.bossDeadlineTurns=\(battle\.playerTurnCount\|\|0\)\+1/],
['phase-four boss deadline uses strict timeout and lethal 9999 damage',ui,/playerTurnCount>Number\(battle\.bossDeadlineTurns\)[\s\S]{0,240}playerHp=Math\.max\(0,c\.run\.playerHp-9999\)/],['heroic mutations',ui,/mutation==="vampirism"/],['speedrun',ui,/speedrun/],
['companion strike',ui,/stats\.attack\*\.5/],['antidote trap',ui,/type==="antidote"/],['branch route',ui,/data-route="elite"/]
])assert.match(source,re,name);
console.log('Combat visual/tactical static checks passed.');

assert.ok(css.includes('.tb-map-screen{padding-top:0!important}'),'map screen has no extra top padding');
assert.ok(css.includes('.v2-enemies-side{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important'),'enemy target cards use a stable two-column grid');
assert.ok(css.includes('.tb-item-grid{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:6px!important}'),'bag uses a four-column grid');
assert.ok(css.includes('.tb-collection-grid{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important'),'collection uses a five-column grid');
assert.ok(css.includes('.tb-map-screen{padding-top:0!important}'),'map has no extra top padding after the header');
assert.ok(css.includes('.tb-map-top img{max-height:80px!important'),'map header character art is capped at 80px');
assert.ok(ui.includes('const mapHeader=title==="Карта 250 уровней"')&&!ui.includes('ПРОГРЕССИЯ'),'map header has no redundant Progression button or avatar panel');
