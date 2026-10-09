import test from "node:test";
import assert from "node:assert/strict";
import {canvasDpr,createFramePressureMonitor} from "../systems/frame-pressure.js";
import fs from "node:fs";
test("OHANA responsiveness: canvas caps expensive desktop DPR and preserves small phones",()=>{
 assert.equal(canvasDpr(1920,1080,2,false,false),1);
 assert.equal(canvasDpr(1280,720,2,false,false),1.1);
 assert.equal(canvasDpr(390,844,2,false,false),1.25);
 assert.equal(canvasDpr(390,844,2,true,false),1);
 assert.equal(canvasDpr(390,844,2,false,true),1);
});
test("OHANA responsiveness: sustained frame pressure lowers resolution; one stall does not",()=>{
 const m=createFramePressureMonitor();
 assert.equal(m.observe(1000),false);
 assert.equal(m.observe(2000),false);
 for(let i=1;i<=48;i++){
   const changed=m.observe(2000+i*34);
   if(i<48)assert.equal(changed,false);
   else assert.equal(changed,true);
 }
 assert.equal(m.snapshot().lowered,true);
 const smooth=createFramePressureMonitor();
 smooth.observe(0);
 for(let i=1;i<=48;i++)assert.equal(smooth.observe(i*16),false);
 assert.equal(smooth.snapshot().lowered,false);
});
test("OHANA responsiveness: fast portals and first-screen input are explicit contracts",()=>{
 const portals=fs.readFileSync("systems/portals.js","utf8");
 const intro=fs.readFileSync("systems/intro.js","utf8");
 const game=fs.readFileSync("game.js","utf8");
 assert.match(portals,/const max = reduce \? 5 : type === "blackhole" \? 10 : 8/);
 assert.doesNotMatch(portals,/c\.max \+ 30/);
 assert.match(intro,/t>=0\.16/);
 assert.match(intro,/out: 0\.31, end: 0\.46/);
 assert.match(game,/canvasDpr\(viewW,viewH/);
 assert.match(game,/framePressure\.observe\(now\)/);
 assert.match(game,/createFixedClock\(\{ maxSteps: 3 \}\)/);
});
