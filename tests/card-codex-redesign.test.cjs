'use strict';
const fs=require('node:fs');
const ui=fs.readFileSync('rpg-rework-ui.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('card-codex.css','utf8');
for(const [source,needle,label] of [
 [ui,'tb-codex-page','new library root'],[ui,'tb-codex-collection-page','new collection root'],
 [ui,'tb-codex-collection-grid','collection card grid'],[html,'card-codex.css?v=1','stylesheet link'],
 [css,'tb-codex-art','card art frame'],[css,'@media(max-width:380px)','small-screen layout']
]) if(!source.includes(needle)) throw new Error(label+' missing');
if(ui.includes('tb-card-codex-redesign-v1')) throw new Error('Legacy codex override remains');
console.log('Card library and collection redesign checks passed.');
