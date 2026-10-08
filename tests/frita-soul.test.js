import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const art = fs.readFileSync("characters/art/frita.js", "utf8");
const cinema = fs.readFileSync("systems/supreme-cinema.js", "utf8");
const story = fs.readFileSync("systems/supreme-storyboards.js", "utf8");
const evolution = fs.readFileSync("characters/evolution.js", "utf8");
const visual = fs.readFileSync("tests/browser/visual-regression.mjs", "utf8");

test("V54 Frita's fourth idle is a timed salt catch drawn on her spine", () => {
  assert.match(art, /flourishN \|\| 0\) % 4/);
  assert.match(art, /cuarta microescena: lanza una pizca de sal/);
  assert.match(art, /function drawSaltCatch\(ctx, tip, k, form\)/);
  assert.match(art, /if \(P.gag > 0\) drawSaltCatch\(ctx, tip, P.gag, f\)/);
  const gag = art.split("function drawSaltCatch(")[1].split("function withForkLen")[0];
  assert.doesNotMatch(gag, /Math\.random|setTimeout|setInterval|requestAnimationFrame/);
  assert.match(gag, /ctx\.save\(\)/);
  assert.match(gag, /ctx\.restore\(\)/);
});

test("V54 Frita slide has a bounded signature ketchup wake", () => {
  assert.match(art, /function speedLines\(ctx, R, sp, t, w, form\)/);
  assert.match(art, /Signature ketchup-red wake/);
  assert.match(art, /"#e83b2d"/);
  assert.match(art, /if \(P.lying === "slide"\) speedLines\(ctx, R, sp, t, w, f\)/);
});

test("V54 U remains compatible but has four distinct beats", () => {
  assert.match(story, /gag:"potato-catch"/);
  assert.match(story, /PATATA → CAPTURA → KÉTCHUP → CRUJIDO/);
  assert.match(cinema, /const catchK=seg\(k,\.42,\.63\)/);
  assert.match(cinema, /const swirl=seg\(k,\.49,\.77\)/);
  assert.match(cinema, /const fry=seg\(k,\.70,\.95\)/);
  assert.match(cinema, /if\(id==="frita"\) return k<\.24\?"idle":k<\.77\?"attack":"victory"/);
  assert.match(evolution, /Tres crujidos se hacen uno/);
});

test("V54 five Frita forms receive real Chromium screenshot audit", () => {
  assert.match(visual, /01f-frita-crispy-form-/);
  assert.match(visual, /image\.pixels>10/);
  assert.match(visual, /data-hero'\),'frita'/);
});
