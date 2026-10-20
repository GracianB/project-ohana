// MERCADO DORADO — Frita's solo campaign chapter inside the expanded Claro.
// Sizzling oil springs (vertical launch), golden fryer blast gates, hanging lanterns,
// market stall swing platforms and the golden feast arena with Rey Crujiente.
// Unique mechanic: fritaAbility near an oil spring → TURBO SLIDE (horizontal burst +
// temporary speed boost to outrun enemies and cross gaps at high speed).
import {movePlatform,drawPlatformRail} from './moving-platforms.js';
import {createFritaBoss,FRITA_BOSS_ID} from './frita-boss.js';

const SAVE_KEY='frita-trail-v1';
const FRAGMENT_PREFIX='frita-crisp-';

// ── Beacons ──────────────────────────────────────────────────────────────────
export const FRITA_BEACONS=Object.freeze([
 Object.freeze({id:'frita-boardwalk',x:440, y:1074,label:'ACEITE',  need:0,line:'El primer brasero de aceite dorado enciende el paseo de la bahía.'}),
 Object.freeze({id:'frita-market',   x:1720,y:1090,label:'BAZAR',   need:2,line:'Las freidoras del mercado crujen con aromas de festín costero.'}),
 Object.freeze({id:'frita-shrine',   x:3080,y:1084,label:'FESTÍN',  need:4,line:'¡El Rey Crujiente despierta en la Cúpula del Gran Banquete!'})
]);

// ── 8 golden crisps (placed on new platform positions) ───────────────────────
export const FRITA_CRISPS=Object.freeze([
 Object.freeze({id:'a',x:280, y:1010}),  // Sector 0 — boardwalk low plank
 Object.freeze({id:'b',x:540, y:900}),   // Sector 0 — second plank
 Object.freeze({id:'c',x:870, y:798}),   // Sector 0 — upper crag
 Object.freeze({id:'d',x:1540,y:760}),   // Sector 1 — canopy top
 Object.freeze({id:'e',x:1850,y:710}),   // Sector 1 — second canopy
 Object.freeze({id:'f',x:2690,y:800}),   // Sector 2 — lantern ledge
 Object.freeze({id:'g',x:2880,y:390}),   // Sector 2 — high shelf
 Object.freeze({id:'h',x:3780,y:1075})   // Sector 3 — feast altar approach
]);

// ── 4 sizzling oil springs (vertical launch pads) ────────────────────────────
export const FRITA_SPRINGS=Object.freeze([
 Object.freeze({x:1150,y:1134,force:17.2,turboVx:14,color:'#ffd54f'}),  // chasm edge A
 Object.freeze({x:1680,y:1134,force:16.8,turboVx:13,color:'#ffca28'}),  // market center
 Object.freeze({x:2360,y:1134,force:17.4,turboVx:14,color:'#ffd54f'}),  // chasm edge B
 Object.freeze({x:2800,y:1134,force:17.0,turboVx:13,color:'#ffca28'})   // bazaar mouth
]);

// ── 3 fryer blast gates (block until ability used) ───────────────────────────
export const FRITA_GATES=Object.freeze([
 Object.freeze({x:1480,y:1134,w:58,height:160,offset:0}),
 Object.freeze({x:2510,y:1134,w:58,height:160,offset:52}),
 Object.freeze({x:2860,y:1134,w:58,height:160,offset:104})
]);

export const FRITA_ACTS=Object.freeze([
 'EL PASEO DE LA BAHÍA','EL MERCADO DEL ACEITE','EL BAZAR DE LAS ESPECIAS',
 'EL REY CRUJIENTE','EL GRAN BANQUETE DORADO'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read  =(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

// ── enter ─────────────────────────────────────────────────────────────────────
export function enterFritaTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='frita'||g.personalAdventureSolo===false){g.fritaTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(FRITA_BOSS_ID);
 const index=complete?FRITA_BEACONS.length:Math.max(0,FRITA_BEACONS.findIndex(b=>!saved.has(b.id)));

 // Swinging market platforms — pendulum-style with different periods
 const lifts=[
  {axis:'x',x:1060,y:900,span:240,period:240},  // Sector 0→1 boardwalk swing
  {axis:'y',x:1580,y:810,span:180,period:280},  // Sector 1 canopy elevator
  {axis:'x',x:2460,y:800,span:260,period:260},  // Sector 2 lantern slide
  {axis:'y',x:2760,y:680,span:300,period:310}   // Sector 2→3 spice shaft
 ].map((motion,i)=>{
  motion.start=Number(g.t)||0;motion.phase=i*.65;
  const platform={x:motion.x,y:motion.y,w:210,h:20,_campaignLift:true};
  return {motion,platform};
 });
 for(const item of lifts)if(!g.platforms.includes(item.platform))g.platforms.push(item.platform);

 g.fritaTrail={
  saved,complete,index:index<0?FRITA_BEACONS.length:index,
  bossDefeated:cleared,banner:0,bannerText:'',bannerSub:'',lifts,
  gateShorts:[0,0,0],altarLit:complete,altarAge:0,
  act:cleared?4:Math.min(3,index<0?3:index),
  springTurbo:[0,0,0,0]   // per-spring turbo cooldown
 };
}

// ── update ────────────────────────────────────────────────────────────────────
export function updateFritaTrail(game,hurtPlayer){
 const s=game.fritaTrail,p=game.player;if(!s||!p||p.dead)return;
 for(const item of s.lifts)movePlatform(game,item.platform,item.motion);
 if(s.banner>0)s.banner--;

 // ── Sizzling oil springs — vertical launch ────────────────────────────────
 for(let i=0;i<FRITA_SPRINGS.length;i++){
  const sp=FRITA_SPRINGS[i];
  if(s.springTurbo[i]>0){s.springTurbo[i]--;continue;}
  const dx=Math.abs(p.x+p.w/2-sp.x);
  if(dx<50&&p.y<sp.y&&p.y>sp.y-290){
   p.vy=Math.max(-sp.force,p.vy-1.2);p.grounded=false;
   if(game.t%4===0)game.fx?.emit?.(p.x+p.w/2,p.y+p.h,{color:sp.color,count:3,up:5,size:4.5,life:28});
  }
 }

 // ── Fryer blast gates — physical blocker ──────────────────────────────────
 for(let i=0;i<FRITA_GATES.length;i++){
  const gate=FRITA_GATES[i];
  if(s.gateShorts[i]>0){s.gateShorts[i]--;continue;}
  const near=Math.abs(p.x+p.w/2-gate.x)<gate.w+28&&p.y+p.h>gate.y-gate.height&&p.y<gate.y;
  if(near){if(p.x+p.w/2<gate.x)p.x=gate.x-gate.w/2-p.w;else p.x=gate.x+gate.w/2;p.vx=0;}
 }

 // ── Collect golden crisps ─────────────────────────────────────────────────
 for(const c of FRITA_CRISPS){
  const key=FRAGMENT_PREFIX+c.id;
  if(!s.saved.has(key)&&inRange(p,c.x,c.y,40)){
   persist(game,key);s.saved.add(key);
   game.nums?.add?.(c.x,c.y-28,'+1 CRUJIENTE DORADO','#fff59d',true);
   game.fx?.emit?.(c.x,c.y,{color:'#ffd54f',count:12,up:4.5,size:3.5,life:32});
  }
 }

 // ── Beacons ───────────────────────────────────────────────────────────────
 for(let i=0;i<FRITA_BEACONS.length;i++){
  const b=FRITA_BEACONS[i];
  if(!s.saved.has(b.id)&&inRange(p,b.x,b.y,65)){
   const collected=[...s.saved].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length;
   if(collected>=b.need){
    persist(game,b.id);s.saved.add(b.id);
    s.index=i+1;s.act=Math.min(4,i+1);
    s.banner=190;s.bannerText=b.label+' ENCENDIDO';s.bannerSub=b.line;
    game.fx?.emit?.(b.x,b.y,{color:'#ffca28',count:18,up:6.5,size:5,life:48});
   }
  }
 }

 // ── Mini boss encounter spawn ─────────────────────────────────────────────
 const arenaX=3420;
 const bossDefeated=(game.clearedEncounters?.hub||[]).includes(FRITA_BOSS_ID);
 if(!bossDefeated&&!game.enemies.some(e=>e._fritaBoss)&&Math.abs(p.x-arenaX)<800){
  const boss=createFritaBoss((x,y,k,r,idx,extra)=>game.createEnemy?.(x,y,k,r,idx,extra)||{x,y,w:138,h:116,hp:480,max:480});
  game.enemies.push(boss);
 }
 if(!s.bossDefeated&&bossDefeated){
  s.bossDefeated=true;s.act=4;
  s.banner=210;s.bannerText='¡REY CRUJIENTE DERROTADO!';
  s.bannerSub='El Altar del Gran Banquete ha despertado — reclama el Banquete Dorado.';
 }

 // ── Relic altar ───────────────────────────────────────────────────────────
 const altarX=3780,altarY=1100;
 if(s.bossDefeated&&!s.complete&&inRange(p,altarX,altarY,70)){
  persist(game,SAVE_KEY);s.complete=true;s.altarLit=true;s.altarAge=0;
  s.banner=250;s.bannerText='¡RELIQUIA: BANQUETE DORADO!';
  s.bannerSub='Frita ha despertado el gran festín de la familia.';
  p._heroHundredBonus='BANQUETE DORADO';
  game.roomAlbums?.hub?.relic?.();
 }
 if(s.altarLit)s.altarAge=(s.altarAge||0)+1;
}

// ── fritaAbility: Turbo Slide ─────────────────────────────────────────────────
// Near an oil spring → TURBO horizontal burst (high vx toward far side)
// Near a fryer gate → blast it open
export function fritaAbility(game,player,index){
 const s=game.fritaTrail;if(!s||!player)return;

 // Turbo springs
 for(let i=0;i<FRITA_SPRINGS.length;i++){
  const sp=FRITA_SPRINGS[i];
  if(s.springTurbo[i]>0)continue;
  if(Math.abs(player.x+player.w/2-sp.x)<100&&player.y<sp.y&&player.y>sp.y-380){
   s.springTurbo[i]=170;
   const dir=player.facing||1;
   player.vx=dir*sp.turboVx;player.vy=-12;player.grounded=false;
   game.nums?.add?.(sp.x,sp.y-60,'¡TURBO DERRAPE!','#fff59d',true);
   game.fx?.emit?.(sp.x,sp.y,{color:sp.color,count:20,up:6,size:5.5,life:45});
  }
 }

 // Fryer gates
 for(let i=0;i<FRITA_GATES.length;i++){
  const gate=FRITA_GATES[i];
  if(s.gateShorts[i]>0)continue;
  if(Math.abs(player.x+player.w/2-gate.x)<110&&Math.abs(player.y-gate.y)<gate.height+90){
   s.gateShorts[i]=200;
   game.nums?.add?.(gate.x,gate.y-gate.height/2,'¡FREIDORA ABIERTA!','#fff59d',true);
   game.fx?.emit?.(gate.x,gate.y-gate.height/2,{color:'#ffd54f',count:18,up:6,size:5,life:40});
  }
 }
}

// ── draw ─────────────────────────────────────────────────────────────────────
export function drawFritaTrail(ctx,game,cam,t){
 const s=game.fritaTrail;if(!s)return;
 ctx.save();

 // Platform rails
 for(const item of s.lifts)drawPlatformRail(ctx,item.platform,item.motion,cam);

 // ── Oil spring vents ──
 for(let i=0;i<FRITA_SPRINGS.length;i++){
  const sp=FRITA_SPRINGS[i];
  const sx=sp.x-cam.x,sy=sp.y-cam.y;
  const turbo=s.springTurbo[i]>0;
  // Stone fryer rim
  ctx.fillStyle=turbo?'#e65100':'#bf360c';
  ctx.beginPath();ctx.moveTo(sx-36,sy);ctx.lineTo(sx-20,sy-20);ctx.lineTo(sx+20,sy-20);ctx.lineTo(sx+36,sy);ctx.closePath();ctx.fill();
  // Oil column
  const colH=turbo?200:130;
  const pulse=Math.sin(t*.22+sp.x)*(turbo?16:7);
  const oilG=ctx.createLinearGradient(sx,sy-20,sx,sy-colH+pulse);
  oilG.addColorStop(0,turbo?'rgba(255,200,0,0.85)':'rgba(255,213,79,0.6)');
  oilG.addColorStop(1,'rgba(255,213,79,0)');
  ctx.fillStyle=oilG;
  ctx.beginPath();
  ctx.moveTo(sx-20,sy-20);ctx.lineTo(sx-(turbo?30:20),sy-colH+pulse);
  ctx.lineTo(sx+(turbo?30:20),sy-colH+pulse);ctx.lineTo(sx+20,sy-20);
  ctx.closePath();ctx.fill();
  // Sizzle drops
  for(let d=0;d<3;d++){
   const dx=sx+(d-1)*12,dy=sy-20-(d*22+Math.sin(t*.3+d)*5);
   ctx.fillStyle=`rgba(255,${turbo?230:200},80,0.7)`;
   ctx.beginPath();ctx.arc(dx,dy,3+d*.5,0,Math.PI*2);ctx.fill();
  }
  if(turbo){
   ctx.fillStyle='rgba(255,240,100,0.9)';ctx.font='bold 9px sans-serif';ctx.textAlign='center';
   ctx.fillText('TURBO',sx,sy-colH-8);
  }
 }

 // ── Fryer blast gates ──
 for(let i=0;i<FRITA_GATES.length;i++){
  const g=FRITA_GATES[i],shorted=s.gateShorts[i]>0;
  const gx=g.x-cam.x,gy=g.y-cam.y;
  if(shorted){
   // Blown open — scattered shards
   ctx.strokeStyle='rgba(255,235,59,0.45)';ctx.lineWidth=1.5;
   for(let sh=0;sh<6;sh++){
    const sx2=gx-28+sh*11,sy2=gy-g.height*.5+sh*18;
    ctx.save();ctx.translate(sx2,sy2);ctx.rotate(sh*.5);ctx.strokeRect(-4,-7,8,14);ctx.restore();
   }
  }else{
   // Closed gate — golden hot metal look
   const gGrad=ctx.createLinearGradient(gx-g.w/2,0,gx+g.w/2,0);
   gGrad.addColorStop(0,'#e65100');gGrad.addColorStop(.5,'#ff8f00');gGrad.addColorStop(1,'#e65100');
   ctx.fillStyle=gGrad;ctx.fillRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.strokeStyle='#ffd54f';ctx.lineWidth=2.5;ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
   // Flame icon centre
   ctx.fillStyle='#ffeb3b';
   ctx.beginPath();ctx.moveTo(gx,gy-g.height*.7-14);ctx.quadraticCurveTo(gx+12,gy-g.height*.7,gx,gy-g.height*.7+14);
   ctx.quadraticCurveTo(gx-12,gy-g.height*.7,gx,gy-g.height*.7-14);ctx.fill();
   ctx.fillStyle='#ffe082';ctx.font='bold 8px sans-serif';ctx.textAlign='center';
   ctx.fillText('J/K',gx,gy-g.height*.7+30);
  }
 }

 // ── Golden crisp collectibles ──
 for(const c of FRITA_CRISPS){
  const key=FRAGMENT_PREFIX+c.id;
  if(s.saved.has(key))continue;
  const fx=c.x-cam.x,fy=c.y-cam.y;
  const bob=Math.sin(t*.12+c.x)*.5*6;
  // Golden circular chip
  ctx.fillStyle='#ffd54f';ctx.strokeStyle='#fff9c4';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(fx,fy+bob,13,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Crispy texture lines
  ctx.strokeStyle='rgba(255,180,0,0.6)';ctx.lineWidth=1;
  for(let l=-1;l<=1;l++){
   ctx.beginPath();ctx.moveTo(fx-10,fy+bob+l*5);ctx.lineTo(fx+10,fy+bob+l*5);ctx.stroke();
  }
 }

 // ── Market lantern beacons ──
 for(const b of FRITA_BEACONS){
  const active=s.saved.has(b.id);
  const bx=b.x-cam.x,by=b.y-cam.y;
  // Pole
  ctx.fillStyle='#5d4037';ctx.fillRect(bx-5,by-60,10,60);
  // Lantern body
  ctx.fillStyle=active?'#ffd54f':'#ff8f00';ctx.strokeStyle='rgba(200,140,0,0.8)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.ellipse(bx,by-70,14,20,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Cross bars
  ctx.strokeStyle='rgba(120,80,20,0.6)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(bx-14,by-70);ctx.lineTo(bx+14,by-70);ctx.stroke();
  ctx.beginPath();ctx.moveTo(bx,by-90);ctx.lineTo(bx,by-50);ctx.stroke();
  // Glow
  if(active){
   ctx.fillStyle='rgba(255,213,79,0.28)';
   ctx.beginPath();ctx.arc(bx,by-70,30+Math.sin(t*.14)*5,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle=active?'#fff59d':'#ffb300';ctx.font='bold 8px sans-serif';ctx.textAlign='center';
  ctx.fillText(b.label,bx,by-6);
 }

 // ── Feast altar (golden caldero) ──
 {
  const ax=3780-cam.x,ay=1100-cam.y;
  // Caldero base
  ctx.fillStyle='#e65100';ctx.fillRect(ax-48,ay-20,96,20);
  ctx.fillStyle='#bf360c';ctx.fillRect(ax-36,ay-42,72,22);
  // Bowl
  ctx.fillStyle=s.altarLit?'#ffd600':'#ff8f00';
  ctx.beginPath();ctx.arc(ax,ay-55,28,0,Math.PI*2);ctx.fill();
  if(s.altarLit){
   const age=s.altarAge||0;
   ctx.fillStyle=`rgba(255,220,0,${0.28+Math.sin(age*.08)*.1})`;
   ctx.beginPath();ctx.arc(ax,ay-55,50+Math.sin(age*.1)*8,0,Math.PI*2);ctx.fill();
  }
 }

 // ── Act banner ──
 if(s.banner>0&&s.bannerText){
  const alpha=Math.min(1,s.banner/30);
  ctx.fillStyle=`rgba(30,12,4,${0.88*alpha})`;ctx.fillRect(160,44,760,58);
  ctx.strokeStyle=`rgba(255,213,79,${alpha})`;ctx.lineWidth=2;ctx.strokeRect(160,44,760,58);
  ctx.globalAlpha=alpha;
  ctx.fillStyle='#fff59d';ctx.font='bold 17px sans-serif';ctx.textAlign='center';
  ctx.fillText(s.bannerText,540,72);
  ctx.fillStyle='#ffe082';ctx.font='12px sans-serif';
  ctx.fillText(s.bannerSub,540,92);
  ctx.globalAlpha=1;
 }
 ctx.restore();
}

// ── snapshot ──────────────────────────────────────────────────────────────────
export function fritaTrailSnapshot(g){
 return {
  active:!!g.fritaTrail,
  complete:g.fritaTrail?.complete||false,
  act:g.fritaTrail?.act||0,
  crisps:[...g.fritaTrail?.saved||[]].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length
 };
}
