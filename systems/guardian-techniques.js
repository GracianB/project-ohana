// Authored decisions are committed at warning time. No frame-by-frame retargeting.
const RHYTHMS=Object.freeze({
 easy:Object.freeze({health:.75,warn:94,rest:160,firstRest:140,window:225,pace:1.2,shot:.82,lead:4}),
 normal:Object.freeze({health:1,warn:60,rest:106,firstRest:88,window:195,pace:2.1,shot:1,lead:8}),
 hard:Object.freeze({health:1.18,warn:46,rest:82,firstRest:72,window:180,pace:2.8,shot:1.12,lead:11})
});
export function guardianRhythm(profile){return profile?.budget<=1?RHYTHMS.easy:profile?.budget>=4?RHYTHMS.hard:RHYTHMS.normal;}
const MOVES=Object.freeze({
 tide:[['Redoble de orilla','Salta la onda y cambia de altura para evitar la nota.'],['Coro del cielo','Tres notas buscan la altura del aviso. Sal de esa línea.'],['Contramarea','Dos ondas separadas: salta tarde y prepara el aterrizaje.']],
 crossfire:[['Abanico de plasma','Cambia de altura después del aviso.'],['Aguja del astillero','Dos disparos por la misma línea: desplázate fuera de ella.'],['Costura cruzada','Dos abanicos dejan un hueco entre sus trayectorias.']],
 lightning:[['Tridente celeste','Tres columnas fijadas: avanza al hueco libre.'],['Aguja del trueno','Una columna amplia y una chispa: sal de la marca.'],['Circuito partido','Las columnas exteriores se cierran: busca el hueco central.']],
 moons:[['Lunas abiertas','Esquiva el abanico y acércate al descansar.'],['Garra del eclipse','La zarpa apunta al aviso. Cambia de altura.'],['Órbita partida','Dos abanicos con un hueco: no repitas el mismo salto.']],
 charge:[['Embestida de la aurora','La franja muestra todo el recorrido: salta sobre la carga.'],['Galope del alba','Carga larga y rápida: sal de su corredor antes del impacto.'],['Prisma rasante','Esta vez no carga: salta la onda y esquiva las notas.']],
 fire:[['Brasas del nido','El suelo arde donde estabas: cambia de altura y de lugar.'],['Aliento cazador','Un aliento directo busca tu altura al avisar.'],['Hoguera abierta','Abanico amplio y suelo ardiente: gana el flanco.']],
 quake:[['Caída del coloso','Salta cuando aterrice; castiga las placas abiertas.'],['Pisada de cantera','La onda llega antes que el salto: lee el pie y luego el aterrizaje.'],['Cascarón roto','Dos ondas tras la caída: deja espacio para aterrizar.']],
 geysers:[['Tres fogones','Las bocas están fijadas: cruza al hueco libre.'],['Chorro mayor','Una boca amplia: muévete antes de que se abra.'],['Pasillo de vapor','Dos chorros exteriores: el centro queda libre.']],
 discs:[['Doble reparto','Salta el disco bajo y deja pasar el alto.'],['Horno rasante','Una rueda baja rápida: salta cerca de su llegada.'],['Tijera del chef','Ruedas a dos alturas y una masa dirigida: cambia el ritmo.']],
 prism:[['Voz horizontal','El haz recuerda tu altura al avisar. Cambia de altura.'],['Eco de dos voces','Dos alturas fijadas: busca el espacio entre los haces.'],['Archivo sellado','Haz bajo y notas dirigidas: salta fuera de la línea marcada.']]
});
export function guardianTechnique(pattern,turn){const variant=Math.max(0,(turn-1)%3),[name,cue]=MOVES[pattern]?.[variant]||MOVES.prism[0];return {variant,name,cue};}
