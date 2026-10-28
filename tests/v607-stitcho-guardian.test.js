import test from 'node:test';
import assert from 'node:assert/strict';
import {createStitchoBoss,updateStitchoBoss,drawStitchoBossSignals,STITCHO_GUARDIAN_RHYTHMS,STITCHO_BOSS} from '../systems/stitcho-boss.js';
import {prepareChapterBossV2} from '../systems/chapter-boss-v2.js';
import {combatDifficulty} from '../systems/combat-difficulty.js';
import {damageEnemy} from '../systems/mutations.js';
import {STITCHO_RAIL} from '../systems/stitcho-chapter.js';
const ARENA={left:12600,right:14100,floor:1134};
function fixture(mode='normal'){
 const profile=combatDifficulty(mode);
 const e=createStitchoBoss((x,y,kind)=>({x,y,kind,stun:0,invuln:0,sleep:0}),()=>.5,{roomId:'w1-stitcho',encounterId:'w1-stitcho-glitch-v1',chapterVersion:607,x:13280,arena:ARENA,combatDifficulty:profile});
 const g={roomId:'w1-stitcho',t:0,combatDifficulty:profile,player:{id:'stitcho',x:12740,y:1050,w:44,h:84,evo:4,vx:0,dead:false},world1:{stations:[{done:true},{done:true},{done:true}]},
  secrets:{'w1-stitcho':[STITCHO_RAIL.id]},cam:{x:12300,y:300},viewW:2100,viewH:960,projectiles:[],nums:{add(){}},enemies:[e]};
 const hits=[];return {e,g,hits,tick(){g.t++;prepareChapterBossV2(e,g);updateStitchoBoss(e,g,(...args)=>hits.push(args));}};
}
function until(f,condition,limit=2500){for(let i=0;i<limit;i++){f.tick();if(condition())return i+1;}assert.fail('Glitch did not reach the expected committed state');}

test('V607 Glitch owns one opening; the generic wrapper cannot refill it after the first impact',()=>{
 const f=fixture();until(f,()=>f.e._glitch.phase==='rest');
 assert.equal(f.e.max,744);assert.equal(f.e._v2Boss,undefined);assert.equal(f.e.damageWindowRemaining,165);
 const before=f.e.hp;assert.equal(damageEnemy(f.e,1e6),true);assert.equal(before-f.e.hp,165);
 f.tick();assert.equal(f.e.damageWindowRemaining,0);assert.equal(f.e.damageTakenScale,0);
 assert.equal(damageEnemy(f.e,1e6),false);assert.equal(before-f.e.hp,165);
 assert.equal(f.e._guardianOpening,1);assert.equal(f.e._glitch.exposed,false);
});

test('V607 charge reaches its announced endpoint and never turns after the warning',()=>{
 const f=fixture();until(f,()=>f.e._glitch.phase==='warn'&&f.e._glitch.attack===1);
 const b=f.e._glitch,locked={aim:b.aim,start:b.chargeStartX,end:b.chargeEndX,targetX:b.targetX,targetY:b.targetY};
 f.g.player.x=13980;f.g.player.y=650;f.g.player.vx=20;
 until(f,()=>b.phase==='attack');assert.deepEqual({aim:b.aim,start:b.chargeStartX,end:b.chargeEndX,targetX:b.targetX,targetY:b.targetY},locked);
 until(f,()=>b.phase==='rest');assert.ok(Math.abs(f.e.x-locked.end)<1e-8);assert.ok(Math.abs(locked.start-locked.end)>250);
 assert.ok(f.e.x>=ARENA.left&&f.e.x+f.e.w<=ARENA.right);
});

test('V607 discs travel across the real arena at a jumpable height',()=>{
 const f=fixture();until(f,()=>f.e._glitch.phase==='attack');
 const disc=f.g.projectiles.find(p=>p.stitchoGuardian==='disc');assert.ok(disc);
 assert.ok(Math.abs(disc.vx)*disc.life>ARENA.right-ARENA.left);
 assert.equal(disc.vy,0);assert.ok(disc.y>=ARENA.floor-30&&disc.y+disc.h<ARENA.floor);
 assert.equal(f.e.damageTakenScale,0,'the welding shell is still closed during its shot');
});

test('V607 capacitor sockets and actual falling projectiles keep the warning-time positions',()=>{
 const f=fixture();until(f,()=>f.e._glitch.phase==='warn'&&f.e._glitch.attack===2);
 const b=f.e._glitch,targetX=b.targetX,marks=Array.from({length:b.dropCount},(_,i)=>targetX+(i-(b.dropCount-1)/2)*b.dropGap);
 assert.equal(marks.length,3);assert.ok(marks[1]-marks[0]>150,'there is a real dodge gap');
 f.g.projectiles=[];f.g.player.x=14020;f.g.player.y=650;f.g.player.vx=-16;
 until(f,()=>b.phase==='attack');const shots=f.g.projectiles.filter(p=>p.stitchoGuardian==='capacitor');
 assert.deepEqual(shots.map(p=>p.x+p.w/2),marks);assert.ok(shots.every(p=>p.y===b.dropTop&&p.vx===0&&p.vy>0));
 assert.ok(shots.every(p=>p.vy*p.life>ARENA.floor-p.y));
 const trajectories=shots.map(p=>({x:p.x,vx:p.vx,vy:p.vy}));for(let i=0;i<12;i++)f.tick();
 assert.equal(b.targetX,targetX);assert.deepEqual(shots.map(p=>({x:p.x,vx:p.vx,vy:p.vy})),trajectories);
 const sockets=[],c=new Proxy({save(){},restore(){},ellipse(...args){sockets.push(args);}}, {get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
 drawStitchoBossSignals(c,f.e,{x:12300,y:300});
 assert.deepEqual(sockets.map(a=>a[0]+12300),marks,'guest-friendly scalar socket geometry matches collision centers');
});

test('V607 permits gate commitment only; repeated light stun or sleep cannot erase an announced attack',()=>{
 const f=fixture();f.e.aiAttackPermit=false;
 for(let i=0;i<250;i++)f.tick();assert.equal(f.e._glitch.phase,'step');assert.equal(f.g.projectiles.length,0);
 f.e.aiAttackPermit=true;until(f,()=>f.e._glitch.phase==='warn');f.e.aiAttackPermit=false;
 for(let i=0;i<160&&f.e._glitch.phase!=='attack';i++){f.e.stun=100;f.e.sleep=1000;f.tick();}
 assert.equal(f.e._glitch.phase,'attack');assert.equal(f.e._glitch.attacksExecuted,1);assert.ok(f.g.projectiles.length>0);
});

test('V607 every difficulty changes real timing, projectile speed, socket count and recovery budget',()=>{
 const observed=[];
 for(const mode of ['easy','normal','hard']){
  const f=fixture(mode);until(f,()=>f.e._glitch.phase==='warn');const warn=f.e._glitch.warnMax;
  until(f,()=>f.e._glitch.phase==='attack');const speed=Math.abs(f.g.projectiles.find(p=>p.stitchoGuardian==='disc').vx);
  until(f,()=>f.e._glitch.phase==='rest');const window=f.e.damageWindowRemaining,rest=f.e._glitch.clock;
  until(f,()=>f.e._glitch.phase==='warn'&&f.e._glitch.attack===2);
  observed.push({warn,speed,window,rest,count:f.e._glitch.dropCount});
 }
 assert.ok(observed[0].warn>observed[1].warn&&observed[1].warn>observed[2].warn);
 assert.ok(observed[0].speed<observed[1].speed&&observed[1].speed<observed[2].speed);
 assert.ok(observed[0].window>observed[1].window&&observed[1].window>observed[2].window);
 assert.ok(observed[0].rest>observed[1].rest&&observed[1].rest>observed[2].rest);
 assert.deepEqual(observed.map(p=>p.count),[2,3,4]);assert.equal(observed[1].window,STITCHO_GUARDIAN_RHYTHMS.normal.window);
});

test('V607 cannot wake before the three repairs, continuous roll lesson and final form',()=>{
 const f=fixture();f.g.world1.stations[2].done=false;for(let i=0;i<180;i++)f.tick();assert.equal(f.e._glitch.phase,'waiting');
 f.g.world1.stations[2].done=true;f.g.secrets['w1-stitcho']=[];for(let i=0;i<180;i++)f.tick();assert.equal(f.e._glitch.phase,'waiting');
 f.g.secrets['w1-stitcho']=[STITCHO_RAIL.id];f.g.player.evo=3;for(let i=0;i<180;i++)f.tick();assert.equal(f.e._glitch.phase,'waiting');
 f.g.player.evo=4;until(f,()=>f.e._glitch.phase==='warn');assert.equal(f.e._glitch.attack,0);
});

test('V607 escalation adds an announced second salvo and keeps the core closed until recovery',()=>{
 const f=fixture();f.e.hp=150;until(f,()=>f.e._glitch.phase==='attack'&&f.e._glitch.attack===0);
 assert.equal(f.e._glitch.tier,3);const first=f.g.projectiles.length;for(let i=0;i<24;i++)f.tick();
 assert.equal(f.g.projectiles.length,first*2);assert.equal(f.e.damageTakenScale,0);
 until(f,()=>f.e._glitch.phase==='rest');assert.equal(f.e.damageTakenScale,1);assert.equal(f.e._glitch.exposed,true);
});

test('V607 activation is explicit; hub and old chapter fixtures keep their original controller',()=>{
 const make=(x,y,kind)=>({x,y,kind,sleep:0,stun:0,invuln:0});
 const hub=createStitchoBoss(make),old=createStitchoBoss(make,()=>.5,{roomId:'w1-stitcho',encounterId:'w1-stitcho-glitch-v1',arena:{left:8260,right:9320,floor:1134},x:8750});
 assert.equal(hub.hp,480);assert.equal(hub.w,112);assert.deepEqual(hub._stitchoArena,STITCHO_BOSS);assert.equal(hub._stitchoGuardianV607,undefined);
 assert.equal(old._stitchoGuardianV607,undefined);old._glitch.phase='warn';old._glitch.clock=30;old.stun=25;
 updateStitchoBoss(old,{player:{x:8800,y:1070,w:40,h:64},cam:{x:8200,y:400},viewW:1200,projectiles:[],nums:{add(){}}},()=>{});
 assert.equal(old._glitch.phase,'rest');assert.equal(old._glitch.clock,95);
});

test('V607 charge endpoint remains reachable at the west boundary',()=>{
 const f=fixture();f.e.x=ARENA.left;f.g.player.x=ARENA.left;
 Object.assign(f.e._glitch,{phase:'step',clock:1,turn:1});
 f.tick();assert.equal(f.e._glitch.attack,1);
 const endpoint=f.e._glitch.chargeEndX;
 until(f,()=>f.e._glitch.phase==='rest');
 assert.equal(f.e.x,endpoint,'the capacitor margin must not reverse the charge endpoint');
});
