// Real renderer and AI fixtures; this is not an earned campaign victory.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import{chromium}from'playwright';import{startServer}from'./server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'}),dir='test-results/v657';
try{
 await fs.mkdir(dir,{recursive:true});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/gallery.html`);
 const result=await page.evaluate(async()=>{
  const F=await import('/systems/fusion-boss.js'),{WORLD1_FLOOR:floor}=await import('/systems/world1-rooms.js');
  const make=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const canvas=make(1400,1000),c=canvas.getContext('2d'),signatures=[],purity=[],reduced=[],motion=[];
  const kinds=['orb','ring','wave','fire','meteor','jelly','wheel','node','echo'];
  for(let i=0;i<kinds.length;i++){
   const tile=make(140,140),ctx=tile.getContext('2d'),s={k:kinds[i],x:70,y:70,r:45,life:90,age:17,col:['#8cddd8','#f1cdaa','#b3a2ea'][i%3],vx:6,vy:2},b={shots:[s]},before=JSON.stringify(b);
   const render=(age,reduce)=>{s.age=age;ctx.clearRect(0,0,140,140);F.drawFusionProjectiles(ctx,b,{x:0,y:0},age*3,reduce);return tile.toDataURL();};
   const a=render(17,false),z=render(41,false);motion.push(a!==z);signatures.push(a);reduced.push(render(17,true)===render(89,true));s.age=17;purity.push(before===JSON.stringify(b));
   const x=(i%5)*280,y=Math.floor(i/5)*300;c.fillStyle='#0e1b2d';c.fillRect(x,y,280,300);c.drawImage(tile,x+70,y+60);c.fillStyle='#d8eadc';c.font='16px sans-serif';c.fillText(kinds[i],x+22,y+30);
  }
  // Phase-three floor and high beams must retain their complete contact bands.
  let bounded=true;
  for(const s of[{k:'bolt',x:100,r:34,life:17},{k:'geyser',x:100,r:34,life:40},{k:'beam',x:100,r:0,band:floor-130,life:40,liveFor:50}]){
   const tile=make(280,1200),ctx=tile.getContext('2d'),box=F.fusionShotBounds(s),cam={x:s.k==='beam'?box.x:0,y:0};F.drawFusionProjectiles(ctx,{shots:[s]},cam,40,false);const pixels=ctx.getImageData(0,0,280,1200).data;
   for(let y=0;y<1200;y++)for(let x=0;x<280;x++)if(pixels[(y*280+x)*4+3]>24&&(x<box.x-cam.x-1||x>box.x-cam.x+box.w+1||y<box.y-1||y>box.y+box.h+1))bounded=false;
  }
  // Warmed worst-case art batch uses the production cap, not an unbounded pool.
  const stress=make(1200,800),ctx=stress.getContext('2d'),shots=Array.from({length:90},(_,i)=>({k:kinds[i%kinds.length],x:70+i%10*110,y:70+Math.floor(i/10)*70,r:25,life:60,age:i,col:'#8cddd8',vx:5,vy:1}));
  const timings=[];for(let i=0;i<12;i++){const t=performance.now();F.drawFusionProjectiles(ctx,{shots},{x:0,y:0},i,false);if(i>2)timings.push(performance.now()-t);}
  return{sheet:canvas.toDataURL().split(',')[1],distinct:new Set(signatures).size,purity,reduced,motion,bounded,medianMs:timings.sort((a,b)=>a-b)[Math.floor(timings.length/2)]};
 });
 assert.equal(result.distinct,9);assert.ok(result.purity.every(Boolean));assert.ok(result.reduced.every(Boolean));assert.ok(result.bounded);assert.ok(result.medianMs<80,'bounded 90-shot renderer budget');
 await fs.writeFile(`${dir}/projectile-materials.png`,Buffer.from(result.sheet,'base64'));delete result.sheet;
 await page.goto(`http://127.0.0.1:${server.address().port}/previews/quimera-design.html`);await page.waitForFunction(()=>window.previewReady);
 for(const attack of['ola','plasma','rayos','medusas','aliento','geiseres','ruedas','red']){await page.selectOption('#attack',attack);await page.waitForTimeout(1450);await page.screenshot({path:`${dir}/attack-${attack}.png`});}
 await page.selectOption('#pose','rest');await page.selectOption('#phase','4');await page.screenshot({path:`${dir}/quimera-final.png`});
 await page.setViewportSize({width:390,height:844});await page.selectOption('#pose','combat');await page.selectOption('#attack','rayos');await page.waitForTimeout(1550);await page.screenshot({path:`${dir}/attack-mobile.png`});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);await fs.writeFile(`${dir}/validation.json`,JSON.stringify({...result,errors},null,2));console.log('PASS V657: nine distinct materials, immutable rendering, reduced motion, collision-bound light, 90-shot budget and real attack preview; median',result.medianMs,'ms');
}finally{await browser.close();server.closeAllConnections();server.close();}
