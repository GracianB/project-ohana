import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0),browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
await fs.mkdir('test-results/v622',{recursive:true});
try{
  const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');
  const results=await page.evaluate(async()=>{
    const {drawMemoryPickup,MEMORY_PICKUPS}=await import('/systems/memory-pickup-art.js');
    const rows=[];
    for(const hero of Object.keys(MEMORY_PICKUPS)){
      const canvas=document.createElement('canvas');canvas.width=canvas.height=56;
      const c=canvas.getContext('2d',{willReadFrequently:true});
      const paint=(phase,reduceMotion)=>{c.clearRect(0,0,56,56);drawMemoryPickup(c,hero,28,28,{phase,reduceMotion,challenge:true});return [...c.getImageData(0,0,56,56).data];};
      const a=paint(0,true),b=paint(5,true);
      const xs=[],ys=[];for(let i=3;i<a.length;i+=4)if(a[i]>20){xs.push(((i-3)/4)%56);ys.push(Math.floor((i-3)/4/56));}
      let hash=2166136261;for(let i=3;i<a.length;i+=4){hash^=a[i];hash=Math.imul(hash,16777619);}
      rows.push({hero,staticReduced:a.every((v,i)=>v===b[i]),bounds:{w:Math.max(...xs)-Math.min(...xs)+1,h:Math.max(...ys)-Math.min(...ys)+1},silhouetteHash:hash>>>0});
    }
    const gallery=document.createElement('canvas');gallery.id='memory-gallery';gallery.width=1260;gallery.height=800;
    document.body.replaceChildren(gallery);document.body.style='margin:0;background:#102735';
    const c=gallery.getContext('2d');c.fillStyle='#102735';c.fillRect(0,0,1260,800);
    c.textAlign='left';c.fillStyle='#f6e6c7';c.font='700 28px Fredoka, sans-serif';c.fillText('OHANA · Recuerdos del camino',24,40);
    c.fillStyle='#bdd1ce';c.font='15px Outfit, sans-serif';c.fillText('Canvas en tiempo real · detalle ampliado y tamaño de juego sobre claro / oscuro',24,65);
    Object.entries(MEMORY_PICKUPS).forEach(([hero,meta],i)=>{
      const x=20+i%5*248,y=90+Math.floor(i/5)*350;
      c.fillStyle='#193745';c.beginPath();c.roundRect(x,y,232,332,14);c.fill();
      c.save();c.translate(x+116,y+118);c.scale(4,4);drawMemoryPickup(c,hero,0,0,{phase:0,challenge:false,reduceMotion:true});c.restore();
      c.textAlign='center';c.fillStyle='#f7e9cc';c.font='700 16px Outfit, sans-serif';c.fillText(meta.name,x+116,y+226,214);
      c.fillStyle='#284854';c.fillRect(x+36,y+248,76,56);c.fillStyle='#efe5cf';c.fillRect(x+120,y+248,76,56);
      drawMemoryPickup(c,hero,x+74,y+276,{reduceMotion:true});drawMemoryPickup(c,hero,x+158,y+276,{reduceMotion:true,challenge:true});
    });return rows;
  });
  for(const row of results){assert.equal(row.staticReduced,true,row.hero+' reduced motion');assert.ok(row.bounds.w>=14&&row.bounds.w<=46&&row.bounds.h>=15&&row.bounds.h<=48,row.hero+' finite native icon bounds');}
  assert.equal(new Set(results.map(r=>r.silhouetteHash)).size,10,'ten distinct silhouettes');assert.deepEqual(errors,[]);
  await page.locator('#memory-gallery').screenshot({path:'test-results/v622/memory-gallery.png'});
  await fs.writeFile('test-results/v622/memory-art.json',JSON.stringify({results,errors},null,2));
  console.log('PASS ten Canvas silhouettes, native bounds and static reduced-motion poses');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
