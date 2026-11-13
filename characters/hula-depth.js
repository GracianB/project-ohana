// Independent ceremonial clock: local casts and replicated remaining duration agree.
export function kiloHoopPose(p,H,t,reduced=false){
 const duet=p._kiloDuetT>0&&p._kiloDuetAge>=30&&p._kiloDuetAge<108;
 const powerAge=t-(p._powerPerformance?.start??-9999),finale=p._powerPerformance?.index===5&&powerAge>=0&&powerAge<120,aloha=p._kiloOhanaT>0;
 if(p.id!=='kilo'||p.dead||(!duet&&!finale&&!aloha))return null;
 const age=duet?p._kiloDuetAge:finale?powerAge:Number.isFinite(p._kiloOhanaAt)?t-p._kiloOhanaAt:180+(p.evo||0)*30-p._kiloOhanaT;
 const time=reduced?0:Math.max(0,Number.isFinite(age)?age:0);
 return{time,phase:time*.095,radius:H*(aloha?.56:.43),sway:Math.sin(time*.16)*H*.035,tilt:Math.sin(time*.08)*.12,ceremonial:aloha||finale};
}
// Draw the far semicircle and moving ornaments behind the body, then the near half.
export function drawHulaDepth(ctx,p,H,t,front=false,reduceMotion=false){
 const hoop=kiloHoopPose(p,H,t,reduceMotion);if(!hoop)return;
 const{radius,sway,tilt,phase}=hoop,y=-H*.39;
 ctx.save();ctx.lineWidth=Math.max(2,H*.028);ctx.strokeStyle=front?(hoop.ceremonial?'#fff0b0':'#ffcf75'):'#b67b83';
 ctx.beginPath();ctx.ellipse(sway,y,radius,H*.12,tilt,front?0:Math.PI,front?Math.PI:Math.PI*2);ctx.stroke();
 // Asymmetric jewels make rotation visible even when the hoop's contour is circular.
 for(let i=0;i<8;i++){const a=phase+i*Math.PI/4,near=Math.sin(a)>=0;if(near!==front)continue;
  const ox=Math.cos(a)*radius,oy=Math.sin(a)*H*.12,x=sway+ox*Math.cos(tilt)-oy*Math.sin(tilt),yy=y+ox*Math.sin(tilt)+oy*Math.cos(tilt),r=H*(i===0?.043:.024);
  ctx.strokeStyle=i===0?'#fff7cf':i%2?'#ffb1ba':'#b7ffe3';ctx.lineWidth=i===0?2:1.4;ctx.beginPath();ctx.moveTo(x-r,yy);ctx.lineTo(x,yy-r);ctx.lineTo(x+r,yy);ctx.lineTo(x,yy+r);ctx.lineTo(x-r,yy);ctx.stroke();
 }
 ctx.restore();
}

// A quiet stream below the feet identifies actual flight, even after the
// temporary defensive field expires. It never covers the face or costume.
export function drawKiloFlightTrail(ctx,p,H,t,reduceMotion=false){
 if(p.id!=='kilo'||p.dead||!(p._kiloFlightT>0))return;
 ctx.save();ctx.fillStyle=p._kiloFlightMode==='solar'?'#f1daa2':'#b9d9c2';
 for(let i=0;i<4;i++){
  const k=reduceMotion?i/4:((Math.max(0,t-(p._kiloFlightAt??0))*.018+i/4)%1);
  ctx.globalAlpha=(1-k)*.6;
  const drift=Math.min(1,Math.abs(p.vx||0)/5)*H*.2*k;
  for(const side of [-1,1]){
   ctx.beginPath();ctx.ellipse(side*H*(.1+.08*k)-drift,H*(.06+.16*k),H*.035,H*.014,side*.5,0,Math.PI*2);ctx.fill();
  }
 }
 ctx.restore();
}
