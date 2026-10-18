import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1400,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/hula-preview',r=>r.fulfill({contentType:'text/html',body:'<canvas width="1400" height="1100"></canvas><style>body{margin:0;background:#14232b}</style>'}));
 await page.goto(`http://127.0.0.1:${server.address().port}/hula-preview`);
 await page.evaluate(async()=>{
  const {drawCharacter}=await import('/characters/draw.js'),{ROSTER}=await import('/characters/roster.js');
  const {kiloWelcomeBeat}=await import('/systems/intro-kilo-stage.js');
  const c=document.querySelector('canvas'),ctx=c.getContext('2d'),def=ROSTER.find(p=>p.id==='kilo');
  ctx.fillStyle='#14232b';ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle='#fff1d9';ctx.font='700 32px sans-serif';ctx.fillText('KILO · BAILE ALOHA',35,45);
  ctx.font='17px sans-serif';ctx.fillText('Pasos, cadera y manos · cinco formas · entrada, intro y celebración',35,76);
  const labels=['Entrada · saludo','K · ola a la derecha','K · ola a la izquierda','Victoria · gracias, ohana'];
  for(let row=0;row<4;row++)for(let evo=0;evo<5;evo++){
   const x=150+evo*275,foot=290+row*250;
   const p={...def,...def.forms[evo],id:'kilo',evo,x:x-def.forms[evo].w/2,y:foot-def.forms[evo].h,facing:1,grounded:true,health:100,maxHealth:100,visualScale:1.7,vx:0,vy:0};
   const time=row===0?.25:row===1?.4:row===2?1.2:4;
   if(row<3)p._kiloPerformance={kind:row===0?'entrance':'dance',time};else p._poseOverride='victory';
   drawCharacter(ctx,p,{x:0,y:0},time*60);
   ctx.fillStyle='#fff1d9';ctx.font='600 14px sans-serif';ctx.textAlign='center';ctx.fillText(labels[row],x,foot+25);
  }
 });
 await fs.mkdir('test-results/kilo-hula',{recursive:true});
 await page.screenshot({path:'test-results/kilo-hula/kilo-hula.png'});
 await page.evaluate(async()=>{
  const {drawEvoCine}=await import('/systems/evo-cine/kilo.js');
  const ctx=document.querySelector('canvas').getContext('2d');ctx.fillStyle='#14232b';ctx.fillRect(0,0,1400,1100);
  for(let i=0;i<4;i++){
   ctx.save();ctx.translate((i%2)*700,Math.floor(i/2)*550);drawEvoCine(ctx,700,550,3.4,i+1,i+2);ctx.restore();
  }
 });
 await page.screenshot({path:'test-results/kilo-hula/kilo-evolutions.png'});
 assert.deepEqual(errors,[]);console.log('PASS: five-form hula, entrance, victory and four evolution reveals.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
