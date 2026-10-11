import test from "node:test";
import assert from "node:assert/strict";
import {meteredTurnConfig} from "../netlify/lib/metered-turn.mjs";
import {getRtcConfig} from "../netlify/lib/rtc-config-service.mjs";
const domain="ohana-multiplayer.metered.live",apiKey="scoped-test-key-for-one-turn-credential";
const server={urls:"turns:global.relay.metered.ca:443?transport=tcp",username:"test-user",credential:"test-password"};
test("Metered forwards only trusted TLS 443 endpoints and keeps API key server-side",async()=>{
 let requested;
 const data=await meteredTurnConfig({domain,apiKey,now:1000,fetchImpl:async(url,options)=>{
  requested={url,options};return {ok:true,json:async()=>[
   {urls:"stun:stun.relay.metered.ca:80"},
   {...server,urls:["turn:global.relay.metered.ca:443",server.urls]},
   {...server,urls:"turns:attacker.test:443?transport=tcp"}
  ]};
 }});
 assert.deepEqual(data.iceServers,[server]);assert.equal(data.refreshAt,301000);
 assert.equal(new URL(requested.url).searchParams.get("apiKey"),apiKey);
 assert.equal(requested.options.redirect,"error");assert.ok(!JSON.stringify(data).includes(apiKey));
});
test("invalid Metered settings make no requests; failure preserves fallback",async()=>{
 for(const bad of ["evil.test","x.metered.live.evil.test","user@ohana-multiplayer.metered.live","ohana-multiplayer.metered.live/path"])
  assert.equal(await meteredTurnConfig({domain:bad,apiKey,fetchImpl:()=>{throw Error("must not call");}}),null);
 for(const value of [{},[],[{...server,credential:""}],[{...server,urls:"turn:global.relay.metered.ca:443"}]])
  assert.equal(await meteredTurnConfig({domain,apiKey,fetchImpl:async()=>({ok:true,json:async()=>value})}),null);
 assert.equal(await meteredTurnConfig({domain,apiKey,fetchImpl:async()=>{throw Error("network failure with secret");}}),null);
});
test("selected Metered integration authenticates, caches, and invalidates on credential rotation",async()=>{
 const entries=new Map();let serial=0,calls=0;
 const store={async getWithMetadata(key){return entries.get(key)||null;},async setJSON(key,data,opts={}){
  const old=entries.get(key);
  if(opts.onlyIfNew&&old||opts.onlyIfMatch&&old?.etag!==opts.onlyIfMatch)return {modified:false};
  const etag=String(++serial);entries.set(key,{data,etag});return {modified:true,etag};
 }};
 const env={OHANA_METERED_DOMAIN:domain,OHANA_METERED_TURN_API_KEY:apiKey,
  OHANA_CF_TURN_KEY_ID:"unused-cloudflare-key",OHANA_CF_TURN_API_TOKEN:"unused-cloudflare-test-token"};
 const options={store,env,body:{roomId:"ABC234",identity:{playerId:"player-1"}},now:()=>1000,
  service:{async poll(){return {roomId:"ABC234",players:[{isYou:true,connected:true}]};}},
  fetchImpl:async url=>{calls++;assert.equal(new URL(url).hostname,domain);return {ok:true,json:async()=>[server]};}
 };
 const config=await getRtcConfig(options);assert.equal(config.provider,"metered");assert.equal(config.expiresAt,301000);
 await getRtcConfig(options);assert.equal(calls,1);
 await getRtcConfig({...options,env:{...env,OHANA_METERED_TURN_API_KEY:apiKey+"-rotated"}});assert.equal(calls,2);
 await assert.rejects(getRtcConfig({...options,service:{poll:async()=>{throw Error("invalid session");}}}));assert.equal(calls,2);
});
