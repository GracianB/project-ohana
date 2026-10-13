import test from "node:test";
import assert from "node:assert/strict";
import {ROSTER} from "../characters/roster.js";
import {FAMILY_DUETS,FAMILY_DUET_BEATS,startFamilyDuet,updateFamilyDuet,
 familyDuetStrike,familyDuetChoreography,readFamilyDuet,drawFamilyDuet} from "../systems/family-duets.js";
import {capturePeerEffects,applyPeerEffects,advancePeerEffects} from "../systems/coop-peer-effects.js";

function game(evo=4){
 const def=ROSTER.find(r=>r.id==="dragon");
 const p={...def,...def.forms[evo],id:"dragon",evo,x:100,y:200,w:28,h:36,
  health:100,maxHealth:125,vx:2,vy:-1,facing:1,grounded:false,jumps:1,
  cds:{},cdDur:{},invuln:0,dead:false};
 return {player:p,roomId:"volcano",t:0,worldW:1600,worldH:900,
  cam:{x:0,y:0},platforms:[],enemies:[],projectiles:[],slashes:[],bolts:[],ghosts:[],score:0,
  fx:{emit(){}},nums:{add(){}}};
}
test("V305: Dragon borrows Dino's actual L quake, not its own L meteor",()=>{
 assert.equal(ROSTER.find(r=>r.id==="dino").abilities[2],"quake");
 const u=FAMILY_DUETS.dragon;
 assert.equal(u.ally,"dino");assert.equal(u.borrowedL,"quake");
 assert.equal(u.kind,"quake");assert.match(u.cue,/DINO.*TERREMOTO/);
 assert.notEqual(u.borrowedL,ROSTER.find(r=>r.id==="dragon").abilities[2]);
});
test("V305: five evolutions see the authentic Dino guest and three terrain L forecasts",()=>{
 for(let evo=0;evo<5;evo++){
  const g=game(evo);assert.equal(startFamilyDuet(g,1.25),true);
  assert.equal(g._familyDuet.evo,evo);
  assert.equal(g._assist.heroId,"dino");
  for(const [i,beat] of FAMILY_DUET_BEATS.entries()){
   const pre=familyDuetChoreography({...readFamilyDuet(g._familyDuet),age:beat-8},true);
   const impact=familyDuetChoreography({...readFamilyDuet(g._familyDuet),age:beat},true);
   assert.equal(pre.telegraph,true);assert.equal(pre.keyframe,i);
   assert.equal(impact.impact,true);assert.equal(impact.keyframe,i);
   const focus={hero:"dragon",x:114,y:236,age:beat,evo,facing:1};
   const e={x:154+i*54,y:193,w:24,h:28};
   assert.equal(familyDuetStrike(focus,i,e),true);
   assert.equal(familyDuetStrike(focus,i,{...e,x:1000}),false);
  }
  const actors=[];
  const ctx=new Proxy({globalAlpha:1},{
   get(target,key){if(key in target)return target[key];return()=>{};},
   set(target,key,val){target[key]=val;return true;}
  });
  const state={...readFamilyDuet(g._familyDuet),age:65};
  assert.equal(drawFamilyDuet(ctx,state,{x:0,y:0},65,(_ctx,actor)=>actors.push(actor),ROSTER,true),true);
  assert.equal(actors.length,1);
  assert.equal(actors[0].id,"dino");
  assert.equal(actors[0].evo,evo);
  assert.equal(actors[0].w,ROSTER.find(r=>r.id==="dino").forms[evo].w);
 }
});
test("V305: hits only at 42/66/90 with no double hit on enemies already struck by Dragon U",()=>{
 const g=game();const existing={x:145,y:195,w:26,h:27,hp:2000},
   newcomer={x:145,y:195,w:26,h:27,hp:2000},far={x:1300,y:195,w:26,h:27,hp:2000};
 g.enemies=[existing,newcomer,far];
 startFamilyDuet(g,1,[existing]);const seen=[];
 for(let frame=0;frame<=120;frame++){
  if(frame===48)newcomer.x=202;
  if(frame===73)newcomer.x=268;
  updateFamilyDuet(g,(_g,e,damage,opts)=>{assert.notEqual(e,existing);assert.notEqual(e,far);
   assert.ok(damage>0);assert.ok(opts.stun>=30);
   seen.push({age:frame,target:e});e.hp-=damage;return true;},()=>{throw Error("quake is not a heal")});
 }
 assert.deepEqual(seen.map(x=>x.age),[42,66,90]);
 assert.equal(existing.hp,2000);assert.equal(far.hp,2000);
 assert.equal(g._familyDuet,null);
});
test("V305: cancel on room travel, death or hero change; preserve velocity",()=>{
 for(const failure of ["room","dead","hero"]){
  const g=game();const before=[g.player.x,g.player.y,g.player.vx,g.player.vy];
  startFamilyDuet(g);
  for(let n=0;n<6;n++)updateFamilyDuet(g,()=>true,()=>{});
  assert.deepEqual([g.player.x,g.player.y,g.player.vx,g.player.vy],before);
  if(failure==="room")g.roomId="beach";
  if(failure==="dead")g.player.dead=true;
  if(failure==="hero")g.player.id="dino";
  updateFamilyDuet(g,()=>{throw Error("cancelled duel cannot hurt")},()=>{});
  assert.equal(g._familyDuet,null);
 }
});
test("V305: peer receives visual Dino, never damage, secret data or flight authority",()=>{
 const g=game(),peer=game();startFamilyDuet(g,1.5);
 g._familyDuet.age=50;g._familyDuet.power=1000;g._familyDuet.legacyTargets.add(g.player);
 const frame=capturePeerEffects(g,1,"dragon-dino");
 assert.equal(frame.familyDuet.hero,"dragon");
 assert.equal(frame.familyDuet.power,undefined);assert.equal(frame.familyDuet.legacyTargets,undefined);
 assert.equal(applyPeerEffects(peer,frame),true);
 assert.equal(peer._familyDuet,undefined);
 assert.equal(peer.player._specialFlightT,undefined);
 assert.equal(peer.coopPeerEffects.familyDuet.hero,"dragon");
 advancePeerEffects(peer);
 assert.equal(peer.coopPeerEffects.familyDuet.age,51);
 assert.equal(peer.player.health,100);
 assert.equal(applyPeerEffects(peer,{...frame,frameNo:2,familyDuet:{...frame.familyDuet,hero:"untrusted"}}),false);
 assert.equal(applyPeerEffects(peer,{...frame,frameNo:2,familyDuet:{...frame.familyDuet,evo:20}}),false);
});
globalThis.window=globalThis;globalThis.addEventListener ||=()=>{};
const {useAbility,updateAbilityFx,clearAbilityFx}=await import("../systems/abilities.js");
test("V305: real Dragon U remains flight capable and suppresses blocking film",()=>{
 for(let evo=0;evo<5;evo++){
  clearAbilityFx();
  const g=game(evo),p=g.player,old=[p.x,p.y,p.vx,p.vy],target={x:145,y:196,w:24,h:30,hp:10000,max:10000};
  g.enemies=[target];
  assert.equal(useAbility(g,3),true);
  assert.equal(g.ult.t,0);
  assert.equal(g._familyDuet.hero,"dragon");
  assert.equal(g._assist.heroId,"dino");
  assert.equal(g._familyDuet.evo,evo);
  assert.ok(p._specialFlightT>=210);
  assert.deepEqual([p.x,p.y,p.vx,p.vy],old);
  assert.equal(target.hp,10000,"V325 warning must prevent an invisible cast-frame hit");
  for(let i=0;i<11;i++){g.t++;updateAbilityFx(g);}
  assert.equal(target.hp,10000,"warning must remain safe until tick 12");
  g.t++;updateAbilityFx(g);
  assert.ok(target.hp<10000,"the original Dragon supreme strength must land after warning");
  const after=target.hp;
  for(let i=0;i<80;i++){g.t++;updateAbilityFx(g);}
  assert.equal(target.hp,after,"existing target cannot take duplicate borrowed L damage");
  assert.equal(useAbility(g,3),false,"cooldown still gates U");
 }
 clearAbilityFx();
});
