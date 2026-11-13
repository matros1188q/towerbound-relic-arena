'use strict';
/* Towerbound polish layer: first-run guidance, stat help, level-up feedback and loot feel. */
(function(){
  const root=document.getElementById('tbRpg');
  if(!root||window.__TB_POLISH_V1__)return;
  window.__TB_POLISH_V1__=true;
  const STYLE=`
  .tb-polish-backdrop{position:fixed;inset:0;z-index:100500;display:grid;place-items:center;padding:18px;background:#05070bdc;backdrop-filter:blur(10px)}
  .tb-polish-card{width:min(100%,440px);max-height:min(82dvh,720px);overflow:auto;padding:24px;border:1px solid #d8b66c;border-radius:20px;background:radial-gradient(ellipse at 50% 0,#55432f,#1c2031 55%,#101421);color:#f7efdf;box-shadow:0 28px 100px #000c,0 0 38px #d8a84a22}
  .tb-polish-card h2{margin:5px 0 10px;font:900 23px/1.15 system-ui;color:#ffe2a0}
  .tb-polish-card p,.tb-polish-card li{font:600 13px/1.55 system-ui;color:#e3dfd6}
  .tb-polish-card ul{padding-left:20px;display:grid;gap:8px}
  .tb-polish-card .tb-polish-kicker{font:900 10px system-ui;letter-spacing:.2em;color:#d9b56b}
  .tb-polish-card button{width:100%;min-height:46px;margin-top:12px;border:1px solid #f1d18b;border-radius:12px;background:linear-gradient(135deg,#f5d17e,#a86b32);color:#24180c;font-weight:950}
  .tb-help-button{display:inline-grid;place-items:center;vertical-align:middle;width:17px;height:17px;margin-left:6px;padding:0;border:1px solid #d8bd78;border-radius:50%;background:#211d2c;color:#ffe2a0;font:900 11px/1 system-ui;cursor:pointer}
  .tb-help-pop{position:fixed;z-index:100600;max-width:min(290px,calc(100vw - 28px));padding:11px 13px;border:1px solid #d8bd78;border-radius:11px;background:#171a29;color:#f4ead6;box-shadow:0 12px 36px #000b;font:600 12px/1.45 system-ui}
  .tb-equip-upgrade{border-color:#55e58c!important;background:linear-gradient(135deg,#164b36,#123126)!important;color:#eafff0!important;box-shadow:0 0 0 1px #61ed9b55,0 0 18px #38d87966!important;animation:tb-equip-pulse 1.25s ease-in-out infinite}
  @keyframes tb-equip-pulse{0%,100%{filter:brightness(1);box-shadow:0 0 0 1px #61ed9b44,0 0 10px #38d87944}50%{filter:brightness(1.25);box-shadow:0 0 0 2px #61ed9b99,0 0 23px #38d87999}}
  .tb-levelup-burst{position:fixed;inset:0;z-index:100510;display:grid;place-items:center;padding:18px;background:#060812d9;backdrop-filter:blur(9px)}
  .tb-levelup-burst .tb-polish-card{text-align:center;border-color:#f0cf78;box-shadow:0 0 70px #e8b84b33,0 28px 100px #000c}
  .tb-levelup-number{font:1000 clamp(46px,14vw,76px)/1 Georgia,serif;color:#ffe7a1;text-shadow:0 0 24px #e5b84c88}
  .tb-levelup-burst .tb-polish-card button{margin-top:18px}
  @media(prefers-reduced-motion:reduce){.tb-equip-upgrade{animation:none}}
  `;
  const style=document.createElement('style');style.id='tb-polish-style-v1';style.textContent=STYLE;document.head.appendChild(style);
  const STORE='tb-rpg-v2',GUIDE='tb-new-player-guide-v1';
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(_){return {}}};
  const active=state=>{const id=state?.activeCharacterId;return (state?.characters||[]).find(c=>c.id===id)||(state?.characters||[])[0]||null};
  let state=read(),char=active(state),lastLevel=Number(char?.level)||0,lastCount=(state.characters||[]).length;
  let helpPop=null,audio=null,lootObserverQueued=false;
  function modal(kind,title,body,buttonLabel,done){
    const node=document.createElement('div');node.className='tb-polish-backdrop'+(kind==='level'?' tb-levelup-burst':'');node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');
    node.innerHTML='<section class="tb-polish-card"><div class="tb-polish-kicker">TOWERBOUND · '+(kind==='level'?'ПРОГРЕСС':'НАЧАЛО ПУТИ')+'</div>'+body+'</section>';
    const card=node.querySelector('.tb-polish-card');if(title){const h=document.createElement('h2');h.textContent=title;card.insertBefore(h,card.children[1]||null);}
    const btn=document.createElement('button');btn.type='button';btn.textContent=buttonLabel;btn.addEventListener('click',()=>{node.remove();done?.();});card.appendChild(btn);document.body.appendChild(node);btn.focus();
  }
  function showGuide(){
    if(localStorage.getItem(GUIDE)==='1')return;
    modal('guide','Добро пожаловать в Башню','<p>Твоя цель — пройти <b>250 этапов</b>, победить стражей и собрать легендарную экипировку.</p><ul><li><b>Экипировка:</b> сравнивай характеристики предметов и надевай лучшие вещи.</li><li><b>Специализация:</b> на 10 уровне выбери одну из трёх веток своего класса.</li><li><b>Таланты и камни:</b> усиливай атаку, защиту и особые свойства экипировки.</li><li><b>Пошаговый бой:</b> выбирай действие, следи за намерениями врагов и завершай ход.</li></ul><p>Прогресс сохраняется автоматически. Удачи в Башне!</p>','НАЧАТЬ ПУТЬ',()=>localStorage.setItem(GUIDE,'1'));
  }
  function showLevelUp(from,to){
    const gained=Math.max(0,to-from),points=gained;
    const unlocks=[];for(const level of [10,20,30,40,50,60,70,80,90,100])if(level>from&&level<=to)unlocks.push(level===10?'Открыт выбор специализации': 'Открыт новый рубеж развития · '+level+' уровень');
    const body='<div class="tb-levelup-number">'+to+'</div><p><b>Новый уровень!</b></p><p>Доступно очков талантов: <b>'+points+'</b></p>'+(unlocks.length?'<ul>'+unlocks.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'<p>Твои характеристики стали выше. Загляни в таланты и проверь новые возможности.</p>');
    modal('level','Уровень повышен',body,'ПРОДОЛЖИТЬ',()=>{});
    try{lootTone('level')}catch(_){}
  }
  function addHelpButtons(){
    const definitions=[
      ['БОЕВАЯ МОЩЬ','Мощь (BP) — сводная оценка силы персонажа. На неё влияют уровень, характеристики экипировки, редкость предметов и таланты.'],
      ['ЗАЩИТА','Броня снижает входящий физический урон. Чем выше защита относительно уровня противника, тем меньше урона проходит.'],
      ['КРИТ','Критический шанс показывает вероятность усиленного удара. Критический урон определяет силу такого удара.'],
      ['АТАКА','Атака определяет базовую силу физических ударов и часть урона умений.'],
      ['РЕСУРС','Ресурс расходуется на активные умения. Базовая атака помогает его восстановить.']
    ];
    root.querySelectorAll('.tb-stat-name').forEach(label=>{
      if(label.querySelector('.tb-help-button'))return;
      const match=definitions.find(([key])=>label.textContent.trim().toUpperCase().includes(key));if(!match)return;
      const button=document.createElement('button');button.type='button';button.className='tb-help-button';button.textContent='i';button.setAttribute('aria-label','Объяснение: '+match[0]);button.dataset.tbHelp=match[1];label.appendChild(button);
    });
    root.querySelectorAll('.tb-map-power').forEach(label=>{
      if(label.querySelector('.tb-help-button'))return;const b=document.createElement('button');b.type='button';b.className='tb-help-button';b.textContent='i';b.dataset.tbHelp='Рекомендуемая мощь — ориентир для этого этапа, а не жёсткое ограничение. Сравни её со своей боевой мощью.';b.setAttribute('aria-label','Что такое рекомендуемая мощь');label.appendChild(b);
    });
  }
  function showHelp(button){
    helpPop?.remove();const pop=document.createElement('div');pop.className='tb-help-pop';pop.textContent=button.dataset.tbHelp||'';document.body.appendChild(pop);const r=button.getBoundingClientRect(),w=pop.getBoundingClientRect();pop.style.left=Math.max(14,Math.min(innerWidth-w.width-14,r.left))+'px';pop.style.top=Math.max(12,Math.min(innerHeight-w.height-12,r.bottom+7))+'px';helpPop=pop;
    const close=e=>{if(!pop.contains(e.target)&&e.target!==button){pop.remove();helpPop=null;document.removeEventListener('pointerdown',close,true);}};document.addEventListener('pointerdown',close,true);
  }
  function score(item){const s=item?.stats||{};const rarity={'Обычная':1,'Редкая':2,'Эпическая':3,'Легендарная':4,'Богоподобная':5}[item?.rarity]||0;return rarity*1000+(s.attack||0)*.25+(s.defense||0)*.35+(s.health||0)*.015+(s.crit||0)*75+(s.critDamage||0)*30+(s.spellPower||0)*.2;}
  function highlightUpgrades(){
    const c=active(read());if(!c)return;const slots=['weapon','chest','head','legs','hands','accessory'];
    root.querySelectorAll('[data-equip]').forEach(button=>{
      const id=button.dataset.equip,item=(c.bag||[]).find(x=>x.id===id);if(!item||item.type!=='equipment'||!item.stats){button.classList.remove('tb-equip-upgrade');return;}
      const slot=slots.indexOf(item.slot),current=slot>=0?c.gear?.[slot]:null;const better=!current||score(item)>score(current)+.01;
      button.classList.toggle('tb-equip-upgrade',better);
      if(better){button.textContent='НАДЕТЬ · ЛУЧШЕ';button.setAttribute('aria-label','Надеть улучшение: '+(item.name||'предмет'));}
    });
  }
  function lootTone(kind){
    const prefs=read().account?.settings||{};if(prefs.sound_enabled===false)return;
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!audio)audio=new C();if(audio.state==='suspended')audio.resume().catch(()=>{});
    const now=audio.currentTime,notes=kind==='level'?[523.25,659.25,783.99,1046.5]:[659.25,830.61,987.77];
    notes.forEach((frequency,i)=>{const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(frequency,now+i*.105);gain.gain.setValueAtTime(.0001,now+i*.105);gain.gain.exponentialRampToValueAtTime(.11,now+i*.105+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.105+.18);osc.connect(gain);gain.connect(audio.destination);osc.start(now+i*.105);osc.stop(now+i*.105+.2);});
  }
  function checkState(){
    const next=read(),nextChar=active(next),level=Number(nextChar?.level)||0,count=(next.characters||[]).length;
    if(count>lastCount&&lastCount===0&&nextChar)showGuide();
    if(level>lastLevel&&lastLevel>0)showLevelUp(lastLevel,level);
    lastCount=count;lastLevel=level;state=next;
  }
  function decorateLoot(){
    const overlay=root.querySelector('.tb-loot-overlay');if(!overlay||overlay.dataset.tbLootFeel==='1')return;
    overlay.dataset.tbLootFeel='1';const text=overlay.textContent||'';
    if(/Легендарная|Богоподобная|Эпическая/.test(text)){lootTone('loot');try{if(/Легендарная|Богоподобная/.test(text)&&navigator.vibrate)navigator.vibrate([35,35,70]);}catch(_){}}
  }
  function decorate(){
    addHelpButtons();highlightUpgrades();decorateLoot();checkState();
  }
  root.addEventListener('click',event=>{const b=event.target.closest('[data-tb-help]');if(b){event.preventDefault();event.stopPropagation();showHelp(b);}});
  document.addEventListener('pointerdown',()=>{try{const C=window.AudioContext||window.webkitAudioContext;if(C&&!audio)audio=new C();if(audio?.state==='suspended')audio.resume().catch(()=>{});}catch(_){}},{once:true,capture:true});
  const observer=new MutationObserver(()=>{if(lootObserverQueued)return;lootObserverQueued=true;queueMicrotask(()=>{lootObserverQueued=false;decorate();});});
  observer.observe(root,{childList:true,subtree:true,characterData:true});
  decorate();
  window.addEventListener('storage',event=>{if(event.key===STORE)checkState();});
})();