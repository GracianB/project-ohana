import test from 'node:test';import assert from 'node:assert/strict';
import {WORLD1_ROOMS,WORLD1_ORDER,WORLD1_FLOOR} from '../systems/world1-rooms.js';
import {world1CollectPlacements} from '../systems/world1-collect.js';
import {CHAPTER_ENCOUNTERS} from '../systems/chapter-encounters.js';
import {ROSTER} from '../characters/roster.js';
import {useAbility} from '../systems/abilities.js';
test('all 1000 memories are outside solids and within an earned-form jump or flight envelope',()=>{
 let total=0;
 for(const hero of WORLD1_ORDER){
  const room=WORLD1_ROOMS['w1-'+hero],items=world1CollectPlacements(room),f=ROSTER.find(r=>r.id===hero).forms[4];
  assert.equal(items.length,100);assert.equal(new Set(items.map(p=>p.id)).size,100);
  for(const it of items){
   assert.ok(it.x>=60&&it.x<=room.width-60&&it.y>=0);
   assert.equal(room.plats.some(p=>p[3]>40&&it.x>p[0]-5&&it.x<p[0]+p[2]+5&&it.y>p[1]-8&&it.y<p[1]+p[3]+8),false,hero+' buried memory '+it.id);
   // Full held jumps at gravity .5: rise=v². Budget .75 deliberately
   // understates repeated jumps; Kilo also has earned solar free flight.
   const rise=WORLD1_FLOOR-it.y;
   assert.ok(hero==='kilo'||rise<=f.jump*f.jump*f.jumps*.75+40,hero+' inaccessible vertical envelope '+it.id);
  }total+=items.length;
 }assert.equal(total,1000);
});
test('ten encounter plans replace patrols with finite, complementary chapter groups',()=>{
 const signatures=new Set();
 for(const hero of WORLD1_ORDER){const r=WORLD1_ROOMS['w1-'+hero],plan=CHAPTER_ENCOUNTERS[hero];
  signatures.add(JSON.stringify(plan.groups));assert.equal(plan.groups.length,3);assert.ok(r.foes.length<=26);
  for(let group=0;group<3;group++){
   const foes=r.foes.filter(f=>f[4]?.authoredEncounter===group);
   assert.ok(foes.length>=2&&foes.length<=3);
   assert.ok(new Set(foes.map(f=>f[4].role)).size>=2,'coordination needs complementary roles');
   for(const foe of foes)assert.ok(foe[0]>900&&foe[0]<8100,'safe entrance and boss floor stay clear');
  }
 }assert.equal(signatures.size,10);
});
test('U cannot reset a living companion or spend a second cooldown',()=>{
 const p={id:'kilo',evo:4,abilities:['ukulele','hula','ohana']},g={player:p,_evolutionAttacks:{guest:{life:400}},t:300};
 assert.equal(useAbility(g,3),false);assert.equal(p.cds,undefined);assert.equal(g._evolutionAttacks.guest.life,400);
});
