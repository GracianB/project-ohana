import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("V99 finale results wait for the complete family reveal",()=>{
 const js=fs.readFileSync("systems/ending.js","utf8");
 const css=fs.readFileSync("ending.css","utf8");
 assert.match(js,/const duration=reduce\?1\.6:14\.5/);
 assert.match(js,/if\(k>=1\)\{revealResults\(\);return;\}/);
 assert.match(js,/const titleK=seg\(k,\.89,\.97\)/);
 assert.match(css,/#win-cinema\.cinema-running \.win-card\{visibility:hidden;pointer-events:none/);
 assert.match(css,/#win-cinema\.cinema-complete \.win-card\{visibility:visible;pointer-events:auto/);
 assert.doesNotMatch(css,/#win-cinema\.ending-phase-2 \.win-card/);
 assert.doesNotMatch(css,/#win-cinema\.ending-phase-3 \.win-card/);
});
test("V99 skip remains separate; result panel inactive for screen readers until end",()=>{
 const js=fs.readFileSync("systems/ending.js","utf8");
 const skip=js.indexOf('class="win-skip"'),card=js.indexOf('class="win-card"');
 assert.ok(skip>=0&&card>skip,"Skip button must remain outside inert card");
 assert.match(js,/card\.inert=true;/);
 assert.match(js,/card\.setAttribute\("aria-hidden","true"\)/);
 assert.match(js,/card\.inert=false;/);
 assert.match(js,/card\.setAttribute\("aria-hidden","false"\)/);
 assert.match(js,/querySelector\("#win-continue"\)\?\.focus/);
 assert.match(js,/Cinemática final de OHANA/);
});
test("V99 title carousel no longer draws a random bridge across the sky",()=>{
 const css=fs.readFileSync("title-stage.css","utf8");
 assert.match(css,/#char-select \.hero-stage::after \{ display: none !important; \}/);
 assert.match(css,/#char-select \.hero-stage::before/);
});
test("V99 Pages assets and release ledger share one version",()=>{
 const sw=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 const progress=fs.readFileSync("PROGRESS.md","utf8");
 const version=sw.match(/const VERSION = "(ohana-[0-9]+)"/)?.[1];
 assert.ok(version && Number(version.slice(6))>=299);
 assert.ok(html.includes(version));
 assert.ok(progress.includes(version));
 assert.match(sw,/render-v98-culling/);
 assert.match(sw,/a11y-v97/);
});
