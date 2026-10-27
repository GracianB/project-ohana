// Physical acceptance pilot for the authored Claro. No teleports, injected
// health, XP/forms, enemy replacement, seal writes or objective grants.
// OHANA_KILO_SMOKE=1 stops after the first genuinely played instrument.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
import {advanceKiloEncounterControls} from './kilo-encounter-controls-v606.mjs';
const server=await startServer(0),smoke=process.env.OHANA_KILO_SMOKE==='1';
const targetInstruments=smoke?1:4,art='test-results/v606';
let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await fs.mkdir(art,{recursive:true});
 await page.clock.install({time:new Date('2026-10-27T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-27T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`,{waitUntil:'load'});
 await page.waitForFunction(()=>window.__OHANA_E2E);await page.keyboard.press('Escape');
 await page.locator('#difficulty [data-diff="normal"]').click();
 const stations=await page.evaluate(async()=>{
  window.__OHANA_E2E.startWorld1('kilo');
  return (await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-kilo'].seal.stations;
 });
 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
 const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return state();};
 const press=k=>page.keyboard.press(k),hold=k=>page.keyboard.down(k),release=k=>page.keyboard.up(k);
 async function films(){
  for(let n=0;n<24;n++){
   if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(400);continue;}
   const s=await state();if(!s.world1Cine)break;await press('Enter');await step(100);
  }
  await page.locator('#game').focus();
 }
 let s=await step(600);await films();s=await state();assert.equal(s.roomId,'w1-kilo');assert.equal(s.evo,0);
 assert.equal(stations.length,4);assert.ok(stations[3].x-stations[0].x>8500,'growth is spread through the real route');
 const milestones=[],forms=new Set([0]),guardianPhases=new Set(),guardianPatterns=new Set(),journal=[];
 let deaths=0,minimumHp=s.hp,minimumHealthRatio=s.hp/s.maxHealth,guardianAttacks=0,iterations=0,previousDone=0;
 const bossCaptures=new Set();
 const capture=async name=>{await page.clock.runFor(34);await page.screenshot({path:`${art}/${name}.png`});};
 await capture('kilo-v606-opening-route');
 for(let i=0;i<(smoke?1400:6000);i++){
  iterations=i;
  if(s.hp<=0){
   journal.push({event:'death',i,x:s.player.x,done:s.world1.done,evo:s.evo});
   assert.ok(++deaths<=12,'natural retry budget exhausted; inspect the recorded route');
   await page.evaluate(()=>window.__OHANA_E2E.respawn());s=await step(120);await films();s=await state();
  }
  if(s.world1Cine||await page.locator('#evo-stage.show').count()){await films();s=await state();}
  assert.equal(s.runtimeFaults,0);forms.add(s.evo);minimumHp=Math.min(minimumHp,s.hp);minimumHealthRatio=Math.min(minimumHealthRatio,s.hp/s.maxHealth);
  const cast=await page.evaluate(()=>window.__OHANA_E2E.roomCast()),boss=cast.find(e=>e.guardian&&e.hp>0),b=boss?.guardian,p=s.player;
  if(b){guardianPhases.add(b.phase);guardianAttacks=Math.max(guardianAttacks,b.attacksExecuted||0);if(b.phase==='strike')guardianPatterns.add(b.pattern);}
  const bossCapture=b?.phase==='warn'&&b.pattern===1?'charge-warning':b?.phase==='rest'?'rest':null;
  if(bossCapture&&!bossCaptures.has(bossCapture)){
   bossCaptures.add(bossCapture);
   // Capture the observed game without advancing time or preparing the boss.
   await page.screenshot({path:`${art}/kilo-v606-guardian-${bossCapture}.png`});
  }
  const near=cast.filter(e=>!e.miniBoss&&e.hp>0&&Math.hypot(e.x+e.w/2-(p.x+p.w/2),e.y+e.h/2-(p.y+p.h/2))<365).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
  s=await advanceKiloEncounterControls(page,s,step,i);
  if(s.world1.done>previousDone){
   previousDone=s.world1.done;milestones.push({instrument:s.world1.done,x:Math.round(s.player.x),xp:s.xp,evo:s.evo,hp:s.hp,frame:s.platformDrop?.t,iteration:i});
   console.log('KILO V606 INSTRUMENT',JSON.stringify(milestones.at(-1)));await films();s=await state();forms.add(s.evo);
   const nearby=await page.evaluate(()=>{const e=window.__OHANA_E2E,s=e.state(),p=s.player;return e.roomCast().some(f=>f.hp>0&&Math.hypot(f.x+f.w/2-p.x-p.w/2,f.y+f.h/2-p.y-p.h/2)<500);});
   if(!nearby)s=await step(120); // Let earned text settle only in a genuinely clear area.
   await capture(`kilo-v606-instrument-${previousDone}`);
  }
  if(i%100===0){console.log('KILO V606 ROUTE',JSON.stringify({i,x:Math.round(s.player.x),y:Math.round(s.player.y),hp:s.hp,evo:s.evo,done:s.world1.done,xp:s.xp,nearest:near?.persona,foeHp:near?.hp,phase:b?.phase,bossHp:boss?.hp}));await capture('kilo-v606-current');await fs.writeFile(`${art}/kilo-v606-current.json`,JSON.stringify({s,cast,milestones,deaths},null,2));}
  assert.ok(s.evo<=s.world1.done,'XP alone must not bypass the current instrument');
  if(smoke&&s.world1.done>=targetInstruments)break;
  if(!smoke&&s.world1.sealed)break;
 }
 const finalCast=await page.evaluate(()=>window.__OHANA_E2E.roomCast());
 const result={mode:smoke?'first-instrument-smoke':'full-physical-chapter',difficulty:'normal',deaths,minimumHp,minimumHealthRatio,iterations,forms:[...forms],milestones,guardianPhases:[...guardianPhases],guardianPatterns:[...guardianPatterns],guardianAttacks,journal,final:{done:s.world1.done,evo:s.evo,hp:s.hp,x:s.player.x,sealed:s.world1.sealed,bossAlive:finalCast.some(e=>e.guardian&&e.hp>0)},errors};
 await fs.writeFile(`${art}/kilo-v606-${smoke?'smoke':'journey'}.json`,JSON.stringify(result,null,2));await capture(smoke?'kilo-v606-smoke-complete':'kilo-v606-journey-complete');
 assert.ok(s.world1.done>=targetInstruments,'physical pilot must earn its instrument targets');assert.deepEqual(errors,[]);
 if(!smoke){assert.equal(s.world1.sealed,true);assert.equal(s.evo,4);assert.deepEqual([...forms],[0,1,2,3,4]);assert.ok(guardianAttacks>=5);assert.deepEqual([...guardianPatterns].sort(),[0,1,2]);assert.equal(result.final.bossAlive,false);assert.ok(bossCaptures.has('charge-warning'));assert.ok(bossCaptures.has('rest'));await page.context().storageState({path:`${art}/earned-kilo-v606-storage.json`});}
 console.log('PASS Kilo V606 '+result.mode+': physical controls only, '+milestones.length+' instruments, '+deaths+' natural deaths; this does not certify human difficulty balance');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
