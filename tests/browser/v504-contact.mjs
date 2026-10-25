// Explicit sleeping campaign-foe fixture isolates real body collisions from AI
// timing. It does not claim an earned encounter victory or full playthrough.
import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage();await page.clock.install();await page.clock.pauseAt(Date.now());
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.startWorld1('kilo');e.step(600);});
 for(let i=0;i<12&&(await page.evaluate(()=>window.__OHANA_E2E.state().world1Cine));i++){await page.keyboard.press('Enter');await page.evaluate(()=>window.__OHANA_E2E.step(120));}
 const stomp=await page.evaluate(()=>{
  const e=window.__OHANA_E2E,f=e.campaignContactTarget(),p=e.state().player,hp=e.state().hp;
  e.setPlayer(f.x+5,f.y-p.h-7);e.setPlayerVelocity(0,9);e.step(2);
  return {hp,before:f.hp,after:e.roomCast()[0].hp,state:e.state()};
 });
 assert.ok(stomp.after<stomp.before,'falling onto a campaign foe deals real damage');
 assert.ok(stomp.state.player.vy<0,'stomp rebounds');assert.equal(stomp.state.hp,stomp.hp,'stomp does not also count as a side hit');
 const side=await page.evaluate(()=>{const e=window.__OHANA_E2E,f=e.campaignContactTarget(),p=e.state().player,hp=e.state().hp;e.setPlayer(f.x-5,1134-p.h);return {hp,state:e.state()};});
 assert.ok(side.state.hp<side.hp,'touching a sleeping enemy still hurts without an attack');
 const rings=await page.evaluate(async()=>{
  const e=window.__OHANA_E2E;e.start('kilo');e.loadRoom('w1-kilo');e.step(600);e.setEvo(4);e.campaignContactTarget();
  return (await import('/systems/kilo-chapter.js')).KILO_SKY_RINGS;
 });
 await page.setViewportSize({width:1440,height:900});await page.locator('#game').focus();
 let initialXP=0;
 for(let i=0;i<rings.length;i++){
  await page.evaluate(r=>{const e=window.__OHANA_E2E,p=e.state().player;e.setPlayer(r.x-100,r.y-p.h/2);},rings[i]);
  if(i===0){initialXP=(await page.evaluate(()=>window.__OHANA_E2E.state())).xp;await page.keyboard.press('k');}
  await page.keyboard.down('d');await page.evaluate(()=>window.__OHANA_E2E.step(28));await page.keyboard.up('d');
  assert.equal((await page.evaluate(()=>window.__OHANA_E2E.kiloAirState())).skyRings.filter(r=>r.done).length,i+1);
  if(i===2){await page.clock.runFor(32);await fs.mkdir('test-results/v504',{recursive:true});await page.screenshot({path:'test-results/v504/kilo-sky-route.png'});}
 }
 assert.ok((await page.evaluate(()=>window.__OHANA_E2E.state())).xp>=initialXP+40);
 console.log('PASS five sky rings collected through real flight input; position/form/isolated-foe access fixtures');
 console.log('PASS campaign foe stomp, rebound, safe top landing and idle side-contact damage');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
