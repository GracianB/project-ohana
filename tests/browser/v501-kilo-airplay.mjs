// Form/position and stationary target fixtures isolate input/physics. The
// separate chapter pilot earns all forms and chimes with actual movement.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
import {KILO_CHAPTER_ARENA} from '../../systems/kilo-chapter.js';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1440,height:900});
 await page.clock.install({time:new Date('2026-10-24T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-24T12:00:01Z'));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1',{waitUntil:'load'});
 const step=async n=>{await page.evaluate(n=>window.__OHANA_E2E.step(n),n);await page.clock.runFor(16);return page.evaluate(()=>window.__OHANA_E2E.state());};
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.startWorld1('kilo');e.step(600);e.step(600);e.setEvo(4);e.setPlayer(400,1050);e.combatTarget();e.setPlayer(460,700);});
 await page.locator('#game').focus();await page.keyboard.press('k');assert.equal((await step(1)).kiloFlight.mode,'solar');await page.keyboard.down('s');await step(5);await page.keyboard.up('s');await step(25);
 let s=await step(600);s=await step(300);assert.equal(s.kiloFlight.mode,'solar');assert.ok(s.player.y<850,'solar flight must not expire like levitation');
 assert.equal((await page.evaluate(()=>window.__OHANA_E2E.kiloAirState())).effects.some(f=>f.kind==='hula'),false,'offensive field must expire separately');
 assert.match(await page.locator('#ability-bar [data-index="1"]').innerText(),/Vuelo/);
 const before=await page.evaluate(()=>window.__OHANA_E2E.roomCast()[0].hp);
 await page.keyboard.press('j');await step(45);
 const after=await page.evaluate(()=>window.__OHANA_E2E.roomCast()[0].hp);assert.ok(after<before,'aimed downward J must damage a real target below');
 await fs.mkdir('test-results/v501',{recursive:true});await page.screenshot({path:'test-results/v501/kilo-solar-flight-desktop.png'});
 await page.keyboard.press('k');s=await step(1);assert.equal(s.kiloFlight.mode,null);s=await step(60);assert.ok(s.player.y>900,'K must restore falling');
 // Rain is an explicit encounter fixture in the legacy lab; its real damage
 // path must cancel solar flight. No direct health or damage override.
 s=await page.evaluate(()=>{const e=window.__OHANA_E2E;e.start('kilo');e.setEvo(4);e.loadRoom('lab');e.setPlayer(350,600);e.cast(1);e.forceRain();return e.state();});
 assert.equal(s.kiloFlight.mode,'solar');
 for(let i=0;i<80&&s.kiloFlight.mode==='solar';i++)s=await step(3);
 assert.equal(s.roomId,'lab');assert.ok(s.hp>0);assert.equal(s.kiloFlight.mode,null,'accepted damage must interrupt flight; later healing may restore HP');
 // The boss's real warning renderer with an airborne target; access, form
 // position and four earned notes are fixtures; this does not claim a second earned victory.
 await page.evaluate(left=>{const e=window.__OHANA_E2E;e.startWorld1('kilo');const save=JSON.parse(localStorage.getItem('ohana'));Object.assign(save,{id:'kilo',roomId:'w1-kilo',evo:4,xp:420,world1Seals:[],clearedEncounters:{},world1Stations:{'w1-kilo':[0,1,2,3]}});localStorage.setItem('ohana',JSON.stringify(save));localStorage.removeItem('ohana.tmp');localStorage.setItem('ohana-resume','1');e.startWorld1('kilo');e.step(600);e.setPlayer(left+350,730);},KILO_CHAPTER_ARENA.left);
 await page.locator('#game').focus();await page.keyboard.press('k');
 let aerial=null;
 for(let i=0;i<600;i++){
  await step(1);aerial=await page.evaluate(()=>window.__OHANA_E2E.roomCast().find(e=>e.miniBoss)?.guardian);
  if(aerial?.phase==='warn'&&aerial.airTarget&&aerial.aerialVolley?.length)break;
 }
 assert.equal(aerial?.airTarget,true);assert.equal(aerial.phase,'warn');
 assert.ok(Number.isFinite(aerial.volleyAngle)&&Number.isFinite(aerial.targetY),'committed fan has a fixed aerial aim');
 await page.screenshot({path:'test-results/v501/kilo-guardian-aerial-warning.png'});
 const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
 await phone.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1',{waitUntil:'load'});
 await phone.evaluate(()=>{const e=window.__OHANA_E2E;e.startWorld1('kilo');e.step(600);e.step(600);e.setEvo(4);e.setPlayer(300,700);});
 await phone.locator('.touch-btn[data-k="k"]').tap();await phone.waitForFunction(()=>window.__OHANA_E2E.state().kiloFlight.mode==='solar');
 await phone.screenshot({path:'test-results/v501/kilo-solar-flight-mobile.png'});
 await phone.locator('.touch-btn[data-k="k"]').tap();assert.equal((await phone.evaluate(()=>window.__OHANA_E2E.state())).kiloFlight.mode,null);
 assert.deepEqual(errors,[]);console.log('PASS Kilo airplay: sustained flight, bounded aura, aimed J damage, K descent, real damage cancellation and touch toggle. Advanced form/position/target and Lab rain are explicit fixtures.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
