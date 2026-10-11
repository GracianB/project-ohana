import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/michi-v304-preview',route=>route.fulfill({contentType:'text/html',body:'<html><body></body></html>'}));
 await page.goto(`http://127.0.0.1:${server.address().port}/michi-v304-preview`);
 await page.setContent('<canvas id="audit" width="1280" height="900"></canvas><style>body{margin:0;background:#14232b}</style>');
 const result=await page.evaluate(async()=>{
  const {ROSTER}=await import('/characters/roster.js'),{drawCharacter}=await import('/characters/draw.js');
  const {drawMichiDuet,startMichiDuet,updateMichiDuet}=await import('/systems/michi-duet.js');
  const {useAbility,updateAbilityFx,clearAbilityFx,drawAbilityFx}=await import('/systems/abilities.js');
  localStorage.setItem('ohana-look-v2','vector');
  const ctx=document.querySelector('canvas').getContext('2d'),def=ROSTER.find(r=>r.id==='cat');
  ctx.fillStyle='#14232b';ctx.fillRect(0,0,1280,900);ctx.font='700 28px sans-serif';ctx.fillStyle='#fff1d9';
  ctx.fillText('MICHI · V304 · cinco formas · ¡Ese ovillo quema!',35,45);
  const densities=[];
  for(let evo=0;evo<5;evo++){
   const form=def.forms[evo],x=128+evo*250;
   const p={...def,...form,id:'cat',evo,x:x-form.w/2,y:335-form.h,facing:1,vx:0,vy:0,grounded:true,visualScale:1.65};
   ctx.strokeStyle='#76cbb4';ctx.beginPath();ctx.moveTo(x-85,336);ctx.lineTo(x+85,336);ctx.stroke();
   drawCharacter(ctx,p,{x:0,y:0},45);
   ctx.fillStyle='#fff1d9';ctx.font='700 16px sans-serif';ctx.textAlign='center';ctx.fillText(form.name,x,373);
   const data=ctx.getImageData(x-90,60,180,275).data;let count=0;
   for(let i=0;i<data.length;i+=4)if(data[i]!==20||data[i+1]!==35||data[i+2]!==43)count++;
   densities.push(count);
  }
  for(const [i,age] of [3,22,55,115].entries()){
   ctx.save();ctx.beginPath();ctx.rect(i*320,410,320,320);ctx.clip();ctx.translate(i*320,410);ctx.scale(.62,.62);
   const p={...def,...def.forms[4],id:'cat',evo:4,x:230,y:230,facing:1,vx:0,vy:0,grounded:true,_michiDuetAge:age,_michiDuetT:120-age};
   drawCharacter(ctx,p,{x:0,y:0},age);
   const scene={player:p,enemies:[{x:340,y:230,w:24,h:24,hp:10000}]};startMichiDuet(scene);for(let j=0;j<age;j++)updateMichiDuet(scene,()=>true);drawMichiDuet(ctx,scene._michiDuet,{x:0,y:0},age,drawCharacter,ROSTER,true);ctx.restore();
   ctx.fillStyle='#fff1d9';ctx.font='700 16px sans-serif';ctx.fillText(['Llega Dragón','¡Ese ovillo quema!','Colas + meteoros','Ovillo de estrella'][i],160+i*320,745);
  }
  const g={player:{...def,...def.forms[4],id:'cat',evo:4,x:200,y:200,facing:1,health:30,maxHealth:100,cds:{},cdDur:{},xp:0},roomId:'hub',enemies:[],projectiles:[],ghosts:[],platforms:[],worldW:1600,worldH:900,cam:{x:0,y:0},t:0,score:0,fx:{emit(){}},nums:{add(){}}};
  clearAbilityFx();useAbility(g,3);for(let i=0;i<65;i++){g.t++;updateAbilityFx(g);}
  const scratch=document.createElement('canvas');scratch.width=800;scratch.height=600;drawAbilityFx(scratch.getContext('2d'),g,65);
  const inWorld=!!g._michiDuet&&g.ult.t===0&&!document.querySelector('#supreme-cinema.show');
  clearAbilityFx();return {densities,inWorld};
 });
 assert.ok(result.densities.every(n=>n>400),'each real vector form must paint visible pixels');
 assert.equal(result.inWorld,true);assert.deepEqual(errors,[]);
 await fs.mkdir('test-results/michi-v304',{recursive:true});
 await page.screenshot({path:'test-results/michi-v304/michi-five-forms-and-duet.png'});
 console.log('PASS · V304: five vector forms, actual U simulation/render and no fullscreen cinema.');
}finally{
 await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));
}
