// ============================================================================
// PROJECT OHANA · MICHI / CAT · KAWAII PREMIUM RENDER
// ----------------------------------------------------------------------------
// Renderer vectorial autocontenido.
// Contrato: draw(ctx, pose, R), origen en el centro de los pies.
// No modifica estado global sin restaurarlo.
// ============================================================================

const TAU = Math.PI * 2;
const INK = "#3b2337";
const SOFT = "#8b5775";

const FORMS = Object.freeze([
  { fur:"#ffd8ea", belly:"#fff8fc", ear:"#ff9bc6", inner:"#ffc0da", iris:"#6f4bd8", accent:"#ff5c9c", tail:"#ff9bc6" },
  { fur:"#ffc4df", belly:"#fff4fa", ear:"#ff88ba", inner:"#ffacd0", iris:"#6842d6", accent:"#ff4b91", tail:"#ff86b8" },
  { fur:"#ffb5d9", belly:"#fff0f8", ear:"#ff72ae", inner:"#ff9dcc", iris:"#367fe2", accent:"#65d8ff", tail:"#ff82b8" },
  { fur:"#d8c7ff", belly:"#faf7ff", ear:"#a88cff", inner:"#c6b4ff", iris:"#5b49cf", accent:"#ffd85a", tail:"#a98bff" },
  { fur:"#fff9fd", belly:"#ffffff", ear:"#ffafd2", inner:"#ffd0e4", iris:"#d44898", accent:"#ffd14e", tail:"#ffc7df" }
]);

const N = (v,d=0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp = (v,a,b) => Math.max(a, Math.min(b, N(v,a)));
const formOf = p => Math.round(clamp(p?.form,0,4));
const stateOf = p => typeof p?.state === "string" ? p.state : "idle";
const tOf = p => N(p?.t,0);
const v = (p,k,d=0) => N(p?.[k],d);

function stroke(ctx, width=2.5, color=INK){
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

function ellipse(ctx,x,y,rx,ry,fill,rot=0,width=2.5,color=INK){
  ctx.beginPath();
  ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU);
  ctx.fillStyle = fill;
  ctx.fill();
  if(width>0) stroke(ctx,width,color);
}

function circle(ctx,x,y,r,fill,width=0,color=INK){
  ctx.beginPath();
  ctx.arc(x,y,Math.max(.1,r),0,TAU);
  ctx.fillStyle = fill;
  ctx.fill();
  if(width>0) stroke(ctx,width,color);
}

function roundBlob(ctx, points, fill, width=2.5){
  if(!points || points.length<3) return;
  ctx.beginPath();
  for(let i=0;i<points.length;i++){
    const a=points[i], b=points[(i+1)%points.length];
    if(i===0) ctx.moveTo(a[0],a[1]);
    ctx.quadraticCurveTo(a[0]*.35+b[0]*.65,a[1]*.35+b[1]*.65,b[0],b[1]);
  }
  ctx.closePath();
  ctx.fillStyle=fill;
  ctx.fill();
  stroke(ctx,width);
}

function shaded(ctx,x,y,r,color,R){
  if(!R?.lighten || !R?.darken) return color;
  const g=ctx.createRadialGradient(x-r*.38,y-r*.5,r*.05,x,y,r*1.15);
  g.addColorStop(0,R.lighten(color,.38));
  g.addColorStop(.56,color);
  g.addColorStop(1,R.darken(color,.12));
  return g;
}

function heart(ctx,x,y,s,fill="#ff68a7",width=1.6){
  s=Math.max(.6,N(s,1));
  ctx.beginPath();
  ctx.moveTo(x,y+s*.9);
  ctx.bezierCurveTo(x-s*1.3,y-s*.05,x-s*.72,y-s*1.08,x,y-s*.28);
  ctx.bezierCurveTo(x+s*.72,y-s*1.08,x+s*1.3,y-s*.05,x,y+s*.9);
  ctx.closePath();
  ctx.fillStyle=fill;
  ctx.fill();
  stroke(ctx,width);
}

function sparkle(ctx,x,y,s,fill="#fff"){
  s=Math.max(1,N(s,1));
  ctx.beginPath();
  ctx.moveTo(x,y-s);
  ctx.quadraticCurveTo(x,y,x+s,y);
  ctx.quadraticCurveTo(x,y,x,y+s);
  ctx.quadraticCurveTo(x,y,x-s,y);
  ctx.quadraticCurveTo(x,y,x,y-s);
  ctx.fillStyle=fill;
  ctx.fill();
}

function star(ctx,x,y,r,fill){
  ctx.beginPath();
  for(let i=0;i<10;i++){
    const a=-Math.PI/2+i*Math.PI/5;
    const rr=(i%2===0)?r:r*.42;
    const px=x+Math.cos(a)*rr, py=y+Math.sin(a)*rr;
    i?ctx.lineTo(px,py):ctx.moveTo(px,py);
  }
  ctx.closePath();
  ctx.fillStyle=fill;
  ctx.fill();
  stroke(ctx,1.3);
}

function ear(ctx,x,y,r,side,c,state,time){
  const flap = state==="hurt" ? .22 : Math.sin(time*.08+side*1.7)>0.992 ? .16 : 0;
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(side*flap);

  ctx.beginPath();
  ctx.moveTo(-r*.48,r*.43);
  ctx.quadraticCurveTo(-r*.43,-r*.18,0,-r);
  ctx.quadraticCurveTo(r*.43,-r*.18,r*.48,r*.43);
  ctx.quadraticCurveTo(0,r*.62,-r*.48,r*.43);
  ctx.closePath();
  ctx.fillStyle=shaded(ctx,0,0,r,c.ear,null);
  ctx.fill();
  stroke(ctx,3);

  ctx.beginPath();
  ctx.moveTo(-r*.25,r*.28);
  ctx.quadraticCurveTo(-r*.22,-r*.16,0,-r*.62);
  ctx.quadraticCurveTo(r*.22,-r*.16,r*.25,r*.28);
  ctx.quadraticCurveTo(0,r*.38,-r*.25,r*.28);
  ctx.closePath();
  ctx.fillStyle=c.inner;
  ctx.fill();
  stroke(ctx,1.2,SOFT);

  ctx.restore();
}

function eye(ctx,x,y,r,c,side,pose,mood){
  if(mood==="heart"){
    heart(ctx,x,y,r*.62,side<0?"#ff5b9e":"#ff79b4",1.2);
    return;
  }
  if(mood==="dead"){
    ctx.beginPath();
    ctx.moveTo(x-r*.62,y-r*.62); ctx.lineTo(x+r*.62,y+r*.62);
    ctx.moveTo(x+r*.62,y-r*.62); ctx.lineTo(x-r*.62,y+r*.62);
    stroke(ctx,Math.max(2,r*.2));
    return;
  }
  const blink=clamp(pose?.blink,0,1);
  if(mood==="happy" || blink>.82){
    ctx.beginPath();
    ctx.arc(x,y+r*.12,r*.72,Math.PI*1.08,Math.PI*1.92);
    stroke(ctx,Math.max(2,r*.18));
    return;
  }

  const h=r*1.22*(1-blink*.68);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x,y,r*.92,Math.max(1,h),0,0,TAU);
  ctx.fillStyle="#fff";
  ctx.fill();
  stroke(ctx,Math.max(1.8,r*.13));
  ctx.clip();

  const lx=v(pose,"lookX",0)*r*.22;
  const ly=v(pose,"lookY",0)*r*.24;
  ctx.beginPath();
  ctx.ellipse(x+lx,y+ly+h*.07,r*.53,h*.68,0,0,TAU);
  ctx.fillStyle=c.iris;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x+lx,y+ly+h*.10,r*.25,h*.44,0,0,TAU);
  ctx.fillStyle="#160f1a";
  ctx.fill();

  circle(ctx,x+lx-r*.25,y+ly-r*.30,r*.22,"#fff");
  circle(ctx,x+lx+r*.20,y+ly+r*.20,r*.09,"#fff");
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(x+side*r*.55,y-r*.72);
  ctx.lineTo(x+side*r*.95,y-r*.93);
  stroke(ctx,Math.max(1.3,r*.1));
}

function face(ctx,p,c,r,state,time){
  let mood="normal";
  if(state==="dead") mood="dead";
  else if(state==="victory" || v(p,"nineLives",0)>0) mood="heart";
  else if(state==="hurt") mood="dead";
  else if(state==="idle" && Math.sin(time*.045)>.993) mood="happy";

  const eyeR=r*.255;
  const lookY=clamp(v(p,"vy",0)*.18,-.24,.24);
  p.lookX = N(p.look?.x,0);
  p.lookY = N(p.look?.y,lookY);

  eye(ctx,-r*.38,-r*.01,eyeR,c,-1,p,mood);
  eye(ctx, r*.38,-r*.01,eyeR,c, 1,p,mood);

  ctx.globalAlpha=.72;
  ellipse(ctx,-r*.62,r*.29,r*.145,r*.08,"#ff79ad",0,0);
  ellipse(ctx, r*.62,r*.29,r*.145,r*.08,"#ff79ad",0,0);
  ctx.globalAlpha=1;

  heart(ctx,0,r*.30,r*.065,"#ff659d",1.2);

  const atk=clamp(v(p,"atk",0),0,1);
  const cast=clamp(v(p,"cast",0),0,1);
  let open=0;
  if(state==="attack") open=.34+.40*Math.sin(atk*Math.PI);
  if(state==="cast") open=.26+.16*Math.sin(cast*Math.PI);
  if(state==="victory") open=.55;
  if(state==="hurt") open=.20;

  ctx.save();
  ctx.translate(0,r*.44);
  if(open>.08){
    const w=r*.18, h=r*(.14+open*.12);
    ctx.beginPath();
    ctx.ellipse(0,0,w,h,0,0,TAU);
    ctx.fillStyle="#9c3157";
    ctx.fill();
    stroke(ctx,1.5);
    ellipse(ctx,0,h*.55,w*.55,h*.25,"#ff8ca9",0,0);
  }else{
    ctx.beginPath();
    ctx.moveTo(-r*.11,0);
    ctx.quadraticCurveTo(0,r*.10,r*.11,0);
    stroke(ctx,1.7);
  }
  ctx.restore();

  // Bigote suave, para que de verdad parezca gato y no peluche genérico.
  ctx.save();
  ctx.globalAlpha=.56;
  ctx.lineWidth=1.15;
  ctx.strokeStyle=SOFT;
  for(const side of [-1,1]){
    for(let i=0;i<3;i++){
      ctx.beginPath();
      ctx.moveTo(side*r*.47,r*(.36+i*.07));
      ctx.quadraticCurveTo(side*r*.76,r*(.33+i*.035),side*r*(.98+i*.05),r*(.28+i*.07));
      ctx.stroke();
    }
  }
  ctx.restore();
}

function paw(ctx,x,y,size,color,angle=0){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(-size*.36,0);
  ctx.quadraticCurveTo(-size*.48,size*.72,0,size);
  ctx.quadraticCurveTo(size*.48,size*.72,size*.36,0);
  ctx.closePath();
  ctx.fillStyle=color;
  ctx.fill();
  stroke(ctx,2.2);
  circle(ctx,0,size*.78,size*.16,"#ff8db6");
  ctx.restore();
}

function raisedPaw(ctx,x,y,size,color,angle){
  const ex=x+Math.sin(angle)*size*1.45;
  const ey=y-Math.cos(angle)*size*1.45;
  ctx.save();
  ctx.lineCap="round";
  ctx.lineWidth=size*.58+5;
  ctx.strokeStyle=INK;
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(ex,ey); ctx.stroke();
  ctx.lineWidth=size*.58;
  ctx.strokeStyle=color;
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(ex,ey); ctx.stroke();
  circle(ctx,ex,ey,size*.34,"#ff8db6",1.6);
  ctx.restore();
}

function tail(ctx,x,y,len,color,angle,form,time){
  const sway=Math.sin(time*.075)*.16;
  const a=angle+sway;
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(a);
  ctx.lineCap="round";
  ctx.lineWidth=17+form*1.8;
  ctx.strokeStyle=INK;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.bezierCurveTo(len*.18,-len*.28,len*.58,len*.18,len,0);
  ctx.stroke();
  ctx.lineWidth=11+form*1.5;
  ctx.strokeStyle=color;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.bezierCurveTo(len*.18,-len*.28,len*.58,len*.18,len,0);
  ctx.stroke();
  ctx.restore();
  return [x+Math.cos(a)*len,y+Math.sin(a)*len];
}

function collar(ctx,r,c){
  ctx.beginPath();
  ctx.moveTo(-r*.30,r*.88);
  ctx.quadraticCurveTo(0,r*1.02,r*.30,r*.88);
  stroke(ctx,4,c.accent);
  circle(ctx,0,r*.96,4.8,"#ffd84d",1.6);
  circle(ctx,0,r*.97,1.1,"#7a582a");
}

function accessory(ctx,form,r,time,c){
  if(form<=1){
    ctx.save();
    ctx.translate(-r*.55,-r*.70);
    for(const side of [-1,1]){
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.quadraticCurveTo(side*15,-13,side*18,-1);
      ctx.quadraticCurveTo(side*14,11,0,0);
      ctx.closePath();
      ctx.fillStyle=c.accent;
      ctx.fill();
      stroke(ctx,1.4);
    }
    circle(ctx,0,0,4,"#ffd84d",1.2);
    ctx.restore();
  }else if(form===2){
    sparkle(ctx,-r*.77,-r*.76,7,c.accent);
    sparkle(ctx,r*.82,-r*.63,4,"#fff0a8");
  }else if(form===3){
    crown(ctx,0,-r*.83);
  }else{
    crown(ctx,0,-r*.91);
    for(let i=0;i<8;i++){
      const a=time*.025+i*TAU/8;
      sparkle(ctx,Math.cos(a)*r*1.08,-r*1.14+Math.sin(a)*r*.72,2.6,i%2?"#fff0a6":"#ffd3ea");
    }
  }
}

function crown(ctx,x,y){
  ctx.beginPath();
  ctx.moveTo(x-18,y+8); ctx.lineTo(x-14,y-9); ctx.lineTo(x-5,y+1);
  ctx.lineTo(x,y-13); ctx.lineTo(x+5,y+1); ctx.lineTo(x+14,y-9); ctx.lineTo(x+18,y+8);
  ctx.closePath();
  ctx.fillStyle="#ffd45a";
  ctx.fill();
  stroke(ctx,1.8);
}

function body(ctx,p,c,form,state,time,rx,ry,bodyY,leg){
  const phase=v(p,"phase",0);
  const run=state==="run";
  const air=["jump","fall","glide"].includes(state);
  const runAmp=run ? .33 : air ? .12 : 0;
  const s1=Math.sin(phase*2)*runAmp;
  const s2=Math.sin(phase*2+Math.PI)*runAmp;

  // Cola grande, visible y claramente felina.
  const tails=form===0?1:form===1?1:form===2?2:form===3?3:4;
  for(let i=0;i<tails;i++){
    const spread=(i-(tails-1)/2)*.30;
    const end=tail(ctx,-rx*.82,bodyY-ry*.05,34+form*5,c.tail,-1.45+spread,form,time);
    heart(ctx,end[0],end[1],4.4,form>=3?"#ffd45a":c.accent,1.1);
  }

  const rearY=0;
  paw(ctx,-rx*.52,rearY+2,leg+2,c.fur,s1);
  paw(ctx, rx*.52,rearY+2,leg+2,c.fur,s2);

  // Cuerpo corto: la cabeza debe dominar visualmente.
  ctx.save();
  ctx.translate(0,bodyY+ry);
  ctx.scale(1+Math.sin(time*.055)*.015,1-Math.sin(time*.055)*.012);
  ellipse(ctx,0,0,rx,ry,shaded(ctx,0,0,Math.max(rx,ry),c.fur,null),0,2.8);
  ellipse(ctx,rx*.07,ry*.12,rx*.55,ry*.55,c.belly,0,0);
  ctx.restore();

  // Pecho mullido.
  ctx.beginPath();
  ctx.moveTo(-rx*.34,bodyY+ry*.62);
  ctx.quadraticCurveTo(-rx*.18,bodyY+ry*.94,0,bodyY+ry*.78);
  ctx.quadraticCurveTo(rx*.18,bodyY+ry*.94,rx*.34,bodyY+ry*.62);
  stroke(ctx,1.5,SOFT);

  const atk=clamp(v(p,"atk",0),0,1);
  const cast=clamp(v(p,"cast",0),0,1);
  const slot=Math.floor(v(p,"castSlot",0));
  let raised=null;
  if(state==="attack") raised=[-.4+atk*2.3,leg+4];
  else if(state==="cast" && slot===0) raised=[2.15-cast*1.25,leg+4];
  else if(state==="cast" && slot===2) raised=[2.65,leg+4];
  else if(state==="victory") raised=[2.45+Math.sin(time*.28)*.28,leg+4];
  else if(state==="wall") raised=[1.35,leg+3];

  if(raised) raisedPaw(ctx,rx*.46,bodyY-2,raised[1],c.fur,raised[0]);
  else paw(ctx,rx*.42,bodyY+ry*.10,leg+2,c.fur,-s1*.55);

  if(form>=2) heart(ctx,rx*.06,bodyY+ry*.22,3.8,form===4?"#ffd45a":"#ff9fc8",1);
}

function head(ctx,p,c,form,r,x,y,tilt,state,time){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(tilt);

  ear(ctx,-r*.68,-r*.55,r*.82,-1,c,state,time);
  ear(ctx, r*.68,-r*.55,r*.82, 1,c,state,time);

  // Contorno exterior más ancho y más redondo.
  ellipse(ctx,0,0,r*1.30,r*1.08,shaded(ctx,0,0,r,c.fur,null),0,3.5);

  // Mancha de luz de peluche.
  ctx.save();
  ctx.globalAlpha=.23;
  ellipse(ctx,-r*.36,-r*.42,r*.46,r*.22,"#fff",-0.32,0);
  ctx.restore();

  // Dos pequeños mechones que rompen la forma circular.
  ctx.beginPath();
  ctx.moveTo(-r*.34,-r*.89);
  ctx.quadraticCurveTo(-r*.16,-r*1.08,0,-r*.90);
  ctx.quadraticCurveTo(r*.18,-r*1.08,r*.34,-r*.87);
  stroke(ctx,2.1);

  // Mejillas laterales suaves.
  ctx.save();
  ctx.globalAlpha=.8;
  ellipse(ctx,-r*.88,r*.22,r*.16,r*.11,"#ff84b1",-0.1,0);
  ellipse(ctx, r*.88,r*.22,r*.16,r*.11,"#ff84b1", 0.1,0);
  ctx.restore();

  face(ctx,p,c,r,state,time);

  // Rayas discretas en la frente, más felino en vez de simple bola rosa.
  ctx.save();
  ctx.globalAlpha=.36;
  ctx.strokeStyle=SOFT;
  ctx.lineWidth=2;
  for(const side of [-1,0,1]){
    ctx.beginPath();
    ctx.moveTo(side*r*.19,-r*.70);
    ctx.quadraticCurveTo(side*r*.13,-r*.58,side*r*.11,-r*.48);
    ctx.stroke();
  }
  ctx.restore();

  collar(ctx,r,c);
  accessory(ctx,form,r,time,c);
  ctx.restore();
}

function effects(ctx,p,form,r,headX,headY,bodyY,state,time){
  if(state==="attack"){
    const a=clamp(v(p,"atk",0),0,1);
    const k=Math.sin(a*Math.PI);
    if(k>0){
      ctx.save();
      ctx.globalAlpha=.85*k;
      ctx.beginPath();
      ctx.arc(headX+18,bodyY-16,30,-1.25,.60);
      stroke(ctx,4.3,"#ff8fbd");
      heart(ctx,headX+48,bodyY-27,4.2,"#ff5a9e",1);
      ctx.restore();
    }
  }

  if(state==="cast"){
    const slot=Math.floor(v(p,"castSlot",0));
    const k=clamp(v(p,"cast",0),0,1);
    if(slot===0){
      heart(ctx,headX+28+k*24,bodyY-34-Math.sin(k*Math.PI)*16,5,"#ff75b4",1.2);
      sparkle(ctx,headX+42+k*24,bodyY-48,2.5,"#fff");
    }else if(slot===1){
      for(let i=0;i<6;i++){
        const a=k*TAU+i*TAU/6;
        heart(ctx,headX+Math.cos(a)*32,bodyY-26+Math.sin(a)*18,3,"#ff9dc8",1);
      }
    }else{
      for(let i=0;i<10;i++){
        const a=time*.08+i*TAU/10;
        sparkle(ctx,headX+Math.cos(a)*(r*.98),headY+Math.sin(a)*(r*.70),2.5+k*2,i%2?"#fff1a8":"#ffb7db");
      }
    }
  }

  if(state==="victory"){
    for(let i=0;i<8;i++){
      const a=time*.04+i*TAU/8;
      star(ctx,headX+Math.cos(a)*r*1.12,headY+Math.sin(a*1.3)*r*.72,3.8,"#ffd66a");
    }
  }

  const lives=clamp(v(p,"nineLives",0),0,100);
  if(lives>0){
    ctx.save();
    ctx.globalAlpha=clamp(lives/16,0,1);
    for(let i=0;i<9;i++){
      const a=time*.07+i*TAU/9;
      heart(ctx,headX+Math.cos(a)*(r+11),headY+Math.sin(a)*r*.72,2.8,i%2?"#fff0ad":"#ff94c7",1);
    }
    ctx.restore();
  }

  const fl=clamp(v(p,"flourish",0),0,1);
  if(state==="idle" && fl>0){
    sparkle(ctx,headX+r*1.02,headY-r*.28,4,"#fff1b2");
    sparkle(ctx,headX-r*1.08,headY-r*.55,3,"#ffd0e8");
  }
}

function draw(ctx,pose={},R={}){
  if(!ctx || typeof ctx.save!=="function") return;

  const form=formOf(pose);
  const c=FORMS[form];
  const state=stateOf(pose);
  const time=tOf(pose);

  const headR=[57,60,64,68,73][form];
  const bodyRX=[19,22,25,28,32][form];
  const bodyRY=[15,17,20,22,25][form];
  const leg=[8,9,10,11,12][form];

  const phase=v(pose,"phase",0);
  const bounce=v(pose,"bounce",0);
  const run=state==="run";

  let hop=0;
  if(run) hop=-Math.max(0,Math.sin(phase*2))*5.5;
  else if(state==="victory") hop=-Math.abs(Math.sin(time*.18))*10;
  else if(state==="dead") hop=4;

  const bodyY=-leg-bodyRY*.72+hop;
  const headX=4+(run?2:0);
  let headY=bodyY-bodyRY*.12-headR*.76+bounce*1.8;
  if(form===0) headY+=4;

  let tilt=Math.sin(time*.045)*.035+v(pose,"sway",0)*.035;
  if(state==="hurt") tilt=-.17;
  if(state==="cast") tilt=.06;
  if(state==="victory") tilt=Math.sin(time*.13)*.065;

  ctx.save();
  try{
    if(state==="dead"){ ctx.translate(0,4); ctx.rotate(.10); }

    // Sombra del propio arte. No altera hitbox ni posición lógica.
    ctx.save();
    ctx.globalAlpha=.10;
    ellipse(ctx,0,3,bodyRX*1.32,bodyRY*.18,"#633f58",0,0);
    ctx.restore();

    drawBody(ctx,pose,c,form,state,time,bodyRX,bodyRY,bodyY,leg);
    head(ctx,pose,c,form,headR,headX,headY,tilt,state,time);
    effects(ctx,pose,form,headR,headX,headY,bodyY,state,time);
  } finally{
    ctx.restore();
  }
}

export default Object.freeze({ id:"cat", draw });
