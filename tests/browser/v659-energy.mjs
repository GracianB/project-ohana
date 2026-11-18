import assert from'node:assert/strict';import fs from'node:fs/promises';import{chromium}from'playwright';import{startServer}from'./server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'}),dir='test-results/v659';
try{await fs.mkdir(dir,{recursive:true});const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/gallery.html`);
 const report=await p.evaluate(async()=>{const F=await import('/systems/fusion-boss.js'),{WORLD1_FLOOR:floor,WORLD1_ARENA:A}=await import('/systems/world1-rooms.js');const sheet=document.createElement('canvas');sheet.width=1400;sheet.height=900;const out=sheet.getContext('2d');out.fillStyle='#0b192a';out.fillRect(0,0,1400,900);const rows=[];
 for(const[i,k]of['bolt','geyser','beam'].entries()){
  const s={k,x:k==='beam'?(A.left+A.right)/2:100,r:k==='beam'?0:34,life:k==='bolt'?17:40,liveFor:50,band:floor-130,age:17,col:['#c8eddf','#edce95','#8ecfe6'][i]},box=F.fusionShotBounds(s),cam={x:box.x-10,y:box.y-10},c=document.createElement('canvas');c.width=box.w+20;c.height=box.h+20;const ctx=c.getContext('2d');
  const render=(age,reduce)=>{s.age=age;ctx.clearRect(0,0,c.width,c.height);F.drawFusionProjectiles(ctx,{shots:[s]},cam,age,reduce);return c.toDataURL();};
  const before=JSON.stringify(s),a=render(17,false),b=render(31,false),ra=render(17,true),rb=render(90,true);s.age=17;const pure=JSON.stringify(s)===before;render(17,false);
  const pixels=ctx.getImageData(0,0,c.width,c.height).data;let solid=0,outside=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const alpha=pixels[(y*c.width+x)*4+3];if(alpha>128)solid++;if(alpha>24&&(x<9||x>box.w+11||y<9||y>box.h+11))outside++;}
  rows.push({kind:k,solidRatio:solid/(box.w*box.h),animates:a!==b,reduced:ra===rb,pure,outside});out.fillStyle='#d5eddf';out.font='18px system-ui';out.fillText(k.toUpperCase(),30+i*450,32);
  if(k==='beam'){out.drawImage(c,0,0,Math.min(1100,c.width),c.height,30,730,1340,100);}else out.drawImage(c,30+i*450,55,180,k==='bolt'?630:580);
 }
 return{rows,image:sheet.toDataURL().split(',')[1]};});
 for(const r of report.rows){assert.ok(r.solidRatio<.5&&r.solidRatio>.005,r.kind+' must have open space, not a filled bar');assert.ok(r.animates&&r.reduced&&r.pure);assert.equal(r.outside,0);}
 await fs.writeFile(`${dir}/energy-materials.png`,Buffer.from(report.image,'base64'));delete report.image;
 await p.goto(`http://127.0.0.1:${server.address().port}/previews/quimera-design.html`);await p.waitForFunction(()=>window.previewReady);for(const id of['rayos','geiseres']){await p.selectOption('#attack',id);await p.waitForFunction(k=>document.querySelector('canvas').dataset.activeKinds.split(',').includes(k),id==='rayos'?'bolt':'geyser',{timeout:15000});await p.screenshot({path:`${dir}/${id}.png`});}
 await p.selectOption('#attack','special-3');await p.waitForFunction(()=>document.querySelector('canvas').dataset.activeKinds.split(',').includes('beam'),null,{timeout:20000});await p.screenshot({path:`${dir}/special-sweep.png`});
 await p.setViewportSize({width:390,height:844});await p.selectOption('#attack','rayos');await p.waitForFunction(()=>document.querySelector('canvas').dataset.activeKinds.split(',').includes('bolt'),null,{timeout:15000});await p.screenshot({path:`${dir}/energy-mobile.png`});assert.deepEqual(errors,[]);await fs.writeFile(`${dir}/validation.json`,JSON.stringify({...report,errors},null,2));console.log('PASS V659: three open energy silhouettes, animation, reduced motion, pure renderer and exact collision clipping',JSON.stringify(report.rows));
}finally{await browser.close();server.closeAllConnections();server.close();}
