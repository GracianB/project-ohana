import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ROSTER } from "../characters/roster.js";
import { rosterIndex } from "../systems/roster-navigation.js";

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
  assert.match(source, /rosterIndex\(i, key, ids.length, columns\)/);
  assert.match(source, /ArrowLeft/);
  assert.match(source, /ArrowRight/);
});

test("character select: flechas siguen las filas en escritorio y móvil", () => {
  assert.equal(rosterIndex(0, "ArrowLeft", 10, 5), 9);
  assert.equal(rosterIndex(9, "ArrowRight", 10, 5), 0);
  assert.equal(rosterIndex(2, "ArrowDown", 10, 5), 7);
  assert.equal(rosterIndex(7, "ArrowUp", 10, 5), 2);
  assert.equal(rosterIndex(2, "ArrowDown", 10, 2), 4);
  assert.equal(rosterIndex(0, "ArrowUp", 10, 2), 8);
  assert.equal(rosterIndex(4, "Home", 10, 2), 0);
  assert.equal(rosterIndex(4, "End", 10, 2), 9);
  assert.equal(rosterIndex(0, "ArrowRight", 0), -1);
});
