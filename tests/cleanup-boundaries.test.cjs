'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const talentDir=path.join(root,'assets/talents');
assert.ok(fs.existsSync(talentDir),'active talent icon asset directory exists');
const activeTalentImages=fs.readdirSync(talentDir).filter(name=>/\\.png$/i.test(name));
assert.equal(activeTalentImages.length,550,'all 550 talent atlas slices remain in the active runtime asset directory');
const talentTree=JSON.parse(read('configs/talents_tree.json'));
const referencedTalentIcons=[...new Set((talentTree.nodes||[]).map(node=>String(node.icon||'').replace('./','')).filter(Boolean))];
assert.equal(referencedTalentIcons.length,425,'seven-class talent tree keeps its 425 distinct data-driven icon references');
for(const icon of referencedTalentIcons)assert.ok(fs.existsSync(path.join(root,icon)),'talent tree icon exists: '+icon);
const archiveDir=path.join(root,'art-inbox/06-other/talent-atlas-slices');
assert.ok(fs.existsSync(archiveDir),'talent atlas work-material note remains available');
assert.equal(fs.readdirSync(archiveDir).filter(name=>/\\.png$/i.test(name)).length,0,'active talent PNGs are not duplicated in the art inbox');
assert.ok(fs.existsSync(path.join(root,'art-inbox/06-other/images_126_cropped.zip')),'unused source ZIP is preserved in the work-material inbox');
assert.ok(!fs.existsSync(path.join(root,'assets/Castoms/images_126_cropped.zip')),'source ZIP is not mixed into the live custom item art folder');
const runtimeFiles=[
 'index.html','service-worker.js','styles.css','assets/ui/art-sprites.css',
 'combat-visuals.js','endgame-systems.js','juice-pwa.js','progression-24.js',
 'rpg-expansion.js','rpg-mode.js','rpg-rework-ui.css.js','rpg-rework-ui.js',
 'rpg-rework-v2.js','social-endgame.js','supabase-config.js','towerbound-cloud.js',
 'towerbound-engine.js','towerbound-guild.js','towerbound-online.js','towerbound-polish.js'
];
for(const file of runtimeFiles){
 const source=read(file);
 assert.ok(!/art-inbox\\//.test(source),'work-material inbox must not be imported into runtime: '+file);
}
const itemManifest=JSON.parse(read('assets/Castoms/item-art-manifest.json'));
for(const sectionName of ['shop','relics']){
 for(const [key,relative] of Object.entries(itemManifest[sectionName])){
  if(typeof relative!=='string')continue;
  const resolved=path.posix.normalize(path.posix.join('assets/Castoms',relative));
  assert.ok(fs.existsSync(path.join(root,resolved)),sectionName+'/'+key+' custom art remains present: '+resolved);
 }
}
console.log('CLEANUP BOUNDARIES PASS: 550 active talent icons and 425 tree references verified; source ZIP archived; active custom item art preserved; runtime remains isolated from work materials.');
