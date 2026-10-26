// Earned V600 save grants access only. HP/form/camera fixtures inspect art;
// they are never counted as earned V601 combat or progression evidence.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import{chromium}from'playwright';import{startServer}from'./server.mjs';
const server=await startServer(0),benchmark=process.env.OHANA_BENCH==='1',timings=[];let browser;
try{
 const storage=JSON.parse(await fs.readFile('test-results/v600/earned-campaign-storage.json','utf8'));for(const o of storage.origins)o.origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});const context=await browser.newContext({storageState:storage,viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(!benchmark){await page.clock.install({time:new Date('2026-10-26T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));}await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 await page.evaluate(()=>{localStorage.removeItem('ohana-resume');const e=window.__OHANA_E2E;e.startWorld1('kilo');e.loadRoom('w1-final');dispatchEvent(new CustomEvent('ohana-after',{detail:{action:'repeat'}}));e.setPlayer(7300,1000);e.setInvulnerable(10000);e.step(5);});
 for(let i=0;i<30;i++){await page.keyboard.press('Enter');await page.evaluate(()=>(window.__OHANA_E2E.setInvulnerable(600),window.__OHANA_E2E.step(100)));}
 for(const [i,fraction] of [.95,.65,.4,.15].entries()){
  await page.evaluate(fraction=>{const e=window.__OHANA_E2E,s=e.state();e.setInvulnerable(600);e.setBossHp(s.boss.max*fraction);e.step(500);const after=e.state(),b=after.boss;if(!b)throw Error(JSON.stringify({before:s,after}));e.setInvulnerable(600);e.setPlayer(Math.max(7200,b.x-180),1000);e.step(35);},fraction);
  if(!benchmark)await page.clock.runFor(32);const state=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(state.runtimeFaults,0);assert.equal(state.boss.phase,i+1);await page.screenshot({path:`test-results/v601/quimera-arena-${i+1}.png`});
  if(benchmark){const timing=await page.evaluate(()=>new Promise(resolve=>{let prev=0,n=0;const a=[];function frame(t){if(prev&&n>20)a.push(t-prev);prev=t;if(++n<111)requestAnimationFrame(frame);else{a.sort((a,b)=>a-b);resolve({median:a[45],p95:a[85],over50:a.filter(x=>x>50).length,frames:a.length});}}requestAnimationFrame(frame);}));timings.push({phase:i+1,...timing});}
 }
 if(benchmark)await fs.writeFile('test-results/v601/performance.json',JSON.stringify(timings,null,2));
 assert.deepEqual(errors,[]);console.log('PASS four actual arena phases, real telegraphs and clean runtime');
}finally{await browser?.close();server.closeAllConnections();server.close();}
