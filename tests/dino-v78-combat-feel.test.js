import test from "node:test";
import assert from "node:assert/strict";
import { createDinoEffects } from "../systems/dino-combat.js";
import { useAbility, abilityPreMove, clearAbilityFx, updateAbilityFx } from "../systems/abilities.js";

// All tests run the actual Dino combat update logic. Enemy collision and
// projectile paths are not asserted with brittle source-string checks.
const cx=o=>o.x+(o.w||0)/2;
function setupDino(terrain=()=>null){
  const spawned=[],hit=[],particles=[];
  const cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2;
  const ops={
    canHit:e=>!!e&&e.hp>0,cx,cy,
    nearestEnemy:(g,x,y,range,skip,dir)=>{
      const list=(g.enemies||[]).filter(e=>e.hp>0 && (!skip || !skip.has(e)))
        .sort((a,b)=>Math.hypot(cx(a)-x,cy(a)-y)-Math.hypot(cx(b)-x,cy(b)-y));
      return list.find(e=>Math.hypot(cx(e)-x,cy(e)-y)<range)||null;
    },
    solidAt:(g,x,y)=>terrain(x,y),
    groundBelow:(g,x,y)=>(g.platforms||[])
       .filter(pl=>x>=pl.x&&x<=pl.x+pl.w&&pl.y>=y)
       .reduce((best,pl)=>Math.min(best,pl.y),Infinity)===Infinity?null:
       (g.platforms||[]).filter(pl=>x>=pl.x&&x<=pl.x+pl.w&&pl.y>=y)
         .reduce((best,pl)=>Math.min(best,pl.y),Infinity),
    inView:()=>true,
    circleHit:(x,y,r,e)=>{const ex=Math.max(e.x,Math.min(x,e.x+e.w));
      const ey=Math.max(e.y,Math.min(y,e.y+e.h));return Math.hypot(x-ex,y-ey)<=r;},
    hitEnemy:(g,e,d,o)=>{e.hp-=d;hit.push({e,d,o});return true;},
    boom:(g,x,y,color,n)=>{particles.push({color,n});},
    add:f=>{spawned.push(f);return f;},
    clamp:(v,a,b)=>Math.max(a,Math.min(v,b)),
  };
  return {fx:createDinoEffects(ops),hit,spawned,particles};
}
function bubble(extra={}){
  return {x:24,y:36,vx:10,vy:0,face:1,life:90,delay:0,age:1,
    target:null,radius:5,trail:[],evo:3,dmg:22,color:"#baffb4",...extra};
}

test("Dino V78 J rebounds once, then splats: no endless wall bouncing",()=>{
 const h=setupDino((x)=>x>=33?{x:33}:null);
 const g={enemies:[],worldW:640,worldH:480};
 const f=bubble({x:29,vx:12,radius:3});
 assert.equal(h.fx.update.dinoSpit(g,f),true,"First collision should bounce");
 assert.equal(f.bounces,1);
 assert.ok(f.vx<0,"The boing must reverse velocity");
 assert.equal(f.wallDodge,16);
 assert.ok(h.particles.some(p=>p.color==="#fff6bb"),"Boing must be audible/visible via particles");
 f.x=31;f.vx=12;f.wallDodge=0;
 assert.equal(h.fx.update.dinoSpit(g,f),false,"Second collision must finish");
 assert.equal(h.spawned.filter(x=>x.kind==="dinoSplat").length,1);
});

test("Dino V78 J leads airborne moving opponents, but remains bounded",()=>{
 const runner={x:180,y:70,w:22,h:20,hp:500,vx:6,vy:4};
 const h=setupDino();
 const f=bubble({x:30,y:55,vx:8,vy:0,radius:8,evo:4});
 const g={enemies:[runner],worldW:640,worldH:480};
 let alive=true;
 for(let i=0;i<65 && alive;i++){
   f.age++;
   runner.x+=Math.max(0,runner.vx*.6);
   runner.y+=Math.sin(i*.12)*1.6;
   alive=h.fx.update.dinoSpit(g,f);
   assert.ok(f.trail.length<=7 && Number.isFinite(f.x) && Number.isFinite(f.y));
 }
 assert.equal(alive,false,"Guided slime failed to resolve");
 assert.ok(h.hit.length<=1,"One globule cannot keep damaging its main target");
 assert.ok(f.bounces===undefined || f.bounces<=1);
});

test("Dino V78 L and U target moving enemies without creating unlimited rocks",()=>{
 const h=setupDino(),target={x:300,y:210,w:24,h:30,hp:2000,vx:7,vy:0};
 const g={enemies:[target],platforms:[{x:200,y:270,w:330,h:30}],
   cam:{x:0,y:0},worldW:950,reduceMotion:false};
 const p={x:100,y:215,w:32,h:48,evo:4,facing:1};
 const f={n:7,i:0,next:0,evo:4,face:1,origin:116,dmg:40,radius:65};
 for(let i=0;i<125 && f.i<7;i++)h.fx.update.dinoSkyfall(g,f,p);
 const marks=h.spawned.filter(e=>e.kind==="dinoWarning");
 const falls=h.spawned.filter(e=>e.kind==="meteor");
 assert.equal(falls.length,7);
 assert.equal(marks.length,7);
 assert.ok(marks.every(x=>x.x>312 && x.x<=cx(target)+68 && x.y===270));
 const actor={...p};
 const targetPos={x:target.x,y:target.y};
 h.fx.castUltimate({...g,nums:{add(){}},shake:0},actor,[target],80,"#d3f59c");
 const col=h.spawned.find(e=>e.kind==="dinoColossus");
 for(let i=0;i<260;i++)h.fx.update.dinoColossus(g,col,actor);
 const fossil=h.spawned.filter(e=>e.kind==="dinoFossil");
 const telegraph=h.spawned.filter(e=>e.kind==="dinoFossilMark");
 assert.equal(fossil.length,8);
 assert.equal(telegraph.length,8);
 assert.ok(telegraph.every(e=>e.x>cx(target) && e.x<=cx(target)+52 && e.y===270));
 assert.equal(target.x,targetPos.x,"Target selection cannot teleport enemies");
});

test("Dino V78 K wall bonk recoils, is bounded, and does not hurt distant foes",()=>{
 clearAbilityFx();
 const near={x:190,y:112,w:20,h:22,hp:500,vx:0,vy:0,invuln:0,stun:0};
 const far={x:10,y:112,w:20,h:22,hp:500,vx:0,vy:0,invuln:0,stun:0};
 const labels=[],emits=[];
 const p={id:"dino",abilities:["bite","charge","quake"],evo:4,
   x:184,y:100,w:32,h:40,vx:0,vy:0,facing:1,speed:5,
   health:100,maxHealth:100,cds:{},cdDur:{},xp:0,grounded:true};
 const g={player:p,enemies:[near,far],projectiles:[],ghosts:[],platforms:[],
   worldW:220,worldH:520,t:30,shake:0,hitstop:0,combo:0,
   nums:{add:(...args)=>labels.push(args)},fx:{emit:(...args)=>emits.push(args)},
   cam:{x:0,y:0}};
 assert.equal(useAbility(g,1),true);
 assert.equal(g.lastAbilityId,"charge");
 abilityPreMove(g,{right:true,t:30});
 assert.ok(p.vx<0 && p.vy<0,"An actual wall collision must rebound");
 assert.ok(near.hp<500,"Wall collision must deal one close-range bonk");
 assert.equal(far.hp,500,"No global wall-bonk damage");
 assert.equal(labels.filter(x=>x[2]==="¡BOING!").length,1);
 abilityPreMove(g,{right:true,t:31});
 assert.equal(labels.filter(x=>x[2]==="¡BOING!").length,1,"Bonk cannot repeat after charge ends");
 updateAbilityFx(g);
 clearAbilityFx();
});
