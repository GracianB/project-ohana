import test from 'node:test';
import assert from 'node:assert/strict';
import {michiFlightState,steerMichiFlight,MICHI_FAIRY_FLIGHT_FRAMES} from '../characters/michi-flight.js';

test('earned final ghost sustains ascent, hover and controlled descent',()=>{
 const p={id:'cat',evo:4,health:100,hp:100,dead:false,grounded:false,vy:-3};
 for(let i=0;i<100;i++)assert.equal(steerMichiFlight(p,{jump:true}),true);
 assert.equal(michiFlightState(p).mode,'ascend');
 assert.equal(michiFlightState(p).unlimited,true);
 assert.ok(p.vy<0);
 steerMichiFlight(p,{jump:false});assert.equal(michiFlightState(p).mode,'hover');assert.equal(p.vy,0);
 steerMichiFlight(p,{drop:true});assert.equal(michiFlightState(p).mode,'descend');assert.ok(p.vy>=4.5);
});
test('second form exhausts finite fuel and replenishes only on landing',()=>{
 const p={id:'cat',evo:1,health:100,hp:100,dead:false,grounded:false,vy:-8};
 for(let i=0;i<MICHI_FAIRY_FLIGHT_FRAMES+4;i++)steerMichiFlight(p,{jump:true});
 assert.equal(michiFlightState(p).remaining,0);assert.equal(michiFlightState(p).mode,'glide');
 p.grounded=true;steerMichiFlight(p,{jump:false});
 assert.equal(michiFlightState(p).remaining,MICHI_FAIRY_FLIGHT_FRAMES);
});
test('ghost transition requires physical airborne state, not a fake ground ascend',()=>{
 const p={id:'cat',evo:4,health:100,hp:100,dead:false,grounded:true,vy:0};
 assert.equal(steerMichiFlight(p,{jump:true}),false);
 assert.equal(michiFlightState(p).mode,'ground');
 p.grounded=false;p.vy=-9;
 assert.equal(steerMichiFlight(p,{jump:true}),false,'ordinary takeoff impulse owns the first fast ascent');
 p.vy=-3;
 assert.equal(steerMichiFlight(p,{jump:true}),true);
 assert.equal(michiFlightState(p).mode,'ascend');
});
