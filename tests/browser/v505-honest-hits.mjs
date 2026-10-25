// Explicit guarded sleeping target fixture exercises actual H and J paths.
// Crystals are removed to isolate hit XP from nearby pickups. No encounter victory is claimed by this isolated input/feedback test.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1440,height:900}});await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.start('kilo');e.loadRoom('w1-kilo');e.step(600);e.setEvo(4);});
 await page.locator('#game').focus();
 for(const key of ['h','j']){
  const before=await page.evaluate(()=>{const e=window.__OHANA_E2E,f=e.campaignContactTarget({guarded:true,isolateRewards:true}),p=e.state().player;e.setPlayer(f.x-p.w-18,1134-p.h);return e.state();});
  await page.keyboard.press(key);await page.evaluate(()=>window.__OHANA_E2E.step(35));await page.clock.runFor(16);
  const result=await page.evaluate(()=>({state:window.__OHANA_E2E.state(),foe:window.__OHANA_E2E.roomCast()[0]}));
  assert.equal(result.foe.hp,120);assert.ok(Number.isFinite(result.foe.blockedNoticeTick),key+' must actually reach the guarded target');
  assert.equal(result.state.xp,before.xp,key+' cannot farm XP through protection');assert.equal(result.state.finisherCharge,before.finisherCharge);
 }
 await fs.mkdir('test-results/v505',{recursive:true});await page.screenshot({path:'test-results/v505/blocked-hit.png'});
 console.log('PASS actual H and J blocked hits: notice emitted, no damage, no XP or charge');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
