import test from 'node:test';import assert from 'node:assert/strict';
import {readFamilyMemory,rememberFamilyVictory,rememberFamilyLight,FAMILY_MEMORY_KEY} from '../systems/family-memory.js';
const store=()=>{const map=new Map();return {map,getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)}};
test('only a World 1 result creates its own memory; game save remains untouched',()=>{
 const s=store();s.setItem('ohana','original');assert.equal(readFamilyMemory(s),null);
 assert.equal(rememberFamilyVictory({world:2,id:'kilo'},s),null);
 let m=rememberFamilyVictory({world:1,id:'kilo'},s);m=rememberFamilyLight('cat',m,s);rememberFamilyLight('cat',m,s);
 assert.deepEqual(readFamilyMemory(s).lights,['cat']);assert.equal(s.getItem('ohana'),'original');
 assert.equal(rememberFamilyVictory({world:1,id:'unknown'},s),null);
 rememberFamilyVictory({world:1,id:'pizza'},s);assert.deepEqual(readFamilyMemory(s).lights,['cat']);
});
test('malformed and unavailable storage do not break victory',()=>{
 const s=store();s.setItem(FAMILY_MEMORY_KEY,'{');assert.equal(readFamilyMemory(s),null);
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('quota')}};
 assert.equal(rememberFamilyVictory({world:1,id:'kilo'},blocked).hero,'kilo');
 assert.equal(readFamilyMemory(blocked),null);
});
