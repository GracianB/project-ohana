// Focused interaction fixtures. Placement is explicit; every unlock uses real E/Use.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import{chromium}from'playwright';import{startServer}from'./server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:'/usr/bin/chromium'}),out='test-results/v800';
try{await fs.mkdir(out,{recursive:true});const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await p.waitForFunction(()=>window.__OHANA_E2E);await p.evaluate(()=>{const e=window.__OHANA_E2E;e.manualClock();e.startWorld1('cat');e.step(600);});
 for(let i=0;i<10;i++){if(!(await p.evaluate(()=>window.__OHANA_E2E.state())).world1Cine)break;await p.evaluate(()=>window.__OHANA_E2E.step(600));}
 const w=()=>p.evaluate(()=>window.__OHANA_E2E.michiSanctuaryState()),state=()=>p.evaluate(()=>window.__OHANA_E2E.state());
 const place=async(x,floor)=>p.evaluate(({x,floor})=>{const e=window.__OHANA_E2E,s=e.state();e.setPlayer(x-s.player.w/2,floor-s.player.h);e.step(40);},{x,floor});
 const use=async()=>{console.log('USE',JSON.stringify((await state()).player));await p.locator('#touch>.interact').tap();await p.evaluate(()=>window.__OHANA_E2E.step(40));};
 for(const x of[1800,1360,1580]){await place(x,1134);await use();}
 assert.ok((await w()).gardenSecrets.includes('w1-cat-garden-hollow'));await p.screenshot({path:out+'/secret-hollow-mobile.png'});
 await place(2150,1860);await use();assert.ok((await w()).gardenSecrets.includes('w1-cat-garden-hush'));
 await place(2630,1860);await use();assert.equal((await w()).zone,'hollow');
 await place(6790,620);await use();assert.ok((await w()).gardenSecrets.includes('w1-cat-garden-wind'));
 await place(7580,620);await use();assert.equal((await w()).zone,'tide');await place(1740,300);await use();assert.ok((await w()).gardenSecrets.includes('w1-cat-garden-tide'));await p.screenshot({path:out+'/secret-tide-mobile.png'});
 await p.evaluate(()=>window.__OHANA_E2E.setEvo(2));
 await place(2580,300);await use();assert.equal((await state()).hero,'nacar');assert.equal((await state()).roomId,'w1-nacar');
 for(let i=0;i<10&&(await state()).world1Cine;i++)await p.evaluate(()=>window.__OHANA_E2E.step(600));
 const ocean=async(x,y)=>p.evaluate(({x,y})=>{const e=window.__OHANA_E2E,s=e.state();e.setPlayer(x-s.player.w/2,y-s.player.h/2);e.step(2);},{x,y});
 for(const [x,y] of [[3900,1480],[5100,1240],[5700,710],[5410,375]]){await ocean(x,y);await use();}
 const receipts=await p.evaluate(()=>JSON.parse(localStorage.getItem('ohana')).secrets['w1-nacar']);
 assert.ok(receipts.includes('w1-nacar-discovery-lantern'));
 assert.ok(receipts.includes('w1-nacar-discovery-conch'));
 await p.reload();await p.waitForFunction(()=>window.__OHANA_E2E);
 await p.evaluate(()=>window.__OHANA_E2E.manualClock());
 await p.locator('.atlas-resume').click();
 for(let i=0;i<10&&(await state()).world1Cine;i++)await p.evaluate(()=>window.__OHANA_E2E.step(600));
 assert.equal((await state()).hero,'nacar');
 await ocean(4070,1060);await use();assert.ok((await state()).player.x>7100);
 await ocean(7300,1060);await use();assert.ok((await state()).player.x<4300);
 await p.screenshot({path:out+'/wreck-route-mobile.png'});
 await place(220,1775+(await state()).player.h/2);await use();assert.equal((await state()).hero,'cat');assert.equal((await state()).evo,2);assert.equal((await w()).zone,'tide');
 await place(8410,1010);await use();assert.ok((await w()).guard>0);assert.equal((await state()).world1.done,0,'optional discoveries never grant a farol');assert.equal((await state()).runtimeFaults,0);assert.deepEqual(errors,[]);await fs.writeFile(out+'/secret-interactions.json',JSON.stringify({input:'native touch Use',placementFixture:true,world:await w(),errors},null,2));console.log('PASS touch chime order, root secret, wind secret, Nácar encounter, guardian refuge; no progression grants');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
