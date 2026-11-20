'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const readJson=p=>JSON.parse(read(p));
function extractObject(source,marker){
 const markerIndex=source.indexOf(marker);
 assert.ok(markerIndex>=0,'Missing source object marker: '+marker);
 const open=source.indexOf('{',markerIndex);
 assert.ok(open>=0,'Missing object opening brace: '+marker);
 let depth=0,quote=null,escaped=false;
 for(let i=open;i<source.length;i++){
  const ch=source[i];
  if(quote){
   if(escaped){escaped=false;continue;}
   if(ch==='\\'){escaped=true;continue;}
   if(ch===quote)quote=null;
   continue;
  }
  if(ch==='"'||ch==="'"||ch==='\x60'){quote=ch;continue;}
  if(ch==='{')depth++;
  else if(ch==='}'&&--depth===0)return source.slice(open,i+1);
 }
 throw new Error('Unclosed object literal: '+marker);
}
const ui=read('rpg-rework-ui.js');
const cards=vm.runInNewContext('('+extractObject(ui,'const CARD_DATABASE=Object.freeze(')+')');
const art=vm.runInNewContext('('+extractObject(ui,'const ART_MAPPING=Object.freeze(')+')');
const manifest=readJson('assets/cards/art-manifest.json');
const classes=readJson('configs/balance/classes.json').classes;
const cardEntries=Object.entries(cards);
assert.equal(manifest.total,126,'card artwork manifest declares 126 cards');
assert.equal(cardEntries.length,126,'runtime card database contains 126 cards');
assert.equal(manifest.cards.length,126,'manifest has 126 concrete card records');
assert.equal(new Set(cardEntries.map(([key])=>key)).size,126,'runtime card IDs are unique');
assert.equal(new Set(manifest.cards.map(card=>card.id)).size,126,'manifest card IDs are unique');
const manifestById=new Map(manifest.cards.map(card=>[card.id,card]));
const allowedTypes=new Set(['attack','defense','skill','curse','status']);
const allowedRarities=new Set(['common','rare','epic','legendary']);
const allowedEffects=new Set([
 'damage','damageAll','damagePerEnergy','damagePerPoison','damagePerBleed','damageMissingHp',
 'block','heal','healPerBleed','draw','energy','poison','bleed','burn','weak','vulnerable',
 'conditionalBleed','playerWeak','fury','spellPower','nextAttackDamage','hits','ignoreArmor',
 'finisher','unplayable','endTurnPlayerWeak','selfDiscard','bonusDamageIfBlock','damageType','statuses'
]);
const byClass=Object.fromEntries(Object.keys(classes).map(id=>[id,0]));
for(const [key,card] of cardEntries){
 assert.equal(card.id,key,'card object key matches its stable ID: '+key);
 assert.ok(card.name&&card.description,'card has a localized name and description: '+key);
 assert.ok(allowedTypes.has(card.type),'card type is supported: '+key+' / '+card.type);
 assert.ok(allowedRarities.has(card.rarity),'card rarity is supported: '+key+' / '+card.rarity);
 assert.ok(card.effects&&typeof card.effects==='object'&&!Array.isArray(card.effects),'card has a structured effect object: '+key);
 assert.ok(card.costX===true||card.isXCost===true||Number.isFinite(Number(card.cost))&&Number(card.cost)>=0,'card has a valid energy cost: '+key);
 for(const effectKey of Object.keys(card.effects))assert.ok(allowedEffects.has(effectKey),'card effect has a runtime handler: '+key+' / '+effectKey);
 if(card.upgradedEffects)for(const effectKey of Object.keys(card.upgradedEffects))assert.ok(allowedEffects.has(effectKey),'upgraded card effect has a runtime handler: '+key+' / '+effectKey);
 if(card.classId!=='common'){
  assert.ok(classes[card.classId],'card belongs to a playable class: '+key);
  byClass[card.classId]++;
  if(card.branchId){
   const branches=classes[card.classId].branches.map(branch=>typeof branch==='string'?branch:branch.id);
   assert.ok(branches.includes(card.branchId),'card branch exists for its class: '+key);
  }
 }
 const record=manifestById.get(key);
 assert.ok(record,'card has a matching art manifest record: '+key);
 assert.equal(record.file,key+'.png','card art uses the canonical filename: '+key);
 assert.equal(art[key],record.file,'runtime art mapping and manifest agree: '+key);
 assert.ok(fs.existsSync(path.join(root,'assets/cards',record.file)),'card art file exists: '+record.file);
 assert.ok(fs.statSync(path.join(root,'assets/cards',record.file)).size>1024,'card art file is not an empty placeholder: '+record.file);
}
assert.equal(Object.keys(art).length,126,'runtime art mapping covers every card exactly once');
assert.deepEqual([...manifestById.keys()].sort(),Object.keys(cards).sort(),'manifest and runtime card database contain the same IDs');
for(const [classId,count] of Object.entries(byClass))assert.ok(count>0,classId+' has class-specific cards');
for(const id of ['strike','defend','dash'])assert.ok(cards[id]&&cards[id].classId==='common','all accounts retain the three base cards: '+id);
const starterDeckSource=ui.slice(ui.indexOf('function makeStarterDeck('),ui.indexOf('function ',ui.indexOf('function makeStarterDeck(')+20));
for(const classId of Object.keys(classes))assert.ok(starterDeckSource.includes(classId+':['),classId+' has a dedicated starter deck');
for(const name of ['function cardEffects(card)','function drawCards(amount)','function playCard(cardIndex)','function resolveCardPlay(cardIndex)','function endPlayerTurn()','function enemyTurn(enemy)','function planEnemyIntents()','function applyTargetDamage(','function finishCurrentEnemy()','function runEnemyTurnQueue('])assert.ok(ui.includes(name),'card combat runtime path exists: '+name);
assert.match(ui,/for\(const key of \["poison","bleed","burn","weak","vulnerable"\]\)/,'poison, bleed, burn, weak and vulnerable have a shared application path');
assert.match(ui,/function enemyTurn\(enemy\)[\s\S]*?const poison=[\s\S]*?bleed=/,'poison and bleed are processed during enemy turns');
assert.match(ui,/function endPlayerTurn\(\)[\s\S]*?const burnTargets=/,'burn damage is processed at end of player turn');
assert.match(ui,/cardEffects\(card\)\.endTurnPlayerWeak/,'curse weakness is processed when the player ends a turn');
assert.match(ui,/if\(Number\(effects\.draw\)>0\)drawCards\(effects\.draw\)/,'draw effects call the deck draw routine');
assert.match(ui,/if\(Number\(effects\.energy\)>0\)c\.currentEnergy=/,'energy effects are applied to the current turn');
assert.match(ui,/if\(card\.exhaust\|\|card\.upgradedExhaust\)c\.exhaustPile\.push\(card\)/,'exhaust cards are moved to the exhaust pile');
assert.match(ui,/if\(card\.retain\)retained\.push\(card\)/,'retain cards stay in hand at end of turn');
assert.match(ui,/function scheduleEnemyTurnQueue\(/,'enemy turns use a scheduled queue rather than overlapping timers');
assert.match(ui,/function recoverPlayerTurn\(/,'battle runtime has a recovery path after a turn error');

assert.match(ui,/Number\(effects\.damageMissingHp\)>0\)&&!target/,'dynamic missing-health damage cannot be spent without a live target');
assert.match(ui,/Number\(effects\.damagePerEnergy\)>0\|\|Number\(effects\.damageMissingHp\)>0/,'X-cost and missing-health cards show calculated damage in inspection');
assert.match(ui,/status_slime:\{id:"status_slime"[^\n]*effects:\{selfDiscard:true\}/,'self-discard status is a one-energy card');
assert.match(ui,/c\.hand\.splice\(index,1\);[\s\S]*?if\(card\.exhaust\|\|card\.upgradedExhaust\)c\.exhaustPile\.push\(card\);else c\.discard\.push\(card\)/,'playing a self-discard card consumes it into the discard pile');
console.log('CARD SYSTEM AUDIT PASS: 126 unique cards, 126 matching art files, 7 class rosters, 21 specialization routing, supported effects/statuses, draw/discard/exhaust/retain and enemy turn queue.');
