import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROSTER, findRoster, applyForm } from "../characters/roster.js";
import { clampStartEvo, formCount, startFormName, startDetail } from "../systems/start-form.js";

test("Medusa Onírica is Michicornio form index 2 (canonical id cat)", () => {
  const cat = findRoster("cat");
  assert.equal(cat.id, "cat");
  assert.equal(cat.evoNames[2], "Medusa Onírica");
  assert.equal(cat.forms[2].name, "Medusa Onírica");
  assert.equal(startFormName(cat, 2), "Medusa Onírica");
  for (const alias of ["michi", "michicornio", "cat"]) {
    assert.equal(findRoster(alias).evoNames[2], "Medusa Onírica");
  }
});

test("clampStartEvo and startDetail keep evo in range for every roster hero", () => {
  assert.equal(clampStartEvo(undefined), 0);
  assert.equal(clampStartEvo("nope"), 0);
  assert.equal(clampStartEvo(-3), 0);
  assert.equal(clampStartEvo(2.9), 2);
  assert.equal(clampStartEvo(99), 4);
  for (const def of ROSTER) {
    assert.equal(formCount(def), 5);
    assert.deepEqual(startDetail(def.id, 2, def), { id: def.id, evo: 2 });
    assert.deepEqual(startDetail(def.id, 9, def), { id: def.id, evo: 4 });
    assert.equal(startFormName(def, 0), def.evoNames[0]);
  }
});

test("applyForm with evo 2 yields Medusa Onírica playable stats (silent start)", () => {
  const cat = findRoster("cat");
  const p = {
    ...cat,
    evo: 2,
    x: 0, y: 0, vx: 0, vy: 0, facing: 1,
    abilities: cat.abilities.slice(),
  };
  applyForm(p, { silent: true });
  assert.equal(p.name, "Medusa Onírica");
  assert.equal(p.evo, 2);
  assert.equal(p.maxHealth, cat.forms[2].hp);
  assert.equal(p.w, cat.forms[2].w);
  assert.equal(p.h, cat.forms[2].h);
  assert.equal(p.speed, cat.forms[2].speed);
  assert.ok(Number.isFinite(p.w) && p.w > 0);
});

test("title/game/camp wire selectedEvo into ohana-start without breaking setEvo", () => {
  const title = readFileSync(new URL("../systems/title.js", import.meta.url), "utf8");
  const game = readFileSync(new URL("../game.js", import.meta.url), "utf8");
  const camp = readFileSync(new URL("../systems/family-camp.js", import.meta.url), "utf8");

  assert.match(title, /let selectedEvo = 0/);
  assert.match(title, /startDetail\(selectedId, selectedEvo/);
  assert.match(title, /qaEvo \?\? selectedEvo/);
  assert.match(title, /dataset\.evo/);
  assert.match(title, /onForm:\(evo\)=>setSelectedEvo\(evo\)/);
  assert.match(title, /onBegin:\(\{evo\}=\{\}\)/);

  assert.match(game, /makePlayer\(def, opts/);
  assert.match(game, /clampStartEvo\(opts\.evo/);
  assert.match(game, /start\(def, \{ evo: e\.detail\?\.evo \}\)/);
  // E2E setEvo and default start(id) stay intact.
  assert.match(game, /setEvo\(value\) \{/);
  assert.match(game, /game\.player\.evo = Math\.max\(0, Math\.min\(4, Math\.floor\(Number\(value\) \|\| 0\)\)\)/);
  assert.match(game, /start\(id = "kilo"\) \{\n  const def = ROSTER\.find\(\(r\) => r\.id === id\);\n  start\(def\);/);

  assert.match(camp, /onBegin\?\.\(\{evo:form\}\)/);
  assert.match(camp, /onForm\?\.\(form\)/);
  assert.match(camp, /empezar con esta forma/);
});
