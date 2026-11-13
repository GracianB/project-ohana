import test from'node:test';import assert from'node:assert/strict';import{kiloHoopPose}from'../characters/hula-depth.js';
test('L hoop rotates through its own full lifetime, including replicated duration and J recasts',()=>{
 const p={id:'kilo',evo:3,_kiloOhanaT:250,_kiloOhanaAt:20,_cast:{t:21,slot:2}};
 const a=kiloHoopPose(p,100,40),b=kiloHoopPose(p,100,60);assert.notEqual(a.phase,b.phase);
 p._cast={t:59,slot:0};assert.deepEqual(kiloHoopPose(p,100,60),b);
 const peer={id:'kilo',evo:3,_kiloOhanaT:250};const c=kiloHoopPose(peer,100,100);peer._kiloOhanaT=230;assert.notEqual(kiloHoopPose(peer,100,120).phase,c.phase);
 assert.deepEqual(kiloHoopPose(p,100,60,true),kiloHoopPose(p,100,120,true));assert.equal(kiloHoopPose({...p,dead:true},100,60),null);assert.equal(kiloHoopPose({id:'cat',_kiloOhanaT:200},100,60),null);
});
