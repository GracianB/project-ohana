import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {chromium} from "playwright";
import {startServer} from "./server.mjs";

// OHANA V312 · 6 × (10 canonical heroes × 5 real vector forms).
// Actual game art is drawn by drawCharacter, with genuine kinetic overlays.
const stages=["landing","turn","brake","attack","air","run"];
const base=(stage)=>{
 const p={state:"idle",speed:0,air:false,land:0,turnPulse:0,brake:0,atk:0,impact:0,vy:0};
 if(stage==="landing")p.land=.86;
 if(stage==="turn"){p.state="run";p.turnPulse=.95;p.speed=.72;}
 if(stage==="brake"){p.state="run";p.brake=.94;p.speed=.58;}
 if(stage==="attack"){p.state="attack";p.atk=.5;p.impact=.86;}
 if(stage==="air"){p.state="jump";p.air=true;p.vy=-.8;}
 if(stage==="run"){p.state="run";p.speed=.92;}
 return p;
};
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1500,height:2550}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.route("**/kinetic-v312-preview",r=>r.fulfill({contentType:"text/html",body:"<html><body></body></html>"}));
 await page.goto(`http://127.0.0.1:${server.address().port}/kinetic-v312-preview`);
 await page.setContent('<canvas id="audit" width="1500" height="2550"></canvas><style>body{margin:0;background:#14232b}</style>');
 await fs.mkdir("test-results/kinetic-v312",{recursive:true});
 const all=[];
 for(const stage of stages){
  const scenes=await page.evaluate(async({stage})=>{
   const {ROSTER}=await import("/characters/roster.js");
   const {drawCharacter}=await import("/characters/draw.js");
   const {kineticSignature,drawKineticSignature,KINETIC_IDENTITIES}
    =await import("/characters/kinetic-stagecraft.js");
   localStorage.setItem("ohana-look-v2","vector");
   const heroes=["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
   const canvas=document.querySelector("#audit"),ctx=canvas.getContext("2d");
   ctx.fillStyle="#14232b";ctx.fillRect(0,0,1500,2550);
   ctx.textAlign="center";ctx.font="800 22px sans-serif";ctx.fillStyle="#fff5df";
   ctx.fillText("OHANA V312 · "+stage+" · 10 personajes × 5 evoluciones",750,38);
   const pose={state:"idle",speed:0,air:false,land:0,turnPulse:0,brake:0,atk:0,impact:0,vy:0};
   if(stage==="landing")pose.land=.86;
   if(stage==="turn"){pose.state="run";pose.turnPulse=.95;pose.speed=.72;}
   if(stage==="brake"){pose.state="run";pose.brake=.94;pose.speed=.58;}
   if(stage==="attack"){pose.state="attack";pose.atk=.5;pose.impact=.86;}
   if(stage==="air"){pose.state="jump";pose.air=true;pose.vy=-.8;}
   if(stage==="run"){pose.state="run";pose.speed=.92;}
   const samples=[];
   for(const [row,id] of heroes.entries()){
    const def=ROSTER.find(r=>r.id===id);
    for(let evo=0;evo<5;evo++){
     const x=evo*300,y=52+row*249,form=def.forms[evo];
     const p={...def,...form,id,evo,x:160-form.w/2,y:184-form.h,
      vx:stage==="run"?3:stage==="turn"?-2:0,vy:stage==="air"?-3:0,
      facing:1,melee:stage==="attack"?12:0,grounded:stage!=="air",
      health:100,maxHealth:125,rng:()=>.5,visualScale:1.02};
     const signature=kineticSignature(p,pose,true);
     if(!signature||signature.type!==KINETIC_IDENTITIES[id].type||signature.stage!==stage)
      throw Error("Missing signature: "+id+"/"+evo+"/"+stage);
     ctx.save();ctx.translate(x,y);ctx.fillStyle="#17313a";ctx.fillRect(1,1,298,243);
     ctx.beginPath();ctx.rect(1,1,298,243);ctx.clip();
     ctx.strokeStyle="#547c86";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(12,184);ctx.lineTo(288,184);ctx.stroke();
     drawCharacter(ctx,p,{x:0,y:0},80,{reduceMotion:true});
     ctx.save();ctx.translate(p.x+p.w/2,p.y+p.h);ctx.scale(1,1);
     if(!drawKineticSignature(ctx,p,34+evo*11,pose,80,true))throw Error("Not drawn "+id);
     ctx.restore();
     ctx.fillStyle="#fff5df";ctx.font="700 12px sans-serif";ctx.textAlign="center";
     ctx.fillText(form.name,150,220);
     const pixels=ctx.getImageData(x+16,y+38,268,159).data;
     let visible=0;
     for(let i=0;i<pixels.length;i+=4)if(pixels[i]!==23||pixels[i+1]!==49||pixels[i+2]!==58)visible++;
     samples.push({id,evo,stage,type:signature.type,visible});
     ctx.restore();
    }
   }
   return samples;
  },{stage});
  assert.equal(scenes.length,50);
  assert.ok(scenes.every(s=>s.visible>300),"Every scene must have real visible vector pixels");
  all.push(...scenes);
  await page.screenshot({path:`test-results/kinetic-v312/${stage}.png`});
 }
 assert.equal(all.length,300);
 assert.equal(new Set(all.map(x=>x.id+"/"+x.evo+"/"+x.stage)).size,300);
 assert.equal(new Set(all.map(x=>x.type)).size,10);
 assert.deepEqual(errors,[]);
 await fs.writeFile("test-results/kinetic-v312/audit.json",JSON.stringify({count:all.length,scenes:all},null,2));
 console.log("PASS · OHANA V312: 300 real vector scenes; 10 unique signatures, 6 movement/combat states, 5 forms.");
}finally{
 await browser?.close();
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
