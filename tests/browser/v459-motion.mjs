import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const root='http://127.0.0.1:'+server.address().port;
 await page.goto(root+'/previews/animation-lab.html');
 try{await page.waitForFunction(()=>window.previewReady===true,{timeout:12000});}
 catch(error){throw Error('Animation lab did not boot: '+errors.join(' | ')+'; '+error.message);}
 assert.deepEqual(await page.evaluate(()=>window.__labErrors||[]),[],'animation lab hero renderer errors');
 assert.equal(await page.locator('#heroes canvas').count(),10);
 assert.equal(await page.locator('#actions button').count(),10);
 const results=await page.evaluate(()=>{
  const hash=c=>{
   const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
   let h=2166136261,n=0;
   for(let i=0;i<d.length;i+=8){h=Math.imul(h^d[i],16777619)>>>0;n+=(i%4===0&&d[i+3]>0)?1:0;}
   return [h,n];
  };
  const output=[];const canvases=[...document.querySelectorAll('#heroes canvas')];
  for(const action of window.actionLab.actions){
   window.actionLab.setAction(action);window.actionLab.setFrame(73);
   output.push({action,samples:canvases.map(c=>hash(c))});
  }
  return output;
 });
 assert.equal(results.length,10);
 for(let id=0;id<10;id++){
  assert.ok(results.every(x=>x.samples[id][1]>0),'blank hero '+id);
  const signatures=new Set(results.map(x=>x.samples[id][0]));
  assert.equal(signatures.size,10,'indistinguishable 10 poses for hero '+id);
 }
 await page.evaluate(()=>{window.actionLab.setReduced(true);window.actionLab.setAction('victory');window.actionLab.setFrame(70);});
 const still=await page.locator('#heroes canvas').evaluateAll(cs=>cs.map(c=>c.toDataURL()));
 await page.evaluate(()=>window.actionLab.setFrame(130));
 assert.deepEqual(await page.locator('#heroes canvas').evaluateAll(cs=>cs.map(c=>c.toDataURL())),still,'reduced-motion must not change with clock');
 await page.goto(root+'/previews/michi-design.html');
 await page.waitForFunction(()=>window.previewReady===true);
 assert.equal(await page.locator('.forms canvas').count(),5);
 for(const action of ['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory']){
  await page.evaluate(a=>{window.michiPreview.setPose(a);window.michiPreview.setFrame(82);},action);
  const visible=await page.locator('.forms canvas').evaluateAll(cs=>cs.map(c=>{
   const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
   return data.some((v,i)=>i%4===3&&v>0);
  }));
  assert.deepEqual(visible,[true,true,true,true,true],'blank Michicornio form '+action);
 }
 await page.evaluate(()=>{window.michiPreview.setReduced(true);window.michiPreview.setFrame(73);window.michiPreview.setPose('cast');});
 const frame1=await page.locator('.forms canvas').evaluateAll(cs=>cs.map(c=>c.toDataURL()));
 await page.evaluate(()=>window.michiPreview.setFrame(126));
 const frame2=await page.locator('.forms canvas').evaluateAll(cs=>cs.map(c=>c.toDataURL()));
 assert.deepEqual(frame2,frame1,'Michicornio reduced motion should remain deterministic');
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile overflow');
 assert.deepEqual(errors,[]);
 console.log('V459 animation PASS: 100 hero/action Canvas states, 50 Michicornio form/action renders, reduced-motion stable, mobile');
} finally {
 await browser?.close();server.closeAllConnections();
 await new Promise(done=>server.close(done));
}
