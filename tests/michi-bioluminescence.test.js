import test from 'node:test';
import assert from 'node:assert/strict';
import {MICHI_BIOLUM_FORMS,michiPerformance,drawMichiLanternKitten,drawMichiTideStar,drawMichiAstralCapybara,drawMichiLivingHalo} from '../characters/michi-lumina.js';
import {planMichiLights,isMichiWorld,MICHI_LIGHT_LIMIT} from '../worlds/michi-reactive-night.js';

const BASE={state:'idle',t:105,phase:1.2,look:{x:0,y:0},atk:.6,cast:.4,castSlot:2,michiSeed:7};
const states=['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory','dead'];
const draw=[drawMichiLanternKitten,drawMichiLivingHalo,drawMichiLivingHalo,drawMichiTideStar,drawMichiAstralCapybara];
const canvas=()=>{
 let stack=0,count=0,geo=0,alpha=1;
 const gradient={addColorStop(offset,color){assert.ok(offset>=0&&offset<=1,'gradient stops are bounded');assert.ok(typeof color==='string');}};
 const state={globalAlpha:1,fillStyle:'#000',strokeStyle:'#000',lineWidth:1};
 const ctx=new Proxy({},{
  get:(_,name)=>{
   if(name in state)return state[name];
   if(name==='createRadialGradient'||name==='createLinearGradient')return (...args)=>{assert.ok(args.every(Number.isFinite));return gradient;};
   return (...args)=>{
    count++;for(const v of args)if(typeof v==='number')assert.ok(Number.isFinite(v),name+' nonfinite number');
    if(name==='ellipse'||name==='arc')assert.ok(args[2]>=0);
    if(name==='save')stack++;if(name==='restore'){stack--;assert.ok(stack>=0);}
    if(['ellipse','arc','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','scale','rotate'].includes(name))geo++;
   };
  },
  set:(_,key,v)=>{
   if(typeof v==='number')assert.ok(Number.isFinite(v),key+' nonfinite state');
   if(key==='globalAlpha')assert.ok(v>=0&&v<=1,'invalid alpha');
   state[key]=v;return true;
  }
 });
 return {ctx,result(){return {stack,count,geo,alpha}}};
};
test('five distinct canonical forms with growing illumination',()=>{
 assert.equal(MICHI_BIOLUM_FORMS.length,5);
 assert.deepEqual(MICHI_BIOLUM_FORMS.map(f=>f.id),['kitten','fae','jelly','star','capybara']);
 assert.ok(MICHI_BIOLUM_FORMS.every((f,i)=>i===0||f.radius>MICHI_BIOLUM_FORMS[i-1].radius));
});
test('all new silhouettes and light halos render for real action states with finite geometry',()=>{
 for(let form=0;form<5;form++)for(const state of states){
  const pose=Object.freeze({...BASE,form,state,look:Object.freeze({x:0,y:0})});
  const before=JSON.stringify(pose),c=canvas();
  if(form===1||form===2)draw[form](c.ctx,pose,form);
  else draw[form](c.ctx,pose);
  assert.equal(JSON.stringify(pose),before,'renderer must not mutate actor');
  assert.equal(c.result().stack,0);
  assert.ok(c.result().geo>24,'character must render detailed live geometry');
 }
});
test('reduced motion freezes the light acting clock and action state',()=>{
 const a=michiPerformance({...BASE,reduceMotion:true,t:10,phase:2.1});
 const b=michiPerformance({...BASE,reduceMotion:true,t:901,phase:6.8});
 assert.deepEqual(a,b);
});
test('all six cast powers retain distinct animated intentions',()=>{
 const list=[0,1,2,3,4,5].map(michiPowerIndex=>michiPerformance({...BASE,state:'cast',michiPowerIndex}).power);
 assert.deepEqual(list,[0,1,2,3,4,5]);
});
test('darkness never spills to unrelated heroes or games and the living world glows near the actual actor',()=>{
 const base={roomDef:{hero:'cat',world1:true},cam:{x:100,y:0},worldH:1260,player:{x:400,y:990,w:22,h:22,evo:0},enemies:[{x:430,y:980,w:30,h:20,kind:'medusa',hp:20}]};
 assert.equal(isMichiWorld({...base,roomDef:{hero:'dragon',world1:true}}),false);
 assert.equal(planMichiLights({...base,roomDef:{hero:'dragon',world1:true}}),null);
 const plan=planMichiLights(base,{width:390,height:844});
 assert.equal(plan.hero.x,311);assert.equal(plan.enemies.length,1);
 assert.ok(plan.hero.radius>100);assert.ok(plan.flowers.some(f=>f.near>0));
 const evolved=planMichiLights({...base,player:{...base.player,evo:4}},{width:390,height:844});
 assert.ok(evolved.hero.radius>plan.hero.radius);assert.ok(evolved.darkness<plan.darkness);
 assert.ok(plan.enemies.length<=MICHI_LIGHT_LIMIT.enemies);
});
