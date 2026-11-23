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
  ['function currentSeason()', 'monthly season source'],
  ['t.seasonModifier=season.modifier', 'season modifier is locked per run'],
  ['eliteChance=Math.min(.8', 'season doubles elite spawn chance'],
  ['modifier.id===\'cursed_levels\'', 'cursed floor effect'],
  ['boss_no_potion', 'seasonal boss potion restriction'],
  ['reward_xp_multiplier', 'seasonal tower XP rewards'],
  ['reward_silver_multiplier', 'seasonal tower silver rewards'],
  ['Сезон \'+(season.id+1)', 'season displayed in tower UI'],
  ['function startTower()', 'Endless Tower entry'],
  ['(c.level||0)<50', 'Tower unlock at character level 50'],
  ['engine.stagePlan(s.character,10)', 'stage 10 base enemy stats'],
  ['engine.getEnemyStats(s.character.id,10', 'stage 10 enemy stat lookup'],
  ['Math.pow(1.05,Math.max(0,floor-1))', '5% scaling starts after the base floor'],
  ['eliteChance=Math.min(.8', 'season-adjusted elite spawn chance'],
  ['normalLimit=1-eliteChance-.1', 'normal, elite and boss encounter distribution'],
  ['function claimTowerRewards(t)', 'Tower reward banking'],
  ['t.rewards.silver+=Math.round((100+b.floor*25)*(Number(modifier.reward_silver_multiplier)||1))', 'season-scaled Tower silver rewards'],
  ['t.rewards.diamonds+=1', 'one diamond every ten floors'],
  ['engine.awardXp(c,xp)', 'Tower XP payout on exit'],
  ['function renderCommunity(tab=\'home\')', 'shared community renderer'],
  ['function renderGuild()', 'rebuilt Guild view'],
  ['function renderPass()', 'rebuilt Pass view'],
  ['eg-endgame-grid', 'rebuilt Endgame dashboard'],
  ['function passState()', 'Battle Pass lifecycle'],
  ['30*DAY', '30-day pass duration'],
  ['Math.min(5000', '50-level BP cap'],
  ['Array.from({length:10},(_,i)=>(i+1)*5)', 'ten five-level Battle Pass reward milestones'],
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
  ['data-eg="back-map"', 'back to map control'],
  ['grid-template-columns:repeat(3,minmax(0,1fr))', 'mobile menu grid'],
  ['max-width:330px', 'narrow phone layout']
].forEach(([needle,label]) => has(source,needle,label));
assert.match(html, /<script src="\.\/endgame-systems\.js\?v=222"><\/script>/, 'endgame script cache version');
assert.ok(!source.includes('Эволюция')&&!source.includes('open-evolution')&&!source.includes('evolveSkill('),'skill evolution removed');
assert.ok(!combat.includes('evolvedSkill')&&!combat.includes('getSkillEvolution')&&!combat.includes('armorPenetration')&&!combat.includes('evolved?evolved.icon'),'combat evolution effects removed');
assert.ok(source.includes('delete data.evolution'),'legacy evolution save data is discarded');
assert.ok(source.includes('</button></nav><main>'),'Endgame modal navigation closes before content');
assert.ok(source.includes("view=battle&&tab==='guild'"),'guild fight stays visible in community panel');
assert.match(html, /<script src="\.\/rpg-rework-ui\.js\?v=[^"]+"><\/script>/, 'combat UI must be loaded with a cache-busted URL');
console.log('Endgame systems static checks: OK');

[
['class="eg-primary-nav"', 'endgame modal has a compact three-section navigation'],
['soc-boss-card', 'Guild uses the redesigned shared community boss card'],
['soc-pass-milestone', 'Battle Pass uses the redesigned shared community reward milestones'],
['soc-endgame-link', 'Endgame uses the redesigned shared community activity list'],
['soc-metric-grid', 'Endgame sections share the community metrics card system']
].forEach(([needle,label]) => has(source,needle,label));
