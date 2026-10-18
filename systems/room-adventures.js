import {makeFoe,applyElite,isAirFoe} from '../engine/foes.js';
import {addPlayerXp,addScore} from './mutations.js';
import {MAX_RUNTIME_ENEMIES} from './runtime.js';
import {campaignRole} from './campaign-enemies.js';

const TAU=Math.PI*2;
export const ADVENTURES=Object.freeze({
 hub:{name:'El sendero de las luciérnagas',kind:'race',color:'#e7e99a'},
 beach:{name:'La guardia de las mareas',kind:'battle',foes:['cangrejo','gaviota','planta'],color:'#7fe1ee'},
 jungle:{name:'La carrera de las copas',kind:'race',color:'#b5ef8c'},
 cave:{name:'El eco despierta',kind:'battle',foes:['murcielago','arana','cucaracho'],color:'#c1afff'},
 lab:{name:'Alarma del experimento',kind:'battle',foes:['ufo','phosquito','arana'],color:'#81eeec'},
 ridge:{name:'Los anillos del viento',kind:'race',color:'#e1e9ff'},
 space:{name:'Patrulla de estrellas',kind:'battle',foes:['ufo','phosquito'],color:'#ceadff'},
 reef:{name:'El collar de coral',kind:'race',color:'#ffa8d8'},
 volcano:{name:'El corazón de la caldera',kind:'battle',foes:['escoria','brasita','planta'],color:'#ffc184'}
});
const center=p=>({x:p.x+p.w/2,y:p.y+p.h/2});
const live=e=>e&&e.hp>0&&!e.dying&&!e.fell;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function notify(g,message){g.nums?.add?.(g.player.x,g.player.y-40,message,'#fff0b8',true);}
function progress(g){
 if(g._adventureOwner!==g.player){g._adventureOwner=g.player;g.adventureMedals={};}
 return g.adventureMedals;
}

export function enterAdventure(g){
 const def=ADVENTURES[g.roomId];progress(g);
 if(!def){g.adventure=null;return null;}
 const ledges=(g.platforms||[]).filter(p=>p.h<=40&&p.w>=120&&p.y>250&&p.y<(g.worldH||1260)-180).sort((a,b)=>a.x-b.x);
 const ground=(g.platforms||[]).filter(p=>p.h>40).sort((a,b)=>a.x-b.x);
 if(!ledges.length||!ground.length){g.adventure=null;return null;}
 // The beacon starts on a real floor; the race follows authored footholds.
 const floor=ground[0],x=floor.x+Math.min(floor.w-90,480);
 const candidates=ledges.filter(p=>p.x+p.w/2>x-80);
 const path=(candidates.length>=3?candidates:ledges).slice(0,6).map(p=>({x:p.x+p.w/2,y:p.y-38,taken:false}));
 const a={...def,room:g.roomId,x,y:floor.y,phase:g.adventureMedals[g.roomId]?'won':'ready',
  path,index:0,left:0,wave:0,pending:[],spawned:[],rewarded:!!g.adventureMedals[g.roomId],clock:0};
 // Generous travel allowance includes horizontal travel and repeated jumps.
 a.duration=Math.max(40*60,Math.ceil(path.reduce((n,p,i)=>n+distance(p,i?path[i-1]:a),0)/2.1)+path.length*90);
 g.adventure=a;return a;
}

export function adventurePrompt(g){
 const a=g.adventure,p=g.player;if(!a||!p||p.dead)return '';
 if(a.phase==='ready'&&Math.hypot(center(p).x-a.x,p.y+p.h-a.y)<110)
  return 'E · '+a.name+' · '+(a.kind==='race'?'carrera de anillos':'reto de combate');
 return '';
}

function queueWave(g,a){
 const p=g.player,feet=p.y+p.h,platform=(g.platforms||[]).filter(pl=>pl.h>40&&pl.x<=p.x+p.w&&pl.x+pl.w>=p.x).sort((x,y)=>Math.abs(x.y-feet)-Math.abs(y.y-feet))[0];
 const floor=platform||(g.platforms||[]).find(pl=>pl.h>40);
 if(!floor)return;
 const count=2+Math.min(2,a.wave+Math.floor((p.evo||0)/3));
 for(let i=0;i<count;i++){
  const side=i%2?1:-1,raw=center(p).x+side*(150+Math.floor(i/2)*100);
  a.pending.push({x:Math.max(floor.x+40,Math.min(floor.x+floor.w-40,raw)),y:floor.y,
   kind:a.foes[(i+a.wave)%a.foes.length],elite:a.wave===1&&i===0,wait:65+i*22});
 }
 a.phase='warning';
 notify(g,a.wave?'¡LLEGA EL GUARDIÁN!':'¡EMBOSCADA!');
}

export function interactAdventure(g){
 if(!adventurePrompt(g))return false;
 const a=g.adventure;a.index=0;a.path.forEach(p=>p.taken=false);a.left=a.duration;a.wave=0;
 if(a.kind==='race'){a.phase='racing';notify(g,'¡SIGUE LOS ANILLOS!');}
 else queueWave(g,a);
 return true;
}

function reward(g,a){
 if(a.rewarded)return;
 a.rewarded=true;a.phase='won';g.adventureMedals[g.roomId]=true;
 const xp=28+(g.player.evo||0)*8;
 addPlayerXp(g.player,xp);addScore(g,650);
 g.fx?.emit?.(a.x,a.y-40,{color:a.color,count:18,size:4,speed:3,life:30,star:true});
 notify(g,'¡RETO COMPLETADO! +'+xp+' XP');
}

export function updateAdventure(g){
 const a=g.adventure,p=g.player;if(!a||a.room!==g.roomId||!p)return;
 a.clock++;
 if(p.dead){
  // Removing the encounter on death cannot leave an unwinnable half-wave.
  const spawned=new Set(a.spawned);g.enemies=(g.enemies||[]).filter(e=>!spawned.has(e));
  a.pending=[];a.spawned=[];a.phase=a.rewarded?'won':'ready';return;
 }
 if(a.phase==='racing'){
  if(--a.left<=0){a.phase='ready';notify(g,'OTRA VUELTA · E PARA REINTENTAR');return;}
  const ring=a.path[a.index];
  if(ring&&distance(center(p),ring)<Math.max(42,p.h*.65)){
   ring.taken=true;a.index++;
   g.fx?.emit?.(ring.x,ring.y,{color:a.color,count:8,size:3,speed:2,life:16});
   if(a.index===a.path.length)reward(g,a);
  }
 }
 if(a.phase==='warning'||a.phase==='fighting'){
  for(const spawn of a.pending){
   if(--spawn.wait>0)continue;
   if((g.enemies||[]).length>=MAX_RUNTIME_ENEMIES){spawn.wait=15;continue;}
   const e=makeFoe(spawn.x,spawn.y-80,spawn.kind,g.roomId,100+a.spawned.length);
   if(spawn.elite)applyElite(e);
   e.x=Math.max(0,spawn.x-e.w/2);e.y=spawn.y-e.h-(isAirFoe(e)?110:0);
   e.spawnIndex=100+a.spawned.length;e.roomId=g.roomId;e._adventureFoe=true;
   e.campaignRole=campaignRole(g.roomId,a.spawned.length+a.wave*3);
   e.invuln=12;e.flash=12;e.dropsOrb=false;e.canSplit=false;
   g.enemies.push(e);a.spawned.push(e);spawn.done=true;
   g.fx?.emit?.(spawn.x,spawn.y-20,{color:a.color,count:12,size:3,speed:2,life:20});
  }
  a.pending=a.pending.filter(s=>!s.done);
  if(!a.pending.length){
   a.phase='fighting';
   if(a.spawned.length&&!a.spawned.some(live)){
    if(a.wave===0){a.wave=1;queueWave(g,a);}
    else reward(g,a);
   }
  }
 }
}

export function adventureSnapshot(g){
 const a=g.adventure;return a?{room:a.room,name:a.name,kind:a.kind,phase:a.phase,x:a.x,y:a.y,index:a.index,
  total:a.path.length,left:a.left,wave:a.wave,pending:a.pending.length,enemies:a.spawned.filter(live).length,
  path:a.path.map(({x,y})=>({x,y})),medals:Object.keys(g.adventureMedals||{}).length}:null;
}

function diamond(ctx,x,y,r){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.65,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.65,y);ctx.closePath();}
export function drawAdventure(ctx,g,cam,t){
 const a=g.adventure;if(!a||a.room!==g.roomId)return;
 ctx.save();try{
  const x=a.x-cam.x,y=a.y-cam.y,tick=g.reduceMotion?0:t;
  ctx.fillStyle='#253e48';ctx.strokeStyle=a.color;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x-23,y);ctx.lineTo(x-17,y-28);ctx.lineTo(x+17,y-28);ctx.lineTo(x+23,y);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=a.rewarded?'#f6d887':a.color;diamond(ctx,x,y-47+Math.sin(tick*.045)*3,15);ctx.fill();ctx.stroke();
  ctx.textAlign='center';ctx.font='700 11px Outfit, sans-serif';ctx.fillStyle='#fff2d2';ctx.strokeStyle='#102737';ctx.lineWidth=4;
  const label=a.rewarded?'★ RETO COMPLETADO':a.name;
  ctx.strokeText(label,x,y-78);ctx.fillText(label,x,y-78);
  if(a.phase==='racing'){
   for(let i=a.index;i<a.path.length;i++){
    const ring=a.path[i],rx=ring.x-cam.x,ry=ring.y-cam.y;
    ctx.globalAlpha=i===a.index?1:.28;ctx.strokeStyle=a.color;ctx.lineWidth=i===a.index?4:2;
    ctx.beginPath();ctx.ellipse(rx,ry,23,29,0,0,TAU);ctx.stroke();
    ctx.fillStyle='#fff4d8';ctx.font='700 13px Outfit, sans-serif';ctx.fillText(String(i+1),rx,ry+5);
   }ctx.globalAlpha=1;
  }
  for(const s of a.pending){
   const sx=s.x-cam.x,sy=s.y-cam.y;
   ctx.strokeStyle=a.color;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.ellipse(sx,sy-4,32,10,0,0,TAU);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle=a.color;ctx.fillText(s.elite?'¡ÉLITE!':'!',sx,sy-34);
  }
  if(['racing','warning','fighting'].includes(a.phase)){
   const text=a.kind==='race'?`${a.index}/${a.path.length} anillos · ${Math.ceil(a.left/60)} s`:`Oleada ${a.wave+1}/2 · ${a.pending.length+a.spawned.filter(live).length} enemigos`;
   // This panel follows the viewport, while the beacon stays in the world.
   const width=g.viewW||ctx.canvas.clientWidth||ctx.canvas.width;
   ctx.globalAlpha=.94;ctx.fillStyle='#102e3b';ctx.fillRect(Math.max(10,width/2-140),150,280,31);
   ctx.globalAlpha=1;ctx.font='700 12px Outfit, sans-serif';ctx.fillStyle=a.color;ctx.fillText(text,Math.max(150,width/2),170);
  }
 }finally{ctx.restore();}
}
