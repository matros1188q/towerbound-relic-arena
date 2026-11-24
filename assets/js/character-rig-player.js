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
 if(!rig||!rig.canvas||!(rig.canvas.width>0&&rig.canvas.height>0))e.push('invalid canvas');
 const parts=rig&&Array.isArray(rig.parts)?rig.parts:[],ids=new Set();
 for(const p of parts){if(!p||!p.id)e.push('part requires id');else if(ids.has(p.id))e.push('duplicate part id: '+p.id);else ids.add(p.id);}
 if(!ids.has(rig&&rig.root))e.push('root part missing');
 for(const p of parts){if(!p||!p.id)continue;if(!p.image)e.push('part requires image: '+p.id);if(p.parent!==null&&!ids.has(p.parent))e.push('unknown parent: '+p.parent);if(!Array.isArray(p.pivot)||p.pivot.length!==2||p.pivot.some(v=>!Number.isFinite(v)||v<0||v>1))e.push('invalid pivot: '+p.id);if(p.width!==undefined&&!(p.width>0))e.push('invalid width: '+p.id);if(p.height!==undefined&&!(p.height>0))e.push('invalid height: '+p.id);}
 const byId=new Map(parts.filter(p=>p&&p.id).map(p=>[p.id,p]));
 for(const p of parts){const seen=new Set();let n=p;while(n&&n.parent!==null){if(seen.has(n.id)){e.push('parent cycle: '+p.id);break;}seen.add(n.id);n=byId.get(n.parent);}}
 const clipIds=new Set();for(const c of rig&&Array.isArray(rig.clips)?rig.clips:[]){if(!c||!c.id){e.push('clip requires id');continue;}if(clipIds.has(c.id))e.push('duplicate clip id: '+c.id);clipIds.add(c.id);if(!(c.duration_ms>0))e.push('invalid clip duration: '+c.id);const trackParts=new Set();for(const t of c.tracks||[]){if(!ids.has(t.part))e.push('clip targets missing part: '+t.part);if(trackParts.has(t.part))e.push('duplicate track: '+t.part);trackParts.add(t.part);if(!Array.isArray(t.keyframes)||t.keyframes.length<2)e.push('track needs keyframes: '+t.part);else{let last=-Infinity;for(const k of t.keyframes){if(!Number.isFinite(k.at_ms)||k.at_ms<last)e.push('unordered keyframes: '+t.part);last=k.at_ms;}}}const ev=new Set();for(const v of c.events||[]){if(!v.id||!Number.isFinite(v.at_ms)||v.at_ms<0||v.at_ms>c.duration_ms)e.push('invalid event in clip: '+c.id);if(ev.has(v.id))e.push('duplicate event id: '+v.id);ev.add(v.id);}}
 return [...new Set(e)];
}
class RigPlayer{
 constructor(canvas,rig,options){
  if(!canvas||!canvas.getContext)throw Error('Canvas2D canvas required');
  const errors=validate(rig);if(errors.length)throw Error('Invalid rig: '+errors.join('; '));
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.rig=rig;this.options=options||{};this.images=new Map();this.parts=new Map(rig.parts.map(p=>[p.id,p]));this.ordered=[...rig.parts].sort((a,b)=>(a.z_index||0)-(b.z_index||0));this.clip=null;this.elapsed=0;this.rate=1;this.paused=true;this.raf=0;this.destroyed=false;this.eventsFired=new Set();this.lastTime=0;this.loadPromise=this.loadImages();this.tick=this.tick.bind(this);
 }
 async loadImages(){await Promise.all(this.rig.parts.map(p=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{this.images.set(p.id,img);resolve();};img.onerror=()=>reject(Error('Unable to load '+p.image));img.src=p.image;})));this.render(0);return this;}
 play(name,options){const c=this.rig.clips.find(x=>x.id===name);if(!c)throw Error('Unknown clip '+name);this.clip=c;this.elapsed=0;this.eventsFired.clear();this.rate=options&&options.rate>0?options.rate:1;this.reducedMotion=!!(options&&options.reducedMotion!==undefined?options.reducedMotion:this.options.reducedMotion);this.paused=false;this.lastTime=0;if(!this.raf)this.raf=requestAnimationFrame(this.tick);return this;}
 pause(){this.paused=true;return this;} resume(){if(this.clip&&!this.destroyed){this.paused=false;this.lastTime=0;if(!this.raf)this.raf=requestAnimationFrame(this.tick);}return this;}
 stop(){this.paused=true;this.elapsed=0;this.render(0);return this;}
 tick(now){this.raf=0;if(this.destroyed)return;if(!this.paused&&this.clip){const previous=this.elapsed;if(this.reducedMotion){this.elapsed=this.clip.duration_ms;this.paused=true;}else if(this.lastTime)this.elapsed+=(now-this.lastTime)*this.rate;this.lastTime=now;const d=this.clip.duration_ms;if(this.elapsed>=d){if(this.clip.loop&&!this.reducedMotion)this.elapsed%=d;else{this.elapsed=d;this.paused=true;}}const emit=(e)=>{if(this.options.onEvent)this.options.onEvent(e,this);};if(this.reducedMotion){(this.clip.events||[]).filter(e=>e.at_ms===0).forEach(emit);}else if(this.elapsed<previous){(this.clip.events||[]).filter(e=>e.at_ms>previous||e.at_ms<=this.elapsed).forEach(emit);}else{(this.clip.events||[]).filter(e=>(e.at_ms>previous||(previous===0&&e.at_ms===0))&&e.at_ms<=this.elapsed).forEach(emit);}this.render(this.elapsed);if(this.paused&&this.options.onComplete)this.options.onComplete(this.clip,this);}if(!this.paused)this.raf=requestAnimationFrame(this.tick);}
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
