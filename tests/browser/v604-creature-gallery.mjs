import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1460,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/previews/v604-creatures.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__OHANA_V604_GALLERY__?.ready);
 const names=await page.locator('.creature').evaluateAll(cards=>cards.map(c=>c.dataset.kind));
 assert.equal(names.length,18);assert.equal(new Set(names).size,18);
 const painted=await page.locator('.creature canvas').evaluateAll(canvases=>canvases.map(c=>{
  const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let opaque=0;
  for(let i=3;i<data.length;i+=4)if(data[i]>90)opaque++;
  return opaque;
 }));
 for(const [i,pixels] of painted.entries())assert.ok(pixels>280,'unpainted creature '+names[i]+' ('+pixels+')');
 await fs.mkdir('test-results/v604',{recursive:true});
 await page.screenshot({path:'test-results/v604/bestiary-desktop.png',fullPage:true});
 for(const state of ['wind','attack','hurt']){
   await page.locator('[data-state="'+state+'"]').click();
   assert.equal(await page.locator('[data-state="'+state+'"]').getAttribute('aria-pressed'),'true');
 }
 await page.locator('[data-state="wind"]').click();
 await page.setViewportSize({width:390,height:844});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
 assert.equal(overflow,false,'horizontal overflow in bestiary');
 await page.screenshot({path:'test-results/v604/bestiary-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('OHANA V604 BESTIARY PASS: 18 unique populated canvases, 4 states, responsive desktop+mobile');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
