// Actual Canvas state recovery: an external actor adapter may decline or throw
// after ordinary save/transform/clip calls. The canonical fallback must still
// paint in its own scene and leave the caller's Canvas state balanced.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const publicBase=process.env.OHANA_TEST_BASE_URL,dir='test-results/v628',server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 await fs.mkdir(dir,{recursive:true});const page=await browser.newPage({ignoreHTTPSErrors:!!publicBase});
 const base=publicBase||'http://127.0.0.1:'+server.address().port+'/';
 await page.goto(base+'gallery.html');
 const result=await page.evaluate(async base=>{
  const {drawWorld1Cine,buildWorld1Scene}=await import(new URL('systems/world1-cine.js',base).href);
  const {drawWorld1Select,createWorld1Select}=await import(new URL('systems/world1-select.js',base).href);
  const {WORLD1_ORDER}=await import(new URL('systems/world1-rooms.js',base).href);
  const {drawFamilyActor}=await import(new URL('systems/family-actor.js',base).href);
  const cases={
   missing:null,
   canonical:(ctx,hero,x,y,scale,acting)=>drawFamilyActor(ctx,hero,x,y,scale,0,acting,true),
   throwing:()=>{throw Error('fixture: painter unavailable');},
   declined:()=>false,
   translated:ctx=>{ctx.translate(8000,4000);throw Error('fixture: failed after transform');},
   saved:ctx=>{ctx.save();ctx.translate(8000,4000);throw Error('fixture: failed after save');},
   nestedClip:ctx=>{ctx.save();ctx.translate(8000,4000);ctx.save();ctx.beginPath();ctx.rect(0,0,1,1);ctx.clip();throw Error('fixture: failed after nested clip');},
   excessRestore:ctx=>{ctx.restore();ctx.translate(8000,4000);throw Error('fixture: failed after over-restore');}
  };
  const reports=[],pngs=[];
  for(const scene of['film','selection']){
   let baseline=null;
   for(const [name,drawActor]of Object.entries(cases)){
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=900;
    const ctx=canvas.getContext('2d'),nativeSave=ctx.save.bind(ctx),nativeRestore=ctx.restore.bind(ctx);
    let depth=0,minimum=0;
    ctx.save=()=>{depth++;nativeSave();};ctx.restore=()=>{depth--;minimum=Math.min(minimum,depth);nativeRestore();};
    ctx.translate(9,11);ctx.scale(.95,.95);const before=Array.from(ctx.getTransform().toFloat64Array());
    if(scene==='film'){
     const shots=buildWorld1Scene('bossIntro','kilo');drawWorld1Cine(ctx,{world1Cine:{id:'bossIntro',hero:'kilo',i:0,t:80,shots},reduceMotion:true},1100,760,73,{drawActor});
    }else{
     const selection=createWorld1Select({seals:WORLD1_ORDER});selection.index=10;
     drawWorld1Select(ctx,1100,760,73,selection,{drawActor,reduceMotion:true});
    }
    const pixels=ctx.getImageData(0,0,1200,900).data,after=Array.from(ctx.getTransform().toFloat64Array());
    if(name==='missing')baseline=new Uint8ClampedArray(pixels);
    let changed=0;for(let p=0;p<pixels.length;p+=4)if(pixels[p]!==baseline[p]||pixels[p+1]!==baseline[p+1]||pixels[p+2]!==baseline[p+2]||pixels[p+3]!==baseline[p+3])changed++;
    reports.push({scene,name,before,after,saveDepth:depth,minimumDepth:minimum,changedPixelsAgainstCanonical:changed});
    if(['missing','saved','nestedClip','declined'].includes(name))pngs.push({name:scene+'-'+name,png:canvas.toDataURL().split(',')[1]});
   }
  }
  return {reports,pngs};
 },base);
 for(const p of result.pngs)await fs.writeFile(`${dir}/adapter-${publicBase?'public-':''}${p.name}.png`,Buffer.from(p.png,'base64'));
 await fs.writeFile(`${dir}/${publicBase?'public-':''}actor-adapter.json`,JSON.stringify({reports:result.reports,environment:publicBase?'public deployment':'local build',scope:'Isolated actual Canvas adapter failure fixtures; no gameplay or progress changes.'},null,2));
 for(const r of result.reports){
  assert.deepEqual(r.after,r.before,r.scene+'/'+r.name+' must restore the caller transform');
  assert.equal(r.saveDepth,0,r.scene+'/'+r.name+' must restore every save');
  assert.ok(r.minimumDepth>=0,r.scene+'/'+r.name+' must protect the caller stack');
  assert.equal(r.changedPixelsAgainstCanonical,0,r.scene+'/'+r.name+' must paint the canonical fallback in place');
 }
 console.log('PASS actor adapters: missing, declined, throwing, transformed, nested-save/clip and excess-restore callbacks recover canonical characters and caller state in films and selection');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
