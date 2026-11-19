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

console.log('Towerbound interactive controls audit passed: '+delegated.size+' delegated data-* selectors, '+targetFields.length+' handler data fields and '+createdActions.size+' rendered actions.');
