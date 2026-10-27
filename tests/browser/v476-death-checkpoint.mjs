// A real first instrument is earned with movement/combat/E/J. Death alone is
// injected to isolate production respawn; no HP, XP, form or note is granted.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
import {earnFirstKiloInstrument} from './v475-world1-natural-walk.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1300,height:850}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const {earned}=await earnFirstKiloInstrument(page,'http://127.0.0.1:'+server.address().port);
 const after=await page.evaluate(()=>{const e=window.__OHANA_E2E;e.die('hurt');return e.respawn();});
 assert.equal(after.roomId,'w1-kilo');assert.equal(after.world1.done,1);
 assert.equal(after.world1.sealed,false);assert.deepEqual(after.world1Seals,[]);
 assert.ok(after.hp>0&&after.hp===after.maxHealth,'retry restores ordinary health');
 assert.equal(after.runtimeFaults,0);assert.equal(after.score,earned.score,'retry cannot pay the caracola again');
 assert.ok(after.xp>=earned.xp,'retry preserves earned experience');
 await page.evaluate(()=>window.__OHANA_E2E.step(100));
 const settled=await page.evaluate(()=>window.__OHANA_E2E.state());
 assert.equal(settled.world1.done,1);assert.equal(settled.score,earned.score,'standing after retry cannot duplicate reward');
 await fs.mkdir('test-results/v476',{recursive:true});
 await page.screenshot({path:'test-results/v476/kilo-first-note-after-respawn.png'});
 await fs.writeFile('test-results/v476/physical-note-respawn.json',JSON.stringify({earned:{done:earned.world1.done,score:earned.score,xp:earned.xp},after:{done:settled.world1.done,score:settled.score,xp:settled.xp},deathInjected:true,progressGranted:false,errors},null,2));
 assert.deepEqual(errors,[]);
 console.log('PASS V476: physically earned caracola survives injected death and production retry without reward farming');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
