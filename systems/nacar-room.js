// Optional branch of World 1: existing ten campaign seals remain compatible.
export function buildNacarRoom(){
 const stations=[[1400,1440],[3000,980],[4700,1590],[6500,760],[8100,1250]].map(([x,y],id)=>({id,x,y,kind:'pearl',phase:id*19,name:['La primera luz','El jardín de anémonas','El naufragio dormido','La catedral del coral','La puerta abisal'][id]}));
 const discoveries=[
  {id:'bell',kind:'echo',x:3900,y:1480,name:'Campana del pecio',line:'La campana sigue sonando bajo el agua. Su eco viaja hacia la bitácora, sobre la cubierta.'},
  {id:'log',kind:'echo',x:5100,y:1240,name:'Bitácora empapada',requires:'bell',line:'La última anotación señala un farol escondido en el coral, por encima de la cubierta.'},
  {id:'lantern',kind:'echo',x:5700,y:710,name:'Farol de la tripulación',requires:'log',line:'El farol despierta las dos bocas de la corriente del pecio.'},
  {id:'shortcut-west',kind:'shortcut',x:4070,y:1060,toX:7190,toY:1060,requires:'lantern',name:'Corriente hacia la catedral'},
  {id:'shortcut-east',kind:'shortcut',x:7300,y:1060,toX:4210,toY:1060,requires:'lantern',name:'Corriente hacia el pecio'},
  {id:'refuge-west',kind:'refuge',x:2290,y:1460,name:'Jardín de espuma'},
  {id:'refuge-east',kind:'refuge',x:8840,y:1540,name:'Refugio abisal'},
  {id:'route-tide',kind:'echo',x:7780,y:515,name:'Carta de las mareas',requires:'course-spire',line:'La carta señala la entrada a una gruta cerrada. Busca la corriente que brilla junto al coral, hacia el este.'},
  {id:'vault-in',kind:'shortcut',x:8120,y:460,toX:9410,toY:530,requires:'route-tide',name:'Gruta bioluminiscente'},
  {id:'vault-out',kind:'shortcut',x:9300,y:530,toX:8260,toY:460,name:'Volver al arrecife'},
  {id:'vault-shell',kind:'echo',x:9720,y:420,name:'La voz del arrecife',line:'En la pared quedan las marcas de la primera medusa que aprendió a leer las corrientes.'},
  {id:'vault-light',kind:'echo',x:10030,y:585,name:'Luz bajo la piedra',requires:'vault-shell',line:'Cuando la luz se apaga, el arrecife recuerda el camino que has trazado.'},
  {id:'conch',kind:'echo',x:5410,y:375,name:'Caracola de la cubierta',line:'Dentro de la caracola todavía se oye a la tripulación cantar para orientarse.'},
 ];
 const swimRoutes=[
  {
   id:'kelp',name:'Entre las algas',x:650,y:1430,limit:1800,fast:720,
   rings:[[820,1270],[1170,1110],[1500,1300],[1820,1100],[2130,910],[2410,820]],
  },
  {
   id:'spire',name:'La aguja de coral',x:5880,y:1560,limit:2100,fast:1080,
   rings:[[6090,1420],[6330,1170],[6330,982],[6330,822],[6530,770],[6870,550],[7250,680],[7510,1020]],
  },
  {
   id:'dawn',name:'La vuelta de la luz',x:10530,y:1410,limit:1800,fast:660,afterVictory:true,
   rings:[[10270,1280],[10040,1030],[9710,855],[9450,1070],[9170,1300],[8830,1440],[8570,1590]],
  },
 ];
 const shelves=[
  [900,1570,760,50],[2540,1120,900,50],[4300,1730,850,50],
  [6040,900,235,50],[6430,900,530,50],[7680,1390,900,50],
  [9100,1850,1900,70],[3200,700,400,40],[5150,470,500,45],
  // Kelp pilings and the coral needle.
  [1030,1320,46,210],[1600,780,52,260],[2010,1150,54,240],[7020,800,65,340],
  // The light grotto has a solid shell. Entry and return use an earned current.
  [9010,165,1350,60],[9010,220,60,460],[10300,220,60,460],
  [9010,675,1350,75],[9740,545,160,35],
 ];
 const foes=[
  [1870,1360,'pez',false,{role:'flyer',anchorY:1360,chapterHP:65,name:'Pez farol',nacarSpecies:'lantern'}],
  [3450,900,'medusa',false,{role:'flyer',anchorY:900,chapterHP:80,name:'Medusa de cristal',nacarSpecies:'crystal'}],
  [4800,1660,'cangrejo',false,{role:'shield',anchorFloor:1730,chapterHP:90,name:'Caracola del pecio',nacarSpecies:'hermit'}],
  [6750,650,'anguila',false,{role:'flyer',anchorY:650,chapterHP:100,name:'Anguila de coral',nacarSpecies:'eel'}],
  [8150,1150,'medusa',false,{role:'gunner',anchorY:1150,chapterHP:100,name:'Pólipo centinela',nacarSpecies:'polyp'}],
 ];
 const checkpoints=[[430,1850],[3000,1120],[6500,900],[8450,1850]]
  .map(([x,y],i)=>({id:'w1-nacar-checkpoint-'+i,x,y,sector:i}));
 return {
  id:'w1-nacar',hero:'nacar',name:'El jardín del fondo marino',world:5,world1:true,
  optionalChapter:true,nacarChapter:true,color:'#9de8e2',width:11000,height:2100,
  start:{x:430,y:1690},spawn:[430,1690],doors:{},discoveries,swimRoutes,
  grotto:{x:9070,y:225,w:1230,h:450},
  oceanExits:[{x:220,y:1775},{x:10800,y:1775}],
  plats:[[0,1850,11000,250],[0,0,40,2100],[10960,0,40,2100],...shelves],
  foes,orbs:Array.from({length:30},(_,i)=>[700+i*280,1500-Math.sin(i*.6)*500]),
  hazards:[],checkpoints,portals:[],
  sectors:[
   {x:0,w:3500,name:'Pradera de luz'},
   {x:3500,w:3500,name:'Pecio de las promesas'},
   {x:7000,w:4000,name:'Catedral abisal'},
  ],
  seal:{kind:'marea',stations,altar:{x:10400,y:1850}},
  tides:[
   {id:'west',x:3550,y:1740,area:{x:3500,y:700,w:350,h:1150},up:true},
   {id:'east',x:6200,y:1180,area:{x:6150,y:450,w:350,h:1350},up:false},
   {id:'arena-west',x:8940,y:1620,area:{x:8820,y:985,w:225,h:765},up:true},
   {id:'arena-east',x:10220,y:1010,area:{x:10110,y:900,w:245,h:735},up:false},
  ],
  hint:'Mantén salto para ascender y bajar para sumergirte. Suelta ambas teclas para flotar. Escucha las cinco perlas y prueba los aros de la pradera.',
 };
}
