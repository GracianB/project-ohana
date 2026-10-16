import test from 'node:test';import assert from 'node:assert/strict';import {createStars,updateStellar,STAR_TICKS,STAR_STYLES,starSnapshot,applyStarSnapshot} from '../systems/stellar-power.js';import {roomDimensions,TRAINING_ROOM,roomCheckpoints,reachedCheckpoint,sanitizeCheckpoints} from '../systems/adventure-state.js';import {createSaveStore,packSave,unpackSave} from '../systems/save.js';import {captureCombatFrame,validCombatFrame,applyCombatFrame} from '../systems/coop-combat-mirror.js';import {ROSTER,ALL_ROSTER} from '../characters/roster.js';import {adventureProfile} from '../characters/adventure-profiles.js';
const player=()=>({id:'kilo',evo:0,x:0,y:0,w:20,h:28,health:80,maxHealth:80,starLeft:0});
test('V430 star lasts 600 active ticks, is host-owned and never executes bosses',()=>{
 const p=player(),g={player:p,t:0,stars:[{x:10,y:14,taken:false}],enemies:[]};let starts=0,ends=0;
 updateStellar(g,{authority:false});assert.equal(p.starLeft,0);assert.equal(g.stars[0].taken,false);
 updateStellar(g,{onStart(){starts++},onEnd(){ends++}});assert.equal(p.starLeft,STAR_TICKS);assert.equal(starts,1);
 const normal={x:0,y:0,w:20,h:28,hp:200,max:200,evo:0},boss={x:0,y:0,w:20,h:28,hp:1000,max:1000,boss:true};g.enemies=[normal,boss];g.t=1;updateStellar(g);assert.equal(normal.hp,0);assert.equal(normal.starDefeated,true);assert.equal(normal.evo,0);assert.equal(boss.hp,992);
 g.t=2;updateStellar(g);assert.equal(boss.hp,992);g.t=61;updateStellar(g);assert.equal(boss.hp,984);
 for(let i=0;i<597;i++){g.t++;updateStellar(g,{onEnd(){ends++}});}assert.equal(p.starLeft,0);assert.equal(ends,1);
 assert.equal(Object.keys(STAR_STYLES).length,10);assert.equal(new Set(Object.values(STAR_STYLES).map(s=>s[1])).size,10);
});
test('V430 star and checkpoint snapshots are bounded, shared and reject stale frames',()=>{
 const p=player(),remote={...player(),starLeft:421},host={player:p,coopRemote:remote,roomId:'hub',coopRoomVisit:1,t:0,stars:[{x:10,y:14,taken:true}],enemies:[{x:20,y:10,w:20,h:28,hp:0,max:100,kind:'cucaracho',starDefeated:true}],projectiles:[],checkpoints:{hub:'combate'}};p.starLeft=222;
 const frame=captureCombatFrame(host,1,'audit');assert.equal(validCombatFrame(frame),true);assert.equal(frame.enemies[0].flags.starDefeated,true);assert.deepEqual(frame.star,{host:222,guest:421,mask:1});assert.equal(validCombatFrame({...frame,star:{...frame.star,guest:Infinity}}),false);
 const guest={createCoopEnemy:item=>({...item}),player:player(),coopRemote:player(),roomId:'hub',enemies:[],projectiles:[],stars:[{x:10,y:14,taken:false}],checkpoints:{},checkpointPoints:[{id:'combate'}]};
 assert.equal(applyCombatFrame(guest,frame),true);assert.equal(guest.enemies[0].starDefeated,true);assert.equal(guest.player.starLeft,421);assert.equal(guest.coopRemote.starLeft,222);assert.equal(guest.stars[0].taken,true);assert.equal(guest.checkpoints.hub,'combate');assert.equal(applyCombatFrame(guest,frame),false);
 assert.equal(applyStarSnapshot(guest,{host:-1,guest:600,mask:1}),false);
});
test('V430 dimensions, three training checkpoints and save v2 migration remain safe',()=>{
 assert.deepEqual(roomDimensions({}),{width:2240,height:1260});assert.deepEqual(roomDimensions({width:3000,height:1800},2.2),{width:6600,height:3960});
 const points=roomCheckpoints(TRAINING_ROOM),p={...player(),x:170,y:782,grounded:true};assert.equal(points.length,3);assert.equal(reachedCheckpoint(points,p).id,'inicio');
 assert.deepEqual(sanitizeCheckpoints({hub:'inicio',invalid:'x',beach:'../../'}),{hub:'inicio'});
 const g={player:p,roomId:'hub',checkpoints:{hub:'combate'}},raw=packSave(g);assert.equal(raw.v,3);assert.equal(unpackSave(raw,'kilo').checkpoints.hub,'combate');assert.deepEqual(unpackSave({...raw,v:2},'kilo').checkpoints,{});
 const data=new Map([['ohana','unchanged']]),store=createSaveStore({setItem(k,v){data.set(k,v)},getItem:k=>data.get(k)});assert.equal(store.write({...g,practice:true}),false);assert.equal(data.get('ohana'),'unchanged');
 assert.equal(createStars(TRAINING_ROOM).length,1);
});
test('V430 ten handling profiles balance fifty forms without changing anatomy',()=>{
 for(const def of ROSTER){const old=ALL_ROSTER.find(r=>r.id===def.id),profile=adventureProfile(def.id);assert.ok(profile.accel>=.8&&profile.accel<=1.2);for(let i=0;i<5;i++){assert.equal(def.forms[i].w,old.forms[i].w);assert.equal(def.forms[i].h,old.forms[i].h);assert.ok(def.forms[i].speed>0&&def.forms[i].jump>0&&def.forms[i].hp>0);}}
});
test('V430 borrowed-L healing cannot write or gain bond EXP in training',async()=>{
 const {startFamilyDuet,updateFamilyDuet}=await import('../systems/family-duets.js');
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');let writes=0;const data=new Map();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>data.get(k)||null,setItem(k,v){writes++;data.set(k,v)}}});
 try{const p={...player(),id:'cuerno',evo:4,uBonds:{},uPartner:'kilo',uExp:0},g={player:p,practice:true,roomId:'hub',enemies:[]};
  assert.equal(startFamilyDuet(g,1,[],'kilo'),true);for(let i=0;i<93;i++)updateFamilyDuet(g,()=>true,()=>{});assert.equal(writes,0);assert.deepEqual(p.uBonds,{});
  g.practice=false;startFamilyDuet(g,1,[],'kilo');for(let i=0;i<93;i++)updateFamilyDuet(g,()=>true,()=>{});assert.ok(writes>0);assert.ok(p.uBonds.kilo>0);
 }finally{if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else delete globalThis.localStorage;}
});
