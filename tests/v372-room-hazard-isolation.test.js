import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {clearStitchoWebs,updateStitchoWebs} from "../engine/foes/stitcho-ai.js";

test("V372: Stitcho web traps cannot leak through a successful room transition",()=>{
 const player={x:101,y:201,w:26,h:34,vx:10,dead:false};
 const game={player,paused:false,_stitchoWebs:[
  {x:90,y:216,w:48,h:24,life:500,max:600}
 ]};
 updateStitchoWebs(game);
 assert.ok(player._webSlowT>0,"source-room web must still be functional");
 const originalWebs=game._stitchoWebs;
 clearStitchoWebs(game);
 assert.notEqual(game._stitchoWebs,originalWebs,"clear should replace the room-local registry");
 assert.equal(game._stitchoWebs.length,0);
 player._webSlowT=0;
 player.vx=10;
 updateStitchoWebs(game);
 assert.equal(player._webSlowT,0,"previous room's web must not reapply slow");
 assert.equal(player.vx,10,"movement speed is not reduced by stale hazards");
});

test("V372: only accepted loadRoom crosses reset Spider webs and Dino hazards",()=>{
 const gameJs=fs.readFileSync("game.js","utf8");
 const start=gameJs.indexOf("function loadRoom(id, fromDir) {");
 const end=gameJs.indexOf("function ",start+12);
 const block=gameJs.slice(start,end>start?end:undefined);
 assert.match(block,/if \(!r\) return false;/);
 assert.match(block,/if \(r.needEvo.*?\{[\s\S]*?return false;\s*\}/);
 assert.match(block,/game\.roomId = id;\s*(?:\/\/[^\n]*\n)*clearStitchoWebs\(game\);\s*resetDinoFoeAI\(\);/);
 assert.ok(block.indexOf("clearStitchoWebs(game)")>block.indexOf("game.roomId = id"));
 assert.ok(block.indexOf("clearStitchoWebs(game)")<block.indexOf("game.enemies ="));
});