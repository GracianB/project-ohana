// Pizza & Frita: standard size curve, opposite identities (Italian tricolore +
// elastic vs navy diner superhero), Pizza's visible arms, own in-game cinematics
// and a richer shared island "Puerto del banquete".
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PIZZA_PALETTE} from '../characters/art/pizza.js';
import {FRITA_PALETTE} from '../characters/art/frita.js';
import {heroHeightTarget,STANDARD_HERO_HEIGHT,CALIBRATED_VISUAL_H,CANVAS_ANATOMY_HEIGHT,OPTICAL_SCALE} from '../characters/visual-size.js';
import {drawEvolutionPresentation,OWN_EVOLUTION_CINE} from '../systems/evo-cine/presentation.js';
import pizzaCine,{EVO_CINE_PHASES as PIZZA_PHASES,evoCinePhase as pizzaPhase} from '../systems/evo-cine/pizza.js';
import fritaCine,{EVO_CINE_ACTS as FRITA_ACTS,evoCineAct} from '../systems/evo-cine/frita.js';
import {drawPizzaOvensBackdrop,PIZZA_PORT_PALETTE} from '../worlds/pizza-ovens.js';
import {drawFritaMarketBackdrop,FRITA_MARKET_PALETTE} from '../worlds/frita-market.js';
import {drawFamilyIslands,KITCHEN_HARBOR_PALETTE,FAMILY_ISLANDS} from '../systems/family-islands.js';

const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function hsl(hex){
 const n=parseInt(hex.slice(1,7),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255;
 const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;
 if(!d)return {h:0,s:0,l};
 const s=d/(1-Math.abs(2*l-1));let h;
 if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;
 return {h:(h*60+360)%360,s,l};
}
const isGreen=c=>{const x=hsl(c);return x.h>90&&x.h<160&&x.s>.3;};
const isNavy=c=>{const x=hsl(c);return x.h>205&&x.h<240&&x.s>.3&&x.l<.5;};
function recorder(){
 const log=[];let gradients=0;
 const grad=()=>{gradients++;return {addColorStop(){}};};
 const target={createLinearGradient:grad,createRadialGradient:grad,measureText:s=>({width:String(s).length*8})};
 return new Proxy(target,{
  get(o,k){if(k in o)return o[k];if(k==='_log')return log;if(k==='_gradients')return gradients;return (...a)=>{log.push(String(k)+'('+a.map(v=>typeof v==='number'?v.toFixed(3):typeof v).join(',')+')');};},
  set(o,k,v){log.push(String(k)+'='+(typeof v==='number'?v.toFixed(3):typeof v==='string'?v:typeof v));return true;}
 });
}

test('Sizes: Pizza and Frita follow the standard 64/82/100/120/140 curve', () => {
 assert.deepEqual([...STANDARD_HERO_HEIGHT],[64,82,100,120,140]);
 for(let f=0;f<5;f++){
  for(const id of ['pizza','frita'])assert.equal(heroHeightTarget(id,f),STANDARD_HERO_HEIGHT[f]);
  assert.ok(Math.abs(CALIBRATED_VISUAL_H.pizza[f]-100*heroHeightTarget('pizza',f)/CANVAS_ANATOMY_HEIGHT.pizza[f])<0.6);
 }
 assert.ok(!OPTICAL_SCALE?.frita,'Frita is calibrated directly, not patched with an optical scale');
 assert.match(src('systems/family-camp.js'),/heroHeightTarget\(def\.id,evo\)/);
 assert.match(src('systems/title.js'),/heroHeightTarget\(/);
});

test('Identity: green belongs only to Pizza, navy only to Frita; final forms are volcanic vs electric', () => {
 const pizza=PIZZA_PALETTE.flatMap(Object.values).filter(v=>typeof v==='string');
 const frita=FRITA_PALETTE.flatMap(Object.values).filter(v=>typeof v==='string');
 assert.ok(PIZZA_PALETTE.every(p=>isGreen(p.basil)&&isGreen(p.shoe)||p.lava),'basil + green shoes');
 assert.ok(FRITA_PALETTE.every(p=>isNavy(p.shoe)||hsl(p.shoe).h>205&&hsl(p.shoe).h<235),'navy sneakers');
 assert.ok(!frita.some(isGreen),'no green in Frita');
 assert.ok(!pizza.some(isNavy),'no navy in Pizza');
 const p5=PIZZA_PALETTE[4],f5=FRITA_PALETTE[4];
 assert.ok(hsl(p5.crust).l<.3&&p5.lava,'Pizza F5 is charred and volcanic');
 assert.ok(hsl(f5.spark).h>170&&hsl(f5.spark).h<200,'Frita F5 crackles cyan');
 assert.doesNotMatch(src('characters/art/pizza.js'),/goldHalo\(|gold\s*=\s*true/);
});

test('Pizza arms: contrasting colour, attached at the slice edge, angled out, with chef mitts', () => {
 for(const p of PIZZA_PALETTE){
  assert.ok(Math.abs(hsl(p.arm).l-hsl(p.cheese).l)>.25,'arm reads against the cheese');
  assert.ok(hsl(p.mitt).l>.75,'white mitt');
 }
 const s=src('characters/art/pizza.js');
 assert.match(s,/shX = \(W \/ 2\) \* \(1 - shV\) \+ 1/);
 assert.match(s,/armC = c\.arm/);
 assert.match(s,/hand: mitt/);
 assert.doesNotMatch(s,/armC = c\.dough/);
});

test('Cinematics: Pizza and Frita play their own 4-act cine through the in-game entry point', () => {
 assert.equal(OWN_EVOLUTION_CINE.pizza.drawEvoCine,pizzaCine.drawEvoCine);
 assert.equal(OWN_EVOLUTION_CINE.frita.drawEvoCine,fritaCine.drawEvoCine);
 assert.deepEqual(Object.keys(PIZZA_PHASES),['knead','oven','bubble','reveal']);
 assert.deepEqual(Object.keys(FRITA_ACTS),['aceite','hervor','cucurucho','alpunto']);
 assert.equal(pizzaPhase(0.2),'knead');assert.equal(evoCineAct(2.5),'cucurucho');
 for(const id of ['pizza','frita']){
  for(const t of [0.5,1.6,2.6,3.8]){
   const a=recorder(),b=recorder();
   const ra=drawEvolutionPresentation(a,960,540,id,3,t,false);
   drawEvolutionPresentation(b,960,540,id,3,t,false);
   assert.equal(ra.cinematic,id);assert.ok(ra.act);
   assert.deepEqual(a._log,b._log,'deterministic');
   assert.ok(a._log.length>300,'a rich scene is drawn');
  }
  const r1=recorder(),r2=recorder();
  drawEvolutionPresentation(r1,960,540,id,2,0.4,true);drawEvolutionPresentation(r2,960,540,id,2,3.9,true);
  assert.deepEqual(r1._log,r2._log,'reduced motion is one calm frame');
 }
 for(const f of ['pizza.js','frita.js']){
  const s=src('systems/evo-cine/'+f);
  assert.doesNotMatch(s,/Math\.random/);
  assert.doesNotMatch(s,/GOD|pika/i);
 }
});

test('Backdrops: Pizza port (tricolore dusk + volcano) vs Frita market (navy neon); cached, deterministic', () => {
 assert.ok(isGreen(PIZZA_PORT_PALETTE.basil)&&isGreen(PIZZA_PORT_PALETTE.shutter));
 assert.ok(isNavy(FRITA_MARKET_PALETTE.diner)&&hsl(FRITA_MARKET_PALETTE.skyMid).h>210);
 for(const draw of [drawPizzaOvensBackdrop,drawFritaMarketBackdrop]){
  const ctx=recorder();
  draw(ctx,{x:900,y:300},120,1280,760,false);const g1=ctx._gradients,n1=ctx._log.length;
  draw(ctx,{x:900,y:300},120,1280,760,false);
  assert.ok(g1<=1);assert.equal(ctx._gradients,g1,'second frame builds no new gradients');
  assert.deepEqual(ctx._log.slice(n1),ctx._log.slice(0,n1),'same frame twice is identical');
  const moved=recorder();draw(moved,{x:900,y:300},400,1280,760,false);
  assert.notDeepEqual(moved._log,ctx._log.slice(0,n1),'ambient animation moves over time');
  const ra=recorder(),rb=recorder();
  draw(ra,{x:900,y:300},10,1280,760,true);draw(rb,{x:900,y:300},900,1280,760,true);
  assert.deepEqual(ra._log,rb._log,'reduced motion is static');
 }
 for(const f of ['pizza-ovens.js','frita-market.js'])assert.doesNotMatch(src('worlds/'+f),/Math\.random/);
});

test('Island: Puerto del banquete has an oven, a navy diner kiosk, festoon lights and a pier', () => {
 assert.equal(FAMILY_ISLANDS.find(z=>z.id==='kitchen').name,'Puerto del banquete');
 assert.ok(isGreen(KITCHEN_HARBOR_PALETTE.basil)&&isNavy(KITCHEN_HARBOR_PALETTE.navy));
 const a=recorder(),b=recorder();drawFamilyIslands(a,0,true);drawFamilyIslands(b,9,true);
 assert.deepEqual(a._log,b._log,'static camp scenery');
 const used=new Set(a._log.filter(l=>l.startsWith('fillStyle=')).map(l=>l.slice(10)));
 for(const k of ['brick','navy','ketchup','neon','basil'])assert.ok(used.has(KITCHEN_HARBOR_PALETTE[k]),k);
 const s=src('systems/family-islands.js');
 assert.match(s,/function drawKitchenHarbor\(/);assert.doesNotMatch(s,/Math\.random/);
});
