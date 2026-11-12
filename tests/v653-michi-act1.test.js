import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS,WORLD1_ORDER} from '../systems/world1-rooms.js';
import {CAT_JELLIES_V609} from '../systems/cat-encounters-v609.js';
test('V653 real first Michi act teaches five achievable jumps and illuminates the route',()=>{
 const room=WORLD1_ROOMS['w1-cat'],route=room.catFirstLightRoute;
 assert.equal(route?.length,5);
 const first=CAT_JELLIES_V609[0];assert.equal(first.x,1680);
 for(const [index,p] of route.entries()){
  const [x,y,w,h]=p;
  assert.ok(w>=160&&h>0&&h<=24&&y<1134&&y>900);
  assert.ok(room.plats.some(q=>q.length===4&&q.every((v,i)=>v===p[i])),'solid geometry '+index);
  assert.ok(room.orbs.some(o=>o[0]===x+w/2&&o[1]===y-45),'lit collectible breadcrumb '+index);
  assert.ok(!(room.hazards||[]).some(q=>x<q.x+q.w&&x+w>q.x),'never bridge a pit');
  if(index){const before=route[index-1];
   assert.ok(x-before[0]-before[2]<=130,'short horizontal gap');
   assert.ok(Math.abs(y-before[1])<=55,'short vertical jump');
  }
 }
 const last=route.at(-1);assert.ok(first.x-last[0]-last[2]<=110);
 assert.ok(Math.abs(first.y-last[1])<80);
});
test('V653 does not replace Stitcho or any other chapter geometry',()=>{
 assert.equal(WORLD1_ORDER.length,10);
 for(const hero of WORLD1_ORDER.filter(h=>h!=='cat')){
  const room=WORLD1_ROOMS['w1-'+hero];
  assert.equal(room.catFirstLightRoute,undefined);
  assert.ok(room.plats.length&&room.seal.stations.length);
 }
});
