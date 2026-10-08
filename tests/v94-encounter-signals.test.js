import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {buildEncounterSpatialIndex} from "../systems/encounter-spatial.js";
import {MAX_ENCOUNTER_MARKERS,selectEncounterSignals,drawEncounterSignals} from "../systems/encounter-signals.js";
import {directEnemyEncounter} from "../systems/enemy-director.js";
const foe=(i,x,y=500)=>({kind:i%2?"mosquito":"cangrejo",spawnIndex:i,x,y,w:30,h:26,hp:100,max:100,aggro:0});
const player={x:420,y:480,w:30,h:42,dead:false};
test("V94 indexed radius is exact, including cells across negative and positive boundaries",()=>{
 const group=Array.from({length:96},(_,i)=>foe(i,i*19-400,380+i%6*55));
 const spatial=buildEncounterSpatialIndex(group);
 assert.ok(spatial.cellCount>=5);
 for(const e of group){
  for(const radius of [300,360]){
   const direct=group.filter(o=>o!==e&&Math.hypot(o.x-e.x,o.y-e.y)<radius).length;
   assert.equal(spatial.countNear(e,radius),direct);
  }
 }
});
test("V94 crowded director preserves close neighbors, alerts and attack budgets",()=>{
 const enemies=Array.from({length:32},(_,i)=>foe(i,100+i*34,500+i%3*25));
 enemies[0].aggro=80;
 const result=directEnemyEncounter(enemies,player,"volcano",180);
 assert.ok(result.budget<=3);
 assert.equal(enemies.filter(e=>e.aiAttackPermit).length,result.committed);
 for(const e of enemies){
  const expected=enemies.filter(o=>o!==e&&Math.hypot((o.x+15)-(e.x+15),(o.y+13)-(e.y+13))<300).length;
  assert.equal(e.aiPack,expected);
 }
});
test("V94 opponent telegraphs prioritized; cap 3, bounds, dead/hidden enemies excluded",()=>{
 const enemies=Array.from({length:15},(_,i)=>({...foe(i,340+i*9),aiAttackPermit:true,aiThreat:.6}));
 enemies[8].telegraph=true;enemies[9].dead=true;
 const chosen=selectEncounterSignals(enemies,player,{x:0,y:0},{width:1000,height:700});
 assert.equal(chosen.length,MAX_ENCOUNTER_MARKERS);
 assert.equal(chosen[0].enemy,enemies[8]);
 assert.deepEqual(selectEncounterSignals(enemies,{...player,dead:true},{},{width:1000,height:700}),[]);
});
test("V94 canvas signals deterministic and muted with reduced motion",()=>{
 const enemies=[{...foe(0,390),telegraph:true},{...foe(1,420),aiAttackPermit:true,aiThreat:.7}];
 const ops=[];const ctx=new Proxy({},{get(o,k){if(k in o)return o[k];return(...a)=>ops.push([k,...a]);},set(o,k,v){o[k]=v;return true;}});
 assert.equal(drawEncounterSignals(ctx,enemies,player,{x:0,y:0},90,{width:900,height:650},true),2);
 assert.equal(ops.filter(x=>x[0]==="arc").length,2);
 assert.equal(ops.filter(x=>x[0]==="save").length,2);
 assert.equal(ops.filter(x=>x[0]==="restore").length,2);
});
test("V94 integrated in game and precached for offline; no old-version lock",()=>{
 const sw=fs.readFileSync("sw.js","utf8"),game=fs.readFileSync("game.js","utf8"),html=fs.readFileSync("index.html","utf8");
 assert.match(game,/drawEncounterSignals\(ctx,game\.enemies/);
 const version=sw.match(/const VERSION = "(ohana-[0-9]+)"/)?.[1];
  assert.ok(version && Number(version.slice(6))>=294);
 for(const module of ["encounter-spatial","encounter-signals"])
  assert.ok(sw.includes("./systems/"+module+'.js?v='));
 assert.ok(html.includes(version));
});
