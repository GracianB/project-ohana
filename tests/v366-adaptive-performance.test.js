import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { initialCanvasPressure,createResolutionRecovery,canvasDpr } from "../systems/frame-pressure.js";
import { createRenderProfiler } from "../systems/render-profiler.js";

test("V366: a small screen is not automatically a slow phone",()=>{
 assert.equal(initialCanvasPressure({width:390,height:844,touch:true,cores:8,memoryGB:8}),false);
 assert.equal(initialCanvasPressure({width:390,height:844,touch:true,cores:4}),false);
 assert.equal(initialCanvasPressure({width:390,height:844,touch:true,cores:2}),true);
 assert.equal(initialCanvasPressure({width:390,height:844,touch:true,memoryGB:2}),true);
 assert.equal(initialCanvasPressure({width:390,height:844,touch:false,cores:2,memoryGB:1}),false);
 assert.equal(initialCanvasPressure({width:1280,height:720,touch:true,cores:2,memoryGB:2}),false);
 assert.equal(canvasDpr(390,844,2,false,true),1);
 assert.equal(canvasDpr(390,844,2,false,false),1.25);
});

test("V366: recover sharpness only after a long stretch of genuinely fast frames",()=>{
 const r=createResolutionRecovery({cooldownMs:12000,stableFrames:240,fastFrameMs:21});
 r.reducedAt(0);
 assert.equal(r.observe(1),false);
 for(let i=1;i<=300;i++)assert.equal(r.observe(1+i*16.7),false,"minimum cooldown");
 for(let i=301;i<=690;i++){
  const recovered=r.observe(1+i*16.7);
  if(recovered){
   assert.ok(1+i*16.7>=12000,"quality must never oscillate within cooldown");
   return;
  }
 }
 // Still inside cooldown: at least 12 seconds are mandatory.
 for(let i=691;i<=730;i++){
  const recovered=r.observe(1+i*16.7);
  if(recovered){assert.ok(1+i*16.7>=12000);return;}
 }
 assert.fail("smooth mobile device never restored sharpness");
});

test("V366: slow or suspended frames cannot trigger a false recovery",()=>{
 const r=createResolutionRecovery({cooldownMs:0,stableFrames:5,fastFrameMs:21});
 r.reducedAt(0);r.observe(0);
 for(let i=1;i<=4;i++)assert.equal(r.observe(i*16),false);
 assert.equal(r.observe(2000),false,"tab suspension breaks the streak");
 r.pause();
 r.observe(3000);
 for(let i=1;i<5;i++)assert.equal(r.observe(3000+i*16),false);
 assert.equal(r.observe(3000+5*16),true);
});

test("V366: fixed-memory profiler reports frames, percentiles and recovers from reset",()=>{
 const p=createRenderProfiler();
 assert.deepEqual(p.snapshot({dpr:1,mode:"economy"}),{
   samples:0,fps:0,frameP95Ms:0,renderP50Ms:0,renderP95Ms:0,maxRenderMs:0,dpr:1,mode:"economy"
 });
 p.sample(0,3);
 for(let i=1;i<=120;i++)p.sample(i*16.6667,i%20===0?16:4);
 const s=p.snapshot({dpr:1.25,mode:"quality"});
 assert.equal(s.samples,120);assert.equal(s.totalFrames,120);
 assert.ok(s.fps>=59&&s.fps<=61);
 assert.ok(s.renderP50Ms>=3.9&&s.renderP50Ms<=4.1);
 assert.ok(s.renderP95Ms>=4&&s.renderP95Ms<=16);
 assert.equal(s.maxRenderMs,16);
 assert.equal(s.dpr,1.25);
 p.sample(121*16.6667,5);
 assert.equal(p.snapshot().samples,120,"ring remains bounded at 120 frames");
 p.sample(200000,999);
 assert.equal(p.snapshot().totalFrames,121,"background gap cannot count as valid frame");
 p.reset();
 assert.equal(p.snapshot().samples,0);
});

test("V366: production captures real render time but not user events or network traffic",()=>{
 const game=fs.readFileSync("game.js","utf8");
 const profiler=fs.readFileSync("systems/render-profiler.js","utf8");
 const sw=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 assert.match(game,/framePressure\.observe\(now\)/);
 assert.match(game,/resolutionRecovery\.observe\(now\)/);
 assert.match(game,/renderProfiler\.sample\(now,performance\.now\(\)-paintStarted\)/);
 assert.match(game,/game\.running && !paused && !document\.hidden/);
 assert.match(game,/if\(e2eParams\.get\("perf"\)==="1"\)/);
 assert.match(game,/window\.__OHANA_PERF=Object\.freeze/);
 assert.doesNotMatch(profiler,/\bfetch\(|sendBeacon|localStorage|indexedDB|XMLHttpRequest|WebSocket/);
 assert.match(sw,/const VERSION = "ohana-366"/);
 assert.match(sw,/systems\/render-profiler\.js\?v=/);
 assert.ok([...html.matchAll(/ohana-\d+/g)].every(x=>x[0]==="ohana-366"));
});
