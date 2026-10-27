/* TOWERBOUND PIXEL ENGINE — Phaser 3 scene layer */
(()=>{'use strict';
if(!window.Phaser){document.documentElement.classList.add('phaser-fallback');return;}
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
create:function(){
 this.phase='prep';this.cameras.main.setBackgroundColor('#101326');this.pixelActors=[];this.fx=[];
 const w=this.scale.width,h=this.scale.height,g=this.add.graphics();
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
 makePixelTexture(this,'tb-hero',heroRows,palette);makePixelTexture(this,'tb-foe',enemyRows,foePalette);
 const skeletonRows=['....111111....','...1222221...','..123232321..','..122222221..','...1333331...','....34443....','...5555555...','..556555655..','..556555655..','...5555555...','....66.66....','....66.66....'];const bruteRows=['....111111....','...12222221...','..1233333321..','..1233333321..','...1444441...','...55555555...','..5565556555..','..5565556555..','...55555555...','...666..666...','..6666..6666..'];makePixelTexture(this,'tb-skeleton',skeletonRows,{'1':'#181628','2':'#d2d1df','3':'#8b8ca7','4':'#8ef0e4','5':'#363b58','6':'#20243a'});makePixelTexture(this,'tb-brute',bruteRows,{'1':'#171327','2':'#8c304d','3':'#d34c67','4':'#ffba77','5':'#5a2c48','6':'#2a2139'});
 this.hero=this.add.image(w*.34,h*.56,'tb-hero').setOrigin(.5,.5).setScale(2.5).setDepth(4);
 this.enemy=this.add.image(w*.67,h*.56,'tb-foe').setOrigin(.5,.5).setScale(2.5).setDepth(4);
 this.phaseLabel=this.add.text(w/2,18,'ПОДГОТОВКА К БОЮ',{fontFamily:'monospace',fontSize:'11px',fontStyle:'bold',color:'#f8ce72',stroke:'#101326',strokeThickness:3}).setOrigin(.5,0).setDepth(12);
 this.heroAura=this.add.circle(w*.34,h*.69,24,0x72e7ed,.08).setDepth(2);
 this.foeAura=this.add.circle(w*.67,h*.69,27,0xe85e78,.12).setDepth(2);
 this.heroShadow=this.add.ellipse(w*.34,h*.69,37,10,0x050711,.65).setDepth(3);
 this.foeShadow=this.add.ellipse(w*.67,h*.69,42,11,0x050711,.7).setDepth(3);
 this.tweens.add({targets:this.hero,y:this.hero.y-10,angle:-2,duration:520,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 this.tweens.add({targets:this.enemy,y:this.enemy.y-8,angle:2,duration:680,yoyo:true,repeat:-1,ease:'Sine.inOut',delay:150});
 this.tweens.add({targets:this.heroShadow,scaleX:1.18,alpha:.35,duration:520,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 this.tweens.add({targets:this.foeShadow,scaleX:1.15,alpha:.42,duration:680,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 this.tweens.add({targets:this.phaseLabel,alpha:.58,duration:1100,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 this.tweens.add({targets:this.heroAura,alpha:.22,scale:1.15,duration:1000,yoyo:true,repeat:-1});
 this.tweens.add({targets:this.foeAura,alpha:.25,scale:1.12,duration:900,yoyo:true,repeat:-1});
 this.sparkles=[];for(let i=0;i<18;i++){const x=(i*47+19)%w,y=(i*31+13)%(h*.62),p=this.add.rectangle(x,y,2,2,i%3?0xb5a0e7:0xf8ce72,.8).setDepth(5);this.sparkles.push(p);this.tweens.add({targets:p,alpha:0,y:y-8,duration:1000+i%5*180,delay:i*90,yoyo:true,repeat:-1});}
 this.scale.on('resize',this.onResize,this);
},
onResize:function(){if(this.scene.isActive())this.scene.restart();},
setPhase:function(phase){this.phase=phase;const labels={prep:'ПОДГОТОВКА К БОЮ',battle:'БОЙ · АТАКА И ЗАЩИТА',reward:'НАГРАДА ЗА ПОБЕДУ',victory:'АРЕНА ПОКОРЕНА',defeat:'ОТРЯД ПАЛ'};if(this.phaseLabel)this.phaseLabel.setText(labels[phase]||labels.prep);if(this.hero&&this.enemy){this.hero.setAlpha(phase==='defeat'?.65:1);this.enemy.setAlpha(phase==='victory'?.35:1);}},
 impact:function(critical=false,boss=false){
 const w=this.scale.width,h=this.scale.height,target=this.enemy,hero=this.hero;
 if(hero){this.tweens.killTweensOf(hero);const hx=hero.x,hy=hero.y;this.tweens.add({targets:hero,x:hx+Math.min(38,w*.07),y:hy-13,angle:critical?12:6,duration:100,yoyo:true,ease:'Cubic.Out',onComplete:()=>{if(hero&&hero.active){this.tweens.add({targets:hero,x:hx,y:hy,angle:0,duration:130,ease:'Cubic.InOut',onComplete:()=>{if(hero&&hero.active)this.tweens.add({targets:hero,y:hy-10,angle:-2,duration:520,yoyo:true,repeat:-1,ease:'Sine.inOut'});}});}});}
 this.tweens.add({targets:target,x:target.x+18,angle:critical?10:5,duration:48,yoyo:true,repeat:3,ease:'Sine.inOut',onComplete:()=>{if(target&&target.active){target.setAngle(0);}}});
 const x=target.x,y=target.y;const damage=this.add.text(x,y-35,critical?'CRITICAL!':'✦ HIT',{fontFamily:'monospace',fontSize:critical?'16px':'12px',fontStyle:'bold',color:critical?'#ffe29a':'#a7fbff',stroke:'#101326',strokeThickness:4}).setOrigin(.5).setDepth(12);this.tweens.add({targets:damage,y:y-76,alpha:0,scale:1.2,duration:620,ease:'Cubic.Out',onComplete:()=>damage.destroy()});const flash=this.add.rectangle(x,y,critical?68:44,critical?68:44,critical?0xffd478:0x8ceaf0,.65).setDepth(8);
 this.tweens.add({targets:flash,alpha:0,scale:2.2,duration:260,onComplete:()=>flash.destroy()});
 for(let i=0;i<(critical?24:13);i++){const a=Math.random()*Math.PI*2,d=18+Math.random()*(critical?85:48),p=this.add.rectangle(x,y,critical?4:3,critical?4:3,critical?0xffbd62:(boss?0xf66c91:0x82e8ef),1).setDepth(9);this.tweens.add({targets:p,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,angle:90,duration:220+Math.random()*280,onComplete:()=>p.destroy()});}
 if(critical){const f=this.add.rectangle(w/2,h/2,w,h,0xffe2a1,.2).setDepth(10);this.tweens.add({targets:f,alpha:0,duration:160,onComplete:()=>f.destroy()});}
},
victory:function(){const w=this.scale.width,h=this.scale.height;for(let i=0;i<48;i++){const p=this.add.rectangle(Math.random()*w,-8,3+Math.random()*3,4+Math.random()*4,[0xf8ce72,0x78e7ef,0xb5a0e7][i%3],1).setDepth(10);this.tweens.add({targets:p,y:h+12,x:p.x+(Math.random()-.5)*100,angle:360,duration:900+Math.random()*1200,delay:Math.random()*300,onComplete:()=>p.destroy()});}},
setWave:function(wave,boss){if(!this.enemy)return;const kind=wave%4===1?'tb-foe':(wave%4===2?'tb-skeleton':'tb-brute');this.enemy.setTexture(boss?'tb-brute':kind);this.enemy.setTint(boss?0xff8eaa:0xffffff);this.enemy.setScale(boss?3.15:(wave%4===2?2.9:2.5));this.foeAura.setFillStyle(boss?0xe85e78:(wave%4===2?0x78e7ef:0x9b78ed),boss?.2:.12);this.setPhase(this.phase||'prep');},
update:function(time){this.sparkles.forEach((p,i)=>{p.x+=Math.sin(time*.001+i)*.22;p.y+=Math.cos(time*.0007+i)*.06;});if(this.heroAura)this.heroAura.setAlpha(.08+((Math.sin(time*.004)+1)*.09));if(this.foeAura)this.foeAura.setAlpha(.1+((Math.sin(time*.003+1)+1)*.1));}
};
const game=new Phaser.Game({type:Phaser.CANVAS,parent:mount,width:700,height:300,backgroundColor:'#101326',pixelArt:true,antialias:false,roundPixels:true,scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:false,pixelArt:true,roundPixels:true},scene});
window.TowerFX={hit:(critical,boss)=>{const s=game.scene.getScene('PixelArena');if(s&&s.impact)s.impact(critical,boss);},win:()=>{const s=game.scene.getScene('PixelArena');if(s&&s.victory)s.victory();},wave:(wave,boss)=>{const s=game.scene.getScene('PixelArena');if(s&&s.setWave)s.setWave(wave,boss);},phase:(phase)=>{const s=game.scene.getScene('PixelArena');if(s&&s.setPhase)s.setPhase(phase);}};
})();