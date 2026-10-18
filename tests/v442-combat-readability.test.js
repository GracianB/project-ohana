import test from 'node:test';
import assert from 'node:assert/strict';
import {campaignVolley,updateCampaignEnemy,shieldBlocksHit} from '../systems/campaign-enemies.js';

test('V442 shield blocks only front-facing real hits',()=>{
 const e={campaignRole:'shield',_shieldFacing:1,x:300,y:800,w:48,h:64,hp:60};
 const front={x:400,y:800,w:40,h:60},back={...front,x:180};
 assert.equal(shieldBlocksHit(e,front),true);
 assert.equal(shieldBlocksHit(e,back),false);
 assert.equal(shieldBlocksHit({...e,_shieldFacing:0},front),false);
 assert.equal(shieldBlocksHit({...e,campaignRole:'pursuer'},front),false);
 assert.equal(shieldBlocksHit({...e,hp:0},front),false);
});
test('V442 gunners show and shoot the same saved volley even if target dodges',()=>{
 const e={campaignRole:'gunner',x:100,y:900,w:36,h:38,hp:50,stun:0,sleep:0,aiAttackPermit:true,vx:0,vy:0};
 const p={x:360,y:900,w:36,h:38,vx:2,health:100};
 const g={player:p,cam:{x:0,y:700},viewW:1000,viewH:720,worldW:7200,worldH:1260,
  platforms:[{x:0,y:1134,w:7200,h:126}],projectiles:[],enemies:[e],fx:{emit(){}}};
 e._campaign={age:0,wind:0,cd:1,active:0,aim:1};
 updateCampaignEnemy(e,g,()=>{});
 assert.ok(e._campaign.wind>0);
 const locked=e._campaign.volley.map(v=>({...v}));
 assert.equal(locked.length,3);
 p.x=520;p.vx=-8;
 for(let i=0;i<65;i++)updateCampaignEnemy(e,g,()=>{});
 assert.equal(g.projectiles.length,3);
 for(let i=0;i<3;i++){
  assert.ok(Math.abs(g.projectiles[i].vx-locked[i].vx)<1e-9);
  assert.ok(Math.abs(g.projectiles[i].vy-locked[i].vy)<1e-9);
 }
});
test('V442 warning angle is finite for vertical and predictive shots',()=>{
 const e={x:200,y:500,w:42,h:50};
 for(const role of ['shooter','gunner'])for(const vx of [-10,0,10]){
  const p={x:200,y:100,w:40,h:40,vx};
  const shots=campaignVolley(role,e,p);
  assert.ok(shots.every(b=>Number.isFinite(b.vx)&&Number.isFinite(b.vy)));
  assert.ok(shots.every(b=>Math.hypot(b.vx,b.vy)>=4.9));
 }
});
