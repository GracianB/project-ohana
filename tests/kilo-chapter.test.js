// Instrument state, earned growth and guardian protection are isolated here;
// real traversal and combat are covered by the browser chapter pilot.
import test from 'node:test';import assert from 'node:assert/strict';
import {WORLD1_ROOMS,WORLD1_FLOOR} from '../systems/world1-rooms.js';
import {enterWorld1,updateWorld1,world1NextObjective,world1CanLeave,awardSeal,kiloChapterAbility,interactKiloInstrument} from '../systems/world1-play.js';
import {kiloNoteGrowth,KILO_CHAPTER_BOSS_ID,KILO_CHAPTER_ARENA} from '../systems/kilo-chapter.js';
import {initGroveGuardian,updateGroveGuardian} from '../systems/grove-guardian.js';
const fixture=()=>{const r=WORLD1_ROOMS['w1-kilo'],g={roomDef:{...r,expedition:null},roomId:r.id,world1Seals:[],world1Stations:{},world1Visited:{},clearedEncounters:{},enemies:[],player:{id:'kilo',x:0,y:1094,w:28,h:40,health:80,maxHealth:80,xp:0,evo:0,vx:0,grounded:true},nums:{add(){}},fx:{emit(){}},save(){}};enterWorld1(g);return g;};
function note(g,index){
 const s=g.world1.stations[index],p=g.player;p.x=s.x-p.w/2;p.y=s.y-p.h;p.grounded=index!==2;p.evo=Math.max(p.evo||0,index);
 const cast=slot=>{p._cast={slot,t:g.world1.tick};kiloChapterAbility(g,p,slot);};
 if(index===0)interactKiloInstrument(g);else if(index===1)for(let i=0;i<3;i++)cast(0);else if(index===2)cast(0);else{for(let i=0;i<3;i++)cast(0);cast(4);}
 if(s.done)p.evo=Math.max(p.evo,index+1);return s;
}
test('four earned notes provide four XP milestones, never replay XP or lower exploration XP',()=>{
 const early=fixture();early.clearedEncounters['w1-kilo']=[KILO_CHAPTER_BOSS_ID];assert.equal(awardSeal(early),false,'guardian alone does not replace notes');
 const g=fixture();for(const [i,xp] of [55,140,260,420].entries()){assert.equal(note(g,i).done,true);assert.equal(g.player.xp,xp);for(let j=0;j<50;j++)updateWorld1(g);assert.equal(g.player.xp,xp);}
 assert.equal(g.world1.sealed,false);assert.equal(world1CanLeave(g,'right'),false);assert.equal(awardSeal(g),false);
 assert.equal(world1NextObjective(g).label,'Tambor del Claro');
 g.player.xp=700;kiloNoteGrowth(g);assert.equal(g.player.xp,700);
 g.clearedEncounters['w1-kilo']=[KILO_CHAPTER_BOSS_ID];updateWorld1(g);
 assert.equal(g.world1.sealed,true);assert.equal(world1CanLeave(g,'right'),true);assert.equal(g.player.xp,703);
 updateWorld1(g);assert.equal(g.player.xp,703);
});
test('a nearby enemy blocks an instrument; corpses do not, and waiting or damage never plays it automatically',()=>{
 const g=fixture(),s=g.world1.stations[0];g.enemies=[{x:s.x-60,y:s.y-40,w:40,h:40,hp:50}];
 assert.equal(note(g,0).done,false);assert.match(world1NextObjective(g).action,/Despeja/);
 g.enemies[0].hp=0;for(let i=0;i<45;i++)updateWorld1(g);assert.equal(s.done,false,'clearing a threat does not fabricate a played instrument');
 g.player.health-=5;updateWorld1(g);assert.equal(s.done,false);
 interactKiloInstrument(g);assert.equal(s.done,true,'a fresh physical interaction plays the cleared caracola');
 const score=g.score;interactKiloInstrument(g);assert.equal(g.score,score,'the same instrument never pays twice');
});
test('a distant patrol cannot silently block the physical instrument action',()=>{
 const g=fixture(),s=g.world1.stations[0];
 // The old 270px invisible exclusion zone blocked a perfectly safe note.
 g.enemies=[{x:s.x-220,y:s.y-40,w:40,h:40,hp:100}];
 note(g,0);
 assert.equal(s.done,true);
 const near=fixture(),n=near.world1.stations[0];
 near.enemies=[{x:n.x-85,y:n.y-40,w:40,h:40,hp:100}];
 assert.equal(note(near,0).done,false);
});

test('restored notes recover earned XP floors without paying score; old earned seals remain valid',()=>{
 const g=fixture();note(g,0);g.player.xp=0;const score=g.score;enterWorld1(g);
 assert.equal(g.player.xp,55);assert.equal(g.score,score);assert.equal(g.world1.stations[0].done,true);
 g.world1Seals=['kilo'];enterWorld1(g);assert.equal(g.world1.sealed,true);assert.equal(world1CanLeave(g,'right'),true);
});
test('the chapter guardian uses the new arena and save ID without moving the legacy guardian',()=>{
 const r=WORLD1_ROOMS['w1-kilo'],f=r.foes.find(f=>f[4]?.special);assert.ok(f);const e={x:f[0],y:f[1],hp:1,roomPersona:f[4]};initGroveGuardian(e);
 assert.equal(e.hp,540);assert.equal(e._encounterSaveId,KILO_CHAPTER_BOSS_ID);
 const g={player:{x:KILO_CHAPTER_ARENA.left+200,y:1080,w:36,h:52,evo:4},cam:{x:KILO_CHAPTER_ARENA.left-100,y:600},viewW:1800,viewH:700,projectiles:[],nums:{add(){}}};
 for(let i=0;i<1000;i++){updateGroveGuardian(e,g,()=>{});assert.ok(e.x>=KILO_CHAPTER_ARENA.left);assert.ok(e.x+e.w<=KILO_CHAPTER_ARENA.right);assert.equal(e.y+e.h,WORLD1_FLOOR);}
});
import {damageEnemy} from '../systems/mutations.js';
test('chapter guardian protects its introduction and exposes recovery consistently for every damage caller',()=>{
 const f=WORLD1_ROOMS['w1-kilo'].foes.find(f=>f[4]?.special),e={x:f[0],y:f[1],roomPersona:f[4]};initGroveGuardian(e);
 assert.equal(damageEnemy(e,100),false);assert.equal(e.hp,540);
 const g={player:{x:KILO_CHAPTER_ARENA.left+200,y:1080,w:36,h:52,evo:4},cam:{x:KILO_CHAPTER_ARENA.left-100,y:600},viewW:1800,viewH:700,projectiles:[],nums:{add(){}}};
 e._drummer.phase='warn';e._drummer.timer=50;updateGroveGuardian(e,g,()=>{});damageEnemy(e,100);assert.equal(e.hp,540);
 e._drummer.phase='rest';e._drummer.timer=50;e.damageWindowRemaining=150;updateGroveGuardian(e,g,()=>{});damageEnemy(e,100);assert.equal(e.hp,440);
 const normal={hp:360};damageEnemy(normal,100);assert.equal(normal.hp,260);
});

test('Kilo instruments have clear approach and real support, including the aerial harp, while other rooms keep their objectives',()=>{
 const room=WORLD1_ROOMS['w1-kilo'];
 for(const note of room.seal.stations){
  assert.ok(room.plats.some(([x,y,w])=>y===note.y&&x<note.x&&x+w>note.x),note.name+' has a real support');
  assert.ok(!room.plats.some(([x,y,w])=>y<note.y&&y>note.y-130&&x<note.x+50&&x+w>note.x-50),note.name+' has no low ceiling');
 }
 assert.ok(room.seal.stations[2].y<WORLD1_FLOOR,'the canopy lesson is physically elevated');
 for(const [id,r] of Object.entries(WORLD1_ROOMS))if(id!=='w1-kilo')assert.ok(!r.kiloChapter);
});

test('earned sealed Kilo progress restores the maximum XP floor instead of trapping repeat visits',()=>{
 const g=fixture();g.world1Seals=['kilo'];g.player.xp=0;enterWorld1(g);
 assert.equal(g.player.xp,420);assert.equal(g.world1.sealed,true);
 const score=g.score;enterWorld1(g);assert.equal(g.score,score);assert.equal(g.player.xp,420);
});
test('Tambor requires earned final form and survives a full-power multi-hit burst until later recoveries',()=>{
 const f=WORLD1_ROOMS['w1-kilo'].foes.find(f=>f[4]?.special),e={x:f[0],y:f[1],roomPersona:f[4]};initGroveGuardian(e);
 const g={player:{x:KILO_CHAPTER_ARENA.left+200,y:1050,w:36,h:70,evo:3},world1:{stations:[{done:true},{done:true},{done:true},{done:true}]},cam:{x:KILO_CHAPTER_ARENA.left-100,y:600},viewW:1800,viewH:700,projectiles:[],nums:{add(){}}};
 updateGroveGuardian(e,g,()=>{});assert.equal(e._drummer.phase,'waiting');
 g.player.evo=4;updateGroveGuardian(e,g,()=>{});assert.equal(e._drummer.phase,'intro');
 e._drummer.phase='strike';e._drummer.timer=1;updateGroveGuardian(e,g,()=>{});
 assert.equal(e._drummer.phase,'rest');assert.equal(e.damageWindowRemaining,150);
 damageEnemy(e,1000);assert.equal(e.hp,390);assert.equal(damageEnemy(e,1000),false);
 updateGroveGuardian(e,g,()=>{});assert.equal(e._drummer.phase,'step');assert.equal(damageEnemy(e,1000),false);
 const legacy={x:3400,y:1086,roomPersona:{special:true,name:'Tambor del Claro'}};initGroveGuardian(legacy);assert.equal(legacy.hp,360);assert.equal(legacy.damageWindowRemaining,undefined);
});
