import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const surprises = fs.readFileSync("systems/surprises.js","utf8");
const cinema = fs.readFileSync("systems/supreme-cinema.js","utf8");
const audio = fs.readFileSync("engine/audio.js","utf8");

test("surprise pickups use imported sfx and never undefined beep", () => {
  assert.match(surprises, /import \{ sfx \} from "\.\.\/engine\/audio\.js"/);
  assert.doesNotMatch(surprises, /\bbeep\s*\(/);
  assert.match(surprises, /sfx\("pickup"\)/);
  assert.match(audio, /pickup:\s*\(\)\s*=>/);
});

test("Michi eclipse cinematics define TAU locally", () => {
  assert.match(cinema, /const TAU = Math\.PI \* 2;/);
  assert.match(cinema, /i\s*\*\s*TAU\s*\/\s*9/);
});
