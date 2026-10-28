import test from 'node:test';import assert from 'node:assert/strict';
import {combatCoach,combatRules} from '../systems/combat-coach.js';
import {registerCombatAction} from '../systems/abilities.js';
import {recordKiloHit} from '../systems/kilo-combo.js';
import {ROSTER} from '../characters/roster.js';
const make=(id,evo=0)=>({roomId:'w1-'+id,t:100,player:{id,evo,abilities:ROSTER.find(r=>r.id===id).abilities,cds:{},finisherCharge:0}});
test('the coach never recommends locked or cooling powers and does not grant actions',()=>{
  for(const def of ROSTER){
    const g=make(def.id),before=JSON.stringify(g.player);
    assert.match(combatCoach(g).title,/H CERCA/);assert.match(combatCoach(g).footer,/I · forma 4/);
    assert.equal(JSON.stringify(g.player),before);
    g.player.evo=1;assert.match(combatCoach(g).title,/J → K/);
    g.player.cds[g.player.abilities[1]]=10000;
    assert.doesNotMatch(combatCoach(g).title,/→ K|AHORA K/);
    g.player.evo=2;assert.match(combatCoach(g).title,/J → L/);
  }
});
test('the guide reflects real registered actions, expires them, and rejects future timestamps',()=>{
  const g=make('stitcho',1);registerCombatAction(g,'J');assert.match(combatCoach(g).title,/AHORA K/);
  g.t+=12;registerCombatAction(g,'K');const before=JSON.stringify(g),view=combatCoach(g);
  assert.equal(view.mode,'link');assert.match(view.title,/J → K/);assert.match(view.accessible,/2 ataques distintos/);
  assert.equal(JSON.stringify(g),before,'presentation cannot spend or grant anything');
  g.t+=181;assert.equal(combatCoach(g).mode,'learn');
  g.player._combatChain=[{key:'J',t:g.t+100},{key:'K',t:g.t+120}];assert.equal(combatCoach(g).mode,'learn');
});
test('Kilo keeps its three successful casts and cannot advertise I ready during recovery',()=>{
  const g=make('kilo',3);combatCoach(g);assert.equal(g._kiloCombo.step,0);
  for(let i=0;i<3;i++)recordKiloHit(g,'J',{});
  assert.match(combatCoach(g).title,/REMATE LISTO/);
  g.player.cds.kilo_ascend=10000;assert.match(combatCoach(g).title,/ESPERA/);
  assert.equal(g._kiloCombo.ready,true);assert.equal(g.player.cds.kilo_ascend,10000);
});
test('P reports actual charge and every hero explains its own I/P without confusing U',()=>{
  for(const def of ROSTER){const g=make(def.id,4);g.player.finisherCharge=67;
    assert.match(combatCoach(g).footer,/P · 67\/100/);g.player.finisherCharge=100;assert.match(combatCoach(g).footer,/P · listo/);
    const rules=combatRules(def.id);assert.equal(rules.length,4);assert.match(rules[1].title,/I ·/);assert.match(rules[2].title,/P ·/);assert.match(rules[3].text,/no conecta/);
  }
});
