// Michicornio personal solo variant of the Claro (stable ID cat).
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
 // Moon-v458: forgiving connections and visible recovery steps, not another canonical room.
 // These are physical platforms and are included in the same collision/navigation arrays.
 platforms.push(
  [1140,1076,135,18],[1210,1015,122,18],
  [1710,950,165,18],[1845,1020,170,18],[1960,1080,150,18],
  [2150,1000,152,18],[2300,955,160,18],
  [2515,900,150,18],[2690,860,150,18],
  [3060,1040,155,18],[3100,945,152,18],
  [3380,925,156,18],[3540,900,148,18],
  [3600,760,155,18]
 );
 const checkpoints=[
  {id:'hub-michi-entry',x:230,y:1134,sector:0},
  {id:'hub-michi-bridges',x:1460,y:1134,sector:1},
  {id:'hub-michi-dreams',x:2500,y:1134,sector:2},
  {id:'hub-michi-temple',x:3200,y:1134,sector:3}
 ];
 const foes=[
  // Native AI remains the base kind; Michicornio's unique procedural body is michiKind.
  [360,1030,'cucaracho',false,{role:'pursuer',name:'Lince del Velo',michiKind:'lynx',anchorY:1030}],
  [720,930,'phosquito',false,{role:'flyer',name:'Polilla de Nácar',michiKind:'moth',anchorY:930}],
  [930,840,'cangrejo',false,{role:'shield',name:'Zarza de Amatista',michiKind:'thorn',anchorY:840}],
  [1380,970,'rana',false,{role:'jumper',name:'Lince Saltarín',michiKind:'lynx',anchorY:970}],
  [1700,780,'ufo',false,{role:'gunner',name:'Prisma del Sueño',michiKind:'prism',anchorY:780}],
  [2180,990,'medusa',false,{role:'flyer',name:'Medusilla Lunar',michiKind:'jelly',anchorY:990}],
  [2490,720,'phosquito',false,{role:'flyer',name:'Polilla del Eclipse',michiKind:'moth',anchorY:720}],
  [2800,850,'medusa',false,{role:'flyer',name:'Medusa Espectral',michiKind:'jelly',anchorY:850}],
  [3150,970,'planta',false,{role:'shooter',name:'Zarza de los Deseos',michiKind:'thorn',anchorY:970}],
  [3800,970,'ufo',false,{role:'gunner',name:'Centinela Prismático',michiKind:'prism',anchorY:970}]
 ];

 return {...base,name:'Santuario Lunar de Michicornio',short:'Luna',world:6,color:'#e5c2ff',
  hint:'Recoge 8 esencias de luna, sintoniza tres campanas astrales y despierta al Oráculo Medusaluna. El Ovillo (J) y el Ronroneo (K) disipan nieblas y abren rutas secretas.',
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

export function drawMichicornioPlatformTrim(ctx,platforms,cam,t,viewportW=1400,reduced=false){
 if(!Array.isArray(platforms))return 0;
 let painted=0;
 for(const p of platforms){
  const [x0,y0,w0,h0]=Array.isArray(p)?p:[p.x,p.y,p.w,p.h];
  if(!(h0>0&&h0<=26)||x0+w0<(cam?.x||0)-40||x0>(cam?.x||0)+viewportW+40)continue;
  const x=x0-(cam?.x||0),y=y0-(cam?.y||0);
  if(y< -45||y>(ctx.canvas?.height||1200)+50)continue;
  ctx.save();ctx.fillStyle='#8061a7';ctx.fillRect(x+3,y-2,w0-6,5);
  ctx.fillStyle='#efd2ff';ctx.fillRect(x+7,y-2,w0-14,2);
  for(let i=20;i<w0-15;i+=41){
   const glow=reduced?0:Math.sin(t*.055+x0*.01+i)*2;
   ctx.beginPath();ctx.moveTo(x+i,y-5+glow);ctx.lineTo(x+i+5,y-12+glow);
   ctx.lineTo(x+i+10,y-5+glow);ctx.closePath();ctx.fillStyle='#c3a2ef';ctx.fill();
   ctx.fillStyle='#fff2b7';ctx.fillRect(x+i+4,y-13+glow,2,3);
  }
  ctx.restore();painted++;
 }
 return painted;
}
