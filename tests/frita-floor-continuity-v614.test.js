import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD1_ROOMS } from '../systems/world1-rooms.js';

test('V614 Frita: only the three announced oil pits interrupt the main floor',()=>{
 const r=WORLD1_ROOMS['w1-frita'];
 assert.ok(r,'production Frita chapter exists');
 const floor=r.plats.filter(p=>p[1]===1134&&p[3]>=100);
 const pits=r.hazards.filter(h=>h.type==='death').sort((a,b)=>a.x-b.x);
 assert.equal(pits.length,3,'three authored and marked hazards, no invisible fourth pit');
 assert.deepEqual(pits.map(h=>[h.x,h.x+h.w]),
  [[1080,1340],[2860,3060],[5100,5400]]);
 // Every interior pixel from the third danger to the arena approach must
 // have a real collidable floor. The old terrain contained x=6040..6310,
 // killing a fully evolved Frita without any authored hazard.
 for(let x=5400;x<9600;x+=5){
  assert.ok(floor.some(([px,py,pw])=>px<=x&&x<px+pw),
   'undocumented lethal gap in the golden market near x='+x);
 }
 for(const x of [5400,5900,6039,6040,6175,6280,6310,8000,9599])
  assert.ok(floor.some(([px,,pw])=>px<=x&&x<px+pw),
   'Frita must safely run on normal ground at x='+x);
});

test('V614 Frita: all three authored oil pits remain empty of the main floor',()=>{
 const r=WORLD1_ROOMS['w1-frita'];
 const floor=r.plats.filter(p=>p[1]===1134&&p[3]>=100);
 for(const h of r.hazards.filter(x=>x.type==='death')){
  const middle=h.x+h.w/2;
  assert.ok(!floor.some(([px,,pw])=>px<=middle&&middle<px+pw),
   h.id+' must remain lethal and require a genuine jump');
 }
});
