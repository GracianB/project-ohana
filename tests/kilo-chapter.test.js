import test from 'node:test';import assert from 'node:assert/strict';
import {WORLD1_ROOMS,WORLD1_FLOOR} from '../systems/world1-rooms.js';
import {enterWorld1,updateWorld1,world1NextObjective,world1CanLeave,awardSeal} from '../systems/world1-play.js';
import {kiloNoteGrowth,KILO_CHAPTER_BOSS_ID,KILO_CHAPTER_ARENA} from '../systems/kilo-chapter.js';
import {initGroveGuardian,updateGroveGuardian} from '../systems/grove-guardian.js';
const fixture=()=>{const r=WORLD1_ROOMS['w1-kilo'],g={roomDef:r,roomId:r.id,world1Seals:[],world1Stations:{},world1Visited:{},clearedEncounters:{},enemies:[],player:{id:'kilo',x:0,y:1094,w:28,h:40,health:80,maxHealth:80,xp:0,vx:0,grounded:true},nums:{add(){}},fx:{emit(){}},save(){}};enterWorld1(g);return g;};
function note(g,index){const s=g.world1.stations[index];g.player.x=s.x-g.player.w/2;g.player.y=WORLD1_FLOOR-g.player.h;for(let i=0;i<45;i++)updateWorld1(g);return s;}
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
test('a nearby living enemy blocks a note; corpses and distant enemies do not, and damage interrupts holding',()=>{
 const g=fixture(),s=g.world1.stations[0];g.enemies=[{x:s.x-60,y:s.y-40,w:40,h:40,hp:50}];
 assert.equal(note(g,0).done,false);assert.match(world1NextObjective(g).action,/Despeja/);
 g.enemies[0].hp=0;for(let i=0;i<30;i++)updateWorld1(g);assert.equal(s.hold,30);
 g.player.health-=5;updateWorld1(g);assert.equal(s.hold,0);assert.equal(s.done,false);
 for(let i=0;i<45;i++)updateWorld1(g);assert.equal(s.done,true);
});
test('restored notes recover earned XP floors without paying score; old earned seals remain valid',()=>{
 const g=fixture();note(g,0);g.player.xp=0;const score=g.score;enterWorld1(g);
 assert.equal(g.player.xp,55);assert.equal(g.score,score);assert.equal(g.world1.stations[0].done,true);
 g.world1Seals=['kilo'];enterWorld1(g);assert.equal(g.world1.sealed,true);assert.equal(world1CanLeave(g,'right'),true);
});
test('the chapter guardian uses the new arena and save ID without moving the legacy guardian',()=>{
 const r=WORLD1_ROOMS['w1-kilo'],f=r.foes.find(f=>f[4]?.special);assert.ok(f);const e={x:f[0],y:f[1],hp:1,roomPersona:f[4]};initGroveGuardian(e);
 assert.equal(e.hp,360);assert.equal(e._encounterSaveId,KILO_CHAPTER_BOSS_ID);
 const g={player:{x:8700,y:1080,w:36,h:52},cam:{x:8200,y:600},viewW:1200,viewH:700,projectiles:[],nums:{add(){}}};
 for(let i=0;i<1000;i++){updateGroveGuardian(e,g,()=>{});assert.ok(e.x>=KILO_CHAPTER_ARENA.left);assert.ok(e.x+e.w<=KILO_CHAPTER_ARENA.right);assert.equal(e.y+e.h,WORLD1_FLOOR);}
});
import {damageEnemy} from '../systems/mutations.js';
test('chapter guardian protects its introduction and exposes recovery consistently for every damage caller',()=>{
 const f=WORLD1_ROOMS['w1-kilo'].foes.find(f=>f[4]?.special),e={x:f[0],y:f[1],roomPersona:f[4]};initGroveGuardian(e);
 assert.equal(damageEnemy(e,100),false);assert.equal(e.hp,360);
 const g={player:{x:8700,y:1080,w:36,h:52},cam:{x:8200,y:600},viewW:1200,viewH:700,projectiles:[],nums:{add(){}}};
 e._drummer.phase='warn';e._drummer.timer=50;updateGroveGuardian(e,g,()=>{});damageEnemy(e,100);assert.equal(e.hp,340);
 e._drummer.phase='rest';e._drummer.timer=50;updateGroveGuardian(e,g,()=>{});damageEnemy(e,100);assert.equal(e.hp,240);
 const normal={hp:360};damageEnemy(normal,100);assert.equal(normal.hp,260);
});

test('Kilo notes have clear floor access, and all other hero rooms retain their own objectives',()=>{
 const room=WORLD1_ROOMS['w1-kilo'];
 for(const note of room.seal.stations)assert.ok(!room.plats.some(([x,y,w])=>y<1134&&x<note.x+90&&x+w>note.x-90));
 for(const [id,r] of Object.entries(WORLD1_ROOMS))if(id!=='w1-kilo')assert.ok(!r.kiloChapter);
});
