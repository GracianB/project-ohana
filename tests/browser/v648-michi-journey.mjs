// Native keyboard + production physics. No hero/station/boss/collectible grants.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:'/usr/bin/chromium'}),out='test-results/v648';
try{
 const resume=process.env.OHANA_MICHI_RESUME;await fs.mkdir(out,{recursive:true});const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(resume){const data=JSON.parse(await fs.readFile(resume,'utf8'));await page.addInitScript(items=>{for(const item of items)localStorage.setItem(item.name,item.value);},data.origins[0].localStorage);}
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.waitForFunction(()=>window.__OHANA_E2E);
 await page.evaluate(()=>window.__OHANA_E2E.manualClock());if(resume)await page.locator('.atlas-resume').click();else await page.evaluate(()=>window.__OHANA_E2E.startWorld1('cat'));
 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state()),step=n=>page.evaluate(n=>window.__OHANA_E2E.step(n),n);
 const key=async(k,n=1)=>{await page.keyboard.down(k);const s=await step(n);await page.keyboard.up(k);return s;};
 async function film(){for(let i=0;i<25;i++){if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.waitForTimeout(250);continue;}const s=await state();if(!s.world1Cine)break;await step(270);}await page.locator('#game').focus();}
 await step(10);await page.screenshot({path:out+'/entry.png'});await film();
 let s=await state();console.log('START',s.player,s.world1,s.runtimeFaults);assert.deepEqual(errors,[]);
 async function go(x,{jump=false,max=500}={}){let lastX=-999,stuck=0;for(let i=0;i<max;i++){await film();s=await state();if(s.hp<=0)throw Error('Native death at '+JSON.stringify(s.player));let dx=x-s.player.x-s.player.w/2;if(Math.abs(dx)<14){for(let b=0;b<15&&Math.abs(s.player.vx)>.25;b++){s=await key(s.player.vx>0?'a':'d',1);}return;}const k=dx>0?'d':'a';await page.keyboard.down(k);stuck=Math.abs(s.player.x-lastX)<2?stuck+1:0;lastX=s.player.x;if((jump&&i%4===0)||stuck>2)await page.keyboard.down(' ');s=await step(Math.abs(dx)<100?3:10);await page.keyboard.up(' ');await page.keyboard.up(k);if(s.runtimeFaults)throw Error('Runtime fault');}throw Error('walk stalled '+x+' '+JSON.stringify(s.player));}
 async function lamp(x,n){await go(x);for(let i=0;i<70;i++){await film();s=await state();if(s.world1.done>=n)break;await go(x);if(i%3===0)await key('ArrowDown',50);await key(' ',10);await key('j',5);await step(12);}s=await state();assert.ok(s.world1.done>=n,'lamp '+n+' '+JSON.stringify(s));await film();console.log('LAMP',n,s.evo,s.player);await page.screenshot({path:out+'/lamp-'+n+'.png'});}
 async function passage(x){if(x===6180&&(await state()).player.y<700){console.log('CANOPY reached by physical upper route');return;}await go(x);const before=(await state()).player;for(let i=0;i<60;i++){await key('ArrowDown',1);await step(12);const p=(await state()).player;if(Math.abs(p.x-before.x)>400||Math.abs(p.y-before.y)>220){console.log('PASSAGE',x,p);return;}}throw Error('passage did not open '+x+' '+JSON.stringify((await state()).player));}

 if(!resume){await lamp(4360,1);await passage(3870);await lamp(1910,2);await passage(2860);await passage(5340);await go(7110,{jump:true});await lamp(7110,3);await passage(6180);await lamp(7030,4);await passage(7780);await passage(7820);await passage(4670);await lamp(1860,5);}

 await page.context().storageState({path:out+'/earned-lamps-storage.json'});
 const zone=(await page.evaluate(()=>window.__OHANA_E2E.michiSanctuaryState())).zone;
 if(zone==='gallery')await passage(610);if(zone==='crypt')await passage(2860);if(zone==='canopy')await passage(7780);if(['maze','canopy'].includes(zone))await passage(7820);if(zone!=='arena')await passage(5680);await film();await go(8520);
 const phases=new Set(),patterns=new Set();let deaths=0;
 for(let i=0;i<650;i++){
  await film();s=await state();if((await page.evaluate(()=>window.__OHANA_E2E.michiSanctuaryState())).guardianDefeated)break;
  if(s.hp<=0){assert.ok(++deaths<=3,'too many boss deaths');await page.evaluate(()=>window.__OHANA_E2E.respawn());await film();await go(8520);continue;}
  const boss=(await page.evaluate(()=>window.__OHANA_E2E.roomCast())).find(e=>e.michiBoss&&e.hp>0);if(!boss){await step(20);continue;}
  const b=boss.michiBoss;phases.add(b.phase);patterns.add(b.pattern);
  if(i%30===0)console.log('BOSS',i,Math.round(boss.hp),b.phase,b.pattern,Math.round(s.hp));
  if(b.phase==='warn'&&b.attack===0){await key(' ',10);}
  const distance=boss.x+boss.w/2-s.player.x-s.player.w/2;
  if(Math.abs(distance)>500)await go(boss.x-230);else await key(distance>0?'d':'a',1);
  await key('j',1);if(b.phase==='rest'){await key('l',1);await key('i',1);await key('h',1);}await step(16);
 }
 s=await state();assert.equal((await page.evaluate(()=>window.__OHANA_E2E.michiSanctuaryState())).guardianDefeated,true,'native boss victory');await film();await page.screenshot({path:out+'/boss-victory.png'});await page.context().storageState({path:out+'/earned-boss-storage.json'});console.log('PASS native boss',deaths,[...patterns]);
 assert.deepEqual(errors,[]);console.log('PASS five physically earned lamps',s.world1);await fs.writeFile(out+'/journey.json',JSON.stringify({state:await state(),errors},null,2));
}catch(e){console.error(e);throw e;}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
