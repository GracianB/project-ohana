import test from "node:test";
import assert from "node:assert/strict";
import Dino, { dinoSecondaryMotion, DINO_MOTION_PROFILES } from "../characters/art/dino.js";

function pose(form, state="run", extra={}) {
 return {form,state,t:100,phase:2.4,speed:.86,land:.52,turnPulse:.63,
   brake:.28,sway:.35,bounce:.2,breath:.4,atk:.4,cast:.36,
   castSlot:2,move:null,look:{x:1,y:0},flourish:0,flourishN:0,...extra};
}
function draw(form,state,extra={}) {
 const points=[];let saves=0,restores=0,eyes=0,paths=0;
 const ctx=new Proxy({globalAlpha:1,
   save(){saves++},restore(){restores++},
   createLinearGradient(){return {addColorStop(){}};},
   beginPath(){paths++}}, {
   get(o,k){return k in o?o[k]:()=>{};},
   set(o,k,v){o[k]=v;return true;}
 });
 const shape=(kind,vertices)=>{
   assert.ok(vertices.every(p=>Array.isArray(p)&&p.length>=2&&
     p.every((n,i)=>i<2?Number.isFinite(n):true)),
     "Non-finite "+kind+" geometry for form="+form+",state="+state);
   points.push({kind,vertices:vertices.map(p=>p.slice(0,2))});
 };
 const R={INK:"#243725",LINE:2,
   darken:c=>c,lighten:c=>c,alpha:c=>c,volume:()=>"#82b85d",
   blob:(ctx,arr)=>shape("blob",arr),poly:(ctx,arr)=>shape("poly",arr),
   swingLimb:(ctx,x,y,len,angle)=>[x+Math.sin(angle)*len,y+Math.cos(angle)*len],
   ellipse(){},eye(){eyes++},blush(){},shine(){},star(){},
   sparkle(){},halo(){}};
 Dino.draw(ctx,pose(form,state,extra),R);
 assert.equal(saves,restores,"Canvas state leaks: "+form+" "+state);
 assert.ok(points.length>0,"Character disappeared");
 if(!["dead","hurt"].includes(state)&&extra.move!=="dino-roll")assert.ok(eyes>0,"Dino gaze lost");
 return {points,eyes,paths};
}

test("V79 · each of five Dino forms has an individual and immutable movement profile",()=>{
 assert.equal(DINO_MOTION_PROFILES.length,5);
 for(const p of DINO_MOTION_PROFILES){
   assert.ok(Object.isFrozen(p),"Motion calibration should be readonly");
   assert.ok(Object.values(p).every(v=>Number.isFinite(v)&&v>.25&&v<1.5));
 }
 assert.equal(new Set(DINO_MOTION_PROFILES.map(p=>p.weight)).size,5);
 const scenes=Array.from({length:5},(_,form)=>dinoSecondaryMotion(pose(form)));
 assert.equal(new Set(scenes.map(s=>s.hipDrop)).size,5,"All five need distinct landing mass");
 assert.equal(new Set(scenes.map(s=>s.tailCounter)).size,5,"Each tail must counterbalance differently");
});

test("V79 · motion responds to turning, braking, landing and running, not decorative constants",()=>{
 for(let f=0;f<5;f++){
   const plain=dinoSecondaryMotion(pose(f,"idle",{speed:0,land:0,turnPulse:0,brake:0,sway:0}));
   const running=dinoSecondaryMotion(pose(f,"run",{land:0,turnPulse:0,brake:0}));
   const turning=dinoSecondaryMotion(pose(f,"run",{turnPulse:1,brake:0}));
   const landing=dinoSecondaryMotion(pose(f,"idle",{land:1,turnPulse:0,brake:0}));
   const stopping=dinoSecondaryMotion(pose(f,"run",{brake:1,turnPulse:0}));
   assert.notEqual(running.tailTip,plain.tailTip);
   assert.notEqual(turning.tailCounter,running.tailCounter);
   assert.notEqual(stopping.tailTip,running.tailTip);
   assert.ok(landing.hipDrop>plain.hipDrop);
   assert.ok(landing.landRipple>0);
   assert.ok(landing.squash>plain.squash);
   assert.ok(turning.eyeLook<running.eyeLook);
   assert.deepEqual(dinoSecondaryMotion(pose(f,"run")),dinoSecondaryMotion(pose(f,"run")));
 }
});

test("V79 · no impossible geometry even with adversarial input data",()=>{
 for(const f of [-10,0,2,4,400]){
   for(const state of ["idle","run","jump","fall","attack","cast","victory","hurt","dead","wall"]){
     const m=dinoSecondaryMotion(pose(f,state,{
       phase:Infinity,speed:Infinity,land:100,turnPulse:-50,
       brake:NaN,sway:Infinity,impact:Infinity}));
     assert.ok(Object.values(m).every(v=>Number.isFinite(v)),"NaN in "+state);
     assert.ok(Math.abs(m.tailCounter)<=.37+1e-9);
     assert.ok(Math.abs(m.tailTip)<=.42+1e-9);
     assert.ok(Math.abs(m.headFollow)<=.22+1e-9);
     assert.ok(m.hipDrop>=0&&m.hipDrop<=3.7);
     assert.ok(m.squash>=0&&m.squash<=.92);
     assert.ok(m.dorsalFlex>=-.16&&m.dorsalFlex<=.16);
   }
 }
});

test("V79 · all five evolutions render across movement and casting without clipping-like runaway tails",()=>{
 for(let f=0;f<5;f++){
   for(const state of ["idle","run","jump","fall","attack","cast","victory","hurt","dead","wall"]){
     for(const phase of [0,1.6,3.5,7]){
       const scene=draw(f,state,{phase,land:.9,turnPulse:.9,brake:.75});
       const livingTail=scene.points.find(p=>p.kind==="blob"&&p.vertices.length===19);
       if(f>0){
         assert.ok(livingTail,"The full-size tail must remain anatomically connected");
         for(const [x,y] of livingTail.vertices){
           assert.ok(Math.abs(x)<155 && Math.abs(y)<135,
             "Tail exited safe silhouette at form="+f+", "+state+", phase="+phase+": "+x+"/"+y);
         }
       }
     }
   }
 }
});

test("V79 · dinosaur's roll remains a contained shape and does not inherit standing recoil",()=>{
 for(let f=0;f<5;f++){
   const r=draw(f,"run",{move:"dino-roll",turnPulse:1,land:1,sway:1,brake:1});
   assert.ok(r.points.filter(x=>x.kind==="poly"&&x.vertices.length===3).length>=9);
 }
});
