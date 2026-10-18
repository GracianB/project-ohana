import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');await page.waitForFunction(()=>window.__OHANA_E2E);
 await fs.mkdir('test-results/adventures',{recursive:true});
 for(const room of ['hub','beach','jungle','cave','lab','ridge','space','reef','volcano']){
  let state=await page.evaluate(room=>{const api=window.__OHANA_E2E;api.start('kilo');api.setEvo(4);api.loadRoom(room);api.setInvulnerable(600);const a=api.state().adventure;return api.setPlayer(a.x-15,a.y-api.state().player.maxJumps-40);},room);
  const a=state.adventure;assert.ok(a,room);await page.keyboard.press('e');
  state=await page.evaluate(()=>window.__OHANA_E2E.state());assert.ok(['racing','warning'].includes(state.adventure.phase),room+' E must start the challenge instead of a portal');
  if(a.kind==='race'){
   for(const r of a.path)await page.evaluate(r=>window.__OHANA_E2E.setPlayer(r.x-15,r.y-20),r);
   state=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(state.adventure.phase,'won',room);
  }else{
   state=await page.evaluate(()=>window.__OHANA_E2E.step(150));assert.ok(['fighting','warning'].includes(state.adventure.phase),room);
   assert.ok(state.adventure.enemies>0,room);
  }
  assert.equal(state.runtimeFaults,0,room);await page.screenshot({path:'test-results/adventures/'+room+'.png'});
 }
 assert.deepEqual(errors,[]);console.log('PASS: nine rooms, E interactions, ordered races, telegraphed ambushes and no runtime faults');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
