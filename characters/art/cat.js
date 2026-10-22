import {michiMotion} from "../michi-motion.js";
import {michiGenome,jellyPulse,drawJellyBell,drawTentacle,halo,motes,ribbon} from "../michi-jelly.js";
// Michicornio: 5-stage lunar CAT lineage (baby, lynx, ear-jelly, dragon, nine-tentacle guardian).
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
  const t = pose.reduceMotion ? 0 : (pose.t || 0);
  const phase = pose.reduceMotion ? 0 : (pose.phase || 0);
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
  const t = pose.reduceMotion ? 0 : (Number.isFinite(pose.t) ? pose.t : 0);
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

// V459 · Mythic Michicornio: five feline forms with shared ear/horn/tentacle genealogy.
// Canvas-only. Feet/pose origin, hitboxes, input, Moon Soul FX and timing are unchanged.
// Michicornio: five independent luminous silhouettes with a shared moon-horn crest.
function drawMichiMythic(ctx,pose,r,f){
 const t=pose.reduceMotion?0:(Number.isFinite(pose.t)?pose.t:0);
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
  if(r.mood==='closed'||r.mood==='happy'||r.motion?.blink){
   ctx.beginPath();ctx.moveTo(x-rx,y);ctx.quadraticCurveTo(x,y-ry*.6,x+rx,y);
   stroke(ink,2.4);return;
  }
  oval(x,y,rx+3,ry+3,'#fff',ink,1.7);
  const gaze=(pose.look?.x||0)*1.2+(r.motion?.lookX||0)*1.4;
  oval(x+gaze,y,rx,ry,color,null);
  oval(x+gaze+1,y,rx*.38,ry*.8,ink,null);
  oval(x-1.6,y-ry*.42,1.8,2.2,'#fff',null);
 };
 const angry=r.mood==='angry'||r.st==='attack'||r.slot===2;
 const lift=(r.st==='jump'||r.st==='glide')?-4:0;
 if(f===0){ // MOON KITTEN: fully redrawn baby, not the old cat portrait.
  const sway=wave(0,.075);
  ctx.save();ctx.scale(.70,.70);ctx.translate(0,lift);
  // A curled crescent tail remains recognizable even at tiny sizes.
  ctx.beginPath();ctx.moveTo(-13,-26);
  ctx.bezierCurveTo(-40,-19,-53+(r.motion?.tail||0)*6,-54,-32+(r.motion?.tail||0)*3,-72);
  ctx.bezierCurveTo(-14,-81,-12,-62,-26+(r.motion?.tail||0)*3,-58);
  stroke(ink,12);stroke('#dbc7f5',8);
  {const dream=michiGenome(pose.michiSeed).palette;halo(ctx,-26,-58,7,7,dream.glow,1.6+(still?0:Math.sin(t*.06)*.4));oval(-26,-58,4,4,dream.tip,null);gem(-26,-58,dream.bead,2.4);}
  for(const side of [-1,1]){
   ctx.save();ctx.translate((r.motion?.frontX||0)*side*.34,(side>0?r.motion?.frontY:r.motion?.backY)||0);
   oval(side*13,-5,11,6,'#e6d5f9');ctx.restore();
  }
  oval(0,-27,23,27,'#c8b5f0');
  oval(2,-26,14,19,'#fff7e9',null);
  ctx.beginPath();ctx.arc(4,-31,10,-1.25,2.25);stroke('#eabf63',3);
  oval(0,-23,7,9,'#c8b5f0',null);
  for(const side of [-1,1]){
   const bend=(side>0?r.motion?.frontPaw:r.motion?.rearPaw)||0;
   const pawY=-27+(r.st==='run'?sway*2:0)-bend*7;
   ctx.beginPath();ctx.moveTo(side*15,-37);
   ctx.quadraticCurveTo(side*(29+bend*4),-35,side*(25+bend*5),pawY);
   stroke(ink,8);stroke('#e4d0f7',5);
   oval(side*(25+bend*5),pawY,5.5,5.5,'#fff3f9');
  }
  ctx.save();ctx.translate(0,-70);
  ctx.rotate((r.michiHead||0)*.30+(r.motion?.head||0)+sway*.035);
  // Asymmetric star ears: unique facial language, not reused cat outlines.
  for(const side of [-1,1]){
   ctx.beginPath();ctx.moveTo(side*13,-17);
   ctx.lineTo(side*29,-43+(side===1?sway:0)-(r.motion?.ear||0)*8);
   ctx.quadraticCurveTo(side*36,-26,side*29,-2);
   ctx.closePath();ctx.fillStyle='#d9c6f6';ctx.fill();stroke(ink,2.6);
   ctx.beginPath();ctx.moveTo(side*20,-16);
   ctx.lineTo(side*29,-32);ctx.lineTo(side*26,-10);
   ctx.closePath();ctx.fillStyle='#f5b6d8';ctx.fill();
  }
  oval(0,0,32,28,'#e6d9fb');
  oval(0,13,19,11,'#fff8f1',null);
  eye(-13,-3,'#6d68d9',6,8);
  eye(13,-3,'#6d68d9',6,8);
  oval(0,11,4,3,'#e995b6',null);
  ctx.beginPath();ctx.moveTo(0,14);ctx.quadraticCurveTo(-4,19,-7,15);
  ctx.moveTo(0,14);ctx.quadraticCurveTo(4,19,7,15);stroke(ink,1.8);
  for(const side of [-1,1])for(const y of [11,16]){
   ctx.beginPath();ctx.moveTo(side*20,y);ctx.lineTo(side*37,y-3);stroke('#8e77bd',1.4);
  }
  gem(0,-20,'#ffe2a0',6);
   ctx.beginPath();ctx.moveTo(-4,-20);ctx.lineTo(0,-41);ctx.lineTo(4,-20);ctx.closePath();ctx.fillStyle='#ffe3ab';ctx.fill();stroke(ink,2);
  ctx.save();ctx.globalAlpha=.75;oval(-20,5,4.5,2.4,'#f6a6c8',null);oval(20,5,4.5,2.4,'#f6a6c8',null);ctx.restore();
  for(const x of [-6,0,6]){ctx.beginPath();ctx.moveTo(x,-27);ctx.lineTo(x*.75,-21);stroke('#b9a3e6',1.6);}
  ctx.save();ctx.globalAlpha=.3;ctx.beginPath();ctx.ellipse(0,21,22,6,0,0,Math.PI);ctx.fillStyle='#a993d8';ctx.fill();ctx.restore();
  ctx.restore();ctx.restore();return;
 }
 if(f===1){ // LUNAR LYNX: a growing feline, NOT a rabbit between two cats.
  const stride=r.st==='run'?(r.motion?.cycle??wave(0,.21))*8:0, breath=wave(.4,.064)*1.1;
  const leap=r.st==='jump'?5:r.st==='fall'?-3:0, paw=r.motion?.frontPaw||0;
  ctx.save();ctx.scale(.69,.69);ctx.translate(0,lift-leap-(r.motion?.bounce||0)*.2);
  // Crescent-tail anatomy continues the F0 kitten and will become F2 tentacles.
  ctx.beginPath();ctx.moveTo(-15,-31);
  ctx.bezierCurveTo(-42,-30,-53,-58+stride*.6,-46,-79+stride);
  ctx.bezierCurveTo(-42,-103,-27,-93,-30,-83);
  stroke(ink,13);stroke('#bfa5ec',9);
  {const dream=michiGenome(pose.michiSeed).palette;halo(ctx,-31,-84+stride,11,12,dream.glow,1.4+(still?0:Math.sin(t*.06)*.4));}
  oval(-31,-84+stride,7,8,'#e7d3ff');
  gem(-32,-85+stride,'#fff2bd',3.5);
  // Real haunches, four grounded paw anchors and chest. No elongated hare legs.
  for(const side of [-1,1]){
   oval(side*16,-20,14,24,'#a991d8');
   ctx.save();ctx.translate(side*16,-6+side*stride*.7+((side>0?r.motion?.frontY:r.motion?.backY)||0)*.65);
   ctx.rotate(side*(stride*.02));
   oval(0,1,10,7,'#f6e9ff');
   for(let toe=-1;toe<=1;toe++)oval(toe*4,4,2.2,2.2,'#cb9dcf',null);
   ctx.restore();
  }
  oval(0,-41+breath,26,32,'#9b86cb');
  oval(1,-41+breath,17,25,'#fff5ff',null);
  ctx.beginPath();ctx.moveTo(-10,-60+breath);for(let k=0;k<5;k++){ctx.lineTo(-7+k*4.5,-52+breath+(k%2)*4);}ctx.lineTo(11,-60+breath);ctx.fillStyle='#fff5ff';ctx.fill();
  // Shoulder-to-wrist animation, independent from the haunches.
  for(const side of [-1,1]){
   const flex=(side>0?paw:-(r.motion?.rearPaw||0))*7;
   ctx.beginPath();ctx.moveTo(side*18,-53);
   ctx.quadraticCurveTo(side*(28+flex),-36,side*(21+flex),-20+stride*side);
   stroke(ink,10);stroke('#c5b0ed',6);
   oval(side*(21+flex),-20+stride*side,7,6,'#f8e8ff');
  }
  // Cat ruff and chin lock the lineage to F0.
  for(const side of [-1,1]){
   ctx.beginPath();ctx.moveTo(side*11,-67);ctx.lineTo(side*26,-55);
   ctx.lineTo(side*18,-53);ctx.lineTo(side*30,-46);
   ctx.lineTo(side*13,-48);ctx.closePath();ctx.fillStyle='#e4d3fc';ctx.fill();stroke('#574471',1.7);
  }
  ctx.save();ctx.translate(0,-84+breath);
  ctx.rotate((r.michiHead||0)*.24+(r.motion?.head||0)*.7+wave(0,.05)*.022);
  // Short, triangular tufted CAT ears. Their inner stars prefigure F2.
  for(const side of [-1,1]){
   const ear=still?0:wave(side,.083)*3+(r.motion?.ear||0)*6;
   ctx.beginPath();ctx.moveTo(side*12,-13);
   ctx.lineTo(side*32,-45+ear);
   ctx.lineTo(side*37,-6);
   ctx.closePath();ctx.fillStyle='#a78ccd';ctx.fill();stroke(ink,2.7);
   ctx.beginPath();ctx.moveTo(side*19,-14);ctx.lineTo(side*31,-35+ear);
   ctx.lineTo(side*31,-10);ctx.closePath();ctx.fillStyle='#efbfe9';ctx.fill();
   ctx.beginPath();ctx.moveTo(side*30,-35+ear);ctx.lineTo(side*40,-34+ear);
   stroke('#f5dcff',3);
  }
  oval(0,0,34,29,'#c4b1e6');
  oval(0,11,24,15,'#fff8ff',null);
  eye(-14,-3,'#6265d6',6.7,8.6);eye(14,-3,'#6265d6',6.7,8.6);
  oval(0,11,4,3,'#d78ba9',null);
  ctx.beginPath();ctx.moveTo(0,14);ctx.quadraticCurveTo(-5,19,-9,14);
  ctx.moveTo(0,14);ctx.quadraticCurveTo(5,19,9,14);stroke(ink,1.8);
  for(const side of [-1,1])for(const dy of [12,18]){
   ctx.beginPath();ctx.moveTo(side*17,dy);
   ctx.lineTo(side*(34+(r.st==='attack'?5:0)),dy-4);stroke('#79609d',1.5);
  }
  ctx.save();ctx.globalAlpha=.7;oval(-22,8,5,2.6,'#f3a9cc',null);oval(22,8,5,2.6,'#f3a9cc',null);ctx.restore();
  for(const x of [-7,0,7]){ctx.beginPath();ctx.moveTo(x,-26);ctx.lineTo(x*.7,-18);stroke('#9178bf',1.8);}
  // Moon horn emerges from the forehead, not the ears.
  ctx.beginPath();ctx.moveTo(-7,-23);ctx.lineTo(0,-45);
  ctx.lineTo(7,-23);ctx.closePath();ctx.fillStyle='#ffe5a9';ctx.fill();stroke(ink,2.1);
  gem(0,-24,'#fffaf0',4.8);
  if(r.st==='cast')for(const side of [-1,1])gem(side*26,-30+wave(side,.13)*3,'#f6ecff',3);
  ctx.restore();ctx.restore();return;
 }
 if(f===2){ // DREAM MEDUSA: a real moon jelly (Aurelia) that kept its cat face, ears and horn.
  // V461: translucent umbrella, four horseshoe gonads, seven marginal tentacles with
  // travelling waves, two frilled oral arms, fast-contract/slow-relax swim pulse.
  const g=michiGenome(pose.michiSeed),pal=g.palette,cast=r.st==='cast',attack=angry||r.st==='attack';
  const unit=v=>Math.max(0,Math.min(1,Number(v)||0));
  let c=jellyPulse(t,g,still).c;
  if(r.st==='jump')c=Math.max(c,.85);else if(r.st==='fall'||r.st==='glide')c*=.2;else if(r.st==='hurt')c=.55;
  const atkK=r.st==='attack'?Math.sin(Math.PI*unit(r.atk)):0,castK=cast?Math.sin(Math.PI*unit(r.cast)):0;
  const victory=r.st==='victory',sweep=r.motion?.ribbon||0;
  const trail=r.st==='run'?-10:r.st==='glide'?-4:0,float=r.st==='fall'||r.st==='glide'?1:0;
  ctx.save();ctx.scale(.68,.68);
  ctx.translate(0,-5+lift-c*5+wave(0,.064)*1.6-(r.motion?.bounce||0)*.32);
  const rimY=-62,bellH=58,bellW=40;
  const tent=(i,front)=>{
   const lane=i-3,ax=lane*bellW*.27*(1-.1*c)*(1+castK*.25);
   const lash=front&&lane>0?atkK:0;
   return drawTentacle(ctx,{x:ax,y:rimY+3,len:(54+(i%3)*4)*g.lengths[i]*(1-float*.12),
    phase:g.phases[i],t,still,amp:4.5+c*2.5+float*3+(victory?3:0)+castK*2,
    sway:trail+sweep*(i%2?4:-5)+lash*34+lane*castK*7,lift:c*.8+float*.6,
    curl:(victory?(i%2?.55:-.55):0)+lash*.6+(r.st==='hurt'?-.4:0),
    dir:Math.PI/2-lash*.75,width:front?4.6:5.4,alpha:front?.88:.78,
    fill:i%2?pal.glow:pal.arm,edge:pal.ink,edgeWidth:.9,core:'#ffffff',beads:pal.bead});
  };
  halo(ctx,0,-70,50,44,pal.glow2,.7+castK+(victory?.4:0));
  // Behind the umbrella: frilled oral arms + even tentacles, seen through the glass.
  for(const side of [-1,1])for(const layer of [0,1])drawTentacle(ctx,{x:side*7,y:rimY-4,len:40+layer*6,
   phase:g.phases[7+(side>0)]+layer*1.9,t,still,amp:3.2+c*1.5,sway:trail*.6+side*(3+castK*6),lift:c,
   curl:side*.25,width:11-layer*3,alpha:.72,fill:layer?pal.gonad:pal.arm,edge:pal.ink,edgeWidth:.7,core:pal.rim});
  for(let i=0;i<7;i+=2)tent(i,false);
  const B=drawJellyBell(ctx,{x:0,y:rimY,w:bellW,h:bellH,pal,t,c,still,ink:pal.ink,spots:g.spots,
   glow:.8+castK,flash:r.st==='hurt'?1:0});
  for(let i=1;i<7;i+=2)tent(i,true);
  // Ears are inherited from F1, now crystal-cat fins on the glass bell.
  // They are attached to the crown, so the medusa remains unmistakably feline.
  const top=B.top;
  for(const side of [-1,1]){
   const flick=wave(side*1.5,.092)*4+(r.motion?.ear||0)*8-c*3;
   ctx.save();ctx.globalAlpha=.92;
   ctx.beginPath();ctx.moveTo(side*13,top+9);
   ctx.quadraticCurveTo(side*24,top-1,side*30,top-14+flick);
   ctx.quadraticCurveTo(side*37,top+6,side*33,top+20);ctx.closePath();
   ctx.fillStyle=pal.bell;ctx.fill();stroke(pal.ink,2.4);
   ctx.beginPath();ctx.moveTo(side*20,top+9);ctx.lineTo(side*29,top-8+flick);
   ctx.lineTo(side*31,top+14);ctx.closePath();ctx.fillStyle=pal.gonad;ctx.globalAlpha=.7;ctx.fill();
   ctx.restore();gem(side*30,top-9+flick,pal.bead,2.6);
  }
  // A paired whisker signature follows all five forms.
  for(const side of [-1,1])for(const dy of [-1,6]){
   ctx.beginPath();ctx.moveTo(side*22,-80+dy);
   ctx.quadraticCurveTo(side*36,-81+dy,side*48,-86+dy+wave(side,.08)*2);
   stroke(pal.ink,1.3);
  }
  // The horn is part of the body, not an oversized detached particle.
  ctx.beginPath();ctx.moveTo(-5.5,top+3);ctx.lineTo(0,top-19-castK*3);ctx.lineTo(5.5,top+3);ctx.closePath();
  ctx.fillStyle='#ffe2a8';ctx.fill();stroke(pal.ink,1.8);
  ctx.beginPath();ctx.moveTo(-3,top-3);ctx.lineTo(3,top-6);ctx.moveTo(-2,top-10);ctx.lineTo(2,top-12);stroke('#c99a52',1.1);
  if(cast)halo(ctx,0,top-12,9+castK*6,9+castK*6,'#fff3b8',1.5);
  eye(-15,-88,pal.ink==='#33335e'?'#5f7fe8':'#c56ad0',4.4,6.2);eye(15,-88,pal.ink==='#33335e'?'#5f7fe8':'#c56ad0',4.4,6.2);
  ctx.beginPath();ctx.moveTo(-1.8,-79);ctx.lineTo(1.8,-79);ctx.lineTo(0,-77);ctx.closePath();ctx.fillStyle='#f08fb0';ctx.fill();
  ctx.beginPath();ctx.moveTo(0,-77);ctx.quadraticCurveTo(-3.5,-72-(r.motion?.jaw||0)*3,-6,-75);
  ctx.moveTo(0,-77);ctx.quadraticCurveTo(3.5,-72-(r.motion?.jaw||0)*3,6,-75);stroke(pal.ink,1.5);
  ctx.save();ctx.globalAlpha=.55;for(const s of [-1,1])oval(s*26,-77,5,2.6,pal.gonad,null);ctx.restore();
  motes(ctx,t,g,{x:0,y:-30,spread:44,height:100,count:cast||victory?9:6,color:pal.bead,size:1.7,strength:.7+castK*.6,still});
  if(cast||attack){
   ctx.save();ctx.globalAlpha=.5*(cast?castK:atkK)+.1;ctx.strokeStyle=pal.rim;ctx.lineWidth=2;
   ctx.beginPath();ctx.ellipse(0,-88,46+castK*8,36+castK*4,0,0,TAU);ctx.stroke();
   for(let j=0;j<4;j++){const angle=j*TAU/4+t*.023;gem(Math.cos(angle)*48,-88+Math.sin(angle)*38,pal.bead,3);}
   ctx.restore();
  }
  ctx.restore();return;
 }
 if(f===3){ // ASTRAL DRAGON: long coiled serpent with horns and whiskers.
  // V461: tapered serpentine body with a translucent jelly dorsal fin and a
  // medusa tail-tuft, so the dragon visibly descends from the Medusa Onírica.
  const g=michiGenome(pose.michiSeed),pal=g.palette;
  const p=wave(0,.055),sweep=r.motion?.ribbon||0,tl=(r.motion?.tail||0);
  ctx.save();ctx.scale(.98,.98);ctx.translate(0,lift-(r.motion?.bounce||0)*.18);
  // The serpent coils BEHIND the body in an S that rises over the shoulder.
  const spine=[],bz=(a,b,c,d,u)=>{const v=1-u;return v*v*v*a+3*v*v*u*b+3*v*u*u*c+u*u*u*d;};
  for(let k=0;k<=15;k++){const s=k/15,undul=still?0:Math.sin(s*5-t*.065)*4.5*s;
   const bx=bz(-6,-62,-80-sweep*5,-48+tl*6,s),by=bz(-30,-14,-84,-96-g.tailCurl*5,s);
   spine.push([bx+undul,by+undul*.6+tl*5*s*s]);}
  const widths=spine.map((_,k)=>22*(1-k/15*.8)+1.5);
  // Dorsal fin: glassy jelly membrane riding the spine wave.
  const fin=spine.map((q,k)=>{const a=spine[Math.max(0,k-1)],b=spine[Math.min(15,k+1)];let nx=-(b[1]-a[1]),ny=b[0]-a[0];const d=Math.hypot(nx,ny)||1;
   const off=widths[k]*.5+4+(still?0:Math.sin(k*1.1-t*.12)*2);return [q[0]+nx/d*off,q[1]+ny/d*off];});
  ctx.save();ctx.globalAlpha=.55;ribbon(ctx,fin,widths.map(w=>w*.45+3),pal.glow,pal.ink,.8);ctx.restore();
  ribbon(ctx,spine,widths,'#5b3f7c',ink,2.2);
  ribbon(ctx,spine.map(q=>[q[0]+1.5,q[1]+1.5]),widths.map(w=>w*.42),'#a98ad3',null);
  ctx.save();ctx.strokeStyle='#e2c07a';ctx.lineWidth=1.3;ctx.globalAlpha=.85;
  for(let k=2;k<14;k+=2){const q=spine[k];ctx.beginPath();ctx.arc(q[0],q[1],widths[k]*.22,Math.PI*.1,Math.PI*.9);ctx.stroke();}
  ctx.restore();
  const tip=spine[15];
  for(let j=0;j<3;j++)drawTentacle(ctx,{x:tip[0],y:tip[1],len:16+j*3,phase:g.phases[j],t,still,amp:3,
   dir:Math.PI*(.85+j*.2),width:3.2,alpha:.85,fill:j%2?pal.glow:pal.arm,edge:pal.ink,edgeWidth:.7,beads:pal.bead});
  oval(0,-28,23,25,'#573e7a');oval(3,-24,12,15,'#b99ac9',null);
  for(const s of [-1,1]){
   ctx.beginPath();ctx.moveTo(s*13,-30);
   ctx.quadraticCurveTo(s*(19+p*3),-10,s*18,0);stroke(ink,9);stroke('#7b5b9b',6);
   oval(s*18,0,8,4,'#d8b17c');
   for(const toe of [-3,0,3]){ctx.beginPath();ctx.moveTo(s*18+toe,2);ctx.lineTo(s*18+toe*1.3,5);stroke('#f6e0b0',1.4);}
  }
  ctx.beginPath();ctx.moveTo(-22,-75);ctx.quadraticCurveTo(-37,-100,-20,-111);
  ctx.lineTo(-6,-95);ctx.closePath();ctx.fillStyle='#e0b969';ctx.fill();stroke(ink,1.7);
  ctx.beginPath();ctx.moveTo(22,-75);ctx.quadraticCurveTo(37,-100,20,-111);
  ctx.lineTo(6,-95);ctx.closePath();ctx.fillStyle='#e0b969';ctx.fill();stroke(ink,1.7);
  oval(0,-68,29,25,'#5a3878');oval(0,-56,19,9,'#b798bb',null);
  ctx.save();ctx.globalAlpha=.35;oval(-10,-80,10,5,'#8f6db8',null);ctx.restore();
  eye(-12,-73,'#ffa43b',5,6.5);eye(12,-73,'#ffa43b',5,6.5);
  for(const s of [-1,1]){
   ctx.beginPath();ctx.moveTo(s*17,-55);
   ctx.quadraticCurveTo(s*(41+p*2),-54,s*49,-67+(still?0:Math.sin(t*.07+s)*3));
   stroke('#ebc582',2);
  }
  // Crystal cat ears and seven inherited jelly ribbons on the astral dragon.
  for(const side of [-1,1]){
   ctx.beginPath();ctx.moveTo(side*18,-86);ctx.lineTo(side*33,-120+(r.motion?.ear||0)*5);
   ctx.lineTo(side*34,-78);ctx.closePath();ctx.fillStyle='#d3b7f3';ctx.fill();stroke(ink,2);
   ctx.beginPath();ctx.moveTo(side*24,-85);ctx.lineTo(side*31,-107);
   ctx.lineTo(side*30,-82);ctx.fillStyle='#eeb1dc';ctx.fill();
  }
  for(let i=0;i<5;i++)drawTentacle(ctx,{x:-20+i*10,y:-26,len:26+(i%2)*4,phase:g.phases[i+3],t,still,amp:3.5,
   sway:sweep*(i%2?6:-5),width:3.4,alpha:.8,fill:i%2?pal.glow:pal.arm,edge:pal.ink,edgeWidth:.7,beads:pal.bead});
  gem(0,-94,'#ffd86d',6);
  ctx.beginPath();ctx.moveTo(-5,-92);ctx.lineTo(0,-117);ctx.lineTo(5,-92);ctx.closePath();ctx.fillStyle='#ffe0b3';ctx.fill();stroke(ink,2);
  if(angry){gem(38+p*3,-61,'#ffb649',5);}
  ctx.restore();return;
 }
 if(f===4){ // NINE-TAIL GUARDIAN: nine countable, independently moving tails.
  const p=wave(0,.06),sweep=r.motion?.ribbon||0;
  ctx.save();ctx.scale(.99,.99);ctx.translate(0,lift-(r.motion?.bounce||0)*.16);
  // Nine EXPLICIT jelly-tendrils: the F2 medusa grows into a crown of
  // independent luminous ribbons with shared nerve/glow anatomy.
  // V461: an eclipse bell (translucent moon-jelly mantle) carries the nine
  // tentacles as a swimming skirt; each has its own seeded phase and length.
  const g=michiGenome(pose.michiSeed),pal=g.palette;
  let c=jellyPulse(t,g,still).c;if(r.st==='jump')c=Math.max(c,.8);
  const unitK=v=>Math.max(0,Math.min(1,Number(v)||0));
  const atkK=r.st==='attack'?Math.sin(Math.PI*unitK(r.atk)):0,castK=r.st==='cast'?Math.sin(Math.PI*unitK(r.cast)):0;
  halo(ctx,0,-86,62,52,pal.glow2,.7+castK);
  const M=drawJellyBell(ctx,{x:0,y:-58,w:56,h:56,pal,t,c,still,ink:pal.ink,spots:g.spots,alpha:.42,glow:.6+castK,lobes:9});
  for(let i=0;i<9;i++){
   const fan=Math.PI*(.84-i*.085)+(i-4)*c*-.03,lash=i>=6?atkK:0;
   const e=drawTentacle(ctx,{x:M.anchors[i][0]*.92,y:M.anchors[i][1]-2,len:58*g.lengths[i]*(1+castK*.1),phase:g.phases[i],t,still,
    amp:5+c*3+castK*2,sway:sweep*(i%2?4:-5)+lash*26,lift:c*.7,curl:(i<4?.35:i>4?-.35:0)+lash*.5,
    dir:fan-lash*.5,width:7,alpha:.86,fill:i%3===0?pal.glow:i%2?pal.arm:pal.gonad,edge:ink,edgeWidth:1.1,core:'#ffffff',beads:pal.bead});
   gem(e[0],e[1],i%2?'#ffde9e':pal.bead,3.3);
  }
  motes(ctx,t,g,{x:0,y:-20,spread:70,height:120,count:r.st==='victory'||r.st==='cast'?10:7,color:pal.bead,size:1.8,strength:.8+castK*.5,still});
  // Medusa glass mantle retained as the guardian's living collar.
  oval(0,-24,20,26,'#fff3d9');oval(2,-22,13,16,'#fff',null);
  for(const s of [-1,1]){
   ctx.beginPath();ctx.moveTo(s*11,-12);ctx.lineTo(s*16,-1);stroke(ink,9);stroke('#f7dfb4',6);
   oval(s*17,-1,7,4,'#fff9e9',null);
   ctx.beginPath();ctx.moveTo(s*17,-77);ctx.lineTo(s*39,-111);
   ctx.lineTo(s*33,-61);ctx.closePath();ctx.fillStyle='#fff5d4';ctx.fill();stroke(ink,2);
   ctx.beginPath();ctx.moveTo(s*23,-77);ctx.lineTo(s*33,-98);ctx.lineTo(s*29,-73);
   ctx.closePath();ctx.fillStyle='#efbad6';ctx.fill();
  }
  // Eyes, mouth, expressive cat ears remain connected to F0.
  oval(0,-69,33,27,'#fff7df');oval(0,-59,21,12,'#fff',null);
  eye(-14,-72,'#d04f99',6,8);eye(14,-72,'#d04f99',6,8);
  oval(0,-57,4,3,'#e897a9',null);
  gem(0,-86,'#f1c65e',6);
  ctx.beginPath();ctx.moveTo(-6,-83);ctx.lineTo(0,-116);ctx.lineTo(6,-83);ctx.closePath();ctx.fillStyle='#fff1a9';ctx.fill();stroke(ink,2.2);
  if(!still)for(let j=0;j<3;j++){const aa=t*.035+j*TAU/3;gem(Math.cos(aa)*21,-112+Math.sin(aa)*7,'#f9dcff',2.4);}
  ctx.globalAlpha=.66;ctx.beginPath();ctx.arc(0,-72,42,Math.PI*1.1,Math.PI*1.9);
  stroke('#f2d479',3);ctx.globalAlpha=1;
  // Playful tail flick, not another damaging hitbox.
  if(r.fl>.22&&r.st==='idle'){gem(36,-109-4*p,'#fbd59a',4);}
  ctx.restore();return;
 }
}


/* Ten distinct Michicornio acting beats, in character-space. These are physical
   gestures with tiny readable accents, not a second generic particle cloud.
   F0→F4 keep moon horn/ears and increasingly articulate jelly ribbons. */
export const MICHICORNIO_ACTIONS=Object.freeze(['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory']);
function drawMichicornioGesture(ctx,pose,r,form){
 const state=pose.state||'idle';
 if(!MICHICORNIO_ACTIONS.includes(state))return;
 const reduced=!!pose.reduceMotion,t=reduced?0:(Number(pose.t)||0);
 const beat=reduced?0:Math.sin(t*.13),kin=reduced?0:Math.sin(t*.08);
 const y=[-64,-87,-91,-75,-72][form];
 const scale=[.76,.83,.93,1.06,1.15][form];
 ctx.save();ctx.scale(scale,scale);
 ctx.strokeStyle=form>=3?'#ffe7b3':'#e8c1fa';
 ctx.lineWidth=1.9;ctx.lineCap='round';ctx.lineJoin='round';
 const curl=(x,yy,spread,alpha)=>{
  ctx.globalAlpha=alpha;ctx.beginPath();ctx.moveTo(x-spread,yy+8);
  ctx.quadraticCurveTo(x,yy-spread/2+kin*3,x+spread,yy+6);
  ctx.stroke();
 };
 const diamond=(x,yy,rr,color)=>{
  ctx.beginPath();ctx.moveTo(x,yy-rr);ctx.lineTo(x+rr*.65,yy);
  ctx.lineTo(x,yy+rr);ctx.lineTo(x-rr*.65,yy);ctx.closePath();
  ctx.fillStyle=color;ctx.fill();
 };
 switch(state){
  case 'idle': // Antennae listen; the heartbeat is tethered to the moon horn.
   curl(0,y-13,8,.16+Math.abs(kin)*.12);
   break;
  case 'run': // Displaced paw scratches and elastic nine-tail follow-through.
   for(let i=0;i<3;i++){ctx.globalAlpha=.23+i*.07;
    ctx.beginPath();ctx.moveTo(-20-i*9,-4-i*3+beat*3);ctx.lineTo(-33-i*9,-4-i*3);ctx.stroke();}
   break;
  case 'jump': // Claw tuck and vertical lunar crescent.
   ctx.globalAlpha=.6;ctx.beginPath();ctx.arc(-21,y+16,10,1.2,5.1);ctx.stroke();break;
  case 'fall': // Opposed forepaw wings, spread tentacles.
   ctx.globalAlpha=.48;curl(0,y+28,40,.48);curl(0,y+36,31,.31);break;
  case 'glide': // Gliding makes the jelly veil lift rather than stretch into feet.
   ctx.globalAlpha=.44;ctx.beginPath();ctx.ellipse(0,y+16,36+beat*2,11,0,.1,Math.PI-.1);ctx.stroke();break;
  case 'wall': // Three planted claw strokes, attached to the reaching paw.
   for(let i=0;i<3;i++){ctx.globalAlpha=.58-i*.1;
    ctx.beginPath();ctx.moveTo(25+i*4,y-2+i*8);
    ctx.lineTo(32+i*4,y-8+i*8);ctx.stroke();}
   break;
  case 'attack': { // A three-beat swipe tied to attack progress, not world time.
   const swing=Math.sin(Math.PI*Math.max(0,Math.min(1,Number(pose.atk)||.5)));
   for(let i=0;i<3;i++){ctx.globalAlpha=swing*(.72-i*.11);
    ctx.beginPath();ctx.moveTo(20+i*7,y-19);
    ctx.quadraticCurveTo(46+i*6,y-5,29+i*8,y+17);ctx.stroke();}
   break;
  }
  case 'cast':{ // Horn charges first; one ring releases after the body recoil.
   const energy=Math.sin(Math.PI*Math.max(0,Math.min(1,Number(pose.cast)||.5)));
   ctx.globalAlpha=energy*.55;ctx.beginPath();ctx.ellipse(0,y-20,18+energy*13,10+energy*6,0,0,TAU);ctx.stroke();
   for(let i=0;i<3;i++){const a=t*.045+i*TAU/3;diamond(Math.cos(a)*27,y-20+Math.sin(a)*16,3,'#fff1b6');}
   break;
  }
  case 'hurt': // Temporarily folds the moon aura inward.
   ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(0,y+3,18,2.3,5.9);ctx.stroke();break;
  case 'victory': // Crowning animation traces the medusa-to-nine-tail genealogy.
   for(let i=0;i<5;i++){
    const a=i*TAU/5+(reduced?0:t*.027);
    ctx.globalAlpha=.45+i*.06;diamond(Math.cos(a)*29,y-21+Math.sin(a)*17,3.2,'#fff8cb');
   }
   break;
 }
 ctx.restore();
}

function draw(ctx, pose, R) {
  const src = pose || {};
  const safe = src.look ? src : Object.assign({ look: { x: 1, y: 0 } }, src);
  const f = Math.max(0, Math.min(4, Math.round(Number(safe.form) || 0)));
  const c = f===2?{...PAL[f],fur:'#f8f6ff',dark:'#a9badf',belly:'#ffffff',ear:'#d0c6f0',eye:'#549fd3',accent:'#a8e5f6'}:PAL[f];
  const r = solve(safe);
  if(!Number.isFinite(safe.michiDuetAge)){
    r.motion=michiMotion(safe,f);
    if(r.motion.mood)r.mood=r.motion.mood;
  }
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
  drawMichiMythic(ctx,safe,r,f);
  drawMichicornioGesture(ctx,safe,r,f);
  moonSoul(ctx, safe, f, true);
  ctx.restore();
}

export default { id: "cat", draw };
