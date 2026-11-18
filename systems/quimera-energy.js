// Energy is shaped inside the authoritative damage footprint, never a solid slab.
const TAU=Math.PI*2;
const noise=(i,t)=>Math.sin(i*127.1+t*31.7)*.65+Math.sin(i*53.3-t*17.9)*.35;
export function drawQuimeraEnergy(c,s,box,cam,active,reduce){
 const x=s.x-(cam.x||0),left=box.x-(cam.x||0),top=box.y-(cam.y||0),w=box.w,h=box.h,r=w/2,age=reduce?17:(s.age||0),col=s.col||'#a4e2df';
 const path=(fill,fn)=>{c.fillStyle=fill;c.beginPath();fn();c.closePath();c.fill();};
 const stroke=(color,width,alpha,fn)=>{c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.beginPath();fn();c.stroke();};
 const dot=(xx,yy,rx,ry,color)=>path(color,()=>c.ellipse(xx,yy,rx,ry,0,0,TAU));
 c.save();c.lineCap='round';c.lineJoin='round';
 if(!active){
  // Broken perimeter sparks communicate the whole lane without framing a box.
  c.globalAlpha=.45;c.fillStyle=col;
  if(s.k==='beam')for(let i=0;i<18;i++){const xx=left+(i+.5)*w/18;dot(xx,top+3,1,1.2,col);dot(xx,top+h-3,1,1.2,col);}
  else{
   for(let i=0;i<9;i++){const yy=top+h*(i+.5)/9;dot(left+3,yy,1,2,col);dot(left+w-3,yy,1,2,col);}
   stroke(col,2,.8,()=>c.ellipse(x,top+h-4,r-2,5,0,0,TAU));
   stroke(col,1,.45,()=>{c.moveTo(x-8,top+h-17);c.lineTo(x,top+h-25);c.lineTo(x+8,top+h-17);});
  }
  c.restore();return;
 }
 // Discontinuous edge dust makes the collision width legible without a panel.
 c.globalAlpha=.32;
 if(s.k!=='beam')for(let i=0;i<18;i++){const yy=top+((age*7+i*h/18)%h);dot(left+2,yy,1,1.5,col);dot(left+w-2,yy,1,1.5,col);}
 if(s.k==='bolt'){
  const count=Math.max(16,Math.ceil(h/29)),phase=Math.floor(age/3),points=[];
  for(let i=0;i<=count;i++)points.push([x+noise(i,phase)*r*.67,top+h*i/count]);
  const trace=()=>points.forEach(([xx,yy],i)=>i?c.lineTo(xx,yy):c.moveTo(xx,yy));
  stroke(col,15,.1,trace);stroke(col,7,.4,trace);stroke('#edfff4',2.6,1,trace);
  for(let j=2;j<count-1;j+=3){const [xx,yy]=points[j],side=j%2?1:-1;stroke(col,1.5,.8,()=>{c.moveTo(xx,yy);c.lineTo(x+side*r*.82,yy+14);c.lineTo(x+side*r*.6,yy+32);c.lineTo(x+side*r*.95,yy+46);});}
  c.globalAlpha=.8;for(let i=0;i<10;i++){const yy=top+h-((age*11+i*83)%h);dot(x+noise(i,phase)*r*.75,yy,1.4,3.8,'#e6fff2');}
  const base=top+h;stroke(col,3,.75,()=>{c.moveTo(left,base-2);c.quadraticCurveTo(x,base-16,left+w,base-2);});
 }else if(s.k==='geyser'){
  // Three tapering liquid tongues leave real air between their silhouettes.
  for(let tongue=0;tongue<3;tongue++){
   const cx=x+(tongue-1)*r*.44,tip=top+8+tongue*15+Math.sin(age*.12+tongue)*6;
   const g=c.createLinearGradient(0,top+h,0,top);g.addColorStop(0,col);g.addColorStop(.5,'#f7e9bba0');g.addColorStop(1,'#fff3d315');
   c.globalAlpha=.9;
   path(g,()=>{c.moveTo(cx-r*.28,top+h);c.bezierCurveTo(cx-r*.55,top+h*.7,cx+r*.5,top+h*.35,cx,tip);c.bezierCurveTo(cx+r*.63,top+h*.3,cx-r*.04,top+h*.65,cx+r*.28,top+h);});
   stroke('#fff1c6',1.5,.7,()=>{c.moveTo(cx,top+h);c.bezierCurveTo(cx-r*.12,top+h*.65,cx+r*.25,top+h*.4,cx,tip+20);});
  }
  c.globalAlpha=.85;for(let i=0;i<16;i++){const yy=top+h-((age*8+i*41)%h),xx=x+noise(i,age*.02)*r*.8;dot(xx,yy,1.5+i%3,2.5+i%4,'#fff3d0');}
  stroke(col,2,.6,()=>c.ellipse(x,top+h-5,r*.92,5,0,Math.PI,TAU));
 }else{
  // A turbulent horizontal stream: interleaving crests with transparent valleys.
  const cy=top+h/2,step=24,count=Math.ceil(w/step);
  for(let ribbon=0;ribbon<3;ribbon++){
   const yAt=i=>cy+(Math.sin(i*.71-age*.19+ribbon*1.9)*.8+noise(i*.31,age*.035+ribbon)*.2)*h*.23+(ribbon-1)*h*.12;
   const g=c.createLinearGradient(0,top,0,top+h);g.addColorStop(0,col);g.addColorStop(.5,'#ebfff0');g.addColorStop(1,col);c.globalAlpha=ribbon===1?.75:.28;
   path(g,()=>{for(let i=0;i<=count;i++){const xx=left+w*i/count,yy=yAt(i);i?c.lineTo(xx,yy):c.moveTo(xx,yy);}for(let i=count;i>=0;i--)c.lineTo(left+w*i/count,yAt(i)+4+ribbon);});
  }
  for(let i=0;i<Math.min(28,Math.ceil(w/160));i++){
   const xx=left+((age*13+i*163)%w),yy=cy+Math.sin(i*2+age*.08)*h*.15;
   stroke(col,2,.35,()=>c.ellipse(xx,yy,7+i%4,4,Math.sin(age*.06+i),-.6,Math.PI*1.3));
  }
  c.globalAlpha=.75;for(let i=0;i<32;i++){const xx=left+((age*21+i*149)%w),yy=cy+noise(i,age*.025)*h*.4;dot(xx,yy,2+i%3,1,'#e5fff0');}
  // Light touches the exact upper/lower limits in short, separated foam crests.
  for(let i=0;i<Math.min(36,Math.ceil(w/70));i++){const xx=left+((i*71+age*5)%w);stroke(col,1,.42,()=>{c.moveTo(xx,top+2);c.quadraticCurveTo(xx+7,top+6,xx+13,top+2);c.moveTo(xx+25,top+h-2);c.quadraticCurveTo(xx+30,top+h-6,xx+37,top+h-2);});}
 }
 c.restore();
}
