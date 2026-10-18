import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {DRAGON_EMBERS,newDragonTrial,updateDragonTrial,dragonTrialSnapshot,drawDragonTrial} from "../systems/dragon-trial.js";
import {ROOMS} from '../systems/map.js';
import {ROSTER} from '../characters/roster.js';

test("V87 Dragon sanctuary asks for three reachable heights, no network-gated door",()=>{
 assert.equal(DRAGON_EMBERS.length,3);
 assert.ok(new Set(DRAGON_EMBERS.map(e=>e.title)).size===3);
 assert.ok(Math.max(...DRAGON_EMBERS.map(e=>e.y))-Math.min(...DRAGON_EMBERS.map(e=>e.y))>300);
 const g={roomId:"volcano",player:{x:0,y:0,w:28,h:46,dead:false},dragonTrial:newDragonTrial()};
 const story=[];
 for(const ember of DRAGON_EMBERS){
  g.player.x=ember.x-g.player.w*.5;
  g.player.y=ember.y-g.player.h*.55;
  for(let t=0;t<29;t++)assert.equal(updateDragonTrial(g),null);
  const hit=updateDragonTrial(g);
  assert.ok(hit);
  story.push(hit.count);
  assert.equal(updateDragonTrial(g),null,"Can't exploit collected embers");
 }
 assert.deepEqual(story,[1,2,3]);
 assert.deepEqual(dragonTrialSnapshot(g.dragonTrial).lit,[true,true,true]);
 assert.equal(dragonTrialSnapshot(g.dragonTrial).completed,true);
});

test("V87 Dragon markers ignore other rooms, dead players and distant locations",()=>{
 const g={roomId:"hub",player:{x:290,y:910,w:28,h:46},dragonTrial:newDragonTrial()};
 assert.equal(updateDragonTrial(g),null);
 g.roomId="volcano";g.player.dead=true;assert.equal(updateDragonTrial(g),null);
 g.player.dead=false;g.player.x=3000;assert.equal(updateDragonTrial(g),null);
 assert.equal(g.dragonTrial.count,0);
});

test("V87 Dragon shrine is deterministic vector work, balanced and canvas safe",()=>{
 const g={roomId:"volcano",dragonTrial:newDragonTrial()};
 const events=[];
 const ctx=new Proxy({},{
  get(o,k){if(k in o)return o[k];if(k==="createRadialGradient")return()=>({addColorStop(){}});return(...a)=>events.push([k,...a]);},
  set(o,k,v){o[k]=v;return true;}
 });
 assert.doesNotThrow(()=>drawDragonTrial(ctx,g,{x:0,y:0},120,true));
 assert.ok(events.some(e=>e[0]==="bezierCurveTo"));
 const src=fs.readFileSync("systems/dragon-trial.js","utf8");
 assert.doesNotMatch(src,/Math.random|setInterval|requestAnimationFrame/);
});

test("V87 U cinema shows actual gameplay without spawning secondary simulation",()=>{
 const s=fs.readFileSync("systems/supreme-cinema.js","utf8");
 const game=fs.readFileSync("game.js","utf8");
 const sw=fs.readFileSync("sw.js","utf8"),html=fs.readFileSync("index.html","utf8");
 assert.match(s,/ctx\.drawImage\(live,xx,yy,ww,hh\)/);
 assert.match(s,/el\.dataset\.livePreview=showLive/);
 assert.match(s,/IMPACTO REAL EN LA ARENA/);
 assert.match(game,/updateDragonTrial\(game\)/);
 assert.match(game,/dragonTrialSnapshot\(game\.dragonTrial\)/);
 const version=sw.match(/const VERSION = "(ohana-[0-9]+)"/)?.[1];
 assert.ok(version && Number(version.slice(6))>=287);
 assert.match(sw,/systems\/dragon-trial\.js\?v=/);
 assert.ok(html.includes(version));
});

test("V447: all Dragon embers have reachable real platforms across expanded Caldera",()=>{
 const room=ROOMS.volcano,dragon=ROSTER.find(r=>r.id==='dragon').forms[4];
 assert.equal(room.sectors.length,5);
 const occupiedSectors=new Set();
 for(const e of DRAGON_EMBERS){
  assert.ok(e.x>1600&&e.x<room.width-100, "ember is inside expanded adventure terrain");
  const sector=room.sectors.find(s=>e.x>=s.x&&e.x<s.x+s.w);
  assert.ok(sector,"every ritual node maps to a real world sector");
  occupiedSectors.add(sector.id);
  const feet=e.y+dragon.h*(1-.55);
  assert.ok(room.plats.some(p=>p[3]<=24&&e.x>=p[0]+20&&e.x<=p[0]+p[2]-20&&Math.abs(p[1]-feet)<=3)
   ||room.plats.some(p=>p[3]>40&&e.x>=p[0]+20&&e.x<=p[0]+p[2]-20&&Math.abs(p[1]-feet)<=3),
   e.title+" must be supported by true game collision");
 }
 assert.equal(occupiedSectors.size,3,"ritual spans three distinct sectors");
 const above=room.plats.some(p=>p[0]<=5390&&p[0]+p[2]>=5390&&p[1]===734);
 assert.equal(above,true,"final ember has a reachable authored altar");
});
