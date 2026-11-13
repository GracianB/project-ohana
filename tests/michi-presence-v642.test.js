import test from 'node:test';import assert from 'node:assert/strict';
import{updateMichiPresence}from'../systems/michi-presence.js';import{michiActing}from'../characters/michi-acting.js';
test('attention watches threats without collecting, moving or attacking',()=>{
 const p={id:'cat',x:0,y:0,w:20,h:20,vx:0,vy:2,hp:100,facing:1},orb={x:50,y:0,taken:false},enemy={x:80,y:0,hp:20};const g={player:p,enemies:[enemy],orbs:[orb]};
 for(let i=0;i<100;i++)updateMichiPresence(g);
 assert.equal(p._michiPresence.kind,'threat');assert.ok(p._michiPresence.lookX>0&&p._michiPresence.lookX<=1);assert.equal(p.x,0);assert.equal(p.vy,2);assert.equal(p.hp,100);assert.equal(orb.taken,false);assert.equal(enemy.hp,20);
 updateMichiPresence(g,{left:true});assert.equal(p._michiIdleTicks,0);
 enemy.dead=true;updateMichiPresence(g);assert.equal(p._michiPresence.kind,'curious');
 orb.taken=true;g._evolutionAttacks={guest:{x:35,y:0,life:120}};updateMichiPresence(g);assert.equal(p._michiPresence.kind,'friend');
});
test('noncat actors are untouched and reduced motion is time independent',()=>{
 assert.equal(updateMichiPresence({player:Object.freeze({id:'kilo'})}),false);
 assert.deepEqual(michiActing({reduceMotion:true,t:1},4),michiActing({reduceMotion:true,t:800},4));
 const p=Object.freeze({state:'idle',t:240,michiPresence:Object.freeze({kind:'curious',attention:1,lookX:4})});assert.equal(michiActing(p).lookX,1);assert.ok(michiActing(p).gesture>0);
});
