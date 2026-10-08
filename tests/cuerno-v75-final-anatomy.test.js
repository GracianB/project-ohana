import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno,{cuernoTailPose,cuernoWingPose,CUERNO_VISUAL_H} from "../characters/art/cuerno.js";

const art=fs.readFileSync("characters/art/cuerno.js","utf8");
const no=()=>{};
function render(form,state="idle",phase=1.1,t=180){
 const out={limbs:0,eyes:0,saves:0,restores:0,scales:0,beziers:0,ops:[]};
 const ctx=new Proxy({},{get(o,key){
  if(key==="save")return()=>{out.saves++;out.ops.push("save")};
  if(key==="restore")return()=>{out.restores++;out.ops.push("restore")};
  if(key==="scale")return(...args)=>{out.scales++;out.ops.push("scale");assert.ok(args.every(Number.isFinite))};
  if(key==="bezierCurveTo")return(...args)=>{out.beziers++;assert.ok(args.every(Number.isFinite))};
  if(key==="translate")return(...args)=>{assert.ok(args.every(Number.isFinite));out.ops.push("translate")};
  if(key in o)return o[key];return no;
 },set(o,k,v){o[k]=v;return true}});
 const R={limb:(ctx,...args)=>{out.limbs++;assert.ok(args.slice(0,7).every(Number.isFinite))},
  eye:()=>out.eyes++,mouth:no,blush:no,sparkle:no,ellipse:no,celShade:no,halo:no};
 Cuerno.draw(ctx,{form,state,phase,t,bounce:0,speed:.9,air:state==="jump",
   cast:state==="cast"?.64:0,castSlot:3,flourish:.3,flourishN:2},R);
 assert.equal(out.saves,out.restores,"leaked canvas state at "+form+"/"+state);
 return out;
}

test("V75 obeys canonical five-form anatomy in every gameplay state",()=>{
 for(const state of ["idle","run","jump","cast","attack","hurt","victory","dead"]){
  assert.deepEqual([0,1,2,3,4].map(f=>render(f,state).limbs),[0,0,4,4,4]);
  for(let form=0;form<5;form++)assert.ok(render(form,state).eyes>0);
 }
 assert.deepEqual([...CUERNO_VISUAL_H],[118,92,91,86,82],
  "optical scales cannot quietly grow into the old giant-unicorn regression");
 assert.match(art,/coat="#1b1a28"/);
});

test("V75 tails remain rooted and bounded even at gallop extremes",()=>{
 for(const form of [2,3,4])for(const state of ["idle","run","jump","cast","victory"]){
  const seen=[];
  for(const phase of [-100,0,.35,1.8,6,100]){
   const pose=cuernoTailPose({state,phase,speed:1,air:state==="jump"},form,180);
   seen.push(pose);
   const bound=form===4?6.2:form===3?5.4:4.2;
   assert.ok(Number.isFinite(pose.swing)&&Math.abs(pose.swing)<=bound+1e-8);
   assert.ok(Number.isFinite(pose.lift)&&Math.abs(pose.lift)<=12);
  }
  assert.deepEqual(seen,[-100,0,.35,1.8,6,100].map(phase=>
   cuernoTailPose({state,phase,speed:1,air:state==="jump"},form,180)));
 }
 assert.equal((art.match(/drawRootedTail\(ctx,pose,[234]/g)||[]).length,3);
 assert.doesNotMatch(art,/const sway=Math.sin\(t\*\.068\+i\*\.53\)/);
});

test("V75 wings really open on jump, cast, and ultimate, without adding flight physics",()=>{
 for(const form of [3,4]){
  const idle=cuernoWingPose({state:"idle"},form,160);
  const jump=cuernoWingPose({state:"jump",air:true},form,160);
  const cast=cuernoWingPose({state:"cast",cast:.7,castSlot:0},form,160);
  const dream=cuernoWingPose({state:"cast",cast:.7,castSlot:3},form,160);
  assert.ok(idle.open<cast.open&&cast.open<=jump.open);
  assert.equal(dream.open,1);assert.equal(jump.open,1);
  assert.deepEqual(jump,cuernoWingPose({state:"jump",air:true},form,160));
  assert.ok(Number.isFinite(jump.flap)&&Number.isFinite(jump.hinge));
  assert.notDeepEqual(cuernoWingPose({state:"jump",air:true},form,160),
    cuernoWingPose({state:"jump",air:true},form,195));
 }
 assert.equal(cuernoWingPose({state:"jump",air:true},2,160).open,0);
 assert.match(art,/wingMotion\.hinge/);
});

test("V75 Destello animates the horn and sphere as a single face",()=>{
 const f1=art.split("function drawFirstBody(")[1].split("function drawRainbowFoal(")[0];
 assert.match(f1,/ctx\.translate\(4,-91\);ctx\.scale\(1\+squish,1-squish\)/);
 assert.match(f1,/ctx\.arc\(0,0,22,0,TAU\)/);
 assert.doesNotMatch(f1,/R\.limb|function leg\(/);
 assert.ok(render(1,"run").scales>=1);
 for(const form of [2,3,4]){
  assert.ok(render(form,"run",.2).beziers>=render(form,"idle",.2).beziers-2);
  assert.deepEqual(render(form,"jump",1.2),render(form,"jump",1.2));
 }
 assert.doesNotMatch(art,/Math\.random|requestAnimationFrame|new Image\(|setInterval\(/);
});
