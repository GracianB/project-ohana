import test from "node:test";
import assert from "node:assert/strict";
import {platformInView} from "../worlds/terrain.js";
import {resolveBody,hitsSolid} from "../engine/collide.js";

test("V280: platforms at the right edge of ultrawide cameras remain renderable",()=>{
 assert.equal(platformInView(1800,120,2560),true);
 assert.equal(platformInView(2800,100,2560),false);
 assert.equal(platformInView(-500,100,2560),false);
 assert.equal(platformInView(120,0,2560),false);
});
test("V282: one-way platforms catch falling feet from above",()=>{
 const ledge={x:50,y:200,w:140,h:16};
 const player={x:70,y:175,w:24,h:32,vy:6};
 const result=resolveBody(player,[ledge],{prevX:70,prevY:163});
 assert.equal(result.grounded,true);
 assert.equal(player.y,168);
});
test("V282: one-way platforms never teleport characters rising from below",()=>{
 const ledge={x:50,y:200,w:140,h:16};
 const player={x:70,y:177,w:24,h:32,vy:1};
 const result=resolveBody(player,[ledge],{prevX:70,prevY:183});
 assert.equal(result.grounded,false);
 assert.equal(player.y,177);
});
test("V282: invalid zero-size or nonfinite platforms cannot block movement",()=>{
 const invalid=[{x:0,y:0,w:0,h:40},{x:NaN,y:0,w:100,h:50}];
 const player={x:5,y:0,w:20,h:20,vy:5};
 assert.equal(hitsSolid(player,invalid),null);
 assert.equal(resolveBody(player,invalid,{prevX:5,prevY:-10}).grounded,false);
});
