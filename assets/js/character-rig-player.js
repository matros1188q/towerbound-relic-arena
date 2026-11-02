/* Towerbound Cutout Rig Player v1 — Canvas2D, data-only manifests, no WebGL dependency. */
(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=(name,t)=>name==='step'?0:name==='ease-in'?t*t:name==='ease-out'?1-(1-t)*(1-t):name==='ease-in-out'?t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2:t;
function interpolate(frames,time){
 if(!frames||!frames.length)return {};
 if(time<=frames[0].at_ms)return frames[0];
 for(let i=1;i<frames.length;i++){const b=frames[i],a=frames[i-1];if(time<=b.at_ms){
  const t=ease(b.easing||'linear',clamp((time-a.at_ms)/Math.max(1,b.at_ms-a.at_ms),0,1)),o={};
  for(const k of ['x','y','rotation_deg','scale_x','scale_y','opacity']){const d=k==='scale_x'||k==='scale_y'||k==='opacity'?1:0,av=a[k]===undefined?d:a[k],bv=b[k]===undefined?av:b[k];o[k]=lerp(av,bv,t);}return o;
 }}return frames[frames.length-1];
}
function validate(rig){
 const e=[];if(!rig||rig.schema_version!==1)e.push('unsupported schema_version');
 if(!rig.canvas||!(rig.canvas.width>0&&rig.canvas.height>0))e.push('invalid canvas');
 const ids=new Set((rig.parts||[]).map(p=>p.id));if(!ids.has(rig.root))e.push('root part missing');
 for(const p of rig.parts||[]){if(!p.id||!p.image)e.push('part requires id and image');if(p.parent!==null&&!ids.has(p.parent))e.push('unknown parent: '+p.parent);if(!Array.isArray(p.pivot)||p.pivot.length!==2)e.push('invalid pivot: '+p.id);}
 for(const c of rig.clips||[])for(const t of c.tracks||[]){if(!ids.has(t.part))e.push('clip targets missing part: '+t.part);if(!Array.isArray(t.keyframes)||t.keyframes.length<2)e.push('track needs keyframes: '+t.part);}
 return e;
}
class RigPlayer{
 constructor(canvas,rig,options){
  if(!canvas||!canvas.getContext)throw Error('Canvas2D canvas required');
  const errors=validate(rig);if(errors.length)throw Error('Invalid rig: '+errors.join('; '));
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.rig=rig;this.options=options||{};this.images=new Map();this.parts=new Map(rig.parts.map(p=>[p.id,p]));this.ordered=[...rig.parts].sort((a,b)=>(a.z_index||0)-(b.z_index||0));this.clip=null;this.elapsed=0;this.rate=1;this.paused=true;this.raf=0;this.destroyed=false;this.eventsFired=new Set();this.lastTime=0;this.loadPromise=this.loadImages();this.tick=this.tick.bind(this);
 }
 async loadImages(){await Promise.all(this.rig.parts.map(p=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{this.images.set(p.id,img);resolve();};img.onerror=()=>reject(Error('Unable to load '+p.image));img.src=p.image;})));this.render(0);return this;}
 play(name,options){const c=this.rig.clips.find(x=>x.id===name);if(!c)throw Error('Unknown clip '+name);this.clip=c;this.elapsed=0;this.eventsFired.clear();this.rate=options&&options.rate>0?options.rate:1;this.paused=false;this.lastTime=0;if(!this.raf)this.raf=requestAnimationFrame(this.tick);return this;}
 pause(){this.paused=true;return this;} resume(){if(this.clip&&!this.destroyed){this.paused=false;this.lastTime=0;if(!this.raf)this.raf=requestAnimationFrame(this.tick);}return this;}
 stop(){this.paused=true;this.elapsed=0;this.render(0);return this;}
 tick(now){this.raf=0;if(this.destroyed)return;if(!this.paused&&this.clip){if(this.lastTime)this.elapsed+=(now-this.lastTime)*this.rate;this.lastTime=now;const d=this.clip.duration_ms;if(this.elapsed>=d){if(this.clip.loop)this.elapsed%=d;else{this.elapsed=d;this.paused=true;}}this.render(this.elapsed);for(const e of this.clip.events||[]){const key=this.clip.id+':'+e.id+':'+e.at_ms;if(this.elapsed>=e.at_ms&&!this.eventsFired.has(key)){this.eventsFired.add(key);if(this.options.onEvent)this.options.onEvent(e,this);}}}if(!this.paused)this.raf=requestAnimationFrame(this.tick);}
 render(time){
  const c=this.ctx,w=this.canvas.width,h=this.canvas.height,s=Math.min(w/this.rig.canvas.width,h/this.rig.canvas.height),tracks=new Map((this.clip&&this.clip.tracks||[]).map(t=>[t.part,t])),world=new Map();
  c.clearRect(0,0,w,h);c.save();c.translate((w-this.rig.canvas.width*s)/2,(h-this.rig.canvas.height*s)/2);c.scale(s,s);
  const poseFor=p=>{if(world.has(p.id))return world.get(p.id);const par=p.parent?poseFor(this.parts.get(p.parent)):null,track=tracks.get(p.id),v=track?interpolate(track.keyframes,time):{},m={x:v.x||0,y:v.y||0,r:(v.rotation_deg||0)*Math.PI/180,sx:v.scale_x===undefined?1:v.scale_x,sy:v.scale_y===undefined?1:v.scale_y,a:v.opacity===undefined?1:v.opacity};if(par){const lx=m.x*par.sx,ly=m.y*par.sy,cs=Math.cos(par.r),sn=Math.sin(par.r);m.x=par.x+lx*cs-ly*sn;m.y=par.y+lx*sn+ly*cs;m.r+=par.r;m.sx*=par.sx;m.sy*=par.sy;m.a*=par.a;}world.set(p.id,m);return m;};
  for(const p of this.ordered){if(p.visible===false)continue;const img=this.images.get(p.id);if(!img)continue;const m=poseFor(p),width=p.width||img.naturalWidth,height=p.height||img.naturalHeight,pivot=p.pivot||[.5,.5];c.save();c.translate(m.x,m.y);c.rotate(m.r);c.scale(m.sx,m.sy);c.globalAlpha=clamp(m.a,0,1);c.drawImage(img,-pivot[0]*width,-pivot[1]*height,width,height);c.restore();}
  c.restore();
 }
 destroy(){this.destroyed=true;this.paused=true;if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;this.images.clear();}
}
root.TowerboundRigPlayer={version:1,create:(canvas,rig,options)=>new RigPlayer(canvas,rig,options),validate,interpolate,RigPlayer};
})(typeof window!=='undefined'?window:globalThis);
