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
