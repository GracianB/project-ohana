import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const dragon=fs.readFileSync("characters/art/dragon.js","utf8");
const abilities=fs.readFileSync("systems/abilities.js","utf8");
test("V53 dragon art uses bounded local five-form solar animation",()=>{
 assert.match(dragon,/function dragonSoul\(ctx, pose, front\)/);
 assert.match(dragon,/function drawBase\(ctx, pose, R\)/);
 assert.match(dragon,/drawBase\(ctx, safe, R\)/);
 assert.match(dragon,/const f = Math\.max\(0, Math\.min\(4,/);
 assert.match(dragon,/const n = f >= 3 \? 5 : 3/);
 const fx=dragon.split("function dragonSoul(")[1].split("function draw(ctx")[0];
 assert.doesNotMatch(fx,/Math\.random|setTimeout|setInterval|requestAnimationFrame/);
});
test("V53 dragon retains celestial flight and unique U",()=>{
 assert.match(abilities,/SUPERNOVA CELESTE/);
 assert.match(abilities,/Vuelo celestial/);
 assert.match(dragon,/f===0 && state==="idle"/);
});
