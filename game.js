import { ROSTER, applyForm } from "./characters/roster.js";
import { drawCharacter } from "./characters/draw.js";
import { WORLDS, renderWorld } from "./worlds/index.js";
import { ABILITY_DEFS, useAbility } from "./systems/abilities.js";
import { showNotification } from "./systems/notify.js";
import { ParticleSystem } from "./engine/particles.js";
import { sfx } from "./engine/audio.js";
import { ROOMS, ROOM_W, ROOM_H } from "./systems/map.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const keys = {};
let t = 0;
const XP_NEED = [0, 40, 100];

const game = {
  player: null, enemies: [], projectiles: [], bolts: [], platforms: [], orbs: [],
  fx: new ParticleSystem(), worldIndex: 0, cam: { x: 0, y: 0 },
  worldW: ROOM_W, worldH: ROOM_H, running: false, spawn: { x: 180, y: 500 },
  shake: 0, combo: 0, comboT: 0, score: 0, roomId: "hub", visited: { hub: true }, fading: 0
};

function fit() { canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", fit); fit();
addEventListener("pointerdown", () => { try { sfx("orb"); } catch (e) {} }, { once: true });

addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) e.preventDefault();
  if (!game.running) return;
  if (e.key === "j" || e.key === "J") useAbility(game, 0);
  if (e.key === "k" || e.key === "K") useAbility(game, 1);
  if (e.key === "l" || e.key === "L") useAbility(game, 2);
  if (e.key === "e" || e.key === "E") evolve("manual");
  if (e.key === "r" || e.key === "R") respawn("manual");
  if (e.key === "m" || e.key === "M") showMap();
});
addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });

function room() { return ROOMS[game.roomId]; }

function loadRoom(id, fromDir) {
  const r = ROOMS[id];
  if (!r) return;
  if (r.needEvo && game.player && game.player.evo < r.needEvo) {
    showNotification("CERRADO", "Necesitas forma " + (r.needEvo + 1));
    sfx("hurt");
    if (fromDir === "right") game.player.x = game.worldW - game.player.w - 30;
    if (fromDir === "left") game.player.x = 30;
    if (fromDir === "up") game.player.y = 80;
    if (fromDir === "down") game.player.y = game.worldH - 200;
    return;
  }
  game.roomId = id;
  game.visited[id] = true;
  game.worldIndex = r.world;
  game.worldW = ROOM_W; game.worldH = ROOM_H;
  game.platforms = r.plats.map((p) => ({ x: p[0], y: p[1], w: p[2], h: p[3] }));
  game.orbs = (r.orbs || []).map((o) => ({ x: o[0], y: o[1], r: 9, taken: false }));
  game.enemies = (r.foes || []).map((f, i) => ({
    x: f[0], y: f[1], w: 30, h: 30, vx: i % 2 ? 1.6 : -1.6, vy: 0,
    hp: 50 + i * 10, max: 50 + i * 10, kind: ["slime", "bat", "bot"][i % 3],
    color: ["#6c3", "#c3c", "#fa4"][i % 3], boss: false
  }));
  if (r.boss) {
    game.enemies.push({ x: 900, y: 400, w: 74, h: 74, vx: 2, vy: 0, hp: 420, max: 420, kind: "boss", color: "#f36", boss: true });
    showNotification("JEFE", r.name);
  }
  if (fromDir === "right") game.player.x = 40;
  if (fromDir === "left") game.player.x = ROOM_W - 80;
  if (fromDir === "up") game.player.y = ROOM_H - 200;
  if (fromDir === "down") game.player.y = 80;
  game.player.vx = 0; game.player.vy = 0;
  game.cam.x = 0; game.fading = 12;
  showNotification("SALA", r.name);
}

function showMap() {
  const names = Object.keys(game.visited).map((id) => ROOMS[id].name).join(" · ");
  showNotification("MAPA", names || "Claro Ohana");
}

function makePlayer(def) {
  const p = { ...def, x: game.spawn.x, y: game.spawn.y, vx: 0, vy: 0, facing: 1, jumps: 0, grounded: false, evo: 0, dead: false, invuln: 0, cds: {}, gliding: 0, xp: 0, coyote: 0, buffer: 0 };
  applyForm(p); return p;
}

function start(def) {
  game.player = makePlayer(def);
  game.combo = 0; game.score = 0; game.shake = 0; game.visited = { hub: true };
  game.projectiles = []; game.bolts = []; game.running = true;
  document.getElementById("char-select").classList.add("hidden");
  renderAbilityBar();
  loadRoom("hub");
}

function evolve(reason) {
  const p = game.player;
  if (!p || p.dead) return;
  if (p.evo >= 2) { if (reason === "manual") showNotification("MAX", "Forma final."); return; }
  if (reason !== "manual" && p.xp < XP_NEED[p.evo + 1]) return;
  p.evo++; applyForm(p); game.shake = 12; sfx("evo");
  showNotification("EVOLUCION Lv" + (p.evo + 1), p.name);
  game.fx.emit(p.x + p.w / 2, p.y, { color: p.color, count: 48, size: 6, up: 2 });
}

function respawn(reason) {
  const p = game.player; if (!p) return;
  p.x = 180; p.y = 500; p.vx = 0; p.vy = 0; p.health = p.maxHealth; p.dead = false; p.invuln = 40; game.combo = 0;
  loadRoom("hub");
  if (reason !== "manual") showNotification("REAPARECER", "De vuelta al claro.");
}

function checkVoidDeath() {
  const p = game.player;
  if (p.y > game.worldH + 80 && !p.dead) {
    p.dead = true; p.health = 0; game.shake = 14; sfx("hurt");
    showNotification("VACIO", "Reapareces en el claro");
    setTimeout(() => { if (game.player && game.player.dead) respawn("void"); }, 900);
  }
}

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function punch(x, y, color) {
  game.shake = Math.min(18, game.shake + 6); game.combo += 1; game.comboT = 90; game.score += 10 * game.combo;
  game.fx.emit(x, y, { color, count: 14, size: 4, up: 1.2 }); sfx("hit");
}

function tryDoors() {
  const p = game.player; const r = room();
  if (p.x > ROOM_W - 20 && r.doors.right) loadRoom(r.doors.right, "right");
  else if (p.x < -10 && r.doors.left) loadRoom(r.doors.left, "left");
  else if (p.y < -20 && r.doors.up) loadRoom(r.doors.up, "up");
  else if (p.y > ROOM_H - 40 && r.doors.down) loadRoom(r.doors.down, "down");
  if (p.x > ROOM_W - 20 && !r.doors.right) p.x = ROOM_W - p.w;
  if (p.x < -10 && !r.doors.left) p.x = 0;
}

function updatePlayer() {
  const p = game.player; if (p.dead) return;
  const left = keys["a"] || keys["arrowleft"];
  const right = keys["d"] || keys["arrowright"];
  const jump = keys["w"] || keys["arrowup"] || keys[" "];
  if (left) { p.vx = -p.speed; p.facing = -1; }
  else if (right) { p.vx = p.speed; p.facing = 1; }
  else p.vx *= 0.78;
  if (jump) p.buffer = 8; else if (p.buffer > 0) p.buffer--;
  const canJump = p.jumps < p.maxJumps || p.coyote > 0;
  if (p.buffer > 0 && canJump && !p._jumpHeld) {
    p.vy = -p.jumpPower; p.jumps = p.coyote > 0 ? 1 : p.jumps + 1;
    p.grounded = false; p.coyote = 0; p.buffer = 0; p._jumpHeld = true; sfx("jump");
  }
  if (!jump) p._jumpHeld = false;
  if (p.glide && !p.grounded && p.vy > 1 && jump) p.vy = 1.15;
  if (p.gliding > 0) { p.gliding--; p.vy = Math.min(p.vy, 1.3); }
  p.vy += 0.58; p.x += p.vx; p.y += p.vy; p.grounded = false;
  for (const plat of game.platforms) {
    if (p.x + p.w > plat.x + 2 && p.x < plat.x + plat.w - 2) {
      if (p.y + p.h > plat.y && p.y + p.h < plat.y + 22 && p.vy >= 0) {
        p.y = plat.y - p.h; p.vy = 0; p.grounded = true; p.jumps = 0; p.coyote = 8;
      }
    }
  }
  if (!p.grounded && p.coyote > 0) p.coyote--;
  if (p.invuln > 0) p.invuln--;
  for (const o of game.orbs) {
    if (!o.taken && Math.hypot(p.x + p.w / 2 - o.x, p.y + p.h / 2 - o.y) < 28) {
      o.taken = true; p.xp += 8; game.score += 25; sfx("orb");
    }
  }
  tryDoors(); checkVoidDeath();
  if (p.evo < 2 && p.xp >= XP_NEED[p.evo + 1]) evolve("xp");
}

function updateEnemies() {
  for (const e of game.enemies) {
    e.vy += 0.5; e.x += e.vx; e.y += e.vy;
    if (e.boss) e.vx += Math.sign((game.player.x - e.x) || 1) * 0.06;
    for (const plat of game.platforms) {
      if (e.x + e.w > plat.x && e.x < plat.x + plat.w) {
        if (e.y + e.h > plat.y && e.y + e.h < plat.y + 28 && e.vy >= 0) { e.y = plat.y - e.h; e.vy = 0; }
      }
    }
    if (e.y > game.worldH) e.hp = 0;
    const on = game.platforms.find((plat) => e.x + e.w > plat.x && e.x < plat.x + plat.w && Math.abs(e.y + e.h - plat.y) < 4);
    if (on && !e.boss && (e.x < on.x || e.x + e.w > on.x + on.w)) e.vx *= -1;
    const p = game.player;
    if (!p.dead && p.invuln <= 0 && aabb(p, e)) {
      p.health -= e.boss ? 16 : 8; p.invuln = 28; p.vx = Math.sign(p.x - e.x || 1) * 8; p.vy = -5; game.shake = 10; game.combo = 0; sfx("hurt");
      if (p.health <= 0) { p.dead = true; showNotification("DERROTA", "R al claro"); setTimeout(() => { if (game.player && game.player.dead) respawn("combat"); }, 900); }
    }
  }
  game.enemies = game.enemies.filter((e) => {
    if (e.hp > 0) return true;
    punch(e.x, e.y, e.color);
    if (e.boss) { sfx("win"); showNotification("VICTORIA", "Score " + game.score); }
    return false;
  });
}

function updateProjectiles() {
  for (const pr of game.projectiles) {
    if (pr.homing && game.enemies[0]) {
      pr.vx += Math.sign(game.enemies[0].x - pr.x) * 0.35;
      pr.vy += Math.sign(game.enemies[0].y - pr.y) * 0.35;
    }
    pr.x += pr.vx; pr.y += pr.vy; pr.life--;
    if (pr.owner === "player") {
      for (const e of game.enemies) {
        if (aabb({ x: pr.x, y: pr.y, w: pr.w, h: pr.h }, e)) {
          e.hp -= pr.dmg * (1 + game.player.evo * 0.35); pr.life = 0; punch(e.x, e.y, pr.color); game.player.xp += 6;
        }
      }
    }
  }
  game.projectiles = game.projectiles.filter((pr) => pr.life > 0);
  game.bolts = game.bolts.filter((b) => --b.life > 0);
}

function updateCam() {
  const p = game.player;
  game.cam.x += (p.x - canvas.width / 2 - game.cam.x) * 0.12;
  game.cam.y += (p.y - canvas.height * 0.58 - game.cam.y) * 0.12;
  game.cam.x = Math.max(0, Math.min(game.cam.x, Math.max(0, game.worldW - canvas.width)));
  if (game.shake > 0) game.shake *= 0.86;
  if (game.comboT > 0) game.comboT--; else game.combo = 0;
  if (game.fading > 0) game.fading--;
}

function drawEnemy(e) {
  const x = e.x - game.cam.x, y = e.y - game.cam.y;
  ctx.fillStyle = e.color;
  if (e.kind === "boss") { ctx.beginPath(); ctx.ellipse(x + e.w / 2, y + e.h / 2, e.w / 2, e.h / 2.2, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (e.kind === "bat") { ctx.beginPath(); ctx.ellipse(x + 15, y + 16, 14, 8, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (e.kind === "bot") ctx.fillRect(x + 4, y + 4, 22, 22);
  else { ctx.beginPath(); ctx.ellipse(x + 15, y + 20, 15, 12, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#000"; ctx.fillRect(x, y - 10, e.w, 5);
  ctx.fillStyle = e.boss ? "#f55" : "#3f3"; ctx.fillRect(x, y - 10, e.w * (e.hp / e.max), 5);
}

function drawMinimap() {
  const cells = [
    [1, 0, "ridge"], [2, 0, "space"],
    [0, 1, "lab"], [1, 1, "cave"], [2, 1, "hub"], [3, 1, "beach"], [4, 1, "jungle"],
    [4, 2, "volcano"], [5, 2, "boss"]
  ];
  const ox = canvas.width - 196, oy = canvas.height - 118;
  ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(ox - 8, oy - 8, 188, 104);
  for (const [cx, cy, id] of cells) {
    const x = ox + cx * 28, y = oy + cy * 28;
    ctx.fillStyle = game.roomId === id ? "#7ee7ff" : game.visited[id] ? "#3a6" : "#222";
    ctx.fillRect(x, y, 22, 22);
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
  ctx.fillStyle = "rgba(126,231,255,.55)";
  if (r.doors.right) ctx.fillRect(ROOM_W - 18 - game.cam.x, 360 - game.cam.y, 14, 80);
  if (r.doors.left) ctx.fillRect(4 - game.cam.x, 360 - game.cam.y, 14, 80);
  if (r.doors.up) ctx.fillRect(760 - game.cam.x, 8 - game.cam.y, 80, 12);
  if (r.doors.down) ctx.fillRect(760 - game.cam.x, ROOM_H - 20 - game.cam.y, 80, 12);
  for (const o of game.orbs) {
    if (o.taken) continue;
    ctx.fillStyle = "#ffe66a"; ctx.shadowColor = "#ffe66a"; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(o.x - game.cam.x, o.y - game.cam.y + Math.sin(t / 12) * 4, 9, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  }
  for (const e of game.enemies) drawEnemy(e);
  for (const pr of game.projectiles) {
    ctx.fillStyle = pr.color; ctx.shadowBlur = 12; ctx.shadowColor = pr.color;
    ctx.fillRect(pr.x - game.cam.x, pr.y - game.cam.y, pr.w, pr.h); ctx.shadowBlur = 0;
  }
  game.fx.render(ctx, game.cam);
  if (game.player && game.player.invuln % 4 !== 1) drawCharacter(ctx, game.player, game.cam, t);
  ctx.restore();
  const vg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.3, canvas.width / 2, canvas.height / 2, canvas.width * 0.72);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (game.fading > 0) { ctx.fillStyle = "rgba(0,0,0," + (game.fading / 12) + ")"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  if (game.combo > 1) { ctx.fillStyle = "#fff"; ctx.font = "800 40px Outfit,sans-serif"; ctx.textAlign = "center"; ctx.fillText(game.combo + " COMBO", canvas.width / 2, 88); }
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
  document.getElementById("hud-meta").textContent = "HP " + Math.max(0, Math.ceil(p.health)) + "/" + p.maxHealth + " · Lv" + (p.evo + 1) + " · XP " + p.xp + (p.evo < 2 ? "/" + need : "");
  document.getElementById("hp-bar").style.width = Math.max(0, (p.health / p.maxHealth) * 100) + "%";
  document.getElementById("hud-world").textContent = room().name;
  document.getElementById("hud-evo").textContent = "Forma " + (p.evo + 1) + "/3 · M mapa";
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
  if (game.running) {
    updatePlayer(); updateEnemies(); updateProjectiles(); game.fx.update(); updateCam(); updateHUD(); render();
  }
  requestAnimationFrame(loop);
}
function setupSelect() {
  const wrap = document.getElementById("chars");
  wrap.innerHTML = ROSTER.map((c) => '<div class="char-card" data-id="' + c.id + '"><div style="height:48px;background:' + c.color + ';border-radius:8px"></div><h3>' + c.name + '</h3><small>' + c.evoNames.join(" → ") + '</small></div>').join("");
  wrap.querySelectorAll(".char-card").forEach((el) => el.addEventListener("click", () => start(ROSTER.find((r) => r.id === el.dataset.id))));
}
setupSelect();
loop();
