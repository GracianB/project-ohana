import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { evolutionTiming } from "../systems/evolution-timing.js";

const read=file=>fs.readFileSync(file,"utf8");

test("V80 carousel: three painted candidates, neighbours budgeted and no continuous Canvas resize",()=>{
  const src=read("systems/title.js");
  assert.match(src,/CAROUSEL_FRAME_BUDGET = Object\.freeze\(\{ activeStep: 2, neighbourStep: 6, maxAnimated: 3 \}\)/);
  assert.match(src,/if \(!hero && !neighbour\)/);
  assert.match(src,/document\.hidden/);
  assert.match(src,/intro-complete/);
  assert.match(src,/if \(!cv\._sizeDirty && cv\._dpr\) return/);
  assert.match(src,/cv\._lastPaintTick/);
  assert.match(src,/cv\._lastRoleText !== roleText/);
  assert.match(src,/cv\._lastRailKey !== railKey/);
  assert.match(src,/cv\._lastPaintKey !== paintKey/);
  assert.match(src,/visibilitychange/);
  assert.ok(src.indexOf("if (!hero && !neighbour)") < src.indexOf("fitCanvas(cv);"),
    "Do not measure/render an invisible character");
});

test("V80 compositing: expensive live Canvas filters and moving glass are gone",()=>{
 const css=read("title-stage.css");
 const ending=read("ending.css");
 assert.match(css,/#char-select #chars \.portrait canvas,[\s\S]*?filter:none!important/);
 assert.match(css,/transition:transform \.34s [^;]+opacity \.28s ease!important/);
 assert.match(css,/backdrop-filter:none!important/);
 assert.match(ending,/#win-cinema\.cinema-running \.win-card/);
 assert.match(ending,/visibility:hidden!important/);
 assert.match(ending,/#win-cinema\.cinema-complete \.win-card/);
});

test("V80 evolution finale: late title and longer hero hold without slowing reduced-motion",()=>{
 const normal=evolutionTiming({finalForm:false});
 const full=evolutionTiming({finalForm:true});
 const reduced=evolutionTiming({finalForm:true,reduced:true});
 assert.ok(full.reveal>=3.05,"Final form must emerge after the buildup");
 assert.ok(full.end>=6.4 && full.out-full.reveal>=2.5);
 assert.ok(full.end>normal.end*3);
 assert.ok(reduced.end<1.6,"Accessibility must stay concise");
 const source=read("systems/evo-cinema.js");
 assert.match(source,/titleWait=finalForm && !reduce \? \.65/);
 assert.match(source,/now-lastPaint < \(reduce\?1000\/12:1000\/30\)/);
 assert.match(source,/this\.list\.length >= 128/);
 assert.match(source,/1\.25 : pixels > 1000000 \? 1\.4 : 1\.5/);
});

test("V80 final ending: family reveal precedes title and results, scene budget stays finite",()=>{
 const js=read("systems/ending.js");
 assert.match(js,/duration=reduce\?1\.6:9\.6/);
 assert.match(js,/const titleK=seg\(k,\.80,\.94\)/);
 assert.match(js,/frameMs=reduce\?1000\/12:1000\/30/);
 assert.match(js,/phase!==shownPhase/);
 assert.match(js,/layer\.dataset\.finaleBeat="results"/);
 assert.match(js,/layer\.querySelector\("\.win-skip"\)\.onclick=\(\)=>revealResults\(\)/);
});

test("V80 offline cache versions match, keeping both Dino/Cuerno combat modules",()=>{
 const sw=read("sw.js");
 const html=read("index.html");
 assert.match(sw,/const VERSION = "ohana-279"/);
 assert.doesNotMatch(html,/ohana-278/);
 assert.match(html,/style\.css\?v=ohana-279/);
 assert.match(sw,/systems\/dino-combat\.js\?v=/);
 assert.match(sw,/systems\/dino-ultimate-film\.js\?v=/);
 assert.match(sw,/characters\/art\/cuerno\.js\?v=/);
});
