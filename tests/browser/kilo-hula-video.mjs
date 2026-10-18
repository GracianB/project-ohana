import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:'test-results/kilo-hula/video',size:{width:1280,height:720}}});
 const page=await context.newPage();
 await page.route('**/hula-film',r=>r.fulfill({contentType:'text/html',body:'<canvas width="1280" height="720"></canvas><style>body{margin:0;background:#14232b}</style>'}));
 await page.goto(`http://127.0.0.1:${server.address().port}/hula-film`);
 await page.evaluate(async()=>{
  const {drawCharacter}=await import('/characters/draw.js'),{ROSTER}=await import('/characters/roster.js');
  const ctx=document.querySelector('canvas').getContext('2d'),def=ROSTER.find(p=>p.id==='kilo');
  const actors=def.forms.map((form,evo)=>({...def,...form,id:'kilo',evo,x:140+evo*250-form.w/2,y:470-form.h,facing:1,grounded:true,health:100,maxHealth:100,visualScale:2.1,vx:0,vy:0}));
  await new Promise(resolve=>{
   const start=performance.now();
   function frame(now){const t=(now-start)/1000;
    ctx.fillStyle='#14232b';ctx.fillRect(0,0,1280,720);ctx.fillStyle='#fff1d9';ctx.textAlign='left';
    ctx.font='700 38px sans-serif';ctx.fillText('KILO · BAILE ALOHA',45,70);
    ctx.font='20px sans-serif';ctx.fillText(t<3.2?'K · cuatro pasos, cuatro pulsos · defensa a compás':'Victoria · baile de celebración y saludo aloha',45,110);
    actors.forEach((p,evo)=>{
     if(t<3.2){p._kiloPerformance={kind:'dance',time:t};p._poseOverride='idle';}
     else{delete p._kiloPerformance;p._poseOverride='victory';}
     drawCharacter(ctx,p,{x:0,y:0},(t<3.2?t:t-3.2)*60);
     ctx.fillStyle='#fff1d9';ctx.font='600 17px sans-serif';ctx.textAlign='center';ctx.fillText(def.evoNames[evo],140+evo*250,520);
    });
    ctx.font='18px sans-serif';ctx.textAlign='left';ctx.fillText('H / J cargan pétalos. K / L los convierten en música, protección y floración.',45,630);
    if(t<8)requestAnimationFrame(frame);else resolve();
   }requestAnimationFrame(frame);
  });
 });
 const video=page.video();await context.close();await video.saveAs('test-results/kilo-hula/kilo-aloha.webm');
 console.log('Saved Kilo hula animation.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
