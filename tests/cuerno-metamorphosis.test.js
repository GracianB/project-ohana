import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno from "../characters/art/cuerno.js";
import { ROSTER } from "../characters/roster.js";

const source=fs.readFileSync("characters/art/cuerno.js","utf8");
const visual=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
function render(form,state="idle",phase=0,flourish=0){
  const seen={legs:0,eyes:0,mouths:0,stars:0,saves:0,restores:0,commands:0};
  const ctx=new Proxy({},{
    get:(obj,key)=>{
      if(key==="save")return()=>{seen.saves++};
      if(key==="restore")return()=>{seen.restores++};
      if(key in obj)return obj[key];
      return()=>{seen.commands++};
    },
    set:(obj,key,value)=>{obj[key]=value;return true}
  });
  const empty=()=>{};
  const R={
    limb:()=>{seen.legs++},eye:()=>{seen.eyes++},mouth:()=>{seen.mouths++},
    sparkle:()=>{seen.stars++},ellipse:empty,celShade:empty,
    blush:empty,halo:empty,star:empty,darken:c=>c
  };
  Cuerno.draw(ctx,{form,t:123,state,air:state==="jump",phase,bounce:0,flourish,flourishN:0,look:{x:0,y:0},blink:0},R);
  assert.equal(seen.saves,seen.restores,"Canvas transformations are not balanced");
  assert.ok(seen.commands>8,"The artwork did not draw its body");
  return seen;
}
test("V60 first metamorphosis is drawable, with two new hooves and a face",()=>{
  assert.match(source,/function drawFirstBody\(ctx,pose,R,t\)/);
  assert.match(source,/F1 Destello: the pearl horn grows a neck, ears, a muzzle and TWO tentative hooves/);
  assert.match(source,/if \(f === 1\) \{ drawFirstBody\(ctx,pose,R,pose\.t\|\|0\); return; \}/);
  assert.equal(render(0).legs,0,"Cuernín must still be only a living horn");
  const juvenile=render(1);
  assert.equal(juvenile.legs,2,"Destello must have precisely two growing limbs");
  assert.equal(juvenile.eyes,2);
  assert.equal(juvenile.mouths,1);
  assert.equal(render(2).legs,4,"Potro Iris retains its own temporary four-leg stage");
});
test("V60 animations remain deterministic and canvas stack stays balanced",()=>{
  for(const stage of ["idle","run","jump","attack","cast","victory","hurt"])
    assert.ok(render(1,stage,2.2,0.4).commands>8,stage);
  const body=source.split("function drawFirstBody(")[1].split("function draw(ctx, pose, R)")[0];
  assert.doesNotMatch(body,/Math\.random|setInterval|setTimeout|requestAnimationFrame/);
});
test("V60 form names and gameplay still preserve innate speed and jump",()=>{
  const cuerno=ROSTER.find(hero=>hero.id==="cuerno");
  assert.match(cuerno.forms[1].name,/Naciente/);
  assert.equal(cuerno.forms[1].speed,6.7);
  assert.equal(cuerno.forms[1].jump,15.4);
  assert.deepEqual(cuerno.abilities,["gleam","gallop","rainbow"]);
});
test("V60 browser audits the newborn, its two-hoof stage and Potro",()=>{
  assert.match(visual,/for\(const form of \[0,1,2,4\]\)/);
  assert.match(visual,/01j-cuerno-destello-first-metamorphosis/);
  assert.match(visual,/09g-cuerno-naciente-gameplay/);
});
