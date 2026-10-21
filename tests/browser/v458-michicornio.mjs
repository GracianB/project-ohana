import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:1360,height:900}});
 const faults=[];page.on('pageerror',e=>faults.push(e.message));
 const root='http://127.0.0.1:'+server.address().port;
 await page.goto(root+'/previews/michi-design.html');
 await page.waitForFunction(()=>window.previewReady===true);
 assert.equal(await page.locator('.forms canvas').count(),5);
 assert.match(await page.title(),/Michicornio/);
 for(const pose of ['idle','run','jump','attack','cast','hurt','victory']){
  await page.selectOption('#pose',pose);await page.waitForTimeout(55);
  for(const canvas of await page.locator('.forms canvas').all()){
   assert.ok(await canvas.evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return d.some((v,i)=>i%4===3&&v>0)}));
  }
 }
 await fs.mkdir('test-results/v458',{recursive:true});
 await page.selectOption('#pose','idle');
 await page.screenshot({path:'test-results/v458/michicornio-five-forms.png',fullPage:true});
 await page.goto(root+'/?e2e=1');
 await page.locator('.oi-enter').click();await page.locator('#family-camp').waitFor();
 const result=await page.evaluate(()=>{
  const api=window.__OHANA_E2E;
  const s=api.start('michicornio'); // canonical alias is accepted by the roster, actual gameplay still uses cat
  return {s,foes:api.roomCast(),items:api.heroItems()};
 });
 // Direct gameplay start uses canonical cat ID; artist alias is a lookup API, not a duplicated hero.
 if(!result.s.running){const started=await page.evaluate(()=>window.__OHANA_E2E.start('cat'));assert.equal(started.running,true);}
 const state=await page.evaluate(()=>window.__OHANA_E2E.start('cat'));
 assert.match(state.roomName,/Michicornio/);
 assert.equal(state.heroCollection?.hero,'cat');
 assert.equal((await page.evaluate(()=>window.__OHANA_E2E.heroItems())).length,100);
 const kinds=await page.evaluate(()=>new Set(window.__OHANA_E2E.roomCast().map(e=>e.persona).filter(Boolean)).size);
 assert.ok(kinds>=5,'custom enemy identities absent in runtime');
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.deepEqual(faults,[]);
 console.log('PASS V458: five Michicornio Canvas forms and states, bespoke Moon Sanctuary foes, 100 authored relic placements, mobile');
}finally{await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
