import test from 'node:test';import assert from 'node:assert/strict';
import {ROSTER} from '../characters/roster.js';
import {WORLD1_ROOMS,WORLD1_ORDER} from '../systems/world1-rooms.js';
import {enterWorld1,awardSeal} from '../systems/world1-play.js';
import {expeditionAbility,updateExpedition,expeditionReady,expeditionWindow,enterExpedition} from '../systems/chapter-expedition-v2.js';
import {NEXT_CHAPTERS} from '../systems/chapters-lunar-prism-embers.js';
import {packSave,unpackSave} from '../systems/save.js';
import {prepareChapterBossV2} from '../systems/chapter-boss-v2.js';
import {memoryBenefits,startMemoryCelebration} from '../systems/memory-rewards-v2.js';
import {computePose} from '../characters/rig.js';
// Unit state fixtures isolate mechanisms; the browser campaign still earns
// each boss, form and all thirty discoveries through actual controls.
function fixture(hero){
 const r=WORLD1_ROOMS['w1-'+hero],h=ROSTER.find(r=>r.id===hero),f=h.forms[4];
 const boss=NEXT_CHAPTERS[hero]?.bossId||({kilo:'w1-kilo-tambor-v1',stitcho:'w1-stitcho-glitch-v1',chispin:'w1-chispin-titan-v1'})[hero];
 const g={roomId:r.id,roomDef:r,world1Seals:[],world1Visited:{},clearedEncounters:{[r.id]:[boss]},enemies:[],projectiles:[],secrets:{[r.id]:hero==='cuerno'?['w1-cuerno-dawn-mirror-v1']:hero==='stitcho'?['w1-stitcho-main-rail-v1']:[]},player:{...h,...f,id:hero,evo:4,x:0,y:1134-f.h,w:f.w,h:f.h,xp:420,health:f.hp,maxHealth:f.hp,vx:0,vy:0,grounded:true},nums:{add(){}},fx:{emit(){}},save(){},onWorld1Beat(){}};
 enterWorld1(g);g.world1.stations.forEach(s=>s.done=true);return g;
}
function stand(g,x,y,air=false){const p=g.player;p.x=x-p.w/2;p.y=y-p.h/2;p.grounded=!air;p.vx=p.vy=0;}
test('V2 extends ten physical rooms by half with three unique discoveries and safe recovery floor',()=>{
 for(const hero of WORLD1_ORDER){const r=WORLD1_ROOMS['w1-'+hero];assert.equal(r.width,14400);assert.equal(r.expedition.nodes.length,3);assert.ok(r.checkpoints.length>=9);assert.equal(r.seal.altar.x,13920);
  for(const n of r.expedition.nodes){assert.ok(n.x>9600&&n.x<14000);assert.ok(n.id.startsWith(r.id+'-'));}
  assert.ok(r.plats.some(p=>p[0]===9600&&p[2]===4800&&p[1]===1134));
 }
});
test('V2 all thirty real discovery state machines gate seals and persist through the real save sanitizer',()=>{
 for(const hero of WORLD1_ORDER){const g=fixture(hero);assert.equal(awardSeal(g),false,'boss and stations do not replace Act II');
  for(const [i,n] of g.roomDef.expedition.nodes.entries()){
   if(n.kind==='supper'){stand(g,n.x-700,1110);updateExpedition(g);assert.equal(g.expedition.carry,n.id);stand(g,n.x,1110);updateExpedition(g);}
   else if(n.kind==='plate'){stand(g,n.x,1000,true);g.player.vy=12;updateExpedition(g);stand(g,n.x,1134-g.player.h/2);updateExpedition(g);}
   else if(n.kind==='arch'){stand(g,n.x,n.y);updateExpedition(g);assert.equal(g.expedition.done.includes(n.id),false,'standing does not count as a run');g.player.vx=g.player.speed;updateExpedition(g);}
   else if(['moon','spice'].includes(n.kind)){stand(g,n.x,n.y,true);updateExpedition(g);}
   else{stand(g,n.x,n.y,true);expeditionAbility(g,g.player,1);assert.equal(g.expedition.done.includes(n.id),false,'wrong ability cannot trigger');
    if(n.kind==='archive'){while(!expeditionWindow(g,i))updateExpedition(g);}
    expeditionAbility(g,g.player,0);
   }
   assert.equal(g.expedition.done.length,i+1,hero+' discovery '+i);
   const raw=unpackSave(packSave(g),hero);assert.ok(raw.secrets[g.roomId].includes(n.id),'real sanitizer must keep discovery');
  }
  assert.equal(expeditionReady(g),true);assert.equal(awardSeal(g),true);assert.equal(awardSeal(g),false);
  const saved=unpackSave(packSave(g),hero);g.secrets=saved.secrets;enterExpedition(g);assert.equal(g.expedition.done.length,3,'revisit retains all discoveries');
 }
});
test('V2 a living boss blocks discoveries; unearned memories cannot replay rewards',()=>{
 const g=fixture('stitcho'),n=g.roomDef.expedition.nodes[0];stand(g,n.x,n.y,true);g.enemies=[{miniBoss:true,hp:10}];expeditionAbility(g,g.player,0);assert.equal(g.expedition.done.length,0);
 assert.equal(startMemoryCelebration(g,'stitcho'),false);assert.deepEqual(memoryBenefits(24),{compass:false,magnet:false,celebration:false});assert.equal(memoryBenefits(25).compass,true);assert.equal(memoryBenefits(50).magnet,true);
 g.world1Collect={rooms:{stitcho:{found:Array.from({length:100},(_,i)=>i),relic:true}}};assert.equal(startMemoryCelebration(g,'stitcho'),true);assert.equal(g.relicScene.hero,'stitcho');assert.equal(startMemoryCelebration(g,'stitcho'),false);
});
test('V2 boss reads at warning commitment and never re-aims a live attack',()=>{
 const e={miniBoss:true,roomId:'w1-stitcho',hp:480,max:480,x:8750,y:1042,w:112,h:92,_glitch:{phase:'warn',clock:55,attack:0,aim:1}},g={player:{x:8300,y:1090,w:40,h:44,vx:4},projectiles:[]};
 prepareChapterBossV2(e,g);assert.ok(e.hp>480&&e.h>=176);assert.equal(e.damageTakenScale,0);const target={...e._v2Boss.target};g.player.x=9200;prepareChapterBossV2(e,g);assert.deepEqual(e._v2Boss.target,target);
 e._glitch.phase='attack';prepareChapterBossV2(e,g);assert.equal(e.damageTakenScale,0);e._glitch.phase='rest';prepareChapterBossV2(e,g);assert.equal(e.damageTakenScale,1);assert.ok(e.damageWindowRemaining<=170);
});
test('V2 ability invulnerability never becomes injury, real hurt recovers, and solar flight has a flight pose',()=>{
 const p={id:'kilo',evo:4,x:0,y:0,w:36,h:52,vx:0,vy:0,grounded:true,invuln:100};assert.notEqual(computePose(p,100,{rng:()=>.5}).state,'hurt');
 p._hurtAt=100;assert.equal(computePose(p,105,{rng:()=>.5}).state,'hurt');assert.notEqual(computePose(p,130,{rng:()=>.5}).state,'hurt');
 p.grounded=false;p._kiloFlightMode='solar';assert.equal(computePose(p,140,{rng:()=>.5}).state,'glide');
});

test('V2 discoveries survive starting another hero and cannot pay again across attempts',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 const a=fixture('kilo');a.expeditionStorage=storage;const n=a.roomDef.expedition.nodes[0];stand(a,n.x,n.y,true);expeditionAbility(a,a.player,0);const paid=a.score;
 const other=fixture('stitcho');other.expeditionStorage=storage;enterExpedition(other);
 const b=fixture('kilo');b.expeditionStorage=storage;b.secrets={};enterExpedition(b);assert.equal(b.expedition.done.length,1);stand(b,n.x,n.y,true);expeditionAbility(b,b.player,0);assert.equal(b.score||0,0);assert.equal(a.score,paid);
});

test('V2 adaptive selection cannot erase the four-pattern native boss cycle',()=>{
 const e={miniBoss:true,roomId:'w1-chispin',hp:480,max:480,x:8750,y:1042,w:112,h:92,_titan:{phase:'intro',clock:55,attack:0}},g={player:{x:8700,y:1090,w:40,h:44,vx:0},projectiles:[]},native=[];
 for(let turn=1;turn<=12;turn++){
  e._titan.phase='warn';prepareChapterBossV2(e,g);
  if(turn%3===0)native.push(e._titan.attack);else assert.equal(e._titan.attack,2);
  e._titan.phase='rest';prepareChapterBossV2(e,g);
 }
 assert.deepEqual(native,[0,1,2,3]);
});
