// Art/audio and exit-regression audit. Room access and camera placement are
// fixtures; this does not claim a ten-room campaign or physical victory.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.setDefaultTimeout(15000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-24T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-24T12:00:01Z'));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1',{waitUntil:'load'});
 await page.clock.runFor(1200);
 await fs.mkdir('test-results/v501',{recursive:true});
 await page.screenshot({path:'test-results/v501/welcome-desktop.png'});
 const columns=await page.evaluate(async()=>{
  const {createWorld1Select,drawWorld1Select}=await import('/systems/world1-select.js');
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),s=createWorld1Select({});
  for(const w of [320,390,600,1280]){
   drawWorld1Select(ctx,w,w<600?660:540,0,s,{reduceMotion:true});
   if(s.rects.some(r=>r.x<0||r.x+r.w>w+1))throw Error('selector clips at '+w);
  }
  return true;
 });assert.equal(columns,true);
 await page.setViewportSize({width:390,height:844});await page.clock.runFor(100);
 await page.screenshot({path:'test-results/v501/welcome-mobile.png'});
 await page.locator('#ohana-intro .oi-enter').click();await page.clock.runFor(1200);
 await page.screenshot({path:'test-results/v501/selector-mobile.png'});
 await page.setViewportSize({width:1280,height:900});await page.clock.runFor(100);
 await page.screenshot({path:'test-results/v501/selector-desktop.png'});
 // Actual room loader: a new chapter changes protagonist and clears evolution;
 // reloading that same chapter is a retry and keeps its earned form.
 const chapter=await page.evaluate(()=>{
  const e=window.__OHANA_E2E;e.startWorld1('kilo');e.setEvo(4);
  const before=e.state();e.loadRoom('w1-stitcho');const next=e.state();
  e.setEvo(2);e.loadRoom('w1-stitcho');const retry=e.state();
  return {before,next,retry};
 });
 assert.equal(chapter.before.hero,'kilo');assert.equal(chapter.before.evo,4);
 assert.equal(chapter.next.hero,'stitcho');assert.equal(chapter.next.evo,0);assert.equal(chapter.next.xp,0);
 assert.equal(chapter.retry.hero,'stitcho');assert.equal(chapter.retry.evo,2);
 const heroes=await page.evaluate(async()=>(await import('/systems/world1-rooms.js')).WORLD1_ORDER);
 const step=async n=>{await page.evaluate(n=>window.__OHANA_E2E.step(n),n);await page.clock.runFor(32);return page.evaluate(()=>window.__OHANA_E2E.state());};
 for(const hero of heroes){
  await page.evaluate(async hero=>{
   const {WORLD1_ORDER}=await import('/systems/world1-rooms.js');
   localStorage.setItem('ohana-w1-seals-v1',JSON.stringify(WORLD1_ORDER.slice(0,WORLD1_ORDER.indexOf(hero))));
   window.__ohanaWorld1Start='w1-'+hero;window.__OHANA_E2E.startWorld1(hero);
  },hero);
  await step(600);await step(600);
  await page.evaluate(()=>window.__OHANA_E2E.setPlayer(900,1050));await step(120);
  await page.evaluate(async()=>{(await import('/systems/notify.js')).dismissNotifications();});await page.clock.runFor(250);
  await page.screenshot({path:'test-results/v501/room-'+hero+'.png'});
  const before=(await step(1)).terrainStats.total;
  await page.evaluate(()=>window.__OHANA_E2E.setPlayer(9400,1050));const after=await step(3);
  assert.equal(after.roomId,'w1-'+hero);assert.equal(after.terrainStats.total,before,hero+' exit must not spawn platforms');
 }
 const audio=await page.evaluate(async heroes=>{
  const {renderMusicPreview,themeForRoom}=await import('/engine/music.js');const results=[];
  for(const hero of heroes){
   const buffer=await renderMusicPreview(themeForRoom('w1-'+hero),2),samples=buffer.getChannelData(0);
   let peak=0,sum=0;for(const v of samples){if(!Number.isFinite(v))throw Error('invalid music '+hero);peak=Math.max(peak,Math.abs(v));sum+=v*v;}
   if(!(peak>0&&peak<=1))throw Error('silent or clipped score '+hero);
   results.push({hero,peak,rms:Math.sqrt(sum/samples.length)});
  }
  return results;
 },heroes);
 await fs.writeFile('test-results/v501/music-audit.json',JSON.stringify(audio,null,2));
 assert.deepEqual(errors,[]);
 console.log('PASS V501 worlds: ten rendered room identities, stable exit geometry, responsive harbor selector, ten non-silent offline audio renders. Access/camera are fixtures.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
