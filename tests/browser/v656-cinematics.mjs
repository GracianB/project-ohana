// Production renderer fixtures are separate from native earned replay/skip acceptance.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:'/usr/bin/chromium'}),out='test-results/v656';
try{
 await fs.mkdir(out,{recursive:true});const p=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/tests/browser/michi-render-fixture.html`);
 await p.evaluate(async()=>{
  const {WORLD1_ROOMS}=await import('/systems/world1-rooms.js'),{drawChapterFilm,buildChapterFilm}=await import('/systems/chapter-cinema.js'),{drawEvoCine}=await import('/systems/evo-cine/michi.js');
  const room=WORLD1_ROOMS['w1-cat'],canvas=document.createElement('canvas');canvas.id='film';document.body.style.margin='0';document.body.append(canvas);
  window.drawMovie=(event,shot=0,t=170,W=1280,H=900,reduced=false)=>{canvas.width=W;canvas.height=H;const c=canvas.getContext('2d'),g={roomDef:room,player:{x:4360,y:1112,w:22,h:22},world1:{stations:room.seal.stations.map(s=>({...s,done:event!=='roomEnter'})),sealed:event==='chapterExit'},reduceMotion:reduced};g.world1Cine={shots:buildChapterFilm(event,'cat',{form:0}),i:shot,t,revealed:true};const before=JSON.stringify(g);drawChapterFilm(c,g,W,H,t);if(JSON.stringify(g)!==before)throw Error('film wrote gameplay');return canvas.toDataURL();};
  window.drawEvolution=(from,t)=>{canvas.width=960;canvas.height=540;drawEvoCine(canvas.getContext('2d'),960,540,t,from,from+1,{seed:42});return canvas.toDataURL();};
 });
 const cases=[['roomEnter',1],['chapterBossIntro',0],['chapterBossVictory',0],['chapterHundred',1],['chapterExit',2]];
 for(const [event,shot] of cases){await p.evaluate(([e,s])=>window.drawMovie(e,s),[event,shot]);await p.locator('#film').screenshot({path:`${out}/${event}.png`});}
 for(const [W,H] of [[320,568],[390,844],[844,390]])for(const [event,shot] of cases){await p.setViewportSize({width:W,height:H});const stable=await p.evaluate(([e,s,W,H])=>{const a=window.drawMovie(e,s,0,W,H,true),b=window.drawMovie(e,s,210,W,H,true);return a===b;},[event,shot,W,H]);assert.ok(stable,'reduced story clock '+event);if(event==='chapterExit')await p.locator('#film').screenshot({path:`${out}/exit-${W}x${H}.png`});}
 for(let from=1;from<=4;from++){const hashes=[];for(const t of [.3,1.2,2.3,3.5])hashes.push(await p.evaluate(([f,t])=>window.drawEvolution(f,t),[from,t]));assert.equal(new Set(hashes).size,4);await p.setViewportSize({width:960,height:540});await p.locator('#film').screenshot({path:`${out}/evolution-${from+1}.png`});}
 assert.deepEqual(errors,[]);await p.close();
 const earned=JSON.parse(await fs.readFile('test-results/v654/earned-100-storage.json','utf8'));
 for(const [width,height] of [[320,568],[390,844],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,reducedMotion:'reduce'});await context.addInitScript(items=>{if(localStorage.getItem('ohana'))return;for(const q of items)localStorage.setItem(q.name,q.value);},earned.origins[0].localStorage);
  const page=await context.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.waitForFunction(()=>window.__OHANA_E2E);await page.evaluate(()=>window.__OHANA_E2E.manualClock());await page.locator('.atlas-resume').click();await page.evaluate(()=>window.__OHANA_E2E.step(40));
  await page.locator('#play-options summary').click();await page.locator('[data-play-action="btn-festival"]').click();await page.locator('[data-memory-replay]').click();await page.evaluate(()=>window.__OHANA_E2E.step(30));
  assert.ok(await page.locator('#world1-cine-skip').isVisible());const boxes=await Promise.all(['#world1-cine-next','#world1-cine-skip'].map(s=>page.locator(s).boundingBox()));for(const b of boxes){assert.ok(b.width>=44&&b.height>=44);assert.ok(b.x>=0&&b.x+b.width<=width+1&&b.y+b.height<=height+1);}assert.ok(boxes[0].x+boxes[0].width<=boxes[1].x);
  await page.screenshot({path:`${out}/native-controls-${width}.png`});await page.locator('#world1-cine-skip').tap();await page.evaluate(()=>window.__OHANA_E2E.step(3));const state=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(state.world1Cine,null);assert.equal(state.evo,4);assert.equal(state.runtimeFaults,0);assert.equal(await page.evaluate(()=>window.__OHANA_E2E.michiSanctuaryState().album.found.length),100);await context.close();
 }
 console.log('PASS directed story fixtures, four distinct metamorphoses, reduced motion and native earned replay/skip at three mobile sizes');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
