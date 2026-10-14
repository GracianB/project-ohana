import test from "node:test";
import assert from "node:assert/strict";
import {ROSTER} from "../characters/roster.js";
import {guestPerformance,GUEST_ACTING} from "../systems/u-duet-direction-v315.js";
import {FAMILY_DUETS,FAMILY_DUET_BEATS,FAMILY_DUET_LENGTH,
 familyDuetChoreography,familyDuetPose,readFamilyDuet,drawFamilyDuet} from "../systems/family-duets.js";

const HEROES=["dragon","dino","frita","pizza","yomi","cuerno"];
const STAGES=[
 {age:8,stage:"arrival",pose:"run"},
 {age:27,stage:"exchange",pose:"idle"},
 {age:42,stage:"borrowed-L",pose:"attack"},
 {age:72,stage:"borrowed-L",pose:"attack"},
 {age:111,stage:"farewell",pose:"victory"}
];
function view(id,evo,age,facing=1){
 return {hero:id,x:242,y:300,evo,age,facing};
}
function mockCanvas(){
 const calls=[],ctx={globalAlpha:.83},saved=[];
 return {
  calls,ctx:new Proxy(ctx,{
   get(target,key){
    if(key==="save")return()=>{saved.push({...target});calls.push(["save"]);};
    if(key==="restore")return()=>{Object.assign(target,saved.pop());calls.push(["restore"]);};
    if(key in target)return target[key];
    return(...args)=>{calls.push([key,...args.map(x=>Number.isFinite(x)?Math.round(x*100)/100:x)]);};
   },
   set(target,key,value){target[key]=value;return true;}
  })
 };
}
test("V305–V311: six authentic borrowed L labels and distinct actors",()=>{
 assert.deepEqual(Object.keys(FAMILY_DUETS).sort(),HEROES.slice().sort());
 for(const id of HEROES){
  const duet=FAMILY_DUETS[id],ally=ROSTER.find(r=>r.id===duet.ally);
  assert.ok(ally,duet.ally);
  assert.equal(duet.borrowedL,ally.abilities[2],id+"/real L");
  assert.ok(duet.cue.includes(ally.name.toUpperCase())||duet.cue.includes(ally.id.toUpperCase()),duet.cue);
  assert.match(duet.cue,/ · /);
  assert.ok(Object.isFrozen(duet));
 }
 assert.deepEqual([...FAMILY_DUET_BEATS],[42,66,90]);
 assert.equal(FAMILY_DUET_LENGTH,120);
});
for(const hero of HEROES){
 test(hero+": stage signature is coherent across 5 evolution forms and 5 timeline chapters",()=>{
  for(let evo=0;evo<5;evo++){
   for(const entry of STAGES){
    const state=view(hero,evo,entry.age);
    const choreo=familyDuetChoreography(state),pose=familyDuetPose(state);
    assert.equal(choreo.hero,hero);
    assert.equal(choreo.form,evo);
    assert.equal(choreo.stage,entry.stage);
    assert.equal(choreo.borrowedL,FAMILY_DUETS[hero].borrowedL);
    assert.equal(choreo.accentCount,2+evo);
    assert.equal(choreo.ally,ROSTER.find(r=>r.id===choreo.ally)?.id);
    assert.ok(Number.isFinite(choreo.allyX)&&Number.isFinite(choreo.allyY));
    assert.ok(choreo.opacity>=0&&choreo.opacity<=1);
    assert.equal(choreo.allyX,pose.allyX);
    assert.ok(Object.isFrozen(choreo));
    const {ctx,calls}=mockCanvas(),actors=[];
    const drawn=drawFamilyDuet(ctx,state,{x:0,y:0},108,
     (_ctx,actor)=>actors.push(actor),ROSTER,false);
    assert.equal(drawn,true);
    assert.equal(actors.length,1,hero+"/"+evo+"/"+entry.stage);
    const a=actors[0],form=ROSTER.find(r=>r.id===FAMILY_DUETS[hero].ally).forms[evo];
    assert.equal(a.id,FAMILY_DUETS[hero].ally);
    assert.equal(a.evo,evo);
    assert.equal(a.w,form.w);
    assert.equal(a.h,form.h);
    // V315: the five canonical duets still share chapter timestamps, but
    // each *guest* has an authored pose rather than the old generic run.
    const authored=guestPerformance(state,FAMILY_DUETS[hero].ally);
    assert.equal(a._poseOverride,authored.pose);
    assert.equal(authored.style,GUEST_ACTING[FAMILY_DUETS[hero].ally].style);
    if(entry.stage==="arrival")assert.ok(["run","jump","glide","idle"].includes(a._poseOverride));
    else if(entry.stage==="exchange"||entry.stage==="farewell")assert.ok(["run","glide"].includes(a._poseOverride));
    else assert.equal(a._poseOverride,entry.pose);
    assert.equal(a._duetActor,true);
    assert.ok(a.visualScale>=.62);
    assert.equal(calls.filter(c=>c[0]==="save").length,calls.filter(c=>c[0]==="restore").length);
    if(entry.stage==="exchange"){
     const captions=calls.filter(c=>c[0]==="fillText").map(c=>c[1]);
     assert.ok(captions.includes(FAMILY_DUETS[hero].cue),"named borrowed L caption");
     assert.ok(captions.includes(FAMILY_DUETS[hero].line),"personality line");
    }
   }
  }
 });
 test(hero+": L impact and telegraph align at each of three authored beats",()=>{
  for(let i=0;i<3;i++){
   const b=FAMILY_DUET_BEATS[i];
   const pre=familyDuetChoreography(view(hero,4,b-8));
   const impact=familyDuetChoreography(view(hero,4,b));
   const tail=familyDuetChoreography(view(hero,4,b+8));
   assert.equal(pre.keyframe,i);assert.equal(pre.telegraph,true);assert.equal(pre.impact,false);
   assert.equal(impact.keyframe,i);assert.equal(impact.telegraph,false);assert.equal(impact.impact,true);
   assert.equal(tail.keyframe,i);assert.equal(tail.telegraph,false);assert.equal(tail.impact,false);
   assert.ok(pre.progress<1&&pre.progress>0);
  }
 });
 test(hero+": reduced motion suppresses oscillation, trims ornaments, is frame-static",()=>{
  for(let evo=0;evo<5;evo++){
   const frame=view(hero,evo,67,-1);
   const s=familyDuetChoreography(frame,true);
   assert.equal(s.accentCount,2);
   assert.equal(s.allyX, familyDuetPose(frame,true).allyX);
   assert.equal(s.allyY, familyDuetPose(frame,true).allyY);
   const render=t=>{
    const {ctx,calls}=mockCanvas();
    const actors=[];
    drawFamilyDuet(ctx,frame,{x:0,y:0},t,(_ctx,actor)=>actors.push(actor),ROSTER,true);
    return {calls,actors};
   };
   assert.deepEqual(render(2),render(902),"reduced motion cannot rely on clock time");
  }
 });
 test(hero+": malformed peer frames never draw borrowed L or invoke actor",()=>{
  const frame=view(hero,4,37),rejected=[
   {...frame,hero:"unknown"}, {...frame,age:120},{...frame,evo:5},
   {...frame,x:Infinity},{...frame,age:NaN},{...frame,facing:0},
   {...frame,x:-999999},null
  ];
  for(const input of rejected){
   assert.equal(readFamilyDuet(input),null);
   assert.equal(familyDuetChoreography(input),null);
   const {ctx}=mockCanvas();let drawings=0;
   assert.equal(drawFamilyDuet(ctx,input,{x:0,y:0},10,()=>drawings++,ROSTER,false),false);
   assert.equal(drawings,0);
  }
 });
}
