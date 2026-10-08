// V90 · Readable, deterministic dinosaur attack cues. Pure Canvas, zero damage.
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
export function dinoImpactPhase(life,max){
 const k=clamp(1-(Number(life)||0)/Math.max(1,Number(max)||1),0,1);
 return Object.freeze({k,radius:20+k*20,opacity:.3+.6*k});
}
export function drawDinoFossilForecast(ctx,f,cam,t,reduce=false){
 const q=dinoImpactPhase(f.life,f.max),x=f.x-(cam?.x||0),y=f.y-(cam?.y||0),R=q.radius;
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=q.opacity;
 ctx.strokeStyle="#eaffad";ctx.lineWidth=2.8;
 ctx.beginPath();ctx.ellipse(0,0,R,R*.26,0,0,TAU);ctx.stroke();
 for(let i=0;i<4;i++){
  const a=i*TAU/4;ctx.beginPath();
  ctx.moveTo(Math.cos(a)*R,Math.sin(a)*R*.26);
  ctx.lineTo(Math.cos(a)*(R+10),Math.sin(a)*(R+10)*.26);ctx.stroke();
 }
 ctx.strokeStyle="#ffdc91";ctx.lineWidth=2;ctx.beginPath();
 ctx.moveTo(-12,-17);ctx.lineTo(-6,-10);ctx.lineTo(0,-18);
 ctx.lineTo(7,-10);ctx.lineTo(13,-17);ctx.stroke();
 if(!reduce){ctx.globalAlpha=.18+.12*Math.sin(t*.09);
  ctx.fillStyle="#d8ff9b";ctx.beginPath();ctx.ellipse(0,0,R*.9,R*.19,0,0,TAU);ctx.fill();}
 ctx.restore();
}
export function drawDinoRollingShell(ctx,p,cam,t,reduce=false){
 const x=p.x+p.w*.5-(cam?.x||0),y=p.y+p.h*.5-(cam?.y||0);
 const R=Math.max(p.w,p.h)*.72,rot=reduce?0:t*.17;
 ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.lineWidth=2.3;
 ctx.fillStyle="rgba(53,83,48,.32)";ctx.strokeStyle="#e5ffb7";
 ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.fill();ctx.stroke();
 for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*TAU/8);
  ctx.fillStyle=i%2?"#a4ee8a":"#e0f4a2";ctx.strokeStyle="#50734a";
  ctx.beginPath();ctx.moveTo(R-5,-8);ctx.quadraticCurveTo(R+15,-3,R+16,0);
  ctx.quadraticCurveTo(R+15,3,R-5,8);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
 }
 ctx.rotate(-rot);
 for(const side of [-1,1]){const ex=side*R*.25,ey=-R*.19;
  ctx.fillStyle="#fffbe8";ctx.beginPath();ctx.ellipse(ex,ey,7,9,0,0,TAU);ctx.fill();
  ctx.fillStyle="#31573b";ctx.beginPath();ctx.arc(ex+side*2,ey,3,0,TAU);ctx.fill();
 }
 ctx.strokeStyle="#3b603c";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,R*.2,R*.28,.1,Math.PI-.1);ctx.stroke();
 ctx.restore();
}
