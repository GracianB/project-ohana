import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.waitForFunction(()=>window.__OHANA_E2E);
 await page.locator('.oi-enter').click();await page.locator('#family-camp').waitFor();
 await fs.mkdir('test-results/v442',{recursive:true});
 const collected=await page.evaluate(()=>{localStorage.removeItem('ohana-room-albums-v1');const e=window.__OHANA_E2E;e.start('cat');e.loadRoom('hub');e.step(12);e.setInvulnerable(600);const count=e.roomCast().length;
  for(const item of e.albumItems()){e.setInvulnerable(600);e.setPlayer(item.x-10,item.y-14);e.step(1);if(e.state().roomId!=='hub')throw new Error('collectible triggered room exit');}
  return {count,album:e.state().roomAlbum};});
 assert.ok(collected.count===10);assert.equal(collected.album.count,100);
 await page.evaluate(()=>{const e=window.__OHANA_E2E,c=e.checkpointData().checkpoints[0];e.setPlayer(c.x-10,c.y-28);e.step(1);});
 let s=await page.evaluate(()=>window.__OHANA_E2E.state());assert.ok(s.roomAlbum.scene);assert.equal(s.roomAlbum.relic,true);
 const frozen=await page.evaluate(()=>{const e=window.__OHANA_E2E,before={enemies:e.roomCast(),player:e.state().player,t:e.state().platformDrop.t};e.step(200);return {before,after:{enemies:e.roomCast(),player:e.state().player,t:e.state().platformDrop.t}};});assert.deepEqual(frozen.before,frozen.after);
 await page.screenshot({path:'test-results/v442/ukulele-desktop.png'});await page.evaluate(()=>window.__OHANA_E2E.step(200));await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/v442/ukulele-mobile.png'});
 const ending=await page.evaluate(()=>{const e=window.__OHANA_E2E;e.step(599-e.state().roomAlbum.scene.age);const before=e.state().roomAlbum.scene;e.step(1);return {before,after:e.state().roomAlbum.scene};});assert.equal(ending.before.age,599);assert.equal(ending.after,null);
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.loadRoom('beach');e.loadRoom('hub');e.start('stitcho');});
 s=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(s.roomAlbum.count,100);assert.equal(s.roomAlbum.relic,true);assert.equal(s.roomAlbum.scene,null);
 await page.setViewportSize({width:1440,height:950});await page.keyboard.press('b');await page.locator('.room-album-sheet').first().waitFor();assert.match(await page.locator('.room-album-sheet').first().innerText(),/100\/100/);await page.screenshot({path:'test-results/v442/room-album.png'});await page.keyboard.press('Escape');
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.start('kilo');e.loadRoom('hub');e.step(12);e.setInvulnerable(600);e.setPlayer(1240,1310);e.setPlayerVelocity(0,12);e.step(330);});
 s=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(s.roomId,'hub');assert.ok(s.player.x<1190);assert.equal(s.roomAlbum.count,100);assert.equal(s.runtimeFaults,0);assert.deepEqual(errors,[]);
 await page.evaluate(()=>{localStorage.setItem('ohana-room-albums-v1',JSON.stringify({hub:{found:Array.from({length:100},(_,i)=>i),relic:false}}));const e=window.__OHANA_E2E;e.start('kilo');e.loadRoom('hub');e.setPlayer(90,1106);});
 assert.ok((await page.evaluate(()=>window.__OHANA_E2E.state())).roomAlbum.scene);await page.keyboard.press('Escape');await page.locator('#btn-quit').click();assert.equal(await page.evaluate(()=>document.body.classList.contains('relic-cinema')),false);assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).running,false);
 console.log('PASS V442: collect all 100 as Michi, 10 enemies, universal ukulele, frozen player/enemies/time, 600 ticks, persistence across rooms/heroes, lethal pit recovery, desktop/mobile.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
