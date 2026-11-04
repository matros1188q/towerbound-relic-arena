'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createEngine}=require('../rpg-rework-v2.js');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../configs/balance/'+name+'.json'),'utf8'));
const names=['combat','xp_curve','map','elite_mechanics','death','healing','auto_battle','drop_tables','equipment','economy','heroic','pvp','classes','skill_effects','mobs','bosses','character_curves','item_level','bp','difficulty','materials','account','stash','tutorial','achievements','lore','settings','seasons','paragon','pvp_store'];
const balance=Object.fromEntries(names.map(name=>[name,read(name)]));
let clock=Date.UTC(2026,10,4);
const now=()=>clock++;
const engine=createEngine(balance,{now,random:()=>0.99});
const created=engine.createCharacter('Feel QA','assassin');
const character=engine.state.characters[0];

assert.equal(created.level,1);
assert.equal(created.silver,100,'new character starts with 100 silver');
assert.equal(character.bag.find(item=>item.type==='healing_potion').quantity,3,'starter has three healing potions');
assert.equal(balance.account.starter_pack.silver,100);
assert.equal(balance.economy.silver_store.heal_25,20,'25% healing potion costs 20 silver');
assert.equal(balance.drop_tables.guaranteed_boss_rare_epic_from_stage,3);
for(const [id,definition] of Object.entries(balance.classes.classes)){
  assert.ok((definition.base_skills||[]).some(skill=>skill.unlock_level<=1),id+' has an active level-one base skill');
}

character.progress.highestEver=10;
character.progress.currentStage=11;
const plan=engine.beginStage(character.id,10);
assert.equal(plan.mobs[0].type,'boss','stage 10 is a boss for the deterministic loot test');
const result=engine.finishEnemy(character.id,{targetIndex:0});
assert.ok(result.loot.some(item=>['Редкая','Эпическая'].includes(item.rarity)),'boss on a replayed stage >=3 guarantees rare or epic loot');

const ui=fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.css.js'),'utf8');
assert.match(ui,/function showFloatingText\(/);
assert.match(ui,/AudioContext\|\|window\.webkitAudioContext/);
assert.match(ui,/data-setting="sound_enabled"/);
assert.match(ui,/tb-target-warning/);
assert.match(ui,/base_skills/);
assert.match(css,/tb-player-turn-glow/);
assert.match(css,/tb-warning-pulse/);
for(const color of ['#4a4a4a','#2b5c8f','#6a0dad','#ff8c00','#dc143c'])assert.ok(css.includes(color),'rarity color '+color);
console.log('Game Feel checks passed: starter economy, base skills, guaranteed boss loot, SFX, floating text, telegraphs and rarity colors.');
