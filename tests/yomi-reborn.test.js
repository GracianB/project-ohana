import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const art=fs.readFileSync("characters/art/yomi.js","utf8");
const abilities=fs.readFileSync("systems/abilities.js","utf8");
const evolution=fs.readFileSync("characters/evolution.js","utf8");
const visual=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");

test("V56 Yomi has an expressive hand-drawn guardian silhouette in five forms",()=>{
 assert.match(art,/const PAL=\[/);
 assert.match(art,/function draw\(ctx,pose,R\)/);
 assert.match(art,/const p=pose\|\|\{\},f=clamp\(p\.form\|0,0,4\)/);
 assert.match(art,/The growing cape makes five recognizable stages/);
 assert.match(art,/Two animated open sleeves/);
 assert.match(art,/Lantern-shaped body/);
 assert.match(art,/R\.eye\(ctx,-8,faceY/);
 assert.match(art,/if\(f>=3\)/);
 assert.match(art,/if\(f===4\)/);
 assert.match(art,/ctx\.save\(\)/);
 assert.match(art,/ctx\.restore\(\)/);
 const drawing=art.split("function draw(ctx,pose,R)")[1];
 assert.doesNotMatch(drawing,/Math\.random|requestAnimationFrame|setInterval|setTimeout/);
});

test("V56 Ofuda J travels horizontally and exposes its true 16-frame blast zone",()=>{
 assert.match(abilities,/name: "Sello guardián"/);
 assert.match(abilities,/Talismán horizontal|talismán horizontal/);
 assert.match(abilities,/vx: \(8 \+ evo\) \* \(p\.facing \|\| 1\), vy: 0/);
 assert.match(abilities,/f\.stuck = 16/);
 assert.match(abilities,/Math\.hypot\(cx\(e\) - f\.x, cy\(e\) - f\.y\) < 72/);
 assert.match(abilities,/ctx\.arc\(0,0,22\+50\*k,0,TAU\)/);
 assert.match(abilities,/ctx\.arc\(0,0,22\+50\*k,0,TAU\)/);
});

test("V56 guardian identity retains J/K/L and explains all evolution stages",()=>{
 assert.match(abilities,/sleeve\(g, p, evo\)/);
 assert.match(abilities,/maw\(g, p, evo\)/);
 assert.match(abilities,/ofuda\(g, p, evo\)/);
 assert.match(evolution,/Una llamita tímida descubre/);
 assert.match(evolution,/Yomi decide qué debe quedarse fuera/);
});

test("V56 Yomi real Canvas portrait audit covers all five forms",()=>{
 assert.match(visual,/01h-yomi-guardian-form-/);
 assert.match(visual,/data-hero'\),'yomi'/);
});
