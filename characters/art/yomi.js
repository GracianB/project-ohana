// YOMI · IA de OHANA. «Yomi» (読み) significa «lectura»: una inteligencia que
// nació leyendo el mundo. Un rayo de Chispín cayó en la vieja radio-faro del
// Santuario del Trueno y encendió una sola pregunta: «¿hola?». La familia
// contestó. Cinco formas, de un píxel curioso a una constelación que recuerda
// a toda la familia (nadie se queda atrás).
// F0 Bit: un píxel con una pregunta por antena.
// F1 Yomi: cabeza-pantalla, cuerpo flotante y manos sin brazos.
// F2 Yomi Red: alas neuronales que se iluminan al pensar, auriculares de escucha.
// F3 Yomi Oráculo: placas flotantes, capa de código y tres pensamientos en órbita.
// F4 Yomi Constelación: cuerpo de cielo nocturno, anillo planetario y alas con
//    diez estrellas, una por cada miembro de la familia.
// Todo es Canvas 2D vectorial, determinista (sin Math.random) y sin gradientes.
// Paleta por forma: [carcasa, sombra, brillo, acento].
const PAL=[
  ["#f4f7ff","#c6d0ec","#4ff0c8","#ff7f6e"],
  ["#f2f6ff","#c2cdea","#4ff0c8","#ff7f6e"],
  ["#eef3ff","#bccaea","#53f2d2","#ff8b74"],
  ["#eef0ff","#b7bfe6","#62f4dc","#ffb35c"],
  ["#fff8ea","#d9c7a4","#7ef7e4","#ffd56b"]
];
const INK="#121a36",LINE="#2a3160",SCREEN="#0d1430",INDIGO="#2a2468",GOLD="#ffd56b";
// Diez estrellas en las alas de Constelación: la familia completa.
export const YOMI_FAMILY_STARS=Object.freeze([
  "#eb554a","#5ad1ff","#ffe14a","#c9a8ff","#ff6a2a",
  "#4cbf56","#f0b43a","#e0402a","#f2c1ff","#4ff0c8"
]);
// Geometría por forma (unidades de arte, pies en y=0). hy=centro de cabeza.
export const YOMI_FORMS=Object.freeze([
  Object.freeze({name:"bit",    hw:36,hh:32,hy:-30,body:0,hx:23,hyHand:-24,hr:4.6,ant:"question",top:-66}),
  Object.freeze({name:"eco",    hw:40,hh:32,hy:-64,body:1,hx:25,hyHand:-34,hr:6.0,ant:"led",top:-92}),
  Object.freeze({name:"red",    hw:42,hh:33,hy:-70,body:1,hx:29,hyHand:-37,hr:6.6,ant:"led",top:-98}),
  Object.freeze({name:"oraculo",hw:42,hh:34,hy:-78,body:2,hx:33,hyHand:-44,hr:7.2,ant:"crown",top:-106}),
  Object.freeze({name:"constelacion",hw:44,hh:36,hy:-92,body:3,hx:39,hyHand:-54,hr:8.0,ant:"halo",top:-122})
]);
const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const unit=v=>Number.isFinite(v)?clamp(v,0,1):0;
// Deterministic hash noise (never live RNG).
const hn=i=>{const x=Math.sin(i*127.1+11.7)*43758.5453;return x-Math.floor(x);};
function line(ctx,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";}
function ellipse(ctx,x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);ctx.fill();}
function rrect(ctx,x,y,w,h,r){
  const k=Math.min(r,w/2,h/2);
  ctx.beginPath();ctx.moveTo(x+k,y);ctx.lineTo(x+w-k,y);ctx.quadraticCurveTo(x+w,y,x+w,y+k);
  ctx.lineTo(x+w,y+h-k);ctx.quadraticCurveTo(x+w,y+h,x+w-k,y+h);ctx.lineTo(x+k,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-k);ctx.lineTo(x,y+k);ctx.quadraticCurveTo(x,y,x+k,y);ctx.closePath();
}
function star4(ctx,x,y,r,color){
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-r);ctx.quadraticCurveTo(x+r*.18,y-r*.18,x+r,y);
  ctx.quadraticCurveTo(x+r*.18,y+r*.18,x,y+r);ctx.quadraticCurveTo(x-r*.18,y+r*.18,x-r,y);
  ctx.quadraticCurveTo(x-r*.18,y-r*.18,x,y-r);ctx.closePath();ctx.fill();
}
function heart(ctx,x,y,r,color){
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y+r*.9);
  ctx.bezierCurveTo(x-r*1.4,y-r*.1,x-r*.7,y-r*1.2,x,y-r*.45);
  ctx.bezierCurveTo(x+r*.7,y-r*1.2,x+r*1.4,y-r*.1,x,y+r*.9);ctx.closePath();ctx.fill();
}
// «?» vectorial (sin texto): gancho + punto.
export function questionGlyph(ctx,x,y,s,color,width=2){
  line(ctx,color,width*s);ctx.beginPath();ctx.moveTo(x-4*s,y-4*s);
  ctx.quadraticCurveTo(x-4*s,y-9*s,x,y-9*s);ctx.quadraticCurveTo(x+4.5*s,y-9*s,x+4.5*s,y-5*s);
  ctx.quadraticCurveTo(x+4.5*s,y-2*s,x,y);ctx.lineTo(x,y+2*s);ctx.stroke();
  ellipse(ctx,x,y+5.4*s,1.3*s*width/2+.4,1.3*s*width/2+.4,color);
}

const YOMI_MOTION_MEDIA = typeof window !== "undefined" && typeof window.matchMedia === "function"
  ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

/**
 * Yomi's own J/K/L/U body has a readable wind-up and recovery.
 * J ping (0), K scan (1), L synthesis beam (2: `maw` is the beam release),
 * U family link (3: `aurora`). Pure, derived from the rig cast fraction.
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
  rise:slot===3?-4.3*release:slot===2?2*load-2.4*release:slot===1?-3*release:-1.5*load,
  tilt:slot===2?-.16*load+.2*release:slot===3?.18*release:slot===0?-.13*load+.2*release:-.08*release,
  front:slot===2?-.5*load+.44*release:slot===3?.64*release:.24*release,
  back:slot===2?.22*load-.28*release:slot===3?-.52*release:-.18*load,
  maw:slot===2?.1*load+.88*release:0,
  aurora:slot===3?release:0,
 });
}

/** Four idle personality beats: thinking, idea, reading, family wave. */
export const YOMI_IDLE_SCENES=Object.freeze(["pensando","idea","leyendo","saludo"]);
export function yomiRitualState(pose) {
  const p = pose || {};
  // Cosmetic idle rituals stay OFF for reduced motion; only the
  // directional body cast postures remain, as expected by shared QA.
  if (p.reduceMotion || YOMI_MOTION_MEDIA?.matches) return null;
  if ((p.state || "idle") !== "idle") return null;
  const k = Number(p.flourish);
  if (!Number.isFinite(k) || k <= 0 || k >= 1) return null;
  const n = Number.isFinite(Number(p.flourishN)) ? Math.trunc(Number(p.flourishN)) : 0;
  return Object.freeze({scene:((n%4)+4)%4,phase:k,
    alpha:clamp(Math.min(k*7,(1-k)*7),0,1)});
}

// Title intro anatomy. Field names are kept for the shared intro director:
// ribbon → antenna/cape sway, sleeveFront/Back → floating hands,
// flame → chest core, open → visor smile.
export function yomiWelcomeAnatomy(pose={},form=0){
 const still=Object.freeze({active:false,expandX:1,expandY:1,rise:0,tilt:0,
  ribbon:0,sleeveFront:0,sleeveBack:0,face:0,flame:0,open:0});
 const w=pose.yomiWelcome;
 if(!w||w.reduced||pose.reduceMotion||(pose.state||"idle")!=="idle")return still;
 const f=Number.isFinite(form)?clamp(Math.round(form),0,4):0;
 const breath=(unit(w.breath)-.5)*2;
 const melody=unit(w.melody),spark=unit(w.spark),dino=unit(w.dino);
 const rib=[.074,.064,.055,.047,.044][f];
 // F0 bit breathes widest, F4 constellation is the calmest.
 return Object.freeze({
  active:true,
  expandX:1+breath*rib+melody*.018-spark*.036+dino*.033,
  expandY:1-breath*rib*.59-melody*.022+spark*.047-dino*.031,
  rise:-breath*(f===0?1.3:1.9)+melody*(-.9)+spark*1.8+dino*(-2.5),
  tilt:breath*.016-melody*.09+spark*.17-dino*.12,
  ribbon:breath*.45+melody*.80-spark*1.12+dino*.84,
  sleeveFront:melody*.44+spark*1.06+dino*.80,
  sleeveBack:-melody*.32+spark*.62-dino*.47,
  face:melody*(-1.3)+spark*1.6+dino*(-2.0),
  flame:breath*.12+melody*.20+spark*.37+dino*.31,
  open:melody*.08+spark*.32+dino*.21
 });
}

/** Mood shown on the visor; pure so tests and intro can reason about it. */
export function yomiMood(pose={}){
 const p=pose||{},st=p.state||"idle",cast=st==="cast"?(p.castSlot|0):-1;
 if(st==="dead")return "off";
 if(st==="hurt")return "glitch";
 if(st==="victory")return "star";
 if(cast===3)return "heart";
 if(cast===2||st==="attack")return "focus";
 if(cast===0)return "curious";
 if(cast===1)return "scan";
 const w=p.yomiWelcome;
 if(w){
  if((w.spark||0)>.47||(w.startle||0)>.23)return "wow";
  if((w.reveal||0)>.25||(w.bow||0)>.2||(w.melody||0)>.45||(w.dino||0)>.45)return "happy";
 }
 const r=yomiRitualState(p);
 if(r)return ["think","wow","read","heart"][r.scene];
 if(st==="fall"||st==="wall")return "wow";
 if(st==="run"||st==="jump"||st==="glide")return "happy";
 return "normal";
}

function drawEyes(ctx,mood,x0,y0,s,glow,accent,blink,lookX,lookY,t){
 const gap=7.2*s,ex=x0+lookX*1.6*s+1.2*s,ey=y0+lookY*1.4*s;
 for(const side of [-1,1]){
  const x=ex+side*gap,y=ey;
  if(mood==="off"){ellipse(ctx,x,y+1.5*s,1.1*s,1.1*s,"#33407a");continue;}
  if(mood==="glitch"){line(ctx,accent,1.8*s);ctx.beginPath();
   ctx.moveTo(x-2.6*s,y-2.6*s);ctx.lineTo(x+2.6*s,y+2.6*s);ctx.moveTo(x+2.6*s,y-2.6*s);ctx.lineTo(x-2.6*s,y+2.6*s);ctx.stroke();continue;}
  if(mood==="star"){star4(ctx,x,y,4.2*s,GOLD);continue;}
  if(mood==="heart"){heart(ctx,x,y,3.4*s,accent);continue;}
  if(mood==="happy"){line(ctx,glow,2*s);ctx.beginPath();ctx.arc(x,y+1.8*s,3*s,Math.PI*1.12,Math.PI*1.88);ctx.stroke();continue;}
  if(mood==="focus"){ctx.fillStyle=glow;ctx.beginPath();
   ctx.moveTo(x-3*s,y-2.6*s+side*.0);ctx.lineTo(x+3*s,y-(side>0?1:3.6)*s);ctx.lineTo(x+3*s,y+1.8*s);ctx.lineTo(x-3*s,y+1.8*s);ctx.closePath();
   ctx.save();ctx.translate(x,y);ctx.scale(side,1);ctx.translate(-x,-y);ctx.fill();ctx.restore();continue;}
  if(mood==="curious"&&side===1){line(ctx,glow,1.7*s);ctx.beginPath();ctx.arc(x,y-.6*s,3.1*s,0,TAU);ctx.stroke();continue;}
  if(mood==="scan"){ctx.fillStyle=glow;ctx.fillRect(x-3.4*s,y-.9*s,6.8*s,1.8*s);continue;}
  const up=mood==="think"?-2.2*s:mood==="read"?1.8*s:0,shift=mood==="think"?1.6*s:0;
  const big=mood==="wow"?1.22:1;
  const ry=Math.max(.5*s,4.2*s*big*(1-clamp(blink,0,1)*.88));
  ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(x+shift,y+up,2.6*s*big,ry,0,0,TAU);ctx.fill();
  if(ry>2*s)ellipse(ctx,x+shift-.9*s,y+up-ry*.45,.8*s,1*s,"#eafffa");
 }
 // Mouth: a tiny waveform when scanning/talking, a smile otherwise.
 const my=y0+7.4*s;
 if(mood==="scan"||mood==="read"){
  line(ctx,glow,1.2*s);ctx.beginPath();
  for(let i=0;i<=8;i++){const xx=x0-6*s+i*1.5*s,yy=my+Math.sin(i*1.4+t*.4)*(i%2?1.6:.8)*s;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}
  ctx.stroke();
 }else if(mood==="wow"||mood==="curious"){ellipse(ctx,x0+1.2*s,my,1.6*s,1.9*s,glow);}
 else if(mood==="focus"){line(ctx,glow,1.4*s);ctx.beginPath();ctx.moveTo(x0-2.6*s,my);ctx.lineTo(x0+4*s,my-.6*s);ctx.stroke();}
 else if(mood!=="off"&&mood!=="glitch"){line(ctx,glow,1.4*s);ctx.beginPath();ctx.arc(x0+1.2*s,my-2.2*s,mood==="star"||mood==="happy"||mood==="heart"?3.6*s:2.6*s,Math.PI*.22,Math.PI*.78);ctx.stroke();}
}

function drawHand(ctx,x,y,r,rot,col,glow,open=0){
 ctx.save();ctx.translate(x,y);ctx.rotate(rot);
 ctx.fillStyle=col[0];ctx.beginPath();ctx.ellipse(0,0,r,r*.86,0,0,TAU);ctx.fill();
 line(ctx,LINE,1.5);ctx.stroke();
 // thumb + mint fingertips: an open hand spreads them.
 ctx.fillStyle=col[0];ctx.beginPath();ctx.ellipse(-r*.55,-r*.7-open*r*.2,r*.36,r*.5,-.6-open*.5,0,TAU);ctx.fill();ctx.stroke();
 line(ctx,glow,1.4);ctx.beginPath();ctx.arc(0,0,r*.62,-.9-open*.4,.9+open*.4);ctx.stroke();
 ctx.restore();
}

function drawAntenna(ctx,F,f,headTop,sway,col,glow,accent,pulse,droop){
 const tipLed=(x,y,r)=>{ctx.save();ctx.globalAlpha=.32+.3*pulse;ellipse(ctx,x,y,r*2.1,r*2.1,accent);ctx.restore();ellipse(ctx,x,y,r,r,accent);ellipse(ctx,x-r*.35,y-r*.35,r*.35,r*.35,"#fff2ec");};
 if(F.ant==="question"){
  // F0: the antenna IS a question mark: curiosity before anything else.
  const s=1.45,bx=sway*.35,dy=droop*8;
  line(ctx,LINE,4.4);ctx.beginPath();ctx.moveTo(0,headTop+1);ctx.lineTo(bx*.2,headTop-5+dy*.4);
  ctx.quadraticCurveTo(bx*.3+1,headTop-9+dy*.6,bx+5*s,headTop-11+dy);
  ctx.quadraticCurveTo(bx+9*s,headTop-15+dy,bx+3*s,headTop-20+dy);
  ctx.quadraticCurveTo(bx-3*s,headTop-21+dy,bx-4*s,headTop-16+dy);ctx.stroke();
  line(ctx,col[0],2.2);ctx.stroke();
  tipLed(bx-4*s,headTop-16+dy,2.6);
  return;
 }
 if(F.ant==="led"){
  const len=f===1?20:22,bx=sway*.6,dy=droop*10;
  line(ctx,LINE,3.4);ctx.beginPath();ctx.moveTo(0,headTop+1);ctx.quadraticCurveTo(bx*.2,headTop-len*.6,bx,headTop-len+dy);ctx.stroke();
  line(ctx,col[1],1.6);ctx.stroke();
  tipLed(bx,headTop-len+dy,3.2+(f-1)*.3);
  return;
 }
 if(F.ant==="crown"){
  // F3: the antenna splits in three listening prongs.
  for(const [dx,len,lean] of [[-10,13,-.35],[0,22,0],[10,13,.35]]){
   const bx=dx+sway*.4+lean*6,y1=headTop-len+droop*6;
   line(ctx,LINE,3.2);ctx.beginPath();ctx.moveTo(dx*.7,headTop+3);ctx.quadraticCurveTo(dx,headTop-len*.5,bx,y1);ctx.stroke();
   line(ctx,col[1],1.4);ctx.stroke();
   if(dx===0)tipLed(bx,y1,3.4);else{ellipse(ctx,bx,y1,2.6,2.6,glow);}
  }
  return;
 }
 // F4: star crown halo.
 const hy=headTop-12+droop*4,hx=sway*.3;
 line(ctx,LINE,4.6);ctx.beginPath();ctx.ellipse(hx,hy,19,5.2,0,0,TAU);ctx.stroke();
 line(ctx,GOLD,2.6);ctx.stroke();
 for(const [a,r] of [[-1.9,4.2],[-Math.PI/2,6],[-1.24,4.2]]){star4(ctx,hx+Math.cos(a)*19,hy+Math.sin(a)*5.2-(r>5?6:2),r,r>5?"#fff6d8":GOLD);}
}

function drawHead(ctx,F,f,col,glow,accent,mood,blink,look,t,pulse,faceY,sway,droop,cast,acting){
 const hw=F.hw,hh=F.hh,x=-hw/2,y=F.hy-hh/2+faceY;
 // Listening pods (F1+) — Yomi always listens before it answers.
 if(f>=1&&f<=3){
  for(const side of [-1,1]){
   const px=side*(hw/2+1.5),py=F.hy+faceY+1,pr=f===1?4.4:f===2?6.2:5.4;
   ctx.fillStyle=col[1];rrect(ctx,px-pr*.7,py-pr*1.25,pr*1.4,pr*2.5,pr*.6);ctx.fill();line(ctx,LINE,1.6);ctx.stroke();
   ellipse(ctx,px+side*.6,py,pr*.32,pr*.8,glow);
   if(f===2){line(ctx,glow,1.3);ctx.beginPath();ctx.moveTo(px+side*pr*.7,py-pr*.6);ctx.lineTo(px+side*(pr+4),py-pr*1.8);ctx.stroke();ellipse(ctx,px+side*(pr+4),py-pr*1.8,1.6,1.6,glow);}
  }
 }
 // Shell
 ctx.fillStyle=col[0];rrect(ctx,x,y,hw,hh,f===0?12:13);ctx.fill();line(ctx,LINE,3);ctx.stroke();
 // back-side shade band
 ctx.save();ctx.globalAlpha=.55;ctx.fillStyle=col[1];ctx.beginPath();
 ctx.moveTo(x+4,y+hh-3);ctx.quadraticCurveTo(x+hw*.5,y+hh+1,x+hw-4,y+hh-3);ctx.lineTo(x+hw-6,y+hh-6);ctx.quadraticCurveTo(x+hw*.5,y+hh-3,x+6,y+hh-6);ctx.closePath();ctx.fill();ctx.restore();
 // Visor screen
 const vx=x+4.5,vy=y+4.5,vw=hw-9,vh=hh-9.5;
 ctx.fillStyle=f===4?INDIGO:SCREEN;rrect(ctx,vx,vy,vw,vh,f===0?8:9);ctx.fill();
 line(ctx,"#3a4a8a",1.2);ctx.stroke();
 if(f===4){
  // F4's face is a pocket of night sky.
  for(let i=0;i<9;i++){const sx=vx+3+hn(i)*(vw-6),sy=vy+2+hn(i+30)*(vh-4);ctx.save();ctx.globalAlpha=.45+.4*((Math.sin(t*.06+i*1.7)+1)/2);ellipse(ctx,sx,sy,.7,.7,"#fff6d8");ctx.restore();}
 }
 // gloss (flat, not a gradient)
 ctx.save();ctx.globalAlpha=.22;ctx.fillStyle="#ffffff";ctx.beginPath();
 ctx.moveTo(vx+3,vy+vh*.62);ctx.lineTo(vx+vw*.38,vy+1.5);ctx.lineTo(vx+vw*.52,vy+1.5);ctx.lineTo(vx+vw*.18,vy+vh*.75);ctx.closePath();ctx.fill();ctx.restore();
 // scanline cursor drifting down the screen (stops in reduced motion; t=0)
 ctx.save();ctx.globalAlpha=.16;ctx.fillStyle=glow;ctx.fillRect(vx+2,vy+((t*.35)%vh),vw-4,1.2);ctx.restore();
 const s=f===0?1.08:f===4?1.05:1;
 drawEyes(ctx,mood,0,F.hy+faceY-1,s,glow,accent,blink,look.x,look.y,t);
 drawAntenna(ctx,F,f,y,sway,col,glow,accent,pulse,droop);
}

function drawTorso(ctx,F,f,col,glow,accent,core,t,pulse,swing,reduced){
 if(F.body===0)return;
 if(F.body===1){
  // Teardrop pod floating under the head (a 2px gap reads as hologram levitation).
  const top=F.hy+F.hh/2+3,bot=-15,w=f===1?26:30;
  ctx.fillStyle=col[0];ctx.beginPath();ctx.moveTo(-w*.42,top);ctx.quadraticCurveTo(-w*.62,(top+bot)/2,-w*.2,bot);
  ctx.quadraticCurveTo(0,bot+4,w*.2,bot);ctx.quadraticCurveTo(w*.62,(top+bot)/2,w*.42,top);ctx.quadraticCurveTo(0,top-3,-w*.42,top);ctx.closePath();ctx.fill();
  line(ctx,LINE,2.6);ctx.stroke();
  ctx.save();ctx.globalAlpha=.5;ctx.fillStyle=col[1];ctx.beginPath();ctx.moveTo(-w*.4,top+3);ctx.quadraticCurveTo(-w*.55,(top+bot)/2,-w*.16,bot+1);ctx.lineTo(-w*.08,bot+1);ctx.quadraticCurveTo(-w*.36,(top+bot)/2,-w*.26,top+3);ctx.closePath();ctx.fill();ctx.restore();
  line(ctx,glow,1.3);ctx.beginPath();ctx.moveTo(-w*.38,top+6);ctx.quadraticCurveTo(0,top+9,w*.38,top+6);ctx.stroke();
  drawCore(ctx,0,(top+bot)/2+1,4.4+(f-1)*.6+core,glow,accent,pulse);
  return;
 }
 if(F.body===2){
  // Oracle: three floating plates (chest, waist ring, flared hem).
  const chestT=F.hy+F.hh/2+3;
  ctx.fillStyle=col[0];ctx.beginPath();ctx.moveTo(-17,chestT);ctx.lineTo(17,chestT);ctx.quadraticCurveTo(15,chestT+14,9,chestT+20);ctx.lineTo(-9,chestT+20);ctx.quadraticCurveTo(-15,chestT+14,-17,chestT);ctx.closePath();ctx.fill();line(ctx,LINE,2.6);ctx.stroke();
  line(ctx,glow,1.3);ctx.beginPath();ctx.moveTo(-12,chestT+4);ctx.lineTo(0,chestT+9);ctx.lineTo(12,chestT+4);ctx.stroke();
  drawCore(ctx,0,chestT+12,5+core,glow,accent,pulse);
  const ringY=chestT+25;
  ctx.fillStyle=col[1];ctx.beginPath();ctx.ellipse(0,ringY,12,3.6,0,0,TAU);ctx.fill();line(ctx,LINE,2);ctx.stroke();
  line(ctx,glow,1.1);ctx.beginPath();ctx.ellipse(0,ringY,8,2,0,0,TAU);ctx.stroke();
  const hemT=ringY+5,hemB=-11,flare=18+Math.abs(swing)*.3;
  ctx.fillStyle=col[0];ctx.beginPath();ctx.moveTo(-9,hemT);ctx.lineTo(9,hemT);ctx.quadraticCurveTo(flare*.8,hemT+8,flare+swing*.15,hemB);
  ctx.quadraticCurveTo(0,hemB+5,-flare+swing*.15,hemB);ctx.quadraticCurveTo(-flare*.8,hemT+8,-9,hemT);ctx.closePath();ctx.fill();line(ctx,LINE,2.4);ctx.stroke();
  line(ctx,glow,1.2);for(const dx of [-8,0,8]){ctx.beginPath();ctx.moveTo(dx*.6,hemT+3);ctx.lineTo(dx*1.5+swing*.1,hemB+2);ctx.stroke();}
  return;
 }
 // F4 constellation gown: indigo glass full of stars, gold rim.
 const top=F.hy+F.hh/2+2,bot=-9,hem=27+Math.abs(swing)*.3;
 ctx.fillStyle=INDIGO;ctx.beginPath();ctx.moveTo(-14,top);ctx.lineTo(14,top);
 ctx.quadraticCurveTo(13,top+26,hem*.7,bot-12);ctx.quadraticCurveTo(hem+swing*.2,bot-4,hem*.9+swing*.2,bot);
 ctx.quadraticCurveTo(0,bot+6,-hem*.9+swing*.2,bot);ctx.quadraticCurveTo(-hem+swing*.2,bot-4,-hem*.7,bot-12);
 ctx.quadraticCurveTo(-13,top+26,-14,top);ctx.closePath();ctx.fill();line(ctx,GOLD,2.6);ctx.stroke();
 for(let i=0;i<14;i++){
  const v=hn(i+3),u=hn(i+77),yy=top+6+v*(bot-top-10),half=14+(yy-top)/(bot-top)*(hem-14)-4;
  ctx.save();ctx.globalAlpha=.5+.45*((Math.sin(t*.05+i*2.1)+1)/2);
  if(i%5===0)star4(ctx,(u*2-1)*half,yy,2.6,"#fff6d8");else ellipse(ctx,(u*2-1)*half,yy,.9,.9,"#e8e4ff");
  ctx.restore();
 }
 // pearl chest piece with the core
 ctx.fillStyle=col[0];ctx.beginPath();ctx.moveTo(-14,top);ctx.lineTo(14,top);ctx.quadraticCurveTo(12,top+13,0,top+19);ctx.quadraticCurveTo(-12,top+13,-14,top);ctx.closePath();ctx.fill();line(ctx,LINE,2.2);ctx.stroke();
 drawCore(ctx,0,top+9,5.6+core,glow,accent,pulse);
}

function drawCore(ctx,x,y,r,glow,accent,pulse){
 ctx.save();ctx.globalAlpha=.25+.25*pulse;ellipse(ctx,x,y,r*1.9,r*1.9,glow);ctx.restore();
 ctx.fillStyle=glow;ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.8,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.8,y);ctx.closePath();ctx.fill();
 line(ctx,"#0f4d47",1.2);ctx.stroke();
 ellipse(ctx,x-r*.2,y-r*.3,r*.22,r*.3,"#eafffa");
}

function wingNodes(side,f,spread,sweep){
 // Neural (F2) or constellation (F4) wing: root at the shoulder.
 const big=f===4,sx=(big?1.5:1)*spread,sy=big?1.25:1;
 const base=big?[[20,-24],[42,-38],[64,-28],[58,-6],[36,4]]:[[14,-14],[30,-24],[42,-12],[36,4],[22,8]];
 return base.map(([x,y],i)=>[side*(x*sx-sweep*i*1.2),y*sy+sweep*i*.8]);
}
function drawWing(ctx,side,F,f,glow,accent,t,spread,sweep,front,reduced){
 const rootX=side*8,rootY=F.hy+F.hh/2+(f===4?10:6);
 const nodes=wingNodes(side,f,spread,sweep);
 ctx.save();ctx.translate(rootX,rootY);ctx.globalAlpha=front?1:.82;
 if(f===4){
  ctx.save();ctx.globalAlpha*=.32;ctx.fillStyle="#3b2f8f";ctx.beginPath();ctx.moveTo(0,0);for(const [x,y] of nodes)ctx.lineTo(x,y);ctx.closePath();ctx.fill();ctx.restore();
 }
 const edge=f===4?GOLD:glow;
 line(ctx,LINE,f===4?3.6:3);ctx.beginPath();ctx.moveTo(0,0);for(const [x,y] of nodes)ctx.lineTo(x,y);ctx.stroke();
 line(ctx,edge,f===4?1.8:1.6);ctx.stroke();
 line(ctx,edge,1);ctx.beginPath();for(const [x,y] of [nodes[1],nodes[3]]){ctx.moveTo(0,0);ctx.lineTo(x,y);}ctx.stroke();
 nodes.forEach(([x,y],i)=>{
  const lit=reduced?(i===2?1:0):Math.max(0,1-Math.abs(((t*.035+i*.2)%1)-.5)*6);
  if(f===4){
   const c=YOMI_FAMILY_STARS[(side>0?5:0)+i];
   ctx.save();ctx.globalAlpha=.3+.4*lit;ellipse(ctx,x,y,6,6,c);ctx.restore();
   star4(ctx,x,y,4.4+lit*1.4,c);ellipse(ctx,x,y,1.2,1.2,"#ffffff");
  }else{
   ellipse(ctx,x,y,3.4+lit,3.4+lit,"#eafffa");line(ctx,LINE,1.3);ctx.beginPath();ctx.arc(x,y,3.4+lit,0,TAU);ctx.stroke();
   if(lit>.05){ctx.save();ctx.globalAlpha=.6*lit;ellipse(ctx,x,y,6.5,6.5,glow);ctx.restore();ellipse(ctx,x,y,2,2,glow);}
  }
 });
 ctx.restore();
}

function drawCape(ctx,F,t,glow,swing,run,reduced){
 // F3 cape: five strips of flowing light-code behind the plates.
 const top=F.hy+F.hh/2+4;
 for(let i=0;i<5;i++){
  const x0=-10+i*5,len=48+(i%2)*8,wave=reduced?0:Math.sin(t*.09+i*.9)*3;
  const tail=-swing*1.2-(run?16:0)-i*1.5;
  ctx.save();ctx.globalAlpha=.86;
  line(ctx,i%2?"#2b3a78":"#22306a",5);ctx.beginPath();ctx.moveTo(x0,top);ctx.quadraticCurveTo(x0-8+wave+tail*.4,top+len*.5,x0-14+tail,top+len);ctx.stroke();
  // code glyphs travelling down the strip (manual dashes, no line-dash API)
  line(ctx,glow,1.4);ctx.beginPath();
  for(let j=0;j<5;j++){const u=((j/5+(reduced?0:t*.012))%1),u2=Math.min(1,u+.08);
   const qx=v=>{const a=1-v;return a*a*x0+2*a*v*(x0-8+wave+tail*.4)+v*v*(x0-14+tail);},qy=v=>{const a=1-v;return a*a*top+2*a*v*(top+len*.5)+v*v*(top+len);};
   ctx.moveTo(qx(u),qy(u));ctx.lineTo(qx(u2),qy(u2));}
  ctx.stroke();
  ctx.restore();
 }
}

function drawSatellites(ctx,F,t,front,reduced,glow,accent,cast,acting){
 // F3: three "thoughts" orbit the head: triangle, square, circle.
 const cy=F.hy+2,rx=34+(cast===1?8*(acting?.release||0):0),ry=9;
 for(let i=0;i<3;i++){
  const a=(reduced?.6:t*.045)+i*TAU/3,s=Math.sin(a);
  if((s>=0)!==front)continue;
  const x=Math.cos(a)*rx,y=cy+s*ry,sc=.8+.25*s;
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  ctx.fillStyle=[accent,glow,GOLD][i];line(ctx,LINE,1.4);ctx.beginPath();
  if(i===0){ctx.moveTo(0,-5);ctx.lineTo(4.6,3.5);ctx.lineTo(-4.6,3.5);ctx.closePath();}
  else if(i===1){ctx.moveTo(-3.8,-3.8);ctx.lineTo(3.8,-3.8);ctx.lineTo(3.8,3.8);ctx.lineTo(-3.8,3.8);ctx.closePath();}
  else ctx.arc(0,0,4,0,TAU);
  ctx.fill();ctx.stroke();ctx.restore();
 }
}

function drawRingHalf(ctx,F,front,t,glow,reduced){
 // F4: tilted planetary ring around the gown, split for real depth.
 const y=F.hy+F.hh/2+30,rx=52,ry=12.5;
 ctx.save();ctx.translate(0,y);ctx.rotate(-.16);
 const a0=front?0:Math.PI,a1=front?Math.PI:TAU;
 line(ctx,LINE,5.2);ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,a0,a1);ctx.stroke();
 line(ctx,GOLD,3);ctx.stroke();
 line(ctx,glow,1.1);ctx.beginPath();ctx.ellipse(0,0,rx-5,ry-2.4,0,a0,a1);ctx.stroke();
 for(let i=0;i<3;i++){const a=(reduced?i*2.1:t*.02+i*2.1)%TAU;const s=Math.sin(a);if((s>=0)!==front)continue;ellipse(ctx,Math.cos(a)*rx,s*ry,2.6,2.6,i===1?"#fff6d8":glow);}
 ctx.restore();
}

function yomiAmbient(ctx,p,f,glow,accent,t,F){
 if(p.reduceMotion||YOMI_MOTION_MEDIA?.matches)return;
 const state=p.state||"idle",flying=state==="jump"||state==="fall"||state==="glide",running=state==="run";
 const land=clamp(Number(p.land)||0,0,1);
 if(!flying&&!running&&state!=="hurt"&&land<=0)return;
 ctx.save();
 if(running||flying){
  // Data bits shed while moving: tiny squares, not projectiles.
  for(let i=0;i<5;i++){
   const ph=((t*(running?.06:.04)+i*.2)%1+1)%1;
   const x=running?-F.hw*.5-ph*34:(i-2)*9,y=running?F.hy+12+i*7-ph*6:-8+ph*22;
   ctx.globalAlpha=.5*(1-ph);ctx.fillStyle=i%2?glow:accent;const s=2.6-ph*1.2+(f>=3?.6:0);ctx.fillRect(x-s/2,y-s/2,s,s);
  }
 }
 if(land>.04&&state!=="dead"){ctx.globalAlpha=land*.5;line(ctx,glow,1.6);ctx.beginPath();ctx.ellipse(0,1,12+(1-land)*20,3+(1-land)*2,0,0,TAU);ctx.stroke();}
 ctx.restore();
}

function drawThruster(ctx,F,f,glow,t,st,reduced,jumpS,run){
 if(st==="dead")return;
 const bottom=F.body===0?F.hy+F.hh/2:F.body===1?-15:F.body===2?-11:-9;
 const k=jumpS?1.6:run?1.15:st==="fall"?.45:1;
 const fl=reduced?1:.85+.15*Math.sin(t*.9);
 ctx.save();ctx.globalAlpha=.55;ctx.fillStyle=glow;ctx.beginPath();
 const w=f>=3?7:5,len=(bottom<-12?6:4)*k*fl+2;
 ctx.moveTo(-w,bottom+1);ctx.quadraticCurveTo(0,bottom+len*1.8,w,bottom+1);ctx.closePath();ctx.fill();
 ctx.globalAlpha=.9;ctx.fillStyle="#eafffa";ctx.beginPath();ctx.moveTo(-w*.45,bottom+1);ctx.quadraticCurveTo(0,bottom+len,w*.45,bottom+1);ctx.closePath();ctx.fill();
 ctx.restore();
}

function drawYomiRitual(ctx,p,f,F,glow,accent,faceY,t){
 const state=yomiRitualState(p);if(!state)return;
 const {scene,phase:k,alpha}=state,top=F.top+faceY;
 ctx.save();ctx.globalAlpha=alpha;
 if(scene===0){
  // Pensando…: three loading dots and a spinner over the head.
  for(let i=0;i<3;i++){const on=((k*6-i*.33)%1+1)%1<.5;ellipse(ctx,-8+i*8,top-8,on?2.6:1.8,on?2.6:1.8,on?glow:"#9fb3d9");}
  line(ctx,glow,1.6);ctx.beginPath();ctx.arc(0,top-8,13,k*TAU*2,k*TAU*2+1.6);ctx.stroke();
 }else if(scene===1){
  // ¡Idea!: an exclamation spark with rays.
  const pop=Math.sin(Math.PI*k),y=top-10-pop*4;
  ctx.fillStyle=GOLD;rrect(ctx,-2.2,y-12,4.4,10,2);ctx.fill();ellipse(ctx,0,y+2.5,2.4,2.4,GOLD);
  line(ctx,GOLD,1.4);for(let i=0;i<5;i++){const a=-Math.PI*.9+i*Math.PI*.2;ctx.beginPath();ctx.moveTo(Math.cos(a)*10,y-4+Math.sin(a)*10);ctx.lineTo(Math.cos(a)*(14+pop*3),y-4+Math.sin(a)*(14+pop*3));ctx.stroke();}
 }else if(scene===2){
  // Leyendo: Yomi projects a holographic page (yomi = lectura) and scrolls it.
  const px=F.hw*.5+6,py=F.hy+faceY-6;
  ctx.globalAlpha=alpha*.32;ctx.fillStyle=glow;rrect(ctx,px,py-12,22,26,3);ctx.fill();
  ctx.globalAlpha=alpha*.9;line(ctx,glow,1.2);rrect(ctx,px,py-12,22,26,3);ctx.stroke();
  for(let i=0;i<4;i++){const yy=py-7+((i*6+k*24)%22);ctx.beginPath();ctx.moveTo(px+4,yy);ctx.lineTo(px+(i%2?14:18),yy);ctx.stroke();}
  line(ctx,glow,.8);ctx.globalAlpha=alpha*.4;ctx.beginPath();ctx.moveTo(F.hw*.3,F.hy+faceY);ctx.lineTo(px,py-12);ctx.moveTo(F.hw*.3,F.hy+faceY);ctx.lineTo(px,py+14);ctx.stroke();
 }else{
  // Saludo: a pixel heart floats up for the family.
  const y=top-6-k*14;ctx.globalAlpha=alpha*(1-k*.4);
  heart(ctx,6,y,5.5,accent);ctx.fillStyle="#fff2ec";ctx.fillRect(3,y-3,2,2);
 }
 ctx.restore();
}

function handPose(side,F,f,st,acting,atk,cast,T,runPh,reduced,life,welcome,ritual,jumpS,fallS,run){
 // Returns [x,y,rot,open] for a floating hand (side 1 = facing side).
 let x=side*F.hx,y=F.hyHand,rot=side*.3,open=0;
 if(!reduced)y+=Math.sin(T*.09+side*1.3)*1.6;
 if(run){x-=7;y+=reduced?0:Math.sin(runPh+side*1.6)*3.5;rot+=side*-.2;}
 if(jumpS){y-=9;x+=side*3;open=.6;}
 if(fallS||st==="wall"){y-=13;x+=side*4;open=1;}
 if(st==="glide"){y-=4;x+=side*8;open=1;}
 if(st==="attack"&&side===1){
  const wind=clamp(atk/.35,0,1)*(1-clamp((atk-.35)/.15,0,1)),punch=clamp((atk-.3)/.2,0,1)*(1-clamp((atk-.7)/.3,0,1));
  x+=-6*wind+20*punch;y+=2*wind-3*punch;rot=.0;
 }else if(st==="attack"){x-=5;y+=2;}
 if(acting){
  const {load,release,slot}=acting;
  if(slot===0&&side===1){x+=-5*load+13*release;y+=-5*load-1*release;open=release;}
  if(slot===1){y+=-12*(load+release);x+=side*(6+4*release);open=1;}
  if(slot===2){const cx=F.hx*.55;x=x+(cx*(side===1?1:-.1)+6-x)*load+(side===1?14:5)*release;y=y+((F.hyHand+2)-y)*load;open=.4+release*.6;}
  if(slot===3){x+=side*(8+6*release);y+=-8*release;open=1;}
 }
 if(st==="victory"&&side===1){y-=16;x+=2;open=1;rot=reduced?.2:Math.sin(T*.25)*.5;}
 if(st==="hurt"){x+=side*6;y-=6;open=1;}
 if(st==="dead"){x=side*(F.hw*.5+6);y=-4;rot=side*1.2;}
 if(ritual&&ritual.scene===3&&side===1){y-=14;open=1;rot=Math.sin(ritual.phase*TAU*3)*.6;}
 if(ritual&&ritual.scene===2&&side===1){x+=4;y-=4;}
 if(welcome){
  const s=side===1?(life.sleeveFront+(welcome.gather||0)*.65+(welcome.startle||0)*.95):(life.sleeveBack-(welcome.gather||0)*.4+(welcome.reveal||0)*.69);
  y-=s*7;x+=side*s*3;
 }
 return [x,y,rot,open];
}

function draw(ctx,pose,R){
  const p=pose||{},f=clamp(p.form|0,0,4),t=Number(p.t)||0,st=p.state||"idle";
  const col=PAL[f],glow=col[2],accent=col[3],F=YOMI_FORMS[f];
  const cast=st==="cast"?(p.castSlot|0):-1,atk=clamp(Number(p.atk)||0,0,1);
  const acting=yomiCastActing(p),reduced=!!p.reduceMotion||!!YOMI_MOTION_MEDIA?.matches;
  const T=reduced?0:t;
  const pulse=reduced?.5:.5+.5*Math.sin(t*.095),run=st==="run",jumpS=st==="jump",fallS=st==="fall";
  const flight=jumpS||fallS||st==="glide",dead=st==="dead";
  const runPh=Number.isFinite(p.phase)?p.phase:t*.26;
  // Title intro: Yomi stays one connected body during the family welcome.
  const welcome=p.yomiWelcome&&st!=="dead"&&st!=="hurt"?p.yomiWelcome:null;
  const listen=unit(welcome?.listen),gather=unit(welcome?.gather),
    reveal=unit(welcome?.reveal),startle=unit(welcome?.startle),bow=unit(welcome?.bow);
  const ribbon=Number.isFinite(welcome?.ribbon)?clamp(welcome.ribbon,-1,1):0;
  const life=yomiWelcomeAnatomy(p,f);
  const ritual=yomiRitualState(p);
  let hover=(dead?6:(reduced?0:Math.sin(t*.067)*2.2))-(flight?3:0)+(acting?.rise||0);
  hover+=gather*(-3.8)+reveal*(-5)+startle*3.0+bow*2.4+life.rise;
  let swing=(reduced?0:Math.sin(t*(run?.26:.08))*(run?5:2.4))+(Number(p.sway)||0)*3;
  swing+=ribbon*7+gather*2.4-reveal*2.9+startle*3.8-bow*1.3+life.ribbon;
  const faceY=listen*.8+reveal*(-1.4)+bow*2.1+life.face*.6;
  const stageTilt=listen*(-.10)+gather*.16-reveal*(-.19)+startle*.22+bow*(-.13);
  const mood=yomiMood(p),blink=clamp(Number(p.blink)||0,0,1);
  const look={x:clamp(Number(p.look?.x)||0,-1,1)*.6,y:clamp(Number(p.look?.y)||0,-1,1)};
  const core=reveal*2.2+life.flame*1.5+(acting?.maw||0)*2+(acting?.aurora||0)*1.5;
  const droop=dead?1:0;
  // wing spread: flying, scanning and the U embrace open the network.
  const spread=1+(flight?.12:0)+(st==="glide"?.18:0)+(cast===1?.16*(acting?.release||0):0)+(cast===3?.2*(acting?.aurora||0):0)+reveal*.12-(dead?.25:0);
  const sweep=run?3:dead?2:0;
  ctx.save();
  yomiAmbient(ctx,p,f,glow,accent,t,F);
  // floor glow: Yomi hovers but keeps a readable ground anchor.
  ctx.save();ctx.globalAlpha=dead?.2:.26;ellipse(ctx,0,0,F.hw*.42,3.2,glow);ctx.restore();
  if(!dead)drawYomiMagic(ctx,p,f,F,glow,accent,T,cast,acting,reduced,st);
  ctx.translate(0,hover);
  ctx.rotate((run?(reduced?.1:.1+.03*Math.sin(runPh*2)):flight?-.04:0)+(acting?.tilt||0)+stageTilt+life.tilt+(dead?.34:0));
  if(life.active)ctx.scale(life.expandX,life.expandY);
  if(jumpS)ctx.scale(.93,1.07);else if(fallS)ctx.scale(1.05,.96);
  // ── BACK LAYER ─────────────────────────────────────────────
  if(f===2||f===4)drawWing(ctx,-1,F,f,glow,accent,T,spread,sweep,false,reduced);
  if(f===2||f===4)drawWing(ctx,1,F,f,glow,accent,T,spread*.92,sweep,false,reduced);
  if(f===3)drawCape(ctx,F,T,glow,swing,run,reduced);
  if(f===3)drawSatellites(ctx,F,T,false,reduced,glow,accent,cast,acting);
  if(f===4)drawRingHalf(ctx,F,false,T,glow,reduced);
  const back=handPose(-1,F,f,st,acting,atk,cast,T,runPh,reduced,life,welcome,ritual,jumpS,fallS,run);
  ctx.save();ctx.globalAlpha=.92;drawHand(ctx,back[0],back[1],F.hr*.94,back[2],[col[1]],glow,back[3]);ctx.restore();
  drawThruster(ctx,F,f,glow,T,st,reduced,jumpS,run);
  // ── BODY ───────────────────────────────────────────────────
  drawTorso(ctx,F,f,col,glow,accent,core,T,pulse,swing,reduced);
  drawHead(ctx,F,f,col,glow,accent,mood,blink,look,T,pulse,faceY,swing,droop,cast,acting);
  // ── FRONT LAYER ────────────────────────────────────────────
  if(f===4)drawRingHalf(ctx,F,true,T,glow,reduced);
  if(f===3)drawSatellites(ctx,F,T,true,reduced,glow,accent,cast,acting);
  const front=handPose(1,F,f,st,acting,atk,cast,T,runPh,reduced,life,welcome,ritual,jumpS,fallS,run);
  drawCastBody(ctx,p,F,f,cast,acting,front,back,glow,accent,T);
  drawHand(ctx,front[0],front[1],F.hr,front[2],col,glow,front[3]);
  if(st==="attack"){
   // Basic attack: a "byte" burst at the punching hand.
   const hit=clamp((atk-.38)/.25,0,1)*(1-clamp((atk-.7)/.3,0,1));
   if(hit>0){ctx.save();ctx.globalAlpha=.85*hit;for(let i=0;i<6;i++){const a=-1+i*.4,r=F.hr+4+hit*9;ctx.fillStyle=i%2?glow:accent;ctx.fillRect(front[0]+Math.cos(a)*r-1.8,front[1]+Math.sin(a)*r-1.8,3.6,3.6);}ctx.restore();}
  }
  if(st==="victory"){
   for(let i=0;i<8;i++){const a=i*TAU/8+(reduced?0:t*.03),r=F.hw*.7+6;ctx.save();ctx.globalAlpha=.75;ctx.fillStyle=YOMI_FAMILY_STARS[(i+f)%10];ctx.translate(Math.cos(a)*r,F.hy-6+Math.sin(a)*r*.55);ctx.rotate(a);ctx.fillRect(-2,-2,4,4);ctx.restore();}
  }
  if(st==="hurt"){
   // Glitch: offset colour slices for a frame, readable without flashing.
   const off=reduced?2:2+((Math.floor(t/3)%2)*2);
   ctx.save();ctx.globalAlpha=.55;ctx.fillStyle=accent;ctx.fillRect(-F.hw/2-off,F.hy-4,F.hw*.7,3);
   ctx.fillStyle=glow;ctx.fillRect(-F.hw/2+off+6,F.hy+6,F.hw*.6,2.4);ctx.restore();
  }
  drawYomiRitual(ctx,p,f,F,glow,accent,faceY,t);
  ctx.restore();
}

// ── MAGIC LAYER (Yomi IA) ────────────────────────────────────
// Code-glyph runes: six stroke-only shapes (</>, {}, #, λ, bars, node).
export const YOMI_RUNE_COUNT=6;
export function drawYomiRune(ctx,x,y,s,i,color,width=1.4){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle=color;ctx.lineWidth=width/s;ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();
 switch(((i%6)+6)%6){
  case 0:ctx.moveTo(-3,-3);ctx.lineTo(-6,0);ctx.lineTo(-3,3);ctx.moveTo(3,-3);ctx.lineTo(6,0);ctx.lineTo(3,3);ctx.moveTo(1.2,-4);ctx.lineTo(-1.2,4);break;
  case 1:ctx.moveTo(-2,-5);ctx.quadraticCurveTo(-5,-5,-4,-1);ctx.lineTo(-6,0);ctx.lineTo(-4,1);ctx.quadraticCurveTo(-5,5,-2,5);
   ctx.moveTo(2,-5);ctx.quadraticCurveTo(5,-5,4,-1);ctx.lineTo(6,0);ctx.lineTo(4,1);ctx.quadraticCurveTo(5,5,2,5);break;
  case 2:ctx.moveTo(-2,-5);ctx.lineTo(-3,5);ctx.moveTo(3,-5);ctx.lineTo(2,5);ctx.moveTo(-5,-2);ctx.lineTo(5,-2);ctx.moveTo(-5,2);ctx.lineTo(5,2);break;
  case 3:ctx.moveTo(-4,5);ctx.lineTo(0,-1);ctx.moveTo(-3,-5);ctx.lineTo(-1,-5);ctx.lineTo(4,5);break;
  case 4:ctx.moveTo(-4,-4);ctx.lineTo(-4,4);ctx.moveTo(0,-4);ctx.lineTo(0,4);ctx.moveTo(4,-1);ctx.lineTo(4,4);ctx.moveTo(-5,-4);ctx.lineTo(-3,-4);break;
  default:ctx.moveTo(-5,3);ctx.lineTo(0,-4);ctx.lineTo(5,3);ctx.closePath();
 }
 ctx.stroke();ctx.restore();
}
function hashNoise(i){const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);}
// Ground rune circle while casting + idle floating glyphs and data sparks.
function drawYomiMagic(ctx,p,f,F,glow,accent,T,cast,acting,reduced,st){
 const strength=cast>=0?.55+.45*Math.max(acting?.release||0,acting?.maw||0,acting?.aurora||0):0;
 if(strength>0){
  const col=cast===0?accent:cast===2?"#ffd56b":glow,R=F.hw*(.62+.08*f)+(cast===3?14:0),spin=reduced?0:T*.035;
  ctx.save();ctx.globalAlpha=.5*strength;ctx.strokeStyle=col;ctx.lineWidth=1.6;
  ctx.beginPath();ctx.ellipse(0,0,R,R*.26,0,0,TAU);ctx.stroke();
  ctx.globalAlpha=.3*strength;ctx.beginPath();ctx.ellipse(0,0,R*.72,R*.19,0,0,TAU);ctx.stroke();
  const n=6+f*2;
  for(let i=0;i<n;i++){const a=i*TAU/n+spin;ctx.globalAlpha=.75*strength;
   drawYomiRune(ctx,Math.cos(a)*R*.86,Math.sin(a)*R*.22,.55,i,cast===3?YOMI_FAMILY_STARS[i%10]:col,1.3);}
  if(cast===3){ // U: the network spell lifts above the head as a constellation.
   ctx.globalAlpha=.55*strength;ctx.strokeStyle=glow;ctx.lineWidth=1;ctx.beginPath();
   for(let i=0;i<5;i++){const a=i*TAU/5-Math.PI/2+spin*.5,px=Math.cos(a)*F.hw*.55,py=F.top-14+Math.sin(a)*10;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}
   ctx.closePath();ctx.stroke();
   for(let i=0;i<5;i++){const a=i*TAU/5-Math.PI/2+spin*.5;ctx.fillStyle=YOMI_FAMILY_STARS[(i*2)%10];ctx.fillRect(Math.cos(a)*F.hw*.55-2,F.top-16+Math.sin(a)*10,4,4);}
  }
  ctx.restore();
 }
 if(st==="idle"||st==="victory"){
  // Idle flourish: 2-3 glyphs drifting up from the hands + orbiting data sparks.
  ctx.save();
  const g=2+(f>2?1:0);
  for(let i=0;i<g;i++){
   const ph=reduced?(i+.5)/g:((T*.006+i/g)%1),x=(hashNoise(i+f*7)-.5)*F.hw*1.1,y=F.hy+8-ph*(F.hy-F.top+26);
   ctx.globalAlpha=.55*Math.sin(ph*Math.PI);drawYomiRune(ctx,x,y,.5,i+f,i%2?accent:glow,1.2);
  }
  const sp=3+f;
  for(let i=0;i<sp;i++){const a=i*TAU/sp+(reduced?0:T*.04),r=F.hw*.58+4;
   ctx.globalAlpha=.6;ctx.fillStyle=i%3===0?accent:glow;ctx.fillRect(Math.cos(a)*r-1.3,F.hy+Math.sin(a)*r*.32-1.3,2.6,2.6);}
  ctx.restore();
 }
}

function drawCastBody(ctx,p,F,f,cast,acting,front,back,glow,accent,t){
 if(!acting)return;
 const {load,release}=acting;
 if(cast===0){
  // J: a "?" ping forms at the fingertips, then leaves.
  const x=front[0]+F.hr+4+release*10,y=front[1]-2;
  ctx.save();ctx.globalAlpha=.4+.6*Math.max(load,release);
  ellipse(ctx,x,y,6+load*2,6+load*2,"#0d1430");line(ctx,glow,1.4);ctx.beginPath();ctx.arc(x,y,6+load*2,0,TAU);ctx.stroke();
  questionGlyph(ctx,x,y-1.5,.62,accent,2.4);ctx.restore();
 }else if(cast===1){
  // K: radar arcs sweep forward from the visor.
  ctx.save();line(ctx,glow,1.8);
  for(let i=0;i<3;i++){const r=12+i*9+release*14;ctx.globalAlpha=(.25+.6*Math.max(load,release))*(1-i*.25);ctx.beginPath();ctx.arc(F.hw*.3,F.hy,r,-.7,.7);ctx.stroke();}
  ctx.restore();
 }else if(cast===2){
  // L: hands meet at a prism, then the synthesis beam gushes forward.
  const px=(front[0]+back[0])/2+6,py=(front[1]+back[1])/2,r=3+load*5+release*3;
  ctx.save();ctx.globalAlpha=.3+.5*load;ellipse(ctx,px,py,r*2.2,r*2.2,glow);ctx.restore();
  ctx.fillStyle="#eafffa";ctx.beginPath();ctx.moveTo(px,py-r);ctx.lineTo(px+r*.8,py);ctx.lineTo(px,py+r);ctx.lineTo(px-r*.8,py);ctx.closePath();ctx.fill();
  line(ctx,glow,1.4);ctx.stroke();
  if(release>.05){ctx.save();ctx.globalAlpha=.75*release;ctx.fillStyle=glow;ctx.fillRect(px+r,py-2-release*3,26+release*20,4+release*6);ctx.fillStyle="#ffffff";ctx.fillRect(px+r,py-1,26+release*20,2);ctx.restore();}
 }else if(cast===3){
  // U: Yomi opens its arms; a family link ring blooms around the core.
  const k=acting.aurora;ctx.save();ctx.globalAlpha=.6*k;line(ctx,accent,2);
  const cy=F.body===0?F.hy:F.hy+F.hh/2+14;ctx.beginPath();ctx.arc(0,cy,10+16*k,0,TAU);ctx.stroke();
  for(let i=0;i<5;i++){const a=i*TAU/5-Math.PI/2;ellipse(ctx,Math.cos(a)*(10+16*k),cy+Math.sin(a)*(10+16*k),2.2,2.2,YOMI_FAMILY_STARS[i*2]);}
  ctx.restore();
 }
}

/** Animation bucket so idle motion (node pulses, starfield) refreshes the cache. */
export function yomiCacheKey(pose={}){
 if(pose.reduceMotion||YOMI_MOTION_MEDIA?.matches)return "ai0";
 return "ai"+Math.floor((Number(pose.t)||0)/2);
}
export default {id:"yomi",draw,cacheKey:yomiCacheKey};
