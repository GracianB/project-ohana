import {adventureRoomProgress,mergeAdventureProgress,applyAdventureProgress} from '../multiplayer/adventure-progress.js';
import {packSave,unpackSave} from '../systems/save.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {gardenHas,interactMichiGarden,updateMichiGarden,nearestGardenInteraction,gardenInteractionPrompt} from '../systems/michi-garden-life.js';
const room=WORLD1_ROOMS['w1-cat'];
function game(id='rain'){
 const q=[...room.michiSanctuary.garden.mechanisms,...room.michiSanctuary.garden.moments].find(q=>q.id===id);
 return {roomDef:room,player:{x:q.x-11,y:q.floor-30,w:22,h:30,vx:0,vy:2,grounded:true,xp:17,evo:1},platforms:room.plats.map(([x,y,w,h])=>({x,y,w,h})),secrets:{},enemies:[],save(){this.saves=(this.saves||0)+1;}};
}
test('courtyard exits are spatially separate and the memory route uses a real upper balcony',()=>{
 const court=room.michiSanctuary.passages.filter(a=>a.x>=3300&&a.x<5800);
 assert.equal(court.length,3);assert.equal(new Set(court.map(q=>q.kind)).size,3);
 for(let i=0;i<court.length;i++)for(let j=i+1;j<court.length;j++)assert.ok(Math.hypot(court[i].x-court[j].x,court[i].floor-court[j].floor)>800);
 const gallery=court.find(a=>a.id==='court-gallery');assert.equal(gallery.floor,850);assert.ok(room.plats.some(p=>gallery.x>=p[0]&&gallery.x<p[0]+p[2]&&p[1]===gallery.floor));
 assert.ok(room.michiSanctuary.passages.find(a=>a.exit).x>9000);
});
test('rain wheel builds one real saved bridge without changing the room or granting growth',()=>{
 const g=game(),before=JSON.stringify(room);assert.equal(gardenHas(g,'rain'),false);
 assert.equal(g.platforms.some(p=>p.michiGardenBridge),false);assert.ok(interactMichiGarden(g));
 assert.ok(gardenHas(g,'rain'));assert.equal(g.platforms.filter(p=>p.michiGardenBridge).length,1);
 for(let i=0;i<100;i++)updateMichiGarden(g);assert.equal(g.platforms.filter(p=>p.michiGardenBridge).length,1);
 assert.equal(g.player.xp,17);assert.equal(g.player.evo,1);assert.equal(JSON.stringify(room),before);
 const restored=game();g.player.id='cat';g.roomId='w1-cat';restored.secrets=unpackSave(packSave(g,{snapshot:()=>({})}),'cat').secrets;updateMichiGarden(restored);assert.equal(restored.platforms.filter(p=>p.michiGardenBridge).length,1);
});
test('bell calms only nearby sanctuary fauna; bosses and remote targets retain agency',()=>{
 const g=game('hush');g.enemies=[{x:2150,y:1800,hp:25,roomPersona:{michiSanctuary:true}},{x:2200,y:1800,hp:500,_astralCat:{}},{x:4100,y:1800,hp:25,roomPersona:{michiSanctuary:true}}];
 interactMichiGarden(g);assert.equal(g.enemies[0].stun,180);assert.equal(g.enemies[1].stun,undefined);assert.equal(g.enemies[2].stun,undefined);
 for(let i=0;i<50;i++)updateMichiGarden(g);const remaining=g._michiGardenHush;interactMichiGarden(g);assert.equal(g._michiGardenHush,remaining);
});
test('earned wind assists deliberate airborne entry and never takes over ground control',()=>{
 const g=game('wind');g.player.x=6740;updateMichiGarden(g);assert.equal(g.player.vy,2);
 g.player.x=6779;interactMichiGarden(g);updateMichiGarden(g);assert.equal(g.player.vy,2);
 g.player.grounded=false;g.player.y=480;updateMichiGarden(g);assert.equal(g.player.vy,-4.8);
 g.player.x=8000;g.player.vy=2;updateMichiGarden(g);assert.equal(g.player.vy,2);
});
test('listening moments are unique, persistent and bounded; another room cannot consume E',()=>{
 const g=game('bench');assert.equal(nearestGardenInteraction(g).id,'bench');interactMichiGarden(g);assert.ok(gardenHas(g,'bench'));assert.equal(g._michiGardenMoment.id,'bench');
 for(let i=0;i<430;i++)updateMichiGarden(g);assert.equal(g._michiGardenMoment,null);interactMichiGarden(g);assert.equal(g.secrets['w1-cat'].filter(q=>q==='w1-cat-garden-bench').length,1);
 g.roomDef={hero:'kilo'};assert.equal(interactMichiGarden(g),false);
});
test('memory identities survive the redesign and wind balconies physically support the high route',()=>{
 assert.deepEqual([...room.michiSanctuary.memories.map(q=>q.id)].sort((a,b)=>a-b),Array.from({length:100},(_,i)=>i));
 for(const id of[97,98,99]){const m=room.michiSanctuary.memories.find(q=>q.id===id);assert.ok(room.plats.some(p=>m.x>=p[0]&&m.x<=p[0]+p[2]&&Math.abs(m.y+27-p[1])<1));}
});

test('garden completion crosses the authenticated co-op progress pipeline without XP or seal grants',()=>{
 const host=game();host.roomId='w1-cat';interactMichiGarden(host);
 const progress=mergeAdventureProgress(null,adventureRoomProgress(host),{roomId:'w1-cat'});
 const peer=game();peer.roomId='w1-cat';peer.onlineAdventure=true;peer.world1={room:'w1-cat',stations:[]};
 applyAdventureProgress(peer,progress);updateMichiGarden(peer);
 assert.ok(gardenHas(peer,'rain'));assert.ok(peer.platforms.some(q=>q.michiGardenBridge));assert.equal(peer.player.xp,17);assert.deepEqual(peer.world1Seals,[]);
 assert.match(gardenInteractionPrompt(peer),/^E\b/,'touch E must see an actionable prompt');
});
