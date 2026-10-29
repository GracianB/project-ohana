import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld1Select,world1SelectCardRects,world1SelectPointer} from '../systems/world1-select.js';
import {WORLD1_ORDER,WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {REALM_SIGNATURES} from '../systems/realm-signatures.js';
import {openChapterPits} from '../systems/open-chapter-pits.js';
import {drawMoonHare} from '../characters/michi-moon-hare.js';
test('all eleven selection targets remain visible, disjoint and clickable on short screens',()=>{
 for(const [w,h]of[[320,240],[320,568],[390,360],[390,844],[1120,620],[1280,900]]){
  const sel=createWorld1Select({seals:WORLD1_ORDER}),rs=world1SelectCardRects(sel,w,h);
  for(const [i,r]of rs.entries()){
   assert.ok(r.x>=0&&r.y>=0&&r.x+r.w<=w+.01&&r.y+r.h<=h,`${w}x${h} / ${i}`);
   assert.equal(world1SelectPointer(sel,r.x+r.w/2,r.y+r.h/2,true)?.room,sel.cards[i].room);
   for(const q of rs.slice(i+1))assert.ok(r.x+r.w<=q.x||q.x+q.w<=r.x||r.y+r.h<=q.y||q.y+q.h<=r.y);
  }
 }
});
test('pit pass removes only low incidental bridges; upper routes and banks survive',()=>{
 const bank=[0,1134,100,126],bridge=[110,1069,180,22],upper=[110,900,180,22];
 const r={hazards:[{x:100,y:1114,w:200}],plats:[bank,bridge,upper]};
 assert.deepEqual(openChapterPits(r).plats,[bank,upper]);
 for(const id of ['cat','cuerno','dragon','dino','frita','pizza','yomi']){
  const room=WORLD1_ROOMS['w1-'+id];for(const h of room.hazards)assert.ok(!room.plats.some(p=>p[3]<=30&&p[1]>=h.y-90&&p[1]<=h.y+20&&Math.max(0,Math.min(p[0]+p[2],h.x+h.w)-Math.max(p[0],h.x))>=Math.min(h.w,p[2])*.6),id);
 }
});
test('all ten realm signatures have their own authored silhouette and bounded coordinates',()=>{
 const paths=new Set();for(const id of WORLD1_ORDER){const s=REALM_SIGNATURES[id];assert.ok(s.points.length>=8);for(const p of s.points)assert.ok(p.every(v=>Number.isFinite(v)&&Math.abs(v)<60));paths.add(JSON.stringify(s.points));}assert.equal(paths.size,10);
});
test('moon hare articulates across running frames and freezes in reduced motion',()=>{
 const record=(t,reduced)=>{const ops=[];const c=new Proxy({},{get:(_,k)=>k==='createLinearGradient'?((...v)=>{ops.push([k,...v]);return{addColorStop(...stops){ops.push(['addColorStop',...stops]);}};}):(...v)=>{assert.ok(v.every(n=>typeof n!=='number'||Number.isFinite(n)));ops.push([k,...v]);},set:()=>true});drawMoonHare(c,{t,phase:t*.2,state:'run',reduceMotion:reduced});return ops;};
 assert.notDeepEqual(record(10,false),record(20,false));
 // Reduced motion must ignore the incoming phase as well as clock.
 assert.deepEqual(record(10,true),record(20,true));
});
