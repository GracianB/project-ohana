import test from "node:test";
import assert from "node:assert/strict";
import { cloudflareTurnConfig } from "../netlify/lib/cloudflare-turn.mjs";
const keyId="test-turn-key-id-0001",apiToken="test-secret-api-token-00001";
test("Cloudflare returns only validated TLS TCP 443 relay credentials",async()=>{
 let request;
 const fetchImpl=async(url,options)=>{request={url,options};return {ok:true,json:async()=>({iceServers:[
  {urls:["stun:stun.cloudflare.com:3478"]},
  {urls:["turn:turn.cloudflare.com:3478?transport=udp","turns:turn.cloudflare.com:443?transport=tcp"],username:"short-term",credential:"ephemeral"}
 ]})};};
 const data=await cloudflareTurnConfig({keyId,apiToken,fetchImpl});
 assert.deepEqual(data,{iceServers:[{urls:"turns:turn.cloudflare.com:443?transport=tcp",username:"short-term",credential:"ephemeral"}]});
 assert.match(request.url,/rtc\.live\.cloudflare\.com\/v1\/turn\/keys\/test-turn-key-id-0001\/credentials\/generate-ice-servers/);
 assert.equal(request.options.method,"POST");
 assert.equal(JSON.parse(request.options.body).ttl,3600);
 assert.equal(request.options.headers.Authorization,"Bearer "+apiToken);
 assert.ok(!JSON.stringify(data).includes(apiToken));
});
test("never trust injected ICE URLs or incomplete provider response",async()=>{
 for(const payload of [
 {iceServers:[{urls:["turns:attacker.invalid:443?transport=tcp"],username:"a",credential:"b"}]},
 {iceServers:[{urls:["turns:turn.cloudflare.com:443?transport=tcp"],username:"a"}]},
 {iceServers:[]},{}
 ])assert.equal(await cloudflareTurnConfig({keyId,apiToken,fetchImpl:async()=>({ok:true,json:async()=>payload})}),null);
});
test("provider failure and invalid settings preserve existing fallbacks",async()=>{
 assert.equal(await cloudflareTurnConfig({keyId:"invalid!",apiToken}),null);
 assert.equal(await cloudflareTurnConfig({keyId,apiToken,fetchImpl:async()=>{throw Error("offline");}}),null);
 assert.equal(await cloudflareTurnConfig({keyId,apiToken,fetchImpl:async()=>({ok:false})}),null);
});
