import test from "node:test";
import assert from "node:assert/strict";
import {
  HERO_MASTERY,
  masteryOf,
  playerMasteryPlatforms,
  updateHeroMastery,
  afterMoveHeroMastery,
  onDinoPoundImpact,
  masteryHurt,
  onMasteryRoom,
  masterySnapshot,
} from "../systems/hero-mastery.js";

function player(id, extra={}) {
  return {
    id, x:700, y:650, w:30, h:36, vx:0, vy:0, facing:1,
    grounded:false, jumps:2, maxJumps:2, jumpPower:12, evo:0,
    health:100, maxHealth:100, invuln:0, dead:false, ...extra,
  };
}
function game(id, extra={}) {
  return {
    roomId:"hub", worldW:2240, worldH:1260, t:10,
    player:player(id), shake:0,
    fx:{emit(){}}, nums:{add(){}}, ...extra,
  };
}

test("V39: los diez héroes tienen una maestría única", () => {
  const ids=["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
  const defs=ids.map((id)=>masteryOf(id));
  assert.equal(Object.keys(HERO_MASTERY).length,10);
  assert.equal(new Set(defs.map((d)=>d.id)).size,10);
  assert.ok(defs.every((d)=>d.name && d.desc));
});

test("V39: solo Chispín recibe nubes físicas de Cloudstep", () => {
  const ch=game("chispin");
  const dr=game("dragon");
  const cp=playerMasteryPlatforms(ch);
  assert.ok(cp.length >= 2);
  assert.ok(cp.every((p)=>p.mastery==="cloudstep" && p.h<=24));
  assert.equal(playerMasteryPlatforms(dr).some((p)=>p.mastery==="cloudstep"),false);
});

test("V39: Dragón obtiene batidas extra después de agotar saltos normales", () => {
  const g=game("dragon");
  g.player.evo=4;
  g.player.jumps=g.player.maxJumps;
  g.player._jumpHeld=false;
  onMasteryRoom(g);
  updateHeroMastery(g,{jump:true,jumpPressed:true,t:11});
  assert.equal(g.player._jumpHeld,true);
  assert.ok(g.player.vy < -7);
  assert.equal(masterySnapshot(g).wingUsed,1);

  g.player._jumpHeld=false;
  updateHeroMastery(g,{jump:true,jumpPressed:true,t:12});
  g.player._jumpHeld=false;
  updateHeroMastery(g,{jump:true,jumpPressed:true,t:13});
  assert.equal(masterySnapshot(g).wingUsed,3);

  const before=g.player.vy;
  g.player._jumpHeld=false;
  updateHeroMastery(g,{jump:true,jumpPressed:true,t:14});
  assert.equal(masterySnapshot(g).wingUsed,3);
  assert.equal(g.player.vy,before);
});

test("V39: Michi solo puede hacer un Moon Pounce por ciclo aéreo", () => {
  const g=game("cat");
  g.player.jumps=g.player.maxJumps;
  g.player._jumpHeld=false;
  onMasteryRoom(g);
  updateHeroMastery(g,{jump:true,jumpPressed:true,t:20});
  assert.equal(masterySnapshot(g).pounceUsed,true);
  const firstVx=g.player.vx;
  assert.ok(firstVx>7);

  g.player._jumpHeld=false;
  g.player.vx=0;
  updateHeroMastery(g,{jump:true,jumpPressed:true,t:21});
  assert.equal(g.player.vx,0);

  g.player.grounded=true;
  updateHeroMastery(g,{jump:false,jumpPressed:false,t:22});
  assert.equal(masterySnapshot(g).pounceUsed,false);
});

test("V39: Yomi es intangible durante el Paso Hueco", () => {
  const g=game("yomi");
  g.player._specter=6;
  assert.equal(masteryHurt(g,27),0);
  g.player._specter=0;
  assert.equal(masteryHurt(g,27),27);
});

test("V39: Pizza rebota en respiraderos exclusivos", () => {
  const g=game("pizza");
  const pad=playerMasteryPlatforms(g).find((p)=>p.mastery==="ovenbounce");
  assert.ok(pad);
  g.player.x=pad.x+10;
  g.player.y=pad.y-g.player.h;
  g.player.grounded=true;
  g.player._preVy=7;
  onMasteryRoom(g);
  afterMoveHeroMastery(g,{t:30});
  assert.equal(g.player.grounded,false);
  assert.ok(g.player.vy < -g.player.jumpPower);
});

test("V39: Cuerno crea un puente de luz tras un aterrizaje fuerte", () => {
  const g=game("cuerno");
  g.player.grounded=true;
  g.player._preVy=8;
  g.player.y=900;
  onMasteryRoom(g);
  afterMoveHeroMastery(g,{t:40});
  const platforms=playerMasteryPlatforms(g);
  assert.ok(platforms.some((p)=>p.mastery==="aurorabridge"));
  assert.equal(masterySnapshot(g).bridge,true);
});

test("V39: Dino rompe una grieta cercana y rebota", () => {
  const g=game("dino");
  g.player.x=1025;
  g.player.y=1098-g.player.h;
  g.player.grounded=true;
  onMasteryRoom(g);
  const hit=onDinoPoundImpact(g);
  assert.ok(hit);
  assert.equal(g.player.grounded,false);
  assert.ok(g.player.vy<0);
});

test("V39: las plataformas de maestría son solo del jugador y de un sentido", () => {
  for(const id of ["chispin","pizza","cuerno"]){
    const g=game(id);
    onMasteryRoom(g);
    if(id==="cuerno"){
      g.player.grounded=true;g.player._preVy=8;g.player.y=900;
      afterMoveHeroMastery(g,{t:50});
    }
    const ps=playerMasteryPlatforms(g);
    assert.ok(ps.length>0);
    assert.ok(ps.every((p)=>p.h<=24));
  }
});
