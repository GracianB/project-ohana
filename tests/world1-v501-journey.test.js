import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS, WORLD1_FLOOR, cleanWorld1Stations} from '../systems/world1-rooms.js';
import {enterWorld1, updateWorld1, world1NextObjective, world1CanLeave} from '../systems/world1-play.js';
import {packSave, unpackSave} from '../systems/save.js';

function game(hero='chispin', width=32) {
 const r=WORLD1_ROOMS['w1-'+hero];
 const g={roomId:r.id,roomDef:r,world1Seals:[],world1Visited:{},score:0,projectiles:[],
  player:{id:'kilo',x:0,y:WORLD1_FLOOR-42,w:width,h:42,evo:0,xp:0,maxHealth:100,health:70,grounded:true},
  nums:{add(){}},fx:{emit(){}},save(){}};
 enterWorld1(g);return g;
}

test('V501: a connected antenna survives a real save round trip, without granting the seal',()=>{
 const g=game(), rod=g.world1.stations[0];g.player.x=rod.x-g.player.w/2;updateWorld1(g);
 const score=g.score, save=packSave(g), restored=unpackSave(save,'kilo');
 const next=game();next.world1Stations=restored.world1Stations;next.score=restored.score;enterWorld1(next);
 assert.equal(next.world1.stations[0].done,true);assert.equal(world1CanLeave(next,'right'),false);
 next.player.x=rod.x-next.player.w/2;updateWorld1(next);assert.equal(next.score,score);
 assert.deepEqual(unpackSave({v:3,id:'kilo'},'kilo').world1Stations,{},'old saves still load');
});

test('V501: saved objectives reject unknown rooms, ovens, forged IDs and out-of-order prisms',()=>{
 assert.deepEqual(cleanWorld1Stations({'w1-final':[0],'unknown':[0],'w1-chispin':[3,3,-1,{},'0',99],
  'w1-pizza':[0,1,99], 'w1-cuerno':[1,2]}),{'w1-chispin':[3],'w1-pizza':[1]});
});

test('V501: antennas respond to physical attacks and contact with larger forms, only once',()=>{
 const g=game(), rod=g.world1.stations[0];g.player.x=rod.x-105;g.player.melee=1;updateWorld1(g);
 assert.equal(rod.done,true);assert.equal(g.score,150);updateWorld1(g);assert.equal(g.score,150);
 const large=game('chispin',180);large.player.x=large.world1.stations[0].x-150;updateWorld1(large);
 assert.equal(large.world1.stations[0].done,true);
});

test('V501: the objective follows part zero to its workshop and pizza to a hungry guest',()=>{
 const g=game('stitcho');g.world1.carry=0;
 const objective=world1NextObjective(g);assert.equal(objective.x,g.world1.stations[0].target.x);
 const pizza=game('pizza');assert.equal(world1NextObjective(pizza).label,'Horno');
 pizza.world1.carry='pizza';assert.equal(world1NextObjective(pizza).label,'Cliente esperando');
 assert.ok(pizza.world1.stations.some(s=>s.kind==='guest'&&s.x===world1NextObjective(pizza).x));
});

test('V501: guidance follows the actual geyser launch up to its prize, then back to the next geyser',async()=>{
 const {world1ObjectiveDirection}=await import('../systems/world1-play.js');
 const g=game('frita'), s=g.world1.stations[0],p=g.player;
 p.x=s.x-p.w/2;p._jumpHeld=true;p.buffer=5;p.coyote=4;
 assert.equal(world1NextObjective(g).label,'Géiser de aceite');
 updateWorld1(g);
 assert.equal(p.grounded,false);assert.equal(p.vy,-s.force);
 assert.equal(p._jumpHeld,false,'release of an earlier jump must not cut the geyser impulse');
 assert.equal(p.buffer,0);assert.equal(p.coyote,0);
 const flight=world1NextObjective(g);
 assert.equal(flight.y,s.prize.y);assert.equal(flight.label,'Patata dorada');
 assert.equal(world1ObjectiveDirection(g,flight),'Hacia el este → · Arriba ↑');
 p.x=s.prize.x-p.w/2;p.y=s.prize.y-p.h/2;updateWorld1(g);
 assert.equal(s.done,true);assert.equal(g.score,150);
 p.grounded=true;p.y=s.y-p.h;
 assert.equal(world1NextObjective(g).label,'Géiser de aceite');
 assert.notEqual(world1NextObjective(g).x,s.x);
});

test('V501: pizza guidance reports real heat, then returns to oven without undoing deliveries',()=>{
 const g=game('pizza'), oven=g.world1.stations[0],p=g.player;
 p.x=oven.x-p.w/2;updateWorld1(g);
 assert.match(world1NextObjective(g).action,/18 s/);
 g.world1.tick+=750;
 assert.match(world1NextObjective(g).action,/5 s/);
 p.x=g.world1.stations[1].x-p.w/2;updateWorld1(g);
 assert.equal(g.world1.stations[1].done,true);
 p.x=oven.x-p.w/2;updateWorld1(g);
 p.x=oven.x+200;g.world1.tick=g.world1.pizzaUntil;updateWorld1(g);
 assert.equal(g.world1.carry,null);
 assert.equal(world1NextObjective(g).label,'Horno');
 assert.equal(g.world1.stations[1].done,true);
});

test('V501: terminal guidance matches activation phase and a closed exit names the remaining objective',async()=>{
 const {world1LockedMessage}=await import('../systems/world1-play.js');
 const g=game('yomi'),s=g.world1.stations[0],p=g.player;
 p.x=s.x-p.w/2;g.world1.tick=80;
 assert.match(world1NextObjective(g).action,/Espera/);
 updateWorld1(g);assert.equal(s.done,false);
 g.world1.tick=180;
 assert.match(world1NextObjective(g).action,/AHORA/);
 updateWorld1(g);assert.equal(s.done,true);
 assert.match(world1LockedMessage(g),/1\/4 completados.*Terminal astral/);
});
