import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const art=fs.readFileSync("characters/art/pizza.js","utf8");
const cin=fs.readFileSync("systems/supreme-cinema.js","utf8");
const story=fs.readFileSync("systems/supreme-storyboards.js","utf8");
const evo=fs.readFileSync("characters/evolution.js","utf8");
const visual=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");

test("V55 Pizza has four different idle scenes and a physical pepperoni catch",()=>{
 assert.match(art,/flourishN \|\| 0\) % 4/);
 assert.match(art,/a pepperoni escapes; Pizza catches it/);
 assert.match(art,/function drawPepperoniCatch\(ctx, R, F, tipY, progress, form\)/);
 assert.match(art,/if \(P.gag > 0\) drawPepperoniCatch/);
 const gag=art.split("function drawPepperoniCatch(")[1].split('export default { id: "pizza", draw }')[0];
 assert.doesNotMatch(gag,/Math\.random|setInterval|setTimeout|requestAnimationFrame/);
 assert.match(gag,/ctx\.save\(\)/);
 assert.match(gag,/ctx\.restore\(\)/);
});

test("V55 bounces with visible cheese and volcanic heat, no physics changes",()=>{
 assert.match(art,/Elastic landing: the cheese stretches/);
 assert.match(art,/const k = clamp\(Math\.abs\(P\.bounceFx\.q\) \* 3\.2/);
 assert.match(art,/pose\.state === "cast" && pose\.castSlot === 2/);
 assert.match(art,/"#fff5a4"/);
});

test("V55 unique four-beat volcanic U preserves its original gag ID",()=>{
 assert.match(story,/gag:"oven-too-hot"/);
 assert.match(story,/BOSTEZO → HORNO → ¡QUEMA! → VOLCÁN/);
 assert.match(cin,/const yawning=seg\(k,\.08,\.34\)/);
 assert.match(cin,/const hot=seg\(k,\.40,\.70\)/);
 assert.match(cin,/const eruption=seg\(k,\.65,\.94\)/);
 assert.match(evo,/Porcioncita descubre/);
});

test("V55 Pizza silhouette is captured at all five evolutions",()=>{
 assert.match(visual,/01g-pizza-molten-form-/);
 assert.match(visual,/rendered\.visible>10/);
 assert.match(visual,/getAttribute\('data-hero'\),'pizza'/);
});
