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

function ear(ctx, x, y, h, lean, fur, inner) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean || 0);
  ctx.beginPath();
  ctx.moveTo(-8, 3);
  ctx.lineTo(0, -h);
  ctx.lineTo(11, 4);
  ctx.closePath();
  ctx.fillStyle = fur;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-3.2, 1);
  ctx.lineTo(1, -h * 0.58);
  ctx.lineTo(6, 2);
  ctx.fillStyle = inner;
  ctx.fill();
  ctx.restore();
}

function face(ctx, R, pose, r, x, y, s, c) {
  const er = Math.max(4.2, s * 0.36);
  R.eye(ctx, x - s * 0.38, y, er, pose, { iris: c.eye, mood: r.mood, lash: true });
  R.eye(ctx, x + s * 0.4, y + 0.4, er * 0.94, pose, { iris: c.eye, mood: r.mood, lash: true });
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.26);
  ctx.lineTo(x - 3.4, y + s * 0.26 + 3.4);
  ctx.lineTo(x + 3.4, y + s * 0.26 + 3.4);
  ctx.closePath();
  ctx.fillStyle = c.nose;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.fill();
  ctx.stroke();
  const mouth = r.st === "attack" || r.slot === 2 ? "fang" : r.mood === "happy" ? "smile" : r.st === "hurt" ? "flat" : "smile";
  R.mouth(ctx, x + 0.4, y + s * 0.52, Math.max(7, s * 0.46), mouth);
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1.35;
  ctx.lineCap = "round";
  const w = Math.sin(r.t * 0.22) * 1.4;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.22, y + s * 0.34);
    ctx.quadraticCurveTo(x + side * s * 0.6, y + s * 0.24 + w, x + side * s * 1.05, y + s * 0.16);
    ctx.moveTo(x + side * s * 0.22, y + s * 0.48);
    ctx.quadraticCurveTo(x + side * s * 0.62, y + s * 0.52, x + side * s * 1.08, y + s * 0.5 + w);
    ctx.stroke();
  }
  ctx.restore();
  R.blush(ctx, x - s * 0.64, y + s * 0.32, s * 0.18, "#ff8aa8");
  R.blush(ctx, x + s * 0.68, y + s * 0.34, s * 0.16, "#ff8aa8");
}

function tail(ctx, R, x, y, len, ang, amp, t, i, color) {
  const end = R.tail(ctx, x, y, len, ang, (u) => Math.sin(t * 0.16 + i + u * 4) * amp * (1.15 - u), len > 30 ? 10 : 8, 3.1, color, { segments: 10, lw: 2.1, ink: INK });
  if (end) {
    ctx.beginPath();
    ctx.arc(end[0], end[1], 3.4, 0, TAU);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = INK;
    ctx.stroke();
  }
  return end;
}

function legs(ctx, R, r, hx, fur, dark, len) {
  const L = len || 20;
  // Two original hip roots stay connected while the haunch breathes.
  R.swingLimb(ctx, hx - 9, -L - 2, L, r.leg+(r.michiHaunch||0)*.12, r.st === "jump" ? -5 : 0, 7.2, dark);
  R.swingLimb(ctx, hx + 8, -L - 2, L, r.st === "jump" ? -2.05 : -r.leg-(r.michiHaunch||0)*.12, r.st === "jump" ? -4 : 0, 7.2, fur);
}

function arm(ctx, R, r, x, y, fur, len) {
  const L = len || 18;
  const bend = r.st === "attack" ? 6 : r.slot === 0 ? 4 : 1;
  R.swingLimb(ctx, x, y, L, r.arm-(r.michiPaw||0)*.20, bend, 6.4, fur, { handColor: "#ffb0c4" });
  if (r.st === "attack" && r.atk > 0.25 && r.atk < 0.75) {
    ctx.save();
    ctx.translate(x + 22, y - 6);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 5, -8);
      ctx.lineTo(8 + i * 6, 6);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawBaby(ctx, R, pose, r, c) {
  tail(ctx, R, -6, -20, 16, -2.5, r.tail * 0.7, r.t, 0, c.dark);
  if (r.st !== "dead") {
    R.swingLimb(ctx, -8, -8, 8, 0.2 + r.leg * 0.4, 0, 6, c.fur);
    R.swingLimb(ctx, 9, -8, 8, -0.15 - r.leg * 0.4, 0, 6, c.fur);
  }
  // The baby had back legs but no visible forepaws to groom with. Both
  // tiny arms now begin at its REAL shoulder line, partly hidden by the
  // oval belly so there is no floating wrist or detached axilla.
  R.swingLimb(ctx, -17, -34, 7, -0.28-(r.michiPaw||0)*.14,
    0, 5.2, c.dark, {handColor:"#ffd5da"});
  R.ellipse(ctx, 2, -37, 31, 31, c.fur);
  R.ellipse(ctx, 8, -30, 14, 12, c.belly, { line: false });
  R.swingLimb(ctx, 19, -33, 9, r.arm-(r.michiPaw||0)*.42,
    0, 5.5, c.fur, {handColor:"#ffb0c4"});
  R.shine(ctx, -8, -50, 8, 4, 0.4);
  const flop = r.st === "hurt" ? 0.35 : r.mood === "angry" ? -0.15 : 0.05;
  ear(ctx, -15, -59, 14, -0.35 + flop + (r.michiEar || 0), c.fur, c.ear);
  ear(ctx, 16, -59, 15, 0.28 - flop - (r.michiEar || 0), c.fur, c.ear);
  face(ctx, R, pose, r, 4, -39, 30, c);
  R.ellipse(ctx, 14, -24, 5.2, 5.2, c.accent, { shade: false, lw: 1.6 });
  ctx.beginPath();
  ctx.arc(14, -24, 7.2, 0, TAU);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCat(ctx, R, pose, r, c) {
  tail(ctx, R, -18, -20, 36, -2.85 + (r.st === "jump" ? 0.35 : 0), r.tail * 0.8, r.t, 0.4, c.dark);
  legs(ctx, R, r, 0, c.fur, c.dark, 20);
  R.ellipse(ctx, 2, -34, 24, 16, c.fur);
  R.ellipse(ctx, 8, -30, 11, 9, c.belly, { line: false });
  ctx.strokeStyle = c.dark;
  ctx.lineWidth = 2.3;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-10, -40 + i * 6);
    ctx.quadraticCurveTo(2, -36 + i * 6, 12, -40 + i * 6);
    ctx.stroke();
  }
  arm(ctx, R, r, 14, -36, c.fur, 18);
  ctx.save();
  ctx.translate(12, -62 + (r.st === "attack" ? -2 : 0));
  ctx.rotate(r.michiHead || 0);
  if (r.st === "run") ctx.rotate(r.run * 0.06);
  ear(ctx, -14, -6, 24, -0.25 + (r.michiEar || 0), c.fur, c.ear);
  ear(ctx, 12, -6, 26, 0.2 - (r.michiEar || 0), c.fur, c.ear);
  R.ellipse(ctx, 0, 8, 22, 20, c.fur);
  R.shine(ctx, -6, -2, 7, 3.5, 0.38);
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.quadraticCurveTo(0, -16, 8, -8);
  ctx.strokeStyle = c.dark;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  face(ctx, R, pose, r, 1, 6, 18, c);
  ctx.beginPath();
  ctx.moveTo(-8, 22);
  ctx.quadraticCurveTo(0, 28, 10, 22);
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 3.4;
  ctx.stroke();
  R.ellipse(ctx, 1, 26, 3.3, 3.3, "#ffd24a", { lw: 1.5 });
  ctx.restore();
}

function drawCloud(ctx, R, pose, r, c) {
  const bob = Math.sin(r.t * 0.09) * 3;
  ctx.save();
  ctx.translate(0, bob);
  tail(ctx, R, -20, -36, 28, -1.7, r.tail * 0.6, r.t, 1, "#fff");
  const puffs = [[-26, -30, 16], [-4, -26, 20], [20, -32, 15], [-10, -44, 13], [14, -46, 12], [4, -18, 14]];
  for (const p of puffs) R.ellipse(ctx, p[0], p[1], p[2], p[2] * 0.82, "#fff", { lw: 2.1 });
  R.ellipse(ctx, 2, -34, 16, 11, c.fur, { line: false });
  ctx.save();
  ctx.translate(6, -64);
  ctx.rotate(r.michiHead || 0);
  ear(ctx, -12, -2, 16, -0.2 + (r.michiEar || 0), "#fff", c.ear);
  ear(ctx, 12, -2, 16, 0.18 - (r.michiEar || 0), "#fff", c.ear);
  R.ellipse(ctx, -18, 6, 9, 8, "#fff", { lw: 2 });
  R.ellipse(ctx, 18, 8, 8, 7, "#fff", { lw: 2 });
  R.ellipse(ctx, 0, 8, 20, 18, c.fur);
  R.shine(ctx, -6, 0, 6, 3, 0.45);
  face(ctx, R, pose, r, 0, 6, 16, c);
  R.star(ctx, -16, -14, 6, c.accent);
  ctx.restore();
  ctx.restore();
}

function drawMoon(ctx, R, pose, r, c) {
  const sway = Math.sin(r.t * 0.1) * 6;
  ctx.beginPath();
  ctx.moveTo(-2, -86);
  ctx.quadraticCurveTo(-42 + sway, -46, -32 + sway * 0.4, -2);
  ctx.lineTo(8, -8);
  ctx.quadraticCurveTo(-8, -50, 2, -86);
  ctx.closePath();
  ctx.fillStyle = "#3d2a86";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.fill();
  ctx.stroke();
  tail(ctx, R, -10, -22, 34, -2.8, r.tail * 0.8, r.t, 0, c.dark);
  tail(ctx, R, -8, -18, 28, -3.05, r.tail * 0.7, r.t, 1.4, c.accent);
  legs(ctx, R, r, 2, c.fur, c.dark, 22);
  R.ellipse(ctx, 2, -40, 16, 24, c.fur);
  R.ellipse(ctx, 5, -34, 8, 13, c.belly, { line: false });
  arm(ctx, R, r, 10, -48, c.fur, 16);
  ctx.save();
  ctx.translate(4, -74);
  ctx.rotate(r.michiHead || 0);
  ear(ctx, -10, 0, 32, -0.12 + (r.michiEar || 0), c.fur, c.ear);
  ear(ctx, 12, 0, 34, 0.1 - (r.michiEar || 0), c.fur, c.ear);
  ctx.beginPath();
  ctx.arc(-2, -28, 9, 0.4, 5.4);
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  R.ellipse(ctx, 0, 6, 17, 18, c.fur);
  R.shine(ctx, -5, -2, 5, 2.6, 0.35);
  face(ctx, R, pose, r, 1, 4, 15, c);
  ctx.restore();
}

function feather(ctx, side, rot, len, color) {
  ctx.save();
  ctx.translate(-2, -34);
  ctx.scale(side, 1);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.45, -18, len, -4);
  ctx.quadraticCurveTo(len * 0.5, 10, 0, 5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(len * 0.72, -2);
  ctx.strokeStyle = "#e6c56a";
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.restore();
}

// Michi Eclipse (forma 5). Nombre interno fijado por tests.
function drawGod(ctx, R, pose, r, c) {
  const flap = Math.sin(r.t * 0.18) * 0.22 + (r.slot === 2 ? 0.15 : 0) + (r.michiWing || 0)*.24;
  // Eclipse disc behind the head: violet moon with pink rim (flat fills).
  ctx.beginPath(); ctx.arc(8, -70, 34, 0, TAU); ctx.fillStyle = "#ff8fcf"; ctx.fill();
  ctx.beginPath(); ctx.arc(11, -72, 30, 0, TAU); ctx.fillStyle = c.accent; ctx.fill();
  ctx.lineWidth = 2.2; ctx.strokeStyle = INK; ctx.stroke();
  feather(ctx, -1, -1.05 + flap, 48, "#ffd6ee");
  feather(ctx, -1, -0.45 + flap, 58, "#fff0f8");
  feather(ctx, -1, 0.12 + flap, 42, "#c9b4ff");
  feather(ctx, 1, -0.95 - flap, 44, "#fff0f8");
  feather(ctx, 1, -0.28 - flap, 54, "#ffd6ee");
  const n = r.slot === 2 ? 7 : 3;
  for (let i = 0; i < n; i++) {
    const spread = r.slot === 2 ? -2.6 + i * 0.38 : -2.2 + i * 0.45;
    const col = i % 2 ? c.accent : c.fur;
    tail(ctx, R, -14, -22, 28 + (i % 3) * 5, spread - 0.45, r.tail * 0.8, r.t, i, col);
  }
  if (r.slot === 2) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.45;
    for (let i = 0; i < 5; i++) {
      const a = -2.4 + i * 0.45 + Math.sin(r.t * 0.2 + i) * 0.15;
      ctx.strokeStyle = i % 2 ? "#fff" : c.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, -28);
      ctx.quadraticCurveTo(-30 - i * 4, -50 + i * 8, -12 + Math.cos(a) * 48, -28 + Math.sin(a) * 36);
      ctx.stroke();
    }
    ctx.restore();
  }
  legs(ctx, R, r, 2, c.fur, c.dark, 18);
  R.ellipse(ctx, 2, -32, 20, 16, c.fur);
  R.ellipse(ctx, 7, -28, 8, 8, c.accent);
  arm(ctx, R, r, 14, -36, c.fur, 17);
  ctx.save();
  ctx.translate(8, -62);
  ctx.rotate(r.michiHead || 0);
  ear(ctx, -12, -4, 22, -0.2 + (r.michiEar || 0), c.fur, c.ear);
  ear(ctx, 12, -4, 24, 0.16 - (r.michiEar || 0), c.fur, c.ear);
  R.ellipse(ctx, 0, 8, 22, 20, c.fur);
  R.shine(ctx, -6, 0, 7, 3.2, 0.42);
  face(ctx, R, pose, r, 1, 6, 18, c);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 8, -12);
    ctx.lineTo(i * 8 + (i === 0 ? 0 : i * 2), -26 - (i === 0 ? 8 : 0));
    ctx.lineTo(i * 8 + 8, -10);
    ctx.closePath();
    ctx.fillStyle = "#ffd76a";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
  
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
  if (f === 0) drawBaby(ctx, R, safe, r, c);
  else if (f === 1) drawCat(ctx, R, safe, r, c);
  else if (f === 2) drawCloud(ctx, R, safe, r, c);
  else if (f === 3) drawMoon(ctx, R, safe, r, c);
  else drawGod(ctx, R, safe, r, c);
  if(r.st!=='dead'){const by=[-20,-36,-40,-48,-50][f];ctx.fillStyle=c.accent;ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(7,by,3+f*.35,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(5,by-1);ctx.lineTo(9,by+1);ctx.stroke();}
  moonSoul(ctx, safe, f, true);
  ctx.restore();
}

export default { id: "cat", draw };
