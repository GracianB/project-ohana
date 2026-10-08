import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno from "../characters/art/cuerno.js";
import { ROSTER } from "../characters/roster.js";
const src=fs.readFileSync("characters/art/cuerno.js","utf8");
const visual=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
function scene(state="idle",phase=.2,form=4){
 const out={limbs:[],eyes:0,mouths:0,beziers:0,saves:0,restores:0,paths:0};
 const ctx=new Proxy({},{
  get(obj,key){
   if(key==="save")return()=>{out.saves++};
   if(key==="restore")return()=>{out.restores++};
   if(key==="bezierCurveTo")return()=>{out.beziers++};
   if(key in obj)return obj[key];
   return()=>{out.paths++};
  },
  set(obj,key,value){obj[key]=value;return true}
 });
 const noop=()=>{};
 const rig={limb:(c,...v)=>{assert.ok(v.slice(0,7).every(Number.isFinite));out.limbs.push(v.slice(0,7))},
  eye:()=>out.eyes++,mouth:()=>out.mouths++,blush:noop,sparkle:noop,
  halo:noop,ellipse:noop,star:noop,celShade:noop,darken:c=>c};
 Cuerno.draw(ctx,{form,state,phase,t:150,speed:1,bounce:0,flourish:.3,flourishN:1,air:state==="jump",cast:.5,atk:.4},rig);
 assert.equal(out.saves,out.restores,"Canvas save/restore leak");
 return out;
}
test("V64 Aurora is a real standalone adult with horn, wings, neck and four hooves",()=>{
 assert.match(src,/function drawAuroraUnicorn\(ctx,pose,R,t\)/);
 assert.match(src,/drawAuroraUnicorn\(ctx,pose,R,pose\.t\|\|0\)/);
 assert.doesNotMatch(src,/const COAT =/,"the spherical fallback was removed");
 const adult=scene("idle");
 assert.equal(adult.limbs.length,4);
 assert.equal(adult.eyes,1);
 assert.equal(adult.mouths,1);
 assert.ok(adult.beziers>19,"anatomy, wings, mane and tail must be organic");
});
test("V64 four independent limbs have real gallop and gathered jump",()=>{
 const run=scene("run",.4),later=scene("run",2.6),jump=scene("jump",1.3);
 assert.equal(new Set(run.limbs.map(l=>l[0])).size,4);
 assert.notDeepEqual(run.limbs,later.limbs);
 assert.notDeepEqual(run.limbs,jump.limbs);
 for(const state of ["idle","run","jump","cast","attack","hurt","dead","victory"])
  assert.ok(scene(state,1.2).paths>40,state);
});
test("V64 native maximum stats, silhouette continuity and performance contracts",()=>{
 const hero=ROSTER.find(h=>h.id==="cuerno");
 assert.deepEqual(hero.abilities,["gleam","gallop","rainbow"]);
 assert.equal(hero.forms[4].speed,9.6);
 assert.equal(hero.forms[4].jump,18.6);
 assert.equal(hero.forms[4].jumps,4);
 for(let i=0;i<5;i++)for(const other of ROSTER.filter(h=>h.id!=="cuerno")){
  assert.ok(hero.forms[i].speed>other.forms[i].speed);
  assert.ok(hero.forms[i].jump>other.forms[i].jump);
 }
 const body=src.split("function drawAuroraUnicorn(")[1].split("function draw(ctx, pose, R)")[0];
 assert.doesNotMatch(body,/Math\.random|setTimeout|setInterval|requestAnimationFrame|new Image|fetch\(/);
 assert.match(visual,/01m-cuerno-aurora-final/);
 assert.match(visual,/09j-cuerno-aurora-real-play/);
 assert.deepEqual([0,1,2,3,4].map(form=>scene("idle",.2,form).limbs.length),[0,0,4,4,4]);
});
