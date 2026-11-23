'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('social-endgame.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const mode=fs.readFileSync('rpg-mode.js','utf8');
for(const marker of ['createChallenge:challenge','attackGuildBoss:hit','sendGift:gift','leaderboard:top','function accept(ch)','function guild()','function gift(to)','function topReplay()','function buy(id)'])assert.ok(source.includes(marker),'missing social feature: '+marker);
assert.match(source,/type==='healing_potion'/,'gift must consume a real healing potion');
assert.match(source,/season\(\)/,'seasonal shop must rotate on a 30-day cadence');
assert.match(source,/function top\(\)/,'offline top-100 must exist');
assert.ok(html.includes('<script src="./social-endgame.js?v=2"></script>'),'social UI must be loaded by index.html');
assert.ok(source.includes("p.id='socPanel'")&&source.includes('document.body.append(p)'),'community panel is rendered as a direct body child');
assert.ok(mode.includes(':not(#socPanel)'),'rpg-open body isolation must keep the community panel visible');
console.log('social endgame static checks: OK');

assert.match(fs.readFileSync('rpg-rework-ui.js','utf8'),/bottom-progress[\s\S]*?bottom-community[\s\S]*?bottom-shop/,'community belongs between progress and shop in the primary floating navigation');
assert.match(fs.readFileSync('rpg-rework-ui.js','utf8'),/case \"bottom-community\":window\.TowerboundSocial\?\.open\?\./,'community navigation action opens the community panel');
assert.match(source,/writing-mode:horizontal-tb!important/,'community panel normalizes inherited vertical text layout');
assert.match(source,/TowerboundSocial=\{open:/,'community panel exposes an open method for primary navigation');
assert.ok(!source.includes("launcher.id='socLauncher'"),'standalone floating community launcher is removed');

assert.match(source,/if\(!engine\)[\s\S]*?Подключаем сообщество/,'community panel waits for the game engine before rendering live content');
assert.match(source,/ready\.then\(value=>\{if\(value\)\{engine=value;render\(\)\}/,'community open retries rendering after the game engine becomes ready');
assert.match(fs.readFileSync('styles.css','utf8'),/tb-bottom-nav button>small\{[\s\S]*?font-size:clamp\(6px,1\.65vw,8px\)!important/,'floating navigation labels use compact responsive typography');
