import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {execFileSync} from "node:child_process";

test("V369 verified historical upgrade computes accurate SHA diff and source-byte savings",()=>{
 const stdout=execFileSync(process.execPath,["tools/offline-upgrade-report.mjs"],{encoding:"utf8"});
 const report=JSON.parse(fs.readFileSync("test-results/performance/v369-offline-upgrade.json","utf8"));
 const baseline=JSON.parse(fs.readFileSync("tools/offline-baseline-v372.json","utf8"));
 const sw=fs.readFileSync("sw.js","utf8");
 const st=sw.indexOf("const PRECACHE_REVISIONS = {");
 const revs=JSON.parse(sw.slice(sw.indexOf("{",st),sw.indexOf("\n};",st)+2));
 const total=Object.keys(revs).length;
 const reused=Object.keys(revs).filter(k=>baseline.resources[k]?.sha===revs[k]).length;
 assert.match(stdout,new RegExp("OHANA ohana-372 → ohana-376: "+reused+"\\/"+total+" assets unchanged"));
 assert.equal(report.sourceVersion,"ohana-372");
 assert.equal(report.targetVersion,"ohana-376");
 assert.equal(report.total,total);
 assert.equal(report.reused,reused);
 assert.equal(report.downloaded,total-reused);
 assert.ok(reused>=190,"V373 must reuse at least 190 V372 assets");
 assert.equal(report.reusePct,Number((100*reused/total).toFixed(2)));
 assert.ok(report.changed.some(v=>v.path==="index.html"));
 const added=report.changed.filter(v=>v.kind==="new").map(v=>v.path);
 for(const must of ["systems/cuerno-fx.js","systems/cuerno-kit.js","systems/cuerno-play-v373.js","systems/cuerno-evo-v373.js","characters/art/cuerno-v373.js"])assert.ok(added.includes(must),must);
 assert.deepEqual(added.sort(),Object.keys(revs).filter(k=>!baseline.resources[k]).sort());
 assert.deepEqual(report.removed,[]);
 assert.ok(report.avoidedSourceBytes>5_000_000);
 assert.equal(report.avoidedSourceBytes+report.changedSourceBytes,report.currentFullSourceBytes);
 const manifest=JSON.parse(fs.readFileSync("tools/offline-baseline-v372.json","utf8"));
 assert.equal(report.priorFullSourceBytes,Object.values(manifest.resources).reduce((sum,item)=>sum+item.bytes,0));
});

test("V369 upgrade never sends analytics and still preserves every offline asset",()=>{
 const sw=fs.readFileSync("sw.js","utf8");
 assert.match(sw,/const INSTALL_STATS = "\.\/\.ohana-install-stats\.json"/);
 assert.match(sw,/const MAX_INSTALL_FETCHES = 6/);
 assert.match(sw,/old\.manifest\[path\]!==digest/);
 assert.match(sw,/response=await fetch\(asset,\{cache:"reload"\}\)/);
 assert.match(sw,/reused,downloaded,total:work\.length/);
 assert.doesNotMatch(sw,/sendBeacon\(|navigator\.analytics|google-analytics|\.netlify\/functions\/metrics/);
 const entries=sw.slice(sw.indexOf("const PRECACHE = ["),sw.indexOf("];",sw.indexOf("const PRECACHE = [")));
 const revs=JSON.parse(sw.slice(sw.indexOf("{",sw.indexOf("const PRECACHE_REVISIONS = {")),sw.indexOf("\n};",sw.indexOf("const PRECACHE_REVISIONS = {"))+2));
 assert.equal([...entries.matchAll(/"\.\//g)].length,Object.keys(revs).length+1);
 assert.ok(Object.keys(revs).length>=209);
});
