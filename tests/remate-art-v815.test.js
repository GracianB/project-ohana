import assert from 'node:assert/strict';
import test from 'node:test';
import {ROSTER} from '../characters/roster.js';
import {drawRemateSilhouette,drawReturningSlice} from '../systems/remate-art.js';

function capture(){
 const operations=[];
 const ctx=new Proxy({},{get:(_,key)=>(...args)=>{
  assert.ok(args.filter(v=>typeof v==='number').every(Number.isFinite));
  operations.push([key,...args]);
 },set:()=>true});
 return {ctx,operations};
}

test('all twelve remates have different drawn geometry and mirror with facing',()=>{
 const profiles=new Set();
 for(const {id} of ROSTER){
  const {ctx,operations}=capture();
  drawRemateSilhouette(ctx,id,{x:20,y:50,r:60,face:-1});
  assert.ok(operations.some(([key])=>key==='fill'));
  assert.ok(operations.some(([key,scale])=>key==='scale'&&scale===-60));
  profiles.add(JSON.stringify(operations));
 }
 assert.equal(profiles.size,ROSTER.length);
});

test('preparation holds its geometry in reduced motion and pizza shows its return',()=>{
 function windup(progress){
  const {ctx,operations}=capture();
  drawRemateSilhouette(ctx,'cat',{x:20,y:50,r:60,stage:'windup',progress,reduced:true});
  return operations;
 }
 assert.deepEqual(windup(0),windup(1));
 const outbound=capture(), returning=capture();
 drawReturningSlice(outbound.ctx,80,40,{vx:12,vy:0},false);
 drawReturningSlice(returning.ctx,80,40,{vx:-17,vy:0,returning:true},true);
 assert.ok(returning.operations.length>outbound.operations.length);
 assert.ok(returning.operations.some(([key,angle])=>key==='rotate'&&angle===Math.PI));
});
