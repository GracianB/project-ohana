// CHISPÍN V454: tailor the existing Alien Lab, room 5 of Hoku's TEN rooms.
// There is no new eleventh room. Multiplayer retains the canonical lab.
export const CHISPIN_SECTORS=Object.freeze([
 Object.freeze({name:'Dársena de la chispa',start:0,end:1020,role:'intro'}),
 Object.freeze({name:'Puentes electrostáticos',start:1020,end:2080,role:'platform'}),
 Object.freeze({name:'Torre de las nubes',start:2080,end:3100,role:'hazards'}),
 Object.freeze({name:'Santuario de la Tormenta',start:3100,end:4200,role:'boss'})
]);
export function createChispinRoom(base){
 if(base?.id!=='lab')throw new Error('Chispin personal room requires Alien Lab');
 const platforms=[
  [0,1134,1110,126],[1210,1134,950,126],[2260,1134,1940,126],
  [120,1005,225,22],[365,925,245,22],[650,817,190,22],[870,675,245,22],
  [1240,1010,220,22],[1420,880,200,22],[1610,740,200,22],[1820,860,220,22],
  [2110,980,200,22],[2310,820,220,22],[2510,685,190,22],[2740,840,220,22],
  [2970,950,205,22],[3200,900,260,22],[3500,780,220,22],[3760,925,200,22],
  [980,500,170,22],[1920,540,170,22],[2890,480,220,22],
  [3410,560,200,22]
 ];
 const foes=[
  [520,1040,'cucaracho',false,{role:'pursuer',name:'Batería fugitiva',anchorY:1040}],
  [790,785,'phosquito',false,{role:'flyer',name:'Mosquito de voltaje',anchorY:785}],
  [1370,1030,'cangrejo',false,{role:'shield',name:'Blindado aislante',anchorY:1030}],
  [1610,690,'ufo',false,{role:'gunner',name:'Torreta esférica',anchorY:690}],
  [1990,1040,'rana',false,{role:'jumper',name:'Saltador magnético',anchorY:1040}],
  [2330,790,'phosquito',false,{role:'flyer',name:'Aguja de las nubes',anchorY:790}],
  [2700,1010,'cucaracho',false,{role:'pursuer',name:'Cortocircuito',anchorY:1010}],
  [3000,760,'ufo',false,{role:'gunner',name:'Nube vigía',anchorY:760}],
  [3400,1040,'cangrejo',false,{role:'shield',name:'Guardia del pararrayos',anchorY:1040}],
  [3810,1040,'rana',false,{role:'jumper',name:'Último salto eléctrico',anchorY:1040}]
 ];
 return {...base,name:'Islas del Relámpago',short:'Relámpago',world:4,
  color:'#ffe7a1',needEvo:0,doors:{left:null,right:null,up:null,down:null},portals:[],
  hint:'Activa tres pararrayos con fragmentos. Usa las plataformas magnéticas, corta las trampas con J y derrota al Ojo de la Tormenta.',
  width:4200,height:1260,plats:platforms,foes,orbs:[
   [410,930],[710,755],[1010,520],[1500,780],[2000,720],[2450,570],[2920,730],[3750,850]
  ],
  checkpoints:[
   {id:'lab-chispin-dock',x:250,y:1134,sector:0},
   {id:'lab-chispin-bridges',x:1450,y:1134,sector:1},
   {id:'lab-chispin-clouds',x:2460,y:1134,sector:2},
   {id:'lab-chispin-temple',x:3320,y:1134,sector:3}
  ],
  sectors:CHISPIN_SECTORS,
  hazards:[
   {id:'lab-chispin-abyss-1',x:1110,y:1120,w:100,h:300,type:'death',label:'MAR ELÉCTRICO'},
   {id:'lab-chispin-abyss-2',x:2160,y:1120,w:100,h:300,type:'death',label:'VACÍO DE LAS NUBES'}
  ]
 };
}
