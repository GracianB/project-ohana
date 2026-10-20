// Personal single-player variant of the Claro for Dragón (dragon).
// Do not mutate the canonical shared Hoku ROOM; it is used by multiplayer, Kilo, Stitcho, Chispín, Michi and the world graph.
// CORDILLERA DE LAS BRASAS — Dragon's world: obsidian gorges, lava-river stepping stones,
// incandescent stalactite caverns, and the ancient fire temple of the Guardián del Núcleo Ígneo.
// Layout: low basalt steps S0, wide lava river floating rocks S1,
// tall stalactite cave with vertical challenge S2, fire-temple arena S3.
export function createDragonRoom(base){
 if(base?.id!=='hub')throw new Error('Dragon room requires canonical hub');
 const platforms=[
  // Ground segments spanning the full 4200 width with two canonical magma chasms
  [0,1134,1190,126],[1290,1134,1050,126],[2440,1134,1760,126],

  // ── Sector 0: Garganta de Obsidiana (x:0–1050) ─────────────────────────
  // Basalt stepping blocks — dense and low, rough terrain feel
  [60,1090,180,22],[280,1070,160,22],[480,1060,180,22],
  [700,1040,160,22],[880,1010,180,22],[960,950,140,22],
  [760,880,200,22],[540,830,200,22],[320,780,200,22],
  [120,700,200,22],[380,620,220,22],[680,570,200,22],[940,510,180,22],

  // ── Sector 1: Ríos de Magma y Geiseres (x:1050–2100) ───────────────────
  // Wide floating igneous rocks over magma river — varied heights, big horizontal gaps
  [1310,980,300,22],[1730,1000,280,22],
  [1400,800,240,22],[1780,820,260,22],
  [1330,600,220,22],[1700,580,220,22],[1980,560,200,22],
  [1480,400,200,22],[1820,380,200,22],

  // ── Sector 2: Caverna de las Brasas (x:2100–3150) ──────────────────────
  // Vertical challenge: tall narrow platforms, ember stalactites from ceiling
  [2120,1050,160,22],[2900,1060,160,22],
  [2260,880,140,22],[2760,900,140,22],
  [2440,720,200,22],[2640,700,200,22],
  [2180,540,160,22],[2860,540,160,22],
  [2360,380,180,22],[2700,360,180,22],
  [2520,220,220,22],

  // ── Sector 3: Cúspide del Dragón Celestial (x:3150–4200) ───────────────
  // Ancient fire-temple arena: stepped approach flanked by two tall brazier pillars
  [3160,1010,240,22],[3780,1020,240,22],
  [3220,860,200,22],[3760,860,200,22],[3440,920,280,22],
  [3300,700,200,22],[3680,700,200,22],
  [3410,540,340,22],[3430,380,300,22]
 ];
 const checkpoints=[
  {id:'hub-dragon-entry',x:230,y:1134,sector:0},
  {id:'hub-dragon-geysers',x:1460,y:1134,sector:1},
  {id:'hub-dragon-cavern',x:2500,y:1134,sector:2},
  {id:'hub-dragon-shrine',x:3200,y:1134,sector:3}
 ];
 const foes=[
  [380,1050,'brasita',false,{role:'pursuer',name:'Llama errante',anchorY:1050}],
  [720,930,'escoria',false,{role:'flyer',name:'Chispa volcánica',anchorY:930}],
  [950,870,'cangrejo',false,{role:'shield',name:'Caparazón de magma',anchorY:870}],
  [1390,980,'rana',false,{role:'jumper',name:'Salamandra ígnea',anchorY:980}],
  [1810,990,'cangrejo',false,{role:'shield',name:'Centinela de lava',anchorY:990}],
  [1990,550,'ufo',false,{role:'gunner',name:'Centinela de lava',anchorY:550}],
  [2260,860,'brasita',false,{role:'pursuer',name:'Fatuo de magma',anchorY:860}],
  [2780,880,'escoria',false,{role:'flyer',name:'Ceniza viva',anchorY:880}],
  [3200,990,'cangrejo',false,{role:'shield',name:'Guardián de obsidiana',anchorY:990}],
  [3780,1000,'brasita',false,{role:'pursuer',name:'Heraldo de brasas',anchorY:1000}]
 ];
 return {...base,name:'Cordillera de las Brasas',short:'Brasas',world:7,color:'#ff8a65',
  hint:'Recoge 8 brasas maestras, activa las corrientes térmicas para planear alto y derrota al Guardián del Núcleo Ígneo. El Aliento (J) y la Batida de Ala (K) abren compuertas y encienden braseros.',
  doors:{...base.doors,up:null},plats:platforms,foes,
  orbs:[
   [380,580],[680,520],[940,460],[1020,220],
   [1360,360],[1540,540],[1730,550],[1900,340],
   [2200,500],[2450,200],[2680,660],[2900,500],
   [3310,660],[3700,660]
  ],
  checkpoints,upExit:null,
  sectors:[
   {id:'hub-dragon-0',name:'Garganta de Obsidiana',x:0,w:1050,role:'explore'},
   {id:'hub-dragon-1',name:'Ríos de Magma y Geiseres',x:1050,w:1050,role:'platform'},
   {id:'hub-dragon-2',name:'Caverna de las Brasas',x:2100,w:1050,role:'secret'},
   {id:'hub-dragon-3',name:'Cúspide del Dragón Celestial',x:3150,w:1050,role:'combat'}
  ],
  hazards:[1190,2340].map((x,i)=>({id:'dragon-fall-'+i,x,y:1100,w:100,h:360,type:'death',dest:null,label:'MAGMA MORTAL',color:'#ff623a',heroEscape:'dragon'}))
 };
}
