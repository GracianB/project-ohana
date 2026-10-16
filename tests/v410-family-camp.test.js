import test from 'node:test';import assert from 'node:assert/strict';
import {CAMP_HEROES,campNearest,campViewport,campPresentation} from '../systems/family-camp-model.js';
import {ROSTER} from '../characters/roster.js';
test('V410 camp has ten reachable stations and readable authored presentations',()=>{
 assert.deepEqual(Object.keys(CAMP_HEROES),ROSTER.map(r=>r.id));
 for(const [id,p] of Object.entries(CAMP_HEROES)){
  assert.equal(campNearest(p.x,p.y),id);assert.ok(p.role&&p.route);
  for(const line of p.lines)assert.ok(line.length<=55&&line.length>10);
  for(let phase=0;phase<3;phase++){assert.equal(campPresentation(id,phase*4).line,p.lines[phase]);assert.equal(campPresentation(id,phase*4+3.99).line,p.lines[phase]);}
  assert.equal(campPresentation(id,11.99).done,false);assert.equal(campPresentation(id,12).done,true);
 }
 assert.equal(campNearest(-1000,-1000),null);
});
test('V410 mobile camera exposes the selected station and never leaves the island bounds',()=>{
 for(const id of Object.keys(CAMP_HEROES))for(const width of [320,390,600,700,1280]){
  const v=campViewport(width,400,id),x=(CAMP_HEROES[id].x-v.x)*v.scale;
  assert.ok(x>=0&&x<=width);assert.ok(v.x>=0&&v.x+width/v.scale<=1400.001);
 }
});
