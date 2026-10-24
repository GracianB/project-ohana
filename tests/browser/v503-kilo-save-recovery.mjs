// Explicit compatibility fixture: a legitimately sealed historical save whose
// form/XP lagged behind its four earned notes. This is not a physical victory.
import assert from 'node:assert/strict';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 await page.evaluate(()=>{
  const e=window.__OHANA_E2E;e.startWorld1('kilo');
  const save=JSON.parse(localStorage.getItem('ohana'));if(!save)throw Error('No real save created');
  Object.assign(save,{id:'kilo',roomId:'w1-kilo',evo:3,xp:260,world1Seals:['kilo'],world1Stations:{'w1-kilo':[0,1,2,3]}});
  localStorage.setItem('ohana',JSON.stringify(save));localStorage.removeItem('ohana.tmp');localStorage.setItem('ohana-resume','1');e.startWorld1('kilo');e.step(600);
 });
 const s=await page.evaluate(()=>window.__OHANA_E2E.state());
 assert.equal(s.hero,'kilo');assert.equal(s.evo,4);assert.ok(s.xp>=420);assert.equal(s.world1.sealed,true);
 console.log('PASS sealed Kilo save restores earned final form without farming XP');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
