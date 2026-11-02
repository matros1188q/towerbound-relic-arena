/* TOWERBOUND ARENA LAYER FIX 11 — Phaser canvas is the single source of character rendering */
(()=>{'use strict';
if(!window.Phaser){document.documentElement.classList.add('phaser-fallback');/* keep DOM actors alive if the Phaser CDN fails */}
const mount=document.getElementById('phaser-arena');
const PALETTE={night:0x101326,stone:0x282b48,stone2:0x393858,edge:0x686184,cyan:0x78e7ef,gold:0xf8ce72,red:0xe85e78,purple:0x9b78ed};
let arenaScene=null;
const scene={key:'IllustratedArena',
preload:function(){this.load.image('tb-arena-background','./assets/arena-background.svg?v=2');this.load.image('tb-hero','./assets/hero-illustrated.svg?v=3');this.load.image('tb-foe','./assets/foe-illustrated.svg?v=3');this.load.image('tb-skeleton','./assets/skeleton-illustrated.svg?v=3');this.load.image('tb-brute','./assets/brute-illustrated.svg?v=3');},
create:function(){
 arenaScene=this;
 this.phase='prep';this.cameras.main.setBackgroundColor('#101326');this.actorSprites=[];this.fx=[];
 // Sync the visible iPhone DOM portraits with the Phaser scene on every scene creation.
 // The DOM layer is the reliable renderer on iOS Safari; Phaser keeps the combat arena and FX.
 const w=this.scale.width,h=this.scale.height;
 this.add.image(w/2,h/2,'tb-arena-background').setDisplaySize(w,h).setDepth(-10).setAlpha(.94);
 const shade=this.add.graphics().setDepth(-9);
 shade.fillStyle(0x090d20,.32);shade.fillRect(0,0,w,h);
 const glow=this.add.graphics().setDepth(-8);
 glow.fillStyle(0x9876d8,.16);glow.fillEllipse(w*.5,h*.75,w*.55,h*.22);
 glow.lineStyle(2,0xf4cf79,.55);glow.strokeEllipse(w*.5,h*.75,w*.42,h*.17);
 for(let i=0;i<12;i++){const a=i*Math.PI/6,x=w*.5+Math.cos(a)*w*.19,y=h*.75+Math.sin(a)*h*.095;glow.fillStyle(0xf6d17b,.9);glow.fillCircle(x,y,2.2);}
 const ground=this.add.graphics().setDepth(-7);ground.fillStyle(0x17172a,.3);ground.fillRect(0,h*.79,w,h*.21);
 // Local illustrated fantasy sprites (SVG, transparent backgrounds).
 this.hero=this.add.image(w*.34,h*.56,'tb-hero').setOrigin(.5,.5).setScale(Math.min(.9,Math.max(.64,w/700*.82))).setDepth(4).setVisible(false);
 this.enemy=this.add.image(w*.67,h*.56,'tb-foe').setOrigin(.5,.5).setScale(Math.min(.9,Math.max(.64,w/700*.82))).setDepth(4).setVisible(false);
 this.phaseLabel=this.add.text(w/2,18,'ПОДГОТОВКА К БОЮ',{fontFamily:'monospace',fontSize:'11px',fontStyle:'bold',color:'#f8ce72',stroke:'#101326',strokeThickness:3}).setOrigin(.5,0).setDepth(12);
 this.heroAura=this.add.circle(w*.34,h*.72,24,0x72e7ed,.08).setDepth(2);
 this.foeAura=this.add.circle(w*.67,h*.72,40,0xe85e78,.12).setDepth(2);
 this.heroShadow=this.add.ellipse(w*.34,h*.76,42,11,0x050711,.65).setDepth(3);
 this.foeShadow=this.add.ellipse(w*.67,h*.76,70,16,0x050711,.7).setDepth(3);


 this.tweens.add({targets:this.heroShadow,scaleX:1.18,alpha:.35,duration:520,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 this.tweens.add({targets:this.foeShadow,scaleX:1.15,alpha:.42,duration:680,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 this.tweens.add({targets:this.phaseLabel,alpha:.58,duration:1100,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 this.tweens.add({targets:this.heroAura,alpha:.22,scale:1.15,duration:1000,yoyo:true,repeat:-1});
 this.tweens.add({targets:this.foeAura,alpha:.25,scale:1.12,duration:900,yoyo:true,repeat:-1});
 this.sparkles=[];
 // Set a deterministic first-wave enemy immediately; do not wait for the first combat event.
 scene.setWave.call(this,window.TowerboundWave||1,!!window.TowerboundBoss);
 this.scale.on('resize',scene.onResize,this);
},
onResize:function(){
 if(!this.scene.isActive())return;
 const w=this.scale.width,h=this.scale.height;
 if(this._tbResizePending)clearTimeout(this._tbResizePending);
 this._tbResizePending=setTimeout(()=>{
  if(!this.scene.isActive())return;
  const last=this._tbLastSize||{w:700,h:300};
  if(Math.abs(w-last.w)<36&&Math.abs(h-last.h)<36)return;
  this._tbLastSize={w,h};
  this.scene.restart();
 },220);
},
setPhase:function(phase){this.phase=phase;const labels={prep:'ПОДГОТОВКА К БОЮ',battle:'БОЙ · АТАКА И ЗАЩИТА',reward:'НАГРАДА ЗА ПОБЕДУ',victory:'АРЕНА ПОКОРЕНА',defeat:'ОТРЯД ПАЛ'};if(this.phaseLabel)this.phaseLabel.setText(labels[phase]||labels.prep);if(this.hero&&this.enemy){this.hero.setAlpha(phase==='defeat'?.65:1);this.enemy.setAlpha(phase==='victory'?.35:1);}},
 impact:function(critical=false,boss=false,style='arcane'){
 const w=this.scale.width,h=this.scale.height,target=this.enemy,hero=this.hero;
 if(hero){
  this.tweens.killTweensOf(hero);
  const hx=hero.x,hy=hero.y;
  this.tweens.add({targets:hero,x:hx+Math.min(38,w*.07),y:hy-13,angle:critical?12:6,duration:100,yoyo:true,ease:'Cubic.Out',onComplete:()=>{
   if(!hero||!hero.active)return;
   this.tweens.add({targets:hero,x:hx,y:hy,angle:0,duration:130,ease:'Cubic.InOut',onComplete:()=>{
    if(hero&&hero.active)this.tweens.add({targets:hero,y:hy-10,angle:-2,duration:520,yoyo:true,repeat:-1,ease:'Sine.inOut'});
   }});
  }});
 }
 this.tweens.add({targets:target,x:target.x+18,angle:critical?10:5,duration:48,yoyo:true,repeat:3,ease:'Sine.inOut',onComplete:()=>{if(target&&target.active){target.setAngle(0);}}});
 const sx=this.hero?this.hero.x+16: w*.34, sy=this.hero?this.hero.y-8:h*.55, tx=target.x-10, ty=target.y-6;
 const colors={fire:0xff8a45,ice:0x8cefff,lightning:0xffed85,nature:0x78efaa,void:0xb68aff,arcane:0xf8ce72};
 const color=colors[style]||colors.arcane;
 const slash=this.add.graphics().setDepth(12);slash.lineStyle(critical?8:5,color,.95);slash.beginPath();slash.moveTo(sx-8,sy+18);slash.lineTo(sx+18,sy-15);slash.lineTo(sx+37,sy-26);slash.strokePath();this.tweens.add({targets:slash,alpha:0,scaleX:1.4,scaleY:1.4,duration:220,onComplete:()=>slash.destroy()});const orb=this.add.circle(sx,sy,critical?7:5,color,1).setDepth(11);
 orb.setStrokeStyle(critical?3:2,0xffffff,.85);
 const trail=this.add.circle(sx,sy,critical?13:9,color,.22).setDepth(10);
 this.tweens.add({targets:trail,scale:2.1,alpha:0,duration:320,onComplete:()=>trail.destroy()});
 this.tweens.add({targets:orb,x:tx,y:ty,scale:critical?1.5:1.1,alpha:.9,duration:170,ease:'Cubic.In',onUpdate:()=>{if(orb.active){const t=this.add.circle(orb.x,orb.y,2,color,.65).setDepth(9);this.tweens.add({targets:t,alpha:0,scale:.2,duration:180,onComplete:()=>t.destroy()});}},onComplete:()=>{if(orb.active)orb.destroy();const burst=this.add.circle(tx,ty,critical?18:10,color,.65).setDepth(10);this.tweens.add({targets:burst,scale:critical?3.2:2.2,alpha:0,duration:260,onComplete:()=>burst.destroy()});}});
 const x=target.x,y=target.y;const damage=this.add.text(x,y-35,critical?'CRITICAL!':'✦ STRIKE',{fontFamily:'monospace',fontSize:critical?'16px':'12px',fontStyle:'bold',color:critical?'#ffe29a':'#a7fbff',stroke:'#101326',strokeThickness:4}).setOrigin(.5).setDepth(12);this.tweens.add({targets:damage,y:y-76,alpha:0,scale:1.2,duration:620,ease:'Cubic.Out',onComplete:()=>damage.destroy()});const flash=this.add.rectangle(x,y,critical?68:44,critical?68:44,critical?0xffd478:0x8ceaf0,.65).setDepth(8);
 this.tweens.add({targets:flash,alpha:0,scale:2.2,duration:260,onComplete:()=>flash.destroy()});
 for(let i=0;i<(critical?24:13);i++){const a=Math.random()*Math.PI*2,d=18+Math.random()*(critical?85:48),p=this.add.rectangle(x,y,critical?4:3,critical?4:3,critical?0xffbd62:(boss?0xf66c91:0x82e8ef),1).setDepth(9);this.tweens.add({targets:p,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,angle:90,duration:220+Math.random()*280,onComplete:()=>p.destroy()});}
 if(critical){const f=this.add.rectangle(w/2,h/2,w,h,0xffe2a1,.2).setDepth(10);this.tweens.add({targets:f,alpha:0,duration:160,onComplete:()=>f.destroy()});}
},
victory:function(){const w=this.scale.width,h=this.scale.height;for(let i=0;i<48;i++){const p=this.add.rectangle(Math.random()*w,-8,3+Math.random()*3,4+Math.random()*4,[0xf8ce72,0x78e7ef,0xb5a0e7][i%3],1).setDepth(10);this.tweens.add({targets:p,y:h+12,x:p.x+(Math.random()-.5)*100,angle:360,duration:900+Math.random()*1200,delay:Math.random()*300,onComplete:()=>p.destroy()});}},
setWave:function(wave,boss){
 if(!this.enemy)return;
 const n=Math.max(1,Number(wave)||1),slot=(n-1)%20;
 const enemyFiles=['shadow-goblin','cursed-knight','ash-wolf','rune-golem','grave-archer','plague-witch','ash-imp','swamp-reaper','bone-warden','crimson-executioner','void-hunter','spider-matron','blind-monk','stone-minotaur','phantom-duelist','soul-harvester','forest-horror','abyss-knight','cursed-alchemist','root-colossus'];
 const bossFiles=['bone-colossus','abyss-queen','ash-patriarch','ice-abbot','mirror-executioner','soul-devourer','root-titan','void-hunter-boss',null,'heart-of-tower'];
 const labels=['Теневой гоблин','Проклятый рыцарь','Пепельный волк','Рунный голем','Могильный лучник','Чумная ведьма','Пепельный бес','Болотный жнец','Костяной страж','Багровый палач','Пустотный охотник','Паучья матрона','Слепой монах','Каменный минотавр','Призрачный дуэлянт','Собиратель душ','Лесной ужас','Рыцарь бездны','Проклятый алхимик','Корневой исполин'];
 const heroFiles={warden:'warden',arcanist:'arcanist',ranger:'ranger',reaper:'reaper'};
 const domHero=mount&&mount.querySelector('.tb-visible-hero');
 if(domHero){
  const heroId=(window.TowerboundHeroId||'warden');
  const heroSrc='./assets/characters/heroes/'+(heroFiles[heroId]||'warden')+'.png?v=arena-art-1';
  if(!domHero.src.includes('/assets/characters/heroes/'+(heroFiles[heroId]||'warden')+'.png'))domHero.src=heroSrc;
  domHero.alt='Герой: '+heroId;
 }
 const idx=(n-1)%enemyFiles.length;
 const foeId=boss?(bossFiles[Math.max(0,Math.min(9,Math.ceil(n/7)-1))]||enemyFiles[idx]):enemyFiles[idx];
 const domEnemy=mount&&mount.querySelector('.tb-visible-enemy');
 if(domEnemy){
  const category=boss&&bossFiles[Math.max(0,Math.min(9,Math.ceil(n/7)-1))]?'bosses':'enemies';
  const src='./assets/characters/'+category+'/'+foeId+'.png?v=arena-art-1';
  if(domEnemy.dataset.tbArtSrc!==src){domEnemy.dataset.tbArtSrc=src;domEnemy.src=src;}
  domEnemy.alt=(boss?'Босс: ':'')+labels[idx];
  domEnemy.style.width=boss?'clamp(156px,39vw,254px)':'clamp(118px,30vw,204px)';
  domEnemy.style.height=boss?'84%':'73%';
  domEnemy.style.left=boss?'68%':'68%';domEnemy.style.top='49%';
  domEnemy.style.filter=boss?'drop-shadow(0 0 18px #ff687f) drop-shadow(0 10px 10px #000d)':'drop-shadow(0 10px 10px #000d) drop-shadow(0 0 12px #e7caff55)';
  domEnemy.style.animation='tbEnemyIdle 2.8s ease-in-out infinite';
  domEnemy.onerror=()=>{domEnemy.onerror=null;domEnemy.src='./assets/foe-illustrated.svg?v=6';};
 }
 this.enemy.setTint(0xffffff);
 this.enemy.setScale(boss?1.02:.76);
 if(this.foeAura)this.foeAura.setFillStyle(boss?0xe85e78:(idx%3===1?0x78e7ef:idx%3===2?0xff8a45:0x9b78ed),boss?.22:.12);
 scene.setPhase.call(this,this.phase||'prep');
},
setHero:function(heroId){
 window.TowerboundHeroId=heroId||'warden';
 const domHero=mount&&mount.querySelector('.tb-visible-hero');
 if(domHero){
  const id=['warden','arcanist','ranger','reaper'].includes(window.TowerboundHeroId)?window.TowerboundHeroId:'warden';
  const src='./assets/characters/heroes/'+id+'.png?v=arena-art-1';
  if(domHero.dataset.tbArtSrc!==src){domHero.dataset.tbArtSrc=src;domHero.src=src;}
  domHero.alt='Герой: '+id;
 }
},
update:function(){/* Ambient alpha is handled by bounded tweens; avoid per-frame JS writes. */}
};

// DOM combat FX: visible even when Phaser canvas is hidden by mobile stacking/compositing.
function ensureDomFx(){
 let layer=mount.querySelector('.tb-dom-fx');
 if(!layer){layer=document.createElement('div');layer.className='tb-dom-fx';layer.setAttribute('aria-hidden','true');
 Object.assign(layer.style,{position:'absolute',inset:'0',overflow:'hidden',pointerEvents:'none',zIndex:'2'});
 mount.appendChild(layer);}
 return layer;
}
function appendBoundedFx(layer,node){while(layer.childElementCount>=8){const first=layer.firstElementChild;if(!first)break;first.remove();}layer.appendChild(node);return node;}
function domCombatHit(critical=false,boss=false,style='arcane'){
 const layer=ensureDomFx();
 // Animate the always-visible SVG actors too, not only the Phaser canvas.
 const actorHero=mount.querySelector('.tb-visible-hero'),actorEnemy=mount.querySelector('.tb-visible-enemy');
 if(actorHero&&actorHero.animate)actorHero.animate([{translate:'0 0',rotate:'0deg'},{translate:'12px -4px',rotate:critical?'9deg':'5deg'},{translate:'0 0',rotate:'0deg'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});
 if(actorEnemy&&actorEnemy.animate)actorEnemy.animate([{translate:'0 0',rotate:'0deg',filter:'brightness(1)'},{translate:'-5px 0',rotate:critical?'-12deg':'-6deg',filter:'brightness(2)'},{translate:'0 0',rotate:'0deg',filter:'brightness(1)'}],{duration:critical?340:260,easing:'ease-out'});
 const colors={fire:'#ff713d',ice:'#7cecff',lightning:'#fff176',nature:'#62f2a1',void:'#c18bff',arcane:'#ffe08a'};
 const color=colors[style]||colors.arcane;
 // Distinct readable silhouettes per damage school; each school has its own projectile motif.
 const abilityArt={fire:'fireball',ice:'ice-bolt',lightning:'lightning',nature:'nature',void:'demon',arcane:'arcane'};
 const glyph=document.createElement('img');
 glyph.src='./assets/icons/'+(abilityArt[style]||'arcane')+'.svg?v=5';
 glyph.alt='';glyph.draggable=false;glyph.decoding='async';
 Object.assign(glyph.style,{position:'absolute',left:'32%',top:'42%',width:critical?'42px':'34px',height:critical?'42px':'34px',objectFit:'contain',filter:'drop-shadow(0 0 7px '+color+') drop-shadow(0 0 13px '+color+')',zIndex:'4',transform:'translate(-50%,-50%) rotate(-20deg)'});
 appendBoundedFx(layer,glyph);
 const glyphAnim=glyph.animate([{left:'32%',top:'42%',transform:'translate(-50%,-50%) rotate(-20deg) scale(.45)',opacity:0},{left:'48%',top:'47%',transform:'translate(-50%,-50%) rotate(35deg) scale(1.2)',opacity:1,offset:.35},{left:'67%',top:'48%',transform:'translate(-50%,-50%) rotate(110deg) scale('+(critical?1.7:1)+')',opacity:1}],{duration:critical?260:220,easing:'cubic-bezier(.15,.8,.2,1)',fill:'forwards'});
 glyphAnim.onfinish=()=>glyph.remove();
 const orb=document.createElement('i');
 Object.assign(orb.style,{position:'absolute',left:'31%',top:'48%',width:(critical?18:13)+'px',height:(critical?18:13)+'px',borderRadius:'50%',background:color,boxShadow:'0 0 '+(critical?30:20)+'px '+color+',0 0 5px #fff',border:'2px solid #fff',zIndex:'3',opacity:'1'});
 appendBoundedFx(layer,orb);
 const rect=mount.getBoundingClientRect(),dx=Math.max(25,rect.width*.36),dy=(Math.random()-.5)*rect.height*.12;
 const anim=orb.animate([{transform:'translate(0,0) scale(.55)',opacity:0},{transform:'translate('+(-dx*.05)+'px,'+(-dy)+'px) scale(1.25)',opacity:1,offset:.16},{transform:'translate('+dx+'px,'+dy+'px) scale('+(critical?1.65:1)+')',opacity:1}],{duration:critical?230:190,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
 anim.onfinish=()=>{
  orb.remove();
  const burst=document.createElement('i');
  Object.assign(burst.style,{position:'absolute',left:'67%',top:(48+dy/Math.max(1,rect.height)*100)+'%',width:(critical?24:15)+'px',height:(critical?24:15)+'px',borderRadius:'50%',border:(critical?4:3)+'px solid '+color,boxShadow:'0 0 '+(critical?30:18)+'px '+color,zIndex:'3'});
  appendBoundedFx(layer,burst);
  burst.animate([{transform:'translate(-50%,-50%) scale(.35)',opacity:1},{transform:'translate(-50%,-50%) scale('+(critical?3.8:2.8)+')',opacity:0}],{duration:critical?380:300,easing:'ease-out'}).onfinish=()=>burst.remove();
  if(critical){const flash=document.createElement('b');flash.textContent='CRITICAL!';Object.assign(flash.style,{position:'absolute',left:'67%',top:'29%',transform:'translateX(-50%)',font:'900 15px system-ui',color:'#fff1a6',textShadow:'0 0 12px #ff8c36,0 2px 4px #000',whiteSpace:'nowrap',zIndex:'4'});appendBoundedFx(layer,flash);flash.animate([{transform:'translate(-50%,8px) scale(.7)',opacity:0},{transform:'translate(-50%,-12px) scale(1.15)',opacity:1,offset:.25},{transform:'translate(-50%,-34px) scale(1)',opacity:0}],{duration:650,easing:'ease-out'}).onfinish=()=>flash.remove();}
 };
}

// Guaranteed visible actor layer: independent of Phaser canvas compositing on iOS Safari.
function ensureVisibleActors(){
 if(!mount)return;
 let layer=mount.querySelector('.tb-visible-actors');
 if(!layer){layer=document.createElement('div');layer.className='tb-visible-actors';layer.setAttribute('aria-hidden','true');Object.assign(layer.style,{position:'absolute',inset:'0',zIndex:'2',display:'block',visibility:'visible',opacity:'1',pointerEvents:'none',overflow:'hidden'});mount.appendChild(layer);}
 layer.innerHTML='';
 const addActor=(cls,src,alt,style)=>{const img=document.createElement('img');img.className=cls;img.src=src;img.alt=alt;img.draggable=false;img.decoding='async';img.loading='eager';Object.assign(img.style,{position:'absolute',display:'block',visibility:'visible',opacity:'1',objectFit:'contain',pointerEvents:'none',transform:'translate(-50%,-50%)',filter:'drop-shadow(0 10px 10px #000d) drop-shadow(0 0 12px #e7caff55)',...style});layer.appendChild(img);return img;};
 if(!document.getElementById('tb-actor-animation-style')){
  const style=document.createElement('style');style.id='tb-actor-animation-style';
  style.textContent='@keyframes tbEnemyIdle{0%,100%{translate:0 0}50%{translate:0 -7px}}@keyframes tbHeroIdle{0%,100%{translate:0 0}50%{translate:0 -6px}}';
  document.head.appendChild(style);
 }
 addActor('tb-visible-hero','./assets/hero-illustrated.svg?v=6','Герой башни',{left:'34%',top:'49%',width:'clamp(116px,28vw,184px)',height:'72%',animation:'tbHeroIdle 2.2s ease-in-out infinite'});
 const enemy=addActor('tb-visible-enemy','./assets/foe-illustrated.svg?v=6','Страж Бездны',{left:'68%',top:'49%',width:'clamp(118px,30vw,202px)',height:'72%',animation:'tbEnemyIdle 2.8s ease-in-out infinite'});
 enemy.onerror=()=>{enemy.onerror=null;enemy.src='./assets/foe-illustrated.svg?v=6';};
 return layer;
}
ensureVisibleActors();
if(!window.Phaser){console.warn('Towerbound: Phaser CDN unavailable; DOM actor fallback remains active.');return;}
const tbMobilePerf=window.matchMedia('(max-width:700px)').matches;
const game=new Phaser.Game({
 type:Phaser.CANVAS,parent:mount,width:700,height:300,
 backgroundColor:'#101326',pixelArt:false,antialias:!tbMobilePerf,roundPixels:tbMobilePerf,
 scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
 fps:{target:tbMobilePerf?30:60,forceSetTimeOut:tbMobilePerf},
 render:{antialias:!tbMobilePerf,pixelArt:false,roundPixels:tbMobilePerf,powerPreference:'low-power',preserveDrawingBuffer:false},
 scene
});
/* tb-performance-guard-v1: suspend renderer while Safari is backgrounded */
const tbSetRenderSleep=()=>{try{if(document.hidden){if(game.loop&&game.loop.sleep)game.loop.sleep();}else if(game.loop&&game.loop.wake)game.loop.wake();}catch(e){console.warn('Towerbound renderer lifecycle:',e)}};
document.addEventListener('visibilitychange',tbSetRenderSleep,{passive:true});
window.addEventListener('pagehide',()=>{try{if(game.loop&&game.loop.sleep)game.loop.sleep()}catch(e){}},{passive:true});
tbSetRenderSleep();
window.TowerFX={hit:(critical,boss,style='arcane')=>{domCombatHit(critical,boss,style);if(window.TowerModels&&window.TowerModels.hit)window.TowerModels.hit(critical,boss);if(!tbMobilePerf&&arenaScene&&scene.impact)scene.impact.call(arenaScene,critical,boss,style);},clear:()=>{const fx=mount.querySelector('.tb-dom-fx');if(fx){fx.querySelectorAll('*').forEach(n=>{if(n.getAnimations)n.getAnimations().forEach(a=>a.cancel());});fx.replaceChildren();}mount.querySelectorAll('.tb-visible-hero,.tb-visible-enemy').forEach(n=>{if(n.getAnimations)n.getAnimations().forEach(a=>a.cancel());});},win:()=>{if(arenaScene&&scene.victory)scene.victory.call(arenaScene);},hero:(heroId)=>{if(arenaScene&&scene.setHero)scene.setHero.call(arenaScene,heroId);else window.TowerboundHeroId=heroId||'warden';},wave:(wave,boss)=>{if(window.TowerModels&&window.TowerModels.wave)window.TowerModels.wave(wave,boss);if(arenaScene&&scene.setWave)scene.setWave.call(arenaScene,wave,boss);},phase:(phase)=>{if(arenaScene&&scene.setPhase)scene.setPhase.call(arenaScene,phase);}};
})();