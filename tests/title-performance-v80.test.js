import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const title=read("systems/title.js"),fx=read("systems/title-fx.js");
const ending=read("systems/ending.js"),css=read("title-stage.css");
const finalCss=read("ending.css"),sw=read("sw.js"),page=read("index.html");

test("V80: active hero stays at full animation while side previews are throttled",()=>{
 for(const s of [
  "SIDE_PREVIEW_INTERVAL_MS = 120",
  "!hero && !cv._needsFit && now - (cv._lastPaintAt || 0)",
  "if (cv._needsFit === false) return",
  "new ResizeObserver(",
  "const visible = [id, prev, next]",
  "cv._labelEvo !== evo || cv._labelHero !== hero",
  "document.visibilityState === \"hidden\""
 ])assert.ok(title.includes(s),"missing: "+s);
 assert.ok(!title.includes("const visible = [id, prev, next, prev2, next2]"));
});
test("V80: fullscreen background has lower DPR and frame cadence",()=>{
 assert.ok(fx.includes("maxDpr=pixels>1400000?1.12:1.25"));
 assert.ok(fx.includes("now-lastFrame<75"));
 assert.ok(fx.includes("document.visibilityState===\"hidden\""));
 assert.match(css,/#char-select #chars \.portrait canvas\{[^}]*filter:none/);
 assert.match(css,/#char-select #chars \.char-card\.is-prev,#char-select #chars \.char-card\.is-next\{[^}]*filter:none/s);
});
test("V80: full family scene comes before the epilogue results card",()=>{
 for(const s of [
  "const duration=reduce?1.6:10.2",
  "now-lastPaint<41",
  "if(k>=.77)",
  "const titleK=seg(k,.88,.97)",
  "if(k>=1){revealResults();return;}",
  'layer.querySelector(".win-skip").onclick=()=>revealResults()',
  'layer.dataset.resultsAt=String(Math.round(duration*1000))'
 ])assert.ok(ending.includes(s),"missing: "+s);
 assert.ok(finalCss.includes("#win-cinema.cinema-running .win-card{visibility:hidden"));
 assert.ok(finalCss.includes("#win-cinema.cinema-complete .win-card{visibility:visible"));
});
test("V80: offline cache and HTML asset versions agree",()=>{
 assert.ok(sw.includes('const VERSION = "ohana-279"'));
 assert.ok(!page.includes("ohana-278"));
 assert.ok(page.includes("title-stage.css?v=ohana-279"));
});
