import test from 'node:test';
import assert from 'node:assert/strict';
import {gauntletNeedsDescent} from './browser/gauntlet-controls.mjs';

test('Michi final ghost must physically descend when the earned relic lies below its hover',()=>{
 const ghost={x:9315,y:762,w:38,h:80,grounded:false};
 const released={phase:'released',object:{x:9360,y:1119}};
 assert.equal(gauntletNeedsDescent(released,ghost),true);
 assert.equal(gauntletNeedsDescent(released,{...ghost,y:1070}),false);
 assert.equal(gauntletNeedsDescent({phase:'fight',object:released.object},ghost),false);
 assert.equal(gauntletNeedsDescent({phase:'released',object:null},ghost),false);
});
test('legacy grounded balcony descent is still available to every hero',()=>{
 assert.equal(gauntletNeedsDescent({phase:'fight'},{grounded:true,y:762,h:70}),true);
 assert.equal(gauntletNeedsDescent({phase:'fight'},{grounded:false,y:762,h:70}),false);
});
