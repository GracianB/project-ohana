import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.waitForFunction(()=>window.__OHANA_E2E);
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.start('kilo');e.setEvo(1);e.loadRoom('hub');e.step(12);e.setInvulnerable(600);e.setPlayer(800,900);e.cast(1);e.step(35);});
 const hover=await page.evaluate(()=>{const e=window.__OHANA_E2E,b=e.state().player;e.step(30);return {b,a:e.state().player};});assert.ok(Math.abs(hover.a.y-hover.b.y)<1);
 await page.keyboard.down('w');const up=await page.evaluate(()=>{const e=window.__OHANA_E2E,b=e.state().player.y;e.step(30);return b-e.state().player.y;});await page.keyboard.up('w');assert.ok(up>100,`rise ${up}`);
 await page.keyboard.down('d');const right=await page.evaluate(()=>{const e=window.__OHANA_E2E,b=e.state().player.x;e.step(25);return e.state().player.x-b;});await page.keyboard.up('d');assert.ok(right>90);
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.setPlayer(350,890);});await page.keyboard.down('s');const down=await page.evaluate(()=>{const e=window.__OHANA_E2E;e.step(30);return {y:e.state().player.y,flight:e.state().kiloFlight};});await page.keyboard.up('s');assert.ok(down.y>970,JSON.stringify(down));
 await fs.mkdir('test-results/v443',{recursive:true});await page.screenshot({path:'test-results/v443/hula-flight-desktop.png'});
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.setEvo(2);e.loadRoom('hub');e.step(12);e.setInvulnerable(600);e.setPlayer(1600,900);e.cast(2);e.step(150);});
 let s=await page.evaluate(()=>window.__OHANA_E2E.state());assert.ok(s.kiloFlight.ohana>0,'L survives beyond 2.5 seconds');await page.screenshot({path:'test-results/v443/garden-guardians.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/v443/garden-mobile.png'});
 await page.setViewportSize({width:1440,height:950});
 const transport=await page.evaluate(()=>{const e=window.__OHANA_E2E;e.loadRoom('hub');e.step(12);e.setInvulnerable(600);const before=e.state().grove.lifts;e.step(60);return {before,after:e.state().grove.lifts};});
 assert.ok(Math.abs(transport.after[0].x-transport.before[0].x)>50,'horizontal raft visibly travels');assert.ok(Math.abs(transport.after[1].y-transport.before[1].y)>100,'vertical raft visibly travels');
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.loadRoom('hub');const special=e.roomCast().find(f=>f.persona==='Tambor del Claro');if(!special)throw Error('Missing unique Claro guardian');e.setPlayer(special.x-120,special.y-90);e.setInvulnerable(600);e.step(55);});
 await page.screenshot({path:'test-results/v443/claro-drummer.png'});
 s=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(s.runtimeFaults,0);assert.deepEqual(errors,[]);console.log('PASS V443: real up/right/down flight, neutral hover, repisa traversal, long L, garden desktop/mobile.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
