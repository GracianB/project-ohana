import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,applyForm} from '../characters/roster.js';
import {unlockedEvolution,mayEquipEvolution,equipOwnedEvolution} from '../systems/evolution-ownership.js';
import {packSave,unpackSave} from '../systems/save.js';

test('legacy Medusaluna saves unlock exactly the equipped form, not all five',()=>{
 assert.equal(unlockedEvolution({evo:0}),0);
 assert.equal(unlockedEvolution({evo:2}),2);
 assert.equal(unlockedEvolution({evo:1,maxEvo:4}),4);
 assert.equal(unlockedEvolution({evo:3,maxEvo:1}),3);
});
test('switching to an earlier owned Medusaluna keeps XP, position, and max unlock',()=>{
 const def=ROSTER.find(h=>h.id==='cat');
 const p={...def,id:'cat',evo:2,xp:160,maxUnlockedEvo:2,x:2300,y:1000,health:77,maxHealth:110,w:32,h:30};
 applyForm(p,{silent:true});p.health=77;const foot=p.y+p.h;
 assert.equal(equipOwnedEvolution(p,0,applyForm),true);
 assert.equal(p.evo,0);assert.equal(p.maxUnlockedEvo,2);
 assert.equal(p.xp,160);assert.equal(p.y+p.h,foot);
 assert.equal(mayEquipEvolution(p,3),false);
 assert.equal(equipOwnedEvolution(p,3,applyForm),false);
 assert.equal(equipOwnedEvolution(p,2,applyForm),true);
 assert.equal(p.maxUnlockedEvo,2);assert.equal(p.xp,160);
 const save=packSave({player:p,roomId:'w1-cat',visited:{hub:true}},null);
 assert.equal(save.maxEvo,2);assert.equal(unpackSave(save,'cat').maxEvo,2);
});
test('a previous F5 unlock survives saving while equipped as F1',()=>{
 const def=ROSTER.find(h=>h.id==='cat');
 const p={...def,id:'cat',evo:4,xp:420,maxUnlockedEvo:4,y:1000,w:40,h:42,health:185,maxHealth:185};
 applyForm(p,{silent:true});
 assert.equal(equipOwnedEvolution(p,0,applyForm),true);
 const saved=packSave({player:p,roomId:'w1-cat',visited:{hub:true}});
 assert.equal(saved.evo,0);assert.equal(saved.maxEvo,4);
 assert.equal(unpackedForm(saved),4);
 function unpackedForm(raw){return unlockedEvolution(unpackSave(raw,'cat'));}
});
