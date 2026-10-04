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
  assert.match(particles, /function unit\\(seed\\)/);
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
