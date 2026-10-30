// Only direct chapter access is a fixture: walls and jumps use actual inputs.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);const report=[];
 for(const hero of ['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi']){
  const {bank,solidBank}=await page.evaluate(hero=>{localStorage.clear();const e=window.__OHANA_E2E;e.startWorld1(hero);e.loadRoom('w1-'+hero);e.step(600);e.setInvulnerable(600);const bank=e.roomTraversal().terraces[0];const solidBank=e.foeBoxes().platforms.some(p=>p.x===bank.x&&p.y===bank.y&&p.w===bank.w&&p.h>24);return {bank,solidBank};},hero);await page.locator('#game').focus();
  await page.keyboard.down('d');await page.evaluate(()=>window.__OHANA_E2E.step(360));
  const blocked=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(blocked.roomId,'w1-'+hero,hero+' remains in its authored room');if(solidBank){assert.ok(blocked.player.x+blocked.player.w<=bank.x+1,hero+' cannot walk through the solid bank');assert.ok(blocked.player.x+blocked.player.w>bank.x-10,hero+' reaches its real face');}
  await page.keyboard.down('w');await page.evaluate(()=>window.__OHANA_E2E.step(16));await page.keyboard.up('w');await page.evaluate(()=>window.__OHANA_E2E.step(80));await page.keyboard.up('d');
  const after=await page.evaluate(()=>window.__OHANA_E2E.state());if(solidBank)assert.ok(after.player.x>bank.x+bank.w,hero+' crosses the solid bank with an ordinary jump');assert.ok(after.hp>0);assert.equal(after.runtimeFaults,0,hero+' room physics remain stable');report.push({hero,bank,solidBank,walkedX:blocked.player.x,crossedX:after.player.x});
 }
 // One shared touch control is held with actual Chromium touch input.
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),phone=await mobile.newPage();
 await phone.clock.install({time:new Date('2026-10-25T12:00:00Z')});await phone.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await phone.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);const bank=await phone.evaluate(()=>{localStorage.clear();const e=window.__OHANA_E2E;e.startWorld1('kilo');e.loadRoom('w1-kilo');e.step(600);e.setInvulnerable(600);return e.roomTraversal().terraces[0];});
 await phone.locator('#game').focus();await phone.keyboard.down('d');await phone.evaluate(()=>window.__OHANA_E2E.step(360));
 const button=await phone.locator('.touch-btn.jump').boundingBox(),cdp=await mobile.newCDPSession(phone);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:button.x+button.width/2,y:button.y+button.height/2}]});await phone.evaluate(()=>window.__OHANA_E2E.step(16));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await phone.evaluate(()=>window.__OHANA_E2E.step(80));await phone.keyboard.up('d');assert.ok((await phone.evaluate(()=>window.__OHANA_E2E.state())).player.x>bank.x+bank.w);
 await mobile.close();assert.deepEqual(errors,[]);await fs.mkdir('test-results/v511',{recursive:true});await fs.writeFile('test-results/v511/terrain-traversal.json',JSON.stringify({rooms:report,mobileHeldJump:true},null,2));console.log('PASS ten authored terrains match their actual collision geometry; Kilo solid bank and shared touch jump work');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
