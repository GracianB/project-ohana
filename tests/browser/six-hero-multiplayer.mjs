import {spawnSync} from 'node:child_process';
import {isTransientRtcDrop} from './rtc-retry-policy.mjs';
const browser=process.env.OHANA_TEST_BROWSER||'chromium';
const heroes=['dragon','dino','frita','pizza','yomi','cuerno'];

function fullCoopSession(hero,attempt){
 console.log('REAL COOP: '+hero+' host and guest · '+browser+' · attempt '+attempt);
 const r=spawnSync(process.execPath,['tests/browser/multiplayer-e2e.mjs'],{
  encoding:'utf8',maxBuffer:8*1024*1024,timeout:180000,
  env:{...process.env,OHANA_TEST_BROWSER:browser,OHANA_TEST_HOST:hero,OHANA_TEST_GUEST:hero}
 });
 if(r.stdout)process.stdout.write(r.stdout);
 if(r.stderr)process.stderr.write(r.stderr);
 return {r,log:(r.stdout||'')+'\n'+(r.stderr||'')};
}
for(const hero of heroes){
 const first=fullCoopSession(hero,1);
 if(!first.r.error&&first.r.status===0)continue;
 if(first.r.error)throw first.r.error;
 if(!isTransientRtcDrop(first.log))process.exit(first.r.status||1);
 // No weakened U timing or assertions: the new session must pass completely.
 console.warn('RETRY ONCE · '+hero+' · confirmed transient RTC link dropout in '+browser);
 const second=fullCoopSession(hero,2);
 if(second.r.error)throw second.r.error;
 if(second.r.status!==0)process.exit(second.r.status||1);
 console.log('RECOVERED · '+hero+' · fresh full WebRTC session passed all assertions');
}
