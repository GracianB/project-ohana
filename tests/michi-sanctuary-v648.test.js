import test from 'node:test';import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {passageReady,interactMichiSanctuary,sanctuaryObjective,sanctuaryZone,updateMichiSanctuary} from '../systems/michi-sanctuary.js';
import {world1CollectPlacements} from '../systems/world1-collect.js';
import {buildChapterFilm} from '../systems/chapter-cinema.js';
import {createMichiBoss,updateMichiBoss} from '../systems/michi-boss.js';
import {damageEnemy} from '../systems/mutations.js';
import {worldBounds} from '../systems/world-bounds.js';
import {captureCombatFrame,validCombatFrame} from '../systems/coop-combat-mirror.js';
const room=WORLD1_ROOMS['w1-cat'];
const game=()=>({roomDef:room,roomId:room.id,worldW:14400,worldH:2100,viewW:1280,viewH:720,cam:{x:0,y:0},player:{id:'cat',x:4360,y:1116,w:18,h:18,evo:4,health:100},world1:{stations:room.seal.stations.map(s=>({...s,done:false})),sealed:false},expedition:{done:[]},projectiles:[]});
test('Michi sanctuary preserves identities and gives each branch a real destination floor',()=>{
 assert.equal(room.width,14400);assert.equal(room.height,2100);assert.deepEqual(room.seal.stations.map(s=>s.id),[0,1,2,3,4]);assert.equal(room.michiSanctuary.zones.length,7);
 for(const a of room.michiSanctuary.passages){assert.ok(room.plats.some(p=>a.toX>p[0]&&a.toX<p[0]+p[2]&&a.toFloor===p[1]),a.id);assert.ok(a.need<=5);}
 assert.deepEqual(worldBounds('w1-cat'),{width:14400,height:2100});assert.equal(worldBounds('w1-kilo').height,1260);
});
test('all 100 stable memories have physical support and avoid solid walls',()=>{
 const items=world1CollectPlacements(room);assert.equal(items.length,100);assert.equal(new Set(items.map(m=>m.id)).size,100);
 for(const m of items){assert.equal(m.page,Math.floor(m.id/10));assert.ok(room.plats.some(p=>m.x>=p[0]&&m.x<=p[0]+p[2]&&p[1]-m.y===27),'support '+m.id);assert.ok(!room.plats.some(p=>p[3]>24&&m.x>p[0]&&m.x<p[0]+p[2]&&m.y>p[1]&&m.y<p[1]+p[3]),'buried '+m.id);}
});
test('tunnels enforce lamp gates, preserve life/form and cannot bounce on held input',()=>{
 const g=game(),a=room.michiSanctuary.passages[0];g.player.x=a.x-9;assert.equal(passageReady(g,a),false);assert.equal(interactMichiSanctuary(g),true);assert.equal(g.player.x,a.x-9);
 g.world1.stations[0].done=true;assert.equal(interactMichiSanctuary(g),true);assert.equal(g.player.x,a.toX-9);assert.equal(g.player.health,100);assert.equal(g.player.evo,4);assert.equal(sanctuaryZone(g).id,'crypt');assert.equal(interactMichiSanctuary(g),false);
});
test('wayfinding follows unlocked tunnels to the next lamp rather than pointing through a ceiling',()=>{
 const g=game();g.world1.stations[0].done=true;const o=sanctuaryObjective(g);assert.equal(o.x,3870);assert.match(o.action,/↓ \/ E/);g.player.x=1200;g.player.y=1800;assert.equal(sanctuaryObjective(g).x,1910);
});
test('exit requires earned seal and all three post-boss echoes',()=>{const g=game(),a=room.michiSanctuary.passages.find(a=>a.exit);g.world1.stations.forEach(s=>s.done=true);assert.equal(passageReady(g,a),false);g.world1.sealed=true;assert.equal(passageReady(g,a),false);g.expedition.done=[0,1,2];assert.equal(passageReady(g,a),true);});
for(const event of ['roomEnter','awaken','chapterHundred','chapterBossIntro','chapterExit'])test('native story contract '+event,()=>{const shots=buildChapterFilm(event,'cat',{form:2});assert.ok(shots.length);assert.ok(shots.every(s=>s.line&&s.title&&s.form===2&&s.dur>100&&s.layout==='chapter-film'));assert.equal(buildChapterFilm(event,'kilo'),null);});
function bossFixture(){const g=game();g.world1.stations.forEach(s=>s.done=true);const e=createMichiBoss((x,y,kind,roomId)=>({x,y,kind,roomId,hp:1,invuln:0}),()=>.5,{roomId:room.id,chapter:'cat',sanctuary:true,x:8750,arena:{left:8260,right:9320,floor:1134,hp:480}});g.player.x=8490;g.enemies=[e];return{g,e};}
for(let attack=0;attack<3;attack++)test('guard boss pattern '+attack+' commits aim, warns harmlessly and exposes a bounded recovery',()=>{
 const{g,e}=bossFixture();const b=e._astralCat;b.phase='rest';b.clock=1;b.attack=attack;updateMichiBoss(e,g,()=>assert.fail('warning damage'));assert.equal(b.phase,'warn');const aim=b.aim,targetX=b.targetX,rays=JSON.stringify(b.rays),columns=JSON.stringify(b.columns);g.player.x=9200;for(let i=0;i<30;i++)updateMichiBoss(e,g,()=>assert.fail('warning damage'));assert.equal(b.aim,aim);assert.equal(b.targetX,targetX);assert.equal(JSON.stringify(b.rays),rays);assert.equal(JSON.stringify(b.columns),columns);assert.equal(g.projectiles.length,0);const hp=e.hp;damageEnemy(e,100);assert.equal(e.hp,hp);
 for(let i=0;i<80&&b.phase!=='rest';i++)updateMichiBoss(e,g,()=>{});assert.equal(b.phase,'rest');assert.equal(e.damageTakenScale,1);damageEnemy(e,500);assert.equal(e.hp,hp-180);assert.equal(e.damageWindowRemaining,0);assert.ok(g.projectiles.length<=5);
 const frame=captureCombatFrame(g,1,'test');assert.equal(validCombatFrame(frame),true);assert.equal(frame.enemies[0].chapterMind.state.targetX,targetX);
});
test('new moth waits for actual five lamps and final form',()=>{const{g,e}=bossFixture();g.world1.stations[4].done=false;for(let i=0;i<150;i++)updateMichiBoss(e,g,()=>assert.fail('locked boss hit'));assert.equal(e._astralCat.phase,'intro');assert.equal(e.damageTakenScale,0);assert.equal(g.projectiles.length,0);});

test('boss victory persists once and guides to visible echoes before awarding the seal',()=>{const g=game(),scenes=[];g.world1.stations.forEach(s=>s.done=true);g.clearedEncounters={'w1-cat':['w1-cat-astral-v1']};g.playWorld1Cine=id=>scenes.push(id);g.save=()=>{};g.player.x=8400;updateMichiSanctuary(g);updateMichiSanctuary(g);assert.deepEqual(scenes,['chapterBossVictory']);assert.equal(g.world1.sealed,false);g.player.x=4360;assert.equal(sanctuaryObjective(g).x,4100);assert.match(sanctuaryObjective(g).label,/Eco del hogar/);});
