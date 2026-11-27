'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'rpg-rework-ui.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');

assert.ok(ui.includes('function handleModernClick(event){'),'the active RPG renderer owns one delegated click handler');
assert.ok(ui.includes('root.addEventListener("click",handleModernClick);'),'the active renderer mounts its delegated click handler');
assert.ok(ui.includes('event.target?.closest?.("[data-action],[data-pick],[data-class],[data-stage],[data-tab]'),'the delegated handler resolves profile and map actions from the closest actionable control');
for(const action of ['bottom-map','bottom-profile','bottom-shop','bottom-account','skip-floors','daily-chest','stats-close','tree-close','tree-center','equip-best','end-turn','account-sync']){
 assert.ok(ui.includes('case "'+action+'"'), 'active RPG handler supports '+action);
}
assert.ok(ui.includes('case "daily-chest":')&&ui.includes('engine.claimDailyChest(c.id)'),'daily chest claims rewards through the current game engine');
assert.ok(ui.includes('case "skip-floors":showSkipFloorsModal();'),'skip floors opens its current confirmation flow');
assert.ok(css.includes('.tb-skip-floors-overlay{position:fixed!important;inset:0!important;z-index:1000002!important;'),'skip confirmation stacks above the fixed game root');
assert.ok(ui.includes('root.addEventListener("change",event=>{const input=event.target?.closest?.("[data-setting]")'),'account preference checkboxes persist on change');
assert.ok(ui.includes('case "bottom-profile":profileTab="stats";statsOverlayOpen=true;'),'profile navigation opens the full-screen stats view');
assert.ok(ui.includes('function arenaBackgroundForStage(stage)')&&ui.includes('./assets/Fon/image_25.jpeg'),'arena backgrounds resolve from the current chapter map');
assert.ok(ui.includes('if(nextIndex<0){battle.enemyQueueState=null;advanceToPlayerTurn();return;}'),'enemy queue advances to player turn after the final living mob');
const social=fs.readFileSync(path.join(root,'social-endgame.js'),'utf8');
assert.ok(social.includes("e.target.closest('#socPanel [data-soc],#socPanel [data-tab],#socPanel [data-eg]')'),'social click delegation is scoped to the social panel');
const progression=fs.readFileSync(path.join(root,'progression-24.js'),'utf8');
assert.ok(progression.includes("closest('[data-progress-tab]')")&&progression.includes('t.dataset.progressTab'),'progression tabs use their own delegated attribute');
assert.equal((progression.match(/data-tab=/g)||[]).length,0,'progression markup does not publish generic data-tab controls into the RPG root');
assert.ok(progression.includes('document.body.append(overlay)')&&progression.includes('if(!overlay?.isConnected)inject();'),'progression overlay is mounted outside the replaceable RPG render root and recreated after removal');
console.log('Towerbound active renderer interaction audit passed.');
