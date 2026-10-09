import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { bossFallStage } from "../systems/boss-fall-scene.js";
import { ROSTER } from "../characters/roster.js";

test("V100 Especial: roster íntegro, accesible, sin carrusel activo",()=>{
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
  const css=fs.readFileSync(new URL("../v100-special.css",import.meta.url),"utf8");
  const code=fs.readFileSync(new URL("../systems/title.js",import.meta.url),"utf8");
  assert.equal(ROSTER.length,10);
  assert.match(html,/data-selector-mode="family-grid"/);
  assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(code,/const visible = true/);
  assert.match(code,/el\.setAttribute\("aria-pressed", String\(selected\)\)/);
  assert.doesNotMatch(html,/id="roster-next"/);
});
test("V100 Especial: boss no desaparece antes del estallido",()=>{
  const sample=(k)=>bossFallStage({t:Math.round(210*(1-k)),max:210});
  assert.equal(sample(0).queenVisible,true);
  assert.equal(sample(.25).queenVisible,true);
  assert.equal(sample(.40).queenVisible,false);
  assert.ok(sample(.65).burst>.5);
  assert.ok(sample(.99).dust<.1);
});
test("V100 Especial: una sola película tras muerte y precarga consistente",()=>{
  const game=fs.readFileSync(new URL("../game.js",import.meta.url),"utf8");
  const ending=fs.readFileSync(new URL("../systems/ending.js",import.meta.url),"utf8");
  const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");
  assert.match(game,/t: 210,\s*max: 210/);
  assert.match(game,/game\.finale && \(!e\.boss \|\| !fall\.queenVisible\)/);
  assert.match(ending,/EL NIDO SE ABRE/);
  assert.doesNotMatch(ending,/drawTitle\(ctx,"LA REINA CAE"/);
  assert.match(sw,/v100-special\.css/);
});
