import test from 'node:test';import assert from 'node:assert/strict';
globalThis.window=globalThis;globalThis.addEventListener||=()=>{};
const {hitEnemy}=await import('../systems/abilities.js');
const arena=()=>{const numbers=[],hits=[];const g={t:10,player:{xp:0,finisherCharge:0},combo:0,score:0,shake:0,nums:{add(...a){numbers.push(a);}},fx:{emit(){}},onAbilityHit(e,d){hits.push(d);}};return {g,numbers,hits};};
test('blocked ability hits never invent damage, XP, combo, score or finisher charge',()=>{
 const {g,numbers,hits}=arena(),e={x:0,y:0,w:40,h:40,hp:100,damageTakenScale:0};
 for(let i=0;i<10;i++)assert.equal(hitEnemy(g,e,70),false);
 assert.equal(e.hp,100);assert.equal(g.player.xp,0);assert.equal(g.player.finisherCharge,0);assert.equal(g.combo,0);assert.equal(g.score,0);assert.deepEqual(hits,[]);
 assert.deepEqual(numbers.map(a=>a[2]),['BLINDADO'],'sustained hits do not flood the screen');
 g.t=40;hitEnemy(g,e,70);assert.equal(numbers.length,2);
});
test('a nearly closed damage window reports only actual damage and cannot keep granting rewards',()=>{
 const {g,numbers,hits}=arena(),e={x:0,y:0,w:40,h:40,hp:100,damageWindowRemaining:17};
 assert.equal(hitEnemy(g,e,70),true);assert.equal(e.hp,83);assert.deepEqual(hits,[17]);assert.equal(numbers[0][2],'17');
 const earned={xp:g.player.xp,combo:g.combo,score:g.score,charge:g.player.finisherCharge};
 assert.equal(hitEnemy(g,e,70),false);
 assert.deepEqual({xp:g.player.xp,combo:g.combo,score:g.score,charge:g.player.finisherCharge},earned);
});
