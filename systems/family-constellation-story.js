export const FAMILY_STARS=Object.freeze([
 {id:'kilo',name:'Kilo',color:'#ffacc2',gift:'Un hogar',line:'No hacía falta tocar perfecto. Hacía falta que volvieras a tocar.'},
 {id:'stitcho',name:'Stitcho',color:'#67ddff',gift:'Una segunda oportunidad',line:'No soy las piezas que se rompieron. Soy las manos que aprendieron a unirlas.'},
 {id:'chispin',name:'Chispín',color:'#fff29a',gift:'La chispa',line:'La tormenta también puede iluminar el camino de vuelta.'},
 {id:'cat',name:'Michicornio',color:'#ceb2ff',gift:'Un sueño',line:'Cambié de forma muchas veces. Siempre hubo alguien que me reconoció.'},
 {id:'dragon',name:'Dragón',color:'#ff905d',gift:'El calor',line:'Hoy mi fuego no guarda una puerta. Calienta un lugar en la mesa.'},
 {id:'dino',name:'Dino',color:'#b8ef6b',gift:'La memoria',line:'La tierra recuerda cada paso. También los pequeños.'},
 {id:'frita',name:'Frita',color:'#ffe9a8',gift:'La alegría',line:'Si queda una patata, la partimos. Si no queda ninguna, nos reímos igual.'},
 {id:'pizza',name:'Pizza',color:'#ffd36a',gift:'Un sitio en la mesa',line:'He contado otra vez. Hay una porción para ti.'},
 {id:'yomi',name:'Yomi',color:'#8fe9ff',gift:'La conexión',line:'Diez señales distintas. Una certeza: nadie estaba solo.'},
 {id:'cuerno',name:'Cuerno',color:'#eccbff',gift:'La esperanza',line:'La aurora no borra la noche. Nos enseña lo que hemos cuidado dentro de ella.'}
]);
export function constellationProgress(lights=[]){const set=new Set(lights);const count=FAMILY_STARS.filter(s=>set.has(s.id)).length;return {count,complete:count===10,title:count===10?'La última luz eres tú.':'Cada voz enciende un lugar.'};}
