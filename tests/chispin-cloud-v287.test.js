import test from "node:test";
import assert from "node:assert/strict";
import {stepChispinCloud} from "../systems/chispin-cloud.js";
const chispin=()=>({id:"chispin",evo:2,grounded:false,jumps:2,maxJumps:2,vy:8,vx:0,speed:5});
test("V287 airborne Chispin rides cloud and consumes fuel",()=>{
 const p=chispin();assert.equal(stepChispinCloud(p,{jump:true,right:true}),true);
 assert.equal(p.vy,.85);assert.equal(p.vx,.15);assert.equal(p._cloudFuel,71);
});
test("V287 cloud cannot fly forever or refill in the air",()=>{
 const p=chispin();p._cloudFuel=1;
 assert.equal(stepChispinCloud(p,{jump:true}),true);
 assert.equal(stepChispinCloud(p,{jump:true}),false);
 p.grounded=true;assert.equal(stepChispinCloud(p,{jump:true}),false);
 assert.equal(p._cloudFuel,72);
});
test("V287 other heroes and early evolution cannot mount cloud",()=>{
 const p=chispin();p.id="dragon";
 assert.equal(stepChispinCloud(p,{jump:true}),false);
 p.id="chispin";p.evo=1;
 assert.equal(stepChispinCloud(p,{jump:true}),false);
});
test("V287 normal jumps and release disable cloud",()=>{
 const p=chispin();p.jumps=1;
 assert.equal(stepChispinCloud(p,{jump:true}),false);
 p.jumps=2;assert.equal(stepChispinCloud(p,{jump:false}),false);
});
