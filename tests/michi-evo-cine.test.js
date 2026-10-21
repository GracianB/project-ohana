import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { drawEvoCine, EVO_CINE_DURATION } from "../systems/evo-cine/michi.js";
function mock(){const calls={grad:0,text:[]};const c=new Proxy({},{get:(o,k)=>{if(k==="createLinearGradient"||k==="createRadialGradient")return()=>{calls.grad++;return{addColorStop(){}}};if(k==="fillText"||k==="strokeText")return(s)=>calls.text.push(String(s));if(k==="measureText")return()=>({width:10});if(k in o)return o[k];return()=>{}},set:(o,k,v)=>(o[k]=v,true)});return{c,calls};}
test("michi evo-cine: duración 3.5-4.5 s", () => { assert.ok(EVO_CINE_DURATION >= 3.5 && EVO_CINE_DURATION <= 4.5); });
test("michi evo-cine: dibuja todas las fases y formas sin gradientes ni GOD", () => {
  for (const [a, b] of [[1, 2], [2, 3], [3, 4], [4, 5]]) {
    const { c, calls } = mock();
    for (let t = 0; t <= EVO_CINE_DURATION; t += 0.05) drawEvoCine(c, 960, 540, t, a, b);
    assert.equal(calls.grad, 0);
    assert.ok(calls.text.some((s) => s.includes("Forma " + a + " → " + b)));
    assert.ok(!calls.text.some((s) => /god/i.test(s)));
  }
  const { c, calls } = mock(); drawEvoCine(c, 960, 540, 3.6, 4, 5);
  assert.ok(calls.text.some((s) => s.includes("Michicornio Eclipse")));
});
test("michi evo-cine: sin gradientes ni Math.random en el código", () => {
  const src = readFileSync(new URL("../systems/evo-cine/michi.js", import.meta.url), "utf8");
  assert.doesNotMatch(src, /create(Linear|Radial)Gradient|Math\.random/);
});
