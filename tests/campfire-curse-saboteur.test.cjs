'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createEngine } = require('../rpg-rework-v2.js');

const configDir = path.join(__dirname, '../configs/balance');
const balance = Object.fromEntries(fs.readdirSync(configDir).filter(file => file.endsWith('.json')).map(file => [
  file.slice(0, -5),
  JSON.parse(fs.readFileSync(path.join(configDir, file), 'utf8'))
]));
const makeEngine = () => createEngine(balance, {
  now: () => Date.UTC(2026, 10, 16),
  random: () => 0.999999
});

{
  const engine = makeEngine();
  const created = engine.createCharacter('Campfire Rest', 'assassin');
  const hero = engine.state.characters.find(character => character.id === created.id);
  hero.progress.highestEver = 10;
  hero.run.playerHp = Math.round(engine.maxHp(hero) * 0.45);
  const before = hero.run.playerHp;
  const maximum = engine.maxHp(hero);
  assert.equal(engine.canUseCampStop(hero.id, 10), true, 'cleared boss floors open a camp stop');
  const result = engine.useCampRest(hero.id, 10);
  assert.equal(result.restored, Math.min(maximum, before + Math.round(maximum * 0.3)) - before);
  assert.equal(hero.run.playerHp, Math.min(maximum, before + Math.round(maximum * 0.3)));
  assert.equal(engine.canUseCampStop(hero.id, 10), false, 'rest can be used only once at a checkpoint');
  assert.throws(() => engine.useCampRest(hero.id, 10), /уже использован|недоступен/i);
}

{
  const engine = makeEngine();
  const created = engine.createCharacter('Campfire Forge', 'bishop');
  const hero = engine.state.characters.find(character => character.id === created.id);
  hero.progress.highestEver = 50;
  assert.equal(engine.canUseCampStop(hero.id, 50), true, 'the 50-stage milestone also opens a camp');
  assert.deepEqual(engine.claimCampForge(hero.id, 50), { stage: 50, used: true });
  assert.equal(engine.canUseCampStop(hero.id, 50), false, 'forging consumes that checkpoint camp');
}

{
  const engine = makeEngine();
  const created = engine.createCharacter('Saboteur Spawn', 'shaman');
  const hero = engine.state.characters.find(character => character.id === created.id);
  const generatedRoles = [];
  for (let stage = 1; stage <= 100; stage++) {
    generatedRoles.push(...engine.stagePlan(hero, stage).mobs.map(mob => mob.role));
  }
  assert.ok(generatedRoles.includes('saboteur'), 'normal mob slots can be replaced with saboteurs');
  assert.ok(engine.stagePlan(hero, 10).mobs.every(mob => mob.role === 'boss'), 'saboteurs never replace bosses');
}

const ui = fs.readFileSync(path.join(__dirname, '../rpg-rework-ui.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../rpg-rework-ui.css.js'), 'utf8');
const worker = fs.readFileSync(path.join(__dirname, '../service-worker.js'), 'utf8');
const mobConfig = JSON.parse(fs.readFileSync(path.join(configDir, 'mobs.json'), 'utf8'));
assert.match(ui, /curse_wound:\{id:"curse_wound"[^\n]*type:"curse"/);
assert.match(ui, /curse_doubt:\{id:"curse_doubt"[^\n]*unplayable:true,endTurnPlayerWeak:1/);
assert.match(ui, /status_slime:\{id:"status_slime"[^\n]*type:"status"[^\n]*cost:1/);
assert.match(ui, /card\.id!=="status_slime"/, 'wound and other statuses cannot be played, slime can be discarded for energy');
assert.match(ui, /endTurnPlayerWeak/, 'Doubt weakens the player at turn end');
assert.match(ui, /role==="saboteur"/);
assert.ok(ui.includes('if(target.dataset.action==="open-camp"){if(engine.canUseCampStop(live().id,selectedStage))renderCampStopOverlay(selectedStage,"home");else notify("Привал на этом этапе уже использован или недоступен");return;}'), 'the dedicated camp button opens the camp overlay');
assert.ok(ui.includes('if(target.dataset.stage){const stage=Number(target.dataset.stage);if(stage<=live().progress.highestEver&&engine.canUseCampStop(live().id,stage)){selectedStage=stage;renderCampStopOverlay(stage,"home");return;}'), 'clicking a cleared checkpoint opens the camp overlay');
assert.match(ui, /function renderCampStopOverlay\(stage,view\)/);
assert.match(ui, /card\.isUpgraded\?' <b class="tb-card-upgrade-mark">\+<\/b>'/);
assert.match(ui, /data-camp-upgrade/);
assert.match(ui, /engine\.useCampRest/);
assert.match(ui, /engine\.claimCampForge/);
assert.match(ui, /data-deck-viewer/);
assert.match(ui, /function showDeckViewer/);
assert.match(ui, /playerHpRatioBeforeReward/);
assert.match(ui, /c\.run\.playerHp=carryOverHp/);
assert.match(ui, /c\.run\.snapshot\.hp=carryOverHp/);
assert.match(css, /\.tb-camp-overlay,\.tb-deck-viewer-overlay\{position:fixed;inset:0/);
assert.match(css, /\.tb-deck-viewer-overlay\{z-index:100000/);
assert.match(css, /\.tb-camp-overlay\{z-index:100050/);
assert.equal(mobConfig.roles.saboteur.icon, '🃏');
assert.equal(mobConfig.roles.saboteur_chance, 0.24);
assert.match(worker, /towerbound-v340/);
console.log('Campfire rest/forge, card curses/statuses, saboteur enemy and deck viewer checks passed.');
