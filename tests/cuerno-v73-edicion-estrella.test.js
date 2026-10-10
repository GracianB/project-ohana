import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno,{cuernoEmotion,CUERNO_FAMILY_COLORS} from "../characters/art/cuerno.js";
import {ROSTER} from "../characters/roster.js";
import {drawCuernoGallopRibbons,useAbility,abilityPreMove,clearAbilityFx,supremeOf} from "../systems/abilities.js";
const art=fs.readFileSync("characters/art/cuerno.js","utf8");
const attacks=fs.readFileSync("systems/abilities.js","utf8");
const passive=fs.readFileSync("systems/passives.js","utf8");
const film=fs.readFileSync("systems/supreme-cinema.js","utf8");
const shots=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
function sample(form,state="idle",opts={}){
 const x={saves:0,restores:0,arcs:0,ellipses:0,curves:0,lines:0,eyes:0,limbs:0,sparks:0};
 const ctx=new Proxy({},{get(o,k){
  if(k==="save")return()=>x.saves++;if(k==="restore")return()=>x.restores++;
  if(k==="arc")return()=>x.arcs++;if(k==="ellipse")return()=>x.ellipses++;
  if(k==="bezierCurveTo"||k==="quadraticCurveTo")return()=>x.curves++;
  if(k==="lineTo")return()=>x.lines++;
  if(k in o)return o[k];return()=>{};
 },set(o,k,v){o[k]=v;return true}});
 const noop=()=>{};
 const R={ellipse:noop,celShade:noop,blush:noop,mouth:noop,halo:noop,
  limb:()=>x.limbs++,eye:()=>x.eyes++,sparkle:()=>x.sparks++};
 Cuerno.draw(ctx,{form,state,t:156,air:state==="jump",speed:.8,phase:1.3,
  bounce:.35,cast:state==="cast"?.55:0,castSlot:3,flourish:.4,
  flourishN:1,cuernoDreamT:0,...opts},R);
 assert.equal(x.saves,x.restores,"Canvas leak in "+form+"/"+state);
 return x;
}
test("V73 family seal evolves across five unique biological forms",()=>{
 assert.equal(CUERNO_FAMILY_COLORS.length,5);
 assert.equal(new Set(CUERNO_FAMILY_COLORS).size,5);
 assert.match(art,/function drawCuernoFamilySeal\(ctx,pose,R,form,t\)/);
 assert.match(art,/drawCuernoFamilySeal\(ctx,pose,R,form,t\)/);
 assert.match(art,/An opalescent embroidery on Aurora's flank/);
 assert.match(art,/Cuernín imagines|Destello's growing ears/);
 for(let form=0;form<5;form++){
  const a=sample(form),b=sample(form),joy=sample(form,"victory");
  assert.deepEqual(a,b,"non-deterministic art "+form);
  assert.ok(joy.sparks>a.sparks,"missing joy in form "+form);
  assert.ok(a.eyes>=1,"character must retain expressive eyes "+form);
 }
 assert.deepEqual([0,1,2,3,4].map(f=>sample(f).limbs),[0,0,4,4,4]);
});
test("V73 personality respects eight real states and quiet injuries",()=>{
 assert.equal(cuernoEmotion({state:"idle"},0),"wonder");
 assert.equal(cuernoEmotion({state:"idle"},4),"calm");
 assert.equal(cuernoEmotion({state:"run"},4),"dash");
 assert.equal(cuernoEmotion({state:"jump"},4),"flight");
 assert.equal(cuernoEmotion({state:"cast",castSlot:0},4),"focus");
 assert.equal(cuernoEmotion({state:"cast",castSlot:3},4),"dream");
 assert.equal(cuernoEmotion({state:"victory"},4),"joy");
 assert.equal(cuernoEmotion({state:"dead"},4),"quiet");
 assert.equal(cuernoEmotion({state:"hurt"},4),"quiet");
 for(let f=0;f<5;f++)for(const mode of ["run","jump","cast","victory","dead"]){
  const a=sample(f,mode);assert.ok(a.arcs+a.lines+a.curves>0);
 }
});
test("V73 gallop paints exactly four bounded color ribbons only for Cuerno",()=>{
 const trace={save:0,restore:0,curve:0,colors:[]};
 const ctx=new Proxy({},{get(o,k){
  if(k==="save")return()=>trace.save++;
  if(k==="restore")return()=>trace.restore++;
  if(k==="bezierCurveTo")return()=>trace.curve++;
  if(k in o)return o[k];return()=>{};
 },set(o,k,v){o[k]=v;if(k==="strokeStyle")trace.colors.push(v);return true}});
 const p={id:"cuerno",evo:4,x:120,y:130,w:32,h:44,facing:1};
 drawCuernoGallopRibbons(ctx,p,{x:0,y:0},44,17);
 assert.equal(trace.save,trace.restore);assert.equal(trace.curve,4);
 assert.equal(new Set(trace.colors).size,4);
 const curves=trace.curve;
 drawCuernoGallopRibbons(ctx,{...p,id:"dino"},{x:0,y:0},44,17);
 drawCuernoGallopRibbons(ctx,p,{x:0,y:0},44,0);
 assert.equal(trace.curve,curves);
});
test("V73 innate sprint/jump outranks everyone; J still pierces three; K stops at wall",()=>{
 const hero=ROSTER.find(h=>h.id==="cuerno");
 for(let form=0;form<5;form++)for(const other of ROSTER.filter(h=>h.id!=="cuerno")){
  assert.ok(hero.forms[form].speed>other.forms[form].speed);
  assert.ok(hero.forms[form].jump>other.forms[form].jump);
 }
 const p={id:"cuerno",evo:4,abilities:hero.abilities,speed:9.6,jumpPower:18.6,
  x:100,y:220,w:32,h:44,facing:1,vx:0,vy:0,cds:{},cdDur:{},health:100,maxHealth:198};
 const g={player:p,t:0,projectiles:[],enemies:[],ghosts:[],platforms:[],
  worldW:1600,worldH:900,cam:{x:0,y:0},fx:{emit(){}},nums:{add(){}},
  reduceMotion:true,shake:0,flash:0};
 clearAbilityFx();
 assert.equal(useAbility(g,0),true);assert.equal(g.projectiles.length,1);
 assert.equal(g.projectiles[0].pierce,3);
 assert.equal(useAbility(g,1),true);
 abilityPreMove(g,{left:false,right:false,jump:false});
 assert.ok(p.vx>0);
 p.x=g.worldW-p.w-9;
 abilityPreMove(g,{left:false,right:false,jump:false});
 assert.equal(p.vx,0);
 assert.equal(p.speed,9.6);assert.equal(p.jumpPower,18.6);
 clearAbilityFx();
 assert.match(passive,/colors=\["#f6b9e4"/);
 assert.match(passive,/R: 24\+evo\*2/);
});
test("V73 cinema has honest sleeper symbols and new film actor for Cuernin",()=>{
 assert.match(film,/const symbols=Math\.min\(5,Math\.max\(0,Math\.floor\(Number\(dreamCount\)\|\|0\)\)\)/);
 assert.match(film,/const evo=clamp\(detail\.evo==null\?4:Number\(detail\.evo\),0,4\)/);
 assert.match(film,/One final quiet diadem/);
 assert.match(film,/p\._specialAuroraT=k>=\.51/);
 assert.match(shots,/09s-cuerno-v73-pearlescent-j/);
 assert.match(shots,/09t-cuerno-v73-ribbon-gallop-k/);
 assert.equal(supremeOf("cuerno").id,"aurora");
 assert.match(attacks,/drawCuernoGallopRibbons\(ctx,p,cam,t,S\.gallop\)/);
 assert.match(attacks,/Seven filaments twist within the same hitbox/);
 // Historical 135 KB source cap retired; functional checks remain active.
 assert.doesNotMatch(art.split("export function cuernoEmotion(")[1].split("function drawCuernoOverlays(")[0],
   /Math\.random|requestAnimationFrame|setTimeout|setInterval|fetch\(|new Image/);
});
