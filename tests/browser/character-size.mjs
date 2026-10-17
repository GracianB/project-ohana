import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try {
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1360,height:1100}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/previews/cuerno-design.html`);
 await page.waitForFunction(()=>window.previewReady);await page.evaluate(()=>window.cuernoPreview.setFrame(40));
 const audit=await page.evaluate(async()=>{
  const {drawCharacter}=await import('/characters/draw.js'),{ROSTER}=await import('/characters/roster.js'),{setLook}=await import('/characters/look.js');
  await (await import('/characters/art/chispa-sprite.js')).preloadChispaAtlas();
  const result=[];const canvas=document.createElement('canvas');canvas.width=canvas.height=700;const ctx=canvas.getContext('2d');
  for(const look of ['vector','paint']){setLook(look);
   for(const id of ROSTER.map(r=>r.id))for(let evo=0;evo<5;evo++) {
    ctx.reset();const f=ROSTER.find(r=>r.id===id).forms[evo];
    const p={id,evo,x:350-f.w/2,y:450-f.h,w:f.w,h:f.h,color:f.color,vx:0,vy:0,grounded:true,facing:1,melee:0,invuln:0,speed:f.speed};
    const before=[p.x,p.y,p.w,p.h];drawCharacter(ctx,p,{x:0,y:0},40);
    const after=[p.x,p.y,p.w,p.h],data=ctx.getImageData(0,0,700,700).data;let top=700,bottom=0;
    for(let y=0;y<700;y++)for(let x=0;x<700;x++)if(data[(y*700+x)*4+3]>150){top=Math.min(top,y);bottom=Math.max(bottom,y)}
    result.push({look,id,evo,height:bottom-top+1,before,after});
   }
  }setLook('vector');return result;
 });

 for(const row of audit){assert.deepEqual(row.before,row.after,'hitbox changed');const target=[55,70,85,102,120][row.evo];assert.ok(Math.abs(row.height-target)<15,`${row.id} F${row.evo} ${row.look}: ${row.height}px`)}
 for(const id of new Set(audit.map(r=>r.id)))for(let evo=1;evo<5;evo++)assert.ok(audit.find(r=>r.look==='vector'&&r.id===id&&r.evo===evo).height>audit.find(r=>r.look==='vector'&&r.id===id&&r.evo===evo-1).height);
 await fs.mkdir('test-results/visual',{recursive:true});await page.screenshot({path:'test-results/visual/cuerno-design.png',fullPage:true});
 for(const pose of ['blink','victory','shy','curious','hurt','death','attack','trail']){await page.selectOption('#pose',pose);await page.evaluate(()=>window.cuernoPreview.setFrame(50));assert.equal(await page.locator('.evolutions canvas').count(),5)}
 await page.getByRole('button',{name:'Girar'}).click();assert.equal(await page.locator('#mirror').getAttribute('aria-pressed'),'true');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile horizontal overflow');
 await page.emulateMedia({reducedMotion:'reduce'});await page.selectOption('#pose','idle');
 const pixels=()=>page.evaluate(()=>[...document.querySelectorAll('.evolutions canvas')].map(c=>c.toDataURL()));const first=await pixels();await page.waitForTimeout(150);assert.deepEqual(await pixels(),first);
 assert.deepEqual(errors,[]);console.log('PASS: 100 rendered size checks across all 50 forms, increasing evolutions, unchanged hitboxes, Cuerno expressions and mobile/reduced-motion preview');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
