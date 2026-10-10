import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { FESTIVAL_CATALOG, FESTIVAL_ROOMS, Festival } from "../systems/v1002-festival.js";
import { WORLD_MILESTONES, V101_COMPLETION_REWARD, worldMilestone, chapterSeal, FestivalMoment } from "../systems/v101-milestones.js";

test("V101: ten genuinely distinct seals, no rewards for 9/10 or repeated chapters", () => {
  assert.equal(WORLD_MILESTONES.length,10);
  assert.deepEqual(WORLD_MILESTONES.map(x=>x.id),FESTIVAL_ROOMS.map(x=>x.id));
  for(const key of ["seal","title","verse","epilogue"]){
    assert.equal(new Set(WORLD_MILESTONES.map(x=>x[key])).size,10,key);
  }
  for(const room of FESTIVAL_ROOMS){
    const seal=worldMilestone(room.id,9,true);
    assert.ok(seal,room.id);
    assert.equal(chapterSeal(room.id,10),seal.seal);
    assert.equal(chapterSeal(room.id,9),null);
    assert.equal(worldMilestone(room.id,8,true),null);
    assert.equal(worldMilestone(room.id,9,false),null);
  }
  assert.equal(worldMilestone("imaginary",9,true),null);
});

test("V101: tenth pickup grants one world bonus and a replayable ceremony without new items", () => {
  const claimed=Festival.claimed, run=Festival.runCollected;
  try{
    const inHub=FESTIVAL_CATALOG.filter(x=>x.room==="hub");
    Festival.claimed=new Set(inHub.slice(0,9).map(x=>x.id));
    Festival.runCollected=new Set();
    const player={x:300,y:320,w:30,h:32,grounded:true,health:40,maxHealth:100,xp:0,invuln:0};
    const sound=[];
    const game={
      player,score:0,combo:0,comboT:0,reduceMotion:true,
      fx:{emit(){}},nums:{add(){}},
      festivalSfx(name){sound.push(name);},festivalVibrate(){},
    };
    assert.equal(Festival.take(inHub[9],game),true);
    assert.equal(game.score,100+V101_COMPLETION_REWARD.score);
    assert.equal(player.health,40+V101_COMPLETION_REWARD.heal);
    assert.equal(player.xp,V101_COMPLETION_REWARD.xp);
    assert.ok(player.invuln>=180);
    assert.equal(FestivalMoment.snapshot().active,"hub");
    assert.equal(Festival.take(inHub[9],game),false,"cannot claim the same item twice within a run");
    Festival.runCollected.clear();
    const previousScore=game.score,previousXp=player.xp,previousHealth=player.health;
    assert.equal(Festival.take(inHub[9],game),true,"old rewards may be replayed in another run");
    assert.equal(game.score,previousScore+100,"world seal bonus is never repeated");
    assert.equal(player.xp,previousXp,"XP chapter bonus is never repeated");
    assert.equal(player.health,previousHealth,"chapter heal is never repeated");
    assert.ok(sound.includes("objective"));
    assert.equal(FestivalMoment.show("hub",{replay:true}),true);
    assert.equal(FestivalMoment.snapshot().replays,1);
    assert.equal(FestivalMoment.show("nonexistent"),false);
  } finally {
    Festival.claimed=claimed;
    Festival.runCollected=run;
    FestivalMoment.close();
  }
});

test("V101: browser UI, reduced-motion, storage compatibility and original-world online routing",()=>{
  const html=fs.readFileSync("index.html","utf8");
  const css=fs.readFileSync("v101-milestones.css","utf8");
  const js=fs.readFileSync("systems/v1002-festival.js","utf8");
  const sw=fs.readFileSync("sw.js","utf8");
  const lobby=fs.readFileSync("multiplayer.html","utf8");
  const coop=fs.readFileSync("systems/online-coop.js","utf8");
  const server=fs.readFileSync("netlify/lib/room-service.mjs","utf8");
  assert.match(html,/id="festival-milestone"/);
  assert.match(html,/class="festival-world-nav"/);
  assert.match(html,/project-ohana-multiplayer\.netlify\.app\/multiplayer\.html/);
  assert.match(js,/data-festival-replay/);
  assert.match(js,/worldMilestone\(item\.room,oldRoomCount,fresh\)/);
  assert.match(js,/FestivalMoment\.show\(milestone\.id/);
  assert.match(js,/ohana-festival-v1002/); // old album storage key is intentionally unchanged
  assert.match(css,/prefers-reduced-motion/);
  assert.match(sw,/v101-milestones\.css\?v=/);
  assert.match(sw,/systems\/v101-milestones\.js\?v=/);
  assert.match(sw,/const VERSION = "ohana-314"/);
  assert.match(coop,/const START_ROOM = "hub"/);
  assert.match(coop,/1: \{ x: 550, y: 1070 \}/);
  assert.match(server,/worldRoomId: "hub"/);
  assert.match(lobby,/DOS JUGADORES · LA MISMA AVENTURA/);
});
