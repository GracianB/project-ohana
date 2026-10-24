// Earn the first memory with keyboard movement, then browse the actual saved
// collection with touch. No collection grant or injected health/position.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-24T12:00:00Z')});
 await page.clock.pauseAt(new Date('2026-10-24T12:00:01Z'));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1',{waitUntil:'load'});
 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
 const step=async n=>{await page.evaluate(n=>window.__OHANA_E2E.step(n),n);await page.clock.runFor(16);return state();};
 const memories=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ohana-w1-collect-v1')).rooms.kilo.found);
 await page.evaluate(()=>window.__OHANA_E2E.startWorld1('kilo'));await step(600);await step(600);
 await page.locator('#game').focus();await page.keyboard.down('d');
 for(let i=0;i<60&&(await memories()).length===0;i++)await step(8);
 await page.keyboard.up('d');const earned=await memories();assert.ok(earned.length>0);
 await page.locator('#btn-festival').tap();await page.clock.runFor(32);
 const album=page.locator('#world1-album');assert.ok(await album.evaluate(el=>el.classList.contains('open')));
 assert.equal(await page.locator('#festival-album').evaluate(el=>el.classList.contains('open')),false);
 assert.match(await album.innerText(),new RegExp(earned.length+'/100 recuerdos'));
 assert.equal(await album.locator('li.found').count(),earned.filter(id=>id<10).length);
 await page.keyboard.press('m');await page.keyboard.press('?');await page.clock.runFor(32);
 assert.equal(await page.locator('#map-overlay').evaluate(el=>el.classList.contains('open')),false);
 assert.equal(await page.locator('#help').evaluate(el=>el.classList.contains('open')),false);
 const frozen=await state();await step(600);await page.clock.runFor(1000);const held=await state();
 assert.equal(held.platformDrop.t,frozen.platformDrop.t);assert.equal(held.hp,frozen.hp);
 assert.deepEqual(held.player,frozen.player,'browsing must freeze movement and combat');
 await fs.mkdir('test-results/v501',{recursive:true});
 await page.screenshot({path:'test-results/v501/album-mobile.png'});
 for(let pageIndex=0;pageIndex<10;pageIndex++){
  assert.match(await album.locator('h3').innerText(),new RegExp('Página '+(pageIndex+1)+'/10'));
  assert.equal(await album.locator('li').count(),10);
  await album.locator('#world1-album-next').tap();await page.clock.runFor(16);
 }
 assert.match(await album.locator('h3').innerText(),/Página 1\/10/);
 await page.keyboard.press('Tab');assert.ok(await album.evaluate(el=>el.contains(document.activeElement)));
 for(const [width,height] of [[320,650],[844,390],[1280,900]]){
  await page.setViewportSize({width,height});await page.clock.runFor(32);
  assert.ok(await album.evaluate(el=>el.scrollWidth<=el.clientWidth),'no horizontal clipping');
 }
 await page.screenshot({path:'test-results/v501/album-desktop.png'});
 await page.keyboard.press('Escape');await page.clock.runFor(32);
 assert.equal(await album.evaluate(el=>el.classList.contains('open')),false);assert.equal((await state()).paused,false);
 await page.keyboard.press('b');await page.clock.runFor(32);
 assert.ok(await album.evaluate(el=>el.classList.contains('open')),'B opens the same album as touch');
 await page.locator('#world1-album-close').click();await page.clock.runFor(32);
 const x=(await state()).player.x;await page.keyboard.down('d');await step(20);await page.keyboard.up('d');
 assert.ok((await state()).player.x>x,'play resumes after closing');
 await page.reload({waitUntil:'load'});await page.evaluate(()=>window.__OHANA_E2E.startWorld1('kilo'));await step(600);
 assert.ok((await memories()).includes(earned[0]),'real earned memory survives reload');
 assert.deepEqual(errors,[]);
 console.log('PASS V501 album: physically earned memory, unified touch/B entry, ten pages, frozen combat, focus trap, mobile/landscape/desktop, resume and persistence.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
