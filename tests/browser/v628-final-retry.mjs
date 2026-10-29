// A previously earned campaign grants access. Only the initial arena position
// is a fixture; retries and the return walk use production keyboard controls.
// No health, XP, boss life, seals, keepsakes or victory are injected.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const dir='test-results/v628',server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 await fs.mkdir(dir,{recursive:true});
 const storage=JSON.parse(await fs.readFile(process.env.OHANA_EARNED_STORAGE||'test-results/v600/earned-campaign-storage.json','utf8'));
 for(const origin of storage.origins)origin.origin='http://127.0.0.1:'+server.address().port;
 const reports=[],errors=[];
 for(const [width,height]of[[1280,900],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},storageState:storage,hasTouch:width<500,isMobile:width<500});
  await context.addInitScript(()=>{
   window.__retryBossPaint=[];window.__retryDeaths=[];
   const paint=CanvasRenderingContext2D.prototype.fillText;
   CanvasRenderingContext2D.prototype.fillText=function(text,...args){
    if(this.canvas.id==='game'&&String(text).startsWith('QUIMERA OHANA · FASE'))window.__retryBossPaint.push(String(text));
    return paint.call(this,text,...args);
   };
   addEventListener('ohana-death',event=>window.__retryDeaths.push({...event.detail}));
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const date=new Date('2026-10-29T03:00:00Z');await page.clock.install({time:date});await page.clock.pauseAt(new Date(+date+1000));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');await page.keyboard.press('Escape');
  await page.evaluate(()=>{localStorage.removeItem('ohana-resume');const e=window.__OHANA_E2E;e.startWorld1('kilo');e.manualClock(true);e.loadRoom('w1-final');e.setPlayer(7300,1000);e.step(5);});
  const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
  const tick=async frames=>{await page.evaluate(n=>window.__OHANA_E2E.step(n),frames);await page.clock.runFor(16);return state();};
  const keepsakes=()=>page.evaluate(async()=>(await import('/systems/keepsakes.js')).readKeepsakes());
  async function films(){
   for(let i=0;i<20;i++){
    const s=await state();if(!s.world1Cine&&!s.pendingWorld1Cine)break;
    await page.keyboard.press('Enter');await tick(100);
   }
   await page.locator('#game').focus();
  }
  await films();let before=await tick(3);const savedKeepsakes=await keepsakes();
  assert.equal(before.roomId,'w1-final');assert.equal(before.world1Seals.length,10);assert.equal(savedKeepsakes.length,10);assert.ok(before.boss?.hp>0);
  assert.match(await page.locator('#world1-quimera-a11y').innerText(),/Quimera Ohana.*Fase 1/);
  await page.evaluate(()=>{window.__retryBossPaint=[];});await page.keyboard.press('r');let retried=await tick(30);
  assert.equal(retried.roomId,'w1-final');assert.equal(retried.boss,null);assert.ok(retried.player.x<6000,'retry returns before the arena');
  assert.deepEqual(retried.world1Seals,before.world1Seals);assert.deepEqual(await keepsakes(),savedKeepsakes);assert.equal(retried.evo,before.evo);assert.equal(retried.xp,before.xp);
  assert.equal(retried.runtimeFaults,0);assert.equal(await page.locator('#world1-quimera-a11y').innerText(),'');
  assert.deepEqual(await page.evaluate(()=>window.__retryBossPaint),[],'the old boss HUD cannot survive its room reload');
  await page.screenshot({path:`${dir}/retry-no-ghost-${width}.png`});
  const from=retried.player.x;await page.keyboard.down('d');let fresh=retried,walkFrames=0;
  for(let i=0;i<150&&!fresh.boss;i++){fresh=await tick(30);walkFrames+=30;assert.equal(fresh.runtimeFaults,0);}
  await page.keyboard.up('d');assert.ok(fresh.boss,'normal movement re-enters the final arena');assert.ok(fresh.player.x>from+1000);
  await films();fresh=await tick(3);assert.equal(fresh.boss.phase,1);assert.equal(fresh.boss.hp,fresh.boss.max);
  assert.deepEqual(fresh.world1Seals,before.world1Seals);assert.deepEqual(await keepsakes(),savedKeepsakes);
  assert.match(await page.locator('#world1-quimera-a11y').innerText(),/Quimera Ohana.*Fase 1/);
  await page.evaluate(()=>{window.__retryBossPaint=[];});await tick(3);assert.ok((await page.evaluate(()=>window.__retryBossPaint)).length>0,'fresh boss owns a new visible HUD');
  await page.screenshot({path:`${dir}/retry-fresh-fight-${width}.png`});
  let naturalDeath=null;
  if(width===1280&&process.env.OHANA_RETRY_DEATH!=='0'){
   let s=fresh,minHp=s.hp,restarted=false,frames=0;
   for(let i=0;i<240;i++){
    const deaths=await page.evaluate(()=>window.__retryDeaths.length);
    if(deaths&&s.hp>0){restarted=true;break;}
    if(s.boss){
     const target=s.boss.x+s.boss.w*.45,dx=target-s.player.x-s.player.w/2;
     if(dx>15){await page.keyboard.up('a');await page.keyboard.down('d');}
     else if(dx<-15){await page.keyboard.up('d');await page.keyboard.down('a');}
     else{await page.keyboard.up('d');await page.keyboard.up('a');}
    }
    s=await tick(40);frames+=40;minHp=Math.min(minHp,s.hp);
    assert.equal(s.runtimeFaults,0);
   }
   await page.keyboard.up('d');await page.keyboard.up('a');
   const deathEvents=await page.evaluate(()=>window.__retryDeaths);
   assert.ok(deathEvents.length>0,'ordinary attacks can trigger the production death/retry path');
   assert.ok(restarted,'death animation restarts the real final room');
   await page.evaluate(()=>{window.__retryBossPaint=[];});s=await tick(6);
   const checkpoint=s.checkpoints['w1-final']||null,restartX=s.player.x;
   assert.deepEqual(await page.evaluate(()=>window.__retryBossPaint),[],'a dead director must not paint through the restart');
   let restartMode='procession';
   if(s.boss){
    // Walking back earned a later checkpoint. Re-entering the arena can start
    // a NEW Quimera immediately; this is legitimate, unlike a stale old HUD.
    assert.equal(s.boss.phase,1);assert.equal(s.boss.hp,s.boss.max);
    assert.equal(s.world1Cine||s.pendingWorld1Cine,'bossIntro');
    assert.match(await page.locator('#world1-quimera-a11y').innerText(),/Quimera Ohana.*Fase 1/);
    restartMode='fresh_boss_intro';await films();s=await tick(3);
    assert.equal(s.boss.phase,1);
   }else{
    assert.equal(await page.locator('#world1-quimera-a11y').innerText(),'');
   }

   assert.deepEqual(s.world1Seals,before.world1Seals);assert.deepEqual(await keepsakes(),savedKeepsakes);
   naturalDeath={deathEvents,minHp,frames,restarted:true,restartMode,checkpoint,restartX,staleBossHUD:false};
   await page.screenshot({path:`${dir}/natural-retry-${width}.png`});
  }
  reports.push({width,height,retry:'native keyboard R',initialArenaPositionFixture:true,oldBossRemoved:true,staleCanvasHUD:false,staleAccessibleHUD:false,sealsAndKeepsakesPreserved:true,evolutionAndExperiencePreservedOnRetry:true,walkBack:{from,to:fresh.player.x,frames:walkFrames,freshBossPhase:fresh.boss.phase},naturalDeath});
  await context.close();
 }
 assert.deepEqual(errors,[]);await fs.writeFile(`${dir}/final-retry.json`,JSON.stringify({reports,errors,scope:'Earned campaign backup and one initial arena position fixture; keyboard retry, real movement and optional ordinary enemy-caused death, no resource or victory grants.'},null,2));
 console.log('PASS final retry: R clears the old Quimera HUD, keeps earned progress and ordinary movement starts a fresh fight at desktop/mobile; ordinary death retry also checked on desktop');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
