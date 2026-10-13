// Project OHANA · Dragón U (SUPERNOVA CELESTE) readability layer.
// Visual + feedback only: the damage, radius and 12-frame launch contract stay
// in abilities.js (supremeLaunch). Flat strokes/fills, no gradients, <=16 parts.
export function createDragonSupremeEffects(ops){
 const {cx,cy,canHit,add,clamp}=ops;
 const TAU=Math.PI*2;
 const ease=(k)=>1-(1-k)*(1-k);
 return {
  cast(g,p,radius,windup,evo){
   const e=clamp(Number(evo)||0,0,4);
   add({kind:"dragonNovaCharge",x:cx(p),y:cy(p),life:windup,max:windup,
     radius,evo:e,actor:p,room:String(g.roomId||"hub")});
   g.nums?.add?.(cx(p),p.y-58,"¡METEORO!","#ffe27a",true);
  },
  update:{
   dragonNovaCharge(g,f,p){
    if(g.player!==f.actor||p?.dead||String(g.roomId||"hub")!==f.room)return false;
    f.x=cx(p);f.y=cy(p);
    if(--f.life>0)return true;
    // Burst lands on the same frame as supremeLaunch resolves.
    const hits=(g.enemies||[]).filter(e=>canHit(e)&&Math.hypot(cx(e)-f.x,cy(e)-f.y)<=f.radius+Math.max(e.w||0,e.h||0)*.5).slice(0,8);
    for(const e of hits)add({kind:"dragonNovaHit",e,x:cx(e),y:cy(e),life:26,max:26,evo:f.evo});
    add({kind:"dragonNovaBurst",x:f.x,y:f.y,life:72,max:72,radius:f.radius,evo:f.evo});
    g.hitstop=Math.min(8,Math.max(Number(g.hitstop)||0,hits.length?6:3));
    return false;
   },
   dragonNovaBurst(g,f){return --f.life>0;},
   dragonNovaHit(g,f){if(f.e&&!f.e.dead){f.x=cx(f.e);f.y=cy(f.e);}return --f.life>0;},
  },
  draw:{
   dragonNovaCharge(ctx,f,cam,t){
    const x=f.x-(cam?.x||0),y=f.y-(cam?.y||0),k=1-f.life/f.max,s=1+f.evo*.12;
    ctx.save();
    // Ground telegraph: exact launch radius, fills as the wind-up completes.
    ctx.globalAlpha=.25+.45*k;ctx.strokeStyle="#ff6a2a";ctx.lineWidth=3;
    ctx.setLineDash([14,9]);ctx.beginPath();ctx.ellipse(x,y+26,f.radius,f.radius*.28,0,0,TAU);ctx.stroke();
    ctx.setLineDash([]);ctx.globalAlpha=.12+.18*k;ctx.fillStyle="#ff8a3a";
    ctx.beginPath();ctx.ellipse(x,y+26,f.radius*k,f.radius*.28*k,0,0,TAU);ctx.fill();
    // Closing ring + converging embers.
    ctx.globalCompositeOperation="lighter";
    const rr=(150*s)*(1-ease(k))+22*s;
    ctx.globalAlpha=.85;ctx.strokeStyle="#ffd36a";ctx.lineWidth=4+f.evo;
    ctx.beginPath();ctx.arc(x,y,rr,0,TAU);ctx.stroke();
    const n=Math.min(14,6+f.evo*2);
    for(let i=0;i<n;i++){const a=i*TAU/n+t*.05,d=rr*(1.25-.35*k);
     ctx.fillStyle=i%2?"#fff3b0":"#ff4a20";ctx.globalAlpha=.9;
     ctx.beginPath();ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,3+(i%3)+f.evo*.4,0,TAU);ctx.fill();}
    ctx.globalAlpha=.35+.5*k;ctx.fillStyle="#fff6c8";
    ctx.beginPath();ctx.arc(x,y,(8+14*k)*s,0,TAU);ctx.fill();
    ctx.restore();
   },
   dragonNovaBurst(ctx,f,cam,t){
    const x=f.x-(cam?.x||0),y=f.y-(cam?.y||0),k=1-f.life/f.max,fade=1-k,s=1+f.evo*.15;
    ctx.save();ctx.globalCompositeOperation="lighter";
    for(let w=0;w<2;w++){const q=clamp(k*1.6-w*.25,0,1);if(q<=0)continue;
     ctx.globalAlpha=(1-q)*.8;ctx.strokeStyle=w?"#ffd36a":"#ff5a24";ctx.lineWidth=(10-w*4)*(1-q)+2;
     ctx.beginPath();ctx.ellipse(x,y+10,f.radius*(.2+q*.95),f.radius*(.12+q*.5),0,0,TAU);ctx.stroke();}
    const rays=Math.min(14,8+f.evo*2);
    ctx.lineCap="round";
    for(let i=0;i<rays;i++){const a=i*TAU/rays+t*.01,r0=24*s+k*40,r1=r0+(70+f.evo*18)*fade;
     ctx.globalAlpha=.75*fade;ctx.strokeStyle=i%2?"#fff3b0":"#ff8a3a";ctx.lineWidth=(i%2?3:5)*s;
     ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0);ctx.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1);ctx.stroke();}
    ctx.globalAlpha=.55*fade;ctx.fillStyle="#fff1c0";
    ctx.beginPath();ctx.arc(x,y,(30+f.evo*6)*(1-k*.6),0,TAU);ctx.fill();
    ctx.globalCompositeOperation="source-over";
    if(k<.75){ctx.globalAlpha=Math.min(1,fade*1.6);ctx.textAlign="center";
     ctx.font=`900 ${Math.round(22+f.evo*3)}px Outfit,system-ui,sans-serif`;
     ctx.lineWidth=5;ctx.strokeStyle="#5a1a08";ctx.fillStyle="#ffe27a";
     const label=f.evo>=4?"¡SUPERNOVA CELESTIAL!":"¡SUPERNOVA!";
     ctx.strokeText(label,x,y-70-k*20);ctx.fillText(label,x,y-70-k*20);}
    ctx.restore();
   },
   dragonNovaHit(ctx,f,cam){
    const x=f.x-(cam?.x||0),y=f.y-(cam?.y||0),k=1-f.life/f.max;
    ctx.save();ctx.globalAlpha=(1-k)*.9;ctx.strokeStyle="#ffd36a";ctx.lineWidth=4*(1-k)+1;
    ctx.beginPath();ctx.arc(x,y,14+k*(34+f.evo*5),0,TAU);ctx.stroke();
    ctx.strokeStyle="#ff4a20";ctx.lineWidth=3;
    for(let i=0;i<4;i++){const a=i*TAU/4+.4,r=10+k*30;
     ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.lineTo(x+Math.cos(a)*(r+10),y+Math.sin(a)*(r+10));ctx.stroke();}
    ctx.restore();
   },
  },
 };
}
