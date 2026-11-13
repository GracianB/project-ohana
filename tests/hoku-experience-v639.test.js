import test from 'node:test';import assert from 'node:assert/strict';
import {atlasEarnedForm,atlasSelection,atlasProgress,atlasGamepadIntent,ATLAS_MODES} from '../systems/hoku-atlas-model.js';
import {WORLD1_ORDER,WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {startKiloFlight,steerKiloFlight,kiloNoteTrajectory} from '../systems/kilo-flight.js';
import {updateKiloAirTrail} from '../systems/kilo-chapter.js';
import {updateCampaignEnemy} from '../systems/campaign-enemies.js';
import {kiloVirtuosoRig} from '../characters/kilo-virtuoso.js';
test('atlas only offers forms earned by this hero, a valid save or its seal',()=>{
 assert.equal(atlasEarnedForm('kilo'),0);assert.equal(atlasEarnedForm('kilo',{save:{id:'stitcho',evo:4}}),0);
 assert.equal(atlasEarnedForm('kilo',{save:{id:'lilo',evo:2}}),2);assert.equal(atlasEarnedForm('kilo',{seals:['kilo']}),4);
 assert.equal(atlasEarnedForm('fake',{earned:{fake:4}}),0);
});
test('atlas locks the Corazón and confirms one coherent owner/destination/form',()=>{
 assert.equal(atlasSelection('kilo','w1-final',4).allowed,false);
 assert.equal(atlasSelection('kilo','w1-final',4,{seals:WORLD1_ORDER}).allowed,true);
 assert.deepEqual(atlasSelection('kilo','w1-stitcho',4),{hero:'stitcho',room:'w1-stitcho',form:0,allowed:true});
});
test('earned forms survive a new active save without granting them to another hero',()=>{
 const values=new Map(),store={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 atlasProgress(store,{id:'kilo',evo:3});const progress=atlasProgress(store,null);assert.equal(atlasEarnedForm('kilo',progress),3);assert.equal(atlasEarnedForm('cat',progress),0);
});
test('gamepad moves and confirms on an edge, never repeatedly while held',()=>{
 const pad={axes:[1,0],buttons:[{pressed:true},{pressed:false}]},first=atlasGamepadIntent(pad),held=atlasGamepadIntent(pad,first.state);
 assert.equal(first.move,1);assert.equal(first.confirm,true);assert.equal(held.move,0);assert.equal(held.confirm,false);
 assert.equal(atlasGamepadIntent({axes:[0,0],buttons:[{}, {pressed:true}]}).back,true);
});
test('multiplayer mode links go to the configured live lobby with explicit intents',()=>{
 assert.deepEqual(ATLAS_MODES.map(m=>new URL(m.href).searchParams.get('mode')),['adventure','versus']);
 assert.ok(ATLAS_MODES.every(m=>new URL(m.href).hostname==='project-ohana-multiplayer.netlify.app'));
});
test('Kilo hover notes follow deliberate steering from the second form; ground notes keep bouncing',()=>{
 for(let evo=1;evo<=4;evo++){
  const p={id:'kilo',evo,facing:1};startKiloFlight(p,evo);steerKiloFlight(p,{jump:true});const shot=kiloNoteTrajectory(p,0);
  assert.ok(shot.directed);assert.ok(shot.vy<0);assert.equal(shot.maxB,0);assert.equal(shot.home,false);
  p._kiloFlightT=0;assert.equal(kiloNoteTrajectory(p,0).maxB,3);
 }
});
test('the compact Claro retains continuous physical ground, four lessons, and reachable optional routes',()=>{
 const r=WORLD1_ROOMS['w1-kilo'];assert.equal(r.width,9600);assert.equal(r.seal.stations.length,4);
 const floors=r.plats.filter(p=>p[3]>40).sort((a,b)=>a[0]-b[0]);for(let i=1;i<floors.length;i++)assert.equal(floors[i][0],floors[i-1][0]+floors[i-1][2]);
 assert.equal(floors.at(-1)[0]+floors.at(-1)[2],r.width);assert.equal(r.windColumns.length,2);assert.ok(r.foes.every(f=>f[0]>0&&f[0]<r.width));
});
test('the upper shortcut opens only after the bamboo and is never duplicated',()=>{
 const r=WORLD1_ROOMS['w1-kilo'],g={roomId:r.id,roomDef:r,world1:{stations:[{},{}]},platforms:[],player:{id:'kilo',x:0,y:1000,w:28,h:40,evo:1}};
 updateKiloAirTrail(g);assert.equal(g.platforms.length,0);g.world1.stations[1].done=true;updateKiloAirTrail(g);updateKiloAirTrail(g);assert.equal(g.platforms.length,1);assert.equal(g.platforms[0].kiloWindBridge,true);
});
test('a failed Kilo enemy commitment opens a recovery window instead of instantly attacking again',()=>{
 const e={kind:'cucaracho',x:400,y:1094,w:40,h:40,hp:100,campaignRole:'pursuer',grounded:true,vx:8,vy:0,roomPersona:{kiloEncounter:true},_campaign:{age:0,wind:0,active:1,cd:0,aim:1}};
 const g={roomDef:{kiloExperienceVersion:639,kiloEncounterVersion:606},player:{x:500,y:1094,w:30,h:40},cam:{x:0,y:500},worldW:9600,worldH:1260,viewW:1280,viewH:720,platforms:[{x:0,y:1134,w:9600,h:126}],enemies:[e],projectiles:[]};
 updateCampaignEnemy(e,g,()=>{});assert.equal(e._campaign.recover,28);
 for(let i=0;i<20;i++){updateCampaignEnemy(e,g,()=>{});assert.equal(e.telegraph,false);assert.equal(e._campaign.active,0);}
});
test('virtuoso performance never changes a frozen pose or generates non-finite joints',()=>{
 for(let f=0;f<5;f++)for(const state of ['idle','attack','cast','jump','hurt']){
  const p=Object.freeze({state,atk:.5,cast:.7}),before=JSON.stringify(p),r=kiloVirtuosoRig(p,f);
  assert.equal(JSON.stringify(p),before);assert.ok(Object.values(r).every(v=>typeof v!=='number'||Number.isFinite(v)));
 }
});
