import { ROSTER, applyForm } from "./characters/roster.js";
import { drawCharacter } from "./characters/draw.js";
import { WORLDS, renderWorld } from "./worlds/index.js";
import { ABILITY_DEFS, useAbility, drawProjectile, drawSlash, drawBolt } from "./systems/abilities.js";
import { showNotification } from "./systems/notify.js";
import { ParticleSystem } from "./engine/particles.js";
import { sfx } from "./engine/audio.js";
import { ROOMS, ROOM_W, ROOM_H, drawSigns, MAP_LAYOUT } from "./systems/map.js";
import { drawEnemy } from "./engine/enemies.js";
import { Floaters } from "./systems/floaters.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
const keys = {};
let t = 0;
const XP_NEED = [0, 18, 40, 70, 110];
let muted = false;
let paused = false;

const game = {
  player: null, enemies: [], projectiles: [], bolts: [], slashes: [], platforms: [], orbs: [], hearts: [], ghosts: [],
  fx: new ParticleSystem(), nums: new Floaters(), worldIndex: 0, cam: { x: 0, y: 0 },
  worldW: ROOM_W, worldH: ROOM_H, running: false, spawn: { x: 180, y: 500 },
  shake: 0, combo: 0, comboT: 0, score: 0, roomId: "hub", visited: { hub: true }, fading: 0, flash: 0, kills: 0, won: false, summoned: false
};

function beep(n) { if (!muted) try { sfx(n); } catch (e) {} }
function fit() { const w = Math.min(1280, innerWidth|0), h = Math.min(720, innerHeight|0); if (canvas.width !== w) canvas.width = w; if (canvas.height !== h) canvas.height = h; }
addEventListener("resize", fit); fit();
addEventListener("pointerdown", () => beep("orb"), { once: true });

function overlayOpen() {
  return !!document.querySelector("#help.open, #map-overlay.open, #pause-overlay.open, #win-cinema.show");
}
function setMuted(on) {
  muted = !!on;
  const btn = document.getElementById("btn-mute");
  if (btn) btn.textContent = muted ? "Mute · N" : "Sonido · N";
}
function setPaused(on) {
  paused = !!on && game.running;
  document.getElementById("pause-overlay")?.classList.toggle("open", paused);
}
function closeOverlays() {
  document.getElementById("help")?.classList.remove("open");
  document.getElementById("map-overlay")?.classList.remove("open");
  setPaused(false);
}
function comboRank(n) {
  if (n > 12) return "S";
  if (n > 7) return "A";
  if (n > 3) return "B";
  return "C";
}

addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
  if (e.repeat) return;
  if (e.key === "h" || e.key === "H" || e.key === "?") { toggleHelp(); return; }
  if (e.key === "n" || e.key === "N") {
    setMuted(!muted);
    showNotification("AUDIO", muted ? "Mute" : "On");
    return;
  }
  if (e.key === "m" || e.key === "M") {
    if (game.running) showMap();
    return;
  }
  if (e.key === "Escape") {
    const help = document.getElementById("help");
    const map = document.getElementById("map-overlay");
    if (help && help.classList.contains("open")) { help.classList.remove("open"); return; }
    if (map && map.classList.contains("open")) { map.classList.remove("open"); return; }
    setPaused(!paused);
    return;
  }
  if (!game.running || paused || overlayOpen()) return;
  if (e.key === "j" || e.key === "J") useAbility(game, 0);
  if (e.key === "k" || e.key === "K") useAbility(game, 1);
  if (e.key === "l" || e.key === "L") useAbility(game, 2);
  if (e.code === "KeyE" || e.key === "e" || e.key === "E") { e.preventDefault(); evolve("manual"); }
  if (e.key === "r" || e.key === "R") respawn();
  if (e.key === "f" || e.key === "F") melee();
  if (e.key === "Shift") dash();
});
addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });
canvas.addEventListener("pointerdown", (e) => {
  if (!game.running || paused || overlayOpen()) return;
  if (e.button === 2) { dash(); return; }
  melee();
});
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
function toggleHelp() {
  const help = document.getElementById("help");
  if (!help) return;
  const open = !help.classList.contains("open");
  document.getElementById("map-overlay")?.classList.remove("open");
  if (open) setPaused(false);
  help.classList.toggle("open", open);
}
function showBanner(name) {
  const el = document.getElementById("room-banner");
  if (!el) return;
  el.textContent = name.toUpperCase();
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1400);
}
function setPrompt(text, on) {
  const el = document.getElementById("prompt");
  if (!el) return;
  if (!on) { el.classList.remove("show"); return; }
  el.textContent = text;
  el.classList.add("show");
}
function room() { return ROOMS[game.roomId] || ROOMS.hub; }
function save() {
  try {
    localStorage.setItem("ohana", JSON.stringify({
      roomId: game.roomId,
      visited: game.visited,
      score: game.score,
      evo: game.player && game.player.evo,
      id: game.player && game.player.id,
      xp: game.player && game.player.xp
    }));
  } catch (e) {}
}
function bounceLocked(fromDir) {
  const p = game.player;
  if (!p) return;
  if (fromDir === "right") p.x = Math.min(p.x, game.worldW - 80);
  else if (fromDir === "left") p.x = Math.max(p.x, 24);
  else if (fromDir === "up") p.y = Math.max(p.y, 120);
  else if (fromDir === "down") p.y = Math.min(p.y, game.worldH - 220);
  p.vx = 0; p.vy = 0;
}
function safeX(preferred) {
  const p = game.player;
  const w = p ? p.w : 24;
  const tries = [preferred, 120, 240, 400, 1080, 1280, 60, 1480];
  for (const x of tries) {
    if (floorsAtX(x, w).some((pl) => pl.h > 40)) return x;
  }
  return preferred;
}
function snapToFloor(p) {
  if (!p) return;
  const feet = p.y + p.h;
  const next = nearestBelow(p.x, p.w, feet - 8) || lowestFloor(p.x, p.w);
  if (next) landOn(p, next);
}
function placeFrom(fromDir) {
  const p = game.player;
  if (!p) return;
  if (fromDir === "right") p.x = 56;
  else if (fromDir === "left") p.x = ROOM_W - 56 - p.w;
  else if (fromDir === "up") {
    p.x = safeX(220);
    p.y = ROOM_H - 240;
  } else if (fromDir === "down") {
    p.x = safeX(220);
    p.y = 70;
  } else {
    p.x = safeX(p.x || 180);
  }
  p.vx = 0; p.vy = fromDir === "down" ? 2 : 0;
  if (fromDir !== "down") snapToFloor(p);
}
function loadRoom(id, fromDir) {
  const r = ROOMS[id];
  if (!r) return false;
  if (r.needEvo && game.player && game.player.evo < r.needEvo) {
    showNotification("CERRADO", "Necesitas forma " + (r.needEvo + 1));
    beep("hurt");
    bounceLocked(fromDir);
    return false;
  }
  const first = !game.visited[id];
  game.roomId = id;
  game.visited[id] = true;
  game.worldIndex = r.world;
  game.worldW = ROOM_W;
  game.worldH = ROOM_H;
  game.platforms = r.plats.map((p) => ({ x: p[0], y: p[1], w: p[2], h: p[3] }));
  game.orbs = (r.orbs || []).map((o) => ({ x: o[0], y: o[1], r: 9, taken: false }));
  game.hearts = first ? [{ x: 220, y: 760, taken: false }] : [];
  game.enemies = (r.foes || []).map((f, i) => ({
    x: f[0], y: f[1], w: f[2] === "brute" ? 36 : 32, h: f[2] === "flyer" ? 24 : 28,
    vx: i % 2 ? 1.7 : -1.7, vy: 0, hp: 50 + i * 12, max: 50 + i * 12,
    kind: f[2] || "crawler", color: f[2] === "flyer" ? "#8a4ccf" : f[2] === "brute" ? "#c45a18" : "#6c3",
    boss: false, shoot: 0
  }));
  if (r.boss) game.enemies.push({ x: 900, y: 420, w: 90, h: 90, vx: 2.4, vy: 0, hp: 980, max: 980, kind: "boss", color: "#f36", boss: true, shoot: 0, phase: 1, slam: 0 });
  game.projectiles = [];
  game.bolts = [];
  game.slashes = [];
  if (game.player) placeFrom(fromDir);
  game.cam.x = 0;
  game.fading = 12;
  if (first && game.player) {
    game.player.health = Math.min(game.player.maxHealth, game.player.health + 15);
    game.nums.add(game.player.x, game.player.y, "+15", "#6f6");
  }
  showNotification(r.name, r.hint || r.goal || "SALA");
  showBanner(r.name);
  save();
  worldClear();
  return true;
}
function showMap() {
  const overlay = document.getElementById("map-overlay");
  const grid = document.getElementById("map-grid");
  if (!overlay || !grid) {
    showNotification("MAPA", Object.keys(game.visited).map((id) => (ROOMS[id] && ROOMS[id].name) || id).join(" · "));
    return;
  }
  if (overlay.classList.contains("open")) {
    overlay.classList.remove("open");
    return;
  }
  document.getElementById("help")?.classList.remove("open");
  setPaused(false);
  const layout = MAP_LAYOUT || [];
  grid.innerHTML = layout.map((row) => row.map((id) => {
    if (!id) return '<div class="map-cell empty"></div>';
    const dest = ROOMS[id];
    const here = game.roomId === id;
    const seen = !!game.visited[id];
    const lock = dest && dest.needEvo != null && game.player && game.player.evo < dest.needEvo && !seen;
    const cls = here ? "here" : seen ? "seen" : lock ? "lock" : "";
    const label = dest ? (dest.short || dest.name) : id;
    return '<div class="map-cell ' + cls + '">' + label + "</div>";
  }).join("")).join("");
  overlay.classList.add("open");
}
function makePlayer(def) {
  const p = { ...def, x: 180, y: 500, vx: 0, vy: 0, facing: 1, jumps: 0, grounded: false, evo: 0, dead: false, invuln: 0, cds: {}, gliding: 0, xp: 0, coyote: 0, buffer: 0, dash: 0, dashBuf: 0, melee: 0, meleeBuf: 0, wall: 0 };
  applyForm(p, { silent: true }); return p;
}
function start(def) {
  if (!def) return;
  const resume = (function () { try { return localStorage.getItem("ohana-resume") === "1"; } catch (e) { return false; } })();
  try { localStorage.removeItem("ohana-resume"); } catch (e) {}
  game.player = makePlayer(def); game.combo = 0; game.score = 0; game.kills = 0; game.shake = 0; game.visited = { hub: true };
  game.projectiles = []; game.bolts = []; game.slashes = []; game.ghosts = []; game.won = false; game.summoned = false;
  game.running = true; closeOverlays();
  let roomId = "hub";
  if (resume) {
    try {
      const s = JSON.parse(localStorage.getItem("ohana") || "null");
      if (s && s.id === def.id) {
        game.player.evo = Math.max(0, Math.min(4, Number(s.evo) || 0));
        game.player.xp = Math.max(0, Number(s.xp) || 0);
        const vis = s.visited && typeof s.visited === "object" && !Array.isArray(s.visited) ? s.visited : { hub: true };
        game.visited = { hub: true };
        for (const key of Object.keys(vis)) if (ROOMS[key]) game.visited[key] = true;
        game.score = Math.max(0, Number(s.score) || 0);
        applyForm(game.player, { silent: true });
        roomId = ROOMS[s.roomId] ? s.roomId : "hub";
      }
    } catch (e) {}
  }
  document.body.classList.add("playing");
  document.getElementById("char-select")?.classList.add("hidden");
  renderAbilityBar();
  if (!loadRoom(roomId)) loadRoom("hub");
}
function evolve(reason) {
  const p = game.player; if (!p || p.dead) return;
  p.evo = Number(p.evo) || 0;
  if (p.evo >= 4) { if (reason === "manual") showNotification("MAX", "Ya eres GOD (forma 5)."); return; }
  if (reason !== "manual") {
    const need = XP_NEED[p.evo + 1];
    if (need == null || p.xp < need) return;
  }
  p.evo += 1;
  applyForm(p);
  game.shake = 12;
  game.flash = 14;
  beep("evo");
  showNotification("FORMA " + (p.evo + 1) + "/5", p.name);
  game.fx.emit(p.x + p.w / 2, p.y, { color: p.color, count: 48, size: 6, up: 2 });
  save();
}
function respawn() {
  const p = game.player; if (!p) return;
  p.x = 180; p.y = 500; p.vx = 0; p.vy = 0; p.health = p.maxHealth; p.dead = false; p.invuln = 50; game.combo = 0;
  loadRoom("hub");
}
function dash() {
  const p = game.player;
  if (!p || p.dead) return;
  if (p.dash > 0) { p.dashBuf = 8; return; }
  p.vx = 14 * p.facing; p.invuln = Math.max(p.invuln, 8); p.dash = 28; p.dashBuf = 0;
  game.ghosts.push({ x: p.x, y: p.y, w: p.w, h: p.h, life: 12, color: p.color });
  beep("jump");
}
function melee() {
  const p = game.player;
  if (!p || p.dead) return;
  if (p.melee > 0) { p.meleeBuf = 8; return; }
  p.melee = 10; p.meleeBuf = 0;
  const box = { x: p.x + (p.facing > 0 ? p.w : -28), y: p.y, w: 32, h: p.h };
  const kind = { lilo: "leaf", stitch: "claws", pikachu: "zap", dragon: "fan", cat: "crescent" }[p.id] || "crescent";
  game.slashes.push({
    x: p.x + p.w / 2 + p.facing * 12,
    y: p.y + p.h * 0.45,
    facing: p.facing,
    life: 12,
    max: 12,
    color: p.color,
    kind,
    w: 42 + p.evo * 10,
  });
  game.fx.emit(box.x + 10 * p.facing, box.y + 10, {
    color: p.color, count: 8, size: 3, angle: p.facing > 0 ? 0 : Math.PI, spread: 0.9, star: p.id === "pikachu",
  });
  for (const e of game.enemies) {
    if (aabb(box, e)) {
      let d = 22 + p.evo * 8;
      if (e.boss) d = Math.ceil(d * 0.5);
      e.hp -= d;
      e.vx = (e.boss ? 3 : 8) * p.facing;
      game.nums.add(e.x, e.y, "" + d, "#fff", d >= 40);
      punch(e.x, e.y, p.color);
      p.xp += 4;
    }
  }
}
function hurtPlayer(amount, label) {
  const p = game.player;
  if (!p || p.dead || p.invuln > 0) return;
  p.health -= amount;
  p.invuln = 28;
  p.vx = Math.sign(p.vx || p.facing || 1) * -6;
  p.vy = -5;
  game.shake = 10;
  game.combo = 0;
  beep("hurt");
  game.nums.add(p.x, p.y, label || ("-" + Math.round(amount)), "#ff6a7a");
  const hurt = document.getElementById("fx-hurt");
  if (hurt) { hurt.classList.add("on"); setTimeout(() => hurt.classList.remove("on"), 220); }
  if (p.health <= 0) {
    p.health = 0;
    p.dead = true;
    showNotification("DERROTA", "R vuelve al claro", "hurt");
    setTimeout(() => { if (game.player && game.player.dead) respawn(); }, 900);
  }
}
function overlapX(px, pw, plat, pad) {
  const m = pad == null ? 1 : pad;
  return px + pw > plat.x + m && px < plat.x + plat.w - m;
}
function floorsAtX(px, pw) {
  const out = [];
  for (const plat of game.platforms) if (overlapX(px, pw, plat, 0)) out.push(plat);
  return out;
}
function nearestBelow(px, pw, feetY) {
  let best = null;
  for (const plat of floorsAtX(px, pw)) {
    if (plat.y >= feetY - 28 && (!best || plat.y < best.y)) best = plat;
  }
  return best;
}
function lowestFloor(px, pw) {
  let best = null;
  for (const plat of floorsAtX(px, pw)) if (!best || plat.y > best.y) best = plat;
  return best;
}
function landOn(p, plat) {
  p.y = plat.y - p.h;
  p.vy = 0;
  p.grounded = true;
  p.jumps = 0;
  p.coyote = 10;
}
function inPitX(p) {
  const cx = p.x + p.w / 2;
  const grounds = game.platforms.filter((pl) => pl.h > 40).sort((a, b) => a.x - b.x);
  for (let i = 0; i < grounds.length - 1; i++) {
    const left = grounds[i].x + grounds[i].w;
    const right = grounds[i + 1].x;
    if (right - left >= 40 && cx > left && cx < right) return true;
  }
  return false;
}
function dieVoid(p) {
  if (!p || p.dead) return;
  p.dead = true; p.health = 0; game.shake = 16; beep("hurt");
  const hurt = document.getElementById("fx-hurt");
  if (hurt) { hurt.classList.add("on"); setTimeout(() => hurt.classList.remove("on"), 280); }
  showNotification("VACÍO", "Pozo real. R vuelve al claro", "hurt");
  game.fx.emit(p.x + p.w / 2, p.y, { color: "#7ee7ff", count: 28, size: 5, up: 2 });
  setTimeout(() => { if (game.player && game.player.dead) respawn(); }, 900);
}
function checkVoidDeath() {
  const p = game.player;
  if (!p || p.dead) return;
  const r = room();
  if (r.doors.down && r.pit && p.y > game.worldH - 40 && inPitX(p)) {
    loadRoom(r.doors.down, "down");
    return;
  }
  const feet = p.y + p.h;
  const next = nearestBelow(p.x, p.w, feet - 8);
  if (next && feet >= next.y) { landOn(p, next); return; }
  const low = lowestFloor(p.x, p.w);
  if (low) {
    if (feet > low.y) landOn(p, low);
    return;
  }
  if (!r.pit) {
    p.y = Math.min(p.y, game.worldH - p.h - 90);
    p.vy = 0;
    p.grounded = true;
    return;
  }
  if (p.y > game.worldH + 40) dieVoid(p);
}
function aabb(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function punch(x, y, color) {
  game.shake = Math.min(18, game.shake + 6); game.combo += 1; game.comboT = 100; game.score += 10 * game.combo;
  game.fx.emit(x, y, { color, count: 10, size: 3.2, up: 1.2 });
  game.fx.emit(x, y, { color: "#fff", count: 6, size: 2, up: 1.8, speed: 4.4, life: 16, star: true });
  beep("hit");
}
function worldClear() {
  const need = ["hub", "beach", "jungle", "cave", "lab", "ridge", "space", "volcano"];
  if (game.won || game.summoned || game.roomId === "boss") return;
  if (!need.every((id) => game.visited[id])) return;
  game.summoned = true;
  showNotification("MUNDO 1", "Todas las salas. El nido te reclama.");
  setTimeout(() => { if (!game.won && game.running) loadRoom("boss", "right"); }, 1100);
}
function nearUpDoor(p) {
  const cx = p.x + p.w / 2;
  return cx > 700 && cx < 1060;
}
function tryDoors() {
  const p = game.player; const r = room();
  if (p.x > ROOM_W - 24 && r.doors.right) loadRoom(r.doors.right, "right");
  else if (p.x < -8 && r.doors.left) loadRoom(r.doors.left, "left");
  else if (p.y < 8 && r.doors.up && nearUpDoor(p)) loadRoom(r.doors.up, "up");
  if (p.x > ROOM_W - 24 && !r.doors.right) p.x = ROOM_W - p.w;
  if (p.x < -8 && !r.doors.left) p.x = 0;
  if (p.y < 0 && !r.doors.up) p.y = 0;
}
function updatePlayer() {
  const p = game.player; if (p.dead) return;
  const left = keys["a"] || keys["arrowleft"];
  const right = keys["d"] || keys["arrowright"];
  const jump = keys["w"] || keys["arrowup"] || keys[" "];
  const drop = keys["s"] || keys["arrowdown"];
  if (p.dash > 0) p.dash--;
  if (p.melee > 0) p.melee--;
  if (p.dashBuf > 0) { p.dashBuf--; if (p.dash <= 0) dash(); }
  if (p.meleeBuf > 0) { p.meleeBuf--; if (p.melee <= 0) melee(); }
  if (left) { p.vx = -p.speed; p.facing = -1; }
  else if (right) { p.vx = p.speed; p.facing = 1; }
  else p.vx *= 0.78;
  if (jump) p.buffer = 8; else if (p.buffer > 0) p.buffer--;
  p.wall = 0;
  if (!p.grounded) {
    for (const plat of game.platforms) {
      if (p.y + p.h > plat.y && p.y < plat.y + plat.h) {
        if (p.x + p.w > plat.x && p.x + p.w < plat.x + 10 && right) p.wall = -1;
        if (p.x < plat.x + plat.w && p.x > plat.x + plat.w - 10 && left) p.wall = 1;
      }
    }
  }
  const canJump = p.jumps < p.maxJumps || p.coyote > 0 || p.wall;
  if (p.buffer > 0 && canJump && !p._jumpHeld) {
    p.vy = -p.jumpPower; p.jumps = p.coyote > 0 || p.wall ? 1 : p.jumps + 1;
    if (p.wall) p.vx = 8 * p.wall;
    p.grounded = false; p.coyote = 0; p.buffer = 0; p._jumpHeld = true; beep("jump");
    game.fx.emit(p.x + p.w / 2, p.y + p.h, { color: "#fff", count: 6, size: 2 });
  }
  if (!jump) {
    if (p._jumpHeld && p.vy < -4) p.vy *= 0.55;
    p._jumpHeld = false;
  }
  if (p.glide && !p.grounded && p.vy > 1 && jump) p.vy = 1.15;
  if (p.gliding > 0) { p.gliding--; p.vy = Math.min(p.vy, 1.3); }
  if (p.wall) p.vy = Math.min(p.vy, 2.2);
  p.vy = Math.min(14, p.vy + 0.52);
  p.grounded = false;
  const steps = Math.max(1, Math.ceil((Math.abs(p.vx) + Math.abs(p.vy)) / 6));
  for (let s = 0; s < steps; s++) {
    const prevBottom = p.y + p.h;
    const prevX = p.x;
    p.x += p.vx / steps;
    p.y += p.vy / steps;
    let landed = false;
    for (const plat of game.platforms) {
      const standingOn = Math.abs(prevBottom - plat.y) < 22 && overlapX(prevX, p.w, plat, 0);
      if (drop && plat.h <= 22 && standingOn) continue;
      if (!overlapX(p.x, p.w, plat, 0)) continue;
      if (p.vy >= -0.2 && prevBottom <= plat.y + 22 && p.y + p.h >= plat.y) {
        landOn(p, plat);
        landed = true;
        break;
      }
    }
    if (landed) break;
  }
  if (p.grounded && Math.abs(p.vx) > 2 && t % 6 === 0) game.fx.emit(p.x + p.w / 2, p.y + p.h, { color: "#ccc", count: 2, size: 2 });
  if (!p.grounded && p.coyote > 0) p.coyote--;
  if (p.invuln > 0) p.invuln--;
  for (const o of game.orbs) {
    if (!o.taken && Math.hypot(p.x + p.w / 2 - o.x, p.y + p.h / 2 - o.y) < 28) {
      o.taken = true; p.xp += 8; game.score += 25; beep("orb"); game.nums.add(o.x, o.y, "+XP", "#ffe66a");
    }
  }
  for (const h of game.hearts) {
    if (!h.taken && Math.hypot(p.x + p.w / 2 - h.x, p.y + p.h / 2 - h.y) < 36) {
      h.taken = true; p.health = Math.min(p.maxHealth, p.health + 25); game.nums.add(h.x, h.y, "+HP", "#f66"); beep("orb");
    }
  }
  tryDoors(); checkVoidDeath();
  const r = room();
  if (p.x > ROOM_W - 90 && r.doors.right) setPrompt("ESTE · sigue andando", true);
  else if (p.x < 70 && r.doors.left) setPrompt("OESTE · sigue andando", true);
  else if (p.y < 90 && r.doors.up && nearUpDoor(p)) setPrompt("ARRIBA · salta al techo", true);
  else if (p.y > ROOM_H - 160 && r.doors.down && inPitX(p)) setPrompt("ABAJO · cae por el hueco", true);
  else setPrompt("", false);
  while (p.evo < 4 && XP_NEED[p.evo + 1] != null && p.xp >= XP_NEED[p.evo + 1]) evolve("xp");
}
function updateEnemies() {
  if (!game.player) return;
  for (const e of game.enemies) {
    if (e.kind === "flyer") e.vy += 0.12; else e.vy += 0.5;
    e.x += e.vx; e.y += e.vy;
    if (e.boss) {
      if (e.hp < e.max * 0.45 && e.phase === 1) {
        e.phase = 2; e.color = "#ff2040"; game.flash = 10; game.shake = 16;
        showNotification("FASE 2", "El nido se enfurece");
        game.fx.emit(e.x, e.y, { color: "#ff2040", count: 24, size: 5, up: 2, star: true });
      }
      const aggro = e.phase === 2 ? 0.12 : 0.07;
      e.vx += Math.sign((game.player.x - e.x) || 1) * aggro;
      e.vx = Math.max(-4.2, Math.min(4.2, e.vx));
      if (t % (e.phase === 2 ? 70 : 95) === 0) e.vy = -9;
      e.slam = (e.slam || 0) + 1;
      if (e.slam > (e.phase === 2 ? 140 : 190)) {
        e.slam = 0; e.vy = 12;
        game.fx.emit(e.x + 40, e.y + 70, { color: "#f84", count: 16, size: 4, up: 2 });
        if (Math.abs(game.player.x - e.x) < 140 && game.player.y > e.y) {
          hurtPlayer(18, "-18");
        }
      }
    }
    e.shoot = (e.shoot || 0) + 1;
    const rate = e.boss ? (e.phase === 2 ? 48 : 70) : 90;
    if ((e.kind === "brute" || e.boss) && e.shoot > rate) {
      e.shoot = 0;
      const aim = Math.sign(game.player.x - e.x) || 1;
      const shots = e.boss && e.phase === 2 ? 3 : 1;
      for (let s = 0; s < shots; s++) {
        game.projectiles.push({
          x: e.x + 20, y: e.y + 18, vx: aim * (5 + s), vy: e.boss ? (s - 1) * 1.6 : 0,
          w: e.boss ? 16 : 12, h: e.boss ? 12 : 8, life: 80,
          dmg: e.boss ? 14 : 10, color: e.boss ? "#ff5a6a" : "#f84", owner: "enemy"
        });
      }
    }
    for (const plat of game.platforms) {
      if (e.x + e.w > plat.x && e.x < plat.x + plat.w) {
        if (e.y + e.h > plat.y && e.y + e.h < plat.y + 28 && e.vy >= 0) { e.y = plat.y - e.h; e.vy = 0; }
      }
    }
    if (e.kind === "flyer" && e.y > 520) e.vy = -2.2;
    if (e.y > game.worldH) e.hp = 0;
    const on = game.platforms.find((plat) => e.x + e.w > plat.x && e.x < plat.x + plat.w && Math.abs(e.y + e.h - plat.y) < 4);
    if (on && !e.boss && (e.x < on.x || e.x + e.w > on.x + on.w)) e.vx *= -1;
    const p = game.player;
    if (p && !p.dead && aabb(p, e)) {
      const kb = Math.sign(p.x - e.x || 1);
      hurtPlayer(e.boss ? 22 : 8, e.boss ? "-22" : "-8");
      if (!p.dead) { p.vx = kb * 8; p.vy = -5; }
    }
  }
  game.enemies = game.enemies.filter((e) => {
    if (e.hp > 0) return true;
    punch(e.x, e.y, e.color); game.kills++; game.player.health = Math.min(game.player.maxHealth, game.player.health + 4);
    if (e.boss) {
      game.won = true; game.flash = 24; game.shake = 20; beep("win");
      game.fx.emit(e.x + 40, e.y, { color: "#ffe66a", count: 36, size: 6, up: 3, star: true });
      showNotification("VICTORIA", "Contacta a Jun xD");
      dispatchEvent(new CustomEvent("ohana-win", { detail: { score: game.score, kills: game.kills } }));
    }
    return false;
  });
}
function updateProjectiles() {
  for (const pr of game.projectiles) {
    if (pr.homing && game.enemies[0]) { pr.vx += Math.sign(game.enemies[0].x - pr.x) * 0.35; pr.vy += Math.sign(game.enemies[0].y - pr.y) * 0.35; }
    pr.x += pr.vx; pr.y += pr.vy; pr.life--;
    if (pr.trail && pr.life % 2 === 0) {
      game.fx.emit(pr.x + pr.w / 2, pr.y + pr.h / 2, {
        color: pr.color, count: 1, size: 2, speed: 0.4, life: 8, gravity: 0, up: 0,
      });
    }
    if (pr.owner === "player") {
      for (const e of game.enemies) {
        if (aabb({ x: pr.x, y: pr.y, w: pr.w, h: pr.h }, e)) {
          let dmg = pr.dmg * (1 + game.player.evo * 0.35); if (e.boss) dmg *= 0.55;
          dmg = Math.round(dmg);
          e.hp -= dmg; e.vx += Math.sign(pr.vx) * 3; pr.life = 0; punch(e.x, e.y, pr.color); game.player.xp += 6;
          game.nums.add(e.x, e.y, "" + dmg, "#ffe66a", dmg >= 40);
        }
      }
    } else if (game.player && !game.player.dead && aabb({ x: pr.x, y: pr.y, w: pr.w, h: pr.h }, game.player)) {
      if (game.player.invuln <= 0) hurtPlayer(pr.dmg, "-" + Math.round(pr.dmg));
      pr.life = 0;
    }
  }
  game.projectiles = game.projectiles.filter((pr) => pr.life > 0);
  game.bolts = game.bolts.filter((b) => --b.life > 0);
  game.slashes = (game.slashes || []).filter((s) => --s.life > 0);
  game.ghosts = game.ghosts.filter((g) => --g.life > 0);
}
function updateCam() {
  const p = game.player; if (!p) return;
  game.cam.x += (p.x + p.facing * 80 - canvas.width / 2 - game.cam.x) * 0.12;
  game.cam.y += (p.y - canvas.height * 0.58 - game.cam.y) * 0.12;
  game.cam.x = Math.max(0, Math.min(game.cam.x, Math.max(0, game.worldW - canvas.width)));
  game.cam.y = Math.max(-40, Math.min(game.cam.y, Math.max(-40, game.worldH - canvas.height + 80)));
  if (game.shake > 0) game.shake *= 0.86;
  if (game.comboT > 0) game.comboT--; else game.combo = 0;
  if (game.fading > 0) game.fading--;
  if (game.flash > 0) game.flash--;
  game.nums.update();
}
function drawPortal(px, py, label) {
  const x = px - game.cam.x, y = py - game.cam.y;
  const a = 0.2 + Math.sin(t / 10) * 0.12;
  ctx.fillStyle = "rgba(80,220,255," + a + ")"; ctx.fillRect(x, y, 86, 22);
  ctx.strokeStyle = "#7ee7ff"; ctx.strokeRect(x, y, 86, 22);
  ctx.fillStyle = "#e8ffff"; ctx.font = "700 11px Outfit,sans-serif"; ctx.textAlign = "center";
  ctx.fillText(label, x + 43, y + 15);
}
function drawMinimap() {
  const layout = MAP_LAYOUT || [];
  const ox = canvas.width - 196, oy = canvas.height - 118;
  ctx.fillStyle = "rgba(6,10,16,.62)"; ctx.fillRect(ox - 8, oy - 8, 188, 104);
  ctx.strokeStyle = "rgba(126,231,255,.28)"; ctx.strokeRect(ox - 8.5, oy - 8.5, 189, 105);
  layout.forEach((row, cy) => {
    row.forEach((id, cx) => {
      if (!id) return;
      ctx.fillStyle = game.roomId === id ? "#7ee7ff" : game.visited[id] ? "#3a6" : "#1a222c";
      ctx.fillRect(ox + cx * 28, oy + cy * 28, 22, 22);
    });
  });
}
function drawCrystal(o) {
  const x = o.x - game.cam.x;
  const y = o.y - game.cam.y + Math.sin(t / 12) * 4;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t / 18) * 0.12);
  ctx.shadowColor = "#ffe66a";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#ffe66a";
  ctx.beginPath();
  ctx.moveTo(0, -12); ctx.lineTo(8, 0); ctx.lineTo(0, 12); ctx.lineTo(-8, 0);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,.78)";
  ctx.beginPath();
  ctx.moveTo(0, -12); ctx.lineTo(3.2, -1); ctx.lineTo(0, 3); ctx.lineTo(-2.2, -4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function render() {
  if (!game.player) return;
  const world = WORLDS[game.worldIndex] || WORLDS[0];
  ctx.save(); ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  renderWorld(ctx, world, game.cam, t, canvas.width, canvas.height);
  const grounds = game.platforms.filter((pl) => pl.h > 40).sort((a, b) => a.x - b.x);
  for (let i = 0; i < grounds.length - 1; i++) {
    const a = grounds[i], b = grounds[i + 1];
    const gap = b.x - (a.x + a.w);
    if (gap < 40) continue;
    const x = a.x + a.w - game.cam.x;
    const y = a.y - game.cam.y;
    const g = ctx.createLinearGradient(0, y, 0, y + 130);
    g.addColorStop(0, "rgba(4,6,14,.2)");
    g.addColorStop(1, "rgba(2,2,8,.85)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y + 8, gap, 140);
    ctx.fillStyle = "rgba(126,231,255," + (0.16 + Math.sin(t / 9) * 0.08) + ")";
    ctx.fillRect(x, y + 6, gap, 3);
  }
  for (const plat of game.platforms) {
    const x = plat.x - game.cam.x, y = plat.y - game.cam.y;
    ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(x + 8, y + 10, plat.w, plat.h);
    ctx.fillStyle = world.ground; ctx.fillRect(x, y, plat.w, plat.h);
    ctx.fillStyle = world.groundTop || "#8fd98a"; ctx.fillRect(x, y, plat.w, 10);
  }
  const r = room();
  drawSigns(ctx, r, game.cam, t, game.player.evo);
  if (r.doors.right) drawPortal(ROOM_W - 96, 370, "ESTE");
  if (r.doors.left) drawPortal(10, 370, "OESTE");
  if (r.doors.up) drawPortal(737, 18, "ARRIBA");
  if (r.doors.down) drawPortal(737, ROOM_H - 40, "ABAJO");
  for (const o of game.orbs) {
    if (o.taken) continue;
    drawCrystal(o);
  }
  for (const h of game.hearts) {
    if (h.taken) continue;
    ctx.fillStyle = "#f45"; ctx.beginPath(); ctx.arc(h.x - game.cam.x, h.y - game.cam.y, 8, 0, Math.PI * 2); ctx.fill();
  }
  for (const g of game.ghosts) {
    ctx.globalAlpha = g.life / 16; ctx.fillStyle = g.color; ctx.fillRect(g.x - game.cam.x, g.y - game.cam.y, g.w, g.h); ctx.globalAlpha = 1;
  }
  for (const e of game.enemies) drawEnemy(ctx, e, game.cam, t);
  for (const pr of game.projectiles) drawProjectile(ctx, pr, game.cam, t);
  for (const b of game.bolts) drawBolt(ctx, b, game.cam, t);
  for (const s of game.slashes || []) drawSlash(ctx, s, game.cam);
  game.fx.render(ctx, game.cam); game.nums.render(ctx, game.cam);
  if (game.player.dead) {
    ctx.globalAlpha = 0.45;
    drawCharacter(ctx, game.player, game.cam, t);
    ctx.globalAlpha = 1;
  } else if (game.player.invuln % 4 !== 1) {
    drawCharacter(ctx, game.player, game.cam, t);
  }
  ctx.restore();
  const low = 1 - Math.max(0, game.player.health / Math.max(1, game.player.maxHealth));
  const vg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.3, canvas.width / 2, canvas.height / 2, canvas.width * 0.72);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(" + Math.round(80 * low) + ",0,0," + (0.32 + low * 0.28) + ")");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (game.fading > 0) { ctx.fillStyle = "rgba(0,0,0," + (game.fading / 12) + ")"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  if (game.flash > 0) { ctx.fillStyle = "rgba(255,255,220," + (game.flash / 20) + ")"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  if (canvas.width >= 820) drawMinimap();
}
function renderAbilityBar() {
  const bar = document.getElementById("ability-bar");
  if (!bar || !game.player) return;
  bar.innerHTML = (game.player.abilities || []).map((id) => {
    const d = ABILITY_DEFS[id];
    if (!d) return "";
    return '<div class="ability-slot" data-id="' + id + '"><div class="key">' + d.key + " · " + d.name + '</div><div class="cd"><i></i></div></div>';
  }).join("");
}
function updateHUD() {
  const p = game.player; if (!p) return;
  const nameEl = document.getElementById("hud-name");
  if (nameEl) nameEl.textContent = p.name;
  const need = p.evo >= 4 ? p.xp : XP_NEED[p.evo + 1];
  const orbsLeft = game.orbs.filter((o) => !o.taken).length;
  const meta = document.getElementById("hud-meta");
  if (meta) meta.textContent = "HP " + Math.max(0, Math.ceil(p.health)) + "/" + p.maxHealth + " · XP " + p.xp + (p.evo < 4 ? "/" + need : "");
  const hpBar = document.getElementById("hp-bar");
  if (hpBar) hpBar.style.width = Math.max(0, (p.health / Math.max(1, p.maxHealth)) * 100) + "%";
  const xpEl = document.getElementById("xp-bar");
  if (xpEl) {
    const nxt = p.evo >= 4 ? 1 : XP_NEED[p.evo + 1];
    const prev = XP_NEED[p.evo] || 0;
    xpEl.style.width = p.evo >= 4 ? "100%" : Math.max(0, Math.min(100, ((p.xp - prev) / Math.max(1, nxt - prev)) * 100)) + "%";
  }
  const worldEl = document.getElementById("hud-world");
  if (worldEl) worldEl.textContent = room().name;
  const evoEl = document.getElementById("hud-evo");
  if (evoEl) evoEl.textContent = "Forma " + (p.evo + 1) + "/5 · Cristales " + orbsLeft;
  const comboEl = document.getElementById("hud-combo");
  if (comboEl) comboEl.textContent = "Combo " + game.combo + " · Score " + game.score;
  const chip = document.getElementById("combo-chip");
  if (chip) {
    const show = game.combo > 1;
    chip.textContent = show ? (game.combo + "  " + comboRank(game.combo)) : "";
    chip.classList.toggle("show", show);
    chip.dataset.rank = show ? comboRank(game.combo) : "";
  }
  const boss = game.enemies.find((e) => e.boss);
  const wrap = document.getElementById("boss-wrap");
  document.body.classList.toggle("boss-fight", !!boss);
  if (wrap) {
    wrap.classList.toggle("hidden", !boss);
    const bar = document.getElementById("boss-bar");
    const lab = wrap.querySelector(".boss-label");
    if (boss && bar) bar.style.width = Math.max(0, (boss.hp / Math.max(1, boss.max)) * 100) + "%";
    if (lab) lab.textContent = boss ? ("NIDO FINAL  " + Math.max(0, Math.ceil((boss.hp / Math.max(1, boss.max)) * 100)) + "%") : "NIDO FINAL";
  }
  const now = performance.now();
  document.querySelectorAll(".ability-slot").forEach((slot) => {
    const def = ABILITY_DEFS[slot.dataset.id];
    const fill = slot.querySelector("i");
    if (!def || !fill) return;
    const left = Math.max(0, (p.cds[slot.dataset.id] || 0) - now);
    fill.style.width = (100 - (left / def.cd) * 100) + "%";
  });
}
function loop() {
  t++;
  if (game.running && !paused && !overlayOpen()) {
    updatePlayer(); updateEnemies(); updateProjectiles(); game.fx.update(); updateCam(); if ((t & 3) === 0) updateHUD();
  } else if (game.running && (t & 3) === 0) updateHUD();
  if (game.running) render();
  requestAnimationFrame(loop);
}
function setupSelect() {
  const wrap = document.getElementById("chars");
  if (!wrap) return;
  wrap.innerHTML = ROSTER.map((c, i) => '<button class="char-card" data-id="' + c.id + '"><div class="swatch" style="background:' + c.color + '"></div><h3>' + c.name + '</h3><small>' + c.evoNames.join(" → ") + '</small><div class="hint">tecla ' + (i + 1) + '</div></button>').join("");
  wrap.querySelectorAll(".char-card").forEach((el) => el.addEventListener("click", () => start(ROSTER.find((r) => r.id === el.dataset.id))));
  addEventListener("keydown", (e) => {
    if (game.running) return;
    if (e.key >= "1" && e.key <= "5") {
      const c = ROSTER[Number(e.key) - 1];
      if (c) start(c);
    }
  });
  const helpBtn = document.getElementById("btn-help");
  const fullBtn = document.getElementById("btn-full");
  const mapBtn = document.getElementById("btn-map");
  const muteBtn = document.getElementById("btn-mute");
  const help = document.getElementById("help");
  if (helpBtn) helpBtn.onclick = toggleHelp;
  if (mapBtn) mapBtn.onclick = () => { if (game.running) showMap(); };
  if (muteBtn) muteBtn.onclick = () => { setMuted(!muted); showNotification("AUDIO", muted ? "Mute" : "On"); };
  if (fullBtn) fullBtn.onclick = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); else document.exitFullscreen(); };
  if (help) help.addEventListener("click", (e) => { if (e.target.id === "help") help.classList.remove("open"); });
  const map = document.getElementById("map-overlay");
  if (map) map.addEventListener("click", (e) => { if (e.target.id === "map-overlay") map.classList.remove("open"); });
  const pause = document.getElementById("pause-overlay");
  if (pause) pause.addEventListener("click", (e) => { if (e.target.id === "pause-overlay") setPaused(false); });
  const resume = document.getElementById("btn-resume");
  const quit = document.getElementById("btn-quit");
  if (resume) resume.onclick = () => setPaused(false);
  if (quit) quit.onclick = () => {
    game.running = false;
    closeOverlays();
    document.body.classList.remove("playing", "boss-fight");
    document.getElementById("char-select")?.classList.remove("hidden");
    document.getElementById("boss-wrap")?.classList.add("hidden");
    document.getElementById("combo-chip")?.classList.remove("show");
    setPrompt("", false);
  };
  document.querySelectorAll(".touch-btn").forEach((btn) => {
    const k = btn.dataset.k;
    const down = (ev) => { ev.preventDefault(); if (k === "shift") dash(); else if (k === "f") melee(); else keys[k] = true; };
    const up = (ev) => { ev.preventDefault(); if (k !== "shift" && k !== "f") keys[k] = false; };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("pointerleave", up);
  });
}
setupSelect();
loop();
