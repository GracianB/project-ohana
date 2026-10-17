import test from 'node:test';
import assert from 'node:assert/strict';
import {useAbility,updateAbilityFx,clearAbilityFx} from '../systems/abilities.js';
import {readChispinEffects} from '../systems/chispin-duet.js';
import {ROSTER} from '../characters/roster.js';
import {chispaActing} from '../characters/art/chispa.js';
test('Storm forecasts its exact impact before damage and consumes the forecast on discharge',()=>{
 clearAbilityFx();
 const def=ROSTER.find(r=>r.id==='chispin'),form=def.forms[2];
 const p={...def,...form,evo:2,x:100,y:300,facing:1,vx:0,vy:0,health:115,maxHealth:115,xp:0,cds:{},cdDur:{}};
 const enemy={x:100,y:300,w:24,h:30,hp:1000,max:1000};
 const g={player:p,t:0,cam:{x:0,y:0},roomId:'hub',enemies:[enemy],platforms:[{x:0,y:360,w:1000,h:40}],projectiles:[],ghosts:[],slashes:[],bolts:[],fx:{emit(){}},nums:{add(){}},rng:()=>.5};
 assert.equal(useAbility(g,2),true);
 for(let i=0;i<5;i++){g.t++;updateAbilityFx(g);}
 const forecast=g.chispinAbilityFx.find(f=>f.kind==='storm').forecast;
 assert.ok(forecast);assert.equal(enemy.hp,1000);
 for(let i=0;i<6;i++){g.t++;updateAbilityFx(g);assert.equal(enemy.hp,1000);}
 g.t++;updateAbilityFx(g);
 const storm=g.chispinAbilityFx.find(f=>f.kind==='storm');
 assert.equal(storm.bolts[0].x,forecast.x);assert.equal(storm.bolts[0].y2,forecast.y2);
 assert.ok(enemy.hp<1000);assert.equal(storm.forecast,undefined);clearAbilityFx();
});
test('Storm forecast replicas discard combat fields and reject non-finite positions',()=>{
 const f={kind:'storm',x:10,y:20,life:100,bolts:[],forecast:{x:30,y1:40,y2:200,dmg:999}};
 assert.deepEqual(readChispinEffects([f])[0].forecast,{x:30,y1:40,y2:200});
 assert.equal(readChispinEffects([{...f,forecast:{x:Infinity,y1:40,y2:200}}]),null);
});
test('Reduced-motion acting keeps ears and tail still while preserving cast expression',()=>{
 const a=chispaActing({state:'cast',castSlot:2,t:100,reduceMotion:true});
 assert.equal(a.charge,true);assert.equal(a.ears,0);assert.equal(a.tail,0);assert.equal(a.step,0);
});
