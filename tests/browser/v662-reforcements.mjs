import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 const p=await browser.newPage({viewport:{width:1000,height:620}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/gallery.html`);
 const result=await p.evaluate(async()=>{
  const {drawQuimeraMinion}=await import('/systems/quimera-pressure.js');const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=620;document.body.replaceChildren(canvas);document.body.style.margin=0;const c=canvas.getContext('2d'),signatures=[],purity=[],reduced=[];
  c.fillStyle='#10192b';c.fillRect(0,0,1000,620);
  for(const [row,kind]of ['eclipse-hunter','eclipse-watcher'].entries())for(const [col,mode]of ['spawn','wait','wind','dash','leap'].entries()){
   const m={kind,mode,x:100+col*190,y:row*260+130,w:38,h:42,hp:50,max:60,clock:20,facing:-1,target:{x:160+col*190,y:row*260+150}};
   const tile=document.createElement('canvas');tile.width=190;tile.height=260;const tc=tile.getContext('2d'),cam={x:col*190,y:row*260},before=JSON.stringify(m);
   drawQuimeraMinion(tc,m,cam,80,true);const a=tile.toDataURL();tc.clearRect(0,0,190,260);drawQuimeraMinion(tc,m,cam,240,true);reduced.push(a===tile.toDataURL());purity.push(before===JSON.stringify(m));if(mode==='wait')signatures.push(a);
   tc.clearRect(0,0,190,260);tc.scale(2,2);tc.translate(-52,-70);drawQuimeraMinion(tc,m,cam,80,false);c.drawImage(tile,col*190,row*260);c.fillStyle='#d4dfd8';c.font='14px sans-serif';c.fillText(kind+' · '+mode,col*190+12,row*260+25);
  }
  return {pure:purity.every(Boolean),reduced:reduced.every(Boolean),distinct:new Set(signatures).size,image:canvas.toDataURL().split(',')[1]};
 });
 assert.ok(result.pure);assert.ok(result.reduced);assert.equal(result.distinct,2);assert.deepEqual(errors,[]);await fs.mkdir('test-results/v662',{recursive:true});await fs.writeFile('test-results/v662/reinforcement-designs.png',Buffer.from(result.image,'base64'));console.log('PASS V662: distinct silhouettes in ten poses, pure render and stable reduced motion');
}finally{await browser.close();server.closeAllConnections();server.close();}
