import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ROOMS } from "../systems/map.js";
import { FESTIVAL_ROOMS, FESTIVAL_STORIES, FESTIVAL_CATALOG, FESTIVAL_TOTAL, FESTIVAL_KINDS, festivalPlacements, festivalProgress, festivalNear, Festival } from "../systems/v1002-festival.js";

test("V100.2: 100 motivos únicos en 10 mundos y 10 familias",()=>{
 assert.equal(FESTIVAL_TOTAL,100);
 assert.equal(FESTIVAL_ROOMS.length,10);
 assert.equal(FESTIVAL_KINDS.length,10);
 assert.equal(FESTIVAL_CATALOG.length,100);
 assert.equal(new Set(FESTIVAL_CATALOG.map(x=>x.id)).size,100);
 assert.equal(new Set(FESTIVAL_CATALOG.map(x=>x.title)).size,100);
 assert.equal(new Set(FESTIVAL_CATALOG.map(x=>x.kind)).size,10);
 assert.equal(new Set(FESTIVAL_CATALOG.map(x=>x.description)).size,100);
 assert.equal(Object.values(FESTIVAL_STORIES).flat().length,100);
 for(const r of FESTIVAL_ROOMS){assert.equal(r.titles.length,10);assert.ok(ROOMS[r.id],r.id);}
});
test("V100.2: cada hallazgo pertenece a plataforma real y está al alcance",()=>{
 for(const room of FESTIVAL_ROOMS){
  const platforms=ROOMS[room.id].plats.map(([x,y,w,h])=>({x,y,w,h}));
  const items=festivalPlacements(room.id,platforms);
  assert.equal(items.length,10,room.id);
  for(const item of items){
   assert.ok(platforms.some(p=>item.x>p.x&&item.x<p.x+p.w&&item.y===p.y-34),item.id);
   assert.ok(Number.isFinite(item.x)&&Number.isFinite(item.y),item.id);
   assert.equal(festivalNear({x:item.x-15,y:item.y-18,w:30,h:36},item),true);
   assert.equal(festivalNear({x:item.x+400,y:item.y,w:30,h:30},item),false);
  }
 }
});
test("V100.2: album ignora duplicados y claves inventadas",()=>{
 const ids=FESTIVAL_CATALOG.slice(0,15).map(x=>x.id);
 const p=festivalProgress([...ids,...ids,"inventado"]);
 assert.equal(p.found,15);assert.equal(p.byRoom.hub,10);assert.equal(p.byRoom.beach,5);
 assert.equal(Festival.snapshot().total,100);
});
test("V100.2: integración y offline completos",()=>{
 const g=fs.readFileSync("game.js","utf8");
 const sw=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 const css=fs.readFileSync("v100-2.css","utf8");
 for(const s of ["Festival.mount()","Festival.onEnterRoom(game)","Festival.update(game, t)","Festival.draw(ctx,game.cam,t,game"])assert.ok(g.includes(s),s);
 assert.match(sw,/systems\/v1002-festival\.js\?v=/);
 assert.match(sw,/v100-2\.css\?v=/);
 assert.match(sw,/const VERSION = "ohana-308"/);
 assert.match(html,/id="festival-album"/);
 assert.match(html,/id="btn-festival-title"/);
 assert.match(css,/prefers-reduced-motion/);
});
