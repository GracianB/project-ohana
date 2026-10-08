import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {cuernoEnchantRemaining,drawCuernoHoofprints,drawCuernoEnchantClock,drawCuernoSevenHornCrest,V91_PALETTE} from "../systems/cuerno-v91-illusions.js";
const painter=()=>{const calls=[];const ctx=new Proxy({}, {get(o,k){if(k in o)return o[k];return (...args)=>calls.push([k,...args]);},set(o,k,v){o[k]=v;return true;}});return {ctx,calls};};
test("V91: K hoofprints are capped and visually distinct at every scale",()=>{
 const pts=Array.from({length:60},(_,i)=>({x:100+i*9,y:250+Math.sin(i*.2)*9}));
 for(const reduce of [false,true]){
  const {ctx,calls}=painter();drawCuernoHoofprints(ctx,pts,{x:0,y:0},500,reduce);
  const imprints=calls.filter(c=>c[0]==="ellipse");
  assert.ok(imprints.length>=8&&imprints.length<=14);
 }
});
test("V91: magical poison has a readable countdown and expires cleanly",()=>{
 assert.equal(cuernoEnchantRemaining(120,120),0);
 assert.equal(cuernoEnchantRemaining(120,75),.5);
 assert.equal(cuernoEnchantRemaining(120,30),1);
 const e={x:30,y:70,w:28,h:36,_cuernoFantasyUntil:120};
 const {ctx,calls}=painter();drawCuernoEnchantClock(ctx,e,{x:0,y:0},75,true);
 assert.ok(calls.some(c=>c[0]==="arc"));
 const expired=painter();drawCuernoEnchantClock(expired.ctx,e,{x:0,y:0},122,true);
 assert.equal(expired.calls.length,0);
});
test("V91: L draws precisely seven curved horn crests at the real wavefront",()=>{
 const {ctx,calls}=painter();
 drawCuernoSevenHornCrest(ctx,{x:400,y:320,radius:240,alpha:.75},{x:5,y:10},90,true);
 assert.equal(calls.filter(c=>c[0]==="bezierCurveTo").length,14);
 assert.equal(V91_PALETTE.length,7);
 const empty=painter();drawCuernoSevenHornCrest(empty.ctx,{x:0,y:0,radius:20,alpha:1},{x:0,y:0},90,true);
 assert.equal(empty.calls.length,0);
});
test("V91: Cuerno-only modular FX and offline release",()=>{
 const magic=fs.readFileSync("systems/cuerno-fantasy.js","utf8");
 const eng=fs.readFileSync("systems/abilities.js","utf8");
 const sw=fs.readFileSync("sw.js","utf8"),html=fs.readFileSync("index.html","utf8");
 assert.match(magic,/drawCuernoHoofprints/);assert.match(magic,/drawCuernoEnchantClock/);
 assert.match(eng,/drawCuernoSevenHornCrest\(ctx,/);
 assert.ok(eng.length<135000);
 const version=/const VERSION = "(ohana-\d+)"/.exec(sw)?.[1];
 assert.ok(version && Number(version.split("-")[1])>=291,
   "Do not regress the V91 release cache");
 assert.ok(sw.includes("systems/cuerno-v91-illusions.js?v="));
 assert.ok(html.includes(version),"HTML and service worker cache must match");
});
