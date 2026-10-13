import test from 'node:test';
import assert from 'node:assert/strict';
import {useAbility, clearAbilityFx} from '../systems/abilities.js';
import {optionsForUPartner, DEFAULT_U_PARTNERS} from '../systems/u-partners.js';
import {FRITA_FIELD_RADIUS} from '../systems/u-field-targeting.js';

const enemyAt = (x,y,id)=>({
  id, x:x-12, y:y-12, w:24,h:24,
  hp:1000,maxHp:1000,vx:0,vy:0,stun:0,flash:0,
  dying:false,invuln:0
});
function gameFor(form,ally,enemies) {
  const player={
    id:'frita', abilities:['salt','ketchup','fryer'],
    x:100,y:260,w:28,h:34,facing:1,
    evo:form, health:40,maxHealth:125,xp:0,
    cds:{},cdDur:{},dead:false,vx:0,vy:0,speed:6,
    uPartner:ally
  };
  return {player,enemies,projectiles:[],ghosts:[],platforms:[],
    worldW:1600,worldH:900,roomId:'hub',
    cam:{x:0,y:0},t:2,reduceMotion:true,
    shake:0,flash:0,score:0,
    nums:{add(){}},fx:{emit(){}}
  };
}

test('V324: Frita cast U damages local targets only, all 5 evolutions and 9 partners',()=>{
  const partners=optionsForUPartner('frita');
  assert.equal(partners.length,9);
  for(let form=0;form<5;form++)for(const partner of partners){
    clearAbilityFx();
    const near=enemyAt(114,277,'near');
    const rim=enemyAt(114+FRITA_FIELD_RADIUS,277,'rim');
    const distant=enemyAt(114+FRITA_FIELD_RADIUS+0.1,277,'distant');
    const otherRoom=enemyAt(1300,300,'otherRoom');
    const g=gameFor(form,partner.id,[distant,otherRoom,near,rim]);
    assert.equal(useAbility(g,3),true,`Frita form ${form} with ${partner.id}`);
    assert.ok(near.hp<1000,'nearby target should receive launch hit');
    assert.ok(rim.hp<1000,'exact radius boundary remains eligible');
    assert.equal(distant.hp,1000,'outside radius must never take launch damage');
    assert.equal(otherRoom.hp,1000,'other end of room must never take launch damage');
    assert.ok(g.player.health>40,'Frita healing must remain');
    assert.ok(g.player._fryGodT>=180,'Frita cooking transformation must remain');
    assert.ok(g.player._specialSpeedT>=260,'Frita speed mode must remain');
    assert.equal(g._familyDuet?.hero,'frita');
    assert.equal(g._familyDuet?.ally||DEFAULT_U_PARTNERS.frita,partner.id);
    assert.equal(g._familyDuet.legacyTargets.has(near),true,'launch hit cannot be repeated by ally L');
    assert.equal(g._familyDuet.legacyTargets.has(rim),true,'rim target cannot be hit by ally again');
    assert.equal(g._familyDuet.legacyTargets.has(distant),false,'unhit target must remain eligible for later L');
    assert.equal(g._familyDuet.legacyTargets.has(otherRoom),false);
  }
  clearAbilityFx();
});

test('V324: Frita initial U max five nearest, not enemies enumeration order',()=>{
  clearAbilityFx();
  const crowded=Array.from({length:9},(_,i)=>enemyAt(114+10+i*12,277,String(i)));
  const far=enemyAt(1190,277,'far');
  const enemies=[far,...crowded.slice().reverse()];
  const g=gameFor(4,'pizza',enemies);
  assert.equal(useAbility(g,3),true);
  assert.deepEqual(crowded.filter(e=>e.hp<1000).map(e=>e.id),['0','1','2','3','4']);
  assert.equal(g._familyDuet.legacyTargets.size,5);
  assert.equal(far.hp,1000);
  assert.equal(g.player.cds.frygod>0,true,'supreme cooldown is preserved');
  clearAbilityFx();
});

test('V324: Frita U on empty and distant-only rooms keeps healing and duet with no phantom hit',()=>{
  for(const enemies of [[],[enemyAt(1100,600,'distant')]]){
    clearAbilityFx();
    const g=gameFor(2,'pizza',enemies);
    assert.equal(useAbility(g,3),true);
    assert.equal(g._familyDuet.legacyTargets.size,0);
    assert.equal(g.score,0);
    assert.ok(g.player.health>40);
    assert.ok(g._familyDuet.age===0);
    for(const e of enemies)assert.equal(e.hp,1000);
  }
  clearAbilityFx();
});
