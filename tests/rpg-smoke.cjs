'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const root=process.cwd(),srv=http.createServer((q,r)=>{const f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0].slice(1));fs.readFile(f,(e,d)=>e?r.writeHead(404).end():r.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':'text/html'}).end(d));});await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));const b=await chromium.launch({headless:true}),p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));try{
await p.goto('http://127.0.0.1:'+srv.address().port);
await p.locator('#new').click();await p.locator('#name').fill('RPG QA');await p.locator('#confirm').click();
assert.equal(await p.locator('.mapbox button').count(),250,'all 250 stages render');
await p.locator('#profile').click();await p.locator('[data-tab=talents]').click();assert.match(await p.locator('.profile').innerText(),/Таланты/);
await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('tb-rpg-v1'));const c=d.chars[0];c.level=10;c.points=9;c.xp=100000;c.bag=[{id:'qa-item',name:'QA Blade',slot:0,rarity:'Эпическая',ri:2,stat:{atk:5,def:2,hp:10,crit:2,evade:1},set:'QA set'}];localStorage.setItem('tb-rpg-v1',JSON.stringify(d));});
await p.reload();assert.match(await p.locator('#tbRpg').innerText(),/RPG QA/,'character save survives reload');
await p.locator('#profile').click();await p.locator('[data-tab=talents]').click();await p.locator('[data-branch="0"]').click();assert.match(await p.locator('.profile').innerText(),/Бастион/);
await p.locator('[data-t="atk"]').click();assert.match(await p.locator('.profile').innerText(),/Сила · 1\/20/);
await p.locator('[data-tab=bag]').click();await p.locator('[data-e="0"]').click();await p.locator('[data-tab=gear]').click();assert.match(await p.locator('.profile').innerText(),/QA Blade/,'equipment can be equipped and persists');
await p.locator('#back').click();await p.locator('#start').click();await p.locator('#hit').click();await p.locator('#speed').click();assert.match(await p.locator('#speed').innerText(),/×2/);
assert.deepEqual(errors,[]);
}finally{await b.close();srv.close();}})().catch(e=>{console.error(e);process.exit(1)});