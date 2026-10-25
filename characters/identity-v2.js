// Five explicit stat curves. Mobility is budgeted against the authored jumps;
// each strength has a cost. Hitboxes and collection IDs remain unchanged.
export const HERO_IDENTITY=Object.freeze({
 kilo:{title:'Directora del compás',strength:'Control, curación y vuelo',cost:'Golpe ligero; necesita preparar el combate',speed:[3.6,4,4.5,5.1,6.2],hp:[80,98,120,150,195],jump:[11.4,12.2,13,13.8,15.2],melee:.9,cooldown:1.05},
 stitcho:{title:'Acróbata del plasma',strength:'Cuatro saltos, paredes y bola',cost:'Menos alcance y poca resistencia al choque',speed:[4.6,5.2,6,6.8,8],hp:[86,104,126,154,195],jump:[12,12.8,13.6,14.5,16],melee:1.05,cooldown:.92},
 chispin:{title:'Asalto eléctrico',strength:'Cadencia rápida y cadenas',cost:'Muy poca vida; no puede quedarse a intercambiar golpes',speed:[5.5,6.2,7,8,9.2],hp:[56,70,88,110,138],jump:[12.2,12.9,13.6,14.4,15.8],melee:.78,cooldown:.76},
 cat:{title:'Cazadora de sueños',strength:'Salto alto, control y segunda oportunidad',cost:'Frágil y de alcance cercano',speed:[4.8,5.4,6,6.7,7.6],hp:[62,78,96,122,155],jump:[13,13.8,14.5,15.4,17],melee:1.12,cooldown:1},
 cuerno:{title:'Velocista de la aurora',strength:'La mayor velocidad y salto de la familia',cost:'Poca vida y golpes débiles; gana por posición',speed:[6.4,7.3,8.4,9.6,11],hp:[60,76,94,116,145],jump:[14.6,15.4,16.2,17.4,18.6],melee:.65,cooldown:.9},
 dragon:{title:'Artillería del cielo',strength:'Fuego potente, alas y control aéreo',cost:'Lento en tierra y recuperación larga',speed:[3.5,3.9,4.4,4.9,5.7],hp:[104,132,166,212,275],jump:[11.4,12,13,13.4,14.8],melee:1.18,cooldown:1.2},
 dino:{title:'Coloso rompeguardias',strength:'Mucha vida y el mayor golpe H',cost:'El más lento; ataques comprometidos',speed:[2.9,3.2,3.6,4,4.6],hp:[140,180,225,285,360],jump:[11,11.6,12.2,12.6,14],melee:1.48,cooldown:1.24},
 frita:{title:'Especialista del aire',strength:'Correcciones aéreas, derrape y saltos',cost:'Vida baja; necesita conservar el impulso',speed:[5,5.7,6.5,7.4,8.5],hp:[70,88,108,136,172],jump:[11.4,12.1,12.8,13.6,15],melee:.9,cooldown:.85},
 pizza:{title:'Defensa elástica',strength:'Buen aguante, rebotes y control del suelo',cost:'Giro y carrera más lentos',speed:[3.7,4.2,4.8,5.4,6.2],hp:[110,138,174,218,275],jump:[11.8,12.4,13.1,13.6,15.2],melee:1.2,cooldown:1.08},
 yomi:{title:'Estratega de datos',strength:'Analiza, contiene y sintetiza a distancia',cost:'Carrera lenta; requiere leer las ventanas',speed:[3.4,3.8,4.2,4.7,5.3],hp:[74,92,114,143,180],jump:[12,12.6,13.2,13.8,14.8],melee:.75,cooldown:.88}
});
export function applyIdentityCurves(roster){for(const h of roster){const q=HERO_IDENTITY[h.id];if(!q)continue;h.identity=q;h.forms.forEach((f,i)=>{f.speed=q.speed[i];f.hp=q.hp[i];f.jump=q.jump[i];});h.speed=q.speed[0];h.health=q.hp[0];h.jumpPower=q.jump[0];}return roster;}
