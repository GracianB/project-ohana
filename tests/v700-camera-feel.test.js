import test from 'node:test';
import assert from 'node:assert/strict';
import {horizontalLook,smoothCameraLook,clearBufferedActions} from '../engine/camera.js';
test('camera gives velocity-scaled preview only while moving',()=>{
 assert.equal(horizontalLook({vx:0,facing:1}),0);
 assert.equal(horizontalLook({vx:NaN,facing:-1}),0);
 assert.equal(horizontalLook({vx:6,facing:-1})>horizontalLook({vx:2,facing:1}),true);
 assert.equal(horizontalLook({vx:-6,facing:1})<0,true);
 assert.equal(horizontalLook({vx:500})<=86,true);
 assert.equal(horizontalLook({vx:-500})>=-86,true);
 assert.equal(horizontalLook({vx:9,dead:true}),0);
});
test('dash cue keeps its existing 48px contract',()=>{
 assert.equal(horizontalLook({_dashGo:1,_dashFace:1,vx:12}),48);
 assert.equal(horizontalLook({_dashGo:2,_dashFace:-1,vx:12}),-48);
});
test('look-ahead changes are gradual, stable and never overshoot',()=>{
 let value=0;
 for(let i=0;i<80;i++){
  const next=smoothCameraLook(value,80);
  assert.ok(next-value>=0&&next-value<=8.001);value=next;
 }
 assert.ok(value>75&&value<=80);
 const reversed=smoothCameraLook(value,-80);
 assert.ok(value-reversed<=8.001);
 assert.ok(reversed>=-86&&Number.isFinite(reversed));
});
test('camera never propagates corrupted motion state',()=>{
 assert.equal(smoothCameraLook(NaN,Infinity),0);
 assert.equal(smoothCameraLook(Infinity,-Infinity),0);
 assert.ok(Number.isFinite(smoothCameraLook(20,NaN)));
});
test('jump/dash/attack buffers still clear without touching active physics',()=>{
 const p={buffer:8,dashBuf:4,meleeBuf:2,vx:3,vy:-6};
 clearBufferedActions(p);
 assert.deepEqual(p,{buffer:0,dashBuf:0,meleeBuf:0,vx:3,vy:-6});
});
