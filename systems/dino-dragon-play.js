// V371 · Interacciones propias + acentos de J/K/L para Dragón y Dino.
// Solo visual: no hace daño, no toca hitbox, CD ni red. Sin gradientes por frame.
// 1) G = emote. 2) Aterrizaje fuerte. 3) Quieto 4 s. + marcas de impacto de J/K/L.
const TAU = Math.PI * 2;
const IDS = new Set(["dragon", "dino"]);
const MAX_FX = 14, MAX_MARKS = 8;
// Altura (px sobre los pies) a la que acaba la cabeza en cada forma, medida en render (incluye escala de evolución).
const LAND_TEXT_Y = [50, 62, 92, 126, 190];
let emoteQueued = false;
const st = { emote: 0, land: 0, idle: 0, still: 0, lastX: null, lastY: null, fallV: 0, wasAir: false, landX: 0, landY: 0, landEvo: 0 };
const FX = [];

export const DINO_DRAGON_PLAY = Object.freeze({
  dragon: Object.freeze(["G · ¡Anillos de humo!", "Aterrizaje · lluvia de brasas", "Quieto · llamita dormilona"]),
  dino: Object.freeze(["G · ¡Rugido con pisotón!", "Aterrizaje · polvo y grietas", "Quieto · siesta en el huevo"]),
});
export const DINO_DRAGON_ATTACK_FX = Object.freeze({
  dragon: Object.freeze({ breath: "¡CHAMUSCADO!", gust: "¡FIUUU!", meteor: "¡LLUVIA DE FUEGO!" }),
  dino: Object.freeze({ bite: "¡ÑAC!", charge: "¡EMBESTIDA!", quake: "¡CRAAC!" }),
});
const LIFE = { breath: 42, gust: 36, meteor: 60, bite: 32, charge: 50, quake: 60 };

let gameRef = null;
if (typeof addEventListener === "function") {
  addEventListener("keydown", (e) => {
    if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    if (String(e.key || "").toLowerCase() !== "g") return;
    if (e.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    if (gameRef?.paused || globalThis.game?.paused) return;
    emoteQueued = true;
  });
}
export function queueDinoDragonEmote() { emoteQueued = true; }
export function resetDinoDragonPlay() {
  emoteQueued = false; FX.length = 0;
  Object.assign(st, { emote: 0, land: 0, idle: 0, still: 0, lastX: null, lastY: null, fallV: 0, wasAir: false });
}

const alive = (e) => e && !e.dead && !(Number(e.hp) <= 0);
const ecx = (e) => e.x + (e.w || 0) / 2, ecy = (e) => e.y + (e.h || 0) / 2;
function pickTargets(g, p, kind, evo) {
  const f = p.facing || 1, px = p.x + p.w / 2, py = p.y + p.h / 2, out = [];
  for (const e of g.enemies || []) {
    if (!alive(e)) continue;
    const dx = (ecx(e) - px) * f, dy = ecy(e) - py, ad = Math.abs(dy);
    let ok = false;
    if (kind === "breath") ok = dx > -20 && dx < 110 + evo * 22 + 30 && ad < 16 + Math.max(0, dx) * 0.42 + (e.h || 0) / 2;
    else if (kind === "gust") ok = dx > -50 && dx < 230 + evo * 20 && ad < 110;
    else if (kind === "meteor") ok = Math.abs(ecx(e) - px) < 520 && ad < 260;
    else if (kind === "bite") ok = dx > -10 && dx < p.w / 2 + 42 + evo * 9 + 10 && ad < p.h / 2 + 14;
    else if (kind === "quake") ok = Math.abs(ecx(e) - px) < 520 + evo * 60 && ad < 120;
    if (ok) out.push(e);
    if (out.length >= MAX_MARKS) break;
  }
  return out;
}

/** Acento visual de J/K/L (slot 0/1/2). Se llama desde los casters de abilities.js. */
export function dinoDragonCast(g, p, kind, evo = 0) {
  if (!g || !p || !IDS.has(p.id) || !LIFE[kind]) return;
  const e = Math.max(0, Math.min(4, Number(evo) || 0));
  const life = LIFE[kind];
  while (FX.length >= MAX_FX) FX.shift();
  FX.push({ kind, life, max: life, evo: e, f: p.facing || 1, x: p.x + p.w / 2, y: p.y + p.h / 2, foot: p.y + p.h,
    targets: kind === "charge" ? [] : pickTargets(g, p, kind, e), touched: new Set(), actor: p, seed: (Number(g.t) || 0) % 97 });
  const lbl = (DINO_DRAGON_ATTACK_FX[p.id] || {})[kind];
  if (lbl) g.nums?.add?.(p.x + p.w / 2, p.y - 34, lbl, p.id === "dino" ? "#d8ff8a" : "#ffb347", true);
}

export function updateDinoDragonPlay(game) {
  if (game) gameRef = game;
  const p = game?.player;
  for (let i = FX.length - 1; i >= 0; i--) {
    const f = FX[i];
    if (--f.life <= 0 || f.actor !== p) { FX.splice(i, 1); continue; }
    if (f.kind === "breath" || f.kind === "charge" || f.kind === "bite") { f.x = p.x + p.w / 2; f.y = p.y + p.h / 2; f.foot = p.y + p.h; f.f = p.facing || 1; }
    if (f.kind === "charge" && f.touched.size < MAX_MARKS) {
      for (const e of game.enemies || []) {
        if (!alive(e) || f.touched.has(e)) continue;
        if (Math.abs(ecx(e) - f.x) < p.w / 2 + (e.w || 0) / 2 + 12 && Math.abs(ecy(e) - f.y) < p.h / 2 + (e.h || 0) / 2) { f.touched.add(e); f.targets.push(e); f.hitAt = f.hitAt || new Map(); f.hitAt.set(e, f.life); }
      }
    }
  }
  if (game?.paused) { emoteQueued = false; return; }
  if (!p || !IDS.has(p.id) || p.dead) { emoteQueued = false; st.emote = st.land = st.idle = 0; return; }
  if (emoteQueued) {
    emoteQueued = false;
    if (st.emote <= 0) {
      st.emote = 72;
      const dino = p.id === "dino";
      if (dino) game.shake = Math.min(10, (game.shake || 0) + 3);
      else if (p.grounded) p.vy = Math.min(p.vy || 0, -4);
      game.nums?.add?.(p.x + p.w / 2, p.y - 30, dino ? "¡ROAAAR!" : "¡PUF, PUF!", dino ? "#d8ff8a" : "#ffd36a", true);
    }
  }
  if (st.emote > 0) st.emote--;
  if (st.land > 0) st.land--;
  if (!p.grounded) st.fallV = Math.max(st.fallV, Number(p.vy) || 0);
  if (p.grounded && st.wasAir && st.fallV > 9 && st.land <= 0) {
    st.land = 46; st.landX = p.x + p.w / 2; st.landY = p.y + p.h; st.landEvo = Math.max(0, Math.min(4, Number(p.evo) || 0));
    game.shake = Math.min(10, (game.shake || 0) + (p.id === "dino" ? 4 : 2));
  }
  if (p.grounded) st.fallV = 0;
  st.wasAir = !p.grounded;
  const moved = st.lastX == null || Math.abs(p.x - st.lastX) > 0.4 || Math.abs(p.y - st.lastY) > 0.4;
  st.lastX = p.x; st.lastY = p.y;
  st.still = moved || !p.grounded ? 0 : st.still + 1;
  st.idle = st.still > 240 ? Math.min(60, st.idle + 2) : Math.max(0, st.idle - 4);
}

function label(ctx, txt, x, y, fill, edge, size = 14) {
  ctx.font = `900 ${size}px system-ui,sans-serif`; ctx.textAlign = "center";
  ctx.lineWidth = 4; ctx.strokeStyle = edge; ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
}
function flameTongue(ctx, x, y, s, fill, core) {
  ctx.fillStyle = fill; ctx.beginPath();
  ctx.moveTo(x, y - 12 * s); ctx.quadraticCurveTo(x + 7 * s, y - 3 * s, x + 5 * s, y + 3 * s);
  ctx.quadraticCurveTo(x, y + 7 * s, x - 5 * s, y + 3 * s); ctx.quadraticCurveTo(x - 7 * s, y - 3 * s, x, y - 12 * s); ctx.fill();
  ctx.fillStyle = core; ctx.beginPath(); ctx.ellipse(x, y + 1 * s, 2.4 * s, 3.6 * s, 0, 0, TAU); ctx.fill();
}
function crack(ctx, x, y, dir, len, seed) {
  // Grieta oscura con borde claro para que se lea sobre cualquier suelo.
  const ink = ctx.strokeStyle, lw = ctx.lineWidth;
  ctx.strokeStyle = "#ffe0a0"; ctx.lineWidth = lw + 3; crackPath(ctx, x, y, dir, len, seed);
  ctx.strokeStyle = ink; ctx.lineWidth = lw; crackPath(ctx, x, y, dir, len, seed);
}
function crackPath(ctx, x, y, dir, len, seed) {
  ctx.beginPath(); ctx.moveTo(x, y);
  let cx = x, cy = y;
  for (let i = 1; i <= 4; i++) { cx += dir * len / 4; cy = y - ((i + seed) % 2 ? 3 : -1); ctx.lineTo(cx, cy); }
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + dir * len * 0.5, y - 1); ctx.lineTo(x + dir * len * 0.62, y - 7); ctx.stroke();
}

function drawAttackFx(ctx, f, cam, t) {
  const k = 1 - f.life / f.max, fade = Math.min(1, f.life / 10), s = 1 + f.evo * 0.12;
  const x = f.x - cam.x, y = f.y - cam.y, foot = f.foot - cam.y;
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (f.kind === "breath") {
    // Bocanada: aros de calor que viajan + humo y brasas sobre cada bicho alcanzado.
    ctx.globalAlpha = 0.7 * fade; ctx.strokeStyle = "#ffd36a"; ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) { const q = (k * 1.4 + i * 0.3) % 1, d = 20 + q * (110 + f.evo * 22);
      ctx.beginPath(); ctx.ellipse(x + f.f * d, y, 6 + q * 8, 10 + q * 22 * s, 0, 0, TAU); ctx.stroke(); }
    for (const e of f.targets) { if (!alive(e)) continue; const ex = ecx(e) - cam.x, ey = ecy(e) - cam.y;
      ctx.globalAlpha = fade; ctx.strokeStyle = "#ff6a2a"; ctx.lineWidth = 3 * (1 - k) + 1.5;
      ctx.beginPath(); ctx.arc(ex, ey, 10 + k * 22, 0, TAU); ctx.stroke();
      for (let i = 0; i < 3; i++) flameTongue(ctx, ex - 10 + i * 10, ey - (e.h || 20) / 2 - 2 - k * 14 - (i % 2) * 5, 0.75, "#ff8a2a", "#fff3b0");
      ctx.fillStyle = "rgba(80,70,70,.55)"; ctx.beginPath(); ctx.arc(ex + 6, ey - (e.h || 20) / 2 - 20 - k * 24, 5 + k * 8, 0, TAU); ctx.fill(); }
  } else if (f.kind === "gust") {
    // Ráfaga: remolino que se eleva + espirales sobre los bichos empujados.
    ctx.globalAlpha = 0.85 * fade; ctx.strokeStyle = "#e8fbff"; ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) { const yy = foot - i * 16 - k * 30, r = (14 + i * 9) * s;
      ctx.beginPath(); ctx.ellipse(x, yy, r, r * 0.3, 0, t * 0.3 + i, t * 0.3 + i + TAU * 0.7); ctx.stroke(); }
    for (const e of f.targets) { if (!alive(e)) continue; const ex = ecx(e) - cam.x, ey = ecy(e) - cam.y;
      ctx.strokeStyle = "#bfefff"; ctx.lineWidth = 2.5;
      for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(ex - f.f * (8 + i * 10), ey - 6 + i * 12, 7 + k * 5, k * 8 + i, k * 8 + i + TAU * 0.75); ctx.stroke(); }
      ctx.beginPath(); for (let i = -1; i <= 1; i++) { ctx.moveTo(ex - f.f * 30, ey + i * 10); ctx.lineTo(ex - f.f * (12 + k * 10), ey + i * 10); } ctx.stroke(); }
  } else if (f.kind === "meteor") {
    // Meteoro: grieta en el cielo + diana roja sobre cada objetivo durante 1 s.
    ctx.globalAlpha = 0.8 * fade; ctx.strokeStyle = "#ff6a2a"; ctx.lineWidth = 3;
    const sky = 26;
    ctx.beginPath(); ctx.moveTo(x - 90, sky); for (let i = 1; i <= 6; i++) ctx.lineTo(x - 90 + i * 30, sky + ((i % 2) ? 9 : -2) * Math.min(1, k * 3)); ctx.stroke();
    ctx.strokeStyle = "#fff3b0"; ctx.lineWidth = 1.5; ctx.stroke();
    for (const e of f.targets) { if (!alive(e)) continue; const ex = ecx(e) - cam.x, ey = ecy(e) - cam.y, rr = 22 - k * 8;
      ctx.globalAlpha = fade * (0.6 + 0.4 * Math.abs(Math.sin(t * 0.3))); ctx.strokeStyle = "#ff3b2a"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(ex, ey, rr, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex - rr - 6, ey); ctx.lineTo(ex - rr + 6, ey); ctx.moveTo(ex + rr - 6, ey); ctx.lineTo(ex + rr + 6, ey);
      ctx.moveTo(ex, ey - rr - 6); ctx.lineTo(ex, ey - rr + 6); ctx.moveTo(ex, ey + rr - 6); ctx.lineTo(ex, ey + rr + 6); ctx.stroke(); }
  } else if (f.kind === "bite") {
    // Mordisco: mandíbula fantasma que se cierra + marcas de dientes en el bicho.
    const close = Math.min(1, k * 3), mx = x + f.f * (26 + f.evo * 5), open = (1 - close) * 20 * s + 2, w = 24 * s;
    ctx.globalAlpha = 0.9 * fade; ctx.fillStyle = "#f6ffe8"; ctx.strokeStyle = "#2f4a1f"; ctx.lineWidth = 2.5;
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(mx - w, y + sg * open);
      for (let i = 0; i <= 4; i++) { const tx = mx - w + i * w / 2; ctx.lineTo(tx, y + sg * open); if (i < 4) ctx.lineTo(tx + w / 4, y + sg * (open - 9 * s)); }
      ctx.lineTo(mx + w, y + sg * (open + 8)); ctx.lineTo(mx - w, y + sg * (open + 8)); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    for (const e of f.targets) { if (!alive(e)) continue; const ex = ecx(e) - cam.x, ey = ecy(e) - cam.y;
      ctx.globalAlpha = fade; ctx.strokeStyle = "#e8ffe0"; ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(ex + i * 8 - 3, ey - 8); ctx.lineTo(ex + i * 8 + 3, ey + 6); ctx.stroke(); }
      ctx.strokeStyle = "#b9f989"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ex, ey, 12 + k * 18, 0, TAU); ctx.stroke(); }
  } else if (f.kind === "charge") {
    // Embestida: nubes de polvo detrás + líneas de velocidad + estrellitas al chocar.
    ctx.globalAlpha = 0.75 * fade; ctx.fillStyle = "#d8c7a4";
    for (let i = 0; i < 4; i++) { const q = ((t * 0.08 + i * 0.25) % 1); ctx.globalAlpha = 0.6 * fade * (1 - q);
      ctx.beginPath(); ctx.arc(x - f.f * (20 + q * 40 + i * 6), foot - 6 - q * 10, (6 + q * 10) * s, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 0.8 * fade; ctx.strokeStyle = "#f2ffd6"; ctx.lineWidth = 2.5;
    for (let i = 0; i < 3; i++) { const yy = y - 14 + i * 14, l = 22 + ((t + i * 7) % 12);
      ctx.beginPath(); ctx.moveTo(x - f.f * 26, yy); ctx.lineTo(x - f.f * (26 + l), yy); ctx.stroke(); }
    for (const e of f.targets) { if (!alive(e)) continue; const age = (f.hitAt?.get(e) ?? f.life) - f.life; if (age > 30) continue;
      const ex = ecx(e) - cam.x, ey = e.y - cam.y - 8, q = age / 30; ctx.globalAlpha = 1 - q; ctx.fillStyle = "#fff36a";
      for (let i = 0; i < 3; i++) { const a = t * 0.2 + i * TAU / 3; star(ctx, ex + Math.cos(a) * 14, ey + Math.sin(a) * 5, 4); } }
  } else if (f.kind === "quake") {
    // Terremoto: grietas que se abren desde Dino + rocas que saltan bajo los bichos.
    const reach = (90 + f.evo * 20) * Math.min(1, k * 2.2);
    ctx.globalAlpha = 0.9 * fade; ctx.strokeStyle = "#3a2410"; ctx.lineWidth = 3;
    for (const d of [-1, 1]) { crack(ctx, x, foot, d, reach, f.seed); crack(ctx, x + d * reach * 0.4, foot, d, reach * 0.5, f.seed + 1); }
    ctx.strokeStyle = "#ffc36c"; ctx.lineWidth = 2; ctx.globalAlpha = 0.6 * (1 - k);
    ctx.beginPath(); ctx.ellipse(x, foot, 20 + k * 120 * s, 5 + k * 12, 0, 0, TAU); ctx.stroke();
    for (const e of f.targets) { if (!alive(e)) continue; const ex = ecx(e) - cam.x, ef = e.y + (e.h || 0) - cam.y;
      const hop = Math.sin(Math.min(1, k * 2) * Math.PI) * 16; ctx.globalAlpha = fade; ctx.fillStyle = "#8a6a3a"; ctx.strokeStyle = "#3a2a10"; ctx.lineWidth = 1.5;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.rect(ex + i * 11 - 4, ef - 6 - hop * (1 - Math.abs(i) * 0.4), 8, 7); ctx.fill(); ctx.stroke(); }
      ctx.strokeStyle = "#3a2410"; ctx.lineWidth = 2.5; crack(ctx, ex - 14, ef, 1, 28, f.seed); }
  }
  ctx.restore();
}
function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}

export function drawDinoDragonPlay(ctx, game, t) {
  const p = game?.player;
  const cam = game?.cam || { x: 0, y: 0 };
  for (const f of FX) drawAttackFx(ctx, f, cam, t);
  if (!p || !IDS.has(p.id) || p.dead) return;
  if (!(st.emote > 0 || st.land > 0 || st.idle > 0)) return;
  const x = p.x + p.w / 2 - cam.x, top = p.y - cam.y, mid = p.y + p.h / 2 - cam.y, feet = p.y + p.h - cam.y;
  const dino = p.id === "dino", face = p.facing || 1, evo = Math.max(0, Math.min(4, Number(p.evo) || 0));
  const mouthX = x + face * p.w * 0.5, mouthY = top + p.h * 0.3;
  ctx.save(); ctx.lineCap = "round";
  if (st.emote > 0) {
    const u = 1 - st.emote / 72, fade = Math.min(1, st.emote / 14);
    ctx.globalAlpha = fade;
    if (!dino) {
      // Tres anillos de humo que salen de la boca, crecen y se deshacen.
      for (let i = 0; i < 3; i++) { const q = Math.max(0, Math.min(1, u * 1.6 - i * 0.28)); if (q <= 0) continue;
        ctx.globalAlpha = fade * (1 - q) * 0.95; ctx.strokeStyle = i === 1 ? "#d9d4d0" : "#b8b0aa"; ctx.lineWidth = 5 - q * 2;
        ctx.beginPath(); ctx.ellipse(mouthX + face * (10 + q * 70), mouthY - q * 46, 6 + q * 14, 4 + q * 10, 0, 0, TAU); ctx.stroke(); }
      ctx.globalAlpha = fade; if (u < 0.35) flameTongue(ctx, mouthX + face * 6, mouthY, 0.6, "#ff8a2a", "#fff3b0");
    } else {
      // Rugido: ondas en arco desde la boca + pisotón con polvo.
      ctx.strokeStyle = "#e8ffb0"; ctx.lineWidth = 4;
      for (let i = 0; i < 3; i++) { const q = (u * 1.5 + i * 0.22) % 1, r = 14 + q * 70;
        ctx.globalAlpha = fade * (1 - q); ctx.beginPath();
        ctx.arc(mouthX, mouthY, r, face > 0 ? -0.7 : Math.PI - 0.7, face > 0 ? 0.7 : Math.PI + 0.7); ctx.stroke(); }
      const stomp = Math.max(0, Math.min(1, (u - 0.15) * 3));
      ctx.globalAlpha = fade * (1 - stomp) ; ctx.fillStyle = "#d8c7a4";
      for (const d of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + d * (12 + stomp * 34 + i * 10), feet - 4 - stomp * 8, 4 + stomp * 5, 0, TAU); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }
  if (st.land > 0) {
    const u = 1 - st.land / 46, fade = st.land / 46, lx = st.landX - cam.x, ly = st.landY - cam.y;
    // Texto sobre la cabeza: escala con la altura visual de la forma (el arte sobresale del hitbox).
    const landHead = Math.max(p.h + 28, LAND_TEXT_Y[evo]);
    ctx.globalAlpha = fade;
    if (!dino) {
      // Brasas que saltan y caen + un aro de calor en el suelo.
      ctx.strokeStyle = "#ff8a2a"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(lx, ly - 1, 16 + u * 36, 3 + u * 3, 0, 0, TAU); ctx.stroke();
      for (let i = 0; i < 7; i++) { const d = i - 3, gx = lx + d * (8 + u * 12), gy = ly - 4 - Math.sin(Math.min(1, u * 1.2) * Math.PI) * (20 + (3 - Math.abs(d)) * 6);
        ctx.fillStyle = i % 2 ? "#ffd36a" : "#ff5a24"; ctx.beginPath(); ctx.arc(gx, gy, 2.5 + (i % 3) * 0.6, 0, TAU); ctx.fill(); }
      if (u < 0.6) label(ctx, "¡CHISS!", lx, ly - landHead, "#ffd36a", "#5a1a08");
    } else {
      // Polvo a los lados + grietas en el suelo (más largas en formas grandes).
      ctx.fillStyle = "#d8c7a4";
      for (const d of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(lx + d * (14 + u * 40 + i * 9), ly - 5 - u * 8 - i * 2, 5 + u * 6 - i, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = "#3a2410"; ctx.lineWidth = 2.5;
      const len = (30 + st.landEvo * 10) * Math.min(1, u * 3);
      for (const d of [-1, 1]) crack(ctx, lx, ly, d, len, 0);
      if (u < 0.6) label(ctx, "¡PUMBA!", lx, ly - landHead, "#d8ff8a", "#2f4a1f");
    }
    ctx.globalAlpha = 1;
  }
  if (st.idle > 0) {
    const k = st.idle / 60;
    ctx.globalAlpha = k;
    if (!dino) {
      // Llamita dormilona: una llama pequeña que respira en la nariz + "zZ".
      const b = 0.55 + Math.abs(Math.sin(t * 0.05)) * 0.35;
      flameTongue(ctx, mouthX + face * 4, mouthY - 4, b, "#ff8a2a", "#fff3b0");
      ctx.fillStyle = "rgba(190,180,175,.6)";
      for (let i = 0; i < 2; i++) { const ph = ((t * 0.6 + i * 40) % 80) / 80; ctx.globalAlpha = k * (1 - ph) * 0.7;
        ctx.beginPath(); ctx.arc(mouthX + face * 6, mouthY - 14 - ph * 30, 3 + ph * 5, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = k; label(ctx, "zZ…", x + face * 26, top - 8 - Math.sin(t * 0.06) * 3, "#ffe8b0", "#5a1a08");
    } else {
      // Siesta en el huevo: media cáscara a sus pies y la cola que se mece.
      const wag = Math.sin(t * 0.12) * 10;
      ctx.fillStyle = "#fffaf0"; ctx.strokeStyle = "#5a5040"; ctx.lineWidth = 2;
      const w = p.w * 0.62 + evo * 2;
      ctx.beginPath(); ctx.moveTo(x - w, feet - 2); ctx.quadraticCurveTo(x - w, feet - 20, x - w * 0.6, feet - 18);
      for (let i = 0; i < 5; i++) ctx.lineTo(x - w * 0.6 + (i + 0.5) * w * 0.24, feet - (i % 2 ? 26 : 16));
      ctx.lineTo(x + w * 0.6, feet - 18); ctx.quadraticCurveTo(x + w, feet - 20, x + w, feet - 2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#b9f989"; ctx.beginPath(); ctx.arc(x - w * 0.4, feet - 9, 3, 0, TAU); ctx.arc(x + w * 0.3, feet - 7, 2.5, 0, TAU); ctx.fill();
      ctx.strokeStyle = "#e8ffb0"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x - face * (p.w * 0.6), feet - 22, 8, -0.8 + wag * 0.05, 0.8 + wag * 0.05); ctx.stroke();
      label(ctx, "a mimir…", x, top - 14 - Math.sin(t * 0.06) * 3, "#e8ffb0", "#2f4a1f");
    }
  }
  ctx.restore();
}
