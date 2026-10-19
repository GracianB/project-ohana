import test from 'node:test';import assert from 'node:assert/strict';
import {startKiloFlight,steerKiloFlight,kiloFlightDuration} from '../systems/kilo-flight.js';
test('Hula gives eight normalized directions, settles in place and expires exactly',()=>{
 for(let evo=1;evo<5;evo++)for(const [x,y] of [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]]){
  const p={id:'kilo',evo};startKiloFlight(p,evo);for(let i=0;i<40;i++)assert.equal(steerKiloFlight(p,{axisX:x,jump:y<0,drop:y>0}),true);
  if(x)assert.equal(Math.sign(p.vx),x);if(y)assert.equal(Math.sign(p.vy),y);assert.ok(Math.hypot(p.vx,p.vy)<=4.8+evo*.4+.001);
  for(let i=0;i<40;i++)steerKiloFlight(p,{});assert.equal(p.vx,0);assert.equal(p.vy,0);
  for(let i=80;i<kiloFlightDuration(evo);i++)assert.equal(steerKiloFlight(p,{}),true);
  assert.equal(steerKiloFlight(p,{}),false);
 }
});
test('Flight is Kilo-specific, death cancels it, and analog steering preserves full facing',()=>{
 const p={id:'kilo',evo:1};startKiloFlight(p,1);steerKiloFlight(p,{axisX:.2});assert.equal(p.facing,1);p.dead=true;assert.equal(steerKiloFlight(p,{}),false);assert.equal(p._kiloFlightT,0);
 assert.equal(steerKiloFlight({id:'cat',_kiloFlightT:100},{}),false);
});

test('Flight preserves dash and the directed I combo impulse',()=>{
 const p={id:'kilo',evo:3};startKiloFlight(p,3);p._dashGo=5;p.vx=14;
 steerKiloFlight(p,{axisX:-1});assert.equal(p.vx,14);
 p._dashGo=0;steerKiloFlight(p,{kiloBurst:-8});assert.equal(p.vx,-8);
});

// V443: actual combat-state animation and bounded room encounters.
