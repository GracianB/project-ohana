import test from 'node:test';
import assert from 'node:assert/strict';
import {applyPeerEffects} from '../systems/coop-peer-effects.js';

const effectTrio=[
 {kind:'chain',life:22,pts:[{x:100,y:110},{x:115,y:120}]},
 {kind:'trail',life:22,x1:100,y1:110,x2:115,y2:120},
 {kind:'storm',life:22,x:105,y:115,bolts:[{x:105,y1:90,y2:160,life:7}]}
];
const frame=(n,fx=[],scope='session-same')=>({
 protocol:2,scope,frameNo:n,roomId:'hub',
 dinoFx:[],familyDuet:null,michiDuet:null,michiFx:[],chispinDuet:null,
 stitchoDuet:null,kiloDuet:null,chispinFx:fx,
 projectiles:[],slashes:[],bolts:[],kiloFx:[]
});
test('reliable late Chispin combo merges cosmetically without rolling back peer combat snapshot',()=>{
 const game={roomId:'hub',coopPeerEffects:null};
 assert.equal(applyPeerEffects(game,frame(100)),true);
 assert.equal(game.coopPeerEffects.frameNo,100);
 assert.equal(applyPeerEffects(game,frame(80,effectTrio)),true);
 assert.deepEqual(game.coopPeerEffects.chispinFx.map(x=>x.kind),['chain','trail','storm']);
 assert.equal(game.coopPeerEffects.frameNo,100,'never replace newer authoritative state');
 assert.equal(applyPeerEffects(game,frame(80,effectTrio)),false,'reliable duplicate must not replay');
 assert.equal(applyPeerEffects(game,frame(67,effectTrio)),false,'too old to merge');
 assert.equal(applyPeerEffects(game,frame(110,[],'next-session')),true,'legitimate reconnect starts new scope');
 assert.equal(applyPeerEffects(game,frame(95,effectTrio,'session-same')),false,'retired scope cannot inject old combo');
 assert.equal(game.coopPeerEffects.frameNo,110);
});
test('late cosmetic combos reject invalid and damaging payloads even within the catch-up window',()=>{
 const game={roomId:'hub',coopPeerEffects:null};
 assert.equal(applyPeerEffects(game,frame(100)),true);
 assert.equal(applyPeerEffects(game,frame(90,[...effectTrio.slice(0,2),{...effectTrio[2],life:-1}])),false);
 assert.deepEqual(game.coopPeerEffects.chispinFx,[]);
 const harmful={...frame(90,effectTrio),projectiles:[{x:10,y:10,life:9,dmg:999,owner:'enemy'}]};
 // The stale path never mutates projectiles or any authoritative damage state.
 assert.equal(applyPeerEffects(game,harmful),true);
 assert.equal(game.coopPeerEffects.projectiles.length,0);
 assert.equal(game.coopPeerEffects.frameNo,100);
});
