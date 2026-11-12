'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ui=fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.js'),'utf8');
const core=fs.readFileSync(path.join(__dirname,'../rpg-rework-v2.js'),'utf8');
const fx=fs.readFileSync(path.join(__dirname,'../combat-visuals.js'),'utf8');
for(const [name,source,re] of [
['two-layer parallax',fx,/tb-back-parallax[\s\S]*tb-front-parallax/],
['hit spark',fx,/tb-hit-spark/],['boss intro',fx,/tb-boss-intro/],['low hp vignette',fx,/tb-low-hp/],
['death dissolve',fx,/tb-mob-death/],['ready skill pulse',fx,/tb-skill-ready/],['weather chapters',fx,/Math\.floor\(\(stage-1\)\/50\)/],
['status popups',fx,/tb:combat-status/],['profile idle',fx,/tb-hero-idle/],['colored hp',fx,/w>60[\s\S]*w>25/],
['ultimate dim overlay',fx,/tb-fx-ultimate/],['overkill bonus',core,/flags\.overkillBonus\?1\.1:1/],
['element inference',ui,/elementHint\.includes\("fire"\)[\s\S]*elementHint\.includes\("water"\)[\s\S]*elementHint\.includes\("lightning"\)/],
['route click delegation',ui,/\[data-route\]/],
['checkpoint heal gating preserved',ui,/healReady=balance\.map\.checkpoints\.includes\(cp\)&&c\.run\.healingPenaltyUntil/],
['poison status',ui,/ОТРАВЛЕН/],
['elemental steam',ui,/ПАР · ОГЛУШЕНИЕ/],['electric shock',ui,/ЭЛЕКТРОШОК/],['boss interrupt',ui,/ПРЕРВАНО/],
['boss rage',ui,/bossTurns>15/],
['phase-four boss deadline is two completed player turns',ui,/if\(phase===4\)battle\.bossDeadlineTurns=\(battle\.playerTurnCount\|\|0\)\+1/],
['phase-four boss deadline uses strict timeout and lethal 9999 damage',ui,/playerTurnCount>Number\(battle\.bossDeadlineTurns\)[\s\S]{0,240}playerHp=Math\.max\(0,c\.run\.playerHp-9999\)/],['heroic mutations',ui,/mutation==="vampirism"/],['speedrun',ui,/speedrun/],
['companion strike',ui,/stats\.attack\*\.5/],['antidote trap',ui,/type==="antidote"/],['branch route',ui,/data-route="elite"/]
])assert.match(source,re,name);
console.log('Combat visual/tactical static checks passed.');
