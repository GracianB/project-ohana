import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const atrium=read("systems/atrium-interact.js");
const title=read("systems/title.js");
const ending=read("systems/ending.js");
const game=read("game.js");
const visual=read("tests/browser/visual-regression.mjs");

test("V82 Atrium truly stops scheduling frames during gameplay/background",()=>{
  assert.match(atrium,/function frame\(now\)\s*\{\s*fxRaf = 0/);
  assert.match(atrium,/document\.body\.classList\.contains\("playing"\)[\s\S]*?document\.visibilityState === "hidden"\) return;/);
  assert.match(atrium,/document\.addEventListener\("visibilitychange", resumeFx\)/);
  assert.match(atrium,/new MutationObserver\(resumeFx\)\.observe\(document\.body/);
  assert.match(atrium,/fxRaf = requestAnimationFrame\(frame\)/);
  assert.doesNotMatch(atrium,/\}\)\(0\);\s*\}\s*$/);
});

test("V82 Atrium computes geometry once per painted frame",()=>{
  assert.match(atrium,/const centers = list\.map\(center\)/);
  assert.match(atrium,/const a = centers\[i\]/);
  assert.match(atrium,/const b = centers\[\(i \+ 1\) % list\.length\]/);
  assert.match(atrium,/centers\[list\.indexOf\(awake\)\]/);
  assert.match(atrium,/centers\[list\.indexOf\(sel\)\]/);
});

test("V82 portrait metadata only changes when the form or pose changes",()=>{
  assert.match(title,/if \(cv\._fitStamp !== fitStamp\)/);
  assert.match(title,/if \(cv\.dataset\.cuernoState !== showcasePose\)/);
  assert.match(title,/if \(cv\.dataset\.stitchoBeat !== stitchoBeat\)/);
  assert.match(title,/if \(card\.hasAttribute\("data-cuerno-state"\)\)/);
});

test("V82 finale handles resizes, removes handlers and survives two victories",()=>{
  assert.match(ending,/const onResize=\(\)=>\{if\(!done&&!complete\)\{fc\.resize\(\);lastPaint=0;\}\}/);
  assert.match(ending,/addEventListener\("resize",onResize/);
  assert.match(ending,/removeEventListener\("resize",onResize\)/);
  assert.match(ending,/layer\.onkeydown=\(e\)=>/);
  assert.doesNotMatch(ending,/layer\.addEventListener\("keydown"/);
  assert.match(visual,/nueva victoria no admite salto por teclado/);
  assert.match(ending,/const duration=reduce\?1\.6:12\.0/);
  assert.match(ending,/const titleK=seg\(k,\.84,\.92\)/);
  assert.match(game,/endingOverlay\?\.classList\.contains\("cinema-running"\)/);
  assert.match(game,/endingOverlay\.querySelector\("\.win-skip"\)\?\.click\(\)/);
});
