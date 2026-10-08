import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const art = readFileSync(new URL("../characters/art/stitch.js", import.meta.url), "utf8");
const cinema = readFileSync(new URL("../systems/evo-cinema.js", import.meta.url), "utf8");

test("Stitcho has five cyclic personality flourishes", () => {
  assert.match(art, /pose\.flourishN % 5/g);
  assert.match(art, /n === 3/);
  assert.match(art, /n === 2/);
  assert.match(art, /face\.earFlick/);
});

test("Stitcho dimensional cast FX is bounded to slot 2 and balanced canvas state", () => {
  const block = art.slice(art.indexOf("function drawPocketPortal("), art.indexOf("\nfunction draw(ctx, pose, R)"));
  assert.match(block, /pose\.castSlot !== 2/);
  assert.match(block, /ctx\.save\(\)/);
  assert.match(block, /ctx\.restore\(\)/);
  assert.match(block, /Math\.min\(1, Number\(pose\.cast\) \|\| 0\)/);
  assert.match(art, /drawPocketPortal\(ctx, pose, f, false\)/);
  assert.match(art, /drawPocketPortal\(ctx, pose, f, true\)/);
});

test("Stitcho evolution motif respects reduced motion and is exclusive to character", () => {
  assert.match(cinema, /export function drawStitchoEvolutionMotif/);
  assert.match(cinema, /if \(reduced\) return;/);
  assert.match(cinema, /def\.id === "stitcho" \|\| def\.id === "stitch"/);
});

test("Stitcho art contract preserves current standalone renderer", () => {
  assert.match(art, /export default \{ id: "stitcho", draw \};/);
  assert.doesNotMatch(art, /\.png/);
});
