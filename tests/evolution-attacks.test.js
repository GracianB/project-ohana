import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER} from '../characters/roster.js';
import {castEvolutionAttack,summonDanceFleet,startBattleCompanion,updateEvolutionAttacks,POWER_LEVELS} from '../systems/evolution-attacks.js';
function game(id='stitcho',evo=0){return {roomId:'hub',worldW:3000,t:0,player:{id,evo,x:100,y:100,w:40,h:50,facing:1,health:20},enemies:Array.from({length:6},(_,i)=>({x:180+i*65,y:100,w:36,h:50,hp:10000})),fx:{emit(){}},nums:{add(){}}};}
function tick(g,n){for(let i=0;i<n;i++){g.player.x+=(g.player.vx||0);updateEvolutionAttacks(g,(_g,e,d)=>{e.hp-=d;return true;},(p,n)=>{p.health+=n;});}}
test('each hero has two damaging evolution attacks',()=>{for(const hero of ROSTER)for(const index of [4,5]){const g=game(hero.id,4);castEvolutionAttack(g,index);tick(g,180);assert.ok(g.enemies.some(e=>e.hp<10000),hero.id+' '+index);}});
test('late thunder strikes survive their staggered warning period',()=>{const g=game('chispin',4);castEvolutionAttack(g,5);tick(g,80);assert.ok(g.enemies.every(e=>e.hp<10000));});
test('dance fleet grows, hits distant enemies and heals only with a hit',()=>{for(let evo=0;evo<5;evo++){const g=game('stitcho',evo);summonDanceFleet(g);assert.equal(g._evolutionAttacks.drones.length,evo+1);tick(g,80);assert.ok(g.player.health>20);assert.ok(g.enemies.some(e=>e.hp<10000));}const g=game();g.enemies=[];summonDanceFleet(g);tick(g,80);assert.equal(g.player.health,20);});
test('baby companions pursue enemies and attack repeatedly in world space',()=>{for(const hero of ROSTER){const g=game();g.enemies=[{x:650,y:100,w:40,h:50,hp:10000}];assert.equal(startBattleCompanion(g,hero.id),true);tick(g,150);assert.ok(g._evolutionAttacks.guest.x>450);assert.ok(g.enemies[0].hp<9970);assert.equal(g.enemies.length,1);tick(g,210);assert.equal(g._evolutionAttacks.guest,null);}});
test('room transitions and death discard companion attacks',()=>{const g=game();startBattleCompanion(g,'kilo');summonDanceFleet(g);g.roomId='beach';tick(g,1);assert.equal(g._evolutionAttacks.guest,null);assert.equal(g._evolutionAttacks.drones.length,0);startBattleCompanion(g,'kilo');g.player.dead=true;tick(g,1);assert.equal(g._assist,null);});
test('one new attack per evolution with U unlocked from baby',()=>assert.deepEqual(POWER_LEVELS,[0,1,2,0,3,4]));
