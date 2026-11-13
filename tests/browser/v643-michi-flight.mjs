// Isolated movement fixture: genuine held keys drive production physics, no flight simulation.
import assert from'node:assert/strict';import fs from'node:fs/promises';import{chromium}from'playwright';import{startServer}from'./server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:'/usr/bin/chromium'});const dir='test-results/v643';
try{await fs.mkdir(dir,{recursive:true});const p=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await p.waitForFunction(()=>window.__OHANA_E2E);await p.evaluate(()=>{const e=window.__OHANA_E2E;e.manualClock();e.start('cat');});const report=[];
for(const form of[1,4]){
 await p.evaluate(f=>{const e=window.__OHANA_E2E;e.resetInput();e.setEvo(f);e.setPlayer(100,-1200);e.setPlayerVelocity(0,0);},form);
 await p.keyboard.down('Space');const ascent=await p.evaluate(()=>window.__OHANA_E2E.step(50));await p.keyboard.up('Space');assert.equal(ascent.michiFlight.mode,'ascend');assert.ok(ascent.player.vy<0);
 const release=await p.evaluate(()=>window.__OHANA_E2E.step(30));assert.equal(release.michiFlight.mode,form===4?'hover':'glide');if(form===4){assert.equal(release.player.vy,0);assert.ok(Math.abs(release.player.y-ascent.player.y)<.01);}else assert.ok(release.player.vy>0);
 await p.keyboard.down('ArrowDown');const descent=await p.evaluate(()=>window.__OHANA_E2E.step(10));await p.keyboard.up('ArrowDown');assert.equal(descent.michiFlight.mode,'descend');assert.ok(descent.player.vy>=4.5);
 if(form===1){await p.keyboard.down('Space');const spent=await p.evaluate(()=>window.__OHANA_E2E.step(220));await p.keyboard.up('Space');assert.equal(spent.michiFlight.remaining,0);assert.equal(spent.michiFlight.mode,'glide');}
 report.push({form,ascend:ascent.michiFlight.mode,release:release.michiFlight.mode,descend:descent.michiFlight.mode});
}
assert.deepEqual(errors,[]);await fs.writeFile(dir+'/flight.json',JSON.stringify(report,null,2));console.log('PASS native held-key flight: sustained ascent, finite reserve, glide, true ghost hover and deliberate descent',report);
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
