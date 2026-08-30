import { ROSTER } from "./characters/roster.js";
import { drawCharacter } from "./characters/draw.js";
import { WORLDS, renderWorld } from "./worlds/index.js";
import { ABILITY_DEFS, useAbility } from "./systems/abilities.js";
import { showNotification } from "./systems/notify.js";
import { ParticleSystem } from "./engine/particles.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const keys = {};
let t = 0;

const game = {
  player: null,
  enemies: [],
  projectiles: [],
  bolts: [],
  platforms: [],
  fx: new ParticleSystem(),
  worldIndex: 0,
  cam: { x: 0, y: 0 },
  worldW: 3200,
  worldH: 900,
  running: false,
  spawn: { x: 180, y: 400 },
};

function fit() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener("resize", fit);
fit();

addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if (!game.running) return;
  if (e.key === "j" || e.key === "J") useAbility(game, 0);
  if (e.key === "k" || e.key === "K") useAbility(game, 1);
  if (e.key === "l" || e.key === "L") useAbility(game, 2);
  if (e.key === "e" || e.key === "E") evolve();
  if (e.key === "r" || e.key === "R") respawn("manual");
  if (e.key >= "1" && e.key <= "5") changeWorld(Number(e.key) - 1);
});
addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });

function makePlayer(def) {
  return {
    ...def,
    x: game.spawn.x,
    y: game.spawn.y,
    vx: 0,
    vy: 0,
    facing: 1,
    jumps: 0,
    grounded: false,
    health: def.health,
    maxHealth: def.health,
    evo: 0,
    dead: false,
    invuln: 0,
    cds: {},
    gliding: 0,
    xp: 0,
  };
}

function buildPlatforms() {
  const g = game.worldH - 80;
  game.platforms = [
    { x: 0, y: g, w: game.worldW, h: 80 },
    { x: 280, y: g - 140, w: 180, h: 18 },
    { x: 620, y: g - 230, w: 160, h: 18 },
    { x: 980, y: g - 160, w: 200, h: 18 },
    { x: 1400, y: g - 260, w: 220, h: 18 },
    { x: 1780, y: g - 180, w: 160, h: 18 },
    { x: 2100, y: g - 300, w: 180, h: 18 },
    { x: 2480, y: g - 200, w: 240, h: 18 },
    { x: 800, y: g - 360, w: 120, h: 18 },
  ];
}

function spawnEnemies() {
  game.enemies = [];
  for (let i = 0; i < 8; i++) {
    game.enemies.push({
      x: 500 + i * 300,
      y: game.worldH - 200,
      w: 28, h: 28,
      vx: (Math.random() > 0.5 ? 1 : -1) * 1.4,
      vy: 0,
      hp: 40 + i * 6,
      max: 40 + i * 6,
      color: ["#6c3", "#c3c", "#fa4", "#4cf"][i % 4],
    });
  }
}

function start(def) {
  game.player = makePlayer(def);
  game.worldIndex = 0;
  buildPlatforms();
  spawnEnemies();
  game.projectiles = [];
  game.running = true;
  document.getElementById("char-select").classList.add("hidden");
  renderAbilityBar();
  showNotification("OHANA", `Has elegido a ${def.name}. J/K/L habilidades · E evoluciona · 1-5 mundos`);
}

function evolve() {
  const p = game.player;
  if (p.evo >= 2) {
    showNotification("MAX", "Ya estás en la forma final.");
    return;
  }
  p.evo++;
  p.maxHealth = Math.round(p.maxHealth * 1.25);
  p.health = p.maxHealth;
  p.speed += 0.6;
  showNotification("EVOLUCIÓN", p.evoNames[p.evo]);
  game.fx.emit(p.x, p.y, { color: p.color, count: 28, size: 5, up: 1.2 });
}

function changeWorld(i) {
  game.worldIndex = i;
  showNotification("MUNDO", WORLDS[i].name);
}

function respawn(reason) {
  const p = game.player;
  p.x = game.spawn.x;
  p.y = game.spawn.y;
  p.vx = 0; p.vy = 0;
  p.health = p.maxHealth;
  p.dead = false;
  if (reason !== "manual") showNotification("REAPARECER", "Nadie se queda atrás.");
}

function checkVoidDeath() {
  const p = game.player;
  if (p.y > game.worldH + 250 && !p.dead) {
    p.dead = true;
    p.health = 0;
    showNotification("💀 HAS CAÍDO AL VACÍO", "Reapareces en 1.2s · R para forzar");
    setTimeout(() => respawn("void"), 1200);
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
  else p.vx *= 0.75;

  if (jump && p.jumps < p.maxJumps && !p._jumpHeld) {
    p.vy = -p.jumpPower;
    p.jumps++;
    p.grounded = false;
    p._jumpHeld = true;
  }
  if (!jump) p._jumpHeld = false;

  if (p.glide && !p.grounded && p.vy > 1 && jump) {
    p.vy = 1.2;
  }
  if (p.gliding > 0) { p.gliding--; p.vy = Math.min(p.vy, 1.4); }

  p.vy += 0.55;
  p.x += p.vx;
  p.y += p.vy;
  p.grounded = false;

  for (const plat of game.platforms) {
    if (p.x + p.w > plat.x && p.x < plat.x + plat.w) {
      if (p.y + p.h > plat.y && p.y + p.h < plat.y + plat.h + 16 && p.vy >= 0) {
        p.y = plat.y - p.h;
        p.vy = 0;
        p.grounded = true;
        p.jumps = 0;
      }
    }
  }
  p.x = Math.max(0, Math.min(p.x, game.worldW - p.w));
  if (p.invuln > 0) p.invuln--;
  checkVoidDeath();
}

function updateEnemies() {
  for (const e of game.enemies) {
    e.vy += 0.5;
    e.x += e.vx;
    e.y += e.vy;
    for (const plat of game.platforms) {
      if (e.x + e.w > plat.x && e.x < plat.x + plat.w) {
        if (e.y + e.h > plat.y && e.y + e.h < plat.y + 22 && e.vy >= 0) {
          e.y = plat.y - e.h;
          e.vy = 0;
        }
      }
    }
    if (e.x < 200 || e.x > game.worldW - 80) e.vx *= -1;
    const p = game.player;
    if (!p.dead && p.invuln <= 0 && aabb(p, e)) {
      p.health -= 8;
      p.invuln = 30;
      p.vx = Math.sign(p.x - e.x) * 6;
      if (p.health <= 0) {
        p.dead = true;
        showNotification("DERROTA", "R para reaparecer");
        setTimeout(() => respawn("combat"), 1000);
      }
    }
  }
  game.enemies = game.enemies.filter((e) => e.hp > 0);
  if (game.enemies.length < 5) {
    game.enemies.push({
      x: 400 + Math.random() * 2400,
      y: 200,
      w: 28, h: 28, vx: Math.random() > 0.5 ? 1.6 : -1.6, vy: 0,
      hp: 50, max: 50, color: "#c66",
    });
  }
}

function updateProjectiles() {
  for (const pr of game.projectiles) {
    if (pr.homing && game.enemies[0]) {
      const e = game.enemies[0];
      pr.vx += Math.sign(e.x - pr.x) * 0.3;
      pr.vy += Math.sign(e.y - pr.y) * 0.3;
    }
    pr.x += pr.vx;
    pr.y += pr.vy;
    pr.life--;
    if (pr.owner === "player") {
      for (const e of game.enemies) {
        if (aabb({ x: pr.x, y: pr.y, w: pr.w, h: pr.h }, e)) {
          e.hp -= pr.dmg;
          pr.life = 0;
          game.fx.emit(e.x, e.y, { color: pr.color, count: 8 });
          game.player.xp += 4;
        }
      }
    }
  }
  game.projectiles = game.projectiles.filter((p) => p.life > 0);
  game.bolts = game.bolts.filter((b) => --b.life > 0);
}

function updateCam() {
  const p = game.player;
  const tx = p.x - canvas.width / 2;
  const ty = p.y - canvas.height / 2;
  game.cam.x += (tx - game.cam.x) * 0.08;
  game.cam.y += (ty - game.cam.y) * 0.08;
  game.cam.x = Math.max(0, Math.min(game.cam.x, game.worldW - canvas.width));
}

function render() {
  const world = WORLDS[game.worldIndex];
  renderWorld(ctx, world, game.cam, t, canvas.width, canvas.height);
  ctx.fillStyle = world.ground;
  for (const plat of game.platforms) {
    ctx.fillRect(plat.x - game.cam.x, plat.y - game.cam.y, plat.w, plat.h);
  }
  for (const e of game.enemies) {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x - game.cam.x, e.y - game.cam.y, e.w, e.h);
    ctx.fillStyle = "#000";
    ctx.fillRect(e.x - game.cam.x, e.y - 8 - game.cam.y, e.w, 4);
    ctx.fillStyle = "#3f3";
    ctx.fillRect(e.x - game.cam.x, e.y - 8 - game.cam.y, e.w * (e.hp / e.max), 4);
  }
  for (const pr of game.projectiles) {
    ctx.fillStyle = pr.color;
    ctx.fillRect(pr.x - game.cam.x, pr.y - game.cam.y, pr.w, pr.h);
  }
  for (const b of game.bolts) {
    ctx.strokeStyle = "#9cf";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(b.x1 - game.cam.x, b.y1 - game.cam.y);
    ctx.lineTo(b.x2 - game.cam.x, b.y2 - game.cam.y);
    ctx.stroke();
  }
  game.fx.render(ctx, game.cam);
  if (game.player) {
    if (game.player.invuln % 4 !== 1) drawCharacter(ctx, game.player, game.cam, t);
  }
}

function renderAbilityBar() {
  const bar = document.getElementById("ability-bar");
  bar.innerHTML = game.player.abilities.map((id) => {
    const d = ABILITY_DEFS[id];
    return `<div class="ability-slot" data-id="${id}"><div class="key">${d.key} · ${d.name}</div><div class="cd"><i></i></div></div>`;
  }).join("");
}

function updateHUD() {
  const p = game.player;
  if (!p) return;
  document.getElementById("hud-name").textContent = p.name;
  document.getElementById("hud-meta").textContent = `HP ${Math.max(0, Math.ceil(p.health))}/${p.maxHealth} · Evo ${p.evo}`;
  document.getElementById("hp-bar").style.width = `${Math.max(0, (p.health / p.maxHealth) * 100)}%`;
  document.getElementById("hud-world").textContent = WORLDS[game.worldIndex].name;
  document.getElementById("hud-evo").textContent = `Forma: ${p.evoNames[p.evo]}`;
  const now = performance.now();
  document.querySelectorAll(".ability-slot").forEach((slot) => {
    const id = slot.dataset.id;
    const def = ABILITY_DEFS[id];
    const left = Math.max(0, (p.cds[id] || 0) - now);
    slot.querySelector("i").style.width = `${100 - (left / def.cd) * 100}%`;
  });
}

function loop() {
  t++;
  if (game.running) {
    updatePlayer();
    updateEnemies();
    updateProjectiles();
    game.fx.update();
    updateCam();
    updateHUD();
  }
  if (game.running) render();
  requestAnimationFrame(loop);
}

function setupSelect() {
  const wrap = document.getElementById("chars");
  wrap.innerHTML = ROSTER.map((c) => `
    <div class="char-card" data-id="${c.id}">
      <div style="height:48px;background:${c.color};border-radius:8px"></div>
      <h3>${c.name}</h3>
      <small>SPD ${c.speed} · HP ${c.health} · saltos ${c.maxJumps}</small>
    </div>
  `).join("");
  wrap.querySelectorAll(".char-card").forEach((el) => {
    el.addEventListener("click", () => {
      const def = ROSTER.find((r) => r.id === el.dataset.id);
      start(def);
    });
  });
}

setupSelect();
loop();
