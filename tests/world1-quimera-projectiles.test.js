import test from "node:test";
import assert from "node:assert/strict";
import {
  FUSION_ATTACKS, FUSION_BOSS, FUSION_PHASES, FUSION_SPECIALS,
  createFusionBoss, fusionPhaseFor, updateFusionBoss
} from "../systems/fusion-boss.js";
import { WORLD1_ARENA, WORLD1_FLOOR, WORLD1_ORDER } from "../systems/world1-rooms.js";
import {
  BOSS_FAIRNESS, createWorld1BossDirector,
  world1BossFilterDamage, updateWorld1BossDirector, safeLaneX
} from "../systems/world1-boss.js";

function scene() {
  const boss = createFusionBoss(467), hits = [];
  const player = { x: boss.x - 300, y: WORLD1_FLOOR - 48, w: 36, h: 48, grounded: true, health: 150, maxHealth: 150 };
  const game = { boss, player, reduceMotion: true, flash: 0, shake: 0, onWorld1Beat() {} };
  const step = () => updateFusionBoss(boss, game, { hurtPlayer: (amount, label) => hits.push([amount, label]) });
  return { boss, b: boss._fusion, player, game, hits, step };
}

test("Quimera: a defeated boss cannot hit the hero with a lingering projectile", () => {
  const s = scene();
  s.b.shots.push({ k: "orb", x: s.player.x + 18, y: s.player.y + 24, vx: 0, vy: 0, r: 60, life: 100, dmg: 99 });
  s.boss.hp = 0;
  s.step();
  assert.deepEqual(s.hits, [], "projectiles must not land after the killing blow");
  assert.equal(s.b.shots.length, 0, "the defeat animation receives a cleared shot list");
  assert.equal(s.boss.hp, 0);
});

test("Quimera: projectiles preserve their author's name after the next attack starts", () => {
  const s = scene();
  s.b.mode = "warn"; s.b.attack = "plasma"; s.b.clock = 1; s.b.aim = -1;
  s.step();
  assert.equal(s.b.shots.length, 3);
  assert.ok(s.b.shots.every(shot => shot.source === FUSION_ATTACKS.plasma.name));
  const first = s.b.shots[0];
  // Production fireballs stay alive while the director changes attack state.
  s.b.mode = "rest"; s.b.attack = null; s.b.rest = 90;
  s.player.x = first.x + first.vx - s.player.w / 2;
  s.player.y = first.y + first.vy - s.player.h / 2;
  s.step();
  assert.ok(s.hits.some(([, label]) => label === "Plasma cosido"),
    "damage label must remain the firing attack, not generic QUIMERA");
});

test("Quimera: special projectiles keep their cinematic source as well", () => {
  const s = scene();
  s.b.mode = "special";
  s.b.special = { id: "eco", name: FUSION_SPECIALS[2].name, t: 83, length: FUSION_SPECIALS[2].length, phase: 2 };
  s.step(); // tick 84: special meteor appears
  assert.ok(s.b.shots.length > 0, "the echo special must emit a meteor");
  assert.equal(s.b.shots[0].source, FUSION_SPECIALS[2].name);
});

test("Quimera: all four thresholds and the ten heroes' authored attacks remain reachable", () => {
  assert.equal(Object.keys(FUSION_ATTACKS).length, 10);
  assert.deepEqual([...new Set(Object.values(FUSION_ATTACKS).map(attack => attack.hero))].sort(), [...WORLD1_ORDER].sort());
  assert.deepEqual(FUSION_PHASES, [0.70, 0.45, 0.20]);
  assert.equal(fusionPhaseFor(FUSION_BOSS.hp, FUSION_BOSS.hp), 1);
  assert.equal(fusionPhaseFor(1959, FUSION_BOSS.hp), 2);
  assert.equal(fusionPhaseFor(1259, FUSION_BOSS.hp), 3);
  assert.equal(fusionPhaseFor(559, FUSION_BOSS.hp), 4);
  const s = scene();
  for (const [hp, phase] of [[1959, 2], [1259, 3], [559, 4]]) {
    s.b.mode = "rest"; s.b.rest = 100; s.boss.hp = hp;
    s.step();
    assert.equal(s.boss.phase, phase);
    assert.equal(s.b.mode, "special");
    assert.equal(s.b.special?.id, FUSION_SPECIALS[phase].id);
    assert.equal(s.b.announced[phase], true);
  }
  assert.equal(s.b.shots.length, 0, "no orphan shots during controlled threshold tests");
});

test("Quimera: capped damage, grace, and safe lanes protect the final arena", () => {
  const s = scene();
  s.game.world1Boss = createWorld1BossDirector(s.boss);
  s.b.mode = "warn"; s.b.attack = "rayos"; s.b.clock = 30; s.b.marks = [7500, 8100, 8800];
  updateWorld1BossDirector(s.game);
  assert.equal(world1BossFilterDamage(s.game, 1000), BOSS_FAIRNESS.capPerAttack);
  assert.equal(world1BossFilterDamage(s.game, 1000), 0, "grace blocks repeated hits");
  const safe = safeLaneX(s.boss, s.b);
  assert.ok(safe >= WORLD1_ARENA.left + 60 && safe <= WORLD1_ARENA.right - 60);
  assert.ok(s.b.marks.every(x => Math.abs(safe - x) > 34 + s.player.w / 2),
    "the displayed safe lane must be outside every lightning column");
});
