import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const title=read("systems/title.js"),css=read("title-stage.css");
const ending=read("systems/ending.js"),cinema=read("systems/evo-cinema.js");
const browser=read("tests/browser/e2e.mjs"),visual=read("tests/browser/visual-regression.mjs");
const sw=read("sw.js"),index=read("index.html");

test("V81 fixes CSS order, NOT just early V80 rules overridden later",()=>{
 const i=css.lastIndexOf("V81 · RENDERING CONTRACT");
 assert.ok(i>css.indexOf("V47B · SELECTOR PERFORMANCE"),"V81 must be last");
 const final=css.slice(i);
 assert.match(final,/#char-select:not\(\.atrium-on\) #chars \.char-card\.is-prev2,[\s\S]*?display:none!important/);
 assert.match(final,/\.char-card\.selected\[data-evo="4"\] \.portrait canvas\{\s*filter:none!important/);
 assert.match(final,/\.char-card\.is-prev,[\s\S]*?will-change:transform,opacity/);
 assert.match(final,/backdrop-filter:none!important/);
 assert.doesNotMatch(final,/drop-shadow\(|blur\(1[0-9]px\)/);
});

test("V81 Canvas memory: only three live cards and one DPR for side previews",()=>{
 assert.match(title,/const visible = true/);
 assert.match(title,/canvas\.width = 1;\s*canvas\.height = 1;/);
 assert.match(title,/const sidePreview = !cv\.closest\("\.char-card"\)\?\.classList\.contains\("selected"\)/);
 assert.match(title,/Math\.min\(sidePreview \? 1 : maxDpr, window\.devicePixelRatio \|\| 1\)/);
 assert.match(title,/SIDE_PREVIEW_INTERVAL_MS = 120/);
 assert.match(browser,/offscreenBuffers/);
 const atrium=read("systems/atrium-interact.js");
 const atriumCss=read("atrium-interact.css");
 assert.match(atrium,/ATRIUM_FRAME_INTERVAL_MS = 65/);
 assert.match(atrium,/pointerPending = true/);
 assert.match(atrium,/document\.body\.classList\.contains\("playing"\)/);
 assert.match(atriumCss,/#char-select\.atrium-on #chars \.char-card\.selected,[\s\S]*?filter:none!important/);
 assert.match(browser,/assert\.equal\(carouselAudit\.canvasFilter,'none'/);
 assert.match(visual,/assert\.equal\(titleLayout\.visible\.length, 10/);
});

test("V81 finale extends reunion and caps ONLY its full-screen canvas",()=>{
 assert.match(cinema,/export function fullCanvas\(cv, dprCap = Infinity\)/);
 assert.match(cinema,/Math\.min\(maxDpr, dprCap, window\.devicePixelRatio \|\| 1\)/);
 assert.match(ending,/fullCanvas\(canvas,reduce\?1:1\.2\)/);
 assert.match(ending,/const duration=reduce\?1\.6:14\.5/);
 assert.match(ending,/const titleK=seg\(k,\.89,\.97\)/);
 assert.match(ending,/layer\.dataset\.ending="v100-special-single-ending"/);
 assert.match(ending,/layer\.dataset\.pacing="v80-delayed-finale"/);
 assert.match(ending,/layer\.querySelector\("\.win-skip"\)\.onclick=\(\)=>revealResults/);
});

test("V81 offline cache and live HTML references are identical",()=>{
 const match=sw.match(/const VERSION = "(ohana-\d+)"/);
 assert.ok(match,"versioned Service Worker required");
 const version=match[1];
 assert.match(version,/^ohana-\d+$/);
 assert.ok(index.includes("title-stage.css?v="+version));
 assert.ok([...index.matchAll(/ohana-\d+/g)].every(m=>m[0]===version),
   "HTML and Service Worker reference different revisions");
});
