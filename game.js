import { ROSTER, applyForm } from "./characters/roster.js";
import { drawCharacter } from "./characters/draw.js";
import { WORLDS, renderWorld } from "./worlds/index.js";
import { ABILITY_DEFS, useAbility } from "./systems/abilities.js";
import { showNotification } from "./systems/notify.js";
import { ParticleSystem } from "./engine/particles.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const keys = {};
let t = 0;
const XP_NEED = [0, 40, 100];

const game = {
  player: null, enemies: [], projectiles: [], bolts: [], platforms: [],
  fx: new ParticleSystem(), worldIndex: 0, cam: { x: 0, y: 0 },
  worldW: 3600, worldH: 900, running: false, spawn: { x: 160, y: 420 }
};

function fit() { canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", fit); fit();

addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) e.preventDefault();
  if (!game.running) return;
  if (e.key === "j" || e.key === "J") useAbility(game, 0);
  if (e.key === "k" || e.key === "K") useAbility(game, 1);
  if (e.key === "l" || e.key === "L") useAbility(game, 2);
  if (e.key === "e" || e.key === "E") evolve("manual");
  if (e.key === "r" || e.key === "R") respawn("manual");
  if (e.key >= "1" && e.key <= "5") changeWorld(Number(e.key) - 1);
});
addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });

function makePlayer(def) {
  const p = { ...def, x: game.spawn.x, y: game.spawn.y, vx: 0, vy: 0, facing: 1, jumps: 0, grounded: false, evo: 0, dead: false, invuln: 0, cds: {}, gliding: 0, xp: 0 };
  applyForm(p);
  return p;
}

function buildPlatforms() {
  const g = game.worldH - 90;
  game.platforms = [
    { x: 0, y: g, w: 380, h: 90 }, { x: 520, y: g, w: 260, h: 90 }, { x: 920, y: g, w: 300, h: 90 },
    { x: 1360, y: g, w: 220, h: 90 }, { x: 1760, y: g, w: 340, h: 90 }, { x: 2260, y: g, w: 280, h: 90 },
    { x: 2720, y: g, w: 260, h: 90 }, { x: 3160, y: g, w: 440, h: 90 },
    { x: 240, y: g - 150, w: 160, h: 18 }, { x: 620, y: g - 240, w: 150, h: 18 },
    { x: 980, y: g - 170, w: 180, h: 18 }, { x: 1280, y: g - 300, w: 140, h: 18 },
    { x: 1580, y: g - 210, w: 170, h: 18 }, { x: 1980, y: g - 320, w: 160, h: 18 },
    { x: 2360, y: g - 190, w: 180, h: 18 }, { x: 2780, y: g - 280, w: 150, h: 18 }
  ];
}

function spawnEnemies() {
  game.enemies = [];
  [560, 980, 1400, 1860, 2320, 2780, 3220].forEach((x, i) => {
    game.enemies.push({ x, y: 200, w: 30, h: 30, vx: (i % 2 ? 1 : -1) * 1.5, vy: 0, hp: 42 + i * 8, max: 42 + i * 8, kind: ["slime", "bat", "bot"][i % 3], color: ["#6c3", "#c3c", "#fa4"][i % 3] });
  });
}

function start(def) {
  game.player = makePlayer(def);
  game.worldIndex = 0;
  buildPlatforms(); spawnEnemies();
  game.projectiles = []; game.bolts = []; game.running = true;
  document.getElementById("char-select").classList.add("hidden");
  renderAbilityBar();
  showNotification("OHANA", def.evoNames[0] + " listo. E o XP para evolucionar");
}

function evolve(reason) {
  const p = game.player;
  if (!p || p.dead) return;
  if (p.evo >= 2) {
    if (reason === "manual") showNotification("MAX", "Forma final alcanzada.");
    return;
  }
  if (reason !== "manual" && p.xp < XP_NEED[p.evo + 1]) return;
  p.evo++;
  applyForm(p);
  showNotification("EVOLUCION Lv" + (p.evo + 1), p.name);
  game.fx.emit(p.x + p.w / 2, p.y, { color: p.color, count: 40, size: 6, up: 1.6 });
}

function changeWorld(i) {
  if (!WORLDS[i]) return;
  game.worldIndex = i;
  buildPlatforms(); spawnEnemies();
  if (game.player && !game.player.dead) {
    game.player.x = game.spawn.x; game.player.y = game.spawn.y; game.player.vx = 0; game.player.vy = 0;
  }
  showNotification("MUNDO", WORLDS[i].name);
}

function respawn(reason) {
  const p = game.player;
  if (!p) return;
  p.x = game.spawn.x; p.y = game.spawn.y; p.vx = 0; p.vy = 0;
  p.health = p.maxHealth; p.dead = false; p.invuln = 40;
  if (reason !== "manual") showNotification("REAPARECER", "Ohana: nadie se queda atras.");
}

function checkVoidDeath() {
  const p = game.player;
  if (p.y > game.worldH + 80 && !p.dead) {
    p.dead = true; p.health = 0;
    showNotification("HAS CAIDO AL VACIO", "Reapareces en 1.2s · R para forzar");
    setTimeout(() => { if (game.player && game.player.dead) respawn("void"); }, 1200);
  }
}

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function updatePlayer() {
  const p = game.player;
  if (p.dead) return;
  const left = keys["a"] || keys["arrowleft"];
  const right = keys["d"] || keys["arrowright"];
  const jump = keys["w"] || keys["arrowup"] || keys[" "];
  if (left) { p.vx = -p.speed; p.facing = -1; }
  else if (right) { p.vx = p.speed; p.facing = 1; }
  else p.vx *= 0.78;
  if (jump && p.jumps < p.maxJumps && !p._jumpHeld) { p.vy = -p.jumpPower; p.jumps++; p.grounded = false; p._jumpHeld = true; }
  if (!jump) p._jumpHeld = false;
  if (p.glide && !p.grounded && p.vy > 1 && jump) p.vy = 1.15;
  if (p.gliding > 0) { p.gliding--; p.vy = Math.min(p.vy, 1.3); }
  p.vy += 0.58; p.x += p.vx; p.y += p.vy; p.grounded = false;
  for (const plat of game.platforms) {
    if (p.x + p.w > plat.x + 2 && p.x < plat.x + plat.w - 2) {
      if (p.y + p.h > plat.y && p.y + p.h < plat.y + 22 && p.vy >= 0) {
        p.y = plat.y - p.h; p.vy = 0; p.grounded = true; p.jumps = 0;
      }
    }
  }
  p.x = Math.max(-20, Math.min(p.x, game.worldW - p.w + 20));
  if (p.invuln > 0) p.invuln--;
  checkVoidDeath();
  if (p.evo < 2 && p.xp >= XP_NEED[p.evo + 1]) evolve("xp");
}

function updateEnemies() {
  for (const e of game.enemies) {
    e.vy += 0.5; e.x += e.vx; e.y += e.vy;
    for (const plat of game.platforms) {
      if (e.x + e.w > plat.x && e.x < plat.x + plat.w) {
        if (e.y + e.h > plat.y && e.y + e.h < plat.y + 24 && e.vy >= 0) { e.y = plat.y - e.h; e.vy = 0; }
      }
    }
    if (e.y > game.worldH) e.hp = 0;
    const on = game.platforms.find((plat) => e.x + e.w > plat.x && e.x < plat.x + plat.w && Math.abs(e.y + e.h - plat.y) < 3);
    if (on && (e.x < on.x || e.x + e.w > on.x + on.w)) e.vx *= -1;
    const p = game.player;
    if (!p.dead && p.invuln <= 0 && aabb(p, e)) {
      p.health -= 8; p.invuln = 28; p.vx = Math.sign(p.x - e.x || 1) * 7; p.vy = -4;
      if (p.health <= 0) {
        p.dead = true;
        showNotification("DERROTA", "R para reaparecer");
        setTimeout(() => { if (game.player && game.player.dead) respawn("combat"); }, 1000);
      }
    }
  }
  game.enemies = game.enemies.filter((e) => e.hp > 0);
  if (game.enemies.length < 4) {
    game.enemies.push({ x: 600 + Math.random() * 2400, y: 120, w: 30, h: 30, vx: Math.random() > 0.5 ? 1.6 : -1.6, vy: 0, hp: 48, max: 48, kind: "slime", color: "#c66" });
  }
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
          e.hp -= pr.dmg * (1 + game.player.evo * 0.35);
          pr.life = 0;
          game.fx.emit(e.x, e.y, { color: pr.color, count: 8 });
          game.player.xp += 6;
        }
      }
    }
  }
  game.projectiles = game.projectiles.filter((pr) => pr.life > 0);
  game.bolts = game.bolts.filter((b) => --b.life > 0);
}

function updateCam() {
  const p = game.player;
  game.cam.x += (p.x - canvas.width / 2 - game.cam.x) * 0.1;
  game.cam.y += (p.y - canvas.height * 0.58 - game.cam.y) * 0.1;
  game.cam.x = Math.max(0, Math.min(game.cam.x, Math.max(0, game.worldW - canvas.width)));
}

function drawEnemy(e) {
  const x = e.x - game.cam.x, y = e.y - game.cam.y;
  ctx.fillStyle = e.color;
  if (e.kind === "bat") { ctx.beginPath(); ctx.ellipse(x + 15, y + 16, 14, 8, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (e.kind === "bot") ctx.fillRect(x + 4, y + 4, 22, 22);
  else { ctx.beginPath(); ctx.ellipse(x + 15, y + 20, 15, 12, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#000"; ctx.fillRect(x, y - 8, e.w, 4);
  ctx.fillStyle = "#3f3"; ctx.fillRect(x, y - 8, e.w * (e.hp / e.max), 4);
}

function render() {
  const world = WORLDS[game.worldIndex];
  renderWorld(ctx, world, game.cam, t, canvas.width, canvas.height);
  for (const plat of game.platforms) {
    ctx.fillStyle = world.ground;
    ctx.fillRect(plat.x - game.cam.x, plat.y - game.cam.y, plat.w, plat.h);
    ctx.fillStyle = world.groundTop || "#ffffff88";
    ctx.fillRect(plat.x - game.cam.x, plat.y - game.cam.y, plat.w, 8);
  }
  for (const e of game.enemies) drawEnemy(e);
  for (const pr of game.projectiles) {
    ctx.fillStyle = pr.color;
    ctx.fillRect(pr.x - game.cam.x, pr.y - game.cam.y, pr.w, pr.h);
  }
  for (const b of game.bolts) {
    ctx.strokeStyle = "#cfff6a"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(b.x1 - game.cam.x, b.y1 - game.cam.y); ctx.lineTo(b.x2 - game.cam.x, b.y2 - game.cam.y); ctx.stroke();
  }
  game.fx.emit && game.fx.render(ctx, game.cam);
  if (game.player && game.player.invuln % 4 !== 1) drawCharacter(ctx, game.player, game.cam, t);
}

function renderAbilityBar() {
  const bar = document.getElementById("ability-bar");
  bar.innerHTML = game.player.abilities.map((id) => {
    const d = ABILITY_DEFS[id];
    return '<div class="ability-slot" data-id="' + id + '"><div class="key">' + d.key + " · " + d.name + '</div><div class="cd"><i></i></div></div>';
  }).join("");
}

function updateHUD() {
  const p = game.player;
  if (!p) return;
  document.getElementById("hud-name").textContent = p.name;
  const need = p.evo >= 2 ? p.xp : XP_NEED[p.evo + 1];
  document.getElementById("hud-meta").textContent = "HP " + Math.max(0, Math.ceil(p.health)) + "/" + p.maxHealth + " · Lv" + (p.evo + 1) + " · XP " + p.xp + (p.evo < 2 ? "/" + need : "");
  document.getElementById("hp-bar").style.width = Math.max(0, (p.health / p.maxHealth) * 100) + "%";
  document.getElementById("hud-world").textContent = WORLDS[game.worldIndex].name;
  document.getElementById("hud-evo").textContent = "Forma " + (p.evo + 1) + "/3: " + p.evoNames[p.evo];
  const now = performance.now();
  document.querySelectorAll(".ability-slot").forEach((slot) => {
    const id = slot.dataset.id;
    const def = ABILITY_DEFS[id];
    const left = Math.max(0, (p.cds[id] || 0) - now);
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
  wrap.querySelectorAll(".char-card").forEach((el) => {
    el.addEventListener("click", () => start(ROSTER.find((r) => r.id === el.dataset.id)));
  });
}

setupSelect();
loop();
