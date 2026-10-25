// Presentation/access fixtures only; physical victories live in v509-pizza-chapter.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 await fs.mkdir('test-results/v509',{recursive:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 for(const hero of ['pizza','dino']){
  await page.setViewportSize({width:1440,height:900});
  await page.evaluate(hero=>{localStorage.clear();const e=window.__OHANA_E2E;e.startWorld1(hero);e.loadRoom('w1-'+hero);e.step(60);},hero);await page.clock.runFor(32);
  assert.equal(await page.evaluate(()=>window.__OHANA_E2E.state().world1Cine),'roomEnter');
  await page.screenshot({path:`test-results/v509/${hero}-arrival.png`});
  await page.evaluate(()=>{const e=window.__OHANA_E2E;e.step(600);e.setEvo(4);e.setPlayer(3500,950);e.step(15);});await page.clock.runFor(32);
  await page.screenshot({path:`test-results/v509/${hero}-landscape.png`});
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.__OHANA_E2E.step(60));await page.clock.runFor(32);
  await page.locator('.touch-btn[data-k="j"]').tap();
  const s=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(s.lastAbilitySlot,0,hero+' touch J invokes its real ability');assert.ok(s.lastAbilityId);assert.equal(s.runtimeFaults,0);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`test-results/v509/${hero}-mobile.png`});
 }
 await page.setViewportSize({width:1440,height:900});
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.setPlayer(8510,1060);e.step(12);});await page.clock.runFor(32);
 await page.screenshot({path:'test-results/v509/dino-colossus-design.png'});
 await page.evaluate(()=>{localStorage.clear();const e=window.__OHANA_E2E;e.startWorld1('pizza');e.loadRoom('w1-pizza');e.step(600);e.setEvo(4);e.setPlayer(8510,1050);e.step(12);});await page.clock.runFor(32);await page.screenshot({path:'test-results/v509/pizza-chef-design.png'});
 assert.deepEqual(errors,[]);console.log('PASS Pizza and Dino arrivals, landscapes, reduced motion and real touch J; presentation fixtures');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
