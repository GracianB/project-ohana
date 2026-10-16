import test from "node:test";
import assert from "node:assert/strict";
import {ROSTER} from "../characters/roster.js";
import {DEFAULT_U_PARTNERS,optionsForUPartner,chooseUPartner,
 uPartnerInfo,loadUPartnerChoice,storeUPartnerChoice,gainUExp,uExpRank,uExpPower,MAX_U_EXP}
 from "../systems/u-partners.js";
import {FAMILY_DUETS,FAMILY_DUET_BEATS,FAMILY_DUET_LENGTH,
 familyDuetDefinition,startFamilyDuet,updateFamilyDuet,readFamilyDuet,
 familyDuetChoreography,drawFamilyDuet,familyDuetStrike} from "../systems/family-duets.js";
import {capturePeerEffects,applyPeerEffects,advancePeerEffects} from "../systems/coop-peer-effects.js";
import {packSave,unpackSave} from "../systems/save.js";

const heroes=ROSTER.map(x=>x.id);
function game(id,evo=4){
 const def=ROSTER.find(x=>x.id===id),p={...def,...def.forms[evo],
  id,evo,x:100,y:200,w:24,h:34,health:100,maxHealth:120,
  facing:1,vx:2,vy:-1,dead:false,cds:{},cdDur:{}};
 return {player:p,roomId:"hub",t:0,worldW:1600,worldH:900,
  cam:{x:0,y:0},enemies:[],projectiles:[],platforms:[],
  fx:{emit(){}},nums:{add(){}},score:0};
}
function canvas(){
 const stack=[],calls=[],props={globalAlpha:1};
 return {calls,ctx:new Proxy(props,{
  get(obj,key){
   if(key==="save")return()=>{calls.push(key);stack.push({...obj})};
   if(key==="restore")return()=>{calls.push(key);Object.assign(obj,stack.pop())};
   if(key in obj)return obj[key];
   return(...args)=>{calls.push([key,...args])};
  },set(o,k,v){o[k]=v;return true;}
 })};
}
test("V313: nine real choices for every hero, defaults match all old U casts",()=>{
 assert.equal(heroes.length,10);
 assert.deepEqual(Object.keys(DEFAULT_U_PARTNERS).sort(),heroes.slice().sort());
 for(const hero of heroes){
  const options=optionsForUPartner(hero);
  assert.equal(options.length,9);
  assert.equal(new Set(options.map(o=>o.id)).size,9);
  assert.ok(options.every(o=>o.id!==hero&&o.lName.length>=4));
  assert.ok(options.every(o=>ROSTER.find(r=>r.id===o.id).abilities[2]===o.borrowedL));
  assert.equal(chooseUPartner(hero,hero),DEFAULT_U_PARTNERS[hero]);
  assert.equal(chooseUPartner(hero,"evil"),DEFAULT_U_PARTNERS[hero]);
  assert.equal(uPartnerInfo(hero).id,DEFAULT_U_PARTNERS[hero]);
 }
 assert.deepEqual(Object.keys(FAMILY_DUETS).sort(),["cuerno","dino","dragon","frita","pizza","yomi"].sort());
});
test("V313: 90 authoritative U combinations borrow the selected real L without touching original geometry",()=>{
 const samples=new Set();
 for(const hero of heroes)for(const buddy of optionsForUPartner(hero)){
  const def=familyDuetDefinition({hero,ally:buddy.id});
  assert.ok(def,hero+"/"+buddy.id);
  assert.equal(def.ally,buddy.id);
  assert.equal(def.borrowedL,ROSTER.find(r=>r.id===buddy.id).abilities[2]);
  assert.ok(def.cue.includes(ROSTER.find(r=>r.id===buddy.id).name.toUpperCase()));
  const g=game(hero),initial=[g.player.x,g.player.y,g.player.vx,g.player.vy];
  assert.equal(startFamilyDuet(g,1.25,[],buddy.id),true);
  assert.equal(g._assist.heroId,buddy.id);
  assert.equal(g._familyDuet.ally,buddy.id===DEFAULT_U_PARTNERS[hero]?undefined:buddy.id);
  const frame=readFamilyDuet(g._familyDuet),stage=familyDuetChoreography(frame,true);
  assert.equal(stage.ally,buddy.id);
  assert.equal(stage.borrowedL,def.borrowedL);
  const actors=[],{ctx,calls}=canvas();
  assert.equal(drawFamilyDuet(ctx,{...frame,age:43},{x:0,y:0},43,
   (_,actor)=>actors.push(actor),ROSTER,true),true);
  assert.equal(actors.length,1);assert.equal(actors[0].id,buddy.id);
  assert.equal(calls.filter(x=>x==="save").length,calls.filter(x=>x==="restore").length);
  const nearby={x:frame.x+35,y:frame.y-44,w:28,h:26,hp:3000};
  const remote={x:1200,y:40,w:24,h:24,hp:3000};
  g.enemies=[nearby,remote];
  const strikes=[];
  for(let step=0;step<=120;step++){
   updateFamilyDuet(g,(_g,e,n)=>{strikes.push([step,e,n]);e.hp-=n;return true;},
    (p,n)=>{assert.equal(def.borrowedL,"ohana");p.health+=n;});
  }
  assert.ok(strikes.every(([step,e,n])=>FAMILY_DUET_BEATS.includes(step)&&e===nearby&&n>0));
  assert.equal(remote.hp,3000,"out of range and old shots cannot be hit");
  assert.deepEqual([g.player.x,g.player.y,g.player.vx,g.player.vy],initial);
  assert.equal(g._familyDuet,null);
  samples.add(hero+"+"+buddy.id);
 }
 assert.equal(samples.size,90);
});
test("V313: five real evolutions for all 90 pairs and valid multiplayer-only visuals",()=>{
 let total=0;
 for(const hero of heroes)for(const buddy of optionsForUPartner(hero)){
  for(let evo=0;evo<5;evo++){
   const g=game(hero,evo),peer=game(hero,evo);
   startFamilyDuet(g,1.2,[],buddy.id);g._familyDuet.age=48;
   const packet=capturePeerEffects(g,1,"v313");
   assert.equal(packet.familyDuet.power,undefined);
   assert.equal(packet.familyDuet.legacyTargets,undefined);
   assert.equal(applyPeerEffects(peer,packet),true,hero+"/"+buddy.id);
   assert.equal(peer._familyDuet,undefined,"remote state must not gain combat authority");
   assert.equal(familyDuetDefinition(peer.coopPeerEffects.familyDuet).ally,buddy.id);
   assert.equal(peer.player.health,100);
   advancePeerEffects(peer);
   assert.equal(peer.coopPeerEffects.familyDuet.age,49);
   assert.equal(readFamilyDuet({...packet.familyDuet,ally:"untrusted"}),null);
   assert.equal(readFamilyDuet({...packet.familyDuet,ally:hero}),null);
   assert.equal(readFamilyDuet({...packet.familyDuet,evo:9}),null);
   total++;
  }
 }
 assert.equal(total,450);
});
test("V313: borrowed L telegraphs each of the three beats and never authorizes damage twice",()=>{
 for(const hero of heroes)for(const buddy of optionsForUPartner(hero)){
  const g=game(hero),target={x:145,y:175,w:24,h:24,hp:1000};
  startFamilyDuet(g,1,[target],buddy.id);
  g.enemies=[target];
  const hits=[];
  for(let step=0;step<121;step++)updateFamilyDuet(g,(_g,e,d)=>{hits.push([e,d]);return true;},()=>{});
  assert.deepEqual(hits,[],"already damaged legacy U targets cannot be hit twice");
  for(const tick of FAMILY_DUET_BEATS){
   const frame={hero,ally:buddy.id,age:tick,x:115,y:234,facing:1,evo:4};
   const shot=familyDuetChoreography(frame,true);
   assert.equal(shot.impact,true);
   assert.equal(shot.borrowedL,buddy.borrowedL);
  }
 }
 assert.equal(FAMILY_DUET_LENGTH,120);
});
test("V313: bond EXP levels up, survives save v2, and is capped",()=>{
 const p={id:"cat",uExp:0,dead:false},g=game("cat");
 assert.equal(uExpRank(0),1);assert.equal(uExpRank(35),2);assert.equal(uExpRank(100),3);
 assert.equal(gainUExp(p,0),3);assert.equal(gainUExp(p,1),5);
 for(let i=0;i<100;i++)gainUExp(p,2);
 assert.equal(p.uExp,MAX_U_EXP);
 assert.equal(uExpPower(p),1.2);
 assert.equal(gainUExp(p,3),0);
 assert.equal(gainUExp({...p,dead:true},3),0);
 g.player.uExp=137;
 const saved=packSave(g),decoded=unpackSave(saved,"cat");
 assert.equal(saved.v,3);assert.equal(decoded.uExp,137);
 assert.equal(unpackSave({...saved,uExp:1e8},"cat").uExp,200);
 assert.equal(unpackSave({...saved,uExp:"bad"},"cat").uExp,0);
 assert.equal(unpackSave({...saved,uExp:undefined},"cat").uExp,0);
});
test("V313: partner choice persists per hero, invalid IDs fail safely",()=>{
 const storage=new Map(),local={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
 assert.equal(loadUPartnerChoice(local,"dragon"),"dino");
 assert.equal(storeUPartnerChoice(local,"dragon","cat"),true);
 assert.equal(storeUPartnerChoice(local,"yomi","pizza"),true);
 assert.equal(loadUPartnerChoice(local,"dragon"),"cat");
 assert.equal(loadUPartnerChoice(local,"yomi"),"pizza");
 assert.equal(loadUPartnerChoice(local,"cuerno"),"kilo");
 assert.equal(storeUPartnerChoice(local,"dragon","dragon"),false);
 assert.equal(storeUPartnerChoice(local,"dragon","admin"),false);
 assert.equal(loadUPartnerChoice({getItem:()=>"{oops"},"dragon"),"dino");
});
