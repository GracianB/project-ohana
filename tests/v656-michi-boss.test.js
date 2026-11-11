import test from 'node:test';
import assert from 'node:assert/strict';
import {catObjective, MICHI_CHAPTER_BOSS_ID} from '../systems/cat-chapter.js';

const game=(done,cleared=[])=>({
 roomDef:{id:'w1-cat',growthChapter:true},
 world1:{sealed:false,stations:Array.from({length:5},(_,id)=>({id,done}))},
 clearedEncounters:{'w1-cat':cleared}
});

test('V656 oracle objective is gated by five actual rescues',()=>{
 assert.equal(catObjective(game(false)),null);
 const objective=catObjective(game(true));
 assert.equal(objective?.x,8750);
 assert.match(objective.action,/ataca en recuperación/);
});

test('V656 astral boss objective disappears after victory or legacy victory',()=>{
 assert.equal(catObjective(game(true,[MICHI_CHAPTER_BOSS_ID])),null);
 assert.equal(catObjective(game(true,['w1-cat-oraculo-v1'])),null);
});

test('V656 missing station data cannot show a phantom boss objective',()=>{
 const g=game(true);
 delete g.world1.stations;
 assert.equal(catObjective(g),null);
});
