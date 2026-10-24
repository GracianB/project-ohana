import {updateCampaignEnemy} from '../systems/campaign-enemies.js';
import {packSave,unpackSave} from '../systems/save.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {startKiloFlight,steerKiloFlight,stopKiloFlight,kiloNoteTrajectory} from '../systems/kilo-flight.js';
import {KILO_AIR_CHIMES,enterKiloAirTrail,updateKiloAirTrail} from '../systems/kilo-chapter.js';
import {WORLD1_ROOMS,WORLD1_ORDER,WORLD1_CHAPTER_PLANS} from '../systems/world1-rooms.js';
import {groveAerialVolley,initGroveGuardian,updateGroveGuardian} from '../systems/grove-guardian.js';
import {powerStatus} from '../systems/power-status.js';
globalThis.window=globalThis;globalThis.addEventListener||=()=>{};
const {useAbility,clearAbilityFx,updateAbilityFx,hitEnemy}=await import('../systems/abilities.js');
function arena(){return {roomId:'w1-kilo',roomDef:WORLD1_ROOMS['w1-kilo'],t:0,worldW:9600,worldH:1260,cam:{x:0,y:0},player:{id:'kilo',evo:4,x:0,y:0,w:36,h:52,facing:1,speed:6.2,health:210,maxHealth:210,abilities:['ukulele','hula','ohana'],cds:{},cdDur:{}},enemies:[],platforms:[],projectiles:[],ghosts:[],score:0,nums:{add(){}},fx:{emit(){}},world1:{},secrets:{},save(){}};}
test('solar flight sustains normalized steering, stops on command/death and never leaks to another hero',()=>{
 const p=arena().player;startKiloFlight(p,4);
 for(let i=0;i<6000;i++)assert.equal(steerKiloFlight(p,{axisX:1,jump:true}),true);
 assert.equal(p._kiloFlightMode,'solar');assert.ok(Math.hypot(p.vx,p.vy)<=6.401);assert.ok(Number.isFinite(p._kiloFlightT));
 for(let i=0;i<60;i++)steerKiloFlight(p,{});assert.equal(p.vx,0);assert.equal(p.vy,0);
 stopKiloFlight(p);assert.equal(steerKiloFlight(p,{}),false);
 startKiloFlight(p,4);p.dead=true;assert.equal(steerKiloFlight(p,{}),false);assert.equal(p._kiloFlightMode,null);
 assert.equal(steerKiloFlight({id:'cat',evo:4,_kiloFlightT:360},{}),false);
});
test('K can end solar flight during cooldown, without extending its original offensive/reflection field',()=>{
 clearAbilityFx();const g=arena();assert.equal(useAbility(g,1),true);const cd=g.player.cds.hula;
 assert.equal(powerStatus(g,1).kind,'flight');assert.equal(powerStatus(g,1).available,true);
 for(let i=0;i<400;i++){g.t++;steerKiloFlight(g.player,{});updateAbilityFx(g);}
 assert.ok(g.player._kiloFlightT>0);assert.ok(!g.kiloAbilityFx.some(f=>f.kind==='hula'),'offensive aura still expires');
 assert.equal(useAbility(g,1),true);assert.equal(g.player._kiloFlightT,0);assert.equal(g.player.cds.hula,cd);
 clearAbilityFx();const early=arena();useAbility(early,1);early.t=1;assert.equal(useAbility(early,1),true);assert.equal(useAbility(early,1),false,'restart still obeys cooldown');
});
test('solar J can aim up/down/diagonally while grounded J keeps its bounce and homing contract',()=>{
 const p=arena().player;const ground=kiloNoteTrajectory(p,1);assert.equal(ground.maxB,3);assert.equal(ground.home,true);assert.ok(ground.vy<0);
 startKiloFlight(p,4);steerKiloFlight(p,{drop:true});let shot=kiloNoteTrajectory(p,1);assert.ok(Math.abs(shot.vx)<.001);assert.ok(shot.vy>0);assert.equal(shot.directed,true);assert.equal(shot.maxB,0);
 steerKiloFlight(p,{axisX:-1,jump:true});shot=kiloNoteTrajectory(p,1);assert.ok(shot.vx<0&&shot.vy<0);assert.equal(shot.home,false);assert.equal(shot.life,90);
});
test('air chimes require actual solar-flight contact and never repay after reload',()=>{
 const g=arena();enterKiloAirTrail(g);const ch=KILO_AIR_CHIMES[0];g.player.x=ch.x-18;g.player.y=ch.y-26;
 updateKiloAirTrail(g);assert.equal(g.score,0);startKiloFlight(g.player,4);updateKiloAirTrail(g);assert.equal(g.score,150);
 const loaded=unpackSave(packSave(g),'kilo');g.secrets=loaded.secrets;
 enterKiloAirTrail(g);updateKiloAirTrail(g);assert.equal(g.score,150);assert.equal(g.world1.airChimes[0].done,true);assert.equal(g.player.xp,undefined);
 g.player.evo=3;const next=KILO_AIR_CHIMES[1];g.player.x=next.x-18;g.player.y=next.y-26;updateKiloAirTrail(g);assert.equal(g.score,150);
});
test('chapter guardian locks a visible aerial fan at warning time instead of homing after launch',()=>{
 const f=WORLD1_ROOMS['w1-kilo'].foes.find(f=>f[4]?.special),e={x:f[0],y:f[1],roomPersona:f[4]};initGroveGuardian(e);
 const p={x:8490,y:600,w:36,h:52},g={player:p,cam:{x:8200,y:300},viewW:1400,viewH:900,projectiles:[],nums:{add(){}}};
 assert.equal(groveAerialVolley(e,{...p,y:1082}),null);
 e._drummer.phase='rest';e._drummer.timer=1;updateGroveGuardian(e,g,()=>{});const rays=structuredClone(e._drummer.aerialVolley);assert.equal(rays.length,3);assert.ok(rays.every(r=>r.vy<0));
 p.x=9250;p.y=900;for(let i=0;i<61;i++)updateGroveGuardian(e,g,()=>{});
 assert.equal(g.projectiles.length,3);assert.deepEqual(g.projectiles.map(({vx,vy})=>({vx,vy})),rays);
});
test('ten chapter contracts have distinct identities and interactions, using existing room owners',()=>{
 assert.equal(new Set(WORLD1_ORDER.map(h=>WORLD1_CHAPTER_PLANS[h].identity)).size,10);
 assert.equal(new Set(WORLD1_ORDER.map(h=>WORLD1_CHAPTER_PLANS[h].interaction)).size,10);
 for(const hero of WORLD1_ORDER)assert.equal(WORLD1_ROOMS['w1-'+hero].chapterPlan,WORLD1_CHAPTER_PLANS[hero]);
});

test('real ability hits use height and facing for shields, so flying above opens a flank',()=>{
 const g=arena(),e={campaignRole:'shield',_shieldFacing:1,x:300,y:1000,w:48,h:64,hp:1000};
 g.player.x=400;g.player.y=1000;hitEnemy(g,e,100);assert.equal(e.hp,970);
 e.hp=1000;e.invuln=0;g.player.y=700;hitEnemy(g,e,100);assert.equal(e.hp,900);
});

test('air sentries keep authored height bands while reacting to a target and do not become ground pursuers',()=>{
 const g=arena();g.player.x=4600;g.player.y=1050;const e={x:4680,y:760,w:40,h:30,hp:50,vy:0,campaignRole:'flyer',roomPersona:{flightBand:{top:550,bottom:820}}};g.enemies=[e];
 for(let i=0;i<800;i++){updateCampaignEnemy(e,g,()=>{});assert.ok(e.y>=550&&e.y+e.h<=820);}
 g.player.y=600;for(let i=0;i<100;i++)updateCampaignEnemy(e,g,()=>{});assert.ok(e.y<700,'sentry changes height when player enters the air route');
});
