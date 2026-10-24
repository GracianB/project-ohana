import test from 'node:test';
import assert from 'node:assert/strict';
import {powerStatus} from '../systems/power-status.js';
import {recordKiloHit,kiloComboStatus} from '../systems/kilo-combo.js';
globalThis.window=globalThis;globalThis.addEventListener||=()=>{};
const {useAbility,clearAbilityFx,supremeOf}=await import('../systems/abilities.js');
function arena(evo=0){return {roomId:'w1-kilo',t:0,worldW:9600,worldH:1260,cam:{x:0,y:0},
 player:{id:'kilo',evo,x:0,y:0,w:32,h:48,facing:1,speed:5.1,health:80,maxHealth:80,
  abilities:['ukulele','hula','ohana'],cds:{},cdDur:{},finisherCharge:0},
 enemies:[],platforms:[],projectiles:[],ghosts:[],score:0,nums:{add(){}},fx:{emit(){}}};}

test('power guidance reports locked forms without spending any actual resource',()=>{
 clearAbilityFx();const g=arena();
 for(const [index,form] of [[1,2],[2,3],[4,4],[5,5]]){
  assert.equal(powerStatus(g,index).kind,'locked');assert.match(powerStatus(g,index).label,new RegExp('forma '+form));
  assert.equal(useAbility(g,index),false);
 }
 assert.deepEqual(g.player.cds,{});assert.equal(g.player.finisherCharge,0);
 assert.equal(powerStatus(g,3,supremeOf('kilo')).kind,'ready','U is available from baby');
});
test('cooldown guidance follows the real cast and the exact expiry, rather than showing ready early',()=>{
 clearAbilityFx();const g=arena();assert.equal(useAbility(g,0),true);
 const until=g.player.cds.ukulele;
 assert.equal(powerStatus(g,0).kind,'cooldown');assert.equal(useAbility(g,0),false);
 assert.equal(g.player.cds.ukulele,until);
 g.t=(until-1)/ (1000/60);assert.equal(powerStatus(g,0).kind,'cooldown');
 g.t=Math.ceil(until/(1000/60));assert.equal(powerStatus(g,0).kind,'ready');
 assert.equal(useAbility(g,0),true);
});
test('I guidance respects both the earned combo and cooldown, preserving the opportunity on refusal',()=>{
 clearAbilityFx();const g=arena(3);assert.equal(powerStatus(g,4).kind,'combo');
 for(const key of ['H','J','H'])recordKiloHit(g,key,{});
 assert.equal(powerStatus(g,4).kind,'ready');g.player.cds.kilo_ascend=100;
 assert.equal(powerStatus(g,4).kind,'cooldown');assert.equal(useAbility(g,4),false);
 assert.equal(kiloComboStatus(g).ready,true);
 g.t=7;assert.equal(useAbility(g,4),true);assert.equal(kiloComboStatus(g).ready,false);
});
test('P guidance distinguishes earned charge from the active three-beat rhythm',()=>{
 clearAbilityFx();const g=arena(4);g.player.finisherCharge=35;
 assert.equal(powerStatus(g,5).kind,'charge');assert.match(powerStatus(g,5).label,/35\/100/);
 assert.equal(useAbility(g,5),false);assert.equal(g.player.finisherCharge,35);
 g.player.finisherCharge=100;assert.equal(powerStatus(g,5).kind,'ready');assert.equal(useAbility(g,5),true);
 assert.equal(g.player.finisherCharge,0);assert.equal(powerStatus(g,5).kind,'rhythm');
 assert.equal(useAbility(g,5),true,'rhythm taps must remain available after spending charge');
});
