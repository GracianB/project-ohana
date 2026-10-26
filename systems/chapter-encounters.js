// Authored groups answer the chapter's movement vocabulary. They replace
// incidental patrols locally; no endless waves, kill gate or bonus XP grant.
export const CHAPTER_ENCOUNTERS=Object.freeze({
 kilo:{name:'Contrapunto',lesson:'Cambia de altura: el escudo protege delante y el vigía cubre el aire.',groups:[[2140,["shield","flyer","jumper"]],[5100,["shooter","pursuer","flyer"]],[7160,["shield","gunner","jumper","flyer"]]],kinds:['cangrejo','gaviota','planta']},
 stitcho:{name:'Guardia del astillero',lesson:'Despeja el taller con plasma; la ruta elevada deja espacio para transportar piezas.',groups:[[2440,["shield","shooter","pursuer"]],[4120,["pursuer","jumper","flyer"]],[7180,["gunner","shield","flyer","jumper"]]],kinds:['cucaracho','ufo','rana']},
 chispin:{name:'Circuito de caza',lesson:'J enlaza al grupo; termina el blink fuera de la línea del tirador.',groups:[[2520,["pursuer","shooter","jumper"]],[4860,["shield","flyer","shooter"]],[7180,["captain","jumper","shooter","flyer"]]],kinds:['abeja','anguila','libelula']},
 cat:{name:'Ronda sonámbula',lesson:'Duerme la ronda antes de subir a las medusas; la zarpa alcanza al vigía.',groups:[[2450,["jumper","shooter","pursuer"]],[4760,["flyer","pursuer","shield"]],[7160,["shield","jumper","flyer","shooter"]]],kinds:['arana','medusa','murcielago']},
 cuerno:{name:'Jardineros del prisma',lesson:'Gana el flanco corriendo; una onda arcoíris atraviesa la línea de guardias.',groups:[[2450,["shield","shooter","jumper"]],[4950,["pursuer","flyer","shooter"]],[7270,["gunner","shield","jumper","flyer"]]],kinds:['cangrejo','planta','libelula']},
 dragon:{name:'Custodios de la chimenea',lesson:'El suelo está vigilado: gana altura con una térmica y baja por el flanco.',groups:[[2530,["shield","flyer","jumper"]],[4830,["gunner","flyer","pursuer"]],[7140,["flyer","shooter","shield","jumper"]]],kinds:['escoria','brasita','murcielago']},
 dino:{name:'Coraza del cañón',lesson:'El escudo frena el ataque frontal. Una caída K abre la coraza del grupo.',groups:[[2470,["shield","pursuer","jumper"]],[4890,["shield","shooter","flyer"]],[7160,["captain","shield","jumper","shooter"]]],kinds:['cangrejo','cucaracho','rana']},
 frita:{name:'Peaje del viento',lesson:'Los tiradores cubren la calle; aprovecha el vuelo del géiser para pasar por encima.',groups:[[2520,["gunner","pursuer","jumper"]],[4780,["shooter","jumper","flyer"]],[7180,["gunner","shield","flyer","jumper"]]],kinds:['gaviota','cangrejo','abeja']},
 pizza:{name:'Ronda del reparto',lesson:'Despeja la calle antes de recoger el pedido; usa los balcones entre entregas.',groups:[[2520,["pursuer","shield","jumper"]],[4850,["gunner","pursuer","flyer"]],[7180,["jumper","shield","shooter","flyer"]]],kinds:['cucaracho','cangrejo','planta']},
 yomi:{name:'Cortafuegos del observatorio',lesson:'Lee la preparación del tirador y reserva K para borrar su descarga mientras esperas AHORA.',groups:[[2520,["shooter","shield","jumper"]],[4860,["gunner","flyer","pursuer"]],[7160,["captain","shooter","shield","flyer"]]],kinds:['ufo','anguila','cucaracho']}
});
export function authorChapterEncounters(hero,room,topAt){
 const plan=CHAPTER_ENCOUNTERS[hero];if(!plan)return;
 for(const [stage,[anchor,roles]] of plan.groups.entries()){
  // Preserve named mechanics/guardian actors, replace only incidental patrols.
  room.foes=room.foes.filter(f=>f[4]?.special||f[4]?.encounterId||Math.abs(f[0]-anchor)>290);
  roles.forEach((role,i)=>{
   const x=anchor+(i-(roles.length-1)/2)*150,air=role==='flyer',floor=topAt(x+20);
   room.foes.push([x,air?floor-200:floor-40,plan.kinds[i%plan.kinds.length],false,
    {role,name:plan.name,chapterHP:85+stage*35,variant:i,anchorFloor:air?undefined:floor,anchorY:air?floor-200:floor-40,flightBand:air?{top:floor-350,bottom:floor-100}:undefined,authoredEncounter:stage}]);
  });
 }
 room.encounterDirection=plan;
}
