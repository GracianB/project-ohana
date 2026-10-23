import test from "node:test";
import assert from "node:assert/strict";
import { WORLD1_FLOOR, WORLD1_ORDER, WORLD1_ROOMS } from "../systems/world1-rooms.js";
import {
  enterWorld1, updateWorld1, world1Snapshot,
  world1DeathCheckpoint, restoreWorld1DeathCheckpoint, world1CanLeave
} from "../systems/world1-play.js";

function makeGame(hero) {
  const room = WORLD1_ROOMS["w1-"+hero];
  const g={
    roomId:room.id,roomDef:room,reduceMotion:true,world1Seals:[],world1Visited:{},
    score:0,projectiles:[],player:{x:0,y:WORLD1_FLOOR-42,w:32,h:42,vx:0,vy:0,grounded:true,maxHealth:100,health:60,xp:0},
    nums:{add(){}},fx:{emit(){}},save(){this.saves=(this.saves||0)+1;},
    onWorld1Beat(type, id){this.events.push([type,id]);},events:[]
  };
  enterWorld1(g);
  return {g,stand(x,{air=false,y=null}={}){
    g.player.x=x-g.player.w/2;
    g.player.y=y??(WORLD1_FLOOR-g.player.h);
    g.player.vx=0;g.player.vy=air?-8:0;g.player.grounded=!air;
  },tick(){updateWorld1(g);},reload(){enterWorld1(g);}};
}

test("death: authentic first Kilo note survives room reload without extra score, seal or XP",()=>{
  const x=makeGame("kilo"),s=x.g.world1.stations[0];
  x.stand(s.x);for(let i=0;i<45;i++)x.tick();
  assert.equal(s.done,true);
  assert.equal(world1Snapshot(x.g).done,1);
  assert.equal(x.g.score,150);
  const save=world1DeathCheckpoint(x.g);
  assert.deepEqual(save.completed,[0]);
  x.reload();
  assert.equal(world1Snapshot(x.g).done,0,"raw reentry resets state, as on a death");
  assert.equal(restoreWorld1DeathCheckpoint(x.g,save),true);
  assert.equal(world1Snapshot(x.g).done,1);
  assert.equal(x.g.world1.stations[0]._scored,true);
  assert.equal(x.g.world1.sealed,false);
  assert.deepEqual(x.g.world1Seals,[]);
  assert.equal(world1CanLeave(x.g,"right"),false);
  assert.equal(x.g.score,150);
  for(const next of x.g.world1.stations.slice(1)){
    x.stand(next.x);for(let i=0;i<45;i++)x.tick();
  }
  assert.deepEqual(x.g.world1Seals,["kilo"]);
  assert.equal(x.g.score,600,"must never count a repeated note twice");
  assert.equal(x.g.player.xp,3);
  assert.equal(x.g.saves,1,"awards one seal and performs one save");
});

test("death: Stitcho delivered part ID 0 stays repaired; loose part is dropped",()=>{
  const x=makeGame("stitcho"),s=x.g.world1.stations;
  x.stand(s[0].x);x.tick();assert.equal(x.g.world1.carry,0);
  x.stand(s[0].target.x);x.tick();assert.equal(s[0].done,true);
  x.stand(s[1].x);x.tick();assert.equal(x.g.world1.carry,1);
  const snapshot=world1DeathCheckpoint(x.g);
  assert.deepEqual(snapshot.completed,[0]);
  x.reload();restoreWorld1DeathCheckpoint(x.g,snapshot);
  assert.equal(world1Snapshot(x.g).done,1);
  assert.equal(x.g.world1.carry,null,"must retrieve undelivered item anew");
  assert.equal(x.g.score,150);
  for(const station of x.g.world1.stations.slice(1)){
    x.stand(station.x);x.tick();assert.equal(x.g.world1.carry,station.id);
    x.stand(station.target.x);x.tick();
  }
  assert.deepEqual(x.g.world1Seals,["stitcho"]);
  assert.equal(x.g.score,450);
});

test("death: Chispín's electrical race restarts, but replays cannot farm station scores",()=>{
  const x=makeGame("chispin");
  const rods=x.g.world1.stations;
  for(const r of rods.slice(0,2)){x.stand(r.x);x.tick();}
  const prior=world1DeathCheckpoint(x.g);
  assert.deepEqual(prior.completed,[],"timed objectives must reset on death");
  assert.deepEqual(prior.scored,[0,1]);
  x.reload();restoreWorld1DeathCheckpoint(x.g,prior);
  assert.equal(x.g.world1.order,0);
  assert.equal(x.g.world1.chainUntil,0);
  assert.equal(world1Snapshot(x.g).done,0);
  for(const rod of x.g.world1.stations){x.stand(rod.x);x.tick();}
  assert.deepEqual(x.g.world1Seals,["chispin"]);
  assert.equal(x.g.score,600,"4 unique stations × 150, no replay farming");
});

test("death: every independent room retains only completed authored IDs; items/timers reset",()=>{
  for(const hero of WORLD1_ORDER.filter(h=>h!=="chispin")){
    const x=makeGame(hero), w=x.g.world1;
    const target=w.stations.filter(s=>s.kind!=="oven");
    if(target.length<2)throw Error("not a partial scenario for "+hero);
    target[0].done=true;target[0]._scored=true;
    w.carry="pizza";w.pizzaUntil=999999;w.order=90;
    const snapshot=world1DeathCheckpoint(x.g);
    assert.deepEqual(snapshot.completed,[target[0].id],hero);
    x.reload();
    assert.equal(restoreWorld1DeathCheckpoint(x.g,snapshot),true,hero);
    assert.equal(world1Snapshot(x.g).done,1,hero);
    assert.equal(x.g.world1.carry,null,hero+" should not carry an item across death");
    assert.equal(x.g.world1.pizzaUntil,0,hero);
    assert.equal(x.g.world1.order,hero==="cuerno"?1:0,hero);
    assert.equal(x.g.world1.sealed,false,hero);
    assert.equal(x.g.world1Seals.length,0,hero);
  }
});

test("death: a stale, cross-room, boss-room or already-sealed checkpoint is rejected",()=>{
  const a=makeGame("kilo");
  assert.equal(restoreWorld1DeathCheckpoint(a.g,{room:"w1-cat",hero:"cat",kind:"medusas",completed:[0]}),false);
  assert.equal(restoreWorld1DeathCheckpoint(a.g,{room:"w1-kilo",hero:"kilo",kind:"cadena",completed:[0]}),false);
  assert.equal(restoreWorld1DeathCheckpoint(a.g,null),false);
  assert.equal(world1DeathCheckpoint({world1:null,roomDef:a.g.roomDef}),null);
  a.g.world1Seals=["kilo"];a.reload();
  assert.equal(world1DeathCheckpoint(a.g),null,"seal is already permanent, no partial needed");
  assert.equal(restoreWorld1DeathCheckpoint(a.g,{room:"w1-kilo",hero:"kilo",kind:"serenata",completed:[0]}),false);
  const final={roomId:"w1-final",roomDef:WORLD1_ROOMS["w1-final"],world1Seals:WORLD1_ORDER,world1Visited:{}};
  enterWorld1(final);
  assert.equal(world1DeathCheckpoint(final),null,"boss cannot be checkpointed with hero seal logic");
});
