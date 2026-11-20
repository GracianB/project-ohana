import test from 'node:test';
import assert from 'node:assert/strict';
import {clearAbilityFx, updateAbilityFx, useAbility} from '../systems/abilities.js';

function encounter(evo, {underwater=true, online=false}={}) {
 const player={id:'nacar',abilities:['bubble','tideguard','tidestars'],x:100,y:100,w:24,h:28,facing:1,evo,health:50,maxHealth:100,cds:{},cdDur:{}};
 const shot=(x,owner='enemy')=>({x,y:109,w:10,h:10,life:30,dmg:8,owner});
 return {player,roomDef:{nacarChapter:underwater},onlineAdventure:online,enemies:[],
  projectiles:[...Array.from({length:6},(_,i)=>shot(102+i)),shot(480),shot(109,'player')],
  t:0,nums:{add(){}},fx:{emit(){}}};
}

test('Nácar intercepts only hostile shots inside the growing wave, with a per-cast limit',()=>{
 for(const evo of [1,4]){
  clearAbilityFx();
  const g=encounter(evo);
  assert.ok(useAbility(g,1));
  updateAbilityFx(g);
  assert.equal(g.projectiles.filter(p=>p.intercepted).length,evo===1?3:5);
  assert.ok(g.projectiles.filter(p=>p.intercepted).every(p=>p.life===0));
  assert.equal(g.projectiles.at(-2).life,30);
  assert.equal(g.projectiles.at(-1).life,30);
 }
 clearAbilityFx();
});

test('Nácar does not consume shots in other rooms or online',()=>{
 for(const scope of [{underwater:false},{online:true}]){
  clearAbilityFx();
  const g=encounter(4,scope);
  assert.ok(useAbility(g,1));
  updateAbilityFx(g);
  assert.ok(g.projectiles.every(p=>p.life===30));
 }
 clearAbilityFx();
});
