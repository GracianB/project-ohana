// Personal single-player variant of the Claro for Chispín.
// Do not mutate the canonical shared Hoku ROOM; it is used by multiplayer, Kilo, Stitcho and the world graph.
// ISLAS DEL RELÁMPAGO — Chispín's world: quartz sand terraces, high-voltage pylon towers,
// storm-cloud catwalks, and the dynamo temple of the Titán de Trueno.
// Layout: low induction terraces S0, tall pylon tower jumps S1,
// cloud catwalk zigzag S2, electrostatic altar arena S3.
export function createChispinRoom(base){
 if(base?.id!=='hub')throw new Error('Chispin room requires canonical hub');
 const platforms=[
  // Ground segments spanning the full 4200 width with two canonical chasms
  [0,1134,1190,126],[1290,1134,1050,126],[2440,1134,1760,126],

  // ── Sector 0: Playa Electrostática (x:0–1050) ──────────────────────────
  // Quartz sand induction terraces — rising staircase shape, left-to-right
  [60,1090,200,20],[320,1050,200,20],[560,990,200,20],
  [820,940,200,20],[700,840,180,20],[480,800,180,20],
  [260,710,180,20],[100,620,180,20],
  [380,500,220,20],[700,420,200,20],[920,340,180,20],

  // ── Sector 1: Pilares de Alto Voltaje (x:1050–2100) ────────────────────
  // Tall pylon towers — small platforms at varying heights, big vertical jumps
  [1320,1010,120,20],[1520,960,120,20],[1760,1010,120,20],
  [1330,800,140,20],[1610,740,140,20],[1900,770,140,20],
  [1400,580,160,20],[1700,520,140,20],[2010,500,140,20],
  [1480,360,140,20],[1780,320,160,20],[2020,290,140,20],

  // ── Sector 2: Cañón de las Nubes (x:2100–3150) ─────────────────────────
  // Storm-cloud catwalks — wide platforms scattered at high altitude
  [2120,980,260,20],[2500,940,240,20],[2860,960,260,20],
  [2260,780,240,20],[2680,760,220,20],
  [2120,580,260,20],[2520,560,220,20],[2880,540,240,20],
  [2300,380,200,20],[2640,340,220,20],[2980,300,200,20],

  // ── Sector 3: Santuario de la Tormenta (x:3150–4200) ───────────────────
  // Electrostatic altar steps — wide concentric tiers, boss platform elevated
  [3150,1010,200,20],[3830,1010,200,20],
  [3260,840,200,20],[3720,840,200,20],[3470,880,220,20],
  [3350,660,260,20],[3600,660,260,20],
  [3420,480,300,20],[3430,300,280,20]
 ];
 const checkpoints=[
  {id:'hub-chispin-entry',x:230,y:1134,sector:0},
  {id:'hub-chispin-pylons',x:1460,y:1134,sector:1},
  {id:'hub-chispin-canyon',x:2500,y:1134,sector:2},
  {id:'hub-chispin-sanctuary',x:3200,y:1134,sector:3}
 ];
 const foes=[
  [380,1040,'rana',false,{role:'jumper',name:'Saltador de chispa',anchorY:1040}],
  [720,890,'phosquito',false,{role:'flyer',name:'Mosquito voltaico',anchorY:890}],
  [940,800,'cangrejo',false,{role:'shield',name:'Centinela quartz',anchorY:800}],
  [1350,990,'cangrejo',false,{role:'shield',name:'Centinela dinamo',anchorY:990}],
  [1650,720,'ufo',false,{role:'gunner',name:'Torreta de arco',anchorY:720}],
  [1920,750,'cucaracho',false,{role:'pursuer',name:'Corredor estático',anchorY:750}],
  [2280,950,'rana',false,{role:'jumper',name:'Rana de relámpago',anchorY:950}],
  [2700,740,'phosquito',false,{role:'flyer',name:'Esfera eléctrica',anchorY:740}],
  [3150,990,'cangrejo',false,{role:'shield',name:'Guardia de alta tensión',anchorY:990}],
  [3830,990,'rana',false,{role:'jumper',name:'Centella del santuario',anchorY:990}]
 ];
 return {...base,name:'Islas del Relámpago',short:'Relámpago',world:5,color:'#ffe45a',
  hint:'Recoge 8 bobinas, sintoniza tres pararrayos y desafía al Titán de Trueno. La Cadena (J) y el Paso Relámpago (K) superan barreras de arco y activan condensadores.',
  doors:{...base.doors,up:null},plats:platforms,foes,
  orbs:[
   [260,670],[480,460],[720,380],[940,290],
   [1340,330],[1510,470],[1710,490],[2030,450],
   [2140,540],[2540,510],[2900,490],[2980,250],
   [3360,620],[3620,620]
  ],
  checkpoints,upExit:null,
  sectors:[
   {id:'hub-chispin-0',name:'Playa Electrostática',x:0,w:1050,role:'explore'},
   {id:'hub-chispin-1',name:'Pilares de Alto Voltaje',x:1050,w:1050,role:'platform'},
   {id:'hub-chispin-2',name:'Cañón de las Nubes',x:2100,w:1050,role:'secret'},
   {id:'hub-chispin-3',name:'Santuario de la Tormenta',x:3150,w:1050,role:'combat'}
  ],
  hazards:[1190,2340].map((x,i)=>({id:'chispin-fall-'+i,x,y:1100,w:100,h:360,type:'death',dest:null,label:'ARCO VOLTAICO',color:'#ffe45a'}))
 };
}
