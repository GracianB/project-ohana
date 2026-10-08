import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno from "../characters/art/cuerno.js";
import { ROSTER } from "../characters/roster.js";
const source=fs.readFileSync("characters/art/cuerno.js","utf8");
const visual=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
function draw(form,state="idle",phase=.35){
  const trace={limbs:[],eyes:0,mouths:0,beziers:0,shapes:0,saves:0,restores:0};
  const ctx=new Proxy({},{
    get(obj,key){
      if(key==="save")return()=>{trace.saves++};
      if(key==="restore")return()=>{trace.restores++};
      if(key==="bezierCurveTo")return()=>{trace.beziers++};
      if(key in obj)return obj[key];
      return()=>{trace.shapes++};
    },
    set(obj,key,value){obj[key]=value;return true}
  });
  const noop=()=>{};
  const rig={
    limb:(c,...args)=>{assert.ok(args.slice(0,7).every(Number.isFinite),"invalid foal limb");trace.limbs.push(args.slice(0,7));},
    eye:()=>trace.eyes++,mouth:()=>trace.mouths++,blush:noop,sparkle:noop,
    star:noop,halo:noop,ellipse:noop,celShade:noop,darken:c=>c
  };
  Cuerno.draw(ctx,{form,state,t:127,phase,speed:1,air:state==="jump",bounce:0,flourish:.45,flourishN:1,blink:0},rig);
  assert.equal(trace.saves,trace.restores,"unbalanced Canvas stack");
  return trace;
}
test("V63 F2 is a juvenile foal between Destello and Estelar",()=>{
  assert.match(source,/function drawRainbowFoal\(ctx,pose,R,t\)/);
  assert.match(source,/if \(f === 2\) \{ drawRainbowFoal\(ctx,pose,R,pose\.t\|\|0\); return; \}/);
  assert.deepEqual([0,1,2,3].map(form=>draw(form).limbs.length),[0,0,4,4]);
  const foal=draw(2);
  assert.equal(foal.eyes,1);assert.equal(foal.mouths,1);
  assert.ok(foal.beziers>=10,"organic silhouette, mane and tail");
});
test("V63 foal has independent trot, tucked jump and expressive movement",()=>{
  const a=draw(2,"run",.2),b=draw(2,"run",2.8),j=draw(2,"jump",1.1);
  assert.equal(new Set(a.limbs.map(l=>l[0])).size,4);
  assert.notDeepEqual(a.limbs,b.limbs);
  assert.notDeepEqual(a.limbs,j.limbs);
  for(const state of ["idle","run","jump","cast","attack","hurt","dead","victory"])
    assert.ok(draw(2,state).shapes>20,state);
});
test("V63 innate power and performance contracts remain intact",()=>{
  const c=ROSTER.find(hero=>hero.id==="cuerno");
  assert.equal(c.forms[2].name,"Potro Iris");
  assert.equal(c.forms[2].speed,7.4);assert.equal(c.forms[2].jump,16.2);
  assert.equal(c.forms[3].speed,8.4);assert.equal(c.forms[3].jump,17.4);
  assert.deepEqual(c.abilities,["gleam","gallop","rainbow"]);
  const body=source.split("function drawRainbowFoal(")[1].split("// F3 Unicornio Estelar:")[0];
  assert.doesNotMatch(body,/Math\.random|setTimeout|setInterval|requestAnimationFrame|new Image|fetch\(/);
  assert.match(visual,/01l-cuerno-rainbow-foal-complete/);
  assert.match(visual,/09i-cuerno-rainbow-foal-real-play/);
});
