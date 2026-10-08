import test from "node:test";
import assert from "node:assert/strict";
import {newDragonTrial,DRAGON_EMBERS,DRAGON_CHANNEL_FRAMES,updateDragonTrial,dragonTrialSnapshot} from "../systems/dragon-trial.js";
const make=()=>({roomId:"volcano",player:{x:0,y:0,w:28,h:46,dead:false},dragonTrial:newDragonTrial()});
const near=(g,i)=>{const b=DRAGON_EMBERS[i];g.player.x=b.x-14;g.player.y=b.y-25;};
test("V88: unordered touches cannot skip the Dragon's three-stage ceremony",()=>{
 const g=make();near(g,2);for(let i=0;i<80;i++)assert.equal(updateDragonTrial(g),null);
 assert.equal(g.dragonTrial.count,0);
 for(let j=0;j<3;j++){near(g,j);
   for(let i=0;i<DRAGON_CHANNEL_FRAMES-1;i++)assert.equal(updateDragonTrial(g),null);
   const event=updateDragonTrial(g);
   assert.equal(event?.count,j+1);
 }
 assert.equal(dragonTrialSnapshot(g.dragonTrial).completed,true);
});
test("V88: leaving flame resets charge; no idle, stale room or dead hero wins",()=>{
 const g=make();near(g,0);
 for(let t=0;t<20;t++)updateDragonTrial(g);
 assert.ok(dragonTrialSnapshot(g.dragonTrial).charge>0);
 g.player.x=4000;assert.equal(updateDragonTrial(g),null);
 assert.equal(dragonTrialSnapshot(g.dragonTrial).charge,0);
 near(g,0);g.roomId="boss";
 for(let t=0;t<80;t++)assert.equal(updateDragonTrial(g),null);
 assert.equal(g.dragonTrial.count,0);
});
