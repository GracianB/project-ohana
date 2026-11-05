import {drawThunderSeal,thunderBolt} from './chispa-stagecraft.js';
const TAU=Math.PI*2;
const unit=x=>Math.max(0,Math.min(1,Number(x)||0));
function oval(ctx,x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();}
export function drawChispaCloud(ctx,x,y,scale=1,charge=0,t=0,reduced=false){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 const time = reduced ? 0 : t;
 const pulse = Math.sin(time * 0.12);
 const flash = (!reduced && Math.sin(time * 0.25) > 0.6) ? 0.9 : 0.35;

 // Turbulent layered electric thunderhead
 ctx.save();
 ctx.shadowColor = "#38f0ff";
 ctx.shadowBlur = reduced ? 0 : 16;
 
 // Base storm cloud lobes
 ctx.fillStyle = "#1e163b";
 ctx.strokeStyle = "#38f0ff";
 ctx.lineWidth = 2.2;
 ctx.beginPath();
 ctx.arc(-24, 2, 22, 0, TAU);
 ctx.arc(0, -10, 26, 0, TAU);
 ctx.arc(24, 2, 22, 0, TAU);
 ctx.arc(10, 12, 18, 0, TAU);
 ctx.arc(-10, 12, 18, 0, TAU);
 ctx.fill();
 ctx.stroke();

 // Internal electric storm illumination
 ctx.fillStyle = `rgba(100, 230, 255, ${flash})`;
 ctx.beginPath();
 ctx.arc(0, -6, 17, 0, TAU);
 ctx.fill();

 ctx.fillStyle = `rgba(255, 238, 90, ${flash * 0.8})`;
 ctx.beginPath();
 ctx.arc(2, -4, 9, 0, TAU);
 ctx.fill();

 // Orbiting electric energy ring
 const turn = reduced ? 0 : time * 0.04;
 ctx.strokeStyle = "#ffe847";
 ctx.lineWidth = 1.6;
 ctx.beginPath();
 ctx.ellipse(0, 4, 46, 18, turn * 0.5, 0, TAU);
 ctx.stroke();

 // Plasma spark conductors along the perimeter
 for (let i = 0; i < 4; i++) {
  const a = i * TAU / 4 + turn;
  const sx = Math.cos(a) * 44, sy = 4 + Math.sin(a) * 17;
  ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#fff176";
  ctx.beginPath();
  ctx.arc(sx, sy, 2.5 + (i % 2), 0, TAU);
  ctx.fill();
 }

 // Central high-voltage lightning crest
 ctx.strokeStyle = "#ffffff";
 ctx.lineWidth = 2.4;
 ctx.lineCap = "round";
 ctx.lineJoin = "round";
 ctx.beginPath();
 ctx.moveTo(6, -22);
 ctx.lineTo(-8, -2);
 ctx.lineTo(4, -3);
 ctx.lineTo(-6, 20);
 ctx.lineTo(11, -5);
 ctx.lineTo(0, -4);
 ctx.closePath();
 ctx.fillStyle = "#ffe742";
 ctx.fill();
 ctx.stroke();

 ctx.restore();
 ctx.restore();
}
function lightning(ctx,x1,y1,x2,y2,width,t,reduced){
 const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,n=10;
 const points=[[x1,y1]];
 for(let i=1;i<n;i++){
  const k=i/n;
  const off=(reduced?Math.sin(i*2.4):Math.sin(i*2.8+Math.floor(t/2)*1.4))*Math.min(22,len*0.09)*Math.sin(k*Math.PI);
  points.push([x1+dx*k-dy/len*off,y1+dy*k+dx/len*off]);
 }
 points.push([x2,y2]);

 // Layer 1: Electric cyan outer glow
 ctx.save();
 ctx.lineCap = "round";
 ctx.lineJoin = "round";
 ctx.strokeStyle = "#00e5ff";
 ctx.lineWidth = width + 7;
 ctx.globalAlpha = (ctx.globalAlpha || 1) * 0.38;
 ctx.beginPath();
 points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
 ctx.stroke();

 // Layer 2: Radiant thunder gold
 ctx.strokeStyle = "#ffe742";
 ctx.lineWidth = width + 2.5;
 ctx.globalAlpha = 0.85;
 ctx.beginPath();
 points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
 ctx.stroke();

 // Layer 3: Blinding pure white core
 ctx.strokeStyle = "#ffffff";
 ctx.lineWidth = Math.max(1.4, width * 0.35);
 ctx.globalAlpha = 1.0;
 ctx.beginPath();
 points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
 ctx.stroke();

 // Fork branches
 if (!reduced && len > 50) {
  for (let b = 2; b < n - 2; b += 3) {
   const [bx, by] = points[b];
   const side = b % 2 === 0 ? 1 : -1;
   const fLen = 14 + (b % 3) * 6;
   ctx.strokeStyle = "#8beeff";
   ctx.lineWidth = Math.max(1, width * 0.3);
   ctx.beginPath();
   ctx.moveTo(bx, by);
   ctx.lineTo(bx + side * fLen * 0.7 - dy / len * 4, by + fLen * 0.5 + dx / len * 4);
   ctx.stroke();
  }
 }
 ctx.restore();
}
export function drawChispaStorm(ctx,f,cam,t,reduced=false){
 ctx.save();
 try{
  ctx.lineCap='round';ctx.lineJoin='round';
  const x=f.x-cam.x,y=f.y-cam.y,fade=Math.min(1,f.life/20),charge=unit((20-f.next)/20);
  ctx.globalAlpha*=fade;
  for(const p of f.forecasts || (f.forecast?[f.forecast]:[])){
   const px=p.x-cam.x,py=p.y2-cam.y;
   ctx.save();ctx.globalAlpha*=.28+charge*.25;ctx.strokeStyle='#f4d992';ctx.lineWidth=2;ctx.setLineDash([4,7]);
   ctx.beginPath();ctx.moveTo(px,p.y1-cam.y);ctx.lineTo(px,py);ctx.stroke();ctx.setLineDash([]);
   ctx.beginPath();ctx.ellipse(px,py,25,5,0,0,TAU);ctx.stroke();ctx.restore();
  }
  for(const b of f.bolts||[]){
   const k=unit(b.life/10),bx=b.x-cam.x,by=b.y2-cam.y;
   ctx.save();ctx.globalAlpha*=k;
   const y1=b.y1-cam.y;
   if(!reduced){
    ctx.save();ctx.globalAlpha*=.5;
    lightning(ctx,bx-24,y1-6,bx,y1+(by-y1)*.48,2,t+7,false);
    lightning(ctx,bx+22,y1-3,bx,y1+(by-y1)*.62,2,t+13,false);
    ctx.restore();
   }
   lightning(ctx,bx,b.y1-cam.y,bx,by,3+k*5,t,reduced);
   ctx.strokeStyle='#fff3bd';ctx.lineWidth=2;
   ctx.beginPath();ctx.ellipse(bx,by,12+(1-k)*34,4+(1-k)*5,0,0,TAU);ctx.stroke();
   for(let i=0;i<(reduced?2:5);i++){
    const side=i%2?-1:1,dx=side*(12+i*6)*(1-k*.6),dy=-8-(1-k)*(10+i*6);
    oval(ctx,bx+dx,by+dy,2,3,'#e6d59d');
   }ctx.restore();
  }
  const arrival=unit((f.maxLife?(f.maxLife-f.life):30)/16),s=.55+arrival*.35;
  drawChispaCloud(ctx,x,y,s,charge,t,reduced);
  const tier=Math.max(0,Math.min(4,((f.maxLife||220)-180)/20));
  // Atmospheric currents gather around the real storm cloud, not a magic seal.
  ctx.strokeStyle='#e7fbff';ctx.lineWidth=1.6;ctx.globalAlpha*=.65;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-62-i*9,y+8+i*9);ctx.bezierCurveTo(x-30,y+32+i*8,x+30,y+25+i*8,x+65+i*8,y+4+i*7);ctx.stroke();}
  if(f.forecast&&!reduced){ctx.save();ctx.globalAlpha*=.28;thunderBolt(ctx,x,y,f.forecast.x-cam.x,f.forecast.y1-cam.y,.45,t,false);ctx.restore();}
  if(f.life<24){ctx.save();ctx.globalAlpha*=1-f.life/24;oval(ctx,x+36,y-25,5,3,'#f2edc7');oval(ctx,x+45,y-34,3,2,'#f2edc7');ctx.restore();}
 }finally{ctx.restore();}
}
export function drawChispaChain(ctx,f,cam,t=0,reduced=false){
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha*=unit(f.life/(f.max||30));
 for(let i=1;i<f.pts.length;i++){
  const a=f.pts[i-1],b=f.pts[i];lightning(ctx,a.x-cam.x,a.y-cam.y,b.x-cam.x,b.y-cam.y,3,t,reduced);
  drawThunderSeal(ctx,b.x-cam.x,b.y-cam.y,11,t,reduced,0);
 }ctx.restore();
}
export function drawChispaTrail(ctx,f,cam,t=0,reduced=false){
 ctx.save();const k=unit(f.life/42);ctx.globalAlpha*=k;ctx.lineCap='round';
 const dx=f.x2-f.x1,dy=f.y2-f.y1;
 for(let i=0;i<5;i++){
  const u=(i+.5)/5,x=f.x1+dx*u-cam.x,y=f.y1+dy*u-cam.y;
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));ctx.strokeStyle=i%2?'#e4ce87':'#d2f6ff';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-9,-4);ctx.lineTo(-2,1);ctx.lineTo(2,-2);ctx.lineTo(10,4);ctx.stroke();ctx.restore();
 }
 thunderBolt(ctx,f.x1-cam.x,f.y1-cam.y,f.x2-cam.x,f.y2-cam.y,.35,t,reduced);
 ctx.restore();
}
