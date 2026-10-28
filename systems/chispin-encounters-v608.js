// V608 · Santuario del Trueno de Chispín: ruta canónica de 14400, antenas sagradas,
// arcos eléctricos y fauna voltaica de 5 especies con roles y leashes definidos.
import {CHISPIN_CHAPTER_BOSS_ID,CHISPIN_CHAPTER_ARENA,CHISPIN_CHAPTER_GATES} from './chispin-chapter.js';
const FLOOR=1134;

export const CHISPIN_ANTENNAS_V608=Object.freeze([
 {id:0,x:2160,y:FLOOR,kind:'rod',name:'Antena I · Pararrayos del Umbral',lesson:'Conecta el pararrayos con contacto o pulsa J. Comienza a despertar el templo.'},
 {id:1,x:3760,y:FLOOR,kind:'rod',name:'Antena II · Bobina de las Nubes',lesson:'Cruza el primer arco voltaico usando J para cortocircuitarlo o K para atravesarlo en rayo.'},
 {id:2,x:5360,y:FLOOR,kind:'rod',name:'Antena III · Conductor de Tormenta',lesson:'La red gana potencia. Las gaviotas y avispas coordinan ataques aéreos en el puente.'},
 {id:3,x:7280,y:FLOOR,kind:'rod',name:'Antena IV · Cúspide del Arcoíris',lesson:'Última antena de la red. Sincroniza el cielo y abre la cámara del Titán de Trueno.'}
].map(Object.freeze));

const CAST_ROLES=Object.freeze({
 gaviota:'flyer',
 murcielago:'jumper',
 phosquito:'gunner',
 rana:'shield',
 avispa:'pursuer'
});

export function authorChispinEncounters(room){
 if(room.hero!=='chispin')return room;
 room.chispinEncounterVersion=608;room.width=14400;

 // Sincronizar estaciones con las 4 antenas canónicas
 room.seal.stations=CHISPIN_ANTENNAS_V608.map(a=>({...a}));
 room.seal.altar={x:13920,y:FLOOR};

 // Almacenar geometría y referencias V608
 room.chispinGates=CHISPIN_CHAPTER_GATES;
 room.chispinArena=CHISPIN_CHAPTER_ARENA;

 // ── Terreno ────────────────────────────────────────────────────────────
 // Suelo continuo sin desniveles para garantizar que el dash de Chispín
 // y el blink (K) nunca tropiecen con esquinas verticales en el piso.
 const floor=[[0,FLOOR,9600,126],[9600,FLOOR,4800,126]];

 const banks=[
  [1120,260,54],[2400,240,68],[3300,280,76],[4100,260,82],[5000,280,90],
  [5900,260,72],[6800,280,88],[7700,250,78],[8150,270,84]
 ];
 room.terraces=banks.map(([x,w,rise])=>({x,w,y:FLOOR-rise,rise}));

 // Pasarelas de mármol, acueductos y cornisas del santuario (todas plataformas pasantes elevadas)
 const shelves=[
  // Sector 0 · Entrada del umbral
  [1350,1034,200],[1650,944,220],
  // Sector 1 · Aproximación a Antena 0 y Arco 0
  [2350,1044,200],[2600,954,210],[3150,1034,200],[3450,944,220],
  // Sector 2 · Pasajes de la segunda antena y Arco 1
  [4050,1034,200],[4300,934,210],[4650,1034,200],[4950,934,220],
  // Sector 3 · Acueductos y Arco 2
  [5600,1034,200],[5850,934,210],[6150,834,220],[6450,934,200],
  // Sector 4 · Vía del arcoíris hacia Antena 3
  [7000,1044,200],[7500,944,220],[7850,844,200],
  // Sector 5 · Entrada al Santuario del Titán
  [8350,1024,220],[9150,1024,220]
 ];

 const expPlats=(room.plats||[]).filter(p=>p[0]>=9600&&p[1]<FLOOR);
 room.plats=[...floor,...expPlats,...shelves.map(p=>[...p,22])];

 // Despejar plataformas sobre antenas y arcos para que los saltos/blinks no tengan obstáculos
 for(let i=room.plats.length-1;i>0;i--){
  const [px,py,pw]=room.plats[i];
  if(py<FLOOR){
   const overAntenna=room.seal.stations.some(st=>px<st.x+90&&px+pw>st.x-90);
   const overGate=CHISPIN_CHAPTER_GATES.some(g=>px<g.x+g.w+80&&px+pw>g.x-80);
   if(overAntenna||overGate)room.plats.splice(i,1);
  }
 }

 // ── Fauna y Encuentros ──────────────────────────────────────────────────
 // 5 especies con roles diferenciados: gaviota (flyer), murcielago (jumper),
 // phosquito (gunner), rana (shield), avispa (pursuer).
 const cast=[
  // ─ Grupo 0 (Act 0: Entrada -> Antena 0, x: 980 - 2750) ─
  [1200,'avispa',48,0],
  [1750,'gaviota',54,0],
  [2350,'phosquito',52,0],
  [2650,'rana',62,0],

  // ─ Grupo 1 (Act 1: Arco 0 -> Antena 1, x: 3100 - 4350) ─
  [3150,'murcielago',78,1],
  [3500,'avispa',82,1],
  [3950,'phosquito',86,1],
  [4300,'gaviota',90,1],

  // ─ Grupo 2 (Act 2: Arco 1 -> Antena 2, x: 4900 - 6150) ─
  [4950,'rana',112,2],
  [5300,'avispa',116,2],
  [5750,'murcielago',120,2],
  [6100,'gaviota',114,2],

  // ─ Grupo 3 (Act 3: Arco 2 -> Antena 3, x: 6700 - 7900) ─
  [6750,'rana',138,3],
  [7100,'phosquito',142,3],
  [7450,'murcielago',146,3],
  [7850,'avispa',148,3],

  // ─ Pre-arena sentinels (Antes del Titán) ─
  [8150,'gaviota',156,4],
  [8220,'rana',158,4]
 ];

 const expFoes=(room.foes||[]).filter(f=>f[4]?.expedition).map(f=>{
  const [x,y,kind,boss,data]=f;
  return [x,y,kind,boss,{...data,homeX:data.homeX??x,leash:data.leash??{left:Math.max(9000,x-400),right:Math.min(14200,x+400)}}];
 });

 const authored=cast.map(([x,kind,hp,stage],i)=>{
  const role=CAST_ROLES[kind],air=role==='flyer'||role==='gunner';
  const support=FLOOR;
  const y=air?(stage===1?740:stage===2?800:support-210):support-40;
  return [x,y,kind,false,{
   role,chapterHP:hp,variant:i%3,
   name:{gaviota:'Gaviota de tormenta',murcielago:'Murciélago voltaico',phosquito:'Phosquito relámpago',rana:'Rana de trueno',avispa:'Avispa voltaica'}[kind],
   chispinEncounter:true,stage,authoredEncounter:stage,
   anchorFloor:air?undefined:support,anchorY:y,homeX:x,
   leash:{left:Math.max(600,x-420),right:Math.min(13800,x+460)},
   flightBand:air?{top:y-150,bottom:y+220}:undefined
  }];
 });

 room.foes=[...authored,...expFoes];

 // ── Orbes de energía del santuario ──────────────────────────────────────
 room.orbs=[];
 for(const [x,y] of [
  [700,1089],[880,1089],[1420,989],[1720,898],
  [2220,1089],[2680,910],[3220,989],[3520,898],
  [4120,989],[4380,889],[4720,989],[5020,889],
  [5680,989],[5920,889],[6220,789],[6520,889],
  [7080,989],[7580,898],[7920,798],[8420,974]
 ])room.orbs.push([x,y]);

 return room;
}
