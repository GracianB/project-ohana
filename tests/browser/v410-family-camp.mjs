import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';import {ROSTER} from '../../characters/roster.js';
const s=await startServer(0);let browser;
try{browser=await chromium.launch();const p=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${s.address().port}/?e2e=1`,{waitUntil:'domcontentloaded'});await p.locator('.oi-enter').click();await p.locator('#family-camp').waitFor();
const saved=await p.evaluate(()=>localStorage.getItem('ohana'));
for(const def of ROSTER){console.log('Camp audit: '+def.id);await p.locator(`.char-card[data-id="${def.id}"]`).click();assert.equal(await p.locator('#family-camp').getAttribute('data-hero'),def.id);
 for(let evo=0;evo<5;evo++){await p.locator(`[data-camp-form="${evo}"]`).click();assert.equal(await p.locator('#camp-form-name').textContent(),def.evoNames[evo]);assert.equal(await p.locator('#camp-stats dd').first().textContent(),String(def.forms[evo].hp));await p.waitForTimeout(60);assert.ok(await p.locator('#camp-portrait').evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some(v=>v>0)));}
 await p.locator('#camp-film').click();assert.equal(await p.locator('#camp-film-stop').isVisible(),true);const line=await p.locator('#camp-line').textContent();await p.waitForTimeout(120);assert.equal(await p.locator('#camp-line').textContent(),line);await p.locator('#camp-film-stop').click();
}
assert.equal(await p.evaluate(()=>localStorage.getItem('ohana')),saved,'camp exploration must not change campaign save');
// World 1 uses a circular chapter garden, not the earlier six-column grid.
// Select Dino through its actual Canvas hit-box, shared with game rendering.
assert.equal(await p.locator('#family-camp').getAttribute('data-world'),'1');
await p.locator('.char-card[data-id="kilo"]').click();
await p.locator('#camp-canvas').scrollIntoViewIfNeeded();
const r=await p.locator('#camp-canvas').boundingBox();
const rect=await p.evaluate(async({width,height})=>{
 const {createWorld1Select,world1SelectCardRects}=await import('/systems/world1-select.js');
 const sel=createWorld1Select({start:'kilo'}),cards=world1SelectCardRects(sel,width,height);
 return cards[sel.cards.findIndex(card=>card.hero==='dino')];
},{width:r.width,height:r.height});
assert.ok(rect&&rect.w>0&&rect.h>0,'Dino must have a real selectable portal');
await p.mouse.click(r.x+rect.x+rect.w/2,r.y+rect.y+rect.h/2);
assert.equal(await p.locator('#family-camp').getAttribute('data-hero'),'dino','Canvas portal must select Dino');
// Selecting Kilo from the HTML cards must reset keyboard navigation to Kilo,
// not continue from the previous Canvas index (Dino).
await p.locator('.char-card[data-id="kilo"]').click();
await p.locator('#camp-canvas').focus();
await p.keyboard.press('ArrowRight');
assert.equal(await p.locator('#family-camp').getAttribute('data-hero'),'stitcho','ArrowRight from Kilo must focus Stitcho');
await p.keyboard.press('Enter');
assert.match(await p.locator('#camp-line').textContent(),/sello de Kilo/i,'locked World 1 room must explain which seal unlocks it');
await fs.mkdir('test-results/visual',{recursive:true});
for(const [name,width,height] of [['desktop',1440,1050],['mobile',390,844],['landscape',844,390]]){await p.setViewportSize({width,height});await p.locator('.char-card[data-id="cuerno"]').click();await p.waitForTimeout(600);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' overflow');
 const cards=await p.locator('.char-card').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height,x:r.x,right:r.right}}));assert.equal(cards.length,10);assert.ok(cards.every(r=>r.w>=40&&r.h>=44&&r.x>=0&&r.right<=width+1));await p.screenshot({path:`test-results/visual/v410-camp-${name}.png`,fullPage:true,timeout:20000});}
assert.equal(await p.locator('.camp-mystery canvas').count(),0);assert.equal(await p.locator('.u-partner-panel').isVisible(),false);
// Cuerno was selected only to audit the three viewport layouts. A clean
// campaign has not earned the previous four seals, so entry MUST remain locked.
// Return to the genuinely unlocked Kilo chapter before checking game start.
await p.locator('.char-card[data-id="kilo"]').click();
assert.equal(await p.locator('#family-camp').getAttribute('data-hero'),'kilo');
await p.locator('#camp-start').click();await p.waitForFunction(()=>document.body.classList.contains('playing'));assert.deepEqual(errors,[]);console.log('PASS V410: ten heroes × five real forms, stats, voluntary films, saved-game isolation, Canvas hit selection, keyboard walking, mystery and desktop/mobile/landscape');
}finally{await browser?.close();s.closeAllConnections();await new Promise(r=>s.close(r));}
