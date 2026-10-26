import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import{chromium}from'playwright';import{startServer}from'./server.mjs';import{playGauntlet}from'./gauntlet-controls.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('BROWSER',m.text());});await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 const saved=JSON.parse(await fs.readFile('test-results/v600/earned-campaign-storage.json','utf8'));
 console.log('SAVE_KEYS',Object.keys(saved));
 await page.evaluate(saved=>{localStorage.clear();for(const[k,v]of saved.origins[0].localStorage.map(({name,value})=>[name,value]))localStorage.setItem(k,v);localStorage.removeItem('ohana-keepsakes-v1');localStorage.setItem('ohana-difficulty','normal');const e=window.__OHANA_E2E;e.startWorld1('kilo');e.loadRoom('w1-final');dispatchEvent(new CustomEvent('ohana-after',{detail:{action:'repeat'}}));},saved);
 await fs.mkdir('test-results/v602',{recursive:true});
 const result=await playGauntlet(page,{onBeat:async s=>{await fs.writeFile('test-results/v602/gauntlet-current.json',JSON.stringify(s));await page.screenshot({path:'test-results/v602/gauntlet-current.png'});}});
 assert.deepEqual(errors,[]);await fs.writeFile('test-results/v602/gauntlet-results.json',JSON.stringify({result,errors,state:await page.evaluate(()=>window.__OHANA_E2E.state())},null,2));console.log('PASS',result);
}finally{await browser?.close();await new Promise(r=>server.close(r));}
