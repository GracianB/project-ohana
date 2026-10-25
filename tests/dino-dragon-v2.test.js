// Dino & Dragón: unified sizes + strong differentiation + real in-game cinematics.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DINO_PALETTE} from '../characters/art/dino.js';
import {DRAGON_PALETTE,DRAGON_FORM_SPEC} from '../characters/art/dragon.js';
import {heroHeightTarget,DINO_DRAGON_HEIGHT,DRAGON_WING_ALLOWANCE,CALIBRATED_VISUAL_H,CANVAS_ANATOMY_HEIGHT} from '../characters/visual-size.js';
import {drawEvolutionPresentation,OWN_EVOLUTION_CINE} from '../systems/evo-cine/presentation.js';
import {drawDinoCraterBackdrop,DINO_VALLEY_PALETTE} from '../worlds/dino-crater.js';
import {drawDragonCalderaBackdrop,DRAGON_CALDERA_PALETTE} from '../worlds/dragon-caldera.js';

function hsl(hex){
 const n=parseInt(hex.slice(1,7),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255;
 const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;
 if(!d)return {h:0,s:0,l};
 const s=d/(1-Math.abs(2*l-1));let h;
 if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;
 return {h:(h*60+360)%360,s,l};
}
function recorder(){
 const log=[];let gradients=0;
 const grad=()=>{gradients++;return {addColorStop(){}};};
 const target={createLinearGradient:grad,createRadialGradient:grad,measureText:s=>({width:String(s).length*8})};
 const ctx=new Proxy(target,{
  get(o,k){if(k in o)return o[k];if(k==='_log')return log;if(k==='_gradients')return gradients;return (...a)=>{log.push(String(k)+'('+a.map(v=>typeof v==='number'?v.toFixed(3):typeof v).join(',')+')');};},
  set(o,k,v){log.push(String(k)+'='+(typeof v==='number'?v.toFixed(3):typeof v==='string'?v:typeof v));return true;}
 });
 return ctx;
}

test('Sizes: Dino and Dragón share one growth curve, bigger every form; Dragón only adds wing room', () => {
 assert.deepEqual([...DINO_DRAGON_HEIGHT],[64,82,100,120,140]);
 for(let f=0;f<5;f++){
  assert.equal(heroHeightTarget('dino',f),DINO_DRAGON_HEIGHT[f]);
  assert.equal(heroHeightTarget('dragon',f),Math.round(DINO_DRAGON_HEIGHT[f]*DRAGON_WING_ALLOWANCE));
  if(f)assert.ok(DINO_DRAGON_HEIGHT[f]-DINO_DRAGON_HEIGHT[f-1]>=18,'each evolution must read clearly bigger');
  for(const id of ['dino','dragon'])assert.ok(Math.abs(CALIBRATED_VISUAL_H[id][f]-100*heroHeightTarget(id,f)/CANVAS_ANATOMY_HEIGHT[id][f])<0.6);
 }
 assert.ok(DRAGON_WING_ALLOWANCE>1&&DRAGON_WING_ALLOWANCE<=1.35);
});

test('Palettes: Dino is earth (green/teal, no orange body), Dragón is fire (crimson, no green)', () => {
 for(const [f,c] of DINO_PALETTE.entries()){
  for(const k of ['body','spot']){const {h}=hsl(c[k]);assert.ok(h>=80&&h<=185,`Dino F${f} ${k} ${c[k]} must be green/teal (hue ${h|0})`);}
 }
 for(const [f,c] of DRAGON_PALETTE.entries()){
  for(const v of Object.values(c)){const {h,s}=hsl(v);assert.ok(!(s>.25&&h>=75&&h<=190),`Dragón F${f} ${v} must not be green/teal`);}
  if(f<4){const {h}=hsl(c.body);assert.ok(h<=12||h>=330,`Dragón F${f} body ${c.body} must be crimson/garnet`);}
  const mem=hsl(c.mem);if(f<4)assert.ok(mem.l<.4,'adult membranes are dark plum, not body-coloured');
 }
 // final forms no longer both yellow
 const dF=hsl(DINO_PALETTE[4].body),gF=hsl(DRAGON_PALETTE[4].body);
 assert.ok(dF.h>=120&&dF.l<.5,'Dino Coloso is deep jade');
 assert.ok(gF.l>.85,'Dragón Celestial is pearl, not a second yellow');
});

test('Silhouettes: Dragón grows an S-neck, wings and hover; baby keeps no eggshell', () => {
 const src=readFileSync(new URL('../characters/art/dragon.js',import.meta.url),'utf8');
 for(let f=1;f<5;f++){
  assert.ok(DRAGON_FORM_SPEC[f].neck>DRAGON_FORM_SPEC[f-1].neck);
  assert.ok(DRAGON_FORM_SPEC[f].wing>DRAGON_FORM_SPEC[f-1].wing);
 }
 assert.ok(DRAGON_FORM_SPEC[4].hover>=10);
 assert.match(src,/function drawDragonNeck\(/);
 assert.doesNotMatch(src,/eggshell|cascar[oó]n/i);
 const dino=readFileSync(new URL('../characters/art/dino.js',import.meta.url),'utf8');
 assert.match(dino,/idleStomp/,'Dino owns a grounded stomp-step idle');
});

test('Cinematics: Dino and Dragón route their own 4-act cine through the in-game entry point', () => {
 for(const id of ['dino','dragon'])assert.ok(OWN_EVOLUTION_CINE[id],id);
 for(const id of ['dino','dragon']){
  const a=recorder(),b=recorder();
  const ra=drawEvolutionPresentation(a,960,540,id,3,2.2,false);
  drawEvolutionPresentation(b,960,540,id,3,2.2,false);
  assert.equal(ra.cinematic,id);assert.equal(typeof ra.message,'string');assert.ok(ra.act);
  assert.deepEqual(a._log,b._log,'deterministic');
  assert.ok(a._log.length>400,'a rich scene is drawn');
  const direct=recorder();OWN_EVOLUTION_CINE[id].drawEvoCine(direct,960,540,2.2,3,4,{reducedMotion:false});
  assert.deepEqual(a._log.slice(2,2+direct._log.length),direct._log,'the stage draws the character module itself');
  const r1=recorder(),r2=recorder();
  drawEvolutionPresentation(r1,960,540,id,2,0.4,true);drawEvolutionPresentation(r2,960,540,id,2,3.9,true);
  assert.deepEqual(r1._log,r2._log,'reduced motion is one calm frame');
 }
 const stage=readFileSync(new URL('../systems/evo-cinema.js',import.meta.url),'utf8');
 assert.match(stage,/drawEvolutionPresentation/);
});

test('Islands: distinct palette identity, deterministic, gradients cached (not per frame)', () => {
 assert.ok(hsl(DINO_VALLEY_PALETTE.skyMid).h>150&&hsl(DINO_VALLEY_PALETTE.skyMid).h<200);
 assert.ok(hsl(DRAGON_CALDERA_PALETTE.skyMid).h>250);
 for(const draw of [drawDinoCraterBackdrop,drawDragonCalderaBackdrop]){
  const ctx=recorder();
  draw(ctx,{x:900,y:300},120,1280,760,false);const g1=ctx._gradients,n1=ctx._log.length;
  draw(ctx,{x:900,y:300},120,1280,760,false);
  assert.equal(ctx._gradients,g1,'second frame builds no new gradients');
  assert.deepEqual(ctx._log.slice(n1),ctx._log.slice(0,n1),'same frame twice is identical');
  const moved=recorder();draw(moved,{x:900,y:300},400,1280,760,false);
  assert.notDeepEqual(moved._log,ctx._log.slice(0,n1),'ambient animation moves over time');
  const ra=recorder(),rb=recorder();
  draw(ra,{x:900,y:300},10,1280,760,true);draw(rb,{x:900,y:300},900,1280,760,true);
  assert.deepEqual(ra._log,rb._log,'reduced motion is static');
 }
 for(const f of ['dino-crater.js','dragon-caldera.js']){
  const src=readFileSync(new URL('../worlds/'+f,import.meta.url),'utf8');
  assert.doesNotMatch(src,/Math\.random/);
 }
});
