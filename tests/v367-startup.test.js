import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync("index.html","utf8");
const intro=fs.readFileSync("systems/intro.js","utf8");
const kit=fs.readFileSync("systems/cinema-kit.js","utf8");
const evo=fs.readFileSync("systems/evo-cinema.js","utf8");
const loader=fs.readFileSync("systems/cinema-loader.js","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const current=sw.match(/const VERSION = "(ohana-\d+)"/)?.[1];

test("V367: only active menu/game scripts execute during first paint",()=>{
 const scripts=[...html.matchAll(/<script type="module" src="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(scripts.length,6);
 assert.equal(scripts[0],"systems/cinema-loader.js?v="+current);
 for(const rare of ["evo-cinema.js","supreme-cinema.js","ending.js","title-fx.js","atrium-interact.js"]){
   assert.ok(!scripts.some(s=>s.endsWith(rare+"?v="+current)),rare+" eagerly loads");
 }
 assert.match(html,/data-selector-mode="family-grid"/);
 assert.match(intro,/from "\.\/cinema-kit\.js"/);
 assert.doesNotMatch(intro,/from "\.\/evo-cinema\.js"/);
 assert.match(kit,/export function drawDummy/);
 assert.match(kit,/export class Particles/);
 assert.match(evo,/from "\.\/cinema-kit\.js"/);
 assert.match(evo,/export \{[^}]+drawDummy[^}]+\} from "\.\/cinema-kit\.js"/);
 assert.match(evo,/export function playEvolution/);
});
test("V367: exact original authored cinema handlers are loaded only on event",()=>{
 for(const [event,resource,api] of [
   ["ohana-evolve","./evo-cinema.js","mod.playEvolution"],
   ["ohana-win","./ending.js","mod.showEnding"],
   ["ohana-supreme","./supreme-cinema.js","mod.supremeCinema.play"]
 ]){
   assert.ok(loader.includes('installLazyCinema("'+event+'","'+resource+'",mod=>'+api+')'));
 }
 assert.match(loader,/if\(window\[boundFlags\[eventName\]\]\)/);
 assert.match(loader,/for\(const detail of pending\.splice\(0\)\)play\(detail\)/);
 assert.doesNotMatch(loader,/fetch\(|sendBeacon|\.netlify\/functions|setInterval/);
});
test("V367: all new runtime modules survive offline service-worker activation",()=>{
 assert.ok(current&&Number(current.slice(6))>=367);
 for(const path of ["systems/cinema-kit.js","systems/cinema-loader.js","systems/evo-cinema.js","systems/supreme-cinema.js","systems/ending.js"]){
   assert.ok(sw.includes('"./'+path+'?v=" + VERSION'),path+" must be precached");
 }
 assert.ok([...html.matchAll(/ohana-\d+/g)].every(x=>x[0]===current));
});
