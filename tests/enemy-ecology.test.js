import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  ENEMY_ECOLOGY,
  ecologyForRoom,
  ecologyHoldSteering,
  ecologySnapshot,
} from "../systems/enemy-ecology.js";
import { directEnemyEncounter, enemyDirectorSnapshot } from "../systems/enemy-director.js";

const player = { x:620, y:500, w:32, h:38, dead:false };
const foe = (kind, spawnIndex, x = 520) => ({
  kind, spawnIndex, x, y:500, w:32, h:28,
  hp:100, max:100, vx:0, vy:0, aggro:0, telegraph:false,
});

test("V41: las diez salas tienen ecología y formación canónicas", () => {
  const rooms = ["hub","beach","jungle","cave","lab","ridge","space","reef","volcano","boss"];
  assert.deepEqual(Object.keys(ENEMY_ECOLOGY).sort(), rooms.sort());
  assert.equal(new Set(rooms.map((id) => ecologyForRoom(id).id)).size, 10);
  assert.equal(new Set(rooms.map((id) => ecologyForRoom(id).formation)).size, 10);
});

test("V41: la ecología no introduce RNG ni mutaciones de combate o hitbox", () => {
  const source = fs.readFileSync("./systems/enemy-ecology.js", "utf8");
  assert.doesNotMatch(source, /Math\.random\(/);
  assert.doesNotMatch(source, /\.hp\s*[-+]?=/);
  assert.doesNotMatch(source, /\.health\s*[-+]?=/);
  assert.doesNotMatch(source, /\.w\s*=/);
  assert.doesNotMatch(source, /\.h\s*=/);
});

test("V41: Costa prioriza amenaza móvil y Lab prioriza artillería", () => {
  const beach = [foe("mosquito",0), foe("planta",1)];
  const beachPlan = directEnemyEncounter(beach, player, "beach", 120);
  assert.equal(beachPlan.ecology, "tide");
  assert.equal(beachPlan.formation, "TIDE");
  assert.equal(beach[0].aiAttackPermit, true);
  assert.equal(beach[1].aiAttackPermit, false);

  const lab = [foe("mosquito",0), foe("planta",1)];
  const labPlan = directEnemyEncounter(lab, player, "lab", 120);
  assert.equal(labPlan.ecology, "circuit");
  assert.equal(labPlan.formation, "CIRCUIT");
  assert.equal(lab[0].aiAttackPermit, false);
  assert.equal(lab[1].aiAttackPermit, true);
});

test("V41: Caldera conserva el techo histórico de tres atacantes", () => {
  const enemies = [
    foe("escoria",0,300), foe("brasita",1,420), foe("escoria",2,520),
    foe("brasita",3,760), foe("planta",4,880), foe("escoria",5,1020),
  ];
  const plan = directEnemyEncounter(enemies, player, "volcano", 240);
  assert.equal(plan.budget, 3);
  assert.equal(enemies.filter((e) => e.aiAttackPermit).length, 3);
  assert.equal(plan.formation, "FURNACE");
});

test("V41: formación y presión quedan expuestas para QA y arte", () => {
  const enemies = [foe("ufo",0,500), foe("brasita",1,760)];
  directEnemyEncounter(enemies, player, "space", 180);
  const director = enemyDirectorSnapshot(enemies);
  const ecology = ecologySnapshot(enemies);
  assert.ok(director.every((row) => row.biome === "orbit" && row.formation === "ORBIT"));
  assert.ok(director.every((row) => row.ecoPressure >= 0 && row.ecoPressure <= 100));
  assert.ok(ecology.every((row) => row.pressure >= 0 && row.pressure <= 100));
});

test("V41: las formaciones de espera producen steering distinto sin conceder permiso", () => {
  const orbit = foe("ufo",0,400);
  orbit.aiAttackPermit = false;
  orbit.aiFormation = "ORBIT";
  orbit.aiFormationSlot = 0;
  const circuit = foe("planta",1,400);
  circuit.aiAttackPermit = false;
  circuit.aiFormation = "CIRCUIT";
  circuit.aiFormationSlot = 1;

  const orbitSteer = ecologyHoldSteering(orbit, player);
  const circuitSteer = ecologyHoldSteering(circuit, player);
  assert.notEqual(orbitSteer, 0);
  assert.notEqual(circuitSteer, 0);
  assert.notEqual(Math.sign(orbitSteer), Math.sign(circuitSteer));
});
