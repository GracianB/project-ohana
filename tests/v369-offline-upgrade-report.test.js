import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {execFileSync} from "node:child_process";

test("V369 verified historical upgrade computes accurate SHA diff and source-byte savings",()=>{
 const stdout=execFileSync(process.execPath,["tools/offline-upgrade-report.mjs"],{encoding:"utf8"});
 const report=JSON.parse(fs.readFileSync("test-results/performance/v369-offline-upgrade.json","utf8"));
 assert.match(stdout,/OHANA ohana-368 → ohana-369: 199\/200 assets unchanged/);
 assert.equal(report.sourceVersion,"ohana-368");
 assert.equal(report.targetVersion,"ohana-369");
 assert.equal(report.total,200);
 assert.equal(report.reused,199);
 assert.equal(report.downloaded,1);
 assert.equal(report.reusePct,99.5);
 assert.deepEqual(report.changed.map(v=>v.path),["index.html"]);
 assert.deepEqual(report.removed,[]);
 assert.ok(report.avoidedSourceBytes>6_000_000);
 assert.equal(report.avoidedSourceBytes+report.changedSourceBytes,report.currentFullSourceBytes);
 const manifest=JSON.parse(fs.readFileSync("tools/offline-baseline-v368.json","utf8"));
 assert.equal(report.priorFullSourceBytes,Object.values(manifest.resources).reduce((sum,item)=>sum+item.bytes,0));
});

test("V369 upgrade never sends analytics and still preserves all 200 offline assets",()=>{
 const sw=fs.readFileSync("sw.js","utf8");
 assert.match(sw,/const INSTALL_STATS = "\.\/\.ohana-install-stats\.json"/);
 assert.match(sw,/const MAX_INSTALL_FETCHES = 6/);
 assert.match(sw,/old\.manifest\[path\]!==digest/);
 assert.match(sw,/response=await fetch\(asset,\{cache:"reload"\}\)/);
 assert.match(sw,/reused,downloaded,total:work\.length/);
 assert.doesNotMatch(sw,/sendBeacon\(|navigator\.analytics|google-analytics|\.netlify\/functions\/metrics/);
 const entries=sw.slice(sw.indexOf("const PRECACHE = ["),sw.indexOf("];",sw.indexOf("const PRECACHE = [")));
 assert.equal([...entries.matchAll(/"\.\//g)].length,201);
});
