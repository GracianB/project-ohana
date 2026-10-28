import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ORDER,WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {world1CollectPlacements,loadWorld1Collect,enterWorld1Collect,world1AlbumView} from '../systems/world1-collect.js';
import {MEMORY_PICKUPS} from '../systems/memory-pickup-art.js';

test('all thousand memories keep stable IDs and stay clear of current chapter hazards',()=>{
  for(const hero of WORLD1_ORDER){
    const room=WORLD1_ROOMS['w1-'+hero],items=world1CollectPlacements(room);
    assert.deepEqual(items,world1CollectPlacements(room),'deterministic layout '+hero);
    assert.deepEqual(items.map(it=>it.id),Array.from({length:100},(_,i)=>i));
    for(const it of items){
      assert.equal((room.hazards||[]).some(h=>it.x+14>h.x&&it.x-14<h.x+h.w&&it.y+18>h.y&&it.y-18<h.y+h.h),false,hero+' unsafe memory '+it.id);
      assert.equal(it.page,Math.floor(it.id/10));
    }
    assert.ok(MEMORY_PICKUPS[hero]?.name&&MEMORY_PICKUPS[hero]?.plural);
  }
});

test('moving a memory out of a new hazard preserves its earned album receipt and grants no reward',()=>{
  const room=WORLD1_ROOMS['w1-cat'];
  const oldReceipt={v:1,rooms:{cat:{found:[30],relic:false}},migrated:true};
  let stored=JSON.stringify(oldReceipt);
  const g={roomId:room.id,roomDef:room,score:150,player:{id:'cat',xp:40},personalCollectionStorage:{getItem:key=>key==='ohana-w1-collect-v1'?stored:null,setItem:(key,value)=>{if(key==='ohana-w1-collect-v1')stored=value;}}};
  loadWorld1Collect(g);enterWorld1Collect(g);g.world1CollectUI.page=3;
  assert.equal(world1AlbumView(g).cards[0].found,true);
  const moved=g.world1CollectItems.find(it=>it.id===30);
  assert.notDeepEqual([moved.x,moved.y],[4509,1100],'old placement was inside the moon pit');
  assert.equal(g.score,150);assert.equal(g.player.xp,40);
  assert.deepEqual(JSON.parse(stored).rooms.cat.found,[30]);
});
