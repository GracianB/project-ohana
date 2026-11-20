import assert from 'node:assert/strict';
import test from 'node:test';
import {ROSTER} from '../characters/roster.js';
import {drawAttackCrest} from '../systems/remate-art.js';

function frame(id,slot,options={}){
 const ops=[];
 const ctx=new Proxy({},{
  get:(state,key)=>state[key]??((...values)=>ops.push([key,...values])),
  set:(state,key,value)=>{state[key]=value;ops.push([key,value]);return true;},
 });
 drawAttackCrest(ctx,id,slot,{x:0,y:0,age:2,...options});
 return ops;
}

test('J, K, L, I and P have 60 separately drawn finite cast silhouettes',()=>{
 const shapes=new Set();
 for(const {id} of ROSTER)for(const slot of [0,1,2,4,5]){
  const ops=frame(id,slot);
  const geometry=ops.filter(([key])=>key==='bezierCurveTo'||key==='quadraticCurveTo');
  assert.ok(geometry.length>=4);
  assert.ok(geometry.every(([, ...values])=>values.every(Number.isFinite)));
  shapes.add(JSON.stringify(geometry));
  assert.equal(ops.filter(([op])=>op==='save').length,1);
  assert.equal(ops.filter(([op])=>op==='restore').length,1);
 }
 assert.equal(shapes.size,60);
});

test('crests mirror their launch direction and hold size in reduced motion',()=>{
 const scale=(options)=>frame('cat',5,options).find(([op])=>op==='scale');
 assert.deepEqual(scale({age:0,reduced:true,face:-1}),scale({age:20,reduced:true,face:-1}));
 assert.equal(scale({face:-1})[1],-scale({face:1})[1]);
 assert.equal(frame('cat',5,{age:46}).length,0);
 assert.equal(frame('cat',5,{x:Infinity}).length,0);
 assert.equal(frame('cat',3).length,0);
});
