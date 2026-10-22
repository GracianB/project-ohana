// OHANA V467 · MUNDO 1 · sellos, cinemáticas de sala y fondo-silueta del héroe.
// Cada sala tiene UNA interacción propia (WORLD1_SEALS); el resto es sencillo.
// Determinista: sin Math.random, sin degradados por fotograma y con geometría finita.
import { WORLD1_ROOMS, WORLD1_THEMES, WORLD1_SEALS, WORLD1_ORDER, WORLD1_ARENA, isWorld1Room, world1DoorOpen, cleanWorld1Seals, world1SealsComplete } from "./world1-rooms.js";
import { WORLD1_ROOM_STORY, FUSION_STORY, WORLD1_TITLE } from "./world1-story.js";
import { ROSTER } from "../characters/roster.js";

const CHAIN_TICKS = 420, PIZZA_TICKS = 1500, HOLD_TICKS = 45;
const cx = (p) => p.x + p.w / 2, cy = (p) => p.y + p.h / 2;
const heroName = (id) => ROSTER.find((r) => r.id === id)?.name || id;

export function enterWorld1(g) {
  const r = g.roomDef;
  g.world1Seals = cleanWorld1Seals(g.world1Seals);
  if (!r || !isWorld1Room(r.id)) { g.world1 = null; return null; }
  const done = r.hero && g.world1Seals.includes(r.hero);
  const stations = (r.seal?.stations || []).map((s) => ({ ...s, target: s.target ? { ...s.target } : undefined, prize: s.prize ? { ...s.prize } : undefined, done: !!done, hold: 0, glow: 0 }));
  const first = !g.world1Visited?.[r.id];
  (g.world1Visited ||= {})[r.id] = true;
  const idx = WORLD1_ORDER.indexOf(r.hero);
  const story = r.hero ? WORLD1_ROOM_STORY[r.hero] : null;
  g.world1 = {
    room: r.id, hero: r.hero, kind: r.seal?.kind || null, stations, sealed: !!done,
    carry: null, chainUntil: 0, order: 0, pizzaUntil: 0, wasGrounded: true, prevVy: 0, tick: 0, flash: 0,
    cinema: first ? {
      t: 0, max: g.reduceMotion ? 90 : 210,
      kicker: r.fusionBoss ? WORLD1_TITLE + " · Sala final" : WORLD1_TITLE + " · Sala " + (idx + 1) + "/10",
      title: r.name, line: r.fusionBoss ? FUSION_STORY.procession : story?.enter || "", color: r.color
    } : null,
    statuesLit: r.statues ? r.statues.map((s) => g.world1Seals.includes(s.hero)) : null
  };
  return g.world1;
}

export function world1Snapshot(g) {
  const w = g.world1; if (!w) return null;
  return { room: w.room, hero: w.hero, kind: w.kind, done: w.stations.filter((s) => s.done && s.kind !== "oven").length, total: WORLD1_SEALS[w.kind]?.count || 0, sealed: w.sealed, seals: [...(g.world1Seals || [])] };
}

function playerAttacking(g, s, range = 90) {
  const p = g.player;
  if ((p.melee || 0) > 0 && Math.abs(cx(p) - s.x) < range && Math.abs(p.y + p.h - s.y) < 140) return true;
  for (const pr of g.projectiles || []) if (pr.owner === "player" && Math.abs(pr.x - s.x) < 60 && Math.abs(pr.y - (s.y - 50)) < 90) return true;
  return false;
}
const near = (p, x, y, rx = 46, ry = 60) => Math.abs(cx(p) - x) < rx && Math.abs(cy(p) - y) < ry;
const onPad = (p, s, rx = 54) => Math.abs(cx(p) - s.x) < rx && Math.abs(p.y + p.h - s.y) < 14 && p.grounded;

function complete(g, s, label) {
  if (s.done) return false;
  s.done = true; s.glow = 60;
  const p = g.player, w = g.world1, need = WORLD1_SEALS[w.kind].count;
  const n = w.stations.filter((x) => x.done && x.kind !== "oven").length;
  g.nums?.add?.(s.x, s.y - 90, label + " " + n + "/" + need, WORLD1_THEMES[w.hero]?.color || "#fff", true);
  g.fx?.emit?.(s.x, s.y - 50, { color: WORLD1_THEMES[w.hero]?.color || "#fff", count: g.reduceMotion ? 6 : 20, size: 4, up: 2, star: true, life: 30 });
  // A timed chain can restart: each physical station grants score only once.
  if (!s._scored) { g.score = (g.score || 0) + 150; s._scored = true; }
  g.onWorld1Beat?.("station", w.hero);
  if (n >= need) awardSeal(g);
  return true;
}

export function awardSeal(g) {
  const w = g.world1; if (!w || w.sealed || !w.hero) return false;
  w.sealed = true; w.flash = 40;
  g.world1Seals = cleanWorld1Seals([...(g.world1Seals || []), w.hero]);
  const p = g.player;
  if (p) { p.health = Math.min(p.maxHealth || p.health, (p.health || 0) + 25); p.xp = (p.xp || 0) + 3; }
  w.cinema = { t: 0, max: g.reduceMotion ? 90 : 200, kicker: "Sello despertado · " + w.stations.length + " ecos", title: "SELLO DE " + heroName(w.hero).toUpperCase(), line: WORLD1_ROOM_STORY[w.hero].seal, color: WORLD1_THEMES[w.hero].color, seal: true };
  g.flash = Math.max(g.flash || 0, g.reduceMotion ? 3 : 12); g.flashColor = WORLD1_THEMES[w.hero].color;
  g.onWorld1Beat?.("seal", w.hero);
  g.save?.();
  return true;
}

export function updateWorld1(g) {
  const w = g.world1, p = g.player, r = g.roomDef;
  if (!w || !p || p.dead || !r || r.id !== w.room) return;
  w.tick++;
  if (w.cinema && ++w.cinema.t >= w.cinema.max) w.cinema = null;
  if (w.flash > 0) w.flash--;
  for (const s of w.stations) if (s.glow > 0) s.glow--;
  if (r.fusionBoss) return updateFinalRoom(g, w, p, r);
  if (w.sealed) return;
  const airborne = !p.grounded;
  switch (w.kind) {
    case "serenata":
      for (const s of w.stations) { if (s.done) continue; if (onPad(p, s, 50) && Math.abs(p.vx || 0) < 1.2) { if (++s.hold >= HOLD_TICKS) complete(g, s, "NOTA"); } else s.hold = Math.max(0, s.hold - 2); }
      break;
    case "reparar":
      // Piece 0 is a valid carried item. A truthiness check makes it look empty
      // and prevents delivery of the first part (blocking Stitcho's seal).
      if (w.carry == null) { for (const s of w.stations) if (!s.done && near(p, s.x, s.y - 30, 50, 70)) { w.carry = s.id; g.nums?.add?.(p.x, p.y - 40, "PIEZA COGIDA → TALLER", "#8cecff", false); break; } }
      else { const s = w.stations.find((x) => x.id === w.carry); if (s && near(p, s.target.x, s.target.y - 30, 60, 80)) { w.carry = null; complete(g, s, "NAVE"); } }
      break;
    case "cadena": {
      // Reset before selecting the active rod. Selecting first allowed an old
      // second/third rod to auto-complete on the exact frame of expiration.
      if (w.order > 0 && w.tick > w.chainUntil) {
        for (const s of w.stations) { s.done = false; s.glow = 0; }
        w.order = 0; w.chainUntil = 0;
        g.nums?.add?.(p.x, p.y - 40, "LA CHISPA SE APAGÓ · VUELVE AL PRIMERO", "#ffe28a", true);
      }
      const next = w.stations.find((s) => !s.done);
      if (next && near(p, next.x, next.y - 40, 50, 90)) {
        w.order++; w.chainUntil = w.tick + CHAIN_TICKS; complete(g, next, "PARARRAYOS");
      }
      break; }
    case "medusas":
      for (const s of w.stations) if (!s.done && airborne && near(p, s.x, s.y, 48, 52)) complete(g, s, "MEDUSA");
      break;
    case "prismas":
      for (const s of w.stations) if (!s.done && near(p, s.x, s.y - 40, 50, 90)) {
        if (s.order === w.order) { w.order++; complete(g, s, "PRISMA"); }
        else if (!s._warned || w.tick - s._warned > 120) { s._warned = w.tick; g.nums?.add?.(s.x, s.y - 120, "ESTE ES EL PRISMA " + ["I","II","III"][s.order], "#eccbff", false); }
      }
      break;
    case "braseros":
      for (const s of w.stations) if (!s.done && playerAttacking(g, s)) complete(g, s, "BRASERO");
      break;
    case "pisotones":
      if (p.grounded && !w.wasGrounded && w.prevVy > 6) for (const s of w.stations) if (!s.done && Math.abs(cx(p) - s.x) < 70) complete(g, s, "FÓSIL");
      break;
    case "geiseres":
      for (const s of w.stations) {
        if (s.done) continue;
        if (onPad(p, s, 46)) { p.vy = -21; p.grounded = false; p.jumps = 0; g.fx?.emit?.(s.x, s.y - 10, { color: "#ffd65a", count: g.reduceMotion ? 4 : 12, size: 4, up: 3, life: 24 }); }
        if (near(p, s.prize.x, s.prize.y, 55, 60)) complete(g, s, "PATATA");
      }
      break;
    case "reparto": {
      const oven = w.stations.find((s) => s.kind === "oven");
      if (!w.carry && near(p, oven.x, oven.y - 40, 60, 90)) { w.carry = "pizza"; w.pizzaUntil = w.tick + PIZZA_TICKS; g.nums?.add?.(p.x, p.y - 40, "¡PIZZA RECIÉN HECHA! · 25 s", "#ffd36a", true); }
      if (w.carry === "pizza") {
        if (w.tick > w.pizzaUntil) { w.carry = null; g.nums?.add?.(p.x, p.y - 40, "SE ENFRIÓ · VUELVE AL HORNO", "#ffb08a", true); }
        else for (const s of w.stations) if (s.kind === "guest" && !s.done && near(p, s.x, s.y - 40, 60, 90)) { complete(g, s, "CLIENTE"); w.carry = null; break; }
      }
      break; }
    case "sincronia":
      for (const s of w.stations) if (!s.done && nodeLive(w.tick, s) && near(p, s.x, s.y - 40, 50, 90)) complete(g, s, "NODO");
      break;
  }
  if (!p.grounded) w.prevVy = p.vy || 0;
  w.wasGrounded = !!p.grounded;
}

export function nodeLive(tick, s) { return ((tick + (s.phase || 0)) % 120) < 60; }

function updateFinalRoom(g, w, p, r) {
  // Las estatuas se encienden al pasar; la arena despierta a la Quimera.
  r.statues.forEach((s, i) => { if (!w.statuesLit[i] && Math.abs(cx(p) - s.x) < 120 && g.world1Seals.includes(s.hero)) { w.statuesLit[i] = true; g.fx?.emit?.(s.x, s.y - 200, { color: WORLD1_THEMES[s.hero].color, count: g.reduceMotion ? 4 : 14, size: 4, up: 2, star: true, life: 28 }); } });
  const won = !!g.world1Won;
  if (!won && !g.boss && cx(p) > WORLD1_ARENA.start) g.spawnFusionBoss?.();
  if (g.boss?._fusionBoss && !won && !g.finale) {
    // Una vez dentro, la arena se cierra por detrás (como el Nido).
    if (p.x < WORLD1_ARENA.left - 120) { p.x = WORLD1_ARENA.left - 120; p.vx = Math.max(0, p.vx || 0); }
  }
}

export function world1DoorState(g) {
  return { seals: g.world1Seals || [], won: !!g.world1Won, bossActive: !!(g.boss?._fusionBoss && !g.world1Won) };
}
export function world1CanLeave(g, dir) { return world1DoorOpen(g.roomId, dir, world1DoorState(g)); }
export function world1LockedMessage(g) {
  const r = WORLD1_ROOMS[g.roomId]; if (!r) return "";
  if (r.fusionBoss) return "La Quimera bloquea el camino.";
  const seal = WORLD1_SEALS[r.seal.kind];
  return "Sello de " + heroName(r.hero) + " dormido · " + seal.title + ": " + seal.verb + ".";
}
export { world1SealsComplete };

/* ───────────────────────────── DIBUJO ───────────────────────────── */

const silhouettes = new Map();
// Silueta gigante del héroe de la sala, dibujada una vez en un lienzo aparte y
// teñida con su color; detrás, un halo plano. Sin degradados por fotograma.
export function drawWorld1Silhouette(ctx, g, cam, t, W, H, drawDummyFn, makeDummyFn, baseHeightFn) {
  const r = g.roomDef; if (!r?.world1) return;
  const heroes = r.hero ? [r.hero] : WORLD1_ORDER;
  const reduce = !!g.reduceMotion;
  heroes.forEach((hero, i) => {
    const theme = WORLD1_THEMES[hero];
    const img = silhouetteFor(hero, theme.tint, drawDummyFn, makeDummyFn, baseHeightFn);
    const span = r.hero ? 1 : heroes.length;
    const h = r.hero ? H * .82 : H * .46;
    const par = r.hero ? .06 : .12;
    const base = r.hero ? W * .58 : (i + .5) * (r.width / span) * .2 + W * .1;
    const x = base - (cam.x * par) % (r.hero ? W * 1.4 : W * 3);
    const y = H * .94 + (reduce ? 0 : Math.sin(t * .012 + i) * 6);
    ctx.save();
    ctx.globalAlpha = r.hero ? .2 : .14;
    ctx.fillStyle = theme.tint;
    ctx.beginPath(); ctx.ellipse(x, y - h * .5, h * .42, h * .5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = r.hero ? .34 : .24;
    if (img) ctx.drawImage(img, x - h * .5, y - h, h, h);
    else drawEmblem(ctx, hero, x, y - h * .5, h * .35, theme.tint);
    ctx.restore();
  });
}
function silhouetteFor(hero, color, drawDummyFn, makeDummyFn, baseHeightFn) {
  if (silhouettes.has(hero)) return silhouettes.get(hero);
  let canvas = null;
  try {
    if (typeof document !== "undefined" && drawDummyFn && makeDummyFn) {
      canvas = document.createElement("canvas"); canvas.width = canvas.height = 512;
      const c = canvas.getContext("2d"), d = makeDummyFn(hero, 4, color);
      d.facing = -1; d.grounded = true; d._poseOverride = "idle";
      drawDummyFn(c, d, 256, 492, 430 / Math.max(1, baseHeightFn?.(hero, 4) || 100), 0);
      c.globalCompositeOperation = "source-in"; c.fillStyle = color; c.fillRect(0, 0, 512, 512);
    }
  } catch (_) { canvas = null; }
  silhouettes.set(hero, canvas);
  return canvas;
}
function drawEmblem(ctx, hero, x, y, s, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha *= .6; ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(s) + "px Outfit, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(heroName(hero).slice(0, 1), x, y);
}

export function drawWorld1(ctx, g, cam, t) {
  const w = g.world1, r = g.roomDef; if (!w || !r) return;
  const reduce = !!g.reduceMotion, col = WORLD1_THEMES[w.hero]?.color || "#ffd6f2";
  const vis = (x) => x - cam.x > -200 && x - cam.x < (g.viewW || 1600) + 200;
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (r.fusionBoss) {
    r.statues.forEach((s, i) => { if (vis(s.x)) drawStatue(ctx, s, cam, w.statuesLit[i], t, reduce); });
    ctx.restore(); return;
  }
  for (const s of w.stations) {
    if (!vis(s.x) && !(s.target && vis(s.target.x)) && !(s.prize && vis(s.prize.x))) continue;
    drawStation(ctx, g, w, s, cam, t, reduce, col);
  }
  // Altar del sello junto a la salida del este.
  const a = r.seal.altar, ax = a.x - cam.x, ay = a.y - cam.y;
  if (vis(a.x)) {
    ctx.fillStyle = "#2b2438"; ctx.fillRect(ax - 60, ay - 26, 120, 26);
    ctx.fillStyle = w.sealed ? col : "#5b5470"; ctx.beginPath(); ctx.moveTo(ax - 40, ay - 26); ctx.lineTo(ax, ay - 150); ctx.lineTo(ax + 40, ay - 26); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#fff4dc"; ctx.lineWidth = 2; ctx.stroke();
    ctx.globalAlpha = w.sealed ? .5 + (reduce ? 0 : Math.sin(t * .06) * .2) : .2;
    ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(ax, ay - 92, 54, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = "#fff"; ctx.font = "800 14px Outfit, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(w.sealed ? "SELLO DESPIERTO · ESTE →" : "SELLO DORMIDO", ax, ay - 168);
  }
  // Lo que llevas encima (pieza o pizza).
  if (w.carry != null) {
    const p = g.player, px = cx(p) - cam.x, py = p.y - cam.y - 26;
    ctx.fillStyle = w.carry === "pizza" ? "#ffcf5a" : "#7fd7ff"; ctx.strokeStyle = "#3a2a1a"; ctx.lineWidth = 2;
    ctx.beginPath(); if (w.carry === "pizza") { ctx.moveTo(px - 14, py - 8); ctx.lineTo(px + 14, py - 8); ctx.lineTo(px, py + 14); } else { ctx.moveTo(px - 10, py - 10); ctx.lineTo(px + 10, py - 10); ctx.lineTo(px + 10, py + 10); ctx.lineTo(px - 10, py + 10); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// V473: the five lunar jellyfish are cat descendants, not generic sleeping
// jellyfish. Every dome has rooted feline ears, a moon-horn, whiskers and a
// face; their breathing bell and nine-partner lineage match Michicornio F2/F4.
// Draw in world/viewport pixels so this same routine works in normal gameplay
// and in the deterministic real-browser art audit.
const LUNAR_JELLY_COLORS = Object.freeze([
  { bell: "#c8aafa", rim: "#f5d9ff", ear: "#ffbfdc", ink: "#47315f", glow: "#ffeead" },
  { bell: "#a5cbff", rim: "#e3f5ff", ear: "#f7bddd", ink: "#314e71", glow: "#ffe6a0" },
  { bell: "#eeabe7", rim: "#fff0fc", ear: "#ffcbdb", ink: "#673759", glow: "#ffe7af" },
  { bell: "#baa5f4", rim: "#e9e0ff", ear: "#ffc3e3", ink: "#4a3c73", glow: "#fff0c2" },
  { bell: "#acdce2", rim: "#eaffed", ear: "#ffbcd8", ink: "#355c68", glow: "#ffe9b5" }
]);
export function drawWorld1MoonJelly(ctx, s, t = 0, reduceMotion = false) {
  const id = Math.max(0, Math.trunc(Number(s.id) || 0)), done = !!s.done;
  const pal = LUNAR_JELLY_COLORS[id % LUNAR_JELLY_COLORS.length];
  const time = reduceMotion ? 0 : (Number.isFinite(t) ? t : 0);
  const pulse = reduceMotion ? 0 : Math.sin(time * .075 + id * 1.9);
  const bell = 1 + pulse * .065;
  const float = reduceMotion ? 0 : Math.sin(time * .048 + id * 1.35) * 5;
  const x = Number(s.x) || 0, y = (Number(s.y) || 0) + float;
  const ink = pal.ink, TAU = Math.PI * 2;
  const line = (color, width) => { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = "round"; ctx.lineJoin = "round"; };
  ctx.save();

  // Tentacles originate from the same five sockets on the bell: elastic
  // follow-through, stronger when the jelly wakes, still in reduced motion.
  for (let k = -2; k <= 2; k++) {
    const rootX = x + k * 12 * bell;
    const wave = reduceMotion ? 0 : Math.sin(time * .095 + k * 1.4 + id) * (done ? 8 : 5);
    const reach = 38 + (k % 2 === 0 ? 6 : 0) + (done ? 4 : 0);
    line(k === 0 ? pal.glow : pal.rim, k === 0 ? 5 : 3.7);
    ctx.beginPath();ctx.moveTo(rootX, y - 2);
    ctx.bezierCurveTo(rootX + wave * .65, y + 14, rootX + k * 4 - wave, y + reach * .7, rootX + wave * 1.3 + k * 2, y + reach);
    ctx.stroke();
    ctx.fillStyle = done ? pal.glow : pal.ear;
    ctx.beginPath();ctx.arc(rootX + wave * 1.3 + k * 2, y + reach, 2.5, 0, TAU);ctx.fill();
  }

  // Ears are anatomically connected to the dome, with the cat's pink inner
  // triangle; unlike a decorative floating symbol, they travel with the bell.
  for (const side of [-1, 1]) {
    const flick = reduceMotion ? 0 : Math.sin(time * .11 + id + side) * 2.5;
    ctx.beginPath();ctx.moveTo(x + side * 12, y - 27);
    ctx.quadraticCurveTo(x + side * 24, y - 52, x + side * 29, y - 58 + flick);
    ctx.quadraticCurveTo(x + side * 39, y - 32, x + side * 30, y - 15);
    ctx.closePath();ctx.fillStyle = pal.bell;ctx.fill();line(ink, 2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x + side * 20, y - 33);
    ctx.lineTo(x + side * 29, y - 49 + flick);ctx.lineTo(x + side * 29, y - 24);
    ctx.closePath();ctx.fillStyle = pal.ear;ctx.fill();
  }

  // Moon-jelly bell: a shallow transparent mantle with an illuminated edge.
  const half = 37 * bell;
  ctx.globalAlpha = done ? .98 : .83;
  ctx.beginPath();ctx.moveTo(x - half, y);
  ctx.bezierCurveTo(x - half - 4, y - 22, x - 22, y - 45, x, y - 46);
  ctx.bezierCurveTo(x + 22, y - 45, x + half + 4, y - 22, x + half, y);
  ctx.quadraticCurveTo(x, y + 6 + pulse * 1.7, x - half, y);
  ctx.closePath();ctx.fillStyle = pal.bell;ctx.fill();line(done ? pal.glow : pal.rim, 3);ctx.stroke();
  ctx.globalAlpha = .35;
  ctx.beginPath();ctx.ellipse(x - 10, y - 28, 12, 4.5, -.3, 0, TAU);
  ctx.fillStyle = "#fff";ctx.fill();
  ctx.globalAlpha = 1;

  // One real horn that grows with the same lunar ancestry as F0 → F4.
  ctx.beginPath();ctx.moveTo(x - 5, y - 41);ctx.lineTo(x, y - 62);
  ctx.lineTo(x + 5, y - 41);ctx.closePath();ctx.fillStyle = pal.glow;
  ctx.fill();line(ink, 1.6);ctx.stroke();

  // Awake after a successful aerial touch; sleepy before it.
  const blinking = !reduceMotion && done && ((time + id * 39) % 190 < 7);
  for (const side of [-1, 1]) {
    const eyeX = x + side * 14, eyeY = y - 19;
    if (!done || blinking) {
      line(ink, 2.5);ctx.beginPath();ctx.moveTo(eyeX - 5, eyeY);
      ctx.quadraticCurveTo(eyeX, eyeY + (done ? 2 : 4), eyeX + 5, eyeY);ctx.stroke();
    } else {
      ctx.fillStyle = "#fff";ctx.beginPath();ctx.ellipse(eyeX, eyeY, 5.3, 6.2, 0, 0, TAU);ctx.fill();
      ctx.fillStyle = ink;ctx.beginPath();ctx.ellipse(eyeX + side * .8, eyeY + .5, 2.6, 4.2, 0, 0, TAU);ctx.fill();
      ctx.fillStyle = "#fff";ctx.beginPath();ctx.arc(eyeX - 1, eyeY - 2, 1.5, 0, TAU);ctx.fill();
    }
    // Real whiskers and cheek blush, not a second face drawn on top.
    ctx.fillStyle = pal.ear;ctx.beginPath();ctx.ellipse(x + side * 25, y - 10, 4.2, 2.7, 0, 0, TAU);ctx.fill();
    line(ink, 1.1);
    for (const dy of [0, 5]) {
      ctx.beginPath();ctx.moveTo(x + side * 25, y - 10 + dy);
      ctx.lineTo(x + side * 40, y - 14 + dy);ctx.stroke();
    }
  }
  ctx.fillStyle = pal.ear;ctx.beginPath();ctx.moveTo(x - 3.3, y - 11);
  ctx.lineTo(x + 3.3, y - 11);ctx.lineTo(x, y - 8);ctx.closePath();ctx.fill();
  line(ink, 1.6);ctx.beginPath();ctx.moveTo(x, y - 8);
  ctx.quadraticCurveTo(x - 5, y - (done ? 1 : 4), x - 8, y - 6);
  ctx.moveTo(x, y - 8);ctx.quadraticCurveTo(x + 5, y - (done ? 1 : 4), x + 8, y - 6);ctx.stroke();

  // Tiny stars show the awakened objective without an obscuring text label.
  if (done) for (const side of [-1, 1]) {
    const a = reduceMotion ? 0 : Math.sin(time * .07 + side + id) * 3;
    const sx = x + side * 49, sy = y - 35 + a;
    line(pal.glow, 2.1);ctx.beginPath();ctx.moveTo(sx - 4, sy);
    ctx.lineTo(sx + 4, sy);ctx.moveTo(sx, sy - 5);ctx.lineTo(sx, sy + 5);ctx.stroke();
  }
  ctx.restore();
}

function drawStation(ctx, g, w, s, cam, t, reduce, col) {
  const x = s.x - cam.x, y = s.y - cam.y, done = s.done, pulse = reduce ? 0 : Math.sin(t * .08 + s.id) * 3;
  ctx.lineWidth = 3; ctx.strokeStyle = "#fff6e0";
  switch (s.kind) {
    case "flower": {
      ctx.fillStyle = "#2f7a4c"; ctx.fillRect(x - 3, y - 50, 6, 50);
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + (done ? t * .01 : 0); ctx.fillStyle = done ? col : "#9a6f86"; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 16, y - 62 + Math.sin(a) * 16, 13, 8, a, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = "#ffe27a"; ctx.beginPath(); ctx.arc(x, y - 62, 7, 0, Math.PI * 2); ctx.fill();
      if (!done && s.hold > 0) { ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, y - 62, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.hold / HOLD_TICKS); ctx.stroke(); }
      ctx.fillStyle = "#fff"; ctx.font = "700 16px Outfit, sans-serif"; ctx.textAlign = "center"; ctx.fillText(["♩","♪","♫","♬"][s.note], x, y - 100 + pulse); break; }
    case "part": {
      if (!done && w.carry !== s.id) { ctx.fillStyle = "#7fd7ff"; ctx.save(); ctx.translate(x, y - 30 + pulse); ctx.rotate(.4); ctx.fillRect(-14, -14, 28, 28); ctx.strokeRect(-14, -14, 28, 28); ctx.restore(); }
      const tx = s.target.x - cam.x, ty = s.target.y - cam.y;
      ctx.fillStyle = done ? "#3fa3ff" : "#33405a"; ctx.fillRect(tx - 50, ty - 70, 100, 70);
      ctx.strokeStyle = done ? "#bff2ff" : "#67ddff"; ctx.setLineDash?.([6, 6]); ctx.strokeRect(tx - 50, ty - 70, 100, 70); ctx.setLineDash?.([]);
      ctx.fillStyle = "#fff"; ctx.font = "700 12px Outfit, sans-serif"; ctx.textAlign = "center"; ctx.fillText(done ? "COSIDO ✓" : "TALLER " + (s.id + 1), tx, ty - 80); break; }
    case "rod": {
      ctx.strokeStyle = done ? "#fff29a" : "#8a8a9a"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 130); ctx.stroke();
      ctx.fillStyle = done ? "#fff29a" : "#c8c8d8"; ctx.beginPath(); ctx.arc(x, y - 136, 10, 0, Math.PI * 2); ctx.fill();
      if (done && !reduce) { ctx.strokeStyle = "#fff8c4"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 146); for (let k = 1; k < 5; k++) ctx.lineTo(x + ((k * 37 + t) % 20) - 10, y - 146 - k * 16); ctx.stroke(); }
      ctx.fillStyle = "#fff"; ctx.font = "700 13px Outfit, sans-serif"; ctx.textAlign = "center"; ctx.fillText(String(s.id + 1), x, y - 160); break; }
    case "jelly": {
      drawWorld1MoonJelly(ctx, { x, y, id: s.id, done }, t, reduce);
      break; }
    case "prism": {
      ctx.fillStyle = done ? "#eccbff" : "#6c5d86"; ctx.beginPath(); ctx.moveTo(x, y - 120); ctx.lineTo(x + 34, y - 20); ctx.lineTo(x - 34, y - 20); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (done) { const cols = ["#ff8fb1", "#ffe27a", "#8cecff", "#b8ef6b"]; cols.forEach((c, k) => { ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 10, y - 70); ctx.lineTo(x + 140, y - 110 + k * 14); ctx.stroke(); }); }
      ctx.fillStyle = "#fff"; ctx.font = "900 16px Outfit, sans-serif"; ctx.textAlign = "center"; ctx.fillText(["I", "II", "III"][s.order], x, y - 130); break; }
    case "brazier": {
      ctx.fillStyle = "#3d2a2a"; ctx.beginPath(); ctx.moveTo(x - 30, y - 60); ctx.lineTo(x + 30, y - 60); ctx.lineTo(x + 16, y); ctx.lineTo(x - 16, y); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (done) for (let k = 0; k < 3; k++) { ctx.fillStyle = ["#ff5a3c", "#ff9d4a", "#ffe27a"][k]; const f = reduce ? 0 : Math.sin(t * .2 + k) * 5; ctx.beginPath(); ctx.moveTo(x - 22 + k * 7, y - 60); ctx.quadraticCurveTo(x, y - 120 - k * 10 + f, x + 22 - k * 7, y - 60); ctx.closePath(); ctx.fill(); }
      else { ctx.fillStyle = "#aaa"; ctx.font = "700 12px Outfit, sans-serif"; ctx.textAlign = "center"; ctx.fillText("¡GOLPEA!", x, y - 76); }
      break; }
    case "fossil": {
      ctx.fillStyle = done ? "#d8f7a8" : "#9b8f74"; ctx.beginPath(); ctx.ellipse(x, y - 6, 66, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = done ? "#4b8f3a" : "#5c5240"; ctx.lineWidth = 3; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(x + k * 18, y - 14); ctx.lineTo(x + k * 18, y + 2); ctx.stroke(); }
      if (!done) { ctx.fillStyle = "#fff"; ctx.font = "700 12px Outfit, sans-serif"; ctx.textAlign = "center"; ctx.fillText("↓ PISOTÓN", x, y - 34 + pulse); }
      break; }
    case "geyser": {
      ctx.fillStyle = "#5a3e1e"; ctx.fillRect(x - 40, y - 14, 80, 14);
      ctx.globalAlpha = .55; ctx.fillStyle = "#ffd65a"; const hh = 60 + (reduce ? 0 : (t * 3 + s.id * 40) % 50); ctx.fillRect(x - 12, y - 14 - hh, 24, hh); ctx.globalAlpha = 1;
      if (!done) { const px = s.prize.x - cam.x, py = s.prize.y - cam.y + pulse; ctx.fillStyle = "#ffcf3a"; for (let k = -1; k <= 1; k++) ctx.fillRect(px - 4 + k * 9, py - 16 - Math.abs(k) * -4, 7, 32); ctx.strokeStyle = "#fff4c2"; ctx.strokeRect(px - 18, py - 18, 36, 36); }
      break; }
    case "oven": {
      ctx.fillStyle = "#a8552e"; ctx.beginPath(); ctx.arc(x, y - 40, 60, Math.PI, 0); ctx.lineTo(x + 60, y); ctx.lineTo(x - 60, y); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#2a1208"; ctx.beginPath(); ctx.arc(x, y - 20, 26, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ff9d4a"; ctx.globalAlpha = .6 + (reduce ? 0 : Math.sin(t * .1) * .2); ctx.fillRect(x - 18, y - 30, 36, 10); ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff"; ctx.font = "700 12px Outfit, sans-serif"; ctx.textAlign = "center"; ctx.fillText("HORNO · RECOGE", x, y - 112); break; }
    case "guest": {
      ctx.fillStyle = done ? "#ffd36a" : "#7a8aa0"; ctx.beginPath(); ctx.arc(x, y - 58, 18, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 14, y - 40, 28, 40);
      ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x - 6, y - 62, 2.5, 0, Math.PI * 2); ctx.arc(x + 6, y - 62, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#222"; ctx.lineWidth = 2; ctx.beginPath(); if (done) ctx.arc(x, y - 54, 7, .2, Math.PI - .2); else { ctx.moveTo(x - 6, y - 50); ctx.lineTo(x + 6, y - 50); } ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "700 12px Outfit, sans-serif"; ctx.textAlign = "center"; ctx.fillText(done ? "¡GRACIAS!" : "¡TENGO HAMBRE!", x, y - 88 + pulse); break; }
    case "node": {
      const live = nodeLive(w.tick, s) || done;
      ctx.fillStyle = "#1b2b3a"; ctx.fillRect(x - 8, y - 90, 16, 90);
      ctx.fillStyle = done ? "#8fe9ff" : live ? "#6dff9c" : "#3c4a5a"; ctx.beginPath(); ctx.arc(x, y - 104, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (live && !done) { ctx.strokeStyle = "#6dff9c"; ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(x, y - 104, 30, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
      ctx.fillStyle = "#fff"; ctx.font = "700 11px monospace"; ctx.textAlign = "center"; ctx.fillText(done ? "SYNC ✓" : live ? "¡AHORA!" : "…", x, y - 132); break; }
  }
  if (s.glow > 0) { ctx.globalAlpha = s.glow / 60; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y - 60, 70 - s.glow * .5, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
}

function drawStatue(ctx, s, cam, lit, t, reduce) {
  const x = s.x - cam.x, y = s.y - cam.y, theme = WORLD1_THEMES[s.hero];
  ctx.fillStyle = "#3a3346"; ctx.fillRect(x - 70, y - 40, 140, 40);
  ctx.fillStyle = lit ? theme.color : "#57506a"; ctx.globalAlpha = lit ? .9 : .7;
  ctx.beginPath(); ctx.ellipse(x, y - 140, 52, 100, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  ctx.strokeStyle = "#fff4dc"; ctx.lineWidth = 2; ctx.stroke();
  if (lit) { ctx.globalAlpha = .35 + (reduce ? 0 : Math.sin(t * .05 + s.x) * .15); ctx.strokeStyle = theme.color; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y - 260, 26, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.fillStyle = "#fff"; ctx.font = "800 15px Outfit, sans-serif"; ctx.textAlign = "center"; ctx.fillText(heroName(s.hero), x, y - 12);
}

// Capa de pantalla: barra de sello y cinemática de sala con bandas negras.
export function drawWorld1Overlay(ctx, g, W, H) {
  const w = g.world1, r = g.roomDef; if (!w || !r) return;
  ctx.save(); ctx.textBaseline = "middle";
  if (!r.fusionBoss && w.kind) {
    const seal = WORLD1_SEALS[w.kind], done = w.stations.filter((s) => s.done && s.kind !== "oven").length, col = WORLD1_THEMES[w.hero].color;
    ctx.fillStyle = "rgba(9,14,28,.78)"; ctx.fillRect(18, 160, 330, 44);
    ctx.fillStyle = col; ctx.font = "800 13px Outfit, sans-serif"; ctx.textAlign = "left";
    ctx.fillText((w.sealed ? "✦ SELLO DESPIERTO · " : "SELLO · ") + seal.title + " " + done + "/" + seal.count, 28, 174);
    ctx.fillStyle = "#e8eef8"; ctx.font = "11px Outfit, sans-serif";
    let extra = "";
    if (w.kind === "cadena" && w.order > 0 && !w.sealed) extra = " · carga " + Math.max(0, Math.ceil((w.chainUntil - w.tick) / 60)) + " s";
    if (w.kind === "reparto" && w.carry === "pizza") extra = " · caliente " + Math.max(0, Math.ceil((w.pizzaUntil - w.tick) / 60)) + " s";
    ctx.fillText(w.sealed ? "La salida del este está abierta." : seal.verb.slice(0, 54) + extra, 28, 192);
  }
  // Sellos de la ruta (diez puntos).
  const seals = new Set(g.world1Seals || []);
  WORLD1_ORDER.forEach((h, i) => { ctx.fillStyle = seals.has(h) ? WORLD1_THEMES[h].color : "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.arc(30 + i * 16, 216, 5, 0, Math.PI * 2); ctx.fill(); });
  const c = w.cinema;
  if (c) {
    const k = Math.min(1, c.t / 20, (c.max - c.t) / 20), bar = H * .11 * k;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
    ctx.globalAlpha = k; ctx.textAlign = "center";
    ctx.fillStyle = "rgba(8,10,20,.72)"; ctx.fillRect(W * .15, H * .2, W * .7, 120);
    ctx.fillStyle = c.color; ctx.fillRect(W * .15, H * .2, W * .7, 3);
    ctx.fillStyle = "#cfd8ea"; ctx.font = "700 13px Outfit, sans-serif"; ctx.fillText(c.kicker.toUpperCase(), W / 2, H * .2 + 22);
    ctx.fillStyle = c.color; ctx.font = "900 32px Outfit, sans-serif"; ctx.fillText(c.title, W / 2, H * .2 + 58);
    ctx.fillStyle = "#fff6e6"; ctx.font = "600 15px Outfit, sans-serif"; ctx.fillText(c.line, W / 2, H * .2 + 96);
  }
  ctx.restore();
}
