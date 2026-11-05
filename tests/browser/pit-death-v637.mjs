// V637 · REAL player physics, authored hazard geometry and actual death flow.
// No mocked terrain or manually injected `die`; traverse the running engine.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
const ctx=await browser.newContext({serviceWorkers:'block'});
try{
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.documentElement.dataset.ohanaBoot==='ready');
 await page.keyboard.press('Escape');
 const observed=[];
 page.on('console',()=>{});
 for(const hero of ['cat','cuerno','dragon','dino','frita','pizza','yomi']){
   const forms=hero==='cat'?[0,1,2,3,4]:[0];
   for(const form of forms){
    const result=await page.evaluate(({hero,form})=>{
     const e=window.__OHANA_E2E,events=[];
     const listener=event=>events.push(event.detail);
     window.addEventListener('ohana-death',listener);
     e.manualClock(true);
     e.startWorld1(hero);
     const state=e.state();
     if(state.roomId!=='w1-'+hero)e.loadRoom('w1-'+hero);
     // Complete actual authored chapter arrival/cinematics before the fall:
     // pending World 1 scenes intentionally suspend movement and would make
     // a "drop 27 frames" test inspect a frozen, not-yet-playable character.
     e.setInvulnerable(600);
     e.step(520);
     if(form)e.setEvo(form);
     const pit=e.checkpointData().hazards.find(h=>h.type==='death');
     if(!pit)throw new Error('Expected lethal pit in '+hero);
     const p=e.state().player;
     e.setPlayer(pit.x+pit.w/2-p.w/2,pit.y-38-p.h);
     e.exhaustPlayerJumps();
     e.setInvulnerable(150);
     e.setPlayerVelocity(0,11);
     const before=e.state();
     const after=e.step(27);
     if(after.hp>0&&after.player?.y===before.player?.y){
       throw new Error('Pit fixture is not in active player physics. '+JSON.stringify({
        hero,form,room:after.roomId,world1Cine:after.world1Cine,
        pendingWorld1Cine:after.pendingWorld1Cine,paused:after.paused,
        running:after.running,runtimeFaults:after.runtimeFaults,pit:pit.id,
        initial:before.player,after:after.player
       }));
     }
     window.removeEventListener('ohana-death',listener);
     return {hero,form,pit:pit.id,after,events};
    },{hero,form});
    assert.ok(result.events.some(event=>event.reason==='void'),
      'fall into '+result.pit+' must cause actual void death: '+JSON.stringify(result.after.player));
    assert.equal(result.after.hp,0,'death must zero HP for '+hero+' form '+form);
    assert.equal(result.after.player?.grounded,false,'dead hero cannot stand in the lethal pit');
    observed.push({hero,form,pit:result.pit,reason:'void'});
   }
 }
 assert.deepEqual(errors,[],'no engine exceptions');
 console.log('PASS V637: '+observed.length+' physical pit deaths across seven hero chapters, every Medusaluna form and invulnerability');
}finally{await ctx.close();await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
