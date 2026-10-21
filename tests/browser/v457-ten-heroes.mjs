import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';

// V457: executable acceptance for the ten *integrated* personal chapters.
// State/persistence test with E2E-only grants, not a claim that all pickups
// can be reached in natural platforming or that a human beat every boss.
const HEROES=[
 ['kilo','CANCIÓN DEL HOGAR'],['stitcho','CORAZÓN GALÁCTICO'],
 ['chispin','RELÁMPAGO DORADO'],['cat','LUNA SOÑADORA'],
 ['dragon','DRAGÓN CELESTIAL'],['dino','GUARDIÁN ANTIGUO'],
 ['frita','BANQUETE DORADO'],['pizza','HORNO ESTELAR'],
 ['yomi','CONSTELACIÓN ETERNA'],['cuerno','AURORA VIVA']
];
const server=await startServer(0);
let browser;
try{
 browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 const faults=[];
 page.on('pageerror',error=>faults.push(error.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');
 await page.waitForFunction(()=>!!window.__OHANA_E2E);
 await fs.mkdir('test-results/v457',{recursive:true});
 const names=new Set();
 const report=[];
 for(const [id,reward] of HEROES){
  const initial=await page.evaluate(hero=>{
   // Independent new-game scenario: do not let the optional shared Hoku
   // 100-piece album auto-start its film during a different hero's smoke test.
   // Personal hero stores are intentionally NOT reset here.
   localStorage.removeItem('ohana-room-albums-v1');
   const e=window.__OHANA_E2E;
   return {state:e.start(hero),items:e.heroItems()};
  },id);
  assert.equal(initial.state.running,true,id+' not running');
  assert.equal(initial.state.roomId,'hub',id+' changed canonical room identity');
  assert.equal(initial.state.heroCollection?.hero,id,id+' personal chapter not wired');
  assert.equal(initial.state.heroCollection?.total,100,id+' expected 100 objects');
  assert.equal(initial.items.length,100,id+' collectible coordinates missing');
  assert.ok(initial.state.worldW>=3000,id+' world too narrow');
  assert.ok(initial.state.roomName,id+' needs a named chapter');
  names.add(initial.state.roomName);
  await page.screenshot({path:'test-results/v457/'+id+'-baby-desktop.png'});
  // Verify real collection domain transitions, reward, and room persistence.
  // The separate gameplay suites audit movement/gates; this smoke test makes
  // NO promise that a baby can bypass a hero's progression locks.
  const result=await page.evaluate(()=>{
   const e=window.__OHANA_E2E;
   const rejected=[];
   for(const item of e.heroItems())if(!e.grantHeroItem(item.id))rejected.push(item.id);
   const collected=e.state().heroCollection;
   e.loadRoom('beach');e.loadRoom('hub');
   return {collected,after:e.state().heroCollection,rejected};
  });
  assert.equal(result.collected?.count,100,id+' collection transition did not reach 100: '+JSON.stringify(result.rejected));
  assert.equal(result.collected?.complete,true,id+' reward not issued');
  assert.equal(result.collected?.reward,reward,id+' trophy not personal');
  assert.equal(result.after?.count,100,id+' did not persist after room transition');
  assert.equal(result.after?.complete,true,id+' lost trophy after room transition');
  report.push({id,room:initial.state.roomName,count:result.after.count,reward});
 }
 assert.equal(names.size,10,'personal worlds are not all distinctly identified');
 await page.setViewportSize({width:390,height:844});
 for(const [id] of HEROES){
  await page.evaluate(hero=>{
   const e=window.__OHANA_E2E;
   e.start(hero);e.setEvo(4);e.setInvulnerable(300);e.step(3);
  },id);
  assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).runtimeFaults,0,id+' mobile runtime fault');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' mobile horizontal overflow');
  await page.screenshot({path:'test-results/v457/'+id+'-final-mobile.png'});
 }
 assert.deepEqual(faults,[],'runtime browser exceptions');
 await fs.writeFile('test-results/v457/ten-hero-runtime.json',JSON.stringify(report,null,2));
 console.log('PASS V457: 10 personal rooms in actual Chromium + 1,000 real collection state transitions and trophies (not physical route access), room transition persistence, and 10 mobile final-form renders. No boss-clear or reachable-route claim.');
} finally {
 await browser?.close();
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
