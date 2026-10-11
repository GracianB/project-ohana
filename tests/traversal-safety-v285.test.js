import test from "node:test";
import assert from "node:assert/strict";
import {boundedArrivalSpawn,boundedTraversalKick} from "../systems/traversal-safety.js";
test("catapult arrival remains inside destination even for largest form",()=>{
 assert.deepEqual(boundedArrivalSpawn({x:2000,y:2000},65,75,1600,1000),{x:1511,y:905});
});
test("vortex arrival stays inside left and upper margins",()=>{
 assert.deepEqual(boundedArrivalSpawn({x:-400,y:-200},40,60,1600,900),{x:24,y:16});
});
test("vortex kick is controlled and bounded",()=>{
 const k=boundedTraversalKick({vx:100,vy:-80,facing:1,type:"blackhole"});
 assert.equal(k.vx,4.5);assert.equal(k.vy,-6);
});
test("catapult preserves normal impulses, rejects runaway speed",()=>{
 const k=boundedTraversalKick({vx:-50,vy:-40,type:"catapult"});
 assert.equal(k.vx,-9.5);assert.equal(k.vy,-12);assert.equal(k.facing,-1);
});
