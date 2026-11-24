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
const itemArt=readJson('assets/Castoms/item-art-manifest.json');
const skills=readJson('assets/skills/art-manifest.json');
const ui=readJson('assets/ui/art-manifest.json');
const chapters=readJson('configs/balance/chapters.json');
for(const pack of [heroes,enemies,bosses]){
 assert.equal(pack.format,'png',pack.category+' manifest must use PNG');
 for(const asset of pack.assets){assert.equal(asset.image_format,'png');exists(asset.relative_path);}
}
for(const item of relics.assets)exists(item.path);
for(const group of [itemArt.shop,itemArt.shopVariants,itemArt.inventory,itemArt.relics,itemArt.mobDrops])for(const asset of Object.values(group||{})){if(typeof asset==='string')exists(path.normalize(path.join('assets/Castoms',asset)));}
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
assert.ok(uiScript.includes('craft_material:"./assets/relics/image_6.png"')&&uiScript.includes('function shopProductIconHtml(item)'),'Craft material and store art resolver must be active');
assert.ok(uiScript.includes('relicIconHtml(item,item?.slot,"tb-bag-item-art-img")'),'Equipment inventory render must pass item slot through the shared art wrapper');
assert.ok(uiScript.includes('item?.itemId')&&uiScript.includes('ITEM_ART_BY_ID'),'Inventory art resolver must use catalog itemId before effect type.');
assert.ok(uiScript.includes('RELIC_ART_BY_ID'),'Card relics must have dedicated semantic artwork.');
assert.ok(itemArt.inventory.xp_hourglass==='../relics/hourglass.png','Hourglass must not reuse the coin JPEG.');
assert.ok(itemArt.relics.assassin_blade==='../relics/fang.png'&&itemArt.relics.mirror_shard==='../relics/mirror.png','Relics must use dedicated matching artwork.');
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
assert.ok(relics.assets.some(x=>x.id==='craft-material'&&x.path==='assets/relics/image_6.png'),'Craft material must use the standalone green ore PNG, not the mixed atlas');
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

assert.equal(itemArt.inventory.pity_token,"image 17.jpeg","Pity token must not reuse the luck potion bottle");
for(const ids of [['xp_10','xp_20','xp_50','xp_100'],['heal_10','heal_25','heal_35','heal_50'],['drop_20','drop_50','drop_75','drop_100']])assert.equal(new Set(ids.map(id=>itemArt.inventory[id])).size,ids.length,'Each shop potency tier must have individual artwork: '+ids.join(', '));
assert.deepEqual(itemArt.shopVariants,{xp_10:itemArt.inventory.xp_10,xp_20:itemArt.inventory.xp_20,xp_50:itemArt.inventory.xp_50,xp_100:itemArt.inventory.xp_100,heal_10:itemArt.inventory.heal_10,heal_25:itemArt.inventory.heal_25,heal_35:itemArt.inventory.heal_35,heal_50:itemArt.inventory.heal_50,drop_20:itemArt.inventory.drop_20,drop_50:itemArt.inventory.drop_50,drop_75:itemArt.inventory.drop_75,drop_100:itemArt.inventory.drop_100},'Shop and backpack share each tier-specific art path');
assert.notEqual(itemArt.inventory.enhancement_stone,itemArt.inventory.craft_material,"Enhancement stone and craft material need distinct art");
assert.notEqual(itemArt.inventory.refine_stone,itemArt.inventory.enhancement_stone,"Refine stone and enhancement stone need distinct art");
assert.notEqual(itemArt.inventory.refine_10,itemArt.inventory.refine_20,"Refinement tiers need distinct art");
assert.equal(new Set(Object.values(itemArt.mobDrops)).size,5,"Each mob-drop item type needs its own artwork");
assert.equal(itemArt.mobDrops.enchant_scroll,itemArt.inventory.enchant_scroll,"Mob-drop scroll art must match backpack art");
assert.ok(uiScript.includes('function itemArtVariantLabel(item)')&&uiScript.includes('tb-item-art-badge'),'Potion and refine tiers must have visible unique variant labels');
assert.ok(uiScript.includes('customItemImageHtml(custom,"tb-shop-item-art",item)')&&uiScript.includes('customItemImageHtml(custom,"tb-bag-item-art-img",item)'),'Shop and backpack must share the same item image renderer');
assert.ok(source['styles.css'].includes('.tb-bag-item-art>.tb-item-art-wrap')&&source['styles.css'].includes('.tb-bag-item-art img,#tbRpg .tb-v2 .tb-bag-item-art .tb-relic-atlas')&&source['styles.css'].includes('width:56px!important'),'Backpack artwork must use a normalized contain-sized image box');
assert.equal(itemArt.inventory.craft_material,'../relics/image_6.png');
assert.equal(itemArt.mobDrops.craft_material,'../relics/image_6.png');
assert.ok(uiScript.includes('tb-relic-glove')&&uiScript.includes('tb-relic-amulet')&&uiScript.includes('tb-relic-bundle'),'Multi-item atlas art must be cropped to one object');
assert.ok(css.includes('.tb-relic-glove{background-image:url("../relics/image_12.png")')&&css.includes('.tb-relic-bundle{background-image:url("../relics/image_18.png")'),'Atlas crops must use the correct source sheets');
assert.ok(relics.sprite_crops.some(x=>x.id==='gloves')&&relics.sprite_crops.some(x=>x.id==='amulet'),'Relic art manifest documents the individual sprite crops');

console.log('ART-ASSET CHECK PASS: PNG portraits/relics/skills/icons, JPEG chapter backgrounds, item routing, sprite crops and cache.');
