// V610 — Bosque Prisma de Cuerno: test de calidad del capítulo
import {strict as assert} from 'assert';
import {test} from 'node:test';

// ── Encounters ───────────────────────────────────────────────────────────────
import {authorCuernoEncounters,CUERNO_PRISMS_V610} from '../systems/cuerno-encounters-v610.js';
import {DAWN_MIRROR,CUERNO_CHAPTER_BOSS_ID,CUERNO_CHAPTER_ARENA,cuernoGrowth,updateCuernoChapter,cuernoChapterReady,cuernoObjective,drawCuernoChapter} from '../systems/cuerno-chapter.js';
import {drawCuernoPrism,drawCuernoDawnMirror,drawCuernoAtmosphere,drawCuernoCreature} from '../systems/cuerno-chapter-art-v610.js';

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

const BASE_ROOM={hero:'cuerno',plats:[[0,1134,9600,126]],foes:[],orbs:[],seal:{stations:[],altar:{x:9080,y:1134}},hazards:[],width:9600};

// ── 1. Ruta de 14400px ───────────────────────────────────────────────────────
test('cuerno-v610: ruta 14400px', ()=>{
  const room=authorCuernoEncounters({...BASE_ROOM});
  assert.equal(room.width, 14400);
  assert.equal(room.cuernoEncounterVersion, 610);
});

// ── 2. Tres grietas de cristal ───────────────────────────────────────────────
test('cuerno-v610: tres grietas de cristal', ()=>{
  const room=authorCuernoEncounters({...BASE_ROOM});
  assert.equal(room.hazards.length, 3);
  for(const h of room.hazards){
    assert.equal(h.type,'death');
    assert.ok(h.x > 0 && h.x < 14400);
  }
});

// ── 3. Tres prismas canónicos ────────────────────────────────────────────────
test('cuerno-v610: tres estaciones prism', ()=>{
  const room=authorCuernoEncounters({...BASE_ROOM});
  const prisms=room.seal.stations.filter(s=>s.kind==='prism');
  assert.equal(prisms.length, 3);
  assert.deepStrictEqual(prisms.map(p=>p.order), [0,1,2]);
  assert.ok(prisms[0].x < prisms[1].x && prisms[1].x < prisms[2].x, 'prismas en orden oeste → este');
});

// ── 4. Espejo del Alba ────────────────────────────────────────────────────────
test('cuerno-v610: DAWN_MIRROR definido', ()=>{
  assert.equal(DAWN_MIRROR.id,'w1-cuerno-dawn-mirror-v1');
  assert.ok(DAWN_MIRROR.x > 0);
});

// ── 5. Cinco especies con anatomías visibles ──────────────────────────────────
test('cuerno-v610: cast 5 especies con roles canónicos', ()=>{
  const room=authorCuernoEncounters({...BASE_ROOM});
  const foes=room.foes.filter(f=>f[4]?.cuernoEncounter);
  const roles=new Set(foes.map(f=>f[4].role));
  const species=new Set(foes.map(f=>f[2]));
  for(const r of ['pursuer','jumper','shield','shooter','flyer'])assert.ok(roles.has(r),'falta rol: '+r);
  for(const s of ['arana','murcielago','cangrejo','planta','libelula'])assert.ok(species.has(s),'falta especie: '+s);
});

// ── 6. Enemigos dentro del terreno (grupos 0-2) ──────────────────────────────
test('cuerno-v610: enemigos en x > 900 y x < 8100', ()=>{
  const room=authorCuernoEncounters({...BASE_ROOM});
  for(const f of room.foes.filter(d=>d[4]?.cuernoEncounter && [0,1,2].includes(d[4]?.authoredEncounter))){
    assert.ok(f[0]>900,'x debe ser > 900: '+f[0]);
    assert.ok(f[0]<8100,'x debe ser < 8100: '+f[0]);
  }
});

// ── 7. Orbes de aurora ───────────────────────────────────────────────────────
test('cuerno-v610: al menos 12 orbes de aurora', ()=>{
  const room=authorCuernoEncounters({...BASE_ROOM});
  assert.ok(room.orbs.length >= 12, 'se esperan ≥12 orbes: '+room.orbs.length);
});

// ── 8. BOSS ID y arena ───────────────────────────────────────────────────────
test('cuerno-v610: CUERNO_CHAPTER_BOSS_ID y CUERNO_CHAPTER_ARENA', ()=>{
  assert.equal(CUERNO_CHAPTER_BOSS_ID,'w1-cuerno-prism-v1');
  assert.ok(CUERNO_CHAPTER_ARENA.left < CUERNO_CHAPTER_ARENA.right);
  assert.ok(CUERNO_CHAPTER_ARENA.hp > 0);
});

// ── 9. cuernoGrowth no rompe XP_NEED ─────────────────────────────────────────
test('cuerno-v610: cuernoGrowth respeta XP_NEED canónico', async()=>{
  const {XP_NEED}=await import('../systems/xp.js');
  assert.deepStrictEqual(XP_NEED, [0,55,140,260,420]);

  function mkG(doneN,mirrorDone,bossDefeated,sealed){
    const stations=CUERNO_PRISMS_V610.map((p,i)=>({...p,done:i<doneN}));
    return {
      roomDef:{id:'w1-cuerno',growthChapter:'cuerno'},
      world1:{stations,sealed},
      player:{xp:0},
      secrets:mirrorDone?{'w1-cuerno':[DAWN_MIRROR.id]}:{},
      clearedEncounters:bossDefeated?{'w1-cuerno':[CUERNO_CHAPTER_BOSS_ID]}:{},
      world1Seals:[]
    };
  }
  assert.equal(cuernoGrowth(mkG(0,false,false,false)), XP_NEED[0]);
  assert.equal(cuernoGrowth(mkG(0,true,false,false)),  XP_NEED[1]);
  assert.equal(cuernoGrowth(mkG(1,true,false,false)),  XP_NEED[2]);
  assert.equal(cuernoGrowth(mkG(2,true,false,false)),  XP_NEED[3]);
  assert.equal(cuernoGrowth(mkG(3,true,true,false)),   XP_NEED[4]);
});

// ── 10. Arte vectorial: sin errores de invocación ────────────────────────────
test('cuerno-v610: drawCuernoPrism no lanza excepciones', ()=>{
  const ctx=makeCtx();
  const s={x:2400,y:1134,kind:'prism',order:0,done:false};
  assert.doesNotThrow(()=>drawCuernoPrism(ctx,s,{x:0,y:0},60,false));
  assert.doesNotThrow(()=>drawCuernoPrism(ctx,{...s,done:true},  {x:0,y:0},60,false));
});

test('cuerno-v610: drawCuernoDawnMirror no lanza excepciones', ()=>{
  const ctx=makeCtx();
  assert.doesNotThrow(()=>drawCuernoDawnMirror(ctx,DAWN_MIRROR,{x:0,y:0},0,false,false));
  assert.doesNotThrow(()=>drawCuernoDawnMirror(ctx,DAWN_MIRROR,{x:0,y:0},0,false,true));
});

test('cuerno-v610: drawCuernoAtmosphere no lanza excepciones', ()=>{
  const ctx=makeCtx();
  const g={roomDef:{id:'w1-cuerno',growthChapter:'cuerno'},world1:{tick:0},viewW:1280,reduceMotion:false};
  assert.doesNotThrow(()=>drawCuernoAtmosphere(ctx,g,{x:0,y:0},0,false));
});

test('cuerno-v610: drawCuernoCreature cubre las 5 especies', ()=>{
  const ctx=makeCtx();
  const base={x:0,y:0,w:48,h:48,facing:1};
  for(const kind of ['arana','murcielago','cangrejo','planta','libelula']){
    assert.doesNotThrow(()=>drawCuernoCreature(ctx,{...base,kind},0,false),`falla: ${kind}`);
  }
});

// ── 11. cuernoChapterReady sin sala cuerno → true ────────────────────────────
test('cuerno-v610: cuernoChapterReady fuera de sala cuerno', ()=>{
  assert.equal(cuernoChapterReady({roomDef:{id:'w1-kilo'},world1Seals:[]}), true);
});
