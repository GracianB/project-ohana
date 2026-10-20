// Personal single-player variant of the Claro for Chispín.
// Do not mutate the canonical shared Hoku ROOM; it is used by multiplayer, Kilo, Stitcho and the world graph.
export function createChispinRoom(base){
 if(base?.id!=='hub')throw new Error('Chispin room requires canonical hub');
 const platforms=[
  // Ground segments spanning the full 4200 width with two canonical chasms
  [0,1134,1190,126],[1290,1134,1050,126],[2440,1134,1760,126],
  // Sector 0 · Playa Electrostática (quartz sand & induction terraces)
  [140,1020,220,22],[340,910,230,22],[670,870,250,22],[960,770,230,22],
  [360,690,170,22],[530,550,220,22],[820,440,220,22],
  // Sector 1 · Pilares de Alto Voltaje (high voltage pylons & magnetic rails)
  [1350,980,240,22],[1510,860,220,22],[1810,970,240,22],
  [1640,620,180,22],[1390,490,230,22],[1880,400,240,22],
  // Sector 2 · Cañón de las Nubes (storm cloud catwalks & high platforms)
  [2010,860,260,22],[2250,730,220,22],[2490,920,230,22],
  [2690,810,230,22],[2870,680,230,22],
  [2610,510,220,22],[2300,350,240,22],[2600,250,230,22],[2880,190,250,22],
  // Sector 3 · Santuario de la Tormenta (dynamo temple & lightning altar)
  [3080,960,230,22],[3390,880,240,22],[3690,960,230,22],
  [3250,690,230,22],[3550,540,240,22],[3820,410,230,22]
 ];
 const checkpoints=[
  {id:'hub-chispin-entry',x:230,y:1134,sector:0},
  {id:'hub-chispin-pylons',x:1460,y:1134,sector:1},
  {id:'hub-chispin-canyon',x:2500,y:1134,sector:2},
  {id:'hub-chispin-sanctuary',x:3200,y:1134,sector:3}
 ];
 const foes=[
  [580,1050,'rana',false,{role:'jumper',name:'Saltador de chispa',anchorY:1050}],
  [830,820,'phosquito',false,{role:'flyer',name:'Mosquito voltaico',anchorY:820}],
  [1440,1085,'cangrejo',false,{role:'shield',name:'Centinela dinamo',anchorY:1085}],
  [1760,1080,'cucaracho',false,{role:'pursuer',name:'Corredor estático',anchorY:1080}],
  [1990,770,'ufo',false,{role:'gunner',name:'Torreta de arco',anchorY:770}],
  [2280,1060,'rana',false,{role:'jumper',name:'Rana de relámpago',anchorY:1060}],
  [2530,870,'phosquito',false,{role:'flyer',name:'Esfera eléctrica',anchorY:870}],
  [2760,720,'cucaracho',false,{role:'pursuer',name:'Voltio rodante',anchorY:720}],
  [3030,1010,'cangrejo',false,{role:'shield',name:'Guardia de alta tensión',anchorY:1010}],
  [3740,1050,'rana',false,{role:'jumper',name:'Centella del santuario',anchorY:1050}]
 ];
 return {...base,name:'Islas del Relámpago',short:'Relámpago',world:5,color:'#ffe45a',
  hint:'Recoge 8 bobinas, sintoniza tres pararrayos y desafía al Titán de Trueno. La Cadena (J) y el Paso Relámpago (K) superan barreras de arco y activan condensadores.',
  doors:{...base.doors,up:null},plats:platforms,foes,
  orbs:[
   [530,910],[830,810],[1090,720],[1520,810],[2090,810],[2390,680],[2840,640],[3600,830],
   [790,390],[1570,320],[2570,200],[2850,140],[3530,480],[3790,350]
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
