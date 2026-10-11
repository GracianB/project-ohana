import test from 'node:test';
import assert from 'node:assert/strict';
import {startKiloDuet,updateKiloDuet,kiloDuetPose,readKiloDuet} from '../systems/kilo-duet.js';
import {capturePeerEffects,applyPeerEffects,advancePeerEffects} from '../systems/coop-peer-effects.js';
globalThis.window=globalThis;globalThis.addEventListener||=()=>{};
const {useAbility,clearAbilityFx,updateAbilityFx}=await import('../systems/abilities.js');
function game(evo=4){return {player:{id:'kilo',evo,x:100,y:200,w:24,h:34,facing:1,health:30,maxHealth:100,abilities:['ukulele','hula','ohana'],cds:{},cdDur:{},xp:0,vx:0,vy:0},enemies:[],projectiles:[],ghosts:[],platforms:[],roomId:'hub',worldW:1600,worldH:900,cam:{x:0,y:0},t:0,score:0,reduceMotion:true,fx:{emit(){}},nums:{add(){}}};}
test('V301 all five forms perform U without moving player or starting fullscreen cinema',()=>{
 for(let evo=0;evo<5;evo++){
  clearAbilityFx();const g=game(evo);assert.equal(useAbility(g,3),true);
  assert.equal(g.player.x,100);assert.equal(g.player.vx,0);assert.equal(g.player.vy,0);
  assert.equal(g.ult.t,0);assert.equal(g._kiloDuet.evo,evo);assert.equal(g._assist.heroId,'stitcho');
  assert.equal(useAbility(g,3),false,'cooldown must still apply');
 }
 clearAbilityFx();
});
test('V301 two-second duet has three bounded damage phases, excludes distant foes and clears on death',()=>{
 const g=game(),near={x:130,y:180,w:30,h:30,hp:1000},far={x:900,y:180,w:30,h:30,hp:1000};g.enemies=[near,far];
 const hits=[];startKiloDuet(g);const hit=(_g,e,d)=>{hits.push(e);e.hp-=d;return true;};
 for(let i=0;i<30;i++)updateKiloDuet(g,hit);assert.equal(hits.length,0);
 for(let i=0;i<95;i++)updateKiloDuet(g,hit);
 assert.ok(hits.length>=2&&hits.length<=3);assert.ok(hits.every(e=>e===near));assert.equal(far.hp,1000);
 assert.equal(g._kiloDuet,null);assert.equal(g.player._kiloDuetT,0);
 startKiloDuet(g);g.player.dead=true;updateKiloDuet(g,hit);assert.equal(g._kiloDuet,null);
});
test('V301 pose and contact follow the same ring and chaos geometry',()=>{
 const s={x:200,y:300,evo:4,facing:1,age:45},p=kiloDuetPose(s);
 assert.equal(p.beat,'chaos');assert.equal(p.radius,240);assert.ok(Math.abs(p.x-s.x)<=p.radius);
 assert.equal(kiloDuetPose({...s,age:20}).beat,'correction');assert.equal(kiloDuetPose({...s,age:100}).beat,'petal');
 assert.equal(readKiloDuet({...s,age:NaN}),null);assert.equal(readKiloDuet({...s,evo:8}),null);
});
test('V301 network echo carries the same duet and native J/K/L effects without hit sets or power',()=>{
 const g=game(),peer=game();startKiloDuet(g);g._kiloDuet.age=45;
 g.kiloAbilityFx=[{kind:'note',x:140,y:200,r:14,life:30,vx:3,vy:0,rot:0}];
 const frame=capturePeerEffects(g,1,'session');assert.equal(applyPeerEffects(peer,frame),true);
 assert.equal(peer.coopPeerEffects.kiloDuet.age,45);assert.equal(peer.coopPeerEffects.kiloDuet.power,undefined);
 assert.equal(peer.coopPeerEffects.kiloDuet.wave,undefined);advancePeerEffects(peer);
 assert.equal(peer.coopPeerEffects.kiloDuet.age,46);assert.equal(peer.coopPeerEffects.kiloFx[0].x,143);
 assert.equal(peer.player.health,30);assert.equal(peer._kiloDuet,undefined);
 assert.equal(applyPeerEffects(peer,{...frame,frameNo:2,kiloDuet:{...frame.kiloDuet,x:Infinity}}),false);
});
test('V301 Kilo musical effects are captured after simulation and report actual applied damage',()=>{
 clearAbilityFx();const g=game();g.enemies=[{x:125,y:200,w:24,h:24,hp:1000,max:1000,vx:0,vy:0}];
 const hits=[];g.onAbilityHit=(e,d)=>hits.push({e,d});useAbility(g,2);updateAbilityFx(g);
 assert.ok(g.kiloAbilityFx.some(f=>f.kind==='ohana'));assert.ok(hits.length>0);assert.ok(hits[0].d>0);
 clearAbilityFx();
});
