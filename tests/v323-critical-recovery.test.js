import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as abilities from '../systems/abilities.js';

const abilitiesSource = readFileSync(new URL('../systems/abilities.js', import.meta.url), 'utf8');
const progressSource = readFileSync(new URL('../PROGRESS.md', import.meta.url), 'utf8');

// V323 recovery: a purported "complete restore" accidentally replaced ~3,700
// source lines with a short preface and a placeholder comment.
// Guard the public API, file integrity and hero-specific gameplay together.
test('core ability API consumed by game.js is actually exported', () => {
  for (const name of [
    'ABILITY_DEFS', 'useAbility', 'drawProjectile', 'drawSlash',
    'drawBolt', 'supremeOf', 'specialOf', 'registerCombatAction',
    'updateAbilityFx', 'clearAbilityFx', 'drawAbilityFx', 'hitEnemy'
  ]) {
    assert.ok(name in abilities, `missing abilities export: ${name}`);
  }
  for (const name of [
    'useAbility', 'drawProjectile', 'drawSlash', 'drawBolt',
    'supremeOf', 'specialOf', 'registerCombatAction',
    'updateAbilityFx', 'clearAbilityFx', 'drawAbilityFx', 'hitEnemy'
  ]) {
    assert.equal(typeof abilities[name], 'function', `${name} must be a function`);
  }
});

test('abilities.js cannot be committed as a stub or truncated restore', () => {
  assert.ok(abilitiesSource.length > 30000, 'abilities.js is unexpectedly short; verify full module or an intentional modularization');
  assert.doesNotMatch(abilitiesSource, /FULL_CONTENT_PLACEHOLDER|PLACEHOLDER_WILL_BE_REPLACED|el resto del archivo original se mantiene/i);
  assert.match(abilitiesSource, /function castSupreme\(/);
  assert.match(abilitiesSource, /function updateAbilityFx\(/);
  assert.match(abilitiesSource, /function drawProjectile\(/);
});

test('original six hero U contracts remain until issue #318 is fixed with equivalent gameplay and acceptance tests', () => {
  const beginning = abilitiesSource.indexOf('function castSupreme(');
  const end = abilitiesSource.indexOf('export function clearAbilityFx(');
  assert.ok(beginning >= 0 && end > beginning, 'complete supreme implementation is required');
  const supreme = abilitiesSource.slice(beginning, end);
  for (const hero of ['dragon', 'dino', 'frita', 'pizza', 'yomi', 'cuerno']) {
    assert.ok(supreme.includes(`p.id === "${hero}"`), `missing supreme branch: ${hero}`);
  }
  assert.match(supreme, /DINO_FX\.castUltimate\(game,p,enemies,dmg,def\.color\)/);
  assert.match(supreme, /const execute=!e\.boss/);
  assert.match(supreme, /_auroraSleepT/);
  assert.match(supreme, /const launchTargets = p\.id === "frita" \? selectFritaFieldTargets\(enemies,cx\(p\),cy\(p\)\) :/);
  assert.match(supreme, /\(p\.id === "dragon" \|\| p\.id === "pizza"\) \? \[\] : enemies/);
  assert.match(supreme, /kind:"supremeLaunch",mode:"dragon"/);
  assert.match(supreme, /kind:"supremeLaunch",mode:"pizza"/);
  assert.match(abilitiesSource, /supremeLaunch\(g,f,p\)\{/);
  assert.match(abilitiesSource, /supremeLaunch\(ctx,f,cam,t,g\)\{/);
  assert.match(supreme, /startFamilyDuet\(game,power\*pw\(p\)\*uExpPower\(p\),p\.id==="dino"\?\[\]:launchTargets,chosen\)/);
  assert.match(supreme, /if\(dinoLaunch\)dinoLaunch\.duet=game\._familyDuet/);
});

test('OHANA progress history is not a placeholder or one-line replacement', () => {
  assert.ok(progressSource.length > 20000, 'PROGRESS.md appears truncated');
  assert.match(progressSource, /OHANA V322/);
  assert.match(progressSource, /V315/);
  assert.doesNotMatch(progressSource, /PLACEHOLDER_WILL_BE_REPLACED|FULL_CONTENT_PLACEHOLDER/);
});
