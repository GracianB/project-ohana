// V700 acceptance: earn the first Pulso with real movement and combat.
// A fabricated save or direct station mutation would not prove the mechanic.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 await fs.mkdir('test-results/v700',{recursive:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 await page.clock.install({time:new Date('2026-11-11T12:00:00Z')});
 await page.clock.pauseAt(new Date('2026-11-11T12:00:01Z'));
 await page.evaluate(()=>{
  localStorage.clear();localStorage.setItem('ohana-difficulty','normal');
  window.__OHANA_E2E.setSeed(73);
  window.__OHANA_E2E.start('cat');
  window.__OHANA_E2E.loadRoom('w1-cat');
 });
 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
 const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return state();};
 async function films(){
  for(let i=0;i<24;i++){
   if(await page.locator('#evo-stage.show .evo-skip').count()){
    await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(400);continue;
   }
   if(!(await state()).world1Cine)break;
   await page.keyboard.press('Enter');await step(100);
  }
  await page.locator('#game').focus();
 }
 await films();let current=await step(5);
 assert.equal(current.hero,'cat');assert.equal(current.evo,0);
 assert.equal(current.ohanaPulse.level,0);assert.equal(current.ohanaPulse.ledges,0);
 const stations=await page.evaluate(async()=>(await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-cat'].seal.stations);
 let deaths=0;
 for(let i=0;i<500&&current.ohanaPulse.level<1;i++){
  if(current.hp<=0){
   assert.ok(++deaths<=6,'unexpected excessive deaths reaching first jellyfish');
   await page.evaluate(()=>window.__OHANA_E2E.respawn());await films();
   current=await step(40);
  }
  await films();current=await state();
  const station=stations[current.world1.done];if(!station)break;
  const p=current.player,dx=station.x-p.x-p.w/2;
  const foes=await page.evaluate(()=>window.__OHANA_E2E.roomCast());
  const near=foes.find(e=>e.hp>0&&Math.hypot(e.x+e.w/2-p.x-p.w/2,e.y+e.h/2-p.y-p.h/2)<400);
  if(Math.abs(dx)>24)await page.keyboard.down(dx>0?'d':'a');
  const jump=Math.abs(dx)<300&&(p.grounded||p.vy>=0&&p.jumps<p.maxJumps&&p.y+p.h>station.y+45);
  if(jump)await page.keyboard.down('w');
  if(near){await page.keyboard.press('h');await page.keyboard.press('j');}
  current=await step(Math.abs(dx)>24?Math.min(14,Math.max(1,Math.floor(Math.abs(dx)/7))):20);
  await page.keyboard.up('d');await page.keyboard.up('a');
  if(jump){await page.keyboard.up('w');current=await step(1);}
  assert.equal(current.runtimeFaults,0);
 }
 await films();current=await state();
 assert.ok(current.world1.done>=1,'Michi must actually rescue a jellyfish before Pulse');
 assert.equal(current.ohanaPulse.state,'resonant');
 assert.equal(current.ohanaPulse.level,current.world1.done,'Pulse follows only earned stations');
 assert.ok(current.ohanaPulse.ledges>=1,'rescued jelly must produce actual new solid platforms');
 assert.equal(current.world1Seals.length,0,'one jellyfish must not grant a seal');
 for(const [width,height]of[[1280,900],[390,844],[320,568]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(90);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'no overflow '+width);
  await page.screenshot({path:`test-results/v700/michi-pulse-${width}.png`});
 }
 assert.deepEqual(errors,[]);
 await fs.writeFile('test-results/v700/pulse.json',JSON.stringify({earnedStations:current.world1.done,
  pulse:current.ohanaPulse,deaths,realPlayerMovement:true,unmodifiedSave:true,errors},null,2));
 console.log('PASS V700 earned Pulso: physical jellyfish rescue, collision platforms, responsive viewports and no bonus seal');
}finally{
 await browser.close();server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
