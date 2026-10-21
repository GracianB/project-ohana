// SANTUARIO LUNAR — Michicornio's dedicated procedural stage backdrop.
// 100% vector Canvas pipeline: zero external image assets, zero layout thrash.
// Atmospheric parallax: deep caverns with skyward openings, glowing crescent moon,
// rose quartz stalactites, astral mist, starlight wisps and the Moon Sanctuary.
const TAU=Math.PI*2;
const wrap=(v,w)=>((v%w)+w)%w;
const visible=(x,w,pad=260)=>x>=-pad&&x<=w+pad;

function crystalCluster(ctx,x,y,scale,t,col,accent,reduced){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 const bob=reduced?0:Math.sin(t*0.05+x*0.02)*4;
 ctx.translate(0,bob);
 // Main crystal shard
 ctx.fillStyle=col;ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5;
 ctx.beginPath();ctx.moveTo(0,-45);ctx.lineTo(14,-15);ctx.lineTo(10,25);ctx.lineTo(-10,25);ctx.lineTo(-14,-15);ctx.closePath();
 ctx.fill();ctx.stroke();
 // Secondary crystal
 ctx.fillStyle=accent;
 ctx.beginPath();ctx.moveTo(18,-25);ctx.lineTo(28,-5);ctx.lineTo(22,25);ctx.lineTo(12,25);ctx.closePath();
 ctx.fill();ctx.stroke();
 // Left crystal
 ctx.beginPath();ctx.moveTo(-18,-30);ctx.lineTo(-8,-10);ctx.lineTo(-12,25);ctx.lineTo(-24,25);ctx.closePath();
 ctx.fill();ctx.stroke();
 // Inner glow
 if(!reduced){
  ctx.fillStyle='rgba(255,255,255,0.45)';
  ctx.beginPath();ctx.arc(0,-10,8+Math.sin(t*0.1+x)*2,0,TAU);ctx.fill();
 }
 ctx.restore();
}

function stalactite(ctx,x,y,w,h,col){
 ctx.fillStyle=col;ctx.beginPath();
 ctx.moveTo(x-w/2,y);ctx.lineTo(x,y+h);ctx.lineTo(x+w/2,y);
 ctx.closePath();ctx.fill();
}

function moonTemple(ctx,x,y,t,reduced,tier=1){
 ctx.save();ctx.translate(x,y);
 // Shrine base arches
 ctx.fillStyle='#27153a';ctx.strokeStyle='#d6a8ff';ctx.lineWidth=3;
 ctx.beginPath();
 ctx.moveTo(-115,0);ctx.lineTo(-80,-150);ctx.lineTo(80,-150);ctx.lineTo(115,0);
 ctx.closePath();ctx.fill();ctx.stroke();
 // Central moon archway
 ctx.fillStyle='#120820';ctx.beginPath();
 ctx.arc(0,-65,48,Math.PI,0);ctx.lineTo(48,0);ctx.lineTo(-48,0);ctx.closePath();
 ctx.fill();ctx.strokeStyle='#ffb6e4';ctx.lineWidth=2;ctx.stroke();
 // Floating dream crystal
 crystalCluster(ctx,0,-185,1.2,t,'#e6b8ff','#ffcce8',reduced);
 // Crescent crest
 ctx.strokeStyle='#fff0b8';ctx.lineWidth=3.5;ctx.beginPath();
 ctx.arc(0,-255,30,Math.PI*0.3,Math.PI*1.7);
 ctx.quadraticCurveTo(-10,-255,0,-255+30*Math.sin(Math.PI*0.3));
 ctx.stroke();
 // Aura rings
 if(!reduced){
  const pulse=Math.sin(t*0.07)*5;
  ctx.strokeStyle='rgba(255,200,240,0.6)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(0,-255,42+pulse,0,TAU);ctx.stroke();
 }
 ctx.restore();
}

export function drawMichiGardens(ctx,cam,t=0,viewportW=1400,viewportH=700,options={}){
 const reduced=options.reducedMotion||false;
 const tier=options.tier||1;
 const camX=cam.x||0,camY=cam.y||0;
 const w=viewportW,h=viewportH;

 // 1. Deep astral night sky
 const sky=ctx.createLinearGradient(0,0,0,h);
 sky.addColorStop(0,'#0a0515');
 sky.addColorStop(0.5,'#180c29');
 sky.addColorStop(0.85,'#26123a');
 sky.addColorStop(1,'#381a4e');
 ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);

 // 2. Twinkling distant stars
 for(let i=0;i<45;i++){
  const sx=(i*137)%w,sy=(i*73)%(h*0.65);
  const blink=reduced?1:0.3+0.7*Math.abs(Math.sin(t*0.08+i*1.7));
  ctx.fillStyle=`rgba(255,230,250,${blink*0.85})`;
  ctx.beginPath();ctx.arc(sx,sy,i%4===0?2:1.2,0,TAU);ctx.fill();
 }

 // 3. Giant Radiant Moon with craters & halo (parallax 0.05)
 const moonX=wrap(w*0.75-camX*0.05,w+400)-200;
 const moonY=h*0.28;
 ctx.save();
 // Iridescent outer halo
 ctx.fillStyle='rgba(240,210,255,0.12)';
 ctx.beginPath();ctx.arc(moonX,moonY,125,0,TAU);ctx.fill();
 ctx.fillStyle='rgba(255,230,250,0.2)';
 ctx.beginPath();ctx.arc(moonX,moonY,95,0,TAU);ctx.fill();
 // Moon sphere
 const moonGrad=ctx.createRadialGradient(moonX-20,moonY-20,15,moonX,moonY,72);
 moonGrad.addColorStop(0,'#fffbee');
 moonGrad.addColorStop(0.65,'#fed9f0');
 moonGrad.addColorStop(1,'#d29aff');
 ctx.fillStyle=moonGrad;ctx.beginPath();ctx.arc(moonX,moonY,70,0,TAU);ctx.fill();
 // Soft pastel craters
 ctx.fillStyle='rgba(180,120,220,0.18)';
 ctx.beginPath();ctx.arc(moonX-24,moonY-14,14,0,TAU);ctx.fill();
 ctx.beginPath();ctx.arc(moonX+18,moonY+16,18,0,TAU);ctx.fill();
 ctx.beginPath();ctx.arc(moonX-8,moonY+28,10,0,TAU);ctx.fill();
 ctx.restore();

 // 4. Far cavern roof with quartz stalactites (parallax 0.12)
 for(let i=-1;i<=Math.ceil(w/240)+1;i++){
  const sx=i*240-wrap(camX*0.12,240)+80;
  if(visible(sx,w,100)){
   stalactite(ctx,sx,0,60,110+Math.sin(i*2.1)*35,'#1c0c2a');
   crystalCluster(ctx,sx,105,0.7,t,'#e0a8ff','#ffa5da',reduced);
  }
 }

 // 5. Floating astral mist banks (parallax 0.28)
 const mistOffset=wrap(camX*0.28+(reduced?0:t*0.2),w+600);
 for(let i=-1;i<=2;i++){
  const mx=i*580-mistOffset+240,my=h*0.58+Math.sin(t*0.03+i)*15;
  if(visible(mx,w,250)){
   ctx.fillStyle='rgba(215,165,255,0.14)';
   ctx.beginPath();ctx.ellipse(mx,my,160,40,0,0,TAU);ctx.fill();
   ctx.fillStyle='rgba(255,185,230,0.08)';
   ctx.beginPath();ctx.ellipse(mx+30,my-15,110,30,0,0,TAU);ctx.fill();
  }
 }

 // 6. Midground Moon Sanctuary Tower (parallax 0.45)
 const templeWorldX=3550;
 const tx=templeWorldX-camX*0.45;
 if(visible(tx,w,200)){
  moonTemple(ctx,tx,h*0.78,t,reduced,tier);
 }

 // 7. Floating quartz crystal islands (parallax 0.35)
 for(let i=0;i<5;i++){
  const fx=wrap(i*720-camX*0.35+(reduced?0:Math.sin(t*0.04+i)*14),w+300)-150;
  const fy=h*0.42+Math.cos(t*0.05+i*2)*18;
  if(visible(fx,w,80)){
   ctx.fillStyle='#2c143d';ctx.strokeStyle='#d8a8ff';ctx.lineWidth=1.5;
   ctx.beginPath();
   ctx.moveTo(fx-40,fy);ctx.lineTo(fx-12,fy-20);ctx.lineTo(fx+30,fy-10);ctx.lineTo(fx+20,fy+18);ctx.lineTo(fx-25,fy+15);
   ctx.closePath();ctx.fill();ctx.stroke();
   crystalCluster(ctx,fx,fy-16,0.85,t,'#f2c8ff','#ffc2e8',reduced);
  }
 }
 // V458: four non-interactive moon constellations identify the four exploration sectors.
 // They're painted at half-depth and never pretend to be platforms.
 for(let sector=0;sector<4;sector++){
  const cx=430+sector*1050-camX*.42,cy=h*.3+(sector%2)*48;
  if(!visible(cx,w,180))continue;
  ctx.save();ctx.globalAlpha=.55;ctx.lineWidth=1.4;
  ctx.strokeStyle=sector===2?'#a1e2ed':'#f0c5ff';
  const points=[[0,0],[40,-25],[77,8],[113,-37],[144,-13]];
  ctx.beginPath();points.forEach(([dx,dy],i)=>i?ctx.lineTo(cx+dx,cy+dy):ctx.moveTo(cx+dx,cy+dy));ctx.stroke();
  for(let i=0;i<points.length;i++){const [dx,dy]=points[i],glimmer=reduced?0:Math.sin(t*.08+sector+i)*1.3;
   ctx.fillStyle=i===2?'#fff2b8':'#f9e8ff';
   ctx.beginPath();ctx.arc(cx+dx,cy+dy,2.5+glimmer,0,TAU);ctx.fill();}
  ctx.restore();
 }
 // Responsive foreground petals convey wind/current without obscuring platforms.
 for(let j=0;j<14;j++){
  const px=wrap(j*283-camX*.62+(reduced?0:t*(.12+j%3*.06)),w+100)-45;
  const py=wrap(j*97+(reduced?0:t*.13),h*.85);
  if(!visible(px,w,12))continue;
  ctx.save();ctx.translate(px,py);ctx.rotate(reduced?0:t*.008+j);
  ctx.fillStyle=j%3?'rgba(222,183,255,.4)':'rgba(173,245,244,.4)';
  ctx.beginPath();ctx.ellipse(0,0,5,2,0,0,TAU);ctx.fill();ctx.restore();
 }

}
