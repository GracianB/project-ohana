import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOMS} from '../systems/map.js';
import {enterCampaignExploration,updateCampaignExploration,mechanismForBiome} from '../systems/campaign-exploration.js';
import {startBattleCompanion,duetEcho,updateEvolutionAttacks} from '../systems/evolution-attacks.js';
import {ADVENTURES} from '../systems/room-adventures.js';

function playground(id='beach'){
 const roomDef=ROOMS[id],player={id:'kilo',x:140,y:1000,w:40,h:40,grounded:true,
  facing:1,vy:0,vx:0,jumpPower:12,health:45,maxHealth:80,evo:2};
 return {roomId:id,roomDef,player,t:0,worldW:roomDef.width,worldH:roomDef.height,
  platforms:roomDef.plats.map(([x,y,w,h])=>({x,y,w,h})),enemies:[],secrets:{},
  fx:{emit(){}},nums:{add(){}},save(){this.saveCount=(this.saveCount||0)+1;}};
}
test('V441 all nine outdoor rooms have different gameplay mechanisms and two active sites',()=>{
 const types=[];
 for(const id of ['hub','beach','jungle','cave','lab','ridge','space','reef','volcano']){
  const g=playground(id);enterCampaignExploration(g);
  const def=mechanismForBiome(id);assert.ok(def,id);types.push(def.action);
  assert.equal(g.campaignExploration.mechanisms.length,2,id);
  for(const m of g.campaignExploration.mechanisms)assert.ok(g.platforms.some(p=>p.h>40&&
   m.x>=p.x&&m.x<=p.x+p.w&&Math.abs(m.y-p.y)<1),id);
 }
 assert.equal(new Set(types).size,9);
 assert.equal(mechanismForBiome('boss'),null);
});
test('V441 mechanics activate from real landing, cooldown prevents rapid repeats',()=>{
 const g=playground('jungle');enterCampaignExploration(g);
 const m=g.campaignExploration.mechanisms[0],p=g.player;
 p.x=m.x-p.w/2;p.y=m.y-p.h;p.grounded=true;
 updateCampaignExploration(g);
 assert.equal(m.used,1);assert.ok(p.vy<=-12);assert.equal(p.grounded,false);
 p.grounded=true;p.vy=0;updateCampaignExploration(g);
 assert.equal(m.used,1);assert.ok(m.cd>0);
});
test('V441 secret rewards and shortcuts persist by room with no duplicate reward',()=>{
 const g=playground('beach');enterCampaignExploration(g);
 const b=g.campaignExploration.branches[0],p=g.player;
 p.x=b.x-p.w/2;p.y=b.y-p.h/2;p.grounded=false;
 updateCampaignExploration(g);
 assert.ok(g.secrets.beach.includes(b.id));
 const score=g.score,saves=g.saveCount;
 updateCampaignExploration(g);
 assert.equal(g.score,score);assert.equal(g.saveCount,saves);
 p.x=g.roomDef.width-180;
 updateCampaignExploration(g);
 assert.ok(g.secrets.beach.includes('beach-shortcut'));
 const other=playground('beach');other.secrets=g.secrets;enterCampaignExploration(other);
 updateCampaignExploration(other);
 assert.ok(other.campaignExploration.shortcut);
});
test('V441 exactly five canonical U pair echoes; other partners still support combat',()=>{
 const pairs=[['kilo','stitcho','garden'],['pizza','frita','fryer'],
  ['dragon','dino','quake'],['cat','cuerno','constellation'],['chispin','yomi','thunder']];
 for(const [a,b,mode] of pairs){
  assert.equal(duetEcho(a,b).mode,mode);
  assert.equal(duetEcho(b,a).mode,mode);
 }
 assert.equal(duetEcho('kilo','yomi').mode,'burst');
 const g=playground('hub');g.player._cast={slot:3,t:1};
 g.enemies=[{x:220,y:940,w:32,h:40,hp:100}];g.t=2;
 assert.equal(startBattleCompanion(g,'stitcho',1),true);
 const healed=[];const hit=()=>true,heal=(p,n)=>healed.push(n);
 updateEvolutionAttacks(g,hit,heal);
 assert.equal(g._evolutionAttacks.guest.echoes,0,'casting U alone never consumes a duet echo');
 g.player._cast={slot:0,t:3};g.t=3;
 updateEvolutionAttacks(g,hit,heal);
 assert.equal(g._evolutionAttacks.guest.echoes,1);
 assert.equal(g._evolutionAttacks.guest.supportCd,66);
 assert.ok(g._evolutionAttacks.fields.some(f=>f.noCharge===true&&f.mode==='garden'));
 assert.ok(healed.length>0);
 g.player._cast={slot:1,t:4};g.t=4;
 updateEvolutionAttacks(g,hit,heal);
 assert.equal(g._evolutionAttacks.guest.echoes,1,'duet follow-up is rate-limited');
});
test('V441 optional battle rooms feature at least three different foe species',()=>{
 const battles=Object.values(ADVENTURES).filter(d=>d.kind==='battle');
 assert.equal(battles.length,5);
 for(const def of battles)assert.ok(new Set(def.foes).size>=3,def.name);
});
