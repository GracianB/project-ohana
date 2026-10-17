import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER} from '../characters/roster.js';
import {evolutionPresentation} from '../systems/evo-cine/presentation.js';
import {enemyStatus} from '../engine/enemies.js';
import {chispinSilhouetteScale} from '../characters/art/pikachu.js';

test('Chispin keeps a readable silhouette throughout a complete turn',()=>{
 for(let i=0;i<360;i++)assert.ok(Math.abs(chispinSilhouetteScale(Math.cos(i*Math.PI/180)))>=.68);
 assert.equal(chispinSilhouetteScale(NaN),1);
});

test('All forty evolutions use true form names and bounded mobile composition',()=>{
 for(const hero of ROSTER)for(let evo=1;evo<5;evo++)for(const [w,h] of [[320,568],[390,844],[1280,720],[844,390]]){
  const before=evolutionPresentation(hero.id,evo,w,h,0),after=evolutionPresentation(hero.id,evo,w,h,3.5);
  assert.equal(before.previous,hero.forms[evo-1].name);assert.equal(after.title,hero.forms[evo].name);
  assert.equal(before.oldAlpha,1);assert.equal(after.newAlpha,1);assert.equal(after.oldAlpha,0);
  assert.ok(after.target<=w*.48&&after.target<=h*.35);assert.ok(after.message.length>5);
  assert.equal(evolutionPresentation(hero.id,evo,w,h,1.8,true).lift,0);
  assert.equal(evolutionPresentation(hero.id,evo,w,h,1.8,true).pose,'idle');
 }
});
test('Enemy status is clamped and appears only when it conveys combat information',()=>{
 assert.equal(enemyStatus({hp:100,max:100}).visible,false);
 assert.equal(enemyStatus({hp:50,max:100}).ratio,.5);
 for(const reason of [{elite:true},{telegraph:1},{alertPing:20}])assert.equal(enemyStatus({hp:100,max:100,...reason}).visible,true);
 assert.equal(enemyStatus({hp:200,max:100}).ratio,1);
 assert.equal(enemyStatus({hp:-5,max:100}).visible,false);
 assert.equal(enemyStatus({hp:50,max:100,boss:true}).visible,false);
 assert.ok(Number.isFinite(enemyStatus({hp:NaN,max:0}).ratio));
});
