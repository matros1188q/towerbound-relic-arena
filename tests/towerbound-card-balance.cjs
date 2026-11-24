'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const root=process.cwd();
const configDir=path.join(root,'configs/balance');
const balance=Object.fromEntries(fs.readdirSync(configDir).filter(name=>name.endsWith('.json')).map(name=>[name.slice(0,-5),JSON.parse(fs.readFileSync(path.join(configDir,name),'utf8'))]));
const classIds=['assassin','bishop','dragonkin','destroyer','elemental','duelist','shaman'];
const builds=classIds.flatMap(classId=>(balance.classes.classes[classId].branches||[]).map(branch=>({classId,branchId:branch.id,className:balance.classes.classes[classId].name,branchName:branch.name})));
const seeds=[11,29,47],startLevel=Math.max(1,Math.min(100,Number(process.env.TB_BALANCE_START_LEVEL)||10)),allRuns=builds.flatMap(build=>seeds.map(seed=>({...build,seed})));
const limit=Math.max(1,Math.min(allRuns.length,Number(process.env.TB_BALANCE_RUN_LIMIT)||allRuns.length)),selectedRuns=allRuns.slice(0,limit);
const artifacts=path.join(root,'artifacts','towerbound-card-balance');fs.mkdirSync(artifacts,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.json':'application/json; charset=utf-8','.woff2':'font/woff2'};
let serverPort;
function startServer(){const server=http.createServer((req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1'),relative=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1)),file=path.resolve(root,relative);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end('Forbidden');return;}fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);});}catch{res.writeHead(400).end('Bad request');}});return new Promise(resolve=>server.listen(0,'127.0.0.1',()=>{serverPort=server.address().port;resolve(server);}));}
async function runAttempt(browser,build,seed,index,startLevel){
 const context=await browser.newContext({viewport:{width:1280,height:900},colorScheme:'dark',reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),pageErrors=[];
 page.on('pageerror',error=>pageErrors.push(error.message));
 await page.route('https://cdn.jsdelivr.net/**',route=>route.request().url().includes('/npm/@supabase/supabase-js@2')?route.fulfill({status:200,contentType:'application/javascript',body:'/* isolated balance QA adapter */'}):route.abort());
 await page.route('https://fonts.googleapis.com/**',route=>route.abort());await page.route('https://fonts.gstatic.com/**',route=>route.abort());
 await page.addInitScript(seedValue=>{
  let state=(Number(seedValue)||1)>>>0;
  Math.random=()=>{state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
  window.__TB_BALANCE_TEST_MODE=true;window.__TB_BALANCE_SYNC_TURNS=true;
  let uuidCounter=0;const uuidPrefix=(Number(seedValue)||1).toString(16).padStart(8,'0').slice(-8);
  try{Object.defineProperty(crypto,'randomUUID',{configurable:true,value:()=>uuidPrefix+'-0000-4000-8000-'+(++uuidCounter).toString(16).padStart(12,'0')});}catch{}
  const session={user:{id:'towerbound-balance-qa',email:'balance-qa@example.test'}};localStorage.setItem('__tb_qa_auth_session',JSON.stringify(session));
  const adapter={createClient:()=>{let listener=null;const readSession=()=>{try{return JSON.parse(localStorage.getItem('__tb_qa_auth_session')||'null');}catch{return null;}};
   return{__tbQaStub:true,auth:{onAuthStateChange:cb=>{listener=cb;return{data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session:readSession()},error:null}),signInWithPassword:async()=>({data:{session:readSession()},error:null}),signUp:async()=>({data:{session:readSession()},error:null}),signOut:async()=>{localStorage.removeItem('__tb_qa_auth_session');if(listener)listener('SIGNED_OUT',null);return{error:null};}},
   from:()=>{const q={select(){return this;},eq(){return this;},neq(){return this;},gte(){return this;},lte(){return this;},gt(){return this;},order(){return this;},limit:async()=>({data:[],error:null}),maybeSingle:async()=>({data:null,error:null}),single:async()=>({data:null,error:null}),upsert:async()=>({data:null,error:null}),insert:async()=>({data:null,error:null}),update(){return this;},delete(){return this;}};return q;},rpc:async()=>({data:{revision:1},error:null})};}};
  Object.defineProperty(window,'supabase',{configurable:false,enumerable:true,writable:false,value:adapter});
 },seed);
 try{
  await page.goto('http://127.0.0.1:'+serverPort+'/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.TowerboundReworkReady&&!!window.TowerboundRework&&!!window.TowerboundBalanceQA,{timeout:30000});
  const result=await page.evaluate(({classId,branchId,seedValue,attemptIndex,startLevel})=>{
   const qa=window.TowerboundBalanceQA;qa.createCharacter('QA'+String(attemptIndex).padStart(2,'0'),classId);
   const prepared=qa.prepareSpecialization(branchId,startLevel);if(prepared.branch!==branchId||prepared.level<startLevel)throw new Error('Specialization preparation failed: '+JSON.stringify(prepared));
   const stageLogs=[];let branchChosen=true,totalTurns=0,totalCards=0,totalDamage=0,totalDamageTaken=0,totalHealing=0,reason='stage-limit',lastStage=0;
   const hpNow=()=>Number(qa.snapshot().character?.run?.playerHp)||0,maxHp=()=>Number(qa.snapshot().character?qa.engine().maxHp(qa.snapshot().character):1)||1;
   const trackHp=before=>{const after=hpNow();if(after<before)totalDamageTaken+=before-after;else if(after>before)totalHealing+=after-before;};
   const pickTarget=b=>{const living=(b.enemies||[]).filter(enemy=>enemy.alive&&Number(enemy.hp)>0),weight=e=>e.type==='boss'?110:e.type==='elite'?100:e.role==='saboteur'?95:e.role==='poison'?90:e.role==='healer'?85:e.role==='bleed'?75:e.role==='normal'?50:e.role==='tank'?30:40;return living.sort((a,b)=>weight(b)-weight(a)||(a.hp/Math.max(1,a.maxHp))-(b.hp/Math.max(1,b.maxHp)))[0]||null;};
   const scoreCard=(card,b,c)=>{
    const e=card.effects||{},cost=(card.isXCost||card.costX)?Number(c.currentEnergy)||0:Math.max(0,Number(card.cost)||0);
    if(cost>(Number(c.currentEnergy)||0)||e.unplayable||card.type==='curse'||card.type==='status')return -1;
    const alive=(b.enemies||[]).filter(x=>x.alive&&x.hp>0).length,damage=(Math.max(0,Number(e.damage)||0)*Math.max(1,Number(e.hits)||1))+(Math.max(0,Number(e.damageAll)||0)*Math.max(1,alive))+(Math.max(0,Number(e.damagePerEnergy)||0)*cost);
    const dots=(Number(e.poison)||0)*4+(Number(e.bleed)||0)*3.5+(Number(e.burn)||0)*3+(Number(e.conditionalBleed)||0)*2,hpRatio=Number(c.run.playerHp)/Math.max(1,qa.engine().maxHp(c)),block=Math.max(0,Number(e.block)||0)*(hpRatio<.35?3.2:hpRatio<.65?2.1:1.0);
    const heal=Math.max(0,Number(e.heal)||0)*2.2,utility=Math.max(0,Number(e.draw)||0)*5+Math.max(0,Number(e.energy)||0)*6+Math.max(0,Number(e.fury)||0)*3+Math.max(0,Number(e.spellPower)||0)*2+Math.max(0,Number(e.nextAttackDamage)||0)*1.5;
    const target=(b.enemies||[]).find(x=>x.index===b.targetIndex),lethal=target&&damage>=Number(target.hp)?9:0,intent=(b.enemies||[]).some(x=>x.alive&&(x.intent?.type==='attack'||x.pendingAttack)),defenseValue=intent?block:Math.min(block,2);
    return(damage+dots+defenseValue+heal+utility+lethal)/(Math.max(.5,cost)+.35)+(cost===0?1.5:0);
   };
   for(let stage=1;stage<=250;stage++){
    let snap=qa.snapshot(),character=snap.character;if(!character){reason='character-missing';break;}
    if(character.branch!==branchId)throw new Error('Specialization changed unexpectedly before floor '+stage);qa.allocateTalents();
    const stageStartHp=hpNow(),event=qa.resolveMapEvent(stage);snap=qa.snapshot();
    if(event?.cleared&&!snap.battle){
     if(snap.character.branch!==branchId)throw new Error('Specialization missing after floor '+stage);qa.allocateTalents();
     qa.claimBestRelic();if(stage%50===0)qa.useCampRest(stage);
     stageLogs.push({stage,level:snap.character.level,branch:snap.character.branch,hpStart:stageStartHp,hpEnd:snap.character.run.playerHp,maxHp:qa.engine().maxHp(snap.character),turns:0,cards:0,damageDealt:0,enemies:[],event:event.type,eventChoice:event.choice,cleared:true});
     qa.clearPostBattle();if(stage===250){reason='cleared-250';break;}continue;
    }
    if(!snap.battle)qa.startStage(stage);snap=qa.snapshot();if(!snap.battle){reason=snap.screen==='death'?'death':'stage-did-not-start';lastStage=stage;break;}
    const stageEnemies=(snap.battle.enemies||[]).map(enemy=>({role:enemy.role,type:enemy.type,hp:enemy.maxHp||enemy.hp,name:enemy.name}));
    let stageTurns=0,stageCards=0,stageDamage=0,stageReason='clear';const stageMaxTurns=80;
    while(true){
     snap=qa.snapshot();if(!snap.battle)break;if(snap.screen==='death'||snap.character.run.playerHp<=0){stageReason='death';break;}
     let b=snap.battle,c=snap.character;if(b.actor?.type!=='player'){stageReason='enemy-turn-stalled';break;}
     const target=pickTarget(b);if(target&&target.index!==b.targetIndex)qa.setTarget(target.index);
     let beforeHp=hpNow();if(beforeHp<qa.engine().maxHp(c)*.65&&!b.potionUsedThisTurn)qa.usePotion();trackHp(beforeHp);
     snap=qa.snapshot();if(!snap.battle)break;
     const abilityEnemyHp=(snap.battle.enemies||[]).reduce((sum,x)=>sum+(x.alive?x.hp:0),0),abilityHpBefore=hpNow();
     if(qa.canUltimate())qa.useUltimate();
     else{const incoming=(snap.battle.enemies||[]).reduce((sum,x)=>sum+(x.alive?Number(x.intent?.damage)||0:0),0);if(incoming>0&&qa.canCounter())qa.useCounter();else if(qa.canBasicAttack())qa.basicAttack();}
     trackHp(abilityHpBefore);snap=qa.snapshot();
     const abilityEnemyAfter=(snap.battle?.enemies||[]).reduce((sum,x)=>sum+(x.alive?x.hp:0),0),abilityDamage=Math.max(0,abilityEnemyHp-abilityEnemyAfter);totalDamage+=abilityDamage;stageDamage+=abilityDamage;
     if(!snap.battle)break;b=snap.battle;c=snap.character;
     // Real turn: use available class action, then resolve cards and enemy turns.
     for(let n=0;n<20;n++){
      snap=qa.snapshot();if(!snap.battle||snap.battle.actor?.type!=='player')break;
      const currentTarget=pickTarget(snap.battle);if(currentTarget&&currentTarget.index!==snap.battle.targetIndex)qa.setTarget(currentTarget.index);
      const current=qa.snapshot(),cards=current.character.hand||[];let best=-1,bestScore=0;
      for(let i=0;i<cards.length;i++){const value=scoreCard(cards[i],current.battle,current.character);if(value>bestScore){bestScore=value;best=i;}}
      if(best<0)break;
      const enemyHpBefore=(current.battle.enemies||[]).reduce((sum,x)=>sum+(x.alive?x.hp:0),0),hpBefore=hpNow();qa.playCard(best);trackHp(hpBefore);
      const after=qa.snapshot(),enemyHpAfter=(after.battle?.enemies||[]).reduce((sum,x)=>sum+(x.alive?x.hp:0),0),dealt=Math.max(0,enemyHpBefore-enemyHpAfter);totalDamage+=dealt;stageDamage+=dealt;totalCards++;stageCards++;
      if(!after.battle||after.screen==='death')break;
     }
     snap=qa.snapshot();if(!snap.battle||snap.screen==='death')break;
     if(snap.battle.actor?.type==='player'){beforeHp=hpNow();qa.endTurn();trackHp(beforeHp);stageTurns++;totalTurns++;}
     if(stageTurns>=stageMaxTurns){stageReason='turn-limit';break;}
    }
    snap=qa.snapshot();lastStage=stage;const cleared=Number(snap.character?.progress?.highestEver||0)>=stage,died=snap.screen==='death'||Number(snap.character?.run?.playerHp||0)<=0;
    if(cleared){
     if(!branchChosen&&snap.character.level>=10&&!snap.character.branch){qa.chooseBranch(branchId);branchChosen=true;}if(snap.character.branch===branchId)qa.allocateTalents();
     qa.claimBestRelic();if(stage%50===0)qa.useCampRest(stage);
     stageLogs.push({stage,level:snap.character.level,branch:snap.character.branch,hpStart:stageStartHp,hpEnd:snap.character.run.playerHp,maxHp:qa.engine().maxHp(snap.character),turns:stageTurns,cards:stageCards,damageDealt:stageDamage,enemies:stageEnemies,cleared:true});
     qa.clearPostBattle();if(stage===250){reason='cleared-250';break;}
    }else{
     reason=died?'death':stageReason==='clear'?'stage-not-cleared':stageReason;
     stageLogs.push({stage,level:snap.character?.level,branch:snap.character?.branch,hpStart:stageStartHp,hpEnd:snap.character?.run?.playerHp,turns:stageTurns,cards:stageCards,damageDealt:stageDamage,enemies:stageEnemies,cleared:false,reason});
     if(died){const recovery=qa.confirmDeath();deathStages.push({stage,checkpointRestored:!!recovery?.checkpointRestored,checkpointStage:recovery?.checkpointStage||null,livesRemaining:recovery?.livesRemaining??null});if(recovery?.checkpointRestored){checkpointRestores++;stage=Number(recovery.checkpointStage)-1;reason='checkpoint-recovery';continue;}}
     break;
    }
   }
   const final=qa.snapshot(),c=final.character;
   return{classId,branchId,seed:seedValue,cleared:Number(c?.progress?.highestEver)||0,completed:reason==='cleared-250',reason,deathStage:reason==='death'?lastStage:null,deathStages,checkpointRestores,level:c?.level||1,branchChosen:c?.branch===branchId,branch:c?.branch||null,talentRanks:c?.talents||{},maxHp:qa.engine().maxHp(c),hp:c?.run?.playerHp||0,totalTurns,totalCards,totalDamage,totalDamageTaken,totalHealing,kills:c?.stats?.kills||0,itemsFound:c?.stats?.items_found||0,gear:(c?.gear||[]).filter(Boolean).length,relics:(c?.relics||[]).length,stageLogs};
  },{classId:build.classId,branchId:build.branchId,seedValue:seed,attemptIndex:index+1,startLevel});
  if(pageErrors.length)result.pageErrors=pageErrors;return result;
 }finally{await context.close();}
}
let server,browser;
(async()=>{
 server=await startServer();browser=await chromium.launch({headless:true});const results=[];
 try{for(let i=0;i<selectedRuns.length;i++){const build=selectedRuns[i];process.stdout.write('['+(i+1)+'/'+selectedRuns.length+'] '+build.className+' / '+build.branchName+' / seed '+build.seed+' ... ');const result=await runAttempt(browser,build,build.seed,i,startLevel);results.push(result);process.stdout.write((result.completed?'250 этажей':'этаж '+result.cleared+' · '+result.reason)+' · '+result.totalTurns+' ходов · '+result.totalCards+' карт\n');fs.writeFileSync(path.join(artifacts,'runs.json'),JSON.stringify(results,null,2));}}
 finally{await browser.close();server.close();}
 const grouped=builds.map(build=>{const runs=results.filter(run=>run.classId===build.classId&&run.branchId===build.branchId);return{classId:build.classId,className:build.className,branchId:build.branchId,branchName:build.branchName,runs:runs.length,clears:runs.filter(run=>run.completed).length,failed:runs.filter(run=>!run.completed).length,averageFloor:runs.length?Number((runs.reduce((sum,run)=>sum+run.cleared,0)/runs.length).toFixed(1)):null,averageTurns:runs.length?Number((runs.reduce((sum,run)=>sum+run.totalTurns,0)/runs.length).toFixed(1)):null,averageDamageTaken:runs.length?Number((runs.reduce((sum,run)=>sum+run.totalDamageTaken,0)/runs.length).toFixed(1)):null,deathFloors:runs.flatMap(run=>(run.deathStages||[]).map(death=>death.stage)).concat(runs.map(run=>run.deathStage).filter(Boolean))};});
 const summary={test:'towerbound-real-card-combat-balance',model:'current browser runtime: resolveCardPlay, endPlayerTurn, enemyTurn, runEnemyTurnQueue, finishCurrentEnemy and rpg-rework-v2 progression/rewards',startingLevel:startLevel,startingFloor:1,targetFloor:250,plannedRuns:allRuns.length,executedRuns:results.length,complete:results.length===allRuns.length,branchCoverage:results.filter(run=>run.branchChosen&&run.branch===run.branchId).length,branchCoverageMisses:results.filter(run=>!run.branchChosen||run.branch!==run.branchId).map(run=>({classId:run.classId,branchId:run.branchId,cleared:run.cleared,reason:run.reason})),completedRuns:results.filter(run=>run.completed).length,failedRuns:results.filter(run=>!run.completed).length,classes:classIds.length,specializations:builds.length,seedsPerSpecialization:seeds.length,startLevel,branchCoverage:results.filter(run=>run.branchChosen&&run.branch===run.branchId).length,branchCoverageMisses:results.filter(run=>!run.branchChosen||run.branch!==run.branchId).map(run=>({classId:run.classId,branchId:run.branchId,cleared:run.cleared,reason:run.reason})),checkpointRestores:results.reduce((sum,run)=>sum+(run.checkpointRestores||0),0),results:grouped,environment:{difficulty:balance.difficulty.default,startingLevel:startLevel,route:'standard with natural elite chance',gear:'only engine drops and auto-equips; no injected equipment',rewards:'engine loot and deterministic best-relic choice',talents:'branch talents allocated attack/health/defense/card-draw/critical priority',mapEvents:'live event tables and choice handlers; altar/card, chest/relic-or-gold, and wanderer/healing choices are resolved through the game UI handlers',runModifier:'best of the three actual offers selected by a fixed combat-value score'}};
 fs.writeFileSync(path.join(artifacts,'summary.json'),JSON.stringify(summary,null,2));
 const report=['# Towerbound · real card-combat balance','','- Runs: '+results.length+'/'+allRuns.length+' · start level '+startLevel+' · floor 1','- Cleared floor 250: '+summary.completedRuns,'- Failed: '+summary.failedRuns,'- Branch unlocked: '+summary.branchCoverage+'/'+results.length,'- Checkpoint recoveries: '+summary.checkpointRestores,'- Start level: '+startLevel,'','| Class | Branch | Runs | Cleared 250 | Avg. floor | Avg. turns | Avg. damage taken | Death floors |','|---|---|---:|---:|---:|---:|---:|---|',...grouped.map(x=>'| '+x.className+' | '+x.branchName+' | '+x.runs+' | '+x.clears+' | '+(x.averageFloor??'—')+' | '+(x.averageTurns??'—')+' | '+(x.averageDamageTaken??'—')+' | '+(x.deathFloors.join(', ')||'—')+' |'),'','## Method','','- Uses current card resolution, hand/energy/discard, class effects, enemy turns and roles, boss phases, progression, loot and equipment drops.',
  '- Controlled specialization comparison: each character is advanced through the real XP curve to level '+startLevel+', then the requested branch is selected and its available talents are spent before floor 1.','- No pre-equipped gear or artificial stat boosts.','- Each attempt starts with a fresh isolated account and character.','- Map-event choices use deterministic game handlers.','- See runs.json for per-floor logs and each attempt.'];
 fs.writeFileSync(path.join(artifacts,'report.md'),report.join('\n'));
 process.stdout.write('\n'+JSON.stringify(summary,null,2)+'\n');
 assert.equal(results.length,selectedRuns.length,'all selected class/branch/seed attempts must execute');
 assert.ok(results.every(run=>run.branchChosen&&run.branch===run.branchId),'each run must test its requested specialization');
 assert.ok(results.every(run=>run.totalCards>0),'each run must resolve actual cards, not only active skills');
 assert.ok(results.every(run=>run.totalTurns>0),'each run must execute enemy turns, not only scripted kills');
})().catch(error=>{console.error(error);process.exitCode=1;});
