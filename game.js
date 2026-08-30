import { ROSTER, applyForm } from "./characters/roster.js";
import { drawCharacter } from "./characters/draw.js";
import { WORLDS, renderWorld } from "./worlds/index.js";
import { ABILITY_DEFS, useAbility } from "./systems/abilities.js";
import { showNotification } from "./systems/notify.js";
import { ParticleSystem } from "./engine/particles.js";
import { sfx } from "./engine/audio.js";
import { ROOMS, ROOM_W, ROOM_H } from "./systems/map.js";
import { drawEnemy } from "./engine/enemies.js";
import { Floaters } from "./systems/floaters.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const keys = {};
let t = 0;
const XP_NEED = [0, 40, 100];
let muted = false;
let paused = false;

const game = {
  player: null, enemies: [], projectiles: [], bolts: [], platforms: [], orbs: [], hearts: [], ghosts: [],
  fx: new ParticleSystem(), nums: new Floaters(), worldIndex: 0, cam: { x: 0, y: 0 },
  worldW: ROOM_W, worldH: ROOM_H, running: false, spawn: { x: 180, y: 500 },
  shake: 0, combo: 0, comboT: 0, score: 0, roomId: "hub", visited: { hub: true }, fading: 0, flash: 0, kills: 0
};

function beep(n) { if (!muted) try { sfx(n); } catch (e) {} }
function fit() { canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", fit); fit();
addEventListener("pointerdown", () => beep("orb"), { once: true });

addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) e.preventDefault();
  if (e.key === "Escape") { paused = !paused; return; }
  if (e.key === "n" || e.key === "N") { muted = !muted; showNotification("AUDIO", muted ? "Mute" : "On"); return; }
  if (!game.running || paused) return;
  if (e.key === "j" || e.key === "J") useAbility(game, 0);
  if (e.key === "k" || e.key === "K") useAbility(game, 1);
  if (e.key === "l" || e.key === "L") useAbility(game, 2);
  if (e.key === "e" || e.key === "E") evolve("manual");
  if (e.key === "r" || e.key === "R") respawn("manual");
  if (e.key === "m" || e.key === "M") showMap();
  if (e.key === "f" || e.key === "F") melee();
  if (e.key === "Shift") dash();
});
addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });

function room() { return ROOMS[game.roomId]; }
function save() {
  try {
    localStorage.setItem("ohana", JSON.stringify({ roomId: game.roomId, visited: game.visited, score: game.score, evo: game.player && game.player.evo, id: game.player && game.player.id, xp: game.player && game.player.xp }));
  } catch (e) {}
}

function loadRoom(id, fromDir) {
  const r = ROOMS[id]; if (!r) return;
  if (r.needEvo && game.player && game.player.evo < r.needEvo) {
    showNotification("CERRADO", "Necesitas forma " + (r.needEvo + 1));
    beep("hurt");
    if (fromDir === "right") game.player.x = game.worldW - 80;
    if (fromDir === "left") game.player.x = 30;
    if (fromDir === "up") game.player.y = 120;
    if (fromDir === "down") game.player.y = game.worldH - 220;
    game.player.vy = 0; return;
  }
  const first = !game.visited[id];
  game.roomId = id; game.visited[id] = true; game.worldIndex = r.world;
  game.worldW = ROOM_W; game.worldH = ROOM_H;
  game.platforms = r.plats.map((p) => ({ x: p[0], y: p[1], w: p[2], h: p[3] }));
  game.orbs = (r.orbs || []).map((o) => ({ x: o[0], y: o[1], r: 9, taken: false }));
  game.hearts = first ? [{ x: 240, y: 700, taken: false }] : [];
  game.enemies = (r.foes || []).map((f, i) => ({
    x: f[0], y: f[1], w: f[2] === "brute" ? 36 : 32, h: f[2] === "flyer" ? 24 : 28,
    vx: i % 2 ? 1.7 : -1.7, vy: 0, hp: 50 + i * 12, max: 50 + i * 12,
    kind: f[2] || "crawler", color: f[2] === "flyer" ? "#8a4ccf" : f[2] === "brute" ? "#c45a18" : "#6c3",
    boss: false, shoot: 0
  }));
  if (r.boss) game.enemies.push({ x: 900, y: 400, w: 74, h: 74, vx: 2, vy: 0, hp: 420, max: 420, kind: "boss", color: "#f36", boss: true, shoot: 0 });
  if (fromDir === "right") game.player.x = 50;
  if (fromDir === "left") game.player.x = ROOM_W - 90;
  if (fromDir === "up") { game.player.x = 780; game.player.y = ROOM_H - 220; }
  if (fromDir === "down") { game.player.x = 780; game.player.y = 80; }
  game.player.vx = 0; game.player.vy = 0; game.cam.x = 0; game.fading = 12;
  if (first && game.player) { game.player.health = Math.min(game.player.maxHealth, game.player.health + 15); game.nums.add(game.player.x, game.player.y, "+15", "#6f6"); }
  showNotification("SALA", r.name); save();
}

function showMap() { showNotification("MAPA", Object.keys(game.visited).map((id) => ROOMS[id].name).join(" · ")); }
function makePlayer(def) {
  const p = { ...def, x: 180, y: 500, vx: 0, vy: 0, facing: 1, jumps: 0, grounded: false, evo: 0, dead: false, invuln: 0, cds: {}, gliding: 0, xp: 0, coyote: 0, buffer: 0, dash: 0, wall: 0 };
  applyForm(p); return p;
}
function start(def) {
  game.player = makePlayer(def); game.combo = 0; game.score = 0; game.kills = 0; game.shake = 0; game.visited = { hub: true };
  game.projectiles = []; game.bolts = []; game.ghosts = []; game.running = true; paused = false;
  document.getElementById("char-select").classList.add("hidden"); renderAbilityBar(); loadRoom("hub");
}
function evolve(reason) {
  const p = game.player; if (!p || p.dead) return;
  if (p.evo >= 2) { if (reason === "manual") showNotification("MAX", "Forma final."); return; }
  if (reason !== "manual" && p.xp < XP_NEED[p.evo + 1]) return;
  p.evo++; applyForm(p); game.shake = 12; game.flash = 14; beep("evo");
  showNotification("EVOLUCION Lv" + (p.evo + 1), p.name);
  game.fx.emit(p.x + p.w / 2, p.y, { color: p.color, count: 48, size: 6, up: 2 }); save();
}
function respawn() {
  const p = game.player; if (!p) return;
  p.x = 180; p.y = 500; p.vx = 0; p.vy = 0; p.health = p.maxHealth; p.dead = false; p.invuln = 50; game.combo = 0;
  loadRoom("hub");
}
function dash() {
  const p = game.player; if (!p || p.dash > 0 || p.dead) return;
  p.vx = 14 * p.facing; p.invuln = Math.max(p.invuln, 8); p.dash = 28;
  game.ghosts.push({ x: p.x, y: p.y, w: p.w, h: p.h, life: 12, color: p.color });
  beep("jump");
}
function melee() {
  const p = game.player; if (!p || p.dead) return;
  const box = { x: p.x + (p.facing > 0 ? p.w : -28), y: p.y, w: 32, h: p.h };
  game.fx.emit(box.x, box.y + 10, { color: p.color, count: 8, size: 3 });
  for (const e of game.enemies) {
    if (aabb(box, e)) { const d = 22 + p.evo * 8; e.hp -= d; e.vx = 8 * p.facing; game.nums.add(e.x, e.y, "" + d, "#fff"); punch(e.x, e.y, p.color); p.xp += 4; }
  }
}
function checkVoidDeath() {
  const p = game.player;
  if (p.y > game.worldH - 10 && room().doors.down) { loadRoom(room().doors.down, "down"); return; }
  if (p.y > game.worldH + 80 && !p.dead) {
    p.dead = true; p.health = 0; game.shake = 14; beep("hurt");
    showNotification("VACIO", "R al claro");
    setTimeout(() => { if (game.player && game.player.dead) respawn(); }, 900);
  }
}
function aabb(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function punch(x, y, color) {
  game.shake = Math.min(18, game.shake + 6); game.combo += 1; game.comboT = 100; game.score += 10 * game.combo;
  game.fx.emit(x, y, { color, count: 14, size: 4, up: 1.2 }); beep("hit");
}
function tryDoors() {
  const p = game.player; const r = room();
  if (p.x > ROOM_W - 24 && r.doors.right) loadRoom(r.doors.right, "right");
  else if (p.x < -8 && r.doors.left) loadRoom(r.doors.left, "left");
  else if (p.y < 8 && r.doors.up && p.x > 700 && p.x < 900) loadRoom(r.doors.up, "up");
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
  if (!jump) p._jumpHeld = false;
  if (p.glide && !p.grounded && p.vy > 1 && jump) p.vy = 1.15;
  if (p.gliding > 0) { p.gliding--; p.vy = Math.min(p.vy, 1.3); }
  if (p.wall) p.vy = Math.min(p.vy, 2.2);
  p.vy += 0.58; p.x += p.vx; p.y += p.vy; p.grounded = false;
  for (const plat of game.platforms) {
    if (drop && plat.h <= 18) continue;
    if (p.x + p.w > plat.x + 2 && p.x < plat.x + plat.w - 2) {
      if (p.y + p.h > plat.y && p.y + p.h < plat.y + 22 && p.vy >= 0) {
        p.y = plat.y - p.h; p.vy = 0; p.grounded = true; p.jumps = 0; p.coyote = 8;
      }
    }
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
    if (!h.taken && Math.hypot(p.x - h.x, p.y - h.y) < 30) {
      h.taken = true; p.health = Math.min(p.maxHealth, p.health + 25); game.nums.add(h.x, h.y, "+HP", "#f66"); beep("orb");
    }
  }
  tryDoors(); checkVoidDeath();
  if (p.evo < 2 && p.xp >= XP_NEED[p.evo + 1]) evolve("xp");
}
function updateEnemies() {
  for (const e of game.enemies) {
    if (e.kind === "flyer") e.vy += 0.12; else e.vy += 0.5;
    e.x += e.vx; e.y += e.vy;
    if (e.boss) { e.vx += Math.sign((game.player.x - e.x) || 1) * 0.06; if (t % 90 === 0) e.vy = -8; }
    e.shoot = (e.shoot || 0) + 1;
    if ((e.kind === "brute" || e.boss) && e.shoot > 90) {
      e.shoot = 0;
      game.projectiles.push({ x: e.x, y: e.y + 10, vx: Math.sign(game.player.x - e.x) * 5, vy: 0, w: 12, h: 8, life: 70, dmg: 10, color: "#f84", owner: "enemy" });
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
    if (!p.dead && p.invuln <= 0 && aabb(p, e)) {
      p.health -= e.boss ? 16 : 8; p.invuln = 28; p.vx = Math.sign(p.x - e.x || 1) * 8; p.vy = -5; game.shake = 10; game.combo = 0; beep("hurt");
      game.nums.add(p.x, p.y, "-HP", "#f55");
      if (p.health <= 0) { p.dead = true; showNotification("DERROTA", "R al claro"); setTimeout(() => { if (game.player && game.player.dead) respawn(); }, 900); }
    }
  }
  game.enemies = game.enemies.filter((e) => {
    if (e.hp > 0) return true;
    punch(e.x, e.y, e.color); game.kills++; game.player.health = Math.min(game.player.maxHealth, game.player.health + 4);
    if (e.boss) { beep("win"); showNotification("VICTORIA", "Score " + game.score); }
    return false;
  });
}
function updateProjectiles() {
  for (const pr of game.projectiles) {
    if (pr.homing && game.enemies[0]) { pr.vx += Math.sign(game.enemies[0].x - pr.x) * 0.35; pr.vy += Math.sign(game.enemies[0].y - pr.y) * 0.35; }
    pr.x += pr.vx; pr.y += pr.vy; pr.life--;
    if (pr.owner === "player") {
      for (const e of game.enemies) {
        if (aabb({ x: pr.x, y: pr.y, w: pr.w, h: pr.h }, e)) {
          const dmg = pr.dmg * (1 + game.player.evo * 0.35);
          e.hp -= dmg; e.vx += Math.sign(pr.vx) * 3; pr.life = 0; punch(e.x, e.y, pr.color); game.player.xp += 6;
          game.nums.add(e.x, e.y, "" + Math.round(dmg), "#ffe66a");
        }
      }
    } else if (game.player && !game.player.dead && game.player.invuln <= 0 && aabb({ x: pr.x, y: pr.y, w: pr.w, h: pr.h }, game.player)) {
      game.player.health -= pr.dmg; game.player.invuln = 20; pr.life = 0; beep("hurt");
    }
  }
  game.projectiles = game.projectiles.filter((pr) => pr.life > 0);
  game.bolts = game.bolts.filter((b) => --b.life > 0);
  game.ghosts = game.ghosts.filter((g) => --g.life > 0);
}
function updateCam() {
  const p = game.player;
  game.cam.x += (p.x + p.facing * 80 - canvas.width / 2 - game.cam.x) * 0.12;
  game.cam.y += (p.y - canvas.height * 0.58 - game.cam.y) * 0.12;
  game.cam.x = Math.max(0, Math.min(game.cam.x, Math.max(0, game.worldW - canvas.width)));
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
  const cells = [[1,0,"ridge"],[2,0,"space"],[0,1,"lab"],[1,1,"cave"],[2,1,"hub"],[3,1,"beach"],[4,1,"jungle"],[4,2,"volcano"],[5,2,"boss"]];
  const ox = canvas.width - 196, oy = canvas.height - 118;
  ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(ox - 8, oy - 8, 188, 104);
  for (const [cx, cy, id] of cells) {
    ctx.fillStyle = game.roomId === id ? "#7ee7ff" : game.visited[id] ? "#3a6" : "#222";
    ctx.fillRect(ox + cx * 28, oy + cy * 28, 22, 22);
  }
}
function render() {
  const world = WORLDS[game.worldIndex];
  ctx.save(); ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  renderWorld(ctx, world, game.cam, t, canvas.width, canvas.height);
  for (const plat of game.platforms) {
    const x = plat.x - game.cam.x, y = plat.y - game.cam.y;
    ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(x + 8, y + 10, plat.w, plat.h);
    ctx.fillStyle = world.ground; ctx.fillRect(x, y, plat.w, plat.h);
    ctx.fillStyle = world.groundTop || "#8fd98a"; ctx.fillRect(x, y, plat.w, 10);
  }
  const r = room();
  if (r.doors.right) drawPortal(ROOM_W - 96, 370, "ESTE");
  if (r.doors.left) drawPortal(10, 370, "OESTE");
  if (r.doors.up) drawPortal(737, 18, "ARRIBA");
  if (r.doors.down) drawPortal(737, ROOM_H - 40, "ABAJO");
  for (const o of game.orbs) {
    if (o.taken) continue;
    ctx.fillStyle = "#ffe66a"; ctx.shadowBlur = 14; ctx.shadowColor = "#ffe66a";
    ctx.beginPath(); ctx.arc(o.x - game.cam.x, o.y - game.cam.y + Math.sin(t / 12) * 4, 9, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  }
  for (const h of game.hearts) {
    if (h.taken) continue;
    ctx.fillStyle = "#f45"; ctx.beginPath(); ctx.arc(h.x - game.cam.x, h.y - game.cam.y, 8, 0, Math.PI * 2); ctx.fill();
  }
  for (const g of game.ghosts) {
    ctx.globalAlpha = g.life / 16; ctx.fillStyle = g.color; ctx.fillRect(g.x - game.cam.x, g.y - game.cam.y, g.w, g.h); ctx.globalAlpha = 1;
  }
  for (const e of game.enemies) drawEnemy(ctx, e, game.cam, t);
  for (const pr of game.projectiles) {
    ctx.fillStyle = pr.color; ctx.shadowBlur = 12; ctx.shadowColor = pr.color;
    ctx.fillRect(pr.x - game.cam.x, pr.y - game.cam.y, pr.w, pr.h); ctx.shadowBlur = 0;
  }
  game.fx.render(ctx, game.cam); game.nums.render(ctx, game.cam);
  if (game.player && game.player.invuln % 4 !== 1) drawCharacter(ctx, game.player, game.cam, t);
  ctx.restore();
  const low = game.player ? 1 - Math.max(0, game.player.health / game.player.maxHealth) : 0;
  const vg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.3, canvas.width / 2, canvas.height / 2, canvas.width * 0.72);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(" + Math.round(80 * low) + ",0,0," + (0.38 + low * 0.25) + ")");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (game.fading > 0) { ctx.fillStyle = "rgba(0,0,0," + (game.fading / 12) + ")"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  if (game.flash > 0) { ctx.fillStyle = "rgba(255,255,220," + (game.flash / 20) + ")"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  if (game.combo > 1) {
    const rank = game.combo > 12 ? "S" : game.combo > 7 ? "A" : game.combo > 3 ? "B" : "C";
    ctx.fillStyle = "#fff"; ctx.font = "800 40px Outfit,sans-serif"; ctx.textAlign = "center";
    ctx.fillText(game.combo + " COMBO  " + rank, canvas.width / 2, 88);
  }
  if (paused) {
    ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff"; ctx.font = "800 48px Outfit,sans-serif"; ctx.textAlign = "center"; ctx.fillText("PAUSA", canvas.width / 2, canvas.height / 2);
  }
  drawMinimap();
}
function renderAbilityBar() {
  const bar = document.getElementById("ability-bar");
  bar.innerHTML = game.player.abilities.map((id) => {
    const d = ABILITY_DEFS[id];
    return '<div class="ability-slot" data-id="' + id + '"><div class="key">' + d.key + " · " + d.name + '</div><div class="cd"><i></i></div></div>';
  }).join("");
}
function updateHUD() {
  const p = game.player; if (!p) return;
  document.getElementById("hud-name").textContent = p.name;
  const need = p.evo >= 2 ? p.xp : XP_NEED[p.evo + 1];
  const orbsLeft = game.orbs.filter((o) => !o.taken).length;
  document.getElementById("hud-meta").textContent = "HP " + Math.max(0, Math.ceil(p.health)) + "/" + p.maxHealth + " · Lv" + (p.evo + 1) + " · XP " + p.xp + (p.evo < 2 ? "/" + need : "") + " · Orbes " + orbsLeft;
  document.getElementById("hp-bar").style.width = Math.max(0, (p.health / p.maxHealth) * 100) + "%";
  document.getElementById("hud-world").textContent = room().name;
  document.getElementById("hud-evo").textContent = "Forma " + (p.evo + 1) + "/3 · Kills " + game.kills;
  const comboEl = document.getElementById("hud-combo");
  if (comboEl) comboEl.textContent = "Combo " + game.combo + " · Score " + game.score;
  const now = performance.now();
  document.querySelectorAll(".ability-slot").forEach((slot) => {
    const def = ABILITY_DEFS[slot.dataset.id];
    const left = Math.max(0, (p.cds[slot.dataset.id] || 0) - now);
    slot.querySelector("i").style.width = (100 - (left / def.cd) * 100) + "%";
  });
}
function loop() {
  t++;
  if (game.running && !paused) {
    updatePlayer(); updateEnemies(); updateProjectiles(); game.fx.update(); updateCam(); updateHUD();
  }
  if (game.running) render();
  requestAnimationFrame(loop);
}
function setupSelect() {
  const wrap = document.getElementById("chars");
  wrap.innerHTML = ROSTER.map((c) => '<div class="char-card" data-id="' + c.id + '"><div style="height:48px;background:' + c.color + ';border-radius:8px"></div><h3>' + c.name + '</h3><small>' + c.evoNames.join(" → ") + '</small></div>').join("");
  wrap.querySelectorAll(".char-card").forEach((el) => el.addEventListener("click", () => start(ROSTER.find((r) => r.id === el.dataset.id))));
}
setupSelect();
loop();
