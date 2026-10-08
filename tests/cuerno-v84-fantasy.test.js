import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
 CUERNO_FANTASY,CUERNO_IRIS_COLORS,addCuernoRibbonPoint,cuernoRibbonTouches,
 startCuernoFantasyTrail,updateCuernoFantasyTrail,
 cuernoPrismPhase,drawCuernoFantasyRibbon,drawCuernoPrismCrown,
 drawCuernoFantasyStatus
} from "../systems/cuerno-fantasy.js";
import {ROSTER} from "../characters/roster.js";
import {useAbility,abilityPreMove,updateAbilityFx,drawAbilityFx,clearAbilityFx,ABILITY_DEFS} from "../systems/abilities.js";

function context(){
 const events=[],o={globalAlpha:1,saved:0};
 const ctx=new Proxy(o,{
  get(o,k){
   if(k in o)return o[k];
   if(k==="save")return()=>{o.saved++;events.push(["save"])};
   if(k==="restore")return()=>{o.saved--;events.push(["restore"])};
   return(...args)=>{
    if(["bezierCurveTo","arc","ellipse","moveTo","lineTo","quadraticCurveTo","stroke","fill","translate","rotate"].includes(k)){
      assert.ok(args.filter(v=>typeof v==="number").every(Number.isFinite),
        "Non-finite Canvas "+k);
      events.push([k,...args]);
    }
   };
  },
  set(o,k,v){o[k]=v;return true;}
 });
 return {ctx,events,verify(){assert.equal(o.saved,0,"Canvas stack leak");}};
}
function fixture(evo=4){
 const hero=ROSTER.find(x=>x.id==="cuerno");
 const p={id:"cuerno",evo,abilities:hero.abilities,
  speed:9.6,jumpPower:18.6,x:100,y:220,w:32,h:44,facing:1,
  vx:0,vy:0,grounded:true,cds:{},cdDur:{},health:100,maxHealth:198,xp:0};
 const g={player:p,t:1,projectiles:[],enemies:[],ghosts:[],
  platforms:[],worldW:3500,worldH:900,cam:{x:0,y:0},
  fx:{emit(){}},nums:{add(){}},reduceMotion:true,shake:0,flash:0,combo:0};
 return {p,g};
}
function simulate(g,n){
 for(let i=0;i<n;i++){
  g.t++;
  abilityPreMove(g,{left:false,right:false,jump:false});
  g.player.x+=g.player.vx;
  updateAbilityFx(g);
 }
}
test("V84 K draws a deterministic 10-second capped rainbow ribbon touching the arena",()=>{
 assert.equal(CUERNO_FANTASY.trailFrames,600);
 assert.equal(CUERNO_FANTASY.maxTrails,2);
 let pts=[];
 for(let i=0;i<100;i++)pts=addCuernoRibbonPoint(pts,i*11,160+Math.sin(i*.15)*9);
 assert.ok(pts.length<=32&&pts.length>=20);
 assert.deepEqual(addCuernoRibbonPoint(pts,pts.at(-1).x+1,pts.at(-1).y),pts);
 const near={x:pts[16].x-7,y:pts[16].y-15,w:20,h:30};
 assert.ok(cuernoRibbonTouches(pts,near));
 assert.equal(cuernoRibbonTouches(pts,{x:9999,y:9999,w:20,h:30}),false);
 assert.equal(cuernoRibbonTouches([],near),false);
 assert.ok(Object.isFrozen(CUERNO_IRIS_COLORS)&&CUERNO_IRIS_COLORS.length===7);
 const A=context(),B=context();
 const f={life:420,max:600,points:pts};
 drawCuernoFantasyRibbon(A.ctx,f,{x:50,y:60},150,true);
 drawCuernoFantasyRibbon(B.ctx,f,{x:50,y:60},150,true);
 A.verify();B.verify();
 assert.deepEqual(A.events,B.events,"Reduced motion must be deterministic");
 const strokes=A.events.filter(x=>x[0]==="stroke").length;
 const original=7+Math.ceil((pts.length-1)/4);
 assert.ok(strokes>original, "V91 hoofprints must visibly contribute");
 assert.ok(strokes<=original+21, "V91 hoofprints must remain strictly capped");
});

test("V84 K actually creates a lasting hazard and applies capped fantasy DoT",()=>{
 clearAbilityFx();
 const {p,g}=fixture();
 assert.equal(useAbility(g,1),true,"Cuerno K must remain available");
 simulate(g,31);
 const afterGallopX=p.x;
 assert.ok(afterGallopX>p.x-1&&afterGallopX>220,"K must keep its dash");
 const enemy={x:188,y:233,w:28,h:40,hp:240,maxHp:240,flash:0,stun:0};
 g.enemies=[enemy];
 simulate(g,5);
 assert.ok(enemy._cuernoFantasyUntil>g.t,"Touched K ribbon but no fantasy status");
 assert.equal(enemy.hp,240,"Fantasy damage should be periodic, not all upfront");
 simulate(g,33);
 assert.ok(enemy.hp<240,"Fantasy poison never dealt damage");
 assert.equal(g.combo,0,"DoT must not farm combos or score");
 assert.ok(enemy.hp>220,"Damage too high for a 0.5-second tick");
 const prev=enemy.hp;
 simulate(g,27);
 assert.ok(prev-enemy.hp<=20,"Multi-tick stacking or excessive damage");
 // The player may stop and leave; an active ribbon still poisons until expiry.
 g.enemies=[];
 simulate(g,470);
 const check=context();
 drawAbilityFx(check.ctx,g,g.t);check.verify();
 simulate(g,140);
 // Trail and enemy mark have both expired; no retained status renderer.
 const quiet=context();
 drawAbilityFx(quiet.ctx,g,g.t);quiet.verify();
 clearAbilityFx();
});

test("V84 seven-horn L remains a single physical iris hitbox",()=>{
 clearAbilityFx();
 const {g,p}=fixture();
 assert.equal(useAbility(g,2),true,"Cuerno L missing");
 const source=fs.readFileSync("systems/abilities.js","utf8");
 assert.match(source,/kind:"irisHalo"/);
 assert.match(source,/kind:"cuernoPrismCrown"/);
 assert.match(source,/cuernoPrismCrown\(g,f\)/);
 assert.match(source,/drawCuernoPrismCrown\(ctx,f,cam,t/);
 assert.ok(source.length<135000,"Shared engine memory/performance ceiling exceeded");
 const phases=[68,50,32,15,1].map(life=>cuernoPrismPhase(life,68));
 assert.equal(phases[0].fade,0);
 assert.ok(phases[1].radius>phases[0].radius);
 assert.ok(phases[2].bloom>0);
 assert.ok(phases[3].fade>0);
 for(const life of [68,50,32,15,1]){
  const painted=context();
  drawCuernoPrismCrown(painted.ctx,{x:320,y:250,life,max:68,evo:4},{x:0,y:0},180,true);
  painted.verify();
  if(life<=50)assert.ok(painted.events.filter(v=>v[0]==="bezierCurveTo").length>=24,
     "L lost sculpted miniature horns / rainbow arches");
 }
 const display=context();
 drawAbilityFx(display.ctx,g,g.t);display.verify();
 assert.match(ABILITY_DEFS.gallop.desc,/10 s/);
 assert.match(ABILITY_DEFS.rainbow.desc,/siete cuernos/);
 clearAbilityFx();
});

test("V84 fantasy markers render three bounded stars and disappear on expiry",()=>{
 const present={x:90,y:170,w:24,h:36,hp:50,_cuernoFantasyUntil:200};
 const fading=context();
 drawCuernoFantasyStatus(fading.ctx,[present],{x:0,y:0},115,true);
 fading.verify();
 assert.ok(fading.events.filter(x=>x[0]==="stroke").length>=4, "V91 adds enchantment countdown ring");
 const gone=context();
 drawCuernoFantasyStatus(gone.ctx,[present],{x:0,y:0},205,true);
 gone.verify();
 assert.equal(gone.events.length,0);
});

test("V84 full release remains Cuerno-only with Dino and canonical evolutions unaltered",()=>{
 const hero=ROSTER.find(x=>x.id==="cuerno");
 assert.deepEqual(hero.abilities,["gleam","gallop","rainbow"]);
 assert.equal(hero.forms.length,5);
 const precache=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 assert.match(precache,/const VERSION = "ohana-\d+"/);
 const cache=precache.match(/const VERSION = "(ohana-\d+)"/)?.[1];
 assert.ok(cache && Number(cache.slice(6)) >= 284, "V84 cache must not roll back");
 assert.ok(html.includes(cache), "HTML and SW must use the same cache");
 assert.match(precache,/systems\/cuerno-fantasy\.js\?v=/);
 assert.doesNotMatch(html,/ohana-283/);
 const docs=fs.readFileSync("characters/art/dino.js","utf8");
 assert.match(docs,/dinoAirbornePose/);
});

test("V84 repeated K never reconnects an old magical lane to a new dash",()=>{
 const {g,p}=fixture();
 const effects=[];
 const add=f=>{effects.push(f);return f;};
 const cx=o=>o.x+o.w/2;
 const pw=()=>1;
 const first=startCuernoFantasyTrail(g,p,4,effects,add,pw,cx);
 for(let frame=0;frame<8;frame++){
   p.x+=20;first.age=frame+1;
   updateCuernoFantasyTrail(g,first,p,true,()=>false,cx);
 }
 const frozenPoints=first.points.map(point=>({...point}));
 const oldLife=first.life;
 const second=startCuernoFantasyTrail(g,p,4,effects,add,pw,cx);
 assert.notEqual(first,second);
 p.x+=70;g.t+=10;first.age++;second.age=2;
 updateCuernoFantasyTrail(g,first,p,true,()=>false,cx);
 updateCuernoFantasyTrail(g,second,p,true,()=>false,cx);
 assert.deepEqual(first.points,frozenPoints,"Old K lane follows the second K");
 assert.equal(first.life,oldLife-1,"Old K lane lifetime was extended by second K");
 assert.ok(second.points.length>1,"New K did not record its own magic lane");
 const third=startCuernoFantasyTrail(g,p,4,effects,add,pw,cx);
 assert.equal(first.dead,true,"Oldest ribbon must retire at max two overlapping casts");
 assert.ok(third && effects.length===3);
});
