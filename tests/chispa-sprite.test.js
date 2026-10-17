import test from 'node:test';import assert from 'node:assert/strict';
import {chispaSpriteFrame,chispaSpriteCacheKey} from '../characters/art/chispa-sprite.js';
test('Every thunder evolution has its own four gait frames and attack/cast drawings',()=>{
 for(let form=0;form<5;form++){
  assert.deepEqual(Array.from({length:4},(_,i)=>chispaSpriteFrame({form,state:'run',phase:(i+.5)*Math.PI/2})),[1,2,3,4].map(c=>form*8+c));
  assert.equal(chispaSpriteFrame({form,state:'attack'}),form*8+6);
  assert.equal(chispaSpriteFrame({form,state:'cast'}),form*8+7);
 }
});
test('Reduced motion stabilizes the gait and cache keys distinguish forms and frames',()=>{
 assert.equal(chispaSpriteFrame({form:4,state:'run',phase:5,reduceMotion:true}),33);
 assert.notEqual(chispaSpriteCacheKey({form:0}),chispaSpriteCacheKey({form:1}));
 assert.ok(Number.isInteger(chispaSpriteFrame({form:2,state:'run',phase:NaN})));
});
