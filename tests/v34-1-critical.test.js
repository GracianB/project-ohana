import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

test("V34.1 camera is viewport-centered", () => {
  const s = read("game.js");
  assert.match(s, /const centerX = viewW \/ 2/);
  assert.match(s, /const centerY = viewH \/ 2/);
  assert.match(s, /ctx\.translate\(centerX \+ shakeX, centerY \+ shakeY\)/);
  assert.match(s, /ctx\.translate\(-centerX, -centerY\)/);
});

test("V34.1 dead boss cannot reappear", () => {
  const game = read("game.js");
  const enemies = read("engine/enemies.js");
  assert.match(game, /if \(e\.dying > 0\) return true;/);
  assert.match(enemies, /if \(e\.boss && e\.fell\) return;/);
});

test("V34.1 suspend preserves the active run", () => {
  const s = read("game.js");
  const start = s.indexOf("function suspend()");
  const end = s.indexOf("function toggleHelp()", start);
  const block = s.slice(start, end);
  assert.match(block, /if \(!game\.running\) return;/);
  assert.match(block, /setPaused\(true\);/);
  assert.doesNotMatch(block, /t = 0/);
  assert.doesNotMatch(block, /game\.roomId = "hub"/);
  assert.doesNotMatch(block, /game\.won = false/);
  assert.doesNotMatch(block, /game\.finale = null/);
});

test("V34.1 boss intro falls from above", () => {
  const s = read("systems/boss-nido.js");
  assert.match(s, /const landingFrames = 22/);
  assert.match(s, /e\.introDrop = \(1 - landingEase\) \* 700/);
});

test("V34.1 Pizza L is slot 2", () => {
  const s = read("systems/abilities.js");
  assert.match(s, /oven: \{ name: "Horno total", key: "L"/);
  assert.match(s, /game\.lastAbilityId = id/);
  assert.match(s, /game\.lastAbilitySlot = index/);
});

test("V34.1 ending is upgraded", () => {
  const ending = read("systems/ending.js");
  const css = read("ending.css");
  assert.match(ending, /EL NIDO HA CAÍDO/);
  assert.match(css, /win-breathe/);
});
