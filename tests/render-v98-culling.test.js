import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { visibleForRender,OHANA_RENDER_MARGIN } from "../systems/render-v98-culling.js";

test("V98 conservative camera pass keeps visible and border-overlapping sprites",()=>{
 const cam={x:1000,y:300},w=1280,h=720;
 assert.equal(visibleForRender({x:1001,y:301,w:32,h:40},cam,w,h),true);
 assert.equal(visibleForRender({x:800,y:400,w:20,h:30},cam,w,h),true,
  "Near edge must not pop out of existence");
 assert.equal(visibleForRender({x:790,y:400,w:15,h:30},cam,w,h),false);
 assert.equal(visibleForRender({x:999,y:100,w:26,h:14},cam,w,h),true);
 assert.equal(visibleForRender({x:999,y:90,w:26,h:14},cam,w,h),false);
 assert.equal(visibleForRender({x:10000,y:500,w:26,h:14},cam,w,h),false);
 assert.ok(OHANA_RENDER_MARGIN>=128);
});
test("V98 render guard is finite, deterministic and never mutates world entities",()=>{
 const cam={x:0,y:0};
 const entity={x:500,y:300,w:200,h:50,taken:false};
 const before=structuredClone(entity);
 for(let i=0;i<1000;i++)assert.equal(visibleForRender(entity,cam,800,600),true);
 assert.deepEqual(entity,before);
 for(const invalid of [
  null,{x:NaN,y:0},{x:Infinity,y:0},{x:0,y:-Infinity}
 ])assert.equal(visibleForRender(invalid,cam,800,600),false);
 assert.equal(visibleForRender({x:801,y:0,r:3},cam,800,600,0),false);
 assert.equal(visibleForRender({x:799,y:0,r:3},cam,800,600,0),true);
});
test("V98 actual production drawing uses culling on expensive objects, never game logic",()=>{
 const game=fs.readFileSync("game.js","utf8");
 for(const code of ["game.orbs","game.hearts","game.ghosts","game.enemies",
  "game.projectiles","game.bolts"]){
  assert.ok(game.includes(code),"Missing "+code);
 }
 assert.match(game,/e\.boss \|\| visibleForRender\(e,game\.cam/);
 assert.match(game,/visibleForRender\(pr,game\.cam/);
 assert.match(game,/visibleForRender\(b,game\.cam/);
 const source=fs.readFileSync("systems/render-v98-culling.js","utf8");
 assert.doesNotMatch(source,/Math\.random|requestAnimationFrame|fetch\(|setInterval/);
});
test("V98 new runtime guard is precached and release-ready",()=>{
 const sw=fs.readFileSync("sw.js","utf8"),html=fs.readFileSync("index.html","utf8");
 assert.match(sw,/const VERSION = "ohana-298"/);
 assert.match(html,/ohana-298/);
 assert.match(sw,/systems\/render-v98-culling\.js\?v=/);
 assert.match(sw,/systems\/a11y-v97\.js\?v=/);
 assert.match(sw,/systems\/coop-v95-presence\.js\?v=/);
});
