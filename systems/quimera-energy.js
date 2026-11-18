// Filled, turbulent volumes only: no guide edges, stroked paths or lane borders.
const TAU=Math.PI*2,noise=(i,t)=>Math.sin(i*127.1+t*31.7)*.65+Math.sin(i*53.3-t*17.9)*.35;
export function drawQuimeraEnergy(c,s,box,cam,active,reduce){
 const x=s.x-(cam.x||0),left=box.x-(cam.x||0),top=box.y-(cam.y||0),w=box.w,h=box.h,r=w/2,T=reduce?17:(s.age||0),col=s.col||'#b3cce5';
 const shape=(fill,fn)=>{c.fillStyle=fill;c.beginPath();fn();c.closePath();c.fill();};
 const puff=(xx,yy,rx,ry,color,alpha=1)=>{c.globalAlpha=alpha;const g=c.createRadialGradient(xx,yy,0,xx,yy,Math.max(rx,ry));g.addColorStop(0,color);g.addColorStop(1,'#c9d8ee00');shape(g,()=>c.ellipse(xx,yy,rx,ry,0,0,TAU));};
 c.save();
 if(!active){
  if(s.k==='beam'){for(let i=0;i<24;i++)puff(left+(i+.5)*w/24,top+h*.55+Math.sin(i+T*.03)*3,24,7,col,.28);}
  else{puff(x,top+h-5,r-1,7,col,.7);for(let i=0;i<4;i++)puff(x+noise(i,1)*r*.65,top+h-14-i*7,2,3,col,.4);}
  c.restore();return;
 }
 if(s.k==='bolt'){
  // Expanding electrical petals fuse into an irregular rupture, never a wire.
  const n=Math.max(14,Math.ceil(h/34)),phase=Math.floor(T/4),centres=[];
  for(let i=0;i<=n;i++)centres.push({x:x+noise(i,phase)*r*.52,y:top+h*i/n,width:4+Math.abs(noise(i+9,phase))*r*.24});
  const gas=c.createLinearGradient(left,0,left+w,0);gas.addColorStop(0,'#809cb700');gas.addColorStop(.35,col);gas.addColorStop(.55,'#e4e9df');gas.addColorStop(1,'#809cb700');
  c.globalAlpha=.72;shape(gas,()=>{centres.forEach((p,i)=>i?c.lineTo(p.x-p.width,p.y):c.moveTo(p.x-p.width,p.y));for(let i=centres.length-1;i>=0;i--)c.lineTo(centres[i].x+centres[i].width,centres[i].y);});
  for(let i=0;i<n;i++){
   const p=centres[i],side=i%2?1:-1;c.globalAlpha=.7;
   shape(i%3?'#d7e9e2':col,()=>{c.moveTo(p.x,p.y-10);c.bezierCurveTo(p.x+side*20,p.y-4,x+side*r*.95,p.y+13,p.x+side*5,p.y+28);c.quadraticCurveTo(p.x+side*7,p.y+8,p.x,p.y-10);});
  }
  for(let i=0;i<10;i++)puff(x+noise(i,T*.02)*r*.75,top+h-((T*13+i*83)%h),2.5,5,'#e8f3e4',.85);
  puff(x,top+h-3,r*.97,8,col,.7);
 }else if(s.k==='geyser'){
  for(let tongue=0;tongue<3;tongue++){
   const cx=x+(tongue-1)*r*.43,tip=top+10+tongue*16+Math.sin(T*.11+tongue)*8;
   const g=c.createLinearGradient(cx-r*.4,0,cx+r*.4,0);g.addColorStop(0,'#93735944');g.addColorStop(.4,col);g.addColorStop(.7,'#e8d9ba');g.addColorStop(1,'#b2977555');c.globalAlpha=.88;
   shape(g,()=>{c.moveTo(cx-r*.32,top+h);c.bezierCurveTo(cx-r*.65,top+h*.7,cx+r*.55,top+h*.3,cx,tip);c.bezierCurveTo(cx+r*.68,top+h*.25,cx-r*.1,top+h*.65,cx+r*.28,top+h);});
  }
  for(let i=0;i<19;i++)puff(x+noise(i,T*.02)*r*.8,top+h-((T*8+i*43)%h),2.5+i%3,4+i%4,'#eed9b9',.85);
  puff(x,top+h-3,r*.97,7,col,.65);
 }else{
  // Dense moving clouds and cinders give the sweep mass without parallel rails.
  const n=Math.min(100,Math.ceil(w/52));
  for(let i=0;i<n;i++){
   const xx=left+((T*15+(i+.5)*w/n)%w),yy=top+h*.5+noise(i,T*.026)*h*.22;
   puff(xx,yy,w/n*.73,8+Math.sin(i+T*.08)*3,col,.48);
   puff(xx+noise(i+7,T*.03)*13,yy,6+i%6,3,'#e6e5d2',.8);
  }
  for(let i=0;i<28;i++)puff(left+((T*22+i*173)%w),top+h*.5+noise(i,T*.03)*h*.38,2+i%2,1.5,'#e7e9d6',.8);
 }
 c.restore();
}
