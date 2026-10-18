import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');
 await page.waitForFunction(()=>window.__OHANA_E2E);
 await fs.mkdir('test-results/evolution-combat',{recursive:true});
 await page.screenshot({path:'test-results/evolution-combat/intro.png'});
 const heroes=['kilo','stitcho','chispin','cat','dragon','dino','frita','pizza','yomi','cuerno'];
 for(const hero of heroes){
  await page.evaluate(id=>window.__OHANA_E2E.start(id),hero);
  await page.keyboard.press('u');
  assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).lastAbilitySlot,3,hero+' baby U');
  assert.equal(await page.locator('#ability-bar button').count(),6);
  assert.equal(await page.locator('#ability-bar [data-index="4"]').getAttribute('aria-label'),'Forma 4 · I');
  await page.evaluate(()=>window.__OHANA_E2E.setEvo(3));await page.keyboard.press('i');
  assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).lastAbilitySlot,4,hero+' I');
  await page.evaluate(()=>window.__OHANA_E2E.setEvo(4));await page.keyboard.press('p');
  assert.equal((await page.evaluate(()=>window.__OHANA_E2E.state())).lastAbilitySlot,5,hero+' P');
  await page.evaluate(()=>window.__OHANA_E2E.step(60));
 }
 await page.evaluate(()=>{window.__OHANA_E2E.start('stitcho');window.__OHANA_E2E.setEvo(4);window.__OHANA_E2E.cast(2);window.__OHANA_E2E.step(30);});
 await page.screenshot({path:'test-results/evolution-combat/ships.png'});
 await page.evaluate(async()=>{
  const {drawEvolutionPresentation}=await import('/systems/evo-cine/presentation.js');
  const c=document.createElement('canvas');c.width=1000;c.height=700;c.id='cinema-audit';c.style='position:fixed;inset:0;z-index:99999;width:1000px;height:700px';document.body.append(c);
  for(const id of ['kilo','stitcho','chispin','cat','dragon','dino','frita','pizza','yomi','cuerno'])for(let evo=1;evo<=4;evo++)for(const t of [.5,1.7,2.8,3.5])drawEvolutionPresentation(c.getContext('2d'),1000,700,id,evo,t,false);
  drawEvolutionPresentation(c.getContext('2d'),1000,700,'stitcho',4,3.2,false);
 });
 await page.screenshot({path:'test-results/evolution-combat/evolution.png'});
 await page.locator('#cinema-audit').evaluate(el=>el.remove());
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});
  await page.screenshot({path:'test-results/evolution-combat/mobile-'+width+'.png'});
 }
 assert.deepEqual(errors,[]);console.log('PASS: 10 heroes, baby U, keyboard I/P, 6 HUD buttons, 160 evolution frames, no browser errors');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
