import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';

const external=process.env.OHANA_TEST_BASE_URL;
const server=external?null:await startServer(0);
const local=server?'http://127.0.0.1:'+server.address().port+'/':null;
const base=external||local;
const dir='test-results/v635',prefix=external?'public-':'';
const destination='https://project-ohana-multiplayer.netlify.app/multiplayer';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
const reports=[];
try{
 await fs.mkdir(dir,{recursive:true});
 for(const [width,height] of [[1280,900],[390,844],[320,568]]){
  const touch=width<500;
  const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch,serviceWorkers:'block',...(external?{ignoreHTTPSErrors:true}:{})});
  const page=await context.newPage(),errors=[],api=[],navigations=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.url().includes('/.netlify/functions/'))api.push(r.url());});
  await context.route('https://project-ohana-multiplayer.netlify.app/**',async route=>{
   navigations.push(route.request().url());
   await route.fulfill({contentType:'text/html',body:'<!doctype html><title>Destino online interceptado</title><h1>Vestíbulo online</h1>'});
  });
  const activate=async locator=>touch?locator.tap():locator.click();
  const open=async()=>{
   await page.goto(base+'?entryCheck635='+Date.now(),{waitUntil:'networkidle'});
   await page.waitForFunction(()=>document.documentElement.dataset.ohanaBoot==='ready',undefined,{timeout:120000});
   await page.locator('#ohana-intro.ready .oi-enter').waitFor({state:'visible'});
   assert.equal(await page.evaluate(()=>!!window.__OHANA_E2E),false);
  };
  await open();
  const online=page.locator('.oi-online');assert.equal(await online.getAttribute('href'),destination);assert.ok(await online.isVisible());
  const geometry=await page.evaluate(()=>{
   const nodes=['.oi-online','.oi-pause','.oi-enter'];
   const boxes=nodes.map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {selector,x:r.x,y:r.y,width:r.width,height:r.height};});
   return {boxes,viewport:{width:innerWidth,height:innerHeight}};
  });
  for(const b of geometry.boxes)assert.ok(b.x>=-1&&b.y>=-1&&b.x+b.width<=width+1&&b.y+b.height<=height+1,JSON.stringify(b));
  const [a,b,c]=geometry.boxes,overlap=(x,y)=>x.x<y.x+y.width&&x.x+x.width>y.x&&x.y<y.y+y.height&&x.y+x.height>y.y;
  assert.equal(overlap(a,b),false);assert.equal(overlap(a,c),false);
  await page.screenshot({path:dir+'/'+prefix+'welcome-online-'+width+'.png'});
  if(touch)await online.tap();else{
   await page.locator('.oi-pause').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'oi-online');await page.keyboard.press('Enter');
  }
  await page.waitForURL(destination);assert.equal(navigations.at(-1),destination);
  await open();await activate(page.locator('.oi-enter'));
  const menu=page.locator('#btn-coop');await menu.scrollIntoViewIfNeeded();assert.ok(await menu.isVisible());assert.equal(await menu.getAttribute('href'),destination);assert.equal(await menu.getAttribute('disabled'),null);
  await page.screenshot({path:dir+'/'+prefix+'selector-online-'+width+'.png'});
  await activate(menu);await page.waitForURL(destination);assert.equal(navigations.at(-1),destination);
  assert.deepEqual(errors,[]);assert.deepEqual(api,[]);
  reports.push({width,height,welcomeInput:touch?'native touch':'native Tab/Enter',visibleWelcomeAndMenuLinks:true,noOverlap:true,noTestHooks:true,destination,apiRequests:api,errors});
  await context.close();console.log('PASS online entry',width);
 }
 if(!external){
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),api=[];
  page.on('request',r=>{if(r.url().includes('/.netlify/functions/'))api.push(r.url());});
  await context.route('**/multiplayer.js?*',route=>route.abort('failed'));
  const invitation=local+'multiplayer.html?room=ABC234&lang=en#invite';
  await page.goto(invitation);
  await page.waitForFunction(()=>document.body.dataset.lobbyReady==='error');
  assert.equal(await page.locator('#lobby-main').evaluate(el=>el.inert),true);
  assert.ok(await page.locator('#lobby-startup-retry').isVisible());
  assert.equal(await page.locator('#lobby-startup-retry').innerText(),'Try again');
  await context.unroute('**/multiplayer.js?*');
  await page.locator('#lobby-startup-retry').click();
  await page.waitForFunction(()=>document.body.dataset.lobbyReady==='true');
  assert.equal(page.url(),invitation);assert.equal(await page.locator('#lobby-main').evaluate(el=>el.inert),false);
  assert.equal(await page.locator('#lobby-startup').isVisible(),false);
  assert.equal(await page.locator('#room-input').inputValue(),'ABC234');
  assert.equal(await page.evaluate(()=>document.documentElement.lang),'en');assert.deepEqual(api,[]);
  reports.push({localLobbyBoot:true,downloadFailureRecoverable:true,controlsInertUntilReady:true,retryPreservesInvitation:true,englishReady:true,noAutomaticApiRequests:true});
  await context.close();
 }
 // The public-shaped local fixture tests the real location-based bootstrap.
 // Netlify is intercepted at the navigation boundary: no remote session claim.
 const context=await browser.newContext({serviceWorkers:'block',...(external?{ignoreHTTPSErrors:true}:{})});
 const page=await context.newPage(),requests=[],scripts=[];page.on('request',r=>{requests.push(r.url());if(r.resourceType()==='script')scripts.push(r.url());});
 await context.route('https://project-ohana-multiplayer.netlify.app/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Destino online interceptado</title><h1>Vestíbulo online</h1>'}));
 if(!external)await context.route('https://gracianb.github.io/project-ohana/**',async route=>{
  const url=new URL(route.request().url()),path=url.pathname.slice('/project-ohana/'.length);
  const response=await route.fetch({url:local+path+url.search});await route.fulfill({response});
 });
 const target=destination+'?room=ABC234&lang=en#invite';
 await page.goto('https://gracianb.github.io/project-ohana/multiplayer.html?room=ABC234&lang=en#invite',{waitUntil:'networkidle'});
 await page.waitForURL(target);
 assert.equal(requests.some(u=>u.includes('/.netlify/functions/')),false);
 assert.equal(scripts.some(u=>/\/multiplayer\.js(?:\?|$)|\/lobby-ux\.js(?:\?|$)/.test(u)),false,'Pages must leave before starting same-origin lobby clients');
 reports.push({directPagesLobby:true,source:external?'actual public Pages':'Pages-shaped local source fixture',destination:target,invitationPreserved:true,noPagesApiRequests:true,noLobbyClientsInitialized:true});
 await context.close();
 await fs.writeFile(dir+'/'+prefix+'public-entry.json',JSON.stringify({environment:external?'public Pages with intercepted Netlify destination':'local source and Pages-shaped routing fixture',reports,limits:'Netlify navigation is deliberately intercepted; these checks verify visible entry, native keyboard/touch and the invitation redirect, not remote backend availability or a two-device match.'},null,2)+'\n');
}finally{await browser.close();if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}}
