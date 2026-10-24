import test from 'node:test';import assert from 'node:assert/strict';
import {FAMILY_STARS,constellationProgress,reunionDedication} from '../systems/family-constellation-story.js';
import {WORLD1_ORDER} from '../systems/world1-rooms.js';
test('ten distinct voices form one constellation, duplicates never complete it',()=>{
 assert.deepEqual(FAMILY_STARS.map(s=>s.id).sort(),[...WORLD1_ORDER].sort());
 assert.equal(new Set(FAMILY_STARS.map(s=>s.line)).size,10);
 assert.equal(constellationProgress(Array(10).fill('kilo')).complete,false);
 assert.equal(constellationProgress([...WORLD1_ORDER,'unknown']).complete,true);
});

test('reunion addresses the earned hero and safely handles unknown older IDs',()=>{
 for(const star of FAMILY_STARS){const letter=reunionDedication(star.id);assert.equal(letter.name,star.name);assert.ok(letter.line.includes(star.name));assert.ok(letter.promise.includes('Para los diez. Y para ti.'));}
 assert.equal(reunionDedication('unknown').name,'Kilo');
});
