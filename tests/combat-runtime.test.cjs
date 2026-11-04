'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createEngine}=require('../rpg-rework-v2.js');

const configDir=path.join(__dirname,'../configs/balance');
const balance=Object.fromEntries(fs.readdirSync(configDir)
 .filter(name=>name.endsWith('.json'))
 .map(name=>[name.slice(0,-5),JSON.parse(fs.readFileSync(path.join(configDir,name),'utf8'))]));
let clock=Date.UTC(2026,10,3,12);
const engine=createEngine(balance,{now:()=>++clock,random:()=>0.25});

const classes=['assassin','bishop','dragonkin','destroyer','elemental','duelist','shaman'];
assert.deepEqual(Object.keys(balance.procs).sort(),classes.slice().sort(),'all seven class procs are configured');
assert.deepEqual(Object.keys(balance.skills.counter_abilities).sort(),classes.slice().sort(),'all seven class counters are configured');

assert.equal(balance.bosses.phases.length,4,'four boss phases are configured');
if(balance.combat.turn_based?.enabled){
 assert.equal(balance.combat.telegraphs.default_window_ms,0,'turn-based combat has no real-time telegraph timer');
 assert.equal(balance.combat.turn_based.cooldown_unit,'turns','cooldowns are measured in turns');
 assert.equal(balance.bosses.phases[3].damage_flat,9999,'phase four has a lethal boss strike');
}else{
 assert.equal(balance.combat.telegraphs.default_window_ms,1800,'default telegraph window is 1.8s');
 assert.equal(balance.combat.telegraphs.min_window_ms,1500,'telegraph minimum is 1.5s');
 assert.equal(balance.combat.telegraphs.max_window_ms,2000,'telegraph maximum is 2.0s');
 assert.equal(balance.bosses.phases[2].telegraph_window_ms,1000,'phase three telegraph is 1.0s');
 assert.equal(balance.bosses.phases[2].attack_speed_multiplier,1.2,'phase three attacks are 20% faster');
 assert.equal(balance.bosses.phases[3].telegraph_window_ms,1500,'phase four telegraph is 1.5s');
 assert.equal(balance.bosses.phases[3].damage_multiplier,5,'phase four hit is five times stronger');
 assert.equal(balance.bosses.phases[3].easy_miss_remaining_hp_fraction,0.1,'Easy phase-four hit leaves 10% max HP');
}
assert.equal(balance.mobs.vulnerability_multiplier,1.5,'vulnerability is +50%');
assert.equal(balance.mobs.resistance_multiplier,0.5,'resistance is -50%');
for(const classId of classes){const ultimate=balance.skills.ultimates[classId];assert.ok(ultimate.cooldown_seconds>=60&&ultimate.cooldown_seconds<=90,classId+' ultimate cooldown is 60–90s');}
for(const classId of classes){
 const counter=balance.skills.counter_abilities[classId];
 const reaction=engine.resolveReaction('strong_hit',counter.id,classId,100);
 assert.equal(reaction.counterName,counter.name,classId+' resolves its own counter');
 assert.equal(reaction.damage,Math.round(100*reaction.damageMultiplier),classId+' counter damage is deterministic');
 assert.ok(reaction.damage>=0&&reaction.damage<=100,classId+' counter damage is bounded');
 const aoe=engine.resolveReaction('aoe',counter.id,classId,100);
 assert.equal(aoe.damage,0,classId+' can counter an area telegraph');
 const poison=engine.resolveReaction('poison',counter.id,classId,100);
 assert.equal(poison.damage,0,classId+' can counter a poison telegraph');
 assert.equal(poison.cleansesPoison,true,classId+' poison counter clears a poison stack');
}
{
 const e=engine.resolveReaction('strong_hit',null,'shaman',100);
 assert.equal(e.damage,100);
 assert.equal(e.cleansesPoison,false);
 const invalid=engine.resolveReaction('strong_hit','not-a-real-counter','assassin',100);
 assert.equal(invalid.damage,100,'an unknown counter id cannot grant mitigation');
 const cleanse=engine.resolveReaction('strong_hit',balance.skills.counter_abilities.shaman.id,'shaman',100);
 assert.equal(cleanse.cleansesPoison,true,'Shaman cleanse removes an existing DoT even on a non-poison telegraph');
 assert.equal(cleanse.damage,50);
}
{
 for(const [hp,phase] of [[100,1],[71,1],[70,2],[41,2],[40,3],[11,3],[10,4],[0,4]]){
  assert.equal(engine.bossPhaseInfo(hp,100).phase,phase,'boss phase boundary at '+hp+'%');
 }
 const bossPhase4=engine.bossPhaseInfo(5,100);
 assert.equal(bossPhase4.damage_multiplier,balance.bosses.phases[3].damage_multiplier);
}
{
 const character=engine.createCharacter('Combat QA','assassin');
 const ordinary=engine.stagePlan(engine.getChar(character.id),1);
 assert.deepEqual(ordinary.mobs.slice(0,3).map(mob=>mob.role),['healer','poison','tank'],'the first three gauntlet roles are guaranteed in order');
 assert.ok(ordinary.mobs.every(mob=>mob.weakness&&mob.resistance),'every mob has an elemental weakness and resistance');
 const bossPlan=engine.stagePlan(engine.getChar(character.id),10);
 assert.equal(bossPlan.boss,true);
 assert.equal(bossPlan.mobs.length,1,'boss stages are single-target');
 assert.equal(bossPlan.mobs[0].role,'boss');
 const duelist=engine.createCharacter('Resource QA','duelist');
 const duelistLive=engine.state.characters.find(x=>x.id===duelist.id);duelistLive.run.offeredModifierIds=['arcane_hunt','last_stand','elite_bounty'];engine.setRunModifier(duelist.id,'arcane_hunt');
  const started=engine.beginStage(duelist.id,1);
 assert.equal(started.mobs.length,ordinary.mobs.length);
 assert.equal(engine.getChar(duelist.id).resource,Math.round(5*balance.resources.starting_fraction),'Duelist begins with its configured resource budget');
 assert.equal(balance.skills.panel.attack_slots,4);
 assert.equal(balance.skills.panel.counter_slot,5);
 assert.equal(balance.skills.panel.ultimate_slot,6);
 assert.equal(balance.skills.panel.slot_count,6);
 assert.equal(balance.resources.action_costs.attack_skill,22);
 assert.equal(balance.resources.action_costs.counter,18);
 assert.equal(balance.resources.action_costs.ultimate,42);
 for(const classId of classes){
  const classCombos=balance.combos.combos.filter(combo=>combo.class===classId);
  assert.ok(classCombos.length>=2&&classCombos.length<=3,classId+' has 2–3 configured combos');
  for(const combo of classCombos){
   assert.ok(combo.chain.length>=2&&combo.chain.length<=3,combo.id+' has a short actionable chain');
   assert.equal(combo.slot_binding,'selected_attack_loadout');
   assert.ok(combo.chain.every(slot=>/^slot[1-4]$/.test(slot)),combo.id+' only uses the four attack slots');
  }
 }
}
{
 const character=engine.createCharacter('Combat QA 2','assassin');
 const normal=engine.getEnemyStats(character.id,50,{type:'normal'});
 const elite=engine.getEnemyStats(character.id,50,{type:'elite'});
 const boss=engine.getEnemyStats(character.id,50,{type:'boss'});
 if(balance.combat.turn_based?.enabled){
  assert.deepEqual([normal.hp,normal.damage],[183,50]);
  assert.deepEqual([elite.hp,elite.damage],[549,75]);
  assert.deepEqual([boss.hp,boss.damage],[1098,125]);
 }else{
  assert.deepEqual([normal.hp,normal.damage],[550,150]);
  assert.deepEqual([elite.hp,elite.damage],[1650,225]);
  assert.deepEqual([boss.hp,boss.damage],[3300,375]);
 }
 const target={weakness:'fire',resistance:'ice'};
 assert.equal(engine.damageTypeMultiplier(target,'fire'),balance.mobs.vulnerability_multiplier);
 assert.equal(engine.damageTypeMultiplier(target,'ice'),balance.mobs.resistance_multiplier);
 assert.equal(engine.damageTypeMultiplier(target,'dark'),1);
}
{
 const ui=fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.js'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.css.js'),'utf8');
 assert.match(ui,/const carryShield=battle\.nextDamageShield\|\|0;[\s\S]*?loadBattleEnemy\(result\.nextTargetIndex\);[\s\S]*?battle\.nextDamageShield=carryShield/,'Dragonkin shield proc survives target handoff');
 assert.match(ui,/loadBattleEnemy\(result\.nextTargetIndex\);[\s\S]*?if\(c\.classId==="destroyer"\)[\s\S]*?battle\.playerDamageBuff=balance\.procs\.destroyer\.value/,'Destroyer kill proc is applied after the target reset');
 for(const classId of classes)assert.ok(ui.includes('balance.procs.'+classId),'runtime proc trigger exists for '+classId);
 assert.match(ui,/function processCombo\([\s\S]*?combo\.bonus\.damage_mult/,'combo completion grants configured damage bonus');
 if(balance.combat.turn_based?.enabled){
  assert.match(ui,/function buildInitiative[\s\S]*?sort\(\(a,b\)=>b\.speed-a\.speed/,'turn order sorts actors by speed');
  assert.match(ui,/function endPlayerTurn/,'player can explicitly end a turn');
  assert.match(ui,/function enemyTurn/,'enemies resolve their turns');
  assert.match(ui,/data-action="end-turn"/,'End Turn control is present');
  assert.match(ui,/tb-target-warning/,'boss and enemy warnings remain visible');
 }else{
  assert.match(ui,/triggerVfx\("enemy-hit","physical",phase===4\|\|attacker\.type==="boss"\)/,'every boss hit triggers the screen-shake path');
  assert.match(ui,/settings\(\)\.disable_telegraphs\?'<div class="tb-telegraph-disabled"/,'telegraph accessibility toggle hides the warning');
  assert.match(ui,/data-setting="disable_screen_shake"[\s\S]*?data-setting="disable_skill_flashes"[\s\S]*?data-setting="disable_telegraphs"/,'all three accessibility settings are exposed');
 }
 assert.match(ui,/root\.classList\.add\("tb-death-shaking"\)/,'death applies screen shake unless disabled');
 assert.match(ui,/function handleBattleKeys\([\s\S]*?event\.key==="Tab"[\s\S]*?\^\[1-6\]\$/,'keyboard supports target cycling and slots 1–6');
 assert.match(css,/tb-panel-slots\{display:flex;flex-direction:column/,'mobile six-slot panel is vertical');
 assert.match(css,/tb-death-shaking \.tb-death-overlay\{animation:tb-screen-shake/,'death overlay uses the screen-shake animation');
}
console.log('Combat runtime regression passed: 7 counters, telegraphs, boss phases, enemy stats, elemental matchups, 7 procs, combos and cross-target proc persistence.');
