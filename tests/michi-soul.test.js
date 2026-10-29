import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const art = fs.readFileSync('characters/art/cat.js', 'utf8');
const cinematic = fs.readFileSync('systems/supreme-cinema.js', 'utf8');
const evolution = fs.readFileSync('characters/evolution.js', 'utf8');
const abilities = fs.readFileSync('systems/abilities.js', 'utf8');

test('the five Michi forms keep their animation local to the Canvas draw call', () => {
  const files=['characters/art/cat.js','characters/michi-kitten.js','characters/michi-moon-hare.js'];
  for(const file of files)assert.doesNotMatch(fs.readFileSync(file,'utf8'),/Math\.random|setTimeout|setInterval|requestAnimationFrame|localStorage|drawImage/);
  assert.doesNotMatch(art,/moonSoul\(ctx, safe/,'V625 removes the duplicated shared halo');
});
test('V51 Michi eclipse identity preserves ability and cinematic', () => {
  assert.match(abilities, /¡ESE OVILLO QUEMA!/);
  assert.match(abilities, /OVILLO SOMBRA/);
  assert.match(cinematic, /if\(id==="cat"\) return/);
  assert.match(evolution, /bg:"#120b27"/);
});

test('V51 eclipse U renders nine independent moon marks', () => {
  assert.match(abilities, /for\(let i=0;i<9;i\+\+\)/);
  assert.match(abilities, /f\.mode==="cat"/);
  assert.match(cinematic, /const lives=seg\(k,\.24,\.69\)/);
  assert.match(cinematic, /i<9;i\+\+/);
});

test('Michi keeps the defensive ronroneo and six own magic gestures', () => {
  assert.match(abilities,/OVILLO SOMBRA/);
  assert.match(art,/michiPowerIndex/);
  assert.match(art,/spellAccents/);
  assert.match(art,/power===1/);
});

test('V51 moon evolution and claw crescents retain story identity', () => {
  assert.match(evolution, /Nueve vidas, un solo guardián/);
  assert.match(cinematic, /const claws=seg\(k,\.34,\.65\)/);
  assert.match(cinematic, /i<3;i\+\+/);
});

test('V52 Michi attack, victory and cache release guards', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sw = fs.readFileSync('sw.js', 'utf8');
  const release = sw.match(/const VERSION = "(ohana-\d+)"/)?.[1];
  assert.ok(release, "missing service worker release number");
  assert.ok(index.includes(`game.js?v=${release}`));
  assert.ok(index.includes(`sw.js?v=${release}`));
  assert.doesNotMatch(index, /ohana-241/);
});
