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
  {id:'conch',kind:'echo',x:5410,y:375,name:'Caracola de la cubierta',line:'Dentro de la caracola todavía se oye a la tripulación cantar para orientarse.'},
 ];
 const shelves=[[900,1570,760,50],[2540,1120,900,50],[4300,1730,850,50],[6040,900,920,50],[7680,1390,900,50],[9100,1850,1900,70],[3200,700,400,40],[5150,470,500,45]];
 return {id:'w1-nacar',hero:'nacar',name:'El jardín del fondo marino',world:5,world1:true,optionalChapter:true,nacarChapter:true,color:'#9de8e2',width:11000,height:2100,start:{x:430,y:1690},spawn:[430,1690],doors:{},discoveries,oceanExits:[{x:220,y:1775},{x:10800,y:1775}],plats:[[0,1850,11000,250],[0,0,40,2100],[10960,0,40,2100],...shelves],foes:[[1870,1360,'pez',false,{role:'flyer',anchorY:1360,chapterHP:65,name:'Pez farol'}],[3450,900,'medusa',false,{role:'flyer',anchorY:900,chapterHP:80,name:'Medusa de cristal'}],[4800,1660,'cangrejo',false,{role:'shield',anchorFloor:1730,chapterHP:90,name:'Caracola del pecio'}],[6750,650,'anguila',false,{role:'flyer',anchorY:650,chapterHP:100,name:'Anguila de coral'}],[8150,1150,'medusa',false,{role:'gunner',anchorY:1150,chapterHP:100,name:'Pólipo centinela'}]],orbs:Array.from({length:30},(_,i)=>[700+i*280,1500-Math.sin(i*.6)*500]),hazards:[],checkpoints:[[430,1850],[3000,1120],[6500,900],[8450,1850]].map(([x,y],i)=>({id:'w1-nacar-checkpoint-'+i,x,y,sector:i})),portals:[],sectors:[{x:0,w:3500,name:'Pradera de luz'},{x:3500,w:3500,name:'Pecio de las promesas'},{x:7000,w:4000,name:'Catedral abisal'}],seal:{kind:'marea',stations,altar:{x:10400,y:1850}},tides:[{id:'west',x:3550,y:1740,area:{x:3500,y:700,w:350,h:1150},up:true},{id:'east',x:6200,y:1180,area:{x:6150,y:450,w:350,h:1350},up:false}],hint:'Mantén salto para ascender y bajar para sumergirte. E / Usar abre las cinco perlas cuando brillan y cambia las corrientes. Busca la campana del pecio para encontrar una ruta corta entre sus dos lados.'};
}
