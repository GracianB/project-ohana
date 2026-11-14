// OHANA Michi · reactive bioluminescent ecosystem. Never changes physics/AI.
// Rendering is screen-space, deterministic, budgeted and respects reduced motion.
import {MICHI_BIOLUM_FORMS} from '../characters/michi-lumina.js';
const TAU=Math.PI*2,finite=(v,d=0)=>Number.isFinite(v)?v:d;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,finite(v)));
const palette=['#9cffd9','#96f7ff','#f3a5ff','#ffd9a0','#c0fcdf'];
const rgba=(hex,a)=>{const s=hex.slice(1);return 'rgba('+parseInt(s.slice(0,2),16)+','+parseInt(s.slice(2,4),16)+','+parseInt(s.slice(4,6),16)+','+clamp(a)+')';};
const EYE_COLORS=Object.freeze({
  medusa:'#eca5ff',ufo:'#92dcff',murcielago:'#b9a1ff',
  avispa:'#fce5a2',phosquito:'#7ae7f4',arana:'#ffa8c1',
  planta:'#a2ffd2',rana:'#b6fa9a',cangrejo:'#ffca9c'
});
export const MICHI_LIGHT_LIMIT=Object.freeze({enemies:18,fireflies:24,pathlights:24,bufferScale:.5});
export function isMichiWorld(game){
  return !!(game?.roomDef?.hero==='cat'&&game.roomDef.world1&&!game.roomDef.michiSanctuary);
}
export function planMichiLights(game,viewport={width:1280,height:720}){
  if(!isMichiWorld(game)||!game?.player)return null;
  const camX=finite(game.cam?.x),camY=finite(game.cam?.y),p=game.player;
  const form=Math.max(0,Math.min(4,Math.floor(finite(p.evo))));
  const width=Math.max(1,finite(viewport.width,1280)),height=Math.max(1,finite(viewport.height,720));
  const hero={x:finite(p.x)+finite(p.w)/2-camX,y:finite(p.y)+finite(p.h)*.45-camY,
    radius:MICHI_BIOLUM_FORMS[form].radius*(form===4?1.15:1),color:palette[form]};
  const enemies=(game.enemies||[]).filter(e=>e&&!e.dead&&!e.dying&&(e.hp??1)>0)
    .map(e=>({x:finite(e.x)+finite(e.w)/2-camX,y:finite(e.y)+finite(e.h)/2-camY,
      radius:e.boss?105:42,color:EYE_COLORS[e.kind]||palette[2],boss:!!e.boss}))
    .filter(e=>e.x>-130&&e.x<width+130&&e.y>-140&&e.y<height+140)
    .slice(0,MICHI_LIGHT_LIMIT.enemies);
  const flowers=[];
  const start=Math.floor((camX-180)/136),end=Math.ceil((camX+width+180)/136);
  for(let i=start;i<=end&&flowers.length<30;i++){
    const x=i*136+40-camX,y=finite(game.worldH,1260)-136-camY;
    // Stable scenery: intensifies as the hero approaches.
    const distance=Math.hypot(x-hero.x,(y-hero.y)*.7);
    const near=clamp(1-distance/330);
    flowers.push({x,y,near,id:i,color:i%3===0?'#ffbadf':i%3===1?'#8af6da':'#b1c6ff'});
  }
  // Actual colliders double as the bed for living mycelium. The lights
  // are cosmetic and cannot change the route, enemies or physics.
  const pathlights=[];
  const visible=(game.platforms||[]).filter(pl=>pl&&pl.w>=30&&pl.h>=3
    &&Number.isFinite(pl.x)&&Number.isFinite(pl.y)&&Number.isFinite(pl.w));
  for(const [index,pl] of visible.entries()){
    if(pathlights.length>=MICHI_LIGHT_LIMIT.pathlights)break;
    const left=Math.max(pl.x,camX-60),right=Math.min(pl.x+pl.w,camX+width+60);
    if(right<=left)continue;
    const y=pl.y-camY-4;if(y<-80||y>height+80)continue;
    const count=Math.min(3,Math.max(1,Math.floor((right-left)/95)));
    for(let k=0;k<count&&pathlights.length<MICHI_LIGHT_LIMIT.pathlights;k++){
      const x=left+(k+.5)*(right-left)/count-camX;
      const near=clamp(1-Math.hypot(x-hero.x,(y-hero.y)*.77)/(hero.radius+165));
      pathlights.push({x,y,near,id:index*4+k,color:palette[(index+k+form)%5]});
    }
  }
  return {hero,enemies,flowers,pathlights,form,width,height,darkness:clamp(.70-form*.025,.5,.72)};
}
let buffer=null,bufferCtx=null,bufferW=0,bufferH=0;
function darkenBuffer(plan,t,reduced){
  if(typeof document==='undefined'||typeof document.createElement!=='function')return null;
  const scale=MICHI_LIGHT_LIMIT.bufferScale;
  const w=Math.max(1,Math.min(1500,Math.ceil(plan.width*scale)));
  const h=Math.max(1,Math.min(1000,Math.ceil(plan.height*scale)));
  if(!buffer){buffer=document.createElement('canvas');bufferCtx=buffer.getContext('2d',{alpha:true});}
  if(!bufferCtx)return null;
  if(w!==bufferW||h!==bufferH){buffer.width=w;buffer.height=h;bufferW=w;bufferH=h;}
  const c=bufferCtx;c.setTransform(scale,0,0,scale,0,0);c.clearRect(0,0,plan.width,plan.height);
  c.globalCompositeOperation='source-over';c.fillStyle=rgba('#030919',plan.darkness);c.fillRect(0,0,plan.width,plan.height);
  c.globalCompositeOperation='destination-out';
  function erase(x,y,r,alpha){
    if(!(r>0))return;
    const flicker=reduced?1:(1+Math.sin(t*.036+x*.004)*.035);
    const radius=r*flicker;
    const g=c.createRadialGradient(x,y,Math.max(1,radius*.09),x,y,radius);
    g.addColorStop(0,rgba('#ffffff',alpha));
    g.addColorStop(.26,rgba('#ffffff',alpha*.97));
    g.addColorStop(.70,rgba('#ffffff',alpha*.46));
    g.addColorStop(1,rgba('#ffffff',0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,radius,0,TAU);c.fill();
  }
  // The hero is the primary source of illumination, not a fixed screen lamp.
  erase(plan.hero.x,plan.hero.y,plan.hero.radius,1);
  for(const e of plan.enemies)erase(e.x,e.y,e.radius,e.boss?.84:.6);
  for(const f of plan.flowers)if(f.near>.14)erase(f.x,f.y,23+f.near*29,f.near*.5);
  for(const q of plan.pathlights)if(q.near>.12)erase(q.x,q.y,20+q.near*38,q.near*.45);
  c.globalCompositeOperation='source-over';
  return buffer;
}
function bloom(ctx,x,y,r,col,opacity){
  const grad=ctx.createRadialGradient(x,y,0,x,y,Math.max(1,r));
  grad.addColorStop(0,rgba(col,.5*opacity));grad.addColorStop(.32,rgba(col,.22*opacity));grad.addColorStop(1,rgba(col,0));
  ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x,y,Math.max(1,r),0,TAU);ctx.fill();
}
function drawFirefly(ctx,x,y,t,i,reduced){
  const beat=reduced?1:Math.sin(t*.06+i*.91)*.3+.7;
  ctx.fillStyle=i%3?'#a8ffdc':'#ffe9ca';ctx.beginPath();ctx.arc(x,y,1+beat*.9,0,TAU);ctx.fill();
}
// Night veil goes above the level art and foes, BEFORE the playable actor/HUD.
export function drawMichiReactiveNight(ctx,game,t=0,w=1280,h=720,reduced=false){
  const plan=planMichiLights(game,{width:w,height:h});if(!plan)return false;
  const layer=darkenBuffer(plan,finite(t),!!reduced);
  if(!layer)return false;
  ctx.save();ctx.globalAlpha=1;ctx.drawImage(layer,0,0,plan.width,plan.height);
  // Enemies use silhouette-aware emissive cores. No flashes or rapid strobing.
  for(const e of plan.enemies){
    bloom(ctx,e.x,e.y,e.radius*.9,e.color,e.boss?.85:.60);
    ctx.fillStyle=e.color;for(const side of [-1,1]){
      ctx.beginPath();ctx.ellipse(e.x+side*(e.boss?12:5),e.y-3,2.2,3.3,0,0,TAU);ctx.fill();
    }
  }
  for(const f of plan.flowers){
    if(f.near<.09)continue;
    const opacity=.20+f.near*.8;
    bloom(ctx,f.x,f.y,16+f.near*22,f.color,opacity);
    ctx.globalAlpha=opacity;ctx.fillStyle=f.color;
    for(let j=0;j<5;j++){
      const a=j*TAU/5,rad=5+f.near*4;
      ctx.beginPath();ctx.ellipse(f.x+Math.cos(a)*rad,f.y+Math.sin(a)*rad,3,6,a,0,TAU);ctx.fill();
    }
    ctx.beginPath();ctx.arc(f.x,f.y,3,0,TAU);ctx.fill();ctx.globalAlpha=1;
  }
  // Mycelial filaments illuminate the REAL solid ledges as Michi passes.
  for(const q of plan.pathlights){
    const light=.17+q.near*.78;
    const wave=reduced?0:Math.sin(t*.027+q.id*1.31)*2.2;
    ctx.globalAlpha=light;ctx.strokeStyle=q.color;ctx.lineWidth=1.4+q.near*1.35;
    ctx.beginPath();ctx.moveTo(q.x-17,q.y+2);
    ctx.bezierCurveTo(q.x-11,q.y-4-wave,q.x+5,q.y+4+wave,q.x+17,q.y+2);
    ctx.stroke();
    if(q.near>.09){
      bloom(ctx,q.x,q.y,10+q.near*21,q.color,q.near*.48);
      ctx.fillStyle='#dcfff3';ctx.beginPath();ctx.arc(q.x,q.y-2,1.2+q.near,0,TAU);ctx.fill();
    }
  }
  ctx.globalAlpha=1;
  // The hero leaves a wake of floating motes and flowers ignite near them.
  for(let i=0;i<MICHI_LIGHT_LIMIT.fireflies;i++){
    const sx=plan.hero.x+Math.sin(i*2.4)*plan.hero.radius*.55;
    const sy=plan.hero.y+Math.cos(i*3.7)*plan.hero.radius*.43;
    const drift=reduced?0:Math.sin(t*.018+i*2.8)*12;
    drawFirefly(ctx,sx+drift,sy+drift*.4,t,i,reduced);
  }
  // Counterbalance bright face sprites with a readable, local additive halo.
  bloom(ctx,plan.hero.x,plan.hero.y,plan.hero.radius*.46,plan.hero.color,.55);
  ctx.restore();return true;
}
