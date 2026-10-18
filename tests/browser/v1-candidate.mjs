import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.waitForFunction(()=>window.__OHANA_E2E);
 await page.locator('.oi-enter').click();await page.locator('#family-camp').waitFor();await page.waitForTimeout(300);
 await fs.mkdir('test-results/v1',{recursive:true});await page.screenshot({path:'test-results/v1/islands-desktop.png',fullPage:true});
 for(const id of ['kilo','pizza','dragon','cat','chispin']){await page.locator(`.char-card[data-id="${id}"]`).click();await page.locator('#camp-film').click();await page.waitForTimeout(60);await page.locator('#camp-film-stop').click();}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/v1/islands-mobile.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>{const e=window.__OHANA_E2E;e.start('kilo');e.setEvo(4);e.loadRoom('beach');e.setInvulnerable();});
 const data=await page.evaluate(()=>window.__OHANA_E2E.checkpointData()),c=data.checkpoints[2];
 await page.evaluate(c=>{const e=window.__OHANA_E2E;e.setPlayer(c.x-18,c.y-52);e.step(10);},c);
 let state=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(state.worldW,7200);assert.equal(state.checkpoints.beach,c.id);assert.ok(state.explored.beach.length);
 await page.screenshot({path:'test-results/v1/beach-desktop.png'});
 await page.keyboard.press('m');await page.waitForTimeout(120);await page.screenshot({path:'test-results/v1/atlas.png'});await page.keyboard.press('Escape');
 const fall=data.hazards[0];await page.evaluate(h=>{const e=window.__OHANA_E2E;e.setPlayer(h.x+h.w/2,h.y+h.h*.6);e.setPlayerVelocity(0,10);e.step(2);},fall);
 assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).roomId,'reef');
 for(const room of ['hub','beach','jungle','cave','lab','ridge','space','reef','volcano','boss']){
  await page.evaluate(id=>{const e=window.__OHANA_E2E;e.setEvo(4);e.loadRoom(id);e.setInvulnerable();e.step(60);},room);
  state=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(state.roomId,room);assert.equal(state.runtimeFaults,0,room);
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{const e=window.__OHANA_E2E;e.loadRoom('beach');e.step(30);});await page.screenshot({path:'test-results/v1/beach-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS V1 candidate: five island scenes, desktop/mobile, local geometry map, atlas, checkpoint, real Beach→Reef fall and ten-room runtime smoke.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
