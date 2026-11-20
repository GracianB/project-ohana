import test from 'node:test';
import assert from 'node:assert/strict';
import {clearAbilityFx, updateAbilityFx, useAbility} from '../systems/abilities.js';

test('Yomi transfers a spent seal to a nearby target outside L without damaging it',()=>{
 for(const [id,onlineAdventure,blocked] of [['yomi',false,false],['yomi',true,false],['ia',false,false],['yomi',false,true]]){
  clearAbilityFx();
  const marked={x:492,y:89,w:20,h:20,hp:300,damageTakenScale:blocked?0:1,_yomiMarkUntil:200};
  const adjacent={x:557,y:89,w:20,h:20,hp:300};
  const g={player:{id,abilities:['ofuda','sleeve','maw'],evo:4,x:100,y:85,w:24,h:32,facing:1,health:50,maxHealth:100,cds:{},cdDur:{}},
   onlineAdventure,enemies:[marked,adjacent],t:0,nums:{add(){}},fx:{emit(){}}};
  assert.ok(useAbility(g,2));
  for(let i=0;i<24;i++){g.t++;updateAbilityFx(g);}
  assert.equal(adjacent.hp,300);
  assert.equal(Boolean(adjacent._yomiMarkUntil),id==='yomi'&&!onlineAdventure&&!blocked);
 }
 clearAbilityFx();
});
