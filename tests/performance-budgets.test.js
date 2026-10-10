import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  JS_WARN_BYTES, JS_HARD_BYTES, CSS_WARN_BYTES, CSS_HARD_BYTES,
  FIRST_CONTENTFUL_PAINT_MS, SIMULATION_STEP_BUDGET_MS
} from "../tools/performance-budgets.mjs";
const e2e=fs.readFileSync("tests/browser/e2e.mjs","utf8");
const gate=fs.readFileSync("tools/release-gate.mjs","utf8");
test("OHANA allows source growth without artificial byte ceilings",()=>{
  for(const cap of [JS_WARN_BYTES,JS_HARD_BYTES,CSS_WARN_BYTES,CSS_HARD_BYTES])
    assert.equal(cap,Infinity);
});
test("Browser E2E retains actual responsiveness and accessibility checks",()=>{
  assert.doesNotMatch(e2e,/audit\\.(?:js|css)\\s*[<>]=?\\s*(?:JS|CSS)_(?:HARD|WARN)_BYTES/);
  assert.match(e2e,/audit\\.fcp < FIRST_CONTENTFUL_PAINT_MS/);
  assert.match(e2e,/perfMs < SIMULATION_STEP_BUDGET_MS/);
  assert.equal(FIRST_CONTENTFUL_PAINT_MS,4000);
  assert.equal(SIMULATION_STEP_BUDGET_MS,1000);
});
test("Release gate reports source sizes and protects precache integrity",()=>{
  assert.match(gate,/runtimeFiles\\.reduce\\(\\(total, file\\) => total \\+ fs\\.statSync\\(file\\)\\.size/);
  assert.match(gate,/JS fuente \\(informativo, sin techo\\)/);
  assert.match(gate,/jsPrecache\\.size !== runtimeFiles\\.length/);
  assert.doesNotMatch(gate,/runtimeJsBytes >= JS_HARD_BYTES/);
});
