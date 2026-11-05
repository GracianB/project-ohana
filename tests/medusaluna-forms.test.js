import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER} from '../characters/roster.js';
import {MEDUSALUNA_FORMS,drawMedusaluna} from '../characters/michi-ocean.js';
import {packSave,unpackSave} from '../systems/save.js';
import {catGrowth} from '../systems/cat-chapter.js';

const expected=['Huevo de Nácar','Caballito de Sueños','Medusa Onírica','Estrella Astral','Medusa de las Mil Lunas'];
test('Medusaluna has five marine forms and the old cat save identifier',()=>{
  const hero=ROSTER.find(h=>h.id==='cat');
  assert.ok(hero);
  assert.equal(hero.name,'Medusaluna');
  assert.deepEqual(hero.evoNames,expected);
  assert.deepEqual(hero.forms.map(f=>f.name),expected);
  assert.deepEqual([...MEDUSALUNA_FORMS],expected);
});
test('a saved jellyfish can resume without changing its form or id',()=>{
  const hero=ROSTER.find(h=>h.id==='cat'),p={...hero,evo:2,xp:160,health:81};
  const game={player:p,roomId:'w1-cat',visited:{hub:true,'w1-cat':true},world1Seals:['kilo','stitcho','chispin','cat'],score:100};
  const stored=packSave(game);
  const restored=unpackSave(stored,'cat');
  assert.equal(restored.id,'cat');assert.equal(restored.roomId,'w1-cat');
  assert.equal(restored.evo,2);assert.equal(restored.xp,160);
});
test('all five ocean forms draw without mutating any frozen pose',()=>{
  const ops=[];
  const ctx=new Proxy({globalAlpha:1}, {
    get(target,key){if(key in target)return target[key];
      if(key==='createLinearGradient'||key==='createRadialGradient')return()=>({addColorStop(){}});
      return(...args)=>{for(const value of args)if(typeof value==='number')assert.ok(Number.isFinite(value),String(key));ops.push(key);};
    },set(target,key,value){target[key]=value;return true;}
  });
  for(let form=0;form<5;form++)for(const state of ['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory','dead']){
    const pose=Object.freeze({t:73,form,state,cast:.5,atk:.6,michiPowerIndex:3});
    const before=JSON.stringify(pose);
    assert.doesNotThrow(()=>drawMedusaluna(ctx,pose,form),form+':'+state);
    assert.equal(JSON.stringify(pose),before);
  }
  assert.ok(ops.length>100);
});

test('sealed Medusaluna chapter preserves player choice and loaded XP across all ticks',()=>{
  const game={roomDef:{id:'w1-cat',growthChapter:'cat'},
    world1:{sealed:true,stations:Array.from({length:5},()=>({done:true}))},
    player:{id:'cat',evo:2,xp:160},_preserveCompletedCatForm:true};
  for(let i=0;i<240;i++)catGrowth(game);
  assert.equal(game.player.evo,2);
  assert.equal(game.player.xp,160);
  game._preserveCompletedCatForm=false;
  catGrowth(game);
  assert.ok(game.player.xp>=420,'legacy completed chapter can still recover earned XP');
});
