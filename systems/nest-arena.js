import {exposeNestQueen} from './boss-nido.js';
const TAU=Math.PI*2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const center=e=>({x:e.x+e.w/2,y:e.y+e.h/2});
function arena(g){
 const boss=g.boss;
 if(g.roomId!=='boss'||!boss||boss.hp<=0||boss.dying||g.player?.dead){g.nestArena=null;return null;}
 if(g.nestArena?.boss!==boss)g.nestArena={boss,phase:boss.phase||1,next:150,feathers:[],returned:0,waves:0,age:0};
 return g.nestArena;
}
function floorAt(g,x,p){
 const feet=p.y+p.h;
 const below=(g.platforms||[]).filter(pl=>x>=pl.x&&x<=pl.x+pl.w&&pl.y>=feet-12).sort((a,b)=>a.y-b.y);
 return below[0]?.y??(g.worldH||1260)-90;
}
function volley(g,s){
 const p=g.player,c=center(p),boss=s.boss,count=s.phase===3?3:2;
 for(let i=0;i<count;i++){
  const offset=i===0?0:(i%2?1:-1)*(180+Math.floor(i/2)*45);
  const x=clamp(c.x+offset,60,(g.worldW||3360)-60),floor=floorAt(g,x,p);
  s.feathers.push({x,y:floor-350,floor,phase:'warning',left:s.phase===3?80:65,life:150,spin:i*.7});
 }
 s.waves++;g.nums?.add?.(p.x,p.y-44,s.waves===1?'H · ¡DEVUELVE LAS PLUMAS!':'¡LLUVIA DE PLUMAS!','#ffe3ac',true);
 // Every volley leaves a clear lane between its announced columns.
 s.next=boss.phase===3?270:330;
}
function parry(g,f){
 const p=g.player,c=center(p),dx=f.x-c.x;
 const reach=Math.min(150,Math.max(78,Number(p._swing?.reach)||0));
 const melee=p.melee>0&&Math.abs(f.y-c.y)<p.h*.65+28&&Math.abs(dx)<reach&&dx*(p.facing||1)>-22;
 const shot=(g.projectiles||[]).find(b=>b.owner==='player'&&b.life>0&&Math.hypot(b.x+(b.w||0)/2-f.x,b.y+(b.h||0)/2-f.y)<26);
 if(!melee&&!shot)return false;
 if(shot)shot.life=0;
 f.phase='return';f.life=100;
 g.fx?.emit?.(f.x,f.y,{color:'#c4f4e0',count:8,size:3,speed:2,life:18});
 g.nums?.add?.(f.x,f.y-18,'¡DEVUELTA!','#d9f7cb',false);
 return true;
}
export function updateNestArena(g,{hurt,hit}={}){
 const s=arena(g);if(!s)return;
 const boss=s.boss,p=g.player;
 if(boss.introT>0)return;
 s.age++;
 if(boss.phase>=2)boss._feathersReturned=s.returned;
 if(s.phase!==boss.phase){s.phase=boss.phase;s.next=150;s.feathers=[];}
 if(s.phase>=2&&--s.next<=0&&s.feathers.length<6)volley(g,s);
 for(const f of s.feathers){
  if(f.phase==='warning'){
   if(--f.left<=0){f.phase='fall';f.y=f.floor-350;}
   continue;
  }
  if(--f.life<=0)continue;
  if(f.phase==='return'){
   const q=center(boss),dx=q.x-f.x,dy=q.y-f.y,d=Math.hypot(dx,dy)||1;
   f.x+=dx/d*16;f.y+=dy/d*16;
   if(d<Math.max(30,boss.w*.5)&&hit?.(g,boss,66,{color:'#fce7ae',parts:8,hitstop:0,ky:0})){
    f.life=0;s.returned++;boss._feathersReturned=s.returned;
    if(s.returned%3===0&&exposeNestQueen(boss,g,78))g.nums?.add?.(boss.x,boss.y-32,'¡REINA EXPUESTA!','#fff0b2',true);
   }
   continue;
  }
  if(parry(g,f))continue;
  if(f.phase==='fall'){
   f.y=Math.min(f.floor-12,f.y+12);
   if(f.y>=f.floor-12){f.phase='ember';f.life=75;}
  }
  const c=center(p),touch=f.phase==='fall'?Math.abs(c.x-f.x)<p.w/2+12&&Math.abs(c.y-f.y)<p.h/2+18:
   Math.abs(c.x-f.x)<p.w/2+24&&p.y+p.h>f.floor-25&&p.y<f.floor;
  if(touch)hurt?.(f.phase==='ember'?8:12,'PLUMA DEL NIDO');
 }
 s.feathers=s.feathers.filter(f=>f.life>0);
}
export function nestArenaSnapshot(g){
 const s=g.nestArena;return s?{phase:s.phase,returned:s.returned,waves:s.waves,next:s.next,
  feathers:s.feathers.map(({x,y,floor,phase,left})=>({x,y,floor,phase,left}))}:null;
}
function feather(ctx,x,y,angle,color,size=1){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(size,size);ctx.fillStyle=color;ctx.strokeStyle='#663b48';ctx.lineWidth=1.5;
 ctx.beginPath();ctx.moveTo(0,22);ctx.bezierCurveTo(-28,-5,-14,-30,0,-29);ctx.bezierCurveTo(18,-27,24,-2,0,22);ctx.fill();ctx.stroke();
 ctx.strokeStyle='#fff1cb';ctx.beginPath();ctx.moveTo(0,25);ctx.lineTo(0,-23);for(let i=0;i<4;i++){const y=-17+i*8;ctx.moveTo(0,y+7);ctx.lineTo(-9,y);ctx.moveTo(0,y+7);ctx.lineTo(10,y);}ctx.stroke();ctx.restore();
}
export function drawNestArena(ctx,g,cam,t){
 const s=g.nestArena;if(!s||g.roomId!=='boss'||s.boss.hp<=0||g.player?.dead)return;
 ctx.save();try{
  for(const f of s.feathers){
   const x=f.x-cam.x,y=f.y-cam.y,ground=f.floor-cam.y;
   if(f.phase==='warning'){
    const amount=1-f.left/(s.phase===3?80:65);
    ctx.fillStyle='#ffb882';ctx.globalAlpha=.09+amount*.12;ctx.fillRect(x-27,ground-350,54,350);
    ctx.globalAlpha=.85;ctx.strokeStyle='#ffd7a0';ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.ellipse(x,ground-4,29,10,0,0,TAU);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(x,ground-48,13,-Math.PI/2,-Math.PI/2+amount*TAU);ctx.stroke();
    feather(ctx,x,ground-330,0,'#ffd299',.4);
   }else if(f.phase==='ember'){
    ctx.globalAlpha=Math.min(1,f.life/18);feather(ctx,x,ground-13,Math.PI*.4,'#f6ae81',.65);
    ctx.strokeStyle='#ffe0a5';ctx.beginPath();ctx.ellipse(x,ground-4,25,7,0,0,TAU);ctx.stroke();
   }else{ctx.globalAlpha=1;feather(ctx,x,y,g.reduceMotion?0:f.spin+t*.035,f.phase==='return'?'#d3f5c8':'#ffc29a',.75);}
  }
 }finally{ctx.restore();}
}
