import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createWorld1BossDirector, updateWorld1BossDirector} from '../systems/world1-boss.js';
import {playWorld1Cine, updateWorld1Cine} from '../systems/world1-cine.js';

const source = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
// Exercise the production handoff inside the frozen-finale branch, where the
// ordinary combat tick cannot run. A director-only test missed this deadlock.
const handoff = source.slice(source.indexOf('if (game.finale) {', source.indexOf('function step()')),
  source.indexOf('// Locked, deterministic', source.indexOf('function step()')));
for (const reduceMotion of [false, true]) test(`finale hands real defeat to both films (reduced=${reduceMotion})`, () => {
  const boss = {_fusionBoss:true, hp:0, x:100, y:100, w:230, h:290, _fusion:{shots:[]}};
  const completed=[];
  const game={roomId:'w1-final', finale:{t:210}, boss, reduceMotion,
    world1Boss:createWorld1BossDirector(boss), onWorld1CineEnd:id=>completed.push(id)};
  const context={game, updateWorld1BossDirector, playWorld1Cine};
  for(let n=0;n<240 && !game.world1Cine;n++) vm.runInNewContext(handoff+'}',context);
  assert.equal(game.world1Won,true);
  assert.equal(game.world1Cine?.id,'bossDefeat');
  for(let n=0;n<5000 && game.world1Cine;n++) updateWorld1Cine(game);
  assert.deepEqual(completed,['bossDefeat','ending']);
  assert.equal(game.world1Cine,null);
  assert.equal(updateWorld1BossDirector(game),null,'defeat must only fire once');
});
