// UI fixture: intentionally seeds only the separate memory. Does not claim
// campaign victory; the natural unlock is checked in v493's physical run.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port+'/?e2e=1';
 await page.goto(base);await page.waitForFunction(()=>window.__OHANA_E2E);
 assert.equal(await page.locator('#btn-family-memory').isVisible(),false,'locked before any memory');
 await page.evaluate(()=>{localStorage.setItem('ohana-family-memory-v500',JSON.stringify({v:1,world:1,hero:'kilo',lights:[]}));localStorage.setItem('ohana-gentle-motion','1');});
 await page.reload();await page.locator('.oi-enter').click();await page.locator('#btn-family-memory').click();
 await page.locator('#family-constellation.open').waitFor();
 assert.equal(await page.locator('.constellation-stars button').count(),10);
 assert.equal(await page.locator('.constellation-reunion-open').isVisible(),false,'reunion requires all ten lights');
 for(const button of await page.locator('.constellation-stars button').all())await button.click();
 assert.equal(await page.locator('#family-constellation').evaluate(e=>e.classList.contains('all-lit')),true);
 assert.equal(await page.locator('.constellation-last-title').textContent(),'La última luz eres tú.');
 await page.locator('.constellation-reunion-open').click();
 assert.equal(await page.locator('.constellation-reunion').isVisible(),true);
 assert.match(await page.locator('.reunion-hero').textContent(),/Kilo/,'dedication follows victory hero, not last selected Cuerno');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'reunion-title');
 await fs.mkdir('test-results/v500',{recursive:true});
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844],['landscape',844,390]]){
  await page.setViewportSize({width,height});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const buttons=await page.locator('.constellation-stars button').evaluateAll(bs=>bs.map(b=>{const r=b.getBoundingClientRect();return {x:r.left,right:r.right,w:r.width,h:r.height}}));
  assert.ok(buttons.every(b=>b.x>=0&&b.right<=width&&b.h>=44),JSON.stringify(buttons));
  const bounds=await page.locator('#family-constellation').evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};});
  assert.deepEqual(bounds,{x:0,y:0,w:width,h:height},'dialog covers the viewport');
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');
  await page.locator('.constellation-reunion').scrollIntoViewIfNeeded();
  await page.screenshot({path:`test-results/v500/${name}-reunion.png`});
  await page.locator('#family-constellation').evaluate(e=>e.scrollTop=0);
  await page.screenshot({path:`test-results/v500/${name}.png`});
  if(name==='mobile'){
   await page.locator('.constellation-last-copy').scrollIntoViewIfNeeded();
   await page.screenshot({path:'test-results/v500/mobile-last-light.png'});
   await page.locator('#family-constellation').evaluate(e=>e.scrollTop=0);
  }
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('.constellation-close').focus();
 await page.keyboard.press('Shift+Tab');
 assert.equal(await page.evaluate(()=>document.activeElement?.dataset.constellationHero),'cuerno');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.className),'constellation-close');
 await page.keyboard.press('Escape');assert.equal(await page.locator('#family-constellation').isVisible(),false);
 await page.reload();await page.locator('.oi-enter').click();await page.locator('#btn-family-memory').click();
 assert.equal(await page.locator('#family-constellation').evaluate(e=>e.classList.contains('all-lit')),true,'memory survives reload');
 await page.locator('.constellation-reunion-open').click();assert.equal(await page.locator('.constellation-reunion').isVisible(),true,'reunion can be replayed after reload');
 assert.deepEqual(errors,[]);console.log('PASS V500 UI: lock, ten rendered heroes, full constellation, mobile, landscape, focus, reduced motion and reload. Physical unlock belongs to V493.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
