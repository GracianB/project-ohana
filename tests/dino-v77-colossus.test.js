import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { dinoColossusStage, DINO_COLOSSUS_ACTS, drawDinoColossusFilm } from "../systems/dino-ultimate-film.js";
import { createDinoEffects } from "../systems/dino-combat.js";
import { supremeOf, SUPREME_IDENTITY } from "../systems/abilities.js";

function battle() {
 const active=[],hits=[],emissions=[];
 const cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2;
 const ops={
  cx,cy,canHit:e=>!!e&&e.hp>0,
  nearestEnemy:(g,x,y)=>g.enemies.find(e=>e.hp>0)||null,
  solidAt:()=>null,inView:()=>true,
  circleHit:(x,y,r,e)=>Math.hypot(cx(e)-x,cy(e)-y)<r+Math.max(e.w,e.h)/2,
  hitEnemy:(g,e,damage)=>{hits.push({enemy:e,damage});e.hp-=damage;return true;},
  boom:(g,x,y,col,count)=>emissions.push({x,y,col,count}),
  add:f=>{active.push(f);return f;},
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  groundBelow:(g,x,y)=>g.platforms.find(pl=>x>=pl.x&&x<=pl.x+pl.w&&pl.y>=y)?.y??null
 };
 const g={
  player:{id:"dino",x:100,y:260,w:32,h:40,evo:4,invuln:0,facing:1},
  enemies:[{x:245,y:274,w:24,h:24,hp:2000}],
  platforms:[{x:0,y:300,w:800,h:24}],fx:{emit(){}},nums:{add(){}},
  cam:{x:0,y:0},worldW:800,worldH:700,reduceMotion:false,shake:0
 };
 return {fns:createDinoEffects(ops),active,hits,emissions,g};
}

test("Dino V77 has exactly five expressive story acts with deterministic boundaries",()=>{
 assert.deepEqual(DINO_COLOSSUS_ACTS.map(a=>a.name),
   ["heartbeat","awaken","rupture","comets","heart"]);
 for(const [k,name] of [[0,"heartbeat"],[.19,"awaken"],[.40,"rupture"],[.62,"comets"],[.9,"heart"],[1,"heart"]]){
   const stage=dinoColossusStage(k);
   assert.equal(stage.name,name);
   assert.ok(stage.progress>=0&&stage.progress<=1);
   assert.deepEqual(dinoColossusStage(k),stage);
 }
 assert.equal(supremeOf("dino").id,"impact","Keep original U ID for input mappings");
 assert.equal(supremeOf("dino").name,"CORAZÓN DE COLOSO");
 assert.match(SUPREME_IDENTITY.dino.line,/CORAZÓN/);
 assert.equal(supremeOf("dragon").id,"nova");
 assert.equal(supremeOf("cuerno").id,"aurora");
});

test("Dino V77 U starts a bounded 260-frame titan, immediate hit and independent FX",()=>{
 const h=battle(),p=h.g.player,e=h.g.enemies[0];
 h.fns.castUltimate(h.g,p,[e],110,"#d3f59c");
 assert.ok(e.hp<2000,"Original instant titan hit must remain");
 assert.ok(p._specialT>=260&&p._specialTitanT>=260&&p._specialArmorT>=260);
 assert.ok(p.invuln>=72);
 const fields=h.active.filter(f=>f.kind==="dinoColossus");
 assert.equal(fields.length,1,"No duplicate supreme fields");
 assert.equal(fields[0].max,260);
 assert.ok(h.g.shake<=18,"No dangerous screen shaking");
 let updates=0;
 for(let t=0;t<260;t++){
   const f=fields[0];if(f.life<=0)break;
   h.fns.update.dinoColossus(h.g,f,p);
   updates++;
 }
 const rocks=h.active.filter(f=>f.kind==="dinoFossil");
 const marks=h.active.filter(f=>f.kind==="dinoFossilMark");
 assert.equal(rocks.length,8,"F4 needs a bounded eight-fossil performance");
 assert.equal(marks.length,rocks.length);
 assert.ok(h.hits.length>1,"Aftershocks must have real gameplay damage");
 assert.ok(updates<=260&&h.active.length<=20,"Combat FX budgets exceeded");
 assert.equal(h.g._dinoUltimate.remaining,0);
});

test("Dino V77 reduced-motion halves fossil count and keeps impacts finite",()=>{
 const h=battle();h.g.reduceMotion=true;
 h.fns.castUltimate(h.g,h.g.player,h.g.enemies,110,"#d3f59c");
 const field=h.active.find(f=>f.kind==="dinoColossus");
 for(let i=0;i<260;i++)h.fns.update.dinoColossus(h.g,field,h.g.player);
 assert.equal(h.active.filter(f=>f.kind==="dinoFossil").length,3);
 assert.ok(h.g.shake<=18);
 const rock=h.active.find(f=>f.kind==="dinoFossil");
 const target=h.g.enemies[0],before=target.hp;
 rock.x=target.x;rock.y=290;rock.vy=11;
 assert.equal(h.fns.update.dinoFossil(h.g,rock),false,"Meteor must explode at the floor");
 assert.ok(target.hp<before,"Fossil blast needs real gameplay impact");
 assert.equal(h.fns.update.dinoFossilMark(h.g,{life:1}),false);
 assert.equal(h.fns.update.dinoFossilBlast(h.g,{life:1}),false);
});

test("Dino V77 film is finite and renderable in five stages, including reduced-motion",()=>{
 for(const quiet of [false,true]){
  for(const k of [0,.12,.23,.39,.45,.62,.72,.86,.94,1]){
   let saves=0,restores=0,figures=0;
   const ctx=new Proxy({globalAlpha:1,save(){saves++},restore(){restores++},
    beginPath(){figures++}},{
     get(o,key){return key in o?o[key]:(()=>{});},
     set(o,key,val){o[key]=val;return true;}
   });
   drawDinoColossusFilm(ctx,k,1.2,200,170,150,"#d3f59c",quiet);
   assert.equal(saves,restores,"Canvas transform leaked at k="+k);
   assert.ok(figures>0,"No U art drawn at k="+k);
  }
 }
});

test("Dino V77 film and power stay modular and do not grow shared ability engine",()=>{
 const engine=fs.readFileSync("systems/abilities.js","utf8");
 const dino=fs.readFileSync("systems/dino-combat.js","utf8");
 const cine=fs.readFileSync("systems/supreme-cinema.js","utf8");
 const stories=fs.readFileSync("systems/supreme-storyboards.js","utf8");
 assert.ok(engine.length<135000,"Shared ability budget exceeded");
 assert.ok(dino.length<14500,"Dino-specific module should remain bounded");
 assert.match(cine,/dataset\.dinoPhase/);
 assert.match(cine,/drawDinoColossusFilm/);
 assert.match(stories,/heart-of-colossus/);
 assert.match(engine,/DINO_FX\.castUltimate/);
 assert.match(engine,/if \(p\.id !== "dino"\) add\(\{/);
});
