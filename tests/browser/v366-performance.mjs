import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium, devices } from "playwright";
import { startServer } from "./server.mjs";

// Real Chromium/phone-emulation measurements. These are diagnostic metrics,
// never fabricated benchmark comparisons with hardware we have not tested.
const server=await startServer(0);
const base=`http://127.0.0.1:${server.address().port}/?e2e=1&perf=1`;
let browser;
const results=[];
try {
  browser=await chromium.launch({headless:true});
  const presets=[
    {name:"desktop-1280",context:{viewport:{width:1280,height:800},deviceScaleFactor:1}},
    {name:"mobile-iphone13",context:{...devices["iPhone 13"]}}
  ];
  for(const preset of presets){
    const context=await browser.newContext(preset.context);
    const page=await context.newPage();
    const errors=[];
    page.on("pageerror",err=>errors.push(String(err.message)));
    try {
      await page.goto(base,{waitUntil:"domcontentloaded"});
      await page.waitForFunction(()=>!!window.__OHANA_E2E?.start&&!!window.__OHANA_PERF?.snapshot,undefined,{timeout:15000});
      await page.evaluate(()=>{
        window.__OHANA_E2E.start("kilo");
        window.__OHANA_PERF.reset();
      });
      await page.waitForTimeout(3000);
      const result=await page.evaluate(()=>({
        metrics:window.__OHANA_PERF.snapshot(),
        canvasWidth:document.getElementById("game")?.width,
        actualWidth:window.innerWidth,
        started:window.__OHANA_E2E.state().running,
        panel:document.getElementById("ohana-perf-metrics")?.textContent||""
      }));
      assert.equal(result.started,true,preset.name+": engine never started");
      assert.ok(result.metrics.samples>=20,preset.name+": insufficient measured frames "+JSON.stringify(result));
      assert.ok(result.metrics.fps>0&&result.metrics.fps<=180,preset.name+": invalid FPS sample");
      assert.ok(result.metrics.renderP95Ms>=0&&result.metrics.renderP95Ms<500,preset.name+": render blocked");
      assert.ok(result.metrics.dpr>=1&&result.metrics.dpr<=1.25,preset.name+": invalid DPR");
      assert.match(result.panel,/OHANA.*FPS.*render p95/,preset.name+": opt-in diagnostic missing");
      assert.deepEqual(errors,[],preset.name+": uncaught browser errors");
      results.push({device:preset.name,...result.metrics});
    } finally {await context.close();}
  }
  await fs.mkdir("test-results/performance",{recursive:true});
  await fs.writeFile("test-results/performance/v366-chromium.json",JSON.stringify({
    purpose:"Headless CI diagnostics; not a hardware FPS claim.",
    profiles:results
  },null,2));
  for(const result of results){
    console.log("OHANA PERF V366 | "+result.device+" | "+result.fps+" FPS | render p95 "+
      result.renderP95Ms+" ms | frame p95 "+result.frameP95Ms+" ms | DPR "+result.dpr);
  }
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
