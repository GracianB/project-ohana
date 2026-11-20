import assert from 'node:assert/strict';
import test from 'node:test';
import {ROSTER} from '../characters/roster.js';
import {CombatFX,attackImpact,drawHeroAttackGlyph} from '../systems/combat-fx.js';
import {hitEnemy} from '../systems/abilities.js';

test('every hero has a distinct attack contour, even with no motion',()=>{
 const shapes=new Set();
 for(const {id} of ROSTER){
  const points=[];
  const c={beginPath(){},stroke(){},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);}};
  drawHeroAttackGlyph(c,id,0,0,12);
  assert.ok(points.length>=5,id);
  assert.ok(points.flat().every(Number.isFinite),id);
  shapes.add(JSON.stringify(points));
 }
 assert.equal(shapes.size,ROSTER.length);
});

test('impact stays at contact and blocked damage produces no impact mark',()=>{
 const g={player:{id:'ia',x:0,y:20,w:20,h:40,facing:1},combatFx:new CombatFX(),fx:{emit(){}},nums:{add(){}}};
 const target={x:60,y:30,w:40,h:36,hp:100};
 attackImpact(g,target,{x:42,y:90,dir:1});
 assert.deepEqual(g.combatFx.items.map(({x,y,hero})=>[x,y,hero]),[[60,66,'ia']]);
 g.combatFx.clear();
 target.damageTakenScale=0;
 assert.equal(hitEnemy(g,target,25),false);
 assert.equal(g.combatFx.items.length,0);
 target.damageTakenScale=1;
 assert.equal(hitEnemy(g,target,25),true);
 assert.equal(g.combatFx.items.length,1);
 assert.equal(g.combatFx.items[0].hero,'ia');
});
