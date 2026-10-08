import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno,{cuernoMagicPose} from "../characters/art/cuerno.js";
import { ROSTER } from "../characters/roster.js";
const art=fs.readFileSync("characters/art/cuerno.js","utf8");
const draw=fs.readFileSync("characters/draw.js","utf8");
const titles=fs.readFileSync("systems/title.js","utf8");
const visual=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
function paint(form,slot=-1,extra={}){
const trace={saves:0,restores:0,arcs:0,beziers:0,quadratics:0,lines:0,limbs:0,eyes:[],mouths:[]};
const context=new Proxy({},{
 get(o,k){if(k==="save")return()=>trace.saves++;
 if(k==="restore")return()=>trace.restores++;
 if(k==="arc")return()=>trace.arcs++;
 if(k==="bezierCurveTo")return()=>trace.beziers++;
 if(k==="quadraticCurveTo")return()=>trace.quadratics++;
 if(k==="lineTo")return()=>trace.lines++;
 if(k in o)return o[k];
 return()=>{}},
 set(o,k,v){o[k]=v;return true}
});
const noop=()=>{};
const rig={limb:()=>trace.limbs++,eye:(c,x,y,r,p,opt)=>trace.eyes.push(opt.mood),
 mouth:(...a)=>trace.mouths.push(a.at(-1)),ellipse:noop,blush:noop,halo:noop,celShade:noop,
 sparkle:()=>trace.arcs++};
const pose={form,state:slot>=0?"cast":"idle",t:180,phase:1,air:false,speed:0,bounce:0,
 flourish:0,flourishN:0,cast:slot>=0?.5:0,castSlot:slot,cuernoMagicSlot:-1,cuernoDreamT:0,
 ...extra};
Cuerno.draw(context,pose,rig);
assert.equal(trace.saves,trace.restores,"Unbalanced Canvas save/restore in form "+form);
return trace;
}
test("V67 each ability has a pure bounded horn-origin pose",()=>{
const p={state:"cast",cast:.5};
for(let slot=0;slot<4;slot++){
 const v=cuernoMagicPose({...p,castSlot:slot},4);
 assert.equal(v.slot,slot);assert.ok(v.strength>.9);
}
assert.equal(cuernoMagicPose({state:"hurt",cast:.5,castSlot:3},4),null);
assert.equal(cuernoMagicPose({state:"dead",cast:.5,castSlot:3},4),null);
assert.equal(cuernoMagicPose({state:"run",cast:.5,castSlot:3},4),null);
const dream=cuernoMagicPose({state:"idle",cuernoDreamT:1},4);
assert.equal(dream.slot,3);assert.equal(dream.continuous,true);
assert.ok(dream.strength<=.22);
assert.equal(cuernoMagicPose({state:"idle",cuernoDreamT:0},4),null);
assert.equal(cuernoMagicPose({state:"idle",cuernoMagicSlot:2},4).slot,2);
});
test("V67 J/K/L/U draw distinct real geometry for all five evolution stages",()=>{
for(let form=0;form<5;form++){
 const idle=paint(form,-1);
 for(let slot=0;slot<4;slot++){
  const a=paint(form,slot),b=paint(form,slot);
  assert.deepEqual(a,b,"draw nondeterminism "+form+"/"+slot);
  assert.equal(a.limbs,idle.limbs,"magic mutated biology "+form+"/"+slot);
  if(slot===0)assert.ok(a.lines>idle.lines,"J lance missing");
  if(slot===1)assert.ok(a.beziers>idle.beziers,"K streamers missing");
  if(slot===2)assert.ok(a.arcs>idle.arcs+5,"L needs seven circular lines");
  if(slot===3)assert.ok(a.quadratics>idle.quadratics+5,"U needs seven sleep ribbons");
 }
}
});
test("V67 Aurora's face and wings respond to dream, without dead-state spell residue",()=>{
const u=paint(4,3),quiet=paint(4,-1);
assert.ok(u.eyes.includes("closed"),"Aurora U must close her eye");
assert.ok(quiet.eyes.includes("normal"),"resting Aurora must remain awake");
const persisted=paint(4,-1,{cuernoDreamT:.9});
assert.ok(persisted.quadratics>quiet.quadratics,"sleep aura stopped before duration");
assert.deepEqual(paint(4,3,{state:"dead"}),paint(4,-1,{state:"dead"}));
});
test("V67 live input and smoke visuals are not just pictures",()=>{
assert.match(draw,/pose\.cuernoDreamT = Math\.max\(0, Number\(p\._specialAuroraT\) \|\| 0\) \/ 260/);
assert.match(draw,/pose\.cuernoMagicSlot \?\? -1/);
assert.match(titles,/__OHANA_TITLE_CUERNO_MAGIC/);
assert.match(visual,/01o-cuerno-magia-viva-/);
const hero=ROSTER.find(h=>h.id==="cuerno");
assert.deepEqual(hero.abilities,["gleam","gallop","rainbow"]);
assert.match(art,/HORN_TIPS=\[\[0,-65\],\[4,-91\],\[24,-100\],\[25,-120\],\[33,-139\]\]/);
const code=art.split("export function cuernoMagicPose(")[1].split("function horn(")[0];
assert.doesNotMatch(code,/Math\.random|requestAnimationFrame|setTimeout|setInterval|fetch\(|new Image/);
});
