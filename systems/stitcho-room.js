// Personal single-player variant of the Claro. Do not mutate the canonical
// shared Hoku ROOM; it is used by multiplayer, Kilo and the world graph.
export function createStitchoRoom(base){
 if(base?.id!=='hub')throw new Error('Stitcho room requires canonical hub');
 const platforms=[
  [0,1134,1190,126],[1290,1134,1050,126],[2440,1134,1760,126],
  [120,1020,230,22],[320,920,240,22],[690,880,260,22],[950,760,225,22],
  [1360,990,250,22],[1490,855,210,22],[1790,980,250,22],
  [1990,850,270,22],[2230,720,220,22],[2470,930,240,22],
  [2680,800,220,22],[2850,670,240,22],[3070,950,235,22],
  [3380,875,230,22],[3680,970,240,22],
  [350,700,160,22],[1650,600,160,22],[2590,500,210,22]
 ];
 const checkpoints=[
  {id:'hub-stitcho-entry',x:230,y:1134,sector:0},
  {id:'hub-stitcho-echo',x:1460,y:1134,sector:1},
  {id:'hub-stitcho-circuit',x:2500,y:1134,sector:2},
  {id:'hub-stitcho-core',x:3170,y:1134,sector:3}
 ];
 const foes=[
  [590,1050,'cucaracho',false,{role:'pursuer',name:'Chatarrero del puerto',anchorY:1050}],
  [825,830,'phosquito',false,{role:'flyer',name:'Dron de las olas',anchorY:830}],
  [1450,1085,'cangrejo',false,{role:'shield',name:'Centinela chatarra',anchorY:1085}],
  [1770,1080,'rana',false,{role:'jumper',name:'Saltador eléctrico',anchorY:1080}],
  [1980,780,'ufo',false,{role:'gunner',name:'Vigía estelar',anchorY:780}],
  [2290,1060,'cucaracho',false,{role:'pursuer',name:'Glitch corredero',anchorY:1060}],
  [2540,880,'phosquito',false,{role:'flyer',name:'Esfera de plasma',anchorY:880}],
  [2750,730,'rana',false,{role:'jumper',name:'Acróbata del circuito',anchorY:730}],
  [3020,1010,'cangrejo',false,{role:'shield',name:'Guardia del núcleo',anchorY:1010}],
  [3730,1050,'cucaracho',false,{role:'pursuer',name:'Último chatarrero',anchorY:1050}]
 ];
 return {...base,name:'Archipiélago del Caos',short:'Archipiélago',world:4,color:'#8bc8e5',
  hint:'Recoge 8 fragmentos, activa tres antenas y vence al Núcleo Glitch. J corta los arcos eléctricos; los raíles y trampolines cambian la ruta.',
  doors:{...base.doors,up:null},plats:platforms,foes,orbs:[[540,920],[840,820],[1100,710],[1530,810],[2100,810],[2400,670],[2850,630],[3610,830]],
  checkpoints,upExit:null,
  sectors:[
   {id:'hub-stitcho-0',name:'Playa de chatarra',x:0,w:1050,role:'explore'},
   {id:'hub-stitcho-1',name:'Puentes de resonancia',x:1050,w:1050,role:'platform'},
   {id:'hub-stitcho-2',name:'Circuitos cruzados',x:2100,w:1050,role:'secret'},
   {id:'hub-stitcho-3',name:'Templo del Núcleo',x:3150,w:1050,role:'combat'}
  ],
  // Keep safe cliff gaps consistent with the existing Hoku fall logic.
  hazards:[1190,2340].map((x,i)=>({id:'stitcho-fall-'+i,x,y:1100,w:100,h:360,type:'death',dest:null,label:'VACÍO DEL CAOS',color:'#a77bf2'}))
 };
}
