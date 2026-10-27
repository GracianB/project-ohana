// Camera/form fixtures inspect the new art and interactions. They are never
// counted as earned campaign progress or natural difficulty evidence.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await fs.mkdir('test-results/v600',{recursive:true});await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 let starChecked=false;const report=[];
 for(const hero of ['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi']){
  await page.evaluate(hero=>{localStorage.clear();const e=window.__OHANA_E2E;e.startWorld1(hero);e.loadRoom('w1-'+hero);e.step(600);e.step(600);e.setEvo(4);e.setPlayer(hero==='kilo'?12640:8460,900);e.setInvulnerable(3000);e.step(60);},hero);
  await page.clock.runFor(32);assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).runtimeFaults,0);
  await page.screenshot({path:`test-results/v600/${hero}-guardian.png`});
  await page.keyboard.press('m');await page.clock.runFor(32);
  assert.equal(await page.locator('#map-overlay').isVisible(),true);assert.match(await page.locator('#map-title').innerText(),/ruta de los diez/);
  assert.equal(await page.locator('#map-grid .wm-node').count(),11);
  const detail=await page.locator('#map-grid .wm-detail').innerText();
  if(hero==='kilo'){
   for(const instrument of ['Caracola del arroyo','Bambú del viento','Arpa del dosel','Hibisco del compás'])assert.ok(detail.includes(instrument));
   assert.doesNotMatch(detail,/Acto II|Tres descubrimientos/,'Claro has four musical lessons and a final guardian, not an extra collection gate');
  }else assert.match(detail,/Acto II/);
  if(hero==='stitcho')await page.screenshot({path:'test-results/v600/chapter-map-desktop.png'});
  await page.keyboard.press('Escape');
  await page.evaluate(()=>{const e=window.__OHANA_E2E;e.setPlayer(11650,700);e.step(70);});await page.clock.runFor(32);
  await page.screenshot({path:`test-results/v600/${hero}-act2.png`});
  if(!starChecked){
   const star=await page.evaluate(()=>window.__ohanaMagic.items().find(i=>i.kind==='star'&&!i.taken));
   if(star){
    await page.keyboard.press('n');await page.evaluate(({x,y})=>{window.__OHANA_E2E.setPlayer(x,y-10);window.__OHANA_E2E.step(2);},star);
    const active=await page.evaluate(async()=>({status:(await import('/systems/magic.js')).Magic.status(),music:(await import('/engine/music.js')).currentMusic()}));
    assert.ok(active.status.some(p=>p.id==='star'));assert.equal(active.music,'star-power');await page.clock.runFor(16);await page.screenshot({path:'test-results/v600/star-power.png'});
    await page.evaluate(()=>window.__OHANA_E2E.step(520));const ended=await page.evaluate(async()=>({status:(await import('/systems/magic.js')).Magic.status(),music:(await import('/engine/music.js')).currentMusic()}));assert.ok(!ended.status.some(p=>p.id==='star'));assert.notEqual(ended.music,'star-power');starChecked=true;
   }
  }
  report.push({hero,guardianRender:true,...(hero==='kilo'?{lastInstrumentRender:true}:{act2Render:true}),map:true});console.log('V2 PRESENTATION '+hero);
 }
 await page.setViewportSize({width:390,height:844});await page.keyboard.press('m');await page.clock.runFor(32);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'test-results/v600/chapter-map-mobile.png',fullPage:true});
 assert.ok(starChecked,'a real star fixture must exercise the pickup/music/expiration path');assert.deepEqual(errors,[]);await fs.writeFile('test-results/v600/presentation.json',JSON.stringify({report,starChecked,errors},null,2));
 console.log('PASS ten articulated guardians, Kilo final instrument + nine Act II vistas, actual chapter atlas and star pickup/music/expiration');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
