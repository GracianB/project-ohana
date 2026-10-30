import test from 'node:test';
import assert from 'node:assert/strict';
import {drawChapterBossV2,guardianPerformance} from '../systems/chapter-boss-art-v2.js';
import {KEEPSAKE_ORDER,KEEPSAKES} from '../systems/keepsakes.js';

test('every guardian paints in idle, warning, strike and recovery without changing state',()=>{
 for(const evolved of[false,true])for(const hero of KEEPSAKE_ORDER)for(const phase of['idle','warn','attack','rest']){
  if(!evolved&&hero==='kilo')continue;
  const state={},ctx=new Proxy(state,{get(target,key){
   if(key==='createLinearGradient'||key==='createRadialGradient')return ()=>({addColorStop(){}});
   return key in target?target[key]:()=>{};
  },set(target,key,value){target[key]=value;return true;}});
  const e={roomId:'w1-'+hero,miniBoss:true,x:0,y:0,w:184,h:224,hp:800,max:940,evolved,[KEEPSAKES[hero].key]:{phase,clock:40,aim:1}};
  if(evolved)e.gauntletBoss=hero;
  const before=JSON.stringify(e);assert.equal(drawChapterBossV2(ctx,e,{x:0,y:0},73),true);assert.equal(JSON.stringify(e),before);
 }
});

test('ten guardians own distinct bounded attack gestures without changing their combat mind',()=>{
 const b=Object.freeze({phase:'attack',clock:49,aim:1}),before=JSON.stringify(b),gestures=[];
 for(const hero of KEEPSAKE_ORDER){
  const pose=guardianPerformance(hero,b,73);
  assert.ok(Object.values(pose).every(Number.isFinite));assert.ok(Math.abs(pose.x)<20&&Math.abs(pose.y)<20&&Math.abs(pose.lean)<.2);
  gestures.push(JSON.stringify(pose));
  assert.deepEqual(guardianPerformance(hero,b,0,true),guardianPerformance(hero,b,999,true),'reduced motion holds the readable pose');
 }
 assert.equal(new Set(gestures).size,10);assert.equal(JSON.stringify(b),before);
});

test('Dino guardian has exactly two visible pupils, owned by its fossil mask',()=>{
 for(const evolved of[false,true])for(const phase of['idle','warn','attack','rest']){
  const pupils=[],state={};
  const ctx=new Proxy(state,{get(target,key){
   if(key==='ellipse')return (...args)=>{const ratio=args[3]/args[2];if(target.fillStyle==='#192a40'&&Math.abs(ratio-33/23)<1e-8)pupils.push(args);};
   if(key==='createLinearGradient')return ()=>({addColorStop(){}});
   return key in target?target[key]:()=>{};
  },set(target,key,value){target[key]=value;return true;}});
  const e={roomId:'w1-dino',miniBoss:true,x:0,y:0,w:184,h:224,hp:800,max:940,evolved,_stoneColossus:{phase,clock:40,aim:1}};
  if(evolved)e.gauntletBoss='dino';
  assert.equal(drawChapterBossV2(ctx,e,{x:0,y:0},73),true);
  assert.equal(pupils.length,2,`${evolved?'evolved':'chapter'} ${phase}: no extra base eye beneath the mask`);
 }
});
