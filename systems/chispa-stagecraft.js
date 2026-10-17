// Fixed geometry, no particles or gameplay mutations. White lightning, gold conductors.
import {borrowedLFootprint} from './u-duet-direction-v315.js';
const TAU=Math.PI*2,unit=v=>Math.max(0,Math.min(1,v));
export function thunderBolt(ctx,x1,y1,x2,y2,power=1,t=0,reduced=false){
 const dx=x2-x1,dy=y2-y1,d=Math.hypot(dx,dy)||1;
 ctx.save();ctx.lineJoin='miter';ctx.lineCap='butt';
 for(const [color,width]of [['#8be7ff',7],['#e4ca82',4],['#ffffff',1.8]]){
  ctx.strokeStyle=color;ctx.lineWidth=width*power;ctx.beginPath();ctx.moveTo(x1,y1);
  for(let i=1;i<=8;i++){const u=i/8,offset=i===8?0:Math.sin(i*2.7+(reduced?0:Math.floor(t/5)))*Math.min(17,d*.09);
   ctx.lineTo(x1+dx*u-dy/d*offset,y1+dy*u+dx/d*offset);
  }ctx.stroke();
 }ctx.restore();
}
export function drawThunderSeal(ctx,x,y,r,t=0,reduced=false,charge=1){
 ctx.save();ctx.translate(x,y);ctx.lineWidth=1.8;ctx.strokeStyle='#dfc580';
 const spin=reduced?0:t*.008;
 for(let j=0;j<2;j++){
  ctx.beginPath();ctx.ellipse(0,0,r*(1-j*.24),r*(.25+j*.12),j?.25:-.25,0,TAU);ctx.stroke();
 }
 for(let i=0;i<6;i++){
  const a=i*TAU/6+spin,xx=Math.cos(a)*r,yy=Math.sin(a)*r*.3;
  ctx.fillStyle=i%2?'#fffefa':'#b3f2ff';ctx.beginPath();ctx.moveTo(xx,yy-5);ctx.lineTo(xx+3,yy);ctx.lineTo(xx,yy+5);ctx.lineTo(xx-3,yy);ctx.closePath();ctx.fill();
 }
 ctx.strokeStyle='#fefeff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(4,-r*.28);ctx.lineTo(-5,1);ctx.lineTo(4,-1);ctx.lineTo(-3,r*.3);ctx.stroke();
 if(charge>.5){ctx.globalAlpha*=.3;ctx.beginPath();ctx.ellipse(0,0,r*.55,r*.55,0,0,TAU);ctx.stroke();}
 ctx.restore();
}
export function chispaAssistBeat(s,reduced=false){
 if(!s||!Number.isInteger(s.age)||s.age<0||s.age>=360)return null;
 const age=s.age,beats=[42,66,90],index=beats.reduce((b,v,i)=>Math.abs(age-v)<Math.abs(age-beats[b])?i:b,0),delta=age-beats[index];
 return Object.freeze({stage:age<18?'arrival':age<36?'ritual':age<102?'judgement':age<300?'encore':'farewell',
  index,delta,charge:unit((delta+17)/17),impact:delta>=0&&delta<16,
  alpha:Math.min(1,age/12,s.surprise?1:unit((120-age)/12)),still:!!reduced});
}
export function drawChispaAssist(ctx,s,cam,t=0,reduced=false,targets=null){
 const beat=chispaAssistBeat(s,reduced);if(!beat)return false;
 const x=s.x-cam.x,y=s.y-cam.y,evo=Math.max(0,Math.min(4,s.evo|0));
 ctx.save();ctx.globalAlpha*=beat.alpha;
 const radius=48+evo*9,sy=y-150-evo*8;
 if(s.age<106){
  drawThunderSeal(ctx,x,sy,radius,t,reduced,beat.charge);
  if(s.age<36){
   const k=unit(s.age/36);
   for(let i=0;i<(reduced?2:4);i++){
    const a=i*TAU/4,xx=x+Math.cos(a)*radius*(1-k*.55),yy=sy+Math.sin(a)*radius*.35;
    thunderBolt(ctx,xx,yy,x,sy,.35,t+i,reduced);
   }
  }
  // Three authored strokes, aligned with the borrowed L's real damage areas.
  for(let i=0;i<(targets===null?3:0);i++){
   const delta=s.age-[42,66,90][i];if(delta< -17||delta>=18)continue;
   const area=borrowedLFootprint('storm',{...s,evo},i),tx=area.x-cam.x,ground=s.y-cam.y;
   const impact=delta>=0,k=impact?1-delta/18:(delta+17)/17;
   ctx.save();ctx.globalAlpha*=impact?k:.3*k;
   drawThunderSeal(ctx,tx,ground,area.rx,t,reduced,0);
   if(impact){
    thunderBolt(ctx,x,sy,tx,ground,(i===2?1.5:1)+evo*.12,t,reduced);
    for(let branch=0;branch<(reduced?1:3);branch++){
     const side=branch%2?-1:1;
     thunderBolt(ctx,tx,ground-65,tx+side*(14+branch*12),ground-18,.35,t+branch,reduced);
    }
    ctx.strokeStyle='#b8efff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(tx,ground,area.rx*(1+delta/32),7+delta*.4,0,0,TAU);ctx.stroke();
   }else{
    ctx.strokeStyle='#d4edeb';ctx.lineWidth=1;ctx.setLineDash([3,6]);ctx.beginPath();ctx.moveTo(tx,sy);ctx.lineTo(tx,ground);ctx.stroke();ctx.setLineDash([]);
   }ctx.restore();
  }
  // Canonical Stitcho duo supplies its actual hit coordinates instead.
  if(targets&&targets.length===0&&beat.impact&&beat.delta<7){
   ctx.save();ctx.globalAlpha*=.65;
   thunderBolt(ctx,x,sy,x+s.facing*38,sy+70,.7,t,reduced);ctx.restore();
  }
  for(const b of targets||[]){ctx.save();ctx.globalAlpha*=unit(b.life/12);thunderBolt(ctx,x,sy,b.x-cam.x,b.y-cam.y,1+evo*.12,t,reduced);ctx.restore();}
 }
 ctx.restore();return true;
}
export function drawChispaCeremony(ctx,x,foot,h,t,reduced=false,kind='ending'){
 ctx.save();
 const time=reduced?0:t,lift=reduced?0:Math.sin(time*1.7)*h*.025;
 ctx.globalAlpha*=kind==='intro'?.65:.85;
 drawThunderSeal(ctx,x,foot+3,h*.34,time*60,reduced,.6);
 const n=kind==='intro'?2:4;
 for(let i=0;i<n;i++){
  const a=-Math.PI*.88+i*Math.PI*.76/Math.max(1,n-1),xx=x+Math.cos(a)*h*.58,yy=foot-h*.62+Math.sin(a)*h*.42+lift;
  ctx.save();ctx.translate(xx,yy);ctx.rotate(a+Math.PI/2);ctx.fillStyle='#e8d18d';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(4,0);ctx.lineTo(0,8);ctx.lineTo(-4,0);ctx.closePath();ctx.fill();ctx.restore();
  if(kind==='ending'&&!reduced)thunderBolt(ctx,xx,yy,x,foot-h*.55,.2,time*30+i,false);
 }ctx.restore();
}
