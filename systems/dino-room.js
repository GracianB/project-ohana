// Personal single-player variant of the Claro for Dino (dino).
// VALLE DE LOS GIGANTES — Prehistoric canyon world: amber gorges, fossilized monoliths,
// giant ribcage caverns, muddy geysers and the stone arena of the Coloso de Piedra.
// Platform layout is unique — wide mesa ledges, staggered stone steps and hanging bones —
// completely distinct from every other hero's trail.
export function createDinoRoom(base){
 if(base?.id!=='hub')throw new Error('Dino room requires canonical hub');
 const platforms=[
  // Ground — two mud-chasm gaps at x:1190 and x:2380
  [0,1134,1190,126],[1290,1134,1090,126],[2480,1134,1720,126],

  // ── Sector 0: Garganta de los Fósiles (x:0–1050) ──────────────────────
  // Wide sandstone steps descending into the gorge, then rising amber crags
  [100,1040,260,26],[380,960,210,26],[620,900,180,26],
  [840,820,200,26],[780,700,150,26],
  [450,770,190,26],[220,640,200,26],
  [580,530,240,26],[860,440,200,26],[960,360,160,26],

  // ── Sector 1: Meseta de los Gigantes (x:1050–2100) ────────────────────
  // Flat-top mesa platforms — wide and spaced, geyser launch pads between them
  [1320,1000,320,26],[1700,1010,280,26],
  [1440,820,260,26],[1820,830,240,26],
  [1330,640,220,26],[1660,590,250,26],[1920,520,200,26],
  [1450,400,190,26],[1770,350,220,26],

  // ── Sector 2: Caverna del Ámbar Ancestral (x:2100–3150) ───────────────
  // Zigzag amber ledges with amber drip stalactites — more vertical challenge
  [2520,1060,220,26],[2800,980,200,26],
  [2600,860,240,26],[2350,760,210,26],
  [2740,660,220,26],[2510,540,200,26],
  [2880,440,230,26],[2640,330,210,26],
  [2420,220,200,26],[2780,160,230,26],

  // ── Sector 3: Cúspide del Guardián Antiguo (x:3150–4200) ─────────────
  // Semi-circular arena approach — high stone pillars flanking the boss shrine
  [3170,1000,240,26],[3490,950,260,26],[3800,980,240,26],
  [3280,760,200,26],[3600,700,220,26],[3880,620,200,26]
 ];
 const checkpoints=[
  {id:'hub-dino-entry',  x:230,  y:1134,sector:0},
  {id:'hub-dino-plateau',x:1500, y:1134,sector:1},
  {id:'hub-dino-cavern', x:2560, y:1134,sector:2},
  {id:'hub-dino-shrine', x:3250, y:1134,sector:3}
 ];
 const foes=[
  // Sector 0 — gorge crawlers and aerial fossils
  [480,900,'cangrejo',false,{role:'pursuer',  name:'Trilobite acorazado',   anchorY:900}],
  [700,820,'escoria', false,{role:'flyer',    name:'Pterosaurio fósil',     anchorY:820}],
  [920,800,'rana',    false,{role:'jumper',   name:'Anuro primigenio',      anchorY:800}],
  // Sector 1 — mesa guardians and fossil gunners
  [1430,990,'cangrejo',false,{role:'shield',  name:'Caparazón de ámbar',    anchorY:990}],
  [1750,1000,'rana',  false,{role:'jumper',   name:'Saltador de meseta',    anchorY:1000}],
  [1920,820,'ufo',    false,{role:'gunner',   name:'Centinela fósil',       anchorY:820}],
  // Sector 2 — amber cavern ambushers
  [2620,1040,'cangrejo',false,{role:'pursuer','name':'Reptil de cuarzo',    anchorY:1040}],
  [2800,960,'escoria', false,{role:'flyer',   name:'Arqueópterix',          anchorY:960}],
  // Sector 3 — arena guards
  [3200,990,'cangrejo',false,{role:'shield',  name:'Guardián de la roca',   anchorY:990}],
  [3600,960,'rana',    false,{role:'jumper',  name:'Heraldo del coloso',    anchorY:960}]
 ];
 return {
  ...base,
  name:'Valle de los Gigantes',short:'Gigantes',world:8,color:'#81c784',
  hint:'Recoge los 8 fósiles maestros, activa los géiseres de fango con Pisotón (J) y rompe las puertas de ámbar con Carga Fósil (K). Derrota al Coloso de Piedra para despertar el Fósil de la Familia.',
  doors:{...base.doors,up:null},
  plats:platforms,
  foes,
  orbs:[
   // Sector 0 — amber gorge loot
   [280,1000],[620,860],[860,780],[960,320],
   // Sector 1 — mesa heights
   [1480,760],[1700,960],[1930,480],[1800,310],
   // Sector 2 — cavern secrets
   [2650,820],[2900,940],[2530,500],[2450,180],
   // Sector 3 — shrine approach
   [3340,720],[3700,580]
  ],
  checkpoints,
  upExit:null,
  sectors:[
   {id:'hub-dino-0',name:'Garganta de los Fósiles',      x:0,   w:1050,role:'explore'},
   {id:'hub-dino-1',name:'Meseta de los Gigantes',       x:1050,w:1050,role:'platform'},
   {id:'hub-dino-2',name:'Caverna del Ámbar Ancestral',  x:2100,w:1050,role:'secret'},
   {id:'hub-dino-3',name:'Cúspide del Guardián Antiguo', x:3150,w:1050,role:'combat'}
  ],
  hazards:[
   {id:'dino-chasm-0',x:1190,y:1100,w:100,h:380,type:'death',dest:null,
    label:'FANGO ETERNO',color:'#5d4037',heroEscape:'dino'},
   {id:'dino-chasm-1',x:2380,y:1100,w:100,h:380,type:'death',dest:null,
    label:'FANGO ETERNO',color:'#5d4037',heroEscape:'dino'}
  ]
 };
}
