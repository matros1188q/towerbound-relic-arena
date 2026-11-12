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
const sourceFiles=['rpg-rework-ui.js','rpg-mode.js','towerbound-engine.js','index.html','service-worker.js','assets/ui/art-sprites.css','assets/relics/art-manifest.json','assets/skills/art-manifest.json','assets/ui/art-manifest.json','assets/characters/heroes/manifest.json','assets/characters/enemies/manifest.json','assets/characters/bosses/manifest.json'];
const source=Object.fromEntries(sourceFiles.map(p=>[p,fs.readFileSync(path.join(root,p),'utf8')]));
for(const [file,content] of Object.entries(source)){
 assert.ok(!/assets\/(?:characters|relics|skills|icons)\/[^"'\x60]+?\.jpeg/.test(content),'JPEG path remains in PNG art folder: '+file);
 for(const match of content.matchAll(/(?:\.\/)?assets\/(characters|relics|skills|icons)\/([^"'\x60]+?\.png)/g))exists('assets/'+match[1]+'/'+match[2]);
}
const uiScript=source['rpg-rework-ui.js'];
for(const [id,file] of Object.entries({assassin:'image-Photoroom.png',bishop:'image 2-Photoroom(1).png',dragonkin:'image 3-Photoroom.png',destroyer:'image 4-Photoroom.png',elemental:'image 5-Photoroom.png',shaman:'image 6-Photoroom.png',duelist:'image 7-Photoroom.png'}))assert.ok(uiScript.includes(id+':"heroes/'+file+'"'),'Missing hero PNG mapping: '+id);
assert.ok(uiScript.includes('return "image 15.png"')&&uiScript.includes('function shopProductIconHtml(item)'),'Craft material and store art resolver must be active');
assert.ok(uiScript.includes('relicIconHtml(item,item?.slot)'),'Equipment/store render must pass item slot');
assert.ok(uiScript.includes('chapterBackgrounds=["image 2.jpeg","image 3.jpeg","image 4.jpeg","image 5.jpeg","image.jpeg"]'),'Chapter JPEG backgrounds must be preserved');
const mode=source['rpg-mode.js'];
assert.ok(mode.includes("./assets/characters/heroes/image-Photoroom.png"),'Legacy RPG hero map uses uploaded PNG portrait');
assert.ok(mode.includes("./assets/characters/bosses/mirror-executioner.png"),'Legacy RPG boss map uses existing named PNG');
const css=source['assets/ui/art-sprites.css'];
assert.ok(css.includes('.sprite-icon{')&&css.includes('../skills/image 17.png'),'Talent atlas uses the dedicated skills PNG');
for(const name of ['talent-atk','talent-hp','talent-def','talent-agi','talent-crit','shop-potion','shop-premium','shop-refine'])assert.ok(css.includes('.'+name),'Missing sprite crop '+name);
const sw=source['service-worker.js'];
assert.ok(sw.includes("const CACHE = 'towerbound-v260'"),'PWA cache must match release v260');
assert.ok(sw.includes('./assets/chapters/image 2.jpeg'),'Service worker must preserve chapter JPEG backgrounds');
assert.ok(relics.assets.some(x=>x.id==='craft-material'&&x.path==='assets/relics/image 15.png'),'Craft material PNG must be registered');
assert.ok(skills.sprite_sheets.some(x=>x.id==='talent-attribute-icons'&&x.path==='assets/skills/image 17.png'),'Talent PNG atlas must be registered');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(index.includes('assets/ui/art-sprites.css?v='),'Sprite stylesheet must be linked');
console.log('ART-ASSET CHECK PASS: PNG portraits/relics/skills/icons, JPEG chapter backgrounds, item routing, sprite crops and cache.');
