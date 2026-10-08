// CUERNO V84 · Fantasy geometry and rendering, isolated from combat/physics.
import { drawCuernoHoofprints, drawCuernoEnchantClock, drawCuernoSevenHornCrest } from "./cuerno-v91-illusions.js";
import { cuernoSweptRibbonTouches } from "./cuerno-v92-resonance.js";
export { drawCuernoSevenHornCrest };
// Ribbon lasts ten seconds after gallop ends. No RNG, no assets, no timers.
export const CUERNO_FANTASY = Object.freeze({
  trailFrames:600, maxPoints:32, maxTrails:2, sampleEvery:2,
  width:24, markFrames:90, damageEvery:30, crownFrames:68,
});
export const CUERNO_IRIS_COLORS = Object.freeze([
  "#ffaed2","#ffd4a3","#fff1b7","#b8efce","#b8eafd","#c6ccff","#e9c6fa"
]);
const finite=n=>Number.isFinite(Number(n))?Number(n):0;
const bound=(n,min,max)=>Math.max(min,Math.min(max,finite(n)));
const TAU=Math.PI*2;

export function addCuernoRibbonPoint(points,x,y){
  const px=finite(x),py=finite(y);
  const next=Array.isArray(points)?points.slice(-CUERNO_FANTASY.maxPoints):[];
  const prev=next[next.length-1];
  if(prev&&Math.hypot(prev.x-px,prev.y-py)<7)return next;
  next.push({x:px,y:py});
  while(next.length>CUERNO_FANTASY.maxPoints)next.shift();
  return next;
}

// Soft capsule/rectangle overlap. Handles stationary, diagonal, and tiny
// one-point trails, without allocating geometry or mutating any enemy.
export function cuernoRibbonTouches(points,enemy,width=CUERNO_FANTASY.width){
  if(!Array.isArray(points)||!points.length||!enemy||
    ![enemy.x,enemy.y,enemy.w,enemy.h].every(v=>Number.isFinite(Number(v))))return false;
  const cx=finite(enemy.x)+Math.max(0,finite(enemy.w))*.5;
  const cy=finite(enemy.y)+Math.max(0,finite(enemy.h))*.5;
  const rx=Math.max(0,finite(enemy.w))*.5+bound(width,0,80)*.5;
  const ry=Math.max(0,finite(enemy.h))*.5+bound(width,0,80)*.5;
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[Math.min(i+1,points.length-1)];
    if(!a||!b)continue;
    const ax=finite(a.x),ay=finite(a.y),dx=finite(b.x)-ax,dy=finite(b.y)-ay;
    const u=bound(((cx-ax)*dx+(cy-ay)*dy)/(dx*dx+dy*dy||1),0,1);
    if(Math.abs(cx-(ax+dx*u))<=rx&&Math.abs(cy-(ay+dy*u))<=ry)return true;
  }
  return false;
}

export function cuernoPrismPhase(life,max=CUERNO_FANTASY.crownFrames){
  const duration=Math.max(1,finite(max));
  const k=bound(1-finite(life)/duration,0,1);
  const lift=1-Math.pow(1-bound(k/.28,0,1),3);
  const bloom=Math.sin(Math.PI*bound(k/.88,0,1)*.92);
  const fade=bound(finite(life)/15,0,1)*bound(k*11,0,1);
  return Object.freeze({k,lift,bloom,fade,radius:38+120*bloom});
}

function horn(ctx,x,y,angle,scale,color,opacity){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);
  ctx.globalAlpha=opacity;ctx.lineJoin="round";
  // Curved pearl cone, never a disconnected triangular spike.
  ctx.fillStyle="#fff9ea";ctx.strokeStyle=color;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-6,8);
  ctx.bezierCurveTo(-10,1,-1,-7,0,-28);
  ctx.bezierCurveTo(5,-14,13,0,7,8);
  ctx.quadraticCurveTo(0,12,-6,8);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle=color;ctx.lineWidth=1;ctx.globalAlpha=opacity*.8;
  for(let i=0;i<3;i++){
    const y=-15+i*6;
    ctx.beginPath();ctx.moveTo(-3.8+i*.6,y);
    ctx.quadraticCurveTo(2,y-3,5-i*.5,y-1);ctx.stroke();
  }
  ctx.restore();
}

export function drawCuernoFantasyRibbon(ctx,f,cam,t,reduce=false){
  const pts=Array.isArray(f?.points)?f.points:[];
  if(!pts.length)return;
  const alpha=bound(f.life/75,0,1)*.84;
  const ox=finite(cam?.x),oy=finite(cam?.y);
  ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
  for(let band=0;band<7;band++){
    ctx.globalAlpha=alpha*(.61+band*.045);
    ctx.strokeStyle=CUERNO_IRIS_COLORS[band];ctx.lineWidth=3.25;
    ctx.beginPath();
    for(let j=0;j<pts.length;j++){
      const p=pts[j],x=p.x-ox,y=p.y-oy+(band-3)*3.1;
      if(j===0)ctx.moveTo(x,y);
      else{
        const last=pts[j-1];
        const lx=last.x-ox,ly=last.y-oy+(band-3)*3.1;
        const mid=(x+lx)*.5;
        ctx.bezierCurveTo(mid,ly,mid,y,x,y);
      }
    }
    if(pts.length===1){const p=pts[0];ctx.arc(p.x-ox,p.y-oy+(band-3)*3.1,2,0,TAU);}
    ctx.stroke();
  }
  // Very few deliberate pearlescent glints; none animated when reduced.
  ctx.strokeStyle="#fffef0";ctx.lineWidth=1.2;
  for(let i=1;i<pts.length;i+=4){
    const p=pts[i],x=p.x-ox,y=p.y-oy-9;
    const twinkle=reduce?1:.65+.35*Math.sin(t*.07+i*.8);
    ctx.globalAlpha=alpha*.6*twinkle;
    ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);
    ctx.moveTo(x,y-3);ctx.lineTo(x,y+3);ctx.stroke();
  }
  drawCuernoHoofprints(ctx,pts,cam,f.life,reduce);
  ctx.restore();
}

export function drawCuernoPrismCrown(ctx,f,cam,t,reduce=false){
  if(!f||f.life<=0)return;
  const ph=cuernoPrismPhase(f.life,f.max);
  if(ph.fade<=0)return;
  const x=finite(f.x)-finite(cam?.x),y=finite(f.y)-finite(cam?.y);
  const scale=bound(.78+finite(f.evo)*.12,.78,1.26);
  const radius=ph.radius*scale;
  ctx.save();ctx.lineCap="round";
  // Three floating rainbow vaults, like a cathedral made of light.
  for(let arch=0;arch<3;arch++){
    const r=radius*(.55+arch*.20),lift=ph.lift*22;
    for(let band=0;band<7;band++){
      ctx.globalAlpha=ph.fade*(.17+arch*.055);
      ctx.strokeStyle=CUERNO_IRIS_COLORS[band];ctx.lineWidth=1.8;
      ctx.beginPath();
      ctx.moveTo(x-r,y+18+band*2);
      ctx.bezierCurveTo(x-r*.72,y-r-lift+band*2,x+r*.72,y-r-lift+band*2,x+r,y+18+band*2);
      ctx.stroke();
    }
  }
  // Seven mini-horns orbit a pearly central crown. An identity, not confetti.
  for(let i=0;i<7;i++){
    const a=i*TAU/7-Math.PI/2+(reduce?0:ph.k*.32);
    const xx=x+Math.cos(a)*radius*.64;
    const yy=y+Math.sin(a)*radius*.38-5*ph.lift;
    horn(ctx,xx,yy,a+Math.PI/2,.67+ph.lift*.24,
      CUERNO_IRIS_COLORS[i],ph.fade*.83);
  }
  ctx.globalAlpha=ph.fade*.55;
  ctx.strokeStyle="#fff7d6";ctx.lineWidth=2.3;
  ctx.beginPath();ctx.ellipse(x,y+15,radius*.55,radius*.18,0,0,TAU);ctx.stroke();
  ctx.restore();
}

export function drawCuernoFantasyStatus(ctx,enemies,cam,t,reduce=false){
  const now=finite(t),ox=finite(cam?.x),oy=finite(cam?.y);
  for(const e of enemies||[]){
    if(!e||!(finite(e._cuernoFantasyUntil)>now)||e.dying||!(finite(e.hp)>0))continue;
    const x=finite(e.x)+finite(e.w)*.5-ox,y=finite(e.y)-8-oy;
    ctx.save();ctx.globalAlpha=.72;
    const phase=reduce?0:now*.06;
    for(let i=0;i<3;i++){
      const a=i*TAU/3+phase;
      const xx=x+Math.cos(a)*11,yy=y+Math.sin(a)*5;
      ctx.strokeStyle=CUERNO_IRIS_COLORS[(i+2)%7];ctx.lineWidth=1.8;
      ctx.beginPath();ctx.moveTo(xx-3,yy);ctx.lineTo(xx+3,yy);
      ctx.moveTo(xx,yy-3);ctx.lineTo(xx,yy+3);ctx.stroke();
    }
    drawCuernoEnchantClock(ctx,e,cam,now,reduce);
    ctx.restore();
  }
}

export function startCuernoFantasyTrail(g,p,evo,activeFx,add,pw,cx){
 const living=activeFx.filter(f=>f.kind==="cuernoFantasyTrail"&&!f.dead);
 if(living.length>=CUERNO_FANTASY.maxTrails)living[0].dead=true;
 const trail=add({kind:"cuernoFantasyTrail",
  life:CUERNO_FANTASY.trailFrames,max:CUERNO_FANTASY.trailFrames,
  points:[{x:cx(p),y:p.y+p.h*.72}],evo,
  dmg:(2.8+evo*.75)*pw(p),born:Number(g.t)||0,face:p.facing||1});
 p._cuernoFantasyActiveTrail=trail;
 return trail;
}

export function updateCuernoFantasyTrail(g,f,p,galloping,canHit,cx,cy){
 if(f.dead)return false;
 if(galloping && p.id==="cuerno" && !p.dead && p._cuernoFantasyActiveTrail===f){
   f.life=CUERNO_FANTASY.trailFrames;
   if(f.age%CUERNO_FANTASY.sampleEvery===0)
     f.points=addCuernoRibbonPoint(f.points,cx(p),p.y+p.h*.72);
 }else f.life--;
 if(f.life<=0)return false;
 const now=Number(g.t)||0;
 for(const e of g.enemies||[]){
   if(!canHit(e)||!(cuernoRibbonTouches(f.points,e)||
     cuernoSweptRibbonTouches(f.points,e,{x:e._cuernoFantasyPrevX,y:e._cuernoFantasyPrevY})))continue;
   const first=!(Number(e._cuernoFantasyUntil)>now);
   e._cuernoFantasyUntil=now+CUERNO_FANTASY.markFrames;
   e._cuernoFantasyDamage=first?f.dmg:Math.max(Number(e._cuernoFantasyDamage)||0,f.dmg);
   if(first){
     e._cuernoFantasyNext=now+CUERNO_FANTASY.damageEvery;
     g.nums?.add?.(cx(e),e.y-10,"✦ FANTASÍA","#f0baff",false);
   }
 }
 return true;
}

export function tickCuernoFantasyStatus(game,p,canHit,damageEnemy){
 if(p.id!=="cuerno")return;
 const now=Number(game.t)||0;
 for(const enemy of game.enemies||[]){
   if(!enemy || !(Number(enemy._cuernoFantasyUntil)>now)||!canHit(enemy))continue;
   if(now<(Number(enemy._cuernoFantasyNext)||0))continue;
   enemy._cuernoFantasyNext=now+CUERNO_FANTASY.damageEvery;
   // True status damage, not a normal hit: no infinite score/combo or hitstop.
   const raw=Math.max(2,Number(enemy._cuernoFantasyDamage)||2);
   const damage=Math.max(1,Math.round(raw*(enemy.boss?.55:1)));
   damageEnemy(enemy,damage);
   enemy.flash=Math.max(enemy.flash||0,5);
 }
}

// V73: four ribbons dance behind Cuerno's four-hoof gallop, at most four curves.
// Pure visual feedback: the dash still obeys walls and never grants flight.
export function drawCuernoGallopRibbons(ctx,p,cam,t,remaining){
if(p?.id!=="cuerno"||!(remaining>0)||p.dead)return;
const evo=Math.max(0,Math.min(4,Number(p.evo)||0)),face=p.facing||1;
const x=p.x+p.w*.5-cam.x,y=p.y+p.h*.63-cam.y;
const palette=["#f5afd7","#ffdd9b","#b8e5f0","#c4b6fb"];
const alpha=Math.min(.53,remaining/15*.5);
ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.lineCap="round";
for(let i=0;i<4;i++){
const lag=(i+1)*(14+evo*3),wobble=Math.sin(t*.18+i*1.35)*3;
ctx.globalAlpha=alpha*(1-i*.14);ctx.strokeStyle=palette[i];ctx.lineWidth=2.5-i*.25;
ctx.beginPath();ctx.moveTo(-p.w*.46,(-2+i*5));
ctx.bezierCurveTo(-18-lag*.22,-15+i*5+wobble,-lag*.66,4+i*6,-lag,(-6+i*6)+wobble);
ctx.stroke();
}
ctx.restore();
}


