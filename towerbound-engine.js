/* TOWERBOUND PIXEL ENGINE — Phaser 3 scene layer */
(()=>{'use strict';
if(!window.Phaser){document.documentElement.classList.add('phaser-fallback');/* keep DOM actors alive if the Phaser CDN fails */}
const mount=document.getElementById('phaser-arena');
const PALETTE={night:0x101326,stone:0x282b48,stone2:0x393858,edge:0x686184,cyan:0x78e7ef,gold:0xf8ce72,red:0xe85e78,purple:0x9b78ed};
function makePixelTexture(scene,key,rows,palette,scale=3){
 const h=rows.length,w=Math.max(...rows.map(r=>r.length)),canvas=document.createElement('canvas');
 canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,w,h);
 rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=='.'&&palette[c]){ctx.fillStyle=palette[c];ctx.fillRect(x,y,1,1)}}));
 scene.textures.addCanvas(key,canvas);const t=scene.textures.get(key);t.setFilter(Phaser.Textures.FilterMode.NEAREST);return t;
}
const heroRows=[
'.....111111.....','....12222221....','....12333221....','....12333221....','.....144441.....',
'....55555555....','...5565556555...','...5565556555...','....55555555....','.....566665.....',
'....777777777...','...7787778777...','...7787778777...','....77777777....','....88....88....',
'....88....88....','...888....888...'];
const enemyRows=[
'.....111111.....','....12222221....','...12232232221...','..1222322322221..','..1222222222221..',
'..1332211222331..','..1333311333331..','...13333333331...','....333333331....','.....344443......',
'....555555555.....','...55655565555....','...55655565555....','....555555555.....','....66.....66.....',
'...666.....666....','...66.......66....'];
const palette={'.':null,'1':'#15172a','2':'#7359a5','3':'#b5a0e7','4':'#f5d38a','5':'#394f77','6':'#212a48','7':'#b94e69','8':'#e8bd78'};
const foePalette={'.':null,'1':'#141322','2':'#693b55','3':'#c34e69','4':'#ff9a70','5':'#353653','6':'#202236'};
const scene={key:'PixelArena',
preload:function(){this.load.image('tb-arena-background','./assets/arena-background.webp?v=1');this.load.spritesheet('tb-enemy-atlas','./assets/enemy-atlas.webp?v=1',{frameWidth:256,frameHeight:256});},
create:function(){
 this.phase='prep';this.cameras.main.setBackgroundColor('#101326');this.pixelActors=[];this.fx=[];
 const w=this.scale.width,h=this.scale.height,g=this.add.graphics();g.setDepth(-20);g.setAlpha(.24);this.add.image(w/2,h/2,'tb-arena-background').setDisplaySize(w,h).setDepth(-10);
 g.fillStyle(0x111428,1);g.fillRect(0,0,w,h);
 // Pixel-art night sky and moon
 g.fillStyle(0x28294a,1);g.fillCircle(w*.78,h*.19,Math.max(12,h*.09));
 g.fillStyle(0x111428,1);g.fillCircle(w*.81,h*.16,Math.max(10,h*.08));
 for(let i=0;i<55;i++){let x=(i*73+17)%w,y=(i*41+11)%(h*.53);g.fillStyle(i%5===0?0xf7d887:0x9f9bd7,i%4===0?.9:.45);g.fillRect(Math.round(x/3)*3,Math.round(y/3)*3,i%7===0?3:2,i%7===0?3:2);}
 // Distant gothic skyline in stepped pixel blocks
 for(let i=0;i<15;i++){let x=i*w/14,bh=25+(i*29%Math.max(30,h*.28));g.fillStyle(i%2?0x1a1d36:0x22223f,1);g.fillRect(Math.floor(x),h*.63-bh,Math.ceil(w/18),bh);g.fillRect(Math.floor(x)-3,h*.63-bh-6,Math.ceil(w/18)+6,6);g.fillStyle(0x66507f,.75);g.fillRect(Math.floor(x)+4,h*.63-bh+12,3,Math.max(5,bh-15));}
 // stone platform, tile seams, glowing runic circle
 g.fillStyle(0x29283f,1);g.fillRect(0,h*.65,w,h*.35);
 g.fillStyle(0x413951,1);g.fillRect(0,h*.65,w,4);
 g.lineStyle(1,0x655478,.55);for(let y=h*.69;y<h;y+=18){g.lineBetween(0,y,w,y);for(let x=(Math.floor(y/18)%2)*20;x<w;x+=40)g.lineBetween(x,y,x,y+18);}
 g.lineStyle(3,0x9876d8,.62);g.strokeCircle(w*.5,h*.74,Math.min(w*.24,h*.24));
 g.lineStyle(1,0xf4cf79,.8);g.strokeCircle(w*.5,h*.74,Math.min(w*.18,h*.18));
 for(let i=0;i<8;i++){let a=i*Math.PI/4,x=w*.5+Math.cos(a)*Math.min(w*.2,h*.2),y=h*.74+Math.sin(a)*Math.min(w*.2,h*.2);g.fillStyle(0xf6d17b,1);g.fillRect(Math.round(x),Math.round(y),4,4);}
 // pillars and brazier lamps
 for(const x of [w*.12,w*.88]){g.fillStyle(0x393450,1);g.fillRect(x-7,h*.48,14,h*.2);g.fillStyle(0x75618f,1);g.fillRect(x-11,h*.47,22,5);g.fillStyle(0xf6b76c,.9);g.fillRect(x-3,h*.43,6,7);g.fillStyle(0xff9c67,.24);g.fillCircle(x,h*.44,12);}
 // Local sprites ensure the arena never depends on a remote image.
 makePixelTexture(this,'tb-hero',heroRows,palette);
 makePixelTexture(this,'tb-foe',enemyRows,foePalette);
 const skeletonRows=['....111111....','...1222221...','..123232321..','..122222221..','...1333331...','....34443....','...5555555...','..556555655..','..556555655..','...5555555...','....66.66....','....66.66....'];const bruteRows=['....111111....','...12222221...','..1233333321..','..1233333321..','...1444441...','...55555555...','..5565556555..','..5565556555..','...55555555...','...666..666...','..6666..6666..'];makePixelTexture(this,'tb-skeleton',skeletonRows,{'1':'#181628','2':'#d2d1df','3':'#8b8ca7','4':'#8ef0e4','5':'#363b58','6':'#20243a'});makePixelTexture(this,'tb-brute',bruteRows,{'1':'#171327','2':'#8c304d','3':'#d34c67','4':'#ffba77','5':'#5a2c48','6':'#2a2139'});
 this.hero=this.add.image(w*.34,h*.51,'tb-hero').setOrigin(.5,.5).setScale(2.35).setDepth(4);
 this.enemy=this.add.image(w*.67,h*.51,'tb-foe').setOrigin(.5,.5).setScale(2.35).setDepth(4);
 this.phaseLabel=this.add.text(w/2,18,'ПОДГОТОВКА К БОЮ',{fontFamily:'monospace',fontSize:'11px',fontStyle:'bold',color:'#f8ce72',stroke:'#101326',strokeThickness:3}).setOrigin(.5,0).setDepth(12);
 this.heroAura=this.add.circle(w*.34,h*.72,24,0x72e7ed,.08).setDepth(2);
 this.foeAura=this.add.circle(w*.67,h*.72,40,0xe85e78,.12).setDepth(2);
 this.heroShadow=this.add.ellipse(w*.34,h*.76,42,11,0x050711,.65).setDepth(3);
 this.foeShadow=this.add.ellipse(w*.67,h*.76,70,16,0x050711,.7).setDepth(3);
 this.tweens.add({targets:this.hero,y:this.hero.y-10,angle:-2,duration:520,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 this.tweens.add({targets:this.enemy,y:this.enemy.y-8,angle:2,duration:680,yoyo:true,repeat:-1,ease:'Sine.inOut',delay:150});
 this.tweens.add({targets:this.heroShadow,scaleX:1.18,alpha:.35,duration:520,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 this.tweens.add({targets:this.foeShadow,scaleX:1.15,alpha:.42,duration:680,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 this.tweens.add({targets:this.phaseLabel,alpha:.58,duration:1100,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 this.tweens.add({targets:this.heroAura,alpha:.22,scale:1.15,duration:1000,yoyo:true,repeat:-1});
 this.tweens.add({targets:this.foeAura,alpha:.25,scale:1.12,duration:900,yoyo:true,repeat:-1});
 this.sparkles=[]; /* tiny floating pixel particles removed for a clean battlefield */
 this.scale.on('resize',this.onResize,this);
},
onResize:function(){if(this.scene.isActive())this.scene.restart();},
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
setWave:function(wave,boss){if(!this.enemy)return;const kind=wave%4===1?'tb-foe':(wave%4===2?'tb-skeleton':'tb-brute');this.enemy.setTexture(kind==='tb-skeleton'?'tb-skeleton':kind==='tb-brute'?'tb-brute':'tb-foe');this.enemy.setTint(boss?0xff8eaa:0xffffff);this.enemy.setScale(boss?.88:.76);this.foeAura.setFillStyle(boss?0xe85e78:(wave%4===2?0x78e7ef:0x9b78ed),boss?.2:.12);this.setPhase(this.phase||'prep');},
update:function(time){if(this.heroAura)this.heroAura.setAlpha(.08+((Math.sin(time*.004)+1)*.09));if(this.foeAura)this.foeAura.setAlpha(.1+((Math.sin(time*.003+1)+1)*.1));}
};

// DOM combat FX: visible even when Phaser canvas is hidden by mobile stacking/compositing.
function ensureDomFx(){
 let layer=mount.querySelector('.tb-dom-fx');
 if(!layer){layer=document.createElement('div');layer.className='tb-dom-fx';layer.setAttribute('aria-hidden','true');
 Object.assign(layer.style,{position:'absolute',inset:'0',overflow:'hidden',pointerEvents:'none',zIndex:'2'});
 mount.appendChild(layer);}
 return layer;
}
function domCombatHit(critical=false,boss=false,style='arcane'){
 const layer=ensureDomFx();
 // Animate the always-visible SVG actors too, not only the Phaser canvas.
 const actorHero=mount.querySelector('.tb-visible-hero'),actorEnemy=mount.querySelector('.tb-visible-enemy');
 if(actorHero&&actorHero.animate)actorHero.animate([{translate:'0 0',rotate:'0deg'},{translate:'12px -4px',rotate:critical?'9deg':'5deg'},{translate:'0 0',rotate:'0deg'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});
 if(actorEnemy&&actorEnemy.animate)actorEnemy.animate([{translate:'0 0',rotate:'0deg',filter:'brightness(1)'},{translate:'-5px 0',rotate:critical?'-12deg':'-6deg',filter:'brightness(2)'},{translate:'0 0',rotate:'0deg',filter:'brightness(1)'}],{duration:critical?340:260,easing:'ease-out'});
 const colors={fire:'#ff713d',ice:'#7cecff',lightning:'#fff176',nature:'#62f2a1',void:'#c18bff',arcane:'#ffe08a'};
 const color=colors[style]||colors.arcane;
 // Distinct readable silhouettes per damage school; each school has its own projectile motif.
 const glyphs={fire:'✹',ice:'❄',lightning:'ϟ',nature:'✦',void:'◈',arcane:'✧'};
 const glyph=document.createElement('b');
 glyph.textContent=glyphs[style]||glyphs.arcane;
 Object.assign(glyph.style,{position:'absolute',left:'32%',top:'42%',font:'900 '+(critical?'29px':'22px')+' system-ui',lineHeight:'1',color, textShadow:'0 0 8px '+color+',0 0 18px '+color+',0 2px 4px #000',zIndex:'4',transform:'translate(-50%,-50%) rotate(-20deg)'});
 layer.appendChild(glyph);
 const glyphAnim=glyph.animate([{left:'32%',top:'42%',transform:'translate(-50%,-50%) rotate(-20deg) scale(.45)',opacity:0},{left:'48%',top:'47%',transform:'translate(-50%,-50%) rotate(35deg) scale(1.2)',opacity:1,offset:.35},{left:'67%',top:'48%',transform:'translate(-50%,-50%) rotate(110deg) scale('+(critical?1.7:1)+')',opacity:1}],{duration:critical?260:220,easing:'cubic-bezier(.15,.8,.2,1)',fill:'forwards'});
 glyphAnim.onfinish=()=>glyph.remove();
 const orb=document.createElement('i');
 Object.assign(orb.style,{position:'absolute',left:'31%',top:'48%',width:(critical?18:13)+'px',height:(critical?18:13)+'px',borderRadius:'50%',background:color,boxShadow:'0 0 '+(critical?30:20)+'px '+color+',0 0 5px #fff',border:'2px solid #fff',zIndex:'3',opacity:'1'});
 layer.appendChild(orb);
 const rect=mount.getBoundingClientRect(),dx=Math.max(25,rect.width*.36),dy=(Math.random()-.5)*rect.height*.12;
 const anim=orb.animate([{transform:'translate(0,0) scale(.55)',opacity:0},{transform:'translate('+(-dx*.05)+'px,'+(-dy)+'px) scale(1.25)',opacity:1,offset:.16},{transform:'translate('+dx+'px,'+dy+'px) scale('+(critical?1.65:1)+')',opacity:1}],{duration:critical?230:190,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
 anim.onfinish=()=>{
  orb.remove();
  const burst=document.createElement('i');
  Object.assign(burst.style,{position:'absolute',left:'67%',top:(48+dy/Math.max(1,rect.height)*100)+'%',width:(critical?24:15)+'px',height:(critical?24:15)+'px',borderRadius:'50%',border:(critical?4:3)+'px solid '+color,boxShadow:'0 0 '+(critical?30:18)+'px '+color,zIndex:'3'});
  layer.appendChild(burst);
  burst.animate([{transform:'translate(-50%,-50%) scale(.35)',opacity:1},{transform:'translate(-50%,-50%) scale('+(critical?3.8:2.8)+')',opacity:0}],{duration:critical?380:300,easing:'ease-out'}).onfinish=()=>burst.remove();
  if(critical){const flash=document.createElement('b');flash.textContent='CRITICAL!';Object.assign(flash.style,{position:'absolute',left:'67%',top:'29%',transform:'translateX(-50%)',font:'900 15px system-ui',color:'#fff1a6',textShadow:'0 0 12px #ff8c36,0 2px 4px #000',whiteSpace:'nowrap',zIndex:'4'});layer.appendChild(flash);flash.animate([{transform:'translate(-50%,8px) scale(.7)',opacity:0},{transform:'translate(-50%,-12px) scale(1.15)',opacity:1,offset:.25},{transform:'translate(-50%,-34px) scale(1)',opacity:0}],{duration:650,easing:'ease-out'}).onfinish=()=>flash.remove();}
 };
}

// Guaranteed visible actor layer: independent of Phaser canvas compositing on iOS Safari.
function ensureVisibleActors(){
 if(!mount)return;
 let layer=mount.querySelector('.tb-visible-actors');
 if(!layer){
  layer=document.createElement('div');layer.className='tb-visible-actors';layer.setAttribute('aria-hidden','true');
  Object.assign(layer.style,{position:'absolute',inset:'0',zIndex:'1',pointerEvents:'none',overflow:'hidden'});
  const make=(cls,emoji,left,label)=>{
   const el=document.createElement('div');el.className=cls;el.setAttribute('aria-label',label);
   el.innerHTML=cls==='tb-visible-hero'
    ? '<svg viewBox="0 0 32 40" width="clamp(48px,14vw,76px)" height="clamp(60px,17vw,94px)" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="37" rx="12" ry="2.5" fill="#050711" opacity=".75"/><path d="M8 14H24V28H8Z" fill="#293653"/><path d="M8 14H24V18H8Z" fill="#78e7ef"/><path d="M5 17H9V28H5ZM23 17H27V28H23Z" fill="#4a5b83"/><path d="M9 5H23V16H9Z" fill="#d7e5ee" stroke="#17172b" stroke-width="2"/><path d="M10 8H22V12H10Z" fill="#25324f"/><path d="M12 9H15V11H12ZM18 9H21V11H18Z" fill="#83f5ed"/><path d="M7 4H25V8H7Z" fill="#f8ce72" stroke="#17172b" stroke-width="1.5"/><path d="M14 1H18V5H14Z" fill="#fff0b0"/><path d="M9 27H14V35H9ZM18 27H23V35H18Z" fill="#252842" stroke="#111326" stroke-width="1.5"/><path d="M4 19H7V30H4ZM25 19H28V30H25Z" fill="#f8ce72"/><path d="M2 18H5V27H2Z" fill="#d7e5ee"/></svg>'
    : '<svg viewBox="0 0 36 40" width="clamp(50px,15vw,82px)" height="clamp(58px,17vw,94px)" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="37" rx="14" ry="2.5" fill="#050711" opacity=".75"/><path d="M6 12L2 4L11 8L14 3L19 8L27 4L25 12L31 10L29 24H7Z" fill="#7e304f" stroke="#171326" stroke-width="2"/><path d="M8 13H28V25H8Z" fill="#c34e69"/><path d="M11 15H15V19H11ZM21 15H25V19H21Z" fill="#ffcf7b"/><path d="M12 22H24L21 26H15Z" fill="#30192f"/><path d="M10 25H16V34H10ZM20 25H26V34H20Z" fill="#353653" stroke="#171326" stroke-width="2"/><path d="M5 17H9V28H5ZM27 17H31V28H27Z" fill="#8d3656"/><path d="M13 2L16 7H11ZM23 2L25 7H20Z" fill="#f8ce72"/></svg>';
   Object.assign(el.style,{position:'absolute',left,top:'43%',transform:'translate(-50%,-50%)',display:'flex',alignItems:'center',justifyContent:'center',filter:'drop-shadow(0 5px 4px #000b)',animation:'tb-actor-float 1.5s ease-in-out infinite alternate',visibility:'visible',opacity:'1'});
   layer.appendChild(el);return el;
  };
  make('tb-visible-hero','🛡️','34%','Hero');
  make('tb-visible-enemy','👹','67%','Enemy').style.animationDelay='.25s';
  const style=document.createElement('style');style.textContent='@keyframes tb-actor-float{from{margin-top:0}to{margin-top:-7px}}';mount.appendChild(style);
  mount.appendChild(layer);
 }
}
ensureVisibleActors();
if(!window.Phaser){console.warn('Towerbound: Phaser CDN unavailable; DOM actor fallback remains active.');return;}
const game=new Phaser.Game({type:Phaser.CANVAS,parent:mount,width:700,height:300,backgroundColor:'#101326',pixelArt:false,antialias:true,roundPixels:false,scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true,pixelArt:false,roundPixels:false},scene});
window.TowerFX={hit:(critical,boss,style='arcane')=>{domCombatHit(critical,boss,style);const s=game.scene.getScene('PixelArena');if(s&&s.impact)s.impact(critical,boss,style);},win:()=>{const s=game.scene.getScene('PixelArena');if(s&&s.victory)s.victory();},wave:(wave,boss)=>{const s=game.scene.getScene('PixelArena');if(s&&s.setWave)s.setWave(wave,boss);},phase:(phase)=>{const s=game.scene.getScene('PixelArena');if(s&&s.setPhase)s.setPhase(phase);}};
})();