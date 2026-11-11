'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');

const ui=fs.readFileSync('rpg-rework-ui.js','utf8');
const legacy=fs.readFileSync('rpg-mode.js','utf8');
const engine=fs.readFileSync('towerbound-engine.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const heroManifest=JSON.parse(fs.readFileSync('assets/characters/heroes/manifest.json','utf8'));
const enemyManifest=JSON.parse(fs.readFileSync('assets/characters/enemies/manifest.json','utf8'));
const bossManifest=JSON.parse(fs.readFileSync('assets/characters/bosses/manifest.json','utf8'));
const chapters=JSON.parse(fs.readFileSync('configs/balance/chapters.json','utf8'));

const heroes={
  "assassin": "heroes/image.jpeg",
  "bishop": "heroes/image 2.jpeg",
  "dragonkin": "heroes/image 3.jpeg",
  "destroyer": "heroes/image 4.jpeg",
  "elemental": "heroes/image 5.jpeg",
  "shaman": "heroes/image 6.jpeg",
  "duelist": "heroes/image 7.jpeg"
};
const mobs={
  "swamp-reaper": "enemies/image 2.jpeg",
  "cursed-knight": "enemies/image 3.jpeg",
  "shadow-goblin": "enemies/image 4.jpeg",
  "phantom-duelist": "enemies/image 5.jpeg",
  "abyss-knight": "enemies/image 6.jpeg",
  "ash-wolf": "enemies/image 7.jpeg",
  "rune-golem": "enemies/image 8.jpeg",
  "crimson-executioner": "enemies/image 9.jpeg",
  "plague-witch": "enemies/image 10.jpeg",
  "ash-imp": "enemies/image 11.jpeg",
  "forest-horror": "enemies/image 12.jpeg",
  "bone-warden": "enemies/image 13.jpeg",
  "spider-matron": "enemies/image 14.jpeg",
  "soul-harvester": "enemies/image 15.jpeg",
  "void-hunter": "enemies/image 16.jpeg",
  "blind-monk": "enemies/image 17.jpeg",
  "stone-minotaur": "enemies/image 18.jpeg",
  "cursed-alchemist": "enemies/image 20.jpeg",
  "root-colossus": "enemies/image.jpeg"
};
const bosses={
  "mirror-executioner": "bosses/image 19.jpeg",
  "ash-patriarch": "bosses/image 3.jpeg",
  "ice-abbot": "bosses/image 4.jpeg",
  "crimson-regent": "bosses/image 11.jpeg",
  "heart-of-tower": "bosses/image 12.jpeg"
};

assert.equal(heroManifest.assets.length,7,'JPG hero roster must contain all seven classes');
assert.equal(enemyManifest.assets.length,19,'JPG enemy mapping must contain all nineteen supplied roles');
assert.equal(bossManifest.assets.length,5,'JPG boss mapping must contain all five supplied bosses');

function validateManifest(manifest,expected,label){
  for(const [id,file] of Object.entries(expected)){
    const item=manifest.assets.find(asset=>asset.id===id);
    assert.ok(item,label+' manifest entry missing: '+id);
    assert.equal(item.relative_path,'assets/characters/'+file,label+' path mismatch for '+id);
    assert.equal(item.image_format,'jpeg',label+' must remain JPEG: '+id);
    assert.ok(fs.existsSync(item.relative_path),'missing JPG: '+item.relative_path);
  }
}
validateManifest(heroManifest,heroes,'hero');
validateManifest(enemyManifest,mobs,'enemy');
validateManifest(bossManifest,bosses,'boss');

for(const [id,file] of Object.entries(heroes)){
  assert.ok(ui.includes(id+':"'+file+'"'),'modern class portrait missing: '+id);
  assert.ok(legacy.includes(id+':\'./assets/characters/'+file+'\''),'legacy class portrait missing: '+id);
}
for(const [id,file] of Object.entries(mobs)){
  assert.ok(ui.includes('"'+id+'":"'+file+'"'),'modern enemy portrait missing: '+id);
  assert.ok(engine.includes("'"+id+"':'"+file.split('/').pop()+"'"),'Phaser enemy portrait missing: '+id);
}
for(const [id,file] of Object.entries(bosses)){
  assert.ok(ui.includes('"'+id+'":"'+file+'"'),'modern boss portrait missing: '+id);
  assert.ok(engine.includes("'"+id+"':'"+file.split('/').pop()+"'"),'Phaser boss portrait missing: '+id);
  assert.ok(legacy.includes("'"+id+"':'./assets/characters/"+file+"'"),'legacy boss portrait missing: '+id);
}

const chapterFiles=['assets/chapters/image 2.jpeg','assets/chapters/image 3.jpeg','assets/chapters/image 4.jpeg','assets/chapters/image 5.jpeg','assets/chapters/image.jpeg'];
assert.equal(chapters.chapters.length,5,'five chapter backgrounds expected');
for(let i=0;i<5;i++){
 assert.equal(chapters.chapters[i].background,chapterFiles[i],'chapter range/background mapping mismatch at '+(i+1));
 assert.ok(fs.existsSync(chapterFiles[i]),'chapter JPG missing: '+chapterFiles[i]);
}
assert.ok(ui.includes('function chapterBackgroundPath(stage)'),'chapter stage background helper missing');
assert.ok(ui.includes('background-size:cover;background-position:center'),'chapter backgrounds must cover and center');
assert.ok(ui.includes('function enemyPortrait(target)')&&ui.includes('target?.mobId'),'enemy renderer must prefer the concrete mob id');
assert.ok(ui.includes('object-fit:contain!important'),'modern art must preserve image aspect ratio');
assert.ok(legacy.includes('object-fit:contain!important'),'legacy art must preserve image aspect ratio');
assert.ok(html.includes('./assets/ui/art-sprites.css'),'sprite sheet stylesheet must be loaded');
assert.ok(html.includes('./assets/ui/logo.jpeg')||legacy.includes('./assets/ui/logo.jpeg'),'TowerBound JPG logo must be referenced');
assert.ok(!ui.includes('ART_INBOX_BASE')&&!html.includes('./art-inbox/01-characters/'),'runtime must not reference staging art paths');

const obsolete=['hero-'+'illustrated.svg','foe-'+'illustrated.svg','skeleton-'+'illustrated.svg','brute-'+'illustrated.svg','enemy-'+'atlas.webp','arena-'+'background.svg','arena-'+'background.webp'];
for(const name of obsolete){
 assert.ok(!ui.includes(name),'obsolete RPG art path remains in modern renderer: '+name);
 assert.ok(!engine.includes(name),'obsolete art path remains in Phaser renderer: '+name);
 assert.ok(!html.includes(name),'obsolete art path remains in index: '+name);
}
console.log('Character art integration checks: OK (7 hero JPGs, 19 enemy JPGs, 5 boss JPGs, 5 chapter JPGs)');
