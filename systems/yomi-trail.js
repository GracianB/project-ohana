// OBSERVATORIO ASTRAL — Yomi's solo campaign chapter inside the expanded Claro.
// Spirit float drafts, astral torii blast barriers, soul lanterns, spirit beacons,
// and the celestial observatory arena with Guía del Más Allá.
import {movePlatform} from './moving-platforms.js';
import {createYomiBoss,YOMI_BOSS_ID} from './yomi-boss.js';

const SAVE_KEY='yomi-trail-v1';
const FRAGMENT_PREFIX='yomi-soul-';

export const YOMI_BEACONS=Object.freeze([
 Object.freeze({id:'yomi-entry',x:440,y:1074,label:'ESPÍRITU',need:0,line:'El farol astral enciende su llama violeta en el umbral.'}),
 Object.freeze({id:'yomi-torii',x:1720,y:1090,label:'TORII',need:2,line:'Las corrientes del más allá levitan con suave susurro.'}),
 Object.freeze({id:'yomi-shrine',x:3080,y:1084,label:'ASTRAL',need:4,line:'¡El Guía del Más Allá despierta en el observatorio eterno!'})
]);

export const YOMI_SOULS=Object.freeze([
 Object.freeze({id:'a',x:540,y:1070}),
 Object.freeze({id:'b',x:820,y:830}),
 Object.freeze({id:'c',x:1480,y:1085}),
 Object.freeze({id:'d',x:2020,y:1080}),
 Object.freeze({id:'e',x:2520,y:1035}),
 Object.freeze({id:'f',x:2870,y:1075}),
 Object.freeze({id:'g',x:3350,y:1075}),
 Object.freeze({id:'h',x:3780,y:1075})
]);

export const YOMI_DRAFTS=Object.freeze([
 Object.freeze({x:980,y:1134,force:16.8,color:'#ba68c8'}),
 Object.freeze({x:1720,y:1134,force:17.5,color:'#ce93d8'}),
 Object.freeze({x:2350,y:1134,force:16.8,color:'#ba68c8'}),
 Object.freeze({x:2800,y:1134,force:17.2,color:'#ce93d8'})
]);

export const YOMI_BARRIERS=Object.freeze([
 Object.freeze({x:1500,y:1134,w:65,height:170,offset:0}),
 Object.freeze({x:2550,y:1134,w:65,height:170,offset:68}),
 Object.freeze({x:2830,y:1134,w:65,height:170,offset:136})
]);

export const YOMI_ACTS=Object.freeze([
 'EL UMBRAL DE LOS ESPÍRITUS','LOS SENDEROS DE TORII','EL SANTUARIO DE LAS ALMAS',
 'EL GUÍA DEL MÁS ALLÁ','LA CONSTELACIÓN ETERNA'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read=(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

export function enterYomiTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='yomi'||g.personalAdventureSolo===false){g.yomiTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(YOMI_BOSS_ID);
 const index=complete?YOMI_BEACONS.length:Math.max(0,YOMI_BEACONS.findIndex(b=>!saved.has(b.id)));
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
 g.yomiTrail={
  saved,complete,index:index<0?YOMI_BEACONS.length:index,
  bossDefeated:cleared,banner:0,bannerText:'',bannerSub:'',lifts,
  gateShorts:[0,0,0],altarLit:complete,altarAge:0,
  act:cleared?4:Math.min(3,index<0?3:index)
 };
}

export function updateYomiTrail(game,hurtPlayer){
 const s=game.yomiTrail,p=game.player;if(!s||!p||p.dead)return;
 for(const item of s.lifts)movePlatform(item.platform,item.motion,game.t,p);
 if(s.banner>0)s.banner--;

 // Spirit float drafts: gentle upward levitation
 for(const draft of YOMI_DRAFTS){
  const cx=draft.x,dx=Math.abs(p.x+p.w/2-cx);
  if(dx<45&&p.y<draft.y&&p.y>draft.y-260){
   p.vy=Math.max(-draft.force,p.vy-1.1);
   p.grounded=false;
   if(game.t%4===0){
    game.fx?.emit?.(p.x+p.w/2,p.y+p.h,{color:draft.color,count:2,up:4.5,size:4,life:25});
   }
  }
 }

 // Astral Torii Barriers
 for(let i=0;i<YOMI_BARRIERS.length;i++){
  const gate=YOMI_BARRIERS[i];
  if(s.gateShorts[i]>0){s.gateShorts[i]--;continue;}
  const near=Math.abs(p.x+p.w/2-gate.x)<gate.w+25&&p.y+p.h>gate.y-gate.height&&p.y<gate.y;
  if(near){
   if(p.x+p.w/2<gate.x)p.x=gate.x-gate.w-p.w/2;
   else p.x=gate.x+gate.w+p.w/2;
   p.vx=0;
  }
 }

 // Collect soul lanterns
 for(const c of YOMI_SOULS){
  const key=FRAGMENT_PREFIX+c.id;
  if(!s.saved.has(key)&&inRange(p,c.x,c.y,38)){
   persist(game,key);
   s.saved.add(key);
   game.nums?.add?.(c.x,c.y-25,'+1 ALMA ASTRAL','#e1bee7',true);
   game.fx?.emit?.(c.x,c.y,{color:'#ce93d8',count:10,up:4,size:3.5,life:30});
  }
 }

 // Beacons
 for(let i=0;i<YOMI_BEACONS.length;i++){
  const b=YOMI_BEACONS[i];
  if(!s.saved.has(b.id)&&inRange(p,b.x,b.y,60)){
   const collected=[...s.saved].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length;
   if(collected>=b.need){
    persist(game,b.id);
    s.saved.add(b.id);
    s.index=i+1;
    s.act=Math.min(4,i+1);
    s.banner=180;
    s.bannerText=b.label+' ENCENDIDO';
    s.bannerSub=b.line;
    game.fx?.emit?.(b.x,b.y,{color:'#ba68c8',count:16,up:6,size:4.5,life:45});
   }
  }
 }

 // Mini Boss encounter spawn
 const arenaX=3420,arenaY=1134;
 const bossDefeated=(game.clearedEncounters?.hub||[]).includes(YOMI_BOSS_ID);
 if(!bossDefeated&&!game.enemies.some(e=>e._yomiBoss)&&Math.abs(p.x-arenaX)<750){
  const boss=createYomiBoss((x,y,k,r,idx,extra)=>game.createEnemy?.(x,y,k,r,idx,extra)||{x,y,w:126,h:102,hp:480,max:480});
  game.enemies.push(boss);
 }
 if(!s.bossDefeated&&bossDefeated){
  s.bossDefeated=true;
  s.act=4;
  s.banner=200;
  s.bannerText='¡GUÍA DEL MÁS ALLÁ DERROTADO!';
  s.bannerSub='El Altar de la Constelación Eterna ha despertado.';
 }

 // Relic Altar
 const altarX=3780,altarY=1100;
 if(s.bossDefeated&&!s.complete&&inRange(p,altarX,altarY,65)){
  persist(game,SAVE_KEY);
  s.complete=true;
  s.altarLit=true;
  s.banner=240;
  s.bannerText='¡RELIQUIA: CONSTELACIÓN ETERNA!';
  s.bannerSub='Yomi ha despertado la guía de los espíritus ancestrales.';
  p._heroHundredBonus='CONSTELACIÓN ETERNA';
  game.roomAlbums?.hub?.relic?.();
 }
}

export function yomiAbility(game,player,index){
 const s=game.yomiTrail;if(!s||!player)return;
 for(let i=0;i<YOMI_BARRIERS.length;i++){
  const gate=YOMI_BARRIERS[i];
  if(Math.abs(player.x+player.w/2-gate.x)<100&&Math.abs(player.y-gate.y)<gate.height+80){
   s.gateShorts[i]=160;
   game.nums?.add?.(gate.x,gate.y-gate.height/2,'¡BARRERA DISIPADA!','#e1bee7',true);
   game.fx?.emit?.(gate.x,gate.y-gate.height/2,{color:'#ce93d8',count:15,up:5,size:4,life:35});
  }
 }
}

export function drawYomiTrail(ctx,game,cam,t){
 const s=game.yomiTrail;if(!s)return;
 ctx.save();

 // Draw Spirit Drafts
 for(const draft of YOMI_DRAFTS){
  const dx=draft.x-cam.x,dy=draft.y-cam.y;
  ctx.fillStyle='#4a148c';
  ctx.beginPath();
  ctx.moveTo(dx-32,dy);
  ctx.lineTo(dx-18,dy-18);
  ctx.lineTo(dx+18,dy-18);
  ctx.lineTo(dx+32,dy);
  ctx.closePath();
  ctx.fill();
  const pulse=Math.sin(t*0.2+draft.x)*8;
  ctx.fillStyle='rgba(186,104,200,0.5)';
  ctx.beginPath();
  ctx.moveTo(dx-18,dy-18);
  ctx.lineTo(dx-24,dy-160+pulse);
  ctx.lineTo(dx+24,dy-160+pulse);
  ctx.lineTo(dx+18,dy-18);
  ctx.closePath();
  ctx.fill();
 }

 // Draw Astral Torii Barriers
 for(let i=0;i<YOMI_BARRIERS.length;i++){
  const g=YOMI_BARRIERS[i],shorted=s.gateShorts[i]>0;
  const gx=g.x-cam.x,gy=g.y-cam.y;
  if(shorted){
   ctx.strokeStyle='rgba(206,147,216,0.35)';ctx.lineWidth=2;ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
  }else{
   ctx.fillStyle='#6a1b9a';
   ctx.fillRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.strokeStyle='#e1bee7';ctx.lineWidth=3;
   ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.fillStyle='#ea80fc';
   ctx.beginPath();
   ctx.arc(gx,gy-g.height/2,16,0,Math.PI*2);
   ctx.fill();
  }
 }

 // Draw Soul Lanterns
 for(const c of YOMI_SOULS){
  const key=FRAGMENT_PREFIX+c.id;
  if(s.saved.has(key))continue;
  const fx=c.x-cam.x,fy=c.y-cam.y;
  const bob=Math.sin(t*0.12+c.x)*5;
  ctx.fillStyle='#e1bee7';
  ctx.strokeStyle='#f3e5f5';ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(fx,fy+bob,12,0,Math.PI*2);
  ctx.fill();ctx.stroke();
 }

 // Draw Spirit Beacons
 for(const b of YOMI_BEACONS){
  const active=s.saved.has(b.id);
  const bx=b.x-cam.x,by=b.y-cam.y;
  ctx.fillStyle='#311b92';ctx.fillRect(bx-10,by-40,20,40);
  ctx.fillStyle=active?'#ea80fc':'#7e57c2';
  ctx.beginPath();ctx.arc(bx,by-48,14,0,Math.PI*2);ctx.fill();
  if(active){
   ctx.fillStyle='rgba(234,128,252,0.35)';
   ctx.beginPath();ctx.arc(bx,by-48,26+Math.sin(t*0.15)*4,0,Math.PI*2);ctx.fill();
  }
 }

 // Draw Relic Altar
 const ax=3780-cam.x,ay=1100-cam.y;
 ctx.fillStyle='#1a0033';
 ctx.fillRect(ax-40,ay-20,80,20);
 ctx.fillStyle=s.altarLit?'#ea80fc':'#ab47bc';
 ctx.beginPath();ctx.arc(ax,ay-35,22,0,Math.PI*2);ctx.fill();
 if(s.altarLit){
  ctx.fillStyle='rgba(234,128,252,0.35)';
  ctx.beginPath();ctx.arc(ax,ay-35,40+Math.sin(t*0.1)*6,0,Math.PI*2);ctx.fill();
 }

 // Act Banner
 if(s.banner>0&&s.bannerText){
  ctx.fillStyle='rgba(20,10,35,0.85)';
  ctx.fillRect(180,45,740,55);
  ctx.strokeStyle='#ba68c8';ctx.lineWidth=2;
  ctx.strokeRect(180,45,740,55);
  ctx.fillStyle='#e1bee7';ctx.font='bold 16px sans-serif';ctx.textAlign='center';
  ctx.fillText(s.bannerText,550,70);
  ctx.fillStyle='#ce93d8';ctx.font='12px sans-serif';
  ctx.fillText(s.bannerSub,550,90);
 }
 ctx.restore();
}

export function yomiTrailSnapshot(g){
 return {
  active:!!g.yomiTrail,
  complete:g.yomiTrail?.complete||false,
  act:g.yomiTrail?.act||0,
  souls:[...g.yomiTrail?.saved||[]].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length
 };
}
