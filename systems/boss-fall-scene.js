// OHANA V100 ESPECIAL · Queen's one-and-only death sequence.
// No floating halo, no duplicate scene: body -> cracks -> fragmentation -> Hoku.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number(x)||0));
export function bossFallStage(fall){
  const progress=clamp(1-(fall?.t||0)/Math.max(1,fall?.max||1),0,1);
  return {
    progress,
    queenVisible: progress<.36,
    fracture:clamp((progress-.16)/.20,0,1),
    burst:clamp((progress-.35)/.42,0,1),
    dust:1-clamp((progress-.77)/.20,0,1)
  };
}
export function drawBossFallScene(ctx,fall,camera,view,reduce=false){
  if(!ctx||!fall||!(fall.t>0))return;
  const s=bossFallStage(fall),{progress:k}=s;
  const x=fall.x-(camera?.x||0),y=fall.y-(camera?.y||0);
  const W=view?.w||1280,H=view?.h||720;
  ctx.save();
  // Darken the combat arena progressively, but never erase the Queen.
  ctx.fillStyle="rgba(5,9,20,"+(.10+.44*k)+")";
  ctx.fillRect(0,0,W,H);
  if(k<.36){
    // Fractures follow the actual boss while it is visible.
    const cracks=reduce?4:9;
    ctx.save();ctx.globalAlpha=s.fracture*.9;
    for(let i=0;i<cracks;i++){
      const a=i*2.39996,reach=(24+i%3*12)*(1+s.fracture*.6);
      ctx.strokeStyle=i%2?"#f9c99d":"#b8e6ff";
      ctx.lineWidth=1.3+(i%3)*.6;ctx.beginPath();ctx.moveTo(x,y);
      ctx.lineTo(x+Math.cos(a)*reach*.5,y+Math.sin(a)*reach*.5);
      ctx.lineTo(x+Math.cos(a+.13)*reach,y+Math.sin(a+.13)*reach);
      ctx.stroke();
    }
    ctx.restore();
  }else{
    // Deterministic 26-piece breakup, without physics or enormous particle pools.
    const fragments=reduce?10:26;
    const p=s.burst;
    ctx.save();ctx.globalCompositeOperation="lighter";
    ctx.globalAlpha=s.dust*(1-.24*p);
    for(let i=0;i<fragments;i++){
      const a=i*2.39996323,ring=13+(i%7)*9;
      const dist=ring+p*(75+(i%6)*27);
      const px=x+Math.cos(a)*dist;
      const py=y+Math.sin(a)*dist+p*p*(28+(i%5)*18);
      const radius=(4+i%5*2)*(1-.65*p);
      ctx.save();ctx.translate(px,py);ctx.rotate(a+p*3.2);
      ctx.fillStyle=i%4===0?"#ff718b":i%4===1?"#ffc878":i%4===2?"#9fe4ff":"#f5e7ce";
      ctx.beginPath();ctx.moveTo(-radius,-radius*.8);
      ctx.lineTo(radius*.9,-radius*.35);
      ctx.lineTo(radius*.3,radius);
      ctx.lineTo(-radius*.65,radius*.4);
      ctx.closePath();ctx.fill();ctx.restore();
    }
    ctx.restore();
    if(p>.3){
      const light=ctx.createRadialGradient(x,y,0,x,y,Math.max(140,W*.24));
      light.addColorStop(0,"rgba(255,221,162,"+(.28*(1-p))+")");
      light.addColorStop(1,"rgba(255,221,162,0)");
      ctx.fillStyle=light;ctx.fillRect(0,0,W,H);
    }
  }
  // Same frame holds the bridge into the single family cinematic.
  if(k>.68){
    ctx.save();ctx.globalAlpha=clamp((k-.68)/.22,0,1);
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.font="800 "+Math.min(34,Math.max(18,W*.035))+"px Outfit, sans-serif";
    ctx.fillStyle="#fff1d2";
    ctx.fillText("EL NIDO SE ABRE",W/2,H*.23,W*.90);
    ctx.restore();
  }
  ctx.restore();
}
