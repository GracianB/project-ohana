// Personal single-player variant of the Claro. Do not mutate the canonical
// shared Hoku ROOM; it is used by multiplayer, Kilo and the world graph.
// ARCHIPIÉLAGO DEL CAOS — Stitcho's world: junkyard sea-stacks, resonance bridges,
// crossed-circuit skywalks, and the Núcleo Glitch arena.
// Layout: rusted sea-stack stepping-stones S0, long floating pylons S1,
// high-altitude diagonal skywalks S2, wide nucleus arena balconies S3.
export function createStitchoRoom(base){
 if(base?.id!=='hub')throw new Error('Stitcho room requires canonical hub');
 const platforms=[
  // Ground segments spanning the full 4200 width with two canonical chasms
  [0,1134,1190,126],[1290,1134,1050,126],[2440,1134,1760,126],

  // ── Sector 0: Playa de chatarra (x:0–1050) ─────────────────────────────
  // Rusted sea-stack stepping-stones — short, irregular, close to ground
  [80,1080,140,20],[280,1030,120,20],[460,1010,160,20],
  [140,920,180,20],[360,870,140,20],[600,930,150,20],
  // Higher junk-pile platforms — staggered and varied width
  [220,760,200,20],[500,720,160,20],[760,810,180,20],
  [640,600,200,20],[880,520,170,20],[980,420,140,20],

  // ── Sector 1: Puentes de resonancia (x:1050–2100) ──────────────────────
  // Long horizontal resonance pylons — wide with big gaps between them
  [1310,1000,380,20],
  [1730,880,340,20],
  [1360,700,300,20],[1760,660,280,20],
  [1450,500,260,20],[1820,440,240,20],
  [1550,320,220,20],

  // ── Sector 2: Circuitos cruzados (x:2100–3150) ─────────────────────────
  // Diagonal-feel skywalk — platforms arranged in an X-cross pattern
  [2100,1050,160,20],[2980,1060,160,20],
  [2200,880,180,20],[2860,900,180,20],
  [2340,720,200,20],[2720,740,200,20],
  [2480,560,240,20],[2600,580,240,20],
  [2200,380,180,20],[2860,360,180,20],
  [2100,220,160,20],[2980,200,160,20],

  // ── Sector 3: Templo del Núcleo (x:3150–4200) ──────────────────────────
  // Wide arena floor tiers with narrow balcony rails on sides
  [3100,1020,280,20],[3780,1020,280,20],
  [3200,820,240,20],[3700,830,240,20],[3430,880,300,20],
  [3260,640,200,20],[3620,640,200,20],
  [3380,460,320,20]
 ];
 const checkpoints=[
  {id:'hub-stitcho-entry',x:230,y:1134,sector:0},
  {id:'hub-stitcho-echo',x:1460,y:1134,sector:1},
  {id:'hub-stitcho-circuit',x:2500,y:1134,sector:2},
  {id:'hub-stitcho-core',x:3170,y:1134,sector:3}
 ];
 const foes=[
  [300,1060,'cucaracho',false,{role:'pursuer',name:'Chatarrero del puerto',anchorY:1060}],
  [640,880,'phosquito',false,{role:'flyer',name:'Dron de las olas',anchorY:880}],
  [880,790,'cangrejo',false,{role:'shield',name:'Centinela chatarra',anchorY:790}],
  [1400,990,'rana',false,{role:'jumper',name:'Saltador eléctrico',anchorY:990}],
  [1810,870,'ufo',false,{role:'gunner',name:'Vigía estelar',anchorY:870}],
  [2200,1040,'cucaracho',false,{role:'pursuer',name:'Glitch corredero',anchorY:1040}],
  [2600,560,'phosquito',false,{role:'flyer',name:'Esfera de plasma',anchorY:560}],
  [2860,880,'rana',false,{role:'jumper',name:'Acróbata del circuito',anchorY:880}],
  [3200,1010,'cangrejo',false,{role:'shield',name:'Guardia del núcleo',anchorY:1010}],
  [3730,1010,'cucaracho',false,{role:'pursuer',name:'Último chatarrero',anchorY:1010}]
 ];
 return {...base,name:'Archipiélago del Caos',short:'Archipiélago',world:4,color:'#8bc8e5',
  hint:'Recoge 8 fragmentos, activa tres antenas y vence al Núcleo Glitch. J corta los arcos eléctricos; los raíles y trampolines abren las rutas altas.',
  doors:{...base.doors,up:null},plats:platforms,foes,
  orbs:[
   [360,820],[660,580],[900,480],[980,370],
   [1390,290],[1560,420],[1830,610],[1870,400],
   [2200,330],[2500,500],[2740,700],[2880,820],
   [3260,590],[3630,580]
  ],
  checkpoints,upExit:null,
  sectors:[
   {id:'hub-stitcho-0',name:'Playa de chatarra',x:0,w:1050,role:'explore'},
   {id:'hub-stitcho-1',name:'Puentes de resonancia',x:1050,w:1050,role:'platform'},
   {id:'hub-stitcho-2',name:'Circuitos cruzados',x:2100,w:1050,role:'secret'},
   {id:'hub-stitcho-3',name:'Templo del Núcleo',x:3150,w:1050,role:'combat'}
  ],
  hazards:[1190,2340].map((x,i)=>({id:'stitcho-fall-'+i,x,y:1100,w:100,h:360,type:'death',dest:null,label:'VACÍO DEL CAOS',color:'#a77bf2'}))
 };
}
