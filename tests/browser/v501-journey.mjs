// Scope: keyboard connects all four antennas from a fixture-unlocked room.
// Real save/resume restores partial progress. Not a ten-room victory.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try {
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1440,height:900}}), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__OHANA_E2E);
 const traversal=await page.evaluate(async()=>{
  const {Portals,portalBlockReason}=await import('/systems/portals.js');
  const p={x:110,y:104,w:32,h:42,vx:2,vy:0,grounded:true,evo:4};
  const g={player:p,reduceMotion:true};const portal=new Portals();
  portal.spawnFromRoom({id:'space',portals:[{type:'blackhole',x:100,y:100,w:96,h:96,dest:'reef',label:'Arrecife'}]});
  for(let i=0;i<150;i++)portal.update(g);
  const passive={vx:p.vx,vy:p.vy,busy:portal.isBusy(),prompt:portal.prompt};
  const used=portal.tryUse(p,g),type=portal.charge?.type;
  const locked=new Portals();locked.spawnFromRoom({id:'w1-kilo',portals:[{type:'blackhole',x:100,y:100,w:96,h:96,dest:'hub',label:'Mundo 2 · en construcción',locked:true}]});
  locked.update(g);locked.tryUse(p,g);
  const catapult=new Portals();catapult.spawnFromRoom({id:'hub',portals:[{type:'catapult',x:100,y:130,w:96,h:32,dest:'beach',label:'Costa'}]});
  catapult.update(g);const catapultUsed=catapult.tryUse(p,g);
  return {passive,used,type,lockedBusy:locked.isBusy(),reason:portalBlockReason(locked.items[0],g),catapultUsed,catapultType:catapult.charge?.type};
 });
 assert.equal(traversal.passive.vx,2);assert.equal(traversal.passive.vy,0);
 assert.equal(traversal.passive.busy,false);assert.match(traversal.passive.prompt,/E · Vórtice/);
 assert.equal(traversal.used,true);assert.equal(traversal.type,'blackhole');
 assert.equal(traversal.lockedBusy,false);assert.match(traversal.reason,/construcción/);
 assert.equal(traversal.catapultUsed,true);assert.equal(traversal.catapultType,'catapult');
 await page.evaluate(()=>{
  localStorage.setItem('ohana-w1-seals-v1',JSON.stringify(['kilo','stitcho']));
  localStorage.setItem('ohana-difficulty','easy');
  window.__ohanaWorld1Start='w1-chispin';window.__OHANA_E2E.startWorld1('kilo');
 });
 const step=n=>page.evaluate(n=>window.__OHANA_E2E.step(n),n);
 let s=await step(600);assert.equal(s.roomId,'w1-chispin');assert.equal(s.evo,0);
 await page.locator('#game').focus();await page.keyboard.down('d');
 let previousX=s.player.x;
 for(let i=0;i<100&&s.world1.done===0;i++){
  // The V511 chapter has physical raised banks. Use ordinary jump controls
  // when a bank blocks horizontal travel, never injected state or teleport.
  if(s.player.grounded&&(i%7===0||Math.abs(s.player.x-previousX)<.4)){
   await page.keyboard.down('w');await step(4);await page.keyboard.up('w');
  }
  await page.keyboard.press('h');previousX=s.player.x;s=await step(24);
  assert.ok(s.hp>0,'first antenna route must not require an injected heal');
 }
 await page.keyboard.up('d');assert.ok(s.world1.done>=1,'real walking must connect an antenna');
 const earned=s.world1.done;
 if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.locator('#evo-stage.show').waitFor({state:'hidden',timeout:20000});await page.locator('#game').focus();}
 // Outwait the old seven-second reset without moving or modifying objectives.
 s=await step(600);assert.ok(s.world1.done>=earned);
 if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.locator('#evo-stage.show').waitFor({state:'hidden',timeout:20000});await page.locator('#game').focus();s=await step(5);}
 // Do not dismiss the notification before testing it: dismiss() clears
 // transient messages and races the persistent objective fallback.
 await page.waitForFunction(() => document.querySelector('#notification-container')?.textContent?.includes('Sello 1/4'),
   {timeout:10000});
 assert.match(await page.locator('#notification-container').innerText(),/Sello 1\/4.*Antena/s);
 assert.equal(await page.locator('#notification-container .game-notification').count(),1);
 // Teach the actual equipped power, and explain a locked power without listing every key.
 await page.keyboard.press('l');
 await page.waitForTimeout(250);
 assert.match(await page.locator('#notification-container').innerText(),/PODER POR DESCUBRIR/);
 await page.evaluate(async()=>{(await import('/systems/notify.js')).dismissNotifications();});
 await page.waitForTimeout(250);
 await page.keyboard.press('j');
 await page.waitForTimeout(250);
 const firstPower=await page.locator('.ability-slot[data-index="0"] .name').innerText();
 assert.ok((await page.locator('#notification-container').innerText()).includes(firstPower), await page.locator('#notification-container').innerText());
 await page.evaluate(async()=>{(await import('/systems/notify.js')).dismissNotifications();});
 await page.waitForTimeout(250);
 await fs.mkdir('test-results/v501',{recursive:true});
 await page.screenshot({path:'test-results/v501/antenna-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/v501/antenna-mobile.png'});
 await page.reload();await page.waitForFunction(()=>window.__OHANA_E2E);
 const restored=await page.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('kilo');return window.__OHANA_E2E.state();});
 assert.equal(restored.roomId,'w1-chispin');
 assert.ok(restored.world1.done>=earned,'Continue restores the earned antenna from the actual save');

 await page.setViewportSize({width:1440,height:900});
 s=await step(600);let deaths=0,lastX=s.player.x;
 const antennaX=[2160,3760,5360,7280]; // real authored station coordinates
 await page.locator('#game').focus();
 for(let i=0;i<500&&s.world1.done<4;i++){
  if(await page.locator('#evo-stage.show .evo-skip').count()){
   await page.locator('#evo-stage .evo-skip').click();
   await page.locator('#evo-stage.show').waitFor({state:'hidden',timeout:20000});
   await page.locator('#game').focus();
  }
  if(s.hp<=0){
   assert.ok(++deaths<=12,'too many natural retries on the antenna route');
   await page.keyboard.up('d');await page.keyboard.up('a');
   s=await page.evaluate(()=>window.__OHANA_E2E.respawn());
   await step(600);continue;
  }
  const target=antennaX[s.world1.done];
  const dx=target-(s.player.x+18);
  const dir=dx>=0?'d':'a',other=dx>=0?'a':'d';
  await page.keyboard.up(other);
  if(Math.abs(dx)>48)await page.keyboard.down(dir);else await page.keyboard.up(dir);
  if(s.player.grounded && (i%9===0 || Math.abs(s.player.x-lastX)<.7) && Math.abs(dx)>80){
   // Physics-driven jump at the V511 banks, never an injected position.
   await page.keyboard.down('w');await step(4);await page.keyboard.up('w');
  }
  if(Math.abs(dx)>90){
   await page.keyboard.press('h');await page.keyboard.press('j');
   if(s.evo>=2&&i%7===0)await page.keyboard.press('l');
  }
  lastX=s.player.x;
  s=await step(Math.abs(dx)<55?18:Math.max(5,Math.min(26,Math.floor(Math.abs(dx)/6))));
 }
 await page.keyboard.up('d');await page.keyboard.up('a');
 assert.equal(s.world1.done,4,'all four antennas must work through real movement and combat');
 assert.equal(s.world1.sealed,false,'four antennas require the chapter Titan before a new seal');assert.ok(!s.world1Seals.includes('chispin'));
 await page.screenshot({path:'test-results/v501/antenna-network-complete.png'});
 console.log('PHYSICAL NETWORK COMPLETE',JSON.stringify({deaths,evo:s.evo,hp:s.hp}));
 assert.deepEqual(errors,[]);
 console.log('PASS V501: voluntary vortex/catapult, locked route, four physical antennas, Titan still required, no timer reset, desktop/mobile render, partial progress restored by Continue.');
} finally {await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
