import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { yomiRitualState } from "../characters/art/yomi.js";
import { fritaFootwork } from "../characters/art/frita.js";
import { pizzaMomentum } from "../characters/art/pizza.js";
import { dragonMomentum } from "../characters/art/dragon.js";
import { dinoHiccupState } from "../characters/art/dino.js";
import { cuernoFootstepState } from "../characters/art/cuerno.js";

const features=[
  ["Yomi",()=>yomiRitualState({state:"idle",flourish:.5,flourishN:2}),()=>yomiRitualState({state:"idle",flourish:.5,flourishN:2,reduceMotion:true})],
  ["Frita",()=>fritaFootwork({state:"run",speed:1,land:1}),()=>fritaFootwork({state:"run",speed:1,land:1,reduceMotion:true})],
  ["Pizza",()=>pizzaMomentum({state:"run",speed:1,land:1}),()=>pizzaMomentum({state:"run",speed:1,land:1,reduceMotion:true})],
  ["Dragón",()=>dragonMomentum({state:"run",speed:1,land:1}),()=>dragonMomentum({state:"run",speed:1,land:1,reduceMotion:true})],
  ["Dino",()=>dinoHiccupState({state:"idle",flourish:.5,flourishN:3}),()=>dinoHiccupState({state:"idle",flourish:.5,flourishN:3,reduceMotion:true})],
  ["Cuerno",()=>cuernoFootstepState({state:"run",speed:1,land:1},4),()=>cuernoFootstepState({state:"run",speed:1,land:1,reduceMotion:true},4)],
];

test("Reduced-motion preference disables each of the six newly added character extras",()=>{
  for(const [id,enabled,disabled] of features) {
    assert.ok(enabled(),id+": ordinary motion should remain expressive");
    assert.equal(disabled(),null,id+": reduced motion must disable cosmetic extras");
  }
});

test("OS media-query is cached, not re-created per frame",()=>{
  for(const id of ["yomi","frita","pizza","dragon","dino","cuerno"]){
    const art=fs.readFileSync("characters/art/"+id+".js","utf8");
    assert.match(art,/prefers-reduced-motion: reduce/,id+": missing system preference");
    assert.ok((art.match(/window\.matchMedia\(/g)||[]).length<=1,id+": querying browser for every frame");
  }
});
