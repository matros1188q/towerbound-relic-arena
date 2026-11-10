'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createEngine}=require('../rpg-rework-v2.js');
const dir=path.join(__dirname,'../configs/balance');
const balance=Object.fromEntries(fs.readdirSync(dir).filter(name=>name.endsWith('.json')).map(name=>[name.slice(0,-5),JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'))]));
balance.account.max_characters=20; // This isolated test creates one fixture for each playable class.
let time=Date.UTC(2026,10,10);
const now=()=>++time;
const make=(random=()=>0)=>createEngine(balance,{now,random});
const ids=['assassin','duelist','destroyer','bishop','elemental','dragonkin','shaman'];

{
 const e=make(),c=e.createCharacter('Loot QA','assassin'),live=e.state.characters[0];
 const normal=e.rollLoot(live,{type:'normal'},100,true,false);
 assert.equal(normal.length,1,'a forced normal drop produces one equipment item');
 const item=normal[0];
 assert.equal(item.type,'equipment','gear is explicitly typed as equipment');
 assert.ok(['weapon','chest','head','accessory'].includes(item.slot),'drop uses a real gear slot');
 assert.ok(item.rarity&&item.itemLevel>=1,'equipment has rarity and item level');
 assert.ok(Object.values(item.stats).some(value=>value>0),'equipment has non-zero stats');
 assert.ok(!/трофей/i.test(item.name),'equipment name is not the generic trophy placeholder');
 assert.match(item.name,/ур\./,'generated name includes item level');
 const boss=e.rollLoot(live,{type:'boss'},10,true,false);
 assert.ok(boss.some(drop=>drop.type==='equipment'&&drop.slot==='weapon'),'first-clear boss reward is a real weapon');
}

{
 const e=make();
 for(const id of ids){
  const c=e.createCharacter('Hero '+id,id),live=e.state.characters.find(x=>x.id===c.id);
  if(id==='dragonkin')live.branch='fire_dragon';
  if(id==='shaman')live.branch='nature';
  const profile=e.basicAttackStats(c.id);
  const expected={assassin:1,duelist:1,destroyer:1,bishop:.5,elemental:.5,dragonkin:1,shaman:1}[id];
  assert.equal(profile.multiplier,expected,id+' basic attack uses its class/branch multiplier');
  assert.ok(profile.damage>0,id+' basic attack always deals damage');
  live.resource=0;
  assert.equal(e.restoreResource(c.id,profile.resourceGain).gained,15,id+' basic attack resource gain is +15');
 }
 const dragon=e.createCharacter('Arcane Dragon','dragonkin'),dragonLive=e.state.characters.find(x=>x.id===dragon.id);
 dragonLive.branch='black_dragon';assert.equal(e.basicAttackStats(dragon.id).multiplier,.5,'black dragon magic branch uses 50% basic attack');
 const shaman=e.createCharacter('Spirit Shaman','shaman'),shamanLive=e.state.characters.find(x=>x.id===shaman.id);
 shamanLive.branch='dark_gods';assert.equal(e.basicAttackStats(shaman.id).multiplier,.5,'dark gods magic branch uses 50% basic attack');
 assert.equal(e.capBossDamage({type:'boss',maxHp:1000},900,0),350,'one boss damage action is capped at 35% max HP');
 assert.equal(e.capBossDamage({type:'boss',maxHp:1000},300,250),100,'multi-hit actions share the same boss damage cap');
 assert.equal(e.capBossDamage({type:'normal',maxHp:1000},900,0),900,'normal enemies are not affected by the boss cap');
}

{
 const e=make(),c=e.createCharacter('Gear QA','assassin'),live=e.state.characters[0];
 live.bag.push(
  {id:'epic-weapon',type:'equipment',slot:'weapon',rarity:'Эпическая',itemLevel:20,stats:{attack:35},refine:0,sockets:[]},
  {id:'common-chest',type:'equipment',slot:'chest',rarity:'Обычная',itemLevel:10,stats:{defense:10,health:80},refine:0,sockets:[]},
  {id:'craft-stack',type:'craft_material',quantity:4}
 );
 const equipped=e.equipBest(c.id);
 assert.equal(equipped.equipped,2,'equip best selects the strongest candidate for each occupied slot');
 assert.equal(live.gear[0].id,'epic-weapon','highest-score weapon is equipped');
 assert.equal(live.gear[1].id,'common-chest','best available chest is equipped');
 assert.ok(live.bag.some(item=>item.type==='craft_material'),'non-equipment materials remain in the bag');
 live.bag.push(
  {id:'gray-1',type:'equipment',slot:'head',rarity:'Обычная',itemLevel:4,stats:{defense:2},refine:0,sockets:[]},
  {id:'gray-2',type:'equipment',slot:'accessory',rarity:'Обычная',itemLevel:4,stats:{attack:2},refine:0,sockets:[]},
  {id:'rare-keep',type:'equipment',slot:'legs',rarity:'Редкая',itemLevel:4,stats:{defense:3},refine:0,sockets:[]}
 );
 const salvaged=e.salvageGrayItems(c.id);
 assert.equal(salvaged.count,2,'bulk salvage removes only gray/common equipment in the bag');
 assert.ok(salvaged.materials>0,'bulk salvage converts gray gear into crafting materials');
 assert.ok(live.bag.some(item=>item.id==='rare-keep'),'rare equipment is preserved');
 assert.ok(!live.bag.some(item=>item.id==='gray-1'||item.id==='gray-2'),'salvaged gray items are removed');
 assert.throws(()=>e.equipItem(c.id,'craft-stack'),/нельзя надеть/i,'materials cannot be equipped');
}

{
 const ui=fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.js'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'../native-pwa.css'),'utf8');
 assert.match(ui,/data-basic-attack/,'battle UI renders and routes the basic attack button');
 assert.match(ui,/engine\.restoreResource\(c\.id,profile\.resourceGain\)/,'basic attack restores resource on a successful hit');
 assert.match(ui,/for\(let hit=0;hit<3&&battle\.enemy\.hp>0;hit\+\+\)/,'single-target ultimate is resolved as three hits');
 assert.match(ui,/engine\.capBossDamage\(target,damage,used\)/,'every boss hit uses the per-action damage cap');
 assert.match(ui,/data-action="equip-best"/,'inventory exposes equip best');
 assert.match(ui,/data-action="salvage-gray"/,'inventory exposes bulk gray salvage');
 assert.match(ui,/is-better/,'gear comparison renders better stats in green');
 assert.match(ui,/is-worse/,'gear comparison renders worse stats in red');
 assert.match(css,/overflow-x:auto!important/,'profile tabs support horizontal swipe scrolling');
 assert.match(ui,/function safeTimeoutMs\(value,fallback=1000\)/,'enemy turn timer normalizes delays to a finite numeric fallback');
 assert.match(ui,/function recoverPlayerTurn\(error\)[\s\S]*?battle\.busy=false;battle\.isPlayerTurn=true/,'turn errors restore player control and clear the busy flag');
 assert.match(fs.readFileSync(path.join(__dirname,'../rpg-rework-v2.js'),'utf8'),/Number\.isFinite\(attackIntervalMs\)/,'enemy attack interval never propagates NaN into combat timing');
 assert.match(ui,/Number\.isFinite\(until\).*ПОСЛЕ ТВОЕГО ХОДА/,'turn-based telegraph never renders NaN seconds without a numeric deadline');
 assert.match(ui,/battle\.isPlayerTurn=true;[\s\S]*?battle\.actor=\{type:"player"/,'enemy turn exceptions restore player control');
 assert.match(ui,/ПОДТВЕРДИТЬ ВЫБОР/,'specialization selection requires explicit confirmation');
 assert.match(ui,/data-action="confirm-branch"/,'specialization confirmation has a dedicated action');
 assert.doesNotMatch(fs.readFileSync(path.join(__dirname,'../rpg-mode.js'),'utf8'),/id="tbExtraBar"/,'legacy duplicate top navigation is removed');
 assert.match(fs.readFileSync(path.join(__dirname,'../rpg-rework-ui.css.js'),'utf8'),/tb-chapter-card\{display:block!important;width:100%;min-width:0/,'chapter lore card uses a stable full-width layout');
}
console.log('Loot/combat update: all assertions passed.');
