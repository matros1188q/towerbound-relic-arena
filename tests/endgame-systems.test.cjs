'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const source = fs.readFileSync('endgame-systems.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const combat = fs.readFileSync('rpg-rework-ui.js', 'utf8');
function has(text, needle, label) {
  assert.ok(text.includes(needle), 'missing ' + label + ': ' + needle);
}
[
  ['function startTower()', 'Endless Tower entry'],
  ["highestEver||0)<10", 'Tower unlock after stage 10'],
  ['engine.stagePlan(s.character,10)', 'stage 10 base enemy stats'],
  ['engine.getEnemyStats(s.character.id,10', 'stage 10 enemy stat lookup'],
  ['Math.pow(1.05,Math.max(1,floor))', '5% scaling per Tower floor'],
  ["roll<.7?'normal':roll<.9?'elite':'boss'", 'random enemy type'],
  ['function claimTowerRewards(t)', 'Tower reward banking'],
  ['t.rewards.silver+=Math.round(100+b.floor*25)', 'Tower silver rewards'],
  ['t.rewards.diamonds+=1', 'one diamond every ten floors'],
  ['engine.awardXp(c,xp)', 'Tower XP payout on exit'],
  ['function passState()', 'Battle Pass lifecycle'],
  ['30*DAY', '30-day pass duration'],
  ['Math.min(5000', '50-level BP cap'],
  ['Array.from({length:50}', '50 Battle Pass levels'],
  ['if(result?.stageComplete)addBP(10)', 'BP for regular stages'],
  ['addBP(15)', 'BP for Tower floors'],
  ["const freeRewards={5:['silver']", 'free reward track'],
  ["const premiumRewards={5:['chest']", 'premium reward track'],
  ['function guildState()', 'guild boss persistence'],
  ['hp:5000000,maxHp:5000000', '5-million guild boss HP'],
  ['g.respawnAt=Date.now()+DAY', '24-hour respawn'],
  ['100000+Math.random()*400000', 'daily help damage range'],
  ['function helpGuild()', 'guild help action'],
  ['function awardGuildChest()', 'guild boss chest'],
  ['function evolveSkill(', 'skill evolution'],
  ['c.level<50', 'level 50 evolution gate'],
  ['c.ext.evolvedSkills', 'evolution saved to character ext'],
  ['data-eg="back-map"', 'back to map control'],
  ['grid-template-columns:repeat(3,minmax(0,1fr))', 'mobile menu grid'],
  ['max-width:330px', 'narrow phone layout']
].forEach(([needle,label]) => has(source,needle,label));
[
  ['evolvedSkill?.id==="burst"', 'AoE skill evolution'],
  ['damage*=1.2', '20% AoE damage bonus'],
  ['armorPenetration:.5', '50% armor penetration'],
  ['armorPenetration=Math.max', 'armor penetration mitigation'],
  ['evolved?evolved.icon', 'evolved skill icon']
].forEach(([needle,label]) => has(combat,needle,label));
has(html,'<script src="./endgame-systems.js?v=9"></script>','endgame script cache version');
has(html,'<script src="./rpg-rework-ui.js?v=32"></script>','combat UI cache version');
console.log('Endgame systems static checks: OK');
