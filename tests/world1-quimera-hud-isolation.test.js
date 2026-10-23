import test from 'node:test';
import assert from 'node:assert/strict';
import { experienceBossMeta, shouldShowExperienceRibbon } from '../systems/experience.js';

test('Quimera owns a dedicated 4-phase HUD, not the old Nest Queen ribbon', () => {
  for(const phase of [1,2,3,4]){
    const boss={_fusionBoss:true,phase};
    assert.deepEqual(experienceBossMeta(boss), {
      phase,name:'QUIMERA OHANA',dedicatedHud:true
    });
    assert.equal(shouldShowExperienceRibbon({boss,combo:15,evoT:50}),false,
      'generic Momentum ribbon must never obscure the Quimera fight');
  }
});

test('Legacy three-phase Nest Queen still has its Momentum presentation', () => {
  for(const phase of [1,2,3]){
    const boss={boss:true,phase};
    assert.deepEqual(experienceBossMeta(boss),{
      phase,name:'REINA DEL NIDO',dedicatedHud:false
    });
    assert.equal(shouldShowExperienceRibbon({boss}),true);
  }
  assert.equal(experienceBossMeta({phase:9}).phase,3,'legacy boss phase is bounded');
});

test('Normal play keeps standard combo and evolution notifications', () => {
  assert.equal(shouldShowExperienceRibbon({combo:0,evoT:0}),false);
  assert.equal(shouldShowExperienceRibbon({combo:2}),true);
  assert.equal(shouldShowExperienceRibbon({evoT:4}),true);
});
