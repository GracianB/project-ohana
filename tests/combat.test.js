import test from "node:test";
import assert from "node:assert/strict";
import { damageFeedback } from "../systems/combat-feedback.js";

test("combat feedback: golpes normales no inundan de números", () => {
  assert.equal(damageFeedback({ combo: 1 }).showNumber, false);
  assert.equal(damageFeedback({ combo: 3 }).showNumber, false);
  assert.equal(damageFeedback({ combo: 4 }).showNumber, true);
});

test("combat feedback: críticos y boss siempre tienen impacto destacado", () => {
  const crit = damageFeedback({ crit: true, combo: 1 });
  const boss = damageFeedback({ boss: true, combo: 0 });
  assert.equal(crit.showNumber, true);
  assert.equal(crit.label, "CRÍTICO");
  assert.ok(crit.tier >= 4);
  assert.equal(boss.showNumber, true);
  assert.equal(boss.label, "IMPACTO");
  assert.ok(boss.tier >= 2);
});
