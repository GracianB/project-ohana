import assert from "node:assert/strict";
import fs from "node:fs";
import {chromium} from "playwright";
import {startServer} from "./server.mjs";

// Real Chromium Service Worker installation, upgrading a CacheStorage populated
// with the actual unchanged V371 bytes. Count requests *after* seeding.
// Only the changed/new V372 files (exact set derived from the real V371 baseline)
// and the sw.js registration may contact the server.
const baseline=JSON.parse(fs.readFileSync("tools/offline-baseline-v371.json","utf8"));
const sw=fs.readFileSync("sw.js","utf8");
const start=sw.indexOf("const PRECACHE_REVISIONS = {");
const end=sw.indexOf("\n};",start);
const current=JSON.parse(sw.slice(sw.indexOf("{",start),end+2));
const same=Object.entries(baseline.resources).filter(([name,r])=>current[name]===r.sha).map(([name])=>name);
const currentTotal=Object.keys(current).length;
// V372 work (intros, final and the concurrent foe modules) changes a bounded set:
// the overwhelming majority of the V371 bytes must still be reused.
assert.ok(same.length>=190,"V372 should preserve at least 190 V371 assets, got "+same.length);
assert.ok(currentTotal-same.length<=60,"V372 should download a bounded delta, got "+(currentTotal-same.length));
const server=await startServer(0);
const base="http://127.0.0.1:"+server.address().port;
const network=[];
server.on("request",req=>network.push(new URL(req.url||"/",base).pathname));
let browser;
try {
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({serviceWorkers:"allow"});
 await context.route("**/__upgrade_probe__.html",route=>route.fulfill({
   status:200,contentType:"text/html",body:"<!doctype html><title>OHANA V372 cache migration</title>"
 }));
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto(base+"/__upgrade_probe__.html",{waitUntil:"domcontentloaded"});
 await page.evaluate(async ({baseline,same})=>{
   const previous=await caches.open("ohana-static-ohana-371");
   const revisions=Object.fromEntries(Object.entries(baseline.resources).map(([name,r])=>[name,r.sha]));
   await previous.put("./.ohana-revisions.json",new Response(JSON.stringify(revisions)));
   let cursor=0;
   async function seed(){
     while(cursor<same.length){
       const name=same[cursor++];
       const response=await fetch("/"+name+"?seed=v372",{cache:"no-store"});
       if(!response.ok)throw Error("Fixture source missing: "+name);
       await previous.put("./"+name+"?v=ohana-371",response);
     }
   }
   await Promise.all(Array.from({length:6},seed));
 },{baseline,same});
 const seedRequests=network.length;
 network.length=0;
 await page.evaluate(()=>navigator.serviceWorker.register("./sw.js?v=ohana-372",{scope:"./"}));
 // CacheStorage creation may precede the last cache.put on slower runners.
 // Observe the actual completed metadata, not merely the new cache name.
 let ready=false;
 try {
   await page.waitForFunction(()=>!!navigator.serviceWorker.controller,undefined,{timeout:45000});
   // Do not pass an async predicate to waitForFunction: the polling runtime
   // may treat the returned Promise as a truthy value before it settles.
   for(let attempt=0;attempt<200;attempt++){
     ready=await page.evaluate(async()=>{
       const c=await caches.open("ohana-static-ohana-372");
       return !!(await c.match("./.ohana-install-stats.json"));
     });
     if(ready)break;
     await page.waitForTimeout(150);
   }
   if(!ready)throw new Error("Installation stats missing after 30s");
 } catch(error) {
   const diagnostic=await page.evaluate(async()=>{
     const names=await caches.keys();
     const c=await caches.open("ohana-static-ohana-372");
     return {names,controlled:!!navigator.serviceWorker.controller,
       assets:(await c.keys()).map(x=>new URL(x.url).pathname).slice(-12)};
   });
   throw new Error("V372 SW install metadata not completed: "+JSON.stringify(diagnostic)+
     "; requests="+network.slice(-15).join(",")+"; "+error.message);
 }
 const migration=await page.evaluate(async()=>{
   const c=await caches.open("ohana-static-ohana-372");
   const stats=await (await c.match("./.ohana-install-stats.json")).json();
   const game=await c.match("./game.js?v=ohana-372");
   const root=await c.match("./");
   return {
     stats,
     gameBytes:(await game.arrayBuffer()).byteLength,
     rootOk:root?.status===200,
     oldCachePresent:(await caches.keys()).includes("ohana-static-ohana-371")
   };
 });
 const upgradeRequests=[...network];
 const changedRequests=upgradeRequests.filter(name=>name!=="/sw.js");
 const expectedChanged=Object.keys(current).filter(name=>!same.includes(name)).map(name=>"/"+name).sort();
 for(const must of ["/index.html","/systems/intro.js","/systems/intro-fantasy.js","/systems/ending.js","/systems/ending-duo.js"])
   assert.ok(expectedChanged.includes(must),"V372 must refresh "+must);
 assert.deepEqual([...new Set(changedRequests)].sort(),expectedChanged,"only the "+expectedChanged.length+" changed or new V372 files should transfer during upgrade");
 assert.equal(migration.stats.reused,same.length);
 assert.equal(migration.stats.downloaded,expectedChanged.length);
 assert.equal(migration.stats.total,currentTotal);
 assert.equal(migration.stats.incremental,true);
 assert.ok(migration.gameBytes>100000,"updated V372 game.js must be cached in full");
 assert.equal(migration.rootOk,true);
 assert.equal(migration.oldCachePresent,false,"old cache removed only after successful activation");
 assert.deepEqual(errors,[]);
 await context.setOffline(true);
 await page.goto(base+"/?e2e=1",{waitUntil:"domcontentloaded",timeout:30000});
 await page.waitForFunction(()=>!!window.__OHANA_E2E?.start,undefined,{timeout:15000});
 await page.evaluate(()=>window.__OHANA_E2E.start("kilo"));
 await page.waitForFunction(()=>document.body.classList.contains("playing"),undefined,{timeout:10000});
 console.log("OHANA V371→V372 Chromium upgrade: "+seedRequests+" fixture downloads, "+
   migration.stats.reused+" cached, "+migration.stats.downloaded+" network, offline play OK.");
 await context.close();
} finally {
 await browser?.close();
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
