import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {chromium} from "playwright";
import {startServer} from "./server.mjs";

// V315 audits actual vector character art, the 10 guest movement rigs,
// rank progression, five forms and warnings drawn from the real hit areas.
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1500,height:930}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`,{waitUntil:"networkidle"});
 await page.evaluate(()=>document.body.innerHTML='<canvas id="duet-audit" width="1500" height="900"></canvas>');
 await fs.mkdir("test-results/u-duet-v315",{recursive:true});
 const heroes=["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
 let checked=0;
 for(const hero of heroes){
  const count=await page.evaluate(async(hero)=>{
   const {ROSTER}=await import("/characters/roster.js");
   const {drawCharacter}=await import("/characters/draw.js");
   const {optionsForUPartner}=await import("/systems/u-partners.js");
   const {drawFamilyDuet,familyDuetDefinition}=await import("/systems/family-duets.js");
   const {guestPerformance,borrowedLFootprint,borrowedLContains}=await import("/systems/u-duet-direction-v315.js");
   const canvas=document.querySelector("#duet-audit"),ctx=canvas.getContext("2d");
   const allies=optionsForUPartner(hero);
   if(allies.length!==9)throw Error("Missing a real U partner for "+hero);
   ctx.fillStyle="#102b36";ctx.fillRect(0,0,1500,900);
   ctx.fillStyle="#f8ebd3";ctx.font="bold 21px sans-serif";ctx.textAlign="center";
   ctx.fillText(hero.toUpperCase()+" · V315 · 9 compañeros, entradas y L reales",750,26);
   const localDef=ROSTER.find(r=>r.id===hero),localForm=localDef.forms[4];
   const tally={draws:0,peers:new Set(),forms:new Set(),ranks:new Set(),warnings:0};
   function cameo(ctx,p,cam,t){drawCharacter(ctx,p,cam,t,{reduceMotion:true});}
   for(const [i,ally] of allies.entries()){
    const col=i%3,row=Math.floor(i/3),left=col*500,top=row*285+32;
    ctx.save();ctx.beginPath();ctx.rect(left,top,500,285);ctx.clip();
    ctx.fillStyle="#16323c";ctx.fillRect(left+2,top+2,496,281);
    ctx.strokeStyle="#537985";ctx.beginPath();
    ctx.moveTo(left+30,top+241);ctx.lineTo(left+472,top+241);ctx.stroke();
    const x=left+265,y=top+240;
    const actual={...localDef,...localForm,x:x-localForm.w/2,y:y-localForm.h,
     id:hero,evo:4,facing:1,grounded:true,health:100,maxHealth:100};
    cameo(ctx,actual,{x:0,y:0},42);
    const state={hero,ally:ally.id,x,y,age:42,evo:4,facing:1,bondRank:3};
    let drawnGuest=0;
    if(!drawFamilyDuet(ctx,state,{x:0,y:0},42,(...args)=>{
     drawnGuest++;
     cameo(...args);
    },ROSTER,true))throw Error("Duet not rendered "+hero+"+"+ally.id);
    if(drawnGuest!==1)throw Error("Expected one visible companion");
    const pose=guestPerformance(state,ally.id,true);
    if(!pose||pose.ally!==ally.id||pose.pose!=="attack")throw Error("Incorrect unique guest stage");
    const area=borrowedLFootprint(familyDuetDefinition(state).kind,state,0);
    if(!area)throw Error("No actual borrowed L hit geometry");
    ctx.fillStyle="#fff0d3";ctx.font="700 15px sans-serif";
    ctx.fillText(ally.name+" · "+ally.lName, left+250,top+36);
    ctx.font="12px sans-serif";ctx.fillText("LEYENDA · "+pose.style+" · "+pose.gesture,left+250,top+260);
    ctx.restore();
    tally.peers.add(ally.id);
    // 9 partner choices × 5 evolution forms × 3 U bond ranks = 135 states
    // for each primary hero, each drawn as a real vector Canvas scene.
    const staging=document.createElement("canvas");staging.width=500;staging.height=250;
    const gx=staging.getContext("2d");
    for(let evo=0;evo<5;evo++)for(let rank=1;rank<=3;rank++){
     const s={hero,ally:ally.id,x:250,y:185,age:38,evo,facing:1,bondRank:rank};
     const def=familyDuetDefinition(s);
     gx.clearRect(0,0,500,250);
     gx.fillStyle="#142c37";gx.fillRect(0,0,500,250);
     const success=drawFamilyDuet(gx,s,{x:0,y:0},38,cameo,ROSTER,true);
     if(!success)throw Error("Missing real vector duet "+hero+"/"+ally.id+"/"+evo+"/"+rank);
     const data=gx.getImageData(0,0,500,250).data;
     let different=0;
     for(let k=0;k<data.length;k+=64)if(data[k]!==20||data[k+1]!==44||data[k+2]!==55)different++;
     if(different<25)throw Error("Canvas invisible "+hero+"/"+ally.id+"/"+evo+"/"+rank);
     tally.draws++;tally.forms.add(evo);tally.ranks.add(rank);
     if(borrowedLContains(borrowedLFootprint(def.kind,s,0),{x:248,y:154,w:6,h:6}))tally.warnings++;
    }
   }
   if(tally.peers.size!==9||tally.forms.size!==5||tally.ranks.size!==3||tally.draws!==135)
    throw Error("Incomplete U roster for "+hero);
   return tally.draws;
  },hero);
  assert.equal(count,135);
  checked+=count;
  await page.locator("#duet-audit").screenshot({path:`test-results/u-duet-v315/${hero}.png`});
 }
 assert.equal(checked,1350);
 assert.deepEqual(errors,[]);
 console.log("PASS · V315: 1350 real vector duet scenes, ten arrival acting styles, exact borrowed-L warning geometry.");
}finally{
 await browser?.close();
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
