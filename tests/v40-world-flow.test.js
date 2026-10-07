import test from "node:test";
import assert from "node:assert/strict";
import { ROOM_HAZARDS, HAZARD_TYPES, hazardAt, hazardContainsX, hazardTrigger } from "../systems/hazards.js";
import { WORLD_NODES, WORLD_EDGES, worldGraphSnapshot } from "../systems/world-graph.js";
import { traversalProfile } from "../systems/traversal-nodes.js";
import { ROOM_ART, livingWorldSnapshot } from "../worlds/living-worlds.js";

const p=(x,y,vy=8)=>({x,y,w:32,h:36,vy});

test("V40: los descensos centrales son hazards explícitos",()=>{
  for(const room of ["beach","jungle","ridge","space"]){
    assert.equal(ROOM_HAZARDS[room]?.[0]?.type,HAZARD_TYPES.TRANSFER,room);
    assert.ok(ROOM_HAZARDS[room][0].dest,room+"/dest");
  }
});

test("V40: Caldera contiene un pozo mortal real",()=>{
  const h=ROOM_HAZARDS.volcano?.[0];
  assert.equal(h.type,HAZARD_TYPES.DEATH);
  assert.equal(h.id,"magma-pit");
  const player=p(1120,1160,7);
  assert.equal(hazardContainsX("volcano",player)?.id,"magma-pit");
  assert.equal(hazardAt("volcano",player)?.id,"magma-pit");
  assert.equal(hazardTrigger("volcano",player)?.type,HAZARD_TYPES.DEATH);
});

test("V40: una caída Beach→Reef se activa por profundidad y no por coordenada mágica",()=>{
  const high=p(1080,1040,8);
  const deep=p(1080,1110,8);
  assert.equal(hazardContainsX("beach",high)?.id,"reef-drop");
  assert.equal(hazardTrigger("beach",high),null);
  assert.equal(hazardTrigger("beach",deep)?.dest,"reef");
});

test("V40: World Graph tiene diez nodos y red tipada",()=>{
  assert.equal(Object.keys(WORLD_NODES).length,10);
  assert.ok(WORLD_EDGES.length>=16);
  for(const type of ["door","drop","catapult","vortex"]) assert.ok(WORLD_EDGES.some((e)=>e.type===type),type);
  const state=worldGraphSnapshot("hub",{hub:true,beach:true},0);
  assert.equal(state.nodes.find((n)=>n.id==="hub").current,true);
  assert.equal(state.nodes.find((n)=>n.id==="beach").visited,true);
});

test("V40: perfiles de traversal distinguen catapultas y vórtices por ruta",()=>{
  const coast=traversalProfile("hub","beach","catapult");
  const reef=traversalProfile("reef","beach","catapult");
  const astral=traversalProfile("space","reef","blackhole");
  assert.equal(coast.kind,"catapult");
  assert.equal(reef.kind,"catapult");
  assert.notEqual(coast.vy,reef.vy);
  assert.equal(astral.kind,"vortex");
  assert.ok(Math.abs(astral.twist)>1);
  assert.notEqual(astral.label,"Vórtice Ohana");
});

test("V40: cada sala tiene afinidad heroica canónica única",()=>{
  const expected={
    hub:"kilo",beach:"frita",jungle:"stitcho",cave:"cat",lab:"chispin",
    ridge:"cuerno",space:"yomi",reef:"pizza",volcano:"dragon",boss:"dino"
  };
  assert.deepEqual(Object.fromEntries(Object.entries(ROOM_ART).map(([id,a])=>[id,a.hero])),expected);
  assert.equal(new Set(Object.values(expected)).size,10);
  for(const [room,hero] of Object.entries(expected)){
    assert.equal(livingWorldSnapshot(room,hero).affinity,true,room);
    assert.equal(livingWorldSnapshot(room,"kilo").affinity,hero==="kilo",room+"/off-affinity");
  }
});
