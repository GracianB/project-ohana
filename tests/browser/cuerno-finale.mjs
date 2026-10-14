import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try {
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1280,height:1050}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text().includes('[OHANA runtime fault]'))errors.push(m.text())});
 const base=`http://127.0.0.1:${server.address().port}/`;
 await page.goto(base+'previews/cuerno-finale.html');await page.waitForFunction(()=>window.previewReady);
 await fs.mkdir('test-results/visual',{recursive:true});
 for(let form=0;form<5;form++)for(const attack of ['J','K','L','U']){
  await page.selectOption('#form',String(form));await page.selectOption('#attack',attack);
  await page.evaluate(()=>window.cuernoFinalePreview.setFrame(30));
  assert.ok(await page.locator('#battle').evaluate(c=>c.getContext('2d').getImageData(260,200,500,100).data.some(v=>v>0)));
  if(attack==='K'&&(form===0||form===4))await page.screenshot({path:`test-results/visual/cuerno-finale-K-form-${form+1}.png`,fullPage:true});
 }
 for(let from=1;from<5;from++)for(const t of [.5,2,3.3]){
  await page.evaluate(({t,from})=>window.cuernoFinalePreview.setCinema(t,from),{t,from});
  if(t===3.3)await page.locator('#cinema').screenshot({path:`test-results/visual/cuerno-finale-evolution-${from}-${from+1}.png`});
 }
 await page.selectOption('#attack','U');await page.evaluate(()=>window.cuernoFinalePreview.setFrame(65));await page.screenshot({path:'test-results/visual/cuerno-finale-U.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.emulateMedia({reducedMotion:'reduce'});await page.selectOption('#attack','K');await page.evaluate(()=>window.cuernoFinalePreview.setFrame(28));
 await page.screenshot({path:'test-results/visual/cuerno-finale-mobile.png',fullPage:true});
 await page.goto(base+'?e2e=1',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__OHANA_E2E);
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(let evo=0;evo<5;evo++){
  const result=await page.evaluate(evo=>{const api=window.__OHANA_E2E;api.start('cuerno');api.setEvo(evo);api.setInvulnerable();api.cast(1);api.step(8);const warn=api.state();api.step(24);const active=api.state();return {warn,active}},evo);
  assert.equal(result.warn.cuerno.trails,0);assert.ok(result.active.cuerno.trails>0);assert.ok(result.active.running);
 }
 const u=await page.evaluate(async()=>{const api=window.__OHANA_E2E;api.start('cuerno');api.setEvo(4);api.cast(3);api.step(35);const play=await import('/systems/cuerno-play-v373.js');const active=api.state();api.loadRoom('jungle');return {active,reset:play.readCuernoPlay()}});
 assert.equal(u.active.familyDuet.hero,'cuerno');assert.equal(u.reset.duo,null);
 assert.deepEqual(errors,[]);console.log('PASS Cuerno finale: 20 attack/form scenes, 12 evolution scenes, real K windup/trail in five forms, U and room reset, mobile/reduced-motion');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
