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

test('V51 eclipse U renders nine independent moon marks', () => {
  assert.match(abilities, /for\(let i=0;i<9;i\+\+\)/);
  assert.match(abilities, /f\.mode==="cat"/);
  assert.match(cinematic, /const lives=seg\(k,\.24,\.69\)/);
  assert.match(cinematic, /i<9;i\+\+/);
});

test('V51 Shadow Step is a bounded hand-drawn afterimage', () => {
  assert.match(art, /const shadowStep = state === "cast"/);
  assert.match(art, /if \(shadowStep\)/);
  assert.match(art, /const x = -21 - i \* 11 - k \* 9/);
  assert.match(art, /fl > \.45 \? "happy"/);
});

test('V51 moon evolution and claw crescents retain story identity', () => {
  assert.match(evolution, /Nueve vidas, un solo guardián/);
  assert.match(cinematic, /const claws=seg\(k,\.34,\.65\)/);
  assert.match(cinematic, /i<3;i\+\+/);
});

test('V52 Michi attack, victory and cache release guards', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sw = fs.readFileSync('sw.js', 'utf8');
  assert.match(art, /Three readable claw trails/);
  assert.match(art, /Victory reads as a feline leap/);
  assert.match(art, /ctx\.quadraticCurveTo\(38 \+ shift/);
  assert.match(sw, /const VERSION = "ohana-268"/);
  assert.match(index, /game\.js\?v=ohana-268/);
  assert.match(index, /sw\.js\?v=ohana-268/);
  assert.doesNotMatch(index, /ohana-241/);
});
