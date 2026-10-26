// Domain tests use synthetic hit events, not a claim of physical playthrough.
import test from 'node:test';import assert from 'node:assert/strict';
import{KEEPSAKE_ORDER,KEEPSAKES,readKeepsakes,rememberKeepsake,cleanKeepsakes}from'../systems/keepsakes.js';
import{updateFinalGauntlet,updateGauntletGuardian,gauntletReady,gauntletCineEnded}from'../systems/final-gauntlet.js';
import{damageEnemy}from'../systems/mutations.js';
const storage=()=>{const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}};
function fixture(saved=storage()){
 const awarded=[],heroes=[],g={roomId:'w1-final',world1Seals:[...KEEPSAKE_ORDER],keepsakeStorage:saved,player:{id:'kilo',x:8600,y:1074,w:50,h:60,health:200,dead:false,vx:0},enemies:[],projectiles:[],onGauntletAward:h=>awarded.push(h)};
 g.onGauntletHero=h=>{heroes.push(h);g.player.id=h;g.player.x=8600;};return{g,awarded,heroes};
}
test('keepsakes sanitize unknowns, deduplicate and retain previous rescues',()=>{
 const s=storage();assert.deepEqual(cleanKeepsakes(['bogus','dino','dino']),['dino']);assert.equal(rememberKeepsake('bogus',s),false);assert.equal(rememberKeepsake('dino',s),true);assert.equal(rememberKeepsake('dino',s),false);assert.deepEqual(readKeepsakes(s),['dino']);
});
test('ten evolved duels require physical object pickup, persist and unlock Quimera only at the end',()=>{
 const{g,awarded,heroes}=fixture();
 for(const [i,hero]of KEEPSAKE_ORDER.entries()){
  assert.equal(gauntletReady(g),false);updateFinalGauntlet(g);const v=g.finalGauntlet,e=v.guardian;assert.equal(v.hero,hero);assert.equal(e.gauntletBoss,hero);assert.equal(e.evolved,true);assert.equal(e.boss,undefined);
  const hp=e.hp;damageEnemy(e,100000);assert.equal(e.hp,hp,'armour must block every attack type');
  let turns=0;for(let n=0;n<6000&&e.hp>0;n++){updateGauntletGuardian(e,g,()=>{});if(e.damageTakenScale===1)damageEnemy(e,100000);turns=e[KEEPSAKES[hero].key].turn;}
  assert.equal(e.hp,0);assert.ok(turns>=3,'one huge attack cannot skip all openings');updateFinalGauntlet(g);assert.equal(v.phase,'released');assert.equal(v.found.length,i,'defeating a guardian is not the pickup');
  g.player.x=v.object.x-g.player.w/2;updateFinalGauntlet(g);assert.equal(v.found.length,i+1);assert.deepEqual(readKeepsakes(g.keepsakeStorage),KEEPSAKE_ORDER.slice(0,i+1));assert.equal(awarded.length,i+1);
 }
 assert.equal(updateFinalGauntlet(g),true);assert.equal(gauntletReady(g),true);assert.deepEqual(heroes,[...KEEPSAKE_ORDER,'kilo']);updateFinalGauntlet(g);assert.equal(heroes.length,11);
 const resumed=fixture(g.keepsakeStorage);assert.equal(updateFinalGauntlet(resumed.g),true);assert.equal(resumed.awarded.length,0);
});
test('rescue cines relinquish control once; death does not silently start another duel',()=>{
 const{g}=fixture();g.playWorld1Cine=(id,hero)=>{g.world1Cine={id,hero}};updateFinalGauntlet(g);assert.equal(g.finalGauntlet.phase,'intro');gauntletCineEnded(g,'keepsakeIntro');assert.equal(g.finalGauntlet.phase,'fight');g.finalGauntlet.phase='rescue';gauntletCineEnded(g,'keepsakeRescue');assert.equal(g.finalGauntlet.phase,'dormant');g.player.dead=true;updateFinalGauntlet(g);assert.equal(g.finalGauntlet.phase,'dormant');
});

import {playWorld1Cine,flushWorld1CineQueue,world1CineActive}from'../systems/world1-cine.js';
test('a rescue waits for a power movie instead of stacking a second cinema',()=>{
 let ready=false;const g={canWorld1CineStart:()=>ready};
 assert.equal(playWorld1Cine(g,'keepsakeRescue','dino'),true);assert.equal(g.world1Cine,undefined);assert.equal(world1CineActive(g),true);assert.equal(flushWorld1CineQueue(g),false);
 assert.equal(playWorld1Cine(g,'keepsakeIntro','cat'),false,'another movie cannot overwrite the pending rescue');ready=true;assert.equal(flushWorld1CineQueue(g),true);assert.equal(g.world1Cine.id,'keepsakeRescue');assert.equal(g._pendingWorld1Cine,null);
});
