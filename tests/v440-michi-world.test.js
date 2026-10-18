import {dragonEmbersForRoom} from "../systems/dragon-trial.js";
import {ROOMS} from "../systems/map.js";
import test from 'node:test';import assert from 'node:assert/strict';
import {michiMotion} from '../characters/michi-motion.js';
import {tidyPlatforms} from '../systems/platform-layout.js';
import {localMapBounds} from '../systems/local-map.js';
import {WORLD_BOUNDS} from '../systems/world-bounds.js';
import {safeDirectPose} from '../systems/coop-v108-direct.js';
test('Michi articulates opposing feet, folds in flight and compresses on landing',()=>{
 const a=michiMotion({state:'run',phase:Math.PI/2,speed:1}),b=michiMotion({state:'run',phase:Math.PI*1.5,speed:1});
 assert.ok(a.frontX>0&&a.backX<0);assert.ok(b.frontX<0&&b.backX>0);
 const jump=michiMotion({state:'jump'}),land=michiMotion({state:'idle',land:1});assert.ok(jump.frontY<0&&jump.backY<0);assert.ok(land.sy<1&&land.sx>1);
 for(let f=0;f<5;f++)for(const state of ['idle','run','jump','fall','cast','attack','hurt','dead'])for(let t=0;t<120;t+=11){const r=michiMotion({state,t,phase:t*.2,speed:.8,castSlot:1,cast:.4,atk:.5},f);assert.ok(Object.values(r).filter(v=>typeof v==='number').every(Number.isFinite));}
 const reduced=michiMotion({state:'run',reduceMotion:true,phase:2,speed:1});assert.equal(reduced.lift,0);assert.equal(reduced.head,0);assert.equal(reduced.tail,0);
});
test('Michi I has a distinct body pose from kneading K',()=>{
 const k=michiMotion({state:'cast',castSlot:1,cast:.5,t:10}),i=michiMotion({state:'cast',castSlot:1,michiPowerIndex:4,t:10});assert.notEqual(k.frontPaw,i.frontPaw);assert.notEqual(k.frontY,i.frontY);
});
test('Return ledges merge overlapping seams and split long spans into readable landings',()=>{
 const lift={x:100,y:200,w:170,h:22,_campaignLift:true},ground={x:0,y:500,w:7200,h:126};
 const p=tidyPlatforms([ground,lift,{x:0,y:300,w:300,h:22},{x:200,y:306,w:300,h:22},{x:490,y:300,w:300,h:22}]);
 assert.ok(p.includes(ground)&&p.includes(lift));const ledges=p.filter(v=>v!==lift&&v!==ground).sort((a,b)=>a.x-b.x);
 assert.ok(ledges.every(v=>v.w<=380&&v.y===300));for(let i=1;i<ledges.length;i++)assert.ok(ledges[i].x-ledges[i-1].x-ledges[i-1].w>=47.9);
});
test('Near-stacked ledges cannot catch DOWN immediately below the same landing',()=>{
 const rows=tidyPlatforms([{x:270,y:960,w:330,h:22},{x:275,y:974,w:250,h:22},{x:160,y:1054,w:250,h:22}]);
 assert.equal(rows.length,2);assert.ok(rows.every(p=>p.y!==974));
});
test('Local map follows the nearby terrain and stays above attack buttons',()=>{
 const g={worldW:7200,worldH:1260,player:{x:5600,y:900,w:40}};
 for(const [w,h] of [[390,844],[1100,860],[1440,1000]]){const b=localMapBounds(g,w,h);assert.equal(b.spanX,2400);assert.ok(b.left>0);assert.ok(b.y+b.h<=h-110);assert.ok(b.x>=0&&b.x+b.w<=w);}
});
test('WebRTC accepts the full campaign and rejects coordinates outside each room',()=>{
 assert.equal(safeDirectPose({seq:1,x:10,y:20,room:{toString:null}}),null);
 for(const [room,b] of Object.entries(WORLD_BOUNDS)){
  const p={t:'pose',seq:1,room,x:b.width-50,y:1120};assert.equal(safeDirectPose(p)?.x,b.width-50);assert.equal(safeDirectPose({...p,x:b.width+1}),null);assert.equal(safeDirectPose({...p,y:b.height+1}),null);
 }
});


test('Dragon ritual embers sit on three distinct landings in the expanded Caldera',()=>{
 const embers=dragonEmbersForRoom(ROOMS.volcano);assert.equal(new Set(embers.map(e=>e.x)).size,3);
 for(const e of embers)assert.ok(ROOMS.volcano.plats.some(p=>p[3]<=24&&e.x>=p[0]&&e.x<=p[0]+p[2]&&e.y===p[1]-42));
});
