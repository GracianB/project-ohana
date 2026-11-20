import assert from 'node:assert/strict';
import test from 'node:test';
import {ROSTER} from '../characters/roster.js';
import {drawRemateDetail,drawRemateSilhouette} from '../systems/remate-art.js';

function capture(){
 const ops=[];
 const ctx=new Proxy({},{get:(_,key)=>(...values)=>ops.push([key,...values]),set:(_,key,value)=>(ops.push([key,value]),true)});
 return {ctx,ops};
}
test('each remate has eight separately drawn, finite ornaments',()=>{
 const shapes=new Set();
 for(const {id} of ROSTER)for(let i=0;i<8;i++){
  const {ctx,ops}=capture();
  drawRemateDetail(ctx,id,i,{x:0,y:0,r:60});
  const geometry=ops.filter(([key])=>key==='moveTo'||key==='lineTo');
  assert.ok(geometry.length>=3,id);
  assert.ok(geometry.every(([,x,y])=>Number.isFinite(x+y)),id);
  shapes.add(JSON.stringify(geometry));
 }
 assert.equal(shapes.size,96);
});
test('reduced-motion preparation keeps both geometry and opacity steady',()=>{
 function frame(progress){
  const {ctx,ops}=capture();
  drawRemateSilhouette(ctx,'nacar',{x:10,y:40,r:50,stage:'windup',progress,reduced:true});
  return ops;
 }
 assert.deepEqual(frame(0),frame(1));
 const {ctx,ops}=capture();
 drawRemateSilhouette(ctx,'cat',{x:Infinity,y:0,r:45});
 drawRemateDetail(ctx,'cat',3,{x:0,y:0,r:Infinity});
 assert.equal(ops.length,0);
});
