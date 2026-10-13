import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { cachedGradient, MAX_CACHED_GRADIENTS } from "../systems/canvas-gradient-cache.js";
import { CombatFX } from "../systems/combat-fx.js";
import { renderWorld, WORLDS } from "../worlds/index.js";

test("V365: identical geometry gets one gradient on the original Canvas context", () => {
  const ctx={}, second={};
  let created=0;
  const build=()=>({serial:++created});
  const first=cachedGradient(ctx,"sky:720:beach",build);
  assert.equal(cachedGradient(ctx,"sky:720:beach",build),first);
  assert.equal(created,1);
  assert.notEqual(cachedGradient(second,"sky:720:beach",build),first,
    "independent canvas contexts must never share GPU gradients");
  assert.notEqual(cachedGradient(ctx,"sky:1080:beach",build),first,
    "viewport resize must produce new gradient coordinates");
  assert.equal(created,3);
});

test("V365: cached gradients are bounded and oldest entries really evict", () => {
  const ctx={};
  let built=0;
  for(let i=0;i<MAX_CACHED_GRADIENTS+5;i++)
    cachedGradient(ctx,"key:"+i,()=>({serial:++built}));
  cachedGradient(ctx,"key:0",()=>({serial:++built}));
  assert.equal(built,MAX_CACHED_GRADIENTS+6);
  const recent=cachedGradient(ctx,"key:"+(MAX_CACHED_GRADIENTS+4),()=>({serial:++built}));
  assert.equal(recent.serial,MAX_CACHED_GRADIENTS+5);
  assert.equal(built,MAX_CACHED_GRADIENTS+6);
});

function fakeCanvas(){
  const counters={linear:0,radial:0,paint:0};
  const gradient=()=>({addColorStop(){}});
  const ctx=new Proxy({}, {
    get(obj,key){
      if(key==="createLinearGradient")return ()=>{counters.linear++;return gradient();};
      if(key==="createRadialGradient")return ()=>{counters.radial++;return gradient();};
      if(key==="fillRect")return ()=>{counters.paint++;};
      if(key==="measureText")return ()=>({width:60});
      if(key==="canvas")return {width:1280,height:720};
      if(key==="getTransform")return ()=>({a:1,b:0,c:0,d:1,e:0,f:0});
      if(key==="getLineDash")return ()=>[];
      if(key==="lineWidth")return 1;
      if(typeof key==="symbol")return undefined;
      return obj[key]??(()=>{});
    },
    set(obj,key,value){obj[key]=value;return true;}
  });
  return {ctx,counters};
}

test("V365: original world render produces fewer Canvas gradients on repeated frames", () => {
  const {ctx,counters}=fakeCanvas();
  const world=WORLDS.find(w=>w.id==="beach");
  const cam={x:0,y:0};
  renderWorld(ctx,world,cam,10,1280,720);
  const first=counters.linear+counters.radial, firstPaints=counters.paint;
  renderWorld(ctx,world,cam,11,1280,720);
  const second=counters.linear+counters.radial-first;
  assert.ok(first>0 && second>0,"dynamic ocean lighting must keep moving");
  assert.ok(second<first,"cached geometry must avoid costly repeated gradients");
  assert.ok(counters.paint>firstPaints,"cache must never skip actual scene painting");
});

test("V365: hit effects update in-place, preserve ordering and still expire", () => {
  const fx=new CombatFX();
  fx.add(10,10,"#fff",{tier:0});
  fx.add(20,20,"#fff",{tier:1});
  const original=fx.items;
  assert.equal(original.length,2);
  original[0].life=1; original[1].life=3;
  fx.update();
  assert.equal(fx.items,original);
  assert.equal(fx.items.length,1);
  assert.equal(fx.items[0].x,20);
  assert.equal(fx.items[0].life,2);
  fx.update();fx.update();
  assert.equal(fx.items.length,0);
  for(let i=0;i<80;i++)fx.add(i,0,"#fff");
  assert.equal(fx.items.length,40,"existing impact cap remains intact");
});

test("V365: the active render culls with one shared viewport and retains gameplay", () => {
  const game=fs.readFileSync("game.js","utf8");
  const sw=fs.readFileSync("sw.js","utf8");
  const html=fs.readFileSync("index.html","utf8");
  const worlds=fs.readFileSync("worlds/index.js","utf8");
  const atmosphere=fs.readFileSync("worlds/room-atmosphere.js","utf8");
  const living=fs.readFileSync("worlds/living-worlds.js","utf8");
  assert.match(game,/const viewportW=camW\(\),viewportH=camH\(\)/);
  assert.match(game,/const peerCombatFresh=onlineCoop\.hasFreshCombat\(game\)/);
  assert.match(game,/clock\.advance\(now, step\)/);
  assert.match(game,/visibleForRender\(pr,game\.cam,viewportW,viewportH\)/);
  assert.match(worlds,/cachedGradient\(ctx,"sky:/);
  assert.match(atmosphere,/cachedGradient\(ctx,"room-vig:/);
  assert.match(living,/cachedGradient\(ctx,"living-affinity:/);
  assert.match(sw,/const VERSION = "ohana-365"/);
  assert.match(sw,/systems\/canvas-gradient-cache\.js\?v=/);
  assert.ok([...html.matchAll(/ohana-\d+/g)].every(x=>x[0]==="ohana-365"));
});
