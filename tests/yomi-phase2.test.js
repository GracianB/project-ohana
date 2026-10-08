import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const abilities=fs.readFileSync("systems/abilities.js","utf8")+"\n"+fs.readFileSync("systems/ability-catalog.js","utf8");
const art=fs.readFileSync("characters/art/yomi.js","utf8");
const cinema=fs.readFileSync("systems/supreme-cinema.js","utf8");
const storyboards=fs.readFileSync("systems/supreme-storyboards.js","utf8");
const browser=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
const e2e=fs.readFileSync("tests/browser/e2e.mjs","utf8");

test("V58 K has evolved into a global ringing judgment and mark",()=>{
  assert.match(abilities,/name: "Campanada del Umbral"/);
  assert.match(abilities,/enemies=\(g\.enemies \|\| \[\]\)\.filter\(canHit\)/);
  assert.match(abilities,/e\._yomiMarkUntil=Math\.max/);
  assert.match(abilities,/Campanada del Umbral/);
  assert.match(art,/Campanada: Yomi holds its lantern heart aloft/);
});

test("V57 L has a readable windup and strikes at visible jaw closure",()=>{
  assert.match(abilities,/name: "Mordida lunar"/);
  assert.match(abilities,/const strikeFrame = Math\.ceil\(f\.max \* \.55\)/);
  assert.match(abilities,/if \(f\.life === strikeFrame\)/);
  assert.match(abilities,/Math\.abs\(dx\) < 120 && Math\.abs\(dy\) < 54/);
  assert.match(abilities,/L: first show the exact 120 × 108 front hit region/);
  assert.match(abilities,/const reach=120,halfH=54/);
  assert.match(art,/The L bite grows from Yomi's expression/);
});

test("V57 five evolutions change the actual silhouette",()=>{
  for(const marker of [
    "F0: squat glowing seed","F1: tall wanderer","F2: winged ward",
    "F3: angular night knight","F4: double-crescent moon guardian"
  ])assert.ok(art.includes(marker),"Missing evolution architecture: "+marker);
  assert.match(art,/if\(f===0\)/);
  assert.match(art,/else if\(f===1\)/);
  assert.match(art,/else if\(f===2\)/);
  assert.match(art,/else if\(f===3\)/);
  assert.match(art,/if\(f===4\)/);
});

test("V57 all U stories are readable and Cuerno assists Yomi for the full sequence",()=>{
  assert.match(storyboards,/yomi:.*duration:6\.25/);
  assert.match(storyboards,/FAROL → CUERNO → EMBESTIDA → JUICIO/);
  assert.match(cinema,/Math\.max\(4\.8,story\.duration\)/);
  assert.match(cinema,/inK=easeOut\(seg\(k,\.27,\.41\)\)/);
  assert.match(cinema,/outK=1-easeOut\(seg\(k,\.91,1\)\)/);
  assert.match(abilities,/if \(\(flow\.assist \|\| p\.id === "yomi"\) && def\.ally\)/);
  assert.match(abilities,/life: p\.id === "yomi" \? 240 : 96/);
  assert.match(cinema,/ally\.id==="cuerno"\?"CUERNO · COMPAÑERO"/);
  assert.match(browser,/09e-yomi-k-visible-suction/);
  assert.match(browser,/09f-yomi-l-visible-jaws/);
  assert.match(browser,/yomiSupreme\.duration >= 3800/);
  assert.match(e2e,/item\.duration >= 4800 && item\.duration <= 6500/);
});
