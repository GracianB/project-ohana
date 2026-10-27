// Authentic first-instrument pilot. Native keyboard actions earn the caracola;
// no positions, health, XP/forms, enemies, notes or seals are granted.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
import {advanceKiloEncounterControls} from './kilo-encounter-controls-v606.mjs';

// Also used by the production-respawn audit: both tests earn the same real
// instrument before asking different questions about its resulting state.
export async function earnFirstKiloInstrument(page,root,{difficulty='easy'}={}){
 await page.clock.install({time:new Date('2026-10-27T12:00:00Z')});
 await page.clock.pauseAt(new Date('2026-10-27T12:00:01Z'));
 await page.goto(root+'/?e2e=1',{waitUntil:'load'});
 await page.waitForFunction(()=>!!window.__OHANA_E2E);
 await page.keyboard.press('Escape');
 await page.locator('#difficulty [data-diff="'+difficulty+'"]').click();
 const initial=await page.evaluate(()=>window.__OHANA_E2E.startWorld1('kilo'));
 assert.equal(initial.roomId,'w1-kilo');assert.equal(initial.world1.done,0);
 assert.deepEqual(initial.world1Seals,[]);assert.equal(initial.evo,0);
 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
 const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return state();};
 async function films(){
  for(let n=0;n<24;n++){
   if(await page.locator('#evo-stage.show .evo-skip').count()){
    await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(400);continue;
   }
   if(!(await state()).world1Cine)break;
   await page.keyboard.press('Enter');await step(100);
  }
  await page.locator('#game').focus();
 }
 let s=await step(600);await films();s=await state();const journal=[];
 for(let i=0;i<500&&s.world1.done<1;i++){
  assert.ok(s.hp>0,'first instrument must be reached alive with real '+difficulty+' combat');
  if(s.world1Cine||await page.locator('#evo-stage.show').count()){await films();s=await state();}
  s=await advanceKiloEncounterControls(page,s,step,i);
  if(i%10===0)journal.push({i,x:Math.round(s.player.x),hp:s.hp,xp:s.xp,done:s.world1.done,evo:s.evo});
  assert.equal(s.roomId,'w1-kilo');assert.equal(s.runtimeFaults,0);
 }
 assert.equal(s.world1.done,1,'the caracola must answer a real E/J action after combat');
 assert.equal(s.world1.sealed,false);assert.deepEqual(s.world1Seals,[]);
 assert.ok(s.hp>0);await films();s=await state();
 return {initial,earned:s,journal,difficulty};
}

async function main(){
 const server=await startServer(0);let browser;
 try{
  browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const result=await earnFirstKiloInstrument(page,'http://127.0.0.1:'+server.address().port);
  await fs.mkdir('test-results/v475',{recursive:true});
  await page.screenshot({path:'test-results/v475/kilo-first-authentic-note.png'});
  await fs.writeFile('test-results/v475/physical-campaign-pilot.json',JSON.stringify({...result,teleports:false,healthOrXpGranted:false,sealsGrantedByTests:0,completeCampaignVerified:false,errors},null,2));
  assert.deepEqual(errors,[]);
  console.log('PASS V475: authentic World 1 start, physical Easy combat/traversal, E/J caracola and locked seal; no progress grants');
 }finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
