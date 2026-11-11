import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveBody} from '../engine/collide.js';
const thin={x:100,y:100,w:80,h:18};
function approaching(vy=4){return {x:71,y:71,w:28,h:30,vx:1,vy};}
test('V649: default behavior remains strict without explicit forgiveness',()=>{
 const p=approaching();const hit=resolveBody(p,[thin],{prevX:70,prevY:67});
 assert.equal(hit.grounded,false);
});
test('V649: a genuine close one-way edge landing is caught',()=>{
 const p=approaching();const hit=resolveBody(p,[thin],{prevX:70,prevY:67,cornerForgiveness:3});
 assert.equal(hit.grounded,true);assert.equal(p.y,70);assert.equal(p.vy,0);
});
test('V649: never catches ascending heroes or intentional drop-through',()=>{
 const up=approaching(-4);assert.equal(resolveBody(up,[thin],{prevY:67,cornerForgiveness:3}).grounded,false);
 const down=approaching();assert.equal(resolveBody(down,[thin],{prevY:67,cornerForgiveness:3,dropThroughY:100}).grounded,false);
});
test('V649: solid wall interactions do not inherit toe landing tolerance',()=>{
 const block={x:100,y:80,w:90,h:80},p=approaching();
 const hit=resolveBody(p,[block],{prevX:70,prevY:67,cornerForgiveness:3});
 assert.equal(hit.grounded,false);
});
