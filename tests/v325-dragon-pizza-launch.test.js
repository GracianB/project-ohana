import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {clearAbilityFx,useAbility,updateAbilityFx} from '../systems/abilities.js';
import {optionsForUPartner,DEFAULT_U_PARTNERS} from '../systems/u-partners.js';
import {SUPREME_LAUNCH_RADII,SUPREME_LAUNCH_WINDUP,
  selectSupremeLaunchTargets} from '../systems/u-field-targeting.js';

const enemyAt=(x,y,id,extra={})=>({
  x:x-12,y:y-12,w:24,h:24,id,hp:1000,maxHp:1000,
  dying:false,invuln:0,vx:0,vy:0,stun:0,flash:0,...extra
});
const makeGame=(id,evo,partner,enemies=[])=>({
  player:{id,abilities:[],x:100,y:260,w:28,h:34,
    facing:1,evo,health:40,maxHealth:125,xp:0,
    cds:{},cdDur:{},dead:false,vx:0,vy:0,speed:6,uPartner:partner},
  enemies,roomId:'hub',projectiles:[],ghosts:[],platforms:[],
  worldW:1800,worldH:900,cam:{x:0,y:0},t:0,
  shake:0,flash:0,score:0,reduceMotion:true,
  nums:{add(){}},fx:{emit(){}}
});
const tick=(g,n)=>{for(let i=0;i<n;i++){g.t++;updateAbilityFx(g);}};

test('V325 local launch geometry respects AABB edges and cannot mutate targets',()=>{
  assert.deepEqual(SUPREME_LAUNCH_RADII,{dragon:320,pizza:430});
  assert.equal(SUPREME_LAUNCH_WINDUP,12);
  for(const hero of ['dragon','pizza']){
    const radius=SUPREME_LAUNCH_RADII[hero];
    const inside=enemyAt(radius+12,0,'rim');
    const outside=enemyAt(radius+12.01,0,'outside');
    const corner=enemyAt(radius+11,radius+11,'corner');
    const invalid={id:'invalid',x:NaN,y:0,w:24,h:24};
    const frozen=Object.freeze([outside,invalid,inside,corner]);
    assert.deepEqual(selectSupremeLaunchTargets(frozen,hero,0,0),[inside]);
    assert.equal(selectSupremeLaunchTargets(frozen,hero,Infinity,0).length,0);
    assert.equal(selectSupremeLaunchTargets(frozen,'yomi',0,0).length,0);
    assert.equal(selectSupremeLaunchTargets(null,hero,0,0).length,0);
  }
});

test('V325 90 real U casts: Dragon and Pizza warn first, then locally hit all five forms and nine partners',()=>{
  for(const hero of ['dragon','pizza']){
    const choices=optionsForUPartner(hero);
    assert.equal(choices.length,9,hero);
    for(let evo=0;evo<5;evo++)for(const choice of choices){
      clearAbilityFx();
      const radius=SUPREME_LAUNCH_RADII[hero];
      const close=enemyAt(175,277,'near');
      const edge=enemyAt(114+radius+12,277,'edge');
      const outside=enemyAt(114+radius+12.1,277,'outside');
      const remote=enemyAt(1390,300,'remote');
      const g=makeGame(hero,evo,choice.id,[remote,outside,close,edge]);
      assert.equal(useAbility(g,3),true,`${hero} F${evo} + ${choice.id}`);
      assert.equal(close.hp,1000,'no invisible damage at cast');
      assert.equal(edge.hp,1000);
      assert.equal(outside.hp,1000);
      assert.equal(g._familyDuet.legacyTargets.size,0,'no imaginary legacy hit before impact');
      assert.equal(g._familyDuet?.ally||DEFAULT_U_PARTNERS[hero],choice.id);
      assert.ok(g.player.cds[hero==='dragon'?'nova':'ovenking']>0,'preserve U cooldown');
      if(hero==='dragon')assert.ok(g.player._specialFlightT>=260);
      else assert.ok(g.player._ovenKingT>=180);
      tick(g,SUPREME_LAUNCH_WINDUP-1);
      assert.equal(close.hp,1000,'warning must last for eleven full frames');
      assert.equal(g.score,0,'no score before visible impact');
      tick(g,1);
      assert.ok(close.hp<1000,'nearby enemy must take original-strength U hit');
      assert.ok(edge.hp<1000,'boundary AABB must take U hit');
      assert.equal(outside.hp,1000,'beyond ring cannot take U hit');
      assert.equal(remote.hp,1000,'other room cannot take U hit');
      assert.equal(g._familyDuet.legacyTargets.size,2);
      assert.ok(g._familyDuet.legacyTargets.has(close));
      assert.ok(g._familyDuet.legacyTargets.has(edge));
      assert.ok(!g._familyDuet.legacyTargets.has(outside));
      assert.ok(g.score>0,'actual impacts still grant normal combo/score');
    }
  }
  clearAbilityFx();
});

test('V325 launch hits targets at warning expiry, not at cast; cancels on room change or death',()=>{
  for(const hero of ['dragon','pizza']){
    clearAbilityFx();
    const enemy=enemyAt(950,277,'moving');
    const g=makeGame(hero,4,undefined,[enemy]);
    assert.equal(useAbility(g,3),true);
    tick(g,5);assert.equal(enemy.hp,1000);
    enemy.x=150;enemy.y=265;
    tick(g,7);assert.ok(enemy.hp<1000,'enemy entering warned area is hittable');
    clearAbilityFx();
    const leave=enemyAt(150,277,'leave'),room=makeGame(hero,2,undefined,[leave]);
    useAbility(room,3);tick(room,5);room.roomId='forest';tick(room,12);
    assert.equal(leave.hp,1000,'warning must not damage a different room');
    clearAbilityFx();
    const foe=enemyAt(150,277,'dead'),dead=makeGame(hero,2,undefined,[foe]);
    useAbility(dead,3);tick(dead,5);dead.player.dead=true;tick(dead,12);
    assert.equal(foe.hp,1000,'a dead actor cannot complete the U launch');
  }
  clearAbilityFx();
});

test('V325 visible warning circle, impact selector and immutable special contracts remain linked',()=>{
  const source=readFileSync(new URL('../systems/abilities.js',import.meta.url),'utf8');
  assert.match(source,/supremeLaunch\(ctx,f,cam,t,g\)\{/);
  assert.match(source,/ctx\.arc\(x,y,f\.radius,0,TAU\);ctx\.stroke\(\)/,
    'warning ring must use exact radius supplied to collision selector');
  assert.match(source,/selectSupremeLaunchTargets\(\(g\.enemies\|\|\[\]\)\.filter\(canHit\),f\.mode,f\.x,f\.y\)/);
  assert.match(source,/if\(f\.duet&&g\._familyDuet===f\.duet\)f\.duet\.legacyTargets\.add\(e\)/);
  assert.match(source,/DINO_FX\.castUltimate\(game,p,enemies,dmg,def\.color\)/);
  assert.match(source,/const execute=!e\.boss/);
  assert.match(source,/_auroraSleepT/);
  assert.match(source,/selectFritaFieldTargets\(enemies,cx\(p\),cy\(p\)\)/);
});
