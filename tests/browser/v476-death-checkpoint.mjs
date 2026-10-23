// V476 integration: this deliberately sets up a note in E2E space and
// injects death to audit the *production* respawn route. It is not a claim
// of beating a room, killing a boss or physically surviving all ten rooms.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { startServer } from './server.mjs';
import { WORLD1_ROOMS, WORLD1_FLOOR } from '../../systems/world1-rooms.js';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:1300,height:850}});
 const faults=[];page.on('pageerror',e=>faults.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__OHANA_E2E);
 const before=await page.evaluate(()=>{
   localStorage.removeItem('ohana-w1-seals-v1');
   localStorage.removeItem('ohana-resume');
   const e=window.__OHANA_E2E;
   return e.startWorld1('kilo');
 });
 assert.equal(before.roomId,'w1-kilo');
 assert.deepEqual(before.world1Seals,[]);
 const station=WORLD1_ROOMS['w1-kilo'].seal.stations[0];
 const earned=await page.evaluate(({x,floor})=>{
   const e=window.__OHANA_E2E;
   for(let i=0;i<7&&e.state().world1Cine;i++)e.step(600);
   e.setPlayer(x-17,floor-28); // isolate respawn; physical traversal is V475
   e.step(100);
   return e.state();
 },{x:station.x,floor:WORLD1_FLOOR});
 assert.equal(earned.world1?.done,1,'the production Kilo song should really earn a note');
 assert.equal(earned.world1?.sealed,false);
 assert.deepEqual(earned.world1Seals,[]);
 const after=await page.evaluate(()=>{
   const e=window.__OHANA_E2E;
   e.die('hurt');
   return e.respawn(); // production respawn(), not reload or station injection
 });
 assert.equal(after.roomId,'w1-kilo');
 assert.equal(after.world1?.done,1,'completed first flower must survive real retry');
 assert.equal(after.world1?.sealed,false,'retry cannot create a seal');
 assert.deepEqual(after.world1Seals,[]);
 assert.ok(after.hp>0 && after.hp===after.maxHealth,'a retry restores normal health');
 assert.equal(after.runtimeFaults,0);
 assert.equal(after.score,earned.score,'retry must not pay earned note again');
 await fs.mkdir('test-results/v476',{recursive:true});
 await page.screenshot({path:'test-results/v476/kilo-first-note-after-respawn.png'});
 assert.deepEqual(faults,[]);
 console.log('PASS V476: Chromium game loop earns a real Kilo flower, an injected death exercises production respawn, completed note survives without another reward.');
}finally{
 await browser?.close();server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
