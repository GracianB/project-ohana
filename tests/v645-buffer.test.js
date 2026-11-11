import test from 'node:test';
import assert from 'node:assert/strict';
import {queueJumpPress} from '../systems/player-movement.js';
test('V645 · early jump press is remembered through the landing window',()=>{
 const p={buffer:0};
 assert.equal(queueJumpPress(p,true,10),10);
 for(let i=0;i<8;i++)queueJumpPress(p,false,10);
 assert.equal(p.buffer,2);
 assert.ok(p.buffer>0,'actual collision frame can consume the queued jump');
});
test('V645 · queued press expires and cannot cause a phantom jump',()=>{
 const p={buffer:0};queueJumpPress(p,true,10);
 for(let i=0;i<10;i++)queueJumpPress(p,false,10);
 assert.equal(p.buffer,0);queueJumpPress(p,false,10);assert.equal(p.buffer,0);
});
test('V645 · a new deliberate press refreshes the window without double-credit',()=>{
 const p={buffer:0};queueJumpPress(p,true);queueJumpPress(p,false);
 assert.equal(queueJumpPress(p,true),10);
 assert.equal(queueJumpPress(p,false),9);
});
test('V645 · corrupt buffer or invalid frame settings remain bounded',()=>{
 const p={buffer:Infinity};
 assert.equal(queueJumpPress(p,false),0);
 p.buffer=NaN;assert.equal(queueJumpPress(p,true,Infinity),10);
 assert.equal(queueJumpPress(p,true,999),20);
 assert.equal(queueJumpPress(p,true,-99),1);
 assert.equal(queueJumpPress(null,true),0);
});
