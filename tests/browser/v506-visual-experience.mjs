// Scene/camera/form fixtures inspect presentation; no campaign win is claimed.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await fs.mkdir('test-results/v506',{recursive:true});
 for(const hero of ['kilo','stitcho','chispin']){
  await page.evaluate(hero=>{localStorage.clear();const e=window.__OHANA_E2E;e.start(hero);e.loadRoom('w1-'+hero);e.step(60);},hero);await page.clock.runFor(32);
  assert.equal(await page.evaluate(()=>window.__OHANA_E2E.state().world1Cine),'roomEnter');
  await page.screenshot({path:`test-results/v506/${hero}-arrival.png`});
  await page.evaluate(()=>{const e=window.__OHANA_E2E;e.step(600);e.setEvo(4);e.setPlayer(3650,950);e.step(20);});await page.clock.runFor(32);
  await page.screenshot({path:`test-results/v506/${hero}-new-landscape.png`});
 }
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.start('kilo');e.loadRoom('w1-kilo');e.step(600);e.setEvo(4);const p=e.state().player;e.setPlayer(700,1134-p.h);e.campaignContactTarget({isolateRewards:true});e.cast(3);e.step(50);});await page.clock.runFor(32);
 const guest=await page.evaluate(()=>window.__OHANA_E2E.companionActorState());assert.ok(guest);assert.ok(Math.abs(guest.y-guest.heroFoot)<2);assert.ok(Math.abs(guest.x-guest.heroX)<110);assert.equal(guest.air,false);
 await page.screenshot({path:'test-results/v506/kilo-white-spirit-and-friend.png'});
 await page.setViewportSize({width:390,height:844});await page.clock.runFor(32);await page.screenshot({path:'test-results/v506/kilo-white-spirit-mobile.png'});
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.start('kilo');e.loadRoom('w1-kilo');e.step(600);e.setEvo(3);const p=e.state().player;e.setPlayer(500,1134-p.h);e.combatTarget();});
 await page.locator('#game').focus();
 for(let i=0;i<3;i++){await page.keyboard.press('j');await page.evaluate(()=>window.__OHANA_E2E.step(65));}
 assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).kiloCombo.ready,true,'three actual J casts can prepare I without a memorised sequence');
 await page.evaluate(()=>window.__OHANA_E2E.step(600));assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).kiloCombo.ready,true,'I readiness does not expire');
 await page.evaluate(()=>{const e=window.__OHANA_E2E,f=e.roomCast()[0],p=e.state().player;e.setPlayer(f.x-p.w-12,1134-p.h);});
 const hp=await page.evaluate(()=>window.__OHANA_E2E.roomCast()[0].hp);await page.keyboard.press('i');await page.evaluate(()=>window.__OHANA_E2E.step(30));
 assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).kiloCombo.ready,false);assert.ok((await page.evaluate(()=>window.__OHANA_E2E.roomCast()[0].hp))<hp,'I performs a damaging finisher');
 assert.deepEqual(errors,[]);console.log('PASS three animated entries, daylight scenes, white spirit and grounded companion; visual access fixtures');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
