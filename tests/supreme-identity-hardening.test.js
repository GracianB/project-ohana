import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis;
globalThis.addEventListener ||= (() => {});
globalThis.removeEventListener ||= (() => {});
globalThis.dispatchEvent ||= (() => true);
globalThis.window.addEventListener = globalThis.addEventListener;
globalThis.window.removeEventListener = globalThis.removeEventListener;
globalThis.window.dispatchEvent = globalThis.dispatchEvent;

const { useAbility, clearAbilityFx, registerCombatAction, supremeOf, updateAbilityFx, abilityPreMove } = await import('../systems/abilities.js');

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

test('V47B: U no desplaza automáticamente a ningún héroe', () => {
  for (const id of ['kilo','stitcho','chispin','cat','dragon','dino','frita','pizza','yomi','cuerno']) {
    clearAbilityFx();
    const game = makeGame(id, []);
    game.player.facing = -1;
    game.player.x = 240;
    game.player.vx = 0;
    game.player.vy = 0;
    useAbility(game, 3);
    assert.equal(game.player.x, 240, id + ': U cambia x sin input');
    assert.equal(game.player.vx, 0, id + ': U lanza horizontalmente sin input');
    assert.equal(game.player.vy, 0, id + ': U lanza verticalmente sin input');
  }
  clearAbilityFx();
});

test('V47B: turbo de Frita obedece input y no la arrastra por facing', () => {
  clearAbilityFx();
  const game = makeGame('frita', []);
  game.player.speed = 6;
  game.player.facing = -1;
  useAbility(game, 3);
  abilityPreMove(game, { left:false, right:false, jump:false, drop:false, t:1 });
  assert.equal(game.player.vx, 0);
  abilityPreMove(game, { left:false, right:true, jump:false, drop:false, t:2 });
  assert.equal(game.player.facing, 1);
  assert.ok(game.player.vx > 0);
  clearAbilityFx();
});

test('PR151.11: Kilo supreme cura y concede invulnerabilidad', () => {
  const game = cast('kilo');
  assert.ok(game.player.health > 40);
  assert.ok(game.player.invuln >= 75);
  clearAbilityFx();
});

test('PR151.12: Stitcho supreme aplica control fuerte al enemigo', () => {
  const enemy = makeEnemy({ x: 300, y: 260 });
  const game = cast('stitcho', [enemy]);
  for(let i=0;i<43;i++){game.t++;updateAbilityFx(game);}
  assert.ok(enemy.stun >= 52);
  assert.notEqual(enemy.vx, 0);
  clearAbilityFx();
});

test('V303: Chispin duet hits nearby targets during visible choreography', () => {
  const enemies = Array.from({ length: 10 }, (_, i) => makeEnemy({ x: 180 + i * 70 }));
  const game = cast('chispin', enemies);
  assert.equal(enemies.filter(e=>e.hp<1000).length,0);
  for(let i=0;i<121;i++){game.t++;updateAbilityFx(game);}
  const damaged = enemies.filter((e) => e.hp < 1000);
  assert.ok(damaged.length>=3&&damaged.length<=5);
  assert.ok(enemies.slice(5).every(e=>e.hp===1000));
  clearAbilityFx();
});

test('V304: Michi duet telegraphs local hits and retains protection', () => {
  const enemy = makeEnemy({ vx: 20, vy: -10 });
  const game = cast('cat', [enemy]);
  assert.equal(enemy.hp,1000);
  for(let i=0;i<55;i++){game.t++;updateAbilityFx(game);}
  assert.ok(enemy.hp<1000);assert.ok(enemy.stun>=25);
  assert.ok(Math.abs(enemy.vx)<=4&&enemy.vy<=-3);
  assert.ok(game.player.invuln >= 55);
  clearAbilityFx();
});

test('V325: Dragon supreme warns before the scaled knockback hit', () => {
  const enemy = makeEnemy();
  const game = cast('dragon', [enemy]);
  assert.equal(enemy.hp,1000,'telegraph must precede damage');
  for(let i=0;i<12;i++){game.t++;updateAbilityFx(game);}
  assert.ok(enemy.hp < 1000);
  assert.ok(game.shake >= 16);
  assert.ok(Math.abs(enemy.vx) >= 16);
  clearAbilityFx();
});

test('Dino V77: supreme conserva impacto, protege al Coloso y respeta vibración acotada', () => {
  const enemy = makeEnemy();
  const game = cast('dino', [enemy]);
  assert.ok(enemy.hp < 1000);
  assert.ok(game.shake >= 9 && game.shake <= 18);
  assert.ok(Math.abs(enemy.vx) >= 14);
  assert.ok(game.player._specialTitanT >= 260);
  assert.ok(game.player._specialArmorT >= 260);
  clearAbilityFx();
});

test('PR151.17: Frita supreme activa Fritura y devuelve vida', () => {
  const game = cast('frita');
  assert.ok(game.player.health > 40);
  assert.ok(game.player._fryGodT >= 120);
  clearAbilityFx();
});

test('V325: Pizza supreme launches Horno after a visible warning and rewards actual hits', () => {
  const enemies = [makeEnemy(), makeEnemy({ x: 250 }), makeEnemy({ x: 320 })];
  const game = cast('pizza', enemies);
  assert.ok(game.player._ovenKingT >= 120);
  assert.equal(game.score, 0,'no credit before impact');
  for(let i=0;i<12;i++){game.t++;updateAbilityFx(game);}
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

test('V37: H→J→K→L→U activa OHANA FLOW y asistencia', () => {
  clearAbilityFx();
  const game = makeGame('kilo', [makeEnemy()]);
  game.combo = 0;
  game.comboT = 0;
  registerCombatAction(game, 'H', 'golpe');
  registerCombatAction(game, 'J', 'ukulele');
  registerCombatAction(game, 'K', 'hula');
  registerCombatAction(game, 'L', 'ohana');
  useAbility(game, 3);
  assert.equal(game._supremeFlow?.label, 'OHANA FLOW');
  assert.equal(game._supremeFlow?.assist, true);
  assert.equal(game._assist?.heroId, supremeOf('kilo').ally);
  assert.ok(game._assist?.t > 0);
  clearAbilityFx();
});

test('V37: combo alto puede invocar asistencia aunque la cadena sea corta', () => {
  clearAbilityFx();
  const game = makeGame('pizza', [makeEnemy()]);
  game.combo = 10;
  useAbility(game, 3);
  assert.equal(game._supremeFlow?.assist, true);
  assert.equal(game._assist?.heroId, 'yomi');
  clearAbilityFx();
});


test('V37: Kilo aprende un enlace J→K visible y funcional', () => {
  clearAbilityFx();
  const game = makeGame('kilo', [makeEnemy({ x: 420 })]);
  game.player.abilities = ['ukulele', 'hula', 'ohana'];
  game.player.health = 40;
  useAbility(game, 0);
  useAbility(game, 1);
  assert.equal(game._signatureLink?.name, 'SERENATA HULA');
  assert.ok(game.player.health > 40);
  assert.ok(game.player._specialT >= 100);
  assert.ok(game.player._flowPower >= 1.14);
  clearAbilityFx();
});
