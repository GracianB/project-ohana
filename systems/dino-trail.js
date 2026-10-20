// VALLE DE LOS GIGANTES — Dino's solo campaign chapter inside the expanded Claro.
// Mud geysers, shatterable amber gates, moving stone rails, fossil beacons,
// and the ancient stone arena with the Coloso de Piedra.
import {movePlatform} from './moving-platforms.js';
import {createDinoBoss,DINO_BOSS_ID} from './dino-boss.js';

const SAVE_KEY='dino-trail-v1';
const FRAGMENT_PREFIX='dino-fossil-';

export const DINO_BEACONS=Object.freeze([
 Object.freeze({id:'dino-gorge',x:440,y:1074,label:'FÓSIL',need:0,line:'El monolito de piedra resuena con los pasos de los gigantes.'}),
 Object.freeze({id:'dino-plateau',x:1720,y:1090,label:'MESETA',need:2,line:'Los géiseres de fango impulsan a las criaturas ancestrales.'}),
 Object.freeze({id:'dino-shrine',x:3080,y:1084,label:'ANCESTRAL',need:4,line:'¡El Coloso de Piedra despierta en la cúspide del valle!'})
]);

export const DINO_FOSSILS=Object.freeze([
 Object.freeze({id:'a',x:540,y:1070}),
 Object.freeze({id:'b',x:820,y:830}),
 Object.freeze({id:'c',x:1480,y:1085}),
 Object.freeze({id:'d',x:2020,y:1080}),
 Object.freeze({id:'e',x:2520,y:1035}),
 Object.freeze({id:'f',x:2870,y:1075}),
 Object.freeze({id:'g',x:3350,y:1075}),
 Object.freeze({id:'h',x:3780,y:1075})
]);

export const DINO_GEYSERS=Object.freeze([
 Object.freeze({x:980,y:1134,force:16.5,color:'#8d6e63'}),
 Object.freeze({x:1720,y:1134,force:17.2,color:'#a1887f'}),
 Object.freeze({x:2350,y:1134,force:16.5,color:'#8d6e63'}),
 Object.freeze({x:2800,y:1134,force:17.0,color:'#a1887f'})
]);

export const DINO_GATES=Object.freeze([
 Object.freeze({x:1500,y:1134,w:65,height:170,offset:0}),
 Object.freeze({x:2550,y:1134,w:65,height:170,offset:68}),
 Object.freeze({x:2830,y:1134,w:65,height:170,offset:136})
]);

export const DINO_ACTS=Object.freeze([
 'LA GARGANTA DE LOS FÓSILES','LA MESETA DE LOS GIGANTES','LA CAVERNA DEL ÁMBAR',
 'EL COLOSO DE PIEDRA','EL FÓSIL DE LA FAMILIA'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read=(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

export function enterDinoTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='dino'||g.personalAdventureSolo===false){g.dinoTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(DINO_BOSS_ID);
 const index=complete?DINO_BEACONS.length:Math.max(0,DINO_BEACONS.findIndex(b=>!saved.has(b.id)));
 const lifts=[
  {axis:'x',x:1000,y:940,span:300,period:280},
  {axis:'y',x:1520,y:1080,span:300,period:320},
  {axis:'x',x:2250,y:920,span:340,period:300},
  {axis:'y',x:2800,y:1040,span:420,period:350}
 ].map((motion,i)=>{
  motion.start=Number(g.t)||0;motion.phase=i*.75;
  const platform={x:motion.x,y:motion.y,w:190,h:22,_campaignLift:true};
  return {motion,platform};
 });
 for(const item of lifts)if(!g.platforms.includes(item.platform))g.platforms.push(item.platform);
 g.dinoTrail={
  saved,complete,index:index<0?DINO_BEACONS.length:index,
  bossDefeated:cleared,banner:0,bannerText:'',bannerSub:'',lifts,
  gateShorts:[0,0,0],altarLit:complete,altarAge:0,
  act:cleared?4:Math.min(3,index<0?3:index)
 };
}

export function updateDinoTrail(game,hurtPlayer){
 const s=game.dinoTrail,p=game.player;if(!s||!p||p.dead)return;
 for(const item of s.lifts)movePlatform(item.platform,item.motion,game.t,p);
 if(s.banner>0)s.banner--;

 // Mud geyser pads: seismic burst upward
 for(const pad of DINO_GEYSERS){
  const cx=pad.x,dx=Math.abs(p.x+p.w/2-cx);
  if(dx<45&&p.y<pad.y&&p.y>pad.y-260){
   p.vy=Math.max(-pad.force,p.vy-1.1);
   p.grounded=false;
   if(game.t%4===0){
    game.fx?.emit?.(p.x+p.w/2,p.y+p.h,{color:pad.color,count:2,up:4.5,size:4,life:25});
   }
  }
 }

 // Amber gates
 for(let i=0;i<DINO_GATES.length;i++){
  const gate=DINO_GATES[i];
  if(s.gateShorts[i]>0){s.gateShorts[i]--;continue;}
  const near=Math.abs(p.x+p.w/2-gate.x)<gate.w+25&&p.y+p.h>gate.y-gate.height&&p.y<gate.y;
  if(near){
   if(p.x+p.w/2<gate.x)p.x=gate.x-gate.w-p.w/2;
   else p.x=gate.x+gate.w+p.w/2;
   p.vx=0;
  }
 }

 // Collect fossils
 for(const f of DINO_FOSSILS){
  const key=FRAGMENT_PREFIX+f.id;
  if(!s.saved.has(key)&&inRange(p,f.x,f.y,38)){
   persist(game,key);
   s.saved.add(key);
   game.nums?.add?.(f.x,f.y-25,'+1 FÓSIL DE ÁMBAR','#ffe082',true);
   game.fx?.emit?.(f.x,f.y,{color:'#ffd54f',count:10,up:4,size:3.5,life:30});
  }
 }

 // Beacons
 for(let i=0;i<DINO_BEACONS.length;i++){
  const b=DINO_BEACONS[i];
  if(!s.saved.has(b.id)&&inRange(p,b.x,b.y,60)){
   const collected=[...s.saved].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length;
   if(collected>=b.need){
    persist(game,b.id);
    s.saved.add(b.id);
    s.index=i+1;
    s.act=Math.min(4,i+1);
    s.banner=180;
    s.bannerText=b.label+' ACTIVADO';
    s.bannerSub=b.line;
    game.fx?.emit?.(b.x,b.y,{color:'#ffb74d',count:16,up:6,size:4.5,life:45});
   }
  }
 }

 // Mini Boss encounter spawn
 const arenaX=3420,arenaY=1134;
 const bossDefeated=(game.clearedEncounters?.hub||[]).includes(DINO_BOSS_ID);
 if(!bossDefeated&&!game.enemies.some(e=>e._dinoBoss)&&Math.abs(p.x-arenaX)<750){
  const boss=createDinoBoss((x,y,k,r,idx,extra)=>game.createEnemy?.(x,y,k,r,idx,extra)||{x,y,w:128,h:104,hp:480,max:480});
  game.enemies.push(boss);
 }
 if(!s.bossDefeated&&bossDefeated){
  s.bossDefeated=true;
  s.act=4;
  s.banner=200;
  s.bannerText='¡COLOSO DE PIEDRA DERROTADO!';
  s.bannerSub='El Altar del Guardián Antiguo ha despertado.';
 }

 // Relic Altar
 const altarX=3780,altarY=1100;
 if(s.bossDefeated&&!s.complete&&inRange(p,altarX,altarY,65)){
  persist(game,SAVE_KEY);
  s.complete=true;
  s.altarLit=true;
  s.banner=240;
  s.bannerText='¡RELIQUIA: FÓSIL DE LA FAMILIA!';
  s.bannerSub='Dino ha despertado la bendición del Guardián Antiguo.';
  p._heroHundredBonus='FÓSIL DE LA FAMILIA';
  game.roomAlbums?.hub?.relic?.();
 }
}

export function dinoAbility(game,player,index){
 const s=game.dinoTrail;if(!s||!player)return;
 for(let i=0;i<DINO_GATES.length;i++){
  const gate=DINO_GATES[i];
  if(Math.abs(player.x+player.w/2-gate.x)<100&&Math.abs(player.y-gate.y)<gate.height+80){
   s.gateShorts[i]=160;
   game.nums?.add?.(gate.x,gate.y-gate.height/2,'¡ROCA ROTA!','#ffe082',true);
   game.fx?.emit?.(gate.x,gate.y-gate.height/2,{color:'#8d6e63',count:15,up:5,size:4,life:35});
  }
 }
}

export function drawDinoTrail(ctx,game,cam,t){
 const s=game.dinoTrail;if(!s)return;
 ctx.save();

 // Draw Mud Geysers
 for(const vent of DINO_GEYSERS){
  const vx=vent.x-cam.x,vy=vent.y-cam.y;
  ctx.fillStyle='#5d4037';
  ctx.beginPath();
  ctx.moveTo(vx-32,vy);
  ctx.lineTo(vx-18,vy-18);
  ctx.lineTo(vx+18,vy-18);
  ctx.lineTo(vx+32,vy);
  ctx.closePath();
  ctx.fill();
  const pulse=Math.sin(t*0.18+vent.x)*8;
  ctx.fillStyle='rgba(141,110,99,0.45)';
  ctx.beginPath();
  ctx.moveTo(vx-18,vy-18);
  ctx.lineTo(vx-26,vy-160+pulse);
  ctx.lineTo(vx+26,vy-160+pulse);
  ctx.lineTo(vx+18,vy-18);
  ctx.closePath();
  ctx.fill();
 }

 // Draw Amber Gates
 for(let i=0;i<DINO_GATES.length;i++){
  const g=DINO_GATES[i],shorted=s.gateShorts[i]>0;
  const gx=g.x-cam.x,gy=g.y-cam.y;
  if(shorted){
   ctx.strokeStyle='rgba(255,213,79,0.35)';ctx.lineWidth=2;ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
  }else{
   ctx.fillStyle='#6d4c41';
   ctx.fillRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.strokeStyle='#d7ccc8';ctx.lineWidth=3;
   ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.fillStyle='#ffca28';
   ctx.beginPath();
   ctx.arc(gx,gy-g.height/2,16,0,Math.PI*2);
   ctx.fill();
  }
 }

 // Draw Amber Fossils
 for(const f of DINO_FOSSILS){
  const key=FRAGMENT_PREFIX+f.id;
  if(s.saved.has(key))continue;
  const fx=f.x-cam.x,fy=f.y-cam.y;
  const bob=Math.sin(t*0.1+f.x)*5;
  ctx.fillStyle='#ffb74d';
  ctx.strokeStyle='#ffe082';ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(fx,fy-14+bob);
  ctx.lineTo(fx+12,fy+bob);
  ctx.lineTo(fx,fy+14+bob);
  ctx.lineTo(fx-12,fy+bob);
  ctx.closePath();
  ctx.fill();ctx.stroke();
 }

 // Draw Fossil Beacons
 for(const b of DINO_BEACONS){
  const active=s.saved.has(b.id);
  const bx=b.x-cam.x,by=b.y-cam.y;
  ctx.fillStyle='#4e342e';ctx.fillRect(bx-10,by-40,20,40);
  ctx.fillStyle=active?'#ffca28':'#8d6e63';
  ctx.beginPath();ctx.arc(bx,by-48,14,0,Math.PI*2);ctx.fill();
  if(active){
   ctx.fillStyle='rgba(255,202,40,0.35)';
   ctx.beginPath();ctx.arc(bx,by-48,26+Math.sin(t*0.15)*4,0,Math.PI*2);ctx.fill();
  }
 }

 // Draw Relic Altar
 const ax=3780-cam.x,ay=1100-cam.y;
 ctx.fillStyle='#3e2723';
 ctx.fillRect(ax-40,ay-20,80,20);
 ctx.fillStyle=s.altarLit?'#ffb300':'#a1887f';
 ctx.beginPath();ctx.arc(ax,ay-35,22,0,Math.PI*2);ctx.fill();
 if(s.altarLit){
  ctx.fillStyle='rgba(255,179,0,0.35)';
  ctx.beginPath();ctx.arc(ax,ay-35,40+Math.sin(t*0.1)*6,0,Math.PI*2);ctx.fill();
 }

 // Act Banner
 if(s.banner>0&&s.bannerText){
  ctx.fillStyle='rgba(30,18,10,0.85)';
  ctx.fillRect(180,45,740,55);
  ctx.strokeStyle='#ffca28';ctx.lineWidth=2;
  ctx.strokeRect(180,45,740,55);
  ctx.fillStyle='#ffe082';ctx.font='bold 16px sans-serif';ctx.textAlign='center';
  ctx.fillText(s.bannerText,550,70);
  ctx.fillStyle='#d7ccc8';ctx.font='12px sans-serif';
  ctx.fillText(s.bannerSub,550,90);
 }
 ctx.restore();
}

export function dinoTrailSnapshot(g){
 return {
  active:!!g.dinoTrail,
  complete:g.dinoTrail?.complete||false,
  act:g.dinoTrail?.act||0,
  fossils:[...g.dinoTrail?.saved||[]].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length
 };
}
