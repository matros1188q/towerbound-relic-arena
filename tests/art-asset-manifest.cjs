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
for (const classname of ['icon-fire', 'icon-ice', 'icon-poison', 'icon-phys', 'ui-settings', 'ui-target', 'ui-shield', 'skill-fire', 'skill-ice', 'skill-poison', 'skill-phys']) {
  assert.ok(source['assets/ui/art-sprites.css'].includes('.' + classname), 'Missing sprite class ' + classname);
}
assert.ok(source['index.html'].includes('./assets/ui/art-sprites.css'), 'Sprite stylesheet not linked by index.html');
assert.ok(source['assets/ui/art-sprites.css'].includes('object-fit:contain'), 'JPG artwork must not be stretched');

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
