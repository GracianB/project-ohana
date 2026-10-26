import test from 'node:test';import assert from 'node:assert/strict';
import {mergeAdventureFinale,holdAdventureFinalScene,applyAdventureFinale,adventureFinalePayload} from '../multiplayer/adventure-finale.js';
import {KEEPSAKE_ORDER,KEEPSAKES} from '../systems/keepsakes.js';
const players=['host','guest'],auth={host:true,playerId:'host',players};
const guardian=(hero,hp=100)=>({x:9270,y:910,w:184,h:224,hp,max:820,kind:'keeper',gauntletBoss:hero,miniBoss:true,[KEEPSAKES[hero].key]:{phase:'rest',clock:30}});
const state=(hero='kilo')=>({found:[],phase:'intro',hero,guardian:guardian(hero),boss:null,won:false,cue:{id:'scene:one',scene:'keepsakeIntro',hero}});
const ready=(s,id,who)=>mergeAdventureFinale(s,{ready:id},{playerId:who,players});
test('only the authenticated host owns finale state; both players own their scene acknowledgements',()=>{
 const p=state();const s=mergeAdventureFinale(null,{state:p},auth);assert.equal(s.cue.ready.length,0);assert.equal(mergeAdventureFinale(s,{state:{...p,phase:'fight'}},{playerId:'guest',players}).phase,'intro');
 let ack=ready(s,p.cue.id,'host');assert.deepEqual(ack.cue.ready,['host']);assert.equal(mergeAdventureFinale(ack,{state:{...p,phase:'fight'}},auth).phase,'intro');ack=ready(ack,p.cue.id,'guest');assert.equal(mergeAdventureFinale(ack,{state:{...p,phase:'fight'}},auth).phase,'fight');assert.deepEqual(ready(ack,p.cue.id,'guest'),ack);
});
test('ten physical rescue receipts must be ordered, defeated and cannot be skipped or erased',()=>{
 let s=null;for(const [i,hero]of KEEPSAKE_ORDER.entries()){
  const p={...state(hero),phase:'rescue',found:KEEPSAKE_ORDER.slice(0,i+1),guardian:guardian(hero,0),cue:null};
  if(i===0){assert.equal(mergeAdventureFinale(null,{state:{...p,found:KEEPSAKE_ORDER}},auth).found.length,0);assert.equal(mergeAdventureFinale(null,{state:{...p,guardian:guardian(hero)}},auth).found.length,0);}
  s=mergeAdventureFinale(s,{state:p},auth);assert.equal(s.found.length,i+1);
 }
 const before=structuredClone(s);assert.deepEqual(mergeAdventureFinale(s,{state:state()},auth),before);
});
test('a scene is held until both readers finish; disconnect never silently releases it',()=>{
 const g={onlineAdventure:true,roomId:'w1-final',coopAuthority:false,_coopFinalCue:{id:'scene:one',scene:'keepsakeIntro'},coopFinaleState:{cue:{id:'scene:one',ready:['host']}},coopFinalPlayerIds:players};
 const cine={id:'keepsakeIntro'};assert.equal(holdAdventureFinalScene(g,cine),true);assert.equal(g._coopFinalReady,'scene:one');g.coopFinaleState.cue.ready.push('guest');assert.equal(holdAdventureFinalScene(g,cine),false);g.coopFinalDisconnected=true;assert.equal(holdAdventureFinalScene(g,cine),true);
});
test('guest replays each confirmed scene once, shares receipts and never changes the chosen hero',()=>{
 const films=[],g={onlineAdventure:true,roomId:'w1-final',player:{id:'dino',health:71},enemies:[],playWorld1Cine:(id,hero)=>films.push([id,hero])};const s=mergeAdventureFinale(null,{state:state()},auth);
 applyAdventureFinale(g,s,{players:players.map(playerId=>({playerId,connected:true}))});applyAdventureFinale(g,s,{players:players.map(playerId=>({playerId,connected:true}))});assert.equal(films.length,1);assert.equal(g.player.id,'dino');assert.equal(g.player.health,71);assert.equal(g.finalGauntlet.guardian.gauntletBoss,'kilo');assert.equal(g.enemies.length,1);
});
test('host payload carries the same cue while a film is paused and never sends solo state',()=>{
 const g={onlineAdventure:true,coopAuthority:true,roomId:'w1-final',world1Cine:{id:'keepsakeIntro',hero:'kilo'},finalGauntlet:{...state(),found:[]}};
 const a=adventureFinalePayload(g),b=adventureFinalePayload(g);assert.equal(a.state.cue.id,b.state.cue.id);g.onlineAdventure=false;assert.equal(adventureFinalePayload(g),null);
});

test('a later scene never traps a slower reader in the previous acknowledged scene',()=>{
 let s=mergeAdventureFinale(null,{state:state()},auth);s=ready(ready(s,'scene:one','host'),'scene:one','guest');
 const oldCine={id:'keepsakeIntro'},g={onlineAdventure:true,roomId:'w1-final',coopAuthority:false,world1Cine:oldCine,_coopFinalCue:{id:'scene:one',scene:'keepsakeIntro'},coopFinaleState:s,coopFinalPlayerIds:players};
 adventureFinalePayload(g);
 const p={...state(),phase:'rescue',found:['kilo'],guardian:guardian('kilo',0),cue:{id:'scene:two',scene:'keepsakeRescue',hero:'kilo'}};
 s=mergeAdventureFinale(s,{state:p},auth);assert.ok(s.finished.includes('scene:one'));g.coopFinaleState=s;g._coopFinalCue=s.cue;assert.equal(holdAdventureFinalScene(g,oldCine),false);
});

import {onlineCoop} from '../systems/online-coop.js';
import {fusionShotHitsPlayer} from '../systems/fusion-boss.js';
import {applyAdventureProgress} from '../multiplayer/adventure-progress.js';
test('final guardian guest hits obey the same closed window and finite damage budget as local attacks',()=>{
 const c=new onlineCoop.constructor(),e={...guardian('kilo',100),_coopSyncId:7,_coopVisit:2,damageTakenScale:0,damageWindowRemaining:18},g={onlineAdventure:true,roomId:'w1-final',enemies:[e]};
 const hit={targetSyncId:7,targetVisit:2,kind:'keeper',x:e.x,y:e.y,damage:90};assert.equal(c.applyRemoteHit(g,hit),false);assert.equal(e.hp,100);e.damageTakenScale=1;assert.equal(c.applyRemoteHit(g,hit),true);assert.equal(e.hp,82);assert.equal(e.damageWindowRemaining,0);
});
test('finale snapshots retain full-width warning geometry and reject non-finite or oversized shots',()=>{
 const p={...state(),shots:[{id:1,x:7550,y:1100,w:3700,h:30,life:28,dmg:25,vx:0,vy:0,gauntlet:'prism'}]};const s=mergeAdventureFinale(null,{state:p},auth);assert.equal(s.shots[0].w,3700);
 assert.equal(mergeAdventureFinale(s,{state:{...p,shots:[{...p.shots[0],w:Infinity}]}},auth).shots[0].w,3700);
});
test('cooperative Quimera shots use native delay, beam band and ground-wave collision rules',()=>{
 const p={x:9000,y:1000,w:60,h:100};assert.equal(fusionShotHitsPlayer({k:'beam',life:10,liveFor:20,band:1100,delay:1},p),false);assert.equal(fusionShotHitsPlayer({k:'beam',life:10,liveFor:20,band:1100},p),true);assert.equal(fusionShotHitsPlayer({k:'wave',life:10,r:60,x:9030},p),false);
});
test('reconnecting in the final room restores global seals before any room-owned puzzle exists',()=>{
 const g={onlineAdventure:true,roomId:'w1-final',world1:{room:'w1-final',statuesLit:[]},world1Seals:[]};assert.equal(applyAdventureProgress(g,{stations:{},secrets:{},encounters:{},seals:KEEPSAKE_ORDER}),true);assert.equal(g.world1Seals.length,10);
});

test('shared rescue celebration pays once on a new receipt and never on initial hydration or reload',()=>{
 let paid=0;const g={onlineAdventure:true,roomId:'w1-final',enemies:[],onGauntletAward:()=>paid++};const a={found:['kilo'],phase:'rescue',hero:'kilo',guardian:guardian('kilo',0),boss:null,cue:null,revision:1};applyAdventureFinale(g,a);assert.equal(paid,0);const b={...a,found:['kilo','stitcho'],hero:'stitcho',guardian:guardian('stitcho',0),revision:2};applyAdventureFinale(g,b);applyAdventureFinale(g,b);assert.equal(paid,1);
});
test('completion requires the real final enemy death and both ending acknowledgements',()=>{
 const boss={...guardian('yomi',0),kind:'boss',boss:true,_fusionBoss:true};delete boss.gauntletBoss;
 const old={found:[...KEEPSAKE_ORDER],phase:'complete',hero:'yomi',guardian:null,boss,cue:null,seen:[],won:false,revision:1};
 let s=mergeAdventureFinale(old,{state:{...old,won:true,cue:{id:'scene:ending',scene:'ending',hero:null}}},auth);assert.equal(s.complete,false);s=ready(s,'scene:ending','host');assert.equal(s.complete,false);s=ready(s,'scene:ending','guest');assert.equal(s.complete,true);
});

import {updateWorld1Cine} from '../systems/world1-cine.js';
test('a long cinematic wait releases once even beyond the scene watchdog',()=>{
 let ended=0;const g={onlineAdventure:true,roomId:'w1-final',coopAuthority:false,world1Cine:{id:'keepsakeIntro',i:0,t:6001,total:6001,shots:[{dur:1}]},_coopFinalCue:{id:'scene:long',scene:'keepsakeIntro'},coopFinaleState:{cue:{id:'scene:long',ready:players}},coopFinalPlayerIds:players,onWorld1CineEnd:()=>ended++};
 updateWorld1Cine(g);assert.equal(g.world1Cine,null);assert.equal(ended,1);
});

test('Quimera keeps its full native ninety-shot budget in a bounded final snapshot',()=>{
 const boss={x:9300,y:844,w:230,h:290,hp:2800,max:2800,kind:'boss',_fusionBoss:true,_fusion:{mode:'attack',shots:Array.from({length:90},(_,id)=>({id,x:9000+id,y:1000,r:20,vx:5,vy:0,life:120,dmg:18,k:'orb',source:'QUIMERA · LA FAMILIA RECUERDA SU HOGAR'}))}};
 const old={found:[...KEEPSAKE_ORDER],phase:'complete',hero:'yomi',guardian:null,boss:null,cue:null,seen:[],won:false,revision:1};const s=mergeAdventureFinale(old,{state:{...old,boss}},auth);assert.equal(s.boss._fusion.shots.length,90);assert.ok(JSON.stringify(s).length<60000);
});
