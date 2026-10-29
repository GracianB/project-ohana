import test from 'node:test';
import assert from 'node:assert/strict';
import {mirrorPortraitLayout,FINAL_PORTALS} from '../systems/final-portal-mirrors.js';
import {createFamilyActor,drawFamilyActor} from '../systems/family-actor.js';
import {WORLD1_ROOMS,WORLD1_ORDER} from '../systems/world1-rooms.js';
import {findRoster} from '../characters/roster.js';

test('wide wings and tall ears fit completely inside the mirror ellipse',()=>{
 for(const bounds of[
  {left:-120,right:100,top:-70,bottom:8},{left:-25,right:35,top:-180,bottom:2},
  {left:-80,right:150,top:-130,bottom:12},{left:5,right:70,top:-90,bottom:-5}
 ])for(const [rx,ry]of[[108,132],[24,35],[70,110]]){
  const fit=mirrorPortraitLayout(Object.freeze(bounds),rx,ry),b=fit.painted;
  assert.ok(fit.scale>0);
  for(const x of[b.x,b.x+b.w])for(const y of[b.y,b.y+b.h])assert.ok((x/rx)**2+(y/ry)**2<1,'complete silhouette fits, not only its feet');
  assert.ok(Math.abs(b.w/b.h-(bounds.right-bounds.left)/(bounds.bottom-bounds.top))<1e-8,'anatomical proportions survive the fit');
 }
});
test('malformed mirror measurements remain finite and drawable',()=>{
 for(const bounds of[null,{}, {left:NaN,right:Infinity,top:-Infinity,bottom:NaN},{left:5,right:-1,top:8,bottom:2}]){
  const f=mirrorPortraitLayout(bounds,NaN,Infinity);
  assert.ok([f.scale,f.x,f.y,...Object.values(f.painted)].every(Number.isFinite));
  assert.ok(f.scale>0&&f.painted.w>0&&f.painted.h>0);
 }
});
test('all ten mirrors align with their named plinths and keep collectibles away from faces',()=>{
 const room=WORLD1_ROOMS['w1-final'];assert.deepEqual(FINAL_PORTALS.map(p=>p.hero),WORLD1_ORDER);
 for(const [i,p]of FINAL_PORTALS.entries()){
  assert.equal(p.x,room.statues[i].x);assert.ok(p.y+p.ry<=room.statues[i].y-62);
  for(const orb of room.orbs)assert.ok(((orb[0]-p.x)/p.rx)**2+((orb[1]-p.y)/p.ry)**2>1.2,'XP crystals do not overlap a face or coat');
 }
});
test('decorative actors use canonical forms without modifying the playable roster',()=>{
 for(const hero of WORLD1_ORDER){
  const def=findRoster(hero),before=JSON.stringify(def),a=createFamilyActor(hero,{form:1,pose:'victory'});
  assert.equal(a.id,hero);assert.equal(a.evo,1);assert.equal(a.w,def.forms[1].w);assert.equal(a.h,def.forms[1].h);
  assert.equal(a._introForceCanvas,true);assert.equal(a._poseOverride,'victory');a.health=0;
  assert.equal(JSON.stringify(def),before);
 }
 const ctx=new Proxy({},{get(){throw Error('unknown hero must not draw a fake figure');}});
 assert.equal(drawFamilyActor(ctx,'missing',0,0),false);
});
