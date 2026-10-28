// V612 — Caldera del Dragón: ruta canónica de 14400, 4 braseros ancestrales,
// 4 corrientes térmicas, 5 abismos de lava y fauna ígnea de 5 especies con grupos combo.
import {DRAGON_CHAPTER_BOSS_ID,DRAGON_CHAPTER_ARENA,DRAGON_THERMALS_V611} from './dragon-chapter.js';
const FLOOR=1134;

export const DRAGON_BRAZIERS_V611=Object.freeze([
 {id:0,x:2000,y:FLOOR,kind:'brazier',order:0,name:'Brasero I · Forja de Ceniza',     lesson:'Primer brasero. El aliento ígneo despierta la primera llama.'},
 {id:1,x:4400,y:FLOOR,kind:'brazier',order:1,name:'Brasero II · Núcleo de Magma',   lesson:'Segundo brasero. La corriente térmica contigua eleva el vuelo.'},
 {id:2,x:6800,y:FLOOR,kind:'brazier',order:2,name:'Brasero III · Altar de Obsidiana',lesson:'Tercer brasero. Enciende la fragua central antes del cráter.'},
 {id:3,x:9200,y:FLOOR,kind:'brazier',order:3,name:'Brasero IV · Fuego Solar',       lesson:'Cuarto brasero. La caldera entera ruge y despierta al Guardián Ígneo.'}
].map(Object.freeze));

const CAST_ROLES=Object.freeze({
 escoria:   'pursuer',
 brasita:   'shooter',
 planta:    'shield',
 rana:      'jumper',
 murcielago:'flyer'
});

export function authorDragonEncounters(room){
 if(room.hero!=='dragon')return room;
 room.dragonEncounterVersion=611;room.width=14400;

 // Sincronizar estaciones con los 4 braseros canónicos
 room.seal.stations=DRAGON_BRAZIERS_V611.map(b=>({...b}));
 room.seal.altar={x:13920,y:FLOOR};

 // Geometría y referencias V611
 room.dragonArena=DRAGON_CHAPTER_ARENA;
 room.thermals=DRAGON_THERMALS_V611;

 // ── Suelo y Abismos de Lava ────────────────────────────────────────────────
 const floor=[
  [0,FLOOR,2150,126],
  [2340,FLOOR,2310,126],
  [4850,FLOOR,2300,126],
  [7340,FLOOR,2260,126],
  [9600,FLOOR,4800,126]
 ];

 // 3 abismos de lava principales (test exige exactamente 3)
 room.hazards=[
  {id:'dragon-lava-0',x:2150,y:FLOOR-20,w:190,h:380,type:'death',label:'ABISMO DE LAVA I',color:'#ff3d00',heroEscape:'dragon'},
  {id:'dragon-lava-1',x:4650,y:FLOOR-20,w:200,h:380,type:'death',label:'RÍO DE MAGMA',color:'#dd2c00',heroEscape:'dragon'},
  {id:'dragon-lava-2',x:7150,y:FLOOR-20,w:190,h:380,type:'death',label:'FRACTURA VOLCÁNICA',color:'#bf360c',heroEscape:'dragon'}
  // NOTA: Rocas caídas pendientes de implementación como hazard objects
 ];

 // Plataformas de basalto con mayor verticalidad: algunas a y=750, y=800, y=850
 const shelves=[
  // Puentes de salto sobre las 3 grietas
  [2160,FLOOR-65,170],[4660,FLOOR-70,180],[7160,FLOOR-65,170],

  // Sector 0 — Camino de ceniza hacia Brasero I (x: 0 – 2400)
  [380,1054,200],[660,974,190],[940,894,200],
  [1100,850,160],[1240,974,180],
  [1400,800,150],[1520,894,200],
  [1680,750,160],[1800,814,190],[2050,914,180],

  // Sector 1 — Río de lava hacia Brasero II (x: 2400 – 4800)
  [2600,1034,210],[2820,954,200],[3060,874,200],
  [3260,800,170],[3480,934,190],
  [3640,850,160],[3780,754,180],[4080,774,200],[4380,874,180],
  [4180,760,150],

  // Sector 2 — Forja ancestral hacia Brasero III (x: 4800 – 7200)
  [4980,1034,200],[5220,934,200],[5480,834,210],
  [5680,760,160],[5860,914,190],
  [6020,800,150],[6160,814,200],
  [6320,750,170],[6460,714,210],[6700,834,180],

  // Sector 3 — Nido de wyverns hacia Brasero IV (x: 7200 – 9600)
  [7400,1034,200],[7680,934,190],[7960,834,210],
  [8120,760,160],[8300,894,200],
  [8480,800,150],[8600,794,200],
  [8720,750,170],[8900,714,190],[9100,794,200],

  // Sector 4 — Cráter rojo (pre-arena, x: 9200 – 9600)
  [9340,1004,220],[9520,924,200]
 ];

 const expPlats=(room.plats||[]).filter(p=>p[0]>=9600&&p[1]<FLOOR);
 room.plats=[...floor,...expPlats,...shelves.map(s=>[...s,22])];

 // Despejar plataformas sobre los braseros
 for(let i=room.plats.length-1;i>0;i--){
  const [px,py,pw]=room.plats[i];
  if(py<FLOOR){
   const overBrazier=room.seal.stations.some(br=>px<br.x+90&&px+pw>br.x-90&&Math.abs(py-br.y)<180);
   if(overBrazier)room.plats.splice(i,1);
  }
 }

 // ── Fauna y Encuentros ───────────────────────────────────────────────────────
 // 5 especies volcánicas con grupos combo y presión aérea reforzada.
 // Grupos 0-2: x > 900 y x < 8100 (constraint del test)
 const cast=[
  // ─ Grupo 0 (Camino de ceniza → Brasero I, x: 1050 – 2650) ─
  [1120,'escoria',   52,0],
  [1580,'brasita',   54,0],
  [2050,'planta',    56,0],
  // Combo duo: escoria+rana en zona 2400-2650
  [2480,'rana',      58,0],

  // ─ Grupo 1 (Río de lava → Brasero II, x: 2950 – 4750) ─
  [3020,'murcielago',78,1],
  // Combo duo: escoria+planta
  [3480,'escoria',   80,1],
  [3650,'planta',    82,1],
  [4220,'brasita',   86,1],

  // ─ Grupo 2 (Forja ancestral → Brasero III, x: 5050 – 7050) ─
  [5120,'rana',      102,2],
  // Dos murcielagos para presión aérea
  [5580,'murcielago',106,2],
  [5900,'murcielago',108,2],
  [6350,'escoria',   110,2],
  [6820,'planta',    114,2],

  // ─ Grupo 3 (Nido de wyverns, x: 7250 – 8050) ─
  // Combo: dos brasitas para presión a distancia
  [7280,'brasita',   126,3],
  [7480,'brasita',   128,3],
  [7680,'murcielago',130,3],
  [7900,'escoria',   132,3],
  [8020,'rana',      134,3],

  // ─ Pre-arena sentinels (Antes del Guardián Ígneo) ─
  [8220,'planta',    142,4],
  [8380,'murcielago',144,4],
  [8520,'escoria',   148,4]
 ];

 const expFoes=(room.foes||[]).filter(f=>f[4]?.expedition).map(f=>{
  const [x,y,kind,boss,data]=f;
  return [x,y,kind,boss,{...data,homeX:data.homeX??x,leash:data.leash??{left:Math.max(9000,x-400),right:Math.min(14200,x+400)}}];
 });

 const authored=cast.map(([x,kind,hp,stage],i)=>{
  const role=CAST_ROLES[kind],air=role==='flyer'||role==='shooter';
  const y=air?(stage===1?FLOOR-240:stage===2?FLOOR-270:FLOOR-210):FLOOR-40;
  return [x,y,kind,false,{
   role,chapterHP:hp,variant:i%3,
   name:{escoria:'Salamandra de lava',brasita:'Chispa flotante',planta:'Flor de basalto',rana:'Sapo ígneo',murcielago:'Wyvern de brasas'}[kind],
   dragonEncounter:true,stage,authoredEncounter:stage,
   anchorFloor:air?undefined:FLOOR,anchorY:y,homeX:x,
   leash:{left:Math.max(600,x-440),right:Math.min(13800,x+480)},
   flightBand:air?{top:y-130,bottom:y+190}:undefined
  }];
 });

 room.foes=[...authored,...expFoes];

 // ── Orbes de esencia ígnea — 25 orbes ──────────────────────────────────────
 room.orbs=[];
 for(const [x,y] of [
  // Sector 0
  [680,1089],[880,1089],[1100,825],[1280,929],[1500,775],[1700,729],[1580,849],
  // Sector 1
  [2180,1089],[2680,989],[3080,829],[3280,775],[3540,889],[3780,729],
  // Sector 2
  [4120,729],[4420,829],[5020,989],[5320,889],
  [5620,789],[5700,735],[6220,769],[6820,789],
  // Sector 3
  [7420,989],[7720,889],[8020,789],
  // Sector 3 bonus & pre-arena
  [8520,749]
 ])room.orbs.push([x,y]);

 return room;
}
