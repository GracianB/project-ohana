import test from 'node:test';import assert from 'node:assert/strict';
import {beginHeroPower,rhythmPress,updateHeroPowers,drawHeroPowers} from '../systems/hero-combos.js';
function fixture(){const player={id:'kilo',evo:4,x:0,y:0,w:24,h:40,facing:1};const s={moves:[],fields:[],shots:[],drones:[],beams:[]};return {player,enemies:[{x:150,y:0,w:24,h:40,hp:1000}],_evolutionAttacks:s,nums:{add(){}}};}
test('Kilo finisher accepts each of three rhythm windows once and rejects mistimed input',()=>{
 const g=fixture(),s=g._evolutionAttacks,m=beginHeroPower(g,5,s);assert.equal(rhythmPress(g),true);assert.equal(m.bonus,0);
 for(const beat of [30,60,90]){m.age=beat;assert.equal(rhythmPress(g),true);assert.equal(rhythmPress(g),true);assert.equal(m.beats.size,beat/30);}
 assert.equal(m.bonus,3);m.age=115;rhythmPress(g);assert.equal(m.bonus,3);
});
test('P has exactly three damaging pulses, matching visual reach, with impact trails only on real hits',()=>{
 const g=fixture(),s=g._evolutionAttacks,m=beginHeroPower(g,5,s),hits=[];
 for(let tick=1;tick<=120;tick++){if([30,60,90].includes(tick)){m.age=tick-1;rhythmPress(g);}updateHeroPowers(g,s,(_g,e,dmg)=>{hits.push({tick,dmg});return true;},()=> '#ffd36a');if([39,69,99].includes(tick)){assert.equal(m.pulseAge,tick);assert.equal(m.pulseRadius,210+m.bonus*45);assert.equal(m.impacts.length,1);}}
 assert.deepEqual(hits.map(h=>h.tick),[39,69,99]);assert.equal(s.moves.length,0);assert.equal(g.player._finisherActive,false);assert.equal(s.fields.length,3);assert.ok(s.fields.every(f=>f.noCharge));
 const blocked=fixture(),b=beginHeroPower(blocked,5,blocked._evolutionAttacks);for(let i=0;i<39;i++)updateHeroPowers(blocked,blocked._evolutionAttacks,()=>false,()=> '#fff');assert.equal(b.impacts.length,0);
});
test('Kilo rhythm markers render without nonfinite coordinates in every beat and viewport offset',()=>{
 const g=fixture(),m=beginHeroPower(g,5,g._evolutionAttacks),calls=[];
 const ctx=new Proxy({}, {get:(_o,key)=> key==='canvas'?{width:390,height:844}:(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n));calls.push(key);},set:()=>true});
 for(const age of [0,22,30,36,60,66,90,96,119]){m.age=age;drawHeroPowers(ctx,g,{x:10,y:20});}assert.ok(calls.includes('fillText'));
});

test('The late edge of the rhythm window increases that same beat, before damage resolves',()=>{
 const g=fixture(),s=g._evolutionAttacks,m=beginHeroPower(g,5,s),damage=[];
 for(let i=0;i<38;i++)updateHeroPowers(g,s,(_g,_e,d)=>{damage.push(d);return true;},()=> '#fff');
 assert.equal(damage.length,0);rhythmPress(g);assert.equal(m.bonus,1);
 updateHeroPowers(g,s,(_g,_e,d)=>{damage.push(d);return true;},()=> '#fff');assert.deepEqual(damage,[48]);assert.equal(m.pulseRadius,255);
});
