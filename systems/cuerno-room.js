// Personal single-player variant of the Claro for Cuerno (cuerno).
// BOSQUE DEL PRISMA — Aurora crystal forest: prism-crystal ledges, rainbow
// aurora slides, crystal barrier seals, spirit deer totems and the
// prism coliseum of the Bestia Prisma.
// Layout: root-and-crystal ground paths S0, ascending prism towers S1,
// aurora cave with crystal stalactites S2, rainbow arena S3.
export function createCuernoRoom(base){
 if(base?.id!=='hub')throw new Error('Cuerno room requires canonical hub');
 const platforms=[
  // Ground — two crystal-chasm gaps at x:1195 and x:2410
  [0,1134,1195,126],[1295,1134,1115,126],[2510,1134,1690,126],

  // ── Sector 0: Valle de los Espejos de Cuarzo (x:0–1050) ─────────────
  // Organic root-and-crystal ledges — vary in height, natural feel
  [100,1050,230,22],[360,980,210,22],[620,920,190,22],
  [840,850,180,22],[700,750,160,22],
  [440,820,180,22],[210,720,200,22],
  [510,600,210,22],[810,500,190,22],[960,400,170,22],

  // ── Sector 1: Bosque de los Cristales Vivientes (x:1050–2100) ────────
  // Prism tower ledges — ascending height, crystal spike tips (decorative)
  [1330,1010,210,22],[1600,960,230,22],[1890,1005,210,22],
  [1470,810,200,22],[1770,760,220,22],[2020,790,190,22],
  [1370,630,190,22],[1680,570,200,22],[1940,510,190,22],
  [1470,390,200,22],[1820,330,190,22],

  // ── Sector 2: Caverna de la Aurora Boreal (x:2100–3150) ──────────────
  // Crystal stalactite cave — narrow high platforms
  [2570,1060,190,22],[2840,990,180,22],
  [2660,870,190,22],[2410,770,180,22],
  [2760,670,190,22],[2550,560,180,22],
  [2870,460,190,22],[2630,360,180,22],
  [2410,260,180,22],[2800,190,190,22],

  // ── Sector 3: Arena del Arcoíris (x:3150–4200) ───────────────────────
  // Rainbow arena tiers — wide and colourful, open space for boss fight
  [3165,1010,250,22],[3500,960,270,22],[3830,990,240,22],
  [3285,770,210,22],[3620,720,230,22],[3920,650,200,22]
 ];
 const checkpoints=[
  {id:'hub-cuerno-entry',   x:240, y:1134,sector:0},
  {id:'hub-cuerno-forest',  x:1510,y:1134,sector:1},
  {id:'hub-cuerno-aurora',  x:2620,y:1134,sector:2},
  {id:'hub-cuerno-rainbow', x:3270,y:1134,sector:3}
 ];
 const foes=[
  // Sector 0 — crystal valley spirits
  [380,1010,'escoria', false,{role:'flyer',   name:'Brillo de cuarzo',    anchorY:1010}],
  [650,940,'rana',     false,{role:'jumper',  name:'Saltador de prisma',  anchorY:940}],
  [900,860,'brasita',  false,{role:'pursuer', name:'Llama de aurora',     anchorY:860}],
  // Sector 1 — living crystal forest guardians
  [1480,990,'cangrejo',false,{role:'shield',  name:'Guardián de cristal', anchorY:990}],
  [1750,950,'escoria', false,{role:'flyer',   name:'Fragmento errante',   anchorY:950}],
  [2010,780,'ufo',     false,{role:'gunner',  name:'Centinela del prisma',anchorY:780}],
  // Sector 2 — aurora cave
  [2650,1030,'brasita',false,{role:'pursuer', name:'Espíritu de aurora',  anchorY:1030}],
  [2880,960,'rana',    false,{role:'jumper',  name:'Saltador de luz',     anchorY:960}],
  // Sector 3 — rainbow arena
  [3255,990,'cangrejo',false,{role:'shield',  name:'Guardián del arco',   anchorY:990}],
  [3720,960,'escoria', false,{role:'flyer',   name:'Heraldo de la bestia',anchorY:960}]
 ];
 return {
  ...base,
  name:'Bosque del Prisma',short:'Prisma',world:12,color:'#b39ddb',
  hint:'Recoge los 8 fragmentos de prisma, deslízate en los toboganes de aurora con Destello (J) o Barrera Arco Iris (K). Derrota a la Bestia Prisma para despertar la Aurora Viva.',
  doors:{...base.doors,up:null},
  plats:platforms,
  foes,
  orbs:[
   [270,1010],[530,940],[780,880],[960,360],
   [1550,770],[1840,720],[2000,470],[1870,290],
   [2720,830],[2900,950],[2610,520],[2450,220],
   [3370,730],[3770,690]
  ],
  checkpoints,
  upExit:null,
  sectors:[
   {id:'hub-cuerno-0',name:'Valle de los Espejos de Cuarzo',  x:0,   w:1050,role:'explore'},
   {id:'hub-cuerno-1',name:'Bosque de los Cristales Vivientes',x:1050,w:1050,role:'platform'},
   {id:'hub-cuerno-2',name:'Caverna de la Aurora Boreal',     x:2100,w:1050,role:'secret'},
   {id:'hub-cuerno-3',name:'Arena del Arcoíris',              x:3150,w:1050,role:'combat'}
  ],
  hazards:[
   {id:'cuerno-shard-0',x:1195,y:1100,w:100,h:370,type:'death',dest:null,
    label:'GRIETA DE CRISTAL',color:'#4527a0',heroEscape:'cuerno'},
   {id:'cuerno-shard-1',x:2410,y:1100,w:100,h:370,type:'death',dest:null,
    label:'GRIETA DE CRISTAL',color:'#4527a0',heroEscape:'cuerno'}
  ]
 };
}
