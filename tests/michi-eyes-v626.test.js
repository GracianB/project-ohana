import test from 'node:test';
import assert from 'node:assert/strict';
import {R} from '../characters/rig.js';
import {drawMichiEye} from '../characters/michi-eyes.js';
import cat from '../characters/art/cat.js';

function record(draw){
 const ops=[],stack=[];let state={globalAlpha:1,lineWidth:1},gradients=0;
 const ctx=new Proxy({},{
  get:(_,key)=>{
   if(key in state)return state[key];
   return (...args)=>{
    for(const value of args)if(typeof value==='number')assert.ok(Number.isFinite(value),`${key} must receive finite geometry`);
    if(key==='save')stack.push({...state});
    if(key==='restore'){assert.ok(stack.length);state=stack.pop();}
    assert.notEqual(key,'drawImage','eye and character remain Canvas vectors');
    assert.notEqual(key,'createRadialGradient','no new eye glow or blur');
    ops.push([key,...args]);
    if(key==='createLinearGradient'){
     const gradient={irisGradient:++gradients};
     gradient.addColorStop=(offset,color)=>{assert.ok(Number.isFinite(offset)&&offset>=0&&offset<=1);ops.push(['addColorStop',gradient.irisGradient,offset,color]);};
     return gradient;
    }
   };
  },
  set:(_,key,value)=>{if(typeof value==='number')assert.ok(Number.isFinite(value),key);state[key]=value;ops.push(['set',key,value]);return true;}
 });
 draw(ctx);assert.equal(stack.length,0,'balanced Canvas state');
 // Gradient objects are local; their serializable identity and stops carry the trace.
 return {ops:JSON.parse(JSON.stringify(ops)),gradients};
}

test('Michi uses the exact existing hero eye renderer, including white sclera, iris, pupil and shine',()=>{
 for(const radius of[6.2,7,7.2,8])for(const mood of['normal','happy','closed','angry','sad']){
  const pose={look:{x:.25,y:-.1},blink:0,mood};
  const actual=record(ctx=>drawMichiEye(ctx,-10,-3.5,radius,pose));
  const expected=record(ctx=>R.eye(ctx,-10,-3.5,radius,{look:pose.look,blink:0},{iris:'#623d85',mood}));
  assert.deepEqual(actual.ops,expected.ops,`${radius}/${mood}`);
 }
});

test('all five real Michi forms render both shared hero eyes when awake',()=>{
 for(let form=0;form<5;form++){
  const drawing=record(ctx=>cat.draw(ctx,{form,state:'idle',t:73,phase:1.3,speed:0,look:{x:.25,y:0},michiSeed:42},{}));
  assert.equal(drawing.gradients,2,`form ${form}: both eyes must use the existing hero iris renderer`);
 }
});

test('Michi eye expression closes for hits/death and celebrates with the shared happy eye',()=>{
 for(const [pose,mood,blink]of[[{closed:true},'closed',1],[{happy:true},'happy',0],[{blink:1},'normal',1]]){
  const actual=record(ctx=>drawMichiEye(ctx,0,0,7.2,pose));
  const expected=record(ctx=>R.eye(ctx,0,0,7.2,{look:{x:1,y:0},blink},{iris:'#623d85',mood}));
  assert.deepEqual(actual.ops,expected.ops);
  assert.equal(actual.gradients,0,'closed lids do not draw an iris through the eyelid');
 }
});

test('eye wrapper sanitizes corrupt replay coordinates and does not modify frozen input',()=>{
 const pose=Object.freeze({look:Object.freeze({x:.25,y:-.1}),blink:.1,mood:'normal'});
 const before=JSON.stringify(pose);assert.doesNotThrow(()=>record(ctx=>drawMichiEye(ctx,2,3,7.2,pose)));assert.equal(JSON.stringify(pose),before);
 for(const bad of[NaN,Infinity,-Infinity])assert.doesNotThrow(()=>record(ctx=>drawMichiEye(ctx,bad,bad,bad,{look:{x:bad,y:bad},blink:bad})));
});
