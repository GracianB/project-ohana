import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const sw=fs.readFileSync("sw.js","utf8");
const root="https://example.com/project-ohana/";
function setup({offline=false,failPath="",reuse=false}={}){
  const handlers={}, databases=new Map();
  const canonical=x=>new URL(typeof x==="string"?x:x.url,root).href;
  const storage=key=>{
    if(!databases.has(key))databases.set(key,new Map());
    const db=databases.get(key);
    return {
      match:async (path,opts={})=>{
        const key=canonical(path);
        const found=opts.ignoreSearch
          ? [...db.entries()].find(([k])=>k.split("?")[0]===key.split("?")[0])?.[1]
          : db.get(key);
        return found?.clone();
      },
      put:async (path,response)=>{db.set(canonical(path),response.clone());}
    };
  };
  const caches={
    open:async key=>storage(key),
    keys:async()=>[...databases.keys()],
    delete:async key=>databases.delete(key)
  };
  let attempts=0,inflight=0,maxParallel=0,skip=0,claims=0;
  const requests=[];
  const fetch=async path=>{
    const url=canonical(path);
    attempts++;
    requests.push(url);
    inflight++;
    maxParallel=Math.max(inflight,maxParallel);
    try {
      await new Promise(resolve=>setImmediate(resolve));
      if(offline||url.includes(failPath)&&failPath)throw new TypeError("network unavailable");
      return new Response("new release: "+url,{status:200});
    } finally {inflight--;}
  };
  const self={
    location:{origin:"https://example.com"},
    clients:{claim:async()=>{claims++;}},
    skipWaiting:async()=>{skip++;},
    addEventListener:(event,fn)=>{handlers[event]=fn;}
  };
  const sandbox=vm.createContext({self,caches,fetch,URL,Response,Set,Promise});
  vm.runInContext(sw,sandbox,{filename:"sw.js"});
  const revisions=JSON.parse(vm.runInContext("JSON.stringify(PRECACHE_REVISIONS)",sandbox));
  const precache=JSON.parse(vm.runInContext("JSON.stringify(PRECACHE)",sandbox));
  const install=async()=>{
    let work;
    handlers.install({waitUntil:p=>{work=p;}});
    await work;
  };
  const activate=async()=>{
    let work;
    handlers.activate({waitUntil:p=>{work=p;}});
    await work;
  };
  const seed=async (path,content)=>{
    const key="ohana-static-ohana-367",cache=storage(key);
    const oldMap=reuse?{[path]:revisions[path]}:{[path]:"different-binary-digest"};
    await cache.put("./.ohana-revisions.json",new Response(JSON.stringify(oldMap)));
    await cache.put("./"+path+"?v=ohana-367",new Response(content));
  };
  return {install,activate,seed,storage,caches,precache,revisions,requests,
    calls:()=>attempts,parallel:()=>maxParallel,skips:()=>skip,claims:()=>claims};
}

test("V368 full offline manifest preserves 200 resources and exact Git blob hashes",()=>{
 const h=setup();
 assert.equal(h.precache.length,201,"root plus the 200 canonical assets");
 assert.equal(Object.keys(h.revisions).length,200);
 assert.equal(h.revisions["index.html"].length,40);
 assert.equal(h.revisions["systems/cinema-loader.js"].length,40);
});

test("V368 cold install uses no more than six simultaneous downloads and no duplicate root fetch",async()=>{
 const h=setup();
 await h.install();
 assert.equal(h.calls(),h.precache.length-1);
 assert.ok(h.parallel()<=6 && h.parallel()>=2);
 assert.equal(h.requests.filter(x=>new URL(x).pathname.endsWith("/")).length,0);
 const cache=h.storage("ohana-static-ohana-368");
 assert.match(await (await cache.match("./")).text(),/index\.html/);
 assert.match(await (await cache.match("./index.html")).text(),/index\.html/);
 for(const asset of ["./game.js?v=ohana-368","./systems/cinema-kit.js?v=ohana-368","./assets/sprites/forms/kilo-0.png?v=ohana-368"]){
   assert.equal((await cache.match(asset))?.status,200,asset+" must survive offline");
 }
 assert.equal((await (await cache.match("./.ohana-revisions.json")).json())["game.js"],h.revisions["game.js"]);
 assert.equal(h.skips(),1);
});

test("V368 future release reuses identical verified blobs, never changed binaries",async()=>{
 const h=setup({reuse:true});
 await h.seed("game.js","export const previouslyVerified=true;");
 await h.install();
 assert.equal(h.requests.some(x=>new URL(x).pathname.endsWith("/game.js")),false);
 assert.equal(h.calls(),h.precache.length-2);
 const cache=h.storage("ohana-static-ohana-368");
 assert.match(await (await cache.match("./game.js?v=ohana-368")).text(),/previouslyVerified/);
 assert.equal((await cache.match("./title-stage.css?v=ohana-368"))?.status,200);
 assert.ok((await h.caches.keys()).includes("ohana-static-ohana-367"),"old cache remains until activation");
 await h.activate();
 assert.deepEqual(await h.caches.keys(),["ohana-static-ohana-368"]);
 assert.equal(h.claims(),1);
});

test("V368 changed SHA never reuses stale assets and incomplete install never takes control",async()=>{
 const h=setup({reuse:false});
 await h.seed("game.js","export const unsafeStaleCode=true;");
 await h.install();
 assert.equal(h.requests.some(x=>x.includes("/game.js")),true);
 assert.doesNotMatch(await (await h.storage("ohana-static-ohana-368").match("./game.js?v=ohana-368")).text(),/unsafeStaleCode/);
 const bad=setup({failPath:"/game.js"});
 await assert.rejects(bad.install(),/network unavailable/);
 assert.equal(bad.skips(),0,"failed offline install must not replace an active release");
});
