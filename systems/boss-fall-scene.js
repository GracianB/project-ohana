// OHANA V86 - The Queen's fall is an opening in the Nido, not a golden circle.
// All geometry is deterministic Canvas rendering; gameplay stays untouched.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number(x)||0));
export function drawBossFallScene(ctx,fall,camera,view,reduce=false){
  if(!ctx||!fall||!(fall.t>0))return;
  const k=clamp(1-fall.t/Math.max(1,fall.max),0,1);
  const x=fall.x-(camera?.x||0),y=fall.y-(camera?.y||0);
  const W=view?.w||1280,H=view?.h||720,bloom=clamp(k/.46,0,1);
  ctx.save();
  const shade=ctx.createLinearGradient(0,0,0,H);
  shade.addColorStop(0,"rgba(4,6,16,"+(.18+.65*k)+")");
  shade.addColorStop(1,"rgba(17,6,24,"+(.27+.48*k)+")");
  ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
  const light=ctx.createLinearGradient(x-140,y-150,x+140,y+260);
  light.addColorStop(0,"rgba(255,212,125,0)");
  light.addColorStop(.46,"rgba(255,230,183,"+(.17+.40*bloom)+")");
  light.addColorStop(1,"rgba(255,116,101,0)");
  ctx.save();ctx.globalCompositeOperation="lighter";ctx.fillStyle=light;
  // Two luminous wings part the darkness around the defeated Queen.
  ctx.beginPath();ctx.moveTo(x,y-120*bloom);
  ctx.bezierCurveTo(x-75*bloom,y-190*bloom,x-155*bloom,y-45,x-220*bloom,y+175);
  ctx.quadraticCurveTo(x,y+100,x+220*bloom,y+175);
  ctx.bezierCurveTo(x+155*bloom,y-45,x+75*bloom,y-190*bloom,x,y-120*bloom);
  ctx.closePath();ctx.fill();
  const pieces=reduce?7:15;
  for(let i=0;i<pieces;i++){
    const side=i%2?-1:1,depth=1+Math.floor(i/2);
    const px=x+side*(26+depth*21+100*k);
    const py=y-82+((i*53)%91)+k*(70+depth*19);
    const size=3+(i%4)*3;
    ctx.globalAlpha=(1-clamp((k-.70)/.30,0,1))*(.28+(i%3)*.13);
    ctx.fillStyle=i%3===0?"#ffe4a4":i%3===1?"#ff8c79":"#c5e7fc";
    ctx.beginPath();ctx.moveTo(px,py-size);
    ctx.lineTo(px+size*.6,py);
    ctx.lineTo(px,py+size*1.3);
    ctx.lineTo(px-size*.7,py+size*.15);
    ctx.closePath();ctx.fill();
  }
  ctx.restore();ctx.restore();
}
