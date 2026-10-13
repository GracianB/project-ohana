import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FRITA_FIELD_RADIUS, FRITA_FIELD_MAX_TARGETS, selectFritaFieldTargets}
  from '../systems/u-field-targeting.js';

const enemyAt=(x,y,id='enemy')=>({id,x:x-8,y:y-8,w:16,h:16,hp:100});
const source=readFileSync(new URL('../systems/abilities.js', import.meta.url),'utf8');

test('V323 Frita U: repeating field never targets distant or invalid enemies',()=>{
  const close=enemyAt(40,0,'close'),rim=enemyAt(FRITA_FIELD_RADIUS,0,'rim');
  const far=enemyAt(FRITA_FIELD_RADIUS+0.01,0,'far');
  const behind=enemyAt(-FRITA_FIELD_RADIUS+2,0,'behind');
  const invalid={x:NaN,y:0,hp:100};
  const list=Object.freeze([far,invalid,rim,behind,close]);
  assert.deepEqual(selectFritaFieldTargets(list,0,0),[close,behind,rim]);
  assert.equal(selectFritaFieldTargets(list,Infinity,0).length,0);
  assert.equal(selectFritaFieldTargets(null,0,0).length,0);
  assert.deepEqual(list[0],far,'targeting must not mutate enemy state');
});

test('V323 Frita U: chooses five nearest in deterministic order without mutating array',()=>{
  const list=Object.freeze([7,6,5,4,3,2,1,0].map(n=>enemyAt(10+n*13,0,String(n))));
  const result=selectFritaFieldTargets(list,0,0);
  assert.equal(result.length,FRITA_FIELD_MAX_TARGETS);
  assert.deepEqual(result.map(e=>e.id),['0','1','2','3','4']);
  assert.equal(list[0].id,'7');
  const tied=Object.freeze([enemyAt(24,0,'A'),enemyAt(-24,0,'B')]);
  assert.deepEqual(selectFritaFieldTargets(tied,0,0),[tied[0],tied[1]]);
});

test('V323 Frita U: matching world-space collision area and rendered ring',()=>{
  assert.equal(FRITA_FIELD_RADIUS,126);
  assert.match(source,/selectFritaFieldTargets\(g\.enemies\.filter\(canHit\),f\.x,f\.y\)/,
    'the field update must use local selection');
  assert.match(source,/f\.mode==="frita"\s*\?\s*FRITA_FIELD_RADIUS\+4\+Math\.sin/,
    'the field renderer must show the same attack footprint');
  assert.match(source,/hitEnemy\(g,e,f\.dmg\*0\.8/,
    'existing U pulse damage formula must remain unchanged');
  assert.match(source,/DINO_FX\.castUltimate\(game,p,enemies,dmg,def\.color\)/,
    'Dino Colossus must not be altered by Frita fix');
  assert.match(source,/const execute=!e\.boss/,
    'Yomi execution must not be altered by Frita fix');
});
