import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.waitForFunction(()=>window.__OHANA_E2E);
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.start('kilo');e.loadRoom('hub');e.step(12);e.setInvulnerable(600);});
 const rides=await page.evaluate(()=>{const e=window.__OHANA_E2E,results=[];
  for(const axis of ['x','y']){e.loadRoom('hub');e.step(12);e.setInvulnerable(600);const l=e.state().grove.lifts.find(l=>l.axis===axis),h=28;e.setPlayer(l.x+35,l.y-h);e.step(2);const before=e.state();e.step(40);const after=e.state();results.push({axis,before:before.player,after:after.player,lift:after.grove.lifts.find(l=>l.axis===axis)});}return results;});
 for(const r of rides){assert.ok(Math.abs(r.after[r.axis]-r.before[r.axis])>5,JSON.stringify(r));assert.ok(Math.abs(r.after.y+28-r.lift.y)<5,JSON.stringify(r));}
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.loadRoom('hub');e.setPlayer(880,1106);e.setEvo(1);e.cast(0);e.step(1);});
 let s=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(s.grove.song,true);assert.equal(s.grove.source,'kilo');
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.cast(1);e.step(20);e.setInvulnerable(0);});await page.waitForTimeout(100);
 await fs.mkdir('test-results/v441',{recursive:true});await page.screenshot({path:'test-results/v441/kilo-grove-desktop.png'});
 s=await page.evaluate(()=>window.__OHANA_E2E.state());assert.ok(s.terrainStats.culled>0);assert.ok(s.terrainStats.total<=18);console.log('Terrain',s.terrainStats);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);await page.screenshot({path:'test-results/v441/kilo-grove-mobile.png'});
 assert.equal(s.runtimeFaults,0);assert.deepEqual(errors,[]);console.log('PASS V441: both moving transports carry riders, Kilo unlocks song, 18 platforms max, 2D terrain culling, desktop/mobile.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}


