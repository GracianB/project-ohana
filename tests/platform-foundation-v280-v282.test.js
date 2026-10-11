import test from "node:test";
import assert from "node:assert/strict";
import {auditPlatforms} from "../worlds/platform-audit.js";
import {platformInView} from "../worlds/terrain.js";
import {resolveBody} from "../engine/collide.js";

test("V280 geometry audit identifies bad surfaces without changing room data",()=>{
 const platforms=[{x:10,y:100,w:80,h:12},{x:20,y:80,w:0,h:10},{x:50,y:70,w:9,h:10},{x:NaN,y:0,w:30,h:20},{x:1500,y:200,w:30,h:20}];
 const frozen=JSON.stringify(platforms);
 const report=auditPlatforms(platforms,1280,720);
 assert.ok(report.some(x=>x.code==="NON_POSITIVE_SIZE"&&x.index===1));
 assert.ok(report.some(x=>x.code==="NARROW_PLATFORM"&&x.index===2));
 assert.ok(report.some(x=>x.code==="INVALID_COORDINATE"&&x.index===3));
 assert.ok(report.some(x=>x.code==="OUTSIDE_WORLD"&&x.index===4));
 assert.equal(JSON.stringify(platforms),frozen);
});
test("V281 platform visibility follows actual viewport, not fixed desktop width",()=>{
 assert.equal(platformInView(1700,80,1920),true);
 assert.equal(platformInView(1700,80,1280),false);
 assert.equal(platformInView(-250,80,1920),false);
 assert.equal(platformInView(100,80,360),true);
 assert.equal(platformInView(100,0,360),false);
});
test("V282 one-way ledges cannot snap a character standing underneath",()=>{
 const platform={x:100,y:120,w:180,h:12};
 const fromBelow={x:140,y:125,w:26,h:30,vx:0,vy:1};
 const result=resolveBody(fromBelow,[platform],{prevX:140,prevY:124});
 assert.equal(result.grounded,false);
 assert.equal(fromBelow.y,125);
});
test("V282 one-way ledges still land from above and do not catch upward jumps",()=>{
 const ledge={x:100,y:120,w:180,h:12};
 const falling={x:140,y:106,w:26,h:24,vx:0,vy:8};
 const result=resolveBody(falling,[ledge],{prevX:140,prevY:91});
 assert.equal(result.grounded,true);
 assert.equal(falling.y,96);
 const rising={x:140,y:110,w:26,h:24,vx:0,vy:-6};
 assert.equal(resolveBody(rising,[ledge],{prevX:140,prevY:120}).grounded,false);
});
test("V281 passes actual viewport width to terrain drawing",async()=>{
 const fs=await import("node:fs");
 const code=fs.readFileSync(new URL("../game.js",import.meta.url),"utf8");
 assert.match(code,/drawTerrain\(ctx, game\.platforms, world, game\.cam, t, camW\(\)\)/);
});
