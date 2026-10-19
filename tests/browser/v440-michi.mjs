import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const p=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await p.waitForFunction(()=>window.__OHANA_E2E);
 await fs.mkdir('test-results/v440',{recursive:true});
 await p.evaluate(async()=>{
  const {default:art}=await import('/characters/art/cat.js');
  const c=document.createElement('canvas');c.id='motion-audit';c.width=1440;c.height=950;c.style='position:fixed;inset:0;z-index:999999';document.body.append(c);const ctx=c.getContext('2d');
  ctx.fillStyle='#142c3c';ctx.fillRect(0,0,c.width,c.height);
  const poses=[['CARRERA A',{state:'run',phase:Math.PI/2,speed:1}],['CARRERA B',{state:'run',phase:Math.PI*1.5,speed:1}],['SALTO',{state:'jump',air:true}],['ATERRIZAJE',{state:'idle',land:1}],['J · OVILLO',{state:'cast',castSlot:0,cast:.55}],['K · RONRONEO',{state:'cast',castSlot:1,cast:.5}],['L · COLAS',{state:'cast',castSlot:2,cast:.5}],['I · GARRA',{state:'cast',castSlot:4,michiPowerIndex:4,cast:.5}]];
  for(let f=0;f<5;f++)for(let col=0;col<poses.length;col++){
   const [name,pose]=poses[col],x=90+col*180,y=165+f*184;ctx.fillStyle='#8fbdc5';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText(name,x,y-140);ctx.strokeStyle='#426474';ctx.beginPath();ctx.moveTo(x-65,y);ctx.lineTo(x+65,y);ctx.stroke();
   ctx.save();ctx.translate(x,y);art.draw(ctx,{...pose,form:f,t:18,look:{x:1,y:0}});ctx.restore();
  }
 });
 await p.screenshot({path:'test-results/v440/michi-motion.png'});await p.locator('#motion-audit').evaluate(e=>e.remove());
 await p.evaluate(()=>{const e=window.__OHANA_E2E;e.start('cat');e.setEvo(3);e.setInvulnerable();e.setPlayer(3500,1030);e.step(30);});
 await p.keyboard.down('ArrowRight');await p.waitForTimeout(900);await p.keyboard.up('ArrowRight');
 await p.screenshot({path:'test-results/v440/michi-island.png'});
 await p.keyboard.press('k');await p.waitForTimeout(250);await p.screenshot({path:'test-results/v440/michi-purr.png'});
 const before=await p.evaluate(()=>{const e=window.__OHANA_E2E;e.start('kilo');e.loadRoom('hub');e.resetInput();e.setPlayer(270,790);e.setPlayerVelocity(0,3);return e.step(58);});
 assert.equal(before.player.grounded,true);await p.locator('#game').focus();await p.keyboard.down('ArrowDown');
 const dropped=await p.evaluate(()=>window.__OHANA_E2E.step(40));await p.keyboard.up('ArrowDown');
 assert.ok(dropped.player.y>before.player.y+75,'DOWN must leave the upper landing '+JSON.stringify({before:before.player,after:dropped.player,input:dropped.input,dropBefore:before.platformDrop,dropAfter:dropped.platformDrop,paused:dropped.paused}));assert.equal(dropped.player.grounded,true);
 const trial=await p.evaluate(()=>{const e=window.__OHANA_E2E;e.start('dragon');e.setEvo(4);e.loadRoom('volcano');e.step(12);e.setInvulnerable();const steps=[];for(const point of e.state().dragonTrialEmbers){e.setPlayer(point.x-32,point.y-12);steps.push(e.step(40).dragonTrial.count);}return steps;});
 assert.deepEqual(trial,[1,2,3]);
 const state=await p.evaluate(()=>window.__OHANA_E2E.state());assert.equal(state.runtimeFaults,0);assert.deepEqual(errors,[]);
 console.log('PASS V440: 5 Michi forms × 8 articulated poses, actual run/purr in rebuilt island, no runtime errors.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
