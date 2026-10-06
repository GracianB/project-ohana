import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis;
globalThis.addEventListener ||= (() => {});
globalThis.removeEventListener ||= (() => {});
globalThis.dispatchEvent ||= (() => true);
globalThis.window.addEventListener = globalThis.addEventListener;
globalThis.window.removeEventListener = globalThis.removeEventListener;
globalThis.window.dispatchEvent = globalThis.dispatchEvent;

const { useAbility, clearAbilityFx } = await import('../systems/abilities.js');

function makeEnemy(overrides = {}) {
  return {
    x: 180, y: 260, w: 30, h: 34,
    hp: 1000, maxHp: 1000,
    dying: false, invuln: 0, vx: 0, vy: 0, stun: 0, flash: 0,
    ...overrides,
  };
}

function makeGame(id, enemies = [makeEnemy()]) {
  const player = {
    id, abilities: ['a', 'b', 'c'],
    x: 100, y: 260, w: 28, h: 34, facing: 1,
    evo: 4, health: 40, maxHealth: 125,
    cds: {}, cdDur: {}, dead: false, xp: 0, vx: 0, vy: 0,
  };
  return {
    player, enemies, projectiles: [], ghosts: [], platforms: [],
    worldW: 1600, worldH: 900, cam: { x: 0, y: 0 }, t: 0,
    reduceMotion: true, shake: 0, flash: 0, score: 0,
    nums: { add() {} }, fx: { emit() {} },
  };
}

function cast(id, enemies) {
  clearAbilityFx();
  const game = makeGame(id, enemies);
  useAbility(game, 3);
  return game;
}

test('PR151.11: Kilo supreme cura y concede invulnerabilidad', () => {
  const game = cast('kilo');
  assert.ok(game.player.health > 40);
  assert.ok(game.player.invuln >= 75);
  clearAbilityFx();
});

test('PR151.12: Stitcho supreme aplica control fuerte al enemigo', () => {
  const enemy = makeEnemy({ x: 300, y: 260 });
  const game = cast('stitcho', [enemy]);
  assert.ok(enemy.stun >= 52);
  assert.notEqual(enemy.vx, 0);
  clearAbilityFx();
});

test('PR151.13: Chispin supreme respeta el máximo de seis objetivos', () => {
  const enemies = Array.from({ length: 8 }, (_, i) => makeEnemy({ x: 180 + i * 70 }));
  const game = cast('chispin', enemies);
  const damaged = enemies.filter((e) => e.hp < 1000);
  assert.equal(damaged.length, 6);
  clearAbilityFx();
});

test('PR151.14: Cat supreme activa eclipse y amortigua movimiento enemigo', () => {
  const enemy = makeEnemy({ vx: 20, vy: -10 });
  const game = cast('cat', [enemy]);
  assert.ok(enemy._eclipseT >= 90);
  assert.equal(enemy.vx, 4);
  assert.equal(enemy.vy, -2);
  assert.ok(game.player.invuln >= 55);
  clearAbilityFx();
});

test('PR151.15: Dragon supreme escala el impacto y la sacudida', () => {
  const enemy = makeEnemy();
  const game = cast('dragon', [enemy]);
  assert.ok(enemy.hp < 1000);
  assert.ok(game.shake >= 16);
  assert.ok(Math.abs(enemy.vx) >= 16);
  clearAbilityFx();
});

test('PR151.16: Dino supreme tiene empuje mayor y shake reforzado', () => {
  const enemy = makeEnemy();
  const game = cast('dino', [enemy]);
  assert.ok(enemy.hp < 1000);
  assert.ok(game.shake >= 20);
  assert.ok(Math.abs(enemy.vx) >= 16);
  clearAbilityFx();
});

test('PR151.17: Frita supreme activa Fritura y devuelve vida', () => {
  const game = cast('frita');
  assert.ok(game.player.health > 40);
  assert.ok(game.player._fryGodT >= 120);
  clearAbilityFx();
});

test('PR151.18: Pizza supreme activa Horno real y recompensa por objetivos', () => {
  const enemies = [makeEnemy(), makeEnemy({ x: 250 }), makeEnemy({ x: 320 })];
  const game = cast('pizza', enemies);
  assert.ok(game.player._ovenKingT >= 120);
  assert.equal(game.score, 84);
  clearAbilityFx();
});

test('PR151.19: Yomi supreme ejecuta objetivos por debajo del 34%', () => {
  const finisher = makeEnemy({ hp: 30, maxHp: 100 });
  const survivor = makeEnemy({ x: 260, hp: 500, maxHp: 1000 });
  const game = cast('yomi', [finisher, survivor]);
  assert.equal(finisher.hp, 0);
  assert.ok(survivor.hp > 0);
  clearAbilityFx();
});

test('PR151.20: Cuerno supreme cura y concede experiencia', () => {
  const game = cast('cuerno');
  assert.ok(game.player.health > 40);
  assert.ok(game.player.xp > 0);
  clearAbilityFx();
});