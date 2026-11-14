import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {michiNextPassage,michiZoneAtArrival,MICHI_FAROL_ZONES} from './browser/michi-campaign-route.mjs';

const room=WORLD1_ROOMS['w1-cat'];
const next=(from,to,lamps,sealed=false,echoes=0)=>
 michiNextPassage(room,from,to,lamps,sealed,echoes);
test('Michi route follows authored lantern gates without skipping locked passages',()=>{
 assert.deepEqual(MICHI_FAROL_ZONES,['court','crypt','maze','canopy','gallery']);
 assert.equal(next('court','crypt',0),null);
 assert.equal(next('court','crypt',1)?.id,'court-crypt');
 assert.equal(next('crypt','maze',2)?.id,'crypt-court');
 assert.equal(next('court','maze',2)?.id,'court-maze');
 assert.equal(next('maze','canopy',3)?.id,'maze-canopy');
 assert.equal(next('canopy','gallery',4)?.id,'canopy-maze');
 assert.equal(next('maze','gallery',4)?.id,'maze-court');
 assert.equal(next('court','gallery',4)?.id,'court-gallery');
 assert.equal(next('gallery','arena',5)?.id,'gallery-court');
 assert.equal(next('court','arena',5)?.id,'court-arena');
 assert.equal(next('arena','court',5)?.id,'arena-court');
 assert.equal(next('court','return',5,true,2),null);
 assert.equal(next('court','return',5,true,3)?.id,'court-exit');
});
test('every legal Michi entrance arrives at a named chapter floor',()=>{
 for(const arch of room.michiSanctuary.passages){
  const zone=michiZoneAtArrival(room,arch);
  assert.ok(zone,arch.id+' destination must be on authored floor');
  assert.ok(room.michiSanctuary.zones.some(z=>z.id===zone),arch.id);
 }
});
