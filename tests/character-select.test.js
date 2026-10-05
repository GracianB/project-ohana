import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ROSTER } from "../characters/roster.js";

test("character select: mantiene las 10 entradas del roster", () => {
  assert.equal(ROSTER.length, 10);
  assert.equal(new Set(ROSTER.map((character) => character.id)).size, 10);
});

test("character select: la selección expone estado accesible y navegación circular", () => {
  const source = fs.readFileSync(
    new URL("../systems/title.js", import.meta.url),
    "utf8"
  );

  assert.match(source, /aria-current/);
  assert.match(source, /character-selection-status/);
  assert.match(source, /% ids\.length/);
  assert.match(source, /ArrowLeft/);
  assert.match(source, /ArrowRight/);
});
