// OHANA V109 · bounded RTC repair and truthful freshness.
// No network calls, no extra simulation loop. Reuse the normal 60Hz game tick.
export const RTC_STALE_MS=4500;
export const RTC_RETRY_MIN_MS=16000;
export function rtcReconnectDelay(attempts=0){
  const n=Number.isFinite(attempts)?Math.max(0,Math.floor(attempts)):0;
  return [RTC_RETRY_MIN_MS,27000,45000][Math.min(n,2)]??60000;
}
export function rtcFresh(active,lastPoseAt,connectedAt,now){
  if(!active||!Number.isFinite(now))return false;
  const started=lastPoseAt>0?lastPoseAt:connectedAt;
  return Number.isFinite(started)&&started>0&&now-started>=0&&now-started<RTC_STALE_MS;
}
export function rtcCanRetry({now=0,at=0,hidden=false,lobby=false,peer=false,connected=false}={}){
  return peer&&!hidden&&!lobby&&!connected&&Number.isFinite(now)&&now>=at;
}
