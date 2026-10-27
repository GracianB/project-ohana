import test from 'node:test';import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {enterKiloAirTrail,updateKiloSkyRoute,kiloSkyGuidance,KILO_SKY_RINGS} from '../systems/kilo-chapter.js';
const make=()=>{const g={roomDef:WORLD1_ROOMS['w1-kilo'],world1:{},player:{x:0,y:0,w:28,h:40,xp:0,_kiloFlightT:100},save(){}};enterKiloAirTrail(g);return g;};
const reach=(g,r)=>{g.player.x=r.x-14;g.player.y=r.y-20;updateKiloSkyRoute(g);};
test('sky route uses real flight contact in order and persists unique rewards',()=>{
 const g=make();reach(g,KILO_SKY_RINGS[4]);assert.equal(g.player.xp,0);
 g.player._kiloFlightT=0;reach(g,KILO_SKY_RINGS[0]);assert.equal(g.player.xp,0);
 g.player._kiloFlightT=100;for(const r of KILO_SKY_RINGS)reach(g,r);
 assert.equal(g.player.xp,40);assert.equal(g.score,900);
 enterKiloAirTrail(g);assert.ok(g.world1.skyRings.every(r=>r.done));
 for(const r of KILO_SKY_RINGS)reach(g,r);assert.equal(g.player.xp,40);assert.equal(g.score,900);
});
test('Kilo gems lead through the full physical route without granting an evolution before the first instrument',()=>{
 const r=WORLD1_ROOMS['w1-kilo'],early=r.orbs.filter(([x])=>x<r.seal.stations[0].x);
 const low=early.filter(([x,y])=>{const floor=r.plats.find(p=>p[3]>40&&x>=p[0]&&x<p[0]+p[2]);return floor&&y>=floor[1]-60&&y<floor[1]-18;});
 assert.ok(low.length>=2,'the first stretch has visible ground pickups');
 assert.ok(early.length*4<55,'early pickups alone cannot grant form two');
 assert.ok(r.orbs.length*4<420,'gems do not bypass the instrument route');
 assert.ok(r.orbs.filter(([,y])=>y<900).length>=6,'the canopy has an actual aerial pickup route');
 assert.ok(r.orbs.some(([x,y])=>x>10000&&y<900),'the late route also rewards aerial exploration');
 for(const [x,y] of r.orbs)assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&x>0&&x<r.width&&y>0&&y<1134);
});

test('flight guidance follows the next unearned ring and stays separate from the main objective',()=>{
 const g=make();g.player.x=KILO_SKY_RINGS[0].x+1100;g.player.y=KILO_SKY_RINGS[0].y+300;
 const first=kiloSkyGuidance(g);assert.equal(first.index,1);assert.match(first.direction,/←/);assert.match(first.direction,/↑/);
 reach(g,KILO_SKY_RINGS[0]);assert.equal(kiloSkyGuidance(g).index,2);
 for(const r of KILO_SKY_RINGS.slice(1))reach(g,r);assert.equal(kiloSkyGuidance(g).complete,true);
 g.player._kiloFlightT=0;assert.equal(kiloSkyGuidance(g),null);
});
