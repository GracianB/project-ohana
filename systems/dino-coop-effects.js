// V378 · Dino's authenticated peer receives only bounded, inert artwork.
// Never serialize enemies, target references, callbacks, damage or hit sets.
const KINDS=new Set(["dinoColossus","dinoFossil","dinoFossilMark","dinoFossilBlast",
  "dinoSpit","dinoSplat","dinoWarning"]);
const SCALARS=["x","y","vx","vy","r","R","radius","rot","age","evo","warmup",
  "launchRadius","nextPulse","beat","delay","bounces"];
const finite=(x,max=20000)=>Number.isFinite(x)&&Math.abs(x)<=max;
const C=v=>typeof v==="string"&&/^#[0-9a-f]{6}$/i.test(v)?v:"#c8f04a";
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export function readDinoEffects(list){
  if(!Array.isArray(list)||list.length>12)return null;
  const out=[];
  for(const f of list){
    if(!f||!KINDS.has(f.kind)||!finite(f.x)||!finite(f.y)||
      !finite(f.life,280)||f.life<=0||
      !finite(f.max??f.life,280)||(f.max??f.life)<=0)return null;
    const v={kind:f.kind,x:f.x,y:f.y,life:f.life,max:f.max??f.life,color:C(f.color)};
    for(const key of SCALARS){
      if(f[key]===undefined)continue;
      if(!finite(f[key]))return null;
      v[key]=f[key];
    }
    if(["vx","vy"].some(k=>v[k]!==undefined&&Math.abs(v[k])>60))return null;
    for(const k of ["r","R","radius","launchRadius"]){
      if(v[k]!==undefined&&(v[k]<0||v[k]>1000))return null;
    }
    v.evo=clamp(Math.floor(Number(v.evo)||0),0,4);
    if(f.kind==="dinoSpit"){
      if(f.trail!=null&&(!Array.isArray(f.trail)||f.trail.length>7))return null;
      v.trail=(f.trail||[]).map(p=>({x:p.x,y:p.y}));
      if(v.trail.some(p=>!finite(p.x)||!finite(p.y)))return null;
    }
    out.push(v);
  }
  return out;
}
export function advanceDinoEffects(list,move=true){
  if(!Array.isArray(list))return [];
  for(const f of list){
    f.life=Math.max(0,f.life-1);
    if(f.warmup>0)f.warmup--;
    if(f.nextPulse>0)f.nextPulse--;
    if(move&&["dinoFossil","dinoSpit"].includes(f.kind)){
      f.x+=f.vx||0;f.y+=f.vy||0;
    }
    if(f.rot!==undefined)f.rot+=.06;
  }
  return list.filter(f=>f.life>0);
}
// Draw 2D signs in world coordinates; no hit testing, no damage, no spawns,
// no state mutations outside ctx. Reduced motion keeps every gameplay sign.
export function drawDinoPeerEffects(ctx,list,cam={},t=0,reduceMotion=false){
  if(!Array.isArray(list))return;
  const ox=cam.x||0,oy=cam.y||0,TAU=Math.PI*2;
  for(const f of list){
    if(!f||f.life<=0)continue;
    const x=f.x-ox,y=f.y-oy;
    ctx.save();
    ctx.lineCap="round";ctx.lineJoin="round";
    if(f.kind==="dinoColossus"){
      const r=clamp(f.launchRadius||172,20,1000);
      if(f.warmup>0){
        ctx.strokeStyle="#ffe6a2";ctx.lineWidth=3;
        ctx.globalAlpha=.48+.36*(1-f.warmup/18);
        ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
        ctx.setLineDash([]);
      }
      if(!reduceMotion){
        const pulse=clamp(1-(f.nextPulse||0)/34,0,1);
        ctx.globalAlpha=.28*(1-pulse);ctx.strokeStyle="#c8f04a";ctx.lineWidth=2;
        ctx.beginPath();ctx.ellipse(x,y+18,40+pulse*(70+f.evo*14),
          10+pulse*24,0,0,TAU);ctx.stroke();
      }
    }else if(f.kind==="dinoFossilMark"||f.kind==="dinoWarning"){
      const k=clamp(f.life/Math.max(1,f.max),0,1);
      ctx.globalAlpha=.35+.5*(1-k);ctx.strokeStyle="#ffe5a5";ctx.lineWidth=2;
      ctx.beginPath();ctx.ellipse(x,y,28+f.evo*4,6+f.evo,0,0,TAU);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x-7,y);ctx.lineTo(x+7,y);
      ctx.moveTo(x,y-7);ctx.lineTo(x,y+7);ctx.stroke();
    }else if(f.kind==="dinoFossil"){
      const r=clamp(f.r||12,4,35);
      ctx.translate(x,y);ctx.rotate(reduceMotion?0:f.rot||0);
      ctx.fillStyle="#8fa65c";ctx.strokeStyle="#dcfca5";ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.88,0);
      ctx.lineTo(0,r);ctx.lineTo(-r*.88,0);ctx.closePath();ctx.fill();ctx.stroke();
    }else if(f.kind==="dinoFossilBlast"||f.kind==="dinoSplat"){
      const k=1-clamp(f.life/Math.max(1,f.max),0,1);
      ctx.globalAlpha=(1-k)*.8;ctx.strokeStyle=f.color;ctx.lineWidth=3;
      const r=clamp((f.r||f.radius||32)*(0.5+k),3,120);
      ctx.beginPath();ctx.ellipse(x,y,r,r*.42,0,0,TAU);ctx.stroke();
    }else if(f.kind==="dinoSpit"){
      const r=clamp(f.radius||10,3,22);
      ctx.fillStyle="#c8f04a";ctx.strokeStyle="#3a794b";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.stroke();
      ctx.fillStyle="#fffbe6";ctx.beginPath();ctx.arc(x-r*.3,y-r*.25,r*.18,0,TAU);ctx.fill();
    }
    ctx.restore();
  }
}
