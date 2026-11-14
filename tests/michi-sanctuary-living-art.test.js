import test from 'node:test';
import assert from 'node:assert/strict';
import {drawMichiLivingBackdrop} from '../worlds/michi-living-backdrop.js';
import {drawMichiSanctuaryBackdrop,drawMichiSanctuary,drawSanctuaryLantern} from '../worlds/michi-sanctuary-art.js';

const ZONES=['court','crypt','gallery','maze','canopy','arena','return'];
function fakeGame(index=0,reduceMotion=false,lit=0){
 const zones=ZONES.map((id,i)=>({id,name:id,x:i*600,y:0,w:600,h:800,floor:620}));
 return {
  roomDef:{hero:'cat',michiSanctuary:{zones,passages:[],memories:[]},expedition:{nodes:[]}},
  player:{x:index*600+150,y:300,w:34,h:50},cam:{x:index*600,y:0},
  reduceMotion,viewW:1280,viewH:720,platforms:[],
  world1:{sealed:false,stations:Array.from({length:5},(_,i)=>({done:i<lit,x:4000,y:600,name:'Farol '+i}))}
 };
}
function recorder(){
 const operations=[];let depth=0;
 const ctx={fillStyle:'',strokeStyle:'',lineWidth:1,globalAlpha:1,font:'',textAlign:''};
 const commands=['beginPath','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','closePath',
  'fill','stroke','arc','ellipse','fillRect','fillText','translate','scale','setTransform'];
 for(const cmd of commands)ctx[cmd]=(...args)=>operations.push([cmd,...args]);
 ctx.save=()=>{depth++;operations.push(['save']);};
 ctx.restore=()=>{depth--;assert.ok(depth>=0,'restore must balance save');operations.push(['restore']);};
 ctx.createLinearGradient=(...args)=>{const stops=[];operations.push(['linear',...args,stops]);return {addColorStop:(at,color)=>stops.push([at,color])};};
 ctx.createRadialGradient=(...args)=>{const stops=[];operations.push(['radial',...args,stops]);return {addColorStop:(at,color)=>stops.push([at,color])};};
 return {ctx,operations,depth:()=>depth};
}
test('Michi paints seven distinct scenes at desktop and mobile with a bounded draw budget',()=>{
 const fingerprints=[];
 for(let i=0;i<ZONES.length;i++)for(const [w,h] of [[1280,720],[390,844]]){
  const {ctx,operations,depth}=recorder(),g=fakeGame(i);
  assert.equal(drawMichiLivingBackdrop(ctx,g,g.cam,60,w,h),true);
  assert.equal(depth(),0);
  assert.ok(operations.length>65, ZONES[i]+' should have intentional scenery');
  assert.ok(operations.length<1100,ZONES[i]+' draw budget: '+operations.length);
  const gradients=operations.filter(e=>e[0]==='linear');
  assert.ok(gradients.length>0,'sky must have a palette');
  if(w===1280)fingerprints.push(gradients[0].at(-1).map(stop=>stop[1]).join('/'));
 }
 assert.equal(new Set(fingerprints).size,ZONES.length,'zones have independent authored lighting');
});
test('reduced-motion scenes are stable and animation is deterministic',()=>{
 const g=fakeGame(4,true,4);
 const a=recorder(),b=recorder();
 drawMichiSanctuaryBackdrop(a.ctx,g,g.cam,0,1280,720);
 drawMichiSanctuaryBackdrop(b.ctx,g,g.cam,313,1280,720);
 assert.deepEqual(a.operations,b.operations);
 const animated=fakeGame(4,false,4),c=recorder(),d=recorder();
 drawMichiSanctuaryBackdrop(c.ctx,animated,animated.cam,0,1280,720);
 drawMichiSanctuaryBackdrop(d.ctx,animated,animated.cam,313,1280,720);
 assert.notDeepEqual(c.operations,d.operations);
});
test('art is purely cosmetic and never changes navigation, stations or player state',()=>{
 const g=fakeGame(0,false,3);
 const before=structuredClone(g),{ctx,depth}=recorder();
 assert.equal(drawMichiSanctuaryBackdrop(ctx,g,g.cam,100,390,844),true);
 drawMichiSanctuary(ctx,g,g.cam,100);
 drawSanctuaryLantern(ctx,120,140,true,100);
 assert.equal(depth(),0);
 assert.deepEqual(g,before);
 assert.equal(drawMichiLivingBackdrop(ctx,{roomDef:{}},{x:0,y:0},0,1280,720),false);
});
test('vertical and horizontal camera travel never creates NaN geometry',()=>{
 for(const [x,y] of [[0,0],[3200,560],[7000,1250],[14200,1600]]){
  const g=fakeGame(2),c=recorder();
  assert.equal(drawMichiSanctuaryBackdrop(c.ctx,g,{x,y},40,390,844),true);
  for(const op of c.operations)for(const arg of op.slice(1))
   if(typeof arg==='number')assert.ok(Number.isFinite(arg),'bad canvas geometry: '+op[0]);
 }
});

test('earned farols illuminate their actual position without adding invisible offscreen work',()=>{
 const g=fakeGame(0,true,0),dark=recorder(),light=recorder(),offscreen=recorder();
 g.world1.stations[0].x=470;g.world1.stations[0].y=450;
 drawMichiLivingBackdrop(dark.ctx,g,g.cam,20,1280,720);
 g.world1.stations[0].done=true;
 drawMichiLivingBackdrop(light.ctx,g,g.cam,20,1280,720);
 const radials=x=>x.operations.filter(op=>op[0]==='radial').length;
 assert.equal(radials(light),radials(dark)+1,'a real farol should cast a localized radial glow');
 g.world1.stations[0].x=7000;
 drawMichiLivingBackdrop(offscreen.ctx,g,g.cam,20,1280,720);
 assert.equal(radials(offscreen),radials(dark),'offscreen farols are culled');
 assert.equal(light.depth(),0);
});
