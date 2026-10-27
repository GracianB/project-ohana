import test from 'node:test';import assert from 'node:assert/strict';
import {movePlatform} from '../systems/moving-platforms.js';
import {installKiloGrove,enterKiloGrove,groveAbility,interactGrove,updateKiloGrove} from '../systems/kilo-grove.js';
import {terrainInView} from '../worlds/terrain.js';
import {drawHulaDepth} from '../characters/hula-depth.js';
test('Moving transport carries riders on both axes and releases DOWN',()=>{
 for(const axis of ['x','y']){const p={x:10,y:72,w:20,h:28,grounded:true},g={t:30,player:p},platform={x:0,y:100,w:100,h:22},motion={axis,x:0,y:100,span:200,period:120};
 const r=movePlatform(g,platform,motion);assert.equal(r.rider,true);assert.equal(p.x,10+r.dx);assert.equal(p.y,72+r.dy);
 p._dropWasHeld=true;g.t=60;const before=[p.x,p.y];assert.equal(movePlatform(g,platform,motion).rider,false);assert.deepEqual([p.x,p.y],before);}
});
test('Kilo musical secret rewards once; every hero can use instrument',()=>{
 const room={};installKiloGrove(room);assert.equal(room.plats.length,16);
 const g={roomId:'hub',t:900,platforms:[],player:{id:'kilo',x:900,y:1080,w:20,h:28,facing:1,xp:0}};enterKiloGrove(g);
 updateKiloGrove(g);assert.deepEqual(g.kiloGrove.lifts.map(l=>l.platform.y),[894,1054]);
 assert.equal(groveAbility(g,g.player,0),true);assert.equal(g.score,300);groveAbility(g,g.player,1);assert.equal(g.score,300);
 g.player.id='cat';assert.equal(groveAbility(g,g.player,0),false);assert.equal(interactGrove(g),true);
 enterKiloGrove({...g,platforms:[]});assert.equal(g.kiloGrove.song,true);
});
test('Terrain culls both axes but retains visible hanging roots',()=>{
 const cam={x:100,y:500},view={width:800,height:600};
 assert.equal(terrainInView({x:300,y:410,w:100,h:22},cam,view),true);
 assert.equal(terrainInView({x:300,y:100,w:100,h:22},cam,view),false);
 assert.equal(terrainInView({x:1200,y:800,w:100,h:22},cam,view),false);
});
test('Ceremonial hula halves cover opposite semicircles; K flight never adds a waist ring',()=>{
 const arcs=[],ctx={save(){},restore(){},beginPath(){},stroke(){},ellipse(...a){arcs.push(a);}};
 const p={id:'kilo',_cast:{id:'hula',t:0},_kiloFlightT:200};
 drawHulaDepth(ctx,p,100,20,false);drawHulaDepth(ctx,p,100,20,true);
 assert.equal(arcs.length,0,'K uses petals below the feet, not a hoop through the body');
 p._kiloOhanaT=180;p._kiloOhanaAt=0;
 drawHulaDepth(ctx,p,100,20,false);drawHulaDepth(ctx,p,100,20,true);
 assert.deepEqual(arcs.map(a=>a.slice(5)),[[Math.PI,Math.PI*2],[0,Math.PI]]);
 p._kiloOhanaT=0;p._kiloFlightT=0;
 drawHulaDepth(ctx,p,100,96,true);assert.equal(arcs.length,2);
});
