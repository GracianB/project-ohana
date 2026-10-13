import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pizzaWelcomeBeat,PIZZA_WELCOME_BEATS,drawPizzaWelcomeFX} from '../systems/intro-pizza-stage.js';
import {poseFingerprint} from '../characters/draw.js';
import {WELCOME_CAST_ORDER,welcomeCastSpot,welcomeActorFit} from '../systems/intro-cast-fit.js';
import {pizzaOvenActing} from '../characters/art/pizza.js';

test('V347 Pizza gives five independent chase beats on the existing 14s intro clock',()=>{
 const frames=[[.7,'idle'],[4.58,'sniff'],[5.18,'spring'],
  [5.8,'stretch'],[6.3,'catch'],[6.78,'flourish'],[8.2,'idle']];
 for(const [at,phase] of frames){
   const b=pizzaWelcomeBeat(at);
   assert.equal(b.phase,phase,'Pizza at '+at);
   assert.deepEqual(pizzaWelcomeBeat(at+14),b,'seamless artistic loop');
   for(const key of ['sniff','spring','stretch','catch','flourish','breath','cheese','glow'])
     assert.ok(b[key]>=0&&b[key]<=1,key+' bounds');
   assert.ok(b.crust>=-1&&b.crust<=1);
 }
 assert.equal(Object.keys(PIZZA_WELCOME_BEATS).length,5);
 for(const points of Object.values(PIZZA_WELCOME_BEATS))
   assert.ok(points.length===4&&points.every(Number.isFinite)&&
     points.every((v,i)=>i===0||v>points[i-1]));
 assert.ok(pizzaWelcomeBeat(5.8).stretch>.95);
 assert.ok(pizzaWelcomeBeat(6.3).catch>.95);
});

test('V347 Pizza reduces motion without hiding the original slice',()=>{
 for(const time of [0,4.58,5.18,5.8,6.3,6.78,14,NaN,Infinity]){
  const b=pizzaWelcomeBeat(time,true);
  assert.equal(b.phase,'idle');
  assert.equal(b.sniff,0);assert.equal(b.spring,0);assert.equal(b.stretch,0);
  assert.equal(b.catch,0);assert.equal(b.cheese,0);
  assert.equal(b.flourish,.2);assert.equal(b.reduced,true);
 }
});

test('V347 drawn stage cheese, toppings and spring are local, finite and Canvas-balanced',()=>{
 const calls=[],gradient={addColorStop(...args){calls.push(['stop',...args]);}};
 const ctx=new Proxy({},{
  get(obj,key){
    if(key in obj)return obj[key];
    if(key==='createRadialGradient')return (...args)=>{calls.push(['gradient',...args]);return gradient;};
    return (...args)=>{calls.push([key,...args]);};
  },set(obj,key,value){obj[key]=value;return true;}
 });
 for(const [time,layer,shape] of [
   [4.58,'front','arc'],[5.18,'front','quadraticCurveTo'],
   [5.8,'front','quadraticCurveTo'],[6.3,'front','ellipse'],
   [6.78,'front','lineTo'],[5.8,'back','gradient']
 ]){
  const before=calls.length;
  drawPizzaWelcomeFX(ctx,250,420,100,time,pizzaWelcomeBeat(time),layer);
  const drawn=calls.slice(before);
  assert.equal(drawn[0]?.[0],'save');
  assert.equal(drawn.at(-1)?.[0],'restore');
  assert.ok(drawn.some(c=>c[0]===shape),'shape '+shape+' '+time);
  assert.ok(drawn.flat().filter(v=>typeof v==='number').every(Number.isFinite));
  const points=drawn.filter(c=>c[0]==='ellipse').flat().filter(v=>typeof v==='number');
  assert.ok(points.every(p=>Math.abs(p)<900),'stage particles must stay local');
 }
 const before=calls.length;
 drawPizzaWelcomeFX(ctx,250,420,100,5.8,pizzaWelcomeBeat(5.8,true),'front');
 assert.deepEqual(calls.slice(before).map(x=>x[0]),['save','restore']);
});

test('V347 Pizza stages invalidate the original painter cache without global changes',()=>{
 const base={state:'jump',form:0,pizzaWelcome:pizzaWelcomeBeat(4.58)};
 const key=poseFingerprint(base);
 for(const t of [5.18,5.8,6.3,6.78])
   assert.notEqual(key,poseFingerprint({...base,pizzaWelcome:pizzaWelcomeBeat(t)}));
 assert.notEqual(key,poseFingerprint({...base,pizzaWelcome:null}));
 assert.equal(key,poseFingerprint(base));
});

test('V347 preserves five forms, oven casts, and all earlier introduction stars',()=>{
 assert.equal(WELCOME_CAST_ORDER.filter(x=>x==='pizza').length,1);
 for(const width of [360,759,760,1280,1654]){
   const spot=welcomeCastSpot('pizza',width,720,100);
   const fit=welcomeActorFit({width:88,height:111,centerOffsetX:3},102,spot.slotWidth);
   assert.ok(fit.paintedWidth<=spot.slotWidth*.88+1e-6);
   assert.ok(fit.paintedHeight<=102+1e-6);
 }
 for(const slot of [2,3]){
   const p=pizzaOvenActing({state:'cast',castSlot:slot,cast:.43});
   assert.ok(p&&p.burst>.1&&p.squash>0&&p.cheese>0);
 }
 const art=readFileSync(new URL('../characters/art/pizza.js',import.meta.url),'utf8');
 const intro=readFileSync(new URL('../systems/intro.js',import.meta.url),'utf8');
 const draw=readFileSync(new URL('../characters/draw.js',import.meta.url),'utf8');
 assert.match(art,/const welcome=pose\.pizzaWelcome/);
 assert.match(art,/function slicePath\(/);
 assert.match(art,/function cheeseString\(/);
 assert.match(art,/function faceDraw\(/);
 assert.match(art,/const FORM = \[/);
 assert.match(art,/pizzaOvenActing/);
 assert.match(intro,/pizzaWelcomeBeat\(loop,reduce\)/);
 assert.match(intro,/pizzaWelcome:pizzaBeat/);
 assert.match(intro,/drawPizzaWelcomeFX\(ctx,pizzaX,pizzaY,pizzaHeight,t,pizzaBeat,"front"\)/);
 assert.match(intro,/fritaWelcome:fritaBeat/);
 assert.match(intro,/dragonWelcome:dragonBeat/);
 assert.match(intro,/dinoWelcome:dinoBeat/);
 assert.match(draw,/pose\.pizzaWelcome=p\._introPizza/);
 assert.match(draw,/pose\.pizzaWelcome\?\.stretch/);
 assert.doesNotMatch(art,/FULL_CONTENT_PLACEHOLDER|PLACEHOLDER_WILL_BE_REPLACED/);
});
