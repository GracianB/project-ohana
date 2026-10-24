import test from 'node:test';
import assert from 'node:assert/strict';
import {playWorld1Cine, skipWorld1Cine, updateWorld1Cine, world1CinePresentation} from '../systems/world1-cine.js';
import {WORLD1_ORDER} from '../systems/world1-rooms.js';

for (const reduceMotion of [false, true]) test(`story advance preserves unread text and returns control (reduced=${reduceMotion})`,()=>{
 const ended=[],g={reduceMotion,onWorld1CineEnd:id=>ended.push(id)};
 playWorld1Cine(g,'intro');
 assert.equal(skipWorld1Cine(g),false,'opening input must not accidentally skip the story');
 for(let i=0;i<20;i++)updateWorld1Cine(g);
 if(!reduceMotion){
  assert.equal(world1CinePresentation(g).button,'Mostrar texto');
  skipWorld1Cine(g);
  assert.equal(g.world1Cine.i,0,'first tap reveals, rather than discards, the sentence');
  assert.equal(world1CinePresentation(g).button,'Continuar');
 }
 skipWorld1Cine(g);
 assert.equal(g.world1Cine.i,1);
 assert.equal(g.world1Cine.revealed,false,'each new shot types its own line');
 for(let i=0;i<2000&&g.world1Cine;i++)updateWorld1Cine(g);
 assert.deepEqual(ended,['intro']);
 assert.equal(world1CinePresentation(g),null);
});

test('all ten earned seal celebrations explain the next step and can return to play',()=>{
 for(const hero of WORLD1_ORDER){
  const g={world1Seals:[hero]};playWorld1Cine(g,'awaken',hero);
  for(let i=0;i<20;i++)updateWorld1Cine(g);
  for(let i=0;i<2&&g.world1Cine.i===0;i++)skipWorld1Cine(g);
  assert.match(world1CinePresentation(g).line,/este|Corazón/);
  for(let i=0;i<120;i++)updateWorld1Cine(g);
  assert.equal(world1CinePresentation(g).button,'Volver al juego');
  skipWorld1Cine(g);assert.equal(g.world1Cine,null);
 }
});

test('advancing the defeated boss preserves the reunion film handoff',()=>{
 const ended=[],g={reduceMotion:true,onWorld1CineEnd:id=>ended.push(id)};
 playWorld1Cine(g,'bossDefeat');
 for(let shot=0;shot<3;shot++){
  for(let i=0;i<20;i++)updateWorld1Cine(g);
  assert.equal(world1CinePresentation(g).button,'Continuar');
  skipWorld1Cine(g);
 }
 assert.deepEqual(ended,['bossDefeat']);
 assert.equal(g.world1Cine.id,'ending');
});
