// Arena access/placement is a fixture; all three activations and wind movement use native input.
import assert from'node:assert/strict';import fs from'node:fs/promises';import{chromium}from'playwright';import{startServer}from'./server.mjs';import{selectFinalFighter}from'./final-ritual-controls.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'}),dir='test-results/v661',base=`http://127.0.0.1:${server.address().port}`;
try{await fs.mkdir(dir,{recursive:true});const errors=[],native=[];
 for(const[width,height]of[[1280,900],[390,844]]){
  const p=await browser.newPage({viewport:{width,height},hasTouch:width<500,isMobile:width<500});p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/?e2e=1');await p.locator('.oi-enter').click();
  await p.evaluate(async()=>{localStorage.clear();const{WORLD1_ORDER}=await import('/systems/world1-rooms.js');localStorage.setItem('ohana-w1-seals-v1',JSON.stringify(WORLD1_ORDER));localStorage.setItem('ohana-keepsakes-v1',JSON.stringify(WORLD1_ORDER));const e=window.__OHANA_E2E;e.startWorld1('kilo');e.manualClock(true);e.loadRoom('w1-final');e.setPlayer(7300,1000);e.step(5);});
  for(let i=0;i<25;i++){await selectFinalFighter(p,'kilo');await p.keyboard.press('Enter');const s=await p.evaluate(()=>{const e=window.__OHANA_E2E;e.setInvulnerable(600);return e.step(100);});if(s.boss&&!s.world1Cine&&!s.pendingWorld1Cine)break;}
  await p.evaluate(()=>window.__OHANA_E2E.step(300));
  for(const[id,x]of[['west',7650],['heart',9400],['east',11150]]){
   await p.evaluate(x=>{const e=window.__OHANA_E2E,s=e.state();e.setInvulnerable(600);e.setPlayer(x-s.player.w/2,1134-s.player.h);e.step(8);},x);assert.match(await p.locator('#prompt').textContent(),/^E/);
   if(width<500)await p.locator('#touch > .interact').tap();else await p.keyboard.press('e');
   const result=await p.evaluate(()=>{window.__OHANA_E2E.step(3);return{arena:window.__OHANA_E2E.quimeraArenaState(),game:window.__OHANA_E2E.state()};});
   if(id==='west')assert.ok(result.arena.shield>0);if(id==='heart')assert.ok(result.arena.pulse>0);if(id==='east'){assert.ok(result.arena.wind>0);const jumped=await p.evaluate(()=>window.__OHANA_E2E.step(9));assert.ok(jumped.player.y+jumped.player.h<1134-50);}
   native.push({width,id,steps:result.arena.platforms.length,shield:result.arena.shield,pulse:result.arena.pulse,wind:result.arena.wind});
  }
  assert.equal((await p.evaluate(()=>window.__OHANA_E2E.quimeraArenaState())).platforms.length,9);await p.screenshot({path:`${dir}/wind-${width}.png`});await p.close();
 }
 const p=await browser.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/previews/quimera-design.html');await p.waitForFunction(()=>window.previewReady);
 for(const id of['west','heart','east']){await p.selectOption('#device',id);await p.locator('#prism').click();await p.waitForTimeout(150);await p.screenshot({path:`${dir}/prism-${id}.png`});}
 await p.locator('#replay').click();await p.waitForFunction(()=>Number(document.querySelector('canvas').dataset.referenceX)>=7000);assert.ok(Number(await p.locator('canvas').getAttribute('data-boss-x'))>8100&&Number(await p.locator('canvas').getAttribute('data-boss-x'))<8300);for(let i=0;i<3;i++){await p.locator('#star').click();await p.waitForTimeout(80);}await p.waitForFunction(()=>Number(document.querySelector('canvas').dataset.shield)>0);assert.equal(await p.locator('canvas').getAttribute('data-constellation'),'0');await p.screenshot({path:`${dir}/constellation.png`});
 await p.selectOption('#pose','warn');await p.selectOption('#phase','4');await p.screenshot({path:`${dir}/quimera-anticipation.png`});
 assert.deepEqual(errors,[]);await fs.writeFile(`${dir}/validation.json`,JSON.stringify({native,studioConstellation:true,errors,scope:'Synthetic access/starting positions; native keyboard/touch prism activation and actual wind movement. Studio stars are preview fixtures, not campaign grants.'},null,2));console.log('PASS V661: three distinct prism effects, keyboard/touch activations, real wind launch, nine saved steps and preview constellation');
}finally{await browser.close();server.closeAllConnections();server.close();}
