import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// The Michi eclipse passed an rgba() colour to glow(); the old hex-only
// end stop produced "rgba(6600" and every render of w1-cat threw.
test("living-realms glow builds a valid transparent stop for rgba() and hex colours", () => {
  const src = fs.readFileSync(new URL("../worlds/living-realms.js", import.meta.url), "utf8");
  const m = /function clearStop\(color\)\{[\s\S]*?\n/.exec(src);
  assert.ok(m, "clearStop helper exists");
  const clearStop = new Function(m[0] + "; return clearStop;")();
  assert.equal(clearStop("rgba(66,232,208,0.55)"), "rgba(66,232,208,0)");
  assert.equal(clearStop("rgb(1,2,3)"), "rgba(1,2,3,0)");
  assert.equal(clearStop("#fff1bd55"), "#fff1bd00");
  assert.match(src, /addColorStop\(1,clearStop\(color\)\)/);
});
