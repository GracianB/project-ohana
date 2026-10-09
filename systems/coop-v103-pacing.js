// OHANA V103 · Adaptive cooperative pacing. Pure, deterministic, budgeted requests.
// Local simulation is never throttled; only snapshot delivery to Netlify is.
export const COOP_BUDGET=Object.freeze({
  minMoveMs:250, baseMoveMs:340, maxMoveMs:750,
  basePollMs:650, maxPollMs:1250,
  idleHeartbeatMs:2600, minDistance:5,
});
const finite=(n,f)=>Number.isFinite(Number(n))?Number(n):f;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));

export function networkPacing(rttMs=0, failures=0, waiting=false){
  const rtt=clamp(finite(rttMs,0),0,3000);
  const loss=clamp(Math.floor(finite(failures,0)),0,5);
  // Avoid running faster than the Netlify function can answer.
  const move=clamp(Math.round(COOP_BUDGET.baseMoveMs + Math.max(0,rtt-180)*.5 + loss*100),COOP_BUDGET.minMoveMs,COOP_BUDGET.maxMoveMs);
  const poll=clamp(Math.round(COOP_BUDGET.basePollMs + Math.max(0,rtt-200)*.6 + loss*100 +(waiting?180:0)),COOP_BUDGET.basePollMs,COOP_BUDGET.maxPollMs);
  return Object.freeze({moveMs:move,pollMs:poll,heartbeatMs:COOP_BUDGET.idleHeartbeatMs});
}

export function shouldSendPosition(previous, current, elapsedMs, pacing=networkPacing(), force=false){
  if(force)return true;
  if(!current||elapsedMs<pacing.moveMs)return false;
  if(!previous)return true;
  if(elapsedMs>=pacing.heartbeatMs)return true;
  // Always transmit room, powers, facing and health changes; avoid idle position spam.
  for(const key of ["worldRoomId","facing","evolution","health","maxHealth","grounded","melee","dash"]){
    if(current[key]!==previous[key])return true;
  }
  for(const key of ["positionX","positionY"]){
    if(Math.abs(finite(current[key],0)-finite(previous[key],0))>=COOP_BUDGET.minDistance)return true;
  }
  // XP matters for shared progression. Ordinary velocity changes alone can wait.
  return current.experience!==previous.experience;
}

export function roundtripEWMA(previous=0,current=0){
  const sample=clamp(finite(current,0),0,10000);
  if(sample<=0)return clamp(finite(previous,0),0,10000);
  const old=clamp(finite(previous,0),0,10000);
  return Math.round((old?old*.78+sample*.22:sample)*10)/10;
}
