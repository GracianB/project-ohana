// Scene/form/camera fixtures inspect art and terrain; no victories are granted.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await fs.mkdir('test-results/v511',{recursive:true});
 const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
 await phone.clock.install({time:new Date('2026-10-25T12:00:00Z')});await phone.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));await phone.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);

 const report=[];
 for(const hero of ['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi']){
  await page.setViewportSize({width:1440,height:900});
  const route=await page.evaluate(hero=>{localStorage.clear();const e=window.__OHANA_E2E;e.startWorld1(hero);e.loadRoom('w1-'+hero);e.step(600);e.setEvo(2);e.setInvulnerable(600);return e.roomTraversal();},hero);
  assert.ok(route.terraces.length>=2);assert.ok(route.nooks.length>=1);
  for(const [label,x] of [['arrival',route.terraces[0].x-200],['route',route.nooks[0].x-210]]){
   await page.evaluate(x=>{const e=window.__OHANA_E2E;e.setPlayer(x,800);e.setInvulnerable(600);e.step(100);},x);await page.clock.runFor(160);
   const s=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(s.runtimeFaults,0);assert.ok(s.player.y+s.player.h<=1134.1);
   await page.evaluate(()=>window.__OHANA_E2E.setInvulnerable(0));await page.clock.runFor(16);await page.screenshot({path:`test-results/v511/${hero}-${label}.png`});
  }
  await phone.evaluate(({hero,x})=>{localStorage.clear();const e=window.__OHANA_E2E;e.startWorld1(hero);e.loadRoom('w1-'+hero);e.step(600);e.setEvo(2);e.setInvulnerable(600);e.setPlayer(x,800);e.step(100);},{hero,x:route.nooks[0].x-210});await phone.clock.runFor(160);await phone.evaluate(()=>window.__OHANA_E2E.setInvulnerable(0));await phone.clock.runFor(16);
  assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await phone.screenshot({path:`test-results/v511/${hero}-mobile.png`});report.push({hero,terraces:route.terraces.length,nooks:route.nooks.length,scene:route.composition});console.log('ROOM PRESENTATION PASS '+hero);
 }
 assert.deepEqual(errors,[]);await fs.writeFile('test-results/v511/ten-room-presentation.json',JSON.stringify(report,null,2));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
