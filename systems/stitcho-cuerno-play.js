// V371 · Momentos de Stitcho y Cuerno: 3 interacciones por personaje + pulido
// visual de J/K/L/U. Solo visual (sin daño ni CD). Colores planos, sin
// gradientes, partículas acotadas (MAX_MOMENTS).
const TAU = Math.PI * 2;
const MAX_MOMENTS = 24;
const EMOTE_KEY = "g";
const IDS = new Set(["stitcho", "cuerno"]);
const M = [];
let lastGame = null, installed = false, emoteQueued = false;
const cxp = (p) => p.x + p.w / 2;
const cyp = (p) => p.y + p.h / 2;
const evoOf = (p) => Math.max(0, Math.min(4, Number(p?.evo) || 0));
const STITCHO_COLS = ["#7fe9ff", "#62f3ff", "#3fd8ff", "#4ad2ff", "#c5a8ff"];
const CUERNO_COLS = ["#ffe6ac", "#f3c9eb", "#d6ceff", "#b7e9f4", "#fff1ad"];
const IRIS = ["#ff8cab", "#ffc28e", "#ffe9a3", "#9de7bb", "#a5e5fa", "#aeb9fb", "#e5b9f4"];

function push(f) {
  M.push(f);
  if (M.length > MAX_MOMENTS) M.splice(0, M.length - MAX_MOMENTS);
  return f;
}
export function clearMoments() { M.length = 0; }
export function momentCount() { return M.length; }

/** Tecla G: emote propio. Se instala una sola vez; no roba teclas existentes. */
const nowMs = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
let emoteAt = 0;
/** Igual que canAct() de game.js: sin pausa, overlays, pestaña oculta ni foco en campos de texto/chat. */
export function defaultMomentCanAct(doc = typeof document !== "undefined" ? document : null) {
  if (!lastGame?.running) return false;
  if (!doc) return true;
  if (doc.hidden) return false;
  for (const id of ["pause-overlay", "help", "map-overlay"]) if (doc.getElementById?.(id)?.classList?.contains("open")) return false;
  const a = doc.activeElement;
  if (a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName || "") || a.closest?.("[contenteditable='true'], .chat, #chat"))) return false;
  return true;
}
export function installMomentKeys(target = typeof window !== "undefined" ? window : null, { canAct = defaultMomentCanAct } = {}) {
  if (installed || !target?.addEventListener) return false;
  installed = true;
  target.addEventListener("keydown", (e) => {
    if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    if (String(e.key || "").toLowerCase() !== EMOTE_KEY) return;
    if (e.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    if (e.target?.closest?.("[contenteditable='true'], .chat, #chat")) return;
    if (!lastGame?.running || !IDS.has(lastGame.player?.id) || !canAct()) return;
    emoteQueued = true; emoteAt = nowMs();
  });
  return true;
}
export function requestMomentEmote() { emoteQueued = true; emoteAt = nowMs(); }

/** Hook visual desde los casters (J=0, K=1, L=2, U=3). */
export function momentCast(g, p, slot, evo = evoOf(p)) {
  if (!p || !IDS.has(p.id)) return null;
  const x = cxp(p), y = cyp(p), face = p.facing === -1 ? -1 : 1;
  const col = (p.id === "stitcho" ? STITCHO_COLS : CUERNO_COLS)[evo];
  return push({ kind: p.id + "Cast" + slot, x, y, face, evo, col, actor: p, life: [22, 30, 40, 60][slot] || 24, max: [22, 30, 40, 60][slot] || 24 });
}

function nearSleeper(g, p, r) {
  for (const e of g.enemies || []) {
    if (!e || e.dead || e.dying || !(e.hp > 0)) continue;
    const asleep = (Number(e.stun) || 0) > 20 || (Number(e._auroraSleepT) || 0) > 0;
    if (asleep && Math.hypot(cxp(e) - cxp(p), cyp(e) - cyp(p)) < r) return e;
  }
  return null;
}

export function updateMoments(g) {
  lastGame = g;
  if (!installed) installMomentKeys();
  const p = g?.player;
  for (let i = M.length - 1; i >= 0; i--) {
    const f = M[i];
    if (f.actor && !f.actor.dead && f.follow) { f.x = cxp(f.actor); f.y = cyp(f.actor); }
    if (--f.life <= 0) M.splice(i, 1);
  }
  if (!p || p.dead || !IDS.has(p.id)) { emoteQueued = false; return; }
  const evo = evoOf(p), t = Number(g.t) || 0, st = (p._moments ||= { wall: 0, air: false, poke: 0, emote: 0 });
  // 1) Tocar el mundo
  if (p.id === "stitcho") {
    if (p.wall && !st.wall) push({ kind: "stitchoWallGrab", x: p.wall < 0 ? p.x + p.w : p.x, y: cyp(p), side: p.wall, evo, life: 26, max: 26 });
    st.wall = p.wall || 0;
  } else {
    const air = !p.grounded;
    if (st.air && !air && Math.abs(p.vy || 0) < 30) push({ kind: "cuernoBloom", x: cxp(p), y: p.y + p.h, evo, life: 46, max: 46 });
    st.air = air;
  }
  // 2) Emote con G
  // Una pulsación vieja (p.ej. hecha justo antes de pausar) caduca a los 250 ms.
  if (emoteQueued && nowMs() - emoteAt > 250) emoteQueued = false;
  if (emoteQueued && t - st.emote > 40) {
    st.emote = t;
    push({ kind: p.id === "stitcho" ? "stitchoTaunt" : "cuernoBow", x: cxp(p), y: p.y, evo, actor: p, follow: true, life: 70, max: 70 });
    p._emoteT = 70;
  }
  emoteQueued = false;
  // 3) Con otro personaje: bicho dormido/aturdido cerca
  if (t - st.poke > 90) {
    const e = nearSleeper(g, p, 70 + evo * 10);
    if (e) { st.poke = t; push({ kind: p.id === "stitcho" ? "stitchoPoke" : "cuernoLullaby", x: cxp(e), y: e.y, evo, enemy: e, life: 60, max: 60 }); }
  }
  if (p._emoteT > 0) p._emoteT--;
}

function bubble(ctx, x, y, text, fill, ink) {
  ctx.font = "800 13px Outfit,system-ui,sans-serif"; ctx.textAlign = "center";
  const w = ctx.measureText(text).width + 14;
  ctx.fillStyle = fill; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(x, y, w / 2, 12, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 4, y + 11); ctx.lineTo(x, y + 19); ctx.lineTo(x + 5, y + 10); ctx.fill();
  ctx.fillStyle = ink; ctx.fillText(text, x, y + 4.5);
}

const DRAW = {
  stitchoWallGrab(ctx, f, x, y, k) {
    const c = STITCHO_COLS[f.evo]; ctx.strokeStyle = c; ctx.lineWidth = 2.4; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) { const yy = y - 10 + i * 10; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x - f.side * (8 + k * 14), yy - 3 + i * 3); ctx.stroke(); }
    if (k < .5) bubble(ctx, x - f.side * 20, y - 34, "¡Pared!", "#e8ffff", "#1b2460");
  },
  cuernoBloom(ctx, f, x, y, k) {
    const n = 7 + f.evo, s = 1 + f.evo * .12;
    ctx.strokeStyle = "#5b3a7a"; ctx.lineWidth = 1.6;
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (i + .5) * Math.PI / n, r = 8 + k * (22 + f.evo * 5);
      ctx.fillStyle = IRIS[i % 7]; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r * .55, 6 * s, 3.4 * s, a, 0, TAU); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = "#fff6c8"; ctx.beginPath(); ctx.arc(x, y - 2, 3.5 * s, 0, TAU); ctx.fill(); ctx.stroke();
  },
  stitchoTaunt(ctx, f, x, y, k) {
    bubble(ctx, x, y - 30 - Math.sin(k * Math.PI) * 6, ["¡Bleh!", "¡Aloha, bobo!", "¡Ñam ñam!"][f.evo % 3], "#e8ffff", "#1b2460");
    ctx.strokeStyle = STITCHO_COLS[f.evo]; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + k * 6; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 14, y - 8 + Math.sin(a) * 8); ctx.lineTo(x + Math.cos(a) * 20, y - 8 + Math.sin(a) * 12); ctx.stroke(); }
  },
  cuernoBow(ctx, f, x, y, k) {
    bubble(ctx, x, y - 30, ["¡Hola!", "¡Brillo!", "Reverencia", "A tus órdenes", "Noche estelar"][f.evo], "#fff8e6", "#5b3a7a");
    for (let i = 0; i < 3 + f.evo; i++) { const a = k * 4 + i * TAU / (3 + f.evo); ctx.fillStyle = IRIS[i % 7]; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 22, y - 4 + Math.sin(a) * 9, 2.4, 0, TAU); ctx.fill(); }
  },
  stitchoPoke(ctx, f, x, y, k) {
    if (f.enemy && !f.enemy.dead) { f.x = cxp(f.enemy); f.y = f.enemy.y; }
    bubble(ctx, x, y - 22 - k * 8, "¿Hola? *toc toc*", "#e8ffff", "#1b2460");
  },
  cuernoLullaby(ctx, f, x, y, k) {
    if (f.enemy && !f.enemy.dead) { f.x = cxp(f.enemy); f.y = f.enemy.y; }
    // notas dibujadas (círculo + palito + banderita), sin depender de la fuente
    ctx.strokeStyle = "#5b3a7a"; ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      const u = (k + i / 3) % 1, nx = x - 12 + i * 12, ny = y - 8 - u * 26;
      ctx.fillStyle = IRIS[(i * 2) % 7];
      ctx.beginPath(); ctx.ellipse(nx, ny, 3.6, 2.8, -.4, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(nx + 3.2, ny - 1); ctx.lineTo(nx + 3.2, ny - 13); ctx.quadraticCurveTo(nx + 8, ny - 11, nx + 8, ny - 6); ctx.stroke();
    }
  },
};
function castDraw(ctx, f, x, y, k) {
  const c = f.col, s = 1 + f.evo * .15, slot = Number(f.kind.slice(-1));
  ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineCap = "round";
  if (f.kind.startsWith("stitcho")) {
    if (slot === 0) { ctx.lineWidth = 3 - k * 2; ctx.beginPath(); ctx.arc(x + f.face * 18, y - 6, (6 + k * 18) * s, 0, TAU); ctx.stroke(); }
    else if (slot === 1) { ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = i * TAU / 6; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 10 * s, y + 10); ctx.lineTo(x + Math.cos(a) * (14 + k * 24) * s, y + 12 + Math.sin(a) * 4); ctx.stroke(); } }
    else if (slot === 2) { ctx.lineWidth = 2.6; for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + k * 3, r = (16 + k * 30) * s; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r - Math.sin(a) * 4, y + Math.sin(a) * r + Math.cos(a) * 4); ctx.lineTo(x + Math.cos(a) * r + Math.sin(a) * 4, y + Math.sin(a) * r - Math.cos(a) * 4); ctx.stroke(); } }
    else { ctx.font = "900 16px Outfit,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.strokeStyle = "#1b2460"; ctx.lineWidth = 3; ctx.strokeText("¡CAOS!", x, y - 52 - k * 10); ctx.fillText("¡CAOS!", x, y - 52 - k * 10); }
  } else {
    if (slot === 0) { ctx.lineWidth = 2.4; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x + f.face * 14, y - 8); ctx.lineTo(x + f.face * (24 + k * 30) * s, y - 8 + i * (4 + k * 8)); ctx.stroke(); } }
    else if (slot === 1) { for (let i = 0; i < 4; i++) { ctx.fillStyle = IRIS[(i * 2) % 7]; ctx.beginPath(); ctx.ellipse(x - f.face * (8 + i * 10 + k * 10), y + 14, 4, 2.4, 0, 0, TAU); ctx.fill(); } }
    else if (slot === 2) { ctx.lineWidth = 3 - k * 2; for (let i = 0; i < 3; i++) { ctx.strokeStyle = IRIS[i * 2]; ctx.beginPath(); ctx.arc(x, y, (20 + i * 8 + k * 40) * s, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } }
    else { ctx.font = "900 15px Outfit,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.strokeStyle = "#5b3a7a"; ctx.lineWidth = 3; ctx.fillStyle = "#fff6c8"; const ty = y + 46 + f.evo * 2 + k * 4; /* bajo los cascos: libre del rótulo del dúo y de la nube */ ctx.strokeText("Dulces sueños", x, ty); ctx.fillText("Dulces sueños", x, ty); }
  }
}
export function drawMoments(ctx, g, t) {
  if (!M.length || !g) return;
  const cam = g.cam || { x: 0, y: 0 };
  for (const f of M) {
    const k = 1 - f.life / f.max;
    ctx.save(); ctx.globalAlpha = Math.min(1, f.life / 10, (f.max - f.life + 1) / 4);
    const x = f.x - cam.x, y = f.y - cam.y;
    if (DRAW[f.kind]) DRAW[f.kind](ctx, f, x, y, k); else castDraw(ctx, f, x, y, k);
    ctx.restore();
  }
}
