import test from "node:test";
import assert from "node:assert/strict";
import {ROOMS,ROOM_W} from "../systems/map.js";
import {ROSTER} from "../characters/roster.js";
import {strategicLedgesFor,STRATEGIC_LEDGES} from "../systems/room-strategy.js";
test("V288: every game room has two optional tactical platforms",()=>{
 assert.equal(Object.keys(ROOMS).length,10);
 assert.equal(Object.keys(STRATEGIC_LEDGES).length,10);
 for(const [id,room] of Object.entries(ROOMS)){
  assert.equal(STRATEGIC_LEDGES[id].length,2,id);
  for(const plat of STRATEGIC_LEDGES[id]){
   const left=plat[0]*1.5,right=(plat[0]+plat[2])*1.5;
   assert.ok(room.plats.some(p=>p[3]<=24&&Math.abs(p[1]-plat[1])<56&&Math.min(p[0]+p[2],right)-Math.max(p[0],left)>=160),id+": tactical landing survives merged seams");
   assert.ok(plat[0]>=0&&plat[0]+plat[2]<=ROOM_W,id);
   assert.ok(plat[3]<=24&&plat[2]>=160,id);
  }
 }
});
test("V288: the 50 hero forms retain adequate room to land on tactical ledges",()=>{
 const widths=ROSTER.flatMap(r=>r.forms.map(f=>f.w));
 const max=Math.max(...widths);
 for(const ledges of Object.values(STRATEGIC_LEDGES))
  for(const p of ledges)assert.ok(p[2]>max+20);
});
test("V288: central descent holes remain open in pit rooms",()=>{
 for(const id of ["beach","jungle","ridge","space"]){
  const inserted=STRATEGIC_LEDGES[id];
  assert.ok(inserted.every(p=>p[0]+p[2]<=900||p[0]>=1340),id);
 }
});
test("V288: strategy ledges do not repeat identical existing geometry",()=>{
 const existing=[[660,730,180,22]];
 assert.equal(strategicLedgesFor("hub",existing).length,1);
});
