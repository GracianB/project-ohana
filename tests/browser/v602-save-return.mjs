// Reload an actually earned campaign backup through normal menu controls.
import fs from'node:fs/promises';import assert from'node:assert/strict';import{chromium}from'playwright';import{startServer}from'./server.mjs';
const server=await startServer(0);let browser;
try{browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));const save=JSON.parse(await fs.readFile('test-results/v600/earned-campaign-storage.json','utf8'));await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.evaluate(save=>{localStorage.clear();for(const o of save.origins)for(const v of o.localStorage)localStorage.setItem(v.name,v.value);},save);await page.reload();await page.locator('.oi-enter').click();
const original=await page.evaluate(()=>localStorage.getItem('ohana-keepsakes-v1'));assert.equal(JSON.parse(original).length,10);
for(const hero of ['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi']){await page.locator(`.char-card[data-id="${hero}"]`).click();assert.match(await page.locator('#camp-keepsake').textContent(),/A SALVO/);}
assert.equal(await page.evaluate(()=>localStorage.getItem('ohana-keepsakes-v1')),original,'looking at belongings cannot alter their save');
await page.screenshot({path:'test-results/v602/earned-return-selection.png',fullPage:true});assert.deepEqual(errors,[]);console.log('PASS reload: ten earned personal objects return to their owners, menu exploration preserves save');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
