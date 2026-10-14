// V372 · IA de los bichos de Kilo: cucaracho, mosquito, phosquito y avispa.
// Solo decide velocidades y estados (telegraph/wind/lunge/diving/charging),
// los mismos campos que leen kilo-foes.js y dmgFor(): nunca toca hp, max ni daño.
// Todo ataque pasa antes por un aviso (telegraph) de varios frames.
// La posición la integra game.js (e.x += e.vx) en el frame siguiente.
export const KILO_AI_KINDS = Object.freeze(["cucaracho", "mosquito", "phosquito", "avispa"]);
export const KILO_AI = Object.freeze({
  roach: { speed: 1.9, zigEvery: 34, flee: 46, fleeSpeed: 3.6, wind: 16, lunge: 16, lungeCd: 100, lungeRange: 150 },
  mosquito: { radius: 110, orbit: 0.045, wind: 18, dive: 22, retreat: 26, cd: 70, maxV: 5 },
  phos: { range: 170, sep: 34, cohesion: 0.012, align: 0.05, separation: 0.09, wind: 16, dive: 26, cd: 80, maxV: 3.6 },
  wasp: { wind: 30, rewind: 12, sting: 18, retreat: 44, cd: 96 },
});
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const cx = (o) => o.x + (o.w || 0) / 2;
const cy = (o) => o.y + (o.h || 0) / 2;

/** Tipo de IA que gestiona este módulo, o null. */
export function kiloAiType(e) {
  if (!e || e.boss) return null;
  if (e.kind === "abeja" || e.kind === "avispa") return e.variant === "avispa" || e.kind === "avispa" ? "avispa" : null;
  if (e.kind === "cucaracho") return (e.evo || 0) >= 2 ? null : "cucaracho"; // la forma alada evo2 sigue con su IA
  if (e.kind === "mosquito" || e.kind === "phosquito") return e.kind;
  return null;
}

function bounds(e, game) {
  const W = Number(game?.worldW) || 4000;
  if (e.x < 30 || e.x > W - 30 - e.w) { e.vx = -(e.vx || 0); e.x = clamp(e.x, 30, W - 30 - e.w); return true; }
  return false;
}

function roach(e, game, o) {
  const C = KILO_AI.roach, tgt = o.target;
  const k = e._kai || (e._kai = { zig: 0, dir: Math.sign(e.vx) || 1, flee: 0, lastHp: e.hp });
  if (e.hp < k.lastHp) { // golpe recibido: huye a esconderse
    k.flee = C.flee; e.telegraph = false; e.wind = 0; e.lunge = 0;
    k.dir = tgt ? (Math.sign(cx(e) - cx(tgt)) || 1) : -k.dir;
  }
  k.lastHp = e.hp;
  if (k.flee > 0) {
    k.flee--;
    e.hiding = k.flee > 0;
    e.vx = k.dir * C.fleeSpeed;
    if (bounds(e, game)) k.dir = Math.sign(e.vx) || 1;
    return;
  }
  e.hiding = false;
  if (e.lunge > 0) { e.lunge--; if (e.lunge <= 0) { e.vx *= 0.35; e.lungeCd = C.lungeCd; } return; }
  e.lungeCd = (e.lungeCd || 0) - 1;
  if (e.wind > 0) { // aviso: se frena y se levanta
    e.wind--; e.telegraph = true; e.vx *= 0.6;
    if (e.wind <= 0) {
      e.telegraph = false; e.lunge = C.lunge;
      e.vx = (tgt ? Math.sign(cx(tgt) - cx(e)) || 1 : k.dir) * 5.2; e.vy = -3.2;
    }
    return;
  }
  e.telegraph = false;
  if (tgt && o.canCommit && e.lungeCd <= 0 && Math.abs(cx(tgt) - cx(e)) < C.lungeRange && Math.abs(cy(tgt) - cy(e)) < 80) {
    e.wind = C.wind; e.telegraph = true; return;
  }
  // zigzag: avanza hacia el objetivo con quiebros de dirección cortos
  k.zig++;
  const toward = tgt ? Math.sign(cx(tgt) - cx(e)) || k.dir : k.dir;
  const phase = Math.floor(k.zig / C.zigEvery) % 3; // 2 tramos hacia delante, 1 quiebro atrás
  k.dir = phase === 2 ? -toward : toward;
  e.vx += (k.dir * C.speed - e.vx) * 0.25;
  if (bounds(e, game)) k.zig = 0;
}

function mosquito(e, game, o) {
  const C = KILO_AI.mosquito, tgt = o.target, t = Number(o.t) || 0;
  const k = e._kai || (e._kai = { ang: ((e.x || 0) * 0.01) % 6.28, retreat: 0 });
  e.diveCd = (e.diveCd || 0) - 1;
  if (e.diving > 0) {
    e.diving--; e.telegraph = false;
    if (e.diving <= 0) { e.diving = false; k.retreat = C.retreat; e.diveCd = C.cd; }
    return;
  }
  if (k.retreat > 0) { k.retreat--; e.vy = -2.4; e.vx *= 0.92; return; }
  if (e.wind > 0) { // aviso: se queda zumbando encima, temblando
    e.wind--; e.telegraph = true;
    e.vx = Math.sin(t * 1.7) * 0.9; e.vy = tgt ? clamp((cy(tgt) - 120 - cy(e)) * 0.05, -1.5, 1.5) : 0;
    if (e.wind <= 0) {
      e.telegraph = false; e.diving = C.dive;
      const dx = tgt ? cx(tgt) - cx(e) : 0, dy = tgt ? cy(tgt) - cy(e) : 1, L = Math.hypot(dx, dy) || 1;
      e.vx = dx / L * 5.6; e.vy = Math.max(2.5, dy / L * 6.2);
    }
    return;
  }
  e.telegraph = false;
  if (!tgt) return;
  // órbita con zumbido alrededor del jugador
  k.ang += C.orbit;
  const r = C.radius + Math.sin(t * 0.07 + k.ang) * 18;
  const gx = cx(tgt) + Math.cos(k.ang) * r, gy = cy(tgt) - 70 + Math.sin(k.ang) * r * 0.45;
  e.vx += clamp((gx - cx(e)) * 0.02, -0.6, 0.6) + Math.sin(t * 0.9 + k.ang * 3) * 0.25;
  e.vy = clamp((gy - cy(e)) * 0.06, -2.6, 2.6) + Math.cos(t * 1.1) * 0.4;
  e.vx = clamp(e.vx, -C.maxV, C.maxV);
  if (o.canCommit && e.diveCd <= 0 && (e.mode == null || e.mode === "strike" || e.mode === "chase") && cy(e) < cy(tgt) - 30) { e.wind = C.wind; e.telegraph = true; }
  bounds(e, game);
}

function phos(e, game, o) {
  const C = KILO_AI.phos, tgt = o.target;
  e.diveCd = (e.diveCd || 0) - 1;
  if (e.diving > 0) {
    e.diving--; e.telegraph = false;
    if (e.diving <= 0) { e.diving = false; e.diveCd = C.cd; e.vy = -1.8; }
    return;
  }
  if (e.wind > 0) {
    e.wind--; e.telegraph = true; e.vx *= 0.88; e.vy *= 0.7;
    if (e.wind <= 0) { e.telegraph = false; e.diving = C.dive; e.vx += tgt ? (Math.sign(cx(tgt) - cx(e)) || 1) * 1.8 : 0; e.vy = 3.4; }
    return;
  }
  e.telegraph = false;
  // enjambre: cohesión + alineación + separación con phosquitos cercanos
  let n = 0, sx = 0, sy = 0, svx = 0, px = 0, py = 0;
  for (const f of game?.enemies || []) {
    if (f === e || f.kind !== "phosquito" || f.hp <= 0 || f.dying) continue;
    const dx = cx(f) - cx(e), dy = cy(f) - cy(e), d = Math.hypot(dx, dy);
    if (d > C.range) continue;
    n++; sx += dx; sy += dy; svx += f.vx || 0;
    if (d < C.sep && d > 0) { px -= dx / d; py -= dy / d; }
  }
  e.flock = n;
  if (n) {
    e.vx += (sx / n) * C.cohesion + (svx / n - e.vx) * C.align + px * C.separation * 10;
    e.vy += (sy / n) * C.cohesion + py * C.separation * 10;
  }
  if (tgt) { e.vx += Math.sign(cx(tgt) - cx(e)) * 0.05; e.vy += clamp((cy(tgt) - 110 - cy(e)) * 0.004, -0.15, 0.15); }
  e.vy = clamp(e.vy * 0.96, -2.2, 2.2);
  e.vx = clamp(e.vx, -C.maxV, C.maxV);
  if (tgt && o.canCommit && e.diveCd <= 0 && Math.abs(cx(tgt) - cx(e)) < 200) { e.wind = C.wind; e.telegraph = true; }
  bounds(e, game);
}

function wasp(e, game, o) {
  const C = KILO_AI.wasp, tgt = o.target;
  const k = e._kai || (e._kai = { phase: "hover", n: 0, stings: 0 });
  e.bob = (e.bob || 0) + 0.07;
  if (e.baseY == null) e.baseY = e.y;
  e.cd = (e.cd || 0) - 1;
  const aim = () => {
    const dx = tgt ? cx(tgt) - cx(e) : (e.vx >= 0 ? 1 : -1), dy = tgt ? cy(tgt) - cy(e) + 12 : 0, L = Math.hypot(dx, dy) || 1;
    e.vx = dx / L * 6.2; e.vy = dy / L * 8.4;
  };
  if (k.phase === "wind" || k.phase === "rewind") {
    k.n--; e.telegraph = true; e.wind = Math.max(1, k.n); e.vx *= 0.85; e.vy *= 0.6; e.charging = 0;
    if (k.phase === "wind") e.y = e.baseY + Math.sin(e.bob * 1.6) * 6;
    if (k.n <= 0) { k.phase = "sting"; k.n = C.sting; k.stings++; e.telegraph = false; e.wind = 0; e.diving = k.n; e.charging = k.n; aim(); }
  } else if (k.phase === "sting") {
    k.n--; e.diving = k.n; e.charging = k.n;
    if (k.n <= 0) {
      e.diving = 0; e.charging = 0;
      if (k.stings < 2) { k.phase = "rewind"; k.n = C.rewind; e.vx *= 0.2; e.vy *= 0.2; }
      else { k.phase = "retreat"; k.n = C.retreat; }
    }
  } else if (k.phase === "retreat") {
    k.n--; e.telegraph = false;
    const away = tgt ? Math.sign(cx(e) - cx(tgt)) || 1 : 1;
    e.vx += (away * 2.6 - e.vx) * 0.15; e.vy = -1.6;
    if (k.n <= 0) { k.phase = "hover"; e.cd = C.cd; e.baseY = clamp(e.y, 220, 620); e.vy = 0; }
  } else {
    e.telegraph = false; e.charging = 0; e.diving = 0;
    e.vy = 0; e.y = e.baseY + Math.sin(e.bob) * 16 + Math.sin(e.bob * 2.5) * 5;
    if (tgt) { e.vx += Math.sign(cx(tgt) - cx(e)) * 0.03; e.baseY += Math.sign(tgt.y - e.baseY) * 0.18; }
    e.vx = clamp(e.vx, -2, 2); e.baseY = clamp(e.baseY, 220, 620);
    if (tgt && o.canCommit && e.cd <= 0) { k.phase = "wind"; k.n = C.wind; k.stings = 0; e.telegraph = true; e.wind = C.wind; }
  }
  bounds(e, game);
}

/**
 * Actualiza un bicho de Kilo. Devuelve true si lo ha gestionado (game.js debe
 * saltarse entonces su rama antigua de ese kind).
 * opts: { t, target (jugador/aliado objetivo), canCommit (enemyCanCommit(e)) }.
 * dt se acepta por compatibilidad; los temporizadores avanzan 1 por llamada,
 * igual que el resto de enemigos (game.js ya llama a 60 Hz fijos).
 */
export function updateKiloFoeAI(e, game, dt = 1, opts = {}) {
  const type = kiloAiType(e);
  if (!type || e.hp <= 0 || e.dying > 0) return false;
  const o = { t: opts.t ?? game?.t ?? 0, target: opts.target ?? game?.player ?? null, canCommit: opts.canCommit !== false };
  if (o.target && (o.target.dead || !Number.isFinite(o.target.x))) o.target = null;
  if (e.stun > 5) { e.telegraph = false; e.wind = 0; return true; } // aturdido: no decide
  if (type === "cucaracho") roach(e, game, o);
  else if (type === "mosquito") mosquito(e, game, o);
  else if (type === "phosquito") phos(e, game, o);
  else wasp(e, game, o);
  return true;
}
