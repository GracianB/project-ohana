import test from "node:test";
import assert from "node:assert/strict";
import { drawEvoCine, EVO_CINE_DURATION } from "../systems/evo-cine/chispin.js";
globalThis.Path2D=class {moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}closePath(){}ellipse(){}arc(){}};
function mock(){const calls={grad:0,text:[]};const c=new Proxy({},{get:(o,k)=>{if(k==="createLinearGradient"||k==="createRadialGradient")return()=>{calls.grad++;return{addColorStop(){}}};if(k==="fillText")return(s)=>calls.text.push(s);if(k in o)return o[k];return()=>{}},set:(o,k,v)=>(o[k]=v,true)});return{c,calls};}
test("duración 3.5-4.5s", () => { assert.ok(EVO_CINE_DURATION >= 3.5 && EVO_CINE_DURATION <= 4.5); });
test("las tres fases dibujan sin gradientes ni Pika/GOD", () => {
  const { c, calls } = mock();
  for (let t = 0; t <= EVO_CINE_DURATION; t += 0.1) drawEvoCine(c, 960, 540, t, 4, 5);
  assert.equal(calls.grad, 0);
  assert.ok(calls.text.length > 0);
  assert.ok(!calls.text.some((s) => /pika|god/i.test(s)));
});
