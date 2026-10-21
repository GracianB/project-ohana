import test from 'node:test';
import assert from 'node:assert/strict';
import {michiMotion,MICHI_KINETIC_STATES} from '../characters/michi-motion.js';
import {michiWelcomeBeat,drawMichiWelcomeFX} from '../systems/intro-michi-stage.js';
import {michicornioEvoBeat,drawEvoCine,EVO_CINE_DURATION,MICHI_EVO_ACTS} from '../systems/evo-cine/michi.js';
import {drawEvolutionActor} from '../systems/evo-cine/real-actor.js';
import cat from '../characters/art/cat.js';
const ctx=()=>new Proxy({globalAlpha:1,lineWidth:1},{get(o,k){
 if(k in o)return o[k];
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop(){}});
 return()=>{};
},set(o,k,v){o[k]=v;return true;}});
const p=(state,t,form=0,reduced=false)=>({state,t,phase:t*.19,form,
 cast:.45,atk:.5,look:{x:.4,y:0},castSlot:2,speed:1,reduceMotion:reduced});
test('V460: moving Michicornio has actual animated paws, head, ears and nine-tendril lag',()=>{
 assert.equal(MICHI_KINETIC_STATES.length,10);
 for(let f=0;f<5;f++){
  const a=michiMotion(p('run',7,f),f),b=michiMotion(p('run',31,f),f);
  for(const key of ['frontY','backY','frontPaw','backX','frontX','head','tail','ear','lookX','ribbon','spine'])
   assert.ok(Number.isFinite(a[key])&&Number.isFinite(b[key]),f+': '+key+' is not finite');
  assert.notDeepEqual([a.frontX,a.backX,a.frontY,a.head,a.tail],
    [b.frontX,b.backX,b.frontY,b.head,b.tail],'frozen gait F'+f);
  assert.notEqual(michiMotion(p('jump',17,f),f).lean,michiMotion(p('fall',17,f),f).lean);
  assert.doesNotThrow(()=>cat.draw(ctx(),p('run',31,f),{}));
 }
});
test('V460: physical animation never changes collision and reduced motion is clock-independent',()=>{
 for(const state of MICHI_KINETIC_STATES)for(let f=0;f<5;f++){
  const actor={x:300,y:480,w:24,h:29,id:'cat',evo:f,grounded:state==='run'};
  const before=JSON.stringify(actor);
  const a=michiMotion(p(state,10,f,true),f),b=michiMotion(p(state,107,f,true),f);
  assert.deepEqual(a,b,'reduced motion must not animate '+state+'/'+f);
  cat.draw(ctx(),p(state,100,f,true),{});
  assert.equal(JSON.stringify(actor),before,'renderer must never alter collisions');
 }
});
test('V460: intro lunar crown, iris and live reactions retain original family timing',()=>{
 for(const second of [0,.7,1.0,2.08,3.32,4.2,5.14,6,8.45,12.2,13.9]){
  const x=michiWelcomeBeat(second);
  assert.ok([x.moonCrown,x.headFocus,x.tailCascade,x.shimmer].every(v=>v>=0&&v<=1));
  assert.doesNotThrow(()=>drawMichiWelcomeFX(ctx(),150,220,80,second,x,'back'));
  assert.doesNotThrow(()=>drawMichiWelcomeFX(ctx(),150,220,80,second,x,'front'));
  assert.equal(michiWelcomeBeat(second,true).moonCrown,0);
 }
 assert.ok(michiWelcomeBeat(5.14).moonCrown>michiWelcomeBeat(0).moonCrown);
});
test('V460: four cinematic acts animate real feline forms and medusa-tendril reveal',()=>{
 assert.equal(EVO_CINE_DURATION,4);
 assert.deepEqual(MICHI_EVO_ACTS.map(x=>x.id),['listen','gather','morph','reveal']);
 const frames=[0,.7,1.2,1.74,1.76,2.2,2.8,3.1,3.8];
 assert.deepEqual(frames.map(x=>michicornioEvoBeat(x,2,3).act),
  ['listen','listen','gather','gather','morph','morph','morph','reveal','reveal']);
 assert.equal(michicornioEvoBeat(3.4,4,5).tendrils,9);
 assert.equal(michicornioEvoBeat(3.4,2,3).tendrils,7);
 for(let from=1;from<5;from++)for(const t of frames){
  assert.doesNotThrow(()=>drawEvoCine(ctx(),960,540,t,from,from+1));
 }
 assert.doesNotThrow(()=>drawEvolutionActor(ctx(),'cat',200,300,1.8,3,2.2,{state:'cast'}));
});
