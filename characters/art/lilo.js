// KILO · niña hawaiana (diseño original) · characters/art/lilo.js
// pose.move === "float" (o state "glide"): falda en paracaídas, brazos abiertos.

// Connected hula choreography shared by combat, welcome and celebrations.
export function kiloHulaPose(seconds=0, form=0, reduced=false) {
 const t=Number.isFinite(seconds)?seconds:0, f=Math.max(0,Math.min(4,Number(form)||0));
 const phase=t*Math.PI*2/1.6, sway=reduced?0:Math.sin(phase), wave=reduced?0:Math.sin(phase*2);
 const weight=.65+f*.09;
 return {hip:sway*5*weight,lean:-sway*.09,head:sway*.07,
  front:[18+sway*10,8+wave*6],back:[-18+sway*10,8-wave*6],
  step:reduced?0:Math.max(0,Math.sin(phase))*3,
  heel:reduced?0:Math.max(0,-Math.sin(phase))*3,
  dip:reduced?0:(1-Math.cos(phase*2))*1.4,skirt:sway*.65};
}
function applyHula(r,pose,d,f,seconds,blend=1) {
 const b=kiloHulaPose(seconds,f,pose.reduceMotion), sy=-d.ll-d.th;
 const mix=(a,v)=>a+(v-a)*blend;
 r.spin=1;r.hipX=mix(r.hipX,b.hip);r.lean=mix(r.lean,b.lean);
 r.oy+=b.dip*blend;r.headRot=mix(r.headRot,b.head);
 r.handF=L2(r.handF,[4+b.front[0],sy+b.front[1]],blend);
 r.handB=L2(r.handB,[-5+b.back[0],sy+b.back[1]],blend);
 if(!pose.air&&!(pose.speed>.55)){
  r.footF=L2(r.footF,[6+b.hip*.4,-b.step],blend);
  r.footB=L2(r.footB,[-6+b.hip*.4,-b.heel],blend);
 }
 r.skirt+=b.skirt*blend;r.hairLag-=b.skirt*.5*blend;
 r.flare+=.25*blend;r.armOver=true;r.backOver=true;
 r.mood='happy';r.mouth='smile';r.paci=false;r.uke=f>0?'back':null;r.fx=null;
}
const SKIN = "#c68657";
const HAIR = "#2b2233";
const HAIR_HI = "#6a5a8c";
const IRIS = "#7a4520";

const DIM = [
  { hr: 33, th: 16, ll: 12, al: 16, lw: 8.5, aw: 7 },
  { hr: 25, th: 25, ll: 20, al: 24, lw: 7.5, aw: 6 },
  { hr: 24, th: 27, ll: 24, al: 26, lw: 7.5, aw: 6 },
  { hr: 23, th: 29, ll: 26, al: 27, lw: 7.5, aw: 6 },
  { hr: 22, th: 30, ll: 28, al: 28, lw: 7.5, aw: 6 },
];
const DRESS = ["#ffacc2", "#eb554a", "#ea637b", "#c73d4a", "#ffe9a8"];
const HIBIS = ["#ff5c8a", "#ff6f91", "#ffd23f", "#ff4d6d", "#ff6b9a"];

const lerp = (a, b, k) => a + (b - a) * k;
const L2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const ease = (k) => k * k * (3 - 2 * k);

/** Extremidad por cinemática inversa: hombro/cadera (s) → objetivo (t). */
function ik(ctx, R, sx, sy, tx, ty, L, dir, w, col, opt) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 0.01;
  if (d > L) { tx = sx + (dx / d) * L; ty = sy + (dy / d) * L; dx = tx - sx; dy = ty - sy; d = L; }
  const h = Math.sqrt(Math.max(0, (L * L) / 4 - (d * d) / 4));
  const mx = (sx + tx) / 2 + (-dy / d) * h * dir, my = (sy + ty) / 2 + (dx / d) * h * dir;
  return R.limb(ctx, sx, sy, 2 * mx - (sx + tx) / 2, 2 * my - (sy + ty) / 2, tx, ty, w, col, opt);
}

function hibiscus(ctx, R, x, y, s, col, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    R.ellipse(ctx, Math.cos(a) * s * 0.55, Math.sin(a) * s * 0.55, s * 0.62, s * 0.48, col, { rot: a, lw: R.LINE * 0.6 });
  }
  R.ellipse(ctx, 0, 0, s * 0.3, s * 0.3, R.darken(col, 0.35), { line: false, shade: false });
  ctx.strokeStyle = "#fff2a0";
  ctx.lineWidth = Math.max(1, s * 0.12);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * 0.55, -s * 0.5); ctx.stroke();
  ctx.fillStyle = "#ffe04a";
  ctx.beginPath(); ctx.arc(s * 0.58, -s * 0.54, s * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function note(ctx, R, x, y, s, col, a) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.fillStyle = col;
  ctx.strokeStyle = R.INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.55, s * 0.4, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s * 0.48, -s * 0.1); ctx.lineTo(s * 0.48, -s * 1.5);
  ctx.quadraticCurveTo(s * 1.1, -s * 1.2, s * 1.0, -s * 0.7);
  ctx.lineWidth = 2.2; ctx.stroke();
  ctx.lineWidth = 1.2; ctx.strokeStyle = col; ctx.stroke();
  ctx.restore();
}

/** Ukelele: (x,y) = centro de la caja; el mástil apunta en `ang`. */
function uke(ctx, R, x, y, ang, s, gold) {
  const body = gold ? "#f08a2c" : "#e3a15c", neck = gold ? "#8a4e22" : "#7a4726";
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  if (gold) { ctx.shadowColor = "#fff0a0"; ctx.shadowBlur = 8; }
  R.poly(ctx, [[s * 0.4, -s * 0.11], [s * 1.5, -s * 0.09], [s * 1.5, s * 0.09], [s * 0.4, s * 0.11]], neck, { lw: R.LINE * 0.7 });
  R.blob(ctx, [[s * 1.45, -s * 0.16], [s * 1.8, -s * 0.2], [s * 1.84, s * 0.16], [s * 1.45, s * 0.16]], R.darken(neck, 0.1), { lw: R.LINE * 0.7 });
  ctx.shadowBlur = 0;
  R.blob(ctx, [[s * 0.55, 0], [s * 0.45, -s * 0.33], [s * 0.2, -s * 0.38], [s * 0.04, -s * 0.3], [-s * 0.2, -s * 0.5], [-s * 0.55, -s * 0.42],
    [-s * 0.7, 0], [-s * 0.55, s * 0.42], [-s * 0.2, s * 0.5], [s * 0.04, s * 0.3], [s * 0.2, s * 0.38], [s * 0.45, s * 0.33]], body, { lw: R.LINE * 0.8 });
  R.ellipse(ctx, s * 0.12, 0, s * 0.14, s * 0.14, "#3a2014", { line: false, shade: false });
  ctx.fillStyle = R.darken(body, 0.45);
  ctx.fillRect(-s * 0.46, -s * 0.2, s * 0.08, s * 0.4);
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = Math.max(0.6, s * 0.05);
  ctx.beginPath();
  for (let i = -1.5; i <= 1.5; i += 1) { ctx.moveTo(-s * 0.42, i * s * 0.045); ctx.lineTo(s * 1.5, i * s * 0.035); }
  ctx.stroke();
  R.shine(ctx, -s * 0.3, -s * 0.22, s * 0.16, s * 0.08, 0.5);
  ctx.restore();
}

function rattle(ctx, R, x, y, ang, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.lineCap = "round";
  ctx.strokeStyle = R.INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(0, -9); ctx.stroke();
  ctx.strokeStyle = "#ffe07a"; ctx.lineWidth = 3; ctx.stroke();
  R.ellipse(ctx, 0, -14, 7, 7, "#7fd6ff");
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, -14, 4.5, 0.3, 2.2); ctx.stroke();
  R.ellipse(ctx, 0, 6, 3, 3, "#ff8ab0", { lw: 2 });
  ctx.restore();
}

function staff(ctx, R, x, y, ang, len, t, big) {
  const dx = Math.sin(ang), dy = -Math.cos(ang);
  const x0 = x - dx * len * 0.35, y0 = y - dy * len * 0.35, x1 = x + dx * len * 0.65, y1 = y + dy * len * 0.65;
  ctx.lineCap = "round";
  ctx.strokeStyle = R.INK; ctx.lineWidth = 7.5;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = "#8a4e22"; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = "#ffc53d"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x1 - dx * 6, y1 - dy * 6); ctx.lineTo(x1, y1); ctx.stroke();
  const r = (big ? 8 : 5.5) + Math.sin(t * 0.15) * 0.8;
  ctx.save();
  ctx.fillStyle = "rgba(255,210,110,0.22)";
  ctx.beginPath(); ctx.arc(x1 + dx * 5, y1 + dy * 5, r * 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,245,190,0.4)";
  ctx.beginPath(); ctx.arc(x1 + dx * 5, y1 + dy * 5, r * 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  R.star(ctx, x1 + dx * 5, y1 + dy * 5, r, "#fff0a0", { points: 4, inner: 0.5, rot: t * 0.03, lw: 2 });
  R.sparkle(ctx, x1 + dx * 5 + 6, y1 + dy * 5 - 6, 3 + Math.sin(t * 0.2) * 1.5, "#ffffff");
}

function glowOrb(ctx, R, x, y, r, t, col) {
  ctx.save();
  ctx.fillStyle = R.alpha(col, 0.2);
  ctx.beginPath(); ctx.arc(x, y, r * 2.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = R.alpha(col, 0.55);
  ctx.beginPath(); ctx.arc(x, y, r * 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  for (let i = 0; i < 4; i++) {
    const a = t * 0.08 + (i * Math.PI) / 2;
    R.sparkle(ctx, x + Math.cos(a) * r * 1.7, y + Math.sin(a) * r * 1.1, 2.5 + (i % 2) * 1.5, i % 2 ? "#ffffff" : "#fff3a0");
  }
}

// V350 · Pure directions for the ACTUAL five-form Kilo rig.
// Baby Kilo's pacifier/held ukulele stays intact. Later forms keep the
// original long hair, clothing, staff and the Flor Solar sun halo.
export function kiloWelcomeRig(pose={},form=0){
 const b=pose?.kiloWelcome,u=n=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
 if(!b||b.reduced||pose?.reduceMotion||(pose?.state&&pose.state!=="idle"))
  return Object.freeze({active:false,listen:0,strum:0,bloom:0,surprise:0,finale:0,
   dragon:0,chase:0,yomi:0,dino:0,tilt:0,lift:0,head:0,hair:0,wing:0,
   ribX:1,ribY:1,hem:0,armFront:0,armBack:0,headLook:0});
 const listen=u(b.listen),strum=u(b.strum),bloom=u(b.bloom),
   surprise=u(b.surprise),finale=u(b.finale);
 const dragon=u(b.dragon),chase=u(b.chase),yomi=u(b.yomi),dino=u(b.dino);
 const breath=(u(b.breath)-.5)*2;
 const f=Number.isFinite(form)?Math.max(0,Math.min(4,Math.round(form))):0;
 const chest=[.052,.044,.040,.031,.033][f];
 const limit=(n,a,c)=>Math.max(a,Math.min(c,n));
 return Object.freeze({
  active:true,listen,strum,bloom,surprise,finale,dragon,chase,yomi,dino,
  // Baby swells in the belly. Flower guardian's chest and wing roots move
  // less, but the same IK shoulders and anchored dress remain connected.
  ribX:limit(1+breath*chest+.014*chase-.020*dragon+.016*yomi,.91,1.09),
  ribY:limit(1-breath*chest*.58-.012*chase+.017*dragon-.010*yomi,.93,1.07),
  tilt:limit(-listen*.09+strum*.11-bloom*.13+surprise*.21-finale*.14
    +breath*.018-dragon*.14+chase*.075+yomi*(-.085)+dino*.12,-.4,.4),
  lift:limit(-strum*1.4-bloom*3+surprise*2.0-finale*1.8
    -breath*.60+dragon*1.75-chase*1.45-yomi*.9+dino*1.55,-5,4),
  head:limit(-listen*.17+strum*.10-bloom*.16+surprise*.23-finale*.12
    +breath*.035+dragon*.22-chase*.13+yomi*.16+dino*.21,-.4,.4),
  hair:limit(strum*.24+bloom*.57+surprise*.19+finale*.43
    +Math.abs(breath)*.11+dragon*.20+chase*.24+yomi*.12+dino*.26,0,1),
  hem:breath*.34+dragon*.55+chase*1.6+yomi*.6+dino*1.2,
  armFront:breath*.55+dragon*3.0+chase*2.1+yomi*1.65+dino*3.3,
  armBack:-breath*.35-dragon*2.6-chase*1.4+yomi*.9-dino*2.4,
  headLook:chase*.08+dragon*(-.14)+yomi*.08+dino*.12,
  wing:f===4?Math.max(0,Math.min(1,(Number.isFinite(b.wing)?b.wing:0)
    +dragon*.11+dino*.13)):0
 });
}
function solve(pose, d, f) {
  const t = pose.t, st = pose.state, hipY = -d.ll, sy = hipY - d.th, al = d.al;
  const xF = 4, xB = -5;
  // V462: arms hang naturally from the shoulders (4/-5, sy+3) at ~95% reach, a little
  // out from the dress, so the elbow only softens instead of folding into a "C" hook.
  const restF = [4 + al * 0.4, sy + 3 + al * 0.86], restB = [-5 - al * 0.4, sy + 3 + al * 0.86];
  const hr = d.hr, hx = 1;
  const r = {
    ox: 0, oy: 0, lean: 0, spin: 1, hipX: 0, headRot: Math.sin(t * 0.03) * 0.04,
    mood: "normal", mouth: "smile", wink: false,
    footF: [4, 0], footB: [-5, 0], handF: restF.slice(), handB: restB.slice(),
    flare: 0, hemLift: 0, hairUp: 0, uke: f >= 1 ? "back" : null, armOver: false,
    fx: null, fxK: 0, smear: 0, smearA: 0, paci: f === 0, staffUp: false, backOver: false,
    // Secondary motion (follow-through): hair and skirt lag behind the body.
    hairLag: Math.sin(t * 0.05 - 0.9) * 0.08, skirt: Math.sin(t * 0.05 - 1.3) * 0.25,
  };
  const br = pose.breath;
  r.handF[1] += br * 0.8; r.handB[1] += br * 0.8; r.handF[0] += br * 0.4;
  r.hairUp = Math.sin(t * 0.05) * 0.12;
  if (f === 4) r.hairUp = 0.55 + Math.sin(t * 0.07) * 0.2;
  const float = pose.move === "float" || st === "glide";

  if (float && (st === "fall" || st === "jump" || st === "glide")) {
    r.handF = [xF + al * 0.95, sy + 3 + Math.sin(t * 0.12) * 2];
    r.handB = [xB - al * 0.95, sy + 5 - Math.sin(t * 0.12) * 2]; r.armOver = true;
    r.footF = [3, -1]; r.footB = [-2, -3];
    r.flare = 1.7; r.hemLift = 7; r.hairUp = 0.9;
    r.lean = Math.sin(t * 0.07) * 0.08; r.oy = Math.sin(t * 0.1) * 1.5;
    r.mouth = "open"; r.mood = "happy";
    return r;
  }
  switch (st) {
    case "run": {
      const p = pose.phase, s = Math.sin(p), c = Math.cos(p), A = d.ll * 0.5;
      r.footF = [3 + s * A, -Math.max(0, c) * d.ll * 0.5];
      r.footB = [-3 - s * A, -Math.max(0, -c) * d.ll * 0.5];
      r.oy = -Math.abs(c) * 3.5;
      r.handF = [xF - s * al * 0.55 + 2, sy + al * 0.72];
      r.handB = [xB + s * al * 0.55 - 2, sy + al * 0.72];
      r.lean = 0.12; r.flare = 0.25 + 0.2 * Math.abs(s); r.headRot = 0.05 + c * 0.03;
      r.hairUp = -0.1 + Math.abs(c) * 0.3;
      // Contact squash: the body dips as each foot plants, arms swing from the
      // shoulder with a slight elbow lag, hair/skirt trail half a beat behind.
      r.oy += Math.max(0, 1 - Math.abs(c) * 3) * 1.2;
      r.handF[1] -= Math.max(0, -s) * 3; r.handB[1] -= Math.max(0, s) * 3;
      r.hairLag = Math.sin(p - 1.4) * 0.35 + 0.15; r.skirt = Math.sin(p * 2 - 1.2) * 0.7 - 0.4;
      break;
    }
    case "jump":
    case "fall": {
      // Continuous rise -> apex -> fall blend driven by vertical speed, so the
      // apex reads as a hang instead of a one-frame snap between two poses.
      const k = ease(Math.max(0, Math.min(1, ((pose.vy || 0) + 0.45) / 0.9)));
      const J = { fF: [7, -d.ll * 0.5], fB: [-6, -d.ll * 0.18], hF: [hx + hr * 0.9, sy - 10], hB: [xB - al * 0.7, sy - 4] };
      const F = { fF: [5, 1], fB: [-4, -3], hF: [xF + al * 0.9, sy - 3], hB: [xB - al * 0.9, sy - 1] };
      r.footF = L2(J.fF, F.fF, k); r.footB = L2(J.fB, F.fB, k);
      r.handF = L2(J.hF, F.hF, k); r.handB = L2(J.hB, F.hB, k); r.armOver = true;
      const apex = 1 - Math.abs(k * 2 - 1);
      r.handF[1] -= apex * 3; r.handB[1] -= apex * 3;
      r.lean = lerp(-0.06, 0, k); r.hairUp = lerp(-0.6, 1, k) + apex * 0.25; r.flare = lerp(-0.1, 0.7, k) + apex * 0.3;
      r.hemLift = 3 * k; r.mouth = k < 0.5 ? "open" : "o"; r.headRot = lerp(-0.08, 0.06, k);
      r.hairLag = lerp(-0.35, 0.3, k); r.skirt = lerp(0.2, -0.6, k);
      break;
    }
    case "attack": {
      const a = pose.atk, sh = [xF, sy + 3];
      r.footF = [9, 0]; r.footB = [-8, 0]; r.mood = "angry"; r.mouth = "grin"; r.paci = false;
      if (a < 0.3) {
        const k = ease(a / 0.3);
        r.handF = L2(restF, [xB - 6, sy - 10], k); r.lean = -0.14 * k; r.headRot = -0.06 * k;
        // Anticipation: crouch and wind up, hair and skirt pulled forward.
        r.oy += 2 * k; r.footB = [-8 - 2 * k, 0]; r.hairLag = 0.4 * k; r.skirt = 0.5 * k;
        if (f >= 1 && k > 0.55) r.uke = "hand";
        r.armOver = false;
      } else {
        const k = a < 0.55 ? ease((a - 0.3) / 0.25) : 1;
        const back = a < 0.55 ? 0 : (a - 0.55) / 0.45;
        const ang = lerp(-2.7, 1.3, k) - back * 0.35;
        r.handF = [sh[0] + Math.sin(ang) * al, sh[1] + Math.cos(ang) * al];
        // Recovery: settle the swing back toward rest instead of freezing.
        const rec = a < 0.6 ? 0 : ease(Math.min(1, (a - 0.6) / 0.32));
        r.handF = L2(r.handF, [restF[0] + 3, restF[1] - 2], rec);
        r.lean = lerp(-0.14, 0.2, k) * (1 - back * 0.7) * (1 - rec * 0.6); r.headRot = 0.08 * k * (1 - rec);
        r.oy += a < 0.5 ? (1 - Math.abs(a - 0.4) / 0.1 > 0 ? 1.5 * (1 - Math.abs(a - 0.4) / 0.1) : 0) : 0;
        r.hairLag = lerp(0.4, -0.45, k) * (1 - rec) ; r.skirt = lerp(0.5, -0.9, k) * (1 - rec);
        r.footF = [9 + 2 * k * (1 - rec), 0];
        r.armOver = true;
        if (f >= 1) r.uke = "hand";
        if (a < 0.8) { r.smear = 1 - Math.max(0, (a - 0.45) / 0.35); r.smearA = ang; }
      }
      r.handB = [xB - al * 0.5, sy + al * 0.5];
      break;
    }
    case "cast": {
      const c = pose.cast, slot = pose.castSlot;
      r.paci = false; r.fxK = c;
      if (slot === 1) {
        r.spin = 1;
        // Hula keeps the face and silhouette visible throughout the phrase.
        const w = Math.sin(c * Math.PI * 2) * 3;
        r.handF = [xF + al * 0.9, sy - 2 + w]; r.handB = [xB - al * 0.9, sy - 6 - w];
        r.footF = [2, 0]; r.footB = [-3, -3];
        applyHula(r,pose,d,f,c*1.6);
      } else if (slot === 2) {
        r.handF = [hx + hr * 0.8, sy - 16]; r.handB = [hx - hr * 0.8, sy - 16]; r.armOver = true; r.backOver = true;
        r.headRot = -0.14; r.mood = "closed"; r.mouth = "o"; r.fx = "summon"; r.hairUp = 0.7; r.staffUp = true;
        r.footF = [6, 0]; r.footB = [-6, 0];
      } else {
        if (f === 0) {
          r.handF = [xF + 7 + Math.sin(t * 0.8) * 3, sy - al * 0.4];
        } else {
          r.uke = "play"; r.armOver = true;
          r.handB = [xF + al * 0.9, sy + 1];
          r.handF = [xF + 1, sy + al * 0.62 + Math.sin(t * 0.9) * 2.5];
        }
        r.mood = "happy"; r.mouth = "open"; r.fx = "notes"; r.headRot = 0.1 + Math.sin(t * 0.2) * 0.05;
      }
      break;
    }
    case "hurt":
      r.lean = -0.26; r.headRot = -0.22; r.mood = "hurt"; r.mouth = "o"; r.paci = false;
      r.handF = [xF + al * 0.85, sy - 8]; r.handB = [xB - al * 0.85, sy - 6]; r.armOver = true;
      r.footF = [8, -5]; r.footB = [-4, 0]; r.hairUp = 0.6;
      break;
    case "wall":
      r.lean = 0.1; r.headRot = -0.1;
      r.handF = [hx + hr * 0.95, sy - 12]; r.handB = [xB + 1, sy + al * 0.8]; r.armOver = true;
      r.footF = [14, -9]; r.footB = [8, -2]; r.hairUp = 0.8; r.mouth = "flat";
      break;
    case "victory": {
      const j = pose.reduceMotion ? 0 : Math.abs(Math.sin(t * 0.09));
      r.oy = -j * 12;
      r.handF = [hx + hr * 0.95, sy - 12]; r.handB = [hx - hr * 0.95, sy - 12]; r.armOver = true; r.backOver = true;
      r.footF = [6, -j * 9]; r.footB = [-6, -j * 5];
      r.mood = "happy"; r.mouth = "open"; r.fx = "flowers"; r.hairUp = 0.8 - j; r.flare = 0.4 + j * 0.4; r.paci = false;
      r.headRot = -0.05;
      break;
    }
    default: {
      if (pose.flourish > 0) {
        const fl = pose.flourish, k = Math.min(1, Math.sin(fl * Math.PI) * 1.6), n = pose.flourishN % 3;
        if (n === 0) {
          if (f === 0) {
            r.handF = L2(r.handF, [xF + 7 + Math.sin(t * 0.7) * 3, sy - al * 0.35], k);
          } else if (k > 0.3) {
            r.uke = "play"; r.armOver = true;
            r.handB = L2(restB, [xF + al * 0.9, sy + 1], k);
            r.handF = L2(restF, [xF + 1, sy + al * 0.62 + Math.sin(t * 0.6) * 2.5], k);
          }
          r.mood = "happy"; r.fx = "notes"; r.fxK = fl; r.headRot = Math.sin(t * 0.15) * 0.08;
        } else if (n === 1) {
          const ph = fl * Math.PI * 6;
          r.hipX = Math.sin(ph * 0.5) * 4 * k;
          r.lean = -r.hipX * 0.025;
          r.handF = L2(r.handF, [xF + al * 0.85, sy + 4 + Math.sin(ph) * 4], k); r.armOver = true;
          r.handB = L2(r.handB, [xB - al * 0.85, sy + 4 - Math.sin(ph) * 4], k);
          r.flare = 0.35 * Math.abs(Math.sin(ph * 0.5)); r.mood = "happy"; r.headRot = -r.hipX * 0.03;
          r.footF = [4 + r.hipX * 0.3, 0]; r.footB = [-5 + r.hipX * 0.3, 0];
        } else {
          r.handF = L2(r.handF, [hx + hr * 0.95 + Math.sin(t * 0.4) * 4, sy - 14], k); r.armOver = true;
          r.wink = true; r.mouth = "open"; r.headRot = 0.08; r.paci = false;
        }
      }
    }
  }
  // Landing follow-through: hair and skirt keep travelling down for a beat.
  if (!pose.air && pose.land > 0.02 && (st === "idle" || st === "run")) {
    r.hairUp -= pose.land * 0.7; r.hairLag += pose.land * 0.45; r.skirt -= pose.land * 0.8;
    r.flare += pose.land * 0.5; r.oy += pose.land * 1.5;
  }
  if(Number.isFinite(pose.kiloDuetAge)){
    const beat=pose.kiloDuetAge;
    r.paci=false;r.uke='play';r.armOver=true;
    r.handB=[xF+al*.9,sy+1];r.handF=[xF+1,sy+al*.62+Math.sin(beat*.65)*2.5];
    r.headRot=beat<18?.12:beat<30?-.18:Math.sin(beat*.18)*.06;
    r.mood=beat<30?'happy':'closed';r.mouth=beat<30?'open':'smile';
  }
  // Scene-only body acting, applied to connected IK bones, not stickers.
  // Never changes Kilo's J/K/L/U, duets or real state outside the welcome.
  const welcome=kiloWelcomeRig(pose,f);
  const {listen,strum,bloom,surprise,finale}=welcome;
  if(listen+strum+bloom+surprise+finale>.01){
    r.lean+=welcome.tilt;
    r.oy+=welcome.lift;
    r.headRot+=welcome.head;
    r.hairUp+=welcome.hair;
    r.flare+=bloom*.31+finale*.25;
    r.hemLift+=bloom*2.2+finale*1.4;
    r.handF[0]+=listen*3.2+strum*4.3+bloom*al*.48+surprise*al*.71+finale*al*.78;
    r.handF[1]-=listen*2.8+strum*3.5+bloom*al*.55+surprise*al*.58+finale*al*.76;
    r.handB[0]-=listen*2.3+strum*3.1+bloom*al*.52+surprise*al*.65+finale*al*.71;
    r.handB[1]-=strum*3.0+bloom*al*.56+surprise*al*.64+finale*al*.78;
    r.footF=[r.footF[0]+strum*2.1+bloom*1.8+surprise*2.4,r.footF[1]-strum*.5-bloom*1.6];
    r.footB=[r.footB[0]-strum*2.1-bloom*1.3-surprise*2.1,r.footB[1]-strum*.5-bloom*1.1];
    if(strum>.15){
      r.mood="happy";r.mouth="open";r.fx="notes";r.fxK=strum;
      // Ukelele remains held in the original hands. Form 3 keeps its
      // signature staff, rather than mysteriously acquiring a second prop.
      if(f>=1&&f!==3){
        r.uke="play";r.armOver=true;
        r.handB=[xF+al*.78,sy+.5];
        r.handF=[xF+1,sy+al*.60+strum*2.3];
      }
    }
    if(listen>.20){r.mood="normal";r.mouth="o";}
    if(bloom>.20){r.mood="happy";r.mouth="open";r.fx="flowers";r.fxK=bloom;r.armOver=true;}
    if(surprise>.20){r.mood="closed";r.mouth="o";r.wink=true;r.fx=null;}
    if(finale>.20){r.mood="happy";r.mouth="open";r.fx="flowers";r.fxK=finale*.70;r.armOver=true;}
    if(f===0&&(surprise>.20||bloom>.2))r.paci=false;
    if(f===3&&bloom>.2)r.staffUp=true;
  }
  // Secondary acting continues BETWEEN the five musical beats. All hands
  // are IK endpoints in the original hip-rooted space: no floating prop.
  if(welcome.active){
    const reaction=welcome.dragon+welcome.chase+welcome.yomi+welcome.dino;
    const bodyPulse=(welcome.ribX-1);
    r.lean+=bodyPulse*.65 + welcome.headLook;
    r.oy+=welcome.lift * .48;
    r.headRot+=welcome.head*.62;
    r.hairUp+=welcome.hair*.40;
    r.hemLift+=welcome.hem;
    r.flare+=Math.max(0,bodyPulse)*.9+welcome.chase*.22;
    r.handF=[r.handF[0]+welcome.armFront,r.handF[1]-welcome.armFront*.66];
    r.handB=[r.handB[0]+welcome.armBack,r.handB[1]-welcome.armBack*.56];
    r.footF=[r.footF[0]+welcome.chase*.7+welcome.dino*.45,r.footF[1]];
    r.footB=[r.footB[0]-welcome.chase*.5-welcome.dino*.40,r.footB[1]];
    if(welcome.dragon>.45){r.mood="closed";r.mouth="o";r.wink=true;}
    else if(welcome.chase>.45){r.mood="happy";r.mouth="open";}
    else if(welcome.yomi>.45){r.mood="happy";r.mouth="smile";}
    else if(welcome.dino>.45){r.mood="normal";r.mouth="o";}
    // Kilo's F3 wears and uses its OWN staff; it never sprouts an
    // extra ukulele. F0 already holds its miniature instrument.
    if(reaction>.35 && f!==3 && f>=1 && welcome.chase>.30){
      r.uke="play";r.armOver=true;
      r.handB=[xF+al*.78,sy+.5];
      r.handF=[xF+1,sy+al*.60+welcome.chase*1.8];
    }
  }
  // Aloha: dance, offer both hands, then hand to heart and a small bow.
  if(st==='victory'){
    const seconds=(t/60)%4.8;
    applyHula(r,pose,d,f,seconds);
    if(seconds>3.2){
      const bow=pose.reduceMotion?0:Math.sin((seconds-3.2)/1.6*Math.PI);
      r.handF=[4,sy+8];r.handB=[-5-al*.7,sy-2];
      r.lean=bow*.16;r.headRot=bow*.14;r.mood='closed';
    }
  }
  if(pose.kiloPerformance){
    const b=pose.kiloPerformance;
    const blend=b.kind==='entrance'?Math.min(1,b.time*4,Math.max(0,(1.6-b.time)*4)):1;
    if(b.kind!=='remate')applyHula(r,pose,d,f,b.time,blend);
    if(b.kind==='remate'){
      const frame=b.time*60,hit=frame>=7&&frame<=20,wind=frame<6;
      r.uke='back';r.fx=null;r.paci=false;r.armOver=true;r.backOver=false;r.mood=hit?'happy':'normal';r.mouth=hit?'open':'smile';
      r.lean=wind?-.12:hit?.26:.08;r.headRot=hit?-.09:.04;r.oy+=wind?4:hit?-2:0;
      r.handF=wind?[8,sy+10]:hit?[al*.9,sy-al*.65]:[16,sy+4];r.handB=[-al*.8,sy+al*.5];
      r.footF=wind?[8,-2]:[15,-8];r.footB=wind?[-8,0]:[-17,-2];r.hairLag=pose.reduceMotion?0:.8;r.skirt=hit?.7:.15;
    }
    if(b.kind==='finale'){
      const beat=(b.time*60)%30,clap=Math.max(0,1-Math.min(beat,30-beat)/8);
      r.handF=[18-12*clap,sy+5-8*clap];r.handB=[-18+17*clap,sy+5-8*clap];r.uke='back';r.mood='happy';r.mouth=clap>.5?'open':'smile';
    }
    if(b.kind==='relic'){r.uke="play";r.paci=false;r.handB=[15,sy+3];r.handF=[6,sy+al*.62+1+Math.sin(b.time*9)*2.5]; // V462: strum ON the sound hole (was floating at x=19, folding the arm)
    r.lean=.03;r.mood="closed";r.mouth="smile";
     if(b.time<2){r.uke='hand';r.handF=[8,sy+15];r.headRot=-.08;}
     if(b.time>8){r.uke='back';r.handF=[3,sy+5];r.handB=[-20,sy+6];r.headRot=.12;}
    }
    if(b.kind==='family'){r.handB=[-5-al,sy+3];r.handF=[4+al,sy+3];r.mood='happy';r.headRot=Math.sin(b.time*2)*.08;}
    if(b.kind==='guardian'){r.staffUp=true;r.handF=[hx+hr*.8,sy-16];r.handB=[0,sy+6];r.lean=-.04;r.mood='normal';}
    if(b.kind==='bloom'){r.handF=[5,sy+5];r.handB=[-3,sy+7];r.mood='closed';r.headRot=.08;r.hairUp=.6;}
    if(b.kind==='entrance'&&b.time<.45){r.handF=[hx+hr*.7,sy-10];r.headRot=-.08;r.wink=true;}
  } else if(pose.kiloWelcome&&!pose.kiloWelcome.reduced){
    const b=pose.kiloWelcome,blend=Math.min(1,b.strum*.5+b.bloom*.7+b.finale);
    if(blend>.01)applyHula(r,pose,d,f,t/60,blend);
  }
  return r;
}

function ponytail(ctx, R, pose, f, hr, r) {
  const t = pose.t;
  if (f === 0) {
    ctx.save();
    ctx.translate(-hr * 0.05, -hr * 0.92);
    ctx.rotate(Math.sin(t * 0.08) * 0.15 + pose.sway * 0.3 + (r.hairLag || 0) * 0.6);
    R.tail(ctx, 0, 0, hr * 0.55, -1.7, (k) => 4.5 + pose.bounce, 5, 2.5, HAIR, { segments: 7 });
    ctx.restore();
    return;
  }
  const len=hr*[.55,1.9,2.5,3.1,3.7][f],bx=-hr*.63,by=-hr*.42;
  const wind=pose.reduceMotion?0:Math.sin(t*.055)*3+(r.hairLag||0)*12;
  ctx.save();ctx.fillStyle=HAIR;ctx.strokeStyle=R.INK;ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(bx+hr*.3,by-hr*.3);ctx.bezierCurveTo(bx-hr*.7,by-hr*.2,bx-hr*.8+wind,by+len*.5,bx-hr*.15+wind,by+len);
  ctx.bezierCurveTo(bx+hr*.15+wind,by+len*.83,bx+hr*.43,by+len*.3,bx+hr*.3,by-hr*.3);ctx.fill();ctx.stroke();
  ctx.strokeStyle=HAIR_HI;ctx.globalAlpha=.6;ctx.lineWidth=1.5;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(bx-2-i*3,by);ctx.bezierCurveTo(bx-hr*.4-i*2,by+len*.35,bx-hr*.3+wind,by+len*.7,bx+wind-i*2,by+len*(.83+i*.04));ctx.stroke();}
  ctx.restore();
}

function head(ctx, R, pose, f, hr, r) {
  const t = pose.t;
  R.ellipse(ctx, -hr * 0.1, -hr * 0.04, hr * 1.04, hr * 1.0, HAIR);
  if (f >= 1) R.blob(ctx, [[-hr * 0.95, -hr * 0.1], [-hr * 1.02, hr * 0.55], [-hr * 0.7, hr * 0.95], [-hr * 0.35, hr * 0.7], [-hr * 0.2, 0]], HAIR, { shade: false });
  R.ellipse(ctx, hr * 0.1, hr * 0.14, hr * 0.86, hr * 0.8, SKIN);
  R.celShade(ctx, hr * 0.1, hr * 0.14, hr * 0.86, hr * 0.8, SKIN, 0.16);
  R.ellipse(ctx, -hr * 0.32, hr * 0.22, hr * 0.15, hr * 0.2, SKIN, { lw: R.LINE * 0.8 });
  R.blob(ctx, [
    [-hr * 1.0, hr * 0.1], [-hr * 0.9, -hr * 0.6], [-hr * 0.25, -hr * 1.02], [hr * 0.5, -hr * 0.88], [hr * 0.92, -hr * 0.42],
    [hr * 1.0, hr * 0.0], [hr * 0.72, -hr * 0.2], [hr * 0.55, hr * 0.02], [hr * 0.36, -hr * 0.26], [hr * 0.12, -hr * 0.02],
    [-hr * 0.08, -hr * 0.3], [-hr * 0.28, hr * 0.02], [-hr * 0.52, -hr * 0.18], [-hr * 0.62, hr * 0.3],
  ], HAIR);
  ctx.save();
  ctx.strokeStyle = HAIR_HI;
  ctx.lineWidth = hr * 0.09;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(-hr * 0.1, -hr * 0.05, hr * 0.78, -2.5, -1.7); ctx.stroke();
  ctx.beginPath(); ctx.arc(-hr * 0.1, -hr * 0.05, hr * 0.78, -1.5, -1.25); ctx.stroke();
  ctx.restore();

  const ex = hr * 0.12, ey = hr * 0.27;
  if (r.mood === "hurt" || r.mood === "dead") {
    ctx.strokeStyle = R.INK; ctx.lineWidth = hr * 0.08; ctx.lineCap = "round";
    ctx.beginPath();
    if (r.mood === "hurt") {
      ctx.moveTo(ex - hr * 0.16, ey - hr * 0.14); ctx.lineTo(ex + hr * 0.1, ey); ctx.lineTo(ex - hr * 0.16, ey + hr * 0.12);
      ctx.moveTo(hr * 0.72, ey - hr * 0.16); ctx.lineTo(hr * 0.5, ey - hr * 0.02); ctx.lineTo(hr * 0.72, ey + hr * 0.1);
    } else {
      for (const [x, s] of [[ex, 0.14], [hr * 0.62, 0.12]]) {
        ctx.moveTo(x - hr * s, ey - hr * s); ctx.lineTo(x + hr * s, ey + hr * s);
        ctx.moveTo(x + hr * s, ey - hr * s); ctx.lineTo(x - hr * s, ey + hr * s);
      }
    }
    ctx.stroke();
  } else {
    const mood = r.mood === "normal" ? undefined : r.mood;
    const eb = f === 0 ? 1.22 : 1;
    R.eye(ctx, ex, ey, hr * 0.29 * eb, pose, { iris: IRIS, mood: r.wink ? "happy" : mood, lash: true });
    R.eye(ctx, hr * 0.66, ey - hr * 0.02, hr * 0.24 * eb, pose, { iris: IRIS, mood });
  }
  R.blush(ctx, -hr * 0.08, hr * 0.52, hr * 0.14);
  R.blush(ctx, hr * 0.84, hr * 0.5, hr * 0.09);
  ctx.strokeStyle = R.darken(SKIN, 0.35); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(hr * 0.5, hr * 0.44, hr * 0.05, -0.5, 1.4); ctx.stroke();
  const mx = hr * 0.44, my = hr * 0.62;
  if (r.paci) {
    R.ellipse(ctx, mx + 1, my, hr * 0.2, hr * 0.13, "#ff8ab0", { lw: 2.2 });
    ctx.strokeStyle = R.INK; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.arc(mx + hr * 0.18, my + hr * 0.04, hr * 0.09, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#7fd6ff"; ctx.lineWidth = 1.6; ctx.stroke();
  } else {
    R.mouth(ctx, mx, my, hr * 0.3, r.mouth);
  }

  if (f >= 1 && f <= 3) hibiscus(ctx, R, -hr * 0.55, -hr * 0.72, hr * 0.3, HIBIS[f], 0.3 + Math.sin(t * 0.05) * 0.05);
  if (f === 0) hibiscus(ctx, R, -hr * 0.62, -hr * 0.5, hr * 0.2, HIBIS[0], 0.2);
  if (f === 2) {
    const cols = ["#ffffff", "#ffd23f", "#ff6f91", "#ffffff", "#ffb347", "#ff6f91"];
    for (let i = 0; i < 6; i++) {
      const a = -2.75 + i * 0.36;
      hibiscus(ctx, R, Math.cos(a) * hr * 0.9 - hr * 0.08, Math.sin(a) * hr * 0.86 - hr * 0.02, hr * 0.17, cols[i], a);
    }
  }
  if (f === 3) {
    ctx.strokeStyle = R.INK; ctx.lineWidth = hr * 0.2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(-hr * 0.08, hr * 0.02, hr * 0.92, -2.6, -0.45); ctx.stroke();
    ctx.strokeStyle = "#ffc53d"; ctx.lineWidth = hr * 0.1; ctx.stroke();
    R.star(ctx, hr * 0.28, -hr * 0.86, hr * 0.2, "#ffe27a", { points: 8, inner: 0.55, lw: 2 });
  }
  if (f === 4) {
    ctx.strokeStyle = R.INK; ctx.lineWidth = hr * 0.18; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(-hr * 0.08, hr * 0.02, hr * 0.92, -2.5, -0.55); ctx.stroke();
    ctx.strokeStyle = "#ffe27a"; ctx.lineWidth = hr * 0.09; ctx.stroke();
    const opening=pose.state==='cast'||pose.state==='attack'?1:.7;
    for(let i=0;i<7;i++){
      const a=-Math.PI+i*Math.PI/6;
      const x=Math.cos(a)*hr*.92,y=Math.sin(a)*hr*.92-hr*.2;
      ctx.save();ctx.translate(x,y);ctx.rotate(a-Math.PI/2);
      R.ellipse(ctx,0,-hr*.14,hr*.12,hr*.3*opening,i%2?'#ff8da7':'#fff2ba',{lw:1.8});ctx.restore();
    }
    hibiscus(ctx, R, -hr * 0.6, -hr * 0.7, hr * 0.22, "#ffffff", 0.3);
  }
}

function dressPath(ctx, x0, sy, hemY, wT, wH, shift, f, flare) {
  ctx.beginPath();
  ctx.moveTo(x0 - wT, sy);
  ctx.quadraticCurveTo(x0 - wT - 2, sy + (hemY - sy) * 0.4, x0 - wH + shift, hemY);
  const n = f === 0 ? 3 : 5;
  const w = (wH * 2) / n;
  for (let i = 0; i < n; i++) {
    const xa = x0 - wH + shift + w * i;
    ctx.quadraticCurveTo(xa + w / 2, hemY + 3 + flare * 1.2, xa + w, hemY);
  }
  ctx.quadraticCurveTo(x0 + wT + 2, sy + (hemY - sy) * 0.4, x0 + wT, sy);
  ctx.quadraticCurveTo(x0, sy + 4, x0 - wT, sy);
  ctx.closePath();
}

function torso(ctx, R, pose, f, d, r) {
  const t = pose.t, hipY = -d.ll, sy = hipY - d.th;
  const col = DRESS[f];
  const x0 = -0.5 + r.hipX * 0.4;
  const wT = f === 0 ? 10 : 8;
  let wH = (f === 0 ? 14 : 13 + f * 0.8) + r.flare * 7;
  let hemY = hipY + d.ll * (f === 0 ? 0.35 : f >= 3 ? 0.45 : 0.32) - r.hemLift;
  if (f === 4) hemY = hipY + d.ll * 0.55 - r.hemLift;
  const shift = -pose.sway * 3 + r.hipX * 0.6 + (r.skirt || 0) * 3;
  if (f === 0) {
    R.blob(ctx, [[x0 - 9, sy + 1], [x0 + 9, sy + 1], [x0 + 13, sy + d.th * 0.7], [x0 + 9, hemY], [x0 - 9, hemY], [x0 - 13, sy + d.th * 0.7]], col);
    R.ellipse(ctx, x0 + 3, sy + d.th * 0.55, 5, 5, "#ffffff", { lw: 2 });
    hibiscus(ctx, R, x0 + 3, sy + d.th * 0.55, 3.2, "#ff5c8a");
    return;
  }
  dressPath(ctx, x0, sy, hemY, wT, wH, shift, f, r.flare);
  ctx.fillStyle = col;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = R.alpha(R.lighten(col, 0.3), 0.55);
  ctx.beginPath(); ctx.ellipse(x0 - wH * 0.55, sy + (hemY - sy) * 0.35, wH * 0.45, (hemY - sy) * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  if (f <= 2) {
    const fl = [[-6, 0.25], [4, 0.45], [-2, 0.8], [8, 0.95], [-10, 1.05], [2, 1.25]];
    ctx.fillStyle = f === 2 ? "#fff3f6" : "#ffffff";
    for (const [fx, fy] of fl) {
      const cx = x0 + fx + shift * fy * 0.5, cy = sy + (hemY - sy) * fy * 0.8;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.moveTo(cx + Math.cos(a) * 2.2 + 1.3, cy + Math.sin(a) * 2.2);
        ctx.arc(cx + Math.cos(a) * 2.2, cy + Math.sin(a) * 2.2, 1.3, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    for (const [fx, fy] of fl) { const cx = x0 + fx + shift * fy * 0.5, cy = sy + (hemY - sy) * fy * 0.8; ctx.moveTo(cx + 1, cy); ctx.arc(cx, cy, 1, 0, Math.PI * 2); }
    ctx.fill();
  } else {
    const gold = f === 3 ? "#ffc53d" : "#ffd35a";
    ctx.fillStyle = gold;
    ctx.fillRect(x0 - 30, hemY - 6, 60, 8);
    ctx.fillRect(x0 - 30, sy + d.th * 0.42, 60, 3.2);
    ctx.fillStyle = f === 3 ? "#8a1522" : "#ffb3d0";
    ctx.beginPath();
    for (let i = -5; i <= 5; i++) { const x = x0 + i * 5 + shift * 0.6; ctx.moveTo(x - 2.5, hemY - 1); ctx.lineTo(x, hemY - 5); ctx.lineTo(x + 2.5, hemY - 1); }
    ctx.fill();
    ctx.fillStyle = gold;
    ctx.beginPath(); ctx.moveTo(x0 - 2.5, sy); ctx.lineTo(x0 + 2.5, sy); ctx.lineTo(x0 + 4 + shift * 0.4, hemY); ctx.lineTo(x0 - 4 + shift * 0.4, hemY); ctx.fill();
    if (f === 4) {
      ctx.fillStyle = "rgba(255,210,120,0.35)";
      ctx.beginPath(); ctx.ellipse(x0 + 6, hemY - 4, 10, 16, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.fillStyle = R.alpha(R.darken(col, 0.5), 0.18);
  ctx.beginPath(); ctx.ellipse(x0 + wH * 0.8, hemY, wH * 0.6, (hemY - sy) * 0.9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  dressPath(ctx, x0, sy, hemY, wT, wH, shift, f, r.flare);
  R.paint(ctx, null);
  R.shine(ctx, x0 - wT * 0.4, sy + 5, 2.2, 4, 0.45);

  if (f === 2) {
    const wy = hipY - 3, n = 11, L = d.ll * 0.62;
    const fan = 0.22 + r.flare * 0.62;
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1), x = x0 - 13 + k * 26;
      const ang = (k - 0.5) * 2 * fan - pose.sway * 0.28 + Math.sin(t * 0.13 + i * 0.8) * 0.06 + r.hipX * 0.03 + pose.bounce * (k - 0.5) * 0.3 + (r.skirt || 0) * (0.18 + 0.1 * Math.sin(i * 1.7));
      const ex = x + Math.sin(ang) * L, ey = wy + Math.cos(ang) * L * (1 - r.flare * 0.12);
      const px = Math.cos(ang) * 2, py = -Math.sin(ang) * 2;
      R.poly(ctx, [[x - 2.2, wy], [x + 2.2, wy], [ex + px * 0.3, ey + py * 0.3], [ex - px * 0.3, ey - py * 0.3]],
        i % 2 ? "#6cc04a" : "#8fd65a", { lw: 1.6 });
    }
    R.blob(ctx, [[x0 - 14, wy - 3], [x0 + 14, wy - 3], [x0 + 14.5, wy + 2], [x0 - 14.5, wy + 2]], "#c98a4a", { lw: 2 });
  }
  if (f >= 2) {
    const cols = f === 2 ? ["#ff6f91", "#ffd23f", "#ffffff"] : f === 3 ? ["#ffc53d", "#fff0a0", "#ff9a3d"] : ["#ffffff", "#ffe27a", "#ffd0e6"];
    for (let i = 0; i < 7; i++) {
      const a = 0.15 * Math.PI + (i / 6) * 0.7 * Math.PI;
      R.ellipse(ctx, x0 + 1.5 + Math.cos(a) * 9.5, sy + 1 + Math.sin(a) * 6, 2.8, 2.8, cols[i % 3], { lw: 1.6 });
    }
  }
}

// Kilo Flor Solar: corona-girasol plana detrás del cuerpo (sin gradientes,
// colores planos). Los pétalos laten con la música y se abren en la intro.
const SUN_PETAL = ["#ffd23f", "#ff9a3d"];
function wings(ctx, R, pose, sy) {
  const t = pose.t;
  const flap = Math.min(1.25, 0.85 + 0.15 * Math.abs(Math.sin(t * 0.12)) + kiloWelcomeRig(pose, 4).wing * 0.3);
  const cx = -1, cy = sy - 21, n = 12, rot = t * 0.01; // centrado tras la cabeza: la enmarca como un sol
  ctx.save();
  ctx.fillStyle = "rgba(255,226,122,0.18)";
  ctx.beginPath(); ctx.arc(cx, cy, 40 * flap, 0, Math.PI * 2); ctx.fill();
  for (let ring = 0; ring < 2; ring++) {
    for (let i = 0; i < n; i++) {
      const a = rot + (i + ring * 0.5) * (Math.PI * 2 / n);
      const L = (ring ? 27 : 35) * flap;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      R.ellipse(ctx, 0, -L * 0.62, 6.5 - ring, L * 0.42, SUN_PETAL[ring], { lw: 2.2, shade: false });
      ctx.restore();
    }
  }
  R.ellipse(ctx, cx, cy, 17, 17, "#8a4e22", { lw: 2.4, shade: false });
  ctx.fillStyle = "#5a3014";
  for (let i = 0; i < 10; i++) { const a = i * 2.4, rr = 3 + (i % 3) * 4; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1.4, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

function cape(ctx, R, pose, d, r) {
  const t = pose.t, hipY = -d.ll, sy = hipY - d.th;
  const fly = -pose.sway * 10 + (pose.state === "run" ? 8 : 0) + (pose.air ? 6 : 0) + r.hairUp * 4;
  const bot = -2 - fly * 0.9;
  const pts = [[5, sy + 1], [-4, sy - 1]];
  pts.push([-14 - fly * 0.3, sy + d.th * 0.55]);
  for (let i = 0; i <= 4; i++) {
    const k = i / 4;
    pts.push([-26 - fly * 0.9 + k * 26 + Math.sin(t * 0.11 + k * 4) * 2, lerp(bot, -1, k) + Math.sin(t * 0.15 + k * 5) * 3 * (1 - k * 0.5)]);
  }
  pts.push([4, hipY]);
  R.blob(ctx, pts, "#ffc53d", { shade: false });
  const inner = pts.map(([x, y]) => [x * 0.92 + 0.8, y * 0.94 + (y - sy) * -0.02]);
  inner[0] = [3, sy + 2]; inner[1] = [-3, sy];
  R.blob(ctx, inner, "#b31f30", { line: false });
}

function effects(ctx, R, pose, f, d, r, headTop) {
  const t = pose.t, sy = -d.ll - d.th;
  if (r.fx === "notes") {
    const cols = ["#ffe04a", "#7fe0ff", "#ff8ab0"];
    for (let i = 0; i < 3; i++) {
      const k = ((t * 0.02 + i / 3) % 1);
      note(ctx, R, 18 + k * 24 + Math.sin(k * 8 + i) * 4, sy + 2 - k * 36, 7.5, cols[i], Math.min(1, Math.sin(k * Math.PI) * 2));
    }
  } else if (r.fx === "summon") {
    const oy = headTop - 12 + Math.sin(t * 0.2) * 2;
    glowOrb(ctx, R, 0, oy, 7 + r.fxK * 5, t, f >= 3 ? "#ffd36a" : "#ff8ab0");
    ctx.save();
    ctx.strokeStyle = "rgba(255,240,200,0.6)"; ctx.lineWidth = 1.6; ctx.setLineDash([2, 4]); ctx.lineDashOffset = -t * 0.6;
    ctx.beginPath(); ctx.moveTo(r.handF[0], r.handF[1]); ctx.quadraticCurveTo(10, oy + 6, 0, oy);
    ctx.moveTo(r.handB[0], r.handB[1]); ctx.quadraticCurveTo(-10, oy + 6, 0, oy); ctx.stroke();
    ctx.restore();
  } else if (r.fx === "spin") {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const y = -d.ll * (0.4 + i * 0.5), a0 = t * 0.4 + i * 2;
      ctx.beginPath(); ctx.ellipse(0, y, 22 + i * 2, 5, 0, a0, a0 + 2.2); ctx.stroke();
    }
    ctx.restore();
    hibiscus(ctx, R, Math.cos(t * 0.3) * 24, -d.ll * 0.6 + Math.sin(t * 0.3) * 4, 4, "#ff6f91", t * 0.2);
  } else if (r.fx === "flowers") {
    const cols = ["#ff6f91", "#ffd23f", "#ffffff", "#ff4d6d"];
    for (let i = 0; i < 6; i++) {
      const k = ((t * 0.012 + i / 6) % 1);
      ctx.save();
      ctx.globalAlpha *= Math.min(1, (1 - k) * 2.5);
      hibiscus(ctx, R, Math.sin(i * 2.1 + t * 0.03) * 34 * (0.5 + k), sy - 6 - k * 44, 4 + (i % 3), cols[i % 4], t * 0.05 + i);
      ctx.restore();
    }
  }
}

function drawCrawl(ctx, pose, R) {
  const d = DIM[0], p = pose.phase, s = Math.sin(p), c = Math.cos(p);
  const pink = DRESS[0], dk = R.darken(pink, 0.15);
  const bob = -Math.abs(c) * 2;
  ctx.save();
  ctx.translate(0, bob);
  const r = { mood: "normal", mouth: "smile", paci: true, hairUp: 0.2, wink: false };
  ik(ctx, R, 6, -18, 12 - s * 5, -2 - Math.max(0, -c) * 4, 17, 1, d.aw, R.darken(SKIN, 0.15), { hand: 3.8 });
  const kneeB = [-12 + s * 4, -3 - Math.max(0, c) * 3];
  R.limb(ctx, -10, -14, -12, -9, kneeB[0], kneeB[1], d.lw, dk, { hand: false });
  R.limb(ctx, kneeB[0], kneeB[1], kneeB[0] - 5, kneeB[1] + 1, kneeB[0] - 10, kneeB[1] - 6, d.lw * 0.8, dk, { hand: false });
  R.ellipse(ctx, kneeB[0] - 11, kneeB[1] - 7, 3.2, 4, R.darken(SKIN, 0.15), { lw: 2.2 });
  R.ellipse(ctx, -4, -15, 16, 11, pink);
  R.ellipse(ctx, -3, -11, 9, 5, "#ffffff", { line: false, shade: false });
  const kneeF = [-8 - s * 4, -3 - Math.max(0, -c) * 3];
  R.limb(ctx, -8, -12, -8, -7, kneeF[0], kneeF[1], d.lw, pink, { hand: false });
  R.limb(ctx, kneeF[0], kneeF[1], kneeF[0] - 5, kneeF[1] + 1, kneeF[0] - 10, kneeF[1] - 6, d.lw * 0.8, pink, { hand: false });
  R.ellipse(ctx, kneeF[0] - 11, kneeF[1] - 7, 3.4, 4.2, SKIN, { lw: 2.2 });
  ctx.save();
  ctx.translate(16, -34 + c * 0.8);
  ctx.rotate(0.06 + s * 0.04);
  ctx.scale(0.92, 0.92);
  ponytail(ctx, R, pose, 0, d.hr, r);
  head(ctx, R, pose, 0, d.hr, r);
  ctx.restore();
  ik(ctx, R, 8, -16, 14 + s * 5, -2 - Math.max(0, c) * 4, 17, 1, d.aw, SKIN, { hand: 3.8 });
  ctx.restore();
}


// Cosmetic follow-through only: no player or combat state is written.
const KILO_MOTION_MEDIA=typeof window!=='undefined'&&typeof window.matchMedia==='function'?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
export function kiloFootwork(pose={}){
 if(pose.reduceMotion||KILO_MOTION_MEDIA?.matches||pose.air||!['idle','run'].includes(pose.state||'idle'))return null;
 const unit=v=>Number.isFinite(Number(v))?Math.max(0,Math.min(1,Number(v))):0;
 const landing=unit(pose.land),turn=pose.state==='run'?unit(pose.turnPulse):0,brake=pose.state==='run'?unit(pose.brake):0,running=pose.state==='run'?unit(pose.speed):0;
 return landing>.02||turn>.02||brake>.02||running>.3?{landing,turn,brake,running}:null;
}
function drawKiloFootwork(ctx,pose,f,t){
 const m=kiloFootwork(pose);if(!m)return;ctx.save();ctx.lineCap='round';const petal=f>=3?'#ffe3a8':'#ffb4b7';
 if(m.running>.3)for(let i=0;i<3;i++){const k=((t*.055+i/3)%1+1)%1;ctx.globalAlpha=.42*(1-k)*m.running;ctx.fillStyle=i===1?'#fff3d4':petal;ctx.beginPath();ctx.ellipse(-15-k*22,-2-k*(5+f),2.4,1.2,.4,0,Math.PI*2);ctx.fill();}
 if(m.landing>.02){ctx.globalAlpha=m.landing*.6;ctx.strokeStyle=petal;ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(0,-1,12+(1-m.landing)*20,3,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<3;i++){ctx.fillStyle=petal;ctx.beginPath();ctx.ellipse(-9+i*9,-3-(1-m.landing)*12,2,1.2,-.5+i*.5,0,Math.PI*2);ctx.fill();}}
 if(m.turn>.02){ctx.globalAlpha=m.turn*.6;ctx.strokeStyle='#fff1cc';ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(-7,-12,14+f,Math.PI*.55,Math.PI*1.3);ctx.stroke();}
 if(m.brake>.02){ctx.globalAlpha=m.brake*.55;ctx.strokeStyle=petal;ctx.lineWidth=1.4;for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(-17-i*5,-3-i*4);ctx.quadraticCurveTo(-25-i*5,-9-i*4,-32-i*5,-5-i*4);ctx.stroke();}}
 ctx.restore();
}

function draw(ctx, pose, R) {
  const f = pose.form, d = DIM[f], t = pose.t, st = pose.state;
  if (f === 0 && st === "run") return drawCrawl(ctx, pose, R);
  const dead = st === "dead";
  drawKiloFootwork(ctx,pose,f,pose.t||0);
  const r = dead ? solve({ ...pose, state: "idle", flourish: 0 }, d, f) : solve(pose, d, f);
  // Cast-driven follow-through: independent of wall clock and continuous at rest.
  if (!dead && (st === 'cast' || st === 'attack')) {
    const progress = Math.max(0, Math.min(1, Number(st === 'attack' ? pose.atk : pose.cast) || 0));
    const beat = Math.sin(progress * Math.PI), strike = Math.sin(progress * Math.PI * 2);
    const strength = pose.reduceMotion ? .3 : 1;
    r.lean += strike * .12 * strength;
    r.oy += (progress < .35 ? beat * 2 : -beat * 2) * strength;
    r.headRot -= strike * .08 * strength;
    r.hairLag += strike * .3 * strength;
    r.skirt += beat * .35 * strength;
    r.footF[0] += beat * (st === 'attack' ? 4 : 2);
    r.footB[1] -= beat * 2 * strength;
    if (st === 'cast' && pose.castSlot === 0) {
      r.handF[1] += strike * 5 * strength;
      r.headRot = -.08 + beat * .16;
    }
    if (st === 'cast' && pose.castSlot === 2) {
      r.handF[1] += (1 - beat) * 10; r.handB[1] += (1 - beat) * 10;
      r.flare += beat * .5; r.hairUp += beat * .25;
    }
  }
  const hipY = -d.ll, sy = hipY - d.th, al = d.al;
  const hx = 1 + r.hipX * 0.3, hy = sy - d.hr * 0.9;
  if (dead) {
    r.mood = "dead"; r.mouth = "o"; r.paci = false; r.hairUp = -0.3;
    r.handF = [4 + al * 0.8, sy - al * 0.2]; r.handB = [-5 - al * 0.8, sy - al * 0.1];
    r.footF = [6, 0]; r.footB = [-6, 0]; r.headRot = 0.1; r.flare = 0.3;
  }

  ctx.save();
  if (dead) { ctx.translate(46 + f * 2, -d.hr * 1.12); ctx.rotate(-Math.PI / 2); }
  ctx.translate(r.ox, r.oy);
  if (r.spin !== 1) ctx.scale(r.spin, 1);
  // The chest breathes around the REAL hip joint. Both IK shoulders,
  // hair, dress and the ukulele share this transform; shoes do not scale.
  const life=kiloWelcomeRig(pose,f);
  const bodyT = () => {
    ctx.translate(r.hipX, hipY);ctx.rotate(r.lean);
    if(life.active)ctx.scale(life.ribX,life.ribY);
    ctx.translate(0,-hipY);
  };
  const headT = () => { ctx.translate(hx, sy); ctx.rotate(r.headRot); ctx.translate(0, hy - sy); };
  const skinB = R.darken(SKIN, 0.16);
  const legCol = f === 0 ? DRESS[0] : SKIN;
  const legL = (d.ll - 4) * 1.06;

  ctx.save();
  bodyT();
  if (f === 4 && !dead) wings(ctx, R, pose, sy);
  if (f === 3) cape(ctx, R, pose, d, r);
  if (r.fx === "summon" && f >= 1) glowOrb(ctx, R, 0, sy - d.hr * 2 - 6, 12, t, "#fff0c0");
  ctx.save(); headT(); ponytail(ctx, R, pose, f, d.hr, r); ctx.restore();
  if (r.uke === "back") uke(ctx, R, -21, sy + d.th * 0.7, -Math.PI / 2 - 0.55 + pose.sway * 0.1, 13 + f, f === 4);
  if (f === 3) {
    const hb = r.staffUp ? [r.handB[0], r.handB[1]] : r.handB;
    staff(ctx, R, hb[0], hb[1], r.staffUp ? -0.15 : -0.12 - pose.sway * 0.1, 56, t, r.staffUp);
  }
  const backArm = () => {
    ik(ctx, R, -5, sy + 3, r.handB[0], r.handB[1], al, r.backOver ? -1 : 1, d.aw, skinB, { hand: d.aw * 0.72 });
    R.ellipse(ctx, -5, sy + 3, 5, 4.5, R.darken(DRESS[f], 0.15), { lw: 2.4 });
  };
  if (!r.backOver) backArm();
  ctx.restore();

  const leg = (hxp, foot, col, fcol) => {
    const fy = foot[1] - 3.6, fx = foot[0];
    const e = ik(ctx, R, hxp + r.hipX, hipY, fx, fy, legL, -1, d.lw, col, { hand: false });
    R.ellipse(ctx, e[0] + 2.4, e[1] + 0.6, d.lw * 0.7, d.lw * 0.46, fcol, { lw: 2.4 });
  };
  leg(-3, r.footB, f === 0 ? R.darken(DRESS[0], 0.12) : skinB, skinB);
  leg(3, r.footF, legCol, SKIN);

  ctx.save();
  bodyT();
  torso(ctx, R, pose, f, d, r);
  // V462: the back-slung ukulele hangs from a visible strap across the chest,
  // so it no longer floats beside Kilo as a stray stick.
  if (r.uke === "back") kiloUkeStrap(ctx, sy, d, f);
  if(f>=1){
    const count=f===1?3:f===2?5:7;
    for(let i=0;i<count;i++){
      const x=(i-(count-1)/2)*3.5,y=sy+6+Math.abs(i-(count-1)/2)*.8;
      R.ellipse(ctx,x,y,2.2,3.2,f<3?'#76cbb4':'#ffe09a',{lw:1.2});
    }
  }
  const frontArm = () => {
    // V462: when strumming, the elbow points OUT in front of the ukulele instead of
    // looping back across the chest (the brown "C" seen in the companion panel).
    const strumming = r.uke === "play" && r.handF[1] > sy + 3 && r.handF[0] < 4 + al * 0.5;
    const e = ik(ctx, R, 4, sy + 3, r.handF[0], r.handF[1], al, strumming ? -1 : 1, d.aw, SKIN, { hand: d.aw * 0.75 });
    R.ellipse(ctx, 4, sy + 3.5, 5, 4.5, DRESS[f], { lw: 2.4 });
    if (f === 0) {
      const ang = Math.atan2(e[0] - 4, -(e[1] - sy - 3)) * 0.4 + (r.fx === "notes" ? Math.sin(t * 0.8) * 0.5 : 0) + (st === "attack" ? pose.atk * 1.5 - 0.5 : 0);
      uke(ctx, R, e[0], e[1], ang, 7, false);
    } else if (r.uke === "hand") {
      const a = Math.atan2(e[1] - sy - 3, e[0] - 4), us = 13 + f;
      uke(ctx, R, e[0] + Math.cos(a) * us * 1.55, e[1] + Math.sin(a) * us * 1.55, a + Math.PI, us, f === 4);
      R.ellipse(ctx, e[0], e[1], d.aw * 0.75, d.aw * 0.75, SKIN, { lw: 2.4 });
    }
  };
  if (r.uke === "play") {
    const bx = 1, by = sy + al * 0.62;
    uke(ctx, R, bx, by, Math.atan2(r.handB[1] - by, r.handB[0] - bx), 14 + f, f === 4);
    R.ellipse(ctx, r.handB[0], r.handB[1], d.aw * 0.72, d.aw * 0.72, skinB, { lw: 2.4 });
  }
  if (!r.armOver) frontArm();
  if (r.smear > 0) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255," + (0.65 * r.smear).toFixed(3) + ")";
    ctx.lineWidth = 7; ctx.lineCap = "round";
    const a1 = Math.PI / 2 - r.smearA;
    ctx.beginPath(); ctx.arc(4, sy + 3, al + 12, a1 - 1.6, a1); ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  headT();
  head(ctx, R, pose, f, d.hr, r);
  ctx.restore();
  if (r.backOver) backArm();
  if (r.armOver) frontArm();
  effects(ctx, R, pose, f, d, r, hy - d.hr);
  ctx.restore();
  ctx.restore();

  if (dead) {
    for (let i = 0; i < 3; i++) {
      const a = t * 0.1 + (i * Math.PI * 2) / 3;
      R.star(ctx, -d.hr * 0.2 + Math.cos(a) * 14, -d.hr * 2.1 + Math.sin(a) * 4, 3.5, "#ffe04a", { lw: 1.5 });
    }
  }
}

export default { id: "kilo", draw };

export function kiloUkeStrap(ctx, sy, d, f) {
  ctx.save(); ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-9, sy + d.th * 0.62); ctx.quadraticCurveTo(-1, sy + d.th * 0.3, 6, sy + 1.5);
  ctx.strokeStyle = "#2a1a22"; ctx.lineWidth = 4.2; ctx.stroke();
  ctx.strokeStyle = f === 4 ? "#f0b040" : "#a5683a"; ctx.lineWidth = 2.2; ctx.stroke();
  ctx.restore();
}
