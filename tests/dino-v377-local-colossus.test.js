import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createDinoEffects } from "../systems/dino-combat.js";

function setup(reduceMotion=false) {
  const fields=[],hits=[];
  const hero={id:"dino",x:100,y:200,w:32,h:40,evo:4,facing:1,dead:false};
  const center=o=>({x:o.x+(o.w||0)/2,y:o.y+(o.h||0)/2});
  const cx=o=>center(o).x,cy=o=>center(o).y;
  const circleHit=(x,y,r,e)=>{
    const ex=Math.max(e.x,Math.min(x,e.x+e.w));
    const ey=Math.max(e.y,Math.min(y,e.y+e.h));
    return (x-ex)**2+(y-ey)**2<=r*r;
  };
  const inside={name:"inside",x:280,y:205,w:24,h:24,hp:1000};
  const outside={name:"outside",x:800,y:205,w:24,h:24,hp:1000};
  const game={player:hero,roomId:"hub",enemies:[inside,outside],worldW:1200,worldH:800,
    cam:{x:0,y:0},platforms:[],reduceMotion,nums:{add(){}},fx:{emit(){}},shake:0};
  const fx=createDinoEffects({
    cx,cy,canHit:e=>e.hp>0,inView:()=>true,circleHit,
    hitEnemy:(_g,e,damage)=>{hits.push({e,damage});e.hp-=damage;return true;},
    add:f=>{fields.push(f);return f;},
    boom(){},nearestEnemy:()=>inside,solidAt:()=>false,groundBelow:()=>250,
    clamp:(v,a,b)=>Math.max(a,Math.min(b,v))
  });
  const field=fx.castUltimate(game,hero,game.enemies,100,"#c8f04a");
  return {fx,field,fields,hits,game,hero,inside,outside};
}

test("V377: 18-frame telegraph, exact local circle and single initial strike",()=>{
  const h=setup();const f=h.field;
  assert.equal(f.launchRadius,300);
  assert.equal(f.warmup,18);
  assert.equal(h.hits.length,0);
  for(let i=0;i<17;i++)h.fx.update.dinoColossus(h.game,f,h.hero);
  assert.equal(h.hits.length,0);
  assert.equal(f.warmup,1);
  // Enemy enters just before the warning resolves, so test impact-frame geometry.
  const newcomer={name:"late",x:340,y:216,w:24,h:24,hp:1000};
  h.game.enemies.push(newcomer);
  h.fx.update.dinoColossus(h.game,f,h.hero);
  assert.equal(f.warmup,0);
  assert.deepEqual(h.hits.map(hit=>hit.e.name),["inside","late"]);
  assert.equal(h.hits[0].damage,106);
  assert.equal(h.outside.hp,1000,"distant enemies take no invisible damage");
  for(let i=0;i<8;i++)h.fx.update.dinoColossus(h.game,f,h.hero);
  assert.equal(h.hits.length,2,"no second initial strike before aftershocks");
});

test("V377: a target that leaves the ring during preparation is not damaged",()=>{
  const h=setup();h.inside.x=800;
  for(let i=0;i<18;i++)h.fx.update.dinoColossus(h.game,h.field,h.hero);
  assert.equal(h.hits.length,0);
});

test("V377: only actually hit targets enter the duet duplicate-prevention set",()=>{
  const h=setup();
  const hitTargets=new Set();h.field.duet={legacyTargets:hitTargets};
  for(let i=0;i<18;i++)h.fx.update.dinoColossus(h.game,h.field,h.hero);
  assert.deepEqual([...hitTargets],[h.inside]);
  assert.equal(hitTargets.has(h.outside),false);
});

test("V377: death or changing room cancels the prepared impact",()=>{
  for(const reason of ["death","room","different actor"]){
    const h=setup();for(let i=0;i<8;i++)h.fx.update.dinoColossus(h.game,h.field,h.hero);
    if(reason==="death")h.hero.dead=true;
    if(reason==="room")h.game.roomId="reef";
    if(reason==="different actor")h.game.player={...h.hero};
    assert.equal(h.fx.update.dinoColossus(h.game,h.field,h.game.player),false,reason);
    assert.equal(h.hits.length,0,reason);
    assert.equal(h.game._dinoUltimate.remaining,0);
  }
});

test("V377: warning ring, damaging radius and reduced motion share one contract",()=>{
  const source=fs.readFileSync("systems/dino-combat.js","utf8");
  assert.match(source,/circleHit\(f\.x,f\.y,f\.launchRadius,e\)/);
  assert.match(source,/ctx\.arc\(x,y,f\.launchRadius,0,TAU\)/);
  assert.match(source,/warmup:18/);
  for(const quiet of [false,true]){
    const h=setup(quiet);
    assert.equal(h.field.launchRadius,300);
    assert.equal(h.field.max,260);
    assert.ok(h.hero.invuln>=72);
  }
  const abilities=fs.readFileSync("systems/abilities.js","utf8");
  assert.match(abilities,/p\.id==="dino"\?\[\]:launchTargets/);
  assert.match(abilities,/dinoLaunch\.duet=game\._familyDuet/);
});
