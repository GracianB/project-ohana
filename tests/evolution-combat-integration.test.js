import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER} from '../characters/roster.js';
globalThis.window=globalThis;
globalThis.addEventListener||=()=>{};
globalThis.removeEventListener||=()=>{};
globalThis.dispatchEvent||=()=>true;
const {useAbility,updateAbilityFx,clearAbilityFx}=await import('../systems/abilities.js');
function fixture(hero,evo){return {player:{...hero,...hero.forms[evo],evo,x:100,y:200,facing:1,health:40,maxHealth:150,finisherCharge:100,cds:{},cdDur:{},xp:0},enemies:[{x:280,y:200,w:40,h:50,hp:10000,max:10000,vx:0,vy:0}],roomId:'hub',worldW:3360,worldH:1260,cam:{x:0,y:0},platforms:[{x:0,y:400,w:3360,h:80}],projectiles:[],ghosts:[],t:0,combo:0,score:0,fx:{emit(){}},nums:{add(){}}};}
function tick(g,n){for(let i=0;i<n;i++){g.t++;g.player.x+=(g.player.vx||0);updateAbilityFx(g);}}
test('actual ability pipeline unlocks U in baby and I/P in their forms',()=>{for(const hero of ROSTER){clearAbilityFx();const g=fixture(hero,0);assert.equal(useAbility(g,4),false);assert.equal(useAbility(g,5),false);assert.equal(useAbility(g,3),true,hero.id);tick(g,120);assert.ok(g.enemies[0].hp<10000,hero.id);assert.equal(useAbility(g,3),false,'U retains cooldown');for(const [slot,evo] of [[4,3],[5,4]]){clearAbilityFx();const h=fixture(hero,evo);assert.equal(useAbility(h,slot),true,hero.id);tick(h,150);assert.ok(h.enemies[0].hp<10000,hero.id+' '+slot);}}});
test('Stitcho L deploys damaging ships; Chispin L produces a full scaled volley',()=>{for(const id of ['stitcho','chispin'])for(const evo of [2,3,4]){clearAbilityFx();const g=fixture(ROSTER.find(r=>r.id===id),evo);assert.equal(useAbility(g,2),true);tick(g,70);assert.ok(g.enemies[0].hp<10000,id);if(id==='stitcho'){assert.equal(g._evolutionAttacks.drones.length,1+evo);assert.ok(g.player.health>40);}}});
