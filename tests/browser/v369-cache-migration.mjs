import assert from "node:assert/strict";
import fs from "node:fs";
import {chromium} from "playwright";
import {startServer} from "./server.mjs";

// Real Chromium Service Worker installation, upgrading a CacheStorage populated
// with the actual unchanged V368 bytes. Count requests *after* seeding.
// Only the changed index.html and sw.js registration may contact the server.
const baseline=JSON.parse(fs.readFileSync("tools/offline-baseline-v368.json","utf8"));
const sw=fs.readFileSync("sw.js","utf8");
const start=sw.indexOf("const PRECACHE_REVISIONS = {");
const end=sw.indexOf("\n};",start);
const current=JSON.parse(sw.slice(sw.indexOf("{",start),end+2));
const same=Object.entries(baseline.resources).filter(([name,r])=>current[name]===r.sha).map(([name])=>name);
assert.equal(same.length,199,"V369 should preserve 199 V368 assets");
const server=await startServer(0);
const base="http://127.0.0.1:"+server.address().port;
const network=[];
server.on("request",req=>network.push(new URL(req.url||"/",base).pathname));
let browser;
try {
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({serviceWorkers:"allow"});
 await context.route("**/__upgrade_probe__.html",route=>route.fulfill({
   status:200,contentType:"text/html",body:"<!doctype html><title>OHANA V369 cache migration</title>"
 }));
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto(base+"/__upgrade_probe__.html",{waitUntil:"domcontentloaded"});
 await page.evaluate(async ({baseline,same})=>{
   const previous=await caches.open("ohana-static-ohana-368");
   const revisions=Object.fromEntries(Object.entries(baseline.resources).map(([name,r])=>[name,r.sha]));
   await previous.put("./.ohana-revisions.json",new Response(JSON.stringify(revisions)));
   let cursor=0;
   async function seed(){
     while(cursor<same.length){
       const name=same[cursor++];
       const response=await fetch("/"+name+"?seed=v369",{cache:"no-store"});
       if(!response.ok)throw Error("Fixture source missing: "+name);
       await previous.put("./"+name+"?v=ohana-368",response);
     }
   }
   await Promise.all(Array.from({length:6},seed));
 },{baseline,same});
 const seedRequests=network.length;
 network.length=0;
 await page.evaluate(()=>navigator.serviceWorker.register("./sw.js?v=ohana-369",{scope:"./"}));
 await page.waitForFunction(async()=>{
   const keys=await caches.keys();
   return keys.includes("ohana-static-ohana-369") && !!navigator.serviceWorker.controller;
 },undefined,{timeout:45000});
 const migration=await page.evaluate(async()=>{
   const c=await caches.open("ohana-static-ohana-369");
   const stats=await (await c.match("./.ohana-install-stats.json")).json();
   const game=await c.match("./game.js?v=ohana-369");
   const root=await c.match("./");
   return {
     stats,
     gameBytes:(await game.arrayBuffer()).byteLength,
     rootOk:root?.status===200,
     oldCachePresent:(await caches.keys()).includes("ohana-static-ohana-368")
   };
 });
 const upgradeRequests=[...network];
 const changedRequests=upgradeRequests.filter(name=>name!=="/sw.js");
 assert.deepEqual(changedRequests,["/index.html"],"only changed index.html should transfer during upgrade");
 assert.equal(migration.stats.reused,199);
 assert.equal(migration.stats.downloaded,1);
 assert.equal(migration.stats.total,200);
 assert.equal(migration.stats.incremental,true);
 assert.ok(migration.gameBytes>100000,"real game.js bytes from old V368 cache must survive");
 assert.equal(migration.rootOk,true);
 assert.equal(migration.oldCachePresent,false,"old cache removed only after successful activation");
 assert.deepEqual(errors,[]);
 await context.setOffline(true);
 await page.goto(base+"/?e2e=1",{waitUntil:"domcontentloaded",timeout:30000});
 await page.waitForFunction(()=>!!window.__OHANA_E2E?.start,undefined,{timeout:15000});
 await page.evaluate(()=>window.__OHANA_E2E.start("kilo"));
 await page.waitForFunction(()=>document.body.classList.contains("playing"),undefined,{timeout:10000});
 console.log("OHANA V369 Chromium upgrade: "+seedRequests+" fixture downloads, "+
   migration.stats.reused+" cached, "+migration.stats.downloaded+" network, offline play OK.");
 await context.close();
} finally {
 await browser?.close();
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
