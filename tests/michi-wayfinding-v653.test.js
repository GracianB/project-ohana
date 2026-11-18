import test from 'node:test';
import assert from 'node:assert/strict';
import {sanctuaryEdgeBeacon} from '../worlds/michi-sanctuary-art.js';

test('offscreen indicator stays inside the safe play region at 320, 390 and desktop',()=>{
 const goal=Object.freeze({x:9500,y:500,label:'Farol'});
 const cam=Object.freeze({x:100,y:200});
 for(const [w,h] of [[320,568],[390,844],[1280,720]]){
  const p=sanctuaryEdgeBeacon(goal,cam,w,h);
  assert.ok(p);assert.ok(p.x>=42&&p.x<=w-42);assert.ok(p.y>=0&&p.y<h);
  assert.ok(Number.isFinite(p.angle));
 }
 assert.equal(goal.label,'Farol');assert.deepEqual(cam,{x:100,y:200});
});
test('on-screen and malformed objectives do not spawn false guidance',()=>{
 assert.equal(sanctuaryEdgeBeacon({x:250,y:200},{},390,844),null);
 assert.equal(sanctuaryEdgeBeacon({x:Infinity,y:20},{},390,844),null);
 assert.equal(sanctuaryEdgeBeacon({x:12,y:NaN},{},390,844),null);
 assert.equal(sanctuaryEdgeBeacon(null,{},390,844),null);
 assert.equal(sanctuaryEdgeBeacon({x:-100,y:200},{},130,220),null);
});
test('offscreen directions are deterministic and finite',()=>{
 const cam={x:1000,y:1000},W=390,H=844;
 for(const goal of [{x:0,y:1100},{x:9999,y:1100},{x:1195,y:-500},{x:1195,y:9000}]){
  const p=sanctuaryEdgeBeacon(goal,cam,W,H);
  assert.ok(p,JSON.stringify(goal));
  assert.ok(p.x>=42&&p.x<=W-42&&p.y>=110&&p.y<=H-155,JSON.stringify(p));
  assert.deepEqual(p,sanctuaryEdgeBeacon(goal,cam,W,H));
 }
});
