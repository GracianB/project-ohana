import {authorExpedition} from './chapter-expedition-v2.js';
import {composeChapterRoom} from './chapter-room-composition.js';
import {KILO_CHAPTER_BOSS_ID,KILO_CHAPTER_ARENA} from './kilo-chapter.js';
import {OHANA_PLACES} from "../worlds/ohana-environments.js";
// OHANA V467 · MUNDO 1 · La Ruta de los Diez.
// Diez salas grandes (una por héroe) encadenadas de oeste a este y una sala
// final todavía mayor con la Quimera Ohana. Datos puros: sin DOM ni Math.random.
// Las salas antiguas (Claro, Costa, Jungla…) pasan a ser el MUNDO 2.

// V470: de momento el juego termina en el Mundo 1. El código del Mundo 2 sigue
// intacto, pero sus salas quedan cerradas ("en construcción") en el modo solo.
export const WORLD2_OPEN = false;
export const WORLD2_LOCK_TEXT = "Mundo 2 — en construcción";
export function world2Locked(id, state = {}) {
  if (WORLD2_OPEN || !state.solo || state.e2e) return false;
  return typeof id === "string" && !Object.hasOwn(WORLD1_ROOMS, id);
}
export const WORLD1_ROOM_W = 14400;
export const WORLD1_FINAL_W = 12000;
export const WORLD1_ROOM_H = 1260;
export const WORLD1_FLOOR = 1134;
export const WORLD1_ARENA = Object.freeze({ left: 7000, right: 11800, start: 6800 });

// Orden de la ruta: cada sala abre la siguiente al despertar su sello.
export const WORLD1_ORDER = Object.freeze(["kilo","stitcho","chispin","cat","cuerno","dragon","dino","frita","pizza","yomi"]);
export const WORLD1_IDS = Object.freeze([...WORLD1_ORDER.map((h) => "w1-" + h), "w1-final"]);
export const WORLD1_HERO_ROOMS = Object.freeze(WORLD1_ORDER.map((h) => "w1-" + h));

// world = índice de WORLDS (cielo base) · seal = interacción única de la sala.
export const WORLD1_THEMES = Object.freeze({
  kilo:    { name: "Claro de Kilo",            short: "Kilo",      world: 6, color: "#ffacc2", tint: "#ff8fb1", relic: "Canción del hogar",     seal: "serenata",   cast: ["cucaracho","phosquito","planta","rana","avispa"],        sectors: ["Puerta aloha","Campo de hibiscos","Escenario del ukelele","Lago de las guirnaldas","Senda de los cocos","Escenario del Tambor"] },
  stitcho: { name: "Astillero de Stitcho",     short: "Stitcho",   world: 4, color: "#67ddff", tint: "#3f8cff", relic: "Corazón galáctico",     seal: "reparar",    cast: ["ufo","phosquito","cucaracho","arana","murcielago"],          sectors: ["Muelle cosido","Chatarrería azul","Grúas de plasma","Taller del caos","Hangar estrellado","Altar del experimento"] },
  chispin: { name: "Santuario del Trueno",     short: "Chispín",   world: 9, color: "#fff29a", tint: "#ffd84a", relic: "Relámpago dorado",      seal: "cadena",     cast: ["gaviota","murcielago","phosquito","rana","avispa"],      sectors: ["Puerta de nubes","Campo de pararrayos","Puente del chispazo","Pico tormenta","Valle del arcoíris","Altar del trueno"] },
  cat:     { name: "Jardín Lunar de Michi",    short: "Michi",     world: 3, color: "#ceb2ff", tint: "#b98cff", relic: "Luna soñadora",         seal: "medusas",    cast: ["medusa","phosquito","ufo","murcielago","arana"],        sectors: ["Umbral del sueño","Estanque de lunas","Bosque de medusas","Observatorio gatuno","Mar de estrellas","Altar del sueño"] },
  cuerno:  { name: "Bosque Prisma de Cuerno",  short: "Cuerno",    world: 8, color: "#eccbff", tint: "#d6a8ff", relic: "Aurora viva",           seal: "prismas",    cast: ["arana","murcielago","planta","phosquito","libelula"],      sectors: ["Claro de cristal","Arboleda aurora","Espejos del alba","Cueva del eco","Sendero arcoíris","Altar del prisma"] },
  dragon:  { name: "Caldera del Dragón",       short: "Dragón",    world: 2, color: "#ff905d", tint: "#ff5a3c", relic: "Brasa del hogar",       seal: "braseros",   cast: ["escoria","brasita","planta","rana","murcielago"],            sectors: ["Camino de ceniza","Río de lava","Forja ancestral","Nido de wyverns","Cráter rojo","Altar del fuego"] },
  dino:    { name: "Valle Fósil de Dino",      short: "Dino",      world: 1, color: "#b8ef6b", tint: "#6fd38b", relic: "Fósil de la familia",   seal: "pisotones",  cast: ["rana","abeja","libelula","arana","cucaracho"],              sectors: ["Helechos gigantes","Cascada de jade","Huesos del T-rex","Nidos de saurópodo","Barro dormido","Altar del fósil"] },
  frita:   { name: "Mercado Dorado de Frita",  short: "Frita",     world: 0, color: "#ffe9a8", tint: "#ffc23a", relic: "Banquete dorado",       seal: "geiseres",   cast: ["cangrejo","gaviota","brasita","rana","cucaracho"],          sectors: ["Paseo de la bahía","Puestos crujientes","Fuentes de aceite","Bazar de especias","Cúpula del banquete","Altar dorado"] },
  pizza:   { name: "Puerto del Horno de Pizza", short: "Pizza",    world: 5, color: "#ffd36a", tint: "#ff9d4a", relic: "Horno estelar",         seal: "reparto",    cast: ["pez","cangrejo","anguila","medusa","gaviota"],            sectors: ["Horno del puerto","Muelle de la masa","Calle del queso","Plaza hambrienta","Faro de la albahaca","Altar del horno"] },
  yomi:    { name: "Observatorio de Yomi",     short: "Yomi",      world: 3, color: "#8fe9ff", tint: "#5fd0ff", relic: "Constelación eterna",   seal: "sincronia",  cast: ["ufo","phosquito","brasita","medusa","murcielago"],           sectors: ["Antena de bienvenida","Bosque de datos","Sala de servidores","Jardín de constelaciones","Red neuronal","Altar de la IA"] }
});

// Explicación jugable de cada sello (se muestra al entrar y en el HUD de sala).
export const WORLD1_SEALS = Object.freeze({
  serenata:  { title: "Serenata de las flores",  verb: "Quédate quieto sobre cada hibisco para rasguear su nota", count: 4 },
  reparar:   { title: "Reparar la nave",         verb: "Lleva cada pieza (tócala) hasta su taller marcado",       count: 3 },
  cadena:    { title: "Red de truenos",          verb: "Conecta las cuatro antenas: acércate o golpéalas; cada conexión se conserva", count: 4 },
  medusas:   { title: "Medusas lunares",         verb: "Salta y toca en el aire cada medusa dormida",             count: 5 },
  prismas:   { title: "Alinear los prismas",     verb: "Activa los prismas en el orden I · II · III",             count: 3 },
  braseros:  { title: "Encender los braseros",   verb: "Golpea cada brasero apagado",                             count: 4 },
  pisotones: { title: "Despertar los fósiles",   verb: "Cae desde un salto sobre cada placa fósil",               count: 4 },
  geiseres:  { title: "Patatas en las nubes",    verb: "Pisa un géiser de aceite y atrapa la patata dorada de arriba", count: 3 },
  reparto:   { title: "Reparto caliente",        verb: "Recoge la pizza del horno y llévala a los clientes antes de que se enfríe", count: 3 },
  sincronia: { title: "Sincronizar la red",      verb: "Toca cada nodo de datos mientras parpadea en verde",      count: 4 }
});

// Authoring contracts: a room's interactions, movement and combat must express
// its protagonist. These plans describe direction, not unfinished unlocks.
export const WORLD1_CHAPTER_PLANS=Object.freeze({
 kilo:{identity:'Combate musical entre suelo y cielo',mobility:'Levitación K; vuelo solar en la última forma',combat:'Rebota notas, refleja disparos y cambia de altura para abrir defensas',interaction:'Recuperar notas y tocar carillones elevados',optional:'Ruta aérea de los tres carillones'},
 stitcho:{identity:'Acrobacia, transporte y máquinas',mobility:'Bola, rebotes y paredes',combat:'Desactivar defensas con plasma y entrar por otro ángulo',interaction:'Transportar piezas y reparar su nave',optional:'Raíles y atajos de mantenimiento'},
 chispin:{identity:'Circuitos y desplazamiento eléctrico',mobility:'Blink y carrera relámpago',combat:'Encadenar blancos y salir antes de la respuesta',interaction:'Conectar una red de antenas',optional:'Desvíos entre conductores'},
 cat:{identity:'Sueños suspendidos y control de enemigos',mobility:'Saltos entre medusas y plataformas lunares',combat:'Ovillos y ronroneo para controlar grupos',interaction:'Despertar medusas en el aire',optional:'Estanques y rutas del observatorio'},
 cuerno:{identity:'Una peregrinación de luz y orden',mobility:'Doble salto y arcoíris',combat:'Elegir posiciones para barrer con el prisma',interaction:'Alinear prismas en orden',optional:'Rutas de color y miradores'},
 dragon:{identity:'Altura, calor y fuego dirigido',mobility:'Vuelo y corrientes térmicas',combat:'Preparar picados y separar grupos con fuego',interaction:'Encender braseros y cruzar la forja',optional:'Terrazas y chimeneas volcánicas'},
 dino:{identity:'Peso, impulso y aterrizajes',mobility:'Saltos pesados y caídas dirigidas',combat:'Romper formaciones al aterrizar',interaction:'Despertar placas fósiles con una caída',optional:'Cornisas del cañón'},
 frita:{identity:'Lanzamiento y corrección en el aire',mobility:'Géiseres y trayectorias balísticas',combat:'Usar el impulso para cambiar de posición',interaction:'Atrapar premios durante el vuelo del géiser',optional:'Toldos y rutas altas del mercado'},
 pizza:{identity:'Reparto bajo presión y elección de ruta',mobility:'Rutas rápidas entre horno y clientes',combat:'Despejar primero el camino de entrega',interaction:'Transportar pizzas antes de perder calor',optional:'Explorar tejados entre repartos'},
 yomi:{identity:'Lectura de fases y control del espacio',mobility:'Cobertura y cambios entre repisas',combat:'Anticipar ventanas y contener disparos',interaction:'Sincronizar terminales durante su fase activa',optional:'Rutas de datos del observatorio'}
});

// Pseudo-aleatorio estable por cadena (las salas no cambian entre partidas).
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

export function buildWorld1HeroRoom(hero) {
  const theme = WORLD1_THEMES[hero];
  if (!theme) throw new Error("Unknown World 1 hero: " + hero);
  const id = "w1-" + hero, idx = WORLD1_ORDER.indexOf(hero), r = rng(hash(id));
  const W = 9600, sw = W / theme.sectors.length;
  const plats = [[0, WORLD1_FLOOR, W, 126]];
  const sectors = theme.sectors.map((name, i) => ({ id: `${id}-${i}`, name, x: i * sw, w: sw, role: ["explore","combat","platform","secret","rest","explore"][i] }));
  const checkpoints = sectors.map((s, i) => ({ id: s.id, x: Math.round(s.x + (i ? 140 : 220)), y: WORLD1_FLOOR, sector: i }));
  // Pocos enemigos y legibles: dos por sector intermedio, con rol de campaña.
  const roles = ["pursuer","jumper","flyer","shield","gunner"];
  const foes = [];
  for (let i = 1; i < sectors.length - 1; i++) {
    for (let k = 0; k < 2; k++) {
      const role = roles[(i * 2 + k + idx) % roles.length];
      const kind = theme.cast[(i + k) % theme.cast.length];
      const x = Math.round(sectors[i].x + 420 + k * 640 + r() * 120);
      const y = role === "flyer" ? 900 : WORLD1_FLOOR - 40;
      foes.push([x, y, kind, i === 4 && k === 1, { role, name: theme.short + " · eco " + (foes.length + 1), anchorY: y }]);
    }
  }
  const orbs = [];
  for (let i = 0; i < sectors.length; i++) orbs.push([Math.round(sectors[i].x + 800), 1040], [Math.round(sectors[i].x + 1250), 980]);
  const stations = sealStations(hero, theme, sectors);
  if(hero==='kilo'){
    // Visible XP paths: low diamonds before the early forms and aerial arcs.
    for(const base of [650,3200])for(let i=0;i<12;i++)orbs.push([base+i*105,WORLD1_FLOOR-45]);
    for(let i=0;i<18;i++)orbs.push([4560+i*100,870-Math.sin(i/17*Math.PI)*230]);
    // Each note has a short encounter suited to the form available on arrival.
    const lessons=[['pursuer','jumper'],['gunner','pursuer'],['shield','pursuer'],['gunner','shield']];
    foes.length=0;
    stations.forEach((st,i)=>lessons[i].forEach((role,k)=>{
      const x=st.x+(k?185:-190),y=WORLD1_FLOOR-40;
      foes.push([x,y,theme.cast[(i+k)%theme.cast.length],false,{role,name:['Ecos de la orilla','Guardianes del viento','Ronda de pétalos','Último estribillo'][i],anchorY:y,kiloPressure:true,chapterHP:[65,100,150,200][i]}]);
    }));
    foes.push([4680,760,'phosquito',false,{role:'flyer',name:'Vigía de la laguna',anchorY:760,flightBand:{top:550,bottom:820}}],[7930,620,'phosquito',false,{role:'flyer',name:'Guardián del viento',anchorY:620,flightBand:{top:400,bottom:780}}]);
    foes.push([6120,500,'avispa',false,{role:'flyer',name:'Vigía de los aros',anchorY:500,flightBand:{top:300,bottom:720}}],[8340,420,'phosquito',false,{role:'flyer',name:'Vigía de la corona',anchorY:420,flightBand:{top:240,bottom:650}}]);
    plats.push([4550,890,220,22],[7740,780,220,22],[8050,650,220,22]);
    foes.push([8750,WORLD1_FLOOR-48,'cangrejo',false,{special:true,name:'Tambor del Claro',arena:KILO_CHAPTER_ARENA,encounterId:KILO_CHAPTER_BOSS_ID}]);
    // Keep the floor interaction visible and reachable without guessing a drop.
    for(let i=plats.length-1;i>0;i--){const [x,y,w]=plats[i];if(y<WORLD1_FLOOR&&stations.some(st=>x<st.x+100&&x+w>st.x-100))plats.splice(i,1);}
    // A low stepping route gives room to practise K and the extra jumps.
    plats.push([3420,1054,180,22],[3650,974,220,22],[5010,1054,180,22],[5240,974,220,22]);
  }
  if(['frita','yomi'].includes(hero)){
    foes.length=0;
    for(let i=0;i<stations.length;i++){
      const x=stations[i].x-300;
      foes.push([x,WORLD1_FLOOR-40,i%2?'rana':'cucaracho',false,{role:i%2?'jumper':'gunner',name:hero==='frita'?'Vigía del mercado':'Cortafuegos astral',chapterHP:75+i*25,anchorFloor:WORLD1_FLOOR}]);
      foes.push([x+550,WORLD1_FLOOR-40,'cangrejo',false,{role:hero==='yomi'?'shield':'pursuer',name:hero==='yomi'?'Escudo de datos':'Guardián del puesto',chapterHP:85+i*25,anchorFloor:WORLD1_FLOOR}]);
    }
    if(hero==='yomi')plats.push([3020,1034,220,22],[3300,934,220,22],[4600,1034,240,22],[4940,934,220,22]);
  }
  if(hero==='pizza'){
    foes.length=0;
    for(let i=0;i<3;i++){const x=3000+i*1600;foes.push([x,WORLD1_FLOOR-40,'cucaracho',false,{role:'pursuer',name:'Pillastre de la masa',chapterHP:75+i*30,anchorFloor:WORLD1_FLOOR}],[x+380,WORLD1_FLOOR-40,'cangrejo',false,{role:'gunner',name:'Cocinero del muelle',chapterHP:85+i*30,anchorFloor:WORLD1_FLOOR}]);
      plats.push([x-140,1034,220,22],[x+200,954,220,22],[x+500,1034,240,22]);orbs.push([x-60,990],[x+280,910],[x+570,990]);}
  }
  if(hero==='dino'){
    foes.length=0;
    for(const [i,st] of stations.entries()){
      for(let k=0;k<2;k++)foes.push([st.x-240+k*430,WORLD1_FLOOR-40,k?'cucaracho':'cangrejo',false,{role:k?'gunner':'shield',name:k?'Vigía de ámbar':'Coraza fósil',chapterHP:80+i*25,anchorFloor:WORLD1_FLOOR}]);
      for(let j=plats.length-1;j>0;j--){const [x,y,w]=plats[j];if(y<WORLD1_FLOOR&&x<st.x+140&&x+w>st.x-280)plats.splice(j,1);}
      const height=Math.max(80,st.dropHeight+45);
      plats.push([st.x-330,WORLD1_FLOOR-80,150,20]);
      if(height>110)plats.push([st.x-215,WORLD1_FLOOR-height,145,20]);
      orbs.push([st.x-270,WORLD1_FLOOR-120],[st.x-130,WORLD1_FLOOR-height-40]);
    }
  }
  if(['cat','cuerno','dragon'].includes(hero)){
    foes.length=0;
    stations.forEach((st,i)=>{
      const roles=hero==='cat'?['pursuer','flyer']:hero==='cuerno'?['shield','gunner']:['jumper','gunner'];
      roles.forEach((role,k)=>foes.push([st.x-200+k*380,role==='flyer'?WORLD1_FLOOR-210:WORLD1_FLOOR-40,theme.cast[(i+k)%theme.cast.length],false,{role,name:theme.short+' · guardia '+(i+1),chapterHP:65+Math.min(i,3)*30,anchorY:WORLD1_FLOOR-210}]));
    });
    for(let i=plats.length-1;i>0;i--){const [x,y,w]=plats[i];if(y<WORLD1_FLOOR&&stations.some(st=>x<st.x+100&&x+w>st.x-100))plats.splice(i,1);}
    if(hero==='cat')for(const st of stations){const rise=WORLD1_FLOOR-st.y;for(let h=80;h<rise;h+=80)plats.push([st.x-260+(h/80%2)*80,WORLD1_FLOOR-h,160,18]);}
    if(hero==='cuerno')plats.push([3040,1054,210,22],[3360,974,220,22],[3660,894,210,22],[3980,974,200,22]);
    if(hero==='dragon')for(const x of [3050,4750,6450]){plats.push([x+170,834,200,22],[x+410,714,220,22]);orbs.push([x,990],[x,850],[x+200,795],[x+440,675]);}
  }
  if(hero==='chispin'){
    foes.length=0;
    stations.forEach((st,i)=>{
      const roles=i===0?['pursuer','jumper']:i===3?['shield','gunner','pursuer']:['gunner','jumper','pursuer'];
      roles.forEach((role,k)=>foes.push([st.x-260+k*210,WORLD1_FLOOR-40,theme.cast[(i+k)%theme.cast.length],false,{role,name:'Circuito '+(i+1)+' · '+['Vanguardia','Bobina','Conductor'][k],chapterHP:65+i*35,anchorY:WORLD1_FLOOR-40}]));
    });
    for(let i=plats.length-1;i>0;i--){const [x,y,w]=plats[i];if(y<WORLD1_FLOOR&&stations.some(st=>x<st.x+100&&x+w>st.x-100))plats.splice(i,1);}
    plats.push([4820,1040,180,22],[5080,940,200,22],[5380,840,220,22],[5680,740,220,22],[6030,840,220,22]);
    for(let i=0;i<12;i++)orbs.push([4900+i*100,880-Math.sin(i/11*Math.PI)*210]);
  }
  if(hero==='stitcho'){
    // Clear the floor workshops and the first continuous roll lesson. Elevated
    // machinery stays between them, leaving transport possible in baby form.
    for(let i=plats.length-1;i>0;i--){const [x,y,w]=plats[i];if(y<WORLD1_FLOOR&&((x<3390&&x+w>2880)||stations.some(st=>[st.x,st.target.x].some(px=>x<px+95&&x+w>px-95))))plats.splice(i,1);}
    plats.push([4670,1040,190,22],[4930,950,200,22],[5210,860,220,22],[5550,950,220,22]);
  }
  // Frita's oil vents must have an uninterrupted launch corridor to their prizes.
  // Decorative one-way platforms previously stopped a launched hero at y~940
  // before reaching the floating potato at floor - 470.
  if (hero === "frita") {
    const clearRadius = 94;
    for (let i = plats.length - 1; i >= 1; i--) {
      const [px, py, pw] = plats[i];
      const overlapsVent = stations.some(st => st.kind === "geyser" &&
        px < Math.max(st.x,st.prize.x) + clearRadius && px + pw > Math.min(st.x,st.prize.x) - clearRadius);
      if (overlapsVent && py > WORLD1_FLOOR - 590 && py < WORLD1_FLOOR) {
        plats.splice(i, 1);
      }
    }
  }
  const prev = idx > 0 ? "w1-" + WORLD1_ORDER[idx - 1] : null;
  const next = idx < WORLD1_ORDER.length - 1 ? "w1-" + WORLD1_ORDER[idx + 1] : "w1-final";
  const composed = authorExpedition(hero,composeChapterRoom(hero,{
    id, name: theme.name, short: theme.short, world: theme.world, color: theme.color,
    chapterPlan: WORLD1_CHAPTER_PLANS[hero], strategy: OHANA_PLACES[hero]?.strategy, explorationStyle: OHANA_PLACES[hero],
    world1: true, worldNumber: 1, hero, signatureCharacter: hero, kiloChapter: hero==='kilo', stitchoChapter: hero==='stitcho', chispinChapter: hero==='chispin', dinoChapter:hero==='dino',pizzaChapter:hero==='pizza',fritaChapter:hero==='frita',yomiChapter:hero==='yomi', growthChapter:['cat','cuerno','dragon','dino','pizza','frita','yomi'].includes(hero)?hero:null,
    width: W, height: WORLD1_ROOM_H,
    doors: { left: prev, right: next, up: null, down: null },
    hint: hero==='kilo'?'Recupera las cuatro notas para crecer y vence al Tambor del Claro. Esquiva mientras está protegido; ataca en su recuperación.':hero==='stitcho'?'Repara la primera pieza para abrir K. Cruza el raíl rodando, termina los talleres y vence al Núcleo Glitch para abrir la salida.':hero==='chispin'?'Conecta las cuatro antenas para evolucionar. J corta los arcos, K permite cruzarlos; también puedes esperar al paso abierto. Después vence al Titán de Trueno.':hero==='frita'?'Pisa los tres géiseres cuando estén listos. Dirige cada vuelo hacia su patata; J permite una corrección. Después vence al Rey Crujiente.':hero==='yomi'?'Conecta cuatro terminales durante AHORA. J prolonga una ventana abierta; K contiene los disparos. Después vence al Custodio del Observatorio.':hero==='pizza'?'Recoge una pizza en el horno y llévala caliente al cliente. Cada entrega abre un horno de barrio para la siguiente. Después vence al Chef Magmático.':hero==='dino'?'Despierta cuatro placas aterrizando desde la altura indicada. Usa cornisas y K en el aire para acelerar la caída. Después vence al Coloso de Piedra.':hero==='cat'?'Salta hacia las cinco medusas para despertarlas: se convierten en apoyos. Controla los grupos y vence al Oráculo Medusaluna.':hero==='cuerno'?'J en el espejo del alba. Después sigue los prismas I → II → III y vence a la Bestia Prisma.':hero==='dragon'?'Enciende cuatro braseros con J. Salta dentro de las térmicas para ganar altura y vence al Guardián Ígneo.':WORLD1_SEALS[theme.seal].title + ": " + WORLD1_SEALS[theme.seal].verb + ". El sello abre la salida del este.",
    plats, foes, orbs, sectors, checkpoints, hazards: [], upExit: null,
    seal: { kind: theme.seal, stations, altar: { x: W - 520, y: WORLD1_FLOOR } },
    portals: hero === "kilo" ? [{ type: "blackhole", x: 560, y: WORLD1_FLOOR - 96, w: 96, h: 96, dest: "hub", label: "Mundo 2 · en construcción", locked: true }] : []
  }));
  // V604: authored encounter passes run after the original patrol layout and
  // may replace its species. Complete the five-species ecology at the very end.
  const present = new Set(composed.foes.map(f => f[2]));
  for (const [speciesIndex, kind] of theme.cast.entries()) {
    if (present.has(kind)) continue;
    const sector = composed.sectors[1 + speciesIndex % 4];
    const flying = ['phosquito','avispa','murcielago','libelula','gaviota','abeja','medusa','ufo'].includes(kind);
    const x = Math.round(sector.x + (speciesIndex % 2 ? 1120 : 300));
    const terrace = composed.terraces?.find(t => x >= t.x && x < t.x+t.w);
    const floor = terrace?.y ?? WORLD1_FLOOR;
    const y = flying ? floor - 210 : floor - 40;
    composed.foes.push([x,y,kind,false,{
      role: flying ? 'flyer' : (speciesIndex % 2 ? 'jumper' : 'pursuer'),
      name: theme.short + ' · ' + kind, chapterHP: 62 + speciesIndex * 9,
      anchorFloor: flying ? undefined : floor, anchorY: y
    }]);
    present.add(kind);
  }
  return composed;
}

// Las estaciones de cada sello se reparten por los sectores 1–4 para que la
// sala entera se recorra; las aéreas quedan a un salto del suelo.
function sealStations(hero, theme, sectors) {
  const at = (sector, f) => Math.round(sectors[sector].x + sectors[sector].w * f);
  const floor = WORLD1_FLOOR;
  switch (theme.seal) {
    case "serenata": return [1, 2, 3, 4].map((s, i) => ({ id: i, x: at(s, .5), y: floor, kind: "flower", note: i }));
    case "reparar": return [1, 2, 4].map((s, i) => ({ id: i, x: at(s, .3), y: floor, kind: "part", target: { x: at(s, .3) + 520, y: floor } }));
    case "cadena": return [2160,3760,5360,7280].map((x,i)=>({id:i,x,y:floor,kind:"rod"}));
    case "medusas": return [1940,3300,4750,6220,7540].map((x,i)=>({id:i,x,y:floor-[110,160,220,280,340][i],kind:"jelly"}));
    // Readable I → II → III pilgrimage, west to east, without forced backtracking.
    case "prismas": return [{ s: 1, order: 0 }, { s: 3, order: 1 }, { s: 4, order: 2 }].map((d, i) => ({ id: i, x: at(d.s, .5), y: floor, kind: "prism", order: d.order }));
    case "braseros": return [1, 2, 3, 4].map((s, i) => ({ id: i, x: at(s, .6), y: floor, kind: "brazier" }));
    case "pisotones": return [2480,5680,7280,4080].map((x,i)=>({id:i,x,y:floor,kind:"fossil",dropHeight:[40,120,180,80][i]})).sort((a,b)=>a.x-b.x).map((s,i)=>({...s,order:i}));
    case "geiseres": return [1, 2, 4].map((s, i) => ({ id: i, x: at(s, .5), y: floor, kind: "geyser", force:[20,22,24][i], prize: { x: at(s, .5)+[100,-110,140][i], y: floor - [360,430,500][i] } }));
    case "reparto": return [{ id: 0, x: at(1, .2), y: floor, kind: "oven" }, ...[1, 2, 3].map((s, i) => ({ id: i + 1, x: at(s + 1, .55), y: floor, kind: "guest" }))];
    case "sincronia": return [1, 2, 3, 4].map((s, i) => ({ id: i, x: at(s, .5), y: floor, kind: "node", phase: i * 23 }));
    default: return [];
  }
}

// Sala final: una procesión con los diez héroes en estatua y una arena enorme.
export function buildWorld1FinalRoom() {
  const W = WORLD1_FINAL_W, A = WORLD1_ARENA;
  const plats = [[0, WORLD1_FLOOR, W, 126],
    // Arena casi limpia: dos repisas laterales y un balcón central para esquivar.
    [A.left + 500, 974, 300, 22], [A.right - 800, 974, 300, 22], [(A.left + A.right) / 2 - 200, 854, 400, 22]];
  const names = ["Puerta de los diez", "Procesión de estatuas", "Puente de los ecos", "Umbral de la Quimera", "Corazón de Ohana", "Trono roto"];
  const sw = W / names.length;
  const sectors = names.map((name, i) => ({ id: `w1-final-${i}`, name, x: i * sw, w: sw, role: i >= 4 ? "combat" : "explore" }));
  const checkpoints = [0, 1, 2, 3].map((i) => ({ id: sectors[i].id, x: Math.round(sectors[i].x + 200), y: WORLD1_FLOOR, sector: i }));
  const statues = WORLD1_ORDER.map((hero, i) => ({ hero, x: 900 + i * 560, y: WORLD1_FLOOR }));
  return {
    id: "w1-final", name: "Corazón de Ohana", short: "Corazón", world: 7, color: "#ffd6f2",
    world1: true, worldNumber: 1, hero: null, signatureCharacter: "kilo",
    width: W, height: WORLD1_ROOM_H,
    doors: { left: "w1-yomi", right: "hub", up: null, down: null },
    hint: "Recorre la procesión de los diez. Al final te espera la Quimera Ohana, hecha con los ecos de toda la familia.",
    plats, foes: [], orbs: statues.map((s) => [s.x, 980]), sectors, checkpoints, hazards: [], upExit: null,
    boss: true, fusionBoss: true, arena: { ...A }, statues,
    portals: []
  };
}

export const WORLD1_ROOMS = Object.freeze(Object.fromEntries([
  ...WORLD1_ORDER.map((h) => ["w1-" + h, buildWorld1HeroRoom(h)]),
  ["w1-final", buildWorld1FinalRoom()]
]));

export function isWorld1Room(id) { return typeof id === "string" && Object.hasOwn(WORLD1_ROOMS, id); }
export function heroForWorld1Room(id) { return WORLD1_ROOMS[id]?.hero || null; }
export function world1RoomForHero(hero) { return WORLD1_ORDER.includes(hero) ? "w1-" + hero : null; }

// Grafo explícito: una ruta principal y dos puentes con el Mundo 2.
export function world1Graph() {
  const edges = [];
  for (let i = 0; i < WORLD1_IDS.length - 1; i++) edges.push({ a: WORLD1_IDS[i], b: WORLD1_IDS[i + 1], type: "door", gate: "seal" });
  edges.push({ a: "w1-kilo", b: "hub", type: "vortex", gate: null });
  edges.push({ a: "hub", b: "w1-kilo", type: "vortex", gate: null });
  edges.push({ a: "w1-final", b: "hub", type: "door", gate: "boss" });
  return { nodes: [...WORLD1_IDS], edges };
}

// ¿Puede cruzar la puerta? Las salas de héroe exigen su propio sello; la sala
// final exige los diez y su salida al Mundo 2 exige vencer a la Quimera.
export function world1DoorOpen(fromId, dir, state = {}) {
  const room = WORLD1_ROOMS[fromId]; if (!room) return true;
  const seals = new Set(state.seals || []);
  if (dir === "left") return !(room.fusionBoss && state.bossActive);
  if (dir !== "right") return true;
  if (room.fusionBoss) return !!state.won;
  if(room.hero===WORLD1_ORDER.at(-1))return world1SealsComplete([...seals]);
  return seals.has(room.hero);
}
export function world1SealsComplete(seals = []) { const s = new Set(seals); return WORLD1_ORDER.every((h) => s.has(h)); }
export function cleanWorld1Seals(raw) { return Array.isArray(raw) ? [...new Set(raw.filter((h) => WORLD1_ORDER.includes(h)))] : []; }

// Only real, authored station IDs survive a save; no timers or carried items.
export function cleanWorld1Stations(raw) {
  const out = {};
  for (const id of WORLD1_HERO_ROOMS) {
    const values = raw?.[id];
    if (!Array.isArray(values)) continue;
    const room = WORLD1_ROOMS[id];
    const authored = room.seal.stations.filter(s => s.kind !== "oven");
    const accepted = new Set(values.filter(v => Number.isInteger(v)));
    const done = [];
    for (const station of authored) {
      if (accepted.has(station.id)) done.push(station.id);
      else if (room.seal.kind === "prismas") break;
    }
    if (done.length) out[id] = done;
  }
  return out;
}
