import test from 'node:test';import assert from 'node:assert/strict';
import {recordKiloHit,kiloComboStatus,consumeKiloCombo,resetKiloCombo} from '../systems/kilo-combo.js';
import {updatePlayerLocomotion,resetPlayerLocomotion} from '../systems/player-movement.js';
import {beginHeroPower,updateHeroPowers} from '../systems/hero-combos.js';
const fixture=()=>({player:{id:'kilo',evo:3,x:0,y:0,w:32,h:48,speed:5.1,facing:1},roomId:'hub',t:0,nums:{add(){}}});
test('Only distinct landed H J H actions earn a single six-second I window',()=>{
 const g=fixture(),swing={},note={};assert.equal(consumeKiloCombo(g),false);
 recordKiloHit(g,'H',swing);recordKiloHit(g,'H',swing);assert.equal(kiloComboStatus(g).step,1);
 recordKiloHit(g,'J',note);recordKiloHit(g,'J',note);assert.equal(kiloComboStatus(g).step,2);
 g.t=200;assert.equal(recordKiloHit(g,'H',{}),true);assert.equal(kiloComboStatus(g).remaining,360);
 assert.equal(consumeKiloCombo(g),true);assert.equal(consumeKiloCombo(g),false);assert.equal(kiloComboStatus(g).step,0);
});
test('Wrong order, timeouts, room/hero changes, death and resets never keep a stale combo',()=>{
 const g=fixture();recordKiloHit(g,'J',{});assert.equal(kiloComboStatus(g).step,0);
 recordKiloHit(g,'H',{});g.t=241;recordKiloHit(g,'J',{});assert.equal(kiloComboStatus(g).step,0);
 for(const key of ['H','J','H'])recordKiloHit(g,key,{});g.t+=361;assert.equal(kiloComboStatus(g).ready,false);
 for(const key of ['H','J','H'])recordKiloHit(g,key,{});g.roomId='beach';assert.equal(kiloComboStatus(g).ready,false);
 for(const key of ['H','J','H'])recordKiloHit(g,key,{});g.player.dead=true;assert.equal(consumeKiloCombo(g),false);resetKiloCombo(g);g.player.dead=false;assert.equal(kiloComboStatus(g).ready,false);
 g.player={...g.player};assert.equal(kiloComboStatus(g).step,0);g.player.evo=2;for(const key of ['H','J','H'])recordKiloHit(g,key,{});assert.equal(kiloComboStatus(g).ready,false);
});
test('Double tap runs while held; release, reverse, drop, death and reset stop it',()=>{
 for(const dir of [-1,1]){const {player:p}=fixture();const tap=(t,x=dir,extra={})=>updatePlayerLocomotion(p,{t,axisX:x,...extra});assert.equal(tap(0),5.1);tap(2,0);assert.equal(tap(10),5.1*1.4);assert.equal(p._sprinting,true);assert.equal(tap(20),5.1*1.4);assert.equal(tap(21,0),5.1);tap(22);assert.equal(tap(23,-dir),5.1);tap(24,0);tap(25,-dir);assert.equal(p._sprinting,true);assert.equal(tap(26,-dir,{drop:true}),5.1);resetPlayerLocomotion(p);assert.equal(p._sprinting,false);}
 const p=fixture().player;updatePlayerLocomotion(p,{axisX:1,t:0});updatePlayerLocomotion(p,{axisX:0,t:1});assert.equal(updatePlayerLocomotion(p,{axisX:1,t:20}),5.1);
 p.dead=true;assert.equal(updatePlayerLocomotion(p,{axisX:1,t:21}),5.1);
});
test('Running never modifies flight speed or produces a zero-input latch',()=>{
 const p=fixture().player;updatePlayerLocomotion(p,{axisX:1,t:0});updatePlayerLocomotion(p,{axisX:0,t:1});p._kiloFlightT=30;assert.equal(updatePlayerLocomotion(p,{axisX:1,t:2}),5.1);assert.equal(p._sprinting,false);
});
test('I crosses targets with one real ascending hit each and finite recovery',()=>{
 const g=fixture(),s={moves:[],fields:[]};g.enemies=[{x:70,y:0,w:30,h:45,hp:1000},{x:150,y:0,w:30,h:45,hp:1000}];const m=beginHeroPower(g,4,s),hits=new Map();assert.equal(g.player.invuln,10);
 for(let i=0;i<30;i++){g.player.x+=g.player.vx||0;updateHeroPowers(g,s,(_g,e,d)=>{hits.set(e,(hits.get(e)||0)+1);e.hp-=d;return true;},()=> '#fff');}
 assert.equal(s.moves.length,0);assert.equal(hits.size,2);assert.ok([...hits.values()].every(n=>n===1));assert.ok(m.speed>g.player.speed);assert.ok(g.enemies.every(e=>e.hp===928));
});

globalThis.window=globalThis;globalThis.addEventListener||=()=>{};
const {useAbility,clearAbilityFx,updateAbilityFx}=await import('../systems/abilities.js');
function arena(){const g=fixture();Object.assign(g,{worldW:4200,worldH:1260,cam:{x:0,y:0},enemies:[{x:45,y:0,w:30,h:48,hp:5000}],projectiles:[],ghosts:[],platforms:[],fx:{emit(){}},score:0});Object.assign(g.player,{health:50,maxHealth:100,abilities:['ukulele','hula','ohana'],cds:{},cdDur:{},finisherCharge:100});return g;}
test('Locked or cooling I spends neither charge nor the earned sequence; valid I spends it once',()=>{
 clearAbilityFx();const g=arena();assert.equal(useAbility(g,4),false);assert.deepEqual(g.player.cds,{});assert.equal(g.player.finisherCharge,100);
 for(const key of ['H','J','H'])recordKiloHit(g,key,{});g.player.cds.kilo_ascend=10000;assert.equal(useAbility(g,4),false);assert.equal(kiloComboStatus(g).ready,true);
 g.player.cds.kilo_ascend=0;assert.equal(useAbility(g,4),true);assert.equal(kiloComboStatus(g).ready,false);assert.equal(useAbility(g,4),false);assert.equal(g.player.finisherCharge,100);clearAbilityFx();
});
test('K protects only its opening, never heals; L heals only after damaging an enemy',()=>{
 clearAbilityFx();const g=arena();assert.equal(useAbility(g,1),true);
 for(let i=1;i<=30;i++){g.t=i;g.player._armorT=0;updateAbilityFx(g);if(i<=12)assert.ok(g.player._armorT>0);else assert.equal(g.player._armorT,0);}
 assert.ok(g.enemies[0].hp<5000);assert.equal(g.player.health,50);clearAbilityFx();g.enemies[0].invuln=0;assert.equal(useAbility(g,2),true);assert.equal(g.player.health,50);
 for(let i=0;i<40;i++){g.t++;updateAbilityFx(g);}assert.ok(g.player.health>50);clearAbilityFx();
});

test('Kilo real hits teach the next combo input without duplicate multi-hit feedback',()=>{
 const g=fixture(),messages=[];g.nums.add=(x,y,text)=>messages.push(text);
 const swing={};recordKiloHit(g,'H',swing);recordKiloHit(g,'H',swing);
 assert.deepEqual(messages,['1/3 · ACIERTA J']);
 recordKiloHit(g,'J',{});recordKiloHit(g,'H',{});
 assert.deepEqual(messages,['1/3 · ACIERTA J','2/3 · ACIERTA H','3/3 · PULSA I · 6 s']);
});
