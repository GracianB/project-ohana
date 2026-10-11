// Use a key scoped to ONE existing TURN credential, never the account secret.
// Fetch server-side: URLs containing API keys must never be logged or redirected.
export async function meteredTurnConfig({domain,apiKey,fetchImpl=fetch,now=Date.now(),timeoutMs=1100}={}){
 if(typeof domain!=="string"||! /^[a-z0-9][a-z0-9-]{0,62}\.metered\.live$/i.test(domain)||
   typeof apiKey!=="string"||apiKey.length<16||apiKey.length>256)return null;
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),timeoutMs);
 try{
  const endpoint=new URL(`https://${domain}/api/v1/turn/credentials`);
  endpoint.searchParams.set("apiKey",apiKey);
  const response=await fetchImpl(endpoint.href,{signal:abort.signal,redirect:"error"});
  if(!response.ok)return null;
  const value=await response.json();
  if(!Array.isArray(value)||value.length>20)return null;
  const iceServers=[];
  for(const item of value){
   if(typeof item?.username!=="string"||!item.username||item.username.length>256||
      typeof item.credential!=="string"||!item.credential||item.credential.length>512)continue;
   const urls=(typeof item.urls==="string"?[item.urls]:Array.isArray(item.urls)?item.urls:[])
    .filter(url=>typeof url==="string"&&/^turns:[a-z0-9-]+\.relay\.metered\.ca:443\?transport=tcp$/i.test(url));
   if(urls.length)iceServers.push({urls:urls.length===1?urls[0]:urls,username:item.username,credential:item.credential});
   if(iceServers.length===4)break;
  }
  // Metered dashboard credentials may be long-lived. refreshAt is cache
  // freshness, not a promise that these credentials expire in five minutes.
  return iceServers.length?{iceServers,provider:"metered",refreshAt:now+300000}:null;
 }catch{return null;}finally{clearTimeout(timer);}
}
