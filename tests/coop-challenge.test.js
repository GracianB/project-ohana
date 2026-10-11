import test from "node:test";
import assert from "node:assert/strict";
import {applyCoopChallenge,COOP_CHALLENGE} from "../systems/coop-challenge.js";
test("solo enemies keep original hit points",()=>{
 const enemy={hp:100,max:100};
 assert.equal(applyCoopChallenge(enemy,false).hp,100);
 assert.equal(enemy.max,100);
});
test("two-player enemies become tougher without repeat scaling",()=>{
 const enemy={hp:100,max:100};
 applyCoopChallenge(enemy,true);
 assert.equal(enemy.hp,175);
 assert.equal(enemy.max,175);
 applyCoopChallenge(enemy,true);
 assert.equal(enemy.hp,175);
});
test("two-player bosses receive a larger challenge",()=>{
 const boss={hp:1000,max:1000,boss:true};
 applyCoopChallenge(boss,true);
 assert.equal(boss.hp,1900);
 assert.equal(boss.max,1900);
 assert.equal(COOP_CHALLENGE.bossHp>COOP_CHALLENGE.foeHp,true);
});
test("invalid enemies are not transformed",()=>{
 const enemy={hp:NaN,max:Infinity};
 applyCoopChallenge(enemy,true);
 assert.equal(enemy._coopChallengeApplied,undefined);
});
test("engine applies scaling after creating room enemies and the boss",async()=>{
 const fs=await import("node:fs");
 const source=fs.readFileSync(new URL("../game.js",import.meta.url),"utf8");
 const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");
 assert.match(source,/for \(const e of game\.enemies\) applyCoopChallenge\(e,onlineCoop\.enabled\)/);
 assert.match(source,/applyCoopChallenge\(game\.boss,onlineCoop\.enabled\)/);
 assert.ok(sw.includes("./systems/coop-challenge.js?v="));
});
