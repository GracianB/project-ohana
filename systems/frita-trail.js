// MERCADO DORADO — Frita's solo campaign chapter inside the expanded Claro.
// Sizzling oil springs, golden fryer blast gates, market lanterns, golden crisps,
// and the festive feast arena with Rey Crujiente.
import {movePlatform} from './moving-platforms.js';
import {createFritaBoss,FRITA_BOSS_ID} from './frita-boss.js';

const SAVE_KEY='frita-trail-v1';
const FRAGMENT_PREFIX='frita-crisp-';

export const FRITA_BEACONS=Object.freeze([
 Object.freeze({id:'frita-entry',x:440,y:1074,label:'ACEITE',need:0,line:'El brasero de aceite dorado enciende la primera llama del mercado.'}),
 Object.freeze({id:'frita-market',x:1720,y:1090,label:'BAZAR',need:2,line:'Las freidoras del paseo crujen con aromas festivos.'}),
 Object.freeze({id:'frita-shrine',x:3080,y:1084,label:'FESTÍN',need:4,line:'¡El Rey Crujiente despierta en la cúpula del gran banquete!'})
]);

export const FRITA_CRISPS=Object.freeze([
 Object.freeze({id:'a',x:540,y:1070}),
 Object.freeze({id:'b',x:820,y:830}),
 Object.freeze({id:'c',x:1480,y:1085}),
 Object.freeze({id:'d',x:2020,y:1080}),
 Object.freeze({id:'e',x:2520,y:1035}),
 Object.freeze({id:'f',x:2870,y:1075}),
 Object.freeze({id:'g',x:3350,y:1075}),
 Object.freeze({id:'h',x:3780,y:1075})
]);

export const FRITA_SPRINGS=Object.freeze([
 Object.freeze({x:980,y:1134,force:16.8,color:'#ffd54f'}),
 Object.freeze({x:1720,y:1134,force:17.5,color:'#ffca28'}),
 Object.freeze({x:2350,y:1134,force:16.8,color:'#ffd54f'}),
 Object.freeze({x:2800,y:1134,force:17.2,color:'#ffca28'})
]);

export const FRITA_GATES=Object.freeze([
 Object.freeze({x:1500,y:1134,w:65,height:170,offset:0}),
 Object.freeze({x:2550,y:1134,w:65,height:170,offset:68}),
 Object.freeze({x:2830,y:1134,w:65,height:170,offset:136})
]);

export const FRITA_ACTS=Object.freeze([
 'EL PASEO DE LA BAHÍA','EL MERCADO DEL ACEITE','EL BAZAR DE LAS ESPECIAS',
 'EL REY CRUJIENTE','EL GRAN BANQUETE DORADO'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read=(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

export function enterFritaTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='frita'||g.personalAdventureSolo===false){g.fritaTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(FRITA_BOSS_ID);
 const index=complete?FRITA_BEACONS.length:Math.max(0,FRITA_BEACONS.findIndex(b=>!saved.has(b.id)));
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
 g.fritaTrail={
  saved,complete,index:index<0?FRITA_BEACONS.length:index,
  bossDefeated:cleared,banner:0,bannerText:'',bannerSub:'',lifts,
  gateShorts:[0,0,0],altarLit:complete,altarAge:0,
  act:cleared?4:Math.min(3,index<0?3:index)
 };
}

export function updateFritaTrail(game,hurtPlayer){
 const s=game.fritaTrail,p=game.player;if(!s||!p||p.dead)return;
 for(const item of s.lifts)movePlatform(item.platform,item.motion,game.t,p);
 if(s.banner>0)s.banner--;

 // Sizzling oil springs: acceleration burst
 for(const spring of FRITA_SPRINGS){
  const cx=spring.x,dx=Math.abs(p.x+p.w/2-cx);
  if(dx<45&&p.y<spring.y&&p.y>spring.y-260){
   p.vy=Math.max(-spring.force,p.vy-1.1);
   p.grounded=false;
   if(game.t%4===0){
    game.fx?.emit?.(p.x+p.w/2,p.y+p.h,{color:spring.color,count:2,up:4.5,size:4,life:25});
   }
  }
 }

 // Fryer gates
 for(let i=0;i<FRITA_GATES.length;i++){
  const gate=FRITA_GATES[i];
  if(s.gateShorts[i]>0){s.gateShorts[i]--;continue;}
  const near=Math.abs(p.x+p.w/2-gate.x)<gate.w+25&&p.y+p.h>gate.y-gate.height&&p.y<gate.y;
  if(near){
   if(p.x+p.w/2<gate.x)p.x=gate.x-gate.w-p.w/2;
   else p.x=gate.x+gate.w+p.w/2;
   p.vx=0;
  }
 }

 // Collect golden crisps
 for(const c of FRITA_CRISPS){
  const key=FRAGMENT_PREFIX+c.id;
  if(!s.saved.has(key)&&inRange(p,c.x,c.y,38)){
   persist(game,key);
   s.saved.add(key);
   game.nums?.add?.(c.x,c.y-25,'+1 MANJAR DORADO','#fff59d',true);
   game.fx?.emit?.(c.x,c.y,{color:'#ffd54f',count:10,up:4,size:3.5,life:30});
  }
 }

 // Beacons
 for(let i=0;i<FRITA_BEACONS.length;i++){
  const b=FRITA_BEACONS[i];
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
    game.fx?.emit?.(b.x,b.y,{color:'#ffca28',count:16,up:6,size:4.5,life:45});
   }
  }
 }

 // Mini Boss encounter spawn
 const arenaX=3420,arenaY=1134;
 const bossDefeated=(game.clearedEncounters?.hub||[]).includes(FRITA_BOSS_ID);
 if(!bossDefeated&&!game.enemies.some(e=>e._fritaBoss)&&Math.abs(p.x-arenaX)<750){
  const boss=createFritaBoss((x,y,k,r,idx,extra)=>game.createEnemy?.(x,y,k,r,idx,extra)||{x,y,w:126,h:102,hp:480,max:480});
  game.enemies.push(boss);
 }
 if(!s.bossDefeated&&bossDefeated){
  s.bossDefeated=true;
  s.act=4;
  s.banner=200;
  s.bannerText='¡REY CRUJIENTE DERROTADO!';
  s.bannerSub='El Altar del Gran Banquete ha despertado.';
 }

 // Relic Altar
 const altarX=3780,altarY=1100;
 if(s.bossDefeated&&!s.complete&&inRange(p,altarX,altarY,65)){
  persist(game,SAVE_KEY);
  s.complete=true;
  s.altarLit=true;
  s.banner=240;
  s.bannerText='¡RELIQUIA: BANQUETE DORADO!';
  s.bannerSub='Frita ha despertado el gran festín de la familia.';
  p._heroHundredBonus='BANQUETE DORADO';
  game.roomAlbums?.hub?.relic?.();
 }
}

export function fritaAbility(game,player,index){
 const s=game.fritaTrail;if(!s||!player)return;
 for(let i=0;i<FRITA_GATES.length;i++){
  const gate=FRITA_GATES[i];
  if(Math.abs(player.x+player.w/2-gate.x)<100&&Math.abs(player.y-gate.y)<gate.height+80){
   s.gateShorts[i]=160;
   game.nums?.add?.(gate.x,gate.y-gate.height/2,'¡FREIDORA ABIERTA!','#fff59d',true);
   game.fx?.emit?.(gate.x,gate.y-gate.height/2,{color:'#ffd54f',count:15,up:5,size:4,life:35});
  }
 }
}

export function drawFritaTrail(ctx,game,cam,t){
 const s=game.fritaTrail;if(!s)return;
 ctx.save();

 // Draw Sizzling Oil Springs
 for(const spring of FRITA_SPRINGS){
  const sx=spring.x-cam.x,sy=spring.y-cam.y;
  ctx.fillStyle='#e65100';
  ctx.beginPath();
  ctx.moveTo(sx-32,sy);
  ctx.lineTo(sx-18,sy-18);
  ctx.lineTo(sx+18,sy-18);
  ctx.lineTo(sx+32,sy);
  ctx.closePath();
  ctx.fill();
  const pulse=Math.sin(t*0.2+spring.x)*8;
  ctx.fillStyle='rgba(255,213,79,0.5)';
  ctx.beginPath();
  ctx.moveTo(sx-18,sy-18);
  ctx.lineTo(sx-24,sy-160+pulse);
  ctx.lineTo(sx+24,sy-160+pulse);
  ctx.lineTo(sx+18,sy-18);
  ctx.closePath();
  ctx.fill();
 }

 // Draw Fryer Gates
 for(let i=0;i<FRITA_GATES.length;i++){
  const g=FRITA_GATES[i],shorted=s.gateShorts[i]>0;
  const gx=g.x-cam.x,gy=g.y-cam.y;
  if(shorted){
   ctx.strokeStyle='rgba(255,235,59,0.35)';ctx.lineWidth=2;ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
  }else{
   ctx.fillStyle='#ff8f00';
   ctx.fillRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.strokeStyle='#ffe082';ctx.lineWidth=3;
   ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.fillStyle='#ffeb3b';
   ctx.beginPath();
   ctx.arc(gx,gy-g.height/2,16,0,Math.PI*2);
   ctx.fill();
  }
 }

 // Draw Golden Crisps
 for(const c of FRITA_CRISPS){
  const key=FRAGMENT_PREFIX+c.id;
  if(s.saved.has(key))continue;
  const fx=c.x-cam.x,fy=c.y-cam.y;
  const bob=Math.sin(t*0.12+c.x)*5;
  ctx.fillStyle='#ffd54f';
  ctx.strokeStyle='#fff9c4';ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(fx,fy+bob,12,0,Math.PI*2);
  ctx.fill();ctx.stroke();
 }

 // Draw Market Beacons
 for(const b of FRITA_BEACONS){
  const active=s.saved.has(b.id);
  const bx=b.x-cam.x,by=b.y-cam.y;
  ctx.fillStyle='#bf360c';ctx.fillRect(bx-10,by-40,20,40);
  ctx.fillStyle=active?'#ffeb3b':'#ff8f00';
  ctx.beginPath();ctx.arc(bx,by-48,14,0,Math.PI*2);ctx.fill();
  if(active){
   ctx.fillStyle='rgba(255,235,59,0.35)';
   ctx.beginPath();ctx.arc(bx,by-48,26+Math.sin(t*0.15)*4,0,Math.PI*2);ctx.fill();
  }
 }

 // Draw Relic Altar
 const ax=3780-cam.x,ay=1100-cam.y;
 ctx.fillStyle='#d84315';
 ctx.fillRect(ax-40,ay-20,80,20);
 ctx.fillStyle=s.altarLit?'#ffeb3b':'#ffb300';
 ctx.beginPath();ctx.arc(ax,ay-35,22,0,Math.PI*2);ctx.fill();
 if(s.altarLit){
  ctx.fillStyle='rgba(255,235,59,0.35)';
  ctx.beginPath();ctx.arc(ax,ay-35,40+Math.sin(t*0.1)*6,0,Math.PI*2);ctx.fill();
 }

 // Act Banner
 if(s.banner>0&&s.bannerText){
  ctx.fillStyle='rgba(35,15,5,0.85)';
  ctx.fillRect(180,45,740,55);
  ctx.strokeStyle='#ffd54f';ctx.lineWidth=2;
  ctx.strokeRect(180,45,740,55);
  ctx.fillStyle='#fff59d';ctx.font='bold 16px sans-serif';ctx.textAlign='center';
  ctx.fillText(s.bannerText,550,70);
  ctx.fillStyle='#ffe082';ctx.font='12px sans-serif';
  ctx.fillText(s.bannerSub,550,90);
 }
 ctx.restore();
}

export function fritaTrailSnapshot(g){
 return {
  active:!!g.fritaTrail,
  complete:g.fritaTrail?.complete||false,
  act:g.fritaTrail?.act||0,
  crisps:[...g.fritaTrail?.saved||[]].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length
 };
}
