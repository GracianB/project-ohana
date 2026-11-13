import test from'node:test';import assert from'node:assert/strict';import{michiChoreography,michiPawCycle}from'../characters/michi-acting.js';
test('Michi immediate attack contact has a strong opening and returns to neutral at the end',()=>{
 for(let f=0;f<5;f++){const first=michiChoreography({state:'attack',atk:0},f),end=michiChoreography({state:'attack',atk:1},f);assert.equal(first.extension,1);assert.ok(first.reach>=8);assert.equal(end.extension,0);assert.ok(Math.abs(end.reach)<1e-8);assert.equal(michiChoreography({state:'idle'},f).reach,0);assert.ok(michiChoreography({state:'attack',atk:.85,powerProgress:.2},f).extension>.5);assert.equal(michiChoreography({state:'attack',atk:.1,powerProgress:.9},f).extension,0);}
});
test('paw cycles lift only above the floor and retain a planted support phase',()=>{
 for(let i=0;i<=200;i++){const a=michiPawCycle({state:'run',phase:i/20},0,9,5),b=michiPawCycle({state:'run',phase:i/20},Math.PI,9,5);assert.ok(a.lift>=0&&a.lift<=5);assert.ok(a.lift===0||b.lift===0||Math.min(a.lift,b.lift)<1e-8);assert.ok(Math.abs(a.step)<=9);}
 for(const state of['idle','dead','cast','hurt'])assert.deepEqual(michiPawCycle({state,phase:2}),{step:0,lift:0});
});
test('brake/landing/turn acting is bounded, reduced-motion static and never mutates inputs',()=>{
 const p=Object.freeze({state:'idle',land:1,brake:1,turnPulse:1,reduceMotion:false}),before=JSON.stringify(p);const a=michiChoreography(p,4);assert.ok(a.ghostFade>=.7);assert.ok(a.compress<=.1);assert.equal(JSON.stringify(p),before);
 for(let f=0;f<5;f++){assert.deepEqual(michiChoreography({...p,reduceMotion:true,t:1},f),michiChoreography({...p,reduceMotion:true,t:900},f));assert.deepEqual(michiPawCycle({state:'run',phase:3,reduceMotion:true}),{step:0,lift:0});}
 for(const f of[-999,99,NaN])assert.ok(Object.values(michiChoreography({land:Infinity,atk:NaN,brake:NaN},f)).every(v=>typeof v!=='number'||Number.isFinite(v)));
});
