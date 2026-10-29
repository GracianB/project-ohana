import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROSTER} from '../characters/roster.js';
import {ACTION_CHANNELS,ACTION_PROFILES,tenActionPose,applyTenActionPose} from '../characters/ten-action-acting.js';
import cat,{MICHICORNIO_ACTIONS} from '../characters/art/cat.js';
const ctx=()=>new Proxy({canvas:{width:600,height:600},globalAlpha:1},{get:(o,k)=>{
 if(k in o)return o[k];
 if(k==='createLinearGradient'||k==='createRadialGradient')return ()=>({addColorStop(){}});
 return ()=>{};
},set:(o,k,v)=>(o[k]=v,true)});
const pose=(state,time,form=2,reduceMotion=false)=>({
 form,state,t:time,phase:time*.17,atk:(time%87)/87,cast:(time%73)/73,
 castSlot:2,speed:.9,look:{x:.2,y:0},reduceMotion
});
const vec=v=>[v.dx,v.dy,v.rotation,v.sx,v.sy,v.ear,v.tail,v.paw,v.wing,v.glow].map(x=>Math.round(x*1000)/1000).join(',');
test('V459: all 10 active heroes have all ten individually choreographed action channels',()=>{
 assert.equal(ROSTER.length,10);
 assert.equal(ACTION_CHANNELS.length,10);
 assert.equal(new Set(ACTION_CHANNELS).size,10);
 assert.deepEqual([...MICHICORNIO_ACTIONS], [...ACTION_CHANNELS]);
 for(const hero of ROSTER){
  assert.ok(ACTION_PROFILES[hero.id],hero.id);
  const distinct=new Set();
  for(const action of ACTION_CHANNELS){
   const a=tenActionPose(pose(action,64),hero.id,2);
   assert.equal(a.state,action);
   assert.ok(['dx','dy','rotation','sx','sy','ear','tail','paw'].every(k=>Number.isFinite(a[k])),hero.id+'/'+action);
   distinct.add(vec(a));
   const b=tenActionPose(pose(action,128),hero.id,2);
   const r1=tenActionPose(pose(action,64,2,true),hero.id,2);
   const r2=tenActionPose(pose(action,128,2,true),hero.id,2);
   assert.equal(vec(r1),vec(r2),'reduced-motion must stay still: '+hero.id+'/'+action);
   assert.ok(Number.isFinite(b.dx));
  }
  assert.equal(distinct.size,10,'10 physically distinct actor poses: '+hero.id);
 }
 const samples=ROSTER.map(x=>vec(tenActionPose(pose('run',64),x.id,2)));
 assert.ok(new Set(samples).size>=8,'the same animation must not be copied onto every hero');
});
test('V459: actions never mutate actor position, forms or hitbox',()=>{
 const actor={id:'cat',x:34,y:567,w:32,h:30,evo:2,vy:0,vx:5};
 for(const hero of ROSTER)for(const action of ACTION_CHANNELS){
  const c=ctx(),before=JSON.stringify(actor);
  applyTenActionPose(c,pose(action,104),hero.id,3);
  assert.equal(JSON.stringify(actor),before);
 }
});
test('V459: all five feline shapes survive 10 gestures and reduced-motion contexts',()=>{
 const c=ctx();
 for(let f=0;f<5;f++)for(const action of ACTION_CHANNELS)for(const reduced of [false,true]){
  assert.doesNotThrow(()=>cat.draw(c,pose(action,112,f,reduced),{}),f+'/'+action+'/'+reduced);
 }
});
test('V459: character lineage is cat->lunar lynx->cat-eared jelly->moon hare->jelly-tail guardian',()=>{
 const src=readFileSync(new URL('../characters/art/cat.js',import.meta.url),'utf8');
 const name=ROSTER.find(x=>x.id==='cat');
 assert.equal(name.forms[1].name,'Hada Felina');
 assert.ok(name.forms[2].name.includes('Medusa'));
 assert.equal(name.forms[3].name,'Conejornio Lunar');
 assert.equal(name.forms[4].name,'Michicornio Eclipse');
 assert.equal(name.forms[0].name,'Michicornio Bebé');
 // Each evolution has a dedicated anatomical rendering path after V625.
 for(const form of [0,1,2,3,4])assert.match(src,new RegExp('if\\(f==='+form+'\\)\\{'));
 assert.deepEqual(MICHICORNIO_ACTIONS,['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory']);
});
