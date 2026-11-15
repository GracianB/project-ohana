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
 const centerBalcony={left:(7000+11800)/2-200,right:(7000+11800)/2+200};
 assert.ok(waypoint<centerBalcony.left||waypoint>centerBalcony.right,
  'leave either edge of the real 9200–9600 authored terrace');
 const outside={...ghost,x:waypoint-ghost.w/2,y:880};
 assert.equal(gauntletRelicApproach(v,outside),waypoint,
  'stay at the SAME edge until the character has physically cleared the ledge');
 assert.equal(gauntletRelicApproach(v,{...outside,y:1000}),9360,
  'once below the balcony the real collectible is the target');
 assert.equal(gauntletRelicApproach({...v,phase:'fight'},ghost),9360);
});
