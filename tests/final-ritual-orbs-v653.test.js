import test from 'node:test';
import assert from 'node:assert/strict';
import {ambientOrbsForRoom,finalRitualInteractionPrompt} from '../systems/final-ritual.js';
import {KEEPSAKE_ORDER} from '../systems/keepsakes.js';
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

test('ritual prompt appears only beside earned actionable portal',()=>{
 const g={
  roomId:'w1-final',finalRitualEnabled:true,onlineAdventure:false,
  world1Seals:[...KEEPSAKE_ORDER],
  player:{x:880,y:1092,w:40,h:42,health:100,dead:false},
  finalGauntlet:{phase:'gathering',hero:'kilo',resonances:{kilo:[0,1,2]}}
 };
 assert.match(finalRitualInteractionPrompt(g),/E · elige/);
 g.finalGauntlet.resonances.kilo=[0,1];assert.equal(finalRitualInteractionPrompt(g),null);
 g.finalGauntlet.resonances.kilo=[0,1,2];g.player.x=1700;
 assert.equal(finalRitualInteractionPrompt(g),null,'distance prevents a fake interaction prompt');
 g.player.x=880;g.world1Cine={id:'intro'};
 assert.equal(finalRitualInteractionPrompt(g),null,'cinema suppresses the touch action');
 g.world1Cine=null;g.finalGauntlet.phase='fight';
 assert.equal(finalRitualInteractionPrompt(g),null,'active duel cannot reopen fighter choice');
});
