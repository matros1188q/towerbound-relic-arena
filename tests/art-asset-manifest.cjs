'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = process.cwd();

function readJson(relativePath) {
  const full = path.join(root, relativePath);
  assert.ok(fs.existsSync(full), 'Missing JSON file: ' + relativePath);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}
function exists(relativePath, label) {
  const full = path.join(root, relativePath);
  assert.ok(fs.existsSync(full), (label || 'Missing asset') + ': ' + relativePath);
}

const heroes = readJson('assets/characters/heroes/manifest.json');
const enemies = readJson('assets/characters/enemies/manifest.json');
const bosses = readJson('assets/characters/bosses/manifest.json');
const relics = readJson('assets/relics/art-manifest.json');
const ui = readJson('assets/ui/art-manifest.json');
const skills = readJson('assets/skills/art-manifest.json');
const chapters = readJson('configs/balance/chapters.json');

for (const pack of [heroes, enemies, bosses]) {
  assert.equal(pack.format, 'jpeg', pack.category + ' manifest must use JPEG');
  for (const asset of pack.assets) exists(asset.relative_path, pack.category + ' ' + asset.id);
}
for (const item of relics.assets) exists(item.path, 'Relic ' + item.id);
for (const sheet of ui.spriteSheets) exists(sheet.path, 'UI sprite sheet ' + sheet.id);
for (const sheet of skills.sprite_sheets || []) exists(sheet.path, 'Skill sprite sheet ' + sheet.id);
for (const chapter of chapters.chapters) {
  assert.ok(chapter.background.endsWith('.jpeg'), 'Chapter background must be JPG: ' + chapter.background);
  exists(chapter.background, 'Chapter ' + chapter.id + ' background');
}
exists(ui.logo, 'Game logo');
exists(ui.stylesheet, 'Art sprite stylesheet');
exists('assets/characters/bosses/image 19.jpeg', 'Mirror Executioner JPG');

const sourceFiles = [
  'rpg-rework-ui.js', 'rpg-mode.js', 'towerbound-engine.js',
  'combat-visuals.js', 'index.html', 'assets/ui/art-sprites.css'
];
const source = Object.fromEntries(sourceFiles.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const uiScript = source['rpg-rework-ui.js'];
for (const [id, filename] of [
  ['assassin', 'image.jpeg'], ['bishop', 'image 2.jpeg'], ['dragonkin', 'image 3.jpeg'],
  ['destroyer', 'image 4.jpeg'], ['elemental', 'image 5.jpeg'], ['shaman', 'image 6.jpeg'], ['duelist', 'image 7.jpeg']
]) {
  assert.ok(uiScript.includes(id + ':"heroes/' + filename + '"'), 'Hero portrait map missing ' + id);
}
for (const classname of ['icon-fire','icon-ice','icon-poison','icon-phys','icon-settings','icon-target','icon-shield','skill-fire','skill-ice','skill-poison','skill-phys','skill-arcane']) {
  assert.ok(source['assets/ui/art-sprites.css'].includes('.' + classname), 'Missing sprite class ' + classname);
}
assert.ok(source['index.html'].includes('./assets/ui/art-sprites.css?v=2'), 'Sprite stylesheet not linked with refreshed cache key');
assert.ok(source['assets/ui/art-sprites.css'].includes('object-fit:contain'), 'JPG artwork must not be stretched');
const spriteCss = source['assets/ui/art-sprites.css'];
for (const rule of [
  '.icon-fire{background-image:url("../icons/image 13.jpeg");background-size:400% 300%;background-position:0 0}',
  '.icon-ice{background-image:url("../icons/image 13.jpeg");background-size:400% 300%;background-position:33.333% 0}',
  '.icon-poison{background-image:url("../icons/image 13.jpeg");background-size:400% 300%;background-position:66.667% 0}',
  '.icon-phys{background-image:url("../icons/image 13.jpeg");background-size:400% 300%;background-position:100% 0}',
  '.icon-settings,.ui-settings{background-image:url("../icons/image 11.jpeg");background-size:400% 300%;background-position:66.667% 0}',
  '.icon-target,.ui-target{background-image:url("../icons/image 11.jpeg");background-size:400% 300%;background-position:100% 0}',
  '.icon-shield,.ui-shield{background-image:url("../icons/image 13.jpeg");background-size:400% 300%;background-position:0 100%}',
  '.skill-fire{background-image:url("../icons/image 17.jpeg");background-size:400% 400%;background-position:0 0}'
]) assert.ok(spriteCss.includes(rule), 'Incorrect/missing sprite crop: ' + rule);

const modeScript = source['rpg-mode.js'];
for (const [id, filename] of [
  ['assassin','image.jpeg'],['bishop','image 2.jpeg'],['dragonkin','image 3.jpeg'],
  ['destroyer','image 4.jpeg'],['elemental','image 5.jpeg'],['shaman','image 6.jpeg'],['duelist','image 7.jpeg']
]) assert.ok(modeScript.includes(id + ":'./assets/characters/heroes/" + filename + "'"), 'Legacy RPG hero JPG map missing ' + id);
for (const [id, filename] of [
  ['swamp-reaper','image 2.jpeg'],['cursed-knight','image 3.jpeg'],['shadow-goblin','image 4.jpeg'],
  ['phantom-duelist','image 5.jpeg'],['abyss-knight','image 6.jpeg'],['ash-wolf','image 7.jpeg'],
  ['rune-golem','image 8.jpeg'],['crimson-executioner','image 9.jpeg'],['plague-witch','image 10.jpeg'],
  ['ash-imp','image 11.jpeg'],['forest-horror','image 12.jpeg'],['bone-warden','image 13.jpeg'],
  ['spider-matron','image 14.jpeg'],['soul-harvester','image 15.jpeg'],['void-hunter','image 16.jpeg'],
  ['blind-monk','image 17.jpeg'],['stone-minotaur','image 18.jpeg'],['cursed-alchemist','image 20.jpeg'],
  ['root-colossus','image.jpeg']
]) assert.ok(modeScript.includes("'" + id + "':'./assets/characters/enemies/" + filename + "'"), 'Legacy RPG enemy JPG map missing ' + id);
for (const [id, filename] of [
  ['mirror-executioner','image 19.jpeg'],['ash-patriarch','image 3.jpeg'],['ice-abbot','image 4.jpeg'],
  ['crimson-regent','image 11.jpeg'],['heart-of-tower','image 12.jpeg']
]) assert.ok(modeScript.includes("'" + id + "':'./assets/characters/bosses/" + filename + "'"), 'Legacy RPG boss JPG map missing ' + id);

assert.ok(skills.assets.every(asset => asset.format === 'jpeg' && asset.path.endsWith('.jpeg')), 'Active skill art manifest must reference JPG files only');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const catalogueAt = readme.indexOf('## Current JPG artwork catalogue (2026-11-11)');
const historicalAt = readme.indexOf('## Historical character artwork integration');
assert.ok(catalogueAt > 0 && historicalAt > 0 && historicalAt < catalogueAt, 'README must mark old PNG mappings Historical and place the current JPG catalogue after Historical baseline');
for (const item of ['heroes/reaper.png','enemies/shadow-goblin.png','bosses/ice-abbot.png']) {
  const at = readme.indexOf(item);
  assert.ok(at > historicalAt && at < catalogueAt, 'Legacy PNG path must appear only in the historical section: ' + item);
}
assert.ok(readme.includes('assets/icons/image 11.jpeg') && readme.includes('icon-settings') && readme.includes('icon-target'), 'README UI sprite map is incomplete');
assert.ok(readme.includes('assets/icons/image 13.jpeg') && readme.includes('icon-fire') && readme.includes('icon-poison') && readme.includes('icon-phys'), 'README element/damage sprite map is incomplete');


const tokens = ['hero-'+'illustrated.svg', 'foe-'+'illustrated.svg', 'skeleton-'+'illustrated.svg',
  'brute-'+'illustrated.svg', 'enemy-'+'atlas.webp', 'arena-'+'background.svg', 'arena-'+'background.webp'];
const extensions = new Set(['.js', '.css', '.html']);
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extensions.has(path.extname(entry.name)) && !full.endsWith('tests/art-asset-manifest.cjs')) {
      const content = fs.readFileSync(full, 'utf8');
      for (const token of tokens) assert.ok(!content.includes(token), 'Obsolete art path ' + token + ' remains in ' + path.relative(root, full));
    }
  }
}
walk(root);

console.log('ART-ASSET CHECK PASS');
console.log('Hero JPGs: ' + heroes.assets.length + ' | Enemy JPGs: ' + enemies.assets.length + ' | Boss JPGs: ' + bosses.assets.length);
console.log('Relic JPGs: ' + relics.assets.length + ' | Chapter backgrounds: ' + chapters.chapters.length);
console.log('UI/skill sprite sheets and CSS mappings: PASS');
console.log('Legacy SVG/WebP placeholder references in JS/CSS/HTML: 0');
