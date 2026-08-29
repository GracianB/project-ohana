import { Player } from "./engine/player.js";
import { World } from "./engine/world.js";
import { EnemyManager } from "./engine/enemies.js";
import { EventBus } from "./engine/events.js";
import { getWorldByDistance } from "./worlds/index.js";
import { CombatSystem } from "./systems/combat.js";
import { CollectibleSystem } from "./systems/collectibles.js";
import { QuestSystem } from "./systems/quests.js";
import { InventorySystem } from "./systems/inventory.js";
import { DialogueSystem } from "./systems/dialogue.js";
import { CameraSystem } from "./systems/camera.js";
import { ParticleSystem } from "./systems/particles.js";
import { AudioSystem } from "./systems/audio.js";

const $ = selector => document.querySelector(selector);

const canvas = $("#game");
const ctx = canvas.getContext("2d", { alpha: false });
const W = canvas.width;
const H = canvas.height;
const SEED = 6262026;

const ui = {
  start: $("#start-screen"),
  pause: $("#pause-screen"),
  boot: $("#boot-screen"),
  message: $("#message"),
  damage: $("#damage-flash"),
  score: $("#score"),
  crystals: $("#crystals"),
  chunks: $("#chunks"),
  energyFill: $("#energy-fill"),
  energyValue: $("#energy-value"),
  world: $("#world-label"),
  fps: $("#fps"),
  state: $("#system-state"),
  questTitle: $("#quest-title"),
  questDescription: $("#quest-description"),
  questFill: $("#quest-fill"),
  questProgress: $("#quest-progress-text"),
  dialogue: $("#dialogue-box"),
  dialogueSpeaker: $("#dialogue-speaker"),
  dialogueText: $("#dialogue-text"),
  minimapPlayer: $("#minimap-player")
};

const events = new EventBus();
const player = new Player();
const enemies = new EnemyManager();

const world = new World({
  seed: SEED,
  chunkWidth: 900,
  events,
  worldResolver: getWorldByDistance
});

const input = { left: false, right: false };

const inventory = new InventorySystem({ events });
const quests = new QuestSystem({ events });
const dialogue = new DialogueSystem({ events });
const particles = new ParticleSystem();
const camera = new CameraSystem({ width: W, height: H });
const audio = new AudioSystem({ events });
const combat = new CombatSystem({ player, enemies, events });
const collectibles = new CollectibleSystem({ world, player, inventory, events });

camera.follow(player);

quests.add({
  id: "first-exploration",
  title: "Primera expedición",
  description: "Recupera 10 cristales de energía para estabilizar la isla.",
  target: 10,
  reward: 1000
});
quests.activate("first-exploration");

let running = false;
let paused = false;
let time = 0;
let lastTime = performance.now();
let cameraX = 0;
let score = 0;
let crystals = 0;
let activeWorldId = null;
let messageTimer = 0;
let hudAccumulator = 0;
let fpsAccumulator = 0;
let fpsFrames = 0;
let fpsValue = 60;

const clouds = Array.from({ length: 20 }, (_, i) => ({
  x: i * 340 + Math.random() * 120,
  y: 60 + Math.random() * 220,
  s: 0.5 + Math.random() * 1.4
}));

world.initialize(6);
spawnEnemiesFromChunks();
setupEvents();
updateWorldTheme(true);
updateHUD(true);

function setupEvents() {
  events.on("world:chunk-generated", ({ chunk }) => {
    for (const enemyConfig of chunk.enemies || []) {
      enemies.add(enemyConfig);
    }
  });

  events.on("collectible:collected", ({ collectible, item }) => {
    crystals++;
    score += 150;
    quests.progress("first-exploration", 1);

    if (collectible) {
      particles.burst(
        collectible.x + (collectible.w || 16) / 2,
        collectible.y + (collectible.h || 16) / 2,
        { count: 16, color: "#6ef4ff", speed: 5, life: 600 }
      );
    }

    showMessage(`✦ ${item?.name?.toUpperCase() || "CRISTAL DE ENERGÍA"} RECUPERADO`);
    updateQuestUI();
  });

  events.on("enemy:defeated", ({ enemy, method }) => {
    score += method === "pulse" ? 200 : 300;

    if (enemy) {
      particles.burst(
        enemy.x + enemy.w / 2,
        enemy.y + enemy.h / 2,
        {
          count: 20,
          color: method === "pulse" ? "#9d7cff" : "#ff8ca0",
          speed: 6,
          life: 650
        }
      );
    }

    if (method === "pulse") {
      showMessage("⚡ PULSO ALIENÍGENA · OBJETIVO ELIMINADO");
    }
  });

  events.on("player:damaged", ({ result }) => {
    flashDamage();
    camera.shakeCamera(260);
    showMessage(result === "respawn"
      ? "◉ SISTEMA REINICIADO · REPOSICIONANDO"
      : "⚠ SISTEMA DAÑADO");
  });

  events.on("dialogue:start", ({ line }) => showDialogue(line));
  events.on("dialogue:line", ({ line }) => showDialogue(line));
  events.on("dialogue:end", hideDialogue);

  events.on("quest:completed", ({ quest }) => {
    score += quest.reward || 0;
    particles.burst(player.x + player.w / 2, player.y, {
      count: 34, color: "#f4d596", speed: 9, life: 900
    });
    showMessage(`★ MISIÓN COMPLETADA · +${quest.reward || 0} PUNTOS`);
    updateQuestUI();
  });
}

function spawnEnemiesFromChunks() {
  for (const chunk of world.chunks.values()) {
    for (const enemyConfig of chunk.enemies || []) {
      enemies.add(enemyConfig);
    }
  }
}

function updateWorldTheme(force = false) {
  const activeWorld = getWorldByDistance(player.x);

  if (force || activeWorld.id !== activeWorldId) {
    activeWorldId = activeWorld.id;
    ui.world.textContent = `${activeWorld.name.toUpperCase()} · ${activeWorld.theme.toUpperCase()}`;
    document.documentElement.style.setProperty("--world-accent", activeWorld.grass || "#58e8f2");

    if (running && !force) {
      showMessage(`◉ NUEVA ZONA DESCUBIERTA · ${activeWorld.name.toUpperCase()}`);
      dialogue.say("NAVEGACIÓN", `Has entrado en ${activeWorld.name}. La generación procedural se ha recalibrado.`);
    }
  }
}

function update(dt) {
  if (!running || paused) return;

  time += dt * 16.67;
  world.ensureAround(player.x, 3);
  updateWorldTheme();

  player.update(input, world.platforms, dt);
  collectibles.update();
  enemies.update(player, dt, events);
  combat.update(dt);
  particles.update(dt);
  camera.update(dt);

  cameraX = camera.x;

  hudAccumulator += dt;
  if (hudAccumulator > 4) {
    updateHUD();
    hudAccumulator = 0;
  }
}

function draw() {
  drawSky();
  drawSun();
  drawClouds();
  drawMountains();
  drawOcean();

  world.drawAtmosphere(ctx, cameraX, time);
  world.drawDecorations(ctx, cameraX);
  world.drawPlatforms(ctx, cameraX);
  world.drawCollectibles(ctx, cameraX, time);

  enemies.draw(ctx, cameraX);
  particles.draw(ctx, cameraX);
  player.draw(ctx, cameraX);

  drawDistanceMarker();
}

function activeWorld() {
  return getWorldByDistance(player.x);
}

function drawSky() {
  const theme = activeWorld();
  const colors = theme.sky || ["#177ac8", "#65cdea", "#d8d58b"];
  const gradient = ctx.createLinearGradient(0, 0, 0, H);

  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(.55, colors[1] || colors[0]);
  gradient.addColorStop(1, colors[2] || colors[1] || colors[0]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function drawSun() {
  const theme = activeWorld();
  if (theme.id === "space" || theme.id === "alien_lab") return;

  ctx.save();
  ctx.globalAlpha = theme.id === "volcano" ? .52 : .82;
  ctx.fillStyle = theme.id === "volcano" ? "#ff9c61" : "#fff0a8";
  ctx.beginPath();
  ctx.arc(W * .77, 115, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawClouds() {
  const theme = activeWorld();
  if (theme.id === "space" || theme.id === "alien_lab") return;

  ctx.fillStyle = theme.id === "volcano"
    ? "rgba(255,180,140,.16)"
    : "rgba(255,255,255,.65)";

  for (const cloud of clouds) {
    const x = cloud.x - cameraX * .15;
    ctx.beginPath();
    ctx.arc(x, cloud.y, 24 * cloud.s, 0, Math.PI * 2);
    ctx.arc(x + 28 * cloud.s, cloud.y - 12 * cloud.s, 34 * cloud.s, 0, Math.PI * 2);
    ctx.arc(x + 65 * cloud.s, cloud.y, 25 * cloud.s, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMountains() {
  const theme = activeWorld();
  const palettes = {
    beach: ["#1f6c76", "#165865", "#124b58"],
    jungle: ["#154b42", "#123f37", "#0d322e"],
    volcano: ["#572d2b", "#422124", "#301a1e"],
    alien_lab: ["#102b43", "#0b2134", "#071726"],
    space: ["#1e1e4a", "#16163d", "#10102c"]
  };
  const colors = palettes[theme.id] || palettes.beach;
  const layers = [
    { speed: .18, color: colors[0], y: 500, size: 230 },
    { speed: .32, color: colors[1], y: 530, size: 190 },
    { speed: .48, color: colors[2], y: 560, size: 150 }
  ];

  for (const layer of layers) {
    const offset = -(cameraX * layer.speed) % layer.size;
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.moveTo(offset - layer.size, layer.y);

    for (let x = offset - layer.size; x < W + layer.size; x += layer.size) {
      ctx.lineTo(x + layer.size / 2, layer.y - layer.size * .55);
      ctx.lineTo(x + layer.size, layer.y);
    }

    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
  }
}

function drawOcean() {
  const theme = activeWorld();
  const ocean = theme.ocean || "#127f9e";

  ctx.fillStyle = ocean;
  ctx.fillRect(0, 490, W, H);

  ctx.strokeStyle = theme.id === "volcano"
    ? "rgba(255,180,110,.18)"
    : "rgba(196,247,255,.28)";
  ctx.lineWidth = 2;

  for (let y = 505; y < H; y += 25) {
    const shift = (time * .03 + y) % 70;
    for (let x = -70 + shift; x < W; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 18, y - 4, x + 38, y);
      ctx.stroke();
    }
  }
}

function drawDistanceMarker() {
  const chunk = Math.floor(player.x / world.chunkWidth);
  const zone = activeWorld();

  ctx.save();
  ctx.fillStyle = "rgba(3,20,28,.58)";
  ctx.fillRect(W - 205, H - 56, 180, 28);

  ctx.fillStyle = "#dffcff";
  ctx.font = "10px monospace";
  ctx.fillText(
    `${zone.name.toUpperCase()} · ${String(chunk).padStart(3, "0")}`,
    W - 192,
    H - 38
  );
  ctx.restore();
}

function updateQuestUI() {
  const quest = quests.getActive();
  if (!quest) return;

  ui.questTitle.textContent = quest.title;
  ui.questDescription.textContent = quest.completed
    ? "Objetivo completado. La expedición continúa."
    : quest.description;

  const percent = Math.round((quest.progress / quest.target) * 100);
  ui.questFill.style.width = `${percent}%`;
  ui.questProgress.textContent = `${quest.progress} / ${quest.target}`;
}

function updateHUD(force = false) {
  ui.score.textContent = String(score).padStart(6, "0");
  ui.crystals.textContent = String(crystals).padStart(2, "0");
  ui.chunks.textContent = String(world.chunks.size).padStart(2, "0");

  const energy = Math.max(0, Math.min(100, Math.round(player.energy)));
  ui.energyFill.style.width = `${energy}%`;
  ui.energyValue.textContent = `${energy}%`;

  if (energy < 25) {
    ui.energyFill.style.background = "linear-gradient(90deg,#ff6a75,#ffb05c)";
  } else {
    ui.energyFill.style.background = "linear-gradient(90deg,var(--cyan),var(--mint))";
  }

  if (force) updateQuestUI();

  const progress = Math.max(2, Math.min(98, (player.x % 4500) / 4500 * 100));
  ui.minimapPlayer.style.left = `${progress}%`;
}

function showMessage(text) {
  ui.message.textContent = text;
  ui.message.classList.add("show");
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => ui.message.classList.remove("show"), 2400);
}

function flashDamage() {
  ui.damage.classList.remove("active");
  void ui.damage.offsetWidth;
  ui.damage.classList.add("active");
}

function jump() {
  if (!running || paused || dialogue.visible) return;
  if (player.jump()) {
    particles.burst(player.x + player.w / 2, player.y + player.h, {
      count: 7, color: "#d8f8ff", speed: 2.8, life: 350
    });
  }
}

function ability() {
  if (!running || paused || dialogue.visible) return;

  const energyBefore = player.energy;
  const defeated = combat.pulse();

  if (energyBefore === player.energy && defeated === 0) {
    showMessage("⚠ ENERGÍA INSUFICIENTE O HABILIDAD RECARGANDO");
    return;
  }

  particles.burst(
    player.x + player.w / 2,
    player.y + player.h / 2,
    { count: 32, color: "#9d7cff", speed: 8, life: 720 }
  );

  camera.shakeCamera(150);
  showMessage(defeated
    ? `✦ PULSO ALIENÍGENA · ${defeated} OBJETIVOS`
    : "✦ PULSO ALIENÍGENA ACTIVADO");
}

function showDialogue(line) {
  if (!line) return;
  ui.dialogueSpeaker.textContent = line.speaker || "SISTEMA";
  ui.dialogueText.textContent = line.text || "";
  ui.dialogue.classList.add("show");
}

function hideDialogue() {
  ui.dialogue.classList.remove("show");
}

function nextDialogue() {
  if (!dialogue.visible) return false;
  return dialogue.next();
}

function startGame() {
  ui.start.classList.add("hidden");
  running = true;
  paused = false;
  audio.unlock();
  dialogue.say("SISTEMA", "Exploración iniciada. El mundo cambia mientras avanzas. No rompas nada importante.");
  showMessage("◉ MUNDO PROCEDURAL ONLINE · EXPLORA");
  ui.state.textContent = "ONLINE";
}

function setPaused(value) {
  if (!running) return;
  paused = value;
  ui.pause.classList.toggle("hidden", !paused);
  ui.state.textContent = paused ? "PAUSA" : "ONLINE";
  if (paused) {
    input.left = false;
    input.right = false;
  }
}

function togglePause() {
  if (dialogue.visible) {
    nextDialogue();
    return;
  }
  setPaused(!paused);
}

function restartMission() {
  window.location.reload();
}

document.addEventListener("keydown", event => {
  const code = event.code;

  if (["ArrowLeft","ArrowRight","ArrowUp","Space"].includes(code)) {
    event.preventDefault();
  }

  if (code === "Escape" && !event.repeat) {
    togglePause();
    return;
  }

  if (code === "Enter" && !event.repeat && dialogue.visible) {
    nextDialogue();
    return;
  }

  if (code === "KeyR" && paused && !event.repeat) {
    restartMission();
    return;
  }

  if (!running || paused || dialogue.visible) return;

  if (code === "ArrowLeft" || code === "KeyA") input.left = true;
  if (code === "ArrowRight" || code === "KeyD") input.right = true;

  if (["Space", "ArrowUp", "KeyW"].includes(code) && !event.repeat) jump();
  if (code === "KeyE" && !event.repeat) ability();
});

document.addEventListener("keyup", event => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") input.left = false;
  if (event.code === "ArrowRight" || event.code === "KeyD") input.right = false;
});

$("#start-button").addEventListener("click", startGame);
$("#pause-button").addEventListener("click", () => setPaused(true));
$("#resume-button").addEventListener("click", () => setPaused(false));
$("#restart-button").addEventListener("click", restartMission);

$("#fullscreen-button").addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  } catch {}
});

ui.dialogue.addEventListener("click", nextDialogue);

document.querySelectorAll("#mobile-controls button").forEach(button => {
  const key = button.dataset.key;

  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);

    if (!running || paused || dialogue.visible) return;
    if (key === "left") input.left = true;
    if (key === "right") input.right = true;
    if (key === "jump") jump();
    if (key === "ability") ability();
  });

  const release = () => {
    if (key === "left") input.left = false;
    if (key === "right") input.right = false;
  };

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && running && !paused) setPaused(true);
});

function loop(timestamp) {
  const rawDelta = Math.min(timestamp - lastTime, 50);
  const dt = Math.max(.25, rawDelta / 16.67);
  lastTime = timestamp;

  update(dt);
  draw();

  fpsAccumulator += rawDelta;
  fpsFrames++;
  if (fpsAccumulator >= 500) {
    fpsValue = Math.round((fpsFrames * 1000) / fpsAccumulator);
    ui.fps.textContent = fpsValue;
    fpsFrames = 0;
    fpsAccumulator = 0;
  }

  requestAnimationFrame(loop);
}

setTimeout(() => ui.boot.classList.add("hide"), 850);
requestAnimationFrame(loop);
