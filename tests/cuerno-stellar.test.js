import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno from "../characters/art/cuerno.js";
import { ROSTER } from "../characters/roster.js";

const src=fs.readFileSync("characters/art/cuerno.js","utf8");
const browser=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
function frame(form,state="idle",phase=.2,speed=1){
  const out={limbs:[],eyes:0,mouths:0,beziers:0,arcs:0,saves:0,restores:0};
  const ctx=new Proxy({},{
    get(obj,key){
      if(key==="save")return()=>{out.saves++};
      if(key==="restore")return()=>{out.restores++};
      if(key==="bezierCurveTo")return()=>{out.beziers++};
      if(key==="arc")return()=>{out.arcs++};
      if(key in obj)return obj[key];
      return()=>{};
    },
    set(obj,key,val){obj[key]=val;return true}
  });
  const noop=()=>{};
  const R={
    limb:(ctx,...args)=>{assert.ok(args.slice(0,7).every(Number.isFinite));out.limbs.push(args.slice(0,7));},
    eye:()=>{out.eyes++},mouth:()=>{out.mouths++},
    blush:noop,sparkle:noop,star:noop,halo:noop,celShade:noop,ellipse:noop,darken:c=>c
  };
  Cuerno.draw(ctx,{
    form,t:140,phase,speed,state,air:state==="jump",bounce:0,flourish:.65,
    flourishN:2,look:{x:1,y:0},blink:0,cast:.3,atk:.4
  },R);
  assert.equal(out.saves,out.restores,"unbalanced Canvas transformation stack");
  return out;
}
test("V62 Unicornio Estelar is a horse-shaped adult, not the inherited ball",()=>{
  assert.match(src,/function drawStellarUnicorn\(ctx,pose,R,t\)/);
  assert.match(src,/if \(f === 3\) \{ drawStellarUnicorn\(ctx,pose,R,pose\.t\|\|0\); return; \}/);
  const adult=frame(3,"idle"),foal=frame(2,"idle");
  assert.equal(adult.limbs.length,4,"four articulated adult legs");
  assert.equal(adult.eyes,1,"one visible adult eye in side-on anatomy");
  assert.equal(adult.mouths,1,"real muzzle");
  assert.ok(adult.beziers>=7,"organic torso, grown neck, mane and tail");
  assert.equal(foal.limbs.length,4,"Potro Iris art untouched, phase 3 still pending");
});
test("V62 fast gallop uses four independent leg beats and retains jump pose",()=>{
  const a=frame(3,"run",.2),b=frame(3,"run",2.8),air=frame(3,"jump",1.3);
  assert.equal(a.limbs.length,4);assert.equal(b.limbs.length,4);
  assert.notDeepEqual(a.limbs,b.limbs,"running changes hoof and knee coordinates");
  assert.notDeepEqual(a.limbs,air.limbs,"jump tucks legs differently than gallop");
  assert.ok(new Set(a.limbs.map(l=>l[0])).size>=4,"four distinct leg attachment points");
});
test("V62 keeps innate fastest speed/jump, powers and the newborn unchanged",()=>{
  const hero=ROSTER.find(p=>p.id==="cuerno");
  assert.equal(hero.forms[3].speed,8.4);
  assert.equal(hero.forms[3].jump,17.4);
  assert.deepEqual(hero.abilities,["gleam","gallop","rainbow"]);
  assert.equal(frame(0).limbs.length,0,"F0 pure horn");
  assert.equal(frame(1).limbs.length,2,"F1 growing limbs");
});
test("V62 performance is bounded and real Chromium captures verify stage 3",()=>{
  const body=src.split("function drawStellarUnicorn(")[1].split("function draw(ctx, pose, R)")[0];
  assert.doesNotMatch(body,/Math\.random|setTimeout|setInterval|requestAnimationFrame|new Image|fetch\(/);
  assert.match(browser,/for\(const form of \[0,1,2,3,4\]\)/);
  assert.match(browser,/01k-cuerno-stellar-unicorn-adult/);
  assert.match(browser,/09h-cuerno-stellar-real-play/);
  for(const state of ["idle","run","jump","cast","attack","hurt","victory"])
    assert.equal(frame(3,state).saves,frame(3,state).restores,state);
});
