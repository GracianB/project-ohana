import test from 'node:test';
import assert from 'node:assert/strict';
import {heroAirControl} from '../systems/player-movement.js';
test('V648 Michi baby and Dino have distinguishable inertial profiles',()=>{
 assert.ok(heroAirControl({id:'cat',evo:0})>1);
 assert.ok(heroAirControl({id:'dino'})<1);
});
test('V648 Kilo and other established heroes retain their exact air control',()=>{
 for(const id of ['kilo','stitcho','chispin','cuerno','dragon','frita','pizza','yomi'])assert.equal(heroAirControl({id}),1);
 assert.equal(heroAirControl({id:'cat',evo:4}),1);
});
test('V648 flight/dash special states do not take the new ordinary air drag',()=>{
 assert.equal(heroAirControl({id:'cat',evo:1,_michiWingAir:true}),1);
 assert.equal(heroAirControl({id:'dino',_specialFlightT:12}),1);
 assert.equal(heroAirControl({id:'kilo',_kiloFlightT:10}),1);
});
