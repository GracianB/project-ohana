// Personal single-player variant of the Claro for Michi (cat).
// Do not mutate the canonical shared Hoku ROOM; it is used by multiplayer, Kilo, Stitcho, Chispín and the world graph.
export function createMichiRoom(base){
 if(base?.id!=='hub')throw new Error('Michi room requires canonical hub');
 const platforms=[
  // Ground segments spanning the full 4200 width with two canonical chasms
  [0,1134,1190,126],[1290,1134,1050,126],[2440,1134,1760,126],
  // Sector 0 · Caverna de los Ecos (rose quartz & bioluminescent terraces)
  [130,1020,230,22],[330,910,240,22],[680,870,250,22],[970,760,220,22],
  [350,690,170,22],[520,540,230,22],[810,430,220,22],
  // Sector 1 · Puentes del Firmamento (floating lunar crystal spans)
  [1360,980,250,22],[1500,860,220,22],[1800,970,250,22],
  [1650,610,180,22],[1380,480,230,22],[1870,390,240,22],
  // Sector 2 · Laberinto de los Sueños (dream catwalks & high platforms)
  [2000,850,260,22],[2240,720,230,22],[2480,920,240,22],
  [2680,800,230,22],[2860,670,240,22],
  [2600,500,220,22],[2290,340,240,22],[2590,240,230,22],[2870,180,250,22],
  // Sector 3 · Templo de la Luna Llena (astral sanctuary & moon altar)
  [3070,950,240,22],[3380,870,240,22],[3680,960,240,22],
  [3240,680,230,22],[3540,530,240,22],[3810,400,230,22]
 ];
 const checkpoints=[
  {id:'hub-michi-entry',x:230,y:1134,sector:0},
  {id:'hub-michi-bridges',x:1460,y:1134,sector:1},
  {id:'hub-michi-dreams',x:2500,y:1134,sector:2},
  {id:'hub-michi-temple',x:3200,y:1134,sector:3}
 ];
 const foes=[
  [590,1050,'cucaracho',false,{role:'pursuer',name:'Sombra de la caverna',anchorY:1050}],
  [820,830,'phosquito',false,{role:'flyer',name:'Polilla lunar',anchorY:830}],
  [1450,1085,'cangrejo',false,{role:'shield',name:'Guardián de cuarzo',anchorY:1085}],
  [1780,1080,'rana',false,{role:'jumper',name:'Saltador onírico',anchorY:1080}],
  [1990,780,'ufo',false,{role:'gunner',name:'Orbe espectral',anchorY:780}],
  [2290,1060,'cucaracho',false,{role:'pursuer',name:'Merodeador nocturno',anchorY:1060}],
  [2540,880,'phosquito',false,{role:'flyer',name:'Fatuo de luna',anchorY:880}],
  [2770,730,'rana',false,{role:'jumper',name:'Acróbata astral',anchorY:730}],
  [3040,1010,'cangrejo',false,{role:'shield',name:'Centinela del eclipse',anchorY:1010}],
  [3750,1050,'cucaracho',false,{role:'pursuer',name:'Lince de las sombras',anchorY:1050}]
 ];
 return {...base,name:'Los Jardines de la Luna',short:'Jardines',world:6,color:'#e5c2ff',
  hint:'Recoge 8 esencias de luna, sintoniza tres campanas astrales y despierta al Espíritu Astral Felino. El Ovillo (J) y el Ronroneo (K) disipan nieblas y abren rutas secretas.',
  doors:{...base.doors,up:null},plats:platforms,foes,
  orbs:[
   [540,910],[840,810],[1100,710],[1530,810],[2100,810],[2400,670],[2850,630],[3610,830],
   [800,380],[1580,310],[2580,190],[2860,130],[3540,470],[3800,340]
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
