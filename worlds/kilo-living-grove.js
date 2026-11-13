import {cachedGradient} from '../systems/canvas-gradient-cache.js';
const TAU=Math.PI*2;
function ellipse(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
export function drawKiloLivingGrove(c,g,cam,t,w,h){
 const x=g.player?.x||0,zone=Math.max(0,Math.min(3,Math.floor(x/2400))),reduced=!!g.reduceMotion,time=reduced?0:t;
 const pal=[['#143744','#568e8b','#bad4aa'],['#112f36','#3e7668','#a5c584'],['#152d3e','#4d7d75','#9bc8a4'],['#3f3441','#956d6d','#e9bd92']][zone];
 c.save();const bg=cachedGradient(c,`grove639:${zone}:${w}:${h}`,()=>{const a=c.createLinearGradient(0,0,0,h);a.addColorStop(0,pal[0]);a.addColorStop(.65,pal[1]);a.addColorStop(1,pal[2]);return a;});c.fillStyle=bg;c.fillRect(0,0,w,h);
 const floor=1134-cam.y;
 ellipse(c,w*.74-cam.x*.025%150,h*.24,60,60,'#f5dfb580');
 // Four depth planes; foreground routes remain brighter than their scenery.
 for(let layer=0;layer<3;layer++){
  const spacing=layer===0?420:layer===1?260:195,parallax=.1+layer*.11,shift=cam.x*parallax;
  c.globalAlpha=.3+layer*.15;
  for(let i=Math.floor(shift/spacing)-2;i<(shift+w)/spacing+2;i++){
   const px=i*spacing-shift,base=floor+70+layer*10,height=280+((i*37+layer*53)%170+170)%170;
   if(zone===0){ellipse(c,px,base,spacing*.8,height*.46,['#234e52','#2f625b','#3c7361'][layer]);}
   else{
    c.fillStyle=['#193e43','#285650','#3d6f5a'][layer];c.beginPath();c.moveTo(px-12,base);c.quadraticCurveTo(px-28,base-height*.65,px+4,base-height);c.lineTo(px+20,base-height);c.quadraticCurveTo(px-4,base-height*.5,px+28,base);c.closePath();c.fill();
    if(zone===1)for(let k=0;k<5;k++){c.strokeStyle='#9ebd8b';c.lineWidth=2;c.beginPath();c.moveTo(px-10,base-k*55-30);c.lineTo(px+19,base-k*55-34);c.stroke();}
    ellipse(c,px+8,base-height,70+layer*15,40+layer*15,['#244e4e','#467661','#679471'][layer]);
   }
  }
 }
 c.globalAlpha=1;
 if(zone===0){c.fillStyle='#649c9d55';c.fillRect(0,floor+20,w,h);for(let i=0;i<6;i++){c.strokeStyle='#d2e4c44d';c.lineWidth=1;c.beginPath();const py=floor+40+i*17;c.moveTo(0,py);c.bezierCurveTo(w*.3,py-9,w*.7,py+8,w,py);c.stroke();}}
 // Instruments restore living fireflies; their number follows earned progress.
 const voices=g.world1?.stations?.filter(s=>s.done).length||0;
 for(let i=0;i<7+voices*4;i++){const px=((i*193-cam.x*.07)%(w+80)+w+80)%(w+80)-40,py=floor-90-((i*83)%320)+(reduced?0:Math.sin(time*.035+i)*8);ellipse(c,px,py,1.8,1.8,voices?'#fff0b7':'#c8dcc670');}
 // Real wind columns and the earned upper bridge use their exact world boxes.
 for(const a of g.roomDef.windColumns||[]){const px=a.x-cam.x,py=a.y-cam.y;if(px+a.w<0||px>w)continue;c.globalAlpha=.14;c.fillStyle='#b7e5d7';c.fillRect(px,py,a.w,a.h);c.globalAlpha=.6;c.strokeStyle='#d5efdf';c.lineWidth=1.2;for(let i=0;i<4;i++){const dx=px+a.w*(i+1)/5,start=py+(reduced?a.h*.4:((time*2+i*70)%a.h));c.beginPath();c.moveTo(dx,start+30);c.quadraticCurveTo(dx-7,start,dx+3,start-30);c.stroke();}c.globalAlpha=1;}
 const bridge=g.roomDef.windBridge;if(bridge&&g.world1?.stations?.[1]?.done){const bx=bridge.x-cam.x,by=bridge.y-cam.y;c.fillStyle='#8cad83';c.fillRect(bx,by,bridge.w,bridge.h);c.strokeStyle='#dce1b7';c.lineWidth=2;c.beginPath();c.moveTo(bx,by-18);c.quadraticCurveTo(bx+bridge.w*.5,by+3,bx+bridge.w,by-18);c.stroke();for(let i=0;i<bridge.w;i+=35){c.strokeStyle='#4c715c';c.lineWidth=1;c.beginPath();c.moveTo(bx+i,by);c.lineTo(bx+i,by+bridge.h);c.stroke();}}
 c.restore();
}
