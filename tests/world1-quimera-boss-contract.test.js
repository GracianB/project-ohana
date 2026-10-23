import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FUSION_BOSS, FUSION_PHASES, FUSION_ATTACKS,
  FUSION_PHASE_ATTACKS, FUSION_SPECIALS,
  createFusionBoss, fusionPhaseFor
} from '../systems/fusion-boss.js';
import { BOSS_FAIRNESS, world1BossFilterDamage } from '../systems/world1-boss.js';

test('Quimera transitions through four strictly decreasing health bands', () => {
  const max = FUSION_BOSS.hp;
  assert.equal(max, 2800);
  assert.deepEqual(FUSION_PHASES, [0.7, 0.45, 0.2]);
  assert.equal(fusionPhaseFor(max,max),1);
  assert.equal(fusionPhaseFor(max*0.7+1,max),1);
  assert.equal(fusionPhaseFor(max*0.7,max),2);
  assert.equal(fusionPhaseFor(max*0.45+1,max),2);
  assert.equal(fusionPhaseFor(max*0.45,max),3);
  assert.equal(fusionPhaseFor(max*0.20+1,max),3);
  assert.equal(fusionPhaseFor(max*0.20,max),4);
  assert.equal(fusionPhaseFor(1,max),4);
});

test('Each stage exposes authored attacks and a special after first', () => {
  assert.equal(Object.keys(FUSION_ATTACKS).length,10,'one distinct attack per hero');
  assert.deepEqual([...new Set(Object.values(FUSION_ATTACKS).map(x=>x.hero))].sort(),
    ['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi'].sort());
  for(const phase of [1,2,3,4]){
    const attacks=FUSION_PHASE_ATTACKS[phase];
    assert.ok(attacks.length>=3,'every phase must have fight mechanics');
    assert.equal(new Set(attacks).size,attacks.length);
    for(const id of attacks) assert.ok(FUSION_ATTACKS[id],'unknown boss attack '+id);
    if(phase>1) assert.ok(FUSION_SPECIALS[phase],'missing phase special');
  }
});

test('Player damage cap, intro immunity, and real post-hit grace still apply', () => {
  const boss=createFusionBoss();
  const director={grace:0,attackDmg:0,defeat:null,hitFlash:0};
  const game={boss,world1Boss:director};
  assert.equal(world1BossFilterDamage(game,100),0,'intro cannot hurt hero');
  boss._fusion.mode='attack';
  const capped=world1BossFilterDamage(game,300);
  assert.equal(capped,BOSS_FAIRNESS.capPerAttack);
  assert.equal(director.grace,BOSS_FAIRNESS.grace);
  assert.equal(world1BossFilterDamage(game,300),0,'grace prevents immediate repeat hit');
  director.grace=0;
  assert.equal(world1BossFilterDamage(game,300),0,'same attack budget cannot hit twice');
  director.attackDmg=0;
  assert.equal(world1BossFilterDamage(game,9),9,'next attack may deal ordinary damage');
});
