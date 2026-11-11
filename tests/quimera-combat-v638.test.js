import test from 'node:test';
import assert from 'node:assert/strict';
import {createFusionBoss,updateFusionBoss,FUSION_ATTACKS,fusionShotBounds,fusionShotHitsPlayer,fusionShotActive,fusionChargeBounds} from '../systems/fusion-boss.js';
import {WORLD1_ARENA as A,WORLD1_FLOOR as F} from '../systems/world1-rooms.js';
function scene(reduceMotion=false){
 const boss=createFusionBoss(638),hits=[],player={x:boss.x-420,y:F-48,w:32,h:48,grounded:true,health:150,maxHealth:150};
 const g={boss,player,reduceMotion},b=boss._fusion;
 b.mode='rest';b.rest=1;
 const step=()=>updateFusionBoss(boss,g,{hurtPlayer:(d,source)=>hits.push({d,source})});
 return {boss,b,player,g,step,hits};
}
function prepare(id){
 const s=scene();s.b.deck=[id];s.b.deckPhase=1;s.step();assert.equal(s.b.attack,id);return s;
}
function fire(s){for(let i=0;i<150&&s.b.mode==='warn';i++)s.step();assert.notEqual(s.b.mode,'warn');}

test('every ordinary attack gives at least one second of warning, even in phase four',()=>{
 for(const phase of [1,2,3,4])for(const id of Object.keys(FUSION_ATTACKS)){
  const s=scene();s.boss.phase=phase;s.boss.hp=[0,2800,1800,1000,400][phase];s.b.deck=[id];s.b.deckPhase=phase;s.step();
  assert.equal(s.b.mode,'warn');assert.ok(s.b.clock>=60,id);assert.equal(s.b.warnMax,s.b.clock);
  assert.equal(s.hits.length,0);assert.equal(s.boss.vulnerable,false);
 }
});
test('plasma locks its target during warning rather than tracking a last-frame dodge',()=>{
 const a=prepare('plasma'),b=prepare('plasma');b.player.x+=600;b.player.y-=120;fire(a);fire(b);
 assert.deepEqual(a.b.shots,b.b.shots,'the advertised trajectory survives a dodge');
});
test('falling lunar echoes land in exactly the seven advertised lanes',()=>{
 const s=prepare('medusas'),marks=[...s.b.marks];s.player.x+=900;fire(s);
 assert.equal(marks.length,7);assert.deepEqual(s.b.shots.map(p=>p.x),marks);
 assert.ok(s.b.shots.every(p=>p.y===F-440));
});
test('charge has a bounded destination and cannot escape the arena',()=>{
 for(const direction of [-1,1]){
  const s=scene();s.player.x=s.boss.x+direction*1800;s.b.deck=['embestida'];s.b.deckPhase=1;s.step();
  const end=s.b.chargeTarget;assert.ok(Math.abs(end-s.boss.x)<=1200);fire(s);
  let frames=0;while(s.b.mode==='charge'&&frames++<105){s.step();assert.ok(s.boss.x>=A.left&&s.boss.x+s.boss.w<=A.right);}
  assert.equal(s.b.mode,'rest');assert.ok(frames<=100);assert.equal(s.boss.x,end);assert.ok(s.b.rest>=78);
  const zone=fusionChargeBounds(s.boss);assert.equal(zone.y+zone.h,F);
 }
});
test('phase transitions clear every previous hazard before collision is evaluated',()=>{
 const s=scene();s.b.shots.push({k:'orb',x:s.player.x+16,y:s.player.y+24,r:80,vx:0,vy:0,life:50,dmg:99});
 s.boss.hp=1800;s.step();assert.equal(s.b.mode,'special');assert.equal(s.b.shots.length,0);assert.deepEqual(s.hits,[]);
});
test('reduced motion preserves special duration, damage and projectile schedules',()=>{
 const a=scene(false),b=scene(true);
 for(const s of [a,b])s.boss.hp=1800;
 for(let t=0;t<400;t++){a.step();b.step();assert.deepEqual(a.b.shots,b.b.shots);assert.equal(a.b.mode,b.b.mode);}
 assert.deepEqual(a.hits,b.hits);
});
test('projectile damage uses both axes of its painted area, not just the player feet',()=>{
 const fixtures=[
  {k:'bolt',x:8500,r:34,life:17},
  {k:'geyser',x:8500,r:34,life:43},
  {k:'beam',x:8500,r:0,band:F-130,life:49,liveFor:50},
  ...['orb','jelly','ring','wave','wheel','meteor','node','echo'].map(k=>({k,x:8500,y:F-100,r:24,life:60}))
 ];
 for(const p of fixtures){
  const box=fusionShotBounds(p),inside={x:box.x+box.w/2-2,y:box.y+box.h/2-2,w:4,h:4};
  assert.ok(fusionShotActive(p));assert.ok(fusionShotHitsPlayer(p,inside),p.k);
  for(const player of [{...inside,x:box.x+box.w+2},{...inside,y:box.y-6},{...inside,y:box.y+box.h+2}])assert.equal(fusionShotHitsPlayer(p,player),false,p.k+' outside visible geometry');
  assert.equal(fusionShotHitsPlayer({...p,delay:1},inside),false,'warning cannot hurt');
 }
 const high={k:'beam',band:F-130,r:0,life:40,liveFor:50};
 assert.equal(fusionShotHitsPlayer(high,{x:8500,y:F-48,w:32,h:48}),false,'standing clears the high sweep');
 assert.ok(fusionShotHitsPlayer(high,{x:8500,y:F-160,w:32,h:48}),'a jumping torso intersects the high sweep');
});
test('the shuffled attack bag teaches every phase-one power before repeating',()=>{
 const s=scene(),seen=[];
 for(let i=0;i<3;i++){s.b.mode='rest';s.b.rest=1;s.step();seen.push(s.b.attack);}
 assert.deepEqual(seen.sort(),['ola','plasma','rayos']);
});

import {quimeraCameraZoom} from '../systems/world1-boss.js';
test('compact framing widens only the final boss encounter, keeping other heroes and films at their accepted scale',()=>{
 const s=scene();
 for(const width of [320,390,640]){
  const z=quimeraCameraZoom(s.g,width);assert.ok(z>=.48&&z<=.82);
  assert.equal(quimeraCameraZoom({...s.g,world1Cine:{id:'bossIntro'}},width),1.02);
  assert.equal(quimeraCameraZoom({...s.g,boss:{boss:true}},width),1.02);
 }
 assert.equal(quimeraCameraZoom(s.g,1280),1.02);
});

test('neural cage nodes stay above the floor and keep their warned origins',()=>{
 const s=prepare('red'),marks=structuredClone(s.b.marks);assert.equal(marks.length,6);
 assert.ok(marks.every(m=>m.y<=F-20&&m.x>=A.left&&m.x<=A.right));
 fire(s);assert.deepEqual(s.b.shots.map(p=>({x:p.x,y:p.y})),marks);
});
test('a quake landing cannot hit a grounded player standing on an elevated platform',()=>{
 const s=scene();s.player.x=s.boss.x+s.boss.w/2-16;s.player.y=F-280;
 s.b.mode='leap';s.b.clock=1;s.b.leapFrom=s.boss.x;s.b.leapTarget=s.boss.x;s.b.attack='terremoto';s.step();
 assert.deepEqual(s.hits,[]);assert.equal(s.b.mode,'rest');assert.equal(s.b.shots.length,2);
});
