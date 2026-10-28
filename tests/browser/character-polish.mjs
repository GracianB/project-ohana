import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN ? {executablePath:process.env.CHROMIUM_BIN} : {});const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=`http://127.0.0.1:${server.address().port}/`;
 await fs.mkdir('test-results/polish',{recursive:true});
 await page.goto(base+'?e2e=1',{waitUntil:'networkidle'});
 await page.locator('.oi-story-line').filter({hasText:/./}).waitFor();
 for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:900});await page.waitForTimeout(120);
  const box=await page.locator('.oi-story-dialogue').boundingBox();
  assert.ok(box.x>=0&&box.x+box.width<=width+1&&box.y>=0,'speech stays visible');
  // V602+ cinematic stage has light dialogue text on a dark panel.
  const speech=await page.locator('.oi-story-line').evaluate(el=>getComputedStyle(el).color);
  assert.equal(speech,'rgb(236, 237, 219)','cinematic dialogue remains legible');
  await page.screenshot({path:`test-results/polish/intro-${width}.png`});
 }
 await page.locator('.oi-enter').click();
 await page.evaluate(()=>window.__OHANA_E2E.start('chispin'));
 await page.locator('#hp-text').waitFor({state:'visible'});
 assert.match(await page.locator('#hud-meta').textContent(),/Forma 1\/5/);
 await page.screenshot({path:'test-results/polish/hud-mobile.png'});
 await page.setViewportSize({width:1100,height:1000});
 await page.evaluate(async()=>{
  const {drawCharacter}=await import('/characters/draw.js'),{ROSTER}=await import('/characters/roster.js');
  const board=document.createElement('section');board.id='silhouette-audit';
  board.style.cssText='position:absolute;z-index:10000;left:0;top:0;width:1000px;background:#17373e;padding:20px;color:#fff2ce;font:16px Fredoka;';
  for(const hero of ROSTER){
   const row=document.createElement('div');row.dataset.hero=hero.id;
   row.style.cssText='display:flex;align-items:center;border-bottom:1px solid #53796d;padding:12px 0;';
   const title=document.createElement('span');title.textContent=hero.name;title.style.width='130px';row.append(title);
   for(let evo=0;evo<5;evo++){
    const canvas=document.createElement('canvas');canvas.width=170;canvas.height=160;
    const ctx=canvas.getContext('2d'),f=hero.forms[evo];
    drawCharacter(ctx,{...hero,...f,id:hero.id,evo,x:85-f.w/2,y:140-f.h,grounded:true,facing:1,vx:0,vy:0,melee:0,invuln:0},{x:0,y:0},40);
    ctx.fillStyle='#fff2ce';ctx.font='12px Outfit';ctx.textAlign='center';ctx.fillText('Forma '+(evo+1),85,157);row.append(canvas);
   }board.append(row);
  }document.body.append(board);
 });
 await page.locator('#silhouette-audit').screenshot({path:'test-results/polish/all-forms.png'});
 await page.locator('#silhouette-audit [data-hero="chispin"]').screenshot({path:'test-results/polish/chispa-forms.png'});
 await page.goto(base+'previews/u-companions.html');await page.waitForFunction(()=>window.previewReady);
 await page.selectOption('#hero','dragon');await page.selectOption('#ally','cat');
 for(const age of [66,180,240,330]){
  await page.evaluate(age=>window.uCompanionPreview.setFrame(age),age);
  const actors=await page.evaluate(()=>window.uCompanionPreview.actors());
  assert.equal(actors.length,1);assert.ok(Number.isFinite(actors[0].x));
 }
 await page.setViewportSize({width:1280,height:900});
 await page.evaluate(()=>window.uCompanionPreview.setFrame(240));
 await page.screenshot({path:'test-results/polish/surprise-encore.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS story speech bubbles at 1280/390/320px, readable player stats and extended surprise rendering');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
