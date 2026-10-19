import assert from "node:assert/strict";
import { chromium } from "playwright";
import { startServer } from "./server.mjs";

const server=await startServer(0);
const base="http://127.0.0.1:"+server.address().port+"/";
let browser;
try {
 browser=await chromium.launch({headless:true});
 const cases=[
   {event:"ohana-evolve",detail:{id:"kilo",evo:1},target:"#evo-stage.show",module:"evo-cinema.js"},
   {event:"ohana-supreme",detail:{id:"dragon",evo:4,name:"Dragón"},target:"#supreme-cinema.show",module:"supreme-cinema.js"},
   {event:"ohana-win",detail:{id:"kilo",evo:4,hero:"Kilo"},target:"#win-cinema.show",module:"ending.js"}
 ];
 for(const spec of cases){
   const context=await browser.newContext({viewport:{width:1024,height:768}});
   const page=await context.newPage();
   const errors=[];
   page.on("pageerror",e=>errors.push(String(e.message)));
   // V453: >250 eager assets exhaust Chromium's default Resource Timing
   // buffer. Enlarge it BEFORE navigation or lazy import requests disappear
   // from getEntriesByType despite the cinema actually rendering.
   await page.addInitScript(() => performance.setResourceTimingBufferSize(2000));
   try {
     await page.goto(base+"?e2e=1",{waitUntil:"domcontentloaded"});
     await page.waitForFunction(()=>!!window.__OHANA_E2E?.start&&!!document.querySelector("#ohana-intro"),undefined,{timeout:15000});
     const before=await page.evaluate(()=>performance.getEntriesByType("resource").map(r=>new URL(r.name).pathname));
     const delayed=["evo-cinema.js","supreme-cinema.js","ending.js"];
     for(const rare of delayed){
       assert.ok(!before.some(path=>path.endsWith("/systems/"+rare)),
         "V367 "+spec.event+": "+rare+" loaded on initial page");
     }
     assert.ok(before.some(path=>path.endsWith("/systems/cinema-kit.js")),
       "shared kit must be present in the real first-render graph");
     await page.evaluate(({event,detail})=>dispatchEvent(new CustomEvent(event,{detail})),spec);
     await page.locator(spec.target).waitFor({state:"visible",timeout:15000});
     const after=await page.evaluate(()=>performance.getEntriesByType("resource").map(r=>new URL(r.name).pathname));
     assert.ok(after.some(path=>path.endsWith("/systems/"+spec.module)),
       spec.event+": lazy module was not fetched when its event occurred");
     assert.deepEqual(errors,[],spec.event+": uncaught browser error(s)");
     console.log("V367 LAZY CINEMA PASS · "+spec.event+" · "+spec.module+" loaded only on demand");
   } finally {await context.close();}
 }
} finally {
 await browser?.close();
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
