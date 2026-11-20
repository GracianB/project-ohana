import assert from 'node:assert/strict';
import test from 'node:test';
import {ROSTER} from '../characters/roster.js';
import {clearAbilityFx,updateAbilityFx,useAbility} from '../systems/abilities.js';

function match(id,enemies=[]){
 const def=ROSTER.find(h=>h.id===id),f=def.forms[3];
 return {player:{...def,...f,evo:3,x:100,y:200,facing:1,health:f.hp,maxHealth:f.hp,cds:{},cdDur:{}},enemies,t:0,roomId:'hub',
  fx:{emit(){}},nums:{add(){}},cam:{x:0,y:0},platforms:[],projectiles:[]};
}
function enemy(x){return {x,y:200,w:26,h:36,hp:900,max:900};}
function ticks(g,n){for(let i=0;i<n;i++){g.t++;updateAbilityFx(g);}}

test('Porción de regreso hits the same enemy once per leg and terminates on catch',()=>{
 clearAbilityFx();
 const target=enemy(195),g=match('pizza',[target]),hits=[];
 g.onAbilityHit=()=>hits.push(g.t);
 assert.ok(useAbility(g,4));
 ticks(g,55);
 assert.equal(hits.length,2);
 assert.ok(hits[0]<19&&hits[1]>=19);
 assert.equal(g._evolutionAttacks.shots.length,0);
 clearAbilityFx();
});

test('IA selects analyzed enemies ahead of the launch outside melee reach',()=>{
 clearAbilityFx();
 const marked=enemy(263),unmarked=enemy(280),behind=enemy(2);
 marked._yomiMarkUntil=150;behind._yomiMarkUntil=150;
 const g=match('ia',[marked,unmarked,behind]);
 assert.ok(useAbility(g,4));
 ticks(g,5);
 assert.ok(marked.hp<900);
 assert.equal(unmarked.hp,900);assert.equal(behind.hp,900);
 assert.equal(g._evolutionAttacks.beams.length,1);
 clearAbilityFx();
});

test('I spawns distinct timed fields for Nácar, Dino, and Yomi',()=>{
 for(const [hero,tick,mode] of [['nacar',4,'constellation'],['dino',22,'quake'],['yomi',18,'pounce']]){
  clearAbilityFx();
  const g=match(hero);
  assert.ok(useAbility(g,4));
  ticks(g,tick-1);assert.equal(g._evolutionAttacks.fields.length,0,hero);
  ticks(g,1);
  assert.equal(g._evolutionAttacks.fields[0]?.mode,mode,hero);
 }
 clearAbilityFx();
});
