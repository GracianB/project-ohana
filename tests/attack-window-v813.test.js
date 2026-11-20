import assert from 'node:assert/strict';
import test from 'node:test';
import {drawAttackWindow} from '../systems/combat-fx.js';
import {meteorLanding} from '../systems/abilities.js';

test('promised attack reach stays fixed while the countdown fills progressively',()=>{
 const log=[];
 const ctx=new Proxy({},{get:(_,name)=>(...args)=>log.push([name,...args]),set:()=>true});
 const opts={x:28,y:40,halfWidth:18,color:'#fff',total:24};
 drawAttackWindow(ctx,{...opts,remaining:20});
 const early=log.filter(([name])=>name==='lineTo').length;
 assert.deepEqual(log.find(([name])=>name==='moveTo'),['moveTo',10,40]);
 log.length=0;
 drawAttackWindow(ctx,{...opts,remaining:3});
 assert.ok(log.filter(([name])=>name==='lineTo').length>early);
 log.length=0;
 drawAttackWindow(ctx,{...opts,active:true});
 assert.ok(log.some(([name,x,y,w])=>name==='rect'&&x===10&&y===38&&w===36));
});

test('meteor forecast finds first solid crossing in travel order',()=>{
 const pr={x:25,y:10,vx:3,vy:11,r:12,life:40};
 const platforms=[{x:0,y:90,w:200},{x:31,y:38,w:20},{x:90,y:25,w:40}];
 assert.deepEqual(meteorLanding(platforms,pr),{x:31,y:38,frames:2});
 assert.deepEqual(meteorLanding(platforms.slice(0,1),pr),{x:46,y:90,frames:7});
 assert.equal(meteorLanding([{x:100,y:40,w:10}],pr),null);
 assert.equal(meteorLanding(platforms,{...pr,life:1}),null);
});
