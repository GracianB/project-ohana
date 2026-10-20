// Personal single-player variant of the Claro for Yomi (yomi).
// OBSERVATORIO ASTRAL — Spirit world observatory: floating torii gates, spirit
// draft updrafts, glowing crystal orbs, astral barrier seals and the
// celestial arena of the Guía del Más Allá.
// Layout: torii gate bridge platforms S0, floating crystal shelves S1,
// spiraling nebula galleries S2, astral throne arena S3.
export function createYomiRoom(base){
 if(base?.id!=='hub')throw new Error('Yomi room requires canonical hub');
 const platforms=[
  // Ground — two spirit-void chasm gaps at x:1180 and x:2390
  [0,1134,1180,126],[1280,1134,1110,126],[2490,1134,1710,126],

  // ── Sector 0: Umbral de los Espíritus (x:0–1050) ─────────────────────
  // Torii gate bridge planks — pairs of platforms at same height, gap between
  [80,1050,200,22],[320,1050,200,22],  // first torii pair
  [550,960,200,22],[760,960,160,22],   // second torii pair
  [860,860,180,22],[620,840,160,22],
  [380,740,180,22],[160,660,200,22],
  [500,560,200,22],[800,470,180,22],[960,380,160,22],

  // ── Sector 1: Galerías de las Almas Errantes (x:1050–2100) ───────────
  // Floating crystal shelves — gentle ascending spiral
  [1310,1010,210,22],[1580,960,230,22],[1880,1000,210,22],
  [1460,800,200,22],[1760,750,220,22],[2020,780,190,22],
  [1360,620,190,22],[1680,560,200,22],[1940,500,190,22],
  [1470,380,200,22],[1810,320,190,22],

  // ── Sector 2: Nebulosa de los Recuerdos (x:2100–3150) ────────────────
  // Spiraling nebula rock formations — wide at bottom, narrow up top
  [2560,1060,210,22],[2830,990,190,22],
  [2660,860,200,22],[2410,760,190,22],
  [2760,660,200,22],[2550,550,190,22],
  [2880,450,200,22],[2620,360,190,22],
  [2400,250,190,22],[2800,180,200,22],

  // ── Sector 3: Trono Astral (x:3150–4200) ─────────────────────────────
  // Celestial altar approach — narrow floating stone platforms
  [3160,1000,240,22],[3490,950,260,22],[3820,980,240,22],
  [3280,760,200,22],[3600,710,220,22],[3900,640,200,22]
 ];
 const checkpoints=[
  {id:'hub-yomi-entry',   x:230, y:1134,sector:0},
  {id:'hub-yomi-gallery', x:1490,y:1134,sector:1},
  {id:'hub-yomi-nebula',  x:2600,y:1134,sector:2},
  {id:'hub-yomi-throne',  x:3260,y:1134,sector:3}
 ];
 const foes=[
  // Sector 0 — torii gate spirits
  [380,1010,'escoria', false,{role:'flyer',   name:'Espíritu de niebla',  anchorY:1010}],
  [650,930,'rana',     false,{role:'jumper',  name:'Saltador etéreo',     anchorY:930}],
  [900,820,'brasita',  false,{role:'pursuer', name:'Llama espiritual',    anchorY:820}],
  // Sector 1 — gallery wanderers
  [1470,980,'ufo',     false,{role:'gunner',  name:'Centinela astral',    anchorY:980}],
  [1730,940,'escoria', false,{role:'flyer',   name:'Espíritu errante',    anchorY:940}],
  [2000,770,'cangrejo',false,{role:'shield',  name:'Guardián de cristal', anchorY:770}],
  // Sector 2 — nebula apparitions
  [2640,1030,'brasita',false,{role:'pursuer', name:'Ánima de nebulosa',   anchorY:1030}],
  [2870,960,'rana',    false,{role:'jumper',  name:'Saltador de estrellas',anchorY:960}],
  // Sector 3 — throne guardians
  [3250,980,'ufo',     false,{role:'gunner',  name:'Centinela del trono', anchorY:980}],
  [3700,950,'escoria', false,{role:'flyer',   name:'Heraldo del más allá',anchorY:950}]
 ];
 return {
  ...base,
  name:'Observatorio Astral',short:'Astral',world:11,color:'#ce93d8',
  hint:'Recoge las 8 linternas del alma, deslízate en las corrientes espirituales con Ofrenda (J) o Invocación (K). Derrota al Guía del Más Allá para reclamar la Constelación Eterna.',
  doors:{...base.doors,up:null},
  plats:platforms,
  foes,
  orbs:[
   [200,1010],[440,1010],[660,920],[920,360],
   [1530,760],[1830,710],[2000,460],[1860,280],
   [2710,820],[2880,950],[2600,510],[2440,210],
   [3360,720],[3760,680]
  ],
  checkpoints,
  upExit:null,
  sectors:[
   {id:'hub-yomi-0',name:'Umbral de los Espíritus',    x:0,   w:1050,role:'explore'},
   {id:'hub-yomi-1',name:'Galerías de las Almas Errantes',x:1050,w:1050,role:'platform'},
   {id:'hub-yomi-2',name:'Nebulosa de los Recuerdos',  x:2100,w:1050,role:'secret'},
   {id:'hub-yomi-3',name:'Trono Astral',               x:3150,w:1050,role:'combat'}
  ],
  hazards:[
   {id:'yomi-void-0',x:1180,y:1100,w:100,h:370,type:'death',dest:null,
    label:'VACÍO ETERNO',color:'#7b1fa2',heroEscape:'yomi'},
   {id:'yomi-void-1',x:2390,y:1100,w:100,h:370,type:'death',dest:null,
    label:'VACÍO ETERNO',color:'#7b1fa2',heroEscape:'yomi'}
  ]
 };
}
