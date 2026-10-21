import {michiMotion} from "../michi-motion.js";
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
 const motion=r.motion;
 const sway=pose.reduceMotion?0:Math.sin(r.t*.065)*2+r.tail+(motion?.tail||0)*18;
 const count=f===4?3:f===3?2:1;
 for(let i=0;i<count;i++){
  const tipX=-36-i*15,tipY=bodyY-19-i*14+sway;
  ctx.beginPath();ctx.moveTo(-15,bodyY+2);ctx.bezierCurveTo(-42,bodyY+1,-57-i*8,tipY-13,tipX,tipY);stroke(INK,12-i);
  ctx.beginPath();ctx.moveTo(-15,bodyY+2);ctx.bezierCurveTo(-42,bodyY+1,-57-i*8,tipY-13,tipX,tipY);stroke(c.dark,8-i);
  oval(tipX,tipY,5-i*.5,6,c.belly);
 }
 if(f===4){for(const side of [-1,1]){ctx.save();ctx.translate(side*14,bodyY-13);ctx.scale(side,1);ctx.rotate(pose.reduceMotion?0:(motion?.wing||0));ctx.beginPath();ctx.moveTo(0,3);ctx.bezierCurveTo(19,-7,28,-40,39,-35);ctx.quadraticCurveTo(44,-21,33,-12);ctx.quadraticCurveTo(28,-4,19,-4);ctx.quadraticCurveTo(12,7,0,3);ctx.fillStyle=c.belly;ctx.fill();stroke(INK,2);for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(5+i*7,-2-i*4);ctx.quadraticCurveTo(23,-11-i*6,31+i*3,-24-i*3);stroke('#cbb2ea',1.3);}ctx.restore();}}
 oval(0,headY+22,10,Math.max(9,(bodyY-headY)/2),c.fur);
 const step=!motion&&r.st==='run'?r.run*4:0;
 if(f!==2)for(const side of [-1,1]){const x=side*10,dx=motion?(side<0?motion.backX:motion.frontX):side*step,dy=motion?(side<0?motion.backY:motion.frontY):0;ctx.save();ctx.translate(dx,dy);ctx.beginPath();ctx.moveTo(x,bodyY+12);ctx.lineTo(x+side*step,-7);stroke(INK,11);ctx.beginPath();ctx.moveTo(x,bodyY+12);ctx.lineTo(x+side*step,-7);stroke(side<0?c.dark:c.fur,7);oval(x+side*step,-4,8,5,c.belly);for(const toe of [-2,2]){ctx.beginPath();ctx.moveTo(x+side*step+toe,-5);ctx.lineTo(x+side*step+toe,-2);stroke(c.dark,.8);}ctx.restore();}
 if(f===2){
  ctx.beginPath();ctx.moveTo(-27,bodyY+2);ctx.bezierCurveTo(-43,bodyY-1,-37,bodyY-19,-23,bodyY-17);ctx.bezierCurveTo(-24,bodyY-33,-3,bodyY-35,2,bodyY-22);ctx.bezierCurveTo(15,bodyY-35,34,bodyY-23,28,bodyY-12);ctx.bezierCurveTo(46,bodyY-11,43,bodyY+9,29,bodyY+10);ctx.bezierCurveTo(24,bodyY+24,6,bodyY+24,0,bodyY+17);ctx.bezierCurveTo(-10,bodyY+28,-31,bodyY+17,-27,bodyY+2);ctx.closePath();ctx.fillStyle=c.belly;ctx.fill();stroke('#929dbc',1.7);
  oval(2,bodyY+5,18,10,'#e4effa',false);
  ctx.save();ctx.globalAlpha=.45;ctx.beginPath();ctx.ellipse(0,-2,24,3,0,0,TAU);stroke(c.accent,1.5);ctx.restore();
 }else{oval(0,bodyY,19,22,c.fur);oval(3,bodyY+3,11,14,c.belly,false);}
 ctx.save();ctx.translate(-15,bodyY-12);ctx.rotate(motion?.rearPaw||0);ctx.translate(15,-bodyY+12);ctx.beginPath();ctx.moveTo(-15,bodyY-12);ctx.quadraticCurveTo(-24,bodyY-3,-18,bodyY+5);stroke(INK,10);ctx.beginPath();ctx.moveTo(-15,bodyY-12);ctx.quadraticCurveTo(-24,bodyY-3,-18,bodyY+5);stroke(c.dark,6);ctx.restore();
 const reach=motion?motion.frontPaw*10+(r.michiPaw||0)*12+Math.sin(r.arm)*3:r.st==='attack'?Math.sin(Math.PI*r.atk)*16:r.slot>=0?10:(r.michiPaw||0)*12+Math.sin(r.arm)*3;
 ctx.beginPath();ctx.moveTo(15,bodyY-12);ctx.quadraticCurveTo(23+reach,bodyY-6-reach,19+reach,bodyY+4-reach);stroke(INK,10);ctx.beginPath();ctx.moveTo(15,bodyY-12);ctx.quadraticCurveTo(23+reach,bodyY-6-reach,19+reach,bodyY+4-reach);stroke(c.fur,6);oval(19+reach,bodyY+4-reach,5,5,c.belly);
 ctx.save();ctx.translate(2,headY);if(r.mood==='angry'){ctx.rotate(-.06);}ctx.rotate((r.michiHead||0)+(motion?.head||0));
 for(const side of [-1,1]){ctx.save();ctx.translate(side*17,-12);ctx.rotate(side*(r.michiEar||motion?.ear||0));ctx.translate(-side*17,12);ctx.beginPath();ctx.moveTo(side*9,-14);ctx.quadraticCurveTo(side*23,-33,side*23,-19);ctx.lineTo(side*25,-1);ctx.closePath();ctx.fillStyle=c.fur;ctx.fill();stroke(INK,2);ctx.beginPath();ctx.moveTo(side*14,-13);ctx.lineTo(side*20,-24);ctx.lineTo(side*21,-8);ctx.fillStyle=c.ear;ctx.fill();ctx.restore();}
 oval(0,0,25,23,c.fur);oval(-11,10,9,7,c.belly,false);oval(11,10,9,7,c.belly,false);

 for(const side of [-1,1]){
  const ex=side*10,ey=-2;
  const closed=r.mood==='closed'||r.mood==='happy'||(!pose.reduceMotion&&r.t%170<5);
  ctx.save();ctx.translate(ex,ey);
  if(closed){
   ctx.beginPath();ctx.moveTo(-6,2);ctx.quadraticCurveTo(0,r.mood==='happy'?-5:6,6,2);stroke('#49304e',1.8);
  }else{
   // Soft almond whites and a single upper lid, without spectacle-like rings.
   ctx.beginPath();ctx.moveTo(-7,1);ctx.bezierCurveTo(-7,-10,6,-11,7,0);ctx.bezierCurveTo(7,10,-6,10,-7,1);ctx.fillStyle='#fff8ff';ctx.fill();
   const gaze=Math.max(-1.2,Math.min(1.2,(pose.look?.x||0)*.8));
   oval(gaze,.4,5.2,7.3,c.eye,false);oval(gaze,3,4.2,3.2,f>=3?'#d4a9ee':'#a5d8f6',false);
   oval(gaze,-.2,2.7,5.5,'#38223f',false);
   oval(gaze-1.8,-3.3,2.1,2.3,'#fff',false);oval(gaze+2,3.8,.9,.9,'#fff',false);
   ctx.beginPath();ctx.moveTo(-7,0);ctx.bezierCurveTo(-7,-10,6,-11,7,0);stroke('#49304e',1.7);
   ctx.beginPath();ctx.moveTo(side*6,-4);ctx.lineTo(side*8,-6);stroke('#49304e',1.2);
   if(r.mood==='angry'){ctx.beginPath();ctx.moveTo(-6,-10-side*1.8);ctx.lineTo(6,-10+side*1.8);stroke(c.dark,1.8);}
  }
  ctx.restore();
  oval(side*18,10,4,2.2,c.ear,false);
  for(const dy of [8,12]){ctx.beginPath();ctx.moveTo(side*18,dy);ctx.lineTo(side*29,dy-2);stroke(c.dark,1);}
 }

 ctx.beginPath();ctx.moveTo(-3,8);ctx.quadraticCurveTo(0,5,3,8);ctx.lineTo(0,11);ctx.closePath();ctx.fillStyle=c.nose;ctx.fill();ctx.beginPath();ctx.moveTo(0,11);ctx.lineTo(0,14);ctx.quadraticCurveTo(-4,18,-6,14);ctx.moveTo(0,14);ctx.quadraticCurveTo(4,18,6,14);stroke(INK,1.3);
 for(const x of [-5,0,5]){ctx.beginPath();ctx.moveTo(x,-20);ctx.lineTo(x*.8,-14);stroke(c.dark,2);}
 if(f>=3){ctx.beginPath();ctx.arc(0,-29,6,.5,5.8);stroke('#ffe5a1',2.5);}ctx.restore();
 if(f>0){const collarY=Math.max(bodyY-14,headY+25);ctx.beginPath();ctx.moveTo(-12,collarY);ctx.quadraticCurveTo(0,collarY+3,12,collarY);stroke(f===4?'#6c458f':c.ear,4);oval(0,collarY+5,3.3,4,'#ffe3a0');}
}

// V457 · Mythic Michi: four radically different playable silhouettes.
// Canvas-only. Feet/pose origin, hitboxes, input, Moon Soul FX and timing are unchanged.
// F0 remains the readable baby cat. F1 hare, F2 spectral jelly, F3 dragon,
// F4 nine-tailed guardian are drawn from their own bodies instead of recoloring F0.
function drawMichiMythic(ctx,pose,r,f){
 const t=Number.isFinite(pose.t)?pose.t:0;
 const still=!!pose.reduceMotion;
 const wave=(phase=0,speed=.055)=>still?0:Math.sin(t*speed+phase);
 const ink='#25213e';
 const oval=(x,y,rx,ry,color,outline=ink,width=2)=>{
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);
  ctx.fillStyle=color;ctx.fill();
  if(outline){ctx.strokeStyle=outline;ctx.lineWidth=width;ctx.stroke();}
 };
 const stroke=(color,width=2)=>{
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
 };
 const gem=(x,y,color,size=5)=>{
  ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size*.73,y);
  ctx.lineTo(x,y+size);ctx.lineTo(x-size*.73,y);ctx.closePath();
  ctx.fillStyle=color;ctx.fill();stroke(ink,1);
 };
 const eye=(x,y,color,rx=5,ry=7)=>{
  if(r.mood==='closed'||r.mood==='happy'){
   ctx.beginPath();ctx.moveTo(x-rx,y);ctx.quadraticCurveTo(x,y-ry*.6,x+rx,y);
   stroke(ink,2.4);return;
  }
  oval(x,y,rx+3,ry+3,'#fff',ink,1.7);
  oval(x+(pose.look?.x||0)*1.2,y,rx,ry,color,null);
  oval(x+1,y,rx*.38,ry*.8,ink,null);
  oval(x-1.6,y-ry*.42,1.8,2.2,'#fff',null);
 };
 const angry=r.mood==='angry'||r.st==='attack'||r.slot===2;
 const lift=(r.st==='jump'||r.st==='glide')?-4:0;
 if(f===1){ // MOON HARE: towering flexible ears, spring haunches, lunar tail.
  const p=wave(0,.075),hop=still?0:Math.abs(wave(1,.12))*2.5;
  ctx.save();ctx.scale(.62,.62);ctx.translate(0,lift-hop);
  ctx.beginPath();ctx.arc(-36,-41,19,Math.PI*.32,Math.PI*1.63);
  stroke('#fbe39b',6);ctx.beginPath();ctx.arc(-35,-41,19,Math.PI*.5,Math.PI*1.5);stroke('#fff8e3',2);
  oval(-9,-23,22,25,'#c7d9fa');oval(1,-24,15,19,'#f7f9ff',null);
  for(const s of [-1,1]){
   ctx.save();ctx.translate(s*11,-15);ctx.rotate((s===1?-1:1)*p*.2);
   oval(0,0,10,17,'#a6b8de');
   oval(0,-5,7,9,'#fff5fc',null);
   ctx.restore();
  }
  for(const s of [-1,1]){
   ctx.save();ctx.translate(s*16,-77);
   ctx.rotate(s*(.12+p*.16)+(r.michiEar||0)*.16);
   oval(0,-19,10,39,'#e9f2ff');
   oval(0,-20,5.5,29,'#d4a7dc',null);
   ctx.restore();
  }
  oval(0,-71,29,26,'#eef3ff');oval(0,-62,18,9,'#ffffff',null);
  eye(-11,-72,'#516de6');eye(11,-72,'#516de6');
  oval(0,-58,3,2.7,'#f49ab4',null);
  ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(-4,-53);ctx.moveTo(0,-56);ctx.lineTo(4,-53);stroke(ink,1.5);
  gem(0,-104,'#ffe4a3',4.5);
  ctx.restore();return;
 }
 if(f===2){ // DREAM MEDUSA: no fake legs, six real flowing tentacles.
  const p=wave(0,.07),bob=wave(1,.06)*2.6;
  ctx.save();ctx.scale(.72,.72);ctx.translate(0,bob-5+lift);
  ctx.globalAlpha=.21;oval(0,-31,48,43,'#53ccdc',null);
  ctx.globalAlpha=1;
  for(let i=0;i<7;i++){
   const x=-26+i*8,drift=wave(i,.085)*5,tip=-1+(i%3)*5;
   ctx.beginPath();ctx.moveTo(x,-40);
   ctx.bezierCurveTo(x-7,-19,x+drift*2,-18,x+drift,tip);
   stroke(i%2?'#a4def0':'#a890e6',i%2?6:8);
   oval(x+drift,tip,3.5,3.5,i%2?'#ffe3ff':'#b7ffff',null);
  }
  ctx.beginPath();ctx.moveTo(-38,-65);
  ctx.bezierCurveTo(-34,-106,-21,-120,0,-118);
  ctx.bezierCurveTo(23,-117,39,-103,40,-66);
  ctx.bezierCurveTo(22,-54,13,-59,0,-52);
  ctx.bezierCurveTo(-16,-59,-28,-53,-38,-65);
  ctx.closePath();ctx.fillStyle='#d7f7ff';ctx.fill();stroke(ink,2.1);
  ctx.globalAlpha=.65;oval(0,-85,26,24,'#b8d3f9',null);ctx.globalAlpha=1;
  oval(0,-82,12,12,'#9d69e3',null);gem(0,-82,'#f9f1ff',7);
  eye(-17,-92,'#ff6bd0',4,6);eye(17,-92,'#ff6bd0',4,6);
  ctx.beginPath();ctx.moveTo(-5,-72);ctx.quadraticCurveTo(0,-68+2*p,5,-72);stroke('#53618b',1.8);
  for(const s of [-1,1])gem(s*30,-73,'#e4f9ff',3);
  ctx.restore();return;
 }
 if(f===3){ // ASTRAL DRAGON: long coiled serpent with horns and whiskers.
  const p=wave(0,.055);
  ctx.save();ctx.scale(.86,.86);ctx.translate(0,lift);
  ctx.beginPath();ctx.moveTo(-3,-39);
  ctx.bezierCurveTo(-55,-7,-75,-38,-64,-67);
  ctx.bezierCurveTo(-48,-100,-76,-109,-91,-88);
  stroke(ink,25);stroke('#60447d',19);stroke('#a889d1',6);
  for(let i=0;i<7;i++)gem(-66+i*7,-44-i*2,'#d6ba72',3.6);
  oval(0,-28,23,25,'#573e7a');oval(3,-24,12,15,'#b99ac9',null);
  for(const s of [-1,1]){
   ctx.beginPath();ctx.moveTo(s*13,-30);
   ctx.quadraticCurveTo(s*(19+p*3),-10,s*18,0);stroke(ink,9);stroke('#7b5b9b',6);
   oval(s*18,0,8,4,'#d8b17c');
  }
  ctx.beginPath();ctx.moveTo(-22,-75);ctx.quadraticCurveTo(-37,-100,-20,-111);
  ctx.lineTo(-6,-95);ctx.closePath();ctx.fillStyle='#e0b969';ctx.fill();stroke(ink,1.7);
  ctx.beginPath();ctx.moveTo(22,-75);ctx.quadraticCurveTo(37,-100,20,-111);
  ctx.lineTo(6,-95);ctx.closePath();ctx.fillStyle='#e0b969';ctx.fill();stroke(ink,1.7);
  oval(0,-68,29,25,'#5a3878');oval(0,-56,19,9,'#b798bb',null);
  eye(-12,-73,'#ffa43b',5,6.5);eye(12,-73,'#ffa43b',5,6.5);
  for(const s of [-1,1]){
   ctx.beginPath();ctx.moveTo(s*17,-55);
   ctx.quadraticCurveTo(s*(41+p*2),-54,s*49,-67);
   stroke('#ebc582',2);
  }
  gem(0,-94,'#ffd86d',6);
  if(angry){gem(38+p*3,-61,'#ffb649',5);}
  ctx.restore();return;
 }
 if(f===4){ // NINE-TAIL GUARDIAN: nine countable, independently moving tails.
  const p=wave(0,.06);
  ctx.save();ctx.scale(.92,.92);ctx.translate(0,lift);
  for(let i=0;i<9;i++){
   const a=-Math.PI*.85+i*Math.PI*1.7/8;
   const endX=Math.cos(a)*68-6, endY=-44+Math.sin(a)*37+wave(i,.045)*4;
   ctx.beginPath();ctx.moveTo(-12,-29);
   ctx.bezierCurveTo(-30,-74,-3+endX*.8,endY-41,endX,endY);
   stroke('#3d2b50',14);stroke(i%2?'#eac87b':'#fff2cb',10);
   oval(endX,endY,5,7,i%2?'#fffefa':'#ffde9a',null);
  }
  oval(0,-24,20,26,'#fff3d9');oval(2,-22,13,16,'#fff',null);
  for(const s of [-1,1]){
   ctx.beginPath();ctx.moveTo(s*11,-12);ctx.lineTo(s*16,-1);stroke(ink,9);stroke('#f7dfb4',6);
   oval(s*17,-1,7,4,'#fff9e9',null);
   ctx.beginPath();ctx.moveTo(s*17,-77);ctx.lineTo(s*39,-111);
   ctx.lineTo(s*33,-61);ctx.closePath();ctx.fillStyle='#fff5d4';ctx.fill();stroke(ink,2);
   ctx.beginPath();ctx.moveTo(s*23,-77);ctx.lineTo(s*33,-98);ctx.lineTo(s*29,-73);
   ctx.closePath();ctx.fillStyle='#efbad6';ctx.fill();
  }
  oval(0,-69,33,27,'#fff7df');oval(0,-59,21,12,'#fff',null);
  eye(-14,-72,'#d04f99',6,8);eye(14,-72,'#d04f99',6,8);
  oval(0,-57,4,3,'#e897a9',null);
  gem(0,-86,'#f1c65e',6);
  ctx.globalAlpha=.66;ctx.beginPath();ctx.arc(0,-72,42,Math.PI*1.1,Math.PI*1.9);
  stroke('#f2d479',3);ctx.globalAlpha=1;
  // Playful tail flick, not another damaging hitbox.
  if(r.fl>.22&&r.st==='idle'){gem(36,-109-4*p,'#fbd59a',4);}
  ctx.restore();return;
 }
}

function draw(ctx, pose, R) {
  const src = pose || {};
  const safe = src.look ? src : Object.assign({ look: { x: 1, y: 0 } }, src);
  const f = Math.max(0, Math.min(4, Math.round(Number(safe.form) || 0)));
  const c = f===2?{...PAL[f],fur:'#f8f6ff',dark:'#a9badf',belly:'#ffffff',ear:'#d0c6f0',eye:'#549fd3',accent:'#a8e5f6'}:PAL[f];
  const r = solve(safe);
  if(!safe.michiWelcome&&!Number.isFinite(safe.michiDuetAge)){r.motion=michiMotion(safe,f);if(r.motion.mood)r.mood=r.motion.mood;}
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
  if(r.motion){ctx.translate(0,r.motion.lift+r.motion.crouch);ctx.rotate(r.motion.lean);ctx.scale(r.motion.sx,r.motion.sy);}
  if (r.st === "dead") {
    ctx.rotate(1.05);
    ctx.translate(8, -10);
  } else if (r.st === "hurt") ctx.rotate(-0.18);
  else if (r.st === "jump") ctx.scale(0.94, 1.08);
  else if (r.st === "fall") ctx.scale(1.05, 0.92);
  else if (r.slot === 1) ctx.scale(1.08, 0.9);
  else if (safe.bodyTilt) ctx.rotate(safe.bodyTilt * 0.8);
  if (f===0) drawMichiPortrait(ctx,R,safe,r,c,f);
  else drawMichiMythic(ctx,safe,r,f);
  moonSoul(ctx, safe, f, true);
  ctx.restore();
}

export default { id: "cat", draw };
