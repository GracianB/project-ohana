import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno,{CUERNO_VISUAL_H} from "../characters/art/cuerno.js";
import {ROSTER} from "../characters/roster.js";
const art=fs.readFileSync("characters/art/cuerno.js","utf8");
const draw=fs.readFileSync("characters/draw.js","utf8");
const title=fs.readFileSync("systems/title.js","utf8");
const screenshots=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
function picture(form,state="idle",phase=1.2){
 const trace={limbs:0,eyes:0,beziers:0,lines:0,arcs:0,save:0,restore:0,colors:[],scales:0};
 const ctx=new Proxy({},{
  get(o,k){if(k==="save")return()=>trace.save++;
   if(k==="restore")return()=>trace.restore++;
   if(k==="bezierCurveTo")return()=>trace.beziers++;
   if(k==="lineTo")return()=>trace.lines++;
   if(k==="arc")return()=>trace.arcs++;
   if(k==="scale")return()=>trace.scales++;
   if(k in o)return o[k];return()=>{};},
  set(o,k,v){o[k]=v;if(k==="fillStyle")trace.colors.push(String(v));return true;}
 });
 const noop=()=>{};
 const R={limb:()=>trace.limbs++,eye:()=>trace.eyes++,mouth:noop,ellipse:noop,
  blush:noop,sparkle:noop,celShade:noop,halo:noop};
 Cuerno.draw(ctx,{form,state,t:160,phase,speed:.7,air:state==="jump",cast:state==="cast"?.5:0,
  castSlot:3,bounce:.2,flourish:0,flourishN:0,cuernoDreamT:0},R);
 assert.equal(trace.save,trace.restore,"Canvas stack leaked F"+form+"/"+state);
 return trace;
}
test("V74 anatomy is exactly horn → orb → 4 legs → wings → black unicorn",()=>{
 assert.deepEqual([0,1,2,3,4].map(i=>picture(i).limbs),[0,0,4,4,4]);
 assert.equal(picture(0).eyes,2);
 assert.equal(picture(1).eyes,2);
 assert.ok(picture(2).eyes>=1);
 const f0=art.split("function drawLivingHorn(")[1].split("function drawFirstBody(")[0];
 const f1=art.split("function drawFirstBody(")[1].split("function drawRainbowFoal(")[0];
 const f2=art.split("function drawRainbowFoal(")[1].split("function drawStellarUnicorn(")[0];
 const f3=art.split("function drawStellarUnicorn(")[1].split("function drawAuroraUnicorn(")[0];
 const f4=art.split("function drawAuroraUnicorn(")[1].split("function draw(ctx, pose, R)")[0];
 assert.doesNotMatch(f0,/R\.limb|ctx\.arc\(0,0,22|stellarWing|function leg\(/);
 assert.doesNotMatch(f1,/R\.limb|function leg\(|function wing\(|stellarWing/);
 assert.match(f1,/ctx\.arc\(0,0,22,0,TAU\)/);
 assert.equal((f2.match(/leg\(/g)||[]).length>=4,true);
 assert.doesNotMatch(f2,/function stellarWing\(|function wing\(/);
 assert.match(f3,/function stellarWing\(far\)/);
 assert.match(f3,/stellarWing\(true\)/);
 assert.match(f3,/stellarWing\(false\)/);
 assert.match(f4,/coat="#1b1a28"/);
 assert.match(f4,/two unequal S-curves/);
 assert.ok(picture(3).beziers>picture(2).beziers,"F3 must grow wings");
 assert.ok(picture(4).colors.includes("#1b1a28"),"F4 is not painted black");
});
test("V74 five visible sizes rise gradually, without triple growth from generic evolution",()=>{
 assert.deepEqual([...CUERNO_VISUAL_H],[118,92,91,86,82]);
 // Canonical geometry extrema (horn or wings) times individual stage compensation.
 const screenHeights=CUERNO_VISUAL_H.map((scale,i)=>scale*[65,91,106,124,150][i]/100);
 for(let i=1;i<5;i++)assert.ok(screenHeights[i]>screenHeights[i-1],
  "form "+i+" grew smaller than its predecessor");
 assert.ok(screenHeights[4]/screenHeights[0]<2,"F4 still too large vs newborn");
 assert.match(draw,/p\.id==="cuerno"\?CUERNO_VISUAL_H\[evo\]/);
 assert.match(draw,/if\(p\.id!=="cuerno"\)\{/);
 assert.match(title,/def\.id==="cuerno"\?CUERNO_VISUAL_H\[evo\]/);
 assert.match(title,/cuerno:  \[0\.70,0\.98,1\.10,1\.43,1\.77\]/);
});
test("V74 poses stay deterministic and readable at each evolution",()=>{
 for(let form=0;form<5;form++)for(const state of ["idle","run","jump","cast","hurt","victory"]){
  const a=picture(form,state),b=picture(form,state);
  assert.deepEqual(a,b,"nondeterminism F"+form+"/"+state);
  assert.ok(a.arcs+a.lines+a.beziers>8);
 }
 assert.notDeepEqual(picture(3,"run",.1),picture(3,"run",2.9),
  "wings/legs should move with gallop");
});
test("V74 movement and four abilities have not been replaced with artwork",()=>{
 const c=ROSTER.find(r=>r.id==="cuerno");
 assert.deepEqual(c.abilities,["gleam","gallop","rainbow"]);
 assert.deepEqual(c.forms.map(f=>f.jumps),[2,2,3,3,4]);
 for(let i=0;i<5;i++){
  for(const other of ROSTER.filter(h=>h.id!=="cuerno")){
   assert.ok(c.forms[i].speed>other.forms[i].speed);
   assert.ok(c.forms[i].jump>other.forms[i].jump);
  }
 }
 assert.equal(c.forms[4].name,"Unicornio Negro");
 assert.equal(c.forms[4].color,"#252132");
 assert.match(screenshots,/01i-cuerno-origin-form-/);
 assert.match(screenshots,/09l-cuerno-rainbow-sleep-u/);
 assert.match(screenshots,/09s-cuerno-v73-pearlescent-j/);
 assert.doesNotMatch(art.split("function drawFirstBody(")[1].split("function draw(ctx, pose, R)")[0],
 /Math\.random|setInterval|setTimeout|requestAnimationFrame|new Image|fetch\(/);
});
