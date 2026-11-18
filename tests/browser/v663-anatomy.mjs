import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/gallery.html`);
 const result=await page.evaluate(async()=>{
  const {drawQuimeraCreature}=await import('/systems/quimera-art.js'),{createFusionBoss}=await import('/systems/fusion-boss.js');
  const canvas=document.createElement('canvas');canvas.width=600;canvas.height=600;const c=canvas.getContext('2d');const signatures=[],stable=[],pure=[],alpha=[];
  for(const attack of ['ola','plasma','rayos','medusas','embestida','aliento','ruedas']){
   const e=createFusionBoss();Object.assign(e,{x:185,y:270,phase:4});Object.assign(e._fusion,{mode:'warn',attack,clock:12,warnMax:78});
   const before=JSON.stringify(e);c.clearRect(0,0,600,600);drawQuimeraCreature(c,e,{},70,true);const a=canvas.toDataURL();signatures.push(a);c.clearRect(0,0,600,600);drawQuimeraCreature(c,e,{},900,true);stable.push(a===canvas.toDataURL());pure.push(before===JSON.stringify(e));
   c.clearRect(0,0,600,600);c.globalAlpha=0;drawQuimeraCreature(c,e,{},70);alpha.push(c.getImageData(0,0,600,600).data.every(x=>x===0));c.globalAlpha=1;
  }
  return {distinct:new Set(signatures).size,stable:stable.every(Boolean),pure:pure.every(Boolean),inheritedAlpha:alpha.every(Boolean)};
 });
 assert.ok(result.distinct>=6,JSON.stringify(result));assert.ok(result.stable);assert.ok(result.pure);assert.ok(result.inheritedAlpha);console.log('PASS V663 anatomy',JSON.stringify(result));
}finally{await browser.close();server.closeAllConnections();server.close();}
