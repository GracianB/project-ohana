// V611 — Caldera del Dragón: test de calidad del capítulo
import {strict as assert} from 'assert';
import {test} from 'node:test';

// ── Encounters ───────────────────────────────────────────────────────────────
import {authorDragonEncounters,DRAGON_BRAZIERS_V611} from '../systems/dragon-encounters-v611.js';
import {DRAGON_CHAPTER_BOSS_ID,DRAGON_CHAPTER_ARENA,DRAGON_THERMALS_V611,dragonGrowth,updateDragonChapter,dragonChapterReady,dragonObjective,drawDragonChapter} from '../systems/dragon-chapter.js';
import {drawDragonBrazier,drawDragonThermal,drawDragonAtmosphere,drawDragonCreature} from '../systems/dragon-chapter-art-v611.js';
import {drawDragonBoss,drawDragonBossSignals} from '../systems/dragon-boss.js';

// ── Canvas stub ──────────────────────────────────────────────────────────────
function makeCtx(){
  const ops=[];
  const proxy=new Proxy({fillStyle:'',strokeStyle:'',lineWidth:1,globalAlpha:1,font:'',textAlign:'',lineCap:'',lineJoin:'',shadowBlur:0,shadowColor:''},{
    get(t,k){if(k in t)return typeof t[k]==='function'?(...a)=>{ops.push([k,...a]);return proxy;}:t[k];
      return(...a)=>{ops.push([k,...a]);return proxy;}},
    set(t,k,v){t[k]=v;return true;}
  });
  proxy.ops=ops;proxy.save=()=>ops.push(['save'])&&proxy;proxy.restore=()=>ops.push(['restore'])&&proxy;
  proxy.createLinearGradient=()=>({addColorStop:()=>{}});
  proxy.createRadialGradient=()=>({addColorStop:()=>{}});
  return proxy;
}

const BASE_ROOM={hero:'dragon',plats:[[0,1134,9600,126]],foes:[],orbs:[],seal:{stations:[],altar:{x:9080,y:1134}},hazards:[],width:9600};

// ── 1. Ruta de 14400px ───────────────────────────────────────────────────────
test('dragon-v611: ruta 14400px', ()=>{
  const room=authorDragonEncounters({...BASE_ROOM});
  assert.equal(room.width, 14400);
  assert.equal(room.dragonEncounterVersion, 611);
});

// ── 2. Tres abismos de lava ──────────────────────────────────────────────────
test('dragon-v611: tres abismos de lava', ()=>{
  const room=authorDragonEncounters({...BASE_ROOM});
  assert.equal(room.hazards.length, 3);
  for(const h of room.hazards){
    assert.equal(h.type,'death');
    assert.ok(h.x > 0 && h.x < 14400);
  }
});

// ── 3. Cuatro braseros ancestrales ───────────────────────────────────────────
test('dragon-v611: cuatro braseros ancestrales', ()=>{
  const room=authorDragonEncounters({...BASE_ROOM});
  const braziers=room.seal.stations.filter(s=>s.kind==='brazier');
  assert.equal(braziers.length, 4);
  assert.deepStrictEqual(braziers.map(b=>b.order), [0,1,2,3]);
  assert.ok(braziers[0].x < braziers[1].x && braziers[1].x < braziers[2].x && braziers[2].x < braziers[3].x, 'braseros en orden oeste → este');
});

// ── 4. Cuatro corrientes térmicas ────────────────────────────────────────────
test('dragon-v611: corrientes térmicas definidas', ()=>{
  assert.equal(DRAGON_THERMALS_V611.length, 4);
  for(const t of DRAGON_THERMALS_V611){
    assert.ok(t.x > 0);
    assert.ok(t.h > 300);
  }
});

// ── 5. Cinco especies con roles canónicos ────────────────────────────────────
test('dragon-v611: cast 5 especies con roles canónicos', ()=>{
  const room=authorDragonEncounters({...BASE_ROOM});
  const foes=room.foes.filter(f=>f[4]?.dragonEncounter);
  const roles=new Set(foes.map(f=>f[4].role));
  const species=new Set(foes.map(f=>f[2]));
  for(const r of ['pursuer','jumper','shield','shooter','flyer'])assert.ok(roles.has(r),'falta rol: '+r);
  for(const s of ['escoria','brasita','planta','rana','murcielago'])assert.ok(species.has(s),'falta especie: '+s);
});

// ── 6. Enemigos dentro del terreno (grupos 0-2) ──────────────────────────────
test('dragon-v611: enemigos en x > 900 y x < 8100', ()=>{
  const room=authorDragonEncounters({...BASE_ROOM});
  for(const f of room.foes.filter(d=>d[4]?.dragonEncounter && [0,1,2].includes(d[4]?.authoredEncounter))){
    assert.ok(f[0]>900,'x debe ser > 900: '+f[0]);
    assert.ok(f[0]<8100,'x debe ser < 8100: '+f[0]);
  }
});

// ── 7. Orbes de esencia ígnea ───────────────────────────────────────────────
test('dragon-v611: al menos 12 orbes', ()=>{
  const room=authorDragonEncounters({...BASE_ROOM});
  assert.ok(room.orbs.length >= 12, 'se esperan ≥12 orbes: '+room.orbs.length);
});

// ── 8. Boss ID y arena ───────────────────────────────────────────────────────
test('dragon-v611: DRAGON_CHAPTER_BOSS_ID y DRAGON_CHAPTER_ARENA', ()=>{
  assert.equal(DRAGON_CHAPTER_BOSS_ID,'w1-dragon-igneous-v1');
  assert.ok(DRAGON_CHAPTER_ARENA.left < DRAGON_CHAPTER_ARENA.right);
  assert.ok(DRAGON_CHAPTER_ARENA.hp > 0);
});

// ── 9. dragonGrowth no rompe XP_NEED ─────────────────────────────────────────
test('dragon-v611: dragonGrowth respeta XP_NEED canónico', async()=>{
  const {XP_NEED}=await import('../systems/xp.js');
  assert.deepStrictEqual(XP_NEED, [0,55,140,260,420]);

  function mkG(doneN,bossDefeated,sealed){
    const stations=DRAGON_BRAZIERS_V611.map((p,i)=>({...p,done:i<doneN}));
    return {
      roomDef:{id:'w1-dragon',growthChapter:'dragon'},
      world1:{stations,sealed},
      player:{xp:0},
      clearedEncounters:bossDefeated?{'w1-dragon':[DRAGON_CHAPTER_BOSS_ID]}:{},
      world1Seals:[]
    };
  }
  assert.equal(dragonGrowth(mkG(0,false,false)), XP_NEED[0]);
  assert.equal(dragonGrowth(mkG(1,false,false)), XP_NEED[1]);
  assert.equal(dragonGrowth(mkG(2,false,false)), XP_NEED[2]);
  assert.equal(dragonGrowth(mkG(3,false,false)), XP_NEED[3]);
  assert.equal(dragonGrowth(mkG(4,true,false)),  XP_NEED[4]);
});

// ── 10. Arte vectorial: sin errores de invocación ────────────────────────────
test('dragon-v611: drawDragonBrazier no lanza excepciones', ()=>{
  const ctx=makeCtx();
  const s={x:2000,y:1134,kind:'brazier',order:0,done:false};
  assert.doesNotThrow(()=>drawDragonBrazier(ctx,s,{x:0,y:0},60,false));
  assert.doesNotThrow(()=>drawDragonBrazier(ctx,{...s,done:true},{x:0,y:0},60,false));
});

test('dragon-v611: drawDragonThermal no lanza excepciones', ()=>{
  const ctx=makeCtx();
  assert.doesNotThrow(()=>drawDragonThermal(ctx,DRAGON_THERMALS_V611[0],{x:0,y:0},0,false));
});

test('dragon-v611: drawDragonAtmosphere no lanza excepciones', ()=>{
  const ctx=makeCtx();
  const g={roomDef:{id:'w1-dragon',growthChapter:'dragon'},world1:{tick:0},viewW:1280,reduceMotion:false};
  assert.doesNotThrow(()=>drawDragonAtmosphere(ctx,g,{x:0,y:0},0,false));
});

test('dragon-v611: drawDragonCreature cubre las 5 especies', ()=>{
  const ctx=makeCtx();
  const base={x:0,y:0,w:48,h:48,facing:1,roomId:'w1-dragon'};
  for(const kind of ['escoria','brasita','planta','rana','murcielago']){
    assert.doesNotThrow(()=>drawDragonCreature(ctx,{...base,kind},0,false),`falla: ${kind}`);
  }
});

// ── 11. dragonChapterReady sin sala dragon → true ────────────────────────────
test('dragon-v611: dragonChapterReady fuera de sala dragon', ()=>{
  assert.equal(dragonChapterReady({roomDef:{id:'w1-kilo'},world1Seals:[]}), true);
});

// ── 12. drawDragonBossSignals no lanza excepciones ───────────────────────────
test('dragon-v611: drawDragonBossSignals no lanza excepciones', ()=>{
  const ctx=makeCtx();
  const e={
    _dragonBoss:true,x:8500,y:1034,w:124,h:100,hp:400,max:480,
    _igneousDragon:{phase:'warn',attack:0,tier:1,aim:1}
  };
  assert.doesNotThrow(()=>drawDragonBossSignals(ctx,e,{x:8000,y:0},60,false));
});
