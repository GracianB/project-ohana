import {MAX_RUNTIME_PROJECTILES} from './runtime.js';
const TAU=Math.PI*2;
const center=e=>({x:e.x+e.w/2,y:e.y+e.h/2});

// One interruptible counterattack per elite. Boss routines remain independent.
export function updateChampions(g){
 const p=g.player;if(!p||p.dead)return;
 for(const e of g.enemies||[]){
  if(!e.elite||e.boss||e.hp<=0||e.dying||e.fell)continue;
  const c=center(e),target=center(p),state=e._champion;
  if(!state){
   if(e.hp>(e.max||e.maxHp||e.hp)*.5||(e.stun||0)>0||(e.sleep||0)>0||Math.hypot(target.x-c.x,target.y-c.y)>520)continue;
   const angle=Math.atan2(target.y-c.y,target.x-c.x);
   e._champion={left:48,angle,phase:'warning',used:false};
  }else if(state.phase==='warning'){
   if((e.stun||0)>5||(e.sleep||0)>0){
    state.phase='broken';state.left=35;state.used=true;
    g.nums?.add?.(e.x,e.y-28,'¡INTERRUMPIDO!','#b8f0ca',false);continue;
   }
   if(--state.left>0)continue;
   state.phase='spent';state.used=true;
   for(const side of [-1,1]){
    if(g.projectiles.length>=MAX_RUNTIME_PROJECTILES)break;
    const a=state.angle+side*.18;
    g.projectiles.push({x:c.x-5,y:c.y-5,w:10,h:10,vx:Math.cos(a)*4.2,vy:Math.sin(a)*4.2,
     owner:'enemy',life:95,dmg:9,color:'#ffb574',shape:'orb'});
   }
   g.fx?.emit?.(c.x,c.y,{color:'#ffd29b',count:8,size:3,speed:2,life:18});
  }else if(state.phase==='broken')state.left=Math.max(0,state.left-1);
 }
}

export function drawChampionSignals(ctx,g,cam){
 if(!g.player||g.player.dead)return;
 ctx.save();try{
  for(const e of g.enemies||[]){
   const state=e._champion;if(!state||e.hp<=0||e.dying||e.fell)continue;
   const c=center(e),x=c.x-cam.x,y=c.y-cam.y;
   if(state.phase==='warning'){
    ctx.strokeStyle='#ffd19c';ctx.lineWidth=2;ctx.globalAlpha=.8;
    ctx.beginPath();ctx.arc(x,y,Math.max(e.w,e.h)*.6+6,-Math.PI/2,-Math.PI/2+TAU*(1-state.left/48));ctx.stroke();
    ctx.setLineDash([6,6]);ctx.globalAlpha=.5;
    for(const side of [-1,1]){const a=state.angle+side*.18;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*170,y+Math.sin(a)*170);ctx.stroke();}
    ctx.setLineDash([]);ctx.globalAlpha=1;ctx.font='700 10px Outfit, sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffddad';ctx.fillText('¡CONTRAGOLPE!',x,e.y-cam.y-27);
   }else if(state.phase==='broken'&&state.left>0){
    ctx.globalAlpha=state.left/35;ctx.strokeStyle='#b8f0ca';ctx.beginPath();ctx.moveTo(x-8,y-8);ctx.lineTo(x+8,y+8);ctx.moveTo(x+8,y-8);ctx.lineTo(x-8,y+8);ctx.stroke();
   }
  }
 }finally{ctx.restore();}
}
