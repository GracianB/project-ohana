import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
import fs from 'node:fs/promises';
const server=await startServer(0);let browser;
try {
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1360,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__OHANA_E2E);
 await page.locator('#ohana-intro .oi-enter').click();
 await page.evaluate(()=>window.__OHANA_E2E.start('cat'));
 await page.keyboard.press('Escape');await page.locator('#pause-overlay.open').waitFor();
 assert.ok((await page.locator('#pause-hero').textContent()).length>0);
 assert.ok((await page.locator('#pause-objective').textContent()).length>10);
 await page.locator('#pause-music').fill('35');
 assert.equal(await page.evaluate(async()=> (await import('/engine/music.js')).musicVolume()),.35);
 await page.locator('#pause-gentle').check();
 assert.equal(await page.evaluate(async()=> (await import('/systems/cinema-kit.js')).reducedMotion()),true);
 assert.equal(await page.evaluate(()=>localStorage.getItem('ohana-gentle-motion')),'1');
 await fs.mkdir('test-results/visual',{recursive:true});
 for(const [name,width,height] of [['desktop',1360,900],['mobile',390,844],['landscape',844,390]]) {
  await page.setViewportSize({width,height});
  const bounds=await page.locator('#pause-overlay .panel').evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:innerWidth,h:innerHeight}});
  assert.ok(bounds.left>=0&&bounds.right<=bounds.w&&bounds.top>=0&&bounds.bottom<=bounds.h,JSON.stringify(bounds));
  await page.locator('#btn-resume').scrollIntoViewIfNeeded();assert.ok(await page.locator('#btn-resume').isVisible());
  await page.screenshot({path:`test-results/visual/v400-pause-${name}.png`,timeout:20000});
 }
 await page.locator('#btn-resume').click();assert.equal(await page.locator('#pause-overlay').getAttribute('aria-hidden'),'true');
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.__OHANA_E2E);
 assert.equal(await page.locator('#pause-music').inputValue(),'35');assert.equal(await page.locator('#pause-gentle').isChecked(),true);
 assert.deepEqual(errors,[]);console.log('PASS V400: live pause, actual music volume, cinema motion preference, persistence, desktop/mobile/landscape and resume');
} finally {await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
