// V475 campaign pilot: the real Chromium gameplay loop and keyboard input
// move Kilo across his four actual flower stations and through the earned
// east door. Stitcho's first part must be collected and delivered by walking.
// This is NOT a 10-room clear or a Quimera win: neither is claimed here.
// No setPlayer, loadRoom, grant, XP/HP cheats, or scripted seal completion.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { startServer } from './server.mjs';
import { WORLD1_ROOMS, WORLD1_FLOOR } from '../../systems/world1-rooms.js';

const server=await startServer(0); let browser;
try {
 browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const faults=[];
 page.on('pageerror',e=>faults.push(e.message));
 const root='http://127.0.0.1:'+server.address().port;
 await page.goto(root+'/?e2e=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__OHANA_E2E);
 const initial=await page.evaluate(()=>{
   localStorage.removeItem('ohana-w1-seals-v1');
   localStorage.removeItem('ohana-resume');
   const e=window.__OHANA_E2E;
   return e.startWorld1('kilo');
 });
 assert.equal(initial.roomId,'w1-kilo','start must use the genuine World 1 solo entry');
 assert.deepEqual(initial.world1Seals,[],'clean journey begins with no pre-earned seals');
 assert.equal(initial.world1?.done,0);
 assert.equal(initial.world1?.sealed,false);
 await page.locator('#game').focus();

 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
 const simulate=(frames)=>page.evaluate(n=>window.__OHANA_E2E.step(n),frames);
 async function finishCinema() {
   for(let i=0;i<8;i++){
     const s=await state();
     if(!s.world1Cine) return s;
     await simulate(600);
   }
   throw Error('A World 1 cinematic did not finish in 4800 simulation steps');
 }
 await finishCinema();

 const journal=[];
 async function walkTo(target,roomId,{exit=false}={}) {
   for (let attempt=0;attempt<110;attempt++) {
     await finishCinema();
     let s=await state();
     if(s.roomId!==roomId){
       if(exit) return s;
       throw Error('Unexpected room change while navigating '+roomId+' to '+target+': '+s.roomId);
     }
     if(!(s.hp>0))throw Error('Real hero died during unassisted walk: '+JSON.stringify({roomId,target,player:s.player,score:s.score}));
     let gap=target-(s.player.x+18);
     if(Math.abs(gap)<26 && !exit){
       await simulate(40); // release deceleration + timed puzzle hold
       s=await state();
       if(Math.abs(target-(s.player.x+18))<48)return s;
     }
     if(exit && s.player.x>s.worldW-180) {
       // Continue holding forward so that the real door threshold starts
       // its countdown; never call e.loadRoom or write world1Seals.
       await page.keyboard.down('d');
       s=await simulate(170);
       await page.keyboard.up('d');
       if(s.roomId!==roomId)return s;
     }
     const key=gap>0?'d':'a',other=gap>0?'a':'d';
     await page.keyboard.up(other);
     await page.keyboard.down(key);
     const frames= Math.max(2,Math.min(200,Math.floor((Math.abs(gap)-42)/6)));
     const before=s.player.x;
     s=await simulate(frames);
     await page.keyboard.up(key);
     await simulate(10);
     journal.push({room:roomId,target,at:Math.round(s.player?.x||0),hp:s.hp,seal:s.world1?.done});
     if(journal.length>260)journal.shift();
     if(Math.abs(s.player.x-before)<.3 && !s.world1Cine && frames>12)
       throw Error('Player physically stuck, no teleport allowed: '+JSON.stringify(journal.slice(-8)));
   }
   throw Error('Could not walk to '+target+' in '+roomId+': '+JSON.stringify(journal.slice(-10)));
 }

 const flowers=WORLD1_ROOMS['w1-kilo'].seal.stations;
 assert.equal(flowers.length,4);
 for(let i=0;i<flowers.length;i++){
   const s=await walkTo(flowers[i].x,'w1-kilo');
   assert.equal(s.world1?.done,i+1,'Kilo flower '+(i+1)+' must trigger from real grounded movement: '+JSON.stringify(journal.slice(-5)));
   assert.ok(s.hp>0,'Kilo must survive the full room, not use invulnerability');
   assert.equal(s.runtimeFaults,0);
 }
 await finishCinema();
 let after=await state();
 assert.equal(after.world1?.sealed,true);
 assert.deepEqual(after.world1Seals,['kilo'],'the four flowers must award one real seal');
 assert.ok(after.score>=600);
 await fs.mkdir('test-results/v475',{recursive:true});
 await page.screenshot({path:'test-results/v475/kilo-four-real-flowers.png'});

 // Cross the genuinely unlocked east door, including the in-game door timer.
 after=await walkTo(9640,'w1-kilo',{exit:true});
 for(let i=0;i<8&&after.roomId==='w1-kilo';i++)after=await simulate(50);
 assert.equal(after.roomId,'w1-stitcho','the actual right gate must lead from Kilo to Stitcho');
 assert.deepEqual(after.world1Seals,['kilo'],'walking to Stitcho must preserve the earned seal');
 assert.equal(after.world1?.done,0,'Stitcho starts unsolved');
 await finishCinema();

 // Collect and deliver the first real part. Its ID is zero, historically a
 // progression blocker: the test catches recurrence in a full game runtime.
 const first=WORLD1_ROOMS['w1-stitcho'].seal.stations[0];
 await walkTo(first.x,'w1-stitcho');
 const pickup=await state();
 assert.equal(pickup.world1?.done,0);
 const delivered=await walkTo(first.target.x,'w1-stitcho');
 assert.equal(delivered.world1?.done,1,'Stitcho physical delivery of item 0 failed');
 assert.deepEqual(delivered.world1Seals,['kilo'],'partial repair must not grant an extra seal');
 assert.equal(delivered.runtimeFaults,0);
 await page.screenshot({path:'test-results/v475/stitcho-part-zero-delivered.png'});
 assert.deepEqual(faults,[],'browser runtime errors');
 await fs.writeFile('test-results/v475/physical-campaign-pilot.json',JSON.stringify({
   earnedSeals:delivered.world1Seals,room:delivered.roomId,firstRepair:delivered.world1.done,
   input:'real keyboard physics',noTeleport:true,noInvulnerability:true,roomsVisited:2,fullCampaignCompleted:false,
   journal:journal.slice(-70), floor:WORLD1_FLOOR
 },null,2));
 console.log('PASS V475: unassisted real keyboard + collision traversal, all four Kilo flowers, earned east door, Stitcho part ID 0 delivery. NOT a complete 10-room campaign.');
} finally{
 await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
