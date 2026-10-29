import test from 'node:test';
import assert from 'node:assert/strict';
import {tryFamilyActorAdapter} from '../systems/family-actor.js';

function canvasState(){
 let state={x:9,y:11,clipped:false},stack=[];
 return {
  save(){stack.push({...state});},restore(){if(stack.length)state=stack.pop();},
  translate(x,y){state.x+=x;state.y+=y;},clip(){state.clipped=true;},
  snapshot(){return {state:{...state},depth:stack.length};}
 };
}
test('a declined or unavailable actor adapter requests the canonical fallback',()=>{
 const c=canvasState(),before=c.snapshot();
 assert.equal(tryFamilyActorAdapter(c,null),false);
 assert.equal(tryFamilyActorAdapter(c,()=>false),false);
 assert.deepEqual(c.snapshot(),before);
});
test('successful adapters retain their arguments and leave caller state intact',()=>{
 const c=canvasState(),before=c.snapshot(),save=c.save,restore=c.restore,seen=[];
 assert.equal(tryFamilyActorAdapter(c,(ctx,...args)=>{assert.equal(ctx,c);seen.push(...args);ctx.translate(20,30);},'cat',12,13),true);
 assert.deepEqual(seen,['cat',12,13]);assert.deepEqual(c.snapshot(),before);
 assert.equal(c.save,save);assert.equal(c.restore,restore);
});
test('nested saves and clipping are unwound before a failed painter falls back',()=>{
 const c=canvasState();c.save();const before=c.snapshot(),descriptors={save:Object.getOwnPropertyDescriptor(c,'save'),restore:Object.getOwnPropertyDescriptor(c,'restore')};
 assert.equal(tryFamilyActorAdapter(c,ctx=>{ctx.save();ctx.translate(8000,4000);ctx.save();ctx.clip();throw Error('broken actor');}),false);
 assert.deepEqual(c.snapshot(),before);
 for(const key of['save','restore'])assert.deepEqual(Object.getOwnPropertyDescriptor(c,key),descriptors[key]);
 c.restore();assert.equal(c.snapshot().depth,0);
});
test('extra restores cannot consume the caller frame or poison a later adapter',()=>{
 const c=canvasState();c.save();const before=c.snapshot();
 assert.equal(tryFamilyActorAdapter(c,ctx=>{ctx.restore();ctx.restore();ctx.translate(8000,4000);throw Error('broken actor');}),false);
 assert.deepEqual(c.snapshot(),before);
 assert.equal(tryFamilyActorAdapter(c,ctx=>{ctx.save();ctx.translate(1,2);ctx.restore();return true;}),true);
 assert.deepEqual(c.snapshot(),before);
});
