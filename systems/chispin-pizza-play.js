// V371 · 3 interacciones propias para Chispín y Pizza. Solo visual + pequeño salto.
// 1) G = emote con tecla. 2) Aterrizaje fuerte = reacción al suelo. 3) Quieto 4 s = gesto de espera.
// Sin gradientes por frame, sin daño, sin red. Máx. 1 efecto por tipo a la vez.
const TAU = Math.PI * 2;
const IDS = new Set(["chispin", "pizza"]);
let emoteQueued = false;
const st = { emote: 0, land: 0, idle: 0, still: 0, lastX: null, lastY: null, fallV: 0, wasAir: false, landX: 0, landY: 0, seed: 0 };

export const CHISPIN_PIZZA_PLAY = Object.freeze({
  chispin: Object.freeze(["G · ¡Chispa-chispa!", "Aterrizaje · descarga a tierra", "Quieto · carga de mejillas"]),
  pizza: Object.freeze(["G · ¡Masa al aire!", "Aterrizaje · salpicón de queso", "Quieto · recién horneada"]),
});

if (typeof addEventListener === "function") {
  addEventListener("keydown", (e) => {
    if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    if (String(e.key || "").toLowerCase() !== "g") return;
    if (e.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    emoteQueued = true;
  });
}
export function queueChispinPizzaEmote() { emoteQueued = true; }

export function resetChispinPizzaPlay() {
  emoteQueued = false;
  Object.assign(st, { emote: 0, land: 0, idle: 0, still: 0, lastX: null, lastY: null, fallV: 0, wasAir: false });
}

export function updateChispinPizzaPlay(game) {
  const p = game?.player;
  if (game?.paused) { emoteQueued = false; return; }
  if (!p || !IDS.has(p.id) || p.dead) { emoteQueued = false; st.emote = st.land = st.idle = 0; return; }
  if (emoteQueued) {
    emoteQueued = false;
    if (st.emote <= 0) {
      st.emote = 72;
      st.seed = (st.seed + 1) % 997;
      if (p.grounded) p.vy = Math.min(p.vy || 0, -5.5);
      game.nums?.add?.(p.x + p.w / 2, p.y - 30, p.id === "chispin" ? "¡CHISPA-CHISPA!" : "¡MASA AL AIRE!", p.id === "chispin" ? "#fff36a" : "#ffd84a", true);
    }
  }
  if (st.emote > 0) st.emote--;
  if (st.land > 0) st.land--;
  // Aterrizaje fuerte: venía cayendo rápido y ahora toca suelo.
  if (!p.grounded) st.fallV = Math.max(st.fallV, Number(p.vy) || 0);
  if (p.grounded && st.wasAir && st.fallV > 9 && st.land <= 0) {
    st.land = 40; st.landX = p.x + p.w / 2; st.landY = p.y + p.h;
    game.shake = Math.min(10, (game.shake || 0) + 2);
  }
  if (p.grounded) st.fallV = 0;
  st.wasAir = !p.grounded;
  // Quieto: sin moverse 4 s (240 frames).
  const moved = st.lastX == null || Math.abs(p.x - st.lastX) > 0.4 || Math.abs(p.y - st.lastY) > 0.4;
  st.lastX = p.x; st.lastY = p.y;
  st.still = moved || !p.grounded ? 0 : st.still + 1;
  st.idle = st.still > 240 ? Math.min(60, st.idle + 2) : Math.max(0, st.idle - 4);
}

function label(ctx, txt, x, y, fill, edge) {
  ctx.font = "900 14px system-ui,sans-serif"; ctx.textAlign = "center";
  ctx.lineWidth = 4; ctx.strokeStyle = edge; ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
}
function bolt(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x - 3 * s, y - 8 * s); ctx.lineTo(x + 4 * s, y - 8 * s); ctx.lineTo(x, y - 1 * s);
  ctx.lineTo(x + 4 * s, y - 1 * s); ctx.lineTo(x - 3 * s, y + 9 * s); ctx.lineTo(x - 1 * s, y + 2 * s);
  ctx.lineTo(x - 5 * s, y + 2 * s); ctx.closePath(); ctx.fill();
}

export function drawChispinPizzaPlay(ctx, game, t) {
  const p = game?.player;
  if (!p || !IDS.has(p.id) || p.dead) return;
  if (!(st.emote > 0 || st.land > 0 || st.idle > 0)) return;
  const cam = game.cam || { x: 0, y: 0 };
  const x = p.x + p.w / 2 - cam.x, top = p.y - cam.y, mid = p.y + p.h / 2 - cam.y, feet = p.y + p.h - cam.y;
  const chis = p.id === "chispin";
  ctx.save();
  if (st.emote > 0) {
    const u = 1 - st.emote / 72; // 0→1 en 1,2 s
    const fade = Math.min(1, st.emote / 14);
    ctx.globalAlpha = fade;
    if (chis) {
      // Anillo que se abre + 8 rayitos girando + "estrellas" de chispa.
      ctx.strokeStyle = "#fff36a"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(x, mid, 18 + u * 46, 0, TAU); ctx.stroke();
      ctx.fillStyle = "#ffe14a";
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * TAU + u * 3, r = 26 + u * 40;
        bolt(ctx, x + Math.cos(a) * r, mid + Math.sin(a) * r, 0.9);
      }
      ctx.fillStyle = "#ff5a5a";
      ctx.beginPath(); ctx.arc(x - 9, top + p.h * 0.32, 4 + Math.sin(t * 0.6) * 1.5, 0, TAU); ctx.arc(x + 9, top + p.h * 0.32, 4 + Math.sin(t * 0.6) * 1.5, 0, TAU); ctx.fill();
    } else {
      // La masa sube girando y vuelve: disco que se estira.
      const h = Math.sin(u * Math.PI) * 70, rx = 22 + Math.sin(u * Math.PI) * 8, ry = 5 + Math.abs(Math.cos(u * 12)) * 9;
      ctx.fillStyle = "#e9c27a"; ctx.strokeStyle = "#a8742c"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(x, top - 12 - h, rx, ry, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ffe8b0"; ctx.beginPath(); ctx.ellipse(x - 6, top - 14 - h, rx * 0.35, ry * 0.3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = "#fff6d8";
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + u * 4; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 36, top - 12 - h + Math.sin(a) * 12, 2.5, 0, TAU); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }
  if (st.land > 0) {
    const u = 1 - st.land / 40, fade = st.land / 40;
    const lx = st.landX - cam.x, ly = st.landY - cam.y;
    ctx.globalAlpha = fade;
    if (chis) {
      ctx.strokeStyle = "#fff36a"; ctx.lineWidth = 3;
      for (const d of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(lx, ly);
        for (let i = 1; i <= 6; i++) ctx.lineTo(lx + d * i * (8 + u * 10), ly - ((i % 2) ? 6 : 0) - 1);
        ctx.stroke();
      }
      ctx.fillStyle = "#ffe14a"; bolt(ctx, lx, ly - 18 - u * 14, 1.1);
      if (u < 0.6) label(ctx, "¡TIERRA!", lx, ly - 40, "#fff36a", "#4a3200");
    } else {
      ctx.fillStyle = "#ffd84a"; ctx.strokeStyle = "#c89a1a"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(lx, ly - 2, 18 + u * 30, 4 + u * 2, 0, 0, TAU); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const d = i - 2.5, gx = lx + d * (10 + u * 14), gy = ly - 4 - Math.sin(u * Math.PI) * (16 + Math.abs(d) * 4);
        ctx.beginPath(); ctx.ellipse(gx, gy, 3.5, 5, 0, 0, TAU); ctx.fill();
      }
      if (u < 0.6) label(ctx, "¡PLOF!", lx, ly - 38, "#ffd84a", "#6a2a00");
    }
    ctx.globalAlpha = 1;
  }
  if (st.idle > 0) {
    const k = st.idle / 60;
    ctx.globalAlpha = k;
    if (chis) {
      ctx.fillStyle = "#ff5a5a";
      const pulse = 4 + Math.abs(Math.sin(t * 0.18)) * 3;
      ctx.beginPath(); ctx.arc(x - 9, top + p.h * 0.32, pulse, 0, TAU); ctx.arc(x + 9, top + p.h * 0.32, pulse, 0, TAU); ctx.fill();
      ctx.strokeStyle = "#fff36a"; ctx.lineWidth = 2;
      for (const s of [-1, 1]) {
        if ((t >> 3) % 3 === (s > 0 ? 0 : 1)) continue;
        ctx.beginPath(); ctx.moveTo(x + s * 13, top + p.h * 0.3); ctx.lineTo(x + s * 20, top + p.h * 0.24); ctx.lineTo(x + s * 18, top + p.h * 0.34); ctx.lineTo(x + s * 26, top + p.h * 0.28); ctx.stroke();
      }
      label(ctx, "bzz…", x + 24, top - 6 - Math.sin(t * 0.08) * 3, "#fff6a0", "#3a2a00");
    } else {
      ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 3; ctx.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const ph = ((t * 0.9 + i * 26) % 78) / 78, sx = x - 12 + i * 12, sy = top - ph * 34;
        ctx.globalAlpha = k * (1 - ph);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + 6, sy - 6, sx, sy - 12); ctx.quadraticCurveTo(sx - 6, sy - 18, sx, sy - 24); ctx.stroke();
      }
      ctx.globalAlpha = k;
      label(ctx, "¡recién horneada!", x, top - 44, "#ffe8b0", "#6a2a00");
    }
  }
  ctx.restore();
}
