import test from 'node:test';
import assert from 'node:assert/strict';
import {ambientOrbsForRoom} from '../systems/final-ritual.js';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';

test('solo ritual does not superimpose ambient XP crystals on earned resonances',()=>{
 const final=WORLD1_ROOMS['w1-final'];
 assert.ok(final.fusionBoss);
 assert.ok(final.orbs.length>=10,'original multiplayer procession remains authored');
 assert.deepEqual(ambientOrbsForRoom(final,true),[]);
 assert.equal(ambientOrbsForRoom(final,false),final.orbs);
});
test('ordinary chapter crystals and undefined rooms retain existing semantics',()=>{
 const chapter=WORLD1_ROOMS['w1-cat'];
 assert.equal(ambientOrbsForRoom(chapter,true),chapter.orbs);
 assert.equal(ambientOrbsForRoom(chapter,false),chapter.orbs);
 assert.deepEqual(ambientOrbsForRoom(null,true),[]);
});
