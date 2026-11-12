import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS,WORLD1_FLOOR} from '../systems/world1-rooms.js';
import {enterWorld1,updateWorld1} from '../systems/world1-play.js';
test('real V700 jelly touch updates coral collision geometry before this same tick returns',()=>{
 const room=WORLD1_ROOMS['w1-cat'];
 const p={id:'cat',evo:0,x:0,y:WORLD1_FLOOR-42,w:32,h:42,vx:0,vy:-3,grounded:false,maxHealth:100,health:100,xp:0};
 const g={roomDef:{...room,expedition:null},roomId:room.id,worldW:room.width,
  world1Visited:{},world1Stations:{},world1Seals:[],platforms:room.plats.map(q=>({x:q[0],y:q[1],w:q[2],h:q[3]})),reduceMotion:true,player:p,
  enemies:[],projectiles:[],score:0,events:[],nums:{add(){}},fx:{emit(){}},save(){this.saves=(this.saves||0)+1;},onWorld1Beat(t,h){this.events.push([t,h]);}};
 enterWorld1(g);
 const station=g.world1.stations[0],before=g.platforms.length;
 p.x=station.x-p.w/2;p.y=station.y-p.h/2;p.grounded=false;
 updateWorld1(g);
 assert.equal(g.world1.stations[0].done,true,'must rescue through actual World 1 interaction');
 assert.ok(g.platforms.length>before,'real coral must exist on the SAME tick');
 assert.ok(g.platforms.some(q=>q._ohanaPulse),'usable physics geometry');
 assert.equal(g.score,150,'only the genuine jelly rescue earns XP/score');
 assert.deepEqual(g.world1Seals,[]);
 assert.equal(g.saves,1);
 const ids=g.platforms.filter(q=>q._ohanaPulse).map(q=>q._ohanaPulse);
 updateWorld1(g);
 assert.deepEqual(g.platforms.filter(q=>q._ohanaPulse).map(q=>q._ohanaPulse),ids,'no duplicate geometry on next tick');
 assert.equal(g.score,150,'no repeat reward');
});
