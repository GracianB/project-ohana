// V610 — Bosque Prisma de Cuerno: ruta canónica de 14400, Espejo del Alba,
// tres prismas sagrados en alineación I → II → III y fauna de cristal de 5 especies.
import {CUERNO_CHAPTER_BOSS_ID,CUERNO_CHAPTER_ARENA,DAWN_MIRROR} from './cuerno-chapter.js';
const FLOOR=1134;

export const CUERNO_PRISMS_V610=Object.freeze([
 {id:0,x:2400,y:FLOOR,kind:'prism',order:0,name:'Prisma I · Cuarzo de la Aurora',  lesson:'Primer prisma del bosque. La luz del alba refracta su haz hacia el este.'},
 {id:1,x:5200,y:FLOOR,kind:'prism',order:1,name:'Prisma II · Amatista del Eco',    lesson:'Segundo prisma en la secuencia. Alinea su espectro para conectar la red.'},
 {id:2,x:7600,y:FLOOR,kind:'prism',order:2,name:'Prisma III · Esmeralda Celestial',lesson:'Último prisma. La tríada completa enfoca la luz en la arena de la Bestia Prisma.'}
].map(Object.freeze));

const CAST_ROLES=Object.freeze({
 arana:     'pursuer',
 murcielago:'jumper',
 cangrejo:  'shield',
 planta:    'shooter',
 libelula:  'flyer'
});

export function authorCuernoEncounters(room){
 if(room.hero!=='cuerno')return room;
 room.cuernoEncounterVersion=610;room.width=14400;

 // Sincronizar estaciones con los 3 prismas canónicos
 room.seal.stations=CUERNO_PRISMS_V610.map(p=>({...p}));
 room.seal.altar={x:13920,y:FLOOR};

 // Geometría y referencias V610
 room.cuernoArena=CUERNO_CHAPTER_ARENA;
 room.dawnMirror=DAWN_MIRROR;

 // ── Terreno y Grietas de Cristal ───────────────────────────────────────────
 // Suelo principal con tres grietas de luz refractada para saltos acrobáticos
 const floor=[
  [0,FLOOR,2150,126],
  [2330,FLOOR,2220,126],
  [4740,FLOOR,2210,126],
  [7130,FLOOR,2470,126],
  [9600,FLOOR,4800,126]
 ];

 // Abismos de luz refractada y cristales vivientes
 room.hazards=[
  {id:'cuerno-shard-0',x:2150,y:FLOOR-20,w:180,h:380,type:'death',label:'GRIETA DE CRISTAL I',color:'#4527a0',heroEscape:'cuerno'},
  {id:'cuerno-shard-1',x:4550,y:FLOOR-20,w:190,h:380,type:'death',label:'ABISMO DE LA AURORA',color:'#6a1b9a',heroEscape:'cuerno'},
  {id:'cuerno-shard-2',x:6950,y:FLOOR-20,w:180,h:380,type:'death',label:'FRACTURA PRISMÁTICA',color:'#00838f',heroEscape:'cuerno'}
 ];

 // Plataformas de cuarzo, agujas de selenita y cornisas de la arboleda aurora
 const shelves=[
  // Cornisas de salto sobre las 3 grietas
  [2160,FLOOR-60,160],[4560,FLOOR-66,170],[6960,FLOOR-62,160],

  // Sector 0 — Claro de cristal y Espejo del Alba (x: 0 – 2400)
  [360,1054,200],[640,974,190],[920,894,200],
  [1240,974,180],[1520,894,200],[1800,814,190],[2050,914,180],

  // Sector 1 — Arboleda aurora hacia Prisma I (x: 2400 – 4800)
  [2600,1034,210],[2880,954,200],[3160,874,200],
  [3480,934,190],[3780,854,210],[4080,774,200],[4380,874,180],

  // Sector 2 — Espejos del alba hacia Prisma II (x: 4800 – 7200)
  [4980,1034,200],[5260,934,200],[5560,834,210],
  [5860,914,190],[6160,814,200],[6460,714,210],[6760,834,180],

  // Sector 3 — Sendero arcoíris hacia Prisma III (x: 7200 – 9600)
  [7260,1034,200],[7560,934,190],[7860,834,210],
  [8160,894,200],[8460,794,200],[8760,714,190],[9060,794,200],

  // Sector 4 — Altar del prisma (pre-arena, x: 9200 – 9600)
  [9300,1004,220],[9480,924,200]
 ];

 const expPlats=(room.plats||[]).filter(p=>p[0]>=9600&&p[1]<FLOOR);
 room.plats=[...floor,...expPlats,...shelves.map(s=>[...s,22])];

 // Despejar plataformas sobre el Espejo del Alba y los Prismas
 for(let i=room.plats.length-1;i>0;i--){
  const [px,py,pw]=room.plats[i];
  if(py<FLOOR){
   const overMirror=Math.abs(px+pw/2-DAWN_MIRROR.x)<140&&py>FLOOR-160;
   const overPrism=room.seal.stations.some(pr=>px<pr.x+90&&px+pw>pr.x-90&&Math.abs(py-pr.y)<180);
   if(overMirror||overPrism)room.plats.splice(i,1);
  }
 }

 // ── Fauna y Encuentros ───────────────────────────────────────────────────────
 // 5 especies de cristal con anatomías visibles complementarias:
 // arana (pursuer/native), murcielago (jumper/leaper), cangrejo (shield/carapace),
 // planta (shooter/spitter), libelula (flyer/winged).
 const cast=[
  // ─ Grupo 0 (Act 0: Claro de cristal → Prisma I, x: 1050 – 2650) ─
  [1120,'cangrejo',  50,0],
  [1580,'libelula',  52,0],
  [2050,'arana',     54,0],
  [2480,'murcielago',56,0],

  // ─ Grupo 1 (Act 1: Arboleda aurora → Prisma II, x: 2950 – 4750) ─
  [3020,'planta',    76,1],
  [3480,'libelula',  78,1],
  [3950,'cangrejo',  82,1],
  [4420,'arana',     84,1],

  // ─ Grupo 2 (Act 2: Espejos del alba → Prisma III, x: 5050 – 6850) ─
  [5120,'murcielago',102,2],
  [5580,'planta',    106,2],
  [6050,'libelula',  110,2],
  [6520,'cangrejo',  112,2],

  // ─ Grupo 3 (Act 3: Sendero arcoíris, x: 7150 – 8050) ─
  [7220,'arana',     126,3],
  [7520,'libelula',  128,3],
  [7780,'planta',    132,3],
  [8020,'murcielago',134,3],

  // ─ Pre-arena sentinels (Antes de la Bestia Prisma) ─
  [8220,'cangrejo',  142,4],
  [8380,'libelula',  144,4],
  [8520,'arana',     146,4]
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
   name:{cangrejo:'Escarabajo de cristal',libelula:'Libélula prisma',arana:'Araña de cuarzo',murcielago:'Murciélago aurora',planta:'Flor de prisma'}[kind],
   cuernoEncounter:true,stage,authoredEncounter:stage,
   anchorFloor:air?undefined:FLOOR,anchorY:y,homeX:x,
   leash:{left:Math.max(600,x-440),right:Math.min(13800,x+480)},
   flightBand:air?{top:y-130,bottom:y+190}:undefined
  }];
 });

 room.foes=[...authored,...expFoes];

 // ── Orbes de esencia de aurora ──────────────────────────────────────────────
 room.orbs=[];
 for(const [x,y] of [
  [680,1089],[880,1089],[1280,929],[1580,849],
  [2180,1089],[2680,989],[3220,829],[3540,889],
  [4120,729],[4420,829],[5020,989],[5320,889],
  [5620,789],[6220,769],[6820,789],[7320,989],
  [7620,889],[7920,789],[8520,749],[8820,669]
 ])room.orbs.push([x,y]);

 return room;
}
