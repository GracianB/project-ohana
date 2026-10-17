export const CAMP_HEROES = Object.freeze({
 kilo:{x:235,y:310,role:'Melodía y flotación',route:'Corrientes de polen y mecanismos musicales',prop:'music',lines:['La aventura empieza con una nota.','¿Quién ha convertido mi ukelele en una tostadora?','Vale. Ensayamos una vez más.']},
 stitcho:{x:460,y:230,role:'Acrobacias y agarre',route:'Paredes, trepa y recorridos verticales',prop:'kite',lines:['He encontrado un atajo. Está arriba.','¡Era una cometa! ¡ERA UNA COMETA!','Aterrizaje perfecto. Casi.']},
 chispin:{x:670,y:310,role:'Velocidad y electricidad',route:'Nubes eléctricas y circuitos de impulso',prop:'spark',lines:['Respira. Escucha. Hasta el rayo tiene su calma.','Ups. He meditado tan fuerte que he encendido la isla.','Puedo partir el cielo. Pero primero, un abrazo.']},
 cat:{x:925,y:230,role:'Precisión y salto lunar',route:'Saltos felinos y secretos a contraluz',prop:'moon',lines:['Esa mariposa sabe algo.','¡La tenía! Bueno, casi la tenía.','Estoy vigilando. No estoy durmiendo.']},
 dragon:{x:1120,y:310,role:'Potencia y planeo',route:'Corrientes de aire y vuelos encadenados',prop:'fire',lines:['Voy a tostar una nube.','¡Eso era el sombrero de Dino!','Ahora tiene ventilación. De nada.']},
 dino:{x:270,y:485,role:'Peso e impacto',route:'Grietas, pisotones y rebotes colosales',prop:'rock',lines:['Puedo saltar sin hacer ruido.','¿Ese terremoto ha sido mío?','Lo repito, pero de puntillas.']},
 frita:{x:475,y:450,role:'Impulso y deslizamiento',route:'Carriles rápidos y derrapes encadenados',prop:'salt',lines:['¡La última patata es para mí!','¡No freno! ¡NO FRENO!','He llegado antes que mi sombra.']},
 pizza:{x:690,y:485,role:'Elasticidad y rebotes',route:'Respiraderos de horno y saltos con rebote',prop:'cheese',lines:['He traído algo para compartir.','¿Por qué el queso sigue pegado a mí?','Vale. Un abrazo también cuenta.']},
 yomi:{x:930,y:450,role:'Ilusión y paso espectral',route:'Pasos huecos y mecanismos ocultos',prop:'lantern',lines:['Nadie me verá coger una galleta.','¿Por qué la galleta también es fantasma?','Era una galleta de mentira. Qué crueldad.']},
 cuerno:{x:1130,y:485,role:'Magia y travesuras',route:'Puentes Aurora y plataformas encantadas',prop:'rainbow',lines:['He preparado una sorpresa elegante.','Prrrf. Era una sorpresa por detrás.','¡Pero huele a flores! Creo.']}
});
export function campNearest(x,y,maxDistance=95){
 let best=null,distance=maxDistance;
 for(const [id,p] of Object.entries(CAMP_HEROES)){const d=Math.hypot(x-p.x,y-p.y);if(d<distance){best=id;distance=d;}}
 return best;
}
export function campViewport(width,height,selected='kilo'){
 const span=width<700?760:1400,scale=width/span;
 const center=width<700?Math.max(span/2,Math.min(1400-span/2,CAMP_HEROES[selected]?.x||235)):700;
 return {scale,x:center-span/2,y:0,height:height/scale};
}
export function campPresentation(id,seconds){
 const hero=CAMP_HEROES[id]||CAMP_HEROES.kilo;
 const phase=Math.min(2,Math.max(0,Math.floor(seconds/4)));
 return {phase,line:hero.lines[phase],pose:phase===0?'idle':phase===1?(id==='frita'||id==='stitcho'?'run':id==='pizza'||id==='cat'?'jump':'cast'):'victory',done:seconds>=12};
}
