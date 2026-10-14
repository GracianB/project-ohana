import assert from "node:assert/strict";
import {chromium} from "playwright";
import {startServer} from "./server.mjs";

const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`,{waitUntil:"networkidle"});
 await page.waitForFunction(()=>!!window.__OHANA_E2E);
 const result=await page.evaluate(()=>{
  const api=window.__OHANA_E2E;
  const selector=document.getElementById("u-partner-select");
  const portrait=document.getElementById("u-partner-portrait");
  if(!selector||!portrait||!document.querySelector("#u-exp-fill"))throw Error("Missing real duet UI");
  const pick=(hero,ally)=>{
   dispatchEvent(new CustomEvent("ohana-select",{detail:{id:hero}}));
   api.selectUPartner(hero,ally);
   if(!selector.hidden)throw Error("Manual choice should not be visible");
  };
  pick("kilo","cat");
  const image=portrait.getContext("2d").getImageData(0,0,portrait.width,portrait.height).data;
  let realPixels=0;
  for(let i=3;i<image.length;i+=4)if(image[i]>24)realPixels++;
  if(realPixels<100)throw Error("Partner portrait lacks real character drawing: "+realPixels);
  if(!portrait.getAttribute("aria-label").includes("sorpresa"))throw Error("Wrong accessible artwork");
  api.start("kilo");api.setEvo(4);
  let old=api.state();if(old.uExp!==0||old.uPartner!=="cat")throw Error("Initial cat bond not zero");
  // Each real U grants 12 affinity; re-entering the same character resets only
  // its cooldown. It must NOT erase the chosen character + companion bond.
  for(let i=0;i<9;i++){
   api.start("kilo");api.setEvo(4);api.cast(3);
   const state=api.state();
   if(state.familyDuet?.ally!=="cat")throw Error("Wrong ally after real U");
   if(state.uExp!==Math.min(200,(i+1)*12))throw Error("XP did not survive reload "+i+" "+state.uExp);
  }
  const legendary=api.state();
  if(legendary.uExpRank!==3)throw Error("V314 bond never reached rank 3");
  api.step(1);
  const ui=document.getElementById("u-exp-hud")?.textContent||"";
  if(!ui.includes("3/3")||!ui.includes("Michi"))throw Error("HUD rank and ally not displayed: "+ui);
  const fill=document.getElementById("u-exp-fill");
  if(!fill.style.width.endsWith("%"))throw Error("Missing progress gauge");
  pick("kilo","dragon");
  api.start("kilo");api.setEvo(4);
  const other=api.state();
  if(other.uExp!==0||other.uExpRank!==1)throw Error("Affinity leaked to different partner");
  api.cast(3);
  if(api.state().familyDuet?.ally!=="dragon")throw Error("Chosen Dragon L not cast");
  if(api.state().uExp!==12)throw Error("Independent Dragon bond did not progress");
  pick("kilo","cat");
  api.start("kilo");api.setEvo(4);
  const returning=api.state();
  if(returning.uExp!==108||returning.uExpRank!==3)
   throw Error("Returning partner XP was lost: "+JSON.stringify(returning));
  return {portraitPixels:realPixels,cat:legendary.uExp,dragon:12,
   rank:returning.uExpRank,visibleHud:ui};
 });
 assert.equal(result.cat,108);
 assert.equal(result.dragon,12);
 assert.equal(result.rank,3);
 assert.ok(result.portraitPixels>100);
 assert.deepEqual(errors,[]);
 console.log("PASS · V314: mystery portrait, per-pair persistence, rank 3 and independent playable casts.");
}finally{
 await browser?.close();
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
