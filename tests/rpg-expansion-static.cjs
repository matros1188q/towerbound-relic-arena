'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('rpg-expansion.js','utf8');
const core=fs.readFileSync('rpg-mode.js','utf8');
for(const id of ['assassin','bishop','dragonkin','destroyer','elemental','duelist','shaman']){
  assert.match(core,new RegExp(id+':\\['),id+' registered in character class table');
  assert.match(source,new RegExp(id+':\\['),id+' has class mechanics');
}
assert.match(source,/const skills=/);
assert.match(source,/const passives=/);
assert.match(source,/const talentNames=/);
assert.match(source,/const sets=Object\.fromEntries/);
assert.match(source,/function uniqueDrop/);
assert.match(source,/function putStone/);
assert.match(source,/kind:'weapon'/);
assert.match(source,/kind:'armor'/);
assert.match(source,/function merge/);
assert.match(source,/function refine/);
assert.match(source,/function enchant/);
assert.match(source,/function glow/);
assert.match(source,/Math\.random\(\)<\.02/,'chisel drop chance');
assert.match(source,/c\.stage>=100&&Math\.random\(\)<Math\.min\(1,\.05\*dropBoost\)/,'level 100 stones');
assert.match(source,/c\.stage>=30&&Math\.random\(\)<Math\.min\(1,\.1\*dropBoost\)/,'level 30 refinement stones');
assert.match(source,/n>=16/,'destructive refinement tier');
assert.match(source,/if\(!c\.heroic\)return false/,'heroic enchantment gate');
assert.match(source,/const packs=\[\[100,100\],\[300,269\],\[500,449\],\[1000,900\],\[5000,4500\]\]/,'donation packs');
assert.match(source,/25000,'premium',7/,'silver premium tuned for five-day farming target');
console.log('RPG expansion static checks passed: 7 classes, 21 branches, talents, sets, sockets, refinement, enchantments and economy.');
