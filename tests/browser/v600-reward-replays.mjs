// Replays only genuinely earned 100-item rewards from the physical collection
// backup. No item, relic, form, HP or victory is injected by this test.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 const earned=JSON.parse(await fs.readFile('test-results/v600/all-memory-storage.json','utf8'));
 for(const o of earned.origins)o.origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
 const context=await browser.newContext({storageState:earned,viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[],report=[];
 page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 for(const hero of ['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi']){
  await page.evaluate(hero=>{localStorage.removeItem('ohana-resume');window.__OHANA_E2E.startWorld1(hero);},hero);
  for(let i=0;i<18;i++){const s=await page.evaluate(()=>window.__OHANA_E2E.state());if(!s.world1Cine)break;await page.keyboard.press('Enter');await page.evaluate(()=>window.__OHANA_E2E.step(120));}
  await page.locator('#game').focus();await page.keyboard.press('b');await page.clock.runFor(32);await page.locator('[data-memory-replay]').click();
  assert.equal(await page.evaluate(()=>document.body.classList.contains('relic-cinema')),true);
  await page.evaluate(()=>window.__OHANA_E2E.step(280));await page.clock.runFor(32);
  assert.equal(await page.locator('#ability-bar').isVisible(),false,'powers must not cover the earned reward');assert.equal(await page.locator('#combo-chip').isVisible(),false,'no stale combo over the celebration');
  assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).runtimeFaults,0);
  await page.screenshot({path:`test-results/v600/${hero}-reward-final.png`});await page.keyboard.press('Escape');await page.clock.runFor(16);
  assert.equal(await page.evaluate(()=>document.body.classList.contains('relic-cinema')),false);
  report.push({hero,earned:100,scene:true,clearStage:true,escapeReturns:true});
 }
 await page.setViewportSize({width:390,height:844});await page.keyboard.press('b');await page.clock.runFor(16);await page.locator('[data-memory-replay]').click();await page.evaluate(()=>window.__OHANA_E2E.step(250));await page.clock.runFor(32);await page.screenshot({path:'test-results/v600/reward-mobile.png'});
 await page.locator('#game').click();assert.equal(await page.evaluate(()=>document.body.classList.contains('relic-cinema')),false,'phone tap returns without a keyboard');
 assert.deepEqual(errors,[]);await fs.writeFile('test-results/v600/reward-replays.json',JSON.stringify({report,mobileTap:true,errors},null,2));console.log('PASS ten earned personal celebrations, clear stage, Escape and mobile tap');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
