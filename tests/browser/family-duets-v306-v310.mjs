import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {chromium} from "playwright";
import {startServer} from "./server.mjs";

// V305–V311: actual Canvas art for 6 heroes x 5 forms x 5 chapters.
// Distinct screenshots permit visual inspection without stopping combat or
// displaying a fullscreen U. No fake sprites and no visual-only stub of L.
const STAGES=[
 {name:"arrival",age:10},
 {name:"handoff",age:28},
 {name:"first-L-impact",age:42},
 {name:"second-L-impact",age:66},
 {name:"farewell",age:112}
];
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1500,height:1570}});
 const errors=[];page.on("pageerror",error=>errors.push(error.message));
 await page.route("**/family-duets-preview",route=>route.fulfill({contentType:"text/html",body:"<html><body></body></html>"}));
 await page.goto(`http://127.0.0.1:${server.address().port}/family-duets-preview`);
 await page.setContent('<canvas id="audit" width="1500" height="1570"></canvas><style>body{margin:0;background:#14232b}</style>');
 const all=[];
 await fs.mkdir("test-results/family-duets",{recursive:true});
 for(const stage of STAGES){
  const result=await page.evaluate(async ({stage})=>{
   const {ROSTER}=await import("/characters/roster.js");
   const {drawCharacter}=await import("/characters/draw.js");
   const {FAMILY_DUETS,startFamilyDuet,updateFamilyDuet,drawFamilyDuet,readFamilyDuet,familyDuetChoreography}
     =await import("/systems/family-duets.js");
   localStorage.setItem("ohana-look-v2","vector");
   const heroes=["dragon","dino","frita","pizza","yomi","cuerno"];
   const canvas=document.querySelector("#audit"),ctx=canvas.getContext("2d");
   ctx.clearRect(0,0,canvas.width,canvas.height);
   ctx.fillStyle="#14232b";ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.textAlign="center";ctx.font="800 22px sans-serif";ctx.fillStyle="#fff5df";
   ctx.fillText("OHANA V311 · "+stage.name+" · seis familias y cinco evoluciones",750,35);
   const samples=[];
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
      for(let tick=0;tick<stage.age;tick++)updateFamilyDuet(game,()=>false,()=>{});
      const state=readFamilyDuet(game._familyDuet),choreography=familyDuetChoreography(state,true);
      if(!state||!choreography)throw Error("Invalid choreography: "+id+":"+evo);
      const actors=[];
      drawCharacter(ctx,p,{x:0,y:0},stage.age);
      const drawn=drawFamilyDuet(ctx,game._familyDuet,{x:0,y:0},stage.age,
       (...args)=>{actors.push(args[1].id);return drawCharacter(...args);},ROSTER,true);
      if(!drawn||actors.length!==1||actors[0]!==FAMILY_DUETS[id].ally)
        throw Error("Friend missing: "+id+":"+evo+"/"+stage.name);
      ctx.fillStyle="#fff5df";ctx.font="700 12px sans-serif";ctx.fillText(def.forms[evo].name,150,219);
      const pixels=ctx.getImageData(frame.x+14,frame.y+38,272,165).data;
      let visible=0;
      for(let i=0;i<pixels.length;i+=4)
       if(pixels[i]!==23||pixels[i+1]!==49||pixels[i+2]!==58)visible++;
      samples.push({id,evo,stage:stage.name,visible,ally:actors[0],
       pose:choreography.stage,actualL:choreography.borrowedL});
      ctx.restore();
    }
   }
   return samples;
  },{stage});
  assert.equal(result.length,30);
  assert.ok(result.every(s=>s.visible>300),"Every hero and evolution must render real vector pixels");
  assert.ok(result.every(s=>s.ally!==s.id),"Every cameo must be the actual friend");
  all.push(...result);
  await page.screenshot({path:`test-results/family-duets/scene-${stage.name}.png`});
 }
 assert.equal(all.length,150);
 assert.equal(new Set(all.map(x=>x.id+"/"+x.evo+"/"+x.stage)).size,150);
 assert.deepEqual(errors,[]);
 await fs.writeFile("test-results/family-duets/audit.json",JSON.stringify({frames:all.length,scenes:all},null,2));
 console.log("PASS · OHANA V305–V311: 150 real Canvas scenes across six heroes, five evolutions, five U chapters.");
}finally{
 await browser?.close();
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
