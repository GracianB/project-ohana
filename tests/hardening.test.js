import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ParticleSystem } from '../engine/particles.js';

test('game runtime: RNG centralizado e hitstop del boss endurecido', () => {
  const source = fs.readFileSync('./game.js', 'utf8');
  assert.match(source, /rng:\s*Math\.random/);
  assert.equal((source.match(/Math\.random\(/g) || []).length, 0, 'game.js debe usar game.rng()');
  assert.match(source, /game\.rng\(\)/);
  assert.match(source, /game\.hitstop\s*=\s*Math\.min\(8,/);
  assert.match(source, /hitStop\(e\.boss \? \(crit \? 5 : 3\) : \(crit \? 8 : 4\)\)/);
});

test('input y Service Worker no conservan movimiento horizontal fantasma', () => {
  const input = fs.readFileSync('./engine/input.js', 'utf8');
  const sw = fs.readFileSync('./sw.js', 'utf8');
  const game = fs.readFileSync('./game.js', 'utf8');
  const index = fs.readFileSync('./index.html', 'utf8');
  assert.match(input, /KEYBOARD_STALE_MS\s*=\s*1200/);
  assert.match(input, /keyboardWatchdog/);
  assert.match(input, /listen\(target, "focus", reset\)/);
  const versionMatch = sw.match(/const VERSION = "(ohana-\d+)"/);
  assert.ok(versionMatch, 'sw.js debe declarar una versión OHANA válida');
  const version = versionMatch[1];
  assert.match(sw, /\.\/engine\/input\.js\?v=" \+ VERSION/);
  assert.match(sw, /const isScript = url\.pathname\.endsWith\("\.js"\)/);
  assert.ok(index.includes("?v=" + version), 'index.html debe usar la misma versión de caché');
  assert.match(game, /Math\.sign\(p\.vx \|\| 0\) \* Math\.min\(64/);
});


test('la experiencia final no conserva terminología divina genérica ni identificadores antiguos', () => {
  const files = [
    './characters/roster.js',
    './characters/evolution.js',
    './characters/draw.js',
    './systems/evo-cinema.js',
    './engine/audio.js',
    './index.html',
    './README.md',
    './PROGRESS.md',
    './IMPROVEMENTS.md',
  ];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const legacyTerm = new RegExp('\\b' + ['G', 'O', 'D'].join('') + '\\b', 'i');
    assert.doesNotMatch(source, legacyTerm, file + ' conserva terminología divina antigua');
  }
  assert.match(fs.readFileSync('./engine/audio.js', 'utf8'), /evoFinalFanfare/);
});

 
test('phase 16: boss read y punish quedan aislados y deterministas', () => {
  const boss = fs.readFileSync('./systems/boss-nido.js', 'utf8');
  const behavior = fs.readFileSync('./systems/boss-behavior.js', 'utf8');
  const game = fs.readFileSync('./game.js', 'utf8');
  const sw = fs.readFileSync('./sw.js', 'utf8');
  assert.match(boss, /observeBossBehavior/);
  assert.match(boss, /reactiveAttackPreference/);
  assert.match(boss, /punishAwarded/);
  assert.doesNotMatch(behavior, /Math\.random\(/);
  assert.match(game, /function registerBossPunish\(e\)/);
  assert.match(game, /PUNISH \+"/);
  assert.match(sw, /boss-behavior\.js\?v=" \+ VERSION/);
});

 
test('phase 17: counterplay queda separado de daño e hitbox y usa módulo precacheado', () => {
  const counter = fs.readFileSync('./systems/boss-counterplay.js', 'utf8');
  const boss = fs.readFileSync('./systems/boss-nido.js', 'utf8');
  const sw = fs.readFileSync('./sw.js', 'utf8');
  assert.doesNotMatch(counter, /e\.hp\s*[-+]=/);
  assert.doesNotMatch(counter, /\be\.w\s*=|\be\.h\s*=/);
  assert.match(boss, /startBossThreat/);
  assert.match(boss, /resolveBossThreat/);
  assert.match(boss, /counterBreak/);
  assert.match(sw, /boss-counterplay\.js\?v=" \+ VERSION/);
});


test('phase 18: boss adaptation queda aislado, acotado y precacheado', () => {
  const adaptation = fs.readFileSync('./systems/boss-adaptation.js', 'utf8');
  const boss = fs.readFileSync('./systems/boss-nido.js', 'utf8');
  const combat = fs.readFileSync('./systems/boss-combat.js', 'utf8');
  const sw = fs.readFileSync('./sw.js', 'utf8');
  assert.doesNotMatch(adaptation, /Math\.random\(/);
  assert.doesNotMatch(adaptation, /\.hp\s*[-+]=/);
  assert.doesNotMatch(adaptation, /\.w\s*=|\.h\s*=/);
  assert.match(boss, /adaptiveAttackPreference/);
  assert.match(boss, /observeBossAdaptation/);
  assert.match(combat, /adaptivePreference/);
  assert.match(sw, /boss-adaptation\.js\?v=" \+ VERSION/);
});


test('phase 19: adaptive bait queda aislado y limitado al repertorio del boss', () => {
  const bait = fs.readFileSync('./systems/boss-bait.js', 'utf8');
  const boss = fs.readFileSync('./systems/boss-nido.js', 'utf8');
  const combat = fs.readFileSync('./systems/boss-combat.js', 'utf8');
  const sw = fs.readFileSync('./sw.js', 'utf8');
  assert.doesNotMatch(bait, /Math\.random\(/);
  assert.doesNotMatch(bait, /\.hp\s*[-+]=/);
  assert.doesNotMatch(bait, /\.w\s*=|\.h\s*=/);
  assert.match(boss, /consumeBossBait/);
  assert.match(boss, /baitPattern/);
  assert.match(combat, /baitPattern/);
  assert.match(sw, /boss-bait\.js\?v=" \+ VERSION/);
});


test('phase 19: el HUD solo expone CEBO cuando está realmente armado', () => {
  const game = fs.readFileSync('./game.js', 'utf8');
  const boss = fs.readFileSync('./systems/boss-nido.js', 'utf8');
  assert.match(game, /boss\.bait\?\.armed/);
  assert.match(game, /boss\.adaptationLabel/);
  assert.match(boss, /baitLabel\(e\.bait\)/);
});


test('phase 21: encounter memory queda aislada y acotada', () => {
  const memory = fs.readFileSync('./systems/boss-encounter-memory.js', 'utf8');
  const boss = fs.readFileSync('./systems/boss-nido.js', 'utf8');
  const combat = fs.readFileSync('./systems/boss-combat.js', 'utf8');
  assert.doesNotMatch(memory, /Math\.random\(/);
  assert.doesNotMatch(memory, /\.hp\s*[-+]=/);
  assert.doesNotMatch(memory, /\.w\s*=|\.h\s*=/);
  assert.match(memory, /Math\.max\(-2, Math\.min\(2/);
  assert.match(boss, /createBossEncounterMemory/);
  assert.match(boss, /encounterPreference/);
  assert.match(combat, /context\.encounterPreference/);
});

test('phase 20: bait feedback no puede tocar daño, hitbox ni superar su límite de tempo', () => {
  const feedback = fs.readFileSync('./systems/boss-bait-feedback.js', 'utf8');
  const boss = fs.readFileSync('./systems/boss-nido.js', 'utf8');
  assert.doesNotMatch(feedback, /Math\.random\(/);
  assert.doesNotMatch(feedback, /\.hp\s*[-+]=/);
  assert.doesNotMatch(feedback, /\.w\s*=|\.h\s*=/);
  assert.match(feedback, /Math\.max\(-2, Math\.min\(2/);
  assert.match(boss, /feedbackAttackDelay/);
  assert.match(boss, /resolveBossBaitFeedback/);
});


test('habilidades: Kilo hula tiene updater y Pizza no conserva un bloqueo de movimiento indefinido', () => {
  const abilities = fs.readFileSync('./systems/abilities.js', 'utf8');
  assert.match(abilities, /hula\(g, f, p\)/);
  assert.match(abilities, /f\.pulse % 8 === 0/);
  assert.match(abilities, /S\.pull = \{ e, t: 16, maxT: 16 \}/);
  assert.match(abilities, /id !== "cheese"/);
  assert.match(abilities, /const steer = input\?\.right === input\?\.left/);
});

test('phase 25: abilities elimina RNG y reloj no deterministas del runtime', () => {
  const abilities = fs.readFileSync('./systems/abilities.js', 'utf8');
  assert.doesNotMatch(abilities, /Math\.random\(/);
  assert.doesNotMatch(abilities, /performance\.now\(/);
  assert.match(abilities, /function abilityNow\(game\)/);
  assert.match(abilities, /typeof game\?\.rng === "function"/);
  assert.match(abilities, /MAX_ABILITY_PROJECTILES = 96/);
});


test('phase 26: VFX de pasivos y partículas no consumen RNG global', () => {
  const passives = fs.readFileSync('./systems/passives.js', 'utf8');
  const particles = fs.readFileSync('./engine/particles.js', 'utf8');
  assert.doesNotMatch(passives, /Math\.random\(/);
  assert.doesNotMatch(particles, /Math\.random\(/);
  assert.match(passives, /function vfxUnit\(seed\)/);
  assert.match(particles, /function unit\(seed\)/);
  assert.match(particles, /sequence/);
});

test('phase 26: partículas reproducibles, acotadas y recuperables ante datos corruptos', () => {
  const build = () => {
    const ps = new ParticleSystem();
    ps.emit(120, 80, { count: 10, speed: 3, spread: 2.2, size: 4 });
    ps.emit(120, 80, { count: 6, angle: 1.1, speed: 2, size: 3 });
    return ps.items.map(p => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy, life: p.life, size: p.size }));
  };
  assert.deepEqual(build(), build());

  const ps = new ParticleSystem();
  for (let i = 0; i < 20; i++) ps.emit(i, i, { count: 10 });
  assert.equal(ps.items.length, 72);
  ps.emit(NaN, Infinity, { count: Infinity, speed: NaN, size: NaN, life: NaN, gravity: NaN });
  assert.equal(ps.items.length, 72);
  assert.ok(ps.items.every(p => Object.values(p).every(v => typeof v === 'string' || typeof v === 'boolean' || Number.isFinite(v))));

  ps.clear();
  assert.equal(ps.items.length, 0);
});


test('phase 32: RNG de simulación y VFX permanecen en dominios separados', () => {
  const game = fs.readFileSync('./game.js', 'utf8');
  assert.match(game, /function vfxUnit\(seed\)/);
  assert.match(game, /function vfxRandom\(salt = 0\)/);
  assert.match(game, /vfxRandom\(5\)/);
  assert.match(game, /vfxRandom\(6\)/);
  assert.equal((game.match(/ctx\.translate\(\(game\.rng\(\) - 0\.5\)/g) || []).length, 0);

  const renderStart = game.indexOf('function render()');
  const renderEnd = game.indexOf('function drawMinimap()', renderStart);
  const render = game.slice(renderStart, renderEnd);
  assert.equal((render.match(/game\.rng\(\)/g) || []).length, 0, 'render no debe consumir RNG de simulación');

  const updateStart = game.indexOf('function updatePlayer()');
  const updateEnd = game.indexOf('function tickRam(', updateStart);
  const updatePlayer = game.slice(updateStart, updateEnd);
  assert.equal((updatePlayer.match(/game\.rng\(\)/g) || []).length, 0, 'updatePlayer no debe consumir RNG compartido para VFX');

  const finaleStart = game.indexOf('function tickFinale()');
  const finaleEnd = game.indexOf('function worldClear()', finaleStart);
  const finale = game.slice(finaleStart, finaleEnd);
  assert.equal((finale.match(/game\.rng\(\)/g) || []).length, 0, 'finale no debe consumir RNG compartido para VFX');
});

test('phase 30: el bucle de runtime contiene fallos de simulación y render', () => {
  const game = fs.readFileSync('./game.js', 'utf8');
  assert.match(game, /function containRuntimeFault\(scope, error\)/);
  assert.match(game, /game\.runtimeFaults = Math\.min\(32/);
  assert.match(game, /lastRuntimeFault = String\(scope\)/);
  assert.match(game, /containRuntimeFault\("simulation", error\)/);
  assert.match(game, /containRuntimeFault\("render", error\)/);
  assert.match(game, /input\?\.reset\(\)/);
  assert.match(game, /clock\.reset\(\)/);
  assert.match(game, /paused = true/);
  assert.match(game, /requestAnimationFrame\(loop\)/);
});
 
test('phase 29: runtime integrity guard protege estado crítico y colecciones', () => {
  const game = fs.readFileSync('./game.js', 'utf8');
  const runtime = fs.readFileSync('./systems/runtime.js', 'utf8');
  assert.match(runtime, /export const MAX_RUNTIME_SAFE = Number\.MAX_SAFE_INTEGER/);
  assert.match(runtime, /export function boundedFinite\(value, fallback, min, max\)/);
  assert.match(game, /function sanitizeRuntimeState\(\)/);
  assert.match(game, /sanitizeRuntimeState\(\);/);
  assert.match(game, /game\.score = boundedFinite\(game\.score, 0, 0, MAX_RUNTIME_SAFE\)/);
  assert.match(game, /p\.health = boundedFinite\(p\.health/);
  assert.match(game, /e\.hp = boundedFinite\(e\.hp/);
  assert.match(game, /pr\.dmg = boundedFinite\(pr\.dmg/);
  assert.match(game, /if \(typeof game\.rng !== "function"\) game\.rng = Math\.random/);
  assert.equal((game.match(/game\.score\s*=\s*\(Number\(game\.score\)/g) || []).length, 0);
});

test('phase 28: runtime transitorio acotado y VFX de portales deterministas', () => {
  const game = fs.readFileSync('./game.js', 'utf8');
  const floaters = fs.readFileSync('./systems/floaters.js', 'utf8');
  const portals = fs.readFileSync('./systems/portals.js', 'utf8');

  const runtime = fs.readFileSync('./systems/runtime.js', 'utf8');
  assert.match(runtime, /MAX_RUNTIME_PROJECTILES\s*=\s*128/);
  assert.match(runtime, /MAX_RUNTIME_GHOSTS\s*=\s*48/);
  assert.match(runtime, /MAX_RUNTIME_ORBS\s*=\s*64/);
  assert.match(runtime, /function pushRuntime\(list, item, max\)/);
  assert.equal((game.match(/game\.projectiles\.push\(/g) || []).length, 0);
  assert.equal((game.match(/game\.ghosts\.push\(/g) || []).length, 0);
  assert.equal((game.match(/game\.orbs\.push\(/g) || []).length, 0);

  assert.match(floaters, /MAX_FLOATERS\s*=\s*96/);
  assert.match(floaters, /Number\.isFinite\(Number\(x\)\)/);

  assert.doesNotMatch(portals, /Math\.random\(/);
  assert.doesNotMatch(portals, /performance\.now\(/);
  assert.match(portals, /function unit\(seed\)/);
  assert.match(portals, /same room|misma sala/i);
});

test('phase 28: Floaters conserva un presupuesto fijo y rechaza coordenadas corruptas', async () => {
  const { Floaters } = await import('../systems/floaters.js');
  const f = new Floaters();
  for (let i = 0; i < 140; i++) f.add(i, i, 'x', '#fff', false);
  assert.equal(f.items.length, 96);
  f.add(NaN, 10, 'bad', '#fff', false);
  f.add(10, Infinity, 'bad', '#fff', false);
  assert.equal(f.items.length, 96);
  assert.ok(f.items.every(v => Number.isFinite(v.x) && Number.isFinite(v.y)));
});

test('phase 27: game runtime centraliza mutaciones de combate y evita contaminación numérica', () => {
  const game = fs.readFileSync('./game.js', 'utf8');
  assert.match(game, /function finiteOr\(value, fallback = 0\)/);
  assert.match(game, /function damageEnemy\(e, amount\)/);
  assert.match(game, /function damagePlayer\(p, amount\)/);
  assert.match(game, /function addPlayerXp\(p, amount\)/);
  assert.match(game, /function addScore\(amount\)/);
  assert.match(game, /function addKill\(\)/);
  assert.equal((game.match(/\.hp\s*[-+]=/g) || []).length, 0);
  assert.equal((game.match(/\.health\s*[-+]=/g) || []).length, 0);
  assert.equal((game.match(/\.xp\s*\+=/g) || []).length, 0);
  assert.equal((game.match(/game\.score\s*\+=/g) || []).length, 0);
  assert.equal((game.match(/game\.kills\+\+/g) || []).length, 0);
});


test('phase 33: gameplay determinista y convocatoria del Nido ligada al reloj de simulación', () => {
  const game = fs.readFileSync('./game.js', 'utf8');
  const surprises = fs.readFileSync('./systems/surprises.js', 'utf8');
  const rain = fs.readFileSync('./systems/rain.js', 'utf8');

  assert.match(surprises, /function gameRandom\(game\)/);
  const surpriseGameplay = surprises.slice(surprises.indexOf('onMakeFoe(e, roomId, game)'), surprises.indexOf('onEnemyKilled(e, game)'));
  assert.equal((surpriseGameplay.match(/Math\.random\(/g) || []).length, 0, 'sorpresas de gameplay no deben usar Math.random directamente');
  assert.match(surpriseGameplay, /gameRandom\(game\)/);

  assert.match(rain, /function gameRandom\(game\)/);
  const rainGameplay = rain.slice(rain.indexOf('_inRoom = true'), rain.indexOf('const p = game.player'));
  assert.equal((rainGameplay.match(/Math\.random\(/g) || []).length, 0, 'el retraso jugable de lluvia no debe usar Math.random directamente');
  assert.match(rainGameplay, /gameRandom\(game\)/);

  const worldClearStart = game.indexOf('function worldClear()');
  const worldClearEnd = game.indexOf('function nearUpDoor(', worldClearStart);
  const worldClear = game.slice(worldClearStart, worldClearEnd);
  assert.doesNotMatch(worldClear, /setTimeout\(/, 'la llegada del boss debe depender de ticks');
  assert.match(worldClear, /game\.summonDelay = 132/);
  assert.match(game, /function tickWorldSummon\(\)/);
  assert.match(game, /tickWorldSummon\(\);/);
});


test('phase 34: las mutaciones críticas pasan por la capa global compartida', () => {
  const mutations = fs.readFileSync('./systems/mutations.js', 'utf8');
  const files = [
    './systems/abilities.js',
    './systems/magic.js',
    './systems/surprises.js',
    './systems/passives.js',
    './systems/boss-nido.js',
    './engine/foes.js',
  ];
  const sources = files.map((file) => fs.readFileSync(file, 'utf8'));
  for (const source of sources) {
    assert.match(source, /mutations\.js/);
    assert.doesNotMatch(source, /\.hp\s*[-+]=/);
    assert.doesNotMatch(source, /\.health\s*[-+]=/);
    assert.doesNotMatch(source, /\.xp\s*\+=/);
    assert.doesNotMatch(source, /game\.score\s*[-+]=/);
  }
  assert.match(mutations, /function damageEnemy/);
  assert.match(mutations, /function healPlayer/);
  assert.match(mutations, /function damagePlayer/);
  assert.match(mutations, /function addPlayerXp/);
  assert.match(mutations, /function addScore/);
  assert.match(mutations, /function addKill/);
  assert.match(mutations, /function addCombo/);
  assert.match(mutations, /function scaleEnemyHealth/);
  assert.match(mutations, /Number\.MAX_SAFE_INTEGER/);
});


test('phase 35: presupuesto runtime compartido y compactación sin crecimiento', async () => {
  const runtime = await import('../systems/runtime.js');
  const list = [];
  for (let i = 0; i < runtime.MAX_RUNTIME_BOLTS + 20; i++) {
    runtime.pushRuntime(list, { id: i }, runtime.MAX_RUNTIME_BOLTS);
  }
  assert.equal(list.length, runtime.MAX_RUNTIME_BOLTS);
  assert.equal(list[0].id, 20);

  list.push(null, 0, undefined, { id: 100 });
  runtime.compactRuntimeList(list, runtime.MAX_RUNTIME_BOLTS);
  assert.equal(list.length, runtime.MAX_RUNTIME_BOLTS);
  assert.equal(list.at(-1).id, 100);

  const caps = [
    runtime.MAX_RUNTIME_ENEMIES,
    runtime.MAX_RUNTIME_PROJECTILES,
    runtime.MAX_RUNTIME_GHOSTS,
    runtime.MAX_RUNTIME_ORBS,
    runtime.MAX_RUNTIME_BOLTS,
    runtime.MAX_RUNTIME_SLASHES,
  ];
  assert.ok(caps.every((value) => Number.isInteger(value) && value > 0));
  assert.equal(runtime.MAX_RUNTIME_SAFE, Number.MAX_SAFE_INTEGER);
  assert.equal(runtime.boundedFinite(NaN, 7, 0, 10), 7);
  assert.equal(runtime.boundedFinite(99, 7, 0, 10), 10);
});

test('phase 37: el harness E2E queda aislado del dominio publicado', () => {
  const game = fs.readFileSync('./game.js', 'utf8');
  assert.match(game, /const e2eEnabled = location\.hostname === "127\.0\.0\.1" && e2eParams\.has\("e2e"\)/);
  const hookStart = game.indexOf('if (e2eEnabled) {');
  const hookEnd = game.indexOf('bindDialogs({ document', hookStart);
  assert.ok(hookStart > 0 && hookEnd > hookStart);
  const hook = game.slice(hookStart, hookEnd);
  assert.match(hook, /window\.__OHANA_E2E/);
});


test('phase 38: combo también queda dentro del firewall global', () => {
  const game = fs.readFileSync('./game.js', 'utf8');
  const mutations = fs.readFileSync('./systems/mutations.js', 'utf8');
  assert.match(game, /function addCombo\(amount = 1\)/);
  assert.match(game, /addCombo\(1\);/);
  assert.equal((game.match(/game\.combo\s*\+=/g) || []).length, 0);
  assert.match(mutations, /function addCombo/);
});

test('phase 39: start() no hereda estado transitorio de una sesión anterior', () => {
  const game = fs.readFileSync('./game.js', 'utf8');

  const start = game.indexOf('function start(def)');
  const evolve = game.indexOf('function evolve(', start);

  assert.ok(start > 0);
  assert.ok(evolve > start);

  const block = game.slice(start, evolve);

  assert.match(block, /t = 0;/);
  assert.match(block, /paused = false;/);
  assert.match(block, /game\.hitstop = 0;/);
  assert.match(block, /game\.camPunch = 0;/);
  assert.match(block, /game\.fading = 0;/);
  assert.match(block, /game\.flash = 0;/);
  assert.match(block, /game\.doorWait = null;/);
  assert.match(block, /game\.doorHold = 0;/);
  assert.match(block, /game\.finale = null;/);
  assert.match(block, /game\.summonDelay = 0;/);
  assert.match(block, /game\.roomId = "hub";/);
  assert.match(block, /game\.won = false;/);
  assert.match(block, /game\.summoned = false;/);
  assert.match(block, /game\.runtimeFaults = 0;/);
  assert.match(block, /game\.lastRuntimeFault = "";/);
  assert.match(block, /game\.cam\.x = 0;/);
  assert.match(block, /game\.cam\.y = 0;/);
});

test('phase 40: el Service Worker cierra el grafo JS de runtime y mantiene la versión coherente', () => {
  const sw = fs.readFileSync('./sw.js', 'utf8');
  const index = fs.readFileSync('./index.html', 'utf8');
  const runtimeDirs = ['./characters', './engine', './systems', './worlds'];
  const runtimeFiles = ['./game.js'];

  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = dir + '/' + entry.name;
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && entry.name.endsWith('.js')) runtimeFiles.push(path);
    }
  };

  for (const dir of runtimeDirs) walk(dir);

  const versionMatch = sw.match(/const VERSION = "(ohana-\d+)"/);
  assert.ok(versionMatch, 'sw.js debe declarar una versión OHANA válida');
  const version = versionMatch[1];
  const precache = new Set(
    [...sw.matchAll(/"\.\/([^"]+\.js)\?v=" \+ VERSION/g)].map((match) => match[1])
  );

  assert.ok(index.includes('?v=' + version), 'index.html debe usar la versión declarada por sw.js');

  for (const file of runtimeFiles.sort()) {
    const normalized = file.replace(/^\.\//, '');
    assert.ok(precache.has(normalized), 'módulo JS fuera del precache: ' + normalized);
  }

  assert.ok(precache.size >= runtimeFiles.length, 'el precache debe cubrir al menos todo el runtime JS');
});

test('phase 41: Cuerno cierra el contrato de render pintado con cuatro poses', () => {
  const sprites = fs.readFileSync('./characters/sprites.js', 'utf8');
  const poses = ['idle', 'run', 'jump', 'atk'];

  assert.match(sprites, /isCuernoPaint/);
  assert.match(sprites, /cuerno-\(idle\|run\|jump\|atk\)/);

  for (const pose of poses) {
    const file = './assets/sprites/bodies/cuerno-' + pose + '.svg';
    assert.equal(fs.existsSync(file), true, 'falta sprite pintado de Cuerno: ' + file);
    const source = fs.readFileSync(file, 'utf8');
    assert.match(source, /^<svg[\s\S]*<\/svg>$/);
    assert.match(source, /<defs>/);
    assert.match(source, /gradient/i);
  }

  assert.doesNotMatch(sprites, /cuerno-(idle|run|jump|atk)\.png/);
});

test('phase 42: offline precache no tiene duplicados y mantiene cobertura total', () => {
  const sw = fs.readFileSync('./sw.js', 'utf8');
  const index = fs.readFileSync('./index.html', 'utf8');
  const precacheBlock = sw.slice(sw.indexOf('const PRECACHE = ['), sw.indexOf('];', sw.indexOf('const PRECACHE = [')));
  const entries = [...precacheBlock.matchAll(/"\.\/([^"]+)(?:\?v=" \+ VERSION)?"/g)].map((match) => match[1]).filter(Boolean);

  const versionMatch = sw.match(/const VERSION = "(ohana-\d+)"/);
  assert.ok(versionMatch, 'sw.js debe declarar una versión OHANA válida');
  const version = versionMatch[1];

  assert.ok(index.includes('?v=' + version), 'index.html debe usar la versión declarada por sw.js');

  const duplicates = entries.filter((value, index, all) => all.indexOf(value) !== index);
  assert.deepEqual([...new Set(duplicates)].sort(), [], 'PRECACHE contiene entradas duplicadas');

  const runtimeDirs = ['./characters', './engine', './systems', './worlds'];
  const runtimeFiles = ['./game.js'];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const path = dir + '/' + entry.name;
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && entry.name.endsWith('.js')) runtimeFiles.push(path);
    }
  };
  for (const dir of runtimeDirs) walk(dir);

  const jsPrecache = new Set(
    [...sw.matchAll(/"\.\/([^"]+\.js)\?v=" \+ VERSION/g)].map((match) => match[1])
  );
  for (const file of runtimeFiles.sort()) {
    const normalized = file.replace(/^\.\//, '');
    assert.ok(jsPrecache.has(normalized), 'módulo JS fuera del precache: ' + normalized);
  }
  assert.ok(jsPrecache.size >= runtimeFiles.length, 'el precache JS debe cubrir todo el runtime');
});


test('phase 43: el grafo ESM local resuelve todas las importaciones relativas', () => {
  const runtimeDirs = ['./characters', './engine', './systems', './worlds'];
  const files = ['./game.js'];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const path = dir + '/' + entry.name;
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && entry.name.endsWith('.js')) files.push(path);
    }
  };
  for (const dir of runtimeDirs) walk(dir);

  const all = new Set(files.map((file) => file.replace(/^\.\//, '')));
  const missing = [];
  const edges = [];

  const resolveLocal = (from, spec) => {
    const clean = spec.split(/[?#]/, 1)[0];
    const base = path.posix.normalize(path.posix.join(path.posix.dirname(from), clean));
    const candidates = [
      base,
      base + '.js',
      base.replace(/\/$/, '') + '/index.js',
    ];
    return candidates.find((candidate) => all.has(candidate)) || null;
  };

  for (const file of files) {
    const source = fs.readFileSync('./' + file.replace(/^\.\//, ''), 'utf8');
    const regexes = [
      /\b(?:from|import)\s*(?:\(\s*)?["']([^"']+)["']/g,
      /\bexport\s+(?:\*\s+)?from\s*["']([^"']+)["']/g,
    ];
    for (const regex of regexes) {
      let match;
      while ((match = regex.exec(source))) {
        const spec = match[1];
        if (!spec.startsWith('.')) continue;
        const target = resolveLocal(file, spec);
        edges.push([file, spec, target]);
        if (!target) missing.push(file + ' -> ' + spec);
      }
    }
  }

  assert.ok(edges.length > 0, 'el grafo ESM no contiene importaciones locales auditables');
  assert.deepEqual(missing, [], 'importaciones ESM locales sin destino');
});


test('phase 44: guardado transaccional, versionado y fallback quedan cerrados', () => {
  const source = fs.readFileSync('./systems/save.js', 'utf8');
  assert.match(source, /SAVE_KEY\s*=\s*"ohana"/);
  assert.match(source, /SAVE_TMP_KEY\s*=\s*"ohana\.tmp"/);
  assert.match(source, /setItem\(SAVE_TMP_KEY, raw\)/);
  assert.match(source, /setItem\(SAVE_KEY, raw\)/);
  assert.match(source, /raw\.v != null && raw\.v !== 2/);
  assert.match(source, /return parse\(store\.getItem\(SAVE_TMP_KEY\)\)/);
});


test('phase 45: ciclo de vida de entrada resetea teclado en pérdida de foco y página', () => {
  const source = fs.readFileSync('./engine/input.js', 'utf8');
  assert.match(source, /listen\(target, "blur", reset\)/);
  assert.match(source, /listen\(target, "focus", reset\)/);
  assert.match(source, /listen\(target, "pagehide", reset\)/);
  assert.match(source, /listen\(document, "visibilitychange", reset\)/);
  assert.match(source, /KEYBOARD_STALE_MS\s*=\s*1200/);
  assert.match(source, /releasePointerSources/);
});
