import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const art = fs.readFileSync('characters/art/cat.js', 'utf8');
const cinematic = fs.readFileSync('systems/supreme-cinema.js', 'utf8');
const evolution = fs.readFileSync('characters/evolution.js', 'utf8');
const abilities = fs.readFileSync('systems/abilities.js', 'utf8');

test('V51 Michi five-form local moon effects and four-flourish identity', () => {
  assert.match(art, /function moonSoul\(ctx, pose, form, front\)/);
  assert.match(art, /moonSoul\(ctx, safe, f, false\)/);
  assert.match(art, /moonSoul\(ctx, safe, f, true\)/);
  assert.match(art, /pose\.flourishN % 4/);
  const local = art.split('function moonSoul(')[1].split('function draw(')[0];
  assert.doesNotMatch(local, /Math\.random|setTimeout|setInterval|requestAnimationFrame/);
});
test('V51 Michi eclipse identity preserves ability and cinematic', () => {
  assert.match(abilities, /ECLIPSE DE NUEVE VIDAS/);
  assert.match(abilities, /OVILLO SOMBRA/);
  assert.match(cinematic, /if\(id==="cat"\) return/);
  assert.match(evolution, /bg:"#120b27"/);
});
