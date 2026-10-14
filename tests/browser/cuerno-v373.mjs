import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try {
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&m.text().includes('[OHANA runtime fault]'))errors.push(m.text());});
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');
 await page.waitForFunction(()=>!!window.__OHANA_E2E);
 await fs.mkdir('test-results/visual',{recursive:true});
 for(let form=0;form<5;form++) {
  const result=await page.evaluate(form=>{
   const api=window.__OHANA_E2E;api.start('cuerno');api.setEvo(form);api.setInvulnerable();
   for(const slot of [0,1,2])api.cast(slot);
   const before=api.state();api.step(65);const after=api.state();
   return {before,after};
  },form);
  assert.equal(result.before.cuerno.acts.length,3,'three actual runtime attacks form '+form);
  assert.ok(result.after.cuerno.trails>0,'K creates runtime trail form '+form);
  assert.equal(result.after.running,true);
  await page.screenshot({path:'test-results/visual/cuerno-v373-form-'+(form+1)+'.png'});
 }
 const play=await page.evaluate(async()=>{
  const api=window.__OHANA_E2E;api.start('cuerno');api.setEvo(4);api.cast(3);api.step(30);
  const m=await import('/systems/cuerno-play-v373.js');const duo=m.readCuernoPlay().duo;
  m.queueCuernoPlay('dream');api.step(12);const sky=m.readCuernoPlay().sky;
  api.loadRoom('jungle');const reset=m.readCuernoPlay();
  return {duo,sky,reset,cuerno:api.state().cuerno};
 });
 assert.ok(play.duo,'U reaches integrated visual duo');assert.ok(play.sky,'dream paints sky near duo');
 assert.equal(play.reset.duo,null);assert.equal(play.reset.sky,null);assert.equal(play.cuerno.trails,0);
 assert.deepEqual(errors,[]);console.log('PASS V373: five runtime forms, J/K/L trail, U duo, dream sky and room reset');
} finally {await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
