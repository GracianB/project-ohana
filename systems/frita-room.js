// Personal single-player variant of the Claro for Frita (frita).
// MERCADO DORADO — Coastal boardwalk market: golden oil springs, festive stall canopies,
// hanging lanterns, sizzling fryer blasts and the feast arena of the Rey Crujiente.
// Layout: wide boardwalk planks in Sector 0, bouncy stall platforms in Sector 1,
// hanging lantern ledges in Sector 2, feast-hall coliseum approach in Sector 3.
export function createFritaRoom(base){
 if(base?.id!=='hub')throw new Error('Frita room requires canonical hub');
 const platforms=[
  // Ground — two boiling-oil chasm gaps at x:1200 and x:2420
  [0,1134,1200,126],[1300,1134,1120,126],[2520,1134,1680,126],

  // ── Sector 0: Paseo de la Bahía Dorada (x:0–1050) ─────────────────────
  // Wide boardwalk planks — long and low, easy jumps with small gaps
  [90,1050,280,20],[400,980,260,20],[680,920,240,20],
  [860,840,200,20],[700,740,170,20],
  [350,810,200,20],[150,700,220,20],
  [450,580,260,20],[750,480,210,20],[920,380,180,20],

  // ── Sector 1: Mercado del Aceite Crepitante (x:1050–2100) ─────────────
  // Stall canopy platforms — different widths, slight diagonal feel
  [1360,1010,220,20],[1620,960,260,20],[1900,1005,220,20],
  [1480,800,200,20],[1760,750,220,20],[2000,780,200,20],
  [1370,620,180,20],[1680,560,200,20],[1940,490,190,20],
  [1480,370,210,20],[1810,310,200,20],

  // ── Sector 2: Bazar de las Especias del Mar (x:2100–3150) ─────────────
  // Hanging lantern ledges — narrow, tiered, require precise jumps
  [2570,1050,180,20],[2810,970,170,20],
  [2650,840,190,20],[2420,740,170,20],
  [2760,640,180,20],[2540,530,170,20],
  [2860,430,180,20],[2620,330,170,20],
  [2390,220,180,20],[2780,150,190,20],

  // ── Sector 3: Cúpula del Gran Banquete (x:3150–4200) ──────────────────
  // Coliseum tiers — wide and stacked, festive golden feel
  [3180,1010,260,20],[3500,960,280,20],[3820,990,250,20],
  [3300,770,220,20],[3620,720,240,20],[3900,650,200,20]
 ];
 const checkpoints=[
  {id:'hub-frita-entry', x:240,  y:1134,sector:0},
  {id:'hub-frita-market',x:1520, y:1134,sector:1},
  {id:'hub-frita-bazaar',x:2620, y:1134,sector:2},
  {id:'hub-frita-shrine',x:3280, y:1134,sector:3}
 ];
 const foes=[
  // Sector 0 — boardwalk patrol
  [380,950,'brasita', false,{role:'pursuer', name:'Chispa de aceite',    anchorY:950}],
  [720,880,'escoria', false,{role:'flyer',   name:'Gaviota dorada',      anchorY:880}],
  [900,800,'rana',    false,{role:'jumper',  name:'Saltarín crujiente',  anchorY:800}],
  // Sector 1 — market guardians
  [1450,990,'cangrejo',false,{role:'shield', name:'Cangrejo del mercado',anchorY:990}],
  [1700,940,'brasita', false,{role:'pursuer',name:'Burbuja hirviente',   anchorY:940}],
  [1970,770,'ufo',     false,{role:'gunner', name:'Centinela del aceite',anchorY:770}],
  // Sector 2 — spice bazaar ambush
  [2620,1020,'rana',    false,{role:'jumper', name:'Rana del bazar',     anchorY:1020}],
  [2820,940,'escoria',  false,{role:'flyer',  name:'Volador especiado',  anchorY:940}],
  // Sector 3 — feast hall guards
  [3260,990,'cangrejo', false,{role:'shield', name:'Guardián del caldero',anchorY:990}],
  [3650,960,'brasita',  false,{role:'pursuer',name:'Heraldo del festín', anchorY:960}]
 ];
 return {
  ...base,
  name:'Mercado Dorado',short:'Mercado',world:9,color:'#ffd54f',
  hint:'Recoge los 8 crujientes dorados, impúlsate en los propulsores de aceite caliente y calienta las freidoras con Derrape (J) o Freidora Exprés (K). Derrota al Rey Crujiente para reclamar el Banquete Dorado.',
  doors:{...base.doors,up:null},
  plats:platforms,
  foes,
  orbs:[
   // Sector 0 — boardwalk treats
   [250,1010],[530,940],[780,880],[940,340],
   // Sector 1 — market stalls
   [1530,760],[1820,720],[2010,450],[1850,270],
   // Sector 2 — spice bazaar
   [2680,800],[2880,930],[2580,490],[2420,180],
   // Sector 3 — feast coliseum
   [3380,730],[3720,680]
  ],
  checkpoints,
  upExit:null,
  sectors:[
   {id:'hub-frita-0',name:'Paseo de la Bahía Dorada',     x:0,   w:1050,role:'explore'},
   {id:'hub-frita-1',name:'Mercado del Aceite Crepitante',x:1050,w:1050,role:'platform'},
   {id:'hub-frita-2',name:'Bazar de las Especias del Mar',x:2100,w:1050,role:'secret'},
   {id:'hub-frita-3',name:'Cúpula del Gran Banquete',     x:3150,w:1050,role:'combat'}
  ],
  hazards:[
   {id:'frita-oil-0',x:1200,y:1100,w:100,h:370,type:'death',dest:null,
    label:'ACEITE HIRVIENTE',color:'#ff8f00',heroEscape:'frita'},
   {id:'frita-oil-1',x:2420,y:1100,w:100,h:370,type:'death',dest:null,
    label:'ACEITE HIRVIENTE',color:'#ff8f00',heroEscape:'frita'}
  ]
 };
}
