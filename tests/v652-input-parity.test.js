import test from 'node:test';
import assert from 'node:assert/strict';
import {bindInput} from '../engine/input.js';
function setup(){
 let axis=0,buttons=Array.from({length:16},()=>({pressed:false})),attacks=0,dashes=0;
 const pad={connected:true,axes:[axis],buttons};
 const target=new EventTarget();
 const input=bindInput({target,canAct:()=>true,actions:{attack(){attacks++},dash(){dashes++}},
  getGamepads:()=>[pad]});
 return {target,input,pad,buttons,setAxis:x=>{pad.axes[0]=x;},getAttacks:()=>attacks,getDashes:()=>dashes};
}
test('V652: left stick and D-pad drive the same game axis with a deadzone',()=>{
 const q=setup();
 q.setAxis(.11);assert.equal(q.input.axisX(),0);
 q.setAxis(.7);assert.equal(q.input.axisX(),.7);
 q.buttons[14].pressed=true;assert.equal(q.input.axisX(),-1);
 q.buttons[14].pressed=false;q.buttons[15].pressed=true;assert.equal(q.input.axisX(),1);
 q.input.destroy();
});
test('V652: A button is held jump with a single buffered press edge',()=>{
 const q=setup();
 q.buttons[0].pressed=true;
 assert.equal(q.input.gamepadJumpHeld(),true);
 assert.equal(q.input.consumePress(['w','arrowup',' ']),true);
 assert.equal(q.input.consumePress(['w']),false);
 q.buttons[0].pressed=false;assert.equal(q.input.gamepadJumpHeld(),false);
 q.buttons[0].pressed=true;assert.equal(q.input.consumePress('w'),true);
 q.input.destroy();
});
test('V652: attack B and dash X trigger once while held',()=>{
 const q=setup();q.buttons[1].pressed=true;q.buttons[2].pressed=true;
 for(let n=0;n<30;n++)q.input.axisX();
 assert.equal(q.getAttacks(),1);assert.equal(q.getDashes(),1);
 q.buttons[1].pressed=false;q.buttons[2].pressed=false;q.input.axisX();
 q.buttons[1].pressed=true;q.input.axisX();assert.equal(q.getAttacks(),2);
 q.input.destroy();
});
test('V652: reset never invents a jump from an already held gamepad button',()=>{
 const q=setup();q.buttons[0].pressed=true;q.input.axisX();
 q.input.reset();q.input.axisX();
 assert.equal(q.input.consumePress('w'),false);
 q.buttons[0].pressed=false;q.input.axisX();
 q.buttons[0].pressed=true;q.input.axisX();
 assert.equal(q.input.consumePress('w'),true);
 q.input.destroy();
});
