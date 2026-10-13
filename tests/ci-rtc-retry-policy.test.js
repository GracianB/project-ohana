import test from 'node:test';
import assert from 'node:assert/strict';
import {isTransientRtcDrop} from './browser/rtc-retry-policy.mjs';

const problem='Guest U echo not observed on host within 3000ms';
const diagnostic='OHANA U GUEST TO HOST DIAGNOSTICS ';

test('CI RTC retry: confirmed connecting channel after U deadline is eligible once',()=>{
 const log=diagnostic+'{"host":{"poseChannel":"connecting","eventChannel":"connecting"}}\nError: '+problem;
 assert.equal(isTransientRtcDrop(log),true);
});
test('CI RTC retry: diagnosed closed channel during guest U echo qualifies',()=>{
 const log=diagnostic+'{"guest":{"poseChannel":"closed","eventChannel":"closed"}}\nError: '+problem;
 assert.equal(isTransientRtcDrop(log),true);
});
test('CI RTC retry: missing U despite open connection stays a hard failure',()=>{
 const log=diagnostic+'{"host":{"poseChannel":"open","eventChannel":"open"}}\nError: '+problem;
 assert.equal(isTransientRtcDrop(log),false);
});
test('CI RTC retry: never retry damage, network negotiation or user-action regressions',()=>{
 for(const err of ['guest 12-point hit not observed once on host within 3000ms',
  'No WebRTC channels ever established','Chispin intro not rendered']){
  assert.equal(isTransientRtcDrop(diagnostic+'{"poseChannel":"closed"}\n'+err),false);
 }
});
test('CI RTC retry: without diagnostic evidence connectivity must fail',()=>{
 assert.equal(isTransientRtcDrop(problem),false);
 assert.equal(isTransientRtcDrop(null),false);
 assert.equal(isTransientRtcDrop(''),false);
});
