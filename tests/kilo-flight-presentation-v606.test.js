import test from 'node:test';
import assert from 'node:assert/strict';
import {drawHulaDepth,drawKiloFlightTrail} from '../characters/hula-depth.js';
globalThis.window=globalThis;globalThis.addEventListener ||= ()=>{};
const {useAbility,updateAbilityFx,drawAbilityFx,clearAbilityFx}=await import('../systems/abilities.js');
function canvas(){
 const events=[],state={depth:0,globalAlpha:1};
 const ctx=new Proxy(state,{get(o,k){
  if(k==='save')return()=>{o.depth++;events.push(['save']);};
  if(k==='restore')return()=>{o.depth--;events.push(['restore']);};
  if(k in o)return o[k];
  if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop(){}});
  return(...a)=>{assert.ok(a.every(v=>typeof v!=='number'||Number.isFinite(v)),k+' finite geometry');events.push([k,...a]);};
 },set(o,k,v){o[k]=v;return true;}});
 return {ctx,events,verify(){assert.equal(state.depth,0,'balanced Canvas state');}};
}
test('flight has only a foot trail; ceremonial hoops use an independent clock across J casts',()=>{
 const p={id:'kilo',evo:4,_kiloFlightT:360,_kiloFlightMode:'solar',_kiloFlightAt:0,_cast:{id:'hula',t:0},vx:4};
 const a=canvas();drawHulaDepth(a.ctx,p,140,50,false);drawHulaDepth(a.ctx,p,140,50,true);
 assert.equal(a.events.length,0,'flight alone does not draw a body hoop');
 drawKiloFlightTrail(a.ctx,p,140,50);a.verify();
 const petals=a.events.filter(e=>e[0]==='ellipse');assert.equal(petals.length,8);assert.ok(petals.every(e=>e[2]>0&&e[3]<6),'all flight petals remain below the feet');
 p._kiloOhanaT=240;p._kiloOhanaAt=20;
 const before=canvas();drawHulaDepth(before.ctx,p,140,80,true);before.verify();
 p._cast={id:'ukulele',t:79};const after=canvas();drawHulaDepth(after.ctx,p,140,80,true);after.verify();
 assert.deepEqual(after.events,before.events,'a J cast cannot reset the ceremonial hoop');
 for(const reduced of [false,true])for(let evo=0;evo<5;evo++){
  const c=canvas();drawKiloFlightTrail(c.ctx,{...p,evo},80+evo*15,110,reduced);c.verify();
 }
});
test('hula range is marked outside Kilo by petals, without a filled disk or circumference',()=>{
 clearAbilityFx();const p={id:'kilo',evo:4,x:100,y:200,w:36,h:68,facing:1,health:100,maxHealth:100,abilities:['ukulele','hula','ohana'],cds:{},cdDur:{}};
 const g={player:p,t:0,roomId:'w1-kilo',cam:{x:0,y:0},enemies:[],projectiles:[],ghosts:[],platforms:[],nums:{add(){}},fx:{emit(){}},worldW:14400,worldH:1260};
 assert.equal(useAbility(g,1),true);for(let i=0;i<40;i++){g.t++;updateAbilityFx(g);}
 const field=g.kiloAbilityFx.find(f=>f.kind==='hula'),c=canvas();drawAbilityFx(c.ctx,g,g.t);c.verify();
 assert.equal(c.events.filter(e=>e[0]==='arc').length,0,'no circle signature remains over the torso');
 const petals=c.events.filter(e=>e[0]==='ellipse');assert.equal(petals.length,6);assert.ok(petals.every(e=>e[3]===5&&e[4]===2.5));
 const placements=c.events.filter(e=>e[0]==='translate');assert.equal(placements.length,6);
 for(const [,x,y] of placements){assert.ok(Math.abs(x-(p.x+p.w/2))>field.r*.8,'clear of the costume');assert.ok(Math.abs(Math.hypot(x-(p.x+p.w/2),y-(p.y+p.h/2))-field.r)<.001,'matches the physical field radius');}
 clearAbilityFx();
});
