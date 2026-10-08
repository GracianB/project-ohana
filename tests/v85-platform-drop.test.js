import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveBody } from "../engine/collide.js";
import { beginPlatformDrop, dropIgnoresPlatform, advancePlatformDrop } from "../engine/platform-drop.js";

function simulate(p, platforms, n, down = true) {
  for (let t = 0; t < n; t++) {
    const groundedBefore = p.grounded;
    const dropThroughY = beginPlatformDrop(p, platforms, down, groundedBefore);
    p.vy = Math.min(14, p.vy + 0.5);
    p.grounded = false;
    const steps = Math.max(1, Math.ceil((Math.abs(p.vx) + Math.abs(p.vy)) / 8));
    for (let s = 0; s < steps; s++) {
      const x = p.x, y = p.y;
      p.x += p.vx / steps;
      p.y += p.vy / steps;
      const hit = resolveBody(p, platforms, { prevX:x, prevY:y, dropThroughY });
      if (hit.grounded) { p.vy = 0; p.grounded = true; }
    }
    advancePlatformDrop(p);
  }
  return p;
}

test("V85: DOWN drops through a one-way ledge across substeps and frames", () => {
  const upper = {x:0,y:100,w:900,h:12};
  const p = {x:60,y:70,w:26,h:30,vx:11,vy:0,grounded:true};
  assert.equal(beginPlatformDrop(p,[upper],true,true),110);
  assert.equal(dropIgnoresPlatform(p,upper),true);
  simulate(p,[upper],18);
  assert.ok(p.y + p.h > upper.y + 35, "Returned to the ledge after first physics step");
  assert.equal(p.grounded,false, "Hero did not actually descend");
});

test("V85: DOWN never disables collision with a solid floor", () => {
  const solid = {x:0,y:100,w:600,h:64};
  const p = {x:60,y:70,w:26,h:30,vx:0,vy:0,grounded:true};
  assert.equal(beginPlatformDrop(p,[solid],true,true),null);
  simulate(p,[solid],15);
  assert.equal(p.grounded,true);
  assert.equal(p.y,70);
  assert.equal(p._dropPlatform,undefined);
});

test("V85: the ignored ledge stays skipped by void rescue, not the lower ledge", () => {
  const upper = {x:0,y:100,w:500,h:12};
  const lower = {x:0,y:210,w:500,h:12};
  const p = {x:20,y:70,w:22,h:30,vx:0,vy:0,grounded:true};
  assert.equal(beginPlatformDrop(p,[upper,lower],true,true),110);
  assert.equal(dropIgnoresPlatform(p,upper),true);
  assert.equal(dropIgnoresPlatform(p,lower),false);
  simulate(p,[upper,lower],35);
  assert.equal(p.grounded,true,"The lower platform must remain solid to the hero");
  assert.equal(p.y+p.h,lower.y);
  assert.equal(p._dropPlatform,null,"Drop memory is released after a lower landing");
});

test("V85: side exit and upward return clear the remembered ledge", () => {
  const upper={x:0,y:100,w:170,h:12};
  const p={x:30,y:70,w:24,h:30,grounded:true};
  beginPlatformDrop(p,[upper],true,true);
  p.x=400;advancePlatformDrop(p);assert.equal(p._dropPlatform,null);
  p.x=30;beginPlatformDrop(p,[upper],true,true);
  p.y=45;p.grounded=false;advancePlatformDrop(p);
  assert.equal(p._dropPlatform,null);
});

test("V85: game physics and void rescue share the same drop-through contract", () => {
  const game=fs.readFileSync("game.js","utf8");
  const sw=fs.readFileSync("sw.js","utf8");
  const html=fs.readFileSync("index.html","utf8");
  assert.match(game,/const dropThroughY = beginPlatformDrop\(p, playerPlatforms, drop, wasGrounded\)/);
  assert.match(game,/dropThroughY,/);
  assert.match(game,/advancePlatformDrop\(p\)/);
  assert.ok((game.match(/!dropIgnoresPlatform\(p, (?:next|low)\)/g)||[]).length===2,
    "Both rescue paths must honor platform drop-through");
  assert.doesNotMatch(game,/drop && wasGrounded && s === 0/);
  assert.match(sw,/const VERSION = "ohana-285"/);
  assert.match(sw,/engine\/platform-drop\.js\?v=/);
  assert.match(html,/ohana-285/);
});
