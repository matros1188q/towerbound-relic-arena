'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const archive='art-inbox/06-other/talent-atlas-slices';
const archiveDir=path.join(root,archive);
assert.ok(fs.existsSync(archiveDir),'archived talent atlas source folder exists');
const archived=fs.readdirSync(archiveDir).filter(name=>/\.png$/i.test(name));
assert.equal(archived.length,550,'all 550 unreferenced talent atlas slices are preserved outside runtime assets');
assert.ok(!fs.existsSync(path.join(root,'assets/talents')),'inactive talent slice directory is no longer shipped as a runtime asset folder');
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
 assert.ok(!/assets\/talents\//.test(source),'runtime source must not reference archived talent slices: '+file);
 assert.ok(!/art-inbox\//.test(source),'work-material inbox must not be imported into runtime: '+file);
}
const itemManifest=JSON.parse(read('assets/Castoms/item-art-manifest.json'));
for(const sectionName of ['shop','relics']){
 for(const [key,relative] of Object.entries(itemManifest[sectionName])){
  if(typeof relative!=='string')continue;
  const resolved=path.posix.normalize(path.posix.join('assets/Castoms',relative));
  assert.ok(fs.existsSync(path.join(root,resolved)),sectionName+'/'+key+' custom art remains present: '+resolved);
 }
}
console.log('CLEANUP BOUNDARIES PASS: 550 unused talent slices and source ZIP archived; active custom item art preserved; runtime remains isolated from work materials.');
