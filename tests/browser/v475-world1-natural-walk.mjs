// V475 campaign pilot: the real Chromium gameplay loop and keyboard input
// reach Kilo's first physical flower without teleporting, invulnerability
// or granting progress. Full combat-capable campaign traversal remains open.
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
   // Use the actual selectable Easy difficulty, not an E2E HP or enemy hack.
   // Normal mode is deliberately NOT claimed by this beginner-route pilot.
   localStorage.setItem('ohana-difficulty','easy');
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
   for (let attempt=0;attempt<220;attempt++) {
     await finishCinema();
     let s=await state();
     if(s.roomId!==roomId){
       if(exit) return s;
       throw Error('Unexpected room change while navigating '+roomId+' to '+target+': '+s.roomId);
     }
     if(!(s.hp>0))throw Error('Real hero died during unassisted walk: '+JSON.stringify({roomId,target,player:s.player,score:s.score}));
     let gap=target-(s.player.x+18);
     // Genuine keyboard combat/defense. The first pilot died near Kilo's
     // fourth flower because it blindly walked through eight enemies.
     // Here the player attacks and jumps, without touching HP or enemy state.
     if (gap>0 && s.player.grounded) {
       const foe=await page.evaluate(()=>window.__OHANA_E2E.roomCast()
         .filter(f=>f.hp>0&&!f.miniBoss).map(f=>({x:f.x,y:f.y,w:f.w,h:f.h})));
       const ahead=foe.filter(f=>f.x>s.player.x-10 && f.x<s.player.x+320).sort((a,b)=>a.x-b.x)[0];
       if(ahead && ahead.x-s.player.x<260) {
         await page.keyboard.down('w');
         await simulate(3);
         await page.keyboard.up('w');
         await page.keyboard.down('h');
         await simulate(2);
         await page.keyboard.up('h');
         s=await state();
         gap=target-(s.player.x+18);
       }
     }
     if(Math.abs(gap)<26 && !exit){
       // A jump used to dodge foes may still be descending at this waypoint.
       // Kilo's serenade requires 45 grounded and stationary simulation ticks:
       // do not return early while airborne, even if X is already aligned.
       await simulate(110);
       s=await state();
       if(Math.abs(target-(s.player.x+18))<48 && s.player.grounded)return s;
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
     const frames= Math.max(2,Math.min(95,Math.floor((Math.abs(gap)-42)/6)));
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

 // The first independent acceptance stage: a real grounded note, never
 // a synthetic progress grant. Full ten-room E2E remains explicitly open.
 const flowers=WORLD1_ROOMS['w1-kilo'].seal.stations;
 assert.equal(flowers.length,4);
 const first=await walkTo(flowers[0].x,'w1-kilo');
 assert.equal(first.world1?.done,1,
   'one Kilo flower must actually sing after 45 grounded ticks: '+JSON.stringify(journal.slice(-8)));
 assert.equal(first.world1?.sealed,false,'one flower cannot grant Kilo a seal');
 assert.deepEqual(first.world1Seals,[],'progress was not granted by the harness');
 assert.ok(first.hp>0,'the player must arrive alive on real Easy difficulty');
 assert.equal(first.runtimeFaults,0,'no browser runtime exceptions during physical travel');
 await fs.mkdir('test-results/v475',{recursive:true});
 await page.screenshot({path:'test-results/v475/kilo-first-authentic-note.png'});
 await fs.writeFile('test-results/v475/physical-campaign-pilot.json',JSON.stringify({
   startedAt:'w1-kilo',firstFlower:{x:flowers[0].x,completed:first.world1.done===1},
   earnedSeals:first.world1Seals,health:first.hp,difficulty:'easy',
   movement:'keyboard physics',teleports:false,invulnerability:false,
   sealsGrantedByTests:0,roomsPhysicallyCompleted:0,
   completeCampaignVerified:false,quimeraDefeated:false,
   journal:journal.slice(-50),floor:WORLD1_FLOOR
 },null,2));
 assert.deepEqual(faults,[],'browser runtime errors');
 console.log('PASS V475: authentic solo World 1 startup, real keyboard walk, first 45-tick Kilo flower and locked seal. Full campaign NOT claimed.');
} finally{
 await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
