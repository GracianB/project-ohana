import {pearlOpen} from '../systems/nacar-chapter.js';
import {drawSeaStar} from '../characters/art/nacar.js';
const TAU=Math.PI*2,oval=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
export function drawNacarSeabed(c,g,cam,t,W,H){
 if(!g.roomDef?.nacarChapter)return false;t=g.reduceMotion?0:t;c.save();
 const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#0c354d');sky.addColorStop(.45,'#144b60');sky.addColorStop(1,'#071a31');c.fillStyle=sky;c.fillRect(0,0,W,H);
 // Moving caustics and distant stone arches give depth without flattening play space.
 for(let i=0;i<7;i++){const x=((i*280-cam.x*.13)%(W+360)+W+360)%(W+360)-180;c.fillStyle='#72d3c90a';c.beginPath();c.moveTo(x-45,-20);c.lineTo(x+20,-20);c.lineTo(x+260,H);c.lineTo(x+80,H);c.fill();}
 for(let i=0;i<12;i++){const x=i*1050-cam.x*.35,y=H*.72+Math.sin(i*3)*100-cam.y*.08;c.strokeStyle='#17364c';c.lineWidth=65;c.beginPath();c.ellipse(x,y,170,310,-.12,Math.PI,TAU);c.stroke();}
 for(let i=0;i<25;i++){const x=((i*79.3-cam.x*.18+t*.12)%(W+60)+W+60)%(W+60)-30,y=((i*117.9-cam.y*.08-t*.25)%(H+60)+H+60)%(H+60)-30;oval(c,x,y,1.4,2.3,i%4?'#a5dacc44':'#ffe2af66');}
 for(let i=0;i<15;i++){const x=((i*183+t*.23-cam.x*.22)%(W+160)+W+160)%(W+160)-80,y=90+(i*113)%Math.max(100,H-150);c.fillStyle='#5f9caa66';c.beginPath();c.moveTo(x+8,y);c.quadraticCurveTo(x,y-5,x-8,y);c.lineTo(x-14,y-4);c.lineTo(x-14,y+4);c.lineTo(x-8,y);c.quadraticCurveTo(x,y+6,x+8,y);c.fill();}
 // World-anchored kelp and coral lie behind the actual collision platforms.
 for(let i=0;i<34;i++){const x=160+i*330-cam.x,y=1850-cam.y;if(x< -170||x>W+170)continue;for(let b=0;b<4;b++){const xx=x+b*21,h=60+(i*37+b*43)%210,sway=Math.sin(t*.018+i+b)*12;c.strokeStyle=b%2?'#347b7c':'#295c6d';c.lineWidth=7+b;c.beginPath();c.moveTo(xx,y);c.bezierCurveTo(xx-30,y-h*.3,xx+35,y-h*.6,xx+sway,y-h);c.stroke();}if(i%3===0){c.strokeStyle='#bd9db066';c.lineWidth=8;c.beginPath();c.moveTo(x,y);c.lineTo(x-20,y-70);c.moveTo(x-12,y-40);c.lineTo(x-54,y-65);c.moveTo(x-20,y-70);c.lineTo(x+8,y-95);c.stroke();}}
 // The wreck is a landmark, not a doorway: swim around and over its ribs.
 const wx=4550-cam.x,wy=1780-cam.y;if(wx> -900&&wx<W+900){c.fillStyle='#26394b';c.beginPath();c.moveTo(wx-650,wy-210);c.quadraticCurveTo(wx,wy+210,wx+650,wy-180);c.lineTo(wx+550,wy+20);c.lineTo(wx-550,wy+20);c.fill();for(let i=-4;i<=4;i++){c.strokeStyle='#486777';c.lineWidth=15;c.beginPath();c.moveTo(wx+i*110,wy+15);c.quadraticCurveTo(wx+i*140,wy-80,wx+i*135,wy-130-Math.abs(i)*16);c.stroke();}}
 c.restore();return true;
}
export function drawNacarChapter(c,g,cam,t){if(!g.roomDef?.nacarChapter)return false;t=g.reduceMotion?0:t;c.save();
 for(const s of g.world1?.stations||[]){const x=s.x-cam.x,y=s.y-cam.y;if(x< -120||x>(g.viewW||1600)+120)continue;const open=pearlOpen(g.world1.tick,s);oval(c,x,y+12,30,15,'#376d7c');c.fillStyle=s.done?'#bceade':open?'#ead6bc':'#5d8097';c.beginPath();c.arc(x,y,18,Math.PI,0);c.quadraticCurveTo(x+13,y+15,x,y+12);c.quadraticCurveTo(x-13,y+15,x-18,y);c.fill();oval(c,x,y-2,7,8,s.done?'#fff5d0':open?'#edf9e4':'#7296a4');c.textAlign='center';c.font='600 12px sans-serif';c.fillStyle='#cbe7de';c.fillText(s.done?'ESCUCHADA':open?'E · ESCUCHAR':'RESPIRA…',x,y-35);}
 for(const v of g.roomDef.tides){const x=v.x-cam.x,y=v.y-cam.y,up=g._nacarCurrents?.[v.id];c.strokeStyle='#8bbdb4';c.lineWidth=4;c.beginPath();c.arc(x,y,19,0,TAU);c.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2+(up?-.5:.5);c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*16,y+Math.sin(a)*16);c.stroke();}c.textAlign='center';c.font='12px sans-serif';c.fillStyle='#deead7';c.fillText('E · CORRIENTE '+(up?'↑':'↓'),x,y-34);const a=v.area;for(let i=0;i<12;i++){const xx=a.x+a.w*((i*37%100)/100)-cam.x,yy=a.y+((i*113+(up?-t:t)*1.7)%(a.h)+a.h)%a.h-cam.y;oval(c,xx,yy,2,4,'#b6efdc66');}}
 for(let i=0;i<10;i++)drawSeaStar(c,700+i*960-cam.x,1838-cam.y,10,0,i%2?'#d9b6bf':'#bddfc6');
 c.restore();return true;}
export function drawNacarBoss(c,e,cam,t,reduced){const b=e._nacarBoss;if(!b)return;const x=e.x+e.w/2-cam.x,y=e.y+e.h/2-cam.y,T=reduced?0:t;c.save();
 if(b.phase==='warn'){
  const tx=b.tx-cam.x,ty=b.ty-cam.y,angle=Math.atan2(ty-y,tx-x);
  if(b.attack===1){
   for(let i=-1;i<=1;i++)for(let k=0;k<5;k++)oval(c,tx+i*150,ty-300+k*76,6,12,'#f1c1c266');
  }else{
   const count=b.attack===0?5+b.tier*2:6;
   for(let i=0;i<count;i++){
    const a=b.attack===0?angle+(i-(count-1)/2)*.18:i*TAU/count;
    for(let k=1;k<=3;k++)oval(c,x+Math.cos(a)*k*59,y+Math.sin(a)*k*59,5,5,'#f1c1c288');
   }
  }
 }
 for(let i=0;i<14;i++){const a=i*TAU/14,sway=Math.sin(T*.035+i)*.1,r=b.phase==='rest'?56:82;c.strokeStyle=i%2?'#9d88b9':'#7ba9b7';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(x+Math.cos(a)*32,y+Math.sin(a)*32);c.quadraticCurveTo(x+Math.cos(a+sway)*r,y+Math.sin(a+sway)*r,x+Math.cos(a+.2)*(r+15),y+Math.sin(a+.2)*(r+15));c.stroke();oval(c,x+Math.cos(a+.2)*(r+15),y+Math.sin(a+.2)*(r+15),4,5,'#e8c6d1');}
 oval(c,x,y,47,52,b.phase==='rest'?'#c6ddd4':'#70869e');oval(c,x,y+4,24,27,'#2c4860');oval(c,x-10,y-3,5,7,'#f6e6c3');oval(c,x+10,y-3,5,7,'#f6e6c3');c.fillStyle='#162f45';c.fillRect(x-54,y-117,108,6);c.fillStyle='#dcc1d0';c.fillRect(x-54,y-117,108*Math.max(0,e.hp/e.max),6);c.textAlign='center';c.fillStyle='#ead8cf';c.font='600 12px sans-serif';c.fillText('ANÉMONA DEL SILENCIO',x,y-132);c.font='11px sans-serif';c.fillText(b.phase==='rest'?'AHORA · núcleo abierto':b.phase==='warn'?'ESQUIVA LA LUZ':'CORRIENTE HOSTIL',x,y+125);c.restore();}
