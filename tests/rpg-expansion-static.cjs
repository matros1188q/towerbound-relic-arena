'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('rpg-expansion.js','utf8');
for(const k of ['assassin','bishop','dragonkin','destroyer','elemental','duelist','shaman'])assert.match(s,new RegExp(k+':\\['));
assert.equal((s.match(/Кровотечение|Изгнание|Огненный дракон/g)||[]).length>=3,true);
assert.match(s,/Math\.random\(\)<\.02/);assert.match(s,/c\.stage>=100&&Math\.random\(\)<\.05/);assert.match(s,/c\.stage>=30&&Math\.random\(\)<\.1/);
assert.match(s,/n>=16/);assert.match(s,/if\(!c\.heroic\)return false/);
assert.match(s,/const packs=\[\[100,100\],\[300,269\],\[500,449\],\[1000,900\],\[5000,4500\]\]/);\nassert.match(s,/const sets=Object.fromEntries/);\nassert.match(s,/function uniqueDrop/);
console.log('RPG expansion static checks passed');
