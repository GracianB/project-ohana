// Direct chapter entry is an access fixture. Movement and E use native input.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:'/usr/bin/chromium'});
try{
 for(const width of [320,390]){
  const context=await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await p.waitForFunction(()=>window.__OHANA_E2E);
  await p.evaluate(()=>{const e=window.__OHANA_E2E;e.manualClock();e.startWorld1('cat');e.step(900);});await p.locator('#game').focus();
  for(let i=0;i<80;i++){
   const state=await p.evaluate(()=>window.__OHANA_E2E.state()),dx=4030-state.player.x-state.player.w/2;
   if(Math.abs(dx)<18)break;
   const key=dx>0?'d':'a';await p.keyboard.down(key);await p.evaluate(()=>window.__OHANA_E2E.step(4));await p.keyboard.up(key);
  }
  await p.evaluate(()=>window.__OHANA_E2E.step(3));
  assert.ok(await p.locator('#prompt[data-touch-interact]').isVisible(),'real moment exposes an actionable prompt');
  const button=p.locator('#touch > .interact');assert.ok(await button.isVisible(),'E is accessible outside the power drawer');await button.tap();await p.evaluate(()=>window.__OHANA_E2E.step(3));
  const save=await p.evaluate(()=>JSON.parse(localStorage.getItem('ohana')));assert.ok(save.secrets['w1-cat'].includes('w1-cat-garden-bench'));assert.equal(save.evo,0,'listening never evolves the kitten');assert.deepEqual(errors,[]);
  await fs.mkdir('test-results/v654',{recursive:true});await p.screenshot({path:`test-results/v654/touch-bench-${width}.png`});console.log('PASS native touch listening, saved story and chosen form',width);await context.close();
 }
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
