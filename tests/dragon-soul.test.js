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

test("V53 solar ascent, halo and narrative are specific to Dragon",()=>{
 const cinema=fs.readFileSync("systems/supreme-cinema.js","utf8");
 const evolution=fs.readFileSync("characters/evolution.js","utf8");
 assert.match(dragon,/Wingbeat vortex: ascending embers/);
 assert.match(dragon,/f===4 && \(flight \|\| striking \|\| victorious\)/);
 assert.match(cinema,/const ascent=seg\(k,\.33,\.62\)/);
 assert.match(evolution,/La corona solar despierta/);
});

test("V53 Dragon has four expressive idles and cast-specific powers",()=>{
 assert.match(dragon,/const flN = \(pose\.flourishN \|\| 0\) % 4/);
 assert.match(dragon,/cuarta microescena: estornuda/);
 assert.match(dragon,/state==="cast" && p\.castSlot===1/);
 assert.match(dragon,/state==="cast" && p\.castSlot===2/);
 assert.match(dragon,/const climb = clamp\(/);
 const fx=dragon.split("function dragonSoul(")[1].split("function draw(ctx")[0];
 assert.doesNotMatch(fx,/requestAnimationFrame|setInterval|setTimeout|Math\.random/);
});

test("V53 U tells a bounded four-beat comedy-to-sunrise story",()=>{
 const cine=fs.readFileSync("systems/supreme-cinema.js","utf8");
 const beats=fs.readFileSync("systems/supreme-storyboards.js","utf8");
 assert.match(cine,/const chase=seg\(k,\.28,\.57\)/);
 assert.match(cine,/const crown=seg\(k,\.59,\.79\)/);
 assert.match(cine,/const nova=seg\(k,\.63,\.92\)/);
 assert.match(cine,/if\(id==="dragon"\) return k<\.32\?"idle":k<\.53\?"jump":k<\.78\?"attack":"victory"/);
 assert.match(beats,/ESTORNUDO → PERSECUCIÓN → CORONA → SUPERNOVA/);
});
