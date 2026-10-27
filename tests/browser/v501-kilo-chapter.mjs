// Extended physical Kilo pilot. The core V606 journey is independently gated;
// this adds earned optional sky chimes and real Continue persistence.
// No setPlayer, HP/XP/forms, enemy replacement or progress grants.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
import {advanceKiloEncounterControls} from './kilo-encounter-controls-v606.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-27T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-27T12:00:01Z'));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1',{waitUntil:'load'});
 await page.keyboard.press('Escape');await page.locator('#difficulty [data-diff="normal"]').click();
 await page.evaluate(()=>window.__OHANA_E2E.startWorld1('kilo'));
 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
 const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return state();};
 async function films(){for(let n=0;n<24;n++){
  if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(400);continue;}
  if(!(await state()).world1Cine)break;await page.keyboard.press('Enter');await step(100);
 }await page.locator('#game').focus();}
 let s=await step(600);await films();s=await state();
 let deaths=0,notesResumed=false,airResumed=false,guardianAttacks=0;
 const forms=new Set([s.evo]),milestones=[],guardianPhases=new Set();
 await fs.mkdir('test-results/v501',{recursive:true});
 for(let i=0;i<6000&&!s.world1.sealed;i++){
  if(s.hp<=0){assert.ok(++deaths<=8,'natural retry budget exhausted');await page.evaluate(()=>window.__OHANA_E2E.respawn());s=await step(120);}
  if(s.world1Cine||await page.locator('#evo-stage.show').count()){await films();s=await state();}
  forms.add(s.evo);
  const foes=await page.evaluate(()=>window.__OHANA_E2E.roomCast());
  for(const foe of foes)if(foe.guardian){guardianPhases.add(foe.guardian.phase);guardianAttacks=Math.max(guardianAttacks,foe.guardian.attacksExecuted||0);}
  const air=await page.evaluate(()=>window.__OHANA_E2E.kiloAirState()),chime=s.world1.done>=4?air.chimes.find(c=>!c.done):null;
  if(chime){
   if(s.kiloFlight.mode!=='solar')await page.keyboard.press('k');
   const p=s.player,dx=chime.x-(p.x+p.w/2),dy=chime.y-(p.y+p.h/2);
   if(Math.abs(dx)>15)await page.keyboard.down(dx>0?'d':'a');
   if(Math.abs(dy)>15)await page.keyboard.down(dy>0?'s':'w');
   const near=foes.find(e=>e.hp>0&&!e.miniBoss&&Math.hypot(e.x-p.x,e.y-p.y)<300);
   if(near){await page.keyboard.press('j');if(i%10===0)await page.keyboard.press('u');}
   s=await step(Math.max(1,Math.min(12,Math.floor(Math.max(Math.abs(dx),Math.abs(dy))/7))));
   for(const k of ['d','a','w','s'])await page.keyboard.up(k);
  }else{
   if(s.kiloFlight.mode==='solar')await page.keyboard.press('k');
   s=await advanceKiloEncounterControls(page,s,step,i);
  }
  if(s.world1.done>milestones.length){
   milestones.push({notes:s.world1.done,xp:s.xp,evo:s.evo,x:s.player.x});console.log('KILO INSTRUMENT',JSON.stringify(milestones.at(-1)));
   await films();s=await state();forms.add(s.evo);
   if(s.world1.done===2&&!notesResumed){
    await page.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('stitcho');});
    s=await step(600);await films();s=await state();assert.equal(s.hero,'kilo');assert.equal(s.world1.done,2);assert.ok(s.xp>=140);notesResumed=true;
   }
  }
  const earnedAir=await page.evaluate(()=>window.__OHANA_E2E.kiloAirState());
  if(!airResumed&&earnedAir.chimes.length===3&&earnedAir.chimes.every(c=>c.done)){
   await page.screenshot({path:'test-results/v501/kilo-air-trail-complete.png'});
   await page.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('kilo');});
   s=await step(600);await films();s=await state();
   assert.ok((await page.evaluate(()=>window.__OHANA_E2E.kiloAirState())).chimes.every(c=>c.done));
   assert.equal(s.kiloFlight.mode,null,'Continue returns with safe grounded control');assert.equal(s.evo,4);airResumed=true;
  }
  if(i%100===0)console.log('KILO EXTENDED',JSON.stringify({i,x:s.player.x,y:s.player.y,hp:s.hp,evo:s.evo,done:s.world1.done,chime:chime?.id}));
 }
 assert.equal(s.world1.done,4);assert.equal(s.evo,4);assert.equal(s.world1.sealed,true);assert.ok(s.world1Seals.includes('kilo'));
 assert.equal((await page.evaluate(()=>window.__OHANA_E2E.kiloAirState())).chimes.filter(c=>c.done).length,3);
 assert.equal((await page.evaluate(()=>window.__OHANA_E2E.roomCast())).some(e=>e.miniBoss&&e.hp>0),false);
 assert.deepEqual([...forms],[0,1,2,3,4]);assert.equal(notesResumed,true);assert.equal(airResumed,true);
 assert.ok(guardianPhases.has('warn'));assert.ok(guardianPhases.has('rest'));assert.ok(guardianAttacks>=5);
 assert.ok(milestones.every((m,i)=>m.xp>=[55,140,260,420][i]));
 await page.screenshot({path:'test-results/v501/kilo-chapter-complete.png'});
 await fs.writeFile('test-results/v501/kilo-chapter-pilot.json',JSON.stringify({deaths,forms:[...forms],guardianPhases:[...guardianPhases],guardianAttacks,airChimes:3,notesContinueVerified:notesResumed,airContinueVerified:airResumed,milestones,final:{hp:s.hp,evo:s.evo,sealed:s.world1.sealed},errors},null,2));
 assert.deepEqual(errors,[]);console.log('PASS extended Kilo: four instruments, five earned forms, optional solar chimes, Continue persistence, real Tambor and seal');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
