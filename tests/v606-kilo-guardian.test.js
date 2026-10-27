import test from 'node:test';
import assert from 'node:assert/strict';
import {initGroveGuardian,updateGroveGuardian,KILO_GUARDIAN_RHYTHMS} from '../systems/grove-guardian.js';
import {KILO_CHAPTER_BOSS_ID,KILO_CHAPTER_ARENA} from '../systems/kilo-chapter.js';
import {prepareChapterBossV2} from '../systems/chapter-boss-v2.js';
import {combatDifficulty,scaleCombatHealth} from '../systems/combat-difficulty.js';
import {damageEnemy} from '../systems/mutations.js';

function fixture(mode='normal'){
 const a=KILO_CHAPTER_ARENA,e={roomId:'w1-kilo',x:a.left+(a.right-a.left)*.6,y:a.floor-48,roomPersona:{special:true,name:'Tambor del Claro',encounterId:KILO_CHAPTER_BOSS_ID,arena:a}};
 initGroveGuardian(e);scaleCombatHealth(e,combatDifficulty(mode));
 const g={roomId:'w1-kilo',combatDifficulty:combatDifficulty(mode),player:{id:'kilo',x:a.left+210,y:a.floor-74,w:36,h:74,evo:4,vx:0,dead:false},
  world1:{stations:Array.from({length:4},()=>({done:true}))},cam:{x:a.left-80,y:400},viewW:1800,viewH:800,projectiles:[],enemies:[e],nums:{add(){}}};
 return {e,g,tick(){prepareChapterBossV2(e,g);updateGroveGuardian(e,g,()=>{});}};
}
function until(f,predicate,max=2000){for(let i=0;i<max;i++){f.tick();if(predicate())return i+1;}assert.fail('guardian did not reach expected committed state');}

// This is the production order, including the generic wrapper before the
// native controller and an impact on the FIRST frame of the opening.
test('V606: a spent Tambor opening is never replenished by the V2 wrapper next frame',()=>{
 const f=fixture();until(f,()=>f.e._drummer.phase==='rest');
 const before=f.e.hp,budget=f.e.damageWindowRemaining;
 assert.equal(budget,150);assert.equal(f.e._v2Boss,undefined);
 assert.equal(damageEnemy(f.e,10000),true);assert.equal(before-f.e.hp,budget);
 f.tick();assert.equal(f.e.damageWindowRemaining,0);assert.equal(damageEnemy(f.e,10000),false);assert.equal(before-f.e.hp,budget);
 assert.equal(f.e.max,Math.ceil(540*1.2),'difficulty scales once; wrapper adds no extra 20%');
});

test('V606: charge commits its actual endpoint and does not home when the hero changes side',()=>{
 const f=fixture();until(f,()=>f.e._drummer.phase==='warn'&&f.e._drummer.pattern===1);
 const a=f.e._drummer,committed={aim:a.aim,end:a.chargeEndX,start:a.chargeStartX,targetX:a.targetX,targetY:a.targetY};
 f.g.player.x=KILO_CHAPTER_ARENA.right-40;f.g.player.y=KILO_CHAPTER_ARENA.floor-420;
 until(f,()=>a.phase==='strike');assert.equal(a.aim,committed.aim);assert.equal(a.chargeEndX,committed.end);assert.equal(a.targetX,committed.targetX);assert.equal(a.targetY,committed.targetY);
 until(f,()=>a.phase==='rest');assert.ok(Math.abs(f.e.x-committed.end)<.01);assert.ok(Math.abs(f.e.x-committed.start)>100,'the advertised charge closes real distance');
});

test('V606: ground notes reach the arena edges and remain low enough to jump',()=>{
 const f=fixture();until(f,()=>f.e._drummer.phase==='strike');
 const wave=f.g.projectiles.find(p=>p.kiloGuardian==='ground');assert.ok(wave);
 assert.ok(Math.abs(wave.vx)*wave.life>KILO_CHAPTER_ARENA.right-KILO_CHAPTER_ARENA.left);
 assert.ok(wave.y+wave.h<KILO_CHAPTER_ARENA.floor);assert.ok(wave.y>=KILO_CHAPTER_ARENA.floor-30);assert.equal(wave.vy,0);
});

test('V606: aerial response freezes its target during the warning and leaves distinct fan gaps',()=>{
 const f=fixture();f.g.player.y=KILO_CHAPTER_ARENA.floor-400;
 until(f,()=>f.e._drummer.phase==='warn'&&f.e._drummer.pattern===2);
 const a=f.e._drummer,angle=a.volleyAngle,target={x:a.targetX,y:a.targetY};f.g.projectiles=[];
 f.g.player.x+=450;f.g.player.y+=190;
 until(f,()=>a.phase==='strike');
 const shots=f.g.projectiles.filter(p=>p.kiloGuardian==='seed');assert.equal(shots.length,3);
 assert.deepEqual({x:a.targetX,y:a.targetY},target);assert.equal(a.volleyAngle,angle);
 const angles=shots.map(p=>Math.atan2(p.vy,p.vx));assert.ok(Math.abs(angles[1]-angle)<1e-8);assert.ok(Math.abs(angles[1]-angles[0])>.3);assert.ok(Math.abs(angles[2]-angles[1])>.3);
 const velocities=shots.map(p=>({vx:p.vx,vy:p.vy}));for(let i=0;i<20;i++)f.tick();assert.deepEqual(shots.map(p=>({vx:p.vx,vy:p.vy})),velocities);
});

test('V606: attack permits gate commitment, without cancelling a warning already announced',()=>{
 const f=fixture();f.e.aiAttackPermit=false;
 for(let i=0;i<350;i++)f.tick();assert.equal(f.e._drummer.phase,'step');assert.equal(f.g.projectiles.length,0);
 f.e.aiAttackPermit=true;until(f,()=>f.e._drummer.phase==='warn');f.e.aiAttackPermit=false;
 until(f,()=>f.e._drummer.phase==='strike');assert.ok(f.g.projectiles.length>0);
});

test('V606: easy/normal/hard change reaction time, opening and actual wave speed',()=>{
 const observed=[];
 for(const mode of ['easy','normal','hard']){
  const f=fixture(mode);until(f,()=>f.e._drummer.phase==='warn');const warn=f.e._drummer.warnMax;
  until(f,()=>f.e._drummer.phase==='strike');const wave=f.g.projectiles.find(p=>p.kiloGuardian==='ground');
  until(f,()=>f.e._drummer.phase==='rest');observed.push({warn,window:f.e.damageWindowRemaining,wave:Math.abs(wave.vx)});
 }
 assert.ok(observed[0].warn>observed[1].warn&&observed[1].warn>observed[2].warn);
 assert.ok(observed[0].window>observed[1].window&&observed[1].window>observed[2].window);
 assert.ok(observed[0].wave<observed[1].wave&&observed[1].wave<observed[2].wave);
 assert.equal(observed[1].window,KILO_GUARDIAN_RHYTHMS.normal.window);
});

test('V606: no granted notes or missing final form silently start the chapter guardian',()=>{
 const f=fixture();f.g.world1.stations[3].done=false;for(let i=0;i<150;i++)f.tick();assert.equal(f.e._drummer.phase,'waiting');
 f.g.world1.stations[3].done=true;f.g.player.evo=3;for(let i=0;i<150;i++)f.tick();assert.equal(f.e._drummer.phase,'waiting');
 f.g.player.evo=4;until(f,()=>f.e._drummer.phase==='warn');assert.ok(f.e.damageTakenScale===0);
});

test('V606: legacy hub Tambor retains its own size, health, stagger and sleep',()=>{
 const e={x:3290,y:1086,roomId:'hub',roomPersona:{special:true,name:'Tambor del Claro'}};initGroveGuardian(e);
 const g={player:{x:3150,y:1086,w:32,h:48},cam:{x:2800,y:600},viewW:1100,viewH:700,projectiles:[],nums:{add(){}}};
 assert.equal(e.hp,360);assert.equal(e.w,100);assert.equal(e._kiloGuardianV606,undefined);
 e._drummer.phase='warn';e._drummer.timer=40;e.stun=30;prepareChapterBossV2(e,g);updateGroveGuardian(e,g,()=>{});assert.equal(e._drummer.phase,'rest');
 e.sleep=20;const timer=e._drummer.timer;updateGroveGuardian(e,g,()=>{});assert.equal(e.sleep,19);assert.equal(e._drummer.timer,timer);
});
