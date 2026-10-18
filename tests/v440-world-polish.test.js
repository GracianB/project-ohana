import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOMS} from '../systems/map.js';
import {localMapView} from '../systems/local-map.js';
import {companionGoal} from '../systems/evolution-attacks.js';
import {campaignVolley} from '../systems/campaign-enemies.js';
import {directEnemyEncounter} from '../systems/enemy-director.js';

test('V440 campaign sectors vary their platforms and preserve ground routes',()=>{
 const r=ROOMS.beach;
 assert.equal(r.sectors.length,5);
 const counts=r.sectors.slice(3).map(s=>r.plats.filter(p=>p[3]<=40&&p[0]>=s.x&&p[0]<s.x+s.w).length);
 assert.ok(counts[0]!==counts[1], 'late sectors must not repeat the same ledge lattice');
 assert.ok(counts.every(n=>n>=1&&n<=5), 'later sectors should have breathing space');
 assert.ok(r.plats.some(p=>p[3]>40&&p[0]<6200&&p[0]+p[2]>=6900));
});
test('V440 local chart follows player without compressing the entire world',()=>{
 const r=ROOMS.beach,g={roomDef:r,player:{x:6000,y:1050,w:38,h:56},explored:{beach:[r.sectors[4].id]}};
 const desk=localMapView(g,1280),phone=localMapView(g,390);
 assert.ok(desk.start>0&&desk.end<=r.width);
 assert.equal(desk.span,2000);
 assert.equal(phone.span,1360);
 assert.ok(phone.start<=g.player.x+g.player.w/2);
 assert.ok(phone.end>=g.player.x+g.player.w/2);
 assert.equal(desk.sector.id,r.sectors[4].id);
 assert.ok(desk.progress>.75&&desk.progress<1);
 assert.equal(localMapView({}),null);
});
test('V440 U ally follows hero when quiet, intercepts targets and respects reduced motion',()=>{
 const hero={x:200,y:900,w:38,h:55,facing:1},ally={x:130,y:950};
 const calm=companionGoal(ally,hero,null,0,true);
 assert.equal(calm.engaged,false);
 assert.ok(calm.x<hero.x);
 assert.equal(calm.y,hero.y+hero.h);
 const enemy={x:550,y:850,w:50,h:70};
 const hunt=companionGoal(ally,hero,enemy,25,false);
 assert.equal(hunt.engaged,true);
 assert.ok(hunt.x>hero.x+hero.w);
 assert.equal(hunt.y,enemy.y+enemy.h-10);
 const flipped=companionGoal(ally,{...hero,facing:-1},null,0,true);
 assert.ok(flipped.x>hero.x+hero.w);
});
test('V440 shooter and gunner use different deterministic telegraphed volleys',()=>{
 const foe={x:100,y:200,w:40,h:40},hero={x:400,y:150,w:30,h:50,vx:3};
 const aimed=campaignVolley('shooter',foe,hero),fan=campaignVolley('gunner',foe,hero);
 assert.equal(aimed.length,1);
 assert.equal(fan.length,3);
 assert.ok(aimed[0].vx>0);
 assert.ok(fan[0].vy<fan[1].vy&&fan[1].vy<fan[2].vy);
 for(const bolt of [...aimed,...fan])assert.ok(Number.isFinite(bolt.vx)&&Number.isFinite(bolt.vy));
});
test('V440 late zones coordinate three telegraphed threats without overwhelming the hub',()=>{
 const foes=Array.from({length:4},(_,i)=>({kind:'cucaracho',spawnIndex:i,x:160+i*90,y:920,w:35,h:35,hp:40,max:40,aggro:60}));
 const player={x:330,y:920,w:40,h:48};
 assert.equal(directEnemyEncounter(foes,player,'hub',200).budget,1);
 assert.equal(directEnemyEncounter(foes,player,'lab',200).budget,3);
});
