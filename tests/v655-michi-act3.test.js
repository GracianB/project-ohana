import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {planMichiPulseLedges,syncMichiPulse} from '../worlds/ohana-pulse.js';
const mk=ids=>{
 const room=WORLD1_ROOMS['w1-cat'];
 return {roomDef:room,worldW:room.width,world1:{room:room.id,stations:room.seal.stations.map(s=>({...s,done:ids.includes(s.id)}))},
 platforms:room.plats.map(p=>({x:p[0],y:p[1],w:p[2],h:p[3]})),world1Seals:[],score:0};
};
test('V655 Moon Halo is locked until all FIVE authentic jelly IDs are rescued',()=>{
 for(let n=0;n<5;n++){
  const g=mk([0,1,2,3,4].filter(id=>id!==n));
  assert.equal(planMichiPulseLedges(g).filter(p=>p._ohanaPulse.startsWith('cat:final:')).length,0);
 }
 const g=mk([0,1,2,3,4]),secret=planMichiPulseLedges(g).filter(p=>p._ohanaPulse.startsWith('cat:final:'));
 assert.equal(secret.length,4);
 for(let i=0;i<secret.length;i++){
  const p=secret[i];
  assert.ok(p.x>=7150&&p.x+p.w<8260,'must not skip the oracle arena');
  assert.ok(!(g.roomDef.hazards||[]).some(h=>p.x<h.x+h.w&&p.x+p.w>h.x),'must not close genuine pits');
  assert.ok([p.x,p.y,p.w,p.h].every(Number.isFinite));
  if(i)assert.ok(p.x-secret[i-1].x-secret[i-1].w<=70,'readable sky hop');
 }
});
test('V655 completed route is deterministic through save/reload without rewards',()=>{
 const g=mk([0,1,2,3,4]),before=g.platforms.length;
 const state=syncMichiPulse(g),secret=g.platforms.filter(p=>p._ohanaPulse?.startsWith('cat:final:'));
 assert.equal(state.level,5);assert.equal(secret.length,4);
 syncMichiPulse(g);assert.equal(g.platforms.length,before+state.ledges);
 const restored=mk([0,1,2,3,4]);syncMichiPulse(restored);
 assert.deepEqual(restored.platforms.filter(p=>p._ohanaPulse?.startsWith('cat:final:')),secret);
 assert.deepEqual(g.world1Seals,[]);assert.equal(g.score,0);
});
