import assert from 'node:assert/strict';
import test from 'node:test';
import {ROSTER} from '../characters/roster.js';
import {drawRemateDetail} from '../systems/remate-art.js';

function frame(id,layer,progress,reduced=false){
 const ops=[];
 const ctx=new Proxy({},{
  get:(state,key)=>state[key]??((...values)=>ops.push([key,...values])),
  set:(state,key,value)=>{state[key]=value;ops.push([key,value]);return true;},
 });
 drawRemateDetail(ctx,id,layer,{x:10,y:20,r:60,face:-1,progress,reduced});
 return ops;
}

test('all 96 remate entrances have distinct offsets and rotations and resolve to their final path',()=>{
 const entrances=new Set();
 for(const {id} of ROSTER)for(let layer=0;layer<8;layer++){
  const early=frame(id,layer,0),mid=frame(id,layer,.5),end=frame(id,layer,1);
  const key=early.filter(([op])=>op==='translate'||op==='rotate');
  entrances.add(JSON.stringify(key));
  assert.notDeepEqual(early,mid);
  assert.notDeepEqual(mid,end);
  assert.deepEqual(end.find(([op])=>op==='scale'),['scale',-60,60]);
  assert.equal(early.filter(([op])=>op==='stroke').length,2);
  assert.ok(end.filter(([op])=>op==='lineTo').length>=early.filter(([op])=>op==='lineTo').length);
  assert.deepEqual(frame(id,layer,0,true),end);
  assert.deepEqual(frame(id,layer,1,true),end);
 }
 assert.equal(entrances.size,96);
});
