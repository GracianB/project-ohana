// Project OHANA · Dino U (CORAZÓN DE COLOSO) readability layer: anticipation,
// ground telegraph and quake/impact rings. Flat strokes only, no gradients.
// State lives on the dinoColossus field (f.waves / f.rings) so no extra FX entities.
const TAU=Math.PI*2,cap=(v,a,b)=>Math.max(a,Math.min(b,v));
export const DINO_QUAKE_CHARGE=28;
export function dinoQuakeRange(evo){return 245+(Number(evo)||0)*46;}
export function noteDinoQuake(g,f,x,y,hits){
 f.waves=(f.waves||[]).filter(w=>w.t<30);f.waves.push({x,y,t:0});
 f.rings=(f.rings||[]).filter(r=>r.t<22);
 for(const e of hits.slice(0,6))f.rings.push({e,t:0});
 if(hits.length)g.hitstop=Math.min(6,Math.max(Number(g.hitstop)||0,3));
}
export function tickDinoQuake(f){for(const w of f.waves||[])w.t++;for(const r of f.rings||[])r.t++;}
export function drawDinoQuake(ctx,f,cam,t,p){
 const ox=cam?.x||0,oy=cam?.y||0,x=f.x-ox,y=f.y-oy,ev=f.evo||0;
 const elapsed=f.max-f.life,fade=cap(f.life/24,0,1),range=dinoQuakeRange(ev);
 const gy=(p?p.y+p.h:f.y+40)-oy;
 ctx.save();
 if(elapsed<DINO_QUAKE_CHARGE){
  const k=elapsed/DINO_QUAKE_CHARGE,s=1+ev*.12,rr=160*s*(1-k)*(1-k)+20*s;
  ctx.globalAlpha=.85;ctx.strokeStyle="#eaffb5";ctx.lineWidth=4+ev;
  ctx.beginPath();ctx.arc(x,y,rr,0,TAU);ctx.stroke();
  const n=Math.min(14,6+ev*2);
  for(let i=0;i<n;i++){const a=i*TAU/n-t*.04,d=rr*1.2,z=6+ev;
   ctx.fillStyle=i%2?"#ffe08a":"#9fea9b";ctx.fillRect(x+Math.cos(a)*d-z/2,y+Math.sin(a)*d-z/2,z,z);}
  ctx.globalAlpha=.9;ctx.textAlign="center";ctx.lineWidth=5;
  ctx.font=`900 ${Math.round(20+ev*3)}px Outfit,system-ui,sans-serif`;
  ctx.strokeStyle="#2b3a1c";ctx.fillStyle="#ffe08a";
  ctx.strokeText("¡TERREMOTO!",x,y-96);ctx.fillText("¡TERREMOTO!",x,y-96);
 }
 const pk=elapsed<DINO_QUAKE_CHARGE?elapsed/DINO_QUAKE_CHARGE:1-cap(f.nextPulse/34,0,1);
 // The pulse checks Euclidean distance from (f.x,f.y); its tell must
 // use that same centre and radius, not only an oblate ground ellipse.
 ctx.setLineDash([12,8]);ctx.globalAlpha=(.35+.38*pk)*fade;ctx.strokeStyle="#ffcf6a";ctx.lineWidth=2.5;
 ctx.beginPath();ctx.arc(x,y,range,0,TAU);ctx.stroke();ctx.setLineDash([]);
 ctx.globalAlpha=(.16+.2*pk)*fade;
 ctx.beginPath();ctx.ellipse(x,gy,range,range*.2,0,0,TAU);ctx.stroke();
 ctx.globalAlpha=.14*pk*fade;ctx.fillStyle="#c6fa87";
 ctx.beginPath();ctx.ellipse(x,gy,range*pk,range*.2*pk,0,0,TAU);ctx.fill();
 for(const w of f.waves||[]){const k=w.t/30;if(k>=1)continue;const wx=w.x-ox,wy=w.y-oy;
  ctx.globalAlpha=(1-k)*.8;ctx.strokeStyle="#d9ffad";ctx.lineWidth=7*(1-k)+2;
  ctx.beginPath();ctx.ellipse(wx,wy,range*(.15+k*.9),range*.2*(.15+k*.9),0,0,TAU);ctx.stroke();
  ctx.fillStyle="#8a6a3a";
  for(let i=-3;i<=3;i++){const xx=wx+i*range*.28*(.4+k),h=(10+ev*3)*(1-k)*(1+(i&1));
   ctx.beginPath();ctx.moveTo(xx-7,wy);ctx.lineTo(xx,wy-h);ctx.lineTo(xx+7,wy);ctx.closePath();ctx.fill();}
 }
 for(const r of f.rings||[]){const k=r.t/22,e=r.e;if(k>=1||!e)continue;
  const ex=e.x+e.w/2-ox,ey=e.y+e.h-oy;
  ctx.globalAlpha=(1-k)*.9;ctx.strokeStyle="#ffe08a";ctx.lineWidth=4*(1-k)+1;
  ctx.beginPath();ctx.ellipse(ex,ey,12+k*(30+ev*5),5+k*12,0,0,TAU);ctx.stroke();}
 ctx.restore();
}
