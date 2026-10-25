// ── Kit de ataques de Cuerno (V373) ─────────────────────────────────────────
// Módulo autónomo: no toca abilities.js ni game.js. Ohana lo engancha.
// Teclas: J lanza, K cornada, L estampida arcoíris, F sueño, M melee (puya).
// Regla de oro: TODO ataque pasa primero por una fase de aviso (telegraph)
// y solo golpea cuando el aviso termina. Sin azar ni degradados.
// Daño: se reutilizan las escalas existentes de abilities.js
//   gleam   (19+evo*3)*pw   · rainbow (25+evo*6)*pw   · melee def.dmg (signature)
// pw(p) = 1 + evo*0.35 (igual que abilities.js, sin el flow para no inflar).

import * as CuernoFx from "./cuerno-fx.js";            // Chispín (opcional)
import * as CuernoEvo from "./cuerno-evo-v373.js";       // Dino (opcional; no importa este módulo)
import * as CuernoArt from "../characters/art/cuerno-v373.js"; // Stitcho (opcional)
import { CUERNO_VISUAL_H } from "../characters/art/cuerno.js";
import {sfx} from "../engine/audio.js";

export const CUERNO_ID = "cuerno";
const COLORS = Object.freeze(["#ff8fb8", "#ffc46b", "#fff27a", "#8dffb0", "#7ee7ff", "#a99bff", "#f2c1ff"]);
const FORM_TINT = Object.freeze(["#ffe0f4", "#f2c1ff", "#c9b6ff", "#9ad7ff", "#252132"]);

// Definición del kit (frames a 60 Hz). warn = frames de aviso antes de golpear.
export const CUERNO_KIT = Object.freeze({
  J: Object.freeze({ id: "lanza", name: "Onda arcoíris", warn: 10, active: 14, cd: 29 }),
  K: Object.freeze({ id: "cornada", name: "Prrrf arcoíris", warn: 16, active: 16, cd: 96 }),
  L: Object.freeze({ id: "estampida", name: "Estampida arcoíris", warn: 30, active: 40, cd: 336 }),
  F: Object.freeze({ id: "sueno", name: "Sueño", warn: 26, active: 20, cd: 420 }),
  M: Object.freeze({ id: "puya", name: "Puya", warn: 5, active: 8, cd: 18 }),
});

export function getCuernoKit() { return CUERNO_KIT; }

// evo interno 0..4  →  forma 1..5
export function cuernoForm(p) { return Math.max(1, Math.min(5, (Number(p?.evo) || 0) + 1)); }
function evoOf(p) { return cuernoForm(p) - 1; }
function pw(p) { return 1 + evoOf(p) * 0.35; }

// Escalas de daño (idénticas a las existentes, no se rebalancea nada).
export function cuernoDamage(key, p, def = {}) {
  const e = evoOf(p);
  switch (key) {
    case "J": return (19 + e * 3) * pw(p);
    case "K": return (19 + e * 3) * pw(p);          // cornada = escala de la lanza
    case "L": return (25 + e * 6) * pw(p);          // estampida = escala de la corona
    case "F": return 0;                              // sueño: control puro
    case "M": return Number(def.dmg) || 0;           // melee: daño de signature
    default: return 0;
  }
}

// Alcances por forma (suben con la evo).
export function cuernoReach(key, p) {
  const e = evoOf(p);
  return { J: 260 + e * 30, K: 150 + e * 22, L: 320 + e * 60, F: 150 + e * 30, M: 92 + e * 12 }[key] || 0;
}

// ── Estela arcoíris de la cornada (K) ──────────────────────────────────────
// Buffer circular fijo: 40 segmentos preasignados, nunca se crean más.
export const CUERNO_TRAIL_MAX = 40;
export const CUERNO_TRAIL_LIFE = 180;      // ~3 s a 60 Hz
export const CUERNO_TRAIL_TICK = 20;       // un golpe por enemigo cada 20 f
export const CUERNO_TRAIL_BANDS = Object.freeze(["#ff8fb8", "#ffc46b", "#fff27a", "#8dffb0", "#7ee7ff", "#a99bff"]);
const TRAIL_EVERY = 2;                     // un segmento cada 2 f de embestida
// Duración de la embestida por forma: más forma = estela más larga.
export function cornadaActive(form) { return 16 + form * 8; }
// Daño por tick = escala rainbow existente / 6 (no sube el balance).
export function trailTickDamage(p) { return cuernoDamage("L", p) / 6; }

// Modificadores de Dino: SOLO se usan J.extra y unlock.trailStars.
// K/L/F mantienen la escala propia de este kit a propósito.
const FALLBACK_EXTRA = [0, 0, 1, 1, 2];
export function cuernoEvoMods(form) {
  const f = Math.max(1, Math.min(5, form | 0 || 1));
  let m = null;
  try { if (typeof CuernoEvo.cuernoFormMods === "function") m = CuernoEvo.cuernoFormMods(f); } catch (_) { m = null; }
  return {
    extraJ: Math.max(0, Math.min(2, Number(m?.J?.extra ?? FALLBACK_EXTRA[f - 1]) | 0)),
    trailStars: m ? !!m.unlock?.trailStars : null,   // null = sin mods → no se pasa
  };
}
// Pendientes de las lanzas: central + extras abiertos en abanico leve.
const J_SPREAD = 0.14;
export function lanceSlopes(form) {
  const n = cuernoEvoMods(form).extraJ, out = [0];
  if (n >= 1) out.push(-J_SPREAD);
  if (n >= 2) out.push(J_SPREAD);
  return out;
}

const cxOf = (o) => o.x + (o.w || 0) / 2;
const cyOf = (o) => o.y + (o.h || 0) / 2;
const alive = (e) => e && !e.dead && !e.dying && e.hp > 0;

function state(p) {
  if (!p._cuernoKit) {
    const trail = [];
    for (let i = 0; i < CUERNO_TRAIL_MAX; i++) trail.push({ on: false, x: 0, y: 0, w: 0, h: 0, life: 0, form: 1, dmg: 0 });
    p._cuernoKit = { cd: { J: 0, K: 0, L: 0, F: 0, M: 0 }, acts: [], trail, head: 0, tick: 0 };
  }
  return p._cuernoKit;
}

// Caja/zona de impacto de cada ataque (la misma que se dibuja en el aviso).
export function cuernoZone(a, p) {
  const r = a.reach, f = a.face;
  if (a.key === "L" || a.key === "F") return { kind: "circle", x: a.x, y: a.y, r };
  const x0 = a.x, h = a.key === "K" ? Math.max(30, p.h) : Math.max(22, p.h * 0.62);
  return { kind: "box", x: f > 0 ? x0 : x0 - r, y: a.y - h / 2, w: r, h };
}
function inZone(z, e) {
  if (z.kind === "circle") return Math.hypot(cxOf(e) - z.x, cyOf(e) - z.y) <= z.r + (e.w || 0) / 2;
  return e.x < z.x + z.w && e.x + (e.w || 0) > z.x && e.y < z.y + z.h && e.y + (e.h || 0) > z.y;
}

// Lanza un ataque: crea la fase de aviso. Devuelve false si está en cooldown.
export function castCuerno(key, p, game, def = {}) {
  const k = CUERNO_KIT[key];
  if (!k || !p || p.dead || p.id !== CUERNO_ID) return false;
  const S = state(p);
  if (S.cd[key] > 0 || S.acts.some((a) => a.key === key)) return false;
  const face = p.facing || 1;
  S.cd[key] = k.cd;
  S.acts.push({
    key, id: k.id, face, phase: "warn", t: 0, warn: k.warn, active: key === "K" ? cornadaActive(cuernoForm(p)) : k.active,
    x: key === "L" || key === "F" ? cxOf(p) : cxOf(p) + face * (p.w || 0) * 0.4,
    y: cyOf(p), reach: cuernoReach(key, p), dmg: cuernoDamage(key, p, def),
    form: cuernoForm(p), hit: new Set(),
    lances: key === "J" ? lanceSlopes(cuernoForm(p)).map((sl) => ({ sl, hit: new Set() })) : null,
  });
  return true;
}

// Avanza un frame. opts.hit(game, e, dmg, o) = hitEnemy de abilities.js.
export function updateCuerno(game, p, opts = {}) {
  if (!p?._cuernoKit) return;
  if(game?.paused)return;
  if(p.dead){resetCuerno(p);return;}
  const S = p._cuernoKit;
  for (const k in S.cd) if (S.cd[k] > 0) S.cd[k]--;
  const hit = opts.hit || ((g, e, d) => { e.hp -= d; return true; });
  S.tick++;
  updateTrail(game, p, S, hit);
  for (let i = S.acts.length - 1; i >= 0; i--) {
    const a = S.acts[i];
    a.t++;
    if (a.phase === "warn") {
      // Durante el aviso el ataque sigue al jugador (cornada se fija al final).
      if (a.key !== "L") { a.y = cyOf(p); a.x = a.key === "F" ? cxOf(p) : cxOf(p) + a.face * (p.w || 0) * 0.4; }
      if (a.t >= a.warn) { a.phase = "active"; a.t = 0; }
      continue;
    }
    // Fase activa
    if (a.key === "K") {
      if(a.t===1){game.nums?.add?.(cxOf(p)-a.face*p.w,p.y-28,"¡PRRRF!", "#f7c5ef",true);sfx("rainbowPuff");}
      p.vx = a.face * (9 + a.form); a.x = cxOf(p) + a.face * (p.w || 0) * 0.4; a.y = cyOf(p);
      if (a.t % TRAIL_EVERY === 1) spawnTrail(game, p, S, a);   // solo tras el aviso
    }
    if (a.key === "L") a.x += a.face * (4 + a.form);
    const z = cuernoZone(a, p);
    if (a.key === "J") {                           // cada lanza: mismo daño, perfora 3
      for (const l of a.lances) for (const e of game.enemies || []) {
        if (!alive(e) || l.hit.has(e) || l.hit.size >= 3) continue;
        const dy = l.sl * (cxOf(e) - a.x) * a.face;
        if (!inZone({ ...z, y: z.y + dy }, e)) continue;
        l.hit.add(e);
        hit(game, e, a.dmg, { kx: a.face * 4, ky: -3, stun: 12, color: COLORS[(a.form + 1) % 7], crit: true });
      }
      if (a.t >= a.active) S.acts.splice(i, 1);
      continue;
    }
    for (const e of game.enemies || []) {
      if (!alive(e) || a.hit.has(e) || !inZone(z, e)) continue;
      if (a.key === "J" && a.hit.size >= 3) break; // perfora hasta 3, como gleam
      a.hit.add(e);
      if (a.key === "F") {
        if (e.boss) continue;                      // el jefe no se duerme
        e.sleep = Math.max(e.sleep || 0, 90 + a.form * 20);
        e.stun = Math.max(e.stun || 0, e.sleep);
        e.vx = 0;
      } else {
        hit(game, e, a.dmg, {
          kx: a.face * (a.key === "K" ? 10 : a.key === "L" ? 7 : 4), ky: a.key === "L" ? -7 : -3,
          stun: a.key === "K" ? 30 : a.key === "L" ? 40 : 12, color: COLORS[(a.form + 1) % 7], crit: a.key !== "M",
        });
      }
    }
    if (a.t >= a.active) S.acts.splice(i, 1);
  }
}

function spawnTrail(game, p, S, a) {
  const seg = S.trail[S.head];
  S.head = (S.head + 1) % CUERNO_TRAIL_MAX;
  seg.on = true; seg.form = a.form; seg.life = CUERNO_TRAIL_LIFE;
  seg.w = 18 + a.form * 2; seg.h = 12 + a.form * 2;
  // Punto de salida detrás de la cadera (arte de Stitcho) o desplazamiento fijo.
  const orig = typeof CuernoArt.cuernoTrailOrigin === "function"
    ? CuernoArt.cuernoTrailOrigin(cxOf(p), p.y + (p.h || 0), { form: a.form, facing: a.face, scale: CUERNO_VISUAL_H[a.form-1]/100*(p.visualScale||1) })
    : { x: cxOf(p) - a.face * ((p.w || 0) / 2 + seg.w / 2), y: cyOf(p) };
  seg.x = orig.x - seg.w / 2;
  seg.y = p.y + (p.h || 0) - seg.h;          // la banda dañina queda a ras de suelo
  seg.face = a.face; seg.dmg = trailTickDamage(p);
  // Gancho de efectos: API inyectada (game.cuernoFxApi) o cuerno-fx.js de Chispín.
  const api = game.cuernoFxApi || CuernoFx;
  if (game.cuernoFx && typeof api.emitCuernoTrail === "function") {
    const payload = { x: orig.x, y: orig.y, form: seg.form, life: CUERNO_TRAIL_LIFE,face:a.face,reduced:!!game.reduceMotion };
    const stars = cuernoEvoMods(seg.form).trailStars;   // el kit no crea estrellas
    if (stars !== null) payload.stars = stars;
    api.emitCuernoTrail(game.cuernoFx, payload);
  }
}
function updateTrail(game, p, S, hit) {
  for (const seg of S.trail) {
    if (!seg.on) continue;
    if (--seg.life <= 0) { seg.on = false; continue; }
    for (const e of game.enemies || []) {
      if (!alive(e)) continue;
      if (!(e.x < seg.x + seg.w && e.x + (e.w || 0) > seg.x && e.y < seg.y + seg.h && e.y + (e.h || 0) > seg.y)) continue;
      if ((e._cuernoTrailNext || 0) > S.tick) continue;       // cooldown por enemigo
      e._cuernoTrailNext = S.tick + CUERNO_TRAIL_TICK;
      hit(game, e, seg.dmg, { kx: 0, ky: -1, stun: 4, color: CUERNO_TRAIL_BANDS[S.tick % 6], crit: false, trail: true });
    }
  }
}
export function cuernoTrailCount(p) { return p?._cuernoKit ? p._cuernoKit.trail.filter((s) => s.on).length : 0; }

// Estela: 6 bandas planas, se desvanece con la vida del segmento.
function drawTrail(ctx, S, cam) {
  ctx.save(); ctx.translate(-cam.x, -cam.y);
  for (const seg of S.trail) {
    if (!seg.on) continue;
    ctx.globalAlpha = Math.min(1, seg.life / 40) * 0.85;
    const bh = seg.h / 6;
    ctx.lineCap="round";ctx.lineWidth=bh+1;
    for (let i = 0; i < 6; i++) {ctx.strokeStyle=CUERNO_TRAIL_BANDS[i];ctx.beginPath();
      const y=seg.y+i*bh;ctx.moveTo(seg.x,y);ctx.quadraticCurveTo(seg.x+seg.w*.5,y-Math.sin(seg.x*.035)*2,seg.x+seg.w+1,y);ctx.stroke();}
  }
  ctx.restore();
}

// Dibujo: aviso (contorno discontinuo que se llena) + golpe. Solo colores planos.
export function drawCuerno(ctx, p, cam = { x: 0, y: 0 }, t = 0) {
  const S = p?._cuernoKit;
  if (!S) return;
  drawTrail(ctx, S, cam);
  if (!S.acts.length) return;
  for (const a of S.acts) {
    const z = cuernoZone(a, p);
    const warn = a.phase === "warn";
    const k = warn ? a.t / a.warn : 1 - a.t / a.active;
    const col = COLORS[(a.form + 1) % 7];
    ctx.save();
    ctx.translate(-cam.x, -cam.y);
    ctx.lineWidth = warn ? 2 : 4;
    ctx.setLineDash(warn ? [8, 6] : []);
    ctx.lineDashOffset = -t * 0.6;
    ctx.strokeStyle = warn ? "#ffffff" : col;
    ctx.fillStyle = col;
    ctx.globalAlpha = warn ? 0.18 + 0.35 * k : 0.45 * k + 0.15;
    if (z.kind === "circle") {
      ctx.globalAlpha=warn?.08+.12*k:.035;
      ctx.beginPath(); ctx.arc(z.x, z.y, warn ? z.r * k : z.r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2); ctx.stroke();
      if (a.key === "L") for (let i = 0; i < 7; i++) {          // arcos iris planos
        ctx.strokeStyle = COLORS[i]; ctx.setLineDash([]); ctx.globalAlpha = warn ? 0.3 : 0.75;
        ctx.beginPath(); ctx.arc(z.x, z.y, z.r * (0.45 + i * 0.07), Math.PI, Math.PI * 2); ctx.stroke();
      }
      if (a.key === "F") {                                      // zetas de sueño
        ctx.globalAlpha = 0.9; ctx.fillStyle = "#e9ddff"; ctx.font = "bold 16px sans-serif";
        for (let i = 0; i < 5; i++) {
          const ang = t * 0.03 + i * 1.256;
          ctx.fillText("z", z.x + Math.cos(ang) * z.r * 0.7, z.y + Math.sin(ang) * z.r * 0.7);
        }
      }
    } else {
      const w = warn ? z.w * k : z.w;
      const x = a.face > 0 ? z.x : z.x + z.w - w;
      if(!warn&&(a.key==="J"||a.key==="M")){
        ctx.globalAlpha=.9;ctx.setLineDash([]);ctx.lineCap="round";
        const origin=CuernoArt.cuernoHornOrigin(cxOf(p),p.y+p.h,{form:a.form,facing:a.face,scale:CUERNO_VISUAL_H[a.form-1]/100*(p.visualScale||1)});
        for(const lance of a.lances||[{sl:0}]){
          const tip=a.x+a.face*w,ty=a.y+lance.sl*w;
          if(a.key==="J"){
           for(let band=0;band<7;band++){
            const offset=(band-3)*2.6;
            ctx.strokeStyle=COLORS[band];ctx.lineWidth=2.7;ctx.beginPath();
            ctx.moveTo(origin.x,origin.y+offset*.3);
            ctx.bezierCurveTo(a.x+a.face*w*.25,a.y-14+offset,a.x+a.face*w*.7,ty-12+offset,tip,ty+offset);ctx.stroke();
           }
           ctx.strokeStyle='#fff6df';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(tip,ty,5,11,0,-Math.PI/2,Math.PI/2);ctx.stroke();
          }else{
           ctx.strokeStyle="#fff6d3";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.quadraticCurveTo(a.x+a.face*w*.4,a.y,tip,ty);ctx.stroke();
          }
        }
        ctx.restore();continue;
      }
      ctx.globalAlpha=warn?.05+.1*k:.04;
      ctx.fillRect(x, z.y, w, z.h);
      ctx.globalAlpha = warn?.6:.18; ctx.strokeRect(z.x, z.y, z.w, z.h);
      if (a.lances) for (const l of a.lances) {     // lanzas extra en abanico
        if (!l.sl) continue;
        ctx.beginPath(); ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + a.face * z.w * (warn ? k : 1), a.y + l.sl * z.w * (warn ? k : 1)); ctx.stroke();
      }
    }
    if (warn) {                                                  // signo de aviso
      ctx.setLineDash([]); ctx.globalAlpha = 1; ctx.fillStyle = "#fff6c8";
      ctx.font = "bold 18px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("!", cxOf(p), p.y - 10 - 4 * Math.sin(t * 0.3));
    }
    ctx.restore();
  }
}

export function cuernoTrailSegments(p) { return p?._cuernoKit?.trail || []; }
export function cuernoBusy(p) { return !!p?._cuernoKit?.acts.length; }
export function resetCuerno(p) { if (p) delete p._cuernoKit; }
