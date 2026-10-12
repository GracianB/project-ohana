import test from "node:test";
import assert from "node:assert/strict";
import {
  HERO_MASTERY_MOMENTS, signalHeroMasteryMoment, onMasteryRoom,
  updateHeroMastery, afterMoveHeroMastery, onDinoPoundImpact,
} from "../systems/hero-mastery.js";

function scene(id){
  const calls=[];
  return {
    calls,
    g:{roomId:"hub",worldW:2240,t:20,
      player:{id,x:700,y:650,w:30,h:36,vx:0,vy:0,facing:1,evo:2,
        grounded:false,jumps:3,maxJumps:3,jumpPower:13,_jumpHeld:false,
        health:100,invuln:0,dead:false},
      nums:{add:(...args)=>calls.push(args)},fx:{emit(){}},shake:0}
  };
}
const acts={
  kilo(g){Object.assign(g.player,{x:825,y:784});updateHeroMastery(g,{jump:true,t:21});},
  stitcho(g){g.player._pmove="climb";updateHeroMastery(g,{jump:true,t:21});},
  chispin(g){Object.assign(g.player,{x:710,y:684,grounded:true});afterMoveHeroMastery(g,{t:21});},
  cat(g){updateHeroMastery(g,{jumpPressed:true,jump:true,t:21});},
  dragon(g){updateHeroMastery(g,{jumpPressed:true,jump:true,t:21});},
  dino(g){Object.assign(g.player,{x:1025,y:1062,grounded:true});onDinoPoundImpact(g);},
  frita(g){Object.assign(g.player,{x:500,y:1080,grounded:true,_slideT:20});updateHeroMastery(g,{t:21});},
  pizza(g){Object.assign(g.player,{x:530,y:1052,grounded:true,_preVy:8});afterMoveHeroMastery(g,{t:21});},
  yomi(g){g.player._specter=12;updateHeroMastery(g,{t:21});},
  cuerno(g){Object.assign(g.player,{x:700,y:970,grounded:true,_preVy:9});afterMoveHeroMastery(g,{t:21});},
};

test("All ten heroes have short, distinctive, bounded real-world mastery lines",()=>{
  assert.deepEqual(Object.keys(HERO_MASTERY_MOMENTS).sort(),Object.keys(acts).sort());
  const lines=Object.values(HERO_MASTERY_MOMENTS).map(m=>m.text);
  assert.equal(new Set(lines).size,10);
  for(const m of Object.values(HERO_MASTERY_MOMENTS)){
    assert.ok(m.text.length>=6&&m.text.length<=30);
    assert.match(m.color,/^#[0-9a-f]{6}$/i);
    assert.ok(Object.isFrozen(m));
  }
});

for(const [id,perform] of Object.entries(acts)){
  test(id+": reaction appears only after genuine mastery and just once per room",()=>{
    const {g,calls}=scene(id);
    onMasteryRoom(g);
    updateHeroMastery(g,{jump:false,jumpPressed:false,t:20});
    assert.equal(calls.length,0,"resting may not award mastery");
    perform(g);
    assert.equal(calls.length,1,"the first real success must say something");
    assert.equal(calls[0][2],HERO_MASTERY_MOMENTS[id].text);
    assert.equal(calls[0][3],HERO_MASTERY_MOMENTS[id].color);
    assert.equal(calls[0][4],true);
    perform(g);
    assert.equal(calls.length,1,"no repeated popups on a sustained input");
    g.roomId="jungle";
    assert.equal(signalHeroMasteryMoment(g,id),true,"room switch renews one line");
    assert.equal(calls.length,2);
    assert.equal(signalHeroMasteryMoment(g,id),false);
    g.player.dead=true;
    assert.equal(signalHeroMasteryMoment(g,id),false,"dead heroes cannot speak");
    assert.equal(calls.length,2);
  });
}

test("Moments do not exist for a different hero, unknown IDs, or empty games",()=>{
  const {g,calls}=scene("dragon");
  assert.equal(signalHeroMasteryMoment(null,"dragon"),false);
  assert.equal(signalHeroMasteryMoment(g,"cat"),false);
  assert.equal(signalHeroMasteryMoment(g,"unknown"),false);
  assert.equal(calls.length,0);
});

test("Moment bookkeeping resets on deliberate room re-entry without unbounded histories",()=>{
  const {g,calls}=scene("yomi");
  onMasteryRoom(g);
  assert.equal(signalHeroMasteryMoment(g,"yomi"),true);
  assert.equal(signalHeroMasteryMoment(g,"yomi"),false);
  onMasteryRoom(g);
  assert.equal(signalHeroMasteryMoment(g,"yomi"),true);
  assert.equal(calls.length,2);
  const state=g.player._mastery;
  assert.equal(state.momentRoom,"hub");
  assert.equal(state.momentShown,true);
  assert.equal(state.moments,undefined);
});
