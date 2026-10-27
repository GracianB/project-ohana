// Draw the far semicircle before the body, the near semicircle afterwards.
export function drawHulaDepth(ctx,p,H,t,front=false,reduceMotion=false){
 const duet=p._kiloDuetT>0&&p._kiloDuetAge>=30&&p._kiloDuetAge<108;
 const powerAge=t-(p._powerPerformance?.start??-9999),finale=p._powerPerformance?.index===5&&powerAge>=0&&powerAge<120;
 const aloha=p._kiloOhanaT>0;
 // K has its own foot trail. A waist hoop belongs only to the ceremonial
 // performances, with a clock that another J cast cannot reset.
 if(p.id!=='kilo'||p.dead||(!duet&&!finale&&!aloha))return;
 const time=reduceMotion?0:duet?p._kiloDuetAge:finale?powerAge:Math.max(0,t-(p._kiloOhanaAt??t)), sway=Math.sin(time*.16)*H*.035;
 ctx.save();ctx.lineWidth=Math.max(2,H*.028);ctx.strokeStyle=front?(aloha||finale?'#fff0b0':'#ffcf75'):'#b67b83';
 ctx.beginPath();ctx.ellipse(sway,-H*.39,H*(aloha?.56:.43),H*.12,Math.sin(time*.08)*.12,front?0:Math.PI,front?Math.PI:Math.PI*2);ctx.stroke();ctx.restore();
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
