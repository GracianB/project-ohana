// Objetos mágicos: aparecen sobre plataformas (1–2 por sala, deterministas por roomId),
// se recogen por proximidad y dan efectos temporales con chips en el HUD.
import { showNotification } from "./notify.js";
import { sfx } from "../engine/audio.js";
import { ROOMS, ROOM_W } from "./map.js";

const TAU = Math.PI * 2;
const FPS = 60;

const DEFS = {
  shell: { name: "Concha de Hoku", desc: "Burbuja: bloquea 3 golpes", color: "#7fe8ff", glow: "#bff6ff", hits: 3 },
  feather: { name: "Pluma del Viento", desc: "+1 salto y caída suave · 20 s", color: "#b8f5c8", glow: "#eaffef", dur: 20 * FPS },
  hourglass: { name: "Reloj de Arena", desc: "Enemigos a cámara lenta · 10 s", color: "#ffd27a", glow: "#fff0c4", dur: 10 * FPS },
  magnet: { name: "Imán de Cristal", desc: "Atrae los orbes · 25 s", color: "#ff7ad9", glow: "#ffd0f3", dur: 25 * FPS },
  star: { name: "Estrella Ohana", desc: "Invencible y dañas al tocar · 8 s", color: "#ffe66a", glow: "#fffbd0", dur: 8 * FPS },
  fruit: { name: "Fruta Dorada", desc: "Vida completa + 20 XP", color: "#ffb43a", glow: "#fff0b0" },
};
const KINDS = ["shell", "feather", "hourglass", "magnet", "star", "fruit"];

// Estado del módulo
let items = [];          // {kind, x, y, taken, phase}
let fx = {};             // kind -> frames restantes (shell -> golpes restantes)
let shellCrack = 0;      // animación de impacto de la burbuja
let featherBase = null;  // maxJumps sin bonus
let lastGame = null;
let lastPlayer = null;
let frame = 0;
let hudEl = null;
let hudSig = "";
const iconCache = {};

// ---------- utilidades ----------
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let s = seed || 1;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
function play(n) {
  const btn = document.getElementById("btn-mute");
  if (btn && /^Mute/.test(btn.textContent || "")) return;
  try { sfx(n); } catch { /* audio no disponible */ }
}

// ---------- colocación ----------
function spotFree(game, x, y, r) {
  for (const pl of game.platforms) {
    if (x + 16 > pl.x && x - 16 < pl.x + pl.w && y - 40 < pl.y + pl.h && y + 14 > pl.y) return false;
  }
  for (const pt of (r && r.portals) || []) {
    if (x > pt.x - 40 && x < pt.x + pt.w + 40 && y > pt.y - 80 && y < pt.y + pt.h + 40) return false;
  }
  return true;
}
function placeItems(game, roomId) {
  const pl0 = game.player;
  const px = pl0 ? pl0.x + pl0.w / 2 : -9999, py = pl0 ? pl0.y + pl0.h / 2 : -9999;
  const r = ROOMS[roomId] || {};
  const h = hash(String(roomId));
  const rand = rng(h);
  // Reparto determinista: índice de la sala (orden alfabético) → tipo; así salen los 6 repartidos
  let idx = Object.keys(ROOMS).sort().indexOf(String(roomId));
  if (idx < 0) idx = h % KINDS.length;
  const kinds = [];
  if (roomId === "boss") kinds.push("shell");
  let k1 = KINDS[idx % KINDS.length];
  if (kinds.includes(k1)) k1 = KINDS[(idx + 1) % KINDS.length];
  kinds.push(k1);
  if (h % 3 === 0 || roomId === "boss") { // algunas salas tienen 2
    let k2 = KINDS[(idx + 3) % KINDS.length];
    if (kinds.includes(k2)) k2 = KINDS[(idx + 4) % KINDS.length];
    if (!kinds.includes(k2)) kinds.push(k2);
  }
  if (roomId === "boss" && kinds.length > 2) kinds.length = 2;
  // Plataformas candidatas: anchas, no pegadas a los bordes (puertas), sin techo encima
  const cands = game.platforms.filter((p) => p.w >= 60 && p.y > 150 && p.y < 860);
  const out = [];
  const used = [];
  for (const kind of kinds) {
    let spot = null;
    for (let tries = 0; tries < 24 && !spot; tries++) {
      const pl = cands.length ? cands[Math.floor(rand() * cands.length)] : null;
      if (!pl) break;
      const x = pl.x + 26 + rand() * Math.max(1, pl.w - 52);
      const y = pl.y - 30;
      if (x < 130 || x > ROOM_W - 130) continue;
      if (Math.abs(x - px) < 170 && Math.abs(y - py) < 200) continue; // no encima del punto de entrada
      if (used.some((u) => Math.abs(u.x - x) < 140 && Math.abs(u.y - y) < 80)) continue;
      if (!spotFree(game, x, y, r)) continue;
      spot = { x, y };
    }
    if (!spot) continue;
    used.push(spot);
    out.push({ kind, x: spot.x, y: spot.y, taken: false, phase: rand() * TAU });
  }
  return out;
}

// ---------- efectos ----------
let featherEvo = null;
function feathered(p) {
  // applyForm (evolución) resetea maxJumps: si cambió la forma o el valor, recalcula la base
  if (featherBase != null && p.evo === featherEvo && p.maxJumps === featherBase + 1) return;
  featherBase = p.maxJumps;
  featherEvo = p.evo;
  p.maxJumps = featherBase + 1;
}
function unfeather(p) {
  if (featherBase != null && p && p.maxJumps === featherBase + 1) p.maxJumps = featherBase;
  featherBase = null;
}

function apply(game, kind, x, y) {
  const p = game.player; if (!p) return;
  const d = DEFS[kind]; if (!d) return;
  if (kind === "shell") { fx.shell = d.hits; shellCrack = 0; }
  else if (kind === "fruit") {
    p.health = p.maxHealth;
    p.xp = (p.xp || 0) + 20;
    game.nums.add(p.x, p.y - 16, "+20 XP", "#ffe66a");
    game.nums.add(p.x, p.y - 34, "VIDA MAX", "#7dff9a");
  } else {
    fx[kind] = d.dur;
    if (kind === "feather") feathered(p);
    if (kind === "hourglass") game.enemySlow = d.dur;
  }
  const cx = x == null ? p.x + p.w / 2 : x;
  const cy = y == null ? p.y + p.h / 2 : y;
  if (game.fx) {
    game.fx.emit(cx, cy, { color: d.color, count: 26, size: 4.5, up: 2.2, speed: 3.6 });
    game.fx.emit(cx, cy, { color: "#fff", count: 12, size: 3, up: 2.6, speed: 4, star: true });
  }
  if (game.nums) game.nums.add(cx, cy - 20, d.name, d.color);
  showNotification(d.name.toUpperCase(), d.desc);
  play(kind === "fruit" ? "heal" : "evo");
  hudSig = "";
}

function clearAll(game) {
  if (lastPlayer) unfeather(lastPlayer);
  fx = {};
  shellCrack = 0;
  featherBase = null;
  if (game) game.enemySlow = 0;
  hudSig = "";
  renderHud(true);
}

function starHits(game, p) {
  const bx = p.x - 6, by = p.y - 6, bw = p.w + 12, bh = p.h + 12;
  for (const e of game.enemies) {
    if (e.dying || e.invuln > 0 || !(e.hp > 0)) continue;
    if (bx + bw < e.x || bx > e.x + e.w || by + bh < e.y || by > e.y + e.h) continue;
    if (e._magicHit && frame - e._magicHit < 18) continue;
    e._magicHit = frame;
    const evo = Number(p.evo) || 0;
    let dmg = 30 + evo * 8;
    if (e.boss) dmg = Math.ceil(dmg * 0.35);
    e.hp -= dmg;
    const dir = e.x + e.w / 2 >= p.x + p.w / 2 ? 1 : -1;
    e.vx = (e.boss ? 3 : 11) * dir;
    e.vy = Math.min(e.vy || 0, e.boss ? -1.5 : -5);
    e.stun = Math.max(e.stun || 0, e.boss ? 8 : 22);
    e.flash = Math.max(e.flash || 0, 16);
    game.nums.add(e.x, e.y, "" + dmg, "#ffe66a", dmg >= 45);
    game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#ffe66a", count: 10, size: 3.5, speed: 3.4, star: true });
    game.shake = Math.min(14, (game.shake || 0) + 3);
    play("hit");
  }
}

// ---------- dibujo vectorial ----------
function starPath(ctx, cx, cy, r1, r2, n, rot) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i & 1 ? r2 : r1;
    const a = rot + (i * Math.PI) / n - Math.PI / 2;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
}

// Dibuja el icono centrado en (0,0), tamaño base ~ 28 px de alto
function drawIcon(ctx, kind, t) {
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  const ol = "rgba(20,16,40,.85)";
  if (kind === "shell") {
    const g = ctx.createLinearGradient(0, -13, 0, 12);
    g.addColorStop(0, "#e9fdff"); g.addColorStop(0.55, "#7fe0f5"); g.addColorStop(1, "#3a8fd0");
    ctx.beginPath();
    ctx.moveTo(0, 12); ctx.bezierCurveTo(-18, 6, -16, -12, 0, -13); ctx.bezierCurveTo(16, -12, 18, 6, 0, 12);
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = ol; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.4;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(0, 10); ctx.quadraticCurveTo(i * 5, -2, i * 5.5, -11 + Math.abs(i) * 1.5); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-5, 11); ctx.lineTo(0, 15); ctx.lineTo(5, 11); ctx.fillStyle = "#3a8fd0"; ctx.fill(); ctx.strokeStyle = ol; ctx.lineWidth = 1.6; ctx.stroke();
  } else if (kind === "feather") {
    ctx.save(); ctx.rotate(-0.55);
    const g = ctx.createLinearGradient(-6, 0, 6, 0);
    g.addColorStop(0, "#8ce8a8"); g.addColorStop(0.5, "#f2fff5"); g.addColorStop(1, "#6fd4c6");
    ctx.beginPath(); ctx.moveTo(0, -15); ctx.bezierCurveTo(10, -8, 9, 6, 0, 13); ctx.bezierCurveTo(-9, 6, -10, -8, 0, -15);
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = ol; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = "rgba(40,110,90,.7)"; ctx.lineWidth = 1;
    for (let i = -10; i < 10; i += 4) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(-6, i - 4); ctx.moveTo(0, i); ctx.lineTo(6, i - 4); ctx.stroke(); }
    ctx.strokeStyle = ol; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 17); ctx.stroke();
    ctx.restore();
  } else if (kind === "hourglass") {
    ctx.fillStyle = "#8a5a2b"; ctx.strokeStyle = ol; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(-11, -15, 22, 4, 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-11, 11, 22, 4, 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, -11); ctx.lineTo(8, -11); ctx.quadraticCurveTo(8, -3, 1.5, 0); ctx.quadraticCurveTo(8, 3, 8, 11);
    ctx.lineTo(-8, 11); ctx.quadraticCurveTo(-8, 3, -1.5, 0); ctx.quadraticCurveTo(-8, -3, -8, -11); ctx.closePath();
    ctx.fillStyle = "rgba(200,235,255,.55)"; ctx.fill(); ctx.stroke();
    const k = (t * 0.01) % 1;
    ctx.fillStyle = "#ffcf5a";
    ctx.beginPath(); ctx.moveTo(-6 + k * 4, -8 + k * 6); ctx.lineTo(6 - k * 4, -8 + k * 6); ctx.lineTo(0, -1); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7, 10); ctx.lineTo(7, 10); ctx.lineTo(0, 10 - 2 - k * 6); ctx.fill();
    ctx.fillRect(-0.6, -1, 1.2, 10);
  } else if (kind === "magnet") {
    const g = ctx.createLinearGradient(-12, -12, 12, 12);
    g.addColorStop(0, "#ffd6f4"); g.addColorStop(0.5, "#ff7ad9"); g.addColorStop(1, "#9a4cff");
    ctx.beginPath();
    ctx.moveTo(-12, 12); ctx.lineTo(-12, -1); ctx.arc(0, -1, 12, Math.PI, 0); ctx.lineTo(12, 12); ctx.lineTo(5, 12); ctx.lineTo(5, -1);
    ctx.arc(0, -1, 5, 0, Math.PI, true); ctx.lineTo(-5, 12); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = ol; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#e8f6ff"; ctx.fillRect(-12, 7, 7, 5); ctx.fillRect(5, 7, 7, 5);
    ctx.strokeRect(-12, 7, 7, 5); ctx.strokeRect(5, 7, 7, 5);
    ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -1, 9, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
  } else if (kind === "star") {
    const g = ctx.createRadialGradient(-3, -4, 1, 0, 0, 15);
    g.addColorStop(0, "#fffef0"); g.addColorStop(0.5, "#ffe66a"); g.addColorStop(1, "#ff9f2a");
    starPath(ctx, 0, 0, 15, 6.5, 5, Math.sin(t * 0.05) * 0.15);
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = ol; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = ol; ctx.beginPath(); ctx.arc(-3.5, -1, 1.5, 0, TAU); ctx.arc(3.5, -1, 1.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = ol; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(0, 1.5, 3, 0.2, Math.PI - 0.2); ctx.stroke();
  } else if (kind === "fruit") {
    const g = ctx.createRadialGradient(-4, -3, 1, 0, 2, 14);
    g.addColorStop(0, "#fff6c0"); g.addColorStop(0.45, "#ffc93a"); g.addColorStop(1, "#d97a10");
    ctx.beginPath(); ctx.moveTo(0, -7);
    ctx.bezierCurveTo(8, -13, 15, -3, 11, 6); ctx.bezierCurveTo(8, 13, 2, 13, 0, 11); ctx.bezierCurveTo(-2, 13, -8, 13, -11, 6); ctx.bezierCurveTo(-15, -3, -8, -13, 0, -7);
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = ol; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = "#6b3f10"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -7); ctx.quadraticCurveTo(1, -12, 3, -14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, -11); ctx.quadraticCurveTo(9, -16, 12, -10); ctx.quadraticCurveTo(6, -8, 2, -11);
    ctx.fillStyle = "#6fdc72"; ctx.fill(); ctx.strokeStyle = ol; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.beginPath(); ctx.ellipse(-5, -2, 2.2, 3.5, -0.4, 0, TAU); ctx.fill();
  }
}

function drawItem(ctx, it, cam, t) {
  const d = DEFS[it.kind];
  const bob = Math.sin(t * 0.06 + it.phase) * 5;
  const x = it.x - cam.x, y = it.y - cam.y + bob;
  const pulse = 0.75 + Math.sin(t * 0.09 + it.phase) * 0.25;
  ctx.save();
  // sombra en la plataforma
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.beginPath(); ctx.ellipse(x, it.y - cam.y + 28, 13 - bob * 0.6, 3.5, 0, 0, TAU); ctx.fill();
  // halo
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(x, y, 2, x, y, 34);
  g.addColorStop(0, d.glow); g.addColorStop(0.35, d.color + "88"); g.addColorStop(1, d.color + "00");
  ctx.globalAlpha = 0.55 * pulse; ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, 34, 0, TAU); ctx.fill();
  // rayos giratorios
  ctx.globalAlpha = 0.22 * pulse; ctx.fillStyle = d.glow;
  const rot = t * 0.015 + it.phase;
  for (let i = 0; i < 6; i++) {
    const a = rot + (i * TAU) / 6;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a - 0.12) * 30, y + Math.sin(a - 0.12) * 30);
    ctx.lineTo(x + Math.cos(a + 0.12) * 30, y + Math.sin(a + 0.12) * 30); ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
  // icono
  ctx.translate(x, y); ctx.scale(1.05, 1.05);
  drawIcon(ctx, it.kind, t);
  ctx.restore();
  // destellos
  ctx.save();
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 3; i++) {
    const k = ((t * 0.02 + i / 3 + it.phase) % 1);
    const a = it.phase + i * 2.1;
    const sx = x + Math.cos(a) * (14 + k * 10), sy = y + Math.sin(a) * (12 + k * 8) - k * 6;
    const s = Math.sin(k * Math.PI) * 3.2;
    if (s < 0.3) continue;
    ctx.globalAlpha = Math.sin(k * Math.PI);
    starPath(ctx, sx, sy, s, s * 0.3, 4, 0); ctx.fill();
  }
  ctx.restore();
}

function drawEffects(ctx, game, t) {
  const p = game.player; if (!p || p.dead) return;
  const cam = game.cam;
  const cx = p.x + p.w / 2 - cam.x, cy = p.y + p.h / 2 - cam.y;
  const R = Math.max(p.w, p.h) * 0.5 + 14;
  if (fx.star > 0) {
    const blink = fx.star < 90 && (fx.star >> 3) & 1;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = blink ? 0.25 : 0.55;
    const hue = (t * 6) % 360;
    const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, R + 10);
    g.addColorStop(0, "hsla(" + hue + ",100%,80%,.9)"); g.addColorStop(1, "hsla(" + ((hue + 120) % 360) + ",100%,60%,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R + 10, 0, TAU); ctx.fill();
    ctx.globalAlpha = blink ? 0.4 : 0.95;
    ctx.fillStyle = "#fff8c0";
    for (let i = 0; i < 5; i++) {
      const a = t * 0.12 + (i * TAU) / 5;
      starPath(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.85, 4.5, 1.8, 5, a);
      ctx.fill();
    }
    ctx.restore();
    if ((t & 3) === 0 && game.fx) game.fx.emit(p.x + p.w / 2, p.y + p.h / 2, { color: "hsl(" + hue + ",100%,70%)", count: 1, size: 2.5, speed: 1.2, star: true, life: 14 });
  }
  if (fx.shell > 0) {
    const hits = fx.shell;
    const wob = Math.sin(t * 0.1) * 1.5 + shellCrack * 0.3;
    const r = R + 4 + wob;
    ctx.save();
    const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
    g.addColorStop(0, "rgba(255,255,255,.35)"); g.addColorStop(0.7, "rgba(127,232,255,.10)"); g.addColorStop(1, "rgba(127,232,255,.45)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = shellCrack > 0 ? "rgba(255,255,255,.95)" : "rgba(190,245,255,.8)";
    ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, r - 5, Math.PI * 1.1, Math.PI * 1.4); ctx.stroke();
    // grietas según golpes recibidos
    const broken = 3 - hits;
    if (broken > 0) {
      ctx.strokeStyle = "rgba(230,250,255,.9)"; ctx.lineWidth = 1.3;
      const cr = [[0.4, 1], [2.5, -1], [4.3, 1]];
      for (let i = 0; i < broken; i++) {
        const [a, s] = cr[i];
        const x0 = cx + Math.cos(a) * r, y0 = cy + Math.sin(a) * r;
        ctx.beginPath(); ctx.moveTo(x0, y0);
        const x1 = cx + Math.cos(a + 0.15 * s) * r * 0.72, y1 = cy + Math.sin(a + 0.15 * s) * r * 0.72;
        ctx.lineTo(x1, y1);
        ctx.lineTo(cx + Math.cos(a - 0.1 * s) * r * 0.5, cy + Math.sin(a - 0.1 * s) * r * 0.5);
        ctx.moveTo(x1, y1); ctx.lineTo(cx + Math.cos(a + 0.35 * s) * r * 0.55, cy + Math.sin(a + 0.35 * s) * r * 0.55);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  if (fx.feather > 0 && !p.grounded && (t & 3) === 0 && game.fx) {
    game.fx.emit(p.x + p.w / 2 - p.facing * 8, p.y + p.h * 0.6, { color: "#dfffe8", count: 1, size: 2.4, speed: 0.6, life: 16, up: 0.2 });
  }
  if (fx.magnet > 0) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,122,217,.35)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]); ctx.lineDashOffset = -t * 0.6;
    ctx.beginPath();
    let n = 0;
    for (const o of game.orbs) {
      if (o.taken || !o._mag) continue;
      ctx.moveTo(cx, cy); ctx.lineTo(o.x - cam.x, o.y - cam.y);
      if (++n > 8) break;
    }
    if (n) ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.25 + Math.sin(t * 0.1) * 0.1;
    ctx.beginPath(); ctx.arc(cx, cy, R + 8 + ((t * 0.8) % 20), 0, TAU); ctx.stroke();
    ctx.restore();
  }
  if (fx.hourglass > 0) {
    const cv = ctx.canvas;
    ctx.save();
    const a = Math.min(1, fx.hourglass / 40, (DEFS.hourglass.dur - fx.hourglass) / 20 + 0.2);
    ctx.globalAlpha = 0.12 * a;
    ctx.fillStyle = "#4a7dff";
    ctx.fillRect(-100, -100, cv.width + 200, cv.height + 200);
    ctx.restore();
  }
}

// ---------- HUD ----------
const CSS = `
#magic-chips{position:fixed;top:54px;left:50%;transform:translateX(-50%);display:none;gap:6px;z-index:30;pointer-events:none;flex-wrap:wrap;justify-content:center;max-width:min(94vw,720px)}
body.playing #magic-chips.has{display:flex}
#magic-chips .mchip{display:flex;align-items:center;gap:6px;padding:4px 9px 4px 4px;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(7,12,20,.82));border:1px solid rgba(255,255,255,.18);box-shadow:0 6px 18px rgba(0,0,0,.35),0 0 10px var(--c,#fff3);backdrop-filter:blur(10px);font:700 11px/1 Fredoka,system-ui,sans-serif;color:#f4f8ff;animation:mchipIn .28s ease-out}
#magic-chips .mchip img{width:24px;height:24px;display:block;filter:drop-shadow(0 0 4px var(--c,#fff))}
#magic-chips .mbar{width:46px;height:5px;border-radius:9px;background:rgba(255,255,255,.14);overflow:hidden}
#magic-chips .mbar i{display:block;height:100%;width:100%;border-radius:9px;background:var(--c,#fff);box-shadow:0 0 6px var(--c,#fff);transform-origin:left;transition:transform .25s linear}
#magic-chips .mt{min-width:22px;text-align:right;font-variant-numeric:tabular-nums}
#magic-chips .mchip.low{animation:mchipBlink .5s steps(2) infinite}
#magic-chips .pips{display:flex;gap:3px}
#magic-chips .pips b{width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:0 0 5px var(--c)}
#magic-chips .pips b.off{background:rgba(255,255,255,.15);box-shadow:none}
@keyframes mchipIn{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes mchipBlink{50%{opacity:.45}}
@media (max-width:820px){#magic-chips{gap:4px}#magic-chips .mchip{padding:3px 7px 3px 3px;font-size:10px}#magic-chips .mchip img{width:20px;height:20px}#magic-chips .mbar{width:30px}}
@media (max-width:480px){#magic-chips .mbar{display:none}}
`;

function iconURL(kind) {
  if (iconCache[kind]) return iconCache[kind];
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 48;
    const x = c.getContext("2d");
    x.translate(24, 24); x.scale(1.4, 1.4);
    drawIcon(x, kind, 0);
    iconCache[kind] = c.toDataURL();
  } catch { iconCache[kind] = ""; }
  return iconCache[kind];
}

function ensureHud() {
  if (hudEl && hudEl.isConnected) return hudEl;
  if (typeof document === "undefined") return null;
  if (!document.getElementById("magic-chips-css")) {
    const st = document.createElement("style");
    st.id = "magic-chips-css"; st.textContent = CSS;
    document.head.appendChild(st);
  }
  hudEl = document.getElementById("magic-chips");
  if (!hudEl) {
    hudEl = document.createElement("div");
    hudEl.id = "magic-chips";
    hudEl.setAttribute("aria-live", "polite");
    document.body.appendChild(hudEl);
  }
  if (!resizeHooked) {
    resizeHooked = true;
    addEventListener("resize", () => layoutHud(hudEl));
    document.addEventListener("fullscreenchange", () => layoutHud(hudEl));
  }
  hudSig = "";
  return hudEl;
}

// Coloca la fila bajo la barra superior evitando los paneles del HUD / barra del jefe (solo al cambiar)
function layoutHud(el) {
  if (!el || !el.classList.contains("has")) return;
  const ta = document.getElementById("top-actions");
  let top = 54;
  if (ta) { const r = ta.getBoundingClientRect(); if (r.height) top = r.bottom + 8; }
  el.style.top = top + "px";
  const me = el.getBoundingClientRect();
  const avoid = document.querySelectorAll("#hud .hud-block, #boss-wrap:not(.hidden)");
  let push = top;
  for (const n of avoid) {
    const r = n.getBoundingClientRect();
    if (!r.height) continue;
    if (r.left < me.right && r.right > me.left && r.top < me.bottom && r.bottom > me.top) push = Math.max(push, r.bottom + 6);
  }
  if (push !== top) el.style.top = push + "px";
}
let resizeHooked = false;

function renderHud(force) {
  const el = ensureHud(); if (!el) return;
  const active = KINDS.filter((k) => fx[k] > 0);
  const sig = active.join(",");
  if (force || sig !== hudSig) {
    hudSig = sig;
    el.innerHTML = active.map((k) => {
      const d = DEFS[k];
      const body = k === "shell"
        ? '<span class="pips">' + [0, 1, 2].map((i) => '<b data-i="' + i + '"></b>').join("") + "</span>"
        : '<span class="mbar"><i></i></span><span class="mt"></span>';
      return '<div class="mchip" data-k="' + k + '" style="--c:' + d.color + '" title="' + d.name + '"><img alt="" src="' + iconURL(k) + '">' + body + "</div>";
    }).join("");
    el.classList.toggle("has", active.length > 0);
    layoutHud(el);
  }
  for (const chip of el.children) {
    const k = chip.dataset.k; const v = fx[k] || 0;
    if (k === "shell") {
      chip.querySelectorAll("b").forEach((b, i) => b.classList.toggle("off", i >= v));
      continue;
    }
    const i = chip.querySelector("i"); const tx = chip.querySelector(".mt");
    if (i) i.style.transform = "scaleX(" + Math.max(0, v / DEFS[k].dur).toFixed(3) + ")";
    if (tx) tx.textContent = Math.ceil(v / FPS) + "s";
    chip.classList.toggle("low", v < 3 * FPS);
  }
}

// ---------- API ----------
export const Magic = {
  onRoom(game, roomId) {
    lastGame = game;
    if (game.player !== lastPlayer) { clearAll(game); lastPlayer = game.player; }
    items = placeItems(game, roomId);
    ensureHud();
  },

  update(game) {
    lastGame = game;
    const p = game.player; if (!p) return;
    if (p !== lastPlayer) { clearAll(game); lastPlayer = p; }
    frame++;
    if (p.dead) { if (Object.keys(fx).length) clearAll(game); return; }
    // recogida
    const pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
    for (const it of items) {
      if (it.taken) continue;
      if (Math.abs(pcx - it.x) < 26 + p.w / 2 && Math.abs(pcy - it.y) < 26 + p.h / 2) {
        it.taken = true;
        apply(game, it.kind, it.x, it.y);
      }
    }
    // temporizadores
    for (const k of ["feather", "hourglass", "magnet", "star"]) {
      if (!(fx[k] > 0)) continue;
      fx[k]--;
      if (fx[k] <= 0) {
        delete fx[k];
        if (k === "feather") unfeather(p);
        if (k === "hourglass") game.enemySlow = 0;
        if (game.nums) game.nums.add(p.x, p.y - 20, DEFS[k].name + " ✕", "#aab");
      }
    }
    if (fx.hourglass > 0) game.enemySlow = fx.hourglass;
    if (fx.feather > 0) {
      feathered(p);
      if (!p.grounded && p.vy > 3.2) p.vy = 3.2 + (p.vy - 3.2) * 0.55; // caída suave
    }
    if (fx.magnet > 0) {
      for (const o of game.orbs) {
        if (o.taken) continue;
        const dx = pcx - o.x, dy = pcy - o.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 520 || dist < 1) { o._mag = false; continue; }
        o._mag = true;
        const sp = Math.min(dist, 3 + (520 - dist) * 0.02);
        o.x += (dx / dist) * sp; o.y += (dy / dist) * sp;
      }
    }
    if (fx.star > 0) starHits(game, p);
    if (shellCrack > 0) shellCrack--;
    if ((frame & 7) === 0) renderHud(false);
  },

  draw(ctx, game, t) {
    const p = game.player;
    if (p && p.dead && Object.keys(fx).length) clearAll(game);
    const cam = game.cam;
    const vw = ctx.canvas.width;
    for (const it of items) {
      if (it.taken) continue;
      const sx = it.x - cam.x;
      if (sx < -60 || sx > vw + 60) continue;
      drawItem(ctx, it, cam, t);
    }
    drawEffects(ctx, game, t);
  },

  onHurt(game, amount) {
    const p = game.player;
    if (!(amount > 0)) return amount;
    if (fx.star > 0) return 0;
    if (fx.shell > 0) {
      fx.shell--;
      shellCrack = 14;
      if (p) {
        p.invuln = Math.max(p.invuln || 0, 40);
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        game.fx.emit(cx, cy, { color: "#bff6ff", count: fx.shell > 0 ? 10 : 26, size: 3.5, speed: 3.5, star: fx.shell <= 0 });
        game.nums.add(p.x, p.y - 14, fx.shell > 0 ? "¡BLOQUEO!" : "¡POP!", "#7fe8ff");
      }
      if (fx.shell <= 0) { delete fx.shell; showNotification("CONCHA ROTA", "La burbuja de Hoku se ha roto"); }
      play("land");
      renderHud(false);
      return 0;
    }
    return amount;
  },

  reset(game) {
    clearAll(game || lastGame);
    items = [];
  },
};

// Depuración: window.__ohanaMagic.give("star")
if (typeof window !== "undefined") {
  window.__ohanaMagic = {
    give(kind) {
      if (!lastGame || !lastGame.player || !DEFS[kind]) return false;
      apply(lastGame, kind);
      renderHud(true);
      return true;
    },
    items: () => items.map((i) => ({ kind: i.kind, x: Math.round(i.x), y: Math.round(i.y), taken: i.taken })),
    active: () => ({ ...fx }),
    tp(i) {
      const it = items[i || 0]; const p = lastGame && lastGame.player;
      if (!it || !p) return false;
      p.x = it.x - p.w / 2; p.y = it.y - p.h / 2; p.vx = 0; p.vy = 0;
      return true;
    },
    state: () => { const p = lastGame && lastGame.player; return p ? { hp: p.health, max: p.maxHealth, xp: p.xp, evo: p.evo, jumps: p.maxJumps, slow: lastGame.enemySlow, foes: lastGame.enemies.map((e) => Math.round(e.hp)) } : null; },
    kinds: KINDS.slice(),
  };
}
