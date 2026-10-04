import test from "node:test";
import assert from "node:assert/strict";
import { makeFoe, isAirFoe, applyElite, ROOM_HARD } from "../engine/foes.js";
import { XP_NEED } from "../systems/xp.js";
import { canonId, packSave, unpackSave } from "../systems/save.js";
import { sense, think } from "../engine/foe-brain.js";
import { signature, markAt } from "../characters/signature.js";
import { computePose } from "../characters/rig.js";
import { ART } from "../characters/art/index.js";
import { ROSTER } from "../characters/roster.js";
import { paintedBody, vfxSprite } from "../characters/sprites.js";
import { resolveBody, hitsSolid } from "../engine/collide.js";
import { audioGraph } from "../engine/audio.js";
import { ParticleSystem } from "../engine/particles.js";
import { foePose } from "../engine/foe-rig.js";

const KINDS = ["phosquito", "mosquito", "libelula", "abeja", "pez", "planta", "medusa", "anguila", "rana", "cangrejo", "gaviota", "murcielago", "arana", "brasita", "escoria", "ufo", "cucaracho", "no-such"];

test("cada kind nace con hitbox y vida", () => {
  for (const kind of KINDS) {
    const e = makeFoe(100, 400, kind, "jungle", 1);
    assert.ok(e.hp > 0, kind);
    assert.ok(e.w > 0 && e.h > 0, kind);
    assert.equal(typeof e.kind, "string");
  }
});

test("hard de sala sube la vida del cucaracho", () => {
  const easy = makeFoe(0, 0, "cucaracho", "hub", 0);
  const hard = makeFoe(0, 0, "cucaracho", "volcano", 0);
  assert.equal(easy.hp, 26);
  assert.ok(hard.hp > easy.hp);
  assert.equal(ROOM_HARD.volcano, 3);
});

test("aire vs suelo", () => {
  assert.equal(isAirFoe(makeFoe(0, 0, "mosquito", "beach", 0)), true);
  assert.equal(isAirFoe(makeFoe(0, 0, "cucaracho", "beach", 0)), false);
});

test("elite no se aplica dos veces", () => {
  const e = applyElite(makeFoe(0, 0, "rana", "lab", 0));
  const hp = e.hp;
  applyElite(e);
  assert.equal(e.hp, hp);
  assert.equal(e.elite, true);
});

test("XP del juego es la curva absoluta", () => {
  assert.deepEqual(XP_NEED, [0, 55, 140, 260, 420]);
  for (let i = 1; i < XP_NEED.length; i++) assert.ok(XP_NEED[i] > XP_NEED[i - 1]);
});

test("cada personaje pega distinto", () => {
  assert.equal(signature("dino").heavy, true);
  assert.equal(signature("dino").ram, true);
  assert.ok(signature("cat").reach < signature("dragon").reach);
  assert.equal(signature("kilo").kind, "leaf");
  assert.equal(signature("chispin").kind, "zap");
  assert.ok(signature("stitcho").dash > signature("dino").dash);
  assert.equal(markAt("kilo", 0).name, markAt("kilo", 4).name);
  assert.equal(markAt("kilo", 0).style, "arc");
  assert.equal(markAt("dino", 2).style, "arc");
  assert.equal(markAt("frita", 4).style, "arc");
  assert.equal(markAt("kilo", 0).dmg, 14);
  assert.equal(markAt("frita", 0).dmg, 20);
  assert.equal(markAt("dino", 0).dmg, 30);
  assert.ok(markAt("dino", 4).dmg > markAt("dino", 0).dmg);
  assert.ok(Math.abs(markAt("dino", 0).reach - markAt("frita", 0).reach) < 8);
});

test("Pikachu heredado conserva el arte canónico de Chispín", () => {
  assert.equal(ART.chispin, ART.pikachu);
  assert.equal(ART.chispin.id, "chispin");
});

test("Lilo heredado conserva el arte canónico de Kilo", () => {
  assert.equal(ART.kilo, ART.lilo);
  assert.equal(ART.kilo.id, "kilo");
});

test("sprites tolera Node y rechaza nombres o poses inexistentes", () => {
  assert.equal(vfxSprite("unknown-vfx"), null);
  assert.equal(vfxSprite("vfx-note"), null);
  assert.equal(paintedBody("cuerno", "idle"), null);
  assert.equal(paintedBody("kilo", "unknown-pose"), null);
});

test("audio y música no fallan cuando Web Audio no existe", async () => {
  assert.equal(audioGraph(), null);
  await import("../engine/music.js");
});

test("Magic.restore limpia efectos previos y limita snapshots corruptos", async () => {
  const originals = { window: globalThis.window, addEventListener: globalThis.addEventListener };
  globalThis.window = globalThis.window || {};
  globalThis.addEventListener = globalThis.addEventListener || (() => {});
  let Magic;
  try {
    ({ Magic } = await import("../systems/magic.js"));
  } finally {
    if (originals.window === undefined) delete globalThis.window;
    else globalThis.window = originals.window;
    if (originals.addEventListener === undefined) delete globalThis.addEventListener;
    else globalThis.addEventListener = originals.addEventListener;
  }

  const player = { id: "kilo", evo: 0, maxJumps: 1, x: 0, y: 0, w: 20, h: 28 };
  const game = { player, enemySlow: 0, enemies: [], orbs: [], t: 0 };
  Magic.update(game);
  Magic.restore({ fx: { feather: 30, hourglass: 30, shell: 99, star: Infinity, fruit: 200 } });
  assert.equal(player.maxJumps, 2);
  assert.equal(game.enemySlow, 2);
  assert.deepEqual(Magic.snapshot().fx, { feather: 30, hourglass: 30, shell: 3 });

  player.evo = 1;
  player.maxJumps = 2;
  Magic.update(game);
  assert.equal(player.maxJumps, 3);

  Magic.restore({ fx: {} });
  assert.equal(player.maxJumps, 2);
  assert.equal(game.enemySlow, 0);
  assert.deepEqual(Magic.snapshot().fx, {});
  Magic.reset(game);
});

test("partículas respetan y restauran el alfa del canvas", () => {
  const particles = new ParticleSystem();
  particles.emit(10, 20, { count: 1, life: 10 });
  const stack = [];
  const drawnAlpha = [];
  const ctx = {
    globalAlpha: 0.4,
    save() { stack.push(this.globalAlpha); },
    restore() { this.globalAlpha = stack.pop(); },
    fillRect() { drawnAlpha.push(this.globalAlpha); },
  };
  particles.render(ctx, { x: 0, y: 0 });
  assert.equal(drawnAlpha.length, 1);
  assert.equal(drawnAlpha[0], 0.4);
  assert.equal(ctx.globalAlpha, 0.4);
});

test("Stitcho empieza con doble salto y conserva su alias de arte", () => {
  const stitcho = ROSTER.find((character) => character.id === "stitcho");
  assert.deepEqual(stitcho.forms.map((form) => form.jumps), [2, 2, 3, 3, 4]);
  assert.equal(ART.stitcho, ART.stitch);
  assert.equal(ART.stitcho.id, "stitcho");
});

test("la animación de ataque sigue la duración real del golpe", () => {
  const p = { melee: 8, grounded: true, vx: 0, vy: 0, speed: 5, evo: 0 };
  assert.equal(computePose(p, 0).atk, 0);
  p.melee = 4;
  assert.equal(computePose(p, 1).atk, 0.5);
  p.melee = 0;
  assert.equal(computePose(p, 2).atk, 0);
});

test("la pose comunica el salvavidas de Michi y limpia su estado", () => {
  const p = { melee: 0, grounded: true, vx: 0, vy: 0, speed: 5, _nineT: 90 };
  assert.equal(computePose(p, 0).nineLives, 90);
  p._nineT = 0;
  assert.equal(computePose(p, 1).nineLives, 0);
});

test("la pose de Cuerno conserva el estado de aterrizaje brillante", () => {
  const p = { melee: 0, grounded: true, vx: 0, vy: -3.4, speed: 5, _move: "punta" };
  assert.equal(computePose(p, 0).move, "punta");
});

test("el rig de enemigos distingue aviso de zambullida activa", () => {
  assert.equal(foePose({ hp: 10, telegraph: true, diving: false }), "telegraph");
  assert.equal(foePose({ hp: 10, telegraph: false, diving: 8 }), "lunge");
});

test("Dino dispara huesos y Stitcho diferencia Caos de Rollo", async () => {
  const originals = Object.fromEntries(["Image", "window", "addEventListener"].map((key) => [key, globalThis[key]]));
  globalThis.Image = class { constructor() { this.complete = false; this.naturalWidth = 0; } };
  globalThis.window = globalThis.window || {};
  globalThis.addEventListener = globalThis.addEventListener || (() => {});
  let useAbility, updateAbilityFx;
  try {
    ({ useAbility, updateAbilityFx } = await import("../systems/abilities.js"));
  } finally {
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }

  const castBite = (evo, facing) => {
    const game = {
      player: { id: "dino", abilities: ["bite"], evo, facing, x: 100, y: 100, w: 32, h: 38, vx: 0 },
      enemies: [], projectiles: [], t: 1,
    };
    useAbility(game, 0);
    return game.projectiles;
  };
  const baby = castBite(0, 1);
  const god = castBite(4, -1);
  assert.equal(baby.length, 1);
  assert.equal(baby[0].shape, "bone");
  assert.ok(baby[0].vx > 0);
  assert.equal(god.length, 3);
  assert.ok(god.every((projectile) => projectile.vx < 0));
  assert.notEqual(god[0].vy, god[2].vy);

  const player = { id: "stitcho", abilities: ["plasma", "rollo", "caos"], evo: 0, facing: 1, x: 100, y: 100, w: 24, h: 24, speed: 4.4 };
  const chaosGame = { player, enemies: [], ghosts: [], projectiles: [], fx: { emit() {} }, t: 1 };
  useAbility(chaosGame, 2);
  updateAbilityFx(chaosGame);
  assert.equal(player._abilMove, "chaos");
});

test("colisión: pisa, no atraviesa el bloque y el disparo muere", () => {
  const body = { x: 40, y: 18, w: 20, h: 20, vx: 0, vy: 8 };
  const thin = [{ x: 0, y: 30, w: 100, h: 16 }];
  const land = resolveBody(body, thin, { prevX: 40, prevY: 0 });
  assert.equal(land.grounded, true);
  assert.equal(body.y, 10);
  const rising = { x: 40, y: 40, w: 20, h: 20, vx: 0, vy: -6 };
  const up = resolveBody(rising, thin, { prevX: 40, prevY: 50 });
  assert.equal(up.grounded, false);
  const walker = { x: 90, y: 10, w: 20, h: 20, vx: 4, vy: 0 };
  const thick = [{ x: 100, y: 0, w: 40, h: 80 }];
  const side = resolveBody(walker, thick, { prevX: 70, prevY: 10 });
  assert.equal(side.hitX, -1);
  assert.equal(walker.x, 80);
  assert.ok(hitsSolid({ x: 110, y: 10, w: 10, h: 10 }, thick));
  assert.equal(hitsSolid({ x: 10, y: 10, w: 10, h: 10 }, thick), null);
});

test("colisión sólida: no atraviesa paredes ni suelos a gran velocidad", () => {
  const wall = { x: 15, y: 0, w: 10, h: 80 };
  const runner = { x: 30, y: 10, w: 10, h: 10, vx: 30, vy: 0 };
  const side = resolveBody(runner, [wall], { prevX: 0, prevY: 10 });
  assert.equal(side.hitX, -1);
  assert.equal(runner.x, 5);

  const floor = { x: 0, y: 30, w: 80, h: 40 };
  const falling = { x: 10, y: 100, w: 10, h: 10, vx: 0, vy: 100 };
  const land = resolveBody(falling, [floor], { prevX: 10, prevY: 0 });
  assert.equal(land.grounded, true);
  assert.equal(falling.y, 20);
});

test("proyectiles rápidos detectan paredes sin falsos positivos diagonales", () => {
  const wall = { x: 30, y: 0, w: 8, h: 80 };
  const previous = { x: 0, y: 20 };
  const projectile = { x: 100, y: 20, w: 6, h: 6 };
  assert.equal(hitsSolid(projectile, [wall], previous), wall);

  const offPath = { x: 0, y: 80, w: 12, h: 10 };
  const diagonalPrevious = { x: 0, y: 0 };
  const diagonalProjectile = { x: 100, y: 100, w: 4, h: 4 };
  assert.equal(hitsSolid(diagonalProjectile, [offPath], diagonalPrevious), null);
});

test("cerebro: patrulla, ataca, se planta y la manada despierta", () => {
  const bug = { x: 0, y: 0, w: 20, h: 20, kind: "cucaracho", aggro: 0 };
  const far = { x: 900, y: 0, w: 20, h: 20 };
  assert.equal(think(bug, sense(bug, far), 0), "patrol");
  const close = { x: 40, y: 0, w: 20, h: 20 };
  assert.equal(think(bug, sense(bug, close), 0), "strike");
  const crab = { x: 0, y: 0, w: 20, h: 20, kind: "cangrejo", aggro: 0 };
  const up = { x: 20, y: -100, w: 20, h: 20 };
  assert.equal(think(crab, sense(crab, up), 0), "hold");
  const fly = { x: 0, y: 0, w: 20, h: 20, kind: "mosquito", aggro: 0 };
  assert.equal(think(fly, sense(fly, far), 1), "hover");
});

test("cerebro respeta un rango de visión explícitamente desactivado", () => {
  const blind = { x: 0, y: 0, w: 20, h: 20, kind: "cucaracho", aggro: 0, sight: 0 };
  const close = { x: 20, y: 0, w: 20, h: 20 };
  const senses = sense(blind, close);
  assert.equal(senses.see, false);
  assert.equal(senses.near, true);
});

test("save canoniza ids viejos y no mezcla personajes", () => {
  assert.equal(canonId("lilo"), "kilo");
  assert.equal(canonId("pikachu"), "chispin");
  assert.equal(canonId("stitch"), "stitcho");
  const game = {
    roomId: "jungle",
    visited: { hub: true, jungle: true },
    score: 12,
    kills: 3,
    won: false,
    player: { evo: 2, id: "kilo", xp: 80, health: 40, _nineUsed: true }
  };
  const raw = packSave(game, { snapshot: () => ({ fx: { shell: 2 } }) });
  assert.equal(raw.v, 2);
  assert.equal(raw.nineUsed, true);
  assert.equal(raw.magic.fx.shell, 2);
  const ok = unpackSave({ ...raw, id: "lilo" }, "kilo");
  assert.equal(ok.evo, 2);
  assert.equal(ok.hp, 40);
  assert.equal(unpackSave(raw, "stitcho"), null);
});

test("save descarta números no finitos y sala mal formada", () => {
  const loaded = unpackSave({
    id: "kilo", roomId: { unexpected: true }, visited: [],
    score: Infinity, kills: NaN, evo: Infinity, xp: -Infinity, hp: Infinity,
  }, "kilo");
  assert.equal(loaded.roomId, "hub");
  assert.deepEqual(loaded.visited, { hub: true });
  assert.equal(loaded.score, 0);
  assert.equal(loaded.kills, 0);
  assert.equal(loaded.evo, 0);
  assert.equal(loaded.xp, 0);
  assert.equal(loaded.hp, 0);
});

test("stopMusic desconecta todo el grafo de delay del tema", async () => {
  const { playMusic, stopMusic } = await import("../engine/music.js");
  const originalWindow = globalThis.window;
  const originalTimeout = globalThis.setTimeout;
  const pendingTimeouts = [];
  const nodes = [];
  const param = (value = 0) => ({
    value,
    setValueAtTime(next) { this.value = next; },
    exponentialRampToValueAtTime(next) { this.value = next; },
    cancelScheduledValues() {},
    setTargetAtTime(next) { this.value = next; },
  });
  const makeNode = (kind, extra = {}) => {
    const node = {
      kind,
      disconnected: false,
      connect() {},
      disconnect() { this.disconnected = true; },
      ...extra,
    };
    nodes.push(node);
    return node;
  };
  class FakeAudioContext {
    constructor() { this.currentTime = 1; this.sampleRate = 10; this.state = "running"; this.destination = {}; }
    createDynamicsCompressor() {
      return makeNode("compressor", { threshold: param(), knee: param(), ratio: param() });
    }
    createGain() { return makeNode("gain", { gain: param() }); }
    createDelay() { return makeNode("delay", { delayTime: param() }); }
    createBuffer(_channels, length) { return { getChannelData: () => new Float32Array(length) }; }
  }

  try {
    globalThis.window = { AudioContext: FakeAudioContext };
    globalThis.setTimeout = (callback) => { pendingTimeouts.push(callback); return 0; };
    playMusic("claro");
    stopMusic();
    for (const callback of pendingTimeouts) callback();
    const themeNodes = nodes.slice(2);
    assert.equal(themeNodes.length, 4);
    assert.ok(themeNodes.every((node) => node.disconnected));
  } finally {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
    globalThis.setTimeout = originalTimeout;
  }
});


test("RNG de enemigos es inyectable y reproducible", () => {
  const alwaysLow = () => 0;
  const alwaysHigh = () => 0.999999;
  const lowA = makeFoe(100, 400, "phosquito", "jungle", 1, { rng: alwaysLow });
  const lowB = makeFoe(100, 400, "phosquito", "jungle", 1, { rng: alwaysLow });
  const high = makeFoe(100, 400, "phosquito", "jungle", 1, { rng: alwaysHigh });
  assert.equal(lowA.canSplit, true);
  assert.deepEqual(lowA, lowB);
  assert.equal(high.canSplit, false);

  const bobA = makeFoe(100, 400, "libelula", "jungle", 1, { rng: alwaysLow });
  const bobB = makeFoe(100, 400, "libelula", "jungle", 1, { rng: alwaysLow });
  assert.equal(bobA.bob, 0);
  assert.equal(bobA.bob, bobB.bob);
});

test("RNG del rig de poses es inyectable y reproducible", async () => {
  const { computePose } = await import("../characters/rig.js");
  const makePlayer = () => ({
    id: "kilo", grounded: true, vx: 0, vy: 0, speed: 4,
    _rig: undefined,
  });
  const a = makePlayer();
  const b = makePlayer();
  const poseA = computePose(a, 1, { rng: () => 0 });
  const poseB = computePose(b, 1, { rng: () => 0 });
  assert.deepEqual(poseA, poseB);
  assert.equal(a._rig.blinkAt, 89);
  assert.equal(b._rig.blinkAt, 89);
});
