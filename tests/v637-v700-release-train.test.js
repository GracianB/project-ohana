import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const ledger=JSON.parse(fs.readFileSync('docs/v637-v700-ledger.json','utf8'));
test('V637-V700 contains exactly 64 contiguous, explicit development versions',()=>{
 assert.equal(ledger.version_count,64);
 assert.equal(ledger.milestones.length,64);
 assert.equal(ledger.base,'ohana-636');
 assert.equal(ledger.target,'ohana-700');
 for(const [i,m]of ledger.milestones.entries()){
  assert.equal(m.version,637+i);
  assert.equal(m.label,'V'+m.version);
  assert.ok(m.title.length>=12,'Missing meaningful title '+m.label);
  assert.ok(m.domain.length>=3&&(m.module.endsWith('.js')||m.module.endsWith('.mjs'))&&m.module.length>=5&&m.proof.length>=8,'Missing artifact/proof '+m.label);
 }
});
test('no milestone can masquerade as complete without a SHA and evidence',()=>{
 const statuses=new Set(['planned','implemented_pending_full_validation','accepted']);
 for(const m of ledger.milestones){
  assert.ok(statuses.has(m.status),'Unknown status '+m.label);
  if(m.status==='accepted'){
   assert.match(m.accepted_sha,/^[a-f0-9]{40}$/,'No accepted commit '+m.label);
   assert.ok(m.acceptance_run_url?.startsWith('https://github.com/'),'No acceptance workflow '+m.label);
  }else assert.equal(m.accepted_sha,null,'Incomplete milestone must not claim a SHA '+m.label);
 }
});
test('public release remains 636 until ALL 64 improvements are truly accepted',()=>{
 const fullyAccepted=ledger.milestones.every(m=>m.status==='accepted');
 if(!fullyAccepted)assert.equal(ledger.public_release,'ohana-636');
 if(ledger.public_release==='ohana-700')assert.ok(fullyAccepted,'Cannot label V700 public with unfinished versions');
});
