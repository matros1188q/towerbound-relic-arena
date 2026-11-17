'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const all=[];
function walk(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.name==='.git'||entry.name==='node_modules')continue;
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())walk(full);else all.push(full);
 }
}
walk(root);
const relative=file=>path.relative(root,file).split(path.sep).join('/');
const jsonFiles=all.filter(file=>file.endsWith('.json'));
for(const file of jsonFiles){
 try{JSON.parse(fs.readFileSync(file,'utf8'));}
 catch(error){throw new Error('Invalid JSON '+relative(file)+': '+error.message);}
}
const codeFiles=all.filter(file=>/\.(?:js|cjs)$/.test(file));
for(const file of codeFiles){
 const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 if(result.status!==0)throw new Error('JavaScript syntax error '+relative(file)+': '+(result.stderr||result.stdout||'node --check failed'));
}
const treePaths=new Set(all.map(relative));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const localRefs=[...html.matchAll(/(?:src|href)=["'](\.\/[^"'?#]+)(?:\?[^"']*)?["']/g)].map(match=>match[1].replace(/^\.\//,'')).filter(file=>file!==''&&!file.endsWith('/'));
for(const file of localRefs)assert.ok(treePaths.has(file),'Missing local HTML asset: '+file);
const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const shellRefs=[...sw.matchAll(/["']\.\/([^"']+)["']/g)].map(match=>match[1]);
for(const file of shellRefs)assert.ok(treePaths.has(file),'Missing service-worker shell asset: '+file);
const scripts=new Set([...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(match=>match[1].split('?')[0].replace(/^\.\//,'')));
for(const file of all.filter(file=>path.dirname(file)===root&&file.endsWith('.js')&&!file.endsWith('service-worker.js'))){
 assert.ok(scripts.has(path.basename(file)),'Root runtime JavaScript is not loaded by index.html: '+relative(file));
}
const styles=new Set([...html.matchAll(/<link[^>]+href=["']([^"']+\.css)(?:\?[^"']*)?["']/g)].map(match=>match[1].replace(/^\.\//,'')));
for(const file of all.filter(file=>path.dirname(file)===root&&file.endsWith('.css'))){
 assert.ok(styles.has(path.basename(file)),'Root runtime stylesheet is not linked by index.html: '+relative(file));
}
const pwa=fs.readFileSync(path.join(root,'juice-pwa.js'),'utf8');
assert.match(pwa,/service-worker\.js/,'service worker registration reference exists in the PWA bootstrap');
console.log('Towerbound repository integrity passed: '+all.length+' files, '+jsonFiles.length+' JSON files, '+codeFiles.length+' JavaScript files, '+localRefs.length+' local HTML references and '+shellRefs.length+' service-worker assets.');
