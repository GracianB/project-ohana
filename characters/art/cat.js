// Michi. Pies en (0,0), mira a +x. Cada forma es otra silueta.
export const MICHI_VISUAL_H=[60,72,84,94,106];
const INK = "#3a2416";
const TAU = Math.PI * 2;

const PAL = [
  { fur: "#ffe3b8", dark: "#e7b56a", belly: "#fff8ee", ear: "#ffb7c8", nose: "#ff8aa0", eye: "#3aa0e8", accent: "#7ec8ff" },
  { fur: "#ffc4e6", dark: "#d978b4", belly: "#fff2fa", ear: "#ff8fbf", nose: "#ff5c8a", eye: "#2d6fe0", accent: "#ffd24a" },
  { fur: "#ffd0e8", dark: "#e888c0", belly: "#fff", ear: "#ffb3d9", nose: "#ff5c8a", eye: "#3f8ef0", accent: "#fff4a8" },
  { fur: "#c9b4ff", dark: "#7052bb", belly: "#f4eeff", ear: "#a88cff", nose: "#ff7aa8", eye: "#f0d060", accent: "#ffe27a" },
  { fur: "#ffb3dc", dark: "#b8508f", belly: "#fff0f8", ear: "#ff7ac0", nose: "#ff3f7f", eye: "#7a4ae0", accent: "#4a2f8a" },
];

// V353 · Five-act facial/ear/tail/paw direction, exclusively for the
// welcome duplicate. Body proportions and each canonical form stay intact.
export function michiWelcomeRig(pose={},form=0){
 const w=pose.michiWelcome;
 const idle={active:false,arm:0,leg:0,tail:0,bob:0,head:0,ear:0,wing:0,mood:"normal",
   torsoX:1,torsoY:1,haunch:0,paw:0,look:0};
 if(!w||w.reduced||pose.reduceMotion||(pose.state||"idle")!=="idle")return idle;
 const n=x=>Number.isFinite(x)?Math.min(1,Math.max(0,x)):0;
 const inspect=n(w.inspect),sideeye=n(w.sideeye),groom=n(w.groom),
  flick=n(w.flick),purr=n(w.purr);
 const melody=n(w.melody),spark=n(w.spark),chase=n(w.chase),
  yomi=n(w.yomi),dino=n(w.dino);
 const breath=(n(w.breath)-.5)*2;
 const f=Number.isFinite(form)?Math.max(0,Math.min(4,Math.round(form))):0;
 const baby=f===0?.65:f===2?.74:1;
 // F0 has a soft oval belly. F2 is a cloud (no invented cat boots).
 // F3 retains its moon silhouette. F4 has the ONLY feathered wings.
 const expansion=[.072,.059,.042,.037,.034][f];
 return {
  active:true,
  torsoX:Math.max(.90,Math.min(1.10,1+breath*expansion+melody*.015
     -spark*.025+chase*.019+yomi*.012)),
  torsoY:Math.max(.92,Math.min(1.08,1-breath*expansion*.61
     -melody*.01+spark*.026-chase*.016)),
  arm:baby*(.16*inspect-.23*sideeye-1.35*groom+.75*flick+.48*purr
     +melody*.25+spark*.72+chase*.61+yomi*.42+dino*.83),
  leg:baby*(.10*inspect-.15*sideeye+.22*groom+.32*flick+.11*purr
     +spark*.13+chase*.20+dino*.17),
  tail:.13*inspect+.25*sideeye+.29*groom+.94*flick+.55*purr
     +breath*.13+melody*.15+spark*.43+chase*.57+yomi*.19+dino*.38,
  bob:-1.2*inspect+.6*sideeye-.55*groom-2.7*flick-1.4*purr
     -breath*.83-melody*.45+spark*1.2-chase*.78-yomi*.62+dino*1.4,
  head:-.14*inspect+.19*sideeye+.24*groom-.31*flick-.13*purr
     +breath*.025-melody*.10+spark*.22-chase*.15+yomi*.14+dino*.27,
  ear:.12*inspect-.22*sideeye+.08*groom+.4*flick-.15*purr
     +breath*.04+melody*.12+spark*.27-chase*.22+yomi*.17+dino*.28,
  haunch:breath*.31+spark*.43+chase*.46+dino*.54,
  paw:groom*.61+melody*.15+spark*.46+chase*.38+yomi*.27+dino*.5,
  look:melody*.13-spark*.24+chase*.19+yomi*.16-dino*.26,
  wing:f===4?.14*inspect+.19*sideeye+.25*groom+.44*flick+.84*purr
      +melody*.08+spark*.17+yomi*.18+dino*.32:0,
  mood:sideeye>.3?"angry":groom>.26?"closed":flick>.25?"angry":purr>.24?"happy":
    spark>.36?"angry":chase>.36?"happy":yomi>.36?"happy":dino>.36?"closed":"normal"
 };
}

function solve(pose) {
  const st = pose.state || "idle";
  const slot = st === "cast" ? (pose.castSlot | 0) : -1;
  const t = pose.t || 0;
  const phase = pose.phase || 0;
  const run = st === "run" ? Math.sin(phase) : 0;
  const atk = st === "attack" ? (pose.atk || 0) : 0;
  const cast = st === "cast" ? (pose.cast || 0) : 0;
  const fl = pose.flourish || 0;
  let arm = 0.35;
  if (st === "attack") arm = -2.05 + Math.sin(Math.min(1, atk) * Math.PI) * 3.15;
  else if (slot === 0) arm = 1.15 + cast * 0.25;
  else if (slot === 1) arm = 0.45;
  else if (slot === 2) arm = -2.15;
  else if (st === "run") arm = 0.25 + run * 0.85;
  else if (st === "jump") arm = -2.15;
  else if (st === "fall" || st === "glide") arm = 0.55;
  else if (st === "wall") arm = -1.7;
  else if (st === "idle" && fl > 0.22 && fl < 0.78) arm = -2.25;
  const leg = st === "run" ? run * 0.8 : st === "jump" ? -2.35 : st === "fall" || st === "glide" ? 0.28 : st === "wall" ? -0.4 : 0.05;
  let mood = "normal";
  if (st === "dead") mood = "closed";
  else if (slot === 1) mood = "happy";
  else if (st === "hurt") mood = "sad";
  else if (st === "attack" || slot === 2) mood = "angry";
  else if (st === "idle" && fl > 0 && (pose.flourishN % 4) === 3) mood = fl > .45 ? "happy" : "normal";
  return {
    st, slot, t, run, atk, cast, fl, arm, leg, mood,
    bob: st === "run" ? -Math.abs(run) * 3.4 : st === "jump" ? -5 : st === "idle" ? Math.sin(t * 0.07) * 1.7 : 0,
    tail: slot === 2 ? 2.1 : st === "run" ? 1.25 : st === "attack" ? 1.45 : 0.75,
  };
}

// V51 · Michi Moon Soul Pass. Local Canvas-only animation, no timers or global particles.
function moonSoul(ctx, pose, form, front) {
  const t = Number.isFinite(pose.t) ? pose.t : 0;
  const state = pose.state || "idle";
  const attack = state === "attack" || state === "cast";
  const airborne = state === "jump" || state === "glide" || state === "fall";
  const victory = state === "victory";
  const flourish = state === "idle" && pose.flourish > 0;
  const gag = flourish && (pose.flourishN % 4) === 3;
  const intensity = attack ? .9 : victory ? .7 : airborne ? .44 : gag ? .6 : .16;
  const shadowStep = state === "cast" && pose.castSlot === 1;
  const y = [-32,-44,-53,-64,-61][form];
  const moon = form >= 3 ? "#ffe7a6" : "#ffb6e4";
  const shadow = form >= 3 ? "#9076e8" : "#cb8cf4";
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (!front) {
    if (attack || airborne || victory) {
      ctx.globalAlpha = .13 + intensity * .22;
      ctx.fillStyle = shadow;
      ctx.beginPath(); ctx.ellipse(-3, -2, 20 + form * 3, 4, 0, 0, TAU); ctx.fill();
    }
    if (form >= 2) {
      ctx.globalAlpha = .12 + intensity * .25;
      ctx.strokeStyle = moon; ctx.lineWidth = 1.5;
      const radius = 25 + form * 4;
      ctx.beginPath(); ctx.arc(0, y, radius, -2.3, .85); ctx.stroke();
      if (form === 4) {
        ctx.globalAlpha = .30 + intensity * .26;
        ctx.beginPath(); ctx.arc(0, y, radius + 6, -2.55, -.52); ctx.stroke();
      }
    }
  } else {
    if (attack || airborne || victory) {
      for (let i = 0; i < (form >= 3 ? 6 : 4); i++) {
        const a = t * .027 + i * TAU / (form >= 3 ? 6 : 4);
        const rad = 25 + form * 4;
        const x = Math.cos(a) * rad, yy = y + Math.sin(a) * rad * .78;
        ctx.globalAlpha = (.22 + intensity * .40) * (.65 + Math.sin(t * .12 + i) ** 2 * .35);
        ctx.strokeStyle = i % 2 ? shadow : moon;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x - 2.5, yy); ctx.lineTo(x + 2.5, yy);
        ctx.moveTo(x, yy - 2.5); ctx.lineTo(x, yy + 2.5); ctx.stroke();
      }
    }
    // The moon is a toy: Michi bats at it, misses, pretends nothing happened.
    if (gag) {
      const k = Math.sin(Math.PI * Math.max(0, Math.min(1, pose.flourish)));
      const x = 30 - k * 9, yy = y - 23 - Math.sin(t * .14) * 3;
      ctx.globalAlpha = .35 + .55 * k;
      ctx.fillStyle = moon;
      ctx.beginPath(); ctx.arc(x, yy, 6, 0, TAU); ctx.fill();
      ctx.fillStyle = shadow;
      ctx.beginPath(); ctx.arc(x + 3, yy - 2, 5, 0, TAU); ctx.fill();
      ctx.strokeStyle = moon; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(17, y + 4); ctx.lineTo(23 - k * 6, y - 13); ctx.stroke();
    }
    if (shadowStep) {
      const k = Math.max(0, Math.min(1, pose.cast || 0));
      ctx.strokeStyle = shadow;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const x = -21 - i * 11 - k * 9, yy = y + 13 + i * 3;
        ctx.globalAlpha = (.30 - i * .075) * Math.sin(Math.PI * k);
        ctx.beginPath();
        ctx.arc(x, yy, 5 + i, Math.PI * 1.05, Math.PI * 1.95);
        ctx.moveTo(x - 4, yy - 3); ctx.lineTo(x - 6, yy - 8);
        ctx.moveTo(x + 4, yy - 3); ctx.lineTo(x + 6, yy - 8);
        ctx.stroke();
      }
    }
    // Three readable claw trails.
    if (state === "attack") {
      const atk = Math.max(0, Math.min(1, pose.atk || 0));
      const sweep = Math.sin(Math.PI * atk);
      ctx.globalAlpha = .62 * sweep;
      ctx.strokeStyle = form >= 3 ? "#ffe5b0" : "#f6b9ed";
      ctx.lineWidth = 2.1;
      for (let i=0;i<3;i++) {
        const shift = i * 7;
        ctx.beginPath();
        ctx.moveTo(18 + shift, y - 8);
        ctx.quadraticCurveTo(38 + shift, y + 6, 24 + shift, y + 23);
        ctx.stroke();
      }
    }
    // Victory reads as a feline leap with a compact crescent crown.
    if (victory) {
      ctx.globalAlpha = .4 + .2*Math.sin(t*.085);
      ctx.strokeStyle = moon;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, y-11, 25 + form*3, Math.PI*1.14, Math.PI*1.86);
      ctx.stroke();
    }
    if (state === "wall") {
      ctx.globalAlpha = .45; ctx.strokeStyle = shadow; ctx.lineWidth = 1.5;
      for (let i=0; i<3; i++) {
        const yy = -14 - i * 13;
        ctx.beginPath(); ctx.moveTo(21, yy); ctx.lineTo(29, yy - 5); ctx.lineTo(26, yy - 9); ctx.stroke();
      }
    }
  }
  ctx.restore();
}


const MICHI_MOTION_MEDIA=typeof window!=='undefined'&&typeof window.matchMedia==='function'?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
export function michiFootwork(pose={}){
 if(pose.reduceMotion||MICHI_MOTION_MEDIA?.matches||pose.air||Number.isFinite(pose.michiDuetAge)||!['idle','run'].includes(pose.state||'idle'))return null;
 const unit=v=>Number.isFinite(Number(v))?Math.max(0,Math.min(1,Number(v))):0;
 const landing=unit(pose.land),turn=pose.state==='run'?unit(pose.turnPulse):0,brake=pose.state==='run'?unit(pose.brake):0,running=pose.state==='run'?unit(pose.speed):0;
 return landing>.02||turn>.02||brake>.02||running>.3?{landing,turn,brake,running}:null;
}
function drawMichiFootwork(ctx,pose,f,t){
 const m=michiFootwork(pose);if(!m)return;ctx.save();ctx.lineCap='round';const col=['#ffd4b5','#ffc982','#ffc4e8','#bea5f5','#ffe2ac'][f];ctx.fillStyle=col;ctx.strokeStyle=col;
 if(m.running>.3)for(let i=0;i<3;i++){const k=((t*.055+i/3)%1+1)%1,x=-12-k*26,y=-2-k*4;ctx.globalAlpha=.4*(1-k)*m.running;if(f===2){ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x,y-3);ctx.lineTo(x+3,y);ctx.lineTo(x,y+3);ctx.closePath();ctx.fill();}else if(f===3){ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,y,3,.25,Math.PI*1.5);ctx.stroke();}else{ctx.beginPath();ctx.ellipse(x,y,2.5,1.6,-.3,0,Math.PI*2);ctx.fill();for(const dx of [-2,0,2]){ctx.beginPath();ctx.arc(x+dx,y-3,1,0,Math.PI*2);ctx.fill();}}}
 if(m.landing>.02){ctx.globalAlpha=m.landing*.55;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,-1,11+(1-m.landing)*18,3,0,0,Math.PI*2);ctx.stroke();for(const side of [-1,1]){ctx.beginPath();ctx.arc(side*(12+(1-m.landing)*10),-4-(1-m.landing)*6,2,0,Math.PI*2);ctx.fill();}}
 if(m.turn>.02){ctx.globalAlpha=m.turn*.6;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(-7,-5);ctx.bezierCurveTo(-29,-2,-28,-23,-12,-14);ctx.bezierCurveTo(-6,-10,-18,-7,-21,-13);ctx.stroke();}
 if(m.brake>.02){ctx.globalAlpha=m.brake*.5;ctx.lineWidth=1.3;for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(-16-i*9,-2-i*2,5,2,-.3,0,Math.PI*1.6);ctx.stroke();}}
 ctx.restore();
}


// Shared silhouette: raised plumes behind the hips; two short, separate feet.
function drawMichiPortrait(ctx,R,pose,r,c,f){
 const H=[72,88,94,108,116][f],headY=-H+33,bodyY=-30-f*2;
 const oval=(x,y,rx,ry,col,line=true)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fillStyle=col;ctx.fill();if(line){ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();}};
 const stroke=(col,w)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();};
 const sway=pose.reduceMotion?0:Math.sin(r.t*.065)*2+r.tail;
 const count=f===4?3:f===3?2:1;
 for(let i=0;i<count;i++){
  const tipX=-36-i*15,tipY=bodyY-19-i*14+sway;
  ctx.beginPath();ctx.moveTo(-15,bodyY+2);ctx.bezierCurveTo(-42,bodyY+1,-57-i*8,tipY-13,tipX,tipY);stroke(INK,12-i);
  ctx.beginPath();ctx.moveTo(-15,bodyY+2);ctx.bezierCurveTo(-42,bodyY+1,-57-i*8,tipY-13,tipX,tipY);stroke(c.dark,8-i);
  oval(tipX,tipY,5-i*.5,6,c.belly);
 }
 if(f===4){for(const side of [-1,1]){ctx.save();ctx.translate(side*14,bodyY-13);ctx.scale(side,1);ctx.rotate(pose.reduceMotion?0:Math.sin(r.t*.08)*.08);ctx.beginPath();ctx.moveTo(0,3);ctx.bezierCurveTo(19,-7,28,-40,39,-35);ctx.quadraticCurveTo(44,-21,33,-12);ctx.quadraticCurveTo(28,-4,19,-4);ctx.quadraticCurveTo(12,7,0,3);ctx.fillStyle=c.belly;ctx.fill();stroke(INK,2);for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(5+i*7,-2-i*4);ctx.quadraticCurveTo(23,-11-i*6,31+i*3,-24-i*3);stroke('#cbb2ea',1.3);}ctx.restore();}}
 oval(0,headY+22,10,Math.max(9,(bodyY-headY)/2),c.fur);
 const step=r.st==='run'?r.run*4:0;
 if(f!==2)for(const side of [-1,1]){const x=side*10;ctx.beginPath();ctx.moveTo(x,bodyY+12);ctx.lineTo(x+side*step,-7);stroke(INK,11);ctx.beginPath();ctx.moveTo(x,bodyY+12);ctx.lineTo(x+side*step,-7);stroke(side<0?c.dark:c.fur,7);oval(x+side*step,-4,8,5,c.belly);for(const toe of [-2,2]){ctx.beginPath();ctx.moveTo(x+side*step+toe,-5);ctx.lineTo(x+side*step+toe,-2);stroke(c.dark,.8);}}
 oval(0,bodyY,19,22,c.fur);oval(3,bodyY+3,11,14,c.belly,false);
 if(f===2)for(const [x,y,z] of [[-18,bodyY,9],[18,bodyY,8],[-10,bodyY+12,8],[10,bodyY+12,8]])oval(x,y,z,z*.8,'#fff6fb');
 ctx.beginPath();ctx.moveTo(-15,bodyY-12);ctx.quadraticCurveTo(-24,bodyY-3,-18,bodyY+5);stroke(INK,10);ctx.beginPath();ctx.moveTo(-15,bodyY-12);ctx.quadraticCurveTo(-24,bodyY-3,-18,bodyY+5);stroke(c.dark,6);
 const reach=r.st==='attack'?Math.sin(Math.PI*r.atk)*16:r.slot>=0?10:(r.michiPaw||0)*12+Math.sin(r.arm)*3;
 ctx.beginPath();ctx.moveTo(15,bodyY-12);ctx.quadraticCurveTo(23+reach,bodyY-6-reach,19+reach,bodyY+4-reach);stroke(INK,10);ctx.beginPath();ctx.moveTo(15,bodyY-12);ctx.quadraticCurveTo(23+reach,bodyY-6-reach,19+reach,bodyY+4-reach);stroke(c.fur,6);oval(19+reach,bodyY+4-reach,5,5,c.belly);
 ctx.save();ctx.translate(2,headY);if(r.mood==='angry'){ctx.rotate(-.06);}ctx.rotate(r.michiHead||0);
 for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*9,-14);ctx.quadraticCurveTo(side*23,-33,side*23,-19);ctx.lineTo(side*25,-1);ctx.closePath();ctx.fillStyle=c.fur;ctx.fill();stroke(INK,2);ctx.beginPath();ctx.moveTo(side*14,-13);ctx.lineTo(side*20,-24);ctx.lineTo(side*21,-8);ctx.fillStyle=c.ear;ctx.fill();}
 oval(0,0,25,23,c.fur);oval(-11,10,9,7,c.belly,false);oval(11,10,9,7,c.belly,false);
 for(const side of [-1,1]){oval(side*10,-1,7.2,9,'#fff8ff');oval(side*10+1,-.3,5.1,7,c.eye,false);oval(side*10+1,1,2.7,5,'#392745',false);oval(side*10-1,-3,2,2,'#fff',false);oval(side*10+3,3,1,1,'#fff',false);if(r.mood==='closed'||r.mood==='happy'||(!pose.reduceMotion&&r.t%170<5)){ctx.beginPath();ctx.moveTo(side*10-7,0);ctx.quadraticCurveTo(side*10,5,side*10+7,0);stroke(c.fur,12);stroke(INK,1.6);}oval(side*18,10,4,2.2,c.ear,false);for(const dy of [8,12]){ctx.beginPath();ctx.moveTo(side*18,dy);ctx.lineTo(side*29,dy-2);stroke(c.dark,1);}}
 ctx.beginPath();ctx.moveTo(-3,8);ctx.quadraticCurveTo(0,5,3,8);ctx.lineTo(0,11);ctx.closePath();ctx.fillStyle=c.nose;ctx.fill();ctx.beginPath();ctx.moveTo(0,11);ctx.lineTo(0,14);ctx.quadraticCurveTo(-4,18,-6,14);ctx.moveTo(0,14);ctx.quadraticCurveTo(4,18,6,14);stroke(INK,1.3);
 for(const x of [-5,0,5]){ctx.beginPath();ctx.moveTo(x,-20);ctx.lineTo(x*.8,-14);stroke(c.dark,2);}
 if(f>=3){ctx.beginPath();ctx.arc(0,-29,6,.5,5.8);stroke('#ffe5a1',2.5);}ctx.restore();
 ctx.beginPath();ctx.moveTo(-12,bodyY-14);ctx.quadraticCurveTo(0,bodyY-8,12,bodyY-14);stroke(f===4?'#6c458f':c.ear,4);oval(0,bodyY-8,4,5,'#ffe3a0');
}
function draw(ctx, pose, R) {
  const src = pose || {};
  const safe = src.look ? src : Object.assign({ look: { x: 1, y: 0 } }, src);
  const f = Math.max(0, Math.min(4, Math.round(Number(safe.form) || 0)));
  const c = PAL[f];
  const r = solve(safe);
  if(Number.isFinite(safe.michiDuetAge)){r.mood=safe.michiDuetAge<36?'happy':'angry';r.tail=2.1;r.arm=safe.michiDuetAge<36?-1.7:.4;}
  const welcome=michiWelcomeRig(safe,f);
  if(welcome.active){
    r.arm+=welcome.arm;r.leg+=welcome.leg;
    r.tail+=welcome.tail;r.bob+=welcome.bob;
    r.michiHead=welcome.head+welcome.look;r.michiEar=welcome.ear;
    r.michiWing=welcome.wing;r.mood=welcome.mood;
    r.michiHaunch=welcome.haunch;r.michiPaw=welcome.paw;r.michiLook=welcome.look;
  }
  ctx.save();
  drawMichiFootwork(ctx,safe,f,safe.t||0);
  moonSoul(ctx, safe, f, false);
  ctx.translate(0, r.bob + (safe.bounce || 0) * 2);
  // One connected original cat silhouette per form: tail, feet, shoulder
  // roots, ears and (F4 only) feathered wings expand together from the paws.
  if(welcome.active)ctx.scale(welcome.torsoX,welcome.torsoY);
  if (r.st === "dead") {
    ctx.rotate(1.05);
    ctx.translate(8, -10);
  } else if (r.st === "hurt") ctx.rotate(-0.18);
  else if (r.st === "jump") ctx.scale(0.94, 1.08);
  else if (r.st === "fall") ctx.scale(1.05, 0.92);
  else if (r.slot === 1) ctx.scale(1.08, 0.9);
  else if (safe.bodyTilt) ctx.rotate(safe.bodyTilt * 0.8);
  drawMichiPortrait(ctx,R,safe,r,c,f);
  moonSoul(ctx, safe, f, true);
  ctx.restore();
}

export default { id: "cat", draw };
