import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ABILITY_DEFS } from "../systems/abilities.js";
import { ABILITY_DEFS as CATALOG } from "../systems/ability-catalog.js";
import { SUPREME_STORYBOARDS } from "../systems/supreme-storyboards.js";
import { drawBossFallScene } from "../systems/boss-fall-scene.js";
test("V86 OHANA welcome and no Atrium wires",()=>{
 const intro=fs.readFileSync("systems/intro.js","utf8");
 const css=fs.readFileSync("atrium-interact.css","utf8");
 const atrium=fs.readFileSync("systems/atrium-interact.js","utf8");
 assert.ok(intro.includes("<strong>OHANA</strong>"));
 assert.ok(intro.includes('id === "cuerno" ? .48 : 1'));
 assert.ok(!atrium.includes("lineTo(b.x, b.y)"));
 assert.ok(css.includes("intro-playing #atrium-fx"));
});
test("V86 each U has a genuinely readable multi-beat duration",()=>{
 assert.equal(Object.keys(SUPREME_STORYBOARDS).length,10);
 for(const [id,s] of Object.entries(SUPREME_STORYBOARDS)){
  assert.ok(s.duration>=4.8&&s.duration<=6.4,id);
  assert.ok(s.beat.includes("→"),id);
 }
});
test("V86 power metadata is shared with battle engine and HUD",()=>{
 assert.equal(ABILITY_DEFS,CATALOG);
 assert.equal(Object.keys(ABILITY_DEFS).length,30);
 assert.equal(CATALOG.gallop.key,"K");
});
test("V86 boss finale opens wings, never placeholder concentric circles",()=>{
 const game=fs.readFileSync("game.js","utf8");
 assert.ok(game.includes("drawBossFallScene(ctx, f"));
 assert.ok(game.includes("!game.finale || !e.boss"));
 const calls=[];
 const ctx=new Proxy({}, {get(o,k){if(k in o)return o[k];if(k==="createLinearGradient")return()=>({addColorStop(){}});return(...a)=>calls.push([k,...a]);},set(o,k,v){o[k]=v;return true;}});
 drawBossFallScene(ctx,{t:200,max:520,x:400,y:260},{x:0,y:0},{w:1280,h:720},false);
 assert.equal(calls.some(c=>c[0]==="arc"),false);
 assert.ok(calls.some(c=>c[0]==="bezierCurveTo"));
});
test("V86 every new module is offline cached",()=>{
 const sw=fs.readFileSync("sw.js","utf8"),html=fs.readFileSync("index.html","utf8");
 assert.ok(sw.includes('const VERSION = "ohana-286"'));
 for(const p of ["ability-catalog","boss-fall-scene"])assert.ok(sw.includes('systems/'+p+'.js?v='));
 assert.ok(html.includes("ohana-286"));
});
