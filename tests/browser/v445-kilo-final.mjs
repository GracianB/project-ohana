import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';import {earnKiloRemate} from './kilo-combo-helper.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.waitForFunction(()=>window.__OHANA_E2E);
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.start('kilo');e.setEvo(3);e.step(12);e.cast(4);});assert.notEqual((await page.evaluate(()=>window.__OHANA_E2E.state())).lastAbilitySlot,4);
 const combo=await earnKiloRemate(page);assert.ok(combo.ready,JSON.stringify(combo));
 await fs.mkdir('test-results/v445',{recursive:true});await page.screenshot({path:'test-results/v445/combo-ready-desktop.png'});
 await page.keyboard.press('i');const used=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(used.lastAbilitySlot,4);assert.equal(used.kiloCombo.ready,false);
 await page.evaluate(()=>window.__OHANA_E2E.step(9));await page.screenshot({path:'test-results/v445/remate-aloha.png'});
 const motion=await page.evaluate(()=>{
  const e=window.__OHANA_E2E;e.loadRoom('hub');e.step(12);e.setPlayer(150,1080);e.setInvulnerable(600);
  const key=(type,code)=>window.dispatchEvent(new KeyboardEvent(type,{key:code,code,bubbles:true}));
  key('keydown','ArrowRight');e.step(3);const walk=e.state().player.vx;key('keyup','ArrowRight');e.step(2);key('keydown','ArrowRight');e.step(9);const run=e.state();key('keyup','ArrowRight');e.step(1);const stop=e.state();
  const counts=[];for(const form of [0,2,4]){e.setEvo(form);e.setPlayer(150,1080);e.step(20);for(let n=0;n<4;n++){key('keydown','ArrowUp');e.step(3);key('keyup','ArrowUp');e.step(1);}counts.push(e.state().player.jumps);e.resetInput();}
  return {walk,run:run.player.vx,sprint:run.sprinting,stop:stop.sprinting,counts};
 });assert.ok(motion.run>motion.walk,JSON.stringify(motion));assert.equal(motion.sprint,true);assert.equal(motion.stop,false);assert.deepEqual(motion.counts,[1,2,3]);
 await page.setViewportSize({width:390,height:844});assert.ok((await earnKiloRemate(page)).ready);await page.screenshot({path:'test-results/v445/combo-ready-mobile.png'});
 assert.equal(await page.locator('.touch-btn[data-k="i"]').textContent(),'I✓');await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.touch-btn[data-k="i"]').click();assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).lastAbilitySlot,4);assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).kiloCombo.ready,false);
 assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).runtimeFaults,0);assert.deepEqual(errors,[]);console.log('PASS Kilo V1: I locked until real H-J-H, single consumption, directed remate, double-tap sprint/release, 1/2/3 jumps, desktop/mobile.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
