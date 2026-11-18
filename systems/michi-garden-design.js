// V654: a spatial chapter, not a row of interchangeable doors.
// Stable passage, farol and memory IDs keep earned saves compatible.
export function authorMichiGarden(room){
 const r=room.michiSanctuary;if(!r)return room;
 const by=id=>r.passages.find(a=>a.id===id);
 const set=(id,values)=>Object.assign(by(id),values);
 set('court-crypt',{x:3670,kind:'well',label:'Pozo de las raíces'});
 set('crypt-court',{kind:'root',label:'Raíces hacia el patio'});
 set('crypt-gallery',{kind:'mirror',label:'Espejo de la memoria'});
 set('gallery-crypt',{kind:'well'});
 set('court-maze',{x:5550,kind:'bramble',label:'Umbral de los ecos'});
 set('maze-court',{toX:5400,kind:'bramble'});
 set('maze-canopy',{kind:'wind',label:'Semilla del viento'});
 set('canopy-maze',{kind:'wind'});
 set('court-gallery',{x:4580,floor:850,kind:'mirror',label:'Balcón del recuerdo'});
 set('gallery-court',{toX:4580,toFloor:850,kind:'mirror',label:'Volver al balcón'});
 // The guardian is beyond the maze, not behind another doorway beside spawn.
 set('court-arena',{x:8030,kind:'moth',label:'Umbral de la Polilla'});
 set('arena-court',{toX:7920,kind:'moth',label:'Volver al laberinto'});
 set('court-exit',{x:9430,kind:'boat',label:'La barca de Cuerno'});
 // A recoverable rain channel: jump the gap or grow a permanent root bridge.
 room.plats=room.plats.filter(p=>!(p[0]===3300&&p[1]===1134));
 room.plats.push([3300,1134,1710,126],[5250,1134,2950,126],
  [4970,1324,360,30],[4880,1224,170,18],[5260,1224,170,18],
  [4320,930,170,18],[4480,850,220,26],
  [8390,1010,170,22],[9110,1010,170,22],[6760,340,200,18],[7160,260,190,18],[7450,425,160,18]);
 for(const [id,x,y] of [[19,4880,1107],[97,6850,313],[98,7250,233],[99,7510,398]])Object.assign(r.memories.find(m=>m.id===id),{x,y});
 r.garden={version:654,bridge:{x:5010,y:1134,w:240,h:24},
  mechanisms:[
   {id:'rain',kind:'bridge',x:4840,floor:1134,label:'Rueda de la lluvia',action:'E · regar las raíces y tender el puente'},
   {id:'hush',kind:'bell',x:2150,floor:1860,label:'Campana de las raíces',action:'E · calmar la fauna cercana'},
   {id:'wind',kind:'wind',x:6790,floor:620,label:'Flor del viento',action:'E · despertar la corriente ascendente'}
  ],
  moments:[
   {id:'bench',x:4030,floor:1134,title:'UN SITIO PARA TI',text:'La bufanda sigue en el banco. Alguien la dejó aquí porque sabía que volverías.'},
   {id:'roots',x:2600,floor:1860,title:'NO ESTABAS SOLO',text:'Bajo las raíces hay diez marcas pequeñas. La familia también tuvo miedo. Siguieron juntos.'},
   {id:'sky',x:7540,floor:620,title:'LA LUZ QUE DEJAS',text:'Michi no necesita ser enorme para alumbrar el camino de quien viene detrás.'}
  ],wind:{x:6650,y:290,w:250,h:330}};
 room.hint='El jardín responde a tus manos: riega las raíces, calma la cripta y despierta el viento. El balcón guarda la memoria; la Polilla espera al otro lado del laberinto.';
 r.version=654;return room;
}
