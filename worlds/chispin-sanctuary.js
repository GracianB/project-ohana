// ISLAS DEL RELÁMPAGO — Chispín's dedicated procedural stage backdrop.
// 100% vector Canvas pipeline: zero external image assets, zero layout thrash.
// Atmospheric parallax: dark storm clouds, distant procedural lightning,
// humming Tesla pylons, electric arc conductors and the Dynamo Sanctuary.
const TAU=Math.PI*2;
const wrap=(v,w)=>((v%w)+w)%w;
const visible=(x,w,pad=260)=>x>=-pad&&x<=w+pad;

function bolt(ctx,x1,y1,x2,y2,seed,col,width=2){
 const n=5,dx=x2-x1,dy=y2-y1,d=Math.hypot(dx,dy)||1;
 const px=-dy/d,py=dx/d;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(x1,y1);
 for(let i=1;i<n;i++){
  const k=i/n,o=Math.sin(seed*12.7+i*73.1)*d*0.16;
  ctx.lineTo(x1+dx*k+px*o,y1+dy*k+py*o);
 }
 ctx.lineTo(x2,y2);
 ctx.strokeStyle=col;ctx.lineWidth=width;ctx.stroke();
 ctx.strokeStyle='#ffffff';ctx.lineWidth=width*0.4;ctx.stroke();
 ctx.restore();
}

function pylon(ctx,x,y,h,t,reduced){
 ctx.save();ctx.translate(x,y);
 // Lattice mast
 ctx.strokeStyle='#4c3866';ctx.lineWidth=2.5;
 ctx.beginPath();
 ctx.moveTo(-18,0);ctx.lineTo(-6,-h);ctx.lineTo(6,-h);ctx.lineTo(18,0);
 ctx.stroke();
 // Cross struts
 for(let i=1;i<5;i++){
  const k=i/5,py=-h*k,w=18*(1-k*0.6);
  ctx.beginPath();ctx.moveTo(-w,py);ctx.lineTo(w,py);ctx.stroke();
 }
 // Top insulator & spark electrode
 ctx.fillStyle='#ffe45a';ctx.beginPath();ctx.arc(0,-h-8,7,0,TAU);ctx.fill();
 ctx.strokeStyle='#fff8c0';ctx.lineWidth=1.5;ctx.stroke();
 if(!reduced&&Math.sin(t*0.12+x)%1>0.6){
  ctx.strokeStyle='rgba(255,240,120,0.6)';ctx.lineWidth=1.5;
  for(let i=0;i<3;i++){
   const a=i*TAU/3+t*0.2;
   ctx.beginPath();ctx.moveTo(0,-h-8);ctx.lineTo(Math.cos(a)*18,-h-8+Math.sin(a)*18);ctx.stroke();
  }
 }
 ctx.restore();
}

function cloud(ctx,x,y,scale,t,col,glow){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 if(glow){
  ctx.fillStyle='rgba(255,230,100,0.18)';
  ctx.beginPath();ctx.ellipse(0,0,130,45,0,0,TAU);ctx.fill();
 }
 ctx.fillStyle=col;
 ctx.beginPath();
 ctx.arc(-60,0,44,0,TAU);
 ctx.arc(-15,-20,55,0,TAU);
 ctx.arc(40,-10,48,0,TAU);
 ctx.arc(80,5,38,0,TAU);
 ctx.closePath();ctx.fill();
 ctx.restore();
}

function sanctuaryTower(ctx,x,y,t,reduced,tier=1){
 ctx.save();ctx.translate(x,y);
 // Grand Dynamo Spire base
 ctx.fillStyle='#2b1f47';ctx.strokeStyle='#ffe45a';ctx.lineWidth=3;
 ctx.beginPath();
 ctx.moveTo(-110,0);ctx.lineTo(-75,-160);ctx.lineTo(75,-160);ctx.lineTo(110,0);
 ctx.closePath();ctx.fill();ctx.stroke();
 // Central copper transformer core
 ctx.fillStyle='#c8823b';ctx.fillRect(-45,-150,90,140);
 ctx.strokeStyle='#ffd36a';ctx.lineWidth=2;
 for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(-45,-140+i*20);ctx.lineTo(45,-140+i*20);ctx.stroke();}
 // Spire mast & massive lightning accumulator
 ctx.fillStyle='#1e1435';ctx.fillRect(-16,-320,32,160);
 ctx.strokeStyle='#ffe45a';ctx.lineWidth=2.5;ctx.strokeRect(-16,-320,32,160);
 // Golden spherical rod tip
 ctx.fillStyle='#ffe766';ctx.beginPath();ctx.arc(0,-340,24,0,TAU);ctx.fill();
 ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.stroke();
 // Active energy emission
 if(!reduced){
  const pulse=Math.sin(t*0.08)*6;
  ctx.strokeStyle='rgba(255,245,160,0.75)';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,-340,32+pulse,0,TAU);ctx.stroke();
  for(let i=0;i<4;i++){
   const a=i*Math.PI/2+(t*0.1);
   ctx.beginPath();ctx.moveTo(0,-340);ctx.lineTo(Math.cos(a)*55,-340+Math.sin(a)*55);ctx.stroke();
  }
 }
 ctx.restore();
}

export function drawChispinSanctuary(ctx,cam,t=0,viewportW=1400,viewportH=700,options={}){
 const reduced=options.reducedMotion||false;
 const tier=options.tier||1;
 const camX=cam.x||0,camY=cam.y||0;
 const w=viewportW,h=viewportH;

 // 1. Deep storm twilight gradient
 const sky=ctx.createLinearGradient(0,0,0,h);
 sky.addColorStop(0,'#120c24');
 sky.addColorStop(0.45,'#20153c');
 sky.addColorStop(0.85,'#2b1848');
 sky.addColorStop(1,'#3b2257');
 ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);

 // 2. Horizon distant storm flashes (deterministic cycle based on t)
 const flashCycle=((t*0.015)%1+1)%1;
 if(!reduced&&flashCycle>0.92){
  const flashAlpha=(flashCycle-0.92)/0.08*0.4;
  ctx.fillStyle=`rgba(255,240,160,${flashAlpha})`;
  ctx.fillRect(0,0,w,h*0.7);
  // Distant lightning branching
  const lx=wrap(camX*0.15+w*0.65,w);
  bolt(ctx,lx,20,lx+30,h*0.48,Math.floor(t*0.1),`rgba(255,248,200,${flashAlpha*2})`,3);
 }

 // 3. Far storm cumulonimbus clouds (parallax 0.08)
 const cloudOffset=wrap(camX*0.08+(reduced?0:t*0.25),w+500);
 for(let i=-1;i<=2;i++){
  const cx=i*520-cloudOffset+260;
  if(visible(cx,w,200)){
   cloud(ctx,cx,140,1.4,t,'#22163b',i%2===0);
  }
 }

 // 4. Distant high-voltage transmission pylons (parallax 0.22)
 const pylonStride=620;
 const pylonOffset=wrap(camX*0.22,pylonStride);
 for(let i=-1;i<=Math.ceil(w/pylonStride)+1;i++){
  const px=i*pylonStride-pylonOffset+180;
  if(visible(px,w,100)){
   pylon(ctx,px,h*0.72,130,t,reduced);
  }
 }

 // 5. Power lines connecting distant pylons
 ctx.strokeStyle='#583f7a';ctx.lineWidth=1.5;
 for(let i=-1;i<=Math.ceil(w/pylonStride)+1;i++){
  const x1=i*pylonStride-pylonOffset+180;
  const x2=x1+pylonStride;
  const yTop=h*0.72-130;
  ctx.beginPath();ctx.moveTo(x1,yTop);ctx.quadraticCurveTo((x1+x2)/2,yTop+35,x2,yTop);ctx.stroke();
 }

 // 6. Midground storm cliffs & Dynamo Sanctuary (parallax 0.45)
 const midOffset=camX*0.45;
 const sanctuaryWorldX=3550;
 const sx=sanctuaryWorldX-midOffset;
 if(visible(sx,w,200)){
  sanctuaryTower(ctx,sx,h*0.78,t,reduced,tier);
 }

 // 7. Floating electro-magnetic rocks (parallax 0.35)
 for(let i=0;i<6;i++){
  const mx=wrap(i*680-camX*0.35+(reduced?0:Math.sin(t*0.03+i)*12),w+300)-150;
  const my=h*0.38+Math.cos(t*0.04+i*1.8)*18;
  if(visible(mx,w,80)){
   ctx.fillStyle='#362752';ctx.strokeStyle='#ffe45a';ctx.lineWidth=1.5;
   ctx.beginPath();
   ctx.moveTo(mx-35,my);ctx.lineTo(mx-10,my-18);ctx.lineTo(mx+28,my-8);ctx.lineTo(mx+18,my+18);ctx.lineTo(mx-22,my+14);
   ctx.closePath();ctx.fill();ctx.stroke();
   // Electro-spark on rock
   if(!reduced&&Math.sin(t*0.1+i)>0.3){
    ctx.strokeStyle='#fff49e';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(mx,my-10);ctx.lineTo(mx+8,my-22);ctx.stroke();
   }
  }
 }
}
