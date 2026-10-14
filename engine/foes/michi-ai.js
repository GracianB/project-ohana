// Ohana Michi — IA de rana, planta y gaviota (V372+).
// Post-pass: se llama DESPUÉS de los bloques base de game.js (justo antes de solidifyFoe(e)).
// No añade daño ni proyectiles nuevos (reusa el ácido que ya escupe la planta); todo ataque lleva telegraph.
export const MICHI_AI_IDS = ["rana", "planta", "gaviota"];
const sgn = (v) => (v < 0 ? -1 : 1);
const cx = (o) => o.x + (o.w || 0) / 2, cy = (o) => o.y + (o.h || 0) / 2;
const ACID = "#7dca5a";

export function updateMichiFoeAI(e, game, t, aiTarget) {
  if (!e || !MICHI_AI_IDS.includes(e.kind) || game?.paused || e.dying || e.dead) return false;
  if (e.kind === "rana") rana(e, game, aiTarget);
  else if (e.kind === "planta") planta(e, game, aiTarget, t);
  else gaviota(e, game, aiTarget);
  return true;
}

// Rana: salto en arco que apunta a caer junto al jugador; de cerca, aviso 18f + lengüetazo que lo acerca un poco.
function rana(e, game, p) {
  if (!p) return;
  const dx = cx(p) - cx(e), dy = cy(p) - cy(e);
  if (e.vy <= -7 && !e._hopAimed) { e._hopAimed = true; e.vx = sgn(dx) * Math.max(1.6, Math.min(4.2, Math.abs(dx) / 34)); }
  if (e.vy >= 0) e._hopAimed = false;
  e.tongueCd = Math.max(0, (e.tongueCd || 0) - 1);
  if (e.tongueWind > 0) {
    e.tongueWind--; e.telegraph = true; e.vx *= 0.5; e.hopWind = 0; e.hopCd = Math.max(e.hopCd || 0, 20);
    e.tongueDir = sgn(dx);
    if (e.tongueWind === 0) { e.telegraph = false; e.tongueT = 14; e.tongueHit = false; }
    return;
  }
  if (e.tongueT > 0) {
    e.tongueT--; e.vx = 0; e.hopCd = Math.max(e.hopCd || 0, 20);
    const k = e.tongueT > 7 ? (14 - e.tongueT) / 7 : e.tongueT / 7; // sale y vuelve
    e.tongueLen = k * 110;
    e.tongueY = Math.max(-40, Math.min(20, dy));
    if (!e.tongueHit && k >= 0.95 && Math.abs(dx) < 120 && Math.abs(dy) < 56 && sgn(dx) === e.tongueDir) {
      e.tongueHit = true; p.vx = (p.vx || 0) - sgn(dx) * 3.2; // solo tirón, sin daño extra
      game.fx?.emit?.(cx(p), cy(p), { color: "#ff7aa8", count: 4, size: 2, up: 0.6, life: 10 });
    }
    if (e.tongueT === 0) { e.tongueLen = 0; e.tongueCd = 90; }
    return;
  }
  e.tongueLen = 0;
  if (e.grounded && !(e.hopWind > 0) && !e.tongueCd && Math.abs(dx) < 110 && Math.abs(dy) < 50 && !(e.stun > 5)) {
    e.tongueWind = 18; e.telegraph = true; e.tongueDir = sgn(dx);
  }
}

// Planta: enterrada (flag `burrowed`), asoma con aviso antes de salir, ácido en parábola y charco 1 s que frena.
function planta(e, game, p, t) {
  e.burrowed = !e.up;
  e.peek = e.burrowed && (e.hide || 0) > 86 ? Math.min(1, ((e.hide || 0) - 86) / 24) : 0;
  if (e.burrowed) e.telegraph = e.peek > 0;
  // Disparo detectado: plantWind pasó de 1 a 0 este frame → curvar el proyectil existente.
  if (e._pw === 1 && !(e.plantWind > 0)) {
    const list = game?.projectiles || [];
    for (let i = list.length - 1; i >= 0 && i >= list.length - 4; i--) {
      const pr = list[i];
      if (pr && pr.owner === "enemy" && pr.color === ACID && !pr._michiAcid) {
        pr._michiAcid = true; pr._floorY = e.y + e.h; pr.vy = -3.6; pr.vx = sgn(pr.vx || 1) * Math.max(2.4, Math.min(4.6, Math.abs(((p ? cx(p) : pr.x) - pr.x)) / 46));
        pr._owner = e; break;
      }
    }
  }
  e._pw = e.plantWind | 0;
  // Gravedad del ácido + charco al tocar el suelo (una vez por frame para todas las plantas).
  if (game && game._michiAcidTick !== t) {
    game._michiAcidTick = t;
    for (const pr of game.projectiles || []) {
      if (!pr || !pr._michiAcid || pr.life <= 0) continue;
      pr.vy += 0.16;
      if (pr.y + (pr.h || 0) >= pr._floorY && pr.vy > 0) {
        const o = pr._owner;
        if (o) { o.puddles = (o.puddles || []).filter((q) => q.t > 0).slice(-1); o.puddles.push({ x: pr.x + (pr.w || 0) / 2, y: pr._floorY, t: 60 }); }
        pr.life = 0;
      }
    }
  }
  if (e.puddles?.length) {
    for (const q of e.puddles) q.t--;
    e.puddles = e.puddles.filter((q) => q.t > 0);
    if (p && !p.dead) for (const q of e.puddles) if (Math.abs(cx(p) - q.x) < 26 && Math.abs(p.y + p.h - q.y) < 10) { p.vx *= 0.82; p._michiPuddleT = 6; }
  }
}

// Gaviota: círculos amplios, graznido como aviso (wind base) y picado; puede robar un cristal si el juego lleva contador.
function gaviota(e, game, p) {
  if (e._lastHp == null) e._lastHp = e.hp;
  if (e.hp < e._lastHp && e.stolen) { e.stolen = 0; e.returnT = 30; if (typeof game.crystals === "number") game.crystals++; }
  e._lastHp = e.hp;
  if (e.returnT > 0) e.returnT--;
  e.squawk = !!e.telegraph && !e.diving;
  if (!e.diving && !e.telegraph) {
    e.circleA = (e.circleA || 0) + 0.035;
    e.vx += Math.cos(e.circleA) * 0.09;
    e.baseY = (e.baseY ?? e.y) + Math.sin(e.circleA) * 0.5;
  }
  // Robo (stretch): solo si existe un contador numérico game.crystals.
  if (e.diving && p && !e.stolen && !(e.returnT > 0) && typeof game.crystals === "number" && game.crystals > 0
    && Math.abs(cx(p) - cx(e)) < 26 && Math.abs(cy(p) - cy(e)) < 26) {
    game.crystals--; e.stolen = 1;
  }
}
