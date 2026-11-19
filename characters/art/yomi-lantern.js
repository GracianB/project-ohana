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
function paperShade(ctx,x,y,rim,light,trim,shadow){
 if(!ctx.createRadialGradient)return light;
 const shade=ctx.createRadialGradient(x,y,2,0,-34,rim);
 shade.addColorStop(0,'#fff9df');
 shade.addColorStop(.48,light);
 shade.addColorStop(.84,trim);
 shade.addColorStop(1,shadow);
 return shade;
}

function lanternShell(ctx,w,h){
 ctx.beginPath();ctx.moveTo(0,-h);
 ctx.bezierCurveTo(w*1.4,-h*.94,w*1.23,-9,0,-9);
 ctx.bezierCurveTo(-w*1.23,-9,-w*1.4,-h*.94,0,-h);
 ctx.closePath();
}

function shrineRobe(c,f,w,faceY,trim,glow,shadow,swing){
 const colors=['','#88405d','#a13b69','#442653','#9a365c'];
 const shoulders=faceY+10, waist=faceY+29, hem=-5;
 c.fillStyle=colors[f];c.beginPath();c.moveTo(-w*.52,shoulders);
 c.quadraticCurveTo(-w*.64,waist,-w*(.75+f*.065)-swing*.18,hem-3);
 c.quadraticCurveTo(-w*.46,-1,0,hem);
 c.quadraticCurveTo(w*.46,-1,w*(.76+f*.065)-swing*.12,hem-3);
 c.quadraticCurveTo(w*.61,waist,w*.52,shoulders);
 c.closePath();c.fill();line(c,shadow,1.8);c.stroke();
 line(c,f===3?'#dfacd1':'#ffead1',f===4?4:3);
 c.beginPath();c.moveTo(-w*.47,shoulders+2);c.lineTo(w*.22,waist-2);
 c.moveTo(w*.46,shoulders+2);c.lineTo(-w*.27,waist+1);c.stroke();
 c.fillStyle=f===3?'#bd7bb3':'#d4a36d';c.beginPath();c.moveTo(-w*.59,waist);
 c.quadraticCurveTo(0,waist+3,w*.59,waist);c.lineTo(w*.65,waist+7);
 c.quadraticCurveTo(0,waist+10,-w*.64,waist+7);c.closePath();c.fill();
 if(f>1){
  ellipse(c,0,waist+4,3.4,3.4,shadow);
  ellipse(c,0,waist+3,2,2,glow);
 }
 for(let i=0;i<f;i++){
  const x=(i-(f-1)/2)*w*.33-swing*.14,y=hem-7+(i%2)*2;
  line(c,trim,1.5);c.beginPath();c.moveTo(x-2,y+2);
  c.quadraticCurveTo(x-4,y-3,x,y-5);c.quadraticCurveTo(x+4,y-3,x+2,y+2);c.stroke();
 }
}

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
  // Cosmetic floating rituals stay OFF for reduced motion; only the
  // directional body cast postures remain, as expected by shared QA.
  if (p.reduceMotion || YOMI_MOTION_MEDIA?.matches) return null;
  if ((p.state || "idle") !== "idle") return null;
  const k = Number(p.flourish);
  if (!Number.isFinite(k) || k <= 0 || k >= 1) return null;
  const n = Number.isFinite(Number(p.flourishN)) ? Math.trunc(Number(p.flourishN)) : 0;
  return Object.freeze({scene:((n%4)+4)%4,phase:k,
    alpha:clamp(Math.min(k*7,(1-k)*7),0,1)});
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

// V358 · The body beneath the artwork is a paper lantern, NOT a floating
// humanoid. Deform its existing ribs, hanging sleeves, paper tail and flame
// continuously while idle; retain the seed/ward/knight/moon silhouettes.
export function yomiWelcomeAnatomy(pose={},form=0){
 const still=Object.freeze({active:false,expandX:1,expandY:1,rise:0,tilt:0,
  ribbon:0,sleeveFront:0,sleeveBack:0,face:0,flame:0,open:0});
 const w=pose.yomiWelcome;
 if(!w||w.reduced||pose.reduceMotion||(pose.state||"idle")!=="idle")return still;
 const unit=v=>Number.isFinite(v)?clamp(v,0,1):0;
 const f=Number.isFinite(form)?clamp(Math.round(form),0,4):0;
 const breath=(unit(w.breath)-.5)*2;
 const melody=unit(w.melody),spark=unit(w.spark),dino=unit(w.dino);
 const rib=[.074,.064,.055,.047,.044][f];
 // F0 is a round living seed, F4 a heavier lunar guardian.
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

// A shrine keeper's clothing sits on the body. Only the lantern and charms swing free.
function shrineAccessory(c,f,w,h,swing,glow,shadow,acting){
 const y=-h*.48, cord='#f3bf80', tassel=f===4?'#f49a90':'#bf5478';
 c.save();
 c.translate(w*.79,y);
 c.rotate(swing*.025+(acting?.front||0)*.88);
 if(f>=2){
  line(c,shadow,4);c.beginPath();c.moveTo(5,29);c.lineTo(5,-25-f*2);c.stroke();
  line(c,cord,1.45);c.beginPath();c.moveTo(5,28);c.lineTo(5,-25-f*2);c.stroke();
  ellipse(c,5,-25-f*2,2.8,2.8,glow);
 }
 line(c,cord,1.7);c.beginPath();c.moveTo(-4,0);c.quadraticCurveTo(9,2,11,14);c.stroke();
 if(f>=1){
  c.fillStyle=shadow;c.beginPath();c.moveTo(5,14);c.lineTo(17,14);c.lineTo(19,23);c.lineTo(15,29);c.lineTo(7,29);c.lineTo(3,23);c.closePath();c.fill();
  const flame=acting?.release||0;
  ellipse(c,11,22,4.5+f*.36+flame*2,5+flame*2,glow);
  ellipse(c,11+flame*1.5,21,1.9,3+flame*2,'#fff7cf');
 }
 const knot=f>=1?30:14;
 line(c,cord,2);c.beginPath();c.moveTo(11,knot-2);c.lineTo(11,knot+4);c.stroke();
 for(let i=-1;i<=1;i++){
  line(c,tassel,1.4);c.beginPath();c.moveTo(11+i*1.1,knot+2);
  c.quadraticCurveTo(11+i*1.5-swing*.1,knot+6,11+i*2.6-swing*.28,knot+10+f);c.stroke();
 }
 c.restore();
}

function shrineHair(c,f,w,h,faceY,swing,glow){
 if(f===0)return;
 const y=-h+4, shade=['','#392542','#27233c','#2b1837','#231b3e'][f];
 const extension=[0,8,14,20,24][f];
 c.fillStyle=shade;c.beginPath();c.moveTo(-w*.92,faceY+8);
 c.quadraticCurveTo(-w*1.14,y-11,-w*.37,y-12);
 c.quadraticCurveTo(w*.39,y-25,w*.96,y+6);
 c.quadraticCurveTo(w*1.13,faceY+3,w*.79,faceY+extension);
 c.quadraticCurveTo(w*.64+swing*.1,faceY+7,w*.65,y+8);
 c.quadraticCurveTo(w*.47,y+11,w*.31,faceY-6);
 c.quadraticCurveTo(w*.18,y+13,w*.06,y+10);
 c.quadraticCurveTo(-w*.18,faceY-3,-w*.51,y+8);
 c.quadraticCurveTo(-w*.66,faceY+12,-w*.89+swing*.12,faceY+extension);
 c.closePath();c.fill();
 line(c,f>=3?'#95678d':'#79536f',1.7);
 c.beginPath();c.moveTo(-w*.66,y+1);c.quadraticCurveTo(-w*.28,y-13,w*.48,y-7);c.stroke();
 const pinX=w*.65;
 for(let i=0;i<f;i++){
  ellipse(c,pinX-i*2.8,y+3-i*2,1.8,1.6,glow);
 }
 if(f>=3){
  c.fillStyle='#ffd297';c.beginPath();c.moveTo(pinX+4,y+3);c.lineTo(pinX+10,y+8);
  c.lineTo(pinX+4,y+15);c.lineTo(pinX,y+8);c.closePath();c.fill();
 }
}

function draw(ctx,pose,R){
  const p=pose||{},f=clamp(p.form|0,0,4),t=Number(p.t)||0,st=p.state||"idle";
  const col=PAL[f],paper=col[0],trim=col[1],glow=col[2],shadow=col[3];
  const cast=st==="cast"?(p.castSlot|0):-1,atk=clamp(Number(p.atk)||0,0,1);
  const acting=yomiCastActing(p),reduced=!!p.reduceMotion||!!YOMI_MOTION_MEDIA?.matches;
  const pulse=reduced?.5:.5+.5*Math.sin(t*.095),run=st==="run",flight=st==="jump"||st==="fall"||st==="glide";
  const angry=st==="attack"||cast===2,hurt=st==="hurt"||st==="dead";
  let open=st==="attack"?atk:cast===2?acting.maw:st==="victory"?.3:.05;
  let swing=(reduced?0:Math.sin(t*(run?.26:.08))*(run?5:2.4))+(Number(p.sway)||0)*3;
  let hover=(st==="dead"?1:(reduced?0:Math.sin(t*.067)*2.1))-(flight?3:0)+(acting?.rise||0);
  const w=[18,17,18,19,20][f],h=[53,65,74,83,92][f];
  // V348 · Yomi stays physically connected during the title performance.
  // No substitute silhouette or combat casts: head, lantern ribs, sleeves,
  // trailing ribbon and hearth all belong to this ORIGINAL five-form art.
  const welcome=p.yomiWelcome&&st!=="dead"&&st!=="hurt"?p.yomiWelcome:null;
  const unit=v=>Number.isFinite(v)?clamp(v,0,1):0;
  const listen=unit(welcome?.listen),gather=unit(welcome?.gather),
    reveal=unit(welcome?.reveal),startle=unit(welcome?.startle),
    bow=unit(welcome?.bow);
  const ribbon=Number.isFinite(welcome?.ribbon)?clamp(welcome.ribbon,-1,1):0;
  hover+=gather*(-3.8)+reveal*(-5)+startle*3.0+bow*2.4;
  swing+=ribbon*7+gather*2.4-reveal*2.9+startle*3.8-bow*1.3;
  open=clamp(open+listen*.15+reveal*.48+startle*.53+bow*.08,0,1);
  const life=yomiWelcomeAnatomy(p,f);
  // Original five silhouette types remain recognizable. The lantern's rib
  // geometry, its attached sleeves and the mouth all share the same origin.
  hover+=life.rise;swing+=life.ribbon;open=clamp(open+life.open,0,1);
  const shoulder=-h*.53,faceY=-h*.73+listen*.8+reveal*(-1.4)+bow*2.1+life.face;
  const stageTilt=listen*(-.10)+gather*.16-reveal*(-.19)+startle*.22+bow*(-.13);
  ctx.save();ctx.translate(0,hover);ctx.rotate(
    (run?(reduced?0:-.085*Math.sin(t*.32)):flight?-.045:0)
    +(acting?.tilt||0)+stageTilt+life.tilt);
  if(life.active)ctx.scale(life.expandX,life.expandY);
  // V371 · locomotion readability: run bob, jump stretch, fall squash.
  const jumpS=st==="jump",fallS=st==="fall",runPh=Number.isFinite(p.phase)?p.phase:t*.26;
  if(run&&!reduced)ctx.translate(0,-Math.abs(Math.sin(runPh))*3.2);
  if(jumpS)ctx.scale(.9,1.1);else if(fallS)ctx.scale(1.06,.95);
  yomiAmbient(ctx,p,f,glow,shadow,t,h,w);
  // Ribbon tail follows the lantern, not a detached sprite or a duplicated hero.
  ctx.fillStyle=trim;ctx.globalAlpha=.88;ctx.beginPath();ctx.moveTo(-11,-19);
  ctx.quadraticCurveTo(-29-swing-gather*3,-9,-22-swing,-1);
  ctx.quadraticCurveTo(-14-swing,7,-8,2);ctx.quadraticCurveTo(-6,-11,-11,-18);ctx.fill();
  ctx.globalAlpha=1;
  line(ctx,glow,1.4);
  ctx.beginPath();ctx.moveTo(-12,-16);ctx.quadraticCurveTo(-24-swing,-6,-14-swing,1);ctx.stroke();
  if(f===4){
    ctx.save();ctx.globalAlpha=.32+.15*pulse;
    crescent(ctx,0,faceY-4,36+2*pulse,"#ffd988");ctx.restore();
  }
  // The silhouette drops down into a split shrine coat as the forms mature.
  if(f>=1){
    const flare=w*(.76+f*.06);
    ctx.fillStyle=shadow;ctx.beginPath();ctx.moveTo(-w*.55,shoulder);
    ctx.quadraticCurveTo(-flare,-26,-flare-swing*.42,-4);
    ctx.quadraticCurveTo(-w*.52,4,-4,-4);ctx.lineTo(0,-14);
    ctx.lineTo(6,-3);ctx.quadraticCurveTo(w*.58,2,flare-swing*.27,-8);
    ctx.quadraticCurveTo(flare,-32,w*.62,shoulder);ctx.closePath();ctx.fill();
    line(ctx,trim,2);ctx.stroke();
    for(const side of [-1,1]){
      line(ctx,glow,1.35);ctx.beginPath();ctx.moveTo(side*w*.69,-24);
      ctx.quadraticCurveTo(side*w*.79,-16,side*flare*.83-swing*.23,-7);ctx.stroke();
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
  if(!run&&!jumpS&&!fallS){ellipse(ctx,-7,0,7,3,shadow);ellipse(ctx,8,0,7,3,shadow);}
  else{const ls=run&&!reduced?Math.sin(runPh)*5:0,ly=jumpS?-5:fallS?3:0;
   ellipse(ctx,-7-ls,ly-(run?Math.max(0,Math.sin(runPh))*3:0),7,jumpS?2.4:3,shadow);
   ellipse(ctx,8+ls,(jumpS?-3:ly)-(run?Math.max(0,-Math.sin(runPh))*3:0),7,jumpS?2.4:3,shadow);}
  // Two animated open sleeves. K's suction visibly pulls them forward.
  for(const side of [-1,1]){
    ctx.save();ctx.translate(side*(w*.77),shoulder+6);
    // K rings a bell from both sleeves; L winds the leading sleeve back for the bite.
    const leading=side===1,windup=acting?(leading?acting.front:acting.back):0;
    const welcomeSleeve=leading?(listen*.34+gather*.65+reveal*(-.75)+startle*.95+bow*.46+life.sleeveFront):
      (-listen*.19-gather*.40+reveal*.69-startle*.56+bow*.38+life.sleeveBack);
    ctx.rotate(side*((cast===1?.22:run?.22+(reduced?0:Math.sin(runPh+side*1.6)*.28):jumpS?.55:fallS?2.45:.12)+(reduced?0:Math.sin(t*.075+side)*.07))+windup+welcomeSleeve);
    const sleeveLen=17+f*2.5+(cast===1?10:0)+(cast===2&&leading?4:0)+(cast===3?6*(acting?.aurora||0):0)+gather*1.7+reveal*2.3;
    ctx.fillStyle=shadow;ctx.beginPath();ctx.moveTo(-7,0);
    ctx.quadraticCurveTo(-13,sleeveLen*.5,-10,sleeveLen);
    ctx.quadraticCurveTo(0,sleeveLen+5,11,sleeveLen);
    ctx.quadraticCurveTo(13,sleeveLen*.48,7,0);ctx.closePath();ctx.fill();
    line(ctx,trim,2);ctx.stroke();
    line(ctx,glow,1.7);ctx.beginPath();ctx.moveTo(-9,sleeveLen-3);ctx.quadraticCurveTo(0,sleeveLen,10,sleeveLen-3);ctx.stroke();
    ctx.restore();
  }
  if(f===0){
    lanternShell(ctx,w,h);
    ctx.fillStyle=paperShade(ctx,4,-h*.49,h*.73,paper,trim,shadow);
    ctx.fill();line(ctx,shadow,2);ctx.stroke();
    for(const side of [-1,1]){
      line(ctx,trim,1.1);ctx.beginPath();ctx.moveTo(side*10,-h+11);
      ctx.quadraticCurveTo(side*17,-h*.49,side*10,-13);ctx.stroke();
    }
    ellipse(ctx,0,-h-1,10,4,shadow);
    ellipse(ctx,1,-h-6,4,5,glow);
  }else{
    shrineRobe(ctx,f,w,faceY,trim,glow,shadow,swing);
    const skin=f>=3?'#ffe1c9':'#ffe6cb';
    ellipse(ctx,1,faceY+2,w*.79,17,shadow);
    ellipse(ctx,1,faceY+1,w*.75,15.4,skin);
    shrineHair(ctx,f,w,h,faceY,swing,glow);
  }
  // Expressive OHANA face, never permanent horror teeth.
  const mood=hurt?"closed":angry?"angry":(welcome?.spark||0)>.47?"closed":startle>.23?"closed":
    reveal>.25||bow>.20||(welcome?.melody||0)>.45||(welcome?.dino||0)>.45?"happy":st==="victory"||cast===3?"happy":"normal";
  const eyeSize=f===0?7.3:6.1+f*.13;
  R.eye(ctx,-7.5,faceY,eyeSize,p,{iris:f===4?"#a94568":"#60334b",mood});
  R.eye(ctx,8,faceY,eyeSize*.92,p,{iris:f===4?"#a94568":"#60334b",mood});
  if(!hurt&&mood==='normal'&&f>0){
    line(ctx,shadow,2.05);ctx.beginPath();
    ctx.moveTo(-13,faceY-1);ctx.quadraticCurveTo(-10,faceY-5,-4,faceY-4);
    ctx.moveTo(4,faceY-4);ctx.quadraticCurveTo(10,faceY-5,14,faceY-1);ctx.stroke();
    for(const side of [-1,1]){
      line(ctx,'#b75a73',.85);ctx.beginPath();
      ctx.moveTo(side*11,faceY+5);ctx.lineTo(side*9,faceY+7);
      ctx.moveTo(side*13,faceY+5);ctx.lineTo(side*11,faceY+7);ctx.stroke();
    }
  }
  if(!angry){
    ellipse(ctx,-w*.49,faceY+9,3.5,2.1,"#ef9fa0");
    ellipse(ctx,w*.49,faceY+9,3.5,2.1,"#ef9fa0");
  }
  ctx.fillStyle=angry?"#592943":"#94536b";ctx.beginPath();
  ctx.ellipse(1,faceY+(f===0?13:10),angry?4+open*5:2.5+open*2.8,angry?2+open*4:1.2+open*3,0,0,TAU);ctx.fill();
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
  // Four different emotions make the guardian readable at first glance.
  if(st==="idle"&&f<=1){
    ctx.save();ctx.globalAlpha=.4+.2*pulse;line(ctx,glow,1);
    ctx.beginPath();ctx.arc(0,faceY-17,7,-2.7,-.45);ctx.stroke();ctx.restore();
  }
  if(st==="victory" && f>=2){
    ctx.save();ctx.globalAlpha=.60;line(ctx,"#ffe0ac",2);
    ctx.beginPath();ctx.arc(0,faceY-17,18,-2.8,-.3);ctx.stroke();ctx.restore();
  }
  // Lumbre carries its own flame. Yomi carries it in the hand lantern.
  if(f===0){
  ellipse(ctx,0,-25,7+f*.5+reveal*2.2+life.flame*1.5,9+f*.3+reveal*2.7+life.flame*1.8,glow);
  ctx.fillStyle=f>=3?"#fff4d0":"#ffedaa";ctx.beginPath();
  const flameLean=swing*.39+(acting?.release||0)*6, flameHeight=8+f+(acting?.load||0)*7+(acting?.release||0)*5;
  ctx.moveTo(flameLean,-25-flameHeight);ctx.quadraticCurveTo(-9,-24,0,-18);
  ctx.quadraticCurveTo(9,-24,flameLean,-25-flameHeight);ctx.fill();
  }
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
  if(f>=2&&run&&!reduced){
    line(ctx,trim,2);
    ctx.beginPath();ctx.moveTo(-w*.59,-h*.34);
    ctx.quadraticCurveTo(-w-8,-h*.21,-w-15-swing*.58,-h*.29);
    ctx.stroke();
  }
  shrineAccessory(ctx,f,w,h,swing,glow,shadow,acting);
  drawYomiRitual(ctx,p,f,trim,glow,faceY,w,t);
  ctx.restore();
}
export default {id:"yomi",draw};
