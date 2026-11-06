'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');

const ui = fs.readFileSync('rpg-rework-ui.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const artDir = 'art-inbox/01-characters';
const inventory = new Set(fs.readdirSync(artDir));
const imageFiles = [...inventory].filter(name => /\\.(?:jpg|jpeg|png|webp)$/i.test(name));
assert.equal(imageFiles.length, 33, 'reviewed art inbox inventory changed; update this audit');

const requiredPortraits = [
  '92a10c4d-48e4-4a3c-92e5-bb7bae921f8d.jpg', // assassin
  '16f4bbb7-a8ac-4cb3-8d93-a9647458bf3f.jpg', // bishop
  'b0b7437e-c2ee-4a59-b644-ffce88f1d442.jpg', // dragonkin
  '7f5c7457-3498-464f-91df-d83335183855.jpg', // destroyer
  '00478c4a-e6ee-420d-a3f8-dd8c03c4698e.jpg', // elemental
  'a41493b8-0505-40f2-8351-fb8f1b484c8c.jpg', // duelist
  'c05adc5c-64e2-476a-8a4d-e92eb774c5d8.jpg', // shaman
  'ba3335bd-e111-4f86-90e6-4f2085cae804.jpg', // healer
  '52cbe629-d020-4077-8a86-2469a3cda66d.jpg', // poison
  'beb6557c-f2db-4426-b741-d0faa9c2d80f.jpg'  // tank
];
for (const file of requiredPortraits) {
  assert.ok(inventory.has(file), 'missing art inbox file: ' + file);
  assert.ok(ui.includes(file), 'rpg-rework-ui.js does not reference ' + file);
}
assert.ok(ui.includes('const ART_INBOX_BASE="./art-inbox/01-characters/"'), 'profile/hero art base path');
assert.ok(ui.includes('function enemyPortrait(target)'), 'enemy portrait selector');
assert.ok(ui.includes('enemyPortrait(target)'), 'enemy target card portrait');
assert.ok(ui.includes('enemyPortrait(enemy)'), 'focused enemy portrait');
assert.ok(ui.includes('object-fit:contain!important'), 'RPG artwork object-fit containment');

const allReferences = new Set([
  ...[...ui.matchAll(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.jpg)/gi)].map(match => match[1]),
  ...[...html.matchAll(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.jpg)/gi)].map(match => match[1])
]);
for (const file of allReferences) assert.ok(inventory.has(file), 'referenced image is absent from inbox: ' + file);

assert.ok(html.includes('./art-inbox/01-characters/'), 'legacy scene art base path');
assert.ok(!html.includes('./assets/characters/\'+category+\'/\'+src'), 'legacy enemy renderer still points to placeholder directories');
assert.ok(!/const TB_ENEMY_ART_FILES=\\[[^;]*\\.png/.test(html), 'legacy enemy list still references PNG placeholders');
assert.ok(!/const TB_BOSS_ART_FILES=\\[[^;]*\\.png/.test(html), 'legacy boss list still references PNG placeholders');
assert.ok(html.includes('rpg-rework-ui.js?v=14'), 'RPG UI cache version was not bumped');

console.log('Character art integration checks: OK (' + imageFiles.length + ' inbox images, ' + allReferences.size + ' referenced UUID images)');
