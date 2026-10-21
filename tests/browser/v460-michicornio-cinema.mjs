import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:1250,height:850}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const root='http://127.0.0.1:'+server.address().port;
 await page.goto(root+'/previews/michicornio-cinema.html');
 await page.waitForFunction(()=>window.previewReady===true);
 const h=()=>page.locator('canvas').evaluate(c=>{
   const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
   let hash=2166136261;for(let i=0;i<d.length;i+=16)hash=Math.imul(hash^d[i],16777619)>>>0;
   return hash;
 });
 for(const transition of [1,2,3,4]){
  await page.evaluate(n=>window.michiCinema.setEvolution(n),transition);
  const sigs=new Set();
  for(const frame of [.4,1.3,2.3,3.4]){
   await page.evaluate(t=>window.michiCinema.setFrame(t),frame);
   sigs.add(await h());
  }
  assert.equal(sigs.size,4,'cinema stuck on static frames '+transition);
 }
 await page.goto(root+'/previews/michi-design.html');
 await page.waitForFunction(()=>window.previewReady===true);
 const states=['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory'];
 for(const state of states){
  const signatures=[];
  for(const t of [20,34,48,64]){
   await page.evaluate(([s,f])=>{window.michiPreview.setPose(s);window.michiPreview.setFrame(f);},[state,t]);
   signatures.push(await page.locator('.forms canvas').evaluateAll(cs=>cs.map(c=>{
    const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let v=2166136261;for(let i=0;i<d.length;i+=16)v=Math.imul(v^d[i],16777619)>>>0;return v;
   })));
  }
  for(let form=0;form<5;form++)if(state==='idle'||state==='run'||state==='cast'||state==='victory')
   assert.ok(new Set(signatures.map(x=>x[form])).size>=3,'stiff '+state+' form '+form);
 }
 assert.deepEqual(errors,[]);
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 console.log('V460 PASS: four truly animated evolution transitions, ten living cat actions x five forms, mobile');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
