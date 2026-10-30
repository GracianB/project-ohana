import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
import {WELCOME_STORIES} from '../../systems/welcome-story.js';
const server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[],rasters=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/(?:observatory-keyart\.png|realm\.webp)/.test(r.url()))rasters.push(r.url());});
 const url=`http://127.0.0.1:${server.address().port}/?e2e=1`;
 await page.goto(url,{waitUntil:'networkidle'});await page.locator('.oi-pause').click();
 assert.equal(await page.locator('.oi-next,.oi-previous').count(),0);
 assert.equal(await page.locator('.ohana-wordmark').first().locator('i').count(),5);
 for(const scene of WELCOME_STORIES){await page.evaluate(t=>window.__OHANA_WELCOME_SET_STORY_TIME(t),scene.start+.2);await page.waitForTimeout(100);assert.equal(await page.locator('.oi-story-line').textContent(),scene.lines[0].text);}
 const beforeTouch=await page.locator('#ohana-intro canvas').evaluate(c=>c.toDataURL());
 await page.locator('#ohana-intro').click({position:{x:600,y:400}});await page.waitForTimeout(180);
 assert.notEqual(await page.locator('#ohana-intro canvas').evaluate(c=>c.toDataURL()),beforeTouch,'touch animates the real canvas while the story is paused');
 await fs.mkdir('test-results/caprichos',{recursive:true});
 await page.screenshot({path:'test-results/caprichos/opening.png'});
 await page.locator('.oi-enter').click();
 await page.evaluate(()=>window.__OHANA_E2E.startWorld1('kilo'));
 // Start can open a story. Use the real story advance action before inspecting play UI.
 for(let i=0;i<12&&await page.locator('body.world1-story').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(200);}
 await page.waitForTimeout(200);
 for(const [name,w,h] of [['desktop',1280,900],['phone',390,844],['small',320,568]]){
  await page.setViewportSize({width:w,height:h});await page.waitForTimeout(120);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),name+' horizontal overflow');
  const rects=await page.locator('#hud .hud-block').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,right:r.right,height:r.height};}));
  assert.ok(rects.every(r=>r.x>=0&&r.right<=w+1&&r.height<145&&(w>640||r.right-r.x>w*.35)),name+JSON.stringify(rects));
  await page.screenshot({path:`test-results/caprichos/${name}-hud.png`});
  await page.locator('#btn-help').click();await page.locator('#help.open').waitFor();
  assert.equal(await page.locator('[data-guide]').count(),11);
  for(const hero of ['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi']){
   await page.locator(`[data-guide="${hero}"]`).click();assert.match(await page.locator('#guide-page').textContent(),/Tu estrategia/);
  }
  await page.locator('[data-guide="together"]').click();assert.match(await page.locator('#guide-page').textContent(),/sala online: uno crea la sala/);
  await page.locator('[data-guide="kilo"]').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[data-guide="stitcho"]').getAttribute('aria-pressed'),'true');
  if(!await page.locator('.fg-comfort').evaluate(e=>e.open)){await page.locator('[data-guide="together"]').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.tagName),'SUMMARY');await page.keyboard.press('Space');}
  for(const key of ['readable','contrast','quiet','controls'])await page.locator(`[data-comfort="${key}"]`).check();
  assert.ok(await page.locator('body').evaluate(b=>['readable','contrast','quiet','controls'].every(k=>b.classList.contains('comfort-'+k))));
  await page.screenshot({path:`test-results/caprichos/${name}-guide.png`});
  await page.locator('#comfort-reset').click();assert.equal(await page.locator('[data-comfort]:checked').count(),0);
  await page.locator('#btn-close-help').click();
 }
 await page.setViewportSize({width:1280,height:900});
 const slot=page.locator('.ability-slot').first();await slot.focus();await page.locator('#power-inspector').waitFor({state:'visible'});assert.ok((await page.locator('#power-inspector').textContent()).length>10);await page.keyboard.press('Escape');await page.locator('#power-inspector').waitFor({state:'hidden'});if(await page.locator('#pause-overlay.open').count())await page.keyboard.press('Escape');
 await page.keyboard.press('Escape');await page.locator('#btn-quit').click();await page.locator('#camp-canvas').waitFor({state:'visible'});
 await page.locator('.char-card[data-id="stitcho"]').click();await page.locator('#camp-guide').click();await page.locator('#help.open').waitFor();
 assert.equal(await page.locator('[data-guide="stitcho"]').getAttribute('aria-pressed'),'true','returning to the menu must use the selected hero, not stale HUD data');
 if(!await page.locator('.fg-comfort').evaluate(e=>e.open))await page.locator('.fg-comfort summary').click();await page.locator('[data-comfort="contrast"]').check();
 await page.reload({waitUntil:'networkidle'});assert.ok(await page.locator('body').evaluate(b=>b.classList.contains('comfort-contrast')));
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.oi-enter').click();await page.locator('#camp-canvas').waitFor({state:'visible'});
 await page.locator('.char-card[data-id="stitcho"]').click();await page.locator('#camp-guide').click();await page.locator('#help.open').waitFor();assert.equal(await page.locator('[data-guide="stitcho"]').getAttribute('aria-pressed'),'true');
 assert.deepEqual(errors,[]);assert.deepEqual(rasters,[]);
 console.log('PASS caprichos: 11 automatic cast scenes, live wordmark, 3 responsive HUDs, 10 chapter strategies + multiplayer guide, arrow navigation, comfort persistence/reset, power inspector, reduced motion; no raster landscapes or runtime errors');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
