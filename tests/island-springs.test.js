import test from 'node:test';
import assert from 'node:assert/strict';
import {updateIslandSprings,islandSpringsSnapshot} from '../systems/island-springs.js';
const game=()=>({roomId:'hub',player:{x:185,y:680,w:30,h:40,vy:0,jumpPower:12,grounded:true,jumps:2},platforms:[{x:100,y:720,w:200,h:22}],fx:{emit(){}},nums:{add(){}}});
test('flowers require an actual landing and never launch a walking or spawning hero',()=>{
 const g=game();updateIslandSprings(g);assert.equal(g.player.vy,0);updateIslandSprings(g);assert.equal(g.player.vy,0);
 g.player.grounded=false;g.player.y=640;updateIslandSprings(g);g.player.grounded=true;g.player.y=680;updateIslandSprings(g);
 assert.equal(g.player.vy,-15);assert.equal(g.player.grounded,false);assert.equal(g.player.jumps,0);assert.equal(islandSpringsSnapshot(g).used,1);
});
test('cooldown, position, death and boss exclusions prevent accidental boosts',()=>{
 const g=game();updateIslandSprings(g);g.islandSprings.wasAir=true;g.islandSprings.pads[0].cd=20;updateIslandSprings(g);assert.equal(g.player.vy,0);
 g.islandSprings.wasAir=true;g.islandSprings.pads[0].cd=0;g.player.x=800;updateIslandSprings(g);assert.equal(g.player.vy,0);
 g.player.x=185;g.player.dead=true;g.islandSprings.wasAir=true;updateIslandSprings(g);assert.equal(g.player.vy,0);
 g.roomId='boss';updateIslandSprings(g);assert.equal(g.islandSprings,null);
});

test('V446 pressing DOWN crosses an upper ledge without bouncing from the lower spring',()=>{
 const g={roomId:'hub',player:{x:185,y:680,w:30,h:40,vy:0,jumpPower:12,grounded:false,jumps:0,_dropWasHeld:true,_dropPlatform:{x:100,y:620,w:200,h:22}},platforms:[{x:100,y:720,w:200,h:22}],fx:{emit(){}},nums:{add(){}}};
 updateIslandSprings(g);
 g.player.y=680;g.player.grounded=true;
 updateIslandSprings(g);
 assert.equal(g.player.vy,0,'DOWN should never trigger BOING');
 assert.equal(g.player.grounded,true,'landing below the skipped ledge should remain stable');
 assert.equal(islandSpringsSnapshot(g).used,0);
 g.player._dropWasHeld=false;g.player._dropPlatform=null;
 updateIslandSprings(g);
 assert.equal(islandSpringsSnapshot(g).used,0,'release while grounded must not belatedly launch');
 g.player.grounded=false;g.player.y=640;updateIslandSprings(g);
 g.player.grounded=true;g.player.y=680;updateIslandSprings(g);
 assert.equal(g.player.vy,-15,'later genuine landing still uses the flower');
 assert.equal(islandSpringsSnapshot(g).used,1);
});
