// Real w1-final rendering plus isolated artwork checks. The saved campaign was
// earned previously; direct room/position fixtures inspect art, not progression.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const dir='test-results/v627',server=await startServer(0);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 await fs.mkdir(dir,{recursive:true});
 const earned=JSON.parse(await fs.readFile(process.env.OHANA_EARNED_STORAGE||'test-results/v600/earned-campaign-storage.json','utf8'));
 for(const origin of earned.origins)origin.origin='http://127.0.0.1:'+server.address().port;
 const contexts=[],rooms=[],errors=[];
 for(const [width,height]of[[1280,900],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},storageState:earned,hasTouch:width<500,isMobile:width<500});contexts.push(context);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const date=new Date('2026-10-29T03:00:00Z');await page.clock.install({time:date});await page.clock.pauseAt(new Date(+date+1000));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');await page.keyboard.press('Escape');
  await page.evaluate(()=>{localStorage.removeItem('ohana-resume');const e=window.__OHANA_E2E;e.startWorld1('kilo');e.loadRoom('w1-final');});
  const tick=async n=>{await page.evaluate(n=>window.__OHANA_E2E.step(n),n);await page.clock.runFor(16);};
  for(let i=0;i<30;i++){const s=await page.evaluate(()=>window.__OHANA_E2E.state());if(!s.world1Cine&&!s.pendingWorld1Cine)break;await page.keyboard.press('Enter');await tick(100);}
  await tick(320);
  // V630's earned-save visit offers a fighter before Quimera. Cancel via
  // the real button to inspect the ten cores without starting a battle.
  if(await page.locator('#final-hero-choice').count())await page.locator('.fr-choice-back').click();
  const before=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(before.roomId,'w1-final');assert.equal(before.world1Seals.length,10);assert.equal(before.evo,4);
  const portals=await page.evaluate(async()=>(await import('/systems/final-portal-mirrors.js')).FINAL_PORTALS);
  for(const portal of portals){
   await page.evaluate(x=>window.__OHANA_E2E.setPlayer(x,1082),portal.x-80);await tick(100);
   const state=await page.evaluate(()=>window.__OHANA_E2E.state());
   assert.equal(state.roomId,'w1-final');assert.equal(state.runtimeFaults,0);assert.deepEqual(state.world1Seals,before.world1Seals);assert.equal(state.evo,before.evo);assert.equal(state.xp,before.xp);assert.equal(state.hp,before.hp);
   assert.ok(portal.x-state.camera.x>portal.rx&&portal.x-state.camera.x<width-portal.rx,'the inspected mirror must be fully inside the viewport');
   await page.screenshot({path:`${dir}/room-${portal.hero}-${width}.png`});
   rooms.push({width,height,hero:portal.hero,room:state.roomId,physicalMirrorInView:true,rendering:'earned ritual core with its three floor objects',unchangedEarnedSeals:true,unchangedExperienceAndHealth:true});
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width===1280){
   const fixtures=await page.evaluate(async()=>{
    const {drawPortalMirrors,FINAL_PORTALS}=await import('/systems/final-portal-mirrors.js');
    const {drawWorld1}=await import('/systems/world1-play.js'),{WORLD1_ROOMS}=await import('/systems/world1-rooms.js');
    const {createWorld1Select,drawWorld1Select}=await import('/systems/world1-select.js');
    const {drawWorld1Cine,buildWorld1Scene}=await import('/systems/world1-cine.js');
    const create=(w=400,h=400)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const raw=canvas.getContext('2d'),trace={images:0,ellipses:[],fills:[]};const ctx=new Proxy(raw,{get:(c,key)=>{const value=Reflect.get(c,key,c);if(typeof value!=='function')return value;return (...args)=>{if(key==='drawImage')trace.images++;if(key==='ellipse')trace.ellipses.push(args);return value.apply(c,args);};},set:(c,key,value)=>{if(key==='fillStyle')trace.fills.push(value);return Reflect.set(c,key,value,c);}});return {canvas,raw,ctx,trace};};
    const sheet=create(2000,800),portraits=[];
    for(const [index,original]of FINAL_PORTALS.entries()){
     const {canvas,raw,ctx,trace}=create(),p={...original,x:200,y:190};
     const rendered=drawPortalMirrors(ctx,[p],{x:0,y:0},73,null,false);
     const empty=create();drawPortalMirrors(empty.ctx,[{...p,hero:'missing'}],{x:0,y:0},73,null,false);
     const emptyPixels=empty.raw.getImageData(0,0,400,400).data;
     const portrait=rendered[0];if(!portrait)throw Error('no canonical portrait for '+p.hero);
     const b=portrait.fit.painted;
     for(const px of[b.x,b.x+b.w])for(const py of[b.y,b.y+b.h]){
      if((px/(p.rx-5))**2+(py/(p.ry-5))**2>=1)throw Error('clipped portrait '+p.hero);
     }

     const pixels=raw.getImageData(0,0,400,400).data,colors=new Set();let opaque=0,actorPixels=0;
     for(let y=90;y<280;y++)for(let x=140;x<260;x++){
      if(((x-200)/(p.rx*.85))**2+((y-190)/(p.ry*.85))**2>1)continue;
      const o=(y*400+x)*4;if(Math.abs(pixels[o]-emptyPixels[o])+Math.abs(pixels[o+1]-emptyPixels[o+1])+Math.abs(pixels[o+2]-emptyPixels[o+2])>35)actorPixels++;if(pixels[o+3]>200){opaque++;colors.add([pixels[o]>>3,pixels[o+1]>>3,pixels[o+2]>>3].join());}
     }
     const x=index%5*400,y=Math.floor(index/5)*400;sheet.raw.fillStyle='#172c41';sheet.raw.fillRect(x,y,400,400);sheet.raw.drawImage(canvas,x,y);sheet.raw.fillStyle='#fff0d1';sheet.raw.font='18px sans-serif';sheet.raw.textAlign='center';sheet.raw.fillText(p.hero,x+200,y+360);
     portraits.push({hero:p.hero,actualActorCanvasDraws:trace.images,actorPixels,completeSilhouetteInsideGlass:true,opaqueInteriorPixels:opaque,quantizedInteriorColors:colors.size,png:canvas.toDataURL()});
    }
    const pedestal=create(1280,900),room=WORLD1_ROOMS['w1-final'];
    drawWorld1(pedestal.ctx,{world1:{statuesLit:room.statues.map(()=>true)},roomDef:room,viewW:1280,reduceMotion:true},{x:300,y:350},73);
    const oldGenericBodies=pedestal.trace.ellipses.filter(a=>a[2]===48&&a[3]===76).length;
    const platePixels=pedestal.raw.getImageData(0,0,1280,900).data;
    const firstPlate=room.statues[0],nameX=firstPlate.x-300,nameY=firstPlate.y-350;
    let firstPlaqueTextPixels=0;
    for(let y=nameY-46;y<nameY-21;y++)for(let x=nameX-74;x<nameX+74;x++){
     const i=(y*1280+x)*4;
     if(platePixels[i]<80&&platePixels[i+1]<70&&platePixels[i+2]<80&&platePixels[i+3]>220)firstPlaqueTextPixels++;
    }

    const fallbackFilms=[];
    for(const fail of[false,true]){
     const film=create(1100,760),shots=buildWorld1Scene('bossIntro','kilo');
     drawWorld1Cine(film.ctx,{world1Cine:{id:'bossIntro',hero:'kilo',i:0,t:80,shots},reduceMotion:true},1100,760,73,fail?{drawActor:()=>{throw Error('fixture: external actor adapter unavailable');}}:{});
     fallbackFilms.push({callback:fail?'throwing':'missing',actualActorCanvasDraws:film.trace.images,png:film.canvas.toDataURL().split(',')[1]});
    }
    const selector=create(1280,900),sel=createWorld1Select();sel.index=10;drawWorld1Select(selector.ctx,1280,900,73,sel,{reduceMotion:true});
    return {portraits,pedestal:{oldGenericBodies,firstPlaqueTextPixels,fills:pedestal.trace.fills},fallbackFilms,defaultSelection:{actualActorCanvasDraws:selector.trace.images,png:selector.canvas.toDataURL().split(',')[1]},sheet:sheet.canvas.toDataURL().split(',')[1]};
   });
   for(const p of fixtures.portraits){assert.ok(p.actualActorCanvasDraws>0,p.hero+' must paint actual actor Canvas');assert.ok(p.actorPixels>400,p.hero+' portrait must differ visibly from empty glass');assert.ok(p.opaqueInteriorPixels>500,p.hero+' body must be visible');assert.ok(p.quantizedInteriorColors>12,p.hero+' needs the full character palette');}
   assert.equal(new Set(fixtures.portraits.map(p=>p.png)).size,10,'ten distinct canonical heroes');
   assert.ok(fixtures.pedestal.firstPlaqueTextPixels>30,'later pedestals must not repaint the earlier name plaques');
   assert.equal(fixtures.pedestal.oldGenericBodies,0,'obsolete oval stone figures must not be drawn behind the real mirrors');
   assert.ok(!fixtures.pedestal.fills.includes('#7e7090'),'obsolete generic stone body fill is retired');
   for(const f of fixtures.fallbackFilms)assert.ok(f.actualActorCanvasDraws>=10,f.callback+' film adapter must still paint real heroes');
   assert.ok(fixtures.defaultSelection.actualActorCanvasDraws>=11,'final selection paints its backdrop and ten actual heroes without an external adapter');
   await fs.writeFile(`${dir}/all-ten-mirrors.png`,Buffer.from(fixtures.sheet,'base64'));
   for(const f of fixtures.fallbackFilms)await fs.writeFile(`${dir}/film-${f.callback}.png`,Buffer.from(f.png,'base64'));
   await fs.writeFile(`${dir}/final-selection-default.png`,Buffer.from(fixtures.defaultSelection.png,'base64'));
   const slim={portraits:fixtures.portraits.map(({png,...p})=>p),pedestal:fixtures.pedestal,fallbackFilms:fixtures.fallbackFilms.map(({png,...p})=>p),defaultSelection:{actualActorCanvasDraws:fixtures.defaultSelection.actualActorCanvasDraws}};
   await fs.writeFile(`${dir}/mirror-fixtures.json`,JSON.stringify(slim,null,2));
  }
 }
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${dir}/final-mirrors.json`,JSON.stringify({actualRoom:rooms,errors,scope:'Previously earned campaign backup, direct final-room and camera-position art fixtures; no XP/health/seal grants and no new campaign completion claim.'},null,2));
 console.log('PASS final mirrors: ten earned ritual cores in actual w1-final desktop/mobile; canonical actor preview fixtures; no old stone proxy bodies; real-actor selection/cinematic fallbacks');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
