'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'rpg-rework-ui.js'),'utf8');
const start=ui.indexOf('function handleClick(event){');
const end=ui.indexOf('root.addEventListener("pointerup"',start);
assert.ok(start>=0&&end>start,'RPG UI has one delegated click handler');

const handler=ui.slice(start,end);
const match=handler.match(/event\.target\.closest\("([^"]+)"\)/);
assert.ok(match,'delegated click handler resolves actionable elements with closest()');
const selector=match[1];
const delegated=new Set([...selector.matchAll(/\[data-([a-z0-9-]+)\]/g)].map(item=>item[1]));
const toKebab=value=>value.replace(/[A-Z]/g,char=>'-'+char.toLowerCase());

// These are companion values read from the same clickable control as its primary
// action attribute, rather than independent click targets.
const companionFields=new Set(['statusValue','panelSlot','gemIndex']);
const targetFields=[...new Set([...handler.matchAll(/target\.dataset\.([A-Za-z_$][\w$]*)/g)].map(item=>item[1]))];
const missingFields=targetFields
 .filter(field=>!companionFields.has(field)&&!delegated.has(toKebab(field)))
 .map(toKebab)
 .sort();
assert.deepEqual(missingFields,[],
 'every data-* field read by handleClick must be reachable through its delegated selector');

const createdActions=new Set([...ui.matchAll(/data-action=(?:\\)?["']([a-z][a-z0-9-]*)["']/g)].map(item=>item[1]));
const handledActions=new Set([
 ...[...handler.matchAll(/target\.dataset\.action\s*===\s*"([^"]+)"/g)].map(item=>item[1]),
 ...[...handler.matchAll(/case\s+"([^"]+)"/g)].map(item=>item[1])
]);
const unhandledActions=[...createdActions].filter(action=>!handledActions.has(action)).sort();
assert.deepEqual(unhandledActions,[],
 'every literal data-action rendered by the RPG UI must have a click-handler branch');

// button(action, ...) is the shared renderer for dynamic controls; literal
// data-action scanning alone misses actions assembled through this helper.
const helperActions=new Set([...ui.matchAll(/\bbutton\(\s*["']([^"']+)["']/g)].map(item=>item[1]));
const unhandledHelperActions=[...helperActions].filter(action=>!handledActions.has(action)).sort();
assert.deepEqual(unhandledHelperActions,[],
 'every action passed to the shared button() renderer must have a click-handler branch');
const economy=JSON.parse(fs.readFileSync(path.join(root,'configs/balance/economy.json'),'utf8'));
const antidote=economy.silver_store.extra.find(item=>item.id==='antidote');
assert.deepEqual(antidote&&{price:antidote.price,effect:antidote.effect},{price:15,effect:'antidote'},
 'the map trap antidote action must resolve to a real silver-store consumable');



const social=fs.readFileSync(path.join(root,'social-endgame.js'),'utf8');
assert.ok(social.includes("e.target.closest('#socPanel [data-soc],#socPanel [data-tab]')"),
 'social click delegation is scoped to the social panel and cannot capture unrelated game tabs');
const progression=fs.readFileSync(path.join(root,'progression-24.js'),'utf8');
assert.ok(progression.includes("closest('[data-progress-tab]')")&&progression.includes('t.dataset.progressTab'),
 'progression tabs use their own delegated attribute instead of the game-wide profile data-tab');
assert.equal((progression.match(/data-tab=/g)||[]).length,0,
 'progression markup does not publish generic data-tab controls into the RPG root');


assert.ok(progression.includes("if(!overlay||!overlay.isConnected)")&&progression.includes("document.body.append(overlay)"),
 'progression overlay is mounted outside the replaceable RPG render root and recreated after removal');
const legacyRpg=fs.readFileSync(path.join(root,'rpg-mode.js'),'utf8');
assert.ok(legacyRpg.includes('body.rpg-open>*:not(#tbRpg):not(#tbProgressionOverlay)'),
 'legacy body isolation keeps the body-mounted meta progression overlay visible');

assert.ok(progression.includes("if(!overlay?.isConnected)inject();"),
 'the progression entry point recreates a missing overlay before opening it');

console.log('Towerbound interactive controls audit passed: '+delegated.size+' delegated data-* selectors, '+targetFields.length+' handler data fields and '+createdActions.size+' rendered actions.');
