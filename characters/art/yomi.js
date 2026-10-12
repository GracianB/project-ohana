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

/**
 * Cuatro microescenas de Yomi. Deterministas, acotadas al personaje y sin
 * temporizadores: no alteran la simulación ni producen ataques invisibles.
 */
const YOMI_MOTION_MEDIA = typeof window !== "undefined" && typeof window.matchMedia === "function"
  ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

/**
 * Yomi's own J/K/L/U body has a readable wind-up and recovery.
 * All poses are pure and derive from the rig cast fraction, never from time.
 */
export function yomiCastActing(pose={}) {
 const p=pose||{},slot=p.castSlot;
 if(p.state!=="cast" || !Number.isInteger(slot)||slot<0||slot>3)return null;
 const k=typeof p.cast==="number"&&Number.isFinite(p.cast)?clamp(p.cast,0,1):0;
 const ease=n=>n<=0?0:n>=1?1:n*n*(3-2*n);
 const seg=(a,b)=>ease((k-a)/(b-a));
 const charge=seg(.04,.32),contact=seg(.32,.53),settle=seg(.76,1);
 const load=charge*(1-contact),release=contact*(1-settle);
 return Object.freeze({
  slot,load,release,settle,
  rise:slot===3?-4.3*release:slot===2?2*load-2.4*release:-1.5*load,
  tilt:slot===2?-.16*load+.2*release:slot===3?.18*release:slot===0?-.13*load+.2*release:.12*release,
  front:slot===2?-.5*load+.44*release:slot===3?.64*release:.24*release,
  back:slot===2?.22*load-.28*release:slot===3?-.52*release:-.18*load,
  maw:slot===2?.1*load+.88*release:0,
  aurora:slot===3?release:0,
 });
}

export function yomiRitualState(pose) {
  const p = pose || {};
  if ((p.state || "idle") !== "idle") return null;
  const k = Number(p.flourish);
  if (!Number.isFinite(k) || k <= 0 || k >= 1) return null;
  const n = Number.isFinite(Number(p.flourishN)) ? Math.trunc(Number(p.flourishN)) : 0;
  const reduced=!!p.reduceMotion||!!YOMI_MOTION_MEDIA?.matches;
  return Object.freeze({scene:((n % 4)+4)%4,
    phase:reduced?(k<.33?.2:k<.67?.5:.8):k,
    alpha:reduced?1:clamp(Math.min(k*7,(1-k)*7),0,1),
    reduced});
}

function yomiAmbient(ctx, p, f, glow, shadow, t, h, w) {
  if (p.reduceMotion || YOMI_MOTION_MEDIA?.matches) return;
  const state = p.state || "idle";
  const flying = state === "jump" || state === "fall" || state === "glide";
  const running = state === "run";
  const land = clamp(Number(p.land) || 0, 0, 1);
  if (!flying && !running && state !== "hurt" && land <= 0) return;
  ctx.save();
  if (running || flying) {
    // El farol deja motas de papel y fuego: no son proyectiles.
    for (let i = 0; i < 4; i++) {
      const phase = ((t * (running ? .061 : .038) + i * .25) % 1 + 1) % 1;
      const x = (running ? -24 - phase * 30 : (i - 1.5) * 11) - w * .2;
      const y = running ? -12 - i * 10 - phase * 8 : -12 + phase * 27;
      ctx.globalAlpha = .36 * (1 - phase);
      ctx.fillStyle = i % 2 ? glow : "#fff5db";
      ctx.beginPath();
      ctx.ellipse(x, y, 2 + (f >= 3 ? .6 : 0), 3 - phase, .25, 0, TAU);
      ctx.fill();
    }
  }
  if (land > .04 && state !== "dead") {
    ctx.globalAlpha = land * .42;
    line(ctx, glow, 1.5);
    ctx.beginPath(); ctx.ellipse(0, 1, 12 + (1 - land) * 19, 3 + (1 - land) * 2, 0, 0, TAU);
    ctx.stroke();
  }
  if (state === "hurt") {
    ctx.globalAlpha = .35;
    line(ctx, shadow, 2);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * (w + 5), -h * .7);
      ctx.lineTo(side * (w + 10), -h * .58);
      ctx.lineTo(side * (w + 4), -h * .49);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawYomiRitual(ctx, p, f, trim, glow, faceY, w, t) {
  const state = yomiRitualState(p);
  if (!state) return;
  const { scene, phase: k, alpha, reduced } = state;
  const sunlight = f === 4 ? "#fff3c3" : glow;
  ctx.save();
  ctx.globalAlpha = alpha * .78;
  if (scene === 0) {
    // Escuchar: el farol oye tres campanadas suaves.
    line(ctx, sunlight, 1.6);
    for (let i = 0; i < 3; i++) {
      const spread = reduced?(i+1)*.19:(k * 1.3 + i / 3) % 1;
      ctx.globalAlpha = alpha * .48 * (1 - spread);
      ctx.beginPath();
      ctx.arc(0, faceY - 12, 13 + spread * 28, -Math.PI * .85, -Math.PI * .15);
      ctx.stroke();
    }
  } else if (scene === 1) {
    // Mensajes del umbral: tres sellos vuelan alrededor sin afectar a enemigos.
    for (let i = 0; i < 3; i++) {
      const a = (reduced?0:t * .045) + i * TAU / 3;
      const x = Math.cos(a) * (w + 21);
      const y = faceY - 1 + Math.sin(a) * 19;
      ctx.save(); ctx.translate(x, y); ctx.scale(.56, .56);
      sigil(ctx, 0, 0, k, trim);
      ctx.restore();
    }
  } else if (scene === 2) {
    // Vals de llamitas: cinco luces en espiral, siempre dentro del personaje.
    for (let i = 0; i < 5; i++) {
      const a = (reduced?0:t * .065) + i * TAU / 5;
      const x = Math.cos(a) * (w + 7 + 4 * Math.sin(k * Math.PI));
      const y = faceY + Math.sin(a) * 20;
      ellipse(ctx, x, y, 2.1 + .8 * Math.sin(k * Math.PI), 3.1, i % 2 ? sunlight : "#fff8df");
    }
  } else {
    // Constelación: Yomi enciende una media luna que conecta cinco estrellas.
    const points = [];
    for (let i = 0; i < 5; i++) {
      const a = -.9 * Math.PI + i * Math.PI / 4;
      points.push([Math.cos(a) * (w + 23), faceY - 13 + Math.sin(a) * 29]);
    }
    line(ctx, trim, 1.3);
    ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
    for (const [x, y] of points) {
      ellipse(ctx, x, y, 2.6, 2.6, sunlight);
      ellipse(ctx, x - .7, y - .8, .8, .8, "#ffffff");
    }
  }
  ctx.restore();
}

function draw(ctx,pose,R){
  const p=pose||{},f=clamp(p.form|0,0,4),t=Number(p.t)||0,st=p.state||"idle";
  const col=PAL[f],paper=col[0],trim=col[1],glow=col[2],shadow=col[3];
  const cast=st==="cast"?(p.castSlot|0):-1,atk=clamp(Number(p.atk)||0,0,1);
  const acting=yomiCastActing(p),reduced=!!p.reduceMotion||!!YOMI_MOTION_MEDIA?.matches;
  const pulse=reduced?.5:.5+.5*Math.sin(t*.095),run=st==="run",flight=st==="jump"||st==="fall"||st==="glide";
  const angry=st==="attack"||cast===2,hurt=st==="hurt"||st==="dead";
  const open=st==="attack"?atk:cast===2?acting.maw:st==="victory"?.3:.05;
  const swing=(reduced?0:Math.sin(t*(run?.26:.08))*(run?5:2.4))+(Number(p.sway)||0)*3;
  const hover=(st==="dead"?1:(reduced?0:Math.sin(t*.067)*2.1))-(flight?3:0)+(acting?.rise||0);
  const w=20+f*2.9,h=55+f*4.2;
  const shoulder=-h*.68,faceY=-h*.72;
  ctx.save();ctx.translate(0,hover);ctx.rotate((run?(reduced?0:-.085*Math.sin(t*.32)):flight?-.045:0)+(acting?.tilt||0));
  yomiAmbient(ctx,p,f,glow,shadow,t,h,w);
  // Ribbon tail follows the lantern, not a detached sprite or a duplicated hero.
  ctx.fillStyle=shadow;ctx.globalAlpha=.78;ctx.beginPath();ctx.moveTo(-11,-18);
  ctx.quadraticCurveTo(-29-swing,-9,-22-swing,-1);
  ctx.quadraticCurveTo(-14-swing,7,-8,2);ctx.quadraticCurveTo(-6,-11,-11,-18);ctx.fill();
  ctx.globalAlpha=1;
  if(f===4){
    ctx.save();ctx.globalAlpha=.32+.15*pulse;
    crescent(ctx,0,faceY-4,36+2*pulse,"#ffd988");ctx.restore();
  }
  // Each form changes its silhouette, not just a scale factor or decoration.
  // F0: squat glowing seed. F1: tall wanderer. F2: winged ward.
  // F3: angular night knight. F4: double-crescent moon guardian.
  if(f===0){
    ctx.fillStyle="#e8b17f";
    for(const side of [-1,1]){
      ctx.beginPath();ctx.ellipse(side*19,-31,10,17,side*.32,0,TAU);ctx.fill();
      line(ctx,"#533b56",2.4);ctx.stroke();
    }
  }else if(f===1){
    ctx.fillStyle=trim;
    for(const side of [-1,1]){
      ctx.beginPath();ctx.moveTo(side*15,-44);
      ctx.quadraticCurveTo(side*33,-34,side*33,-5);
      ctx.quadraticCurveTo(side*21,-11,side*14,-15);ctx.closePath();ctx.fill();
      line(ctx,"#52344e",2);ctx.stroke();
    }
  }else if(f===2){
    ctx.fillStyle="#c9808a";
    for(const side of [-1,1]){
      ctx.beginPath();ctx.moveTo(side*14,-58);
      ctx.quadraticCurveTo(side*43,-65,side*51,-45);
      ctx.lineTo(side*34,-32);ctx.lineTo(side*21,-40);
      ctx.closePath();ctx.fill();line(ctx,"#563851",3);ctx.stroke();
    }
  }else if(f===3){
    ctx.fillStyle="#753656";
    for(const side of [-1,1]){
      ctx.beginPath();ctx.moveTo(side*14,-58);
      ctx.lineTo(side*55,-75);ctx.lineTo(side*41,-40);
      ctx.lineTo(side*56,-5);ctx.quadraticCurveTo(side*31,-16,side*19,-31);
      ctx.closePath();ctx.fill();line(ctx,"#f4a0a4",2.5);ctx.stroke();
    }
  }else{
    ctx.fillStyle="#563450";
    for(const side of [-1,1]){
      ctx.beginPath();ctx.moveTo(side*16,-65);
      ctx.quadraticCurveTo(side*54,-96,side*70,-82);
      ctx.lineTo(side*51,-44);ctx.quadraticCurveTo(side*75,-18,side*61,1);
      ctx.lineTo(side*23,-21);ctx.closePath();ctx.fill();
      line(ctx,"#ffdaa4",3);ctx.stroke();
    }
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
    // K rings a bell from both sleeves; L winds the leading sleeve back for the bite.
    const leading=side===1,windup=acting?(leading?acting.front:acting.back):0;
    ctx.rotate(side*((cast===1?.22:run?.22:.12)+(reduced?0:Math.sin(t*.075+side)*.07))+windup);
    const sleeveLen=19+f*2.9+(cast===1?10:0)+(cast===2&&leading?4:0)+(cast===3?6*(acting?.aurora||0):0);
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
  // Evolutions get different head architecture and proportions.
  if(f===0){
    ellipse(ctx,-9,-h+4,10,9,"#ffe2b2");
    ellipse(ctx,10,-h+4,10,9,"#ffe2b2");
  }
  if(f===2){
    ctx.fillStyle="#ad637e";
    ctx.beginPath();ctx.moveTo(-w*.86,-h+9);
    ctx.lineTo(-w*.45,-h-13);ctx.lineTo(0,-h-7);
    ctx.lineTo(w*.45,-h-13);ctx.lineTo(w*.86,-h+9);
    ctx.closePath();ctx.fill();line(ctx,"#5d3b59",2.5);ctx.stroke();
  }
  if(f===3){
    ctx.fillStyle="#552f53";
    ctx.beginPath();ctx.moveTo(-w-7,-h+17);
    ctx.quadraticCurveTo(-w-9,-h-15,0,-h-22);
    ctx.quadraticCurveTo(w+9,-h-15,w+7,-h+17);
    ctx.lineTo(w*.58,-h+7);ctx.quadraticCurveTo(0,-h-7,-w*.58,-h+7);
    ctx.closePath();ctx.fill();line(ctx,"#d98291",2.5);ctx.stroke();
  }
  if(f===4){
    for(const side of [-1,1]){
      ctx.save();ctx.translate(side*w*.54,-h-9);
      ctx.scale(side,1);ctx.fillStyle="#ffd19a";ctx.beginPath();
      ctx.moveTo(-5,8);ctx.quadraticCurveTo(-23,-9,-15,-31);
      ctx.quadraticCurveTo(1,-25,8,-5);ctx.closePath();ctx.fill();
      line(ctx,"#703754",2.5);ctx.stroke();ctx.restore();
    }
  }
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
  const mood=hurt?"closed":angry?"angry":st==="victory"||cast===3?"happy":"normal";
  const eyeSize=f===0?6.5:6+f*.15;
  R.eye(ctx,-8,faceY,eyeSize,p,{iris:f===4?"#a94568":"#60334b",mood});
  R.eye(ctx,9,faceY,eyeSize*.92,p,{iris:f===4?"#a94568":"#60334b",mood});
  if(!angry){
    ellipse(ctx,-w*.49,faceY+9,3.5,2.1,"#ef9fa0");
    ellipse(ctx,w*.49,faceY+9,3.5,2.1,"#ef9fa0");
  }
  ctx.fillStyle=angry?"#592943":"#94536b";ctx.beginPath();
  ctx.ellipse(1,faceY+13,angry?6+open*8:4.8,angry?4+open*7:2.4,0,0,TAU);ctx.fill();
  // The L bite grows from Yomi's expression, not an unrelated monster sprite.
  if(cast===2){
    const snap=acting?.release||0;
    ctx.save();ctx.globalAlpha=.48+.24*snap;line(ctx,glow,2);
    for(const side of [-1,1]){
      ctx.beginPath();ctx.moveTo(1,faceY+13+side*5);
      ctx.quadraticCurveTo(w*.65,faceY+13+side*(10+open*6),w*.94,faceY+13+side*(3+snap*5));ctx.stroke();
    }
    ctx.restore();
  }
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
  // Four different emotions make the guardian readable at first glance.
  if(st==="idle"&&f<=1){
    ctx.save();ctx.globalAlpha=.4+.2*pulse;line(ctx,glow,1);
    ctx.beginPath();ctx.arc(0,faceY-17,7,-2.7,-.45);ctx.stroke();ctx.restore();
  }
  if(st==="victory" && f>=2){
    ctx.save();ctx.globalAlpha=.60;line(ctx,"#ffe0ac",2);
    ctx.beginPath();ctx.arc(0,faceY-17,18,-2.8,-.3);ctx.stroke();ctx.restore();
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
    // Campanada: Yomi holds its lantern heart aloft, ringing one visible halo.
    const k=clamp(Number(p.cast)||0,0,1),ring=Math.sin(Math.PI*k);
    ctx.save();ctx.globalAlpha=.30+.50*ring;line(ctx,"#ffe3a2",2.4);
    for(let i=0;i<3;i++){
      ctx.beginPath();ctx.arc(0,-25,12+16*k+i*9,-Math.PI*.88,Math.PI*.22);ctx.stroke();
    }
    ctx.fillStyle="#fff6d7";ctx.beginPath();ctx.arc(0,-25,3.5+2*ring,0,TAU);ctx.fill();
    ctx.restore();
  }
  if(cast===3){
    // U · the lantern opens to greet Cuerno's borrowed rainbow.
    // For any other chosen companion it remains an invitation, not a hit.
    const k=acting?.aurora||0;
    ctx.save();ctx.globalAlpha=.55*k;line(ctx,glow,2.4);
    ctx.beginPath();ctx.arc(0,-25,10+18*k,-Math.PI*.89,Math.PI*.17);ctx.stroke();
    ctx.restore();
  }
  if(st==="victory"||((p.flourishN||0)%4===3&&p.flourish>0)){
    const v=st==="victory"?pulse:Math.sin(Math.PI*clamp(p.flourish,0,1));
    ctx.save();ctx.globalAlpha=.4*v;crescent(ctx,w+5,faceY-19,9+f,glow);ctx.restore();
  }
  drawYomiRitual(ctx,p,f,trim,glow,faceY,w,t);
  ctx.restore();
}
export default {id:"yomi",draw};
