import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import{chromium}from'playwright';import{startServer}from'./server.mjs';import{playGauntlet}from'./gauntlet-controls.mjs';
const difficulty=process.env.OHANA_TEST_DIFFICULTY||'normal';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('BROWSER',m.text());});await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 const saved=JSON.parse(await fs.readFile('test-results/v600/earned-campaign-storage.json','utf8'));
 console.log('SAVE_KEYS',Object.keys(saved));
 await page.evaluate(({saved,difficulty})=>{
  localStorage.clear();
  for(const {name,value}of saved.origins[0].localStorage){
   if(['ohana','ohana.tmp'].includes(name)){const profile=JSON.parse(value);profile.keepsakes=[];profile.world1Won=false;if(profile.secrets)delete profile.secrets['w1-final'];localStorage.setItem(name,JSON.stringify(profile));}
   else if(!['ohana-keepsakes-v1','ohana-final-resonances-v1','ohana-resume'].includes(name))localStorage.setItem(name,value);
  }
  localStorage.setItem('ohana-difficulty',difficulty);const e=window.__OHANA_E2E;e.startWorld1('kilo');e.loadRoom('w1-final');
 },{saved,difficulty});
 await fs.mkdir('test-results/v603',{recursive:true});
 const result=await playGauntlet(page,{onBeat:async s=>{await fs.writeFile(`test-results/v603/${difficulty}-gauntlet-current.json`,JSON.stringify(s));await page.screenshot({path:`test-results/v603/${difficulty}-gauntlet-current.png`});}});
 assert.equal(result.duels.length,10,'the replay must actually fight every guardian, not reuse the saved rescue list');assert.ok(result.cinematics.includes('keepsakeIntro'));assert.ok(result.cinematics.includes('keepsakeRescue'));
 assert.deepEqual(errors,[]);await fs.writeFile(`test-results/v603/${difficulty}-gauntlet-results.json`,JSON.stringify({difficulty,result,errors,scope:'Earned chapter-seal backup with prior final rescues removed for this isolated replay; native ritual choices and physical combat. No new full campaign claim.',state:await page.evaluate(()=>window.__OHANA_E2E.state())},null,2));console.log('PASS',result);
}finally{await browser?.close();await new Promise(r=>server.close(r));}
