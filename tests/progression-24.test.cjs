'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ui=fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.js'),'utf8');
const fx=fs.readFileSync(path.join(__dirname,'../progression-24.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
for(const [name,re] of [
 ['skill mastery',/skillMastery/],['cooldown reduction',/Math\.max\(1,\(effect\.cooldown\|\|4\)-mastered\)/],
 ['mythic upgrade',/function mythic\(c\)/],['prestige',/function prestige\(c\)/],
 ['black market',/function market\(c,mode\)/],['slot crafting',/function craft\(c,slot\)/],
 ['rune words',/function runeword\(c\)/],['distinct rune effects',/Песнь войны.*Каменная клятва.*Живой источник/],['28-day calendar',/calendar/],
 ['bestiary',/v\.kills>=100/],['reincarnation',/Реинкарнация/],['stone exchange',/function exchange\(c\)/],
 ['best gear',/function equip\(c\)/],['inventory sorting',/function sort\(c\)/],['grey salvage',/function salvage\(c\)/],
 ['bulk potions',/for\(let i=0;i<10;i\+\+\)/],['x3 farm',/farmSpeed=live\(\)\.progression\?\.speed3\?3:1/],
 ['offline silver',/h\*100/],['cloud placeholder',/tb-progression-cloud-draft/],
 ['push permission',/Notification\.requestPermission/],['hardcore telegraphs',/disable_telegraphs/],
 ['language',/tb-progression-lang/],['energy saving',/tbp-low-effects/],
 ['elite notes',/enemy\.type==='elite'/],['chapter palette',/palettes=\[/],['secret room chance',/Math\.random\(\)<\.01/]
])assert.match(name==='x3 farm'||name==='cooldown reduction'?ui:fx,re,name);
assert.match(html,/progression-24\.js\?v=1/);
const core=fs.readFileSync(path.join(__dirname,'../rpg-rework-v2.js'),'utf8');assert.match(core,/progression\.runewords.*word\.health/);assert.match(core,/permanentXpBonus/);console.log('Progression systems static checks passed.');
