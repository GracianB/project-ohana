import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try {
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`,{waitUntil:'networkidle'});
 await page.locator('#ohana-intro .oi-enter').click();
 await page.evaluate(()=>window.__OHANA_E2E.start('kilo'));
 await fs.mkdir('test-results/presentation',{recursive:true});
 for(const [name,width,height] of [['desktop',1280,900],['mobile',390,844],['small',320,568]]) {
   await page.setViewportSize({width,height});await page.waitForTimeout(120);
   const cards=await page.locator('#hud .hud-block').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,right:r.right,height:r.height};}));
   assert.ok(cards.every(r=>r.x>=0&&r.right<=width+1&&r.height<140),name+': HUD '+JSON.stringify(cards));
   await page.screenshot({path:`test-results/presentation/${name}-play.png`});
   await page.locator('#btn-map').click();
   await page.locator('#map-overlay.open').waitFor();
   assert.equal(await page.locator('.wm-node').count(),10);
   const room=await page.evaluate(()=>window.__OHANA_E2E.state().roomId);
   await page.locator('.wm-node[data-room="volcano"]').click();
   assert.equal(await page.locator('.wm-detail h3').textContent(),'Caldera');
   assert.match(await page.locator('.wm-detail').textContent(),/forma 4/i);
   assert.equal(await page.evaluate(()=>window.__OHANA_E2E.state().roomId),room,'map inspection must not teleport');
   await page.locator('.wm-node[data-room="hub"]').click();
   assert.match(await page.locator('.wm-detail').textContent(),/Costa Hoku/);
   await page.locator('.wm-node[data-room="hub"]').focus();
   await page.keyboard.press('Tab');
   assert.ok(await page.evaluate(()=>document.activeElement?.tagName==='BUTTON'));
   await page.locator('#map-overlay .panel').evaluate(async el=>{await Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{})));});
   await page.locator('.map-intro').click();
   await page.screenshot({path:`test-results/presentation/${name}-map.png`});
   await page.locator('#btn-close-map').click();
   await page.locator('#btn-help').click();
   await page.locator('#help.open').waitFor();
   assert.equal(await page.locator('.help-steps li').count(),3);
   await page.locator('#help .panel').evaluate(async el=>{await Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{})));});
   await page.screenshot({path:`test-results/presentation/${name}-help.png`});
   await page.locator('#btn-close-help').click();
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('#btn-map').click();
 assert.equal(await page.locator('.wm-node.here').evaluate(el=>getComputedStyle(el).animationName),'none');
 assert.deepEqual(errors,[]);
 console.log('PASS play presentation: 10 interactive map locations, true routes, no teleport, keyboard access, three-step help and compact HUD at 1280/390/320px');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
