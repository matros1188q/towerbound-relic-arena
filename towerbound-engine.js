/* TOWERBOUND ARENA LAYER FIX 11 — Phaser canvas is the single source of character rendering */
(()=>{'use strict';
if(!window.Phaser){document.documentElement.classList.add('phaser-fallback');/* keep DOM actors alive if the Phaser CDN fails */}
const mount=document.getElementById('phaser-arena');
const PALETTE={night:0x101326,stone:0x282b48,stone2:0x393858,edge:0x686184,cyan:0x78e7ef,gold:0xf8ce72,red:0xe85e78,purple:0x9b78ed};
let arenaScene=null;
const scene={key:'IllustratedArena',
preload:function(){this.load.image('tb-arena-background','./assets/chapters/image 2.jpeg');this.load.image('tb-hero','./assets/characters/heroes/image.jpeg');this.load.image('tb-foe','./assets/characters/enemies/image 2.jpeg');this.load.image('tb-skeleton','./assets/characters/enemies/image 13.jpeg');this.load.image('tb-brute','./assets/characters/enemies/image 18.jpeg');},
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
   this.tweens.add({targets:hero,x:hx,y:hy,angle:0,duration:130,ease:'Cubic.InOut'});
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
 this.tweens.add({targets:orb,x:tx,y:ty,scale:critical?1.5:1.1,alpha:.9,duration:170,ease:'Cubic.In',onComplete:()=>{if(orb.active)orb.destroy();const burst=this.add.circle(tx,ty,critical?18:10,color,.65).setDepth(10);this.tweens.add({targets:burst,scale:critical?3.2:2.2,alpha:0,duration:260,onComplete:()=>burst.destroy()});}});
 const x=target.x,y=target.y;const damage=this.add.text(x,y-35,critical?'CRITICAL!':'✦ STRIKE',{fontFamily:'monospace',fontSize:critical?'16px':'12px',fontStyle:'bold',color:critical?'#ffe29a':'#a7fbff',stroke:'#101326',strokeThickness:4}).setOrigin(.5).setDepth(12);this.tweens.add({targets:damage,y:y-76,alpha:0,scale:1.2,duration:620,ease:'Cubic.Out',onComplete:()=>damage.destroy()});const flash=this.add.rectangle(x,y,critical?68:44,critical?68:44,critical?0xffd478:0x8ceaf0,.65).setDepth(8);
 this.tweens.add({targets:flash,alpha:0,scale:2.2,duration:260,onComplete:()=>flash.destroy()});
 for(let i=0;i<(critical?8:5);i++){const a=Math.random()*Math.PI*2,d=18+Math.random()*(critical?85:48),p=this.add.rectangle(x,y,critical?4:3,critical?4:3,critical?0xffbd62:(boss?0xf66c91:0x82e8ef),1).setDepth(9);this.tweens.add({targets:p,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,angle:90,duration:220+Math.random()*280,onComplete:()=>p.destroy()});}
 if(critical){const f=this.add.rectangle(w/2,h/2,w,h,0xffe2a1,.2).setDepth(10);this.tweens.add({targets:f,alpha:0,duration:160,onComplete:()=>f.destroy()});}
},
victory:function(){const w=this.scale.width,h=this.scale.height;const count=tbMobilePerf?10:22;for(let i=0;i<count;i++){const p=this.add.rectangle(Math.random()*w,-8,3+Math.random()*3,4+Math.random()*4,[0xf8ce72,0x78e7ef,0xb5a0e7][i%3],1).setDepth(10);this.tweens.add({targets:p,y:h+12,x:p.x+(Math.random()-.5)*100,angle:360,duration:900+Math.random()*1200,delay:Math.random()*300,onComplete:()=>p.destroy()});}},
setWave:function(wave,boss){
 if(!this.enemy)return;
 const n=Math.max(1,Number(wave)||1),slot=(n-1)%20;
 const enemyFiles=['shadow-goblin','cursed-knight','ash-wolf','rune-golem','grave-archer','plague-witch','ash-imp','swamp-reaper','bone-warden','crimson-executioner','void-hunter','spider-matron','blind-monk','stone-minotaur','phantom-duelist','soul-harvester','forest-horror','abyss-knight','cursed-alchemist','root-colossus'];
 const bossFiles=['bone-colossus','abyss-queen','ash-patriarch','ice-abbot','mirror-executioner','soul-devourer','root-titan','void-hunter-boss',null,'heart-of-tower'];
 const labels=['Теневой гоблин','Проклятый рыцарь','Пепельный волк','Рунный голем','Могильный лучник','Чумная ведьма','Пепельный бес','Болотный жнец','Костяной страж','Багровый палач','Пустотный охотник','Паучья матрона','Слепой монах','Каменный минотавр','Призрачный дуэлянт','Собиратель душ','Лесной ужас','Рыцарь бездны','Проклятый алхимик','Корневой исполин'];
 const heroFiles={assassin:'image.jpeg',bishop:'image 2.jpeg',dragonkin:'image 3.jpeg',destroyer:'image 4.jpeg',elemental:'image 5.jpeg',shaman:'image 6.jpeg',duelist:'image 7.jpeg',warden:'image 4.jpeg',ranger:'image 7.jpeg',arcanist:'image 5.jpeg',reaper:'image.jpeg'};
 const domHero=mount&&mount.querySelector('.tb-visible-hero');
 if(domHero){
  const heroId=(window.TowerboundHeroId||'assassin');
  const heroSrc='./assets/characters/heroes/'+(heroFiles[heroId]||'image.jpeg');
  if(domHero.dataset.tbArtSrc!==heroSrc){domHero.dataset.tbArtSrc=heroSrc;domHero.src=heroSrc;}
  domHero.alt='Герой: '+heroId;
  domHero.dataset.tbActorId=heroId;
 }
 const idx=(n*7+3)%enemyFiles.length;
 const foeId=boss?(bossFiles[Math.max(0,Math.min(9,Math.ceil(n/7)-1))]||enemyFiles[idx]):enemyFiles[idx];
 const domEnemy=mount&&mount.querySelector('.tb-visible-enemy');
 if(domEnemy){
  const category=boss&&bossFiles[Math.max(0,Math.min(9,Math.ceil(n/7)-1))]?'bosses':'enemies';
  const enemyJpg={'shadow-goblin':'image 4.jpeg','cursed-knight':'image 3.jpeg','ash-wolf':'image 7.jpeg','rune-golem':'image 8.jpeg','grave-archer':'image 4.jpeg','plague-witch':'image 10.jpeg','ash-imp':'image 11.jpeg','swamp-reaper':'image 2.jpeg','bone-warden':'image 13.jpeg','crimson-executioner':'image 9.jpeg','void-hunter':'image 16.jpeg','spider-matron':'image 14.jpeg','blind-monk':'image 17.jpeg','stone-minotaur':'image 18.jpeg','phantom-duelist':'image 5.jpeg','soul-harvester':'image 15.jpeg','forest-horror':'image 12.jpeg','abyss-knight':'image 6.jpeg','cursed-alchemist':'image 20.jpeg','root-colossus':'image.jpeg'};
 const bossJpg={'bone-colossus':'image 13.jpeg','abyss-queen':'image 16.jpeg','ash-patriarch':'image 3.jpeg','ice-abbot':'image 4.jpeg','mirror-executioner':'image 19.jpeg','soul-devourer':'image 15.jpeg','root-titan':'image 8.jpeg','void-hunter-boss':'image 16.jpeg','crimson-regent':'image 11.jpeg','heart-of-tower':'image 12.jpeg'};
 const src=boss?'./assets/characters/bosses/'+(bossJpg[foeId]||'image 12.jpeg'):'./assets/characters/enemies/'+(enemyJpg[foeId]||'image 4.jpeg');
  if(domEnemy.dataset.tbArtSrc!==src){domEnemy.dataset.tbArtSrc=src;domEnemy.src=src;}
  domEnemy.alt=(boss?'Босс: ':'')+(boss?(["Костяной колосс","Королева Бездны","Пепельный патриарх","Ледяной аббат","Зеркальный палач","Пожиратель душ","Корневой титан","Охотник Бездны","Сердце Башни"][Math.max(0,Math.min(8,Math.ceil(n/7)-1))]||labels[idx]):labels[idx]);
  domEnemy.dataset.tbActorId=foeId;
  domEnemy.dataset.tbBoss=boss?'1':'0';
  domEnemy.style.width=boss?'clamp(156px,39vw,254px)':'clamp(118px,30vw,204px)';
  domEnemy.style.height=boss?'84%':'73%';
  domEnemy.style.left=boss?'68%':'68%';domEnemy.style.top='49%';
  domEnemy.style.filter=boss?'drop-shadow(0 0 18px #ff687f) drop-shadow(0 10px 10px #000d)':'drop-shadow(0 10px 10px #000d) drop-shadow(0 0 12px #e7caff55)';
  domEnemy.style.animation='tbEnemyIdle 2.8s ease-in-out infinite';
  domEnemy.onerror=()=>{domEnemy.onerror=null;domEnemy.src='./assets/characters/enemies/image 3.jpeg';};
 }
 this.enemy.setTint(0xffffff);
 this.enemy.setScale(boss?1.02:.76);
 if(this.foeAura)this.foeAura.setFillStyle(boss?0xe85e78:(idx%3===1?0x78e7ef:idx%3===2?0xff8a45:0x9b78ed),boss?.22:.12);
 scene.setPhase.call(this,this.phase||'prep');
},
setHero:function(heroId){
 window.TowerboundHeroId=heroId||'assassin';
 const domHero=mount&&mount.querySelector('.tb-visible-hero');
 if(domHero){
  const id=heroFiles[window.TowerboundHeroId]?window.TowerboundHeroId:'assassin';
  const src='./assets/characters/heroes/'+(heroFiles[id]||'image.jpeg');
  if(domHero.dataset.tbArtSrc!==src){domHero.dataset.tbArtSrc=src;domHero.src=src;}
  domHero.alt='Герой: '+id;
  domHero.dataset.tbActorId=id;
  const idleNames={warden:'tbWardenIdle',ranger:'tbRangerIdle',arcanist:'tbArcanistIdle',reaper:'tbReaperIdle'};
  domHero.style.animationName=idleNames[id]||'tbWardenIdle';
  domHero.style.animationDuration=id==='arcanist'?'2.65s':id==='reaper'?'2.15s':id==='ranger'?'2.35s':'2.25s';
  domHero.style.animationTimingFunction='ease-in-out';
  domHero.style.animationIterationCount='infinite';
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
 const heroId=(actorHero&&actorHero.dataset.tbActorId)||window.TowerboundHeroId||'warden';tbAnimate(actorHero,tbHeroAttackFrames(heroId,critical),critical?650:heroId==='arcanist'?560:460);tbWeaponCue(layer,heroId,style,critical);
 const hitId=actorEnemy&&actorEnemy.dataset.tbActorId||'shadow-goblin',hitBoss=actorEnemy&&actorEnemy.dataset.tbBoss==='1',hitProfile=(hitBoss?TB_BOSS_PROFILES[hitId]:TB_ENEMY_PROFILES[hitId])||TB_ENEMY_PROFILES['shadow-goblin'];tbAnimate(actorEnemy,tbEnemyHitFrames(hitProfile,critical),critical?520:390);
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


const TB_HERO_MOVES={
warden:{
attack:[{transform:'translate(0,0) rotate(0)'},{transform:'translate(18px,-7px) rotate(-13deg) scale(1.06)',offset:.42},{transform:'translate(-3px,2px) rotate(4deg)'},{transform:'translate(0,0)'}],
cast:[{transform:'translate(0,0) scale(1)'},{transform:'translate(-5px,-9px) rotate(-5deg)',offset:.35},{transform:'translate(7px,-2px) scale(1.08)',offset:.72},{transform:'translate(0,0)'}],
finisher:[{transform:'translate(0,0) scale(1)'},{transform:'translate(4px,-15px) rotate(-8deg)',offset:.3},{transform:'translate(24px,5px) rotate(18deg) scale(1.14)',offset:.68},{transform:'translate(0,0)'}]},
arcanist:{
attack:[{transform:'translate(0,0) scale(1)'},{transform:'translate(-6px,-8px) rotate(-6deg) scale(.96)',offset:.25},{transform:'translate(10px,-3px) rotate(8deg) scale(1.07)',offset:.68},{transform:'translate(0,0)'}],
cast:[{transform:'translate(0,0) scale(1)',filter:'brightness(1)'},{transform:'translate(-8px,-12px) scale(.94)',filter:'brightness(1.7)',offset:.3},{transform:'translate(5px,-5px) scale(1.12)',filter:'brightness(2)',offset:.72},{transform:'translate(0,0)',filter:'brightness(1)'}],
finisher:[{transform:'translate(0,0) rotate(0)'},{transform:'translate(-10px,-8px) rotate(-8deg) scale(.9)',offset:.25},{transform:'translate(14px,-4px) rotate(10deg) scale(1.18)',offset:.68},{transform:'translate(0,0)'}]},
ranger:{
attack:[{transform:'translate(0,0) rotate(0)'},{transform:'translate(-10px,2px) rotate(-9deg) scale(.97)',offset:.24},{transform:'translate(15px,-3px) rotate(5deg) scale(1.04)',offset:.7},{transform:'translate(0,0)'}],
cast:[{transform:'translate(0,0)'},{transform:'translate(-13px,-3px) rotate(-12deg)',offset:.35},{transform:'translate(8px,-5px) rotate(7deg) scale(1.05)',offset:.72},{transform:'translate(0,0)'}],
finisher:[{transform:'translate(0,0) scale(1)'},{transform:'translate(-16px,-7px) rotate(-12deg)',offset:.25},{transform:'translate(20px,-2px) rotate(8deg) scale(1.12)',offset:.7},{transform:'translate(0,0)'}]},
reaper:{
attack:[{transform:'translate(0,0) rotate(0)'},{transform:'translate(10px,-5px) rotate(-16deg)',offset:.35},{transform:'translate(16px,2px) rotate(16deg) scale(1.06)',offset:.66},{transform:'translate(0,0)'}],
cast:[{transform:'translate(0,0) scale(1)'},{transform:'translate(-7px,-10px) rotate(-9deg) scale(.92)',offset:.3},{transform:'translate(9px,0) rotate(10deg) scale(1.1)',offset:.7},{transform:'translate(0,0)'}],
finisher:[{transform:'translate(0,0) rotate(0)'},{transform:'translate(-9px,-10px) rotate(-18deg)',offset:.24},{transform:'translate(23px,4px) rotate(23deg) scale(1.15)',offset:.68},{transform:'translate(0,0)'}]}
};
// Individual profiles for every illustrated enemy and boss (identity is the exact asset filename).
const TB_ENEMY_PROFILES={
"shadow-goblin":{kind:"pounce",color:"#ff746c",reach:22,tilt:12,duration:300},
"cursed-knight":{kind:"slash",color:"#d7c5ff",reach:13,tilt:10,duration:310},
"ash-wolf":{kind:"pounce",color:"#ff9a54",reach:25,tilt:14,duration:280},
"rune-golem":{kind:"slam",color:"#8cefff",reach:10,tilt:6,duration:430},
"grave-archer":{kind:"ranged",color:"#d9e5ff",reach:8,tilt:5,duration:350},
"plague-witch":{kind:"hex",color:"#8be9a8",reach:7,tilt:4,duration:380},
"ash-imp":{kind:"pounce",color:"#ff873f",reach:20,tilt:15,duration:270},
"swamp-reaper":{kind:"hex",color:"#78d7bb",reach:9,tilt:7,duration:390},
"bone-warden":{kind:"slam",color:"#d9d5c8",reach:12,tilt:7,duration:420},
"crimson-executioner":{kind:"slash",color:"#ff526e",reach:17,tilt:14,duration:360},
"void-hunter":{kind:"blink",color:"#b28cff",reach:19,tilt:16,duration:320},
"spider-matron":{kind:"pounce",color:"#d9a6ff",reach:23,tilt:12,duration:340},
"blind-monk":{kind:"slash",color:"#e5e4ce",reach:12,tilt:13,duration:310},
"stone-minotaur":{kind:"slam",color:"#b6a6ff",reach:15,tilt:8,duration:440},
"phantom-duelist":{kind:"blink",color:"#c9e2ff",reach:18,tilt:18,duration:290},
"soul-harvester":{kind:"hex",color:"#82edba",reach:8,tilt:8,duration:400},
"forest-horror":{kind:"slam",color:"#82b879",reach:13,tilt:7,duration:430},
"abyss-knight":{kind:"slash",color:"#a68bff",reach:16,tilt:12,duration:340},
"cursed-alchemist":{kind:"ranged",color:"#9ce6b4",reach:7,tilt:4,duration:370},
"root-colossus":{kind:"slam",color:"#8cba83",reach:18,tilt:9,duration:460}
};
const TB_BOSS_PROFILES={
"bone-colossus":{kind:"slam",color:"#f0d7a0",reach:25,tilt:8,duration:590},
"abyss-queen":{kind:"hex",color:"#c18bff",reach:15,tilt:13,duration:540},
"ash-patriarch":{kind:"ranged",color:"#ff874f",reach:16,tilt:8,duration:560},
"ice-abbot":{kind:"hex",color:"#8cefff",reach:14,tilt:7,duration:570},
"mirror-executioner":{kind:"slash",color:"#d8dcff",reach:24,tilt:17,duration:560},
"soul-devourer":{kind:"hex",color:"#d18cff",reach:13,tilt:9,duration:590},
"root-titan":{kind:"slam",color:"#79e7a0",reach:28,tilt:6,duration:640},
"void-hunter-boss":{kind:"pounce",color:"#b28cff",reach:30,tilt:18,duration:520},
"heart-of-tower":{kind:"slam",color:"#ff6a55",reach:32,tilt:10,duration:680}
};
function tbFrames(profile){
 const r=profile.reach,t=profile.tilt,k=profile.kind;
 if(k==='pounce')return [{transform:'translate(0,0) scale(1) rotate(0)'},{transform:'translate(-'+r+'px,-'+Math.round(r*.42)+'px) scale(1.12) rotate(-'+t+'deg)',offset:.48},{transform:'translate(5px,2px) scale(.96)'},{transform:'translate(0,0) scale(1)'}];
 if(k==='slam')return [{transform:'translate(0,0) scale(1)'},{transform:'translate(0,-'+Math.round(r*.55)+'px) scale(1.08)',offset:.3},{transform:'translate(-'+Math.round(r*.7)+'px,'+Math.round(r*.3)+'px) rotate('+t+'deg) scale(1.13)',offset:.62},{transform:'translate(0,0) scale(1)'}];
 if(k==='ranged'||k==='hex')return [{transform:'translate(0,0) rotate(0) scale(1)',filter:'brightness(1)'},{transform:'translate('+Math.round(r*.3)+'px,-'+Math.round(r*.35)+'px) rotate('+t+'deg) scale(1.08)',filter:'brightness(1.8)',offset:.4},{transform:'translate(-3px,0) rotate(-3deg) scale(1)',filter:'brightness(1)'},{transform:'translate(0,0)'}];
 if(k==='blink')return [{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate(-'+Math.round(r*.5)+'px,-4px) scale(.78)',opacity:.18,offset:.36},{transform:'translate(-'+r+'px,0) scale(1.13)',opacity:1,offset:.72},{transform:'translate(0,0) scale(1)',opacity:1}];
 return [{transform:'translate(0,0) rotate(0)'},{transform:'translate(-'+r+'px,-4px) rotate(-'+t+'deg) scale(1.04)',offset:.48},{transform:'translate(3px,1px) rotate(4deg) scale(.98)'},{transform:'translate(0,0) rotate(0)'}];
}
function tbActorHash(id){let n=0;for(let i=0;i<String(id||'').length;i++)n=(n*31+String(id).charCodeAt(i))>>>0;return n;}
function tbAnimate(actor,frames,duration){if(!actor||!actor.animate)return;try{if(actor._tbCombatAnimation)actor._tbCombatAnimation.cancel();const anchored=frames.map(frame=>({...frame,transform:'translate(-50%,-50%) '+(frame.transform||'')}));actor._tbCombatAnimation=actor.animate(anchored,{duration,easing:'cubic-bezier(.18,.8,.22,1)',fill:'none'});actor._tbCombatAnimation.onfinish=()=>{actor._tbCombatAnimation=null;};}catch(e){}}
function tbHeroAttackFrames(id,critical){const scale=critical?1.12:1;const sets={warden:[{transform:'translate(-9px,2px) rotate(-12deg) scale(.96)'},{transform:'translate(3px,-11px) rotate(-8deg) scale(1.02)',offset:.28},{transform:'translate(28px,-3px) rotate(24deg) scale('+scale+')',offset:.62},{transform:'translate(12px,3px) rotate(9deg)',offset:.78},{transform:'translate(0,0) rotate(0)'}],ranger:[{transform:'translate(-13px,1px) rotate(-10deg) scale(.97)'},{transform:'translate(-8px,-8px) rotate(-7deg)',offset:.38},{transform:'translate(7px,-3px) rotate(8deg) scale('+scale+')',offset:.62},{transform:'translate(0,0)'}],arcanist:[{transform:'translate(0,5px) scale(.94)',filter:'brightness(1)'},{transform:'translate(-4px,-15px) scale(.92)',filter:'brightness(1.35)',offset:.32},{transform:'translate(4px,-7px) scale(1.13)',filter:'brightness(2)',offset:.7},{transform:'translate(0,0) scale(1)',filter:'brightness(1)'}],reaper:[{transform:'translate(-10px,-4px) rotate(-18deg) scale(.96)'},{transform:'translate(-4px,-12px) rotate(-12deg)',offset:.3},{transform:'translate(24px,4px) rotate(27deg) scale('+scale+')',offset:.68},{transform:'translate(9px,2px) rotate(9deg)',offset:.82},{transform:'translate(0,0) rotate(0)'}]};return sets[id]||sets.warden;}
function tbEnemyHitFrames(profile,critical){const k=profile.kind,amp=critical?1.45:1;if(k==='pounce'||k==='slash')return [{transform:'translate(0,0) rotate(0)'},{transform:'translate(12px,-5px) rotate(8deg) scale(.96)',offset:.22},{transform:'translate(-5px,3px) rotate(-5deg) scale('+amp+')',offset:.48},{transform:'translate(0,0) rotate(0)'}];if(k==='slam')return [{transform:'translate(0,0) scale(1)'},{transform:'translate(0,-9px) scale(1.04)',offset:.25},{transform:'translate(8px,7px) rotate(7deg) scale(.94)',offset:.58},{transform:'translate(0,0) scale(1)'}];if(k==='hex'||k==='ranged')return [{transform:'translate(0,0) scale(1)',filter:'brightness(1)'},{transform:'translate(7px,-3px) scale(.94)',filter:'brightness(2)',offset:.24},{transform:'translate(-3px,2px) scale(1.06)',filter:'brightness(1.25)',offset:.55},{transform:'translate(0,0) scale(1)',filter:'brightness(1)'}];if(k==='blink')return [{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate(10px,0) scale(.82)',opacity:.25,offset:.35},{transform:'translate(-4px,0) scale(1.08)',opacity:1,offset:.7},{transform:'translate(0,0) scale(1)',opacity:1}];return [{transform:'translate(0,0)'},{transform:'translate(10px,-4px) rotate(9deg) scale(.94)',offset:.28},{transform:'translate(-4px,2px) rotate(-4deg)',offset:.58},{transform:'translate(0,0)'}];}
function tbWeaponCue(layer,id,style,critical){const cue=document.createElement('i');const colors={fire:'#ff713d',ice:'#7cecff',lightning:'#fff176',nature:'#62f2a1',void:'#c18bff',arcane:'#ffe08a'},color=colors[style]||colors.arcane;Object.assign(cue.style,{position:'absolute',left:id==='ranger'?'48%':'47%',top:'47%',width:id==='ranger'?'74px':'92px',height:id==='arcanist'?'92px':'5px',borderRadius:id==='arcanist'?'50%':'8px',border:id==='arcanist'?'2px solid '+color:'0',background:id==='arcanist'?'radial-gradient(circle,transparent 45%, '+color+' 49%, transparent 56%)':'linear-gradient(90deg,transparent,#fff,'+color+',transparent)',boxShadow:'0 0 15px '+color,zIndex:'7',pointerEvents:'none',opacity:'0'});if(id==='reaper')Object.assign(cue.style,{height:'48px',width:'48px',border:'4px solid '+color,borderLeftColor:'transparent',borderBottomColor:'transparent',borderRadius:'50%',background:'transparent'});layer.appendChild(cue);const first=id==='ranger'?-18:id==='reaper'?155:35,last=id==='ranger'?8:id==='reaper'?265:115;cue.animate([{transform:'translate(-50%,-50%) rotate('+first+'deg) scale(.35)',opacity:0},{transform:'translate(-50%,-50%) rotate('+last+'deg) scale('+(critical?1.65:1.2)+')',opacity:1,offset:.45},{transform:'translate(-50%,-50%) rotate(190deg) scale(1.9)',opacity:0}],{duration:id==='ranger'?240:critical?390:310,easing:'cubic-bezier(.15,.8,.2,1)'}).onfinish=()=>cue.remove();}
function domEnemyAttack(boss,special,heavy,kind,dodged){
 const layer=ensureDomFx(),hero=mount.querySelector('.tb-visible-hero'),enemy=mount.querySelector('.tb-visible-enemy');
 const id=enemy&&enemy.dataset.tbActorId||'shadow-goblin';
 const profile=(boss?TB_BOSS_PROFILES[id]:TB_ENEMY_PROFILES[id])||TB_ENEMY_PROFILES['shadow-goblin'];
 const bossKind={summon:'hex',evade:'blink',frenzy:'pounce',burn:'slam',strike:'slash'}[kind];
 const attackKind=boss&&bossKind?bossKind:profile.kind;
 const color=profile.color,hard=!!heavy||!!(boss&&special),duration=profile.duration+(hard?100:0);
 const frames=tbFrames({...profile,kind:attackKind});
 tbAnimate(enemy,frames,duration);
 if(hard){const ring=document.createElement('i');Object.assign(ring.style,{position:'absolute',left:'34%',top:'49%',width:(boss?58:42)+'px',height:(boss?58:42)+'px',border:(boss?3:2)+'px solid '+color,borderRadius:'50%',boxShadow:'0 0 '+(boss?25:15)+'px '+color,zIndex:'5',pointerEvents:'none'});appendBoundedFx(layer,ring);ring.animate([{transform:'translate(-50%,-50%) scale(.35)',opacity:0},{transform:'translate(-50%,-50%) scale(1.2)',opacity:.9,offset:.55},{transform:'translate(-50%,-50%) scale(1.9)',opacity:0}],{duration:boss?520:360,easing:'ease-out'}).onfinish=()=>ring.remove();}
 const rect=mount.getBoundingClientRect(),bolt=document.createElement('i'),size=hard?(boss?38:28):attackKind==='slash'?42:attackKind==='slam'?24:16,dx=Math.max(35,rect.width*(profile.reach/100));
 const shape=attackKind==='slash'?'linear-gradient(90deg,transparent,#fff,'+color+')':attackKind==='hex'?'radial-gradient(circle,#fff,'+color+')':color;
 Object.assign(bolt.style,{position:'absolute',left:'69%',top:attackKind==='slam'?'47%':'46%',width:size+'px',height:attackKind==='slash'?'5px':size+'px',borderRadius:attackKind==='slash'?'4px':'50%',background:shape,border:attackKind==='hex'?'2px solid #fff':'0',boxShadow:'0 0 '+(hard?32:18)+'px '+color,zIndex:'6',opacity:'0',pointerEvents:'none'});
 appendBoundedFx(layer,bolt);
 const travel=attackKind==='slam'?'translate(-'+dx+'px,10px)':attackKind==='pounce'?'translate(-'+dx+'px,-12px)':'translate(-'+dx+'px,0)';
 bolt.animate([{transform:'translate(0,0) scale(.45)',opacity:0},{transform:'translate(-8px,-4px) scale(1.15)',opacity:1,offset:.18},{transform:travel+' scale('+(hard?(boss?2:1.65):1)+')',opacity:dodged?.22:1}],{duration:hard?(boss?540:390):duration*.72,easing:'cubic-bezier(.12,.78,.2,1)',fill:'forwards'}).onfinish=()=>{bolt.remove();if(!dodged){const hit=document.createElement('i');Object.assign(hit.style,{position:'absolute',left:'34%',top:'49%',width:(hard?(boss?94:66):42)+'px',height:(hard?(boss?94:66):42)+'px',borderRadius:attackKind==='slash'?'35%':'50%',border:(hard?4:3)+'px solid '+color,boxShadow:'0 0 '+(hard?34:18)+'px '+color,zIndex:'6',pointerEvents:'none'});appendBoundedFx(layer,hit);hit.animate([{transform:'translate(-50%,-50%) scale(.25) rotate(0)',opacity:1},{transform:'translate(-50%,-50%) scale('+(hard?(boss?4:3.4):2.6)+') rotate(55deg)',opacity:0}],{duration:hard?460:250,easing:'ease-out'}).onfinish=()=>hit.remove();}};
 if(hero){const reaction=dodged?[{transform:'translateX(0)',opacity:1},{transform:'translateX(-22px) rotate(-5deg) scale(.92)',opacity:.55,offset:.4},{transform:'translateX(-4px)',opacity:1}]:[{transform:'translateX(0)',filter:'brightness(1)'},{transform:'translateX(-8px) rotate(-5deg)',filter:'brightness(1.8)',offset:.25},{transform:'translateX(3px) rotate(2deg)',filter:'brightness(1.2)'},{transform:'translateX(0)',filter:'brightness(1)'}];tbAnimate(hero,reaction,dodged?320:hard?(boss?520:420):280);}
 if(!dodged){const flash=document.createElement('i');Object.assign(flash.style,{position:'absolute',left:'34%',top:'49%',width:hard?(boss?'104px':'76px'):'48px',height:hard?(boss?'104px':'76px'):'48px',borderRadius:'50%',background:'radial-gradient(circle,'+color+'99,transparent 70%)',zIndex:'4',pointerEvents:'none'});appendBoundedFx(layer,flash);flash.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:.9},{transform:'translate(-50%,-50%) scale('+(boss?2.4:1.8)+')',opacity:0}],{duration:hard?(boss?560:420):260,easing:'ease-out'}).onfinish=()=>flash.remove();}
}// Guaranteed visible actor layer: independent of Phaser canvas compositing on iOS Safari.
function ensureVisibleActors(){
 if(!mount)return;
 let layer=mount.querySelector('.tb-visible-actors');
 if(!layer){layer=document.createElement('div');layer.className='tb-visible-actors';layer.setAttribute('aria-hidden','true');Object.assign(layer.style,{position:'absolute',inset:'0',zIndex:'2',display:'block',visibility:'visible',opacity:'1',pointerEvents:'none',overflow:'hidden'});mount.appendChild(layer);}
 layer.innerHTML='';
 const addActor=(cls,src,alt,style)=>{const img=document.createElement('img');img.className=cls;img.src=src;img.alt=alt;img.draggable=false;img.decoding='async';img.loading='eager';Object.assign(img.style,{position:'absolute',display:'block',visibility:'visible',opacity:'1',objectFit:'contain',pointerEvents:'none',transform:'translate(-50%,-50%)',filter:'drop-shadow(0 10px 10px #000d) drop-shadow(0 0 12px #e7caff55)',...style});layer.appendChild(img);return img;};
 if(!document.getElementById('tb-actor-animation-style')){
  const style=document.createElement('style');style.id='tb-actor-animation-style';
  style.textContent='@keyframes tbEnemyIdle{0%,100%{translate:0 0;rotate:0deg;scale:1;filter:drop-shadow(0 10px 10px #000d) drop-shadow(0 0 12px #e7caff55)}24%{translate:0 -5px;rotate:-1deg;scale:1.015}50%{translate:0 -10px;rotate:0deg;scale:1.025;filter:drop-shadow(0 15px 12px #000d) drop-shadow(0 0 18px #e7caff88)}76%{translate:0 -4px;rotate:1deg;scale:1.01}}@keyframes tbWardenIdle{0%,100%{translate:0 0;rotate:0deg;scale:1}22%{translate:-1px -3px;rotate:-.45deg;scale:1.008}50%{translate:0 -8px;rotate:.25deg;scale:1.018;filter:drop-shadow(0 15px 12px #000d) drop-shadow(0 0 17px #b8caff88)}78%{translate:1px -2px;rotate:.4deg;scale:1.006}}@keyframes tbRangerIdle{0%,100%{translate:0 0;rotate:0deg;scale:1}25%{translate:1px -4px;rotate:.65deg;scale:1.01}50%{translate:0 -7px;rotate:-.3deg;scale:1.014;filter:drop-shadow(0 14px 12px #000d) drop-shadow(0 0 16px #8ee8a988)}75%{translate:-1px -2px;rotate:-.7deg;scale:1.005}}@keyframes tbArcanistIdle{0%,100%{translate:0 0;rotate:0deg;scale:1;filter:drop-shadow(0 10px 10px #000d) drop-shadow(0 0 12px #c18bff66)}25%{translate:0 -5px;rotate:-.35deg;scale:1.012}50%{translate:0 -12px;rotate:0deg;scale:1.02;filter:drop-shadow(0 16px 12px #000d) drop-shadow(0 0 24px #d5a0ffbb)}75%{translate:0 -4px;rotate:.35deg;scale:1.008}}@keyframes tbReaperIdle{0%,100%{translate:0 0;rotate:0deg;scale:1}24%{translate:-1px -3px;rotate:-.8deg;scale:1.008}50%{translate:0 -8px;rotate:.4deg;scale:1.018;filter:drop-shadow(0 15px 12px #000d) drop-shadow(0 0 19px #9e83dbaa)}76%{translate:1px -2px;rotate:.8deg;scale:1.006}}@media(prefers-reduced-motion:reduce){.tb-visible-hero,.tb-visible-enemy{animation:none!important;translate:0 0!important;rotate:0deg!important;scale:1!important}}';
  document.head.appendChild(style);
 }
 addActor('tb-visible-hero','./assets/characters/heroes/image.jpeg','Герой башни',{left:'34%',top:'49%',width:'clamp(116px,28vw,184px)',height:'72%',animation:'tbHeroIdle 2.2s ease-in-out infinite'});
 const enemy=addActor('tb-visible-enemy','./assets/characters/enemies/image 3.jpeg','Страж Бездны',{left:'68%',top:'49%',width:'clamp(118px,30vw,202px)',height:'72%',animation:'tbEnemyIdle 2.8s ease-in-out infinite'});
 enemy.onerror=()=>{enemy.onerror=null;enemy.src='./assets/characters/enemies/image 4.jpeg';};
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
window.TowerFX={enemyAttack:(boss,special,heavy,kind,dodged)=>{const token=(window._tbEnemyAttackToken||0)+1;window._tbEnemyAttackToken=token;setTimeout(()=>{if(window._tbEnemyAttackToken===token)domEnemyAttack(!!boss,!!special,!!heavy,kind,!!dodged)},260)},hit:(critical,boss,style='arcane')=>{domCombatHit(critical,boss,style);if(window.TowerModels&&window.TowerModels.hit)window.TowerModels.hit(critical,boss);if(!tbMobilePerf&&arenaScene&&scene.impact)scene.impact.call(arenaScene,critical,boss,style);},clear:()=>{const fx=mount.querySelector('.tb-dom-fx');if(fx){fx.querySelectorAll('*').forEach(n=>{if(n.getAnimations)n.getAnimations().forEach(a=>a.cancel());});fx.replaceChildren();}mount.querySelectorAll('.tb-visible-hero,.tb-visible-enemy').forEach(n=>{if(n.getAnimations)n.getAnimations().forEach(a=>a.cancel());});},win:()=>{if(arenaScene&&scene.victory)scene.victory.call(arenaScene);},hero:(heroId)=>{if(arenaScene&&scene.setHero)scene.setHero.call(arenaScene,heroId);else window.TowerboundHeroId=heroId||'warden';},wave:(wave,boss)=>{if(window.TowerModels&&window.TowerModels.wave)window.TowerModels.wave(wave,boss);if(arenaScene&&scene.setWave)scene.setWave.call(arenaScene,wave,boss);},phase:(phase)=>{if(arenaScene&&scene.setPhase)scene.setPhase.call(arenaScene,phase);}};
})();