import test from "node:test";
import assert from "node:assert/strict";
import {
  OBJECTIVE_DEFS,
  objectiveForRoom,
  formatObjective,
} from "../systems/objectives.js";

test("cada sala navegable tiene un objetivo estructurado", () => {
  for (const id of ["hub","beach","jungle","volcano","boss","cave","lab","ridge","space","reef"]) {
    const objective = objectiveForRoom(id, { evo: 4, won: false });
    assert.ok(objective);
    assert.ok(objective.id);
    assert.ok(objective.title);
    assert.ok(objective.text);
    assert.ok(objective.destination);
  }
  assert.equal(Object.keys(OBJECTIVE_DEFS).length, 10);
});

test("el objetivo de jungla cambia cuando falta la forma requerida", () => {
  const blocked = objectiveForRoom("jungle", { evo: 2 });
  const ready = objectiveForRoom("jungle", { evo: 3 });
  assert.equal(blocked.blocked, true);
  assert.match(blocked.text, /forma 4/i);
  assert.equal(ready.blocked, undefined);
  assert.equal(ready.destination, "Caldera");
});

test("el laboratorio también expresa su requisito de evolución", () => {
  const blocked = objectiveForRoom("cave", { evo: 0 });
  assert.equal(blocked.blocked, true);
  assert.match(blocked.requirement, /Forma 2/i);
});

test("la victoria convierte el objetivo del boss en cierre de Mundo 1", () => {
  const complete = objectiveForRoom("boss", { evo: 4, won: true });
  assert.equal(complete.completed, true);
  assert.equal(complete.id, "world1-complete");
});

test("formatObjective mantiene texto humano y destino", () => {
  const objective = objectiveForRoom("volcano", { evo: 4 });
  const text = formatObjective(objective);
  assert.match(text, /entrada del Nido/i);
  assert.match(text, /Destino: Nido/i);
});
