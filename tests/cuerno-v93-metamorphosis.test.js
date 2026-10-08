import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { CUERNO_V93_NAMES, CUERNO_V93_COLORS,
  cuernoMetamorphosisCues, drawCuernoMetamorphosis } from "../systems/cuerno-v93-metamorphosis.js";
import {evolutionTiming} from "../systems/evolution-timing.js";

function recordingCanvas(){
 const events=[],state={stack:0,globalAlpha:1};
 const ctx=new Proxy(state,{get(target,key){
   if(key==="save")return()=>{target.stack++;events.push("save");};
   if(key==="restore")return()=>{target.stack--;events.push("restore");};
   if(key in target)return target[key];
   return(...args)=>{
     for(const val of args)if(typeof val==="number")
       assert.ok(Number.isFinite(val),"NaN Canvas coordinate: "+String(key));
     events.push([key,...args]);
   };
 },set(target,key,v){target[key]=v;return true;}});
 return {ctx,events,state};
}
test("V93 canon: horn→face→four hooves→wings→aurora; no extra form",()=>{
 assert.equal(CUERNO_V93_NAMES.length,5);
 assert.equal(CUERNO_V93_COLORS.length,7);
 assert.match(CUERNO_V93_NAMES[1],/rostro/);
 assert.match(CUERNO_V93_NAMES[2],/pasos/);
 assert.match(CUERNO_V93_NAMES[3],/volar/);
 assert.match(CUERNO_V93_NAMES[4],/Aurora/);
 assert.ok(Object.isFrozen(CUERNO_V93_COLORS));
});
test("V93 ritual follows the real timelines and has a reduced-motion still frame",()=>{
 for(const finalForm of [false,true]){
  for(const reduced of [false,true]){
   const T=evolutionTiming({reduced,finalForm});
   const before=cuernoMetamorphosisCues(4,T.charge-.1,T,reduced);
   const after=cuernoMetamorphosisCues(4,T.reveal+.6,T,reduced);
   assert.equal(before.entrance,0);
   assert.ok(after.born>.9);
   assert.ok(after.opacity>0);
   if(reduced){assert.equal(after.sway,0);assert.equal(after.phase,0);}
  }
 }
});
test("V93 four metamorphoses are distinct, Canvas-balanced and bounded",()=>{
 const T=evolutionTiming({finalForm:true});
 const fingerprints=[];
 for(let evo=1;evo<=4;evo++){
  const rec=recordingCanvas();
  drawCuernoMetamorphosis(rec.ctx,{
   evo,t:T.reveal+.7,timing:T,cx:240,cy:220,target:180,fade:1,
  });
  assert.equal(rec.state.stack,0,"Canvas state leak in form "+evo);
  assert.ok(rec.events.length>8,"Missing visual ritual "+evo);
  assert.ok(rec.events.length<160,"Excess geometry "+evo);
  fingerprints.push(rec.events.filter(e=>Array.isArray(e)).map(e=>e[0]).join(","));
 }
 assert.equal(new Set(fingerprints).size,4,"All evolutions look alike");
});
test("V93 reduced motion ignores elapsed time and skips invalid viewport values",()=>{
 const T=evolutionTiming({reduced:true,finalForm:true});
 const a=recordingCanvas(),b=recordingCanvas();
 const cfg={evo:4,timing:T,cx:320,cy:190,target:180,fade:.9,reduce:true};
 drawCuernoMetamorphosis(a.ctx,{...cfg,t:T.reveal+.6});
 drawCuernoMetamorphosis(b.ctx,{...cfg,t:T.reveal+1});
 assert.deepEqual(a.events,b.events);
 assert.equal(a.state.stack,0);
 const bad=recordingCanvas();
 drawCuernoMetamorphosis(bad.ctx,{...cfg,cx:Infinity});
 drawCuernoMetamorphosis(bad.ctx,{...cfg,target:-12});
 assert.equal(bad.events.length,0);
});
test("V93 production graph precaches ritual; Dino V90 and Cuerno V92 retained",()=>{
 const sw=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 const evo=fs.readFileSync("systems/evo-cinema.js","utf8");
 assert.match(sw,/const VERSION = "ohana-293"/);
 assert.match(html,/ohana-293/);
 assert.match(sw,/systems\/cuerno-v93-metamorphosis\.js\?v=/);
 assert.match(evo,/drawCuernoMetamorphosis/);
 assert.match(fs.readFileSync("systems/abilities.js","utf8"),/cuernoPrismEcho/);
 assert.match(fs.readFileSync("systems/dino-stagecraft.js","utf8"),/dino/i);
});
