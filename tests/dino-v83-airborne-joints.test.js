import test from 'node:test';
import assert from 'node:assert/strict';
import Dino, { dinoAirbornePose } from '../characters/art/dino.js';

const forms=[
  {legW:12,bw:17},
  {legW:13,bw:16},
  {legW:14,bw:17},
  {legW:17,bw:21},
  {legW:16,bw:20},
];
function pose(form,state,overrides={}) {
  return {form,state,phase:1.42,t:115,vy:0,look:{x:1,y:0},
    speed:.5,breath:.14,bounce:0,sway:0,land:0,turnPulse:0,
    brake:0,flourish:0,flourishN:0,cast:0,castSlot:-1,atk:0,...overrides};
}
function inspect(p) {
  const operations=[];
  let depth=0;
  const ctx=new Proxy({globalAlpha:1,save(){depth++;},restore(){depth--;},
    createRadialGradient(){return {addColorStop(){}};},
    createLinearGradient(){return {addColorStop(){}};},
    ellipse(...args){operations.push({kind:'ellipse',args});},
    translate(...args){operations.push({kind:'translate',args});},
    rotate(...args){operations.push({kind:'rotate',args});},
  },{
    get(o,k){return k in o?o[k]:(...args)=>{
      if(k==='arc'||k==='bezierCurveTo'||k==='moveTo')
        operations.push({kind:k,args});
    };},
    set(o,k,v){o[k]=v;return true;}
  });
  const shapes=[];
  const R={INK:'#223',LINE:2.4,
    darken:c=>c,lighten:c=>c,alpha:c=>c,volume:()=> '#87ba65',
    swingLimb:(ctx,x,y,len,ang)=>[x+Math.sin(ang)*len,y+Math.cos(ang)*len],
    blob:(ctx,pts,fill,opt)=>shapes.push({kind:'blob',pts,fill,opt}),
    poly:(ctx,pts,fill,opt)=>shapes.push({kind:'poly',pts,fill,opt}),
    ellipse(){},eye(){},blush(){},shine(){},sparkle(){},star(){},halo(){}
  };
  Dino.draw(ctx,p,R);
  assert.equal(depth,0,'Canvas save/restore stack leak');
  for(const item of operations){
    for(const value of item.args)if(typeof value==='number')
      assert.ok(Number.isFinite(value),'Nonfinite Canvas instruction '+item.kind);
  }
  for(const item of shapes){
    assert.ok(item.pts.every(p=>p.slice(0,2).every(Number.isFinite)),
      'Nonfinite procedural geometry');
  }
  return {operations,shapes};
}
test('V83 5/5 airborne poses change smoothly through jump apex into fall',()=>{
 for(let form=0;form<5;form++){
   const early=dinoAirbornePose({state:'jump',vy:-.7},form);
   const apexJump=dinoAirbornePose({state:'jump',vy:0},form);
   const apexFall=dinoAirbornePose({state:'fall',vy:0},form);
   const late=dinoAirbornePose({state:'fall',vy:.7},form);
   assert.deepEqual(apexJump,apexFall,'Apex is not continuous at F'+form);
   assert.ok(early.down<apexJump.down&&apexJump.down<late.down);
   assert.ok(early.lenF<late.lenF,'Hoof should extend before landing');
   assert.ok(early.legF>late.legF,'Both legs must gradually untuck');
   assert.ok(early.tailA>late.tailA,'Tail counterbalances descent');
   assert.ok(Object.isFrozen(early));
   const a=inspect(pose(form,'jump',{vy:0}));
   const b=inspect(pose(form,'fall',{vy:0}));
   assert.deepEqual(a,b,'Geometry snaps at jump/fall transition F'+form);
 }
});
test('V83 numeric safety and deterministic interpolation over every form',()=>{
 for(let form of [-100,0,1,2,3,4,100]){
   for(let vy of [-Infinity,-100,-1,-.30,-.1,0,.1,.30,1,100,Infinity,NaN]){
     const x=dinoAirbornePose({state:'fall',vy},form);
     assert.ok(Object.values(x).every(Number.isFinite));
     assert.ok(x.down>=0&&x.down<=1);
     assert.ok(x.lenF>=.68&&x.lenF<=.84);
     assert.ok(x.lenB>=.7&&x.lenB<=.85);
     assert.ok(x.jaw>=0&&x.jaw<=.38);
     assert.deepEqual(x,dinoAirbornePose({state:'fall',vy},form));
   }
 }
});
test('V83 both near-side joints blend naturally in every adult evolution and combat state',()=>{
 for(let form=1;form<=4;form++){
   const shoulderX=forms[form].bw*.7;
   const adultHipRadius=forms[form].legW*.48;
   for(const state of ['idle','run','jump','fall','attack','cast','hurt','victory','dead']){
     const p=pose(form,state,{
       vy:state==='jump'?-.8:state==='fall'?.8:0,
       cast:state==='cast'?.5:0,castSlot:state==='cast'?3:-1});
     const {operations}=inspect(p);
     const hip=operations.filter(o=>o.kind==='ellipse'&&o.args[0]===6
       &&Math.abs(o.args[2]-adultHipRadius)<.00001);
     const shoulder=operations.filter(o=>o.kind==='ellipse'
       &&Math.abs(o.args[0]-shoulderX)<.00001
       &&Math.abs(o.args[2]-(5+form*.4)*.85)<.00001);
     assert.equal(hip.length,1,'Lost near hip join F'+form+' '+state);
     assert.equal(shoulder.length,1,'Lost shoulder join F'+form+' '+state);
   }
 }
 for(const state of ['idle','jump','fall']){
   const hatchling=inspect(pose(0,state));
   assert.equal(hatchling.operations.filter(o=>o.kind==='ellipse'&&o.args[0]===6
     &&Math.abs(o.args[2]-forms[0].legW*.48)<.00001).length,0,
     'Baby F0 must retain shell anatomy, not grow an adult hip');
 }
});
test('V83 Dino roll stays a compact sphere with no adult joint overlays',()=>{
 for(let form=0;form<5;form++){
   const result=inspect(pose(form,'run',{move:'dino-roll',phase:2.2}));
   assert.ok(result.shapes.filter(s=>s.kind==='poly'&&s.pts.length===3).length>=9,
     'Rolling spine lost shape on form '+form);
   assert.equal(result.operations.filter(o=>o.kind==='ellipse'
     &&Math.abs(o.args[0]-6)<.01
     &&Math.abs(o.args[2]-forms[form].legW*.48)<.01).length,0);
 }
});
