import test from 'node:test';
import assert from 'node:assert/strict';
import {gauntletNeedsDescent,gauntletRelicApproach} from './browser/gauntlet-controls.mjs';

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

test('earned relic uses an actual off-balcony walking route before descending',()=>{
 const v={phase:'released',object:{x:9360,y:1119}};
 const ghost={x:9284,y:812,w:80,h:42,grounded:true};
 const waypoint=gauntletRelicApproach(v,ghost);
 assert.ok(waypoint>9400,'first leave the authored 9000–9400 central terrace');
 assert.equal(gauntletRelicApproach(v,{...ghost,x:9440,y:880}),waypoint,
  'do not turn back onto the balcony before physically clearing the ledge');
 assert.equal(gauntletRelicApproach(v,{...ghost,x:9440,y:1000}),9360,
  'once below the balcony the real collectible is the target');
 assert.equal(gauntletRelicApproach({...v,phase:'fight'},ghost),9360);
});
