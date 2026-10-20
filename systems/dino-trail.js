// VALLE DE LOS GIGANTES — Dino's solo campaign chapter inside the expanded Claro.
// Mud geysers, shatterable amber gates, fossil-bone beacons, moving stone slabs
// and the prehistoric stone arena with the Coloso de Piedra.
// Unique mechanic: Pisotón (J/K ability) near a geyser triggers a MEGA-BURST that
// launches Dino high and stuns nearby enemies.  Gates shatter only with ability use.
import {movePlatform,drawPlatformRail} from './moving-platforms.js';
import {createDinoBoss,DINO_BOSS_ID} from './dino-boss.js';

const SAVE_KEY='dino-trail-v1';
const FRAGMENT_PREFIX='dino-fossil-';

// ── Beacons (3 acts) ─────────────────────────────────────────────────────────
export const DINO_BEACONS=Object.freeze([
 Object.freeze({id:'dino-gorge',  x:440, y:1074,label:'FÓSIL',    need:0,line:'El monolito de piedra resuena con los pasos de los gigantes ancestrales.'}),
 Object.freeze({id:'dino-plateau',x:1720,y:1090,label:'MESETA',   need:2,line:'Los géiseres de fango impulsan a las criaturas al cielo prehistórico.'}),
 Object.freeze({id:'dino-shrine', x:3080,y:1084,label:'ANCESTRAL',need:4,line:'¡El Coloso de Piedra despierta en la cúspide del Valle de los Gigantes!'})
]);

// ── 8 master fossils (distributed across unique platform positions) ──────────
export const DINO_FOSSILS=Object.freeze([
 Object.freeze({id:'a',x:285, y:990}),   // Sector 0 — low gorge step
 Object.freeze({id:'b',x:625, y:858}),   // Sector 0 — mid crag
 Object.freeze({id:'c',x:870, y:778}),   // Sector 0 — upper amber crag
 Object.freeze({id:'d',x:1490,y:788}),   // Sector 1 — first mesa top
 Object.freeze({id:'e',x:1820,y:798}),   // Sector 1 — second mesa top
 Object.freeze({id:'f',x:2615,y:818}),   // Sector 2 — amber cavern ledge
 Object.freeze({id:'g',x:2895,y:398}),   // Sector 2 — high stalactite shelf
 Object.freeze({id:'h',x:3780,y:1075})   // Sector 3 — altar approach
]);

// ── 4 mud geyser pads ────────────────────────────────────────────────────────
export const DINO_GEYSERS=Object.freeze([
 Object.freeze({x:1200,y:1134,force:17.5,color:'#8d6e63',megaForce:24}),  // chasm edge A
 Object.freeze({x:1680,y:1134,force:16.8,color:'#a1887f',megaForce:22}),  // plateau center
 Object.freeze({x:2300,y:1134,force:17.2,color:'#8d6e63',megaForce:23}),  // chasm edge B
 Object.freeze({x:2780,y:1134,force:17.0,color:'#a1887f',megaForce:22})   // cavern mouth
]);

// ── 3 amber gates (block passage until smashed with ability) ─────────────────
export const DINO_GATES=Object.freeze([
 Object.freeze({x:1490,y:1134,w:60,height:165,offset:0}),
 Object.freeze({x:2460,y:1134,w:60,height:165,offset:55}),
 Object.freeze({x:2840,y:1134,w:60,height:165,offset:110})
]);

export const DINO_ACTS=Object.freeze([
 'LA GARGANTA DE LOS FÓSILES','LA MESETA DE LOS GIGANTES','LA CAVERNA DEL ÁMBAR',
 'EL COLOSO DE PIEDRA','EL FÓSIL DE LA FAMILIA'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read  =(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

// ── enter ─────────────────────────────────────────────────────────────────────
export function enterDinoTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='dino'||g.personalAdventureSolo===false){g.dinoTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(DINO_BOSS_ID);
 const index=complete?DINO_BEACONS.length:Math.max(0,DINO_BEACONS.findIndex(b=>!saved.has(b.id)));

 // Moving stone slabs — axes and patterns unique to Dino's world
 const lifts=[
  {axis:'x', x:1030,y:870,span:260,period:260},  // Sector 0→1 bridge slab
  {axis:'y', x:1640,y:780,span:200,period:300},  // Sector 1 elevator mesa
  {axis:'x', x:2480,y:740,span:280,period:290},  // Sector 2 amber slide
  {axis:'y', x:2760,y:630,span:320,period:330}   // Sector 2→3 deep shaft
 ].map((motion,i)=>{
  motion.start=Number(g.t)||0;motion.phase=i*.7;
  const platform={x:motion.x,y:motion.y,w:200,h:26,_campaignLift:true};
  return {motion,platform};
 });
 for(const item of lifts)if(!g.platforms.includes(item.platform))g.platforms.push(item.platform);

 g.dinoTrail={
  saved,complete,index:index<0?DINO_BEACONS.length:index,
  bossDefeated:cleared,banner:0,bannerText:'',bannerSub:'',lifts,
  gateShorts:[0,0,0],altarLit:complete,altarAge:0,
  act:cleared?4:Math.min(3,index<0?3:index),
  geyserMega:[0,0,0,0]   // per-geyser mega-burst cooldown
 };
}

// ── update ────────────────────────────────────────────────────────────────────
export function updateDinoTrail(game,hurtPlayer){
 const s=game.dinoTrail,p=game.player;if(!s||!p||p.dead)return;
 for(const item of s.lifts)movePlatform(item.platform,item.motion,game.t,p);
 if(s.banner>0)s.banner--;

 // ── Mud geyser pads ──────────────────────────────────────────────────────
 for(let i=0;i<DINO_GEYSERS.length;i++){
  const pad=DINO_GEYSERS[i];
  if(s.geyserMega[i]>0){s.geyserMega[i]--;continue;}
  const cx=pad.x,dx=Math.abs(p.x+p.w/2-cx);
  if(dx<50&&p.y<pad.y&&p.y>pad.y-280){
   p.vy=Math.max(-pad.force,p.vy-1.2);
   p.grounded=false;
   if(game.t%4===0)game.fx?.emit?.(p.x+p.w/2,p.y+p.h,{color:pad.color,count:3,up:5,size:4.5,life:28});
  }
 }

 // ── Amber gates — physical blocker ─────────────────────────────────────
 for(let i=0;i<DINO_GATES.length;i++){
  const gate=DINO_GATES[i];
  if(s.gateShorts[i]>0){s.gateShorts[i]--;continue;}
  const near=Math.abs(p.x+p.w/2-gate.x)<gate.w+28&&p.y+p.h>gate.y-gate.height&&p.y<gate.y;
  if(near){
   if(p.x+p.w/2<gate.x)p.x=gate.x-gate.w/2-p.w;
   else p.x=gate.x+gate.w/2;
   p.vx=0;
  }
 }

 // ── Collect fossils ─────────────────────────────────────────────────────
 for(const f of DINO_FOSSILS){
  const key=FRAGMENT_PREFIX+f.id;
  if(!s.saved.has(key)&&inRange(p,f.x,f.y,40)){
   persist(game,key);s.saved.add(key);
   game.nums?.add?.(f.x,f.y-28,'+1 FÓSIL DE ÁMBAR','#ffe082',true);
   game.fx?.emit?.(f.x,f.y,{color:'#ffd54f',count:12,up:4.5,size:3.5,life:32});
  }
 }

 // ── Fossil beacons ──────────────────────────────────────────────────────
 for(let i=0;i<DINO_BEACONS.length;i++){
  const b=DINO_BEACONS[i];
  if(!s.saved.has(b.id)&&inRange(p,b.x,b.y,65)){
   const collected=[...s.saved].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length;
   if(collected>=b.need){
    persist(game,b.id);s.saved.add(b.id);
    s.index=i+1;s.act=Math.min(4,i+1);
    s.banner=190;s.bannerText=b.label+' ACTIVADO';s.bannerSub=b.line;
    game.fx?.emit?.(b.x,b.y,{color:'#ffb74d',count:18,up:6.5,size:5,life:48});
   }
  }
 }

 // ── Mini boss encounter spawn ────────────────────────────────────────────
 const arenaX=3420;
 const bossDefeated=(game.clearedEncounters?.hub||[]).includes(DINO_BOSS_ID);
 if(!bossDefeated&&!game.enemies.some(e=>e._dinoBoss)&&Math.abs(p.x-arenaX)<800){
  const boss=createDinoBoss((x,y,k,r,idx,extra)=>game.createEnemy?.(x,y,k,r,idx,extra)||{x,y,w:140,h:120,hp:480,max:480});
  game.enemies.push(boss);
 }
 if(!s.bossDefeated&&bossDefeated){
  s.bossDefeated=true;s.act=4;
  s.banner=210;s.bannerText='¡COLOSO DE PIEDRA DERROTADO!';
  s.bannerSub='El Altar del Guardián Antiguo ha despertado — reclama el Fósil de la Familia.';
 }

 // ── Relic altar ─────────────────────────────────────────────────────────
 const altarX=3780,altarY=1100;
 if(s.bossDefeated&&!s.complete&&inRange(p,altarX,altarY,70)){
  persist(game,SAVE_KEY);s.complete=true;s.altarLit=true;s.altarAge=0;
  s.banner=250;s.bannerText='¡RELIQUIA: FÓSIL DE LA FAMILIA!';
  s.bannerSub='Dino ha despertado la bendición ancestral del Guardián.';
  p._heroHundredBonus='FÓSIL DE LA FAMILIA';
  game.roomAlbums?.hub?.relic?.();
 }
 if(s.altarLit)s.altarAge=(s.altarAge||0)+1;
}

// ── dinoAbility: Pisotón sísmico ─────────────────────────────────────────────
// When player uses J or K near a geyser pad → mega-burst upward + gate shatter
// Near any amber gate → shatter it
export function dinoAbility(game,player,index){
 const s=game.dinoTrail;if(!s||!player)return;

 // Mega-burst geysers within range
 for(let i=0;i<DINO_GEYSERS.length;i++){
  const pad=DINO_GEYSERS[i];
  if(s.geyserMega[i]>0)continue;
  if(Math.abs(player.x+player.w/2-pad.x)<90&&player.y<pad.y&&player.y>pad.y-350){
   s.geyserMega[i]=180;
   player.vy=-pad.megaForce;player.grounded=false;
   game.nums?.add?.(pad.x,pad.y-60,'¡GÉISER MEGA!','#ffe082',true);
   game.fx?.emit?.(pad.x,pad.y,{color:pad.color,count:22,up:8,size:6,life:50});
  }
 }

 // Shatter amber gates within range
 for(let i=0;i<DINO_GATES.length;i++){
  const gate=DINO_GATES[i];
  if(s.gateShorts[i]>0)continue;
  if(Math.abs(player.x+player.w/2-gate.x)<110&&Math.abs(player.y-gate.y)<gate.height+90){
   s.gateShorts[i]=200;
   game.nums?.add?.(gate.x,gate.y-gate.height/2,'¡ROCA ROTA!','#ffe082',true);
   game.fx?.emit?.(gate.x,gate.y-gate.height/2,{color:'#8d6e63',count:18,up:6,size:5,life:40});
  }
 }
}

// ── draw ─────────────────────────────────────────────────────────────────────
export function drawDinoTrail(ctx,game,cam,t){
 const s=game.dinoTrail;if(!s)return;
 ctx.save();

 // ── Moving platform rails ──
 for(const item of s.lifts)drawPlatformRail(ctx,item.platform,item.motion,cam);

 // ── Mud geyser vents ──
 for(let i=0;i<DINO_GEYSERS.length;i++){
  const vent=DINO_GEYSERS[i];
  const vx=vent.x-cam.x,vy=vent.y-cam.y;
  const mega=s.geyserMega[i]>0;
  // Stone rim
  ctx.fillStyle=mega?'#6d4c41':'#4e342e';
  ctx.beginPath();ctx.moveTo(vx-36,vy);ctx.lineTo(vx-20,vy-20);ctx.lineTo(vx+20,vy-20);ctx.lineTo(vx+36,vy);ctx.closePath();ctx.fill();
  // Mud column
  const colH=mega?220:140;
  const pulse=Math.sin(t*.2+vent.x)*(mega?14:6);
  const mudG=ctx.createLinearGradient(vx,vy-20,vx,vy-colH+pulse);
  mudG.addColorStop(0,mega?'rgba(180,110,60,0.8)':'rgba(141,110,99,0.55)');
  mudG.addColorStop(1,'rgba(141,110,99,0)');
  ctx.fillStyle=mudG;
  ctx.beginPath();
  ctx.moveTo(vx-20,vy-20);ctx.lineTo(vx-(mega?34:22),vy-colH+pulse);
  ctx.lineTo(vx+(mega?34:22),vy-colH+pulse);ctx.lineTo(vx+20,vy-20);
  ctx.closePath();ctx.fill();
  // Mega ring label
  if(mega){
   ctx.fillStyle='rgba(255,224,130,0.9)';ctx.font='bold 9px sans-serif';ctx.textAlign='center';
   ctx.fillText('MEGA',vx,vy-colH-8);
  }
 }

 // ── Amber gates ──
 for(let i=0;i<DINO_GATES.length;i++){
  const g=DINO_GATES[i],shorted=s.gateShorts[i]>0;
  const gx=g.x-cam.x,gy=g.y-cam.y;
  if(shorted){
   // Broken shards
   ctx.strokeStyle='rgba(255,213,79,0.4)';ctx.lineWidth=1.5;
   for(let sh=0;sh<5;sh++){
    const sx=gx-30+sh*14,sy=gy-g.height*.5+sh*20;
    ctx.save();ctx.translate(sx,sy);ctx.rotate(sh*.6);
    ctx.strokeRect(-5,-8,10,16);ctx.restore();
   }
  }else{
   // Amber gate block
   const gGrad=ctx.createLinearGradient(gx-g.w/2,0,gx+g.w/2,0);
   gGrad.addColorStop(0,'#5d4037');gGrad.addColorStop(.5,'#8d6e63');gGrad.addColorStop(1,'#5d4037');
   ctx.fillStyle=gGrad;ctx.fillRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.strokeStyle='#d7ccc8';ctx.lineWidth=2.5;ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
   // Amber crystal centre
   ctx.fillStyle='#ffca28';
   ctx.beginPath();ctx.moveTo(gx,gy-g.height*.65-14);ctx.lineTo(gx+12,gy-g.height*.65);ctx.lineTo(gx,gy-g.height*.65+14);ctx.lineTo(gx-12,gy-g.height*.65);ctx.closePath();ctx.fill();
   // Hint text
   ctx.fillStyle='#ffe082';ctx.font='bold 8px sans-serif';ctx.textAlign='center';
   ctx.fillText('J/K',gx,gy-g.height*.65+28);
  }
 }

 // ── Fossil amber collectibles ──
 for(const f of DINO_FOSSILS){
  const key=FRAGMENT_PREFIX+f.id;
  if(s.saved.has(key))continue;
  const fx=f.x-cam.x,fy=f.y-cam.y;
  const bob=Math.sin(t*.11+f.x)*.5*6;
  // Amber diamond
  ctx.fillStyle='#ffb74d';ctx.strokeStyle='#ffe082';ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(fx,fy-15+bob);ctx.lineTo(fx+13,fy+bob);
  ctx.lineTo(fx,fy+15+bob);ctx.lineTo(fx-13,fy+bob);
  ctx.closePath();ctx.fill();ctx.stroke();
  // Inner fossil impression
  ctx.strokeStyle='rgba(255,255,180,0.5)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(fx-6,fy-4+bob);ctx.lineTo(fx+6,fy-4+bob);
  ctx.moveTo(fx,fy-9+bob);ctx.lineTo(fx,fy+9+bob);ctx.stroke();
 }

 // ── Fossil beacons (standing bone monoliths) ──
 for(const b of DINO_BEACONS){
  const active=s.saved.has(b.id);
  const bx=b.x-cam.x,by=b.y-cam.y;
  // Monolith base
  ctx.fillStyle='#3e2723';ctx.fillRect(bx-12,by-52,24,52);
  // Bone crest on top
  ctx.fillStyle=active?'#ffca28':'#8d6e63';
  ctx.beginPath();ctx.moveTo(bx,by-60);ctx.lineTo(bx-10,by-80);ctx.lineTo(bx-18,by-70);ctx.lineTo(bx,by-90);
  ctx.lineTo(bx+18,by-70);ctx.lineTo(bx+10,by-80);ctx.closePath();ctx.fill();
  // Active glow
  if(active){
   ctx.fillStyle='rgba(255,202,40,0.28)';
   ctx.beginPath();ctx.arc(bx,by-75,30+Math.sin(t*.14)*5,0,Math.PI*2);ctx.fill();
  }
  // Label
  ctx.fillStyle=active?'#ffe082':'#a1887f';ctx.font='bold 8px sans-serif';ctx.textAlign='center';
  ctx.fillText(b.label,bx,by-6);
 }

 // ── Relic altar (prehistoric shrine) ──
 {
  const ax=3780-cam.x,ay=1100-cam.y;
  // Stone altar table
  ctx.fillStyle='#3e2723';ctx.fillRect(ax-52,ay-22,104,22);
  ctx.fillStyle='#4e342e';ctx.fillRect(ax-38,ay-44,76,22);
  // Fossil centrepiece
  ctx.fillStyle=s.altarLit?'#ffd600':'#795548';
  ctx.beginPath();ctx.arc(ax,ay-58,26,0,Math.PI*2);ctx.fill();
  if(s.altarLit){
   const age=s.altarAge||0;
   ctx.fillStyle=`rgba(255,200,0,${0.25+Math.sin(age*.08)*.1})`;
   ctx.beginPath();ctx.arc(ax,ay-58,46+Math.sin(age*.1)*8,0,Math.PI*2);ctx.fill();
  }
 }

 // ── Act banner ──
 if(s.banner>0&&s.bannerText){
  const alpha=Math.min(1,s.banner/30);
  ctx.fillStyle=`rgba(25,14,6,${0.88*alpha})`;ctx.fillRect(160,44,760,58);
  ctx.strokeStyle=`rgba(255,202,40,${alpha})`;ctx.lineWidth=2;ctx.strokeRect(160,44,760,58);
  ctx.globalAlpha=alpha;
  ctx.fillStyle='#ffe082';ctx.font='bold 17px sans-serif';ctx.textAlign='center';
  ctx.fillText(s.bannerText,540,72);
  ctx.fillStyle='#d7ccc8';ctx.font='12px sans-serif';
  ctx.fillText(s.bannerSub,540,92);
  ctx.globalAlpha=1;
 }
 ctx.restore();
}

// ── snapshot ──────────────────────────────────────────────────────────────────
export function dinoTrailSnapshot(g){
 return {
  active:!!g.dinoTrail,
  complete:g.dinoTrail?.complete||false,
  act:g.dinoTrail?.act||0,
  fossils:[...g.dinoTrail?.saved||[]].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length
 };
}
