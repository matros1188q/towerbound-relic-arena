(()=>{'use strict';if(window.__TB_COMBAT_VISUALS__)return;window.__TB_COMBAT_VISUALS__=true;
const getRoot=()=>document.querySelector('#tbRpg .tb-v2');
const style=document.createElement('style');style.id='tb-combat-visuals-style';
style.textContent=[
'#tbRpg .tb-v2 .tb-arena{position:relative;isolation:isolate;background-image:linear-gradient(180deg,rgba(5,8,12,.25),rgba(5,8,12,.72)),url(./assets/arena-background.webp);background-size:cover;background-position:center;transition:background-position 1.2s ease}',
'#tbRpg .tb-v2 .tb-enemy-focus.tb-hit-spark{animation:tb-hit-spark .2s ease-out}',
'#tbRpg .tb-v2 .tb-target-card.tb-death-dissolve{animation:tb-mob-death .55s ease-in forwards}',
'#tbRpg .tb-v2 .tb-panel-skill:not(:disabled){animation:tb-skill-ready 1.8s ease-in-out infinite alternate}',
'#tbRpg .tb-v2 .tb-profile-avatar img,#tbRpg .tb-v2 .tb-mini-avatar img{animation:tb-hero-idle 3.4s ease-in-out infinite}',
'#tbRpg .tb-v2.tb-low-hp:after{content:"";position:fixed;inset:0;z-index:999990;pointer-events:none;box-shadow:inset 0 0 60px 18px rgba(220,20,35,.72);animation:tb-low-hp 1.1s ease-in-out infinite alternate}',
'#tbRpg .tb-v2 .tb-boss-intro{position:fixed;inset:0;z-index:999999;display:grid;place-content:center;text-align:center;background:radial-gradient(ellipse,#34251d,#05070b 75%);animation:tb-boss-intro 2s ease forwards;pointer-events:none}',
'#tbRpg .tb-v2 .tb-boss-intro b{font:900 clamp(28px,7vw,64px) Georgia;color:#f1d18b;text-shadow:0 0 28px #b13b27}',
'#tbRpg .tb-v2 .tb-weather{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}',
'#tbRpg .tb-v2 .tb-weather i{position:absolute;top:-12%;left:var(--x);font-size:var(--s);opacity:var(--o);animation:tb-weather-fall var(--d) linear infinite}',
'#tbRpg .tb-v2 .tb-combat-status{position:absolute;z-index:15;top:18%;left:50%;transform:translateX(-50%);font-size:22px;animation:tb-status-rise 1.1s ease-out forwards;pointer-events:none}',
'@keyframes tb-hit-spark{0%{filter:brightness(1)}30%{filter:brightness(3) saturate(0);box-shadow:0 0 0 5px #fff,0 0 38px #fff}100%{filter:brightness(1)}}',
'@keyframes tb-mob-death{to{opacity:0;transform:scale(.72) rotate(-4deg);filter:blur(4px)}}',
'@keyframes tb-skill-ready{from{box-shadow:0 0 0 1px #e6c77c22}to{box-shadow:0 0 17px #e6c77c77}}',
'@keyframes tb-hero-idle{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}',
'@keyframes tb-low-hp{to{opacity:.25}}',
'@keyframes tb-boss-intro{0%{opacity:0}10%,80%{opacity:1}100%{opacity:0;visibility:hidden}}',
'@keyframes tb-weather-fall{to{transform:translate3d(-15vw,120vh,0) rotate(180deg)}}',
'@keyframes tb-status-rise{0%{opacity:0;transform:translate(-50%,12px) scale(.8)}20%{opacity:1}100%{opacity:0;transform:translate(-50%,-48px) scale(1.1)}}'
].join('\n');document.head.appendChild(style);
let stageSeen=0,bossSeen='',lastHp='';
function update(){const root=getRoot();if(!root)return;const arena=root.querySelector('.tb-arena');if(!arena){root.classList.remove('tb-low-hp');return;}
const match=(root.querySelector('.tb-arena-top')?.textContent||'').match(/ЭТАП\s+(\d+)/i);const stage=Number(match?.[1]||0);
if(stage){if(!arena.querySelector('.tb-weather')){const layer=document.createElement('div');layer.className='tb-weather';const chapter=Math.floor((stage-1)/50)%3,icons=chapter===0?['❄','✧']:chapter===1?['◆','✦']:['╱','💧'];for(let i=0;i<16;i++){const p=document.createElement('i');p.textContent=icons[i%icons.length];p.style.setProperty('--x',Math.random()*100+'%');p.style.setProperty('--s',8+Math.random()*12+'px');p.style.setProperty('--o',String(.12+Math.random()*.3));p.style.setProperty('--d',3+Math.random()*5+'s');p.style.animationDelay=-Math.random()*7+'s';layer.appendChild(p);}arena.appendChild(layer);}
if(stage!==stageSeen){arena.style.backgroundPosition=(stage%2?'53%':'47%')+' center';stageSeen=stage;}}
const hp=root.querySelector('.tb-battle-hero .tb-healthbar span');if(hp)root.classList.toggle('tb-low-hp',(parseFloat(hp.style.width)||100)<20);
root.querySelectorAll('.tb-healthbar.enemy span,.tb-target-hp i').forEach(bar=>{const w=parseFloat(bar.style.width)||100;bar.style.background=w>60?'linear-gradient(90deg,#278e54,#64d88a)':w>25?'linear-gradient(90deg,#b58a24,#f1d45b)':'linear-gradient(90deg,#8e1726,#ff4b58)';});
root.querySelectorAll('.tb-target-card.defeated:not(.tb-death-dissolve)').forEach(card=>card.classList.add('tb-death-dissolve'));
const title=root.querySelector('.tb-enemy-title');if(title&&/босс|хранитель/i.test(title.textContent)){const key=title.textContent+':'+stage;if(key!==bossSeen){bossSeen=key;const intro=document.createElement('div');intro.className='tb-boss-intro';intro.innerHTML='<small>ПРИБЛИЖАЕТСЯ БОСС</small><b></b>';intro.querySelector('b').textContent=title.textContent;root.appendChild(intro);setTimeout(()=>intro.remove(),2100);}}
const focus=root.querySelector('.tb-enemy-focus'),width=focus?.querySelector('.tb-healthbar.enemy span')?.style.width||'';if(focus&&width!==lastHp){lastHp=width;focus.classList.remove('tb-hit-spark');void focus.offsetWidth;focus.classList.add('tb-hit-spark');setTimeout(()=>focus.classList.remove('tb-hit-spark'),220);}
}
const observer=new MutationObserver(()=>{const root=getRoot();if(root&&!root.__tbCombatVisualObserver){root.__tbCombatVisualObserver=true;observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});}update();});
observer.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('tb:combat-status',e=>{const arena=getRoot()?.querySelector('.tb-arena');if(!arena)return;const node=document.createElement('b');node.className='tb-combat-status';node.textContent=e.detail?.text||'☠';arena.appendChild(node);setTimeout(()=>node.remove(),1150);});
window.TowerboundCombatVisuals={status:text=>document.dispatchEvent(new CustomEvent('tb:combat-status',{detail:{text}})),refresh:update};
update();
})();