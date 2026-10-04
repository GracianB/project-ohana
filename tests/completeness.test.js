import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.window = globalThis;
globalThis.addEventListener ||= (() => {});
globalThis.removeEventListener ||= (() => {});
globalThis.dispatchEvent ||= (() => true);
globalThis.window.addEventListener = globalThis.addEventListener;
globalThis.window.removeEventListener = globalThis.removeEventListener;
globalThis.window.dispatchEvent = globalThis.dispatchEvent;
globalThis.CustomEvent ||= class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } };
const { ROSTER, applyForm, tickEvoTween } = await import('../characters/roster.js');
const { ROOMS } = await import('../systems/map.js');
const { ABILITY_DEFS } = await import('../systems/abilities.js');
const { createBossNido, updateBossNido } = await import('../systems/boss-nido.js');
const { BOSS_COMBAT_PROFILES, chooseBossPattern, patternLabel, recoveryFrames } = await import('../systems/boss-combat.js');
const { createBossBehavior, observeBossBehavior, reactiveAttackPreference, behaviorSnapshot, behaviorLabel } = await import('../systems/boss-behavior.js');

test('matriz completa: 10 personajes × 5 formas = 50 formas', () => {
  assert.equal(ROSTER.length, 10);
  assert.ok(ROSTER.every((p) => p.forms.length === 5));
  assert.equal(ROSTER.reduce((n, p) => n + p.forms.length, 0), 50);
});

test('matriz de combate: 10 personajes × 5 formas × 3 habilidades = 150 combinaciones', () => {
  const combos = [];
  for (const p of ROSTER) {
    assert.equal(p.abilities.length, 3, p.id);
    for (const form of p.forms) for (const ability of p.abilities) {
      assert.ok(ABILITY_DEFS[ability], p.id + '/' + form.name + ': habilidad inexistente ' + ability);
      combos.push(p.id + '/' + form.name + '/' + ability);
    }
  }
  assert.equal(combos.length, 150);
  assert.equal(new Set(combos).size, 150);
});

test('todas las evoluciones 0→4 funcionan en los 10 personajes', () => {
  for (const def of ROSTER) {
    const f0 = def.forms[0];
    const p = { id: def.id, forms: def.forms, evo: 0, name: f0.name, color: f0.color, speed: f0.speed, jumpPower: f0.jump, maxJumps: f0.jumps, maxHealth: f0.hp, health: f0.hp, w: f0.w, h: f0.h, x: 100, y: 400 };
    applyForm(p, { silent: true });
    for (let evo = 1; evo < 5; evo++) {
      p.evo = evo;
      applyForm(p);
      for (let i = 0; i < 50 && p.evoTween > 0; i++) tickEvoTween(p, 1);
      const f = def.forms[evo];
      assert.equal(p.name, f.name);
      assert.equal(p.maxHealth, f.hp);
      assert.equal(p.w, f.w, def.id + ' forma ' + (evo + 1) + ' ancho');
      assert.equal(p.h, f.h, def.id + ' forma ' + (evo + 1) + ' alto');
    }
  }
});

test('las 10 salas forman un grafo conectado y sus puertas son recíprocas', () => {
  const ids = Object.keys(ROOMS);
  assert.equal(ids.length, 10);
  for (const id of ids) for (const [dir, dest] of Object.entries(ROOMS[id].doors || {})) {
    if (!dest) continue;
    assert.ok(ROOMS[dest], id + '.' + dir + ' apunta a sala inexistente ' + dest);
  }
  const seen = new Set(['hub']), queue = ['hub'];
  while (queue.length) {
    const id = queue.shift();
    for (const dest of Object.values(ROOMS[id].doors || {})) if (dest && !seen.has(dest)) { seen.add(dest); queue.push(dest); }
  }
  assert.equal(seen.size, 10);
  assert.ok(ROOMS.boss.boss);
  assert.ok(ROOMS.boss.needEvo >= 3);
});

function bossGame() { return { player: { x: 300, y: 600, w: 28, h: 34 }, t: 0, reduceMotion: true, shake: 0, flash: 0, enemies: [], projectiles: [], ghosts: [], fx: { emit() {} } }; }
function bossHelpers(rng = () => 0) { return { rng, ROOM_W: 1600, ROOM_H: 900, t: 0, reduceMotion: true, hurtPlayer() {}, beep() {}, showNotification() {}, makeFoe(x, y, kind, roomId, i, opts) { return { x, y, w: 22, h: 14, hp: 20, max: 20, kind, roomId, i, ...opts }; } }; }

test('boss completo: intro, 3 fases, ataques y spawn deterministas', () => {
  const g = bossGame(); const e = createBossNido();
  for (let i = 0; i < 72; i++) { g.t++; updateBossNido(e, g, { ...bossHelpers(), t: g.t }); }
  assert.equal(e.introT, 0); assert.equal(e.contactDmg, 22);
  e.hp = e.max * 0.65; g.t++; updateBossNido(e, g, { ...bossHelpers(), t: g.t }); assert.equal(e.phase, 2);
  e.hp = e.max * 0.32; g.t++; updateBossNido(e, g, { ...bossHelpers(), t: g.t }); assert.equal(e.phase, 3);
  for (const kind of ['charge', 'swoop', 'slam', 'spit']) {
    e.mode = 'windup'; e.teleKind = kind; e.wind = 0; e.windMax = 0; e.perch = 0; e.attackCd = 0; g.t++;
    updateBossNido(e, g, { ...bossHelpers(), t: g.t });
    assert.ok(['charge', 'swoop', 'slam', 'spit'].includes(e.mode), kind);
    for (let i = 0; i < 50; i++) { g.t++; updateBossNido(e, g, { ...bossHelpers(), t: g.t }); }
  }
  e.mode = 'idle'; e.attackCd = 0; e.perch = 0; g.t++;
  updateBossNido(e, g, { ...bossHelpers(() => 0), t: g.t });
  assert.ok(g.enemies.length <= 2); assert.ok(g.enemies.every((x) => x.baby));
});

test('boss RNG inyectable: misma secuencia produce el mismo estado', () => {
  const run = () => {
    const g = bossGame(); const e = createBossNido(); const rng = () => 0.1;
    for (let i = 0; i < 160; i++) { g.t++; updateBossNido(e, g, { ...bossHelpers(rng), t: g.t }); }
    return { phase: e.phase, mode: e.mode, hp: e.hp, x: e.x, y: e.y, projectiles: g.projectiles.length, enemies: g.enemies.length };
  };
  assert.deepEqual(run(), run());
});
test('director del boss: las tres fases encadenan rutinas y abren ventanas de castigo', () => {
  for (const phase of [1, 2, 3]) {
    const profile = BOSS_COMBAT_PROFILES[phase];
    assert.ok(profile.patterns.length >= 3);
    assert.ok(profile.recovery > 0);
    assert.ok(profile.chainGap > 0);
    for (const pattern of profile.patterns) {
      assert.ok(pattern.length >= 2);
      assert.ok(pattern.every((kind) => ['charge', 'swoop', 'slam', 'spit'].includes(kind)));
      assert.ok(patternLabel(pattern));
    }
  }

  const far = chooseBossPattern(1, -1, () => 0, { distance: 500, vertical: 0 });
  assert.equal(far[0], 'charge');

  const high = chooseBossPattern(2, -1, () => 0, { distance: 220, vertical: -120 });
  assert.equal(high[0], 'swoop');

  const close = chooseBossPattern(3, -1, () => 0, { distance: 80, vertical: 10 });
  assert.equal(close[0], 'slam');

  assert.ok(recoveryFrames(1) > recoveryFrames(2));
  assert.ok(recoveryFrames(2) > recoveryFrames(3));
});

test('director del boss evita repetir la misma rutina consecutivamente cuando hay alternativas', () => {
  for (const phase of [1, 2, 3]) {
    const profile = BOSS_COMBAT_PROFILES[phase];
    const first = chooseBossPattern(phase, 0, () => 0, { distance: 350, vertical: 0 });
    const second = chooseBossPattern(phase, 0, () => 0, { distance: 350, vertical: 0 });
    assert.ok(first.length > 0);
    assert.ok(second.length > 0);
    if (profile.patterns.length > 1) assert.notDeepEqual(second, profile.patterns[0]);
  }
});


test('boss lee al jugador y adapta el primer ataque sin abandonar patrones autorizados', () => {
  const state = createBossBehavior();
  const dashPlayer = { grounded: true, vx: 6, vy: 0, _dashGo: 6, jumps: 1, maxJumps: 1 };
  for (let i = 0; i < 8; i++) observeBossBehavior(state, dashPlayer, { combo: 0 });
  assert.equal(state.tag, 'DASH');
  assert.equal(reactiveAttackPreference(2, state, 0.8), 'slam');
  const pattern = chooseBossPattern(2, -1, () => 0, {
    distance: 500, vertical: 0, behavior: state,
    reactivePreference: reactiveAttackPreference(2, state, 0.8),
  });
  assert.equal(pattern[0], 'slam');
  assert.ok(BOSS_COMBAT_PROFILES[2].patterns.some((candidate) =>
    candidate.length === pattern.length && candidate.every((kind, i) => kind === pattern[i])
  ));
  assert.equal(behaviorLabel(state, 0.8), 'LEE DASH');
  assert.deepEqual(Object.keys(behaviorSnapshot(state)), ['dash', 'air', 'aggressive', 'tag']);
});

test('boss entra en desesperación final de forma determinista cuando queda al 22% o menos', () => {
  const state = createBossBehavior();
  const pattern = chooseBossPattern(3, -1, () => 0, {
    distance: 40, vertical: 0, behavior: state,
    hpRatio: 0.2,
    reactivePreference: reactiveAttackPreference(3, state, 0.2),
  });
  assert.equal(pattern[0], 'charge');
});
