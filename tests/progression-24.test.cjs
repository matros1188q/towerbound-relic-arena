'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ui=fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.js'),'utf8');
const fx=fs.readFileSync(path.join(__dirname,'../progression-24.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
for(const [name,re] of [
 ['skill mastery counter',/skillMastery/],
 ['mastery cooldown reduction',/Math\.max\(1,\(effect\.cooldown\|\|4\)-mastered\)/],
 ['mythic upgrade',/function mythic\(c\)/],
 ['prestige',/function prestige\(c\)/],
 ['black market',/function market\(c,mode\)/],
 ['slot crafting',/function craft\(c,slot\)/],
 ['rune words',/function runeword\(c\)/],
 ['28-day calendar',/calendar/],
 ['bestiary weakness threshold',/v\.kills>=100/],
 ['reincarnation gifts',/Реинкарнация/],
 ['stone exchange',/function exchange\(c\)/],
 ['best equipment',/function equip\(c\)/],
 ['inventory sorting',/function sort\(c\)/],
 ['grey salvage',/function salvage\(c\)/],
 ['bulk potions',/for\(let i=0;i<10;i\+\+\)/],
 ['x3 farm',/farm_speed_multiplier/],
 ['offline silver',/h\*100/],
 ['cloud save placeholder',/tb-progression-cloud-draft/],
 ['push permission',/Notification\.requestPermission/],
 ['hardcore telegraphs',/disable_telegraphs/],
 ['language toggle',/tb-progression-lang/],
 ['particle saving',/tbp-low-effects/],
 ['elite notes',/enemy\.type==='elite'/],
 ['chapter palettes',/palettes=\[/],
 ['secret room chance',/Math\.random\(\)<\.01/]
])assert.match(fx,name==='chapter palettes'?/palettes=\[/:re,name);
assert.match(ui,/farmSpeed=c\.progression\?\.speed3\?3:1/);
assert.match(html,/progression-24\.js\?v=1/);
console.log('Progression 24 static checks passed.');
