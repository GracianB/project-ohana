import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("V366 CI: Yomi/Dragon/Pizza/Dino/Frita test real U and hit without synthetic Stitcho storm",()=>{
 const code=fs.readFileSync("tests/browser/multiplayer-e2e.mjs","utf8");
 const matrix=fs.readFileSync("tests/browser/six-hero-multiplayer.mjs","utf8");
 const workflow=fs.readFileSync(".github/workflows/quality.yml","utf8");
 assert.match(code,/multiplayer: authoritative movement and direct poses verified/);
 assert.match(code,/multiplayer: enemy replication and authoritative guest impact verified/);
 assert.match(code,/multiplayer: bidirectional U echoes verified/);
 assert.match(code,/if\(hostCharacter==='stitcho'\)\{/);
 assert.match(code,/const stormDeadline=Date\.now\(\)\+12000/);
 assert.match(code,/assert\.ok\(stormDelivered,'V302 storm snapshot did not traverse WebRTC/);
 assert.match(workflow,/name: Stitcho Multiplayer E2E[\s\S]*?OHANA_TEST_HOST: stitcho/);
 assert.match(workflow,/name: Stitcho Firefox Multiplayer E2E[\s\S]*?OHANA_TEST_HOST: stitcho/);
 assert.match(matrix,/const heroes=\['dragon','dino','frita','pizza','yomi','cuerno'\]/);
});
