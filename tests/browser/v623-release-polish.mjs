// Reuses an earned campaign backup. No grants of forms, seals, XP, health or
// objects: normal attack, pause, help, menu and Continue controls are exercised.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0),browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
await fs.mkdir('test-results/v623',{recursive:true});
try{
 const storage=JSON.parse(await fs.readFile(process.env.OHANA_EARNED_STORAGE||'test-results/v600/earned-campaign-storage.json','utf8'));
 for(const o of storage.origins)o.origin='http://127.0.0.1:'+server.address().port;
 const reports=[];
 for(const [width,height]of[[1280,900],[390,844],[320,568]]){
  const context=await browser.newContext({viewport:{width,height},storageState:storage}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));const date=new Date('2026-10-28T12:00:00Z');await page.clock.install({time:date});await page.clock.pauseAt(new Date(+date+1000));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');
  assert.equal(await page.locator('body').getAttribute('data-version'),'1.0.0');
  await page.keyboard.press('Escape');
  await page.evaluate(()=>{localStorage.removeItem('ohana-resume');window.__OHANA_E2E.startWorld1('stitcho');});
  const tick=async n=>{await page.evaluate(n=>window.__OHANA_E2E.step(n),n);await page.clock.runFor(16);};
  async function films(){for(let i=0;i<20;i++){const s=await page.evaluate(()=>window.__OHANA_E2E.state());if(!s.world1Cine)break;await page.keyboard.press('Enter');await tick(100);}await page.locator('#game').focus();}
  await films();await tick(3);const before=await page.evaluate(()=>window.__OHANA_E2E.state());
  assert.equal(before.evo,4);assert.equal(before.world1Seals.length,10);
  await page.keyboard.press('j');await tick(4);await page.keyboard.press('k');await tick(3);
  assert.match(await page.locator('#combat-coach-a11y').innerText(),/2 ataques distintos/);
  await page.screenshot({path:`test-results/v623/link-${width}.png`});
  await page.keyboard.press('Escape');await page.locator('#pause-overlay.open').waitFor({state:'visible'});
  assert.match(await page.locator('#pause-progress').innerText(),/10\/10 sellos/);
  assert.match(await page.locator('#pause-save-status').innerText(),/Progreso guardado/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true);
  await page.screenshot({path:`test-results/v623/pause-${width}.png`});
  await page.locator('#btn-resume').click();await page.locator('#btn-help').click();
  await page.locator('#field-guide [data-guide="stitcho"]').click();await page.locator('.fg-combat-rules summary').click();
  assert.equal(await page.locator('.fg-combat-rules h5').count(),4);
  assert.match(await page.locator('.fg-combat-rules').innerText(),/Rebote 626/);
  assert.match(await page.locator('.fg-combat-rules').innerText(),/Flota cruzada/);
  assert.match(await page.locator('.fg-combat-rules').innerText(),/U no conecta/);
  await page.locator('.fg-combat-rules').screenshot({path:`test-results/v623/powers-guide-${width}.png`});
  await page.locator('#btn-close-help').click();await page.keyboard.press('Escape');await page.locator('#btn-quit').click();
  await page.locator('#btn-continue').waitFor({state:'visible'});await page.locator('#btn-continue').click();await page.clock.runFor(14000);await films();await tick(3);
  const resumed=await page.evaluate(()=>window.__OHANA_E2E.state());
  assert.equal(resumed.hero,'stitcho');assert.equal(resumed.evo,4);assert.deepEqual(resumed.world1Seals,before.world1Seals);
  if(width===320){
   const saved=await page.evaluate(()=>localStorage.getItem('ohana'));
   await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='ohana'||k==='ohana.tmp')throw new DOMException('Blocked for test','QuotaExceededError');return original.call(this,k,v);};});
   await page.keyboard.press('Escape');assert.match(await page.locator('#pause-save-status').innerText(),/Guardado no disponible/);
   assert.equal(await page.evaluate(()=>localStorage.getItem('ohana')),saved);
   await page.screenshot({path:'test-results/v623/save-unavailable-320.png'});
  }
  assert.deepEqual(errors,[]);reports.push({width,height,linkFromRealActions:true,saveConfirmed:true,continueRestoresHeroAndSeals:true,storageFailureTested:width===320,errors});await context.close();
 }
 await fs.writeFile('test-results/v623/release-polish.json',JSON.stringify(reports,null,2));console.log('PASS V1 polish: real links, pause/save, hero-specific rules and Continue at 1280/390/320; denied storage remains honest');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
