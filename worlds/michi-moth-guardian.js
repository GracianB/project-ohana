const TAU=Math.PI*2;
const line=(c,color,w,fn)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();fn();c.stroke();};
const oval=(c,x,y,a,b,color,rotation=0)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,a,b,rotation,0,TAU);c.fill();};
export function drawMichiMothGuardian(c,e,cam,t,reduced,lantern){
 const b=e._astralCat,rest=b.phase==='rest',warn=b.phase==='warn',active=b.phase==='attack',time=reduced?0:t;
 c.save();c.translate(e.x+e.w/2-cam.x,e.y+e.h-cam.y);c.lineCap='round';
 const breath=Math.sin(time*.035)*2,open=rest?1.12:warn?.76:active?.91:.98;
 for(const side of[-1,1]){
  c.save();c.scale(side*open,1);c.rotate(Math.sin(time*.056)*.035);
  for(let lower=0;lower<2;lower++){
   const col=c.createLinearGradient(15,-167,108,-25);col.addColorStop(0,rest?'#c4c1aa':'#a595ad');col.addColorStop(.48,lower?'#56798a':'#80959b');col.addColorStop(1,active?'#a67392':'#3f566f');
   c.fillStyle=col;c.strokeStyle='#263346';c.lineWidth=2;c.beginPath();c.moveTo(12,-76);
   if(!lower){c.bezierCurveTo(43,-150,128,-181,115,-108);c.bezierCurveTo(139,-70,88,-46,18,-43);}
   else{c.bezierCurveTo(68,-87,119,-48,84,-21);c.bezierCurveTo(67,9,30,-8,13,-43);}
   c.closePath();c.fill();c.stroke();
   for(let j=0;j<4;j++)line(c,'#e4d2b288',1.3,()=>{c.moveTo(16,-66);c.quadraticCurveTo(50+j*11,-100+lower*65,104-j*11,-137+lower*105);});
   oval(c,lower?57:84,lower?-34:-113,lower?15:21,lower?11:26,'#d6c6b3',.4);
   oval(c,lower?57:84,lower?-34:-113,lower?10:14,lower?7:17,'#394760',.4);
   oval(c,lower?57:84,lower?-34:-113,lower?4:6,lower?5:9,rest?'#e9e1b3':'#b895b2',.4);
   for(let j=0;j<6;j++)oval(c,40+j*9,-80+lower*40+Math.sin(j*.6)*10,1.6,2.6,'#e4d6b5');
  }
  line(c,'#c8c4af',2.5,()=>{c.moveTo(11,-119);c.quadraticCurveTo(41,-172,53,-150);});
  for(let j=0;j<5;j++)line(c,'#a1b8b0',1,()=>{const xx=27+j*4,yy=-146-j*1.7;c.moveTo(xx,yy);c.lineTo(xx+2,yy-11);});
  line(c,'#b3bcb0',3,()=>{c.moveTo(13,-66);c.quadraticCurveTo(39,-37,17,-25);});
  c.restore();
 }
 oval(c,0,-70,21,46,'#3c5264');oval(c,0,-112+breath,25,23,'#c6c9b4');
 for(let j=0;j<7;j++)line(c,'#c7d1bd',2,()=>{const xx=(j-3)*6;c.moveTo(xx,-119);c.lineTo(xx-2,-133-Math.abs(j-3)*2);});
 for(const side of[-1,1]){oval(c,side*9,-114+breath,5,8,'#283347',side*.14);oval(c,side*9+1,-117+breath,1.8,2.8,'#fff1cc');}
 line(c,'#697d88',1,()=>{c.moveTo(-4,-102+breath);c.quadraticCurveTo(0,-98+breath,4,-102+breath);});
 lantern(c,0,-47,rest,time,true,reduced);
 if(rest){c.globalAlpha=.16;oval(c,0,-49,37,44,'#ffe2aa');c.globalAlpha=1;}
 c.restore();
}
