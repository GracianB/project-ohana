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
const { ABILITY_DEFS, useAbility, updateAbilityFx, abilityPreMove, clearAbilityFx } = await import('../systems/abilities.js');
const { createBossNido, updateBossNido } = await import('../systems/boss-nido.js');
const { BOSS_COMBAT_PROFILES, chooseBossPattern, patternLabel, recoveryFrames } = await import('../systems/boss-combat.js');
const { createBossBehavior, observeBossBehavior, reactiveAttackPreference, behaviorSnapshot, behaviorLabel } = await import('../systems/boss-behavior.js');
const { createBossAdaptation, observeBossAdaptation, adaptiveAttackPreference, adaptationSnapshot, adaptationLabel } = await import('../systems/boss-adaptation.js');
const { createBossBait, armBossBait, consumeBossBait, baitSnapshot, BAIT_PATTERNS } = await import('../systems/boss-bait.js');
const { createBossBaitFeedback, beginBossBaitFeedback, resolveBossBaitFeedback, feedbackAttackDelay, baitFeedbackSnapshot, baitFeedbackLabel } = await import('../systems/boss-bait-feedback.js');
const { createBossEncounterMemory, observeBossEncounter, encounterPreference, encounterSnapshot, encounterLabel } = await import('../systems/boss-encounter-memory.js');

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

 
test('boss counterplay: una defensa limpia genera racha y BREAK al tercer éxito', async () => {
  const {
    createBossCounterplay, startBossThreat, observeBossThreat, resolveBossThreat,
  } = await import('../systems/boss-counterplay.js');
  const boss = { x: 500, y: 500, w: 110, h: 130, phase: 2 };
  const player = { x: 550, y: 600, w: 28, h: 34, grounded: true, vy: 0, _dashGo: 0 };

  const state = createBossCounterplay();
  for (let i = 0; i < 3; i++) {
    player.x = 550;
    player.grounded = true;
    player.vy = 0;
    player._dashGo = 0;
    startBossThreat(state, boss, player, 100, 'charge');
    player._dashGo = 8;
    player.x = 430;
    for (let f = 0; f < 3; f++) observeBossThreat(state, boss, player, 100);
    const result = resolveBossThreat(state, player, 100);
    assert.ok(result);
    assert.equal(result.type, 'DASH');
    if (i < 2) assert.equal(result.break, false);
    else {
      assert.equal(result.break, true);
      assert.ok(result.openBonus > 0);
    }
  }
  assert.equal(state.streak, 3);
  assert.equal(state.bestStreak, 3);
  assert.equal(state.total, 3);
});

test('boss counterplay anula una defensa si el jugador recibe daño', async () => {
  const { createBossCounterplay, startBossThreat, observeBossThreat, resolveBossThreat } =
    await import('../systems/boss-counterplay.js');
  const boss = { x: 500, y: 500, w: 110, h: 130, phase: 1 };
  const player = { x: 550, y: 600, w: 28, h: 34, grounded: true, vy: 0, _dashGo: 6 };
  const state = createBossCounterplay();
  startBossThreat(state, boss, player, 100, 'charge');
  observeBossThreat(state, boss, { ...player, _dashGo: 7, x: 430 }, 90);
  assert.equal(resolveBossThreat(state, player, 90), null);
  assert.equal(state.streak, 0);
});


test('boss counterplay: estar fuera de peligro no rompe una racha existente', async () => {
  const { createBossCounterplay, startBossThreat, resolveBossThreat } =
    await import('../systems/boss-counterplay.js');
  const boss = { x: 500, y: 500, w: 110, h: 130, phase: 1 };
  const player = { x: 550, y: 600, w: 28, h: 34, grounded: true, vy: 0, _dashGo: 6 };
  const state = createBossCounterplay();
  state.streak = 2;
  startBossThreat(state, boss, { ...player, x: 1200, _dashGo: 0 }, 100, 'charge');
  assert.equal(resolveBossThreat(state, player, 100), null);
  assert.equal(state.streak, 2);
});


test('phase 18: la adaptación aprende respuestas repetidas sin salir del repertorio autorizado', () => {
  const state = createBossAdaptation();
  observeBossAdaptation(state, { outcome: 'success', type: 'DASH' });
  observeBossAdaptation(state, { outcome: 'success', type: 'DASH' });

  assert.equal(state.target, 'DASH');
  assert.ok(state.level >= 2);
  assert.equal(adaptiveAttackPreference(2, state, 0.7), 'slam');

  const pattern = chooseBossPattern(2, -1, () => 0, {
    distance: 500,
    vertical: 0,
    hpRatio: 0.7,
    adaptivePreference: adaptiveAttackPreference(2, state, 0.7),
  });
  assert.equal(pattern[0], 'slam');
  assert.ok(BOSS_COMBAT_PROFILES[2].patterns.some((candidate) =>
    candidate.length === pattern.length && candidate.every((kind, i) => kind === pattern[i])
  ));
  assert.match(adaptationLabel(state, 0.7), /ADAPTA DASH/);
  assert.deepEqual(Object.keys(adaptationSnapshot(state)), ['dash', 'air', 'space', 'target', 'level', 'repeat']);
});

test('phase 18: respuestas mezcladas enfrían la adaptación y el tramo final conserva la desesperación', () => {
  const mixed = createBossAdaptation();
  observeBossAdaptation(mixed, { outcome: 'success', type: 'DASH' });
  observeBossAdaptation(mixed, { outcome: 'success', type: 'AIRE' });
  observeBossAdaptation(mixed, { outcome: 'success', type: 'DISTANCIA' });
  assert.equal(mixed.target, '');

  const finalState = createBossAdaptation();
  observeBossAdaptation(finalState, { outcome: 'success', type: 'DASH' });
  observeBossAdaptation(finalState, { outcome: 'success', type: 'DASH' });
  assert.equal(adaptiveAttackPreference(3, finalState, 0.2), 'charge');
});

test('phase 18: el cambio de respuesta reinicia la racha de repetición y mantiene memoria acotada', () => {
  const state = createBossAdaptation();
  observeBossAdaptation(state, { outcome: 'success', type: 'DASH' });
  observeBossAdaptation(state, { outcome: 'success', type: 'DASH' });
  assert.equal(state.repeat, 2);
  observeBossAdaptation(state, { outcome: 'success', type: 'AIRE' });
  assert.equal(state.repeat, 1);
  assert.equal(state.lastType, 'AIRE');

  for (let i = 0; i < 20; i++) {
    observeBossAdaptation(state, { outcome: 'success', type: i % 2 ? 'DASH' : 'AIRE' });
  }
  assert.ok(state.recent.length <= 6);
  assert.equal(state.ticks, 23);
  assert.ok(Object.values(state.pressure).every((value) => Number.isFinite(value) && value >= 0 && value <= 4));
});


test('phase 19: el CEBO transforma una repetición en una rutina autorizada de un solo uso', () => {
  const adaptation = createBossAdaptation();
  observeBossAdaptation(adaptation, { outcome: 'success', type: 'DASH' });
  observeBossAdaptation(adaptation, { outcome: 'success', type: 'DASH' });

  const bait = createBossBait();
  armBossBait(bait, adaptation);
  assert.equal(bait.armed, true);
  assert.equal(bait.type, 'DASH');

  const pattern = consumeBossBait(bait, 2);
  assert.deepEqual(pattern, BAIT_PATTERNS[2].DASH);
  assert.equal(bait.armed, false);
  assert.equal(bait.uses, 1);
  assert.deepEqual(baitSnapshot(bait), {
    armed: false, type: 'DASH', uses: 1, lastPattern: 'slam>spit>swoop', lastRead: 2
  });

  armBossBait(bait, adaptation);
  assert.equal(bait.armed, false);
});

test('phase 19: cambiar la respuesta rearma el CEBO y la fase final sigue cerrada', () => {
  const adaptation = createBossAdaptation();
  observeBossAdaptation(adaptation, { outcome: 'success', type: 'DASH' });
  observeBossAdaptation(adaptation, { outcome: 'success', type: 'DASH' });
  const bait = createBossBait();
  armBossBait(bait, adaptation);
  consumeBossBait(bait, 1);

  observeBossAdaptation(adaptation, { outcome: 'success', type: 'AIRE' });
  observeBossAdaptation(adaptation, { outcome: 'success', type: 'AIRE' });
  armBossBait(bait, adaptation);
  assert.equal(bait.armed, true);
  assert.equal(bait.type, 'AIRE');

  const final = createBossAdaptation();
  assert.equal(adaptiveAttackPreference(3, final, 0.2), 'charge');
  for (const phase of [1, 2, 3]) {
    for (const pattern of Object.values(BAIT_PATTERNS[phase])) {
      assert.ok(BOSS_COMBAT_PROFILES[phase].patterns.some((candidate) =>
        candidate.length === pattern.length && candidate.every((kind, i) => kind === pattern[i])
      ));
    }
  }
});


test('phase 19: el CEBO no puede saltarse la protección anti-repetición del director', () => {
  const bait = BAIT_PATTERNS[2].DASH;
  const pattern = chooseBossPattern(2, 1, () => 0, {
    distance: 500,
    vertical: 0,
    hpRatio: 0.8,
    baitPattern: bait,
  });
  assert.notDeepEqual(pattern, bait);
});




test('phase 21: la memoria del encuentro convierte respuestas en ritmo corto o largo', () => {
  const pressure = createBossEncounterMemory();
  observeBossEncounter(pressure, { outcome: 'counter_failed', type: 'DASH' });
  observeBossEncounter(pressure, { outcome: 'bait_trapped', type: 'DASH' });
  assert.equal(encounterPreference(pressure), 'LONG');
  assert.equal(encounterLabel(pressure), 'RITMO · ACELERA');
  assert.equal(encounterSnapshot(pressure).failed, 1);
  assert.equal(encounterSnapshot(pressure).baitTrapped, 1);

  const read = createBossEncounterMemory();
  observeBossEncounter(read, { outcome: 'counter_clean', type: 'AIRE' });
  observeBossEncounter(read, { outcome: 'bait_read', type: 'AIRE' });
  assert.equal(encounterPreference(read), 'SHORT');
  assert.equal(encounterLabel(read), 'RITMO · RESPIRA');
});

test('phase 21: la memoria está acotada y no conserva más de ocho observaciones', () => {
  const state = createBossEncounterMemory();
  for (let i = 0; i < 14; i++) {
    observeBossEncounter(state, {
      outcome: i % 2 ? 'counter_failed' : 'counter_clean',
      type: i % 2 ? 'DASH' : 'AIRE',
    });
  }
  assert.equal(state.history.length, 8);
  assert.ok(state.momentum >= -2 && state.momentum <= 2);
});

test('phase 21: la preferencia de longitud nunca abandona el repertorio autorizado', () => {
  const short = createBossEncounterMemory();
  observeBossEncounter(short, { outcome: 'counter_clean', type: 'AIRE' });
  observeBossEncounter(short, { outcome: 'bait_read', type: 'AIRE' });

  const long = createBossEncounterMemory();
  observeBossEncounter(long, { outcome: 'counter_failed', type: 'DASH' });
  observeBossEncounter(long, { outcome: 'bait_trapped', type: 'DASH' });

  const shortPattern = chooseBossPattern(3, -1, () => 0, { encounterPreference: encounterPreference(short) });
  const longPattern = chooseBossPattern(3, -1, () => 0, { encounterPreference: encounterPreference(long) });
  assert.ok(Array.isArray(shortPattern));
  assert.ok(Array.isArray(longPattern));
  assert.ok(shortPattern.length <= longPattern.length);
  assert.ok(BOSS_COMBAT_PROFILES[3].patterns.some((candidate) => JSON.stringify(candidate) === JSON.stringify(shortPattern)));
  assert.ok(BOSS_COMBAT_PROFILES[3].patterns.some((candidate) => JSON.stringify(candidate) === JSON.stringify(longPattern)));
});



test('matriz runtime: las 30 habilidades pueden castearse y actualizarse sin romper el ciclo', () => {
  const abilityByCharacter = ROSTER.flatMap((character) =>
    character.abilities.map((id) => ({ character: character.id, id }))
  );

  assert.equal(abilityByCharacter.length, 30);
  assert.equal(new Set(abilityByCharacter.map(({ id }) => id)).size, 30);

  for (const { character, id } of abilityByCharacter) {
    clearAbilityFx();
    let emitted = 0;
    const enemy = {
      x: 160, y: 260, w: 34, h: 40, hp: 500, max: 500,
      kind: 'cucaracho', dying: false, invuln: 0, vx: 0, vy: 0,
      stun: 0, flash: 0,
    };
    const p = {
      id: character,
      abilities: [id],
      x: 120, y: 260, w: 28, h: 34,
      facing: 1, evo: 2, speed: 4.8, jumpPower: 10,
      maxJumps: 1, jumps: 0, grounded: true,
      vx: 0, vy: 0, health: 80, maxHealth: 125,
      cds: {}, cdDur: {}, dead: false, xp: 0,
    };
    const game = {
      player: p,
      enemies: [enemy],
      projectiles: [],
      ghosts: [],
      platforms: [{ x: 0, y: 300, w: 900, h: 40 }],
      cam: { x: 0, y: 0 },
      worldW: 1600, worldH: 900,
      t: 0, reduceMotion: true, shake: 0, flash: 0,
      nums: { add() {} },
      fx: { emit() { emitted++; } },
    };

    assert.doesNotThrow(() => useAbility(game, 0), character + '/' + id + ' cast');
    assert.equal(p._cast?.id, id);
    assert.ok((p.cds?.[id] || 0) > 0, character + '/' + id + ' cooldown');

    for (let frame = 0; frame < 72; frame++) {
      game.t++;
      assert.doesNotThrow(() => {
        abilityPreMove(game, { left: false, right: false, jump: false });
        updateAbilityFx(game);
      }, character + '/' + id + ' frame ' + frame);
    }

    assert.ok(
      emitted > 0 || game.projectiles.length > 0 || enemy.hp < enemy.max || p._abilMove || p._armorT > 0,
      character + '/' + id + ' no produjo ninguna señal observable de habilidad'
    );
    clearAbilityFx();
  }
});

test('Kilo segundo ataque: hula tiene ciclo de impacto real y puede dañar dentro del aro', () => {
  const g = {
    player: { id: 'kilo', abilities: ['ukulele', 'hula', 'ohana'], x: 100, y: 100, w: 28, h: 34, facing: 1, evo: 2, health: 80, maxHealth: 125, vy: 0, cds: {}, cdDur: {} },
    enemies: [{ x: 112, y: 100, w: 24, h: 24, hp: 100, max: 100, kind: 'cucaracho', dying: 0, invuln: 0, vy: 0 }],
    projectiles: [],
    nums: { add() {} },
    fx: { emit() {} },
    ghosts: [],
    cam: { x: 0, y: 0 },
    worldW: 1600,
    worldH: 900,
    t: 0,
    reduceMotion: true,
    shake: 0,
  };
  clearAbilityFx();
  useAbility(g, 1);
  const before = g.enemies[0].hp;
  for (let i = 0; i < 12; i++) {
    g.t++;
    updateAbilityFx(g);
  }
  assert.ok(g.enemies[0].hp < before, 'el hula debe producir al menos un impacto');
  clearAbilityFx();
});

test('Kilo hula: refleja proyectiles hostiles y no rebota dos veces el mismo proyectil', () => {
  const reflected = { x: 112, y: 104, w: 8, h: 8, vx: -6, vy: 1, life: 30, dmg: 12, owner: 'enemy' };
  const untouched = { x: 260, y: 260, w: 8, h: 8, vx: -6, vy: 1, life: 30, dmg: 12, owner: 'enemy' };
  const g = {
    player: { id: 'kilo', abilities: ['ukulele', 'hula', 'ohana'], x: 100, y: 100, w: 28, h: 34, facing: 1, evo: 2, health: 80, maxHealth: 125, vy: 0, cds: {}, cdDur: {} },
    enemies: [],
    projectiles: [reflected, untouched],
    nums: { add() {} },
    fx: { emit() {} },
    ghosts: [],
    cam: { x: 0, y: 0 },
    worldW: 1600,
    worldH: 900,
    t: 0,
    reduceMotion: true,
    shake: 0,
  };

  clearAbilityFx();
  useAbility(g, 1);
  g.t = 1;
  updateAbilityFx(g);

  assert.equal(reflected.owner, 'player');
  assert.equal(reflected.reflected, true);
  assert.equal(reflected.vx, 6);
  assert.equal(reflected.vy, -1);
  assert.ok(reflected._hulaReflectUntil > g.t);
  assert.equal(untouched.owner, 'enemy');

  const vx = reflected.vx;
  const vy = reflected.vy;
  g.t = 2;
  updateAbilityFx(g);
  assert.equal(reflected.vx, vx);
  assert.equal(reflected.vy, vy);
  clearAbilityFx();
});

test('Pizza: las tres habilidades ejecutan su efecto y queso no deja el control secuestrado', () => {
  const basePlayer = () => ({
    id: 'pizza', abilities: ['pepperoni', 'cheese', 'oven'], x: 100, y: 100, w: 28, h: 34, facing: 1, evo: 2,
    health: 100, maxHealth: 130, vy: 0, vx: 0, grounded: true, cds: {}, cdDur: {}
  });
  const makeGame = (enemyX = 180) => ({
    player: basePlayer(),
    enemies: [{ x: enemyX, y: 100, w: 24, h: 24, hp: 200, max: 200, kind: 'cucaracho', dying: 0, invuln: 0, vy: 0 }],
    nums: { add() {} },
    fx: { emit() {} },
    ghosts: [],
    cam: { x: 0, y: 0 },
    worldW: 1600,
    worldH: 900,
    platforms: [{ x: 0, y: 300, w: 600, h: 40 }],
    t: 0,
    reduceMotion: true,
    shake: 0,
  });

  for (const [slot, frames] of [[0, 24], [1, 20], [2, 12]]) {
    clearAbilityFx();
    const g = makeGame();
    const before = g.enemies[0].hp;
    useAbility(g, slot);
    for (let i = 0; i < frames; i++) {
      g.t++;
      abilityPreMove(g, { left: false, right: false, jump: false });
      updateAbilityFx(g);
    }
    assert.ok(g.enemies[0].hp < before, 'Pizza slot ' + slot + ' debe producir impacto');
  }

  clearAbilityFx();
  const g = makeGame(220);
  useAbility(g, 1);
  for (let i = 0; i < 8; i++) {
    g.t++;
    abilityPreMove(g, { left: true, right: false, jump: false });
  }
  const xAfterPull = g.player.x;
  for (let i = 0; i < 12; i++) {
    g.t++;
    abilityPreMove(g, { left: true, right: false, jump: false });
  }
  assert.ok(g.player.vx <= 0, 'el agarre de queso debe permitir contramovimiento');
  assert.notEqual(xAfterPull, undefined);
  clearAbilityFx();
});

test('phase 20: el resultado del CEBO cambia el tempo de forma determinista y acotada', () => {
  const read = createBossBaitFeedback();
  beginBossBaitFeedback(read, 'DASH');
  const readResult = resolveBossBaitFeedback(read, { type: 'DASH' }, true);
  assert.deepEqual(readResult, { outcome: 'read', type: 'DASH', tempo: -1, delta: -1 });
  assert.equal(baitFeedbackLabel(read), 'CEBO LEÍDO · RITMO -1');

  const trap = createBossBaitFeedback();
  beginBossBaitFeedback(trap, 'AIRE');
  const trapResult = resolveBossBaitFeedback(trap, null, true);
  assert.deepEqual(trapResult, { outcome: 'trapped', type: 'AIRE', tempo: 1, delta: 1 });
  assert.equal(baitFeedbackLabel(trap), 'CEBO EFICAZ · RITMO +1');

  for (let i = 0; i < 8; i++) {
    beginBossBaitFeedback(trap, 'AIRE');
    resolveBossBaitFeedback(trap, null, true);
  }
  assert.equal(trap.tempo, 2);
  assert.equal(feedbackAttackDelay(18, trap), 12);
  assert.deepEqual(baitFeedbackSnapshot(trap), {
    active: false, attempts: 9, trapped: 9, read: 0, tempo: 2, last: 'trapped'
  });
});

test('phase 20: un CEBO fuera de peligro no altera el tempo', () => {
  const state = createBossBaitFeedback();
  beginBossBaitFeedback(state, 'DISTANCIA');
  const result = resolveBossBaitFeedback(state, null, false);
  assert.deepEqual(result, { outcome: 'neutral', type: 'DISTANCIA', tempo: 0, delta: 0 });
  assert.equal(baitFeedbackLabel(state), '');
  assert.equal(feedbackAttackDelay(18, state), 18);
});
