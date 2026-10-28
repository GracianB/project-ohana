// V609 — Jardín Lunar de Michi: ruta canónica de 14400, medusas sagradas,
// nieblas astrales y fauna lunar de 5 especies con roles y leashes definidos.
import {MICHI_CHAPTER_BOSS_ID,MICHI_CHAPTER_ARENA} from './cat-chapter.js';
const FLOOR=1134;

export const CAT_JELLIES_V609=Object.freeze([
 {id:0,x:1680,y:FLOOR-220,kind:'jelly',name:'Medusa I · Faroluna del Umbral',   lesson:'Salta hacia la medusa dormida en el aire para despertarla. Se convierte en plataforma y apoyo.'},
 {id:1,x:3360,y:FLOOR-280,kind:'jelly',name:'Medusa II · Linterna del Estanque', lesson:'Alcánzala con un doble salto. Cada medusa despertada añade XP y abre nuevas rutas de vuelo.'},
 {id:2,x:5040,y:FLOOR-340,kind:'jelly',name:'Medusa III · Velo del Sueño',       lesson:'La niebla astral bloquea el paso; despierta la medusa para disiparlo. J lanza el ovillo a distancia.'},
 {id:3,x:6720,y:FLOOR-400,kind:'jelly',name:'Medusa IV · Espejo de Estrellas',   lesson:'Cuarta medusa. La red lunar se refuerza; los guardianes coordinan ataques aéreos en parejas.'},
 {id:4,x:8100,y:FLOOR-460,kind:'jelly',name:'Medusa V · Corazón del Altar',      lesson:'Última medusa del jardín. Las cinco despiertas abren la cámara del Oráculo Medusaluna.'}
].map(Object.freeze));

const CAST_ROLES=Object.freeze({
 medusa:   'flyer',
 phosquito:'gunner',
 ufo:      'shield',
 murcielago:'jumper',
 arana:    'pursuer'
});

export function authorCatEncounters(room){
 if(room.hero!=='cat')return room;
 room.catEncounterVersion=609;room.width=14400;

 // Sincronizar estaciones con las 5 medusas canónicas
 room.seal.stations=CAT_JELLIES_V609.map(a=>({...a}));
 room.seal.altar={x:13920,y:FLOOR};

 // Almacenar geometría y referencias V609
 room.catArena=MICHI_CHAPTER_ARENA;

 // ── Terreno y Pozos Astrales ────────────────────────────────────────────────
 // Suelo con tres pozos de niebla astral que exigen saltos de precisión y acrobacias,
 // más la zona de expedición continua (9600-14400) para V2 Adventure.
 const floor=[
  [0,FLOOR,2200,126],
  [2380,FLOOR,2100,126],
  [4670,FLOOR,2300,126],
  [7150,FLOOR,2450,126],
  [9600,FLOOR,4800,126]
 ];

 // Pozos y abismos lunares con niebla gravitatoria
 room.hazards=[
  {id:'cat-pit-1',x:2200,y:FLOOR-20,w:180,h:380,type:'death',label:'POZO DE NIEBLA ASTRAL',color:'#c495ff'},
  {id:'cat-pit-2',x:4480,y:FLOOR-20,w:190,h:380,type:'death',label:'ABISMO DEL ECLIPSE',color:'#9b64f2'},
  {id:'cat-pit-3',x:6970,y:FLOOR-20,w:180,h:380,type:'death',label:'VÓRTICE ESTELAR',color:'#7adbe5'}
 ];

 // Trampas de seda astral y niebla espesa (se disipan con J o K)
 room.catTraps=[
  {id:0,x:2740,y:FLOOR-70,w:90,h:70,name:'Telaraña del Velo I'},
  {id:1,x:5340,y:FLOOR-70,w:90,h:70,name:'Telaraña del Velo II'},
  {id:2,x:7540,y:FLOOR-70,w:90,h:70,name:'Telaraña del Velo III'}
 ];

 // Plataformas de cristal lunar y cornisas flotantes sobre los pozos y terrazas
 const shelves=[
  // Cornisas de paso y trampolines sobre los tres pozos astrales
  [2210,FLOOR-60,160],[4490,FLOOR-68,170],[6980,FLOOR-64,160],

  // Sector 0 — Umbral del sueño (x: 0 – 2400)
  [340,1054,200],[580,974,180],[840,894,200],
  [1100,974,180],[1400,894,200],[1700,814,180],
  [2050,894,200],[2300,814,200],

  // Sector 1 — Estanque de lunas (x: 2400 – 4800)
  [2550,1034,200],[2800,954,200],[3100,874,200],
  [3420,934,180],[3700,854,200],[4000,774,200],
  [4300,854,180],[4600,774,180],

  // Sector 2 — Bosque de medusas (x: 4800 – 7200)
  [4900,1034,200],[5150,934,200],[5450,834,200],
  [5750,914,180],[6050,814,200],[6350,714,200],
  [6650,794,180],[6950,714,180],

  // Sector 3 — Observatorio gatuno (x: 7200 – 9600)
  [7200,1034,200],[7500,934,180],[7800,834,200],
  [8100,894,200],[8400,794,200],[8700,714,180],
  [8950,774,200],[9200,694,200],

  // Sector 4 — Altar del sueño (pre-arena, x: 9200 – 9600)
  [9300,1004,220],[9480,924,200]
 ];

 const expPlats=(room.plats||[]).filter(p=>p[0]>=9600&&p[1]<FLOOR);
 room.plats=[...floor,...expPlats,...shelves.map(s=>[...s,22])];

 // Despejar plataformas sobre las medusas para que los saltos aéreos no las tapen
 for(let i=room.plats.length-1;i>0;i--){
  const [px,py,pw]=room.plats[i];
  if(py<FLOOR){
   const overJelly=CAT_JELLIES_V609.some(j=>px<j.x+100&&px+pw>j.x-100&&Math.abs(py-j.y)<160);
   if(overJelly)room.plats.splice(i,1);
  }
 }

 // ── Fauna y Encuentros ───────────────────────────────────────────────────────
 // 5 especies: medusa (flyer), phosquito (gunner), ufo (gunner),
 // murcielago (jumper), arana (pursuer).
 const cast=[
  // ─ Grupo 0 (Act 0: Umbral → Medusa 0, x: 900 – 2600) ─
  [1050,'arana',    48,0],
  [1550,'murcielago',52,0],
  [2100,'phosquito',54,0],
  [2500,'medusa',   56,0],

  // ─ Grupo 1 (Act 1: Estanque → Medusa 1, x: 2900 – 4700) ─
  [2950,'murcielago',72,1],
  [3300,'arana',    76,1],
  [3750,'ufo',      80,1],
  [4550,'medusa',   82,1],

  // ─ Grupo 2 (Act 2: Bosque → Medusa 2, x: 5100 – 6600) ─
  [5150,'phosquito',100,2],
  [5500,'arana',   104,2],
  [5950,'murcielago',108,2],
  [6450,'medusa',  106,2],

  // ─ Grupo 3 (Act 3: Observatorio → Medusa 3, x: 6900 – 8050) ─
  [6950,'ufo',     124,3],
  [7300,'murcielago',128,3],
  [7700,'phosquito',132,3],
  [7950,'arana',   130,3],

  // ─ Pre-arena sentinels (Antes del Oráculo) ─
  [8200,'medusa',  140,4],
  [8350,'ufo',     142,4],
  [8500,'arana',   144,4],
 ];

 const expFoes=(room.foes||[]).filter(f=>f[4]?.expedition).map(f=>{
  const [x,y,kind,boss,data]=f;
  return [x,y,kind,boss,{...data,homeX:data.homeX??x,leash:data.leash??{left:Math.max(9000,x-400),right:Math.min(14200,x+400)}}];
 });

 const authored=cast.map(([x,kind,hp,stage],i)=>{
  const role=CAST_ROLES[kind],air=role==='flyer'||role==='gunner';
  const y=air?(stage===1?FLOOR-240:stage===2?FLOOR-280:FLOOR-220):FLOOR-40;
  return [x,y,kind,false,{
   role,chapterHP:hp,variant:i%3,
   name:{medusa:'Medusa lunar',phosquito:'Phosquito astral',ufo:'UFO cristalino',murcielago:'Murciélago de nácaro',arana:'Araña del velo'}[kind],
   catEncounter:true,stage,authoredEncounter:stage,
   anchorFloor:air?undefined:FLOOR,anchorY:y,homeX:x,
   leash:{left:Math.max(600,x-440),right:Math.min(13800,x+480)},
   flightBand:air?{top:y-140,bottom:y+200}:undefined
  }];
 });

 room.foes=[...authored,...expFoes];

 // ── Orbes de esencia lunar ──────────────────────────────────────────────────
 room.orbs=[];
 for(const [x,y] of [
  [620,1089],[820,1089],[1160,929],[1460,849],
  [2120,1089],[2620,909],[3180,979],[3480,899],
  [4080,979],[4360,879],[4700,969],[5020,879],
  [5260,889],[5620,769],[6120,749],[6720,749],
  [7300,889],[7680,829],[8080,849],[8780,669]
 ])room.orbs.push([x,y]);

 return room;
}
