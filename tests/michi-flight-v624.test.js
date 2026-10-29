import test from 'node:test';import assert from 'node:assert/strict';
import {steerMichiFlight,michiFlightState,MICHI_FAIRY_FLIGHT_FRAMES} from '../characters/michi-flight.js';
const actor=evo=>({id:'cat',evo,health:100,x:20,y:100,grounded:true,vy:0,jumps:0});
test('only the two accepted winged forms gain flight; other heroes are untouched',()=>{
 for(const evo of[0,2,3]){const p=actor(evo);assert.equal(steerMichiFlight(p,{jump:true}),false);assert.equal(michiFlightState(p),null);}
 const kilo=Object.freeze({id:'kilo',evo:4,grounded:false,vy:2});assert.equal(steerMichiFlight(kilo,{jump:true}),false);
});
test('ordinary takeoff remains ballistic; the wings take over near the apex',()=>{
 const p=actor(1);steerMichiFlight(p);p.grounded=false;p.vy=-13;
 assert.equal(steerMichiFlight(p,{jump:true}),false);assert.equal(p.vy,-13);
 p.vy=-3;assert.equal(steerMichiFlight(p,{jump:true}),true);assert.equal(p._gliding,true);assert.equal(michiFlightState(p).mode,'ascend');assert.ok(p.vy<0);
});
test('fairy effort runs out, cannot be restored by releasing jump and refills on landing',()=>{
 const p=actor(1);steerMichiFlight(p);p.grounded=false;p.vy=0;
 for(let i=0;i<MICHI_FAIRY_FLIGHT_FRAMES;i++){assert.equal(steerMichiFlight(p,{jump:true}),true);assert.ok(p.vy<0);}
 steerMichiFlight(p,{jump:true});assert.equal(p._michiWingFuel,0);assert.ok(p.vy>0);
 for(let i=0;i<5;i++){steerMichiFlight(p,{jump:false});steerMichiFlight(p,{jump:true});}assert.equal(p._michiWingFuel,0);
 p.grounded=true;steerMichiFlight(p);assert.equal(p._michiWingFuel,MICHI_FAIRY_FLIGHT_FRAMES);
});
test('Eclipse sustains ascent, glides on release, and descends deliberately on Down',()=>{
 const p=actor(4);steerMichiFlight(p);p.grounded=false;p.vy=0;
 for(let i=0;i<1200;i++){steerMichiFlight(p,{jump:true});assert.ok(p.vy<0);}
 assert.equal(michiFlightState(p).unlimited,true);assert.equal(michiFlightState(p).remaining,null);
 steerMichiFlight(p,{});assert.equal(michiFlightState(p).mode,'glide');assert.ok(p.vy>0&&p.vy<1);
 steerMichiFlight(p,{jump:true,drop:true});assert.equal(michiFlightState(p).mode,'descend');assert.ok(p.vy>=4.5);
 p.evo=3;assert.equal(steerMichiFlight(p,{jump:true}),false);assert.equal(p._gliding,false);
});
test('authoritative versus actors use characterId and keep their identity and XP',()=>{
 const p={...actor(4),id:'authenticated-actor',characterId:'cat',hp:100,xp:420};steerMichiFlight(p);p.grounded=false;p.vy=0;
 assert.equal(steerMichiFlight(p,{jump:true}),true);assert.ok(p.vy<0);assert.equal(p.id,'authenticated-actor');assert.equal(p.xp,420);
});
