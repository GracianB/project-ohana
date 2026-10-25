import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ROSTER} from "../characters/roster.js";
import {WELCOME_CAST_ORDER,welcomeCastSpot,welcomeActorFit} from "../systems/intro-cast-fit.js";

test("Opening optical V343: complete ten-hero cast, no aliases or duplicate positions",()=>{
  assert.equal(WELCOME_CAST_ORDER.length,10);
  assert.equal(new Set(WELCOME_CAST_ORDER).size,10);
  assert.deepEqual(new Set(WELCOME_CAST_ORDER),new Set(ROSTER.map(hero=>hero.id)));
  for(const width of [320,390,560,759,760,1280,1654,1920]){
    const spots=WELCOME_CAST_ORDER.map(id=>welcomeCastSpot(id,width,720,90));
    assert.ok(spots.every(s=>s&&s.x>0&&s.x<width&&s.foot>0));
    assert.equal(new Set(spots.map(s=>s.x+":"+s.foot)).size,10,"no two heroes overlap");
    for(const s of spots){
      assert.ok(s.x-s.slotWidth*.44>=0,"left silhouette safe");
      assert.ok(s.x+s.slotWidth*.44<=width,"right silhouette safe");
      assert.equal(s.compact,width<760);
    }
    assert.equal(new Set(spots.map(s=>s.row)).size,3);
    assert.ok(spots[5].foot<spots[0].foot,"Michi's reading terrace is above Dino's ground vignette");
  }
});

test("Opening optical V343: real-image dimensions normalize ten disparate art sizes",()=>{
  // Calibration examples deliberately cover baby Cuerno's tall horn, expanded
  // Stitcho/Chispin/Michi, small dinosaurs and narrow snack silhouettes.
  const raw=[
    [88,66,0],[98,78,12],[64,64,-8],[104,128,3],[116,130,-2],
    [110,120,4],[38,68,0],[55,76,-6],[64,88,0],[66,170,3]
  ];
  assert.equal(raw.length,WELCOME_CAST_ORDER.length);
  const fitted=raw.map(([w,h,off])=>welcomeActorFit({width:w,height:h,centerOffsetX:off},104,165));
  assert.ok(fitted.every(f=>Number.isFinite(f.scale)&&f.scale>.1&&f.scale<=5));
  assert.ok(fitted.every(f=>f.paintedWidth<=165*.88+1e-8));
  assert.ok(fitted.every(f=>f.paintedHeight<=104+1e-8));
  const hs=fitted.map(f=>f.paintedHeight);
  assert.ok(Math.max(...hs)/Math.min(...hs)<1.28,"silhouettes should retain comparable height");
  assert.ok(fitted[3].scale<fitted[0].scale,"larger art must scale down");
  assert.ok(fitted[9].scale<fitted[6].scale,"Cuerno's horn needs geometric fitting, not the old *.48 hack");
  assert.equal(fitted[2].centerOffsetX,-8);
});

test("Opening optical V343: robust fallback if browsers restrict Canvas readback",()=>{
  for(const bounds of [null,undefined,{}, {width:NaN,height:-20,centerOffsetX:Infinity}]){
    const fit=welcomeActorFit(bounds,70,68);
    assert.ok(fit.scale>0&&Number.isFinite(fit.scale));
    assert.ok(fit.paintedWidth<=68*.88+1e-8);
    assert.equal(fit.centerOffsetX,0);
  }
  assert.equal(welcomeCastSpot("unknown",1200,700,100),null);
  assert.equal(welcomeCastSpot("dino",NaN,700,100),null);
});

test("Opening optical V343: actual intro uses artwork pixels, not obsolete height constants",()=>{
  const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
  assert.match(intro,/getImageData\(0, 0, 320, 320\)/);
  assert.match(intro,/welcomeActorFit\(opticalBounds\[id\], h, slotWidth\)/);
  assert.match(intro,/const CAST = WELCOME_CAST_ORDER/);
  assert.match(intro,/actor\("yomi",yomi\.x,yomi\.foot/);
  assert.match(intro,/dataset\.openingMeasured/);
  assert.doesNotMatch(intro,/id === "cuerno" \? \.48/);
  assert.match(intro,/ctx\.fillText\(def\?\.name \|\| id/);
  assert.ok(intro.length>20000,"opening script should never be truncated");
});
