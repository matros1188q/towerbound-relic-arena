'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');

const ui = fs.readFileSync('rpg-rework-ui.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const artDir = 'art-inbox/01-characters';
const inventory = fs.readdirSync(artDir);
const imageFiles = inventory.filter(name =>
  ['.jpg', '.jpeg', '.png', '.webp'].some(ext => name.toLowerCase().endsWith(ext))
);
assert.equal(imageFiles.length, 33, 'reviewed art inbox inventory changed; update this audit');
for (const file of imageFiles) {
  const size = fs.statSync(artDir + '/' + file).size;
  assert.ok(size > 0, 'empty art file: ' + file);
  assert.ok(size <= 1024 * 1024, 'art inbox image exceeds 1 MB: ' + file);
}

const heroManifest = JSON.parse(fs.readFileSync('assets/characters/heroes/manifest.json', 'utf8'));
const enemyManifest = JSON.parse(fs.readFileSync('assets/characters/enemies/manifest.json', 'utf8'));
const inboxSourceSet = new Set(imageFiles);
const bossManifest = JSON.parse(fs.readFileSync('assets/characters/bosses/manifest.json', 'utf8'));
assert.equal(heroManifest.assets.length, 4, 'hero art count changed');
assert.equal(enemyManifest.assets.length, 20, 'enemy art count changed');
assert.equal(bossManifest.assets.length, 9, 'boss art count changed');
const unclassified = imageFiles.filter(file =>
  ![...heroManifest.assets, ...enemyManifest.assets, ...bossManifest.assets]
    .some(asset => asset.source_filename + '.jpg' === file)
).sort();
assert.deepEqual(unclassified, [
  '1ce15225-7162-4858-8fa7-41363266e71e.jpg',
  '70524780-ece1-4aa2-ad6b-1e1035c9a136.jpg',
  'be7caee1-03c5-49ca-989c-bbab2c3d2063.jpg'
], 'unclassified art inbox assets changed; review their mapping');


for (const manifest of [heroManifest, enemyManifest, bossManifest]) {
  for (const asset of manifest.assets) {
    assert.ok(inventory.includes(asset.source_filename + '.jpg'),
      'manifest source missing from art inbox: ' + asset.source_filename);
    assert.ok(fs.existsSync(asset.relative_path), 'named asset missing: ' + asset.relative_path);
  }
}

const requiredClassMappings = [
  'assassin:"heroes/reaper.png"',
  'bishop:"heroes/arcanist.png"',
  'dragonkin:"enemies/crimson-executioner.png"',
  'destroyer:"heroes/warden.png"',
  'elemental:"bosses/ice-abbot.png"',
  'duelist:"enemies/phantom-duelist.png"',
  'shaman:"bosses/ash-patriarch.png"'
];
for (const mapping of requiredClassMappings) assert.ok(ui.includes(mapping), 'missing class mapping: ' + mapping);

const requiredMobs = [
  'shadow-goblin','cursed-knight','ash-wolf','rune-golem','grave-archer',
  'plague-witch','ash-imp','swamp-reaper','bone-warden','crimson-executioner',
  'void-hunter','spider-matron','blind-monk','stone-minotaur','phantom-duelist',
  'soul-harvester','forest-horror','abyss-knight','cursed-alchemist','root-colossus'
];
for (const id of requiredMobs) {
  assert.ok(ui.includes('"'+id+'":'), 'RPG mob art mapping missing: ' + id);
  assert.ok(html.includes('/enemies/'+id+'.png'), 'legacy mob art mapping missing: ' + id);
}
for (const id of ['bone-colossus','abyss-queen','ash-patriarch','ice-abbot','mirror-executioner','soul-devourer','root-titan','void-hunter-boss','heart-of-tower']) {
  assert.ok(ui.includes('bosses/'+id+'.png'), 'RPG boss art mapping missing: ' + id);
  assert.ok(html.includes('/bosses/'+id+'.png'), 'legacy boss art mapping missing: ' + id);
}
assert.ok(ui.includes('target?.mobId'), 'RPG portrait selection must use the concrete mob id');
assert.ok(ui.includes('object-fit:contain!important'), 'RPG image containers must preserve aspect ratio');
assert.ok(html.includes('object-fit:contain!important'), 'legacy character art must preserve aspect ratio');
assert.ok(ui.includes('function enemyPortrait(target)'), 'enemy portrait selector missing');
assert.ok(ui.includes('enemyPortrait(target)'), 'enemy target card portrait missing');
assert.ok(ui.includes('enemyPortrait(enemy)'), 'focused enemy/boss portrait missing');
assert.ok(!ui.includes('ART_INBOX_BASE'), 'runtime RPG UI should use stable named assets, not staging paths');
assert.ok(!html.includes('./art-inbox/01-characters/'), 'legacy game must not load staging art paths');
for (const path of Object.values({
  warden:'./assets/characters/heroes/warden.png',
  arcanist:'./assets/characters/heroes/arcanist.png',
  ranger:'./assets/characters/heroes/ranger.png',
  reaper:'./assets/characters/heroes/reaper.png'
})) assert.ok(html.includes(path), 'legacy hero picker asset missing: ' + path);

console.log('Character art integration checks: OK (33 inbox images, 4 hero assets, 20 enemy assets, 9 boss assets)');
