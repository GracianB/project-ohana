import {updateCampaignEnemy} from '../systems/campaign-enemies.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {WORLD1_ORDER,WORLD1_ROOMS,WORLD1_FLOOR} from '../systems/world1-rooms.js';
import {enterCampaignExploration,updateCampaignExploration} from '../systems/campaign-exploration.js';
test('ten authored rooms have distinct materials, continuous recoverable terrain and an unchanged boss floor',()=>{
 const materials=new Set();
 for(const hero of WORLD1_ORDER){const r=WORLD1_ROOMS['w1-'+hero];assert.ok(r.composition);materials.add(r.composition.material);assert.ok(r.terraces.length>=2,hero+' needs meaningful relief');
  const floors=r.plats.filter(p=>p[3]>40).sort((a,b)=>a[0]-b[0]);assert.ok(floors.length>=1,hero+' has floor segments');for(const p of floors)assert.ok(WORLD1_FLOOR-p[1]<=160,"banks must remain within the late-form physical jump envelope");
  for(const px of (hero==='kilo'?[12600,13280,14099]:[8260,8750,9320]))assert.equal(floors.find(p=>px>=p[0]&&px<p[0]+p[2])[1],1134);
  for(const s of r.seal.stations){const floor=floors.find(p=>s.x>=p[0]&&s.x<p[0]+p[2]);if(floor)assert.equal(floor[1],1134,hero+' objective floor stays reachable');}
 }
 assert.equal(materials.size,10);
});
test('authored exploration adds no surprise platforms and uses persistent existing nook IDs',()=>{
 for(const hero of WORLD1_ORDER){const r=WORLD1_ROOMS['w1-'+hero],g={roomDef:r,platforms:r.plats.map(p=>({x:p[0],y:p[1],w:p[2],h:p[3]})),player:{x:0,y:1090,w:40,h:44,xp:0},secrets:{[r.id]:[r.id+'-secret-0']}};const before=g.platforms.length;enterCampaignExploration(g);updateCampaignExploration(g);assert.equal(g.platforms.length,before);assert.ok(g.campaignExploration.branches.some(b=>b.found));assert.ok(r.nooks.length>=1);}
});
test('authored ground enemies and XP are placed above the actual banks',()=>{
 for(const hero of WORLD1_ORDER){const r=WORLD1_ROOMS['w1-'+hero];for(const f of r.foes)if(f[4]?.anchorFloor){assert.ok(Number.isFinite(f[4].anchorFloor));}
  for(const o of r.orbs){const tr=r.terraces.find(t=>o[0]>=t.x&&o[0]<t.x+t.w);if(tr)assert.ok(o[1]<tr.y-18,hero+' XP must not be buried');}
 }
});

test('ground enemies stop and hop at real banks rather than walking through them',()=>{
 const e={x:70,y:1104,w:25,h:30,hp:100,vx:0,vy:0,grounded:true,campaignRole:'pursuer',stun:0,invuln:0},g={player:{x:600,y:1094,w:40,h:40,vx:0},roomDef:{composition:{}},cam:{x:0,y:400},viewW:1000,viewH:800,worldW:1200,worldH:1260,enemies:[e],projectiles:[],platforms:[{x:0,y:1134,w:100,h:126},{x:100,y:1070,w:80,h:190},{x:180,y:1134,w:1020,h:126}]};
 for(let i=0;i<100;i++){updateCampaignEnemy(e,g,()=>{});if(e.x+e.w>100&&e.x<180)assert.ok(e.y+e.h<=1072,'cannot be buried inside the bank');assert.ok(e.hp>0);}
 assert.ok(e.x>180,'a short hop allows pursuit to continue');
});

test('an enemy that grows on the floor keeps its feet planted instead of warping through a bank',()=>{
 const r=WORLD1_ROOMS['w1-kilo'],e={x:700,y:1104,w:25,h:30,hp:100,vx:0,vy:0,grounded:true,campaignRole:'pursuer',stun:0,invuln:0},g={roomDef:r,player:{x:900,y:1094,w:40,h:40,vx:0},cam:{x:0,y:400},viewW:1000,viewH:800,worldW:9600,worldH:1260,enemies:[e],projectiles:[],platforms:r.plats.map(p=>({x:p[0],y:p[1],w:p[2],h:p[3]}))};
 e.h+=6;e.w+=10;updateCampaignEnemy(e,g,()=>{});assert.ok(e.x>=700&&e.x<720);assert.equal(e.y+e.h,1134);assert.equal(e.grounded,true);
});
