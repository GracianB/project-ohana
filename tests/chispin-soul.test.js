import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const art = fs.readFileSync('characters/art/pikachu.js', 'utf8');
const abilities = fs.readFileSync('systems/abilities.js', 'utf8');
const cinema = fs.readFileSync('systems/supreme-cinema.js', 'utf8');
const evolution = fs.readFileSync('characters/evolution.js', 'utf8');

test('V50 Chispín has four unique idle flourishes and bounded storm layers', () => {
  assert.match(art, /pose\.flourishN % 4/);
  assert.match(art, /function stormSoul\(ctx, pose, f, o, front\)/);
  assert.match(art, /stormSoul\(ctx, pose, f, o, false\)/);
  assert.match(art, /stormSoul\(ctx, pose, f, o, true\)/);
  assert.match(art, /const wall = state === "wall"/);
  assert.match(art, /const charging = state === "cast"/);
  assert.match(art, /const landing = state === "idle"/);
  assert.doesNotMatch(art.slice(art.indexOf('function stormSoul('), art.indexOf('\nfunction draw(', art.indexOf('function stormSoul('))), /setInterval|setTimeout|Math\.random|requestAnimationFrame/);
});

test('V50 Chispín U and evolution preserve bespoke electrical identity', () => {
  assert.match(abilities, /chispin: \{ id: "boltgod", name: "TORMENTA ABSOLUTA"/);
  assert.match(abilities, /const orbit=R\*\(\.61/);
  assert.match(cinema, /if\(id==="chispin"\)/);
  assert.match(cinema, /const crown=seg\(k,\.19,\.56\)/);
  assert.match(evolution, /La corona aurora despierta/);
});
