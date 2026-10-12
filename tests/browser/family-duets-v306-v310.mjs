import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {chromium} from "playwright";
import {startServer} from "./server.mjs";

const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1500,height:1300}});
 const errors=[];page.on("pageerror",error=>errors.push(error.message));
 await page.route("**/family-duets-preview",route=>route.fulfill({contentType:"text/html",body:"<html><body></body></html>"}));
 await page.goto(`http://127.0.0.1:${server.address().port}/family-duets-preview`);
 await page.setContent('<canvas id="audit" width="1500" height="1300"></canvas><style>body{margin:0;background:#14232b}</style>');
 const result=await page.evaluate(async()=>{
   const {ROSTER}=await import("/characters/roster.js");
   const {drawCharacter}=await import("/characters/draw.js");
   const {FAMILY_DUETS,startFamilyDuet,updateFamilyDuet,drawFamilyDuet,readFamilyDuet}
     =await import("/systems/family-duets.js");
   localStorage.setItem("ohana-look-v2","vector");
   const heroes=["dino","frita","pizza","yomi","cuerno"];
   const canvas=document.querySelector("#audit"),ctx=canvas.getContext("2d");
   ctx.fillStyle="#14232b";ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.textAlign="center";ctx.font="800 22px sans-serif";ctx.fillStyle="#fff5df";
   ctx.fillText("OHANA · 5 amigos, 5 evoluciones, L prestada y U jugable",750,35);
   const samples=[],ages=[12,26,45,78,112];
   for(const [row,id] of heroes.entries()){
     const def=ROSTER.find(r=>r.id===id);
     if(!def)throw Error("Missing hero: "+id);
     for(let evo=0;evo<5;evo++){
       const frame={x:evo*300,y:55+row*245};
       ctx.save();ctx.translate(frame.x,frame.y);
       ctx.fillStyle="#17313a";ctx.fillRect(1,1,298,240);
       ctx.beginPath();ctx.rect(1,1,298,240);ctx.clip();
       ctx.strokeStyle="#5d8791";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(18,182);ctx.lineTo(280,182);ctx.stroke();
       const form=def.forms[evo],p={...def,...form,id,evo,x:160-form.w/2,
         y:181-form.h,facing:1,vx:0,vy:0,grounded:true,visualScale:1.05,health:100,maxHealth:125};
       const game={player:p,roomId:"hub",enemies:[],nums:{add(){}},fx:{emit(){}}};
       startFamilyDuet(game);
       const age=ages[evo];
       for(let tick=0;tick<age;tick++)updateFamilyDuet(game,()=>false,()=>{});
       if(!readFamilyDuet(game._familyDuet))throw Error("Invalid state: "+id+":"+evo);
       drawCharacter(ctx,p,{x:0,y:0},age);
       if(!drawFamilyDuet(ctx,game._familyDuet,{x:0,y:0},age,drawCharacter,ROSTER,true))throw Error("Not drawn: "+id+":"+evo);
       ctx.fillStyle="#fff5df";ctx.font="700 12px sans-serif";
       ctx.fillText(def.forms[evo].name,150,219);
       const pixels=ctx.getImageData(frame.x+14,frame.y+38,272,165).data;
       let visible=0;
       for(let i=0;i<pixels.length;i+=4)if(pixels[i]!==23||pixels[i+1]!==49||pixels[i+2]!==58)visible++;
       samples.push({id,evo,visible,age,ally:FAMILY_DUETS[id].ally});
       ctx.restore();
     }
   }
   return {samples};
 });
 assert.equal(result.samples.length,25);
 assert.ok(result.samples.every(s=>s.visible>300),"Every hero and evolution must render real vector pixels");
 assert.ok(result.samples.every(s=>s.ally!==s.id),"Every cameo must be the actual friend");
 assert.deepEqual(errors,[]);
 await fs.mkdir("test-results/family-duets",{recursive:true});
 await page.screenshot({path:"test-results/family-duets/five-heroes-x-five-forms.png"});
 console.log("PASS · V306–V310: 25 real-vector pair scenes, authored timeline and no browser errors.");
}finally{
 await browser?.close();
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
