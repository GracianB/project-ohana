// Visual/rendering fixtures, not campaign progress or a difficulty benchmark.
import assert from'node:assert/strict';import fs from'node:fs/promises';import{chromium}from'playwright';import{startServer}from'./server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],rasterRequests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/(?:-realm\.webp|observatory-keyart\.png)/.test(r.url()))rasterRequests.push(r.url());});
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await fs.mkdir('test-results/v605',{recursive:true});
 await page.evaluate(async()=>{window.realm=await import('/worlds/living-realms.js');const canvas=document.createElement('canvas');canvas.id='realm-preview';canvas.style.cssText='position:fixed;inset:0;z-index:99999;width:100vw;height:100vh';document.body.append(canvas);window.paintRealm=(hero,x=2400,t=180,reduced=false)=>{canvas.width=innerWidth;canvas.height=innerHeight;const c=canvas.getContext('2d');realm.drawLivingRealm(c,hero,{x,y:0},canvas.width,canvas.height,t,{reduceMotion:reduced});const data=c.getImageData(0,0,canvas.width,canvas.height).data;let hash=2166136261;for(let i=0;i<data.length;i+=16)hash=Math.imul(hash^data[i],16777619)>>>0;return hash;};});
 const report=[];
 for(const hero of ['stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi','final']){
  const a=await page.evaluate(hero=>paintRealm(hero),hero);await page.screenshot({path:`test-results/v605/${hero}-desktop.png`});
  const b=await page.evaluate(hero=>paintRealm(hero,7800),hero);assert.notEqual(a,b,'camera moves distinct depth layers '+hero);
  const motion=await page.evaluate(hero=>paintRealm(hero,2400,330),hero);assert.notEqual(a,motion,'living scenery animates '+hero);
  const reduced=await page.evaluate(hero=>[paintRealm(hero,2400,180,true),paintRealm(hero,2400,330,true)],hero);assert.equal(reduced[0],reduced[1],'reduced motion is stable '+hero);
  const cache=await page.evaluate(()=>realm.livingRealmCache());assert.ok(cache.entries<=2);assert.ok(cache.bytes<48*1024*1024,'bounded decorative cache');
  const timing=await page.evaluate(hero=>{const canvas=document.querySelector('#realm-preview'),c=canvas.getContext('2d'),samples=[];for(let i=0;i<45;i++){const start=performance.now();realm.drawLivingRealm(c,hero,{x:2400+i*4,y:0},canvas.width,canvas.height,i*6);samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);return {medianMs:samples[22],p95Ms:samples[42],scope:'CPU Canvas submission; not whole-game FPS'};},hero);
  report.push({hero,parallax:true,animation:true,reducedMotion:true,cache,timing});
 }
 await page.setViewportSize({width:390,height:844});for(const hero of ['stitcho','chispin','cuerno','pizza','yomi','final']){await page.evaluate(hero=>paintRealm(hero,7800),hero);await page.screenshot({path:`test-results/v605/${hero}-mobile.png`});}
 await page.evaluate(()=>document.querySelector('#realm-preview').remove());await page.setViewportSize({width:1280,height:800});
 for(const hero of ['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi','final']){
  await page.evaluate(hero=>{const e=__OHANA_E2E;e.startWorld1(hero==='final'?'kilo':hero);e.loadRoom('w1-'+hero);e.step(600);e.step(600);e.setEvo(2);e.setPlayer(2450,1000);e.setInvulnerable(600);e.step(60);},hero);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>__OHANA_E2E.state().runtimeFaults),0);await page.screenshot({path:`test-results/v605/${hero}-game.png`});
 }
 assert.deepEqual(rasterRequests,[]);assert.deepEqual(errors,[]);await fs.writeFile('test-results/v605/living-realms.json',JSON.stringify({report,rasterRequests,errors},null,2));console.log('PASS ten code-painted realms: parallax, live atmosphere, reduced motion, bounded cache, mobile and game integration; no landscape images requested');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
