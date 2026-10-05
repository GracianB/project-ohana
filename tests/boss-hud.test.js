import test from "node:test";
import assert from "node:assert/strict";
import { formatBossStatus } from "../systems/boss-hud.js";

test("boss HUD: vista compacta y estado accesible separado", () => {
  const status = formatBossStatus(
    { phase: 2, hp: 75, max: 100, vulnerable: true, telegraph: true, counterplay: { streak: 2 } },
    "ASCENSO"
  );
  assert.equal(status.title, "REINA DEL NIDO · FASE 2");
  assert.match(status.visible, /ASCENSO/);
  assert.match(status.accessible, /Salud 75%/);
  assert.match(status.accessible, /vulnerable/);
  assert.match(status.accessible, /ataque telegrafiado/);
  assert.match(status.accessible, /racha 2\/3/);
});

test("boss HUD: no produce texto de ataque gigante", () => {
  const status = formatBossStatus({ phase: 3, hp: 10, max: 100 }, "APOCALIPSIS");
  assert.ok(status.visible.length < 60);
});
