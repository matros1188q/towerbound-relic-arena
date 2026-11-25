(()=>{'use strict';if(window.__TB_COMBAT_VISUALS__)return;window.__TB_COMBAT_VISUALS__=true;
const getRoot=()=>document.querySelector('#tbRpg .tb-v2');
const style=document.createElement('style');style.id='tb-combat-visuals-style';
style.textContent=[
'#tbRpg .tb-v2 .tb-arena{position:relative;isolation:isolate;background-image:linear-gradient(180deg,rgba(5,8,12,.25),rgba(5,8,12,.72)),var(--tb-arena-bg, url("./assets/chapters/image_2.jpeg"));background-size:cover;background-position:center;transition:background-position 1.2s ease}',
'#tbRpg .tb-v2 .tb-arena:before,#tbRpg .tb-v2 .tb-arena:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:1;background-repeat:no-repeat;background-size:cover;transition:transform 1.2s ease}',
'#tbRpg .tb-v2 .tb-arena:before{background-image:linear-gradient(180deg,transparent,rgba(5,8,12,.25)),radial-gradient(ellipse at 50% 20%,rgba(100,130,150,.15),transparent 65%);transform:translateX(var(--tb-back-parallax,0px))}',
'#tbRpg .tb-v2 .tb-arena:after{background-image:linear-gradient(90deg,rgba(5,8,12,.3),transparent 25%,transparent 75%,rgba(5,8,12,.3));transform:translateX(var(--tb-front-parallax,0px))}',
'#tbRpg .tb-v2 .tb-arena>*{position:relative;z-index:2}',
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
'#tbRpg .tb-v2 .tb-ultimate-dark{position:fixed;inset:0;z-index:999998;background:rgba(0,0,0,.78);pointer-events:none;animation:tb-ultimate-dim 1s ease-out forwards}',
'#tbRpg .tb-v2 .new-hero-side.tb-ancient-proc{z-index:4;animation:tb-ancient-proc-pulse .82s cubic-bezier(.2,.8,.2,1)}',
'#tbRpg .tb-v2 .new-hero-side.tb-ancient-proc-critical{--tb-proc-color:#fff0a5;filter:drop-shadow(0 0 22px #ffe58c)}',
'#tbRpg .tb-v2 .new-hero-side.tb-ancient-proc-block{--tb-proc-color:#80ddff;filter:drop-shadow(0 0 22px #61cfff)}',
'#tbRpg .tb-v2 .new-hero-side.tb-ancient-proc-magic{--tb-proc-color:#c5a2ff;filter:drop-shadow(0 0 24px #aa7bff)}',
'#tbRpg .tb-v2 .new-enemy-item.tb-ancient-target-proc{position:relative;z-index:6;animation:tb-ancient-target-hit .72s ease-out}',
'#tbRpg .tb-v2 .new-enemy-item.tb-ancient-target-proc .tb-ancient-proc-burst{top:48%;width:115%;height:115%}',
'@keyframes tb-ancient-target-hit{0%{transform:scale(1);filter:brightness(1)}22%{transform:scale(1.09);filter:brightness(2.2) drop-shadow(0 0 18px #fff0a5)}100%{transform:scale(1);filter:brightness(1)}}',
'#tbRpg .tb-v2 .new-hero-side.tb-ancient-proc .tb-ancient-orbit{animation:tb-ancient-proc-orbit .82s ease-out}',
'#tbRpg .tb-v2 .tb-ancient-proc-burst{position:absolute;z-index:8;left:50%;top:42%;width:100%;height:100%;transform:translate(-50%,-50%);pointer-events:none;color:var(--tb-proc-color);filter:drop-shadow(0 0 12px var(--tb-proc-color));animation:tb-ancient-burst-in var(--tb-proc-duration,850ms) ease-out forwards}',
'#tbRpg .tb-v2 .tb-ancient-proc-burst b{position:absolute;left:50%;top:42%;font:900 calc(27px + var(--tb-proc-tier)*5px)/1 Georgia;transform:translate(-50%,-50%);animation:tb-ancient-glyph var(--tb-proc-duration,850ms) ease-out forwards}',
'#tbRpg .tb-v2 .tb-ancient-proc-burst small{position:absolute;left:50%;top:62%;white-space:nowrap;font:900 8px/1 system-ui;letter-spacing:.2em;color:var(--tb-proc-color);text-shadow:0 2px 8px #000;transform:translateX(-50%);animation:tb-ancient-label var(--tb-proc-duration,850ms) ease-out forwards}',
'#tbRpg .tb-v2 .tb-ancient-proc-ring{position:absolute;left:50%;top:44%;width:58%;aspect-ratio:1;border:2px solid var(--tb-proc-color);border-radius:50%;box-shadow:0 0 16px var(--tb-proc-color),inset 0 0 12px var(--tb-proc-color);transform:translate(-50%,-50%) scale(.25);animation:tb-ancient-ring-burst var(--tb-proc-duration,850ms) cubic-bezier(.12,.8,.2,1) forwards}',
'#tbRpg .tb-v2 .tb-ancient-proc-ring:nth-child(2){width:78%;border-style:dashed;animation-delay:65ms}',
'@keyframes tb-ancient-burst-in{0%{opacity:0;transform:translate(-50%,-50%) scale(.65)}20%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.16)}}',
'@keyframes tb-ancient-glyph{0%{opacity:0;transform:translate(-50%,-20%) scale(.3) rotate(-25deg)}28%{opacity:1;transform:translate(-50%,-50%) scale(1.2) rotate(0)}100%{opacity:0;transform:translate(-50%,-100%) scale(.82)}}',
'@keyframes tb-ancient-label{0%,25%{opacity:0;transform:translate(-50%,8px)}45%{opacity:1}100%{opacity:0;transform:translate(-50%,-14px)}}',
'@keyframes tb-ancient-ring-burst{0%{opacity:0;transform:translate(-50%,-50%) scale(.22) rotate(0)}22%{opacity:.95}100%{opacity:0;transform:translate(-50%,-50%) scale(1.65) rotate(125deg)}}',
'@media(prefers-reduced-motion:reduce){#tbRpg .tb-v2 .tb-ancient-proc-burst,#tbRpg .tb-v2 .tb-ancient-proc-burst *{animation:none!important;opacity:0!important}}',
'@keyframes tb-ultimate-dim{0%{opacity:0}18%{opacity:1}100%{opacity:0}}',
'@keyframes tb-ancient-proc-pulse{0%{transform:scale(1);filter:brightness(1)}24%{transform:scale(1.055);filter:brightness(1.8) drop-shadow(0 0 18px var(--tb-proc-color,#fff))}100%{transform:scale(1);filter:brightness(1)} }',
'@keyframes tb-ancient-proc-orbit{0%{opacity:.65;transform:scale(.8) rotate(0)}45%{opacity:1;transform:scale(1.28) rotate(110deg)}100%{opacity:.85;transform:scale(1) rotate(220deg)}}',
'@keyframes tb-hit-spark{0%{filter:brightness(1)}30%{filter:brightness(3) saturate(0);box-shadow:0 0 0 5px #fff,0 0 38px #fff}100%{filter:brightness(1)}}',
'@keyframes tb-mob-death{to{opacity:0;transform:scale(.72) rotate(-4deg);filter:blur(4px)}}',
'@keyframes tb-skill-ready{from{box-shadow:0 0 0 1px #e6c77c22}to{box-shadow:0 0 17px #e6c77c77}}',
'@keyframes tb-hero-idle{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}',
'@keyframes tb-low-hp{to{opacity:.25}}',
'@keyframes tb-boss-intro{0%{opacity:0}10%,80%{opacity:1}100%{opacity:0;visibility:hidden}}',
'@keyframes tb-weather-fall{to{transform:translate3d(-15vw,120vh,0) rotate(180deg)}}',
'@keyframes tb-status-rise{0%{opacity:0;transform:translate(-50%,12px) scale(.8)}20%{opacity:1}100%{opacity:0;transform:translate(-50%,-48px) scale(1.1)}}'
].join(String.fromCharCode(10));document.head.appendChild(style);
let stageSeen=0,bossSeen='',lastHp='';
function ancientProc(event){const root=getRoot();if(!root)return;const hero=root.querySelector(".new-hero-side.tb-ancient-awakened");if(!hero)return;const kind=String(event.detail?.kind||"magic"),tier=Math.min(4,Math.max(2,Number(event.detail?.tier)||2)),className="tb-ancient-proc-"+kind;hero.classList.remove("tb-ancient-proc", "tb-ancient-proc-critical","tb-ancient-proc-block","tb-ancient-proc-magic");void hero.offsetWidth;hero.classList.add("tb-ancient-proc",className);setTimeout(()=>hero.classList.remove("tb-ancient-proc",className),900);const labels={critical:"✦ КРИТИЧЕСКИЙ УДАР",block:"◈ ЩИТ ДРЕВНИХ",magic:"✧ РЕЗОНАНС СТИХИЙ"};window.TowerboundCombatVisuals?.status(labels[kind]||"✧ ПРОБУЖДЕНИЕ");}
document.addEventListener("tb:ancient-relic-proc",ancientProc);

function ancientBurst(event){
 const root=getRoot(),hero=root?.querySelector(".new-hero-side.tb-ancient-awakened");if(!hero)return;
 const kind=String(event.detail?.kind||"magic"),tier=Math.min(4,Math.max(2,Number(event.detail?.tier)||2));
 const targetIndex=Number(event.detail?.targetIndex),target=Number.isInteger(targetIndex)?root.querySelector('.new-enemy-item[data-target="'+targetIndex+'"]'):null;
 const anchor=kind==="critical"&&target?target:hero;
 const config={critical:{glyph:"✦",label:"ПРОРЫВ",color:"#fff0a5"},block:{glyph:"◈",label:"БАРЬЕР",color:"#80ddff"},magic:{glyph:"✧",label:"РЕЗОНАНС",color:"#c5a2ff"}},fx=config[kind]||config.magic;
 if(kind==="critical"&&target){target.classList.remove("tb-ancient-target-proc");void target.offsetWidth;target.classList.add("tb-ancient-target-proc");setTimeout(()=>target.classList.remove("tb-ancient-target-proc"),800);}
 const burst=document.createElement("span");burst.className="tb-ancient-proc-burst";burst.setAttribute("aria-hidden","true");
 burst.style.setProperty("--tb-proc-color",fx.color);burst.style.setProperty("--tb-proc-tier",String(tier));
 burst.innerHTML='<i class="tb-ancient-proc-ring"></i><i class="tb-ancient-proc-ring"></i><b></b><small></small>';
 burst.querySelector("b").textContent=fx.glyph;burst.querySelector("small").textContent=fx.label;
 anchor.querySelector(".tb-ancient-proc-burst")?.remove();anchor.appendChild(burst);
 const duration=tier===4?1150:tier===3?950:780;burst.style.setProperty("--tb-proc-duration",duration+"ms");
 setTimeout(()=>burst.remove(),duration+80);
}
document.addEventListener("tb:ancient-relic-proc",ancientBurst);

function update(){const root=getRoot();if(!root)return;const arena=root.querySelector('.tb-arena');if(!arena){if(root.classList.contains('tb-low-hp'))root.classList.remove('tb-low-hp');return;}
const match=(root.querySelector('.tb-arena-top')?.textContent||'').match(/ЭТАП\s+(\d+)/i);const stage=Number(match?.[1]||0);
if(stage){const chapter=Math.floor((stage-1)/50)%3;if(arena.dataset.tbWeatherChapter!==String(chapter)){arena.querySelector('.tb-weather')?.remove();const layer=document.createElement('div');layer.className='tb-weather';const icons=chapter===0?['❄','✧']:chapter===1?['◆','✦']:['╱','💧'];for(let i=0;i<16;i++){const p=document.createElement('i');p.textContent=icons[i%icons.length];p.style.setProperty('--x',Math.random()*100+'%');p.style.setProperty('--s',8+Math.random()*12+'px');p.style.setProperty('--o',String(.12+Math.random()*.3));p.style.setProperty('--d',3+Math.random()*5+'s');p.style.animationDelay=-Math.random()*7+'s';layer.appendChild(p);}arena.appendChild(layer);arena.dataset.tbWeatherChapter=String(chapter);}
if(stage!==stageSeen){arena.style.backgroundPosition=(stage%2?'53%':'47%')+' center';arena.style.setProperty('--tb-back-parallax',(stage%2?'-8px':'8px'));arena.style.setProperty('--tb-front-parallax',(stage%2?'22px':'-22px'));stageSeen=stage;}}
if(arena.classList.contains('tb-fx-ultimate')&&!root.querySelector('.tb-ultimate-dark')){const dark=document.createElement('div');dark.className='tb-ultimate-dark';root.appendChild(dark);setTimeout(()=>dark.remove(),1050);}const hp=root.querySelector('.tb-battle-hero .tb-healthbar span');if(hp)root.classList.toggle('tb-low-hp',(parseFloat(hp.style.width)||100)<20);
root.querySelectorAll('.tb-healthbar.enemy span,.tb-target-hp i').forEach(bar=>{const w=parseFloat(bar.style.width)||100,color=w>60?'linear-gradient(90deg,#278e54,#64d88a)':w>25?'linear-gradient(90deg,#b58a24,#f1d45b)':'linear-gradient(90deg,#8e1726,#ff4b58)';if(bar.dataset.tbHpColor!==color){bar.dataset.tbHpColor=color;bar.style.background=color;}});
root.querySelectorAll('.tb-target-card.defeated:not(.tb-death-dissolve)').forEach(card=>card.classList.add('tb-death-dissolve'));
const title=root.querySelector('.tb-enemy-title');if(title&&/босс|хранитель/i.test(title.textContent)){const key=title.textContent+':'+stage;if(key!==bossSeen){bossSeen=key;const intro=document.createElement('div');intro.className='tb-boss-intro';intro.innerHTML='<small>ПРИБЛИЖАЕТСЯ БОСС</small><b></b>';intro.querySelector('b').textContent=title.textContent;root.appendChild(intro);setTimeout(()=>intro.remove(),2100);}}
const focus=root.querySelector('.tb-enemy-focus'),width=focus?.querySelector('.tb-healthbar.enemy span')?.style.width||'';if(focus&&width!==lastHp){lastHp=width;focus.classList.remove('tb-hit-spark');void focus.offsetWidth;focus.classList.add('tb-hit-spark');setTimeout(()=>focus.classList.remove('tb-hit-spark'),220);}
}
let updateQueued=false;
const scheduleUpdate=()=>{if(updateQueued)return;updateQueued=true;const run=()=>{updateQueued=false;update();};if(typeof requestAnimationFrame==="function")requestAnimationFrame(run);else setTimeout(run,32);};
const rootObserver=new MutationObserver(scheduleUpdate);
const initialRoot=getRoot();
if(initialRoot){rootObserver.observe(initialRoot,{childList:true,subtree:true});scheduleUpdate();}
else{
 const mountObserver=new MutationObserver(()=>{
  const mountedRoot=getRoot();
  if(!mountedRoot)return;
  mountObserver.disconnect();rootObserver.observe(mountedRoot,{childList:true,subtree:true});scheduleUpdate();
 });
 mountObserver.observe(document.documentElement,{childList:true,subtree:true});
}
document.addEventListener('tb:combat-status',e=>{const arena=getRoot()?.querySelector('.tb-arena');if(!arena)return;const node=document.createElement('b');node.className='tb-combat-status';node.textContent=e.detail?.text||'☠';arena.appendChild(node);setTimeout(()=>node.remove(),1150);});
window.TowerboundCombatVisuals={status:text=>document.dispatchEvent(new CustomEvent('tb:combat-status',{detail:{text}})),refresh:scheduleUpdate};
scheduleUpdate();
})();