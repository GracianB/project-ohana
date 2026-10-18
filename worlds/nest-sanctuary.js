const TAU=Math.PI*2;
export function drawNestSanctuary(ctx,cam,t,W,H){
 const x=W*.61-cam.x*.035,y=H*.7,r=Math.min(W*.29,H*.36);
 ctx.save();try{
  // The ruined roost stays behind the fighting plane and never acts as cover.
  const light=ctx.createRadialGradient(x,y-r*.55,5,x,y-r*.35,r*1.5);
  light.addColorStop(0,'#d8a56824');light.addColorStop(.55,'#b96a6810');light.addColorStop(1,'#30213900');
  ctx.fillStyle=light;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#332536';ctx.lineCap='round';ctx.lineWidth=Math.max(20,r*.17);
  ctx.beginPath();ctx.moveTo(x-r*1.12,H);ctx.bezierCurveTo(x-r*1.4,y-r*1.2,x-r*.45,y-r*1.6,x,y-r*1.3);ctx.bezierCurveTo(x+r*.6,y-r*1.7,x+r*1.35,y-r*.9,x+r*1.15,H);ctx.stroke();
  ctx.strokeStyle='#96717a66';ctx.lineWidth=2;
  for(let side=-1;side<=1;side+=2)for(let i=0;i<5;i++){
   const bx=x+side*r*(.8+i*.06),by=y-r*.3+i*r*.21;
   ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(bx-side*30,by-35,bx+side*35,by-65);ctx.stroke();
  }
  ctx.fillStyle='#261e3155';ctx.beginPath();ctx.ellipse(x,y-r*.2,r*.51,r*.74,0,0,TAU);ctx.fill();
  ctx.strokeStyle='#b78e793b';ctx.lineWidth=3;
  for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(x,y+r*.18+i*11,r*(.52+i*.025),r*.11,-.03,0,TAU);ctx.stroke();}
  // An owl relief and its two small egg lanterns make the arena recognizable.
  ctx.fillStyle='#b6977e55';ctx.beginPath();ctx.moveTo(x-r*.3,y-r*.55);ctx.lineTo(x-r*.25,y-r*.95);ctx.lineTo(x,y-r*.72);ctx.lineTo(x+r*.25,y-r*.95);ctx.lineTo(x+r*.3,y-r*.55);ctx.quadraticCurveTo(x,y-r*.24,x-r*.3,y-r*.55);ctx.fill();
  ctx.fillStyle='#ffddb275';for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(x+side*r*.12,y-r*.61,r*.055,r*.075,0,0,TAU);ctx.fill();}
  for(const side of [-1,1]){
   const lx=x+side*r*.7,ly=y-r*.25;
   ctx.strokeStyle='#9e7e6b55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(lx,y-r*.86);ctx.lineTo(lx,ly-18);ctx.stroke();
   ctx.fillStyle='#f2c59240';ctx.beginPath();ctx.ellipse(lx,ly,12,18,0,0,TAU);ctx.fill();
   ctx.fillStyle='#ffe4aa66';ctx.beginPath();ctx.ellipse(lx-2,ly-3,4,7,0,0,TAU);ctx.fill();
  }
 }finally{ctx.restore();}
}
