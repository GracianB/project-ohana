import test from 'node:test';
import assert from 'node:assert/strict';
import {
 createStitchoBoss,updateStitchoBoss,drawStitchoBossBody,
 drawStitchoBossSignals,drawStitchoEnemyAccent,STITCHO_BOSS_ID,STITCHO_BOSS
} from '../systems/stitcho-boss.js';
const fixture=()=>{
 const e=createStitchoBoss((x,y,kind)=>({x,y,kind,w:30,h:30,hp:50,max:50,stun:0,invuln:0,sleep:0}),()=>.5);
 const g={player:{x:3450,y:1030,w:32,h:40,dead:false},cam:{x:3000,y:400},viewW:1000,
  projectiles:[],nums:{add(){}}};
 return {e,g};
};
test('Glitch Core is an authored 480 HP, 3-phase persistent solo miniboss',()=>{
 const {e}=fixture();
 assert.equal(e.hp,480);assert.equal(e.max,480);
 assert.equal(e._encounterSaveId,STITCHO_BOSS_ID);
 assert.equal(e.w,112);assert.equal(e.h,92);
 assert.equal(e._stitchoBoss,true);assert.equal(e.miniBoss,true);
 assert.equal(e.kind,'cangrejo','use a non-molting base for real permanent defeats');
});
test('four telegraphed attack patterns cycle with real rest windows and bounded projectiles',()=>{
 const {e,g}=fixture(),patterns=new Set();let warnings=0,rests=0,strikes=0;
 for(let i=0;i<1500;i++){
  updateStitchoBoss(e,g,()=>{});
  if(e._glitch.phase==='warn'){patterns.add(e._glitch.attack);warnings++;}
  if(e._glitch.phase==='rest')rests++;
  if(e._glitch.phase==='attack')strikes++;
  assert.equal(e.y+e.h,STITCHO_BOSS.floor);
  assert.ok(e.x>=STITCHO_BOSS.left&&e.x+e.w<=STITCHO_BOSS.right);
 }
 assert.deepEqual([...patterns].sort(),[0,1,2,3]);
 assert.ok(warnings>100&&rests>100&&strikes>30);
 assert.ok(g.projectiles.length>=4&&g.projectiles.length<=130);
 assert.ok(g.projectiles.every(x=>x.owner==='enemy'&&x.dmg===13));
});
test('phase escalation, sleep and strong stagger are all deterministic',()=>{
 const {e,g}=fixture();
 e.hp=280;updateStitchoBoss(e,g,()=>{});assert.equal(e._glitch.tier,2);
 e.hp=80;updateStitchoBoss(e,g,()=>{});assert.equal(e._glitch.tier,3);
 e._glitch.phase='warn';e._glitch.clock=30;e.sleep=5;
 updateStitchoBoss(e,g,()=>{});
 assert.equal(e._glitch.clock,30);assert.equal(e.sleep,4);
 e.sleep=0;e.stun=25;
 updateStitchoBoss(e,g,()=>{});
 assert.equal(e._glitch.phase,'rest');assert.equal(e._glitch.exposed,true);
 assert.equal(e._glitch.clock,95);
});
test('boss and named minions have independent accessible vector renderers',()=>{
 const {e}=fixture(),seen=[];
 const ctx=new Proxy({save(){seen.push('save');},restore(){seen.push('restore');}},
  {get(obj,key){return key in obj?obj[key]:(...args)=>{seen.push(String(key));return {};};},set(obj,key,val){obj[key]=val;return true;}});
 assert.equal(drawStitchoBossBody(ctx,e,{x:0,y:0},123,false),true);
 drawStitchoBossSignals(ctx,e,{x:0,y:0},123,false);
 drawStitchoEnemyAccent(ctx,{x:20,y:20,w:32,spawnIndex:1,roomPersona:{name:'Dron'}},{x:0,y:0},123,false);
 assert.ok(seen.includes('ellipse')&&seen.includes('stroke')&&seen.includes('restore'));
});

// The chapter arena is far east of the historical hub. Its AI and warning
// geometry must follow its own floor/bounds without changing the old encounter.
test('chapter Glitch keeps its own arena, persistent ID and room through all patterns',()=>{
 const calls=[];
 const e=createStitchoBoss((...args)=>{calls.push(args);return {stun:0,invuln:0,sleep:0};},()=>.5,{
  roomId:'w1-stitcho',encounterId:'w1-stitcho-glitch-v1',x:8750,
  arena:{left:8260,right:9320,floor:1134}
 });
 assert.equal(calls[0][3],'w1-stitcho');
 assert.equal(e.roomId,'w1-stitcho');
 assert.equal(e._encounterSaveId,'w1-stitcho-glitch-v1');
 const g={player:{x:8800,y:1070,w:32,h:40},cam:{x:8200,y:400},viewW:1100,projectiles:[],nums:{add(){}}};
 const patterns=new Set();
 for(let i=0;i<1500;i++){
  updateStitchoBoss(e,g,()=>{});
  if(e._glitch.phase==='warn')patterns.add(e._glitch.attack);
  assert.ok(e.x>=8260&&e.x+e.w<=9320,'cannot snap back into the legacy hub');
  assert.equal(e.y+e.h,1134);
 }
 assert.deepEqual([...patterns].sort(),[0,1,2,3]);
 const legacy=fixture().e;
 assert.equal(legacy.roomId,'hub');assert.equal(legacy._encounterSaveId,STITCHO_BOSS_ID);
 assert.deepEqual(legacy._stitchoArena,STITCHO_BOSS);
});
