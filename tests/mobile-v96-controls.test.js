import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("V96 keeps every real mobile control, not just a screenshot of buttons",()=>{
 const html=fs.readFileSync("index.html","utf8");
 for(const key of ["a","d","s","e","j","k","l","u","h","shift"," "]){
  assert.ok(html.includes('data-k="'+key+'"'),'Touch binding missing: '+key);
 }
 const js=fs.readFileSync("engine/input.js","utf8");
 assert.match(js,/touch/i);
});
test("V96 phone-first layout uses safe-area and bounded controls",()=>{
 const css=fs.readFileSync("mobile-v96.css","utf8");
 assert.match(css,/@media \(max-width: 420px\) and \(orientation: portrait\)/);
 assert.match(css,/@media \(max-height: 450px\) and \(orientation: landscape\)/);
 assert.match(css,/safe-area-inset-right/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.match(css,/pointer-events: auto/);
 assert.match(css,/touch-action: none/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/prefers-reduced-motion/);
 assert.doesNotMatch(css,/display:\s*none\s*!important|pointer-events:\s*none\s*!important/);
});
test("V96 mobile override loads after primary CSS and precaches for Pages",()=>{
 const html=fs.readFileSync("index.html","utf8");
 const sw=fs.readFileSync("sw.js","utf8");
 assert.match(sw,/const VERSION = "ohana-296"/);
 assert.match(html,/mobile-v96\.css\?v=ohana-296/);
 assert.match(sw,/\.\/mobile-v96\.css\?v=" \+ VERSION/);
 const world=html.indexOf("world-map.css?v=ohana-296");
 const mobile=html.indexOf("mobile-v96.css?v=ohana-296");
 assert.ok(world>0 && mobile>world);
 const index=html.indexOf('<div id="touch"');
 assert.ok(index>0);
 assert.match(html,/role="group" aria-label="Controles táctiles"/);
});
