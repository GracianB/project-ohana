// ============================================================================
// MICHI · GATO KAWAII · RENDER V3
// ============================================================================
// Diseño visual:
//   - Kawaii extremo: cabeza enorme, cuerpo mini, ojos tipo anime.
//   - Silueta redonda/adorable, patas diminutas y barriga visible.
//   - Orejas suaves, mejillas rosadas, nariz corazón y boca pequeña.
//   - Accesorios pastel por evolución.
//   - Animaciones compatibles con idle/run/jump/fall/glide/attack/cast/victory/
//     hurt/dead/wall.
//   - Sin dependencias obligatorias del renderer auxiliar.
// ============================================================================

const TAU = Math.PI * 2;
const INK = "#48263f";
const SOFT_INK = "#80536f";

const PAL = [
  { fur:"#ffd9eb", belly:"#fff8fc", ear:"#ff9cc8", inner:"#ffc1dc", accent:"#ff5f9e", iris:"#7952d9", tail:"#ff9cc8" },
  { fur:"#ffc7e2", belly:"#fff5fa", ear:"#ff8fbe", inner:"#ffb8d6", accent:"#ff4d92", iris:"#7046df", tail:"#ff8fbe" },
  { fur:"#ffb9dc", belly:"#fff2f9", ear:"#ff7db5", inner:"#ffa9cf", accent:"#6dd8ff", iris:"#397fe5", tail:"#ff8bc0" },
  { fur:"#d9c8ff", belly:"#faf6ff", ear:"#ae91ff", inner:"#cbb9ff", accent:"#ffd85b", iris:"#5d49d3", tail:"#ae91ff" },
  { fur:"#fff9fd", belly:"#ffffff", ear:"#ffb5d8", inner:"#ffd5e8", accent:"#ffd04d", iris:"#df4a9d", tail:"#ffd0e6" }
];

function num(v, d=0){ return Number.isFinite(v) ? v : d; }
function clamp(v,a,b){ return Math.max(a, Math.min(b, num(v,a))); }
function formOf(p){ return clamp(Math.floor(num(p?.form,0)),0,PAL.length-1); }
function timeOf(p){ return num(p?.t,0); }
function stateOf(p){ return typeof p?.state === "string" ? p.state : "idle"; }
function val(p,k,d=0){ return num(p?.[k],d); }

function line(ctx,w=2.5,color=INK){
  ctx.lineWidth=w;
  ctx.strokeStyle=color;
  ctx.lineJoin="round";
  ctx.lineCap="round";
  ctx.stroke();
}

function ellipse(ctx,x,y,rx,ry,fill,rot=0,lw=2.5){
  ctx.beginPath();
  ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU);
  ctx.fillStyle=fill;
  ctx.fill();
  if(lw>0) line(ctx,lw);
}

function circle(ctx,x,y,r,fill,lw=0){
  ctx.beginPath();
  ctx.arc(x,y,Math.max(.1,r),0,TAU);
  ctx.fillStyle=fill;
  ctx.fill();
  if(lw>0) line(ctx,lw);
}

function gradient(ctx,x,y,r,color,R){
  if(!R?.lighten || !R?.darken) return color;
  const g=ctx.createRadialGradient(x-r*.35,y-r*.42,r*.04,x,y,r*1.12);
  g.addColorStop(0,R.lighten(color,.35));
  g.addColorStop(.58,color);
  g.addColorStop(1,R.darken(color,.10));
  return g;
}

function heart(ctx,x,y,s,fill){
  s=Math.max(.5,num(s,1));
  ctx.beginPath();
  ctx.moveTo(x,y+s*.92);
  ctx.bezierCurveTo(x-s*1.35,y-s*.05,x-s*.72,y-s*1.08,x,y-s*.30);
  ctx.bezierCurveTo(x+s*.72,y-s*1.08,x+s*1.35,y-s*.05,x,y+s*.92);
  ctx.closePath();
  ctx.fillStyle=fill;
  ctx.fill();
  line(ctx,Math.max(1,s*.18));
}

function star(ctx,x,y,r,fill){
  ctx.beginPath();
  for(let i=0;i<10;i++){
    const a=-Math.PI/2+i*Math.PI/5;
    const rr=i%2?r:r*.42;
    const px=x+Math.cos(a)*rr, py=y+Math.sin(a)*rr;
    i?ctx.lineTo(px,py):ctx.moveTo(px,py);
  }
  ctx.closePath();
  ctx.fillStyle=fill;
  ctx.fill();
  line(ctx,1.5);
}

function sparkle(ctx,x,y,s,fill="#fff"){
  s=Math.max(1,num(s,1));
  ctx.beginPath();
  ctx.moveTo(x,y-s); ctx.quadraticCurveTo(x,y,x+s,y);
  ctx.quadraticCurveTo(x,y,x,y+s); ctx.quadraticCurveTo(x,y,x-s,y);
  ctx.quadraticCurveTo(x,y,x,y-s); ctx.fillStyle=fill; ctx.fill();
}

function drawEar(ctx,x,y,s,side,c,state,time){
  const flap=state==="hurt" ? .28 : Math.sin(time*.07+side)>.985 ? .12 : 0;
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(side*flap);
  ctx.beginPath();
  ctx.moveTo(-s*.48,s*.34);
  ctx.quadraticCurveTo(-s*.42,-s*.48,0,-s*.78);
  ctx.quadraticCurveTo(s*.42,-s*.48,s*.48,s*.34);
  ctx.quadraticCurveTo(0,s*.58,-s*.48,s*.34);
  ctx.closePath();
  ctx.fillStyle=gradient(ctx,0,0,s,c.ear,null);
  ctx.fill();
  line(ctx,2.7);

  ctx.beginPath();
  ctx.moveTo(-s*.25,s*.20);
  ctx.quadraticCurveTo(-s*.20,-s*.32,0,-s*.52);
  ctx.quadraticCurveTo(s*.20,-s*.32,s*.25,s*.20);
  ctx.quadraticCurveTo(0,s*.34,-s*.25,s*.20);
  ctx.closePath();
  ctx.fillStyle=c.inner;
  ctx.fill();
  line(ctx,1.2,SOFT_INK);
  ctx.restore();
}

function drawEye(ctx,x,y,r,iris,mood,side,blink=0){
  r=Math.max(5,num(r,5));
  if(mood==="heart"){
    heart(ctx,x,y,r*.62,side<0?"#ff5a9d":"#ff7ab5");
    return;
  }
  if(mood==="hurt"){
    ctx.beginPath();
    ctx.moveTo(x-r*.55,y-r*.48); ctx.lineTo(x+r*.55,y+r*.48);
    ctx.moveTo(x+r*.55,y-r*.48); ctx.lineTo(x-r*.55,y+r*.48);
    line(ctx,r*.22);
    return;
  }
  if(mood==="closed" || blink>.78){
    ctx.beginPath();
    ctx.arc(x,y+r*.08,r*.72,Math.PI*1.10,Math.PI*1.90);
    line(ctx,r*.20);
    return;
  }
  if(mood==="swirl"){
    ctx.beginPath();
    for(let i=0;i<24;i++){
      const a=i*.48, rr=r*.04+i*r*.022;
      const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;
      i?ctx.lineTo(px,py):ctx.moveTo(px,py);
    }
    line(ctx,1.7);
    return;
  }

  const h=r*1.15*(1-clamp(blink,0,1)*.68);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x,y,r*.92,Math.max(1,h),0,0,TAU);
  ctx.fillStyle="#fff";
  ctx.fill();
  line(ctx,Math.max(1.7,r*.14));
  ctx.clip();

  ctx.beginPath();
  ctx.ellipse(x,y+h*.06,r*.50,h*.64,0,0,TAU);
  ctx.fillStyle=iris;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x,y+h*.11,r*.235,h*.42,0,0,TAU);
  ctx.fillStyle="#17111b";
  ctx.fill();

  circle(ctx,x-r*.23,y-r*.29,r*.21,"#fff");
  circle(ctx,x+r*.22,y+r*.18,r*.085,"#fff");
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(x+side*r*.58,y-r*.66);
  ctx.lineTo(x+side*r*.93,y-r*.87);
  line(ctx,Math.max(1.2,r*.10));
}

function drawMouth(ctx,y,size,open,mood){
  size=Math.max(2,num(size,5));
  if(mood==="hurt"){
    ctx.beginPath();
    ctx.moveTo(-size*.65,y+2);
    ctx.quadraticCurveTo(0,y-size*.35,size*.65,y+2);
    line(ctx,1.8);
    return;
  }
  if(open>.08){
    const h=size*(.50+open*1.0);
    ctx.beginPath();
    ctx.moveTo(-size*.65,y);
    ctx.quadraticCurveTo(0,y+h,size*.65,y);
    ctx.closePath();
    ctx.fillStyle="#a9345c";
    ctx.fill();
    line(ctx,1.7);
    ellipse(ctx,0,y+h*.70,size*.30,size*.18,"#ff8eae",0,0);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(-size*.58,y);
  ctx.quadraticCurveTo(-size*.25,y+size*.43,0,y+size*.03);
  ctx.quadraticCurveTo(size*.25,y+size*.43,size*.58,y);
  line(ctx,1.8);
}

function drawCheekTufts(ctx,r,c,state){
  const a = state === "hurt" ? 0.45 : 0.18;
  ctx.save();
  ctx.globalAlpha = 0.9;
  for (const side of [-1,1]) {
    for (let i=0;i<3;i++) {
      const yy = r*.16 + i*r*.11;
      ctx.beginPath();
      ctx.moveTo(side*r*.82, yy);
      ctx.quadraticCurveTo(side*r*(1.00+i*.035), yy-r*.06, side*r*(.88+i*.06), yy+r*.10);
      ctx.quadraticCurveTo(side*r*(1.06+i*.04), yy+r*.05, side*r*.84, yy+r*.18);
      ctx.closePath();
      ctx.fillStyle = c.fur;
      ctx.globalAlpha = 0.82-a+i*.06;
      ctx.fill();
      line(ctx,1.35);
    }
  }
  ctx.restore();
}

function drawChestFluff(ctx,r,c){
  ctx.save();
  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.moveTo(-r*.34,r*.70);
  ctx.quadraticCurveTo(-r*.20,r*.96,0,r*.88);
  ctx.quadraticCurveTo(r*.20,r*.96,r*.34,r*.70);
  ctx.quadraticCurveTo(r*.18,r*.80,0,r*.70);
  ctx.quadraticCurveTo(-r*.18,r*.80,-r*.34,r*.70);
  ctx.closePath();
  ctx.fill();
  line(ctx,1.8,SOFT_INK);
  ctx.restore();
}

function drawEyeBrow(ctx,x,y,r,side,emotion){
  ctx.save();
  ctx.strokeStyle = SOFT_INK;
  ctx.lineWidth = Math.max(1.1,r*.075);
  ctx.lineCap = "round";
  ctx.beginPath();
  if(emotion === "sad") {
    ctx.moveTo(x-side*r*.32,y);
    ctx.quadraticCurveTo(x,y+side*r*.12,x+side*r*.32,y-r*.02);
  } else {
    ctx.moveTo(x-side*r*.30,y+side*r*.03);
    ctx.quadraticCurveTo(x,y-r*.10,x+side*r*.30,y+side*r*.03);
  }
  ctx.stroke();
  ctx.restore();
}

function drawHeadHighlight(ctx,r){
  ctx.save();
  ctx.globalAlpha=.24;
  ctx.fillStyle="#fff";
  ctx.beginPath();
  ctx.ellipse(-r*.42,-r*.43,r*.20,r*.11,-.35,0,TAU);
  ctx.fill();
  ctx.restore();
}

function drawFace(ctx,p,c,r,state,form,time){
  let mood="normal";
  if(state==="dead") mood="swirl";
  else if(state==="hurt") mood="hurt";
  else if(state==="victory" || val(p,"nineLives",0)>0) mood="heart";
  else if(state==="idle" && Math.sin(time*.035)>.995) mood="closed";

  const er=r*.285;
  drawEye(ctx,-r*.37,0,er,c.iris,mood,-1,val(p,"blink",0));
  drawEye(ctx, r*.37,0,er,c.iris,mood, 1,val(p,"blink",0));

  ctx.save();
  ctx.globalAlpha=.34;
  circle(ctx,-r*.60,r*.31,r*.145,"#ff75a9");
  circle(ctx, r*.60,r*.31,r*.145,"#ff75a9");
  ctx.restore();

  heart(ctx,0,r*.30,Math.max(2.5,r*.065),"#ff659d");

  let open=0;
  if(state==="attack") open=.45+Math.sin(clamp(val(p,"atk",0),0,1)*Math.PI)*.35;
  if(state==="hurt") open=.35;
  if(state==="victory") open=.65;
  if(state==="cast") open=.30;

  drawMouth(ctx,r*.46,r*.19,open,mood);

  ctx.save();
  ctx.globalAlpha=.72;
  ctx.strokeStyle=SOFT_INK;
  ctx.lineWidth=1.15;
  for(const side of [-1,1]){
    for(let i=0;i<3;i++){
      const yy=r*.36+(i-1)*5;
      ctx.beginPath();
      ctx.moveTo(side*r*.48,yy);
      ctx.quadraticCurveTo(side*r*.76,yy-2,side*r*(1.02+i*.035),yy+(i-1)*4);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBow(ctx,x,y,color){
  for(const side of [-1,1]){
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.quadraticCurveTo(x+side*13,y-11,x+side*14,y);
    ctx.quadraticCurveTo(x+side*11,y+8,x,y);
    ctx.closePath();
    ctx.fillStyle=color;
    ctx.fill();
    line(ctx,1.5);
  }
  circle(ctx,x,y,3.6,"#ffd84d",1.3);
}

function drawCrown(ctx,x,y){
  ctx.beginPath();
  ctx.moveTo(x-17,y+8); ctx.lineTo(x-13,y-8); ctx.lineTo(x-5,y+1);
  ctx.lineTo(x,y-12); ctx.lineTo(x+5,y+1); ctx.lineTo(x+14,y-8); ctx.lineTo(x+17,y+8);
  ctx.closePath();
  ctx.fillStyle="#ffd65a"; ctx.fill();
  line(ctx,1.8);
}

function drawAccessory(ctx,form,r,time){
  if(form===0 || form===1){
    drawBow(ctx,-r*.64,-r*.70,PAL[form].accent);
  } else if(form===2){
    sparkle(ctx,-r*.60,-r*.78,7,"#70d8ff");
    sparkle(ctx,r*.76,-r*.65,4,"#fff2a8");
  } else if(form===3){
    drawCrown(ctx,-r*.45,-r*.78);
  } else {
    drawCrown(ctx,0,-r*.88);
    ctx.beginPath();
    ctx.arc(0,-r*1.22,r*.70,0,TAU);
    line(ctx,2.5,"#ffd65a");
    for(let i=0;i<8;i++){
      const a=time*.03+i*TAU/8;
      sparkle(ctx,Math.cos(a)*r*1.05,-r*1.22+Math.sin(a)*r*.82,2.5,"#fff3a8");
    }
  }
}

function drawTail(ctx,x,y,length,angle,color,time,form){
  const sway=Math.sin(time*.09)*.20;
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(angle+sway);
  ctx.lineCap="round";
  ctx.lineWidth=14+form*1.8;
  ctx.strokeStyle=INK;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.bezierCurveTo(length*.25,-length*.18,length*.62,length*.18,length,0);
  ctx.stroke();
  ctx.lineWidth=9+form*1.5;
  ctx.strokeStyle=color;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.bezierCurveTo(length*.25,-length*.18,length*.62,length*.18,length,0);
  ctx.stroke();
  ctx.restore();
  return [x+Math.cos(angle+sway)*length,y+Math.sin(angle+sway)*length];
}

function paw(ctx,x,y,len,angle,color){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(-5,0);
  ctx.quadraticCurveTo(-7,len*.72,-4,len);
  ctx.quadraticCurveTo(0,len+3,4,len);
  ctx.quadraticCurveTo(7,len*.72,5,0);
  ctx.closePath();
  ctx.fillStyle=color;
  ctx.fill();
  line(ctx,2.3);
  circle(ctx,0,len-2,2.2,"#ff8db6");
  ctx.restore();
}

function raisedPaw(ctx,x,y,angle,len,color){
  const ex=x+Math.sin(angle)*len, ey=y-Math.cos(angle)*len;
  ctx.save();
  ctx.lineCap="round";
  ctx.lineWidth=15; ctx.strokeStyle=INK;
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(ex,ey); ctx.stroke();
  ctx.lineWidth=10; ctx.strokeStyle=color;
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(ex,ey); ctx.stroke();
  circle(ctx,ex,ey,4,"#ff8db6");
  circle(ctx,ex-3,ey-4,1.3,"#ff8db6");
  circle(ctx,ex,ey-5,1.3,"#ff8db6");
  circle(ctx,ex+3,ey-4,1.3,"#ff8db6");
  ctx.restore();
}

function drawBody(ctx,p,c,form,state,time,rx,ry,bodyY,leg){
  const phase=val(p,"phase",0);
  const run=state==="run";
  const air=["jump","fall","glide"].includes(state);
  const swing=(off)=>run?Math.sin(phase*2+off)*.42:air?(val(p,"vy",0)<0?-.22:.22):0;

  // Cola primero, porque las extremidades no deberían salir mágicamente por delante.
  const tails=form===0?1:form===1?1:form===2?2:form===3?3:4;
  for(let i=0;i<tails;i++){
    const spread=(i-(tails-1)/2)*.27;
    const end=drawTail(ctx,-rx*.72,bodyY-ry*.05,28+form*5,-Math.PI/2-.48+spread,c.tail,time,form);
    heart(ctx,end[0],end[1],4.6,form>=3?"#ffd65a":c.accent);
  }

  // Patas traseras pequeñas, redondeadas.
  paw(ctx,-rx*.48,0,leg+2,swing(Math.PI),c.fur);
  paw(ctx, rx*.48,0,leg+2,swing(0),c.fur);

  // Cuerpo mini y muy redondo.
  const breath=clamp(val(p,"breath",0),-1,1);
  ctx.save();
  ctx.translate(0,bodyY+ry);
  const squ=state==="dead"?.68:1+breath*.018;
  ctx.scale(1/squ,squ);
  ctx.translate(0,-ry);
  ellipse(ctx,0,0,rx,ry,gradient(ctx,0,0,Math.max(rx,ry),c.fur,null),0,2.8);
  ellipse(ctx,rx*.10,ry*.20,rx*.54,ry*.52,c.belly,0,0);
  ctx.restore();

  // Barriga/corazón decorativo.
  if(form>=2){
    heart(ctx,rx*.10,bodyY+ry*.22,3.8,form===4?"#ffd65a":"#ffb1d4");
  }

  // Patas delanteras.
  paw(ctx,-rx*.38,0,leg+2,swing(Math.PI*.5),c.fur);

  const atk=clamp(val(p,"atk",0),0,1);
  const cast=clamp(val(p,"cast",0),0,1);
  const slot=Math.floor(val(p,"castSlot",0));
  let raised=null;

  if(state==="attack") raised=[-.30+atk*2.25,20];
  else if(state==="cast" && slot===0) raised=[2.25-cast*1.45,20];
  else if(state==="cast" && slot===2) raised=[2.75,21];
  else if(state==="victory") raised=[2.55+Math.sin(time*.28)*.35,20];
  else if(state==="wall") raised=[1.35,18];

  if(raised) raisedPaw(ctx,rx*.48,bodyY-2,raised[0],raised[1]+form,c.fur);
  else paw(ctx,rx*.40,0,leg+2,swing(Math.PI),c.fur);
}

function drawHead(ctx,p,c,form,r,x,y,tilt,state,time){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(tilt);

  // Orejas detrás.
  drawEar(ctx,-r*.59,-r*.61,r*.74,-1,c,state,time);
  drawEar(ctx, r*.59,-r*.61,r*.74, 1,c,state,time);

  // Cabeza enorme. El objetivo es parecer un mochi, no un gato de anatomía realista.
  ellipse(ctx,0,0,r*1.14,r,c.fur,0,3.1);

  // Luz central para efecto de peluche.
  ctx.save();
  ctx.globalAlpha=.18;
  ellipse(ctx,-r*.10,-r*.04,r*.82,r*.68,"#fff",-.05,0);
  ctx.restore();

  // Mechoncito superior.
  ctx.beginPath();
  ctx.moveTo(-r*.28,-r*.82);
  ctx.quadraticCurveTo(-r*.12,-r*1.05,0,-r*.84);
  ctx.quadraticCurveTo(r*.15,-r*1.06,r*.30,-r*.80);
  line(ctx,2.1);

  drawCheekTufts(ctx,r,c,state);\n  drawFace(ctx,p,c,r,state,form,time);\n  drawChestFluff(ctx,r,c);\n  drawHeadHighlight(ctx,r);
  drawAccessory(ctx,form,r,time);

  // Collar/cascabel.
  if(form<=2){
    ctx.beginPath();
    ctx.moveTo(-r*.28,r*.86);
    ctx.quadraticCurveTo(0,r*1.02,r*.28,r*.86);
    line(ctx,4,c.accent);
    circle(ctx,0,r*.94,4.5,"#ffd84d",1.5);
    circle(ctx,0,r*.96,1.1,"#8a5a22");
  }

  if(state==="hurt"){
    ctx.beginPath();
    ctx.moveTo(-r*.42,r*.34);
    ctx.quadraticCurveTo(-r*.50,r*.52,-r*.39,r*.59);
    ctx.quadraticCurveTo(-r*.29,r*.51,-r*.42,r*.34);
    ctx.fillStyle="#86d9ff"; ctx.fill();
  }

  ctx.restore();
}

function castEffects(ctx,p,form,x,y,r,bodyY,state,time){
  if(state!=="cast") return;
  const slot=Math.floor(val(p,"castSlot",0));
  const cast=clamp(val(p,"cast",0),0,1);

  if(slot===0){
    const px=x+22+cast*26, py=bodyY-28-Math.sin(cast*Math.PI)*15;
    heart(ctx,px,py,4.5,"#ff79b2");
    sparkle(ctx,px+10,py-10,2.5,"#fff");
  } else if(slot===1){
    for(let i=0;i<5;i++){
      const k=(cast+i*.20)%1;
      heart(ctx,x+12+i*7,y-r-k*30,2.8+k*1.7,i%2?"#ffc2df":"#ff8ab9");
    }
  } else {
    for(let i=0;i<10;i++){
      const a=i/10*TAU+time*.10;
      sparkle(ctx,x+Math.cos(a)*46,bodyY-18+Math.sin(a)*32,2.5+cast*2,i%2?"#fff0a8":"#ffb6df");
    }
  }
}

function attackEffect(ctx,p,x,bodyY,state){
  if(state!=="attack") return;
  const a=clamp(val(p,"atk",0),0,1);
  const alpha=Math.sin(a*Math.PI);
  if(alpha<=0) return;
  ctx.save();
  ctx.globalAlpha=alpha;
  ctx.beginPath();
  ctx.arc(x+8,bodyY-12,28,-1.2,.65);
  line(ctx,4.5,"#ff9fd0");
  heart(ctx,x+37,bodyY-23,4.2,"#ff579d");
  ctx.restore();
}

function victoryEffects(ctx,form,time){
  for(let i=0;i<7;i++){
    const a=time*.045+i*TAU/7;
    sparkle(ctx,Math.cos(a)*55,-65+Math.sin(a*1.25)*38,2.5+Math.sin(time*.2+i)*1.1,i%2?"#fff1b0":"#ffd1e7");
  }
  if(form===4){
    for(let i=0;i<3;i++) heart(ctx,Math.cos(time*.04+i)*35,-45+Math.sin(time*.07+i)*22,3.5,"#ffb6d9");
  }
}

function nineLives(ctx,p,x,y,r,time){
  const life=clamp(val(p,"nineLives",0),0,100);
  if(life<=0) return;
  ctx.save();
  ctx.globalAlpha=clamp(life/18,0,1);
  for(let i=0;i<9;i++){
    const a=time*.08+i*TAU/9;
    heart(ctx,x+Math.cos(a)*(r+10),y-r*.10+Math.sin(a)*r*.58,2.7,i%2?"#fff0ad":"#ff91c7");
  }
  ctx.restore();
}

function idleFlourish(ctx,p,form,x,y,r,time,state){
  if(state!=="idle") return;
  const f=clamp(val(p,"flourish",0),0,1);
  if(f<=0) return;
  const n=Math.floor(val(p,"flourishN",0));

  if(n%3===1){
    const bx=x+28+Math.sin(f*TAU*2)*14;
    const by=y-r-8+Math.cos(f*TAU*3)*8;
    const wing=Math.abs(Math.sin(time*.6))*5+2;
    ellipse(ctx,bx-wing*.6,by,wing,4,"#a9e5ff",-0.4,0);
    ellipse(ctx,bx+wing*.6,by,wing,4,"#ffc0df",0.4,0);
    line(ctx,1.3);
  }

  if(form===2){
    sparkle(ctx,-34,-r-38,3,"#fff");
    sparkle(ctx,34,-r-34,4,"#dff7ff");
  }
}

function draw(ctx,pose={},R={}){
  if(!ctx?.save) return;

  const form=formOf(pose);
  const c=PAL[form];
  const state=stateOf(pose);
  const time=timeOf(pose);
  const run=state==="run";

  const headR=[54,57,60,63,67][form];
  const bodyRX=[22,25,28,31,35][form];
  const bodyRY=[17,19,22,25,28][form];
  const leg=[9,10,11,12,13][form];

  const phase=val(pose,"phase",0);
  const bounce=val(pose,"bounce",0);

  let hop=0;
  if(run) hop=-Math.max(0,Math.sin(phase*2))*5;
  if(state==="victory") hop=-Math.abs(Math.sin(time*.18))*10;
  if(state==="dead") hop=4;

  const bodyY=-leg-bodyRY*.82;
  const headX=4+(run?2:0);
  let headY=bodyY-bodyRY*.22-headR*.72+bounce*1.6;
  if(form===0) headY+=5;

  let tilt=Math.sin(time*.045)*.045+val(pose,"sway",0)*.04;
  if(state==="hurt") tilt=-.16;
  if(state==="cast") tilt=.07;
  if(state==="victory") tilt=Math.sin(time*.13)*.06;

  ctx.save();
  try{
    ctx.translate(0,hop);
    if(state==="dead"){ ctx.translate(0,4); ctx.rotate(.10); }

    ctx.save();\n    ctx.globalAlpha=.12;\n    ellipse(ctx,0,bodyY+bodyRY+leg*.72,bodyRX*1.25,bodyRY*.20,"#6f4260",0,0);\n    ctx.restore();\n    drawBody(ctx,pose,c,form,state,time,bodyRX,bodyRY,bodyY,leg);
    drawHead(ctx,pose,c,form,headR,headX,headY,tilt,state,time);

    castEffects(ctx,pose,form,headX,headY,headR,bodyY,state,time);
    attackEffect(ctx,pose,headX,bodyY,state);
    nineLives(ctx,pose,headX,headY,headR,time);

    if(state==="victory") victoryEffects(ctx,form,time);
    idleFlourish(ctx,pose,form,headX,headY,headR,time,state);

    if(form===4){
      ctx.save();
      ctx.globalAlpha=.18;
      ctx.beginPath();
      ctx.arc(headX,headY,headR*1.34,0,TAU);
      line(ctx,3,"#ffd65a");
      ctx.restore();
    }
  } finally {
    ctx.restore();
  }
}

export default { id:"cat", draw };
