// Dino foes AI V372 · brasita / escoria / ufo.
// Mismo patrón que Kilo: updateDinoFoeAI(e, game, dt, opts) → true si lo gestiona
// (game.js se salta entonces su rama antigua). No cambia daño ni vida.
// opts: { t, target (aiTarget), canCommit (enemyCanCommit(e)), hurt(amount,label) }

export const DINO_AI_IDS = Object.freeze(["brasita", "escoria", "ufo"]);
export const DINO_AI_TUNING = Object.freeze({
  escoria: { range: 96, wind: 36, cd: 150, warn: 18, burn: 120, puddleW: 56, tickEvery: 30 },
  ufo: { range: 70, wind: 54, lift: 36, cd: 200, liftSpeed: 2.2, push: 7, beamH: 150 },
  spark: { life: 40, n: 2 },
});
const MAX_PUDDLES = 6, MAX_SPARKS = 12;
export const dinoPuddles = [];
export const dinoSparks = [];

export function resetDinoFoeAI() { dinoPuddles.length = 0; dinoSparks.length = 0; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const cx = (o) => o.x + (o.w || 0) / 2;
const worldW = (g) => Number(g?.worldW) || 2000;

function wander(e, game, tgt, acc, max, minY, maxY, offY = 0) {
  e.bob = (e.bob || 0) + (e.kind === "ufo" ? 0.04 : 0.08);
  if (e.baseY == null) e.baseY = e.y;
  if (tgt) { e.vx += Math.sign(cx(tgt) - cx(e)) * acc; e.baseY += Math.sign(tgt.y - offY - e.baseY) * (e.kind === "ufo" ? 0.15 : 0.22); }
  e.vx = clamp(e.vx || 0, -max, max);
  e.baseY = clamp(e.baseY, minY, maxY);
  if (e.x < 30 || e.x > worldW(game) - 30 - e.w) { e.vx *= -1; e.x = clamp(e.x, 30, worldW(game) - 30 - e.w); }
}

function brasita(e, game, o) {
  wander(e, game, o.target, 0.04, 1.8, 220, 620);
  e.y = e.baseY + Math.sin(e.bob) * 18; e.vy = 0;
  if (o.t % 3 === 0) game.fx?.emit?.(cx(e), e.y + e.h / 2, { color: "#ff8a30", count: 2, size: 2.4, up: 0.8, speed: 0.9, life: 16 });
}

function escoria(e, game, o) {
  const C = DINO_AI_TUNING.escoria, tgt = o.target;
  const hot = e.hp < e.max * 0.45; e.enraged = hot;
  e.color = hot ? "#ff4020" : "#c04010";
  e.dinoCd = Math.max(0, (e.dinoCd || 0) - 1);
  if (e.dinoWind > 0) {             // telegraph: se planta y brilla
    e.telegraph = true; e.vx *= 0.7; e.dinoWind--;
    if (e.dinoWind === 0) {
      e.telegraph = false; e.attacking = 1; e.atkT = 14; e.dinoCd = C.cd;
      if (dinoPuddles.length >= MAX_PUDDLES) dinoPuddles.shift();
      dinoPuddles.push({ owner: e, x: cx(e) - C.puddleW / 2 + (e.dir || 1) * 18, y: e.y + e.h, w: C.puddleW, h: 8,
        warn: C.warn, life: C.burn, max: C.burn, tick: 0, dmg: o.contactDmg ?? 9 });
      game.shake = Math.min(10, (game.shake || 0) + 3);
    }
    return;
  }
  if (e.atkT > 0) { e.atkT--; if (!e.atkT) e.attacking = 0; }
  const spd = hot ? 2.4 : 1.1;
  if (tgt) { e.vx += Math.sign(cx(tgt) - cx(e) || 1) * (hot ? 0.12 : 0.04); e.dir = Math.sign(cx(tgt) - cx(e)) || 1; }
  e.vx = clamp(e.vx, -spd, spd);
  e.telegraph = false;
  if (tgt && o.canCommit && !e.dinoCd && Math.abs(cx(tgt) - cx(e)) < C.range && Math.abs(tgt.y - e.y) < 80) { e.dinoWind = C.wind; e.telegraph = true; }
}

function liftBlocked(p, game, dy) {
  const probe = { x: p.x + 2, y: p.y - dy, w: Math.max(1, (p.w || 0) - 4), h: dy };
  for (const pl of game?.platforms || []) {
    if (!pl || pl.oneWay || pl.passThrough || !(pl.h > 24)) continue;
    if (probe.x < pl.x + pl.w && probe.x + probe.w > pl.x && probe.y < pl.y + pl.h && probe.y + probe.h > pl.y) return true;
  }
  return p.y - dy < 0;
}

function releaseAbduct(e, game) {
  const p = e.dinoVictim; if (!p) return;
  const dir = Math.sign(cx(p) - cx(e)) || e.dir || 1;
  p.vx = dir * DINO_AI_TUNING.ufo.push; p.vy = -3;
  p.x = clamp(p.x, 40, worldW(game) - 40 - (p.w || 0));
  p.dinoAbducted = 0; e.dinoVictim = null; e.dinoLift = 0; e.attacking = 0;
}

function ufo(e, game, o) {
  const C = DINO_AI_TUNING.ufo, tgt = o.target;
  if (e.dinoLift > 0) {              // abducción: sin daño, duración tope
    e.vx *= 0.8; e.dinoLift--; e.attacking = 1;
    const p = e.dinoVictim;
    if (!p || p.dead || !e.dinoLift) { releaseAbduct(e, game); e.dinoCd = C.cd; return; }
    p.vx = (cx(e) - cx(p)) * 0.12;
    p.vy = -C.liftSpeed;
    const top = e.y + e.h + 6;          // nunca dentro del platillo
    if (p.y < top) { p.y = top; p.vy = 0; }
    // V372: nunca subir al jugador dentro de un techo/sólido; si hay techo, se suelta.
    if (p.vy < 0 && liftBlocked(p, game, -p.vy + 2)) { p.vy = 0; releaseAbduct(e, game); p.vy = 0; e.dinoCd = C.cd; return; }
    p.dinoAbducted = e.dinoLift;
    return;
  }
  wander(e, game, tgt, 0.03, 1.6, 180, 520, 40);
  e.y = e.baseY + Math.sin(e.bob) * 14; e.vy = 0;
  e.dinoCd = Math.max(0, (e.dinoCd || 0) - 1);
  if (e.dinoWind > 0) {              // telegraph: rayo tractor tenue
    e.telegraph = true; e.dinoBeam = 1; e.vx *= 0.85; e.dinoWind--;
    if (!e.dinoWind) {
      e.telegraph = false; e.dinoBeam = 0;
      if (tgt && !tgt.dead && underBeam(e, tgt)) { e.dinoVictim = tgt; e.dinoLift = C.lift; }
      else e.dinoCd = C.cd >> 1;
    }
    return;
  }
  e.telegraph = false; e.dinoBeam = 0;
  if (tgt && o.canCommit && !e.dinoCd && Math.abs(cx(tgt) - cx(e)) < C.range && tgt.y > e.y) { e.dinoWind = C.wind; e.telegraph = true; e.dinoBeam = 1; }
}

export function underBeam(e, p) {
  const top = e.y + e.h, d = p.y - top;
  if (d < -10 || d > DINO_AI_TUNING.ufo.beamH) return false;
  const half = 8 + (18 - 8) * clamp(d / 38, 0, 1) + 10;
  return Math.abs(cx(p) - cx(e)) < half;
}

export function updateDinoFoeAI(e, game, dt = 1, opts = {}) {
  if (!e || !DINO_AI_IDS.includes(e.kind)) return false;
  if (game?.paused) return true;
  if (e.hp <= 0 || e.dying > 0) { if (e.dinoVictim) releaseAbduct(e, game); e.telegraph = false; return false; }
  const o = { t: opts.t ?? game?.t ?? 0, target: opts.target ?? game?.player ?? null, canCommit: opts.canCommit !== false, contactDmg: opts.contactDmg };
  if (o.target && (o.target.dead || !Number.isFinite(o.target.x))) o.target = null;
  if (e.stun > 5) { if (e.dinoVictim) releaseAbduct(e, game); e.telegraph = false; e.dinoWind = 0; return true; }
  if (e.kind === "brasita") brasita(e, game, o);
  else if (e.kind === "escoria") escoria(e, game, o);
  else ufo(e, game, o);
  return true;
}

// Llamar 1 vez por frame (fuera del bucle de enemigos). Charcos + chispas.
// hurt(amount,label) = hurtPlayer de game.js. Daño por tick ≤ contacto de escoria.
export function updateDinoHazards(game, hurt) {
  if (!game || game.paused) return;
  const p = game.player, C = DINO_AI_TUNING.escoria;
  for (let i = dinoPuddles.length - 1; i >= 0; i--) {
    const q = dinoPuddles[i];
    if (q.warn > 0) { q.warn--; continue; }
    if (--q.life <= 0) { dinoPuddles.splice(i, 1); continue; }
    if (q.tick > 0) q.tick--;
    if (p && !p.dead && !q.tick && !(p.invuln > 0) && typeof hurt === "function" &&
        p.x < q.x + q.w && p.x + p.w > q.x && p.y + p.h >= q.y - 6 && p.y + p.h <= q.y + 14) {
      const dmg = Math.min(q.dmg, 9);
      hurt(dmg, "-" + dmg); q.tick = C.tickEvery;
    }
  }
  for (let i = dinoSparks.length - 1; i >= 0; i--) {
    const s = dinoSparks[i];
    s.x += s.vx; s.y += s.vy; s.vy += 0.15; s.vx *= 0.97;
    if (--s.life <= 0) dinoSparks.splice(i, 1);
  }
}

// Brasita al morir: 2 chispitas SOLO visuales (sin daño, sin vida, sin spawn).
export function onDinoFoeDeath(e) {
  if (!e || e.kind !== "brasita" || e.dinoSplit) return false;
  e.dinoSplit = true;
  for (let i = 0; i < DINO_AI_TUNING.spark.n; i++) {
    if (dinoSparks.length >= MAX_SPARKS) dinoSparks.shift();
    dinoSparks.push({ x: cx(e), y: e.y + e.h / 2, vx: i ? 2.4 : -2.4, vy: -3, life: DINO_AI_TUNING.spark.life, max: DINO_AI_TUNING.spark.life, tier: Number(e.evo) || 0 });
  }
  return true;
}
