import test from "node:test";
import assert from "node:assert/strict";
import art, {cuernoExpression} from "../characters/art/cuerno-v373.js";

test("Cuerno: rig blink, curiosity and shy expression reach the renderer", () => {
  assert.equal(cuernoExpression({blink:1}).blink,1);
  assert.ok(cuernoExpression({state:"idle",t:225}).blink>.9);
  assert.equal(cuernoExpression({cuernoBeat:"curious"}).wonder,true);
  assert.equal(cuernoExpression({cuernoBeat:"shy"}).shy,true);
  assert.equal(cuernoExpression({state:"victory"}).happy,true);
  assert.equal(cuernoExpression({cuernoWelcome:{wonder:.8}}).wonder,true);
  for (const state of ["dead","hurt"]) {
    const face=cuernoExpression({state,cuernoBeat:"prance",blink:1,cuernoWelcome:{wonder:1}});
    assert.equal(face.happy,false);assert.equal(face.wonder,false);assert.equal(face.blink,0);assert.equal(face.tilt,0);
  }
});

function trace(pose) {
  const ops=[],alphas=[];let depth=0;
  const ctx=new Proxy({globalAlpha:1},{get(o,k){
    if(k in o)return o[k];
    if(k==="save")return()=>{alphas.push(o.globalAlpha);depth++};
    if(k==="restore")return()=>{assert.ok(depth>0);o.globalAlpha=alphas.pop();depth--};
    if(k.startsWith("create"))return()=>{throw Error("gradient in Cuerno")};
    return(...args)=>{for(const v of args)if(typeof v==="number")assert.ok(Number.isFinite(v));ops.push([k,...args])};
  },set(o,k,v){o[k]=v;ops.push([k,v]);return true}});
  art.draw(ctx,pose,{});assert.equal(depth,0);assert.equal(ctx.globalAlpha,1);return ops;
}
test("Cuerno: all five forms preserve canvas state, and reduced motion freezes idle geometry",()=>{
  for(let form=0;form<5;form++) {
    for(const state of ["idle","run","jump","attack","cast","victory","hurt","dead"])
      trace({form,state,t:90,atk:.5});
    assert.deepEqual(trace({form,state:"idle",t:10,reduceMotion:true}),trace({form,state:"idle",t:140,reduceMotion:true}));
    assert.notDeepEqual(trace({form,state:"idle",t:10,blink:0}),trace({form,state:"idle",t:10,blink:1}));
  }
});
