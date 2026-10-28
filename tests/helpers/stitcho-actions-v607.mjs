// Rule-test fixtures for accepted Stitcho actions. Positions and active-roll
// state are explicit fixtures; physical traversal is covered by browser pilots.
import {updateWorld1} from '../../systems/world1-play.js';
import {STITCHO_RAIL,stitchoModuleAbility,stitchoModuleContact} from '../../systems/stitcho-chapter.js';

export function standStitcho(g,x,y=1134,{air=false}={}){
 const p=g.player;p.x=x-p.w/2;p.y=y-p.h;p.vx=p.vy=0;p.grounded=!air;
}
export function releaseStitchoModule(g,s){
 standStitcho(g,s.x,s.y,{air:s.releaseKind==='air'});
 if(s.releaseKind==='roll'){
  g.player._abilMove='roll';stitchoModuleContact(g);g.player._abilMove=null;
 }else{
  g.player._cast={slot:0,id:'plasma',t:g.world1.tick};stitchoModuleAbility(g,g.player,0);
 }
 return s.released;
}
export function pickStitchoModule(g,s){
 releaseStitchoModule(g,s);updateWorld1(g);return g.world1.carry;
}
export function deliverStitchoModule(g,s){
 standStitcho(g,s.target.x,s.target.y);updateWorld1(g);return s.done;
}
export function rollStitchoRail(g){
 for(let x=STITCHO_RAIL.left-60;x<=STITCHO_RAIL.right+20;x+=10){
  standStitcho(g,x,STITCHO_RAIL.y);g.player._abilMove='roll';updateWorld1(g);
 }
 g.player._abilMove=null;
}
