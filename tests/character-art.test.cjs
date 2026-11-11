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
const heroes={assassin:'heroes/image-Photoroom.png',bishop:'heroes/image 2-Photoroom(1).png',dragonkin:'heroes/image 3-Photoroom.png',destroyer:'heroes/image 4-Photoroom.png',elemental:'heroes/image 5-Photoroom.png',shaman:'heroes/image 6-Photoroom.png',duelist:'heroes/image 7-Photoroom.png'};
const mobs={'swamp-reaper':'enemies/image 2.png','cursed-knight':'enemies/image 3.png','shadow-goblin':'enemies/image 4.png','phantom-duelist':'enemies/image 5.png','abyss-knight':'enemies/image 6.png','ash-wolf':'enemies/image 7.png','rune-golem':'enemies/image 8.png','crimson-executioner':'enemies/image 9.png','plague-witch':'enemies/image 10.png','ash-imp':'enemies/image 11.png','forest-horror':'enemies/image 12.png','bone-warden':'enemies/image 13.png','spider-matron':'enemies/image 14.png','soul-harvester':'enemies/image 15.png','void-hunter':'enemies/image 16.png','blind-monk':'enemies/image 17.png','stone-minotaur':'enemies/image 18.png','cursed-alchemist':'enemies/image 20.png','root-colossus':'enemies/image.png'};
const bosses={'mirror-executioner':'bosses/mirror-executioner.png','ash-patriarch':'bosses/image 3.png','ice-abbot':'bosses/image 4.png','crimson-regent':'bosses/image 11.png','heart-of-tower':'bosses/image 12.png'};
assert.equal(heroManifest.assets.length,7);assert.equal(enemyManifest.assets.length,19);assert.equal(bossManifest.assets.length,5);
function validate(manifest,map,label){for(const [id,file] of Object.entries(map)){const asset=manifest.assets.find(x=>x.id===id);assert.ok(asset,label+' manifest missing '+id);assert.equal(asset.relative_path,'assets/characters/'+file);assert.equal(asset.image_format,'png');assert.ok(fs.existsSync(asset.relative_path),'missing '+asset.relative_path);}}
validate(heroManifest,heroes,'hero');validate(enemyManifest,mobs,'enemy');validate(bossManifest,bosses,'boss');
for(const [id,file] of Object.entries(heroes)){assert.ok(ui.includes(id+':"'+file+'"'),'modern hero '+id);assert.ok(legacy.includes(id+':\'./assets/characters/'+file+'\''),'legacy hero '+id);assert.ok(engine.includes(id+':\''+file+'\''),'Phaser hero '+id);}
for(const [id,file] of Object.entries(mobs)){assert.ok(ui.includes('"'+id+'":"'+file+'"'),'modern enemy '+id);assert.ok(engine.includes("'"+id+"':'"+file.split('/').pop()+"'"),'Phaser enemy '+id);}
for(const [id,file] of Object.entries(bosses)){assert.ok(ui.includes('"'+id+'":"'+file+'"'),'modern boss '+id);assert.ok(engine.includes("'"+id+"':'"+file.split('/').pop()+"'"),'Phaser boss '+id);assert.ok(legacy.includes("'"+id+"':'./assets/characters/"+file+"'"),'legacy boss '+id);}
const chapterFiles=['assets/chapters/image 2.jpeg','assets/chapters/image 3.jpeg','assets/chapters/image 4.jpeg','assets/chapters/image 5.jpeg','assets/chapters/image.jpeg'];
assert.equal(chapters.chapters.length,5);
for(let i=0;i<5;i++){assert.equal(chapters.chapters[i].background,chapterFiles[i]);assert.ok(fs.existsSync(chapterFiles[i]));}
assert.ok(ui.includes('function chapterBackgroundPath(stage)'));assert.ok(ui.includes('background-size:cover;background-position:center'));
assert.ok(ui.includes('function enemyPortrait(target)')&&ui.includes('target?.mobId'));
assert.ok(ui.includes('object-fit:contain!important')&&legacy.includes('object-fit:contain!important'));
assert.ok(html.includes('./assets/ui/art-sprites.css'));
assert.ok(html.includes('./assets/ui/logo.jpeg')||legacy.includes('./assets/ui/logo.jpeg'));
assert.ok(!ui.includes('ART_INBOX_BASE')&&!html.includes('./art-inbox/01-characters/'));
for(const name of ['hero-'+'illustrated.svg','foe-'+'illustrated.svg','skeleton-'+'illustrated.svg','brute-'+'illustrated.svg','enemy-'+'atlas.webp','arena-'+'background.svg','arena-'+'background.webp'])for(const source of [ui,engine,html])assert.ok(!source.includes(name),'obsolete art path '+name);
assert.ok(!/assets\/characters\/[^"'\x60]+?\.jpeg/.test([ui,legacy,engine].join('\n')));
console.log('Character art integration checks: OK (7 hero PNGs, 19 enemy PNGs, 5 boss PNGs, 5 chapter JPEGs)');
