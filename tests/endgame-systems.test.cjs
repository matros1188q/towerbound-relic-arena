'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('endgame-systems.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const combat=fs.readFileSync('rpg-rework-ui.js','utf8');
for(const marker of [
 'function startTower()','Math.pow(1.05','function finishEncounter(won)',
 'function guildState()','maxHp:1000000','respawnAt:Date.now()+DAY',
 'function helpGuild()','function renderPass()','function buyPass()',
 'const freeRewards=','const premiumRewards=','function evolveSkill(',
 'skillUses','function trackSkillUse','data-eg-record','tbTowerMapBtn','getSkillEvolution:id=>data.evolution[player()?.id]?.[id]||null','const freeRewards={5:[\'silver\']','const premiumRewards={5:[\'chest\']'
])assert.ok(source.includes(marker),'missing endgame feature: '+marker);
assert.match(source,/if\(c\.level<50\)throw Error\('Эволюция доступна с 50 уровня персонажа'\)/);
assert.match(combat,/evolvedSkill\?\.id==="pierce"\)damage\*=1\.4/);
assert.match(combat,/effect\.type==="aoe"\|\|evolvedSkill\?\.id==="burst"/);
assert.match(source,/if\(result\?\.stageComplete\)addBP\(10\)/);
assert.match(source,/addBP\(15\)/);
assert.match(source,/Math\.pow\(1\.05,Math\.max\(0,floor-1\)\)/);
assert.match(source,/g\.helpDay===dayKey\(\)/);
assert.match(source,/g\.respawnAt&&Date\.now\(\)>=g\.respawnAt/);
assert.ok(html.includes('<script src="./endgame-systems.js?v=2"></script>'),'endgame script must load');
assert.match(source,/@media\(max-width:430px\)/,'mobile layout rules must exist');
console.log('Endgame systems static checks: OK');
