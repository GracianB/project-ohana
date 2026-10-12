import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {ROSTER} from "../characters/roster.js";
import {
 optionsForUPartner,chooseUPartner,sanitizeUBonds,combineUBonds,
 readStoredUBonds,persistUBonds,switchUPartner,gainUExp,gainUBondHit,
 bondXP,uBondProgress,uExpRank,U_BONDS_STORAGE
} from "../systems/u-partners.js";
import {packSave,unpackSave} from "../systems/save.js";
import {DUET_ORIGINS,duetChemistry,duetHitOptions,applyDuetChemistry,drawDuetChemistry}
 from "../systems/u-duet-chemistry.js";
import {startFamilyDuet,updateFamilyDuet,readFamilyDuet,
 drawFamilyDuet,familyDuetChoreography} from "../systems/family-duets.js";
import {capturePeerEffects,applyPeerEffects} from "../systems/coop-peer-effects.js";

const HEROES=ROSTER.map(p=>p.id);
function game(hero,evo=4){
 const def=ROSTER.find(p=>p.id===hero),form=def.forms[evo];
 const p={...def,...form,id:hero,evo,x:100,y:200,w:24,h:34,health:100,
  maxHealth:120,vx:2,vy:-1,facing:1,dead:false,invuln:0,cds:{},cdDur:{},uExp:0};
 return {player:p,roomId:"hub",enemies:[],platforms:[],projectiles:[],slashes:[],
  bolts:[],ghosts:[],t:0,fx:{emit(){}},nums:{add(){}},worldW:1200,worldH:900};
}
function mockCtx(){
 const saved=[],calls=[],props={globalAlpha:1};
 return {calls,ctx:new Proxy(props,{get(obj,key){
  if(key==="save")return()=>{saved.push({...obj});calls.push(["save"])};
  if(key==="restore")return()=>{Object.assign(obj,saved.pop());calls.push(["restore"])};
  if(key in obj)return obj[key];
  return(...args)=>{calls.push([key,...args])};
 },set(o,k,v){o[k]=v;return true;}})};
}
test("V314: 90 different hero+ally recipes, ten heroic signatures and rank-scaled bonds",()=>{
 assert.equal(Object.keys(DUET_ORIGINS).length,10);
 const combinations=new Set(),names=new Set();
 for(const hero of HEROES)for(const buddy of optionsForUPartner(hero)){
  for(let rank=1;rank<=3;rank++){
   const chem=duetChemistry(hero,buddy.id,rank);
   assert.equal(chem.key,hero+":"+buddy.id);
   assert.equal(chem.ally,buddy.id);
   assert.equal(chem.hero,hero);
   assert.equal(chem.rank,rank);
   assert.ok(chem.name.includes(buddy.lName));
   assert.equal(chem.shape,DUET_ORIGINS[hero].shape);
   assert.ok(chem.heroColor.startsWith("#")&&chem.allyColor.startsWith("#"));
   assert.equal(chem.crests,rank===3?5:rank===2?4:3);
   assert.equal(chem.rhythm>=1&&chem.rhythm<=5,true);
   assert.ok(Object.isFrozen(chem));
   const signature=rank+":"+chem.key;
   assert.ok(!combinations.has(signature));combinations.add(signature);
  }
  names.add(duetChemistry(hero,buddy.id,1).name);
 }
 assert.equal(combinations.size,270);
 assert.equal(names.size,90);
 assert.equal(duetChemistry("kilo","kilo"),null);
 assert.equal(duetChemistry("intruder","cat"),null);
});
test("V314: all 90 pair bonds start independent and switching never gifts XP to another ally",()=>{
 for(const hero of HEROES){
  const [a,b]=optionsForUPartner(hero).slice(0,2),p={id:hero,uExp:0};
  assert.equal(switchUPartner(p,a.id),true);
  for(let i=0;i<6;i++)gainUExp(p,3);
  assert.equal(bondXP(p,a.id),72);
  assert.equal(uBondProgress(p,a.id).rank,2);
  assert.equal(switchUPartner(p,b.id),true);
  assert.equal(p.uExp,0);
  assert.equal(bondXP(p,a.id),72);
  assert.equal(gainUExp(p,0),3);
  assert.equal(bondXP(p,b.id),3);
  assert.equal(bondXP(p,a.id),72);
  assert.equal(switchUPartner(p,a.id),true);
  assert.equal(p.uExp,72);
  assert.equal(gainUBondHit(p,4),4);
  assert.equal(bondXP(p,a.id),76);
  assert.equal(bondXP(p,b.id),3);
  assert.equal(switchUPartner(p,"intruder"),false);
  assert.equal(p.uPartner,a.id);
 }
});
test("V314: profile persistence across sessions, clamped JSON, and no inherited property trickery",()=>{
 const memory=new Map();
 const storage={getItem:key=>memory.get(key)||null,setItem:(k,v)=>memory.set(k,v)};
 for(const hero of HEROES){
  const partner=optionsForUPartner(hero)[0].id;
  assert.equal(persistUBonds(storage,hero,{[partner]:92}),true);
  assert.equal(readStoredUBonds(storage,hero)[partner],92);
 }
 const before=JSON.parse(memory.get(U_BONDS_STORAGE));
 assert.equal(Object.keys(before).length,10);
 assert.equal(persistUBonds(storage,"kilo",{stitcho:5,other:99999,cat:Infinity}),true);
 assert.equal(readStoredUBonds(storage,"kilo").stitcho,92,"XP must be monotonic");
 assert.equal(readStoredUBonds(storage,"kilo").other,undefined);
 assert.equal(sanitizeUBonds("kilo",{"__proto__":{evil:true},stitcho:20000}).stitcho,200);
 assert.equal(combineUBonds("kilo",{stitcho:25,cat:40},{stitcho:90,cat:3}).stitcho,90);
 assert.equal(readStoredUBonds({getItem(){return "{"}},"kilo").stitcho,undefined);
});
test("V314: saved v2 files retain per-partner progression, and legacy scalar XP migration is explicit",()=>{
 const g=game("dragon");
 const one=optionsForUPartner("dragon")[0].id;
 g.player.uPartner=one;
 g.player.uBonds={[one]:101,cat:39};
 g.player.uExp=101;
 const raw=packSave(g),restored=unpackSave(raw,"dragon");
 assert.equal(raw.v,2);
 assert.equal(restored.uBonds[one],101);
 assert.equal(restored.uBonds.cat,39);
 assert.equal(restored.uExp,101);
 assert.equal(unpackSave({...raw,uBonds:{cat:1e9,dragon:200,invalid:88}},"dragon").uBonds.cat,200);
 const legacy=unpackSave({...raw,uBonds:undefined,uExp:67},"dragon");
 assert.equal(Object.keys(legacy.uBonds).length,0);
 assert.equal(combineUBonds("dragon",legacy.uBonds,{[one]:legacy.uExp})[one],67);
});
test("V314: 90 selected duets x 5 forms x 3 levels have distinct visual co-signatures, reduce-motion invariant",()=>{
 let frames=0;
 for(const hero of HEROES)for(const buddy of optionsForUPartner(hero)){
  for(let evo=0;evo<5;evo++)for(let rank=1;rank<=3;rank++){
   const g=game(hero,evo);g.player.uPartner=buddy.id;
   g.player.uBonds={[buddy.id]:rank===3?140:rank===2?45:0};
   g.player.uExp=bondXP(g.player);
   assert.equal(startFamilyDuet(g,1,[],buddy.id),true);
   const s=g._familyDuet;
   assert.equal(s.bondRank||1,rank);
   s.age=54;
   const frame=readFamilyDuet(s);
   assert.equal(frame.bondRank||1,rank);
   assert.equal(familyDuetChoreography(frame).bondRank,rank);
   const a=mockCtx(),b=mockCtx();
   assert.equal(drawDuetChemistry(a.ctx,frame,{x:0,y:0},8,true),true);
   assert.equal(drawDuetChemistry(b.ctx,frame,{x:0,y:0},999,true),true);
   assert.deepEqual(a.calls,b.calls,"reduced motion must not oscillate with time");
   assert.equal(a.calls.filter(c=>c[0]==="save").length,a.calls.filter(c=>c[0]==="restore").length);
   assert.equal(a.ctx.globalAlpha,1);
   const full=mockCtx();
   assert.equal(drawFamilyDuet(full.ctx,frame,{x:0,y:0},56,()=>{},ROSTER,true),true);
   assert.equal(full.ctx.globalAlpha,1);
   const remote=game(hero,evo);
   const packet=capturePeerEffects(g,1,"v314");
   assert.equal(packet.familyDuet.bondRank||1,rank);
   assert.equal(packet.familyDuet.power,undefined);
   assert.equal(packet.familyDuet.legacyTargets,undefined);
   assert.equal(applyPeerEffects(remote,packet),true);
   assert.equal(remote._familyDuet,undefined);
   assert.equal(readFamilyDuet({...frame,bondRank:0}),null);
   assert.equal(readFamilyDuet({...frame,bondRank:4}),null);
   assert.equal(readFamilyDuet({...frame,bondRank:"3"}),null);
   frames++;
  }
 }
 assert.equal(frames,1350);
});
test("V314: hero-level perks apply only to actual L hits, never to replica, hitbox, or level 1",()=>{
 for(const hero of HEROES){
  const buddy=optionsForUPartner(hero)[0],chem1=duetChemistry(hero,buddy.id,1),
   chem3=duetChemistry(hero,buddy.id,3);
  const p={health:30,maxHealth:100},calls=[];
  const before=JSON.stringify(p);
  assert.equal(applyDuetChemistry(p,chem1,2,()=>{}),false);
  assert.equal(applyDuetChemistry(p,chem3,0,()=>{}),false);
  assert.equal(JSON.stringify(p),before);
  assert.equal(applyDuetChemistry(p,chem3,1,(_p,amount)=>calls.push(amount)),true);
  assert.ok(calls.length===0||hero==="kilo");
  const opts=duetHitOptions(chem3,-1,32);
  assert.ok(opts.kx<0);
  assert.ok(opts.stun>=32&&opts.stun<=52);
 }
 for(const hero of HEROES){
  const g=game(hero),buddy=optionsForUPartner(hero).find(x=>x.borrowedL!=="ohana");
  g.player.uPartner=buddy.id;
  g.player.uBonds={[buddy.id]:150};g.player.uExp=150;
  const near={x:145,y:190,w:24,h:24,hp:1000},far={x:1200,y:100,w:24,h:24,hp:1000};
  g.enemies=[near,far];
  const original=[g.player.x,g.player.y,g.player.vx,g.player.vy];
  startFamilyDuet(g,1,[],buddy.id);
  const strikes=[];
  for(let age=0;age<=120;age++)updateFamilyDuet(g,(_g,e,damage)=>{
   e.hp-=damage;strikes.push([age,e,damage]);return true;
  },()=>{});
  assert.equal(g._familyDuet,null);
  assert.ok(strikes.length<=3&&strikes.every(([age,e,n])=>[42,66,90].includes(age)&&e===near&&n>0));
  assert.equal(far.hp,1000);
  assert.deepEqual([g.player.x,g.player.y,g.player.vx,g.player.vy],original);
  assert.ok(bondXP(g.player,buddy.id)>=150);
 }
});
test("V314: real menu, HUD, 3 ranked strengths, and save wiring are not decorative",()=>{
 const gameSource=fs.readFileSync("game.js","utf8");
 const menu=fs.readFileSync("index.html","utf8");
 const abilities=fs.readFileSync("systems/abilities.js","utf8");
 assert.match(menu,/id="u-partner-portrait"/);
 assert.match(menu,/id="u-exp-fill"/);
 assert.match(gameSource,/readStoredUBonds\(localStorage,def\.id\)/);
 assert.match(gameSource,/switchUPartner\(game\.player,ally\)/);
 assert.match(gameSource,/const legacy=\(u\.uExp>0/);
 assert.match(gameSource,/drawCharacter\(ctx,\{\.\.\.def,\.\.\.form,id:selected/);
 assert.match(abilities,/persistUBonds\(globalThis\.localStorage,p\.id,p\.uBonds\)/);
});
