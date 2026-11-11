import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {michiPulseSnapshot,planMichiPulseLedges,syncMichiPulse} from '../worlds/ohana-pulse.js';
function fixture(done=[],hero='cat'){
 const room=WORLD1_ROOMS['w1-'+hero];
 return {roomDef:room,world1:{room:room.id,
  stations:room.seal.stations.map(s=>({...s,done:done.includes(s.id)}))},
  platforms:room.plats.map(p=>({x:p[0],y:p[1],w:p[2],h:p[3]})),
  worldW:room.width,viewW:1280,viewH:720,score:0,world1Seals:[]};
}
test('no jelly rescued means no Pulso or collision changes',()=>{
 const g=fixture(),n=g.platforms.length;
 assert.equal(syncMichiPulse(g).state,'normal');
 assert.equal(g.platforms.length,n);
});
test('rescuing first jelly creates finite collision-backed walkable ledges',()=>{
 const g=fixture([0]),initial=g.platforms.length;
 const state=syncMichiPulse(g),ledges=g.platforms.filter(p=>p._ohanaPulse);
 assert.equal(state.level,1);
 assert.ok(ledges.length>=1&&ledges.length<=2);
 assert.equal(g.platforms.length,initial+ledges.length);
 for(const p of ledges){
  assert.ok([p.x,p.y,p.w,p.h].every(Number.isFinite));
  assert.ok(p.w>=100&&p.h>=16&&p.x>=0&&p.x+p.w<=g.worldW);
 }
 assert.equal(new Set(ledges.map(p=>p._ohanaPulse)).size,ledges.length);
 assert.deepEqual(syncMichiPulse(g),state,'idempotent on each physics frame');
 assert.equal(g.score,0);assert.deepEqual(g.world1Seals,[]);
});
test('new jellies extend geometry but never duplicate its previous paths',()=>{
 const g=fixture([0]);syncMichiPulse(g);
 const older=g.platforms.filter(p=>p._ohanaPulse).map(p=>p._ohanaPulse);
 g.world1.stations.find(s=>s.id===1).done=true;
 const next=syncMichiPulse(g),ids=g.platforms.filter(p=>p._ohanaPulse).map(p=>p._ohanaPulse);
 assert.equal(next.level,2);assert.ok(ids.length>older.length);
 for(const x of older)assert.ok(ids.includes(x));
 assert.equal(new Set(ids).size,ids.length);
});
test('saved 636 stations restore identical geometry across room reload',()=>{
 const old=fixture([0,1,2,3]);const planned=planMichiPulseLedges(old);
 syncMichiPulse(old);const reloaded=fixture([0,1,2,3]);syncMichiPulse(reloaded);
 const geometry=g=>g.platforms.filter(p=>p._ohanaPulse).map(p=>[p.x,p.y,p.w,p.h,p._ohanaPulse]);
 assert.deepEqual(geometry(reloaded),geometry(old));
 assert.deepEqual(geometry(old),planned.map(p=>[p.x,p.y,p.w,p.h,p._ohanaPulse]));
 assert.equal(michiPulseSnapshot(reloaded).level,4);
});
test('all other heroes including Stitcho are completely unaffected',()=>{
 for(const id of ['kilo','stitcho','chispin','cuerno','dragon','dino','frita','pizza','yomi']){
  const g=fixture([0],id),n=g.platforms.length;
  assert.equal(syncMichiPulse(g),null);
  assert.deepEqual(planMichiPulseLedges(g),[]);
  assert.equal(g.platforms.length,n);
 }
});
test('nonfinite station data is never turned into solid geometry',()=>{
 const g=fixture([0,1]);g.world1.stations[0].x=NaN;g.world1.stations[1].y=Infinity;
 assert.deepEqual(planMichiPulseLedges(g),[]);
 assert.equal(syncMichiPulse(g).ledges,0);
});
test('reversed fixture progress removes the coral without moving existing platforms',()=>{
 const g=fixture([0]);const n=g.platforms.length;
 syncMichiPulse(g);g.world1.stations[0].done=false;syncMichiPulse(g);
 assert.equal(g.platforms.length,n);
});

test('room station coordinate changes rebuild physical coral without duplicates',()=>{
 const g=fixture([0]);syncMichiPulse(g);
 const first=g.platforms.filter(p=>p._ohanaPulse).map(p=>p.x);
 const count=g.platforms.filter(p=>!p._ohanaPulse).length;
 g.world1.stations.find(s=>s.id===0).x+=35;
 syncMichiPulse(g);
 const second=g.platforms.filter(p=>p._ohanaPulse).map(p=>p.x);
 assert.equal(g.platforms.filter(p=>!p._ohanaPulse).length,count);
 assert.deepEqual(second,first.map(x=>x+35));
 assert.equal(new Set(g.platforms.filter(p=>p._ohanaPulse).map(p=>p._ohanaPulse)).size,second.length);
});
test('unknown world bounds cannot spawn speculative platforms',()=>{
 const g=fixture([0]);delete g.worldW;
 assert.deepEqual(planMichiPulseLedges(g),[]);
});
