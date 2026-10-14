import test from 'node:test';
import assert from 'node:assert/strict';
import { useAbility, updateAbilityFx, clearAbilityFx, OHANA_U_WINDUP } from '../systems/abilities.js';
import { createCuernoFx } from '../systems/cuerno-fx.js';
import { resetCuernoPlay, queueCuernoPlay, updateCuernoPlay } from '../systems/cuerno-play-v373.js';
import { ROSTER } from '../characters/roster.js';
function world() {
 const def=ROSTER.find(r=>r.id==='cuerno');
 const p={...def,evo:4,x:100,y:230,w:32,h:44,facing:1,health:80,maxHealth:198,cds:{},cdDur:{},vx:0,vy:0,xp:0};
 return {player:p,roomId:'hub',enemies:[],projectiles:[],ghosts:[],platforms:[],cam:{x:0,y:0},worldW:1600,worldH:900,t:100,nums:{add(){}},fx:{emit(){}},cuernoFx:createCuernoFx(),score:0,shake:0,reduceMotion:true};
}
const foe=(x,extra={})=>({x,y:230,w:25,h:35,hp:1000,maxHp:1000,invuln:0,vx:0,vy:0,...extra});
test('V373 runtime J/K/L preserve pose, cooldown, combat flow and bond EXP',()=>{
 clearAbilityFx();const g=world(),p=g.player;
 for(const [slot,key] of ['J','K','L'].entries()) {
  assert.equal(useAbility(g,slot),true);
  assert.equal(p._cast.slot,slot);
  assert.ok(p.cds[p.abilities[slot]]>g.t*1000/60);
  assert.ok(p._cuernoKit.acts.some(a=>a.key===key));
  const count=p._cuernoKit.acts.length;
  assert.equal(useAbility(g,slot),false);
  assert.equal(p._cuernoKit.acts.length,count);
  g.t+=10;
 }
 assert.ok(g._combatFlow.distinct>=3);
 assert.ok(p.uBonds);
 clearAbilityFx();
});
test('V373 runtime damage waits for warning and forwards real hits to cooperative adapter',()=>{
 clearAbilityFx();const g=world(),e=foe(180);g.enemies=[e];const hits=[];
 g.onAbilityHit=(enemy,damage)=>hits.push({enemy,damage});
 assert.equal(useAbility(g,0),true);
 for(let i=0;i<10;i++){g.t++;updateAbilityFx(g);}
 assert.equal(e.hp,1000);assert.equal(hits.length,0);
 g.t++;updateAbilityFx(g);
 assert.ok(e.hp<1000);assert.ok(hits.some(h=>h.enemy===e&&h.damage>0));
 clearAbilityFx();
});
test('V373 U sleeps only initial ordinary targets after windup with real runtime kit enabled',()=>{
 clearAbilityFx();resetCuernoPlay();const g=world(),e=foe(180),boss=foe(240,{boss:true});g.enemies=[e,boss];
 assert.equal(useAbility(g,3),true);assert.equal(e.sleep,undefined);
 for(let i=0;i<OHANA_U_WINDUP;i++){g.t++;updateAbilityFx(g);}
 assert.ok(e.sleep>0);assert.equal(boss.sleep,undefined);
 clearAbilityFx();resetCuernoPlay();
});
test('V373 visual emotes never move the player',()=>{
 resetCuernoPlay();const g=world();g.player.grounded=true;
 queueCuernoPlay('neigh');updateCuernoPlay(g,0);assert.equal(g.player.vy,0);assert.equal(g.player.vx,0);
 resetCuernoPlay();
});
