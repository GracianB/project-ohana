// V373 · Cuerno renovado: 5 formas cuadrúpedas que crecen con claridad.
//   1 Cuernín · Semilla   → potrito chibi, cabeza enorme, cuernito con brote.
//   2 Destello · Naciente → poni, cuerno corto en espiral, crin corta pastel.
//   3 Kirín Aurora          → unicornio, crin y cola arcoíris largas.
//   4 Serafín Aurora   → seis velas de aurora y melena de loto.
//   5 Cuerno Eclipse     → alas lunares, corona creciente y crin astral.
// Contrato igual que characters/art/cuerno.js: draw(ctx, pose, R) con origen en los
// cascos (y=0, arriba negativo), mirando a la derecha; draw.js ya escala por H/100.
// Sin gradientes, determinista (azar con hash sembrado).
import { drawRainbowPuff } from "../cuerno-stagecraft.js";
const TAU = Math.PI * 2;
export const CUERNO_V373_ANIMS = Object.freeze(["idle", "walk", "jump", "attack", "death", "trail"]);
export const CUERNO_V373_NAMES = Object.freeze(["Cuernín · Semilla", "Destello · Naciente", "Kirín Aurora", "Serafín Aurora", "Cuerno Eclipse"]);
const IRIS = ["#ff8cab", "#ffc28e", "#ffe9a3", "#9de7bb", "#a5e5fa", "#aeb9fb", "#e5b9f4"];
// Altura de la silueta en unidades de arte (draw.js: px = H/100 · unidades, con
// H = CUERNO_VISUAL_H = [118, 92, 91, 86, 82]) → en pantalla ≈ 55, 58, 70, 82, 96 px.
export const CUERNO_V373_HEIGHT = Object.freeze([47, 63, 77, 95, 117]);
const F = [
  // coat, dark (contorno de color), mane colors, head/body proportions, legs, horn, wings
  { coat: "#fff3fa", shade: "#f2d3e8", ink: "#6b4a7a", mane: ["#b786dd", "#e4c4ff", "#a77ad3"], head: 1.45, body: .8, leg: .55, horn: .5, wings: 0, tail: .6, sprout: true },
  { coat: "#fde9ff", shade: "#e9c6f2", ink: "#634477", mane: ["#c29bea", "#f0d9ff", "#ad83da"], head: 1.15, body: .9, leg: .8, horn: .85, wings: 0, tail: .8 },
  { coat: "#e5fff6", shade: "#b1ded8", ink: "#49657b", mane: ["#a688ed", "#8ee4e7", "#ffc2e3", "#efdca1", "#b6a5f2"], head: 1.06, body: 1, leg: 1, horn: 1.15, wings: 0, tail: 1.1 },
  { coat: "#f4f5ff", shade: "#d6d8f2", ink: "#52658b", mane: ["#bba8ed", "#e5b9f4", "#ffb8cf", "#ffe9a3", "#a5e5fa"], head: 1.02, body: 1.05, leg: 1.08, horn: 1.5, wings: 1.35, tail: 1.6, stars: true },
  { coat: "#202c49", shade: "#141d35", ink: "#111a30", mane: ["#a390df", "#d2b5ed", "#9acfe8", "#eee2ba"], head: .99, body: 1.1, leg: 1.12, horn: 1.9, wings: 1.65, tail: 1.8, stars: true, night: true },
];
const hash = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Shared expression in the game, welcome and preview; never revives hurt/death. */
export function cuernoExpression(pose = {}) {
  const state = pose.state || "idle", disabled = state === "dead" || state === "hurt";
  const reduced = pose.reduceMotion === true || pose.cuernoWelcome?.reduced === true;
  const t = Number.isFinite(pose.t) ? pose.t : 0;
  const beat = disabled ? "" : pose.cuernoK?.phase==="warn" ? "shy" : state==="trail" ? "prance" : pose.cuernoBeat || (pose.cuernoDreamT>0?"stargaze":"");
  const welcome = disabled ? null : pose.cuernoWelcome;
  const blink = Number.isFinite(pose.blink) ? clamp(pose.blink, 0, 1) : 0;
  // A brief blink every few seconds; rig blink remains authoritative.
  const phase = ((t % 260) + 260) % 260;
  const autoBlink = !reduced && state === "idle" && phase >= 220 && phase <= 230
    ? Math.sin((phase - 220) / 10 * Math.PI) : 0;
  return {
    blink: disabled ? 0 : Math.max(blink, autoBlink),
    happy: !disabled && (state === "victory" || beat === "prance"),
    shy: !disabled && beat === "shy",
    wonder: !disabled && (beat === "curious" || beat === "stargaze" || Number(welcome?.wonder) > .3),
    tilt: disabled || reduced ? 0 : beat === "shy" ? .065 : beat === "curious" ? -.065 : welcome ? clamp((Number(welcome.wonder) || 0) * -.06 + (Number(welcome.bow) || 0) * .06, -.08, .08) : Math.sin(t * .025) * .012,
    reduced,
  };
}

// A single flowing lock, with a tapered tip instead of stacked oval beads.
function lock(ctx, x, y, width, length, wave, color, ink, lw) {
  ctx.beginPath();ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - width, y + length * .15, x - width + wave, y + length * .8, x + wave, y + length);
  ctx.bezierCurveTo(x + width * .65 + wave, y + length * 1.04, x + width * .9 + wave, y + length * .83, x + width * .68, y + length * .45);
  ctx.quadraticCurveTo(x + width * .7, y + length * .1, x, y);
  ctx.closePath();ctx.fillStyle = color;ctx.fill();ctx.strokeStyle = ink;ctx.lineWidth = lw;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x - width * .23, y + length * .2);
  ctx.bezierCurveTo(x - width * .45, y + length * .36, x - width * .45 + wave, y + length * .62, x + wave * .7, y + length * .76);
  ctx.strokeStyle = "rgba(255,255,255,.48)";ctx.lineWidth = lw * .55;ctx.stroke();
}

function animOf(pose) {
  const st = pose?.state || "idle";
  if (st === "dead") return "death";
  if (st === "trail") return "trail";
  if (st === "attack" || (st === "cast" && (pose.castSlot | 0) === 0)) return "attack";
  if (st === "jump" || st === "fall" || st === "glide" || pose?.air) return "jump";
  if (st === "run") return "walk";
  if (st === "hurt") return "hurt";
  if (st === "victory") return "victory";
  return "idle";
}
function ell(ctx, x, y, rx, ry, rot, fill, ink, lw) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, TAU);
  ctx.fillStyle = fill; ctx.fill(); if (ink) { ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.stroke(); }
}
function star(ctx, x, y, r, col) {
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
// Tapered, articulated equine limbs. Four authored attachments remain unchanged.
function leg(ctx, P, hx, hy, len, swing, w, far, lw) {
  const stance = far ? -2.4 * (len / 22) : 0;
  hx += stance;
  const hind=hx<0;
  const kx=hx+(hind?-.16:.075)*len+Math.sin(swing)*len*.38,ky=hy+Math.cos(swing)*len*.52;
  const fx=hx+(hind?.055:-.035)*len+Math.sin(swing*.6)*len*.42,fy=hy+len*.98-Math.max(0,Math.sin(swing))*len*.15;
  const thigh=w*(hind?.88:.62),cannon=w*.27;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  ctx.fillStyle=far?P.shade:P.coat;ctx.strokeStyle=P.ink;ctx.lineWidth=lw*.78;
  ctx.beginPath();ctx.moveTo(hx-thigh,hy);
  ctx.quadraticCurveTo(hx-thigh*.9,hy+len*.2,kx-cannon,ky);
  ctx.quadraticCurveTo(kx-cannon*.9,ky+len*.12,fx-cannon,fy-w*.3);
  ctx.lineTo(fx+cannon,fy-w*.3);
  ctx.quadraticCurveTo(kx+cannon*1.1,ky+len*.12,kx+cannon,ky-w*.1);
  ctx.quadraticCurveTo(hx+thigh,hy+len*.16,hx+thigh,hy);ctx.closePath();ctx.fill();ctx.stroke();
  // A small fetlock and a single split hoof, rather than a bead at every joint.
  ctx.fillStyle=far?P.shade:P.coat;ctx.beginPath();ctx.moveTo(fx-cannon,fy-w*.8);ctx.quadraticCurveTo(fx-w*.75,fy-w*.25,fx-w*.58,fy+w*.1);ctx.lineTo(fx+w*.68,fy+w*.1);ctx.quadraticCurveTo(fx+w*.56,fy-w*.42,fx+cannon,fy-w*.8);ctx.fill();
  ctx.fillStyle=P.night?'#d0c1ed':P.wings?'#929ed0':'#a68bc5';
  ctx.beginPath();ctx.moveTo(fx-w*.56,fy-w*.24);ctx.quadraticCurveTo(fx-w*.75,fy+w*.31,fx-w*.45,fy+w*.35);ctx.lineTo(fx+w*.66,fy+w*.35);ctx.quadraticCurveTo(fx+w*.85,fy+w*.15,fx+w*.5,fy-w*.25);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle=far?'#bba9d1':P.night?'#f7eaff':'#fff5ff';ctx.lineWidth=lw*.55;
  ctx.beginPath();ctx.moveTo(fx-w*.35,fy-w*.08);ctx.lineTo(fx+w*.17,fy-w*.08);ctx.stroke();
  if(!far){ctx.strokeStyle=P.night?'#77658f':'#d5bce7';ctx.lineWidth=lw*.45;ctx.beginPath();ctx.moveTo(hx+w*.14,hy+len*.18);ctx.quadraticCurveTo(kx+w*.1,ky-len*.08,kx+w*.12,ky+len*.04);ctx.stroke();}
  ctx.restore();
}
// Three living aurora sails on each side; the final form opens lunar crescents.
// All lobes share a shoulder, so the silhouette stays anatomical in motion.
function wing(ctx,P,x,y,span,flap,far,lw){
 ctx.save();ctx.translate(x,y);ctx.rotate((far?-.19:.12)-flap*.32);
 const night=P.night, colors=night?['#303b71','#65559c','#315a79']:['#b9ece4','#d8b6f0','#f6bfdc'];
 ctx.lineJoin='round';ctx.lineCap='round';
 for(let i=2;i>=0;i--){
  const angle=(-.58+i*.47)+(far?-.28:0), reach=span*(1-i*.12);
  ctx.save();ctx.rotate(angle);
  ctx.beginPath();ctx.moveTo(3,4);
  ctx.bezierCurveTo(-reach*.24,-reach*.46,-reach*.76,-reach*.83,-reach,-reach*.43);
  if(night){
   // Swept crescent with a deep open bite: moon wings, not feather fans.
   ctx.bezierCurveTo(-reach*1.13,-reach*.10,-reach*.91,reach*.24,-reach*.63,reach*.31);
   ctx.bezierCurveTo(-reach*.88,reach*.04,-reach*.78,-reach*.34,-reach*.57,-reach*.39);
   ctx.bezierCurveTo(-reach*.30,-reach*.38,-reach*.21,reach*.03,3,4);
  }else{
   ctx.bezierCurveTo(-reach*1.12,-reach*.06,-reach*.77,reach*.17,-reach*.88,reach*.40);
   ctx.bezierCurveTo(-reach*.48,reach*.28,-reach*.67,-reach*.13,-reach*.40,-reach*.19);
   ctx.bezierCurveTo(-reach*.21,-reach*.24,-reach*.18,reach*.11,3,4);
  }
  ctx.closePath();ctx.fillStyle=far?(night?'#283052':'#aaaed0'):colors[i];ctx.fill();
  ctx.strokeStyle=far?(night?'#667ba6':'#8a86ad'):night?'#a2dfe6':'#756795';ctx.lineWidth=lw*.75;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-reach*.08,-reach*.03);
  ctx.bezierCurveTo(-reach*.33,-reach*.30,-reach*.71,-reach*.61,-reach*.94,-reach*.40);
  ctx.strokeStyle=night?'#d2e8ff':'#fff8ff';ctx.lineWidth=lw*.95;ctx.stroke();
  if(night){
   const pts=[[-.24,-.18],[-.43,-.36],[-.66,-.48],[-.85,-.41]];
   ctx.beginPath();pts.forEach(([px,py],j)=>j?ctx.lineTo(px*reach,py*reach):ctx.moveTo(px*reach,py*reach));
   ctx.strokeStyle='#c2b6f1';ctx.lineWidth=lw*.45;ctx.stroke();
   pts.forEach(([px,py],j)=>star(ctx,px*reach,py*reach,span*(j===2?.032:.018),'#e5ffff'));
  }else{
   ctx.beginPath();ctx.moveTo(-reach*.32,-reach*.21);ctx.bezierCurveTo(-reach*.54,-reach*.31,-reach*.75,-reach*.24,-reach*.83,-reach*.04);
   ctx.strokeStyle='#fff4e4';ctx.lineWidth=lw*.6;ctx.stroke();
  }
  ctx.restore();
 }
 // A layered lotus shoulder binds the three sails to the back.
 for(let i=2;i>=0;i--){ctx.save();ctx.rotate(i*.55-.6);lock(ctx,-2,-3,span*.065,span*.27,-span*.12,colors[i],night?'#9eb9df':'#84719f',lw*.55);ctx.restore();}
 ctx.restore();
}

function ascendantMane(ctx,P,x,y,u,t,reduced,dead){
 if(dead)return;
 ctx.save();ctx.translate(x,y);ctx.lineJoin='round';
 const wave=reduced?0:Math.sin(t*.045)*1.4*u;
 for(let i=3;i>=0;i--){
  const r=(16+i*4)*u;
  ctx.beginPath();ctx.moveTo(0,3*u);
  ctx.bezierCurveTo(-r*.35,-r*.8,-r*1.1,-r*.8,-r*1.02,-r*.1);
  ctx.bezierCurveTo(-r*.92,r*.6,-r*.12,r*.5,-r*.48,r*.98+wave);
  ctx.bezierCurveTo(-r*.01,r*.78,-r*.14,r*.24,-r*.60,r*.18);
  ctx.bezierCurveTo(-r*.9,r*.1,-r*.45,-r*.45,0,3*u);ctx.closePath();
  ctx.fillStyle=P.mane[i%P.mane.length];ctx.fill();ctx.strokeStyle=P.night?'#9eb6db':P.ink;ctx.lineWidth=.65*u;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-r*.3,-r*.29);ctx.bezierCurveTo(-r*.9,-r*.5,-r*.84,r*.22,-r*.43,r*.32);
  ctx.strokeStyle=P.night?'#d2eaff':'#fff7ff';ctx.lineWidth=.45*u;ctx.stroke();
 }
 ctx.restore();
}

function auroraMantle(ctx,x,y,bodyY,u,t,reduced,hurt){
 ctx.save();ctx.translate(x,y);ctx.lineJoin='round';
 const wave=reduced||hurt?0:Math.sin(t*.055)*2*u;
 const colors=['#ae91e8','#79d9df','#d8b1f0','#f1acd6','#92dfce','#b7a0f0'];
 for(let i=5;i>=0;i--){
  const sx=-i*1.1*u,sy=i*.9*u,tx=-(25+i*4.5)*u,ty=(-18+i*6)*u+wave*(i%2?1:-1);
  ctx.beginPath();ctx.moveTo(sx,sy);
  ctx.bezierCurveTo(-12*u,(-8-i*1.3)*u,tx+12*u,ty-15*u,tx,ty);
  ctx.bezierCurveTo(tx-5*u,ty+6*u,tx+8*u,ty+10*u,tx+6*u,ty+17*u);
  ctx.bezierCurveTo(tx+9*u,ty+8*u,tx+2*u,ty+3*u,tx+4*u,ty-u);
  ctx.bezierCurveTo(tx+13*u,ty-10*u,-8*u,sy+4*u,sx,sy);ctx.closePath();
  ctx.fillStyle=colors[i];ctx.fill();ctx.strokeStyle='#59618d';ctx.lineWidth=.75*u;ctx.stroke();
  ctx.strokeStyle='#f7fffb';ctx.lineWidth=.55*u;ctx.beginPath();ctx.moveTo(sx-4*u,sy-u);ctx.quadraticCurveTo(-25*u,ty-8*u,tx+u,ty);ctx.stroke();
 }
 for(let i=0;i<2;i++){
  const endY=Math.min(34*u,bodyY-y+30*u),endX=-(39+i*7)*u;
  ctx.beginPath();ctx.moveTo(-8*u,8*u);
  ctx.bezierCurveTo(-52*u,-6*u,-48*u,endY+6*u,endX,endY);
  ctx.bezierCurveTo(-43*u,endY+2*u,-48*u,-2*u,-5*u,5*u);ctx.closePath();
  ctx.fillStyle=i?'#a2e3e1':'#e1b8ec';ctx.fill();ctx.strokeStyle='#69638d';ctx.lineWidth=.65*u;ctx.stroke();
 }
 ctx.restore();
}

// Pedorreta arcoíris cómica y cute: nubecitas de colores + destellos tras la grupa.
function rainbowPuff(ctx, x, y, u, t, form, reduced) {
  ctx.save();ctx.translate(x,y);ctx.scale(u,u);
  for(let i=0;i<(reduced?1:2);i++)drawRainbowPuff(ctx,0,0,reduced?.35:((t*.025+i*.42)%1),{form,reduced});
  ctx.restore();
}
/** 0..1: alineación de la constelación de victoria. Ciclo 240 ticks: rampa 20, fija 60 (~1 s), rampa 20. */
export function cuernoV373StarAlign(t) {
  const k = ((Number(t) || 0) % 240 + 240) % 240, e = (x) => x * x * (3 - 2 * x);
  return k < 20 ? e(k / 20) : k < 80 ? 1 : k < 100 ? e(1 - (k - 80) / 20) : 0;
}
/** Dibuja la forma f (0..4) en coordenadas de arte (origen cascos). */
function drawForm(ctx, f, anim, t, atk = 0, R, pose = {}) {
  const face = cuernoExpression({ ...pose, t });
  if (face.reduced) t = 0;
  const P = F[f], H = CUERNO_V373_HEIGHT[f], u = H / 60, lw = Math.max(1.05, 1.25 * Math.min(1.4, u));
  const trail = anim === "trail", run = anim === "walk" || trail, air = anim === "jump", dead = anim === "death", hit = anim === "hurt", att = anim === "attack";
  const ph = face.reduced?0:run&&Number.isFinite(pose.phase)?pose.phase:t * (trail ? .45 : run ? .32 : .05);
  const legL = 22 * P.leg * u * (f === 0 ? .75 : 1), bodyRx = 17 * P.body * u, bodyRy = 10 * P.body * u;
  const bodyY = -(legL + bodyRy * .55);
  const neckX = bodyRx * .75, neckY = bodyY - bodyRy * .4;
  const headR = 9 * P.head * u, hx = neckX + headR * .55 + (att ? 3 * u : 0), hy = neckY - headR * (f === 0 ? .9 : 1.3) + (att ? 3 * u : 0);
  ctx.save();
  // muerte: se tumba de lado (patas flojas), sin salirse de su sitio
  if (dead) { ctx.translate(0, Math.min(legL * .42, -(bodyY + bodyRy) - lw * 1.5) - 4.5 * u); ctx.globalAlpha *= .85; }
  if (hit) { ctx.translate(-4 * u, 0); ctx.rotate(-.12); }
  const bob = face.reduced ? 0 : run ? -Math.abs(Math.sin(ph)) * 2.5 * u : air ? -3 * u : Math.sin(t * .06) * .6 * u;
  const lunge = att ? Math.sin(clamp(atk, 0, 1) * Math.PI) * 6 * u : 0;
  ctx.translate(lunge, bob);
  const charge=pose.cuernoK?.phase==="warn"?clamp(pose.cuernoK.progress,0,1):0;
  if(charge&&!face.reduced)ctx.scale(1+charge*.045,1-charge*.04);
  if (att) ctx.rotate(.08 * Math.sin(clamp(atk, 0, 1) * Math.PI));
  const tuck = air ? .9 : 0;
  if(f>=3)ascendantMane(ctx,P,neckX-3*u,hy+headR*.4,u,t,face.reduced||hit,dead);
  if(f===2&&!dead)auroraMantle(ctx,neckX-3*u,hy+headR*.4,bodyY,u,t,face.reduced,hit);
  // --- capa trasera: cola, ala lejana, patas lejanas
  const tailX = -bodyRx * .95, tailY = bodyY - bodyRy * .3;
  ctx.save();ctx.translate(tailX, tailY);ctx.rotate(trail ? 1.35 : run ? .65 : f>=3?.42:f===2?.12:-.25);
  for (let i = P.mane.length - 1; i >= 0; i--) {
    const k = i / P.mane.length, L = (19 + i * 1.3) * P.tail * u;
    lock(ctx, -k * 4 * u, -k * u, (4.2 - k) * u, dead ? L * .25 : L,
      (-5 + (face.reduced ? 0 : Math.sin(t * .055 + i * .35) * 1.6)) * u, P.mane[i], P.ink, lw * .65);
  }
  ctx.restore();
  const flap = dead ? -.4 : face.reduced ? 0 : pose.cuernoDreamT>0 ? .55+Math.sin(t*.08)*.12 : air ? Math.sin(t * .5) : Math.sin(t * .12) * .25;
  if (P.wings) wing(ctx, P, -bodyRx * .1, bodyY - bodyRy * .7, 26 * P.wings * u, flap + .15, true, lw);
  const sw = (k) => run ? Math.sin(ph + k) * .9 : air ? (k ? -1 : 1) * tuck * .6 : dead ? (k ? 1.4 : -1.4) : 0;
  leg(ctx, P, -bodyRx * .55, bodyY + bodyRy * .3, legL * (dead ? .42 : 1), sw(Math.PI), 4.4 * u * P.leg, true, lw);
  leg(ctx, P, bodyRx * .55, bodyY + bodyRy * .3, legL * (dead ? .42 : 1), sw(0), 4.4 * u * P.leg, true, lw);
  // Near legs are also BEHIND the barrel: their flat root caps never show.
  leg(ctx,P,-bodyRx*.45,bodyY+bodyRy*.4,legL*(dead?.42:1),sw(0),4.8*u*P.leg,false,lw);
  leg(ctx,P,bodyRx*.65,bodyY+bodyRy*.4,legL*(dead?.42:1),sw(Math.PI),4.8*u*P.leg,false,lw);
  // One continuous back, arched neck, breast and belly. No neck rectangle.
  ctx.beginPath();ctx.moveTo(-bodyRx,bodyY);
  ctx.bezierCurveTo(-bodyRx*1.12,bodyY-bodyRy*1.08,bodyRx*.12,bodyY-bodyRy*1.22,neckX-5*u,neckY);
  ctx.bezierCurveTo(neckX-6*u,hy+headR*.15,hx-headR*.47,hy-headR*.28,hx+headR*.15,hy+headR*.18);
  ctx.bezierCurveTo(hx+headR*.58,hy+headR*.92,neckX+9*u,neckY+bodyRy*.45,bodyRx*.83,bodyY+bodyRy*.60);
  ctx.bezierCurveTo(bodyRx*.26,bodyY+bodyRy*1.07,-bodyRx*.91,bodyY+bodyRy*1.10,-bodyRx,bodyY);
  ctx.closePath();ctx.fillStyle=P.coat;ctx.fill();ctx.strokeStyle=P.ink;ctx.lineWidth=lw;ctx.stroke();
  ell(ctx, -bodyRx * .2, bodyY + bodyRy * .35, bodyRx * .7, bodyRy * .4, 0, P.shade, null, 0);
  // A soft breast and flank plane keep the barrel dimensional at game scale.
  ctx.save();ctx.globalAlpha*=P.night?.42:.62;
  ell(ctx,bodyRx*.62,bodyY+bodyRy*.05,bodyRx*.23,bodyRy*.72,-.18,P.night?'#75678e':'#fffafd',null,0);
  ctx.strokeStyle=P.night?'#80739e':'#ddc8eb';ctx.lineWidth=lw*.5;
  ctx.beginPath();ctx.moveTo(-bodyRx*.54,bodyY-bodyRy*.34);ctx.quadraticCurveTo(-bodyRx*.8,bodyY+bodyRy*.3,-bodyRx*.46,bodyY+bodyRy*.61);ctx.stroke();ctx.restore();
  // brillo superior (luz de arriba) + marca de cadera (cutie mark por forma)
  ell(ctx, bodyRx * .1, bodyY - bodyRy * .55, bodyRx * .55, bodyRy * .18, -.05, P.night ? "#3c3660" : "#ffffff", null, 0);
  if (f === 0) ell(ctx, -bodyRx * .45, bodyY, 1.6 * u, 1.1 * u, .4, "#9be39a", P.ink, lw * .5);
  else if (f === 1) star(ctx, -bodyRx * .45, bodyY, 2.4 * u, "#ffc28e");
  else if (f === 2) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-bodyRx * .45, bodyY + 2 * u, (3.2 - i * .9) * u, Math.PI, TAU); ctx.strokeStyle = IRIS[i * 2]; ctx.lineWidth = .9 * u; ctx.stroke(); }
  if (trail) rainbowPuff(ctx, -bodyRx * 1.05, bodyY - bodyRy * .1, u, t, f+1, face.reduced);
  if (P.stars) for (let i = 0; i < 5; i++) star(ctx, -bodyRx * .6 + hash(i, f) * bodyRx * 1.2, bodyY - bodyRy * .5 + hash(i, f + 3) * bodyRy, 1.3 * u, P.night ? "#fff1ad" : "#aeb9fb");
  if(P.night){
    const pts=[[-.55,-.12],[-.19,-.43],[.13,-.17],[.45,-.37]];
    ctx.strokeStyle='#9c8aba';ctx.lineWidth=lw*.45;ctx.beginPath();
    pts.forEach(([a,b],i)=>i?ctx.lineTo(a*bodyRx,bodyY+b*bodyRy):ctx.moveTo(a*bodyRx,bodyY+b*bodyRy));ctx.stroke();
    pts.forEach(([a,b],i)=>star(ctx,a*bodyRx,bodyY+b*bodyRy,(i===1?1.6:1.1)*u,i===1?'#f2e4b9':'#afcfeb'));
  }
  // crin arcoíris en mechones sobre el cuello
  for (let i = P.mane.length - 1; i >= 0; i--) {
    const k = i / Math.max(1, P.mane.length - 1);
    const mx = hx - headR * .65 - k * 3 * u, my = hy - headR * .38 + k * 2 * u;
    const wave = face.reduced ? 0 : Math.sin(t * .055 + i * .4) * u + (run ? -2 * u : 0);
    lock(ctx, mx, my, (3.8 - k * .7) * u, (neckY - hy) * .95 + headR * .2 + k * (f>=3?5:3) * u,
      -(f>=3?5.5:3) * u + wave, P.mane[i], P.ink, lw * .48);
  }
  ctx.save();ctx.translate(hx, hy);ctx.rotate(face.tilt+(!face.reduced&&!dead&&!hit&&pose.cuernoBeat==='bow'?.14:0));ctx.translate(-hx, -hy);
  // Far ear stays visible behind the soft, rounded forehead.
  ell(ctx, hx + headR * .06, hy - headR * .76, headR * .16, headR * .37, .35, P.shade, P.ink, lw * .7);
  // cabeza
  ell(ctx, hx, hy, headR, headR * .86, 0, P.coat, P.ink, lw);
  ell(ctx, hx + headR * .65, hy + headR * .38, headR * .49, headR * .36, .12, P.night ? "#6b5b86" : "#f4dbea", P.ink, lw * .65);
  ell(ctx, hx + headR * .7, hy + headR * .24, headR * .23, headR * .07, .08, P.night ? "#9684b0" : "#fff3fa", null, 0);
  ell(ctx, hx + headR * .96, hy + headR * .35, .65 * u, .85 * u, -.2, P.ink, null, 0);
  // oreja
  ctx.beginPath(); ctx.moveTo(hx - headR * .36, hy - headR * .55);
  ctx.quadraticCurveTo(hx - headR * .76, hy - headR * 1.38, hx - headR * .39, hy - headR * 1.14);
  ctx.quadraticCurveTo(hx - headR * .02, hy - headR * .97, hx + headR * .02, hy - headR * .67);ctx.closePath();
  ctx.fillStyle = P.coat; ctx.fill(); ctx.lineWidth = lw * .9; ctx.strokeStyle = P.ink; ctx.stroke();
  ell(ctx, hx - headR * .25, hy - headR * .85, headR * .12, headR * .23, -.35, P.night ? "#aa89d0" : "#d6a5ec", null, 0);
  // flequillo arcoíris sobre la frente
  ctx.save();ctx.translate(hx - headR * .26, hy - headR * .7);ctx.rotate(-.65);
  for (let i = 0; i < 3; i++) lock(ctx, i * headR * .16, -i * headR * .035, headR * .19, headR * (.65 - i * .09), headR * .14, P.mane[i % P.mane.length], P.ink, lw * .5);
  ctx.restore();
  // A soft swept forelock frames the eye without covering its highlights.
  ctx.save();ctx.translate(hx - headR * .36, hy - headR * .62);ctx.rotate(-.3);
  lock(ctx, 0, 0, headR * .21, headR * .78, headR * .2, P.mane[0], P.ink, lw * .55);
  ctx.restore();
  // Ojos expresivos: derrota con párpado caído, dolor con gesto contraído.
  const ex = hx + headR * .23, ey = hy - headR * .07, er = headR * (f === 0 ? .37 : f === 1 ? .34 : .31);
  if (dead) {ctx.strokeStyle = P.night ? "#dccaf3" : P.ink;ctx.lineWidth = lw;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(ex-er*.9,ey);ctx.quadraticCurveTo(ex,ey+er*.55,ex+er*.9,ey);ctx.stroke();
    ctx.beginPath();ctx.moveTo(ex+er*.65,ey+er*.13);ctx.lineTo(ex+er*.86,ey+er*.38);ctx.stroke();}
  else if (hit) { ctx.strokeStyle = P.night ? "#fff" : P.ink; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(ex - er, ey - er * .5); ctx.lineTo(ex + er * .6, ey); ctx.lineTo(ex - er, ey + er * .5); ctx.stroke(); }
  else if (face.blink > .72 || face.happy) {
    ctx.strokeStyle = P.night ? "#eddaff" : P.ink;ctx.lineWidth = lw;ctx.lineCap = "round";
    ctx.beginPath();ctx.moveTo(ex - er * .9, ey + er * .2);
    ctx.quadraticCurveTo(ex, ey + er * (face.happy ? -.7 : .7), ex + er * .9, ey + er * .2);ctx.stroke();
  } else {
    const ry = er * (1.2 - face.blink * .85);
    ell(ctx, ex, ey, er * 1.12, ry * 1.08, 0, "#fff8ff", P.ink, lw * .55);
    ell(ctx, ex + er * .12, ey + er * .08, er * .87, ry * .92, 0, P.night ? "#baa4ee" : "#9470bb", null, 0);
    ell(ctx,ex+er*.12,ey+ry*.38,er*.63,ry*.35,0,P.night?'#99d9e5':'#d4b5ed',null,0);
    ell(ctx, ex + er * .15, ey - er * .05, er * (face.wonder ? .58 : .51), ry * .8, 0, "#302340", null, 0);
    ell(ctx, ex - er * .27, ey - ry * .42, er * .31, er * .33, 0, "#ffffff", null, 0);
    ell(ctx, ex + er * .39, ey + ry * .42, er * .14, er * .15, 0, "#ffffff", null, 0);
    ctx.strokeStyle = P.night ? "#dccaf4" : P.ink;ctx.lineWidth = lw * .7;
    ctx.beginPath();ctx.moveTo(ex - er * .95, ey - ry * .6);ctx.quadraticCurveTo(ex - er * .25, ey - ry * 1.28, ex + er * .55, ey - ry * .84);ctx.stroke();
    ctx.beginPath();ctx.moveTo(ex-er*.82,ey-ry*.73);ctx.lineTo(ex-er*1.02,ey-ry*.94);ctx.stroke();
  }
  if (!dead && !hit) {ctx.strokeStyle = P.night ? "#bba8d8" : P.ink;ctx.lineWidth = lw * .55;ctx.lineCap = "round";
    ctx.beginPath();ctx.moveTo(ex-er*.7,ey-er*1.58);ctx.quadraticCurveTo(ex,ey-er*(face.wonder?1.98:1.74),ex+er*.5,ey-er*1.5);ctx.stroke();}
  ell(ctx, hx - headR * .1, hy + headR * .43, headR * (face.shy ? .26 : .22), headR * .13, -.1, P.night ? "#ac6f9c" : "#f5afce", null, 0);
  ell(ctx, hx - headR * .16, hy + headR * .4, headR * .08, headR * .035, -.1, P.night ? "#d8a0c2" : "#ffe1ef", null, 0);
  // Small upturned smile remains readable beneath the muzzle.
  if (!dead && !hit) {
    ctx.strokeStyle = P.ink; ctx.lineWidth = lw * .65; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(hx + headR * .5, hy + headR * .53);
    ctx.quadraticCurveTo(hx + headR * .72, hy + headR * .7, hx + headR * .91, hy + headR * .51); ctx.stroke();
  }
  // cuerno en espiral (embiste al atacar)
  const hl = 11 * P.horn * u * (f === 0 ? .6 : 1), ha = -1.05 + (att ? .45 * Math.sin(clamp(atk, 0, 1) * Math.PI) : 0);
  const bx = hx + headR * .15, by = hy - headR * .78, tx = bx + Math.cos(ha) * hl, ty = by + Math.sin(ha) * hl, nx = -Math.sin(ha) * 2.4 * u * P.horn, ny = Math.cos(ha) * 2.4 * u * P.horn;
  ctx.beginPath(); ctx.moveTo(bx - nx, by - ny); ctx.lineTo(tx, ty); ctx.lineTo(bx + nx, by + ny); ctx.closePath();
  ctx.fillStyle = f===2?"#b0e4e4":P.night ? "#fff1ad" : "#ffe9a3"; ctx.fill(); ctx.lineWidth = lw * .8; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(tx,ty);ctx.lineTo(bx+nx*.72,by+ny*.72);ctx.closePath();ctx.fillStyle=f===2?'#f0e1ff':P.night?'#c9c1ed':'#fff9de';ctx.fill();
  ctx.strokeStyle = P.night ? "#e5b9f4" : "#ff8cab"; ctx.lineWidth = lw * .6;
  for (let i = 1; i < 4; i++) { const k = i / 4; ctx.beginPath(); ctx.moveTo(bx - nx * (1 - k) + (tx - bx) * k, by - ny * (1 - k) + (ty - by) * k); ctx.lineTo(bx + nx * (1 - k) + (tx - bx) * (k + .08), by + ny * (1 - k) + (ty - by) * (k + .08)); ctx.stroke(); }
  if (att && atk > .25 && atk < .75) { ctx.strokeStyle = "#fff6c8"; ctx.lineWidth = lw; for (let i = 0; i < 3; i++) { const a = ha + (i - 1) * .4; ctx.beginPath(); ctx.moveTo(tx + Math.cos(a) * 3 * u, ty + Math.sin(a) * 3 * u); ctx.lineTo(tx + Math.cos(a) * 8 * u, ty + Math.sin(a) * 8 * u); ctx.stroke(); } }
  if(f===4&&!dead){
    // Crescent antlers frame the single central horn without hiding the eye.
    for(const side of [-1,1]){
      ctx.save();ctx.translate(bx-5*u+side*3*u,by+2*u);ctx.scale(side,1);
      ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-10*u,-8*u,-9*u,-20*u,-2*u,-24*u);
      ctx.bezierCurveTo(-5*u,-15*u,-2*u,-7*u,4*u,-2*u);ctx.closePath();
      ctx.fillStyle='#b7ddea';ctx.fill();ctx.strokeStyle='#656f9f';ctx.lineWidth=lw*.65;ctx.stroke();ctx.restore();
    }
  }
  if(f>=3){
    ctx.strokeStyle=P.night?'#c3b1e2':'#bcb4dd';ctx.lineWidth=lw*.55;
    ctx.beginPath();ctx.moveTo(hx-headR*.47,hy-headR*.43);ctx.quadraticCurveTo(hx,hy-headR*.69,hx+headR*.53,hy-headR*.42);ctx.stroke();
    star(ctx,hx+headR*.13,hy-headR*.54,u*(f===4?1.65:1.25),P.night?'#c3eeee':'#fff8e5');
  }
  if(f===2){
    const cy=by-hl*.32;
    ctx.save();ctx.translate(bx,cy);ctx.rotate(-.23);
    ctx.strokeStyle='#a68de0';ctx.lineWidth=lw*.7;ctx.beginPath();ctx.ellipse(0,0,hl*.52,hl*.18,0,0,TAU);ctx.stroke();
    for(let i=0;i<3;i++){
      const px=(i-1)*hl*.42,py=-hl*(.19+(i===1?.25:0));
      ctx.beginPath();ctx.moveTo(px,py-hl*.18);ctx.lineTo(px+hl*.1,py);ctx.lineTo(px,py+hl*.13);ctx.lineTo(px-hl*.1,py);ctx.closePath();ctx.fillStyle=['#9be9ed','#f5d3ed','#c2adff'][i];ctx.fill();ctx.strokeStyle=P.ink;ctx.lineWidth=lw*.5;ctx.stroke();
    }ctx.restore();
  }
  // brote de semilla (forma 1)
  if (P.sprout) { ctx.strokeStyle = "#4f7a4a"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty - 3 * u); ctx.stroke(); for (const s of [-1, 1]) ell(ctx, tx + s * 2.2 * u, ty - 3.6 * u, 2.4 * u, 1.2 * u, s * -.5, "#9be39a", "#4f7a4a", 1); }
  ctx.restore();
  if(f>=2){
    ctx.strokeStyle=P.night?'#b0a0d4':'#baa0d6';ctx.lineWidth=lw*.7;
    ctx.beginPath();ctx.moveTo(neckX-u*3,neckY-u*7);ctx.quadraticCurveTo(neckX+u*2,neckY+u*7,neckX+u*8,neckY+u*5);ctx.stroke();
    const gx=neckX+u*5,gy=neckY+u*7;
    ctx.beginPath();ctx.moveTo(gx,gy-u*3.5);ctx.lineTo(gx+u*2.5,gy);ctx.lineTo(gx,gy+u*4);ctx.lineTo(gx-u*2.5,gy);ctx.closePath();ctx.fillStyle=f===4?'#b4edf0':f===3?'#e2caff':'#c5eae8';ctx.fill();ctx.strokeStyle=P.ink;ctx.lineWidth=lw*.5;ctx.stroke();
    ctx.fillStyle='#fff7ff';ctx.beginPath();ctx.moveTo(gx,gy-u*2.5);ctx.lineTo(gx+u*1.5,gy);ctx.lineTo(gx,gy+u);ctx.closePath();ctx.fill();
  }
  // ala cercana
  if (P.wings) wing(ctx, P, bodyRx * .05, bodyY - bodyRy * .75, 30 * P.wings * u, flap, false, lw);
  // media luna + estrellas orbitando (forma 5)
  if (P.night) {
    const mx = hx - headR * 1.6, my = hy - headR * 1.4;
    ctx.fillStyle = "#fff1ad";ctx.beginPath();ctx.arc(mx,my,4*u,-Math.PI/2,Math.PI/2,true);
    ctx.quadraticCurveTo(mx-2.8*u,my,mx,my-4*u);ctx.closePath();ctx.fill();
    // Sorpresa (victoria): las 3 estrellas se alinean ~1 s en una constelación con forma de cuerno.
    const al = anim === "victory" ? cuernoV373StarAlign(t) : 0, pts = [];
    for (let i = 0; i < 3; i++) {
      const a = t * .03 + i * TAU / 3, ox = Math.cos(a) * bodyRx * 1.3, oy = bodyY + Math.sin(a) * bodyRy * .8;
      const cs = 1.6, cx = bx + ((i - .2) * 5 * u + i * i * 1.5 * u) * cs, cy = by - 10 * u - i * 7 * u * cs; // constelación ×1.6 // espiral ascendente sobre el cuerno
      pts.push([ox + (cx - ox) * al, oy + (cy - oy) * al]);
    }
    if (al > .05) { ctx.globalAlpha *= al; ctx.strokeStyle = "#fff1ad"; ctx.lineWidth = .7 * u * 1.6; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[0][0] + 9.6 * u, pts[0][1]); ctx.closePath(); ctx.stroke(); ctx.globalAlpha /= al; }
    pts.forEach((q, i) => star(ctx, q[0], q[1], (1.8 + al * (1.8 * 1.6 - 1.8 + .8 * 1.6)) * u, IRIS[(i * 2) % 7]));
  }
  ctx.restore();
  void R;
}

export function draw(ctx, pose, R) {
  const f = Math.max(0, Math.min(4, (pose?.form | 0)));
  drawForm(ctx, f, animOf(pose), Number(pose?.t) || 0, Number(pose?.atk) || 0, R, pose);
}

/** API directa: form 1..5, anim ∈ CUERNO_V373_ANIMS (+ "hurt"/"victory"). */
export function drawCuernoV373(ctx, x, y, { form = 1, anim = "idle", t = 0, facing = 1, scale = 1, atk = .5, blink = 0, cuernoBeat = "", reduceMotion = false } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale((facing < 0 ? -1 : 1) * scale, scale);
  drawForm(ctx, clamp((form | 0) - 1, 0, 4), anim === "trail" || anim === "attack" || anim === "death" || anim === "jump" || anim === "walk" || anim === "hurt" || anim === "victory" ? anim : "idle", Number(t) || 0, atk, undefined,
    {state: anim === "death" ? "dead" : anim === "walk" ? "run" : anim, blink, cuernoBeat, reduceMotion});
  ctx.restore();
}
/** Punto (mundo) donde nace la estela arcoíris de Kilo/Chispín: tras la grupa. */
export function cuernoTrailOrigin(x, y, { form = 1, facing = 1, scale = 1 } = {}) {
  const f = clamp((form | 0) - 1, 0, 4), P = F[f], u = CUERNO_V373_HEIGHT[f] / 60;
  const legL = 22 * P.leg * u * (f === 0 ? .75 : 1), ry = 10 * P.body * u;
  return { x: x - (facing < 0 ? -1 : 1) * 17 * P.body * u * 1.05 * scale, y: y + (-(legL + ry * .55) - ry * .1) * scale };
}
/** Optical tip of the actual spiral horn, using the same authored anatomy. */
export function cuernoHornOrigin(x,y,{form=1,facing=1,scale=1}={}) {
  const f=clamp((form|0)-1,0,4),P=F[f],u=CUERNO_V373_HEIGHT[f]/60;
  const legL=22*P.leg*u*(f===0?.75:1),rx=17*P.body*u,ry=10*P.body*u,bodyY=-(legL+ry*.55);
  const head=9*P.head*u,hx=rx*.75+head*.55,hy=bodyY-ry*.4-head*(f===0?.9:1.3);
  const hl=11*P.horn*u*(f===0?.6:1);
  return {x:x+(facing<0?-1:1)*(hx+head*.15+Math.cos(-1.05)*hl)*scale,y:y+(hy-head*.78+Math.sin(-1.05)*hl)*scale};
}
export default { id: "cuerno", draw };
