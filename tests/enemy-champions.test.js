import test from 'node:test';
import assert from 'node:assert/strict';
import {updateChampions} from '../systems/enemy-champions.js';
const enemy=(extra={})=>({x:160,y:200,w:40,h:40,hp:40,max:100,elite:true,...extra});
const game=e=>({player:{x:300,y:200,w:30,h:40},enemies:[e],projectiles:[],nums:{add(){}},fx:{emit(){}}});
const tick=(g,n)=>{for(let i=0;i<n;i++)updateChampions(g);};
test('elite counterattack warns for 48 ticks, locks aim and fires only once',()=>{
 const e=enemy(),g=game(e);tick(g,1);const angle=e._champion.angle;g.player.y=700;tick(g,47);assert.equal(g.projectiles.length,0);
 tick(g,1);assert.equal(g.projectiles.length,2);assert.equal(e._champion.angle,angle);
 for(const shot of g.projectiles){assert.equal(shot.owner,'enemy');assert.ok(shot.vx>0);assert.ok(shot.life<=100);}
 tick(g,300);assert.equal(g.projectiles.length,2);
});
test('a hit reaction can interrupt the warning and suppress the counterattack',()=>{
 const e=enemy(),g=game(e);tick(g,1);e.stun=12;tick(g,60);assert.equal(e._champion.phase,'broken');assert.equal(g.projectiles.length,0);
});
test('bosses, ordinary, healthy, offscreen and sleeping foes do not charge',()=>{
 for(const extra of [{boss:true},{elite:false},{hp:80},{x:1400},{sleep:30}]){const e=enemy(extra),g=game(e);tick(g,60);assert.equal(g.projectiles.length,0);assert.equal(e._champion,undefined);}
});
test('dead players and the global projectile budget cannot produce extra attacks',()=>{
 const e=enemy(),g=game(e);g.player.dead=true;tick(g,60);assert.equal(e._champion,undefined);g.player.dead=false;
 g.projectiles=Array.from({length:128},()=>({owner:'enemy'}));tick(g,60);assert.equal(g.projectiles.length,128);
});
