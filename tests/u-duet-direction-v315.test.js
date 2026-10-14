import test from "node:test";
import assert from "node:assert/strict";
import {ROSTER} from "../characters/roster.js";
import {optionsForUPartner} from "../systems/u-partners.js";
import {familyDuetDefinition,readFamilyDuet,familyDuetPose,familyDuetStrike,
 startFamilyDuet,updateFamilyDuet,drawFamilyDuet} from "../systems/family-duets.js";
import {GUEST_ACTING,borrowedLFootprint,borrowedLContains,
 guestPerformance,drawBorrowedLWarnings} from "../systems/u-duet-direction-v315.js";
import {capturePeerEffects,applyPeerEffects,advancePeerEffects} from "../systems/coop-peer-effects.js";

const HEROES=ROSTER.map(x=>x.id);
const BEATS=[42,66,90];
const mock=()=>{
 const calls=[],stack=[],o={globalAlpha:.8};
 const ctx=new Proxy(o,{
  get(ob,key){
   if(key==="save")return()=>{stack.push({...ob});calls.push(["save"])};
   if(key==="restore")return()=>{Object.assign(ob,stack.pop());calls.push(["restore"])};
   if(key in ob)return ob[key];
   return(...args)=>{calls.push([key,...args])};
  },set(ob,key,value){ob[key]=value;return true;}
 });
 return {ctx,calls};
};
const game=(id,evo)=>{
 const def=ROSTER.find(r=>r.id===id),p={...def,...def.forms[evo],
  id,evo,x:100,y:200,w:24,h:34,health:100,maxHealth:100,
  facing:1,vx:0,vy:0,dead:false,cds:{},cdDur:{}};
 return {player:p,roomId:"hub",enemies:[],projectiles:[],platforms:[],
  fx:{emit(){}},nums:{add(){}},slashes:[],bolts:[],t:0};
};
function legacy(kind,s,beat,e){
 const p={x:e.x+(e.w||0)/2,y:e.y+(e.h||0)/2};
 const f=s.facing,dx=p.x-s.x,dy=p.y-s.y,b=beat,ev=s.evo;
 switch(kind){
  case "chaos":return Math.hypot(dx,dy+26)<=140+ev*12;
  case "storm":return Math.abs(dx-f*(45+b*43))<=52+ev*6&&Math.abs(dy+45)<=120;
  case "tails":return Math.hypot(dx,dy+25)<=105+ev*13;
  case "meteor":return Math.hypot(dx-f*(55+b*46),dy+22)<=60+ev*5;
  case "quake":return Math.abs(p.x-(s.x+f*(52+b*54)))<=66+ev*7&&Math.abs(p.y-(s.y-24))<=65+ev*3;
  case "geyser":return Math.abs(p.x-(s.x+f*(34+b*54)))<=31+ev*3&&p.y>s.y-163&&p.y<s.y+27;
  case "oven":return dx*f>=-24&&dx*f<=210+ev*15&&Math.abs(dy+18)<54+b*19;
  case "maw":return Math.abs(p.x-(s.x+f*(58+b*21)))<=65+ev*5&&Math.abs(dy+38)<=60;
  case "rainbow":{const r=70+b*40+ev*8,d=Math.hypot(dx,dy+24);return d<=r&&d>=Math.max(0,r-85)}
  case "ohana":return Math.hypot(dx,dy+30)<=155+ev*15;
 }
 return false;
}
test("V315 · Ten guest identities are authored and visibly distinguishable",()=>{
 assert.deepEqual(Object.keys(GUEST_ACTING).sort(),HEROES.slice().sort());
 assert.equal(new Set(Object.values(GUEST_ACTING).map(v=>v.style)).size,10);
 for(const [id,actor]of Object.entries(GUEST_ACTING)){
  assert.ok(Object.isFrozen(actor),id);
  assert.ok(actor.gesture.length>=3);
 }
});
test("V315 · All 90 duets x 5 forms x 3 beats share exact warning and real damage footprints",()=>{
 let pairs=0,areas=0,points=0;
 for(const hero of HEROES)for(const buddy of optionsForUPartner(hero)){
  pairs++;
  for(let evo=0;evo<5;evo++)for(const facing of [-1,1]){
   const def=familyDuetDefinition({hero,ally:buddy.id});
   const state={hero,ally:buddy.id,x:890,y:445,age:42,evo,facing};
   for(let b=0;b<3;b++){
    const area=borrowedLFootprint(def.kind,state,b);
    assert.ok(area,hero+"/"+buddy.id+"/"+evo+"/"+b);
    assert.ok(Object.isFrozen(area));
    for(let x=-220;x<=220;x+=23)for(let y=-230;y<=230;y+=23){
     const entity={x:state.x+x-6,y:state.y+y-5,w:12,h:10,hp:100};
     const expected=legacy(def.kind,state,b,entity);
     assert.equal(borrowedLContains(area,entity),expected,hero+"/"+buddy.id+"/"+evo+"/"+b+" "+x+","+y);
     assert.equal(familyDuetStrike(state,b,entity),expected);
     points++;
    }
    areas++;
   }
  }
 }
 assert.equal(pairs,90);
 assert.equal(areas,2700);
 assert.ok(points>1e6);
});
test("V315 · Ten guests have independent enter/attack/farewell poses, all ranks and five forms",()=>{
 const poses=new Set();let checked=0;
 for(const hero of HEROES)for(const buddy of optionsForUPartner(hero))
 for(let evo=0;evo<5;evo++)for(let rank=1;rank<=3;rank++){
  for(const age of [0,7,18,26,36,42,58,66,90,106,119]){
   const s={hero,ally:buddy.id,x:100,y:234,age,evo,facing:1,bondRank:rank};
   const a=guestPerformance(s,buddy.id),b=guestPerformance(s,buddy.id,true);
   assert.ok(a&&b);
   assert.equal(a.style,GUEST_ACTING[buddy.id].style);
   assert.equal(a.rank,rank);
   assert.equal(a.pose,age>=106?(GUEST_ACTING[buddy.id].height>=40?"glide":"run"):age===42||age===66||age===90?"attack":a.pose);
   assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y));
   assert.ok(a.x<s.x+380&&a.x>s.x-260);
   assert.ok(a.visualScale>=.59&&a.visualScale<.85);
   assert.equal(a.facing,1,"friend approaches facing the correct direction");
   if(age===42)poses.add(buddy.id+":"+a.gesture);
   assert.equal(b.gesture,a.gesture);
   assert.equal(guestPerformance(s,buddy.id,true).x,b.x);
   checked++;
  }
 }
 assert.equal(poses.size,10);
 assert.equal(checked,14850);
});
test("V315 · Reduced-motion warning contours do not animate with external time, and restore Canvas",()=>{
 let total=0;
 for(const hero of HEROES)for(const buddy of optionsForUPartner(hero)){
  const def=familyDuetDefinition({hero,ally:buddy.id});
  const s={hero,ally:buddy.id,x:235,y:401,evo:2,age:37,facing:1,bondRank:2};
  const render=t=>{
   const c=mock(),old=JSON.stringify(s);
   assert.equal(drawBorrowedLWarnings(c.ctx,def.kind,s,{x:10,y:22},t,true),true);
   assert.equal(c.ctx.globalAlpha,.8);
   assert.deepEqual(s,JSON.parse(old));
   assert.equal(c.calls.filter(c=>c[0]==="save").length,c.calls.filter(c=>c[0]==="restore").length);
   return c.calls;
  };
  assert.deepEqual(render(9),render(10009));
  const shapes=render(33);
  assert.ok(shapes.some(c=>c[0]==="arc"||c[0]==="rect"),hero+"/"+buddy.id);
  assert.equal(drawBorrowedLWarnings(mock().ctx,def.kind,{...s,age:10},{x:0,y:0}),false);
  total++;
 }
 assert.equal(total,90);
});
test("V315 · Guest is actually rendered in-world, properly animated and network safe for all heroes",()=>{
 let scenes=0;
 for(const hero of HEROES)for(const buddy of optionsForUPartner(hero))
 for(let evo=0;evo<5;evo++){
  const g=game(hero,evo),peer=game(hero,evo);
  assert.equal(startFamilyDuet(g,1,[],buddy.id),true);
  for(const age of [4,27,42,66,90,110]){
   const s={...g._familyDuet,age};
   const view=readFamilyDuet(s),pose=familyDuetPose(view,true);
   const actor=guestPerformance(view,buddy.id,true);
   assert.equal(pose.allyX,actor.x);
   assert.equal(pose.allyY,actor.y);
   let actorDrawn=null;
   const m=mock();
   assert.equal(drawFamilyDuet(m.ctx,view,{x:0,y:0},age,
     (_,friend)=>{actorDrawn=friend;},ROSTER,true),true);
   assert.equal(actorDrawn.id,buddy.id);
   assert.equal(actorDrawn.facing,actor.facing);
   assert.equal(actorDrawn._poseOverride,actor.pose);
   assert.equal(actorDrawn.visualScale,actor.visualScale);
   assert.equal(actorDrawn.x+actorDrawn.w/2,actor.x);
   assert.equal(m.ctx.globalAlpha,.8);
   scenes++;
  }
  g._familyDuet.age=43;
  const frame=capturePeerEffects(g,1,"v315");
  assert.equal(frame.familyDuet.room,undefined);
  assert.equal(frame.familyDuet.power,undefined);
  assert.equal(applyPeerEffects(peer,frame),true);
  assert.equal(peer._familyDuet,undefined);
  advancePeerEffects(peer);
  assert.equal(peer.coopPeerEffects.familyDuet.age,44);
 }
 assert.equal(scenes,2700);
});
test("V315 · Existing legacy hit timings, controls, and safety cancellations remain intact",()=>{
 for(const hero of HEROES)for(const buddy of optionsForUPartner(hero)){
  const g=game(hero,4),near={x:145,y:190,w:24,h:24,hp:10000},
   far={x:1200,y:190,w:24,h:24,hp:10000};
  const old=[g.player.x,g.player.y,g.player.vx,g.player.vy];
  g.enemies=[near,far];startFamilyDuet(g,1,[near],buddy.id);
  const hits=[];
  for(let t=0;t<121;t++)updateFamilyDuet(g,(_,e,n)=>{hits.push([t,e,n]);return true;},()=>{});
  assert.equal(hits.length,0,"never damage prehit legacy target or far target");
  assert.deepEqual([g.player.x,g.player.y,g.player.vx,g.player.vy],old);
  assert.equal(g._familyDuet,null);
 }
});
