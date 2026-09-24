import test from "node:test";
import assert from "node:assert/strict";
import { makeFoe, isAirFoe, applyElite, ROOM_HARD } from "../engine/foes.js";
import { XP_NEED } from "../systems/xp.js";
import { canonId, packSave, unpackSave } from "../systems/save.js";
import { sense, think } from "../engine/foe-brain.js";
import { resolveBody, hitsSolid } from "../engine/collide.js";

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
