import test from 'node:test';import assert from 'node:assert/strict';
import {readFamilyMemory,rememberFamilyVictory,rememberFamilyLight,FAMILY_MEMORY_KEY,migrateFamilyMemory} from '../systems/family-memory.js';
import {WORLD1_ORDER} from '../systems/world1-rooms.js';
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

test('legacy wins migrate without rewriting saves; ten seals without victory cannot unlock',()=>{
 const s=store();const save={v:3,id:'kilo',roomId:'w1-final',world1Seals:WORLD1_ORDER,world1Won:false};
 s.setItem('ohana',JSON.stringify(save));assert.equal(migrateFamilyMemory(s),null);
 save.world1Won=true;s.setItem('ohana',JSON.stringify(save));const original=s.getItem('ohana');
 assert.equal(migrateFamilyMemory(s).hero,'kilo');assert.equal(s.getItem('ohana'),original);
 rememberFamilyLight('cat',readFamilyMemory(s),s);assert.deepEqual(migrateFamilyMemory(s).lights,['cat']);
});

test('V500 migration recovers an interrupted newer transactional save and canonicalizes older hero IDs',()=>{
 const s=store();
 const base={v:3,revision:4,id:'kilo',roomId:'w1-final',world1Seals:WORLD1_ORDER,world1Won:false};
 const staged={...base,revision:5,id:'lilo',world1Won:true};
 s.setItem('ohana',JSON.stringify(base));
 s.setItem('ohana.tmp',JSON.stringify(staged));
 const primary=s.getItem('ohana'),temporary=s.getItem('ohana.tmp');
 assert.equal(migrateFamilyMemory(s).hero,'kilo','legacy Lilo becomes canonical Kilo');
 assert.equal(s.getItem('ohana'),primary,'main save remains untouched');
 assert.equal(s.getItem('ohana.tmp'),temporary,'staged recovery remains untouched');
});
test('V500 migration ignores stale or invalid temporary saves',()=>{
 const s=store();
 const base={v:3,revision:9,id:'pizza',roomId:'w1-final',world1Seals:WORLD1_ORDER,world1Won:false};
 s.setItem('ohana',JSON.stringify(base));
 s.setItem('ohana.tmp',JSON.stringify({...base,revision:8,world1Won:true}));
 assert.equal(migrateFamilyMemory(s),null,'older staged win must not override the newer primary');
 s.setItem('ohana.tmp','{invalid json');
 assert.equal(migrateFamilyMemory(s),null,'corrupt temporary checkpoint cannot unlock');
 s.setItem('ohana',JSON.stringify({...base,revision:10,world1Won:true,id:'stitch'}));
 assert.equal(migrateFamilyMemory(s).hero,'stitcho','legacy Stitch win can unlock');
});
