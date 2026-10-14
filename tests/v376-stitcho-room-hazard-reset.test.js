import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { clearStitchoWebs, updateStitchoWebs } from "../engine/foes/stitcho-ai.js";

test("V376: a web slows the player only in its original room", () => {
  const player = { x: 101, y: 201, w: 26, h: 34, vx: 10, dead: false };
  const game = { player, paused: false, _stitchoWebs: [
    { x: 90, y: 216, w: 48, h: 24, life: 500, max: 600 }
  ] };
  updateStitchoWebs(game);
  assert.ok(player._webSlowT > 0, "a real collision must apply the slow timer");
  assert.ok(player.vx < 10, "a real collision must reduce horizontal velocity");
  const previousTraps = game._stitchoWebs;

  clearStitchoWebs(game);
  assert.notEqual(game._stitchoWebs, previousTraps);
  assert.deepEqual(game._stitchoWebs, []);
  assert.equal(player._webSlowT, 0, "the timer must not survive the portal");

  player.vx = 10;
  updateStitchoWebs(game);
  assert.equal(player._webSlowT, 0);
  assert.equal(player.vx, 10, "old web traps cannot slow the player again");
});

test("V376: clear also removes a persistent web debuff without active traps", () => {
  const player = { _webSlowT: 42, vx: 7 };
  const game = { player };
  clearStitchoWebs(game);
  assert.deepEqual(game._stitchoWebs, []);
  assert.equal(player._webSlowT, 0);
  assert.equal(player.vx, 7, "do not overwrite normal movement velocity");
  assert.doesNotThrow(() => clearStitchoWebs(null));
  assert.doesNotThrow(() => clearStitchoWebs({}));
});

test("V376: locked and invalid portals keep traps; accepted portals clear them", () => {
  const source = fs.readFileSync("game.js", "utf8");
  const start = source.indexOf("function loadRoom(id, fromDir) {");
  assert.notEqual(start, -1, "must inspect the actual room transition");
  const end = source.indexOf("\nfunction ", start + 1);
  const loadRoom = source.slice(start, end > start ? end : undefined);
  const invalidGuard = loadRoom.indexOf("if (!r) return false;");
  const lockedGuard = loadRoom.indexOf("bounceLocked(fromDir);");
  const lockedReturn = loadRoom.indexOf("return false;", lockedGuard);
  const roomAccepted = loadRoom.indexOf("game.roomId = id;");
  const clear = loadRoom.indexOf("clearStitchoWebs(game);");
  const resetDino = loadRoom.indexOf("resetDinoFoeAI();");
  const nextEnemies = loadRoom.indexOf("game.enemies =");
  assert.ok(invalidGuard >= 0 && invalidGuard < roomAccepted);
  assert.ok(lockedGuard >= 0 && lockedReturn > lockedGuard && lockedReturn < roomAccepted);
  assert.ok(roomAccepted < clear && clear < resetDino);
  assert.ok(clear < nextEnemies, "hazards must clear before the next room spawns");
});
