import { createHmac } from "node:crypto";

// coturn REST shared-secret credentials: no long-lived secret reaches the browser.
export function temporaryTurnConfig({url,secret,playerId,now=Date.now(),ttlSeconds=900}={}) {
  if(typeof url!=="string"||!/^turns:[a-z0-9.-]+:(443|5349)\?transport=tcp$/i.test(url)) return null;
  if(typeof secret!=="string"||secret.length<24||typeof playerId!=="string"||!/^[a-zA-Z0-9_-]{1,100}$/.test(playerId)) return null;
  const ttl=Math.max(60,Math.min(1800,Math.floor(ttlSeconds)));
  const expiresAt=Math.floor(now/1000)+ttl;
  const username=`${expiresAt}:${playerId}`;
  const credential=createHmac("sha1",secret).update(username).digest("base64");
  return {iceServers:[{urls:url,username,credential}],expiresAt:expiresAt*1000};
}
