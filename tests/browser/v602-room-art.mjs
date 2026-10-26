// Presentation fixtures only. Forms/positions are not campaign progress.
import fs from'node:fs/promises';import assert from'node:assert/strict';import{chromium}from'playwright';import{startServer}from'./server.mjs';
const server=await startServer(0);let browser;
try{browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],assets=new Set();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().includes('-realm.webp')&&r.ok())assets.add(r.url().split('/').pop());});await fs.mkdir('test-results/v602',{recursive:true});await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
for(const hero of ['stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi']){
 await page.evaluate(hero=>{const e=window.__OHANA_E2E;e.startWorld1(hero);e.loadRoom('w1-'+hero);e.step(600);e.setEvo(2);e.setPlayer(2450,1000);e.setInvulnerable(300);},hero);await page.waitForTimeout(400);await page.screenshot({path:`test-results/v602/room-${hero}.png`});const s=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(s.runtimeFaults,0,s.lastRuntimeFault);
}
assert.equal(assets.size,9);assert.deepEqual(errors,[]);console.log('PASS nine painted environments', [...assets]);
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
