import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareChapterBossV2} from '../systems/chapter-boss-v2.js';

test('V656 lunar guardian signals a committed attack during windup, not every frame',()=>{
 const cues=[];
 const boss={
  roomId:'w1-cat',miniBoss:true,hp:480,max:480,
  x:8500,y:950,w:140,h:140,
  _astralCat:{phase:'warn',timer:45,attack:2}
 };
 const game={
  player:{x:8750,y:1030,w:35,h:50,vx:0},
  nums:{add:(x,y,message)=>cues.push(message)},
  projectiles:[]
 };
 prepareChapterBossV2(boss,game);
 assert.equal(cues.length,1);
 assert.match(cues[0],/EMBESTIDA|ONDA LUNAR|ATAQUE AÉREO|PULSO ASTRAL/);
 assert.ok(boss._v2Boss);
 assert.equal(boss._v2Boss.phase,'warn');
 prepareChapterBossV2(boss,game);
 assert.equal(cues.length,1,'warning must not spam every simulation tick');
 boss._astralCat.phase='rest';
 prepareChapterBossV2(boss,game);
 assert.equal(cues.length,1,'recovery must not announce a new attack');
 boss._astralCat.phase='warn';
 prepareChapterBossV2(boss,game);
 assert.equal(cues.length,2,'the next distinct windup must be signalled');
});
