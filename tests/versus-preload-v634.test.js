import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { moduleGraph } from "../tools/module-graph.mjs";

test("versus.html preloads the complete arena module graph (no import waterfall)", () => {
  const html = fs.readFileSync("versus.html", "utf8");
  const preloaded = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map((m) => m[1]);
  const graph = moduleGraph("multiplayer/versus-client.js");
  assert.deepEqual([...preloaded].sort(), [...graph].sort(), "run tools/module-graph.mjs and refresh the modulepreload list");
  for (const file of preloaded) assert.ok(fs.existsSync(file), file);
});

test("photobooth strips exist for every hero and stay small", async () => {
  const { ROSTER } = await import("../characters/roster.js");
  let total = 0;
  for (const hero of ROSTER) {
    const file = `assets/photobooth/${hero.id}.webp`;
    assert.ok(fs.existsSync(file), file);
    const bytes = fs.readFileSync(file);
    assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
    assert.ok(bytes.length < 60_000, `${file} is ${bytes.length} bytes`);
    total += bytes.length;
  }
  assert.ok(total < 400_000, `photobooth total ${total} bytes`);
});

test("versus client keeps the server protocol: same actions, no positions sent", () => {
  const src = fs.readFileSync("multiplayer/versus-client.js", "utf8");
  for (const action of ["'move'", "'poll'", "'join'", "'attack'", "'ability'", "'dodge'", "'disconnect'"]) assert.ok(src.includes(action), action);
  assert.doesNotMatch(src, /positionX|positionY|engineMode|mode:'engine'/);
});
