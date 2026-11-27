'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const ui=fs.readFileSync('rpg-rework-ui.js','utf8');
const engine=fs.readFileSync('towerbound-engine.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const styles=fs.readFileSync('styles.css','utf8');
const heroManifest=JSON.parse(fs.readFileSync('assets/characters/heroes/manifest.json','utf8'));
const enemyManifest=JSON.parse(fs.readFileSync('assets/characters/enemies/manifest.json','utf8'));
const bossManifest=JSON.parse(fs.readFileSync('assets/characters/bosses/manifest.json','utf8'));
const chapters=JSON.parse(fs.readFileSync('configs/balance/chapters.json','utf8'));
const heroes={assassin:'heroes/image-Photoroom.png',bishop:'heroes/image_2-Photoroom(1).png',dragonkin:'heroes/image_3-Photoroom.png',destroyer:'heroes/image_4-Photoroom.png',elemental:'heroes/image_5-Photoroom.png',shaman:'heroes/image_6-Photoroom.png',duelist:'heroes/image_7-Photoroom.png'};
const mobs={'swamp-reaper':'enemies/image_2.png','cursed-knight':'enemies/image_3.png','shadow-goblin':'enemies/image_4.png','phantom-duelist':'enemies/image_5.png','abyss-knight':'enemies/image_6.png','ash-wolf':'enemies/image_7.png','rune-golem':'enemies/image_8.png','crimson-executioner':'enemies/image_9.png','plague-witch':'enemies/image_10.png','ash-imp':'enemies/image_11.png','forest-horror':'enemies/image_12.png','bone-warden':'enemies/image_13.png','spider-matron':'enemies/image_14.png','soul-harvester':'enemies/image_15.png','void-hunter':'enemies/image_16.png','blind-monk':'enemies/image_17.png','stone-minotaur':'enemies/image_18.png','cursed-alchemist':'enemies/image_20.png','root-colossus':'enemies/image.png','grave-archer':'enemies/grave-archer.png'};
const bosses={'abyss-queen':'bosses/abyss-queen.png','ash-patriarch':'bosses/image_3.png','bone-colossus':'bosses/bone-colossus.png','heart-of-tower':'bosses/image_12.png','ice-abbot':'bosses/image_4.png','mirror-executioner':'bosses/mirror-executioner.png','root-titan':'bosses/root-titan.png','soul-devourer':'bosses/soul-devourer.png','void-hunter-boss':'bosses/void-hunter-boss.png','crimson-regent':'bosses/image_11.png'};
assert.equal(heroManifest.assets.length,7);assert.equal(enemyManifest.assets.length,20);assert.equal(bossManifest.assets.length,10);
function validate(manifest,map,label){for(const [id,file] of Object.entries(map)){const asset=manifest.assets.find(x=>x.id===id);assert.ok(asset,label+' manifest missing '+id);assert.equal(asset.relative_path,'assets/characters/'+file);assert.equal(asset.image_format,'png');assert.ok(fs.existsSync(asset.relative_path),'missing '+asset.relative_path);}}
validate(heroManifest,heroes,'hero');validate(enemyManifest,mobs,'enemy');validate(bossManifest,bosses,'boss');
for(const [id,file] of Object.entries(heroes)){assert.ok(ui.includes(id+':"'+file+'"'),'modern hero '+id);assert.ok(engine.includes(id+':\''+file.split('/').pop()+'\''),'Phaser hero '+id);}
for(const [id,file] of Object.entries(mobs)){assert.ok(ui.includes('"'+id+'":"'+file+'"'),'modern enemy '+id);assert.ok(engine.includes("'"+id+"':'"+file.split('/').pop()+"'"),'Phaser enemy '+id);}
for(const [id,file] of Object.entries(bosses)){assert.ok(ui.includes('"'+id+'":"'+file+'"'),'modern boss '+id);assert.ok(engine.includes("'"+id+"':'"+file.split('/').pop()+"'"),'Phaser boss '+id);}
const chapterFiles=['assets/chapters/image_2.jpeg','assets/chapters/image_3.jpeg','assets/chapters/image_4.jpeg','assets/chapters/image_5.jpeg','assets/chapters/image.jpeg'];
assert.equal(chapters.chapters.length,5);
for(let i=0;i<5;i++){assert.equal(chapters.chapters[i].background,chapterFiles[i]);assert.ok(fs.existsSync(chapterFiles[i]));}
const arenaBackgrounds=[...ui.matchAll(/"\.\/assets\/backgrounds\/dungeons\/([^"]+)"/g)].map(match=>match[1]);
assert.equal(arenaBackgrounds.length,80,"all 80 active dungeon arena backgrounds are mapped");
for(const file of arenaBackgrounds)assert.ok(fs.existsSync("assets/backgrounds/dungeons/"+file),"arena background exists: "+file);
assert.ok(ui.includes('function chapterBackgroundPath(stage)'));assert.ok(ui.includes('background-size:cover;background-position:center'));
assert.ok(ui.includes('function enemyPortrait(target)')&&ui.includes('target?.mobId'));
assert.ok(styles.includes('object-fit:contain')&&ui.includes('inventoryIconHtml(item,true)'));
assert.ok(html.includes('./assets/ui/art-sprites.css'));
assert.ok(html.includes('./assets/icons/image.png')&&ui.includes('./assets/icons/image.png'));
assert.ok(!ui.includes('ART_INBOX_BASE')&&!html.includes('./art-inbox/01-characters/'));
for(const name of ['hero-'+'illustrated.svg','foe-'+'illustrated.svg','skeleton-'+'illustrated.svg','brute-'+'illustrated.svg','enemy-'+'atlas.webp','arena-'+'background.svg','arena-'+'background.webp'])for(const source of [ui,engine,html])assert.ok(!source.includes(name),'obsolete art path '+name);
assert.ok(!/assets\/characters\/[^"'\x60]+?\.jpeg/.test([ui,engine].join('\n')));
console.log('Character art integration checks: OK (7 hero PNGs, 20 enemy PNGs, 9 active boss PNGs plus 1 legacy portrait, 5 chapter JPEGs)');
