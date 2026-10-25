import test from 'node:test';import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {enterWorld1,updateWorld1,awardSeal,world1NextObjective} from '../systems/world1-play.js';
import {STITCHO_RAIL,stitchoGrowth,stitchoRailDone} from '../systems/stitcho-chapter.js';
const make=()=>{const g={roomDef:WORLD1_ROOMS['w1-stitcho'],roomId:'w1-stitcho',world1Seals:[],player:{id:'stitcho',x:0,y:1094,w:28,h:40,xp:0,grounded:true,health:80},save(){},nums:{add(){}},fx:{emit(){}}};enterWorld1(g);return g;};
const roll=(g,x)=>{Object.assign(g.player,{x:x-14,_abilMove:'roll'});updateWorld1(g);};
test('workshop growth derives from permanent actions without repeat XP or rewards',()=>{
 const g=make();assert.equal(stitchoGrowth(g),0);
 g.world1.stations[0].done=true;assert.equal(stitchoGrowth(g),55);
 assert.match(world1NextObjective(g).label,/Raíl/);
 for(let x=2940;x<=3340;x+=10)roll(g,x);
 assert.equal(stitchoRailDone(g),true);assert.equal(g.player.xp,140);assert.equal(g.score,150);
 for(let x=2940;x<=3340;x+=10)roll(g,x);assert.equal(g.score,150);
 g.world1.stations[1].done=true;assert.equal(stitchoGrowth(g),260);
 g.world1.stations[2].done=true;assert.equal(stitchoGrowth(g),420);
 assert.equal(awardSeal(g),false,'repairs and rail cannot grant a boss victory');
 g.player.xp=900;stitchoGrowth(g);assert.equal(g.player.xp,900);
});
test('walking, discontinuous movement and interrupted rolls cannot restore the rail',()=>{
 for(const mode of ['walk','teleport','interrupt']){
  const g=make();g.world1.stations[0].done=true;
  if(mode==='walk')for(let x=2940;x<=3340;x+=10){g.player.x=x-14;updateWorld1(g);}
  if(mode==='teleport'){roll(g,2940);roll(g,3340);}
  if(mode==='interrupt'){roll(g,2940);roll(g,3060);g.player._abilMove=null;updateWorld1(g);roll(g,3340);}
  assert.equal(stitchoRailDone(g),false,mode);
 }
});
test('saved rail and repairs restore growth; legacy seals stay valid',()=>{
 const g=make();g.world1Stations={'w1-stitcho':[0,1]};g.secrets={'w1-stitcho':[STITCHO_RAIL.id]};enterWorld1(g);
 assert.equal(g.player.xp,260);assert.equal(stitchoRailDone(g),true);assert.equal(g.score,undefined);
 g.world1Seals=['stitcho'];enterWorld1(g);assert.equal(g.world1.sealed,true);
});

test('earned workshop seal restores final growth for collection revisits without score payout',()=>{const g=make();g.world1Seals=['stitcho'];enterWorld1(g);assert.equal(g.world1.sealed,true);assert.equal(g.player.xp,420);assert.equal(g.score||0,0);});
