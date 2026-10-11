import { createHash } from "node:crypto";
import { RoomError } from "./room-service.mjs";
import { cloudflareTurnConfig } from "./cloudflare-turn.mjs";
import { temporaryTurnConfig } from "./turn-credentials.mjs";

const EMPTY={iceServers:[],expiresAt:0};
const MAX_ISSUES_PER_MINUTE=30;
const CACHE_MARGIN_MS=60000;
const read=(store,key)=>store.getWithMetadata(key,{type:"json",consistency:"strong"});
const writeOptions=entry=>entry?{onlyIfMatch:entry.etag}:{onlyIfNew:true};

// Fixed-size lease slots, not a read/modify/write counter. Conditional claims
// bound provider calls across cold starts and concurrent function instances.
async function reserveIssue(store,now){
 const window=Math.floor(now/60000);
 for(let i=0;i<MAX_ISSUES_PER_MINUTE;i++){
  const key=`budget:${i}`,entry=await read(store,key);
  if(entry?.data?.window===window)continue;
  const result=await store.setJSON(key,{window},writeOptions(entry));
  if(result.modified)return;
 }
 throw new RoomError("RTC_RATE_LIMIT","Demasiadas solicitudes TURN. Reintentaremos más tarde.",429);
}

export async function getRtcConfig({service,store,body,env={},fetchImpl=fetch,now=Date.now}={}){
 const snapshot=await service.poll(body.roomId,body.identity);
 if(!snapshot.players?.find(p=>p.isYou&&p.connected))throw new RoomError("DISCONNECTED","Reconecta antes de solicitar TURN.",409);
 const managed=!!(env.OHANA_CF_TURN_KEY_ID&&env.OHANA_CF_TURN_API_TOKEN);
 const coturn=!!(env.OHANA_TURN_TLS_URL&&env.OHANA_TURN_SHARED_SECRET);
 if(!managed&&!coturn)return {...EMPTY,status:"not-configured"};
 const scope=[snapshot.roomId,body.identity.playerId,body.identity.connectionEpoch??0,
  env.OHANA_CF_TURN_KEY_ID,env.OHANA_CF_TURN_API_TOKEN,env.OHANA_TURN_TLS_URL,env.OHANA_TURN_SHARED_SECRET].join(":");
 const key="credential:"+createHash("sha256").update(scope).digest("hex");
 const at=now(),entry=await read(store,key),cached=entry?.data;
 if(cached?.expiresAt>at+CACHE_MARGIN_MS)return {...cached.config,status:"ready"};
 if(cached?.retryAt>at)return {...EMPTY,status:"unavailable"};
 if(cached?.leaseUntil>at)throw new RoomError("RTC_CONFIG_BUSY","La configuración TURN está en curso.",429);
 const claim=await store.setJSON(key,{leaseUntil:at+5000},writeOptions(entry));
 if(!claim.modified)throw new RoomError("RTC_CONFIG_BUSY","La configuración TURN está en curso.",429);
 try{
  await reserveIssue(store,at);
  const config=await cloudflareTurnConfig({keyId:env.OHANA_CF_TURN_KEY_ID,apiToken:env.OHANA_CF_TURN_API_TOKEN,fetchImpl})||
   temporaryTurnConfig({url:env.OHANA_TURN_TLS_URL,secret:env.OHANA_TURN_SHARED_SECRET,playerId:body.identity.playerId,now:at});
  const expiresAt=config?.expiresAt||at+3600000;
  await store.setJSON(key,config?{config:{...config,expiresAt},expiresAt}:{retryAt:at+30000},{onlyIfMatch:claim.etag});
  return config?{...config,expiresAt,status:"ready"}:{...EMPTY,status:"unavailable"};
 }catch(error){
  await store.setJSON(key,{retryAt:at+30000},{onlyIfMatch:claim.etag});
  throw error;
 }
}

// Shared by the production endpoint and HTTP/browser tests; secrets and cached
// credentials never enter room snapshots or logs.
export function createRtcConfigHandler({service,store,env={},fetchImpl=fetch,now=Date.now}){
 return async request=>{
  const headers={"content-type":"application/json; charset=utf-8","cache-control":"no-store, max-age=0"};
  const respond=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
  if(request.method!=="POST")return respond({error:{code:"METHOD_NOT_ALLOWED"}},405);
  let body;
  try{body=await request.json();}catch{return respond({error:{code:"INVALID_JSON"}},400);}
  if(!body||typeof body!=="object"||Array.isArray(body))return respond({error:{code:"INVALID_BODY"}},400);
  try{return respond({data:await getRtcConfig({service,store,body,env,fetchImpl,now})});}
  catch(error){
   const status=error instanceof RoomError?error.status:500;
   const code=error instanceof RoomError?error.code:"RTC_CONFIG_UNAVAILABLE";
   if(status===429)headers["retry-after"]="30";
   return respond({error:{code,message:"No se pudo preparar TURN. La partida conserva su conexión de respaldo."}},status);
  }
 };
}
