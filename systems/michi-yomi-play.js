// V371 · 3 interacciones propias para Michi (cat) y Yomi + marcas de impacto legibles de J/K/L.
// 1) G = emote. 2) Aterrizaje fuerte. 3) Quieto 4 s. Solo visual: sin daño, sin red, sin gradientes.
const TAU = Math.PI * 2;
const IDS = new Set(["cat", "yomi"]);
const MAX_IMPACTS = 16;
let emoteQueued = false;
let gameRef = null; // se fija en updateMichiYomiPlay; el keydown lo usa para ignorar G en pausa
const st = { emote: 0, land: 0, idle: 0, still: 0, lastX: null, lastY: null, fallV: 0, wasAir: false, landX: 0, landY: 0 };
const impacts = [];

export const MICHI_YOMI_PLAY = Object.freeze({
  cat: Object.freeze(["G · Miau~ con ovillo", "Aterrizaje · ¡De pie!", "Quieto · se acurruca (zzz purr)"]),
  yomi: Object.freeze(["G · ¡Hechizo de código! runas en órbita", "Aterrizaje · onda de escaneo", "Quieto · pensamientos en órbita"]),
});

if (typeof addEventListener === "function") {
  addEventListener("keydown", (e) => {
    if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    if (String(e.key || "").toLowerCase() !== "g") return;
    if (e.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    if (gameRef?.paused) return;
    emoteQueued = true;
  });
}
export function queueMichiYomiEmote() { emoteQueued = true; }
export function resetMichiYomiPlay() {
  emoteQueued = false; impacts.length = 0;
  Object.assign(st, { emote: 0, land: 0, idle: 0, still: 0, lastX: null, lastY: null, fallV: 0, wasAir: false });
}
// Marca de impacto (anillo + texto) de 0,5 s. La llaman J/K/L de Michi y Yomi al golpear.
// opts.life (frames) y opts.big (escala del anillo) para el U: 60-84 frames y anillo grande.
export function michiYomiImpact(x, y, text, color, opts) {
  if (impacts.length >= MAX_IMPACTS) impacts.shift();
  const life = Math.max(10, Math.min(84, Number(opts?.life) || 30));
  impacts.push({ x, y, text: text || "", color: color || "#fff", life, max: life, big: Number(opts?.big) || 1 });
}

export function updateMichiYomiPlay(game) {
  for (let i = impacts.length - 1; i >= 0; i--) if (--impacts[i].life <= 0) impacts.splice(i, 1);
  if (game) gameRef = game;
  const p = game?.player;
  if (!p || !IDS.has(p.id) || p.dead) { emoteQueued = false; st.emote = st.land = st.idle = 0; return; }
  if (game.paused) { emoteQueued = false; return; }
  if (emoteQueued) {
    emoteQueued = false;
    if (st.emote <= 0) {
      st.emote = 72;
      if (p.grounded && p.id === "cat") p.vy = Math.min(p.vy || 0, -4.5);
      game.nums?.add?.(p.x + p.w / 2, p.y - 30, p.id === "cat" ? "Miau~" : "¡YOMI-SELLO!", p.id === "cat" ? "#ffb6e4" : "#ff4466", true);
    }
  }
  if (st.emote > 0) st.emote--;
  if (st.land > 0) st.land--;
  if (!p.grounded) st.fallV = Math.max(st.fallV, Number(p.vy) || 0);
  if (p.grounded && st.wasAir && st.fallV > 9 && st.land <= 0) {
    st.land = 54; st.landX = p.x + p.w / 2; st.landY = p.y + p.h;
    game.shake = Math.min(10, (game.shake || 0) + 2);
  }
  if (p.grounded) st.fallV = 0;
  st.wasAir = !p.grounded;
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
function ofuda(ctx, x, y, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = "#fff1d0"; ctx.strokeStyle = "#a64f5d"; ctx.lineWidth = 1.5;
  ctx.fillRect(-4, -11, 8, 22); ctx.strokeRect(-4, -11, 8, 22);
  ctx.fillStyle = "#d02a44"; ctx.fillRect(-2, -6, 4, 8);
  ctx.restore();
}
function lantern(ctx, x, y, k) {
  ctx.fillStyle = "#ff6a3a"; ctx.strokeStyle = "#3a0e18"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(x, y, 6, 8, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffe08a"; ctx.globalAlpha *= 0.9;
  ctx.beginPath(); ctx.ellipse(x, y, 2.5, 4 + k, 0, 0, TAU); ctx.fill();
}

function drawImpacts(ctx, cam) {
  for (const f of impacts) {
    const u = 1 - f.life / f.max, b = f.big, x = f.x - cam.x, y = f.y - cam.y;
    ctx.globalAlpha = Math.min(1, f.life / 12);
    ctx.strokeStyle = f.color; ctx.lineWidth = (4 - u * 2) * (b > 1 ? 1.5 : 1);
    ctx.beginPath(); ctx.arc(x, y, (10 + u * 30) * b, 0, TAU); ctx.stroke();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, (6 + u * 18) * b, 0, TAU); ctx.stroke();
    if (f.text) label(ctx, f.text, x, y - 26 * b - u * 14, f.color, "#2a0f22");
  }
  ctx.globalAlpha = 1;
}

export function drawMichiYomiPlay(ctx, game, t) {
  const cam = game?.cam || { x: 0, y: 0 };
  const p = game?.player;
  ctx.save();
  if (impacts.length) drawImpacts(ctx, cam);
  if (!p || !IDS.has(p.id) || p.dead || !(st.emote > 0 || st.land > 0 || st.idle > 0)) { ctx.restore(); return; }
  const x = p.x + p.w / 2 - cam.x, top = p.y - cam.y, mid = p.y + p.h / 2 - cam.y, feet = p.y + p.h - cam.y;
  const cat = p.id === "cat";
  if (st.emote > 0) {
    const u = 1 - st.emote / 72, fade = Math.min(1, st.emote / 14);
    ctx.globalAlpha = fade;
    if (cat) {
      // Estirón: arco de lomo + ovillo que bota 3 veces delante.
      ctx.strokeStyle = "#ffb6e4"; ctx.lineWidth = 3; ctx.lineCap = "round";
      const arch = Math.sin(Math.min(1, u * 2) * Math.PI) * 14;
      ctx.beginPath(); ctx.moveTo(x - 22, mid + 6); ctx.quadraticCurveTo(x, mid - 10 - arch, x + 22, mid + 6); ctx.stroke();
      const face = p.facing || 1, bx = x + face * (26 + u * 30), by = feet - 9 - Math.abs(Math.sin(u * Math.PI * 3)) * (34 * (1 - u * 0.6));
      ctx.strokeStyle = "#ffb6e4"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(x + face * 8, mid); ctx.quadraticCurveTo((x + bx) / 2, feet, bx, by); ctx.stroke();
      ctx.fillStyle = "#ff8ad4"; ctx.strokeStyle = "#c2408f";
      ctx.beginPath(); ctx.arc(bx, by, 9, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(bx, by, 8, 3, u * 9, 0, TAU); ctx.stroke();
      if (u > 0.15) label(ctx, "Miau~", x, top - 18 - u * 10, "#ffd0ee", "#5a1a40");
    } else {
      // Abanico de 7 ofudas girando alrededor de Yomi + anillo de sello.
      const r = 20 + Math.min(1, u * 3) * 26;
      ctx.strokeStyle = "#ff4466"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, mid, r + 8, 0, TAU); ctx.stroke();
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + u * 7; ofuda(ctx, x + Math.cos(a) * r, mid + Math.sin(a) * r, a + Math.PI / 2); }
      label(ctx, "¡Yomi-sello!", x, top - 24, "#ffe1a7", "#4a0010");
    }
  }
  if (st.land > 0) {
    const u = 1 - st.land / 54, lx = st.landX - cam.x, ly = st.landY - cam.y;
    ctx.globalAlpha = Math.min(1, st.land / 14);
    if (cat) {
      // Cuatro huellas + nubes de polvo laterales.
      ctx.fillStyle = "#f3e2d0";
      for (let i = 0; i < 8; i++) { const d = i < 4 ? -1 : 1, k = i % 4; ctx.beginPath(); ctx.arc(lx + d * (12 + k * 7 + u * 22), ly - 4 - k * 2 - u * 6, 5 - k * 0.8 + u * 2, 0, TAU); ctx.fill(); }
      ctx.fillStyle = "#c2408f";
      for (let i = 0; i < 4; i++) { const px = lx - 15 + i * 10; ctx.beginPath(); ctx.ellipse(px, ly - 1, 3.5, 2, 0, 0, TAU); ctx.fill(); }
      if (u < 0.7) label(ctx, "¡De pie!", lx, ly - 46, "#ffd0ee", "#5a1a40");
    } else {
      // Onda de sombra en el suelo + torii que sube y se desvanece.
      ctx.strokeStyle = "#2a0a18"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(lx, ly - 1, 14 + u * 52, 4 + u * 4, 0, 0, TAU); ctx.stroke();
      ctx.strokeStyle = "#ff4466"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(lx, ly - 1, 8 + u * 34, 3 + u * 2, 0, 0, TAU); ctx.stroke();
      const ty = ly - 8 - u * 22;
      ctx.fillStyle = "#d02a44"; ctx.strokeStyle = "#3a0e18"; ctx.lineWidth = 1.5;
      ctx.fillRect(lx - 16, ty - 30, 4, 30); ctx.fillRect(lx + 12, ty - 30, 4, 30);
      ctx.fillRect(lx - 22, ty - 34, 44, 5); ctx.strokeRect(lx - 22, ty - 34, 44, 5); ctx.fillRect(lx - 17, ty - 24, 34, 3);
      if (u < 0.7) label(ctx, "UMBRAL", lx, ty - 42, "#ffe1a7", "#4a0010");
    }
  }
  if (st.idle > 0) {
    const k = st.idle / 60;
    ctx.globalAlpha = k;
    if (cat) {
      // Se lame la patita y suelta "zzz purr" flotando.
      const lick = Math.sin(t * 0.25) * 3;
      ctx.fillStyle = "#ffd0ee"; ctx.strokeStyle = "#5a1a40"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(x + (p.facing || 1) * 10, top + p.h * 0.42 + lick, 5, 4, 0, 0, TAU); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const ph = ((t * 0.6 + i * 30) % 90) / 90;
        ctx.globalAlpha = k * (1 - ph);
        label(ctx, "z", x + 14 + ph * 16 + i * 4, top - 6 - ph * 30, "#ffd0ee", "#5a1a40");
      }
      ctx.globalAlpha = k; label(ctx, "purr…", x, top - 44, "#ffd0ee", "#5a1a40");
    } else {
      // 3 farolillos espíritu orbitando.
      for (let i = 0; i < 3; i++) {
        const a = t * 0.04 + i / 3 * TAU;
        ctx.globalAlpha = k;
        lantern(ctx, x + Math.cos(a) * 34, mid - 10 + Math.sin(a) * 14, Math.sin(t * 0.2 + i));
      }
      ctx.globalAlpha = k; label(ctx, "…", x, top - 30, "#ffe1a7", "#4a0010");
    }
  }
  ctx.restore();
}
