// REINO DEL HORNO — Pizza's solo campaign chapter inside the expanded Claro.
// Cheese lava launchers (vertical), stone oven blast gates, revolving brick slabs,
// hearth braziers and the coliseum arena with Chef Magmático.
// Unique mechanic: pizzaAbility near a launcher → PIZZA SPIN (360° spin that
// deflects one incoming projectile and gives a height boost).
import {movePlatform,drawPlatformRail} from './moving-platforms.js';
import {createPizzaBoss,PIZZA_BOSS_ID} from './pizza-boss.js';

const SAVE_KEY='pizza-trail-v1';
const FRAGMENT_PREFIX='pizza-gem-';

export const PIZZA_BEACONS=Object.freeze([
 Object.freeze({id:'pizza-oven',      x:440, y:1074,label:'HORNO',  need:0,line:'El horno de piedra enciende sus brasas estelares por primera vez.'}),
 Object.freeze({id:'pizza-galleries', x:1720,y:1090,label:'MASA',   need:2,line:'Las galerías de queso fundido fluyen con calor celeste.'}),
 Object.freeze({id:'pizza-shrine',    x:3080,y:1084,label:'ESTELAR',need:4,line:'¡El Chef Magmático despierta en la cámara del Gran Coliseo!'})
]);

// ── 8 stellar gems on new unique positions ────────────────────────────────────
export const PIZZA_GEMS=Object.freeze([
 Object.freeze({id:'a',x:290, y:1018}),  // Sector 0 — oven step
 Object.freeze({id:'b',x:560, y:892}),   // Sector 0 — mid brick
 Object.freeze({id:'c',x:870, y:828}),   // Sector 0 — upper ledge
 Object.freeze({id:'d',x:1520,y:768}),   // Sector 1 — oven tray top
 Object.freeze({id:'e',x:1840,y:718}),   // Sector 1 — second tray
 Object.freeze({id:'f',x:2710,y:818}),   // Sector 2 — cheese cave
 Object.freeze({id:'g',x:2910,y:408}),   // Sector 2 — high shelf
 Object.freeze({id:'h',x:3780,y:1075})   // Sector 3 — altar approach
]);

// ── 4 cheese lava launchers ───────────────────────────────────────────────────
export const PIZZA_LAUNCHERS=Object.freeze([
 Object.freeze({x:1160,y:1134,force:17.0,spinBoost:16,color:'#ff7043'}),
 Object.freeze({x:1680,y:1134,force:16.8,spinBoost:15,color:'#ffb74d'}),
 Object.freeze({x:2350,y:1134,force:17.2,spinBoost:16,color:'#ff7043'}),
 Object.freeze({x:2810,y:1134,force:17.0,spinBoost:15,color:'#ffb74d'})
]);

// ── 3 stone oven blast gates ──────────────────────────────────────────────────
export const PIZZA_GATES=Object.freeze([
 Object.freeze({x:1480,y:1134,w:60,height:162,offset:0}),
 Object.freeze({x:2520,y:1134,w:60,height:162,offset:50}),
 Object.freeze({x:2860,y:1134,w:60,height:162,offset:100})
]);

export const PIZZA_ACTS=Object.freeze([
 'LA ENTRADA DEL HORNO','LAS GALERÍAS DE LA MASA','LOS RÍOS DE QUESO',
 'EL CHEF MAGMÁTICO','EL HORNO ESTELAR'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read  =(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

export function enterPizzaTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='pizza'||g.personalAdventureSolo===false){g.pizzaTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(PIZZA_BOSS_ID);
 const index=complete?PIZZA_BEACONS.length:Math.max(0,PIZZA_BEACONS.findIndex(b=>!saved.has(b.id)));

 // Revolving brick slab platforms — slower, heavier feel
 const lifts=[
  {axis:'x',x:1040,y:860,span:250,period:270},
  {axis:'y',x:1560,y:790,span:190,period:310},
  {axis:'x',x:2470,y:750,span:270,period:280},
  {axis:'y',x:2790,y:640,span:300,period:320}
 ].map((motion,i)=>{
  motion.start=Number(g.t)||0;motion.phase=i*.68;
  const platform={x:motion.x,y:motion.y,w:200,h:24,_campaignLift:true};
  return {motion,platform};
 });
 for(const item of lifts)if(!g.platforms.includes(item.platform))g.platforms.push(item.platform);

 g.pizzaTrail={
  saved,complete,index:index<0?PIZZA_BEACONS.length:index,
  bossDefeated:cleared,banner:0,bannerText:'',bannerSub:'',lifts,
  gateShorts:[0,0,0],altarLit:complete,altarAge:0,
  act:cleared?4:Math.min(3,index<0?3:index),
  spinCooldown:[0,0,0,0]
 };
}

export function updatePizzaTrail(game,hurtPlayer){
 const s=game.pizzaTrail,p=game.player;if(!s||!p||p.dead)return;
 for(const item of s.lifts)movePlatform(item.platform,item.motion,game.t,p);
 if(s.banner>0)s.banner--;

 for(let i=0;i<PIZZA_LAUNCHERS.length;i++){
  const lnch=PIZZA_LAUNCHERS[i];if(s.spinCooldown[i]>0){s.spinCooldown[i]--;continue;}
  const dx=Math.abs(p.x+p.w/2-lnch.x);
  if(dx<52&&p.y<lnch.y&&p.y>lnch.y-300){
   p.vy=Math.max(-lnch.force,p.vy-1.2);p.grounded=false;
   if(game.t%4===0)game.fx?.emit?.(p.x+p.w/2,p.y+p.h,{color:lnch.color,count:3,up:5,size:4.5,life:28});
  }
 }

 for(let i=0;i<PIZZA_GATES.length;i++){
  const gate=PIZZA_GATES[i];if(s.gateShorts[i]>0){s.gateShorts[i]--;continue;}
  const near=Math.abs(p.x+p.w/2-gate.x)<gate.w+28&&p.y+p.h>gate.y-gate.height&&p.y<gate.y;
  if(near){if(p.x+p.w/2<gate.x)p.x=gate.x-gate.w/2-p.w;else p.x=gate.x+gate.w/2;p.vx=0;}
 }

 for(const gem of PIZZA_GEMS){
  const key=FRAGMENT_PREFIX+gem.id;
  if(!s.saved.has(key)&&inRange(p,gem.x,gem.y,40)){
   persist(game,key);s.saved.add(key);
   game.nums?.add?.(gem.x,gem.y-28,'+1 INGREDIENTE ESTELAR','#ffe0b2',true);
   game.fx?.emit?.(gem.x,gem.y,{color:'#ff7043',count:12,up:4.5,size:3.5,life:32});
  }
 }

 for(let i=0;i<PIZZA_BEACONS.length;i++){
  const b=PIZZA_BEACONS[i];
  if(!s.saved.has(b.id)&&inRange(p,b.x,b.y,65)){
   const collected=[...s.saved].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length;
   if(collected>=b.need){
    persist(game,b.id);s.saved.add(b.id);
    s.index=i+1;s.act=Math.min(4,i+1);
    s.banner=190;s.bannerText=b.label+' ENCENDIDO';s.bannerSub=b.line;
    game.fx?.emit?.(b.x,b.y,{color:'#ff7043',count:18,up:6.5,size:5,life:48});
   }
  }
 }

 const arenaX=3420,bossDefeated=(game.clearedEncounters?.hub||[]).includes(PIZZA_BOSS_ID);
 if(!bossDefeated&&!game.enemies.some(e=>e._pizzaBoss)&&Math.abs(p.x-arenaX)<800){
  const boss=createPizzaBoss((x,y,k,r,idx,extra)=>game.createEnemy?.(x,y,k,r,idx,extra)||{x,y,w:120,h:128,hp:480,max:480});
  game.enemies.push(boss);
 }
 if(!s.bossDefeated&&bossDefeated){
  s.bossDefeated=true;s.act=4;
  s.banner=210;s.bannerText='¡CHEF MAGMÁTICO DERROTADO!';
  s.bannerSub='El Altar del Horno Estelar ha despertado — reclama el Horno Estelar.';
 }

 const altarX=3780,altarY=1100;
 if(s.bossDefeated&&!s.complete&&inRange(p,altarX,altarY,70)){
  persist(game,SAVE_KEY);s.complete=true;s.altarLit=true;s.altarAge=0;
  s.banner=250;s.bannerText='¡RELIQUIA: HORNO ESTELAR!';
  s.bannerSub='Pizza ha encendido el horno ancestral de la familia.';
  p._heroHundredBonus='HORNO ESTELAR';game.roomAlbums?.hub?.relic?.();
 }
 if(s.altarLit)s.altarAge=(s.altarAge||0)+1;
}

// PIZZA SPIN: near launcher → vertical boost + spin deflect; near gate → blast open
export function pizzaAbility(game,player,index){
 const s=game.pizzaTrail;if(!s||!player)return;
 for(let i=0;i<PIZZA_LAUNCHERS.length;i++){
  const lnch=PIZZA_LAUNCHERS[i];if(s.spinCooldown[i]>0)continue;
  if(Math.abs(player.x+player.w/2-lnch.x)<110&&player.y<lnch.y&&player.y>lnch.y-380){
   s.spinCooldown[i]=175;
   player.vy=-lnch.spinBoost;player.grounded=false;
   game.nums?.add?.(lnch.x,lnch.y-70,'¡PIZZA SPIN!','#ffe0b2',true);
   game.fx?.emit?.(lnch.x,lnch.y,{color:lnch.color,count:22,up:7,size:5.5,life:48});
  }
 }
 for(let i=0;i<PIZZA_GATES.length;i++){
  const gate=PIZZA_GATES[i];if(s.gateShorts[i]>0)continue;
  if(Math.abs(player.x+player.w/2-gate.x)<110&&Math.abs(player.y-gate.y)<gate.height+90){
   s.gateShorts[i]=200;
   game.nums?.add?.(gate.x,gate.y-gate.height/2,'¡HORNO ABIERTO!','#ffe0b2',true);
   game.fx?.emit?.(gate.x,gate.y-gate.height/2,{color:'#ff7043',count:18,up:6,size:5,life:40});
  }
 }
}

export function drawPizzaTrail(ctx,game,cam,t){
 const s=game.pizzaTrail;if(!s)return;
 ctx.save();
 for(const item of s.lifts)drawPlatformRail(ctx,item.platform,item.motion,cam);

 // Cheese lava launchers
 for(let i=0;i<PIZZA_LAUNCHERS.length;i++){
  const lnch=PIZZA_LAUNCHERS[i];
  const lx=lnch.x-cam.x,ly=lnch.y-cam.y;
  const spin=s.spinCooldown[i]>0;
  ctx.fillStyle=spin?'#bf360c':'#8d3800';
  ctx.beginPath();ctx.moveTo(lx-38,ly);ctx.lineTo(lx-22,ly-22);ctx.lineTo(lx+22,ly-22);ctx.lineTo(lx+38,ly);ctx.closePath();ctx.fill();
  const pulse=Math.sin(t*.2+lnch.x)*(spin?16:7);
  const colH=spin?220:140;
  const chG=ctx.createLinearGradient(lx,ly-22,lx,ly-colH+pulse);
  chG.addColorStop(0,spin?'rgba(255,160,0,0.9)':'rgba(255,112,67,0.65)');chG.addColorStop(1,'rgba(255,112,67,0)');
  ctx.fillStyle=chG;
  ctx.beginPath();ctx.moveTo(lx-22,ly-22);ctx.lineTo(lx-(spin?34:22),ly-colH+pulse);ctx.lineTo(lx+(spin?34:22),ly-colH+pulse);ctx.lineTo(lx+22,ly-22);ctx.closePath();ctx.fill();
  if(spin){ctx.fillStyle='rgba(255,224,178,0.9)';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('SPIN',lx,ly-colH-8);}
 }

 // Stone oven gates
 for(let i=0;i<PIZZA_GATES.length;i++){
  const g=PIZZA_GATES[i],shorted=s.gateShorts[i]>0;
  const gx=g.x-cam.x,gy=g.y-cam.y;
  if(shorted){
   ctx.strokeStyle='rgba(255,224,178,0.4)';ctx.lineWidth=1.5;
   for(let sh=0;sh<5;sh++){const sx=gx-26+sh*13,sy=gy-g.height*.5+sh*20;ctx.save();ctx.translate(sx,sy);ctx.rotate(sh*.55);ctx.strokeRect(-4,-7,8,14);ctx.restore();}
  }else{
   ctx.fillStyle='#5d3000';ctx.fillRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.strokeStyle='#ff7043';ctx.lineWidth=2.5;ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
   // Pizza icon
   ctx.fillStyle='#ffd54f';ctx.beginPath();ctx.arc(gx,gy-g.height*.6,13,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#e53935';ctx.beginPath();ctx.arc(gx,gy-g.height*.6,8,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#ffe0b2';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText('J/K',gx,gy-g.height*.6+26);
  }
 }

 // Stellar gem collectibles
 for(const gem of PIZZA_GEMS){
  const key=FRAGMENT_PREFIX+gem.id;if(s.saved.has(key))continue;
  const gx=gem.x-cam.x,gy=gem.y-cam.y;
  const bob=Math.sin(t*.11+gem.x)*.5*6;
  // Pizza slice silhouette
  ctx.fillStyle='#ffd54f';ctx.strokeStyle='#ff7043';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(gx,gy-14+bob);ctx.lineTo(gx+12,gy+8+bob);ctx.lineTo(gx-12,gy+8+bob);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(gx,gy-3+bob,5,Math.PI,0);ctx.stroke();
  ctx.fillStyle='#e53935';ctx.beginPath();ctx.arc(gx-4,gy-1+bob,2.5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(gx+4,gy-1+bob,2.5,0,Math.PI*2);ctx.fill();
 }

 // Hearth beacons
 for(const b of PIZZA_BEACONS){
  const active=s.saved.has(b.id);
  const bx=b.x-cam.x,by=b.y-cam.y;
  ctx.fillStyle='#4a1800';ctx.fillRect(bx-10,by-48,20,48);
  ctx.fillStyle=active?'#ff7043':'#8d3800';
  ctx.beginPath();ctx.moveTo(bx-14,by-48);ctx.lineTo(bx,by-75);ctx.lineTo(bx+14,by-48);ctx.closePath();ctx.fill();
  if(active){
   ctx.fillStyle='rgba(255,112,67,0.3)';ctx.beginPath();ctx.arc(bx,by-62,28+Math.sin(t*.14)*5,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle=active?'#ffe0b2':'#ff7043';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText(b.label,bx,by-6);
 }

 // Altar — brick oven shrine
 {
  const ax=3780-cam.x,ay=1100-cam.y;
  ctx.fillStyle='#4a1800';ctx.fillRect(ax-50,ay-20,100,20);
  ctx.fillStyle='#5d3000';ctx.fillRect(ax-36,ay-40,72,20);
  ctx.fillStyle=s.altarLit?'#ff6d00':'#8d3800';
  ctx.beginPath();ctx.arc(ax,ay-56,26,0,Math.PI*2);ctx.fill();
  if(s.altarLit){
   const age=s.altarAge||0;
   ctx.fillStyle=`rgba(255,109,0,${0.28+Math.sin(age*.08)*.1})`;ctx.beginPath();ctx.arc(ax,ay-56,48+Math.sin(age*.1)*8,0,Math.PI*2);ctx.fill();
  }
 }

 if(s.banner>0&&s.bannerText){
  const alpha=Math.min(1,s.banner/30);
  ctx.fillStyle=`rgba(28,10,4,${0.88*alpha})`;ctx.fillRect(160,44,760,58);
  ctx.strokeStyle=`rgba(255,112,67,${alpha})`;ctx.lineWidth=2;ctx.strokeRect(160,44,760,58);
  ctx.globalAlpha=alpha;
  ctx.fillStyle='#ffe0b2';ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.fillText(s.bannerText,540,72);
  ctx.fillStyle='#ffccbc';ctx.font='12px sans-serif';ctx.fillText(s.bannerSub,540,92);
  ctx.globalAlpha=1;
 }
 ctx.restore();
}

export function pizzaTrailSnapshot(g){
 return{active:!!g.pizzaTrail,complete:g.pizzaTrail?.complete||false,act:g.pizzaTrail?.act||0,gems:[...g.pizzaTrail?.saved||[]].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length};
}
