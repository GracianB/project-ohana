import {spawn} from 'node:child_process';
import {isTransientRtcDrop} from './rtc-retry-policy.mjs';

const browser=process.env.OHANA_TEST_BROWSER||'chromium';
const heroes=['dragon','dino','frita','pizza','yomi','cuerno'];
// Preserve every end-to-end assertion and all six heroes. An overloaded runner
// sometimes stalls a Chromium process *after* both real SCTP channels open.
// A timed-out first session gets one fresh attempt, never a silent pass.
const SESSION_TIMEOUT_MS=150000;
const OUTPUT_TAIL_LIMIT=64000;

function fullCoopSession(hero,attempt){
  console.log('REAL COOP: '+hero+' host and guest · '+browser+' · attempt '+attempt);
  return new Promise(resolve=>{
    const child=spawn(process.execPath,['tests/browser/multiplayer-e2e.mjs'],{
      stdio:['ignore','pipe','pipe'],
      detached:process.platform!=='win32',
      env:{...process.env,OHANA_TEST_BROWSER:browser,OHANA_TEST_HOST:hero,OHANA_TEST_GUEST:hero}
    });
    let log='',error=null,timedOut=false;
    const output=(stream,writer)=>stream.on('data',chunk=>{
      const value=chunk.toString();
      writer.write(value); // Unlike spawnSync, retain live evidence of the stalled stage.
      log=(log+value).slice(-OUTPUT_TAIL_LIMIT);
    });
    output(child.stdout,process.stdout);
    output(child.stderr,process.stderr);
    const timer=setTimeout(()=>{
      timedOut=true;
      console.error('OHANA COOP WATCHDOG · '+hero+' · '+browser+' · attempt '+attempt+
        ' · '+SESSION_TIMEOUT_MS+' ms; terminating stalled full session');
      // Kill the whole Linux process group so browser children cannot exhaust
      // the next retry; on Windows terminate the direct process.
      try {
        if(process.platform!=='win32'&&child.pid)process.kill(-child.pid,'SIGKILL');
        else child.kill('SIGKILL');
      } catch(killError) {
        if(killError?.code!=='ESRCH')console.error('watchdog kill:',killError);
      }
    },SESSION_TIMEOUT_MS);
    child.on('error',e=>{error=e;});
    child.on('close',(code,signal)=>{clearTimeout(timer);resolve({code,signal,error,timedOut,log});});
  });
}

function passed(result){return !result.timedOut&&!result.error&&result.code===0;}
function retryReason(result){
  // Only infrastructure timeouts which had successfully opened real WebRTC,
  // or the pre-existing *diagnosed* RTC link-loss policy, merit a retry.
  if(result.timedOut&&result.log.includes('both real WebRTC channels opened'))
    return 'stalled CI process after RTC connection';
  if(!result.timedOut&&isTransientRtcDrop(result.log))
    return 'diagnosed transient RTC link loss';
  return null;
}
function fail(hero,result){
  throw new Error('REAL COOP FAILED · '+hero+' · '+browser+
    ' · exit='+result.code+' signal='+result.signal+
    ' timeout='+result.timedOut+
    (result.error?' error='+result.error.message:''));
}

for(const hero of heroes){
  const first=await fullCoopSession(hero,1);
  if(passed(first)){console.log('COOP VERIFIED · '+hero+' · '+browser);continue;}
  const reason=retryReason(first);
  if(!reason)fail(hero,first);
  console.warn('RETRY ONCE · '+hero+' · '+browser+' · '+reason+
    '; all original assertions must pass in a fresh full WebRTC session');
  const second=await fullCoopSession(hero,2);
  if(!passed(second))fail(hero,second);
  console.log('RECOVERED AND VERIFIED · '+hero+' · '+browser+
    ' · complete fresh session passed every assertion');
}
console.log('SIX-HERO REAL COOP GREEN · '+browser+' · 6/6 completed');
