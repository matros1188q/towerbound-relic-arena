'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=process.cwd();
const readJson=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const exists=p=>assert.ok(fs.existsSync(path.join(root,p)),'Missing asset: '+p);
const heroes=readJson('assets/characters/heroes/manifest.json');
const enemies=readJson('assets/characters/enemies/manifest.json');
const bosses=readJson('assets/characters/bosses/manifest.json');
const relics=readJson('assets/relics/art-manifest.json');
const skills=readJson('assets/skills/art-manifest.json');
const ui=readJson('assets/ui/art-manifest.json');
const chapters=readJson('configs/balance/chapters.json');
for(const pack of [heroes,enemies,bosses]){
 assert.equal(pack.format,'png',pack.category+' manifest must use PNG');
 for(const asset of pack.assets){assert.equal(asset.image_format,'png');exists(asset.relative_path);}
}
for(const item of relics.assets)exists(item.path);
for(const sheet of ui.spriteSheets)exists(sheet.path);
for(const sheet of skills.sprite_sheets||[])exists(sheet.path);
for(const chapter of chapters.chapters){assert.ok(chapter.background.endsWith('.jpeg'),'Chapter backgrounds must remain JPEG');exists(chapter.background);}
exists(ui.logo);exists(ui.stylesheet);
const sourceFiles=['rpg-rework-ui.js','rpg-mode.js','towerbound-engine.js','index.html','service-worker.js','assets/ui/art-sprites.css','styles.css','assets/relics/art-manifest.json','assets/skills/art-manifest.json','assets/ui/art-manifest.json','assets/characters/heroes/manifest.json','assets/characters/enemies/manifest.json','assets/characters/bosses/manifest.json'];
const source=Object.fromEntries(sourceFiles.map(p=>[p,fs.readFileSync(path.join(root,p),'utf8')]));
for(const [file,content] of Object.entries(source)){
 assert.ok(!/assets\/(?:characters|relics|skills|icons)\/[^"'\x60]+?\.jpeg/.test(content),'JPEG path remains in PNG art folder: '+file);
 for(const match of content.matchAll(/(?:\.\/)?assets\/(characters|relics|skills|icons)\/([^"'\x60]+?\.png)/g))exists('assets/'+match[1]+'/'+match[2]);
}
const uiScript=source['rpg-rework-ui.js'];
for(const [id,file] of Object.entries({assassin:'image-Photoroom.png',bishop:'image_2-Photoroom(1).png',dragonkin:'image_3-Photoroom.png',destroyer:'image_4-Photoroom.png',elemental:'image_5-Photoroom.png',shaman:'image_6-Photoroom.png',duelist:'image_7-Photoroom.png'}))assert.ok(uiScript.includes(id+':"heroes/'+file+'"'),'Missing hero PNG mapping: '+id);
assert.ok(uiScript.includes('return "image_15.png"')&&uiScript.includes('function shopProductIconHtml(item)'),'Craft material and store art resolver must be active');
assert.ok(uiScript.includes('relicIconHtml(item,item?.slot)'),'Equipment/store render must pass item slot');
assert.ok(uiScript.includes('chapterBackgrounds=["image_2.jpeg","image_3.jpeg","image_4.jpeg","image_5.jpeg","image.jpeg"]'),'Chapter JPEG backgrounds must be preserved');
const mode=source['rpg-mode.js'];
const sw=source['service-worker.js'];
assert.ok(sw.includes('./assets/characters/enemies/grave-archer.png'),'Dedicated Grave Archer portrait is cached for offline play');
assert.ok(mode.includes("./assets/characters/heroes/image-Photoroom.png"),'Legacy RPG hero map uses uploaded PNG portrait');
assert.ok(mode.includes("./assets/characters/bosses/mirror-executioner.png"),'Legacy RPG boss map uses existing named PNG');
assert.ok(mode.includes("'grave-archer':'./assets/characters/enemies/grave-archer.png'"),'Legacy RPG uses the dedicated Grave Archer portrait, not a reused enemy image');
assert.ok(uiScript.includes('"grave-archer":"enemies/grave-archer.png"'),'Card RPG uses the dedicated Grave Archer portrait');
const css=source['assets/ui/art-sprites.css'];
assert.ok(css.includes('.sprite-icon{')&&css.includes('../skills/image_17.png'),'Talent atlas uses the dedicated skills PNG');
for(const name of ['talent-atk','talent-hp','talent-def','talent-agi','talent-crit','shop-potion','shop-premium','shop-refine'])assert.ok(css.includes('.'+name),'Missing sprite crop '+name);
assert.ok(/const CACHE = 'towerbound-v\d+'/.test(sw),'PWA cache must use a versioned towerbound-vN release key');
assert.ok(sw.includes('./assets/chapters/image_2.jpeg'),'Service worker must preserve chapter JPEG backgrounds');
assert.ok(relics.assets.some(x=>x.id==='craft-material'&&x.path==='assets/relics/image_15.png'),'Craft material PNG must be registered');
for(const folder of ['assets/characters/enemies','assets/chapters']){const names=fs.readdirSync(path.join(root,folder));assert.ok(!names.some(name=>name.includes(' ')),folder+' filenames must not contain spaces');}
const normalisedPaths=["assets/characters/heroes/image_2-Photoroom(1).png","assets/characters/heroes/image_3-Photoroom.png","assets/characters/heroes/image_4-Photoroom.png","assets/characters/heroes/image_5-Photoroom.png","assets/characters/heroes/image_6-Photoroom.png","assets/characters/heroes/image_7-Photoroom.png","assets/characters/bosses/image_3.png","assets/characters/bosses/image_4.png","assets/characters/bosses/image_11.png","assets/characters/bosses/image_12.png","assets/relics/image_2.png","assets/relics/image_3.png","assets/relics/image_4.png","assets/relics/image_5.png","assets/relics/image_6.png","assets/relics/image_7.png","assets/relics/image_8.png","assets/relics/image_9.png","assets/relics/image_10.png","assets/relics/image_12.png","assets/relics/image_14.png","assets/relics/image_15.png","assets/relics/image_18.png","assets/icons/image_5.png","assets/icons/image_11.png","assets/icons/image_13.png","assets/icons/image_15.png","assets/icons/image_16.png","assets/icons/image_17.png","assets/icons/image_19.png","assets/skills/image_17.png"];
for(const assetPath of normalisedPaths)exists(assetPath);
const oldActiveNames=['image 2-Photoroom(1).png','image 3-Photoroom.png','image 4-Photoroom.png','image 5-Photoroom.png','image 6-Photoroom.png','image 7-Photoroom.png','bosses/image 3.png','bosses/image 4.png','bosses/image 11.png','bosses/image 12.png','assets/icons/image 5.png','assets/icons/image 11.png','assets/icons/image 13.png','assets/icons/image 15.png','assets/icons/image 16.png','assets/icons/image 17.png','assets/icons/image 19.png','assets/relics/image 2.png','assets/relics/image 3.png','assets/relics/image 4.png','assets/relics/image 5.png','assets/relics/image 6.png','assets/relics/image 7.png','assets/relics/image 8.png','assets/relics/image 9.png','assets/relics/image 10.png','assets/relics/image 12.png','assets/relics/image 14.png','assets/relics/image 15.png','assets/relics/image 18.png','assets/skills/image 17.png'];
const activeText=Object.values(source).join('\n');
for(const stalePath of oldActiveNames)assert.ok(!activeText.includes(stalePath),'stale active image path remains: '+stalePath);
assert.ok(source['styles.css'].includes('assets/icons/image_17.png'),'shared runtime styles use underscore sprite paths');

assert.ok(skills.sprite_sheets.some(x=>x.id==='talent-attribute-icons'&&x.path==='assets/skills/image_17.png'),'Talent PNG atlas must be registered');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(index.includes('assets/ui/art-sprites.css?v='),'Sprite stylesheet must be linked');
assert.ok(index.includes('apple-touch-icon')&&index.includes('./assets/icons/image.png'),'iOS home-screen icon uses the Towerbound T logo');
const pwa=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
assert.ok(pwa.icons.length>=2&&pwa.icons.every(icon=>icon.src==='./assets/icons/image.png'),'PWA manifest icons use the Towerbound T logo');
console.log('ART-ASSET CHECK PASS: PNG portraits/relics/skills/icons, JPEG chapter backgrounds, item routing, sprite crops and cache.');
