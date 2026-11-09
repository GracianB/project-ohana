// Dino / Dragon: visible acceptance of every real playable form and authored
// guardian. This inspects the game's Canvas rigs, not historic raster sprites.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';

const server=await startServer(0);
let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1280,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await fs.mkdir('test-results/dino-dragon',{recursive:true});
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__OHANA_E2E);

 for(const heroId of ['dino','dragon']){
  const report=await page.evaluate(async heroId=>{
   const [{ROSTER},{drawCharacter},{campActor},dinoBoss,dragonBoss]=await Promise.all([
    import('/characters/roster.js'),import('/characters/draw.js'),
    import('/systems/family-camp.js'),import('/systems/dino-boss.js'),
    import('/systems/dragon-boss.js')
   ]);
   const hero=ROSTER.find(x=>x.id===heroId);
   if(!hero||hero.forms.length!==5||hero.evoNames.length!==5)throw Error(heroId+' lacks five actual forms');
   const bg='#10212e';
   const hash=(canvas)=>{
    const data=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,canvas.width,canvas.height).data;
    let digest=2166136261,solid=0;
    for(let i=0;i<data.length;i+=4){
     if(data[i+3])solid++;
     for(let n=0;n<4;n++)digest=Math.imul(digest^data[i+n],16777619);
    }
    return {digest:digest>>>0,pixels:solid};
   };
   const overlay=document.createElement('section');
   overlay.id='dd-form-boss-atlas';
   overlay.style.cssText='position:fixed;left:0;top:0;z-index:2147483000;width:1250px;max-height:1000px;overflow:auto;padding:20px;background:#081825;color:#f4f2da;box-sizing:border-box;font:600 13px sans-serif;';
   const heading=document.createElement('h1');
   heading.textContent=(heroId==='dino'?'DINO · FORMAS Y COLOSO':'DRAGÓN · FORMAS Y GUARDIÁN')+' · MOTOR CANVAS';
   heading.style.cssText='font:800 24px sans-serif;margin:0 0 18px;';
   overlay.append(heading);
   const grid=document.createElement('div');
   grid.style.cssText='display:grid;grid-template-columns:repeat(5,220px);gap:15px 18px;';
   const observations=[];
   for(const pose of ['idle','attack']){
    for(let evo=0;evo<5;evo++){
     const box=document.createElement('div');
     const title=document.createElement('p');
     title.textContent=hero.evoNames[evo]+' · Forma '+(evo+1)+' · '+pose.toUpperCase();
     title.style.cssText='font-size:12px;min-height:28px;color:#ffe5a2;margin:0;';
     const c=document.createElement('canvas');c.width=220;c.height=255;c.style.background=bg;
     const ctx=c.getContext('2d',{willReadFrequently:true});
     ctx.save();ctx.translate(110,225);
     drawCharacter(ctx,campActor(hero,evo,pose,156),{x:0,y:0},75,{reduceMotion:false});
     ctx.restore();
     const m=hash(c);
     if(m.pixels<100)throw Error(heroId+' '+pose+' form '+evo+' is blank');
     observations.push({evo,pose,...m});
     box.append(title,c);grid.append(box);
    }
   }
   const idle=observations.filter(o=>o.pose==='idle').map(o=>o.digest);
   if(new Set(idle).size!==5)throw Error(heroId+' has indistinguishable form art in the 5-form atlas');
   overlay.append(grid);document.body.append(overlay);

   // Use each production boss factory, the real growth-chapter illustration,
   // and all three escalating tiers, with preparation/attack/rest cues.
   const bossModule=heroId==='dino'?dinoBoss:dragonBoss;
   const boss=bossModule[heroId==='dino'?'createDinoBoss':'createDragonBoss'](
    (x,y)=>({x,y,invuln:0,stun:0,vx:0,vy:0}),
    ()=>.5,{chapter:heroId,roomId:'w1-'+heroId,x:8750,arena:{left:8260,right:9320,floor:1134,hp:640}}
   );
   const state=heroId==='dino'?boss._stoneColossus:boss._igneousDragon;
   const draw=heroId==='dino'?dinoBoss.drawDinoBoss:dragonBoss.drawDragonBoss;
   const gallery=document.createElement('section');
   gallery.id='dd-boss-gallery';
   gallery.style.cssText='display:grid;grid-template-columns:repeat(3,370px);gap:18px;margin-top:28px;';
   const phases=['warn','attack','rest'],art=[];
   for(let n=0;n<phases.length;n++){
    state.phase=phases[n];state.tier=n+1;state.attack=n;
    state.exposed=n===2;state.aim=1;
    boss.telegraph=n===0;
    boss.hp=boss.max*[.88,.55,.2][n];
    const block=document.createElement('div');
    const title=document.createElement('strong');
    title.textContent='FASE '+(n+1)+' · '+phases[n].toUpperCase();
    const canvas=document.createElement('canvas');
    canvas.width=370;canvas.height=350;canvas.style.background=bg;
    const c=canvas.getContext('2d',{willReadFrequently:true});
    draw(c,boss,{x:boss.x-160,y:boss.y-85},90,false);
    const metrics=hash(canvas);
    if(metrics.pixels<500)throw Error(heroId+' guardian '+phases[n]+' is invisible');
    art.push({phase:phases[n],tier:n+1,...metrics});
    block.append(title,canvas);gallery.append(block);
   }
   if(new Set(art.map(x=>x.digest)).size!==3)
    throw Error(heroId+' guardian phases do not read as distinct');
   overlay.append(gallery);
   return {hero:heroId,observations,guardian:art};
  },heroId);

  assert.equal(report.observations.length,10);
  assert.equal(report.guardian.length,3);
  await page.locator('#dd-form-boss-atlas').screenshot({
   path:'test-results/dino-dragon/'+heroId+'-five-forms-and-three-boss-phases.png'
  });
  await page.evaluate(()=>document.querySelector('#dd-form-boss-atlas')?.remove());
  await fs.writeFile('test-results/dino-dragon/'+heroId+'-form-guardian-metrics.json',
   JSON.stringify(report,null,2)+'\n');
 }
 assert.deepEqual(errors,[]);
 console.log('DINO DRAGON PASSED: 10 playable forms, 20 pose renders and six real boss tier/phase frames.');
}finally{
 await browser?.close();
 server.closeAllConnections?.();
 await new Promise(done=>server.close(done));
}