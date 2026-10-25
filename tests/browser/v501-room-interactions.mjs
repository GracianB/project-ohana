// Previous seals are access fixtures. Movement, pickups and delivery use real
// keyboard input and production physics, without teleporting or healing.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 // Pause automatic time between actions so browser/tool latency cannot move
 // the character or finish a flight between two assertions. Production step
 // and collision still run; no position, health or objective is injected.
 await page.clock.install({time:new Date('2026-10-24T12:00:00Z')});
 await page.clock.pauseAt(new Date('2026-10-24T12:00:01Z'));
 const step=async n=>{
  await page.evaluate(n=>window.__OHANA_E2E.step(n),n);
  await page.clock.runFor(16);
  // A truly earned evolution pauses the game and intentionally hides the
  // objective card. Resume through the actual UI before movement continues.
  for(let k=0;k<10;k++){
   const cine=page.locator('#evo-stage.show');
   if(!(await cine.count()))break;
   await cine.locator('.evo-skip').click();
   // Playwright's virtual clock is paused in this suite. The Continue
   // button marks the cinematic to close on an animation frame, so let
   // that real renderer frame run before checking visibility.
   for(let frames=0;frames<6&&await cine.count();frames++)await page.clock.runFor(350);
   assert.equal(await cine.count(),0,'Continue must close the earned evolution cinematic');
  }
  return page.evaluate(()=>window.__OHANA_E2E.state());
 };
 const objective=()=>page.evaluate(async()=>(await import('/systems/notify.js')).messageManager.objective);
 async function begin(hero){
  await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1',{waitUntil:'load'});
  assert.ok(await page.evaluate(()=>!!window.__OHANA_E2E));
  // Every per-hero fixture starts a fresh page. Close the actual opening
  // modal; it hides #notification-container while it owns the screen.
  if(await page.locator('#ohana-intro.show').count()){
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>!document.body.classList.contains('intro-pending'));
  }
  const data=await page.evaluate(async hero=>{
   const {WORLD1_ORDER,WORLD1_ROOMS}=await import('/systems/world1-rooms.js');
   localStorage.clear();localStorage.setItem('ohana-w1-seals-v1',JSON.stringify(WORLD1_ORDER.slice(0,WORLD1_ORDER.indexOf(hero))));
   localStorage.setItem('ohana-difficulty','easy');
   window.__ohanaWorld1Start='w1-'+hero;window.__OHANA_E2E.startWorld1(hero);
   return WORLD1_ROOMS['w1-'+hero].seal.stations;
  },hero);
  await step(600);await page.locator('#game').focus();return data;
 }
 async function approach(x,done){
  let state=await step(1),lastX=state.player.x;
  for(let n=0;n<400&&!await done(state);n++){
   assert.ok(state.hp>0,'route must not require injected healing or a death bypass');
   const dx=x-state.player.x-state.player.w/2;
   await page.keyboard.up('d');await page.keyboard.up('a');
   if(Math.abs(dx)>18)await page.keyboard.down(dx>0?'d':'a');
   if(Math.abs(dx)<100 && state.player.grounded && state.player.y<1000)await page.keyboard.down('s');else await page.keyboard.up('s');
   await page.keyboard.press('h');await page.keyboard.press('j');
   // V511 adds 48px terrace banks. Space taps were not a reliable
   // physical jump; hold the real W key long enough to cross the ledge.
   if(Math.abs(state.player.x-lastX)<1&&Math.abs(dx)>60&&state.player.grounded){
     await page.keyboard.down('w');await step(4);await page.keyboard.up('w');
   }
   lastX=state.player.x;state=await step(8);
  }
  await page.keyboard.up('d');await page.keyboard.up('a');await page.keyboard.up('s');
  assert.ok(await done(state),'interaction not reached: '+JSON.stringify({state,objective:await objective(),target:x}));
  return state;
 }
 await fs.mkdir('test-results/v501',{recursive:true});
 const frita=await begin('frita');
 await approach(frita[0].x,async()=>/Patata dorada/.test(await objective()));
 assert.match(await objective(),/Patata dorada: Dirige el vuelo/);
 await page.evaluate(async()=>{(await import('/systems/notify.js')).dismissNotifications();});
 await page.screenshot({path:'test-results/v501/frita-flight.png'});
 let state=await step(1),minY=state.player.y,launches=0,corrections=0,lastSteeredLaunch=-1;
 const telemetry=[];
 // A real geyser is a trajectory, not a fixed upward animation. The old pilot
 // ran only 120 single ticks and NEVER pressed Frita's actual airborne J
 // correction. If a flight misses, walk back and take the next timed vent.
 for(let i=0;i<760&&state.world1.done===0;i++){
  const flyer=await page.evaluate(()=>window.__OHANA_E2E.fryerAstralState());
  if(i%30===0)telemetry.push({i,x:Math.round(state.player.x),y:Math.round(state.player.y),vy:Math.round(state.player.vy*10)/10,
    airborne:!state.player.grounded,launched:flyer.launched,corrections:flyer.corrections,done:state.world1.done});
  minY=Math.min(minY,state.player.y);
  launches=Math.max(launches,Number(flyer.launches)||0);
  corrections=Math.max(corrections,Number(flyer.corrections)||0);
  const flying=flyer.launched===frita[0].id&&!state.player.grounded;
  const goal=flying?frita[0].prize.x:frita[0].x;
  const dx=goal-state.player.x-state.player.w/2;
  await page.keyboard.up('a');await page.keyboard.up('d');
  if(Math.abs(dx)>(flying?9:22))await page.keyboard.down(dx>0?'d':'a');
  if(flying&&lastSteeredLaunch!==flyer.launches){await page.keyboard.press('j');lastSteeredLaunch=flyer.launches;} // earned aerial correction
  // Geyser readiness is managed by the real game clock, not by this pilot.
  state=await step(Math.abs(dx)>40?5:2);
 }
 await page.keyboard.up('a');await page.keyboard.up('d');
 console.log('FRITA TRAJECTORY',JSON.stringify({minY,prizeY:frita[0].prize.y,done:state.world1.done,
   launches,corrections,telemetry:telemetry.slice(-18)}));
 assert.ok(state.world1.done>=1,'first golden potato must be reachable through real launch and J steering');
 console.log('PHYSICAL FRITA FIRST PRIZE',JSON.stringify({hp:state.hp,done:state.world1.done,evo:state.evo}));
 const stitcho=await begin('stitcho');
 await approach(stitcho[0].x,async()=>/Taller de la pieza 1/.test(await objective()));
 await page.screenshot({path:'test-results/v501/stitcho-carry.png'});
 await approach(stitcho[0].target.x,s=>s.world1.done>=1);
 console.log('PHYSICAL STITCHO FIRST REPAIR');
 const yomi=await begin('yomi');
 await approach(yomi[0].x,s=>s.player.x>yomi[0].x-150);
 await page.screenshot({path:'test-results/v501/yomi-terminal.png'});
 await approach(yomi[0].x,s=>s.world1.done>=1);
 console.log('PHYSICAL YOMI FIRST CONNECTION');
 const pizza=await begin('pizza');
 await approach(pizza[0].x,async()=>/Cliente esperando/.test(await objective()));
 assert.match(await objective(),/quedan [1-9]\d* s/);
 // A real pickup may put an earned evolutionary/tutorial toast ahead of the
 // persistent objective. The original pilot forcibly dismissed it and then
 // tried to assert the fallback before the message queue settled.
 // Allow the real timed announcement to expire, leaving the still-hot order
 // visible without forcing the UI into any artificial state.
 await page.clock.runFor(5400);
 await step(1);
 const goalCard=page.locator('#notification-container .game-notification[data-persistent="1"]');
 // The help HUD is hidden by authored intro/evolution scenes. Clear any
 // scene only through the player-facing controls and wait for a visible card.
 for(let n=0;n<14;n++){
   if(await goalCard.isVisible())break;
   const cine=page.locator('#evo-stage.show .evo-skip');
   if(await cine.count()){await cine.click();await page.clock.runFor(450);}
   if(await page.locator('#ohana-intro.show').count())await page.keyboard.press('Escape');
   await page.clock.runFor(250);
 }
 const hud=await page.evaluate(async()=>{
   const {messageManager:manager}=await import('/systems/notify.js');
   const e=document.querySelector('#notification-container'),card=e?.querySelector('[data-persistent="1"]');
   return {body:document.body.className,rootClass:e?.className,rootHTML:e?.innerHTML?.slice(0,900),
      cardClass:card?.className,text:card?.textContent,rendered:card?.innerText,
      rootVisibility:e?getComputedStyle(e).visibility:null,
      cardVisibility:card?getComputedStyle(card).visibility:null,
      objective:manager.objective,current:manager.current?.key,currentType:manager.current?.type,
      activeTimer:!!manager.timer,game:window.__OHANA_E2E.state().world1,
      overlays:[...document.querySelectorAll('[role="dialog"]')].filter(x=>getComputedStyle(x).display!=='none').map(x=>({id:x.id,cls:x.className})).slice(0,7)};
 });
 assert.equal(hud.cardVisibility,'visible','earned Pizza delivery objective must remain visible: '+JSON.stringify(hud));
 const box=await goalCard.boundingBox();assert.ok(box&&box.y>=150&&box.y<210,'goal should stay in the notice area: '+JSON.stringify(hud));
 assert.equal(await goalCard.evaluate(el=>getComputedStyle(el).animationName),'none');
 assert.match(await goalCard.innerText(),/quedan [1-9]\d* s/,'Pizza heat must be readable: '+JSON.stringify(hud));
 await page.screenshot({path:'test-results/v501/pizza-heat.png'});
 await approach(pizza[1].x,s=>s.world1.done>=1);
 console.log('PHYSICAL PIZZA FIRST HOT DELIVERY');
 assert.deepEqual(errors,[]);
 console.log('PASS V501 rooms: real Frita launch/prize, Stitcho piece-zero pickup/delivery, Yomi connection and hot Pizza delivery; previous seals are access fixtures.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
