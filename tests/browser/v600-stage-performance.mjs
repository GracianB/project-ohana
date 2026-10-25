// Real animated menu and an earned celebration, measured at ordinary RAF pace.
// The collection backup was physically earned by v513-all-memories.mjs.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),report=[];
 async function measure(scene){
  const result=await page.evaluate(()=>new Promise(resolve=>{let prev=0,n=0;const samples=[];function frame(t){if(prev&&n>20)samples.push(t-prev);prev=t;if(++n<111)requestAnimationFrame(frame);else{samples.sort((a,b)=>a-b);resolve({median:samples[45],p95:samples[85],over50:samples.filter(x=>x>50).length,frames:samples.length});}}requestAnimationFrame(frame);}));
  report.push({scene,...result});console.log('STAGE FRAME',JSON.stringify(report.at(-1)));
 }
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await measure('opening');
 await page.locator('.oi-enter').click();await page.locator('#family-camp').waitFor();await measure('chapter-selection');
 const earned=JSON.parse(await fs.readFile('test-results/v600/all-memory-storage.json','utf8'));
 await page.evaluate(storage=>{for(const origin of storage.origins)for(const item of origin.localStorage)localStorage.setItem(item.name,item.value);window.__OHANA_E2E.startWorld1('yomi');window.__OHANA_E2E.step(600);},earned);
 await page.locator('#game').focus();await page.keyboard.press('b');
 await page.getByRole('button',{name:'Ver mi celebración'}).click();await page.waitForFunction(()=>document.body.classList.contains('relic-cinema')); 
 await measure('earned-Yomi-celebration');
 await fs.writeFile('test-results/v600/stage-performance.json',JSON.stringify(report,null,2));
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
