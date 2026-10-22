// V373 · Cinemática de evolución de Cuerno (sueño arcoíris).
// t en SEGUNDOS (0..EVO_CINE_DURATION), formas 1-based (como evo-cine/chispin.js).
// Fases: sueño (0–1,5 s: estrellas de sueño, notas dibujadas, cuerno cargando) ·
// estampida (1,5–2,6 s: onda de cascos y cuerno, flash de luz, flores brotando) ·
// presentación (2,6–4,0 s: nueva forma, nombre, pétalos). Sin gradientes, determinista.
import cuernoArt, { CUERNO_V373_HEIGHT } from "../../characters/art/cuerno-v373.js";
import { drawCuernoDream, drawRainbowPuff } from "../../characters/cuerno-stagecraft.js";
import { R } from "../../characters/rig.js";
import { flatCtx, hash01 } from "./stitcho.js";

export const EVO_CINE_DURATION = 4.5;
export const EVO_CINE_UNITS = "seconds";
export const FORM_NAMES = Object.freeze(["Cuernín · Semilla", "Destello · Naciente", "Kirín Aurora", "Serafín Aurora", "Cuerno Eclipse"]);
export const EVO_CINE_PHASES = Object.freeze({ dream: [0, 1.5], stampede: [1.5, 2.6], present: [2.6, 4.5] });
const TAU = Math.PI * 2, NIGHT = "#1a1430", INK = "#3a2050";
const IRIS = ["#ff8cab", "#ffc28e", "#ffe9a3", "#9de7bb", "#a5e5fa", "#aeb9fb", "#e5b9f4"];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = (k) => 1 - (1 - k) ** 3;
export function evoCinePhase(t) { return t < 1.5 ? "sueno" : t < 2.6 ? "estampida" : "presentacion"; }

function pose(form, t, extra = {}) {
  return { form, state: "idle", t: t * 60, phase: t * 9, breath: Math.sin(t * 3) * .5, blink: 0, look: { x: .2, y: 0 }, sway: 0, bounce: 0,
    atk: 0, flourish: 0, flourishN: 0, cast: 0, castSlot: 0, speed: 0, air: false, reduceMotion: false, ...extra };
}
function drawCuerno(ctx, form, x, y, s, t, extra) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  try { cuernoArt.draw(flatCtx(ctx), pose(form, t, extra), R); } catch { ctx.fillStyle = "#f2c1ff"; ctx.beginPath(); ctx.ellipse(0, -40, 30, 34, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function star(ctx, x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function note(ctx, x, y, s, col) {
  ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(x, y, 4 * s, 3 * s, -.4, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 3.5 * s, y - 1); ctx.lineTo(x + 3.5 * s, y - 14 * s); ctx.quadraticCurveTo(x + 9 * s, y - 12 * s, x + 9 * s, y - 6 * s); ctx.stroke();
}
function flower(ctx, x, y, r, k, i) {
  const n = 6;
  for (let j = 0; j < n; j++) { const a = j * TAU / n + i; ctx.fillStyle = IRIS[(i + j) % 7]; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r * k, y + Math.sin(a) * r * k * .6, r * .55 * k, r * .3 * k, a, 0, TAU); ctx.fill(); }
  ctx.fillStyle = "#fff6c8"; ctx.beginPath(); ctx.arc(x, y, r * .3 * k, 0, TAU); ctx.fill();
}

export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm = 2) {
  t = clamp(Number(t) || 0, 0, EVO_CINE_DURATION);
  const from = clamp((fromForm | 0) - 1, 0, 4), to = clamp((toForm | 0) - 1, 0, 4);
  const cx = w / 2, foot = h * .78, s = h * .4 / CUERNO_V373_HEIGHT[to], U = h;
  const kD = seg(t, 0, 1.5), kS = seg(t, 1.5, 2.6), kP = seg(t, 2.6, 4.5), phase = evoCinePhase(t);
  ctx.save();
  ctx.fillStyle = NIGHT; ctx.fillRect(0, 0, w, h);
  // cielo de sueño: estrellas que titilan (deterministas)
  for (let i = 0; i < 40; i++) { const tw = .4 + .6 * Math.abs(Math.sin(t * 2 + i * 1.7)); ctx.globalAlpha = tw; star(ctx, hash01(i, 1) * w, hash01(i, 2) * h * .7, 1.5 + hash01(i, 3) * 2.5, i % 5 ? "#fff6c8" : IRIS[i % 7]); }
  ctx.globalAlpha = 1;
  // arcoíris de fondo que crece con el sueño
  ctx.lineWidth = U * .022;
  for (let i = 0; i < 7; i++) { ctx.strokeStyle = IRIS[i]; ctx.globalAlpha = .25 + .35 * (phase === "sueno" ? kD : 1); ctx.beginPath(); ctx.arc(cx, foot, U * (.62 - i * .028), Math.PI, Math.PI + Math.PI * Math.min(1, kD * 1.2 + kS)); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // suelo
  ctx.fillStyle = "#2a2048"; ctx.fillRect(0, foot, w, h - foot);
  drawCuernoDream(ctx,cx,foot-h*.17,h*.31,Math.min(.8,t/5),{form:to+1});
  if (phase === "sueno") {
    drawCuerno(ctx, from, cx, foot, s, t, { state: kD > .5 ? "cast" : "idle", castSlot: 2, cast: kD,cuernoBeat:"curious" });
    // notas que suben y estrellas de sueño que convergen en el cuerno
    for (let i = 0; i < 8; i++) { const u = (hash01(i, 4) + t * .4) % 1; ctx.globalAlpha = Math.sin(u * Math.PI); note(ctx, cx + (hash01(i, 5) - .5) * w * .7, foot - u * h * .6, 1 + hash01(i, 6), IRIS[i % 7]); }
    for (let i = 0; i < 10; i++) { const a = hash01(i, 7) * TAU + t, r = U * .5 * (1 - kD) + U * .05; ctx.globalAlpha = kD; star(ctx, cx + Math.cos(a) * r, foot - U * .45 + Math.sin(a) * r * .5, 3, "#fff6c8"); }
    ctx.globalAlpha = 1;
  } else if (phase === "estampida") {
    // forma vieja → nueva con destello; onda expansiva de cascos y flores brotando
    const morph = seg(kS,.32,.65);
    if(morph<1){ctx.save();ctx.globalAlpha=1-morph;drawCuerno(ctx,from,cx,foot,s,t,{state:"run",speed:1});ctx.restore();}
    if(morph>0){ctx.save();ctx.globalAlpha=morph;drawCuerno(ctx,to,cx,foot,s*(1+Math.sin(kS*Math.PI)*.04),t,{state:"run",speed:1});ctx.restore();}
    drawRainbowPuff(ctx,cx-h*.09,foot-h*.07,Math.min(.95,.1+kS*.85),{form:to+1});
    for (let i = 0; i < 3; i++) {
      const k = clamp(kS * 1.4 - i * .2); if (k <= 0) continue;
      ctx.globalAlpha = 1 - k; ctx.strokeStyle = IRIS[i * 2]; ctx.lineWidth = U * .02 * (1 - k) + 2;
      ctx.beginPath(); ctx.ellipse(cx, foot, U * .9 * k, U * .12 * k, 0, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 12; i++) { const k = easeOut(clamp(kS * 1.6 - hash01(i, 8) * .6)); if (k > 0) flower(ctx, cx + (hash01(i, 9) - .5) * w * .9, foot + 6 + hash01(i, 10) * (h - foot - 10), U * .03, k, i); }
    // huellas de casco (herradura) que estampan
    ctx.strokeStyle = "#fff1ad"; ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) { if (kS < i / 6) continue; const x = cx + (i - 2.5) * U * .14; ctx.beginPath(); ctx.arc(x, foot + 10, U * .025, Math.PI * .15, Math.PI * .85, true); ctx.stroke(); }
    const flash = Math.max(0, 1 - Math.abs(t - 2.05) / .2);
    if (flash > 0) { ctx.globalAlpha = flash * (to===4?.1:.2); ctx.fillStyle = "#f2dcff"; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
  } else {
    const hop = Math.abs(Math.sin(kP * Math.PI * 2)) * (1 - kP) * U * .06;
    for (let i = 0; i < 12; i++) flower(ctx, cx + (hash01(i, 9) - .5) * w * .9, foot + 6 + hash01(i, 10) * (h - foot - 10), U * .03, 1, i);
    drawCuerno(ctx, to, cx, foot - hop, s * 1.05, t, { state: kP < .6 ? "victory" : "idle" });
    for (let i = 0; i < 14; i++) { const u = (hash01(i, 11) + t * .25) % 1; ctx.globalAlpha = (1 - u) * (1 - kP * .4); ctx.fillStyle = IRIS[i % 7]; ctx.beginPath(); ctx.ellipse(hash01(i, 12) * w, u * h * .8, 4, 2.4, u * 6, 0, TAU); ctx.fill(); }
    const a = easeOut(seg(t, 2.7, 3.1)); ctx.globalAlpha = a; ctx.textAlign = "center"; ctx.lineJoin = "round";
    ctx.font = `900 ${Math.round(h * .07)}px Outfit, system-ui, sans-serif`;
    const ty = h * .14 + (1 - a) * 20, name = FORM_NAMES[to];
    ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeText(name, cx, ty); ctx.fillStyle = "#fff6c8"; ctx.fillText(name, cx, ty);
    ctx.font = `700 ${Math.round(h * .035)}px Outfit, system-ui, sans-serif`; ctx.fillStyle = "#e4d8ff";
    const stories=["Un brote aprende a brillar","La crin descubre el arcoíris","Alas para abrazar las nubes","La noche también sueña en colores"];
    ctx.fillText(stories[Math.max(0,to-1)], cx, ty + h * .06);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
export default { drawEvoCine, EVO_CINE_DURATION, EVO_CINE_UNITS, FORM_NAMES, evoCinePhase };
