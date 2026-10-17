import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`,{waitUntil:'networkidle'});
 const audit=await page.evaluate(async()=>{
  const {preloadChispaAtlas,chispaAtlasStatus,drawChispaSprite}=await import('/characters/art/chispa-sprite.js');
  if(!await preloadChispaAtlas())throw Error('approved atlas failed to load');
  const canvas=document.createElement('canvas');canvas.width=canvas.height=220;const ctx=canvas.getContext('2d'),pictures=[];
  for(let i=0;i<4;i++){
   ctx.clearRect(0,0,220,220);ctx.save();ctx.translate(110,150);
   drawChispaSprite(ctx,{form:1,state:'run',phase:(i+.5)*Math.PI*2/4});ctx.restore();pictures.push(canvas.toDataURL());
  }
  ctx.clearRect(0,0,220,220);ctx.save();ctx.translate(110,150);drawChispaSprite(ctx,{form:1,state:'idle',t:0});ctx.restore();
  const alpha=ctx.getImageData(0,0,220,220).data;let top=220,bottom=-1;
  for(let y=0;y<220;y++)for(let x=0;x<220;x++)if(alpha[(y*220+x)*4+3]>=120){top=Math.min(top,y);bottom=Math.max(bottom,y);}
  return {status:chispaAtlasStatus(),unique:new Set(pictures).size,top,bottom,corner:alpha[3]};
 });
 assert.equal(audit.unique,4);assert.equal(audit.status.ready,true);assert.equal(audit.corner,0);
 assert.ok(Math.abs(audit.bottom-150)<2&&Math.abs(audit.top-50)<3,'foot alignment and nominal height');
 await page.locator('.oi-enter').click();
 await page.evaluate(()=>{const api=window.__OHANA_E2E;api.start('chispin');api.setEvo(1);api.setInvulnerable(0);api.step(20);});
 await fs.mkdir('test-results/approved-chispa',{recursive:true});
 await page.screenshot({path:'test-results/approved-chispa/desktop.png'});
 await page.keyboard.down('d');await page.waitForTimeout(180);await page.keyboard.up('d');
 assert.ok(await page.evaluate(()=>window.__OHANA_E2E.state().runtimeFaults===0));
 for(const key of ['h','j','k']){await page.keyboard.press(key);await page.waitForTimeout(80);}
 await page.evaluate(()=>window.__OHANA_E2E.setEvo(2));
 await page.evaluate(()=>window.__OHANA_E2E.cast(2));await page.waitForTimeout(160);
 await page.screenshot({path:'test-results/approved-chispa/storm.png'});
 await page.evaluate(()=>{window.__OHANA_E2E.start('chispin');window.__OHANA_E2E.setEvo(1);});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(160);
 await page.screenshot({path:'test-results/approved-chispa/mobile.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 console.log('PASS approved Chispa: transparent atlas, four unique running frames, fixed feet, actual game controls, desktop/mobile rendering');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
