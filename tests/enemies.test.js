import test from "node:test";
import assert from "node:assert/strict";
import { telegraphDirection } from "../engine/enemies.js";

test("telegraph direction: prioriza objetivo, luego velocidad y orientación", () => {
  assert.equal(telegraphDirection({ aimDx: 20, aimDy: 4, vx: -8, facing: -1 }), 1);
  assert.equal(telegraphDirection({ aimDx: -20, vx: 8, facing: 1 }), -1);
  assert.equal(telegraphDirection({ aimDx: 0, vx: -8, facing: 1 }), -1);
  assert.equal(telegraphDirection({ aimDx: 0, vx: 0, facing: -1 }), -1);
  assert.equal(telegraphDirection({}), 1);
});
