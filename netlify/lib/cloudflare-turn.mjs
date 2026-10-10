// Managed Cloudflare Realtime TURN: permanent provider token stays server-side.
// Only Cloudflare's verified TURN/TLS 443 endpoint is passed to Firefox.
export async function cloudflareTurnConfig({keyId,apiToken,fetchImpl=fetch,ttl=3600,timeoutMs=1100}={}) {
  if(typeof keyId!=="string"||!/^[A-Za-z0-9_-]{8,128}$/.test(keyId)||
     typeof apiToken!=="string"||apiToken.length<16)return null;
  const abort=new AbortController();
  const timer=setTimeout(()=>abort.abort(),timeoutMs);
  try {
    const response=await fetchImpl(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate-ice-servers`,
      {method:"POST",headers:{"Authorization":`Bearer ${apiToken}`,"Content-Type":"application/json"},
       body:JSON.stringify({ttl:Math.max(600,Math.min(7200,Math.floor(ttl)))}),
       signal:abort.signal}
    );
    if(!response.ok)return null;
    const value=await response.json();
    if(!Array.isArray(value?.iceServers))return null;
    const turn=value.iceServers.find(s=>Array.isArray(s?.urls)&&
      s.urls.includes("turns:turn.cloudflare.com:443?transport=tcp")&&
      typeof s.username==="string"&&s.username.length>0&&s.username.length<=256&&
      typeof s.credential==="string"&&s.credential.length>0&&s.credential.length<=512);
    if(!turn)return null;
    return {iceServers:[{urls:"turns:turn.cloudflare.com:443?transport=tcp",username:turn.username,credential:turn.credential}]};
  } catch {return null;} finally {clearTimeout(timer);}
}
