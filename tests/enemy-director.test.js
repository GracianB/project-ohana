import test from "node:test";
import assert from "node:assert/strict";
import {
  ENEMY_ROLES,
  directEnemyEncounter,
  enemyCanCommit,
  enemyDirectorSnapshot,
  enemyRole,
  enemySteering,
} from "../systems/enemy-director.js";
import { sense, think } from "../engine/foe-brain.js";

function foe(kind, index, x, hp = 100, max = 100, extra = {}) {
  return {
    kind, spawnIndex:index, x, y:500, w:32, h:28,
    hp, max, vx:0, vy:0, aggro:0, telegraph:false, ...extra
  };
}
const player = { x:620, y:500, w:32, h:38, dead:false };

test("V38: roles de enemigo cubren estilos distintos", () => {
  assert.equal(enemyRole("mosquito"), ENEMY_ROLES.DIVER);
  assert.equal(enemyRole("ufo"), ENEMY_ROLES.ARTILLERY);
  assert.equal(enemyRole("cangrejo"), ENEMY_ROLES.BRUISER);
  assert.equal(enemyRole("arana"), ENEMY_ROLES.AMBUSHER);
  assert.equal(enemyRole("pez"), ENEMY_ROLES.SWARM);
  assert.equal(enemyRole("libelula"), ENEMY_ROLES.SKIRMISHER);
});

test("V38: sala temprana limita ataques simultáneos", () => {
  const enemies = [
    foe("cucaracho",0,420), foe("phosquito",1,500), foe("cucaracho",2,760),
  ];
  const plan = directEnemyEncounter(enemies, player, "hub", 120);
  assert.equal(plan.budget, 1);
  assert.equal(enemies.filter((e) => e.aiAttackPermit).length, 1);
});

test("V38: salas tardías pueden coordinar hasta tres amenazas", () => {
  const enemies = [
    foe("escoria",0,300), foe("brasita",1,420), foe("escoria",2,520),
    foe("brasita",3,760), foe("planta",4,880), foe("escoria",5,1020),
  ];
  const plan = directEnemyEncounter(enemies, player, "volcano", 240);
  assert.equal(plan.budget, 3);
  assert.equal(enemies.filter((e) => e.aiAttackPermit).length, 3);
});

test("V38: un ataque ya telegrafiado no se cancela a mitad", () => {
  const active = foe("gaviota",0,520,100,100,{telegraph:true,wind:8});
  const others = [foe("cangrejo",1,560), foe("cangrejo",2,700)];
  directEnemyEncounter([active, ...others], player, "hub", 10);
  assert.equal(enemyCanCommit(active), true);
  assert.equal(active.aiAttackPermit, true);
});

test("V38: artillero herido busca distancia en vez de suicidarse", () => {
  const damaged = foe("ufo",0,570,20,100);
  const guard = foe("cangrejo",1,500);
  directEnemyEncounter([damaged, guard], player, "space", 80);
  assert.equal(damaged.aiIntent, "RETREAT");
  const steer = enemySteering(damaged, player);
  assert.equal(steer.intent, "RETREAT");
  assert.equal(Math.sign(steer.x), -Math.sign(player.x - damaged.x));
});

test("V38: alerta de grupo se propaga solo a vecinos cercanos", () => {
  const scout = foe("mosquito",0,500,100,100,{aggro:80});
  const near = foe("rana",1,720);
  const far = foe("rana",2,1500);
  directEnemyEncounter([scout, near, far], player, "jungle", 30);
  assert.ok(near.aggro >= 42);
  assert.equal(far.aggro, 0);
});

test("V38: el cerebro respeta intención estratégica del director", () => {
  const e = foe("ufo",0,600);
  e.aiIntent = "RETREAT";
  const s = sense(e, player);
  assert.equal(think(e, s, 0), "retreat");
  e.aiIntent = "FLANK";
  assert.equal(think(e, s, 0), "flank");
  e.aiIntent = "HOLD";
  assert.equal(think(e, s, 0), "hold");
});

test("V38: snapshot de IA es compacto y legible", () => {
  const enemies = [foe("arana",0,520), foe("cangrejo",1,760)];
  directEnemyEncounter(enemies, player, "cave", 42);
  const snapshot = enemyDirectorSnapshot(enemies);
  assert.equal(snapshot.length, 2);
  assert.ok(snapshot.every((row) => row.role && row.intent));
  assert.ok(snapshot.every((row) => row.threat >= 0 && row.threat <= 100));
});
