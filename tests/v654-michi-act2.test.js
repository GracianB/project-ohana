import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {planMichiPulseLedges,syncMichiPulse} from '../worlds/ohana-pulse.js';
const mk=earned=>{
 const room=WORLD1_ROOMS['w1-cat'];
 return {roomDef:room,worldW:room.width,world1:{room:room.id,stations:room.seal.stations.map(s=>({...s,done:earned.includes(s.id)}))},
 platforms:room.plats.map(p=>({x:p[0],y:p[1],w:p[2],h:p[3]}))};
};
test('V654: duet only materializes when the first TWO distinct rescues are real',()=>{
 for(const ids of [[],[0],[1],[2],[0,2]])
  assert.equal(planMichiPulseLedges(mk(ids)).filter(p=>p._ohanaPulse.startsWith('cat:duet:')).length,0);
 const g=mk([0,1]),parts=planMichiPulseLedges(g).filter(p=>p._ohanaPulse.startsWith('cat:duet:'));
 assert.equal(parts.length,4);assert.equal(parts[0].x,3670);
 for(let i=0;i<parts.length;i++){
  const p=parts[i];
  assert.ok(p.y<g.world1.stations[1].y,'elevated real route');
  assert.ok(p.x+p.w<4480,'lunar pond pit stays lethal');
  assert.ok(g.platforms.every(q=>!(p.x<q.x+q.w&&q.x<p.x+p.w&&Math.abs(p.y-q.y)<22)),'not overlapping terrain');
  if(i)assert.ok(p.x-parts[i-1].x-parts[i-1].w<=50,'flight-friendly spacing');
 }
});
test('V654: duet is reconstructed from saves with no duplicate platforms or rewards',()=>{
 const g=mk([0,1]),initial=g.platforms.length,state=syncMichiPulse(g);
 const parts=g.platforms.filter(p=>p._ohanaPulse?.startsWith('cat:duet:'));
 assert.equal(parts.length,4);assert.equal(state.level,2);
 syncMichiPulse(g);assert.equal(g.platforms.length,initial+state.ledges);
 const resumed=mk([0,1]);syncMichiPulse(resumed);
 assert.deepEqual(resumed.platforms.filter(p=>p._ohanaPulse?.startsWith('cat:duet:')),parts);
});
