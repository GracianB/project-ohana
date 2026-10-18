import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');await page.waitForFunction(()=>window.__OHANA_E2E);
 await fs.mkdir('test-results/nest-arena',{recursive:true});
 await page.evaluate(()=>{const a=window.__OHANA_E2E;a.start('kilo');a.setEvo(4);a.loadRoom('boss');a.setInvulnerable(600);a.step(85);a.setBossHp(900);});
 let state=await page.evaluate(()=>window.__OHANA_E2E.step(155));assert.equal(state.boss.phase,2);assert.ok(state.nestArena.feathers.length>=2);
 await page.screenshot({path:'test-results/nest-arena/warning.png'});
 await page.evaluate(()=>window.__OHANA_E2E.step(68));
 const feather=(await page.evaluate(()=>window.__OHANA_E2E.state())).nestArena.feathers.find(f=>f.phase==='fall'||f.phase==='ember');
 assert.ok(feather,'the announced feather must fall');
 await page.evaluate(f=>window.__OHANA_E2E.setPlayer(f.x-40,f.y-20),feather);
 await page.keyboard.press('h');
 const parry=await page.evaluate(()=>window.__OHANA_E2E.step(2));
 assert.ok(parry.nestArena.returned>0||parry.nestArena.feathers.some(f=>f.phase==='return'),'keyboard H must return a feather');
 await page.evaluate(()=>window.__OHANA_E2E.step(80));
 state=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(state.runtimeFaults,0);
 await page.evaluate(()=>{const a=window.__OHANA_E2E;a.setBossHp(450);a.setInvulnerable(600);a.step(160);});
 state=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(state.boss.phase,3);assert.ok(state.nestArena.feathers.length>=3);
 await page.screenshot({path:'test-results/nest-arena/final-phase.png'});
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});
  const rect=await page.locator('#boss-wrap').evaluate(el=>{const r=el.getBoundingClientRect();const hud=document.querySelector('#hud').getBoundingClientRect();return {x:r.x,right:r.right,width:innerWidth,top:r.top,hudBottom:hud.bottom};});
  assert.ok(rect.x>=0&&rect.right<=rect.width+1,'boss HUD fits on mobile');
  assert.ok(rect.top>=rect.hudBottom,'boss bar must not cover health or XP');
  const notes=await page.locator('#notification-container').evaluate(el=>({top:el.getBoundingClientRect().top,count:el.children.length}));
  const bottom=await page.locator('#boss-wrap').evaluate(el=>el.getBoundingClientRect().bottom);
  if(notes.count)assert.ok(notes.top>=bottom,'boss notices must stay below the phase bar');
  await page.screenshot({path:'test-results/nest-arena/boss-'+width+'.png'});
 }
 await page.setViewportSize({width:1280,height:900});
 await page.evaluate(()=>{const a=window.__OHANA_E2E;a.start('stitcho');a.setEvo(4);a.step(2);});
 const pads=(await page.evaluate(()=>window.__OHANA_E2E.state())).springs.pads;assert.ok(pads.length>0);
 const pad=pads[0];await page.evaluate(p=>{const a=window.__OHANA_E2E;a.setPlayer(p.x-15,p.y-130);a.setPlayerVelocity(0,7);a.step(30);},pad);
 state=await page.evaluate(()=>window.__OHANA_E2E.state());assert.ok(state.springs.used>0,'landing must activate the flower');
 await page.screenshot({path:'test-results/nest-arena/spring.png'});
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [390,320]){await page.setViewportSize({width,height:844});await page.screenshot({path:'test-results/nest-arena/spring-'+width+'.png'});}
 assert.deepEqual(errors,[]);console.log('PASS: phase 2/3 arena warnings, three final-phase columns, spring landing, desktop/mobile and zero runtime faults');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
