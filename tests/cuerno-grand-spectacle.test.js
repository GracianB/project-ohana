import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno,{cuernoMagicPose} from "../characters/art/cuerno.js";
import {cuernoGrandStage,SUPREME_STORYBOARDS} from "../systems/supreme-storyboards.js";
import {ROSTER} from "../characters/roster.js";
const art=fs.readFileSync("characters/art/cuerno.js","utf8");
const cinema=fs.readFileSync("systems/supreme-cinema.js","utf8");
const magic=fs.readFileSync("systems/abilities.js","utf8");
const visual=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
function trace(form,slot,cast){
 const stats={save:0,restore:0,arcs:0,lines:0,beziers:0,quadratics:0};
 const ctx=new Proxy({},{
  get(o,key){if(key==="save")return()=>stats.save++;
   if(key==="restore")return()=>stats.restore++;
   if(key==="arc")return()=>stats.arcs++;
   if(key==="lineTo")return()=>stats.lines++;
   if(key==="bezierCurveTo")return()=>stats.beziers++;
   if(key==="quadraticCurveTo")return()=>stats.quadratics++;
   if(key in o)return o[key];return()=>{};},
  set(o,key,value){o[key]=value;return true;}
 });
 const noop=()=>{};
 const R={limb:noop,eye:noop,mouth:noop,blush:noop,ellipse:noop,celShade:noop,
  sparkle:()=>{stats.arcs++}};
 Cuerno.draw(ctx,{form,state:"cast",t:90,speed:0,phase:0,bounce:0,
  flourish:0,flourishN:0,cast,castSlot:slot,cuernoMagicSlot:-1,cuernoDreamT:0},R);
 assert.equal(stats.save,stats.restore,"Canvas state leak on form "+form);
 return stats;
}
test("V68 grand film uses four ordered and bounded acts",()=>{
 const names=[0,.11,.22,.34,.51,.65,.76,.88,1].map(k=>cuernoGrandStage(k).name);
 assert.deepEqual(names,["breath","breath","iris","iris","dream","dream","aurora","aurora","aurora"]);
 for(const k of [-10,0,.15,.45,.65,.94,1,2,NaN]){
   const b=cuernoGrandStage(k);
   assert.ok(b.value>=0&&b.value<=1);
 }
 assert.match(SUPREME_STORYBOARDS.cuerno.beat,/ALIENTO → CÍRCULO → SUEÑO → AURORA/);
 assert.equal(SUPREME_STORYBOARDS.cuerno.duration,6.10);
 assert.match(cinema,/drawStory\(ctx,def.id,k,t,cx,cy,target,color,detail\.dreamTargets,reduce\)/);
 assert.match(cinema,/el\.dataset\.cuernoPhase=stage\.name/);
 assert.match(cinema,/p\._cuernoMagicSlot=k>=\.22&&k<\.76\?3:-1/);
 assert.match(visual,/09p-cuerno-u-grand-spectacle/);
});
test("V68 J/K/L/U acquire three story beats without changing casts",()=>{
 for(let form=0;form<5;form++){
  for(let slot=0;slot<4;slot++){
   const sample=[.12,.5,.91].map(cast=>cuernoMagicPose({state:"cast",cast,castSlot:slot},form));
   assert.deepEqual(sample.map(p=>p.stage),["charge","release","echo"]);
   assert.ok(sample.every(p=>p.slot===slot));
   assert.ok(sample[1].strength>sample[0].strength);
   for(const cast of [.12,.5,.91]) assert.deepEqual(trace(form,slot,cast),trace(form,slot,cast));
  }
 }
 const forced=cuernoMagicPose({state:"idle",cast:0,cuernoMagicSlot:2},4);
 assert.equal(forced.stage,"release");
 assert.equal(cuernoMagicPose({state:"dead",cast:.5,castSlot:3},4),null);
});
test("V68 preserves iris geometry and cannot alter the boss-safe dream",()=>{
 assert.match(magic,/kind:"irisHalo"/);
 assert.match(magic,/Math\.hypot\(viewW\(\),viewH\(\)\)\*1\.12/);
 assert.match(magic,/dreamTargets = p\.id === "cuerno" \? enemies\.filter\(e=>!e\.boss&&inView\(game,e\)\) : \[\]/);
 assert.match(magic,/const opening=Math\.min\(1,progress\/\.10\),ending=Math\.min\(1,f\.life\/15\)/);
 assert.match(magic,/ctx\.globalAlpha=\.11\*opacity/);
 assert.match(magic,/ctx\.globalAlpha=\.07\*fade/);
 assert.ok(magic.length<135000,"performance ceiling");
 assert.deepEqual(ROSTER.find(h=>h.id==="cuerno").abilities,["gleam","gallop","rainbow"]);
 const body=art.split("export function cuernoMagicPose(")[1].split("function horn(")[0];
 assert.doesNotMatch(body,/Math\.random|setTimeout|setInterval|requestAnimationFrame|fetch\(/);
});
