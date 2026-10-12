import test from "node:test";
import assert from "node:assert/strict";
import {FAMILY_DUETS,FAMILY_DUET_BEATS,FAMILY_DUET_LENGTH,startFamilyDuet,
 updateFamilyDuet,readFamilyDuet,familyDuetPose,familyDuetStrike} from "../systems/family-duets.js";
import {ROSTER} from "../characters/roster.js";
import {capturePeerEffects,applyPeerEffects,advancePeerEffects} from "../systems/coop-peer-effects.js";

const HEROES=["dino","frita","pizza","yomi","cuerno"];
function createGame(id,evo=4) {
 const def=ROSTER.find(p=>p.id===id);
 const p={...def,...def.forms[evo],id,evo,x:100,y:200,w:24,h:34,health:100,maxHealth:120,
  vx:3,vy:-2,facing:1,grounded:true,jumps:2,invuln:0,dead:false,cds:{},cdDur:{}};
 return {player:p,roomId:"hub",worldW:1600,worldH:900,cam:{x:0,y:0},enemies:[],
  projectiles:[],slashes:[],bolts:[],ghosts:[],t:0,reduceMotion:true,
  fx:{emit(){}},nums:{add(){}},score:0};
}

test("V306–V310: exactly five distinct canon L loans, leaving Dragón V305 to Codex",()=>{
 assert.deepEqual(Object.keys(FAMILY_DUETS).sort(),HEROES.slice().sort());
 assert.deepEqual(HEROES.map(id=>FAMILY_DUETS[id].borrowedL),["fryer","oven","maw","rainbow","ohana"]);
 assert.deepEqual(HEROES.map(id=>FAMILY_DUETS[id].ally),["frita","pizza","yomi","cuerno","kilo"]);
 for(const id of HEROES){
  const def=FAMILY_DUETS[id],friend=ROSTER.find(r=>r.id===def.ally);
  assert.ok(friend);
  assert.equal(friend.abilities[2],def.borrowedL,"each borrowed L must actually belong to the guest");
  assert.ok(def.line.length>=10);
  assert.match(def.color,/^#[0-9a-f]{6}$/i);
 }
 assert.deepEqual([...FAMILY_DUET_BEATS],[42,66,90]);
 assert.equal(FAMILY_DUET_LENGTH,120);
});

for(const id of HEROES){
 test(id+": five evolutions keep exact movement and expire after 120 frames",()=>{
  for(let evo=0;evo<5;evo++){
   const g=createGame(id,evo),p=g.player,{x,y,vx,vy}=p;
   assert.equal(startFamilyDuet(g),true);
   assert.equal(g._familyDuet.hero,id);
   assert.equal(g._familyDuet.evo,evo);
   assert.equal(g._assist.heroId,FAMILY_DUETS[id].ally);
   assert.equal(readFamilyDuet(g._familyDuet).power,undefined,"remote snapshot must omit power");
   for(let frame=0;frame<=120;frame++)updateFamilyDuet(g,()=>false,()=>{});
   assert.equal(p.x,x);assert.equal(p.y,y);assert.equal(p.vx,vx);assert.equal(p.vy,vy);
   assert.equal(g._familyDuet,null);
   assert.equal(p._familyDuetT,0);
  }
 });
 test(id+": three earned L beats in real range; no offscreen damage",()=>{
  const g=createGame(id),s={hero:id,x:112,y:234,age:42,evo:4,facing:1};
  const near={x:145,y:190,w:24,h:24,hp:10000},far={x:1100,y:190,w:24,h:24,hp:10000};
  g.enemies=[near,far];const hits=[],heals=[];
  assert.equal(familyDuetStrike(s,0,far),false);
  startFamilyDuet(g);
  const hit=(_g,e,amount)=>{assert.equal(e,near);assert.ok(amount>0);e.hp-=amount;hits.push(amount);return true;};
  for(let frame=0;frame<42;frame++)updateFamilyDuet(g,hit,(_p,n)=>heals.push(n));
  assert.equal(hits.length,0,"arrival and cue have no invisible damage");
  for(let frame=42;frame<=120;frame++)updateFamilyDuet(g,hit,(_p,n)=>heals.push(n));
  if(id==="cuerno")assert.equal(hits.length,0,"Kilo L only heals; no extra hits on dream targets");
  else assert.ok(hits.length>=1&&hits.length<=3,"only three scheduled combat beats");
  assert.equal(far.hp,10000);
  if(id==="cuerno")assert.equal(heals.length,3,"Kilo's L should heal during all three chorus beats");
  else assert.equal(heals.length,0);
 });
 test(id+": death, hero switch and room switch cancel damage and aid",()=>{
  const g=createGame(id);startFamilyDuet(g);g.roomId="beach";
  let calls=0;updateFamilyDuet(g,()=>{calls++;return true;},()=>{calls++;});
  assert.equal(g._familyDuet,null);assert.equal(calls,0);
  g.roomId="hub";startFamilyDuet(g);g.player.dead=true;
  updateFamilyDuet(g,()=>{calls++;return true;},()=>{calls++;});
  assert.equal(g._familyDuet,null);assert.equal(calls,0);
  g.player.dead=false;startFamilyDuet(g);g.player.id="kilo";
  updateFamilyDuet(g,()=>{calls++;return true;},()=>{calls++;});
  assert.equal(g._familyDuet,null);assert.equal(calls,0);
 });
 test(id+": visual snapshots are strictly finite and reject malformed network state",()=>{
  const g=createGame(id);startFamilyDuet(g);g._familyDuet.age=46;
  const view=readFamilyDuet(g._familyDuet);const pose=familyDuetPose(view);
  assert.ok(view && pose && ["arrival","exchange","borrowed-L","farewell"].includes(pose.beat));
  assert.equal(view.room,undefined);assert.equal(view.power,undefined);
  assert.equal(readFamilyDuet({...view,x:Infinity}),null);
  assert.equal(readFamilyDuet({...view,age:120}),null);
  assert.equal(readFamilyDuet({...view,evo:5}),null);
  assert.equal(readFamilyDuet({...view,hero:"dragon"}),null);
  assert.equal(readFamilyDuet({...view,facing:0}),null);
 });
 test(id+": network peers see the ally without receiving authority to damage",()=>{
  const g=createGame(id),peer=createGame(id);startFamilyDuet(g);g._familyDuet.age=50;
  g._familyDuet.power=100;g._familyDuet.hit=new Set([g.player]);g._familyDuet.secret="no";
  const frame=capturePeerEffects(g,1,id+"-duet");
  assert.equal(frame.familyDuet.power,undefined);assert.equal(frame.familyDuet.hit,undefined);
  assert.equal(frame.familyDuet.secret,undefined);
  assert.equal(applyPeerEffects(peer,frame),true);
  assert.equal(peer._familyDuet,undefined);
  const replica=peer.coopPeerEffects.familyDuet;
  assert.equal(replica.hero,id);assert.equal(replica.age,50);
  const before=peer.player.health;
  advancePeerEffects(peer);
  assert.equal(replica.age,51);assert.equal(peer.player.health,before);
  assert.equal(applyPeerEffects(peer,{...frame,frameNo:2,familyDuet:{...frame.familyDuet,age:121}}),false);
  assert.equal(applyPeerEffects(peer,{...frame,frameNo:2,familyDuet:{...frame.familyDuet,hero:"evil"}}),false);
 });
}

globalThis.window=globalThis;
globalThis.addEventListener ||=()=>{};
const {useAbility,updateAbilityFx,clearAbilityFx}=await import("../systems/abilities.js");

for(const id of HEROES){
 test(id+": real U cast preserves legacy states, adds borrowed-L beats and never freezes controls",()=>{
  for(let evo=0;evo<5;evo++){
   clearAbilityFx();
   const g=createGame(id,evo),near={x:145,y:190,w:24,h:24,hp:10000},
    far={x:900,y:190,w:24,h:24,hp:10000};
   g.enemies=[];
   const before=[g.player.x,g.player.y,g.player.vx,g.player.vy];
   assert.equal(useAbility(g,3),true);
   assert.equal(g.ult.t,0);
   assert.equal(g._familyDuet.hero,id);
   assert.equal(g._familyDuet.evo,evo);
   assert.equal(g._assist.heroId,FAMILY_DUETS[id].ally);
   assert.deepEqual([g.player.x,g.player.y,g.player.vx,g.player.vy],before);
   assert.equal(near.hp,10000);
   assert.equal(far.hp,10000);
   g.enemies=[near,far]; // Late arrivals can be struck by borrowed L.
   assert.equal(useAbility(g,3),false,"normal U cooldown stays in effect");
   for(let n=0;n<44;n++){g.t++;updateAbilityFx(g);}
   if(id==="cuerno")assert.ok(g.player.health>=100,"Kilo L restores health without adding attacks");
   else assert.ok(near.hp<10000,"first L hit actually applies damage through the real ability system");
  }
  clearAbilityFx();
 });
}
