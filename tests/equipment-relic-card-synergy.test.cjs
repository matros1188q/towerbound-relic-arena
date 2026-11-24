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
const makeEngine = () => createEngine(balance, { now: () => Date.UTC(2026, 10, 16), random: () => 0.999999 });

const engine = makeEngine();
const created = engine.createCharacter('Synergy QA', 'assassin');
const hero = engine.state.characters.find(character => character.id === created.id);
assert.deepEqual(hero.relics, [], 'new characters start with an empty relic collection');

// Each equipped item carries a deterministic card id, and unequipping returns the item.
hero.bag.push(
  { id: 'synergy-staff', type: 'equipment', name: 'Посох испытателя', slot: 'weapon', weaponType: 'staff', rarity: 'Редкая', stats: { spellPower: 3 } },
  { id: 'synergy-mantle', type: 'equipment', name: 'Мантия испытателя', slot: 'chest', armorType: 'mantle', rarity: 'Редкая', stats: { defense: 3 } },
  { id: 'synergy-ring', type: 'equipment', name: 'Кольцо силы', slot: 'accessory', rarity: 'Редкая', stats: { attack: 3 } }
);
assert.equal(engine.equipItem(hero.id, 'synergy-staff').cardId, 'gear_staff_bolt');
assert.equal(engine.equipItem(hero.id, 'synergy-mantle').cardId, 'gear_evasion');
assert.equal(engine.equipItem(hero.id, 'synergy-ring').cardId, 'gear_power_surge');
assert.equal(engine.unequipItem(hero.id, 'weapon').cardId, 'gear_staff_bolt');
assert.equal(hero.gear[0], null, 'unequipping clears the slot');
assert.ok(hero.bag.some(item => item.id === 'synergy-staff'), 'unequipped item returns to the bag');

// Drops carry cardId before they enter a bag or become auto-equipped.
hero.level = 10;
hero.branch = balance.classes.classes.assassin.branches[0].id;
const dropped = engine.rollLoot(hero, { type: 'boss' }, 10, true, false);
const droppedEquipment = dropped.filter(item => item.type === 'equipment');
assert.ok(droppedEquipment.length > 0, 'the boss drop table produced equipment');
assert.ok(droppedEquipment.every(item => typeof item.cardId === 'string' && item.cardId.length > 0), 'each equipment drop declares its cardId');

// Relic shop charges exactly 300 silver and prevents duplicate ownership.
hero.silver = 500;
const purchased = engine.purchaseRelic(hero.id, 'steel_heart');
assert.equal(purchased.id, 'steel_heart');
assert.equal(hero.silver, 200);
assert.ok(hero.relics.includes('steel_heart'));
assert.throws(() => engine.purchaseRelic(hero.id, 'steel_heart'), /уже принадлежит/i);

// Starting relic passives are stored on the newly-created stage and apply once.
const effectsEngine = makeEngine();
const effectsHeroData = effectsEngine.createCharacter('Relic QA', 'bishop');
const effectsHero = effectsEngine.state.characters.find(character => character.id === effectsHeroData.id);
effectsHero.relics = ['bloodstone', 'steel_heart', 'greed', 'assassin_blade', 'scholar_lens', 'phoenix_feather', 'frost_sigil'];
const startPlan = effectsEngine.beginStage(effectsHero.id, 1);
assert.equal(startPlan.relicStartDamage, 5);
assert.equal(startPlan.relicStartingBlock, 10);
assert.equal(startPlan.relicHpPenalty, 0.1);
assert.equal(startPlan.relicFirstAttackMultiplier, 2);
assert.equal(startPlan.relicStartingDraw, 1);
assert.equal(startPlan.relicStartHeal, 5);
assert.equal(effectsHero.run.stage.relicStartHealApplied, true);
const hpAfterStart = effectsHero.run.playerHp;
effectsEngine.beginStage(effectsHero.id, 1);
assert.equal(effectsHero.run.playerHp, hpAfterStart, 're-entering an active stage does not reapply start-of-battle healing');

// A cleared boss offers three distinct unowned relics; a claimed relic is persisted with its checkpoint.
const bossEngine = makeEngine();
const bossHeroData = bossEngine.createCharacter('Boss Relic QA', 'assassin');
const bossHero = bossEngine.state.characters.find(character => character.id === bossHeroData.id);
bossHero.progress.highestEver = 9;
bossHero.progress.currentStage = 10;
const bossPlan = bossEngine.beginStage(bossHero.id, 10);
assert.ok(bossPlan.mobs.some(mob => mob.type === 'boss'), 'floor 10 contains its boss');
let bossResult;
for (let targetIndex = 0; targetIndex < bossPlan.mobs.length; targetIndex++) {
  bossResult = bossEngine.finishEnemy(bossHero.id, { targetIndex });
}
assert.equal(bossResult.stageComplete, true);
assert.equal(bossResult.relicChoices.length, 3, 'the boss guarantees three relic options');
assert.equal(new Set(bossResult.relicChoices.map(relic => relic.id)).size, 3, 'boss options are distinct');
const chosen = bossEngine.claimRelic(bossHero.id, bossResult.relicChoices[0].id);
assert.ok(bossHero.relics.includes(chosen.id));
assert.deepEqual(bossHero.run.snapshot.relics, bossHero.relics, 'the latest checkpoint retains the boss reward');

// Static UI wiring checks guard the client-side bridge.
const ui = fs.readFileSync(path.join(__dirname, '../rpg-rework-ui.js'), 'utf8');
const worker = fs.readFileSync(path.join(__dirname, '../service-worker.js'), 'utf8');
assert.match(ui, /function syncEquipmentCards/);
assert.match(ui, /sourceType="equipment"/);
assert.match(ui, /function getCardDamageWithTalents/);
assert.ok(ui.includes('getCardDamageWithTalents(card,c,battle.guildRaid&&isXCost?Math.max(1,Number(c.energy)||3):cost)'),'card damage uses computed energy cost and guild-raid exception');
assert.match(ui, /data-relic-buy/);
assert.match(ui, /data-relic-reward-pick/);
assert.match(ui, /data-unequip/);
assert.match(ui, /new-battle-relics/);
assert.match(worker, /^const CACHE = 'towerbound-v\d+';$/m);
console.log('Equipment-to-card links, relic passives/rewards/shop, and talent-scaled card combat passed.');
