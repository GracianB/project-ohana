// This test only reads/reloads the genuinely collected browser storage backup.
// It never adds a memory, relic, seal, position, HP or evolution.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 const earned=JSON.parse(await fs.readFile('test-results/v600/all-memory-storage.json','utf8'));
 for(const origin of earned.origins)origin.origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
 const context=await browser.newContext({storageState:earned,viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.keyboard.press('Escape');
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ohana-w1-collect-v1')));
 const before=await read(),order=Object.keys(before.rooms);
 for(const hero of order){assert.deepEqual(before.rooms[hero].found,Array.from({length:100},(_,i)=>i));assert.equal(before.rooms[hero].relic,true);}
 for(const hero of order){
  await page.evaluate(hero=>{localStorage.removeItem('ohana-resume');window.__OHANA_E2E.startWorld1(hero);},hero);
  // A revisit may show its one arrival; use its normal advance input.
  for(let i=0;i<16;i++){
   const s=await page.evaluate(()=>window.__OHANA_E2E.state());if(!s.world1Cine)break;
   await page.keyboard.press('Enter');await page.evaluate(()=>window.__OHANA_E2E.step(120));
  }
  await page.locator('#game').focus();await page.keyboard.press('b');await page.waitForTimeout(60);
  assert.equal(await page.locator('#world1-album').isVisible(),true);
  assert.match(await page.locator('#world1-album .album-count').innerText(),/100\/100/);
  assert.match(await page.locator('#world1-album .album-reward').innerText(),/Reliquia conseguida/);
  assert.equal(await page.locator('#world1-album li.found').count(),10);
  await page.locator('#world1-album-next').click();assert.equal(await page.locator('#world1-album li.found').count(),10);
  await page.locator('#world1-album-close').click();
  assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).evo,4);
 }
 await page.reload();await page.keyboard.press('Escape');assert.deepEqual(await read(),before);
 assert.deepEqual(errors,[]);await fs.writeFile('test-results/v600/memory-save.json',JSON.stringify({total:1000,relics:10,albumPanels:10,reloadPreserved:true,errors},null,2));
 console.log('PASS: 1000 actually collected memories, ten relics, ten album panels and reload preserve the earned backup');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
