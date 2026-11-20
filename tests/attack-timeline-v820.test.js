import assert from 'node:assert/strict';
import test from 'node:test';
import {ROSTER} from '../characters/roster.js';
import {attackCastTimeline,drawAttackCrest} from '../systems/remate-art.js';

const slots=[[0,18],[1,26],[2,32],[4,26],[5,46]];

function sample(id,slot,age,reduced=false){
 const effects=[];
 const ctx=new Proxy({globalAlpha:1},{
  get:(state,key)=>state[key]??((...values)=>{
   if(key==='scale'||key==='translate') effects.push([key,...values]);
  }),
  set:(state,key,value)=>{
   if(key==='globalAlpha')effects.push([key,value]);
   state[key]=value;
   return true;
  },
 });
 drawAttackCrest(ctx,id,slot,{x:0,y:0,age,reduced});
 return effects;
}

test('each of the 60 attacks has ten beats with ten finite settings',()=>{
 const timelines=new Set();
 let count=0;
 for(const {id} of ROSTER)for(const [slot] of slots){
  const beats=attackCastTimeline(id,slot);
  assert.equal(beats.length,10);
  for(const beat of beats){
   assert.equal(beat.length,10);
   assert.ok(beat.every(value=>Number.isFinite(value)&&value>0&&value<1.5));
   count+=beat.length;
  }
  for(let track=0;track<10;track++)assert.ok(new Set(beats.map(beat=>beat[track])).size>=8);
  timelines.add(JSON.stringify(beats));
 }
 assert.equal(timelines.size,60);
 assert.equal(count,6000);
 assert.equal(attackCastTimeline('cat',3),undefined);
});

test('all ten beats reach the renderer, with fixed geometry in reduced motion',()=>{
 for(const {id} of ROSTER)for(const [slot,life] of slots){
  const frames=Array.from({length:10},(_,i)=>sample(id,slot,life*i/10));
  assert.equal(new Set(frames.map(JSON.stringify)).size,10);
  for(const frame of frames){
   assert.equal(frame.length,10);
   assert.ok(frame.every(([, ...values])=>values.every(Number.isFinite)));
   assert.ok(frame.filter(([name])=>name==='globalAlpha').every(([,alpha])=>alpha>=0&&alpha<=1));
  }
  const geometry=age=>sample(id,slot,age,true).filter(([name])=>name!=='globalAlpha');
  assert.deepEqual(geometry(0),geometry(life*.9));
 }
});
