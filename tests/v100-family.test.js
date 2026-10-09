import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {ROSTER} from "../characters/roster.js";
import {FAMILY_ROSTER_V100,familyFinaleBeat} from "../systems/v100-family-choreography.js";

test("V100 finale recognizes all ten canonical heroes exactly once",()=>{
 const ids=ROSTER.map(c=>c.id).sort();
 assert.deepEqual(Object.keys(FAMILY_ROSTER_V100).sort(),ids);
 assert.equal(ids.length,10);
 const signatures=Object.values(FAMILY_ROSTER_V100).map(b=>[b.pose,b.offset,b.tempo,b.amp].join("/"));
 assert.equal(new Set(signatures).size,10);
 assert.ok(Object.isFrozen(FAMILY_ROSTER_V100));
});
test("V100 each identity has an individual celebration, no random particles",()=>{
 const poses=new Set();
 for(const id of Object.keys(FAMILY_ROSTER_V100)){
  let seenActive=false;
  for(let t=0;t<8;t+=.1){
   const b=familyFinaleBeat(id,t);
   for(const val of [b.lift,b.melee,b.vx])assert.ok(Number.isFinite(val));
   assert.ok(["idle","victory","jump","run","attack"].includes(b.pose));
   if(b.pose!=="idle"){poses.add(b.pose);seenActive=true;}
   if(b.pose==="jump")assert.equal(b.grounded,false);
  }
  assert.equal(seenActive,true,id+" has no special celebration");
 }
 assert.ok(poses.size>=4,"Family must not be ten copies of one animation");
 const module=fs.readFileSync("systems/v100-family-choreography.js","utf8");
 assert.doesNotMatch(module,/Math\.random|requestAnimationFrame|fetch\(|setInterval/);
});
test("V100 motion accessibility preserves a stable finale for the full family",()=>{
 for(const id of Object.keys(FAMILY_ROSTER_V100)){
  const one=familyFinaleBeat(id,0,{reduced:true});
  const later=familyFinaleBeat(id,340,{reduced:true});
  assert.deepEqual(one,later);
  assert.equal(one.lift,0);
  assert.equal(one.grounded,true);
 }
 assert.equal(familyFinaleBeat("cuerno",1,{chosen:true}).pose,"victory");
 assert.equal(familyFinaleBeat("unknown",3).pose,"idle");
});
test("V100 production cinematic, accessible results, cache and release agree",()=>{
 const ending=fs.readFileSync("systems/ending.js","utf8");
 const sw=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 const progress=fs.readFileSync("PROGRESS.md","utf8");
 const intro=fs.readFileSync("systems/intro.js","utf8");
 assert.match(ending,/familyFinaleBeat\(id,t-duration\*\.77,\{reduced:reduce,chosen\}\)/);
 assert.match(ending,/actor\(p,x,ground\+beat\.lift/);
 assert.match(ending,/card\.inert=true/);
 assert.match(ending,/card\.inert=false/);
 assert.match(ending,/const duration=reduce\?1\.6:14\.5/);
 assert.match(sw,/const VERSION = "ohana-302"/);
 assert.ok(html.includes("ohana-302")&&progress.includes("ohana-300"));
 assert.match(sw,/systems\/v100-family-choreography\.js\?v=/);
 assert.match(intro,/PROJECT OHANA/);
 assert.match(intro,/<strong>OHANA<\/strong>/);
});
