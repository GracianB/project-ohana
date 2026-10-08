import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  SPECIES_PROFILES,
  SPECIES_RELATIONS,
  prepareSpeciesEvolution,
  speciesFlankBias,
  speciesHoldSteering,
  speciesPreferredRange,
  speciesProfile,
  speciesSnapshot,
  speciesVariant,
} from "../systems/enemy-species.js";
import { directEnemyEncounter, enemyDirectorSnapshot, enemyRole } from "../systems/enemy-director.js";

const player = { x:620, y:500, w:32, h:38, dead:false };
const foe = (kind, spawnIndex, x = 520, y = 500) => ({
  kind, spawnIndex, x, y, w:32, h:28,
  hp:100, max:100, vx:0, vy:0, aggro:0, telegraph:false,
});

test("V42: todas las especies runtime tienen firma y tres variantes", () => {
  const kinds = [
    "phosquito","mosquito","gaviota","abeja","avispa","libelula",
    "murcielago","pez","brasita","cucaracho","cangrejo","rana",
    "escoria","planta","medusa","anguila","ufo","arana"
  ];
  assert.equal(Object.keys(SPECIES_PROFILES).length, kinds.length);
  for (const kind of kinds) {
    const profile = speciesProfile(kind);
    assert.ok(profile.family);
    assert.ok(profile.signature);
    assert.ok(profile.glyph);
    assert.equal(profile.variants.length, 3);
  }
});

test("V42: una misma especie muta de forma determinista según el mundo", () => {
  const hub = speciesVariant("ufo", "hub", 0);
  const volcano = speciesVariant("ufo", "volcano", 0);
  assert.notEqual(hub.name, volcano.name);
  assert.notEqual(hub.mode, volcano.mode);
  assert.deepEqual(speciesVariant("ufo", "hub", 0), hub);
  assert.deepEqual(speciesVariant("ufo", "volcano", 0), volcano);
});

test("V42: especies emparentadas forman PACK sin RNG", () => {
  const mosquito = foe("mosquito", 0, 400);
  const gaviota = foe("gaviota", 1, 650);
  prepareSpeciesEvolution([mosquito, gaviota], "beach", 144, enemyRole);
  assert.equal(mosquito.aiSpeciesRelation, SPECIES_RELATIONS.PACK);
  assert.equal(gaviota.aiSpeciesRelation, SPECIES_RELATIONS.PACK);
});

test("V42: artillería y diver forman FLUSH local", () => {
  const ufo = foe("ufo", 0, 400);
  const mosquito = foe("mosquito", 1, 650);
  prepareSpeciesEvolution([ufo, mosquito], "lab", 144, enemyRole);
  assert.equal(ufo.aiSpeciesRelation, SPECIES_RELATIONS.FLUSH);
  assert.equal(mosquito.aiSpeciesRelation, SPECIES_RELATIONS.FLUSH);
  assert.equal(ufo.aiSpeciesPartner, 1);
  assert.equal(mosquito.aiSpeciesPartner, 0);
});

test("V42: SCREEN, TRAP, RELAY y PINCER emergen de parejas de rol", () => {
  const cases = [
    ["cucaracho","pez",SPECIES_RELATIONS.SCREEN],
    ["arana","libelula",SPECIES_RELATIONS.TRAP],
    ["ufo","libelula",SPECIES_RELATIONS.RELAY],
    ["arana","cangrejo",SPECIES_RELATIONS.PINCER],
  ];
  for (const [aKind,bKind,expected] of cases) {
    const a = foe(aKind, 0, 400);
    const b = foe(bKind, 1, 650);
    prepareSpeciesEvolution([a,b], "hub", 216, enemyRole);
    assert.equal(a.aiSpeciesRelation, expected, aKind + " relación incorrecta");
    assert.equal(b.aiSpeciesRelation, expected, bKind + " relación incorrecta");
  }
});

test("V42: firma de especie modifica rango y flanqueo sin tocar stats de combate", () => {
  const spider = foe("arana", 0, 500);
  const plant = foe("planta", 1, 700);
  prepareSpeciesEvolution([spider, plant], "cave", 72, enemyRole);
  const spiderRange = speciesPreferredRange(spider, 160);
  const plantRange = speciesPreferredRange(plant, 160);
  assert.ok(spiderRange < plantRange);
  assert.ok(speciesFlankBias(spider, 0.4) > speciesFlankBias(plant, 0.4));
  assert.equal(spider.hp, 100);
  assert.equal(plant.hp, 100);
  assert.equal(spider.w, 32);
  assert.equal(plant.w, 32);
});

test("V42: steering de espera depende de especie y relación", () => {
  const ufo = foe("ufo", 0, 420);
  const mosquito = foe("mosquito", 1, 680);
  prepareSpeciesEvolution([ufo, mosquito], "lab", 144, enemyRole);
  ufo.aiAttackPermit = false;
  mosquito.aiAttackPermit = false;
  const ufoSteer = speciesHoldSteering(ufo, player);
  const mosquitoSteer = speciesHoldSteering(mosquito, player);
  assert.notEqual(ufoSteer, 0);
  assert.notEqual(mosquitoSteer, 0);
  assert.notEqual(ufoSteer, mosquitoSteer);
});

test("V42: el director expone especie, variante y relación para E2E", () => {
  const enemies = [foe("phosquito",0,400), foe("ufo",1,700), foe("cucaracho",2,940)];
  const plan = directEnemyEncounter(enemies, player, "lab", 144);
  const snapshot = enemyDirectorSnapshot(enemies);
  const species = speciesSnapshot(enemies);
  assert.equal(plan.ecology, "circuit");
  assert.equal(snapshot.length, 3);
  assert.ok(snapshot.every((row) => row.family && row.signature && row.variant && row.speciesMode));
  assert.ok(snapshot.some((row) => row.relation !== "NONE"));
  assert.ok(species.every((row) => row.variant && row.mode));
});

test("V42: el módulo de evolución no contiene RNG ni mutaciones de daño, salud o hitbox", () => {
  const source = fs.readFileSync("./systems/enemy-species.js", "utf8");
  assert.doesNotMatch(source, /Math\.random\(/);
  assert.doesNotMatch(source, /\.hp\s*[-+]?=/);
  assert.doesNotMatch(source, /\.health\s*[-+]?=/);
  assert.doesNotMatch(source, /\.w\s*=/);
  assert.doesNotMatch(source, /\.h\s*=/);
  assert.doesNotMatch(source, /damageEnemy|damagePlayer|healPlayer/);
});
