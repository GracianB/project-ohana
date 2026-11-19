export const MICHI_FRAGMENTS=Object.freeze([["Un nudo torcido", "El hilo rojo", "La primera lluvia", "El banco vacío", "Una pata mojada", "La puerta abierta", "Un sitio caliente", "La bufanda doblada", "Alguien esperaba", "Michi volvió"], ["Una raíz curva", "La tierra tibia", "El ruido pequeño", "Dos ojos atentos", "Una campana vieja", "El eco responde", "La cesta guardada", "El miedo compartido", "Un camino juntos", "Una casa aquí"], ["El ovillo azul", "Tres cascabeles", "La nota de estrella", "La nota de luna", "La nota de hoja", "Un salto fallido", "La risa de Yomi", "La segunda vuelta", "El juego sigue", "Nadie pierde aquí"], ["Una gota salada", "Una concha hueca", "El reflejo del agua", "Un abrazo blando", "La voz de Nácar", "La luz sumergida", "Una ola pequeña", "El cristal respira", "El mar escucha", "La marea vuelve"], ["Un rincón estrecho", "Las orejas negras", "Un paso diminuto", "El borde de piedra", "Un atajo de raíces", "La sombra amiga", "La huella ligera", "Una salida arriba", "El regreso seguro", "Ser pequeño basta"], ["La luz dormida", "Un ala de polvo", "El farol cerrado", "La seda tiembla", "Una pausa clara", "La guardiana escucha", "Un refugio a tiempo", "La luz compartida", "La noche descansa", "El farol se abre"], ["Un paraguas vivo", "El borde de nácar", "Una estrella redonda", "Cinco brazos suaves", "Un tentáculo tímido", "Una perla de espuma", "La primera palabra", "Una amiga nueva", "El océano cabe", "Un lugar para Nácar"], ["La nota de Kilo", "La cometa de Stitcho", "La chispa de Chispín", "El salto de Michi", "La aurora de Cuerno", "El calor de Dragón", "El paso de Dino", "La risa de Frita", "La porción de Pizza", "El farol de Yomi"], ["La semilla dormida", "Una corriente tibia", "El ala rasgada", "Un salto al vacío", "La mano ofrecida", "El jardín alto", "Una nube cercana", "La confianza vuelve", "Las alas descansan", "El camino compartido"], ["La mesa preparada", "El plato pequeño", "La bufanda roja", "La luz de Nácar", "Un farol encendido", "El juego a medias", "La silla guardada", "El cuento completo", "La canción del hogar", "Volvemos juntos"]].map(page=>Object.freeze(page)));
// Michi's finished spatial chapter: natural trails, optional rooms and small games.
// Save IDs are additive. No automatic seals, XP or evolution changes.
export const MICHI_PAGES=Object.freeze(['La bufanda que volvió','Una casa entre raíces','Jugar sin miedo','La voz del estanque','El camino de Ónice','La noche del farol','Una amiga bajo el agua','Diez pequeñas promesas','Las alas que compartimos','Volver juntos a casa']);
export function authorMichiAdventure(room){
 const r=room.michiSanctuary;if(!r)return room;
 r.version=800;
 // Give the lookout its own space; it must never consume the aquarium's Use.
 r.garden.moments.find(m=>m.id==='sky').x=7310;
 // Same-height connections are walking paths, never teleport doors.
 for(const id of['court-maze','maze-court','court-arena','arena-court']){const p=r.passages.find(p=>p.id===id);p.walkThrough=true;p.kind='trail';p.label=id.includes('arena')?'Sendero de la Polilla':'Sendero de los ecos';}
 r.passages.find(p=>p.id==='crypt-gallery').hiddenBy='hollow';
 r.zones.push({id:'hollow',name:'El escondite del ovillo',x:450,y:1000,w:2700,h:260,floor:1134,secret:true},{id:'tide',name:'El acuario de la luna',x:450,y:40,w:2700,h:330,floor:300,secret:true});
 const passage=(id,x,floor,toX,toFloor,label,extra={})=>({id,x,floor,toX,toFloor,label,need:0,kind:'root',...extra});
 r.passages.push(passage('crypt-hollow',2630,1860,730,1134,'El escondite del ovillo',{hiddenBy:'hush',secret:true}),passage('hollow-crypt',2840,1134,2710,1860,'Volver a las raíces'),passage('canopy-tide',7580,620,820,300,'El acuario de la luna',{kind:'mirror',hiddenBy:'wind',secret:true}),passage('tide-canopy',2860,300,7470,620,'Volver al jardín',{kind:'mirror'}));
 room.plats.push([450,300,2700,44],[850,220,180,18],[1190,150,180,18],[1560,200,180,18],[1980,140,180,18],[2450,210,180,18],[900,1054,180,18],[1330,974,180,18],[1800,1054,180,18],[2310,974,180,18]);
 // Small destinations with genuine interactions, independent of the seal path.
 r.garden.mechanisms.push(...[0,1,2].map(note=>({id:'hollow-'+note,kind:'chime',note,x:1360+note*220,floor:1134,label:['Cascabel de luna','Cascabel de hoja','Cascabel de estrella'][note],action:'E · tocar este cascabel'})),{id:'tide',kind:'rescue',x:1740,floor:300,label:'Nácar · Una voz del mar',action:'E · escuchar a Nácar'},{id:'race',kind:'race',x:5900,floor:1134,label:'Carrera de luciérnagas',action:'E · empezar la carrera opcional'});
 r.garden.moments.push({id:'home',x:2370,floor:1134,title:'EL OVILLO NO ERA UN TESORO',text:'Era un juego que Michi dejó a medias. Alguien lo guardó para poder terminarlo juntos.'},{id:'nacar',x:2300,floor:300,title:'EL MAR TAMBIÉN TIENE CASA',text:'Nácar llegó siguiendo una estrella de mar. Las estrellas de mar le enseñaron a defender el arrecife.'});
 r.garden.mechanisms.push({id:'ocean',kind:'ocean',x:2580,floor:300,label:'Paso de Nácar',action:'E · entrar como Nácar'});
 r.adventure={race:{start:5900,end:7680,floor:1134,limit:900},chimes:[2,0,1],pages:MICHI_PAGES,bossSign:{x:7940,floor:1134,label:'POLILLA DEL FAROL →',tip:'Cinco faroles despiertan a la guardiana. Su luz se abre entre ataques.'}};
 // Six memories reward each optional room; all original collection identities survive.
 for(let i=0;i<6;i++){Object.assign(r.memories.find(m=>m.id===10+i),{x:930+i*235,y:1107,challenge:true});Object.assign(r.memories.find(m=>m.id===70+i),{x:910+i*235,y:273,challenge:true});}
 for(const m of r.memories){m.title=MICHI_PAGES[m.page];m.fragment=(m.id%10)+1;m.caption=MICHI_FRAGMENTS[m.page][m.id%10];m.story=m.caption+' · '+m.title+' · '+m.fragment+'/10';}
 const names=['Hiladora del ovillo','Polilla del polen','Vigía de semillas','Caracola centinela','Lucerna de marea'];
 for(const f of room.foes){const meta=f[4];meta.michiSpecies=['weaver','moth','seed','snail','tide'][['arana','murcielago','phosquito','ufo','medusa'].indexOf(f[2])]||'moth';meta.name=names[['arana','murcielago','phosquito','ufo','medusa'].indexOf(f[2])]||meta.name;}
 r.garden.mechanisms.push(...[0,1].map(i=>({id:'guardian-'+i,kind:'guard',x:8410+i*740,floor:1010,label:'Farol de refugio',action:'E · preparar escudo de un golpe'})));
 room.hint='Camina del patio al laberinto y al santuario. Solo el pozo, el balcón y la semilla cambian de altura. Calma las raíces y despierta el viento para descubrir dos escondites.';
 return room;
}
const list=g=>g.secrets?.['w1-cat']||[];
export const adventureHas=(g,id)=>list(g).includes('w1-cat-garden-'+id);
export const passageVisible=(g,a)=>!a.hiddenBy||adventureHas(g,a.hiddenBy);
export function updateMichiAdventure(g){
 const r=g.roomDef?.michiSanctuary,p=g.player;if(!r?.adventure||!p||p.dead)return;
 const run=g._michiRace;if(run?.active){if(p.x<r.adventure.race.start-160||p.x>r.adventure.race.end+250||Math.abs(p.y+p.h-r.adventure.race.floor)>420){run.active=false;return;}run.t++;if(run.t>r.adventure.race.limit){run.active=false;g._michiGardenMoment={title:'OTRA VUELTA CUANDO QUIERAS',text:'Las luciérnagas vuelven al inicio. Tu progreso no se pierde.',age:0};}
 else if(p.x>=r.adventure.race.end&&Math.abs(p.y+p.h-r.adventure.race.floor)<220){run.active=false;g.secrets||={};const a=g.secrets['w1-cat']||=[];if(!a.includes('w1-cat-garden-race'))a.push('w1-cat-garden-race');g._michiGardenMoment={title:'CORRIMOS JUNTOS',text:'Las luciérnagas llegan contigo. La carrera puede repetirse sin premios duplicados.',age:0};g.save?.();}}
}
