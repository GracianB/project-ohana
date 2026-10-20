// Personal single-player variant of the Claro for Dragón (dragon).
// Do not mutate the canonical shared Hoku ROOM; it is used by multiplayer, Kilo, Stitcho, Chispín, Michi and the world graph.
export function createDragonRoom(base){
 if(base?.id!=='hub')throw new Error('Dragon room requires canonical hub');
 const platforms=[
  // Ground segments spanning the full 4200 width with two canonical magma chasms
  [0,1134,1190,126],[1290,1134,1050,126],[2440,1134,1760,126],
  // Sector 0 · Garganta de Obsidiana (volcanic basalt & thermal ledges)
  [140,1020,230,22],[340,910,240,22],[670,870,250,22],[960,760,230,22],
  [360,690,170,22],[530,540,230,22],[820,430,220,22],
  // Sector 1 · Ríos de Magma y Geiseres (floating igneous rock & updrafts)
  [1350,980,250,22],[1510,860,220,22],[1810,970,250,22],
  [1640,610,180,22],[1390,480,230,22],[1880,390,240,22],
  // Sector 2 · Caverna de las Brasas (incandescent stalactite catwalks)
  [2010,850,260,22],[2250,720,230,22],[2490,920,240,22],
  [2690,800,230,22],[2870,670,240,22],
  [2610,500,220,22],[2300,340,240,22],[2600,240,230,22],[2880,180,250,22],
  // Sector 3 · Cúspide del Dragón Celestial (ancient fire temple & altar)
  [3080,950,240,22],[3390,870,240,22],[3690,960,240,22],
  [3250,680,230,22],[3550,530,240,22],[3820,400,230,22]
 ];
 const checkpoints=[
  {id:'hub-dragon-entry',x:230,y:1134,sector:0},
  {id:'hub-dragon-geysers',x:1460,y:1134,sector:1},
  {id:'hub-dragon-cavern',x:2500,y:1134,sector:2},
  {id:'hub-dragon-shrine',x:3200,y:1134,sector:3}
 ];
 const foes=[
  [580,1050,'brasita',false,{role:'pursuer',name:'Llama errante',anchorY:1050}],
  [830,830,'escoria',false,{role:'flyer',name:'Chispa volcánica',anchorY:830}],
  [1440,1085,'cangrejo',false,{role:'shield',name:'Caparazón de magma',anchorY:1085}],
  [1770,1080,'rana',false,{role:'jumper',name:'Salamandra ígnea',anchorY:1080}],
  [1990,780,'ufo',false,{role:'gunner',name:'Centinela de lava',anchorY:780}],
  [2280,1060,'brasita',false,{role:'pursuer',name:'Fatuo de magma',anchorY:1060}],
  [2530,880,'escoria',false,{role:'flyer',name:'Ceniza viva',anchorY:880}],
  [2760,730,'rana',false,{role:'jumper',name:'Saltador de lava',anchorY:730}],
  [3030,1010,'cangrejo',false,{role:'shield',name:'Guardián de obsidiana',anchorY:1010}],
  [3740,1050,'brasita',false,{role:'pursuer',name:'Heraldo de brasas',anchorY:1050}]
 ];
 return {...base,name:'Cordillera de las Brasas',short:'Brasas',world:7,color:'#ff8a65',
  hint:'Recoge 8 brasas maestras, activa las corrientes térmicas para planear alto y derrota al Guardián del Núcleo Ígneo. El Aliento (J) y la Batida de Ala (K) abren compuertas y encienden braseros.',
  doors:{...base.doors,up:null},plats:platforms,foes,
  orbs:[
   [530,910],[830,810],[1090,710],[1520,810],[2090,810],[2390,670],[2840,630],[3600,830],
   [790,380],[1570,310],[2570,190],[2850,130],[3530,470],[3790,340]
  ],
  checkpoints,upExit:null,
  sectors:[
   {id:'hub-dragon-0',name:'Garganta de Obsidiana',x:0,w:1050,role:'explore'},
   {id:'hub-dragon-1',name:'Ríos de Magma y Geiseres',x:1050,w:1050,role:'platform'},
   {id:'hub-dragon-2',name:'Caverna de las Brasas',x:2100,w:1050,role:'secret'},
   {id:'hub-dragon-3',name:'Cúspide del Dragón Celestial',x:3150,w:1050,role:'combat'}
  ],
  hazards:[1190,2340].map((x,i)=>({id:'dragon-fall-'+i,x,y:1100,w:100,h:360,type:'death',dest:null,label:'MAGMA MORTAL',color:'#ff623a',heroEscape:'dragon'}))
 };
}
