// V607 · A single authored route replaces the overlapping encounter generators
// in Stitcho. Same pattern as kilo-encounters-v606.js for the Claro.
// Other chapters keep their accepted layouts and growth rules.
import {STITCHO_CHAPTER_BOSS_ID,STITCHO_CHAPTER_ARENA,STITCHO_RAIL} from './stitcho-chapter.js';
const FLOOR=1134;

// Three authored workshops replace generic seal stations.
// Workshop 0: dock motor module (2400 -> bench 2920)
// Rail: maintenance rail (3000 -> 3320) right after workshop 0
// Workshop 1: plasma cell in scrap yard (5800 -> bench 6320)
// Workshop 2: navigation core before hangar (9600 -> bench 10120)
export const STITCHO_WORKSHOPS=Object.freeze([
 {id:0,x:2400,y:FLOOR,name:'Módulo del motor',instrument:'motor',action:'E o J · recoge la pieza y llévala al banco',lesson:'Esquiva a los escarabajos mientras transportas. Puedes soltar la pieza con E para pelear.'},
 {id:1,x:5800,y:FLOOR,name:'Célula de plasma',instrument:'plasma',action:'Recoge y transporta · cuidado con las telarañas',lesson:'Las arañas frenan tu paso con telas. Despeja el camino antes de transportar la célula.'},
 {id:2,x:9600,y:FLOOR,name:'Núcleo de navegación',instrument:'nav',action:'Último módulo · los drones patrullan arriba',lesson:'Usa K para rodar bajo los disparos aéreos y entregar el módulo a la grúa.'}
].map(Object.freeze));

export const STITCHO_RAIL_V607=STITCHO_RAIL;
export const STITCHO_ARENA_V607=Object.freeze({left:12400,right:13900,floor:FLOOR});
export const STITCHO_SHIP_V607=Object.freeze({x:11800,y:FLOOR});

const CAST=Object.freeze({cucaracho:'pursuer',arana:'shield',phosquito:'flyer',ufo:'gunner',murcielago:'jumper'});
export const STITCHO_FOE_ROLES=CAST;

export function authorStitchoEncounters(room){
 if(room.hero!=='stitcho')return room;
 room.stitchoEncounterVersion=607;room.width=14400;

 // Remap seal stations to authored workshops with transport targets
 room.seal.stations=STITCHO_WORKSHOPS.map(s=>({...s,kind:'part',target:{x:s.x+520,y:FLOOR}}));
 room.seal.altar={x:13920,y:FLOOR};

 // Store V607 rail and arena positions
 room.stitchoRail=STITCHO_RAIL_V607;
 room.stitchoArena=STITCHO_ARENA_V607;
 room.stitchoShipX=STITCHO_SHIP_V607.x;

 // ── Terrain ────────────────────────────────────────────────────────────
 // Unbroken floor spanning the full 14400 length ensures carrying parts and
 // ball rolling (K) never collide with abrupt floor steps or trigger unintended wall-climb.
 const floor=[[0,FLOOR,9600,126],[9600,FLOOR,4800,126]];

 const banks=[
  [1020,260,52],[2680,240,70],[3600,280,88],[5100,260,78],[6100,280,95],
  [7400,260,70],[9100,280,90],[9900,250,75],[11600,270,82]
 ];
 room.terraces=banks.map(([x,w,rise])=>({x,w,y:FLOOR-rise,rise}));

 // Elevated catwalks, crane structures and maintenance perches (all thin shelves)
 const shelves=[
  // Sector 0 · Dock stepping stones
  [1400,1034,200],[1680,944,220],
  // Sector 1 · Workshop 0 approach catwalks
  [2100,1044,200],[3420,1034,200],[3700,944,220],
  // Sector 2 · Scrap towers
  [4100,1034,200],[4400,934,220],[4740,834,210],[5060,934,200],
  // Sector 3 · Crane arms near Workshop 1
  [5480,1034,200],[6500,1034,200],[6800,934,210],[7100,834,220],
  // Sector 4 · Corridor platforms
  [7700,1044,200],[8000,944,220],[8400,844,200],
  // Sector 5 · Hangar interior catwalks before Workshop 2
  [8800,1034,200],[9200,934,210],[10300,1034,200],[10600,934,210],
  // Sector 6 · Corredor de la nave
  [11100,1034,200],[11400,934,200],[11900,974,180],
  // Sector 7 · Arena side perches
  [12600,974,180],[13600,974,180]
 ];
 const expPlats = (room.plats || []).filter(p => p[0] >= 9600 && p[1] < FLOOR);
 room.plats=[...floor,...expPlats,...shelves.map(p=>[...p,22])];

 // Clear platforms directly above workshops and rail so deliveries/rolls work freely
 for(let i=room.plats.length-1;i>0;i--){
  const [px,py,pw]=room.plats[i];
  if(py<FLOOR){
   const overRail = px<STITCHO_RAIL.right+60 && px+pw>STITCHO_RAIL.left-60;
   const overStation = room.seal.stations.some(st=>[st.x,st.target.x].some(sx=>px<sx+80&&px+pw>sx-80));
   if(overRail || overStation) room.plats.splice(i,1);
  }
 }

 // ── Enemies ────────────────────────────────────────────────────────────
 // Species have anatomy-compatible roles, clear commitment and a home range.
 const cast=[
  // ─ Act 1: Dock & Workshop 0 ─
  [980,'cucaracho',48,0],
  [1560,'arana',54,0],
  [2160,'phosquito',52,0],
  [2760,'cucaracho',62,0],

  // ─ Act 1–2: Post-rail scrap corridor ─
  [3800,'arana',84,1],
  [4360,'ufo',92,1],
  [5060,'cucaracho',88,1],
  [5460,'phosquito',96,1],

  // ─ Act 2: Workshop 1 & cranes ─
  [6200,'murcielago',110,2],
  [6740,'arana',116,2],
  [7300,'ufo',120,2],
  [7900,'phosquito',108,2],

  // ─ Act 3: Hangar & Workshop 2 ─
  [8900,'cucaracho',140,3],
  [9400,'murcielago',134,3],
  [10200,'arana',148,3],
  [10700,'ufo',146,3],
  [11200,'phosquito',140,3],

  // ─ Pre-arena sentinels ─
  [11800,'cucaracho',156,4],
  [12200,'arana',158,4]
 ];

 const expFoes = (room.foes || []).filter(f => f[4]?.expedition).map(f => {
  const [x, y, kind, boss, data] = f;
  return [x, y, kind, boss, { ...data, homeX: data.homeX ?? x, leash: data.leash ?? { left: Math.max(9000, x - 400), right: Math.min(14200, x + 400) } }];
 });
 const authored=cast.map(([x,kind,hp,stage],i)=>{
  const role=CAST[kind],air=role==='flyer'||role==='gunner';
  const support=FLOOR;
  const y=air?(stage===2?720:stage===3?810:support-220):support-40;
  return [x,y,kind,false,{
   role,chapterHP:hp,variant:i%3,
   name:{cucaracho:'Escarabajo del muelle',arana:'Tejedora de cables',phosquito:'Chispa del astillero',ufo:'Dron de inspección',murcielago:'Vigía nocturno'}[kind],
   stitchoEncounter:true,stage,authoredEncounter:stage,
   anchorFloor:air?undefined:support,anchorY:y,homeX:x,
   leash:{left:Math.max(600,x-430),right:Math.min(12200,x+530)},
   flightBand:air?{top:y-150,bottom:y+220}:undefined
  }];
 });
 room.foes=[...authored,...expFoes];

 // ── Collectibles ───────────────────────────────────────────────────────
 room.orbs=[];
 for(const [x,y] of [
  [620,1089],[800,1089],[1480,989],[1760,898],
  [2220,1089],[2840,1017],[3500,1089],[3800,898],
  [4180,989],[4480,889],[4820,789],[5140,889],
  [5560,989],[6600,989],[6900,889],[7200,789],
  [7800,989],[8100,898],[8500,798],[8900,989],
  [9300,889],[10400,989],[10700,889],[11200,989],
  [11500,889],[12000,929],[12700,929],[13700,929]
 ])room.orbs.push([x,Math.min(y,FLOOR-42)]);

 // ── Sectors ────────────────────────────────────────────────────────────
 const names=['Dique de llegada','Primer astillero','Canal de chatarra','Grúas de plasma','Dársena y taller','Puente del raíl','Cámaras del hangar','Corredor de la nave','Arena del Núcleo Glitch'];
 room.sectors=names.map((name,i)=>({id:i<6?'w1-stitcho-'+i:'w1-stitcho-act2-'+(i-6),name,x:i*1600,w:1600,role:i===8?'combat':i===3?'platform':'explore'}));
 room.checkpoints=room.sectors.map((s,i)=>({id:s.id,x:i===8?12480:s.x+160,y:FLOOR,sector:i}));

 room.nooks=[{id:'w1-stitcho-secret-0',x:4820,y:790},{id:'w1-stitcho-secret-1',x:8500,y:800}];

 room.hint='Repara los tres módulos de la nave: motor, célula y núcleo. K te convierte en bola para el raíl de mantenimiento. Tras las tres piezas, vence al Núcleo Glitch para salir.';

 return room;
}

export function stitchoUnlockedForm(g){
 if(!g?.roomDef?.stitchoEncounterVersion||g.world1?.sealed||g.world1Seals?.includes('stitcho'))return 4;
 return Math.min(4,g.world1?.stations?.filter(s=>s.done).length||0);
}
export function stitchoGrowthWaiting(g){return !!g?.roomDef?.stitchoEncounterVersion&&g.player?.evo<4&&g.player.evo>=stitchoUnlockedForm(g);}
