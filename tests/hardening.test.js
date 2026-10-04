import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

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
  assert.match(sw, new RegExp("\\./engine/input\\.js\\?v=" + version.replace("-", "\\-")));
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
