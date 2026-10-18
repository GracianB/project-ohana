import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOMS} from '../systems/map.js';
import {ROSTER} from '../characters/roster.js';
import {groundGaps,checkpointFor,updateCampaignProgress} from '../systems/campaign-layout.js';
import {hazardTrigger,hazardsForRoom} from '../systems/hazards.js';
import {auditRoomTraversal,simulateJump} from '../systems/jump-audit.js';
import {chargeFinisher,consumeFinisher} from '../systems/finisher.js';
import {packSave,unpackSave} from '../systems/save.js';
import {FAMILY_ISLANDS,islandForHero,pairedScene} from '../systems/family-islands.js';
import {CAMPAIGN_ROLES,campaignRole,updateCampaignEnemy} from '../systems/campaign-enemies.js';
test('V1 expanded campaign and falls use actual collision geometry',()=>{
 for(const r of Object.values(ROOMS)){
  assert.equal(r.sectors.length,r.id==='hub'||r.boss?3:5);
  if(r.id!=='hub'&&!r.boss)assert.ok(r.width>=6000&&r.width<=9000);
  assert.equal(r.hazards.length,groundGaps(r.plats,r.width).length);
  assert.equal(hazardsForRoom(r.id),r.hazards);
  for(const h of r.hazards){const p={x:h.x+h.w/2,w:20,h:30,y:h.y+h.h*.6,vy:10};assert.equal(hazardTrigger(r.id,p)?.id,h.id);assert.equal(hazardTrigger(r.id,{...p,vy:-1}),null);}
  for(const c of r.checkpoints){assert.equal(checkpointFor(r,c.id),c);assert.ok(r.plats.some(p=>p[3]>40&&c.x>=p[0]&&c.x<=p[0]+p[2]&&c.y===p[1]));}
 }
});
test('V1 mandatory drop crossings and ascent ladders pass all eligible hero forms',()=>{
 for(const r of Object.values(ROOMS)){const audit=auditRoomTraversal(r,ROSTER);assert.deepEqual(audit.failures,[],r.id);}
 const baby=ROSTER[0].forms[0];assert.equal(simulateJump(baby,{rise:500}).landed,false);
});
test('V1 checkpoints activate only on safe ground, save once, migrate v2',()=>{
 const r=ROOMS.beach,c=r.checkpoints[2];let saves=0;const g={roomId:r.id,roomDef:r,player:{id:'kilo',x:c.x-10,y:c.y-28,w:20,h:28,grounded:false,evo:2,xp:50},save(){saves++;}};
 updateCampaignProgress(g);assert.equal(g.checkpoints,undefined);g.player.grounded=true;updateCampaignProgress(g);updateCampaignProgress(g);assert.equal(saves,1);
 const raw=packSave(g);assert.equal(raw.v,3);assert.equal(unpackSave(raw).checkpoints.beach,c.id);assert.equal(unpackSave({...raw,v:2,id:'lilo'}).id,'kilo');assert.deepEqual(unpackSave({...raw,checkpoints:{beach:'other-id',evil:'bad'}}).checkpoints,{});
});
test('V1 finisher needs real hits, caps multihits, consumes exactly once',()=>{
 const g={t:0,player:{evo:4}};assert.equal(chargeFinisher(g,0),0);for(let i=0;i<100;i++)chargeFinisher(g,500);assert.equal(g.player.finisherCharge,16);assert.equal(consumeFinisher(g.player),false);
 for(let i=1;i<8;i++){g.t=i*24;g.player._chargeAction=i;chargeFinisher(g,100);}assert.equal(g.player.finisherCharge,100);assert.equal(consumeFinisher(g.player),true);assert.equal(consumeFinisher(g.player),false);
 g.player._finisherActive=true;assert.equal(chargeFinisher(g,200),0);g.player._finisherActive=false;g.player.dead=true;assert.equal(chargeFinisher(g,200),0);
});
test('V1 five bespoke islands give every hero one acting partner',()=>{
 assert.equal(FAMILY_ISLANDS.length,5);assert.equal(new Set(FAMILY_ISLANDS.flatMap(z=>z.heroes)).size,10);
 for(const hero of ROSTER){const z=islandForHero(hero.id);assert.ok(z);for(const partner of z.heroes)assert.ok(pairedScene(partner,hero.id,5));assert.equal(pairedScene(ROSTER.find(r=>!z.heroes.includes(r.id)).id,hero.id,5),null);}
});
test('V1 eight enemy roles warn before attacking and never begin offscreen',()=>{
 const roles=new Set(Array.from({length:8},(_,i)=>campaignRole('beach',i)));assert.deepEqual([...roles].sort(),[...CAMPAIGN_ROLES].sort());
 for(const role of roles){const e={x:100,y:100,w:30,h:30,hp:100,vx:0,vy:0,campaignRole:role,aiAttackPermit:true},g={player:{x:200,y:100,w:30,h:30},cam:{x:2000,y:0},viewW:1000,viewH:720,worldW:7200,worldH:1260,platforms:[{x:0,y:130,w:7200,h:100}],projectiles:[],enemies:[e],fx:{emit(){}}};for(let i=0;i<70;i++)updateCampaignEnemy(e,g,()=>{});assert.equal(g.projectiles.length,0);assert.equal(e._campaign.wind,0);}
});
