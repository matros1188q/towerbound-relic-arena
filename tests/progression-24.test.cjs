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
 ['bulk potions',/for\(let i=0;i<10;i\+\+\)/],['configured potion SKU',/heal_25/],['x3 farm',/farmSpeed=live\(\)\.progression\?\.speed3\?3:1/],
 ['offline silver',/h\*100/],['authenticated cloud sync',/await cloud\.syncNow\(\)/],
 ['push permission',/Notification\.requestPermission/],['hardcore telegraphs',/disable_telegraphs/],
 ['language',/tb-progression-lang/],['energy saving',/tbp-low-effects/],
 ['elite notes',/enemy\.type==='elite'/],['chapter palette',/palettes=\[/],['secret room chance',/Math\.random\(\)<\.01/]
])assert.match(name==='x3 farm'||name==='cooldown reduction'?ui:fx,re,name);
assert.match(fx,/engine\.purchase\(c\.id,'silver','heal_25'\)/);assert.doesNotMatch(fx,/heal_40/);
assert.ok(html.includes('./progression-24.js?v=11'));assert.match(fx,/localStorage\.setItem\('tb-rpg-v2'/);assert.match(fx,/slot:slot==='weapon'\?0:2/);assert.match(fx,/engine\.purchase\(c\.id,'silver','heal_25'\)/);assert.match(ui,/c\.progression\.skillMastery\[skill\.id\]=mastery/);
assert.match(fx,/choice===null\)\{toast\('Выбор дара отменён'\);return result\}/,'cancelling the reincarnation reward must not silently grant the first gift');assert.match(fx,/!Number\.isInteger\(n\)\|\|n<0\|\|n>=gifts\.length/,'invalid reincarnation reward selection must not silently grant a default gift');assert.doesNotMatch(fx,/tb-progression-cloud-draft/);assert.match(fx,/if\(lang==='en'\)for\(const \[ru,en\] of translations\)overlay\.innerHTML=/,'English translations run after the active tab markup is rendered');
assert.match(fx,/settings\.disable_telegraphs\?'Включить':'Отключить'/,'telegraph button label reflects the shared game setting');assert.match(fx,/settings\.disable_particles\?'Включить частицы':'Отключить частицы'/,'particle button label reflects the shared game setting');assert.match(fx,/const disabled=!\(engine\.state\.account\.settings\|\|\{\}\)\.disable_telegraphs/,'telegraph action toggles the shared setting');assert.match(fx,/const disabled=!\(engine\.state\.account\.settings\|\|\{\}\)\.disable_particles/,'particle action toggles the shared setting');
const core=fs.readFileSync(path.join(__dirname,'../rpg-rework-v2.js'),'utf8');assert.match(core,/progression\.runewords.*word\.health/);assert.match(core,/permanentXpBonus/);console.log('Progression systems static checks passed.');
