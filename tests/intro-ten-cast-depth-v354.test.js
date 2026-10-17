import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ROSTER} from "../characters/roster.js";
import {WELCOME_CAST_ORDER} from "../systems/intro-cast-fit.js";
import {dragonWelcomeBeat} from "../systems/intro-dragon-stage.js";
import {dinoWelcomeBeat} from "../systems/intro-dino-stage.js";
import {fritaWelcomeBeat} from "../systems/intro-frita-stage.js";
import {pizzaWelcomeBeat} from "../systems/intro-pizza-stage.js";
import {yomiWelcomeBeat} from "../systems/intro-yomi-stage.js";
import {cuernoWelcomeBeat} from "../systems/intro-cuerno-stage.js";
import {kiloWelcomeBeat} from "../systems/intro-kilo-stage.js";
import {stitchoWelcomeBeat} from "../systems/intro-stitcho-stage.js";
import {chispinWelcomeBeat} from "../systems/intro-chispin-stage.js";
import {michiWelcomeBeat} from "../systems/intro-michi-stage.js";

const CAST=[
 ["dragon",dragonWelcomeBeat,"dragon","dragon","dragon.js",4],
 ["dino",dinoWelcomeBeat,"dino","dino","dino.js",5],
 ["frita",fritaWelcomeBeat,"frita","frita","frita.js",5],
 ["pizza",pizzaWelcomeBeat,"pizza","pizza","pizza.js",5],
 ["yomi",yomiWelcomeBeat,"yomi","yomi","yomi.js",5],
 ["cuerno",cuernoWelcomeBeat,"cuerno","cuerno","cuerno.js",5],
 ["kilo",kiloWelcomeBeat,"kilo","kilo","lilo.js",5],
 ["stitcho",stitchoWelcomeBeat,"stitcho","stitcho","stitch.js",5],
 ["chispin",chispinWelcomeBeat,"chispin","chispin","pikachu.js",5],
 ["cat",michiWelcomeBeat,"michi","Michi","cat.js",5],
];
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("V354 audit: all ten actors still get original independent stage direction",()=>{
 const intro=read("systems/intro.js"),draw=read("characters/draw.js");
 assert.equal(CAST.length,10);
 assert.equal(new Set(CAST.map(x=>x[0])).size,10);
 assert.deepEqual(new Set(WELCOME_CAST_ORDER),new Set(CAST.map(x=>x[0])));
 assert.equal(ROSTER.length,10);
 for(const [id,,stage,artist] of CAST){
  assert.match(intro,new RegExp('actor\\("'+id+'"'),"original intro actor "+id);
  assert.ok(intro.includes(stage+"Welcome:")||intro.includes("michiWelcome:"),"isolated intro direction "+id);
  assert.ok(draw.includes("pose."+stage+"Welcome=p._intro") ||
   (id==="cat"&&draw.includes("pose.michiWelcome=p._introMichi")),
   "real stage Canvas propagation "+id);
  assert.match(read("characters/art/"+CAST.find(x=>x[0]===id)[4]),
   /export default\s*\{\s*id\s*:/,"canonical art "+artist);
 }
});

test("V354 audit: ten directors have stable clocks and no NaN across 14 seconds",()=>{
 for(const [id,director] of CAST){
  for(const time of [0,.31,1.27,3.52,4.7,5.9,7.8,9.3,11.7,13.92,14,28,-14,Infinity,NaN]){
   const a=director(time),b=director(time+14);
   for(const v of Object.values(a))
    if(typeof v==="number")assert.ok(Number.isFinite(v)&&Math.abs(v)<=1.000001,id+" finite bounded");
   if(Number.isFinite(time))assert.deepEqual(a,b,id+" exact cycle at "+time);
   assert.ok(typeof a.phase==="string"&&a.phase.length>0,id+" valid actor phase");
  }
 }
});

test("V354 audit: reduced motion is genuinely still in every performance",()=>{
 for(const [id,director] of CAST){
  const base=director(0,true);
  for(const t of [.5,3.5,6.25,8.55,12.75]){
   const b=director(t,true);
   assert.deepEqual(b,base,id+" reduced mode must not accidentally animate stage features");
   assert.equal(b.phase,"idle",id+" never drives automatic sudden acting");
   assert.equal(b.reduced,true,id+" includes a reduced-motion gate");
  }
 }
});

test("V354 audit: five canonical evolutionary forms are represented without runtime sprites",()=>{
 const source=read("characters/roster.js");
 assert.ok(source.includes("forms"),"canonical evolutionary data must remain");
 for(const [id,,stage,,file] of CAST){
  const art=read("characters/art/"+file);
  assert.ok(art.length>11000,id+" cannot be replaced with tiny placeholder sprite");
  assert.doesNotMatch(art,/FULL_CONTENT_PLACEHOLDER|PLACEHOLDER_WILL_BE_REPLACED/);
  const definition=ROSTER.find(x=>x.id===id);
  assert.ok(definition,id+" missing from real playable roster");
  assert.equal(definition.forms?.length,5,id+" must retain F0..F4");
  assert.ok(definition.forms.every(x=>x),"no blank evolution for "+id);
  assert.ok(typeof stage==="string"&&stage.length>2);
 }
});

test("V354 audit: source-of-truth reexports cannot silently hide a different drawing",()=>{
 const pairs=[["kilo","lilo.js"],["stitcho","stitch.js"],["chispin","chispa.js"]];
 for(const [id,file] of pairs){
  const shim=read("characters/art/"+id+".js");
  assert.ok(shim.includes('from "./'+file+'"'),id+" must use the original body, not duplicate artwork");
 }
 assert.ok(read("characters/art/cat.js").includes("michiWelcomeRig"));
 assert.ok(read("characters/art/dragon.js").includes("dragonWelcomeAnatomy"));
});
