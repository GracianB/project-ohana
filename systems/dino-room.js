// Personal single-player variant of the Claro for Dino (dino).
// Do not mutate the canonical shared Hoku ROOM; it is used by multiplayer and the world graph.
export function createDinoRoom(base){
 if(base?.id!=='hub')throw new Error('Dino room requires canonical hub');
 const platforms=[
  // Ground segments spanning the full 4200 width with two prehistoric chasm drops
  [0,1134,1190,126],[1290,1134,1050,126],[2440,1134,1760,126],
  // Sector 0 · Garganta de los Fósiles (amber crags & fossilized ribs)
  [140,1020,230,22],[340,910,240,22],[670,870,250,22],[960,760,230,22],
  [360,690,170,22],[530,540,230,22],[820,430,220,22],
  // Sector 1 · Meseta de los Gigantes (ancient stone monoliths & mud geysers)
  [1350,980,250,22],[1510,860,220,22],[1810,970,250,22],
  [1640,610,180,22],[1390,480,230,22],[1880,390,240,22],
  // Sector 2 · Caverna del Ámbar Ancestral (deep fossil deposits & quartz ledges)
  [2010,850,260,22],[2250,720,230,22],[2490,920,240,22],
  [2690,800,230,22],[2870,670,240,22],
  [2610,500,220,22],[2300,340,240,22],[2600,240,230,22],[2880,180,250,22],
  // Sector 3 · Cúspide del Guardián Antiguo (prehistoric stone arena & relic shrine)
  [3080,950,240,22],[3390,870,240,22],[3690,960,240,22],
  [3250,680,230,22],[3550,530,240,22],[3820,400,230,22]
 ];
 const checkpoints=[
  {id:'hub-dino-entry',x:230,y:1134,sector:0},
  {id:'hub-dino-plateau',x:1460,y:1134,sector:1},
  {id:'hub-dino-cavern',x:2500,y:1134,sector:2},
  {id:'hub-dino-shrine',x:3200,y:1134,sector:3}
 ];
 const foes=[
  [580,1050,'cangrejo',false,{role:'pursuer',name:'Trilobite acorazado',anchorY:1050}],
  [830,830,'escoria',false,{role:'flyer',name:'Pterosaurio fósil',anchorY:830}],
  [1440,1085,'cangrejo',false,{role:'shield',name:'Caparazón de ámbar',anchorY:1085}],
  [1770,1080,'rana',false,{role:'jumper',name:'Anfibio primigenio',anchorY:1080}],
  [1990,780,'ufo',false,{role:'gunner',name:'Centinela fósil',anchorY:780}],
  [2280,1060,'cangrejo',false,{role:'pursuer',name:'Reptil de piedra',anchorY:1060}],
  [2530,880,'escoria',false,{role:'flyer',name:'Arqueópteryx',anchorY:880}],
  [2760,730,'rana',false,{role:'jumper',name:'Saltador de basalto',anchorY:730}],
  [3030,1010,'cangrejo',false,{role:'shield',name:'Guardián de cuarzo',anchorY:1010}],
  [3740,1050,'cangrejo',false,{role:'pursuer',name:'Heraldo de la roca',anchorY:1050}]
 ];
 return {...base,name:'Valle de los Gigantes',short:'Gigantes',world:8,color:'#81c784',
  hint:'Recoge los 8 fósiles maestros, salta en los géiseres de fango y aplasta las rocas ancestrales con Pisotón (J) o Carga Fósil (K). Derrota al Coloso de Piedra para reclamar el Fósil de la Familia.',
  doors:{...base.doors,up:null},plats:platforms,foes,
  orbs:[
   [530,910],[830,810],[1090,710],[1520,810],[2090,810],[2390,670],[2840,630],[3600,830],
   [790,380],[1570,310],[2570,190],[2850,130],[3530,470],[3790,340]
  ],
  checkpoints,upExit:null,
  sectors:[
   {id:'hub-dino-0',name:'Garganta de los Fósiles',x:0,w:1050,role:'explore'},
   {id:'hub-dino-1',name:'Meseta de los Gigantes',x:1050,w:1050,role:'platform'},
   {id:'hub-dino-2',name:'Caverna del Ámbar Ancestral',x:2100,w:1050,role:'secret'},
   {id:'hub-dino-3',name:'Cúspide del Guardián Antiguo',x:3150,w:1050,role:'combat'}
  ],
  hazards:[1190,2340].map((x,i)=>({id:'dino-fall-'+i,x,y:1100,w:100,h:360,type:'death',dest:null,label:'ABISMO DE FANGO',color:'#5d4037',heroEscape:'dino'}))
 };
}
