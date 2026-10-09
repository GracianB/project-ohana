// OHANA V95 · remote presence under real packet gaps.
// Client-only cosmetics: never moves the authoritative character or touches room protocol.
export const V95_PRESENCE = Object.freeze({
  leadMs:54, maxLeadPx:42, leadFadeStart:300, leadFadeEnd:760,
  weakAt:900, fadedAt:2600, minAlpha:.44, blend:.22,
});
const finite=(n,f=0)=>typeof n==="number"&&Number.isFinite(n)?n:f;
const bound=(x,min,max)=>Math.max(min,Math.min(max,x));
export function remotePresenceCorrection(remote,now){
 const t=finite(now);
 const last=finite(remote?.sampleAt,t);
 const age=bound(t-last,0,60000);
 const sampleDt=bound(last-finite(remote?.previousSampleAt,last-180),16,1500);
 const tx=finite(remote?.targetX,finite(remote?.x));
 const ty=finite(remote?.targetY,finite(remote?.y));
 const vx=(tx-finite(remote?.previousX,tx))/sampleDt;
 const vy=(ty-finite(remote?.previousY,ty))/sampleDt;
 // Packet loss must NEVER project a sprint indefinitely or leave the ghost
 // running far past the server-authoritative location.
 // V104: real Netlify packets may arrive 350–900ms apart. Preserve their
 // observed interval instead of treating a 700ms gap as 180ms movement.
 const adaptive=sampleDt>240;
 const leadMs=adaptive?bound(sampleDt*.32,V95_PRESENCE.leadMs,180):V95_PRESENCE.leadMs;
 const fadeStart=adaptive?bound(sampleDt*.8,V95_PRESENCE.leadFadeStart,760):V95_PRESENCE.leadFadeStart;
 const fadeEnd=adaptive?bound(sampleDt+390,V95_PRESENCE.leadFadeEnd,1450):V95_PRESENCE.leadFadeEnd;
 const leadFactor=1-bound((age-fadeStart)/(fadeEnd-fadeStart),0,1);
 const leadX=bound(vx*leadMs,-V95_PRESENCE.maxLeadPx,V95_PRESENCE.maxLeadPx)*leadFactor;
 const leadY=bound(vy*leadMs,-V95_PRESENCE.maxLeadPx,V95_PRESENCE.maxLeadPx)*leadFactor;
 const weakness=bound((age-V95_PRESENCE.weakAt)/
  (V95_PRESENCE.fadedAt-V95_PRESENCE.weakAt),0,1);
 return {
  x:tx+leadX, y:ty+leadY,
  opacity:Math.max(V95_PRESENCE.minAlpha,1-(1-V95_PRESENCE.minAlpha)*weakness),
  stale:age>=V95_PRESENCE.weakAt,
  age, sampleDt, blend:bound(V95_PRESENCE.blend*(16.67/sampleDt),.16,.36),
 };
}
