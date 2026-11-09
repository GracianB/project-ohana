import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { drawDragonBoss } from '../systems/dragon-boss.js';
import { createDinoBoss, drawDinoBoss } from '../systems/dino-boss.js';

// Record real Canvas drawing calls without requiring a browser or mutating game state.
function canvasTrace(draw) {
  const ops = [];
  const grad = () => ({ addColorStop: (...args) => ops.push(['stop', ...args]) });
  const ctx = new Proxy({}, {
    get(_target, property) {
      if (property === 'canvas') return { width: 1280, height: 720 };
      if (property === 'createLinearGradient' || property === 'createRadialGradient')
        return (...args) => { ops.push([property, ...args]); return grad(); };
      if (property === 'measureText') return () => ({ width: 100 });
      if (typeof property === 'symbol') return undefined;
      return (...args) => {
        for (const value of args) if (typeof value === 'number')
          assert.ok(Number.isFinite(value), 'Canvas ' + property + ' uses nonfinite coordinate');
        ops.push([property, ...args]);
      };
    },
    set(_target, property, value) { ops.push(['set', property, value]); return true; }
  });
  draw(ctx);
  assert.equal(ops.filter(op => op[0] === 'save').length,
    ops.filter(op => op[0] === 'restore').length, 'unbalanced Canvas state');
  return ops;
}

test('Dragon boss stays visually static in reduced motion, with tactical warnings preserved', () => {
  const boss = {
    _dragonBoss: true, x: 8500, y: 1034, w: 124, h: 100,
    hp: 320, max: 480, telegraph: true,
    _igneousDragon: { phase: 'warn', tier: 3, attack: 2, aim: 1, exposed: false }
  };
  const snapshot = JSON.stringify(boss);
  const render = (tick, quiet) => canvasTrace(ctx =>
    drawDragonBoss(ctx, boss, { x: 8100, y: 0 }, tick, quiet));
  const quietStart = render(0, true);
  assert.deepEqual(render(113, true), quietStart);
  assert.notDeepEqual(render(113, false), render(0, false),
    'normal animation should remain alive');
  assert.ok(quietStart.length > 100, 'body and warning artwork must still render');
  assert.equal(JSON.stringify(boss), snapshot, 'drawing must not mutate combat state');
});

test('Dino boss still honors existing reduced-motion contract', () => {
  const boss = createDinoBoss((x, y) => ({ x, y, invuln: 0, stun: 0 }));
  boss._stoneColossus.phase = 'warn';
  boss._stoneColossus.tier = 2;
  boss._stoneColossus.stomp = 14;
  boss.telegraph = true;
  const render = (tick, quiet) => canvasTrace(ctx =>
    drawDinoBoss(ctx, boss, { x: boss.x - 200, y: 0 }, tick, quiet));
  assert.deepEqual(render(100, true), render(0, true));
  assert.ok(render(100, false).length > 100);
});

test('Dragon preference is forwarded from gameplay and peer beacons stay visible without animation', () => {
  const game = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
  const coop = readFileSync(new URL('../systems/online-coop.js', import.meta.url), 'utf8');
  assert.match(game,
    /else if\(e\._dragonBoss\)drawDragonBoss\(ctx,e,game\.cam,t,game\.reduceMotion\|\|reduceMotion\)/);
  assert.match(coop, /if \(offscreen\) \{/);
  assert.doesNotMatch(coop, /if \(offscreen && !game\.reduceMotion\)/);
});
