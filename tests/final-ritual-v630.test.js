import test from 'node:test';
import assert from 'node:assert/strict';
import {updateFinalGauntlet,gauntletReady,gauntletCineEnded} from '../systems/final-gauntlet.js';
import {KEEPSAKE_ORDER,KEEPSAKE_SAVE_KEY} from '../systems/keepsakes.js';
import {FINAL_RESONANCE_KEY,ritualTokenPositions,readFinalResonances,chooseFinalFighter,interactFinalRitual} from '../systems/final-ritual.js';
import {packSave} from '../systems/save.js';
import {buildWorld1Scene} from '../systems/world1-cine.js';

test('the invocation cinema shows the chosen fighter while the memory keeps its original owner',()=>{
 const [intro]=buildWorld1Scene('keepsakeIntro','kilo',{fighter:'dino'});
 assert.deepEqual(intro.heroes,['dino']);assert.equal(intro.fighter,'dino');assert.equal(intro.owner,'kilo');assert.match(intro.line,/Tabla del hogar/);
 const [rescue]=buildWorld1Scene('keepsakeRescue','kilo',{fighter:'dino'});assert.deepEqual(rescue.heroes,['kilo']);
});

const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};};
function fixture(saved=memory()){
 const choices=[],fighters=[],awards=[];
 const g={roomId:'w1-final',finalRitualEnabled:true,world1Seals:[...KEEPSAKE_ORDER],keepsakeStorage:saved,secrets:{},
  player:{id:'yomi',x:160,y:1054,w:60,h:80,health:150,maxHealth:200,dead:false,vx:0},enemies:[],projectiles:[],score:123,xp:420,
  requestFinalHero:request=>choices.push(request),onGauntletHero:hero=>{fighters.push(hero);g.player.id=hero;return true;},onGauntletAward:hero=>awards.push(hero)};
 return {g,choices,fighters,awards,saved};
}
function gather(g,hero){
 for(const token of ritualTokenPositions(hero)){g.player.x=token.x-g.player.w/2;g.player.y=1134-g.player.h;updateFinalGauntlet(g);}
}
function summon(g){for(let frame=0;frame<48;frame++)updateFinalGauntlet(g);}

test('V630: passing the mirrors never changes the hero or summons an unearned guardian',()=>{
 const {g,choices,fighters}=fixture();updateFinalGauntlet(g);
 assert.equal(g.finalGauntlet.phase,'gathering');assert.equal(g.finalGauntlet.hero,'kilo');
 assert.equal(g.player.id,'yomi');assert.equal(g.enemies.length,0);assert.equal(choices.length,0);assert.deepEqual(fighters,[]);
 const tokens=ritualTokenPositions('kilo');
 g.player.x=tokens[0].x-g.player.w/2;g.player.y=1134-g.player.h;updateFinalGauntlet(g);
 assert.deepEqual(g.finalGauntlet.resonances.kilo,[0]);assert.equal(chooseFinalFighter(g,'cat'),false);
 const broken={...g,world1Seals:g.world1Seals.slice(1)};assert.equal(interactFinalRitual(broken),false);
});

test('V630: three physical pickups open a choice, then invoke the guardian with the chosen fighter',()=>{
 const {g,choices,fighters,awards}=fixture();updateFinalGauntlet(g);gather(g,'kilo');
 const v=g.finalGauntlet;assert.deepEqual(v.resonances.kilo,[0,1,2]);assert.equal(v.phase,'choosing');assert.equal(choices.length,1);
 assert.equal(g.score,123);assert.equal(g.xp,420);assert.deepEqual(awards,[]);assert.equal(g.enemies.length,0);
 assert.equal(choices[0].choose('unknown'),false);assert.equal(choices[0].choose('cat'),true);assert.equal(v.phase,'summoning');
 assert.equal(g.player.id,'yomi','the fighter changes at invocation, after the energy animation');
 assert.equal(choices[0].choose('dino'),false,'the accepted choice is consumed');
 summon(g);assert.equal(v.phase,'fight');assert.equal(v.guardian.gauntletBoss,'kilo');assert.equal(g.player.id,'cat');assert.deepEqual(fighters,['cat']);
 assert.equal(chooseFinalFighter(g,'dino'),false,'no character swaps during a duel');assert.deepEqual(v.found,[]);
 v.guardian.hp=0;updateFinalGauntlet(g);assert.equal(v.phase,'released');assert.deepEqual(v.found,[]);
 g.player.x=v.object.x-g.player.w/2;updateFinalGauntlet(g);assert.deepEqual(v.found,['kilo']);assert.deepEqual(awards,['kilo']);
 updateFinalGauntlet(g);assert.equal(v.phase,'gathering');assert.equal(v.hero,'stitcho');assert.equal(g.player.id,'cat');assert.deepEqual(fighters,['cat']);
});

test('V630: cancel preserves the three discoveries and E reopens the same choice',()=>{
 const {g,choices,fighters}=fixture();updateFinalGauntlet(g);gather(g,'kilo');choices[0].cancel();
 assert.equal(g.finalGauntlet.phase,'gathering');const before=g.player.health;
 for(let tick=0;tick<120;tick++)updateFinalGauntlet(g);
 assert.equal(choices.length,1,'cancel cannot reopen the modal every frame');assert.equal(g.player.health,before);
 assert.equal(interactFinalRitual(g),true);assert.equal(choices.length,2);assert.deepEqual(fighters,[]);
});

test('V630: valid floor discoveries survive a retry and malformed storage grants none',()=>{
 const {g,saved}=fixture();updateFinalGauntlet(g);gather(g,'kilo');
 const checkpoint=packSave(g);const recovered=fixture(memory()).g;recovered.secrets=checkpoint.secrets;
 assert.deepEqual(readFinalResonances(recovered).kilo,[0,1,2],'the ordinary checkpoint also preserves the earned floor discoveries');
 const resumed=fixture(saved);updateFinalGauntlet(resumed.g);assert.deepEqual(resumed.g.finalGauntlet.resonances.kilo,[0,1,2]);assert.equal(resumed.choices.length,1);assert.deepEqual(resumed.awards,[]);
 saved.setItem(FINAL_RESONANCE_KEY,JSON.stringify({kilo:'012',cat:[-1,0,0,1,3,'2'],unknown:[0,1,2]}));
 const state=readFinalResonances(fixture(saved).g);assert.deepEqual(state.kilo,[]);assert.deepEqual(state.cat,[0,1]);assert.equal(state.unknown,undefined);
 const fallback=fixture(memory()).g;fallback.secrets['w1-final']=['w1-final-ritual-v630-dragon-2','w1-final-ritual-v630-unknown-0'];assert.deepEqual(readFinalResonances(fallback).dragon,[2]);
});

test('V630: ten earned memories still require an explicit fighter choice before Quimera',()=>{
 const {g,saved,choices,fighters,awards}=fixture();saved.setItem(KEEPSAKE_SAVE_KEY,JSON.stringify(KEEPSAKE_ORDER));
 updateFinalGauntlet(g);assert.equal(g.finalGauntlet.hero,'quimera');assert.equal(g.finalGauntlet.phase,'choosing');assert.equal(gauntletReady(g),false);
 assert.equal(choices[0].quimera,true);assert.equal(choices[0].choose('dino'),true);summon(g);
 assert.equal(g.finalGauntlet.phase,'complete');assert.equal(gauntletReady(g),true);assert.deepEqual(fighters,['dino']);assert.deepEqual(awards,[]);
 updateFinalGauntlet(g);assert.deepEqual(fighters,['dino']);assert.equal(g.player.id,'dino');
});

test('V630: stale choice callbacks cannot act after death, cinema or leaving the final room',()=>{
 for(const invalid of[g=>{g.player.dead=true;},g=>{g.world1Cine={id:'other'};},g=>{g.roomId='w1-cat';}]){
  const {g,choices,fighters}=fixture();updateFinalGauntlet(g);gather(g,'kilo');invalid(g);
  assert.equal(choices[0].choose('dragon'),false);assert.deepEqual(fighters,[]);
 }
});
