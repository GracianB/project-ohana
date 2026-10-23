import test from 'node:test';
import assert from 'node:assert/strict';
import { experienceBossMeta, shouldShowExperienceRibbon } from '../systems/experience.js';
import { world1BossHealthLayout, world1BossAccessibleText } from '../systems/world1-boss.js';

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

test('Quimera health bar clears the lower ability controls at desktop and compact sizes', () => {
  for(const [w,h] of [[1440,900],[1280,720],[800,600],[390,700]]) {
    const {bx,bw,by}=world1BossHealthLayout(w,h);
    assert.ok(bx>=0 && bx+bw<=w+0.01,'health bar should remain in viewport');
    assert.ok(by>100,'health bar must not overlap top navigation');
    assert.ok(by+24<=h-90,'reserve at least 90px for bottom controls');
    assert.ok(bw<=700 && bw<=w*0.52+0.01);
  }
});

test('Quimera has accessible announcements at phase and 10-percent HP milestones', () => {
  assert.equal(world1BossAccessibleText(null),'');
  assert.equal(world1BossAccessibleText({phase:1,hp:500,max:500}),'');
  const boss={_fusionBoss:true,max:2800,hp:2800,phase:1};
  assert.match(world1BossAccessibleText(boss),/Fase 1 de 4.*100 por ciento/);
  boss.hp=2730;
  assert.match(world1BossAccessibleText(boss),/100 por ciento/);
  boss.hp=2500;boss.phase=2;
  assert.match(world1BossAccessibleText(boss),/Fase 2 de 4.*90 por ciento/);
  boss.hp=0;boss.phase=4;
  assert.match(world1BossAccessibleText(boss),/Fase 4 de 4.*0 por ciento/);
});
