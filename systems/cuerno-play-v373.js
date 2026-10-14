// V373 · Cuerno: 3 emotes nuevos + dúo arcoíris en tándem con su compañero de U (Kilo).
// Teclas: 1 = caricia (corazones), 2 = tumbarse a soñar (estrellas + zzz), 3 = relincho (notas ♪).
// Dúo: se lanza desde la U de Cuerno con startCuernoDuo(game) (no escucha la tecla U para no duplicar la U).
// Solo visual: no hace daño, no cambia HP ni velocidad del jugador, sin red, sin gradientes, sin azar por frame.
import { emitCuernoFx } from "./cuerno-fx.js";
import {chooseUPartner} from "./u-partners.js";
import {drawCuernoDream} from "../characters/cuerno-stagecraft.js";
const TAU = Math.PI * 2;
export const CUERNO_PLAY_KEYS = Object.freeze({ nuzzle: "1", dream: "2", neigh: "3" });
export const CUERNO_DUO_PARTNER = "kilo"; // = DEFAULT_U_PARTNERS.cuerno en u-partners.js
export const CUERNO_PLAY_DUR = Object.freeze({ nuzzle: 72, dream: 150, neigh: 70, duoWind: 24, duo: 96 });
const RAINBOW = ["#ff6b8a", "#ffb04a", "#ffe45a", "#6ee07a", "#5ac8ff", "#a88cff"];
const st = { act: null, t: 0, cd: 0, duoCd: 0, duo: null, queued: null, seed: 0, sky: null, skyCd: 0 };
export const CUERNO_SKY = Object.freeze({ dur: 180, cd: 600, range: 240 });
let gameRef = null;

export function queueCuernoPlay(kind) { if (CUERNO_PLAY_KEYS[kind]) st.queued = kind; }
export function resetCuernoPlay() { Object.assign(st, { act: null, t: 0, cd: 0, duoCd: 0, duo: null, queued: null, sky: null, skyCd: 0 }); }
export function readCuernoPlay() { return { act: st.act, t: st.t, duo: st.duo ? { phase: st.duo.phase, age: st.duo.age } : null, sky: st.sky ? { t: st.sky.t } : null, skyCd: st.skyCd }; }
// Compañeros cercanos para "Cuerno pinta el cielo": el compañero del dúo (si está activo) y,
// si existe, el jugador remoto del cooperativo en game.coopRemote ({x,y,w,h}).
function skyCompanion(game, p) {
  const out = [];
  if (st.duo) { const lag = st.duo.phase === "wind" ? 45 : 26; out.push({ x: p.x - st.duo.face * lag + p.w / 2, y: p.y }); }
  const r = game.coopRemote;
  if (r && Number.isFinite(r.x) && Number.isFinite(r.y) && !r.dead) out.push({ x: r.x + (r.w || 32) / 2, y: r.y });
  return out.find((o) => Math.abs(o.x - (p.x + p.w / 2)) <= CUERNO_SKY.range && Math.abs(o.y - p.y) <= 160) || null;
}
const formOf = (p) => Math.max(1, Math.min(5, ((p?.evo | 0) + 1)));
const cx = (p) => p.x + p.w / 2;

export function startCuernoDuo(game) {
  const p = game?.player;
  if (!p || p.id !== "cuerno" || p.dead || st.duoCd > 0 || st.duo) return false;
  st.duo = { phase: "wind", age: 0, face: p.facing === -1 ? -1 : 1, form: formOf(p), partner:chooseUPartner(p.id,p.uPartner), trail: [] };
  st.duoCd = 180;
  game.nums?.add?.(cx(p), p.y - 36, "¡ARCOÍRIS EN TÁNDEM!", "#ffe45a", true);
  return true;
}

export function updateCuernoPlay(game, t = 0) {
  if (game) gameRef = game;
  const p = game?.player;
  if (!p || p.id !== "cuerno" || p.dead) { st.act = null; st.duo = null; st.queued = null; return; }
  if (game.paused) { st.queued = null; return; }
  if (st.cd > 0) st.cd--;
  if (st.skyCd > 0) st.skyCd--;
  if (st.duoCd > 0) st.duoCd--;
  const fx = game.cuernoFx, form = formOf(p);
  if (st.queued) {
    const q = st.queued; st.queued = null;
    if (!st.cd && !st.act) {
      st.act = q; st.t = CUERNO_PLAY_DUR[q]; st.cd = 30;
      // Emotes remain visual: never change movement or collision.
      const label = { nuzzle: "¡Mimos!", dream: "zzz…", neigh: "¡Hiiiiiii!" }[q];
      game.nums?.add?.(cx(p), p.y - 30, label, "#ffd6f0", true);
    }
  }
  if (st.act) {
    const age = CUERNO_PLAY_DUR[st.act] - st.t;
    if (fx) {
      if (st.act === "neigh" && age % 10 === 0) emitCuernoFx(fx, "note", cx(p) + (p.facing || 1) * 14, p.y + 4, { form });
      if (st.act === "dream" && age % 18 === 0) emitCuernoFx(fx, "star", cx(p), p.y - 10, { form, count: 1, speed: 0.4 });
      if (st.act === "nuzzle" && age === 20) emitCuernoFx(fx, "spark", cx(p), p.y + 8, { form });
    }
    // moverse cancela el sueño
    if (st.act === "dream" && Math.abs(p.vx || 0) > 0.6) st.t = Math.min(st.t, 10);
    if (--st.t <= 0) st.act = null;
  }
  // Cuerno pinta el cielo: soñar cerca de un compañero → arcoíris de pantalla 3 s (con cooldown de 10 s).
  if (st.sky) { const o = skyCompanion(game, p); if (o) st.sky.o = o; if (--st.sky.t <= 0) st.sky = null; }
  else if (st.act === "dream" && !st.skyCd) {
    const o = skyCompanion(game, p);
    if (o) { st.sky = { t: CUERNO_SKY.dur, o }; st.skyCd = CUERNO_SKY.cd; game.nums?.add?.(cx(p), p.y - 50, "¡Dulces sueños!", "#ffd6f0", true);
      if (fx) { emitCuernoFx(fx, "star", cx(p), p.y - 20, { form, count: 4, speed: 0.6 }); emitCuernoFx(fx, "star", o.x, o.y - 20, { form, count: 4, speed: 0.6 }); } }
  }
  const d = st.duo;
  if (d) {
    d.age++;
    if (d.phase === "wind" && d.age >= CUERNO_PLAY_DUR.duoWind) { d.phase = "run"; d.age = 0; d.x0 = cx(p); }
    if (d.phase === "run") {
      d.trail.push({ x: cx(p) - d.face * 10, y: p.y + p.h * 0.55 });
      if (d.trail.length > 24) d.trail.shift();
      if (fx && d.age % 6 === 0) emitCuernoFx(fx, "star", cx(p), p.y, { form, count: 1, speed: 0.8 });
      if (d.age >= CUERNO_PLAY_DUR.duo) st.duo = null;
    }
  }
}

function label(ctx, txt, x, y, fill, size = 14) {
  ctx.font = `900 ${size}px system-ui,sans-serif`; ctx.textAlign = "center"; ctx.lineJoin = "round";
  ctx.lineWidth = 4; ctx.strokeStyle = "#3a1a4a"; ctx.strokeText(txt, x, y); ctx.fillStyle = fill; ctx.fillText(txt, x, y);
}
function heart(ctx, x, y, s, c) {
  ctx.fillStyle = c; ctx.strokeStyle = "#6a2050"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x, y + s * 0.8); ctx.bezierCurveTo(x - s * 1.3, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.3, y - s * 0.1, x, y + s * 0.8); ctx.fill(); ctx.stroke();
}

// drawActor/roster = drawCharacter/ROSTER (igual que drawMichiDuet), para pintar al compañero.
export function drawCuernoPlay(ctx, game, t, drawActor, roster) {
  const p = game?.player;
  if (!p || p.id !== "cuerno" || p.dead) return;
  const cam = game.cam || { x: 0, y: 0 }, x = cx(p) - cam.x, top = p.y - cam.y, feet = p.y + p.h - cam.y;
  ctx.save(); ctx.lineCap = "round";
  if (st.act) {
    const max = CUERNO_PLAY_DUR[st.act], age = max - st.t, fade = Math.min(1, st.t / 12, age / 6);
    ctx.globalAlpha = fade;
    if (st.act === "nuzzle") {
      for (let i = 0; i < 5; i++) { const ph = ((age + i * 13) % 60) / 60; ctx.globalAlpha = fade * (1 - ph); heart(ctx, x + Math.sin(ph * 6 + i) * 14 + (i - 2) * 8, top - 4 - ph * 50, 7 + (i % 2) * 3, i % 2 ? "#ff8ad4" : "#ff5c8a"); }
      ctx.globalAlpha = fade; label(ctx, "¡Mimos!", x, top - 54, "#ffd6f0");
    } else if (st.act === "dream") {
      // nube de sueño con luna + zzz
      ctx.fillStyle = "#f4ecff"; ctx.strokeStyle = "#7a5ab0"; ctx.lineWidth = 2;
      ctx.beginPath(); for (const [ox, oy, r] of [[-12, 0, 10], [0, -5, 13], [13, 0, 10]]) { ctx.moveTo(x + 30 + ox + r, top - 44 + oy); ctx.arc(x + 30 + ox, top - 44 + oy, r, 0, TAU); } ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ffe45a"; ctx.beginPath(); ctx.arc(x + 30, top - 46, 6, 0, TAU); ctx.fill(); ctx.fillStyle = "#f4ecff"; ctx.beginPath(); ctx.arc(x + 33, top - 48, 5, 0, TAU); ctx.fill();
      for (let i = 0; i < 3; i++) { const ph = ((age + i * 20) % 60) / 60; ctx.globalAlpha = fade * (1 - ph); label(ctx, "z", x - 8 - ph * 10 - i * 4, top - 8 - ph * 30, "#c9b4ff", 12 + i * 3); }
      ctx.globalAlpha = fade * 0.5; ctx.fillStyle = "#3a2a5a"; ctx.beginPath(); ctx.ellipse(x, feet, 26, 5, 0, 0, TAU); ctx.fill();
    } else {
      for (let i = 0; i < 3; i++) { const r = 14 + ((age * 1.4 + i * 14) % 42); ctx.globalAlpha = fade * (1 - r / 56); ctx.strokeStyle = RAINBOW[i * 2]; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + (p.facing || 1) * 12, top + 10, r, -0.9, 0.9); ctx.stroke(); }
      ctx.globalAlpha = fade; label(ctx, "¡Hiiiiiii!", x, top - 30 - Math.abs(Math.sin(age * 0.3)) * 4, "#ffe45a");
    }
    ctx.globalAlpha = 1;
  }
  if (st.sky) {
    // Arco de 6 bandas que cruza la pantalla (coordenadas de pantalla: el resto ya resta la cámara).
    const W = ctx.canvas?.clientWidth || ctx.canvas?.width || 960, H = ctx.canvas?.clientHeight || ctx.canvas?.height || 540;
    const k = st.sky.t / CUERNO_SKY.dur, a = Math.min(1, (1 - k) * 6, k * 5);
    const grow = Math.min(1, (1 - k) * 3), R = W * 0.46, ccx = W / 2, ccy = H * 0.72;
    ctx.globalAlpha = 0.8 * a;
    for (let b = 0; b < 6; b++) { ctx.strokeStyle = RAINBOW[b]; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(ccx, ccy, R - b * 10, Math.PI, Math.PI + Math.PI * grow); ctx.stroke(); }
    ctx.globalAlpha = a;
    const o = st.sky.o, ox = o.x - cam.x, oy = o.y - cam.y;
    label(ctx, "¡Dulces sueños!", x, top - 70, "#ffd6f0", 15);
    label(ctx, "¡Dulces sueños!", ox, oy - 40, "#ffd6f0", 15);
    for (const [hx, hy] of [[x, top - 90], [ox, oy - 60]]) heart(ctx, hx, hy - Math.abs(Math.sin(t * 0.15)) * 4, 6, "#ff8ad4");
    ctx.globalAlpha = 1;
  }
  const d = st.duo;
  if (d) {
    if (d.phase === "wind") {
      drawCuernoDream(ctx,x,feet-30,70+d.form*7,d.age/CUERNO_PLAY_DUR.duoWind*.5,{form:d.form,reduced:!!game.reduceMotion});
      // Telegraph: anillo arcoíris que se cierra + flecha de dirección + compañero llegando.
      const k = d.age / CUERNO_PLAY_DUR.duoWind;
      for (let i = 0; i < 6; i++) { ctx.strokeStyle = RAINBOW[i]; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, feet - 14, (70 - 40 * k) + i * 4, (24 - 12 * k) + i * 1.5, 0, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = "#ffe45a"; ctx.strokeStyle = "#3a1a4a"; ctx.lineWidth = 2;
      const ax = x + d.face * (30 + k * 20); ctx.beginPath(); ctx.moveTo(ax, feet - 34); ctx.lineTo(ax + d.face * 16, feet - 26); ctx.lineTo(ax, feet - 18); ctx.closePath(); ctx.fill(); ctx.stroke();
      label(ctx, "¡PREPARADOS!", x, top - 40, "#fff4b0", 13);
    } else {
      // Cinta arcoíris (6 bandas) siguiendo el rastro.
      const tr = d.trail;
      if (tr.length > 1) for (let b = 0; b < 6; b++) { ctx.strokeStyle = RAINBOW[b]; ctx.lineWidth = 4; ctx.globalAlpha = 0.9; ctx.beginPath(); tr.forEach((q, i) => { const px = q.x - cam.x, py = q.y - cam.y + (b - 2.5) * 4 + Math.sin(i * 0.5 + t * 0.2) * 2; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    // Compañero (Kilo) galopando/corriendo al lado, un poco detrás.
    const partner=d.partner||CUERNO_DUO_PARTNER;
    const def = roster?.find?.((r) => r.id === partner), form = def?.forms?.[Math.min(4,p.evo||0)]||def?.forms?.[0];
    if (drawActor && def && form && !game._familyDuet) {
      const lag = d.phase === "wind" ? 60 - 30 * (d.age / CUERNO_PLAY_DUR.duoWind) : 26;
      const bob = d.phase === "run" ? -Math.abs(Math.sin(t * 0.35)) * 6 : 0;
      try { drawActor(ctx, { ...def, ...form, id: partner, evo:Math.min(4,p.evo||0), x: p.x - d.face * lag + (p.w - form.w) / 2, y: p.y + p.h - form.h + bob, facing: d.face, vx: d.phase === "run" ? d.face * 6 : 0, vy: 0, grounded: true, visualScale: 0.9, _duetActor: true }, cam, t); } catch { /* el dúo sigue sin compañero */ }
    }
    if (d.phase === "run" && d.age < 40) label(ctx, "¡A GALOPE!", x, top - 34, "#ffe45a", 15);
  }
  ctx.restore();
}
