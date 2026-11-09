/* Towerbound online services: leaderboard and asynchronous player ghosts.
 * All writes are constrained by Supabase RLS to the signed-in user's own auth UUID.
 */
(()=>{'use strict';
if(window.__TOWERBOUND_ONLINE_V1__)return;window.__TOWERBOUND_ONLINE_V1__=true;
const api=()=>window.TowerboundCloud;
const context=()=>{const a=api();return a&&a.client&&a.session?{client:a.client,user:a.session.user}:null;};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
let publishTimer=0,publishing=false,lastPublished='';
function activeCharacter(engine){return engine?.state?.characters?.find(c=>c.id===engine.state.activeCharacterId)||engine?.state?.characters?.[0]||null;}
function className(engine,c){return engine?.balance?.classes?.classes?.[c?.classId]?.name||c?.classId||'Герой';}
async function publishCurrent(){
 const ctx=context(),engine=window.TowerboundRework,c=activeCharacter(engine);
 if(!ctx||!engine||!c||publishing)return{skipped:true};
 const bp=Math.round(engine.combatPower(c)),maxStage=clamp(c.progress?.highestEver,0,250);
 const stats=engine.getCombatStats(c),snapshot={
  user_id:ctx.user.id,nickname:String(c.name||'Герой').trim().slice(0,24)||'Герой',
  class:String(c.classId||'unknown').slice(0,40),level:clamp(c.level,1,100),
  battle_power:clamp(bp,0,2147483647),max_stage:maxStage,
  max_hp:clamp(stats.maxHp||engine.maxHp(c),1,2147483647),
  attack:clamp(stats.attack,0,2147483647),defense:clamp(stats.defense,0,2147483647),
  build:{
   skillLoadout:Array.isArray(c.skillLoadout)?c.skillLoadout.slice(0,4):[],
   talents:c.talents&&typeof c.talents==='object'?c.talents:{},
   branch:c.branch||null,gear:Array.isArray(c.gear)?c.gear.slice(0,8):[],
   updatedAt:new Date().toISOString()
  },updated_at:new Date().toISOString(),
  expires_at:new Date(Date.now()+7*86400000).toISOString()
 };
 const fingerprint=JSON.stringify({...snapshot,updated_at:undefined,expires_at:undefined});if(fingerprint===lastPublished)return{unchanged:true};
 publishing=true;
 try{
  const [lb,ghost]=await Promise.all([
   ctx.client.from('leaderboard').upsert({
    user_id:snapshot.user_id,nickname:snapshot.nickname,class:snapshot.class,
    battle_power:snapshot.battle_power,max_stage:snapshot.max_stage,updated_at:snapshot.updated_at
   },{onConflict:'user_id'}),
   ctx.client.from('pvp_ghosts').upsert(snapshot,{onConflict:'user_id'})
  ]);
  if(lb.error)throw lb.error;if(ghost.error)throw ghost.error;
  lastPublished=fingerprint;return{published:true,battlePower:snapshot.battle_power};
 }finally{publishing=false;}
}
function queuePublish(){clearTimeout(publishTimer);publishTimer=setTimeout(()=>publishCurrent().catch(e=>console.warn('[Towerbound online] publish failed',e)),5000);}
async function getLeaderboard(){
 const client=api()?.client;if(!client)throw new Error('Supabase не настроен');
 const {data,error}=await client.from('leaderboard').select('user_id,nickname,class,battle_power,max_stage,updated_at').order('battle_power',{ascending:false}).order('max_stage',{ascending:false}).limit(100);
 if(error)throw error;return data||[];
}
async function findGhost(myCharacter,engine){
 const ctx=context();if(!ctx)throw new Error('Для поиска реального соперника войди в аккаунт Towerbound');
 const bp=Math.round(engine.combatPower(myCharacter)),min=Math.max(0,Math.floor(bp*.85)),max=Math.ceil(bp*1.15);
 const {data,error}=await ctx.client.from('pvp_ghosts')
  .select('user_id,nickname,class,level,battle_power,max_stage,max_hp,attack,defense,build,updated_at,expires_at')
  .neq('user_id',ctx.user.id).gte('battle_power',min).lte('battle_power',max)
  .gt('expires_at',new Date().toISOString()).order('updated_at',{ascending:false}).limit(100);
 if(error)throw error;
 const candidates=(data||[]).filter(g=>g.user_id!==ctx.user.id&&g.battle_power>=bp*.85&&g.battle_power<=bp*1.15);
 if(!candidates.length)throw new Error('Пока нет реальных игроков в диапазоне ±15% боевой мощи. Попробуй позже.');
 const g=candidates[Math.floor(Math.random()*candidates.length)];
 const tier=(engine.balance.bp.tiers||[]).find(t=>g.battle_power>=t.min&&(t.max===null||g.battle_power<=t.max))||(engine.balance.bp.tiers||[])[0];
 return{
  id:g.user_id,characterId:g.user_id,online:true,bot:false,name:g.nickname,classId:g.class,
  level:g.level,bp:g.battle_power,maxStage:g.max_stage,tier:tier?.id||'rookie',
  skillLoadout:Array.isArray(g.build?.skillLoadout)?g.build.skillLoadout:[],
  talents:g.build?.talents||{},branch:g.build?.branch||null,
  gear:Array.isArray(g.build?.gear)?g.build.gear:[],
  stats:{attack:g.attack,defense:g.defense,maxHp:g.max_hp,normalized:false},
  updatedAt:g.updated_at,expiresAt:g.expires_at
 };
}
if(api()?.client)api().client.auth.onAuthStateChange(()=>{lastPublished='';setTimeout(()=>publishCurrent().catch(e=>console.warn('[Towerbound online] initial publish failed',e)),1200);});
window.TowerboundOnline={publishCurrent,queuePublish,getLeaderboard,findGhost,get signedIn(){return !!context();}};
setTimeout(()=>publishCurrent().catch(()=>{}),1800);
})();