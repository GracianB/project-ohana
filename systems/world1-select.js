
// OHANA V467 · MUNDO 1 · Selección de héroe personalizada.
// Sin islas en pareja: cada héroe tiene su propia carta-portal enlazada a SU sala
// grande (w1-<héroe>), con su silueta, su color, su frase y el estado del sello.
// Al final de la fila, el portal del Corazón de Ohana (Quimera) se abre con los diez.
//
// CÓMO ENGANCHARLO (lo hace el dueño del cableado):
//   import { createWorld1Select, world1SelectKey, world1SelectPointer,
//            drawWorld1Select } from "./world1-select.js";
//   const sel = createWorld1Select({ seals: g.world1Seals, counts: OhanaWorld1Collect.countsByHero(g) });
//   keydown → const r = world1SelectKey(sel, e.key); if (r?.action === "enter") goRoom(r.room, r.hero);
//   click   → const r = world1SelectPointer(sel, x, y, true);  (move → false para hover)
//   frame   → drawWorld1Select(ctx, W, H, t, sel, { drawActor })   // drawActor(ctx, heroId, x, y, scale) opcional
// También disponible como window.OhanaWorld1Select. Sin degradados por fotograma,
// sin Math.random, geometría finita.
import { WORLD1_ORDER, WORLD1_THEMES, WORLD1_SEALS, cleanWorld1Seals } from "./world1-rooms.js";
import { findRoster } from "../characters/roster.js";

export const WORLD1_TAGLINES = Object.freeze({
  kilo:    "La canción del hogar empieza contigo.",
  stitcho: "Ningún experimento se queda atrás.",
  chispin: "Un chispazo, mil carcajadas.",
  cat:     "Sueña fuerte: las medusas te escuchan.",
  cuerno:  "Ordena la aurora, pinta el bosque.",
  dragon:  "Fuego que calienta, no que asusta.",
  dino:    "Un pisotón y la tierra recuerda.",
  frita:   "Crujiente por fuera, valiente por dentro.",
  pizza:   "Reparto exprés de sonrisas con queso.",
  yomi:    "La IA de la familia ya está despierta."
});

const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function heroDisplayName(hero) {
  try { const r = findRoster(hero); if (r?.name) return r.name; } catch (_) {}
  return WORLD1_THEMES[hero]?.short || hero;
}

// Datos de cada carta (puros, sin DOM): para HUD, menú HTML o lienzo.
export function world1SelectCards({ seals = [], counts = {} } = {}) {
  const done = new Set(cleanWorld1Seals(seals));
  const cards = WORLD1_ORDER.map((hero, i) => {
    const th = WORLD1_THEMES[hero];
    const unlocked = i === 0 || done.has(hero) || done.has(WORLD1_ORDER[i - 1]);
    return {
      hero, index: i, room: "w1-" + hero, name: heroDisplayName(hero), roomName: th.name,
      color: th.color, tint: th.tint, tagline: WORLD1_TAGLINES[hero], relic: th.relic,
      seal: WORLD1_SEALS[th.seal]?.title || "", sealed: done.has(hero), unlocked,
      found: clamp(Math.floor(num(counts[hero])), 0, 100)
    };
  });
  const all = WORLD1_ORDER.every((h) => done.has(h));
  cards.push({ hero: null, index: WORLD1_ORDER.length, room: "w1-final", name: "Corazón de Ohana", roomName: "La Quimera Ohana",
    color: "#ffd6f2", tint: "#ff7ad0", tagline: all ? "Los diez juntos. Es la hora." : "Despierta los diez sellos para abrirlo.",
    relic: "", seal: "Jefe final", sealed: false, unlocked: all, found: 0, final: true });
  return cards;
}

export function createWorld1Select({ seals = [], counts = {}, start = null } = {}) {
  const cards = world1SelectCards({ seals, counts });
  let index = start ? cards.findIndex((c) => c.hero === start || c.room === start) : -1;
  if (index < 0) { index = cards.findIndex((c) => c.unlocked && !c.sealed && !c.final); if (index < 0) index = 0; }
  return { cards, index, hover: -1, t: 0, pulse: 0, deny: 0, rects: [] };
}
export function refreshWorld1Select(sel, opts) { const i = sel.index; sel.cards = world1SelectCards(opts); sel.index = clamp(i, 0, sel.cards.length - 1); return sel; }

const COLS = 6;
function layout(sel, W, H) {
  const n = sel.cards.length, cols = W < 600 ? 3 : COLS, rows = Math.ceil(n / cols);
  sel.columns = cols;
  const pad = Math.max(10, W * 0.012), top = H * 0.2, bottom = H * 0.16;
  const cw = Math.max(1, (W - pad * (cols + 1)) / cols), ch = Math.max(90, (H - top - bottom - pad * (rows - 1)) / rows);
  sel.rects = sel.cards.map((c, i) => { const r = Math.floor(i / cols), k = i % cols;
    const rowN = Math.min(cols, n - r * cols), off = (cols - rowN) * (cw + pad) / 2;
    return { x: pad + off + k * (cw + pad), y: top + r * (ch + pad), w: cw, h: ch }; });
  return sel.rects;
}

function choose(sel) {
  const c = sel.cards[sel.index];
  if (!c?.unlocked) { sel.deny = 24; return { action: "locked", card: c, message: c?.final ? "Faltan sellos por despertar." : "Despierta antes el sello de " + heroDisplayName(WORLD1_ORDER[c.index - 1]) + "." }; }
  sel.pulse = 30;
  return { action: "enter", room: c.room, hero: c.hero || "kilo", card: c };
}

export function world1SelectKey(sel, key) {
  const n = sel.cards.length;
  if (key === "ArrowRight" || key === "d") sel.index = (sel.index + 1) % n;
  else if (key === "ArrowLeft" || key === "a") sel.index = (sel.index + n - 1) % n;
  else if (key === "ArrowDown" || key === "s") sel.index = Math.min(n - 1, sel.index + (sel.columns || COLS));
  else if (key === "ArrowUp" || key === "w") sel.index = Math.max(0, sel.index - (sel.columns || COLS));
  else if (key === "Enter" || key === " " || key === "j") return choose(sel);
  else if (key === "Escape") return { action: "back" };
  return { action: "move", card: sel.cards[sel.index] };
}

export function world1SelectPointer(sel, x, y, click = false) {
  const i = sel.rects.findIndex((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  sel.hover = i;
  if (i < 0) return null;
  sel.index = i;
  return click ? choose(sel) : { action: "move", card: sel.cards[i] };
}

// Emblema-silueta propio de cada héroe (también lo usan las cinemáticas).
// Dibujo con caminos simples centrado en (x,y), tamaño s ≈ alto total.
export function drawHeroEmblem(ctx, hero, x, y, s, color = "#fff", t = 0) {
  x = num(x); y = num(y); s = Math.max(1, num(s, 40)); t = num(t);
  const u = s / 100, bob = Math.sin(t * 0.05 + (WORLD1_ORDER.indexOf(hero) + 1)) * 3 * u;
  ctx.save(); ctx.translate(x, y + bob); ctx.fillStyle = color;
  const body = (rx, ry, oy = 0) => { ctx.beginPath(); ctx.ellipse(0, oy * u, rx * u, ry * u, 0, 0, Math.PI * 2); ctx.fill(); };
  const tri = (a, b, c, d, e, f) => { ctx.beginPath(); ctx.moveTo(a * u, b * u); ctx.lineTo(c * u, d * u); ctx.lineTo(e * u, f * u); ctx.closePath(); ctx.fill(); };
  switch (hero) {
    case "kilo": body(26, 32, 10); body(22, 20, -30); tri(-6, -48, 0, -62, 6, -48); ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + t * 0.01; ctx.ellipse(Math.cos(a) * 9 * u + 18 * u, -44 * u + Math.sin(a) * 9 * u, 6 * u, 4 * u, a, 0, Math.PI * 2); } ctx.fill(); ctx.fillRect(22 * u, -4 * u, 30 * u, 7 * u); break;
    case "stitcho": body(28, 26, 16); body(26, 22, -22); tri(-20, -30, -58, -58, -14, -14); tri(20, -30, 58, -58, 14, -14); tri(-10, 40, -18, 50, -2, 42); tri(10, 40, 18, 50, 2, 42); break;
    case "chispin": body(34, 30, 14); body(24, 20, -26); tri(-14, -38, -30, -70, -4, -42); tri(14, -38, 30, -70, 4, -42); ctx.beginPath(); ctx.moveTo(30 * u, 10 * u); ctx.lineTo(54 * u, -6 * u); ctx.lineTo(46 * u, 6 * u); ctx.lineTo(62 * u, 0); ctx.lineTo(40 * u, 22 * u); ctx.closePath(); ctx.fill(); break;
    case "cat": body(24, 22, 14); body(22, 19, -22); tri(-18, -32, -12, -54, -4, -36); tri(18, -32, 12, -54, 4, -36); tri(-3, -38, 0, -66, 3, -38); for (let i = 0; i < 3; i++) { ctx.fillRect((-14 + i * 12) * u, 30 * u, 4 * u, (16 + Math.sin(t * 0.08 + i) * 5) * u); } break;
    case "cuerno": body(30, 24, 12); body(18, 16, -24); tri(-4, -36, 6, -76, 8, -34); ctx.fillRect(-26 * u, 28 * u, 8 * u, 22 * u); ctx.fillRect(18 * u, 28 * u, 8 * u, 22 * u); tri(-30, 4, -54, -6, -32, 16); break;
    case "dragon": body(26, 28, 12); body(18, 15, -28); tri(-18, -6, -66, -44, -24, 18); tri(18, -6, 66, -44, 24, 18); tri(-8, -38, -14, -56, -2, -40); tri(8, -38, 14, -56, 2, -40); break;
    case "dino": body(30, 28, 14); body(22, 18, -26); for (let i = 0; i < 5; i++) tri(-26 + i * 10, -14 - (i % 2) * 4 - 26, -21 + i * 10, -54 + Math.abs(i - 2) * 6, -16 + i * 10, -40); tri(24, 26, 58, 40, 22, 40); break;
    case "frita": ctx.fillRect(-26 * u, -8 * u, 52 * u, 50 * u); for (let i = 0; i < 5; i++) ctx.fillRect((-22 + i * 10) * u, (-40 - (i % 2) * 10) * u, 6 * u, 36 * u); body(10, 10, 52); break;
    case "pizza": tri(-36, -34, 36, -34, 0, 48); body(36, 8, -36); body(22, 16, -48); break;
    case "yomi": body(26, 30, 10); body(24, 22, -26); ctx.fillRect(-1.5 * u, -66 * u, 3 * u, 20 * u); body(5, 5, -68); ctx.save(); ctx.globalAlpha *= 0.45; ctx.beginPath(); ctx.arc(0, -10 * u, 44 * u, 0, Math.PI * 2); ctx.lineWidth = 3 * u; ctx.strokeStyle = color; ctx.stroke(); ctx.restore(); break;
    default: body(30, 36, 0); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.02; ctx.beginPath(); ctx.arc(Math.cos(a) * 44 * u, Math.sin(a) * 44 * u, 5 * u, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
const STARS = Array.from({ length: 60 }, (_, i) => [((i * 7919) % 997) / 997, ((i * 104729) % 991) / 991, 1 + (i % 3)]);

export function drawWorld1Select(ctx, W, H, t, sel, { drawActor = null, reduceMotion = false } = {}) {
  W = Math.max(1, num(W, 1280)); H = Math.max(1, num(H, 720)); t = num(t); sel.t++;
  if (sel.pulse > 0) sel.pulse--; if (sel.deny > 0) sel.deny--;
  const cur = sel.cards[sel.index] || sel.cards[0];
  ctx.save();
  // A chapter theatre, with illuminated doors and a shared constellation.
  ctx.fillStyle='#101c30';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#192e43';ctx.beginPath();ctx.ellipse(W/2,H*.52,W*.6,H*.55,0,0,Math.PI*2);ctx.fill();
  for(let i=0;i<48;i++){const x=((i*7919)%997)/997*W,y=((i*317)%991)/991*H;
   ctx.globalAlpha=reduceMotion?.4:.25+Math.sin(t*.018+i)*.15;ctx.fillStyle='#f5d89e';ctx.fillRect(x,y,2,2);}
  ctx.globalAlpha=1;ctx.strokeStyle='#bca578';ctx.lineWidth=1;
  ctx.strokeRect(7,7,W-14,H-14);
  ctx.fillStyle="#ffe7b4";
  ctx.globalAlpha = 1; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.round(Math.min(H * 0.05,W * .055))}px sans-serif`; ctx.fillText("OHANA · El libro de la familia", W / 2, H * 0.07,W*.92);
  ctx.font = `${Math.round(H * 0.026)}px sans-serif`; ctx.fillStyle = "#c8d9db";
  const sealedN = sel.cards.filter((c) => c.sealed).length;
  ctx.fillText(`Diez protagonistas · Diez sellos · Un enemigo final · ${sealedN}/10`, W / 2, H * 0.125,W*.92);
  const rects = layout(sel, W, H);
  sel.cards.forEach((c, i) => {
    const r = rects[i], focus = i === sel.index, lift = focus ? (reduceMotion ? 0 : 6 + Math.sin(t * 0.08) * 2) : 0;
    const x = r.x, y = r.y - lift, w = r.w, h = r.h, shake = focus && sel.deny ? Math.sin(sel.deny) * 4 : 0;
    ctx.save(); ctx.translate(shake, 0);
    ctx.globalAlpha = c.unlocked ? 1 : 0.83;
    ctx.fillStyle = focus ? "#284b60" : "#1b3048"; roundRect(ctx, x, y, w, h, 14); ctx.fill();
    ctx.fillStyle = c.tint; ctx.globalAlpha *= 0.28; roundRect(ctx, x + 4, y + 4, w - 8, h * 0.62, 11); ctx.fill();
    ctx.globalAlpha = c.unlocked ? 1 : 0.83;
    ctx.lineWidth = focus ? 4 : 2; ctx.strokeStyle = focus ? "#ffe0a4" : "#546b80"; roundRect(ctx, x, y, w, h, 14); ctx.stroke();
    ctx.fillStyle="#c2d8e1";ctx.font="bold 10px sans-serif";
    ctx.fillText(c.final?'FINAL':`CAPÍTULO ${String(i+1).padStart(2,'0')}`,x+w/2,y+12,w*.8);
    // Door: the chapter protagonist, not a freely interchangeable avatar.
    const pcx = x + w / 2, pcy = y + h * 0.36, pr = Math.min(w * 0.36, h * 0.25);
    ctx.strokeStyle = c.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(pcx, pcy, pr, pr * 1.15, 0, 0, Math.PI * 2); ctx.stroke();
    if (!c.final && drawActor) { try { drawActor(ctx, c.hero, pcx, pcy + pr * 0.9, pr / 40); } catch (_) { drawHeroEmblem(ctx, c.hero, pcx, pcy, pr * 1.5, c.color, t); } }
    else drawHeroEmblem(ctx, c.hero, pcx, pcy, pr * 1.5, c.color, reduceMotion ? 0 : t);
    if (!c.unlocked) { ctx.fillStyle = "#c5d6df"; ctx.font = `bold ${Math.round(pr * 0.35)}px sans-serif`; ctx.fillText("🔒", x + w - 16, y + 18); }
    ctx.fillStyle = "#fff0cc"; ctx.font = `bold ${Math.max(12,Math.round(Math.min(w * 0.12, h * 0.085)))}px sans-serif`; ctx.fillText(c.name, pcx, y + h * 0.67,w*.9);
    ctx.fillStyle = "#c3d2df"; ctx.font = `${Math.round(Math.min(w * 0.075, h * 0.05))}px sans-serif`; if(W>=600)ctx.fillText(c.roomName, pcx, y + h * 0.77,w*.9);
    if (!c.final) {
      const bw = w * 0.7, bx = pcx - bw / 2, by = y + h * 0.83;
      ctx.fillStyle = "#101e32"; ctx.fillRect(bx, by, bw, 6); ctx.fillStyle = c.color; ctx.fillRect(bx, by, bw * c.found / 100, 6);
      ctx.fillStyle = "#d2dfe8"; ctx.font = `${Math.max(9,Math.round(h * 0.042))}px sans-serif`; ctx.fillText(`${c.found}/100`, pcx, by + 11);
    }
    if (c.sealed) { ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(x + w - 18, y + 18, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#1e1838"; ctx.font = "bold 14px sans-serif"; ctx.fillText("✓", x + w - 18, y + 19); }
    ctx.restore();
  });
  // Pie: frase del héroe enfocado + qué hay en su sala.
  ctx.fillStyle="#192e43";roundRect(ctx,8,H*.855,W-16,H*.14,12);ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = "#fff0cc"; ctx.font = `bold ${Math.round(H * 0.034)}px sans-serif`;
  ctx.fillText(cur.tagline, W / 2, H * 0.89,W*.92);
  ctx.fillStyle = "#c5d6df"; ctx.font = `${Math.round(H * 0.022)}px sans-serif`;
  ctx.fillText(cur.final ? "Corazón de Ohana · Quimera final" : `Sello: ${cur.seal}${cur.sealed ? " · recuperado" : ""}`, W / 2, H * 0.935,W*.92);
  ctx.fillText(cur.final ? "Reúne los diez sellos" : `Reliquia: ${cur.relic}`,W / 2,H*.97,W*.92);
  if (sel.pulse > 0) { ctx.globalAlpha = sel.pulse / 30 * 0.5; ctx.fillStyle = cur.color; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

export const OhanaWorld1Select = Object.freeze({ cards: world1SelectCards, create: createWorld1Select, refresh: refreshWorld1Select, key: world1SelectKey, pointer: world1SelectPointer, draw: drawWorld1Select, emblem: drawHeroEmblem, taglines: WORLD1_TAGLINES, name: heroDisplayName });
if (typeof globalThis !== "undefined") globalThis.OhanaWorld1Select = OhanaWorld1Select;
