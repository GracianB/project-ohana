// Personal single-player variant of the Claro for Pizza (pizza).
// REINO DEL HORNO — Volcanic brick oven world: rotating brick platforms, cheese
// lava springs, blazing pizza-peel slides, obsidian cheese gates and the
// magma kitchen arena of the Chef Magmático.
// Layout: oven-brick staircase S0, rotating brick discs S1, melting cheese
// stalactite cave S2, giant pizza coliseum S3.
export function createPizzaRoom(base){
 if(base?.id!=='hub')throw new Error('Pizza room requires canonical hub');
 const platforms=[
  // Ground — two molten-cheese chasm gaps at x:1210 and x:2400
  [0,1134,1210,126],[1310,1134,1090,126],[2500,1134,1700,126],

  // ── Sector 0: Entrada del Horno Estelar (x:0–1050) ───────────────────
  // Wide brick staircase steps going up-right, oven-mouth arches overhead
  [80,1060,250,24],[320,990,220,24],[560,930,200,24],
  [800,870,180,24],[680,770,160,24],
  [420,830,180,24],[200,720,200,24],
  [480,600,220,24],[760,500,200,24],[940,400,170,24],

  // ── Sector 1: Horno de las Pizzas Celestes (x:1050–2100) ─────────────
  // Round brick disc platforms — varied sizes, suggest rotating oven trays
  [1340,1020,200,24],[1580,970,240,24],[1860,1010,210,24],
  [1450,810,220,24],[1740,760,200,24],[1970,790,190,24],
  [1380,620,180,24],[1660,560,200,24],[1920,500,180,24],
  [1470,380,200,24],[1800,320,190,24],

  // ── Sector 2: Caverna del Queso Fundido (x:2100–3150) ─────────────────
  // Dripping cheese platforms — irregular shapes, some tilted geometry
  [2560,1060,200,24],[2820,990,180,24],
  [2650,860,190,24],[2400,760,180,24],
  [2750,660,190,24],[2540,550,180,24],
  [2860,450,190,24],[2620,350,180,24],
  [2400,240,180,24],[2790,170,190,24],

  // ── Sector 3: Gran Coliseo de la Pizza (x:3150–4200) ─────────────────
  // Wide tiered coliseum rings, audience "stands" feel
  [3160,1010,260,24],[3490,960,280,24],[3820,990,250,24],
  [3290,770,220,24],[3620,720,240,24],[3920,650,200,24]
 ];
 const checkpoints=[
  {id:'hub-pizza-entry',  x:230, y:1134,sector:0},
  {id:'hub-pizza-oven',   x:1500,y:1134,sector:1},
  {id:'hub-pizza-cavern', x:2620,y:1134,sector:2},
  {id:'hub-pizza-arena',  x:3270,y:1134,sector:3}
 ];
 const foes=[
  // Sector 0 — oven-mouth sentinels
  [360,960,'brasita', false,{role:'pursuer', name:'Chispa de mozzarella', anchorY:960}],
  [700,890,'phosquito',false,{role:'flyer',   name:'Dron cortapizzas',     anchorY:890}],
  [920,830,'rana',    false,{role:'jumper',  name:'Saltarín de masa',     anchorY:830}],
  // Sector 1 — pizza oven guardians
  [1450,1000,'cangrejo',false,{role:'shield', name:'Guardián del horno',  anchorY:1000}],
  [1700,950,'brasita', false,{role:'pursuer', name:'Burbuja de queso',    anchorY:950}],
  [1960,780,'ufo',     false,{role:'gunner',  name:'Centinela magmático', anchorY:780}],
  // Sector 2 — molten cheese cave
  [2640,1030,'phosquito',false,{role:'flyer',  name:'Mosca de especias',   anchorY:1030}],
  [2850,960,'cucaracho', false,{role:'pursuer', name:'Corredor de lava',   anchorY:960}],
  // Sector 3 — coliseum defenders
  [3250,990,'cangrejo',false,{role:'shield',  name:'Centinela del coliseo',anchorY:990}],
  [3680,960,'rana',    false,{role:'jumper',  name:'Heraldo del chef',     anchorY:960}]
 ];
 return {
  ...base,
  name:'Reino del Horno',short:'Horno',world:10,color:'#ff7043',
  hint:'Recoge los 8 ingredientes estelares, usa las corrientes de queso fundido con Voltereta (J) o Palada de Horno (K). Derrota al Chef Magmático para reclamar el Horno Estelar.',
  doors:{...base.doors,up:null},
  plats:platforms,
  foes,
  orbs:[
   [260,1020],[540,950],[780,890],[960,360],
   [1520,770],[1800,720],[1990,460],[1840,280],
   [2700,820],[2880,950],[2580,510],[2430,200],
   [3360,730],[3740,690]
  ],
  checkpoints,
  upExit:null,
  sectors:[
   {id:'hub-pizza-0',name:'Entrada del Horno Estelar',   x:0,   w:1050,role:'explore'},
   {id:'hub-pizza-1',name:'Horno de las Pizzas Celestes',x:1050,w:1050,role:'platform'},
   {id:'hub-pizza-2',name:'Caverna del Queso Fundido',   x:2100,w:1050,role:'secret'},
   {id:'hub-pizza-3',name:'Gran Coliseo de la Pizza',    x:3150,w:1050,role:'combat'}
  ],
  hazards:[
   {id:'pizza-lava-0',x:1210,y:1100,w:100,h:370,type:'death',dest:null,
    label:'QUESO HIRVIENTE',color:'#ff6f00',heroEscape:'pizza'},
   {id:'pizza-lava-1',x:2400,y:1100,w:100,h:370,type:'death',dest:null,
    label:'QUESO HIRVIENTE',color:'#ff6f00',heroEscape:'pizza'}
  ]
 };
}
