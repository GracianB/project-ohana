import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno,{cuernoSoulBeat} from "../characters/art/cuerno.js";
import {ROSTER} from "../characters/roster.js";

const src=fs.readFileSync("characters/art/cuerno.js","utf8");
const drawSrc=fs.readFileSync("characters/draw.js","utf8");
const title=fs.readFileSync("systems/title.js","utf8");
const visual=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
function scene(form,override={},t=160){
const pose={form,state:"idle",t,phase:.7,air:false,bounce:0,flourish:.5,flourishN:0,blink:0,speed:0,castSlot:-1,...override};
const trace={saves:0,restores:0,arcs:0,ellipses:0,lines:0,limbs:0,eyes:0,mouths:0};
const ctx=new Proxy({},{
 get(o,p){
  if(p==="save")return()=>trace.saves++;
  if(p==="restore")return()=>trace.restores++;
  if(p==="arc")return()=>trace.arcs++;
  if(p==="ellipse")return()=>trace.ellipses++;
  if(p==="lineTo")return()=>trace.lines++;
  if(p in o)return o[p];
  return()=>{};
 },
 set(o,p,v){o[p]=v;return true}
});
const noop=()=>{};
const R={ellipse:noop,celShade:noop,blush:noop,sparkle:()=>trace.arcs++,
 limb:()=>trace.limbs++,eye:()=>trace.eyes++,mouth:()=>trace.mouths++,halo:noop};
Cuerno.draw(ctx,pose,R);
assert.equal(trace.saves,trace.restores,"Canvas transformation leaked");
return trace;
}
test("V66 Cuerno has form-authored personality rather than universal particles",()=>{
const p={state:"idle",flourish:.5,flourishN:0};
assert.deepEqual([0,1,2,3,4].map(n=>cuernoSoulBeat(p,n)),
 ["curious","shy","prance","stargaze","sneeze"]);
assert.equal(cuernoSoulBeat({...p,flourishN:1},4),"bow");
assert.equal(cuernoSoulBeat({state:"victory"},4),"bow");
assert.equal(cuernoSoulBeat({state:"cast",castSlot:3},4),"stargaze");
assert.equal(cuernoSoulBeat({state:"hurt",flourish:.5},4),"");
assert.equal(cuernoSoulBeat({state:"run",flourish:.5},4),"");
assert.equal(cuernoSoulBeat({state:"idle",flourish:0},4),"");
});
test("V66 each form draws its own little gesture, and force-mode showcases six",()=>{
for(let i=0;i<5;i++){
 const active=scene(i),silent=scene(i,{flourish:0});
 assert.ok(active.arcs+active.lines>silent.arcs+silent.lines,"form "+i);
}
const resting=scene(4,{flourish:0,state:"idle"});
for(const beat of ["curious","shy","prance","stargaze","sneeze","bow"]){
 const p=scene(4,{cuernoBeat:beat,flourish:0,state:"idle"});
 assert.ok(p.arcs+p.lines+p.ellipses>resting.arcs+resting.lines+resting.ellipses,beat);
}
});
test("V66 maintains original equine biology and deterministic still-frame",()=>{
const hero=ROSTER.find(p=>p.id==="cuerno");
assert.deepEqual(hero.abilities,["gleam","gallop","rainbow"]);
assert.deepEqual([0,1,2,3,4].map(n=>scene(n).limbs),[0,2,4,4,4]);
const a=scene(4,{cuernoBeat:"sneeze"}),b=scene(4,{cuernoBeat:"sneeze"});
assert.deepEqual(a,b);
const c=scene(4,{cuernoBeat:"bow"});
assert.notDeepEqual(a,c);
const code=src.split("export function cuernoSoulBeat(")[1].split("function horn(")[0];
assert.doesNotMatch(code,/Math\.random|requestAnimationFrame|setTimeout|setInterval|fetch\(|new Image/);
});
test("V66 forced title beats are cache-safe and under visual regression",()=>{
assert.match(drawSrc,/pose\.cuernoBeat = p\._cuernoBeat \|\| ""/);
assert.match(drawSrc,/pose\.cuernoBeat \|\| ""/);
assert.match(title,/__OHANA_TITLE_CUERNO_BEAT/);
assert.match(title,/dataset\.cuernoBeat/);
assert.match(visual,/01n-cuerno-soul-sneeze|01n-cuerno-soul-/);
assert.match(visual,/01n-cuerno-soul-/);
});
