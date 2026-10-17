const TAU=Math.PI*2;
const unit=x=>Math.max(0,Math.min(1,Number(x)||0));
function oval(ctx,x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();}
export function drawChispaCloud(ctx,x,y,scale=1,charge=0,t=0,reduced=false){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 // A suspended thunder seal: hard metallic conductors, no flame or cloud silhouette.
 ctx.strokeStyle='#e5cf86';ctx.lineWidth=3;
 ctx.beginPath();ctx.ellipse(0,0,43,16,0,0,TAU);ctx.stroke();
 ctx.beginPath();ctx.ellipse(0,0,24,32,0,0,TAU);ctx.stroke();
 ctx.strokeStyle='#adf0ff';ctx.lineWidth=2;
 const turn=reduced?0:t*.025;
 for(let i=0;i<4;i++){
  const a=i*TAU/4+turn,x=Math.cos(a)*42,y=Math.sin(a)*16;
  ctx.fillStyle='#fffefa';ctx.beginPath();ctx.moveTo(x,y-7);ctx.lineTo(x+4,y);ctx.lineTo(x,y+7);ctx.lineTo(x-4,y);ctx.closePath();ctx.fill();ctx.stroke();
 }
 ctx.beginPath();ctx.moveTo(5,-25);ctx.lineTo(-9,2);ctx.lineTo(5,-1);ctx.lineTo(-5,26);ctx.lineTo(13,-6);ctx.lineTo(0,-3);ctx.stroke();
 ctx.restore();
}
function lightning(ctx,x1,y1,x2,y2,width,t,reduced){
 const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,n=9;
 const points=[[x1,y1]];
 for(let i=1;i<n;i++){const k=i/n,off=(reduced?Math.sin(i*2.4):Math.sin(i*2.4+Math.floor(t/3)*1.3))*Math.min(16,len*.07)*Math.sin(k*Math.PI);points.push([x1+dx*k-dy/len*off,y1+dy*k+dx/len*off]);}
 points.push([x2,y2]);
 for(const [c,w] of [['#8bdff5',width+4],['#e2cc86',width+1],['#ffffff',Math.max(1,width*.35)]]){
  ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
 }
}
export function drawChispaStorm(ctx,f,cam,t,reduced=false){
 ctx.save();
 try{
  ctx.lineCap='round';ctx.lineJoin='round';
  const x=f.x-cam.x,y=f.y-cam.y,fade=Math.min(1,f.life/20),charge=unit((20-f.next)/20);
  ctx.globalAlpha*=fade;
  if(f.forecast){
   const p=f.forecast,px=p.x-cam.x,py=p.y2-cam.y;
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
  if(f.life<24){ctx.save();ctx.globalAlpha*=1-f.life/24;oval(ctx,x+36,y-25,5,3,'#f2edc7');oval(ctx,x+45,y-34,3,2,'#f2edc7');ctx.restore();}
 }finally{ctx.restore();}
}
export function drawChispaChain(ctx,f,cam,t=0,reduced=false){
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha*=unit(f.life/(f.max||30));
 for(let i=1;i<f.pts.length;i++){
  const a=f.pts[i-1],b=f.pts[i];lightning(ctx,a.x-cam.x,a.y-cam.y,b.x-cam.x,b.y-cam.y,3,t,reduced);
  oval(ctx,b.x-cam.x,b.y-cam.y,4,4,'#fff8dc');
 }ctx.restore();
}
export function drawChispaTrail(ctx,f,cam,t=0,reduced=false){
 ctx.save();const k=unit(f.life/42);ctx.globalAlpha*=k;ctx.lineCap='round';
 const dx=f.x2-f.x1,dy=f.y2-f.y1;
 for(let i=0;i<5;i++){
  const u=(i+.5)/5,x=f.x1+dx*u-cam.x,y=f.y1+dy*u-cam.y;
  ctx.fillStyle=i%2?'#f5df9f':'#b5ddcb';ctx.beginPath();ctx.ellipse(x,y,6+4*k,3,Math.atan2(dy,dx),0,TAU);ctx.fill();
 }ctx.strokeStyle='#fff2c6';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(f.x1-cam.x,f.y1-cam.y);ctx.lineTo(f.x2-cam.x,f.y2-cam.y);ctx.stroke();ctx.restore();
}
