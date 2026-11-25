'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const tree=JSON.parse(fs.readFileSync(path.join(root,'configs/talents_tree.json'),'utf8'));
const ui=fs.readFileSync(path.join(root,'rpg-rework-ui.js'),'utf8');
const cardStart=ui.indexOf('const CARD_DATABASE=Object.freeze(');
const cardEnd=ui.indexOf('const CARD_ART_ROOT',cardStart);
assert.ok(cardStart>=0&&cardEnd>cardStart,'card database boundaries exist');
const cardIds=new Set([...ui.slice(cardStart,cardEnd).matchAll(/^\s*[a-z0-9_]+:\{id:"([^"]+)"/gm)].map(m=>m[1]));
const branches=new Map();
const targeted=[];
for(const node of tree.nodes){
 if(!node.branch||node.branch==='core')continue;
 const key=node.classId+'.'+node.branch;
 if(!branches.has(key))branches.set(key,[]);
 branches.get(key).push(node);
 for(const effectKey of Object.keys(node.effect||{})){
  const match=effectKey.match(/^card[A-Z][A-Za-z]+_(.+)$/);
  if(match){assert.ok(cardIds.has(match[1]),node.id+' references missing card '+match[1]);targeted.push({node,effectKey,cardId:match[1]});}
 }
}
assert.equal(branches.size,21,'all 21 specializations have talent branches');
for(const [branch,nodes] of branches){
 const count=nodes.filter(node=>Object.keys(node.effect||{}).some(key=>/^card[A-Z][A-Za-z]+_/.test(key))).length;
 assert.ok(count>=4,branch+' has four card-linked talent nodes');
}
assert.equal(targeted.length,84,'each of the 84 specialization cards receives an individual talent bonus');
assert.ok(ui.includes('function applyTreeCardBonuses'),'card-linked effects are applied by combat runtime');
assert.ok(ui.includes('applyTreeCardBonuses(card,cardEffects(card),treeCache)'),'card-linked effects are applied when a card is played');
assert.ok(ui.includes('treeCardBonusDescription(card,handTreeCache)'),'card-linked effects are shown on cards in hand');
assert.ok(ui.includes('cardDamageDealt+=Math.max(0,Number(hit.dealt)||0)'),'lifesteal tracks actual dealt damage');
assert.ok(ui.includes('treeCache.lifestealPercent'),'lifesteal is read from talent tree');
const lifeNodes=tree.nodes.filter(node=>Number(node.effect?.lifestealPercent)>0);
assert.equal(lifeNodes.length,5,'light lifesteal is limited to five non-healing-oriented branches');
assert.ok(lifeNodes.every(node=>node.maxRank===1&&Number(node.effect.lifestealPercent)<=0.02),'lifesteal remains a small one-rank capstone');
console.log('Talent/card specialization checks passed: 21 branches, 84 card-linked talents, 5 light lifesteal capstones.');
