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

test('V656 astral telegraph locks direction at warning onset and does not spam',async()=>{
 const {prepareChapterBossV2}=await import('../systems/chapter-boss-v2.js');
 const cues=[];
 const mind={phase:'warn',timer:45,attack:0};
 const boss={miniBoss:true,roomId:'w1-cat',hp:480,max:480,x:500,y:500,w:160,h:180,_astralCat:mind,_combatHealthScaled:true,_growthChapter:true};
 const g={player:{x:100,y:600,w:40,h:60,vx:0},nums:{add:(x,y,label)=>cues.push(label)},projectiles:[]};
 prepareChapterBossV2(boss,g);
 assert.equal(cues.length,1);
 assert.match(cues[0],/←$/);
 const committed=mind.aim;
 g.player.x=1000;
 prepareChapterBossV2(boss,g);
 assert.equal(cues.length,1);
 assert.equal(mind.aim,committed);
 mind.phase='attack';
 prepareChapterBossV2(boss,g);
 mind.phase='warn';
 prepareChapterBossV2(boss,g);
 assert.equal(cues.length,2);
 assert.match(cues[1],/→$/);
});
