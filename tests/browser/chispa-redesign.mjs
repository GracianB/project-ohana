import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1250,height:750}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/chispa-review',r=>r.fulfill({contentType:'text/html',body:'<html><head><link rel="stylesheet" href="/fonts.css"></head><body style="margin:0;background:#152e3b"></body></html>'}));
 await page.goto(`http://127.0.0.1:${server.address().port}/chispa-review`);
 await page.evaluate(async()=>{await Promise.all([document.fonts.load('600 24px Fredoka'),document.fonts.load('500 14px Outfit')]);await document.fonts.ready;});
 await fs.mkdir('test-results/chispa',{recursive:true});
 const result=await page.evaluate(async()=>{
  const {drawCharacter}=await import('/characters/draw.js'),{ROSTER}=await import('/characters/roster.js');
  await (await import('/characters/art/chispa-sprite.js')).preloadChispaAtlas();
  const {drawChispaStorm,drawChispaChain,drawChispaTrail}=await import('/systems/chispa-effects.js');
  const {drawEvolutionPresentation}=await import('/systems/evo-cine/presentation.js');
  const def=ROSTER.find(r=>r.id==='chispin');let frames=0;
  const sheet=document.createElement('canvas');sheet.id='forms';sheet.width=1250;sheet.height=650;const ctx=sheet.getContext('2d');
  ctx.fillStyle='#17333f';ctx.fillRect(0,0,1250,650);ctx.fillStyle='#fff0cb';ctx.font='600 24px Fredoka';ctx.fillText('CHISPA · CINCO TRANSFORMACIONES',30,38);
  const labels=['Semilla espiritual','Familiar eléctrico','Kirin · cuatro patas','Asceta · cuatro brazos','Raijin · deidad del trueno'];
  for(let evo=0;evo<5;evo++){
   const f=def.forms[evo],x=125+evo*250;
   const p={...f,id:def.id,evo,x:x-f.w/2,y:250-f.h,grounded:true,facing:1,vx:0,vy:0,melee:0,invuln:0,visualScale:1.35,_poseOverride:'idle'};
   drawCharacter(ctx,p,{x:0,y:0},40);
   ctx.textAlign='center';ctx.fillStyle='#fff0cb';ctx.font='600 17px Fredoka';ctx.fillText(f.name,x,290);
   ctx.fillStyle='#a9c9be';ctx.font='500 11px Outfit';ctx.fillText(labels[evo],x,312);
   p.y=550-f.h;p._poseOverride='cast';p._cast={slot:2,t:50,id:'storm',form:evo};
   drawCharacter(ctx,p,{x:0,y:0},55);
   drawChispaStorm(ctx,{x:x+34,y:390,life:150,maxLife:220,next:3,bolts:[{x:x+60,y1:408,y2:570,life:7}],forecast:{x:x+60,y1:408,y2:570}},{x:0,y:0},60,false);
  }
  document.body.append(sheet);
  const c=document.createElement('canvas');c.width=500;c.height=420;const cx=c.getContext('2d');
  for(let evo=0;evo<5;evo++)for(const state of ['idle','run','jump','fall','attack','cast','hurt','victory','dead','glide'])for(const t of [20,65,130,210]){
   const f=def.forms[evo],p={...f,id:def.id,evo,x:240,y:330-f.h,grounded:!['jump','fall','glide'].includes(state),vx:state==='run'?4:0,vy:state==='fall'?3:0,facing:1,_poseOverride:state,melee:state==='attack'?6:0,invuln:0};
   const bounds=[p.x,p.y,p.w,p.h];cx.clearRect(0,0,500,420);drawCharacter(cx,p,{x:0,y:0},t);
   if(JSON.stringify(bounds)!==JSON.stringify([p.x,p.y,p.w,p.h]))throw Error('collider changed');frames++;
  }
  const cinema=document.createElement('canvas');cinema.id='cinema';cinema.width=1000;cinema.height=840;cinema.style.display='none';const cc=cinema.getContext('2d');
  for(let i=0;i<4;i++){cc.save();cc.translate(i%2*500,Math.floor(i/2)*420);drawEvolutionPresentation(cc,500,420,'chispin',i+1,3.4);cc.restore();}document.body.append(cinema);
  const small=document.createElement('canvas');small.id='small-cinema';small.width=320;small.height=568;small.style.display='none';drawEvolutionPresentation(small.getContext('2d'),320,568,'chispin',4,3.4);document.body.append(small);
  const f={x:100,y:100,life:100,next:3,bolts:[{x:110,y1:115,y2:320,life:8}],forecast:{x:110,y1:115,y2:320}};
  const before=JSON.stringify(f);drawChispaStorm(cx,f,{x:0,y:0},60,true);
  drawChispaChain(cx,{life:20,max:30,pts:[{x:10,y:30},{x:90,y:100},{x:220,y:70}]},{x:0,y:0},60,true);
  drawChispaTrail(cx,{life:30,x1:30,y1:200,x2:250,y2:200},{x:0,y:0},60,true);
  if(before!==JSON.stringify(f))throw Error('effects mutate combat');
  return {frames};
 });
 assert.equal(result.frames,200);
 await page.locator('#forms').screenshot({path:'test-results/chispa/forms-and-L.png'});
 await page.evaluate(()=>{document.querySelector('#forms').remove();document.querySelector('#cinema').style.display='block';});
 await page.locator('#cinema').screenshot({path:'test-results/chispa/evolutions.png'});
 await page.evaluate(()=>{document.querySelector('#cinema').remove();document.querySelector('#small-cinema').style.display='block';});
 await page.locator('#small-cinema').screenshot({path:'test-results/chispa/mobile-evolution.png'});
 assert.deepEqual(errors,[]);console.log('PASS Chispa: 200 pose frames, five body plans, four exclusive evolution reveals, mobile composition and immutable J/K/L drawing');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
