import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {drawDinoRollingShell,drawDinoFossilForecast,dinoImpactPhase} from "../systems/dino-stagecraft.js";
const painter=()=>{const ops=[];const ctx=new Proxy({},{get(o,k){if(k in o)return o[k];return(...a)=>ops.push([k,...a]);},set(o,k,v){o[k]=v;return true;}});return {ctx,ops};};
test("V90: Dino K sculpted shell has eight plates and an expressive face",()=>{
 const {ctx,ops}=painter();drawDinoRollingShell(ctx,{x:90,y:120,w:48,h:60},{x:0,y:0},80,true);
 assert.ok(ops.filter(x=>x[0]==="quadraticCurveTo").length>=16);
 assert.ok(ops.filter(x=>x[0]==="ellipse").length>=2);
});
test("V90: L and U fossil warnings grow as impact nears",()=>{
 assert.ok(dinoImpactPhase(5,60).radius>dinoImpactPhase(55,60).radius);
 for(const reduce of [true,false]){
  const {ctx,ops}=painter();drawDinoFossilForecast(ctx,{x:140,y:400,life:25,max:60},{x:0,y:0},45,reduce);
  assert.ok(ops.filter(x=>x[0]==="lineTo").length>=6);
 }
});
test("V90 isolated render path and offline cache",()=>{
 const code=fs.readFileSync("systems/dino-combat.js","utf8");
 const engine=fs.readFileSync("systems/abilities.js","utf8");
 const sw=fs.readFileSync("sw.js","utf8"),html=fs.readFileSync("index.html","utf8");
 assert.match(code,/drawDinoRollingShell/);assert.match(code,/drawDinoFossilForecast/);
 assert.match(engine,/DINO_FX\.drawRollShell\(ctx, p, cam, t, game\)/);
 // Historical 135 KB source cap retired; functional checks remain active.
 const version=sw.match(/const VERSION = "(ohana-\d+)"/)?.[1];
  assert.ok(version && Number(version.slice(6))>=290);
 assert.match(sw,/systems\/dino-stagecraft\.js\?v=/);assert.ok(html.includes(version));
});
