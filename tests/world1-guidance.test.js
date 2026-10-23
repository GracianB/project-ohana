import test from 'node:test';import assert from 'node:assert/strict';
import {world1Guidance} from '../systems/world1-guidance.js';
import {WORLD1_ORDER} from '../systems/world1-rooms.js';
import {objectiveForRoom} from '../systems/objectives.js';
test('World 1 guidance counts earned seals, never old room visits',()=>{
 for(const hero of WORLD1_ORDER){const g=world1Guidance('w1-'+hero,{visited:{hub:true,beach:true}});assert.equal(g.count,0);assert.ok(g.objective.length>15);assert.doesNotMatch(g.objective,/Reina del Nido/);}
 assert.equal(world1Guidance('w1-kilo',{world1Seals:['kilo','kilo','invalid']}).count,1);
 assert.match(world1Guidance('w1-kilo',{world1Seals:['kilo']}).objective,/salida del este/);
 assert.equal(world1Guidance('hub'),null);
 assert.match(objectiveForRoom('w1-final').text,/Cuatro fases/);
 assert.equal(objectiveForRoom('w1-final',{world1Won:true}).completed,true);
});
