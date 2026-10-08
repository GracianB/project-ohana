// YOMI · OHANA V56 · gentle lantern guardian (five original Canvas silhouettes).
const PAL=[
  ["#f8e5b9","#d78b69","#f8b567","#52364b"],
  ["#f1d5a5","#c67d69","#ffb35c","#604066"],
  ["#f3cba5","#ad6481","#ed9f6b","#6f467d"],
  ["#edd0bf","#a74668","#ff7580","#7d3b71"],
  ["#fff0d4","#8d3d67","#ffd279","#b9588f"]
];
const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function line(ctx,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";}
function ellipse(ctx,x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);ctx.fill();}
function crescent(ctx,x,y,r,color){
  line(ctx,color,1.6);ctx.beginPath();ctx.arc(x,y,r,-2.66,-.47);ctx.stroke();
}
function sigil(ctx,x,y,k,col){
  ctx.save();ctx.translate(x,y);ctx.rotate(-.12+k*.12);
  ctx.fillStyle="#fff5d8";ctx.strokeStyle=col;ctx.lineWidth=1.6;
  ctx.beginPath();ctx.moveTo(-6,-10);ctx.lineTo(6,-10);ctx.lineTo(6,10);ctx.lineTo(-6,10);ctx.closePath();ctx.fill();ctx.stroke();
  line(ctx,col,1.2);ctx.beginPath();ctx.moveTo(-3,-4);ctx.lineTo(1,-5);ctx.lineTo(-1,1);ctx.lineTo(3,1);ctx.lineTo(0,6);ctx.stroke();
  ctx.restore();
}
function draw(ctx,pose,R){
  const p=pose||{},f=clamp(p.form|0,0,4),t=Number(p.t)||0,st=p.state||"idle";
  const col=PAL[f],paper=col[0],trim=col[1],glow=col[2],shadow=col[3];
  const cast=st==="cast"?(p.castSlot|0):-1,atk=clamp(Number(p.atk)||0,0,1);
  const pulse=.5+.5*Math.sin(t*.095),run=st==="run",flight=st==="jump"||st==="fall"||st==="glide";
  const angry=st==="attack"||cast===2, hurt=st==="hurt"||st==="dead";
  const open=angry?(st==="attack"?atk:.85):st==="victory"?.3:.05;
  const swing=Math.sin(t*(run?.26:.08))*(run?5:2.4)+(Number(p.sway)||0)*3;
  const hover=st==="dead"?1:Math.sin(t*.067)*2.1-(flight?3:0);
  const w=20+f*2.9,h=55+f*4.2;
  const shoulder=-h*.68,faceY=-h*.72;
  ctx.save();ctx.translate(0,hover);ctx.rotate(run?-.085*Math.sin(t*.32):flight?-.045:0);
  // Ribbon tail follows the lantern, not a detached sprite or a duplicated hero.
  ctx.fillStyle=shadow;ctx.globalAlpha=.78;ctx.beginPath();ctx.moveTo(-11,-18);
  ctx.quadraticCurveTo(-29-swing,-9,-22-swing,-1);
  ctx.quadraticCurveTo(-14-swing,7,-8,2);ctx.quadraticCurveTo(-6,-11,-11,-18);ctx.fill();
  ctx.globalAlpha=1;
  if(f===4){
    ctx.save();ctx.globalAlpha=.32+.15*pulse;
    crescent(ctx,0,faceY-4,36+2*pulse,"#ffd988");ctx.restore();
  }
  // The growing cape makes five recognizable stages, from baby to moon guardian.
  ctx.fillStyle=shadow;ctx.beginPath();ctx.moveTo(-w*.71,shoulder+3);
  ctx.quadraticCurveTo(-w-8-swing*.2,-29,-w*.83,-5);
  ctx.quadraticCurveTo(-13,-1,0,-6);
  ctx.quadraticCurveTo(13,-1,w*.83,-5);
  ctx.quadraticCurveTo(w+8+swing*.2,-29,w*.71,shoulder+3);
  ctx.closePath();ctx.fill();line(ctx,"#2a2339",2.5);ctx.stroke();
  if(f>=2){
    ctx.save();ctx.globalAlpha=.8;line(ctx,f>=4?"#ffd58e":"#e28a8d",2);
    ctx.beginPath();ctx.moveTo(-w*.78,-17);ctx.quadraticCurveTo(0,-7,w*.78,-17);ctx.stroke();ctx.restore();
  }
  // Actual foot silhouette: Yomi hovers but retains a clear readable ground anchor.
  ellipse(ctx,-7,0,7,3,shadow);ellipse(ctx,8,0,7,3,shadow);
  // Two animated open sleeves. K's suction visibly pulls them forward.
  for(const side of [-1,1]){
    ctx.save();ctx.translate(side*(w*.77),shoulder+6);
    ctx.rotate(side*((cast===1?.48:run?.22:.12)+Math.sin(t*.075+side)*.07));
    const sleeveLen=19+f*2.9+(cast===1?9:0);
    ctx.fillStyle=shadow;ctx.beginPath();ctx.moveTo(-7,0);
    ctx.quadraticCurveTo(-13,sleeveLen*.5,-10,sleeveLen);
    ctx.quadraticCurveTo(0,sleeveLen+5,11,sleeveLen);
    ctx.quadraticCurveTo(13,sleeveLen*.48,7,0);ctx.closePath();ctx.fill();
    line(ctx,trim,2);ctx.stroke();
    line(ctx,glow,1.7);ctx.beginPath();ctx.moveTo(-9,sleeveLen-3);ctx.quadraticCurveTo(0,sleeveLen,10,sleeveLen-3);ctx.stroke();
    ctx.restore();
  }
  // Lantern-shaped body: hand-painted gold rim, paper ribs and inner flame.
  ctx.fillStyle=paper;ctx.beginPath();
  ctx.moveTo(-w*.77,-h+8);ctx.quadraticCurveTo(-w-2,-h*.52,-w*.82,-19);
  ctx.quadraticCurveTo(-w*.55,-9,0,-8);
  ctx.quadraticCurveTo(w*.55,-9,w*.82,-19);
  ctx.quadraticCurveTo(w+2,-h*.52,w*.77,-h+8);
  ctx.quadraticCurveTo(0,-h-6,-w*.77,-h+8);ctx.closePath();ctx.fill();
  line(ctx,"#35233c",3.2);ctx.stroke();
  ctx.save();ctx.globalAlpha=.13+.07*pulse;
  ellipse(ctx,0,-h*.41,w*.69,h*.30,glow);ctx.restore();
  line(ctx,trim,1.45);
  for(const i of [-1,1]){
    ctx.beginPath();ctx.moveTo(i*w*.57,-h+11);
    ctx.quadraticCurveTo(i*w*.82,-h*.5,i*w*.52,-17);ctx.stroke();
  }
  line(ctx,trim,3);ctx.beginPath();ctx.moveTo(-w*.67,-h+5);
  ctx.quadraticCurveTo(0,-h+1,w*.67,-h+5);ctx.stroke();
  // Cap and top-knot: each evolution gets a clearer signature silhouette.
  ellipse(ctx,0,-h-2,w*.71,4.8,shadow);
  ellipse(ctx,0,-h-5,w*.42,3.3,glow);
  if(f>=1){
    line(ctx,trim,2.1);ctx.beginPath();ctx.moveTo(0,-h-7);
    ctx.quadraticCurveTo(swing*.2,-h-15,0,-h-19);ctx.stroke();
    ellipse(ctx,0,-h-20,3.3+f*.3,3.3+f*.3,glow);
  }
  if(f>=2){
    for(const side of [-1,1]){
      ctx.save();ctx.translate(side*(w*.53),-h-5);
      ctx.rotate(side*.22);ctx.fillStyle=trim;ctx.beginPath();
      ctx.moveTo(-5,0);ctx.quadraticCurveTo(-9,-11,-2,-17-f*2);
      ctx.quadraticCurveTo(7,-12,6,0);ctx.closePath();ctx.fill();ctx.restore();
    }
  }
  // Expressive OHANA face, never permanent horror teeth.
  const mood=hurt?"closed":angry?"angry":st==="victory"?"happy":"normal";
  const eyeSize=f===0?6.5:6+f*.15;
  R.eye(ctx,-8,faceY,eyeSize,p,{iris:f===4?"#a94568":"#60334b",mood});
  R.eye(ctx,9,faceY,eyeSize*.92,p,{iris:f===4?"#a94568":"#60334b",mood});
  if(!angry){
    ellipse(ctx,-w*.49,faceY+9,3.5,2.1,"#ef9fa0");
    ellipse(ctx,w*.49,faceY+9,3.5,2.1,"#ef9fa0");
  }
  ctx.fillStyle=angry?"#592943":"#94536b";ctx.beginPath();
  ctx.ellipse(1,faceY+13,angry?6+open*8:4.8,angry?4+open*7:2.4,0,0,TAU);ctx.fill();
  if(angry&&f>=3){
    ctx.fillStyle="#fff4d8";for(let i=-1;i<=1;i++){
      ctx.beginPath();ctx.moveTo(i*6,faceY+8);ctx.lineTo(i*6+2,faceY+12+open*5);
      ctx.lineTo(i*6+4,faceY+8);ctx.fill();
    }
  }
  if(f>=3){
    line(ctx,trim,1.8);ctx.beginPath();ctx.moveTo(w*.26,faceY-18);
    ctx.lineTo(w*.08,faceY-11);ctx.lineTo(w*.31,faceY-5);ctx.stroke();
  }
  // Warm lantern heart stays visible on every stage.
  ellipse(ctx,0,-25,7+f*.5,9+f*.3,glow);
  ctx.fillStyle=f>=3?"#fff4d0":"#ffedaa";ctx.beginPath();
  ctx.moveTo(0,-34);ctx.quadraticCurveTo(-7,-23,0,-18);
  ctx.quadraticCurveTo(9,-24,0,-34);ctx.fill();
  // J throws a horizontal paper seal; the hand no longer points skyward.
  if(cast===0) {
    const k=clamp(Number(p.cast)||0,0,1);
    const x=w+7+Math.sin(Math.PI*k)*9;
    sigil(ctx,x,shoulder+13,k,f>=3?"#b74469":"#bd704a");
    line(ctx,glow,1.8);ctx.beginPath();ctx.moveTo(w*.7,shoulder+13);
    ctx.quadraticCurveTo(w+3,shoulder+10,x-8,shoulder+13);ctx.stroke();
  }
  if(cast===1){
    ctx.save();ctx.globalAlpha=.35+.22*pulse;line(ctx,"#f6c39f",2);
    ctx.beginPath();ctx.ellipse(w+10,shoulder+18,14+5*pulse,9+3*pulse,0,0,TAU);ctx.stroke();ctx.restore();
  }
  if(st==="victory"||((p.flourishN||0)%4===3&&p.flourish>0)){
    const v=st==="victory"?pulse:Math.sin(Math.PI*clamp(p.flourish,0,1));
    ctx.save();ctx.globalAlpha=.4*v;crescent(ctx,w+5,faceY-19,9+f,glow);ctx.restore();
  }
  ctx.restore();
}
export default {id:"yomi",draw};
