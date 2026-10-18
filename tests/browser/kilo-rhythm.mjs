import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try {
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1400,height:1060}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/kilo-rhythm-preview',r=>r.fulfill({contentType:'text/html',body:'<canvas width="1400" height="1060"></canvas><style>body{margin:0;background:#14232b}</style>'}));
 await page.goto(`http://127.0.0.1:${server.address().port}/kilo-rhythm-preview`);
 await page.evaluate(async()=>{
  const {default:art}=await import('/characters/art/lilo.js'),{R}=await import('/characters/rig.js');
  const ctx=document.querySelector('canvas').getContext('2d');
  ctx.fillStyle='#14232b';ctx.fillRect(0,0,1400,1060);
  ctx.fillStyle='#fff1d9';ctx.font='700 30px sans-serif';ctx.fillText('KILO · A COMPÁS',40,48);
  ctx.font='17px sans-serif';ctx.fillText('H / J: acierta y carga pétalos     K: baile potenciado     L: floración y curación',40,80);
  for(let row=0;row<4;row++)for(let f=0;f<5;f++){
   const x=145+f*275,y=290+row*240;
   const pose={form:f,t:140,phase:1.6,state:row===0?'attack':'cast',speed:0,land:0,turnPulse:0,brake:0,look:{x:1,y:0},air:false,flourish:0,flourishN:0,atk:.48,cast:.38,blink:0,bodyTilt:0,headTilt:0,move:null,vy:0,castSlot:row-1,hurt:0,nineLives:0,sway:.12,bounce:.1,breath:.4,evoT:0,squash:0,stretch:0,armSwing:0,legSwing:0,anticipation:0,impact:0,secondary:0};
   ctx.save();ctx.translate(x,y);ctx.scale(1.3,1.3);art.draw(ctx,pose,R);ctx.restore();
   ctx.fillStyle='#fff1d9';ctx.font='600 14px sans-serif';ctx.textAlign='center';ctx.fillText(['H · Golpe','J · Rasgueo','K · Baile','L · Floración'][row]+' / '+['Bebé','Kilo','Ohana','Super','Flor Solar'][f],x,y+24);
  }
 });
 assert.deepEqual(errors,[]);
 await fs.mkdir('test-results/kilo-rhythm',{recursive:true});
 await page.screenshot({path:'test-results/kilo-rhythm/kilo-combat.png'});
 const play=await browser.newPage({viewport:{width:1280,height:720}});
 play.on('pageerror',e=>errors.push(e.message));
 await play.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`,{waitUntil:'domcontentloaded'});
 await play.waitForFunction(()=>!!window.__OHANA_E2E,{timeout:20000});
 const states=await play.evaluate(()=>{
   const api=window.__OHANA_E2E,states=[];
   for(let evo=0;evo<5;evo++) {
     api.start('kilo');api.setEvo(evo);api.setInvulnerable(9999);
     api.attack();api.step(16);
     for(let slot=0;slot<4;slot++){api.cast(slot);api.step(12);}
     states.push(api.state());
   }
   return states;
 });
 assert.ok(states.every(s=>s.running&&s.hp>0&&s.lastAbilitySlot===3&&s.runtimeFaults===0));
 await play.screenshot({path:'test-results/kilo-rhythm/kilo-gameplay.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: twenty Kilo combat poses in real Canvas.');
} finally {await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
