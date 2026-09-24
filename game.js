import { ROSTER, applyForm, tickEvoTween } from "./characters/roster.js";
import { drawCharacter } from "./characters/draw.js";
import { WORLDS, renderWorld } from "./worlds/index.js";
import { ABILITY_DEFS, useAbility, drawProjectile, drawSlash, drawBolt } from "./systems/abilities.js";
import { showNotification } from "./systems/notify.js";
import { ParticleSystem } from "./engine/particles.js";
import { sfx, setMuted as setAudioMuted } from "./engine/audio.js";
import { playMusic, themeForRoom, duckMusic, currentMusic } from "./engine/music.js";
import { ROOMS, ROOM_W, ROOM_H, drawSigns, MAP_LAYOUT } from "./systems/map.js";
import { drawEnemy } from "./engine/enemies.js";
import { Floaters } from "./systems/floaters.js";
import { portals } from "./systems/portals.js";
import { DeathFx } from "./systems/death-fx.js";
import { Rain } from "./systems/rain.js";
import { Surprises } from "./systems/surprises.js";
import { createBossNido, updateBossNido } from "./systems/boss-nido.js";
import { isAirFoe, applyElite, makeFoe } from "./engine/foes.js";
import { XP_NEED } from "./systems/xp.js";
import { packSave, unpackSave } from "./systems/save.js";
import { Passives } from "./systems/passives.js";
import { Magic } from "./systems/magic.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
const keys = {};
let t = 0;
let muted = false;
let paused = false;
// Accessibility: honor prefers-reduced-motion (dampen shake + flashes)
const RMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reduceMotion = RMQ.matches;
try { RMQ.addEventListener("change", (e) => { reduceMotion = e.matches; game.reduceMotion = reduceMotion; }); } catch (_) {}

const game = {
  player: null, enemies: [], projectiles: [], bolts: [], slashes: [], platforms: [], orbs: [], hearts: [], ghosts: [],
  fx: new ParticleSystem(), nums: new Floaters(), worldIndex: 0, cam: { x: 0, y: 0 },
  worldW: ROOM_W, worldH: ROOM_H, running: false, reduceMotion, spawn: { x: 180, y: 500 },
  shake: 0, hitstop: 0, camPunch: 0, combo: 0, comboT: 0, score: 0, roomId: "hub", visited: { hub: true }, fading: 0, flash: 0, kills: 0, won: false, summoned: false
};

function beep(n) { if (!muted) try { sfx(n); } catch (e) {} }
function fit() { const w = Math.min(1280, innerWidth|0), h = Math.min(720, innerHeight|0); if (canvas.width !== w) canvas.width = w; if (canvas.height !== h) canvas.height = h; }
addEventListener("resize", fit); fit();


function overlayOpen() {
  return !!document.querySelector("#help.open, #map-overlay.open, #pause-overlay.open, #win-cinema.show, #evo-stage.show");
}
function setMuted(on) {
  muted = !!on;
  setAudioMuted(muted);
  const btn = document.getElementById("btn-mute");
  if (btn) btn.textContent = muted ? "Mute · N" : "Sonido · N";
}
function setPaused(on) {
  if (game.finale && game.finale.t > 0) return;
  paused = !!on && game.running;
  duckMusic(paused);
  document.getElementById("pause-overlay")?.classList.toggle("open", paused);
}
function closeOverlays() {
  document.getElementById("help")?.classList.remove("open");
  document.getElementById("map-overlay")?.classList.remove("open");
  setPaused(false);
}
function hitStop(frames) {
  if (!frames) return;
  if (game.reduceMotion) frames = Math.max(1, Math.ceil(frames * 0.35));
  game.hitstop = Math.max(game.hitstop || 0, frames | 0);
}
function buzz(ms) {
  if (game.reduceMotion) return;
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
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
    if (game.finale && game.finale.t > 40) { game.finale.t = 8; return; }
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
  if (e.code === "KeyE" || e.key === "e" || e.key === "E") {
    e.preventDefault();
    if (!portals.tryUse(game.player, game)) evolve("manual");
  }
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
  try { localStorage.setItem("ohana", JSON.stringify(packSave(game, Magic))); } catch (e) {}
}
function bounceLocked(fromDir) {
  const p = game.player;
  if (!p) return;
  if (fromDir === "right") p.x = Math.min(p.x, game.worldW - 80);
  else if (fromDir === "left") p.x = Math.max(p.x, 24);
  else if (fromDir === "up") p.y = Math.max(p.y, 120);
  else if (fromDir === "down") p.y = Math.min(p.y, game.worldH - 220);
  else if (fromDir === "portal") {
    p.x = Math.max(40, Math.min(p.x - 48 * (p.facing || 1), game.worldW - 80));
    p.y = Math.min(p.y, game.worldH - 220);
  }
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
  if (fromDir === "right") p.x = game.roomId === "boss" ? 280 : 56;
  else if (fromDir === "left") p.x = ROOM_W - 56 - p.w;
  else if (fromDir === "up") {
    p.x = safeX(220);
    p.y = ROOM_H - 240;
  } else if (fromDir === "down") {
    p.x = safeX(220);
    p.y = 70;
  } else if (fromDir === "portal") {
    const spot = portals.spawnPoint(p.w, p.h);
    if (spot) {
      p.x = safeX(spot.x);
      p.y = spot.y;
    } else {
      p.x = safeX(180);
    }
    // Kick ANTES de armArrival (armArrival limpia pending, no el kick; marca trailTicks)
    const kick = typeof portals.arrivalKick === "function" ? portals.arrivalKick() : null;
    portals.armArrival();
    if (kick) {
      p.vx = kick.vx || 0;
      p.vy = kick.vy || 0;
      if (kick.facing) p.facing = kick.facing;
      if (kick.type) portals.trailType = kick.type;
    }
    // Reef: trail agua-cyan (override tipado en emit + burst de aterrizaje)
    if (game.roomId === "reef") {
      portals.trailColor = "#5ecfff";
      if (!portals.trailType || portals.trailType === "catapult") portals.trailType = "water";
    }
    // Micro-shake al aterrizar (además del shake de salida)
    game.shake = Math.min(14, (game.shake || 0) + (reduceMotion ? 3 : 5));
    // reduceMotion: estela más corta
    if (reduceMotion && portals.trailTicks > 0) {
      portals.trailTicks = Math.min(portals.trailTicks, 8);
    }
    let col = (kick && (kick.type === "catapult" || Math.abs(kick.vy || 0) > 5)) ? "#ffc078" : "#c9a0ff";
    if (portals.trailColor) col = portals.trailColor;
    else if (game.roomId === "reef") col = "#5ecfff";
    game.fx.emit(p.x + p.w / 2, p.y + p.h / 2, {
      color: col, count: reduceMotion ? 10 : 22, size: 4, up: 1.8, speed: 3.2, life: 18, star: true
    });
    game.flash = Math.max(game.flash || 0, 8);
    // Kick ya aplicado; no pisar vx/vy ni snap forzado (catapulta aterriza en arco)
    if (!kick) { p.vx = 0; p.vy = 0; snapToFloor(p); }
    return;
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
    beep("locked");
    bounceLocked(fromDir);
    return false;
  }
  const first = !game.visited[id];
  game.roomId = id;
  game.finale = null;
  game.visited[id] = true;
  game.worldIndex = r.world;
  game.worldW = ROOM_W;
  game.worldH = ROOM_H;
  game.platforms = r.plats.map((p) => ({ x: p[0], y: p[1], w: p[2], h: p[3] }));
  game.orbs = (r.orbs || []).map((o) => ({ x: o[0], y: o[1], r: 9, taken: false }));
  game.hearts = first ? [{ x: 220, y: 760, taken: false }] : [];
  game.enemies = (r.foes || []).map((f, i) => {
    const e = makeFoe(f[0], f[1], f[2], id, i, f[3] ? { elite: true } : undefined);
    if (f[3]) applyElite(e);
    return e;
  });
  for (const e of game.enemies) Surprises.onMakeFoe(e, id);
  for (const e of game.enemies) {
    if (isAirFoe(e)) continue;
    let floor = null;
    for (const plat of game.platforms) {
      const mid = e.x + e.w / 2;
      if (mid > plat.x && mid < plat.x + plat.w) {
        if (!floor || plat.y > floor.y) floor = plat;
      }
    }
    if (floor) e.y = floor.y - e.h;
  }
  if (r.boss) game.enemies.push(createBossNido());
  game.projectiles = [];
  game.bolts = [];
  game.slashes = [];
  portals.spawnFromRoom(r);
  if (game.player) placeFrom(fromDir);
  game.cam.x = 0;
  game.fading = 16;
  game.doorHold = id === "boss" ? (reduceMotion ? 4 : 8) : (reduceMotion ? 8 : 30);
  game.flash = Math.max(game.flash || 0, reduceMotion ? 4 : 8);
  if (first && game.player) {
    game.player.health = Math.min(game.player.maxHealth, game.player.health + 15);
    game.nums.add(game.player.x, game.player.y, "+15", "#6f6");
  }
  if (!r.boss) { showNotification(r.name, r.hint || r.goal || "SALA"); showBanner(r.name); }
  beep(r.boss ? "boss" : "door");
  playMusic(themeForRoom(id));
  save();
  worldClear();
  Surprises.onEnterRoom(game);
  Passives.onRoom(game);
  Magic.onRoom(game, id);
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
  Surprises.reset();
  game.projectiles = []; game.bolts = []; game.slashes = []; game.ghosts = []; game.won = false; game.summoned = false;
  game.running = true; closeOverlays();
  let roomId = "hub";
  if (resume) {
    try {
      const s = JSON.parse(localStorage.getItem("ohana") || "null");
      const u = unpackSave(s, def.id);
      if (u) {
        game.player.evo = u.evo;
        game.player.xp = u.xp;
        game.visited = { hub: true };
        for (const key of Object.keys(u.visited)) if (ROOMS[key]) game.visited[key] = true;
        game.score = u.score;
        game.kills = u.kills;
        game.won = u.won;
        applyForm(game.player, { silent: true });
        if (u.hp != null) game.player.health = Math.max(1, Math.min(game.player.maxHealth, u.hp));
        if (u.nineUsed) game.player._nineUsed = true;
        game._magicSnap = u.magic;
        roomId = ROOMS[u.roomId] ? u.roomId : "hub";
      }
    } catch (e) {}
  }
  document.body.classList.add("playing");
  document.getElementById("char-select")?.classList.add("hidden");
  renderAbilityBar();
  if (!loadRoom(roomId)) loadRoom("hub");
  if (game._magicSnap) { Magic.restore(game._magicSnap); game._magicSnap = null; }
}
function evolve(reason) {
  const p = game.player; if (!p || p.dead) return;
  p.evo = Number(p.evo) || 0;
  if (reason !== "xp" && reason !== "manual") return;
  if (p.evo >= 4) { if (reason === "manual") showNotification("MAX", "Ya eres GOD (forma 5)."); return; }
  const need = XP_NEED[p.evo + 1];
  if (need == null || p.xp < need) {
    if (reason === "manual") showNotification("XP", "Te faltan " + Math.max(0, Math.ceil(need - p.xp)) + " para evolucionar.");
    return;
  }
  p.evo += 1;
  applyForm(p);
  if (p.evo === 4) Surprises.onBecomeGod(game);
  const toGod = p.evo >= 4;
  game.shake = toGod ? 26 : 12;
  // Flash tinted with character form color (reduceMotion: corto pero con color)
  game.flashColor = p.color || (p.forms && p.forms[p.evo] && p.forms[p.evo].color) || "#fff";
  game.flash = reduceMotion ? (toGod ? 12 : 8) : (toGod ? 32 : 14);
  game.fx.emit(p.x + p.w / 2, p.y, {
    color: p.color,
    count: toGod ? 96 : 48,
    size: toGod ? 10 : 6,
    up: toGod ? 3.5 : 2,
    speed: toGod ? 5.5 : undefined,
    star: toGod || undefined,
  });
  if (toGod) {
    game.fx.emit(p.x + p.w / 2, p.y + p.h / 2, {
      color: "#fff8c8", count: 48, size: 7, up: 2.5, speed: 4, star: true,
    });
  }
  save();
}
function respawn() {
  const p = game.player; if (!p) return;
  if (DeathFx.isPlaying()) DeathFx.cancel();
  p.x = 180; p.y = 500; p.vx = 0; p.vy = 0; p.health = p.maxHealth; p.dead = false; p.invuln = 50; game.combo = 0;
  Magic.reset(game);
  loadRoom("hub");
}
function dash() {
  const p = game.player;
  if (!p || p.dead) return;
  if (p.dash > 0) { p.dashBuf = 8; return; }
  p.vx = 14 * p.facing; p.invuln = Math.max(p.invuln, 8); p.dash = 28; p.dashBuf = 0;
  game.ghosts.push({ x: p.x, y: p.y, w: p.w, h: p.h, life: 12, color: p.color });
  beep("dash");
}
function melee() {
  const p = game.player;
  if (!p || p.dead) return;
  if (p.melee > 0) { p.meleeBuf = 8; return; }
  const evo = Number(p.evo) || 0;
  // Snappier recovery as forms grow; still same F key
  p.melee = Math.max(7, 13 - evo);
  p.meleeBuf = 0;
  beep("slash");

  // Reach grows with evo; Dino gets a bite of extra jaw-reach
  const reach = 46 + evo * 11 + (p.id === "dragon" ? 6 + evo * 2 : 0);
  const box = {
    x: p.x + (p.facing > 0 ? p.w - 6 : -reach),
    y: p.y - 10 - evo * 2,
    w: reach,
    h: p.h + 16 + evo * 5,
  };

  const baseKind = { kilo: "leaf", lilo: "leaf", stitcho: "claws", stitch: "claws", chispin: "zap", pikachu: "zap", cat: "claw", dragon: "fan", frita: "fan" }[p.id] || "crescent";
  // High-evo dino swings a bigger fan; others keep identity but grow
  const kind = (p.id === "dragon" && evo >= 2) ? "fan" : baseKind;
  const slashLife = 10 + Math.min(6, evo * 2);
  const slashW = 50 + evo * 14;

  game.slashes.push({
    x: p.x + p.w / 2 + p.facing * (14 + evo * 4),
    y: p.y + p.h * 0.42,
    facing: p.facing,
    life: slashLife,
    max: slashLife,
    color: p.color,
    kind,
    w: slashW,
  });

  // Evo 2+: second trailing arc (reads as a heavier combo swing)
  if (evo >= 2) {
    game.slashes.push({
      x: p.x + p.w / 2 + p.facing * (30 + evo * 5),
      y: p.y + p.h * 0.32,
      facing: p.facing,
      life: Math.max(6, slashLife - 3),
      max: Math.max(6, slashLife - 3),
      color: evo >= 4 ? "#fff8c8" : "#fff",
      kind: (p.id === "chispin" || p.id === "pikachu") ? "zap" : ((p.id === "stitcho" || p.id === "stitch" || p.id === "cat") ? "claws" : "fan"),
      w: 34 + evo * 10,
    });
  }

  game.fx.emit(box.x + 12 * p.facing, box.y + box.h * 0.45, {
    color: p.color,
    count: 16 + evo * 5,
    size: 3.5 + evo * 0.45,
    angle: p.facing > 0 ? 0 : Math.PI,
    spread: 1.15 + evo * 0.08,
    star: true,
    speed: 3.2 + evo * 0.35,
  });
  game.shake = Math.min(16, (game.shake || 0) + 3 + evo);

  // Damage: linear + soft quadratic (evo 0→4 ≈ 28, 42, 60, 82, 110)
  let dBase = 28 + evo * 12 + evo * evo * 2;
  if (p.id === "dragon") dBase += 2 + evo; // jaw bonus
  if (evo >= 4) dBase += 8;

  for (const e of game.enemies) {
    if (e.invuln > 0 || e.dying) continue;
    if (aabb(box, e)) {
      let d = dBase;
      if (e.boss) d = Math.ceil(d * 0.5);
      e.hp -= d;
      // Knockback + hitstun más perceptibles (sin soft-lock); GOD +5% knock only
      let knX = (e.boss ? 4 : 12 + evo * 1.2) * p.facing;
      let knY = (e.boss ? -2.2 : -4.2) - evo * 0.55;
      if (evo >= 4) { knX *= 1.05; knY *= 1.05; }
      e.vx = knX;
      e.vy = Math.min(e.vy || 0, knY);
      e.stun = Math.max(e.stun || 0, Math.min(28, 16 + evo * 3));
      e.flash = Math.max(e.flash || 0, 16);
      game.nums.add(e.x, e.y, "" + d, evo >= 3 ? "#ffe66a" : "#fff", d >= 45);
      beep(d >= 45 ? "crit" : "hit");
      punch(e.x, e.y, p.color);
      hitStop(e.boss ? 8 : (d >= 45 ? 10 : 3));
      game.camPunch = Math.max(game.camPunch || 0, e.boss ? 0.08 : 0.045);
      buzz(e.boss ? 18 : 10);
      p.xp += 2 + (evo >= 3 ? 1 : 0);
    }
  }

  // Evo 3+: ranged follow-through (flame for dino, zap/crescent otherwise)
  if (evo >= 3) {
    const isDino = p.id === "dragon";
    const isPika = p.id === "chispin" || p.id === "pikachu";
    game.projectiles.push({
      x: p.x + p.w / 2 + p.facing * 10,
      y: p.y + p.h * 0.32,
      vx: (11 + evo) * p.facing,
      vy: isDino ? -0.6 : 0,
      w: isDino ? 30 : 18,
      h: isDino ? 18 : 12,
      life: 26 + evo * 5,
      dmg: 12 + evo * 4,
      color: isDino ? "#ff6a2a" : (isPika ? "#ffe14a" : p.color),
      shape: isDino ? "flame" : (isPika ? "zap" : "crescent"),
      owner: "player",
      trail: true,
    });
    if (isDino && evo >= 4) {
      // God form: twin breath
      game.projectiles.push({
        x: p.x + p.w / 2 + p.facing * 6,
        y: p.y + p.h * 0.22,
        vx: (9 + evo) * p.facing,
        vy: -2.2,
        w: 22, h: 14, life: 24,
        dmg: 10 + evo * 3,
        color: "#ffd36a",
        shape: "flame",
        owner: "player",
        trail: true,
      });
    }
  }

  // Evo 4: short bolt shockwave in front (visual + chip damage)
  if (evo >= 4) {
    const ox = p.x + p.w / 2;
    const oy = p.y + p.h * 0.35;
    const tx = ox + p.facing * (100 + p.w);
    const ty = oy;
    game.bolts.push({ x1: ox, y1: oy, x2: tx, y2: ty, life: 14, dmg: 22 });
    game.bolts.push({
      x1: ox, y1: oy - 10,
      x2: tx - p.facing * 18, y2: ty + 16,
      life: 10, dmg: 10,
    });
    const boltDmg = 18;
    for (const e of game.enemies) {
      if (e.invuln > 0 || e.dying) continue;
      const ex = e.x + e.w / 2, ey = e.y + e.h / 2;
      // Near the bolt segment
      if (Math.abs(ey - oy) < 48 && ((p.facing > 0 && ex > ox && ex < tx + 20) || (p.facing < 0 && ex < ox && ex > tx - 20))) {
        e.hp -= boltDmg;
        e.vx = 8 * p.facing;
        e.vy = Math.min(e.vy || 0, -3);
        e.stun = Math.max(e.stun || 0, 10);
        e.flash = Math.max(e.flash || 0, 14);
        game.nums.add(e.x, e.y, "" + boltDmg, "#7ecbff", true);
        punch(e.x, e.y, "#7ecbff");
      }
    }
    game.fx.emit(tx, ty, { color: "#fffde0", count: 14, size: 4, speed: 4, star: true, up: 1.4 });
  }
}
function hurtPlayer(amount, label) {
  const p = game.player;
  if (!p || p.dead || p.invuln > 0) return;
  amount = Magic.onHurt(game, Passives.onHurt(game, amount));
  if (!(amount > 0)) return;
  p.health -= amount;
  p.invuln = 28;
  p.vx = Math.sign(p.vx || p.facing || 1) * -8;
  p.vy = -6.5;
  p.flash = Math.max(p.flash || 0, 10);
  game.shake = 12;
  game.combo = 0;
  beep("hurt");
  buzz(24);
  hitStop(2);
  game.nums.add(p.x, p.y, label || ("-" + Math.round(amount)), "#ff6a7a");
  const hurt = document.getElementById("fx-hurt");
  if (hurt) { hurt.classList.add("on"); setTimeout(() => hurt.classList.remove("on"), 220); }
  if (p.health <= 0 && Passives.onLethal(game)) return;
  if (p.health <= 0) {
    p.health = 0;
    p.dead = true;
    showNotification("DERROTA", "R vuelve al claro", "hurt");
    if (!DeathFx.isPlaying()) DeathFx.start(p, () => respawn(), { reason: "hurt" });
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
  if (!p.grounded && p.vy > 7) beep("land");
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
  if (!DeathFx.isPlaying()) DeathFx.start(p, () => respawn(), { reason: "void" });
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
  game.shake = Math.min(18, game.shake + 6); game.combo += 1; game.comboT = 210; game.score += 10 * game.combo;
  game.fx.emit(x, y, { color, count: 10, size: 3.2, up: 1.2 });
  game.fx.emit(x, y, { color: "#fff", count: 6, size: 2, up: 1.8, speed: 4.4, life: 16, star: true });
  beep("hit");
}
function beginFinale(e) {
  game.finale = {
    t: 220,
    max: 220,
    x: e.x + e.w / 2,
    y: e.y + e.h * 0.4,
  };
  game.flash = 24;
  game.shake = 28;
  playMusic("victoria");
}
function tickFinale() {
  const f = game.finale;
  if (!f || f.t <= 0) return;
  f.t--;
  if (game.fx && (t % 2 === 0)) {
    const hot = f.t > 120;
    game.fx.emit(f.x + (Math.random() - 0.5) * 120, f.y + (Math.random() - 0.5) * 80, {
      color: hot ? "#ff4060" : "#ffe66a",
      count: game.reduceMotion ? 1 : 3,
      size: hot ? 4 : 6,
      up: 2.4,
      star: true,
    });
  }
  if (f.t === 100) game.flash = 30;
  if (f.t === 0 && !game.won) {
    game.won = true;
    dispatchEvent(new CustomEvent("ohana-win", { detail: { score: game.score, kills: game.kills } }));
  }
}
function worldClear() {
  const need = ["hub", "beach", "jungle", "cave", "lab", "ridge", "space", "volcano"];
  if (game.won || game.summoned || game.roomId === "boss") return;
  if (!need.every((id) => game.visited[id])) return;
  game.summoned = true;
  beep("alert");
  showNotification("EL NIDO DESPIERTA", "El monstruo te espera. Prepárate.", "sala");
  setTimeout(() => { if (!game.won && game.running) loadRoom("boss", "right"); }, 2200);
}
function nearUpDoor(p) {
  const cx = p.x + p.w / 2;
  return cx > 700 && cx < 1060;
}
function tryDoors() {
  const p = game.player; const r = room();
  const queenAlive = r.id === "boss" && game.enemies.some((e) => e.boss && !e.fell && e.hp > 0);
  if (queenAlive && p.x < 48) p.x = 48;
  if (p.x > ROOM_W - 24 && r.doors.right) loadRoom(r.doors.right, "right");
  else if (p.x < -8 && r.doors.left && !queenAlive) loadRoom(r.doors.left, "left");
  else if (p.y < 8 && r.doors.up && nearUpDoor(p)) loadRoom(r.doors.up, "up");
  if (p.x > ROOM_W - 24 && !r.doors.right) p.x = ROOM_W - p.w;
  if (p.x < -8 && !r.doors.left) p.x = 0;
  if (queenAlive && p.x < 48) p.x = 48;
  if (p.y < 0 && !r.doors.up) p.y = 0;
}
function updatePlayer() {
  const p = game.player; if (p.dead) return;
  if (game.doorHold > 0) {
    game.doorHold--;
    p.vx = 0;
    p.vy = 0;
    return;
  }
  if (game.finale && game.finale.t > 0) {
    p.vx = 0;
    p.vy = 0;
    return;
  }
  tickEvoTween(p);
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
  // GOD glide dust trail: 2–3 partículas cada ~5 frames detrás/abajo
  {
    const holdGlide = !!(p.glide && !p.grounded && p.vy > 1 && jump);
    const glideActive = holdGlide || (p.gliding > 0);
    if (glideActive && (p.evo >= 4 || p.glide) && (t % 5 === 0)) {
      const behind = p.x + p.w / 2 - p.facing * 10;
      const under = p.y + p.h * 0.88;
      game.fx.emit(behind, under, {
        color: p.color || "#fff8e0",
        count: 2 + (Math.random() < 0.45 ? 1 : 0),
        size: 1.7,
        up: 0.12,
        speed: 0.85,
        life: 12,
        gravity: 0.035,
        angle: Math.PI / 2 + (Math.random() - 0.5) * 0.8,
        spread: 0.6,
      });
    }
  }
  if (p.wall) p.vy = Math.min(p.vy, 2.2);
  const input = { left: !!left, right: !!right, jump: !!jump, drop: !!drop, jumpPressed: !!jump && !p._jumpPrev, t };
  p._jumpPrev = !!jump;
  Passives.update(game, input);
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
  Passives.afterMove(game, input);
  Magic.update(game);
  if (p.grounded && Math.abs(p.vx) > 2 && t % 6 === 0) game.fx.emit(p.x + p.w / 2, p.y + p.h, { color: "#ccc", count: 2, size: 2 });
  if (!p.grounded && p.coyote > 0) p.coyote--;
  if (p.invuln > 0) p.invuln--;
  for (const o of game.orbs) {
    if (!o.taken && Math.hypot(p.x + p.w / 2 - o.x, p.y + p.h / 2 - o.y) < 28) {
      o.taken = true; p.xp += 4 + Surprises.starOrbBonus(); game.score += 25; beep("orb"); game.nums.add(o.x, o.y, "+XP", "#ffe66a");
      if (game.orbs.every((q) => q.taken)) { beep("objective"); showNotification("¡CRISTALES COMPLETOS!", room().name + " · todos los cristales recogidos"); game.score += 100; }
    }
  }
  for (const h of game.hearts) {
    if (!h.taken && Math.hypot(p.x + p.w / 2 - h.x, p.y + p.h / 2 - h.y) < 36) {
      h.taken = true; p.health = Math.min(p.maxHealth, p.health + 25); game.nums.add(h.x, h.y, "+HP", "#f66"); beep("orb");
    }
  }
  if (!(portals.isBusy && portals.isBusy())) { tryDoors(); checkVoidDeath(); }
  portals.update(game);
  // Charge en curso: refuerzo mínimo de shake/flash tipado (no reescribe trip)
  if (portals.isBusy && portals.isBusy() && portals.charge) {
    const ov = typeof portals.getOverlay === "function" ? portals.getOverlay() : null;
    const bh = portals.charge.type === "blackhole";
    if (!reduceMotion && ov && ov.alpha > 0.15) {
      game.shake = Math.min(15, Math.max(game.shake || 0, 2 + ov.alpha * 9));
    }
    if (ov && ov.alpha > 0.45) {
      game.flash = Math.max(game.flash || 0, bh ? 3 : 2);
      game._portalFlash = bh ? "purple" : "amber";
    }
  }
  const trip = portals.consume();
  if (trip && trip.dest) {
    // Transición portal: fade largo + flash tipado (nunca dieVoid)
    const bh = trip.type === "blackhole";
    game.fading = reduceMotion ? 16 : 24;
    game.flash = bh ? (reduceMotion ? 10 : 16) : (reduceMotion ? 8 : 12);
    game.shake = Math.min(22, (game.shake || 0) + (reduceMotion ? 4 : (bh ? 14 : 10)));
    game._portalFlash = bh ? "purple" : "amber";
    game._portalFadeMax = game.fading;
    if (bh) {
      game.fx.emit(p.x + p.w / 2, p.y + p.h / 2, { color: "#b48cff", count: reduceMotion ? 14 : 36, size: 5, up: 1.6, speed: 3.4, life: 22 });
      game.fx.emit(p.x + p.w / 2, p.y + p.h / 2, { color: "#fff", count: reduceMotion ? 4 : 12, size: 2.5, up: 2, speed: 4, life: 14, star: true });
      beep("orb");
    } else {
      game.fx.emit(p.x + p.w / 2, p.y, { color: "#ffc078", count: reduceMotion ? 12 : 28, size: 4, up: 2.4, speed: 4, life: 18 });
      game.fx.emit(p.x + p.w / 2, p.y + p.h / 2, { color: "#ffe8c0", count: reduceMotion ? 4 : 10, size: 2.5, up: 2.8, speed: 3.5, life: 14, star: true });
      beep("jump");
    }
    const fadeLen = game.fading;
    const flashLen = game.flash;
    const flashKind = game._portalFlash;
    const ok = loadRoom(trip.dest, "portal");
    if (ok) {
      // loadRoom resetea fading=12; restaurar transición portal (tint vía _portalFlash)
      game.fading = fadeLen;
      game.flash = Math.max(game.flash || 0, flashLen);
      game._portalFlash = flashKind;
      game._portalFadeMax = fadeLen;
    } else {
      // Trip abortado (needEvo / dest inválido): reset visual + push-out
      game._portalFlash = null;
      game._portalFadeMax = 0;
      game.fading = 0;
      game.flash = Math.min(game.flash || 0, 6);
      if (typeof portals.abortTrip === "function") portals.abortTrip(game);
      else portals.armArrival();
      snapToFloor(p);
      beep("hurt");
    }
  }
  const r = room();
  if (portals.prompt) setPrompt(portals.prompt, true);
  else if (p.x > ROOM_W - 90 && r.doors.right) setPrompt("ESTE · sigue andando", true);
  else if (p.x < 70 && r.doors.left) setPrompt("OESTE · sigue andando", true);
  else if (p.y < 90 && r.doors.up && nearUpDoor(p)) setPrompt("ARRIBA · salta al techo", true);
  else if (p.y > ROOM_H - 160 && r.doors.down && inPitX(p)) setPrompt("ABAJO · cae por el hueco", true);
  else if (p.evo < 4 && p.xp >= (XP_NEED[p.evo + 1] || Infinity)) {
    const nxt = p.forms && p.forms[p.evo + 1];
    setPrompt("E · evolucionar" + (nxt ? " · " + nxt.name : ""), true);
  }
  else setPrompt("", false);
  while (p.evo < 4 && XP_NEED[p.evo + 1] != null && p.xp >= XP_NEED[p.evo + 1]) evolve("xp");
}
function updateEnemies() {
  if (!game.player) return;
  { const b = game.enemies.find((e) => e.boss && !e.dying); if (b && b.phase >= 3 && currentMusic() === "jefe") playMusic("jefe3"); }
  if (game.enemySlow > 0 && (t & 1)) return; // Reloj de arena: enemigos a media velocidad
  for (const e of game.enemies) {
    const molts = e.kind === "cucaracho" && !e.baby && (e.evo || 0) < 2;
    const posed = e.kind === "cucaracho" || e.kind === "mosquito" || e.kind === "cangrejo";
    if (!e.boss && e.hp <= 0 && posed && !molts) {
      if (e.dying == null) e.dying = 28;
      e.deathHold = 1;
      e.dying--;
      e.vx = 0;
      e.vy = Math.min(5, (e.vy || -2) + 0.4);
      e.y += e.vy;
      continue;
    }
    if (e.flash > 0) e.flash--;
    if (e.stun > 0) {
      e.stun--;
      if (!e.boss && e.stun > 5) {
        e.vx *= 0.4;
        e.telegraph = false;
        // Cancela wind-ups de ataque (sin soft-lock: stun acotado)
        if (e.wind) e.wind = 0;
        if (e.hopWind) e.hopWind = 0;
        if (e.clawWind) e.clawWind = 0;
      }
    }
    if (e.kind === "phosquito" || e.kind === "mosquito" || (e.kind === "cucaracho" && e.evo >= 2)
      || e.kind === "gaviota" || e.kind === "murcielago") e.vy += 0.08;
    else if (e.kind === "libelula" || e.kind === "avispa" || e.kind === "abeja"
      || e.kind === "brasita" || e.kind === "ufo") e.vy += 0.05;
    else if (e.kind === "planta" || e.kind === "medusa" || e.kind === "pez" || e.kind === "anguila") e.vy = 0;
    else if (e.boss && e.airborne) e.vy += 0.12;
    else e.vy += 0.5;
    e.x += e.vx; e.y += e.vy;
    if (e.boss && e.fell) {
      e.vx = 0; e.vy = 0;
      e.x += ((ROOM_W / 2 - e.w / 2) - e.x) * 0.14;
      e.y += ((ROOM_H / 2 - 80 - e.h / 2) - e.y) * 0.14;
      e.dying = Math.max(0, (e.dying || 0) - 1);
      if (t % 3 === 0) {
        game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#ffe66a", count: 8, size: 5, up: 2.4, star: true });
        game.flash = 4;
      }
      continue;
    }
    if (e.boss) {
      updateBossNido(e, game, {
        t, hurtPlayer, showNotification, makeFoe, ROOM_W, ROOM_H,
        reduceMotion: game.reduceMotion || reduceMotion,
        beep,
      });
    } else {
    e.shoot = (e.shoot || 0) + 1;
    const rate = e.kind === "planta" ? 70 : 9999;
    if (e.kind === "planta" && e.up) {
      if (e.shoot > rate) {
        e.shoot = 0;
        const aim = Math.sign(game.player.x - e.x) || 1;
        game.projectiles.push({
          x: e.x + 10, y: e.y + 8,
          vx: aim * 4.2 * 0.7,
          vy: -1.2,
          w: 10, h: 10, life: 80,
          dmg: 9, color: "#7dca5a",
          owner: "enemy",
        });
      }
    }
    }
    if (e.kind === "phosquito" && e.canSplit && !e.split && e.hp < e.max * 0.5) {
      e.split = true;
      game.enemies.push(makeFoe(e.x + 18, e.y - 8, "phosquito", game.roomId, 1, { baby: true }));
      game.fx.emit(e.x, e.y, { color: "#6ad0a8", count: 10, size: 3, up: 1.4 });
    }
    if (e.kind === "planta") {
      e.vx = 0;
      e.hide = (e.hide || 0) + 1;
      if (e.hide > 110) { e.hide = 0; e.up = !e.up; }
    }
    if (e.invuln > 0) e.invuln--;
    // --- phosquito: dive telegraph + split kept ---
    if (e.kind === "phosquito") {
      e.diveCd = (e.diveCd || 0) - 1;
      if (e.diving) {
        e.diving--;
        e.telegraph = false;
        if (e.diving <= 0) e.diveCd = 70;
      } else if (e.diveCd <= 0 && game.player) {
        e.wind = (e.wind || 0) + 1;
        e.telegraph = true;
        e.vx *= 0.9;
        if (e.wind > 12) {
          e.wind = 0; e.telegraph = false; e.diving = 28;
          e.vx += Math.sign(game.player.x - e.x) * 1.8;
          e.vy = 3.4;
        }
      } else {
        e.telegraph = false;
        e.vy += 0.04;
        if (e.y < 520) e.vy += 0.45;
        if (e.y > 720) e.vy = -1.8;
      }
      e.vx = Math.max(-3.6, Math.min(3.6, e.vx));
    }
    // --- cucaracho evo2: fly + dive like phosquito, red trail + ghosts ---
    if (e.kind === "cucaracho" && e.evo >= 2) {
      e.diveCd = (e.diveCd || 0) - 1;
      if (e.diving) {
        e.diving--;
        e.telegraph = false;
        if (t % 2 === 0) {
          game.ghosts.push({ x: e.x, y: e.y, w: e.w, h: e.h, life: 8, color: "#ff4020" });
          game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#ff4a20", count: 2, size: 2.2, up: 0.3, speed: 0.8, life: 10 });
        }
        if (e.diving <= 0) e.diveCd = 55;
      } else if (e.diveCd <= 0 && game.player) {
        e.wind = (e.wind || 0) + 1;
        e.telegraph = true;
        e.vx *= 0.88;
        if (e.wind > 10) {
          e.wind = 0; e.telegraph = false; e.diving = 30;
          e.vx = Math.sign(game.player.x - e.x || 1) * 3.2;
          e.vy = 4.0;
        }
      } else {
        e.telegraph = false;
        e.vy += 0.05;
        if (game.player) e.vx += Math.sign(game.player.x - e.x) * 0.06;
        if (e.y < 500) e.vy += 0.5;
        if (e.y > 720) e.vy = -2.2;
      }
      e.vx = Math.max(-4.0, Math.min(4.0, e.vx));
    }
    // --- cucaracho evo0 patrol / evo1 lunge ---
    if (e.kind === "cucaracho" && e.evo < 2) {
      if (e.lunge > 0) {
        e.lunge--;
        if (e.lunge <= 0) e.vx *= 0.4;
      } else {
        e.lungeCd = (e.lungeCd || 0) - 1;
        if (e.evo >= 1 && e.lungeCd <= 0 && game.player) {
          e.lungeCd = 90;
          e.lunge = 18;
          e.vx = Math.sign(game.player.x - e.x || 1) * 5.2;
          e.vy = -3.5;
          e.flash = 6;
          game.fx.emit(e.x, e.y + e.h, { color: "#c45a18", count: 6, size: 2.5, up: 1.2 });
        }
      }
    }
    // --- mosquito: telegraph dive, steep dive, upward spiral recover ---
    if (e.kind === "mosquito") {
      e.diveCd = (e.diveCd || 0) - 1;
      if (e.spiral > 0) {
        e.spiral--;
        e.telegraph = false;
        e.diving = false;
        e.vx = Math.cos(t / 4 + e.x * 0.01) * 3.2;
        e.vy = -2.6;
        if (t % 3 === 0) game.fx.emit(e.x + e.w / 2, e.y + e.h, { color: "#ff6a4a", count: 1, size: 1.8, up: 0.2, life: 10 });
      } else if (e.diving) {
        e.diving--;
        e.telegraph = false;
        if (e.diving <= 0) { e.spiral = 28; e.diveCd = 48; }
      } else if (e.diveCd <= 0 && game.player) {
        e.wind = (e.wind || 0) + 1;
        e.telegraph = true;
        e.vx *= 0.85;
        e.vy *= 0.7;
        if (e.wind > 14) {
          e.wind = 0; e.telegraph = false; e.diving = 22;
          e.vx = Math.sign(game.player.x - e.x || 1) * 3.4;
          e.vy = 5.5;
        }
      } else {
        e.telegraph = false;
        e.vy += 0.05;
        if (game.player) e.vx += Math.sign(game.player.x - e.x) * 0.12;
        if (e.y < 480) e.vy += 0.55;
        if (e.y > 740) e.vy = -2.4;
      }
      e.vx = Math.max(-5.0, Math.min(5.0, e.vx));
    }
    // --- libelula: figure-8 hover, telegraph then zig-zag diagonal dash + afterimage ---
    if (e.kind === "libelula") {
      e.bob = (e.bob || 0) + 0.07;
      e.dart = (e.dart || 0) - 1;
      if (e.baseY == null) e.baseY = e.y;
      if (e.darting) {
        e.darting--;
        e.telegraph = false;
        if (t % 2 === 0) game.ghosts.push({ x: e.x, y: e.y, w: e.w, h: e.h, life: 7, color: "#4aba7a" });
        if (e.darting <= 0) { e.dart = 55 + (t % 35); e.vx *= 0.35; }
      } else if (e.wind > 0 || (e.dart <= 0 && game.player)) {
        if (e.dart <= 0 && e.wind <= 0) e.wind = 1;
        e.wind++;
        e.telegraph = true;
        // zig-zag wind-up
        e.vx = Math.sin(e.wind * 0.7) * 1.8;
        e.y = e.baseY + Math.sin(e.bob) * 10;
        e.vy = 0;
        if (e.wind > 10) {
          e.wind = 0; e.telegraph = false; e.darting = 16;
          const dx = game.player.x - e.x;
          const dy = game.player.y - e.y;
          const len = Math.hypot(dx, dy) || 1;
          e.vx = (dx / len) * 6.2 + (Math.random() - 0.5) * 1.5;
          e.vy = (dy / len) * 4.5;
          e.baseY += Math.sign(game.player.y - e.baseY) * 36;
          e.baseY = Math.max(220, Math.min(620, e.baseY));
        }
      } else {
        e.telegraph = false;
        // figure-8 hover
        e.y = e.baseY + Math.sin(e.bob) * 16;
        e.x += Math.sin(e.bob * 2) * 0.55;
        e.vy = 0;
        e.vx *= 0.988;
        e.vx = Math.max(-3.2, Math.min(3.2, e.vx));
      }
      if (e.x < 30 || e.x > ROOM_W - 30 - e.w) { e.vx *= -1; e.x = Math.max(30, Math.min(ROOM_W - 30 - e.w, e.x)); }
    }
    // --- abeja/avispa: gentle hover, buzz telegraph, steeper stinger dive ---
    if (e.kind === "abeja" || e.kind === "avispa") {
      e.bob = (e.bob || 0) + 0.07;
      if (e.baseY == null) e.baseY = e.y;
      e.cd = (e.cd || 0) - 1;
      if (e.diving > 0) {
        e.diving--;
        e.telegraph = false;
        e.charging = e.diving; // drives drawAbeja sting stretch
        if (t % 3 === 0) game.ghosts.push({ x: e.x, y: e.y, w: e.w, h: e.h, life: 8, color: "#ffcc33" });
        if (e.diving <= 0) {
          e.cd = 80;
          e.charging = 0;
          e.vx *= 0.25;
          e.vy *= 0.15;
          e.baseY = Math.max(220, Math.min(620, e.y));
        }
      } else if (e.cd <= 0 && game.player) {
        e.wind = (e.wind || 0) + 1;
        e.telegraph = true;
        e.vx *= 0.9;
        e.vy = 0;
        // hover wobble while winding up
        e.y = e.baseY + Math.sin(e.bob * 1.6) * 10;
        if (e.wind > 36) {
          e.wind = 0;
          e.telegraph = false;
          e.diving = 26;
          e.charging = 26;
          const dx = game.player.x - e.x;
          const dy = game.player.y - e.y + 12;
          const len = Math.hypot(dx, dy) || 1;
          // steeper dive than avispa (more vertical stinger plunge)
          e.vx = (dx / len) * 6.2;
          e.vy = (dy / len) * 8.4;
          game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#ffcc33", count: 7, size: 2.6, up: 1.0 });
        }
      } else {
        e.telegraph = false;
        e.charging = 0;
        e.vy = 0;
        // idle hover — rounder bob than avispa
        e.y = e.baseY + Math.sin(e.bob) * 16 + Math.sin(e.bob * 2.5) * 5;
        if (game.player) e.vx += Math.sign(game.player.x - e.x) * 0.03;
        e.vx = Math.max(-2.0, Math.min(2.0, e.vx));
        e.baseY += Math.sign((game.player ? game.player.y : e.baseY) - e.baseY) * 0.18;
        e.baseY = Math.max(220, Math.min(620, e.baseY));
      }
      if (e.x < 30 || e.x > ROOM_W - 30 - e.w) { e.vx *= -1; e.x = Math.max(30, Math.min(ROOM_W - 30 - e.w, e.x)); }
    }
    // --- pez: school sine, dash burst, vertical hunt, dense bubbles ---
    if (e.kind === "pez") {
      e.vy = 0;
      e.bob = (e.bob || 0) + 0.06;
      if (e.baseY == null) e.baseY = e.y;
      e.dashCd = (e.dashCd || 0) - 1;
      if (e.dashSwim > 0) {
        e.dashSwim--;
        if (t % 2 === 0) game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#a0e8ff", count: 2, size: 2.2, up: 0.3, speed: 0.6, life: 14 });
        if (e.dashSwim <= 0) e.vx *= 0.45;
      } else if (e.dashCd <= 0 && game.player) {
        e.dashCd = 90 + (t % 40);
        e.dashSwim = 18;
        e.vx = Math.sign(game.player.x - e.x || 1) * 4.4;
        e.baseY += Math.sign(game.player.y - e.baseY) * 28;
      }
      // school-like sine offset
      e.y = e.baseY + Math.sin(e.bob) * 26 + Math.sin(e.bob * 2.2) * 8;
      if (game.player) {
        e.vx += Math.sign(game.player.x - e.x) * 0.035;
        e.baseY += Math.sign(game.player.y - e.baseY) * 0.25;
      }
      e.vx = Math.max(e.dashSwim > 0 ? -4.6 : -2.4, Math.min(e.dashSwim > 0 ? 4.6 : 2.4, e.vx));
      e.baseY = Math.max(280, Math.min(560, e.baseY));
      if (e.x < 30 || e.x > ROOM_W - 30 - e.w) { e.vx *= -1; e.x = Math.max(30, Math.min(ROOM_W - 30 - e.w, e.x)); }
      if (t % 3 === 0) game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#7ec8f0", count: 2, size: 2.0, up: 0.28, speed: 0.5, life: 16 });
    }
    // --- medusa: near player pulse then pink soft zap projectile ---
    if (e.kind === "medusa") {
      e.vy = 0;
      e.bob = (e.bob || 0) + 0.04;
      if (e.baseY == null) e.baseY = e.y;
      e.baseY += Math.sign((game.player ? game.player.y : e.baseY) - e.baseY) * 0.18;
      e.y = e.baseY + Math.sin(e.bob) * 40;
      if (game.player) e.vx += Math.sign(game.player.x - e.x) * 0.015;
      e.vx = Math.max(-1.4, Math.min(1.4, e.vx));
      if (e.x < 30 || e.x > ROOM_W - 30 - e.w) { e.vx *= -1; e.x = Math.max(30, Math.min(ROOM_W - 30 - e.w, e.x)); }
      if (t % 8 === 0) game.fx.emit(e.x + e.w / 2, e.y + e.h - 4, { color: "#ff9ad8", count: 1, size: 2, up: 0.4, speed: 0.5, life: 14 });
      if (e.pulsezap > 0) {
        e.pulsezap--;
        e.telegraph = e.pulsezap > 8; // pulse ring visible ~0.4s (pulsezap 32→9)
        if (e.pulsezap === 8 && game.player) {
          const aim = Math.sign(game.player.x - e.x) || 1;
          game.projectiles.push({
            x: e.x + e.w / 2 - 5, y: e.y + e.h / 2,
            vx: aim * 1.6, vy: (game.player.y - e.y) * 0.012,
            w: 12, h: 12, life: 90, dmg: 10, color: "#ff8ad0",
            owner: "enemy", trail: true,
          });
          game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#ff8ad0", count: 10, size: 3, up: 1.2, star: true });
        }
        if (e.pulsezap <= 0) e.zapCd = 100;
      } else {
        e.telegraph = false;
        e.zapCd = (e.zapCd || 0) - 1;
        if (e.zapCd <= 0 && game.player) {
          const dist = Math.hypot(game.player.x - e.x, game.player.y - e.y);
          if (dist < 280) e.pulsezap = 32; // ~0.4s telegraph before sting
          else e.zapCd = 20;
        }
      }
    }
    // --- anguila: sine swim + zap telegraph bolt ---
    if (e.kind === "anguila" && !(e.stun > 5)) {
      e.vy = 0;
      e.bob = (e.bob || 0) + 0.055;
      if (e.baseY == null) e.baseY = e.y;
      e.y = e.baseY + Math.sin(e.bob) * 22 + Math.sin(e.bob * 1.7) * 8;
      if (game.player) {
        e.vx += Math.sign(game.player.x - e.x) * 0.028;
        e.baseY += Math.sign(game.player.y - e.baseY) * 0.2;
      }
      e.vx = Math.max(-2.2, Math.min(2.2, e.vx));
      e.baseY = Math.max(260, Math.min(560, e.baseY));
      if (e.x < 30 || e.x > ROOM_W - 30 - e.w) { e.vx *= -1; e.x = Math.max(30, Math.min(ROOM_W - 30 - e.w, e.x)); }
      if (t % 4 === 0) game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#40e0d0", count: 1, size: 1.8, up: 0.2, speed: 0.4, life: 12 });
      if (e.pulsezap > 0) {
        e.pulsezap--;
        e.telegraph = e.pulsezap > 12; // ~0.4s telegraph (pulsezap 36→12)
        if (game.player && e.telegraph) {
          e.aimDx = game.player.x - e.x;
          e.aimDy = game.player.y - e.y;
        }
        if (e.pulsezap === 12 && game.player) {
          const dx = game.player.x - e.x, dy = game.player.y - e.y;
          const len = Math.hypot(dx, dy) || 1;
          game.projectiles.push({
            x: e.x + e.w / 2 - 5, y: e.y + e.h / 2,
            vx: (dx / len) * 2.4, vy: (dy / len) * 2.0,
            w: 11, h: 11, life: 80, dmg: 10, color: "#ff8ad0",
            owner: "enemy", trail: true,
          });
          game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#7ee7ff", count: 8, size: 2.8, up: 1.0, star: true });
        }
        if (e.pulsezap <= 0) { e.zapCd = 110; e.aimDx = e.aimDy = null; }
      } else {
        e.telegraph = false;
        e.aimDx = e.aimDy = null;
        e.zapCd = (e.zapCd || 0) - 1;
        if (e.zapCd <= 0 && game.player) {
          const dist = Math.hypot(game.player.x - e.x, game.player.y - e.y);
          if (dist < 320) e.pulsezap = 36;
          else e.zapCd = 18;
        }
      }
    }
    // --- rana: telegraph crouch ~0.4s then hop toward player ---
    if (e.kind === "rana" && !(e.stun > 5)) {
      if (e.hopWind > 0) {
        e.hopWind--;
        e.telegraph = true;
        e.vx *= 0.35;
        e.sitting = Math.max(e.sitting || 0, 2);
        if (e.hopWind <= 0 && game.player) {
          e.telegraph = false;
          e.sitting = 0;
          e.hopCd = 52 + (t % 28);
          e.vx = Math.sign(game.player.x - e.x || 1) * (3.2 + Math.random());
          e.vy = -7.2;
          e.flash = 5;
          game.fx.emit(e.x + e.w / 2, e.y + e.h, { color: "#6ad070", count: 6, size: 2.4, up: 1.1 });
        }
      } else if (e.sitting > 0) {
        e.sitting--;
        e.vx *= 0.7;
        e.telegraph = false;
      } else {
        e.hopCd = (e.hopCd || 0) - 1;
        if (e.hopCd <= 0 && game.player) {
          e.hopWind = 24; // ~0.4s telegraph
          e.telegraph = true;
        } else if (Math.abs(e.vy) < 0.2 && e.hopCd > 0 && e.hopCd < 40) {
          e.sitting = 20;
          e.vx = 0;
        }
      }
    }
    // --- cangrejo: scuttle + pinza telegraph (~0.4s) then snap ---
    if (e.kind === "cangrejo" && !(e.stun > 5)) {
      e.clawCd = (e.clawCd || 0) - 1;
      const near = game.player && Math.abs(game.player.x - e.x) < 130 && Math.abs(game.player.y - e.y) < 90;
      if (e.clawWind > 0) {
        e.clawWind--;
        e.telegraph = true;
        e.claws = true;
        e.vx *= 0.55;
        if (e.clawWind <= 0) {
          e.telegraph = false;
          e.clawSnap = 16;
          e.clawCd = 55;
          e.flash = 5;
          game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#ff8040", count: 8, size: 2.6, up: 1.0 });
        }
      } else if (e.clawSnap > 0) {
        e.clawSnap--;
        e.claws = true;
        e.telegraph = false;
        if (near && game.player) e.vx += Math.sign(game.player.x - e.x || 1) * 0.14;
      } else {
        e.claws = !!near;
        e.telegraph = false;
        if (near && game.player) {
          e.vx += Math.sign(game.player.x - e.x || 1) * 0.08;
          if (e.clawCd <= 0) e.clawWind = 24; // ~0.4s telegraph
        }
      }
      e.vx = Math.max(-2.6, Math.min(2.6, e.vx));
    }
    // --- gaviota: glide then softer dive like mosquito ---
    if (e.kind === "gaviota") {
      e.diveCd = (e.diveCd || 0) - 1;
      if (e.baseY == null) e.baseY = e.y;
      e.bob = (e.bob || 0) + 0.05;
      if (e.diving) {
        e.diving--;
        e.telegraph = false;
        if (e.diving <= 0) { e.diveCd = 70; e.vy = -2.0; e.baseY = Math.max(240, Math.min(520, e.y)); }
      } else if (e.diveCd <= 0 && game.player) {
        e.wind = (e.wind || 0) + 1;
        e.telegraph = true;
        e.vx *= 0.88;
        e.vy *= 0.75;
        if (e.wind > 24) { // ~0.4s telegraph
          e.wind = 0; e.telegraph = false; e.diving = 26;
          e.vx = Math.sign(game.player.x - e.x || 1) * 2.6;
          e.vy = 4.2;
        }
      } else {
        e.telegraph = false;
        e.vy += 0.03;
        e.y = e.baseY + Math.sin(e.bob) * 12;
        e.vy = 0;
        if (game.player) e.vx += Math.sign(game.player.x - e.x) * 0.05;
        if (e.y < 260) e.baseY += 0.4;
        if (e.y > 560) e.baseY -= 0.4;
      }
      e.vx = Math.max(-3.4, Math.min(3.4, e.vx));
      if (e.x < 30 || e.x > ROOM_W - 30 - e.w) { e.vx *= -1; e.x = Math.max(30, Math.min(ROOM_W - 30 - e.w, e.x)); }
    }
    // --- murcielago: flap bob, dive at mid HP or on timer ---
    if (e.kind === "murcielago") {
      e.diveCd = (e.diveCd || 0) - 1;
      if (e.baseY == null) e.baseY = e.y;
      e.bob = (e.bob || 0) + 0.09;
      const angry = e.hp < e.max * 0.5;
      if (e.diving) {
        e.diving--;
        e.telegraph = false;
        if (t % 3 === 0) game.ghosts.push({ x: e.x, y: e.y, w: e.w, h: e.h, life: 7, color: "#4a3060" });
        if (e.diving <= 0) { e.diveCd = angry ? 40 : 65; e.vy = -2.4; e.baseY = Math.max(200, Math.min(500, e.y)); }
      } else if ((e.diveCd <= 0 || (angry && e.diveCd < 20)) && game.player) {
        e.wind = (e.wind || 0) + 1;
        e.telegraph = true;
        e.vx *= 0.86;
        if (e.wind > 12) {
          e.wind = 0; e.telegraph = false; e.diving = 24;
          e.vx = Math.sign(game.player.x - e.x || 1) * 3.0;
          e.vy = 5.0;
        }
      } else {
        e.telegraph = false;
        e.y = e.baseY + Math.sin(e.bob) * 14;
        e.vy = 0;
        if (game.player) e.vx += Math.sign(game.player.x - e.x) * 0.07;
        e.vx = Math.max(-3.2, Math.min(3.2, e.vx));
      }
      if (e.x < 30 || e.x > ROOM_W - 30 - e.w) { e.vx *= -1; e.x = Math.max(30, Math.min(ROOM_W - 30 - e.w, e.x)); }
    }
    // --- arana: crawl, occasional drop from above ---
    if (e.kind === "arana") {
      e.dropCd = (e.dropCd || 0) - 1;
      if (e.dropping) {
        e.telegraph = true;
        e.vx *= 0.92;
        if (e.vy > 6) e.dropping = false;
        // stick when landing (vy zeroed by platform)
      } else if (e.dropCd <= 0 && game.player && Math.abs(game.player.x - e.x) < 160) {
        e.dropCd = 140;
        e.dropping = true;
        e.y = Math.max(80, e.y - 180);
        e.vy = 0.5;
        e.telegraph = true;
        game.fx.emit(e.x + e.w / 2, e.y, { color: "#888", count: 4, size: 2, up: 0.3 });
      } else {
        e.telegraph = false;
        if (game.player) e.vx += Math.sign(game.player.x - e.x) * 0.04;
        e.vx = Math.max(-2.0, Math.min(2.0, e.vx));
      }
      if (!e.dropping && Math.abs(e.vy) < 0.15) e.dropping = false;
    }
    // --- brasita: bob float, ember particles ---
    if (e.kind === "brasita") {
      e.bob = (e.bob || 0) + 0.08;
      if (e.baseY == null) e.baseY = e.y;
      e.y = e.baseY + Math.sin(e.bob) * 18;
      e.vy = 0;
      if (game.player) {
        e.vx += Math.sign(game.player.x - e.x) * 0.04;
        e.baseY += Math.sign(game.player.y - e.baseY) * 0.22;
      }
      e.vx = Math.max(-1.8, Math.min(1.8, e.vx));
      e.baseY = Math.max(220, Math.min(620, e.baseY));
      if (e.x < 30 || e.x > ROOM_W - 30 - e.w) { e.vx *= -1; e.x = Math.max(30, Math.min(ROOM_W - 30 - e.w, e.x)); }
      if (t % 3 === 0) game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#ff8a30", count: 2, size: 2.4, up: 0.8, speed: 0.9, life: 16 });
    }
    // --- escoria: slow crawler, hotter/faster when low HP ---
    if (e.kind === "escoria") {
      const hot = e.hp < e.max * 0.45;
      const spd = hot ? 2.4 : 1.1;
      if (game.player) e.vx += Math.sign(game.player.x - e.x || 1) * (hot ? 0.12 : 0.04);
      e.vx = Math.max(-spd, Math.min(spd, e.vx));
      e.telegraph = hot;
      e.color = hot ? "#ff4020" : "#c04010";
      if (hot && t % 4 === 0) game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#ff6020", count: 2, size: 2.2, up: 0.6, life: 12 });
    }
    // --- ufo: hover, shoot slow projectile ~90f ---
    if (e.kind === "ufo" && !(e.stun > 5)) {
      e.bob = (e.bob || 0) + 0.04;
      if (e.baseY == null) e.baseY = e.y;
      e.y = e.baseY + Math.sin(e.bob) * 14;
      e.vy = 0;
      if (game.player) {
        e.vx += Math.sign(game.player.x - e.x) * 0.03;
        e.baseY += Math.sign(game.player.y - 40 - e.baseY) * 0.15;
      }
      e.vx = Math.max(-1.6, Math.min(1.6, e.vx));
      e.baseY = Math.max(180, Math.min(520, e.baseY));
      if (e.x < 30 || e.x > ROOM_W - 30 - e.w) { e.vx *= -1; e.x = Math.max(30, Math.min(ROOM_W - 30 - e.w, e.x)); }
      e.shootCd = (e.shootCd || 0) - 1;
      // Telegraph ~0.5s antes del rayo
      if (e.shootCd <= 30) e.telegraph = true;
      else e.telegraph = false;
      if (e.shootCd <= 0 && game.player) {
        e.shootCd = 90;
        e.telegraph = false;
        const dx = game.player.x - e.x, dy = game.player.y - e.y;
        const len = Math.hypot(dx, dy) || 1;
        game.projectiles.push({
          x: e.x + e.w / 2 - 6, y: e.y + e.h,
          vx: (dx / len) * 1.8, vy: (dy / len) * 1.5 + 0.4,
          w: 12, h: 12, life: 110, dmg: 9, color: "#7ee7ff",
          owner: "enemy", trail: true,
        });
        game.fx.emit(e.x + e.w / 2, e.y + e.h, { color: "#7ee7ff", count: 6, size: 2.5, up: 0.8 });
      }
    }
    for (const plat of game.platforms) {
      if (isAirFoe(e)) break;
      if (e.x + e.w > plat.x && e.x < plat.x + plat.w) {
        if (e.y + e.h > plat.y && e.y + e.h < plat.y + 28 && e.vy >= 0) {
          e.y = plat.y - e.h; e.vy = 0;
          if (e.kind === "arana") e.dropping = false;
          if (e.kind === "rana" && e.hopCd > 0 && e.sitting <= 0) e.sitting = 20;
        }
      }
    }
    if (e.y > game.worldH && !e.boss) e.hp = 0;
    if (e.boss && !e.dying) {
      e.x = Math.max(48, Math.min(e.x, ROOM_W - e.w - 48));
      e.y = Math.min(e.y, ROOM_H - 90 - e.h);
    }
    const on = game.platforms.find((plat) => e.x + e.w > plat.x && e.x < plat.x + plat.w && Math.abs(e.y + e.h - plat.y) < 4);
    if (on && ((e.kind === "cucaracho" && e.evo < 2) || e.kind === "cangrejo" || e.kind === "escoria" || (e.kind === "arana" && !e.dropping))
      && (e.x < on.x || e.x + e.w > on.x + on.w)) e.vx *= -1;
    const p = game.player;
    const solid = !(e.kind === "planta" && !e.up);
    if (p && !p.dead && !e.dying && solid && aabb(p, e)) {
      const kb = Math.sign(p.x - e.x || 1);
      let dmg = 7;
      if (e.boss) dmg = e.contactDmg || 22;
      else if (e.kind === "planta") dmg = 12;
      else if ((e.kind === "abeja" || e.kind === "avispa") && (e.diving > 0 || e.charging > 0)) dmg = 14;
      else if (e.kind === "mosquito") dmg = 9;
      else if (e.kind === "libelula") dmg = 8;
      else if (e.kind === "pez") dmg = 8;
      else if (e.kind === "medusa") dmg = 10;
      else if (e.kind === "anguila") dmg = 10;
      else if (e.kind === "rana") dmg = 8;
      else if (e.kind === "cangrejo") dmg = (e.clawSnap > 0) ? 11 : 8;
      else if (e.kind === "gaviota") dmg = e.diving ? 10 : 7;
      else if (e.kind === "murcielago") dmg = e.diving ? 11 : 8;
      else if (e.kind === "arana") dmg = 9;
      else if (e.kind === "brasita") dmg = 9;
      else if (e.kind === "escoria") dmg = e.hp < e.max * 0.4 ? 12 : 9;
      else if (e.kind === "ufo") dmg = 8;
      else if (e.kind === "cucaracho" && e.evo >= 2) dmg = 12;
      else if (e.kind === "cucaracho" && e.evo >= 1) dmg = 10;
      else if (e.kind === "cucaracho") dmg = 7;
      else if (e.evo) dmg = 10;
      if (e.elite) dmg = Math.round(dmg * 1.25);
      hurtPlayer(dmg, "-" + dmg);
      if (e.kind === "mosquito") {
        game.fx.emit(p.x + p.w / 2, p.y + p.h / 2, { color: "#ff2020", count: 6, size: 2.4, up: 1.0, life: 14 });
      }
      if (!p.dead) { p.vx = kb * 10; p.vy = -6.5; }
    }
  }
  game.enemies = game.enemies.filter((e) => {
    if (e.boss && e.hp <= 0) {
      if (!e.fell) {
        e.fell = true;
        e.dying = e.dyingMax || 120;
        e.hp = 0;
        e.vx = 0;
        e.vy = 0;
        e.telegraph = false;
        e.mode = "idle";
        game.flash = 18;
        game.shake = 24;
        beep("win");
        game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#ffe66a", count: game.reduceMotion ? 12 : 32, size: 6, up: 2.8, star: true });
        game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#ff4060", count: game.reduceMotion ? 8 : 20, size: 4, up: 2, speed: 3.5 });
        showNotification("EL NIDO CAE", "La Reina se deshace.", "sala");
        beginFinale(e);
        return true;
      }
      if (e.dying > 0 || (game.finale && game.finale.t > 0)) return true;
      return false;
    }
    if (e.hp > 0) return true;
    if (e.deathHold && e.dying > 0) return true;
    // Cucaracho muda: 1ª muerte → evo1, 2ª → evo2 flyer, 3ª → kill real
    if (e.kind === "cucaracho" && !e.baby && e.evo < 2) {
      e.evo += 1;
      e.hp = Math.round(e.max * 0.9);
      e.max = Math.max(e.max, e.hp);
      e.w += e.evo === 1 ? 10 : 8;
      e.h += e.evo === 1 ? 6 : 4;
      e.vx *= e.evo === 1 ? 1.35 : 1.25;
      e.color = e.evo >= 2 ? "#c81818" : "#8a2010";
      e.flash = 18;
      e.invuln = 28;
      game.flash = Math.max(game.flash, 8);
      game.shake = Math.max(game.shake, e.evo >= 2 ? 14 : 10);
      // shell-pop particles (+1 vs prior lote; cada death stage Design A)
      game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, {
        color: e.evo >= 2 ? "#ff4a20" : "#c45a18",
        count: e.evo >= 2 ? 29 : 21, size: 5, up: 2.4, star: true,
      });
      game.fx.emit(e.x + e.w / 2, e.y, {
        color: "#ffe0a0", count: 13, size: 3.5, up: 2.8, speed: 3.5, life: 20,
      });
      if (e.evo >= 2) {
        e.bob = 0;
        e.baseY = Math.max(260, Math.min(620, e.y - 40));
        e.y = e.baseY;
        e.vy = -3.2;
        e.diveCd = 40;
        e.diving = false;
        e.telegraph = false;
        showNotification("¡VUELA!", "Cucaracho alado.", "hurt");
      } else {
        e.lungeCd = 40;
        showNotification("CUCARACHO+", "Ha mudado. Más cabreado.", "hurt");
      }
      return true;
    }
    Surprises.onEnemyKilled(e, game);
    if (e.kind === "cucaracho") {
      game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, {
        color: "#ff4a20", count: 1, size: 5, up: 2.4, star: true,
      });
    }
    punch(e.x, e.y, e.color); beep("kill"); game.kills++; game.player.health = Math.min(game.player.maxHealth, game.player.health + 4);
    if (e.dropsOrb) {
      game.orbs.push({ x: e.x + e.w / 2, y: e.y + e.h / 2, r: 9, taken: false });
      game.fx.emit(e.x + e.w / 2, e.y + e.h / 2, { color: "#ffe66a", count: 12, size: 4, up: 1.6, star: true });
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
        if (!e.dying && !(e.invuln > 0) && aabb({ x: pr.x, y: pr.y, w: pr.w, h: pr.h }, e)) {
          let dmg = pr.dmg * (1 + game.player.evo * 0.35); if (e.boss) dmg *= 0.55;
          dmg = Math.round(dmg);
          e.hp -= dmg; e.vx += Math.sign(pr.vx) * (e.boss ? 0.6 : 5.5); e.vy = Math.min(e.vy || 0, -2.5);
          e.stun = Math.max(e.stun || 0, e.boss ? 4 : 12);
          e.flash = Math.max(e.flash || 0, 14);
          pr.life = 0; punch(e.x, e.y, pr.color); game.player.xp += 3;
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
  let lerp = 0.12;
  let tx = p.x + p.facing * 80 - canvas.width / 2;
  let ty = p.y - canvas.height * 0.58;
  const boss = game.enemies.find((e) => e.boss && !e.fell);
  const fin = game.finale && game.finale.t > 0 ? game.finale : null;
  if (fin) {
    tx = fin.x - canvas.width / 2;
    ty = fin.y - canvas.height * 0.46;
    lerp = 0.07;
  } else if (boss) {
    const bx = boss.x + boss.w / 2;
    const by = boss.y + boss.h * 0.28;
    const px = p.x + p.w / 2;
    const py = p.y + p.h * 0.35;
    tx = (px + bx) / 2 - canvas.width / 2;
    ty = (py * 0.45 + by * 0.55) - canvas.height * 0.42;
    lerp = 0.18;
  }
  game.cam.x += (tx - game.cam.x) * lerp;
  game.cam.y += (ty - game.cam.y) * lerp;
  if (game.camPunch > 0) game.camPunch *= 0.82;
  game.cam.x = Math.max(0, Math.min(game.cam.x, Math.max(0, game.worldW - canvas.width)));
  game.cam.y = Math.max(-40, Math.min(game.cam.y, Math.max(-40, game.worldH - canvas.height + 80)));
  if (game.shake > 0) game.shake *= 0.86;
  if (game.comboT > 0) game.comboT--; else game.combo = 0;
  if (game.fading > 0) game.fading--;
  if (game.flash > 0) {
    game.flash--;
    if (game.flash <= 0) game.flashColor = null;
  }
  game.nums.update();
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
  const shake = reduceMotion ? 0 : game.shake;
  ctx.save(); ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
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
    // drop shadow
    ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.fillRect(x + 6, y + 12, plat.w, plat.h);
    // body + depth (darken lower half)
    ctx.fillStyle = world.ground; ctx.fillRect(x, y, plat.w, plat.h);
    ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.fillRect(x, y + Math.max(10, plat.h * 0.45), plat.w, plat.h);
    // grassy/lit top cap
    ctx.fillStyle = world.groundTop || "#8fd98a"; ctx.fillRect(x, y, plat.w, 10);
    ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.fillRect(x, y, plat.w, 3);
    // world-accent glowing edge
    ctx.globalAlpha = 0.5; ctx.fillStyle = world.edge || "#fff"; ctx.fillRect(x, y - 3, plat.w, 3); ctx.globalAlpha = 1;
    ctx.fillStyle = world.edge || "#fff"; ctx.fillRect(x, y - 1, plat.w, 2);
    // side bevels
    ctx.fillStyle = "rgba(255,255,255,.10)"; ctx.fillRect(x, y, 2, plat.h);
    ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(x + plat.w - 2, y, 2, plat.h);
    // world-driven outline (reef/aquatic readability)
    if (world.platOutline) {
      ctx.strokeStyle = world.platOutline;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 0.5, y + 0.5, plat.w - 1, plat.h - 1);
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = world.edge || "#8af8ff";
      ctx.fillRect(x - 1, y - 1, 2, plat.h + 2);
      ctx.fillRect(x + plat.w - 1, y - 1, 2, plat.h + 2);
      ctx.globalAlpha = 1;
    }
  }
  const r = room();
  drawSigns(ctx, r, game.cam, t, game.player.evo);
  portals.draw(ctx, game.cam, t);
  Rain.draw(ctx, game.cam);
  Rain.drawPlayerHint(ctx, game.cam, game.player);
  Surprises.draw(ctx, game.cam, t, game);
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
  Magic.draw(ctx, game, t);
  Passives.draw(ctx, game, t);
  for (const pr of game.projectiles) drawProjectile(ctx, pr, game.cam, t);
  for (const b of game.bolts) drawBolt(ctx, b, game.cam, t);
  for (const s of game.slashes || []) drawSlash(ctx, s, game.cam);
  game.fx.render(ctx, game.cam); game.nums.render(ctx, game.cam);
  if (DeathFx.isPlaying()) {
    DeathFx.draw(ctx, game.cam, t);
    ctx.globalAlpha = typeof DeathFx.playerAlpha === "function" ? DeathFx.playerAlpha() : 0.45;
    drawCharacter(ctx, game.player, game.cam, t);
    ctx.globalAlpha = 1;
  } else if (game.player.dead) {
    ctx.globalAlpha = 0.45;
    drawCharacter(ctx, game.player, game.cam, t);
    ctx.globalAlpha = 1;
  } else if (game.player.invuln % 4 !== 1) {
    const pv = typeof portals.playerVisual === "function" ? portals.playerVisual() : null;
    if (pv && (pv.scale < 0.99 || pv.alpha < 0.99)) {
      const px = game.player.x + game.player.w / 2 - game.cam.x;
      const py = game.player.y + game.player.h / 2 - game.cam.y;
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(pv.scale, pv.scale);
      ctx.translate(-px, -py);
      ctx.globalAlpha = Math.max(0, pv.alpha);
      drawCharacter(ctx, game.player, game.cam, t);
      ctx.restore();
    } else {
      drawCharacter(ctx, game.player, game.cam, t);
    }
  }
  ctx.restore();
  // Skip low-HP edge vignette during death FX — at health=0 it was ~60% opaque over the ghost
  if (!DeathFx.isPlaying()) {
    const low = 1 - Math.max(0, game.player.health / Math.max(1, game.player.maxHealth));
    const vg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.3, canvas.width / 2, canvas.height / 2, canvas.width * 0.72);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(" + Math.round(80 * low) + ",0,0," + (0.32 + low * 0.28) + ")");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  {
    const ov = typeof portals.getOverlay === "function" ? portals.getOverlay() : null;
    if (game.fading > 0) {
      const fadeMax = game._portalFadeMax || 12;
      const fa = Math.min(1, game.fading / Math.max(1, fadeMax));
      let tint = "0,0,0";
      if (ov && ov.color) tint = ov.color;
      else if (game._portalFlash === "purple") tint = "90,40,160";
      else if (game._portalFlash === "amber") tint = "255,160,60";
      // Tint fuerte + ligera vignette tipada
      ctx.fillStyle = "rgba(" + tint + "," + Math.min(0.92, fa * 0.95) + ")";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const vgA = fa * 0.35;
      if (vgA > 0.02) {
        const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.2, canvas.width / 2, canvas.height / 2, canvas.width * 0.7);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(" + tint + "," + vgA + ")");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else if (ov && ov.alpha > 0.02) {
      // Overlay durante charge (antes del fade de viaje)
      const a = Math.min(0.9, ov.alpha);
      ctx.fillStyle = "rgba(" + (ov.color || "0,0,0") + "," + a + ")";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (ov.vignette > 0.05) {
        const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.18, canvas.width / 2, canvas.height / 2, canvas.width * 0.72);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(" + (ov.color || "0,0,0") + "," + (ov.vignette * 0.55) + ")");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else if (game._portalFlash && game.flash <= 0) {
      game._portalFlash = null;
      game._portalFadeMax = 0;
    }
  }
  if (game.finale && game.finale.t > 0) {
    const f = game.finale;
    const k = 1 - f.t / f.max;
    ctx.save();
    ctx.fillStyle = "rgba(4,8,16," + Math.min(0.78, k * 0.95) + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (k > 0.28) {
      ctx.globalAlpha = Math.min(1, (k - 0.28) * 2.4);
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffe66a";
      ctx.font = "800 46px Fraunces, serif";
      ctx.fillText("EL NIDO CAE", canvas.width / 2, canvas.height * 0.4);
      ctx.font = "600 18px Outfit, sans-serif";
      ctx.fillStyle = "#9ad7ff";
      ctx.fillText("Nadie se queda atrás", canvas.width / 2, canvas.height * 0.4 + 36);
      ctx.globalAlpha = 0.65;
      ctx.font = "600 13px Outfit, sans-serif";
      ctx.fillText("Esc para saltar", canvas.width / 2, canvas.height * 0.4 + 68);
    }
    ctx.restore();
  }
  if (game.ult && game.ult.t > 0) {
    game.ult.t--;
    const u = game.ult.t / 42;
    ctx.save();
    ctx.strokeStyle = game.ult.color || "#ffe66a";
    ctx.globalAlpha = Math.min(0.85, u + 0.15);
    ctx.lineWidth = 8;
    const rad = (1 - u) * Math.max(canvas.width, canvas.height) * 0.72;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, rad, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = "800 28px Fraunces, serif";
    ctx.textAlign = "center";
    ctx.fillStyle = game.ult.color || "#fff";
    ctx.globalAlpha = Math.min(1, u * 2);
    ctx.fillText(game.ult.name || "", canvas.width / 2, canvas.height * 0.28);
    ctx.restore();
  }
  if (game.flash > 0) {
    const fa = (reduceMotion ? Math.min(game.flash, 5) : game.flash) / 20;
    if (game.flashColor && !game._portalFlash) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, fa);
      ctx.fillStyle = game.flashColor || "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      let rgb = "255,255,220";
      if (game._portalFlash === "purple") rgb = "200,150,255";
      else if (game._portalFlash === "amber") rgb = "255,200,120";
      ctx.fillStyle = "rgba(" + rgb + "," + fa + ")";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
  if (canvas.width >= 820) drawMinimap();
}
function renderAbilityBar() {
  const bar = document.getElementById("ability-bar");
  if (!bar || !game.player) return;
  bar.innerHTML = (game.player.abilities || []).map((id) => {
    const d = ABILITY_DEFS[id];
    if (!d) return "";
    return '<div class="ability-slot" data-id="' + id + '" style="--abil:' + d.color + '"><div class="key">' + d.key + '</div><div class="name">' + d.name + '</div><div class="cd"><i class="cd-fill"></i></div><b class="cd-sec"></b></div>';
  }).join("");
}
// Retrato vivo del personaje en el HUD (misma pipeline que el juego)
function drawHudAvatar(p) {
  const av = document.getElementById("hud-avatar");
  if (!av) return;
  let cv = av.querySelector("canvas");
  if (!cv) {
    cv = document.createElement("canvas");
    cv.width = 88; cv.height = 88;
    cv.style.cssText = "position:relative;z-index:1;width:100%;height:100%;display:block";
    av.appendChild(cv);
  }
  const c = cv.getContext("2d");
  c.clearRect(0, 0, cv.width, cv.height);
  const evo = Math.max(0, Math.min(4, Number(p.evo) || 0));
  const dummy = {
    id: p.id, evo, color: p.color, x: -10, y: -20, w: 20, h: 20, facing: 1,
    grounded: true, vx: 0, vy: 0, melee: 0, invuln: 0,
    visualScale: 70 / [36, 48, 58, 68, 80][evo],
  };
  c.save();
  c.translate(cv.width / 2, cv.height - 8);
  drawCharacter(c, dummy, { x: 0, y: 0 }, t);
  c.restore();
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
  const hpPct = Math.max(0, Math.min(100, (p.health / Math.max(1, p.maxHealth)) * 100));
  if (hpBar) {
    hpBar.style.width = hpPct + "%";
    hpBar.parentElement?.setAttribute("aria-valuenow", String(Math.round(hpPct)));
  }
  const hpText = document.getElementById("hp-text");
  if (hpText) hpText.textContent = Math.max(0, Math.ceil(p.health)) + "/" + p.maxHealth;
  drawHudAvatar(p);
  const xpEl = document.getElementById("xp-bar");
  if (xpEl) {
    const nxt = p.evo >= 4 ? 1 : XP_NEED[p.evo + 1];
    const prev = XP_NEED[p.evo] || 0;
    const xpPct = p.evo >= 4 ? 100 : Math.max(0, Math.min(100, ((p.xp - prev) / Math.max(1, nxt - prev)) * 100));
    xpEl.style.width = xpPct + "%";
    xpEl.parentElement?.setAttribute("aria-valuenow", String(Math.round(xpPct)));
    const xpText = document.getElementById("xp-text");
    if (xpText) xpText.textContent = p.evo >= 4 ? "MAX" : Math.round(xpPct) + "%";
  }
  const worldEl = document.getElementById("hud-world");
  if (worldEl) worldEl.textContent = room().name;
  const evoEl = document.getElementById("hud-evo");
  if (evoEl) evoEl.textContent = "Forma " + (p.evo + 1) + "/5 · Cristales " + orbsLeft;
  // Mini forma: pips on/active + color del personaje
  {
    const pips = document.querySelectorAll("#form-pips b");
    const evoIdx = Math.max(0, Math.min(4, Number(p.evo) || 0));
    const col = p.color || "#7ee7ff";
    for (let i = 0; i < pips.length; i++) {
      const pip = pips[i];
      const filled = i <= evoIdx;
      const active = i === evoIdx;
      pip.classList.toggle("on", filled);
      pip.classList.toggle("active", active);
      if (active) {
        pip.style.background = col;
        pip.style.borderColor = col;
        pip.style.boxShadow = "0 0 12px " + col;
      } else if (filled) {
        pip.style.background = "";
        pip.style.borderColor = "";
        pip.style.boxShadow = "";
      } else {
        pip.style.background = "";
        pip.style.borderColor = "";
        pip.style.boxShadow = "";
      }
    }
  }
  const comboEl = document.getElementById("hud-combo");
  if (comboEl) comboEl.textContent = "Combo " + game.combo + " · Score " + game.score;
  const chip = document.getElementById("combo-chip");
  if (chip) {
    const show = game.combo > 1 && game.comboT > 0;
    const val = chip.querySelector(".combo-value");
    if (val) val.textContent = show ? String(game.combo) : "0";
    chip.classList.toggle("show", show);
    chip.classList.toggle("hidden", !show);
    chip.dataset.rank = show ? comboRank(game.combo) : "";
  }
  const quit = document.getElementById("btn-quit");
  if (quit) quit.classList.toggle("hidden", game.roomId === "boss" && !game.won);
  const boss = game.enemies.find((e) => e.boss);
  const wrap = document.getElementById("boss-wrap");
  document.body.classList.toggle("boss-fight", !!boss);
  if (wrap) {
    wrap.classList.toggle("hidden", !boss);
    const bar = document.getElementById("boss-bar");
    const lab = wrap.querySelector(".boss-label");
    if (boss && bar) bar.style.width = Math.max(0, (boss.hp / Math.max(1, boss.max)) * 100) + "%";
    if (lab) lab.textContent = boss ? ("REINA DEL NIDO  " + Math.max(0, Math.ceil((boss.hp / Math.max(1, boss.max)) * 100)) + "%") : "REINA DEL NIDO";
  }
  const now = performance.now();
  document.querySelectorAll(".ability-slot").forEach((slot) => {
    const def = ABILITY_DEFS[slot.dataset.id];
    const fill = slot.querySelector("i");
    if (!def || !fill) return;
    const readyAt = p.cds[slot.dataset.id] || 0;
    const dur = (p.cdDur && p.cdDur[slot.dataset.id]) || def.cd;
    const left = Math.max(0, readyAt - now);
    const pct = dur > 0 ? Math.max(0, Math.min(100, 100 - (left / dur) * 100)) : 100;
    fill.style.width = pct + "%";
    const sec = slot.querySelector(".cd-sec");
    if (sec) sec.textContent = left > 80 ? (left / 1000).toFixed(1) : "";
    slot.classList.toggle("cooling", left > 80);
  });
  // Touch power buttons: label + cooldown ring
  const PWIDX = { j: 0, k: 1, l: 2 };
  document.querySelectorAll(".touch-btn.pw").forEach((btn) => {
    const id = (p.abilities || [])[PWIDX[btn.dataset.k]];
    const def = id && ABILITY_DEFS[id];
    if (!def) { btn.classList.add("off"); btn.style.setProperty("--cd", "100%"); return; }
    btn.classList.remove("off");
    if (btn.getAttribute("title") !== def.name) btn.setAttribute("title", def.name);
    const readyAt = p.cds[id] || 0;
    const dur = (p.cdDur && p.cdDur[id]) || def.cd;
    const left = Math.max(0, readyAt - now);
    const pct = dur > 0 ? Math.max(0, Math.min(100, 100 - (left / dur) * 100)) : 100;
    btn.classList.toggle("cooling", left > 80);
    btn.style.setProperty("--cd", pct + "%");
  });
}
function loop() {
  t++;
  game.t = t;
  if (game.hitstop > 0) {
    game.hitstop--;
    if (game.shake > 0) game.shake *= 0.92;
    if (game.flash > 0) game.flash--;
    if (game.running) render();
    requestAnimationFrame(loop);
    return;
  }
  if (game.running && !paused && !overlayOpen()) {
    tickFinale();
    updatePlayer(); updateEnemies(); updateProjectiles(); game.fx.update(); if (DeathFx.isPlaying()) DeathFx.update(game); Rain.update(game, { onTickDamage: (n) => hurtPlayer(n, "lluvia") }); Surprises.update(game, t); updateCam(); if ((t & 3) === 0) updateHUD();
  } else if (game.running && (t & 3) === 0) updateHUD();
  if (game.running) render();
  requestAnimationFrame(loop);
}
function setupSelect() {
  const wrap = document.getElementById("chars");
  if (!wrap) return;
  const grid = document.getElementById("chars-grid") || wrap;
  grid.innerHTML = ROSTER.map((c, i) => '<button class="char-card" type="button" data-id="' + c.id + '" aria-label="' + c.name + ' (tecla ' + (i + 1) + ')"><div class="swatch" style="background:' + c.color + '"></div><h3>' + c.name + '</h3><small>' + c.evoNames.join(" → ") + '</small><div class="hint">tecla ' + (i + 1) + '</div></button>').join("");
  grid.querySelectorAll(".char-card").forEach((el) => el.addEventListener("click", () => start(ROSTER.find((r) => r.id === el.dataset.id))));
  addEventListener("keydown", (e) => {
    if (game.running) return;
    if (e.key >= "1" && e.key <= "8") {
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
    playMusic("title");
    closeOverlays();
    document.body.classList.remove("playing", "boss-fight");
    document.getElementById("char-select")?.classList.remove("hidden");
    document.getElementById("boss-wrap")?.classList.add("hidden");
    document.getElementById("combo-chip")?.classList.remove("show");
    setPrompt("", false);
  };
  addEventListener("ohana-after", (e) => {
    const act = e.detail && e.detail.action;
    if (act === "continue") {
      game.running = true;
      return;
    }
    if (act === "repeat") {
      game.won = false;
      if (game.player) {
        game.player.dead = false;
        game.player.health = game.player.maxHealth;
      }
      loadRoom("boss", "right");
      return;
    }
    if (act === "roster") {
      game.running = false;
      playMusic("title");
      closeOverlays();
      document.body.classList.remove("playing", "boss-fight");
      document.getElementById("char-select")?.classList.remove("hidden");
      document.getElementById("boss-wrap")?.classList.add("hidden");
      document.getElementById("combo-chip")?.classList.remove("show");
      setPrompt("", false);
    }
  });
  const POWER_KEY = { j: 0, k: 1, l: 2 };
  const momentary = { shift: 1, f: 1, j: 1, k: 1, l: 1 };
  document.querySelectorAll(".touch-btn").forEach((btn) => {
    const k = btn.dataset.k;
    const down = (ev) => {
      ev.preventDefault();
      btn.classList.add("held");
      if (k === "shift") dash();
      else if (k === "f") melee();
      else if (k in POWER_KEY) { if (game.running && !paused && !overlayOpen()) useAbility(game, POWER_KEY[k]); }
      else keys[k] = true;
    };
    const up = (ev) => { ev.preventDefault(); btn.classList.remove("held"); if (!momentary[k]) keys[k] = false; };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("pointerleave", up);
  });
  // Tappable ability slots (desktop + touch): cast by clicking the HUD pill.
  const abilityBar = document.getElementById("ability-bar");
  abilityBar?.addEventListener("pointerdown", (ev) => {
    const slot = ev.target.closest(".ability-slot");
    if (!slot || !game.running || paused || overlayOpen()) return;
    ev.preventDefault();
    const idx = (game.player && game.player.abilities || []).indexOf(slot.dataset.id);
    if (idx >= 0) useAbility(game, idx);
  });
}
setupSelect();
loop();
