import test from 'node:test';
import assert from 'node:assert/strict';
import {combatDifficulty,scaleCombatHealth} from '../systems/combat-difficulty.js';
import {directEnemyEncounter} from '../systems/enemy-director.js';
import {campaignVolley,updateCampaignEnemy} from '../systems/campaign-enemies.js';
import {encounterMemory} from '../systems/encounter-memory.js';
const player=()=>({x:200,y:100,w:24,h:30,vx:5,vy:0,grounded:true});
const foe=(i=0)=>({x:100+i*80,y:100,w:30,h:30,hp:100,max:100,kind:'cucaracho',spawnIndex:i,campaignRole:'pursuer',vx:0,vy:0});
test('three campaign modes coordinate different attack budgets and preserve authored health',()=>{
 const old=globalThis.localStorage;
 try{for(const [mode,budget] of [['easy',1],['normal',2],['hard',3]]){
  globalThis.localStorage={getItem:()=>mode};
  const enemies=Array.from({length:4},(_,i)=>foe(i));
  assert.equal(directEnemyEncounter(enemies,player(),'w1-dino',60).budget,budget);
  assert.equal(scaleCombatHealth({max:137,hp:137}).hp,Math.ceil(137*combatDifficulty(mode).health));
 }}finally{globalThis.localStorage=old;}
});
test('difficulty changes warning and recovery, never an already fired projectile',()=>{
 const warnings=[],recoveries=[];
 for(const mode of ['easy','normal','hard']){
  const e=foe();e._campaign={age:0,wind:0,cd:0,active:0,aim:1};
  const g={player:player(),cam:{x:0,y:0},viewW:900,viewH:700,worldW:1000,worldH:900,platforms:[],projectiles:[],combatDifficulty:combatDifficulty(mode)};
  updateCampaignEnemy(e,g);warnings.push(e._campaign.wind);
  e._campaign.wind=1;updateCampaignEnemy(e,g);recoveries.push(e._campaign.cd);
 }
 assert.ok(warnings[0]>warnings[1]&&warnings[1]>warnings[2]);
 assert.ok(recoveries[0]>recoveries[1]&&recoveries[1]>recoveries[2]);
 const shots=campaignVolley('shooter',foe(),player(),false,combatDifficulty('hard'));
 const before=structuredClone(shots);const p=player();p.vx=-20;
 assert.deepEqual(shots,before);assert.ok(shots.every(s=>Number.isFinite(s.vx)&&Number.isFinite(s.vy)));
});
test('campaign enemies consume retreat and flank decisions',()=>{
 const e=foe(),p=player(),g={player:p,cam:{x:0,y:0},worldW:1000,worldH:900,platforms:[],projectiles:[]};
 e.aiIntent='RETREAT';updateCampaignEnemy(e,g);assert.ok(e.vx<0);
 e.aiIntent='FLANK';e.aiFlankDir=1;updateCampaignEnemy(e,g);assert.ok(e.vx>0);
});
test('short-term memory is bounded, forgets habits and never crosses player objects',()=>{
 const p=player();p.grounded=false;
 for(let t=0;t<1500;t+=15){p._cast={slot:0,t};encounterMemory(p,t);}
 const air=encounterMemory(p,1500);assert.ok(air.air>.9&&air.air<=1&&air.ranged<=1);
 p.grounded=true;p._cast=null;
 for(let t=1515;t<4500;t+=15)encounterMemory(p,t);
 assert.ok(encounterMemory(p,4500).air<.01);assert.equal(encounterMemory(player(),4500).air,0);
});
