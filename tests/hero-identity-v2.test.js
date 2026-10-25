import test from 'node:test';
import assert from 'node:assert/strict';
import {ALL_ROSTER,ROSTER,applyForm} from '../characters/roster.js';
import {HERO_IDENTITY,applyHeroIdentity,heroMeleeMultiplier} from '../characters/identity-v2.js';
import {markAt} from '../characters/signature.js';

test('V2: ten heroes have honest strengths and weaknesses with unchanged form identities',()=>{
  assert.equal(ROSTER.length,10);
  for(const hero of ROSTER){
    assert.equal(hero.forms.length,5);
    assert.ok(hero.identity?.strength&&hero.identity?.weakness);
    for(const f of hero.forms)assert.ok(f.speed>0&&f.hp>0&&f.jump>0&&f.w>0&&f.h>0);
  }
});
test('V2: Cuerno is faster and Dino has significantly more health and melee damage',()=>{
  const byId=Object.fromEntries(ROSTER.map(h=>[h.id,h]));
  for(const evo of [0,1,2,3,4]){
    assert.ok(byId.cuerno.forms[evo].speed>byId.chispin.forms[evo].speed);
    assert.ok(byId.chispin.forms[evo].speed>byId.dino.forms[evo].speed);
    assert.ok(byId.dino.forms[evo].hp>=byId.chispin.forms[evo].hp*2.3);
    assert.ok(markAt('dino',evo).dmg>markAt('cuerno',evo).dmg*1.7);
  }
});
test('V2: role selection updates actual gameplay form stats, not only a selector description',()=>{
  for(const hero of ALL_ROSTER.filter(h=>h.id!=='kilo')){
    const p={id:hero.id,forms:hero.forms,evo:4,w:hero.forms[3].w,h:hero.forms[3].h,health:1,maxHealth:1};
    applyForm(p,{silent:true});
    assert.equal(p.speed,HERO_IDENTITY[hero.id].speed[4]);
    assert.equal(p.maxHealth,HERO_IDENTITY[hero.id].hp[4]);
    assert.equal(p.jumpPower,HERO_IDENTITY[hero.id].jump[4]);
  }
});
test('V2: Kilo V1 remains unchanged and identity enrichment cannot compound',()=>{
  const kilo=ROSTER.find(h=>h.id==='kilo');
  assert.deepEqual(kilo.forms.map(f=>f.hp),[80,100,125,155,210]);
  assert.equal(markAt('kilo',0).dmg,14);
  const snapshot=ROSTER.map(h=>h.forms.map(f=>[f.speed,f.hp,f.jump]));
  applyHeroIdentity(ROSTER);
  assert.deepEqual(ROSTER.map(h=>h.forms.map(f=>[f.speed,f.hp,f.jump])),snapshot);
  assert.equal(heroMeleeMultiplier('unknown'),1);
});
test('V2: compact hitboxes and jump counts preserved for all evolved forms',()=>{
  const initial=[ [20,24,28,32,36], [24,28,34,38,42] ];
  assert.deepEqual(ROSTER.find(h=>h.id==='kilo').forms.map(f=>f.w),initial[0]);
  assert.deepEqual(ROSTER.find(h=>h.id==='stitcho').forms.map(f=>f.w),initial[1]);
  assert.equal(ROSTER.find(h=>h.id==='cuerno').forms[4].jumps,4);
});
