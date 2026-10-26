import fs from'node:fs/promises';import assert from'node:assert/strict';import{chromium}from'playwright';import{startServer}from'./server.mjs';
const server=await startServer(0);let browser;const errors=[];
try{browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});await fs.mkdir('test-results/v602',{recursive:true});
for(const [name,viewport]of[['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
 const page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.waitForTimeout(2000);await page.screenshot({path:`test-results/v602/opening-${name}.png`});
 await page.locator('#ohana-intro button').filter({hasText:'EMPEZAR'}).click();await page.waitForTimeout(1000);await page.screenshot({path:`test-results/v602/selection-${name}.png`});
 const buttons=await page.locator('.hero-stage button[data-id]').count();console.log(name,{buttons});
 await page.close();
}
const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
await page.evaluate(async()=>{document.body.innerHTML='<canvas id="gallery" width="1440" height="900"></canvas>';const c=document.querySelector('canvas').getContext('2d'),{drawChapterBossV2}=await import('/systems/chapter-boss-art-v2.js'),{KEEPSAKES,KEEPSAKE_ORDER}=await import('/systems/keepsakes.js');c.fillStyle='#122331';c.fillRect(0,0,1440,900);for(const[i,hero]of KEEPSAKE_ORDER.entries()){const x=55+i%5*280,y=120+Math.floor(i/5)*400,e={x,y,w:184,h:224,hp:820,max:820,miniBoss:true,roomId:'w1-final',gauntletBoss:hero,evolved:true,[KEEPSAKES[hero].key]:{phase:'rest',clock:70,tick:50}};drawChapterBossV2(c,e,{x:0,y:0},50);c.fillStyle='white';c.font='16px sans-serif';c.fillText(hero,x,y+270);}});await page.screenshot({path:'test-results/v602/evolved-guardians.png'});assert.deepEqual(errors,[]);console.log('PASS presentation');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
