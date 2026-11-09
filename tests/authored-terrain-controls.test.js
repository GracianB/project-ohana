import test from 'node:test';
import assert from 'node:assert/strict';
import {planTerrainJump} from './browser/authored-terrain-controls.mjs';

const pit={x:5100,w:300};
const snapshot=(x,{vx=12,vy=0,grounded=true,jumps=0,maxJumps=4,axis=1,down=false,jump=false}={})=>({
 s:{player:{x,y:1075,w:30,h:42,vx,vy,grounded,jumps,maxJumps},
  input:{axisX:axis,down,jump}},
 route:{terraces:[],pits:[pit]}
});

test('terrain pilot: far from the pit preserves the original frame budget',()=>{
 assert.deepEqual(planTerrainJump(snapshot(2000),14),{
  frames:14,jump:false,nearPit:false,reason:'none'
 });
});

test('terrain pilot: samples real chasm approach in small steps, not once per 14 frames',()=>{
 const before=planTerrainJump(snapshot(4880),14);
 assert.equal(before.frames,4);
 assert.equal(before.jump,false);
 assert.equal(before.nearPit,true);
 const lip=planTerrainJump(snapshot(4998),14);
 assert.equal(lip.frames,4);
 assert.equal(lip.jump,true);
 assert.equal(lip.reason,'pit-lip');
});

test('terrain pilot: physically presses the second earned jump over a 300px void',()=>{
 const apex=planTerrainJump(snapshot(5190,{grounded:false,vy:0,jumps:1,maxJumps:4}),14);
 assert.equal(apex.jump,true);
 assert.equal(apex.reason,'earned-air-jump');
 assert.equal(apex.frames,4);
});

test('terrain pilot: never grants a jump absent in the live character',()=>{
 const out=planTerrainJump(snapshot(5190,{grounded:false,vy:1,jumps:2,maxJumps:2}),14);
 assert.equal(out.jump,false);
 assert.equal(out.reason,'none');
});

test('terrain pilot: do not jump when the input holds down/drop-through',()=>{
 const out=planTerrainJump(snapshot(5000,{down:true}),14);
 assert.equal(out.jump,false);
});

test('terrain pilot: same directional guard when returning across a pit to the left',()=>{
 const out=planTerrainJump(snapshot(5425,{axis:-1,vx:-8}),14);
 assert.equal(out.jump,true);
 assert.equal(out.reason,'pit-lip');
});

test('terrain pilot: read-only planning leaves the original state untouched',()=>{
 const data=snapshot(4998);
 const original=structuredClone(data);
 const intent=planTerrainJump(data,14);
 assert.equal(intent.jump,true);
 assert.deepEqual(data,original);
});

test('terrain pilot: Dino single-jump mud gap keeps the full W hold',()=>{
 const data=snapshot(2067,{vx:4.3,jumps:0,maxJumps:1});
 data.route.pits=[{x:2150,w:190}];
 const intent=planTerrainJump(data,14);
 assert.equal(intent.nearPit,false);
 assert.equal(intent.frames,14,'do not truncate a 14-frame Dino leap to four frames');
 assert.equal(intent.jump,true);
 assert.equal(intent.reason,'pit-lip');
});
