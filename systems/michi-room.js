// Personal single-player variant of the Claro for Michi (cat).
// Do not mutate the canonical shared Hoku ROOM; it is used by multiplayer, Kilo, Stitcho, Chispín and the world graph.
// LOS JARDINES DE LA LUNA — Michi's world: rose-quartz bioluminescent caves,
// floating lunar crystal bridges, dream labyrinths, and the moon-temple of the Espíritu Astral Felino.
// Layout: spiralling cave terraces S0, long floating crystal bridges S1,
// dream-cloud maze S2, lunar crescent altar arena S3.
export function createMichiRoom(base){
 if(base?.id!=='hub')throw new Error('Michi room requires canonical hub');
 const platforms=[
  // Ground segments spanning the full 4200 width with two canonical chasms
  [0,1134,1190,126],[1290,1134,1050,126],[2440,1134,1760,126],

  // ── Sector 0: Caverna de los Ecos (x:0–1050) ────────────────────────────
  // Spiralling bioluminescent cave terraces — circular rising pattern
  [80,1090,160,20],[280,1040,160,20],[520,1020,180,20],
  [740,980,160,20],[900,900,180,20],[720,800,160,20],
  [500,740,180,20],[280,680,180,20],[80,600,160,20],
  [240,480,200,20],[560,440,200,20],[860,400,180,20],

  // ── Sector 1: Puentes del Firmamento (x:1050–2100) ──────────────────────
  // Long floating lunar crystal spans — very wide, minimalist, gap-heavy
  [1310,1000,440,20],
  [1370,800,400,20],
  [1310,600,440,20],
  [1420,420,360,20],
  [1450,240,320,20],

  // ── Sector 2: Laberinto de los Sueños (x:2100–3150) ─────────────────────
  // Dream-maze — compact alternating left/right platforms, tight vertical spacing
  [2100,1040,180,20],[2900,1040,180,20],
  [2220,900,160,20],[2780,910,160,20],
  [2380,770,180,20],[2640,780,180,20],
  [2100,640,160,20],[2920,640,160,20],
  [2240,510,180,20],[2760,520,180,20],
  [2420,380,200,20],[2600,360,200,20],
  [2300,240,260,20],

  // ── Sector 3: Templo de la Luna Llena (x:3150–4200) ─────────────────────
  // Crescent-shaped arena — curved tier feel, split platforms left and right
  [3160,1010,220,20],[3780,1010,220,20],
  [3200,840,200,20],[3750,840,200,20],
  [3310,680,180,20],[3670,680,180,20],
  [3430,520,300,20],[3460,360,240,20]
 ];
 const checkpoints=[
  {id:'hub-michi-entry',x:230,y:1134,sector:0},
  {id:'hub-michi-bridges',x:1460,y:1134,sector:1},
  {id:'hub-michi-dreams',x:2500,y:1134,sector:2},
  {id:'hub-michi-temple',x:3200,y:1134,sector:3}
 ];
 const foes=[
  [360,1040,'cucaracho',false,{role:'pursuer',name:'Sombra de la caverna',anchorY:1040}],
  [720,940,'phosquito',false,{role:'flyer',name:'Polilla lunar',anchorY:940}],
  [900,860,'cangrejo',false,{role:'shield',name:'Guardián de cuarzo',anchorY:860}],
  [1380,990,'rana',false,{role:'jumper',name:'Saltador onírico',anchorY:990}],
  [1700,790,'ufo',false,{role:'gunner',name:'Orbe espectral',anchorY:790}],
  [2200,1030,'cucaracho',false,{role:'pursuer',name:'Merodeador nocturno',anchorY:1030}],
  [2500,740,'phosquito',false,{role:'flyer',name:'Fatuo de luna',anchorY:740}],
  [2800,900,'rana',false,{role:'jumper',name:'Acróbata astral',anchorY:900}],
  [3200,990,'cangrejo',false,{role:'shield',name:'Centinela del eclipse',anchorY:990}],
  [3780,990,'cucaracho',false,{role:'pursuer',name:'Lince de las sombras',anchorY:990}]
 ];
 return {...base,name:'Los Jardines de la Luna',short:'Jardines',world:6,color:'#e5c2ff',
  hint:'Recoge 8 esencias de luna, sintoniza tres campanas astrales y despierta al Espíritu Astral Felino. El Ovillo (J) y el Ronroneo (K) disipan nieblas y abren rutas secretas.',
  doors:{...base.doors,up:null},plats:platforms,foes,
  orbs:[
   [240,440],[560,400],[870,360],[980,220],
   [1350,210],[1480,380],[1600,560],[1500,760],
   [2220,860],[2450,340],[2640,720],[2920,510],
   [3320,640],[3690,640]
  ],
  checkpoints,upExit:null,
  sectors:[
   {id:'hub-michi-0',name:'Caverna de los Ecos',x:0,w:1050,role:'explore'},
   {id:'hub-michi-1',name:'Puentes del Firmamento',x:1050,w:1050,role:'platform'},
   {id:'hub-michi-2',name:'Laberinto de los Sueños',x:2100,w:1050,role:'secret'},
   {id:'hub-michi-3',name:'Templo de la Luna Llena',x:3150,w:1050,role:'combat'}
  ],
  hazards:[1190,2340].map((x,i)=>({id:'michi-fall-'+i,x,y:1100,w:100,h:360,type:'death',dest:null,label:'NIEBLA ASTRAL',color:'#d6a8ff'}))
 };
}
