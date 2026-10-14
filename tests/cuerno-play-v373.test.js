import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { updateCuernoPlay, drawCuernoPlay, queueCuernoPlay, startCuernoDuo, resetCuernoPlay, readCuernoPlay, CUERNO_PLAY_KEYS, CUERNO_PLAY_DUR } from "../systems/cuerno-play-v373.js";
import { createCuernoFx } from "../systems/cuerno-fx.js";
const ctx = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : () => ({ width: 10 })), set: (o, k, v) => ((o[k] = v), true) });
const game = (id = "cuerno") => ({ player: { id, x: 100, y: 200, w: 30, h: 40, evo: 2, facing: 1, vx: 0, vy: 0, grounded: true, hp: 100 }, cam: { x: 0, y: 0 }, cuernoFx: createCuernoFx(), enemies: [{ hp: 50 }] });
test("cuerno-play: teclas no chocan con J/K/L/F/M/U/G", () => {
  for (const k of Object.values(CUERNO_PLAY_KEYS)) assert.ok(!"jklfmug".includes(k));
});
test("cuerno-play: 3 emotes con fx de Cuerno, sin tocar HP ni daño, y en pausa no arrancan", () => {
  for (const kind of ["nuzzle", "dream", "neigh"]) {
    resetCuernoPlay(); const g = game();
    g.paused = true; queueCuernoPlay(kind); updateCuernoPlay(g, 0); assert.equal(readCuernoPlay().act, null);
    g.paused = false; queueCuernoPlay(kind); updateCuernoPlay(g, 1); assert.equal(readCuernoPlay().act, kind);
    for (let i = 0; i < 40; i++) { updateCuernoPlay(g, i); drawCuernoPlay(ctx(), g, i); }
    assert.ok(g.cuernoFx.list.length > 0); assert.equal(g.player.hp, 100); assert.equal(g.enemies[0].hp, 50);
  }
});
test("cuerno-play: dúo con aviso previo, cooldown y compañero Kilo; otro personaje no lo lanza", () => {
  resetCuernoPlay(); const g = game(); let drawn = null;
  assert.equal(startCuernoDuo(g), true); assert.equal(readCuernoPlay().duo.phase, "wind");
  assert.equal(startCuernoDuo(g), false);
  for (let i = 0; i < CUERNO_PLAY_DUR.duoWind; i++) updateCuernoPlay(g, i);
  assert.equal(readCuernoPlay().duo.phase, "run");
  drawCuernoPlay(ctx(), g, 30, (c, a) => { drawn = a.id; }, [{ id: "kilo", forms: [{ w: 28, h: 40 }] }]);
  assert.equal(drawn, "kilo");
  for (let i = 0; i < CUERNO_PLAY_DUR.duo + 2; i++) updateCuernoPlay(g, i);
  assert.equal(readCuernoPlay().duo, null); assert.equal(g.enemies[0].hp, 50);
  resetCuernoPlay(); assert.equal(startCuernoDuo(game("cat")), false);
});
test("cuerno-play: sin gradientes, Math.random ni GOD", () => {
  const src = readFileSync(new URL("../systems/cuerno-play-v373.js", import.meta.url), "utf8");
  assert.doesNotMatch(src, /create(Linear|Radial)Gradient|Math\.random|GOD/);
});
import { CUERNO_SKY } from "../systems/cuerno-play-v373.js";
test("cuerno-play: pinta el cielo al soñar cerca de un compañero, máx 3 s, con cooldown y sin compañero no sale", () => {
  resetCuernoPlay(); const g = game(); g.coopRemote = { x: 160, y: 200, w: 30, h: 40 };
  queueCuernoPlay("dream"); updateCuernoPlay(g, 0); updateCuernoPlay(g, 1);
  assert.ok(readCuernoPlay().sky); assert.ok(CUERNO_SKY.dur <= 180);
  for (let i = 0; i < 60; i++) { updateCuernoPlay(g, i); drawCuernoPlay(ctx(), g, i); }
  for (let i = 0; i < CUERNO_SKY.dur; i++) updateCuernoPlay(g, i);
  assert.equal(readCuernoPlay().sky, null); assert.ok(readCuernoPlay().skyCd > 0);
  queueCuernoPlay("dream"); updateCuernoPlay(g, 500); updateCuernoPlay(g, 501); assert.equal(readCuernoPlay().sky, null);
  resetCuernoPlay(); const g2 = game(); queueCuernoPlay("dream"); updateCuernoPlay(g2, 0); updateCuernoPlay(g2, 1); assert.equal(readCuernoPlay().sky, null);
  resetCuernoPlay(); const g3 = game(); g3.coopRemote = { x: 900, y: 200 }; queueCuernoPlay("dream"); updateCuernoPlay(g3, 0); updateCuernoPlay(g3, 1); assert.equal(readCuernoPlay().sky, null);
  resetCuernoPlay(); const g4 = game(); g4.coopRemote = { x: 160, y: 200 }; g4.paused = true; queueCuernoPlay("dream"); updateCuernoPlay(g4, 0); assert.equal(readCuernoPlay().sky, null);
});
