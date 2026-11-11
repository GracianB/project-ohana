import test from 'node:test';
import assert from 'node:assert/strict';
import {tickWalkoffCoyote} from '../systems/player-movement.js';
test('V646: a genuine 10-frame walkoff grace permits a late first jump',()=>{
 const p={grounded:false,jumps:0,maxJumps:1,coyote:10};
 let a=tickWalkoffCoyote(p,true);
 assert.equal(a.consumed,false);assert.equal(a.remaining,9);assert.equal(p.jumps,0);
 for(let i=0;i<8;i++)a=tickWalkoffCoyote(p,false);
 assert.equal(p.coyote,1);assert.equal(p.jumps,0);
});
test('V646: after grace expires one-jump hero cannot jump at any arbitrary later time',()=>{
 const p={grounded:false,jumps:0,maxJumps:1,coyote:10};
 tickWalkoffCoyote(p,true);
 for(let i=0;i<9;i++)tickWalkoffCoyote(p,false);
 assert.equal(p.coyote,0);
 assert.equal(p.jumps,1);
 assert.equal(p.jumps<p.maxJumps,false);
 for(let i=0;i<30;i++)tickWalkoffCoyote(p,false);
 assert.equal(p.jumps,1);
});
test('V646: multi-jump hero keeps ONLY earned remaining air jumps',()=>{
 const p={grounded:false,jumps:0,maxJumps:3,coyote:2};
 tickWalkoffCoyote(p,true);tickWalkoffCoyote(p,false);
 assert.equal(p.jumps,1);assert.equal(p.maxJumps-p.jumps,2);
});
test('V646: safe landing restores ground jumps and resets walkoff intent',()=>{
 const p={grounded:false,jumps:0,coyote:2,maxJumps:1};
 tickWalkoffCoyote(p,true);
 p.grounded=true;p.jumps=0;p.coyote=10;
 tickWalkoffCoyote(p,false);
 assert.equal(p._walkoffPending,false);assert.equal(p.jumps,0);assert.equal(p.coyote,10);
});
test('V646: actual jump before walking off never sacrifices air-jump inventory',()=>{
 const p={grounded:false,jumps:1,maxJumps:3,coyote:0};
 tickWalkoffCoyote(p,false);
 assert.equal(p.jumps,1);
});
