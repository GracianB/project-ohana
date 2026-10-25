// Emulated viewport measurements on this browser/CPU, not a hardware promise.
// Form, camera and invulnerability are performance fixtures only.
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});const report=[];
 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,isMobile:label==='mobile',hasTouch:label==='mobile'}),page=await context.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.waitForFunction(()=>window.__OHANA_E2E);
  for(const hero of ['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi'])for(const [scene,position,form] of [['route',2450,2],['guardian',8450,4]]){
   await page.evaluate(({hero,position,form})=>{const e=window.__OHANA_E2E;localStorage.clear();e.startWorld1(hero);e.loadRoom('w1-'+hero);e.step(600);e.setEvo(form);e.setPlayer(position,1000);e.setInvulnerable(1000);},{hero,position,form});
   const timing=await page.evaluate(()=>new Promise(resolve=>{
    let previous=0,n=0;const deltas=[];function frame(now){if(previous&&n>20)deltas.push(now-previous);previous=now;
     if(++n<111)requestAnimationFrame(frame);else{deltas.sort((a,b)=>a-b);resolve({median:deltas[Math.floor(deltas.length/2)],p95:deltas[Math.floor(deltas.length*.95)],over50:deltas.filter(n=>n>50).length,frames:deltas.length});}}
    requestAnimationFrame(frame);
   }));
   const s=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(s.runtimeFaults,0);
   report.push({label,hero,scene,...timing,activeThreats:s.enemyDirector?.budget,enemies:s.enemyDirector?.alive});console.log('FRAME',JSON.stringify(report.at(-1)));
  }await context.close();
 }
 await fs.mkdir('test-results/v600',{recursive:true});await fs.writeFile('test-results/v600/performance.json',JSON.stringify(report,null,2));
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
