import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.waitForFunction(()=>window.__OHANA_E2E);
 await fs.mkdir('test-results/v444',{recursive:true});
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.start('kilo');e.setEvo(4);e.loadRoom('hub');e.step(12);e.setInvulnerable(600);e.setPlayer(1800,1080);e.setFinisher(100);e.cast(5);e.step(20);});
 await page.screenshot({path:'test-results/v444/rhythm-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/v444/rhythm-mobile.png'});
 await page.setViewportSize({width:1440,height:950});
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.loadRoom('hub');e.step(12);e.setInvulnerable(600);e.setPlayer(1800,1080);e.cast(2);e.step(40);});
 await page.screenshot({path:'test-results/v444/guardians-ground.png'});
 const duet=await page.evaluate(()=>{const e=window.__OHANA_E2E;e.loadRoom('hub');e.step(12);e.cast(3);e.step(48);return e.state().kiloDuet;});assert.ok(duet,'U still performs in the real game');
 await page.screenshot({path:'test-results/v444/ohana-duet.png'});
 assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).runtimeFaults,0);assert.deepEqual(errors,[]);console.log('PASS V444: desktop/mobile rhythm UI, projected L guardians and active U, no runtime errors.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
