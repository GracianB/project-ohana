import {spawnSync} from 'node:child_process';
const browser=process.env.OHANA_TEST_BROWSER||'chromium';
for(const hero of ['dragon','dino','frita','pizza','yomi','cuerno']){
 console.log('REAL COOP: '+hero+' host and guest · '+browser);
 const r=spawnSync(process.execPath,['tests/browser/multiplayer-e2e.mjs'],{stdio:'inherit',timeout:180000,env:{...process.env,OHANA_TEST_BROWSER:browser,OHANA_TEST_HOST:hero,OHANA_TEST_GUEST:hero}});
 if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);
}
