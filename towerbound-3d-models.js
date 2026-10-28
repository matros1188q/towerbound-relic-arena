/* TOWERBOUND 3D MODEL LAYER V1 — CC0 GLB assets, Three.js */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';
(()=>{
'use strict';
const mount=document.getElementById('phaser-arena');
if(!mount)return;
const urls={
 ranger:'https://cdn.3dassets.dev/assets/32788/v1/model.glb',
 mage:'https://cdn.3dassets.dev/assets/32787/v1/model.glb',
 goblin:'https://cdn.3dassets.dev/assets/32793/v1/model.glb',
 skeleton:'https://cdn.3dassets.dev/assets/32794/v1/model.glb',
 rat:'https://cdn.3dassets.dev/assets/32795/v1/model.glb',
 wolf:'https://cdn.3dassets.dev/assets/32796/v1/model.glb',
 stalker:'https://cdn.3dassets.dev/assets/32708/v1/model.glb',
 spider:'https://cdn.3dassets.dev/assets/21644/v1/model.glb',
 golem:'https://cdn.3dassets.dev/assets/106/v1/model.glb',
 minotaur:'https://cdn.3dassets.dev/assets/21397/v1/model.glb'
};
const roster=[
'goblin','skeleton','wolf','golem','skeleton','mage','goblin','stalker','skeleton','stalker',
'stalker','spider','mage','minotaur','skeleton','mage','golem','stalker','goblin','golem'
];
const loader=new GLTFLoader(),cache=new Map(),activeMixers=[];
let renderer,scene,camera,heroRoot,enemyRoot,heroMixer,enemyMixer,raf=0,ready=false,failed=false;
const clock=new THREE.Clock();
const host=document.createElement('div');
host.className='tb-three-host';
host.setAttribute('aria-hidden','true');
host.style.cssText='position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .35s;';
mount.appendChild(host);
function load(key){
 if(cache.has(key))return cache.get(key);
 const p=new Promise((resolve,reject)=>loader.load(urls[key],g=>resolve(g),undefined,e=>reject(e)));
 cache.set(key,p);return p;
}
function makeRenderer(){
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 renderer.setSize(host.clientWidth||700,host.clientHeight||300,false);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.25;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.domElement.style.cssText='display:block;width:100%;height:100%;';
 host.appendChild(renderer.domElement);
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(32,1,.1,100);
 camera.position.set(0,2.55,8.6);camera.lookAt(0,1.02,0);
 scene.add(new THREE.HemisphereLight(0xc9dcff,0x251525,2.15));
 const key=new THREE.DirectionalLight(0xffdfad,3.3);key.position.set(-3,6,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0x8b83ff,2.1);rim.position.set(3,4,-4);scene.add(rim);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(3.2,48),new THREE.MeshStandardMaterial({color:0x29233c,roughness:.86,metalness:.12,transparent:true,opacity:.64}));
 floor.rotation.x=-Math.PI/2;floor.position.y=.015;floor.position.z=0;scene.add(floor);
 for(const x of [-1.35,1.35]){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.58,.018,8,48),new THREE.MeshBasicMaterial({color:x<0?0x79dce9:0xe56b8d,transparent:true,opacity:.62}));
  ring.rotation.x=Math.PI/2;ring.position.set(x,.035,0);scene.add(ring);
 }
 const resize=()=>{
  if(!renderer)return;const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 };
 new ResizeObserver(resize).observe(host);resize();
}
function prepareModel(gltf,key,side,variant=0){
 const root=gltf.scene.clone(true);
 const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3()),height=Math.max(size.y,.1);
 const target=key==='spider'?.78:key==='rat'?1.05:key==='goblin'?1.55:key==='wolf'?1.25:key==='golem'?1.9:key==='minotaur'?2.25:key==='stalker'?1.95:1.8;
 root.scale.setScalar(target/height);
 root.position.y=-box.min.y*(target/height);
 root.position.x=side<0?-1.38:1.35;
 root.position.z=side<0?.05:-.05;
 root.rotation.y=side<0?Math.PI/2:-Math.PI/2;
 root.traverse(o=>{
  if(o.isMesh){o.castShadow=true;o.receiveShadow=true;
   if(Array.isArray(o.material))o.material=o.material.map(m=>m.clone());else o.material=o.material.clone();
   const mats=Array.isArray(o.material)?o.material:[o.material];
   mats.forEach(m=>{if(m.color&&variant){const tint=new THREE.Color().setHSL(((variant*0.137)%1),.12,.96);m.color.multiply(tint);}if('roughness' in m)m.roughness=Math.max(.42,m.roughness||.6);});
  }
 });
 scene.add(root);
 let mixer=null;
 if(gltf.animations&&gltf.animations.length){mixer=new THREE.AnimationMixer(root);const clip=gltf.animations.find(a=>/idle/i.test(a.name))||gltf.animations[0];mixer.clipAction(clip).play();}
 return {root,mixer};
}
function clearActor(old,mixer){if(mixer)mixer.stopAllAction();if(old)scene.remove(old);}
async function setEnemy(wave,boss=false){
 const idx=Math.max(0,(wave*7+3)%20),key=boss?(wave>=10?'minotaur':'stalker'):roster[idx];
 try{
  const gltf=await load(key);if(!scene)return;
  clearActor(enemyRoot,enemyMixer);
  const made=prepareModel(gltf,key,1,idx);
  enemyRoot=made.root;enemyMixer=made.mixer;
  if(boss){enemyRoot.scale.multiplyScalar(1.23);enemyRoot.position.y*=1.23;enemyRoot.traverse(o=>{if(o.isMesh){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if(m.emissive){m.emissive.set(0x4a1238);m.emissiveIntensity=.32;}});}});}
  if(!ready&&heroRoot){ready=true;host.style.opacity='1';const fallback=mount.querySelector('.tb-visible-actors');if(fallback)fallback.style.opacity='0';}
 }catch(e){console.warn('Towerbound 3D enemy model failed:',key,e);}
}
async function init(){
 try{
  makeRenderer();
  const [hero]=await Promise.all([load('ranger')]);
  const made=prepareModel(hero,'ranger',-1,0);heroRoot=made.root;heroMixer=made.mixer;
  await setEnemy(1,false);
  const animate=()=>{
   raf=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
   if(heroMixer)heroMixer.update(dt);if(enemyMixer)enemyMixer.update(dt);
   const t=performance.now()*.001;
   if(heroRoot){heroRoot.position.y=.025+Math.sin(t*2.1)*.035;heroRoot.rotation.z=Math.sin(t*1.4)*.025;}
   if(enemyRoot){enemyRoot.position.y=.02+Math.sin(t*2.8+.7)*.045;enemyRoot.rotation.z=Math.sin(t*1.8+.9)*.035;}
   renderer.render(scene,camera);
  };
  animate();
 }catch(e){failed=true;console.warn('Towerbound 3D layer unavailable; illustrated fallback retained.',e);}
}
window.TowerModels={
 wave:(wave,boss)=>{if(!failed&&scene)setEnemy(wave,boss);},
 hit:(critical=false,boss=false)=>{if(heroRoot){heroRoot.rotation.z=critical?-.12:-.07;setTimeout(()=>{if(heroRoot)heroRoot.rotation.z=0},130);}if(enemyRoot){enemyRoot.position.x=1.35+.16;setTimeout(()=>{if(enemyRoot)enemyRoot.position.x=1.35},100);}},
 destroy:()=>{if(raf)cancelAnimationFrame(raf);if(renderer)renderer.dispose();}
};
init();
})();