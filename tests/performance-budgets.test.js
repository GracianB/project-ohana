import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  JS_WARN_BYTES, JS_HARD_BYTES, CSS_WARN_BYTES, CSS_HARD_BYTES,
  FIRST_CONTENTFUL_PAINT_MS, SIMULATION_STEP_BUDGET_MS
} from "../tools/performance-budgets.mjs";
const e2e=fs.readFileSync("tests/browser/e2e.mjs","utf8");
const gate=fs.readFileSync("tools/release-gate.mjs","utf8");
test("OHANA growth: 4x source headroom with early review warnings",()=>{
  assert.equal(JS_HARD_BYTES,12_000_000);
  assert.equal(JS_WARN_BYTES,2_400_000);
  assert.equal(CSS_HARD_BYTES,2_000_000);
  assert.equal(CSS_WARN_BYTES,400_000);
  assert.ok(JS_WARN_BYTES<JS_HARD_BYTES);
  assert.ok(CSS_WARN_BYTES<CSS_HARD_BYTES);
});
test("V70 Browser E2E checks transferred JS and retains real speed + accessibility gates",()=>{
  assert.match(e2e,/audit\.js < JS_HARD_BYTES/);
  assert.match(e2e,/audit\.js >= JS_WARN_BYTES/);
  assert.match(e2e,/audit\.css < CSS_HARD_BYTES/);
  assert.match(e2e,/audit\.fcp < FIRST_CONTENTFUL_PAINT_MS/);
  assert.match(e2e,/perfMs < SIMULATION_STEP_BUDGET_MS/);
  assert.match(e2e,/audit\.css >= CSS_WARN_BYTES/);
  assert.equal(CSS_HARD_BYTES,2_000_000);
  assert.equal(FIRST_CONTENTFUL_PAINT_MS,4_000);
  assert.equal(SIMULATION_STEP_BUDGET_MS,1_000);
});
test("V70 release gate checks production source, not just warmed browser transfer",()=>{
  assert.match(gate,/runtimeFiles\.reduce\(\(total, file\) => total \+ fs\.statSync\(file\)\.size/);
  assert.match(gate,/runtimeJsBytes >= JS_HARD_BYTES/);
  assert.match(gate,/runtimeJsBytes >= JS_WARN_BYTES/);
  assert.match(gate,/jsPrecache\.size !== runtimeFiles\.length/);
});
