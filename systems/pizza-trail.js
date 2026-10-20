// REINO DEL HORNO — Pizza's solo campaign chapter inside the expanded Claro.
// Melted cheese bouncers, stone brick oven blast doors, hearth braziers, stellar gems,
// and the fiery hearth arena with Chef Magmático.
import {movePlatform} from './moving-platforms.js';
import {createPizzaBoss,PIZZA_BOSS_ID} from './pizza-boss.js';

const SAVE_KEY='pizza-trail-v1';
const FRAGMENT_PREFIX='pizza-gem-';

export const PIZZA_BEACONS=Object.freeze([
 Object.freeze({id:'pizza-entry',x:440,y:1074,label:'HORNO',need:0,line:'El horno de piedra ancestral enciende sus brasas estelares.'}),
 Object.freeze({id:'pizza-galleries',x:1720,y:1090,label:'MASA',need:2,line:'Las galerías de queso fundido fluyen con calor celestial.'}),
 Object.freeze({id:'pizza-shrine',x:3080,y:1084,label:'ESTELAR',need:4,line:'¡El Chef Magmático despierta en la cámara del horno celestial!'})
]);

export const PIZZA_GEMS=Object.freeze([
 Object.freeze({id:'a',x:540,y:1070}),
 Object.freeze({id:'b',x:820,y:830}),
 Object.freeze({id:'c',x:1480,y:1085}),
 Object.freeze({id:'d',x:2020,y:1080}),
 Object.freeze({id:'e',x:2520,y:1035}),
 Object.freeze({id:'f',x:2870,y:1075}),
 Object.freeze({id:'g',x:3350,y:1075}),
 Object.freeze({id:'h',x:3780,y:1075})
]);

export const PIZZA_LAUNCHERS=Object.freeze([
 Object.freeze({x:980,y:1134,force:16.8,color:'#ffd54f'}),
 Object.freeze({x:1720,y:1134,force:17.5,color:'#ffb74d'}),
 Object.freeze({x:2350,y:1134,force:16.8,color:'#ffd54f'}),
 Object.freeze({x:2800,y:1134,force:17.2,color:'#ffb74d'})
]);

export const PIZZA_GATES=Object.freeze([
 Object.freeze({x:1500,y:1134,w:65,height:170,offset:0}),
 Object.freeze({x:2550,y:1134,w:65,height:170,offset:68}),
 Object.freeze({x:2830,y:1134,w:65,height:170,offset:136})
]);

export const PIZZA_ACTS=Object.freeze([
 'LA ENTRADA DEL HORNO','LAS GALERÍAS DE LA MASA','LOS RÍOS DE QUESO',
 'EL CHEF MAGMÁTICO','EL HORNO ESTELAR'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read=(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

export function enterPizzaTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='pizza'||g.personalAdventureSolo===false){g.pizzaTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(PIZZA_BOSS_ID);
 const index=complete?PIZZA_BEACONS.length:Math.max(0,PIZZA_BEACONS.findIndex(b=>!saved.has(b.id)));
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
 g.pizzaTrail={
  saved,complete,index:index<0?PIZZA_BEACONS.length:index,
  bossDefeated:cleared,banner:0,bannerText:'',bannerSub:'',lifts,
  gateShorts:[0,0,0],altarLit:complete,altarAge:0,
  act:cleared?4:Math.min(3,index<0?3:index)
 };
}

export function updatePizzaTrail(game,hurtPlayer){
 const s=game.pizzaTrail,p=game.player;if(!s||!p||p.dead)return;
 for(const item of s.lifts)movePlatform(item.platform,item.motion,game.t,p);
 if(s.banner>0)s.banner--;

 // Cheese bouncer launchers
 for(const launcher of PIZZA_LAUNCHERS){
  const cx=launcher.x,dx=Math.abs(p.x+p.w/2-cx);
  if(dx<45&&p.y<launcher.y&&p.y>launcher.y-260){
   p.vy=Math.max(-launcher.force,p.vy-1.1);
   p.grounded=false;
   if(game.t%4===0){
    game.fx?.emit?.(p.x+p.w/2,p.y+p.h,{color:launcher.color,count:2,up:4.5,size:4,life:25});
   }
  }
 }

 // Oven brick gates
 for(let i=0;i<PIZZA_GATES.length;i++){
  const gate=PIZZA_GATES[i];
  if(s.gateShorts[i]>0){s.gateShorts[i]--;continue;}
  const near=Math.abs(p.x+p.w/2-gate.x)<gate.w+25&&p.y+p.h>gate.y-gate.height&&p.y<gate.y;
  if(near){
   if(p.x+p.w/2<gate.x)p.x=gate.x-gate.w-p.w/2;
   else p.x=gate.x+gate.w+p.w/2;
   p.vx=0;
  }
 }

 // Collect stellar gems
 for(const c of PIZZA_GEMS){
  const key=FRAGMENT_PREFIX+c.id;
  if(!s.saved.has(key)&&inRange(p,c.x,c.y,38)){
   persist(game,key);
   s.saved.add(key);
   game.nums?.add?.(c.x,c.y-25,'+1 INGREDIENTE ESTELAR','#ffe082',true);
   game.fx?.emit?.(c.x,c.y,{color:'#ffb74d',count:10,up:4,size:3.5,life:30});
  }
 }

 // Beacons
 for(let i=0;i<PIZZA_BEACONS.length;i++){
  const b=PIZZA_BEACONS[i];
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
    game.fx?.emit?.(b.x,b.y,{color:'#ff7043',count:16,up:6,size:4.5,life:45});
   }
  }
 }

 // Mini Boss encounter spawn
 const arenaX=3420,arenaY=1134;
 const bossDefeated=(game.clearedEncounters?.hub||[]).includes(PIZZA_BOSS_ID);
 if(!bossDefeated&&!game.enemies.some(e=>e._pizzaBoss)&&Math.abs(p.x-arenaX)<750){
  const boss=createPizzaBoss((x,y,k,r,idx,extra)=>game.createEnemy?.(x,y,k,r,idx,extra)||{x,y,w:126,h:102,hp:480,max:480});
  game.enemies.push(boss);
 }
 if(!s.bossDefeated&&bossDefeated){
  s.bossDefeated=true;
  s.act=4;
  s.banner=200;
  s.bannerText='¡CHEF MAGMÁTICO DERROTADO!';
  s.bannerSub='El Altar del Horno Estelar ha despertado.';
 }

 // Relic Altar
 const altarX=3780,altarY=1100;
 if(s.bossDefeated&&!s.complete&&inRange(p,altarX,altarY,65)){
  persist(game,SAVE_KEY);
  s.complete=true;
  s.altarLit=true;
  s.banner=240;
  s.bannerText='¡RELIQUIA: HORNO ESTELAR!';
  s.bannerSub='Pizza ha encendido el gran horno de las constelaciones.';
  p._heroHundredBonus='HORNO ESTELAR';
  game.roomAlbums?.hub?.relic?.();
 }
}

export function pizzaAbility(game,player,index){
 const s=game.pizzaTrail;if(!s||!player)return;
 for(let i=0;i<PIZZA_GATES.length;i++){
  const gate=PIZZA_GATES[i];
  if(Math.abs(player.x+player.w/2-gate.x)<100&&Math.abs(player.y-gate.y)<gate.height+80){
   s.gateShorts[i]=160;
   game.nums?.add?.(gate.x,gate.y-gate.height/2,'¡HORNO ABIERTO!','#ffe082',true);
   game.fx?.emit?.(gate.x,gate.y-gate.height/2,{color:'#ff7043',count:15,up:5,size:4,life:35});
  }
 }
}

export function drawPizzaTrail(ctx,game,cam,t){
 const s=game.pizzaTrail;if(!s)return;
 ctx.save();

 // Draw Cheese Launchers
 for(const launcher of PIZZA_LAUNCHERS){
  const lx=launcher.x-cam.x,ly=launcher.y-cam.y;
  ctx.fillStyle='#bf360c';
  ctx.beginPath();
  ctx.moveTo(lx-32,ly);
  ctx.lineTo(lx-18,ly-18);
  ctx.lineTo(lx+18,ly-18);
  ctx.lineTo(lx+32,ly);
  ctx.closePath();
  ctx.fill();
  const pulse=Math.sin(t*0.2+launcher.x)*8;
  ctx.fillStyle='rgba(255,213,79,0.5)';
  ctx.beginPath();
  ctx.moveTo(lx-18,ly-18);
  ctx.lineTo(lx-24,ly-160+pulse);
  ctx.lineTo(lx+24,ly-160+pulse);
  ctx.lineTo(lx+18,ly-18);
  ctx.closePath();
  ctx.fill();
 }

 // Draw Oven Gates
 for(let i=0;i<PIZZA_GATES.length;i++){
  const g=PIZZA_GATES[i],shorted=s.gateShorts[i]>0;
  const gx=g.x-cam.x,gy=g.y-cam.y;
  if(shorted){
   ctx.strokeStyle='rgba(255,167,38,0.35)';ctx.lineWidth=2;ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
  }else{
   ctx.fillStyle='#8d6e63';
   ctx.fillRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.strokeStyle='#ffcc80';ctx.lineWidth=3;
   ctx.strokeRect(gx-g.w/2,gy-g.height,g.w,g.height);
   ctx.fillStyle='#ff7043';
   ctx.beginPath();
   ctx.arc(gx,gy-g.height/2,16,0,Math.PI*2);
   ctx.fill();
  }
 }

 // Draw Stellar Gems
 for(const c of PIZZA_GEMS){
  const key=FRAGMENT_PREFIX+c.id;
  if(s.saved.has(key))continue;
  const fx=c.x-cam.x,fy=c.y-cam.y;
  const bob=Math.sin(t*0.12+c.x)*5;
  ctx.fillStyle='#ffb74d';
  ctx.strokeStyle='#ffe082';ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(fx,fy+bob,12,0,Math.PI*2);
  ctx.fill();ctx.stroke();
 }

 // Draw Hearth Beacons
 for(const b of PIZZA_BEACONS){
  const active=s.saved.has(b.id);
  const bx=b.x-cam.x,by=b.y-cam.y;
  ctx.fillStyle='#4e342e';ctx.fillRect(bx-10,by-40,20,40);
  ctx.fillStyle=active?'#ff7043':'#8d6e63';
  ctx.beginPath();ctx.arc(bx,by-48,14,0,Math.PI*2);ctx.fill();
  if(active){
   ctx.fillStyle='rgba(255,112,67,0.35)';
   ctx.beginPath();ctx.arc(bx,by-48,26+Math.sin(t*0.15)*4,0,Math.PI*2);ctx.fill();
  }
 }

 // Draw Relic Altar
 const ax=3780-cam.x,ay=1100-cam.y;
 ctx.fillStyle='#3e2723';
 ctx.fillRect(ax-40,ay-20,80,20);
 ctx.fillStyle=s.altarLit?'#ffab40':'#ff7043';
 ctx.beginPath();ctx.arc(ax,ay-35,22,0,Math.PI*2);ctx.fill();
 if(s.altarLit){
  ctx.fillStyle='rgba(255,171,64,0.35)';
  ctx.beginPath();ctx.arc(ax,ay-35,40+Math.sin(t*0.1)*6,0,Math.PI*2);ctx.fill();
 }

 // Act Banner
 if(s.banner>0&&s.bannerText){
  ctx.fillStyle='rgba(35,15,8,0.85)';
  ctx.fillRect(180,45,740,55);
  ctx.strokeStyle='#ff7043';ctx.lineWidth=2;
  ctx.strokeRect(180,45,740,55);
  ctx.fillStyle='#ffe082';ctx.font='bold 16px sans-serif';ctx.textAlign='center';
  ctx.fillText(s.bannerText,550,70);
  ctx.fillStyle='#ffcc80';ctx.font='12px sans-serif';
  ctx.fillText(s.bannerSub,550,90);
 }
 ctx.restore();
}

export function pizzaTrailSnapshot(g){
 return {
  active:!!g.pizzaTrail,
  complete:g.pizzaTrail?.complete||false,
  act:g.pizzaTrail?.act||0,
  gems:[...g.pizzaTrail?.saved||[]].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length
 };
}
