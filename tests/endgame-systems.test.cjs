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
  ['Math.pow(1.05', '5% per-floor scaling'],
  ["floor%10===0?'boss':floor%5===0?'elite'", 'elite and boss cadence'],
  ['function claimTowerRewards(t)', 'tower reward banking'],
  ['engine.awardXp(c,xp)', 'tower XP payout on exit'],
  ['t.rewards.diamonds+=1', 'diamond reward per ten floors'],
  ['function passState()', 'Battle Pass lifecycle'],
  ['30*DAY', '30-day pass duration'],
  ['Math.min(5000', '50-level BP cap'],
  ['if(result?.stageComplete)addBP(10)', 'BP for regular stages'],
  ['addBP(15)', 'BP for Tower floors'],
  ['const freeRewards={5:[\'silver\']', 'free reward track'],
  ['const premiumRewards={5:[\'chest\']', 'premium reward track'],
  ['function guildState()', 'daily guild boss'],
  ['maxHp:1000000', 'one-million boss HP'],
  ['g.respawnAt=Date.now()+DAY', '24-hour respawn'],
  ['function helpGuild()', 'guild help action'],
  ['function awardGuildChest()', 'guild boss chest'],
  ['function evolveSkill(', 'skill evolution'],
  ['c.level<50', 'level 50 evolution gate'],
  ['uses>=100||mastery>=100', 'skill use/mastery evolution gate'],
  ['grid-template-columns:repeat(3,minmax(0,1fr))', 'mobile menu grid'],
  ['max-width:330px', 'narrow phone layout']
].forEach(([needle,label]) => has(source,needle,label));
[
  ['evolvedSkill?.id==="burst"', 'AoE skill evolution'],
  ['!options.ignoreArmor&&target.role==="tank"', 'armor bypasses armor guard'],
  ['!options.ignoreArmor&&target.shield>0', 'armor bypasses shield'],
  ['evolved?evolved.icon', 'evolved skill icon']
].forEach(([needle,label]) => has(combat,needle,label));
has(html,'<script src="./endgame-systems.js?v=5"></script>','endgame script inclusion');
console.log('Endgame systems static checks: OK');
