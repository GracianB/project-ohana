import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fritaWelcomeBeat,FRITA_WELCOME_BEATS,drawFritaWelcomeFX} from '../systems/intro-frita-stage.js';
import {poseFingerprint} from '../characters/draw.js';
import {WELCOME_CAST_ORDER,welcomeCastSpot,welcomeActorFit} from '../systems/intro-cast-fit.js';
import {fritaCookingActing,fritaFootwork} from '../characters/art/frita.js';

test('V346 Frita has five distinct chef beats repeating in a 14-second welcome',()=>{
 const samples=[[.7,'idle'],[4.55,'ready'],[5.16,'dash'],
   [5.77,'reach'],[6.23,'wobble'],[6.75,'triumph'],[7.8,'idle']];
 for(const [time,phase] of samples){
  const beat=fritaWelcomeBeat(time);
  assert.equal(beat.phase,phase,'acting at '+time);
  assert.deepEqual(fritaWelcomeBeat(time+14),beat,'loop is deterministic');
  for(const key of ['ready','dash','reach','wobble','triumph','breath','cape','glow'])
   assert.ok(beat[key]>=0&&beat[key]<=1,key+' is bounded');
 }
 assert.equal(Object.keys(FRITA_WELCOME_BEATS).length,5);
 for(const points of Object.values(FRITA_WELCOME_BEATS))
  assert.ok(points.length===4&&points.every(Number.isFinite)&&
   points.every((v,i)=>i===0||v>points[i-1]));
 assert.ok(fritaWelcomeBeat(5.77).reach>.9);
 assert.ok(fritaWelcomeBeat(6.75).triumph>.9);
});

test('V346 reduced motion keeps Frita present without running particles',()=>{
 for(const time of [0,4.55,5.16,5.77,6.23,6.75,14,NaN,Infinity]){
   const b=fritaWelcomeBeat(time,true);
   assert.equal(b.phase,'idle');
   assert.equal(b.ready,0);assert.equal(b.dash,0);
   assert.equal(b.reach,0);assert.equal(b.wobble,0);
   assert.equal(b.triumph,.2);assert.equal(b.cape,0);
   assert.equal(b.reduced,true);
 }
});

test('V346 local Frita FX stays inside theatrical Canvas without accidental damage',()=>{
 const calls=[],gradient={addColorStop(...args){calls.push(['stop',...args]);}};
 const ctx=new Proxy({},{
  get(obj,key){
   if(key in obj)return obj[key];
   if(key==='createRadialGradient')return (...args)=>{calls.push(['gradient',...args]);return gradient;};
   return (...args)=>{calls.push([key,...args]);};
  },set(obj,key,value){obj[key]=value;return true;}
 });
 for(const [time,layer,shape] of [
  [4.55,'front','arc'],[5.16,'front','lineTo'],
  [5.77,'front','ellipse'],[6.23,'front','ellipse'],
  [6.75,'front','lineTo'],[5.77,'back','gradient']
 ]){
  const before=calls.length;
  drawFritaWelcomeFX(ctx,320,460,100,time,fritaWelcomeBeat(time),layer);
  const subset=calls.slice(before);
  assert.equal(subset[0]?.[0],'save');
  assert.equal(subset.at(-1)?.[0],'restore');
  assert.ok(subset.some(c=>c[0]===shape),'expected '+shape+' at '+time);
  assert.ok(subset.flat().filter(x=>typeof x==='number').every(Number.isFinite));
  const points=subset.filter(c=>c[0]==='ellipse').flat().filter(x=>typeof x==='number');
  assert.ok(points.every(x=>Math.abs(x)<1000),'particles must remain on this stage');
 }
 const from=calls.length;
 drawFritaWelcomeFX(ctx,320,460,100,5.77,fritaWelcomeBeat(5.77,true),'front');
 assert.deepEqual(calls.slice(from).map(c=>c[0]),['save','restore']);
});

test('V346 Frita does not freeze during each stage-only pose',()=>{
 const base={state:'run',form:0,fritaWelcome:fritaWelcomeBeat(4.55)};
 const a=poseFingerprint(base);
 for(const time of [5.16,5.77,6.23,6.75])
  assert.notEqual(a,poseFingerprint({...base,fritaWelcome:fritaWelcomeBeat(time)}));
 assert.notEqual(a,poseFingerprint({...base,fritaWelcome:null}));
 assert.equal(a,poseFingerprint(base));
});

test('V346 Frita original 5 forms and abilities survive individual intro direction',()=>{
 assert.equal(WELCOME_CAST_ORDER.filter(x=>x==='frita').length,1);
 for(const width of [360,759,760,1280,1654]){
  const slot=welcomeCastSpot('frita',width,720,96);
  const fit=welcomeActorFit({width:57,height:100,centerOffsetX:4},96*1.06,slot.slotWidth);
  assert.ok(fit.paintedWidth<=slot.slotWidth*.88+1e-6);
  assert.ok(fit.paintedHeight<=96*1.06+1e-6);
 }
 const art=readFileSync(new URL('../characters/art/frita.js',import.meta.url),'utf8');
 const intro=readFileSync(new URL('../systems/intro.js',import.meta.url),'utf8');
 const draw=readFileSync(new URL('../characters/draw.js',import.meta.url),'utf8');
 assert.match(art,/const welcome=pose\.fritaWelcome/);
 assert.match(art,/P\.capeFlow\+=cape\*11/);
 assert.match(art,/P\.item="ketchup";P\.squeeze=reach/);
 assert.match(art,/function fryBody\(/);
 assert.match(art,/function face\(/);
 assert.match(art,/const FORM = \[/);
 assert.match(intro,/fritaWelcomeBeat\(loop,reduce\)/);
 assert.match(intro,/fritaWelcome:fritaBeat/);
 assert.match(intro,/drawFritaWelcomeFX\(ctx,fritaX,fritaY,fritaHeight,t,fritaBeat,"front"\)/);
 assert.match(intro,/dragonWelcome:dragonBeat/);
 assert.match(intro,/dinoWelcome:dinoBeat/);
 assert.match(draw,/pose\.fritaWelcome=p\._introFrita/);
 assert.match(draw,/pose\.fritaWelcome\?\.reach/);
 assert.equal(typeof fritaFootwork,'function');
 for(const slot of [0,1,2,3]){
  const a=fritaCookingActing({state:'cast',castSlot:slot,cast:.4});
  assert.ok(a&&a.serve>0,'real ability cast still works');
 }
 assert.doesNotMatch(art,/FULL_CONTENT_PLACEHOLDER|PLACEHOLDER_WILL_BE_REPLACED/);
});
