// BOSQUE DEL PRISMA — Cuerno's solo campaign chapter inside the expanded Claro.
// Aurora ribbon slides, prismatic crystal blast barriers, prism shards, summit beacons,
// and the celestial prism arena with Bestia Prisma.
import {movePlatform} from './moving-platforms.js';
import {createCuernoBoss,CUERNO_BOSS_ID} from './cuerno-boss.js';

const SAVE_KEY='cuerno-trail-v1';
const FRAGMENT_PREFIX='cuerno-shard-';

export const CUERNO_BEACONS=Object.freeze([
 Object.freeze({id:'cuerno-entry',x:440,y:1074,label:'PRISMA',need:0,line:'El cristal de cuarzo refleja la primera luz de la aurora.'}),
 Object.freeze({id:'cuerno-ridge',x:1720,y:1090,label:'CRESTA',need:2,line:'Las cintas de aurora boreal vibran con energía celestial.'}),
 Object.freeze({id:'cuerno-shrine',x:3080,y:1084,label:'AURORA',need:4,line:'¡La Bestia Prisma Celestial despierta en la cumbre del bosque!'})
]);

export const CUERNO_SHARDS=Object.freeze([
 Object.freeze({id:'a',x:540,y:1070}),
 Object.freeze({id:'b',x:820,y:830}),
 Object.freeze({id:'c',x:1480,y:1085}),
 Object.freeze({id:'d',x:2020,y:1080}),
 Object.freeze({id:'e',x:2520,y:1035}),
 Object.freeze({id:'f',x:2870,y:1075}),
 Object.freeze({id:'g',x:3350,y:1075}),
 Object.freeze({id:'h',x:3780,y:1075})
]);

export const CUERNO_CRYSTALS=Object.freeze([
 Object.freeze({x:980,y:1134,force:16.8,color:'#80cbc4'}),
 Object.freeze({x:1720,y:1134,force:17.5,color:'#80deea'}),
 Object.freeze({x:2350,y:1134,force:16.8,color:'#80cbc4'}),
 Object.freeze({x:2800,y:1134,force:17.2,color:'#80deea'})
]);

export const CUERNO_BARRIERS=Object.freeze([
 Object.freeze({x:1500,y:1134,w:65,height:170,offset:0}),
 Object.freeze({x:2550,y:1134,w:65,height:170,offset:68}),
 Object.freeze({x:2830,y:1134,w:65,height:170,offset:136})
]);

export const CUERNO_ACTS=Object.freeze([
 'EL VALLE DE LOS ESPEJOS','LA CRESTA DE LA AURORA','EL BOSQUE DEL PRISMA',
 'LA BESTIA PRISMA','LA AURORA VIVA'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read=(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

export function enterCuernoTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='cuerno'||g.personalAdventureSolo===false){g.cuernoTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(CUERNO_BOSS_ID);
 const index=complete?CUERNO_BEACONS.length:Math.max(0,CUERNO_BEACONS.findIndex(b=>!saved.has(b.id)));
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
 g.cuernoTrail={
  saved,complete,index:index<0?CUERNO_BEACONS.length:index,
  bossDefeated:cleared,banner:0,bannerText:'',bannerSub:'',lifts,
  gateShorts:[0,0,0],altarLit:complete,altarAge:0,
  act:cleared?4:Math.min(3,index<0?3:index)
 };
}

export function updateCuernoTrail(game,hurtPlayer){
 const s=game.cuernoTrail,p=game.player;if(!s||!p||p.dead)return;
 for(const item of s.lifts)movePlatform(item.platform,item.motion,game.t,p);
 if(s.banner>0)s.banner--;

 // Aurora ribbon slides: speed/jump boost
 for(const slide of CUERNO_CRYSTALS){
  const cx=slide.x,dx=Math.abs(p.x+p.w/2-cx);
  if(dx<45&&p.y<slide.y&&p.y>slide.y-260){
   p.vy=Math.max(-slide.force,p.vy-1.1);
   p.grounded=false;
   if(game.t%4===0){
    game.fx?.emit?.(p.x+p.w/2,p.y+p.h,{color:slide.color,count:2,up:4.5,size:4,life:25});
   }
  }
 }

 // Prismatic barriers
 for(let i=0;i<CUERNO_BARRIERS.length;i++){
  const gate=CUERNO_BARRIERS[i];
  if(s.gateShorts[i]>0){s.gateShorts[i]--;continue;}
  const near=Math.abs(p.x+p.w/2-gate.x)<gate.w+25&&p.y+p.h>gate.y-gate.height&&p.y<gate.y;
  if(near){
   if(p.x+p.w/2<gate.x)p.x=gate.x-gate.w-p.w/2;
   else p.x=gate.x+gate.w+p.w/2;
   p.vx=0;
  }
 }

 // Collect prism shards
 for(const c of CUERNO_SHARDS){
  const key=FRAGMENT_PREFIX+c.id;
  if(!s.saved.has(key)&&inRange(p,c.x,c.y,38)){
   persist(game,key);
   s.saved.add(key);
   game.nums?.add?.(c.x,c.y-25,'+1 PRISMA DEL BOSQUE','#b2dfdb',true);
   game.fx?.emit?.(c.x,c.y,{color:'#80cbc4',count:10,up:4,size:3.5,life:30});
  }
 }

 // Beacons
 for(let i=0;i<CUERNO_BEACONS.length;i++){
  const b=CUERNO_BEACONS[i];
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
    game.fx?.emit?.(b.x,b.y,{color:'#80deea',count:16,up:6,size:4.5,life:45});
   }
  }
 }

 // Mini Boss encounter spawn
 const arenaX=3420,arenaY=1134;
 const bossDefeated=(game.clearedEncounters?.hub||[]).includes(CUERNO_BOSS_ID);
 if(!bossDefeated&&!game.enemies.some(e=>e._cuernoBoss)&&Math.abs(p.x-arenaX)<750){
  const boss=createCuernoBoss((x,y,k,r,idx,extra)=>game.createEnemy?.(x,y,k,r,idx,extra)||{x,y,w:126,h:102,hp:480,max:480});
  game.enemies.push(boss);
 }
 if(!s.bossDefeated&&bossDefeated){
  s.bossDefeated=true;
  s.act=4;
  s.banner=200;
  s.bannerText='¡BESTIA PRISMA DERROTADA!';
  s.bannerSub='El Altar de la Aurora Viva ha despertado.';
 }

 // Relic Altar
 const altarX=3780,altarY=1100;
 if(s.bossDefeated&&!s.complete&&inRange(p,altarX,altarY,65)){
  persist(game,SAVE_KEY);
  s.complete=true;
  s.altarLit=true;
  s.banner=240;
  s.bannerText='¡RELIQUIA: AURORA VIVA!';
  s.bannerSub='Cuerno ha despertado el poder de la aurora boreal.';
  p._heroHundredBonus='AURORA VIVA';
  game.roomAlbums?.hub?.relic?.();
 }
}

export function cuernoAbility(game,player,index){
 const s=game.cuernoTrail;if(!s||!player)return;
 for(let i=0;i<CUERNO_BARRIERS.length;i++){
  const gate=CUERNO_BARRIERS[i];
  if(Math.abs(player.x+player.w/2-gate.x)<100&&Math.abs(player.y-gate.y)<gate.height+80){
   s.gateShorts[i]=160;
   game.nums?.add?.(gate.x,gate.y-gate.height/2,'¡CRISTAL ROTO!','#b2dfdb',true);
   game.fx?.emit?.(gate.x,gate.y-gate.height/2,{color:'#80cbc4',count:15,up:5,size:4,life:35});
  }
 }
}

export function drawCuernoTrail(ctx,game,cam,t){
 const s=game.cuernoTrail;if(!s)return;
 ctx.save();

 // Draw Aurora Slides
 for(const slide of CUERNO_CRYSTALS){
  const sx=slide.x-cam.x,sy=slide.y-cam.y;
  ctx.fillStyle='#004d40';
  ctx.beginPath();
  ctx.moveTo(sx-32,sy);
  ctx.lineTo(sx-18,sy-18);
  ctx.lineTo(sx+18,sy-18);
  ctx.lineTo(sx+32,sy);
  ctx.closePath();
  ctx.fill();
  const pulse=Math.sin(t*0.2+slide.x)*8;
  ctx.fillStyle='rgba(128,203,196,0.5)';
  ctx.beginPath();
  ctx.moveTo(sx-18,sy-18);
  ctx.lineTo(sx-24,sy-160+pulse);
  ctx.lineTo(sx+24,sy-160+pulse);
  ctx.lineTo(sx+18,sy-18);
  ctx.closePath();
  ctx.fill();
 }

 // Draw Prismatic Barriers
 for(let i=0;i<CUERNO_BARRIERS.length;i++){
  const g=CUERNO_BARRIERS[i],shorted=s.gateShorts[i]>0;
  const gx=g.x-cam.x,gy=g.y-cam.y;
  if(shorted){
   ctx.strokeStyle='rgba(128,222,234,0.35)';ctx.lineWidth=2;ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
  }else{
   ctx.fillStyle='#00695c';
   ctx.fillRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.strokeStyle='#b2dfdb';ctx.lineWidth=3;
   ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.fillStyle='#80cbc4';
   ctx.beginPath();
   ctx.arc(gx,gy-g.height/2,16,0,Math.PI*2);
   ctx.fill();
  }
 }

 // Draw Prism Shards
 for(const c of CUERNO_SHARDS){
  const key=FRAGMENT_PREFIX+c.id;
  if(s.saved.has(key))continue;
  const fx=c.x-cam.x,fy=c.y-cam.y;
  const bob=Math.sin(t*0.12+c.x)*5;
  ctx.fillStyle='#80cbc4';
  ctx.strokeStyle='#e0f2f1';ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(fx,fy-14+bob);
  ctx.lineTo(fx+10,fy+bob);
  ctx.lineTo(fx,fy+14+bob);
  ctx.lineTo(fx-10,fy+bob);
  ctx.closePath();
  ctx.fill();ctx.stroke();
 }

 // Draw Summit Beacons
 for(const b of CUERNO_BEACONS){
  const active=s.saved.has(b.id);
  const bx=b.x-cam.x,by=b.y-cam.y;
  ctx.fillStyle='#004d40';ctx.fillRect(bx-10,by-40,20,40);
  ctx.fillStyle=active?'#80deea':'#00796b';
  ctx.beginPath();ctx.arc(bx,by-48,14,0,Math.PI*2);ctx.fill();
  if(active){
   ctx.fillStyle='rgba(128,222,234,0.35)';
   ctx.beginPath();ctx.arc(bx,by-48,26+Math.sin(t*0.15)*4,0,Math.PI*2);ctx.fill();
  }
 }

 // Draw Relic Altar
 const ax=3780-cam.x,ay=1100-cam.y;
 ctx.fillStyle='#00251a';
 ctx.fillRect(ax-40,ay-20,80,20);
 ctx.fillStyle=s.altarLit?'#80deea':'#00897b';
 ctx.beginPath();ctx.arc(ax,ay-35,22,0,Math.PI*2);ctx.fill();
 if(s.altarLit){
  ctx.fillStyle='rgba(128,222,234,0.35)';
  ctx.beginPath();ctx.arc(ax,ay-35,40+Math.sin(t*0.1)*6,0,Math.PI*2);ctx.fill();
 }

 // Act Banner
 if(s.banner>0&&s.bannerText){
  ctx.fillStyle='rgba(5,25,20,0.85)';
  ctx.fillRect(180,45,740,55);
  ctx.strokeStyle='#80cbc4';ctx.lineWidth=2;
  ctx.strokeRect(180,45,740,55);
  ctx.fillStyle='#e0f2f1';ctx.font='bold 16px sans-serif';ctx.textAlign='center';
  ctx.fillText(s.bannerText,550,70);
  ctx.fillStyle='#b2dfdb';ctx.font='12px sans-serif';
  ctx.fillText(s.bannerSub,550,90);
 }
 ctx.restore();
}

export function cuernoTrailSnapshot(g){
 return {
  active:!!g.cuernoTrail,
  complete:g.cuernoTrail?.complete||false,
  act:g.cuernoTrail?.act||0,
  shards:[...g.cuernoTrail?.saved||[]].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length
 };
}
