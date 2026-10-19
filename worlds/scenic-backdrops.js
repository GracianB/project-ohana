import {drawOhanaGarden} from './ohana-garden.js';
import {drawNestSanctuary} from './nest-sanctuary.js';
// Distant scenery only. Solid platforms and hazards are drawn by terrain.js.
const TAU=Math.PI*2;
const wrap=(v,n)=>((v%n)+n)%n;
export const SCENIC_PALETTES=Object.freeze({
 grove:['#a8c9ad','#729c8e','#416f68'],beach:['#92c7c4','#63a5ad','#3b798c'],
 jungle:['#417a72','#285c57','#1c413f'],cave:['#344b72','#263654','#162a43'],
 lab:['#345467','#254254','#183040'],ridge:['#a8c5cf','#7c9da8','#526f81'],
 space:['#414576','#2b355b','#1d2848'],aquatic:['#276a7b','#20576b','#183e56'],
 volcano:['#986754','#70453f','#492d32'],boss:['#72535c','#4b3647','#302639']
});
function ellipse(ctx,x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();}

export function drawScenicBackdrop(ctx,id,cam,t,width,height){
 if(id==='grove'){drawOhanaGarden(ctx,cam,t,width,height);return;}
 const colors=SCENIC_PALETTES[id]||SCENIC_PALETTES.grove;
 ctx.save();
 try{
  // A small, quiet focal point leaves the upper HUD and jumping lane readable.
  if(['grove','beach','ridge'].includes(id)){
   ellipse(ctx,width*.76-cam.x*.015,height*.24,Math.min(38,width*.055),Math.min(38,width*.055),'#fff1c7b3');
   for(let i=0;i<3;i++){
    const x=wrap(i*390-cam.x*.025,width+260)-130,y=height*(.22+i*.06);
    ellipse(ctx,x,y,80,8,'#edf2d126');ellipse(ctx,x+38,y-5,48,10,'#edf2d126');
   }
  }
  if(id==='space'){
   for(let i=0;i<45;i++){const x=wrap(i*137.17-cam.x*.025,width),y=((i*83.31)%height)*.72;
    ctx.fillStyle=i%6?'#d8e8ee66':'#ffdfad99';ctx.fillRect(x,y,i%6?1.5:3,i%6?1.5:3);}
   ellipse(ctx,width*.76,height*.3,height*.105,height*.105,'#a49bc02e');
   ctx.strokeStyle='#bdb5dc36';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(width*.76,height*.3,height*.17,height*.035,-.28,0,TAU);ctx.stroke();
  }
  for(let layer=0;layer<3;layer++){
   const depth=.035+layer*.035,span=420,shift=wrap(cam.x*depth,span),base=height*(.72+layer*.08);
   ctx.fillStyle=colors[layer];ctx.globalAlpha=.46+layer*.12;
   for(let i=-1;i<=Math.ceil(width/span)+1;i++){
    const x=i*span-shift,peak=height*(.10+layer*.025)+(i%2)*12;
    ctx.beginPath();ctx.moveTo(x,height);
    if(['ridge','volcano','cave','space'].includes(id)){
     ctx.lineTo(x,base);ctx.lineTo(x+125,base-peak);ctx.lineTo(x+185,base-peak*.7);ctx.lineTo(x+250,base-peak*1.35);ctx.lineTo(x+420,base);
    }else{
     ctx.lineTo(x,base);ctx.bezierCurveTo(x+100,base-peak,x+240,base-peak*.8,x+420,base);
    }ctx.lineTo(x+420,height);ctx.closePath();ctx.fill();
   }
  }
  ctx.globalAlpha=1;
  // Authored landmarks give each distant world a recognizable destination.
  const lx=width*.72-cam.x*.025,ly=height*.67;
  if(id==='beach'){
   ellipse(ctx,lx,ly,90,10,'#4d8e914d');
   ctx.strokeStyle='#3c737677';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(lx+12,ly);ctx.quadraticCurveTo(lx+4,ly-28,lx+16,ly-58);ctx.stroke();
   ctx.fillStyle='#4d8d8377';
   for(let i=0;i<5;i++){const a=-Math.PI+i*.65;ctx.beginPath();ctx.moveTo(lx+16,ly-58);ctx.quadraticCurveTo(lx+16+Math.cos(a)*22,ly-70+Math.sin(a)*12,lx+16+Math.cos(a)*40,ly-54+Math.sin(a)*14);ctx.closePath();ctx.fill();}
  }else if(id==='grove'){
   ctx.fillStyle='#547d6d66';ctx.fillRect(lx-32,ly-36,64,42);
   ctx.fillStyle='#405f5d77';ctx.beginPath();ctx.moveTo(lx-47,ly-34);ctx.lineTo(lx,ly-65);ctx.lineTo(lx+47,ly-34);ctx.closePath();ctx.fill();
   ctx.fillStyle='#d5cc9e66';ctx.fillRect(lx-7,ly-18,14,24);
  }else if(id==='ridge'){
   ctx.strokeStyle='#cbdcd75c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(lx-95,ly-25);ctx.lineTo(lx-65,ly-52);ctx.lineTo(lx-35,ly-41);ctx.lineTo(lx,ly-89);ctx.lineTo(lx+35,ly-41);ctx.lineTo(lx+50,ly-50);ctx.stroke();
  }else if(id==='volcano'){
   ctx.fillStyle='#492d3266';ctx.beginPath();ctx.moveTo(lx-115,ly+45);ctx.lineTo(lx-25,ly-65);ctx.lineTo(lx+27,ly-65);ctx.lineTo(lx+125,ly+45);ctx.closePath();ctx.fill();
   ellipse(ctx,lx,ly-65,27,5,'#d18b6566');
   for(let i=0;i<3;i++)ellipse(ctx,lx+i*15,ly-90-i*23,20+i*9,12+i*3,'#bc96891a');
  }else if(id==='boss'){
   drawNestSanctuary(ctx,cam,t,width,height);
   ellipse(ctx,lx,ly-35,70,90,'#432d4155');
   ctx.strokeStyle='#9c6b6b33';ctx.lineWidth=3;
   for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(lx,ly-65+i*23,52-i*3,10,0,0,TAU);ctx.stroke();}
   ellipse(ctx,lx,ly+5,20,28,'#120e2544');
  }
  if(id==='grove'||id==='jungle'){
   for(let i=-1;i<Math.ceil(width/230)+1;i++){
    const x=i*230-wrap(cam.x*.13,230),base=height*.89,top=base-height*(.24+(i%2)*.035);
    ctx.strokeStyle=colors[2]+'88';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(x,base);ctx.quadraticCurveTo(x-8,top+60,x+9,top);ctx.stroke();
    for(let j=0;j<4;j++){const a=j*1.8;ellipse(ctx,x+Math.cos(a)*29,top+Math.sin(a)*18,48,25,colors[1]+'aa');}
    ellipse(ctx,x-13,top-13,35,17,colors[0]+'55');
   }
  }else if(id==='beach'||id==='aquatic'){
   ctx.strokeStyle=id==='beach'?'#d2e5d344':'#67b6c333';ctx.lineWidth=1;
   for(let i=0;i<8;i++){
    const y=height*(.64+i*.045),x=wrap(i*170-cam.x*.08+t*.08,width+160)-80;
    ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+35,y-3,x+90,y);ctx.stroke();
   }
   if(id==='aquatic')for(let i=0;i<8;i++){
    const x=wrap(i*190-cam.x*.1,width+200)-100,base=height;
    ctx.strokeStyle=colors[i%3]+'aa';ctx.lineWidth=8;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x,base);ctx.bezierCurveTo(x-20,base-50,x+15,base-90,x-4,base-140);ctx.moveTo(x,base-55);ctx.lineTo(x+30,base-85);ctx.stroke();
   }
  }else if(id==='cave'){
   ctx.fillStyle='#14283b99';
   for(let i=0;i<Math.ceil(width/180)+1;i++){
    const x=i*180-wrap(cam.x*.1,180),length=height*(.16+(i%3)*.04);
    ctx.beginPath();ctx.moveTo(x-34,0);ctx.lineTo(x+30,0);ctx.lineTo(x+5,length);ctx.closePath();ctx.fill();
    ellipse(ctx,x+5,length*.7,2,4,'#8bd0cf66');
   }
  }else if(id==='lab'){
   for(let i=0;i<Math.ceil(width/260)+1;i++){
    const x=i*260-wrap(cam.x*.08,260),y=height*.43;
    ctx.fillStyle='#203d4a77';ctx.fillRect(x,y,130,height*.6);
    ctx.strokeStyle='#72bbbf44';ctx.lineWidth=2;ctx.strokeRect(x+18,y+20,94,100);
    ctx.beginPath();ctx.arc(x+65,y+70,24,0,TAU);ctx.stroke();
    for(let j=0;j<3;j++)ellipse(ctx,x+26+j*17,y+147,2,2,j===1?'#e6c78b88':'#8bc6b155');
   }
  }else if(id==='volcano'){
   for(let i=0;i<8;i++){const x=wrap(i*197-cam.x*.08,width+100),y=height*.76-wrap(t*.12+i*41,height*.5);
    ellipse(ctx,x,y,1.5,2.5,'#efaf7966');}
  }else if(id==='boss'){
   for(let i=0;i<6;i++){
    const x=wrap(i*240-cam.x*.07,width+220)-110,y=height*.55;
    ctx.strokeStyle='#91636b55';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,height);ctx.quadraticCurveTo(x-80,y-60,x+32,y-80);ctx.stroke();
   }
  }
 }finally{ctx.restore();}
}
