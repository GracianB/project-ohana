// V373 · Efectos de Cuerno: estela arcoíris, estrellas, notas ♪ y destellos.
// Pool propio con tope fijo, sin gradientes ni Math.random. Formas 1..5 escalan intensidad.
import { drawRainbowPuff } from "../characters/cuerno-stagecraft.js";
export const CUERNO_FX_MAX = 160;
const RAINBOW = ["#ff6b8a", "#ffb04a", "#ffe45a", "#6ee07a", "#5ac8ff", "#a88cff"];
const h01 = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export function createCuernoFx() { return { list: [], seed: 0, arc: null, trail: [] }; }
// K a lo bestia: rastro arcoíris. seg = { x, y, w?, life?, form? } (lo pasa cuerno-kit).
export const CUERNO_TRAIL_MAX = 40;
export function emitCuernoTrail(fx, seg = {}) {
  if (!fx) return null;
  if (!fx.trail) fx.trail = [];
  const form = Math.max(1, Math.min(5, seg.form | 0 || 1));
  const life = seg.life ?? 180;
  const s = { x: seg.x || 0, y: seg.y || 0, w: seg.w ?? 14 + form * 2, life, max: life, form, born: fx.seed, stars: seg.stars ?? form >= 2 };
  if (fx.trail.length >= CUERNO_TRAIL_MAX) fx.trail.shift();
  fx.trail.push(s);
  if(!seg.reduced)emitCuernoFx(fx,"puff",s.x,s.y,{form,count:1,dir:seg.face||1,size:4+form});
  if (fx.seed % 2 === 0) emitCuernoFx(fx, "spark", s.x, s.y - 6, { form, count: 2, speed: 0.8, size: 2.4 });
  else fx.seed++;
  return s;
}
// Sorpresa: arcoíris completo bajo las patas en el doble salto (60 frames).
export const CUERNO_ARC_LIFE = 60;
export function cuernoDoubleJump(fx, p) {
  if (!fx || !p) return;
  fx.arc = { x: p.x + (p.w || 0) / 2, y: p.y + (p.h || 0), life: CUERNO_ARC_LIFE, form: Math.max(1, Math.min(5, Number(p.form) || (Number(p.evo) || 0) + 1)) };
  emitCuernoFx(fx, "star", fx.arc.x, fx.arc.y, { form: fx.arc.form, count: 3 });
}
function push(fx, p) {
  if (fx.list.length >= CUERNO_FX_MAX) fx.list.shift();
  fx.list.push(p);
}
// tipo: "trail" | "star" | "note" | "spark"
export function emitCuernoFx(fx, type, x, y, opts = {}) {
  const form = Math.max(1, Math.min(5, opts.form | 0 || 1));
  const n = opts.count ?? (type === "trail" ? 1 : type === "star" ? 2 + form : type === "note" ? 1 : 4 + form * 2);
  for (let i = 0; i < n; i++) {
    const r = h01(++fx.seed), r2 = h01(fx.seed + 0.5);
    const a = r * Math.PI * 2, sp = (opts.speed ?? 1.2) * (0.5 + r2);
    push(fx, {
      type, x, y, form,
      vx: type === "puff" ? -(opts.dir||1)*(1+r2) : type === "trail" ? -(opts.dir || 1) * 0.3 : Math.cos(a) * sp,
      vy: type === "puff" ? -.5-r2*.5 : type === "note" ? -0.8 - r2 * 0.5 : type === "trail" ? 0 : Math.sin(a) * sp - 0.4,
      life: type === "trail" ? 26 : type === "note" ? 60 : 36, max: 0,
      color: RAINBOW[(fx.seed + i) % RAINBOW.length], size: (opts.size ?? 3) * (1 + (form - 1) * 0.12),dir:opts.dir||1,
    });
    fx.list[fx.list.length - 1].max = fx.list[fx.list.length - 1].life;
  }
}
// Llamar cada tick con el jugador Cuerno (p.id==="cuerno"); emite la estela al correr.
export function updateCuernoFx(fx, p, t, paused = false) {
  if (paused) return;
  if (p && Math.abs(p.vx || 0) > 1.5 && t % 2 === 0) {
    const form = Math.max(1, Math.min(5, Number(p.form) || (Number(p.evo) || 0) + 1));
    emitCuernoFx(fx, "trail", p.x + (p.w || 0) / 2 - (p.vx > 0 ? 8 : -8), p.y + (p.h || 0) * 0.55, { form, dir: Math.sign(p.vx) });
    if (form >= 3 && t % 12 === 0) emitCuernoFx(fx, "star", p.x + (p.w || 0) / 2, p.y, { form, count: 1, speed: 0.6 });
  }
  if (fx.arc && --fx.arc.life <= 0) fx.arc = null;
  if (fx.trail) for (let i = fx.trail.length - 1; i >= 0; i--) {
    const g = fx.trail[i];
    if (g.life % 20 === 0 && g.stars) emitCuernoFx(fx, "star", g.x, g.y - 10, { form: g.form, count: 1, speed: 0.5, size: 2.2 });
    if (--g.life <= 0) { emitCuernoFx(fx, "spark", g.x, g.y, { form: g.form, count: 5, speed: 1.6, size: 3 }); fx.trail.splice(i, 1); } // confeti
  }
  for (let i = fx.list.length - 1; i >= 0; i--) {
    const q = fx.list[i];
    q.x += q.vx; q.y += q.vy;
    if (q.type === "note") q.x += Math.sin((q.max - q.life) * 0.15) * 0.6;
    else q.vy += 0.02;
    if (--q.life <= 0) fx.list.splice(i, 1);
  }
}
function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i & 1 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function note(ctx, x, y, s) {
  ctx.beginPath(); ctx.ellipse(x, y, s, s * 0.75, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(x + s * 0.7, y - s * 3, s * 0.35, s * 3);
  ctx.fillRect(x + s * 0.7, y - s * 3, s * 1.4, s * 0.45);
}
// Dibujar con la cámara ya aplicada.
export function drawCuernoFx(ctx, fx) {
  if (!fx.list.length && !fx.arc && !(fx.trail && fx.trail.length)) return;
  ctx.save();
  if (fx.trail) for (const g of fx.trail) {
    const k = g.life / g.max, band = 2 + g.form * 0.5, pulse = 0.75 + 0.25 * Math.sin((g.life + g.born) * 0.25);
    ctx.globalAlpha = Math.min(1, k * 3) * pulse;
    for (let b = 0; b < 6; b++) { ctx.fillStyle = RAINBOW[b]; ctx.fillRect(g.x - g.w / 2, g.y - band * 3 + b * band, g.w + 1, band); }
    ctx.globalAlpha = Math.min(1, k * 3) * (pulse - 0.5) * 1.6; ctx.fillStyle = "#ffffff"; // brillo
    ctx.fillRect(g.x - g.w / 2, g.y - band * 3 - 1, g.w + 1, 1.5);
  }
  if (fx.arc) {
    const a = fx.arc, k = a.life / CUERNO_ARC_LIFE, R = 34 + a.form * 4;
    ctx.globalAlpha = Math.min(1, k * 2); ctx.lineWidth = 3;
    for (let b = 0; b < 6; b++) {
      ctx.strokeStyle = RAINBOW[b];
      ctx.beginPath(); ctx.arc(a.x, a.y + R * 0.6, R - b * 3, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    }
  }
  for (const q of fx.list) {
    const k = q.life / q.max;
    ctx.globalAlpha = Math.min(1, k * 1.4);
    ctx.fillStyle = q.color;
    if (q.type === "trail") {
      const band = q.size * 0.9;
      for (let b = 0; b < (q.form >= 2 ? 6 : 3); b++) { ctx.fillStyle = RAINBOW[b * (q.form >= 2 ? 1 : 2)]; ctx.fillRect(q.x - q.size * 2, q.y + (b - 2.5) * band, q.size * 4 * k, band); }
    } else if(q.type==="puff")drawRainbowPuff(ctx,q.x,q.y,1-k,{form:q.form,facing:q.dir});
    else if (q.type === "star") star(ctx, q.x, q.y, q.size * 1.6 * (0.6 + k * 0.4));
    else if (q.type === "note") note(ctx, q.x, q.y, q.size);
    else { ctx.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size * k + 1, q.size * k + 1); }
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
