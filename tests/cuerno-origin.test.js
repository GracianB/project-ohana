import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ROSTER } from "../characters/roster.js";

const src=fs.readFileSync("characters/art/cuerno.js","utf8");
const draw=fs.readFileSync("characters/draw.js","utf8");
const passives=fs.readFileSync("systems/passives.js","utf8");
const rig=fs.readFileSync("characters/rig.js","utf8");
const visual=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");

const cuerno=ROSTER.find(h=>h.id==="cuerno");
test("V59 Cuerno starts as a living unicorn horn, not a quadruped",()=>{
  assert.ok(cuerno);
  assert.match(src,/function drawLivingHorn\(ctx,pose,R,t\)/);
  assert.match(src,/if \(f === 0\) \{ drawLivingHorn\(ctx,pose,R,pose\.t\|\|0\); return; \}/);
  assert.match(src,/No horse body, legs or oversized round head/);
  const baby=src.split("function drawLivingHorn(")[1].split("function drawFirstBody(")[0];
  assert.doesNotMatch(baby,/R\.limb|leg\(|Math\.random|setTimeout|requestAnimationFrame/);
  assert.match(baby,/ctx\.bezierCurveTo/);
  assert.match(baby,/R\.eye\(ctx,-5,-24/);
});
test("V59 Cuerno is fastest and jumps highest at EVERY form without K",()=>{
  for(let form=0;form<5;form++){
    const mine=cuerno.forms[form];
    const others=ROSTER.filter(h=>h.id!=="cuerno");
    assert.ok(others.every(h=>mine.speed>h.forms[form].speed),"speed stage "+form);
    assert.ok(others.every(h=>mine.jump>h.forms[form].jump),"jump stage "+form);
  }
  assert.equal(cuerno.speed,cuerno.forms[0].speed);
  assert.equal(cuerno.jumpPower,cuerno.forms[0].jump);
  assert.deepEqual(cuerno.abilities,["gleam","gallop","rainbow"]);
  assert.equal(cuerno.passive.id,"punta");
  assert.match(cuerno.passive.desc,/salta más alto/);
  assert.match(passives,/Speed and height come from roster stats, always on/);
});
test("V59 Cuerno uses Canvas even if an obsolete SVG was cached in paint mode",()=>{
  assert.match(draw,/if \(id === "cuerno"\) return null;/);
  assert.match(rig,/cuerno:\s+\{ freq: 1\.55/);
  assert.match(visual,/01i-cuerno-origin-form-/);
  assert.match(visual,/state\.visible>12/);
});
