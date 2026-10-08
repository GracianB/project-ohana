import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno,{cuernoSoulBeat,cuernoMagicPose} from "../characters/art/cuerno.js";
import {ROSTER} from "../characters/roster.js";

const art=fs.readFileSync("characters/art/cuerno.js","utf8");
const title=fs.readFileSync("systems/title.js","utf8");
const visual=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
function render(form,state="idle",slot=-1){
 const trace={saves:0,restores:0,rotates:[],translates:[],arcs:0,lines:0,beziers:0,quads:0,eyes:0,limbs:0};
 const ctx=new Proxy({},{
  get(o,k){
   if(k==="save")return()=>trace.saves++;
   if(k==="restore")return()=>trace.restores++;
   if(k==="translate")return(x,y)=>trace.translates.push([x,y]);
   if(k==="rotate")return(v)=>trace.rotates.push(v);
   if(k==="arc")return()=>trace.arcs++;
   if(k==="lineTo")return()=>trace.lines++;
   if(k==="bezierCurveTo")return()=>trace.beziers++;
   if(k==="quadraticCurveTo")return()=>trace.quads++;
   if(k in o)return o[k];return()=>{};
  },
  set(o,k,v){o[k]=v;return true;}
 });
 const nop=()=>{};
 const R={ellipse:nop,blush:nop,celShade:nop,mouth:nop,halo:nop,
  eye:()=>trace.eyes++,limb:()=>trace.limbs++,sparkle:()=>trace.arcs++};
 Cuerno.draw(ctx,{form,state,t:200,phase:1.25,air:state==="jump",speed:.8,bounce:.7,
  cast:state==="cast"?.5:0,castSlot:slot,cuernoMagicSlot:-1,cuernoDreamT:0,
  flourish:0,flourishN:0},R);
 assert.equal(trace.saves,trace.restores,"Canvas state leaked: "+state+"/"+form);
 return trace;
}
test("V69 victory is truly animated with flourish=0 in every evolution",()=>{
 for(let form=0;form<5;form++){
  const active=render(form,"victory"),quiet=render(form,"idle");
  assert.equal(cuernoSoulBeat({state:"victory",flourish:0},form),
   form===4?"bow":form>=2?"prance":"curious");
  assert.ok(active.arcs+active.lines+active.quads>quiet.arcs+quiet.lines+quiet.quads,
   "Victory gesture did not paint in form "+form);
  const injured=render(form,"hurt"),dead=render(form,"dead");
  assert.equal(cuernoSoulBeat({state:"hurt",cuernoBeat:"bow"},form),"");
  assert.equal(cuernoSoulBeat({state:"dead",cuernoBeat:"sneeze"},form),"");
  assert.equal(cuernoMagicPose({state:"hurt",cast:.5,castSlot:3},form),null);
  assert.equal(cuernoMagicPose({state:"dead",cast:.5,castSlot:3},form),null);
  assert.ok(injured.eyes>0&&dead.eyes>0,"missing character face");
 }
});
test("V69 body and magical overlay share exactly the same outer transform",()=>{
 assert.match(art,/function drawCuernoOverlays\(ctx,pose,R,form,t,lift,tilt\)/);
 const calls=Array.from(art.matchAll(/drawCuernoOverlays\(ctx,pose,R,(\d),t,([a-z]+),tilt\)/g));
 assert.deepEqual(calls.map(c=>Number(c[1])),[0,1,2,3,4]);
 for(let form=0;form<5;form++){
  const state=render(form,"cast",3);
  assert.ok(state.translates.length>0);
  assert.ok(state.rotates.length>=2,"body/overlay rotation not mirrored in form "+form);
  assert.equal(state.rotates.at(-1),state.rotates[0],
   "overlay tilt differs from body tilt in form "+form);
  assert.ok(state.arcs>0);
 }
});
test("V69 all forms preserve J/K/L/U, sleep protection and strict Canvas budget",()=>{
 for(let form=0;form<5;form++)for(let slot=0;slot<4;slot++){
  const a=render(form,"cast",slot),b=render(form,"cast",slot);
  assert.deepEqual(a,b);
  assert.ok(a.saves<35,"too many save/restore pairs");
 }
 assert.deepEqual(ROSTER.find(r=>r.id==="cuerno").abilities,["gleam","gallop","rainbow"]);
 assert.match(title,/__OHANA_TITLE_CUERNO_STATE/);
 assert.match(title,/cv\.dataset\.cuernoState = showcasePose/);
 assert.match(visual,/01p-cuerno-victory-form-/);
 assert.match(visual,/assert\.notEqual\(samples\[0\],samples\[1\]/);
 const code=art.split("function drawCuernoOverlays(")[1].split("function horn(")[0];
 assert.doesNotMatch(code,/Math\.random|requestAnimationFrame|setTimeout|fetch\(/);
});
