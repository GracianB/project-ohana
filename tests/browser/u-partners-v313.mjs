import assert from "node:assert/strict";
import {chromium} from "playwright";
import {startServer} from "./server.mjs";

// Real browser: change an actual <select>, cast U in the real engine and inspect
// guest identity. No unit-only pretend controls or synthetic opponent animation.
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on("pageerror",err=>errors.push(err.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`,{waitUntil:"networkidle"});
 await page.waitForFunction(()=>!!window.__OHANA_E2E);
 const checks=await page.evaluate(()=>{
  const api=window.__OHANA_E2E;
  const selector=document.getElementById("u-partner-select");
  if(!selector)throw Error("User-facing U partner selector absent");
  const ten=["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
  const chosen={
   kilo:"cat",stitcho:"dragon",chispin:"pizza",cat:"cuerno",dragon:"yomi",
   dino:"cuerno",frita:"cat",pizza:"dino",yomi:"stitcho",cuerno:"dragon"
  };
  const results=[];
  for(const hero of ten){
   dispatchEvent(new CustomEvent("ohana-select",{detail:{id:hero}}));
   if(selector.options.length!==9)throw Error("Not nine options for "+hero);
   selector.value=chosen[hero];
   selector.dispatchEvent(new Event("change",{bubbles:true}));
   const label=document.getElementById("u-partner-technique")?.textContent||"";
   if(!label.includes("U en combate"))throw Error("Missing live technique "+hero);
   api.start(hero);api.setEvo(4);
   const initial=api.state();
   if(initial.uPartner!==chosen[hero])throw Error("Selection not loaded "+hero+": "+initial.uPartner);
   api.cast(3);
   const after=api.state();
   if(after.familyDuet?.ally!==chosen[hero]||after.familyDuet?.hero!==hero)
    throw Error("Wrong real U guest "+hero+": "+JSON.stringify(after.familyDuet));
   if(after.lastAbilitySlot!==3)throw Error("U cast was not registered: "+hero);
   if(after.uExp<=0||after.uExpRank<1)throw Error("Missing bond experience "+hero);
   const hud=document.getElementById("u-exp-hud")?.textContent||"";
   if(!hud.includes("U EXP")||!hud.includes("200"))throw Error("HUD missing U EXP "+hero);
   api.step(47);
   const stepped=api.state();
   if(stepped.familyDuet?.ally!==chosen[hero]||stepped.familyDuet?.age<42)
    throw Error("Three-beat choreography absent "+hero);
   results.push({hero,partner:after.uPartner,age:stepped.familyDuet.age,exp:after.uExp});
  }
  return results;
 });
 assert.equal(checks.length,10);
 assert.equal(new Set(checks.map(x=>x.partner)).size>=5,true);
 assert.deepEqual(errors,[],"uncaught browser runtime errors");
 console.log("PASS · OHANA V313: 10 real UI selections, real U casting and borrowed-L in-world state.");
}finally{
 await browser?.close();
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
